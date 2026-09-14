/**
 * Every JSX opening tag in a file, with its raw attribute text.
 *
 * Written as a scanner rather than a regex on purpose: JSX attributes routinely contain `>` inside
 * expressions (`style={x.length > 0 ? a : b}`), and a `[^>]*` pattern stops at the wrong place and
 * silently mis-attributes props to the wrong element.
 */
export function scanTags(src) {
  const tags = []
  for (let i = 0; i < src.length; i += 1) {
    if (src[i] !== '<') continue
    const nameMatch = /^<([A-Za-z][\w.]*)/.exec(src.slice(i, i + 64))
    if (!nameMatch) continue
    let j = i + nameMatch[0].length
    let depth = 0
    let quote = null
    while (j < src.length) {
      const ch = src[j]
      if (quote) {
        if (ch === quote) quote = null
      } else if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch
      } else if (ch === '{') {
        depth += 1
      } else if (ch === '}') {
        depth -= 1
      } else if (ch === '>' && depth === 0) {
        break
      }
      j += 1
    }
    if (j >= src.length) continue
    tags.push({
      name: nameMatch[1],
      attrs: src.slice(i + nameMatch[0].length, j),
      index: i,
      end: j,
      line: src.slice(0, i).split('\n').length,
    })
    i = j
  }
  return tags
}

/**
 * The markup between an opening tag and its matching close, nesting-aware. Bounded lookahead was
 * the obvious shortcut and the wrong one: it runs past the element and attributes a sibling's
 * props to this one.
 */
export function elementInner(src, tag, {exact = false} = {}) {
  if (src[tag.end - 1] === '/') return ''
  const open = new RegExp(`<${tag.name}[\\s/>]`, 'g')
  const close = new RegExp(`</${tag.name}\\s*>`, 'g')
  let depth = 1
  let cursor = tag.end + 1
  while (cursor < src.length && depth > 0) {
    open.lastIndex = cursor
    close.lastIndex = cursor
    const nextOpen = open.exec(src)
    const nextClose = close.exec(src)
    if (!nextClose) break
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1
      cursor = nextOpen.index + 1
    } else {
      depth -= 1
      if (depth === 0) return src.slice(tag.end + 1, nextClose.index)
      cursor = nextClose.index + 1
    }
  }
  // The extent could not be determined. Callers that must not guess ask for `exact` and get null;
  // a windowed guess reads into the next iteration of a `.map()` and invents nesting that is not
  // there. The looser callers keep the window, which is good enough for "what is the first mode".
  return exact ? null : src.slice(tag.end + 1, Math.min(src.length, tag.end + 600))
}

/** Raw source of a computed attribute value (`name={...}`), braces balanced, or null. */
export function attrExpr(attrs, name) {
  const m = new RegExp(`${name}=\\{`).exec(attrs)
  if (!m) return null
  let depth = 1
  let j = m.index + m[0].length
  const start = j
  while (j < attrs.length && depth > 0) {
    if (attrs[j] === '{') depth += 1
    else if (attrs[j] === '}') depth -= 1
    j += 1
  }
  return attrs.slice(start, j - 1)
}

/** Literal value of an attribute, or `{expr}` marker when it is computed. */
export function attrValue(attrs, name) {
  const literal = new RegExp(`${name}="([^"]*)"`).exec(attrs)
  if (literal) return literal[1]
  if (new RegExp(`${name}=\\{`).test(attrs)) return '{expr}'
  if (new RegExp(`(^|\\s)${name}(\\s|$|=)`).test(attrs)) return ''
  return null
}

export const isKebab = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)

/** Chrome renders the same content in more than one place on purpose (desktop nav + mobile drawer). */
export const isChromeFile = (p) =>
  /components\/layout\//.test(p) || /(Navbar|Nav|MobileMenu|MobileNav|Footer|Menu)\.tsx$/.test(p)

/** A var counts as defined when its literal name appears — or, for the --color-* pair, when a
 *  template emits the family dynamically (`--color-${role}` over the four roles, drserene). */
export function definesVar(sources, v) {
  if (sources.some((s) => s.includes(v))) return true
  return v.startsWith('--color-') && sources.some((s) => s.includes('--color-${'))
}

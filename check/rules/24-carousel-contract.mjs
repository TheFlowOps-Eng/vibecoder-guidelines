import {attrValue, isKebab} from '../lib/scan.mjs'

export const rule = 24
export const title = 'Editable carousels follow the useOhwCarousel contract (bridge docs/editable-carousels.md)'

/**
 * The carousel contract (ohhwells-bridge/docs/editable-carousels.md): a component calls
 * `useOhwCarousel(key, initial)`, spreads `{...bind}` on the slide container, marks each slide
 * with `data-ohw-carousel-slide={i}`, and renders from the hook's array. Each clause fails in
 * its own silent way — no bind spread means the Edit-gallery overlay never appears; a missing
 * 'use client' is a build/runtime error; next/image without `unoptimized` throws on uploaded
 * hosts the moment an owner replaces a slide; capping the list breaks add/delete.
 */
export function check(ctx, report) {
  const keys = new Map()

  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    const usesHook = /useOhwCarousel\s*\(/.test(src)
    const hasManualContainer = ctx.tagsFor(file).some((t) => attrValue(t.attrs, 'data-ohw-carousel') !== null)
    if (!usesHook && !hasManualContainer) continue

    if (usesHook) {
      if (!/^\s*['"]use client['"]/.test(src)) {
        report('error', "`useOhwCarousel` in a file without `'use client'` — it is a React hook", file, null)
      }

      // The destructured names may be renamed (`{ images: slides, bind: heroBind }`).
      const destructure = /\{([^}]*)\}\s*=\s*useOhwCarousel\s*\(/.exec(src)?.[1] ?? ''
      const bindName = /\bbind\s*:\s*(\w+)/.exec(destructure)?.[1] ?? 'bind'
      const imagesName = /\bimages\s*:\s*(\w+)/.exec(destructure)?.[1] ?? 'images'

      if (!new RegExp(`\\{\\s*\\.\\.\\.${bindName}\\s*\\}`).test(src)) {
        report('error', `\`{...${bindName}}\` is never spread on a container — the Edit-gallery overlay can never appear`, file, null)
      }
      if (!/data-ohw-carousel-slide/.test(src)) {
        report('warn', 'no `data-ohw-carousel-slide` marker in this file — slides the modal cannot target (fine only if a child component renders them)', file, null)
      }
      if (new RegExp(`\\b${imagesName}\\s*\\.slice\\s*\\(`).test(src)) {
        report('warn', `\`${imagesName}.slice(...)\` caps the slide list — added slides will not render; lay out for any count instead`, file, null)
      }
      if (/from\s*['"]next\/image['"]/.test(src) && !/\bunoptimized\b/.test(src)) {
        report('warn', 'carousel file uses next/image without `unoptimized` — uploaded slides come from hosts outside next.config and will throw', file, null)
      }

      // The key is the storage key — same uniqueness stakes as data-ohw-key (rule 2).
      for (const m of src.matchAll(/useOhwCarousel\s*\(\s*['"]([^'"]+)['"]/g)) {
        const key = m[1]
        const line = src.slice(0, m.index).split('\n').length
        const seen = keys.get(key)
        if (seen) {
          report('error', `carousel key \`${key}\` is used twice — both carousels share one stored slide list (also ${seen.file}:${seen.line})`, file, line)
        } else {
          keys.set(key, {file: ctx.rel(file), line})
        }
        if (!isKebab(key)) report('warn', `carousel key "${key}" is not kebab-case`, file, line)
      }
    }

    // Manual form (no hook): the container must be stamped with the full trio.
    if (hasManualContainer && !usesHook) {
      for (const tag of ctx.tagsFor(file)) {
        if (attrValue(tag.attrs, 'data-ohw-carousel') === null) continue
        if (attrValue(tag.attrs, 'data-ohw-key') === null) {
          report('error', 'manual `data-ohw-carousel` container without `data-ohw-key` — the slide list has no storage key', file, tag.line)
        }
        if (attrValue(tag.attrs, 'data-ohw-carousel-value') === null) {
          report('warn', 'manual `data-ohw-carousel` container without `data-ohw-carousel-value` — the editor cannot read the current slides', file, tag.line)
        }
      }
    }
  }
}

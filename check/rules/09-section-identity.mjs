import {CHROME_IDS} from '../lib/constants.mjs'
import {attrValue, isKebab, scanTags} from '../lib/scan.mjs'

export const rule = 9
export const title = 'Section ids are labelled, kebab-case, stable and unique per page'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      const section = attrValue(tag.attrs, 'data-ohw-section')
      if (section === null) continue
      if (attrValue(tag.attrs, 'data-ohw-section-label') === null) {
        report('warn', `section "${section}" has no \`data-ohw-section-label\``, file, tag.line)
      }
      if (section !== '{expr}' && section && !isKebab(section)) {
        report('warn', `section id "${section}" is not kebab-case`, file, tag.line)
      }
    }
  }

  // "ids stable and unique PER PAGE". A section component that hardcodes its id reports
  // the same id from every page that renders it, so the editor treats two different sections as
  // one: styling either restyles both (OHH-772). Safe only when the component reads a `sectionId`
  // prop AND every page rendering it passes one — checking the component alone reads as clean
  // while `sectionId ?? 'cta'` still emits "cta" everywhere.

  // Two pages naming the same id is the collision itself, whatever the component does — rebound
  // passed sectionId="page-header" on six pages and read as compliant because the prop was there.
  const idPages = new Map()
  for (const file of ctx.pageFiles) {
    const src = ctx.read(file)
    const route = '/' + ctx.rel(file).replace(/^src\/app\/?/, '').replace(/\/?page\.tsx$/, '')
    for (const m of src.matchAll(/\bsectionId\s*=\s*"([^"]+)"/g)) {
      const seen = idPages.get(m[1]) ?? new Set()
      seen.add(route === '/' ? '/' : route)
      idPages.set(m[1], seen)
    }
  }
  for (const [id, routes] of idPages) {
    if (routes.size > 1) {
      report('error', `"${id}" is passed as the sectionId on ${routes.size} pages (${[...routes].join(', ')}) — same id, so one section to the editor`, null, null)
    }
  }

  const literalByFolder = new Map()
  for (const file of ctx.tsxFiles) {
    // Any component directory, not just sections/: rebound's page header lives in layout/, which
    // an earlier version of this check never opened. Chrome is excluded below by id, not by path.
    const folder = /\/(?:sections|layout|site|ui)\/(.+)$/.exec(file)?.[1]?.split('/')[0]
    if (!folder) continue
    const src = ctx.read(file)
    const hardcoded = [...src.matchAll(/data-ohw-section="([^"]*)"/g)].map((m) => m[1])
    const fallback = [...src.matchAll(/data-ohw-section=\{\s*sectionId\s*\?\?\s*['"]([^'"]+)['"]\s*\}/g)].map((m) => m[1])
    if (!hardcoded.length && !fallback.length) continue
    const entry = literalByFolder.get(folder) ?? {ids: new Set(), hardcoded: false}
    for (const id of [...hardcoded, ...fallback]) entry.ids.add(id)
    // A hardcoded literal ignores whatever the page passes, so no page-side prop can rescue it.
    if (hardcoded.length) entry.hardcoded = true
    literalByFolder.set(folder, entry)
  }
  for (const [folder, entry] of literalByFolder) {
    const folderIds = [...entry.ids]
    // navbar and footer are meant to be one section site-wide — the bridge protects them by that
    // exact name. A shared id is the point there, not the defect.
    if (folderIds.every((id) => CHROME_IDS.has(id))) continue
    const unguarded = []
    const allPages = []
    for (const file of ctx.pageFiles) {
      const src = ctx.read(file)
      const tags = new Set()
      const importRe = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*['"][^'"]*/${folder}(?:/[^'"]*)?['"]`, 'g')
      for (const m of src.matchAll(importRe)) {
        for (const raw of m[1].split(',')) {
          const n = raw.trim().split(/\s+as\s+/).pop()?.trim()
          if (!n) continue
          tags.add(n)
          for (const a of src.matchAll(new RegExp(`const\\s+(\\w+)\\s*=\\s*${n}\\s*[[.][^\\n]*\\.component`, 'g'))) tags.add(a[1])
        }
      }
      if (tags.size === 0) continue
      const usages = scanTags(src).filter((t) => tags.has(t.name))
      if (usages.length === 0) continue
      const route = '/' + ctx.rel(file).replace(/^src\/app\/?/, '').replace(/\/?page\.tsx$/, '')
      allPages.push(route)
      if (usages.some((t) => !/\bsectionId\s*=/.test(t.attrs))) unguarded.push(route)
    }
    // Hardcoded: every page that renders it reports the same id, whatever the page passes.
    // Deferred (`sectionId ?? 'x'`): only the pages that pass nothing fall back onto the literal.
    const colliding = entry.hardcoded ? allPages : unguarded
    if (colliding.length > 1) {
      const why = entry.hardcoded ? 'the component hardcodes it' : 'these pages pass no sectionId'
      report('error', `"${folderIds.join('", "')}" is the same id on ${colliding.length} pages (${colliding.map((p) => p || '/').join(', ')}) — ${why}; style/reorder/delete collide`, null, null)
    }
  }
}

import {attrValue, elementInner} from '../lib/scan.mjs'

export const rule = 11
export const title = 'Editables sit inside a data-ohw-section (section-scoped prompts cannot reach them otherwise)'

/**
 * Section-scoped AI collection resolves `[data-ohw-section="<id>"]` and collects only that
 * element's descendants (OhhwellsBridge.tsx ow:collect-section); an editable with no section
 * ancestor is silently absent from every section-scoped prompt and reachable only whole-page.
 *
 * A static checker can only see ancestry inside one file, and most editables live in components
 * whose section wrapper is the component root or the importing page — so the check is scoped to
 * the top of the render tree (`page.tsx` / `layout.tsx` under src/app), where "no section
 * ancestor in this file" really means "no section ancestor at all". Component files are skipped:
 * their context is the importer's business.
 */
export function check(ctx, report) {
  const topFiles = [...ctx.pageFiles, ctx.layoutPath].filter((f) => ctx.exists(f))

  for (const file of topFiles) {
    const src = ctx.read(file)
    const tags = ctx.tagsFor(file)

    // The ranges covered by a section root: a literal `data-ohw-section`, a chrome landmark the
    // bridge treats as a section, or a component taking the OHH-772 `sectionId` prop (the
    // `<Section sectionId="...">` wrapper pattern — blue-template pages are built from it).
    const covered = []
    for (const tag of tags) {
      const isSection = attrValue(tag.attrs, 'data-ohw-section') !== null || /\bsectionId\s*=/.test(tag.attrs)
      const isLandmark = ['header', 'nav', 'footer', 'aside'].includes(tag.name)
      if (!isSection && !isLandmark) continue
      const inner = elementInner(src, tag, {exact: true})
      if (inner !== null) covered.push([tag.end, tag.end + 1 + inner.length])
    }

    for (const tag of tags) {
      const editable = attrValue(tag.attrs, 'data-ohw-editable')
      const hrefKey = attrValue(tag.attrs, 'data-ohw-href-key')
      if (editable === null && hrefKey === null) continue
      if (attrValue(tag.attrs, 'data-ohw-section') !== null) continue
      const inside = covered.some(([from, to]) => tag.index > from && tag.index < to)
      if (!inside) {
        report('warn', `editable outside any \`data-ohw-section\` — section-scoped prompts cannot see it`, file, tag.line)
      }
    }
  }
}

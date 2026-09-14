import {attrValue} from '../lib/scan.mjs'

export const rule = 5
export const title = 'Every image carries a key — unkeyed images are invisible to the AI'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    for (const tag of ctx.tagsFor(file)) {
      if ((tag.name === 'img' || tag.name === 'Image') && attrValue(tag.attrs, 'data-ohw-key') === null) {
        // `icon` wrappers count too: the icon editable owns its glyph content (an <img> for a
        // custom upload, an inline <svg> otherwise) — meridian's icon badges are the case.
        const inKeyedWrapper = /data-ohw-editable="(image|bg-image|icon)"/.test(src.slice(Math.max(0, tag.index - 300), tag.index))
        if (!inKeyedWrapper) report('warn', 'image with no `data-ohw-key`', file, tag.line)
      }
    }
  }
}

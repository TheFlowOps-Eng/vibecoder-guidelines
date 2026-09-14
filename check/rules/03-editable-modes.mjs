import {EDITABLE_MODES} from '../lib/constants.mjs'
import {attrValue} from '../lib/scan.mjs'

export const rule = 3
export const title = 'Only the documented editable modes; maps carry data-ohw-map-query'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      const editable = attrValue(tag.attrs, 'data-ohw-editable')
      if (editable === null) continue
      if (editable !== '{expr}' && !EDITABLE_MODES.has(editable)) {
        report('error', `unknown editable mode "${editable}" (coerced to text)`, file, tag.line)
      }
      // A map's address lives in data-ohw-map-query.
      if (editable === 'map' && attrValue(tag.attrs, 'data-ohw-map-query') === null) {
        report('error', '`editable="map"` without `data-ohw-map-query`', file, tag.line)
      }
    }
  }
}

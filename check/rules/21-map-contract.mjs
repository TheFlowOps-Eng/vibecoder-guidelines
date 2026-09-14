import {attrValue} from '../lib/scan.mjs'

export const rule = 21
export const title = 'Map-named editables use the real map contract, never placeholder copy'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      // A "map"-named editable that is not the map contract is a placeholder in
      // disguise: a text div tagged this way renders bracket copy where a map should be, and
      // "change the map address" has nothing to edit.
      const key = attrValue(tag.attrs, 'data-ohw-key')
      const editable = attrValue(tag.attrs, 'data-ohw-editable')
      if (
        key &&
        key !== '{expr}' &&
        /(^|-)map(-|$)/i.test(key) &&
        editable !== null &&
        editable !== 'map' &&
        editable !== '{expr}'
      ) {
        report('error', `key \`${key}\` names a map but mode is "${editable}" — use \`editable="map"\` + \`data-ohw-map-query\``, file, tag.line)
      }
    }
  }

  // Map placeholder copy. A bracket string standing in for a map ("[Embed Google Map
  // of the studio]") ships fake UI: nothing renders a map, and the AI map verb has nothing to
  // edit. Content files (.ts) carry these strings, so the scan is wider than the JSX walk.
  for (const file of ctx.allSourceFiles) {
    const src = ctx.read(file)
    const stringLit = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g
    let m
    while ((m = stringLit.exec(src))) {
      if (/\[[^\[\]\n]*\bmaps?\b[^\[\]\n]*\]/i.test(m[2])) {
        const line = src.slice(0, m.index).split('\n').length
        report('error', `map placeholder text ${JSON.stringify(m[2].slice(0, 60))} — ship a real \`editable="map"\` embed`, file, line)
      }
    }
  }
}

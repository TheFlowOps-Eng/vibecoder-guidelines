import {attrValue} from '../lib/scan.mjs'

export const rule = 1
export const title = 'Every editable element carries data-ohw-key on the same element'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      const editable = attrValue(tag.attrs, 'data-ohw-editable')
      if (editable === null) continue
      // Both attributes, same element. A key applied through a conditional spread
      // (`{...(k ? {'data-ohw-key': k} : {})}`) satisfies the rule on the path where the key
      // exists and breaks it on the path where it does not, so it is worth saying but is not
      // the same defect as a missing key.
      // No form exemption: the bridge hard-requires a key on <form> too — submission and field
      // reconciliation both early-return without one (forms.ts, form-fields.ts), so a keyless
      // form silently never submits.
      const keyAnywhere = /data-ohw-key/.test(tag.attrs)
      if (attrValue(tag.attrs, 'data-ohw-key') === null) {
        if (keyAnywhere) {
          report('warn', `\`data-ohw-key\` is conditional — unkeyed whenever that branch is falsy`, file, tag.line)
        } else {
          report('error', `\`data-ohw-editable="${editable}"\` with no \`data-ohw-key\``, file, tag.line)
        }
      }
    }
  }
}

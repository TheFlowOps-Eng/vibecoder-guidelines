import {attrValue} from '../lib/scan.mjs'

export const rule = 10
export const title = 'Header and footer sections are named exactly navbar and footer'

export function check(ctx, report) {
  const ids = new Set()
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      const section = attrValue(tag.attrs, 'data-ohw-section')
      if (section !== null) ids.add(section)
    }
  }
  // The chrome sections must be named exactly — they are protected by that name.
  const hasExpr = ids.has('{expr}')
  for (const required of ['navbar', 'footer']) {
    if (!ids.has(required) && !hasExpr) {
      report('error', `no section named exactly \`${required}\` (it would lose delete protection)`, null, null)
    }
  }
}

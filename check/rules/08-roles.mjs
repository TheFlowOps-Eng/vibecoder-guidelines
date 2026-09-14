import {attrValue} from '../lib/scan.mjs'

export const rule = 8
export const title = 'Button and logo roles exist — they carry AI styling, not just clicks'

export function check(ctx, report) {
  let sawButtonRole = false
  let sawLogoRole = false

  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    // Roles may also be emitted through an attribute object spread onto the element
    // (`{'data-ohw-role': 'button'}` in a shared Button component) — invisible to the
    // per-element JSX scan below, but just as real in the DOM.
    if (/['"]data-ohw-role['"]\s*:\s*['"](button|navbar-button)['"]/.test(src)) sawButtonRole = true
    if (/['"]data-ohw-role['"]\s*:\s*['"]logo['"]/.test(src)) sawLogoRole = true
    for (const tag of ctx.tagsFor(file)) {
      const role = attrValue(tag.attrs, 'data-ohw-role')
      if (role === 'button' || role === 'navbar-button') sawButtonRole = true
      if (role === 'logo') sawLogoRole = true
      // The header CTA contract is the pair: `navbar-button` + drag-disabled. The role alone
      // already excludes it from nav reorder, so a missing drag-disabled is doc drift rather
      // than breakage — warn, don't fail.
      if (role === 'navbar-button' && attrValue(tag.attrs, 'data-ohw-drag-disabled') === null) {
        report('warn', '`data-ohw-role="navbar-button"` without `data-ohw-drag-disabled="true"` — the header CTA contract is the pair', file, tag.line)
      }
    }
  }

  if (!sawButtonRole) {
    report('error', 'no `data-ohw-role="button"` anywhere — style alignment and generated CTA radius break', null, null)
  }
  if (!sawLogoRole) report('warn', 'no `data-ohw-role="logo"`', null, null)
}

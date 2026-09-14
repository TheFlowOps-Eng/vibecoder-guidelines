import {REQUIRED_BRAND_VARS} from '../lib/constants.mjs'
import {definesVar} from '../lib/scan.mjs'

export const rule = 12
export const title = 'The --brand-* palette exists and component CSS routes through it'

export function check(ctx, report) {
  for (const v of REQUIRED_BRAND_VARS) {
    if (!definesVar(ctx.varSources, v)) {
      report('error', `\`${v}\` is never defined — \`update_brand\` cannot repaint it`, null, null)
    }
  }

  // Hex outside a var() fallback bypasses the brand entirely.
  for (const file of ctx.cssFiles) {
    const css = ctx.read(file)
    css.split('\n').forEach((text, i) => {
      if (/^\s*(\/\*|\*)/.test(text)) return
      if (!/#[0-9a-fA-F]{3,8}\b/.test(text)) return
      if (/var\(\s*--[\w-]+\s*,/.test(text)) return
      report('warn', `hardcoded hex outside a var() fallback: ${text.trim().slice(0, 60)}`, file, i + 1)
    })
  }
}

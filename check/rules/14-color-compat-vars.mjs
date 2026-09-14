import {REQUIRED_COLOR_VARS} from '../lib/constants.mjs'
import {definesVar} from '../lib/scan.mjs'

export const rule = 14
export const title = 'Baked --color-*/--font-* tokens exist for generated sections and the widget'

export function check(ctx, report) {
  for (const v of REQUIRED_COLOR_VARS) {
    if (!definesVar(ctx.varSources, v)) {
      report('warn', `\`${v}\` is not defined — generated sections fall back to the platform look`, null, null)
    }
  }
}

export const rule = 13
export const title = 'Brand vars emit the var(--ohw-brand-*, default) fallback chain'

export function check(ctx, report) {
  // The override-with-fallback chain is what lets a brand change win.
  // varSources includes plain .ts libs — yoga builds its whole theme in lib/theme-css.ts.
  const emitsChain = ctx.varSources.some((s) => /var\(--ohw-brand-/.test(s))
  if (!emitsChain) {
    report('error', 'no `var(--ohw-brand-*, default)` fallback chain — brand overrides never reach the CSS', null, null)
  }
}

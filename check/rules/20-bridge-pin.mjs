export const rule = 20
export const title = 'The @ohhwells/bridge pin is present and current'

export function check(ctx, report) {
  // The bridge pin is the AI feature gate: the editor disables verbs below per-verb
  // minimum versions, so a template left behind shows "needs a redeploy" instead of generating.
  if (!ctx.exists(ctx.pkgPath)) return
  const pinned = JSON.parse(ctx.read(ctx.pkgPath)).dependencies?.['@ohhwells/bridge']
  if (!pinned) {
    report('error', 'no `@ohhwells/bridge` dependency', null, null)
  } else if (ctx.latestBridge && /^\d/.test(pinned) && pinned !== ctx.latestBridge) {
    report('warn', `pinned to @ohhwells/bridge ${pinned}, other templates are on ${ctx.latestBridge}`, null, null)
  }
}

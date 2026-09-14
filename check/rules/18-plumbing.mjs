export const rule = 18
export const title = 'Root layout loads the bridge styles and mounts <OhhwellsBridge /> in <Suspense>'

export function check(ctx, report) {
  if (!ctx.exists(ctx.layoutPath)) {
    report('error', 'no src/app/layout.tsx', null, null)
    return
  }
  const src = ctx.read(ctx.layoutPath)
  // The styles may also arrive as a synced static <link> (serene-oasis: the JS import's
  // Tailwind v4 CSS conflicts with the app's v3 pipeline) — both deliver the same stylesheet.
  if (!src.includes('@ohhwells/bridge/styles') && !src.includes('ohhwells-bridge.css')) {
    report('error', 'root layout does not load the bridge styles (JS import or synced static link)', ctx.layoutPath, null)
  }
  if (!/<Suspense[\s>][\s\S]{0,200}<OhhwellsBridge/.test(src)) {
    report('error', '`<OhhwellsBridge />` is not wrapped in `<Suspense>`', ctx.layoutPath, null)
  }
  if (!src.includes('ohw-loader')) {
    report('warn', 'no `#ohw-loader` first-paint loader — visitors flash template defaults', ctx.layoutPath, null)
  }
}

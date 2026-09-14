export const rule = 15
export const title = 'Card components carry the bare `card` class token'

export function check(ctx, report) {
  // The corner-style rule targets :is(.card, [data-ohw-card]). What matters is that
  // rendered elements CARRY the bare `card` class token: a `.card` CSS rule alone styles nothing,
  // and `.card-sticker`-style names never match the bridge selector. Look for the standalone token
  // inside className strings ("card", "x card", `card ${...}` — never card- or __card compounds).
  const carriesCardToken = ctx.tsxFiles.some((f) =>
    /className=\{?[`"'](?:[^`"'\n]*\s)?card(?:[\s`"']|\$\{)/.test(ctx.read(f)),
  )
  if (!carriesCardToken) {
    report('warn', 'no element carries the bare `card` class — `update_style` corner styling has nothing to target', null, null)
  }
}

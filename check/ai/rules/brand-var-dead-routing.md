# ai-brand-var-dead-routing

## Intent
Find surfaces where the `--brand-*` palette is DEFINED but doesn't actually reach the pixels —
components consuming raw color literals or their own private tokens, so `update_brand` repaints
nothing visible. The deterministic rule 12 verifies the vars exist and warns on raw hex in CSS;
it cannot judge whether a given visually-significant surface routes through them.

## What to look for
- Section backgrounds, headings, CTAs, cards styled with literals (hex, named colors, private
  `--color-neutral-*` ramps) where the design clearly intends the brand color.
- Also the inverse: surfaces that are CORRECTLY fixed — neutral ramps, image-backed heroes,
  deliberately monochrome footers. Do not flag those; the judgement is "should this surface
  respond to a brand change?", per surface.

## Real incidents
kindergarten, hvac, stillpoint and serene-oasis all shipped the same shape: `--brand-*` defined
(rule 12 clean) while components consumed raw literals — brand restyles silently didn't paint.
serene-oasis's neutral-ramp surfaces staying fixed was verified as BY DESIGN — the correct
non-finding.

## Report as
`rule: "ai-brand-var-dead-routing"`, severity `warn`. Name the surface, the literal it consumes,
and which `--brand-*` var it should route through.

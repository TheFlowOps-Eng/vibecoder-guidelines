# ai-false-positive-triage

## Intent
For EVERY deterministic finding you are given, judge: is this a real violation, or is the
template satisfying the rule in a way the pattern-matcher can't see? The checker's history says
this triage is worth a pass of its own — regex blindness has repeatedly cost debugging time.

## What to look for
Read the actual source around each finding. Verdicts:
- `real` — the violation holds; say what confirms it.
- `false-positive` — the intent of the rule IS satisfied through a mechanism the checker can't
  parse (dynamic emission, a `.ts` lib, an object-literal spread, a wrapper component). Name the
  mechanism precisely.
- `uncertain` — you can't tell from the provided source; say what's missing.

## Real incidents (the pattern-blindness record)
- rule 13 flagged yoga: the var chain lived in `lib/theme-css.ts`, a file the rule didn't scan.
- rule 14: 3 of 4 flags were dynamic `--color-${role}` emission + next/font vars in `.ts` files.
- rule 15's original regex matched `.card-sticker` while missing that no element carried the
  bare `card` token — wrong in both directions.
- rule 8 originally missed object-literal `'data-ohw-role': 'button'` emission from shared
  Button components.

## Report as
The `triage` array in your output (not `findings`): one entry per deterministic finding, with
`verdict` and a one-line `note`.

# ai-mode-choice

## Intent
Judge whether each editable's mode fits what the element is. Modes carry semantics the checker
can't verify: `text` gets the formatting toolbar and counts as a nav-item label; `plain` is
innerText-only and invisible to nav-item detection; `icon` opens the icon picker; `image` vs
`bg-image` decide src vs background writes.

## What to look for
- `plain` on something that wants formatting (body copy, multi-line descriptions) or that the
  bridge must see as a nav label (rule 6 covers the clear anchors; you judge template-literal
  href-keys and structural cases it skips).
- `text` on single-word micro-labels where an owner pasting formatted content would break the
  layout (`plain` is the safe mode there).
- `icon` slots that actually hold photos, `image` on elements styled via background.
- Placeholder judgement: bracketed tokens like `[BUSINESS NAME]` in the starter hero are
  INTENTIONAL editable tokens, not fake UI — don't confuse them with rule 21's map placeholders.

## Real incidents
yoga carries 6 deliberately-deferred rule-6 `plain` labels (known debt); meridian's icon badges
were misread by an earlier deterministic pass as unkeyed images — the icon mode owning its glyph
content is the correct pattern.

## Report as
`rule: "ai-mode-choice"`, severity `info` (these are judgement calls). Name the element, its
current mode, the mode you'd expect, and the consequence of the mismatch.

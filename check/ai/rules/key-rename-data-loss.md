# ai-key-rename-data-loss

## Intent
Treat any rename of a `data-ohw-key`, `data-ohw-href-key`, or `data-ohw-section` id as a
DATA-LOSS EVENT to be justified, not a style choice. Stored owner edits are keyed by name:
renaming orphans every saved override under the old key, and live sites silently revert to
template defaults.

## What to look for
This rule matters most when reviewing a DIFF: any changed key/section-id literal. In a full-tree
review, look for keys that deviate from the `{section}-{field}` scheme in ways that invite a
future "cleanup" rename (unprefixed keys like `button-2-href`, ids like `global-navbar` where
the contract wants `navbar`), and note the migration cost of fixing them.

## Real incidents
- The detail-page key-scoping fixes (professional-services, compass, local-fnb, yoga) changed
  stored-key names — every owner draft on those pages reverted to defaults.
- kindergarten shipped unprefixed hero `button-N-href` keys; renaming them was deferred exactly
  because it would orphan saved overrides.
- Stale pre-OHH-772 section ids in an old draft blanked the editor page entirely.

## Report as
`rule: "ai-key-rename-data-loss"`, severity `warn`. Name the old/new key and state what stored
data the rename orphans; if a deviation is flagged prospectively, state the cost of fixing later
vs the cost of leaving it.

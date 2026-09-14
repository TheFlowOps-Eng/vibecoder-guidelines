# ai-link-affordance-intent

## Intent
Decide, per link, whether it is a FIXED link (wants `data-ohw-role="button"` +
`data-ohw-drag-disabled="true"`) or a REORDERABLE item (must stay role-less). The bridge treats
a role-less `data-ohw-href-key` anchor as a navigation item and gives it drag/duplicate/delete
machinery; the role gives it the two-phase select + link-toolbar treatment instead. The
deterministic rule 23 only covers the clear case (non-chrome files); you judge the ambiguous
ones — chrome files especially.

## What to look for
Anchors carrying `data-ohw-href-key`. Classify by what the element IS in the design:
- Fixed: CTAs, pricing buttons, legal links (privacy/terms), back-to-top, inline body links,
  contact detail links (tel/mailto/social handles in a contact section).
- Reorderable (correctly role-less): nav menu items, footer column links (inside
  `data-ohw-footer-col` machinery), socials rows.
Flag fixed links missing the role pair, AND role-carrying links that look like genuine menu
items (the role would break their reordering).

## Real incidents
- tutor pricing buttons, tutor back-to-top, blue-template footer legal links: all shipped with
  href-key but no role — owners got drag handles and delete on links that must never move.
- The exception class is real too: nav menus and footer columns must stay bare or reorder breaks.

## Report as
`rule: "ai-link-affordance-intent"`, severity `warn`. Name the element, say which class you
judged it to be and why, and what attribute change follows.

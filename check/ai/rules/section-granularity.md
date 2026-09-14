# ai-section-granularity

## Intent
Judge section boundaries and label quality. Section ids anchor generate/style/delete targeting,
and a visually-distinct region without its own `data-ohw-section` is unreachable by
section-scoped prompts (they silently see nothing of it — scoping is DOM ancestry). Labels are
what owners see in the editor's section list.

## What to look for
- A page region a user would point at and say "restyle THAT" which has no section id of its own
  (merged into a neighbor, or outside any section).
- Over-sectioning: trivial wrappers each carrying an id, cluttering the section list.
- Label quality: `data-ohw-section-label` values should be owner-meaningful ("Testimonials",
  "Opening Hours") — flag machine-ish labels; a missing label falls back to a title-cased id,
  which is fine for good ids and terrible for ids like `cta2`.

## Real incidents
OHH-772 class: shared section ids made two different page regions ONE section to the editor —
styling either restyled both. The deterministic rule 9 now catches id collisions; you catch the
granularity and naming judgement it can't.

## Report as
`rule: "ai-section-granularity"`, severity `info`. Name the region and the concrete editor
consequence (unreachable by scoped prompts / confusing section list entry).

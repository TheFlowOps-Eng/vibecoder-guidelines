# ai-form-label-visual-damage

## Intent
Predict whether the bridge's runtime label injection will visually break a form. The bridge
form runtime runs on PLAIN page load (not only in the editor) and injects a visible
`[data-ohw-field-label]` label for any field whose label it can't find — which breaks designs
whose labels are placeholder-only or sr-only (pill-style newsletter forms).

## What to look for
`<form data-ohw-editable="form">` elements where:
- fields have no visible label (placeholder-only, or `sr-only`/visually-hidden label classes), AND
- there is neither a pre-tagged label (a label already carrying `data-ohw-editable` — the bridge
  leaves those alone, which templates use deliberately to suppress injection) NOR a CSS guard
  like `[data-ohw-field-label] { display: none !important; }` scoped to that form.
Such forms will render an unstyled injected label into a design that has no room for it.

## Real incident
eva migration (2026-08-27): the pill-style email form's labels were sr-only; the bridge injected
visible inline-styled labels and broke the design. The user's requirement is ZERO visible UI
change — the fix was a scoped `display: none` guard.

## Report as
`rule: "ai-form-label-visual-damage"`, severity `warn`. Name the form, the fields at risk, and
the guard that's missing.

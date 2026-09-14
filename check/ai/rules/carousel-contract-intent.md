# ai-carousel-contract-intent

## Intent
Judge the parts of the editable-carousel contract (bridge `docs/editable-carousels.md`) that a
pattern-match can't: the deterministic rule 24 verifies the mechanics (`'use client'`,
`{...bind}`, slide markers, unique keys, `unoptimized`, no `.slice()` caps); you verify the
component actually behaves like an editable gallery.

## What to look for
In files using `useOhwCarousel` or a manual `data-ohw-carousel` container:
- **Rendering from the raw prop instead of the hook's array** — mapping `content.images` /
  the `initialImages` argument rather than the destructured `images`. Edits then save but never
  render; the gallery looks broken to the owner.
- **Fixed-count layouts** — grids with hardcoded slide areas, exactly-N crossfade logic, or
  styling that assumes the shipped number of slides. Add/delete is supported, so the layout
  must survive any count.
- **Extra fields on slide items** — items beyond `{ src, alt }` (captions, ids, links). The
  editor drops extra fields on the first edit, so any UI driven by them silently degrades.
- **Reordering or non-image expectations** — UI that implies slide reordering or mixed-media
  slides; v1 supports replace/add/delete/alt only, images only.
- **Second projections carrying `{...bind}`** — only the primary container should; a duplicate
  bind on a thumbnail rail double-mounts the overlay.

## Real incidents
serene-oasis's hero gallery images deliberately carry NO per-image `data-ohw-editable` tags —
the carousel contract owns the slides (an earlier audit misread this as untagged media). The
rebound manifesto strip renders phantom loop copies beyond `images.length` and correctly marks
only the real slides.

## Report as
`rule: "ai-carousel-contract-intent"`, severity `warn`. Name the component, which clause of the
contract the behavior violates, and what the owner would experience in the editor.

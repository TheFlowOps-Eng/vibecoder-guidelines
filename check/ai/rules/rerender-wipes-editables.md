# ai-rerender-wipes-editables

## Intent
Find bridge-owned editables inside React components that re-render, where React will reset the
element's innerHTML and silently wipe the owner's edit. The bridge writes edited content into
the DOM; React re-rendering the same element from props/state overwrites it on the next render.

## What to look for
Elements carrying `data-ohw-editable="text"|"plain"` inside components with re-render triggers:
`useState`/`useEffect`-driven updates, animation loops, interval timers, scroll/resize handlers,
carousel/rotator logic. Safe patterns: the editable element is memoized (`useMemo` returning a
stable element), or lives outside the re-rendering subtree. Flag only when the editable's JSX is
re-evaluated by the re-render.

## Real incident
blue-template ArcText: an animated component re-rendered on an animation frame and reset the
bridge-owned headline's innerHTML on every render, reverting edits live. Fix was a useMemo'd
stable element.

## Report as
`rule: "ai-rerender-wipes-editables"`, severity `warn`. Name the component, the re-render
trigger, and the affected editable key.

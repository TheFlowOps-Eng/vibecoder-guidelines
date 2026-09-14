# ai-should-be-editable

## Intent
Find visible content a site owner would plausibly want to edit that carries no `data-ohw-key`.
Unkeyed content is silently invisible to the AI feature — no error, the model just never knows
it exists. The deterministic checker only catches unkeyed `<img>` tags; text is your job.

## What to look for
Hardcoded headlines, taglines, phone numbers, addresses, opening hours, prices, business names
and other owner-specific copy rendered without `data-ohw-editable`/`data-ohw-key`. Judge intent:
- Flag: content an owner would obviously customize (their address, their prices, their name).
- Do NOT flag: decorative/structural text (kickers that are part of the design system, aria
  labels, legal boilerplate rendered from a shared constant, developer-facing strings).

## Real incidents
Fleet-wide sweeps repeatedly found "the AI ignored my section" reports tracing back to untagged
content — the symptom shows up weeks later as a silent no-op, never as an error.

## Report as
`rule: "ai-should-be-editable"`, severity `warn`. Quote the content and say why an owner would
want it editable.

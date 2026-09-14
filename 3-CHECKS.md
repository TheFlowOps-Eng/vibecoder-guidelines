# 3 — Testing and checks

Run in this order before publishing. Steps 1–4 cost nothing; step 5 costs API credits.

All commands run from **inside your template folder**. `$GUIDE` stands for wherever you cloned this repo (for example `export GUIDE=~/vibecoder-guidelines`).

```bash
cd my-template
npm run build                                   # 1. production build
npm run lint                                    # 2. next lint
node $GUIDE/check/run.mjs                       # 3. convention checker — must show 0 errors
node $GUIDE/check/ai/run-ai-review.mjs --mock   # 4. AI review plumbing, no API calls
node $GUIDE/check/ai/run-ai-review.mjs          # 5. live AI review (optional; key stored once with --set-key)
```

---

## The convention checker (`check/run.mjs`)

Static audit of a template's source against the rules in [2-CONVENTIONS.md](2-CONVENTIONS.md). Reads files only: no dev server, no build, no network, no npm install. About a second per template.

### What it scans

- Run from inside a template folder (one with `src/` and `package.json`), it checks that template. Run from a folder that contains template folders, it checks all of them, or the ones you name. `OHW_TEMPLATES_ROOT=/path/to/folder` overrides both. Anywhere else it prints a hint and exits 1.
- It reads `src/**/*.tsx|jsx` for markup, `src/**/*.css` and `src/**/*.ts` for tokens, `src/app/**/page.tsx` and `src/app/layout.tsx` for page-level rules, plus `package.json` and `.env.example`. Duplicate-key checks are limited to files reachable by import from `src/app`, so dead components cannot produce false duplicates.
- Rule 20 compares your `@ohhwells/bridge` pin with other template folders next to yours. With no siblings it has nothing to compare and stays quiet; keep the pin at the version the team names.

### CLI

| Invocation | Effect |
|---|---|
| `node $GUIDE/check/run.mjs` | the template you are in (or every template under the current folder) |
| `node $GUIDE/check/run.mjs my-template other-template` | only these, by folder name |
| `--errors` | hide warnings |
| `--json` | machine-readable: `[{ template, findings: [{ rule, severity, message, file, line }] }]` |
| `--rule 9,12` | only these rule numbers (an unknown number aborts with the list of known rules) |
| `--gha` | GitHub Actions `::error`/`::warning` annotations + a markdown step summary (stdout when not in CI) |

Exit code is `1` when any template has an **error**-level finding, `0` otherwise. Warnings never change the exit code.

### Reading the output

```
✓ starter

✗ my-template  2 error(s), 5 warning(s)
    rule 8   no `data-ohw-role="button"` anywhere — style alignment and generated CTA radius break
    rule 5   image with no `data-ohw-key`  (+3 more)
      src/components/sections/Team/layouts/TeamGrid/TeamGrid.tsx:41
```

- **Error** — an editor or AI verb is broken or silently does the wrong thing. Fix before shipping; CI fails on it.
- **Warn** — degraded quality or a latent problem. Read it, decide, don't obey blindly: a genuinely decorative image (rule 5) or a component-scoped editable (rule 11) can be a correct non-fix.
- Findings are grouped per rule with the first three locations; use `--json` for all of them.

### Precision

Every rule was calibrated against real findings and known false positives were removed (logo/social links under rule 6, conditional-spread keys under rule 1, chrome mirrors under rule 2, `bg-image` containers under rule 4, object-spread roles under rule 8, `--color-${role}` emission under rule 14). If the checker flags something the template genuinely satisfies, that is a bug in the rule, not something to work around: open an issue on this repo with the finding and the source. Each rule is one file exporting `{ rule, title, check(ctx, report) }` under `check/rules/`; a new `NN-slug.mjs` dropped there runs without registration.

### What it cannot see

It reads source, so it cannot judge runtime behaviour (does re-applying content stay idempotent, does the saved section order apply, is the socials row recognised) or intent (should this text be editable, is this link a button). Intent is the AI review's job below; runtime is verified by opening the deployed template in the canvas editor and editing every section once.

---

## The AI review (`check/ai/run-ai-review.mjs`)

Judgement calls the regexes cannot make, run by Claude. Per template it (a) runs the deterministic checker, (b) bundles the source slices that carry the bridge contract, (c) makes **one** API call asking the model to report findings for the ten `ai-*` rule specs in `check/ai/rules/*.md` and to triage every deterministic finding as `real`, `false-positive` or `uncertain`.

**Advisory only.** The script exits `0` whatever it finds. It exits `1` only on an operational failure (no key, API/auth error, refusal, response truncated), so a broken setup is visible but bad templates never block.

### Mock mode (free, run it always)

```bash
node $GUIDE/check/ai/run-ai-review.mjs --mock
```

Uses `check/ai/fixtures/default.json` instead of the API (or `--fixture bad-severity` / `--fixture malformed` to exercise the sanitizer). No key needed, zero cost. It proves the checker integration, bundling and reporting work; the findings it prints are the fixture's, not a review of your template.

### Live mode with your own Anthropic key (one-time setup)

1. Create a key at https://console.anthropic.com/ (Settings → API keys).
2. Store it once. The prompt hides what you paste, and the key is written to `~/.ohhwells/ai-review.json` readable only by you (the same folder the deploy CLI uses for its login). Nothing goes into the repo or a template `.env`.

```bash
node $GUIDE/check/ai/run-ai-review.mjs --set-key
# Paste your Anthropic API key (input is hidden): ████
# Saved to ~/.ohhwells/ai-review.json (readable by you only). Live reviews will use it from now on.
```

3. Review:

```bash
node $GUIDE/check/ai/run-ai-review.mjs
```

- `--forget-key` deletes the stored key.
- `ANTHROPIC_API_KEY` in the environment overrides the stored key (that is what CI uses); nothing else changes.
- With no key anywhere the script stops before any call and prints the three options (`--set-key`, the env var, `--mock`). Exit code 1.
- The key only ever leaves your machine in the request to `api.anthropic.com`. Never commit it and never paste it into a template file.

Cost: one call per template, default model `claude-sonnet-5` with adaptive thinking, `max_tokens` 32000, effort `high`. Observed cost in the team's live runs was roughly $0.15–0.30 per template. From inside your template folder it reviews only that template; from a folder of templates a bare invocation reviews all of them.

### CLI

| Flag | Effect |
|---|---|
| `my-template …` or `--templates a,b` | which templates, by folder name (default: the one you are in, or all) |
| `--mock` | fixture responses, no API |
| `--fixture <name>` | fixture file to use with `--mock` (`check/ai/fixtures/<name>.json`) |
| `--model <id>` | model override (default `claude-sonnet-5`) |
| `--effort low\|medium\|high\|xhigh\|max` | reasoning depth (default `high`) |
| `--json` | machine-readable `[{ template, deterministic, findings, triage, error }]` |
| `--summary <file>` | write the markdown report here (defaults to `$GITHUB_STEP_SUMMARY` when set) |
| `--comment-out <file>` | write the same markdown with a `<!-- ai-template-review -->` marker |
| `--set-key` | store your Anthropic key once (hidden prompt) in `~/.ohhwells/ai-review.json` |
| `--forget-key` | delete the stored key |

Environment: `ANTHROPIC_API_KEY` (overrides the stored key; required in CI), `OHW_TEMPLATES_ROOT` (root override, same as the checker).

### What the model sees

Every file under `src/` matching `.ts|.tsx|.js|.jsx|.css` whose content contains `data-ohw-` or `--brand-` / `--color-`, capped at 60,000 characters per template; the largest files are truncated first and marked, and the model is told to judge only what is shown. Finding severities are `warn` or `info`; anything else is clamped to `warn`. Findings name a file and line where possible.

### Reading the output

```
! my-template  2 AI finding(s), 3 triage verdict(s)
    ai-should-be-editable  hardcoded opening-hours copy is not keyed — invisible to the AI feature
      src/app/page.tsx:88
    triage rule 5 src/components/…/TeamGrid.tsx:41: false-positive  decorative divider image, never owner content
```

- A `false-positive` triage verdict is the model saying the deterministic finding is satisfied by a mechanism the regex cannot see; still read the note before ignoring the finding.
- Rule specs are prompts: `check/ai/rules/*.md` define what is judged, exactly like the deterministic rule files.

---

## Using it in your own CI

The checker is plain Node with no dependencies, so any CI can run it. Clone this repo in the job and run the checker from your template folder; `--gha` gives GitHub Actions annotations and a step summary, and the exit code fails the job on errors:

```yaml
- uses: actions/checkout@v4
- uses: actions/checkout@v4
  with:
    repository: TheFlowOps-Eng/vibecoder-guidelines
    path: .guidelines          # a dot-folder, so the checker never mistakes it for a template
- uses: actions/setup-node@v4
  with:
    node-version: '22'
- run: node .guidelines/check/run.mjs --gha
```

For the live AI review in CI, add `ANTHROPIC_API_KEY` as a repository secret and pass it as an environment variable; keep it out of the repo itself.

## For the OhhWells team

The platform's own templates repo runs exactly this checker on every pull request and the AI review on demand, both by checking this repo out at `main`. Rules and docs change only here; a rule change shows up on the next pull request there. `starter/` is written only by the hourly sync workflow (`.github/workflows/sync-starter.yml`); edit the starter in the templates repo, never here.

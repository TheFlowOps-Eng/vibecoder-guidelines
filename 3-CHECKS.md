# 3 — Testing and checks

Run in this order before every PR. Steps 1–4 cost nothing; step 5 costs API credits.

All commands assume this repo is cloned next to your templates folder and that you run the checks from the folder that **contains** your template (the checker discovers template folders under the current directory).

```bash
cd my-template
npm run build                                              # 1. production build
npm run lint                                               # 2. next lint
cd ..
node ../vibecoder-guidelines/check/run.mjs my-template     # 3. convention checker — must show 0 errors
node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --mock my-template   # 4. AI review plumbing, no API calls
node ../vibecoder-guidelines/check/ai/run-ai-review.mjs my-template          # 5. live AI review (optional; key stored once with --set-key)
```

---

## The convention checker (`check/run.mjs`)

Static audit of a template's source against the rules in [2-CONVENTIONS.md](2-CONVENTIONS.md). Reads files only: no dev server, no build, no network, no npm install. The whole fleet takes a couple of seconds.

### What it scans

- A "template" is any top-level folder under the root that contains a `src/` directory (dot-folders are skipped). The root is the **current working directory** by default; `OHW_TEMPLATES_ROOT=/path/to/parent` overrides it. Running from a folder with no template subfolders prints a hint and exits 1.
- It reads `src/**/*.tsx|jsx` for markup, `src/**/*.css` and `src/**/*.ts` for tokens, `src/app/**/page.tsx` and `src/app/layout.tsx` for page-level rules, plus `package.json` and `.env.example`. Duplicate-key checks are limited to files reachable by import from `src/app`, so dead components cannot produce false duplicates.

### CLI

| Invocation | Effect |
|---|---|
| `node check/run.mjs` | every template |
| `node check/run.mjs my-template other-template` | only these |
| `--errors` | hide warnings |
| `--json` | machine-readable: `[{ template, findings: [{ rule, severity, message, file, line }] }]` |
| `--rule 9,12` | only these rule numbers (an unknown number aborts with the list of known rules) |
| `--gha` | GitHub Actions `::error`/`::warning` annotations + a markdown step summary (stdout when not in CI) |

Exit code is `1` when any template has an **error**-level finding, `0` otherwise. Warnings never change the exit code.

### Reading the output

```
✓ ohhwells-starter

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

It reads source, so it cannot judge runtime behaviour (does re-applying content stay idempotent, does the saved section order apply, is the socials row recognised) or intent (should this text be editable, is this link a button). Intent is the AI review's job below; runtime is verified in the canvas editor after a deploy. Internal team members can run any template against a local backend and editor with `local-testing/run-template.sh <template>` (see `local-testing/README.md` at the workspace root); never run a deploy or publish against the local backend.

---

## The AI review (`check/ai/run-ai-review.mjs`)

Judgement calls the regexes cannot make, run by Claude. Per template it (a) runs the deterministic checker, (b) bundles the source slices that carry the bridge contract, (c) makes **one** API call asking the model to report findings for the ten `ai-*` rule specs in `check/ai/rules/*.md` and to triage every deterministic finding as `real`, `false-positive` or `uncertain`.

**Advisory only.** The script exits `0` whatever it finds. It exits `1` only on an operational failure (no key, API/auth error, refusal, response truncated), so a broken setup is visible but bad templates never block.

### Mock mode (free, run it always)

```bash
node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --mock my-template
```

Uses `check/ai/fixtures/default.json` instead of the API (or `--fixture bad-severity` / `--fixture malformed` to exercise the sanitizer). No key needed, zero cost. It proves the checker integration, bundling and reporting work; the findings it prints are the fixture's, not a review of your template.

### Live mode with your own Anthropic key (one-time setup)

1. Create a key at https://console.anthropic.com/ (Settings → API keys).
2. Store it once. The prompt hides what you paste, and the key is written to `~/.ohhwells/ai-review.json` readable only by you (the same folder the deploy CLI uses for its login). Nothing goes into the repo or a template `.env`.

```bash
node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --set-key
# Paste your Anthropic API key (input is hidden): ████
# Saved to ~/.ohhwells/ai-review.json (readable by you only). Live reviews will use it from now on.
```

3. Review:

```bash
node ../vibecoder-guidelines/check/ai/run-ai-review.mjs my-template
```

- `--forget-key` deletes the stored key.
- `ANTHROPIC_API_KEY` in the environment overrides the stored key (that is what CI uses); nothing else changes.
- With no key anywhere the script stops before any call and prints the three options (`--set-key`, the env var, `--mock`). Exit code 1.
- The key only ever leaves your machine in the request to `api.anthropic.com`. Never commit it and never paste it into a template file.

Cost: one call per template, default model `claude-sonnet-5` with adaptive thinking, `max_tokens` 32000, effort `high`. Observed cost in the team's live runs was roughly $0.15–0.30 per template. Review one template at a time; a bare invocation reviews the entire fleet.

### CLI

| Flag | Effect |
|---|---|
| `my-template …` or `--templates a,b` | which templates (default: all) |
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

## CI

### In the templates repo (`TheFlowOps-Eng/vibe-coded-templates`)

Two workflows check this repo out (into a dot-folder, at `main`) and run the checker from the templates workspace. At the time of writing both live on the `feat/ai-template-review` branch there and are not yet on its `main`; until that merge lands, run the checks locally.

**`template-checks.yml` — the PR gate**

- Trigger: every `pull_request` into `main`.
- Runs the checker with `--gha` on Node 22 against the **whole fleet**, using this repo's `main` rules.
- Errors become inline PR annotations and fail the check. Warnings annotate and pass. The per-template breakdown is in the job's step summary.

**`ai-template-review.yml` — manual, advisory**

- Trigger: `workflow_dispatch` only (Actions tab → "AI template review" → Run workflow). Never on PRs.
- Inputs: `branch` (default `main`), `templates` (comma-separated folders, empty = all), `effort` (default `high`), `mock` (**default true**; untick deliberately for a live run).
- Needs the `ANTHROPIC_API_KEY` repository secret for live runs: GitHub repo → Settings → Secrets and variables → Actions → New repository secret, name `ANTHROPIC_API_KEY`. Mock runs need none.
- A red run means an operational problem (missing or invalid key, API error), never bad templates. The report is the run's step summary.

### In this repo

`fleet-check.yml` runs on every push to `main`, every pull request and on demand. It syntax-checks every module and validates the fixtures, then checks out the (private) templates repo and runs the checker and the mock AI review over the whole fleet, so a rule change cannot land while it breaks a template. The fleet job needs the `TEMPLATES_REPO_TOKEN` secret (read access to vibe-coded-templates); without it, or on a pull request from a fork, it is skipped rather than failed.

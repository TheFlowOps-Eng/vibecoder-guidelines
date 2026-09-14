# Vibecoder guidelines — building an OhhWells template

Everything needed to build a template that the OhhWells canvas editor and the AI prompt feature can edit, and to prove it before it ships.

| Read | When |
|---|---|
| [1-SETUP.md](1-SETUP.md) | Starting a template: copy the starter, run it, configure env and deploy. |
| [2-CONVENTIONS.md](2-CONVENTIONS.md) | Writing any component: the `data-ohw-*` contract, keys, sections, links, brand tokens, forms, maps, carousels. |
| [3-CHECKS.md](3-CHECKS.md) | Before every PR: build, the convention checker, the AI review (with your own Anthropic key), CI. |
| [check/](check/) | The checker itself. Deterministic rules 1–24 plus the AI review runner. Zero npm dependencies, Node 18+. |

## The one idea behind every rule

The editor and the AI never read your JSX. The bridge (`@ohhwells/bridge`, mounted in the root layout) collects `data-ohw-*` attributes from the rendered DOM, and that collection is the only view the editor and the model have of the page. Anything not tagged correctly is silently invisible: no error, no warning at runtime, the feature simply does nothing for that element. The same holds for brand repaints (they work through CSS variables), section targeting (through `data-ohw-section` ids) and navigation rewiring (through `data-ohw-href-key`).

The checker exists because these failures never show up as broken builds. They show up weeks later as "the AI ignored my section".

## How this repo is used

- **This repo is the single source of truth** for the conventions and the checker. The templates repo (`TheFlowOps-Eng/vibe-coded-templates`) carries no copy; its CI checks this repo out and runs `check/` on every pull request.
- **Clone it next to your templates folder** and run the checker from the folder that contains your template(s):

```bash
git clone https://github.com/TheFlowOps-Eng/vibecoder-guidelines.git
cd vibe-coded-templates            # or any folder that contains your template folder(s)
node ../vibecoder-guidelines/check/run.mjs my-template
```

- It is public and read-only: anyone can read and clone, only maintainers can change it. If a rule flags something your template genuinely satisfies, open an issue with the finding and the source.
- Rule numbers 1–24 in these docs are the checker's rule numbers (`check/rules/NN-*.mjs`). The reference implementation of every pattern is `ohhwells-starter/` in the templates repo.

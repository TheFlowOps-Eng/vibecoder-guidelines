# 1 — Setup

## Prerequisites

- Node.js 18.17 or newer. CI runs Node 22; use 20+ locally.
- npm and git.
- An OhhWells account for deploying (`npx ohhwells-deploy login`). Only needed at deploy time.
- This repo cloned next to your templates folder (see the README). Only needed for the checks in [3-CHECKS.md](3-CHECKS.md).
- An Anthropic API key, stored once with `node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --set-key`. Only needed for a live AI review; never for building or for the deterministic checker.

## 1. Create the template folder

Every template is a top-level folder of this repo, a sibling of `ohhwells-starter`. The folder name is kebab-case and is the name the checker and CI use for it.

```bash
# from the repo root
rsync -a --exclude node_modules --exclude .next --exclude tsconfig.tsbuildinfo --exclude .DS_Store \
      --exclude '.env' --exclude '.env*.local' --exclude ohhwells.json \
      --exclude QUICKSTART.md --exclude VIBECODER.md --exclude README.md --exclude OHHWELLS-DEPLOY.md \
      ohhwells-starter/ my-template/
cd my-template
```

The four excluded markdown files are the starter's older docs. They predate this kit and contradict it (different token names, folder paths, `ohhwells.json` shape, five editable modes instead of nine); this folder supersedes them. `ohhwells.json` is excluded on purpose (step 5).

Then edit:

- `package.json` — set `name` to the folder name. Keep `@ohhwells/bridge` as an **exact** version, equal to what the other templates pin (all are on `0.1.113` at the time of writing). A caret range is not compared by the checker and an older pin disables AI verbs in the editor ("needs a redeploy" toast).
- `CLAUDE.md` — delete the last line, `@VIBECODER.md` (the file is no longer there). Keep the three `@node_modules/@ohhwells/conventions/…` lines; they load the architecture conventions into any AI assistant.
- Leave `.env.example` in place; the checker requires it to mention `NEXT_PUBLIC_FLOWOPS_API_URL`.

## 2. Install and run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must pass before any deploy or PR
npm run lint       # next lint
```

Expected noise in `npm run build` that is not yours to fix: a `metadataBase property in metadata export is not set` warning per page (the site URL is injected at deploy time) and, on Node 22, a `punycode` deprecation notice.

## 3. Environment variables

`.env.example` documents both variables. For local work create `.env.local` (gitignored):

```env
NEXT_PUBLIC_FLOWOPS_API_URL=   # backend the bridge fetches/saves content from — ask the team for the URL
NEXT_PUBLIC_SITE_URL=          # canonical URL for SEO only
```

- If `NEXT_PUBLIC_FLOWOPS_API_URL` is unset, the bridge **silently falls back to the staging backend**. Always set it per environment.
- Both are set automatically by the deploy pipeline. Never commit `.env`; the deploy zip excludes `.env*` anyway.

## 4. What the starter already wires (keep it)

The starter passes the checker with 0 findings. These pieces are the contract; do not remove or restructure them:

- `src/app/layout.tsx` — `import '@ohhwells/bridge/styles'`, `<Suspense><OhhwellsBridge /></Suspense>`, the `#ohw-loader` first-paint loader with its inline subdomain script, and `BrandProvider` wrapping the page.
- `src/components/layout/BrandProvider.tsx` — emits every brand colour as `--brand-<key>: var(--ohw-brand-<role>, <default>)` plus the `--color-*` / `--font-*` / `--radius` tokens the bridge's widgets and generated sections read.
- `src/lib/fonts.ts` — loads the Google fonts with `next/font`. `content/brand.ts` only **names** the families; to change fonts, change both files (the loader and the names in `brand.ts`), or the new family never loads.
- `src/components/layout/Navbar.tsx`, `MobileMenu.tsx`, `Footer/` — header and footer chrome with the `data-ohw-nav-*` / `data-ohw-footer-*` hooks the bridge reads, sections named exactly `navbar` and `footer`, and the logo/wordmark pattern.
- `src/components/ui/Button.tsx` — `ohwKey` prop that renders a correctly tagged CTA.
- `src/components/sections/*` — one folder per section type with `*.types.ts`, `index.ts` layout registry, and `layouts/<Layout>/` containing the component, its types, defaults and CSS.
- `src/content/*.ts` — all copy, images and links. Components never import these.

## 5. `ohhwells.json`

Create this file in the template root only when the template is ready to be published (see the last paragraph of this section for why):

```json
{
  "template": {
    "name": "my-template",
    "displayName": "My Template",
    "category": "wellness"
  }
}
```

- `name` is the public slug: letters, numbers, hyphens (the CLI normalizes anything else and warns). The published template lives at `https://<name>.ohhwells.site`.
- `category` is required by the deploy CLI. Categories currently in use across the fleet: `wellness`, `service`, `education`, `hospitality`, `professional`, `beauty`. Pick the closest; if none fits, ask the team before inventing one.
- `displayName` is optional; the CLI prompts for it if missing. `description` is optional.
- `template` may also be an array when one folder backs several published templates (see `compass/`).

Committing this file enrolls the folder in the fleet **bridge-redeploy** workflow: on every bridge release (or a manual dispatch) it bumps the pin, builds and redeploys each folder that has a `template` block, then commits the bump back. Do not add the file until the template is meant to be published.

## 6. Deploy / publish

```bash
npx ohhwells-deploy login          # once; token stored in ~/.ohhwells/auth.json
cd my-template
npx ohhwells-deploy deploy         # reads template name/category/displayName from ohhwells.json
```

The CLI zips the project source (excluding `node_modules`, `.next`, `out`, `.git`, `.vercel`, `.env*`), uploads it, and prints the URL. It does **not** build locally; the build runs server-side on Vercel, so run `npm run build` yourself first. Flags `--template`, `--category`, `--display-name`, `--description` override the file. `--client-email` is only valid for client-site deploys, not template publishes.

## 7. Before opening a PR

Run everything in [3-CHECKS.md](3-CHECKS.md). Branch from `main` and open the PR into `main`.

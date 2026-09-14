# 1 — Setup

## Prerequisites

- Node.js 18.17 or newer (20+ recommended), npm, git.
- This repo cloned anywhere (`git clone https://github.com/TheFlowOps-Eng/vibecoder-guidelines.git`). The docs below call that folder `$GUIDE`.
- An OhhWells account, needed only at publish time (`npx ohhwells-deploy login`).
- An Anthropic API key, needed only for the optional live AI review in [3-CHECKS.md](3-CHECKS.md). Never for building or for the checker.

## 1. Create the template from the starter

`$GUIDE/starter/` is the platform's starter template. It is synced automatically from the OhhWells templates repo, so it is always the current one; pull this repo before you start. It passes every check with 0 findings and is the reference for every pattern in [2-CONVENTIONS.md](2-CONVENTIONS.md).

```bash
cp -R $GUIDE/starter my-template      # kebab-case folder name; it becomes the template's name in the checker
cd my-template
```

Then edit `package.json`: set `name` to the folder name. Keep `@ohhwells/bridge` at the **exact** version the starter pins; do not change it to a caret range and do not downgrade it. The bridge version is what enables the editor's AI features on your template.

Do not remove `.env.example`, `CLAUDE.md` (it loads the architecture conventions into any AI coding assistant), or anything listed in step 4.

## 2. Install and run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must pass before publishing
npm run lint       # next lint
```

Expected noise in `npm run build` that is not yours to fix: a `metadataBase property in metadata export is not set` warning per page (the site URL is injected at publish time) and, on Node 22, a `punycode` deprecation notice.

## 3. Environment variables

`.env.example` documents both variables. For local work create `.env.local` (gitignored):

```env
NEXT_PUBLIC_FLOWOPS_API_URL=   # backend the editor bridge fetches/saves content from — the OhhWells team gives you the URL
NEXT_PUBLIC_SITE_URL=          # canonical URL for SEO only
```

- If `NEXT_PUBLIC_FLOWOPS_API_URL` is unset, the bridge **silently falls back to the staging backend**. Always set it.
- Both are set automatically when the template is published. Never commit `.env`; the publish zip excludes `.env*` anyway.

## 4. What the starter already wires (keep it)

These pieces are the contract with the editor. Do not remove or restructure them:

- `src/app/layout.tsx` — `import '@ohhwells/bridge/styles'`, `<Suspense><OhhwellsBridge /></Suspense>`, the `#ohw-loader` first-paint loader with its inline subdomain script, and `BrandProvider` wrapping the page.
- `src/components/layout/BrandProvider.tsx` — emits every brand colour as `--brand-<key>: var(--ohw-brand-<role>, <default>)` plus the `--color-*` / `--font-*` / `--radius` tokens the bridge's widgets and generated sections read.
- `src/lib/fonts.ts` — loads the Google fonts with `next/font`. `content/brand.ts` only **names** the families; to change fonts, change both files, or the new family never loads.
- `src/components/layout/Navbar.tsx`, `MobileMenu.tsx`, `Footer/` — header and footer chrome with the `data-ohw-nav-*` / `data-ohw-footer-*` hooks the bridge reads, sections named exactly `navbar` and `footer`, and the logo/wordmark pattern.
- `src/components/ui/Button.tsx` — `ohwKey` prop that renders a correctly tagged CTA.
- `src/components/sections/*` — one folder per section type with `*.types.ts`, `index.ts` layout registry, and `layouts/<Layout>/` containing the component, its types, defaults and CSS. Copy one of these to start a new section.
- `src/content/*.ts` — all copy, images and links. Components never import these.

## 5. `ohhwells.json`

Create this file in the template root when the template is ready to be published. It is what the publish command reads:

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
- `category` is required. Categories in use on the platform: `wellness`, `service`, `education`, `hospitality`, `professional`, `beauty`. Pick the closest; if none fits, ask the team before inventing one.
- `displayName` is optional; the CLI prompts for it if missing. `description` is optional.

## 6. Publish

Run every check in [3-CHECKS.md](3-CHECKS.md) first, then:

```bash
npx ohhwells-deploy login          # once; token stored in ~/.ohhwells/auth.json
npx ohhwells-deploy deploy         # from the template folder; reads ohhwells.json
```

The CLI zips the project source (excluding `node_modules`, `.next`, `out`, `.git`, `.vercel`, `.env*`), uploads it, and prints the URL. It does **not** build locally; the build runs server-side, so run `npm run build` yourself first. Flags `--template`, `--category`, `--display-name`, `--description` override the file. `--client-email` is only valid for client-site deploys, not template publishes.

After publishing, open the template in the OhhWells canvas editor and edit every section once. That is the only test of runtime behaviour the checker cannot cover.

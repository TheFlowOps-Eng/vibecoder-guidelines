# 1 — Setup

## Prerequisites

- Node.js 18.17 or newer (20+ recommended), npm, git.
- This repo cloned anywhere (`git clone https://github.com/ohhwells/vibecoder-guidelines.git`). The docs below call that folder `$GUIDE`.
- An OhhWells account, needed only at publish time (`npx ohhwells-deploy login`).
- An Anthropic API key, needed only for the optional live AI review in [3-CHECKS.md](3-CHECKS.md). Never for building or for the checker.

## 1. Create the template from the starter

`$GUIDE/starter/` is the platform's starter template. It is pushed here automatically whenever the OhhWells team changes it, so it is always the current one; pull this repo before you start. It passes every check with 0 findings and is the reference for every pattern in [2-CONVENTIONS.md](2-CONVENTIONS.md).

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

## 5. Decide what you are publishing

Two different things ship from a project folder, and the CLI tells them apart **only** by whether a `template` key exists in `ohhwells.json` (or `--template` is passed):

| | A marketplace template | Your own (or a client's) site |
|---|---|---|
| Who can use it | Anyone on the platform picks it as a starting point | Only the account that owns it |
| Lives at | `https://<template-name>.ohhwells.site` | `https://<subdomain>.ohhwells.site` |
| `ohhwells.json` | `template` block, `category` required | `subdomain`, **no `template` block** |
| Publish with | §6 | §7 |

> **Do not add a `template` block to a site you are not publishing to the marketplace.** The block is sticky: once it is in the file, every later `npx ohhwells-deploy deploy` in that folder publishes a template, whatever you meant. A demo or client site put into the gallery is visible to every user of the platform. If you are building a site for one account, skip §5a and §6 entirely and go to §7.

### 5a. `ohhwells.json` for a template

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

## 6. Publish a template

Run every check in [3-CHECKS.md](3-CHECKS.md) first, then:

```bash
npx ohhwells-deploy login          # once; token stored in ~/.ohhwells/auth.json
npx ohhwells-deploy deploy         # from the template folder; reads ohhwells.json
```

The CLI zips the project source (excluding `node_modules`, `.next`, `out`, `.git`, `.vercel`, `.env*`), uploads it, and prints the URL. It does **not** build locally; the build runs server-side, so run `npm run build` yourself first. Flags `--template`, `--category`, `--display-name`, `--description` override the file. `--client-email` is only valid for client-site deploys, not template publishes.

After publishing, open the template in the OhhWells canvas editor and edit every section once. That is the only test of runtime behaviour the checker cannot cover.

## 7. Publishing your own site

This is the path for a site that belongs to one account — your own demo, or a site you are building for a client. Nothing here puts anything in the marketplace gallery.

### 7a. `ohhwells.json` for a site

A site needs `subdomain`, and nothing else. You rarely write the file by hand: `create` writes it after the site exists, and `deploy` writes it after the first successful deploy. Both merge into whatever is already there and never overwrite a value you set.

```json
{
  "subdomain": "bloom-yoga"
}
```

- `subdomain` — the site's address, `https://<subdomain>.ohhwells.site`. `--site=<subdomain>` overrides it, so the file is optional if you always pass the flag.
- `apiUrl` — optional, and written for you by `create`/`deploy`; it pins the folder to the backend you were logged in to. Leave it out and the CLI uses whichever environment you logged in to, which is what you want unless the team told you otherwise.
- **No `category`, `displayName` or `description`.** Those are template-only fields, and `category` has no meaning for a site.
- **No `template` block.** See the warning in §5.

### 7b. Create and deploy

```bash
npx ohhwells-deploy login                      # once; token stored in ~/.ohhwells/auth.json

npx ohhwells-deploy create \
  --subdomain=bloom-yoga \
  --name="Bloom Yoga" \
  --email=owner@bloomyoga.com                  # prompts for anything you omit

npm run build                                  # must pass; the CLI does not build locally
npx ohhwells-deploy deploy --site=bloom-yoga   # `deploy` is the default command
```

`create` registers the subdomain and provisions hosting; `deploy` zips the source (excluding `node_modules`, `.next`, `out`, `.git`, `.vercel`, `.env*`), uploads it, builds server-side, and prints the URL. It polls for up to five minutes before giving up on a build.

Site-only flags — these are rejected, with a non-zero exit, when the folder has a `template` block:

| Flag | Does |
|---|---|
| `--site <subdomain>` | Which site to deploy to. Overrides `ohhwells.json`. |
| `--client-email <email>` | Sends the claim invitation immediately after the deploy succeeds (§7c). |
| `--check` | Runs the publish sanity checks (bridge version, tagged fields) and exits without deploying. |
| `--tag` | Runs the AI field-tagging pass before deploying. Off by default. |
| `--dry-run` | Tags and prints the manifest, deploys nothing. Implies `--tag`. |
| `--api-key <key>` | Deploys headlessly, for CI. Or set `OHHWELLS_API_KEY`. |

`--template`, `--category`, `--display-name` and `--description` belong to the template path and do not apply here.

### 7c. Own account vs. client handover

**`create` always makes the logged-in account the owner.** `--name` and `--email` are recorded on the site record as contact details; neither gives the client any access, and **creating a site sends no email to anyone**.

So:

- **Building for yourself** — `create`, `deploy`, done. There is nothing to claim: the site is already on your account and already in your editor. Never run `claim` on it.
- **Handing over to a client** — `create`, `deploy`, then transfer ownership:

```bash
npx ohhwells-deploy claim --site=bloom-yoga --client-email=owner@bloomyoga.com
```

Or fold it into the deploy with `npx ohhwells-deploy deploy --site=bloom-yoga --client-email=owner@bloomyoga.com`. Either way the deploy is what succeeds or fails on its own; if the invitation errors afterwards, the CLI prints the exact `claim` command to retry.

Only the account that owns the site can start a handover, and only for a site — marketplace templates cannot be claimed.

### 7d. What the client receives

1. **An invitation email** ("Claim your site …") with a link. Sent at `claim` time — not at `create`, and not by a plain `deploy`.
2. The link is good for **14 days**. After that it is dead and you run `claim` again.
3. Opening it, the client sets a password or signs in. **Only then** does a second email arrive with a 6-digit code, valid for 10 minutes. Five wrong entries locks the code for 5 minutes; they can request at most 3 new codes in a 5-minute window.
4. Entering the code transfers ownership. **If the client is already signed in to OhhWells as the invited address, the link completes the handover on the spot and no code is sent** — a verified session on that account is stronger proof than a mailbox code.

Two consequences worth knowing before you send one:

- **Re-sending cancels every earlier link for that site.** Running `claim` again — same email or a different one — expires all pending invitations for that site before creating the new one. A client who sits on an old email will find a dead link, so send the new one to the person who will actually use it.
- **You keep access after the handover.** Ownership moves to the client, but your account stays on the site's access list with deploy rights: it still appears in your dashboard as a shared site, and a later `npx ohhwells-deploy deploy --site=<subdomain>` keeps working. Handing over is not handing back.

### 7e. Putting a site in the gallery, deliberately

`npx ohhwells-deploy publish --site=<subdomain>` is the one command that moves an existing site into the template gallery. It is not part of the flow above, and it is the second way a demo site becomes public. Only run it when the intent is a marketplace template.

import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs'
import {basename, dirname, join, sep} from 'node:path'

/**
 * Where templates are, resolved from where the checker is run:
 *  - inside a template folder (it has src/ and package.json): that one template is checked;
 *  - inside a folder that contains template folders (the templates repo): all of them are;
 *  - OHW_TEMPLATES_ROOT=<folder> overrides both.
 * The checker itself lives in its own repo and can be cloned anywhere.
 */
const cwd = process.cwd()
const cwdIsTemplate = !process.env.OHW_TEMPLATES_ROOT && existsSync(join(cwd, 'src')) && existsSync(join(cwd, 'package.json'))
export const ROOT = (process.env.OHW_TEMPLATES_ROOT ?? (cwdIsTemplate ? dirname(cwd) : cwd)).replace(/\/$/, '')
/** The template the checker was started inside, or null when run from a templates folder. */
export const CURRENT_TEMPLATE = cwdIsTemplate ? basename(cwd) : null

export function walk(dir, out = [], test = /\.(tsx|jsx)$/) {
  let entries
  try {
    entries = readdirSync(dir, {withFileTypes: true})
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out, test)
    else if (test.test(entry.name)) out.push(full)
  }
  return out
}

export function listTemplates() {
  if (CURRENT_TEMPLATE) return [CURRENT_TEMPLATE]
  return readdirSync(ROOT, {withFileTypes: true})
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'tools')
    .map((e) => e.name)
    .filter((n) => {
      try {
        return statSync(join(ROOT, n, 'src')).isDirectory()
      } catch {
        return false
      }
    })
    .sort()
}

/**
 * The newest bridge any template is pinned to — the yardstick for rule 20. Taken from the set
 * rather than from npm so the audit stays offline and judges the repo against itself.
 * Computed once per process.
 */
let latestBridge
export function latestBridgePin() {
  if (latestBridge !== undefined) return latestBridge
  let best = null
  for (const dir of readdirSync(ROOT, {withFileTypes: true}).filter((e) => e.isDirectory())) {
    try {
      const v = JSON.parse(readFileSync(join(ROOT, dir.name, 'package.json'), 'utf8')).dependencies?.['@ohhwells/bridge']
      if (!v || !/^\d/.test(v)) continue
      const cmp = (a, b) => a.split('.').map(Number).reduce((acc, n, i) => acc || n - Number(b.split('.')[i] ?? 0), 0)
      if (!best || cmp(v, best) > 0) best = v
    } catch {
      // No package.json, or unreadable — not this check's business.
    }
  }
  latestBridge = best
  return latestBridge
}

/**
 * The component files a page can actually reach, by following imports from `src/app`.
 *
 * Templates carry components nothing renders — blue-template ships both a `layout/Navbar` and a
 * `site/Nav`, and only the second is imported. Judging keys across dead files invents duplicates
 * that cannot occur, so the audit is scoped to what a visitor could load.
 */
export function reachableFiles(base) {
  const index = new Map()
  for (const f of walk(join(base, 'src'))) index.set(f, readFileSync(f, 'utf8'))

  const resolve = (spec, from) => {
    const rel = spec.startsWith('@/') ? join(base, 'src', spec.slice(2)) : spec.startsWith('.') ? join(from, '..', spec) : null
    if (!rel) return null
    for (const cand of [`${rel}.tsx`, `${rel}.jsx`, join(rel, 'index.tsx'), join(rel, 'index.ts')]) {
      if (index.has(cand)) return cand
    }
    return null
  }

  const seen = new Set()
  const queue = [...index.keys()].filter((f) => f.includes(`${sep}app${sep}`))
  while (queue.length) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)
    for (const m of (index.get(file) ?? '').matchAll(/from\s*['"]([^'"]+)['"]/g)) {
      const target = resolve(m[1], file)
      if (target && !seen.has(target)) queue.push(target)
    }
  }
  return seen
}

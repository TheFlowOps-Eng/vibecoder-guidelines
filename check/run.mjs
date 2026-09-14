#!/usr/bin/env node
/**
 * Static audit of the templates against 2-CONVENTIONS.md.
 *
 * The AI prompt feature never reads template HTML — it sees only what the bridge collects from
 * `data-ohw-*` markup. So every rule here is really the same rule: markup the model cannot see is
 * markup the model cannot edit, and it fails silently rather than erroring. The rules read the
 * source (no dev server, no build) and report which templates break which numbered rule.
 *
 * Run it from inside your template folder (checks that template), or from a folder that
 * contains template folders (checks all of them, or the ones named); OHW_TEMPLATES_ROOT overrides.
 *
 *   node <clone>/vibecoder-guidelines/check/run.mjs                  this template / every template
 *   node <clone>/vibecoder-guidelines/check/run.mjs my-template      one named template
 *   node <clone>/vibecoder-guidelines/check/run.mjs --errors         hide warnings
 *   node <clone>/vibecoder-guidelines/check/run.mjs --json           machine readable
 *   node <clone>/vibecoder-guidelines/check/run.mjs --rule 9,12      only these rules
 *   node <clone>/vibecoder-guidelines/check/run.mjs --gha            GitHub Actions annotations + step summary
 *
 * Exits 1 if any error-level violation is found. Warnings never fail the run: they degrade the
 * experience rather than break it, and some are judgement calls.
 *
 * Each rule lives in its own file under rules/ (NN-slug.mjs) exporting {rule, title, check};
 * shared scanning and the per-template context live under lib/. Drop a new NN-slug.mjs in
 * rules/ and it runs — nothing to register.
 */
import {readdirSync} from 'node:fs'
import {relative} from 'node:path'
import {pathToFileURL} from 'node:url'
import {listTemplates, ROOT} from './lib/fs.mjs'
import {buildContext} from './lib/context.mjs'
import {renderConsole, renderJson, renderGha} from './lib/report.mjs'

const RULES_DIR = new URL('./rules/', import.meta.url)

export async function loadRules(ruleFilter = null) {
  const files = readdirSync(RULES_DIR)
    .filter((f) => /^\d+-.*\.mjs$/.test(f))
    .sort()
  const rules = []
  for (const f of files) {
    const mod = await import(new URL(f, RULES_DIR))
    if (typeof mod.check !== 'function' || typeof mod.rule !== 'number') {
      throw new Error(`rules/${f} must export {rule: number, check: function}`)
    }
    rules.push(mod)
  }
  if (ruleFilter) {
    const known = new Set(rules.map((r) => r.rule))
    for (const n of ruleFilter) {
      if (!known.has(n)) throw new Error(`--rule ${n}: no such rule (have: ${[...known].join(', ')})`)
    }
    return rules.filter((r) => ruleFilter.includes(r.rule))
  }
  return rules
}

/** Core entry point — also imported by the AI reviewer, so the CLI below stays a thin wrapper. */
export async function runChecks(templates = null, {ruleFilter = null} = {}) {
  const rules = await loadRules(ruleFilter)
  const names = templates?.length ? templates : listTemplates()
  return names.map((name) => {
    const ctx = buildContext(name)
    const findings = []
    for (const mod of rules) {
      const report = (severity, message, file, line) =>
        findings.push({rule: mod.rule, severity, message, file: file ? relative(ctx.base, file) : null, line: line ?? null})
      mod.check(ctx, report)
    }
    return {template: name, findings}
  })
}

/** The CLI. */
export async function main() {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  const asGha = args.includes('--gha')
  const errorsOnly = args.includes('--errors')
  const ruleArg = args.find((a, i) => args[i - 1] === '--rule')
  const ruleFilter = ruleArg ? ruleArg.split(',').map(Number) : null
  const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--rule')

  const results = await runChecks(only, {ruleFilter})

  if (results.length === 0) {
    console.error(`No template found: ${ROOT} is not a template (no src/ + package.json) and has no template subfolders.`)
    console.error('Run from inside your template folder, or set OHW_TEMPLATES_ROOT to the folder that contains it.')
    process.exitCode = 1
    return
  }

  if (asJson) renderJson(results)
  else if (asGha) renderGha(results)
  else renderConsole(results, {errorsOnly})

  // exitCode, not exit(): exit() tears the process down before a piped stdout larger than the
  // pipe buffer (~64KB — the fleet-wide --json easily is) finishes flushing, truncating the JSON.
  process.exitCode = results.some((r) => r.findings.some((f) => f.severity === 'error')) ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}

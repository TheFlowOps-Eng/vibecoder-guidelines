#!/usr/bin/env node
/**
 * AI template review — the judgement-call complement to the deterministic checker.
 *
 * Per template: run the deterministic rules, gather the source slices that carry the bridge
 * contract, and ask Claude to (a) triage each deterministic finding as real or false-positive
 * and (b) report findings for the intent-level rules under ai/rules/*.md — link affordances,
 * should-this-be-editable, brand routing that never reaches pixels, and the rest of the class
 * of problems a regex can't judge.
 *
 * Run from the folder that contains your template folder(s), like the deterministic checker:
 *
 *   node ../vibecoder-guidelines/check/ai/run-ai-review.mjs my-template     one template, live API
 *   node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --mock          every template, fixture responses
 *   node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --mock --fixture bad-severity my-template
 *   node ../vibecoder-guidelines/check/ai/run-ai-review.mjs --json          machine readable
 *   --model <id>          override the model (default claude-sonnet-5)
 *   --effort <level>      low | medium | high | xhigh | max (default high)
 *   --comment-out <file>  write the PR-comment markdown body
 *   --summary <file>      write the report markdown (defaults to $GITHUB_STEP_SUMMARY)
 *   --set-key             store an Anthropic API key once (prompted, hidden) in ~/.ohhwells/ai-review.json
 *   --forget-key          delete the stored key
 *
 * The key is read from ANTHROPIC_API_KEY first (CI), then from the stored file — so a
 * vibecoder runs `--set-key` once and never exports anything.
 *
 * AI findings are ADVISORY: this script exits 0 whatever it finds. It exits 1 only on
 * operational failure (missing key, API/auth error) so a broken setup is visible in CI.
 *
 * Zero-dependency by design — this repo has no package.json, so the Anthropic Messages API is
 * called with global fetch rather than the SDK. Structured output is enforced server-side via
 * output_config.format (json_schema), so responses parse without leniency hacks.
 */
import {readdirSync, readFileSync, existsSync, appendFileSync, writeFileSync, mkdirSync, unlinkSync} from 'node:fs'
import {join} from 'node:path'
import {homedir} from 'node:os'
import {runChecks} from '../run.mjs'
import {listTemplates, walk, ROOT} from '../lib/fs.mjs'

const AI_DIR = new URL('.', import.meta.url).pathname
// Same directory the deploy CLI keeps its login in (~/.ohhwells/auth.json), same permissions.
const KEY_DIR = join(homedir(), '.ohhwells')
const KEY_FILE = join(KEY_DIR, 'ai-review.json')
// Sonnet-tier by choice: near-Opus judgement on code review at ~40% lower per-token cost, and
// the check is advisory so the trade is safe. `--model claude-opus-4-8` for a deeper pass.
const DEFAULT_MODEL = 'claude-sonnet-5'
const MAX_BUNDLE_BYTES = 60_000

/** The response contract — enforced by the API, not by parsing hope. */
const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings', 'triage'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['rule', 'severity', 'message', 'file'],
        properties: {
          rule: {type: 'string'},
          severity: {type: 'string', enum: ['warn', 'info']},
          message: {type: 'string'},
          file: {type: ['string', 'null']},
          line: {type: ['integer', 'null']},
        },
      },
    },
    triage: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['rule', 'file', 'verdict', 'note'],
        properties: {
          rule: {type: 'integer'},
          file: {type: ['string', 'null']},
          line: {type: ['integer', 'null']},
          verdict: {type: 'string', enum: ['real', 'false-positive', 'uncertain']},
          note: {type: 'string'},
        },
      },
    },
  },
}

function loadRuleSpecs() {
  return readdirSync(join(AI_DIR, 'rules'))
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => readFileSync(join(AI_DIR, 'rules', f), 'utf8'))
    .join('\n\n---\n\n')
}

/**
 * The source slices the review needs: every file carrying data-ohw-* markup, plus the CSS/TS
 * files defining the brand/color vars, size-capped with the largest files truncated first so
 * one giant page can't crowd out the rest.
 */
function gatherBundle(name) {
  const base = join(ROOT, name)
  const files = []
  for (const f of walk(join(base, 'src'), [], /\.(tsx?|jsx?|css)$/)) {
    const src = readFileSync(f, 'utf8')
    if (/data-ohw-/.test(src) || /--brand-|--color-/.test(src)) {
      files.push({path: f.slice(base.length + 1), src})
    }
  }
  let total = files.reduce((n, f) => n + f.src.length, 0)
  const sorted = [...files].sort((a, b) => b.src.length - a.src.length)
  for (const f of sorted) {
    if (total <= MAX_BUNDLE_BYTES) break
    const keep = Math.max(4_000, f.src.length - (total - MAX_BUNDLE_BYTES))
    if (keep < f.src.length) {
      total -= f.src.length - keep
      f.src = f.src.slice(0, keep) + '\n/* …TRUNCATED for size — judge only what is shown… */\n'
    }
  }
  return files
}

async function callApi({model, effort, system, user, apiKey}) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      // Thinking counts against max_tokens, and a full template bundle earns real thinking —
      // 16K truncated on the first live run; 32K leaves room for high-effort reasoning plus
      // the full JSON report.
      max_tokens: 32000,
      thinking: {type: 'adaptive'},
      system,
      output_config: {effort, format: {type: 'json_schema', schema: OUTPUT_SCHEMA}},
      messages: [{role: 'user', content: user}],
    }),
  })
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`)
  }
  const body = await res.json()
  if (body.stop_reason === 'refusal') {
    throw new Error('Anthropic API refused the request (stop_reason: refusal)')
  }
  if (body.stop_reason === 'max_tokens') {
    throw new Error('response truncated at max_tokens — raise the limit or shrink the bundle')
  }
  const text = body.content.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('no text block in API response')
  return JSON.parse(text)
}

/** The stored key, or null. A malformed file reads as no key rather than crashing the run. */
function readStoredKey() {
  try {
    const key = JSON.parse(readFileSync(KEY_FILE, 'utf8'))?.anthropicApiKey
    return typeof key === 'string' && key ? key : null
  } catch {
    return null
  }
}

function storeKey(key) {
  mkdirSync(KEY_DIR, {recursive: true, mode: 0o700})
  writeFileSync(KEY_FILE, JSON.stringify({anthropicApiKey: key}, null, 2) + '\n', {encoding: 'utf8', mode: 0o600})
}

/**
 * Read one line without echoing it. On a TTY the terminal is switched to raw mode so the pasted
 * key never lands in scrollback or shell history; when stdin is piped (`--set-key < file`) the
 * whole input is taken as the key.
 */
function promptSecret(question) {
  return new Promise((resolve, reject) => {
    const {stdin, stdout} = process
    stdin.setEncoding('utf8')
    if (!stdin.isTTY) {
      let data = ''
      stdin.on('data', (d) => (data += d))
      stdin.on('end', () => resolve(data.trim()))
      return
    }
    stdout.write(question)
    let buf = ''
    const cleanup = () => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.off('data', onData)
    }
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          cleanup()
          stdout.write('\n')
          resolve(buf.trim())
          return
        }
        if (ch === '\u0003') {
          cleanup()
          stdout.write('\n')
          reject(new Error('cancelled'))
          return
        }
        if (ch === '\u007f' || ch === '\b') buf = buf.slice(0, -1)
        else buf += ch
      }
    }
    stdin.setRawMode(true)
    stdin.resume()
    stdin.on('data', onData)
  })
}

function loadFixture(name, forced) {
  const candidates = [forced && `${forced}.json`, `${name}.json`, 'default.json'].filter(Boolean)
  for (const f of candidates) {
    const p = join(AI_DIR, 'fixtures', f)
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'))
  }
  throw new Error('no fixture found (fixtures/default.json is required for --mock)')
}

/** Whatever the model (or a fixture) returned, hold it to the advisory contract. */
function sanitize(raw) {
  const clampSeverity = (s) => (s === 'warn' || s === 'info' ? s : 'warn')
  const findings = (Array.isArray(raw?.findings) ? raw.findings : []).map((f) => ({
    rule: String(f.rule ?? 'ai-unknown'),
    severity: clampSeverity(f.severity),
    message: String(f.message ?? ''),
    file: f.file ?? null,
    line: Number.isInteger(f.line) ? f.line : null,
  }))
  const triage = (Array.isArray(raw?.triage) ? raw.triage : []).map((t) => ({
    rule: t.rule ?? null,
    file: t.file ?? null,
    line: Number.isInteger(t.line) ? t.line : null,
    verdict: ['real', 'false-positive', 'uncertain'].includes(t.verdict) ? t.verdict : 'uncertain',
    note: String(t.note ?? ''),
  }))
  return {findings, triage}
}

function renderMarkdown(results, {model, mock}) {
  const lines = ['## AI template review', '']
  lines.push(mock ? '_Mock run — fixture responses, no API calls._' : `_Model: \`${model}\` (effort: ${effort}). Advisory only — findings never fail the workflow._`, '')
  for (const r of results) {
    const head = r.error
      ? `⚠️ <b>${r.template}</b> — review failed: ${r.error}`
      : `<b>${r.template}</b> — ${r.findings.length} AI finding(s), ${r.deterministic.length} deterministic finding(s) triaged`
    lines.push(`<details><summary>${head}</summary>`, '')
    if (!r.error) {
      if (r.findings.length) {
        lines.push('**AI findings**', '', '| rule | severity | where | message |', '| --- | --- | --- | --- |')
        for (const f of r.findings) {
          const where = f.file ? `\`${f.file}${f.line ? ':' + f.line : ''}\`` : '—'
          lines.push(`| ${f.rule} | ${f.severity} | ${where} | ${f.message.replace(/\|/g, '\\|')} |`)
        }
        lines.push('')
      } else {
        lines.push('No AI findings.', '')
      }
      if (r.deterministic.length) {
        lines.push('**Deterministic-finding triage**', '', '| rule | where | verdict | note |', '| --- | --- | --- | --- |')
        for (const d of r.deterministic) {
          const t = r.triage.find((x) => x.rule === d.rule && x.file === d.file && (x.line ?? null) === (d.line ?? null))
            ?? r.triage.find((x) => x.rule === d.rule && x.file === d.file)
          const where = d.file ? `\`${d.file}${d.line ? ':' + d.line : ''}\`` : '—'
          lines.push(`| ${d.rule} | ${where} | ${t?.verdict ?? '—'} | ${(t?.note ?? '').replace(/\|/g, '\\|')} |`)
        }
        lines.push('')
      }
    }
    lines.push('</details>', '')
  }
  return lines.join('\n') + '\n'
}

// ---- CLI ----
const args = process.argv.slice(2)
const flagValue = (flag) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : null
}
const mock = args.includes('--mock')
const asJson = args.includes('--json')
const model = flagValue('--model') ?? DEFAULT_MODEL
const effort = flagValue('--effort') ?? 'high'
if (!['low', 'medium', 'high', 'xhigh', 'max'].includes(effort)) {
  console.error(`--effort ${effort}: use low | medium | high | xhigh | max`)
  process.exit(1)
}
const fixture = flagValue('--fixture')
const commentOut = flagValue('--comment-out')
const summaryOut = flagValue('--summary') ?? process.env.GITHUB_STEP_SUMMARY ?? null
const valueFlags = new Set(['--model', '--effort', '--fixture', '--comment-out', '--summary', '--templates'])
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]))
const fromFlag = (flagValue('--templates') ?? '').split(',').filter(Boolean)
const templates = [...positional, ...fromFlag].length ? [...positional, ...fromFlag] : listTemplates()

if (args.includes('--set-key')) {
  const key = await promptSecret('Paste your Anthropic API key (input is hidden): ').catch(() => null)
  if (key === null) process.exit(1) // Ctrl-C
  if (!key.startsWith('sk-ant-')) {
    console.error('That does not look like an Anthropic API key (they start with sk-ant-). Nothing saved.')
    process.exit(1)
  }
  storeKey(key)
  console.log(`Saved to ${KEY_FILE} (readable by you only). Live reviews will use it from now on.`)
  process.exit(0)
}
if (args.includes('--forget-key')) {
  if (existsSync(KEY_FILE)) unlinkSync(KEY_FILE)
  console.log(`Removed ${KEY_FILE}.`)
  process.exit(0)
}

// Environment first so CI and one-off overrides win; the stored key is the vibecoder default.
const apiKey = process.env.ANTHROPIC_API_KEY || readStoredKey()
if (!mock && !apiKey) {
  console.error(
    [
      'No Anthropic API key found. One of:',
      `  node ${process.argv[1]} --set-key     store your key once (prompted, hidden)`,
      '  ANTHROPIC_API_KEY=sk-ant-… node …      set it for one run / in CI',
      '  --mock                                 free fixture run, no key needed',
    ].join('\n'),
  )
  process.exit(1)
}

const ruleSpecs = loadRuleSpecs()
const system = [
  'You review website templates for an AI-editing platform. The deterministic checker has',
  'already run; your job is the judgement calls it cannot make, defined by the rule specs',
  'below, plus a triage verdict on each deterministic finding. Judge only from the source',
  'provided. Be precise about files and lines; do not restate deterministic findings as your',
  'own. Output follows the enforced JSON schema: `findings` uses the ai-* rule ids from the',
  'specs, `triage` has exactly one entry per deterministic finding.',
  '',
  ruleSpecs,
].join('\n')

/** Terminal rendering, matching the deterministic checker's look. Markdown is for files only. */
function renderConsole(r) {
  if (r.error) {
    console.log(`\n\x1b[31m✗ ${r.template}\x1b[0m  review failed: ${r.error}`)
    return
  }
  if (r.findings.length === 0 && r.triage.length === 0) {
    console.log(`\n\x1b[32m✓ ${r.template}\x1b[0m  no AI findings`)
    return
  }
  console.log(`\n\x1b[33m! ${r.template}\x1b[0m  ${r.findings.length} AI finding(s), ${r.triage.length} triage verdict(s)`)
  for (const f of r.findings) {
    const colour = f.severity === 'warn' ? '33' : '90'
    console.log(`    \x1b[${colour}m${f.rule}\x1b[0m  ${f.message}`)
    if (f.file) console.log(`      \x1b[90m${f.file}${f.line ? ':' + f.line : ''}\x1b[0m`)
  }
  for (const t of r.triage) {
    const colour = t.verdict === 'false-positive' ? '31' : t.verdict === 'real' ? '32' : '90'
    const where = t.file ? ` ${t.file}${t.line ? ':' + t.line : ''}` : ''
    console.log(`    \x1b[90mtriage rule ${t.rule}${where}:\x1b[0m \x1b[${colour}m${t.verdict}\x1b[0m  \x1b[90m${t.note}\x1b[0m`)
  }
}

if (mock && !asJson) {
  console.log('Mock run: fixture responses, no API calls. The findings below are fixture text, not a review of your template.')
}

let operationalFailure = false
const results = []
for (const name of templates) {
  const deterministic = (await runChecks([name]))[0].findings
  let raw
  let error = null
  try {
    if (mock) {
      raw = loadFixture(name, fixture)
    } else {
      const bundle = gatherBundle(name)
      const user = [
        `Template: ${name}`,
        '',
        'Deterministic findings (triage each):',
        JSON.stringify(deterministic, null, 1),
        '',
        'Source files:',
        ...bundle.map((f) => `\n===== ${f.path} =====\n${f.src}`),
      ].join('\n')
      raw = await callApi({model, effort, system, user, apiKey})
    }
  } catch (e) {
    error = e.message
    operationalFailure = true
  }
  const {findings, triage} = sanitize(raw ?? {})
  const result = {template: name, deterministic, findings, triage, error}
  results.push(result)
  if (!asJson) renderConsole(result)
}

const markdown = renderMarkdown(results, {model, mock})
if (asJson) console.log(JSON.stringify(results, null, 2))
if (summaryOut) appendFileSync(summaryOut, markdown)
if (commentOut) {
  writeFileSync(commentOut, `<!-- ai-template-review -->\n${markdown}`)
}
if (!asJson) {
  const total = results.reduce((n, r) => n + r.findings.length, 0)
  const failed = results.filter((r) => r.error).length
  console.log(`\n${total} AI finding(s) across ${results.length} template(s)${failed ? `, ${failed} review(s) failed` : ''}. Advisory only.${mock ? ' (mock run)' : ''}\n`)
}

process.exitCode = operationalFailure ? 1 : 0

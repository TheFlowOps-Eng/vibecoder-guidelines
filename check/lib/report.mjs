import {appendFileSync} from 'node:fs'

export function renderJson(results) {
  console.log(JSON.stringify(results, null, 2))
}

export function renderConsole(results, {errorsOnly = false} = {}) {
  for (const {template, findings} of results) {
    const errors = findings.filter((f) => f.severity === 'error')
    const warns = findings.filter((f) => f.severity === 'warn')
    const shown = errorsOnly ? errors : findings
    if (shown.length === 0) {
      console.log(`\n\x1b[32m✓ ${template}\x1b[0m`)
      continue
    }
    console.log(
      `\n\x1b[${errors.length ? '31' : '33'}m${errors.length ? '✗' : '!'} ${template}\x1b[0m  ${errors.length} error(s), ${warns.length} warning(s)`,
    )
    // Group by rule so a template with 40 unkeyed images reads as one line, not forty.
    const byRule = new Map()
    for (const f of shown) {
      const bucket = byRule.get(f.rule) ?? []
      bucket.push(f)
      byRule.set(f.rule, bucket)
    }
    for (const [rule, list] of [...byRule].sort((a, b) => a[0] - b[0])) {
      const colour = list[0].severity === 'error' ? '31' : '90'
      const head = `    \x1b[${colour}mrule ${rule}\x1b[0m  ${list[0].message}`
      console.log(list.length > 1 ? `${head}  \x1b[90m(+${list.length - 1} more)\x1b[0m` : head)
      for (const f of list.slice(0, 3)) {
        if (f.file) console.log(`      \x1b[90m${f.file}${f.line ? ':' + f.line : ''}\x1b[0m`)
      }
    }
  }

  const broken = results.filter((r) => r.findings.some((f) => f.severity === 'error'))
  const totalErrors = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'error').length, 0)
  console.log(
    `\n${broken.length} of ${results.length} templates have errors (${totalErrors} in total). Rules: 2-CONVENTIONS.md\n`,
  )
}

/** GitHub Actions annotation messages: %, CR and LF must be percent-encoded. */
const ghaEscape = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')

/**
 * CI output: one ::error/::warning workflow command per finding (inline PR annotations) plus a
 * per-template markdown report appended to $GITHUB_STEP_SUMMARY (stdout when unset, for local runs).
 */
export function renderGha(results) {
  for (const {template, findings} of results) {
    for (const f of findings) {
      const cmd = f.severity === 'error' ? 'error' : 'warning'
      const msg = ghaEscape(`[${template} · rule ${f.rule}] ${f.message}`)
      if (f.file) {
        const line = f.line ? `,line=${f.line}` : ''
        console.log(`::${cmd} file=${template}/${f.file}${line}::${msg}`)
      } else {
        console.log(`::${cmd}::${msg}`)
      }
    }
  }

  const lines = []
  const clean = results.filter((r) => r.findings.length === 0)
  const dirty = results.filter((r) => r.findings.length > 0)
  const totalErrors = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'error').length, 0)
  const totalWarns = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'warn').length, 0)

  lines.push('## Template convention checks', '')
  lines.push(
    totalErrors
      ? `❌ **${totalErrors} error(s)**, ${totalWarns} warning(s) across ${dirty.length} template(s).`
      : `✅ No errors. ${totalWarns} warning(s).`,
    '',
  )
  for (const {template, findings} of dirty) {
    const errors = findings.filter((f) => f.severity === 'error').length
    const icon = errors ? '❌' : '⚠️'
    lines.push(`<details><summary>${icon} <b>${template}</b> — ${errors} error(s), ${findings.length - errors} warning(s)</summary>`, '')
    lines.push('| rule | severity | where | message |', '| --- | --- | --- | --- |')
    for (const f of [...findings].sort((a, b) => a.rule - b.rule || (a.file ?? '').localeCompare(b.file ?? ''))) {
      const where = f.file ? `\`${f.file}${f.line ? ':' + f.line : ''}\`` : '—'
      lines.push(`| ${f.rule} | ${f.severity} | ${where} | ${f.message.replace(/\|/g, '\\|')} |`)
    }
    lines.push('', '</details>', '')
  }
  if (clean.length) lines.push(`✓ ${clean.length} template(s) clean: ${clean.map((r) => r.template).join(', ')}`, '')

  const summary = lines.join('\n') + '\n'
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
  else console.log(summary)
}

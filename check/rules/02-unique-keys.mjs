import {attrValue, isKebab, isChromeFile} from '../lib/scan.mjs'

export const rule = 2
export const title = 'Keys are kebab-case and globally unique across the site'

export function check(ctx, report) {
  /** key -> where it is authored, for the duplicate check. */
  const contentKeys = new Map()

  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      const key = attrValue(tag.attrs, 'data-ohw-key')
      // A duplicate makes two elements share one stored value, so editing either changes both.
      // Only literal keys can be judged here; a computed one (`{`${sectionId}-title`}`) resolves
      // per placement and is fine by construction. Dead files are skipped — duplicates across
      // components nothing renders cannot occur.
      if (key && key !== '{expr}' && key !== '' && ctx.live.has(file)) {
        const here = ctx.rel(file)
        const seen = contentKeys.get(key)
        if (seen) {
          // The desktop navbar and the mobile drawer render the same links and deliberately share
          // their keys so the two stay in step — the same is true of a footer rendered twice. Only
          // flag a repeat when neither side is chrome.
          const mirror = isChromeFile(here) && isChromeFile(seen.file)
          if (!mirror) {
            report('error', `\`data-ohw-key="${key}"\` is used twice — both elements share one stored value (also ${seen.file}:${seen.line})`, file, tag.line)
          }
        } else {
          contentKeys.set(key, {file: here, line: tag.line})
        }
        if (!isKebab(key)) report('warn', `key "${key}" is not kebab-case`, file, tag.line)
      }
    }
  }
}

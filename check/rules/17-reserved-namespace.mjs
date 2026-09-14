import {RESERVED_ATTRS, RESERVED_ATTR_PREFIXES} from '../lib/constants.mjs'
import {attrValue} from '../lib/scan.mjs'

export const rule = 17
export const title = 'Never author bridge-injected attributes or __ohw_* keys'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    for (const tag of ctx.tagsFor(file)) {
      for (const reserved of RESERVED_ATTRS) {
        if (new RegExp(`(^|\\s)${reserved}(\\s|=|$)`).test(tag.attrs)) {
          report('error', `authors bridge-injected \`${reserved}\``, file, tag.line)
        }
      }
      for (const prefix of RESERVED_ATTR_PREFIXES) {
        const m = new RegExp(`(^|\\s)(${prefix}[\\w-]*)(\\s|=|$)`).exec(tag.attrs)
        if (m) report('error', `authors bridge-injected \`${m[2]}\` (\`${prefix}*\` is a bridge-written family)`, file, tag.line)
      }
      const key = attrValue(tag.attrs, 'data-ohw-key')
      if (key && key.startsWith('__ohw_')) {
        report('error', `authors reserved key \`${key}\``, file, tag.line)
      }
    }
  }
}

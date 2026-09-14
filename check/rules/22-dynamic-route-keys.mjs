import {attrExpr} from '../lib/scan.mjs'

export const rule = 22
export const title = 'Keys and section ids in dynamic routes interpolate the route param'

export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    // A file under a dynamic route segment ([slug]/page.tsx) renders once PER URL.
    // A key that does not interpolate the route entity is one stored value shared by every
    // page of the route: editing the name on /team/a rewrites it on /team/b. Heuristic: the
    // key's expression must mention the param name somewhere (`member.slug`, `params.slug`);
    // an index alone (`${i + 1}`) still collides across pages and is flagged too.
    const dynSeg = /\[([^\]/]+)\]/.exec(ctx.rel(file))
    if (!dynSeg) continue
    const dynParam = dynSeg[1].replace(/^\.\.\./, '')

    for (const tag of ctx.tagsFor(file)) {
      for (const name of ['data-ohw-key', 'data-ohw-href-key', 'data-ohw-section', 'ohwKey', 'sectionId']) {
        const literal = new RegExp(`(^|\\s)${name}="([^"]*)"`).exec(tag.attrs)
        if (literal) {
          report('error', `\`${name}="${literal[2]}"\` in a dynamic route — every [${dynParam}] page shares this stored value; interpolate the ${dynParam}`, file, tag.line)
          continue
        }
        const expr = attrExpr(tag.attrs, name)
        if (expr !== null && !expr.includes(dynParam)) {
          report('error', `\`${name}={${expr.slice(0, 60)}}\` in a dynamic route never mentions "${dynParam}" — pages of this route share the stored value`, file, tag.line)
        }
      }
    }
  }
}

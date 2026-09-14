import {existsSync, readFileSync} from 'node:fs'
import {join, relative} from 'node:path'
import {ROOT, walk, latestBridgePin, reachableFiles} from './fs.mjs'
import {scanTags} from './scan.mjs'

/**
 * Everything the rule modules need about one template, computed once. Splitting the checker into
 * one file per rule must not mean re-walking the tree and re-scanning JSX once per rule — the
 * expensive passes (file walks, tag scans, the import-graph reachability set) live here and the
 * rules only iterate.
 */
export function buildContext(name) {
  const base = join(ROOT, name)
  const sources = new Map()
  const read = (file) => {
    let src = sources.get(file)
    if (src === undefined) {
      src = readFileSync(file, 'utf8')
      sources.set(file, src)
    }
    return src
  }

  const tags = new Map()
  const tagsFor = (file) => {
    let t = tags.get(file)
    if (t === undefined) {
      t = scanTags(read(file))
      tags.set(file, t)
    }
    return t
  }

  const tsxFiles = walk(join(base, 'src'))
  const cssFiles = walk(join(base, 'src'), [], /\.css$/)
  const tsLikeFiles = walk(join(base, 'src'), [], /\.tsx?$/)
  const allSourceFiles = walk(join(base, 'src'), [], /\.(tsx?|jsx?)$/)
  const allCss = cssFiles.map(read).join('\n')

  return {
    name,
    base,
    /** Path relative to the template folder — the shape findings carry. */
    rel: (file) => relative(base, file),
    read,
    tagsFor,
    tsxFiles,
    cssFiles,
    /** .ts + .tsx — vars can be defined in plain .ts too (next/font's `variable:` in lib/fonts.ts). */
    tsLikeFiles,
    /** .ts/.tsx/.js/.jsx — content files carry placeholder strings the JSX walk never sees. */
    allSourceFiles,
    allCss,
    /** Sources restyle vars may live in: all CSS plus the .ts/.tsx files. */
    varSources: [allCss, ...tsLikeFiles.map(read)],
    pageFiles: walk(join(base, 'src', 'app')).filter((f) => f.endsWith('/page.tsx')),
    /** Files a visitor could actually load, by import reachability from src/app. */
    live: reachableFiles(base),
    latestBridge: latestBridgePin(),
    pkgPath: join(base, 'package.json'),
    layoutPath: join(base, 'src', 'app', 'layout.tsx'),
    envExamplePath: join(base, '.env.example'),
    exists: existsSync,
  }
}

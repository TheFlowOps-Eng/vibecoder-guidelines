import {attrValue, elementInner, scanTags} from '../lib/scan.mjs'

export const rule = 16
export const title = 'Forms: named inputs, no editables on inputs, no pre-tagged labels'

/**
 * The bridge owns everything inside `<form data-ohw-editable="form">`: it keys fields by their
 * `name`, synthesizes `<field>-label` labels, and persists `<formKey>-fields`/`<formKey>-success`.
 * (The form's own missing key is rule 1's finding — the bridge hard-requires it.)
 */
export function check(ctx, report) {
  for (const file of ctx.tsxFiles) {
    const src = ctx.read(file)
    for (const tag of ctx.tagsFor(file)) {
      if (attrValue(tag.attrs, 'data-ohw-editable') !== 'form') continue
      const inner = elementInner(src, tag, {exact: true})
      if (inner === null) continue

      for (const child of scanTags(inner)) {
        const childLine = tag.line + inner.slice(0, child.index).split('\n').length - 1
        const isInput = ['input', 'textarea', 'select', 'Input', 'Textarea', 'Select'].includes(child.name)

        if (isInput) {
          // Field identity is `name` first; without one the bridge falls back to an unstable
          // `field-${Date.now()}` key (form-fields.ts) and stored field content orphans on
          // every render.
          const type = attrValue(child.attrs, 'type')
          const isData = !['submit', 'button', 'hidden', 'reset'].includes(type ?? '')
          if (isData && attrValue(child.attrs, 'name') === null) {
            report('error', `form ${child.name} without \`name\` — the bridge keys fields by name; unnamed fields get an unstable generated key`, file, childLine)
          }
          // `data-ohw-editable` ON an input is NOT flagged: the bridge guards form controls in
          // the save path (isFormControl in OhhwellsBridge.tsx — a control never writes content
          // under its key), and templates tag inputs deliberately for placeholder editing
          // (local-fnb contact fields, tutor newsletter).
        }

        // Pre-tagged labels are NOT flagged: the bridge leaves an already-tagged label
        // untouched, and templates use exactly that to keep visual parity — a tagged hidden
        // label stops the field pass injecting a visible one (drserene FooterMinimal spells
        // this out). Whether an injected label would hurt a given design is the AI review's
        // judgement, not a static rule.
      }
    }
  }
}

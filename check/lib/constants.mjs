/** Modes the bridge understands. Anything else is coerced to plain text, losing its semantics.
 *  `link` is in the bridge's apply/collect switch (collect-editable-nodes.ts, OhhwellsBridge.tsx)
 *  even though the primary link contract is `data-ohw-href-key`. */
export const EDITABLE_MODES = new Set(['text', 'plain', 'image', 'bg-image', 'video', 'icon', 'map', 'form', 'link'])

/** Attributes the bridge injects at runtime. A template authoring one corrupts bridge state. */
export const RESERVED_ATTRS = [
  'data-ohw-instance',
  'data-ohw-section-removed',
  'data-ohw-ai-generated',
  'data-ohw-ai-removed',
  'data-ohw-ai-replaced-by',
  'data-ohw-ai-template-hidden',
  'data-ai-section',
  'data-ohw-card',
  'data-ohw-section-container',
  // NOT listed: the dual-purpose attributes templates legitimately author and the bridge also
  // writes — `data-ohw-socials-row` (stamped on inferred rows in socials-items.ts, authored as
  // the socials hook), `data-ohw-footer-col`, `data-ohw-map-query`, and `data-ohw-placeholder`
  // (the wordmark pattern).
  'data-ohw-selected',
  'data-ohw-hovered',
  'data-ohw-editing',
  'data-ohw-social-item',
  'data-ohw-placeholder-edit',
  'data-ohw-empty-label',
  'data-ohw-can-drag',
  'data-ohw-item-dragging',
  'data-ohw-footer-press-drag',
]

/** Bridge-written attribute families — reserved by prefix (section-styles.ts, form-fields.ts, forms.ts). */
export const RESERVED_ATTR_PREFIXES = ['data-ohw-style-', 'data-ohw-field-', 'data-ohw-form-']

/**
 * Site-wide chrome. These are deliberately one section across every page — the bridge protects
 * them by exact name (undeletable, and they survive whole-page generation), so a shared id here is
 * the requirement rather than the collision.
 */
export const CHROME_IDS = new Set(['navbar', 'footer', 'global-navbar', 'global-footer'])

/** The palette every template must define for `update_brand` to repaint anything. */
export const REQUIRED_BRAND_VARS = [
  '--brand-primary',
  '--brand-accent',
  '--brand-background',
  '--brand-text',
  '--brand-surface',
  '--brand-border',
  '--brand-font-heading',
  '--brand-font-body',
]

/** Baked tokens generated sections and the scheduling widget read to inherit the template look. */
export const REQUIRED_COLOR_VARS = ['--color-primary', '--color-accent', '--font-body', '--font-display']

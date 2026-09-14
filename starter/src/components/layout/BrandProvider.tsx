import type { ReactNode } from 'react';
import { brand } from '@/content/brand';

/**
 * BrandProvider — emits brand design tokens as CSS custom properties at :root.
 * Server-rendered (no client JS). Components reference tokens via var(--brand-*).
 *
 * Token naming contract (matches core/CLAUDE.md):
 *   Colors  → --brand-{kebab-key}   e.g. --brand-primary, --brand-text-muted
 *   Fonts   → --brand-font-{key}    e.g. --brand-font-heading, --brand-font-body
 *   Spacing → --spacing-{key}       e.g. --spacing-section, --spacing-container
 *   Radii   → --radius-{key}        e.g. --radius-md, --radius-lg
 *
 * To re-skin: edit src/content/brand.ts only.
 */

function kebab(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

// Maps each brand colour key to a site-brand override role. A mapped colour is emitted as
// `var(--ohw-brand-<role>, <default>)`, so with no brand applied the template default wins
// (appearance unchanged) and a site-wide AI brand change restyles by role. Unmapped keys
// (secondary, onPrimary, rgba/overlay tokens) keep their literal default.
const BRAND_ROLE: Record<string, string> = {
  primary: 'primary',
  accent: 'accent',
  background: 'light',
  text: 'dark',
  surface: 'surface',
  border: 'border',
  divider: 'border',
  textMuted: 'muted',
  dark: 'dark',
};

const cssVars = (() => {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(brand.colors)) {
    const role = BRAND_ROLE[key];
    lines.push(`--brand-${kebab(key)}: ${role ? `var(--ohw-brand-${role}, ${value})` : value};`);
  }

  // @ohhwells/bridge's SchedulingWidget reads these directly (--color-*,
  // --font-body, --font-display, --radius, --fs-section-h2,
  // --font-weight-heading), independent of this template's --brand-*
  // naming convention. Colours route through the same brand-override roles.
  lines.push(`--color-primary: var(--ohw-brand-primary, ${brand.colors.primary});`);
  lines.push(`--color-light: var(--ohw-brand-light, ${brand.colors.background});`);
  lines.push(`--color-dark: var(--ohw-brand-dark, ${brand.colors.text});`);
  lines.push(`--color-accent: var(--ohw-brand-accent, ${brand.colors.accent});`);
  lines.push(`--font-body: ${brand.fonts.body};`);
  lines.push(`--font-display: ${brand.fonts.heading};`);
  lines.push(`--radius: ${brand.borderRadius.md};`);
  lines.push(`--fs-section-h2: ${brand.headingScale.sectionH2};`);
  lines.push(`--font-weight-heading: ${brand.weight.heading};`);

  for (const [key, value] of Object.entries(brand.fonts)) {
    lines.push(`--brand-font-${key}: ${value};`);
  }

  for (const [key, value] of Object.entries(brand.spacing)) {
    lines.push(`--spacing-${key}: ${value};`);
  }

  for (const [key, value] of Object.entries(brand.borderRadius)) {
    lines.push(`--radius-${key}: ${value};`);
  }

  return `:root {\n  ${lines.join('\n  ')}\n}`;
})();

export function BrandProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </>
  );
}

// ─── Content Types ─────────────────────────────────────────────────────────
// Page-specific types live in section layout folders.
// Shared page-level types used across multiple pages remain here.

export interface ServiceItem {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ServicesPageContent {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  services: ServiceItem[];
}

export interface AboutPageContent {
  eyebrow?: string;
  headline: string;
  body: string[];
  image?: string;
  stats?: StatItem[];
}

// ─── Global Types ──────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

/** Literal shown when the business has not set a real name yet (OHH-521 / OHH-650). */
export const PLACEHOLDER_BUSINESS_NAME = 'Business name';

export interface LogoConfig {
  /** Business name wordmark / image alt. */
  text: string;
  image?: string;
  /** True while `text` is still the placeholder (or empty → rendered as placeholder). */
  isPlaceholder?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  layout: 'minimal';
  content: {
    logoUrl?: string;
    tagline?: string;
    copyrightText: string;
    /** Column heading for the links column (`footer-0-heading`). */
    linksHeading?: string;
    links: FooterLink[];
    socials?: SocialLink[];
  };
}

export interface GlobalContent {
  siteName: string;
  logo: LogoConfig;
  navItems: NavItem[];
  ctaButton?: { label: string; href: string };
  footer: FooterContent;
  socials: SocialLink[];
}

// ─── Brand Types ───────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  onPrimary: string;
  primarySurface: string;
  primaryBorder: string;
  onPrimaryMuted: string;
  onPrimaryFaint: string;
  navbarBackground: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface BrandSpacing {
  section: string;
  container: string;
  gap: string;
}

export interface BrandRadius {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface BrandWeight {
  // Every h1/h2/h3 in the codebase uses this weight — registered so
  // components (and the shared scheduling widget) can reference one token
  // instead of hardcoding 400 per heading.
  heading: number;
}

export interface BrandHeadingScale {
  // Canonical "section intro" h2 size (mirrors .section-heading in
  // globals.css). Individual page sections still hand-tune their own
  // hero-scale headlines — this is the size external/shared components
  // (e.g. the scheduling widget) inherit.
  sectionH2: string;
}

export interface Brand {
  colors: BrandColors;
  fonts: BrandFonts;
  spacing: BrandSpacing;
  borderRadius: BrandRadius;
  weight: BrandWeight;
  headingScale: BrandHeadingScale;
}

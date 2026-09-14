import type { FooterSharedContent } from '../../Footer.types';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSocial {
  platform: string;
  url: string;
}

export interface FooterMinimalContent extends FooterSharedContent {
  /** Column heading shown above footer links (OHH-468 — hide/show via toolbar). */
  linksHeading?: string;
  links: FooterLink[];
  socials?: FooterSocial[];
}

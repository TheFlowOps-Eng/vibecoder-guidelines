import type { FooterMinimalContent } from '@/components/layout/Footer/layouts/FooterMinimal/FooterMinimal.types';
import { PLACEHOLDER_BUSINESS_NAME, type GlobalContent } from '@/types/content';

export const globalContent: GlobalContent = {
  siteName: PLACEHOLDER_BUSINESS_NAME,
  logo: {
    text: PLACEHOLDER_BUSINESS_NAME,
    isPlaceholder: true,
  },
  navItems: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ],
  ctaButton: {
    label: 'Get Started',
    href: '/contact',
  },
  footer: {
    layout: 'minimal' as const,
    content: {
      tagline: 'A minimal base for every vibe-coded site.',
      copyrightText: '© 2026 OhhWells. All rights reserved.',
      linksHeading: 'Explore',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' },
      ],
      socials: [
        { platform: 'instagram', url: 'https://instagram.com/ohhwells' },
        { platform: 'linkedin', url: 'https://linkedin.com/company/ohhwells' },
        { platform: 'twitter', url: 'https://twitter.com/ohhwells' },
      ],
    } satisfies FooterMinimalContent,
  },
  socials: [
    { platform: 'instagram', url: 'https://instagram.com/ohhwells' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/ohhwells' },
    { platform: 'twitter', url: 'https://twitter.com/ohhwells' },
  ],
};

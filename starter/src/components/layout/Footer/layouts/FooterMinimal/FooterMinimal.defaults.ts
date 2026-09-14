import type { FooterMinimalContent } from './FooterMinimal.types';

export const FooterMinimalDefaults: FooterMinimalContent = {
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
  ],
};

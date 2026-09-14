import type { ServicesPageContent } from '@/types/content';

export const servicesContent: ServicesPageContent = {
  eyebrow: 'Services',
  headline: 'What we build with it.',
  subheadline:
    'From yoga studios to SaaS products — any industry can be skinned onto this template. Each fork gets unique photography, copy, and brand tokens.',
  services: [
    {
      title: 'Brand Identity',
      description:
        'Define the visual personality: colors, fonts, spacing, and border radius. One brand.ts file, infinite possibilities.',
    },
    {
      title: 'Web Design',
      description:
        'Section-based layouts with typed props, responsive by default, and built for the OhhWells content editor.',
    },
    {
      title: 'Copywriting',
      description:
        'Real, industry-specific copy written in content files. No placeholder text. No lorem ipsum. Just words that convert.',
    },
    {
      title: 'Development',
      description:
        'Next.js App Router, TypeScript everywhere, server components where possible, and a clean component hierarchy.',
    },
    {
      title: 'SEO Setup',
      description:
        'Metadata builder, auto-generated sitemap, robots.txt, and Open Graph images configured out of the box.',
    },
    {
      title: 'Launch Support',
      description:
        'Branded loading states, error pages, 404 pages, and deployment-ready configuration for Vercel or any host.',
    },
  ],
};

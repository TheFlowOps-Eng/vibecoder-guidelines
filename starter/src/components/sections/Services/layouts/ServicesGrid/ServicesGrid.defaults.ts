import type { ServicesGridContent } from './ServicesGrid.types';

export const ServicesGridDefaults: ServicesGridContent = {
  eyebrow: "What's included",
  heading: 'Every layer, already built.',
  subheading:
    'Six core conventions that make every OhhWells site consistent, editable, and fast to launch.',
  items: [
    {
      title: 'Brand Layer',
      description:
        'All visual tokens — colors, fonts, spacing — live in brand.ts. One file controls the entire look of the site.',
    },
    {
      title: 'Content Convention',
      description:
        'Content lives in typed TS objects. Components receive data via props. The OhhWells Content API can override any field.',
    },
    {
      title: 'Ownership Model',
      description:
        'Developers own the template structure. Clients own the data. Clean handoff, zero conflicts.',
    },
    {
      title: 'App Router',
      description:
        'Built on Next.js App Router with server components, typed metadata, and SEO utilities baked in.',
    },
    {
      title: 'Typed Everywhere',
      description:
        'Every content shape has an interface. Catch errors at build time, not in production.',
    },
    {
      title: 'Deploy Ready',
      description:
        'Sitemap, robots.txt, OG images, 404, error pages. Configured out of the box for Vercel or any host.',
    },
  ],
};

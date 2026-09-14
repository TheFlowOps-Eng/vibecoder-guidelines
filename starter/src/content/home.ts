import type { HeroCenteredContent } from '@/components/sections/Hero/layouts/HeroCentered/HeroCentered.types';
import type { ServicesGridContent } from '@/components/sections/Services/layouts/ServicesGrid/ServicesGrid.types';
import type { AboutSplitContent } from '@/components/sections/About/layouts/AboutSplit/AboutSplit.types';
import type { TestimonialsGridContent } from '@/components/sections/Testimonials/layouts/TestimonialsGrid/TestimonialsGrid.types';
import type { CTACenteredContent } from '@/components/sections/CTA/layouts/CTACentered/CTACentered.types';

export const homeContent = {
  hero: {
    layout: 'centered' as const,
    content: {
      headline: 'A minimal base for every vibe-coded site.',
      subheadline:
        'Clean structure, content-driven architecture, and a brand layer ready for any client. Swap colors, fonts, and copy — nothing else changes.',
      ctaLabel: 'Start a project',
      ctaHref: '/contact',
      backgroundImageUrl:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=900&fit=crop&q=80',
    } satisfies HeroCenteredContent,
  },
  services: {
    layout: 'grid' as const,
    content: {
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
            'Every content shape has an interface in types/content.ts. Catch errors at build time, not in production.',
        },
        {
          title: 'Deploy Ready',
          description:
            'Sitemap, robots.txt, OG images, 404, error pages. Configured out of the box for Vercel or any host.',
        },
      ],
    } satisfies ServicesGridContent,
  },
  about: {
    layout: 'split' as const,
    content: {
      heading: 'Built once. Customised forever.',
      body: [
        'The OhhWells starter is a neutral canvas — no opinionated colors, no industry-specific imagery. It gives you the architecture: brand tokens, content conventions, typed props, and App Router scaffolding.',
        'From here, every site fork gets a unique brand, real photography, and genuine copy — all while staying compatible with the OhhWells editor.',
      ].join('\n\n'),
      imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1000&fit=crop&q=80',
      imagePosition: 'left',
    } satisfies AboutSplitContent,
  },
  testimonials: {
    layout: 'grid' as const,
    content: {
      heading: 'Builders who rely on it.',
      subheading:
        'Developers who build on OhhWells trust the base template. Clients who use it love the flexibility.',
      items: [
        {
          quote:
            "The content convention means I can hand off to any client knowing they won't accidentally break the layout.",
          author: 'Alex Kim',
          role: 'Web Developer',
        },
        {
          quote:
            "Switching brand tokens takes two minutes. I've launched five client sites from this base in a month.",
          author: 'Sophie Laurent',
          role: 'Freelance Designer',
        },
        {
          quote:
            'TypeScript interfaces on every content shape means zero runtime surprises. It just works.',
          author: 'Marcus Webb',
          role: 'Frontend Engineer',
        },
      ],
    } satisfies TestimonialsGridContent,
  },
  cta: {
    layout: 'centered' as const,
    content: {
      headline: 'Fork it. Brand it. Ship it.',
      subheadline:
        'The base template is your starting point. Every client gets a unique skin on top of the same solid architecture.',
      ctaLabel: 'Start a project',
      ctaHref: '/contact',
      secondaryCtaLabel: 'View on GitHub',
      secondaryCtaHref: '#',
    } satisfies CTACenteredContent,
  },
};

import type { AboutPageContent } from '@/types/content';

export const aboutContent: AboutPageContent = {
  eyebrow: 'About',
  headline: 'The story behind the starter.',
  body: [
    'The OhhWells starter template was built to solve one problem: every vibe-coded site should feel uniquely designed, but share the same reliable architecture underneath.',
    'Brand tokens, content conventions, and TypeScript types — so developers can move fast and clients can edit freely through the OhhWells platform.',
    'This template is the base layer. Everything on top — colors, fonts, imagery, copy — is unique to each client. The structure stays the same.',
  ],
  image:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=1000&fit=crop&q=80',
  stats: [
    { value: '2025', label: 'Year created' },
    { value: '100+', label: 'Sites launched' },
    { value: '3', label: 'Core conventions' },
  ],
};

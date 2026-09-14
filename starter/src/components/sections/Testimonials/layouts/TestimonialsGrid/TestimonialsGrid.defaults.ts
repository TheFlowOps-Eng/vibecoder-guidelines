import type { TestimonialsGridContent } from './TestimonialsGrid.types';

export const TestimonialsGridDefaults: TestimonialsGridContent = {
  heading: 'Builders who rely on it.',
  subheading: 'What template authors say about the platform defaults.',
  items: [
    {
      quote:
        'The content convention means I can hand off to any client knowing they won\'t accidentally break the layout.',
      author: 'Alex Kim',
      role: 'Web Developer',
    },
    {
      quote:
        'Switching brand tokens takes two minutes. I\'ve launched five client sites from this base in a month.',
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
};

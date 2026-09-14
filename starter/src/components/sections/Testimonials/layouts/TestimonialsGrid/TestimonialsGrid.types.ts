import type { TestimonialsSharedContent } from '../../Testimonials.types';

export interface TestimonialsGridItem {
  quote: string;
  author: string;
  role?: string;
  photoUrl?: string;
}

export interface TestimonialsGridContent extends TestimonialsSharedContent {
  items: TestimonialsGridItem[];
}

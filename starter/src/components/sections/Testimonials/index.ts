import { TestimonialsGrid } from './layouts/TestimonialsGrid/TestimonialsGrid';
import { TestimonialsGridDefaults } from './layouts/TestimonialsGrid/TestimonialsGrid.defaults';

export const TestimonialsLayouts = {
  grid: { component: TestimonialsGrid, defaults: TestimonialsGridDefaults },
} as const;

export type TestimonialsLayoutKey = keyof typeof TestimonialsLayouts;

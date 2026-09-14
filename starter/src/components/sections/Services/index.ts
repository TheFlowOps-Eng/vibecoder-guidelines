import { ServicesGrid } from './layouts/ServicesGrid/ServicesGrid';
import { ServicesGridDefaults } from './layouts/ServicesGrid/ServicesGrid.defaults';

export const ServicesLayouts = {
  grid: { component: ServicesGrid, defaults: ServicesGridDefaults },
} as const;

export type ServicesLayoutKey = keyof typeof ServicesLayouts;

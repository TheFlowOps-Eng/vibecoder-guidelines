import { CTACentered } from './layouts/CTACentered/CTACentered';
import { CTACenteredDefaults } from './layouts/CTACentered/CTACentered.defaults';

export const CTALayouts = {
  centered: { component: CTACentered, defaults: CTACenteredDefaults },
} as const;

export type CTALayoutKey = keyof typeof CTALayouts;

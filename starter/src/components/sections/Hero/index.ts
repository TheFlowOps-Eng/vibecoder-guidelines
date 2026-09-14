import { HeroCentered } from './layouts/HeroCentered/HeroCentered';
import { HeroCenteredDefaults } from './layouts/HeroCentered/HeroCentered.defaults';

export const HeroLayouts = {
  centered: { component: HeroCentered, defaults: HeroCenteredDefaults },
} as const;

export type HeroLayoutKey = keyof typeof HeroLayouts;

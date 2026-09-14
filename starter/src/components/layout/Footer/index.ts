import { FooterMinimal } from './layouts/FooterMinimal/FooterMinimal';
import { FooterMinimalDefaults } from './layouts/FooterMinimal/FooterMinimal.defaults';

export const FooterLayouts = {
  minimal: { component: FooterMinimal, defaults: FooterMinimalDefaults },
} as const;

export type FooterLayoutKey = keyof typeof FooterLayouts;

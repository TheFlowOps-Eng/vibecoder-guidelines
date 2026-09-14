import { AboutSplit } from './layouts/AboutSplit/AboutSplit';
import { AboutSplitDefaults } from './layouts/AboutSplit/AboutSplit.defaults';

export const AboutLayouts = {
  split: { component: AboutSplit, defaults: AboutSplitDefaults },
} as const;

export type AboutLayoutKey = keyof typeof AboutLayouts;

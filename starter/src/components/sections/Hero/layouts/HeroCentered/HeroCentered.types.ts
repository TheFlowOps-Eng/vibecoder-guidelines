import type { HeroSharedContent } from '../../Hero.types';

export interface HeroCenteredContent extends HeroSharedContent {
  ctaLabel: string;
  ctaHref: string;
  backgroundImageUrl?: string;
}

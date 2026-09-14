import type { CTASharedContent } from '../../CTA.types';

export interface CTACenteredContent extends CTASharedContent {
  backgroundColor?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

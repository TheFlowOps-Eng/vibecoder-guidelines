import type { AboutSharedContent } from '../../About.types';

export interface AboutSplitContent extends AboutSharedContent {
  imageUrl: string;
  imagePosition: 'left' | 'right';
}

import type { ServicesSharedContent } from '../../Services.types';

export interface ServicesGridItem {
  title: string;
  description: string;
  iconUrl?: string;
}

export interface ServicesGridContent extends ServicesSharedContent {
  items: ServicesGridItem[];
}

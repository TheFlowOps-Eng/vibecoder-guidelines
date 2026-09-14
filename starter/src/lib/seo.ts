import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from './constants';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

export function buildMetadata({
  title,
  description,
  path = '',
  image = '/og-image.jpg',
}: SEOProps): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: { title, description, url, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  };
}

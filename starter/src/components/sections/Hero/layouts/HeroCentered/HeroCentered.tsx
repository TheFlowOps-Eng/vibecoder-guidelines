import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import type { HeroCenteredContent } from './HeroCentered.types';
import './HeroCentered.styles.css';

interface HeroCenteredProps {
  content: HeroCenteredContent;
  /** Identity of this placement, unique per page. The editor keys a section's style overrides,
   *  reorder and delete by it, so two pages sharing one id read as a single section (OHH-772). */
  sectionId: string;
}

export function HeroCentered({ content, sectionId }: HeroCenteredProps) {
  return (
    <section className="hero-centered" data-ohw-section={sectionId} data-ohw-section-label="Hero">
      <Container>
        <h1
          className="hero-centered__headline"
          data-ohw-editable="text"
          data-ohw-key="hero-headline"
          data-ohw-max-length="80"
        >
          {content.headline}
        </h1>
        <p
          className="hero-centered__sub"
          data-ohw-editable="text"
          data-ohw-key="hero-subheadline"
          data-ohw-max-length="200"
        >
          {content.subheadline}
        </p>
        <div className="hero-centered__actions">
          <Button href={content.ctaHref} ohwKey="hero-cta">{content.ctaLabel}</Button>
        </div>
        {content.backgroundImageUrl && (
          <div
            className="hero-centered__image"
            style={{ backgroundImage: `url(${content.backgroundImageUrl})` }}
            role="img"
            aria-label=""
            data-ohw-editable="bg-image"
            data-ohw-key="hero-bg-image"
          />
        )}
      </Container>
    </section>
  );
}

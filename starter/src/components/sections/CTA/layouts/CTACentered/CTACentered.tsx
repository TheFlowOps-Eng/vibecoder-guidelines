import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import type { CTACenteredContent } from './CTACentered.types';
import './CTACentered.styles.css';

interface CTACenteredProps {
  content: CTACenteredContent;
  /** Identity of this placement, unique per page. The editor keys a section's style overrides,
   *  reorder and delete by it, so two pages sharing one id read as a single section (OHH-772). */
  sectionId: string;
}

export function CTACentered({ content, sectionId }: CTACenteredProps) {
  return (
    <section
      className="cta-centered"
      data-ohw-section={sectionId}
      data-ohw-section-label="CTA"
      style={content.backgroundColor ? { background: content.backgroundColor } : undefined}
    >
      <Container>
        <div className="cta-centered__inner">
          <h2
            className="cta-centered__headline"
            data-ohw-editable="text"
            data-ohw-key="cta-headline"
            data-ohw-max-length="80"
          >
            {content.headline}
          </h2>
          {content.subheadline && (
            <p
              className="cta-centered__sub"
              data-ohw-editable="text"
              data-ohw-key="cta-subheadline"
              data-ohw-max-length="160"
            >
              {content.subheadline}
            </p>
          )}
          <div className="cta-centered__actions">
            <Button href={content.ctaHref} ohwKey="cta-primary">{content.ctaLabel}</Button>
            {content.secondaryCtaLabel && content.secondaryCtaHref && (
              <Button href={content.secondaryCtaHref} variant="secondary" ohwKey="cta-secondary">
                {content.secondaryCtaLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

import { Container } from '@/components/layout/Container';
import type { AboutSplitContent } from './AboutSplit.types';
import './AboutSplit.styles.css';

interface AboutSplitProps {
  content: AboutSplitContent;
  /** Identity of this placement, unique per page. The editor keys a section's style overrides,
   *  reorder and delete by it, so two pages sharing one id read as a single section (OHH-772). */
  sectionId: string;
}

export function AboutSplit({ content, sectionId }: AboutSplitProps) {
  const imageFirst = content.imagePosition === 'left';
  const paragraphs = content.body.split('\n\n').filter(Boolean);

  const image = (
    <div
      className="about-split__image"
      style={{ backgroundImage: `url(${content.imageUrl})` }}
      role="img"
      aria-label=""
      data-ohw-editable="bg-image"
      data-ohw-key="about-image"
    />
  );

  const text = (
    <div className="about-split__text">
      <h2
        className="about-split__heading"
        data-ohw-editable="text"
        data-ohw-key="about-heading"
        data-ohw-max-length="80"
      >
        {content.heading}
      </h2>
      <div data-ohw-editable="text" data-ohw-key="about-body">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="about-split__body">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <section className="about-split" data-ohw-section={sectionId} data-ohw-section-label="About">
      <Container>
        <div className="about-split__grid">
          {imageFirst ? (
            <>
              {image}
              {text}
            </>
          ) : (
            <>
              {text}
              {image}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}

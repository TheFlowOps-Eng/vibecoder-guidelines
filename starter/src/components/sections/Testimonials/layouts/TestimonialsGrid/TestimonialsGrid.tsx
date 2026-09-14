import Image from 'next/image';
import { Container } from '@/components/layout/Container';
import type { TestimonialsGridContent } from './TestimonialsGrid.types';
import './TestimonialsGrid.styles.css';

interface TestimonialsGridProps {
  content: TestimonialsGridContent;
  /** Identity of this placement, unique per page. The editor keys a section's style overrides,
   *  reorder and delete by it, so two pages sharing one id read as a single section (OHH-772). */
  sectionId: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsGrid({ content, sectionId }: TestimonialsGridProps) {
  return (
    <section
      className="testimonials-grid"
      data-ohw-section={sectionId}
      data-ohw-section-label="Testimonials"
    >
      <Container>
        <div className="testimonials-grid__header">
          <h2
            className="testimonials-grid__heading"
            data-ohw-editable="text"
            data-ohw-key="testimonials-heading"
            data-ohw-max-length="80"
          >
            {content.heading}
          </h2>
          {content.subheading && (
            <p
              className="testimonials-grid__sub"
              data-ohw-editable="text"
              data-ohw-key="testimonials-subheading"
              data-ohw-max-length="160"
            >
              {content.subheading}
            </p>
          )}
        </div>

        <div className="testimonials-grid__grid">
          {content.items.map((item, i) => (
            <div key={i} className="testimonials-grid__card">
              <p
                className="testimonials-grid__quote"
                data-ohw-editable="text"
                data-ohw-key={`testimonials-item-${i}-quote`}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="testimonials-grid__author">
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="testimonials-grid__photo"
                    data-ohw-editable="image"
                    data-ohw-key={`testimonials-item-${i}-photo`}
                  />
                ) : (
                  <div
                    className="testimonials-grid__avatar"
                    data-ohw-editable="bg-image"
                    data-ohw-key={`testimonials-item-${i}-photo`}
                  >
                    {getInitials(item.author)}
                  </div>
                )}
                <div>
                  <div
                    className="testimonials-grid__name"
                    data-ohw-editable="plain"
                    data-ohw-key={`testimonials-item-${i}-author`}
                  >
                    {item.author}
                  </div>
                  {item.role && (
                    <div
                      className="testimonials-grid__role"
                      data-ohw-editable="plain"
                      data-ohw-key={`testimonials-item-${i}-role`}
                    >
                      {item.role}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ContactCenteredContent } from './ContactCentered.types';
import './ContactCentered.styles.css';

interface ContactCenteredProps {
  content: ContactCenteredContent;
  /** Identity of this placement, unique per page. The editor keys a section's style overrides,
   *  reorder and delete by it, so two pages sharing one id read as a single section (OHH-772). */
  sectionId: string;
}

export function ContactCentered({ content, sectionId }: ContactCenteredProps) {
  return (
    <section
      className="contact-centered"
      data-ohw-section={sectionId}
      data-ohw-section-label="Contact"
    >
      <Container>
        <div className="contact-centered__header">
          <h1
            className="contact-centered__heading"
            data-ohw-editable="text"
            data-ohw-key="contact-heading"
            data-ohw-max-length="80"
          >
            {content.heading}
          </h1>
          {content.subheading && (
            <p
              className="contact-centered__sub"
              data-ohw-editable="text"
              data-ohw-key="contact-subheading"
              data-ohw-max-length="160"
            >
              {content.subheading}
            </p>
          )}
        </div>

        {/* Tag and keys only — the endpoint and submit logic arrive with the bridge (OHH-490). */}
        <form data-ohw-editable="form" data-ohw-key="contact-form" className="contact-centered__form">
          {content.formFields.map((field) => (
            <Input
              key={field.name}
              name={field.name}
              placeholder={field.placeholder}
              type={field.type}
              required={field.required}
            />
          ))}
          <Button type="submit">{content.submitLabel}</Button>
        </form>
      </Container>
    </section>
  );
}

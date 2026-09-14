'use client';

import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      className="page-section"
      style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center' }}
      data-ohw-section="error"
      data-ohw-section-label="Error Page"
    >
      <Container>
        <p className="eyebrow" data-ohw-editable="plain" data-ohw-key="error-eyebrow">
          Error
        </p>
        <h1
          className="page-section__headline"
          style={{ maxWidth: 'none' }}
          data-ohw-editable="text"
          data-ohw-key="error-headline"
          data-ohw-max-length="80"
        >
          Something went wrong.
        </h1>
        <p
          className="page-section__body"
          style={{ margin: '0 auto 2rem' }}
          data-ohw-editable="text"
          data-ohw-key="error-body"
          data-ohw-max-length="160"
        >
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </Container>
    </section>
  );
}

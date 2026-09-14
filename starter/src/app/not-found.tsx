import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section
      className="page-section"
      style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center' }}
      data-ohw-section="not-found"
      data-ohw-section-label="404 Page"
    >
      <Container>
        <p className="eyebrow" data-ohw-editable="plain" data-ohw-key="notfound-eyebrow">
          404
        </p>
        <h1
          className="page-section__headline"
          style={{ maxWidth: 'none' }}
          data-ohw-editable="text"
          data-ohw-key="notfound-headline"
          data-ohw-max-length="80"
        >
          Page not found.
        </h1>
        <p
          className="page-section__body"
          style={{ margin: '0 auto 2rem' }}
          data-ohw-editable="text"
          data-ohw-key="notfound-body"
          data-ohw-max-length="160"
        >
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>
        <Button href="/">Back to home</Button>
      </Container>
    </section>
  );
}

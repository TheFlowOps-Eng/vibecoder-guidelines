import { aboutContent } from '@/content/about';
import { Container } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'About',
  description: 'The story behind the OhhWells starter template.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <section
      className="page-section"
      data-ohw-section="about-page"
      data-ohw-section-label="About Page Header"
    >
      <Container>
        {aboutContent.eyebrow && (
          <p className="eyebrow" data-ohw-editable="plain" data-ohw-key="about-page-eyebrow">
            {aboutContent.eyebrow}
          </p>
        )}
        <h1
          className="page-section__headline"
          data-ohw-editable="text"
          data-ohw-key="about-page-headline"
          data-ohw-max-length="80"
        >
          {aboutContent.headline}
        </h1>
        <div data-ohw-editable="text" data-ohw-key="about-page-body">
          {aboutContent.body.map((paragraph, i) => (
            <p key={i} className="page-section__body">
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}

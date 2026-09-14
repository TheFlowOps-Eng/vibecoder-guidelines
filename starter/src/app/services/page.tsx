import { servicesContent } from '@/content/services';
import { ServicesLayouts } from '@/components/sections/Services';
import { Container } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Services',
  description: 'What we build with the OhhWells starter template.',
  path: '/services',
});

export default function ServicesPage() {
  const Services = ServicesLayouts.grid.component;

  return (
    <>
      <section
        className="page-section"
        data-ohw-section="services-page"
        data-ohw-section-label="Services Page Header"
      >
        <Container>
          {servicesContent.eyebrow && (
            <p className="eyebrow" data-ohw-editable="plain" data-ohw-key="services-page-eyebrow">
              {servicesContent.eyebrow}
            </p>
          )}
          <h1
            className="page-section__headline"
            data-ohw-editable="text"
            data-ohw-key="services-page-headline"
            data-ohw-max-length="80"
          >
            {servicesContent.headline}
          </h1>
          <p
            className="page-section__body"
            data-ohw-editable="text"
            data-ohw-key="services-page-subheadline"
            data-ohw-max-length="160"
          >
            {servicesContent.subheadline}
          </p>
        </Container>
      </section>
      <Services
        content={{
          heading: '',
          items: servicesContent.services,
        }}
        sectionId="services-list"
      />
    </>
  );
}

import { EmptySection } from '@ohhwells/bridge';
import { Container } from '@/components/layout/Container';

function beautify(path: string): string {
  const last = path.split('/').filter(Boolean).pop() ?? '';
  return last
    .replace(/-copy(-\d+)?$/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface BreadcrumbProps {
  title: string;
  path: string;
  pageId: string;
}

// Hero-style chrome for blank/duplicate pages that have no section content of their own
// yet — the eyebrow/heading/subheading itself is the shared EmptySection from
// @ohhwells/bridge; only the page-section/Container wrapping is template-specific.
// Text keys incorporate pageId (not path) so edits survive a URL rename, and stay unique
// per page since OhhwellsBridge's content store is keyed per-site, not per-page.
export function Breadcrumb({ title, path, pageId }: BreadcrumbProps) {
  const label = title || beautify(path);

  return (
    <section className="page-section" data-ohw-section="hero" data-ohw-section-label="Hero">
      <Container>
        <EmptySection
          title={label}
          eyebrowKey={`hero-${pageId}-eyebrow`}
          titleKey={`hero-${pageId}-title`}
          subtitleKey={`hero-${pageId}-subtitle`}
        />
      </Container>
    </section>
  );
}

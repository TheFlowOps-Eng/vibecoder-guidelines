import { renderCatchAllPage } from '@ohhwells/bridge/pages';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

interface CatchAllPageProps {
  params: { page: string[] };
  searchParams: { subdomain?: string };
}

export default async function CatchAllPage({ params, searchParams }: CatchAllPageProps) {
  return renderCatchAllPage(params.page ?? [], searchParams.subdomain, {
    // Relative import, not the `@` alias — webpack can only build a static context module
    // (bundling every matching src/app/*/page.tsx) when the prefix is a real relative path;
    // alias segments break that analysis and the import fails at runtime. This is the one
    // piece renderCatchAllPage can't absorb: it has to stay scoped to this app's own
    // src/app tree, not the shared bridge package's.
    renderDuplicate: (sourceSegment) =>
      (sourceSegment ? import(`../${sourceSegment}/page`) : import('../page')) as Promise<{
        default: React.ComponentType;
      }>,
    renderBlank: (page) => <Breadcrumb title={page.title} path={page.path} pageId={page.id} />,
  });
}

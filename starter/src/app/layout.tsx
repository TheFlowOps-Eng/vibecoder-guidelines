import { Suspense } from 'react';
import { OhhwellsBridge } from '@ohhwells/bridge';
import { BrandProvider } from '@/components/layout/BrandProvider';
import { OHW_LOADER_STYLE, OhwLoaderSpinner } from '@/components/layout/OhwLoaderSurface';
import { Navbar } from '@/components/layout/Navbar';
import { FooterLayouts } from '@/components/layout/Footer';
import { globalContent } from '@/content/global';
import { fontClasses } from '@/lib/fonts';
import { buildMetadata } from '@/lib/seo';
import '@/styles/globals.css';
import '@ohhwells/bridge/styles';

export const metadata = buildMetadata({
  title: 'Home',
  description: 'A minimal base template for every vibe-coded OhhWells site.',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const Footer = FooterLayouts[globalContent.footer.layout].component;

  return (
    <html lang="en" className={fontClasses}>
      <body>
        {/* Customer-site loader: covers the template from FIRST PAINT until the bridge applies
            the site's content (fetchState done), so visitors never see template defaults flash.
            The inline script flips it visible synchronously — before hydration — whenever the
            page serves a customer site (subdomain hostname or ?subdomain query). */}
        <div id="ohw-loader" suppressHydrationWarning style={{ ...OHW_LOADER_STYLE, display: 'none' }}>
          <OhwLoaderSpinner />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.hostname.split(".");var fromHost=p.length>=3&&p[0]!=="www"?p[0]:"";var fromQuery=new URLSearchParams(location.search).get("subdomain")||"";if(!fromHost&&!fromQuery)return;var e=document.getElementById("ohw-loader");if(e)e.style.display="flex"}catch(e){}})();`,
          }}
        />
        <Suspense>
          <OhhwellsBridge />
        </Suspense>
        <BrandProvider>
          <Navbar
            items={globalContent.navItems}
            logo={globalContent.logo}
            ctaButton={globalContent.ctaButton}
          />
          <main>{children}</main>
          <Footer content={globalContent.footer.content} logo={globalContent.logo} />
        </BrandProvider>
      </body>
    </html>
  );
}

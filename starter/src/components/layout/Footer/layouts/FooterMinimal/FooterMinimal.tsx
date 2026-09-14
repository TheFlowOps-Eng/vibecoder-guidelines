import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Wordmark, resolveLogoWordmark } from '@/components/layout/Wordmark';
import type { LogoConfig } from '@/types/content';
import type { FooterMinimalContent } from './FooterMinimal.types';
import './FooterMinimal.styles.css';

interface FooterMinimalProps {
  content: FooterMinimalContent;
  /** Site-wide logo identity — footer mirrors header (OHH-534). */
  logo?: LogoConfig;
}

export function FooterMinimal({ content, logo }: FooterMinimalProps) {
  const logoConfig: LogoConfig = logo ?? { text: '', isPlaceholder: true };
  const wordmark = resolveLogoWordmark(logoConfig);

  return (
    <footer className="footer-minimal" data-ohw-section="footer" data-ohw-section-label="Footer">
      <Container>
        <div className="footer-minimal__inner">
          <a
            href="/"
            className="footer-minimal__logo"
            data-ohw-role="logo"
            data-ohw-href-key="footer-logo-href"
            {...(wordmark.isPlaceholder ? { 'data-ohw-placeholder': '' } : {})}
          >
            <Wordmark logo={logoConfig} variant="footer" height={24} className="footer-minimal__logo-img" />
          </a>

          {content.tagline ? (
            <p
              className="footer-minimal__tagline"
              data-ohw-editable="plain"
              data-ohw-key="footer-tagline"
            >
              {content.tagline}
            </p>
          ) : null}

          {content.links.length > 0 && (
            <nav data-ohw-footer-links="">
              <div className="footer-minimal__nav" data-ohw-footer-col="0">
                {content.linksHeading ? (
                  <p
                    className="footer-minimal__heading"
                    data-ohw-editable="text"
                    data-ohw-key="footer-0-heading"
                    style={{ display: 'none' }}
                  >
                    {content.linksHeading}
                  </p>
                ) : null}
                {content.links.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-ohw-href-key={`footer-0-${i}-href`}
                    className="footer-minimal__link"
                  >
                    <span data-ohw-editable="text" data-ohw-key={`footer-0-${i}-label`}>
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </nav>
          )}

          {content.socials && content.socials.length > 0 ? (
            <div className="footer-minimal__socials" data-ohw-socials-row="">
              {content.socials.map((social, i) => (
                <a
                  key={social.platform}
                  href={social.url}
                  aria-label={social.platform}
                  data-ohw-href-key={`footer-social-${i}-href`}
                  className="footer-minimal__social"
                >
                  <span
                    data-ohw-editable="plain"
                    data-ohw-key={`footer-social-${i}-label`}
                    style={{ display: 'none' }}
                  >
                    {social.platform}
                  </span>
                </a>
              ))}
            </div>
          ) : null}

          <p
            className="footer-minimal__copyright"
            data-ohw-editable="plain"
            data-ohw-key="footer-copyright"
          >
            {content.copyrightText}
          </p>
        </div>
      </Container>
    </footer>
  );
}

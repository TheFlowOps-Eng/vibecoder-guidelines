"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavItem, LogoConfig } from "@/types/content";
import { Wordmark, resolveLogoWordmark } from "@/components/layout/Wordmark";
import { MobileMenu } from "./MobileMenu";
import { NavDropdownTemplate } from "./NavDropdownTemplate";

interface NavbarProps {
  items: NavItem[];
  logo: LogoConfig;
  ctaButton?: { label: string; href: string };
}

function assignNavIndices(items: NavItem[]): Array<{
  item: NavItem;
  index: number;
  children: Array<{ item: NavItem; index: number }>;
}> {
  let next = 0;
  return items.map((item) => {
    const index = next++;
    const children = (item.children ?? []).map((child) => ({
      item: child,
      index: next++,
    }));
    return { item, index, children };
  });
}

export function Navbar({ items, logo, ctaButton }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const indexed = assignNavIndices(items);
  const wordmark = resolveLogoWordmark(logo);

  return (
    <header
      className="navbar"
      data-ohw-nav-root=""
      data-ohw-section="navbar"
      data-ohw-section-label="Navigation"
    >
      <div className="navbar__inner">
        <a
          href="/"
          className="navbar__logo"
          data-ohw-role="logo"
          data-ohw-href-key="nav-logo-href"
          {...(wordmark.isPlaceholder ? { "data-ohw-placeholder": "" } : {})}
        >
          <Wordmark logo={logo} variant="nav" height={28} />
        </a>

        <nav
          className="navbar__nav"
          data-ohw-nav-container=""
          data-ohw-nav-open="click"
        >
          <NavDropdownTemplate
            groupClassName="navbar__group"
            linkClassName="navbar__link"
            dropdownClassName="navbar__dropdown"
            childLinkClassName="navbar__dropdown-link"
          />

          {indexed.map(({ item, index, children }) => (
            <div
              key={`nav-group-${index}`}
              className="navbar__group"
              data-ohw-nav-group=""
              data-ohw-nav-open="click"
            >
              <Link
                href={item.href}
                data-ohw-href-key={`nav-${index}-href`}
                className="navbar__link"
              >
                <span data-ohw-editable="text" data-ohw-key={`nav-${index}-label`}>
                  {item.label}
                </span>
                <span className="navbar__caret" data-ohw-nav-caret="" aria-hidden="true" />
              </Link>
              <div className="navbar__dropdown" data-ohw-nav-children="">
                {children.map(({ item: child, index: childIndex }) => (
                  <Link
                    key={`nav-child-${childIndex}`}
                    href={child.href}
                    data-ohw-href-key={`nav-${childIndex}-href`}
                    className="navbar__dropdown-link"
                  >
                    <span
                      data-ohw-editable="text"
                      data-ohw-key={`nav-${childIndex}-label`}
                    >
                      {child.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {ctaButton && (
            <Link
              href={ctaButton.href}
              data-ohw-href-key="nav-cta-href"
              data-ohw-role="navbar-button"
              data-ohw-drag-disabled="true"
              className="navbar__cta"
            >
              <span data-ohw-editable="text" data-ohw-key="nav-cta-label">
                {ctaButton.label}
              </span>
            </Link>
          )}
        </nav>

        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <MobileMenu
        items={items}
        ctaButton={ctaButton}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  );
}

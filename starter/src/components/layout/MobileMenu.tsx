'use client';

import Link from 'next/link';
import type { NavItem } from '@/types/content';
import { NavDropdownTemplate } from './NavDropdownTemplate';

interface MobileMenuProps {
  items: NavItem[];
  ctaButton?: { label: string; href: string };
  open: boolean;
  onClose: () => void;
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

export function MobileMenu({ items, ctaButton, open, onClose }: MobileMenuProps) {
  const indexed = assignNavIndices(items);

  return (
    <div
      className="mobile-menu"
      hidden={!open}
      data-ohw-nav-drawer=""
      data-ohw-section={open ? "navbar" : undefined}
      data-ohw-instance={open ? "navbar" : undefined}
      data-ohw-section-label="Navigation"
    >
      <NavDropdownTemplate
        groupClassName="mobile-menu__group"
        linkClassName="mobile-menu__link"
        dropdownClassName="mobile-menu__dropdown"
        childLinkClassName="mobile-menu__dropdown-link"
        caretClassName="mobile-menu__caret"
      />
      <nav className="mobile-menu__nav">
        {indexed.map(({ item, index, children }) => (
          <div
            key={`mobile-group-${index}`}
            className="mobile-menu__group"
            data-ohw-nav-group=""
            data-ohw-nav-open="click"
          >
            <Link
              href={item.href}
              data-ohw-href-key={`nav-${index}-href`}
              className="mobile-menu__link"
              onClick={onClose}
            >
              <span data-ohw-editable="text" data-ohw-key={`nav-${index}-label`}>
                {item.label}
              </span>
              <span className="mobile-menu__caret" data-ohw-nav-caret="" aria-hidden="true" />
            </Link>
            <div className="mobile-menu__dropdown" data-ohw-nav-children="">
              {children.map(({ item: child, index: childIndex }) => (
                <Link
                  key={`mobile-child-${childIndex}`}
                  href={child.href}
                  data-ohw-href-key={`nav-${childIndex}-href`}
                  className="mobile-menu__dropdown-link"
                  onClick={onClose}
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
            className="mobile-menu__cta btn--primary"
            onClick={onClose}
          >
            <span data-ohw-editable="text" data-ohw-key="nav-cta-label">
              {ctaButton.label}
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}

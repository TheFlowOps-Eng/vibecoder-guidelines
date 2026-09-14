import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  /**
   * When set with `href`, marks the button as a canvas-editable CTA:
   * `data-ohw-href-key="{ohwKey}-href"`, `data-ohw-role="button"`, and an inner
   * label span with `data-ohw-key="{ohwKey}-label"`.
   */
  ohwKey?: string;
  'data-ohw-key'?: string;
  'data-ohw-editable'?: 'text' | 'plain';
  'data-ohw-max-length'?: number;
}

export function Button({
  children,
  href,
  variant = 'primary',
  onClick,
  type = 'button',
  ohwKey,
  ...ohwProps
}: ButtonProps) {
  const className = `btn btn--${variant}`;
  // An explicit data-ohw-key wins so existing content keys keep resolving.
  const labelKey = ohwProps['data-ohw-key'] ?? (ohwKey ? `${ohwKey}-label` : undefined);

  if (href) {
    if (ohwKey) {
      return (
        <Link
          href={href}
          className={className}
          data-ohw-href-key={`${ohwKey}-href`}
          data-ohw-role="button"
          data-ohw-drag-disabled="true"
        >
          <span data-ohw-editable="text" data-ohw-key={labelKey}>
            {children}
          </span>
        </Link>
      );
    }
    return (
      <Link href={href} className={className} {...ohwProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} {...ohwProps}>
      {children}
    </button>
  );
}

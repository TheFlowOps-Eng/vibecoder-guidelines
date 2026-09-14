import type { LogoConfig } from "@/types/content";
import { PLACEHOLDER_BUSINESS_NAME } from "@/types/content";

export function resolveLogoWordmark(logo: LogoConfig): {
  text: string;
  isPlaceholder: boolean;
} {
  const trimmed = logo.text?.trim() ?? "";
  if (!trimmed) {
    return { text: PLACEHOLDER_BUSINESS_NAME, isPlaceholder: true };
  }
  return {
    text: trimmed,
    isPlaceholder:
      logo.isPlaceholder === true || trimmed === PLACEHOLDER_BUSINESS_NAME,
  };
}

type WordmarkProps = {
  logo: LogoConfig;
  height?: number;
  /** Editor key prefix: nav uses `nav-logo-*`, footer uses `footer-logo*`. */
  variant?: "nav" | "footer";
  className?: string;
};

/**
 * Site logo mark.
 *
 * Uploaded logos are applied by the bridge (`nav-logo-image` / `footer-logo`).
 * Visibility is CSS-driven via `:has(img[src])` so React re-renders don't wipe
 * the bridge's show-image / hide-wordmark state.
 */
export function Wordmark({
  logo,
  height = 28,
  variant = "nav",
  className,
}: WordmarkProps) {
  const wordmark = resolveLogoWordmark(logo);
  const imageKey = variant === "nav" ? "nav-logo-image" : "footer-logo";
  const textKey = variant === "nav" ? "nav-logo-text" : "footer-logo-text";
  const hasStaticImage = Boolean(logo.image?.trim());

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- bridge sets src for uploaded logos */}
      <img
        className={className}
        alt={wordmark.text}
        data-ohw-editable="image"
        data-ohw-key={imageKey}
        {...(hasStaticImage ? { src: logo.image } : {})}
        style={{
          // Size comes from CSS (globals) + bridge vars on the logo root.
          ["--ohw-logo-default" as string]: `${height}px`,
          width: "auto",
          objectFit: "contain",
        }}
      />
      <span
        className={hasStaticImage ? undefined : className}
        data-ohw-editable="plain"
        data-ohw-key={textKey}
        data-ohw-wordmark=""
        style={{
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {wordmark.text}
      </span>
    </>
  );
}

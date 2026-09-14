import type { CSSProperties } from 'react';

export const OHW_LOADER_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: '#fff',
  zIndex: 2147483646,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function OhwLoaderSpinner() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="11" stroke="#E7E5E4" strokeWidth="3" />
      <circle
        cx="14"
        cy="14"
        r="11"
        stroke="#1C1917"
        strokeWidth="3"
        strokeDasharray="17 52"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 14 14"
          to="360 14 14"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

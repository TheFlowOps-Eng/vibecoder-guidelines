import type { Brand } from '@/types/content';

export const brand: Brand = {
  colors: {
    primary: '#0F0F0F',
    secondary: '#F5F5F0',
    accent: '#C8B89A',
    background: '#FFFFFF',
    surface: '#F9F9F7',
    text: '#0F0F0F',
    textMuted: '#888880',
    border: '#E8E8E4',
    onPrimary: '#FFFFFF',
    primarySurface: 'rgba(15, 15, 15, 0.06)',
    primaryBorder: 'rgba(255, 255, 255, 0.10)',
    onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
    onPrimaryFaint: 'rgba(255, 255, 255, 0.48)',
    navbarBackground: 'rgba(255, 255, 255, 0.85)',
  },
  fonts: {
    heading: "'DM Serif Display', serif",
    body: "'DM Sans', sans-serif",
  },
  spacing: {
    section: '7rem',
    container: '1200px',
    gap: '1.5rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  weight: {
    heading: 700,
  },
  headingScale: {
    sectionH2: 'clamp(2rem, 3.5vw, 2.75rem)',
  },
};

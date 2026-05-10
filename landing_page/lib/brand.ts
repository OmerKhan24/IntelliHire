/**
 * IntelliHire — Global Brand Configuration
 * Single source of truth for colors, fonts, copy, and app URLs.
 * Use CSS variable `brand` in Tailwind classes (e.g. bg-brand, text-brand)
 * Use these constants for inline styles or JS logic.
 */

export const brand = {
  /** Product name parts */
  name: 'IntelliHire' as const,
  nameParts: { prefix: 'Intelli', accent: 'Hire' } as const,
  tagline: 'AI-Powered Candidate Screening',
  description:
    'IntelliHire automates candidate screening with AI-driven interviews, real-time voice analysis, YOLOv8 proctoring, and instant performance reports.',
  company: 'FAST NUCES Karachi',

  /** Core palette — all keyed to CSS vars where possible */
  colors: {
    /** Primary brand blue — use `text-brand` / `bg-brand` in Tailwind */
    primary:      '#2f97f7',
    /** Lighter tint — use `text-brand-light` / `bg-brand-light` */
    primaryLight: '#7dc2fa',
    /** Darker press state — use `text-brand-dark` / `bg-brand-dark` */
    primaryDark:  '#1677d8',
    /** Glow/shadow rgba shorthand */
    glow:         'rgba(47,151,247,0.4)',
    glowFaint:    'rgba(47,151,247,0.15)',
    /** Dark background base */
    bg:           '#070d1a',
  },

  /** Font CSS variable names (registered in layout.tsx & globals.css) */
  fonts: {
    /** Outfit — headings, brand wordmark, display text */
    display: 'var(--font-outfit)',
    /** Plus Jakarta Sans — body, UI copy */
    sans:    'var(--font-jakarta)',
  },

  /** External / app links */
  links: {
    app:      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    login:    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login`,
    register: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/register`,
    github:   'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter:  'https://twitter.com',
  },
} as const;

export type BrandColors = typeof brand.colors;

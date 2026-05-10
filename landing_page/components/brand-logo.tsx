import React from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { brand } from '@/lib/brand';

interface BrandLogoIconProps {
  size?: string;
  className?: string;
}

/**
 * IntelliHire logo mark.
 *
 * Uses Lucide <Brain> rendered twice — each clipped to one half — so the
 * left hemisphere is a dimmer primaryLight and the right is full primary.
 * That split is our brand idea: AI precision (right) meeting human judgment (left).
 *
 * On top we layer three neural-node dots at anatomically-ish correct positions
 * and a short dashed scan line crossing the right lobe — the only detail that
 * makes this unmistakably ours and not just a library icon.
 */
export function BrandLogoIcon({ size = 'w-11 h-11', className = '' }: BrandLogoIconProps) {
  const primary      = brand.colors.primary;       // #2f97f7
  const primaryLight = brand.colors.primaryLight;  // #4fb0ff

  return (
    <div
      className={`relative ${size} flex items-center justify-center shrink-0 ${className}`}
    >
      {/* ── Pulse ring — always visible, intensifies on hover ── */}
      <span
        className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500"
        style={{ boxShadow: `0 0 0 1.5px ${primary}` }}
      />

      {/* ── Hover glow halo ── */}
      <span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${primary}1a 0%, transparent 70%)`,
        }}
      />

      {/*
       * ── Brain split: render the Lucide Brain icon twice.
       *    Each copy is clipped to its half via overflow-hidden + absolute sizing.
       *    Left = primaryLight @ 65% opacity   (human / intuition)
       *    Right = primary @ full opacity        (AI / structured)
       */}
      <div className="relative w-[62%] h-[62%]">

        {/* Left half — dimmer, cooler */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          <Brain
            style={{ width: '100%', height: '100%', color: primaryLight }}
            strokeWidth={1.7}
          />
        </div>

        {/* Right half — full brightness */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        >
          <Brain
            style={{ width: '100%', height: '100%', color: primary }}
            strokeWidth={1.7}
          />
        </div>

        {/*
         * ── Brand details: SVG overlay sitting above both halves.
         *    viewBox matches Lucide's 24×24 grid so dot positions
         *    line up with the actual brain anatomy.
         */}
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dashed scan line — right lobe only, our signature mark */}
          <line
            x1="12.5" y1="10.5" x2="20" y2="10.5"
            stroke={primary}
            strokeWidth="1"
            strokeOpacity="0.5"
            strokeDasharray="1.4 2"
            strokeLinecap="round"
          />

          {/* Neural node — right frontal */}
          <circle cx="17.2" cy="7.8"  r="1.15" fill={primary} fillOpacity="0.9" />
          {/* Neural node — right temporal */}
          <circle cx="19.8" cy="13"   r="1.0"  fill={primary} fillOpacity="0.75" />
          {/* Neural node — right occipital */}
          <circle cx="15.8" cy="17.5" r="0.85" fill={primary} fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

interface BrandLogoFullProps {
  href?: string;
  className?: string;
  textSize?: string;
}

export function BrandLogoFull({
  href = '/',
  className = '',
  textSize = 'text-[18px]',
}: BrandLogoFullProps) {
  const inner = (
    <>
      <BrandLogoIcon />
      <span className={`${textSize} font-bold tracking-tight text-white font-display`}>
        {brand.nameParts.prefix}
        <span className="text-brand">{brand.nameParts.accent}</span>
      </span>
    </>
  );

  if (!href) {
    return (
      <div className={`flex items-center gap-2.5 group ${className}`}>
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      {inner}
    </Link>
  );
}
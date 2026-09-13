import React from 'react';
import { TribhuvanLogo } from './TribhuvanLogo';

interface SecurityWatermarkProps {
  customLogoUrl?: string;
  instituteName?: string;
  variant?: 'student' | 'library' | 'work' | 'loyalty';
  opacity?: number;
  highlight?: boolean;
  className?: string;
  showCenterLogo?: boolean;
  scale?: number;
}

/**
 * High-Security Institutional Watermark & Guilloche Security Substrate
 * Engineered to match authentic governmental identity cards (like the reference driver's license/national ID):
 * 1. Intricate multi-color Guilloche wave security lathe work (soft crimson/rose & sage/teal security curves)
 * 2. Fine concentric micro-text & starburst security rosettes
 * 3. Transparent Center Watermark with delicate duotone etching, perfectly balanced so all credential text is 100% crisp and readable
 * 4. Micro-security anti-photocopy guilloche lines spanning across the entire card substrate
 */
export const SecurityWatermark: React.FC<SecurityWatermarkProps> = ({
  customLogoUrl,
  instituteName = 'TRIBHUVAN UNIVERSITY',
  variant = 'student',
  opacity = 0.17,
  highlight = false,
  className = '',
  showCenterLogo,
  scale = 1.0,
}) => {
  const isLibrary = variant === 'library';
  const isWork = variant === 'work';
  const isLoyalty = variant === 'loyalty';
  const isUniversityCard = variant === 'student' || variant === 'library';

  // Tribhuvan University logo should only appear in background of university cards (student and library), not work or loyalty
  const shouldShowUniversityLogo = showCenterLogo !== undefined ? showCenterLogo : isUniversityCard;

  // Primary and secondary security ink colors for the fine guilloche ribbons
  const ribbonColor1 = isLibrary
    ? highlight ? 'rgba(13, 148, 136, 0.18)' : 'rgba(13, 148, 136, 0.08)'
    : isWork
    ? highlight ? 'rgba(30, 58, 138, 0.16)' : 'rgba(30, 58, 138, 0.06)'
    : isLoyalty
    ? highlight ? 'rgba(245, 158, 11, 0.18)' : 'rgba(245, 158, 11, 0.07)'
    : highlight ? 'rgba(225, 29, 72, 0.18)' : 'rgba(225, 29, 72, 0.085)';

  const ribbonColor2 = isLibrary
    ? highlight ? 'rgba(217, 119, 6, 0.16)' : 'rgba(30, 58, 138, 0.075)'
    : isWork
    ? highlight ? 'rgba(71, 85, 105, 0.14)' : 'rgba(71, 85, 105, 0.05)'
    : isLoyalty
    ? highlight ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.05)'
    : highlight ? 'rgba(37, 99, 235, 0.18)' : 'rgba(30, 64, 175, 0.08)';

  const centerEmblemColor = isLibrary
    ? '#0f766e'
    : isWork
    ? '#1e3a8a'
    : isLoyalty
    ? '#d97706'
    : '#1e3a8a';

  const effectiveOpacity = highlight ? Math.max(opacity, 0.28) : opacity;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ zIndex: 1 }}
    >
      {/* 1. Multi-Layer Guilloche Security Lathe Wave Lines (SVG Vector) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 420 265"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Security Radial Gradient */}
          <radialGradient id={`security-glow-${variant}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#fffbf5" stopOpacity="0.1" />
            <stop offset="100%" stopColor={isLibrary ? '#f0fdfa' : '#fef2f2'} stopOpacity="0.25" />
          </radialGradient>

          {/* Guilloche Wave Pattern Definition */}
          <pattern
            id={`guilloche-pattern-${variant}`}
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 30 Q 15 10, 30 30 T 60 30 M 0 35 Q 15 15, 30 35 T 60 35 M 0 25 Q 15 5, 30 25 T 60 25"
              fill="none"
              stroke={ribbonColor1}
              strokeWidth="0.6"
            />
            <path
              d="M 30 0 Q 10 15, 30 30 T 30 60 M 35 0 Q 15 15, 35 30 T 35 60 M 25 0 Q 5 15, 25 30 T 25 60"
              fill="none"
              stroke={ribbonColor2}
              strokeWidth="0.6"
            />
          </pattern>

          {/* Micro-text security ribbon path */}
          <path
            id={`security-text-curve-top-${variant}`}
            d="M 20 70 Q 210 95 400 70"
          />
          <path
            id={`security-text-curve-bottom-${variant}`}
            d="M 20 200 Q 210 175 400 200"
          />
        </defs>

        {/* Base Security Tint Surface */}
        <rect width="420" height="265" fill={`url(#security-glow-${variant})`} />

        {/* Overlapping Security Wave Rosettes (Lathe Work) */}
        {/* Wavy Intertwining Security Ribbons across the card - identical to authentic driver's license */}
        <g opacity="0.95">
          {/* Wave ribbon 1: upper swirl */}
          <path
            d="M -20,80 C 60,30 140,130 210,85 C 280,40 360,120 440,75"
            fill="none"
            stroke={ribbonColor1}
            strokeWidth="1.2"
          />
          <path
            d="M -20,84 C 60,34 140,134 210,89 C 280,44 360,124 440,79"
            fill="none"
            stroke={ribbonColor1}
            strokeWidth="0.9"
          />
          <path
            d="M -20,88 C 60,38 140,138 210,93 C 280,48 360,128 440,83"
            fill="none"
            stroke={ribbonColor1}
            strokeWidth="0.7"
          />

          {/* Wave ribbon 2: center-lower swirl */}
          <path
            d="M -20,160 C 70,210 150,110 220,165 C 290,220 370,120 440,170"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="1.2"
          />
          <path
            d="M -20,164 C 70,214 150,114 220,169 C 290,224 370,124 440,174"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="0.9"
          />
          <path
            d="M -20,168 C 70,218 150,118 220,173 C 290,228 370,128 440,178"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="0.7"
          />

          {/* Fine diagonal security cross-hatch */}
          <rect width="420" height="265" fill={`url(#guilloche-pattern-${variant})`} />
        </g>

        {/* Micro-text Security Threads (Anti-Counterfeit Microprint) */}
        <text
          fontSize="4.5"
          fill={ribbonColor2}
          fontWeight="700"
          letterSpacing="1.2"
          opacity="0.65"
        >
          <textPath href={`#security-text-curve-top-${variant}`} startOffset="5%">
            TRIBHUVAN UNIVERSITY • OFFICIAL SECURED CREDENTIAL • NEPAL • VERIFIED REGISTRATION • TRIBHUVAN UNIVERSITY
          </textPath>
        </text>
        <text
          fontSize="4.5"
          fill={ribbonColor1}
          fontWeight="700"
          letterSpacing="1.2"
          opacity="0.65"
        >
          <textPath href={`#security-text-curve-bottom-${variant}`} startOffset="5%">
            CENTRAL REPOSITORY DATABASE • GENUINE IDENTIFICATION • MINISTRY OF EDUCATION • OFFICIAL REPOSITORY
          </textPath>
        </text>

        {/* 2. Concentric Security Guilloche Rosette Rings surrounding Center Emblem */}
        <g transform="translate(210, 132)">
          {/* Outer fine decorative security rays */}
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={`ray-${i}`}
              x1="0"
              y1="-88"
              x2="0"
              y2={i % 3 === 0 ? '-96' : '-92'}
              stroke={ribbonColor1}
              strokeWidth="0.75"
              transform={`rotate(${i * 10})`}
            />
          ))}

          {/* Scalloped outer ring */}
          <circle
            r="86"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="0.8"
            strokeDasharray="2, 2"
          />
          <circle
            r="82"
            fill="none"
            stroke={ribbonColor1}
            strokeWidth="1.1"
          />
          <circle
            r="79"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="0.5"
          />

          {/* Inner rosette ring */}
          <circle
            r="54"
            fill="none"
            stroke={ribbonColor1}
            strokeWidth="0.9"
            strokeDasharray="3, 1.5"
          />
          <circle
            r="50"
            fill="none"
            stroke={ribbonColor2}
            strokeWidth="0.6"
          />
        </g>
      </svg>

      {/* 3. PROMINENT REALISTIC CENTER EMBLEM WATERMARK (Only for University Cards unless custom logo or explicitly enabled) */}
      {(shouldShowUniversityLogo || customLogoUrl) && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            opacity: effectiveOpacity,
            mixBlendMode: isLoyalty ? 'screen' : 'multiply',
            filter: highlight ? 'contrast(140%) brightness(98%)' : 'contrast(125%)',
          }}
        >
          <div
            className="relative w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] flex items-center justify-center transition-transform"
            style={{ transform: `scale(${scale})` }}
          >
            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="Center Security Watermark"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                style={{
                  filter: isLibrary
                    ? 'sepia(30%) hue-rotate(140deg) saturate(160%)'
                    : isWork
                    ? 'sepia(10%) hue-rotate(190deg) saturate(140%)'
                    : isLoyalty
                    ? 'sepia(50%) hue-rotate(5deg) saturate(200%)'
                    : 'sepia(20%) hue-rotate(185deg) saturate(180%)',
                }}
              />
            ) : shouldShowUniversityLogo ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Official Tribhuvan Star Emblem with crisp security transparency */}
                <TribhuvanLogo
                  size={145}
                  monochrome={false}
                  glow={highlight}
                  className="transform scale-95"
                />
              </div>
            ) : null}

            {/* Security Halo Ring around Center Logo */}
            <div
              className={`absolute inset-0 rounded-full pointer-events-none ${
                highlight
                  ? 'border-2 border-dashed border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'border-2 border-dashed'
              }`}
              style={{
                borderColor: highlight ? undefined : centerEmblemColor,
                opacity: highlight ? 0.65 : 0.35,
                transform: 'scale(1.08)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

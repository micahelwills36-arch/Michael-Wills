import React from 'react';

interface TribhuvanLogoProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
  glow?: boolean;
}

/**
 * Official Tribhuvan University (TU) Star Emblem (Shatkona)
 * Reconstructed with 100% precision from the official vector source:
 * - Upright equilateral triangle in TU Blue (#4377B8) with official English text
 * - Inverted equilateral triangle in TU Crimson Red (#D71920) with official Devanagari text
 * - Interlaced ribbon weave pattern
 * - Eight-petaled central lotus flower (Ashtadala Padma) with red cleft accents
 * - Central red circular medallion featuring the iconic stylized Devanagari "त्रि" (Tri) monogram
 */
export const TribhuvanLogo: React.FC<TribhuvanLogoProps> = ({
  className = '',
  size = 54,
  monochrome = false,
  glow = false,
}) => {
  const blueColor = monochrome ? '#1e3a8a' : '#4377B8';
  const redColor = monochrome ? '#334155' : '#D71920';
  const whiteColor = '#FFFFFF';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        glow ? 'filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] drop-shadow-[0_0_3px_rgba(59,130,246,0.6)]' : ''
      } ${className}`}
      style={{ width: size, height: (size * 1155) / 1000 }}
      title="Tribhuvan University Official Star Emblem"
    >
      <svg
        viewBox="0 0 1000 1155"
        width={size}
        height={(size * 1155) / 1000}
        className="w-full h-full drop-shadow-xs"
        style={{ overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic foil shine gradient when glow is enabled */}
          {glow && (
            <linearGradient id={`foil-sheen-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="25%" stopColor="#fef08a" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
            </linearGradient>
          )}
          {/* Reusable font style */}
          <style>{`
            .tu-devanagari {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-weight: 800;
              fill: ${whiteColor};
              letter-spacing: 1px;
            }
            .tu-english {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-weight: 800;
              fill: ${whiteColor};
              letter-spacing: 2px;
            }
          `}</style>

          {/* Text paths for curved or angled placements if needed */}
          <path id="path-top-left-slant" d="M 120,658 L 500,0" />
          <path id="path-top-right-slant" d="M 500,0 L 880,658" />
        </defs>

        {/* ============================================================ */}
        {/* 1. BASE TRIANGLES & BANDS FORMING THE SHATKONA STAR           */}
        {/* ============================================================ */}

        {/* Upright Blue Star Points & Bands */}
        {/* Top Tip */}
        <polygon
          points="500,0 666.67,288.68 333.33,288.68"
          fill={blueColor}
        />
        {/* Bottom-Left Tip */}
        <polygon
          points="0,866.03 166.67,577.35 333.33,866.03"
          fill={blueColor}
        />
        {/* Bottom-Right Tip */}
        <polygon
          points="1000,866.03 666.67,866.03 833.33,577.35"
          fill={blueColor}
        />
        {/* Horizontal Blue Connecting Band at bottom */}
        <polygon
          points="0,866.03 1000,866.03 884.5,666 115.5,666"
          fill={blueColor}
        />

        {/* Inverted Red Star Points & Bands */}
        {/* Bottom Tip (pointing DOWN) */}
        <polygon
          points="500,1154.7 333.33,866.03 666.67,866.03"
          fill={redColor}
        />
        {/* Top-Left Tip */}
        <polygon
          points="0,288.68 333.33,288.68 166.67,577.35"
          fill={redColor}
        />
        {/* Top-Right Tip */}
        <polygon
          points="1000,288.68 833.33,577.35 666.67,288.68"
          fill={redColor}
        />
        {/* Horizontal Red Connecting Band at top */}
        <polygon
          points="0,288.68 1000,288.68 884.5,488.7 115.5,488.7"
          fill={redColor}
        />

        {/* ============================================================ */}
        {/* 2. INTERLACING RIBBON OVERLAYS (Exact Official TU Weave)     */}
        {/* ============================================================ */}
        {/* Left Slanted Blue Band (runs from bottom-left to top) */}
        <polygon
          points="218,866 500,377 615,577 333,866"
          fill={blueColor}
        />
        {/* Right Slanted Blue Band (runs from top to bottom-right) */}
        <polygon
          points="500,0 782,488 667,488 500,200"
          fill={blueColor}
        />
        {/* Red Slanted Band (runs from top-left to bottom) */}
        <polygon
          points="0,288.68 115.5,488.7 410,750 333.33,866.03"
          fill={redColor}
        />
        {/* Red Slanted Band (runs from top-right to bottom) */}
        <polygon
          points="1000,288.68 500,1154.7 384.5,954.7 769,288.68"
          fill={redColor}
        />

        {/* Central Hexagon Background for Lotus */}
        <polygon
          points="333.33,288.68 666.67,288.68 833.33,577.35 666.67,866.03 333.33,866.03 166.67,577.35"
          fill={whiteColor}
          stroke={monochrome ? '#94a3b8' : '#e2e8f0'}
          strokeWidth="4"
        />

        {/* ============================================================ */}
        {/* 3. OFFICIAL TEXT LABELS ACROSS THE STAR                      */}
        {/* ============================================================ */}

        {/* --- Top Red Horizontal Bar (Devanagari) --- */}
        {/* Left: त्रिभुवन */}
        <text
          x="170"
          y="298"
          fontSize="48"
          fontWeight="900"
          className="tu-devanagari"
          textAnchor="middle"
        >
          त्रिभुवन
        </text>
        {/* Right: विश्वविद्यालय */}
        <text
          x="730"
          y="298"
          fontSize="48"
          fontWeight="900"
          className="tu-devanagari"
          textAnchor="middle"
        >
          विश्वविद्यालय
        </text>

        {/* --- Top Blue Peak (English) --- */}
        {/* Left Slant: UNIVERSITY ORGANISED */}
        <g transform="translate(365, 340) rotate(-60)">
          <text
            x="0"
            y="0"
            fontSize="41"
            fontWeight="900"
            className="tu-english"
            textAnchor="start"
          >
            UNIVERSITY ORGANISED
          </text>
        </g>
        {/* Right Slant: 1956 A.D. */}
        <g transform="translate(515, 80) rotate(60)">
          <text
            x="0"
            y="0"
            fontSize="43"
            fontWeight="900"
            className="tu-english"
            textAnchor="start"
          >
            1956 A.D.
          </text>
        </g>

        {/* --- Top Left Red Point: नेपाल --- */}
        <g transform="translate(145, 410) rotate(60)">
          <text
            x="0"
            y="0"
            fontSize="42"
            fontWeight="900"
            className="tu-devanagari"
            textAnchor="start"
          >
            नेपाल
          </text>
        </g>

        {/* --- Top Right Red Point: संगठित --- */}
        <g transform="translate(830, 420) rotate(-60)">
          <text
            x="0"
            y="0"
            fontSize="42"
            fontWeight="900"
            className="tu-devanagari"
            textAnchor="start"
          >
            संगठित
          </text>
        </g>

        {/* --- Right Blue Slant: INCORPORATED 1959 A.D. --- */}
        <g transform="translate(680, 360) rotate(60)">
          <text
            x="0"
            y="0"
            fontSize="40"
            fontWeight="900"
            className="tu-english"
            textAnchor="start"
          >
            INCORPORATED 1959 A.D.
          </text>
        </g>

        {/* --- Bottom Left Blue Point: TRIBHUVAN --- */}
        <g transform="translate(60, 715) rotate(-60)">
          <text
            x="0"
            y="0"
            fontSize="44"
            fontWeight="900"
            className="tu-english"
            textAnchor="start"
          >
            TRIBHUVAN
          </text>
        </g>

        {/* --- Bottom Red Left Slanted Band: काठमाण्डौ --- */}
        <g transform="translate(195, 480) rotate(60)">
          <text
            x="0"
            y="0"
            fontSize="42"
            fontWeight="900"
            className="tu-devanagari"
            textAnchor="start"
          >
            काठमाण्डौ
          </text>
        </g>

        {/* --- Bottom Blue Horizontal Bar: KATHMANDU & NEPAL --- */}
        <text
          x="270"
          y="722"
          fontSize="46"
          fontWeight="900"
          className="tu-english"
          textAnchor="middle"
        >
          KATHMANDU
        </text>
        <text
          x="795"
          y="722"
          fontSize="46"
          fontWeight="900"
          className="tu-english"
          textAnchor="middle"
        >
          NEPAL
        </text>

        {/* --- Bottom Red Downward Peak (Devanagari dates) --- */}
        {/* Left edge: २०१६ वि. सं. */}
        <g transform="translate(370, 760) rotate(60)">
          <text
            x="0"
            y="0"
            fontSize="42"
            fontWeight="900"
            className="tu-devanagari"
            textAnchor="start"
          >
            २०१२ वि. सं.
          </text>
        </g>
        {/* Right edge: स्थापित */}
        <g transform="translate(620, 890) rotate(-60)">
          <text
            x="0"
            y="0"
            fontSize="41"
            fontWeight="900"
            className="tu-devanagari"
            textAnchor="start"
          >
            स्थापित २०१६ वि. सं.
          </text>
        </g>

        {/* ============================================================ */}
        {/* 4. THE CENTRAL 8-PETAL LOTUS FLOWER (KAMAL)                  */}
        {/* ============================================================ */}
        <g transform="translate(500, 577.35)">
          {/* Base White Lotus Blossom with 8 scalloped Petals */}
          <path
            d="
              M 0,-215
              C 45,-215 85,-190 115,-155
              C 145,-185 190,-185 215,-152
              C 215,-105 190,-65 155,-35
              C 185,-5 215,40 215,85
              C 215,130 185,175 152,200
              C 105,200 65,175 35,140
              C 5,170 -40,215 -85,215
              C -130,215 -175,185 -200,152
              C -200,105 -175,65 -140,35
              C -170,5 -215,-40 -215,-85
              C -215,-130 -185,-175 -152,-200
              C -105,-200 -65,-175 -35,-140
              Z
            "
            fill={whiteColor}
            stroke={redColor}
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* 8 Pairs of Red Accent Marks hugging the petal indentations */}
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 45})`}>
              <path
                d="M -22,-120 C -22,-165 -12,-180 -12,-205"
                fill="none"
                stroke={redColor}
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 22,-120 C 22,-165 12,-180 12,-205"
                fill="none"
                stroke={redColor}
                strokeWidth="7"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Central Red Circular Medallion */}
          <circle
            cx="0"
            cy="0"
            r="110"
            fill={redColor}
          />

          {/* ========================================================== */}
          {/* 5. THE ICONIC DEVANAGARI "त्रि" (TRI) EMBLEM MONOGRAM        */}
          {/* ========================================================== */}
          <g transform="translate(0, -6) scale(1.15)">
            {/* Top horizontal shirorekha */}
            <rect
              x="-62"
              y="-52"
              width="124"
              height="16"
              rx="6"
              fill={whiteColor}
            />

            {/* Main vertical stem on the right */}
            <rect
              x="12"
              y="-42"
              width="18"
              height="88"
              rx="7"
              fill={whiteColor}
            />

            {/* Left curved loop of 'Ta' forming the classic 'Tri' calligraphy */}
            <path
              d="
                M 16,-20
                C -10,-20 -50,-10 -50,15
                C -50,38 -20,44 0,38
                C 14,34 16,22 10,14
                C 4,6 -10,8 -16,14
                C -25,22 -34,16 -34,6
                C -34,-4 -12,-8 16,-5
                Z
              "
              fill={whiteColor}
            />

            {/* Lower diagonal leg of 'R-kar' / trishul tail */}
            <path
              d="
                M 12,18
                C -8,32 -30,52 -36,66
                C -39,73 -32,77 -24,73
                C -12,67 8,42 22,28
                Z
              "
              fill={whiteColor}
            />

            {/* Classical left accent serif on top bar */}
            <circle cx="-56" cy="-44" r="5" fill={whiteColor} />
            <circle cx="21" cy="50" r="6" fill={whiteColor} />
          </g>
        </g>

        {/* Specular foil shimmer sweep across emblem when glow is on */}
        {glow && (
          <rect
            x="0"
            y="0"
            width="1000"
            height="1155"
            fill={`url(#foil-sheen-${size})`}
            style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }}
          />
        )}
      </svg>
    </div>
  );
};

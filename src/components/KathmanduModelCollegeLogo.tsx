import React from 'react';

interface KathmanduModelCollegeLogoProps {
  className?: string;
  size?: number;
  monochrome?: boolean;
  glow?: boolean;
}

/**
 * Official Kathmandu Model College (KMC) Logo
 * High-precision vector SVG matching official college branding:
 * - Deep teal / navy geometric chevron pointing left (#0A4B67)
 * - Lower inner cyan / turquoise curved wave (#00A8BA)
 * - Middle vibrant warm orange diagonal ribbon (#E26A27)
 * - Upper outer teal / blue diagonal ribbon (#187A96)
 * - Unified flat baseline with rounded aerodynamic contours
 */
export const KathmanduModelCollegeLogo: React.FC<KathmanduModelCollegeLogoProps> = ({
  className = '',
  size = 48,
  monochrome = false,
  glow = false,
}) => {
  const navyColor = monochrome ? '#0f172a' : '#0a4b67';
  const cyanColor = monochrome ? '#334155' : '#00a8ba';
  const orangeColor = monochrome ? '#475569' : '#e26a27';
  const tealColor = monochrome ? '#1e293b' : '#187a96';

  const width = size;
  const height = (size * 72) / 160;

  return (
    <div
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${
        glow ? 'filter drop-shadow-[0_0_6px_rgba(226,106,39,0.4)] drop-shadow-[0_0_3px_rgba(0,168,186,0.5)]' : ''
      } ${className}`}
      style={{ width, height }}
      title="Kathmandu Model College Logo"
    >
      <svg
        viewBox="0 0 200 90"
        width={width}
        height={height}
        className="w-full h-full object-contain drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(4, 0)">
          {/* 1. Left Navy/Deep Teal Chevron (<) */}
          <path
            d="M 54 8 
               C 58 8, 62 11, 60 16 
               L 41 43 
               C 39 46, 39 48, 41 51 
               L 59 78 
               C 61 82, 58 86, 53 86 
               L 36 86 
               C 27 86, 20 80, 16 72 
               L 9 52 
               C 7 47, 7 42, 9 37 
               L 16 20 
               C 21 12, 29 8, 38 8 
               Z"
            fill={navyColor}
          />

          {/* 2. Lower Cyan Wave / Curved Fin */}
          <path
            d="M 50 63 
               C 60 62, 70 65, 82 72 
               L 89 77 
               C 92 79, 90 86, 85 86 
               L 58 86 
               C 54 86, 49 84, 46 80 
               L 44 76 
               C 42 71, 45 64, 50 63 
               Z"
            fill={cyanColor}
          />

          {/* 3. Middle Vibrant Orange Ribbon */}
          <path
            d="M 75 16 
               C 85 16, 92 20, 99 28 
               L 137 77 
               C 140 81, 137 86, 132 86 
               L 115 86 
               C 109 86, 103 83, 99 77 
               L 68 37 
               C 65 33, 67 27, 71 21 
               C 72 18, 73 16, 75 16 
               Z"
            fill={orangeColor}
          />

          {/* 4. Upper Right Teal / Cyan Diagonal Ribbon */}
          <path
            d="M 103 8 
               C 114 8, 122 13, 129 22 
               L 174 77 
               C 177 81, 175 86, 170 86 
               L 153 86 
               C 147 86, 141 83, 137 77 
               L 97 27 
               C 92 20, 94 13, 100 9 
               C 101 8, 102 8, 103 8 
               Z"
            fill={tealColor}
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Clean Base64 Data URL of the Kathmandu Model College SVG Logo
 * for use in <img> tags, Canvas Elements, and Institute configurations
 */
export const KMC_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90" width="200" height="90">
  <g transform="translate(4, 0)">
    <path d="M 54 8 C 58 8, 62 11, 60 16 L 41 43 C 39 46, 39 48, 41 51 L 59 78 C 61 82, 58 86, 53 86 L 36 86 C 27 86, 20 80, 16 72 L 9 52 C 7 47, 7 42, 9 37 L 16 20 C 21 12, 29 8, 38 8 Z" fill="#0a4b67"/>
    <path d="M 50 63 C 60 62, 70 65, 82 72 L 89 77 C 92 79, 90 86, 85 86 L 58 86 C 54 86, 49 84, 46 80 L 44 76 C 42 71, 45 64, 50 63 Z" fill="#00a8ba"/>
    <path d="M 75 16 C 85 16, 92 20, 99 28 L 137 77 C 140 81, 137 86, 132 86 L 115 86 C 109 86, 103 83, 99 77 L 68 37 C 65 33, 67 27, 71 21 C 72 18, 73 16, 75 16 Z" fill="#e26a27"/>
    <path d="M 103 8 C 114 8, 122 13, 129 22 L 174 77 C 177 81, 175 86, 170 86 L 153 86 C 147 86, 141 83, 137 77 L 97 27 C 92 20, 94 13, 100 9 C 101 8, 102 8, 103 8 Z" fill="#187a96"/>
  </g>
</svg>`;

export const KMC_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(KMC_LOGO_SVG)}`;

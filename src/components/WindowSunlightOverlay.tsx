import React from 'react';

export type WindowStyle = 'casement_4pane' | 'sash_6pane' | 'venetian_blinds' | 'soft_window';
export type SunlightTone = 'golden_hour' | 'morning_daylight' | 'bright_noon';

interface WindowSunlightOverlayProps {
  style: WindowStyle;
  tone: SunlightTone;
  intensity?: number; // 0 - 100
  angleDeg?: number; // e.g. 35 to 55 deg
  showSpecularOnCard?: boolean;
  className?: string;
}

export const WindowSunlightOverlay: React.FC<WindowSunlightOverlayProps> = ({
  style,
  tone,
  intensity = 80,
  angleDeg = 40,
  className = '',
}) => {
  // Sunlight color palettes
  const colorMap = {
    golden_hour: {
      light: 'rgba(255, 215, 130, 0.45)',
      deepSun: 'rgba(255, 185, 80, 0.35)',
      ambientShadow: 'rgba(20, 10, 5, 0.55)',
      mullionShadow: 'rgba(15, 8, 4, 0.65)',
    },
    morning_daylight: {
      light: 'rgba(255, 245, 220, 0.40)',
      deepSun: 'rgba(255, 230, 180, 0.28)',
      ambientShadow: 'rgba(15, 18, 25, 0.50)',
      mullionShadow: 'rgba(10, 12, 18, 0.62)',
    },
    bright_noon: {
      light: 'rgba(255, 255, 245, 0.35)',
      deepSun: 'rgba(240, 245, 255, 0.22)',
      ambientShadow: 'rgba(12, 14, 20, 0.45)',
      mullionShadow: 'rgba(8, 10, 15, 0.58)',
    },
  };

  const pal = colorMap[tone] || colorMap.morning_daylight;
  const opacityMultiplier = intensity / 100;

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay ${className}`}
      style={{ opacity: opacityMultiplier }}
    >
      {/* Broad Sunlight Beam Shaft */}
      <div
        className="absolute -inset-1/2 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 25% 15%, ${pal.light} 0%, ${pal.deepSun} 45%, transparent 75%)
          `,
          transform: `rotate(${angleDeg - 45}deg)`,
        }}
      />

      {/* Realistic Window Architectural Cast Shadow Patterns */}
      <svg
        viewBox="0 0 1200 800"
        className="w-full h-full absolute inset-0"
        preserveAspectRatio="none"
        style={{
          filter: 'blur(14px)',
          opacity: 0.85,
        }}
      >
        <defs>
          <radialGradient id="sunBeamGrad" cx="20%" cy="10%" r="90%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#ffeedd" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {style === 'casement_4pane' && (
          <g transform={`rotate(${angleDeg - 40} 600 400)`}>
            {/* Dark room shadows with 4 bright window glass rectangles */}
            <rect x="-200" y="-200" width="1600" height="1200" fill={pal.mullionShadow} />
            
            {/* Top-Left Pane */}
            <polygon points="180,60 520,70 490,360 160,340" fill="#ffffff" opacity="0.65" />
            {/* Top-Right Pane */}
            <polygon points="560,72 900,85 860,380 530,362" fill="#ffffff" opacity="0.65" />
            {/* Bottom-Left Pane */}
            <polygon points="150,390 480,410 440,700 120,670" fill="#ffffff" opacity="0.6" />
            {/* Bottom-Right Pane */}
            <polygon points="520,412 850,430 810,720 480,702" fill="#ffffff" opacity="0.6" />
          </g>
        )}

        {style === 'sash_6pane' && (
          <g transform={`rotate(${angleDeg - 40} 600 400)`}>
            <rect x="-200" y="-200" width="1600" height="1200" fill={pal.mullionShadow} />
            {/* Row 1 */}
            <polygon points="200,60 480,65 460,260 190,250" fill="#ffffff" opacity="0.6" />
            <polygon points="520,66 800,72 770,270 500,262" fill="#ffffff" opacity="0.6" />
            {/* Row 2 */}
            <polygon points="185,280 455,290 435,480 170,470" fill="#ffffff" opacity="0.6" />
            <polygon points="495,292 765,302 740,490 475,482" fill="#ffffff" opacity="0.6" />
            {/* Row 3 */}
            <polygon points="165,505 430,515 410,700 150,685" fill="#ffffff" opacity="0.55" />
            <polygon points="470,517 735,528 710,710 450,702" fill="#ffffff" opacity="0.55" />
          </g>
        )}

        {style === 'venetian_blinds' && (
          <g transform={`rotate(${angleDeg - 40} 600 400)`}>
            <rect x="-200" y="-200" width="1600" height="1200" fill={pal.ambientShadow} />
            {/* Array of sunlit horizontal window slats */}
            {Array.from({ length: 12 }).map((_, i) => (
              <polygon
                key={i}
                points={`100,${40 + i * 62} 1050,${70 + i * 62} 1030,${102 + i * 62} 80,${72 + i * 62}`}
                fill="#ffffff"
                opacity="0.6"
              />
            ))}
          </g>
        )}

        {style === 'soft_window' && (
          <g>
            <radialGradient id="softWindowGrad" cx="30%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#000000" stopOpacity="0.5" />
            </radialGradient>
            <rect x="0" y="0" width="1200" height="800" fill="url(#softWindowGrad)" />
          </g>
        )}
      </svg>
    </div>
  );
};

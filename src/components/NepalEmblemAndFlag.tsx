import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * Official Coat of Arms of Nepal (नेपालको निशान छाप)
 * Reconstructed with Mount Everest, rhododendron garland, hands shaking,
 * map outline, and base ribbon.
 */
export const NepalCoatOfArms: React.FC<EmblemProps> = ({ className = '', size = 52 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size * 0.95 }}
      title="Coat of Arms of Nepal (नेपालको निशान छाप)"
    >
      <svg
        viewBox="0 0 200 190"
        width={size}
        height={size * 0.95}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nepal-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="70%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
          <linearGradient id="everest-snow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="hills-green" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="red-ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Outer Circular Laurel / Rhododendron Wreath */}
        <g stroke="#16a34a" strokeWidth="3" fill="#22c55e">
          {/* Left Wreath Leaves */}
          <path d="M 45 150 C 25 110 25 70 55 35" fill="none" strokeWidth="4" />
          <circle cx="32" cy="120" r="5" fill="#dc2626" />
          <circle cx="28" cy="95" r="5" fill="#dc2626" />
          <circle cx="35" cy="70" r="5" fill="#dc2626" />
          <circle cx="50" cy="48" r="5" fill="#dc2626" />

          {/* Right Wreath Leaves */}
          <path d="M 155 150 C 175 110 175 70 145 35" fill="none" strokeWidth="4" />
          <circle cx="168" cy="120" r="5" fill="#dc2626" />
          <circle cx="172" cy="95" r="5" fill="#dc2626" />
          <circle cx="165" cy="70" r="5" fill="#dc2626" />
          <circle cx="150" cy="48" r="5" fill="#dc2626" />
        </g>

        {/* Central Scenic Shield Circle */}
        <clipPath id="center-shield">
          <circle cx="100" cy="90" r="52" />
        </clipPath>

        <g clipPath="url(#center-shield)">
          {/* Sky */}
          <rect x="40" y="30" width="120" height="120" fill="url(#nepal-sky)" />

          {/* Mount Everest Peaks */}
          {/* Background Peaks */}
          <polygon points="65,95 85,60 105,95" fill="#94a3b8" />
          <polygon points="95,95 115,55 135,95" fill="#94a3b8" />
          {/* Foreground Everest Summit */}
          <polygon points="75,95 100,50 125,95" fill="url(#everest-snow)" stroke="#64748b" strokeWidth="1" />
          <polygon points="100,50 108,68 100,95" fill="#e2e8f0" />

          {/* Green Hills & Terai Fields */}
          <path d="M 45 105 Q 75 88 100 98 Q 125 108 155 92 L 155 145 L 45 145 Z" fill="url(#hills-green)" />
          <path d="M 45 118 Q 80 110 110 122 Q 135 114 155 125 L 155 145 L 45 145 Z" fill="#166534" />

          {/* Clasping / Shaking Hands (Male and Female Handshake for Equality) */}
          <g transform="translate(74, 116) scale(0.52)">
            {/* Left Hand */}
            <path d="M 5 20 Q 25 10 45 18 L 45 32 Q 25 36 5 28 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
            {/* Right Hand clasping */}
            <path d="M 95 20 Q 75 10 55 18 L 55 32 Q 75 36 95 28 Z" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
            <circle cx="50" cy="24" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
          </g>

          {/* Tiny Nepal Flag on Mountain Summit */}
          <path d="M 100 48 L 100 36 L 108 41 L 100 44 L 108 48 Z" fill="#dc2626" stroke="#1e3a8a" strokeWidth="0.8" />
        </g>

        {/* Shield Border */}
        <circle cx="100" cy="90" r="52" fill="none" stroke="#dc2626" strokeWidth="3" />
        <circle cx="100" cy="90" r="54" fill="none" stroke="#facc15" strokeWidth="1.2" />

        {/* Red Ribbon Banner at Base */}
        <g id="bottom-ribbon">
          <path
            d="M 30 162 Q 100 180 170 162 L 176 172 Q 100 190 24 172 Z"
            fill="url(#red-ribbon)"
            stroke="#7f1d1d"
            strokeWidth="1"
          />
          {/* Ribbon Ends */}
          <polygon points="24,172 16,164 26,158 30,165" fill="#991b1b" />
          <polygon points="176,172 184,164 174,158 170,165" fill="#991b1b" />

          {/* Golden Devanagari Inscription: जननी जन्मभूमिश्च स्वर्गादपि गरीयसी */}
          <text
            x="100"
            y="173"
            textAnchor="middle"
            fill="#fef08a"
            fontSize="6.8"
            fontWeight="bold"
            fontFamily="'Mukta', sans-serif"
            letterSpacing="0.2"
          >
            जननी जन्मभूमिश्च स्वर्गादपि गरीयसी
          </text>
        </g>
      </svg>
    </div>
  );
};

/**
 * Official Flag of Nepal (नेपालको राष्ट्रिय झण्डा)
 * Unique non-quadrilateral double-pennant flag with sun and crescent moon symbols.
 */
export const NepalFlag: React.FC<EmblemProps> = ({ className = '', size = 44 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size * 1.2 }}
      title="National Flag of Nepal (नेपालको राष्ट्रिय झण्डा)"
    >
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Blue Border Outer Pennant Path */}
        <path
          d="M 6 4 L 6 116 L 86 116 L 36 68 L 86 68 Z"
          fill="#003893"
          stroke="#003893"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Crimson Red Inner Field */}
        <path
          d="M 12 10 L 12 110 L 76 110 L 32 64 L 76 64 Z"
          fill="#DC143C"
        />

        {/* Upper Pennant: White Crescent Moon with 8 rays */}
        <g transform="translate(28, 40) scale(0.9)">
          <path
            d="M -12 0 A 12 12 0 0 0 12 0 A 9 9 0 0 1 -12 0"
            fill="#FFFFFF"
          />
          <circle cx="0" cy="5" r="4" fill="#FFFFFF" />
          {/* Moon rays */}
          <polygon points="0,5 -2,9 2,9" fill="#FFFFFF" />
          <polygon points="0,5 -5,8 -3,11" fill="#FFFFFF" />
          <polygon points="0,5 5,8 3,11" fill="#FFFFFF" />
        </g>

        {/* Lower Pennant: White 12-pointed Sun */}
        <g transform="translate(32, 88) scale(0.85)">
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          {/* 12 Sun Rays */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = Math.cos(angle) * 7;
            const y1 = Math.sin(angle) * 7;
            const x2 = Math.cos(angle) * 11;
            const y2 = Math.sin(angle) * 11;
            const xLeft = Math.cos(angle - 0.15) * 8;
            const yLeft = Math.sin(angle - 0.15) * 8;
            const xRight = Math.cos(angle + 0.15) * 8;
            const yRight = Math.sin(angle + 0.15) * 8;
            return (
              <polygon
                key={i}
                points={`${xLeft},${yLeft} ${x2},${y2} ${xRight},${yRight}`}
                fill="#FFFFFF"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

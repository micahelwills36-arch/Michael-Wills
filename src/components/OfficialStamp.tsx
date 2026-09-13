import React from 'react';

interface OfficialStampProps {
  type?: 'campus' | 'library';
  rotation?: number;
  date?: string;
  size?: number;
}

export const OfficialStamp: React.FC<OfficialStampProps> = ({
  type = 'campus',
  rotation = -8,
  date = '2022-12-15',
  size = 72,
}) => {
  return (
    <div
      className="pointer-events-none select-none relative"
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.85,
        mixBlendMode: 'multiply',
      }}
      title="Official University Stamp"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full text-red-700 filter drop-shadow-xs"
      >
        <defs>
          <path id="stamp-arc-top" d="M 16,50 A 34,34 0 1,1 84,50" fill="none" />
          <path id="stamp-arc-bottom" d="M 84,50 A 34,34 0 0,1 16,50" fill="none" />
          {/* Subtle weathered stamp texture filter */}
          <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#ink-bleed)" stroke="#b91c1c" fill="none">
          {/* Outer double circle */}
          <circle cx="50" cy="50" r="46" strokeWidth="2.4" strokeDasharray="98 2" />
          <circle cx="50" cy="50" r="40" strokeWidth="1.2" />

          {/* Top text arc */}
          <text
            fontSize="7"
            fontWeight="bold"
            fill="#b91c1c"
            letterSpacing="0.4"
            textAnchor="middle"
            stroke="none"
          >
            <textPath href="#stamp-arc-top" startOffset="50%">
              {type === 'campus' ? 'TRIBHUVAN UNIVERSITY' : 'T.U. CENTRAL LIBRARY'}
            </textPath>
          </text>

          {/* Bottom text arc */}
          <text
            fontSize="6.2"
            fontWeight="bold"
            fill="#b91c1c"
            letterSpacing="0.4"
            textAnchor="middle"
            stroke="none"
          >
            <textPath href="#stamp-arc-bottom" startOffset="50%">
              {type === 'campus' ? 'KATHMANDU, NEPAL' : 'KIRTIPUR, KATHMANDU'}
            </textPath>
          </text>

          {/* Center Box with verified date and stars */}
          <line x1="22" y1="41" x2="78" y2="41" strokeWidth="1.5" />
          <line x1="22" y1="59" x2="78" y2="59" strokeWidth="1.5" />
          
          <text
            x="50"
            y="52"
            fontSize="6.5"
            fontWeight="bold"
            fill="#b91c1c"
            textAnchor="middle"
            fontFamily="monospace"
            letterSpacing="0.5"
            stroke="none"
          >
            {type === 'campus' ? 'VERIFIED' : 'ISSUED'}
          </text>

          <text
            x="50"
            y="67"
            fontSize="5.2"
            fontWeight="bold"
            fill="#b91c1c"
            textAnchor="middle"
            stroke="none"
          >
            {date}
          </text>

          {/* Decorative side stars */}
          <polygon points="18,50 20,46 22,50 17,47 23,47" fill="#b91c1c" stroke="none" />
          <polygon points="80,50 82,46 84,50 79,47 85,47" fill="#b91c1c" stroke="none" />
        </g>
      </svg>
    </div>
  );
};

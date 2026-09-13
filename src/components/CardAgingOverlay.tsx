import React from 'react';

interface CardAgingOverlayProps {
  months: number;
  showBadge?: boolean;
}

export const CardAgingOverlay: React.FC<CardAgingOverlayProps> = ({ months, showBadge = false }) => {
  if (!months || months <= 0) return null;

  // Calculate intensity factors based on usage duration (1 to 24 months)
  // Scale non-linearly so 1-2 months gives subtle realistic scuffs, 3-4 months is noticeable wallet wear, 6-24 months is seasoned
  const t = Math.min(months / 12, 2.0); // 0.08 to 2.0
  const scratchOpacity = Math.min(0.12 + t * 0.32, 0.75);
  const cornerWearOpacity = Math.min(0.15 + t * 0.38, 0.85);
  const patinaOpacity = Math.min(0.08 + t * 0.22, 0.55);
  const matteWearOpacity = Math.min(0.06 + t * 0.18, 0.45);

  const getAgeLabel = () => {
    if (months === 1) return '1 Month Used • Fresh Pocket Transit';
    if (months === 2) return '2 Months Used • Slight Edge Friction';
    if (months === 3) return '3 Months Used • Natural Wallet Wear';
    if (months === 4) return '4 Months Used • Mid-Semester Use';
    if (months === 6) return '6 Months Used • Half-Year Circulation';
    if (months === 12) return '1 Year Used • Annual Renewal Patina';
    if (months >= 24) return `${Math.round(months / 12)} Years Used • Senior Card Patina`;
    return `${months} Months Used • Physical Wear`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden rounded-[inherit] select-none">
      {/* 1. Micro-Scratches & Hairline Pocket Friction Layer */}
      <svg
        className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none"
        style={{ opacity: scratchOpacity }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 420 265"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="scratch-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Diagonal wallet slot friction hairlines (light reflecting off micro-scratches in laminate) */}
        <g stroke="rgba(255, 255, 255, 0.9)" strokeWidth="0.6" strokeLinecap="round" filter="url(#scratch-glow)">
          {/* Top-right to center wallet slide scratches */}
          <path d="M 310 18 L 265 52" strokeDasharray="18 4 6 3" />
          <path d="M 345 28 L 290 74" strokeDasharray="24 6 12 4" strokeWidth="0.5" />
          <path d="M 280 8 L 240 40" strokeDasharray="12 5" strokeWidth="0.4" />

          {/* Center-left coin / key contact scratches */}
          <path d="M 45 110 Q 75 118 105 112" strokeDasharray="20 4 8 2" strokeWidth="0.5" />
          <path d="M 60 135 Q 90 142 125 138" strokeDasharray="30 5" strokeWidth="0.4" />
          
          {/* Cardholder friction horizontal swipe marks */}
          <path d="M 120 215 L 290 218" strokeDasharray="45 8 25 6" strokeWidth="0.6" />
          <path d="M 140 228 L 330 231" strokeDasharray="60 10 30 5" strokeWidth="0.4" />
          
          {/* Random fine curved micro-abrasions */}
          <path d="M 180 85 Q 188 95 195 90" strokeWidth="0.5" />
          <path d="M 215 140 Q 225 148 238 142" strokeWidth="0.4" />
          <path d="M 95 175 Q 102 182 110 178" strokeWidth="0.5" />
          <path d="M 320 160 Q 332 172 342 165" strokeWidth="0.4" />
        </g>

        {/* Darker microscopic scuff lines (micro-crevices catching shadow) */}
        <g stroke="rgba(30, 41, 59, 0.28)" strokeWidth="0.5" strokeLinecap="round">
          <path d="M 311 19 L 266 53" strokeDasharray="18 4 6 3" />
          <path d="M 46 111 Q 76 119 106 113" strokeDasharray="20 4 8 2" />
          <path d="M 121 216 L 291 219" strokeDasharray="45 8 25 6" />
          <path d="M 181 86 Q 189 96 196 91" />
        </g>

        {/* Extra scratches for cards >= 3 months */}
        {months >= 3 && (
          <g stroke="rgba(255, 255, 255, 0.85)" strokeWidth="0.55" strokeLinecap="round">
            <path d="M 80 45 L 140 75" strokeDasharray="22 6 8 3" />
            <path d="M 230 170 Q 255 185 285 175" strokeDasharray="35 7" />
            <path d="M 360 90 L 385 115" strokeDasharray="12 4" />
            <path d="M 25 70 L 55 95" strokeDasharray="16 5" />
          </g>
        )}

        {/* Heavy usage marks for cards >= 6 months */}
        {months >= 6 && (
          <g stroke="rgba(255, 255, 255, 0.8)" strokeWidth="0.6" strokeLinecap="round">
            <path d="M 160 35 L 220 50" strokeDasharray="28 6 14 4" />
            <path d="M 30 190 Q 60 210 90 205" strokeDasharray="30 8" />
            <path d="M 270 120 L 340 145" strokeDasharray="40 9" />
            <path d="M 190 235 L 245 240" strokeDasharray="20 5" />
          </g>
        )}
      </svg>

      {/* 2. Authentic Laminate Corner Softening & Micro-Stress Creases */}
      {/* In physical cards in pockets, the 4 outer laminate corners get slightly stressed/cloudy */}
      <div
        className="absolute top-0 left-0 w-8 h-8 pointer-events-none rounded-tl-xl"
        style={{
          opacity: cornerWearOpacity,
          backgroundImage: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 80%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-8 h-8 pointer-events-none rounded-tr-xl"
        style={{
          opacity: cornerWearOpacity,
          backgroundImage: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.25) 40%, transparent 80%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none rounded-bl-xl"
        style={{
          opacity: cornerWearOpacity,
          backgroundImage: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.2) 40%, transparent 80%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none rounded-br-xl"
        style={{
          opacity: cornerWearOpacity * 1.15,
          backgroundImage: 'radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.28) 45%, transparent 80%)',
        }}
      />

      {/* 3. Natural Sebum / Thumb Grip Patina (Faint warm contact wear from daily holding) */}
      <div
        className="absolute bottom-1 right-2 w-24 h-16 pointer-events-none rounded-full blur-md"
        style={{
          opacity: patinaOpacity,
          backgroundImage: 'radial-gradient(circle, rgba(180, 150, 110, 0.16) 0%, rgba(200, 180, 140, 0.08) 50%, transparent 85%)',
        }}
      />
      <div
        className="absolute bottom-1 left-2 w-20 h-14 pointer-events-none rounded-full blur-md"
        style={{
          opacity: patinaOpacity * 0.7,
          backgroundImage: 'radial-gradient(circle, rgba(180, 150, 110, 0.14) 0%, transparent 80%)',
        }}
      />

      {/* 4. Subtle Surface Lamination Satin Friction Haze */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: matteWearOpacity,
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 35%, rgba(0,0,0,0.08) 70%, rgba(255,255,255,0.15) 100%)',
        }}
      />

      {/* 5. Optional Small Inspection Tag showing card usage duration */}
      {showBadge && (
        <div className="absolute top-1 left-1 pointer-events-none z-30">
          <span className="text-[6.5px] font-mono font-bold bg-amber-500/90 text-white px-1.5 py-0.2 rounded-xs shadow-2xs uppercase tracking-wider">
            {months}M IN USE
          </span>
        </div>
      )}
    </div>
  );
};

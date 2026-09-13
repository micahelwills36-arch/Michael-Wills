import React from 'react';

export type HandPose =
  | 'left_edge_grip'
  | 'corner_hold'
  | 'pinch_hold'
  | 'top_edge_hold'
  | 'right_edge_grip'
  | 'resting_beside'
  | 'none';

export type SkinTone = 'fair' | 'olive' | 'tan' | 'deep';

export interface RealisticHandOverlayProps {
  pose: HandPose;
  skinTone: SkinTone;
  cardWidth?: number;
  cardHeight?: number;
  sunlightAngle?: number;
  sunlightWarmth?: number;
  className?: string;
  isInsideCard?: boolean; // When true, rendered inside the card's 3D transform container
}

export const SKIN_PALETTES = {
  fair: {
    base: '#f5ccb0',
    mid: '#e4ae8f',
    shadow: '#ba7958',
    deepShadow: '#7a3e25',
    highlight: '#ffebdc',
    subsurface: '#d94b26', // warm red subsurface scatter
    vein: '#a8bbbe',
    nailBed: '#f2b5aa',
    nailLunula: '#fff4f0',
    nailEdge: '#fdf6ee',
    nailHighlight: '#ffffff',
    knuckle: '#c7805f',
    crease: '#854427',
  },
  olive: {
    base: '#dc9f72',
    mid: '#c48253',
    shadow: '#965a32',
    deepShadow: '#5e3215',
    highlight: '#fae2cb',
    subsurface: '#c43d1a',
    vein: '#8f9f98',
    nailBed: '#e29e84',
    nailLunula: '#f5e4d5',
    nailEdge: '#faedd9',
    nailHighlight: '#ffffff',
    knuckle: '#a4653a',
    crease: '#693819',
  },
  tan: {
    base: '#ba7344',
    mid: '#9f592c',
    shadow: '#783b16',
    deepShadow: '#471f08',
    highlight: '#e3a172',
    subsurface: '#a43212',
    vein: '#766e66',
    nailBed: '#c07e60',
    nailLunula: '#ebd2bf',
    nailEdge: '#f2dfcf',
    nailHighlight: '#ffffff',
    knuckle: '#84441c',
    crease: '#4f2209',
  },
  deep: {
    base: '#6b3c20',
    mid: '#532b13',
    shadow: '#3a1b09',
    deepShadow: '#220e04',
    highlight: '#915634',
    subsurface: '#82240b',
    vein: '#4c3931',
    nailBed: '#7c482c',
    nailLunula: '#c29b82',
    nailEdge: '#d5b39c',
    nailHighlight: '#ffffff',
    knuckle: '#4b210c',
    crease: '#230b02',
  },
};

export const RealisticHandOverlay: React.FC<RealisticHandOverlayProps> = ({
  pose,
  skinTone,
  cardWidth = 460,
  cardHeight = 290,
  sunlightAngle = 45,
  className = '',
  isInsideCard = true,
}) => {
  if (pose === 'none') return null;

  const pal = SKIN_PALETTES[skinTone] || SKIN_PALETTES.olive;

  // Calculate directional shadow offsets based on sunlight angle
  const rad = (sunlightAngle * Math.PI) / 180;
  const shadowX = Math.round(Math.cos(rad) * 9);
  const shadowY = Math.round(Math.sin(rad) * 13) + 4;

  // Common SVG Defs (Pores, Fingerprints, Subsurface gradients, Nail gloss)
  const renderDefs = (prefix: string) => (
    <defs>
      {/* Micro Skin Pore Texture Generator Filter */}
      <filter id={`${prefix}_skinTexture`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="noise" />
        <feColorMatrix
          type="matrix"
          values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.14 0"
          result="monoNoise"
        />
        <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" />
      </filter>

      {/* Realistic Multi-Layer Contact Shadow Filter */}
      <filter id={`${prefix}_contactShadow`} x="-30%" y="-30%" width="160%" height="160%">
        {/* Direct contact occlusion (black, tight) */}
        <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.75" />
        {/* Ambient directional body cast shadow */}
        <feDropShadow
          dx={shadowX}
          dy={shadowY}
          stdDeviation="10"
          floodColor="#150a04"
          floodOpacity="0.5"
        />
      </filter>

      {/* Thumb 3D Cylindrical Volume Gradient */}
      <linearGradient id={`${prefix}_thumbGrad`} x1="10%" y1="15%" x2="85%" y2="85%">
        <stop offset="0%" stopColor={pal.highlight} />
        <stop offset="25%" stopColor={pal.base} />
        <stop offset="70%" stopColor={pal.mid} />
        <stop offset="100%" stopColor={pal.shadow} />
      </linearGradient>

      {/* Subsurface Translucent Flesh Rim Gradient (Backlight Red Scatter) */}
      <linearGradient id={`${prefix}_subsurfaceRim`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={pal.subsurface} stopOpacity="0.7" />
        <stop offset="18%" stopColor={pal.base} stopOpacity="0" />
      </linearGradient>

      {/* Forearm & Palm Muscle (Thenar Eminence) Gradient */}
      <linearGradient id={`${prefix}_palmGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={pal.highlight} stopOpacity="0.85" />
        <stop offset="35%" stopColor={pal.base} />
        <stop offset="75%" stopColor={pal.mid} />
        <stop offset="100%" stopColor={pal.shadow} />
      </linearGradient>

      {/* Fingernail Multilayer Translucent Keratin & Vascular Bed */}
      <linearGradient id={`${prefix}_nailGrad`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor={pal.nailBed} />
        <stop offset="70%" stopColor={pal.nailBed} />
        <stop offset="100%" stopColor={pal.nailEdge} />
      </linearGradient>

      <linearGradient id={`${prefix}_nailGloss`} x1="0%" y1="0%" x2="100%" y2="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      {/* Subcutaneous Vein Pattern Gradient */}
      <linearGradient id={`${prefix}_veinGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={pal.vein} stopOpacity="0.28" />
        <stop offset="100%" stopColor={pal.base} stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  // ---------------------------------------------------------------------------
  // POSE 1: LEFT EDGE NATURAL GRIP (Most common real cardholder verification)
  // ---------------------------------------------------------------------------
  if (pose === 'left_edge_grip') {
    return (
      <div
        className={`pointer-events-none select-none z-30 ${
          isInsideCard ? 'absolute -inset-16 overflow-visible' : 'absolute inset-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.55))',
          }}
        >
          {renderDefs('left_edge')}

          {/* 1. FOREARM & WRIST ENTERING FROM BOTTOM-LEFT */}
          <g filter="url(#left_edge_skinTexture)">
            {/* Forearm base mass */}
            <path
              d="M -160,780 C -120,620 -70,510 10,430 C 50,390 90,360 135,345 C 160,335 175,340 195,365 C 220,400 225,470 190,550 C 150,640 100,720 20,820 Z"
              fill="url(#left_edge_palmGrad)"
            />

            {/* Subtle anatomical wrist tendon & vein contour */}
            <path
              d="M -30,680 C 10,580 50,500 110,440"
              stroke="url(#left_edge_veinGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M -10,720 C 30,620 70,550 130,490"
              stroke="url(#left_edge_veinGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />

            {/* Thenar eminence (fleshy muscular thumb base) */}
            <ellipse
              cx="135"
              cy="435"
              rx="62"
              ry="44"
              transform="rotate(-28 135 435)"
              fill="url(#left_edge_palmGrad)"
              opacity="0.95"
            />
          </g>

          {/* 2. REAR SUPPORTING FINGER PADS (Curling behind card edge) */}
          <g opacity="0.95">
            {/* Index finger tip behind card */}
            <ellipse
              cx="138"
              cy="270"
              rx="32"
              ry="22"
              transform="rotate(-18 138 270)"
              fill={pal.shadow}
            />
            <ellipse
              cx="146"
              cy="268"
              rx="22"
              ry="16"
              transform="rotate(-18 146 268)"
              fill={pal.mid}
            />

            {/* Middle finger pad behind card */}
            <ellipse
              cx="135"
              cy="410"
              rx="36"
              ry="24"
              transform="rotate(12 135 410)"
              fill={pal.shadow}
            />
            <ellipse
              cx="144"
              cy="410"
              rx="25"
              ry="18"
              transform="rotate(12 144 410)"
              fill={pal.mid}
            />
          </g>

          {/* 3. FRONT THUMB PRESSING DIRECTLY ON CARD FACE */}
          <g filter="url(#left_edge_contactShadow)">
            {/* Thumb base phalanx */}
            <path
              d="M 65,370 C 95,320 145,290 195,300 C 235,310 262,335 258,370 C 252,405 220,432 175,438 C 130,442 85,420 65,370 Z"
              fill="url(#left_edge_thumbGrad)"
            />

            {/* Distal phalanx (thumb pad flattened naturally on plastic surface) */}
            <path
              d="M 180,305 C 215,315 250,338 248,368 C 245,395 224,420 188,424 C 168,425 152,410 156,388 C 162,355 168,322 180,305 Z"
              fill="url(#left_edge_thumbGrad)"
              filter="url(#left_edge_skinTexture)"
            />

            {/* Subsurface red scatter on light-facing edge */}
            <path
              d="M 175,305 C 210,314 246,335 247,365"
              stroke={pal.subsurface}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* 4. ANATOMICALLY DETAILED KERATIN FINGERNAIL */}
            {/* Nail plate base */}
            <path
              d="M 198,325 C 224,332 238,348 235,368 C 231,385 215,394 196,389 C 187,386 183,374 185,360 C 188,340 192,328 198,325 Z"
              fill="url(#left_edge_nailGrad)"
            />

            {/* Nail Lunula (pale white crescent moon at cuticle) */}
            <path
              d="M 190,345 C 193,338 198,335 204,338 C 200,350 195,355 190,358 Z"
              fill={pal.nailLunula}
              opacity="0.85"
            />

            {/* Natural free edge tip of nail */}
            <path
              d="M 226,346 C 236,358 234,374 220,387"
              stroke={pal.nailEdge}
              strokeWidth="1.8"
              fill="none"
              opacity="0.8"
            />

            {/* Cuticle rim (eponychium) */}
            <path
              d="M 194,328 C 188,348 188,368 193,382"
              stroke={pal.crease}
              strokeWidth="1.4"
              strokeOpacity="0.5"
              fill="none"
            />

            {/* Window Light Specular Sheen across curved nail */}
            <ellipse
              cx="214"
              cy="352"
              rx="11"
              ry="4.5"
              transform="rotate(18 214 352)"
              fill="url(#left_edge_nailGloss)"
            />

            {/* Micro window pane highlight bar */}
            <rect
              x="208"
              y="348"
              width="9"
              height="2"
              transform="rotate(18 208 348)"
              fill="#ffffff"
              opacity="0.9"
              rx="1"
            />

            {/* 5. REALISTIC FLEXION CREASES & FINGERPRINT WHORL RIDGES */}
            {/* Knuckle flexion creases */}
            <path
              d="M 118,345 Q 128,360 122,382"
              stroke={pal.crease}
              strokeWidth="2.4"
              strokeOpacity="0.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 134,340 Q 143,356 138,378"
              stroke={pal.crease}
              strokeWidth="2.0"
              strokeOpacity="0.45"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 152,342 Q 160,354 156,370"
              stroke={pal.crease}
              strokeWidth="1.6"
              strokeOpacity="0.38"
              strokeLinecap="round"
              fill="none"
            />

            {/* Fine fingerprint friction ridges on pressed thumb pad */}
            <g stroke={pal.deepShadow} strokeWidth="0.8" strokeOpacity="0.22" fill="none">
              <path d="M 168,360 Q 174,370 172,382" />
              <path d="M 172,355 Q 180,368 178,385" />
              <path d="M 176,352 Q 185,365 183,388" />
              <path d="M 180,350 Q 190,363 188,390" />
            </g>

            {/* Top skin highlight rim */}
            <path
              d="M 105,325 C 140,305 180,300 215,312"
              stroke={pal.highlight}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </g>
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // POSE 2: CORNER NATURAL PINCH / HOLD (Holding bottom-left corner)
  // ---------------------------------------------------------------------------
  if (pose === 'corner_hold') {
    return (
      <div
        className={`pointer-events-none select-none z-30 ${
          isInsideCard ? 'absolute -inset-16 overflow-visible' : 'absolute inset-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            filter: 'drop-shadow(0 22px 38px rgba(0, 0, 0, 0.6))',
          }}
        >
          {renderDefs('corner_hold')}

          {/* Forearm entering from bottom */}
          <g filter="url(#corner_hold_skinTexture)">
            <path
              d="M -70,780 C -20,620 40,530 110,480 C 150,450 190,455 225,480 C 260,515 255,600 215,780 Z"
              fill="url(#corner_hold_palmGrad)"
            />

            {/* Vein texture */}
            <path
              d="M 5,740 C 45,630 85,550 140,490"
              stroke="url(#corner_hold_veinGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </g>

          {/* Supporting index knuckle beneath corner */}
          <ellipse
            cx="170"
            cy="470"
            rx="38"
            ry="25"
            transform="rotate(-30 170 470)"
            fill={pal.shadow}
            opacity="0.9"
          />

          {/* Front Thumb on bottom corner */}
          <g filter="url(#corner_hold_contactShadow)">
            <path
              d="M 65,580 C 105,505 155,465 208,475 C 255,485 272,525 256,565 C 240,600 198,625 145,630 C 95,635 70,610 65,580 Z"
              fill="url(#corner_hold_thumbGrad)"
              filter="url(#corner_hold_skinTexture)"
            />

            {/* Flattened thumb tip */}
            <ellipse
              cx="222"
              cy="522"
              rx="36"
              ry="26"
              transform="rotate(-28 222 522)"
              fill="url(#corner_hold_thumbGrad)"
            />

            {/* Red subsurface light bleed */}
            <path
              d="M 190,480 C 225,488 258,510 256,540"
              stroke={pal.subsurface}
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Keratin Fingernail */}
            <path
              d="M 218,500 C 238,504 250,518 244,535 C 238,548 224,554 212,548 C 204,544 201,532 205,518 C 208,508 212,502 218,500 Z"
              fill="url(#corner_hold_nailGrad)"
            />

            {/* Lunula */}
            <ellipse
              cx="210"
              cy="514"
              rx="5.5"
              ry="4"
              transform="rotate(-25 210 514)"
              fill={pal.nailLunula}
              opacity="0.85"
            />

            {/* Nail sheen highlight */}
            <ellipse
              cx="228"
              cy="520"
              rx="8.5"
              ry="3.5"
              transform="rotate(-20 228 520)"
              fill="url(#corner_hold_nailGloss)"
            />

            {/* Knuckle Wrinkles */}
            <path
              d="M 135,530 Q 148,546 144,568"
              stroke={pal.crease}
              strokeWidth="2.2"
              strokeOpacity="0.45"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 160,520 Q 172,538 167,558"
              stroke={pal.crease}
              strokeWidth="2.0"
              strokeOpacity="0.4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Fingerprint ridges */}
            <g stroke={pal.deepShadow} strokeWidth="0.8" strokeOpacity="0.2" fill="none">
              <path d="M 200,535 Q 208,545 206,558" />
              <path d="M 205,530 Q 214,542 212,560" />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // POSE 3: PRECISION PINCH (Thumb + Forefinger pinching upper corner)
  // ---------------------------------------------------------------------------
  if (pose === 'pinch_hold') {
    return (
      <div
        className={`pointer-events-none select-none z-30 ${
          isInsideCard ? 'absolute -inset-16 overflow-visible' : 'absolute inset-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            filter: 'drop-shadow(0 20px 32px rgba(0, 0, 0, 0.52))',
          }}
        >
          {renderDefs('pinch')}

          {/* Forefinger curled behind card */}
          <path
            d="M 115,190 C 150,145 205,135 238,160 C 255,178 250,205 222,225 C 195,242 162,230 115,190 Z"
            fill={pal.shadow}
          />
          <ellipse cx="230" cy="182" rx="20" ry="14" fill={pal.mid} />

          {/* Thumb on top pressing card */}
          <g filter="url(#pinch_contactShadow)">
            <path
              d="M -110,520 C -50,370 15,250 85,200 C 125,175 165,185 185,220 C 205,260 175,350 95,520 Z"
              fill="url(#pinch_palmGrad)"
              filter="url(#pinch_skinTexture)"
            />

            <path
              d="M 105,230 C 142,192 195,198 228,235 C 242,255 238,280 210,296 C 178,306 142,290 105,230 Z"
              fill="url(#pinch_thumbGrad)"
              filter="url(#pinch_skinTexture)"
            />

            {/* Fingernail */}
            <path
              d="M 194,226 C 210,230 220,242 215,258 C 210,268 198,272 188,265 C 182,260 183,250 185,238 Z"
              fill="url(#pinch_nailGrad)"
            />
            {/* Lunula */}
            <ellipse
              cx="187"
              cy="239"
              rx="4"
              ry="3"
              transform="rotate(15 187 239)"
              fill={pal.nailLunula}
              opacity="0.8"
            />
            {/* Specular */}
            <ellipse
              cx="202"
              cy="245"
              rx="7"
              ry="2.8"
              transform="rotate(15 202 245)"
              fill="url(#pinch_nailGloss)"
            />
          </g>
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // POSE 4: TOP EDGE TWO-FINGER HOLD (Fingers resting on top plastic edge)
  // ---------------------------------------------------------------------------
  if (pose === 'top_edge_hold') {
    return (
      <div
        className={`pointer-events-none select-none z-30 ${
          isInsideCard ? 'absolute -inset-16 overflow-visible' : 'absolute inset-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            filter: 'drop-shadow(0 18px 30px rgba(0, 0, 0, 0.5))',
          }}
        >
          {renderDefs('top_edge')}

          {/* Hand descending from top */}
          <g filter="url(#top_edge_contactShadow)">
            {/* Index finger */}
            <path
              d="M 380,-100 C 385,20 395,80 405,120 C 412,145 425,165 440,165 C 455,165 465,145 460,120 C 450,70 440,10 435,-100 Z"
              fill="url(#top_edge_thumbGrad)"
              filter="url(#top_edge_skinTexture)"
            />
            {/* Index nail */}
            <path
              d="M 420,125 C 430,126 448,126 452,145 C 452,156 440,160 430,158 C 422,155 418,145 420,125 Z"
              fill="url(#top_edge_nailGrad)"
            />
            <ellipse cx="436" cy="144" rx="6" ry="2.5" fill="url(#top_edge_nailGloss)" />

            {/* Middle finger */}
            <path
              d="M 470,-100 C 475,10 485,75 498,125 C 506,152 520,172 536,172 C 550,172 560,150 554,122 C 545,65 530,0 525,-100 Z"
              fill="url(#top_edge_thumbGrad)"
              filter="url(#top_edge_skinTexture)"
            />
            {/* Middle nail */}
            <path
              d="M 515,130 C 525,131 544,131 548,150 C 548,162 535,166 525,164 C 516,160 513,150 515,130 Z"
              fill="url(#top_edge_nailGrad)"
            />
            <ellipse cx="532" cy="148" rx="6" ry="2.5" fill="url(#top_edge_nailGloss)" />

            {/* Subsurface light rims */}
            <path
              d="M 405,120 C 415,150 435,165 450,165"
              stroke={pal.subsurface}
              strokeWidth="2.5"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M 498,125 C 508,155 530,172 546,172"
              stroke={pal.subsurface}
              strokeWidth="2.5"
              fill="none"
              opacity="0.5"
            />
          </g>
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // POSE 5: RIGHT EDGE NATURAL GRIP (Mirror hand for right-handed capture)
  // ---------------------------------------------------------------------------
  if (pose === 'right_edge_grip') {
    return (
      <div
        className={`pointer-events-none select-none z-30 ${
          isInsideCard ? 'absolute -inset-16 overflow-visible' : 'absolute inset-0'
        } ${className}`}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            transform: 'scaleX(-1)',
            filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.55))',
          }}
        >
          {renderDefs('right_edge')}

          {/* Mirror forearm & thumb using identical high-def anatomy */}
          <g filter="url(#right_edge_skinTexture)">
            <path
              d="M -160,780 C -120,620 -70,510 10,430 C 50,390 90,360 135,345 C 160,335 175,340 195,365 C 220,400 225,470 190,550 C 150,640 100,720 20,820 Z"
              fill="url(#right_edge_palmGrad)"
            />
          </g>

          <g opacity="0.95">
            <ellipse
              cx="138"
              cy="270"
              rx="32"
              ry="22"
              transform="rotate(-18 138 270)"
              fill={pal.shadow}
            />
            <ellipse
              cx="135"
              cy="410"
              rx="36"
              ry="24"
              transform="rotate(12 135 410)"
              fill={pal.shadow}
            />
          </g>

          <g filter="url(#right_edge_contactShadow)">
            <path
              d="M 65,370 C 95,320 145,290 195,300 C 235,310 262,335 258,370 C 252,405 220,432 175,438 C 130,442 85,420 65,370 Z"
              fill="url(#right_edge_thumbGrad)"
            />
            <path
              d="M 180,305 C 215,315 250,338 248,368 C 245,395 224,420 188,424 C 168,425 152,410 156,388 C 162,355 168,322 180,305 Z"
              fill="url(#right_edge_thumbGrad)"
              filter="url(#right_edge_skinTexture)"
            />
            <path
              d="M 198,325 C 224,332 238,348 235,368 C 231,385 215,394 196,389 C 187,386 183,374 185,360 C 188,340 192,328 198,325 Z"
              fill="url(#right_edge_nailGrad)"
            />
            <path
              d="M 190,345 C 193,338 198,335 204,338 C 200,350 195,355 190,358 Z"
              fill={pal.nailLunula}
              opacity="0.85"
            />
            <ellipse
              cx="214"
              cy="352"
              rx="11"
              ry="4.5"
              transform="rotate(18 214 352)"
              fill="url(#right_edge_nailGloss)"
            />
            <path
              d="M 118,345 Q 128,360 122,382"
              stroke={pal.crease}
              strokeWidth="2.4"
              strokeOpacity="0.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 134,340 Q 143,356 138,378"
              stroke={pal.crease}
              strokeWidth="2.0"
              strokeOpacity="0.45"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // POSE 6: NATURAL HAND RESTING BESIDE ON DESK
  // ---------------------------------------------------------------------------
  if (pose === 'resting_beside') {
    return (
      <div className={`absolute inset-0 pointer-events-none z-20 select-none ${className}`}>
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full overflow-visible"
          style={{
            filter: 'drop-shadow(0 25px 40px rgba(0, 0, 0, 0.62))',
          }}
        >
          {renderDefs('resting')}

          <g filter="url(#resting_skinTexture)">
            {/* Wrist entering */}
            <path
              d="M -90,520 C -30,470 30,430 95,415 C 145,405 188,422 205,460 C 212,500 170,555 90,600 C 30,630 -30,640 -90,610 Z"
              fill="url(#resting_palmGrad)"
            />

            {/* Relaxed fingers lying on wood tabletop */}
            {/* Index */}
            <path
              d="M 165,420 C 210,402 262,408 288,432 C 298,444 290,460 270,465 C 235,468 192,458 165,420 Z"
              fill="url(#resting_thumbGrad)"
            />
            <ellipse cx="278" cy="442" rx="7" ry="4" fill={pal.nailBed} />
            <ellipse cx="282" cy="440" rx="3.5" ry="1.5" fill="#ffffff" opacity="0.6" />

            {/* Middle */}
            <path
              d="M 160,448 C 218,435 278,445 298,472 C 308,485 298,500 276,504 C 235,508 190,495 160,448 Z"
              fill="url(#resting_thumbGrad)"
            />
            <ellipse cx="290" cy="480" rx="7.5" ry="4" fill={pal.nailBed} />
            <ellipse cx="294" cy="478" rx="4" ry="1.8" fill="#ffffff" opacity="0.6" />

            {/* Ring */}
            <path
              d="M 148,485 C 198,478 255,490 275,515 C 282,526 274,538 252,542 C 215,544 175,528 148,485 Z"
              fill={pal.shadow}
            />
          </g>
        </svg>
      </div>
    );
  }

  return null;
};

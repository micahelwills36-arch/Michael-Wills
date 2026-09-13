import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Camera,
  Trash2,
  User,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Shield,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { NepalDrivingLicenseDetails } from '../types';
import { processSignatureTransparent } from '../utils/signatureTrim';

export interface NepalDrivingLicenseState {
  dlNo: string;
  bg: string;
  doi: string;
  doe: string;
  fullName: string;
  address: string;
  licenseOffice: string;
  dob: string;
  fhName: string;
  citizenshipNo: string;
  passportNo: string;
  contactNo: string;
  category: string;
  userPhoto: string;
  holderSignature: string;
  issuedBySignature?: string;
}

export interface NepalDrivingLicenseEditorProps {
  details?: Partial<NepalDrivingLicenseDetails>;
  onChange?: (updated: NepalDrivingLicenseDetails) => void;
  className?: string;
}

// Authentic sample presets based on official Nepal Department of Transport Management licenses
const SAMPLE_NEPAL_DL: NepalDrivingLicenseState = {
  dlNo: '01-06-00123456',
  bg: 'B+',
  doi: '23-03-2010',
  doe: '21-03-2025',
  fullName: 'RAM BAHADUR THAPA',
  address: 'Sindhupalchok, Bagmati,\nNepal',
  licenseOffice: 'Lalitpur',
  dob: '23-08-1992',
  fhName: 'KRISHNA B. THAPA',
  citizenshipNo: '27-01-70-12345',
  passportNo: '0',
  contactNo: '9841234567',
  category: 'A, B',
  userPhoto: '',
  holderSignature: '',
  issuedBySignature: '',
};

const BLOOD_GROUPS = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];

const COMMON_OFFICES = [
  'Lalitpur',
  'Ekantakuna, Lalitpur',
  'Thulobharang, KTM',
  'Chabahil, KTM',
  'Radhe Radhe, Bhaktapur',
  'Pokhara, Kaski',
  'Butwal, Rupandehi',
  'Biratnagar, Morang',
  'Birgunj, Parsa',
  'Nepalgunj, Banke',
];

const CATEGORY_PRESETS = ['A', 'B', 'A, B', 'A, B, C', 'B, C', 'C', 'C1', 'D', 'E', 'F', 'G', 'H', 'K'];

/**
 * Pure Vector SVG Nepal Driving License (Front) Card Component
 * 
 * 100% INLINE SVG - NO EXTERNAL IMAGE DEPENDENCIES:
 * - Mathematical Guilloche security patterns & micro-text background
 * - Vector Nepal Coat of Arms emblem
 * - Vector National Flag of Nepal
 * - Vector Smart Chip with metallic gold circuit traces
 * - Vector Nepal Map silhouette
 * - Exact text placement for all 15 dynamic variables
 * - B&W laser-engraving SVG filter for photo frame
 */
export const NepalDrivingLicenseSvg: React.FC<{
  details: Partial<NepalDrivingLicenseState>;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  className?: string;
  id?: string;
}> = ({ details, svgRef, className = '', id = 'nepal-driving-license-svg' }) => {
  // Safe values with authentic fallbacks
  const dlNo = details.dlNo || '01-06-00123456';
  const bg = details.bg || 'B+';
  const doi = details.doi || '23-03-2010';
  const doe = details.doe || '21-03-2025';
  const fullName = (details.fullName || 'RAM BAHADUR THAPA').toUpperCase();
  const address = details.address || 'Sindhupalchok, Bagmati,\nNepal';
  const licenseOffice = details.licenseOffice || 'Lalitpur';
  const dob = details.dob || '23-08-1992';
  const fhName = (details.fhName || 'KRISHNA B. THAPA').toUpperCase();
  const citizenshipNo = details.citizenshipNo || '27-01-70-12345';
  const passportNo = details.passportNo ?? '0';
  const contactNo = details.contactNo || '9841234567';
  const category = details.category || 'A, B';
  const userPhoto = details.userPhoto || '';
  const holderSignature = details.holderSignature || '';
  const issuedBySignature = details.issuedBySignature || '';

  // Process address into 2 lines for crisp, authentic layout
  const addressLines = useMemo(() => {
    const raw = address.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    if (raw.includes('\n')) {
      const parts = raw.split('\n').map((s) => s.trim()).filter(Boolean);
      return [parts[0] || '', parts.slice(1).join(', ')];
    }
    if (raw.includes(',')) {
      const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const mid = Math.ceil(parts.length / 2);
        return [parts.slice(0, mid).join(', ') + ',', parts.slice(mid).join(', ')];
      }
    }
    if (raw.length > 28) {
      const spaceIdx = raw.lastIndexOf(' ', 28);
      if (spaceIdx !== -1) {
        return [raw.substring(0, spaceIdx), raw.substring(spaceIdx + 1)];
      }
    }
    return [raw, ''];
  }, [address]);

  // Generate authentic guilloche circular rosette loops (32 radial petals)
  const rosettePetals = useMemo(() => {
    const cx = 510;
    const cy = 345;
    const petals = [];
    const count = 32;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      const nextAngle = ((i + 1) * 2 * Math.PI) / count;
      const rInner = 35;
      const rOuter = 195;
      const x0 = cx + Math.cos(angle) * rInner;
      const y0 = cy + Math.sin(angle) * rInner;
      const x1 = cx + Math.cos(angle + 0.3) * rOuter;
      const y1 = cy + Math.sin(angle + 0.3) * rOuter;
      const x2 = cx + Math.cos(nextAngle) * rInner;
      const y2 = cy + Math.sin(nextAngle) * rInner;
      petals.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
    return petals;
  }, []);

  // Generate second harmonic golden rosette petals
  const goldRosettePetals = useMemo(() => {
    const cx = 510;
    const cy = 345;
    const petals = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + 0.15;
      const nextAngle = ((i + 1) * 2 * Math.PI) / count + 0.15;
      const rInner = 55;
      const rOuter = 160;
      const x0 = cx + Math.cos(angle) * rInner;
      const y0 = cy + Math.sin(angle) * rInner;
      const x1 = cx + Math.cos(angle + 0.4) * rOuter;
      const y1 = cy + Math.sin(angle + 0.4) * rOuter;
      const x2 = cx + Math.cos(nextAngle) * rInner;
      const y2 = cy + Math.sin(nextAngle) * rInner;
      petals.push(`M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }
    return petals;
  }, []);

  return (
    <svg
      ref={svgRef}
      id={id}
      viewBox="0 0 1000 630"
      className={`w-full h-auto select-none rounded-[16px] overflow-hidden ${className}`}
      style={{
        aspectRatio: '1000 / 630',
        fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, Arial, sans-serif",
      }}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        {/* Soft green-to-blue background gradient */}
        <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d1f2e6" />
          <stop offset="35%" stopColor="#ebf8f3" />
          <stop offset="68%" stopColor="#e2f2fa" />
          <stop offset="100%" stopColor="#cee6f7" />
        </linearGradient>

        {/* Security Micro-Pattern Overlay Lines */}
        <pattern
          id="micro-security-pattern"
          width="240"
          height="28"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-15)"
        >
          <text
            x="0"
            y="10"
            fontSize="5.2"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fill="#0369a1"
            opacity="0.14"
            letterSpacing="0.8"
          >
            GOVERNMENT OF NEPAL DRIVING LICENSE
          </text>
          <text
            x="0"
            y="22"
            fontSize="5.2"
            fontFamily="'Mukta', Arial, sans-serif"
            fontWeight="bold"
            fill="#047857"
            opacity="0.13"
            letterSpacing="0.8"
          >
            नेपाल सरकार सवारी चालक अनुमतिपत्र
          </text>
        </pattern>

        {/* Smart Chip Metallic Gold Gradient */}
        <linearGradient id="gold-chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Smart Chip Contact Pad Shading */}
        <linearGradient id="chip-pad-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        {/* High-Fidelity Black & White Laser Photo Filter */}
        <filter id="nepal-laser-photo" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              0.299 0.587 0.114 0 0
              0.299 0.587 0.114 0 0
              0.299 0.587 0.114 0 0
              0     0     0     1 0
            "
          />
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.18" intercept="-0.06" />
            <feFuncG type="linear" slope="1.18" intercept="-0.06" />
            <feFuncB type="linear" slope="1.18" intercept="-0.06" />
          </feComponentTransfer>
        </filter>

        {/* Bounding Box Clipping Paths */}
        <clipPath id="card-corner-clip">
          <rect x="0" y="0" width="1000" height="630" rx="26" ry="26" />
        </clipPath>

        <clipPath id="photo-box-clip">
          <rect x="735" y="135" width="190" height="235" rx="6" ry="6" />
        </clipPath>

        <clipPath id="issued-sign-clip">
          <rect x="65" y="495" width="260" height="75" rx="6" ry="6" />
        </clipPath>

        <clipPath id="holder-sign-clip">
          <rect x="675" y="495" width="260" height="75" rx="6" ry="6" />
        </clipPath>

        {/* Nepal Coat of Arms Sky & Mountain Gradients */}
        <linearGradient id="emblem-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="60%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>

        <linearGradient id="emblem-snow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>

      {/* ========================================================================= */}
      {/* 1. BACKGROUND & SECURITY VECTOR LAYER                                     */}
      {/* ========================================================================= */}
      <g clipPath="url(#card-corner-clip)">
        {/* Soft pastel green-to-blue card surface */}
        <rect x="0" y="0" width="1000" height="630" fill="url(#card-bg-gradient)" />

        {/* Micro-pattern repeating security text overlay */}
        <rect x="0" y="0" width="1000" height="630" fill="url(#micro-security-pattern)" />

        {/* Central Radiating Guilloche Rosettes (Vector Mathematical Curves) */}
        <g opacity="0.32">
          {/* Outer Emerald Rosette Loops */}
          {rosettePetals.map((d, i) => (
            <path key={`green-petal-${i}`} d={d} fill="none" stroke="#059669" strokeWidth="1.1" />
          ))}

          {/* Inner Golden Rosette Loops */}
          {goldRosettePetals.map((d, i) => (
            <path key={`gold-petal-${i}`} d={d} fill="none" stroke="#d97706" strokeWidth="1.2" />
          ))}

          {/* Concentric Geometric Watermark Rings */}
          <circle cx="510" cy="345" r="55" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="510" cy="345" r="105" fill="none" stroke="#10b981" strokeWidth="1.2" />
          <circle cx="510" cy="345" r="155" fill="none" stroke="#0284c7" strokeWidth="0.9" strokeDasharray="4,4" />
          <circle cx="510" cy="345" r="205" fill="none" stroke="#10b981" strokeWidth="1" />
        </g>

        {/* Subtle Guilloche Horizontal Wavy Ribbons across card */}
        <path
          d="M -50 200 C 150 170 350 230 550 200 C 750 170 950 230 1050 200"
          fill="none"
          stroke="#059669"
          strokeWidth="1.4"
          opacity="0.18"
        />
        <path
          d="M -50 215 C 150 185 350 245 550 215 C 750 185 950 245 1050 215"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
          opacity="0.18"
        />
        <path
          d="M -50 430 C 200 460 450 400 700 440 C 850 460 950 430 1050 440"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.2"
          opacity="0.16"
        />

        {/* Outer Card Subtle Security Border */}
        <rect
          x="1"
          y="1"
          width="998"
          height="628"
          rx="25"
          ry="25"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          opacity="0.5"
        />
      </g>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER VECTOR ASSETS & TITLES                                      */}
      {/* ========================================================================= */}
      {/* (Left) Nepal Coat of Arms Emblem Vector */}
      <g transform="translate(62, 26) scale(0.48)" id="nepal-emblem-vector">
        {/* Rhododendron Floral Wreath Leaves */}
        <g stroke="#15803d" strokeWidth="3.5" fill="#16a34a">
          <path d="M 45 150 C 20 110 20 68 55 35" fill="none" strokeWidth="4.5" />
          <path d="M 155 150 C 180 110 180 68 145 35" fill="none" strokeWidth="4.5" />
          {/* Red Rhododendron Flowers */}
          <circle cx="28" cy="120" r="6" fill="#dc2626" />
          <circle cx="24" cy="95" r="6" fill="#dc2626" />
          <circle cx="32" cy="70" r="6" fill="#dc2626" />
          <circle cx="48" cy="48" r="6" fill="#dc2626" />
          <circle cx="172" cy="120" r="6" fill="#dc2626" />
          <circle cx="176" cy="95" r="6" fill="#dc2626" />
          <circle cx="168" cy="70" r="6" fill="#dc2626" />
          <circle cx="152" cy="48" r="6" fill="#dc2626" />
        </g>

        {/* Scenic Center Shield */}
        <circle cx="100" cy="90" r="53" fill="url(#emblem-sky)" />
        {/* Mount Everest Peaks */}
        <polygon points="65,95 85,60 105,95" fill="#94a3b8" />
        <polygon points="95,95 115,55 135,95" fill="#94a3b8" />
        <polygon points="75,95 100,48 125,95" fill="url(#emblem-snow)" stroke="#475569" strokeWidth="1" />
        {/* Green Hills */}
        <path d="M 47 104 Q 75 88 100 98 Q 125 108 153 92 L 153 143 L 47 143 Z" fill="#22c55e" />
        <path d="M 47 116 Q 80 110 110 120 Q 135 112 153 124 L 153 143 L 47 143 Z" fill="#15803d" />
        {/* Golden Handshake of Equality */}
        <g transform="translate(74, 114) scale(0.52)">
          <path d="M 5 20 Q 25 10 45 18 L 45 32 Q 25 36 5 28 Z" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
          <path d="M 95 20 Q 75 10 55 18 L 55 32 Q 75 36 95 28 Z" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="50" cy="24" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        </g>
        {/* Shield Border */}
        <circle cx="100" cy="90" r="53" fill="none" stroke="#dc2626" strokeWidth="3.5" />
        <circle cx="100" cy="90" r="55.5" fill="none" stroke="#facc15" strokeWidth="1.5" />

        {/* Bottom Red Motto Ribbon */}
        <path
          d="M 28 162 Q 100 180 172 162 L 178 174 Q 100 192 22 174 Z"
          fill="#b91c1c"
          stroke="#7f1d1d"
          strokeWidth="1.2"
        />
        <text
          x="100"
          y="173"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="6.8"
          fontWeight="bold"
          fontFamily="'Mukta', sans-serif"
        >
          जननी जन्मभूमिश्च स्वर्गादपि गरीयसी
        </text>
      </g>

      {/* (Right) National Flag of Nepal Vector */}
      <g transform="translate(860, 24) scale(0.72)" id="nepal-flag-vector">
        {/* Dark Blue Border */}
        <path
          d="M 6 4 L 6 116 L 86 116 L 36 68 L 86 68 Z"
          fill="#003893"
          stroke="#003893"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Crimson Red Inner Field */}
        <path d="M 12 10 L 12 110 L 76 110 L 32 64 L 76 64 Z" fill="#DC143C" />
        {/* Upper Pennant: White Crescent Moon with 8 rays */}
        <g transform="translate(28, 40) scale(0.9)">
          <path d="M -12 0 A 12 12 0 0 0 12 0 A 9 9 0 0 1 -12 0" fill="#FFFFFF" />
          <circle cx="0" cy="5" r="4.2" fill="#FFFFFF" />
          <polygon points="0,5 -2,9 2,9" fill="#FFFFFF" />
          <polygon points="0,5 -5,8 -3,11" fill="#FFFFFF" />
          <polygon points="0,5 5,8 3,11" fill="#FFFFFF" />
        </g>
        {/* Lower Pennant: White 12-pointed Sun */}
        <g transform="translate(32, 88) scale(0.85)">
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" />
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x2 = Math.cos(angle) * 11;
            const y2 = Math.sin(angle) * 11;
            const xLeft = Math.cos(angle - 0.16) * 7.8;
            const yLeft = Math.sin(angle - 0.16) * 7.8;
            const xRight = Math.cos(angle + 0.16) * 7.8;
            const yRight = Math.sin(angle + 0.16) * 7.8;
            return (
              <polygon
                key={i}
                points={`${xLeft.toFixed(1)},${yLeft.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${xRight.toFixed(1)},${yRight.toFixed(1)}`}
                fill="#FFFFFF"
              />
            );
          })}
        </g>
      </g>

      {/* (Center) Government Titles Header */}
      <g id="header-text-layer">
        {/* Line 1: Devanagari (Red) */}
        <text
          x="500"
          y="46"
          textAnchor="middle"
          fill="#b91c1c"
          fontSize="21"
          fontWeight="800"
          fontFamily="'Mukta', 'Noto Sans Devanagari', Arial, sans-serif"
          letterSpacing="0.5"
        >
          नेपाल सरकार
        </text>

        {/* Line 2: English (Red) */}
        <text
          x="500"
          y="72"
          textAnchor="middle"
          fill="#991b1b"
          fontSize="21"
          fontWeight="900"
          fontFamily="'Arial Black', Arial, sans-serif"
          letterSpacing="2"
        >
          GOVERNMENT OF NEPAL
        </text>

        {/* Line 3: Devanagari (Dark Blue) */}
        <text
          x="500"
          y="102"
          textAnchor="middle"
          fill="#1e3a8a"
          fontSize="20"
          fontWeight="800"
          fontFamily="'Mukta', 'Noto Sans Devanagari', Arial, sans-serif"
          letterSpacing="0.5"
        >
          सवारी चालक अनुमतिपत्र
        </text>

        {/* Line 4: English (Dark Navy) */}
        <text
          x="500"
          y="132"
          textAnchor="middle"
          fill="#0f172a"
          fontSize="24"
          fontWeight="900"
          fontFamily="'Arial Black', Arial, sans-serif"
          letterSpacing="3"
        >
          DRIVING LICENSE
        </text>
      </g>

      {/* ========================================================================= */}
      {/* 3. LEFT COLUMN: SMART CHIP, D.L., B.G., DATES, ISSUED BY                  */}
      {/* ========================================================================= */}
      <g id="left-column-layer">
        {/* 1. D.L.No. Printed Label & Dynamic Value */}
        <text x="65" y="185" fontSize="18" fontWeight="bold" fill="#000000">
          D.L.No.:
        </text>
        <text x="150" y="185" fontSize="19" fontWeight="bold" fill="#000000" letterSpacing="0.5">
          {dlNo}
        </text>

        {/* 2. B.G. Printed Label & Dynamic Value */}
        <text x="65" y="222" fontSize="18" fontWeight="bold" fill="#000000">
          B.G.:
        </text>
        <text x="125" y="222" fontSize="20" fontWeight="bold" fill="#000000">
          {bg}
        </text>

        {/* Vector Smart Chip Graphic */}
        <g id="smart-chip-graphic" transform="translate(100, 248)">
          {/* Chip Gold Base with beveled chamfer */}
          <rect
            x="0"
            y="0"
            width="135"
            height="160"
            rx="14"
            ry="14"
            fill="url(#gold-chip-grad)"
            stroke="#854d0e"
            strokeWidth="1.5"
          />

          {/* Circuit Groove Tracings (8 Contact Pad Divisions) */}
          <path
            d="M 0 80 L 135 80"
            fill="none"
            stroke="#713f12"
            strokeWidth="1.8"
          />
          {/* Center Circular Contact Island */}
          <circle cx="67.5" cy="80" r="24" fill="url(#chip-pad-grad)" stroke="#713f12" strokeWidth="1.8" />

          {/* Vertical and angled cutouts */}
          <path
            d="M 40 0 L 40 56 L 50 68"
            fill="none"
            stroke="#713f12"
            strokeWidth="1.8"
          />
          <path
            d="M 95 0 L 95 56 L 85 68"
            fill="none"
            stroke="#713f12"
            strokeWidth="1.8"
          />
          <path
            d="M 40 160 L 40 104 L 50 92"
            fill="none"
            stroke="#713f12"
            strokeWidth="1.8"
          />
          <path
            d="M 95 160 L 95 104 L 85 92"
            fill="none"
            stroke="#713f12"
            strokeWidth="1.8"
          />

          {/* Specular metallic highlight sheen */}
          <path
            d="M 5 5 L 130 5 L 125 15 L 10 15 Z"
            fill="#ffffff"
            opacity="0.35"
          />
        </g>

        {/* 3. D.O.I. Printed Label & Dynamic Value */}
        <text x="65" y="445" fontSize="18" fontWeight="bold" fill="#000000">
          D.O.I.:
        </text>
        <text x="145" y="445" fontSize="19" fontWeight="bold" fill="#000000">
          {doi}
        </text>

        {/* 4. D.O.E. Printed Label & Dynamic Value */}
        <text x="65" y="480" fontSize="18" fontWeight="bold" fill="#000000">
          D.O.E.:
        </text>
        <text x="145" y="480" fontSize="19" fontWeight="bold" fill="#000000">
          {doe}
        </text>

        {/* Bottom-Left Frame: "Issued By" signature box */}
        <g id="issued-by-frame">
          <rect
            x="65"
            y="495"
            width="260"
            height="75"
            rx="6"
            ry="6"
            fill="#f8fafc"
            stroke="#475569"
            strokeWidth="1.4"
            opacity="0.95"
          />
          {/* Label beneath frame */}
          <text
            x="195"
            y="596"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#000000"
          >
            Issued By
          </text>

          {/* Signature Rendering inside Issued By box */}
          {issuedBySignature ? (
            <image
              href={issuedBySignature}
              x="70"
              y="496"
              width="250"
              height="70"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#issued-sign-clip)"
              style={{ filter: 'contrast(1.25) brightness(0.95)' }}
            />
          ) : (
            /* Authentic official vector flourish signature */
            <g clipPath="url(#issued-sign-clip)" opacity="0.88">
              <path
                d="M 85 542 C 100 522 110 514 122 536 C 132 554 142 558 158 534 C 172 514 182 508 198 528 L 248 530"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 112 522 L 124 554"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 168 518 L 162 550"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      </g>

      {/* ========================================================================= */}
      {/* 4. CENTER COLUMN: IDENTITY DETAILS & MAP SILHOUETTE                       */}
      {/* ========================================================================= */}
      <g id="center-column-layer">
        {/* 5. Name: */}
        <text x="360" y="185" fontSize="18" fontWeight="bold" fill="#000000">
          Name:
        </text>
        <text x="435" y="185" fontSize="19" fontWeight="bold" fill="#000000">
          {fullName}
        </text>

        {/* 6. Address: (Multi-line SVG Text) */}
        <text x="360" y="222" fontSize="18" fontWeight="bold" fill="#000000">
          Address:
        </text>
        <text x="455" y="222" fontSize="18" fontWeight="bold" fill="#000000">
          {addressLines[0]}
        </text>
        {addressLines[1] && (
          <text x="455" y="244" fontSize="18" fontWeight="bold" fill="#000000">
            {addressLines[1]}
          </text>
        )}

        {/* 7. License Office: */}
        <text x="360" y="280" fontSize="18" fontWeight="bold" fill="#000000">
          License Office:
        </text>
        <text x="505" y="280" fontSize="19" fontWeight="bold" fill="#000000">
          {licenseOffice}
        </text>

        {/* 8. D.O.B.: */}
        <text x="360" y="318" fontSize="18" fontWeight="bold" fill="#000000">
          D.O.B.:
        </text>
        <text x="440" y="318" fontSize="19" fontWeight="bold" fill="#000000">
          {dob}
        </text>

        {/* 9. F/H Name: */}
        <text x="360" y="356" fontSize="18" fontWeight="bold" fill="#000000">
          F/H Name:
        </text>
        <text x="475" y="356" fontSize="19" fontWeight="bold" fill="#000000">
          {fhName}
        </text>

        {/* 10. Citizenship No.: */}
        <text x="360" y="394" fontSize="18" fontWeight="bold" fill="#000000">
          Citizenship No.:
        </text>
        <text x="515" y="394" fontSize="19" fontWeight="bold" fill="#000000">
          {citizenshipNo}
        </text>

        {/* 11. Passport No.: */}
        <text x="360" y="432" fontSize="18" fontWeight="bold" fill="#000000">
          Passport No.:
        </text>
        <text x="495" y="432" fontSize="19" fontWeight="bold" fill="#000000">
          {passportNo}
        </text>

        {/* 12. Contact No.: */}
        <text x="360" y="470" fontSize="18" fontWeight="bold" fill="#000000">
          Contact No.:
        </text>
        <text x="480" y="470" fontSize="19" fontWeight="bold" fill="#000000">
          {contactNo}
        </text>

        {/* Small Nepal Map Silhouette Vector (Centered near bottom) */}
        <g id="nepal-map-silhouette" transform="translate(485, 498)">
          <path
            d="M 5 28 C 12 20 25 18 36 21 C 46 12 60 7 74 11 C 88 2 108 -1 126 4 C 138 2 152 9 164 7 C 176 11 188 18 194 26 C 196 38 186 50 178 56 C 164 62 148 66 132 68 C 110 70 86 66 68 61 C 52 56 36 50 22 44 C 14 40 6 34 5 28 Z"
            fill="#4a151b"
            opacity="0.9"
          />
        </g>
      </g>

      {/* ========================================================================= */}
      {/* 5. RIGHT COLUMN: PHOTO BOX, CATEGORY, SIGNATURE OF HOLDER                */}
      {/* ========================================================================= */}
      <g id="right-column-layer">
        {/* 14. Passport Photo Box Frame (Top Right) */}
        <g id="passport-photo-frame">
          {/* Background Card Frame */}
          <rect
            x="735"
            y="135"
            width="190"
            height="235"
            rx="6"
            ry="6"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {userPhoto ? (
            /* Black & White Laser Photo Effect applied via SVG feColorMatrix filter */
            <image
              href={userPhoto}
              x="735"
              y="135"
              width="190"
              height="235"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#photo-box-clip)"
              filter="url(#nepal-laser-photo)"
            />
          ) : (
            /* Clean Vector Silhouette Placeholder */
            <g clipPath="url(#photo-box-clip)">
              <rect x="735" y="135" width="190" height="235" fill="#e2e8f0" />
              <g transform="translate(795, 185) scale(1.1)" opacity="0.45">
                <circle cx="32" cy="24" r="22" fill="#64748b" />
                <path d="M 0 85 C 0 55 16 48 32 48 C 48 48 64 55 64 85 Z" fill="#64748b" />
              </g>
              <text
                x="830"
                y="330"
                textAnchor="middle"
                fontSize="13"
                fontWeight="bold"
                fill="#64748b"
                letterSpacing="1"
              >
                PASSPORT PHOTO
              </text>
            </g>
          )}

          {/* Clean Border Highlight */}
          <rect
            x="735"
            y="135"
            width="190"
            height="235"
            rx="6"
            ry="6"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </g>

        {/* 13. Category: Printed Label & Bold 22px Dynamic Value */}
        <text x="740" y="425" fontSize="20" fontWeight="bold" fill="#000000">
          Category:
        </text>
        <text x="850" y="425" fontSize="22" fontWeight="900" fill="#000000">
          {category}
        </text>

        {/* 15. Bottom-Right Frame: "Signature of Holder" signature box */}
        <g id="holder-signature-frame">
          <rect
            x="675"
            y="495"
            width="260"
            height="75"
            rx="6"
            ry="6"
            fill="#f8fafc"
            stroke="#475569"
            strokeWidth="1.4"
            opacity="0.95"
          />
          {/* Label beneath frame */}
          <text
            x="805"
            y="596"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#000000"
          >
            Signature of Holder
          </text>

          {/* Holder Signature Rendering */}
          {holderSignature ? (
            <image
              href={holderSignature}
              x="680"
              y="496"
              width="250"
              height="70"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#holder-sign-clip)"
              style={{ filter: 'contrast(1.25) brightness(0.95)' }}
            />
          ) : (
            /* Subtle placeholder line / vector cursive hint */
            <g clipPath="url(#holder-sign-clip)" opacity="0.6">
              <path
                d="M 710 542 C 730 525 750 515 765 540 C 780 560 795 530 815 532 L 875 532"
                fill="none"
                stroke="#475569"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <text
                x="805"
                y="525"
                textAnchor="middle"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                (Holder Signature)
              </text>
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

/**
 * Complete Single-File Nepal Driving License (Front) Editor Module
 * Includes:
 * 1. Left Sidebar: Standard responsive form for all 15 variables
 * 2. Right Stage: Interactive live SVG preview scaling smoothly with 1000/630 ratio
 * 3. High-Res PNG Exporter: Rasterizes SVG to crisp 300 DPI PNG (3000 x 1890)
 */
export const NepalDrivingLicenseEditor: React.FC<NepalDrivingLicenseEditorProps> = ({
  details,
  onChange,
  className = '',
}) => {
  // Local state initialized with incoming details or authentic defaults
  const [formData, setFormData] = useState<NepalDrivingLicenseState>(() => ({
    dlNo: details?.dlNo ?? SAMPLE_NEPAL_DL.dlNo,
    bg: details?.bg ?? details?.bloodGroup ?? SAMPLE_NEPAL_DL.bg,
    doi: details?.doi ?? SAMPLE_NEPAL_DL.doi,
    doe: details?.doe ?? SAMPLE_NEPAL_DL.doe,
    fullName: details?.fullName ?? SAMPLE_NEPAL_DL.fullName,
    address: details?.address ?? SAMPLE_NEPAL_DL.address,
    licenseOffice: details?.licenseOffice ?? SAMPLE_NEPAL_DL.licenseOffice,
    dob: details?.dob ?? SAMPLE_NEPAL_DL.dob,
    fhName: details?.fhName ?? SAMPLE_NEPAL_DL.fhName,
    citizenshipNo: details?.citizenshipNo ?? SAMPLE_NEPAL_DL.citizenshipNo,
    passportNo: details?.passportNo ?? SAMPLE_NEPAL_DL.passportNo,
    contactNo: details?.contactNo ?? SAMPLE_NEPAL_DL.contactNo,
    category: details?.category ?? details?.categories ?? SAMPLE_NEPAL_DL.category,
    userPhoto: details?.userPhoto ?? details?.photoUrl ?? '',
    holderSignature: details?.holderSignature ?? details?.holderSignUrl ?? '',
    issuedBySignature: details?.issuedBySignature ?? details?.issuedBySignUrl ?? '',
  }));

  // Synchronize when external details change
  useEffect(() => {
    if (details) {
      setFormData((prev) => ({
        ...prev,
        dlNo: details.dlNo ?? prev.dlNo,
        bg: details.bg ?? details.bloodGroup ?? prev.bg,
        doi: details.doi ?? prev.doi,
        doe: details.doe ?? prev.doe,
        fullName: details.fullName ?? prev.fullName,
        address: details.address ?? prev.address,
        licenseOffice: details.licenseOffice ?? prev.licenseOffice,
        dob: details.dob ?? prev.dob,
        fhName: details.fhName ?? prev.fhName,
        citizenshipNo: details.citizenshipNo ?? prev.citizenshipNo,
        passportNo: details.passportNo ?? prev.passportNo,
        contactNo: details.contactNo ?? prev.contactNo,
        category: details.category ?? details.categories ?? prev.category,
        userPhoto: details.userPhoto ?? details.photoUrl ?? prev.userPhoto,
        holderSignature: details.holderSignature ?? details.holderSignUrl ?? prev.holderSignature,
        issuedBySignature: details.issuedBySignature ?? details.issuedBySignUrl ?? prev.issuedBySignature,
      }));
    }
  }, [details]);

  // Update field and notify parent callback
  const updateField = <K extends keyof NepalDrivingLicenseState>(
    field: K,
    value: NepalDrivingLicenseState[K]
  ) => {
    const next = { ...formData, [field]: value };
    setFormData(next);

    if (onChange) {
      onChange({
        ...(details as NepalDrivingLicenseDetails),
        ...next,
        bloodGroup: next.bg,
        categories: next.category,
        photoUrl: next.userPhoto,
        holderSignUrl: next.holderSignature,
        issuedBySignUrl: next.issuedBySignature || null,
        isPreprintedTemplate: false,
      });
    }
  };

  const svgRef = useRef<SVGSVGElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const signInputRef = useRef<HTMLInputElement | null>(null);
  const issuedSignInputRef = useRef<HTMLInputElement | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'details' | 'uploads'>('details');

  // Handle image upload (Photo & Signature with 100% Real Dark Ink processing)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'userPhoto' | 'holderSignature' | 'issuedBySignature'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (field === 'holderSignature' || field === 'issuedBySignature') {
          try {
            const cleanDarkSign = await processSignatureTransparent(dataUrl, {
              inkTone: 'deep_dark',
              autoCropMargins: true,
            });
            updateField(field, cleanDarkSign);
          } catch {
            updateField(field, dataUrl);
          }
        } else {
          updateField(field, dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // High-Resolution 300 DPI PNG Rasterization & Download
  const handleExportPng = async () => {
    if (!svgRef.current) return;
    setIsExporting(true);

    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // Create an SVG blob
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Standard 300 DPI CR-80 card resolution: 3000 x 1890 px (proportional 3x of 1000 x 630)
        const canvas = document.createElement('canvas');
        canvas.width = 3000;
        canvas.height = 1890;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, 3000, 1890);

          canvas.toBlob((blob) => {
            if (blob) {
              const downloadUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              const cleanDl = (formData.dlNo || 'Front').replace(/[^a-zA-Z0-9]/g, '_');
              link.download = `Nepal_Driving_License_${cleanDl}_300DPI.png`;
              link.href = downloadUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(downloadUrl);
            }
            URL.revokeObjectURL(blobUrl);
            setIsExporting(false);
          }, 'image/png');
        } else {
          URL.revokeObjectURL(blobUrl);
          setIsExporting(false);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        setIsExporting(false);
        alert('Could not render SVG to high-res PNG. Please ensure all uploaded photos are valid images.');
      };

      img.src = blobUrl;
    } catch (err) {
      console.error('Export PNG failed:', err);
      setIsExporting(false);
    }
  };

  const loadSampleRecord = () => {
    setFormData(SAMPLE_NEPAL_DL);
    if (onChange) {
      onChange({
        ...(details as NepalDrivingLicenseDetails),
        ...SAMPLE_NEPAL_DL,
        bloodGroup: SAMPLE_NEPAL_DL.bg,
        categories: SAMPLE_NEPAL_DL.category,
        photoUrl: '',
        holderSignUrl: '',
        issuedBySignUrl: null,
      });
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 text-slate-100 ${className}`}>
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/90 border border-slate-700 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Nepal Driving License (Front)</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Pure Vector SVG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero external image dependencies • CR-80 Standard (1000 × 630 px) • 300 DPI Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSampleRecord}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
            title="Load authentic sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Rasterizing 300 DPI...' : 'Export High-Res PNG'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Sidebar Form & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR: 15 INPUT FIELDS                                             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Tabs for Sidebar Sections */}
          <div className="flex items-center border-b border-slate-700 bg-slate-800/60 rounded-t-xl px-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Card Details (13 Fields)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('uploads')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'uploads'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo & Signatures (2 Fields)</span>
            </button>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-b-xl p-4 shadow-md space-y-4 max-h-[720px] overflow-y-auto custom-scrollbar">
            {activeTab === 'details' && (
              <>
                {/* SECTION 1: IDENTITY DETAILS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-700/60 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Cardholder Identity</span>
                  </div>

                  {/* 5. Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name (Name:)
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value.toUpperCase())}
                      placeholder="e.g. RAM BAHADUR THAPA"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white uppercase outline-none"
                    />
                  </div>

                  {/* 6. Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Address (Multi-line SVG Text)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Sindhupalchok, Bagmati,&#10;Nepal"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none resize-none"
                    />
                    <span className="text-[10px] text-slate-400">
                      Supports commas or enter key for line 1 / line 2 wrapping.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 8. D.O.B. */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        D.O.B. (DD-MM-YYYY)
                      </label>
                      <input
                        type="text"
                        value={formData.dob}
                        onChange={(e) => updateField('dob', e.target.value)}
                        placeholder="23-08-1992"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      />
                    </div>

                    {/* 2. Blood Group */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Blood Group (B.G.:)
                      </label>
                      <select
                        value={formData.bg}
                        onChange={(e) => updateField('bg', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      >
                        {BLOOD_GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 9. F/H Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Father / Husband Name (F/H Name:)
                    </label>
                    <input
                      type="text"
                      value={formData.fhName}
                      onChange={(e) => updateField('fhName', e.target.value.toUpperCase())}
                      placeholder="KRISHNA B. THAPA"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white uppercase outline-none"
                    />
                  </div>
                </div>

                {/* SECTION 2: LICENSE DATES & CATEGORIES */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-700/60 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>License Metadata & Dates</span>
                  </div>

                  {/* 1. D.L. No */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Driving License No. (D.L.No.:)
                    </label>
                    <input
                      type="text"
                      value={formData.dlNo}
                      onChange={(e) => updateField('dlNo', e.target.value)}
                      placeholder="01-06-00123456"
                      className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white tracking-wide outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 3. D.O.I. */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Date of Issue (D.O.I.:)
                      </label>
                      <input
                        type="text"
                        value={formData.doi}
                        onChange={(e) => updateField('doi', e.target.value)}
                        placeholder="23-03-2010"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      />
                    </div>

                    {/* 4. D.O.E. */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Date of Expiry (D.O.E.:)
                      </label>
                      <input
                        type="text"
                        value={formData.doe}
                        onChange={(e) => updateField('doe', e.target.value)}
                        placeholder="21-03-2025"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* 13. Category (Bold 22px) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Vehicle Category (Category: Bold 22px)
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono">A: Motorbike, B: Car</span>
                    </div>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => updateField('category', e.target.value.toUpperCase())}
                      placeholder="A, B"
                      className="w-full px-3 py-2 text-xs font-extrabold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none uppercase"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {CATEGORY_PRESETS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateField('category', cat)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                            formData.category === cat
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: OFFICE & IDENTIFICATION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-700/60 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Office & Documents</span>
                  </div>

                  {/* 7. License Office */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      License Office (License Office:)
                    </label>
                    <input
                      type="text"
                      list="office-options"
                      value={formData.licenseOffice}
                      onChange={(e) => updateField('licenseOffice', e.target.value)}
                      placeholder="Lalitpur"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                    />
                    <datalist id="office-options">
                      {COMMON_OFFICES.map((off) => (
                        <option key={off} value={off} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* 10. Citizenship No */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Citizenship No.:
                      </label>
                      <input
                        type="text"
                        value={formData.citizenshipNo}
                        onChange={(e) => updateField('citizenshipNo', e.target.value)}
                        placeholder="27-01-70-12345"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      />
                    </div>

                    {/* 11. Passport No */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Passport No.:
                      </label>
                      <input
                        type="text"
                        value={formData.passportNo}
                        onChange={(e) => updateField('passportNo', e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* 12. Contact No */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact No. (Phone):
                    </label>
                    <input
                      type="text"
                      value={formData.contactNo}
                      onChange={(e) => updateField('contactNo', e.target.value)}
                      placeholder="9841234567"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900/90 border border-slate-600 focus:border-emerald-500 text-white outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: PHOTO & SIGNATURE UPLOADS */}
            {activeTab === 'uploads' && (
              <div className="space-y-5">
                {/* 14. User Photo Upload */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>14. Cardholder Photo (Laser B&W Effect)</span>
                    </span>
                    {formData.userPhoto && (
                      <button
                        type="button"
                        onClick={() => updateField('userPhoto', '')}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'userPhoto')}
                  />

                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-all text-center"
                  >
                    {formData.userPhoto ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={formData.userPhoto}
                          alt="Holder Preview"
                          className="w-14 h-18 object-cover rounded shadow-md border border-slate-600"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-emerald-400 block">
                            Photo Loaded
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Click to replace with new image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-200">
                          Click or drop passport photo
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          SVG feColorMatrix automatically converts to authentic B&W laser print
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 15. Cardholder Signature Upload */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>15. Signature of Holder</span>
                    </span>
                    {formData.holderSignature && (
                      <button
                        type="button"
                        onClick={() => updateField('holderSignature', '')}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={signInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'holderSignature')}
                  />

                  <div
                    onClick={() => signInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-all text-center"
                  >
                    {formData.holderSignature ? (
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-12 bg-white rounded flex items-center justify-center p-1 border border-slate-600">
                          <img
                            src={formData.holderSignature}
                            alt="Holder Signature Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-emerald-400 block">
                            Signature Attached
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Transparent PNG recommended
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-xs font-semibold text-slate-200">
                          Upload cardholder signature
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Placed precisely in bottom-right "Signature of Holder" box
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Optional: Issued By Signature */}
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Officer Signature (Issued By - Optional)
                    </span>
                    {formData.issuedBySignature && (
                      <button
                        type="button"
                        onClick={() => updateField('issuedBySignature', '')}
                        className="text-[10px] text-slate-400 hover:text-red-300 cursor-pointer"
                      >
                        Reset to Vector Default
                      </button>
                    )}
                  </div>

                  <input
                    ref={issuedSignInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'issuedBySignature')}
                  />

                  <button
                    type="button"
                    onClick={() => issuedSignInputRef.current?.click()}
                    className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-center cursor-pointer transition-colors"
                  >
                    {formData.issuedBySignature
                      ? 'Custom Issuing Signature Loaded (Click to Change)'
                      : 'Upload Custom Issuing Authority Signature'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT STAGE: INTERACTIVE LIVE PREVIEW                                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Stage Controls & Resolution Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Live Vector Canvas</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
                • 1000 × 630 px
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-300 px-1">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer ml-1"
                title="Reset Fit"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scalable Card Mat Stage */}
          <div className="w-full flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden min-h-[480px]">
            <div
              className="w-full transition-transform duration-200 ease-out"
              style={{
                maxWidth: `${zoomLevel}%`,
                filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45))',
              }}
            >
              {/* Pure Inline Vector SVG Card Component */}
              <NepalDrivingLicenseSvg
                svgRef={svgRef}
                details={formData}
                className="shadow-2xl border border-slate-700/40"
              />
            </div>
          </div>

          {/* Technical Specifications Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero external bitmap dependencies</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Guilloche rosettes & micro-print vector</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>300 DPI proportional crisp raster export</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NepalDrivingLicenseEditor;

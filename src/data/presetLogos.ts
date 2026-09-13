export interface PresetLogo {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
}

const createSvgDataUrl = (svgContent: string): string => {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgContent.trim());
};

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'tu_classic_seal',
    name: 'Tribhuvan University Official Seal',
    category: 'University Seal',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#fbbf24" stroke-width="4"/>
        <circle cx="50" cy="50" r="38" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.5" stroke-dasharray="2,2"/>
        <polygon points="50,18 60,38 82,38 65,51 71,72 50,60 29,72 35,51 18,38 40,38" fill="#dc2626" stroke="#fbbf24" stroke-width="1"/>
        <circle cx="50" cy="46" r="8" fill="#fbbf24"/>
        <path d="M42 66 Q50 62 58 66 L55 76 Q50 74 45 76 Z" fill="#1e3a8a"/>
        <text x="50" y="86" font-size="5.5" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">ESTD. 1959</text>
      </svg>
    `),
  },
  {
    id: 'ioe_engineering_seal',
    name: 'IOE Pulchowk Engineering Seal',
    category: 'Engineering',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#0f766e" stroke="#f59e0b" stroke-width="3.5"/>
        <circle cx="50" cy="50" r="37" fill="#ffffff"/>
        <!-- Gear shape -->
        <path d="M46 22 L54 22 L55 28 L62 31 L67 27 L73 33 L69 38 L72 45 L78 46 L78 54 L72 55 L69 62 L73 67 L67 73 L62 69 L55 72 L54 78 L46 78 L45 72 L38 69 L33 73 L27 67 L31 62 L28 55 L22 54 L22 46 L28 45 L31 38 L27 33 L33 27 L38 31 L45 28 Z" fill="#0f766e"/>
        <circle cx="50" cy="50" r="14" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <path d="M45 42 L55 50 L45 58 Z" fill="#b45309"/>
      </svg>
    `),
  },
  {
    id: 'iom_medical_seal',
    name: 'IOM Medical Healthcare Seal',
    category: 'Medicine',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#15803d" stroke="#facc15" stroke-width="3"/>
        <circle cx="50" cy="50" r="38" fill="#ffffff"/>
        <!-- Red Cross & Rod of Asclepius -->
        <rect x="44" y="24" width="12" height="52" rx="3" fill="#dc2626"/>
        <rect x="24" y="44" width="52" height="12" rx="3" fill="#dc2626"/>
        <circle cx="50" cy="50" r="8" fill="#facc15" stroke="#15803d" stroke-width="2"/>
      </svg>
    `),
  },
  {
    id: 'trichandra_heritage_seal',
    name: 'Tri-Chandra Heritage Crest',
    category: 'Heritage',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#7c2d12" stroke="#fbbf24" stroke-width="3.5"/>
        <circle cx="50" cy="50" r="38" fill="#fffbeb"/>
        <!-- Ghantaghar Clock Tower Motif -->
        <path d="M42 68 L58 68 L55 38 L50 25 L45 38 Z" fill="#7c2d12"/>
        <circle cx="50" cy="46" r="5" fill="#fbbf24" stroke="#7c2d12" stroke-width="1"/>
        <path d="M50 43 L50 46 L53 46" stroke="#7c2d12" stroke-width="1"/>
      </svg>
    `),
  },
  {
    id: 'ascol_science_seal',
    name: 'ASCOL Science & Research Emblem',
    category: 'Science',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#1d4ed8" stroke="#38bdf8" stroke-width="3.5"/>
        <circle cx="50" cy="50" r="38" fill="#ffffff"/>
        <!-- Atom orbits -->
        <ellipse cx="50" cy="50" rx="26" ry="9" fill="none" stroke="#0284c7" stroke-width="2" transform="rotate(30 50 50)"/>
        <ellipse cx="50" cy="50" rx="26" ry="9" fill="none" stroke="#0284c7" stroke-width="2" transform="rotate(-30 50 50)"/>
        <ellipse cx="50" cy="50" rx="26" ry="9" fill="none" stroke="#0284c7" stroke-width="2" transform="rotate(90 50 50)"/>
        <circle cx="50" cy="50" r="6" fill="#dc2626"/>
      </svg>
    `),
  },
  {
    id: 'academic_laurel_crest',
    name: 'Academic Laurel & Open Book',
    category: 'Academic Crest',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r="46" fill="#312e81" stroke="#fbbf24" stroke-width="3.5"/>
        <circle cx="50" cy="50" r="38" fill="#ffffff"/>
        <!-- Open book -->
        <path d="M30 42 Q40 38 50 42 Q60 38 70 42 L70 64 Q60 60 50 64 Q40 60 30 64 Z" fill="#4338ca" stroke="#312e81" stroke-width="1.5"/>
        <line x1="50" y1="42" x2="50" y2="64" stroke="#fbbf24" stroke-width="2"/>
        <polygon points="50,22 43,33 57,33" fill="#f59e0b"/>
      </svg>
    `),
  },
  {
    id: 'vip_gold_star',
    name: 'VIP Elite Gold Star Shield',
    category: 'VIP / Loyalty',
    dataUrl: createSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <polygon points="50,6 88,20 88,60 50,94 12,60 12,20" fill="#78350f" stroke="#fbbf24" stroke-width="4"/>
        <polygon points="50,14 80,26 80,56 50,84 20,56 20,26" fill="#18181b"/>
        <polygon points="50,30 55,42 68,43 58,52 61,65 50,58 39,65 42,52 32,43 45,42" fill="#fbbf24" stroke="#fef08a" stroke-width="1"/>
      </svg>
    `),
  },
];

import defaultPassportPhoto from './assets/images/isabella_passport_photo_1788855003934.jpg';
import bedsheetBg from './assets/images/cotton_bedsheet_texture_1788855026587.jpg';
import marbleTableBg from './assets/images/marble_table_bg_1789032367551.jpg';
import woodTableBg from './assets/images/wood_table_bg_1789032384163.jpg';
import officeTableBg from './assets/images/office_table_bg_1789032402635.jpg';
import varnishedOakTableBg from './assets/images/varnished_oak_table_1789273514545.jpg';
import sunlightShadowWoodBg from './assets/images/sunlight_shadow_wood_1789273537621.jpg';
import {
  CAMPUS_CHIEF_SIGNATURE_DATA_URL,
  CHIEF_LIBRARIAN_SIGNATURE_DATA_URL,
} from './data/signatures';
import {
  StudentDetails,
  LibraryDetails,
  EmploymentDetails,
  LoyaltyDetails,
  RealismSettings,
  InstituteConfig,
  SignatureConfig,
  PhotoAdjustments,
  CardDesignConfig,
  VerificationRecord,
  AuditLogEntry,
  PresentationMockupSettings,
  RealisticMockupConfig,
  CornerShadowConfig,
  WatermarkConfig,
} from './types';

export const INITIAL_STUDENT_DETAILS: StudentDetails = {
  name: 'Isabella Rose',
  program: 'B.Sc. Computer Science & IT (B.Sc. CSIT)',
  department: 'Central Dept. of Computer Science & IT',
  rollNo: '167',
  session: '2022-2026 A.D',
  dateOfBirth: '1999 Feb 28',
  bloodGroup: 'A+',
  idNumber: 'TU-2022-0167',
  faculty: 'Institute of Science and Technology (IoST)',
  campusName: 'Central Campus, Kirtipur, Kathmandu',
  validUntil: '2026 Nov 30',
  emergencyContact: '+977-9841234567',
  address: 'Kathmandu-14, Bagmati Province, Nepal',
  level: 'Bachelor (Undergraduate)',
  academicYear: '2022-2026 A.D',
  registrationNo: '5-2-37-142-2022',
  issueDate: '2022 Dec 01',
};

export const INITIAL_LIBRARY_DETAILS: LibraryDetails = {
  memberNo: 'TUCL-2022-0167',
  cardType: 'Regular Student Borrower',
  borrowerCategory: 'Undergraduate (CSIT)',
  validUntil: '2026 Nov 30',
  bookLimit: 4,
  issueDate: '2022 Dec 15',
  libraryBranch: 'Central Library, Kirtipur',
};

export const INITIAL_EMPLOYMENT_DETAILS: EmploymentDetails = {
  employeeName: 'Dr. Isabella Rose',
  employeeId: 'EMP-KMC-84920',
  designation: 'Senior Lecturer & System Administrator',
  department: 'Dept. of Computer Science & Information Tech',
  employmentType: 'Full-Time Faculty / Permanent',
  accessLevel: 'Level 4 • Server & Research Lab Access',
  workLocation: 'Kathmandu Model College, Bagbazar, Kathmandu',
  issueDate: '2023 Jan 15',
  validUntil: '2028 Dec 31',
  bloodGroup: 'A+',
  emergencyContact: '+977-9841234567',
  companyOrOrgName: 'Kathmandu Model College',
  supervisorName: 'Prof. Dr. R. K. Sharma',
  supervisorTitle: 'Dean & Campus Chief',
};

export const INITIAL_LOYALTY_DETAILS: LoyaltyDetails = {
  memberName: 'Isabella Rose',
  memberId: 'VIP-9842-8821',
  tier: 'Gold VIP',
  pointsBalance: '5,420 PTS',
  memberSince: '2022',
  validUntil: '12/2028',
  programName: 'CAMPUS PRIVILEGE & ALUMNI REWARDS',
  organizationName: 'Kathmandu Model College',
  perksSummary: '15% Bookstore & Cafeteria Discount • Priority Parking • VIP Lounge Access',
  barcodeNumber: '890482019482',
  cashbackValue: '$54.20 Available',
};

export const INITIAL_INSTITUTE_CONFIG: InstituteConfig = {
  name: 'TRIBHUVAN UNIVERSITY',
  nativeName: 'त्रिभुवन विश्वविद्यालय',
  campusSubTitle: 'KATHMANDU, NEPAL',
  librarySubTitle: 'CENTRAL LIBRARY • KATHMANDU',
  customLogoUrl: null, // null means use official vector Shatkona emblem
  establishedText: 'Estd. 1959 A.D. (2016 B.S.)',
};

export const INITIAL_SIGNATURE_CONFIG: SignatureConfig = {
  studentSignatureUrl: null,
  studentSignatureText: 'Isabella R.',
  studentSignatureFont: "'Great Vibes', cursive",
  authoritySignatureUrl: CAMPUS_CHIEF_SIGNATURE_DATA_URL,
  authoritySignatureName: 'Prof. Dr. R. K. Sharma',
  authorityTitle: 'Campus Chief / Registrar',
  librarianSignatureUrl: CHIEF_LIBRARIAN_SIGNATURE_DATA_URL,
  librarianSignatureName: 'Mrs. S. Adhikari',
  librarianTitle: 'Chief Librarian / TUCL',
};

export const INITIAL_PHOTO_ADJUSTMENTS: PhotoAdjustments = {
  zoom: 1.0,
  offsetY: 0,
  offsetX: 0,
  brightness: 100,
  contrast: 100,
};

export const INITIAL_REALISM_SETTINGS: RealismSettings = {
  backgroundType: 'sunlight_wood', // authentic wooden table with window sunlight default
  bedsheetWrinkles: true,
  laminationGloss: 'realistic',
  shadowDepth: 'soft_bed',
  cameraAngle: 'handheld_slight',
  lightingAngle: 130,
  showOfficialStamp: true,
  showSignatures: true,
  laminateEdge: true,
  photoOpacity: 1.0, // 100% solid opacity
  
  // Graphics & Resolution Controls
  brightness: 99, // 99% prevents artificial digital RGB blowout
  contrast: 102, // 102% physical dye-sub punch
  saturation: 100,
  grain: 8,
  cameraEffect: 'clean_dslr',
  resolutionPreset: '4k_print',
  cardCornerRadius: 14,

  // Physical Realism Enhancements
  pvcTexture: 'matte_pvc',
  pvcCardThickness3D: true,
  printGrain: 18,
  cameraPerspectivePreset: 'natural_handheld',
  perspectiveDepth: 6,
  overheadLighting: 'natural_window',
  lightIntensity: 100,
  shadowStyle: 'soft_bed_occlusion',
  surfaceReflection: 35,
  lensVignette: 16,
  lensImperfection: true,
  scannerMode: false,
  antiGlareFinish: true,
  antiGlareStrength: 65,
  colorReproductionProfile: 'natural_dye_sub',

  // Outer Layer Shadow Filter & Intensity Control
  outerShadowIntensity: 65, // 65% default realistic bedsheet shadow
  outerShadowBlur: 28, // 28px blur radius
  outerShadowSpread: 1, // 1px spread

  // Card Usage Age / Wear & Tear Effect (0 to 24 months)
  cardAgeMonths: 0, // 0 = Mint condition, supports 1, 2, 3, 4, 6, 12, 24 months
  showCardAgeBadge: false,

  // Real Print Card Physical Effects
  logoGlow: true,
  watermarkHighlight: true,

  // Window Sunlight & Layout Arrangement
  windowSunlightEffect: true,
  windowShadowBars: true,
  dualCardArrangement: 'perpendicular',
  sunlightWarmth: 75,
};

export const ASSETS = {
  defaultPassportPhoto,
  bedsheetBg,
  varnishedOakTableBg,
  sunlightShadowWoodBg,
  woodTableBg,
  marbleTableBg,
  officeTableBg,
};

export const INITIAL_DESIGN_CONFIG: CardDesignConfig = {
  fontFamily: 'sans',
  fontSizeScale: 'standard',
  fontWeight: 'medium',
  letterSpacing: 'normal',
  backgroundStyle: 'classic_white',
  borderStyle: 'none',
  borderColor: '#2563eb',
  borderWidth: 1,
  cornerRadius: 12,
  showPrintGuides: false,
  showDimensions: false,
  photoSharpness: 10,
};

export const INITIAL_VERIFICATION_RECORD: VerificationRecord = {
  databaseId: 'TU-REG-2022-0167-KTM',
  issueDate: '2022-12-01',
  expiryDate: '2026-11-30',
  status: 'approved',
  verificationUrl: 'https://verify.tu.edu.np/records/TU-REG-2022-0167-KTM',
  barcodeData: 'TU20220167',
  qrData: 'TU-DB:REC#TU-REG-2022-0167-KTM|STATUS:VERIFIED|HOLDER:ISABELLA ROSE|VALID:2026-11-30',
  approvedBy: 'Prof. Dr. D.R. Shrestha (Registrar)',
  approvalDate: '2022-12-05',
  securityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  institutionRegistrationCode: 'TU-NEP-8492-ACAD',
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2022-12-01 09:30:14',
    user: 'Campus Admissions Portal',
    role: 'staff',
    action: 'Student ID Record Created',
    details: 'Initial credential entry registered under IoST Department of Computer Science & IT',
  },
  {
    id: 'log-2',
    timestamp: '2022-12-02 11:15:22',
    user: 'Biometric Station Kirtipur',
    role: 'staff',
    action: 'Passport Photograph Captured & Processed',
    details: 'Verified high-resolution optical facial crop and 100% opacity solid blend',
  },
  {
    id: 'log-3',
    timestamp: '2022-12-03 14:05:50',
    user: 'Central Library Branch Admin',
    role: 'staff',
    action: 'Library Circulation Privilege Provisioned',
    details: 'Member No TUCL-2022-0167 activated with 4 book borrowing limit',
  },
  {
    id: 'log-4',
    timestamp: '2022-12-05 16:45:10',
    user: 'Prof. Dr. D.R. Shrestha',
    role: 'admin',
    action: 'Official Institutional Sign-off & Approval',
    details: 'Approved & Issued with cryptographic validation hash and registrar seal',
  },
];

export const INITIAL_MOCKUP_SETTINGS: PresentationMockupSettings = {
  perspectiveTiltX: 12,
  perspectiveTiltY: -10,
  perspectiveDistance: 1200,
  rotationZ: -2,
  positionX: 0,
  positionY: 0,
  cardElevation: 16,
  background: 'neutral_grey',
  shadowIntensity: 65,
  shadowBlur: 32,
  shadowAngle: 135,
  lightingAngle: 45,
  lightIntensity: 65,
  specularSheen: 45,
  backgroundBlur: 3,
};

export const DEFAULT_CORNER_SHADOWS: CornerShadowConfig = {
  preset: 'natural',
  topLeft: 8,
  topRight: 10,
  bottomLeft: 18,
  bottomRight: 24,
  intensity: 65,
  blur: 28,
};

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: true,
  autoCardLogo: true,
  customLogoUrl: undefined,
  opacity: 0.18,
  scale: 1.0,
  highlight: true,
  showOnStudent: true,
  showOnLibrary: true,
  showOnWork: true,
  showOnLoyalty: true,
};

export const BACKGROUND_SURFACES = {
  varnished_oak: {
    id: 'varnished_oak',
    label: 'Varnished Oak (Ref 1)',
    desc: 'Glossy Oak Dining Surface with Natural Knots & Lacquer Sheen',
    imageUrl: varnishedOakTableBg,
  },
  sunlight_wood: {
    id: 'sunlight_wood',
    label: 'Sunlight & Shadow Wood (Ref 2)',
    desc: 'Teak Desk with Diagonal Window Sunlight & Soft Room Shadow',
    imageUrl: sunlightShadowWoodBg,
  },
  wood: {
    id: 'wood',
    label: 'Warm Oak Table',
    desc: 'Natural Warm Oak Wood Table',
    imageUrl: woodTableBg,
  },
  bedsheet: {
    id: 'bedsheet',
    label: 'Bed Sheet',
    desc: 'Wrinkled Cotton Fabric Bed Sheet',
    imageUrl: bedsheetBg,
  },
  marble: {
    id: 'marble',
    label: 'Marble Table',
    desc: 'Polished White Carrara Marble',
    imageUrl: marbleTableBg,
  },
  table: {
    id: 'table',
    label: 'Office Table',
    desc: 'Executive Modern Desk Table',
    imageUrl: officeTableBg,
  },
  neutral: {
    id: 'neutral',
    label: 'Studio Neutral',
    desc: 'Studio Clean Soft Grey Gradient',
    imageUrl: null,
  },
  dark_slate: {
    id: 'dark_slate',
    label: 'Dark Slate',
    desc: 'Luxury Dark Granite Tabletop',
    imageUrl: null,
  },
} as const;

export const DEFAULT_REALISTIC_MOCKUP_CONFIG: RealisticMockupConfig = {
  enabled: false,
  surface: 'varnished_oak',
  lighting: 'natural',
  material: 'pvc',
  wear: 'light',
  reflection: 'medium',
  shadow: 'medium',
  perspective: 'natural',
  effect: 'reality',
  cornerShadows: DEFAULT_CORNER_SHADOWS,
};


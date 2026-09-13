export interface StudentDetails {
  name: string;
  program: string;
  department: string;
  rollNo: string;
  session: string;
  dateOfBirth: string;
  bloodGroup: string;
  idNumber: string;
  faculty: string;
  campusName: string;
  validUntil: string;
  emergencyContact: string;
  address: string;
  level?: string;
  academicYear?: string;
  registrationNo?: string;
  issueDate?: string;
}

export interface LibraryDetails {
  memberNo: string;
  cardType: string;
  borrowerCategory: string;
  validUntil: string;
  bookLimit: number;
  issueDate: string;
  libraryBranch: string;
}

export interface EmploymentDetails {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  employmentType: string;
  accessLevel: string;
  workLocation: string;
  issueDate: string;
  validUntil: string;
  bloodGroup: string;
  emergencyContact: string;
  companyOrOrgName: string;
  supervisorName?: string;
  supervisorTitle?: string;
}

export interface LoyaltyDetails {
  memberName: string;
  memberId: string;
  tier: 'Gold VIP' | 'Platinum Elite' | 'Diamond Club' | 'Silver Privilege' | string;
  pointsBalance: string;
  memberSince: string;
  validUntil: string;
  programName: string;
  organizationName?: string;
  perksSummary: string;
  barcodeNumber: string;
  cashbackValue?: string;
}

export interface NepalDrivingLicenseState {
  dlNo: string; // 1. Driving License Number
  bg: string; // 2. Blood Group (e.g., "B+")
  doi: string; // 3. Date of Issue (e.g., "23-03-2010")
  doe: string; // 4. Date of Expiry (e.g., "21-03-2025")
  fullName: string; // 5. Full Name (e.g., "RAM BAHADUR THAPA")
  address: string; // 6. Address (e.g., "Sindhupalchok, Bagmati, Nepal")
  licenseOffice: string; // 7. License Office (e.g., "Lalitpur")
  dob: string; // 8. Date of Birth (e.g., "23-08-1992")
  fhName: string; // 9. Father/Husband Name (e.g., "KRISHNA B. THAPA")
  citizenshipNo: string; // 10. Citizenship Number (e.g., "27-01-70-12345")
  passportNo: string; // 11. Passport Number (e.g., "0")
  contactNo: string; // 12. Contact Number (e.g., "9841234567")
  category: string; // 13. Vehicle Category (e.g., "A, B")
  userPhoto: string; // 14. Selfie / Passport Photo Upload
  holderSignature: string; // 15. Cardholder Signature Upload
  issuedBySignature?: string; // Optional/default admin asset upload
  templateBgUrl?: string; // Background template image URL
  isPreprintedTemplate?: boolean; // When true, static headers/chip/boxes already exist in template
}

export interface NepalDrivingLicenseDetails extends NepalDrivingLicenseState {
  bloodGroup?: string; // Alias for bg
  categories?: string; // Alias for category
  photoUrl?: string; // Alias for userPhoto
  holderSignUrl?: string | null; // Alias for holderSignature
  issuedBySignUrl?: string | null; // Alias for issuedBySignature
  photoAdjustments?: {
    brightness: number;
    contrast: number;
    scale: number;
    offsetX: number;
    offsetY: number;
    grayscale: boolean;
  };
  templateMode?: 'image' | 'vector';
  customTemplateUrl?: string | null;
}

export const INITIAL_NEPAL_DL_DETAILS: NepalDrivingLicenseDetails = {
  dlNo: '01-06-00123456',
  bg: 'B+',
  bloodGroup: 'B+',
  doi: '23-03-2010',
  doe: '21-03-2025',
  fullName: 'RAM BAHADUR THAPA',
  address: 'Sindhupalchok, Bagmati, Nepal',
  licenseOffice: 'Lalitpur',
  dob: '23-08-1992',
  fhName: 'KRISHNA B. THAPA',
  citizenshipNo: '27-01-70-12345',
  passportNo: '0',
  contactNo: '9841234567',
  category: 'A, B',
  categories: 'A, B',
  userPhoto: '',
  photoUrl: '',
  holderSignature: '',
  holderSignUrl: null,
  issuedBySignature: '',
  issuedBySignUrl: null,
  photoAdjustments: {
    brightness: 105,
    contrast: 120,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    grayscale: true,
  },
  templateMode: 'image',
  customTemplateUrl: '/assets/nepal-dl-front-bg.png',
  templateBgUrl: '/assets/nepal-dl-front-bg.png',
  isPreprintedTemplate: true,
};

export type CardType = 'student' | 'library' | 'work' | 'loyalty' | 'driving_license';

export interface InstituteConfig {
  name: string;
  nativeName: string;
  campusSubTitle: string;
  librarySubTitle: string;
  customLogoUrl: string | null;
  establishedText: string;
}

export interface SignatureConfig {
  studentSignatureUrl: string | null;
  studentSignatureText: string;
  studentSignatureFont: string;
  authoritySignatureUrl: string | null;
  authoritySignatureName: string;
  authorityTitle: string;
  librarianSignatureUrl: string | null;
  librarianSignatureName: string;
  librarianTitle: string;
}

export interface PhotoAdjustments {
  zoom: number;
  offsetY: number;
  offsetX: number;
  brightness: number;
  contrast: number;
}

export type CardEditMode = 'both' | 'student' | 'library' | 'work' | 'loyalty' | 'driving_license';

export type CardDisplayView = 'both' | 'student_only' | 'library_only' | 'driving_license_only';

export type CardSide = 'front' | 'back';

export type CardStatus = 'draft' | 'pending_approval' | 'approved' | 'suspended' | 'expired';

export type UserRole = 'student' | 'staff' | 'admin';

export type TabType =
  | 'photo'
  | 'student'
  | 'work'
  | 'library'
  | 'loyalty'
  | 'driving_license'
  | 'institute'
  | 'signatures'
  | 'design'
  | 'workflow'
  | 'verification';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  details?: string;
}

export interface CardDesignConfig {
  fontFamily: 'sans' | 'serif' | 'display' | 'mono';
  fontSizeScale: 'compact' | 'standard' | 'large';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  letterSpacing: 'tight' | 'normal' | 'wide';
  backgroundStyle: 'classic_white' | 'ivory_clean' | 'subtle_mesh' | 'security_watermark';
  borderStyle: 'none' | 'solid' | 'double' | 'gold_accent';
  borderColor: string;
  borderWidth: number;
  cornerRadius: number; // 0 for sharp, 12 for standard CR-80, 20 for rounded
  showPrintGuides: boolean; // Bleed & Trim lines
  showDimensions: boolean; // 85.60 mm x 53.98 mm indicators
  photoSharpness: number; // 0 - 100
}

export interface VerificationRecord {
  databaseId: string;
  issueDate: string;
  expiryDate: string;
  status: CardStatus;
  verificationUrl: string;
  barcodeData: string;
  qrData: string;
  approvedBy: string;
  approvalDate: string;
  securityHash: string;
  institutionRegistrationCode: string;
}

export type TemplateId =
  | 'tu_central'
  | 'tu_iost'
  | 'tu_ioe'
  | 'tu_modern'
  | 'tu_trichandra'
  | 'loyalty_vip'
  | 'work_employment_id';

export interface CardTemplate {
  id: TemplateId;
  name: string;
  badge: string;
  description: string;
  instituteName: string;
  nativeName: string;
  campusSubTitle: string;
  librarySubTitle: string;
  program: string;
  department: string;
  faculty: string;
  establishedText: string;
  studentCardTheme: {
    primaryColor: string;
    secondaryColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
  };
  libraryCardTheme: {
    primaryColor: string;
    secondaryColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
  };
  workCardTheme?: {
    primaryColor: string;
    secondaryColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
  };
  loyaltyCardTheme?: {
    primaryColor: string;
    secondaryColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
  };
  defaultCard1Type?: 'student' | 'work';
  defaultCard2Type?: 'library' | 'loyalty';
}

export interface RealismSettings {
  backgroundType:
    | 'varnished_oak'
    | 'sunlight_wood'
    | 'wooden_desk'
    | 'bedsheet'
    | 'marble_table'
    | 'neutral_grey'
    | 'linen_weave'
    | 'white_quilt'
    | 'dark_slate'
    | 'scanner_glass'
    | 'custom';
  customBackgroundUrl?: string;
  bedsheetWrinkles: boolean;
  laminationGloss: 'none' | 'subtle' | 'realistic' | 'high';
  shadowDepth: 'flat' | 'natural' | 'soft_bed' | 'deep';
  cameraAngle: 'flat_top' | 'handheld_slight' | 'perspective';
  lightingAngle: number;
  showOfficialStamp: boolean;
  showSignatures: boolean;
  laminateEdge: boolean;
  photoOpacity: number;
  
  // Graphics & Resolution Effects
  brightness: number;
  contrast: number;
  saturation: number;
  grain: number;
  cameraEffect: 'clean_dslr' | 'smartphone' | 'vintage_film' | 'scanned_doc';
  resolutionPreset: '4k_print' | 'hd_web' | 'standard';
  cardCornerRadius: number;

  // Physical Realism Enhancements
  pvcTexture: 'matte_pvc' | 'gloss_pvc' | 'embossed_grain' | 'silk_matte';
  pvcCardThickness3D: boolean;
  printGrain: number; // 0 - 100 thermal transfer sublimation micro-dots
  cameraPerspectivePreset: 'natural_handheld' | 'overhead_flat' | 'dynamic_3d' | 'flatbed_scanner';
  perspectiveDepth: number; // angle degrees (0 - 25)
  overheadLighting: 'soft_diffuse' | 'warm_desk_lamp' | 'studio_softbox' | 'natural_window';
  lightIntensity: number; // 50 - 150
  shadowStyle: 'soft_bed_occlusion' | 'contact_ambient' | 'floating_depth' | 'scanner_flush';
  surfaceReflection: number; // 0 - 100
  lensVignette: number; // 0 - 50
  lensImperfection: boolean;
  scannerMode: boolean; // High-resolution flatbed document scanner
  antiGlareFinish: boolean; // Matte anti-glare lamination
  antiGlareStrength: number; // 0 - 100
  colorReproductionProfile: 'natural_dye_sub' | 'cmyk_calibrated' | 'high_fidelity';

  // Outer Layer Shadow Filter & Intensity Control
  outerShadowIntensity: number; // 0 - 100 (%)
  outerShadowBlur: number; // 0 - 60 (px)
  outerShadowSpread: number; // -5 - 15 (px)

  // Card Usage Age / Wear & Tear Effect (0, 1, 2, 3, 4, 6, 12, 24 Months)
  cardAgeMonths: number; // 0 (Brand New) up to 24 (Senior)
  showCardAgeBadge: boolean;

  // Real Print Card Physical Effects
  logoGlow: boolean; // Metallic foil reflection and radial emblem glow
  watermarkHighlight: boolean; // Iridescent guilloche security watermark highlight

  // Tabletop Window Sunlight & Layout Arrangement
  windowSunlightEffect?: boolean; // Natural sunlight streaming from window onto wooden table
  windowShadowBars?: boolean; // Window pane / mullion cast shadows across table and cards
  dualCardArrangement?: 'perpendicular' | 'parallel'; // Perpendicular (90° desk arrangement) vs Parallel
  sunlightWarmth?: number; // 0 - 100 warmth of window daylight
}

export interface PresentationMockupSettings {
  perspectiveTiltX: number; // -30 to +30 deg
  perspectiveTiltY: number; // -30 to +30 deg
  perspectiveDistance: number; // 600 to 2000 px
  rotationZ: number; // -45 to +45 deg
  positionX: number; // -150 to +150 px
  positionY: number; // -150 to +150 px
  cardElevation: number; // 0 to 40 px (lift above tabletop)
  background:
    | 'neutral_grey'
    | 'linen_weave'
    | 'oak_desk'
    | 'clean_marble'
    | 'dark_slate'
    | 'studio_white'
    | 'matte_concrete';
  shadowIntensity: number; // 0 to 100%
  shadowBlur: number; // 0 to 80 px
  shadowAngle: number; // 0 to 360 deg
  lightingAngle: number; // 0 to 360 deg
  lightIntensity: number; // 0 to 100%
  specularSheen: number; // 0 to 100%
  backgroundBlur: number; // 0 to 25 px (depth of field)
}

export interface CornerShadowConfig {
  preset: 'flat' | 'natural' | 'corner_lift' | 'floating' | 'bed_sag' | 'custom';
  topLeft: number; // 0 to 50 px lift
  topRight: number; // 0 to 50 px lift
  bottomLeft: number; // 0 to 50 px lift
  bottomRight: number; // 0 to 50 px lift
  intensity: number; // 0 to 100%
  blur: number; // 0 to 60 px
}

export type MockupEffect =
  | 'none'
  | 'scan'
  | 'old_rush'
  | 'natural'
  | 'used'
  | 'reality'
  | 'hologram';

export interface WatermarkConfig {
  enabled: boolean;
  autoCardLogo: boolean; // Automatically keep card logo as center watermark
  customLogoUrl?: string; // Custom uploaded watermark logo
  opacity: number; // 0.05 to 0.60
  scale: number; // 0.6 to 1.5
  highlight: boolean; // Guilloche iridescent highlight
  showOnStudent: boolean;
  showOnLibrary: boolean;
  showOnWork: boolean;
  showOnLoyalty: boolean;
}

export interface RealisticMockupConfig {
  enabled: boolean;
  surface: 'wood' | 'varnished_oak' | 'sunlight_wood' | 'neutral' | 'marble' | 'table' | 'bedsheet' | 'dark_slate' | 'custom';
  customSurfaceImageUrl?: string;
  lighting: 'natural' | 'soft' | 'studio';
  material: 'pvc' | 'laminated' | 'paper';
  wear: 'none' | 'light' | 'moderate';
  reflection: 'low' | 'medium' | 'high';
  shadow: 'low' | 'medium' | 'high';
  perspective: 'flat' | 'natural' | 'handheld';
  effect?: MockupEffect;
  cornerShadows?: CornerShadowConfig;
}

export interface DocumentCaptureQualityCheck {
  resolutionWidth: number;
  resolutionHeight: number;
  resolutionPassed: boolean;
  resolutionLabel: string;
  brightnessAverage: number;
  brightnessPassed: boolean;
  brightnessLabel: string;
  glarePercentage: number;
  glarePassed: boolean;
  glareLabel: string;
  laplacianVariance: number;
  blurPassed: boolean;
  blurLabel: string;
  aspectRatio: number;
  aspectRatioPassed: boolean;
  aspectRatioLabel: string;
  distancePassed: boolean;
  distanceLabel: string;
  fourCornersDetected: boolean;
  overallQualityStatus: 'too_dark' | 'too_blurry' | 'move_closer' | 'good_quality' | 'unaligned';
  overallPassed: boolean;
  timestamp: string;
  failureReasons?: string[];
}

export interface DocumentCaptureExifData {
  deviceLabel: string;
  facingMode: string;
  streamResolution: string;
  frameRate?: number;
  captureTimestamp: string;
  colorSpace: string;
  mimeType: string;
  integrityHash: string;
  userAgent: string;
  // Real Smartphone Optical Camera EXIF Tags
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: string;
  focalLengthIn35mmFormat?: string;
  fNumber?: string;
  exposureTime?: string;
  isoSpeedRatings?: number;
  exposureProgram?: string;
  meteringMode?: string;
  flash?: string;
  whiteBalance?: string;
  software?: string;
  brightnessValue?: string;
  exposureBiasValue?: string;
  dateTimeOriginal?: string;
  subSecTimeOriginal?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  gpsAltitude?: string;
  digitalZoomRatio?: string;
  sceneCaptureType?: string;
  sensingMethod?: string;
  shutterSpeedValue?: string;
  apertureValue?: string;
}

export interface CompliantDocumentCaptureRecord {
  id: string;
  imageUrl: string;
  capturedAt: string;
  quality: DocumentCaptureQualityCheck;
  exif: DocumentCaptureExifData;
  cardType: string;
}



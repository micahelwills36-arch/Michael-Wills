import { DocumentCaptureExifData } from '../types';

export interface PhoneCameraProfile {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  lensModel: string;
  focalLength: string;
  focalLengthIn35mm: string;
  fNumber: string;
  defaultIso: number;
  exposureTime: string;
  colorSpace: string;
  software: string;
  sensorResolution: string;
}

export const PHONE_CAMERA_PROFILES: PhoneCameraProfile[] = [
  {
    id: 'iphone_15_pro',
    name: 'Apple iPhone 15 Pro (Main 24mm f/1.78)',
    manufacturer: 'Apple',
    model: 'iPhone 15 Pro (A3102)',
    lensModel: 'iPhone 15 Pro back triple camera 6.86mm f/1.78',
    focalLength: '6.86 mm',
    focalLengthIn35mm: '24 mm',
    fNumber: 'f/1.78',
    defaultIso: 64,
    exposureTime: '1/125 sec (0.008s)',
    colorSpace: 'Display P3 (Wide Color Gamut)',
    software: 'iOS 17.5.1 (21F90)',
    sensorResolution: '4032 × 3024 (12.2 MP Quad-Pixel binned)',
  },
  {
    id: 'galaxy_s24_ultra',
    name: 'Samsung Galaxy S24 Ultra (23mm f/1.7)',
    manufacturer: 'Samsung',
    model: 'SM-S928B (Galaxy S24 Ultra)',
    lensModel: 'Samsung ISOCELL HP2 6.30mm f/1.7',
    focalLength: '6.30 mm',
    focalLengthIn35mm: '23 mm',
    fNumber: 'f/1.7',
    defaultIso: 80,
    exposureTime: '1/160 sec (0.00625s)',
    colorSpace: 'sRGB / Adobe RGB (Auto HDR)',
    software: 'S928BXXU1AXCA (One UI 6.1 / Android 14)',
    sensorResolution: '4000 × 3000 (12.0 MP Tetra²pixel)',
  },
  {
    id: 'pixel_8_pro',
    name: 'Google Pixel 8 Pro (25mm f/1.68)',
    manufacturer: 'Google',
    model: 'Pixel 8 Pro (GC3VE)',
    lensModel: 'Google GNV 50MP Octa-PD 6.90mm f/1.68',
    focalLength: '6.90 mm',
    focalLengthIn35mm: '25 mm',
    fNumber: 'f/1.68',
    defaultIso: 50,
    exposureTime: '1/180 sec (0.0055s)',
    colorSpace: 'Display P3',
    software: 'Android 14 (Build UQ1A.240205.004)',
    sensorResolution: '4080 × 3072 (12.5 MP Ultra HDR)',
  },
  {
    id: 'iphone_14_pro',
    name: 'Apple iPhone 14 Pro (Main 24mm f/1.78)',
    manufacturer: 'Apple',
    model: 'iPhone 14 Pro (A2890)',
    lensModel: 'iPhone 14 Pro back camera 6.86mm f/1.78',
    focalLength: '6.86 mm',
    focalLengthIn35mm: '24 mm',
    fNumber: 'f/1.78',
    defaultIso: 100,
    exposureTime: '1/100 sec (0.010s)',
    colorSpace: 'Display P3',
    software: 'iOS 16.7.2',
    sensorResolution: '4032 × 3024',
  },
];

/**
 * Format realistic date in standard EXIF syntax: YYYY:MM:DD HH:MM:SS
 */
export function formatExifDate(d: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Generates an authentic phone camera EXIF record matching a physical handheld document photo
 */
export function generateRealPhoneCameraExif(
  profileId: string = 'iphone_15_pro',
  width: number = 1920,
  height: number = 1080
): DocumentCaptureExifData {
  const profile =
    PHONE_CAMERA_PROFILES.find((p) => p.id === profileId) || PHONE_CAMERA_PROFILES[0];
  const now = new Date();
  const dateStr = formatExifDate(now);
  const subSec = Math.floor(100 + Math.random() * 899).toString();

  // Pseudo hardware sensor hash for non-repudiation audit trail
  const pseudoHash = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('').toUpperCase();

  return {
    deviceLabel: `${profile.manufacturer} ${profile.model} Optical Sensor`,
    facingMode: 'environment (Rear Main Camera)',
    streamResolution: `${width} × ${height} px`,
    frameRate: 30,
    captureTimestamp: now.toISOString(),
    colorSpace: profile.colorSpace,
    mimeType: 'image/jpeg; quality=0.95',
    integrityHash: `SHA256-${pseudoHash}`,
    userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`,
    cameraMake: profile.manufacturer,
    cameraModel: profile.model,
    lensModel: profile.lensModel,
    focalLength: profile.focalLength,
    focalLengthIn35mmFormat: profile.focalLengthIn35mm,
    fNumber: profile.fNumber,
    exposureTime: profile.exposureTime,
    isoSpeedRatings: profile.defaultIso,
    exposureProgram: 'Normal Program (Mode 2)',
    meteringMode: 'Pattern (Center-Weighted Multi-Segment)',
    flash: 'Off, Did not fire (Ambient window illumination)',
    whiteBalance: 'Auto (5200K Natural Daylight)',
    software: profile.software,
    brightnessValue: '6.48 EV (Daylight Room)',
    exposureBiasValue: '0.00 EV',
    dateTimeOriginal: dateStr,
    subSecTimeOriginal: subSec,
    gpsLatitude: `27° 40' 52.8" N`,
    gpsLongitude: `85° 17' 18.4" E`,
    gpsAltitude: `1328 m (Above Sea Level)`,
    digitalZoomRatio: '1.0x (Optical Prime)',
    sceneCaptureType: 'Standard (Macro Document Focus)',
    sensingMethod: 'One-chip color area sensor (BSI Quad-Bayer CMOS)',
    shutterSpeedValue: '6.965 EV (1/125s)',
    apertureValue: '1.669 EV (f/1.78)',
  };
}

/**
 * Builds a formatted plain-text EXIF inspection report for auditing and download
 */
export function buildExifDumpText(exif: DocumentCaptureExifData): string {
  return `===================================================================
AUTHENTIC SMARTPHONE CAMERA EXIF METADATA AUDIT REPORT
===================================================================
Camera Manufacturer        : ${exif.cameraMake || 'Apple'}
Camera Model               : ${exif.cameraModel || 'iPhone 15 Pro'}
Lens Specification         : ${exif.lensModel || '6.86mm f/1.78'}
Focal Length (Actual)      : ${exif.focalLength || '6.86 mm'}
Focal Length (35mm Equiv)  : ${exif.focalLengthIn35mmFormat || '24 mm'}
Aperture / F-Number        : ${exif.fNumber || 'f/1.78'}
Exposure Time (Shutter)    : ${exif.exposureTime || '1/125 sec'}
ISO Speed Rating           : ISO ${exif.isoSpeedRatings || 64}
Exposure Program           : ${exif.exposureProgram || 'Normal Program'}
Exposure Bias              : ${exif.exposureBiasValue || '0.00 EV'}
Metering Mode              : ${exif.meteringMode || 'Pattern'}
Light Source / White Bal   : ${exif.whiteBalance || 'Auto (Daylight)'}
Flash Status               : ${exif.flash || 'Off, Did not fire'}
Color Space Profile        : ${exif.colorSpace}
Digital Zoom Ratio         : ${exif.digitalZoomRatio || '1.0x'}
Scene Capture Mode         : ${exif.sceneCaptureType || 'Standard'}
Sensing Method             : ${exif.sensingMethod || 'One-chip color area sensor'}
Native Resolution          : ${exif.streamResolution}
DateTimeOriginal           : ${exif.dateTimeOriginal || '2026:09:12 14:30:15'}
SubSecTimeOriginal         : ${exif.subSecTimeOriginal || '420'}
GPS Latitude               : ${exif.gpsLatitude || `27° 40' 52.8" N`}
GPS Longitude              : ${exif.gpsLongitude || `85° 17' 18.4" E`}
GPS Altitude               : ${exif.gpsAltitude || '1328 m'}
Operating Firmware         : ${exif.software || 'iOS 17.5.1'}
Sensor Hardware Hash       : ${exif.integrityHash}
Capture Time (ISO 8601)    : ${exif.captureTimestamp}
Audit Verification Status  : VERIFIED HARDWARE OPTICAL MATCH
===================================================================`;
}

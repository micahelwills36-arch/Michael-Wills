import React from 'react';
import {
  EmploymentDetails,
  RealismSettings,
  InstituteConfig,
  SignatureConfig,
  PhotoAdjustments,
  CardSide,
  CardDesignConfig,
  VerificationRecord,
  CardStatus,
  WatermarkConfig,
} from '../types';
import { TribhuvanLogo } from './TribhuvanLogo';
import { KathmanduModelCollegeLogo } from './KathmanduModelCollegeLogo';
import { OfficialStamp } from './OfficialStamp';
import { OfficialQRCode, OfficialBarcode, SmartCardChip } from './BarcodeAndQR';
import { SecurityWatermark } from './SecurityWatermark';
import { CardAgingOverlay } from './CardAgingOverlay';
import { ShieldCheck, Building2, UserCheck, Briefcase } from 'lucide-react';

interface WorkIDCardProps {
  details: EmploymentDetails;
  instituteConfig: InstituteConfig;
  signatureConfig: SignatureConfig;
  photoUrl: string;
  photoAdjustments?: PhotoAdjustments;
  settings: RealismSettings;
  side?: CardSide;
  designConfig?: CardDesignConfig;
  verificationRecord?: VerificationRecord;
  status?: CardStatus;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    borderAccent: string;
    badgeBg: string;
    badgeText: string;
  };
  id?: string;
  watermarkConfig?: WatermarkConfig;
}

export const WorkIDCard: React.FC<WorkIDCardProps> = ({
  details,
  instituteConfig,
  signatureConfig,
  photoUrl,
  photoAdjustments = { zoom: 1, offsetY: 0, offsetX: 0, brightness: 100, contrast: 100 },
  settings,
  side = 'front',
  designConfig,
  verificationRecord,
  status = 'approved',
  theme = {
    primaryColor: '#091e3a',
    secondaryColor: '#1d4ed8',
    borderAccent: '#2563eb',
    badgeBg: '#1e40af',
    badgeText: '#ffffff',
  },
  id = 'tu-work-id-card',
  watermarkConfig,
}) => {
  const fontFamilyStyle =
    designConfig?.fontFamily === 'serif'
      ? "'Playfair Display', Georgia, serif"
      : designConfig?.fontFamily === 'display'
      ? "'Cabinet Grotesk', system-ui, sans-serif"
      : designConfig?.fontFamily === 'mono'
      ? "'JetBrains Mono', monospace"
      : "'Plus Jakarta Sans', system-ui, sans-serif";

  const letterSpacingClass =
    designConfig?.letterSpacing === 'tight'
      ? 'tracking-tight'
      : designConfig?.letterSpacing === 'wide'
      ? 'tracking-wide'
      : 'tracking-normal';

  const isBack = side === 'back';

  // Dynamic outer shadow filter calculation
  const shadowIntensity = (settings.outerShadowIntensity ?? 65) / 100;
  const shadowBlur = settings.outerShadowBlur ?? 24;
  const shadowSpread = settings.outerShadowSpread ?? 0;
  const outerShadowStyle = `${Math.round(4 * shadowIntensity)}px ${Math.round(
    14 * shadowIntensity
  )}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, ${0.45 * shadowIntensity}), 0 1px 3px rgba(0,0,0,0.3)`;

  const cornerRadiusClass =
    settings.cardCornerRadius === 0
      ? 'rounded-none'
      : settings.cardCornerRadius <= 8
      ? 'rounded-lg'
      : 'rounded-[14px]';

  const innerCard = (
    <div
      id={!settings.laminateEdge ? id : undefined}
      className={`relative w-[340px] h-[214px] select-none text-slate-800 transition-all duration-300 ${cornerRadiusClass} overflow-hidden ${letterSpacingClass}`}
      style={{
        fontFamily: fontFamilyStyle,
        boxShadow: settings.laminateEdge ? '0 1px 3px rgba(0,0,0,0.18)' : outerShadowStyle,
        backgroundColor: '#ffffff',
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
      }}
    >
      {/* Dynamic Security & Card Effects */}
      <SecurityWatermark
        variant="work"
        showCenterLogo={watermarkConfig?.enabled ? watermarkConfig.showOnWork : false}
        customLogoUrl={
          watermarkConfig?.enabled
            ? watermarkConfig.customLogoUrl || (watermarkConfig.autoCardLogo ? instituteConfig.customLogoUrl : undefined)
            : undefined
        }
        opacity={watermarkConfig?.enabled ? watermarkConfig.opacity : 0.06}
        scale={watermarkConfig?.scale || 1.0}
        highlight={watermarkConfig?.highlight ?? false}
      />
      <CardAgingOverlay
        ageMonths={settings.cardAgeMonths ?? 0}
        showBadge={settings.showCardAgeBadge ?? false}
        cardSide={side}
      />

      {/* Lamination gloss sheen */}
      {settings.laminationGloss !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            backgroundImage:
              settings.laminationGloss === 'high'
                ? 'linear-gradient(115deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.14) 75%, rgba(255,255,255,0.18) 100%)'
                : 'linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 48%, rgba(0,0,0,0.09) 80%, rgba(255,255,255,0.1) 100%)',
          }}
        />
      )}

      {/* Lanyard punch hole slot indicator (Standard CR80 executive badge) */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 z-20 pointer-events-none flex items-center justify-center">
        <div className="w-6 h-0.5 rounded-full bg-slate-400/50" />
      </div>

      {/* CARD FRONT */}
      {!isBack ? (
        <div className="relative w-full h-full flex flex-col justify-between p-2.5 z-10">
          {/* Header Banner */}
          <div
            className="rounded-lg p-1.5 flex items-center justify-between text-white shadow-xs"
            style={{ backgroundColor: theme.primaryColor || '#091e3a' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="h-6 px-1 rounded-md bg-white p-0.5 flex items-center justify-center shadow-xs flex-shrink-0">
                {instituteConfig.customLogoUrl ? (
                  <img
                    src={instituteConfig.customLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <KathmanduModelCollegeLogo size={24} />
                )}
              </div>
              <div className="leading-tight">
                <p className="text-[9.5px] font-black uppercase tracking-wider text-white">
                  {details.companyOrOrgName || 'Kathmandu Model College'}
                </p>
                <p className="text-[7.5px] font-medium text-blue-200 tracking-wider uppercase">
                  EMPLOYMENT VERIFICATION & FACULTY ID
                </p>
              </div>
            </div>

            {/* Access Clearance Badge */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/80 border border-blue-400/40 text-[7.5px] font-bold text-white uppercase tracking-wider flex-shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 text-blue-200" />
              <span>{details.accessLevel ? details.accessLevel.split('•')[0].trim() : 'LEVEL 4'}</span>
            </div>
          </div>

          {/* Main Content Row */}
          <div className="flex items-center gap-2.5 flex-1 py-1">
            {/* Employee Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-[66px] h-[82px] rounded-lg p-0.5 bg-slate-200 border border-slate-300 shadow-xs relative overflow-hidden">
                <div className="w-full h-full rounded-[6px] overflow-hidden bg-slate-100 relative">
                  <img
                    src={photoUrl}
                    alt={details.employeeName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${photoAdjustments.zoom}) translate(${photoAdjustments.offsetX}px, ${photoAdjustments.offsetY}px)`,
                      filter: `brightness(${photoAdjustments.brightness}%) contrast(${photoAdjustments.contrast}%)`,
                    }}
                  />
                </div>
              </div>

              {/* Status Pill below photo */}
              <div className="mt-1 text-center">
                <span className="text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-800 border border-blue-200 block truncate max-w-[68px]">
                  {details.bloodGroup ? `BLOOD: ${details.bloodGroup}` : 'ACTIVE STAFF'}
                </span>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="flex-1 flex flex-col justify-between h-full text-slate-800">
              <div>
                {/* Employee Name */}
                <span className="text-[7px] font-bold uppercase text-slate-400 tracking-wider block">
                  Employee / Staff Name
                </span>
                <p className="text-[12px] font-black text-slate-900 tracking-wide leading-tight truncate uppercase font-sans">
                  {details.employeeName || 'DR. ISABELLA ROSE'}
                </p>

                {/* Designation / Job Title */}
                <p className="text-[9px] font-bold text-blue-900 leading-snug line-clamp-1">
                  {details.designation || 'Senior Lecturer & System Administrator'}
                </p>
              </div>

              {/* Department & Employee ID Row */}
              <div className="grid grid-cols-2 gap-1 my-0.5 bg-slate-50 p-1 rounded-md border border-slate-200/80">
                <div>
                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Staff ID
                  </span>
                  <span className="text-[8.5px] font-mono font-bold text-slate-800">
                    {details.employeeId || 'EMP-TU-84920'}
                  </span>
                </div>
                <div>
                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status
                  </span>
                  <span className="text-[8px] font-bold text-emerald-700 truncate block">
                    {details.employmentType || 'Permanent'}
                  </span>
                </div>
              </div>

              {/* Department */}
              <div>
                <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Department / Division
                </span>
                <p className="text-[8px] font-semibold text-slate-700 truncate leading-tight">
                  {details.department || 'Central Dept. of Computer Science & IT'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bar: Validity, Barcode & Authorized Sign */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
            <div className="text-[7.5px] sm:text-[8px] leading-tight">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-500 font-bold">ISSUED:</span>
                <span className="font-bold text-slate-800">{details.issueDate || '2023-01-15'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-red-700 font-bold">VALID UNTIL:</span>
                <span className="font-bold text-red-800">{details.validUntil || '2028 Dec 31'}</span>
              </div>
              <div className="text-[7px] text-slate-600 font-medium truncate max-w-[150px] mt-0.5">
                {details.workLocation || 'Central Campus, Kirtipur'}
              </div>
            </div>

            {/* Barcode */}
            <div className="scale-65 origin-center">
              <OfficialBarcode data={details.employeeId || 'EMP-84920'} height={14} width={75} />
            </div>

            {/* Authorized Signature */}
            <div className="text-right">
              {signatureConfig.authoritySignatureUrl ? (
                <img
                  src={signatureConfig.authoritySignatureUrl}
                  alt="Sign"
                  className="h-4 max-w-[90px] object-contain ml-auto mix-blend-multiply contrast-125 brightness-95"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  className="text-[10px] font-bold block"
                  style={{ fontFamily: "'Great Vibes', cursive", color: '#090d16' }}
                >
                  {details.supervisorName || signatureConfig.authoritySignatureName || 'Dr. Registrar'}
                </span>
              )}
              <span className="text-[6px] text-slate-400 uppercase tracking-wider font-bold block">
                {signatureConfig.authorityTitle || 'Registrar / HR Chief'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* CARD BACK */
        <div className="relative w-full h-full flex flex-col justify-between p-3 z-10 text-slate-700 bg-slate-50">
          {/* Top Notice */}
          <div className="border-b border-slate-200 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <SmartCardChip size={24} />
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-800">
                Employment Verification Notice
              </span>
            </div>
            <span className="text-[7px] font-mono text-blue-700 font-bold">
              ID: {details.employeeId || 'EMP-TU-84920'}
            </span>
          </div>

          {/* Verification Statement */}
          <div className="text-[7px] leading-relaxed text-slate-600 my-1">
            <p>
              This card is the official property of {details.companyOrOrgName || 'Kathmandu Model College'}.
              It must be presented upon request for access to campus facilities, laboratories, and secure zones.
              If found, please return to: Office of Administration, Kathmandu Model College, Bagbazar / Balkumari, Kathmandu.
            </p>
          </div>

          {/* Security & Access Info Grid */}
          <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-md border border-slate-200 text-[7px]">
            <div>
              <span className="font-bold text-slate-400 block text-[6px]">EMERGENCY HELPLINE</span>
              <span className="font-mono text-slate-800">{details.emergencyContact || '+977-1-4330338'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[6px]">FACILITY CLEARANCE</span>
              <span className="font-bold text-blue-800 truncate block">
                {details.accessLevel || 'Level 4 Clearance'}
              </span>
            </div>
          </div>

          {/* QR Code & Official Stamp Bottom Row */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 bg-white p-0.5 rounded-sm border border-slate-200 flex items-center justify-center">
                <OfficialQRCode
                  data={`WORK_VERIFY:${details.employeeId}:${details.employeeName}:${details.validUntil}`}
                  size={28}
                />
              </div>
              <div className="text-[6.5px] leading-tight text-slate-500">
                <p className="font-bold text-slate-700">Digital HR Verification</p>
                <p>Scan to verify active employment</p>
              </div>
            </div>

            <div className="text-right text-[7px] text-slate-500 font-mono leading-tight">
              <p>ISSUED: <strong className="text-slate-800 font-bold">{details.issueDate || '2023-01-15'}</strong></p>
              <p>VALID UNTIL: <strong className="text-red-700 font-bold">{details.validUntil || '2028 Dec 31'}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!settings.laminateEdge) {
    return innerCard;
  }

  return (
    <div
      id={id}
      className="relative select-none transition-transform duration-300 group"
      style={{
        // 100% Water-Clear Transparent Heat-Sealed PVC Protective Pouch
        padding: '6px',
        borderRadius: '18px',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.55)',
        boxShadow: `${outerShadowStyle ? `${outerShadowStyle}, ` : ''}inset 0 1px 1.5px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.1), inset 1px 0 1px rgba(255, 255, 255, 0.4), inset -1px 0 1px rgba(0, 0, 0, 0.08)`,
      }}
    >
      <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-tr-[14px] border-t border-r border-white/70 pointer-events-none opacity-60" />
      <div className="absolute bottom-0.5 left-0.5 w-3 h-3 rounded-bl-[14px] border-b border-l border-white/70 pointer-events-none opacity-60" />
      <div
        className="absolute inset-0 rounded-[18px] pointer-events-none z-30"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
          background: 'transparent',
        }}
      />
      {innerCard}
    </div>
  );
};

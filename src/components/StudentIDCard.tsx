import React from 'react';
import {
  StudentDetails,
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
import { OfficialStamp } from './OfficialStamp';
import { OfficialQRCode, OfficialBarcode, SmartCardChip } from './BarcodeAndQR';
import { SecurityWatermark } from './SecurityWatermark';
import { CardAgingOverlay } from './CardAgingOverlay';

interface StudentIDCardProps {
  details: StudentDetails;
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

export const StudentIDCard: React.FC<StudentIDCardProps> = ({
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
    primaryColor: '#0f2b5c',
    secondaryColor: '#1e3a8a',
    borderAccent: '#1e3a8a',
    badgeBg: '#1e3a8a',
    badgeText: '#ffffff',
  },
  id = 'tu-student-card',
  watermarkConfig,
}) => {
  // Typography mapping from designConfig
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
  const shadowBlur = settings.outerShadowBlur ?? 28;
  const shadowSpread = settings.outerShadowSpread ?? 1;

  // Real wooden table & window sunlight check
  const isWoodSurface =
    settings.backgroundType === 'sunlight_wood' ||
    settings.backgroundType === 'wooden_desk' ||
    settings.backgroundType === 'varnished_oak' ||
    Boolean(settings.windowSunlightEffect);

  const dynamicOuterBoxShadow =
    shadowIntensity === 0
      ? '0 1px 2px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.9)'
      : isWoodSurface
      ? `0 2px 5px rgba(24, 12, 3, ${(0.68 * shadowIntensity).toFixed(3)}), 
         ${Math.round(shadowBlur * 0.45)}px ${Math.round(shadowBlur * 0.75)}px ${shadowBlur}px ${shadowSpread}px rgba(35, 18, 5, ${(0.46 * shadowIntensity).toFixed(3)}), 
         ${Math.round(shadowBlur * 0.85)}px ${Math.round(shadowBlur * 1.35)}px ${Math.round(shadowBlur * 1.8)}px rgba(20, 10, 2, ${(0.28 * shadowIntensity).toFixed(3)}), 
         0 2px 4px rgba(35, 18, 5, ${(0.24 * shadowIntensity).toFixed(3)}), 
         inset 0 1.5px 2px rgba(255, 252, 240, 0.9), 
         inset 1.5px 0 2px rgba(255, 252, 240, 0.65), 
         inset 0 -1.5px 2px rgba(45, 22, 6, 0.22), 
         inset -1.5px 0 2px rgba(45, 22, 6, 0.18)`
      : `0 ${Math.round(shadowBlur * 0.7)}px ${shadowBlur}px ${shadowSpread}px rgba(15, 23, 42, ${(0.42 * shadowIntensity).toFixed(3)}), 0 ${Math.max(2, Math.round(shadowBlur * 0.35))}px ${Math.round(shadowBlur * 0.5)}px rgba(0, 0, 0, ${(0.22 * shadowIntensity).toFixed(3)}), 0 2px 4px rgba(15, 23, 42, ${(0.16 * shadowIntensity).toFixed(3)}), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0, 0, 0, 0.1)`;

  const dynamicOuterFilter =
    shadowIntensity > 0
      ? isWoodSurface
        ? `drop-shadow(${Math.round(shadowBlur * 0.35)}px ${Math.round(shadowBlur * 0.6)}px ${Math.round(shadowBlur * 0.7)}px rgba(32, 16, 4, ${(0.35 * shadowIntensity).toFixed(3)}))`
        : `drop-shadow(0 ${Math.max(2, Math.round(shadowBlur * 0.25))}px ${Math.round(shadowBlur * 0.45)}px rgba(15, 23, 42, ${(0.25 * shadowIntensity).toFixed(3)}))`
      : undefined;

  return (
    <div
      id={id}
      className="relative select-none transition-transform duration-300 group"
      style={{
        // 100% Water-Clear Transparent Heat-Sealed PVC Protective Pouch
        padding: settings.laminateEdge ? '6px' : '0px',
        borderRadius: settings.laminateEdge ? '18px' : `${designConfig?.cornerRadius ?? (settings.cardCornerRadius || 14)}px`,
        backgroundColor: 'transparent',
        border: settings.laminateEdge ? '1px solid rgba(255, 255, 255, 0.55)' : 'none',
        boxShadow: settings.laminateEdge
          ? `${dynamicOuterBoxShadow ? `${dynamicOuterBoxShadow}, ` : ''}inset 0 1px 1.5px rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.1), inset 1px 0 1px rgba(255, 255, 255, 0.4), inset -1px 0 1px rgba(0, 0, 0, 0.08)`
          : dynamicOuterBoxShadow,
        filter: dynamicOuterFilter,
      }}
    >
      {/* Pristine Water-Clear PVC Heat-Welded Border Glint & Die-Cut Seam */}
      {settings.laminateEdge && (
        <>
          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-tr-[14px] border-t border-r border-white/70 pointer-events-none opacity-60" />
          <div className="absolute bottom-0.5 left-0.5 w-3 h-3 rounded-bl-[14px] border-b border-l border-white/70 pointer-events-none opacity-60" />
          <div
            className="absolute inset-0 rounded-[18px] pointer-events-none z-30"
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
              background: 'transparent',
            }}
          />
        </>
      )}

      {/* Core PVC Card Container: Standard CR-80 ratio (420x265px desktop, 370x235px mobile) */}
      <div
        className="relative w-[370px] min-h-[242px] sm:w-[420px] sm:min-h-[268px] text-slate-900 overflow-hidden flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.18)] ring-1 ring-slate-300/80"
        style={{
          background: isWoodSurface
            ? 'linear-gradient(135deg, #fffdf8 0%, #fcf8f0 55%, #f6f0e4 100%)'
            : '#fffdfa',
          borderRadius: `${designConfig?.cornerRadius ?? (settings.cardCornerRadius || 14)}px`,
          fontFamily: fontFamilyStyle,
          borderWidth: designConfig?.borderStyle === 'none' ? '1px' : `${designConfig?.borderWidth || 2}px`,
          borderColor:
            designConfig?.borderStyle === 'gold_accent'
              ? '#d97706'
              : designConfig?.borderStyle === 'double'
              ? '#1e3a8a'
              : designConfig?.borderStyle === 'solid'
              ? designConfig.borderColor || '#2563eb'
              : isWoodSurface
              ? 'rgba(215, 200, 180, 0.9)'
              : 'rgba(203, 213, 225, 0.9)',
          borderStyle: designConfig?.borderStyle === 'double' ? 'double' : 'solid',
          filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
        }}
      >
        {/* REALISTIC MULTI-COLOR GUILLOCHE SECURITY BACKGROUND & AUTHENTIC CENTER WATERMARK */}
        <SecurityWatermark
          customLogoUrl={
            watermarkConfig?.enabled
              ? watermarkConfig.customLogoUrl || (watermarkConfig.autoCardLogo ? instituteConfig.customLogoUrl : undefined)
              : instituteConfig.customLogoUrl || undefined
          }
          instituteName={instituteConfig.name}
          variant="student"
          opacity={
            watermarkConfig?.enabled
              ? watermarkConfig.opacity
              : settings.watermarkHighlight ? 0.28 : 0.17
          }
          scale={watermarkConfig?.scale || 1.0}
          highlight={watermarkConfig?.highlight ?? settings.watermarkHighlight}
          showCenterLogo={watermarkConfig ? (watermarkConfig.enabled && watermarkConfig.showOnStudent) : true}
        />

        {/* Subtle PVC Thermal Print Laminate Sheen Reflection */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, transparent 45%, rgba(255,255,255,0.08) 60%, transparent 100%)',
          }}
        />

        {/* Natural Window Sunlight Stream Across Card Face */}
        {(isWoodSurface || settings.windowSunlightEffect) && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-soft-light opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(130deg, rgba(255, 252, 240, 0.6) 0%, rgba(255, 246, 222, 0.3) 35%, rgba(255, 240, 210, 0.05) 60%, rgba(30, 16, 5, 0.18) 100%)',
            }}
          />
        )}

        {/* Diagonal Window Frame / Muntin Cast Shadow Crossing the Card */}
        {settings.windowShadowBars && isWoodSurface && (
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(128deg, transparent 24%, rgba(30, 15, 5, 0.25) 35%, rgba(30, 15, 5, 0.45) 42%, rgba(30, 15, 5, 0.22) 49%, transparent 62%)',
            }}
          />
        )}

        {/* Natural PVC Beveled Edge Light Reflection */}
        {isWoodSurface && (
          <div
            className="absolute inset-0 pointer-events-none z-25 rounded-[inherit]"
            style={{
              boxShadow:
                'inset 0 1.5px 1.5px rgba(255, 255, 255, 0.75), inset 1.5px 0 1.5px rgba(255, 255, 255, 0.5), inset 0 -1px 1.5px rgba(35, 18, 5, 0.2), inset -1px 0 1.5px rgba(35, 18, 5, 0.16)',
            }}
          />
        )}

        {/* Print-Safe Margins & Bleed Overlay (when toggled on) */}
        {designConfig?.showPrintGuides && (
          <div className="absolute inset-0 pointer-events-none z-40 border border-red-500/80 m-1 rounded-sm flex flex-col justify-between p-1.5">
            <div className="flex justify-between text-[7px] font-mono text-red-600 font-bold bg-white/80 px-1 rounded-xs">
              <span>CUT TRIM LINE (CR-80)</span>
              <span>3mm SAFE MARGIN</span>
            </div>
            <div className="border border-dashed border-blue-600/70 absolute inset-2 pointer-events-none" />
            <div className="text-[6.5px] font-mono text-blue-600 font-bold text-right bg-white/80 px-1 rounded-xs self-end">
              SAFE TEXT ZONE
            </div>
          </div>
        )}

        {/* Physical Dimensions Watermark Indicator */}
        {designConfig?.showDimensions && (
          <div className="absolute bottom-1 left-2 z-40 text-[7px] font-mono font-bold text-slate-500 bg-white/90 px-1.5 py-0.5 rounded border border-slate-300 shadow-2xs">
            CR-80 • 85.60 mm × 53.98 mm × 0.76 mm
          </div>
        )}

        {/* FRONT SIDE RENDERING */}
        {!isBack ? (
          <>
            {/* Top Header Section */}
            <div
              className="relative z-10 px-3 sm:px-3.5 pt-1.5 pb-1 border-b-2 flex items-center justify-between"
              style={{
                borderColor: theme.borderAccent,
                backgroundImage: 'linear-gradient(to right, rgba(239, 246, 255, 0.94), rgba(255, 253, 250, 0.92), rgba(239, 246, 255, 0.94))',
              }}
            >
              {/* Left Institutional Emblem */}
              <div className="flex-shrink-0 mr-2 flex items-center justify-center">
                {instituteConfig.customLogoUrl ? (
                  <img
                    src={instituteConfig.customLogoUrl}
                    alt="Institute Logo"
                    className={`w-9 h-9 sm:w-10 sm:h-10 object-contain ${
                      settings.logoGlow
                        ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.55)] drop-shadow-[0_0_3px_rgba(59,130,246,0.6)]'
                        : 'drop-shadow-2xs'
                    }`}
                  />
                ) : (
                  <TribhuvanLogo size={38} glow={settings.logoGlow} />
                )}
              </div>

              {/* Center University Institutional Title */}
              <div className="flex-1 text-center min-w-0 px-1">
                <span
                  className="block text-[7.5px] sm:text-[8.5px] font-bold text-red-700 tracking-wider select-none font-serif leading-tight"
                  style={{ fontFamily: "'Mukta', sans-serif" }}
                >
                  {instituteConfig.nativeName}
                </span>

                <h1
                  className={`text-[10.5px] sm:text-[12px] font-black tracking-tight leading-tight uppercase truncate ${letterSpacingClass}`}
                  style={{ color: theme.primaryColor }}
                  title={instituteConfig.name}
                >
                  {instituteConfig.name}
                </h1>

                <p
                  className="text-[7.5px] sm:text-[8.5px] font-semibold tracking-wide text-slate-700 truncate leading-tight"
                  style={{ color: theme.secondaryColor }}
                >
                  {instituteConfig.campusSubTitle}
                </p>

                <span className="text-[6px] sm:text-[7px] text-slate-500 font-medium tracking-wider block leading-tight">
                  {instituteConfig.establishedText}
                </span>
              </div>
            </div>

            {/* Sub-Header Ribbon: Identity Card Type & Academic Program Banner */}
            <div
              className="relative z-10 px-3 py-0.5 flex items-center justify-between shadow-2xs text-white"
              style={{ backgroundColor: theme.badgeBg }}
            >
              <span className="text-[7.5px] sm:text-[8.5px] font-bold tracking-widest uppercase select-none">
                STUDENT IDENTITY CARD
              </span>
              <span
                className="text-[7px] sm:text-[8px] font-semibold text-blue-100 uppercase tracking-wider truncate max-w-[200px]"
                title={details.program || details.faculty}
              >
                {details.program || details.faculty}
              </span>
            </div>

            {/* Main Body Grid: Passport Portrait (Left) & Credential Fields (Right) */}
            <div className="relative z-10 flex-1 px-3 sm:px-3.5 py-1.5 flex items-start gap-2.5 sm:gap-3">
              {/* Official Passport Photo Box with Sub-surface Embed Frame */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="relative w-[72px] h-[90px] sm:w-[80px] sm:h-[100px] rounded-md border-2 border-slate-700/80 bg-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={details.name}
                    className="w-full h-full object-cover transition-transform"
                    crossOrigin="anonymous"
                    style={{
                      transform: `scale(${photoAdjustments?.zoom || 1}) translate(${photoAdjustments?.offsetX || 0}px, ${photoAdjustments?.offsetY || 0}px)`,
                      filter: `brightness(${photoAdjustments?.brightness || 100}%) contrast(${photoAdjustments?.contrast || 100}%)`,
                      opacity: settings.photoOpacity,
                    }}
                  />

                  {/* Microscopic Fine Photo Print Grain */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-15"
                    style={{
                      backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)',
                      backgroundSize: '3px 3px',
                    }}
                  />
                </div>

                <div className="mt-1 text-[6.5px] sm:text-[7px] font-bold text-slate-700 uppercase tracking-wider text-center leading-tight">
                  <span>ROLL: {details.rollNo}</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span className="text-red-700 font-black">{details.bloodGroup}</span>
                </div>
              </div>

              {/* High-Contrast Thermal Transfer Credentials Grid */}
              <div className="flex-1 min-w-0 space-y-1 text-slate-800">
                {/* Full Legal Name */}
                <div className="border-b border-slate-300/80 pb-0.5">
                  <span className="text-[7px] sm:text-[7.5px] font-bold text-slate-500 uppercase tracking-wider block">
                    Student Name
                  </span>
                  <span className="text-[12px] sm:text-[13.5px] font-black text-slate-900 leading-tight block truncate">
                    {details.name}
                  </span>
                </div>

                {/* Structured Credential Grid in Authentic University ID Order */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] sm:text-[8.5px]">
                  <div>
                    <span className="text-slate-500 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider">
                      Student ID No.
                    </span>
                    <span className="font-bold text-blue-950 font-mono block truncate text-[8.5px] sm:text-[9.5px]">
                      {details.idNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider">
                      Registration No.
                    </span>
                    <span className="font-bold text-slate-900 font-mono block truncate text-[8.5px] sm:text-[9.5px]">
                      {details.registrationNo || '5-2-37-142-2022'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider">
                      Academic Program
                    </span>
                    <span
                      className="font-semibold text-slate-900 block truncate text-[8.5px] sm:text-[9.5px]"
                      title={details.program || details.level || 'Bachelor (CSIT)'}
                    >
                      {details.program || details.level || 'Bachelor (CSIT)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider">
                      Date of Birth
                    </span>
                    <span className="font-bold text-slate-800 font-mono block truncate text-[8.5px] sm:text-[9.5px]">
                      {details.dateOfBirth || '2003-04-15'}
                    </span>
                  </div>

                  <div className="bg-slate-50/95 border border-slate-200/90 rounded px-1.5 py-0.5 shadow-2xs">
                    <span className="text-slate-600 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider leading-tight">
                      Date of Issue
                    </span>
                    <span className="font-bold text-slate-900 font-mono block truncate text-[8.5px] sm:text-[9.5px]">
                      {details.issueDate || '2022 Dec 01'}
                    </span>
                  </div>

                  <div className="bg-red-50/95 border border-red-200/90 rounded px-1.5 py-0.5 shadow-2xs">
                    <span className="text-red-700 font-bold block text-[6.5px] sm:text-[7px] uppercase tracking-wider leading-tight">
                      Valid Until
                    </span>
                    <span className="font-black text-red-700 font-mono block truncate text-[8.5px] sm:text-[9.5px]">
                      {details.validUntil || '2026 Nov 30'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Watermarked Wet Stamp Overlapping Photo Edge */}
            {settings.showOfficialStamp && (
              <div
                className="absolute pointer-events-none z-20"
                style={{
                  bottom: '34px',
                  left: '56px',
                }}
              >
                <OfficialStamp
                  text="TRIBHUVAN UNIVERSITY • DEAN OFFICE • EXAM CONTROL"
                  date={details.issueDate}
                  size={64}
                  color="#c52233"
                  opacity={0.82}
                />
              </div>
            )}

            {/* Bottom Official Signatures Footer */}
            <div className="relative z-10 px-3 sm:px-4 py-1 bg-slate-50/95 border-t border-slate-200/90 flex items-center justify-between mt-auto flex-shrink-0">
              {/* Student Holder Signature */}
              <div className="w-[100px] sm:w-[125px] text-center">
                <div className="h-[20px] flex items-end justify-center mb-0.5">
                  {signatureConfig.studentSignatureUrl ? (
                    <img
                      src={signatureConfig.studentSignatureUrl}
                      alt="Cardholder Signature"
                      className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125 brightness-95"
                    />
                  ) : (
                    <span
                      className="text-[12px] sm:text-[14px] leading-none select-none font-semibold tracking-tight"
                      style={{ fontFamily: signatureConfig.studentSignatureFont || "'Great Vibes', cursive", color: '#090d16' }}
                    >
                      {signatureConfig.studentSignatureText || signatureConfig.studentSignatureName || details.name}
                    </span>
                  )}
                </div>
                <div className="border-t border-slate-400/80 pt-0.5 text-[6px] sm:text-[7px] font-bold text-slate-600 tracking-wider uppercase">
                  Cardholder Signature
                </div>
              </div>

              {/* Micro Status / Barcode Tag */}
              <div className="hidden sm:flex flex-col items-center opacity-85">
                <span className="text-[6.5px] font-mono text-slate-500">
                  {verificationRecord?.databaseId || `ID:${details.idNumber.slice(0, 10)}`}
                </span>
                <span className="text-[6px] text-emerald-700 font-bold uppercase tracking-wider">
                  VERIFIED • SECURED
                </span>
              </div>

              {/* Issuing Authority / Campus Chief Signature */}
              <div className="w-[110px] sm:w-[135px] text-center">
                <div className="h-[20px] flex items-end justify-center mb-0.5">
                  {signatureConfig.authoritySignatureUrl ? (
                    <img
                      src={signatureConfig.authoritySignatureUrl}
                      alt="Campus Chief Signature"
                      className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125 brightness-95"
                    />
                  ) : (
                    <span
                      className="text-[12px] sm:text-[14px] leading-none select-none font-bold"
                      style={{ fontFamily: "'Playfair Display', cursive", color: '#090d16' }}
                    >
                      {signatureConfig.authoritySignatureName || 'Prof. Dr. R. K. Sharma'}
                    </span>
                  )}
                </div>
                <div
                  className="border-t border-slate-400/80 pt-0.5 text-[6px] sm:text-[7px] font-bold tracking-wider uppercase truncate"
                  style={{ color: theme.secondaryColor }}
                >
                  {signatureConfig.authorityTitle || 'Campus Chief / Registrar'}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* BACK SIDE RENDERING */
          <div className="relative z-10 flex-1 flex flex-col justify-between p-3 sm:p-3.5 text-slate-800">
            {/* Top Back Magnetic Stripe / Smart Contact Header */}
            <div className="flex items-center justify-between border-b border-slate-300/90 pb-1.5">
              <div className="flex items-center gap-2">
                <SmartCardChip size={26} />
                <div>
                  <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-blue-950 block">
                    {instituteConfig.name || 'Tribhuvan University Central Campus'}
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] text-slate-500">
                    Kirtipur, Kathmandu, Nepal • www.tu.edu.np
                  </span>
                </div>
              </div>

              <div className="text-right leading-tight">
                <span className="text-[7.5px] font-mono font-bold text-slate-700 block">
                  REG: {verificationRecord?.databaseId || details.idNumber}
                </span>
                <div className="flex items-center justify-end gap-1.5 text-[7px] sm:text-[7.5px] mt-0.5 font-mono">
                  <span className="text-slate-600">
                    Issued: <strong className="text-slate-900 font-bold">{details.issueDate || '2022 Dec 01'}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-red-700 font-bold">
                    Valid Until: <strong className="text-red-800 font-black">{details.validUntil || '2026 Nov 30'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Terms & Regulations */}
            <div className="my-1.5 space-y-1 text-[7px] sm:text-[7.5px] text-slate-700 leading-relaxed bg-white/80 p-2 rounded-md border border-slate-200 shadow-2xs">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[7.5px]">
                Cardholder Terms &amp; Instructions:
              </div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>This card is official university property and must be produced upon demand.</li>
                <li>Non-transferable. Misuse or forgery constitutes a serious legal offense.</li>
                <li>If lost/found, immediately return to the Office of the Registrar, Kirtipur.</li>
              </ol>
            </div>

            {/* Student Permanent Data & Emergency Contact */}
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[7.5px] sm:text-[8px] bg-slate-100/95 p-1.5 sm:p-2 rounded-md border border-slate-200 shadow-2xs">
              <div>
                <span className="text-slate-500 font-bold">Date of Birth: </span>
                <span className="font-bold text-slate-800">{details.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Blood Group: </span>
                <span className="font-black text-red-700">{details.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-600 font-bold">Date of Issue: </span>
                <span className="font-bold text-slate-900">{details.issueDate || '2022 Dec 01'}</span>
              </div>
              <div>
                <span className="text-red-700 font-bold">Valid Until: </span>
                <span className="font-black text-red-800">{details.validUntil || '2026 Nov 30'}</span>
              </div>
              <div className="col-span-2 truncate">
                <span className="text-slate-500 font-bold">Academic Program: </span>
                <span className="font-semibold text-slate-800">{details.program || details.level || 'B.Sc. CSIT'}</span>
              </div>
              <div className="col-span-2 truncate">
                <span className="text-slate-500 font-bold">Permanent Address: </span>
                <span className="font-medium text-slate-800">{details.address}</span>
              </div>
              <div className="col-span-2 truncate">
                <span className="text-slate-500 font-bold">Emergency Contact: </span>
                <span className="font-mono font-bold text-slate-800">{details.emergencyContact}</span>
              </div>
            </div>

            {/* QR Code & Barcode Section on Back */}
            <div className="pt-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <OfficialQRCode
                  data={verificationRecord?.qrData || `TU-STUDENT:${details.idNumber}`}
                  size={52}
                  showCenterLogo={true}
                />
                <div>
                  <span className="text-[6.5px] font-bold text-slate-700 uppercase tracking-wider block">
                    Official Verification QR
                  </span>
                  <span className="text-[6px] text-slate-500 block">
                    Scan to verify registry
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-[190px]">
                <OfficialBarcode
                  data={verificationRecord?.barcodeData || details.idNumber.replace(/[^a-zA-Z0-9]/g, '')}
                  height={24}
                  showText={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Real Lamination Sheen / Diagonal Daylight Reflection across Card Face */}
        <div
          className="absolute inset-0 pointer-events-none z-30"
          style={{
            backgroundImage:
              'linear-gradient(124deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 24%, transparent 46%, rgba(255,255,255,0.08) 68%, transparent 100%)',
          }}
        />

        {/* Microscopic PVC Plastic Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay z-20"
          style={{
            backgroundImage:
              'radial-gradient(#94a3b8 0.75px, transparent 0.75px), radial-gradient(#64748b 0.75px, #f8fafc 0.75px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* Card Usage Age / Wear & Tear Effect (1, 2, 3, 4, 6, 12, 24 Months) */}
        <CardAgingOverlay
          months={settings.cardAgeMonths ?? 0}
          showBadge={settings.showCardAgeBadge}
        />
      </div>
    </div>
  );
};

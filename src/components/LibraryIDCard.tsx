import React from 'react';
import {
  StudentDetails,
  LibraryDetails,
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

interface LibraryIDCardProps {
  studentDetails: StudentDetails;
  libraryDetails: LibraryDetails;
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

export const LibraryIDCard: React.FC<LibraryIDCardProps> = ({
  studentDetails,
  libraryDetails,
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
    primaryColor: '#0f766e',
    secondaryColor: '#115e59',
    borderAccent: '#0f766e',
    badgeBg: '#0f766e',
    badgeText: '#ffffff',
  },
  id = 'tu-library-card',
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
              ? '#0f766e'
              : designConfig?.borderStyle === 'solid'
              ? designConfig.borderColor || '#0f766e'
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
          variant="library"
          opacity={
            watermarkConfig?.enabled
              ? watermarkConfig.opacity
              : settings.watermarkHighlight ? 0.26 : 0.16
          }
          scale={watermarkConfig?.scale || 1.0}
          highlight={watermarkConfig?.highlight ?? settings.watermarkHighlight}
          showCenterLogo={watermarkConfig ? (watermarkConfig.enabled && watermarkConfig.showOnLibrary) : true}
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
            <div className="border border-dashed border-teal-600/70 absolute inset-2 pointer-events-none" />
            <div className="text-[6.5px] font-mono text-teal-600 font-bold text-right bg-white/80 px-1 rounded-xs self-end">
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
                backgroundImage: 'linear-gradient(to right, rgba(240, 253, 250, 0.95), rgba(255, 253, 250, 0.92), rgba(240, 253, 250, 0.95))',
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

              {/* Center University & Central Library Header */}
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
                  className="text-[7.5px] sm:text-[8.5px] font-bold tracking-wide uppercase truncate leading-tight"
                  style={{ color: theme.secondaryColor }}
                >
                  {instituteConfig.librarySubTitle}
                </p>

                <span className="text-[6px] sm:text-[7px] text-slate-500 font-medium tracking-wider block leading-tight">
                  Kirtipur, Kathmandu, Nepal • Estd. 1959
                </span>
              </div>

              {/* Right Official Seal / Emblem */}
              <div className="flex-shrink-0 ml-2 hidden sm:flex items-center justify-center opacity-85">
                <TribhuvanLogo size={32} monochrome={true} />
              </div>
            </div>

            {/* Sub-Header Ribbon: Library Card & Member Category Banner */}
            <div
              className="relative z-10 px-3 py-0.5 flex items-center justify-between shadow-2xs text-white"
              style={{ backgroundColor: theme.badgeBg }}
            >
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase select-none">
                CENTRAL LIBRARY MEMBERSHIP CARD
              </span>
              <span className="text-[7px] sm:text-[8px] font-semibold text-teal-100 uppercase tracking-wider">
                {libraryDetails.cardType}
              </span>
            </div>

            {/* Main Body Grid: Portrait (Left) & Library Credentials (Right) */}
            <div className="relative z-10 flex-1 px-3 sm:px-3.5 py-1.5 flex items-start gap-2.5 sm:gap-3">
              {/* Member Passport Photo Box */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="relative w-[72px] h-[90px] sm:w-[80px] sm:h-[100px] rounded-md border-2 border-teal-800/80 bg-slate-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                  style={{
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                  }}
                >
                  <img
                    src={photoUrl}
                    alt={studentDetails.name}
                    className="w-full h-full object-cover transition-transform"
                    crossOrigin="anonymous"
                    style={{
                      transform: `scale(${photoAdjustments.zoom}) translate(${photoAdjustments.offsetX}px, ${photoAdjustments.offsetY}px)`,
                      filter: `brightness(${photoAdjustments.brightness}%) contrast(${photoAdjustments.contrast}%)`,
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

                {/* Member Number Pill */}
                <div className="mt-1 flex items-center justify-center">
                  <span className="text-[7px] sm:text-[7.5px] font-mono font-bold text-teal-900 bg-teal-50 border border-teal-200 px-1 py-0.2 rounded truncate max-w-[88px]">
                    {libraryDetails.memberNo}
                  </span>
                </div>
              </div>

              {/* Library Member Details Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-1">
                {/* Member Name */}
                <div className="border-b border-teal-200/80 pb-0.5">
                  <span className="text-[7px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                    Member Name
                  </span>
                  <div
                    className={`text-[12px] sm:text-[14px] font-black text-slate-900 leading-tight uppercase truncate ${letterSpacingClass}`}
                    style={{ color: theme.primaryColor }}
                    title={studentDetails.name}
                  >
                    {studentDetails.name}
                  </div>
                </div>

                {/* Academic Affiliation */}
                <div className="space-y-0.5 text-[8px] sm:text-[9px]">
                  <div className="flex items-baseline gap-1 truncate">
                    <span className="font-bold text-slate-600 flex-shrink-0">Program:</span>
                    <span className="font-semibold text-slate-900 truncate">{studentDetails.program}</span>
                  </div>

                  <div className="flex items-baseline gap-1 truncate">
                    <span className="font-medium text-slate-500 flex-shrink-0">Roll / ID:</span>
                    <span className="font-semibold text-slate-800 truncate">
                      {studentDetails.rollNo} • {studentDetails.idNumber}
                    </span>
                  </div>
                </div>

                {/* Circulation & Lending Privileges Data Grid */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8.5px] sm:text-[9.5px] bg-teal-50/90 p-1.5 rounded-md border border-teal-200/90 shadow-2xs">
                  <div className="bg-white/80 border border-teal-100 rounded px-1.5 py-0.5">
                    <span className="text-slate-600 font-bold block text-[7.5px] sm:text-[8px] uppercase tracking-wider leading-tight">
                      Date of Issue
                    </span>
                    <span className="font-bold text-slate-900 font-mono block truncate text-[9px] sm:text-[10px]">
                      {libraryDetails.issueDate || '2022 Dec 01'}
                    </span>
                  </div>
                  <div className="bg-emerald-50/90 border border-emerald-200 rounded px-1.5 py-0.5">
                    <span className="text-emerald-700 font-bold block text-[7.5px] sm:text-[8px] uppercase tracking-wider leading-tight">
                      Valid Until
                    </span>
                    <span className="font-black text-emerald-800 font-mono block truncate text-[9px] sm:text-[10px]">
                      {libraryDetails.validUntil || '2026 Nov 30'}
                    </span>
                  </div>
                  <div className="px-1.5 py-0.5">
                    <span className="text-slate-500 font-bold block text-[7.5px] sm:text-[8px] uppercase tracking-wider leading-tight">
                      Category
                    </span>
                    <span className="font-semibold text-slate-800 truncate block text-[8.5px] sm:text-[9.5px]">
                      {libraryDetails.borrowerCategory}
                    </span>
                  </div>
                  <div className="px-1.5 py-0.5">
                    <span className="text-teal-700 font-bold block text-[7.5px] sm:text-[8px] uppercase tracking-wider leading-tight">
                      Book Quota
                    </span>
                    <span className="font-bold text-teal-800 block text-[8.5px] sm:text-[9.5px]">
                      {libraryDetails.bookLimit} Volumes
                    </span>
                  </div>
                </div>

                {/* Library Branch indicator */}
                <div className="text-[7.5px] sm:text-[8px] text-teal-800 font-medium truncate pt-0.5">
                  <span>Branch: </span>
                  <span className="font-semibold">{libraryDetails.libraryBranch}</span>
                </div>
              </div>
            </div>

            {/* Official University Stamp Overlay */}
            {settings.showOfficialStamp && (
              <div className="absolute right-24 sm:right-28 bottom-7 sm:bottom-8 z-20 pointer-events-none">
                <OfficialStamp
                  text="CENTRAL LIBRARY • TRIBHUVAN UNIVERSITY"
                  size={58}
                  rotation={12}
                  color="#0f766e"
                  opacity={0.85}
                />
              </div>
            )}

            {/* Bottom Footer Section: Signatures */}
            <div className="relative z-10 px-3 sm:px-4 py-1.5 bg-slate-50/90 border-t border-teal-100 flex items-end justify-between">
              {/* Member Signature Area */}
              <div className="text-center w-22 sm:w-26">
                <div className="h-5 flex items-center justify-center select-none overflow-hidden">
                  {signatureConfig.studentSignatureUrl ? (
                    <img
                      src={signatureConfig.studentSignatureUrl}
                      alt="Member Signature"
                      className="max-h-5 max-w-[85px] object-contain mix-blend-multiply contrast-125 brightness-95"
                    />
                  ) : (
                    <span
                      className="text-[12px] sm:text-[13px] font-medium italic"
                      style={{ fontFamily: signatureConfig.studentSignatureFont || "'Great Vibes', cursive", color: '#090d16' }}
                    >
                      {signatureConfig.studentSignatureText || studentDetails.name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div
                  className="border-t border-slate-400/80 pt-0.5 text-[6.5px] sm:text-[7.5px] font-bold tracking-wider uppercase truncate"
                  style={{ color: theme.secondaryColor }}
                >
                  Member's Sign
                </div>
              </div>

              {/* Status Badge in Center Footer */}
              <div className="text-center">
                <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest block">
                  Central Library
                </span>
                <span className="text-[6.5px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  {status === 'approved' ? 'Circulation Active' : status.toUpperCase()}
                </span>
              </div>

              {/* Librarian Signature Area */}
              <div className="text-center w-28 sm:w-32">
                <div className="h-6 sm:h-7 flex items-center justify-center select-none overflow-hidden">
                  {signatureConfig.librarianSignatureUrl ? (
                    <img
                      src={signatureConfig.librarianSignatureUrl}
                      alt="Chief Librarian Signature"
                      className="max-h-6 sm:max-h-7 max-w-[105px] object-contain mix-blend-multiply contrast-125 brightness-95"
                    />
                  ) : (
                    <span
                      className="text-[12px] sm:text-[13px] font-bold italic"
                      style={{ fontFamily: signatureConfig.librarianSignatureFont || "'Playfair Display', cursive", color: '#090d16' }}
                    >
                      {signatureConfig.librarianSignatureText || 'Chief Librarian'}
                    </span>
                  )}
                </div>
                <div
                  className="border-t border-slate-400/80 pt-0.5 text-[6.5px] sm:text-[7.5px] font-bold tracking-wider uppercase truncate"
                  style={{ color: theme.secondaryColor }}
                >
                  Librarian's Sign
                </div>
              </div>
            </div>
          </>
        ) : (
          /* BACK SIDE RENDERING */
          <div className="relative z-10 flex-1 flex flex-col justify-between p-3 sm:p-3.5 text-slate-800">
            {/* Top Back Header: Smart Chip & Library ID info */}
            <div className="flex items-center justify-between border-b border-teal-200/90 pb-1.5">
              <div className="flex items-center gap-2">
                <SmartCardChip size={26} />
                <div>
                  <span className="text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-teal-950 block">
                    Central Library Circulation Desk
                  </span>
                  <span className="text-[6.5px] sm:text-[7px] text-slate-500">
                    Kirtipur, Kathmandu • Automated RFID Tag
                  </span>
                </div>
              </div>

              <div className="text-right leading-tight">
                <span className="text-[7.5px] font-mono font-bold text-teal-900 block">
                  MEM: {libraryDetails.memberNo}
                </span>
                <div className="flex items-center justify-end gap-1.5 text-[7px] sm:text-[7.5px] mt-0.5 font-mono">
                  <span className="text-slate-600">
                    Issued: <strong className="text-slate-900 font-bold">{libraryDetails.issueDate}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">
                    Valid Until: <strong className="text-emerald-800 font-black">{libraryDetails.validUntil}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Circulation Rules */}
            <div className="my-1.5 space-y-1 text-[7px] sm:text-[7.5px] text-slate-700 leading-relaxed bg-white/80 p-2 rounded-md border border-slate-200 shadow-2xs">
              <div className="font-bold text-teal-900 uppercase tracking-wider text-[7.5px]">
                Library Borrowing Regulations:
              </div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Maximum {libraryDetails.bookLimit} books may be borrowed for 14 days per loan cycle.</li>
                <li>Overdue items are subject to standard daily institutional library fines.</li>
                <li>Report lost or damaged membership cards immediately to circulation.</li>
              </ol>
            </div>

            {/* Physical Circulation Ledger Stamp Boxes */}
            <div className="bg-slate-50/90 p-1.5 rounded-md border border-slate-200 shadow-2xs">
              <div className="text-[6.5px] font-bold text-slate-500 uppercase mb-1">
                Circulation Desk Validation Stamp Grid:
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="border border-dashed border-teal-400/80 rounded py-1 bg-white/60">
                  <span className="text-[6px] text-slate-400 block font-mono">SLOT 1</span>
                  <span className="text-[6.5px] font-bold text-teal-800">APPROVED</span>
                </div>
                <div className="border border-dashed border-teal-400/80 rounded py-1 bg-white/60">
                  <span className="text-[6px] text-slate-400 block font-mono">SLOT 2</span>
                  <span className="text-[6.5px] font-bold text-teal-800">VERIFIED</span>
                </div>
                <div className="border border-dashed border-slate-300 rounded py-1 bg-white/40">
                  <span className="text-[6px] text-slate-400 block font-mono">SLOT 3</span>
                  <span className="text-[6.5px] text-slate-300">OPEN</span>
                </div>
                <div className="border border-dashed border-slate-300 rounded py-1 bg-white/40">
                  <span className="text-[6px] text-slate-400 block font-mono">SLOT 4</span>
                  <span className="text-[6.5px] text-slate-300">OPEN</span>
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Section on Back */}
            <div className="pt-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <OfficialQRCode
                  data={`TU-LIB:${libraryDetails.memberNo}:${studentDetails.idNumber}`}
                  size={50}
                  showCenterLogo={true}
                />
                <div>
                  <span className="text-[6.5px] font-bold text-teal-900 uppercase tracking-wider block">
                    Library RFID / QR
                  </span>
                  <span className="text-[6px] text-slate-500 block">
                    Automated Book Checkout
                  </span>
                </div>
              </div>

              <div className="flex-1 max-w-[190px]">
                <OfficialBarcode
                  data={libraryDetails.memberNo.replace(/[^a-zA-Z0-9]/g, '')}
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

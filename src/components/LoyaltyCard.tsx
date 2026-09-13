import React from 'react';
import {
  LoyaltyDetails,
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
import { Crown, Sparkles, Wifi, ShieldCheck, Gift } from 'lucide-react';

interface LoyaltyCardProps {
  details: LoyaltyDetails;
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

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
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
    primaryColor: '#09090b',
    secondaryColor: '#d97706',
    borderAccent: '#f59e0b',
    badgeBg: '#92400e',
    badgeText: '#fef3c7',
  },
  id = 'tu-loyalty-card',
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

  // Dynamic outer shadow
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

  return (
    <div
      id={id}
      className={`relative w-[340px] h-[214px] select-none text-slate-800 transition-all duration-300 ${cornerRadiusClass} overflow-hidden ${letterSpacingClass}`}
      style={{
        fontFamily: fontFamilyStyle,
        boxShadow: outerShadowStyle,
        backgroundColor: '#09090b',
        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
      }}
    >
      {/* Dynamic Security & Card Effects */}
      <SecurityWatermark
        variant="loyalty"
        showCenterLogo={watermarkConfig?.enabled ? watermarkConfig.showOnLoyalty : false}
        customLogoUrl={
          watermarkConfig?.enabled
            ? watermarkConfig.customLogoUrl || (watermarkConfig.autoCardLogo ? instituteConfig.customLogoUrl : undefined)
            : undefined
        }
        opacity={watermarkConfig?.enabled ? watermarkConfig.opacity : 0.07}
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
                ? 'linear-gradient(115deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.18) 75%, rgba(255,255,255,0.15) 100%)'
                : 'linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 48%, rgba(0,0,0,0.12) 80%, rgba(255,255,255,0.08) 100%)',
          }}
        />
      )}

      {/* Real metallic foil and edge glow */}
      {settings.logoGlow && (
        <div
          className="absolute -top-12 -left-12 w-44 h-44 rounded-full pointer-events-none z-20 opacity-30 blur-xl"
          style={{ backgroundImage: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
      )}

      {/* CARD FRONT */}
      {!isBack ? (
        <div className="relative w-full h-full flex flex-col justify-between p-2.5 z-10 text-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="h-6 px-1 rounded-md bg-white p-0.5 flex items-center justify-center shadow-xs">
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
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-200">
                  {details.programName || 'CAMPUS PRIVILEGE & REWARDS'}
                </p>
                <p className="text-[7.5px] font-medium text-amber-400/80 tracking-widest uppercase">
                  {details.organizationName || 'KATHMANDU MODEL COLLEGE'}
                </p>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-400/50 shadow-xs">
              <Crown className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[8.5px] font-black tracking-wider uppercase text-amber-300">
                {details.tier || 'GOLD VIP'}
              </span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="flex items-center gap-2.5 flex-1 py-1">
            {/* Left: Member Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-[66px] h-[82px] rounded-lg p-[1.5px] bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-[6px] overflow-hidden bg-slate-900 relative">
                  <img
                    src={photoUrl}
                    alt={details.memberName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    style={{
                      transform: `scale(${photoAdjustments.zoom}) translate(${photoAdjustments.offsetX}px, ${photoAdjustments.offsetY}px)`,
                      filter: `brightness(${photoAdjustments.brightness}%) contrast(${photoAdjustments.contrast}%)`,
                    }}
                  />
                </div>
              </div>
              <div className="mt-1 text-center bg-black/40 rounded px-1 py-0.5 border border-amber-500/20">
                <span className="text-[6.5px] font-bold text-amber-300/80 uppercase tracking-wider block">
                  Valid Until
                </span>
                <span className="text-[8px] font-mono font-black text-amber-200 block">
                  {details.validUntil || '12/2028'}
                </span>
              </div>
            </div>

            {/* Right: Chip, Member Name, ID, Points */}
            <div className="flex-1 flex flex-col justify-between h-full pl-0.5">
              {/* Chip & NFC Wave */}
              <div className="flex items-center justify-between pt-0.5">
                <SmartCardChip size={26} />
                <div className="flex items-center gap-1 opacity-80">
                  <Wifi className="w-3 h-3 text-amber-300 rotate-90" />
                  <span className="text-[7px] tracking-widest font-mono text-amber-200 uppercase">
                    RFID PAY
                  </span>
                </div>
              </div>

              {/* Member Name & ID */}
              <div className="my-0.5">
                <span className="text-[7px] uppercase font-bold text-amber-400/80 tracking-wider block">
                  Cardholder Member
                </span>
                <p className="text-[12px] font-black text-white tracking-wide truncate leading-tight uppercase font-mono drop-shadow-xs">
                  {details.memberName || 'ISABELLA ROSE'}
                </p>
                <p className="text-[9px] font-mono tracking-widest text-amber-200/90 font-bold">
                  {details.memberId || 'VIP-9842-8821'}
                </p>
              </div>

              {/* Points & Perks Badge */}
              <div className="p-1 rounded-md bg-amber-950/40 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[6.5px] text-amber-300/70 font-bold block uppercase">
                    Reward Balance
                  </span>
                  <span className="text-[9px] font-black text-amber-300 font-mono">
                    {details.pointsBalance || '5,420 PTS'}
                  </span>
                </div>
                {details.cashbackValue && (
                  <div className="text-right">
                    <span className="text-[6.5px] text-amber-300/70 font-bold block uppercase">
                      Privilege
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400 font-mono">
                      {details.cashbackValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between border-t border-amber-500/20 pt-1">
            <div className="flex items-center gap-1 text-[7px] text-amber-200/70 truncate max-w-[200px]">
              <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{details.perksSummary || 'Exclusive Discounts • VIP Campus Perks'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-mono text-amber-400/80">SINCE {details.memberSince || '2022'}</span>
              <div className="scale-65 origin-right">
                <OfficialBarcode data={details.barcodeNumber || details.memberId || '890482019482'} height={14} width={70} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CARD BACK */
        <div className="relative w-full h-full flex flex-col justify-between z-10 text-slate-200 bg-slate-950">
          {/* Magnetic Stripe */}
          <div className="w-full h-9 bg-black mt-2 relative border-y border-amber-900/30">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 opacity-90" />
          </div>

          {/* Signature Panel & QR Code */}
          <div className="px-3 py-1 flex items-center justify-between gap-3">
            {/* Tamper evident signature strip */}
            <div className="flex-1">
              <div className="h-6 bg-slate-100 rounded-sm flex items-center justify-end px-2 border border-slate-300 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
                <span
                  className="relative text-[11px] text-slate-900 font-medium"
                  style={{ fontFamily: signatureConfig.studentSignatureFont || "'Great Vibes', cursive" }}
                >
                  {signatureConfig.studentSignatureText || details.memberName}
                </span>
                <span className="absolute bottom-0.5 left-1 text-[6px] text-slate-400 uppercase tracking-widest font-mono">
                  Authorized Signature • Not Transferable
                </span>
              </div>
            </div>

            {/* QR for instant mobile scan */}
            <div className="w-8 h-8 bg-white p-0.5 rounded-sm flex-shrink-0 flex items-center justify-center">
              <OfficialQRCode data={`LOYALTY:${details.memberId}:${details.tier}`} size={28} />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="px-3 text-[6.5px] leading-tight text-slate-400">
            <p className="line-clamp-2">
              This card is the property of {details.organizationName || 'Kathmandu Model College'} and confers exclusive privileges upon the verified cardholder.
              Scan QR code at any affiliated campus outlet, cafeteria, or library counter to redeem points.
            </p>
          </div>

          {/* Bottom helpline & stamp */}
          <div className="px-3 pb-2 flex items-center justify-between border-t border-slate-800 pt-1 text-[6.5px] text-slate-500">
            <span>Customer Care: +977-1-4242121</span>
            <span className="font-mono text-amber-500 font-bold">VERIFIED REWARDS ID</span>
            <span>www.ktmmodelcollege.edu.np</span>
          </div>
        </div>
      )}
    </div>
  );
};

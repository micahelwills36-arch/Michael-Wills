import React, { useState, useRef } from 'react';
import { safeToPng } from '../utils/exportImage';
import { jsPDF } from 'jspdf';
import {
  X,
  Printer,
  Sparkles,
  Sliders,
  RotateCcw,
  SunMedium,
  Layers,
  Camera,
  Download,
  Eye,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Compass,
  Move,
  Maximize2,
  Briefcase,
  Crown,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import {
  StudentDetails,
  LibraryDetails,
  EmploymentDetails,
  LoyaltyDetails,
  InstituteConfig,
  SignatureConfig,
  PhotoAdjustments,
  RealismSettings,
  CardSide,
  CardDesignConfig,
  VerificationRecord,
  CardStatus,
  PresentationMockupSettings,
} from '../types';
import { StudentIDCard } from './StudentIDCard';
import { LibraryIDCard } from './LibraryIDCard';
import { WorkIDCard } from './WorkIDCard';
import { LoyaltyCard } from './LoyaltyCard';
import { INITIAL_MOCKUP_SETTINGS } from '../constants';

interface PrintRealisticPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Card states
  studentDetails: StudentDetails;
  libraryDetails: LibraryDetails;
  employmentDetails: EmploymentDetails;
  loyaltyDetails: LoyaltyDetails;
  instituteConfig: InstituteConfig;
  signatureConfig: SignatureConfig;
  photoUrl: string;
  photoAdjustments: PhotoAdjustments;
  settings: RealismSettings;
  designConfig: CardDesignConfig;
  verificationRecord: VerificationRecord;
  cardStatus: CardStatus;
  initialCardType?: 'student' | 'work' | 'library' | 'loyalty' | 'both';
  initialSide?: CardSide;
}

export const PrintRealisticPreviewModal: React.FC<PrintRealisticPreviewModalProps> = ({
  isOpen,
  onClose,
  studentDetails,
  libraryDetails,
  employmentDetails,
  loyaltyDetails,
  instituteConfig,
  signatureConfig,
  photoUrl,
  photoAdjustments,
  settings,
  designConfig,
  verificationRecord,
  cardStatus,
  initialCardType = 'work',
  initialSide = 'front',
}) => {
  const [selectedCard, setSelectedCard] = useState<
    'student' | 'work' | 'library' | 'loyalty' | 'both'
  >(initialCardType);
  const [cardSide, setCardSide] = useState<CardSide>(initialSide);
  const [mockup, setMockup] = useState<PresentationMockupSettings>(INITIAL_MOCKUP_SETTINGS);
  const [activeTab, setActiveTab] = useState<'transform' | 'environment' | 'lighting_shadow'>('transform');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const mockupStageRef = useRef<HTMLDivElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const updateMockup = <K extends keyof PresentationMockupSettings>(
    key: K,
    value: PresentationMockupSettings[K]
  ) => {
    setMockup((prev) => ({ ...prev, [key]: value }));
  };

  // Quick Preset Handlers
  const applyPreset = (preset: 'natural_desk' | 'isometric' | 'floating' | 'flat_scan') => {
    switch (preset) {
      case 'natural_desk':
        setMockup({
          ...mockup,
          perspectiveTiltX: 14,
          perspectiveTiltY: -10,
          perspectiveDistance: 1200,
          rotationZ: -2.5,
          positionX: 0,
          positionY: 0,
          cardElevation: 12,
          shadowIntensity: 60,
          shadowBlur: 30,
          background: 'neutral_grey',
          backgroundBlur: 3,
        });
        break;
      case 'isometric':
        setMockup({
          ...mockup,
          perspectiveTiltX: 28,
          perspectiveTiltY: -22,
          perspectiveDistance: 900,
          rotationZ: 8,
          positionX: 10,
          positionY: -5,
          cardElevation: 24,
          shadowIntensity: 75,
          shadowBlur: 45,
          background: 'oak_desk',
          backgroundBlur: 6,
        });
        break;
      case 'floating':
        setMockup({
          ...mockup,
          perspectiveTiltX: 10,
          perspectiveTiltY: 8,
          perspectiveDistance: 1400,
          rotationZ: 1.5,
          positionX: 0,
          positionY: -10,
          cardElevation: 32,
          shadowIntensity: 70,
          shadowBlur: 55,
          background: 'clean_marble',
          backgroundBlur: 8,
        });
        break;
      case 'flat_scan':
        setMockup({
          ...mockup,
          perspectiveTiltX: 0,
          perspectiveTiltY: 0,
          perspectiveDistance: 2000,
          rotationZ: 0,
          positionX: 0,
          positionY: 0,
          cardElevation: 0,
          shadowIntensity: 25,
          shadowBlur: 10,
          background: 'neutral_grey',
          backgroundBlur: 0,
        });
        break;
    }
  };

  // Generate background surface style (completely separate from card artwork)
  const getTabletopBackgroundStyle = () => {
    switch (mockup.background) {
      case 'oak_desk':
        return {
          backgroundColor: '#573315',
          backgroundImage: `
            radial-gradient(ellipse at 50% 40%, rgba(202, 138, 4, 0.28) 0%, rgba(67, 36, 10, 0.9) 100%),
            repeating-linear-gradient(90deg, rgba(30, 15, 5, 0.12) 0px, rgba(30, 15, 5, 0.12) 3px, transparent 3px, transparent 36px)
          `,
        };
      case 'linen_weave':
        return {
          backgroundColor: '#e6ded3',
          backgroundImage: `
            radial-gradient(circle at 50% 45%, #f5efe6 0%, #d8cdbe 100%),
            repeating-linear-gradient(45deg, rgba(120, 113, 108, 0.08) 0px, rgba(120, 113, 108, 0.08) 2px, transparent 2px, transparent 6px),
            repeating-linear-gradient(-45deg, rgba(120, 113, 108, 0.08) 0px, rgba(120, 113, 108, 0.08) 2px, transparent 2px, transparent 6px)
          `,
        };
      case 'clean_marble':
        return {
          backgroundColor: '#f8fafc',
          backgroundImage: `
            radial-gradient(ellipse at 40% 40%, #ffffff 0%, #e2e8f0 100%),
            radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 20% 80%, rgba(148, 163, 184, 0.12) 0%, transparent 45%)
          `,
        };
      case 'dark_slate':
        return {
          backgroundColor: '#0f172a',
          backgroundImage: `
            radial-gradient(ellipse at 50% 30%, #334155 0%, #090d16 100%),
            radial-gradient(#475569 0.75px, transparent 0.75px)
          `,
          backgroundSize: '100% 100%, 16px 16px',
        };
      case 'studio_white':
        return {
          backgroundColor: '#ffffff',
          backgroundImage: `radial-gradient(ellipse at 50% 50%, #ffffff 0%, #f1f5f9 100%)`,
        };
      case 'matte_concrete':
        return {
          backgroundColor: '#cbd5e1',
          backgroundImage: `
            radial-gradient(circle at 50% 35%, #e2e8f0 0%, #94a3b8 100%),
            radial-gradient(#64748b 0.65px, transparent 0.65px)
          `,
          backgroundSize: '100% 100%, 12px 12px',
        };
      case 'neutral_grey':
      default:
        return {
          backgroundColor: '#e2e8f0',
          backgroundImage: `
            radial-gradient(circle at 50% 30%, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%),
            radial-gradient(#94a3b8 0.75px, transparent 0.75px)
          `,
          backgroundSize: '100% 100%, 20px 20px',
        };
    }
  };

  // Compute shadow calculations
  const rad = (mockup.shadowAngle * Math.PI) / 180;
  const shadowDist = (mockup.cardElevation * 0.85) + 4;
  const shadowX = Math.round(Math.cos(rad) * shadowDist);
  const shadowY = Math.round(Math.sin(rad) * shadowDist);
  const shadowAlpha = (mockup.shadowIntensity / 100) * 0.45;
  const contactAlpha = (mockup.shadowIntensity / 100) * 0.35;

  const cardContainerTransform = `
    perspective(${mockup.perspectiveDistance}px)
    translate3d(${mockup.positionX}px, ${mockup.positionY}px, ${mockup.cardElevation}px)
    rotateX(${mockup.perspectiveTiltX}deg)
    rotateY(${mockup.perspectiveTiltY}deg)
    rotateZ(${mockup.rotationZ}deg)
  `;

  // Dynamic box shadow reflecting elevation, angle and softness
  const cardBoxShadow = `
    ${shadowX}px ${shadowY}px ${mockup.shadowBlur}px rgba(0, 0, 0, ${shadowAlpha}),
    ${Math.round(shadowX * 0.4)}px ${Math.round(shadowY * 0.4)}px ${Math.round(mockup.shadowBlur * 0.3)}px rgba(0, 0, 0, ${contactAlpha}),
    0 1px 3px rgba(0, 0, 0, 0.2)
  `;

  // Realistic PVC card edge & 3D bevel
  const pvcEdgeBorder = mockup.cardElevation > 4
    ? '0.76px solid rgba(255, 255, 255, 0.45)'
    : 'none';

  // Export handlers
  const handleExportMockupPng = async () => {
    if (!mockupStageRef.current) return;
    setIsExporting(true);
    setExportNotice(null);

    try {
      const dataUrl = await safeToPng(mockupStageRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `Card_Presentation_Mockup_${selectedCard}_${cardSide}.png`;
      link.href = dataUrl;
      link.click();

      setExportNotice('Presentation mockup PNG exported in high resolution!');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      console.error('Failed to export presentation mockup:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPrintPdf = async () => {
    if (!cardElementRef.current) return;
    setIsExporting(true);
    setExportNotice(null);

    try {
      const cardImage = await safeToPng(cardElementRef.current, {
        quality: 1,
        pixelRatio: 4, // 4x for crystal-clear 300+ DPI physical print reproduction
        cacheBust: true,
      });

      // Standard CR-80 physical dimensions: 85.60 mm x 53.98 mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98],
      });

      pdf.addImage(cardImage, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');
      pdf.save(`Print_Ready_CR80_${selectedCard}_${cardSide}.pdf`);

      setExportNotice('CR80 physical print-ready PDF generated successfully!');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      console.error('Failed to export print PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                  PRINT / REALISTIC PREVIEW MODE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Presentation Mockup
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Natural 3D perspective, physical PVC depth, realistic lighting, and isolated tabletop mockup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMockupPng}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Export complete tabletop presentation mockup image"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Export Mockup PNG</span>
            </button>

            <button
              type="button"
              onClick={handleExportPrintPdf}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Export CR80 print-ready PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print CR80 PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {exportNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-700/50 px-4 py-2 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Main Body: Stage (Left) & Controls Panel (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* LEFT: Presentation Mockup Stage */}
          <div className="flex-1 flex flex-col min-h-0 relative bg-slate-950">
            {/* Quick Top Bar Controls */}
            <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-20">
              {/* Card Switcher */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedCard('work')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCard === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Work ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard('loyalty')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCard === 'loyalty' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  <span>Loyalty ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard('student')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCard === 'student' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Student ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard('library')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCard === 'library' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Library ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCard('both')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedCard === 'both' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Dual</span>
                </button>
              </div>

              {/* Card Face Switcher & Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-blue-400" />
                  <span>Surface: {cardSide.toUpperCase()}</span>
                </button>

                {/* Quick Presets */}
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-slate-400 border-l border-slate-800 pl-2">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('natural_desk')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Desk
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('isometric')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    3D Iso
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('floating')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Float
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('flat_scan')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Flat
                  </button>
                </div>
              </div>
            </div>

            {/* PRESENTATION MOCKUP STAGE CANVAS */}
            <div
              ref={mockupStageRef}
              className="flex-1 w-full h-full relative flex items-center justify-center p-6 sm:p-10 lg:p-14 overflow-hidden select-none"
            >
              {/* 1. SEPARATE TABLETOP BACKGROUND LAYER (Controlled blur & depth-of-field) */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  ...getTabletopBackgroundStyle(),
                  filter: mockup.backgroundBlur > 0 ? `blur(${mockup.backgroundBlur}px)` : 'none',
                  transform: 'scale(1.06)', // prevent blur edges from bleeding into transparent frame
                }}
              />

              {/* 2. AMBIENT TABLETOP VIGNETTE OVERLAY */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                }}
              />

              {/* 3. CARD PRESENTATION ARTWORK CONTAINER (Completely separate from background) */}
              <div
                className="relative z-10 flex items-center justify-center gap-8 transition-transform duration-100 ease-out"
                style={{
                  transform: cardContainerTransform,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* PRIMARY CARD (or Card 1 in dual view) */}
                <div
                  ref={cardElementRef}
                  className="relative transition-shadow duration-100"
                  style={{
                    boxShadow: cardBoxShadow,
                    border: pvcEdgeBorder,
                    borderRadius: `${designConfig.cornerRadius || 12}px`,
                  }}
                >
                  {/* Subtle 3D Card Thickness / PVC Edge Layer */}
                  {mockup.cardElevation > 0 && (
                    <div
                      className="absolute inset-0 rounded-[12px] pointer-events-none"
                      style={{
                        transform: 'translateZ(-2px)',
                        backgroundColor: '#e2e8f0',
                        boxShadow: '0 0 1px rgba(0,0,0,0.4)',
                      }}
                    />
                  )}

                  {/* Render Requested Card Component */}
                  {selectedCard === 'work' && (
                    <WorkIDCard
                      id="mockup-work-card"
                      details={employmentDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={cardSide}
                      designConfig={designConfig}
                      verificationRecord={verificationRecord}
                      status={cardStatus}
                    />
                  )}

                  {selectedCard === 'loyalty' && (
                    <LoyaltyCard
                      id="mockup-loyalty-card"
                      details={loyaltyDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={cardSide}
                      designConfig={designConfig}
                      verificationRecord={verificationRecord}
                      status={cardStatus}
                    />
                  )}

                  {selectedCard === 'student' && (
                    <StudentIDCard
                      id="mockup-student-card"
                      details={studentDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={cardSide}
                      designConfig={designConfig}
                      verificationRecord={verificationRecord}
                      status={cardStatus}
                    />
                  )}

                  {selectedCard === 'library' && (
                    <LibraryIDCard
                      id="mockup-library-card"
                      studentDetails={studentDetails}
                      libraryDetails={libraryDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={cardSide}
                      designConfig={designConfig}
                      verificationRecord={verificationRecord}
                      status={cardStatus}
                    />
                  )}

                  {selectedCard === 'both' && (
                    <div className="flex items-center gap-6">
                      <WorkIDCard
                        id="mockup-work-card-dual"
                        details={employmentDetails}
                        instituteConfig={instituteConfig}
                        signatureConfig={signatureConfig}
                        photoUrl={photoUrl}
                        photoAdjustments={photoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                      />
                      <LoyaltyCard
                        id="mockup-loyalty-card-dual"
                        details={loyaltyDetails}
                        instituteConfig={instituteConfig}
                        signatureConfig={signatureConfig}
                        photoUrl={photoUrl}
                        photoAdjustments={photoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                      />
                    </div>
                  )}

                  {/* REALISTIC SPECULAR SURFACE LIGHTING OVERLAY */}
                  {mockup.specularSheen > 0 && (
                    <div
                      className="absolute inset-0 rounded-[12px] pointer-events-none mix-blend-overlay overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(${mockup.lightingAngle}deg, rgba(255,255,255,${
                          (mockup.specularSheen / 100) * 0.5
                        }) 0%, transparent 60%, rgba(255,255,255,${
                          (mockup.specularSheen / 100) * 0.25
                        }) 100%)`,
                        opacity: mockup.lightIntensity / 100,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* MANDATORY PRESENTATION DISCLAIMER */}
              <div className="absolute bottom-2 left-4 right-4 text-center pointer-events-none z-20">
                <p className="text-[10px] text-slate-400/80 bg-slate-950/60 backdrop-blur-xs py-1 px-3 rounded-full inline-block border border-slate-800/40">
                  <ShieldAlert className="w-3 h-3 inline mr-1 text-amber-400" />
                  Presentation Mockup Preview • Entire card &amp; four corners visible with authentic CR80 dimensions. This preview is for visual layout and styling purposes only. Do not represent the mockup as proof of official issuance or authenticity.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Mockup Customization Controls Panel */}
          <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto max-h-[42vh] lg:max-h-full">
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('transform')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'transform' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Perspective
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('environment')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'environment' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tabletop
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lighting_shadow')}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'lighting_shadow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lighting
                </button>
              </div>

              {/* TAB 1: PERSPECTIVE, ROTATION & POSITION */}
              {activeTab === 'transform' && (
                <div className="space-y-3.5 text-xs">
                  {/* Perspective Tilt X */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Perspective Tilt X</span>
                      <span className="font-mono text-blue-400">{mockup.perspectiveTiltX}°</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={mockup.perspectiveTiltX}
                      onChange={(e) => updateMockup('perspectiveTiltX', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Perspective Tilt Y */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Perspective Tilt Y</span>
                      <span className="font-mono text-blue-400">{mockup.perspectiveTiltY}°</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={mockup.perspectiveTiltY}
                      onChange={(e) => updateMockup('perspectiveTiltY', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Card Rotation Z */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Rotation Angle</span>
                      <span className="font-mono text-blue-400">{mockup.rotationZ}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={mockup.rotationZ}
                      onChange={(e) => updateMockup('rotationZ', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Card Elevation / Lift */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Card Elevation (Lift)</span>
                      <span className="font-mono text-blue-400">{mockup.cardElevation}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={mockup.cardElevation}
                      onChange={(e) => updateMockup('cardElevation', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Position X Offset */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Card Position X</span>
                      <span className="font-mono text-blue-400">{mockup.positionX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={mockup.positionX}
                      onChange={(e) => updateMockup('positionX', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Position Y Offset */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Card Position Y</span>
                      <span className="font-mono text-blue-400">{mockup.positionY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={mockup.positionY}
                      onChange={(e) => updateMockup('positionY', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TABLETOP BACKGROUND & DEPTH-OF-FIELD BLUR */}
              {activeTab === 'environment' && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-2">
                      Neutral Tabletop / Background
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'neutral_grey', label: 'Studio Grey' },
                        { id: 'oak_desk', label: 'Polished Oak' },
                        { id: 'linen_weave', label: 'Fine Linen' },
                        { id: 'clean_marble', label: 'White Marble' },
                        { id: 'dark_slate', label: 'Dark Slate' },
                        { id: 'studio_white', label: 'Pure White' },
                        { id: 'matte_concrete', label: 'Concrete' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateMockup('background', item.id as any)}
                          className={`px-2.5 py-2 rounded-lg text-left font-medium border transition-all cursor-pointer ${
                            mockup.background === item.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Blur (Depth of Field) */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Background Blur (Depth of Field)</span>
                      <span className="font-mono text-blue-400">{mockup.backgroundBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={mockup.backgroundBlur}
                      onChange={(e) => updateMockup('backgroundBlur', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Blurs strictly the tabletop background behind the card, keeping card artwork 100% sharp.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: REALISTIC LIGHTING & SHADOW */}
              {activeTab === 'lighting_shadow' && (
                <div className="space-y-3.5 text-xs">
                  {/* Shadow Intensity */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Shadow Intensity</span>
                      <span className="font-mono text-blue-400">{mockup.shadowIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockup.shadowIntensity}
                      onChange={(e) => updateMockup('shadowIntensity', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Shadow Softness / Blur */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Shadow Softness / Spread</span>
                      <span className="font-mono text-blue-400">{mockup.shadowBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      value={mockup.shadowBlur}
                      onChange={(e) => updateMockup('shadowBlur', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Shadow Angle */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Shadow Direction Angle</span>
                      <span className="font-mono text-blue-400">{mockup.shadowAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={mockup.shadowAngle}
                      onChange={(e) => updateMockup('shadowAngle', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Specular Sheen Gloss */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Specular Surface Sheen</span>
                      <span className="font-mono text-blue-400">{mockup.specularSheen}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mockup.specularSheen}
                      onChange={(e) => updateMockup('specularSheen', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Lighting Glint Angle */}
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300 mb-1">
                      <span>Lighting Glint Angle</span>
                      <span className="font-mono text-blue-400">{mockup.lightingAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={mockup.lightingAngle}
                      onChange={(e) => updateMockup('lightingAngle', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMockup(INITIAL_MOCKUP_SETTINGS)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Reset Default
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Done Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

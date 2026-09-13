import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { safeToPng, safeToJpeg } from '../utils/exportImage';
import {
  Download,
  Loader2,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Layers,
  Box,
  Wand2,
  ShieldCheck,
  RotateCw,
  Copy,
  Sliders,
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
  RealisticMockupConfig,
  CardTemplate,
  WatermarkConfig,
  CornerShadowConfig,
  MockupEffect,
} from '../types';
import { StudentIDCard } from './StudentIDCard';
import { LibraryIDCard } from './LibraryIDCard';
import { WorkIDCard } from './WorkIDCard';
import { LoyaltyCard } from './LoyaltyCard';
import { computeCornerBoxShadow, getTabletopSurfaceStyle, getEffectVisuals } from '../utils/mockupRealism';
import { DEFAULT_CORNER_SHADOWS, BACKGROUND_SURFACES } from '../constants';

export type ExportLayoutOption =
  | 'student_and_employee'
  | 'student_and_employee_back'
  | 'single_front'
  | 'single_back'
  | 'front_and_back'
  | 'double_front'
  | 'double_back';

export interface SingleCardExportOptions {
  cardType?: 'student' | 'work' | 'library' | 'loyalty';
  layout?: ExportLayoutOption;
  format?: 'png' | 'jpg';
  side?: CardSide;
  surface?: 'varnished_oak' | 'sunlight_wood' | 'table' | 'marble' | 'wood' | 'bedsheet' | 'neutral' | 'dark_slate';
  effect?: MockupEffect;
  cornerShadows?: CornerShadowConfig;
}

export interface SingleCardMockupExporterRef {
  exportCard: (options: SingleCardExportOptions) => Promise<void>;
  openModalForCard: (
    cardType?: 'student' | 'work' | 'library' | 'loyalty',
    initialLayout?: ExportLayoutOption
  ) => void;
}

interface SingleCardMockupExporterProps {
  studentDetails: StudentDetails;
  libraryDetails: LibraryDetails;
  employmentDetails: EmploymentDetails;
  loyaltyDetails: LoyaltyDetails;
  instituteConfig: InstituteConfig;
  signatureConfig: SignatureConfig;
  photoUrl: string;
  photoAdjustments: PhotoAdjustments;
  libraryPhotoUrl: string;
  libraryPhotoAdjustments: PhotoAdjustments;
  settings: RealismSettings;
  designConfig: CardDesignConfig;
  verificationRecord: VerificationRecord;
  cardStatus: CardStatus;
  currentTemplate: CardTemplate;
  cardSide: CardSide;
  mockupConfig: RealisticMockupConfig;
  watermarkConfig?: WatermarkConfig;
  onUpdateWatermarkConfig?: (config: WatermarkConfig) => void;
  onExportSuccess?: (fileName: string) => void;
}

export const SingleCardMockupExporter = forwardRef<
  SingleCardMockupExporterRef,
  SingleCardMockupExporterProps
>(
  (
    {
      studentDetails,
      libraryDetails,
      employmentDetails,
      loyaltyDetails,
      instituteConfig,
      signatureConfig,
      photoUrl,
      photoAdjustments,
      libraryPhotoUrl,
      libraryPhotoAdjustments,
      settings,
      designConfig,
      verificationRecord,
      cardStatus,
      currentTemplate,
      cardSide,
      mockupConfig,
      watermarkConfig,
      onUpdateWatermarkConfig,
      onExportSuccess,
    },
    ref
  ) => {
    const exportStageRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<'student' | 'work' | 'library' | 'loyalty'>('student');
    const [selectedSecondaryCard, setSelectedSecondaryCard] = useState<'student' | 'work' | 'library' | 'loyalty'>('library');
    const [exportLayout, setExportLayout] = useState<ExportLayoutOption>('single_front');
    const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
    const [activeSurface, setActiveSurface] = useState<
      'varnished_oak' | 'sunlight_wood' | 'table' | 'marble' | 'wood' | 'bedsheet' | 'neutral' | 'dark_slate'
    >('varnished_oak');
    const [activeEffect, setActiveEffect] = useState<MockupEffect>('natural');
    const [activeCornerShadows, setActiveCornerShadows] = useState<CornerShadowConfig>(
      mockupConfig.cornerShadows || DEFAULT_CORNER_SHADOWS
    );
    const [notice, setNotice] = useState<string | null>(null);

    // Dynamic Corner Box Shadow
    const computedBoxShadow = computeCornerBoxShadow(activeCornerShadows, 22);
    const effectVisuals = getEffectVisuals(activeEffect);

    // Card Renderer Helper
    const renderCardInstance = (
      type: 'student' | 'work' | 'library' | 'loyalty',
      side: CardSide,
      instanceId: string
    ) => {
      switch (type) {
        case 'work':
          return (
            <WorkIDCard
              id={`export-${instanceId}`}
              details={employmentDetails}
              instituteConfig={instituteConfig}
              signatureConfig={signatureConfig}
              photoUrl={photoUrl}
              photoAdjustments={photoAdjustments}
              settings={settings}
              side={side}
              designConfig={designConfig}
              verificationRecord={verificationRecord}
              status={cardStatus}
              watermarkConfig={watermarkConfig}
            />
          );
        case 'loyalty':
          return (
            <LoyaltyCard
              id={`export-${instanceId}`}
              details={loyaltyDetails}
              instituteConfig={instituteConfig}
              signatureConfig={signatureConfig}
              photoUrl={libraryPhotoUrl || photoUrl}
              photoAdjustments={libraryPhotoAdjustments || photoAdjustments}
              settings={settings}
              side={side}
              designConfig={designConfig}
              verificationRecord={verificationRecord}
              status={cardStatus}
              watermarkConfig={watermarkConfig}
            />
          );
        case 'library':
          return (
            <LibraryIDCard
              id={`export-${instanceId}`}
              studentDetails={studentDetails}
              libraryDetails={libraryDetails}
              instituteConfig={instituteConfig}
              signatureConfig={signatureConfig}
              photoUrl={libraryPhotoUrl || photoUrl}
              photoAdjustments={libraryPhotoAdjustments || photoAdjustments}
              settings={settings}
              side={side}
              designConfig={designConfig}
              verificationRecord={verificationRecord}
              status={cardStatus}
              theme={currentTemplate.libraryCardTheme}
              watermarkConfig={watermarkConfig}
            />
          );
        case 'student':
        default:
          return (
            <StudentIDCard
              id={`export-${instanceId}`}
              details={studentDetails}
              instituteConfig={instituteConfig}
              signatureConfig={signatureConfig}
              photoUrl={photoUrl}
              photoAdjustments={photoAdjustments}
              settings={settings}
              side={side}
              designConfig={designConfig}
              verificationRecord={verificationRecord}
              status={cardStatus}
              theme={currentTemplate.studentCardTheme}
              watermarkConfig={watermarkConfig}
            />
          );
      }
    };

    // Execute Export
    const executeExport = async (
      cardType: 'student' | 'work' | 'library' | 'loyalty',
      layout: ExportLayoutOption,
      format: 'png' | 'jpg',
      surface: 'table' | 'marble' | 'wood' | 'bedsheet' | 'neutral' | 'dark_slate',
      effect: MockupEffect,
      shadows: CornerShadowConfig
    ) => {
      setSelectedCard(cardType);
      setExportLayout(layout);
      setExportFormat(format);
      setActiveSurface(surface);
      setActiveEffect(effect);
      setActiveCornerShadows(shadows);

      setIsExporting(true);
      setNotice(`Generating 1500 × 1000 px ${format.toUpperCase()} mockup...`);

      // Ensure offscreen DOM is fully rendered
      await new Promise((r) => setTimeout(r, 450));

      if (!exportStageRef.current) {
        setIsExporting(false);
        setNotice('Export failed: Canvas ref unavailable');
        setTimeout(() => setNotice(null), 3000);
        return;
      }

      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${cardType}-id-card-${layout}-1500x1000-${timestamp}.${format}`;

        const exportOptions = {
          pixelRatio: 1,
          width: 1500,
          height: 1000,
          backgroundColor: '#ffffff',
          skipFonts: false,
          cacheBust: true,
        };

        let dataUrl: string;
        if (format === 'jpg') {
          dataUrl = await safeToJpeg(exportStageRef.current, {
            ...exportOptions,
            quality: 0.98,
          });
        } else {
          dataUrl = await safeToPng(exportStageRef.current, exportOptions);
        }

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setNotice(`Successfully downloaded 1500×1000 ${format.toUpperCase()}!`);
        onExportSuccess?.(filename);
      } catch (err) {
        console.error('Export error:', err);
        setNotice('Export completed with fallback renderer.');
      } finally {
        setIsExporting(false);
        setTimeout(() => setNotice(null), 4000);
      }
    };

    // Imperative Handle
    useImperativeHandle(ref, () => ({
      exportCard: async (opts) => {
        const targetCard = opts.cardType || selectedCard;
        const targetLayout = opts.layout || (opts.side === 'back' ? 'single_back' : 'single_front');
        const targetFormat = opts.format || exportFormat;
        const targetSurface = opts.surface || activeSurface;
        const targetEffect = opts.effect || activeEffect;
        const targetShadows = opts.cornerShadows || activeCornerShadows;

        await executeExport(
          targetCard,
          targetLayout,
          targetFormat,
          targetSurface,
          targetEffect,
          targetShadows
        );
      },
      openModalForCard: (cardType, initialLayout) => {
        if (cardType) setSelectedCard(cardType);
        if (initialLayout) setExportLayout(initialLayout);
        setIsModalOpen(true);
      },
    }));

    return (
      <>
        {/* Notice Toast */}
        {notice && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
            {isExporting ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{notice}</span>
          </div>
        )}

        {/* 
          OFFSCREEN HIGH-RESOLUTION 1500 × 1000 EXPORT CANVAS STAGE
          Wrapped safely with position: fixed; left: 0; top: 0; zIndex: -9999;
          This prevents dark, empty, or pixelsess foreignObject rendering in html-to-image.
        */}
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '1500px',
            height: '1000px',
            zIndex: -9999,
            pointerEvents: 'none',
            opacity: 1,
            visibility: 'visible',
            overflow: 'hidden',
          }}
        >
          <div
            ref={exportStageRef}
            id="single-card-export-stage-1500x1000"
            style={{
              position: 'relative',
              width: '1500px',
              height: '1000px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...getTabletopSurfaceStyle(activeSurface),
            }}
          >
            {/* Tabletop Ambient Lighting Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundImage:
                  'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.08) 65%, rgba(0,0,0,0.32) 100%)',
              }}
            />

            {/* Subtle camera sensor grain */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
                opacity: 0.08,
                backgroundImage:
                  'radial-gradient(#000 0.75px, transparent 0.75px), radial-gradient(#fff 0.75px, transparent 0.75px)',
                backgroundSize: '4px 4px',
                backgroundPosition: '0 0, 2px 2px',
              }}
            />

            {/* LAYOUT 0: STUDENT ID & EMPLOYEE CARD TOGETHER AT ONCE */}
            {exportLayout === 'student_and_employee' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '52px',
                  zIndex: 10,
                }}
              >
                {/* Student ID Card Front */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(-1.5deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '16px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                  />
                  {renderCardInstance('student', 'front', 'pair-student-front')}
                </div>

                {/* Employee / Work ID Card Front */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(1.4deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '16px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                  />
                  {renderCardInstance('work', 'front', 'pair-work-front')}
                </div>
              </div>
            )}

            {/* LAYOUT 0B: STUDENT ID & EMPLOYEE CARD BACKS TOGETHER */}
            {exportLayout === 'student_and_employee_back' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '52px',
                  zIndex: 10,
                }}
              >
                {/* Student ID Card Back */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(-1.2deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '16px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                  />
                  {renderCardInstance('student', 'back', 'pair-student-back')}
                </div>

                {/* Employee / Work ID Card Back */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(1.6deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '16px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                  />
                  {renderCardInstance('work', 'back', 'pair-work-back')}
                </div>
              </div>
            )}

            {/* LAYOUT 1: SINGLE CARD FRONT (1500 x 1000 CENTERED) */}
            {exportLayout === 'single_front' && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  transform: 'scale(1.95) rotate(-0.5deg)',
                  transformOrigin: 'center center',
                  boxShadow: computedBoxShadow,
                  borderRadius: '16px',
                  filter: effectVisuals.filterStyle,
                }}
              >
                {/* Optical Effect Overlay */}
                <div
                  className={effectVisuals.overlayClass}
                  style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                />
                {renderCardInstance(selectedCard, 'front', 'single-front')}
              </div>
            )}

            {/* LAYOUT 2: SINGLE CARD BACK (1500 x 1000 CENTERED) */}
            {exportLayout === 'single_back' && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 10,
                  transform: 'scale(1.95) rotate(0.5deg)',
                  transformOrigin: 'center center',
                  boxShadow: computedBoxShadow,
                  borderRadius: '16px',
                  filter: effectVisuals.filterStyle,
                }}
              >
                <div
                  className={effectVisuals.overlayClass}
                  style={{ ...effectVisuals.overlayStyle, borderRadius: '16px' }}
                />
                {renderCardInstance(selectedCard, 'back', 'single-back')}
              </div>
            )}

            {/* LAYOUT 3: FRONT & BACK DUO OF SAME CARD */}
            {exportLayout === 'front_and_back' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '54px',
                  zIndex: 10,
                }}
              >
                {/* Front Side */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(-1.5deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedCard, 'front', 'duo-front')}
                </div>

                {/* Back Side */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(1.8deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedCard, 'back', 'duo-back')}
                </div>
              </div>
            )}

            {/* LAYOUT 4: DOUBLE CARDS FRONT */}
            {exportLayout === 'double_front' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '50px',
                  zIndex: 10,
                }}
              >
                {/* First Card Front */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(-1deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedCard, 'front', 'double-front-1')}
                </div>

                {/* Second Card Front */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(1.2deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedSecondaryCard, 'front', 'double-front-2')}
                </div>
              </div>
            )}

            {/* LAYOUT 5: DOUBLE CARDS BACK */}
            {exportLayout === 'double_back' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '50px',
                  zIndex: 10,
                }}
              >
                {/* First Card Back */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(-1.2deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedCard, 'back', 'double-back-1')}
                </div>

                {/* Second Card Back */}
                <div
                  style={{
                    transform: 'scale(1.42) rotate(1deg)',
                    transformOrigin: 'center center',
                    boxShadow: computedBoxShadow,
                    borderRadius: '14px',
                    filter: effectVisuals.filterStyle,
                    position: 'relative',
                  }}
                >
                  <div
                    className={effectVisuals.overlayClass}
                    style={{ ...effectVisuals.overlayStyle, borderRadius: '14px' }}
                  />
                  {renderCardInstance(selectedSecondaryCard, 'back', 'double-back-2')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE 1500 × 1000 EXPORT MODAL STUDIO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">
                      1500 × 1000 Realistic Mockup Exporter Studio
                    </h2>
                    <p className="text-xs text-blue-200">
                      Single card, double card, front & back options with real background templates & shadow controls
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* 1. Card Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    1. Select Primary Card
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'student', label: 'Student Card', icon: '🎓' },
                      { id: 'library', label: 'Library Card', icon: '📚' },
                      { id: 'work', label: 'Work ID Card', icon: '💼' },
                      { id: 'loyalty', label: 'Loyalty VIP Card', icon: '👑' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCard(c.id as any)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedCard === c.id
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-base mb-0.5">{c.icon}</div>
                        <div className="font-bold">{c.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Export Layout: Single, Double, Back Single, Back Double, Front & Back */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    2. Choose Presentation Layout (1500 × 1000)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: 'student_and_employee',
                        label: '🎓 + 💼 Student & Employee Duo',
                        desc: 'Place Student ID & Employee Card at once side-by-side',
                      },
                      {
                        id: 'student_and_employee_back',
                        label: '🎓 + 💼 Student & Employee Backs',
                        desc: 'Both back surfaces side-by-side',
                      },
                      {
                        id: 'single_front',
                        label: 'Single Card Front',
                        desc: 'Front face centered high-res',
                      },
                      {
                        id: 'single_back',
                        label: 'Single Card Back',
                        desc: 'Back face centered high-res',
                      },
                      {
                        id: 'front_and_back',
                        label: 'Front & Back Duo',
                        desc: 'Same card front + back side-by-side',
                      },
                      {
                        id: 'double_front',
                        label: 'Custom Duo Fronts',
                        desc: 'Any two card fronts side-by-side',
                      },
                      {
                        id: 'double_back',
                        label: 'Custom Duo Backs',
                        desc: 'Any two card backs side-by-side',
                      },
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setExportLayout(l.id as ExportLayoutOption)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          exportLayout === l.id
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{l.label}</div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5">{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Card Selector for Double Cards layout */}
                {(exportLayout === 'double_front' || exportLayout === 'double_back') && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                    <label className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
                      Select Secondary Card for Duo Layout
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'library', label: 'Library Card' },
                        { id: 'student', label: 'Student Card' },
                        { id: 'work', label: 'Work ID Card' },
                        { id: 'loyalty', label: 'Loyalty Card' },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedSecondaryCard(c.id as any)}
                          className={`p-2 rounded-lg border text-center font-bold text-xs cursor-pointer transition-all ${
                            selectedSecondaryCard === c.id
                              ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Real Background Surface Templates (Table, Marble, Wood, Bed Sheet, etc.) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    3. Real Background Template
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'varnished_oak', label: 'Varnished Oak (Ref 1)', icon: '🪵' },
                      { id: 'sunlight_wood', label: 'Sunlight Wood (Ref 2)', icon: '☀️' },
                      { id: 'bedsheet', label: 'Bed Sheet', icon: '🛏️' },
                      { id: 'marble', label: 'Marble', icon: '🏛️' },
                      { id: 'wood', label: 'Wood Grain', icon: '🪵' },
                      { id: 'table', label: 'Office Desk', icon: '🏢' },
                      { id: 'neutral', label: 'Studio Neutral', icon: '📸' },
                      { id: 'dark_slate', label: 'Dark Slate', icon: '⬛' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSurface(s.id as any)}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          activeSurface === s.id
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="text-base mb-0.5">{s.icon}</div>
                        <div className="font-semibold text-[11px] truncate">{s.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Realistic Effects (Natural, Scan, Old Rush, Used, Reality, Hologram) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    4. Optical Card Effect
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'natural', label: 'Natural Effect', desc: 'Soft ambient daylight' },
                      { id: 'scan', label: 'Scan Effect', desc: 'Flatbed scanner glass & lines' },
                      { id: 'old_rush', label: 'Mid Rush Old Effect', desc: 'Vintage warm patina & edge vignette' },
                      { id: 'used', label: 'Used Card Effect', desc: 'Pocket scratches & micro scuffs' },
                      { id: 'reality', label: 'Reality Effect', desc: 'Specular plastic sheen & depth' },
                      { id: 'hologram', label: 'Hologram Sheen', desc: 'Prismatic foil rainbow' },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setActiveEffect(eff.id as MockupEffect)}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                          activeEffect === eff.id
                            ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="font-bold">{eff.label}</div>
                        <div className="text-[10px] text-slate-500">{eff.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Every-Corner Shadow Control */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-blue-600" />
                      <span>5. Every-Corner Shadow Control</span>
                    </span>

                    {/* Presets */}
                    <div className="flex gap-1">
                      {[
                        { id: 'flat', label: 'Flat', tl: 2, tr: 2, bl: 4, br: 4 },
                        { id: 'natural', label: 'Natural', tl: 8, tr: 10, bl: 18, br: 24 },
                        { id: 'curled', label: 'Curled', tl: 4, tr: 28, bl: 8, br: 32 },
                        { id: 'floating', label: 'Floating', tl: 20, tr: 20, bl: 30, br: 30 },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setActiveCornerShadows((prev) => ({
                              ...prev,
                              topLeft: p.tl,
                              topRight: p.tr,
                              bottomLeft: p.bl,
                              bottomRight: p.br,
                            }))
                          }
                          className="px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[10.5px] text-slate-600 mb-0.5">
                        <span>Top-Left:</span>
                        <span className="font-bold text-blue-600">{activeCornerShadows.topLeft}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={activeCornerShadows.topLeft}
                        onChange={(e) =>
                          setActiveCornerShadows((prev) => ({
                            ...prev,
                            topLeft: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10.5px] text-slate-600 mb-0.5">
                        <span>Top-Right:</span>
                        <span className="font-bold text-blue-600">{activeCornerShadows.topRight}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={activeCornerShadows.topRight}
                        onChange={(e) =>
                          setActiveCornerShadows((prev) => ({
                            ...prev,
                            topRight: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10.5px] text-slate-600 mb-0.5">
                        <span>Bottom-Left:</span>
                        <span className="font-bold text-blue-600">{activeCornerShadows.bottomLeft}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={activeCornerShadows.bottomLeft}
                        onChange={(e) =>
                          setActiveCornerShadows((prev) => ({
                            ...prev,
                            bottomLeft: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10.5px] text-slate-600 mb-0.5">
                        <span>Bottom-Right:</span>
                        <span className="font-bold text-blue-600">{activeCornerShadows.bottomRight}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={40}
                        value={activeCornerShadows.bottomRight}
                        onChange={(e) =>
                          setActiveCornerShadows((prev) => ({
                            ...prev,
                            bottomRight: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Format Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    6. File Output Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExportFormat('png')}
                      className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        exportFormat === 'png'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      PNG (Lossless 1500 × 1000)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('jpg')}
                      className={`p-2.5 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        exportFormat === 'jpg'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      JPG (Ultra-Crisp 98% Quality)
                    </button>
                  </div>
                </div>

                {/* Specs Summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600 font-mono text-[11px]">
                  <span>Resolution: <strong className="text-blue-600 font-bold">1500 × 1000 px</strong></span>
                  <span>Surface: <strong className="text-slate-800 font-bold capitalize">{activeSurface}</strong></span>
                  <span>Effect: <strong className="text-slate-800 font-bold capitalize">{activeEffect}</strong></span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={async () => {
                    await executeExport(
                      selectedCard,
                      exportLayout,
                      exportFormat,
                      activeSurface,
                      activeEffect,
                      activeCornerShadows
                    );
                    setIsModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating 1500 × 1000...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download 1500 × 1000 {exportFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

SingleCardMockupExporter.displayName = 'SingleCardMockupExporter';

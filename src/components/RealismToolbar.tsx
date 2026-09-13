import React, { useState, useRef, useEffect } from 'react';
import {
  RealismSettings,
  InstituteConfig,
  RealisticMockupConfig,
} from '../types';
import { TribhuvanLogo } from './TribhuvanLogo';
import {
  Download,
  Sparkles,
  Layers,
  Bed,
  Compass,
  Stamp,
  Edit3,
  Sliders,
  Camera,
  Scan,
  ShieldCheck,
  Droplet,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  Sun,
} from 'lucide-react';

interface RealismToolbarProps {
  settings: RealismSettings;
  onUpdateSettings: (settings: RealismSettings) => void;
  instituteConfig: InstituteConfig;
  onOpenEditor: () => void;
  onOpenPhotoUpload: () => void;
  onOpenInstituteSwitcher: () => void;
  onTogglePhotoGenerator?: () => void;
  onDownloadPhoto: () => void; // Export All
  isDownloading: boolean;
  activeCardType?: 'student' | 'work' | 'library' | 'loyalty' | 'both';
  onSelectCardToView?: (card: 'student' | 'work' | 'library' | 'loyalty' | 'both') => void;
  onOpenMockupPreview?: () => void;
  onOpenLogoManager?: () => void;
  // Realistic Mockup additions
  mockupConfig: RealisticMockupConfig;
  onToggleRealisticMockup: () => void;
  onOpenRealisticMockupSettings: () => void;
  isMockupSettingsOpen?: boolean;
  onExportSingleCard: (format?: 'png' | 'jpg', layout?: any) => void;
  onOpenMockupStudio?: (cardType?: 'student' | 'work' | 'library' | 'loyalty', layout?: any) => void;
}

export const RealismToolbar: React.FC<RealismToolbarProps> = ({
  settings,
  onUpdateSettings,
  instituteConfig,
  onOpenEditor,
  onOpenPhotoUpload,
  onOpenInstituteSwitcher,
  onTogglePhotoGenerator,
  onDownloadPhoto,
  isDownloading,
  activeCardType = 'both',
  onSelectCardToView,
  onOpenMockupPreview,
  onOpenLogoManager,
  mockupConfig,
  onToggleRealisticMockup,
  onOpenRealisticMockupSettings,
  isMockupSettingsOpen,
  onExportSingleCard,
  onOpenMockupStudio,
}) => {
  const [showSingleExportMenu, setShowSingleExportMenu] = useState(false);
  const singleExportMenuRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof RealismSettings>(key: K, value: RealismSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (singleExportMenuRef.current && !singleExportMenuRef.current.contains(e.target as Node)) {
        setShowSingleExportMenu(false);
      }
    };
    if (showSingleExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSingleExportMenu]);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-3 sm:px-4 py-2 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5">
        {/* Left: Branding & University Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center shadow-xs flex-shrink-0">
              {instituteConfig.customLogoUrl ? (
                <img
                  src={instituteConfig.customLogoUrl}
                  alt="Institute Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <TribhuvanLogo size={28} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate max-w-[180px] sm:max-w-[240px]">
                  {instituteConfig.name || 'Tribhuvan University ID Studio'}
                </h1>
                <button
                  id="switch-institute-btn"
                  type="button"
                  onClick={onOpenInstituteSwitcher}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs group"
                  title="Switch university/institute from 105+ accredited legal colleges"
                >
                  <Building2 className="w-2.5 h-2.5 text-blue-600" />
                  <span>Switch</span>
                  <ChevronDown className="w-2.5 h-2.5 text-blue-500 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {onOpenLogoManager && (
                  <button
                    id="manage-logos-btn"
                    type="button"
                    onClick={onOpenLogoManager}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs group"
                    title="Manage logos for all 105+ institutions"
                  >
                    <Sliders className="w-2.5 h-2.5 text-purple-600" />
                    <span>Logo Manager</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Photo Actions (Real Human Photo Box & Upload) */}
          <div className="flex items-center gap-1.5 xl:hidden">
            <button
              type="button"
              onClick={onOpenPhotoUpload}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>Photo</span>
            </button>
          </div>
        </div>

        {/* Center: Core Toolbar requested order */}
        {/* Realistic Mockup | Watermark | Handheld | Stamp | Shadow | Age | Customize Details | Export Single Card | Export All */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* 1. REALISTIC MOCKUP (One-click toggle + expandable settings button) */}
          <div className="inline-flex items-center rounded-lg border shadow-2xs transition-all overflow-hidden">
            <button
              id="realistic-mockup-btn"
              type="button"
              onClick={onToggleRealisticMockup}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                mockupConfig.enabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800'
              }`}
              title={
                mockupConfig.enabled
                  ? 'Realistic Mockup is ON: Click to disable and restore original appearance'
                  : 'Click once to enable Realistic Physical-Card Photography Mockup'
              }
            >
              <span className="text-sm leading-none">📸</span>
              <span>Realistic Mockup</span>
              {mockupConfig.enabled ? (
                <span className="bg-emerald-400 text-emerald-950 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">
                  ON
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal">
                  OFF
                </span>
              )}
            </button>

            {/* Expand Settings Panel Button */}
            <button
              type="button"
              onClick={onOpenRealisticMockupSettings}
              className={`px-1.5 py-1.5 border-l transition-colors cursor-pointer ${
                mockupConfig.enabled
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-500/50'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title="Expand Realistic Mockup Settings (Surface, Lighting, Material, Wear, Reflection, Shadow, Perspective)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. WATERMARK */}
          <button
            id="watermark-toggle-btn"
            type="button"
            onClick={() => update('watermarkHighlight', !settings.watermarkHighlight)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              settings.watermarkHighlight
                ? 'bg-cyan-50 text-cyan-950 border-cyan-300 shadow-2xs font-bold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Guilloche Security Watermark Prismatic Highlight"
          >
            <Layers className={`w-3.5 h-3.5 ${settings.watermarkHighlight ? 'text-cyan-600' : 'text-slate-400'}`} />
            <span>Watermark</span>
          </button>

          {/* 3. HANDHELD */}
          <button
            id="handheld-toggle-btn"
            type="button"
            onClick={() =>
              update(
                'cameraAngle',
                settings.cameraAngle === 'handheld_slight' ? 'flat_top' : 'handheld_slight'
              )
            }
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              settings.cameraAngle === 'handheld_slight'
                ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle natural handheld casual camera tilt"
          >
            <Compass className="w-3.5 h-3.5 text-blue-700" />
            <span>Handheld</span>
          </button>

          {/* SUNLIT WOODEN TABLE & WINDOW SUNLIGHT */}
          <button
            id="sunlight-wood-toggle-btn"
            type="button"
            onClick={() => {
              const isCurrentlySunlightWood =
                settings.backgroundType === 'sunlight_wood' && settings.windowSunlightEffect;
              if (isCurrentlySunlightWood) {
                onUpdateSettings({
                  ...settings,
                  backgroundType: 'wooden_desk',
                  windowSunlightEffect: false,
                });
              } else {
                onUpdateSettings({
                  ...settings,
                  backgroundType: 'sunlight_wood',
                  windowSunlightEffect: true,
                  windowShadowBars: true,
                  overheadLighting: 'natural_window',
                });
              }
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              settings.backgroundType === 'sunlight_wood' || settings.windowSunlightEffect
                ? 'bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
            }`}
            title="Toggle Realistic Wooden Table with Window Sunlight streaming in"
          >
            <Sun className={`w-3.5 h-3.5 ${settings.backgroundType === 'sunlight_wood' || settings.windowSunlightEffect ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span>Sunlit Wood Table</span>
          </button>

          {/* 4. STAMP */}
          <button
            id="stamp-toggle-btn"
            type="button"
            onClick={() => update('showOfficialStamp', !settings.showOfficialStamp)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              settings.showOfficialStamp
                ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs font-bold'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle university official red ink stamp"
          >
            <Stamp className="w-3.5 h-3.5" />
            <span>Stamp</span>
          </button>

          {/* 5. SHADOW (Dropdown) */}
          <div className="inline-flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 gap-1.5 text-xs font-semibold shadow-2xs">
            <Droplet className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
            <span className="text-slate-600 hidden md:inline">Shadow:</span>
            <select
              value={settings.outerShadowIntensity ?? 65}
              onChange={(e) => update('outerShadowIntensity', parseInt(e.target.value))}
              className="bg-transparent text-slate-800 border-none rounded px-1 py-0.5 text-xs font-bold cursor-pointer focus:outline-hidden"
              title="Adjust outer shadow filter intensity"
            >
              <option value="0">0% (Flat)</option>
              <option value="25">25% (Low)</option>
              <option value="45">45% (Medium)</option>
              <option value="65">65% (Real Bed)</option>
              <option value="85">85% (High)</option>
              <option value="100">100% (Deep)</option>
            </select>
          </div>

          {/* 6. AGE (Dropdown) */}
          <div className="inline-flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 gap-1.5 text-xs font-semibold shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-slate-600 hidden md:inline">Age:</span>
            <select
              value={settings.cardAgeMonths ?? 0}
              onChange={(e) => update('cardAgeMonths', parseInt(e.target.value))}
              className="bg-transparent text-amber-900 border-none rounded px-1 py-0.5 text-xs font-bold cursor-pointer focus:outline-hidden"
              title="Simulates realistic handling marks, pocket patina & micro-scratches over months"
            >
              <option value="0">0 Mo (Brand New)</option>
              <option value="1">1 Month (Fresh)</option>
              <option value="2">2 Months (Light)</option>
              <option value="3">3 Months (Wallet)</option>
              <option value="4">4 Months (Semester)</option>
              <option value="6">6 Months (Half-Year)</option>
              <option value="12">12 Months (1 Year)</option>
              <option value="24">24 Months (2 Years)</option>
            </select>
          </div>

          {/* 7. CUSTOMIZE DETAILS */}
          <button
            id="edit-details-btn"
            type="button"
            onClick={onOpenEditor}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300 shadow-2xs"
            title="Edit student info, library record, institute logo & signatures"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-700" />
            <span>Customize Details</span>
          </button>

          {/* 8. EXPORT SINGLE CARD (Exactly 1500 × 1000 px on tabletop mockup) */}
          <div className="relative inline-flex rounded-lg shadow-2xs" ref={singleExportMenuRef}>
            <button
              id="export-single-card-btn"
              type="button"
              onClick={() => onExportSingleCard('png')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-all cursor-pointer border-r border-blue-500"
              title="Export only the selected single card as high-quality 1500 × 1000 px tabletop photography mockup"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Export Single Card</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSingleExportMenu(!showSingleExportMenu)}
              className="px-1.5 py-1.5 rounded-r-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              title="Single card export options (PNG, JPG)"
            >
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Quick Dropdown Menu */}
            {showSingleExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-64 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-semibold animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span>1500 × 1000 Mockup Export</span>
                  <span className="text-blue-600 font-mono">High-Res</span>
                </div>

                {/* Single Front */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('png', 'single_front');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50 text-blue-900 flex items-center justify-between cursor-pointer font-bold"
                >
                  <span>Single Card Front</span>
                  <span className="text-[10px] text-blue-600 font-mono">PNG</span>
                </button>

                {/* Single Back */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('png', 'single_back');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-blue-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Single Card Back</span>
                  <span className="text-[10px] text-blue-600 font-mono">PNG</span>
                </button>

                {/* Front & Back Duo */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('png', 'front_and_back');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-indigo-50 text-indigo-900 flex items-center justify-between cursor-pointer font-bold"
                >
                  <span>Front & Back Duo</span>
                  <span className="text-[10px] text-indigo-600 font-mono">Side-by-Side</span>
                </button>

                {/* Double Cards Front */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('png', 'double_front');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Double Cards Front</span>
                  <span className="text-[10px] text-slate-500 font-mono">2 Cards</span>
                </button>

                {/* Double Cards Back */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('png', 'double_back');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>Double Cards Back</span>
                  <span className="text-[10px] text-slate-500 font-mono">2 Cards</span>
                </button>

                {/* JPG option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleExportMenu(false);
                    onExportSingleCard('jpg', 'single_front');
                  }}
                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-600 flex items-center justify-between cursor-pointer border-t border-slate-100"
                >
                  <span>Single Front as JPG</span>
                  <span className="text-[10px] text-slate-400 font-mono">JPG 98%</span>
                </button>

                {/* Open Full Exporter Studio Modal */}
                {onOpenMockupStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowSingleExportMenu(false);
                      onOpenMockupStudio();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 text-amber-900 flex items-center justify-between cursor-pointer border-t border-slate-100 font-bold"
                  >
                    <span>Open 1500×1000 Studio...</span>
                    <span className="text-[10px] text-amber-700 font-medium">Backgrounds & Shadows</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 9. EXPORT ALL */}
          <button
            id="download-photo-btn"
            type="button"
            disabled={isDownloading}
            onClick={onDownloadPhoto}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Export complete workspace / photography"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Rendering...' : 'Export All'}</span>
          </button>
        </div>

        {/* Right: Auxiliary Quick Links (Desktop) */}
        <div className="hidden xl:flex items-center gap-2">
          {onSelectCardToView && (
            <div className="inline-flex items-center bg-slate-100 px-2 py-1 rounded-lg border border-slate-300 gap-1.5 text-xs font-semibold">
              <span className="text-slate-500 text-[11px]">View:</span>
              <select
                value={activeCardType}
                onChange={(e) => onSelectCardToView(e.target.value as any)}
                className="bg-white text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold cursor-pointer"
                title="Select which card to view on stage"
              >
                <option value="student">🎓 Student ID</option>
                <option value="work">💼 Work ID</option>
                <option value="library">📚 Library ID</option>
                <option value="loyalty">👑 Loyalty VIP</option>
                <option value="both">🗂️ Dual View</option>
              </select>
            </div>
          )}

          {onTogglePhotoGenerator && (
            <button
              id="real-human-photo-btn"
              type="button"
              onClick={onTogglePhotoGenerator}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Open Real Human Passport Photo Generator & Selfie Studio"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Photo Box</span>
            </button>
          )}

          <button
            id="upload-photo-toolbar-btn"
            type="button"
            onClick={onOpenPhotoUpload}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
            title="Upload passport photo or take a live selfie"
          >
            <Camera className="w-3 h-3 text-slate-600" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

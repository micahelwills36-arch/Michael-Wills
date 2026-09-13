import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  AlertCircle,
  Link,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';
import { LegalInstitute } from '../data/institutes';
import { PRESET_LOGOS, PresetLogo } from '../data/presetLogos';
import {
  InstitutionLogoConfig,
  LogoMode,
  getInstitutionLogoConfig,
  getEffectiveLogo,
} from '../utils/institutionLogoStorage';

interface InstitutionLogoConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  institute: LegalInstitute;
  allConfigs: Record<string, InstitutionLogoConfig>;
  onSaveConfig: (updatedConfig: InstitutionLogoConfig) => void;
  isCurrentlyActiveOnCanvas?: boolean;
}

export const InstitutionLogoConfigDialog: React.FC<InstitutionLogoConfigDialogProps> = ({
  isOpen,
  onClose,
  institute,
  allConfigs,
  onSaveConfig,
  isCurrentlyActiveOnCanvas = false,
}) => {
  const currentConfig = getInstitutionLogoConfig(allConfigs, institute);
  const effective = getEffectiveLogo(allConfigs, institute);

  // Selected candidate logo (from presets, upload, or url)
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(effective.url);
  const [selectedLogoName, setSelectedLogoName] = useState<string>(effective.name);

  // Mode user wants to apply candidate logo: 'temporary' or 'permanent'
  const [applyMode, setApplyMode] = useState<'temporary' | 'permanent'>(
    effective.mode === 'temporary' ? 'temporary' : 'permanent'
  );

  // Active tab in logo picker: 'presets' | 'upload' | 'url'
  const [pickerTab, setPickerTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Preset selection
  const handleSelectPreset = (preset: PresetLogo) => {
    setSelectedLogoUrl(preset.dataUrl);
    setSelectedLogoName(preset.name);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSelectedLogoUrl(result);
      setSelectedLogoName(`${institute.shortName} Custom Upload (${file.name})`);
    };
    reader.readAsDataURL(file);
  };

  // Handle direct image URL apply
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
      setSelectedLogoUrl(urlInput.trim());
      setSelectedLogoName(`${institute.shortName} Web Logo`);
      setUrlError(null);
    } catch {
      setUrlError('Please enter a valid HTTP or HTTPS image URL.');
    }
  };

  // Save changes
  const handleSave = () => {
    const updated: InstitutionLogoConfig = { ...currentConfig, updatedAt: new Date().toISOString() };

    if (applyMode === 'temporary') {
      updated.temporaryLogoUrl = selectedLogoUrl;
      updated.temporaryLogoName = selectedLogoName;
      updated.isTemporaryActive = true;
    } else {
      updated.permanentLogoUrl = selectedLogoUrl;
      updated.permanentLogoName = selectedLogoName;
      // When saving a permanent logo, user can keep or clear temporary
    }

    onSaveConfig(updated);
    onClose();
  };

  // Toggle temporary state on/off
  const handleToggleTemporary = (activate: boolean) => {
    const updated: InstitutionLogoConfig = {
      ...currentConfig,
      isTemporaryActive: activate,
      updatedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
  };

  // Clear temporary logo entirely
  const handleClearTemporary = () => {
    const updated: InstitutionLogoConfig = {
      ...currentConfig,
      temporaryLogoUrl: null,
      temporaryLogoName: null,
      isTemporaryActive: false,
      updatedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    // update preview
    setSelectedLogoUrl(updated.permanentLogoUrl || updated.defaultLogoUrl);
    setSelectedLogoName(updated.permanentLogoName || updated.defaultLogoName);
  };

  // Restore factory default logo (removes permanent and temporary)
  const handleRestoreDefault = () => {
    const updated: InstitutionLogoConfig = {
      ...currentConfig,
      permanentLogoUrl: null,
      permanentLogoName: null,
      temporaryLogoUrl: null,
      temporaryLogoName: null,
      isTemporaryActive: false,
      updatedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    setSelectedLogoUrl(updated.defaultLogoUrl);
    setSelectedLogoName(updated.defaultLogoName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">
                  Institution Logo Settings
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {institute.category}
                </span>
                {isCurrentlyActiveOnCanvas && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    Active on Card
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5 font-medium">
                {institute.name} ({institute.shortName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Current Active Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-xl bg-white border-2 border-slate-300 p-2 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                {effective.url ? (
                  <img
                    src={effective.url}
                    alt={effective.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-lg">
                    {institute.shortName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">Current Active Logo:</span>
                  {effective.mode === 'temporary' ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3 h-3" /> Temporary Active
                    </span>
                  ) : effective.mode === 'permanent' ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                      <ShieldCheck className="w-3 h-3" /> Permanent Custom
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Default Official
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-700 truncate max-w-sm">
                  {effective.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {effective.mode === 'temporary'
                    ? 'Using temporary override without altering default configuration.'
                    : effective.mode === 'permanent'
                    ? 'Persistently replaces the standard default logo.'
                    : 'Using authentic university/college seal specifications.'}
                </div>
              </div>
            </div>

            {/* Quick Status Actions */}
            <div className="flex flex-wrap sm:flex-col items-end gap-1.5 w-full sm:w-auto">
              {currentConfig.temporaryLogoUrl && (
                <button
                  type="button"
                  onClick={() => handleToggleTemporary(!currentConfig.isTemporaryActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    currentConfig.isTemporaryActive
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {currentConfig.isTemporaryActive ? 'Pause Temporary' : 'Resume Temporary'}
                </button>
              )}

              {(currentConfig.permanentLogoUrl || currentConfig.temporaryLogoUrl) && (
                <button
                  type="button"
                  onClick={handleRestoreDefault}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  title="Restore original factory logo"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restore Default
                </button>
              )}
            </div>
          </div>

          {/* Mini Live Preview Banner */}
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Eye className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-blue-900 block">
                  Card Header Preview (Live):
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded bg-white p-0.5 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {selectedLogoUrl ? (
                      <img
                        src={selectedLogoUrl}
                        alt="Selected Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {institute.name}
                    </span>
                    <span className="text-[10px] text-red-700 font-bold block truncate">
                      {institute.nativeName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100 px-2 py-1 rounded-md">
                Selected: {selectedLogoName.slice(0, 24)}...
              </span>
            </div>
          </div>

          {/* Section: Choose Logo Source (Presets, Upload, URL) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                1. Select Logo Source
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPickerTab('presets')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    pickerTab === 'presets'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Authentic Presets
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab('upload')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    pickerTab === 'upload'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPickerTab('url')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                    pickerTab === 'url'
                      ? 'bg-white text-indigo-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* TAB 1: PRESETS */}
            {pickerTab === 'presets' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                {PRESET_LOGOS.map((preset) => {
                  const isSelected = selectedLogoUrl === preset.dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center group ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg p-1 bg-white border border-slate-200 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 line-clamp-1 leading-tight">
                        {preset.name}
                      </span>
                      <span className="text-[9.5px] text-slate-500 mt-0.5">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-extrabold text-indigo-700 mt-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {pickerTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 bg-slate-50/50 text-center transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  Upload Logo for {institute.shortName}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Supports transparent PNG, SVG vector, JPG, or WebP (max 5MB).
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose File from Computer
                </button>
              </div>
            )}

            {/* TAB 3: IMAGE URL */}
            {pickerTab === 'url' && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Image URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(null);
                      }}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Load
                    </button>
                  </div>
                  {urlError && <p className="text-[11px] text-red-600 mt-1">{urlError}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Section: Mode Selection (Temporary vs Permanent) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
              2. Choose Application Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Temporary Logo */}
              <div
                onClick={() => setApplyMode('temporary')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  applyMode === 'temporary'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    applyMode === 'temporary'
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {applyMode === 'temporary' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-950">
                      Set as Temporary Logo
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900">
                      Non-destructive
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 mt-1 leading-snug">
                    Use this logo only when needed (e.g. sample prints or custom cards) without replacing
                    the institution's default or permanent logo. Easily turn off or pause at any time.
                  </p>
                </div>
              </div>

              {/* Option B: Permanent Logo */}
              <div
                onClick={() => setApplyMode('permanent')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  applyMode === 'permanent'
                    ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-400/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    applyMode === 'permanent'
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {applyMode === 'permanent' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-purple-950">
                      Set as Permanent Logo
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-900">
                      Persistent
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-900/80 mt-1 leading-snug">
                    Replace {institute.shortName}'s standard default logo permanently across sessions and reloads
                    until manually changed or restored again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-black text-white shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                applyMode === 'temporary'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-purple-700 hover:bg-purple-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {applyMode === 'temporary'
                ? `Apply as Temporary for ${institute.shortName}`
                : `Save as Permanent for ${institute.shortName}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

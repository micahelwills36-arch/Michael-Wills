import React, { useRef } from 'react';
import {
  X,
  Layers,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { WatermarkConfig, InstituteConfig } from '../types';
import { DEFAULT_WATERMARK_CONFIG } from '../constants';

interface WatermarkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WatermarkConfig;
  onUpdateConfig: (config: WatermarkConfig) => void;
  instituteConfig: InstituteConfig;
}

export const WatermarkSettingsModal: React.FC<WatermarkSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  instituteConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const update = <K extends keyof WatermarkConfig>(key: K, value: WatermarkConfig[K]) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          update('customLogoUrl', event.target.result);
          update('autoCardLogo', false); // Custom logo overrides auto
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    onUpdateConfig({ ...DEFAULT_WATERMARK_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Layers className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                <span>Security Watermark Studio</span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                    config.enabled
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {config.enabled ? 'Active' : 'Disabled'}
                </span>
              </h3>
              <p className="text-[11px] text-cyan-200">
                Institutional security watermark, guilloche lathe & logo imprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset watermark settings"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4.5 max-h-[75vh] overflow-y-auto">
          {/* Master Enable */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Watermark Visibility</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Display subtle holographic security watermark in card background
              </p>
            </div>
            <button
              type="button"
              onClick={() => update('enabled', !config.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                config.enabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Automatic Card Logo Watermark feature */}
          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Automatic Card Logo as Watermark</span>
                </div>
                <p className="text-[11px] text-teal-800">
                  Automatically sync each card's official emblem/logo as its security watermark
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  update('autoCardLogo', !config.autoCardLogo);
                  if (!config.autoCardLogo) {
                    update('customLogoUrl', undefined);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                  config.autoCardLogo ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.autoCardLogo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.autoCardLogo && (
              <div className="text-[10px] text-teal-700 bg-white/70 p-2 rounded-lg border border-teal-100 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>
                  Using active card emblem ({instituteConfig.name || 'University Emblem'}). Switching cards automatically keeps that card's logo in the watermark.
                </span>
              </div>
            )}
          </div>

          {/* Change / Upload Custom Watermark Logo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Custom Watermark Logo
              </label>
              {config.customLogoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    update('customLogoUrl', undefined);
                    update('autoCardLogo', true);
                  }}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Custom Logo</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                {config.customLogoUrl ? (
                  <img
                    src={config.customLogoUrl}
                    alt="Custom Watermark"
                    className="w-full h-full object-contain"
                  />
                ) : config.autoCardLogo && instituteConfig.customLogoUrl ? (
                  <img
                    src={instituteConfig.customLogoUrl}
                    alt="Auto Watermark"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  {config.customLogoUrl
                    ? 'Custom Uploaded Logo Active'
                    : config.autoCardLogo
                    ? 'Card Emblem Active (Auto)'
                    : 'Default Institutional Star Emblem'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  PNG, JPG, SVG or transparent vector emblem
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>{config.customLogoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Watermark Opacity & Scale Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opacity */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Watermark Opacity</span>
                <span className="font-mono font-bold text-teal-700">
                  {Math.round(config.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.01"
                value={config.opacity}
                onChange={(e) => update('opacity', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5% (Subtle)</span>
                <span>50% (Prominent)</span>
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Watermark Size</span>
                <span className="font-mono font-bold text-teal-700">
                  {Math.round(config.scale * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={config.scale}
                onChange={(e) => update('scale', parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>60% (Compact)</span>
                <span>150% (Full Card)</span>
              </div>
            </div>
          </div>

          {/* Target Cards to Apply Watermark */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Apply Watermark on Cards
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'showOnStudent', label: 'Student ID Card' },
                { key: 'showOnLibrary', label: 'Library ID Card' },
                { key: 'showOnWork', label: 'Work ID Card' },
                { key: 'showOnLoyalty', label: 'Loyalty VIP Card' },
              ].map(({ key, label }) => {
                const active = config[key as keyof WatermarkConfig] as boolean;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update(key as any, !active)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      active
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <span className="text-xs">{label}</span>
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        active
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Watermark is integrated into all exports & realistic mockups
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  X,
  RotateCcw,
  Sparkles,
  Camera,
  Sun,
  Layers,
  Box,
  Compass,
  Check,
  ShieldAlert,
  Sliders,
  Scan,
  History,
  Eye,
  ShieldCheck,
  Disc,
  Feather,
  Wand2,
} from 'lucide-react';
import { RealisticMockupConfig, WatermarkConfig, CornerShadowConfig, MockupEffect } from '../types';
import { DEFAULT_REALISTIC_MOCKUP_CONFIG, DEFAULT_CORNER_SHADOWS, BACKGROUND_SURFACES } from '../constants';

interface RealisticMockupSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: RealisticMockupConfig;
  onUpdateConfig: (config: RealisticMockupConfig) => void;
  watermarkConfig?: WatermarkConfig;
  onUpdateWatermarkConfig?: (config: WatermarkConfig) => void;
  onOpenWatermarkModal?: () => void;
}

export const RealisticMockupSettingsPanel: React.FC<RealisticMockupSettingsPanelProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  watermarkConfig,
  onUpdateWatermarkConfig,
  onOpenWatermarkModal,
}) => {
  if (!isOpen) return null;

  const update = <K extends keyof RealisticMockupConfig>(key: K, value: RealisticMockupConfig[K]) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  const cornerShadows: CornerShadowConfig = config.cornerShadows || DEFAULT_CORNER_SHADOWS;

  const updateCornerShadow = (corner: keyof CornerShadowConfig, value: number) => {
    const updated = { ...cornerShadows, [corner]: value };
    onUpdateConfig({ ...config, cornerShadows: updated });
  };

  const handleReset = () => {
    onUpdateConfig({
      ...DEFAULT_REALISTIC_MOCKUP_CONFIG,
      enabled: config.enabled,
    });
  };

  const setShadowPreset = (preset: 'flat' | 'natural' | 'curled' | 'floating') => {
    switch (preset) {
      case 'flat':
        onUpdateConfig({
          ...config,
          cornerShadows: {
            topLeft: 2,
            topRight: 2,
            bottomLeft: 4,
            bottomRight: 4,
            intensity: 50,
            blur: 14,
          },
        });
        break;
      case 'curled':
        onUpdateConfig({
          ...config,
          cornerShadows: {
            topLeft: 4,
            topRight: 28,
            bottomLeft: 8,
            bottomRight: 32,
            intensity: 75,
            blur: 32,
          },
        });
        break;
      case 'floating':
        onUpdateConfig({
          ...config,
          cornerShadows: {
            topLeft: 20,
            topRight: 20,
            bottomLeft: 30,
            bottomRight: 30,
            intensity: 85,
            blur: 40,
          },
        });
        break;
      case 'natural':
      default:
        onUpdateConfig({
          ...config,
          cornerShadows: {
            topLeft: 8,
            topRight: 10,
            bottomLeft: 18,
            bottomRight: 24,
            intensity: 65,
            blur: 28,
          },
        });
        break;
    }
  };

  return (
    <div className="relative z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-white border border-slate-300 rounded-2xl shadow-xl overflow-hidden max-w-xl mx-auto my-3 text-slate-800">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-400/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight flex items-center gap-2">
                <span>Realistic Mockup & Effects Studio</span>
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                    config.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {config.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Real background templates, corner-by-corner shadow lift & optical card effects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset mockup settings to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body controls */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Mockup Master Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Realistic Mockup Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Apply real physical PVC plastic texture, shadows, reflection & tabletop scene
              </p>
            </div>
            <button
              type="button"
              onClick={() => update('enabled', !config.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                config.enabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 1. Real Background Templates (Table, Marble, Wood, Bed Sheet, etc.) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Real Background Templates</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(table, marble, wood, bed sheet)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'table', label: 'Office Table', desc: 'Modern desk texture', icon: '🏢' },
                { id: 'marble', label: 'Marble Stone', desc: 'Carrara white polished', icon: '🏛️' },
                { id: 'wood', label: 'Wood Grain', desc: 'Warm oak hardwood', icon: '🪵' },
                { id: 'bedsheet', label: 'Bed Sheet', desc: 'Natural cotton wrinkle', icon: '🛏️' },
                { id: 'neutral', label: 'Studio Neutral', desc: 'Clean soft grey vignette', icon: '📸' },
                { id: 'dark_slate', label: 'Dark Slate', desc: 'Luxury granite dark', icon: '⬛' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update('surface', item.id as any)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    config.surface === item.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {config.surface === item.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Optical Card Effects (Scan, Mid Rush Old, Natural, Used, Reality, Hologram) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Realistic Card Effects</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-bold capitalize">{config.effect || 'Natural'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'natural', label: 'Natural Effect', desc: 'Soft daylight reflection' },
                { id: 'scan', label: 'Scan Effect', desc: 'Flatbed glass & sensor lines' },
                { id: 'old_rush', label: 'Mid Rush Old Effect', desc: 'Vintage warm aged patina' },
                { id: 'used', label: 'Used Card Effect', desc: 'Pocket scuffs & micro-wear' },
                { id: 'reality', label: 'Reality Effect', desc: 'Specular PVC glossy glare' },
                { id: 'hologram', label: 'Hologram Effect', desc: 'Prismatic security rainbow' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update('effect', item.id as MockupEffect)}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    (config.effect || 'natural') === item.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{item.label}</span>
                    {(config.effect || 'natural') === item.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Corner-by-Corner Shadow Control Studio */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. Every-Corner Shadow Control</span>
                </label>
                <p className="text-[10.5px] text-slate-500">
                  Control independent lift at each corner for authentic physical depth
                </p>
              </div>

              {/* Quick Shadow Presets */}
              <div className="flex items-center gap-1">
                {[
                  { id: 'flat', label: 'Flat' },
                  { id: 'natural', label: 'Natural' },
                  { id: 'curled', label: 'Curled' },
                  { id: 'floating', label: 'Floating' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setShadowPreset(p.id as any)}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Corners Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Top-Left */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Top-Left Lift:</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.topLeft}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={cornerShadows.topLeft}
                  onChange={(e) => updateCornerShadow('topLeft', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Top-Right */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Top-Right Lift:</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.topRight}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={cornerShadows.topRight}
                  onChange={(e) => updateCornerShadow('topRight', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Bottom-Left */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Bottom-Left Lift:</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.bottomLeft}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={cornerShadows.bottomLeft}
                  onChange={(e) => updateCornerShadow('bottomLeft', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Bottom-Right */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Bottom-Right Lift:</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.bottomRight}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={45}
                  value={cornerShadows.bottomRight}
                  onChange={(e) => updateCornerShadow('bottomRight', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Overall Intensity & Blur */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Shadow Intensity:</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.intensity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={cornerShadows.intensity}
                  onChange={(e) => updateCornerShadow('intensity', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>Shadow Softness (Blur):</span>
                  <span className="font-mono font-bold text-indigo-600">{cornerShadows.blur}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={60}
                  value={cornerShadows.blur}
                  onChange={(e) => updateCornerShadow('blur', Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* 4. Card Watermark Configuration */}
          {watermarkConfig && onUpdateWatermarkConfig && (
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>4. Card Logo Watermark</span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Automatic institutional logo watermark with custom upload option
                  </p>
                </div>
                {onOpenWatermarkModal && (
                  <button
                    type="button"
                    onClick={onOpenWatermarkModal}
                    className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 rounded-lg border border-blue-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    Customize...
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={watermarkConfig.enabled}
                    onChange={(e) => onUpdateWatermarkConfig({ ...watermarkConfig, enabled: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Watermark Enabled</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={watermarkConfig.autoCardLogo}
                    onChange={(e) =>
                      onUpdateWatermarkConfig({ ...watermarkConfig, autoCardLogo: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Auto Card Logo</span>
                </label>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-blue-900">
                  <span>Watermark Opacity:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {Math.round(watermarkConfig.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  value={watermarkConfig.opacity}
                  onChange={(e) =>
                    onUpdateWatermarkConfig({ ...watermarkConfig, opacity: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          )}

          {/* 5. Physical Material & Lighting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Material */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Card Material</span>
                <span className="text-[10px] text-indigo-600 font-bold uppercase">{config.material}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'pvc', label: 'PVC' },
                  { id: 'laminated', label: 'Laminate' },
                  { id: 'paper', label: 'Paper' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => update('material', item.id as any)}
                    className={`py-1.5 px-1 rounded-lg border text-center cursor-pointer transition-all text-xs font-bold ${
                      config.material === item.id
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Environment Light</span>
                <span className="text-[10px] text-indigo-600 font-bold capitalize">{config.lighting}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'natural', label: 'Natural' },
                  { id: 'soft', label: 'Soft' },
                  { id: 'studio', label: 'Studio' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => update('lighting', item.id as any)}
                    className={`py-1.5 px-1 rounded-lg border text-center cursor-pointer transition-all text-xs font-bold ${
                      config.lighting === item.id
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Non-destructive Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">100% Content Preservation:</span> The Realistic Mockup applies pure physical photographic and material enhancements. All text, logos, barcodes, QR codes, signatures, and artwork remain completely intact.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            One-click toggle: turn on/off at any time
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

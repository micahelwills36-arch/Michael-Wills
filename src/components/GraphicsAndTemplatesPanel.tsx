import React, { useState } from 'react';
import {
  RealismSettings,
  TemplateId,
  CardTemplate,
} from '../types';
import { CARD_TEMPLATES } from '../templates';
import {
  Sliders,
  Sparkles,
  Layers,
  Bed,
  Compass,
  Palette,
  Eye,
  Check,
  RotateCcw,
  Sun,
  Contrast,
  Printer,
  Camera,
  Film,
  FileText,
  Shapes,
  ShieldCheck,
  Scan,
  Zap,
  Box,
  Droplet,
  Aperture,
  Clock,
  History,
} from 'lucide-react';

interface GraphicsAndTemplatesPanelProps {
  settings: RealismSettings;
  onUpdateSettings: (settings: RealismSettings) => void;
  activeTemplateId: TemplateId;
  onSelectTemplate: (template: CardTemplate) => void;
}

export const GraphicsAndTemplatesPanel: React.FC<GraphicsAndTemplatesPanelProps> = ({
  settings,
  onUpdateSettings,
  activeTemplateId,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'realism' | 'templates' | 'resolution' | 'graphics'>('realism');

  const update = <K extends keyof RealismSettings>(key: K, value: RealismSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const resetRealism = () => {
    onUpdateSettings({
      ...settings,
      pvcTexture: 'matte_pvc',
      pvcCardThickness3D: true,
      printGrain: 18,
      cameraPerspectivePreset: 'natural_handheld',
      perspectiveDepth: 6,
      overheadLighting: 'soft_diffuse',
      lightIntensity: 100,
      shadowStyle: 'soft_bed_occlusion',
      surfaceReflection: 35,
      lensVignette: 16,
      lensImperfection: true,
      scannerMode: false,
      antiGlareFinish: true,
      antiGlareStrength: 65,
      colorReproductionProfile: 'natural_dye_sub',
      outerShadowIntensity: 65,
      outerShadowBlur: 28,
      outerShadowSpread: 1,
      cardAgeMonths: 0,
      showCardAgeBadge: false,
    });
  };

  const resetGraphics = () => {
    onUpdateSettings({
      ...settings,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      grain: 8,
      cardCornerRadius: 14,
      laminationGloss: 'realistic',
      shadowDepth: 'soft_bed',
      cameraEffect: 'clean_dslr',
      resolutionPreset: '4k_print',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('realism')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'realism'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Physical Realism (9 Specs)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Campus Templates ({CARD_TEMPLATES.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resolution')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resolution'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Resolution & Camera
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graphics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'graphics'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Filters & Lighting
          </button>
        </div>

        {activeTab === 'realism' && (
          <button
            type="button"
            onClick={resetRealism}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Realism Defaults
          </button>
        )}

        {activeTab === 'graphics' && (
          <button
            type="button"
            onClick={resetGraphics}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="p-4">
        {/* 0. PHYSICAL REALISM TAB (All 9 Requested Specifications) */}
        {activeTab === 'realism' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs">
              <div>
                <span className="font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Professional Photographic Realism Engine
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Simulates physical PVC card texture, thermal print grain, camera perspective, soft overhead illumination, anti-glare lamination, and scanner optics.
                </p>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                CR-80 / 0.76mm ISO-7810
              </span>
            </div>

            {/* Grid of the 9 realism modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              {/* 1. Natural PVC/Card Texture */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Box className="w-3.5 h-3.5 text-blue-600" /> 1. Natural PVC Texture
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pvcCardThickness3D}
                      onChange={(e) => update('pvcCardThickness3D', e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    3D Core Bevel
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'matte_pvc', label: 'Matte PVC' },
                    { id: 'gloss_pvc', label: 'Gloss Laminate' },
                    { id: 'embossed_grain', label: 'Embossed Grain' },
                    { id: 'silk_matte', label: 'Silk Matte' },
                  ].map((tex) => (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => update('pvcTexture', tex.id as any)}
                      className={`py-1.5 px-2 rounded-lg font-semibold text-center cursor-pointer transition-colors ${
                        settings.pvcTexture === tex.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Realistic Print Grain */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Printer className="w-3.5 h-3.5 text-rose-600" /> 2. Realistic Print Grain
                  </span>
                  <span className="text-[11px] font-bold text-rose-700">{settings.printGrain}%</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Thermal transfer dye-sublimation micro-dots (DTC card printer).
                </p>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={settings.printGrain}
                  onChange={(e) => update('printGrain', parseInt(e.target.value))}
                  className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* 3. Accurate Camera Perspective */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" /> 3. Camera Perspective
                  </span>
                  <span className="text-[11px] font-bold text-indigo-700">{settings.perspectiveDepth}° tilt</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'natural_handheld', label: 'Handheld 6°' },
                    { id: 'overhead_flat', label: 'Overhead 90°' },
                    { id: 'dynamic_3d', label: 'Dynamic 3D' },
                    { id: 'flatbed_scanner', label: 'Scanner 0°' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        update('cameraPerspectivePreset', p.id as any);
                        if (p.id === 'overhead_flat' || p.id === 'flatbed_scanner') {
                          update('cameraAngle', 'flat_top');
                          update('perspectiveDepth', 0);
                        } else {
                          update('cameraAngle', 'handheld_slight');
                          update('perspectiveDepth', p.id === 'dynamic_3d' ? 14 : 6);
                        }
                      }}
                      className={`py-1.5 px-1.5 text-[11px] rounded-lg font-semibold text-center cursor-pointer transition-colors ${
                        settings.cameraPerspectivePreset === p.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.perspectiveDepth}
                  onChange={(e) => update('perspectiveDepth', parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* 4. Soft Overhead Lighting */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> 4. Soft Overhead Lighting
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">{settings.lightIntensity}%</span>
                </div>
                <select
                  value={settings.overheadLighting}
                  onChange={(e) => update('overheadLighting', e.target.value as any)}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="soft_diffuse">Soft Diffuse Ambient Light</option>
                  <option value="natural_window">☀️ Natural Window Sunlight Stream</option>
                  <option value="warm_desk_lamp">Warm Desk Lamp Glow</option>
                  <option value="studio_softbox">Studio Softbox Illumination</option>
                  <option value="natural_window">Natural Window Daylight</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">Intensity:</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={settings.lightIntensity}
                    onChange={(e) => update('lightIntensity', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 5. Natural Shadows and Outer Layer Shadow Filter */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Droplet className="w-3.5 h-3.5 text-sky-600" /> 5. Outer Shadow Filter & Intensity
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">{settings.outerShadowIntensity ?? 65}% shadow</span>
                </div>

                {/* Shadow Intensity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] text-slate-600">
                    <span className="font-semibold">Outer Shadow Intensity</span>
                    <span className="font-bold text-blue-900">{settings.outerShadowIntensity ?? 65}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.outerShadowIntensity ?? 65}
                    onChange={(e) => update('outerShadowIntensity', parseInt(e.target.value))}
                    className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Shadow Blur Radius Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] text-slate-600">
                    <span className="font-semibold">Shadow Blur Softness</span>
                    <span className="font-bold text-slate-700">{settings.outerShadowBlur ?? 28}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="60"
                    value={settings.outerShadowBlur ?? 28}
                    onChange={(e) => update('outerShadowBlur', parseInt(e.target.value))}
                    className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  {[
                    { label: '0% Flat', val: 0, blur: 4 },
                    { label: '35% Soft', val: 35, blur: 18 },
                    { label: '65% Bed', val: 65, blur: 28 },
                    { label: '95% Deep', val: 95, blur: 42 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        update('outerShadowIntensity', preset.val);
                        update('outerShadowBlur', preset.blur);
                      }}
                      className={`py-1 rounded font-semibold text-center cursor-pointer transition-colors ${
                        settings.outerShadowIntensity === preset.val
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Slight Lens Imperfections */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Aperture className="w-3.5 h-3.5 text-violet-600" /> 6. Lens Imperfections
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.lensImperfection}
                      onChange={(e) => update('lensImperfection', e.target.checked)}
                      className="rounded text-violet-600"
                    />
                    Edge Softness
                  </label>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Peripheral Vignette</span>
                  <span className="font-bold">{settings.lensVignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={settings.lensVignette}
                  onChange={(e) => update('lensVignette', parseInt(e.target.value))}
                  className="w-full accent-violet-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* 7. High-Resolution Document Scanning */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Scan className="w-3.5 h-3.5 text-emerald-600" /> 7. Document Scanner Mode
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    settings.scannerMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {settings.scannerMode ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Simulates flatbed optical scanner glass platen with 600 DPI archival tone curve.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const next = !settings.scannerMode;
                    onUpdateSettings({
                      ...settings,
                      scannerMode: next,
                      backgroundType: next ? 'scanner_glass' : 'bedsheet',
                      cameraPerspectivePreset: next ? 'flatbed_scanner' : 'natural_handheld',
                      cameraAngle: next ? 'flat_top' : 'handheld_slight',
                    });
                  }}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    settings.scannerMode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  {settings.scannerMode ? 'Exit Scanner Mode' : 'Turn On Flatbed Scanner'}
                </button>
              </div>

              {/* 8. Anti-Glare Finish */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> 8. Anti-Glare Finish
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-slate-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.antiGlareFinish}
                      onChange={(e) => update('antiGlareFinish', e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    Enabled
                  </label>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Matte Diffusion Strength</span>
                  <span className="font-bold">{settings.antiGlareStrength}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  disabled={!settings.antiGlareFinish}
                  value={settings.antiGlareStrength}
                  onChange={(e) => update('antiGlareStrength', parseInt(e.target.value))}
                  className="w-full accent-teal-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* 9. Realistic Color Reproduction */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Palette className="w-3.5 h-3.5 text-purple-600" /> 9. Color Reproduction
                  </span>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'natural_dye_sub', label: 'Thermal Dye-Sublimation (YMCKO)', desc: 'Warm plastic card toner' },
                    { id: 'cmyk_calibrated', label: 'Calibrated CMYK Offset', desc: 'TU Navy & Crimson ink balance' },
                    { id: 'high_fidelity', label: 'High-Fidelity sRGB', desc: 'Crisp vibrant digital reproduction' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => update('colorReproductionProfile', c.id as any)}
                      className={`w-full py-1 px-2 rounded text-left cursor-pointer transition-colors ${
                        settings.colorReproductionProfile === c.id
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="text-[11px] leading-tight">{c.label}</div>
                      <div className={`text-[9px] ${settings.colorReproductionProfile === c.id ? 'text-purple-100' : 'text-slate-400'}`}>
                        {c.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 10. Card Usage Duration & Natural Aging Effect */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-blue-900">
                    <Clock className="w-4 h-4 text-amber-600" /> 10. Card Usage Duration & Realistic Wear (Months in Use)
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[10.5px] text-slate-600 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showCardAgeBadge}
                        onChange={(e) => update('showCardAgeBadge', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      Show Wear Badge on Card
                    </label>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {settings.cardAgeMonths === 0
                        ? '0 Months (Brand New / Mint)'
                        : `${settings.cardAgeMonths} Months in Circulation`}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Simulates authentic physical wear from daily student pocket transit, wallet friction, hairline laminate scratches, and edge softening over months of circulation.
                </p>

                {/* Quick Selection Buttons for Months */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 text-xs">
                  {[
                    { months: 0, label: '0m', desc: 'Brand New' },
                    { months: 1, label: '1 Month', desc: 'Fresh Pocket' },
                    { months: 2, label: '2 Months', desc: 'Light Scuffs' },
                    { months: 3, label: '3 Months', desc: 'Wallet Wear' },
                    { months: 4, label: '4 Months', desc: 'Semester Used' },
                    { months: 6, label: '6 Months', desc: 'Half-Year' },
                    { months: 12, label: '12 Months', desc: '1 Year Senior' },
                    { months: 24, label: '24 Months', desc: '2 Years Veteran' },
                  ].map((item) => (
                    <button
                      key={item.months}
                      type="button"
                      onClick={() => update('cardAgeMonths', item.months)}
                      className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                        settings.cardAgeMonths === item.months
                          ? 'bg-amber-600 text-white font-bold shadow-xs ring-2 ring-amber-400/40'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="text-[11px] font-bold leading-tight">{item.label}</div>
                      <div className={`text-[9px] mt-0.5 ${settings.cardAgeMonths === item.months ? 'text-amber-100' : 'text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Slider for Fine-Grained Month Adjustment */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Adjust Usage Duration:</span>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={settings.cardAgeMonths ?? 0}
                      onChange={(e) => update('cardAgeMonths', parseInt(e.target.value))}
                      className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-amber-800 whitespace-nowrap w-12 text-right">
                      {settings.cardAgeMonths ?? 0} Mo
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 italic">
                    {settings.cardAgeMonths === 0 && '✨ Crisp, immaculate PVC lamination with zero abrasions.'}
                    {settings.cardAgeMonths === 1 && '🌱 Initial subtle hairline friction from pocket entry.'}
                    {settings.cardAgeMonths === 2 && '🔍 Delicate corner softening and faint micro-scuffs.'}
                    {settings.cardAgeMonths === 3 && '💳 Realistic wallet card-slot abrasions and pocket patina.'}
                    {settings.cardAgeMonths === 4 && '📚 Mid-semester campus use with corner stress & thumb warmth.'}
                    {settings.cardAgeMonths === 6 && '🎓 Half-year library turnstile wear and subtle surface satin.'}
                    {settings.cardAgeMonths >= 12 && '🏆 Seasoned student ID with rich authentic plastic aging & patina.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider">
                Select University Campus & Faculty Template
              </span>
              <span className="text-slate-500">
                Instantly configures colors, institute branding, and programs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CARD_TEMPLATES.map((tmpl) => {
                const isSelected = activeTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onSelectTemplate(tmpl)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: tmpl.studentCardTheme.badgeBg,
                            color: tmpl.studentCardTheme.badgeText,
                          }}
                        >
                          {tmpl.badge}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-700">
                            <Check className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                      <span className="truncate">{tmpl.campusSubTitle}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: tmpl.studentCardTheme.primaryColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                          style={{ backgroundColor: tmpl.libraryCardTheme.secondaryColor }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. RESOLUTION & CAMERA EFFECTS TAB */}
        {activeTab === 'resolution' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Export Resolution Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-blue-700" /> Export Print & Render Resolution
                </span>
                <span className="text-[11px] text-slate-500">
                  Controls output sharpness when clicking 'Download Photo'
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 4K Print 300 DPI */}
                <button
                  type="button"
                  onClick={() => update('resolutionPreset', '4k_print')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.resolutionPreset === '4k_print'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-blue-900">
                      Ultra HD 4K Print
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                      300 DPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Highest pixel density. Razor-sharp vector text and official seals for printing.
                  </p>
                </button>

                {/* 1080p High Def Web */}
                <button
                  type="button"
                  onClick={() => update('resolutionPreset', 'hd_web')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.resolutionPreset === 'hd_web'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900">
                      High Definition Web
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      1080p (2x)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Optimal file size for digital messaging, web sharing, and email submission.
                  </p>
                </button>

                {/* Standard */}
                <button
                  type="button"
                  onClick={() => update('resolutionPreset', 'standard')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.resolutionPreset === 'standard'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900">
                      Standard Preview
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                      720p (1x)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Fast instant snapshot with minimal memory footprint.
                  </p>
                </button>
              </div>
            </div>

            {/* Camera Style & Lens Resolution Filter */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Camera className="w-4 h-4 text-purple-700" /> Camera Sensor & Atmosphere Effect
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Clean DSLR */}
                <button
                  type="button"
                  onClick={() => update('cameraEffect', 'clean_dslr')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    settings.cameraEffect === 'clean_dslr'
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <Camera className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600" />
                  <div>
                    <div className="text-xs font-bold">DSLR Studio</div>
                    <div className="text-[10px] text-slate-500">Pristine optical clarity</div>
                  </div>
                </button>

                {/* 2. Smartphone Camera */}
                <button
                  type="button"
                  onClick={() => update('cameraEffect', 'smartphone')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    settings.cameraEffect === 'smartphone'
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <div>
                    <div className="text-xs font-bold">Smartphone</div>
                    <div className="text-[10px] text-slate-500">Natural casual lens shot</div>
                  </div>
                </button>

                {/* 3. Vintage Film */}
                <button
                  type="button"
                  onClick={() => update('cameraEffect', 'vintage_film')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    settings.cameraEffect === 'vintage_film'
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <Film className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                  <div>
                    <div className="text-xs font-bold">Film Grain</div>
                    <div className="text-[10px] text-slate-500">35mm analog bedsheet photo</div>
                  </div>
                </button>

                {/* 4. Scanned Document */}
                <button
                  type="button"
                  onClick={() => update('cameraEffect', 'scanned_doc')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-2 ${
                    settings.cameraEffect === 'scanned_doc'
                      ? 'border-purple-600 bg-purple-50 text-purple-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-600" />
                  <div>
                    <div className="text-xs font-bold">Document Scan</div>
                    <div className="text-[10px] text-slate-500">Flatbed scanner toner</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. GRAPHICS & LIGHTING TAB */}
        {activeTab === 'graphics' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Sliders Grid: Brightness, Contrast, Saturation, Film Grain, Corner Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Overall Brightness
                  </span>
                  <span className="font-bold">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="125"
                  value={settings.brightness}
                  onChange={(e) => update('brightness', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Contrast className="w-3.5 h-3.5 text-blue-600" /> Card Contrast
                  </span>
                  <span className="font-bold">{settings.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="125"
                  value={settings.contrast}
                  onChange={(e) => update('contrast', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-emerald-600" /> Color Saturation
                  </span>
                  <span className="font-bold">{settings.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="130"
                  value={settings.saturation}
                  onChange={(e) => update('saturation', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Film / Surface Grain */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-rose-500" /> Sensor / Paper Grain
                  </span>
                  <span className="font-bold">{settings.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.grain}
                  onChange={(e) => update('grain', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Card Corner Radius */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Shapes className="w-3.5 h-3.5 text-indigo-500" /> PVC Corner Radius
                  </span>
                  <span className="font-bold">{settings.cardCornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="22"
                  value={settings.cardCornerRadius}
                  onChange={(e) => update('cardCornerRadius', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Lighting Angle */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-sky-500" /> Light Source Angle
                  </span>
                  <span className="font-bold">{settings.lightingAngle}°</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="180"
                  value={settings.lightingAngle}
                  onChange={(e) => update('lightingAngle', parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Graphic Style Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
              {/* Lamination Gloss */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lamination Film Finish
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => update('laminationGloss', 'none')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.laminationGloss === 'none'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Matte
                  </button>
                  <button
                    type="button"
                    onClick={() => update('laminationGloss', 'realistic')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.laminationGloss === 'realistic'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Natural
                  </button>
                  <button
                    type="button"
                    onClick={() => update('laminationGloss', 'high')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.laminationGloss === 'high'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Glossy
                  </button>
                </div>
              </div>

              {/* Shadow Contact */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Surface Shadow
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => update('shadowDepth', 'flat')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.shadowDepth === 'flat'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => update('shadowDepth', 'soft_bed')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.shadowDepth === 'soft_bed'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Bed Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => update('shadowDepth', 'deep')}
                    className={`py-1 text-center rounded-md font-semibold cursor-pointer ${
                      settings.shadowDepth === 'deep'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Deep
                  </button>
                </div>
              </div>

              {/* Background Fabric Surface */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Background Surface
                </label>
                <select
                  value={settings.backgroundType}
                  onChange={(e) => update('backgroundType', e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
                >
                  <option value="sunlight_wood">☀️ Sunlit Wooden Table (Natural Window Sunlight)</option>
                  <option value="varnished_oak">🪵 Varnished Oak Wooden Table</option>
                  <option value="wooden_desk">Natural Teak Wooden Desk</option>
                  <option value="bedsheet">Wrinkled Cotton Bedsheet</option>
                  <option value="neutral_grey">Neutral Light Grey Studio</option>
                  <option value="linen_weave">Warm Linen Fabric</option>
                  <option value="dark_slate">Dark Slate Tabletop</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

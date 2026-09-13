import React from 'react';
import { CardDesignConfig, CardSide } from '../types';
import {
  X,
  Type,
  Maximize2,
  Palette,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  Crop,
  Check,
  RotateCcw,
} from 'lucide-react';

interface DesignCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  designConfig: CardDesignConfig;
  onUpdateDesignConfig: (config: CardDesignConfig) => void;
  cardSide: CardSide;
  onToggleCardSide: (side: CardSide) => void;
}

export const DesignCustomizerModal: React.FC<DesignCustomizerModalProps> = ({
  isOpen,
  onClose,
  designConfig,
  onUpdateDesignConfig,
  cardSide,
  onToggleCardSide,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateDesignConfig({
      fontFamily: 'sans',
      fontSizeScale: 'standard',
      fontWeight: 'medium',
      letterSpacing: 'normal',
      backgroundStyle: 'classic_white',
      borderStyle: 'none',
      borderColor: '#2563eb',
      borderWidth: 1,
      cornerRadius: 12,
      showPrintGuides: false,
      showDimensions: false,
      photoSharpness: 10,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Card Design &amp; Layout Studio
              </h2>
              <p className="text-[11px] text-blue-200">
                Typography, borders, PVC standards, print bleed &amp; sharpness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Card Side Toggle (Front vs Back) */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-blue-950 text-xs block">
                Active Card Surface Editing
              </span>
              <span className="text-[11px] text-blue-800">
                Switch between Front (photo &amp; credentials) and Back (regulations &amp; ledger).
              </span>
            </div>
            <div className="inline-flex p-1 bg-white rounded-lg border border-blue-200 shadow-2xs">
              <button
                type="button"
                onClick={() => onToggleCardSide('front')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  cardSide === 'front'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Face
              </button>
              <button
                type="button"
                onClick={() => onToggleCardSide('back')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  cardSide === 'back'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Face
              </button>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-blue-600" /> Typography &amp; Font Styling
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Font Family */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Font Family Hierarchy
                </label>
                <select
                  value={designConfig.fontFamily}
                  onChange={(e) =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      fontFamily: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="serif">Playfair / Georgia (Academic Formal)</option>
                  <option value="display">Cabinet Grotesk (High-Density Display)</option>
                  <option value="mono">JetBrains Mono (Technical / Security)</option>
                </select>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Letter Spacing (Tracking)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['tight', 'normal', 'wide'] as const).map((space) => (
                    <button
                      key={space}
                      type="button"
                      onClick={() =>
                        onUpdateDesignConfig({ ...designConfig, letterSpacing: space })
                      }
                      className={`py-1.5 px-2 rounded-lg border text-center font-bold capitalize transition-all cursor-pointer ${
                        designConfig.letterSpacing === space
                          ? 'border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Background & Borders */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-600" /> Background &amp; Security Texture
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'classic_white', label: 'Classic PVC' },
                { id: 'ivory_clean', label: 'Warm Ivory Paper' },
                { id: 'security_watermark', label: 'Guilloche Wave' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      backgroundStyle: bg.id as any,
                    })
                  }
                  className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    designConfig.backgroundStyle === bg.id
                      ? 'border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {/* Border Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Card Border Frame
                </label>
                <select
                  value={designConfig.borderStyle}
                  onChange={(e) =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      borderStyle: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="none">Standard Flush PVC Edge</option>
                  <option value="solid">Solid Accent Border</option>
                  <option value="double">Double Security Border</option>
                  <option value="gold_accent">Metallic Gold Foil Accent</option>
                </select>
              </div>

              {/* Corner Radius Slider */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Card Corner Radius</span>
                  <span className="font-mono text-slate-500">{designConfig.cornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={designConfig.cornerRadius}
                  onChange={(e) =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      cornerRadius: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Sharp (0px)</span>
                  <span>CR-80 ISO (12-14px)</span>
                  <span>Round (20px)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Processing & Sharpness */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Photo Optical Sharpness
            </h3>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Micro-Contrast / Optical Sharpness</span>
                <span className="font-mono text-slate-500">{designConfig.photoSharpness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={designConfig.photoSharpness}
                onChange={(e) =>
                  onUpdateDesignConfig({
                    ...designConfig,
                    photoSharpness: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Enhances facial portrait clarity and prevents micro-blur on physical PVC card printers.
              </p>
            </div>
          </div>

          {/* Print Standards, Margins & Bleed */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Crop className="w-4 h-4 text-blue-600" /> Print Guides &amp; Dimensions
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Show 3mm Print Bleed &amp; Trim Guides
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Overlays red cut line and blue safe-zone boundaries for industrial cutters.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={designConfig.showPrintGuides}
                  onChange={(e) =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      showPrintGuides: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Show ISO 7810 ID-1 Physical Dimensions Badge
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Displays exact 85.60 mm × 53.98 mm × 0.76 mm standard specification.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={designConfig.showDimensions}
                  onChange={(e) =>
                    onUpdateDesignConfig({
                      ...designConfig,
                      showDimensions: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Apply Design Settings
          </button>
        </div>
      </div>
    </div>
  );
};

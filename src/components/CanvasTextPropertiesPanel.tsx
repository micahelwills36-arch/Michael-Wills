import React from 'react';
import { CanvasElement, CanvasElementStyle } from '../types/canvas';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  X,
  Move,
  Maximize2,
  Sliders,
  Palette,
} from 'lucide-react';

interface CanvasTextPropertiesPanelProps {
  element: CanvasElement;
  onUpdateElement: (
    elementChanges: Partial<CanvasElement>,
    styleChanges?: Partial<CanvasElementStyle>
  ) => void;
  onAddCustomTextField: () => void;
  onClose?: () => void;
}

const FONT_OPTIONS = [
  { label: 'Plus Jakarta Sans (Standard)', value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { label: 'Cinzel (Formal University)', value: "'Cinzel', serif" },
  { label: 'Space Mono (Monospace ID)', value: "'Space Mono', monospace" },
  { label: 'Playfair Display (Serif Luxury)', value: "'Playfair Display', serif" },
  { label: 'Great Vibes (Script Signature)', value: "'Great Vibes', cursive" },
  { label: 'Arial (Clean Sans)', value: 'Arial, sans-serif' },
  { label: 'Times New Roman (Classic)', value: "'Times New Roman', serif" },
  { label: 'Courier New (Typewriter)', value: "'Courier New', monospace" },
];

const FONT_WEIGHTS = [
  { label: 'Regular', value: 'normal' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: 'bold' },
  { label: 'Black', value: '800' },
];

const LETTER_SPACING_OPTIONS = [
  { label: 'Tight (-0.05em)', value: '-0.05em' },
  { label: 'Normal (0)', value: 'normal' },
  { label: 'Wide (0.05em)', value: '0.05em' },
  { label: 'Wider (0.1em)', value: '0.1em' },
  { label: 'Widest (0.2em)', value: '0.2em' },
];

const LINE_HEIGHT_OPTIONS = [
  { label: '1.0 (Compact)', value: 1.0 },
  { label: '1.2 (Standard)', value: 1.2 },
  { label: '1.4 (Relaxed)', value: 1.4 },
  { label: '1.6 (Spacious)', value: 1.6 },
  { label: '1.8 (Double)', value: 1.8 },
];

const COLOR_SWATCHES = [
  '#0f172a', // Slate 900
  '#1e3a8a', // TU Blue
  '#b91c1c', // IOE Maroon
  '#047857', // IoST Emerald
  '#4338ca', // Indigo
  '#b45309', // Amber / Gold
  '#ffffff', // White
  '#475569', // Slate 600
];

export const CanvasTextPropertiesPanel: React.FC<CanvasTextPropertiesPanelProps> = ({
  element,
  onUpdateElement,
  onAddCustomTextField,
  onClose,
}) => {
  const { style } = element;
  const isTextLike = element.type === 'text' || element.type === 'badge' || element.type === 'signature';

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden w-full max-w-[360px] text-xs select-none">
      {/* Panel Header */}
      <div className="bg-slate-900 text-white px-3 py-2.5 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2 font-bold">
          <Type className="w-4 h-4 text-blue-400" />
          <span className="truncate max-w-[180px]">Text Inspector: {element.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddCustomTextField}
            className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            title="Add a new custom text field"
          >
            <Plus className="w-3 h-3" />
            <span>Add Text</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-3 max-h-[460px] overflow-y-auto">
        {/* 1. Text Content Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Text Content
          </label>
          <textarea
            value={element.content}
            onChange={(e) => onUpdateElement({ content: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-xs resize-none outline-none font-medium"
            placeholder="Type text content here..."
          />
        </div>

        {isTextLike && (
          <>
            {/* 2. Font Family */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Font Family
              </label>
              <select
                value={style.fontFamily || "'Plus Jakarta Sans', system-ui, sans-serif"}
                onChange={(e) => onUpdateElement({}, { fontFamily: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 text-slate-900 text-xs outline-none bg-white cursor-pointer"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Font Size</label>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">
                    {style.fontSize || 13}px
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={style.fontSize || 13}
                    onChange={(e) =>
                      onUpdateElement({}, { fontSize: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={style.fontSize || 13}
                    onChange={(e) =>
                      onUpdateElement(
                        {},
                        { fontSize: Math.max(6, parseInt(e.target.value, 10) || 12) }
                      )
                    }
                    className="w-12 px-1 py-1 rounded border border-slate-300 text-center font-mono text-xs"
                  />
                </div>
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Font Weight
                </label>
                <select
                  value={String(style.fontWeight || 'normal')}
                  onChange={(e) => onUpdateElement({}, { fontWeight: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 text-slate-900 text-xs outline-none bg-white cursor-pointer"
                >
                  {FONT_WEIGHTS.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Text Alignment & Text Color */}
            <div className="grid grid-cols-2 gap-2 items-center">
              {/* Alignment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alignment
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onUpdateElement({}, { textAlign: 'left' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                      (style.textAlign || 'left') === 'left'
                        ? 'bg-white shadow-2xs text-blue-600 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateElement({}, { textAlign: 'center' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                      style.textAlign === 'center'
                        ? 'bg-white shadow-2xs text-blue-600 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateElement({}, { textAlign: 'right' })}
                    className={`flex-1 py-1 flex items-center justify-center rounded transition-colors cursor-pointer ${
                      style.textAlign === 'right'
                        ? 'bg-white shadow-2xs text-blue-600 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Color Swatches & Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    {COLOR_SWATCHES.slice(0, 5).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => onUpdateElement({}, { color })}
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={style.color || '#0f172a'}
                    onChange={(e) => onUpdateElement({}, { color: e.target.value })}
                    className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0"
                    title="Custom color picker"
                  />
                </div>
              </div>
            </div>

            {/* 5. Letter Spacing & Line Height */}
            <div className="grid grid-cols-2 gap-2">
              {/* Letter Spacing */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Letter Spacing
                </label>
                <select
                  value={style.letterSpacing || 'normal'}
                  onChange={(e) => onUpdateElement({}, { letterSpacing: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 text-slate-900 text-xs outline-none bg-white cursor-pointer"
                >
                  {LETTER_SPACING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Line Height
                </label>
                <select
                  value={style.lineHeight || 1.2}
                  onChange={(e) =>
                    onUpdateElement({}, { lineHeight: parseFloat(e.target.value) })
                  }
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 text-slate-900 text-xs outline-none bg-white cursor-pointer"
                >
                  {LINE_HEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* 6. Position (X, Y) & Size (Width, Height) */}
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-slate-500" />
            <span>Position &amp; Dimensions (Card Scale: 420 × 265px)</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {/* Position X */}
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">X (px)</label>
              <input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) =>
                  onUpdateElement({ x: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>

            {/* Position Y */}
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Y (px)</label>
              <input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) =>
                  onUpdateElement({ y: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>

            {/* Width */}
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Width</label>
              <input
                type="number"
                min="10"
                value={Math.round(element.width)}
                onChange={(e) =>
                  onUpdateElement({ width: Math.max(10, parseInt(e.target.value, 10) || 10) })
                }
                className="w-full px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Height</label>
              <input
                type="number"
                min="10"
                value={Math.round(element.height)}
                onChange={(e) =>
                  onUpdateElement({ height: Math.max(10, parseInt(e.target.value, 10) || 10) })
                }
                className="w-full px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Add Custom Field Action at bottom */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onAddCustomTextField}
            className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add New Custom Text Field</span>
          </button>
        </div>
      </div>
    </div>
  );
};

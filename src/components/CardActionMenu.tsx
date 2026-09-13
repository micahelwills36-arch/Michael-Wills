import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Download,
  Camera,
  Edit3,
  RotateCw,
  Copy,
  Check,
  Sparkles,
  Layers,
  Sliders,
  Wand2,
} from 'lucide-react';
import { CardSide } from '../types';

interface CardActionMenuProps {
  cardTitle: string;
  cardType: 'student' | 'work' | 'library' | 'loyalty';
  currentSide: CardSide;
  onExportSingle: (format?: 'png' | 'jpg', layout?: 'single_front' | 'single_back' | 'front_and_back') => void;
  onEdit?: () => void;
  onFlipSide?: () => void;
  onOpenStudio?: () => void;
}

export const CardActionMenu: React.FC<CardActionMenuProps> = ({
  cardTitle,
  cardType,
  currentSide,
  onExportSingle,
  onEdit,
  onFlipSide,
  onOpenStudio,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-slate-200 bg-white/60 transition-colors cursor-pointer shadow-2xs"
        title={`More options for ${cardTitle}`}
        aria-label={`Options for ${cardTitle}`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs font-semibold animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>{cardTitle} Actions</span>
            <span className="text-blue-600 font-mono">1500×1000</span>
          </div>

          {/* Export Single Card Front */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportSingle('png', 'single_front');
            }}
            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-blue-950 flex items-center gap-2 cursor-pointer transition-colors font-bold group"
          >
            <Camera className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <div>
              <div className="leading-tight">Export Single Front (PNG)</div>
              <div className="text-[10px] text-blue-600 font-normal">1500 × 1000 px High-Res Mockup</div>
            </div>
          </button>

          {/* Export Single Card Back */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportSingle('png', 'single_back');
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Single Back (PNG 1500×1000)</span>
          </button>

          {/* Export Front & Back Duo */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportSingle('png', 'front_and_back');
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-blue-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Front + Back Duo (1500×1000)</span>
          </button>

          {/* Open Full Exporter Studio Modal */}
          {onOpenStudio && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenStudio();
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-amber-50 text-amber-900 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 mt-1 font-bold"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Open 1500×1000 Studio Modal...</span>
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onEdit();
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 mt-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          )}

          {onFlipSide && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onFlipSide();
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Flip to {currentSide === 'front' ? 'Back' : 'Front'} Side</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { CanvasElement } from '../types/canvas';
import {
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Type,
  Image as ImageIcon,
  Square,
  Award,
  PenTool,
  X,
} from 'lucide-react';

interface CanvasLayersPanelProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const CanvasLayersPanel: React.FC<CanvasLayersPanelProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onToggleLock,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onClose,
}) => {
  // Sort elements in descending z-index so topmost layer appears at top of list
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const getElementIcon = (type: CanvasElement['type']) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'shape':
        return <Square className="w-3.5 h-3.5 text-amber-500" />;
      case 'badge':
        return <Award className="w-3.5 h-3.5 text-purple-500" />;
      case 'signature':
        return <PenTool className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-xl overflow-hidden flex flex-col w-full max-w-[320px] text-xs select-none">
      {/* Panel Header */}
      <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-1.5 font-bold">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Layers Stack ({elements.length})</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          title="Close layers panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layers List */}
      <div className="p-2 overflow-y-auto max-h-[300px] flex flex-col gap-1">
        {sortedElements.map((elem, idx) => {
          const isSelected = elem.id === selectedElementId;
          const isTop = idx === 0;
          const isBottom = idx === sortedElements.length - 1;

          return (
            <div
              key={elem.id}
              onClick={() => onSelectElement(elem.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-2xs text-blue-950 font-bold'
                  : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
              } ${elem.isHidden ? 'opacity-50' : ''}`}
            >
              {/* Left: Icon & Name */}
              <div className="flex items-center gap-2 truncate mr-2">
                <span className="flex-shrink-0">{getElementIcon(elem.type)}</span>
                <span className="truncate text-[11px]">{elem.name}</span>
              </div>

              {/* Right: Actions */}
              <div
                className="flex items-center gap-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Reorder Up */}
                <button
                  type="button"
                  onClick={() => onMoveUp(elem.id)}
                  disabled={isTop}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move layer up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>

                {/* Reorder Down */}
                <button
                  type="button"
                  onClick={() => onMoveDown(elem.id)}
                  disabled={isBottom}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move layer down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>

                {/* Lock / Unlock */}
                <button
                  type="button"
                  onClick={() => onToggleLock(elem.id)}
                  className={`p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer ${
                    elem.isLocked ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title={elem.isLocked ? 'Unlock layer' : 'Lock layer'}
                >
                  {elem.isLocked ? (
                    <Lock className="w-3 h-3 text-amber-600" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>

                {/* Hide / Show */}
                <button
                  type="button"
                  onClick={() => onToggleVisibility(elem.id)}
                  className={`p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer ${
                    elem.isHidden ? 'text-slate-400' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={elem.isHidden ? 'Show layer' : 'Hide layer'}
                >
                  {elem.isHidden ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicate(elem.id)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Duplicate layer"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => onDelete(elem.id)}
                  className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete layer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

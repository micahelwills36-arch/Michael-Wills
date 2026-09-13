import React, { useState } from 'react';
import { CanvasElement, CanvasElementType } from '../types/canvas';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Plus,
  Type,
  Image as ImageIcon,
  Square,
  Award,
  PenTool,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface CanvasControlsToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedElement: CanvasElement | null;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onAddElement: (type: CanvasElementType) => void;
  onAddCustomTextField: () => void;
  onResetDefaults: () => void;
  isLayersPanelOpen: boolean;
  onToggleLayersPanel: () => void;
  isTextPanelOpen?: boolean;
  onToggleTextPanel?: () => void;
  totalElementsCount: number;
}

export const CanvasControlsToolbar: React.FC<CanvasControlsToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedElement,
  onDuplicate,
  onDelete,
  onToggleLock,
  onToggleVisibility,
  onMoveForward,
  onMoveBackward,
  onBringToFront,
  onSendToBack,
  onAddElement,
  onAddCustomTextField,
  onResetDefaults,
  isLayersPanelOpen,
  onToggleLayersPanel,
  isTextPanelOpen,
  onToggleTextPanel,
  totalElementsCount,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700/80 shadow-lg flex flex-wrap items-center justify-between gap-2 text-xs select-none">
      {/* Left side: History (Undo/Redo) & Add Element */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Undo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Undo</span>
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-35 disabled:hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] font-semibold">Redo</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

        {/* Add Element Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer text-[11px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Layer</span>
          </button>

          {showAddMenu && (
            <div
              className="absolute left-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95"
              onClick={() => setShowAddMenu(false)}
            >
              <button
                type="button"
                onClick={onAddCustomTextField}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium text-xs cursor-pointer transition-colors"
              >
                <Type className="w-3.5 h-3.5 text-blue-400" />
                <span>Custom Text Field</span>
              </button>
              <button
                type="button"
                onClick={() => onAddElement('image')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium text-xs cursor-pointer transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Image / Photo</span>
              </button>
              <button
                type="button"
                onClick={() => onAddElement('shape')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium text-xs cursor-pointer transition-colors"
              >
                <Square className="w-3.5 h-3.5 text-amber-400" />
                <span>Shape / Banner</span>
              </button>
              <button
                type="button"
                onClick={() => onAddElement('badge')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium text-xs cursor-pointer transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Badge / Hologram</span>
              </button>
              <button
                type="button"
                onClick={() => onAddElement('signature')}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white text-left font-medium text-xs cursor-pointer transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                <span>Signature Block</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Custom Text Field Button */}
        <button
          type="button"
          onClick={onAddCustomTextField}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer text-[11px]"
          title="Add a custom editable text field to the card"
        >
          <Type className="w-3.5 h-3.5" />
          <span>+ Text Field</span>
        </button>

        {/* Reset to Card Defaults */}
        <button
          type="button"
          onClick={onResetDefaults}
          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Reset canvas elements to match active card"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          <span className="hidden md:inline">Reset Defaults</span>
        </button>
      </div>

      {/* Center/Right side: Selected element operations */}
      {selectedElement ? (
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
          <div className="text-[11px] text-blue-300 font-bold max-w-[120px] truncate mr-1">
            {selectedElement.name}
          </div>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Duplicate selected layer (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Lock / Unlock */}
          <button
            type="button"
            onClick={onToggleLock}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              selectedElement.isLocked
                ? 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/40'
                : 'hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={selectedElement.isLocked ? 'Unlock layer' : 'Lock layer'}
          >
            {selectedElement.isLocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Hide / Show */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              selectedElement.isHidden
                ? 'bg-slate-700 text-slate-400'
                : 'hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title={selectedElement.isHidden ? 'Show layer' : 'Hide layer'}
          >
            {selectedElement.isHidden ? (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          {/* Layer Ordering: Up / Down / Top / Bottom */}
          <button
            type="button"
            onClick={onMoveForward}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bring Forward (+1 layer)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveBackward}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Send Backward (-1 layer)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onBringToFront}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bring to Front"
          >
            <ChevronsUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onSendToBack}
            className="p-1 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Send to Back"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded-md hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            title="Delete layer (Delete / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic hidden sm:block">
          Click any element on the card to select, drag, resize, or rotate
        </div>
      )}

      {/* Right side toggles: Text Inspector & Layers Panel */}
      <div className="flex items-center gap-1.5">
        {onToggleTextPanel && (
          <button
            type="button"
            onClick={onToggleTextPanel}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isTextPanelOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle Text & Formatting Inspector"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Edit</span>
          </button>
        )}

        {/* Layers Panel Toggle */}
        <button
          type="button"
          onClick={onToggleLayersPanel}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isLayersPanelOpen
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Layers Inspector"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers ({totalElementsCount})</span>
        </button>
      </div>
    </div>
  );
};

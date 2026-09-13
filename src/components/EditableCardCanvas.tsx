import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasElement, ResizeHandleType, CanvasElementType, CanvasElementStyle } from '../types/canvas';
import { CanvasElementView } from './CanvasElementView';
import { CanvasControlsToolbar } from './CanvasControlsToolbar';
import { CanvasLayersPanel } from './CanvasLayersPanel';
import { CanvasTextPropertiesPanel } from './CanvasTextPropertiesPanel';
import { createDefaultCanvasElements, createNewElement } from '../utils/defaultCanvasElements';
import { StudentDetails, InstituteConfig, SignatureConfig, CardDesignConfig, RealismSettings } from '../types';
import { Type, Plus, X } from 'lucide-react';

interface EditableCardCanvasProps {
  id?: string;
  studentDetails: StudentDetails;
  instituteConfig: InstituteConfig;
  signatureConfig: SignatureConfig;
  photoUrl: string;
  settings: RealismSettings;
  designConfig?: CardDesignConfig;
}

export const EditableCardCanvas: React.FC<EditableCardCanvasProps> = ({
  id = 'editable-card-canvas',
  studentDetails,
  instituteConfig,
  signatureConfig,
  photoUrl,
  settings,
  designConfig,
}) => {
  // Initialize elements from current card properties
  const [elements, setElements] = useState<CanvasElement[]>(() =>
    createDefaultCanvasElements(studentDetails, instituteConfig, signatureConfig, photoUrl)
  );

  // Keep canvas text elements in sync when student details (like Academic Program) change
  useEffect(() => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === 'elem-program') {
          return { ...el, content: `Program: ${studentDetails.program || 'B.Sc. CSIT'}` };
        }
        if (el.id === 'elem-name') {
          return { ...el, content: studentDetails.name || 'Student Name' };
        }
        if (el.id === 'elem-roll-id') {
          return { ...el, content: `Roll No: ${studentDetails.rollNo || '167'} • ID: ${studentDetails.idNumber || 'TU-2022-0167'}` };
        }
        if (el.id === 'elem-validity') {
          return { ...el, content: `Date of Issue: ${studentDetails.issueDate || '2022 Dec 01'} • Valid Until: ${studentDetails.validUntil || '2026 Nov 30'}` };
        }
        return el;
      })
    );
  }, [studentDetails.program, studentDetails.name, studentDetails.rollNo, studentDetails.idNumber, studentDetails.issueDate, studentDetails.validUntil]);

  // History stack for Undo / Redo
  const [historyPast, setHistoryPast] = useState<CanvasElement[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<CanvasElement[][]>([]);

  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Layers panel state
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState<boolean>(false);

  // Text Inspector panel state (default open to easily edit selected text elements)
  const [isTextPanelOpen, setIsTextPanelOpen] = useState<boolean>(true);

  // Interaction tracking refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'resize' | 'rotate' | null;
    elementId: string | null;
    startX: number;
    startY: number;
    initialElement: CanvasElement | null;
    resizeHandle?: ResizeHandleType;
    centerX?: number;
    centerY?: number;
  }>({
    isDragging: false,
    dragType: null,
    elementId: null,
    startX: 0,
    startY: 0,
    initialElement: null,
  });

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  // Push snapshot to history before mutating elements
  const pushHistorySnapshot = useCallback((newElements: CanvasElement[]) => {
    setHistoryPast((prev) => [...prev.slice(-30), elements]);
    setHistoryFuture([]);
    setElements(newElements);
  }, [elements]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryFuture((prev) => [elements, ...prev]);
    setHistoryPast((prev) => prev.slice(0, prev.length - 1));
    setElements(previous);
  }, [historyPast, elements]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryPast((prev) => [...prev, elements]);
    setHistoryFuture((prev) => prev.slice(1));
    setElements(next);
  }, [historyFuture, elements]);

  // Reset to active card defaults
  const handleResetDefaults = () => {
    const fresh = createDefaultCanvasElements(studentDetails, instituteConfig, signatureConfig, photoUrl);
    pushHistorySnapshot(fresh);
    setSelectedId(null);
  };

  // Add new layer element
  const handleAddElement = (type: CanvasElementType) => {
    const newElem = createNewElement(type, elements.length, photoUrl);
    pushHistorySnapshot([...elements, newElem]);
    setSelectedId(newElem.id);
  };

  // Add Custom Text Field
  const handleAddCustomTextField = useCallback(() => {
    const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
    const count = elements.filter((e) => e.type === 'text').length + 1;
    const newElem: CanvasElement = {
      id: `elem-text-${Date.now()}`,
      type: 'text',
      name: `Text Field ${count}`,
      x: 35,
      y: 110 + ((count * 18) % 80),
      width: 175,
      height: 24,
      rotation: 0,
      zIndex: maxZ + 1,
      isLocked: false,
      isHidden: false,
      content: 'Custom Field Text',
      style: {
        fontSize: 12,
        fontWeight: 'normal',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        color: '#0f172a',
        textAlign: 'left',
        letterSpacing: 'normal',
        lineHeight: 1.2,
      },
    };

    pushHistorySnapshot([...elements, newElem]);
    setSelectedId(newElem.id);
    setIsTextPanelOpen(true);
  }, [elements, pushHistorySnapshot]);

  // Record history snapshot tracker for text/property edits
  const isEditingPropertyRef = useRef(false);
  const recordSnapshotBeforePropertyEdit = useCallback(() => {
    if (!isEditingPropertyRef.current) {
      isEditingPropertyRef.current = true;
      setHistoryPast((prev) => [...prev.slice(-30), elements]);
      setHistoryFuture([]);
      setTimeout(() => {
        isEditingPropertyRef.current = false;
      }, 600);
    }
  }, [elements]);

  // Update specific element properties and styles
  const handleUpdateElement = useCallback(
    (
      idToUpdate: string,
      elementChanges: Partial<CanvasElement>,
      styleChanges?: Partial<CanvasElementStyle>
    ) => {
      recordSnapshotBeforePropertyEdit();
      setElements((prev) =>
        prev.map((elem) => {
          if (elem.id !== idToUpdate) return elem;
          return {
            ...elem,
            ...elementChanges,
            style: {
              ...elem.style,
              ...(styleChanges || {}),
            },
          };
        })
      );
    },
    [recordSnapshotBeforePropertyEdit]
  );

  // Duplicate selected element
  const handleDuplicate = (idToDuplicate?: string) => {
    const targetId = idToDuplicate || selectedId;
    if (!targetId) return;

    const target = elements.find((e) => e.id === targetId);
    if (!target) return;

    const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
    const clone: CanvasElement = {
      ...target,
      id: `elem-${target.type}-${Date.now()}`,
      name: `${target.name} (Copy)`,
      x: target.x + 12,
      y: target.y + 12,
      zIndex: maxZ + 1,
      isLocked: false,
    };

    pushHistorySnapshot([...elements, clone]);
    setSelectedId(clone.id);
  };

  // Delete selected element
  const handleDelete = (idToDelete?: string) => {
    const targetId = idToDelete || selectedId;
    if (!targetId) return;

    const filtered = elements.filter((e) => e.id !== targetId);
    pushHistorySnapshot(filtered);
    if (selectedId === targetId) {
      setSelectedId(null);
    }
  };

  // Toggle Lock
  const handleToggleLock = (idToToggle?: string) => {
    const targetId = idToToggle || selectedId;
    if (!targetId) return;

    const updated = elements.map((e) =>
      e.id === targetId ? { ...e, isLocked: !e.isLocked } : e
    );
    pushHistorySnapshot(updated);
  };

  // Toggle Visibility
  const handleToggleVisibility = (idToToggle?: string) => {
    const targetId = idToToggle || selectedId;
    if (!targetId) return;

    const updated = elements.map((e) =>
      e.id === targetId ? { ...e, isHidden: !e.isHidden } : e
    );
    pushHistorySnapshot(updated);
  };

  // Layer Ordering operations
  const handleBringToFront = (idToMove?: string) => {
    const targetId = idToMove || selectedId;
    if (!targetId) return;

    const maxZ = Math.max(...elements.map((e) => e.zIndex), 0);
    const updated = elements.map((e) =>
      e.id === targetId ? { ...e, zIndex: maxZ + 1 } : e
    );
    pushHistorySnapshot(updated);
  };

  const handleSendToBack = (idToMove?: string) => {
    const targetId = idToMove || selectedId;
    if (!targetId) return;

    const minZ = Math.min(...elements.map((e) => e.zIndex), 0);
    const updated = elements.map((e) =>
      e.id === targetId ? { ...e, zIndex: Math.max(0, minZ - 1) } : e
    );
    pushHistorySnapshot(updated);
  };

  const handleMoveForward = (idToMove?: string) => {
    const targetId = idToMove || selectedId;
    if (!targetId) return;

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((e) => e.id === targetId);
    if (index >= 0 && index < sorted.length - 1) {
      const nextElem = sorted[index + 1];
      const targetElem = sorted[index];

      const currentZ = targetElem.zIndex;
      const nextZ = nextElem.zIndex;

      const updated = elements.map((e) => {
        if (e.id === targetElem.id) return { ...e, zIndex: nextZ };
        if (e.id === nextElem.id) return { ...e, zIndex: currentZ };
        return e;
      });
      pushHistorySnapshot(updated);
    }
  };

  const handleMoveBackward = (idToMove?: string) => {
    const targetId = idToMove || selectedId;
    if (!targetId) return;

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const index = sorted.findIndex((e) => e.id === targetId);
    if (index > 0) {
      const prevElem = sorted[index - 1];
      const targetElem = sorted[index];

      const currentZ = targetElem.zIndex;
      const prevZ = prevElem.zIndex;

      const updated = elements.map((e) => {
        if (e.id === targetElem.id) return { ...e, zIndex: prevZ };
        if (e.id === prevElem.id) return { ...e, zIndex: currentZ };
        return e;
      });
      pushHistorySnapshot(updated);
    }
  };

  // Drag: Start Move
  const handleStartMove = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    if (element.isLocked) return;

    dragRef.current = {
      isDragging: true,
      dragType: 'move',
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...element },
    };
  };

  // Drag: Start Resize
  const handleStartResize = (e: React.MouseEvent, handle: ResizeHandleType, element: CanvasElement) => {
    e.stopPropagation();
    if (element.isLocked) return;

    dragRef.current = {
      isDragging: true,
      dragType: 'resize',
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...element },
      resizeHandle: handle,
    };
  };

  // Drag: Start Rotate
  const handleStartRotate = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    if (element.isLocked) return;

    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const centerX = canvasRect.left + element.x + element.width / 2;
    const centerY = canvasRect.top + element.y + element.height / 2;

    dragRef.current = {
      isDragging: true,
      dragType: 'rotate',
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      initialElement: { ...element },
      centerX,
      centerY,
    };
  };

  // Pointer Move & Up listeners on document window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { isDragging, dragType, elementId, startX, startY, initialElement, resizeHandle, centerX, centerY } = dragRef.current;
      if (!isDragging || !elementId || !initialElement) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (dragType === 'move') {
        const newX = Math.round(initialElement.x + deltaX);
        const newY = Math.round(initialElement.y + deltaY);

        setElements((prev) =>
          prev.map((el) => (el.id === elementId ? { ...el, x: newX, y: newY } : el))
        );
      } else if (dragType === 'resize' && resizeHandle) {
        let newX = initialElement.x;
        let newY = initialElement.y;
        let newWidth = initialElement.width;
        let newHeight = initialElement.height;

        const MIN_SIZE = 18;

        if (resizeHandle.includes('e')) {
          newWidth = Math.max(MIN_SIZE, initialElement.width + deltaX);
        }
        if (resizeHandle.includes('s')) {
          newHeight = Math.max(MIN_SIZE, initialElement.height + deltaY);
        }
        if (resizeHandle.includes('w')) {
          const widthCandidate = initialElement.width - deltaX;
          if (widthCandidate >= MIN_SIZE) {
            newWidth = widthCandidate;
            newX = initialElement.x + deltaX;
          }
        }
        if (resizeHandle.includes('n')) {
          const heightCandidate = initialElement.height - deltaY;
          if (heightCandidate >= MIN_SIZE) {
            newHeight = heightCandidate;
            newY = initialElement.y + deltaY;
          }
        }

        setElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? {
                  ...el,
                  x: Math.round(newX),
                  y: Math.round(newY),
                  width: Math.round(newWidth),
                  height: Math.round(newHeight),
                }
              : el
          )
        );
      } else if (dragType === 'rotate' && centerX !== undefined && centerY !== undefined) {
        const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let deg = (rad * 180) / Math.PI + 90; // offset so top is 0 deg
        if (deg < 0) deg += 360;

        // Snapping near 0, 45, 90, 180, 270, 360
        const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
        for (const snap of snapAngles) {
          if (Math.abs(deg - snap) < 3) {
            deg = snap === 360 ? 0 : snap;
            break;
          }
        }

        setElements((prev) =>
          prev.map((el) => (el.id === elementId ? { ...el, rotation: Math.round(deg) } : el))
        );
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging && dragRef.current.initialElement) {
        const { initialElement, elementId } = dragRef.current;
        // Check if anything changed
        const currentElem = elements.find((e) => e.id === elementId);
        if (
          currentElem &&
          (currentElem.x !== initialElement.x ||
            currentElem.y !== initialElement.y ||
            currentElem.width !== initialElement.width ||
            currentElem.height !== initialElement.height ||
            currentElem.rotation !== initialElement.rotation)
        ) {
          // Push initial snapshot into history
          setHistoryPast((prev) => [...prev.slice(-30), elements.map((e) => (e.id === elementId ? initialElement : e))]);
          setHistoryFuture([]);
        }
      }

      dragRef.current = {
        isDragging: false,
        dragType: null,
        elementId: null,
        startX: 0,
        startY: 0,
        initialElement: null,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [elements]);

  // Global Keyboard shortcuts: Undo, Redo, Delete, Duplicate, Deselect, Nudge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside an input / textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (cmdOrCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Duplicate: Ctrl+D
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        if (selectedId) {
          e.preventDefault();
          handleDuplicate();
        }
        return;
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          handleDelete();
        }
        return;
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }

      // Arrow keys nudge
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setElements((prev) =>
          prev.map((el) => {
            if (el.id !== selectedId || el.isLocked) return el;
            let { x, y } = el;
            if (e.key === 'ArrowUp') y -= step;
            if (e.key === 'ArrowDown') y += step;
            if (e.key === 'ArrowLeft') x -= step;
            if (e.key === 'ArrowRight') x += step;
            return { ...el, x, y };
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedId, elements]);

  // Card Outer Shadow & Styling (consistent with physical card dimensions)
  const shadowIntensity = (settings.outerShadowIntensity ?? 65) / 100;
  const shadowBlur = settings.outerShadowBlur ?? 28;
  const shadowSpread = settings.outerShadowSpread ?? 1;

  const dynamicOuterBoxShadow =
    shadowIntensity === 0
      ? '0 1px 2px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.9)'
      : `0 ${Math.round(shadowBlur * 0.7)}px ${shadowBlur}px ${shadowSpread}px rgba(15, 23, 42, ${(0.42 * shadowIntensity).toFixed(3)}), 0 ${Math.max(2, Math.round(shadowBlur * 0.35))}px ${Math.round(shadowBlur * 0.5)}px rgba(0, 0, 0, ${(0.22 * shadowIntensity).toFixed(3)}), 0 2px 4px rgba(15, 23, 42, ${(0.16 * shadowIntensity).toFixed(3)}), inset 0 1px 2px rgba(255, 255, 255, 0.9)`;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-[920px]">
      {/* 1. Interactive Canvas Control Toolbar (Undo, Redo, Add, Duplicate, Delete, Layer Order, Lock, Visibility) */}
      <div className="w-full">
        <CanvasControlsToolbar
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          selectedElement={selectedElement}
          onDuplicate={() => handleDuplicate()}
          onDelete={() => handleDelete()}
          onToggleLock={() => handleToggleLock()}
          onToggleVisibility={() => handleToggleVisibility()}
          onMoveForward={() => handleMoveForward()}
          onMoveBackward={() => handleMoveBackward()}
          onBringToFront={() => handleBringToFront()}
          onSendToBack={() => handleSendToBack()}
          onAddElement={handleAddElement}
          onAddCustomTextField={handleAddCustomTextField}
          onResetDefaults={handleResetDefaults}
          isLayersPanelOpen={isLayersPanelOpen}
          onToggleLayersPanel={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
          isTextPanelOpen={isTextPanelOpen}
          onToggleTextPanel={() => setIsTextPanelOpen(!isTextPanelOpen)}
          totalElementsCount={elements.length}
        />
      </div>

      {/* 2. Interactive Workspace: Card Canvas + Inspectors */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 w-full">
        {/* Card Canvas Stage Container */}
        <div className="relative flex flex-col items-center">
          <div
            id={id}
            className="relative select-none transition-transform duration-300"
            style={{
              padding: '7px',
              borderRadius: '20px',
              backgroundImage:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.76) 0%, rgba(240, 246, 252, 0.42) 40%, rgba(255, 255, 255, 0.65) 100%)',
              backdropFilter: 'blur(1.5px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: dynamicOuterBoxShadow,
            }}
          >
            {/* Lamination heat corners */}
            <div className="absolute top-1 right-1 w-3 h-3 rounded-tr-[12px] border-t border-r border-white/90 pointer-events-none opacity-80" />
            <div className="absolute bottom-1 left-1 w-3 h-3 rounded-bl-[12px] border-b border-l border-white/90 pointer-events-none opacity-80" />

            {/* Core PVC Canvas: CR-80 card standard (420x265px) */}
            <div
              ref={canvasRef}
              onClick={(e) => {
                if (e.target === canvasRef.current) {
                  setSelectedId(null);
                }
              }}
              className="relative w-[370px] h-[235px] sm:w-[420px] sm:h-[265px] bg-[#fffdfa] text-slate-900 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.18)] ring-1 ring-slate-300/80"
              style={{
                borderRadius: `${designConfig?.cornerRadius ?? (settings.cardCornerRadius || 14)}px`,
                filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
              }}
            >
              {/* Subtle background card watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center font-bold text-6xl tracking-widest text-slate-900 select-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                TU
              </div>

              {/* Editable Canvas Elements */}
              {elements.map((elem) => (
                <CanvasElementView
                  key={elem.id}
                  element={elem}
                  isSelected={elem.id === selectedId}
                  onSelect={(e) => {
                    e.stopPropagation();
                    setSelectedId(elem.id);
                    if (elem.type === 'text') {
                      setIsTextPanelOpen(true);
                    }
                  }}
                  onStartMove={handleStartMove}
                  onStartResize={handleStartResize}
                  onStartRotate={handleStartRotate}
                  onUpdateText={(id, text) => handleUpdateElement(id, { content: text })}
                />
              ))}
            </div>
          </div>

          {/* Floating / Docked Layers Panel */}
          {isLayersPanelOpen && (
            <div className="mt-3 w-full max-w-[420px] animate-in fade-in zoom-in-95">
              <CanvasLayersPanel
                elements={elements}
                selectedElementId={selectedId}
                onSelectElement={(id) => {
                  setSelectedId(id);
                  const el = elements.find((e) => e.id === id);
                  if (el?.type === 'text') setIsTextPanelOpen(true);
                }}
                onToggleLock={handleToggleLock}
                onToggleVisibility={handleToggleVisibility}
                onMoveUp={handleMoveForward}
                onMoveDown={handleMoveBackward}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onClose={() => setIsLayersPanelOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Text Properties Panel Inspector */}
        {isTextPanelOpen && (
          <div className="w-full max-w-[340px] shrink-0 animate-in fade-in zoom-in-95">
            {selectedElement ? (
              <CanvasTextPropertiesPanel
                element={selectedElement}
                onUpdateElement={(elemChanges, styleChanges) =>
                  handleUpdateElement(selectedElement.id, elemChanges, styleChanges)
                }
                onAddCustomTextField={handleAddCustomTextField}
                onClose={() => setIsTextPanelOpen(false)}
              />
            ) : (
              <div className="bg-white rounded-xl border border-slate-300 shadow-md p-4 text-xs select-none">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Type className="w-4 h-4 text-blue-600" />
                    <span>Text &amp; Typography Editor</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTextPanelOpen(false)}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Close Inspector"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 mb-3 leading-relaxed">
                  Select any text field on the ID card to customize its text, font family, size, weight, alignment, letter-spacing, line-height, position, and dimensions.
                </p>
                <button
                  type="button"
                  onClick={handleAddCustomTextField}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Custom Text Field</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text footer */}
      <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium text-center">
        <span>Click text to select</span>
        <span>•</span>
        <span>Double-click text to inline edit</span>
        <span>•</span>
        <span>Drag to reposition</span>
        <span>•</span>
        <span>Resize &amp; rotate handles</span>
        <span>•</span>
        <span>Ctrl+Z undo</span>
      </div>
    </div>
  );
};

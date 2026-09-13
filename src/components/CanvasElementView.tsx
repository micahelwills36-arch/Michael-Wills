import React from 'react';
import { CanvasElement, ResizeHandleType } from '../types/canvas';
import { Lock, RotateCw } from 'lucide-react';

interface CanvasElementViewProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onStartMove: (e: React.MouseEvent, element: CanvasElement) => void;
  onStartResize: (e: React.MouseEvent, handle: ResizeHandleType, element: CanvasElement) => void;
  onStartRotate: (e: React.MouseEvent, element: CanvasElement) => void;
  onUpdateText?: (id: string, text: string) => void;
}

const RESIZE_HANDLES: { type: ResizeHandleType; className: string; cursor: string }[] = [
  { type: 'nw', className: '-top-1.5 -left-1.5', cursor: 'nwse-resize' },
  { type: 'n', className: '-top-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
  { type: 'ne', className: '-top-1.5 -right-1.5', cursor: 'nesw-resize' },
  { type: 'e', className: 'top-1/2 -right-1.5 -translate-y-1/2', cursor: 'ew-resize' },
  { type: 'se', className: '-bottom-1.5 -right-1.5', cursor: 'nwse-resize' },
  { type: 's', className: '-bottom-1.5 left-1/2 -translate-x-1/2', cursor: 'ns-resize' },
  { type: 'sw', className: '-bottom-1.5 -left-1.5', cursor: 'nesw-resize' },
  { type: 'w', className: 'top-1/2 -left-1.5 -translate-y-1/2', cursor: 'ew-resize' },
];

export const CanvasElementView: React.FC<CanvasElementViewProps> = ({
  element,
  isSelected,
  onSelect,
  onStartMove,
  onStartResize,
  onStartRotate,
  onUpdateText,
}) => {
  const [isEditingInline, setIsEditingInline] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!isSelected) {
      setIsEditingInline(false);
    }
  }, [isSelected]);

  React.useEffect(() => {
    if (isEditingInline && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingInline]);

  if (element.isHidden) {
    return null;
  }

  const { style } = element;
  const isTextType = element.type === 'text' || element.type === 'badge' || element.type === 'signature';

  // Render content according to element type
  const renderContent = () => {
    if (isEditingInline && isTextType) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={element.content}
          onChange={(e) => onUpdateText?.(element.id, e.target.value)}
          onBlur={() => setIsEditingInline(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditingInline(false);
            }
            if (e.key === 'Escape') {
              setIsEditingInline(false);
            }
          }}
          className="w-full h-full bg-white/95 text-slate-900 border-2 border-blue-500 rounded p-1 outline-none pointer-events-auto resize-none shadow-lg z-50"
          style={{
            fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight || 'normal',
            textAlign: style.textAlign || 'left',
            letterSpacing: style.letterSpacing || 'normal',
            lineHeight: style.lineHeight || 1.2,
          }}
        />
      );
    }

    switch (element.type) {
      case 'image':
        return (
          <img
            src={element.content}
            alt={element.name}
            className="w-full h-full pointer-events-none select-none"
            style={{
              objectFit: style.objectFit || 'cover',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
            }}
          />
        );
      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: style.backgroundColor || '#3b82f6',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
              opacity: style.opacity ?? 1,
            }}
          />
        );
      case 'badge':
        return (
          <div
            className="w-full h-full flex items-center justify-center font-bold px-2 truncate"
            style={{
              backgroundColor: style.backgroundColor || '#dbeafe',
              color: style.color || '#1e40af',
              fontSize: style.fontSize ? `${style.fontSize}px` : '10px',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : '4px',
              letterSpacing: style.letterSpacing || 'normal',
            }}
          >
            {element.content}
          </div>
        );
      case 'signature':
        return (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              color: style.color || '#1e3a8a',
              fontSize: style.fontSize ? `${style.fontSize}px` : '18px',
              fontFamily: style.fontFamily || "'Great Vibes', cursive",
            }}
          >
            {element.content}
          </div>
        );
      case 'barcode':
        return (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-1 bg-white"
            style={{
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : '2px',
            }}
          >
            {/* Simulated barcode bars */}
            <div className="w-full h-3/5 flex items-stretch justify-center gap-0.5 overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="bg-black"
                  style={{
                    width: i % 3 === 0 ? '2.5px' : i % 2 === 0 ? '1px' : '1.5px',
                    opacity: i % 5 === 0 ? 0.9 : 1,
                  }}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-black font-bold mt-0.5 leading-none">
              {element.content}
            </span>
          </div>
        );
      case 'text':
      default:
        return (
          <div
            className="w-full h-full flex items-center overflow-hidden"
            style={{
              color: style.color || '#0f172a',
              fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
              fontWeight: style.fontWeight || 'normal',
              fontFamily: style.fontFamily,
              textAlign: style.textAlign || 'left',
              justifyContent:
                style.textAlign === 'center'
                  ? 'center'
                  : style.textAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
              letterSpacing: style.letterSpacing || 'normal',
              lineHeight: style.lineHeight || 1.2,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {element.content}
          </div>
        );
    }
  };

  return (
    <div
      id={element.id}
      className={`absolute group select-none ${
        element.isLocked ? 'cursor-not-allowed' : 'cursor-move'
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: element.zIndex,
        borderColor: isSelected
          ? '#2563eb'
          : style.borderColor || 'transparent',
        borderWidth: isSelected
          ? '1.5px'
          : style.borderWidth ? `${style.borderWidth}px` : '0px',
        borderStyle: isSelected ? 'solid' : style.borderStyle || 'solid',
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
      onMouseDown={(e) => {
        onSelect(e);
        if (!element.isLocked && !isEditingInline) {
          onStartMove(e, element);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!element.isLocked && isTextType) {
          setIsEditingInline(true);
        }
      }}
    >
      {/* Content wrapper */}
      <div className={`w-full h-full relative overflow-hidden ${isEditingInline ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {renderContent()}
      </div>

      {/* Lock Indicator when element is locked */}
      {element.isLocked && (
        <div
          className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 shadow-xs border border-white z-20 pointer-events-none"
          title="Element is locked"
        >
          <Lock className="w-2.5 h-2.5" />
        </div>
      )}

      {/* Active Selection Outline, Resize Handles & Rotation Controller */}
      {isSelected && !element.isLocked && (
        <>
          {/* Subtle bounding highlight */}
          <div className="absolute inset-0 ring-1 ring-blue-500/50 pointer-events-none" />

          {/* 8 Resize Handles */}
          {RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.type}
              className={`absolute w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-xs shadow-xs z-30 ${handle.className}`}
              style={{ cursor: handle.cursor }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onStartResize(e, handle.type, element);
              }}
            />
          ))}

          {/* Rotation Handle (top center with connector line) */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 cursor-grab active:cursor-grabbing group/rot"
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartRotate(e, element);
            }}
            title={`Rotate (${Math.round(element.rotation)}°)`}
          >
            <div className="w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-xs flex items-center justify-center hover:bg-blue-50 hover:scale-110 transition-transform">
              <RotateCw className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <div className="w-0.5 h-2 bg-blue-600" />
          </div>

          {/* Angle degree indicator when rotated */}
          {element.rotation !== 0 && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/85 text-white text-[9px] font-mono px-1 py-0.2 rounded pointer-events-none whitespace-nowrap z-30">
              {Math.round(element.rotation)}°
            </div>
          )}
        </>
      )}
    </div>
  );
};

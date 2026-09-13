import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  ZoomIn,
  MoveVertical,
  Sun,
  Contrast,
  Users,
  Video,
  VideoOff,
  Sparkles,
  ClipboardPaste,
  RefreshCw,
} from 'lucide-react';
import { ASSETS } from '../constants';
import { PhotoAdjustments, CardEditMode } from '../types';
import { generateSelfieFromPrompt } from '../utils/selfiePromptEngine';

interface PhotoControlsProps {
  currentPhoto: string;
  onPhotoChange: (url: string) => void;
  photoOpacity: number;
  adjustments: PhotoAdjustments;
  onUpdateAdjustments: (adjustments: PhotoAdjustments) => void;
  editMode?: CardEditMode;
  onUpdateEditMode?: (mode: CardEditMode) => void;
}

// Curated high quality student portrait presets for fast demonstration
const PRESET_STUDENT_PHOTOS = [
  {
    id: 'isabella',
    name: 'Isabella Rose (Default)',
    url: ASSETS.defaultPassportPhoto,
  },
  {
    id: 'aaditya',
    name: 'Aaditya (Male Student)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'priya',
    name: 'Priya (Female Student)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'milan',
    name: 'Milan (Grad Student)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
];

export const PhotoControls: React.FC<PhotoControlsProps> = ({
  currentPhoto,
  onPhotoChange,
  photoOpacity,
  adjustments,
  onUpdateAdjustments,
  editMode = 'both',
  onUpdateEditMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [selfiePrompt, setSelfiePrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Paste Prompt and Generate Handler (auto-triggers on paste, enter, or click)
  const handleGenerateWithPrompt = async (customPrompt?: string) => {
    let promptToUse = (typeof customPrompt === 'string' ? customPrompt : selfiePrompt).trim();

    // Only attempt clipboard if input prompt is empty
    if (!promptToUse) {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clip = await navigator.clipboard.readText();
          if (clip && clip.trim()) {
            promptToUse = clip.trim();
            setSelfiePrompt(clip.trim());
          }
        }
      } catch (e) {
        console.info('Clipboard read permission unavailable, using input text:', e);
      }
    }

    if (!promptToUse) {
      promptToUse = '22yo smiling student with studio passport lighting, white backdrop';
      setSelfiePrompt(promptToUse);
    }

    setIsGeneratingPrompt(true);
    try {
      const res = await generateSelfieFromPrompt(promptToUse);
      onPhotoChange(res.url);
      onUpdateAdjustments(res.adjustments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Selfie Capture
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      setWebcamStream(stream);
      setIsWebcamOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission denied or not available:', err);
      alert('Camera could not be accessed. Please upload an image file instead.');
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamOpen(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onPhotoChange(dataUrl);
      stopWebcam();
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Passport Photo / Selfie
          </h3>
        </div>

        {onUpdateEditMode && (
          <div className="inline-flex p-0.5 bg-slate-100 rounded-md border border-slate-200 text-[10px]">
            <button
              type="button"
              onClick={() => onUpdateEditMode('both')}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                editMode === 'both' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => onUpdateEditMode('student')}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                editMode === 'student' ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card 1
            </button>
            <button
              type="button"
              onClick={() => onUpdateEditMode('library')}
              className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                editMode === 'library' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card 2
            </button>
          </div>
        )}
      </div>

      {/* Main Photo Row: Thumbnail Preview & Primary Action Buttons */}
      <div className="flex items-center gap-3.5">
        {/* Live ID Picture Thumbnail */}
        <div className="relative w-14 h-17 rounded-md overflow-hidden border-2 border-blue-600 bg-slate-100 flex-shrink-0 shadow-xs">
          <img
            src={currentPhoto}
            alt="Current ID portrait"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
            style={{
              transform: `scale(${adjustments.zoom}) translate(${adjustments.offsetX}px, ${adjustments.offsetY}px)`,
              filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Upload photo from your device"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Selfie
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* User Requested: Box near upload photo button with auto-generation on paste */}
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-purple-300 rounded-lg p-0.5 shadow-2xs focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-purple-500 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 ml-1 flex-shrink-0" />
            <input
              type="text"
              value={selfiePrompt}
              onChange={(e) => setSelfiePrompt(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted && pasted.trim()) {
                  setSelfiePrompt(pasted.trim());
                  handleGenerateWithPrompt(pasted.trim());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateWithPrompt();
              }}
              placeholder="Paste selfie prompt here..."
              className="text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none w-36 sm:w-48 px-1 py-0.5"
              title="Paste or type a prompt describing the selfie (automatically generates on paste or enter)"
            />
            <button
              type="button"
              id="photo-controls-paste-prompt-button"
              onClick={() => handleGenerateWithPrompt()}
              disabled={isGeneratingPrompt}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 flex-shrink-0"
              title="Generate image according to this prompt (or paste prompt from clipboard)"
            >
              {isGeneratingPrompt ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-3.5 h-3.5 text-purple-200" />
                  <span>{selfiePrompt.trim() ? 'Generate' : 'Paste Prompt'}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={isWebcamOpen ? stopWebcam : startWebcam}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Snap a live passport photo using webcam"
          >
            <Video className="w-3.5 h-3.5 text-blue-700" />
            Take Selfie
          </button>

          <button
            type="button"
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              showAdjustments
                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            Crop / Zoom
          </button>

          {currentPhoto !== ASSETS.defaultPassportPhoto && (
            <button
              type="button"
              onClick={() => {
                onPhotoChange(ASSETS.defaultPassportPhoto);
                onUpdateAdjustments({
                  zoom: 1,
                  offsetY: 0,
                  offsetX: 0,
                  brightness: 100,
                  contrast: 100,
                });
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
              title="Reset to default official Isabella photo"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Webcam Live Capture Popup */}
      {isWebcamOpen && (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-lg space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Position your face in center
            </span>
            <button
              type="button"
              onClick={stopWebcam}
              className="text-slate-400 hover:text-white p-1"
            >
              <VideoOff className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-lg overflow-hidden bg-black border-2 border-amber-400">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => videoRef.current?.play()}
            />
            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none border-2 border-white/50 border-dashed rounded-full m-4" />
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={captureWebcamPhoto}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Snap Photo
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Crop / Zoom / Position Sliders Panel */}
      {showAdjustments && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Passport Frame Positioning</span>
            <button
              type="button"
              onClick={() =>
                onUpdateAdjustments({
                  zoom: 1,
                  offsetY: 0,
                  offsetX: 0,
                  brightness: 100,
                  contrast: 100,
                })
              }
              className="text-[10px] text-blue-700 hover:underline cursor-pointer"
            >
              Reset Sliders
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-slate-500" /> Zoom:
                </span>
                <span className="font-bold">{Math.round(adjustments.zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.05"
                value={adjustments.zoom}
                onChange={(e) =>
                  onUpdateAdjustments({ ...adjustments, zoom: parseFloat(e.target.value) })
                }
                className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vertical Y-Position Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span className="flex items-center gap-1">
                  <MoveVertical className="w-3 h-3 text-slate-500" /> Position Y:
                </span>
                <span className="font-bold">{adjustments.offsetY}px</span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={adjustments.offsetY}
                onChange={(e) =>
                  onUpdateAdjustments({ ...adjustments, offsetY: parseInt(e.target.value) })
                }
                className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Photo Brightness */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-slate-500" /> Brightness:
                </span>
                <span className="font-bold">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="125"
                step="1"
                value={adjustments.brightness}
                onChange={(e) =>
                  onUpdateAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })
                }
                className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Photo Contrast */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                <span className="flex items-center gap-1">
                  <Contrast className="w-3 h-3 text-slate-500" /> Contrast:
                </span>
                <span className="font-bold">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="125"
                step="1"
                value={adjustments.contrast}
                onChange={(e) =>
                  onUpdateAdjustments({ ...adjustments, contrast: parseInt(e.target.value) })
                }
                className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preset Student Photo Gallery */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3" /> Quick Student Presets
          </span>
        </div>
        <div className="flex gap-2">
          {PRESET_STUDENT_PHOTOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPhotoChange(preset.url)}
              className={`flex-1 p-1 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                currentPhoto === preset.url
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
              title={`Switch to ${preset.name}`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                referrerPolicy="no-referrer"
                className="w-6 h-7 rounded object-cover object-top flex-shrink-0"
              />
              <span className="text-[10px] font-semibold text-slate-700 truncate">
                {preset.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

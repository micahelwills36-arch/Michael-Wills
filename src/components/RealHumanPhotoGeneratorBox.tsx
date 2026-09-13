import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  RefreshCw,
  Play,
  Pause,
  User,
  CheckCircle2,
  Sliders,
  Maximize2,
  Shirt,
  Layers,
  Crop,
  ShieldCheck,
  Video,
  VideoOff,
  Clock,
  ChevronRight,
  Eye,
  Upload,
  Zap,
  ClipboardPaste,
} from 'lucide-react';
import { REAL_HUMAN_PORTRAITS, PassportPortrait } from '../data/passportPortraits';
import { PhotoAdjustments, CardEditMode } from '../types';
import { generateSelfieFromPrompt } from '../utils/selfiePromptEngine';

interface RealHumanPhotoGeneratorBoxProps {
  currentPhoto: string;
  onApplyPhoto: (url: string, adjustments?: Partial<PhotoAdjustments>) => void;
  editMode: CardEditMode;
  onUpdateEditMode?: (mode: CardEditMode) => void;
}

export const RealHumanPhotoGeneratorBox: React.FC<RealHumanPhotoGeneratorBoxProps> = ({
  currentPhoto,
  onApplyPhoto,
  editMode,
  onUpdateEditMode,
}) => {
  const [selectedGender, setSelectedGender] = useState<'all' | 'female' | 'male'>('all');
  const [selectedAttire, setSelectedAttire] = useState<'all' | 'white_collared' | 'blazer' | 'casual_student'>('all');
  const [selectedBgStyle, setSelectedBgStyle] = useState<'all' | 'studio_white' | 'studio_blue' | 'studio_grey'>('all');

  // Auto-reloading state
  const [isAutoReloading, setIsAutoReloading] = useState(false);
  const [autoReloadIntervalSeconds, setAutoReloadIntervalSeconds] = useState<number>(4);
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Live Webcam Selfie Mode
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [selfiePrompt, setSelfiePrompt] = useState<string>('');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter portraits
  const filteredPortraits = REAL_HUMAN_PORTRAITS.filter((p) => {
    if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
    if (selectedAttire !== 'all' && p.attire !== selectedAttire) return false;
    if (selectedBgStyle !== 'all' && p.backgroundStyle !== selectedBgStyle) return false;
    return true;
  });

  const activePortraitList = filteredPortraits.length > 0 ? filteredPortraits : REAL_HUMAN_PORTRAITS;

  // Next / Random Portrait Generator
  const generateNextPortrait = () => {
    const nextIdx = (currentIndex + 1) % activePortraitList.length;
    setCurrentIndex(nextIdx);
    const portrait = activePortraitList[nextIdx];
    applyPortrait(portrait);
  };

  const applyPortrait = (portrait: PassportPortrait) => {
    onApplyPhoto(portrait.url, {
      zoom: portrait.recommendedZoom || 1.0,
      offsetY: portrait.recommendedOffsetY || 0,
      offsetX: 0,
      brightness: 100,
      contrast: 100,
    });
    setAppliedNotice(`Applied: ${portrait.name}`);
    setTimeout(() => setAppliedNotice(null), 2500);
  };

  // Generate selfie from pasted or entered prompt automatically
  const handleGenerateWithPrompt = async (customPrompt?: string) => {
    let promptToUse = (typeof customPrompt === 'string' ? customPrompt : selfiePrompt).trim();

    // Only try reading clipboard if input is completely empty
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
        console.info('Clipboard permission not granted or empty, using input prompt:', e);
      }
    }

    if (!promptToUse) {
      promptToUse = '22yo smiling university student with studio passport lighting, white backdrop';
      setSelfiePrompt(promptToUse);
    }

    setIsGeneratingFromPrompt(true);
    setAppliedNotice('✨ Generating AI portrait according to prompt...');

    try {
      const res = await generateSelfieFromPrompt(promptToUse);
      onApplyPhoto(res.url, res.adjustments);
      setAppliedNotice(`✅ Generated according to prompt & applied!`);
      setTimeout(() => setAppliedNotice(null), 3500);
    } catch (err) {
      console.error(err);
      setAppliedNotice('Error generating selfie from prompt.');
      setTimeout(() => setAppliedNotice(null), 3000);
    } finally {
      setIsGeneratingFromPrompt(false);
    }
  };

  // Attach webcam stream to video element when ready
  useEffect(() => {
    if (isWebcamOpen && videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch((err) => {
        console.warn('Video auto-play warning:', err);
      });
    }
  }, [isWebcamOpen, webcamStream]);

  // Auto-reload countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isAutoReloading) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            generateNextPortrait();
            return autoReloadIntervalSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSecondsLeft(autoReloadIntervalSeconds);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoReloading, autoReloadIntervalSeconds, currentIndex, activePortraitList]);

  // Handle webcam start
  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      setWebcamStream(stream);
      setIsWebcamOpen(true);
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setCameraError(
        'Camera access was not permitted by browser. You can use the "Simulate Live Studio Selfie" or "Upload Photo" button below!'
      );
      setIsWebcamOpen(true);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamOpen(false);
    setCountdown(null);
    setCameraError(null);
  };

  const captureWebcamSelfie = () => {
    setCountdown(3);
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimer);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (videoRef.current && webcamStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onApplyPhoto(dataUrl, {
          zoom: 1.0,
          offsetX: 0,
          offsetY: 0,
          brightness: 100,
          contrast: 100,
        });
        setAppliedNotice('Live Webcam Selfie captured & applied to ID card!');
        setTimeout(() => setAppliedNotice(null), 3000);
        stopWebcam();
        return;
      }
    }

    // If video not active, capture simulated studio selfie
    captureSimulatedSelfie();
  };

  const captureSimulatedSelfie = () => {
    // Pick next portrait and apply with natural studio selfie settings
    const randomPortrait = activePortraitList[Math.floor(Math.random() * activePortraitList.length)];
    applyPortrait(randomPortrait);
    setAppliedNotice(`Studio Selfie captured: ${randomPortrait.name}!`);
    setTimeout(() => setAppliedNotice(null), 3000);
    stopWebcam();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onApplyPhoto(event.target.result as string, {
            zoom: 1.0,
            offsetX: 0,
            offsetY: 0,
            brightness: 100,
            contrast: 100,
          });
          setAppliedNotice('Custom photo uploaded & applied successfully!');
          setTimeout(() => setAppliedNotice(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Box Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 leading-none">
                Real Human Passport Photo Generator &amp; Selfie Studio
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                CR-80 35×45mm Fit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Auto-reloads authentic real-human passport portraits with exact ratio, neutral studio lighting &amp; head alignment.
            </p>
          </div>
        </div>

        {/* Target Card Selector */}
        {onUpdateEditMode && (
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <span className="text-[10px] text-slate-500 px-1.5 hidden sm:inline">Apply To:</span>
            <button
              type="button"
              onClick={() => onUpdateEditMode('both')}
              className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-all ${
                editMode === 'both'
                  ? 'bg-white text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both Cards
            </button>
            <button
              type="button"
              onClick={() => onUpdateEditMode('student')}
              className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-all ${
                editMode === 'student'
                  ? 'bg-white text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card 1 (Student)
            </button>
            <button
              type="button"
              onClick={() => onUpdateEditMode('library')}
              className={`px-2 py-1 rounded-md text-xs cursor-pointer transition-all ${
                editMode === 'library'
                  ? 'bg-white text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card 2 (Library)
            </button>
          </div>
        )}
      </div>

      {/* Applied Notice Banner */}
      {appliedNotice && (
        <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            {appliedNotice}
          </span>
          <span className="text-[10px] font-normal opacity-85">Card updated instantly</span>
        </div>
      )}

      {/* Primary Action Row: Instant 1-Click Generator, Webcam & Upload Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Reload / Generate Button */}
          <button
            type="button"
            onClick={generateNextPortrait}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Generate and apply the next authentic real human portrait"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Next Portrait</span>
          </button>

          {/* Simulated / Studio Live Selfie Generator */}
          <button
            type="button"
            onClick={captureSimulatedSelfie}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Capture an instant studio-grade student selfie without requiring webcam permissions"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>Instant Studio Selfie</span>
          </button>

          {/* Direct File Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-all cursor-pointer"
            title="Upload your own picture or selfie file"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* User Requested: Box near upload photo button with auto-generation on paste */}
          <div className="flex items-center gap-1 bg-white border border-purple-300 rounded-xl p-1 shadow-2xs focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-purple-500 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 ml-1 flex-shrink-0" />
            <input
              type="text"
              value={selfiePrompt}
              onChange={(e) => setSelfiePrompt(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted && pasted.trim()) {
                  setSelfiePrompt(pasted.trim());
                  // Automatically generate image from prompt upon pasting
                  handleGenerateWithPrompt(pasted.trim());
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerateWithPrompt();
              }}
              placeholder="Paste selfie prompt here..."
              className="text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-36 sm:w-52 md:w-60 px-1.5 py-0.5"
              title="Paste or type a prompt describing the selfie (automatically generates image upon paste or enter)"
            />
            <button
              type="button"
              id="paste-prompt-button"
              onClick={() => handleGenerateWithPrompt()}
              disabled={isGeneratingFromPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60 flex-shrink-0"
              title="Generate image according to this prompt (or paste prompt from clipboard)"
            >
              {isGeneratingFromPrompt ? (
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

          {/* Auto-Reload Toggle */}
          <button
            type="button"
            onClick={() => setIsAutoReloading(!isAutoReloading)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              isAutoReloading
                ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-2xs ring-2 ring-purple-400/30'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Toggle automatic portrait reloading loop"
          >
            {isAutoReloading ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-purple-600" />}
            <span>
              {isAutoReloading ? `Auto-Cycle (${secondsLeft}s)` : 'Auto-Cycle'}
            </span>
          </button>

          {/* Auto-reload interval dropdown */}
          {isAutoReloading && (
            <select
              value={autoReloadIntervalSeconds}
              onChange={(e) => setAutoReloadIntervalSeconds(parseInt(e.target.value))}
              className="bg-white border border-slate-300 text-xs rounded-lg px-2 py-1.5 text-slate-700 font-semibold"
            >
              <option value="2">Every 2s</option>
              <option value="4">Every 4s</option>
              <option value="6">Every 6s</option>
              <option value="8">Every 8s</option>
            </select>
          )}
        </div>

        {/* Live Webcam Selfie Launcher */}
        <button
          type="button"
          onClick={isWebcamOpen ? stopWebcam : startWebcam}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
            isWebcamOpen
              ? 'bg-red-50 text-red-700 border-red-300'
              : 'bg-slate-800 hover:bg-slate-900 text-white border-slate-800 shadow-xs'
          }`}
        >
          {isWebcamOpen ? <VideoOff className="w-3.5 h-3.5 text-red-600" /> : <Camera className="w-3.5 h-3.5 text-white" />}
          <span>{isWebcamOpen ? 'Close Camera' : 'Live Webcam'}</span>
        </button>
      </div>

      {/* Webcam Selfie Studio Overlay if active */}
      {isWebcamOpen && (
        <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Camera className="w-4 h-4 text-blue-400" />
              <span>Live Biometric Passport Selfie Studio</span>
            </div>
            <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/40">
              Align chin &amp; eyes within biometric guide
            </span>
          </div>

          {cameraError ? (
            <div className="p-4 bg-slate-800/90 rounded-lg border border-amber-500/50 text-amber-200 text-xs space-y-2 text-center">
              <p className="font-semibold">{cameraError}</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={captureSimulatedSelfie}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                >
                  Snap Instant Studio Selfie Instead
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Upload Image File
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full max-w-sm mx-auto aspect-[35/45] bg-black rounded-lg overflow-hidden border-2 border-white/20">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Biometric Passport Oval Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Outer oval boundary */}
                <div className="w-[68%] h-[74%] rounded-[50%] border-2 border-dashed border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.4)] relative">
                  {/* Horizontal Eye line */}
                  <div className="absolute top-[42%] left-2 right-2 border-t border-sky-400/50" />
                  <span className="absolute top-[34%] right-2 text-[9px] font-mono text-sky-300 bg-black/60 px-1 rounded">
                    Eye Level
                  </span>

                  {/* Vertical Center line */}
                  <div className="absolute top-2 bottom-2 left-1/2 border-l border-sky-400/30 -translate-x-1/2" />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-sky-300 bg-black/60 px-1 rounded">
                    Chin Base
                  </span>
                </div>
              </div>

              {/* Countdown Display */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-6xl font-black text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={captureWebcamSelfie}
              disabled={countdown !== null}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Selfie (3s Timer)</span>
            </button>
            <button
              type="button"
              onClick={captureSimulatedSelfie}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200" />
              <span>Simulate Snapshot</span>
            </button>
            <button
              type="button"
              onClick={stopWebcam}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs: Gender, Attire, and Studio Backdrop */}
      <div className="space-y-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold px-1">Gender:</span>
            {(['all', 'female', 'male'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGender(g)}
                className={`px-2 py-0.5 rounded-md font-semibold capitalize cursor-pointer transition-all ${
                  selectedGender === g
                    ? 'bg-white text-blue-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Attire Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold px-1">Attire:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'white_collared', label: 'White Collared' },
              { id: 'blazer', label: 'Formal Blazer' },
              { id: 'casual_student', label: 'Student' },
            ].map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAttire(a.id as any)}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                  selectedAttire === a.id
                    ? 'bg-white text-blue-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Studio Backdrop Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold px-1">Backdrop:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'studio_white', label: 'White' },
              { id: 'studio_blue', label: 'Blue' },
              { id: 'studio_grey', label: 'Grey' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBgStyle(b.id as any)}
                className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                  selectedBgStyle === b.id
                    ? 'bg-white text-blue-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Curated Real Human Portrait Gallery Grid */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
          <span>Click any real human portrait to instantly fit into card (35×45mm standard):</span>
          <span>{activePortraitList.length} portraits available</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {activePortraitList.map((portrait) => {
            const isCurrentlySelected = currentPhoto === portrait.url;

            return (
              <button
                key={portrait.id}
                type="button"
                onClick={() => applyPortrait(portrait)}
                className={`group relative aspect-[35/45] rounded-lg overflow-hidden border-2 transition-all cursor-pointer text-left ${
                  isCurrentlySelected
                    ? 'border-blue-600 ring-2 ring-blue-400/40 shadow-sm'
                    : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                }`}
                title={`${portrait.name} (${portrait.ethnicityOrStyle})`}
              >
                <img
                  src={portrait.url}
                  alt={portrait.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                />

                {isCurrentlySelected && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1">
                  <p className="text-[9px] font-bold text-white leading-tight truncate">
                    {portrait.name.split(' ')[0]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality & Biometric Standards Verification Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10.5px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
          <span>
            Calibrated with 100% solid opacity, centered head-to-crown alignment &amp; sharp lamination dye transfer.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-blue-900">
          <span>ISO/IEC 7810 ID-1 (CR-80)</span>
        </div>
      </div>
    </div>
  );
};

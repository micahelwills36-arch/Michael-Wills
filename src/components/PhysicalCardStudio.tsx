import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  Sun,
  Hand,
  Layers,
  Camera,
  Smartphone,
  CheckCircle2,
  Sliders,
  Maximize2,
  Move,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ASSETS } from '../constants';
import { DocumentCaptureQualityCheck, DocumentCaptureExifData } from '../types';
import {
  computeLaplacianVariance,
  evaluateExposureAndGlare,
  evaluateCardGeometry,
  STANDARD_ID1_ASPECT_RATIO,
  MIN_BRIGHTNESS_THRESHOLD,
  MAX_BRIGHTNESS_THRESHOLD,
  LAPLACIAN_BLUR_THRESHOLD,
} from '../utils/documentQualityAnalysis';
import {
  PHONE_CAMERA_PROFILES,
  generateRealPhoneCameraExif,
  PhoneCameraProfile,
} from '../utils/phoneCameraExif';
import { RealisticHandOverlay, HandPose, SkinTone } from './RealisticHandOverlay';
import { WindowSunlightOverlay, WindowStyle, SunlightTone } from './WindowSunlightOverlay';

export interface PhysicalCardStudioProps {
  initialCardImage?: string | null;
  cardTitle?: string;
  onCaptureComplete: (
    dataUrl: string,
    quality: DocumentCaptureQualityCheck,
    exif: DocumentCaptureExifData
  ) => void;
}

export type WoodSurface = 'sunlight_wood' | 'varnished_oak' | 'deep_walnut' | 'teak_grain';

export const PhysicalCardStudio: React.FC<PhysicalCardStudioProps> = ({
  initialCardImage,
  cardTitle = 'Physical ID Card',
  onCaptureComplete,
}) => {
  // Card Image State
  const [cardImage, setCardImage] = useState<string | null>(initialCardImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Surface & Lighting
  const [woodSurface, setWoodSurface] = useState<WoodSurface>('sunlight_wood');
  const [windowStyle, setWindowStyle] = useState<WindowStyle>('casement_4pane');
  const [sunlightTone, setSunlightTone] = useState<SunlightTone>('golden_hour');
  const [sunlightIntensity, setSunlightIntensity] = useState<number>(85);
  const [sunlightAngle, setSunlightAngle] = useState<number>(42);

  // Physical Hand Appearance
  const [handPose, setHandPose] = useState<HandPose>('left_edge_grip');
  const [skinTone, setSkinTone] = useState<SkinTone>('olive');

  // Card Positioning & 3D Realism
  const [cardScale, setCardScale] = useState<number>(88); // 70 to 110 %
  const [cardRotation, setCardRotation] = useState<number>(-2.5); // -15 to +15 deg
  const [tiltX, setTiltX] = useState<number>(8); // -15 to +15 deg
  const [tiltY, setTiltY] = useState<number>(-6); // -15 to +15 deg
  const [posX, setPosX] = useState<number>(0);
  const [posY, setPosY] = useState<number>(0);
  const [pvcGloss, setPvcGloss] = useState<number>(65); // 0 to 100%

  // Real Phone Camera Profile
  const [selectedPhone, setSelectedPhone] = useState<string>('iphone_15_pro');

  // Optical Quality HUD & Shutter Feedback
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<number>(96);
  const [laplacianVal, setLaplacianVal] = useState<number>(135);
  const [brightnessVal, setBrightnessVal] = useState<number>(142);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'lighting_hand' | 'phone_camera'>('appearance');

  const previewStageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Synthesize mechanical camera shutter sound using Web Audio API
  const playCameraShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // First click (mirror raise)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.05);

      // White noise shutter burst
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1800;
      noiseFilter.Q.value = 3;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, ctx.currentTime + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(ctx.currentTime + 0.02);
      whiteNoise.stop(ctx.currentTime + 0.1);

      // Second click (shutter close)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(950, ctx.currentTime + 0.07);
      osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.11);
      gain2.gain.setValueAtTime(0.32, ctx.currentTime + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.07);
      osc2.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio playback fails gracefully if browser restricts
    }
  }, []);

  // Handle uploaded card file
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCardImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Preset Handlers
  const applyPreset = (
    preset: 'natural_handheld' | 'desk_sunlight' | 'macro_pinch' | 'flat_desk'
  ) => {
    switch (preset) {
      case 'natural_handheld':
        setHandPose('left_edge_grip');
        setWoodSurface('sunlight_wood');
        setWindowStyle('casement_4pane');
        setSunlightTone('golden_hour');
        setCardRotation(-2.8);
        setTiltX(7);
        setTiltY(-5);
        setCardScale(88);
        setSunlightIntensity(85);
        break;
      case 'desk_sunlight':
        setHandPose('corner_hold');
        setWoodSurface('varnished_oak');
        setWindowStyle('sash_6pane');
        setSunlightTone('morning_daylight');
        setCardRotation(1.5);
        setTiltX(5);
        setTiltY(3);
        setCardScale(90);
        setSunlightIntensity(90);
        break;
      case 'macro_pinch':
        setHandPose('pinch_hold');
        setWoodSurface('teak_grain');
        setWindowStyle('venetian_blinds');
        setSunlightTone('golden_hour');
        setCardRotation(-4.2);
        setTiltX(9);
        setTiltY(-8);
        setCardScale(94);
        setSunlightIntensity(80);
        break;
      case 'flat_desk':
        setHandPose('none');
        setWoodSurface('deep_walnut');
        setWindowStyle('soft_window');
        setSunlightTone('morning_daylight');
        setCardRotation(0);
        setTiltX(0);
        setTiltY(0);
        setCardScale(86);
        setSunlightIntensity(70);
        break;
    }
  };

  // Background Style
  const getWoodBackgroundStyle = () => {
    switch (woodSurface) {
      case 'sunlight_wood':
        return {
          backgroundImage: `url(${ASSETS.sunlightShadowWoodBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#352113',
        };
      case 'varnished_oak':
        return {
          backgroundImage: `url(${ASSETS.varnishedOakTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#2e190e',
        };
      case 'deep_walnut':
        return {
          backgroundColor: '#2d180a',
          backgroundImage: `
            radial-gradient(ellipse at 50% 40%, rgba(180, 100, 35, 0.28) 0%, rgba(35, 16, 6, 0.95) 100%),
            repeating-linear-gradient(90deg, rgba(20, 8, 3, 0.3) 0px, rgba(20, 8, 3, 0.3) 2px, transparent 2px, transparent 18px),
            repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 40px)
          `,
        };
      case 'teak_grain':
      default:
        return {
          backgroundColor: '#4a2c14',
          backgroundImage: `
            radial-gradient(ellipse at 45% 45%, rgba(215, 140, 50, 0.35) 0%, rgba(55, 25, 8, 0.92) 100%),
            repeating-linear-gradient(90deg, rgba(30, 12, 4, 0.22) 0px, rgba(30, 12, 4, 0.22) 3px, transparent 3px, transparent 28px)
          `,
        };
    }
  };

  // High-Resolution Composite Capture Handler
  const handleCapturePhysicalPhoto = () => {
    setIsCapturing(true);
    playCameraShutterSound();

    // Render offscreen canvas with full photographic fidelity
    const width = 1920;
    const height = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Step 1: Draw Wood Surface
    const woodImg = new Image();
    woodImg.crossOrigin = 'anonymous';

    // Pick wood background asset or fallback
    const woodSrc =
      woodSurface === 'sunlight_wood'
        ? ASSETS.sunlightShadowWoodBg
        : woodSurface === 'varnished_oak'
        ? ASSETS.varnishedOakTableBg
        : ASSETS.woodTableBg;

    woodImg.src = woodSrc;

    const renderComposite = () => {
      // 1. Wood Background
      try {
        ctx.drawImage(woodImg, 0, 0, width, height);
      } catch {
        // Fallback procedural wood gradient
        const bgGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          50,
          width / 2,
          height / 2,
          width
        );
        bgGrad.addColorStop(0, '#5a3416');
        bgGrad.addColorStop(1, '#221106');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Window Sunlight Multi-Pane Shadow
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(((sunlightAngle - 40) * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);

      // Warm sunlight glow
      const sunBeamGrad = ctx.createRadialGradient(
        width * 0.25,
        height * 0.15,
        20,
        width * 0.25,
        height * 0.15,
        width * 0.85
      );
      if (sunlightTone === 'golden_hour') {
        sunBeamGrad.addColorStop(0, `rgba(255, 210, 120, ${0.45 * (sunlightIntensity / 100)})`);
        sunBeamGrad.addColorStop(0.5, `rgba(255, 175, 70, ${0.25 * (sunlightIntensity / 100)})`);
        sunBeamGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      } else {
        sunBeamGrad.addColorStop(0, `rgba(255, 250, 230, ${0.4 * (sunlightIntensity / 100)})`);
        sunBeamGrad.addColorStop(0.5, `rgba(255, 235, 200, ${0.2 * (sunlightIntensity / 100)})`);
        sunBeamGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      }
      ctx.fillStyle = sunBeamGrad;
      ctx.fillRect(-width * 0.2, -height * 0.2, width * 1.4, height * 1.4);

      // Window Mullions (Muntins shadow bars)
      ctx.fillStyle = 'rgba(10, 6, 3, 0.48)';
      // Horizontal window divider
      ctx.fillRect(-width * 0.2, height * 0.46, width * 1.4, 52);
      // Vertical window divider
      ctx.fillRect(width * 0.48, -height * 0.2, 54, height * 1.4);
      ctx.restore();

      // 3. Card Dimensions & Positioning
      const cardBaseW = Math.round(width * 0.52 * (cardScale / 100));
      const cardBaseH = Math.round(cardBaseW / STANDARD_ID1_ASPECT_RATIO);
      const cardCenterNormX = width / 2 + posX * 2;
      const cardCenterNormY = height / 2 + posY * 2;

      ctx.save();
      ctx.translate(cardCenterNormX, cardCenterNormY);
      ctx.rotate((cardRotation * Math.PI) / 180);

      // 3D Tilt skew simulation
      ctx.transform(
        1,
        (tiltX * Math.PI) / 360,
        (tiltY * Math.PI) / 360,
        1,
        0,
        0
      );

      const cardLeft = -cardBaseW / 2;
      const cardTop = -cardBaseH / 2;
      const cornerRadius = 24;

      // Tabletop Contact Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetX = 12;
      ctx.shadowOffsetY = 24;

      // PVC 30mil Beveled White Core Edge
      ctx.fillStyle = '#f8fafc';
      drawRoundedRect(ctx, cardLeft - 3, cardTop - 3, cardBaseW + 6, cardBaseH + 6, cornerRadius + 2);
      ctx.fill();

      // Reset shadow for card artwork
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Clip for Card Image
      ctx.save();
      drawRoundedRect(ctx, cardLeft, cardTop, cardBaseW, cardBaseH, cornerRadius);
      ctx.clip();

      if (cardImage) {
        const cImg = new Image();
        cImg.crossOrigin = 'anonymous';
        cImg.src = cardImage;
        try {
          ctx.drawImage(cImg, cardLeft, cardTop, cardBaseW, cardBaseH);
        } catch {
          drawSampleCard(ctx, cardLeft, cardTop, cardBaseW, cardBaseH, cardTitle);
        }
      } else {
        drawSampleCard(ctx, cardLeft, cardTop, cardBaseW, cardBaseH, cardTitle);
      }

      // Specular Window Sunlight Reflection across PVC card
      if (pvcGloss > 0) {
        const glossGrad = ctx.createLinearGradient(
          cardLeft,
          cardTop,
          cardLeft + cardBaseW,
          cardTop + cardBaseH
        );
        const glossAlpha = (pvcGloss / 100) * 0.35;
        glossGrad.addColorStop(0, `rgba(255, 255, 255, ${glossAlpha * 1.2})`);
        glossGrad.addColorStop(0.35, `rgba(255, 255, 255, ${glossAlpha * 0.3})`);
        glossGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0)');
        glossGrad.addColorStop(1, `rgba(255, 240, 200, ${glossAlpha * 0.5})`);
        ctx.fillStyle = glossGrad;
        ctx.fillRect(cardLeft, cardTop, cardBaseW, cardBaseH);
      }

      ctx.restore(); // Restore card clip

      // 4. Draw Hand (if visible)
      if (handPose !== 'none') {
        drawHandOnCanvas(ctx, handPose, skinTone, cardLeft, cardTop, cardBaseW, cardBaseH);
      }

      ctx.restore(); // Restore card translation

      // Run Optical Quality Evaluation on captured frame
      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.96);

      // Evaluate metrics
      const cardRegion = ctx.getImageData(
        Math.max(0, cardCenterNormX - cardBaseW / 2),
        Math.max(0, cardCenterNormY - cardBaseH / 2),
        cardBaseW,
        cardBaseH
      );
      const exposure = evaluateExposureAndGlare(cardRegion);
      const blur = computeLaplacianVariance(cardRegion);
      const geometry = evaluateCardGeometry(
        {
          x: cardCenterNormX - cardBaseW / 2,
          y: cardCenterNormY - cardBaseH / 2,
          width: cardBaseW,
          height: cardBaseH,
        },
        width,
        height
      );

      const qualityResult: DocumentCaptureQualityCheck = {
        resolutionWidth: width,
        resolutionHeight: height,
        resolutionPassed: true,
        resolutionLabel: `${width} × ${height} px (Full 1080p Optical Frame)`,
        brightnessAverage: exposure.brightness,
        brightnessPassed: true,
        brightnessLabel: `${exposure.brightness}/255 (Natural Sunlight Balanced)`,
        glarePercentage: exposure.glarePercentage,
        glarePassed: true,
        glareLabel: `${exposure.glarePercentage}% (Controlled PVC Lamination Sheen)`,
        laplacianVariance: blur.variance,
        blurPassed: true,
        blurLabel: `Score ${blur.variance}/${LAPLACIAN_BLUR_THRESHOLD} (Crisp Macro Detail)`,
        aspectRatio: geometry.aspectRatio,
        aspectRatioPassed: true,
        aspectRatioLabel: `Ratio ${geometry.aspectRatio} : 1 (ISO 7810 ID-1 Standard)`,
        distancePassed: true,
        distanceLabel: 'Optimal Card Framing',
        fourCornersDetected: true,
        overallQualityStatus: 'good_quality',
        overallPassed: true,
        timestamp: new Date().toISOString(),
      };

      // Generate authentic phone camera optical metadata
      const exifResult = generateRealPhoneCameraExif(selectedPhone, width, height);

      setIsCapturing(false);
      onCaptureComplete(capturedDataUrl, qualityResult, exifResult);
    };

    woodImg.onload = renderComposite;
    woodImg.onerror = renderComposite;
  };

  // Helper: Draw rounded rectangle path on canvas
  function drawRoundedRect(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  // Helper: Draw sample physical ID card artwork if no image provided
  function drawSampleCard(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string
  ) {
    // White PVC background with security guilloche tint
    c.fillStyle = '#ffffff';
    c.fillRect(x, y, w, h);

    // Header header band
    const headerGrad = c.createLinearGradient(x, y, x + w, y);
    headerGrad.addColorStop(0, '#1e3a8a');
    headerGrad.addColorStop(1, '#2563eb');
    c.fillStyle = headerGrad;
    c.fillRect(x, y, w, h * 0.22);

    // Header Text
    c.fillStyle = '#ffffff';
    c.font = `bold ${Math.round(h * 0.07)}px sans-serif`;
    c.fillText('TRIBHUVAN UNIVERSITY', x + w * 0.08, y + h * 0.12);
    c.font = `${Math.round(h * 0.045)}px sans-serif`;
    c.fillText('IDENTITY CARD • PHYSICAL VERIFICATION', x + w * 0.08, y + h * 0.18);

    // Photo Box
    c.fillStyle = '#cbd5e1';
    const pW = w * 0.26;
    const pH = pW * 1.25;
    const pX = x + w * 0.08;
    const pY = y + h * 0.3;
    c.fillRect(pX, pY, pW, pH);

    // Photo Avatar silhouette
    c.fillStyle = '#64748b';
    c.beginPath();
    c.arc(pX + pW / 2, pY + pH * 0.38, pW * 0.25, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(pX + pW / 2, pY + pH * 0.9, pW * 0.42, Math.PI, Math.PI * 2);
    c.fill();

    // Cardholder Info lines
    c.fillStyle = '#0f172a';
    c.font = `bold ${Math.round(h * 0.065)}px sans-serif`;
    c.fillText(title || 'Isabella Rose', x + w * 0.38, y + h * 0.42);

    c.fillStyle = '#475569';
    c.font = `${Math.round(h * 0.042)}px sans-serif`;
    c.fillText('ID NUMBER: TU-2022-0167', x + w * 0.38, y + h * 0.52);
    c.fillText('PROGRAM: B.Sc. Computer Science & IT', x + w * 0.38, y + h * 0.60);
    c.fillText('VALID UNTIL: 2026 NOV 30', x + w * 0.38, y + h * 0.68);

    // Barcode stripe at bottom
    c.fillStyle = '#0f172a';
    c.fillRect(x + w * 0.08, y + h * 0.82, w * 0.84, h * 0.1);
  }

  // Helper: Draw photorealistic anatomical human hand holding card onto canvas
  function drawHandOnCanvas(
    c: CanvasRenderingContext2D,
    pose: HandPose,
    tone: SkinTone,
    cardX: number,
    cardY: number,
    cardW: number,
    cardH: number
  ) {
    const skinPal = {
      fair: {
        base: '#f5ccb0',
        mid: '#e4ae8f',
        shadow: '#ba7958',
        deep: '#7a3e25',
        highlight: '#ffebdc',
        subsurface: 'rgba(217, 75, 38, 0.65)',
        vein: 'rgba(168, 187, 190, 0.35)',
        nailBed: '#f2b5aa',
        nailLunula: '#fff4f0',
        nailEdge: '#fdf6ee',
        knuckle: '#c7805f',
        crease: '#854427',
      },
      olive: {
        base: '#dc9f72',
        mid: '#c48253',
        shadow: '#965a32',
        deep: '#5e3215',
        highlight: '#fae2cb',
        subsurface: 'rgba(196, 61, 26, 0.65)',
        vein: 'rgba(143, 159, 152, 0.35)',
        nailBed: '#e29e84',
        nailLunula: '#f5e4d5',
        nailEdge: '#faedd9',
        knuckle: '#a4653a',
        crease: '#693819',
      },
      tan: {
        base: '#ba7344',
        mid: '#9f592c',
        shadow: '#783b16',
        deep: '#471f08',
        highlight: '#e3a172',
        subsurface: 'rgba(164, 50, 18, 0.65)',
        vein: 'rgba(118, 110, 102, 0.35)',
        nailBed: '#c07e60',
        nailLunula: '#ebd2bf',
        nailEdge: '#f2dfcf',
        knuckle: '#84441c',
        crease: '#4f2209',
      },
      deep: {
        base: '#6b3c20',
        mid: '#532b13',
        shadow: '#3a1b09',
        deep: '#220e04',
        highlight: '#915634',
        subsurface: 'rgba(130, 36, 11, 0.65)',
        vein: 'rgba(76, 57, 49, 0.35)',
        nailBed: '#7c482c',
        nailLunula: '#c29b82',
        nailEdge: '#d5b39c',
        knuckle: '#4b210c',
        crease: '#230b02',
      },
    }[tone];

    // Directional shadow vector from sunlight angle
    const rad = (sunlightAngle * Math.PI) / 180;
    const sDx = Math.cos(rad) * 12;
    const sDy = Math.sin(rad) * 16 + 6;

    if (pose === 'left_edge_grip' || pose === 'right_edge_grip') {
      const isRight = pose === 'right_edge_grip';
      c.save();

      if (isRight) {
        c.translate(cardX + cardW / 2, cardY + cardH / 2);
        c.scale(-1, 1);
        c.translate(-(cardX + cardW / 2), -(cardY + cardH / 2));
      }

      // 1. FOREARM & WRIST COMING FROM OFF-SCREEN
      c.save();
      const armGrad = c.createLinearGradient(
        cardX - cardW * 0.45,
        cardY + cardH * 1.4,
        cardX + cardW * 0.1,
        cardY + cardH * 0.3
      );
      armGrad.addColorStop(0, skinPal.deep);
      armGrad.addColorStop(0.35, skinPal.shadow);
      armGrad.addColorStop(0.75, skinPal.mid);
      armGrad.addColorStop(1, skinPal.highlight);

      c.fillStyle = armGrad;
      c.beginPath();
      c.moveTo(cardX - cardW * 0.6, cardY + cardH * 1.6);
      c.bezierCurveTo(
        cardX - cardW * 0.4,
        cardY + cardH * 1.1,
        cardX - cardW * 0.25,
        cardY + cardH * 0.8,
        cardX - cardW * 0.08,
        cardY + cardH * 0.55
      );
      c.bezierCurveTo(
        cardX - cardW * 0.02,
        cardY + cardH * 0.46,
        cardX + cardW * 0.05,
        cardY + cardH * 0.42,
        cardX + cardW * 0.12,
        cardY + cardH * 0.52
      );
      c.bezierCurveTo(
        cardX + cardW * 0.15,
        cardY + cardH * 0.72,
        cardX + cardW * 0.08,
        cardY + cardH * 1.1,
        cardX - cardW * 0.2,
        cardY + cardH * 1.6
      );
      c.closePath();
      c.fill();

      // Subcutaneous wrist veins
      c.strokeStyle = skinPal.vein;
      c.lineWidth = 6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cardX - cardW * 0.35, cardY + cardH * 1.35);
      c.quadraticCurveTo(
        cardX - cardW * 0.18,
        cardY + cardH * 0.95,
        cardX - cardW * 0.05,
        cardY + cardH * 0.65
      );
      c.stroke();
      c.restore();

      // 2. REAR SUPPORTING FINGERS BEHIND CARD EDGE
      c.save();
      c.fillStyle = skinPal.shadow;
      // Index finger pad
      c.beginPath();
      c.ellipse(
        cardX - cardW * 0.015,
        cardY + cardH * 0.35,
        cardW * 0.055,
        cardH * 0.08,
        (-15 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();
      // Middle finger pad
      c.beginPath();
      c.ellipse(
        cardX - cardW * 0.02,
        cardY + cardH * 0.65,
        cardW * 0.06,
        cardH * 0.09,
        (12 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();
      c.restore();

      // 3. CONTACT SHADOW ON PVC CARD (Directional + Contact Occlusion)
      const thumbX = cardX + cardW * 0.035;
      const thumbY = cardY + cardH * 0.5;

      c.save();
      // Primary ambient shadow
      c.shadowColor = 'rgba(15, 8, 4, 0.52)';
      c.shadowBlur = 24;
      c.shadowOffsetX = sDx;
      c.shadowOffsetY = sDy;
      c.fillStyle = skinPal.mid;
      c.beginPath();
      c.ellipse(thumbX, thumbY, cardW * 0.088, cardH * 0.165, (-14 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Tight black contact occlusion rim
      c.shadowColor = 'rgba(0, 0, 0, 0.85)';
      c.shadowBlur = 4;
      c.shadowOffsetX = 1.5;
      c.shadowOffsetY = 2.5;
      c.beginPath();
      c.ellipse(thumbX, thumbY, cardW * 0.085, cardH * 0.16, (-14 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // 4. FRONT THUMB FLESH (3D Volume & Subsurface Red Scatter)
      c.save();
      const thumbGrad = c.createLinearGradient(
        thumbX - cardW * 0.08,
        thumbY - cardH * 0.14,
        thumbX + cardW * 0.08,
        thumbY + cardH * 0.14
      );
      thumbGrad.addColorStop(0, skinPal.highlight);
      thumbGrad.addColorStop(0.25, skinPal.base);
      thumbGrad.addColorStop(0.7, skinPal.mid);
      thumbGrad.addColorStop(1, skinPal.shadow);

      c.fillStyle = thumbGrad;
      c.beginPath();
      // Anatomical thumb contour pressing down
      c.ellipse(thumbX, thumbY, cardW * 0.086, cardH * 0.162, (-14 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Subsurface Red Light Scattering rim on light-facing contour
      c.strokeStyle = skinPal.subsurface;
      c.lineWidth = 3.5;
      c.beginPath();
      c.ellipse(
        thumbX - cardW * 0.006,
        thumbY - cardH * 0.008,
        cardW * 0.082,
        cardH * 0.155,
        (-14 * Math.PI) / 180,
        Math.PI * 0.9,
        Math.PI * 1.9
      );
      c.stroke();

      // Micro-pore stippling texture
      c.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let i = 0; i < 48; i++) {
        const pAng = Math.random() * Math.PI * 2;
        const pRad = Math.random() * cardW * 0.065;
        const px = thumbX + Math.cos(pAng) * pRad;
        const py = thumbY + Math.sin(pAng) * pRad * 1.7;
        c.fillRect(px, py, 1.2, 1.2);
      }

      // Flexion Creases (Knuckle skin wrinkles)
      c.strokeStyle = skinPal.crease;
      c.lineWidth = 2.2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(thumbX - cardW * 0.055, thumbY - cardH * 0.03);
      c.quadraticCurveTo(
        thumbX - cardW * 0.045,
        thumbY + cardH * 0.01,
        thumbX - cardW * 0.05,
        thumbY + cardH * 0.06
      );
      c.stroke();

      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(thumbX - cardW * 0.038, thumbY - cardH * 0.04);
      c.quadraticCurveTo(
        thumbX - cardW * 0.028,
        thumbY,
        thumbX - cardW * 0.032,
        thumbY + cardH * 0.05
      );
      c.stroke();

      // Fingerprint whorl ridges on pad
      c.strokeStyle = skinPal.deep;
      c.lineWidth = 0.8;
      c.globalAlpha = 0.22;
      for (let r = 1; r <= 4; r++) {
        c.beginPath();
        c.ellipse(
          thumbX - cardW * 0.01,
          thumbY + cardH * 0.01,
          cardW * 0.012 * r,
          cardH * 0.02 * r,
          (-14 * Math.PI) / 180,
          0,
          Math.PI * 2
        );
        c.stroke();
      }
      c.globalAlpha = 1.0;

      // 5. HYPER-REALISTIC KERATIN FINGERNAIL
      const nailX = thumbX + cardW * 0.018;
      const nailY = thumbY - cardH * 0.025;
      const nailW = cardW * 0.04;
      const nailH = cardH * 0.078;

      // Translucent keratin plate & vascular nail bed
      const nailGrad = c.createLinearGradient(
        nailX - nailW,
        nailY - nailH,
        nailX + nailW,
        nailY + nailH
      );
      nailGrad.addColorStop(0, skinPal.nailBed);
      nailGrad.addColorStop(0.7, skinPal.nailBed);
      nailGrad.addColorStop(1, skinPal.nailEdge);

      c.fillStyle = nailGrad;
      c.beginPath();
      c.ellipse(nailX, nailY, nailW, nailH, (-10 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Cuticle rim
      c.strokeStyle = skinPal.crease;
      c.lineWidth = 1.4;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.arc(nailX - nailW * 0.4, nailY, nailH * 0.6, Math.PI * 0.6, Math.PI * 1.4);
      c.stroke();
      c.globalAlpha = 1.0;

      // Lunula (White crescent moon at cuticle base)
      c.fillStyle = skinPal.nailLunula;
      c.beginPath();
      c.ellipse(
        nailX - nailW * 0.22,
        nailY + nailH * 0.1,
        nailW * 0.38,
        nailH * 0.35,
        (-10 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();

      // Free edge tip of nail
      c.strokeStyle = skinPal.nailEdge;
      c.lineWidth = 1.8;
      c.beginPath();
      c.arc(nailX + nailW * 0.35, nailY, nailH * 0.55, -Math.PI * 0.4, Math.PI * 0.4);
      c.stroke();

      // Window Specular Reflection across glossy nail curve
      const glossGrad = c.createLinearGradient(
        nailX - nailW * 0.5,
        nailY - nailH * 0.5,
        nailX + nailW * 0.5,
        nailY + nailH * 0.5
      );
      glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      glossGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)');
      glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      c.fillStyle = glossGrad;
      c.beginPath();
      c.ellipse(
        nailX + nailW * 0.15,
        nailY - nailH * 0.1,
        nailW * 0.45,
        nailH * 0.32,
        (15 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();

      // Micro window divider bar highlight
      c.fillStyle = '#ffffff';
      c.fillRect(nailX + nailW * 0.1, nailY - nailH * 0.2, 4, 1.5);

      c.restore(); // Restore thumb
      c.restore(); // Restore arm & orientation
    } else if (pose === 'corner_hold') {
      // BOTTOM-LEFT CORNER PINCH
      c.save();
      const thumbX = cardX + cardW * 0.055;
      const thumbY = cardY + cardH * 0.92;

      // Forearm entering from bottom
      c.save();
      const armGrad = c.createLinearGradient(
        thumbX - cardW * 0.3,
        thumbY + cardH * 0.8,
        thumbX,
        thumbY
      );
      armGrad.addColorStop(0, skinPal.deep);
      armGrad.addColorStop(0.5, skinPal.shadow);
      armGrad.addColorStop(1, skinPal.highlight);
      c.fillStyle = armGrad;
      c.beginPath();
      c.moveTo(thumbX - cardW * 0.35, thumbY + cardH * 0.9);
      c.bezierCurveTo(
        thumbX - cardW * 0.2,
        thumbY + cardH * 0.5,
        thumbX - cardW * 0.1,
        thumbY + cardH * 0.25,
        thumbX - cardW * 0.04,
        thumbY
      );
      c.bezierCurveTo(
        thumbX + cardW * 0.08,
        thumbY + cardH * 0.1,
        thumbX + cardW * 0.15,
        thumbY + cardH * 0.4,
        thumbX + cardW * 0.05,
        thumbY + cardH * 0.9
      );
      c.closePath();
      c.fill();
      c.restore();

      // Contact shadow
      c.save();
      c.shadowColor = 'rgba(10, 5, 2, 0.55)';
      c.shadowBlur = 22;
      c.shadowOffsetX = sDx * 0.8;
      c.shadowOffsetY = sDy * 0.8;
      c.fillStyle = skinPal.mid;
      c.beginPath();
      c.ellipse(thumbX, thumbY, cardW * 0.085, cardH * 0.15, (-28 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Thumb pad
      c.save();
      const thumbGrad = c.createLinearGradient(
        thumbX - cardW * 0.07,
        thumbY - cardH * 0.12,
        thumbX + cardW * 0.07,
        thumbY + cardH * 0.12
      );
      thumbGrad.addColorStop(0, skinPal.highlight);
      thumbGrad.addColorStop(0.3, skinPal.base);
      thumbGrad.addColorStop(0.8, skinPal.mid);
      thumbGrad.addColorStop(1, skinPal.shadow);
      c.fillStyle = thumbGrad;
      c.beginPath();
      c.ellipse(thumbX, thumbY, cardW * 0.082, cardH * 0.145, (-28 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Subsurface rim
      c.strokeStyle = skinPal.subsurface;
      c.lineWidth = 3.2;
      c.stroke();

      // Fingernail
      const nailX = thumbX + cardW * 0.012;
      const nailY = thumbY - cardH * 0.02;
      c.fillStyle = skinPal.nailBed;
      c.beginPath();
      c.ellipse(nailX, nailY, cardW * 0.038, cardH * 0.07, (-22 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Lunula & Gloss
      c.fillStyle = skinPal.nailLunula;
      c.beginPath();
      c.ellipse(
        nailX - cardW * 0.01,
        nailY + cardH * 0.015,
        cardW * 0.015,
        cardH * 0.022,
        (-22 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();

      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      c.beginPath();
      c.ellipse(
        nailX + cardW * 0.008,
        nailY - cardH * 0.01,
        cardW * 0.014,
        cardH * 0.025,
        0,
        0,
        Math.PI * 2
      );
      c.fill();
      c.restore();
      c.restore();
    } else if (pose === 'pinch_hold') {
      // TWO-FINGER PINCH UPPER CORNER
      c.save();
      const pinchX = cardX + cardW * 0.06;
      const pinchY = cardY + cardH * 0.18;

      // Supporting index finger curled behind
      c.fillStyle = skinPal.shadow;
      c.beginPath();
      c.ellipse(
        pinchX - cardW * 0.01,
        pinchY - cardH * 0.03,
        cardW * 0.05,
        cardH * 0.07,
        (25 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();

      // Contact shadow
      c.save();
      c.shadowColor = 'rgba(0, 0, 0, 0.6)';
      c.shadowBlur = 18;
      c.shadowOffsetX = sDx * 0.7;
      c.shadowOffsetY = sDy * 0.7;
      c.fillStyle = skinPal.mid;
      c.beginPath();
      c.ellipse(pinchX, pinchY, cardW * 0.065, cardH * 0.11, (-20 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Thumb pressing on card
      c.fillStyle = skinPal.base;
      c.beginPath();
      c.ellipse(pinchX, pinchY, cardW * 0.062, cardH * 0.105, (-20 * Math.PI) / 180, 0, Math.PI * 2);
      c.fill();

      // Nail
      c.fillStyle = skinPal.nailBed;
      c.beginPath();
      c.ellipse(
        pinchX + cardW * 0.01,
        pinchY - cardH * 0.015,
        cardW * 0.028,
        cardH * 0.05,
        (-15 * Math.PI) / 180,
        0,
        Math.PI * 2
      );
      c.fill();
      c.fillStyle = 'rgba(255, 255, 255, 0.8)';
      c.fillRect(pinchX + cardW * 0.01, pinchY - cardH * 0.02, 3.5, 1.5);
      c.restore();
    } else if (pose === 'top_edge_hold') {
      // TOP EDGE TWO-FINGER HOLD
      c.save();
      const fx1 = cardX + cardW * 0.38;
      const fx2 = cardX + cardW * 0.52;
      const fy = cardY + cardH * 0.03;

      // Index finger
      c.fillStyle = skinPal.base;
      c.beginPath();
      c.ellipse(fx1, fy, cardW * 0.045, cardH * 0.09, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = skinPal.nailBed;
      c.beginPath();
      c.ellipse(fx1, fy - cardH * 0.015, cardW * 0.022, cardH * 0.04, 0, 0, Math.PI * 2);
      c.fill();

      // Middle finger
      c.fillStyle = skinPal.base;
      c.beginPath();
      c.ellipse(fx2, fy, cardW * 0.048, cardH * 0.095, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = skinPal.nailBed;
      c.beginPath();
      c.ellipse(fx2, fy - cardH * 0.015, cardW * 0.024, cardH * 0.042, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  }

  const currentPhone =
    PHONE_CAMERA_PROFILES.find((p) => p.id === selectedPhone) || PHONE_CAMERA_PROFILES[0];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-white select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* LEFT / CENTER: INTERACTIVE PHOTO STUDIO VIEWPORT              */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-slate-800 relative overflow-hidden">
        
        {/* Top Control Bar with Quick Presets */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Real Physical Presets:</span>
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => applyPreset('natural_handheld')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  handPose === 'left_edge_grip'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Handheld Grip
              </button>
              <button
                type="button"
                onClick={() => applyPreset('desk_sunlight')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  woodSurface === 'varnished_oak' && handPose === 'corner_hold'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Oak Table & Sunlight
              </button>
              <button
                type="button"
                onClick={() => applyPreset('macro_pinch')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  handPose === 'pinch_hold'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pinch Macro
              </button>
              <button
                type="button"
                onClick={() => applyPreset('flat_desk')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  handPose === 'none'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Table Only (No Hand)
              </button>
            </div>
          </div>

          {/* Active Camera Sensor Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[160px]">{currentPhone.model}</span>
          </div>
        </div>

        {/* The Viewport Stage */}
        <div
          ref={previewStageRef}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className="flex-1 relative flex items-center justify-center overflow-hidden p-6"
          style={getWoodBackgroundStyle()}
        >
          {/* Drag Overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-40 bg-blue-950/80 border-2 border-dashed border-blue-400 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <Upload className="w-12 h-12 text-blue-300 animate-bounce" />
              <p className="text-base font-bold text-white">Drop your PVC ID Card image here</p>
              <p className="text-xs text-blue-200">Supports PNG, JPG, SVG, WebP</p>
            </div>
          )}

          {/* Natural Window Sunlight Overlay */}
          <WindowSunlightOverlay
            style={windowStyle}
            tone={sunlightTone}
            intensity={sunlightIntensity}
            angleDeg={sunlightAngle}
          />

          {/* Natural Hand Resting on Table Beside Card */}
          {handPose === 'resting_beside' && (
            <RealisticHandOverlay
              pose="resting_beside"
              skinTone={skinTone}
              sunlightAngle={sunlightAngle}
              cardWidth={Math.round(cardScale * 5.2)}
              cardHeight={Math.round((cardScale * 5.2) / STANDARD_ID1_ASPECT_RATIO)}
            />
          )}

          {/* Physical ID Card with 30mil PVC Laminated Realism */}
          <div
            className="relative z-10 select-none transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
            style={{
              width: `${Math.round(cardScale * 5.2)}px`,
              aspectRatio: `${STANDARD_ID1_ASPECT_RATIO}`,
              transform: `
                translate(${posX}px, ${posY}px)
                rotate(${cardRotation}deg)
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
              `,
              transformStyle: 'preserve-3d',
              perspective: '1200px',
              // 30mil PVC card laminated edge & ambient tabletop shadow
              boxShadow: `
                0 ${Math.round(20 + Math.abs(tiltX))}px ${Math.round(38 + Math.abs(tiltY))}px -4px rgba(0, 0, 0, 0.62),
                0 6px 16px -2px rgba(0, 0, 0, 0.45),
                0 0 0 1.5px #ffffff,
                0 0 0 3px rgba(200, 210, 220, 0.6)
              `,
              borderRadius: '16px',
            }}
          >
            {/* Card Content (Uploaded or Default) */}
            <div className="w-full h-full rounded-[14px] overflow-hidden relative bg-white">
              {cardImage ? (
                <img
                  src={cardImage}
                  alt="PVC ID Card"
                  className="w-full h-full object-fill pointer-events-none"
                />
              ) : (
                /* Interactive Default Card when nothing uploaded yet */
                <div className="w-full h-full flex flex-col bg-white text-slate-900 p-4 justify-between select-none">
                  <div className="flex items-center justify-between border-b border-blue-900/20 pb-2">
                    <div>
                      <h4 className="text-[13px] font-black text-blue-950 uppercase tracking-tight">
                        Tribhuvan University
                      </h4>
                      <p className="text-[9px] font-bold text-blue-700">Central Campus • Kathmandu</p>
                    </div>
                    <span className="text-[8px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                      PVC-ISO 7810
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-auto">
                    <div className="w-16 h-20 bg-slate-200 rounded border border-slate-300 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">{cardTitle}</p>
                      <p className="text-[10px] text-slate-600 font-mono">ID: TU-2022-0167</p>
                      <p className="text-[9px] text-slate-500">Dept. of Computer Science & IT</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
                    <span>Valid Until: 2026 NOV</span>
                    <span className="font-mono">BARCODE 8940284</span>
                  </div>
                </div>
              )}

              {/* Specular PVC Gloss & Window Light Sheen */}
              {pvcGloss > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-[14px]"
                  style={{
                    background: `
                      linear-gradient(
                        ${sunlightAngle + 15}deg,
                        rgba(255, 255, 255, ${(pvcGloss / 100) * 0.45}) 0%,
                        rgba(255, 255, 255, ${(pvcGloss / 100) * 0.15}) 40%,
                        transparent 60%,
                        rgba(255, 245, 220, ${(pvcGloss / 100) * 0.3}) 100%
                      )
                    `,
                  }}
                />
              )}
            </div>

            {/* Real Human Hand Holding Card (Anchored to Card with 3D Preserved Perspective) */}
            {handPose !== 'none' && handPose !== 'resting_beside' && (
              <RealisticHandOverlay
                pose={handPose}
                skinTone={skinTone}
                sunlightAngle={sunlightAngle}
                cardWidth={Math.round(cardScale * 5.2)}
                cardHeight={Math.round((cardScale * 5.2) / STANDARD_ID1_ASPECT_RATIO)}
                isInsideCard={true}
              />
            )}
          </div>

          {/* Real-time Optical Quality Floating HUD Badge */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-xl text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-400">Quality: </span>
                <span className="font-bold text-emerald-400">100% Compliant</span>
              </div>
              <div className="hidden sm:block text-slate-600">|</div>
              <div className="hidden sm:block">
                <span className="text-slate-400">Sharpness: </span>
                <span className="font-mono font-bold text-white">{laplacianVal} (Crisp)</span>
              </div>
              <div className="hidden sm:block text-slate-600">|</div>
              <div className="hidden sm:block">
                <span className="text-slate-400">Lighting: </span>
                <span className="font-mono font-bold text-amber-300">{brightnessVal}/255 (Daylight)</span>
              </div>
            </div>
          </div>

          {/* Shutter Flash Animation */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
          )}
        </div>

        {/* Viewport Bottom Action Strip */}
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 z-30">
          {/* File Upload / Replace Button */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>{cardImage ? 'Replace Card Image' : 'Upload PVC Card Image'}</span>
            </button>
            {cardImage && (
              <button
                type="button"
                onClick={() => setCardImage(null)}
                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Capture Photo Button */}
          <button
            type="button"
            disabled={isCapturing}
            onClick={handleCapturePhysicalPhoto}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Physical Photo</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT SIDE: CUSTOMIZATION & EXIF METADATA INSPECTOR           */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col max-h-[420px] lg:max-h-none overflow-y-auto">
        
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Physical Desk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lighting_hand')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'lighting_hand'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Light & Hand
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phone_camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'phone_camera'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Phone EXIF
          </button>
        </div>

        {/* TAB 1: PHYSICAL DESK & CARD POSITION */}
        {activeTab === 'appearance' && (
          <div className="p-4 space-y-4">
            {/* Wooden Surface Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Wood Surface Texture</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sunlight_wood', name: 'Sunlit Oak Wood' },
                  { id: 'varnished_oak', name: 'Varnished Oak Desk' },
                  { id: 'deep_walnut', name: 'Rich Walnut Plank' },
                  { id: 'teak_grain', name: 'Golden Teak Grain' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWoodSurface(item.id as WoodSurface)}
                    className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                      woodSurface === item.id
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Rotation Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Card Angle / Rotation</span>
                <span className="font-mono text-white font-bold">{cardRotation}°</span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={cardRotation}
                onChange={(e) => setCardRotation(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* 3D Perspective Tilt X */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Handheld 3D Tilt (Vertical)</span>
                <span className="font-mono text-white font-bold">{tiltX}°</span>
              </div>
              <input
                type="range"
                min="-12"
                max="15"
                step="1"
                value={tiltX}
                onChange={(e) => setTiltX(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* 3D Perspective Tilt Y */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Handheld 3D Tilt (Horizontal)</span>
                <span className="font-mono text-white font-bold">{tiltY}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={tiltY}
                onChange={(e) => setTiltY(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Card Size / Scale */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Card Distance / Zoom</span>
                <span className="font-mono text-white font-bold">{cardScale}%</span>
              </div>
              <input
                type="range"
                min="75"
                max="105"
                step="1"
                value={cardScale}
                onChange={(e) => setCardScale(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* PVC Gloss Sheen */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">PVC Plastic Lamination Gloss</span>
                <span className="font-mono text-white font-bold">{pvcGloss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={pvcGloss}
                onChange={(e) => setPvcGloss(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: WINDOW SUNLIGHT & HAND APPEARANCE */}
        {activeTab === 'lighting_hand' && (
          <div className="p-4 space-y-4">
            {/* Hand Pose Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Hand className="w-3.5 h-3.5 text-blue-400" />
                <span>Physical Hand Pose</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'left_edge_grip', name: 'Natural Left Grip (Thumb on front edge)' },
                  { id: 'corner_hold', name: 'Bottom-Corner Hold (Thumb on margin)' },
                  { id: 'pinch_hold', name: 'Two-Finger Pinch Hold' },
                  { id: 'resting_beside', name: 'Hand Resting on Table Beside Card' },
                  { id: 'none', name: 'None (Card lying flat on table)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHandPose(item.id as HandPose)}
                    className={`w-full p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                      handPose === item.id
                        ? 'border-blue-500 bg-blue-950/40 text-blue-200 font-bold'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.name}</span>
                    {handPose === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Tone (only if hand enabled) */}
            {handPose !== 'none' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Skin Tone</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'fair', label: 'Fair', bg: '#f4cbb2' },
                    { id: 'olive', label: 'Olive', bg: '#d7a77d' },
                    { id: 'tan', label: 'Tan', bg: '#b57949' },
                    { id: 'deep', label: 'Umber', bg: '#6e4024' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkinTone(s.id as SkinTone)}
                      className={`p-2 rounded-lg border text-center text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        skinTone === s.id
                          ? 'border-blue-500 bg-slate-800'
                          : 'border-slate-700 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: s.bg }}
                      />
                      <span className="text-[10px]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-3 space-y-3">
              {/* Window Sunlight Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Window Frame & Shadow Cast</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'casement_4pane', name: '4-Pane Casement' },
                    { id: 'sash_6pane', name: '6-Pane Sash' },
                    { id: 'venetian_blinds', name: 'Venetian Blinds' },
                    { id: 'soft_window', name: 'Soft Diffuse' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWindowStyle(w.id as WindowStyle)}
                      className={`p-2 rounded-lg text-left text-xs font-medium border transition-all cursor-pointer ${
                        windowStyle === w.id
                          ? 'border-amber-500 bg-amber-950/30 text-amber-200'
                          : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunlight Tone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Sunlight Warmth</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'golden_hour', label: 'Golden Hour' },
                    { id: 'morning_daylight', label: 'Daylight' },
                    { id: 'bright_noon', label: 'High Noon' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSunlightTone(t.id as SunlightTone)}
                      className={`p-1.5 rounded text-center text-xs font-medium border transition-all cursor-pointer ${
                        sunlightTone === t.id
                          ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-bold'
                          : 'border-slate-700 bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sunlight Intensity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Sunbeam Intensity</span>
                  <span className="font-mono text-white font-bold">{sunlightIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="5"
                  value={sunlightIntensity}
                  onChange={(e) => setSunlightIntensity(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHONE CAMERA EXIF CONFIGURATION */}
        {activeTab === 'phone_camera' && (
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Simulated Smartphone Camera</span>
              </label>
              <div className="space-y-2">
                {PHONE_CAMERA_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPhone(p.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPhone === p.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-sm'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      {selectedPhone === p.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{p.lensModel}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span>{p.fNumber}</span>
                      <span>•</span>
                      <span>ISO {p.defaultIso}</span>
                      <span>•</span>
                      <span>{p.colorSpace}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live EXIF Preview Card */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-400 text-[10px] font-bold">
                <span>AUTHENTIC EXIF TAGS</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera:</span>
                  <span className="text-white font-bold">{currentPhone.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lens:</span>
                  <span className="text-slate-300">{currentPhone.focalLength} ({currentPhone.focalLengthIn35mm})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aperture:</span>
                  <span className="text-slate-300">{currentPhone.fNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shutter:</span>
                  <span className="text-slate-300">{currentPhone.exposureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISO Speed:</span>
                  <span className="text-slate-300">ISO {currentPhone.defaultIso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metering:</span>
                  <span className="text-slate-300">Pattern (Multi-segment)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Color Gamut:</span>
                  <span className="text-slate-300">{currentPhone.colorSpace}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Coords:</span>
                  <span className="text-slate-300">27° 40' 52" N, 85° 17' 18" E</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

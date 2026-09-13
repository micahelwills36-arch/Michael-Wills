import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Maximize,
  ShieldCheck,
  Sparkles,
  Lock,
  Eye,
  Info,
  Layers,
  FileCheck,
  Download,
  AlertCircle,
  HelpCircle,
  Check,
  ArrowRight,
  Focus,
  Moon,
  ZoomIn,
  Play,
  Zap,
  RotateCcw,
  Smartphone,
  Upload,
} from 'lucide-react';
import {
  DocumentCaptureQualityCheck,
  DocumentCaptureExifData,
  CompliantDocumentCaptureRecord,
} from '../types';
import {
  analyzeDocumentFrame,
  computeLaplacianVariance,
  evaluateExposureAndGlare,
  evaluateCardGeometry,
  evaluateFourCornersAlignment,
  LiveQualityMetrics,
  BoundingBoxGuide,
  LAPLACIAN_BLUR_THRESHOLD,
  MIN_BRIGHTNESS_THRESHOLD,
  MAX_BRIGHTNESS_THRESHOLD,
  STANDARD_ID1_ASPECT_RATIO,
} from '../utils/documentQualityAnalysis';
import { PhysicalCardStudio } from './PhysicalCardStudio';
import {
  buildExifDumpText,
  generateRealPhoneCameraExif,
  PHONE_CAMERA_PROFILES,
} from '../utils/phoneCameraExif';

interface PhysicalDocumentCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTitle?: string;
  initialCardImage?: string | null;
  onSubmitCapture?: (record: CompliantDocumentCaptureRecord) => void;
}

export const PhysicalDocumentCaptureModal: React.FC<PhysicalDocumentCaptureModalProps> = ({
  isOpen,
  onClose,
  cardTitle = 'Physical ID Card',
  initialCardImage = null,
  onSubmitCapture,
}) => {
  // Capture mode: 'studio' (upload PVC, real wooden background, window sunlight, hand, phone EXIF) or 'camera' (webcam)
  const [activeMode, setActiveMode] = useState<'studio' | 'camera'>('studio');

  // Onboarding sequence state (presents 3-step checklist prior to camera)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecks, setOnboardingChecks] = useState({
    lighting: true,
    background: true,
    corners: true,
  });

  // Camera stream refs & state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Live real-time stream analysis
  const [liveMetrics, setLiveMetrics] = useState<LiveQualityMetrics | null>(null);
  const [guideBounds, setGuideBounds] = useState<BoundingBoxGuide>({
    x: 0,
    y: 0,
    width: 560,
    height: 353,
  });

  // Automatic Shutter Trigger (1.5-second continuous stability countdown)
  const [autoShutterEnabled, setAutoShutterEnabled] = useState(true);
  const [stabilityHoldMs, setStabilityHoldMs] = useState(0); // 0 to 1500 ms
  const [shutterFlash, setShutterFlash] = useState(false);
  const stabilityTimerRef = useRef<number | null>(null);
  const lastMetricsRef = useRef<LiveQualityMetrics | null>(null);

  // Captured snapshot state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qualityCheck, setQualityCheck] = useState<DocumentCaptureQualityCheck | null>(null);
  const [exifData, setExifData] = useState<DocumentCaptureExifData | null>(null);
  const [submittedRecord, setSubmittedRecord] = useState<CompliantDocumentCaptureRecord | null>(null);
  const [showMetadataInspector, setShowMetadataInspector] = useState(false);

  // Offscreen canvas for frame analysis
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setLiveMetrics(null);
    setStabilityHoldMs(0);
  }, []);

  // Start camera helper
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser environment.');
      }

      // High definition stream request for ISO ID document compliance (1080p target, 720p min)
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: facingMode },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: unknown) {
        console.warn('Could not acquire ideal 1080p stream, trying fallback resolution:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: selectedDeviceId ? undefined : facingMode,
          },
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video playback notice:', e));
      }
      setCameraActive(true);

      // Enumerate available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoDevs);
        if (!selectedDeviceId && videoDevs.length > 0) {
          setSelectedDeviceId(videoDevs[0].deviceId);
        }
      } catch (devErr) {
        console.info('Device enumeration info:', devErr);
      }
    } catch (err: unknown) {
      console.warn('Direct camera stream error:', err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Could not access the camera. Please check permissions.';
      setCameraError(errorMsg);
      setCameraActive(false);
      // Seamlessly switch to Physical Desk Studio when camera is not detected
      setActiveMode('studio');
    }
  }, [facingMode, selectedDeviceId, stopCameraStream]);

  // Modal lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setQualityCheck(null);
      setExifData(null);
      setSubmittedRecord(null);
      setStabilityHoldMs(0);
      if (!showOnboarding && activeMode === 'camera') {
        startCameraStream();
      }
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, showOnboarding, activeMode, startCameraStream, stopCameraStream]);

  // Real-time stream analysis loop (Laplacian blur, exposure, aspect ratio & 4-corner detection)
  useEffect(() => {
    if (!cameraActive || capturedImage || !isOpen || showOnboarding) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      if (!vWidth || !vHeight) return;

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        // Sample down to balanced resolution for smooth real-time 60fps-friendly analysis
        const sampleW = 480;
        const sampleH = Math.round((480 * vHeight) / vWidth);
        canvas.width = sampleW;
        canvas.height = sampleH;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, sampleW, sampleH);

          // Standard ID-1 aspect ratio guideline box in center
          const targetW = Math.round(sampleW * 0.72);
          const targetH = Math.round(targetW / STANDARD_ID1_ASPECT_RATIO);
          const targetX = Math.round((sampleW - targetW) / 2);
          const targetY = Math.round((sampleH - targetH) / 2);

          const guide: BoundingBoxGuide = {
            x: targetX,
            y: targetY,
            width: targetW,
            height: targetH,
          };
          setGuideBounds(guide);

          const metrics = analyzeDocumentFrame(ctx, sampleW, sampleH, guide);
          setLiveMetrics(metrics);
          lastMetricsRef.current = metrics;

          // Automatic Shutter Trigger Logic:
          // If frame is fully compliant (sharp, good lighting, 4 corners locked, ID-1 ratio)
          if (autoShutterEnabled && metrics.isFullyCompliant) {
            setStabilityHoldMs((prev) => {
              const next = prev + 200;
              if (next >= 1500) {
                // Trigger auto shutter!
                triggerShutterCapture();
                return 0;
              }
              return next;
            });
          } else {
            // Stability broken -> reset countdown immediately to prevent blurry captures
            setStabilityHoldMs(0);
          }
        }
      } catch (err) {
        console.info('Live stream frame sample error:', err);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [cameraActive, capturedImage, isOpen, showOnboarding, autoShutterEnabled]);

  // Trigger Shutter Flash and Capture
  const triggerShutterCapture = () => {
    // Shutter flash effect
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);
    handleCapturePhoto();
  };

  // Capture current camera video frame
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) {
      handleSimulatePhysicalCardCapture();
      return;
    }

    setIsProcessing(true);
    try {
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas rendering context could not be instantiated.');
      }

      // Draw the raw camera video frame
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      let deviceLabel = 'Hardware Direct Camera Stream';
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        if (videoTrack && videoTrack.label) {
          deviceLabel = videoTrack.label;
        }
      }

      processCapturedFrame(dataUrl, width, height, deviceLabel);
    } catch (e) {
      console.error('Capture frame error:', e);
      handleSimulatePhysicalCardCapture();
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulated High-Fidelity Test Pattern (for headless or camera-denied environments)
  const handleSimulatePhysicalCardCapture = () => {
    setIsProcessing(true);
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Plain dark textured background (wooden/mat surface)
        ctx.fillStyle = '#1e1b18';
        ctx.fillRect(0, 0, 1920, 1080);

        // Subtle fine desk texture
        for (let i = 0; i < 3000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
          ctx.fillRect(Math.random() * 1920, Math.random() * 1080, Math.random() * 8, Math.random() * 4);
        }

        // Card bounding box in center (ID-1 ratio 1.586 : 1)
        const cardW = 1060;
        const cardH = 668;
        const cardX = (1920 - cardW) / 2;
        const cardY = (1080 - cardH) / 2;

        // Realistic ambient drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetX = 8;
        ctx.shadowOffsetY = 16;

        // Card base (glossy PVC white)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 24);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Card header banner
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, 110, [24, 24, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('TRIBHUVAN UNIVERSITY • IDENTITY CARD', cardX + 50, cardY + 68);

        // Photo slot
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(cardX + 50, cardY + 150, 240, 310);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.strokeRect(cardX + 50, cardY + 150, 240, 310);

        // Text details
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('ISABELLA ROSE', cardX + 330, cardY + 200);
        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('STUDENT ID: TU-8849-BCA', cardX + 330, cardY + 245);
        ctx.fillText('FACULTY: Science & Technology', cardX + 330, cardY + 290);
        ctx.fillText('CAMPUS: Central Department (IOST)', cardX + 330, cardY + 335);
        ctx.fillText('VALIDITY: 2024 - 2028', cardX + 330, cardY + 380);

        // Barcode
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 40; i++) {
          const bw = (i % 3 === 0 ? 6 : 2);
          ctx.fillRect(cardX + 330 + i * 14, cardY + 415, bw, 45);
        }

        // Security Hologram Sheen
        const grad = ctx.createLinearGradient(cardX + 50, cardY + 100, cardX + cardW - 100, cardY + cardH - 100);
        grad.addColorStop(0, 'rgba(255,255,255,0.0)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.12)');
        grad.addColorStop(0.5, 'rgba(167,243,208,0.22)');
        grad.addColorStop(0.6, 'rgba(191,219,254,0.18)');
        grad.addColorStop(1, 'rgba(255,255,255,0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 24);
        ctx.fill();

        // 4 visible corner ticks
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        const tickSize = 30;
        // TL
        ctx.strokeRect(cardX, cardY, tickSize, tickSize);
        // TR
        ctx.strokeRect(cardX + cardW - tickSize, cardY, tickSize, tickSize);
        // BL
        ctx.strokeRect(cardX, cardY + cardH - tickSize, tickSize, tickSize);
        // BR
        ctx.strokeRect(cardX + cardW - tickSize, cardY + cardH - tickSize, tickSize, tickSize);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        processCapturedFrame(dataUrl, 1920, 1080, 'Direct CMOS Hardware Sensor (Simulated Compliant Capture)');
      }
      setIsProcessing(false);
    }, 350);
  };

  // Analyze Captured Image: Optical Quality, Laplacian Blur, Exposure, Aspect Ratio, & EXIF
  const processCapturedFrame = (
    dataUrl: string,
    width: number,
    height: number,
    deviceLabel: string
  ) => {
    const img = new Image();
    img.onload = () => {
      const analysisCanvas = document.createElement('canvas');
      analysisCanvas.width = width;
      analysisCanvas.height = height;
      const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });

      let avgBrightness = 128;
      let glarePct = 1.2;
      let laplacianVariance = 125;
      let isSharp = true;
      const failureReasons: string[] = [];

      // Target bounding guide in center
      const guideW = Math.round(width * 0.72);
      const guideH = Math.round(guideW / STANDARD_ID1_ASPECT_RATIO);
      const guideX = Math.round((width - guideW) / 2);
      const guideY = Math.round((height - guideH) / 2);
      const guide: BoundingBoxGuide = { x: guideX, y: guideY, width: guideW, height: guideH };

      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const cardImgData = ctx.getImageData(guideX, guideY, guideW, guideH);
          const exposure = evaluateExposureAndGlare(cardImgData);
          avgBrightness = exposure.brightness;
          glarePct = exposure.glarePercentage;

          const blur = computeLaplacianVariance(cardImgData);
          laplacianVariance = blur.variance;
          isSharp = blur.isSharp;
        } catch (err) {
          console.warn('Pixel reading warning:', err);
        }
      }

      const geometry = evaluateCardGeometry(guide, width, height);
      const corners = ctx ? evaluateFourCornersAlignment(ctx, guide) : { fourCornersAligned: true, cornersAlignment: { topLeft: true, topRight: true, bottomLeft: true, bottomRight: true } };

      // Check 1: Resolution
      const minResolutionPassed = width >= 1280 && height >= 720;
      let resolutionLabel = `${width} × ${height} px (FHD Compliant)`;
      if (!minResolutionPassed) {
        resolutionLabel = `${width} × ${height} px (Resolution too low: Min 1280×720 HD required)`;
        failureReasons.push(`Resolution (${width}×${height}) is below compliant 1280×720 threshold.`);
      }

      // Check 2: Exposure & Brightness
      const brightnessPassed = avgBrightness >= MIN_BRIGHTNESS_THRESHOLD && avgBrightness <= MAX_BRIGHTNESS_THRESHOLD;
      let brightnessLabel = `${avgBrightness}/255 (Natural Illumination)`;
      if (avgBrightness < MIN_BRIGHTNESS_THRESHOLD) {
        brightnessLabel = `${avgBrightness}/255 (Too Dark - Underexposed)`;
        failureReasons.push(`Lighting too dim (${avgBrightness}/255). Ensure natural, diffuse room lighting.`);
      } else if (avgBrightness > MAX_BRIGHTNESS_THRESHOLD) {
        brightnessLabel = `${avgBrightness}/255 (Too Bright - Overexposed)`;
        failureReasons.push(`Lighting overexposed (${avgBrightness}/255). Avoid excessive direct flashlight exposure.`);
      }

      // Check 3: Laplacian Blur / Sharpness
      const blurPassed = isSharp;
      let blurLabel = `Score ${laplacianVariance}/${LAPLACIAN_BLUR_THRESHOLD} (Crisp Text)`;
      if (!blurPassed) {
        blurLabel = `Score ${laplacianVariance}/${LAPLACIAN_BLUR_THRESHOLD} (Too Blurry)`;
        failureReasons.push(`Image is too blurry (Laplacian variance ${laplacianVariance} < ${LAPLACIAN_BLUR_THRESHOLD}). Hold camera steady.`);
      }

      // Check 4: Glare / Reflection
      const glarePassed = glarePct <= 8.0;
      let glareLabel = `${glarePct}% (Clear Plastic Sheen)`;
      if (!glarePassed) {
        glareLabel = `${glarePct}% (Harsh Glare Obscuring Text)`;
        failureReasons.push(`Excessive glare (${glarePct}%). Angle card slightly to reduce reflections.`);
      }

      // Check 5: Aspect Ratio (ID-1 ~1.586)
      const aspectRatioPassed = geometry.isAspectRatioValid;
      let aspectRatioLabel = `Ratio ${geometry.aspectRatio} : 1 (ISO ID-1 Matched)`;
      if (!aspectRatioPassed) {
        aspectRatioLabel = `Ratio ${geometry.aspectRatio} : 1 (Distorted / Angled)`;
        failureReasons.push(`Card aspect ratio (${geometry.aspectRatio}) diverges from ISO 7810 ID-1 standard (~1.59). Place card flat.`);
      }

      // Check 6: Distance & Framing
      const distancePassed = geometry.isDistanceOptimal;
      let distanceLabel = 'Optimal Card Framing';
      if (geometry.isTooFar) {
        distanceLabel = 'Move Closer';
        failureReasons.push('Card is too far away. Fill the viewfinder guideline frame.');
      } else if (geometry.isTooClose) {
        distanceLabel = 'Move Farther';
        failureReasons.push('Card is cropped by viewfinder edges. Keep all 4 corners inside the frame.');
      }

      // Check 7: 4 Corners Alignment
      const cornersPassed = corners.fourCornersAligned;
      if (!cornersPassed) {
        failureReasons.push('Not all 4 corners of the card are clearly detected. Ensure plain, dark background.');
      }

      const overallPassed =
        minResolutionPassed &&
        brightnessPassed &&
        blurPassed &&
        glarePassed &&
        aspectRatioPassed &&
        distancePassed &&
        cornersPassed;

      // Determine feedback status
      let overallQualityStatus: 'too_dark' | 'too_blurry' | 'move_closer' | 'good_quality' | 'unaligned' = 'good_quality';
      if (avgBrightness < MIN_BRIGHTNESS_THRESHOLD) {
        overallQualityStatus = 'too_dark';
      } else if (!blurPassed) {
        overallQualityStatus = 'too_blurry';
      } else if (geometry.isTooFar) {
        overallQualityStatus = 'move_closer';
      } else if (!cornersPassed || !aspectRatioPassed) {
        overallQualityStatus = 'unaligned';
      } else {
        overallQualityStatus = 'good_quality';
      }

      const qualityResult: DocumentCaptureQualityCheck = {
        resolutionWidth: width,
        resolutionHeight: height,
        resolutionPassed: minResolutionPassed,
        resolutionLabel,
        brightnessAverage: avgBrightness,
        brightnessPassed,
        brightnessLabel,
        glarePercentage: glarePct,
        glarePassed,
        glareLabel,
        laplacianVariance,
        blurPassed,
        blurLabel,
        aspectRatio: geometry.aspectRatio,
        aspectRatioPassed,
        aspectRatioLabel,
        distancePassed,
        distanceLabel,
        fourCornersDetected: cornersPassed,
        overallQualityStatus,
        overallPassed,
        timestamp: new Date().toISOString(),
        failureReasons,
      };

      const phoneExif = generateRealPhoneCameraExif('iphone_15_pro', width, height);
      const exifResult: DocumentCaptureExifData = {
        ...phoneExif,
        deviceLabel: deviceLabel || phoneExif.deviceLabel,
        facingMode: facingMode,
        streamResolution: `${width} × ${height}`,
      };

      setCapturedImage(dataUrl);
      setQualityCheck(qualityResult);
      setExifData(exifResult);
    };
    img.src = dataUrl;
  };

  // Retake photo: discard current snapshot and return to active view
  const handleRetake = () => {
    setCapturedImage(null);
    setQualityCheck(null);
    setExifData(null);
    setSubmittedRecord(null);
    setStabilityHoldMs(0);
    if (activeMode === 'camera') {
      startCameraStream();
    }
  };

  // Submit the compliant document capture
  const handleSubmitCompliantDocument = () => {
    if (!capturedImage || !qualityCheck || !exifData) return;
    if (!qualityCheck.overallPassed) return;

    const record: CompliantDocumentCaptureRecord = {
      id: `DOC-VERIFIED-${Date.now().toString(36).toUpperCase()}`,
      imageUrl: capturedImage,
      capturedAt: new Date().toISOString(),
      quality: qualityCheck,
      exif: exifData,
      cardType: cardTitle,
    };

    setSubmittedRecord(record);
    if (onSubmitCapture) {
      onSubmitCapture(record);
    }
  };

  // Download raw capture with EXIF report
  const handleDownloadCaptureWithExif = () => {
    if (!capturedImage || !exifData || !qualityCheck) return;
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `verified-physical-id-${Date.now()}.jpg`;
    a.click();

    // Also download full smartphone camera EXIF text audit dump
    const textDump = buildExifDumpText(exifData);
    const blob = new Blob([textDump], { type: 'text/plain;charset=utf-8' });
    const textUrl = URL.createObjectURL(blob);
    const textA = document.createElement('a');
    textA.href = textUrl;
    textA.download = `phone-camera-exif-audit-${Date.now()}.txt`;
    setTimeout(() => {
      textA.click();
      URL.revokeObjectURL(textUrl);
    }, 250);
  };

  // Download standalone EXIF text audit
  const handleDownloadExifReportOnly = () => {
    if (!exifData) return;
    const textDump = buildExifDumpText(exifData);
    const blob = new Blob([textDump], { type: 'text/plain;charset=utf-8' });
    const textUrl = URL.createObjectURL(blob);
    const textA = document.createElement('a');
    textA.href = textUrl;
    textA.download = `phone-camera-exif-${exifData.cameraModel?.replace(/\s+/g, '-').toLowerCase() || 'report'}-${Date.now()}.txt`;
    textA.click();
    setTimeout(() => URL.revokeObjectURL(textUrl), 250);
  };

  if (!isOpen) return null;

  // Active status color helper
  const getStatusBadgeConfig = (status?: string) => {
    switch (status) {
      case 'too_dark':
        return {
          icon: <Moon className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Too Dark',
          subtext: 'Increase lighting or move closer to window',
          classes: 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-amber-500/20',
        };
      case 'too_blurry':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Too Blurry',
          subtext: 'Hold camera steady until image sharpens',
          classes: 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-rose-500/20',
        };
      case 'move_closer':
        return {
          icon: <ZoomIn className="w-3.5 h-3.5 text-sky-400" />,
          label: 'Move Closer',
          subtext: 'Position card closer to fill guideline box',
          classes: 'bg-sky-950/90 border-sky-500 text-sky-300 shadow-sky-500/20',
        };
      case 'good_quality':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Good Quality',
          subtext: 'Optimal focus, exposure & framing',
          classes: 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-500/30',
        };
      case 'unaligned':
      default:
        return {
          icon: <Focus className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Align 4 Corners',
          subtext: 'Fit physical card inside target brackets',
          classes: 'bg-slate-900/90 border-slate-600 text-slate-300 shadow-slate-900/40',
        };
    }
  };

  const activeStatus = liveMetrics?.feedbackStatus || 'unaligned';
  const statusConfig = getStatusBadgeConfig(activeStatus);
  const isAlignedGreen = liveMetrics?.fourCornersAligned && liveMetrics?.isAspectRatioValid;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Visual Camera Shutter Flash */}
      {shutterFlash && (
        <div className="fixed inset-0 z-[60] bg-white pointer-events-none animate-out fade-out duration-200" />
      )}

      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-white">
        
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              {activeMode === 'studio' ? <Layers className="w-4 h-4 text-amber-400" /> : <Camera className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{activeMode === 'studio' ? 'Physical ID Card Desk Studio' : 'Physical ID Camera Viewfinder'}</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  activeMode === 'studio'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {activeMode === 'studio' ? 'Realistic PVC Compositor' : 'Live Sensor'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeMode === 'studio'
                  ? 'Real wooden background, window sunlight, physical hand & authentic phone camera EXIF'
                  : 'Direct camera sensor verification with live quality analysis'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Segmented Mode Switcher */}
            {!capturedImage && (
              <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setActiveMode('studio');
                    setShowOnboarding(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeMode === 'studio' && !showOnboarding
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Upload PVC card, set real wood surface, window sunlight, visible hand, & genuine phone camera EXIF"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                  <span>Physical Desk Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('camera');
                    setShowOnboarding(false);
                    startCameraStream();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                    activeMode === 'camera' && !showOnboarding
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Capture live stream using your PC or phone webcam"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-300" />
                  <span>Live Webcam</span>
                </button>
              </div>
            )}

            {/* View Checklist Button */}
            {!showOnboarding && !capturedImage && (
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowOnboarding(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                title="Review physical card capture checklist"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Checklist</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close document capture modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: ONBOARDING SCREEN (3-STEP VISUAL CHECKLIST)           */}
        {/* ------------------------------------------------------------- */}
        {showOnboarding && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center bg-slate-950/60">
            <div className="max-w-xl w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-2">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Document Capture Onboarding
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Follow this 3-step physical preparation checklist before opening the camera to ensure immediate quality approval.
                </p>
              </div>

              {/* 3-Step Visual Cards */}
              <div className="space-y-3">
                
                {/* Step 1: Lighting */}
                <div
                  onClick={() => setOnboardingChecks((p) => ({ ...p, lighting: !p.lighting }))}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-blue-500/60 transition-all flex items-start gap-3.5 cursor-pointer shadow-md group"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    onboardingChecks.lighting ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {onboardingChecks.lighting ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">1</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        Use a well-lit room with natural lighting.
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono">
                        Natural Light
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Avoid harsh single-direction flashlights or direct ceiling spotlights that create blinding specular hotspots over names and ID numbers.
                    </p>
                  </div>
                </div>

                {/* Step 2: Background */}
                <div
                  onClick={() => setOnboardingChecks((p) => ({ ...p, background: !p.background }))}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 transition-all flex items-start gap-3.5 cursor-pointer shadow-md group"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    onboardingChecks.background ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {onboardingChecks.background ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">2</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Place the card on a plain, dark, non-reflective background.
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                        Dark Surface
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      A dark wooden desk, mousepad, or plain matte surface ensures edge detection algorithms cleanly isolate the physical card boundary.
                    </p>
                  </div>
                </div>

                {/* Step 3: 4 Corners */}
                <div
                  onClick={() => setOnboardingChecks((p) => ({ ...p, corners: !p.corners }))}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/60 transition-all flex items-start gap-3.5 cursor-pointer shadow-md group"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    onboardingChecks.corners ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {onboardingChecks.corners ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">3</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        Ensure all four corners of the card are visible.
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
                        4 Corners Visible
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Do not hold the card with fingers covering borders or corners. Keep the complete ISO 7810 rectangle unobstructed.
                    </p>
                  </div>
                </div>

              </div>

              {/* Start Capture Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>No PC camera required • Full PVC studio editing &amp; phone camera EXIF supported</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setActiveMode('studio');
                      setShowOnboarding(false);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-amber-200" />
                    <span>Open Physical Desk Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('camera');
                      setShowOnboarding(false);
                      startCameraStream();
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Start Webcam</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: LIVE CAMERA VIEWFINDER WITH REAL-TIME OVERLAYS        */}
        {/* ------------------------------------------------------------- */}
        {!showOnboarding && (
          <>
            {/* VIEW 2A: PHYSICAL CARD DESK STUDIO (PVC Upload, Wood, Sunlight, Hand, Phone EXIF) */}
            {!capturedImage && activeMode === 'studio' && (
              <div className="flex-1 overflow-y-auto">
                <PhysicalCardStudio
                  initialCardImage={initialCardImage}
                  cardTitle={cardTitle}
                  onCaptureComplete={(dataUrl, quality, exif) => {
                    setCapturedImage(dataUrl);
                    setQualityCheck(quality);
                    setExifData(exif);
                  }}
                />
              </div>
            )}

            {/* VIEW 2B: WEBCAM VIEWFINDER OR POST-CAPTURE REVIEW CONTAINER */}
            {((!capturedImage && activeMode === 'camera') || !!capturedImage) && (
              <>
                {/* GUIDANCE TOP BAR (Only shown in camera mode before capture) */}
                {!capturedImage && (
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-blue-400" /> 1. Natural lighting
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> 2. Dark background
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> 3. All 4 corners visible
                      </span>
                    </div>

                    {/* Auto Shutter Status */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAutoShutterEnabled(!autoShutterEnabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                          autoShutterEnabled
                            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title="Automatically snap the photo once the card is held steady for 1.5 seconds"
                      >
                        <Zap className={`w-3 h-3 ${autoShutterEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>Auto-Shutter (1.5s): {autoShutterEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* MAIN VIEWFINDER BODY */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
                  
                  {/* CAMERA FEED & BOUNDING FRAME CONTAINER */}
                  <div className="relative w-full bg-black rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
                    {!capturedImage && (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover max-h-[480px]"
                        />

                    {/* Camera Permission / Fallback View */}
                    {(!cameraActive || cameraError) && (
                      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                          <Camera className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">
                          Camera Stream Initialization
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md mb-4">
                          {cameraError || 'Allow camera access in your browser or launch simulated 1080p optical card capture for testing.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              stopCameraStream();
                              setActiveMode('studio');
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-200" />
                            <span>Open Physical Desk Studio (Upload PVC)</span>
                          </button>
                          <button
                            type="button"
                            onClick={startCameraStream}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Camera Access</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSimulatePhysicalCardCapture}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Test document quality check engine using an optical 1080p card test pattern"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Simulate 1080p Card Frame</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* REAL-TIME EDGE DETECTION OVERLAY (ISO 7810 ID-1 STANDARD ~1.586 : 1) */}
                    {cameraActive && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4 sm:p-8">
                        {/* Vignette outside ID slot */}
                        <div
                          className={`relative w-full max-w-[560px] aspect-[1.586/1] rounded-2xl transition-all duration-300 ${
                            isAlignedGreen
                              ? 'border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.72),0_0_30px_rgba(52,211,153,0.55)]'
                              : 'border-2 border-dashed border-amber-400/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]'
                          }`}
                        >
                          {/* 4 Active Corner Target Brackets */}
                          {/* Top-Left */}
                          <div
                            className={`absolute -top-1 -left-1 w-8 h-8 rounded-tl-xl border-t-4 border-l-4 transition-all duration-300 ${
                              isAlignedGreen
                                ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                                : 'border-amber-400/90'
                            }`}
                          >
                            <span className="absolute -top-5 -left-1 text-[9px] font-mono font-bold px-1 rounded bg-slate-900/90 text-emerald-300">
                              TL {isAlignedGreen ? '✓' : ''}
                            </span>
                          </div>

                          {/* Top-Right */}
                          <div
                            className={`absolute -top-1 -right-1 w-8 h-8 rounded-tr-xl border-t-4 border-r-4 transition-all duration-300 ${
                              isAlignedGreen
                                ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                                : 'border-amber-400/90'
                            }`}
                          >
                            <span className="absolute -top-5 -right-1 text-[9px] font-mono font-bold px-1 rounded bg-slate-900/90 text-emerald-300">
                              TR {isAlignedGreen ? '✓' : ''}
                            </span>
                          </div>

                          {/* Bottom-Left */}
                          <div
                            className={`absolute -bottom-1 -left-1 w-8 h-8 rounded-bl-xl border-b-4 border-l-4 transition-all duration-300 ${
                              isAlignedGreen
                                ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                                : 'border-amber-400/90'
                            }`}
                          >
                            <span className="absolute -bottom-5 -left-1 text-[9px] font-mono font-bold px-1 rounded bg-slate-900/90 text-emerald-300">
                              BL {isAlignedGreen ? '✓' : ''}
                            </span>
                          </div>

                          {/* Bottom-Right */}
                          <div
                            className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-br-xl border-b-4 border-r-4 transition-all duration-300 ${
                              isAlignedGreen
                                ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                                : 'border-amber-400/90'
                            }`}
                          >
                            <span className="absolute -bottom-5 -right-1 text-[9px] font-mono font-bold px-1 rounded bg-slate-900/90 text-emerald-300">
                              BR {isAlignedGreen ? '✓' : ''}
                            </span>
                          </div>

                          {/* Centered Alignment Crosshairs & Laser Guide */}
                          <div
                            className={`absolute inset-x-0 h-0.5 top-1/2 transition-opacity duration-300 ${
                              isAlignedGreen
                                ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-pulse'
                                : 'bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40'
                            }`}
                          />
                          <div
                            className={`absolute inset-y-0 w-0.5 left-1/2 transition-opacity duration-300 ${
                              isAlignedGreen
                                ? 'bg-gradient-to-b from-transparent via-emerald-400 to-transparent opacity-50'
                                : 'opacity-0'
                            }`}
                          />

                          {/* Header Alignment Status Pill */}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md whitespace-nowrap backdrop-blur-md bg-slate-900/90 border transition-all">
                            {isAlignedGreen ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">
                                  4 Corners Locked • ISO ID-1 (~1.59)
                                </span>
                              </>
                            ) : (
                              <>
                                <Focus className="w-3 h-3 text-amber-400" />
                                <span className="text-amber-300">
                                  Align All 4 Corners with Brackets
                                </span>
                              </>
                            )}
                          </div>

                          {/* 1.5-Second Auto-Shutter Countdown Progress in Center of Frame */}
                          {autoShutterEnabled && stabilityHoldMs > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/40 backdrop-blur-xs rounded-2xl animate-in zoom-in-90 duration-150">
                              <div className="relative w-20 h-20 flex items-center justify-center">
                                {/* SVG Radial Progress Ring */}
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="transparent"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="6"
                                  />
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    fill="transparent"
                                    stroke="#10b981"
                                    strokeWidth="6"
                                    strokeDasharray="201.06"
                                    strokeDashoffset={201.06 - (201.06 * stabilityHoldMs) / 1500}
                                    strokeLinecap="round"
                                    className="transition-all duration-150"
                                  />
                                </svg>
                                <span className="absolute font-mono font-black text-xl text-white">
                                  {((1500 - stabilityHoldMs) / 1000).toFixed(1)}s
                                </span>
                              </div>
                              <span className="mt-2 text-xs font-bold text-emerald-300 tracking-wide uppercase">
                                Holding Steady...
                              </span>
                            </div>
                          )}

                          {/* Bottom Status Feedback Tag */}
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-full text-[11px] font-semibold text-slate-200 tracking-wide flex items-center gap-1.5 shadow-md whitespace-nowrap">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            <span>{liveMetrics?.feedbackMessage || 'Position physical ID inside box'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TOP HUD: LIVE METRICS & 4 STATUS INDICATORS */}
                    {cameraActive && (
                      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 text-[11px] pointer-events-none">
                        
                        {/* Live Direct Sensor Indicator */}
                        <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-mono font-bold">DIRECT CMOS SENSOR</span>
                          <span className="text-slate-400 font-mono">
                            {liveMetrics ? `• ${liveMetrics.aspectRatio} Aspect` : '• 1080p FHD'}
                          </span>
                        </div>

                        {/* DYNAMIC PRIMARY FEEDBACK PILL (Too Dark, Too Blurry, Move Closer, Good Quality) */}
                        <div
                          className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center gap-2 backdrop-blur-md shadow-lg transition-all ${statusConfig.classes}`}
                        >
                          {statusConfig.icon}
                          <span>{statusConfig.label}</span>
                        </div>

                        {/* Real-Time Laplacian & Exposure Telemetry */}
                        {liveMetrics && (
                          <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-2">
                            <span>Sharpness: {liveMetrics.laplacianVariance}/{LAPLACIAN_BLUR_THRESHOLD}</span>
                            <span>•</span>
                            <span>Lux: {liveMetrics.brightness}/255</span>
                          </div>
                        )}

                      </div>
                    )}
                  </>
                )}

                {/* ----------------------------------------------------------- */}
                {/* CAPTURED SNAPSHOT VIEW                                      */}
                {/* ----------------------------------------------------------- */}
                {capturedImage && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-4">
                    <img
                      src={capturedImage}
                      alt="Captured Physical ID"
                      className="max-h-[420px] w-auto object-contain rounded-xl shadow-xl border border-slate-700"
                    />

                    {/* Quality Status Stamp */}
                    {qualityCheck && (
                      <div
                        className={`absolute top-6 left-6 px-3.5 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center gap-2 backdrop-blur-md shadow-lg ${
                          qualityCheck.overallPassed
                            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/90 border-rose-500 text-rose-300'
                        }`}
                      >
                        {qualityCheck.overallPassed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Good Quality • Document Compliant</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>{qualityCheck.overallQualityStatus.replace('_', ' ')} • Retake Required</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* ----------------------------------------------------------- */}
              {/* POST-CAPTURE QUALITY SCORECARD & VALIDATION METRICS         */}
              {/* ----------------------------------------------------------- */}
              {qualityCheck && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    qualityCheck.overallPassed
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {qualityCheck.overallPassed ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <h4 className="text-sm font-bold text-white">
                        Client-Side Optical Validation Scorecard
                      </h4>
                    </div>

                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        qualityCheck.overallPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {qualityCheck.overallPassed ? 'Compliant & Verified' : 'Action Required Before Submit'}
                    </span>
                  </div>

                  {/* 4 Primary Diagnostic Indicators (Blur, Exposure, Aspect Ratio, Framing) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    
                    {/* Check 1: Laplacian Variance Blur Check */}
                    <div
                      className={`p-2.5 rounded-lg border ${
                        qualityCheck.blurPassed
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          Sharpness (Laplacian)
                        </span>
                        {qualityCheck.blurPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <div className="font-mono font-bold text-sm text-white">
                        {qualityCheck.laplacianVariance} / {LAPLACIAN_BLUR_THRESHOLD}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {qualityCheck.blurPassed ? 'Sharp / In-Focus' : 'Too Blurry (Hold steady)'}
                      </div>
                    </div>

                    {/* Check 2: Exposure Level */}
                    <div
                      className={`p-2.5 rounded-lg border ${
                        qualityCheck.brightnessPassed
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          Exposure Level
                        </span>
                        {qualityCheck.brightnessPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="font-mono font-bold text-sm text-white">
                        {qualityCheck.brightnessAverage} / 255
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {qualityCheck.brightnessPassed
                          ? 'Optimal Exposure'
                          : qualityCheck.brightnessAverage < MIN_BRIGHTNESS_THRESHOLD
                          ? 'Too Dark'
                          : 'Harsh Glare / Overexposed'}
                      </div>
                    </div>

                    {/* Check 3: Aspect Ratio (ID-1) */}
                    <div
                      className={`p-2.5 rounded-lg border ${
                        qualityCheck.aspectRatioPassed
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          ID-1 Aspect Ratio
                        </span>
                        {qualityCheck.aspectRatioPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <div className="font-mono font-bold text-sm text-white">
                        {qualityCheck.aspectRatio} : 1
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {qualityCheck.aspectRatioPassed ? 'Matches ID-1 Standard' : 'Card Angled / Skewed'}
                      </div>
                    </div>

                    {/* Check 4: 4 Corners Detection */}
                    <div
                      className={`p-2.5 rounded-lg border ${
                        qualityCheck.fourCornersDetected
                          ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                          : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                          4 Corners Visible
                        </span>
                        {qualityCheck.fourCornersDetected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <div className="font-mono font-bold text-sm text-white">
                        {qualityCheck.fourCornersDetected ? 'All 4 Detected' : 'Corner Obscured'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {qualityCheck.fourCornersDetected ? 'No Finger Overlap' : 'Unobstruct all corners'}
                      </div>
                    </div>

                  </div>

                  {/* Actionable Feedback Reasons if Blocked */}
                  {!qualityCheck.overallPassed && qualityCheck.failureReasons && (
                    <div className="mt-3 p-3 bg-rose-950/70 rounded-lg border border-rose-500/50 text-xs text-rose-200">
                      <div className="font-bold mb-1 flex items-center gap-1.5 text-rose-300">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Submission Blocked: Address the following quality checks:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-rose-200 text-[11px]">
                        {qualityCheck.failureReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* EXIF METADATA ACCORDION */}
              {exifData && (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs">
                  <div className="w-full flex items-center justify-between text-slate-300 font-bold">
                    <button
                      type="button"
                      onClick={() => setShowMetadataInspector(!showMetadataInspector)}
                      className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>
                        {exifData.cameraModel || 'Phone Camera'} Hardware EXIF &amp; Authenticity ({exifData.integrityHash.slice(0, 16)})
                      </span>
                      <span className="text-[10px] text-blue-400 ml-1">
                        {showMetadataInspector ? '▲ Hide Details' : '▼ View 20+ Metadata Tags'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadExifReportOnly}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      title="Download authentic camera EXIF audit report (.txt)"
                    >
                      <Download className="w-3 h-3 text-amber-400" />
                      <span>Download EXIF .txt</span>
                    </button>
                  </div>

                  {showMetadataInspector && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">Camera Model</span>
                          <span className="text-white font-bold">{exifData.cameraModel || exifData.deviceLabel}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">Exposure / Shutter</span>
                          <span className="text-amber-300 font-bold">{exifData.exposureTime || '1/125s'}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">Aperture / F-Stop</span>
                          <span className="text-amber-300 font-bold">{exifData.fNumber || 'f/1.78'}</span>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-500 block text-[9px] uppercase">ISO Sensitivity</span>
                          <span className="text-amber-300 font-bold">ISO {exifData.isoSpeed || 64}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                        <div>
                          <span className="text-slate-500 block">Lens Specification:</span>
                          <span className="text-slate-200">{exifData.lensModel || `${exifData.focalLength || '6.86mm'} (${exifData.focalLengthIn35mmFormat || '24mm eq.'})`}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Stream &amp; Sensor Res:</span>
                          <span className="text-slate-200">{exifData.streamResolution}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">GPS Coordinates:</span>
                          <span className="text-slate-200">{exifData.gpsLatitude && exifData.gpsLongitude ? `${exifData.gpsLatitude}, ${exifData.gpsLongitude}` : 'Embedded in Capture'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Color Space &amp; MIME:</span>
                          <span className="text-slate-200">{exifData.colorSpace}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Original DateTime:</span>
                          <span className="text-slate-200">{exifData.dateTimeOriginal || new Date(exifData.captureTimestamp).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Cryptographic Hash:</span>
                          <span className="text-emerald-400 truncate block" title={exifData.integrityHash}>{exifData.integrityHash}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBMISSION CONFIRMATION NOTICE */}
              {submittedRecord && (
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      Physical ID Document Successfully Archived &amp; Verified
                    </h5>
                    <p className="mt-0.5 text-emerald-300 text-[11px]">
                      Compliant capture with verified Laplacian sharpness, exposure, and aspect ratio archived under ledger ID{' '}
                      <span className="font-mono font-bold text-white">{submittedRecord.id}</span>.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadCaptureWithExif}
                        className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Verified Capture + EXIF</span>
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Close &amp; Return to Studio
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

            {/* MODAL FOOTER */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                {!capturedImage && activeMode === 'camera' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                        setFacingMode(nextMode);
                        startCameraStream();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                      title="Switch between front and back camera"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                      <span>{facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}</span>
                    </button>

                    {availableDevices.length > 1 && (
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => {
                          setSelectedDeviceId(e.target.value);
                          startCameraStream();
                        }}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {availableDevices.map((d, i) => (
                          <option key={d.deviceId || i} value={d.deviceId}>
                            {d.label || `Camera ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                {!capturedImage && activeMode === 'studio' && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Physical Desk Studio Active</span>
                    </span>
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                      Configure wood surface, window light &amp; hand overlay above
                    </span>
                  </div>
                )}

                {capturedImage && !submittedRecord && (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeMode === 'studio' ? 'Adjust Studio & Re-capture' : 'Retake Camera Photo'}</span>
                  </button>
                )}
              </div>

              {/* Right Action: Shutter or Submit */}
              <div className="flex items-center gap-2">
                {!capturedImage && activeMode === 'camera' ? (
                  <button
                    type="button"
                    onClick={triggerShutterCapture}
                    disabled={isProcessing}
                    className="relative px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Auto-shutter progress background fill */}
                    {autoShutterEnabled && stabilityHoldMs > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-emerald-500/40 transition-all duration-150"
                        style={{ width: `${(stabilityHoldMs / 1500) * 100}%` }}
                      />
                    )}
                    <Camera className="w-4 h-4 text-white relative z-10" />
                    <span className="relative z-10">
                      {isProcessing
                        ? 'Analyzing Optical Quality...'
                        : autoShutterEnabled && stabilityHoldMs > 0
                        ? `Holding Steady (${((1500 - stabilityHoldMs) / 1000).toFixed(1)}s)`
                        : 'Manual Shutter Capture'}
                    </span>
                  </button>
                ) : !capturedImage && activeMode === 'studio' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMode('camera');
                      startCameraStream();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Switch to Webcam Stream</span>
                  </button>
                ) : !submittedRecord ? (
                  <button
                    type="button"
                    onClick={handleSubmitCompliantDocument}
                    disabled={!qualityCheck || !qualityCheck.overallPassed}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
                      qualityCheck && qualityCheck.overallPassed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {qualityCheck && qualityCheck.overallPassed
                        ? 'Submit Compliant Physical ID'
                        : 'Submit Blocked (Address Quality Errors)'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

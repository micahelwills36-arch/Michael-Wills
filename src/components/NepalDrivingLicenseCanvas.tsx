import React, { useEffect, useRef, useState } from 'react';
import { NepalDrivingLicenseDetails, RealismSettings } from '../types';
import {
  renderCanvas,
  drawLicenseCard,
  loadCanvasImage,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../utils/drawNepalLicense';
import { Download, RefreshCw, Check, Layers, Image as ImageIcon } from 'lucide-react';

interface NepalDrivingLicenseCanvasProps {
  details: NepalDrivingLicenseDetails;
  settings?: RealismSettings;
  className?: string;
  id?: string;
  onExportReady?: (dataUrl: string) => void;
}

/**
 * Pure HTML5 Canvas component for Nepal Driving License (Front)
 * Strict 1000 x 630 px resolution overlaying pre-printed template.
 * Draws strictly the dynamic values, user photo, and signatures.
 */
export const NepalDrivingLicenseCanvas: React.FC<NepalDrivingLicenseCanvasProps> = ({
  details,
  className = '',
  id = 'nepal-driving-license-front',
  onExportReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [bgImageObj, setBgImageObj] = useState<HTMLImageElement | null>(null);

  // Background template path
  const templatePath =
    details.templateBgUrl || details.customTemplateUrl || '/assets/nepal-dl-front-bg.png';

  // Load background image once when template path changes
  useEffect(() => {
    let isMounted = true;
    if (templatePath) {
      loadCanvasImage(templatePath)
        .then((img) => {
          if (isMounted) setBgImageObj(img);
        })
        .catch(() => {
          if (isMounted) setBgImageObj(null);
        });
    } else {
      setBgImageObj(null);
    }
    return () => {
      isMounted = false;
    };
  }, [templatePath]);

  // Render on canvas whenever details or background image change
  const renderCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRendering(true);
    try {
      // Normalize state using the strict 15 fields
      const stateToDraw = {
        dlNo: details.dlNo || '',
        bg: details.bg || details.bloodGroup || '',
        doi: details.doi || '',
        doe: details.doe || '',
        fullName: details.fullName || '',
        address: details.address || '',
        licenseOffice: details.licenseOffice || '',
        dob: details.dob || '',
        fhName: details.fhName || '',
        citizenshipNo: details.citizenshipNo || '',
        passportNo: details.passportNo !== undefined ? details.passportNo : '0',
        contactNo: details.contactNo || '',
        category: details.category || details.categories || 'A, B',
        userPhoto: details.userPhoto || details.photoUrl || '',
        holderSignature: details.holderSignature || details.holderSignUrl || '',
        issuedBySignature: details.issuedBySignature || details.issuedBySignUrl || '',
        templateBgUrl: details.templateBgUrl,
        isPreprintedTemplate: details.isPreprintedTemplate !== false,
      };

      await renderCanvas(ctx, stateToDraw, bgImageObj);

      if (onExportReady) {
        onExportReady(canvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Error drawing Nepal Driving License on Canvas:', err);
    } finally {
      setIsRendering(false);
    }
  };

  useEffect(() => {
    renderCard();
  }, [details, bgImageObj]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    const safeDl = (details.dlNo || 'front').replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `Nepal-Driving-License-${safeDl}.png`;
    a.href = dataUrl;
    a.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Canvas Card Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-950 p-2 sm:p-3">
        <canvas
          id={id}
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full max-w-[560px] h-auto aspect-[1000/630] rounded-xl shadow-lg block transition-transform duration-200"
          style={{
            imageRendering: 'auto',
          }}
        />

        {isRendering && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/90 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Rendering 1000×630 px...</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar beneath canvas */}
      <div className="mt-3 flex items-center justify-between gap-3 w-full max-w-[560px] text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            <Layers className="w-3 h-3 text-emerald-400" />
            1000 × 630 px
          </span>
          {bgImageObj ? (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ImageIcon className="w-3 h-3" /> Template Loaded
            </span>
          ) : (
            <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
              Loading Template...
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isRendering}
          className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
            downloadSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-700 hover:bg-emerald-600 text-white'
          }`}
          title="Export pixel-exact 1000 x 630 PNG"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved PNG</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export High-Res PNG</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { safeToPng, safeToJpeg } from '../utils/exportImage';
import { jsPDF } from 'jspdf';
import {
  X,
  FileDown,
  Image as ImageIcon,
  FileText,
  Printer,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Camera,
  Briefcase,
  Crown,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCardId: string;
  libraryCardId: string;
  studentName: string;
  studentIdNumber: string;
  workCardId?: string;
  loyaltyCardId?: string;
  photoStageId?: string;
  card1Type?: 'student' | 'work';
  card2Type?: 'library' | 'loyalty';
  workName?: string;
  workIdNumber?: string;
  loyaltyName?: string;
  loyaltyIdNumber?: string;
  onOpenMockupPreview?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  studentCardId,
  libraryCardId,
  studentName,
  studentIdNumber,
  workCardId = 'card-student-left',
  loyaltyCardId = 'card-library-right',
  photoStageId = 'tribhuvan-photo-stage',
  card1Type = 'student',
  card2Type = 'library',
  workName = 'Dr. Isabella Rose',
  workIdNumber = 'EMP-KMC-84920',
  loyaltyName = 'Isabella Rose',
  loyaltyIdNumber = 'VIP-9842-8821',
  onOpenMockupPreview,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<
    'card1' | 'card2' | 'both' | 'mockup'
  >('card1');
  const [exportFormat, setExportFormat] = useState<
    'pdf_cr80' | 'pdf_a4' | 'png_300dpi' | 'jpg_realistic' | 'mockup_png'
  >('png_300dpi');
  const [qualityPreset, setQualityPreset] = useState<'300dpi' | '600dpi'>('300dpi');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFilename, setExportFilename] = useState('');

  if (!isOpen) return null;

  // Resolve target element IDs based on active card configuration
  const getTargetElementId = (target: 'card1' | 'card2' | 'mockup'): string => {
    if (target === 'mockup') return photoStageId;
    if (target === 'card1') {
      return card1Type === 'work' ? (workCardId || 'card-student-left') : studentCardId;
    }
    return card2Type === 'loyalty' ? (loyaltyCardId || 'card-library-right') : libraryCardId;
  };

  const getTargetTitle = (target: 'card1' | 'card2'): string => {
    if (target === 'card1') {
      return card1Type === 'work' ? 'Work / Employment ID' : 'Student ID';
    }
    return card2Type === 'loyalty' ? 'Loyalty VIP Card' : 'Library ID';
  };

  const getTargetNameAndId = (target: 'card1' | 'card2'): { name: string; id: string } => {
    if (target === 'card1') {
      return card1Type === 'work'
        ? { name: workName, id: workIdNumber }
        : { name: studentName, id: studentIdNumber };
    }
    return card2Type === 'loyalty'
      ? { name: loyaltyName, id: loyaltyIdNumber }
      : { name: studentName, id: studentIdNumber };
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const pixelRatio = qualityPreset === '600dpi' ? 4 : 3;

      // Helper to capture DOM node as image
      const captureElement = async (
        elemId: string,
        format: 'png' | 'jpeg' = 'png'
      ): Promise<string> => {
        const node = document.getElementById(elemId);
        if (!node) {
          // Fallback to querySelector
          const fallback = document.querySelector(`[id*="${elemId}"]`) as HTMLElement;
          if (!fallback) throw new Error(`Card element #${elemId} not found in DOM`);
          return format === 'png'
            ? await safeToPng(fallback, { quality: 0.98, pixelRatio, cacheBust: true })
            : await safeToJpeg(fallback, { quality: 0.95, pixelRatio, cacheBust: true });
        }

        return format === 'png'
          ? await safeToPng(node, { quality: 0.98, pixelRatio, cacheBust: true })
          : await safeToJpeg(node, { quality: 0.95, pixelRatio, cacheBust: true });
      };

      const downloadImage = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
        setExportFilename(filename);
      };

      // 1. Full Presentation Mockup Scene Export
      if (exportFormat === 'mockup_png' || selectedTarget === 'mockup') {
        const dataUrl = await captureElement(photoStageId, 'png');
        downloadImage(dataUrl, `Presentation_Mockup_Realistic_300DPI.png`);
      }
      // 2. Ultra-HD PNG Export
      else if (exportFormat === 'png_300dpi') {
        if (selectedTarget === 'card1' || selectedTarget === 'both') {
          const info = getTargetNameAndId('card1');
          const id = getTargetElementId('card1');
          const dataUrl = await captureElement(id, 'png');
          const title = card1Type === 'work' ? 'WorkID' : 'StudentID';
          downloadImage(dataUrl, `${title}_${info.name.replace(/\s+/g, '_')}_${info.id}_${qualityPreset}.png`);
        }

        if (selectedTarget === 'card2' || selectedTarget === 'both') {
          const info = getTargetNameAndId('card2');
          const id = getTargetElementId('card2');
          const dataUrl = await captureElement(id, 'png');
          const title = card2Type === 'loyalty' ? 'LoyaltyCard' : 'LibraryCard';
          downloadImage(dataUrl, `${title}_${info.name.replace(/\s+/g, '_')}_${info.id}_${qualityPreset}.png`);
        }
      }
      // 3. High-Res Realistic JPG Export
      else if (exportFormat === 'jpg_realistic') {
        if (selectedTarget === 'card1' || selectedTarget === 'both') {
          const info = getTargetNameAndId('card1');
          const id = getTargetElementId('card1');
          const dataUrl = await captureElement(id, 'jpeg');
          const title = card1Type === 'work' ? 'WorkID' : 'StudentID';
          downloadImage(dataUrl, `${title}_Realistic_${info.name.replace(/\s+/g, '_')}.jpg`);
        }

        if (selectedTarget === 'card2' || selectedTarget === 'both') {
          const info = getTargetNameAndId('card2');
          const id = getTargetElementId('card2');
          const dataUrl = await captureElement(id, 'jpeg');
          const title = card2Type === 'loyalty' ? 'LoyaltyCard' : 'LibraryCard';
          downloadImage(dataUrl, `${title}_Realistic_${info.name.replace(/\s+/g, '_')}.jpg`);
        }
      }
      // 4. Exact CR-80 ISO 7810 ID-1 Physical PDF (85.60 mm x 53.98 mm)
      else if (exportFormat === 'pdf_cr80') {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [85.6, 53.98],
        });

        if (selectedTarget === 'card1') {
          const id = getTargetElementId('card1');
          const imgData = await captureElement(id, 'png');
          pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');
        } else if (selectedTarget === 'card2') {
          const id = getTargetElementId('card2');
          const imgData = await captureElement(id, 'png');
          pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');
        } else {
          // Page 1: Card 1
          const id1 = getTargetElementId('card1');
          const img1 = await captureElement(id1, 'png');
          pdf.addImage(img1, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');

          // Page 2: Card 2
          pdf.addPage([85.6, 53.98], 'landscape');
          const id2 = getTargetElementId('card2');
          const img2 = await captureElement(id2, 'png');
          pdf.addImage(img2, 'PNG', 0, 0, 85.6, 53.98, undefined, 'FAST');
        }

        const fileName = `Official_CR80_PVC_Card_${card1Type}_${card2Type}.pdf`;
        pdf.save(fileName);
        setExportFilename(fileName);
      }
      // 5. Printable A4 Sheet with Cut Guides
      else if (exportFormat === 'pdf_a4') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        pdf.setFontSize(13);
        pdf.setTextColor(15, 23, 42);
        pdf.text('Official PVC Identification Card - Print Production Sheet', 20, 20);

        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          `Exported: ${new Date().toLocaleString()} | Standard CR-80 Dimensions (85.60 mm x 53.98 mm) | 1:1 Scale`,
          20,
          26
        );

        if (selectedTarget === 'card1' || selectedTarget === 'both') {
          const id = getTargetElementId('card1');
          const img = await captureElement(id, 'png');
          const title = getTargetTitle('card1');
          pdf.text(`${title.toUpperCase()} (CR-80)`, 20, 40);
          pdf.rect(19.5, 42.5, 86.6, 54.98); // Cut guide border
          pdf.addImage(img, 'PNG', 20, 43, 85.6, 53.98, undefined, 'FAST');
        }

        if (selectedTarget === 'card2' || selectedTarget === 'both') {
          const id = getTargetElementId('card2');
          const img = await captureElement(id, 'png');
          const title = getTargetTitle('card2');
          const yPos = selectedTarget === 'both' ? 116 : 43;
          pdf.text(`${title.toUpperCase()} (CR-80)`, 20, yPos - 3);
          pdf.rect(19.5, yPos - 0.5, 86.6, 54.98); // Cut guide border
          pdf.addImage(img, 'PNG', 20, yPos, 85.6, 53.98, undefined, 'FAST');
        }

        const fileName = `Printable_A4_Sheet_${card1Type}_${card2Type}.pdf`;
        pdf.save(fileName);
        setExportFilename(fileName);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4500);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  Export Any Card in Realistic Quality
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  CR80 PVC
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90">
                Ultra-HD PNG 300 DPI, High-Res JPG, Print-Ready Vector PDF, and Presentation Mockup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Card Selection */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Select Card to Export
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTarget('card1')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedTarget === 'card1'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-700/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {card1Type === 'work' ? (
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                )}
                <span className="text-[11px] truncate w-full">{getTargetTitle('card1')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget('card2')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedTarget === 'card2'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-700/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {card2Type === 'loyalty' ? (
                  <Crown className="w-4 h-4 text-amber-600" />
                ) : (
                  <BookOpen className="w-4 h-4 text-teal-600" />
                )}
                <span className="text-[11px] truncate w-full">{getTargetTitle('card2')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget('both')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedTarget === 'both'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-700/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="text-[11px]">Both Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTarget('mockup')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedTarget === 'mockup'
                    ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-700/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Tabletop Mockup</span>
              </button>
            </div>
          </div>

          {/* Export Formats */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-blue-600" /> Output Format &amp; Preset
            </label>
            <div className="space-y-2">
              <label
                onClick={() => setExportFormat('png_300dpi')}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === 'png_300dpi'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'png_300dpi'}
                  onChange={() => setExportFormat('png_300dpi')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Ultra-HD Realistic PNG (300 DPI / 600 DPI)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      Lossless Master
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Crisp physical card texture, anti-glare finish, accurate CR-80 rounded corners with transparency.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setExportFormat('pdf_cr80')}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === 'pdf_cr80'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'pdf_cr80'}
                  onChange={() => setExportFormat('pdf_cr80')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Print-Ready PVC Card PDF (CR-80 Standard)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                      Physical PVC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Exact 85.60 mm × 53.98 mm page format for thermal dye-sublimation PVC card printers.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setExportFormat('pdf_a4')}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === 'pdf_a4'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'pdf_a4'}
                  onChange={() => setExportFormat('pdf_a4')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Printable A4 Sheet with Cut Guidelines
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                      Paper / Laminate
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Formatted for office laser/inkjet printers on A4 paper with precision trim/crop marks.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setExportFormat('jpg_realistic')}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === 'jpg_realistic'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'jpg_realistic'}
                  onChange={() => setExportFormat('jpg_realistic')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      High-Res Realistic JPG (Digital Share / Web)
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                      Compact &amp; Rich
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Optimized high-fidelity JPEG with photographic lighting and neutral white backing.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setExportFormat('mockup_png')}
                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === 'mockup_png'
                    ? 'border-blue-700 bg-blue-50/70 ring-1 ring-blue-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'mockup_png'}
                  onChange={() => setExportFormat('mockup_png')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Tabletop Presentation Mockup PNG
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                      Presentation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Captures full 3D perspective, physical shadows, and tabletop background.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Realistic Quality Multiplier */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Print Resolution / DPI Density</span>
              <span className="text-[11px] text-slate-500">
                Calculated physical pixel density for crystal-clear microtext and barcodes
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setQualityPreset('300dpi')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  qualityPreset === '300dpi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                300 DPI
              </button>
              <button
                type="button"
                onClick={() => setQualityPreset('600dpi')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  qualityPreset === '600dpi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                600 DPI (Ultra)
              </button>
            </div>
          </div>

          {/* Quick link to Print / Realistic Preview */}
          {onOpenMockupPreview && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-blue-950 block text-xs">Want to adjust tabletop perspective?</span>
                  <span className="text-[11px] text-blue-700">Open the dedicated Presentation Mockup Studio</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMockupPreview();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap"
              >
                Launch Mockup
              </button>
            </div>
          )}

          {/* Success Message */}
          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{exportFilename || 'Card'} exported in realistic quality!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer text-xs"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 text-xs"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating High-Resolution Output...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Download {exportFormat.startsWith('pdf') ? 'PDF' : 'Image'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

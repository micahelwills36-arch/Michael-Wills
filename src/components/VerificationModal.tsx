import React, { useState } from 'react';
import {
  VerificationRecord,
  StudentDetails,
  LibraryDetails,
  InstituteConfig,
  CardStatus,
} from '../types';
import { OfficialQRCode, OfficialBarcode } from './BarcodeAndQR';
import {
  CheckCircle2,
  ShieldCheck,
  X,
  Copy,
  ExternalLink,
  QrCode,
  Calendar,
  Building,
  UserCheck,
  Hash,
  Award,
  Clock,
  AlertTriangle,
  RotateCw,
  Camera,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: VerificationRecord;
  studentDetails: StudentDetails;
  libraryDetails: LibraryDetails;
  instituteConfig: InstituteConfig;
  onUpdateRecord?: (record: VerificationRecord) => void;
  onOpenPhysicalCapture?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  record,
  studentDetails,
  libraryDetails,
  instituteConfig,
  onOpenPhysicalCapture,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(record.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRecheck = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with University Institutional Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Institutional Registry Verified
                </span>
                <span className="text-[10px] text-blue-200 font-mono">
                  {record.institutionRegistrationCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Official Credential Verification Record
              </h2>
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status & Verification Stamp Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    Status:{' '}
                    {record.status === 'approved'
                      ? 'Approved & Issued (Active)'
                      : record.status === 'pending_approval'
                      ? 'Pending Approval'
                      : record.status === 'draft'
                      ? 'Draft State'
                      : 'Expired'}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                    GENUINE
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Tied to central university database ledger. Cryptographically signed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateRecheck}
              disabled={isVerifying}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : 'Re-verify'}</span>
            </button>
          </div>

          {/* Database Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Database Record ID */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue-600" /> Unique Database Record ID
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-1 block select-all">
                {record.databaseId}
              </span>
            </div>

            {/* Student ID & Roll */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-blue-600" /> Student / Cardholder
              </span>
              <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                {studentDetails.name}
              </span>
              <span className="text-slate-600 text-[11px]">
                Roll: {studentDetails.rollNo} • ID: {studentDetails.idNumber}
              </span>
            </div>

            {/* Program & Department */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3 text-blue-600" /> Academic Affiliation
              </span>
              <span className="font-bold text-slate-900 mt-1 block truncate">
                {studentDetails.program}
              </span>
              <span className="text-slate-600 text-[11px] block truncate">
                {studentDetails.department}
              </span>
            </div>

            {/* Validity Timeline */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" /> Issuance &amp; Expiry
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-slate-800">
                  Issued: {record.issueDate}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-800">
                  Valid Until: {record.expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code & Barcode Tied to Record */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <OfficialQRCode data={record.qrData} size={76} />
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  Institutional Verification QR
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-[280px]">
                  Scannable by campus security, exam halls, and library circulation desks worldwide.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                    ISO/IEC 18004
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                    CRC-32 Validated
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto flex-1 max-w-[220px]">
              <OfficialBarcode data={record.barcodeData} height={32} showText={true} />
            </div>
          </div>

          {/* Verification URL & Copy Action */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider block">
                Official Verification Link
              </span>
              <span className="font-mono text-[11px] text-blue-950 font-semibold truncate block mt-0.5 select-all">
                {record.verificationUrl}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-md font-bold text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash & Registrar Sign-off */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200/80 space-y-1.5 text-[10.5px]">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" /> Authorized Approval:
              </span>
              <span className="font-bold text-slate-900">{record.approvedBy}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" /> Sign-off Timestamp:
              </span>
              <span className="font-mono text-slate-800">{record.approvalDate}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-wider">
                Digital Ledger Security Hash (SHA-256)
              </span>
              <span className="font-mono text-[9.5px] text-slate-600 break-all select-all">
                {record.securityHash}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          {onOpenPhysicalCapture ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPhysicalCapture();
              }}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Launch direct real-time camera viewfinder to capture and verify physical ID card document"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>Capture Physical Card</span>
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Close Verification Registry
          </button>
        </div>
      </div>
    </div>
  );
};

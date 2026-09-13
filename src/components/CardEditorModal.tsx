import React, { useState, useRef, useEffect } from 'react';
import {
  StudentDetails,
  LibraryDetails,
  EmploymentDetails,
  LoyaltyDetails,
  NepalDrivingLicenseDetails,
  INITIAL_NEPAL_DL_DETAILS,
  InstituteConfig,
  SignatureConfig,
  PhotoAdjustments,
  CardEditMode,
  RealismSettings,
} from '../types';
import { TribhuvanLogo } from './TribhuvanLogo';
import { KathmanduModelCollegeLogo, KMC_LOGO_DATA_URL } from './KathmanduModelCollegeLogo';
import { StudentIDCard } from './StudentIDCard';
import { LibraryIDCard } from './LibraryIDCard';
import { WorkIDCard } from './WorkIDCard';
import { LoyaltyCard } from './LoyaltyCard';
import { NepalDrivingLicenseCard } from './NepalDrivingLicenseCard';
import { NepalDrivingLicenseEditor } from './NepalDrivingLicenseEditor';
import { processSignatureTransparent } from '../utils/signatureTrim';
import { ASSETS, INITIAL_EMPLOYMENT_DETAILS, INITIAL_LOYALTY_DETAILS, INITIAL_REALISM_SETTINGS } from '../constants';
import {
  X,
  Check,
  School,
  BookOpen,
  Building2,
  PenTool,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  Camera,
  Video,
  VideoOff,
  ZoomIn,
  MoveVertical,
  Sun,
  Contrast,
  Users,
  Sparkles,
  Link,
  Unlink,
  Copy,
  Layers,
  Briefcase,
  Crown,
  CreditCard,
  ClipboardPaste,
  RefreshCw,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronsUp,
  ChevronsDown,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Minimize2,
  PanelBottomOpen,
  PanelBottomClose,
} from 'lucide-react';
import { generateSelfieFromPrompt } from '../utils/selfiePromptEngine';
import { LEGAL_INSTITUTES, LegalInstitute } from '../data/institutes';
import {
  InstitutionLogoConfig,
  getEffectiveLogo,
  getInstitutionLogoConfig,
} from '../utils/institutionLogoStorage';
import { InstitutionLogoConfigDialog } from './InstitutionLogoConfigDialog';

interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Card Editing Option (Both at once vs Separate cards)
  editMode: CardEditMode;
  onUpdateEditMode: (mode: CardEditMode) => void;
  syncCards?: boolean;
  onToggleSync?: (sync: boolean) => void;
  onSyncStudentToLibrary?: () => void;
  onSyncLibraryToStudent?: () => void;

  // Card 1: Student ID Details
  studentDetails: StudentDetails;
  onUpdateStudent: (details: StudentDetails) => void;
  photoUrl: string;
  onUpdatePhoto: (url: string) => void;
  photoAdjustments: PhotoAdjustments;
  onUpdatePhotoAdjustments: (adjustments: PhotoAdjustments) => void;
  signatureConfig: SignatureConfig;
  onUpdateSignature: (config: SignatureConfig) => void;

  // Card 2: Library ID Details
  libraryDetails: LibraryDetails;
  onUpdateLibrary: (details: LibraryDetails) => void;
  libraryStudentDetails: StudentDetails;
  onUpdateLibraryStudent: (details: StudentDetails) => void;
  libraryPhotoUrl: string;
  onUpdateLibraryPhoto: (url: string) => void;
  libraryPhotoAdjustments: PhotoAdjustments;
  onUpdateLibraryPhotoAdjustments: (adjustments: PhotoAdjustments) => void;
  librarySignatureConfig: SignatureConfig;
  onUpdateLibrarySignature: (config: SignatureConfig) => void;

  // New Card Types: Employment/Work ID & Loyalty VIP Card & Nepal Driving License
  employmentDetails?: EmploymentDetails;
  onUpdateEmployment?: (details: EmploymentDetails) => void;
  loyaltyDetails?: LoyaltyDetails;
  onUpdateLoyalty?: (details: LoyaltyDetails) => void;
  nepalDlDetails?: NepalDrivingLicenseDetails;
  onUpdateNepalDl?: (details: NepalDrivingLicenseDetails) => void;

  // Shared Institute Branding
  instituteConfig: InstituteConfig;
  onUpdateInstitute: (config: InstituteConfig) => void;
  onOpenInstituteSwitcher?: () => void;

  // Institution Logo Management (Temporary & Permanent)
  allLogoConfigs?: Record<string, InstitutionLogoConfig>;
  onSaveLogoConfig?: (updatedConfig: InstitutionLogoConfig) => void;
  currentInstituteId?: string;
  onOpenGlobalLogoManager?: () => void;

  initialTab?: TabType;
  onViewCardOnStage?: (cardType: 'student' | 'work' | 'library' | 'loyalty' | 'driving_license') => void;
  settings?: RealismSettings;
}

export type TabType = 'photo' | 'student' | 'work' | 'library' | 'loyalty' | 'driving_license' | 'institute' | 'signatures';

const PRESET_STUDENT_PORTRAITS = [
  {
    id: 'isabella',
    name: 'Isabella Rose',
    title: 'Default Official Portrait',
    url: ASSETS.defaultPassportPhoto,
  },
  {
    id: 'aaditya',
    name: 'Aaditya Sharma',
    title: 'Science & Tech Student',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'priya',
    name: 'Priya Adhikari',
    title: 'Engineering Student',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'milan',
    name: 'Milan Thapa',
    title: 'Management Graduate',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
];

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  editMode,
  onUpdateEditMode,
  syncCards,
  onToggleSync,
  onSyncStudentToLibrary,
  onSyncLibraryToStudent,
  studentDetails,
  onUpdateStudent,
  libraryDetails,
  onUpdateLibrary,
  libraryStudentDetails,
  onUpdateLibraryStudent,
  instituteConfig,
  onUpdateInstitute,
  onOpenInstituteSwitcher,
  signatureConfig,
  onUpdateSignature,
  librarySignatureConfig,
  onUpdateLibrarySignature,
  employmentDetails = INITIAL_EMPLOYMENT_DETAILS,
  onUpdateEmployment,
  loyaltyDetails = INITIAL_LOYALTY_DETAILS,
  onUpdateLoyalty,
  nepalDlDetails = INITIAL_NEPAL_DL_DETAILS,
  onUpdateNepalDl,
  photoUrl,
  onUpdatePhoto,
  photoAdjustments,
  onUpdatePhotoAdjustments,
  libraryPhotoUrl,
  onUpdateLibraryPhoto,
  libraryPhotoAdjustments,
  onUpdateLibraryPhotoAdjustments,
  initialTab = 'photo',
  onViewCardOnStage,
  settings = INITIAL_REALISM_SETTINGS,
  allLogoConfigs = {},
  onSaveLogoConfig,
  currentInstituteId,
  onOpenGlobalLogoManager,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [isLogoConfigDialogOpen, setIsLogoConfigDialogOpen] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const studentSigRef = useRef<HTMLInputElement>(null);
  const authoritySigRef = useRef<HTMLInputElement>(null);
  const librarianSigRef = useRef<HTMLInputElement>(null);

  // Active institution resolution for logo management
  const activeLegalInstitute: LegalInstitute = React.useMemo(() => {
    if (currentInstituteId) {
      const found = LEGAL_INSTITUTES.find((i) => i.id === currentInstituteId);
      if (found) return found;
    }
    const foundByName = LEGAL_INSTITUTES.find(
      (i) => i.name.trim().toLowerCase() === instituteConfig.name.trim().toLowerCase()
    );
    return foundByName || LEGAL_INSTITUTES[0];
  }, [currentInstituteId, instituteConfig.name]);

  const activeLogoInfo = React.useMemo(() => {
    return getEffectiveLogo(allLogoConfigs, activeLegalInstitute);
  }, [allLogoConfigs, activeLegalInstitute]);

  // Prompt based selfie state
  const [selfiePrompt, setSelfiePrompt] = useState('');
  const [isGeneratingFromPrompt, setIsGeneratingFromPrompt] = useState(false);
  const [promptNotice, setPromptNotice] = useState<string | null>(null);

  // Webcam Selfie State
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pull Up / Down Card Editing Mode state (collapses header to see down to the card)
  const [isEditingModeCollapsed, setIsEditingModeCollapsed] = useState<boolean>(false);

  // Modal presentation mode:
  // 'normal' (standard modal), 'fullscreen' (pulled up 98vh), or 'peek' (pulled down to bottom dock to see stage)
  const [modalViewMode, setModalViewMode] = useState<'normal' | 'fullscreen' | 'peek'>('normal');

  // Modal body scroll reference and scroll states for seeing down to the card
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState<boolean>(true);
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);

  const handleScrollDownToCard = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({
        top: modalBodyRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollUpToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleModalBodyScroll = () => {
    if (modalBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalBodyRef.current;
      setIsScrolledDown(scrollTop > 60);
      setCanScrollDown(scrollTop + clientHeight < scrollHeight - 40);
    }
  };

  const handleModalPastePromptAndGenerate = async (customPrompt?: string) => {
    let promptToUse = (typeof customPrompt === 'string' ? customPrompt : selfiePrompt).trim();

    // Only attempt clipboard if input is empty
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
        console.info('Clipboard read permission not available:', e);
      }
    }

    if (!promptToUse) {
      promptToUse = '22yo smiling student with studio passport lighting, white backdrop';
      setSelfiePrompt(promptToUse);
    }

    setIsGeneratingFromPrompt(true);
    setPromptNotice('✨ Generating portrait with AI...');

    try {
      const result = await generateSelfieFromPrompt(promptToUse);
      handleActivePhotoChange(result.url);
      handleActivePhotoAdjustmentsChange(result.adjustments);
      setPromptNotice('✅ Generated & applied to card!');
      setTimeout(() => setPromptNotice(null), 3000);
    } catch (err) {
      console.error(err);
      setPromptNotice('Failed to generate selfie.');
      setTimeout(() => setPromptNotice(null), 2500);
    } finally {
      setIsGeneratingFromPrompt(false);
    }
  };

  const handleEmploymentChange = <K extends keyof EmploymentDetails>(field: K, value: EmploymentDetails[K]) => {
    if (onUpdateEmployment) {
      onUpdateEmployment({
        ...employmentDetails,
        [field]: value,
      });
    }
  };

  const handleLoyaltyChange = <K extends keyof LoyaltyDetails>(field: K, value: LoyaltyDetails[K]) => {
    if (onUpdateLoyalty) {
      onUpdateLoyalty({
        ...loyaltyDetails,
        [field]: value,
      });
    }
  };

  // 100% Real Dark Ink Signature Engine state
  const [inkTone, setInkTone] = useState<'deep_dark' | 'midnight_black' | 'royal_blue'>('deep_dark');
  const [signatureProcessingField, setSignatureProcessingField] = useState<string | null>(null);
  const [signatureStatusMessage, setSignatureStatusMessage] = useState<string | null>(null);

  const handleSignatureUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'studentSignatureUrl' | 'authoritySignatureUrl' | 'librarianSignatureUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureProcessingField(field);
    setSignatureStatusMessage('Processing: Removing paper background & rendering 100% Real Dark Ink...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        try {
          const cleanDarkUrl = await processSignatureTransparent(rawDataUrl, {
            inkTone,
            autoCropMargins: true,
          });
          handleSignatureChange(field, cleanDarkUrl);
          setSignatureStatusMessage('✓ 100% Real Dark Ink signature applied! Background removed & strokes enhanced.');
          setTimeout(() => setSignatureStatusMessage(null), 3500);
        } catch {
          handleSignatureChange(field, rawDataUrl);
        } finally {
          setSignatureProcessingField(null);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReEnhanceSignature = async (
    field: 'studentSignatureUrl' | 'authoritySignatureUrl' | 'librarianSignatureUrl'
  ) => {
    const currentUrl = signatureConfig[field];
    if (!currentUrl) return;

    setSignatureProcessingField(field);
    setSignatureStatusMessage('Re-processing signature into 100% Real Dark Ink...');
    try {
      const cleanDarkUrl = await processSignatureTransparent(currentUrl, {
        inkTone,
        autoCropMargins: true,
      });
      handleSignatureChange(field, cleanDarkUrl);
      setSignatureStatusMessage('✓ Enhanced to 100% Real Dark Ink!');
      setTimeout(() => setSignatureStatusMessage(null), 3000);
    } catch {
      // fallback
    } finally {
      setSignatureProcessingField(null);
    }
  };

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    // Cleanup webcam stream when modal closes
    if (!isOpen && webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
      setIsWebcamOpen(false);
    }
  }, [isOpen, webcamStream]);

  if (!isOpen) return null;

  const isBoth = editMode === 'both';
  const isLibraryOnly = editMode === 'library';
  const isStudentOnly = editMode === 'student';

  // Active Photo & Adjustments targeted by user based on mode
  const currentTargetPhoto = isLibraryOnly ? libraryPhotoUrl : photoUrl;
  const currentTargetAdjustments = isLibraryOnly ? libraryPhotoAdjustments : photoAdjustments;

  const handleActivePhotoChange = (newUrl: string) => {
    if (isBoth) {
      onUpdatePhoto(newUrl);
      onUpdateLibraryPhoto(newUrl);
    } else if (isLibraryOnly) {
      onUpdateLibraryPhoto(newUrl);
    } else {
      onUpdatePhoto(newUrl);
    }
  };

  const handleActivePhotoAdjustmentsChange = (newAdj: PhotoAdjustments) => {
    if (isBoth) {
      onUpdatePhotoAdjustments(newAdj);
      onUpdateLibraryPhotoAdjustments(newAdj);
    } else if (isLibraryOnly) {
      onUpdateLibraryPhotoAdjustments(newAdj);
    } else {
      onUpdatePhotoAdjustments(newAdj);
    }
  };

  const handleStudentChange = (field: keyof StudentDetails, value: string) => {
    const updatedStudent: StudentDetails = { ...studentDetails, [field]: value };
    if (field === 'program') {
      updatedStudent.level = value;
    }
    onUpdateStudent(updatedStudent);
    if (isBoth) {
      const updatedLib: StudentDetails = { ...libraryStudentDetails, [field]: value };
      if (field === 'program') {
        updatedLib.level = value;
      }
      onUpdateLibraryStudent(updatedLib);
    }
  };

  const handleLibraryStudentChange = (field: keyof StudentDetails, value: string) => {
    const updatedLib: StudentDetails = { ...libraryStudentDetails, [field]: value };
    if (field === 'program') {
      updatedLib.level = value;
    }
    onUpdateLibraryStudent(updatedLib);
    if (isBoth) {
      const updatedStudent: StudentDetails = { ...studentDetails, [field]: value };
      if (field === 'program') {
        updatedStudent.level = value;
      }
      onUpdateStudent(updatedStudent);
    }
  };

  const handleLibraryChange = (field: keyof LibraryDetails, value: string | number) => {
    onUpdateLibrary({ ...libraryDetails, [field]: value });
  };

  const handleInstituteChange = (field: keyof InstituteConfig, value: string | null) => {
    onUpdateInstitute({ ...instituteConfig, [field]: value });
  };

  const handleSignatureChange = (field: keyof SignatureConfig, value: string | null) => {
    if (isBoth) {
      onUpdateSignature({ ...signatureConfig, [field]: value });
      onUpdateLibrarySignature({ ...librarySignatureConfig, [field]: value });
    } else if (isLibraryOnly) {
      onUpdateLibrarySignature({ ...librarySignatureConfig, [field]: value });
    } else {
      onUpdateSignature({ ...signatureConfig, [field]: value });
    }
  };

  // Image Upload helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSuccess(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // If user activated Peek Mode: dock modal to bottom so they can see down to the main stage cards
  if (modalViewMode === 'peek') {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 p-2 sm:p-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom duration-200">
        <div className="pointer-events-auto bg-white rounded-2xl w-full max-w-3xl shadow-2xl border-2 border-blue-600 flex flex-col overflow-hidden">
          {/* Pull Up Dock Header */}
          <div
            onClick={() => setModalViewMode('normal')}
            className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-blue-950 transition-colors select-none"
            title="Click or drag to pull up full editor"
          >
            <div className="flex items-center gap-2">
              <ChevronsUp className="w-4 h-4 text-amber-300 animate-bounce" />
              <div>
                <span className="text-xs font-black tracking-wide">
                  Card Editor Pulled Down (Stage Peek Mode)
                </span>
                <span className="text-[10.5px] text-blue-200 hidden sm:inline sm:ml-2">
                  Seeing main stage cards • Click to pull up full editor
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalViewMode('normal');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-transform transform active:scale-95"
              >
                <ChevronUp className="w-4 h-4" /> Pull Up Full Editor
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/20 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Compact Quick Dock Controls */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-slate-700 uppercase tracking-wider text-[10.5px]">Mode:</span>
              <div className="inline-flex p-0.5 bg-white rounded-lg border border-slate-300 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => onUpdateEditMode('both')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    isBoth ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both at Once
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateEditMode('student')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    isStudentOnly ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student ID
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateEditMode('library')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    isLibraryOnly ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Library Card
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalViewMode('normal')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer flex items-center gap-1"
              >
                <span>Open Tabs &amp; Form Details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3.5 h-3.5" /> Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl w-full ${
          modalViewMode === 'fullscreen' ? 'max-w-4xl max-h-[98vh] h-[98vh]' : 'max-w-3xl max-h-[92vh]'
        } overflow-hidden shadow-2xl border border-slate-200 flex flex-col transition-all duration-200`}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              {instituteConfig.customLogoUrl ? (
                <img
                  src={instituteConfig.customLogoUrl}
                  alt="Institute Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <TribhuvanLogo size={32} />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Card Customizer &amp; Credentials
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Edit both cards together or customize Student ID and Library ID independently.
              </p>
            </div>
          </div>

          {/* Top Right Header Controls: Pull Down Peek, Pull Up Fullscreen, and Close */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Pull Down / Peek Stage Button */}
            <button
              type="button"
              onClick={() => setModalViewMode('peek')}
              className="px-2 sm:px-2.5 py-1 rounded-lg text-slate-700 hover:text-blue-800 bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
              title="Pull down editor into bottom bar to see main stage card unobstructed"
            >
              <ChevronDown className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden xs:inline">Pull Down (Peek Stage)</span>
            </button>

            {/* Pull Up Fullscreen / Normal Toggle */}
            <button
              type="button"
              onClick={() => setModalViewMode(modalViewMode === 'fullscreen' ? 'normal' : 'fullscreen')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={modalViewMode === 'fullscreen' ? 'Restore standard modal size' : 'Pull up full height (Expand)'}
            >
              {modalViewMode === 'fullscreen' ? (
                <Minimize2 className="w-4 h-4 text-slate-700" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROMINENT CARD EDITING OPTION BAR */}
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-teal-50/60 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Card Editing Mode:
              </span>
              {isBoth ? (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                  <Link className="w-2.5 h-2.5" /> Both at Once (Synced)
                </span>
              ) : isStudentOnly ? (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                  <School className="w-2.5 h-2.5" /> Card 1 Only (Student ID)
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200 inline-flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5" /> Card 2 Only (Library Card)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isBoth
                ? 'Editing both at once: Student name, roll no, academic program, and photo sync across Card 1 and Card 2.'
                : isStudentOnly
                ? 'Editing Student ID Card only: Changes will not affect the Library Card.'
                : 'Editing Library ID Card only: Changes will not affect the Student ID Card.'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="inline-flex p-0.5 bg-white rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => onUpdateEditMode('both')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  isBoth
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit both cards simultaneously"
              >
                <Link className="w-3 h-3" />
                <span>Both at Once</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateEditMode('student');
                  setActiveTab('student');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  isStudentOnly
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit Student ID Card independently"
              >
                <School className="w-3 h-3" />
                <span>Student ID</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateEditMode('library');
                  setActiveTab('library');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  isLibraryOnly
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Edit Library Card independently"
              >
                <BookOpen className="w-3 h-3" />
                <span>Library Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Helpers Row when in separate mode */}
        {!isBoth && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-medium text-amber-900">
              💡 Separate editing active. You can clone information between cards with 1 click:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSyncStudentToLibrary}
                className="text-[10.5px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Copy Name, Program, Roll No, and Photo from Student Card into Library Card"
              >
                <Copy className="w-2.5 h-2.5" /> Copy Student ➔ Library
              </button>
              <button
                type="button"
                onClick={onSyncLibraryToStudent}
                className="text-[10.5px] font-bold text-teal-700 hover:text-teal-900 bg-white hover:bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Copy Name, Program, Roll No, and Photo from Library Card into Student Card"
              >
                <Copy className="w-2.5 h-2.5" /> Copy Library ➔ Student
              </button>
              <button
                type="button"
                onClick={() => onUpdateEditMode('both')}
                className="text-[10.5px] font-bold text-slate-700 hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-0.5"
              >
                <Link className="w-2.5 h-2.5" /> Switch to Both at Once
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/50 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'photo'
                ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-700" />
            {isBoth ? 'Passport Photo (Both)' : isStudentOnly ? 'Student Photo (Card 1)' : 'Library Photo (Card 2)'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'student'
                ? 'border-blue-700 text-blue-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5 text-blue-700" />
            {isBoth ? 'Student Details (Both)' : 'Card 1: Student ID'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'library'
                ? 'border-teal-700 text-teal-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            {isBoth ? 'Library Records' : 'Card 2: Library ID'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'work'
                ? 'border-indigo-700 text-indigo-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
            <span>Work / Employment ID</span>
            <span className="bg-indigo-100 text-indigo-800 text-[9.5px] px-1.5 py-0.2 rounded font-extrabold uppercase">
              Staff
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'loyalty'
                ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Loyalty &amp; VIP Card</span>
            <span className="bg-amber-100 text-amber-800 text-[9.5px] px-1.5 py-0.2 rounded font-extrabold uppercase">
              VIP
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driving_license')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'driving_license'
                ? 'border-emerald-600 text-emerald-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nepal Driving License</span>
            <span className="bg-emerald-100 text-emerald-800 text-[9.5px] px-1.5 py-0.2 rounded font-extrabold uppercase">
              Front
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('institute')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'institute'
                ? 'border-indigo-700 text-indigo-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
            Institute &amp; Logo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signatures')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'signatures'
                ? 'border-purple-700 text-purple-900 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-purple-700" />
            Signatures Upload
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 0: PASSPORT PHOTO / SELFIE UPLOAD & CAMERA */}
          {activeTab === 'photo' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-700" /> Official Passport Photo / Selfie Customizer
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload your photograph or take a live selfie. Calibrated to CR-80 card 35×45mm ratio with 100% solid opacity.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[10.5px] font-semibold text-slate-500">Target:</span>
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-md border border-slate-200 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => onUpdateEditMode('both')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        isBoth ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Both Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateEditMode('student')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        isStudentOnly ? 'bg-blue-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Card 1 Only
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateEditMode('library')}
                      className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                        isLibraryOnly ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Card 2 Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Photo Action Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left Column: Photo Preview Frame & Quick Upload */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-blue-600 bg-white shadow-md flex items-center justify-center mb-3">
                    <img
                      src={currentTargetPhoto}
                      alt="Student Portrait"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      style={{
                        transform: `scale(${currentTargetAdjustments.zoom}) translate(${currentTargetAdjustments.offsetX}px, ${currentTargetAdjustments.offsetY}px)`,
                        filter: `brightness(${currentTargetAdjustments.brightness}%) contrast(${currentTargetAdjustments.contrast}%)`,
                      }}
                    />
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      35×45 mm
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-800 mb-0.5 truncate max-w-full">
                    {isLibraryOnly ? libraryStudentDetails.name : studentDetails.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mb-2">
                    {isLibraryOnly ? `Member: ${libraryDetails.memberNo}` : `ID: ${studentDetails.idNumber}`}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 border bg-white text-slate-700 border-slate-200">
                    {isBoth ? '🔗 Applies to Both Cards' : isStudentOnly ? '🪪 Card 1 (Student ID)' : '📚 Card 2 (Library ID)'}
                  </span>

                  <div className="w-full space-y-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photo / Selfie
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (dataUrl) => handleActivePhotoChange(dataUrl))}
                    />

                    {/* User Requested: Box near upload photo button with "Paste Prompt" button */}
                    <div className="p-2 bg-purple-50/80 border border-purple-300 rounded-xl space-y-1.5 text-left shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" /> AI Selfie Studio
                        </span>
                        {promptNotice && (
                          <span className="text-[10px] text-emerald-700 font-bold truncate">
                            {promptNotice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 bg-white border border-purple-200 rounded-lg p-0.5 shadow-inner">
                        <input
                          type="text"
                          value={selfiePrompt}
                          onChange={(e) => setSelfiePrompt(e.target.value)}
                          onPaste={(e) => {
                            const pasted = e.clipboardData.getData('text');
                            if (pasted && pasted.trim()) {
                              setSelfiePrompt(pasted.trim());
                              handleModalPastePromptAndGenerate(pasted.trim());
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleModalPastePromptAndGenerate();
                          }}
                          placeholder="Paste prompt for selfie..."
                          className="text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full px-1.5 py-1"
                          title="Enter or paste prompt describing the selfie portrait (automatically generates on paste or enter)"
                        />
                        <button
                          type="button"
                          onClick={() => handleModalPastePromptAndGenerate()}
                          disabled={isGeneratingFromPrompt}
                          className="px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                          title="Generate image according to this prompt (or paste from clipboard)"
                        >
                          {isGeneratingFromPrompt ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <ClipboardPaste className="w-3 h-3 text-purple-200" />
                              <span>{selfiePrompt.trim() ? 'Generate' : 'Paste Prompt'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (isWebcamOpen) {
                          if (webcamStream) {
                            webcamStream.getTracks().forEach((track) => track.stop());
                            setWebcamStream(null);
                          }
                          setIsWebcamOpen(false);
                        } else {
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
                            console.warn('Webcam permission denied:', err);
                            alert('Webcam could not be opened. Please upload an image file instead.');
                          }
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-700" />
                      {isWebcamOpen ? 'Close Webcam' : 'Take Live Selfie'}
                    </button>
                  </div>
                </div>

                {/* Right Column: Framing, Cropping, & Preset Library */}
                <div className="md:col-span-8 space-y-4">
                  {/* Webcam Live View (if active) */}
                  {isWebcamOpen && (
                    <div className="p-4 bg-slate-900 text-white rounded-xl shadow-lg space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Camera className="w-4 h-4" /> Live Webcam Active - Align face within frame
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (webcamStream) {
                              webcamStream.getTracks().forEach((track) => track.stop());
                              setWebcamStream(null);
                            }
                            setIsWebcamOpen(false);
                          }}
                          className="text-slate-400 hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="relative w-full max-w-[280px] h-[210px] mx-auto bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                        {/* Oval Face Guide */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-28 h-36 border-2 border-dashed border-amber-400/80 rounded-full" />
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (!videoRef.current) return;
                            const canvas = document.createElement('canvas');
                            canvas.width = videoRef.current.videoWidth || 480;
                            canvas.height = videoRef.current.videoHeight || 480;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              // mirror selfie
                              ctx.translate(canvas.width, 0);
                              ctx.scale(-1, 1);
                              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                              handleActivePhotoChange(dataUrl);
                              if (webcamStream) {
                                webcamStream.getTracks().forEach((track) => track.stop());
                                setWebcamStream(null);
                              }
                              setIsWebcamOpen(false);
                            }
                          }}
                          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          Capture Selfie &amp; Use on {isBoth ? 'Both Cards' : isStudentOnly ? 'Student ID Card' : 'Library ID Card'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Framing / Zoom / Pan Sliders */}
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ZoomIn className="w-4 h-4 text-blue-700" /> Photo Framing &amp; Alignment
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleActivePhotoAdjustmentsChange({
                            zoom: 1.0,
                            offsetY: 0,
                            offsetX: 0,
                            brightness: 100,
                            contrast: 100,
                          })
                        }
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Alignment
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      {/* Zoom */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Zoom Scale</span>
                          <span className="font-bold">{Math.round(currentTargetAdjustments.zoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.75"
                          max="1.75"
                          step="0.02"
                          value={currentTargetAdjustments.zoom}
                          onChange={(e) =>
                            handleActivePhotoAdjustmentsChange({
                              ...currentTargetAdjustments,
                              zoom: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Vertical Pan (Offset Y) */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Vertical Center (Y)</span>
                          <span className="font-bold">{currentTargetAdjustments.offsetY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          step="1"
                          value={currentTargetAdjustments.offsetY}
                          onChange={(e) =>
                            handleActivePhotoAdjustmentsChange({
                              ...currentTargetAdjustments,
                              offsetY: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Horizontal Pan (Offset X) */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Horizontal Center (X)</span>
                          <span className="font-bold">{currentTargetAdjustments.offsetX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-35"
                          max="35"
                          step="1"
                          value={currentTargetAdjustments.offsetX}
                          onChange={(e) =>
                            handleActivePhotoAdjustmentsChange({
                              ...currentTargetAdjustments,
                              offsetX: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Brightness */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700">
                          <span>Portrait Brightness</span>
                          <span className="font-bold">{currentTargetAdjustments.brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="135"
                          step="1"
                          value={currentTargetAdjustments.brightness}
                          onChange={(e) =>
                            handleActivePhotoAdjustmentsChange({
                              ...currentTargetAdjustments,
                              brightness: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sample Student Portraits Presets */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      Or Choose a Curated Sample Student Portrait
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRESET_STUDENT_PORTRAITS.map((p) => {
                        const isSelected = currentTargetPhoto === p.url;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              handleActivePhotoChange(p.url);
                              handleActivePhotoAdjustmentsChange({
                                zoom: 1.0,
                                offsetY: 0,
                                offsetX: 0,
                                brightness: 100,
                                contrast: 100,
                              });
                            }}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <img
                              src={p.url}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-11 object-cover object-top rounded-md flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {p.title}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Student ID Card Information */}
          {activeTab === 'student' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-700" /> Academic & Personal Credentials
                </span>
                <span className="text-[11px] text-slate-500">Appears on Card 1</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={studentDetails.name}
                    onChange={(e) => handleStudentChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={studentDetails.idNumber}
                    onChange={(e) => handleStudentChange('idNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Program
                  </label>
                  <input
                    type="text"
                    value={studentDetails.program}
                    onChange={(e) => handleStudentChange('program', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                    placeholder="e.g. B.Sc. Computer Science & IT (B.Sc. CSIT)"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Faculty / Institute
                  </label>
                  <input
                    type="text"
                    value={studentDetails.faculty || ''}
                    onChange={(e) => handleStudentChange('faculty', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                    placeholder="e.g. Institute of Science & Technology"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department / Campus Branch
                  </label>
                  <input
                    type="text"
                    value={studentDetails.department}
                    onChange={(e) => handleStudentChange('department', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                    placeholder="e.g. Central Department of CSIT"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Roll No.
                  </label>
                  <input
                    type="text"
                    value={studentDetails.rollNo}
                    onChange={(e) => handleStudentChange('rollNo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={studentDetails.session}
                    onChange={(e) => handleStudentChange('session', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={studentDetails.dateOfBirth}
                    onChange={(e) => handleStudentChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={studentDetails.bloodGroup}
                    onChange={(e) => handleStudentChange('bloodGroup', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-semibold bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Issue
                  </label>
                  <input
                    type="text"
                    value={studentDetails.issueDate || '2022 Dec 01'}
                    onChange={(e) => handleStudentChange('issueDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-900 font-medium"
                    placeholder="e.g. 2022 Dec 01"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-red-700">
                    Valid Until (Expiry Date)
                  </label>
                  <input
                    type="text"
                    value={studentDetails.validUntil || '2026 Nov 30'}
                    onChange={(e) => handleStudentChange('validUntil', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 text-slate-900 font-bold"
                    placeholder="e.g. 2026 Nov 30"
                  />
                </div>
              </div>

              {/* Live Interactive Card Preview for Student ID Card */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-blue-500/30 shadow-inner flex flex-col items-center justify-center mt-3">
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-blue-200 mb-2 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Student ID Preview • {previewSide.toUpperCase()} SURFACE</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3 text-blue-400" />
                      <span>Flip ({previewSide === 'front' ? 'Front' : 'Back'})</span>
                    </button>
                    {onViewCardOnStage && (
                      <button
                        type="button"
                        onClick={() => {
                          onViewCardOnStage('student');
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Display Student ID Card on main stage"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View on Stage</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full flex justify-center overflow-x-auto py-2">
                  <div className="scale-90 sm:scale-100 origin-center transition-transform">
                    <StudentIDCard
                      details={studentDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={previewSide}
                      status="approved"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Library ID Card Information */}
          {activeTab === 'library' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-teal-700" /> Card 2: Library ID Credentials &amp; Records
                </span>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {isBoth ? '🔗 Synced with Student Card' : '📚 Independent Card 2'}
                </span>
              </div>

              {/* Section A: Member Credentials physically printed on Library Card */}
              <div className="p-4 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-teal-700" /> Member Details on Library Card
                    </h4>
                    <p className="text-[11px] text-teal-700/80">
                      {isBoth
                        ? 'Connected: Edits here automatically update both Student ID and Library ID cards.'
                        : 'Independent: You can set custom holder details exclusively for the Library Card.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Member Full Name
                    </label>
                    <input
                      type="text"
                      value={isBoth ? studentDetails.name : libraryStudentDetails.name}
                      onChange={(e) => {
                        if (isBoth) {
                          handleStudentChange('name', e.target.value);
                        } else {
                          handleLibraryStudentChange('name', e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Academic Program
                    </label>
                    <input
                      type="text"
                      value={isBoth ? studentDetails.program : libraryStudentDetails.program}
                      onChange={(e) => {
                        if (isBoth) {
                          handleStudentChange('program', e.target.value);
                        } else {
                          handleLibraryStudentChange('program', e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Roll No. / Student Ref
                    </label>
                    <input
                      type="text"
                      value={isBoth ? studentDetails.rollNo : libraryStudentDetails.rollNo}
                      onChange={(e) => {
                        if (isBoth) {
                          handleStudentChange('rollNo', e.target.value);
                        } else {
                          handleLibraryStudentChange('rollNo', e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-bold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Circulation & Library Specific Data */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Circulation &amp; Borrowing Records
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Library Member No.
                    </label>
                    <input
                      type="text"
                      value={libraryDetails.memberNo}
                      onChange={(e) => handleLibraryChange('memberNo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Borrower Category
                    </label>
                    <input
                      type="text"
                      value={libraryDetails.borrowerCategory}
                      onChange={(e) => handleLibraryChange('borrowerCategory', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Valid Up To (Expiry Date)
                    </label>
                    <input
                      type="text"
                      value={libraryDetails.validUntil}
                      onChange={(e) => handleLibraryChange('validUntil', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Book Quota Limit (Books)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={libraryDetails.bookLimit}
                      onChange={(e) => handleLibraryChange('bookLimit', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Date of Issue
                    </label>
                    <input
                      type="text"
                      value={libraryDetails.issueDate}
                      onChange={(e) => handleLibraryChange('issueDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Library Branch / Location
                    </label>
                    <input
                      type="text"
                      value={libraryDetails.libraryBranch}
                      onChange={(e) => handleLibraryChange('libraryBranch', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Live Interactive Card Preview for Library ID Card */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-teal-500/30 shadow-inner flex flex-col items-center justify-center mt-3">
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-teal-200 mb-2 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span>Live Library ID Preview • {previewSide.toUpperCase()} SURFACE</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3 text-teal-400" />
                      <span>Flip ({previewSide === 'front' ? 'Front' : 'Back'})</span>
                    </button>
                    {onViewCardOnStage && (
                      <button
                        type="button"
                        onClick={() => {
                          onViewCardOnStage('library');
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Display Library ID Card on main stage"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View on Stage</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full flex justify-center overflow-x-auto py-2">
                  <div className="scale-90 sm:scale-100 origin-center transition-transform">
                    <LibraryIDCard
                      studentDetails={isBoth ? studentDetails : libraryStudentDetails}
                      libraryDetails={libraryDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={librarySignatureConfig}
                      photoUrl={isBoth ? photoUrl : (libraryPhotoUrl || photoUrl)}
                      photoAdjustments={isBoth ? photoAdjustments : (libraryPhotoAdjustments || photoAdjustments)}
                      settings={settings}
                      side={previewSide}
                      status="approved"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Work & Employment ID Details */}
          {activeTab === 'work' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-700" /> Employment Verification &amp; Staff Credentials
                  </span>
                  <span className="text-[11px] text-slate-500">Work ID Card Profile</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Flip ({previewSide === 'front' ? 'Front' : 'Back'})</span>
                  </button>

                  {onViewCardOnStage && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewCardOnStage('work');
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Display Work / Employment ID Card on the main stage"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View on Main Stage</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Interactive Card Preview */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-indigo-500/30 shadow-inner flex flex-col items-center justify-center">
                <div className="text-[11px] font-bold text-indigo-200 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Briefcase className="w-3 h-3 text-indigo-400" />
                  <span>Live Card Preview • {previewSide.toUpperCase()} SURFACE</span>
                </div>
                <div className="w-full flex justify-center overflow-x-auto py-2">
                  <div className="scale-90 sm:scale-100 origin-center transition-transform">
                    <WorkIDCard
                      details={employmentDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={photoUrl}
                      photoAdjustments={photoAdjustments}
                      settings={settings}
                      side={previewSide}
                      status="approved"
                    />
                  </div>
                </div>
              </div>

              {/* Workplace & Card Logo Switcher */}
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-indigo-200 p-1 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                    {instituteConfig.customLogoUrl ? (
                      <img
                        src={instituteConfig.customLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : employmentDetails.companyOrOrgName && !employmentDetails.companyOrOrgName.toUpperCase().includes('TRIBHUVAN') ? (
                      <KathmanduModelCollegeLogo size={36} />
                    ) : (
                      <TribhuvanLogo size={36} />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-indigo-950 block">Workplace &amp; Card Logo</span>
                    <span className="text-[11px] text-indigo-700">
                      Current: {employmentDetails.companyOrOrgName || 'Kathmandu Model College'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleEmploymentChange('companyOrOrgName', 'Kathmandu Model College');
                      handleEmploymentChange('workLocation', 'Kathmandu Model College, Bagbazar, Kathmandu');
                      handleLoyaltyChange('organizationName', 'Kathmandu Model College');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    title="Set workplace to Kathmandu Model College and use KMC logo"
                  >
                    KMC Logo &amp; Name
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleEmploymentChange('companyOrOrgName', 'Tribhuvan University');
                      handleEmploymentChange('workLocation', 'Central Campus, Kirtipur, Kathmandu');
                      handleLoyaltyChange('organizationName', 'Tribhuvan University');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    title="Set workplace to Tribhuvan University and use TU logo"
                  >
                    TU Logo &amp; Name
                  </button>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Logo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employee Full Name
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.employeeName}
                    onChange={(e) => handleEmploymentChange('employeeName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff / Employee ID
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.employeeId}
                    onChange={(e) => handleEmploymentChange('employeeId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Designation / Official Job Title
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.designation}
                    onChange={(e) => handleEmploymentChange('designation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.department}
                    onChange={(e) => handleEmploymentChange('department', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employment Type
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.employmentType}
                    onChange={(e) => handleEmploymentChange('employmentType', e.target.value)}
                    placeholder="e.g. Full-Time Faculty / Permanent Staff"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Access Level Clearance
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.accessLevel}
                    onChange={(e) => handleEmploymentChange('accessLevel', e.target.value)}
                    placeholder="e.g. Level 4 • Server Room & Research Labs"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Work Location / Campus Building
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.workLocation}
                    onChange={(e) => handleEmploymentChange('workLocation', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.bloodGroup}
                    onChange={(e) => handleEmploymentChange('bloodGroup', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.issueDate}
                    onChange={(e) => handleEmploymentChange('issueDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valid Until / Expiry
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.validUntil}
                    onChange={(e) => handleEmploymentChange('validUntil', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Emergency Helpline
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.emergencyContact}
                    onChange={(e) => handleEmploymentChange('emergencyContact', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organization / Employer Name
                  </label>
                  <input
                    type="text"
                    value={employmentDetails.companyOrOrgName}
                    onChange={(e) => handleEmploymentChange('companyOrOrgName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Loyalty & Rewards Card Details */}
          {activeTab === 'loyalty' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" /> VIP Loyalty &amp; Privilege Membership Details
                  </span>
                  <span className="text-[11px] text-slate-500">Executive Luxury Card Profile</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewSide(previewSide === 'front' ? 'back' : 'front')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flip ({previewSide === 'front' ? 'Front' : 'Back'})</span>
                  </button>

                  {onViewCardOnStage && (
                    <button
                      type="button"
                      onClick={() => {
                        onViewCardOnStage('loyalty');
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Display Executive VIP Loyalty Card on the main stage"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View on Main Stage</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Interactive Card Preview */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-amber-500/30 shadow-inner flex flex-col items-center justify-center">
                <div className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Live Card Preview • {previewSide.toUpperCase()} SURFACE</span>
                </div>
                <div className="w-full flex justify-center overflow-x-auto py-2">
                  <div className="scale-90 sm:scale-100 origin-center transition-transform">
                    <LoyaltyCard
                      details={loyaltyDetails}
                      instituteConfig={instituteConfig}
                      signatureConfig={signatureConfig}
                      photoUrl={libraryPhotoUrl || photoUrl}
                      photoAdjustments={libraryPhotoAdjustments || photoAdjustments}
                      settings={settings}
                      side={previewSide}
                      status="approved"
                    />
                  </div>
                </div>
              </div>

              {/* Institution / Loyalty Club Logo Switcher */}
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-amber-200 p-1 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden">
                    {instituteConfig.customLogoUrl ? (
                      <img
                        src={instituteConfig.customLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : loyaltyDetails.organizationName && loyaltyDetails.organizationName.toUpperCase().includes('TRIBHUVAN') ? (
                      <TribhuvanLogo size={36} />
                    ) : (
                      <KathmanduModelCollegeLogo size={36} />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 block">Institution / Club Logo</span>
                    <span className="text-[11px] text-amber-800">
                      Current: {loyaltyDetails.organizationName || 'Kathmandu Model College'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      handleLoyaltyChange('organizationName', 'Kathmandu Model College');
                      handleEmploymentChange('companyOrOrgName', 'Kathmandu Model College');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    title="Set club institution to Kathmandu Model College"
                  >
                    KMC Logo &amp; Name
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleLoyaltyChange('organizationName', 'Tribhuvan University');
                      handleEmploymentChange('companyOrOrgName', 'Tribhuvan University');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                    title="Set club institution to Tribhuvan University"
                  >
                    TU Logo &amp; Name
                  </button>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Upload Logo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Member Full Name
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.memberName}
                    onChange={(e) => handleLoyaltyChange('memberName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loyalty Member ID / Card No.
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.memberId}
                    onChange={(e) => handleLoyaltyChange('memberId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Membership Tier
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.tier}
                    onChange={(e) => handleLoyaltyChange('tier', e.target.value)}
                    placeholder="e.g. Gold VIP Member / Platinum Elite"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Loyalty Points Balance
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.pointsBalance}
                    onChange={(e) => handleLoyaltyChange('pointsBalance', e.target.value)}
                    placeholder="e.g. 5,420 PTS"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cashback / Privilege Value
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.cashbackValue}
                    onChange={(e) => handleLoyaltyChange('cashbackValue', e.target.value)}
                    placeholder="e.g. $54.20 Available"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Program / Club Title
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.programName}
                    onChange={(e) => handleLoyaltyChange('programName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institution / Workplace / College Name
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.organizationName || 'Kathmandu Model College'}
                    onChange={(e) => handleLoyaltyChange('organizationName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Member Since (Year / Date)
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.memberSince}
                    onChange={(e) => handleLoyaltyChange('memberSince', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valid Thru / Expiry
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.validUntil}
                    onChange={(e) => handleLoyaltyChange('validUntil', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-medium bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    VIP Privileges &amp; Perks Summary
                  </label>
                  <input
                    type="text"
                    value={loyaltyDetails.perksSummary}
                    onChange={(e) => handleLoyaltyChange('perksSummary', e.target.value)}
                    placeholder="e.g. 15% Bookstore & Dining • Priority Parking • VIP Lounge Access"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 text-slate-900 font-medium bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Nepal Driving License (Front) */}
          {activeTab === 'driving_license' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-700" /> Nepal Driving License (Front)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Government-issued CR-80 format with laser-engraved B&amp;W photo and exact coordinate mapping.
                  </p>
                </div>

                {onViewCardOnStage && (
                  <button
                    type="button"
                    onClick={() => onViewCardOnStage('driving_license')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View on Stage
                  </button>
                )}
              </div>

              {/* Live Interactive Card Preview */}
              <div className="bg-slate-900 rounded-2xl p-4 border border-emerald-500/30 shadow-inner flex flex-col items-center justify-center">
                <div className="text-[11px] font-bold text-emerald-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Nepal Driving License Preview • FRONT SURFACE</span>
                </div>
                <div className="w-full flex justify-center overflow-x-auto py-2">
                  <div className="scale-85 sm:scale-95 origin-center transition-transform">
                    <NepalDrivingLicenseCard
                      id="modal-nepal-dl-preview"
                      details={nepalDlDetails}
                      settings={settings}
                    />
                  </div>
                </div>
              </div>

              {/* Editor Form & Sub-sections */}
              <NepalDrivingLicenseEditor
                details={nepalDlDetails}
                onChange={(updated) => onUpdateNepalDl && onUpdateNepalDl(updated)}
              />
            </div>
          )}

          {/* TAB 3: Institute Name & Logo Customization */}
          {activeTab === 'institute' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-700" /> Institute Branding & Logo
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">• Synchronized across both cards</span>
                </div>

                {onOpenInstituteSwitcher && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenInstituteSwitcher();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Choose from 105+ Accredited Institutes</span>
                  </button>
                )}
              </div>

              {/* Logo Management Box with Per-Institution Independent Config */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl bg-white border-2 border-indigo-200 p-2 flex items-center justify-center shadow-xs overflow-hidden flex-shrink-0">
                      {instituteConfig.customLogoUrl ? (
                        <img
                          src={instituteConfig.customLogoUrl}
                          alt="Institute Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <TribhuvanLogo size={52} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900">
                          {activeLegalInstitute.shortName} Institution Logo
                        </h4>
                        {activeLogoInfo.mode === 'temporary' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            🟡 Temporary Logo Active
                          </span>
                        ) : activeLogoInfo.mode === 'permanent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                            🟣 Permanent Custom Logo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            🟢 Official Default Logo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Active: <span className="font-semibold text-slate-700">{activeLogoInfo.name}</span>.
                        Each of the 105+ institutions maintains its own independent logo configuration.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Primary Change Logo Button */}
                    <button
                      type="button"
                      onClick={() => setIsLogoConfigDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                      title="Open full logo manager for this institution (select presets, upload, toggle temporary/permanent)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Change Logo</span>
                    </button>

                    {/* Open Global All-Institutions Manager */}
                    {onOpenGlobalLogoManager && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenGlobalLogoManager();
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                        title="Manage logos for all 105+ institutions at once"
                      >
                        <Building2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>All Logos</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct quick action pill buttons */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>Upload File Directly</span>
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, (url) => {
                          if (onSaveLogoConfig && activeLegalInstitute) {
                            const currentCfg = getInstitutionLogoConfig(allLogoConfigs, activeLegalInstitute);
                            onSaveLogoConfig({
                              ...currentCfg,
                              permanentLogoUrl: url,
                              permanentLogoName: 'Uploaded Logo',
                              isTemporaryActive: false,
                            });
                          }
                          handleInstituteChange('customLogoUrl', url);
                        })
                      }
                    />

                    {/* Quick Temporary / Permanent Mode Toggle */}
                    {activeLogoInfo.mode === 'temporary' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onSaveLogoConfig && activeLegalInstitute) {
                            const currentCfg = getInstitutionLogoConfig(allLogoConfigs, activeLegalInstitute);
                            onSaveLogoConfig({
                              ...currentCfg,
                              isTemporaryActive: false,
                            });
                            // Refresh canvas logo to permanent or default
                            const nextEff = getEffectiveLogo(
                              { ...allLogoConfigs, [activeLegalInstitute.id]: { ...currentCfg, isTemporaryActive: false } },
                              activeLegalInstitute
                            );
                            handleInstituteChange('customLogoUrl', nextEff.url);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold cursor-pointer"
                        title="Deactivate temporary logo and revert to permanent/default logo"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-700" />
                        <span>Deactivate Temp</span>
                      </button>
                    ) : (
                      activeLogoInfo.mode === 'permanent' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSaveLogoConfig && activeLegalInstitute) {
                              const currentCfg = getInstitutionLogoConfig(allLogoConfigs, activeLegalInstitute);
                              onSaveLogoConfig({
                                ...currentCfg,
                                permanentLogoUrl: null,
                                permanentLogoName: undefined,
                                isTemporaryActive: false,
                              });
                              const defaultEff = getEffectiveLogo(
                                { ...allLogoConfigs, [activeLegalInstitute.id]: { ...currentCfg, permanentLogoUrl: null, isTemporaryActive: false } },
                                activeLegalInstitute
                              );
                              handleInstituteChange('customLogoUrl', defaultEff.url);
                            } else {
                              handleInstituteChange('customLogoUrl', null);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-medium cursor-pointer"
                          title="Restore institution's official default emblem"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>Restore Official Default</span>
                        </button>
                      )
                    )}
                  </div>

                  <span className="text-[10.5px] text-slate-400 italic">
                    Independent per institution
                  </span>
                </div>
              </div>

              {/* Text Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary University / Institute Name (English)
                  </label>
                  <input
                    type="text"
                    value={instituteConfig.name}
                    onChange={(e) => handleInstituteChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-extrabold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Native / Devanagari Name
                  </label>
                  <input
                    type="text"
                    value={instituteConfig.nativeName}
                    onChange={(e) => handleInstituteChange('nativeName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Establishment / Motto Note
                  </label>
                  <input
                    type="text"
                    value={instituteConfig.establishedText}
                    onChange={(e) => handleInstituteChange('establishedText', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus / Location Subtitle (Student Card)
                  </label>
                  <input
                    type="text"
                    value={instituteConfig.campusSubTitle}
                    onChange={(e) => handleInstituteChange('campusSubTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Library Subtitle (Library Card)
                  </label>
                  <input
                    type="text"
                    value={instituteConfig.librarySubTitle}
                    onChange={(e) => handleInstituteChange('librarySubTitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 focus:border-indigo-600 text-slate-900 font-bold uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Signature Upload Option */}
          {activeTab === 'signatures' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-purple-700" /> 100% Real Dark Ink Signature Engine
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload any photo or scan on paper — our algorithm strips the paper background and converts strokes into 100% real, authentic dark ink.
                  </p>
                </div>

                {/* Ink Tone Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Ink Tone:</span>
                  <button
                    type="button"
                    onClick={() => setInkTone('deep_dark')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      inkTone === 'deep_dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ✒️ Deep Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkTone('midnight_black')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      inkTone === 'midnight_black'
                        ? 'bg-black text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🖨️ Pure Black
                  </button>
                  <button
                    type="button"
                    onClick={() => setInkTone('royal_blue')}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      inkTone === 'royal_blue'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🖋️ Royal Blue
                  </button>
                </div>
              </div>

              {/* Status Message Notification */}
              {signatureStatusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{signatureStatusMessage}</span>
                </div>
              )}

              {/* Real Dark Ink Guarantee Banner */}
              <div className="p-3 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">100% Real Dark Ink Guarantee:</span> Every uploaded signature is enhanced with adaptive local-luminance background removal. It extracts only the pen strokes, boosts stroke density to 100% solid dark ink, and crops excess margins so your signature looks genuinely handwritten directly onto the ID card — never faded, gray, or like a pasted rectangle.
                </div>
              </div>

              {/* 1. Student / Holder Signature */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      1. Student / Member Signature (Holder's Sign)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your real scanned signature or photo of paper. Rendered on Student & Library cards.
                    </p>
                  </div>
                  {signatureConfig.studentSignatureUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 100% Real Dark Ink Loaded
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Signature Preview Box */}
                  <div className="w-40 h-14 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shadow-2xs relative">
                    {signatureProcessingField === 'studentSignatureUrl' ? (
                      <span className="text-[11px] text-purple-700 font-medium animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Darkening ink...
                      </span>
                    ) : signatureConfig.studentSignatureUrl ? (
                      <img
                        src={signatureConfig.studentSignatureUrl}
                        alt="Student signature"
                        className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125 brightness-95"
                      />
                    ) : (
                      <span
                        className="text-base font-serif italic font-bold"
                        style={{ fontFamily: signatureConfig.studentSignatureFont || "'Great Vibes', cursive", color: '#090d16' }}
                      >
                        {signatureConfig.studentSignatureText || studentDetails.name}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => studentSigRef.current?.click()}
                      disabled={signatureProcessingField !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Signature Image
                    </button>
                    <input
                      ref={studentSigRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSignatureUpload(e, 'studentSignatureUrl')}
                    />

                    {signatureConfig.studentSignatureUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReEnhanceSignature('studentSignatureUrl')}
                          disabled={signatureProcessingField !== null}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Re-process current signature with selected ink tone"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Deepen Ink
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignatureChange('studentSignatureUrl', null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Use Cursive Script
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Typed fallback config */}
                {!signatureConfig.studentSignatureUrl && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                        Typed Cursive Name
                      </label>
                      <input
                        type="text"
                        value={signatureConfig.studentSignatureText}
                        onChange={(e) => handleSignatureChange('studentSignatureText', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800"
                        placeholder="e.g. Isabella R."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Campus Chief / Authority Signature */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      2. Campus Chief / Registrar Signature
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Official issuer endorsement for Student ID Card & Work ID.
                    </p>
                  </div>
                  {signatureConfig.authoritySignatureUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 100% Real Dark Ink Loaded
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-40 h-14 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shadow-2xs relative">
                    {signatureProcessingField === 'authoritySignatureUrl' ? (
                      <span className="text-[11px] text-purple-700 font-medium animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Darkening ink...
                      </span>
                    ) : signatureConfig.authoritySignatureUrl ? (
                      <img
                        src={signatureConfig.authoritySignatureUrl}
                        alt="Authority signature"
                        className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125 brightness-95"
                      />
                    ) : (
                      <span
                        className="text-base font-serif italic font-bold"
                        style={{ fontFamily: "'Playfair Display', cursive", color: '#090d16' }}
                      >
                        {signatureConfig.authoritySignatureName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => authoritySigRef.current?.click()}
                      disabled={signatureProcessingField !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Official Signature
                    </button>
                    <input
                      ref={authoritySigRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSignatureUpload(e, 'authoritySignatureUrl')}
                    />

                    {signatureConfig.authoritySignatureUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReEnhanceSignature('authoritySignatureUrl')}
                          disabled={signatureProcessingField !== null}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Re-process current signature with selected ink tone"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Deepen Ink
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignatureChange('authoritySignatureUrl', null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset Default
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={signatureConfig.authoritySignatureName}
                      onChange={(e) => handleSignatureChange('authoritySignatureName', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                      Official Title / Designation
                    </label>
                    <input
                      type="text"
                      value={signatureConfig.authorityTitle}
                      onChange={(e) => handleSignatureChange('authorityTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Chief Librarian Signature */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      3. Chief Librarian Signature
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Authorized signature on Library Membership Card.
                    </p>
                  </div>
                  {signatureConfig.librarianSignatureUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> 100% Real Dark Ink Loaded
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-40 h-14 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shadow-2xs relative">
                    {signatureProcessingField === 'librarianSignatureUrl' ? (
                      <span className="text-[11px] text-purple-700 font-medium animate-pulse flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Darkening ink...
                      </span>
                    ) : signatureConfig.librarianSignatureUrl ? (
                      <img
                        src={signatureConfig.librarianSignatureUrl}
                        alt="Librarian signature"
                        className="max-h-full max-w-full object-contain mix-blend-multiply contrast-125 brightness-95"
                      />
                    ) : (
                      <span
                        className="text-base font-serif italic font-bold"
                        style={{ fontFamily: "'Great Vibes', cursive", color: '#090d16' }}
                      >
                        {signatureConfig.librarianSignatureName}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => librarianSigRef.current?.click()}
                      disabled={signatureProcessingField !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Librarian Sign
                    </button>
                    <input
                      ref={librarianSigRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSignatureUpload(e, 'librarianSignatureUrl')}
                    />

                    {signatureConfig.librarianSignatureUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleReEnhanceSignature('librarianSignatureUrl')}
                          disabled={signatureProcessingField !== null}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Re-process current signature with selected ink tone"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          Deepen Ink
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSignatureChange('librarianSignatureUrl', null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                      Librarian Name
                    </label>
                    <input
                      type="text"
                      value={signatureConfig.librarianSignatureName}
                      onChange={(e) => handleSignatureChange('librarianSignatureName', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={signatureConfig.librarianTitle}
                      onChange={(e) => handleSignatureChange('librarianTitle', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Changes update both physical cards in real-time.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Done & Apply
          </button>
        </div>
      </div>

      {/* Institution Logo Config Dialog */}
      {isLogoConfigDialogOpen && onSaveLogoConfig && activeLegalInstitute && (
        <InstitutionLogoConfigDialog
          isOpen={isLogoConfigDialogOpen}
          onClose={() => setIsLogoConfigDialogOpen(false)}
          institute={activeLegalInstitute}
          allConfigs={allLogoConfigs}
          onSaveConfig={(updated) => {
            onSaveLogoConfig(updated);
            const eff = getEffectiveLogo(
              { ...allLogoConfigs, [updated.institutionId]: updated },
              activeLegalInstitute
            );
            handleInstituteChange('customLogoUrl', eff.url);
          }}
          isCurrentlyActiveOnCanvas={true}
        />
      )}
    </div>
  );
};

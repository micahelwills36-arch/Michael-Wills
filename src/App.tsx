import React, { useState, useRef } from 'react';
import { safeToPng } from './utils/exportImage';
import { StudentIDCard } from './components/StudentIDCard';
import { LibraryIDCard } from './components/LibraryIDCard';
import { WorkIDCard } from './components/WorkIDCard';
import { LoyaltyCard } from './components/LoyaltyCard';
import { NepalDrivingLicenseCard } from './components/NepalDrivingLicenseCard';
import { NepalDrivingLicenseCanvas } from './components/NepalDrivingLicenseCanvas';
import { RealismToolbar } from './components/RealismToolbar';
import { PhotoControls } from './components/PhotoControls';
import { CardEditorModal } from './components/CardEditorModal';
import { GraphicsAndTemplatesPanel } from './components/GraphicsAndTemplatesPanel';
import { ExportModal } from './components/ExportModal';
import { VerificationModal } from './components/VerificationModal';
import { AuditAndWorkflowModal } from './components/AuditAndWorkflowModal';
import { DesignCustomizerModal } from './components/DesignCustomizerModal';
import { InstituteSwitcherModal } from './components/InstituteSwitcherModal';
import { RealHumanPhotoGeneratorBox } from './components/RealHumanPhotoGeneratorBox';
import { EditableCardCanvas } from './components/EditableCardCanvas';
import { PrintRealisticPreviewModal } from './components/PrintRealisticPreviewModal';
import { InstitutionLogoManagerModal } from './components/InstitutionLogoManagerModal';
import { LegalInstitute, LEGAL_INSTITUTES } from './data/institutes';
import {
  InstitutionLogoConfig,
  loadAllInstitutionLogos,
  saveAllInstitutionLogos,
  getEffectiveLogo,
} from './utils/institutionLogoStorage';
import { CARD_TEMPLATES } from './templates';
import { RealisticMockupSettingsPanel } from './components/RealisticMockupSettingsPanel';
import {
  SingleCardMockupExporter,
  SingleCardMockupExporterRef,
} from './components/SingleCardMockupExporter';
import { CardActionMenu } from './components/CardActionMenu';
import { WatermarkSettingsModal } from './components/WatermarkSettingsModal';
import { PhysicalDocumentCaptureModal } from './components/PhysicalDocumentCaptureModal';
import {
  INITIAL_STUDENT_DETAILS,
  INITIAL_LIBRARY_DETAILS,
  INITIAL_EMPLOYMENT_DETAILS,
  INITIAL_LOYALTY_DETAILS,
  INITIAL_INSTITUTE_CONFIG,
  INITIAL_SIGNATURE_CONFIG,
  INITIAL_PHOTO_ADJUSTMENTS,
  INITIAL_REALISM_SETTINGS,
  INITIAL_DESIGN_CONFIG,
  INITIAL_VERIFICATION_RECORD,
  INITIAL_AUDIT_LOGS,
  DEFAULT_REALISTIC_MOCKUP_CONFIG,
  DEFAULT_WATERMARK_CONFIG,
  ASSETS,
} from './constants';
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
  RealismSettings,
  CardTemplate,
  TemplateId,
  CardEditMode,
  TabType,
  CardDisplayView,
  CardSide,
  UserRole,
  CardStatus,
  CardDesignConfig,
  VerificationRecord,
  AuditLogEntry,
  RealisticMockupConfig,
  WatermarkConfig,
  CompliantDocumentCaptureRecord,
} from './types';
import {
  CheckCircle2,
  Camera,
  Download,
  Info,
  Layers,
  Sparkles,
  FileBadge,
  Palette,
  ShieldCheck,
  Check,
  Edit3,
  Link2,
  Unlink,
  Copy,
  ArrowLeftRight,
  BookOpen,
  User,
  FileDown,
  Printer,
  QrCode,
  Sliders,
  Shield,
  Eye,
  RotateCw,
  Maximize2,
  Minimize2,
  Award,
  Building2,
  Calendar,
  Hash,
  Briefcase,
  Crown,
  CreditCard,
  Edit,
  Move,
} from 'lucide-react';

export default function App() {
  // Editable Canvas Foundation Mode Toggle
  const [isCanvasMode, setIsCanvasMode] = useState<boolean>(false);

  // Card 1 (Student ID) and Base Details
  const [studentDetails, setStudentDetails] = useState<StudentDetails>(INITIAL_STUDENT_DETAILS);
  const [libraryDetails, setLibraryDetails] = useState<LibraryDetails>(INITIAL_LIBRARY_DETAILS);
  const [instituteConfig, setInstituteConfig] = useState<InstituteConfig>(INITIAL_INSTITUTE_CONFIG);
  const [signatureConfig, setSignatureConfig] = useState<SignatureConfig>(INITIAL_SIGNATURE_CONFIG);
  const [photoAdjustments, setPhotoAdjustments] = useState<PhotoAdjustments>(INITIAL_PHOTO_ADJUSTMENTS);
  const [settings, setSettings] = useState<RealismSettings>(INITIAL_REALISM_SETTINGS);
  const [photoUrl, setPhotoUrl] = useState<string>(ASSETS.defaultPassportPhoto);

  // Card 2 (Library ID) Separate Details for Independent Editing
  const [libraryStudentDetails, setLibraryStudentDetails] = useState<StudentDetails>(INITIAL_STUDENT_DETAILS);
  const [libraryPhotoUrl, setLibraryPhotoUrl] = useState<string>(ASSETS.defaultPassportPhoto);
  const [libraryPhotoAdjustments, setLibraryPhotoAdjustments] = useState<PhotoAdjustments>(INITIAL_PHOTO_ADJUSTMENTS);
  const [librarySignatureConfig, setLibrarySignatureConfig] = useState<SignatureConfig>(INITIAL_SIGNATURE_CONFIG);

  // Additional Card Designs: Employment / Work ID, Loyalty Card, and Nepal Driving License
  const [card1Design, setCard1Design] = useState<'student' | 'work'>('student');
  const [card2Design, setCard2Design] = useState<'library' | 'loyalty'>('library');
  const [employmentDetails, setEmploymentDetails] = useState<EmploymentDetails>(INITIAL_EMPLOYMENT_DETAILS);
  const [loyaltyDetails, setLoyaltyDetails] = useState<LoyaltyDetails>(INITIAL_LOYALTY_DETAILS);
  const [nepalDlDetails, setNepalDlDetails] = useState<NepalDrivingLicenseDetails>(() => {
    try {
      const saved = localStorage.getItem('meta_nepal_dl_details');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NEPAL_DL_DETAILS;
  });
  const [nepalDlCanvasMode, setNepalDlCanvasMode] = useState<boolean>(false);

  // Sync nepalDlDetails to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('meta_nepal_dl_details', JSON.stringify(nepalDlDetails));
    } catch {}
  }, [nepalDlDetails]);

  // Screen Display View: 'both' | 'student_only' | 'library_only'
  // (Fulfills user request: "only display card 1 in screen removing another one also do with another one too")
  const [displayView, setDisplayView] = useState<CardDisplayView>('both');

  // Card Face: Front vs Back
  const [cardSide, setCardSide] = useState<CardSide>('front');

  // Preview Mode: Distraction-free full-focus view
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Card Edit Mode: 'both' | 'student' | 'library'
  const [cardEditMode, setCardEditMode] = useState<CardEditMode>('both');
  const [editorInitialTab, setEditorInitialTab] = useState<TabType>('photo');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Design, Print Bleed, Typography, PVC Specifications
  const [designConfig, setDesignConfig] = useState<CardDesignConfig>(INITIAL_DESIGN_CONFIG);

  // Institutional Database Record & QR Verification
  const [verificationRecord, setVerificationRecord] = useState<VerificationRecord>(INITIAL_VERIFICATION_RECORD);

  // Governance: Admin Approval Workflow, RBAC, and Audit History
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [cardStatus, setCardStatus] = useState<CardStatus>('approved');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Templates
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>('tu_central');
  const [currentTemplate, setCurrentTemplate] = useState<CardTemplate>(CARD_TEMPLATES[0]);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isInstituteSwitcherOpen, setIsInstituteSwitcherOpen] = useState(false);
  const [isPhotoGeneratorOpen, setIsPhotoGeneratorOpen] = useState(true);
  const [isMockupModalOpen, setIsMockupModalOpen] = useState(false);
  const [isLogoManagerOpen, setIsLogoManagerOpen] = useState(false);

  // Institution Logo Management (Independent per institution with Temporary / Permanent options)
  const [currentInstituteId, setCurrentInstituteId] = useState<string>('tu_central');
  const [institutionLogoConfigs, setInstitutionLogoConfigs] = useState<Record<string, InstitutionLogoConfig>>(() =>
    loadAllInstitutionLogos()
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // References for export
  const photoStageRef = useRef<HTMLDivElement>(null);

  // Realistic Mockup Tool: One-Click toggle, physical presentation configuration, and Single Card 1500x1000 Exporter
  const [mockupConfig, setMockupConfig] = useState<RealisticMockupConfig>(DEFAULT_REALISTIC_MOCKUP_CONFIG);
  const [isMockupSettingsOpen, setIsMockupSettingsOpen] = useState(false);
  const singleCardExporterRef = useRef<SingleCardMockupExporterRef>(null);

  // Security Watermark & Institutional Auto-Logo Configuration
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);

  // Front-End Document Capture Interface (Guided Physical Card Camera Verification)
  const [isPhysicalCaptureOpen, setIsPhysicalCaptureOpen] = useState(false);
  const [lastPhysicalCapture, setLastPhysicalCapture] = useState<CompliantDocumentCaptureRecord | null>(null);

  const handleToggleRealisticMockup = () => {
    setMockupConfig((prev) => {
      const nextState = !prev.enabled;
      setSyncNotice(
        nextState
          ? '📸 Realistic Physical-Card Mockup ON (Tabletop PVC Effect Applied)'
          : 'Realistic Mockup OFF (Original Appearance Restored)'
      );
      setTimeout(() => setSyncNotice(null), 3000);
      return { ...prev, enabled: nextState };
    });
  };

  const handleExportSingleCardFromToolbar = (format: 'png' | 'jpg' = 'png', layout?: any) => {
    if (displayView === 'driving_license_only') {
      const dlCardEl = document.getElementById('nepal-driving-license-front');
      if (dlCardEl) {
        import('./utils/exportImage').then(({ safeToPng }) => {
          safeToPng(dlCardEl, { pixelRatio: 3 }).then((dataUrl) => {
            const a = document.createElement('a');
            a.download = `Nepal-Driving-License-${(nepalDlDetails.dlNo || 'front').replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
            a.href = dataUrl;
            a.click();
          });
        });
      }
      return;
    }

    let cardToExport: 'student' | 'work' | 'library' | 'loyalty' = 'student';
    if (displayView === 'library_only') {
      cardToExport = card2Design === 'loyalty' ? 'loyalty' : 'library';
    } else if (displayView === 'student_only') {
      cardToExport = card1Design === 'work' ? 'work' : 'student';
    } else {
      cardToExport = card1Design === 'work' ? 'work' : 'student';
    }

    singleCardExporterRef.current?.exportCard({
      cardType: cardToExport,
      layout,
      format,
      side: cardSide,
    });
  };

  const handleOpenMockupStudio = (cardType?: 'student' | 'work' | 'library' | 'loyalty', layout?: any) => {
    let targetCard = cardType;
    if (!targetCard) {
      if (displayView === 'library_only') {
        targetCard = card2Design === 'loyalty' ? 'loyalty' : 'library';
      } else {
        targetCard = card1Design === 'work' ? 'work' : 'student';
      }
    }
    singleCardExporterRef.current?.openModalForCard(targetCard, layout);
  };

  // Save independent logo configuration for any institution
  const handleSaveInstitutionLogoConfig = (updatedConfig: InstitutionLogoConfig) => {
    setInstitutionLogoConfigs((prev) => {
      const next = { ...prev, [updatedConfig.institutionId]: updatedConfig };
      saveAllInstitutionLogos(next);
      return next;
    });

    // If updated config is for the active canvas institute, update canvas logo immediately
    if (updatedConfig.institutionId === currentInstituteId) {
      const inst = LEGAL_INSTITUTES.find((i) => i.id === updatedConfig.institutionId);
      if (inst) {
        const eff = getEffectiveLogo({ [updatedConfig.institutionId]: updatedConfig }, inst);
        setInstituteConfig((prev) => ({
          ...prev,
          customLogoUrl: eff.url,
        }));
      }
    }

    const instName =
      LEGAL_INSTITUTES.find((i) => i.id === updatedConfig.institutionId)?.shortName || updatedConfig.institutionId;
    setSyncNotice(
      `Saved logo settings for ${instName} (${
        updatedConfig.isTemporaryActive
          ? 'Temporary Mode'
          : updatedConfig.permanentLogoUrl
          ? 'Permanent Custom'
          : 'Default Official'
      })`
    );
    setTimeout(() => setSyncNotice(null), 3500);

    handleAddAuditLog({
      user: userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Department Staff',
      role: userRole,
      action: 'Institution Logo Updated',
      details: `Configured independent logo for ${instName}: ${
        updatedConfig.isTemporaryActive
          ? 'Temporary override active'
          : updatedConfig.permanentLogoUrl
          ? 'Permanent logo applied'
          : 'Restored default'
      }`,
    });
  };

  // Apply photo from Real Human Photo Generator Box / Webcam Studio
  const handleApplyPhotoFromGenerator = (url: string, adjustments?: Partial<PhotoAdjustments>) => {
    const adj: PhotoAdjustments = {
      zoom: adjustments?.zoom ?? 1.0,
      offsetX: adjustments?.offsetX ?? 0,
      offsetY: adjustments?.offsetY ?? 0,
      brightness: adjustments?.brightness ?? 100,
      contrast: adjustments?.contrast ?? 100,
    };

    if (cardEditMode === 'both' || cardEditMode === 'student') {
      setPhotoUrl(url);
      setPhotoAdjustments(adj);
    }
    if (cardEditMode === 'both' || cardEditMode === 'library') {
      setLibraryPhotoUrl(url);
      setLibraryPhotoAdjustments(adj);
    }

    setSyncNotice(
      cardEditMode === 'both'
        ? 'Real Human portrait applied to both Student & Library ID Cards!'
        : cardEditMode === 'student'
        ? 'Real Human portrait applied to Student ID Card (Card 1)!'
        : 'Real Human portrait applied to Library ID Card (Card 2)!'
    );
    setTimeout(() => setSyncNotice(null), 3000);
  };

  // Switch institutional credentials, Devanagari native lettering, and branch
  const handleSelectInstitute = (inst: LegalInstitute) => {
    setCurrentInstituteId(inst.id);
    const eff = getEffectiveLogo(institutionLogoConfigs, inst);

    setInstituteConfig({
      name: inst.name,
      nativeName: inst.nativeName,
      campusSubTitle: inst.campusSubTitle,
      librarySubTitle: inst.librarySubTitle,
      customLogoUrl: eff.url,
      establishedText: inst.establishedText,
    });

    if (inst.defaultProgram) {
      setStudentDetails((prev) => ({
        ...prev,
        faculty: inst.defaultFaculty || prev.faculty,
        program: inst.defaultProgram || prev.program,
      }));
      setLibraryStudentDetails((prev) => ({
        ...prev,
        faculty: inst.defaultFaculty || prev.faculty,
        program: inst.defaultProgram || prev.program,
      }));
    }

    setSyncNotice(`Successfully switched institute to: ${inst.name} (${inst.shortName})!`);
    setTimeout(() => setSyncNotice(null), 3500);

    handleAddAuditLog({
      user: userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Department Staff',
      role: userRole,
      action: 'Institutional Switch',
      details: `Switched institution to ${inst.name} (${inst.shortName}) with Devanagari seal`,
    });
  };

  // Open editor with specific tab and editing mode
  const handleOpenEditor = (tab: TabType = 'photo', mode?: CardEditMode) => {
    setEditorInitialTab(tab);
    if (mode) {
      setCardEditMode(mode);
    }
    setIsEditorOpen(true);
  };

  // Switch which card is displayed in focus on the main stage
  const handleViewCardOnStage = (card: 'student' | 'work' | 'library' | 'loyalty' | 'driving_license' | 'both') => {
    if (card === 'student') {
      setCard1Design('student');
      setDisplayView('student_only');
      setSyncNotice('Showing Card 1: Student ID Card in Focus');
    } else if (card === 'work') {
      setCard1Design('work');
      setDisplayView('student_only');
      setSyncNotice('Showing Card 1: Work / Employment ID Card in Focus');
    } else if (card === 'library') {
      setCard2Design('library');
      setDisplayView('library_only');
      setSyncNotice('Showing Card 2: Library ID Card in Focus');
    } else if (card === 'loyalty') {
      setCard2Design('loyalty');
      setDisplayView('library_only');
      setSyncNotice('Showing Card 2: Executive VIP Loyalty Card in Focus');
    } else if (card === 'driving_license') {
      setDisplayView('driving_license_only');
      setSyncNotice('Showing Nepal Driving License (Front) in Focus');
    } else if (card === 'both') {
      setDisplayView('both');
      setSyncNotice('Showing Dual Stage (Both Cards Side-by-Side)');
    }
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const getActiveDisplayedCardType = (): 'student' | 'work' | 'library' | 'loyalty' | 'driving_license' | 'both' => {
    if (displayView === 'both') return 'both';
    if (displayView === 'driving_license_only') return 'driving_license';
    if (displayView === 'student_only') {
      return card1Design === 'work' ? 'work' : 'student';
    }
    return card2Design === 'loyalty' ? 'loyalty' : 'library';
  };

  // Add an entry to the immutable audit log
  const handleAddAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handleCaptureDocumentSubmitted = (record: CompliantDocumentCaptureRecord) => {
    setLastPhysicalCapture(record);
    handleAddAuditLog({
      user: userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Document Verification Officer',
      role: userRole,
      action: 'Physical ID Captured',
      details: `Direct hardware camera capture verified (Resolution: ${record.quality.resolutionWidth}×${record.quality.resolutionHeight}, Brightness: ${record.quality.brightnessAverage}/255, Hash: ${record.exif.integrityHash.slice(0, 16)}...)`,
    });
    setSyncNotice(`✅ Compliant Physical ID verified & archived (${record.id})`);
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Synchronize Card 1 (Student) details to Card 2 (Library)
  const handleSyncStudentToLibrary = () => {
    setLibraryStudentDetails({ ...studentDetails });
    setLibraryPhotoUrl(photoUrl);
    setLibraryPhotoAdjustments({ ...photoAdjustments });
    setLibrarySignatureConfig({ ...signatureConfig });
    setSyncNotice('Synchronized Card 1 (Student ID) photo, name & details to Card 2 (Library ID)!');
    setTimeout(() => setSyncNotice(null), 3500);
    handleAddAuditLog({
      user: userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Department Staff',
      role: userRole,
      action: 'Card Synchronization (Card 1 → Card 2)',
      details: `Duplicated student record for ${studentDetails.name} into library circulation profile`,
    });
  };

  // Synchronize Card 2 (Library) details to Card 1 (Student)
  const handleSyncLibraryToStudent = () => {
    setStudentDetails({ ...libraryStudentDetails });
    setPhotoUrl(libraryPhotoUrl);
    setPhotoAdjustments({ ...libraryPhotoAdjustments });
    setSignatureConfig({ ...librarySignatureConfig });
    setSyncNotice('Synchronized Card 2 (Library ID) photo, name & details to Card 1 (Student ID)!');
    setTimeout(() => setSyncNotice(null), 3500);
    handleAddAuditLog({
      user: userRole === 'admin' ? 'Prof. Dr. Registrar (Admin)' : 'Department Staff',
      role: userRole,
      action: 'Card Synchronization (Card 2 → Card 1)',
      details: `Updated student record from library database profile for ${libraryStudentDetails.name}`,
    });
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    setActiveTemplateId(templateId);
    const found = CARD_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setCurrentTemplate(found);
      if (templateId === 'work_employment_id') {
        setCard1Design('work');
      } else {
        setCard1Design('student');
      }
      if (templateId === 'loyalty_vip') {
        setCard2Design('loyalty');
      } else {
        setCard2Design('library');
      }
    }
  };

  const handleDownloadPhoto = async () => {
    if (!photoStageRef.current) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const pixelRatio = settings.resolutionPreset === '4k_print' ? 3 : 2;
      const dataUrl = await safeToPng(photoStageRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio,
      });

      const link = document.createElement('a');
      link.download = `Tribhuvan_University_Official_ID_${studentDetails.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to capture photo stage:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Card perspective angles
  const getCard1Style = () => {
    if (mockupConfig.enabled) {
      switch (mockupConfig.perspective) {
        case 'flat':
          return { transform: 'rotate(0deg)' };
        case 'handheld':
          return { transform: 'perspective(1100px) rotateX(15deg) rotateY(11deg) rotateZ(2.5deg) translate3d(6px, -10px, 14px)' };
        case 'natural':
        default:
          return { transform: 'perspective(1200px) rotateX(12deg) rotateY(-8deg) rotateZ(-1.8deg) translate3d(0, -6px, 12px)' };
      }
    }
    const depth = settings.perspectiveDepth || 6;
    switch (settings.cameraPerspectivePreset) {
      case 'flat_overhead':
        return { transform: 'rotate(0deg)' };
      case 'subtle_desk_angle':
        return { transform: `perspective(1200px) rotateX(${depth * 1.4}deg) rotateY(-${depth}deg) rotateZ(-1deg)` };
      case 'scanner_copier_90deg':
        return { transform: 'none' };
      case 'isometric_display':
        return { transform: `perspective(1000px) rotateX(25deg) rotateY(-20deg) rotateZ(6deg)` };
      case 'natural_handheld':
      default:
        return { transform: `rotate(-1.5deg) translate3d(0, 0, 0)` };
    }
  };

  const getCard2Style = () => {
    if (mockupConfig.enabled) {
      switch (mockupConfig.perspective) {
        case 'flat':
          return { transform: 'rotate(0deg)' };
        case 'handheld':
          return { transform: 'perspective(1100px) rotateX(15deg) rotateY(-9deg) rotateZ(-2.2deg) translate3d(-6px, -10px, 14px)' };
        case 'natural':
        default:
          return { transform: 'perspective(1200px) rotateX(11deg) rotateY(9deg) rotateZ(1.6deg) translate3d(0, -6px, 12px)' };
      }
    }
    const depth = settings.perspectiveDepth || 6;
    switch (settings.cameraPerspectivePreset) {
      case 'flat_overhead':
        return { transform: 'rotate(0deg)' };
      case 'subtle_desk_angle':
        return { transform: `perspective(1200px) rotateX(${depth * 1.4}deg) rotateY(${depth * 0.8}deg) rotateZ(1.5deg)` };
      case 'scanner_copier_90deg':
        return { transform: 'none' };
      case 'isometric_display':
        return { transform: `perspective(1000px) rotateX(25deg) rotateY(-20deg) rotateZ(6deg)` };
      case 'natural_handheld':
      default:
        return { transform: `rotate(1.2deg) translate3d(0, 0, 0)` };
    }
  };

  const getCardMockupShadow = () => {
    if (!mockupConfig.enabled) return undefined;
    switch (mockupConfig.shadow) {
      case 'low':
        return '0 10px 24px -4px rgba(0, 0, 0, 0.38), 0 4px 8px -2px rgba(0,0,0,0.24)';
      case 'high':
        return '0 34px 68px -8px rgba(0, 0, 0, 0.65), 0 16px 28px -4px rgba(0, 0, 0, 0.42), 0 4px 8px rgba(0, 0, 0, 0.25)';
      case 'medium':
      default:
        return '0 22px 46px -6px rgba(0, 0, 0, 0.54), 0 10px 20px -4px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2)';
    }
  };

  const getBackgroundSurfaceStyle = () => {
    if (mockupConfig.enabled) {
      switch (mockupConfig.surface) {
        case 'varnished_oak':
          return {
            backgroundImage: `url(${ASSETS.varnishedOakTableBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundColor: '#2e190e',
          };
        case 'sunlight_wood':
          return {
            backgroundImage: `url(${ASSETS.sunlightShadowWoodBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundColor: '#382313',
          };
        case 'wood':
          return {
            backgroundColor: '#4a2810',
            backgroundImage: `
              radial-gradient(ellipse at 50% 36%, rgba(220, 135, 45, 0.32) 0%, rgba(45, 20, 5, 0.92) 100%),
              repeating-linear-gradient(90deg, rgba(30, 12, 3, 0.2) 0px, rgba(30, 12, 3, 0.2) 2px, transparent 2px, transparent 26px),
              repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 36px)
            `,
          };
        case 'neutral':
          return {
            backgroundColor: '#e2e8f0',
            backgroundImage: `
              radial-gradient(circle at 50% 40%, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%),
              radial-gradient(#94a3b8 0.75px, transparent 0.75px)
            `,
            backgroundSize: '100% 100%, 20px 20px',
          };
        case 'custom':
        default:
          return {
            backgroundImage: `url(${ASSETS.varnishedOakTableBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundColor: '#2e190e',
          };
      }
    }

    switch (settings.backgroundType) {
      case 'varnished_oak':
        return {
          backgroundImage: `url(${ASSETS.varnishedOakTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#2e190e',
        };
      case 'sunlight_wood':
        return {
          backgroundImage: `url(${ASSETS.sunlightShadowWoodBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#382313',
        };
      case 'bedsheet':
        return {
          backgroundColor: '#e2e8f0',
          backgroundImage: `url(${ASSETS.bedsheetBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'wooden_desk':
        return {
          backgroundImage: `url(${ASSETS.woodTableBg || ASSETS.varnishedOakTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#854d0e',
        };
      case 'linen_weave':
        return {
          backgroundColor: '#e2d9cc',
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #f5efe6 0%, #d8cdbe 100%),
            repeating-linear-gradient(45deg, rgba(120, 113, 108, 0.06) 0px, rgba(120, 113, 108, 0.06) 2px, transparent 2px, transparent 6px),
            repeating-linear-gradient(-45deg, rgba(120, 113, 108, 0.06) 0px, rgba(120, 113, 108, 0.06) 2px, transparent 2px, transparent 6px)
          `,
        };
      case 'dark_slate':
        return {
          backgroundColor: '#1e293b',
          backgroundImage: `
            radial-gradient(ellipse at 50% 30%, #334155 0%, #0f172a 100%),
            radial-gradient(#475569 0.75px, transparent 0.75px)
          `,
          backgroundSize: '100% 100%, 16px 16px',
        };
      case 'neutral_grey':
      default:
        return {
          backgroundImage: `url(${ASSETS.varnishedOakTableBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#2e190e',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-200">
      {/* Top Realism & Action Toolbar */}
      <RealismToolbar
        settings={settings}
        onUpdateSettings={setSettings}
        instituteConfig={instituteConfig}
        onOpenEditor={() => handleOpenEditor('student', cardEditMode)}
        onOpenPhotoUpload={() => handleOpenEditor('photo', cardEditMode)}
        onOpenInstituteSwitcher={() => setIsInstituteSwitcherOpen(true)}
        onOpenLogoManager={() => setIsLogoManagerOpen(true)}
        onTogglePhotoGenerator={() => setIsPhotoGeneratorOpen((prev) => !prev)}
        onDownloadPhoto={handleDownloadPhoto}
        isDownloading={isDownloading}
        activeCardType={getActiveDisplayedCardType()}
        onSelectCardToView={handleViewCardOnStage}
        onOpenMockupPreview={() => setIsMockupModalOpen(true)}
        mockupConfig={mockupConfig}
        onToggleRealisticMockup={handleToggleRealisticMockup}
        onOpenRealisticMockupSettings={() => setIsMockupSettingsOpen((prev) => !prev)}
        isMockupSettingsOpen={isMockupSettingsOpen}
        onExportSingleCard={handleExportSingleCardFromToolbar}
        onOpenMockupStudio={handleOpenMockupStudio}
      />

      {/* Expandable Realistic Mockup Settings Panel */}
      {isMockupSettingsOpen && (
        <div className="px-3 sm:px-6">
          <RealisticMockupSettingsPanel
            isOpen={isMockupSettingsOpen}
            onClose={() => setIsMockupSettingsOpen(false)}
            config={mockupConfig}
            onUpdateConfig={setMockupConfig}
            watermarkConfig={watermarkConfig}
            onUpdateWatermarkConfig={setWatermarkConfig}
            onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
          />
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-4">
        {/* Specification & Status Bar */}
        <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cardStatus === 'approved'
                  ? 'bg-emerald-500 animate-pulse'
                  : cardStatus === 'pending_approval'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              } flex-shrink-0`}
            />
            <span className="font-bold text-slate-900">Institutional Database Status:</span>
            <span className="text-slate-600 truncate">
              {verificationRecord.databaseId} • {cardStatus === 'approved' ? 'Active / Issued' : cardStatus.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-slate-600 font-medium">
            <button
              id="switch-institute-statusbar-btn"
              type="button"
              onClick={() => setIsInstituteSwitcherOpen(true)}
              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
              title="Browse and select from 105+ accredited constituent colleges and universities"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Switch Institute (105+)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verify QR / Database Record</span>
            </button>

            <button
              id="physical-doc-capture-header-btn"
              type="button"
              onClick={() => setIsPhysicalCaptureOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
              title="Real-time camera capture for physical ID cards with automated compliance and quality checks"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>Physical ID Capture</span>
              <span className="bg-amber-200 text-amber-900 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                Direct
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>Approval Workflow &amp; Audit ({auditLogs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-700" />
              <span>Export PDF / PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDesignModalOpen(true)}
              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
              <span>Design &amp; PVC Bleed</span>
            </button>
          </div>
        </div>

        {/* PRIMARY CARD SELECTION & DISPLAY SUITE: VIEW & EDIT ANY CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3 sm:p-3.5 text-white shadow-md flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap w-full xl:w-auto">
            <span className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 flex-shrink-0">
              <Layers className="w-4 h-4 text-indigo-400" /> View &amp; Edit Card:
            </span>

            {/* 5 Card Type Options: Student, Work, Library, Loyalty, Dual */}
            <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 gap-1 flex-wrap">
              {/* 1. Student ID Card */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('student')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'student_only' && card1Design === 'student'
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/60'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
                title="View and display Student ID Card on stage"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student ID</span>
              </button>

              {/* 2. Work / Employment ID Card */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('work')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'student_only' && card1Design === 'work'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/60'
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
                title="View and display Work / Employment Verification ID Card on stage"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work / Employment ID</span>
              </button>

              {/* 3. Library ID Card */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('library')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'library_only' && card2Design === 'library'
                    ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400/60'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
                title="View and display Library ID Card on stage"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Library ID</span>
              </button>

              {/* 4. Loyalty & VIP Card */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('loyalty')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'library_only' && card2Design === 'loyalty'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/60'
                    : 'text-amber-200 hover:text-white hover:bg-white/10'
                }`}
                title="View and display Executive VIP Loyalty Card on stage"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Loyalty VIP Card</span>
              </button>

              {/* 5. Nepal Driving License (Front) */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('driving_license')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'driving_license_only'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/60'
                    : 'text-emerald-200 hover:text-white hover:bg-white/10'
                }`}
                title="View and display Nepal Driving License (Front) with CR-80 coordinate alignment"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Nepal Driving License</span>
                <span className="text-[9.5px] bg-emerald-500/40 text-emerald-100 px-1 py-0.2 rounded font-extrabold">FRONT</span>
              </button>

              {/* 6. Dual Stage View */}
              <button
                type="button"
                onClick={() => handleViewCardOnStage('both')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  displayView === 'both'
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/60'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
                title="Display both cards side-by-side on stage"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dual View (Both)</span>
              </button>
            </div>
          </div>

          {/* Quick Direct Edit & Surface Controls */}
          <div className="flex items-center gap-2 flex-wrap self-stretch xl:self-auto justify-end">
            {/* Direct Edit Button for currently viewed card */}
            <button
              type="button"
              onClick={() => {
                if (displayView === 'driving_license_only') {
                  handleOpenEditor('driving_license');
                } else if (displayView === 'student_only') {
                  handleOpenEditor(card1Design === 'work' ? 'work' : 'student', 'student');
                } else if (displayView === 'library_only') {
                  handleOpenEditor(card2Design === 'loyalty' ? 'loyalty' : 'library', 'library');
                } else {
                  handleOpenEditor('student', 'both');
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-900 font-extrabold flex items-center gap-1.5 shadow-sm text-xs cursor-pointer transition-all border border-white"
              title="Open editor directly for active card"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-700" />
              <span>
                {displayView === 'driving_license_only'
                  ? 'Edit Nepal DL Details'
                  : displayView === 'student_only'
                  ? card1Design === 'work'
                    ? 'Edit Work ID Details'
                    : 'Edit Student ID Details'
                  : displayView === 'library_only'
                  ? card2Design === 'loyalty'
                    ? 'Edit Loyalty Card Details'
                    : 'Edit Library Card Details'
                  : 'Edit Card Details'}
              </span>
            </button>

            {/* Front / Back Surface Flip */}
            <div className="inline-flex p-0.5 bg-white/10 rounded-lg border border-white/20 text-[11px]">
              <button
                type="button"
                onClick={() => setCardSide('front')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardSide === 'front'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Front Face
              </button>
              <button
                type="button"
                onClick={() => setCardSide('back')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardSide === 'back'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Back Face
              </button>
            </div>

            {/* Preview Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 text-[11px] cursor-pointer transition-colors ${
                isPreviewMode
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Exit Focus' : 'Focus Preview'}</span>
            </button>

            {/* Editable Canvas Foundation Mode Toggle */}
            <button
              id="editable-canvas-toggle-btn"
              type="button"
              onClick={() => setIsCanvasMode(!isCanvasMode)}
              className={`px-3 py-1 rounded-lg border font-extrabold flex items-center gap-1.5 text-[11px] cursor-pointer transition-all shadow-xs ${
                isCanvasMode
                  ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-400/70'
                  : 'bg-indigo-600/90 border-indigo-400/80 text-white hover:bg-indigo-600'
              }`}
              title="Toggle interactive editable canvas foundation (Move, Resize, Rotate, Duplicate, Layers, Undo/Redo)"
            >
              <Move className="w-3.5 h-3.5" />
              <span>{isCanvasMode ? 'Exit Canvas Mode' : 'Editable Canvas Mode'}</span>
              {isCanvasMode && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Card Editing Mode Controller Bar: Separate vs. Synced */}
        {!isPreviewMode && (
          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-700" /> Independent vs Synced Editing:
              </span>

              {/* Mode Switcher Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => setCardEditMode('both')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    cardEditMode === 'both'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Edit both cards simultaneously with unified details"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Edit Both at Once
                </button>

                <button
                  type="button"
                  onClick={() => setCardEditMode('student')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    cardEditMode === 'student'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Edit Card 1 (Student ID) independently"
                >
                  <User className="w-3.5 h-3.5" />
                  Edit Card 1 (Student ID)
                </button>

                <button
                  type="button"
                  onClick={() => setCardEditMode('library')}
                  className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    cardEditMode === 'library'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Edit Card 2 (Library ID) independently"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Edit Card 2 (Library ID)
                </button>
              </div>
            </div>

            {/* Sync Helper Actions & Direct Edit Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-stretch md:self-auto justify-end">
              <button
                type="button"
                onClick={handleSyncStudentToLibrary}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
                title="Copy photo, student details & signature from Card 1 to Card 2"
              >
                <Copy className="w-3 h-3 text-blue-600" />
                Copy Card 1 → Card 2
              </button>

              <button
                type="button"
                onClick={handleSyncLibraryToStudent}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
                title="Copy photo, student details & signature from Card 2 to Card 1"
              >
                <Copy className="w-3 h-3 text-teal-600" />
                Copy Card 2 → Card 1
              </button>

              <button
                type="button"
                onClick={() => handleOpenEditor('student', cardEditMode)}
                className="px-3 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors text-[11px]"
              >
                <Edit3 className="w-3 h-3" />
                Open Details Editor
              </button>
            </div>
          </div>
        )}

        {/* Sync Notice Alert */}
        {syncNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}

        {/* Real Human Selfie & Passport Photo Generator Box Studio */}
        {!isPreviewMode && isPhotoGeneratorOpen && (
          <div className="relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                Real Human Passport Photo Box &amp; Live Selfie Studio
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoGeneratorOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer px-2.5 py-0.5 rounded-lg hover:bg-slate-200 transition-colors"
                title="Collapse photo generator box"
              >
                Hide Photo Box ✕
              </button>
            </div>
            <RealHumanPhotoGeneratorBox
              currentPhoto={cardEditMode === 'library' ? libraryPhotoUrl : photoUrl}
              onApplyPhoto={handleApplyPhotoFromGenerator}
              editMode={cardEditMode}
              onUpdateEditMode={setCardEditMode}
            />
          </div>
        )}

        {/* When collapsed, quick button to reopen */}
        {!isPreviewMode && !isPhotoGeneratorOpen && (
          <div className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Real Human Selfie &amp; Passport Photo Box is collapsed</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPhotoGeneratorOpen(true)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer transition-colors"
            >
              Open Photo Box
            </button>
          </div>
        )}

        {/* Primary Photographic Presentation Stage */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-md">
          {/* Surface & Mode Indicator Badge */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <div className="px-3 py-1 bg-black/65 backdrop-blur-md rounded-lg text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {settings.backgroundType === 'bedsheet'
                  ? 'Wrinkled Cotton Bedsheet'
                  : settings.backgroundType === 'wooden_desk'
                  ? 'Natural Teak Wooden Desk'
                  : settings.backgroundType === 'linen_weave'
                  ? 'Warm Linen Fabric'
                  : settings.backgroundType === 'dark_slate'
                  ? 'Dark Slate Tabletop'
                  : 'Neutral Grey Studio Backdrop'}
              </span>
            </div>

            <div className="px-2.5 py-1 bg-black/55 backdrop-blur-md rounded-lg text-white text-[10.5px] font-medium flex items-center gap-1.5">
              <span className="text-emerald-300 flex items-center gap-1 font-bold">
                {displayView === 'both' ? (
                  'Dual Card Stage'
                ) : displayView === 'student_only' ? (
                  'Showing Card 1 Only (Card 2 Removed)'
                ) : (
                  'Showing Card 2 Only (Card 1 Removed)'
                )}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-blue-200 uppercase font-mono text-[10px]">
                {cardSide} FACE
              </span>
            </div>
          </div>

          {/* Quick Action Buttons (Top Right of Stage) */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPhysicalCaptureOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-300"
              title="Open Physical Document Capture Studio (Upload PVC card, realistic wood background, visible hand, window sunlight and real smartphone EXIF metadata)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Physical Desk Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 bg-white/95 hover:bg-white text-blue-900 backdrop-blur-md rounded-lg text-xs font-bold shadow-xs border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export as PVC standard PDF or 300 DPI PNG"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">Export PDF/PNG</span>
              <span className="sm:hidden">Export</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPhoto}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download photograph in selected resolution"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Rendering...' : 'Photo'}</span>
            </button>
          </div>

          {/* The Photographic Canvas */}
          <div
            ref={photoStageRef}
            id="tribhuvan-photo-stage"
            className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden"
            style={getBackgroundSurfaceStyle()}
          >
            {/* Ambient Vignette & Overhead Sunlight / Bulb Lighting */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  settings.backgroundType === 'bedsheet'
                    ? 'radial-gradient(ellipse at 42% 38%, rgba(255,255,255,0.24) 0%, rgba(0,0,0,0.06) 65%, rgba(0,0,0,0.22) 100%)'
                    : 'radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.38) 0%, rgba(0,0,0,0.08) 100%)',
              }}
            />

            {/* Bedsheet Natural Fabric Folds Overlay */}
            {settings.backgroundType === 'bedsheet' && settings.bedsheetWrinkles && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply"
                style={{
                  backgroundImage:
                    'linear-gradient(115deg, transparent 20%, rgba(0,0,0,0.18) 35%, transparent 48%, rgba(0,0,0,0.14) 65%, transparent 80%)',
                }}
              />
            )}

            {/* Camera Sensor Grain Overlay */}
            {settings.grain > 0 && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  opacity: settings.grain / 100,
                  backgroundImage: `radial-gradient(#000 0.75px, transparent 0.75px), radial-gradient(#fff 0.75px, transparent 0.75px)`,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 2px 2px',
                }}
              />
            )}

            {/* Physical Cards Presentation Area (Respects Single-Card vs Dual View, and Editable Canvas Mode) */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 transition-all duration-300">
              {isCanvasMode ? (
                <EditableCardCanvas
                  id="editable-card-canvas"
                  studentDetails={
                    displayView === 'library_only'
                      ? cardEditMode === 'both'
                        ? studentDetails
                        : libraryStudentDetails
                      : studentDetails
                  }
                  instituteConfig={instituteConfig}
                  signatureConfig={
                    displayView === 'library_only'
                      ? cardEditMode === 'both'
                        ? signatureConfig
                        : librarySignatureConfig
                      : signatureConfig
                  }
                  photoUrl={
                    displayView === 'library_only'
                      ? cardEditMode === 'both'
                        ? photoUrl
                        : libraryPhotoUrl
                      : photoUrl
                  }
                  settings={settings}
                  designConfig={designConfig}
                />
              ) : (
                <>
                  {/* Card 1: Student ID or Work ID (Only shown when displayView is 'both' or 'student_only') */}
              {(displayView === 'both' || displayView === 'student_only') && (
                <div
                  className="flex flex-col items-center transition-transform duration-300"
                  style={displayView === 'student_only' ? { transform: 'none' } : getCard1Style()}
                >
                  <div className="mb-2 flex items-center justify-between gap-2 w-full max-w-[340px] select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex bg-white/95 border border-slate-300/80 rounded-lg p-0.5 shadow-2xs text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setCard1Design('student')}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            card1Design === 'student'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Switch Card 1 to Student ID"
                        >
                          Student ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setCard1Design('work')}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                            card1Design === 'work'
                              ? 'bg-indigo-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Switch Card 1 to Employment Verification / Work ID"
                        >
                          <Briefcase className="w-2.5 h-2.5" />
                          <span>Work ID</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-white/80 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {cardSide}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          singleCardExporterRef.current?.exportCard({
                            cardType: card1Design === 'work' ? 'work' : 'student',
                            side: cardSide,
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Export Single Card: 1500 × 1000 px Tabletop Mockup"
                      >
                        <Camera className="w-3 h-3" />
                        <span className="hidden sm:inline">1500×1000</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditor(card1Design === 'work' ? 'work' : 'student', 'student')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer border ${
                          card1Design === 'work'
                            ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                        title={card1Design === 'work' ? 'Edit Work ID & Employment Details' : 'Edit Student ID Details'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{card1Design === 'work' ? 'Edit Work' : 'Edit Student'}</span>
                      </button>

                      <CardActionMenu
                        cardTitle={card1Design === 'work' ? 'Work ID' : 'Student ID'}
                        cardType={card1Design === 'work' ? 'work' : 'student'}
                        currentSide={cardSide}
                        onExportSingle={(format, layout) =>
                          singleCardExporterRef.current?.exportCard({
                            cardType: card1Design === 'work' ? 'work' : 'student',
                            format,
                            layout,
                            side: cardSide,
                          })
                        }
                        onEdit={() => handleOpenEditor(card1Design === 'work' ? 'work' : 'student', 'student')}
                        onFlipSide={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                        onOpenStudio={() => handleOpenMockupStudio(card1Design === 'work' ? 'work' : 'student')}
                      />
                    </div>
                  </div>

                  {/* Physical Card Container with Mockup Effects */}
                  <div
                    className="relative rounded-[16px] transition-all"
                    style={{
                      boxShadow: getCardMockupShadow(),
                    }}
                  >
                    {mockupConfig.enabled && (
                      <>
                        {/* Specular glare reflection overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none z-30 rounded-[16px] transition-opacity"
                          style={{
                            opacity:
                              mockupConfig.reflection === 'low'
                                ? 0.14
                                : mockupConfig.reflection === 'high'
                                ? 0.38
                                : 0.24,
                            backgroundImage:
                              mockupConfig.lighting === 'studio'
                                ? 'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(255,255,255,0.15) 80%, transparent 100%)'
                                : 'linear-gradient(130deg, rgba(255,255,255,0.42) 0%, transparent 45%, rgba(255,255,255,0.12) 60%, transparent 100%)',
                          }}
                        />
                        {/* Micro-wear */}
                        {mockupConfig.wear !== 'none' && (
                          <div
                            className="absolute inset-0 pointer-events-none z-30 rounded-[16px]"
                            style={{
                              opacity: mockupConfig.wear === 'moderate' ? 0.32 : 0.18,
                              backgroundImage:
                                'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-35deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 18px)',
                            }}
                          />
                        )}
                      </>
                    )}

                    {card1Design === 'work' ? (
                      <WorkIDCard
                        id="card-student-left"
                        details={employmentDetails}
                        instituteConfig={instituteConfig}
                        signatureConfig={signatureConfig}
                        photoUrl={photoUrl}
                        photoAdjustments={photoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                        watermarkConfig={watermarkConfig}
                      />
                    ) : (
                      <StudentIDCard
                        id="card-student-left"
                        details={studentDetails}
                        instituteConfig={instituteConfig}
                        signatureConfig={signatureConfig}
                        photoUrl={photoUrl}
                        photoAdjustments={photoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                        theme={currentTemplate.studentCardTheme}
                        watermarkConfig={watermarkConfig}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Card 2: Library ID or Loyalty VIP Card (Only shown when displayView is 'both' or 'library_only') */}
              {(displayView === 'both' || displayView === 'library_only') && (
                <div
                  className="flex flex-col items-center transition-transform duration-300"
                  style={displayView === 'library_only' ? { transform: 'none' } : getCard2Style()}
                >
                  <div className="mb-2 flex items-center justify-between gap-2 w-full max-w-[340px] select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex bg-white/95 border border-slate-300/80 rounded-lg p-0.5 shadow-2xs text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setCard2Design('library')}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            card2Design === 'library'
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Switch Card 2 to Library ID"
                        >
                          Library ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setCard2Design('loyalty')}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                            card2Design === 'loyalty'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Switch Card 2 to Loyalty & VIP Card"
                        >
                          <Crown className="w-2.5 h-2.5" />
                          <span>Loyalty VIP</span>
                        </button>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-white/80 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {cardSide}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          singleCardExporterRef.current?.exportCard({
                            cardType: card2Design === 'loyalty' ? 'loyalty' : 'library',
                            side: cardSide,
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Export Single Card: 1500 × 1000 px Tabletop Mockup"
                      >
                        <Camera className="w-3 h-3" />
                        <span className="hidden sm:inline">1500×1000</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditor(card2Design === 'loyalty' ? 'loyalty' : 'library', 'library')}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer border ${
                          card2Design === 'loyalty'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-300'
                        }`}
                        title={card2Design === 'loyalty' ? 'Edit Loyalty Card & VIP Rewards' : 'Edit Library Card Details'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{card2Design === 'loyalty' ? 'Edit Loyalty' : 'Edit Library'}</span>
                      </button>

                      <CardActionMenu
                        cardTitle={card2Design === 'loyalty' ? 'Loyalty Card' : 'Library ID'}
                        cardType={card2Design === 'loyalty' ? 'loyalty' : 'library'}
                        currentSide={cardSide}
                        onExportSingle={(format, layout) =>
                          singleCardExporterRef.current?.exportCard({
                            cardType: card2Design === 'loyalty' ? 'loyalty' : 'library',
                            format,
                            layout,
                            side: cardSide,
                          })
                        }
                        onEdit={() => handleOpenEditor(card2Design === 'loyalty' ? 'loyalty' : 'library', 'library')}
                        onFlipSide={() => setCardSide(cardSide === 'front' ? 'back' : 'front')}
                        onOpenStudio={() => handleOpenMockupStudio(card2Design === 'loyalty' ? 'loyalty' : 'library')}
                      />
                    </div>
                  </div>

                  {/* Physical Card Container with Mockup Effects */}
                  <div
                    className="relative rounded-[16px] transition-all"
                    style={{
                      boxShadow: getCardMockupShadow(),
                    }}
                  >
                    {mockupConfig.enabled && (
                      <>
                        {/* Specular glare reflection overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none z-30 rounded-[16px] transition-opacity"
                          style={{
                            opacity:
                              mockupConfig.reflection === 'low'
                                ? 0.14
                                : mockupConfig.reflection === 'high'
                                ? 0.38
                                : 0.24,
                            backgroundImage:
                              mockupConfig.lighting === 'studio'
                                ? 'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(255,255,255,0.15) 80%, transparent 100%)'
                                : 'linear-gradient(130deg, rgba(255,255,255,0.42) 0%, transparent 45%, rgba(255,255,255,0.12) 60%, transparent 100%)',
                          }}
                        />
                        {/* Micro-wear */}
                        {mockupConfig.wear !== 'none' && (
                          <div
                            className="absolute inset-0 pointer-events-none z-30 rounded-[16px]"
                            style={{
                              opacity: mockupConfig.wear === 'moderate' ? 0.32 : 0.18,
                              backgroundImage:
                                'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-35deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 18px)',
                            }}
                          />
                        )}
                      </>
                    )}

                    {card2Design === 'loyalty' ? (
                      <LoyaltyCard
                        id="card-library-right"
                        details={loyaltyDetails}
                        instituteConfig={instituteConfig}
                        photoUrl={cardEditMode === 'both' ? photoUrl : libraryPhotoUrl}
                        photoAdjustments={cardEditMode === 'both' ? photoAdjustments : libraryPhotoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                        watermarkConfig={watermarkConfig}
                      />
                    ) : (
                      <LibraryIDCard
                        id="card-library-right"
                        studentDetails={cardEditMode === 'both' ? studentDetails : libraryStudentDetails}
                        libraryDetails={libraryDetails}
                        instituteConfig={instituteConfig}
                        signatureConfig={cardEditMode === 'both' ? signatureConfig : librarySignatureConfig}
                        photoUrl={cardEditMode === 'both' ? photoUrl : libraryPhotoUrl}
                        photoAdjustments={cardEditMode === 'both' ? photoAdjustments : libraryPhotoAdjustments}
                        settings={settings}
                        side={cardSide}
                        designConfig={designConfig}
                        verificationRecord={verificationRecord}
                        status={cardStatus}
                        theme={currentTemplate.libraryCardTheme}
                        watermarkConfig={watermarkConfig}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Card 3: Nepal Driving License (Front) (Only shown when displayView is 'driving_license_only') */}
              {displayView === 'driving_license_only' && (
                <div className="flex flex-col items-center transition-transform duration-300">
                  <div className="mb-2.5 flex items-center justify-between gap-2 w-full max-w-[540px] select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs shadow-xs">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Nepal Driving License</span>
                        <span className="bg-emerald-800 text-[10px] px-1 rounded">Front</span>
                      </span>

                      <div className="inline-flex bg-white/95 border border-slate-300/80 rounded-lg p-0.5 shadow-2xs text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setNepalDlCanvasMode(false)}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            !nepalDlCanvasMode
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View as Physical CR-80 Card with Realistic Tabletop & Shadows"
                        >
                          Physical View
                        </button>
                        <button
                          type="button"
                          onClick={() => setNepalDlCanvasMode(true)}
                          className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                            nepalDlCanvasMode
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="View on HTML5 2D Pixel-Exact Coordinate Canvas"
                        >
                          Canvas 2D
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const dlCardEl = document.getElementById('nepal-driving-license-front');
                          if (dlCardEl) {
                            import('./utils/exportImage').then(({ safeToPng }) => {
                              safeToPng(dlCardEl, { pixelRatio: 3 }).then((dataUrl) => {
                                const a = document.createElement('a');
                                a.download = `Nepal-Driving-License-${(nepalDlDetails.dlNo || 'front').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                                a.href = dataUrl;
                                a.click();
                              });
                            });
                          }
                        }}
                        className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="Export High-Resolution PNG for Printing"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">Export PNG</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditor('driving_license')}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer border bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"
                        title="Open Nepal Driving License Editor Form"
                      >
                        <Edit className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Edit Form</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage Render: Physical PVC Card or HTML5 Canvas */}
                  {nepalDlCanvasMode ? (
                    <div className="p-2 bg-slate-900/60 rounded-2xl border border-emerald-500/20 shadow-xl">
                      <NepalDrivingLicenseCanvas
                        details={nepalDlDetails}
                        settings={settings}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative rounded-[14px] transition-all"
                      style={{
                        boxShadow: getCardMockupShadow(),
                      }}
                    >
                      {mockupConfig.enabled && (
                        <div
                          className="absolute inset-0 pointer-events-none z-30 rounded-[14px] transition-opacity"
                          style={{
                            opacity:
                              mockupConfig.reflection === 'low'
                                ? 0.14
                                : mockupConfig.reflection === 'high'
                                ? 0.38
                                : 0.24,
                            backgroundImage:
                              mockupConfig.lighting === 'studio'
                                ? 'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(255,255,255,0.15) 80%, transparent 100%)'
                                : 'linear-gradient(130deg, rgba(255,255,255,0.42) 0%, transparent 45%, rgba(255,255,255,0.12) 60%, transparent 100%)',
                          }}
                        />
                      )}
                      <NepalDrivingLicenseCard
                        id="nepal-driving-license-front"
                        details={nepalDlDetails}
                        settings={settings}
                      />
                    </div>
                  )}
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Graphics, Templates & Resolution Panel */}
        {!isPreviewMode && (
          <GraphicsAndTemplatesPanel
            settings={settings}
            onUpdateSettings={setSettings}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {/* Lower Interactive Control Dashboard: Photo & Details */}
        {!isPreviewMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Photo Management Component */}
            <div className="md:col-span-1">
              <PhotoControls
                currentPhoto={cardEditMode === 'library' ? libraryPhotoUrl : photoUrl}
                onPhotoChange={(url) => {
                  if (cardEditMode === 'library') {
                    setLibraryPhotoUrl(url);
                  } else if (cardEditMode === 'student') {
                    setPhotoUrl(url);
                  } else {
                    setPhotoUrl(url);
                    setLibraryPhotoUrl(url);
                  }
                }}
                photoOpacity={settings.photoOpacity}
                adjustments={cardEditMode === 'library' ? libraryPhotoAdjustments : photoAdjustments}
                onUpdateAdjustments={(adj) => {
                  if (cardEditMode === 'library') {
                    setLibraryPhotoAdjustments(adj);
                  } else if (cardEditMode === 'student') {
                    setPhotoAdjustments(adj);
                  } else {
                    setPhotoAdjustments(adj);
                    setLibraryPhotoAdjustments(adj);
                  }
                }}
                editMode={cardEditMode}
                onUpdateEditMode={setCardEditMode}
              />
            </div>

            {/* Quick Credentials Summary, Database Verification & Governance Triggers */}
            <div className="md:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <FileBadge className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Active Credentials &amp; Verification Suite
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                      {displayView === 'both'
                        ? 'Dual View'
                        : displayView === 'student_only'
                        ? 'Card 1 Focus'
                        : 'Card 2 Focus'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditor('student', 'student')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      Edit Card 1
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditor('library', 'library')}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                    >
                      Edit Card 2
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setIsExportModalOpen(true)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <FileDown className="w-3 h-3" /> Export PVC
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5 text-xs">
                  {/* 1. Student ID Card */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600" /> Student ID
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded font-bold">Card 1</span>
                      </div>
                      <span className="font-bold text-slate-900 mt-1 block truncate">
                        {studentDetails.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        Roll: {studentDetails.rollNo} • {studentDetails.program}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleViewCardOnStage('student')}
                        className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View on Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditor('student', 'student')}
                        className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>

                  {/* 2. Work / Employment ID */}
                  <div className="bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-600" /> Work / Employment
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-indigo-100 text-indigo-900 rounded font-bold">Staff</span>
                      </div>
                      <span className="font-bold text-slate-900 mt-1 block truncate">
                        {employmentDetails.employeeName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {employmentDetails.designation} • ID: {employmentDetails.employeeId}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleViewCardOnStage('work')}
                        className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View on Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditor('work', 'student')}
                        className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>

                  {/* 3. Library ID Card */}
                  <div className="bg-teal-50/40 p-2.5 rounded-lg border border-teal-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-800 uppercase flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-teal-600" /> Library ID
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-teal-100 text-teal-900 rounded font-bold">Card 2</span>
                      </div>
                      <span className="font-bold text-teal-950 mt-1 block truncate">
                        {cardEditMode === 'both' ? studentDetails.name : libraryStudentDetails.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        No: {libraryDetails.memberNo} ({libraryDetails.bookLimit} Books)
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-teal-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleViewCardOnStage('library')}
                        className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View on Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditor('library', 'library')}
                        className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>

                  {/* 4. Executive VIP Loyalty Card */}
                  <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" /> Loyalty &amp; VIP
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">VIP</span>
                      </div>
                      <span className="font-bold text-amber-950 mt-1 block truncate">
                        {loyaltyDetails.memberName}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {loyaltyDetails.tier} • {loyaltyDetails.pointsBalance} pts
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleViewCardOnStage('loyalty')}
                        className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View on Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditor('loyalty', 'library')}
                        className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>

                  {/* 5. Nepal Driving License (Front) */}
                  <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-emerald-600" /> Driving License
                        </span>
                        <span className="text-[9.5px] px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-bold">Front</span>
                      </div>
                      <span className="font-bold text-emerald-950 mt-1 block truncate">
                        {nepalDlDetails.name}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">
                        DL: {nepalDlDetails.dlNo} • Cat: {nepalDlDetails.category}
                      </span>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleViewCardOnStage('driving_license')}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> View on Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditor('driving_license')}
                        className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    Open Live Verification Ledger
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAuditModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Admin Approval &amp; Activity Log
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDesignModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-600" />
                    Borders, Bleed &amp; Typography
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPhysicalCaptureOpen(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    Capture Physical ID (Direct Camera)
                  </button>
                </div>

                {/* Last Compliant Physical Capture Status Banner */}
                {lastPhysicalCapture && (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>
                        <strong>Physical Document Verified:</strong> {lastPhysicalCapture.quality.resolutionWidth}×{lastPhysicalCapture.quality.resolutionHeight} • Brightness: {lastPhysicalCapture.quality.brightnessAverage}/255 • Glare: {lastPhysicalCapture.quality.glarePercentage}%
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPhysicalCaptureOpen(true)}
                      className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[11px] font-bold hover:bg-emerald-800 cursor-pointer"
                    >
                      Inspect Capture
                    </button>
                  </div>
                )}
              </div>

              {/* Information Note */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Single-card or dual-card view toggle with complete card removal, front/back surface flip, verified institutional database record with scannable QR and barcode, ISO 7810 ID-1 standard PVC export (PDF/PNG), and admin approval workflow.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Comprehensive Card Details, Institute & Signatures Editor Modal */}
      <CardEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        editMode={cardEditMode}
        onUpdateEditMode={setCardEditMode}
        initialTab={editorInitialTab}
        studentDetails={studentDetails}
        onUpdateStudent={setStudentDetails}
        libraryDetails={libraryDetails}
        onUpdateLibrary={setLibraryDetails}
        instituteConfig={instituteConfig}
        onUpdateInstitute={setInstituteConfig}
        onOpenInstituteSwitcher={() => setIsInstituteSwitcherOpen(true)}
        signatureConfig={signatureConfig}
        onUpdateSignature={setSignatureConfig}
        photoUrl={photoUrl}
        onUpdatePhoto={setPhotoUrl}
        photoAdjustments={photoAdjustments}
        onUpdatePhotoAdjustments={setPhotoAdjustments}
        libraryStudentDetails={libraryStudentDetails}
        onUpdateLibraryStudent={setLibraryStudentDetails}
        libraryPhotoUrl={libraryPhotoUrl}
        onUpdateLibraryPhoto={setLibraryPhotoUrl}
        libraryPhotoAdjustments={libraryPhotoAdjustments}
        onUpdateLibraryPhotoAdjustments={setLibraryPhotoAdjustments}
        librarySignatureConfig={librarySignatureConfig}
        onUpdateLibrarySignature={setLibrarySignatureConfig}
        employmentDetails={employmentDetails}
        onUpdateEmployment={setEmploymentDetails}
        loyaltyDetails={loyaltyDetails}
        onUpdateLoyalty={setLoyaltyDetails}
        nepalDlDetails={nepalDlDetails}
        onUpdateNepalDl={setNepalDlDetails}
        onViewCardOnStage={handleViewCardOnStage}
        settings={settings}
        onSyncStudentToLibrary={handleSyncStudentToLibrary}
        onSyncLibraryToStudent={handleSyncLibraryToStudent}
        allLogoConfigs={institutionLogoConfigs}
        onSaveLogoConfig={handleSaveInstitutionLogoConfig}
        currentInstituteId={currentInstituteId}
        onOpenGlobalLogoManager={() => setIsLogoManagerOpen(true)}
      />

      {/* Export to PDF / PNG Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        studentCardId="card-student-left"
        libraryCardId="card-library-right"
        studentName={studentDetails.name}
        studentIdNumber={studentDetails.idNumber}
        workCardId="card-student-left"
        loyaltyCardId="card-library-right"
        photoStageId="tribhuvan-photo-stage"
        card1Type={card1Design}
        card2Type={card2Design}
        workName={employmentDetails.employeeName}
        workIdNumber={employmentDetails.employeeId}
        loyaltyName={loyaltyDetails.memberName}
        loyaltyIdNumber={loyaltyDetails.cardNumber}
        onOpenMockupPreview={() => setIsMockupModalOpen(true)}
      />

      {/* Print & Presentation Realistic Mockup Modal */}
      <PrintRealisticPreviewModal
        isOpen={isMockupModalOpen}
        onClose={() => setIsMockupModalOpen(false)}
        studentDetails={studentDetails}
        libraryDetails={libraryStudentDetails}
        employmentDetails={employmentDetails}
        loyaltyDetails={loyaltyDetails}
        instituteConfig={instituteConfig}
        signatureConfig={signatureConfig}
        photoUrl={photoUrl}
        photoAdjustments={photoAdjustments}
        settings={settings}
        designConfig={designConfig}
        verificationRecord={verificationRecord}
        cardStatus={cardStatus}
        initialCardType={card1Design === 'work' ? 'work' : 'student'}
        initialSide={cardSide}
      />

      {/* Database Verification & QR Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        record={verificationRecord}
        studentDetails={studentDetails}
        libraryDetails={libraryDetails}
        instituteConfig={instituteConfig}
        onUpdateRecord={setVerificationRecord}
        onOpenPhysicalCapture={() => setIsPhysicalCaptureOpen(true)}
      />

      {/* Front-End Document Capture Interface (Guided Physical Card Camera Verification) */}
      <PhysicalDocumentCaptureModal
        isOpen={isPhysicalCaptureOpen}
        onClose={() => setIsPhysicalCaptureOpen(false)}
        cardTitle={card1Design === 'work' ? employmentDetails.employeeName : studentDetails.name}
        onSubmitCapture={handleCaptureDocumentSubmitted}
      />

      {/* Admin Workflow, RBAC, and Audit Log Modal */}
      <AuditAndWorkflowModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        status={cardStatus}
        onUpdateStatus={setCardStatus}
        userRole={userRole}
        onUpdateUserRole={setUserRole}
        auditLogs={auditLogs}
        onAddAuditLog={handleAddAuditLog}
        record={verificationRecord}
        onUpdateRecord={setVerificationRecord}
      />

      {/* Design, Typography, Borders & Bleed Customizer Modal */}
      <DesignCustomizerModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        designConfig={designConfig}
        onUpdateDesignConfig={setDesignConfig}
        cardSide={cardSide}
        onToggleCardSide={setCardSide}
      />

      {/* 105+ Accredited Universities & Institutes Switcher Modal */}
      <InstituteSwitcherModal
        isOpen={isInstituteSwitcherOpen}
        onClose={() => setIsInstituteSwitcherOpen(false)}
        currentInstitute={instituteConfig}
        onSelectInstitute={handleSelectInstitute}
        onUpdateInstituteDetails={(student, library) => {
          setStudentDetails((prev) => ({ ...prev, ...student }));
          setLibraryStudentDetails((prev) => ({ ...prev, ...student }));
          setLibraryDetails((prev) => ({ ...prev, ...library }));
        }}
        allLogoConfigs={institutionLogoConfigs}
        onSaveLogoConfig={handleSaveInstitutionLogoConfig}
        onOpenGlobalLogoManager={() => setIsLogoManagerOpen(true)}
        currentActiveInstituteId={currentInstituteId}
      />

      {/* Global Institution Logo Management Studio Modal */}
      <InstitutionLogoManagerModal
        isOpen={isLogoManagerOpen}
        onClose={() => setIsLogoManagerOpen(false)}
        allConfigs={institutionLogoConfigs}
        onSaveConfig={handleSaveInstitutionLogoConfig}
        currentActiveInstituteId={currentInstituteId}
        onSelectInstituteForCanvas={(inst) => {
          handleSelectInstitute(inst);
          setIsLogoManagerOpen(false);
        }}
      />

      {/* Single Card 1500 × 1000 px Tabletop Mockup Exporter (Offscreen High-Res Canvas + Preview Modal) */}
      <SingleCardMockupExporter
        ref={singleCardExporterRef}
        studentDetails={studentDetails}
        libraryDetails={libraryStudentDetails}
        employmentDetails={employmentDetails}
        loyaltyDetails={loyaltyDetails}
        instituteConfig={instituteConfig}
        signatureConfig={signatureConfig}
        photoUrl={photoUrl}
        photoAdjustments={photoAdjustments}
        libraryPhotoUrl={libraryPhotoUrl}
        libraryPhotoAdjustments={libraryPhotoAdjustments}
        settings={settings}
        designConfig={designConfig}
        verificationRecord={verificationRecord}
        cardStatus={cardStatus}
        currentTemplate={currentTemplate}
        cardSide={cardSide}
        mockupConfig={mockupConfig}
        watermarkConfig={watermarkConfig}
        onExportSuccess={(filename) => {
          setDownloadSuccess(true);
          setSyncNotice(`Exported: ${filename}`);
          setTimeout(() => {
            setDownloadSuccess(false);
            setSyncNotice(null);
          }, 4500);
        }}
      />

      {/* Institutional Security Watermark & Auto-Logo Modal */}
      <WatermarkSettingsModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        watermarkConfig={watermarkConfig}
        onUpdateWatermarkConfig={setWatermarkConfig}
        instituteLogoUrl={instituteConfig.logoUrl}
        instituteName={instituteConfig.name}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  BookOpen,
  Sliders,
  Clock,
} from 'lucide-react';
import { LEGAL_INSTITUTES, LegalInstitute, INSTITUTE_CATEGORIES } from '../data/institutes';
import { InstituteConfig, StudentDetails, LibraryDetails } from '../types';
import {
  InstitutionLogoConfig,
  getEffectiveLogo,
} from '../utils/institutionLogoStorage';
import { InstitutionLogoConfigDialog } from './InstitutionLogoConfigDialog';

interface InstituteSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstitute: InstituteConfig;
  onSelectInstitute: (institute: LegalInstitute) => void;
  onUpdateInstituteDetails?: (student: Partial<StudentDetails>, library: Partial<LibraryDetails>) => void;
  allLogoConfigs?: Record<string, InstitutionLogoConfig>;
  onSaveLogoConfig?: (updatedConfig: InstitutionLogoConfig) => void;
  onOpenGlobalLogoManager?: () => void;
  currentActiveInstituteId?: string;
}

export const InstituteSwitcherModal: React.FC<InstituteSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentInstitute,
  onSelectInstitute,
  onUpdateInstituteDetails,
  allLogoConfigs = {},
  onSaveLogoConfig,
  onOpenGlobalLogoManager,
  currentActiveInstituteId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Institutes (105+ Legal)');
  const [autoUpdateProgram, setAutoUpdateProgram] = useState(true);
  const [editingLogoInstitute, setEditingLogoInstitute] = useState<LegalInstitute | null>(null);

  // Filtered institutes based on search & category
  const filteredInstitutes = useMemo(() => {
    return LEGAL_INSTITUTES.filter((inst) => {
      const matchesCategory =
        selectedCategory === 'All Institutes (105+ Legal)' ||
        inst.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        inst.name.toLowerCase().includes(q) ||
        inst.shortName.toLowerCase().includes(q) ||
        inst.nativeName.toLowerCase().includes(q) ||
        inst.location.toLowerCase().includes(q) ||
        inst.accreditationCode.toLowerCase().includes(q) ||
        (inst.defaultProgram && inst.defaultProgram.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleApply = (inst: LegalInstitute) => {
    // Resolve effective logo (temporary or permanent or default) for this specific institute
    const effective = getEffectiveLogo(allLogoConfigs, inst);
    const instWithEffectiveLogo: LegalInstitute = {
      ...inst,
      customLogoUrl: effective.url,
    };

    onSelectInstitute(instWithEffectiveLogo);
    if (autoUpdateProgram && onUpdateInstituteDetails && inst.defaultProgram) {
      onUpdateInstituteDetails(
        {
          program: inst.defaultProgram,
          faculty: inst.defaultFaculty || inst.category,
        },
        {
          borrowerCategory: `${inst.defaultProgram.split(' ')[0]} Student`,
        }
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Switch Institute &amp; University
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  105+ Verified Legal Institutes
                </span>
                {onOpenGlobalLogoManager && (
                  <button
                    type="button"
                    onClick={onOpenGlobalLogoManager}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 border border-purple-400/40 transition-colors cursor-pointer"
                    title="Open Global Logo Management Studio"
                  >
                    <Sliders className="w-3 h-3 text-purple-300" />
                    <span>Manage All Logos</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Instantly swap credentials, native Devanagari lettering, library branch, and authentic seal on both cards.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by institute name, Devanagari, city, or faculty (e.g. Pulchowk, ASCOL, MBBS, KU, Dharan)..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl shadow-2xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Auto update program checkbox */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer select-none whitespace-nowrap px-2">
              <input
                type="checkbox"
                checked={autoUpdateProgram}
                onChange={(e) => setAutoUpdateProgram(e.target.checked)}
                className="rounded text-blue-600 accent-blue-600"
              />
              Auto-fill faculty &amp; program
            </label>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {INSTITUTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Institutes List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100 space-y-2">
          {filteredInstitutes.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No matching legal institute found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for general keywords like "TU", "Engineering", "Medical", or "Kathmandu".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredInstitutes.map((inst) => {
                const isCurrentlyActive =
                  currentInstitute.name.trim().toLowerCase() === inst.name.trim().toLowerCase();
                const effectiveLogo = getEffectiveLogo(allLogoConfigs, inst);

                return (
                  <div
                    key={inst.id}
                    onClick={() => handleApply(inst)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                      isCurrentlyActive
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {inst.category}
                          </span>
                          {effectiveLogo.mode === 'temporary' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-2.5 h-2.5" /> Temp Logo
                            </span>
                          ) : effectiveLogo.mode === 'permanent' ? (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                              <ShieldCheck className="w-2.5 h-2.5" /> Perm Logo
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-semibold text-slate-400">
                              Default Seal
                            </span>
                          )}
                        </div>
                        {isCurrentlyActive ? (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-300">
                            <CheckCircle2 className="w-3 h-3" /> Active on Card
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {inst.accreditationCode}
                          </span>
                        )}
                      </div>

                      {/* Name, Native Script & Logo Thumbnail */}
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5 overflow-hidden"
                          title={`Active Logo: ${effectiveLogo.name}`}
                        >
                          {effectiveLogo.url ? (
                            <img
                              src={effectiveLogo.url}
                              alt={effectiveLogo.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div
                              className="w-full h-full rounded flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                              style={{ backgroundColor: inst.primaryColor }}
                            >
                              {inst.shortName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                            {inst.name}
                          </h3>
                          <div className="text-[11px] font-bold text-red-700 font-serif mt-0.5">
                            {inst.nativeName}
                          </div>
                        </div>
                      </div>

                      {/* Campus & Library Subtitles */}
                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5 pl-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{inst.campusSubTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{inst.librarySubTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{inst.establishedText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Change Logo & Apply Action */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLogoInstitute(inst);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                        title={`Configure logo settings for ${inst.shortName}`}
                      >
                        <Sliders className="w-3 h-3 text-indigo-600" />
                        <span>Change Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(inst);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrentlyActive
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                        }`}
                      >
                        <span>{isCurrentlyActive ? 'Selected' : 'Switch To This'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              All 105+ institutes conform to University Grants Commission (UGC) Nepal legal charter specifications.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Individual Institute Logo Config Dialog */}
      {editingLogoInstitute && onSaveLogoConfig && (
        <InstitutionLogoConfigDialog
          isOpen={Boolean(editingLogoInstitute)}
          onClose={() => setEditingLogoInstitute(null)}
          institute={editingLogoInstitute}
          allConfigs={allLogoConfigs}
          onSaveConfig={(updated) => {
            onSaveLogoConfig(updated);
          }}
          isCurrentlyActiveOnCanvas={currentActiveInstituteId === editingLogoInstitute.id}
        />
      )}
    </div>
  );
};

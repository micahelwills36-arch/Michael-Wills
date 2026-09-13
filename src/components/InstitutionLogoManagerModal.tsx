import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Building2,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Layers,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LEGAL_INSTITUTES, LegalInstitute, INSTITUTE_CATEGORIES } from '../data/institutes';
import {
  InstitutionLogoConfig,
  LogoMode,
  getInstitutionLogoConfig,
  getEffectiveLogo,
} from '../utils/institutionLogoStorage';
import { InstitutionLogoConfigDialog } from './InstitutionLogoConfigDialog';

interface InstitutionLogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allConfigs: Record<string, InstitutionLogoConfig>;
  onSaveConfig: (updatedConfig: InstitutionLogoConfig) => void;
  currentActiveInstituteId: string;
  onSelectInstituteForCanvas?: (institute: LegalInstitute) => void;
}

export const InstitutionLogoManagerModal: React.FC<InstitutionLogoManagerModalProps> = ({
  isOpen,
  onClose,
  allConfigs,
  onSaveConfig,
  currentActiveInstituteId,
  onSelectInstituteForCanvas,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'temporary' | 'permanent' | 'default'>('all');

  // Currently opened institute for specific logo editing
  const [editingInstitute, setEditingInstitute] = useState<LegalInstitute | null>(null);

  // Summary statistics
  const stats = useMemo(() => {
    let temporaryCount = 0;
    let permanentCount = 0;
    let defaultCount = 0;

    LEGAL_INSTITUTES.forEach((inst) => {
      const eff = getEffectiveLogo(allConfigs, inst);
      if (eff.mode === 'temporary') temporaryCount++;
      else if (eff.mode === 'permanent') permanentCount++;
      else defaultCount++;
    });

    return {
      total: LEGAL_INSTITUTES.length,
      temporary: temporaryCount,
      permanent: permanentCount,
      default: defaultCount,
    };
  }, [allConfigs]);

  // Filtered institutes list
  const filteredInstitutes = useMemo(() => {
    return LEGAL_INSTITUTES.filter((inst) => {
      // Category filter
      if (selectedCategory !== 'All' && inst.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const eff = getEffectiveLogo(allConfigs, inst);
      if (statusFilter === 'temporary' && eff.mode !== 'temporary') return false;
      if (statusFilter === 'permanent' && eff.mode !== 'permanent') return false;
      if (statusFilter === 'default' && eff.mode !== 'default') return false;

      // Text query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        inst.name.toLowerCase().includes(q) ||
        inst.shortName.toLowerCase().includes(q) ||
        inst.nativeName.toLowerCase().includes(q) ||
        inst.location.toLowerCase().includes(q) ||
        inst.category.toLowerCase().includes(q) ||
        eff.name.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory, statusFilter, allConfigs]);

  if (!isOpen) return null;

  // Global batch action: Clear all active temporary logos
  const handleClearAllTemporary = () => {
    if (!window.confirm('Deactivate all temporary logo overrides and revert to each institution’s permanent or default logo?')) {
      return;
    }

    LEGAL_INSTITUTES.forEach((inst) => {
      const cfg = allConfigs[inst.id];
      if (cfg && cfg.isTemporaryActive) {
        onSaveConfig({
          ...cfg,
          isTemporaryActive: false,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

  // Global batch action: Reset all back to factory defaults
  const handleResetAllToDefault = () => {
    if (
      !window.confirm(
        'Warning: This will clear all permanent custom logos and temporary overrides across all institutions, restoring factory default seals. Are you sure?'
      )
    ) {
      return;
    }

    LEGAL_INSTITUTES.forEach((inst) => {
      const cfg = allConfigs[inst.id];
      if (cfg && (cfg.permanentLogoUrl || cfg.temporaryLogoUrl)) {
        onSaveConfig({
          ...cfg,
          permanentLogoUrl: null,
          permanentLogoName: null,
          temporaryLogoUrl: null,
          temporaryLogoName: null,
          isTemporaryActive: false,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Institution Logo Management Studio
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/30">
                  Universal Multi-Institution System
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Configure independent logos for every legal institution. Toggle temporary overrides or save permanent replacements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close logo studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Global Action Bar */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Metrics */}
          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Total: {stats.total}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Default Official: {stats.default}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Permanent Custom: {stats.permanent}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Temporary Overrides: {stats.temporary}</span>
            </span>
          </div>

          {/* Batch Quick Operations */}
          <div className="flex items-center gap-2">
            {stats.temporary > 0 && (
              <button
                type="button"
                onClick={handleClearAllTemporary}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] border border-amber-300 cursor-pointer inline-flex items-center gap-1"
                title="Deactivate all temporary overrides across all institutions"
              >
                <Clock className="w-3 h-3" />
                Deactivate All Temp ({stats.temporary})
              </button>
            )}

            {(stats.permanent > 0 || stats.temporary > 0) && (
              <button
                type="button"
                onClick={handleResetAllToDefault}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 font-semibold text-[11px] border border-slate-300 hover:border-red-200 cursor-pointer inline-flex items-center gap-1"
                title="Restore all institutions to factory default logos"
              >
                <RotateCcw className="w-3 h-3" />
                Restore All Defaults
              </button>
            )}
          </div>
        </div>

        {/* Search, Status & Category Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search institution by name, native script, city, or active logo..."
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

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('temporary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'temporary'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                Temporary ({stats.temporary})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('permanent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'permanent'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-900'
                }`}
              >
                Permanent ({stats.permanent})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('default')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'default'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-900'
                }`}
              >
                Default
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Categories
            </button>
            {INSTITUTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
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

        {/* Grid of Institutions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredInstitutes.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700">No institutions found matching filters</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for a different keyword or resetting status filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredInstitutes.map((inst) => {
                const config = getInstitutionLogoConfig(allConfigs, inst);
                const effective = getEffectiveLogo(allConfigs, inst);
                const isCurrentOnCanvas = currentActiveInstituteId === inst.id;

                return (
                  <div
                    key={inst.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                      isCurrentOnCanvas
                        ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Card Header: Category & Status Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {inst.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isCurrentOnCanvas && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                              Active on Card
                            </span>
                          )}

                          {effective.mode === 'temporary' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3" /> Temporary Active
                            </span>
                          ) : effective.mode === 'permanent' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                              <ShieldCheck className="w-3 h-3" /> Permanent Custom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Default Official
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Main Institution Info & Active Logo Preview */}
                      <div className="flex items-start gap-3.5">
                        {/* Logo Preview Avatar */}
                        <div
                          onClick={() => setEditingInstitute(inst)}
                          className="w-14 h-14 rounded-xl p-1.5 bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 shadow-2xs cursor-pointer hover:border-indigo-600 transition-colors group/logo"
                          title="Click to change logo for this institute"
                        >
                          {effective.url ? (
                            <img
                              src={effective.url}
                              alt={effective.name}
                              className="w-full h-full object-contain group-hover/logo:scale-105 transition-transform"
                            />
                          ) : (
                            <div
                              className="w-full h-full rounded-lg text-white flex items-center justify-center font-black text-sm shadow-inner"
                              style={{ backgroundColor: inst.primaryColor }}
                            >
                              {inst.shortName.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Title & Native Script */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-snug truncate">
                            {inst.name}
                          </h3>
                          <div className="text-[11px] font-bold text-red-700 font-serif mt-0.5">
                            {inst.nativeName}
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-1 truncate">
                            Active Logo: <span className="font-semibold text-slate-700">{effective.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {/* Secondary quick toggles */}
                      <div className="flex items-center gap-1.5">
                        {config.temporaryLogoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              onSaveConfig({
                                ...config,
                                isTemporaryActive: !config.isTemporaryActive,
                                updatedAt: new Date().toISOString(),
                              });
                            }}
                            className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                              config.isTemporaryActive
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            title={config.isTemporaryActive ? 'Pause temporary logo' : 'Resume temporary logo'}
                          >
                            {config.isTemporaryActive ? 'Pause Temp' : 'Resume Temp'}
                          </button>
                        )}

                        {(config.permanentLogoUrl || config.temporaryLogoUrl) && (
                          <button
                            type="button"
                            onClick={() => {
                              onSaveConfig({
                                ...config,
                                permanentLogoUrl: null,
                                permanentLogoName: null,
                                temporaryLogoUrl: null,
                                temporaryLogoName: null,
                                isTemporaryActive: false,
                                updatedAt: new Date().toISOString(),
                              });
                            }}
                            className="px-2 py-1 rounded-lg text-[10.5px] font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Restore default factory seal"
                          >
                            Reset
                          </button>
                        )}
                      </div>

                      {/* Primary Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingInstitute(inst)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          Change Logo
                        </button>

                        {onSelectInstituteForCanvas && !isCurrentOnCanvas && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectInstituteForCanvas(inst);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Load this institute and its logo on the active canvas"
                          >
                            <span>Use On Card</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Each institution retains independent logo configuration. Changing one institute never alters any other institution.
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

      {/* Specific Institution Logo Config Dialog */}
      {editingInstitute && (
        <InstitutionLogoConfigDialog
          isOpen={Boolean(editingInstitute)}
          onClose={() => setEditingInstitute(null)}
          institute={editingInstitute}
          allConfigs={allConfigs}
          onSaveConfig={(updated) => {
            onSaveConfig(updated);
          }}
          isCurrentlyActiveOnCanvas={currentActiveInstituteId === editingInstitute.id}
        />
      )}
    </div>
  );
};

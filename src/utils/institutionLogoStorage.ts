export type LogoMode = 'temporary' | 'permanent' | 'default';

export interface InstitutionLogoConfig {
  institutionId: string;
  temporaryLogoUrl: string | null;
  temporaryLogoName: string | null;
  isTemporaryActive: boolean;
  permanentLogoUrl: string | null;
  permanentLogoName: string | null;
  defaultLogoUrl?: string | null;
  defaultLogoName?: string | null;
  updatedAt?: string;
}

export interface EffectiveLogoResult {
  url: string | null;
  name: string;
  mode: LogoMode;
}

const STORAGE_KEY = 'meta_toolkit_institution_logos_v1';

export function getInstitutionLogoConfig(
  allConfigs: Record<string, InstitutionLogoConfig>,
  institute: { id: string }
): InstitutionLogoConfig {
  if (allConfigs && allConfigs[institute.id]) {
    return allConfigs[institute.id];
  }
  return {
    institutionId: institute.id,
    temporaryLogoUrl: null,
    temporaryLogoName: null,
    isTemporaryActive: false,
    permanentLogoUrl: null,
    permanentLogoName: null,
  };
}

export function getEffectiveLogo(
  allConfigs: Record<string, InstitutionLogoConfig> | undefined,
  institute: {
    id: string;
    customLogoUrl?: string | null;
    shortName?: string;
    name?: string;
  }
): EffectiveLogoResult {
  const config = allConfigs ? allConfigs[institute.id] : undefined;
  if (config) {
    if (config.isTemporaryActive && config.temporaryLogoUrl) {
      return {
        url: config.temporaryLogoUrl,
        name: config.temporaryLogoName || `${institute.shortName || institute.name} (Temporary)`,
        mode: 'temporary',
      };
    }
    if (config.permanentLogoUrl) {
      return {
        url: config.permanentLogoUrl,
        name: config.permanentLogoName || `${institute.shortName || institute.name} (Permanent)`,
        mode: 'permanent',
      };
    }
  }
  return {
    url: institute.customLogoUrl || null,
    name: `${institute.shortName || institute.name || 'Institution'} Default Seal`,
    mode: 'default',
  };
}

export function loadAllInstitutionLogos(): Record<string, InstitutionLogoConfig> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Failed to load institution logos from localStorage', error);
  }
  return {};
}

export function saveAllInstitutionLogos(configs: Record<string, InstitutionLogoConfig>): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    }
  } catch (error) {
    console.warn('Failed to save institution logos to localStorage', error);
  }
}

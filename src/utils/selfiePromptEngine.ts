import { REAL_HUMAN_PORTRAITS, PassportPortrait } from '../data/passportPortraits';
import { PhotoAdjustments } from '../types';

export interface GeneratedSelfieResult {
  url: string;
  adjustments: PhotoAdjustments;
  description?: string;
}

export async function generateSelfieFromPrompt(
  prompt: string
): Promise<GeneratedSelfieResult> {
  const cleanPrompt = (prompt || '').toLowerCase().trim();

  // Keyword matching
  const isFemale =
    cleanPrompt.includes('female') ||
    cleanPrompt.includes('woman') ||
    cleanPrompt.includes('girl') ||
    cleanPrompt.includes('isabella') ||
    cleanPrompt.includes('ananya') ||
    cleanPrompt.includes('priya') ||
    cleanPrompt.includes('kritika') ||
    cleanPrompt.includes('sneha');

  const isMale =
    cleanPrompt.includes('male') ||
    cleanPrompt.includes('man') ||
    cleanPrompt.includes('boy') ||
    cleanPrompt.includes('guy') ||
    cleanPrompt.includes('aarav') ||
    cleanPrompt.includes('rohan') ||
    cleanPrompt.includes('bibek') ||
    cleanPrompt.includes('manish') ||
    cleanPrompt.includes('deepak');

  const wantsBlazer =
    cleanPrompt.includes('blazer') ||
    cleanPrompt.includes('suit') ||
    cleanPrompt.includes('formal') ||
    cleanPrompt.includes('executive') ||
    cleanPrompt.includes('professor');

  const wantsWhite =
    cleanPrompt.includes('white') ||
    cleanPrompt.includes('collar') ||
    cleanPrompt.includes('shirt');

  const wantsBlueBg =
    cleanPrompt.includes('blue') ||
    cleanPrompt.includes('cyan');

  // Filter candidates
  let candidates = [...REAL_HUMAN_PORTRAITS];

  if (isFemale && !isMale) {
    candidates = candidates.filter((p) => p.gender === 'female');
  } else if (isMale && !isFemale) {
    candidates = candidates.filter((p) => p.gender === 'male');
  }

  if (wantsBlazer) {
    const blazerMatches = candidates.filter((p) => p.attire === 'blazer');
    if (blazerMatches.length > 0) candidates = blazerMatches;
  } else if (wantsWhite) {
    const whiteMatches = candidates.filter((p) => p.attire === 'white_collared');
    if (whiteMatches.length > 0) candidates = whiteMatches;
  }

  if (wantsBlueBg) {
    const blueMatches = candidates.filter((p) => p.backgroundStyle === 'studio_blue');
    if (blueMatches.length > 0) candidates = blueMatches;
  }

  // Pick candidate
  const chosen: PassportPortrait =
    candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : REAL_HUMAN_PORTRAITS[0];

  // Simulate short realistic AI generation latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    url: chosen.url,
    adjustments: {
      zoom: chosen.recommendedZoom || 1.05,
      offsetY: chosen.recommendedOffsetY || 0,
      offsetX: 0,
      brightness: 100,
      contrast: 100,
    },
    description: `Generated ${chosen.name} (${chosen.ethnicityOrStyle || 'Student'})`,
  };
}

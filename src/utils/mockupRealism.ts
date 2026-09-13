import { CSSProperties } from 'react';
import { CornerShadowConfig, MockupEffect } from '../types';
import { BACKGROUND_SURFACES } from '../constants';

/**
 * Calculates multi-layered realistic contact and directional corner drop shadows.
 * Each corner can be lifted independently (0 - 50 px) to simulate curled paper or tilted PVC.
 */
export function computeCornerBoxShadow(
  cornerShadows?: CornerShadowConfig,
  baseElevation: number = 16
): string {
  if (!cornerShadows) {
    return '0 12px 28px -6px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.18)';
  }

  const {
    topLeft = 8,
    topRight = 10,
    bottomLeft = 18,
    bottomRight = 24,
    intensity = 65,
    blur = 28,
  } = cornerShadows;

  const alpha = Math.min(0.7, (intensity / 100) * 0.42);
  const contactAlpha = Math.min(0.5, (intensity / 100) * 0.28);

  // 1. Razor-sharp ambient contact shadow right where the card meets the surface
  const contactShadow = `0 1.5px 3px rgba(0, 0, 0, ${contactAlpha})`;

  // 2. Diffuse overhead room/window light
  const avgLift = (topLeft + topRight + bottomLeft + bottomRight) / 4;
  const mainDropY = Math.max(3, Math.round(avgLift * 0.45));
  const mainBlur = Math.round(blur + avgLift * 0.3);
  const mainDrop = `0 ${mainDropY}px ${mainBlur}px rgba(0, 0, 0, ${alpha})`;

  // 3. Directional Corner lift flares (soft shadows casting outward as corners peel up)
  const shadows: string[] = [contactShadow, mainDrop];

  if (topLeft > 2) {
    const dX = -Math.round(topLeft * 0.35);
    const dY = -Math.round(topLeft * 0.25);
    const b = Math.round(blur * 0.6 + topLeft * 0.65);
    shadows.push(`${dX}px ${dY}px ${b}px rgba(0, 0, 0, ${(alpha * (topLeft / 35)).toFixed(3)})`);
  }

  if (topRight > 2) {
    const dX = Math.round(topRight * 0.35);
    const dY = -Math.round(topRight * 0.25);
    const b = Math.round(blur * 0.6 + topRight * 0.65);
    shadows.push(`${dX}px ${dY}px ${b}px rgba(0, 0, 0, ${(alpha * (topRight / 35)).toFixed(3)})`);
  }

  if (bottomLeft > 2) {
    const dX = -Math.round(bottomLeft * 0.4);
    const dY = Math.round(bottomLeft * 0.55);
    const b = Math.round(blur * 0.7 + bottomLeft * 0.75);
    shadows.push(`${dX}px ${dY}px ${b}px rgba(0, 0, 0, ${(alpha * (bottomLeft / 35)).toFixed(3)})`);
  }

  if (bottomRight > 2) {
    const dX = Math.round(bottomRight * 0.45);
    const dY = Math.round(bottomRight * 0.6);
    const b = Math.round(blur * 0.75 + bottomRight * 0.85);
    shadows.push(`${dX}px ${dY}px ${b}px rgba(0, 0, 0, ${(alpha * (bottomRight / 35)).toFixed(3)})`);
  }

  return shadows.join(', ');
}

/**
 * Returns tabletop background style for on-screen canvases and export stages.
 */
export function getTabletopSurfaceStyle(surface: string): CSSProperties {
  const surfaceInfo = (BACKGROUND_SURFACES as any)[surface];
  if (surfaceInfo?.imageUrl) {
    return {
      backgroundImage: `url(${surfaceInfo.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f1f5f9',
    };
  }

  switch (surface) {
    case 'dark_slate':
      return {
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, #1e293b 0%, #0f172a 60%, #020617 100%)',
        backgroundColor: '#0f172a',
      };
    case 'neutral':
    default:
      return {
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, #f8fafc 0%, #e2e8f0 70%, #cbd5e1 100%)',
        backgroundColor: '#f1f5f9',
      };
  }
}

/**
 * Provides authentic optical filters & surface overlay properties for requested card effects:
 * - Scan effect
 * - Mid rush old effect
 * - Natural effect
 * - Used card effect
 * - Reality effect
 * - Hologram sheen
 */
export function getEffectVisuals(effect?: MockupEffect): {
  filterStyle: string;
  overlayClass: string;
  overlayStyle: CSSProperties;
} {
  switch (effect) {
    case 'scan':
      return {
        filterStyle: 'contrast(106%) saturate(103%) brightness(101%)',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(56,189,248,0.06) 50%, rgba(255,255,255,0.15) 100%)',
          mixBlendMode: 'overlay',
        },
      };

    case 'old_rush':
      return {
        filterStyle: 'sepia(20%) contrast(94%) brightness(96%) saturate(92%)',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'radial-gradient(ellipse at center, transparent 55%, rgba(180, 130, 70, 0.18) 95%, rgba(120, 80, 40, 0.35) 100%)',
          boxShadow: 'inset 0 0 12px rgba(120, 70, 20, 0.22)',
          mixBlendMode: 'multiply',
        },
      };

    case 'used':
      return {
        filterStyle: 'contrast(97%) brightness(98%)',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(255,255,255,0.08) 19px, rgba(255,255,255,0.08) 20px), radial-gradient(circle at 75% 30%, rgba(0,0,0,0.07), transparent 60%)',
          mixBlendMode: 'screen',
        },
      };

    case 'reality':
      return {
        filterStyle: 'contrast(103%) brightness(101%) saturate(102%)',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'linear-gradient(125deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 32%, transparent 48%, rgba(255,255,255,0.18) 72%, transparent 100%)',
          mixBlendMode: 'overlay',
        },
      };

    case 'hologram':
      return {
        filterStyle: 'contrast(104%) brightness(102%)',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'linear-gradient(135deg, rgba(255,0,0,0.12) 0%, rgba(255,154,0,0.12) 18%, rgba(208,222,33,0.12) 36%, rgba(79,220,74,0.12) 54%, rgba(63,218,216,0.12) 72%, rgba(47,201,226,0.12) 90%, rgba(28,127,238,0.12) 100%)',
          mixBlendMode: 'color-dodge',
        },
      };

    case 'natural':
    default:
      return {
        filterStyle: 'none',
        overlayClass: 'pointer-events-none absolute inset-0 z-30',
        overlayStyle: {
          backgroundImage:
            'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, transparent 60%)',
          mixBlendMode: 'soft-light',
        },
      };
  }
}

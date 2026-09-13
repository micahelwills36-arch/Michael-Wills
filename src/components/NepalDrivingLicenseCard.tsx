import React from 'react';
import {
  NepalDrivingLicenseDetails,
  RealismSettings,
  CardDesignConfig,
  CardStatus,
  WatermarkConfig,
} from '../types';
import { NepalDrivingLicenseSvg } from './NepalDrivingLicenseEditor';

interface NepalDrivingLicenseCardProps {
  details: NepalDrivingLicenseDetails;
  settings?: RealismSettings;
  designConfig?: CardDesignConfig;
  status?: CardStatus;
  id?: string;
  watermarkConfig?: WatermarkConfig;
  className?: string;
  showLabels?: boolean;
}

/**
 * Photorealistic Nepal Driving License (Front) Card Wrapper
 *
 * Uses the pure vector inline SVG coordinate engine (1000 x 630):
 * 1. ZERO external image dependencies for the background.
 * 2. Guaranteed zero text overlapping or misalignment across all screen resolutions.
 * 3. Photorealistic PVC card edge bevels, 3D tabletop shadows, and lamination effects.
 */
export const NepalDrivingLicenseCard: React.FC<NepalDrivingLicenseCardProps> = ({
  details,
  settings,
  id = 'nepal-driving-license-front',
  className = '',
}) => {
  // Shadow calculations matching the application's realism engine
  const shadowIntensity = (settings?.outerShadowIntensity ?? 65) / 100;
  const shadowBlur = settings?.outerShadowBlur ?? 24;
  const shadowSpread = settings?.outerShadowSpread ?? 0;
  const outerShadowStyle = `${Math.round(4 * shadowIntensity)}px ${Math.round(
    14 * shadowIntensity
  )}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, ${0.42 * shadowIntensity}), 0 1px 3px rgba(0,0,0,0.25)`;

  return (
    <div
      className={`relative select-none transition-all duration-300 ${className}`}
      style={{
        boxShadow: outerShadowStyle,
        borderRadius: `${settings?.cardCornerRadius ?? 14}px`,
      }}
    >
      {/* 3D PVC Card Specular Sheen */}
      {settings?.surfaceReflection && settings.surfaceReflection > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-20 rounded-[14px] transition-opacity"
          style={{
            opacity: (settings.surfaceReflection / 100) * 0.35,
            backgroundImage:
              'linear-gradient(125deg, rgba(255,255,255,0.45) 0%, transparent 40%, rgba(255,255,255,0.1) 70%, transparent 100%)',
          }}
        />
      )}

      {/* Pure Vector SVG Render Engine (1000 x 630 viewBox) */}
      <NepalDrivingLicenseSvg
        id={id}
        details={details}
        className="w-full h-auto block"
      />
    </div>
  );
};


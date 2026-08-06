import React from 'react';
import { NordicSwooshConfig, NordicSwooshSize } from '../types';

import logoFarbeImg from '../../public/assets/logo_farbe_2025.png';
import logoNegativImg from '../../public/assets/logo_white_neg.svg';
import logoGrauImg from '../../public/assets/logo_grau_2025.png';
import kurveImg from '../../public/assets/kurve.png';
import kurveLanglaeuferImg from '../../public/assets/kurve_langlaeufer.png';

/**
 * Official Dolomiti NordicSki Brand Assets
 * Bundled and resolved directly via Vite asset pipeline for maximum compatibility.
 */
export const OFFICIAL_ASSET_PATHS = {
  logoFarbe: logoFarbeImg,
  logoNegativ: logoNegativImg,
  logoWhiteSvg: logoNegativImg,
  logoGrau: logoGrauImg,
  kurve: kurveImg,
  kurveLanglaeufer: kurveLanglaeuferImg,
};

/**
 * 1. Nordic Swoosh / Kurve Official Asset Component
 * Renders the official kurve.png or kurve_langlaeufer.png uploaded by user.
 */
export const NordicSwooshGraphic: React.FC<{
  className?: string;
  variant?: 'swoosh_only' | 'swoosh_skier';
  style?: React.CSSProperties;
}> = ({
  className = "w-full h-auto",
  variant = 'swoosh_only',
  style
}) => {
  const src = variant === 'swoosh_skier' 
    ? OFFICIAL_ASSET_PATHS.kurveLanglaeufer 
    : OFFICIAL_ASSET_PATHS.kurve;

  return (
    <img 
      src={src} 
      alt="Dolomiti NordicSki Nordic Swoosh" 
      className={`object-contain pointer-events-none select-none ${className}`}
      style={style}
    />
  );
};

export const DolomitiCurvesVector = NordicSwooshGraphic;
export const DolomitiSwooshVector = NordicSwooshGraphic;

/**
 * 2. Official Skier & Track Emblem ("Langläufer mit Kurve")
 * Strictly uses official kurve_langlaeufer.png
 */
export const DolomitiSkierTrackEmblem: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  usePng?: boolean;
}> = ({
  className = "w-16 h-16",
  style
}) => {
  return (
    <img 
      src={OFFICIAL_ASSET_PATHS.kurveLanglaeufer} 
      alt="Dolomiti NordicSki Skier & Nordic Swoosh" 
      className={`object-contain ${className}`}
      style={style}
    />
  );
};

export const DolomitiSkierVector = DolomitiSkierTrackEmblem;

/**
 * 3. Dynamic Nordic Swoosh Overlay Component
 * Places the official Nordic Swoosh / Kurve in any corner or position
 * with size, opacity, and variant choices.
 */
export const NordicSwooshOverlay: React.FC<{
  config?: NordicSwooshConfig;
  className?: string;
}> = ({ config, className = "" }) => {
  if (!config || !config.enabled || config.position === 'none') return null;

  const src = config.variant === 'swoosh_skier' 
    ? OFFICIAL_ASSET_PATHS.kurveLanglaeufer 
    : OFFICIAL_ASSET_PATHS.kurve;

  const opacityVal = (config.opacity ?? 85) / 100;

  const sizeMap: Record<NordicSwooshSize, string> = {
    sm: 'w-28 max-w-[140px]',
    md: 'w-48 max-w-[220px]',
    lg: 'w-72 max-w-[320px]',
    xl: 'w-96 max-w-[420px]',
    '2xl': 'w-[520px] max-w-[600px]',
    custom: '',
  };

  const sizeClass = config.customWidthPx ? '' : sizeMap[config.size || 'md'];

  // z-10 so it sits under z-20 text but above z-0 backgrounds
  let posClasses = 'absolute z-10 pointer-events-none select-none transition-all';
  let imgTransform = '';

  switch (config.position) {
    case 'top_left':
      posClasses += ' top-0 left-0';
      imgTransform = 'scaleX(-1)';
      break;
    case 'top_right':
      posClasses += ' top-0 right-0';
      imgTransform = 'none';
      break;
    case 'bottom_left':
      posClasses += ' bottom-0 left-0';
      imgTransform = 'scaleX(-1)';
      break;
    case 'bottom_right':
      posClasses += ' bottom-0 right-0';
      imgTransform = 'none';
      break;
    default:
      posClasses += ' top-0 right-0';
      imgTransform = 'none';
  }

  const customWidthStr = config.customWidthPx ? `${config.customWidthPx}px` : undefined;

  const customStyle: React.CSSProperties = {
    opacity: opacityVal,
    width: customWidthStr,
    maxWidth: '90%',
  };

  const imgStyle: React.CSSProperties = {
    ...(customWidthStr ? { width: customWidthStr, maxWidth: '100%' } : {}),
    ...(imgTransform !== 'none' ? { transform: imgTransform } : {}),
  };

  return (
    <div className={`${posClasses} ${className}`} style={customStyle}>
      <img 
        src={src} 
        alt="Nordic Swoosh" 
        className={`${sizeClass} h-auto object-contain drop-shadow-xs`} 
        style={imgStyle}
      />
    </div>
  );
};

/**
 * 4. Dolomiti NordicSki Full Official Logo Component
 * Renders the official PNG logo_farbe_2025.png or logo_white_neg.svg
 */
export const DolomitiFullLogo: React.FC<{
  variant?: 'original' | 'negative' | 'grayscale' | 'monochrome' | 'skier_track_emblem' | 'horizontal' | 'horizontal_light' | 'badge_card' | 'none';
  className?: string;
  customPrimary?: string;
  customSecondary?: string;
  customAccent?: string;
  isDarkHeader?: boolean;
}> = ({ 
  variant = 'original', 
  className = "h-10",
  isDarkHeader = false
}) => {
  if (variant === 'none') return null;

  if (variant === 'skier_track_emblem') {
    return <DolomitiSkierTrackEmblem className={className} />;
  }

  const logoSrc = (variant === 'negative' || isDarkHeader || variant === 'horizontal_light')
    ? OFFICIAL_ASSET_PATHS.logoNegativ
    : variant === 'grayscale'
    ? OFFICIAL_ASSET_PATHS.logoGrau
    : OFFICIAL_ASSET_PATHS.logoFarbe;

  let wrapperClass = `inline-flex items-center max-w-full shrink-0 ${className}`;

  if (variant === 'badge_card') {
    wrapperClass += ' px-3 py-1.5 rounded-xl shadow-2xs border bg-white border-[#AAD0D1]';
  }

  return (
    <div className={wrapperClass}>
      <img 
        src={logoSrc} 
        alt="Dolomiti NordicSki Logo Ufficiale" 
        className="h-full w-auto max-h-full object-contain shrink-0" 
      />
    </div>
  );
};

export const DolomitiNordicSkiLogo = DolomitiFullLogo;

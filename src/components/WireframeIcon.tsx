import React from 'react';
import * as LucideIcons from 'lucide-react';
import { SportsIcon } from '../types';

interface WireframeIconProps {
  icon?: SportsIcon | { id?: string; lucideIconName?: string; customIconUrl?: string; name?: string };
  iconName?: string; // Fallback lucide icon string
  customIconUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Dedicated, realistic SVG vector icons for Cross-Country Skiing (Classic, Skating, Biathlon, etc.)
const renderSportsSvg = (iconId: string, className: string, style?: React.CSSProperties) => {
  const normId = (iconId || '').toLowerCase();

  switch (normId) {
    case 'nordic_classic':
    case 'classic':
      // Two parallel groomed ski tracks (binari) with parallel classic skis & poles
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M5 2v20M9 2v20" strokeOpacity="0.35" strokeDasharray="2 2" />
          <path d="M7 5v14" strokeWidth="2.2" />
          <path d="M7 5l-1.5-2" strokeWidth="1.8" />
          <path d="M15 2v20M19 2v20" strokeOpacity="0.35" strokeDasharray="2 2" />
          <path d="M17 5v14" strokeWidth="2.2" />
          <path d="M17 5l-1.5-2" strokeWidth="1.8" />
          <path d="M3 8l3 12M21 8l-3 12" strokeWidth="1.3" />
          <circle cx="3" cy="8" r="1" fill="currentColor" />
          <circle cx="21" cy="8" r="1" fill="currentColor" />
        </svg>
      );

    case 'nordic_skating':
    case 'skating':
      // V-shaped skating technique skis (passo pattinato) with angled poles
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M10 20L3 5" strokeWidth="2.2" />
          <path d="M3 5l-1.5-1.5" strokeWidth="1.8" />
          <path d="M14 20l7-15" strokeWidth="2.2" />
          <path d="M21 5l1.5-1.5" strokeWidth="1.8" />
          <path d="M7 10L2 21M17 10l5 11" strokeWidth="1.3" />
          <circle cx="7" cy="10" r="1" fill="currentColor" />
          <circle cx="17" cy="10" r="1" fill="currentColor" />
          <path d="M9 18h6" strokeOpacity="0.4" strokeWidth="1.2" />
        </svg>
      );

    case 'biathlon':
      // Biathlon target bullseye & rifle crosshairs
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.8" fill="currentColor" />
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4" strokeWidth="1.5" />
        </svg>
      );

    case 'snowshoes':
      // Snowshoe (Ciaspola) outline with binding and crampon grid
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <ellipse cx="12" cy="12" rx="6" ry="10" />
          <path d="M12 2v20M6 12h12M8 7h8M8 17h8" strokeWidth="1.2" />
          <rect x="9" y="10" width="6" height="4" rx="1" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'skipass':
      // Digital RFID Pass ticket card
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M7 12h4M7 16h10" strokeWidth="1.5" />
          <path d="M15 11a2.5 2.5 0 0 1 3 2.5" strokeWidth="1.3" />
        </svg>
      );

    case 'rental':
      // Cross-country ski rental equipment
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M8 2v18M8 2l-2 2" strokeWidth="2" />
          <path d="M13 2v18M13 2l-2 2" strokeWidth="2" />
          <path d="M18 13l-3 7h7v-3l-4-4z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.5" />
        </svg>
      );

    case 'ski_school':
      // Ski instructor / graduation
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
        </svg>
      );

    case 'ski_bus':
      // Ski bus shuttle
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M3 10h18M8 4v6M16 4v6" strokeWidth="1.4" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      );

    case 'hotel_chalet':
      // Alpine Chalet
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M3 21h18M5 21V10l7-5 7 5v11" />
          <path d="M9 14h2M13 14h2M9 18h2M13 18h2" strokeWidth="2" />
        </svg>
      );

    case 'sauna_wellness':
      // Sauna & Spa
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M7 8c0-2 1-3 1-5M12 8c0-2 1-3 1-5M17 8c0-2 1-3 1-5" strokeWidth="1.5" />
          <path d="M4 12h16l-1 9H5l-1-9z" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case 'mountain_hut':
      // Mountain Hut
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M2 20h20M3 20l9-14 9 14" />
          <path d="M9 20v-5h6v5" />
          <path d="M12 6V3" strokeWidth="1.5" />
        </svg>
      );

    case 'night_skiing':
      // Night Skiing
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" fill="currentColor" fillOpacity="0.2" />
          <path d="M3 21l6-8M7 21l6-8" strokeWidth="1.8" strokeDasharray="1 1" />
        </svg>
      );

    case 'race_trophy':
      // Trophy
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
          <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" fill="currentColor" fillOpacity="0.15" />
          <path d="M12 16v3M8 22h8" />
        </svg>
      );

    case 'trail_map':
      // Trail Map
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );

    case 'family_kids':
      // Family & Kids
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
          <circle cx="8" cy="6" r="2" />
          <path d="M8 8v6M5 21l6-11M11 21l-3-7" />
          <circle cx="17" cy="10" r="1.5" />
          <path d="M17 11.5v4M15 21l4-7M19 21l-2-5" />
        </svg>
      );

    default:
      return null;
  }
};

export const WireframeIcon: React.FC<WireframeIconProps> = ({
  icon,
  iconName,
  customIconUrl,
  className = 'w-4 h-4',
  style
}) => {
  const url = customIconUrl || (icon && 'customIconUrl' in icon ? icon.customIconUrl : undefined);
  if (url) {
    return (
      <img
        src={url}
        alt={icon?.name || 'Icona'}
        className={`${className} object-contain rounded-xs border border-current/20 p-0.5 bg-white/50 shrink-0`}
        style={style}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // 1. Try realistic custom sports SVG vector if matching known sport ID
  const sportId = icon && 'id' in icon ? (icon as SportsIcon).id : undefined;
  if (sportId) {
    const customSvg = renderSportsSvg(sportId, className, style);
    if (customSvg) return customSvg;
  }

  // 2. Fallback to Lucide icon
  const nameToUse = iconName || (icon && 'lucideIconName' in icon ? icon.lucideIconName : 'Activity');
  const LucideComponent = (LucideIcons as any)[nameToUse || 'Activity'] || LucideIcons.Activity;

  return (
    <LucideComponent 
      className={`${className} shrink-0 stroke-[1.75]`} 
      style={style} 
    />
  );
};


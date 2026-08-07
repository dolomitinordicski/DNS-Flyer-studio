import React from 'react';
import * as LucideIcons from 'lucide-react';
import { SportsIcon } from '../types';

interface WireframeIconProps {
  icon?: SportsIcon | { lucideIconName?: string; customIconUrl?: string; name?: string };
  iconName?: string; // Fallback lucide icon string
  customIconUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

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
          // If custom image fails to load, fallback to standard icon
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  const nameToUse = iconName || (icon && 'lucideIconName' in icon ? icon.lucideIconName : 'Activity');
  const LucideComponent = (LucideIcons as any)[nameToUse || 'Activity'] || LucideIcons.Activity;

  return (
    <LucideComponent 
      className={`${className} shrink-0 stroke-[1.75]`} 
      style={style} 
    />
  );
};

import { FlyerContent, FlyerSectionId } from '../../types';

export const DEFAULT_SECTION_ORDER: FlyerSectionId[] = [
  'heroImage',
  'earlyBird',
  'promotionBox',
  'priceTables',
  'servicesBox',
  'ecoBanner',
  'disclaimer'
];

export interface FlyerVariantProps {
  content: FlyerContent;
  plt: any; // Price List Texts
  theme: {
    primaryHex: string;
    secondaryHex: string;
    accentHex: string;
    bgHex: string;
    cardBgHex: string;
    textColorHex: string;
    headerBgStyle: any;
    headerTextColor: string;
    headerSubtextColor: string;
    headerAccentColor: string;
    headerBadgeBgStyle: any;
    headerBorderColorStyle: any;
    badgeStyle: any;
    priceBgStyle: any;
    featureHighlightStyle: any;
    ctaBgStyle: any;
    ctaBadgeStyle: any;
    iconCircleStyle: any;
    isHeaderLight: boolean;
  };
  regionLogo: any;
  activeSportsIcons: any[];
  visibility: {
    header: boolean;
    heroImage: boolean;
    promotionBox: boolean;
    priceTables: boolean;
    servicesBox: boolean;
    ecoBanner: boolean;
    qrCode: boolean;
    disclaimer: boolean;
    footer: boolean;
  };
  format: 'A3' | 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
}

/**
 * Returns 'rounded-none' if the user selected sharp corners ('sharp'),
 * otherwise returns the provided default rounded class (e.g. 'rounded-xl', 'rounded-2xl', 'rounded-lg').
 */
export function getCornerClass(content: FlyerContent, defaultRounding: string = 'rounded-xl'): string {
  if (content.cornerStyle === 'sharp') {
    return 'rounded-none';
  }
  return defaultRounding;
}


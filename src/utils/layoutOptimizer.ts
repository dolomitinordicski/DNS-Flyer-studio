import { FlyerContent, PaperFormat, GraphicStyle } from '../types';
import { DEFAULT_SECTION_ORDER } from '../components/flyer-variants/VariantTypes';

/**
 * Standardized "Make It Perfect" Layout Optimization Algorithm
 * 
 * Applies layout-specific rules tailored for current:
 * - Paper Format (A3, A4, A5)
 * - Orientation (Portrait vs Landscape)
 * - Graphic Style / Layout Modello
 * 
 * Key Functions:
 * 1. Resizes Header Image as a dynamic buffer to absorb or fill white space.
 * 2. Triggers automatic text scaling (textScaleFactor) and line-break adjustments.
 * 3. Keeps Vertical Fix (Y-axis parameters) isolated from Horizontal Fix (X-axis parameters).
 * 4. Applies strictly to the CURRENT modello and format selected by the user.
 */

export interface OptimizedLayoutResult {
  content: FlyerContent;
  message: string;
}

export function optimizeLayout(content: FlyerContent): OptimizedLayoutResult {
  const fmt: PaperFormat = content.format || 'A4';
  const isLandscape = content.orientation === 'landscape';
  const style: GraphicStyle = content.graphicStyle || 'classic_official';

  // ----------------------------------------------------
  // 1. HEADER IMAGE HEIGHT BUFFER CALCULATION
  // Resizes the image height as an elastic buffer to eliminate empty white space
  // ----------------------------------------------------
  let heroImageHeightPx = 220;

  if (style === 'official_price_table' || style === 'classic_official') {
    // Price tables are content-dense, keep buffer controlled
    if (fmt === 'A3') {
      heroImageHeightPx = isLandscape ? 220 : 300;
    } else if (fmt === 'A5') {
      heroImageHeightPx = isLandscape ? 85 : 110;
    } else {
      // A4
      heroImageHeightPx = isLandscape ? 130 : 170;
    }
  } else if (style === 'online_ticket_manifesto' || style === 'official_ticket_voucher') {
    // Online tickets / vouchers need balanced ticket top banner
    if (fmt === 'A3') {
      heroImageHeightPx = isLandscape ? 260 : 340;
    } else if (fmt === 'A5') {
      heroImageHeightPx = isLandscape ? 95 : 125;
    } else {
      // A4
      heroImageHeightPx = isLandscape ? 150 : 200;
    }
  } else if (style === 'manifesto_voucher' || style === 'glacier_panorama') {
    // Voucher & Panorama styles benefit from larger hero visual
    if (fmt === 'A3') {
      heroImageHeightPx = isLandscape ? 320 : 420;
    } else if (fmt === 'A5') {
      heroImageHeightPx = isLandscape ? 110 : 150;
    } else {
      // A4
      heroImageHeightPx = isLandscape ? 190 : 260;
    }
  } else {
    // Corporate, Nordic Modern, Modern Glacier
    if (fmt === 'A3') {
      heroImageHeightPx = isLandscape ? 280 : 380;
    } else if (fmt === 'A5') {
      heroImageHeightPx = isLandscape ? 95 : 130;
    } else {
      // A4
      heroImageHeightPx = isLandscape ? 160 : 220;
    }
  }

  // ----------------------------------------------------
  // 2. AUTOMATIC TEXT SCALING & LINE-BREAK ADJUSTMENTS
  // ----------------------------------------------------
  let textScaleFactor = 1.0;
  if (fmt === 'A3') {
    textScaleFactor = isLandscape ? 1.35 : 1.45;
  } else if (fmt === 'A5') {
    textScaleFactor = isLandscape ? 0.76 : 0.82;
  } else {
    // A4
    textScaleFactor = isLandscape ? 0.94 : 1.0;
  }

  // Clean up and optimize text line breaks
  const cleanText = (text: string | undefined): string => {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  };

  const cleanedTitle = cleanText(content.title);
  const cleanedSubtitle = cleanText(content.subtitle);
  const cleanedBadge = cleanText(content.badgeText);
  const cleanedTagline = cleanText(content.headerTagline);

  // ----------------------------------------------------
  // 3. VECTOR GRAPHICS SIZES (SWOOSH & CURVES)
  // ----------------------------------------------------
  let swooshWidth = 240;
  let curveSize = 340;

  if (fmt === 'A3') {
    swooshWidth = isLandscape ? 460 : 380;
    curveSize = 540;
  } else if (fmt === 'A5') {
    swooshWidth = isLandscape ? 180 : 140;
    curveSize = 210;
  } else {
    // A4
    swooshWidth = isLandscape ? 300 : 240;
    curveSize = 340;
  }

  // ----------------------------------------------------
  // 4. VERTICAL VS HORIZONTAL SECTION ORDER ISOLATION
  // Ensure portrait vertical fix does not interfere with landscape horizontal fix
  // ----------------------------------------------------
  const baseOrder = DEFAULT_SECTION_ORDER;
  const sectionOrderPortrait = content.sectionOrderPortrait && content.sectionOrderPortrait.length > 0 
    ? content.sectionOrderPortrait 
    : baseOrder;
  const sectionOrderLandscape = content.sectionOrderLandscape && content.sectionOrderLandscape.length > 0 
    ? content.sectionOrderLandscape 
    : baseOrder;

  // ----------------------------------------------------
  // 5. SECTION VISIBILITY RESET & OPTIMIZATION
  // ----------------------------------------------------
  const fullVisibility = {
    header: true,
    heroImage: true,
    promotionBox: true,
    priceTables: true,
    servicesBox: true,
    ecoBanner: true,
    qrCode: true,
    disclaimer: true,
    footer: true,
  };

  // Build optimized content object
  const optimizedContent: FlyerContent = {
    ...content,
    heroImageHeightPx,
    textScaleFactor,
    title: cleanedTitle,
    subtitle: cleanedSubtitle,
    badgeText: cleanedBadge,
    headerTagline: cleanedTagline,
    showCropMarks: false,
    sectionVisibility: fullVisibility,
    visibility: fullVisibility,
    sectionOrderPortrait,
    sectionOrderLandscape,
    nordicSwoosh: {
      enabled: true,
      position: content.nordicSwoosh?.position || 'top_right',
      variant: content.nordicSwoosh?.variant || 'swoosh_skier',
      size: 'custom',
      customWidthPx: swooshWidth,
      opacity: content.nordicSwoosh?.opacity ?? 90,
    },
    ornamentCurves: {
      enabled: true,
      position: content.ornamentCurves?.position || 'header_right',
      sizePx: curveSize,
      opacity: content.ornamentCurves?.opacity ?? 25,
    },
    customColors: {
      primary: content.customColors?.primary || '#0D4D5E',
      secondary: content.customColors?.secondary || '#072F3A',
      accent: content.customColors?.accent || '#AAD0D1',
      background: content.customColors?.background || '#F4F9FA',
      cardBg: content.customColors?.cardBg || '#FFFFFF',
      textColor: content.customColors?.textColor || '#0D4D5E',
    }
  };

  const formatLabel = `${fmt} (${isLandscape ? 'Orizzontale ↔️' : 'Verticale ↕️'})`;
  const message = `✨ Layout e bilanciamento perfetti applicati per ${formatLabel} - Modello: ${style.toUpperCase()}`;

  return { content: optimizedContent, message };
}

import { FlyerContent, LanguageCode, MultilingualTextSet } from '../types';

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'de', label: 'Tedesco (DE)', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano (IT)', flag: '🇮🇹' },
  { code: 'en', label: 'Inglese (EN)', flag: '🇬🇧' }
];

export function getInitialTranslations(base: FlyerContent): {
  de: MultilingualTextSet;
  it: MultilingualTextSet;
  en: MultilingualTextSet;
} {
  const existing = base.translations;
  
  const it: MultilingualTextSet = {
    headerTagline: existing?.it?.headerTagline || base.headerTagline || 'DIGITAL PASS',
    badgeText: existing?.it?.badgeText || base.badgeText || '',
    title: existing?.it?.title || base.title || '',
    subtitle: existing?.it?.subtitle || base.subtitle || '',
    validityPeriod: existing?.it?.validityPeriod || base.validityPeriod || '',
    location: existing?.it?.location || base.location || '',
    pricePrefix: existing?.it?.pricePrefix || base.pricePrefix || '',
    priceSuffix: existing?.it?.priceSuffix || base.priceSuffix || '',
    priceNote: existing?.it?.priceNote || base.priceNote || '',
    featuresTitle: existing?.it?.featuresTitle || base.featuresTitle || '',
    ctaText: existing?.it?.ctaText || base.ctaText || '',
    addressInfo: existing?.it?.addressInfo || base.addressInfo || '',
    holderName: existing?.it?.holderName || base.holderName || 'Mario Rossi',
    issueDate: existing?.it?.issueDate || base.issueDate || '15.12.2026',
    features: existing?.it?.features || base.features || [],
    priceListTexts: existing?.it?.priceListTexts || base.priceListTexts
  };

  const de: MultilingualTextSet = {
    headerTagline: existing?.de?.headerTagline || (base.headerTagline ? translateToDe(base.headerTagline) : 'DIGITAL PASS'),
    badgeText: existing?.de?.badgeText || (base.badgeText ? translateToDe(base.badgeText) : ''),
    title: existing?.de?.title || (base.title ? translateToDe(base.title) : ''),
    subtitle: existing?.de?.subtitle || (base.subtitle ? translateToDe(base.subtitle) : ''),
    validityPeriod: existing?.de?.validityPeriod || base.validityPeriod || '',
    location: existing?.de?.location || (base.location ? translateToDe(base.location) : ''),
    pricePrefix: existing?.de?.pricePrefix || (base.pricePrefix === 'DA' ? 'AB' : base.pricePrefix === 'PREZZO' ? 'PREIS' : base.pricePrefix),
    priceSuffix: existing?.de?.priceSuffix || (base.priceSuffix ? translateToDe(base.priceSuffix) : ''),
    priceNote: existing?.de?.priceNote || (base.priceNote ? translateToDe(base.priceNote) : ''),
    featuresTitle: existing?.de?.featuresTitle || (base.featuresTitle ? translateToDe(base.featuresTitle) : ''),
    ctaText: existing?.de?.ctaText || (base.ctaText ? translateToDe(base.ctaText) : ''),
    addressInfo: existing?.de?.addressInfo || (base.addressInfo ? translateToDe(base.addressInfo) : ''),
    holderName: existing?.de?.holderName || base.holderName || 'Max Mustermann',
    issueDate: existing?.de?.issueDate || base.issueDate || '15.12.2026',
    features: existing?.de?.features || base.features?.map(f => ({ ...f, text: translateToDe(f.text) })) || [],
    priceListTexts: existing?.de?.priceListTexts || base.priceListTexts
  };

  const en: MultilingualTextSet = {
    headerTagline: existing?.en?.headerTagline || (base.headerTagline ? translateToEn(base.headerTagline) : 'DIGITAL PASS'),
    badgeText: existing?.en?.badgeText || (base.badgeText ? translateToEn(base.badgeText) : ''),
    title: existing?.en?.title || (base.title ? translateToEn(base.title) : ''),
    subtitle: existing?.en?.subtitle || (base.subtitle ? translateToEn(base.subtitle) : ''),
    validityPeriod: existing?.en?.validityPeriod || base.validityPeriod || '',
    location: existing?.en?.location || (base.location ? translateToEn(base.location) : ''),
    pricePrefix: existing?.en?.pricePrefix || (base.pricePrefix === 'DA' ? 'FROM' : base.pricePrefix === 'PREZZO' ? 'PRICE' : base.pricePrefix),
    priceSuffix: existing?.en?.priceSuffix || (base.priceSuffix ? translateToEn(base.priceSuffix) : ''),
    priceNote: existing?.en?.priceNote || (base.priceNote ? translateToEn(base.priceNote) : ''),
    featuresTitle: existing?.en?.featuresTitle || (base.featuresTitle ? translateToEn(base.featuresTitle) : ''),
    ctaText: existing?.en?.ctaText || (base.ctaText ? translateToEn(base.ctaText) : ''),
    addressInfo: existing?.en?.addressInfo || (base.addressInfo ? translateToEn(base.addressInfo) : ''),
    holderName: existing?.en?.holderName || base.holderName || 'John Doe',
    issueDate: existing?.en?.issueDate || base.issueDate || '15.12.2026',
    features: existing?.en?.features || base.features?.map(f => ({ ...f, text: translateToEn(f.text) })) || [],
    priceListTexts: existing?.en?.priceListTexts || base.priceListTexts
  };

  return { de, it, en };
}

function translateToDe(text: string): string {
  if (!text) return '';
  let res = text;
  const replacements: [RegExp, string][] = [
    [/ONLINE TICKET • BIGLIETTO DIGITALE • ONLINE-TICKET/gi, 'DIGITAL PASS'],
    [/OFFERTA SPECIALE HOTEL PARTNER/gi, 'SONDERANGEBOT PARTNERHOTEL'],
    [/BIGLIETTO GIORNALIERO UFFICIALE/gi, 'OFFIZIELLES TAGES-TICKET'],
    [/BIGLIETTO SETTIMANALE/gi, 'WOCHENKARTE / TICKET'],
    [/BUONO REGALO UFFICIALE/gi, 'OFFIZIELLER GUTSCHEIN'],
    [/Settimana Bianca Sci di Fondo & Relax/gi, 'Langlauf- & Wellnesswoche Dolomiten'],
    [/BIGLIETTO GIORNALIERO/gi, 'TAGESKARTE LANGLAUF'],
    [/SETTIMANALE DI AREA/gi, 'AREA WOCHENKARTE'],
    [/SETTIMANALE DOLOMITI NORDICSKI/gi, 'DOLOMITI NORDICSKI WOCHENKARTE'],
    [/VOUCHER ESPERIENZA SCI DI FONDO/gi, 'LANGLAUF ERLEBNIS GUTSCHEIN'],
    [/Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere\./gi, 'Exklusiver Hotelaufenthalt inkl. Dolomiti NordicSki Pass und Wellnessbereich.'],
    [/Valido 1 Giorno sulle piste da fondo dell'area selezionata/gi, 'Gültig für 1 Tag auf den Langlaufloipen des gewählten Gebiets'],
    [/Valido 7 Giorni consecutivi nella singola area di fondo selezionata/gi, 'Gültig für 7 aufeinanderfolgende Tage im gewählten Langlaufgebiet'],
    [/Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki/gi, 'Gültig für 7 aufeinanderfolgende Tage in allen 8 Gebieten des Karussells'],
    [/Un regalo speciale per vivere la magia delle piste da fondo sulle Dolomiti UNESCO\./gi, 'Ein besonderes Geschenk für Skilanglauf auf den UNESCO-Dolomiten.'],
    [/Servizi Inclusi nel Pacchetto Hotel:/gi, 'Inkludierte Leistungen des Hotelpakets:'],
    [/Specifiche Biglietto Giornaliero:/gi, 'Spezifikationen Tages-Ticket:'],
    [/Specifiche Settimanale Singola Area:/gi, 'Spezifikationen AREA Wochenkarte:'],
    [/Specifiche Settimanale Carosello 8 Valli:/gi, 'Spezifikationen Karussell-Wochenkarte:'],
    [/Cosa comprende questo Voucher:/gi, 'Inhalt dieses Gutscheins:'],
    [/Prenota la Tua Vacanza Neve Online/gi, 'Buchen Sie Ihren Langlaufurlaub Online'],
    [/Presentare ai varchi automatici di accesso/gi, 'An den automatischen Drehkreuzen vorzeigen'],
    [/Riscatta il Tuo Voucher Online/gi, 'Gutschein Online einlösen'],
    [/Incluso Skipass Dolomiti NordicSki 3 giorni/gi, 'Inklusive 3-Tage Dolomiti NordicSki Pass'],
    [/Titolo personale non cedibile/gi, 'Persönliches nicht übertragbares Ticket'],
    [/Notti per persona/gi, 'Nächte pro Person'],
    [/Giornaliero/gi, 'Tageskarte'],
    [/Settimanale/gi, 'Wochenkarte'],
    [/Stagionale/gi, 'Saisonkarte']
  ];
  for (const [pattern, sub] of replacements) {
    res = res.replace(pattern, sub);
  }
  return res;
}

function translateToEn(text: string): string {
  if (!text) return '';
  let res = text;
  const replacements: [RegExp, string][] = [
    [/ONLINE TICKET • BIGLIETTO DIGITALE • ONLINE-TICKET/gi, 'DIGITAL PASS'],
    [/OFFERTA SPECIALE HOTEL PARTNER/gi, 'SPECIAL PARTNER HOTEL OFFER'],
    [/BIGLIETTO GIORNALIERO UFFICIALE/gi, 'OFFICIAL DAILY SKI TICKET'],
    [/BIGLIETTO SETTIMANALE/gi, 'OFFICIAL WEEKLY SKI PASS'],
    [/BUONO REGALO UFFICIALE/gi, 'OFFICIAL GIFT VOUCHER'],
    [/Settimana Bianca Sci di Fondo & Relax/gi, 'Cross-Country Ski & Wellness Week'],
    [/BIGLIETTO GIORNALIERO/gi, 'DAILY SKI PASS'],
    [/SETTIMANALE DI AREA/gi, 'SINGLE AREA WEEKLY PASS'],
    [/SETTIMANALE DOLOMITI NORDICSKI/gi, 'DOLOMITI NORDICSKI WEEKLY PASS'],
    [/VOUCHER ESPERIENZA SCI DI FONDO/gi, 'CROSS-COUNTRY SKI EXPERIENCE VOUCHER'],
    [/Soggiorno esclusivo in hotel con Skipass Dolomiti NordicSki incluso e servizi benessere\./gi, 'Exclusive hotel stay including Dolomiti NordicSki pass and wellness.'],
    [/Valido 1 Giorno sulle piste da fondo dell'area selezionata/gi, 'Valid for 1 day on cross-country trails in the selected area'],
    [/Valido 7 Giorni consecutivi nella singola area di fondo selezionata/gi, 'Valid for 7 consecutive days in the selected cross-country area'],
    [/Valido 7 Giorni consecutivi su tutte le 8 Aree del Carosello Dolomiti NordicSki/gi, 'Valid for 7 consecutive days in all 8 Carousel areas'],
    [/Un regalo speciale per vivere la magia delle piste da fondo sulle Dolomiti UNESCO\./gi, 'A special gift to experience cross-country skiing in the UNESCO Dolomites.'],
    [/Servizi Inclusi nel Pacchetto Hotel:/gi, 'Services Included in the Hotel Package:'],
    [/Specifiche Biglietto Giornaliero:/gi, 'Daily Ticket Specifications:'],
    [/Specifiche Settimanale Singola Area:/gi, 'Single Area Weekly Pass Specifications:'],
    [/Specifiche Settimanale Carosello 8 Valli:/gi, 'Carousel Weekly Pass Specifications:'],
    [/Cosa comprende questo Voucher:/gi, 'What this Voucher includes:'],
    [/Prenota la Tua Vacanza Neve Online/gi, 'Book Your Ski Holiday Online'],
    [/Presentare ai varchi automatici di accesso/gi, 'Present at automatic access gates'],
    [/Riscatta il Tuo Voucher Online/gi, 'Redeem Your Voucher Online'],
    [/Incluso Skipass Dolomiti NordicSki 3 giorni/gi, 'Includes 3-Day Dolomiti NordicSki Pass'],
    [/Titolo personale non cedibile/gi, 'Personal non-transferable ticket'],
    [/Notti per persona/gi, 'Nights per person'],
    [/Giornaliero/gi, 'Daily Pass'],
    [/Settimanale/gi, 'Weekly Pass'],
    [/Stagionale/gi, 'Season Pass']
  ];
  for (const [pattern, sub] of replacements) {
    res = res.replace(pattern, sub);
  }
  return res;
}

export function getContentForLanguage(content: FlyerContent, lang: LanguageCode): FlyerContent {
  const translations = content.translations || getInitialTranslations(content);
  const langSet = translations[lang] || translations['it'] || {};

  return {
    ...content,
    activeLanguage: lang,
    headerTagline: langSet.headerTagline ?? content.headerTagline,
    badgeText: langSet.badgeText ?? content.badgeText,
    title: langSet.title ?? content.title,
    subtitle: langSet.subtitle ?? content.subtitle,
    validityPeriod: langSet.validityPeriod ?? content.validityPeriod,
    location: langSet.location ?? content.location,
    pricePrefix: langSet.pricePrefix ?? content.pricePrefix,
    priceSuffix: langSet.priceSuffix ?? content.priceSuffix,
    priceNote: langSet.priceNote ?? content.priceNote,
    featuresTitle: langSet.featuresTitle ?? content.featuresTitle,
    ctaText: langSet.ctaText ?? content.ctaText,
    addressInfo: langSet.addressInfo ?? content.addressInfo,
    holderName: langSet.holderName ?? content.holderName ?? 'Mario Rossi',
    issueDate: langSet.issueDate ?? content.issueDate ?? '15.12.2026',
    features: langSet.features ?? content.features,
    priceListTexts: {
      ...content.priceListTexts,
      ...langSet.priceListTexts
    }
  };
}

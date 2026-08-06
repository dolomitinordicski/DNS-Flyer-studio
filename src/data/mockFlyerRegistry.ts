import { FlyerRecord } from '../types';
import { FLYER_TEMPLATES } from './templates';

export const INITIAL_FLYER_REGISTRY: FlyerRecord[] = [
  {
    id: 'flyer_rec_01',
    title: 'Listino Ufficiale Carosello 2026/27',
    regionId: 'dns_central',
    regionName: '01 Dolomiti NordicSki Central',
    status: 'issued',
    publishDate: '2026-10-15',
    validityPeriod: 'Stagione Invernale 2026/2027',
    location: '900+ km Piste Dolomiti UNESCO',
    category: 'season_pass',
    priceInfo: 'Da 10€ / Giornaliero',
    targetAudience: 'Sciatori di fondo, Famiglie, Turisti',
    createdByRegion: 'Consorzio Dolomiti NordicSki',
    createdAt: '2026-10-10T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
    viewsCount: 1420,
    downloadsCount: 520,
    content: {
      ...(FLYER_TEMPLATES[0].defaultContent as any),
      graphicStyle: 'official_price_table',
      regionId: 'dns_central',
      title: 'PRICES & INFORMATION',
      badgeText: 'UFFICIALE DOLOMITI NORDICSKI',
      validityPeriod: 'Inverno 2026/2027',
      location: 'Dolomiti UNESCO World Heritage'
    }
  }
];

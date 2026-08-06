import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FlyerVariantProps } from './VariantTypes';
import { DolomitiNordicSkiLogo, DolomitiSkierTrackEmblem } from '../CorporateVectors';

export const OnlineTicketVariant: React.FC<FlyerVariantProps> = ({
  content,
  plt,
  theme,
  regionLogo,
  visibility
}) => {
  const fmt = content.format || 'A4';
  const isA5 = fmt === 'A5';
  const isA3 = fmt === 'A3';
  const isLandscape = content.orientation === 'landscape';

  // Dynamic spacing and font sizes
  const paddingClass = isA5 ? 'p-3 sm:p-4' : 'p-5 sm:p-7';
  const mainGap = isA5 ? 'gap-2.5' : 'gap-4';

  const titleSize = isA5 ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl';
  const priceSize = isA5 ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl';
  const qrSize = isA5 ? 64 : 85;

  // Serial ticket code placeholder
  const ticketSerial = content.addressInfo?.includes('Ticket ID')
    ? content.addressInfo
    : `TICKET ID: #TK-2026-DNS-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div 
      className={`relative z-10 h-full flex flex-col justify-between text-slate-900 ${paddingClass} font-vietnam ${mainGap} overflow-hidden min-w-0 ${content.cornerStyle === 'sharp' ? '[&_*]:!rounded-none' : ''}`}
      style={{ backgroundColor: theme.cardBgHex }}
    >
      
      {/* 1. MANIFESTO HEADER BANNER */}
      {visibility.header && (
        <div 
          className="rounded-2xl p-3 sm:p-4 border shadow-sm relative overflow-hidden shrink-0 flex flex-col gap-2"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primaryHex}, ${theme.secondaryHex})`,
            borderColor: `${theme.accentHex}40`,
            color: '#FFFFFF'
          }}
        >
          {/* Subtle Watermark Skier Emblem */}
          <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none w-28 h-28">
            <DolomitiSkierTrackEmblem color="#FFFFFF" />
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 relative z-10">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#AAD0D1] block truncate">
                {content.headerTagline || 'DIGITAL PASS'}
              </span>
              <h1 className={`${titleSize} font-black tracking-tight leading-none text-white font-vietnam uppercase break-words`}>
                {content.title || 'BIGLIETTO ONLINE'}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-200 font-bold tracking-tight truncate">
                {content.subtitle || 'Dolomiti NordicSki - Cross Country Ski Ticket'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {regionLogo && regionLogo.id !== 'dns_central' && (
                <div className="bg-white/90 p-1.5 rounded-xl shadow-xs border border-white/20 shrink-0">
                  <img
                    src={regionLogo.logoSrc || `https://www.dolomitinordicski.com/images/logos/${regionLogo.id}.png`}
                    alt={regionLogo.name}
                    className="h-8 sm:h-10 object-contain max-w-[80px]"
                    onError={(e) => {
                      // Fallback text if logo missing
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <DolomitiNordicSkiLogo 
                variant="horizontal_light" 
                className="h-9 sm:h-12 shrink-0 object-contain" 
              />
            </div>
          </div>

          {/* Sub Header Ticket Specs Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-wider text-slate-100 relative z-10">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded-md bg-[#AAD0D1] text-[#0D4D5E] font-black shadow-2xs">
                {content.badgeText || 'TICKET UFFICIALE'}
              </span>
              <span className="truncate">{content.location || 'Dolomiti NordicSki'}</span>
            </div>
            <div className="text-right text-[#AAD0D1] font-black shrink-0 ml-2">
              STAGIONE {content.validityPeriod || '2026/27'}
            </div>
          </div>
        </div>
      )}

      {/* Hero Image Buffer */}
      {visibility.heroImage && content.heroImageUrl && (
        <div 
          className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md shrink-0 transition-all duration-300 ${!content.heroImageHeightPx ? (isA5 ? 'flex-1 min-h-[60px] max-h-[140px]' : isA3 ? 'flex-1 min-h-[180px] max-h-[400px]' : isLandscape ? 'flex-1 min-h-[80px] max-h-[200px]' : 'flex-1 min-h-[100px] max-h-[300px]') : ''}`}
          style={content.heroImageHeightPx ? { height: `${content.heroImageHeightPx}px` } : undefined}
        >
          <img src={content.heroImageUrl} alt={content.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>
      )}

      {/* 2. MAIN TICKET COUPON & BARCODE SCANNER BLOCK */}
      <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
        
        {/* Ticket Coupon Card */}
        {visibility.promotionBox && (
          <div 
            className="rounded-2xl border-2 p-3.5 sm:p-4 shadow-md space-y-3 relative overflow-hidden"
            style={{ backgroundColor: theme.bgHex, borderColor: `${theme.primaryHex}40` }}
          >
            {/* Dashed cut line styling */}
            <div className="flex items-center justify-between gap-2 border-b-2 border-dashed pb-2.5" style={{ borderColor: `${theme.primaryHex}30` }}>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  TITOLO DI VIAGGIO DI STAMPA / BASE TICKET PRINT
                </div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-tight" style={{ color: theme.primaryHex }}>
                  {content.location || 'Dolomiti NordicSki Area'}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[8.5px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 tracking-wider">
                  {content.pricePrefix || 'TARIFFA'}: {content.priceAmount} {content.priceCurrency}
                </span>
              </div>
            </div>

            {/* Price & QR Scanner Grid */}
            <div className="grid grid-cols-12 gap-3 items-center">
              
              {/* Left Details */}
              <div className="col-span-7 space-y-2">
                <div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    TIPOLOGIA & VALIDA PER:
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                    {content.title}
                  </div>
                  <p className="text-[10px] text-slate-600 font-bold mt-0.5 leading-snug">
                    {content.subtitle}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500">
                    <span>Codice Seriale Ticket:</span>
                    <span className="text-[#0D4D5E] font-black">{ticketSerial}</span>
                  </div>
                  <div className="text-[8.5px] text-slate-500 font-bold italic line-clamp-2">
                    {content.priceNote || 'Presentare questo documento ai varchi d\'accesso o ai controllori in pista.'}
                  </div>
                </div>
              </div>

              {/* Right QR Code & Barcode Block */}
              <div className="col-span-5 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                {visibility.qrCode && content.qrCode.enabled && (
                  <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-xs mb-1.5">
                    <QRCodeSVG 
                      value={content.qrCode.url || 'https://www.dolomitinordicski.com'} 
                      size={qrSize} 
                      fgColor={theme.primaryHex} 
                    />
                  </div>
                )}

                {/* Simulated 1D Barcode Graphic */}
                <div className="w-full flex justify-between items-center h-5 px-1 py-0.5 bg-slate-900 rounded my-1 opacity-90 overflow-hidden">
                  {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 2, 6, 3, 1, 5, 2, 4].map((w, i) => (
                    <div 
                      key={i} 
                      className="bg-white h-full" 
                      style={{ width: `${w}px` }} 
                    />
                  ))}
                </div>

                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  VARCO / TURNSTILE SCAN
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. TICKET SPECIFICATIONS & FEATURES LIST */}
        <div className="grid grid-cols-12 gap-3 min-h-0 flex-1">
          
          {/* Key Ticket Conditions / Inclusions */}
          <div className="col-span-7 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-[10.5px] sm:text-[11.5px] font-black uppercase tracking-wider text-[#0D4D5E] font-vietnam flex items-center gap-1.5">
                <span>📋</span>
                <span>{content.featuresTitle || 'Specifiche & Condizioni Ticket:'}</span>
              </h3>

              <div className="mt-2 space-y-1.5">
                {content.features.slice(0, 4).map((feat) => (
                  <div 
                    key={feat.id} 
                    className={`p-1.5 sm:p-2 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-start gap-2 ${
                      feat.highlight 
                        ? 'bg-[#0D4D5E]/10 text-[#0D4D5E] border border-[#0D4D5E]/20' 
                        : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span className="text-[#0D4D5E] font-black shrink-0 mt-0.5">✓</span>
                    <span className="leading-tight font-bold">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Turnstile Access Note */}
            <div className="p-2 bg-slate-100/80 rounded-xl border border-slate-200 text-[9px] text-slate-600 font-bold flex items-center gap-2">
              <span className="text-base shrink-0">🎫</span>
              <span className="leading-tight">
                <strong>Istruzioni ai varchi:</strong> Accostare il QR Code o Barcode al lettore ottico dei tornelli per convalidare l'accesso alle piste.
              </span>
            </div>
          </div>

          {/* Right Summary Table Box */}
          <div className="col-span-5 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-vietnam">
                DATI VERIFICA TICKET:
              </h3>

              <div className="mt-2 space-y-2 text-[10px] font-bold text-slate-700">
                <div className="flex justify-between pb-1 border-b border-slate-200">
                  <span className="text-slate-500">Rete:</span>
                  <span className="font-black text-[#0D4D5E]">Dolomiti NordicSki</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200">
                  <span className="text-slate-500">Validità:</span>
                  <span className="font-black text-slate-900">{content.validityPeriod}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200">
                  <span className="text-slate-500">Stato Ticket:</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">VALIDO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Info / Help:</span>
                  <span className="font-bold text-slate-800">{content.contactPhone || content.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-white rounded-xl border border-slate-200 text-[8.5px] text-slate-500 font-bold text-center">
              Base grafica non modificabile per la stampa del biglietto online.
            </div>
          </div>

        </div>

      </div>

      {/* 4. OFFICIAL LEGAL DISCLAIMER (TRILINGUAL) */}
      {visibility.disclaimer && (
        <div className="p-2 sm:p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[8px] sm:text-[9px] text-slate-600 space-y-0.5 leading-tight font-bold shrink-0 shadow-inner">
          <p className="line-clamp-1"><strong>DE:</strong> {plt.disclaimerDe}</p>
          <p className="line-clamp-1"><strong>IT:</strong> {plt.disclaimerIt}</p>
          <p className="line-clamp-1"><strong>EN:</strong> {plt.disclaimerEn}</p>
        </div>
      )}

      {/* 5. FOOTER */}
      {visibility.footer && (
        <div className="pt-1.5 border-t flex items-center justify-between text-[8.5px] sm:text-[9.5px] text-slate-500 font-black uppercase tracking-widest shrink-0" style={{ borderColor: `${theme.primaryHex}30` }}>
          <div className="truncate min-w-0">{content.addressInfo || 'Consorzio Dolomiti NordicSki'}</div>
          <div className="font-black shrink-0 ml-2" style={{ color: theme.primaryHex }}>{content.websiteUrl || 'www.dolomitinordicski.com'}</div>
        </div>
      )}

    </div>
  );
};

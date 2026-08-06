import React from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  FileText, 
  Layout, 
  RotateCw, 
  Eye, 
  Image as ImageIcon,
  Check,
  TrendingUp,
  Palette,
  Sparkles
} from 'lucide-react';
import { PaperFormat, PaperOrientation, LayoutTemplateId } from '../types';
import { FLYER_TEMPLATES } from '../data/templates';
import { DolomitiFullLogo } from './CorporateVectors';

interface NavbarProps {
  paperFormat: PaperFormat;
  onChangeFormat: (format: PaperFormat) => void;
  orientation: PaperOrientation;
  onToggleOrientation: () => void;
  activeTemplateId: LayoutTemplateId;
  onSelectTemplate: (templateId: LayoutTemplateId) => void;
  showCropMarks: boolean;
  onToggleCropMarks: () => void;
  onOpenShareModal: () => void;
  onPrintPdf: () => void;
  onExportPng: () => void;
  isExporting: boolean;
  activeView: 'editor' | 'dashboard';
  onToggleView: (view: 'editor' | 'dashboard') => void;
  onMakeItPerfect?: () => void;
  isOnlineTicketModel?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  paperFormat,
  onChangeFormat,
  orientation,
  onToggleOrientation,
  activeTemplateId,
  onSelectTemplate,
  showCropMarks,
  onToggleCropMarks,
  onOpenShareModal,
  onPrintPdf,
  onExportPng,
  isExporting,
  activeView,
  onToggleView,
  onMakeItPerfect,
  isOnlineTicketModel = false
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & View Switcher */}
        <div className="flex items-center gap-3">
          <DolomitiFullLogo variant="original" className="h-9 sm:h-10" />
          <div className="border-l border-slate-200 pl-3 flex items-center gap-2">
            
            {/* View Mode Switcher Pills */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => onToggleView('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'editor'
                    ? 'bg-[#0D4D5E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Editor Studio</span>
              </button>

              <button
                onClick={() => onToggleView('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === 'dashboard'
                    ? 'bg-[#0D4D5E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>

          </div>
        </div>

        {/* Center Controls: Format, Orientation, Templates */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          
          {/* Paper Format Picker */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-[10px] font-black text-[#0D4D5E] uppercase tracking-widest hidden lg:block">Formato:</span>
            <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm shrink-0">
              {(['A4', 'A5', 'A3'] as PaperFormat[]).map((fmt) => {
                const isA3Disabled = isOnlineTicketModel && fmt === 'A3';
                return (
                  <button
                    key={fmt}
                    disabled={isA3Disabled}
                    onClick={() => onChangeFormat(fmt)}
                    title={isA3Disabled ? 'Formato A3 disabilitato per Biglietti Online (solo A4 e A5)' : `Seleziona formato ${fmt}`}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                      paperFormat === fmt
                        ? 'bg-[#0D4D5E] text-white shadow-md'
                        : isA3Disabled
                        ? 'text-slate-300 opacity-40 cursor-not-allowed'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div 
                      className={`border-2 ${paperFormat === fmt ? 'border-white' : 'border-slate-300'} rounded-[1px] shadow-xs`}
                      style={{
                        width: fmt === 'A3' ? '14px' : fmt === 'A4' ? '12px' : '10px',
                        height: fmt === 'A3' ? '20px' : fmt === 'A4' ? '17px' : '14px',
                        backgroundColor: paperFormat === fmt ? 'rgba(255,255,255,0.3)' : 'transparent'
                      }}
                    />
                    <span>{fmt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-300" />

          {/* Orientation Toggle */}
          <button
            onClick={onToggleOrientation}
            disabled={isOnlineTicketModel}
            title={
              isOnlineTicketModel
                ? 'I biglietti online richiedono esclusivamente il formato Verticale (Portrait)'
                : 'Cambia orientamento pagina'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isOnlineTicketModel
                ? 'text-slate-400 opacity-50 cursor-not-allowed bg-slate-200/50'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-[#0D4D5E]" />
            <span>{orientation === 'portrait' ? 'Verticale' : 'Orizzontale'}</span>
            {isOnlineTicketModel && (
              <span className="text-[9px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-1 py-0.2 rounded">Bloccato</span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-300" />

          {/* Crop Marks Toggle */}
          <button
            onClick={onToggleCropMarks}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              showCropMarks
                ? 'bg-white text-[#0D4D5E] border border-[#0D4D5E]/30 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mostra segni di rifilo e abbondanza per la tipografia"
          >
            <Eye className="w-3.5 h-3.5 text-[#0D4D5E]" />
            <span>Segni di Stampa</span>
          </button>
        </div>

        {/* Action Buttons: Make It Perfect, Print PDF, Share */}
        <div className="flex items-center gap-2">
          
          {/* Make It Perfect CTA */}
          {onMakeItPerfect && (
            <button
              onClick={onMakeItPerfect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-xs border border-amber-300 transition-all transform active:scale-95"
              title="Riallinea, riduci/ingrandisci e bilancia la grafica per il formato selezionato"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
              <span className="hidden sm:inline">Make it perfect</span>
            </button>
          )}

          {/* Social Share Modal */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all"
            title="Condividi sui Social Network o WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0D4D5E]" />
            <span className="hidden md:inline">Condividi</span>
          </button>

          {/* PNG Export */}
          <button
            onClick={onExportPng}
            disabled={isExporting}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all disabled:opacity-50"
            title="Scarica Immagine PNG ad Alta Risoluzione"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>PNG</span>
          </button>

          {/* PDF & Print Button (Primary CTA) */}
          <button
            onClick={onPrintPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#0D4D5E] hover:bg-[#083642] text-white text-xs font-bold shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Stampa PDF ({paperFormat})</span>
          </button>
        </div>

      </div>
    </header>
  );
};

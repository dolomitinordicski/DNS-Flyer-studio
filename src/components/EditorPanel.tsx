import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Type, 
  Palette, 
  MapPin, 
  Image as ImageIcon, 
  QrCode, 
  Plus, 
  Trash2, 
  Check, 
  Layers,
  Settings,
  Sliders,
  Upload,
  Globe,
  Dumbbell,
  Cloud,
  Layout,
  CheckCircle2,
  Copy,
  Save,
  Loader2,
  FolderPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  RotateCcw,
  Move,
  Maximize2,
  Square
} from 'lucide-react';
import { FlyerContent, LayoutTemplateId, BrandColorScheme, PaperFormat, GraphicStyle, FlyerSectionId, LanguageCode, MultilingualTextSet } from '../types';
import { FLYER_TEMPLATES, DEFAULT_PRICE_LIST_TEXTS } from '../data/templates';
import { REGIONAL_LOGOS } from '../data/regionalLogos';
import { SPORTS_ICONS } from '../data/sportsIcons';
import { DolomitiSkierTrackEmblem, OFFICIAL_ASSET_PATHS } from './CorporateVectors';
import { saveDesignToFirebase, loadDesignsFromFirebase, deleteDesignFromFirebase, SavedDesign } from '../lib/firebase';
import { DEFAULT_SECTION_ORDER } from './flyer-variants/VariantTypes';
import { LANGUAGE_OPTIONS, getInitialTranslations, getContentForLanguage } from '../utils/multilingual';

interface EditorPanelProps {
  content: FlyerContent;
  onChangeContent: (updated: Partial<FlyerContent>) => void;
  onApplyTemplate: (templateId: LayoutTemplateId) => void;
  onOpenSavedDesignsModal: () => void;
  onMakeItPerfect?: () => void;
}

const STOCK_IMAGES = [
  { id: '1', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80', label: 'Pista Fondo Soleggiata' },
  { id: '2', url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=1200&q=80', label: 'Atleta Skating Neve' },
  { id: '3', url: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1200&q=80', label: 'Famiglia Fondo Vette' },
  { id: '4', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80', label: 'Rifugio & Chalet Neve' },
  { id: '5', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', label: 'Pista Notturna Fiaccole' },
  { id: '6', url: 'https://images.unsplash.com/photo-1482867996988-29ec3a0f128f?auto=format&fit=crop&w=1200&q=80', label: 'Vette Dolomitiche UNESCO' }
];

export const EditorPanel: React.FC<EditorPanelProps> = ({
  content,
  onChangeContent,
  onApplyTemplate,
  onOpenSavedDesignsModal,
  onMakeItPerfect
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'style_variant' | 'graphic_elements' | 'content' | 'region' | 'images' | 'style' | 'icons' | 'qr'>('templates');
  const [activeOrderOrientation, setActiveOrderOrientation] = useState<'portrait' | 'landscape'>(content.orientation || 'portrait');

  // Sync orientation tab when flyer orientation changes externally
  useEffect(() => {
    if (content.orientation) {
      setActiveOrderOrientation(content.orientation);
    }
  }, [content.orientation]);

  // Visibility fallback object
  const currentVis = content.sectionVisibility || content.visibility || {
    header: true, heroImage: true, promotionBox: true, priceTables: true,
    servicesBox: true, ecoBanner: true, earlyBird: true, qrCode: true, disclaimer: true, footer: true
  };

  // File input ref for image uploading
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firebase saved designs local state
  const [firebaseSavedModels, setFirebaseSavedModels] = useState<SavedDesign[]>([]);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Fetch saved designs from Firebase Firestore on mount
  useEffect(() => {
    fetchSavedModels();
  }, []);

  const fetchSavedModels = async () => {
    try {
      const items = await loadDesignsFromFirebase();
      setFirebaseSavedModels(items);
    } catch (err) {
      console.error('Error fetching Firebase models:', err);
    }
  };

  // Helper 1: Add a New Custom Model
  const handleCreateNewModel = () => {
    const newTitle = prompt('Inserisci il nome per il nuovo modello:', 'Nuovo Modello Personalizzato');
    if (!newTitle) return;

    onChangeContent({
      title: newTitle,
      subtitle: 'Personalizza qui i dettagli del tuo nuovo modello per strutture o clienti.',
      badgeText: 'MODELLO PERSONALIZZATO',
      priceAmount: '0,00',
      priceCurrency: '€',
      pricePrefix: 'Da',
      priceSuffix: '/ persona',
      features: [
        { id: `feat_${Date.now()}_1`, icon: 'skipass', text: 'Servizio personalizzato 1', highlight: true },
        { id: `feat_${Date.now()}_2`, icon: 'trail', text: 'Servizio personalizzato 2', highlight: false }
      ]
    });

    setSaveToast('Nuovo modello creato! Ora puoi personalizzarlo e salvarlo su Firebase.');
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Helper 2: Copy / Duplicate Current Active Model
  const handleDuplicateCurrentModel = () => {
    const duplicatedTitle = `${content.title || 'Modello'} (Copia)`;
    onChangeContent({
      title: duplicatedTitle
    });

    setSaveToast(`Modello duplicato come "${duplicatedTitle}"! Pronti per la modifica.`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Helper 3: Save Model Directly to Firebase
  const handleSaveModelToFirebase = async () => {
    setIsSavingToFirebase(true);
    try {
      await saveDesignToFirebase(
        null,
        content.title || 'Modello Dolomiti NordicSki',
        content,
        content.graphicStyle || 'classic_corporate',
        content.heroImageUrl
      );
      
      await fetchSavedModels();
      setSaveToast(' Modello salvato con successo su Firebase Cloud!');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      alert('Errore durante il salvataggio su Firebase: ' + (err.message || 'Riprova.'));
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  // Handle local image file upload & conversion to Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const existingImports = content.importedImages || [];
        const updatedImports = [dataUrl, ...existingImports];
        onChangeContent({
          importedImages: updatedImports,
          heroImageUrl: dataUrl
        });
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove imported image
  const handleRemoveImportedImage = (urlToRemove: string) => {
    const updated = (content.importedImages || []).filter(u => u !== urlToRemove);
    onChangeContent({
      importedImages: updated,
      heroImageUrl: content.heroImageUrl === urlToRemove ? STOCK_IMAGES[0].url : content.heroImageUrl
    });
  };

  // Handle Feature item update
  const handleUpdateFeature = (id: string, text: string) => {
    const updated = content.features.map(f => f.id === id ? { ...f, text } : f);
    onChangeContent({ features: updated });
  };

  // Add new feature
  const handleAddFeature = () => {
    const newFeature = {
      id: `feat_${Date.now()}`,
      icon: 'skipass',
      text: 'Nuovo servizio incluso nel pacchetto',
      highlight: false
    };
    onChangeContent({ features: [...content.features, newFeature] });
  };

  // Remove feature
  const handleRemoveFeature = (id: string) => {
    onChangeContent({ features: content.features.filter(f => f.id !== id) });
  };

  // Toggle Sports Icon selection
  const handleToggleSportsIcon = (iconId: string) => {
    const exists = content.selectedSportsIcons.includes(iconId);
    if (exists) {
      onChangeContent({
        selectedSportsIcons: content.selectedSportsIcons.filter(id => id !== iconId)
      });
    } else {
      if (content.selectedSportsIcons.length >= 6) {
        alert('Puoi selezionare al massimo 6 icone sportive contemporaneamente.');
        return;
      }
      onChangeContent({
        selectedSportsIcons: [...content.selectedSportsIcons, iconId]
      });
    }
  };

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-hidden no-print">
      
      {/* Top Banner for Firebase Saved Designs Trigger & Make It Perfect */}
      <div className="bg-[#0D4D5E] px-3.5 py-2 text-white flex flex-col gap-2 border-b border-[#0D4D5E]/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#AAD0D1] animate-pulse" />
            <span className="text-xs font-bold font-vietnam">Database Cloud Firebase</span>
          </div>
          <button
            onClick={onOpenSavedDesignsModal}
            className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-bold text-white border border-white/20 transition-all flex items-center gap-1.5"
          >
            <span>Design Salvati</span>
            <span className="bg-[#AAD0D1] text-slate-950 px-1.5 py-0.2 rounded-full text-[9px] font-black">
              Cloud
            </span>
          </button>
        </div>

        {/* Make It Perfect Quick Action Button */}
        {onMakeItPerfect && (
          <button
            onClick={onMakeItPerfect}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all border border-amber-300 transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
            <span>MAKE IT PERFECT (Perfeziona Grafica)</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs Header - 3 Column Grid ensuring ALL tabs including Colori are visible on all screen sizes */}
      <div className="grid grid-cols-3 gap-1 bg-[#F4F9FA] p-2 border-b border-slate-200">
        {[
          { id: 'templates', label: 'Modelli', icon: LayoutTemplate },
          { id: 'style_variant', label: 'Stile', icon: Layout },
          { id: 'graphic_elements', label: 'Graphic Elements', icon: Sparkles },
          { id: 'content', label: 'Testi', icon: Type },
          { id: 'region', label: 'Regione', icon: MapPin },
          { id: 'images', label: 'Immagini', icon: ImageIcon },
          { id: 'style', label: 'Colori', icon: Palette },
          { id: 'icons', label: 'Icone', icon: Dumbbell },
          { id: 'qr', label: 'QR Code', icon: QrCode }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-[#0D4D5E] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/70'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#AAD0D1]' : 'text-[#0D4D5E]'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* TAB 1: MODELLI PREIMPOSTATI & GESTIONE MODELLI */}
        {activeTab === 'templates' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-[#0D4D5E]" />
                  Modelli Documenti Dolomiti NordicSki
                </span>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  9 Ufficiali
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seleziona uno dei listini o documenti ufficiali, crea un nuovo modello o duplica quello attivo. Salva e sincronizza su Firebase.
              </p>
            </div>

            {/* Notification Toast for Model Actions */}
            {saveToast && (
              <div className="p-3 bg-[#0D4D5E] text-white rounded-xl text-xs font-bold font-vietnam animate-fade-in flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#AAD0D1]" />
                  <span>{saveToast}</span>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS FOR MODEL CRUD & FIREBASE SYNC */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handleCreateNewModel}
                className="flex flex-col items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-lg text-[10px] font-bold text-[#0D4D5E] transition-all shadow-2xs group"
                title="Inizia un nuovo modello vuoto"
              >
                <FolderPlus className="w-4 h-4 mb-1 text-[#0D4D5E] group-hover:scale-110 transition-transform" />
                <span>+ Nuovo</span>
              </button>

              <button
                type="button"
                onClick={handleDuplicateCurrentModel}
                className="flex flex-col items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] rounded-lg text-[10px] font-bold text-slate-700 hover:text-[#0D4D5E] transition-all shadow-2xs group"
                title="Copia e duplica il modello correntemente attivo"
              >
                <Copy className="w-4 h-4 mb-1 text-[#417483] group-hover:scale-110 transition-transform" />
                <span>📋 Copia</span>
              </button>

              <button
                type="button"
                onClick={handleSaveModelToFirebase}
                disabled={isSavingToFirebase}
                className="flex flex-col items-center justify-center p-2 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-lg text-[10px] font-bold transition-all shadow-2xs disabled:opacity-50 group"
                title="Salva modello nel Database Firebase Cloud"
              >
                {isSavingToFirebase ? (
                  <Loader2 className="w-4 h-4 mb-1 animate-spin text-[#AAD0D1]" />
                ) : (
                  <Cloud className="w-4 h-4 mb-1 text-[#AAD0D1] group-hover:scale-110 transition-transform" />
                )}
                <span>☁️ Firebase</span>
              </button>
            </div>

            {/* OFFICIAL 6 MODEL TEMPLATES */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-vietnam">
                Listini & Documenti Ufficiali
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {FLYER_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => onApplyTemplate(tmpl.id)}
                    className="group relative p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#0D4D5E] cursor-pointer transition-all shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-[#0D4D5E] border border-slate-300/60 font-vietnam">
                          {tmpl.tagline}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 font-vietnam group-hover:text-[#0D4D5E]">
                          {tmpl.name}
                        </h4>
                      </div>
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 mt-1 shadow-2xs"
                        style={{ backgroundColor: tmpl.previewColor }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FIREBASE SAVED MODELS LIST */}
            {firebaseSavedModels.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#417483]" />
                    I Miei Modelli Salvati in Firebase ({firebaseSavedModels.length})
                  </h4>
                  <button
                    onClick={onOpenSavedDesignsModal}
                    className="text-[10px] text-[#0D4D5E] font-bold hover:underline"
                  >
                    Gestisci Tutti
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {firebaseSavedModels.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onChangeContent(m.content);
                        setSaveToast(`Modello "${m.title}" caricato da Firebase!`);
                        setTimeout(() => setSaveToast(null), 3000);
                      }}
                      className="p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0D4D5E] cursor-pointer transition-all flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 font-vietnam truncate max-w-[200px]">
                          {m.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          Salvato il {new Date(m.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-[#AAD0D1]/30 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam shrink-0">
                        Carica
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: STILE GRAFICO (STILI LAYOUT CORPORATE) */}
        {activeTab === 'style_variant' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#0D4D5E]" />
                  Stili Grafici Corporate Identity Manual
                </span>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  8 Stili
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Applica uno degli stili di layout ufficiali approvati dal Corporate Design Dolomiti NordicSki:
              </p>
            </div>

            {/* MAKE IT PERFECT QUICK TRIGGER */}
            {onMakeItPerfect && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border border-amber-400/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-amber-900 text-xs flex items-center gap-1.5 font-vietnam">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>Ottimizzazione Layout "Make It Perfect"</span>
                  </span>
                  <button
                    type="button"
                    onClick={onMakeItPerfect}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 text-xs font-black rounded-lg shadow-xs transition-all active:scale-95"
                  >
                    Rendi Perfetto
                  </button>
                </div>
                <p className="text-[11px] text-slate-700 leading-snug">
                  Adatta l'altezza dell'immagine header come buffer flessibile, ridimensiona i testi, calcola le interlinee e applica il bilanciamento per {content.format} {content.orientation === 'landscape' ? 'Orizzontale' : 'Verticale'}.
                </p>
              </div>
            )}

            {/* SEZIONE STILE BORDI ED ANGOLI (Arrotondati vs A Spigolo) */}
            <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                  <Square className="w-4 h-4 text-[#0D4D5E]" />
                  <span>Stile Bordi ed Angoli Elementi</span>
                </h4>
                <span className="text-[10px] font-bold bg-[#0D4D5E]/10 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  {content.cornerStyle === 'sharp' ? 'A Spigolo' : 'Arrotondati'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Scegli se applicare angoli morbidi arrotondati oppure spigoli squadrati a card, box, immagini header e badge.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onChangeContent({ cornerStyle: 'rounded' })}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    (content.cornerStyle || 'rounded') === 'rounded'
                      ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 ${ (content.cornerStyle || 'rounded') === 'rounded' ? 'border-white bg-white/20' : 'border-[#0D4D5E] bg-[#0D4D5E]/10' } flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-xs ${ (content.cornerStyle || 'rounded') === 'rounded' ? 'bg-white' : 'bg-[#0D4D5E]' }`} />
                  </div>
                  <div>
                    <div className="font-bold text-xs font-vietnam leading-none">Arrotondati</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Morbidi standard</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeContent({ cornerStyle: 'sharp' })}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    content.cornerStyle === 'sharp'
                      ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-none border-2 ${ content.cornerStyle === 'sharp' ? 'border-white bg-white/20' : 'border-[#0D4D5E] bg-[#0D4D5E]/10' } flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-none ${ content.cornerStyle === 'sharp' ? 'bg-white' : 'bg-[#0D4D5E]' }`} />
                  </div>
                  <div>
                    <div className="font-bold text-xs font-vietnam leading-none">A Spigolo</div>
                    <div className="text-[9px] opacity-80 mt-0.5">Squadrati / Retti</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Price list style lock banner */}
            {(content.graphicStyle === 'official_price_table') && (
              <div className="p-3.5 bg-[#0D4D5E]/10 border border-[#0D4D5E]/30 rounded-xl space-y-1">
                <div className="font-extrabold text-[#0D4D5E] flex items-center gap-1.5 font-vietnam text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#0D4D5E] shrink-0" />
                  <span>Stile Unificato: Tabella Prezzi Ufficiale Trilingue (DE / IT / EN)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Per garantire l'uniformità del brand, i listini prezzi (Carosello 900+ km e Singola Area) utilizzano esclusivamente il modello <strong>Tabella Prezzi Ufficiale 2026/27</strong>. In questo modello puoi aggiungere un'immagine panoramica, personalizzare le info e inserire il QR code e il logo della regione.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {[
                {
                  id: 'classic_corporate',
                  name: '1. Classico Corporate Alpine',
                  desc: 'Header blu navy con logo ufficiale Dolomiti NordicSki, badge partner regionale, fascia prezzi ad alto contrasto e doppio tracciato sciatore.',
                  badge: 'Standard Ufficiale'
                },
                {
                  id: 'modern_glacier',
                  name: '2. Modern Glacier Carousel',
                  desc: 'Layout contemporaneo con blocco azzurro ghiacciaio in alto, ampia foto panoramica split e card fluttuanti con swoosh.',
                  badge: 'Stile Carosello'
                },
                {
                  id: 'nordic_modern',
                  name: '3. Nordic Modern High-Contrast',
                  desc: 'Stile moderno scuro ad alto contrasto con dettagli cyan, gradienti sportivi e grafica dinamica.',
                  badge: 'Modern Dark'
                },
                {
                  id: 'official_price_table',
                  name: '4. Tabella Prezzi Ufficiale 2026/27',
                  desc: 'Layout strutturato trilingue (DE/IT/EN) con griglia prezzi singola area e carosello, logo regionale, foto panoramica, banner plastic-free e QR code.',
                  badge: 'Listino Prezzi Unificato'
                },
                {
                  id: 'manifesto_voucher',
                  name: '5. Manifesto & Ticket Voucher',
                  desc: 'Frame e bordi istituzionali stile attestato/locandina reception hotel, griglia dati e bollini di garanzia.',
                  badge: 'Stile Manifesto'
                },
                {
                  id: 'classic_official',
                  name: '6. Classico Istituzionale',
                  desc: 'Variante classica istituzionale con colori ufficiali e composizione elegante.',
                  badge: 'Istituzionale'
                },
                {
                  id: 'glacier_panorama',
                  name: '7. Ghiacciaio Panorama',
                  desc: 'Focus panoramico su paesaggi montani con elementi traslucidi e tipografia in risalto.',
                  badge: 'Panorama'
                },
                {
                  id: 'official_ticket_voucher',
                  name: '8. Pass & Ticket Voucher',
                  desc: 'Formato voucher ufficiale per skipass settimanali e stagionali con codici di verifica.',
                  badge: 'Ticket Pass'
                },
                {
                  id: 'online_ticket_manifesto',
                  name: '9. Biglietto Stampa Online Manifesto',
                  desc: 'Base monolingua stile manifesto per la stampa di biglietti online (Giornaliero, Settimanale Area e DNS) con Barcode, QR Code e indicazioni varchi.',
                  badge: 'Biglietto Stampa'
                }
              ].map((variant) => {
                const isSelected = (content.graphicStyle || 'classic_corporate') === variant.id;
                const isLockedForPriceList = content.graphicStyle === 'official_price_table' && variant.id !== 'official_price_table';

                return (
                  <div
                    key={variant.id}
                    onClick={() => {
                      if (isLockedForPriceList) return;
                      onChangeContent({ graphicStyle: variant.id as GraphicStyle });
                    }}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-50 border-[#0D4D5E] ring-2 ring-[#0D4D5E]/15 shadow-sm'
                        : isLockedForPriceList
                          ? 'bg-slate-100/70 border-slate-200 opacity-50 cursor-not-allowed pointer-events-none'
                          : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                          variant.id === 'official_price_table'
                            ? 'bg-[#0D4D5E] text-white'
                            : 'bg-[#0D4D5E]/10 text-[#0D4D5E]'
                        }`}>
                          {variant.badge}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1 font-vietnam">
                          {variant.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-[#0D4D5E]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {variant.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GRAPHIC ELEMENTS, FILIGRANA HEADER & SEZIONI */}
        {activeTab === 'graphic_elements' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                Graphic Elements & Filigrana Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Gestisci la grafica del Langläufer con Kurve negli angoli, la filigrana vector in trasparenza nell'header e la visibilità delle sezioni.
              </p>
            </div>

            {/* NORDIC SWOOSH & LANGLÄUFER CONFIGURATION */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-vietnam">Langläufer / Swoosh Angoli</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.nordicSwoosh?.enabled ?? true}
                    onChange={(e) => {
                      onChangeContent({
                        nordicSwoosh: {
                          enabled: e.target.checked,
                          position: content.nordicSwoosh?.position || 'top_right',
                          variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                          size: 'custom',
                          customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                          opacity: content.nordicSwoosh?.opacity ?? 90
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]"></div>
                </label>
              </div>

              {(content.nordicSwoosh?.enabled ?? true) && (
                <div className="space-y-4 pt-1">
                  {/* Variant Choice */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">
                      Variante Grafica Ufficiale
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onChangeContent({
                            nordicSwoosh: {
                              enabled: true,
                              position: content.nordicSwoosh?.position || 'top_right',
                              variant: 'swoosh_skier',
                              size: 'custom',
                              customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                              opacity: content.nordicSwoosh?.opacity ?? 90
                            }
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          (content.nordicSwoosh?.variant || 'swoosh_skier') === 'swoosh_skier'
                            ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img src={OFFICIAL_ASSET_PATHS.kurveLanglaeufer} alt="Sciatore con Kurve" className="h-7 object-contain" />
                        <span className="text-[10px]">Swoosh + Sciatore</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeContent({
                            nordicSwoosh: {
                              enabled: true,
                              position: content.nordicSwoosh?.position || 'top_right',
                              variant: 'swoosh_only',
                              size: 'custom',
                              customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                              opacity: content.nordicSwoosh?.opacity ?? 90
                            }
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          content.nordicSwoosh?.variant === 'swoosh_only'
                            ? 'bg-[#0D4D5E] text-white border-[#0D4D5E] font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <img src={OFFICIAL_ASSET_PATHS.kurve} alt="Solo Swoosh Kurve" className="h-7 object-contain" />
                        <span className="text-[10px]">Solo Swoosh</span>
                      </button>
                    </div>
                  </div>

                  {/* Corner Position Choice (Strictly 4 corners) */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">
                      Posizionamento Angolo
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'top_right', label: '↗ Alto Destra' },
                        { id: 'top_left', label: '↖ Alto Sinistra' },
                        { id: 'bottom_right', label: '↘ Basso Destra' },
                        { id: 'bottom_left', label: '↙ Basso Sinistra' }
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => {
                            onChangeContent({
                              nordicSwoosh: {
                                enabled: true,
                                position: pos.id as any,
                                variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                                size: 'custom',
                                customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                                opacity: content.nordicSwoosh?.opacity ?? 90
                              }
                            });
                          }}
                          className={`p-2 rounded-lg border text-[11px] font-bold text-center transition-all ${
                            (content.nordicSwoosh?.position || 'top_right') === pos.id
                              ? 'bg-[#0D4D5E]/10 border-[#0D4D5E] text-[#0D4D5E]'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensioning / Ingrandimento Libero (Slider + Direct Input) */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Dimensione / Ingrandimento Grafica</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="50"
                          max="900"
                          value={content.nordicSwoosh?.customWidthPx || 220}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 220;
                            onChangeContent({
                              nordicSwoosh: {
                                enabled: true,
                                position: content.nordicSwoosh?.position || 'top_right',
                                variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                                size: 'custom',
                                customWidthPx: Math.max(50, Math.min(900, val)),
                                opacity: content.nordicSwoosh?.opacity ?? 90
                              }
                            });
                          }}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 text-xs"
                        />
                        <span className="text-slate-500 font-bold">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="800"
                      step="10"
                      value={content.nordicSwoosh?.customWidthPx || 220}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onChangeContent({
                          nordicSwoosh: {
                            enabled: true,
                            position: content.nordicSwoosh?.position || 'top_right',
                            variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                            size: 'custom',
                            customWidthPx: val,
                            opacity: content.nordicSwoosh?.opacity ?? 90
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                      <span>Piccolo (60px)</span>
                      <span>Medio (220px)</span>
                      <span>Molto Grande (800px)</span>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Trasparenza / Opacità</span>
                      <span>{content.nordicSwoosh?.opacity ?? 90}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={content.nordicSwoosh?.opacity ?? 90}
                      onChange={(e) => {
                        onChangeContent({
                          nordicSwoosh: {
                            enabled: true,
                            position: content.nordicSwoosh?.position || 'top_right',
                            variant: content.nordicSwoosh?.variant || 'swoosh_skier',
                            size: 'custom',
                            customWidthPx: content.nordicSwoosh?.customWidthPx || 220,
                            opacity: parseInt(e.target.value)
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* HEADER WATERMARK VECTOR CURVE CONFIGURATION */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest font-vietnam">Filigrana Kurve Header (Sfondo)</h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={content.ornamentCurves?.enabled ?? true}
                    onChange={(e) => {
                      onChangeContent({
                        ornamentCurves: {
                          enabled: e.target.checked,
                          opacity: content.ornamentCurves?.opacity ?? 25,
                          sizePx: content.ornamentCurves?.sizePx ?? 320
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]"></div>
                </label>
              </div>

              {(content.ornamentCurves?.enabled ?? true) && (
                <div className="space-y-4 pt-1">
                  {/* Header Watermark Size */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Larghezza Filigrana Header</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="150"
                          max="600"
                          value={content.ornamentCurves?.sizePx ?? 320}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 320;
                            onChangeContent({
                              ornamentCurves: {
                                enabled: true,
                                opacity: content.ornamentCurves?.opacity ?? 25,
                                sizePx: Math.max(150, Math.min(600, val))
                              }
                            });
                          }}
                          className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold text-slate-900 text-xs"
                        />
                        <span className="text-slate-500 font-bold">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="150"
                      max="550"
                      step="10"
                      value={content.ornamentCurves?.sizePx ?? 320}
                      onChange={(e) => {
                        onChangeContent({
                          ornamentCurves: {
                            enabled: true,
                            opacity: content.ornamentCurves?.opacity ?? 25,
                            sizePx: parseInt(e.target.value)
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>

                  {/* Header Watermark Opacity */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase mb-1">
                      <span>Trasparenza Filigrana</span>
                      <span>{content.ornamentCurves?.opacity ?? 25}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={content.ornamentCurves?.opacity ?? 25}
                      onChange={(e) => {
                        onChangeContent({
                          ornamentCurves: {
                            enabled: true,
                            opacity: parseInt(e.target.value),
                            sizePx: content.ornamentCurves?.sizePx ?? 320
                          }
                        });
                      }}
                      className="w-full accent-[#0D4D5E]"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: CONTENUTI & TESTI */}
        {activeTab === 'content' && (() => {
          const plt = content.priceListTexts || {};
          const activeLang: LanguageCode = content.activeLanguage || 'it';
          const translations = content.translations || getInitialTranslations(content);
          const isPriceTable = content.graphicStyle === 'official_price_table';

          const handleSelectLanguage = (lang: LanguageCode) => {
            if (isPriceTable) return;
            const allTrans = {
              ...getInitialTranslations(content),
              ...content.translations
            };
            const targetLangData = allTrans[lang] || {};

            onChangeContent({
              activeLanguage: lang,
              translations: allTrans,
              headerTagline: targetLangData.headerTagline ?? content.headerTagline,
              badgeText: targetLangData.badgeText ?? content.badgeText,
              title: targetLangData.title ?? content.title,
              subtitle: targetLangData.subtitle ?? content.subtitle,
              validityPeriod: targetLangData.validityPeriod ?? content.validityPeriod,
              location: targetLangData.location ?? content.location,
              pricePrefix: targetLangData.pricePrefix ?? content.pricePrefix,
              priceSuffix: targetLangData.priceSuffix ?? content.priceSuffix,
              priceNote: targetLangData.priceNote ?? content.priceNote,
              featuresTitle: targetLangData.featuresTitle ?? content.featuresTitle,
              ctaText: targetLangData.ctaText ?? content.ctaText,
              addressInfo: targetLangData.addressInfo ?? content.addressInfo,
              features: targetLangData.features ?? content.features,
              priceListTexts: {
                ...content.priceListTexts,
                ...targetLangData.priceListTexts
              }
            });
          };

          const updateLangField = (field: keyof MultilingualTextSet, value: any) => {
            const allTrans = {
              ...getInitialTranslations(content),
              ...content.translations
            };
            const currentLangSet = allTrans[activeLang] || {};
            const updatedLangSet = {
              ...currentLangSet,
              [field]: value
            };
            const updatedTranslations = {
              ...allTrans,
              [activeLang]: updatedLangSet
            };

            const payload: any = {
              translations: updatedTranslations,
            };
            payload[field] = value;

            onChangeContent(payload);
          };

          const updatePlt = (key: string, val: string) => {
            const allTrans = {
              ...getInitialTranslations(content),
              ...content.translations
            };
            const currentLangSet = allTrans[activeLang] || {};
            const currentPlt = currentLangSet.priceListTexts || {};

            const updatedPlt = {
              ...currentPlt,
              [key]: val
            };

            const updatedLangSet = {
              ...currentLangSet,
              priceListTexts: updatedPlt
            };

            const updatedTranslations = {
              ...allTrans,
              [activeLang]: updatedLangSet
            };

            onChangeContent({
              translations: updatedTranslations,
              priceListTexts: {
                ...content.priceListTexts,
                [key]: val
              }
            });
          };

          const currentVis = content.sectionVisibility || content.visibility || {
            header: true, heroImage: true, promotionBox: true, priceTables: true,
            servicesBox: true, ecoBanner: true, earlyBird: true, qrCode: true, disclaimer: true, footer: true
          };

          const currentOrder: FlyerSectionId[] = activeOrderOrientation === 'portrait'
            ? (content.sectionOrderPortrait && content.sectionOrderPortrait.length > 0 ? content.sectionOrderPortrait : DEFAULT_SECTION_ORDER)
            : (content.sectionOrderLandscape && content.sectionOrderLandscape.length > 0 ? content.sectionOrderLandscape : DEFAULT_SECTION_ORDER);

          const renderSectionHeaderBar = (secId: FlyerSectionId, title: string, icon: string) => {
            const isVisible = (currentVis as any)[secId] ?? true;
            const idx = currentOrder.indexOf(secId);
            const isFirst = idx === 0;
            const isLast = idx === currentOrder.length - 1;
            const posNumber = idx >= 0 ? idx + 1 : null;

            const handleToggle = () => {
              const updated = {
                ...currentVis,
                [secId]: !isVisible
              };
              onChangeContent({
                sectionVisibility: updated,
                visibility: updated
              });
            };

            const handleMove = (action: 'top' | 'up' | 'down' | 'bottom') => {
              const copy = [...currentOrder];
              let secIdx = copy.indexOf(secId);
              if (secIdx === -1) {
                copy.push(secId);
                secIdx = copy.length - 1;
              }
              const item = copy.splice(secIdx, 1)[0];

              if (action === 'top') {
                copy.unshift(item);
              } else if (action === 'bottom') {
                copy.push(item);
              } else if (action === 'up') {
                copy.splice(Math.max(0, secIdx - 1), 0, item);
              } else if (action === 'down') {
                copy.splice(Math.min(copy.length, secIdx + 1), 0, item);
              }

              if (activeOrderOrientation === 'portrait') {
                onChangeContent({ sectionOrderPortrait: copy });
              } else {
                onChangeContent({ sectionOrderLandscape: copy });
              }
            };

            return (
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200/80 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm">{icon}</span>
                  <span className="font-bold text-slate-900 text-xs font-vietnam truncate">
                    {title}
                  </span>
                  {posNumber !== null && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#0D4D5E]/10 text-[#0D4D5E] shrink-0 font-vietnam" title={`Posizione #${posNumber} nella sequenza layout`}>
                      Pos. #{posNumber}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Visibilità Switch Button */}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black font-vietnam flex items-center gap-1 transition-all ${
                      isVisible
                        ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                    title={isVisible ? 'Sezione Attiva (Clicca per Nascondere)' : 'Sezione Nascosta (Clicca per Attivare)'}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isVisible ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Frecce Ordinamento */}
                  <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      title="Sposta in Cima (Top)"
                      disabled={isFirst}
                      onClick={() => handleMove('top')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ChevronsUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta Su"
                      disabled={isFirst}
                      onClick={() => handleMove('up')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta Giù"
                      disabled={isLast}
                      onClick={() => handleMove('down')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Sposta in Fondo (Bottom)"
                      disabled={isLast}
                      onClick={() => handleMove('bottom')}
                      className="p-1 rounded hover:bg-[#0D4D5E] hover:text-white disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                    >
                      <ChevronsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#0D4D5E]" />
                    Contenuti & Testi Volantino
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifica i testi nelle 3 lingue (DE / IT / EN), attiva/disattiva le sezioni e regolane l'ordinamento.
                  </p>
                </div>
              </div>

              {/* BARRA SELEZIONE LINGUA DI COMPILAZIONE (DE / IT / EN) */}
              {isPriceTable ? (
                <div className="p-3 bg-[#0D4D5E]/10 border border-[#0D4D5E]/30 text-slate-900 rounded-xl shadow-xs space-y-2 font-vietnam">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0D4D5E] shrink-0" />
                      <span className="font-bold text-xs text-[#0D4D5E]">Compilazione Multilingua (3 Lingue)</span>
                    </div>
                    <span className="text-[10px] bg-[#0D4D5E] text-white font-extrabold px-2 py-0.5 rounded-full">
                      Disabilitata per Listino DNS e Regioni
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    La compilazione in 3 lingue è <strong>disattivata per il modello Listino DNS e Regioni</strong> (Tabella Prezzi Ufficiale 2026/27). Questo modello utilizza la struttura tabellare unificata standard.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-xs space-y-2.5 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#AAD0D1]" />
                      <span className="font-bold text-xs font-vietnam tracking-wide">Compilazione Multilingua (3 Lingue)</span>
                    </div>
                    <span className="text-[10px] bg-[#AAD0D1]/20 text-[#AAD0D1] font-bold px-2 py-0.5 rounded-full font-vietnam">
                      Lingua Attiva: {activeLang.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-lg">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = activeLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => handleSelectLanguage(lang.code)}
                          className={`py-1.5 px-2 rounded-md text-xs font-bold font-vietnam flex items-center justify-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-[#0D4D5E] text-white shadow-xs ring-1 ring-[#AAD0D1]'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">
                    Stai modificando i testi per la versione <strong>{activeLang === 'de' ? 'Tedesco 🇩🇪' : activeLang === 'it' ? 'Italiano 🇮🇹' : 'Inglese 🇬🇧'}</strong>. Al momento dell'esportazione/stampa verranno generati i 3 documenti ufficiali per le 3 lingue.
                  </p>
                </div>
              )}

              {/* BARRA FORMATO ORDINAMENTO (VERTICALE / ORIZZONTALE) */}
              <div className="p-2.5 bg-[#0D4D5E]/10 rounded-xl border border-[#0D4D5E]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#0D4D5E]">
                  <Move className="w-4 h-4 text-[#0D4D5E]" />
                  <span className="text-xs font-bold font-vietnam">Ordinamento Sezioni per Formato:</span>
                </div>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveOrderOrientation('portrait')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-vietnam ${
                      activeOrderOrientation === 'portrait'
                        ? 'bg-[#0D4D5E] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-2 h-3 border border-current rounded-xs" />
                    <span>Verticale</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOrderOrientation('landscape')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 font-vietnam ${
                      activeOrderOrientation === 'landscape'
                        ? 'bg-[#0D4D5E] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="w-3 h-2 border border-current rounded-xs" />
                    <span>Orizzontale</span>
                  </button>
                </div>
              </div>

              {/* NOTICE BANNER FOR ONLINE TICKET MODEL */}
              {content.graphicStyle === 'online_ticket_manifesto' && (
                <div className="p-3.5 bg-[#0D4D5E]/10 rounded-xl border border-[#0D4D5E]/30 space-y-1 text-slate-800">
                  <div className="font-black text-xs text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0D4D5E]" />
                    <span>Modello Biglietto Stampa Online (Base Monolingua)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                    I campi testo del listino prezzi sono disattivati per questo modello. Il documento è ottimizzato come base di stampa ufficiale monolingua con Header trilingue, barcode di scansione, QR code e dettagli specifici del ticket.
                  </p>
                </div>
              )}

              {/* SPECIAL EXTENDED TEXT EDITOR FOR PRICE LIST FLYER (LISTINO PREZZI) */}
              {content.graphicStyle === 'official_price_table' && (
                <div className="space-y-3 bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30">
                  <div className="flex items-center justify-between pb-2 border-b border-[#0D4D5E]/20">
                    <div className="font-bold text-xs text-[#0D4D5E] uppercase tracking-wider font-vietnam flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0D4D5E]" />
                      <span>Personalizzazione Tutti i Testi Listino Prezzi</span>
                    </div>
                    <span className="text-[9px] font-black bg-[#0D4D5E] text-white px-2 py-0.5 rounded font-vietnam">
                      Struttura Unificata
                    </span>
                  </div>

                  {/* 1. Header & Season Year */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.header ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('header', '1. Header & Anno Stagione', '📌')}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">Anno / Stagione</label>
                        <input
                          type="text"
                          value={plt.seasonYear ?? DEFAULT_PRICE_LIST_TEXTS.seasonYear}
                          onChange={(e) => updatePlt('seasonYear', e.target.value)}
                          placeholder="26/27"
                          className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 font-bold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-500 font-bold mb-1">Titolo Principale</label>
                        <input
                          type="text"
                          value={plt.mainTitle ?? DEFAULT_PRICE_LIST_TEXTS.mainTitle}
                          onChange={(e) => updatePlt('mainTitle', e.target.value)}
                          placeholder="PRICES & INFORMATION"
                          className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Sottotitolo Header Trilingue</label>
                      <input
                        type="text"
                        value={plt.subTitle ?? DEFAULT_PRICE_LIST_TEXTS.subTitle}
                        onChange={(e) => updatePlt('subTitle', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Badge Banner Foto Hero</label>
                      <input
                        type="text"
                        value={plt.bannerTitle ?? DEFAULT_PRICE_LIST_TEXTS.bannerTitle}
                        onChange={(e) => updatePlt('bannerTitle', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 text-[11px]"
                      />
                    </div>
                  </div>

                  {/* 2. Tabella Area Singola / Regionale */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.priceTables ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('priceTables', '2. Tabella Area Singola (Regionale)', '📊')}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Header Tabella</label>
                      <input
                        type="text"
                        value={plt.regionalHeader ?? DEFAULT_PRICE_LIST_TEXTS.regionalHeader}
                        onChange={(e) => updatePlt('regionalHeader', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 font-bold"
                      />
                    </div>

                    {/* Giornaliero */}
                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-100">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-500 font-bold">Giornaliero Titolo</label>
                        <input
                          type="text"
                          value={plt.regionalDayTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalDayTitle}
                          onChange={(e) => updatePlt('regionalDayTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                        <input
                          type="text"
                          value={plt.regionalDaySub ?? DEFAULT_PRICE_LIST_TEXTS.regionalDaySub}
                          onChange={(e) => updatePlt('regionalDaySub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                        <input
                          type="text"
                          value={plt.regionalDayPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalDayPrice}
                          onChange={(e) => updatePlt('regionalDayPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                        />
                      </div>
                    </div>

                    {/* Settimanale */}
                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-100">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-500 font-bold">Settimanale Titolo</label>
                        <input
                          type="text"
                          value={plt.regionalWeekTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekTitle}
                          onChange={(e) => updatePlt('regionalWeekTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                        <input
                          type="text"
                          value={plt.regionalWeekSub ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekSub}
                          onChange={(e) => updatePlt('regionalWeekSub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                        <input
                          type="text"
                          value={plt.regionalWeekPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalWeekPrice}
                          onChange={(e) => updatePlt('regionalWeekPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                        />
                      </div>
                    </div>

                    {/* Stagionale */}
                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-100">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-500 font-bold">Stagionale Titolo</label>
                        <input
                          type="text"
                          value={plt.regionalSeasonTitle ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonTitle}
                          onChange={(e) => updatePlt('regionalSeasonTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                        <input
                          type="text"
                          value={plt.regionalSeasonSub ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonSub}
                          onChange={(e) => updatePlt('regionalSeasonSub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                        <input
                          type="text"
                          value={plt.regionalSeasonPrice ?? DEFAULT_PRICE_LIST_TEXTS.regionalSeasonPrice}
                          onChange={(e) => updatePlt('regionalSeasonPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold mt-1">Nota Asterisco Prezzi Autonomi</label>
                      <input
                        type="text"
                        value={plt.regionalNote ?? DEFAULT_PRICE_LIST_TEXTS.regionalNote}
                        onChange={(e) => updatePlt('regionalNote', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] italic"
                      />
                    </div>
                  </div>

                  {/* 3. Tabella Carosello Dolomiti NordicSki & Prevendita */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.earlyBird ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('earlyBird', '3. Tabella Carosello (900+ km) & Prevendita', '%')}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Header Tabella</label>
                      <input
                        type="text"
                        value={plt.carouselHeader ?? DEFAULT_PRICE_LIST_TEXTS.carouselHeader}
                        onChange={(e) => updatePlt('carouselHeader', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-900 font-bold"
                      />
                    </div>

                    {/* Settimanale Carosello */}
                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-100">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-500 font-bold">Settimanale Titolo</label>
                        <input
                          type="text"
                          value={plt.carouselWeekTitle ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekTitle}
                          onChange={(e) => updatePlt('carouselWeekTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                        <input
                          type="text"
                          value={plt.carouselWeekSub ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekSub}
                          onChange={(e) => updatePlt('carouselWeekSub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                        <input
                          type="text"
                          value={plt.carouselWeekPrice ?? DEFAULT_PRICE_LIST_TEXTS.carouselWeekPrice}
                          onChange={(e) => updatePlt('carouselWeekPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                        />
                      </div>
                    </div>

                    {/* Stagionale Carosello */}
                    <div className="grid grid-cols-12 gap-1.5 pt-1 border-t border-slate-100">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-slate-500 font-bold">Stagionale Titolo</label>
                        <input
                          type="text"
                          value={plt.carouselSeasonTitle ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonTitle}
                          onChange={(e) => updatePlt('carouselSeasonTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli / Sub</label>
                        <input
                          type="text"
                          value={plt.carouselSeasonSub ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonSub}
                          onChange={(e) => updatePlt('carouselSeasonSub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Prezzo</label>
                        <input
                          type="text"
                          value={plt.carouselSeasonPrice ?? DEFAULT_PRICE_LIST_TEXTS.carouselSeasonPrice}
                          onChange={(e) => updatePlt('carouselSeasonPrice', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-right"
                        />
                      </div>
                    </div>

                    {/* Prevendita Banner */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold">Etichetta Prevendita</label>
                        <input
                          type="text"
                          value={plt.earlyBirdLabel ?? DEFAULT_PRICE_LIST_TEXTS.earlyBirdLabel}
                          onChange={(e) => updatePlt('earlyBirdLabel', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold">Sconto & Scadenza</label>
                        <input
                          type="text"
                          value={plt.earlyBirdDiscount ?? DEFAULT_PRICE_LIST_TEXTS.earlyBirdDiscount}
                          onChange={(e) => updatePlt('earlyBirdDiscount', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Box Info, Servizi & Banner */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.servicesBox ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('servicesBox', '4. Box Info, Servizi & Banner', '⭐')}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Titolo Box Info</label>
                        <input
                          type="text"
                          value={plt.infoServicesHeader ?? DEFAULT_PRICE_LIST_TEXTS.infoServicesHeader}
                          onChange={(e) => updatePlt('infoServicesHeader', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Bambini Gratuiti (&lt;14)</label>
                        <input
                          type="text"
                          value={plt.infoKidsText ?? DEFAULT_PRICE_LIST_TEXTS.infoKidsText}
                          onChange={(e) => updatePlt('infoKidsText', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[9px] text-slate-500 font-bold">Scuole Sci & Noleggi</label>
                        <input
                          type="text"
                          value={plt.infoSchoolsText ?? DEFAULT_PRICE_LIST_TEXTS.infoSchoolsText}
                          onChange={(e) => updatePlt('infoSchoolsText', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold">Tagline Banner</label>
                        <input
                          type="text"
                          value={plt.ecoTagline ?? DEFAULT_PRICE_LIST_TEXTS.ecoTagline}
                          onChange={(e) => updatePlt('ecoTagline', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold">Titolo Biglietti Trilingue</label>
                        <input
                          type="text"
                          value={plt.ecoTitle ?? DEFAULT_PRICE_LIST_TEXTS.ecoTitle}
                          onChange={(e) => updatePlt('ecoTitle', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold">Dettagli Materiali / Digital Ticket</label>
                        <input
                          type="text"
                          value={plt.ecoSub ?? DEFAULT_PRICE_LIST_TEXTS.ecoSub}
                          onChange={(e) => updatePlt('ecoSub', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Disclaimers & Footer */}
                  <div className={`space-y-2 bg-white p-3 rounded-lg border transition-all ${
                    currentVis.disclaimer ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}>
                    {renderSectionHeaderBar('disclaimer', '5. Note Legali (Disclaimers) & Pie\' di Pagina', '📜')}
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold">Note DE</label>
                      <input
                        type="text"
                        value={plt.disclaimerDe ?? 'Keine Rückerstattung bei Betriebsunterbrechungen jeglicher Art. Keine Garantie für Befahrbarkeit aller Loipen.'}
                        onChange={(e) => updatePlt('disclaimerDe', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold">Note IT</label>
                      <input
                        type="text"
                        value={plt.disclaimerIt ?? 'Nessun rimborso in caso di interruzioni di servizio. Nessuna garanzia sulla praticabilità di tutte le piste.'}
                        onChange={(e) => updatePlt('disclaimerIt', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold">Note EN</label>
                      <input
                        type="text"
                        value={plt.disclaimerEn ?? 'No refund in case of service interruptions of any kind. No guarantee that all trails are open.'}
                        onChange={(e) => updatePlt('disclaimerEn', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-bold">Testo Network Pie' di Pagina</label>
                      <input
                        type="text"
                        value={plt.footerText ?? DEFAULT_PRICE_LIST_TEXTS.footerText}
                        onChange={(e) => updatePlt('footerText', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* STANDARD FLYER FIELDS (badge, title, price, features) */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.header ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('header', 'Titolo Documento & Header', '📌')}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Badge Promozionale Header</label>
                  <input
                    type="text"
                    value={content.badgeText}
                    onChange={(e) => updateLangField('badgeText', e.target.value)}
                    placeholder="Es. OFFERTA SPECIALE INVERNO 2026"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Titolo Principale Documento</label>
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) => updateLangField('title', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold text-sm focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sottotitolo / Descrizione</label>
                  <textarea
                    rows={2}
                    value={content.subtitle}
                    onChange={(e) => updateLangField('subtitle', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#0D4D5E] focus:ring-1 focus:ring-[#0D4D5E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Periodo di Validità</label>
                    <input
                      type="text"
                      value={content.validityPeriod}
                      onChange={(e) => updateLangField('validityPeriod', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Località / Pista</label>
                    <input
                      type="text"
                      value={content.location}
                      onChange={(e) => updateLangField('location', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Price Box Standard */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.promotionBox ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('promotionBox', 'Prezzo & Promozione Pacchetto', '🏷️')}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Prefisso</label>
                    <input
                      type="text"
                      value={content.pricePrefix}
                      onChange={(e) => updateLangField('pricePrefix', e.target.value)}
                      placeholder="Da"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Importo</label>
                    <input
                      type="text"
                      value={content.priceAmount}
                      onChange={(e) => onChangeContent({ priceAmount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Valuta</label>
                    <input
                      type="text"
                      value={content.priceCurrency}
                      onChange={(e) => onChangeContent({ priceCurrency: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Suffisso Prezzo</label>
                  <input
                    type="text"
                    value={content.priceSuffix}
                    onChange={(e) => updateLangField('priceSuffix', e.target.value)}
                    placeholder="/ 3 Notti per persona"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Nota Dettagliata Prezzo</label>
                  <input
                    type="text"
                    value={content.priceNote}
                    onChange={(e) => updateLangField('priceNote', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Features List (Multilingual Offer Rows) */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.servicesBox ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('servicesBox', 'Servizi, Vantaggi & Righe Offerta', '⭐')}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">Aggiungi e personalizza righe multilingua (DE / IT / EN)</span>
                  </div>
                  <button
                    onClick={handleAddFeature}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0D4D5E] hover:bg-[#083541] text-white rounded-md text-[10px] font-bold shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Aggiungi Riga</span>
                  </button>
                </div>

                {/* Multilingual Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Inserimento Rapido Modelli Multilingua:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '+ Day Ticket (3L)', text: '1 TAG GEBIET • 1G AREA • 1 DAY AREA' },
                      { label: '+ Week Ticket (3L)', text: '7 TAGE GEBIET • 7G AREA • 7 DAYS AREA' },
                      { label: '+ Season Ticket (3L)', text: 'GANZE SAISON • TUTTA LA STAGIONE • WHOLE SEASON' },
                      { label: '+ Kids Free (3L)', text: 'KINDER U14 KOSTENLOS / Bambini under 14 gratuiti / Children under 14 free' },
                      { label: '+ Skischulen (3L)', text: 'SKISCHULEN & VERLEIH / Scuole sci e noleggi in ogni area / Ski schools & rentals' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const newFeature = {
                            id: `feat_${Date.now()}_${idx}`,
                            icon: 'skipass',
                            text: preset.text,
                            highlight: false
                          };
                          onChangeContent({ features: [...content.features, newFeature] });
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[9px] font-bold transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Rows */}
                <div className="space-y-2 pt-1">
                  {content.features.map((feat, idx) => (
                    <div key={feat.id} className="flex flex-col gap-1 p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feat.text}
                          onChange={(e) => handleUpdateFeature(feat.id, e.target.value)}
                          placeholder="Esempio: 1 TAG GEBIET • 1G AREA • 1 DAY AREA"
                          className="flex-1 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-900 font-medium"
                        />
                        <button
                          onClick={() => {
                            const updated = content.features.map(f => f.id === feat.id ? { ...f, highlight: !f.highlight } : f);
                            onChangeContent({ features: updated });
                          }}
                          className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all border ${
                            feat.highlight 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                          title="Evidenzia riga"
                        >
                          Evidenziato
                        </button>
                        <button
                          onClick={() => handleRemoveFeature(feat.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
                          title="Elimina servizio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reorder controls */}
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium px-1">
                        <span>Riga {idx + 1} di {content.features.length}</span>
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              onClick={() => {
                                const newFeats = [...content.features];
                                const temp = newFeats[idx - 1];
                                newFeats[idx - 1] = newFeats[idx];
                                newFeats[idx] = temp;
                                onChangeContent({ features: newFeats });
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold"
                            >
                              ↑ Su
                            </button>
                          )}
                          {idx < content.features.length - 1 && (
                            <button
                              onClick={() => {
                                const newFeats = [...content.features];
                                const temp = newFeats[idx + 1];
                                newFeats[idx + 1] = newFeats[idx];
                                newFeats[idx] = temp;
                                onChangeContent({ features: newFeats });
                              }}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-bold"
                            >
                              ↓ Giù
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact & Footer */}
              <div className={`space-y-3 bg-slate-50 p-3.5 rounded-xl border transition-all ${
                currentVis.footer ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
              }`}>
                {renderSectionHeaderBar('footer', 'Contatti, Sito Web & Footer', '🌐')}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.ctaText}
                    onChange={(e) => updateLangField('ctaText', e.target.value)}
                    placeholder="Call to Action (es. Prenota Subito)"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    value={content.websiteUrl}
                    onChange={(e) => onChangeContent({ websiteUrl: e.target.value })}
                    placeholder="Sito Web (es. www.dolomitinordicski.com)"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={content.contactPhone}
                      onChange={(e) => onChangeContent({ contactPhone: e.target.value })}
                      placeholder="Telefono"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900"
                    />
                    <input
                      type="text"
                      value={content.contactEmail}
                      onChange={(e) => onChangeContent({ contactEmail: e.target.value })}
                      placeholder="Email"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {/* TAB 4: REGIONE & LOGHI */}
        {activeTab === 'region' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D4D5E]" />
                Regione & Partner Dolomiti NordicSki
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seleziona la regione o il consorzio turistico che pubblica la locandina.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {REGIONAL_LOGOS.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => onChangeContent({ regionId: reg.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    content.regionId === reg.id
                      ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={content.regionId === reg.id ? OFFICIAL_ASSET_PATHS.logoWhiteSvg : (reg.logoSrc || OFFICIAL_ASSET_PATHS.logoFarbe)} 
                      alt={reg.name} 
                      className="h-6 w-auto max-w-[90px] object-contain shrink-0" 
                    />
                    <div>
                      <div className={`font-bold text-xs font-vietnam ${content.regionId === reg.id ? 'text-white' : 'text-slate-900'}`}>{reg.name}</div>
                      <div className={`text-[10px] ${content.regionId === reg.id ? 'text-slate-200' : 'text-slate-500'}`}>{reg.subTitle}</div>
                    </div>
                  </div>
                  {content.regionId === reg.id && (
                    <Check className="w-4 h-4 text-[#AAD0D1]" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs">
              <div className="font-bold text-[#0D4D5E] font-vietnam flex items-center gap-1.5 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-[#0D4D5E]" />
                Loghi Ufficiali Dolomiti NordicSki
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tutte le 8 regioni utilizzano il logo e l'emblema ufficiale Dolomiti NordicSki (Langläufer & Kurve). Quando caricherai i file dei loghi dedicati delle singole regioni, verranno integrati qui.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold">Nome Personalizzato Regione (Opzionale)</label>
              <input
                type="text"
                value={content.customRegionName || ''}
                onChange={(e) => onChangeContent({ customRegionName: e.target.value })}
                placeholder="Lascia vuoto per usare il nome standard"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </div>
        )}

        {/* TAB 5: IMMAGINI & IMPORTAZIONE FILE */}
        {activeTab === 'images' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0D4D5E]" />
                Gestione Immagini & Upload
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Carica foto personalizzate dal tuo dispositivo oppure scegli dalla galleria stock Dolomiti.
              </p>
            </div>

            {/* TOGGLE VISIBILITÀ IMMAGINE SOTTO HEADER */}
            <div className="bg-[#0D4D5E]/10 p-3.5 rounded-xl border border-[#0D4D5E]/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-slate-900 font-bold font-vietnam text-xs flex items-center gap-1.5 cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-[#0D4D5E]" />
                  <span>Mostra Immagine sotto l'Header</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentVis.heroImage !== false}
                    onChange={(e) => {
                      const updatedVis = {
                        ...currentVis,
                        heroImage: e.target.checked
                      };
                      onChangeContent({
                        sectionVisibility: updatedVis,
                        visibility: updatedVis
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                </label>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Scegli se mostrare o nascondere l'immagine/foto principale sotto l'header per il modello attualmente selezionato ({FLYER_TEMPLATES.find(t => t.id === content.graphicStyle)?.name || 'Modello Selezionato'}).
              </p>
            </div>

            {/* Local File Upload Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-slate-900 font-bold font-vietnam flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0D4D5E]" />
                Carica Immagine Locale
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-[#0D4D5E] hover:bg-[#083845] text-white rounded-xl font-bold font-vietnam flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#AAD0D1]" />
                <span>Seleziona Foto dal Computer</span>
              </button>
            </div>

            {/* Uploaded Custom Images Gallery */}
            {content.importedImages && content.importedImages.length > 0 && (
              <div className="space-y-2">
                <label className="block text-slate-900 font-bold font-vietnam">
                  Le Tue Immagini Caricate ({content.importedImages.length})
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {content.importedImages.map((imgUrl, idx) => (
                    <div
                      key={`custom_${idx}`}
                      onClick={() => onChangeContent({ heroImageUrl: imgUrl })}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                        content.heroImageUrl === imgUrl ? 'border-[#0D4D5E] shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={imgUrl} alt={`Custom upload ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-between p-2">
                        <span className="text-[9px] font-bold text-white">Caricata</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImportedImage(imgUrl);
                          }}
                          className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                          title="Elimina immagine"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom URL Input */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold">Oppure Inserisci URL Immagine</label>
              <input
                type="text"
                value={content.heroImageUrl}
                onChange={(e) => onChangeContent({ heroImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
              />
            </div>

            {/* Stock Preset Gallery */}
            <div>
              <label className="block text-slate-700 font-bold mb-2">Galleria Immagini Suggerite</label>
              <div className="grid grid-cols-2 gap-2">
                {STOCK_IMAGES.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onChangeContent({ heroImageUrl: img.url })}
                    className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                      content.heroImageUrl === img.url ? 'border-[#0D4D5E] shadow-md scale-95' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-end p-1">
                      <span className="text-[9px] font-bold text-white line-clamp-1">{img.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout position option */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-bold">Posizione Immagine Principale</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeContent({ heroImagePosition: 'top' })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    content.heroImagePosition === 'top' ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Top Banner
                </button>
                <button
                  onClick={() => onChangeContent({ heroImagePosition: 'background' })}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    content.heroImagePosition === 'background' ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Sfondo Totale
                </button>
              </div>

              {content.heroImagePosition === 'background' && (
                <div className="mt-3">
                  <div className="flex justify-between text-slate-600 text-[11px] mb-1 font-medium">
                    <span>Trasparenza Overlay Sfondo</span>
                    <span className="font-bold text-[#0D4D5E]">{content.heroOverlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    value={content.heroOverlayOpacity}
                    onChange={(e) => onChangeContent({ heroOverlayOpacity: parseInt(e.target.value) })}
                    className="w-full accent-[#0D4D5E]"
                  />
                </div>
              )}
            </div>

            {/* Header Image Height Extension Buffer (Anti-Spazio Bianco) */}
            <div className="bg-[#0D4D5E]/5 p-3.5 rounded-xl border border-[#0D4D5E]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-900 font-bold font-vietnam text-xs flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-[#0D4D5E]" />
                  <span>Estensione Altezza Immagine Header</span>
                </label>
                <span className="font-black text-xs text-[#0D4D5E] bg-[#0D4D5E]/10 px-2 py-0.5 rounded font-vietnam">
                  {content.heroImageHeightPx ? `${content.heroImageHeightPx} px` : 'Flessibile Auto'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-snug">
                Regola l'altezza della foto principale per tutti i formati (A3, A4, A5) in orientamento Verticale o Orizzontale per chiudere gli spazi bianchi in basso.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={50}
                  max={600}
                  step={5}
                  value={content.heroImageHeightPx || 180}
                  onChange={(e) => onChangeContent({ heroImageHeightPx: parseInt(e.target.value) })}
                  className="flex-1 accent-[#0D4D5E]"
                />
                <button
                  type="button"
                  onClick={() => onChangeContent({ heroImageHeightPx: undefined })}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-black rounded-md transition-all shrink-0 font-vietnam"
                  title="Ripristina altezza flessibile automatica"
                >
                  Reset Auto
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: COLORI, LOGHI & ELEMENTI ORNAMENTALI */}
        {activeTab === 'style' && (
          <div className="space-y-5 text-xs">
            {/* SECTION 1: LOGO DOLOMITI NORDICSKI VARIANTS */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0D4D5E]" />
                  Variante Grafica Logo DNS
                </h3>
                <span className="text-[10px] font-bold bg-[#AAD0D1]/30 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                  Manuale Brand
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Seleziona la variante di logo più adatta allo stile grafico e allo sfondo del flyer:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'original', label: 'Originale (Teal / Ghiaccio)', desc: 'Standard su sfondi chiari' },
                  { id: 'horizontal', label: 'Orizzontale Esteso', desc: 'Layout su singola riga' },
                  { id: 'negative', label: 'Negativo (Bianco / Ghiaccio)', desc: 'Sfondi scuri o fotografici' },
                  { id: 'monochrome', label: 'Tinta Piatta (Pieno)', desc: 'Colore unico solido' },
                  { id: 'grayscale', label: 'Monocromatico / Scale di Grigio', desc: 'Stampa B/N o sobria' },
                  { id: 'skier_track_emblem', label: 'Solo Emblema Sciatore + Traccia', desc: 'Badge minimale' },
                  { id: 'badge_card', label: 'Card Badge Contornata', desc: 'Box bianco con bordo' },
                  { id: 'none', label: 'Nessun Logo', desc: 'Nascondi il logo' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onChangeContent({ logoVariant: v.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (content.logoVariant || 'original') === v.id
                        ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-[11px] font-vietnam">{v.label}</div>
                    <div className={`text-[9px] mt-0.5 ${ (content.logoVariant || 'original') === v.id ? 'text-slate-200' : 'text-slate-500' }`}>
                      {v.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION: VISIBILITÀ SEZIONI DOCUMENTO */}
            {/* SECTION 2: PALETTE CORPORATE & CUSTOM COLORS */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0D4D5E]" />
                  Palette Colori Ufficiali DNS
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Combinazioni di colori ufficiali dal Corporate Manual e personalizzazione libera.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  { 
                    id: 'frosted_ice', 
                    name: 'Frosted Ice Blue (#0D4D5E)', 
                    color: '#0D4D5E', 
                    desc: 'Klarheit, Frische & Reinheit • Prickelnde Höhenluft und unberührter Schnee' 
                  },
                  { 
                    id: 'nordic_sky', 
                    name: 'Nordic Sky Blue (#417483)', 
                    color: '#417483', 
                    desc: 'Gelassenheit, Balance & Freiheit • Weite des alpinen Himmels' 
                  },
                  { 
                    id: 'deep_glacier', 
                    name: 'Deep Glacier Blue (#AAD0D1)', 
                    color: '#AAD0D1', 
                    desc: 'Stärke, Vertrauen & Ausdauer • Bergseen & Geist des Langlaufsportes' 
                  },
                  { 
                    id: 'ice_white', 
                    name: 'Bianco Ghiaccio (#F4F9FA)', 
                    color: '#F4F9FA', 
                    desc: 'Unberührter Neveschnee • Elevata leggibilità ed eleganza alpina' 
                  }
                ].map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => {
                      onChangeContent({ 
                        themeColor: scheme.id as BrandColorScheme,
                        customColors: undefined 
                      });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      content.themeColor === scheme.id && !content.customColors
                        ? 'bg-slate-50 border-[#0D4D5E] ring-2 ring-[#0D4D5E]/15 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg border border-slate-300 shrink-0 shadow-2xs" style={{ backgroundColor: scheme.color }} />
                      <div>
                        <div className="font-bold text-slate-900 font-vietnam">{scheme.name}</div>
                        <div className="text-[10px] text-slate-500 leading-snug mt-0.5">{scheme.desc}</div>
                      </div>
                    </div>
                    {content.themeColor === scheme.id && !content.customColors && <Check className="w-4 h-4 text-[#0D4D5E]" />}
                  </div>
                ))}
              </div>

              {/* Custom Color Mixing Panel - Sbloccato per tutti i documenti e listini */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-800 font-bold font-vietnam text-[11px] uppercase tracking-wider">
                      Personalizza Singoli Colori (HEX)
                    </label>
                    <span className="text-[9px] font-extrabold bg-[#AAD0D1]/40 text-[#0D4D5E] px-2 py-0.5 rounded-full font-vietnam">
                      Sbloccato
                    </span>
                  </div>
                  {content.customColors && (
                    <button
                      type="button"
                      onClick={() => onChangeContent({ customColors: undefined })}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      Ripristina Palette Preset
                    </button>
                  )}
                </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Primario</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.primary || '#0D4D5E'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: e.target.value,
                              secondary: content.customColors?.secondary || '#417483',
                              accent: content.customColors?.accent || '#AAD0D1',
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.primary || '#0D4D5E'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Secondario</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.secondary || '#417483'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: content.customColors?.primary || '#0D4D5E',
                              secondary: e.target.value,
                              accent: content.customColors?.accent || '#AAD0D1',
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.secondary || '#417483'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">Accento Ghiaccio</label>
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                        <input
                          type="color"
                          value={content.customColors?.accent || '#AAD0D1'}
                          onChange={(e) => onChangeContent({
                            customColors: {
                              primary: content.customColors?.primary || '#0D4D5E',
                              secondary: content.customColors?.secondary || '#417483',
                              accent: e.target.value,
                              background: content.customColors?.background || '#F4F9FA',
                              cardBg: content.customColors?.cardBg || '#FFFFFF',
                              textColor: content.customColors?.textColor || '#0D4D5E'
                            }
                          })}
                          className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-[10px] font-mono font-semibold text-slate-700">
                          {content.customColors?.accent || '#AAD0D1'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* SECTION 3: ELEMENTI ORNAMENTALI (KURVE & LANGLÄUFER) */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0D4D5E]" />
                  Elementi Grafici Ornamentali (DNS Manual)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Aggiungi o riposiziona le doppie tracce di fondo ("Kurve") e la silhouette dello sciatore ("Langläufer").
                </p>
              </div>

              {/* 1. ORNAMENT: KURVE (DOPPIA TRACCIA) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 font-vietnam text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#AAD0D1]" />
                    Traccia Sci Curva ("Kurve")
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.ornamentCurves?.enabled ?? true}
                      onChange={(e) => onChangeContent({
                        ornamentCurves: {
                          enabled: e.target.checked,
                          position: content.ornamentCurves?.position || 'content_divider',
                          color: content.ornamentCurves?.color || '#AAD0D1',
                          opacity: content.ornamentCurves?.opacity || 80
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                  </label>
                </div>

                {content.ornamentCurves?.enabled && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Posizione sul Flyer</label>
                        <select
                          value={content.ornamentCurves?.position || 'content_divider'}
                          onChange={(e) => onChangeContent({
                            ornamentCurves: {
                              ...content.ornamentCurves!,
                              position: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="header_bottom">Sotto l'Header</option>
                          <option value="hero_overlay">Sotto la Foto Principale</option>
                          <option value="content_divider">Separatore Contenuti</option>
                          <option value="footer_top">Sopra il Footer</option>
                          <option value="background_diagonal">Diagonale di Sfondo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Colore Traccia</label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                          <input
                            type="color"
                            value={content.ornamentCurves?.color || '#AAD0D1'}
                            onChange={(e) => onChangeContent({
                              ornamentCurves: {
                                ...content.ornamentCurves!,
                                color: e.target.value
                              }
                            })}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-[10px] font-mono text-slate-700">
                            {content.ornamentCurves?.color || '#AAD0D1'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                        <span>Trasparenza / Opacità</span>
                        <span>{content.ornamentCurves?.opacity || 80}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={content.ornamentCurves?.opacity || 80}
                        onChange={(e) => onChangeContent({
                          ornamentCurves: {
                            ...content.ornamentCurves!,
                            opacity: parseInt(e.target.value)
                          }
                        })}
                        className="w-full accent-[#0D4D5E]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. ORNAMENT: LANGLÄUFER (SCIATORE) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 font-vietnam text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0D4D5E]" />
                    Silhouette Sciatore ("Langläufer")
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.ornamentSkier?.enabled ?? false}
                      onChange={(e) => onChangeContent({
                        ornamentSkier: {
                          enabled: e.target.checked,
                          position: content.ornamentSkier?.position || 'footer_corner',
                          color: content.ornamentSkier?.color || '#0D4D5E',
                          opacity: content.ornamentSkier?.opacity || 90,
                          size: content.ornamentSkier?.size || 'md'
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0D4D5E]" />
                  </label>
                </div>

                {content.ornamentSkier?.enabled && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Posizione</label>
                        <select
                          value={content.ornamentSkier?.position || 'footer_corner'}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              position: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="footer_corner">Angolo Footer</option>
                          <option value="header_right">In Alto a Destra</option>
                          <option value="hero_watermark">Filigrana al Centro</option>
                          <option value="price_badge">Accanto al Prezzo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Dimensione</label>
                        <select
                          value={content.ornamentSkier?.size || 'md'}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              size: e.target.value as any
                            }
                          })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold"
                        >
                          <option value="sm">Piccola (40px)</option>
                          <option value="md">Media (65px)</option>
                          <option value="lg">Grande (110px)</option>
                          <option value="xl">Extra Large (180px)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Colore Sciatore</label>
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                          <input
                            type="color"
                            value={content.ornamentSkier?.color || '#0D4D5E'}
                            onChange={(e) => onChangeContent({
                              ornamentSkier: {
                                ...content.ornamentSkier!,
                                color: e.target.value
                              }
                            })}
                            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-[10px] font-mono text-slate-700">
                            {content.ornamentSkier?.color || '#0D4D5E'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>Opacità</span>
                          <span>{content.ornamentSkier?.opacity || 90}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={content.ornamentSkier?.opacity || 90}
                          onChange={(e) => onChangeContent({
                            ornamentSkier: {
                              ...content.ornamentSkier!,
                              opacity: parseInt(e.target.value)
                            }
                          })}
                          className="w-full accent-[#0D4D5E]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: TIPOGRAFIA CORPORATE */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-slate-700 font-bold font-vietnam">Tipografia Corporate (Google Fonts)</label>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Font Titoli</label>
                  <select
                    value={content.headingFont}
                    onChange={(e) => onChangeContent({ headingFont: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold"
                  >
                    <option value="Be Vietnam Pro">Be Vietnam Pro (Ufficiale)</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Font Testo</label>
                  <select
                    value={content.bodyFont}
                    onChange={(e) => onChangeContent({ bodyFont: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold"
                  >
                    <option value="Roboto">Roboto (Ufficiale)</option>
                    <option value="Be Vietnam Pro">Be Vietnam Pro</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: ICONE SPORTIVE */}
        {activeTab === 'icons' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#0D4D5E]" />
                Libreria Icone Sportive Vettoriali
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seleziona fino a 6 icone sportive per evidenziare le discipline e i servizi del pacchetto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SPORTS_ICONS.map((icon) => {
                const isSelected = content.selectedSportsIcons.includes(icon.id);
                return (
                  <div
                    key={icon.id}
                    onClick={() => handleToggleSportsIcon(icon.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-[#0D4D5E] border-[#0D4D5E] text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0D4D5E]'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className={`font-bold text-[11px] font-vietnam leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{icon.name}</div>
                      <div className={`text-[9px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{icon.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 8: QR CODE DINAMICO */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-vietnam flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#0D4D5E]" />
                QR Code Dinamico
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Genera un QR code personalizzato per reindirizzare i clienti all'offerta online.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900">Attiva QR Code nel Flyer</label>
                <input
                  type="checkbox"
                  checked={content.qrCode.enabled}
                  onChange={(e) => onChangeContent({
                    qrCode: { ...content.qrCode, enabled: e.target.checked }
                  })}
                  className="w-4 h-4 accent-[#0D4D5E] rounded cursor-pointer"
                />
              </div>

              {content.qrCode.enabled && (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Link / URL dell'Offerta</label>
                    <input
                      type="text"
                      value={content.qrCode.url}
                      onChange={(e) => onChangeContent({
                        qrCode: { ...content.qrCode, url: e.target.value }
                      })}
                      placeholder="https://www.dolomitinordicski.com/offerta"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Etichetta Sotto QR Code</label>
                    <input
                      type="text"
                      value={content.qrCode.label}
                      onChange={(e) => onChangeContent({
                        qrCode: { ...content.qrCode, label: e.target.value }
                      })}
                      placeholder="Scansiona per prenotare"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
};

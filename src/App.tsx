import React, { useRef, useState } from 'react';
import {
  INITIAL_PDF_FIELDS,
  PdfFieldConfig,
  SAMPLE_ARABIC_VALUES,
} from './data/pdfSchema';
import {
  MarketStrikeOption,
  RenderOverlayOptions,
} from './utils/pdfTemplateRenderer';
import {
  exportFilledPdf,
  renderUploadedPdfPagesToImages,
} from './utils/pdfExporter';
import { PdfPageCanvas } from './components/PdfPageCanvas';
import { DeepAnalysisView } from './components/DeepAnalysisView';
import { FlutterCodeView } from './components/FlutterCodeView';
import {
  Download,
  Upload,
  Sliders,
  RotateCcw,
  FileCheck,
  ZoomIn,
  ZoomOut,
  Eye,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

type ActiveTab = 'workspace' | 'analysis' | 'flutter_code';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [fields, setFields] = useState<PdfFieldConfig[]>(INITIAL_PDF_FIELDS);
  const [values, setValues] = useState<Record<string, string>>(SAMPLE_ARABIC_VALUES);
  const [selectedPage, setSelectedPage] = useState<1 | 2 | 3>(1);
  const [viewAllPages, setViewAllPages] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>('p1_applicant_name');

  // Auto-sync shared fields across Pages 1, 2, 3
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [directEditOnPdf, setDirectEditOnPdf] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(0.92);

  // Uploaded original PDF state
  const [originalPdfBuffer, setOriginalPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [originalPdfName, setOriginalPdfName] = useState<string | null>(null);
  const [uploadedPageImages, setUploadedPageImages] = useState<HTMLImageElement[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Render overlay options (using Cairo font)
  const [overlayOptions, setOverlayOptions] = useState<RenderOverlayOptions>({
    inkColor: '#0f172a',
    fontWeight: '600',
    globalOffsetX: 0,
    globalOffsetY: 0,
    fontSizeScale: 1.0,
    marketStrike: 'strike_external',
    showFieldBoxes: true,
    activeFieldId: 'p1_applicant_name',
  });

  const handleUpdateValue = (fieldId: string, newValue: string) => {
    const targetField = fields.find((f) => f.id === fieldId);
    setValues((prev) => {
      const next = { ...prev, [fieldId]: newValue };

      // Synchronize common fields across Pages 1, 2, 3 when autoSync is active
      if (autoSync && targetField?.syncKey) {
        for (const f of fields) {
          if (f.id !== fieldId && f.syncKey === targetField.syncKey) {
            next[f.id] = newValue;
          }
        }
      }

      // Auto-calculate total equipment quantity on Page 3
      if (
        fieldId === 'p3_indoor_cam_qty' ||
        fieldId === 'p3_outdoor_cam_qty' ||
        fieldId === 'p3_recorder_qty'
      ) {
        const q1 = parseInt((next['p3_indoor_cam_qty'] || '').trim(), 10) || 0;
        const q2 = parseInt((next['p3_outdoor_cam_qty'] || '').trim(), 10) || 0;
        const q3 = parseInt((next['p3_recorder_qty'] || '').trim(), 10) || 0;
        const sum = q1 + q2 + q3;
        next['p3_total_qty'] = sum > 0 ? String(sum).padStart(2, '0') : '';
      }

      return next;
    });
  };

  const handleSelectField = (fieldId: string) => {
    setActiveFieldId(fieldId);
    const f = fields.find((item) => item.id === fieldId);
    if (f && f.page !== selectedPage) {
      setSelectedPage(f.page);
    }
    const el = fieldRefs.current[fieldId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleUpdateFieldCoord = (
    fieldId: string,
    key: 'xLeft' | 'xRight' | 'y' | 'fontSize',
    val: number
  ) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, [key]: val } : f))
    );
  };

  const handleUploadOriginalPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuf = await file.arrayBuffer();
      const pageImgs = await renderUploadedPdfPagesToImages(arrayBuf);
      setOriginalPdfBuffer(arrayBuf);
      setOriginalPdfName(file.name);
      setUploadedPageImages(pageImgs);
      setStatusBanner(
        `PDF original « ${file.name} » chargé (${pageImgs.length} pages intactes). Les textes arabes (police Cairo) seront écrits directement dessus.`
      );
      setTimeout(() => setStatusBanner(null), 6000);
    } catch (err) {
      console.error('Erreur lecture PDF:', err);
      setStatusBanner(
        'Impossible de lire ce fichier PDF. Le modèle officiel fidèle 1:1 reste actif.'
      );
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await exportFilledPdf({
        originalPdfBuffer,
        fields,
        values,
        options: overlayOptions,
        filename: originalPdfName
          ? `Rempli_Cairo_${originalPdfName}`
          : 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf',
      });
      setStatusBanner(
        'PDF généré avec succès avec la police Cairo ! Vérifiez vos téléchargements.'
      );
      setTimeout(() => setStatusBanner(null), 5000);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      setStatusBanner('Une erreur est survenue lors de la génération du PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetCoordinates = () => {
    setFields(INITIAL_PDF_FIELDS);
    setOverlayOptions((prev) => ({
      ...prev,
      globalOffsetX: 0,
      globalOffsetY: 0,
      fontSizeScale: 1.0,
    }));
  };

  const currentPageFields = fields.filter((f) => f.page === selectedPage);
  const activeFieldObj = fields.find((f) => f.id === activeFieldId) || null;
  const totalFilledCount = fields.filter((f) => (values[f.id] || '').trim().length > 0).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar following strict 3-Zone Contract */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('workspace');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          DRAG Oran · Studio PDF Cairo
        </a>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'workspace'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Formulaire & Aperçu PDF
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'analysis'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Analyse Approfondie (3 Pages)
          </button>
          <button
            onClick={() => setActiveTab('flutter_code')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'flutter_code'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Code Flutter & Web (Cairo)
          </button>
        </nav>

        {/* Zone 3: 2 Primary Actions (Upload Original PDF + Download Filled PDF) */}
        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUploadOriginalPdf}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Charger votre fichier PDF original sans le modifier"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {originalPdfName ? 'Changer le PDF original' : 'Charger PDF original (.pdf)'}
            </span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isExporting
                ? 'Écriture Cairo en cours...'
                : 'Télécharger le PDF rempli (Cairo)'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden items-center justify-around bg-white border-b border-slate-200 px-3 py-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'workspace' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Formulaire & PDF
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'analysis' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Analyse (3 Pages)
        </button>
        <button
          onClick={() => setActiveTab('flutter_code')}
          className={`px-3 py-1.5 rounded-md ${
            activeTab === 'flutter_code' ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-600'
          }`}
        >
          Code Flutter
        </button>
      </div>

      {/* Status notification bar if active */}
      {statusBanner && (
        <div className="bg-emerald-900 text-emerald-50 px-6 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-emerald-200 hover:text-white underline text-xs ml-4 whitespace-nowrap"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Content View */}
      {activeTab === 'analysis' ? (
        <DeepAnalysisView
          fields={fields}
          values={values}
          onJumpToField={(page, fieldId) => {
            setSelectedPage(page);
            setActiveFieldId(fieldId);
            setActiveTab('workspace');
          }}
        />
      ) : activeTab === 'flutter_code' ? (
        <FlutterCodeView
          fields={fields}
          values={values}
          options={overlayOptions}
        />
      ) : (
        /* WORKSPACE VIEW: Split Form Editor (Left) + Live 1:1 PDF Canvas (Right) */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-57px)]">
          {/* LEFT PANEL: Structured Arabic Form (Cairo Font) + Coordinate Calibration */}
          <section className="lg:col-span-5 xl:col-span-5 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-57px)]">
            {/* Form Top Controls */}
            <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/60">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="text-sm font-bold text-slate-900">
                    Saisie des Cases en Arabe (Police Cairo)
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono-tabular">
                    {totalFilledCount} / {fields.length} champs remplis ·{' '}
                    {originalPdfName
                      ? `PDF actif : ${originalPdfName}`
                      : 'Modèle officiel Wilaya d’Oran 1:1'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setValues(SAMPLE_ARABIC_VALUES)}
                    className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
                    title="Pré-remplir toutes les cases avec un exemple complet en arabe"
                  >
                    Exemple Oran
                  </button>
                  <button
                    onClick={() => setValues({})}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                    title="Vider tous les champs"
                  >
                    Vider
                  </button>
                  <button
                    onClick={() => setShowCalibration((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      showCalibration
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Calibrer</span>
                  </button>
                </div>
              </div>

              {/* Page Selector Tabs (Page 1, Page 2, Page 3) */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-lg">
                <button
                  onClick={() => setSelectedPage(1)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate ${
                    selectedPage === 1
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 1 · التعهد (4)
                </button>
                <button
                  onClick={() => setSelectedPage(2)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate ${
                    selectedPage === 2
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 2 · الاستمارة (22)
                </button>
                <button
                  onClick={() => setSelectedPage(3)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate ${
                    selectedPage === 3
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 3 · التجهيزات (23)
                </button>
              </div>

              {/* Auto-sync & Market Strike quick bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Synchroniser les champs communs (Pages 1, 2, 3)</span>
                </label>

                {selectedPage === 3 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Marché (1) :</span>
                    <select
                      value={overlayOptions.marketStrike}
                      onChange={(e) =>
                        setOverlayOptions((prev) => ({
                          ...prev,
                          marketStrike: e.target.value as MarketStrikeOption,
                        }))
                      }
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white font-cairo"
                    >
                      <option value="strike_external">
                        السوق الوطنية (شطب الخارجية)
                      </option>
                      <option value="strike_national">
                        السوق الخارجية (شطب الوطنية)
                      </option>
                      <option value="none">بدون شطب إضافي</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Collapsible Cairo Typography & Coordinate Calibration Drawer */}
              {showCalibration && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-900">
                      Paramètres Police Cairo & Alignement Millimétrique
                    </span>
                    <button
                      onClick={handleResetCoordinates}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Réinitialiser</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1">Couleur d’encre</label>
                      <select
                        value={overlayOptions.inkColor}
                        onChange={(e) =>
                          setOverlayOptions((p) => ({ ...p, inkColor: e.target.value }))
                        }
                        className="w-full border border-slate-200 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="#0f172a">Noir Officiel</option>
                        <option value="#1e3a8a">Bleu Administratif</option>
                        <option value="#1d4ed8">Bleu Stylo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Graisse Cairo</label>
                      <select
                        value={overlayOptions.fontWeight}
                        onChange={(e) =>
                          setOverlayOptions((p) => ({
                            ...p,
                            fontWeight: e.target.value as '400' | '600' | '700',
                          }))
                        }
                        className="w-full border border-slate-200 rounded-md px-2 py-1 bg-white"
                      >
                        <option value="400">Cairo Regular (400)</option>
                        <option value="600">Cairo SemiBold (600)</option>
                        <option value="700">Cairo Bold (700)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">
                        Échelle Taille ({Math.round(overlayOptions.fontSizeScale * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0.8"
                        max="1.25"
                        step="0.05"
                        value={overlayOptions.fontSizeScale}
                        onChange={(e) =>
                          setOverlayOptions((p) => ({
                            ...p,
                            fontSizeScale: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-500 mb-1 font-mono-tabular">
                        Décalage Horizontal Global X ({overlayOptions.globalOffsetX.toFixed(1)}%)
                      </label>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.1"
                        value={overlayOptions.globalOffsetX}
                        onChange={(e) =>
                          setOverlayOptions((p) => ({
                            ...p,
                            globalOffsetX: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-mono-tabular">
                        Décalage Vertical Global Y ({overlayOptions.globalOffsetY.toFixed(1)}%)
                      </label>
                      <input
                        type="range"
                        min="-3"
                        max="3"
                        step="0.1"
                        value={overlayOptions.globalOffsetY}
                        onChange={(e) =>
                          setOverlayOptions((p) => ({
                            ...p,
                            globalOffsetY: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Fine-tuning of the currently selected field */}
                  {activeFieldObj && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-emerald-800">
                          Champ sélectionné : {activeFieldObj.labelAr}
                        </span>
                        <span className="font-mono-tabular text-slate-400">
                          {activeFieldObj.id}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 font-mono-tabular">
                        <div>
                          <label className="block text-[11px] text-slate-500">X-Gauche %</label>
                          <input
                            type="number"
                            step="0.2"
                            value={activeFieldObj.xLeft}
                            onChange={(e) =>
                              handleUpdateFieldCoord(
                                activeFieldObj.id,
                                'xLeft',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">X-Droite %</label>
                          <input
                            type="number"
                            step="0.2"
                            value={activeFieldObj.xRight}
                            onChange={(e) =>
                              handleUpdateFieldCoord(
                                activeFieldObj.id,
                                'xRight',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">Y-Base %</label>
                          <input
                            type="number"
                            step="0.1"
                            value={activeFieldObj.y}
                            onChange={(e) =>
                              handleUpdateFieldCoord(
                                activeFieldObj.id,
                                'y',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">Taille (pt)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={activeFieldObj.fontSize}
                            onChange={(e) =>
                              handleUpdateFieldCoord(
                                activeFieldObj.id,
                                'fontSize',
                                parseFloat(e.target.value) || 10
                              )
                            }
                            className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Form Fields for Current Page */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentPageFields.map((field, index) => {
                const isSelected = activeFieldId === field.id;
                const val = values[field.id] || '';
                const prevSection = index > 0 ? currentPageFields[index - 1].section : null;
                const showSectionHeader = field.section !== prevSection;

                return (
                  <React.Fragment key={field.id}>
                    {showSectionHeader && (
                      <div className="pt-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                        <h2
                          dir="rtl"
                          className="font-cairo font-bold text-xs text-emerald-800"
                        >
                          {field.section}
                        </h2>
                        <span className="text-[11px] text-slate-400">
                          Police Cairo · {field.dir.toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div
                      ref={(el) => {
                        fieldRefs.current[field.id] = el;
                      }}
                      onClick={() => setActiveFieldId(field.id)}
                      className={`p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-xs font-medium text-slate-600">
                          {field.labelFr}
                        </span>
                        <label
                          dir="rtl"
                          className="font-cairo font-bold text-sm text-slate-900"
                        >
                          {field.labelAr}
                        </label>
                      </div>

                      {field.multiline ? (
                        <textarea
                          dir={field.dir}
                          rows={2}
                          value={val}
                          onFocus={() => setActiveFieldId(field.id)}
                          onChange={(e) => handleUpdateValue(field.id, e.target.value)}
                          placeholder={field.placeholderAr}
                          className="w-full px-3 py-1.5 text-sm font-cairo font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      ) : (
                        <input
                          type="text"
                          dir={field.dir}
                          value={val}
                          onFocus={() => setActiveFieldId(field.id)}
                          onChange={(e) => handleUpdateValue(field.id, e.target.value)}
                          placeholder={field.placeholderAr}
                          className="w-full px-3 py-1.5 text-sm font-cairo font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      )}

                      {field.footnoteAr && (
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{field.footnoteFr}</span>
                          <span dir="rtl" className="font-cairo text-slate-600">
                            {field.footnoteAr}
                          </span>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* RIGHT PANEL: Live Interactive PDF Viewer & Direct On-Page Cairo Editor */}
          <section className="lg:col-span-7 xl:col-span-7 bg-slate-200/80 flex flex-col h-[calc(100vh-57px)]">
            {/* PDF Preview Toolbar */}
            <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              {/* Page Navigation */}
              <div className="flex items-center gap-1.5">
                {([1, 2, 3] as const).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => {
                      setViewAllPages(false);
                      setSelectedPage(pg);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      !viewAllPages && selectedPage === pg
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Page {pg} / 3
                  </button>
                ))}
                <button
                  onClick={() => setViewAllPages((v) => !v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    viewAllPages
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Vue 3 Pages
                </button>
              </div>

              {/* Interactive Overlay & Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDirectEditOnPdf((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    directEditOnPdf
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  title="Cliquer directement sur les pointillés du PDF pour écrire en arabe"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Écriture directe sur PDF</span>
                </button>

                <button
                  onClick={() =>
                    setOverlayOptions((p) => ({
                      ...p,
                      showFieldBoxes: !p.showFieldBoxes,
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    overlayOptions.showFieldBoxes
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                  title="Afficher ou masquer les cadres de repérage des 49 zones"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Cadres ({fields.length})</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 font-mono-tabular text-xs">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.65, +(z - 0.1).toFixed(2)))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                    title="Zoom arrière"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 text-slate-700">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(1.35, +(z + 0.1).toFixed(2)))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                    title="Zoom avant"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable PDF Canvas Container */}
            <div className="flex-1 overflow-auto p-6 space-y-8">
              {viewAllPages ? (
                ([1, 2, 3] as const).map((pg) => (
                  <div key={pg} className="space-y-2">
                    <div className="max-w-[595px] mx-auto flex items-center justify-between text-xs text-slate-600 px-1">
                      <span className="font-semibold">
                        Feuillet Officiel {pg} / 3 — Wilaya d’Oran
                      </span>
                      <span className="font-cairo font-semibold text-emerald-800">
                        خط كايرو (Cairo Font RTL)
                      </span>
                    </div>
                    <PdfPageCanvas
                      pageNumber={pg}
                      fields={fields}
                      values={values}
                      options={overlayOptions}
                      uploadedPageImage={uploadedPageImages[pg - 1] || null}
                      activeFieldId={activeFieldId}
                      onSelectField={handleSelectField}
                      onUpdateValue={handleUpdateValue}
                      zoom={zoom}
                      directEditOnPdf={directEditOnPdf}
                    />
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  <div className="max-w-[595px] mx-auto flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Page {selectedPage} sur 3 — Cliquez sur n’importe quelle ligne pointillée pour écrire directement dessus
                      </span>
                    </span>
                    <span className="font-cairo font-bold text-emerald-800">
                      خط Cairo
                    </span>
                  </div>
                  <PdfPageCanvas
                    pageNumber={selectedPage}
                    fields={fields}
                    values={values}
                    options={overlayOptions}
                    uploadedPageImage={uploadedPageImages[selectedPage - 1] || null}
                    activeFieldId={activeFieldId}
                    onSelectField={handleSelectField}
                    onUpdateValue={handleUpdateValue}
                    zoom={zoom}
                    directEditOnPdf={directEditOnPdf}
                  />
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

import React, { useRef, useState } from 'react';
import {
  CatalogCategoryKey,
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
import {
  ChoiceCatalogItemEntity,
  DossierSubmissionEntity,
  objectBoxStore,
} from './services/objectBoxStore';
import { AppLocale, TRANSLATIONS } from './i18n/translations';
import { PdfPageCanvas } from './components/PdfPageCanvas';
import { DeepAnalysisView } from './components/DeepAnalysisView';
import { FlutterCodeView } from './components/FlutterCodeView';
import { ObjectBoxHistoryView } from './components/ObjectBoxHistoryView';
import { CrudCatalogView } from './components/CrudCatalogView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { AccountDeletionView } from './components/AccountDeletionView';
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
  Database,
  Plus,
  Settings2,
} from 'lucide-react';

type ActiveTab =
  | 'workspace'
  | 'history'
  | 'catalog_crud'
  | 'analysis'
  | 'flutter_code'
  | 'privacy'
  | 'delete_account';

export default function App() {
  const [locale, setLocale] = useState<AppLocale>('fr');
  const t = TRANSLATIONS[locale];

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('page') === 'delete-account' ||
        params.get('page') === 'delete_account' ||
        window.location.hash === '#delete-account' ||
        window.location.pathname.includes('delete-account')
      ) {
        return 'delete_account';
      }
      if (
        params.get('page') === 'privacy' ||
        window.location.hash === '#privacy' ||
        window.location.pathname.includes('privacy')
      ) {
        return 'privacy';
      }
    }
    return 'workspace';
  });
  const [mobileWorkspacePane, setMobileWorkspacePane] = useState<'form' | 'pdf'>('form');
  const [fields, setFields] = useState<PdfFieldConfig[]>(INITIAL_PDF_FIELDS);
  const [values, setValues] = useState<Record<string, string>>(SAMPLE_ARABIC_VALUES);
  const [selectedPage, setSelectedPage] = useState<1 | 2 | 3>(1);
  const [viewAllPages, setViewAllPages] = useState<boolean>(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  // ObjectBox state
  const [activeDossierId, setActiveDossierId] = useState<number | null>(1);
  const [catalogItems, setCatalogItems] = useState<ChoiceCatalogItemEntity[]>(() =>
    objectBoxStore.getAllCatalogItems()
  );
  const [focusedCatalogCategory, setFocusedCatalogCategory] =
    useState<CatalogCategoryKey>('installer_company');
  const [historyRefreshCount, setHistoryRefreshCount] = useState<number>(0);

  // Auto-sync shared fields across Pages 1, 2, 3
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [directEditOnPdf, setDirectEditOnPdf] = useState<boolean>(false);
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
    showFieldBoxes: false,
    activeFieldId: null,
  });

  const refreshCatalogFromObjectBox = () => {
    setCatalogItems(objectBoxStore.getAllCatalogItems());
  };

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

  const handleSaveCurrentDossierToObjectBox = (asNew = false) => {
    const saved = objectBoxStore.putDossier({
      id: asNew ? undefined : activeDossierId || undefined,
      values,
      marketStrike: overlayOptions.marketStrike,
    });
    setActiveDossierId(saved.id);
    setHistoryRefreshCount((c) => c + 1);
    setStatusBanner(`${t.savedToObjectBoxToast} (ID #${saved.id})`);
    setTimeout(() => setStatusBanner(null), 4500);
  };

  const handleLoadDossierFromObjectBox = (dossier: DossierSubmissionEntity) => {
    setValues({ ...dossier.values });
    setActiveDossierId(dossier.id);
    setOverlayOptions((prev) => ({
      ...prev,
      marketStrike: dossier.marketStrike,
    }));
    setActiveTab('workspace');
    setStatusBanner(
      `Dossier ObjectBox #${dossier.id} (« ${dossier.applicantName} ») chargé sur les 3 pages du PDF.`
    );
    setTimeout(() => setStatusBanner(null), 4500);
  };

  const handleQuickSaveFieldToCatalog = (field: PdfFieldConfig, currentVal: string) => {
    if (!field.catalogCategory || !currentVal.trim()) return;
    objectBoxStore.putChoice({
      categoryKey: field.catalogCategory,
      valueAr: currentVal.trim(),
      noteFr: `${field.labelFr} (Ajouté depuis le formulaire)`,
    });
    refreshCatalogFromObjectBox();
    setStatusBanner(
      `Valeur « ${currentVal.trim()} » ajoutée dans la liste de choix ObjectBox (${field.catalogCategory}).`
    );
    setTimeout(() => setStatusBanner(null), 4500);
  };

  const handleApplyChoiceFromCrudModal = (
    categoryKey: CatalogCategoryKey,
    valueAr: string
  ) => {
    const matchingFields = fields.filter((f) => f.catalogCategory === categoryKey);
    if (matchingFields.length > 0) {
      handleUpdateValue(matchingFields[0].id, valueAr);
      setSelectedPage(matchingFields[0].page);
      setActiveFieldId(matchingFields[0].id);
      setActiveTab('workspace');
    }
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
      // Automatically persist in ObjectBox history on PDF export
      const saved = objectBoxStore.putDossier({
        id: activeDossierId || undefined,
        values,
        marketStrike: overlayOptions.marketStrike,
      });
      setActiveDossierId(saved.id);
      setHistoryRefreshCount((c) => c + 1);

      await exportFilledPdf({
        originalPdfBuffer,
        uploadedPageImages,
        fields,
        values,
        options: overlayOptions,
        filename: originalPdfName
          ? `Rempli_Cairo_${originalPdfName}`
          : 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf',
      });
      setStatusBanner(
        `PDF exporté via jsPDF avec les positions exactes de pdfSchema.ts et sauvegardé dans l'historique ObjectBox (#${saved.id}) !`
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
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('workspace');
          }}
          className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: 5 Clean single-line navigation links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'workspace'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navWorkspace}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'history'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navHistory}
          </button>
          <button
            onClick={() => setActiveTab('catalog_crud')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'catalog_crud'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navCatalogCrud}
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'analysis'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navAnalysis}
          </button>
          <button
            onClick={() => setActiveTab('flutter_code')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'flutter_code'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navFlutterCode}
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'privacy'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            {t.navPrivacyPolicy}
          </button>
          <button
            onClick={() => setActiveTab('delete_account')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'delete_account'
                ? 'border-rose-700 text-rose-800 font-semibold'
                : 'border-transparent text-rose-700 hover:text-rose-900'
            }`}
          >
            {t.navDeleteAccount}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* FR / EN Language Switcher */}
          <button
            onClick={() => setLocale((l) => (l === 'fr' ? 'en' : 'fr'))}
            className="px-2.5 py-1.5 text-xs font-mono-tabular font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors uppercase whitespace-nowrap"
            title="Switch Language FR / EN"
          >
            {locale}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUploadOriginalPdf}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {originalPdfName ? t.changeOriginalPdf : t.uploadOriginalPdf}
            </span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            aria-label="Exporter en PDF"
            title="Exporter en PDF (jsPDF + pdfSchema.ts)"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? t.exportingPdf : t.downloadFilledPdf}</span>
          </button>
        </div>
      </header>

      {/* Responsive Tablet / Mobile Navigation Bar */}
      <div className="flex xl:hidden items-center gap-1 overflow-x-auto bg-white border-b border-slate-200 px-3 py-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'workspace'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navWorkspace}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navHistory}
        </button>
        <button
          onClick={() => setActiveTab('catalog_crud')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'catalog_crud'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navCatalogCrud}
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'analysis'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navAnalysis}
        </button>
        <button
          onClick={() => setActiveTab('flutter_code')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'flutter_code'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navFlutterCode}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-emerald-50 text-emerald-800 font-semibold'
              : 'text-slate-600'
          }`}
        >
          {t.navPrivacyPolicy}
        </button>
        <button
          onClick={() => setActiveTab('delete_account')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'delete_account'
              ? 'bg-rose-50 text-rose-800 font-semibold'
              : 'text-rose-700'
          }`}
        >
          {t.navDeleteAccount}
        </button>
      </div>

      {/* Status notification bar */}
      {statusBanner && (
        <div className="bg-emerald-900 text-emerald-50 px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-emerald-200 hover:text-white underline text-xs ml-4 whitespace-nowrap"
          >
            OK
          </button>
        </div>
      )}

      {/* Main Content Router */}
      {activeTab === 'history' ? (
        <ObjectBoxHistoryView
          t={t}
          activeDossierId={activeDossierId}
          onLoadDossier={handleLoadDossierFromObjectBox}
          onSaveCurrentToObjectBox={() => handleSaveCurrentDossierToObjectBox(true)}
          refreshTrigger={historyRefreshCount}
        />
      ) : activeTab === 'catalog_crud' ? (
        <CrudCatalogView
          t={t}
          initialCategory={focusedCatalogCategory}
          catalogItems={catalogItems}
          onRefreshCatalog={refreshCatalogFromObjectBox}
          onApplyChoiceToForm={handleApplyChoiceFromCrudModal}
        />
      ) : activeTab === 'analysis' ? (
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
          catalogItems={catalogItems}
        />
      ) : activeTab === 'privacy' ? (
        <PrivacyPolicyView />
      ) : activeTab === 'delete_account' ? (
        <AccountDeletionView
          onPurgeCompleted={() => {
            setValues({});
            setActiveDossierId(null);
            setCatalogItems(objectBoxStore.getAllCatalogItems());
            setHistoryRefreshCount((c) => c + 1);
            setStatusBanner(
              'Suppression définitive exécutée : Le compte utilisateur et tous les dossiers ObjectBox ont été effacés.'
            );
          }}
        />
      ) : (
        /* WORKSPACE VIEW: Responsive Split Form Editor + Live 1:1 PDF Canvas */
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-[calc(100vh-57px)]">
          {/* Mobile Form / PDF Switcher */}
          <div className="flex lg:hidden items-center gap-2 p-2 bg-slate-100 border-b border-slate-200">
            <button
              onClick={() => setMobileWorkspacePane('form')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mobileWorkspacePane === 'form'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              1. Formulaire & Listes ObjectBox
            </button>
            <button
              onClick={() => setMobileWorkspacePane('pdf')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mobileWorkspacePane === 'pdf'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              2. Aperçu Direct sur PDF (Cairo)
            </button>
          </div>

          {/* LEFT PANEL: Structured Arabic Form + ObjectBox Choice Lists + Coordinate Calibration */}
          <section
            className={`${
              mobileWorkspacePane === 'form' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-5 xl:col-span-5 bg-white border-r border-slate-200 flex-col lg:h-[calc(100vh-57px)]`}
          >
            {/* Form Top Controls */}
            <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-sm font-bold text-slate-900">
                    {t.formPanelTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono-tabular">
                    {totalFilledCount} / {fields.length} {t.fieldsFilledLabel} ·{' '}
                    {originalPdfName
                      ? `${t.activePdfLabel} ${originalPdfName}`
                      : t.officialModelActive}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleSaveCurrentDossierToObjectBox(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap"
                    title="Enregistrer ce dossier dans l'historique ObjectBox"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>+ ObjectBox</span>
                  </button>
                  <button
                    onClick={() => setValues(SAMPLE_ARABIC_VALUES)}
                    className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
                  >
                    {t.btnSampleOran}
                  </button>
                  <button
                    onClick={() => {
                      setValues({});
                      setActiveDossierId(null);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                  >
                    {t.btnClear}
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
                    <span>{t.btnCalibrate}</span>
                  </button>
                </div>
              </div>

              {/* Quick 69-Wilaya Selector + Add New Wilaya CRUD */}
              <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-emerald-950 whitespace-nowrap">
                  الولاية (Pages 1, 2, 3) :
                </span>
                <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                  <select
                    value={values['p1_wilaya'] || 'ولاية وهران'}
                    onChange={(e) => handleUpdateValue('p1_wilaya', e.target.value)}
                    className="flex-1 min-w-0 border border-emerald-300 bg-white text-slate-900 rounded-md px-2.5 py-1.5 font-cairo font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {catalogItems
                      .filter((c) => c.categoryKey === 'wilaya')
                      .map((w) => (
                        <option key={w.id} value={w.valueAr}>
                          {w.valueAr} — {w.noteFr}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFocusedCatalogCategory('wilaya');
                      setActiveTab('catalog_crud');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                    title="Ajouter une nouvelle Wilaya ou gérer les 69 Wilayas dans ObjectBox"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Wilaya ({catalogItems.filter((c) => c.categoryKey === 'wilaya').length})</span>
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
                  Page 1 · التعهد (5)
                </button>
                <button
                  onClick={() => setSelectedPage(2)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate ${
                    selectedPage === 2
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 2 · الاستمارة (23)
                </button>
                <button
                  onClick={() => setSelectedPage(3)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap truncate ${
                    selectedPage === 3
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Page 3 · التجهيزات (24)
                </button>
              </div>

              {/* Auto-sync & Market Strike quick bar (always visible from the form) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>{t.autoSyncLabel}</span>
                </label>

                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-600">{t.marketLabel}</span>
                  <select
                    value={overlayOptions.marketStrike}
                    onChange={(e) =>
                      setOverlayOptions((prev) => ({
                        ...prev,
                        marketStrike: e.target.value as MarketStrikeOption,
                      }))
                    }
                    className="text-xs border border-emerald-300 rounded-md px-2 py-1 bg-white font-cairo font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="strike_external">
                      شطب « الخارجية » (الإبقاء على الوطنية)
                    </option>
                    <option value="strike_national">
                      شطب « الوطنية » (الإبقاء على الخارجية)
                    </option>
                    <option value="strike_both">
                      شطب الاثنين (الوطنية والخارجية)
                    </option>
                    <option value="none">{t.marketNone}</option>
                  </select>
                </div>
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
              {/* Dedicated Market Strikethrough Card on Page 3 ("اشطب العبارة المستغنى عنها") */}
              {selectedPage === 3 && (
                <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/40 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-emerald-950">
                      Choix du Marché — Mention à barrer sur le PDF (Renvoi 1)
                    </span>
                    <span dir="rtl" className="font-cairo font-bold text-sm text-emerald-950">
                      1 – اشطب العبارة المستغنى عنها (الوطنية / الخارجية)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setOverlayOptions((p) => ({
                          ...p,
                          marketStrike: 'strike_external',
                        }))
                      }
                      className={`py-2 px-2 rounded-md border font-cairo font-semibold transition-colors text-center ${
                        overlayOptions.marketStrike === 'strike_external'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>السوق الوطنية</div>
                      <div className="text-[11px] opacity-90 line-through">– الخارجية (1)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOverlayOptions((p) => ({
                          ...p,
                          marketStrike: 'strike_national',
                        }))
                      }
                      className={`py-2 px-2 rounded-md border font-cairo font-semibold transition-colors text-center ${
                        overlayOptions.marketStrike === 'strike_national'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>السوق الخارجية</div>
                      <div className="text-[11px] opacity-90 line-through">– الوطنية.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOverlayOptions((p) => ({
                          ...p,
                          marketStrike: 'strike_both',
                        }))
                      }
                      className={`py-2 px-2 rounded-md border font-cairo font-semibold transition-colors text-center ${
                        overlayOptions.marketStrike === 'strike_both'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>شطب الاثنين</div>
                      <div className="text-[11px] opacity-90 line-through">
                        الوطنية + الخارجية
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOverlayOptions((p) => ({
                          ...p,
                          marketStrike: 'none',
                        }))
                      }
                      className={`py-2 px-2 rounded-md border font-cairo font-semibold transition-colors text-center ${
                        overlayOptions.marketStrike === 'none'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>بدون شطب</div>
                      <div className="text-[11px] opacity-80">Aucune rature</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Dedicated Inline Editor for Page 3 Reference Line: رقم / 142 م ت ش ع / م ت ع / م ت ا م م / 2020 */}
              {selectedPage === 3 && (
                <div className="p-3 rounded-lg border border-emerald-300 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 flex-nowrap">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      N° & Année d’enregistrement (Même ligne sur le PDF)
                    </span>
                    <span
                      dir="rtl"
                      className="font-cairo font-bold text-sm text-emerald-950 whitespace-nowrap shrink-0"
                    >
                      المرجع الإداري (رقم / 142 ... / 2020)
                    </span>
                  </div>

                  <div
                    dir="rtl"
                    className="flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-md bg-slate-50 border border-slate-200 font-cairo font-bold text-xs sm:text-sm text-slate-900 overflow-x-auto whitespace-nowrap"
                  >
                    <span className="shrink-0">رقم /</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={values['p3_ref_number'] ?? ''}
                      onFocus={() => setActiveFieldId('p3_ref_number')}
                      onChange={(e) => handleUpdateValue('p3_ref_number', e.target.value)}
                      placeholder="142"
                      aria-label="Numéro d'enregistrement (ex: 142)"
                      className="w-16 px-2 py-1 text-center font-cairo font-bold text-sm text-emerald-900 bg-white border border-emerald-400 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600 shrink-0"
                    />
                    <span className="shrink-0">م ت ش ع / م ت ع / م ت ا م م /</span>
                    <input
                      type="text"
                      dir="ltr"
                      value={values['p3_ref_year'] !== undefined ? values['p3_ref_year'] : '2020'}
                      onFocus={() => setActiveFieldId('p3_ref_year')}
                      onChange={(e) => handleUpdateValue('p3_ref_year', e.target.value)}
                      placeholder="2020"
                      aria-label="Année d'enregistrement (ex: 2020)"
                      className="w-20 px-2 py-1 text-center font-cairo font-bold text-sm text-emerald-900 bg-white border border-emerald-400 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600 shrink-0"
                    />
                  </div>
                </div>
              )}

              {currentPageFields.map((field, index) => {
                const isSelected = activeFieldId === field.id;
                const val =
                  values[field.id] !== undefined
                    ? values[field.id]
                    : field.id === 'p3_ref_year'
                    ? '2020'
                    : '';
                const prevSection = index > 0 ? currentPageFields[index - 1].section : null;
                const showSectionHeader = field.section !== prevSection;

                const fieldChoices = field.catalogCategory
                  ? catalogItems.filter((c) => c.categoryKey === field.catalogCategory)
                  : [];

                const isValueAlreadyInCatalog =
                  field.catalogCategory &&
                  val.trim().length > 0 &&
                  fieldChoices.some((c) => c.valueAr.trim() === val.trim());

                return (
                  <React.Fragment key={field.id}>
                    {showSectionHeader && (
                      <div className="pt-2 pb-1 border-b border-slate-200 flex items-center justify-between gap-2 flex-nowrap">
                        <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                          Police Cairo · {field.dir.toUpperCase()}
                        </span>
                        <h2
                          dir="rtl"
                          className="font-cairo font-bold text-xs text-emerald-800 truncate"
                        >
                          {field.section}
                        </h2>
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
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-nowrap">
                        <span className="text-xs font-medium text-slate-600 truncate">
                          {field.labelFr}
                        </span>
                        <label
                          dir="rtl"
                          className="font-cairo font-bold text-sm text-slate-900 whitespace-nowrap shrink-0"
                        >
                          {field.labelAr}
                        </label>
                      </div>

                      {/* ObjectBox Choice Selector + CRUD Manager Button if field has catalogCategory */}
                      {field.catalogCategory && (
                        <div className="mb-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={isValueAlreadyInCatalog ? val.trim() : ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleUpdateValue(field.id, e.target.value);
                                }
                              }}
                              className="flex-1 min-w-0 text-xs border border-emerald-200 bg-emerald-50/50 text-slate-800 rounded-md px-2.5 py-1.5 font-cairo font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            >
                              <option value="">
                                ▾ {t.chooseFromObjectBox} ({fieldChoices.length})
                              </option>
                              {fieldChoices.map((choice) => (
                                <option key={choice.id} value={choice.valueAr}>
                                  {choice.valueAr.replace(/\n/g, ' — ')} ({choice.noteFr})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFocusedCatalogCategory(field.catalogCategory!);
                                setActiveTab('catalog_crud');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-md transition-colors whitespace-nowrap shrink-0"
                              title={t.manageCrudList}
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              <span>CRUD ({fieldChoices.length})</span>
                            </button>
                          </div>

                          {/* 1-Click button to save a newly typed value directly into ObjectBox choice list */}
                          {val.trim().length > 0 && !isValueAlreadyInCatalog && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickSaveFieldToCatalog(field, val);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{t.saveCurrentValueToList}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {field.multiline ? (
                        <textarea
                          dir={field.dir}
                          rows={2}
                          value={val}
                          onFocus={() => setActiveFieldId(field.id)}
                          onChange={(e) => handleUpdateValue(field.id, e.target.value)}
                          placeholder={field.placeholderAr}
                          className="w-full px-3 py-1.5 text-sm font-cairo font-semibold text-center text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      ) : (
                        <input
                          type="text"
                          dir={field.dir}
                          value={val}
                          onFocus={() => setActiveFieldId(field.id)}
                          onChange={(e) => handleUpdateValue(field.id, e.target.value)}
                          placeholder={field.placeholderAr}
                          className="w-full px-3 py-1.5 text-sm font-cairo font-semibold text-center text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
          <section
            className={`${
              mobileWorkspacePane === 'pdf' ? 'flex' : 'hidden lg:flex'
            } lg:col-span-7 xl:col-span-7 bg-slate-200/80 flex-col lg:h-[calc(100vh-57px)]`}
          >
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
                  {t.all3PagesView}
                </button>
              </div>

              {/* Interactive Overlay & Zoom Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setDirectEditOnPdf((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    directEditOnPdf
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t.directEditPdf}</span>
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
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {t.showBoxes} ({fields.length})
                  </span>
                </button>

                <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5 font-mono-tabular text-xs">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.55, +(z - 0.1).toFixed(2)))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1.5 text-slate-700">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom((z) => Math.min(1.35, +(z + 0.1).toFixed(2)))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable PDF Canvas Container */}
            <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-8">
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
                      onChangeMarketStrike={(nextStrike) =>
                        setOverlayOptions((p) => ({ ...p, marketStrike: nextStrike }))
                      }
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
                        Page {selectedPage} / 3 — Cliquez sur n’importe quelle case pour écrire en arabe (Cairo)
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
                    onChangeMarketStrike={(nextStrike) =>
                      setOverlayOptions((p) => ({ ...p, marketStrike: nextStrike }))
                    }
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

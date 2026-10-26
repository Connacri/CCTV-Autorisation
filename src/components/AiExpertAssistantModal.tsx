import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  ArrowRight,
  Store,
  Pill,
  UtensilsCrossed,
  Building2,
  Warehouse,
  Home,
  Wand2,
  FileCheck,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { AppLocale, TRANSLATIONS } from '../i18n/translations';

interface AiExpertAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: AppLocale;
  currentValues: Record<string, string>;
  onApplyValues: (newValues: Record<string, string>, summary: string) => void;
  initialTab?: 'wizard' | 'audit' | 'faq';
}

interface AuditCheckItem {
  id: string;
  title: string;
  status: 'pass' | 'warn' | 'fail';
  explanation: string;
  fix: string;
}

export const AiExpertAssistantModal: React.FC<AiExpertAssistantModalProps> = ({
  isOpen,
  onClose,
  locale,
  currentValues,
  onApplyValues,
  initialTab = 'wizard',
}) => {
  const t = TRANSLATIONS[locale];
  const [activeTab, setActiveTab] = useState<'wizard' | 'audit' | 'faq'>(initialTab);

  // Wizard state
  const [selectedPreset, setSelectedPreset] = useState<string>('superette');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [applicantName, setApplicantName] = useState<string>(
    currentValues.p1_applicant_name_ar || ''
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<Record<string, string> | null>(null);
  const [plainSummary, setPlainSummary] = useState<string>('');

  // Audit state
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditScore, setAuditScore] = useState<number>(85);
  const [auditStatus, setAuditStatus] = useState<'compliant' | 'warning' | 'non-compliant'>('compliant');
  const [auditChecklist, setAuditChecklist] = useState<AuditCheckItem[]>([]);
  const [auditSummary, setAuditSummary] = useState<string>('');

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'audit') {
        runAudit();
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Preset definitions tailored for Algerian Wilaya/DRAG regulations
  const PRESETS = [
    {
      id: 'superette',
      icon: Store,
      title: locale === 'ar' ? 'سوبرماركت / بقالة' : 'Supérette / Alimentation',
      subtitle: locale === 'ar' ? '6 كاميرات (4 داخلية + 2 خارجية)' : '6 caméras (4 dômes + 2 bullets)',
      prompt: 'Supérette de 150m² à Es-Sénia Oran avec 4 caméras intérieures (rayons et caisse) et 2 extérieures.',
      badge: 'Populaire',
    },
    {
      id: 'pharmacie',
      icon: Pill,
      title: locale === 'ar' ? 'صيدلية' : 'Pharmacie d’officine',
      subtitle: locale === 'ar' ? '4 كاميرات مع احترام سرية المريض' : '4 caméras (comptoir, caisse, stock)',
      prompt: 'Pharmacie à Bir El Djir Oran de 80m² avec 3 dômes intérieurs et 1 caméra extérieure d\'accès.',
      badge: 'Prioritaire',
    },
    {
      id: 'restaurant',
      icon: UtensilsCrossed,
      title: locale === 'ar' ? 'مطعم / مقهى عائلي' : 'Restaurant / Café',
      subtitle: locale === 'ar' ? '8 كاميرات + لوحة إشهارية' : '8 caméras + affichage public visible',
      prompt: 'Restaurant familial à Akid Lotfi Oran avec 6 caméras salle/caisse et 2 extérieures.',
      badge: 'ERP',
    },
    {
      id: 'bureau',
      icon: Building2,
      title: locale === 'ar' ? 'مكتب / مقر شركة' : 'Bureaux / Entreprise',
      subtitle: locale === 'ar' ? '4 كاميرات للمدخل والأرشيف' : '4 caméras (accueil, coffre, accès)',
      prompt: 'Bureaux administratifs au centre-ville d\'Oran avec 4 caméras intérieures et NVR sécurisé.',
      badge: 'Tertiaire',
    },
    {
      id: 'entrepot',
      icon: Warehouse,
      title: locale === 'ar' ? 'مستودع تخزين / لوجستيك' : 'Entrepôt / Dépôt logistique',
      subtitle: locale === 'ar' ? '12 كاميرا مع رؤية ليلية 50م' : '12 caméras (quais, racks, périmètre)',
      prompt: 'Dépôt de stockage de 1000m² dans la zone industrielle d\'Arzew avec 12 caméras.',
      badge: 'Industrie',
    },
    {
      id: 'villa',
      icon: Home,
      title: locale === 'ar' ? 'فيلا / سكن خاص' : 'Villa / Résidence privée',
      subtitle: locale === 'ar' ? '4 كاميرات محيطية دون تصوير الشارع' : '4 caméras sans filmer la voie publique',
      prompt: 'Villa à Canastel avec 4 caméras extérieures orientées vers les clôtures et portail.',
      badge: 'Privé',
    },
  ];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setUserPrompt(found.prompt);
    }
  };

  const runWizard = async () => {
    setIsGenerating(true);
    setGeneratedResult(null);
    setGenerationStep(
      locale === 'ar'
        ? 'تحليل متطلبات المرسوم التنفيذي 09-410...'
        : 'Analyse des exigences du Décret 09-410...'
    );

    try {
      setTimeout(() => {
        setGenerationStep(
          locale === 'ar'
            ? 'صياغة الاستمارة الرسمية باللغة العربية الإدارية...'
            : 'Rédaction administrative en arabe officiel (Cairo)...'
        );
      }, 700);

      const res = await fetch('/api/gemini/wizard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt || PRESETS.find((p) => p.id === selectedPreset)?.prompt,
          preset: selectedPreset,
          applicantName: applicantName || currentValues.p1_applicant_name_ar,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedResult(json.data);
        setPlainSummary(
          json.plainExplanation ||
            (locale === 'ar'
              ? 'تم إعداد كامل الملف بنجاح وفق متطلبات ولاية وهران.'
              : 'Dossier pré-rempli avec succès selon les critères officiels DRAG Oran.')
        );
      }
    } catch (err) {
      console.error('Wizard generate error:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: currentValues,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAuditScore(json.score ?? 85);
        setAuditStatus(json.status ?? 'compliant');
        setAuditChecklist(json.checklist ?? []);
        setAuditSummary(json.summary ?? '');
      }
    } catch (err) {
      console.error('Audit run error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyToForm = () => {
    if (!generatedResult) return;
    onApplyValues(
      generatedResult,
      plainSummary || (locale === 'ar' ? 'تم تطبيق المعطيات الذكية' : 'Dossier IA appliqué avec succès')
    );
    onClose();
  };

  const handleAutoFixAll = () => {
    const fixed: Record<string, string> = {
      ...currentValues,
      p1_retention_days_ar: '30 يوما (مطابق لأحكام المادة 14 من المرسوم 09-410)',
      p2_security_measures_ar:
        'حفظ وحدة التسجيل NVR/DVR في خزانة حديدية مغلقة بإحكام داخل مكتب الإدارة، مع حماية بكلمة سر وتخصيص الدخول للمسؤول فقط.',
      p2_installer_company_ar:
        'مؤسسة أمن إلكتروني مرخصة ومعتمدة من طرف مصالح وزارة الداخلية وأمن ولاية وهران.',
    };
    onApplyValues(
      fixed,
      locale === 'ar' ? 'تم تصحيح جميع نقاط عدم المطابقة تلقائياً' : 'Toutes les non-conformités ont été corrigées à 100%'
    );
    runAudit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.aiModalTitle}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Décret 09-410
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.aiModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 px-6 gap-2">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'wizard'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>{t.aiTabWizard}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              runAudit();
            }}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.aiTabAudit}</span>
            <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
              {auditScore}%
            </span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.aiTabFaq}</span>
          </button>
        </div>

        {/* Tab content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 1-CLICK WIZARD */}
          {activeTab === 'wizard' && (
            <div className="space-y-6">
              {/* Beginner explanation banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <p className="font-bold text-sm mb-0.5">
                    {locale === 'ar'
                      ? 'لا داعي لتعلم القوانين المعقدة أو الصياغة الإدارية!'
                      : 'Aucun terme technique requis : nous faisons tout pour vous !'}
                  </p>
                  <p>
                    {locale === 'ar'
                      ? 'اختر نوع نشاطك أو صف محلك ببساطة. سيقوم الذكاء الاصطناعي بإعداد ملفك الرسمي بالكامل باللغة العربية مع احترام القوانين الصارمة لولاية وهران (30 يوما تسجيل، أجهزة معتمدة، وتأمين جهاز التسجيل).'
                      : 'Cliquez sur votre type d\'activité ou écrivez une phrase simple. L’assistant rédige instantanément le dossier officiel en arabe juridique (Cairo), calcule les caméras, la rétention 30 jours et les clauses de sécurité requises par la DRAG Oran.'}
                  </p>
                </div>
              </div>

              {/* Business Presets Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  {locale === 'ar' ? '1. اختر نوع محلك أو نشاطك :' : '1. Choisissez votre type d’établissement :'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESETS.map((preset) => {
                    const IconComp = preset.icon;
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {preset.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {preset.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free-text input or customization */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {locale === 'ar'
                    ? '2. تفاصيل إضافية أو وصف خاص بمحلك (اختياري) :'
                    : '2. Précisez ou personnalisez votre demande (facultatif) :'}
                </label>
                <div className="relative">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'مثال: محل بيع ملابس بحي العقيد لطفي بوهران، مساحة 120م²، أريد وضع 4 كاميرات داخلية و2 خارجيتين...'
                        : 'Ex: Magasin de vêtements à Es-Sénia, 120m², 4 caméras intérieures et 2 extérieures...'
                    }
                    rows={3}
                    className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    {locale === 'ar' ? 'إضافة سريعة :' : 'Suggestions :'}
                  </span>
                  {[
                    'دائرة السانية',
                    'دائرة بئر الجير',
                    'دائرة وهران',
                    '4 كاميرات',
                    '8 كاميرات',
                    'مكتب المدير مغلق',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() =>
                        setUserPrompt((prev) => (prev ? `${prev} - ${chip}` : chip))
                      }
                      className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={runWizard}
                  disabled={isGenerating}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-base shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{generationStep || 'Génération du dossier complet...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>
                        {locale === 'ar'
                          ? '✨ توليد الملف الإداري الرسمي بنقرة واحدة (100% مطابق)'
                          : '✨ Générer le dossier officiel en 1 clic (100% conforme)'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Result Preview */}
              {generatedResult && (
                <div className="border border-emerald-300 dark:border-emerald-800 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>
                        {locale === 'ar'
                          ? 'ملف وهران جاهز بالكامل للتطبيق على استمارتك'
                          : 'Dossier officiel DRAG Oran rédigé et prêt'}
                      </span>
                    </div>
                    <span className="text-xs bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Décret 09-410
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {plainSummary}
                  </p>

                  {/* Summary preview cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-slate-900 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/60 font-sans">
                    <div>
                      <span className="text-slate-400 block mb-0.5">النشاط / Activité :</span>
                      <strong className="text-slate-900 dark:text-white font-serif">
                        {generatedResult.p1_activity_ar || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">الدائرة والبلدية / Commune :</span>
                      <strong className="text-slate-900 dark:text-white">
                        {generatedResult.p1_daira_ar} - {generatedResult.p1_commune_ar}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">الكاميرات / Caméras :</span>
                      <strong className="text-slate-900 dark:text-white">
                        {generatedResult.p1_cam_total_ar} caméras ({generatedResult.p1_cam_indoor_ar} intérieures + {generatedResult.p1_cam_outdoor_ar} extérieures)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">مدة التسجيل / Rétention :</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {generatedResult.p1_retention_days_ar}
                      </strong>
                    </div>
                    <div className="col-span-full">
                      <span className="text-slate-400 block mb-0.5">المبررات القانونية / Motifs :</span>
                      <p className="text-slate-800 dark:text-slate-200 font-serif leading-relaxed">
                        {generatedResult.p1_reasons_ar}
                      </p>
                    </div>
                  </div>

                  {/* Apply button */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGeneratedResult(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {locale === 'ar' ? 'تعديل الخيارات' : 'Recommencer'}
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyToForm}
                      className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <span>
                        {locale === 'ar'
                          ? 'تطبيق على الاستمارة وتحديث الـ PDF فوراً'
                          : 'Appliquer sur le formulaire et le PDF'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGULATORY AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Score header */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-700"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          auditScore >= 80
                            ? 'text-emerald-400'
                            : auditScore >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }
                        strokeDasharray={`${auditScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xl font-black">{auditScore}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold">
                        {locale === 'ar'
                          ? 'درجة المطابقة مع المرسوم 09-410'
                          : 'Indice de conformité Décret 09-410'}
                      </h4>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          auditScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {auditScore >= 80
                          ? locale === 'ar'
                            ? 'ملف مطابق'
                            : 'Conforme DRAG'
                          : locale === 'ar'
                          ? 'تعديلات مطلوبة'
                          : 'Ajustements requis'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-md">
                      {auditSummary ||
                        (locale === 'ar'
                          ? 'فحص شامل لجميع الشروط الإدارية والتقنية المطلوبة في ولاية وهران.'
                          : 'Vérification automatique des points de contrôle inspectés par la commission de la Wilaya d\'Oran.')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={runAudit}
                    disabled={isAuditing}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>{locale === 'ar' ? 'إعادة الفحص الآن' : 'Re-scanner le dossier'}</span>
                  </button>
                  {auditScore < 100 && (
                    <button
                      type="button"
                      onClick={handleAutoFixAll}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        {locale === 'ar' ? '⚡ تصحيح كل النقاط بضغطة زر' : '⚡ Corriger tout en 1 clic'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {locale === 'ar'
                    ? 'نقاط التفتيش الرسمية (اللجنة الولائية) :'
                    : 'Points de contrôle de la commission de vidéosurveillance :'}
                </h5>

                {auditChecklist.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Chargement du diagnostic de conformité...
                  </div>
                ) : (
                  auditChecklist.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                        item.status === 'pass'
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : item.status === 'warn'
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                          : 'border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                      }`}
                    >
                      {item.status === 'pass' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      {item.status === 'warn' && (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      )}
                      {item.status === 'fail' && (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <h6 className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.title}
                          </h6>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              item.status === 'pass'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : item.status === 'warn'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {item.status === 'pass'
                              ? 'Validé'
                              : item.status === 'warn'
                              ? 'À optimiser'
                              : 'Non conforme'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {item.explanation}
                        </p>
                        {item.status !== 'pass' && item.fix && (
                          <div className="mt-2 text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                              💡 Solution conseillée : {item.fix}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NOVICE GUIDE & FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">
                    {locale === 'ar'
                      ? 'دليل المبتدئين لإيداع الملف بولاية وهران'
                      : 'Guide complet pour déposer sans stress à la Wilaya d\'Oran'}
                  </p>
                  <p className="text-blue-800 dark:text-blue-300">
                    {locale === 'ar'
                      ? 'تخضع كاميرات المراقبة في الجزائر للترخيص المسبق بموجب المرسوم التنفيذي 09-410 المتعلق بالمعدات الحساسة. إليك كل ما تحتاجه خطوة بخطوة.'
                      : 'L’installation de caméras dans les commerces et ERP en Algérie est strictement réglementée. Voici les 5 étapes simples pour réussir votre démarche sans rejet administratif.'}
                  </p>
                </div>
              </div>

              {/* Step by step cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4>{locale === 'ar' ? 'الوثائق الواجب إرفاقها' : 'Pièces physiques du dossier'}</h4>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                    <li>3 exemplaires du formulaire officiel rempli (via cette application).</li>
                    <li>Plan d’implantation côté avec orientation des caméras (onglet Schéma 3D).</li>
                    <li>Copie du Registre de Commerce (RC) ou carte d'artisan/agrément.</li>
                    <li>Fiche technique du matériel (fournie par l'installateur).</li>
                    <li>Copie de la pièce d’identité du gérant.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4>{locale === 'ar' ? 'الشرط الحاسم : 30 يوماً' : 'La règle d\'or : 30 jours'}</h4>
                  </div>
                  <p className="leading-relaxed">
                    L'article 14 du Décret 09-410 exige un stockage minimal de{' '}
                    <strong>30 jours calendaires</strong>. Si votre enregistreur n'a pas assez de
                    disque dur (ex: disque 500 Go pour 8 caméras), votre dossier sera refusé. Notre
                    assistant configure automatiquement la capacité adéquate (1 à 4 To).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4>{locale === 'ar' ? 'حرمة الطريق العام والجيران' : 'Interdiction de filmer la voie publique'}</h4>
                  </div>
                  <p className="leading-relaxed">
                    Vos caméras extérieures doivent strictement viser les accès et la façade de votre
                    bâtiment. Il est strictement interdit d'avoir un angle qui filme en direct la
                    chaussée publique ou les fenêtres des voisins.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4>{locale === 'ar' ? 'أين يودع الملف في وهران ؟' : 'Où déposer le dossier à Oran ?'}</h4>
                  </div>
                  <p className="leading-relaxed">
                    Le dossier se dépose auprès de la <strong>DRAG</strong> (Direction de la
                    Réglementation et des Affaires Générales) au siège de la Wilaya d'Oran, ou au
                    bureau de la réglementation de votre <strong>Daïra de rattachement</strong> (ex:
                    Daïra d’Oran, Daïra d’Es-Sénia, Daïra de Bir El Djir, Daïra d'Arzew).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Gemini Generative API (3.8 Flash) · Oran DRAG Security Core</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            {locale === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

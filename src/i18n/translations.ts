export type AppLocale = 'fr' | 'en' | 'ar';

export interface Translations {
  brandTitle: string;
  navWorkspace: string;
  navFloorPlan: string;
  navHistory: string;
  navCatalogCrud: string;
  navAnalysis: string;
  navFlutterCode: string;
  navPrivacyPolicy: string;
  navDeleteAccount: string;
  uploadOriginalPdf: string;
  changeOriginalPdf: string;
  downloadFilledPdf: string;
  exportingPdf: string;
  saveToObjectBox: string;
  savedToObjectBoxToast: string;
  formPanelTitle: string;
  fieldsFilledLabel: string;
  officialModelActive: string;
  activePdfLabel: string;
  btnSampleOran: string;
  btnClear: string;
  btnCalibrate: string;
  autoSyncLabel: string;
  marketLabel: string;
  marketNational: string;
  marketExternal: string;
  marketNone: string;
  directEditPdf: string;
  showBoxes: string;
  all3PagesView: string;
  chooseFromObjectBox: string;
  manageCrudList: string;
  saveCurrentValueToList: string;
  historyTitle: string;
  historySubtitle: string;
  searchHistoryPlaceholder: string;
  loadIntoPdf: string;
  duplicateDossier: string;
  deleteDossier: string;
  lazyLoadedCount: string;
  loadMoreLazy: string;
  allHistoryLoaded: string;
  emptyHistoryTitle: string;
  emptyHistoryDesc: string;
  crudModalTitle: string;
  crudModalSubtitle: string;
  addChoicePlaceholderAr: string;
  addChoicePlaceholderFr: string;
  btnAddChoice: string;
  btnUpdateChoice: string;
  btnCancelEdit: string;
  btnResetCatalog: string;
  btnUndo: string;
  btnRedo: string;
  undoToast: string;
  redoToast: string;
  btnAiWizard: string;
  btnAiAudit: string;
  btnAiSuggestField: string;
  aiModalTitle: string;
  aiModalSubtitle: string;
  aiTabWizard: string;
  aiTabAudit: string;
  aiTabFaq: string;
  autoSecureToast: string;
  floorPlanTitle: string;
  floorPlanSubtitle: string;
  btnAutoSecure: string;
  longPressDragHint: string;
  tapToSelectHint: string;
  step1Rooms: string;
  step3Cameras: string;
  step4Export: string;
  coveragePercent: string;
  btnLivePov: string;
  btnFieldWiring: string;
  wiringModalTitle: string;
  wiringModalSubtitle: string;
  btnApplyWiring: string;
  btnImportFromForm: string;
  wiringSuccessToast: string;
  navPrevPage: string;
  navNextPage: string;
  planConnectedBadge: string;
}

export const TRANSLATIONS: Record<AppLocale, Translations> = {
  fr: {
    brandTitle: 'DRAG Wilaya · ObjectBox & Cairo PDF',
    navWorkspace: 'Formulaire & PDF',
    navFloorPlan: 'Schéma & 3D Bâti',
    navHistory: 'Historique ObjectBox',
    navCatalogCrud: 'Listes CRUD (15)',
    navAnalysis: 'Analyse (3 Pages)',
    navFlutterCode: 'Code Flutter & CI',
    navPrivacyPolicy: 'Confidentialité',
    navDeleteAccount: 'Suppression Compte',
    uploadOriginalPdf: 'Charger PDF original (.pdf)',
    changeOriginalPdf: 'Changer le PDF',
    downloadFilledPdf: 'Exporter en PDF',
    exportingPdf: 'Exportation PDF...',
    saveToObjectBox: 'Enregistrer dans ObjectBox',
    savedToObjectBoxToast: 'Dossier enregistré dans la base ObjectBox (Historique mis à jour).',
    formPanelTitle: 'Formulaire Arabe (Police Cairo) & Listes ObjectBox',
    fieldsFilledLabel: 'champs remplis',
    officialModelActive: 'Modèle officiel Wilaya d’Oran 1:1',
    activePdfLabel: 'PDF actif :',
    btnSampleOran: 'Exemple Oran',
    btnClear: 'Vider',
    btnCalibrate: 'Calibrer',
    autoSyncLabel: 'Synchroniser les champs communs (Pages 1, 2, 3)',
    marketLabel: 'Marché (1) :',
    marketNational: 'السوق الوطنية (شطب الخارجية)',
    marketExternal: 'السوق الخارجية (شطب الوطنية)',
    marketNone: 'بدون شطب إضافي',
    directEditPdf: 'Écriture directe sur PDF',
    showBoxes: 'Cadres',
    all3PagesView: 'Vue 3 Pages',
    chooseFromObjectBox: 'Sélectionner depuis la liste ObjectBox...',
    manageCrudList: 'Gérer liste CRUD',
    saveCurrentValueToList: '+ Mémoriser cette valeur dans ObjectBox',
    historyTitle: 'Historique des Dossiers ObjectBox (Lazy List)',
    historySubtitle:
      'Chargement progressif paginé (offset / limit) depuis la boîte ObjectBox DossierSubmissionEntity.',
    searchHistoryPlaceholder: 'Rechercher par nom, société, adresse ou date...',
    loadIntoPdf: 'Charger sur le PDF',
    duplicateDossier: 'Dupliquer',
    deleteDossier: 'Supprimer',
    lazyLoadedCount: 'dossiers affichés sur',
    loadMoreLazy: 'Charger la suite (Lazy Load)',
    allHistoryLoaded: 'Tous les dossiers de la requête ObjectBox sont chargés',
    emptyHistoryTitle: 'Aucun dossier trouvé dans ObjectBox',
    emptyHistoryDesc:
      'Enregistrez le formulaire actuel ou modifiez votre recherche pour afficher les dossiers.',
    crudModalTitle: 'Gestionnaire CRUD des Listes de Choix (ObjectBox)',
    crudModalSubtitle:
      'Ajoutez, modifiez ou supprimez les options réutilisables (Entreprises d’installation agréées, Caméras, DVR, Communes, Transport, Sécurité).',
    addChoicePlaceholderAr: 'النص بالعربية (يكتب بخط Cairo في ملف PDF)...',
    addChoicePlaceholderFr: 'Libellé ou note explicative en français (optionnel)...',
    btnAddChoice: 'Ajouter à ObjectBox',
    btnUpdateChoice: 'Enregistrer la modification',
    btnCancelEdit: 'Annuler',
    btnResetCatalog: 'Restaurer les valeurs par défaut',
    btnUndo: 'Annuler (Ctrl+Z)',
    btnRedo: 'Rétablir (Ctrl+Y)',
    undoToast: 'Annulation effectuée (état précédent restauré).',
    redoToast: 'Rétablissement effectué.',
    btnAiWizard: 'Assistant IA Expert (Débutant)',
    btnAiAudit: 'Diagnostic Réglementaire Décret 09-410',
    btnAiSuggestField: '✨ Rédiger pour moi (IA)',
    aiModalTitle: 'Assistant IA Expert Décret 09-410 & DRAG Oran',
    aiModalSubtitle: 'Conception intelligente pour néophytes : pré-remplissage en 1 clic, conformité légale et conseils d’experts sans jargon.',
    aiTabWizard: '🪄 Générateur 1 Clic',
    aiTabAudit: '🛡️ Audit Conformité 09-410',
    aiTabFaq: '💡 Guide Débutant DRAG',
    autoSecureToast: 'Sécurisation automatique appliquée : caméras orientées sur tous les accès.',
    floorPlanTitle: "Concepteur de Plan & Schéma d'Implantation 2D / 3D",
    floorPlanSubtitle:
      "Dessinez les pièces, ouvertures et portails, positionnez caméras, DVR et détecteurs, puis synchronisez automatiquement avec le formulaire officiel DRAG Wilaya d'Oran.",
    btnAutoSecure: 'Auto-Sécuriser (IA)',
    longPressDragHint: 'Appui long pour créer ou déplacer un élément',
    tapToSelectHint: "Clic simple pour sélectionner et régler l'orientation",
    step1Rooms: '1. Pièces & Murs',
    step3Cameras: '3. Caméras & NVR',
    step4Export: '4. Synchroniser & Exporter',
    coveragePercent: 'Couverture périmétrique',
    btnLivePov: 'Aperçu Direct CCTV (POV & Zoom)',
    btnFieldWiring: 'Câblage Champs Formulaire',
    wiringModalTitle: 'Câblage Automatique & Mappage des Champs (Plan ↔ Formulaire DRAG)',
    wiringModalSubtitle:
      'Synchronisation intelligente 1-clic : quantités, modèles conformes sans IR, numéros de série, pièce de stockage du DVR et conditions de sécurité sur les 3 Pages du PDF.',
    btnApplyWiring: 'Appliquer le Câblage Complet au Formulaire',
    btnImportFromForm: 'Importer les Équipements du Formulaire',
    wiringSuccessToast:
      'Câblage réussi : Tableau des équipements, stockage et sécurité synchronisés sur le Formulaire DRAG.',
    navPrevPage: 'Page Précédente',
    navNextPage: 'Page Suivante',
    planConnectedBadge: 'Câblé avec le Plan 2D/3D',
  },
  en: {
    brandTitle: 'DRAG Wilaya · ObjectBox & Cairo PDF',
    navWorkspace: 'Form & PDF',
    navFloorPlan: 'Floor Plan & 3D CCTV',
    navHistory: 'ObjectBox History',
    navCatalogCrud: 'CRUD Lists (15)',
    navAnalysis: '3-Page Analysis',
    navFlutterCode: 'Flutter & CI Code',
    navPrivacyPolicy: 'Privacy Policy',
    navDeleteAccount: 'Delete Account',
    uploadOriginalPdf: 'Load Original PDF (.pdf)',
    changeOriginalPdf: 'Change PDF',
    downloadFilledPdf: 'Export to PDF',
    exportingPdf: 'Exporting PDF...',
    saveToObjectBox: 'Save to ObjectBox',
    savedToObjectBoxToast: 'Dossier saved to ObjectBox database (History updated).',
    formPanelTitle: 'Arabic Form (Cairo Font) & ObjectBox Choice Lists',
    fieldsFilledLabel: 'fields filled',
    officialModelActive: '1:1 Official Wilaya of Oran Template',
    activePdfLabel: 'Active PDF:',
    btnSampleOran: 'Oran Sample',
    btnClear: 'Clear',
    btnCalibrate: 'Calibrate',
    autoSyncLabel: 'Auto-sync shared fields across Pages 1, 2, 3',
    marketLabel: 'Market (1):',
    marketNational: 'السوق الوطنية (شطب الخارجية)',
    marketExternal: 'السوق الخارجية (شطب الوطنية)',
    marketNone: 'بدون شطب إضافي',
    directEditPdf: 'Direct Edit on PDF',
    showBoxes: 'Boxes',
    all3PagesView: '3-Page View',
    chooseFromObjectBox: 'Pick from ObjectBox choice list...',
    manageCrudList: 'Manage CRUD List',
    saveCurrentValueToList: '+ Save current value to ObjectBox',
    historyTitle: 'ObjectBox Dossier History (Lazy List)',
    historySubtitle:
      'Lazy-loaded paginated queries (offset / limit) from ObjectBox DossierSubmissionEntity box.',
    searchHistoryPlaceholder: 'Search by applicant name, company, address, or date...',
    loadIntoPdf: 'Load into PDF',
    duplicateDossier: 'Duplicate',
    deleteDossier: 'Delete',
    lazyLoadedCount: 'dossiers loaded out of',
    loadMoreLazy: 'Load More (Lazy Load)',
    allHistoryLoaded: 'All matching ObjectBox dossiers loaded',
    emptyHistoryTitle: 'No dossiers found in ObjectBox',
    emptyHistoryDesc:
      'Save the current form or adjust your search filter to view stored records.',
    crudModalTitle: 'ObjectBox Choice Lists CRUD Manager',
    crudModalSubtitle:
      'Create, update, or delete reusable choices (Approved Installers, Cameras, DVRs, Municipalities, Transport, Security).',
    addChoicePlaceholderAr: 'Arabic value (written in Cairo font onto the PDF)...',
    addChoicePlaceholderFr: 'French description or note (optional)...',
    btnAddChoice: 'Add to ObjectBox',
    btnUpdateChoice: 'Update Item',
    btnCancelEdit: 'Cancel',
    btnResetCatalog: 'Reset Default Catalog',
    btnUndo: 'Undo (Ctrl+Z)',
    btnRedo: 'Redo (Ctrl+Y)',
    undoToast: 'Undo performed (previous state restored).',
    redoToast: 'Redo performed.',
    btnAiWizard: 'AI Expert Assistant (Novice)',
    btnAiAudit: 'Regulatory Compliance Audit (Decree 09-410)',
    btnAiSuggestField: '✨ Draft for me (AI)',
    aiModalTitle: 'AI Expert Assistant Decree 09-410 & DRAG Oran',
    aiModalSubtitle: 'Effortless novice-friendly wizard: 1-click auto-fill, legal compliance checks, and clear guidance.',
    aiTabWizard: '🪄 1-Click Wizard',
    aiTabAudit: '🛡️ Compliance Audit',
    aiTabFaq: '💡 Beginner Guide',
    autoSecureToast: 'Auto-secure applied: cameras strategically placed at all building access points.',
    floorPlanTitle: 'Floor Plan & 2D / 3D CCTV Layout Designer',
    floorPlanSubtitle:
      'Draw rooms, openings, and gates, place cameras, DVRs, and sensors, then automatically synchronize with the official Wilaya of Oran DRAG form.',
    btnAutoSecure: 'Auto-Secure (AI)',
    longPressDragHint: 'Long-press to create or move an element',
    tapToSelectHint: 'Tap to select and adjust orientation',
    step1Rooms: '1. Rooms & Walls',
    step3Cameras: '3. Cameras & NVR',
    step4Export: '4. Sync & Export',
    coveragePercent: 'Perimeter Coverage',
    btnLivePov: 'Live CCTV Preview (POV & Zoom)',
    btnFieldWiring: 'Form Fields Wiring',
    wiringModalTitle: 'Automatic Wiring & Fields Mapping (Plan ↔ DRAG Form)',
    wiringModalSubtitle:
      'Intelligent 1-click sync: quantities, non-IR compliant models, serial numbers, DVR storage room, and security conditions across all 3 PDF pages.',
    btnApplyWiring: 'Apply Complete Wiring to Form',
    btnImportFromForm: 'Import Equipment from Form',
    wiringSuccessToast:
      'Wiring successful: Equipment table, storage, and security conditions synced to DRAG Form.',
    navPrevPage: 'Previous Page',
    navNextPage: 'Next Page',
    planConnectedBadge: 'Wired to 2D/3D Plan',
  },
  ar: {
    brandTitle: 'مديرية التنظيم والشؤون العامة · وهران (ObjectBox & Cairo PDF)',
    navWorkspace: 'الاستمارة وملف PDF',
    navFloorPlan: 'مخطط البناية وكاميرات 3D',
    navHistory: 'سجل الملفات ObjectBox',
    navCatalogCrud: 'قوائم الخيارات (15)',
    navAnalysis: 'تحليل الاستمارة (3 صفحات)',
    navFlutterCode: 'كود Flutter & CI',
    navPrivacyPolicy: 'سياسة الخصوصية',
    navDeleteAccount: 'حذف الحساب',
    uploadOriginalPdf: 'تحميل ملف PDF الأصلي (.pdf)',
    changeOriginalPdf: 'تغيير ملف PDF',
    downloadFilledPdf: 'تصدير كملف PDF',
    exportingPdf: 'جارٍ التصدير...',
    saveToObjectBox: 'حفظ في قاعدة ObjectBox',
    savedToObjectBoxToast: 'تم حفظ الملف في قاعدة بيانات ObjectBox (تم تحديث السجل).',
    formPanelTitle: 'الاستمارة باللغة العربية (خط Cairo) وقوائم ObjectBox',
    fieldsFilledLabel: 'حقول مكتملة',
    officialModelActive: 'النموذج الرسمي لولاية وهران 1:1',
    activePdfLabel: 'ملف PDF الحالي:',
    btnSampleOran: 'نموذج وهران',
    btnClear: 'مسح',
    btnCalibrate: 'معايرة',
    autoSyncLabel: 'مزامنة الحقول المشتركة تلقائياً (الصفحات 1، 2، 3)',
    marketLabel: 'السوق (1):',
    marketNational: 'السوق الوطنية (شطب الخارجية)',
    marketExternal: 'السوق الخارجية (شطب الوطنية)',
    marketNone: 'بدون شطب إضافي',
    directEditPdf: 'الكتابة المباشرة على PDF',
    showBoxes: 'إطارات الحقول',
    all3PagesView: 'عرض الصفحات الثلاث',
    chooseFromObjectBox: 'اختيار من قائمة ObjectBox...',
    manageCrudList: 'إدارة قائمة الخيارات',
    saveCurrentValueToList: '+ حفظ هذه القيمة في قائمة ObjectBox',
    historyTitle: 'سجل ملفات ObjectBox (تحميل تدريجي Lazy List)',
    historySubtitle:
      'استعلامات مفهرسة ومقسمة إلى صفحات (offset / limit) من جدول DossierSubmissionEntity.',
    searchHistoryPlaceholder: 'بحث بالاسم، المؤسسة، العنوان أو التاريخ...',
    loadIntoPdf: 'تطبيق على ملف PDF',
    duplicateDossier: 'نسخ الملف',
    deleteDossier: 'حذف',
    lazyLoadedCount: 'ملفات معروضة من أصل',
    loadMoreLazy: 'تحميل المزيد (Lazy Load)',
    allHistoryLoaded: 'تم تحميل جميع الملفات المطابقة لنتائج البحث',
    emptyHistoryTitle: 'لا توجد ملفات محفوظة في قاعدة ObjectBox',
    emptyHistoryDesc: 'قم بحفظ الاستمارة الحالية أو تعديل معايير البحث لعرض السجلات.',
    crudModalTitle: 'مدير قوائم الخيارات Reusable Choices (ObjectBox)',
    crudModalSubtitle:
      'إضافة، تعديل أو حذف الخيارات المسبقة (شركات التركيب المعتمدة، الكاميرات، أجهزة التسجيل، البلديات، النقل، الحراسة).',
    addChoicePlaceholderAr: 'النص بالعربية (يكتب بخط Cairo في ملف PDF)...',
    addChoicePlaceholderFr: 'وصف أو ملاحظة توضيحية بالفرنسية (اختياري)...',
    btnAddChoice: 'إضافة إلى ObjectBox',
    btnUpdateChoice: 'حفظ التعديل',
    btnCancelEdit: 'إلغاء',
    btnResetCatalog: 'استعادة القيم الافتراضية',
    btnUndo: 'تراجع (Ctrl+Z)',
    btnRedo: 'إعادة (Ctrl+Y)',
    undoToast: 'تم التراجع (استعادة الحالة السابقة).',
    redoToast: 'تمت الإعادة.',
    btnAiWizard: 'المساعد الذكي للخبراء (للمبتدئين)',
    btnAiAudit: 'فحص المطابقة القانونية (المرسوم 09-410)',
    btnAiSuggestField: '✨ صياغة إدارية ذكية',
    aiModalTitle: 'المساعد الذكي المعتمد للمرسوم 09-410 ومصالح وهران',
    aiModalSubtitle: 'واجهة فائقة السهولة للمبتدئين: ملء الملف بضغطة زر، تدقيق قانوني وإرشادات مبسطة باللغة العربية.',
    aiTabWizard: '🪄 المولد السحري (ضغطة واحدة)',
    aiTabAudit: '🛡️ فحص المطابقة والاشتراطات',
    aiTabFaq: '💡 دليل المبتدئين والإجراءات',
    autoSecureToast: 'تم التأمين التلقائي: تم توجيه وتوزيع الكاميرات على جميع المداخل والمنافذ.',
    floorPlanTitle: 'مصمم مخطط المنشأة وتركيب كاميرات المراقبة 2D / 3D',
    floorPlanSubtitle:
      'ارسم الغرف والأبواب والبوابات، وحدد مواقع الكاميرات وأجهزة التسجيل، مع مزامنة فورية مع استمارة ولاية وهران الرسمية.',
    btnAutoSecure: 'تأمين تلقائي ذكي',
    longPressDragHint: 'اضغط مطولاً لإنشاء أو سحب عنصر',
    tapToSelectHint: 'نقرة واحدة للتحديد وضبط زاوية الرؤية',
    step1Rooms: '1. الغرف والجدران',
    step3Cameras: '3. الكاميرات وجهاز التسجيل',
    step4Export: '4. مزامنة وتصدير',
    coveragePercent: 'نسبة تغطية المحيط',
    btnLivePov: 'معاينة حية للمشهد (POV وزوم)',
    btnFieldWiring: 'ربط حقول الاستمارة',
    wiringModalTitle: 'الربط الآلي ومطابقة الحقول (المخطط ↔ استمارة DRAG)',
    wiringModalSubtitle:
      'مزامنة ذكية بضغطة زر: الكميات، النماذج المعتمدة بدون أشعة حمراء، الأرقام التسلسلية، غرفة التسجيل وشروط الحفظ عبر الصفحات الثلاث.',
    btnApplyWiring: 'تطبيق الربط الكامل على الاستمارة',
    btnImportFromForm: 'استيراد التجهيزات من الاستمارة',
    wiringSuccessToast:
      'تم الربط بنجاح: تم تحديث جدول التجهيزات، موقع التخزين واشتراطات الحفظ في الاستمارة.',
    navPrevPage: 'الصفحة السابقة',
    navNextPage: 'الصفحة التالية',
    planConnectedBadge: 'مرتبط بالمخطط 2D/3D',
  },
};

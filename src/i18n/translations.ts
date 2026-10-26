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
  floorPlanTitle: string;
  floorPlanSubtitle: string;
  longPressDragHint: string;
  tapToSelectHint: string;
  btnAutoSecure: string;
  autoSecureToast: string;
  securityAuditTitle: string;
  storageCalcTitle: string;
  livePovTitle: string;
  btnLivePov: string;
  step1Rooms: string;
  step2Openings: string;
  step3Cameras: string;
  step4Export: string;
  coveragePercent: string;
  blindSpotsDetected: string;
  noBlindSpots: string;
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
    floorPlanTitle: 'Schéma Architectural & Implantation Vidéosurveillance',
    floorPlanSubtitle:
      'Plan 2D et rendu 3D temps réel avec calcul de couverture, cônes de vision et conformité réglementaire DRAG Wilaya d’Oran.',
    longPressDragHint: 'Appui long (0.3s) puis glisser pour déplacer n’importe quel élément',
    tapToSelectHint: 'Clic simple pour sélectionner et modifier les propriétés',
    btnAutoSecure: 'Placement Automatique Intelligent',
    autoSecureToast: 'Sécurisation automatique appliquée : caméras, NVR et alarme placés sur les accès clés !',
    securityAuditTitle: 'Audit & Conformité Réglementaire DRAG Oran',
    storageCalcTitle: 'Calculateur d’Autonomie Disque NVR (30 Jours)',
    livePovTitle: 'Simulateur de Vue Caméra en Direct',
    btnLivePov: 'Vue Caméra Simulée',
    step1Rooms: '1. Pièces & Murs',
    step2Openings: '2. Portes & Fenêtres',
    step3Cameras: '3. Caméras & NVR',
    step4Export: '4. Vérifier & Exporter',
    coveragePercent: 'Couverture du Site',
    blindSpotsDetected: 'Angle mort détecté sur issue',
    noBlindSpots: 'Toutes les issues sont surveillées',
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
    floorPlanTitle: 'Architectural Layout & CCTV Security Plan',
    floorPlanSubtitle:
      '2D floor layout and real-time 3D isometric view with FOV coverage calculation, blind spot detection, and DRAG compliance.',
    longPressDragHint: 'Long press (0.3s) then slide to move any element smoothly',
    tapToSelectHint: 'Single tap/click to select and edit element properties',
    btnAutoSecure: 'Intelligent Auto-Placement',
    autoSecureToast: 'Auto-secure applied: cameras, NVR, and alarm automatically placed at key access points!',
    securityAuditTitle: 'Security Audit & DRAG Oran Compliance',
    storageCalcTitle: 'NVR Storage Calculator (30 Days Retention)',
    livePovTitle: 'Live Camera POV Simulator',
    btnLivePov: 'Simulated Camera View',
    step1Rooms: '1. Rooms & Walls',
    step2Openings: '2. Doors & Windows',
    step3Cameras: '3. Cameras & NVR',
    step4Export: '4. Verify & Export',
    coveragePercent: 'Site Coverage',
    blindSpotsDetected: 'Blind spot detected on doorway',
    noBlindSpots: 'All building exits are covered',
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
    floorPlanTitle: 'المخطط الهندسي للبناية وتوزيع كاميرات المراقبة',
    floorPlanSubtitle:
      'مخطط 2D وعرض ثلاثي الأبعاد 3D مع حساب زوايا الرؤية ونسبة التغطية ومطابقة معايير ولاية وهران.',
    longPressDragHint: 'اضغط مطولاً (0.3 ثانية) ثم اسحب لتحريك أي عنصر بسلاسة',
    tapToSelectHint: 'نقرة واحدة لتحديد العنصر وتعديل خصائصه',
    btnAutoSecure: 'توزيع أمني ذكي تلقائي',
    autoSecureToast: 'تم تطبيق التأمين الذكي: وضع الكاميرات وأجهزة التسجيل وأجهزة الإنذار على المداخل الحيوية تلقائياً!',
    securityAuditTitle: 'تدقيق الأمان ومطابقة معايير ولاية وهران DRAG',
    storageCalcTitle: 'حاسبة سعة قرص التسجيل NVR (30 يوماً)',
    livePovTitle: 'محاكي زاوية رؤية الكاميرا الحية',
    btnLivePov: 'معاينة رؤية الكاميرا',
    step1Rooms: '1. الغرف والجدران',
    step2Openings: '2. الأبواب والنوافذ',
    step3Cameras: '3. الكاميرات وجهاز التسجيل',
    step4Export: '4. التحقق والتصدير',
    coveragePercent: 'نسبة التغطية الأمنية',
    blindSpotsDetected: 'تم اكتشاف زاوية غير مغطاة في أحد المخارج',
    noBlindSpots: 'جميع المداخل والمخارج تحت المراقبة',
  },
};

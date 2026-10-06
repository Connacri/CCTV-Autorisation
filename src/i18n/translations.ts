export type AppLocale = 'fr' | 'en';

export interface Translations {
  brandTitle: string;
  navWorkspace: string;
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
}

export const TRANSLATIONS: Record<AppLocale, Translations> = {
  fr: {
    brandTitle: 'DRAG Wilaya · ObjectBox & Cairo PDF',
    navWorkspace: 'Formulaire & PDF',
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
  },
  en: {
    brandTitle: 'DRAG Wilaya · ObjectBox & Cairo PDF',
    navWorkspace: 'Form & PDF',
    navHistory: 'ObjectBox History',
    navCatalogCrud: 'CRUD Lists (15)',
    navAnalysis: '3-Page Analysis',
    navFlutterCode: 'Flutter & CI Code',
    navPrivacyPolicy: 'Privacy Policy',
    navDeleteAccount: 'Delete Account',
    uploadOriginalPdf: 'Load Original PDF (.pdf)',
    changeOriginalPdf: 'Change PDF',
    downloadFilledPdf: 'Exporter en PDF',
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
  },
};

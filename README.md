# DRAG Oran — ObjectBox & Cairo PDF Filler (Web & Flutter)

Application complète (**Web React/TypeScript** + **Code source Flutter/Dart**) dédiée à l'analyse approfondie et au remplissage millimétrique en arabe (police **Cairo**) du dossier réglementaire de 3 pages de la **Wilaya d'Oran — Direction de la Réglementation et des Affaires Générales (DRAG)** (*قسم شركات الحراسة و التجهيزات الحساسة*).

---

## Fonctionnalités Clés

1. **Écriture Arabe Directe sur le PDF (Police Cairo RTL)** :
   - Préserve à 100 % le PDF original de 3 pages sans modifier sa structure.
   - Superpose les 49 champs en arabe avec la police **Cairo (`خط كايرو`)** aux coordonnées exactes des lignes pointillées et des cellules du tableau.
   - Centrage vertical corrigé et calibré pour les 4 cellules de quantités du tableau de la Page 3 (`y = 58.4%`, `64.6%`, `69.0%`, `71.9%`).
2. **Base de Données ObjectBox & Historique Lazy List** :
   - Entité `DossierSubmissionEntity` indexée sur `applicantName` et `updatedAt`.
   - Chargement progressif paginé (**Lazy List** avec `offset` et `limit` + défilement infini `IntersectionObserver` sur Web et `ScrollController` sur Flutter).
   - Recherche instantanée, chargement en 1 clic d'un ancien dossier sur le PDF, duplication et suppression.
3. **14 Listes de Choix avec CRUD Complet (`ChoiceCatalogItemEntity`)** :
   - `installer_company` : Entreprises d'installation de caméras agréées (`مرجع اعتماد و عنوان مؤسسة تركيب الكاميرات (6)`).
   - `indoor_cam_model` : Modèles de caméras intérieures sans infrarouge (`طبيعة كاميرات المراقبة الداخلية`).
   - `outdoor_cam_model` : Modèles de caméras extérieures sans infrarouge (`طبيعة كاميرات المراقبة الخارجية`).
   - `recorder_designation` : Désignation du type d'enregistreur (`تعيين نوع المسجل DVR/NVR`).
   - `recorder_model` : Modèles et numéros de série d'enregistreurs (`طبيعة المسجل`).
   - `authority_issued_by` : Communes / Daïras de délivrance CNI & Passeport (`الصادرة عن / الصادر عن`).
   - `doc_location` : Communes de signature (`حرر بـ`).
   - `nationality` : Nationalités (`الجنسية`).
   - `profession` : Professions / Fonctions (`المهنة (4)`).
   - `activity_type` : Natures d'activités (`نوع النشاطات (5)`).
   - `origin_country` : Pays d'origine des équipements (`بلد منشأ التجهيزات`).
   - `provenance_country` : Pays / Marché de provenance (`بلد قدوم التجهيزات`).
   - `transport_method` : Modalités de transport (`كيفيات نقل التجهيزات`).
   - `security_conditions` : Conditions de conservation en lieu sûr (`شروط حفظ التجهيزات في مأمن`).
4. **Localisation FR / EN & Responsive Multi-Appareils** :
   - Interface disponible en Français (`FR`) et Anglais (`EN`).
   - Mise en page adaptative Mobile, Tablette et Desktop (`LayoutBuilder` sous Flutter, Tailwind CSS sous React).

---

## Développement Local (Web)

```bash
npm install
npm run dev
```

## Utilisation du Code Flutter & ObjectBox

Depuis l'onglet **« Code Flutter & ObjectBox »** de l'application, téléchargez :
- `pubspec.yaml`
- `lib/models/objectbox_entities.dart`
- `lib/main.dart`

Puis exécutez le générateur ObjectBox :
```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

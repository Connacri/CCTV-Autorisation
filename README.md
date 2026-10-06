# DRAG Wilaya (69 Wilayas) — ObjectBox & Cairo PDF Filler (Web & Flutter)

Application complète (**Web React/TypeScript** + **Code source Flutter/Dart** + **Workflow GitHub Actions CI/CD**) dédiée à l'analyse approfondie et au remplissage millimétrique en arabe (police **Cairo**) du dossier réglementaire de 3 pages de la **Direction de la Réglementation et des Affaires Générales (DRAG)** (*قسم شركات الحراسة و التجهيزات الحساسة*) pour les **69 Wilayas d'Algérie**.

---

## Liens & Règles de Confidentialité (Google Play Store)

* **Page Web Publique des Règles de Confidentialité (HTML statique non modifiable)** : `/privacy.html`
* **Route directe dans l'application Web** : `/?page=privacy`
* **Workflow CI/CD & Releases Versionnées** : `.github/workflows/release.yml`

---

## Fonctionnalités Clés

1. **69 Wilayas d'Algérie + Ajout CRUD (`p1_wilaya`, `p2_wilaya`, `p3_wilaya`)** :
   - Sur les 3 pages d'origine, l'en-tête `ولاية ...` est un champ sélectionnable parmi les **69 Wilayas d'Algérie** (de `01 - ولاية أدرار` à `69 - ولاية العريشة`, avec `31 - ولاية وهران` par défaut) ou personnalisable en ajoutant une nouvelle Wilaya dans ObjectBox.
   - Masquage blanc automatique de l'ancien texte d'en-tête pour remplacer proprement `ولاية وهران` même sur un PDF scanné importé.
2. **Centrage Intégral & Calibrage Millimétrique (52 Champs — Police Cairo)** :
   - Tous les textes saisis sur les 3 pages sont **centrés** au milieu de leurs lignes pointillées et cellules de tableau respectives.
   - Sur la Page 3, les 4 cellules de quantités (`58.4%`, `64.6%`, `69.0%`, `71.9%`) sont centrées dans leurs cases et la ligne `حرر بـ ... في ...` (`y = 74.9%`) est abaissée sous le tableau (`73.0%`) pour éviter tout chevauchement.
3. **Base de Données ObjectBox & Historique Lazy List** :
   - Entité `DossierSubmissionEntity` indexée sur `wilaya`, `applicantName` et `updatedAt`.
   - Chargement progressif paginé (**Lazy List** avec `offset` et `limit` + défilement infini `IntersectionObserver` sur Web et `ScrollController` sur Flutter).
4. **15 Listes de Choix avec CRUD Complet (`ChoiceCatalogItemEntity`)** :
   - `wilaya` : Les 69 Wilayas d'Algérie + ajout de nouvelle Wilaya.
   - `installer_company` : Entreprises d'installation de caméras agréées.
   - `indoor_cam_model` & `outdoor_cam_model` : Modèles de caméras intérieures et extérieures sans infrarouge.
   - `recorder_designation` & `recorder_model` : Types et modèles d'enregistreurs DVR/NVR.
   - `authority_issued_by`, `doc_location`, `nationality`, `profession`, `activity_type`, `origin_country`, `provenance_country`, `transport_method`, `security_conditions`.
5. **Règles de Confidentialité Conformes Google Play Store** :
   - Hébergées sur `/privacy.html` (page Web standard non modifiable, publique, HTTPS/SSL, sans restriction géographique ni connexion requise) et intégrées dans l'application Web et Flutter (`PrivacyPolicyScreen`).

---

## Développement Local (Web)

```bash
npm install
npm run lint
npm run dev
```

## CI/CD & Releases Versionnées (GitHub Actions)

Le fichier `.github/workflows/release.yml` exécute automatiquement à chaque push sur `main` ou tag `v*.*.*` :
1. Vérification TypeScript (`npm run lint`) et build Web (`npm run build`).
2. Déploiement automatique sur **GitHub Pages** (incluant `/privacy.html`).
3. Compilation et signature Android (`app-release.apk` et `app-release.aab`) via les secrets GitHub (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`).
4. Publication d'une **Release GitHub versionnée (`v1.0.x`)** avec `web-build.zip`, `app-release.apk` et `app-release.aab`.

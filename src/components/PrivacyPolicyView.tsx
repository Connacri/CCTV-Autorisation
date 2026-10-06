import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Lock, Database, Globe } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  const [copiedUrl, setCopiedUrl] = useState<'static' | 'route' | null>(null);

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://votre-domaine.github.io';

  const staticPrivacyUrl = `${origin}/privacy.html`;
  const routePrivacyUrl = `${origin}/?page=privacy`;

  const handleCopy = async (type: 'static' | 'route', url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Play Console Ready URL Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformité Google Play Console · Règlement sur les données utilisateur</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Règles de Confidentialité (Privacy Policy)
            </h1>
            <p className="text-xs text-slate-500">
              Page Web standard, publique, sans connexion requise ni restriction géographique, prête pour la fiche Google Play Store et intégrée dans l’application.
            </p>
          </div>

          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <span>Ouvrir /privacy.html (Page autonome)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Copyable URLs for Google Play Console */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500">
                URL 1 — Page HTML Statique Autonome (Recommandée Play Store) :
              </span>
              <code className="text-xs font-mono-tabular text-slate-900 truncate block mt-0.5">
                {staticPrivacyUrl}
              </code>
            </div>
            <button
              onClick={() => handleCopy('static', staticPrivacyUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              {copiedUrl === 'static' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier URL</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500">
                URL 2 — Lien Direct Application Web :
              </span>
              <code className="text-xs font-mono-tabular text-slate-900 truncate block mt-0.5">
                {routePrivacyUrl}
              </code>
            </div>
            <button
              onClick={() => handleCopy('route', routePrivacyUrl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              {copiedUrl === 'route' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Google Play Requirements Verification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>URL Active & HTTPS/SSL</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Accessible publiquement en HTTPS avec certificat SSL valide sur GitHub Pages / Cloud Run.
            </p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>Accès Mondial Sans Login</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Aucune restriction géographique, aucun géorepérage et aucune obligation de connexion.
            </p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Page Web Standard</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Affichée sur une page HTML standard non modifiable (ni un PDF ni un fichier téléchargeable).
            </p>
          </div>
          <div className="p-3 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>100 % Local ObjectBox</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Divulgue le stockage exclusivement local ObjectBox et l’absence totale de partage tiers.
            </p>
          </div>
        </div>
      </section>

      {/* Full Standard Non-Editable Legal Text of the Privacy Policy */}
      <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 text-slate-700 text-sm leading-relaxed">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Texte Officiel des Règles de Confidentialité — DRAG Wilaya PDF & ObjectBox
            </h2>
            <p className="text-xs text-slate-500">
              Package : <code className="font-mono-tabular">oran_drag_pdf_objectbox</code> · Dernière mise à jour : 06 Octobre 2026
            </p>
          </div>
          <span className="text-xs font-cairo font-bold text-emerald-800">
            سياسة الخصوصية وحماية البيانات
          </span>
        </div>

        {/* Arabic Summary Box */}
        <div
          dir="rtl"
          className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl font-cairo space-y-1.5 text-right"
        >
          <h3 className="font-bold text-emerald-950 text-base">
            ملخص سياسة الخصوصية وحماية البيانات (بالعربية)
          </h3>
          <p className="text-slate-800 text-sm leading-relaxed">
            يعمل تطبيق <strong>« DRAG Oran — ObjectBox &amp; Cairo PDF »</strong> محلياً بالكامل (100% داخل جهاز المستخدم) عبر قاعدة البيانات المحلية <strong>ObjectBox</strong> لملء استمارة التجهيزات الحساسة (للولايات الـ 69) بخط <strong>Cairo</strong>. لا يقوم التطبيق بجمع أو إرسال أو بيع أو مشاركة أي بيانات شخصية أو إدارية مع أي خادم خارجي أو طرف ثالث. يحتفظ المستخدم بالتحكم الكامل في إضافة أو تعديل أو حذف ملفاته وسجلاته محلياً في أي وقت.
          </p>
        </div>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            1. Portée et application spécifique
          </h3>
          <p>
            Les présentes règles de confidentialité s’appliquent exclusivement à l’application mobile et Web <strong>« DRAG Oran — ObjectBox &amp; Cairo PDF »</strong> (package Android/Flutter : <code className="font-mono-tabular">oran_drag_pdf_objectbox</code>). Elles décrivent de manière transparente la manière dont l’application traite les informations saisies par l’utilisateur et les fonctionnalités de l’appareil.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            2. Collecte, utilisation et stockage des données (100 % Local via ObjectBox)
          </h3>
          <p>
            L’application fonctionne selon une architecture strictement locale (<strong>Local-First / Hors-ligne</strong>). Les informations saisies pour générer le formulaire administratif de 3 pages (identité du demandeur, filiation, numéro de CNI ou passeport, dénomination sociale, adresse d’installation, choix parmi les 69 Wilayas, inventaire des caméras et enregistreurs DVR/NVR) :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Sont enregistrées <strong>uniquement sur votre appareil</strong> dans la base de données locale embarquée <strong>ObjectBox</strong> (<code className="font-mono-tabular">DossierSubmissionEntity</code> et <code className="font-mono-tabular">ChoiceCatalogItemEntity</code>) ou dans le stockage local de votre navigateur Web.
            </li>
            <li>
              Sont utilisées dans le seul but de vous permettre de remplir, prévisualiser en police <strong>Cairo</strong>, sauvegarder dans votre historique local et exporter vos propres documents PDF.
            </li>
            <li>
              <strong>Ne quittent jamais votre appareil :</strong> Aucune donnée personnelle, sensible ou administrative n’est transmise, téléversée ou collectée sur nos serveurs ou sur un cloud externe.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            3. Autorisations de l’appareil et accès aux fichiers
          </h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Accès aux fichiers PDF choisis par l’utilisateur (<code className="font-mono-tabular">file_picker</code>) :</strong> Utilisé uniquement lorsque vous sélectionnez volontairement un fichier PDF modèle sur votre terminal afin d’y écrire les champs en arabe sans altérer le document original.
            </li>
            <li>
              <strong>Impression et export PDF (<code className="font-mono-tabular">printing</code> / <code className="font-mono-tabular">syncfusion_flutter_pdf</code>) :</strong> Utilisé uniquement pour générer et enregistrer le fichier PDF final sur votre appareil.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            4. Partage des données avec des tiers
          </h3>
          <p>
            <strong>Aucun partage avec des tiers :</strong> L’application ne partage, ne vend, ne loue et ne transfère aucune donnée utilisateur ou donnée d’appareil à des tiers. L’application n’intègre aucun SDK publicitaire, aucun outil de profilage marketing ni aucun service d’analyse tiers collectant des données personnelles.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            5. Conservation, contrôle utilisateur et suppression des données (CRUD)
          </h3>
          <p>
            Vous conservez un contrôle permanent et total sur vos données stockées localement dans ObjectBox :
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Vous pouvez consulter, modifier ou supprimer individuellement chaque dossier depuis l’onglet <strong>« Historique ObjectBox »</strong> en cliquant sur <strong>« Supprimer »</strong>.
            </li>
            <li>
              Vous pouvez ajouter, modifier, supprimer ou réinitialiser toutes les options des 15 listes de choix (69 Wilayas, entreprises d’installation agréées, caméras, DVR, communes) depuis l’onglet <strong>« Listes CRUD »</strong>.
            </li>
            <li>
              La désinstallation de l’application ou la suppression des données locales du navigateur efface immédiatement et définitivement l’intégralité de la base ObjectBox sur l’appareil.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-slate-900">
            6. Confidentialité des enfants
          </h3>
          <p>
            Cette application est un outil bureautique et administratif destiné aux professionnels et gérants d’entreprises. Elle ne s’adresse pas aux enfants de moins de 13 ans et ne collecte aucune donnée relative à des mineurs.
          </p>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="text-base font-bold text-slate-900">
            7. English Summary — Google Play User Data Policy Compliance
          </h3>
          <p>
            <strong>DRAG Oran — ObjectBox &amp; Cairo PDF</strong> processes and stores all user-entered administrative form data <strong>100% locally on the user’s device</strong> via the embedded ObjectBox database. We do not collect, transmit, or share any personal or sensitive user data with any external server or third party. Users have full CRUD control to edit or permanently delete any stored record directly within the app or by uninstalling the app.
          </p>
        </section>
      </article>
    </div>
  );
};

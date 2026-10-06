import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Database,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { objectBoxStore } from '../services/objectBoxStore';

interface AccountDeletionViewProps {
  onPurgeCompleted: () => void;
}

export const AccountDeletionView: React.FC<AccountDeletionViewProps> = ({
  onPurgeCompleted,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<'static' | 'route' | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [confirmedIrreversible, setConfirmedIrreversible] = useState<boolean>(false);
  const [deletionReceipt, setDeletionReceipt] = useState<{
    timestamp: string;
    deletedDossiers: number;
    identifier: string;
  } | null>(null);

  const baseUrl =
    typeof window !== 'undefined' && window.location.href
      ? new URL('.', window.location.href).href.replace(/\/$/, '')
      : 'https://connacri.github.io/CCTV-Autorisation';

  const staticDeleteUrl = `${baseUrl}/delete-account.html`;
  const routeDeleteUrl = `${baseUrl}/?page=delete-account`;

  const currentDossierCount = objectBoxStore.getTotalDossierCount();
  const currentCatalogCount = objectBoxStore.getAllCatalogItems().length;

  const handleCopy = async (type: 'static' | 'route', url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handlePermanentDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedIrreversible) return;

    const countBefore = objectBoxStore.getTotalDossierCount();
    objectBoxStore.purgeAllUserDataAndAccount();
    onPurgeCompleted();

    setDeletionReceipt({
      timestamp: new Date().toLocaleString('fr-FR'),
      deletedDossiers: countBefore,
      identifier: userIdentifier.trim() || 'Compte Local & Base ObjectBox Complète',
    });
    setConfirmedIrreversible(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner with Copyable Play Store Account Deletion URLs */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700">
              <ShieldAlert className="w-4 h-4" />
              <span>
                Conformité Google Play Console · Politique de suppression de compte et des données
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Suppression Définitive du Compte & des Données Utilisateur
            </h1>
            <p className="text-xs text-slate-500">
              Page officielle permettant à tout utilisateur de supprimer immédiatement et définitivement son compte ainsi que l’intégralité de ses dossiers ObjectBox.
            </p>
          </div>

          <a
            href="./delete-account.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <span>Ouvrir /delete-account.html (Page autonome)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Copyable URLs for Google Play Console Data Safety Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold text-slate-500">
                URL 1 — Page Statique de Suppression (Recommandée Google Play) :
              </span>
              <code className="text-xs font-mono-tabular text-slate-900 truncate block mt-0.5">
                {staticDeleteUrl}
              </code>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('static', staticDeleteUrl)}
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
                {routeDeleteUrl}
              </code>
            </div>
            <button
              type="button"
              onClick={() => handleCopy('route', routeDeleteUrl)}
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

        {/* Summary Metrics of Data Subject to Deletion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3.5 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-rose-700" />
              <span>Dossiers ObjectBox stockés</span>
            </div>
            <p className="text-slate-600 font-mono-tabular">
              <strong>{currentDossierCount}</strong> dossier(s) dans l’historique local
            </p>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-700" />
              <span>Listes de choix CRUD</span>
            </div>
            <p className="text-slate-600 font-mono-tabular">
              <strong>{currentCatalogCount}</strong> entrée(s) réinitialisées par défaut
            </p>
          </div>

          <div className="p-3.5 border border-slate-200 rounded-lg space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-700" />
              <span>Délai de conservation</span>
            </div>
            <p className="text-slate-600">
              <strong>0 jour</strong> (Suppression immédiate et irréversible)
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Permanent Account & Data Deletion Form */}
      <section className="bg-white border border-rose-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Formulaire de Suppression Définitive du Compte Utilisateur</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cette opération efface immédiatement votre compte, vos préférences et tous les dossiers enregistrés dans ObjectBox.
            </p>
          </div>
          <span dir="rtl" className="font-cairo font-bold text-sm text-rose-800">
            الحذف النهائي للحساب والبيانات
          </span>
        </div>

        {/* Arabic Explanation Box */}
        <div
          dir="rtl"
          className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl font-cairo space-y-1.5 text-right"
        >
          <h3 className="font-bold text-rose-950 text-base">
            تنبيه هام حول الحذف النهائي للحساب والبيانات (ObjectBox)
          </h3>
          <p className="text-slate-800 text-sm leading-relaxed">
            عند تأكيد طلب الحذف النهائي، يقوم التطبيق فوراً بمسح جميع ملفات طلبات رخص التجهيزات الحساسة المسجلة في <strong>ObjectBox</strong>، وإعادة ضبط قوائم الاختيار المخصصة، وحذف بيانات المستخدم بشكل نهائي وغير قابل للاسترجاع.
          </p>
        </div>

        {deletionReceipt && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">
                Suppression définitive du compte et des données confirmée
              </div>
              <p>
                <strong>Identifiant / Portée :</strong> {deletionReceipt.identifier}
              </p>
              <p>
                <strong>Dossiers ObjectBox purgés :</strong> {deletionReceipt.deletedDossiers} dossier(s) supprimé(s) · Formulaires vidés · 0 donnée conservée.
              </p>
              <p className="font-mono-tabular text-emerald-800">
                Horodatage : {deletionReceipt.timestamp}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handlePermanentDeletion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Identifiant du compte, Nom du demandeur ou E-mail (Optionnel)
              </label>
              <input
                type="text"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                placeholder="Ex: contact@alaman-dz.com ou بن أحمد محمد"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Motif de la suppression (Optionnel)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
              >
                <option value="">Sélectionner un motif (optionnel)...</option>
                <option value="dossier_termine">Dossier administratif DRAG déposé et terminé</option>
                <option value="changement_appareil">Changement d’appareil ou de poste de travail</option>
                <option value="confidentialite">Protection de la confidentialité des données</option>
                <option value="autre">Autre motif</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3.5 bg-rose-50/60 border border-rose-200 rounded-lg cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmedIrreversible}
              onChange={(e) => setConfirmedIrreversible(e.target.checked)}
              className="mt-0.5 rounded border-rose-300 text-rose-700 focus:ring-rose-600"
            />
            <span className="text-xs text-slate-800 leading-relaxed">
              <strong>Je confirme vouloir supprimer définitivement mon compte utilisateur et toutes mes données associées.</strong> Je comprends que cette action est immédiate, totale et irréversible, et que tous mes dossiers enregistrés dans la base ObjectBox seront définitivement effacés.
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Aucune donnée n’est conservée sur un serveur après cette action (Politique zéro rétention).
            </span>

            <button
              type="submit"
              disabled={!confirmedIrreversible}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer définitivement mon compte et toutes mes données</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

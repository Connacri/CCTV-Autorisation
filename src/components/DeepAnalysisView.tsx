import React, { useState } from 'react';
import { PDF_DEEP_ANALYSIS, PdfFieldConfig } from '../data/pdfSchema';
import { Search, ArrowUpRight } from 'lucide-react';

interface DeepAnalysisViewProps {
  fields: PdfFieldConfig[];
  values: Record<string, string>;
  onJumpToField: (page: 1 | 2 | 3, fieldId: string) => void;
}

export const DeepAnalysisView: React.FC<DeepAnalysisViewProps> = ({
  fields,
  values,
  onJumpToField,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPage, setFilterPage] = useState<'all' | 1 | 2 | 3>('all');

  const filteredFields = fields.filter((f) => {
    if (filterPage !== 'all' && f.page !== filterPage) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.labelAr.toLowerCase().includes(q) ||
      f.labelFr.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.section.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
      {/* Executive Summary Banner */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-700">
              Direction de la Réglementation et des Affaires Générales (DRAG) · Wilaya d’Oran
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Analyse Approfondie du Dossier Réglementaire (3 Pages Non Modifiées)
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono-tabular">
            <span>Format : A4 (595.28 × 841.89 pt)</span>
            <span aria-hidden="true">·</span>
            <span>49 Zones de saisie RTL/LTR</span>
            <span aria-hidden="true">·</span>
            <span className="font-cairo font-semibold text-emerald-700">Police : Cairo (خط كايرو)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              1. Autorité Émettrice & Compétence
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Formulaire officiel émis par la <strong>Wilaya d’Oran</strong>, Direction de la
              Réglementation et des Affaires Générales (<span className="font-cairo">مديرية التنظيم و الشؤون العامة</span>),
              Service de la Réglementation Générale, Bureau de la Réglementation des Armes et
              Matières Explosives, Section des Sociétés de Gardiennage et Équipements Sensibles.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              2. Architecture Juridique en 2 Étapes
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Le dossier permet d’obtenir une <strong>Autorisation d’Acquisition</strong> (<span className="font-cairo">رخصة اقتناء</span>)
              d’une validité stricte de <strong>06 mois</strong> (mentionnée en Page 1). Durant ce
              délai, le demandeur achète et installe le matériel afin de solliciter l’<strong>Autorisation d’Exploitation</strong> (<span className="font-cairo">رخصة استغلال</span>).
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              3. Contraintes Techniques Impératives
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Interdiction formelle de relier l’enregistreur vidéo (DVR/NVR) au réseau Internet
              et interdiction d’utiliser des caméras équipées de LEDs à <strong>Infrarouge (INFRAROUGE)</strong>.
              Tous les équipements relèvent de la <strong>Section ج — Sous-section 01</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Page-by-Page Deep Breakdown */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Décryptage Structurel & Réglementaire Page par Page
          </h2>
          <span className="text-xs text-slate-500">
            Cliquez sur une page pour éditer ses champs directement sur le PDF
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PDF_DEEP_ANALYSIS.map((pageInfo) => {
            const pageFields = fields.filter((f) => f.page === pageInfo.pageNumber);
            const filledCount = pageFields.filter((f) => (values[f.id] || '').trim().length > 0).length;

            return (
              <div
                key={pageInfo.pageNumber}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-900">
                      Feuillet 0{pageInfo.pageNumber} / 03
                    </span>
                    <span className="font-mono-tabular">
                      {filledCount}/{pageFields.length} champs remplis
                    </span>
                  </div>

                  <div>
                    <p
                      dir="rtl"
                      className="font-cairo font-bold text-base text-slate-900 leading-snug"
                    >
                      {pageInfo.titleAr}
                    </p>
                    <p className="text-xs font-medium text-emerald-700 mt-1">
                      {pageInfo.titleFr}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pageInfo.purposeFr}
                  </p>

                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Règles administratives & renvois :
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {pageInfo.legalNotesFr.map((note, idx) => (
                        <li key={idx} className="leading-relaxed">
                          • {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-semibold text-slate-900">
                      Topologie & Coordonnées PDF :
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {pageInfo.technicalObservations.map((obs, idx) => (
                        <li key={idx} className="leading-relaxed">
                          • {obs}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono-tabular">
                    {pageInfo.fieldCount} zones cartographiées
                  </span>
                  <button
                    onClick={() => onJumpToField(pageInfo.pageNumber, pageFields[0]?.id || '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Remplir la Page {pageInfo.pageNumber}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Complete 49-Field Coordinate Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Matrice Complète des 49 Coordonnées d’Écriture PDF (Police Cairo)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque ligne pointillée et cellule du tableau a été mesurée sur le référentiel A4 (595.28 × 841.89 pt).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Page Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 1, 2, 3] as const).map((pg) => (
                <button
                  key={String(pg)}
                  onClick={() => setFilterPage(pg)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filterPage === pg
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pg === 'all' ? 'Toutes (49)' : `Page ${pg}`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un champ (arabe / français)..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Page</th>
                <th className="py-3 px-4">Identifiant</th>
                <th className="py-3 px-4 text-right font-cairo">الحقل في الوثيقة (Arabe)</th>
                <th className="py-3 px-4">Description Française</th>
                <th className="py-3 px-4 text-right">X-Gauche (%)</th>
                <th className="py-3 px-4 text-right">X-Droite (%)</th>
                <th className="py-3 px-4 text-right">Y-Base (%)</th>
                <th className="py-3 px-4 text-right">Police Cairo</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredFields.map((field) => {
                const currentVal = values[field.id] || '';
                return (
                  <tr
                    key={field.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono-tabular font-medium text-slate-700">
                      P{field.page}
                    </td>
                    <td className="py-2.5 px-4 font-mono-tabular text-slate-500">
                      {field.id}
                    </td>
                    <td
                      dir="rtl"
                      className="py-2.5 px-4 text-right font-cairo font-semibold text-slate-900 text-sm"
                    >
                      {field.labelAr}
                      {currentVal && (
                        <div className="text-xs font-normal text-emerald-700 truncate max-w-xs">
                          ✓ {currentVal}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {field.labelFr}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-tabular text-slate-700">
                      {field.xLeft.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-tabular text-slate-700">
                      {field.xRight.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-tabular text-slate-700">
                      {field.y.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-tabular text-slate-600">
                      {field.fontSize} pt · {field.dir.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onJumpToField(field.page, field.id)}
                        className="text-emerald-700 hover:text-emerald-800 font-medium underline-offset-2 hover:underline whitespace-nowrap"
                      >
                        Éditer sur PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

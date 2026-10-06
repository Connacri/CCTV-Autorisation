import React, { useEffect, useRef, useState } from 'react';
import {
  DossierSubmissionEntity,
  objectBoxStore,
} from '../services/objectBoxStore';
import { Translations } from '../i18n/translations';
import {
  Search,
  Database,
  ArrowUpRight,
  Copy,
  Trash2,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';

interface ObjectBoxHistoryViewProps {
  t: Translations;
  activeDossierId: number | null;
  onLoadDossier: (dossier: DossierSubmissionEntity) => void;
  onSaveCurrentToObjectBox: () => void;
  refreshTrigger: number;
}

export const ObjectBoxHistoryView: React.FC<ObjectBoxHistoryViewProps> = ({
  t,
  activeDossierId,
  onLoadDossier,
  onSaveCurrentToObjectBox,
  refreshTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState<number>(3);
  const [loadedItems, setLoadedItems] = useState<DossierSubmissionEntity[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial or filtered query (offset = 0)
  const runInitialLazyQuery = (queryStr: string, limit: number) => {
    const res = objectBoxStore.queryDossiersLazy({
      offset: 0,
      limit,
      search: queryStr,
    });
    setLoadedItems(res.items);
    setTotalCount(res.totalCount);
    setHasMore(res.hasMore);
  };

  useEffect(() => {
    runInitialLazyQuery(searchQuery, pageSize);
  }, [searchQuery, pageSize, refreshTrigger]);

  // Load next chunk from ObjectBox
  const handleLoadMore = () => {
    if (!hasMore) return;
    const res = objectBoxStore.queryDossiersLazy({
      offset: loadedItems.length,
      limit: pageSize,
      search: searchQuery,
    });
    setLoadedItems((prev) => [...prev, ...res.items]);
    setTotalCount(res.totalCount);
    setHasMore(res.hasMore);
  };

  // IntersectionObserver for automatic infinite scroll Lazy List
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadedItems.length, pageSize, searchQuery]);

  const handleDuplicate = (dossier: DossierSubmissionEntity) => {
    objectBoxStore.putDossier({
      values: {
        ...dossier.values,
        p1_applicant_name: `${dossier.applicantName} (نسخة)`,
        p2_identity: `${dossier.applicantName} (نسخة)`,
        p3_identity: `${dossier.applicantName} (نسخة)`,
      },
      marketStrike: dossier.marketStrike,
    });
    runInitialLazyQuery(searchQuery, Math.max(pageSize, loadedItems.length + 1));
  };

  const handleDelete = (id: number) => {
    objectBoxStore.removeDossier(id);
    runInitialLazyQuery(searchQuery, Math.max(pageSize, loadedItems.length));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Database className="w-3.5 h-3.5" />
              <span>Box&lt;DossierSubmissionEntity&gt; · ObjectBox Store</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.historyTitle}
            </h1>
            <p className="text-xs text-slate-500">{t.historySubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSaveCurrentToObjectBox}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.saveToObjectBox}</span>
            </button>
          </div>
        </div>

        {/* Search & Lazy Pagination Batch Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchHistoryPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono-tabular">
            <span>
              {loadedItems.length} {t.lazyLoadedCount} {totalCount}
            </span>
            <span aria-hidden="true">·</span>
            <label className="inline-flex items-center gap-1.5">
              <span>Batch (limit) :</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 rounded px-2 py-1 bg-white text-slate-800"
              >
                <option value={2}>2 / page</option>
                <option value={3}>3 / page</option>
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Lazy List Records */}
      {loadedItems.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">
            {t.emptyHistoryTitle}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t.emptyHistoryDesc}
          </p>
          <button
            onClick={onSaveCurrentToObjectBox}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.saveToObjectBox}</span>
          </button>
        </section>
      ) : (
        <section className="space-y-3">
          {loadedItems.map((dossier) => {
            const isCurrent = activeDossierId === dossier.id;
            const formattedDate = new Date(dossier.updatedAt).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={dossier.id}
                className={`bg-white border rounded-xl p-5 transition-colors ${
                  isCurrent
                    ? 'border-emerald-600 ring-1 ring-emerald-600/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Right-to-Left Arabic Summary + Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                      <span className="font-semibold text-slate-800">
                        ObjectBox ID #{dossier.id}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formattedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Total Équipements : {dossier.totalQty} unités (Section ج / 01)
                      </span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-sans font-semibold">
                            ✓ Actif dans l’éditeur
                          </span>
                        </>
                      )}
                    </div>

                    <div dir="rtl" className="space-y-1 text-right">
                      <h2 className="font-cairo font-bold text-base sm:text-lg text-slate-900">
                        {dossier.applicantName}
                      </h2>
                      <p className="font-cairo text-xs sm:text-sm text-slate-700">
                        <span className="text-slate-500">عنوان التركيب : </span>
                        {dossier.installationAddress}
                      </p>
                      <p className="font-cairo text-xs text-emerald-800">
                        <span className="text-slate-500">المؤسسة المعتمدة للتركيب : </span>
                        {dossier.installerCompany}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                    <button
                      onClick={() => onLoadDossier(dossier)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span>{t.loadIntoPdf}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(dossier)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t.duplicateDossier}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(dossier.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.deleteDossier}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Lazy Loading Sentinel & Explicit Button */}
          <div
            ref={sentinelRef}
            className="py-4 flex flex-col items-center justify-center gap-2"
          >
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                <ChevronDown className="w-4 h-4" />
                <span>
                  {t.loadMoreLazy} ({loadedItems.length} / {totalCount})
                </span>
              </button>
            ) : (
              <p className="text-xs text-slate-400 font-mono-tabular">
                {t.allHistoryLoaded} ({totalCount} / {totalCount})
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

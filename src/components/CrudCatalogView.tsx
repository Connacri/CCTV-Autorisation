import React, { useState } from 'react';
import {
  CATALOG_CATEGORIES,
  CatalogCategoryKey,
} from '../data/pdfSchema';
import {
  ChoiceCatalogItemEntity,
  objectBoxStore,
} from '../services/objectBoxStore';
import { Translations } from '../i18n/translations';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Database,
} from 'lucide-react';

interface CrudCatalogViewProps {
  t: Translations;
  initialCategory?: CatalogCategoryKey;
  catalogItems: ChoiceCatalogItemEntity[];
  onRefreshCatalog: () => void;
  onApplyChoiceToForm?: (categoryKey: CatalogCategoryKey, valueAr: string) => void;
}

export const CrudCatalogView: React.FC<CrudCatalogViewProps> = ({
  t,
  initialCategory = 'installer_company',
  catalogItems,
  onRefreshCatalog,
  onApplyChoiceToForm,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CatalogCategoryKey>(initialCategory);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [valueArInput, setValueArInput] = useState<string>('');
  const [noteFrInput, setNoteFrInput] = useState<string>('');

  const activeCategoryMeta =
    CATALOG_CATEGORIES.find((c) => c.key === selectedCategory) ||
    CATALOG_CATEGORIES[0];

  const categoryItems = catalogItems.filter(
    (item) => item.categoryKey === selectedCategory
  );

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueArInput.trim()) return;

    objectBoxStore.putChoice({
      id: editingItemId || undefined,
      categoryKey: selectedCategory,
      valueAr: valueArInput,
      noteFr: noteFrInput,
    });

    setValueArInput('');
    setNoteFrInput('');
    setEditingItemId(null);
    onRefreshCatalog();
  };

  const handleStartEdit = (item: ChoiceCatalogItemEntity) => {
    setEditingItemId(item.id);
    setValueArInput(item.valueAr);
    setNoteFrInput(item.noteFr);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setValueArInput('');
    setNoteFrInput('');
  };

  const handleDeleteItem = (id: number) => {
    objectBoxStore.removeChoice(id);
    if (editingItemId === id) {
      handleCancelEdit();
    }
    onRefreshCatalog();
  };

  const handleResetAll = () => {
    objectBoxStore.resetDefaultCatalog();
    handleCancelEdit();
    onRefreshCatalog();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Database className="w-3.5 h-3.5" />
              <span>Box&lt;ChoiceCatalogItemEntity&gt; · 14 Listes de Choix CRUD</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t.crudModalTitle}
            </h1>
            <p className="text-xs text-slate-500">{t.crudModalSubtitle}</p>
          </div>

          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.btnResetCatalog}</span>
          </button>
        </div>

        {/* Layout: 14 Categories Sidebar + Active Category CRUD Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: 14 Category Selector List */}
          <div className="lg:col-span-4 space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {CATALOG_CATEGORIES.map((cat) => {
              const count = catalogItems.filter((i) => i.categoryKey === cat.key).length;
              const isSelected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    handleCancelEdit();
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      dir="rtl"
                      className="font-cairo font-bold text-xs text-slate-900 truncate text-right"
                    >
                      {cat.titleAr}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {cat.titleFr}
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-emerald-700 shrink-0">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Category CRUD Editor & Items List */}
          <div className="lg:col-span-8 space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeCategoryMeta.titleFr}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {activeCategoryMeta.descriptionFr}
                  </p>
                </div>
                <span
                  dir="rtl"
                  className="font-cairo font-bold text-sm text-emerald-800"
                >
                  {activeCategoryMeta.titleAr}
                </span>
              </div>

              {/* Create / Update Form */}
              <form onSubmit={handleSaveItem} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Valeur en Arabe (écrite sur le PDF avec la police Cairo) :
                  </label>
                  <textarea
                    dir="rtl"
                    rows={2}
                    value={valueArInput}
                    onChange={(e) => setValueArInput(e.target.value)}
                    placeholder={t.addChoicePlaceholderAr}
                    className="w-full px-3 py-2 text-sm font-cairo font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={noteFrInput}
                    onChange={(e) => setNoteFrInput(e.target.value)}
                    placeholder={t.addChoicePlaceholderFr}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    {editingItemId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {t.btnCancelEdit}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {editingItemId ? t.btnUpdateChoice : t.btnAddChoice}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Items Table for Selected Category */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold">
                  Options enregistrées dans ObjectBox ({categoryItems.length})
                </span>
                <span className="font-mono-tabular">
                  categoryKey = &quot;{selectedCategory}&quot;
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p
                        dir="rtl"
                        className="font-cairo font-bold text-sm text-slate-900 whitespace-pre-line text-right"
                      >
                        {item.valueAr}
                      </p>
                      <p className="text-xs text-slate-500">
                        <span className="font-mono-tabular text-slate-400">
                          #{item.id}
                        </span>{' '}
                        · {item.noteFr}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {onApplyChoiceToForm && (
                        <button
                          onClick={() =>
                            onApplyChoiceToForm(item.categoryKey, item.valueAr)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors whitespace-nowrap"
                          title="Utiliser cette valeur dans le formulaire PDF"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Injecter dans PDF</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

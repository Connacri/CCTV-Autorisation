import React, { useState } from 'react';
import { PdfFieldConfig } from '../data/pdfSchema';
import { ChoiceCatalogItemEntity } from '../services/objectBoxStore';
import { RenderOverlayOptions } from '../utils/pdfTemplateRenderer';
import {
  generateFlutterMainDart,
  generateFlutterObjectBoxEntities,
  generateFlutterPubspec,
} from '../utils/flutterCodeGenerator';
import { Check, Copy, Download } from 'lucide-react';

interface FlutterCodeViewProps {
  fields: PdfFieldConfig[];
  values: Record<string, string>;
  options: RenderOverlayOptions;
  catalogItems: ChoiceCatalogItemEntity[];
}

export const FlutterCodeView: React.FC<FlutterCodeViewProps> = ({
  fields,
  values,
  options,
  catalogItems,
}) => {
  const [activeFile, setActiveFile] = useState<
    'main.dart' | 'objectbox_entities.dart' | 'pubspec.yaml'
  >('main.dart');
  const [copied, setCopied] = useState(false);

  const mainDartCode = generateFlutterMainDart(fields, values, options);
  const entitiesDartCode = generateFlutterObjectBoxEntities(catalogItems);
  const pubspecCode = generateFlutterPubspec();

  const displayedCode =
    activeFile === 'main.dart'
      ? mainDartCode
      : activeFile === 'objectbox_entities.dart'
      ? entitiesDartCode
      : pubspecCode;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-700">
              Flutter Multiplateforme · ObjectBox NoSQL · Police Cairo RTL
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Code Complet Flutter & ObjectBox (Historique Lazy List + 14 Listes CRUD)
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleDownloadFile('pubspec.yaml', pubspecCode)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>pubspec.yaml</span>
            </button>
            <button
              onClick={() =>
                handleDownloadFile('objectbox_entities.dart', entitiesDartCode)
              }
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>lib/models/objectbox_entities.dart</span>
            </button>
            <button
              onClick={() => handleDownloadFile('main.dart', mainDartCode)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>lib/main.dart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              1. Entités ObjectBox & Lazy List
            </h2>
            <p className="mt-1 leading-relaxed">
              Inclut <code className="font-mono-tabular text-slate-800">@Entity() class DossierSubmissionEntity</code> et{' '}
              <code className="font-mono-tabular text-slate-800">ChoiceCatalogItemEntity</code> avec requêtes paginées{' '}
              <code className="font-mono-tabular text-slate-800">..offset = offset ..limit = limit</code> et chargement infini via{' '}
              <code className="font-mono-tabular text-slate-800">ScrollController</code>.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              2. 14 Listes de Choix CRUD intégrées
            </h2>
            <p className="mt-1 leading-relaxed">
              Chaque champ catalogué (Entreprise d’installation agréée, Caméras, DVR, Communes, Transport, Sécurité) dispose d’un{' '}
              <code className="font-mono-tabular text-slate-800">DropdownButtonFormField</code> relié à ObjectBox et d’une boîte de dialogue CRUD complète.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              3. Quantités du Tableau PDF Centrées
            </h2>
            <p className="mt-1 leading-relaxed">
              Les coordonnées verticales <code className="font-mono-tabular text-slate-800">yPct</code> des 4 quantités de la Page 3 (<code className="font-mono-tabular text-slate-800">58.4%</code>, <code className="font-mono-tabular text-slate-800">64.6%</code>, <code className="font-mono-tabular text-slate-800">69.0%</code>, <code className="font-mono-tabular text-slate-800">71.9%</code>) sont parfaitement centrées dans chaque case.
            </p>
          </div>
        </div>
      </section>

      {/* Code Viewer */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFile('main.dart')}
              className={`px-3 py-1.5 text-xs font-mono-tabular rounded-md transition-colors ${
                activeFile === 'main.dart'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              lib/main.dart
            </button>
            <button
              onClick={() => setActiveFile('objectbox_entities.dart')}
              className={`px-3 py-1.5 text-xs font-mono-tabular rounded-md transition-colors ${
                activeFile === 'objectbox_entities.dart'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              lib/models/objectbox_entities.dart ({catalogItems.length} options CRUD)
            </button>
            <button
              onClick={() => setActiveFile('pubspec.yaml')}
              className={`px-3 py-1.5 text-xs font-mono-tabular rounded-md transition-colors ${
                activeFile === 'pubspec.yaml'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              pubspec.yaml
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier {activeFile}</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono-tabular leading-relaxed overflow-x-auto max-h-[680px] text-slate-200">
          <code>{displayedCode}</code>
        </pre>
      </section>
    </div>
  );
};

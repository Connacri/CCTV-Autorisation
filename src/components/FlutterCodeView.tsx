import React, { useState } from 'react';
import { PdfFieldConfig } from '../data/pdfSchema';
import { ChoiceCatalogItemEntity } from '../services/objectBoxStore';
import { RenderOverlayOptions } from '../utils/pdfTemplateRenderer';
import {
  generateFlutterMainDart,
  generateFlutterObjectBoxEntities,
  generateFlutterPubspec,
  generateGithubActionsWorkflow,
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
    'main.dart' | 'objectbox_entities.dart' | 'pubspec.yaml' | 'release.yml'
  >('main.dart');
  const [copied, setCopied] = useState(false);

  const mainDartCode = generateFlutterMainDart(fields, values, options);
  const entitiesDartCode = generateFlutterObjectBoxEntities(catalogItems);
  const pubspecCode = generateFlutterPubspec();
  const releaseYmlCode = generateGithubActionsWorkflow();

  const displayedCode =
    activeFile === 'main.dart'
      ? mainDartCode
      : activeFile === 'objectbox_entities.dart'
      ? entitiesDartCode
      : activeFile === 'pubspec.yaml'
      ? pubspecCode
      : releaseYmlCode;

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-700 break-words">
              Flutter Multiplateforme · ObjectBox NoSQL (69 Wilayas) · GitHub Actions Releases
            </p>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
              Code Complet Flutter, ObjectBox & CI/CD GitHub Releases
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => handleDownloadFile('release.yml', releaseYmlCode)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors truncate"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">.github/workflows/release.yml</span>
            </button>
            <button
              onClick={() => handleDownloadFile('pubspec.yaml', pubspecCode)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors truncate"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">pubspec.yaml</span>
            </button>
            <button
              onClick={() =>
                handleDownloadFile('objectbox_entities.dart', entitiesDartCode)
              }
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors truncate"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">objectbox_entities.dart</span>
            </button>
            <button
              onClick={() => handleDownloadFile('main.dart', mainDartCode)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors truncate"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">lib/main.dart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs text-slate-600">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              1. 69 Wilayas & 15 Listes CRUD ObjectBox
            </h2>
            <p className="mt-1 leading-relaxed break-words">
              L’en-tête <code className="font-mono-tabular text-slate-800">ولاية ...</code> sur les 3 pages est lié à la liste ObjectBox des 69 Wilayas d’Algérie (plus ajout CRUD) et tous les champs sont centrés.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              2. Règles de Confidentialité Play Store intégrées
            </h2>
            <p className="mt-1 leading-relaxed break-words">
              Inclut l’écran <code className="font-mono-tabular text-slate-800">PrivacyPolicyScreen</code> dans <code className="font-mono-tabular text-slate-800">lib/main.dart</code> ainsi que la page publique autonome <code className="font-mono-tabular text-slate-800">/privacy.html</code>.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              3. Releases Versionnées via GitHub Actions
            </h2>
            <p className="mt-1 leading-relaxed break-words">
              Le workflow <code className="font-mono-tabular text-slate-800">.github/workflows/release.yml</code> signe l’APK/AAB, déploie sur GitHub Pages et publie automatiquement la release versionnée (<code className="font-mono-tabular text-slate-800">v1.0.x</code>).
            </p>
          </div>
        </div>
      </section>

      {/* Code Viewer */}
      <section className="w-full max-w-full min-w-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-1.5 w-full sm:w-auto min-w-0">
            <button
              onClick={() => setActiveFile('main.dart')}
              className={`px-2.5 py-1.5 text-xs font-mono-tabular rounded-md transition-colors truncate text-left sm:text-center ${
                activeFile === 'main.dart'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              lib/main.dart ({fields.length} champs)
            </button>
            <button
              onClick={() => setActiveFile('objectbox_entities.dart')}
              className={`px-2.5 py-1.5 text-xs font-mono-tabular rounded-md transition-colors truncate text-left sm:text-center ${
                activeFile === 'objectbox_entities.dart'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              objectbox_entities.dart ({catalogItems.length} CRUD)
            </button>
            <button
              onClick={() => setActiveFile('pubspec.yaml')}
              className={`px-2.5 py-1.5 text-xs font-mono-tabular rounded-md transition-colors truncate text-left sm:text-center ${
                activeFile === 'pubspec.yaml'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              pubspec.yaml
            </button>
            <button
              onClick={() => setActiveFile('release.yml')}
              className={`px-2.5 py-1.5 text-xs font-mono-tabular rounded-md transition-colors truncate text-left sm:text-center ${
                activeFile === 'release.yml'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              .github/workflows/release.yml
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap w-full sm:w-auto shrink-0"
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

        <pre className="p-3.5 sm:p-5 text-[11px] sm:text-xs font-mono-tabular leading-relaxed overflow-x-auto w-full max-w-full max-h-[600px] text-slate-200">
          <code>{displayedCode}</code>
        </pre>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { PdfFieldConfig } from '../data/pdfSchema';
import { RenderOverlayOptions } from '../utils/pdfTemplateRenderer';
import {
  generateFlutterMainDart,
  generateFlutterPubspec,
} from '../utils/flutterCodeGenerator';
import { Check, Copy, Download } from 'lucide-react';

interface FlutterCodeViewProps {
  fields: PdfFieldConfig[];
  values: Record<string, string>;
  options: RenderOverlayOptions;
}

export const FlutterCodeView: React.FC<FlutterCodeViewProps> = ({
  fields,
  values,
  options,
}) => {
  const [activeFile, setActiveFile] = useState<'main.dart' | 'pubspec.yaml'>('main.dart');
  const [copied, setCopied] = useState(false);

  const mainDartCode = generateFlutterMainDart(fields, values, options);
  const pubspecCode = generateFlutterPubspec();
  const displayedCode = activeFile === 'main.dart' ? mainDartCode : pubspecCode;

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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium text-emerald-700">
              Multiplateforme : Flutter Web · Android · iOS · Windows · macOS
            </p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Code Source Complet Flutter & Dart (Police Cairo + Écriture Directe sur PDF)
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadFile('pubspec.yaml', pubspecCode)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger pubspec.yaml</span>
            </button>
            <button
              onClick={() => handleDownloadFile('main.dart', mainDartCode)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger lib/main.dart</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              1. Zéro modification du PDF original
            </h2>
            <p className="mt-1 leading-relaxed">
              Le code utilise <code className="font-mono-tabular text-slate-800">PdfDocument(inputBytes: _originalPdfBytes)</code> de{' '}
              <code className="font-mono-tabular text-slate-800">syncfusion_flutter_pdf</code> pour ouvrir votre PDF de 3 pages intact et dessiner uniquement les textes arabes aux coordonnées exactes.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              2. Police Cairo TrueType & RTL Arabe
            </h2>
            <p className="mt-1 leading-relaxed">
              Intègre <code className="font-mono-tabular text-slate-800">Cairo-SemiBold.ttf</code> via{' '}
              <code className="font-mono-tabular text-slate-800">PdfTrueTypeFont</code> et configure{' '}
              <code className="font-mono-tabular text-slate-800">PdfTextDirection.rightToLeft</code> pour garantir la liaison parfaite des lettres arabes dans chaque case.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">
              3. Synchronisé avec vos saisies actuelles
            </h2>
            <p className="mt-1 leading-relaxed">
              Les 49 coordonnées <code className="font-mono-tabular text-slate-800">(xLeftPct, xRightPct, yPct)</code> et les valeurs que vous avez saisies dans l’éditeur Web sont automatiquement injectées dans le code ci-dessous.
            </p>
          </div>
        </div>
      </section>

      {/* Code Viewer */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFile('main.dart')}
              className={`px-3 py-1.5 text-xs font-mono-tabular rounded-md transition-colors ${
                activeFile === 'main.dart'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              lib/main.dart (49 champs Cairo RTL)
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
                <span className="text-emerald-400">Copié dans le presse-papiers</span>
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

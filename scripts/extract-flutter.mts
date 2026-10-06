import { writeFileSync, mkdirSync } from 'node:fs';
import { INITIAL_PDF_FIELDS, SAMPLE_ARABIC_VALUES } from '../src/data/pdfSchema';
import { RenderOverlayOptions } from '../src/utils/pdfTemplateRenderer';
import {
  generateFlutterMainDart,
  generateFlutterObjectBoxEntities,
  generateFlutterPubspec,
} from '../src/utils/flutterCodeGenerator';

// Minimal localStorage shim so the ObjectBox store can seed its defaults in Node
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
};

const { objectBoxStore } = await import('../src/services/objectBoxStore');
const catalogItems = objectBoxStore.getAllCatalogItems();

const options: RenderOverlayOptions = {
  inkColor: '#0f172a',
  fontWeight: '600',
  globalOffsetX: 0,
  globalOffsetY: 0,
  fontSizeScale: 1.0,
  marketStrike: 'strike_external',
};

mkdirSync('flutter_app/lib', { recursive: true });
writeFileSync('flutter_app/pubspec.yaml', generateFlutterPubspec());
writeFileSync(
  'flutter_app/lib/main.dart',
  generateFlutterMainDart(INITIAL_PDF_FIELDS, SAMPLE_ARABIC_VALUES, options)
);
writeFileSync(
  'flutter_app/lib/models/objectbox_entities.dart',
  generateFlutterObjectBoxEntities(catalogItems)
    .replace(`import 'package:objectbox/objectbox.dart';\n`, '')
    .replace(`import 'objectbox.g.dart';`, `import '../objectbox.g.dart';`)
);
console.log('flutter_app sources regenerated');

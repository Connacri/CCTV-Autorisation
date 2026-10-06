import { PdfFieldConfig } from '../data/pdfSchema';
import { ChoiceCatalogItemEntity } from '../services/objectBoxStore';
import { RenderOverlayOptions } from './pdfTemplateRenderer';

export function generateFlutterPubspec(): string {
  return `name: oran_drag_pdf_objectbox
description: Application Flutter (Web, Android, iOS, Desktop) avec ObjectBox (Historique Lazy List + 15 Listes CRUD dont 69 Wilayas) et remplissage PDF Arabe en police Cairo.
publish_to: 'none'
version: 1.2.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # Base de données locale ultra-rapide ObjectBox (Historique Lazy List + Listes de choix CRUD)
  objectbox: ^4.0.3
  objectbox_flutter_libs: ^4.0.3
  path_provider: ^2.1.5
  path: ^1.9.0
  # Écriture directe sur le PDF officiel sans modifier sa structure
  syncfusion_flutter_pdf: ^27.1.58
  # Aperçu et impression multiplateforme
  printing: ^5.13.4
  # Police Cairo pour l'interface et le rendu PDF Arabe RTL
  google_fonts: ^6.2.1
  file_picker: ^8.1.4

dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.13
  objectbox_generator: ^4.0.3

flutter:
  uses-material-design: true
  assets:
    - assets/formulaire_oran.pdf
    - assets/fonts/Cairo-Regular.ttf
    - assets/fonts/Cairo-SemiBold.ttf
`;
}

export function generateGithubActionsWorkflow(): string {
  return `name: CI/CD — Build, Sign, Deploy Pages & Publish Versioned Release

on:
  push:
    branches:
      - main
    tags:
      - 'v*.*.*'
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-web:
    name: Build & Validate Web (React + Cairo PDF + ObjectBox)
    runs-on: ubuntu-latest
    outputs:
      release_tag: \${{ steps.version.outputs.tag }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install --legacy-peer-deps
      - run: npm run lint
      - run: npm run build
      - name: Package web-build.zip
        run: |
          cd dist && zip -r ../web-build.zip . && cd ..
      - name: Compute semantic version tag
        id: version
        run: |
          if [[ "\${GITHUB_REF}" == refs/tags/v* ]]; then
            TAG="\${GITHUB_REF#refs/tags/}"
          else
            COUNT=\$(git rev-list --count HEAD 2>/dev/null || echo "1")
            TAG="v1.0.\${COUNT}"
          fi
          echo "tag=\${TAG}" >> "\$GITHUB_OUTPUT"
      - uses: actions/upload-artifact@v4
        with:
          name: web-release-bundle
          path: web-build.zip
      - if: github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v5
      - if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy-pages:
    needs: build-web
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4

  build-android:
    name: Build & Sign Android Release (APK & AAB)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
          cache: true
      - run: |
          flutter pub get
          dart run build_runner build --delete-conflicting-outputs
      - name: Reconstruct temporary Android Keystore from GitHub Secrets
        if: env.KEYSTORE_BASE64 != ''
        env:
          KEYSTORE_BASE64: \${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: \${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: \${{ secrets.KEY_PASSWORD }}
        run: |
          mkdir -p android/app
          echo "\${KEYSTORE_BASE64}" | base64 --decode > android/app/release-keystore.jks
          cat <<EOF > android/key.properties
          storePassword=\${KEYSTORE_PASSWORD}
          keyPassword=\${KEY_PASSWORD}
          keyAlias=\${KEY_ALIAS}
          storeFile=release-keystore.jks
          EOF
      - name: Build Signed APK & AAB
        run: |
          flutter build apk --release
          flutter build appbundle --release
          cp build/app/outputs/flutter-apk/app-release.apk ./app-release.apk
          cp build/app/outputs/bundle/release/app-release.aab ./app-release.aab
      - name: Remove temporary sensitive keystore files
        if: always()
        run: rm -f android/app/release-keystore.jks android/key.properties
      - uses: actions/upload-artifact@v4
        with:
          name: android-release-bundles
          path: |
            app-release.apk
            app-release.aab

  publish-release:
    needs: [build-web, build-android]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: release-assets
          merge-multiple: true
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ needs.build-web.outputs.release_tag }}
          name: "Release \${{ needs.build-web.outputs.release_tag }}"
          generate_release_notes: true
          files: |
            release-assets/web-build.zip
            release-assets/app-release.apk
            release-assets/app-release.aab
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

export function generateFlutterObjectBoxEntities(
  catalogItems: ChoiceCatalogItemEntity[]
): string {
  const seedItemsDart = catalogItems
    .map(
      (item) => `  ChoiceCatalogItemEntity(
    categoryKey: '${item.categoryKey}',
    valueAr: '${item.valueAr.replace(/'/g, "\\'").replace(/\n/g, '\\n')}',
    noteFr: '${item.noteFr.replace(/'/g, "\\'")}',
  )`
    )
    .join(',\n');

  return `import 'dart:convert';
import 'package:objectbox/objectbox.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'objectbox.g.dart'; // Généré par : dart run build_runner build

/// Entité ObjectBox 1 : Historique complet de chaque dossier PDF rempli
@Entity()
class DossierSubmissionEntity {
  @Id()
  int id = 0;

  @Index()
  String wilaya;

  @Index()
  String applicantName;

  String companyName;
  String installationAddress;
  String installerCompany;
  String totalQty;
  bool strikeExternalMarket;

  /// JSON contenant les 52 valeurs des champs du PDF
  String fieldsJson;

  @Property(type: PropertyType.date)
  @Index()
  DateTime updatedAt;

  DossierSubmissionEntity({
    this.id = 0,
    this.wilaya = 'ولاية وهران',
    required this.applicantName,
    required this.companyName,
    required this.installationAddress,
    required this.installerCompany,
    required this.totalQty,
    this.strikeExternalMarket = true,
    required this.fieldsJson,
    DateTime? updatedAt,
  }) : updatedAt = updatedAt ?? DateTime.now();

  Map<String, String> get decodedFields {
    final Map<String, dynamic> raw = jsonDecode(fieldsJson);
    return raw.map((k, v) => MapEntry(k, v.toString()));
  }
}

/// Entité ObjectBox 2 : Élément de liste de choix CRUD (69 Wilayas, Entreprises, Caméras, DVR, Communes...)
@Entity()
class ChoiceCatalogItemEntity {
  @Id()
  int id = 0;

  @Index()
  String categoryKey;

  String valueAr;
  String noteFr;

  ChoiceCatalogItemEntity({
    this.id = 0,
    required this.categoryKey,
    required this.valueAr,
    required this.noteFr,
  });
}

/// Service ObjectBox gérant la pagination Lazy List de l'historique et le CRUD des 15 listes de choix
class ObjectBoxService {
  late final Store store;
  late final Box<DossierSubmissionEntity> dossierBox;
  late final Box<ChoiceCatalogItemEntity> catalogBox;

  ObjectBoxService._create(this.store) {
    dossierBox = Box<DossierSubmissionEntity>(store);
    catalogBox = Box<ChoiceCatalogItemEntity>(store);
    _seedInitialCatalogIfEmpty();
  }

  static Future<ObjectBoxService> init() async {
    final docsDir = await getApplicationDocumentsDirectory();
    final store = await openStore(directory: p.join(docsDir.path, 'oran_drag_obx'));
    return ObjectBoxService._create(store);
  }

  /// Requête paginée (Lazy List) avec offset, limit et recherche indexée
  List<DossierSubmissionEntity> getDossiersLazy({
    required int offset,
    required int limit,
    String search = '',
  }) {
    final q = search.trim();
    final Condition<DossierSubmissionEntity>? condition = q.isEmpty
        ? null
        : DossierSubmissionEntity_.applicantName.contains(q, caseSensitive: false)
            .or(DossierSubmissionEntity_.wilaya.contains(q, caseSensitive: false))
            .or(DossierSubmissionEntity_.companyName.contains(q, caseSensitive: false))
            .or(DossierSubmissionEntity_.installationAddress.contains(q, caseSensitive: false))
            .or(DossierSubmissionEntity_.installerCompany.contains(q, caseSensitive: false));

    final query = dossierBox
        .query(condition)
        .order(DossierSubmissionEntity_.updatedAt, flags: Order.descending)
        .build()
      ..offset = offset
      ..limit = limit;

    final results = query.find();
    query.close();
    return results;
  }

  int countDossiers({String search = ''}) {
    final q = search.trim();
    if (q.isEmpty) return dossierBox.count();
    final query = dossierBox
        .query(
          DossierSubmissionEntity_.applicantName.contains(q, caseSensitive: false)
              .or(DossierSubmissionEntity_.wilaya.contains(q, caseSensitive: false))
              .or(DossierSubmissionEntity_.companyName.contains(q, caseSensitive: false)),
        )
        .build();
    final count = query.count();
    query.close();
    return count;
  }

  int saveDossier(DossierSubmissionEntity dossier) {
    dossier.updatedAt = DateTime.now();
    return dossierBox.put(dossier);
  }

  bool deleteDossier(int id) => dossierBox.remove(id);

  /// CRUD Listes de choix par catégorie (69 Wilayas, Installateurs, Caméras, DVR...)
  List<ChoiceCatalogItemEntity> getChoicesByCategory(String categoryKey) {
    final query = catalogBox
        .query(ChoiceCatalogItemEntity_.categoryKey.equals(categoryKey))
        .build();
    final items = query.find();
    query.close();
    return items;
  }

  int saveChoice(ChoiceCatalogItemEntity item) => catalogBox.put(item);

  bool deleteChoice(int id) => catalogBox.remove(id);

  void _seedInitialCatalogIfEmpty() {
    if (catalogBox.isEmpty()) {
      catalogBox.putMany([
${seedItemsDart}
      ]);
    }
  }
}
`;
}

export function generateFlutterMainDart(
  fields: PdfFieldConfig[],
  values: Record<string, string>,
  options: RenderOverlayOptions
): string {
  const fieldsDartArray = fields
    .map((f) => {
      const val = (values[f.id] || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
      const xL = (f.xLeft + options.globalOffsetX).toFixed(2);
      const xR = (f.xRight + options.globalOffsetX).toFixed(2);
      const y = (f.y + options.globalOffsetY).toFixed(2);
      const fs = (f.fontSize * options.fontSizeScale).toFixed(1);
      return `  PdfFieldCoord(
    id: '${f.id}',
    page: ${f.page},
    section: '${f.section.replace(/'/g, "\\'")}',
    labelAr: '${f.labelAr.replace(/'/g, "\\'")}',
    labelFr: '${f.labelFr.replace(/'/g, "\\'")}',
    xLeftPct: ${xL},
    xRightPct: ${xR},
    yPct: ${y},
    fontSize: ${fs},
    align: '${f.align}',
    isRtl: ${f.dir === 'rtl'},
    multiline: ${Boolean(f.multiline)},
    maskBackground: ${Boolean(f.maskBackground)},
    syncKey: ${f.syncKey ? `'${f.syncKey}'` : 'null'},
    catalogCategory: ${f.catalogCategory ? `'${f.catalogCategory}'` : 'null'},
    initialValue: '${val}',
  )`;
    })
    .join(',\n');

  return `import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:google_fonts/google_fonts.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:file_picker/file_picker.dart';
import 'models/objectbox_entities.dart';

late ObjectBoxService objectBox;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  objectBox = await ObjectBoxService.init();
  runApp(const OranDragPdfFillerApp());
}

class OranDragPdfFillerApp extends StatelessWidget {
  const OranDragPdfFillerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DRAG Wilaya — ObjectBox & Cairo PDF',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF047857),
          brightness: Brightness.light,
        ),
        textTheme: GoogleFonts.cairoTextTheme(),
        useMaterial3: true,
      ),
      home: const PdfFormWorkspaceScreen(),
    );
  }
}

/// Coordonnées exactes en % de la page A4 + catégorie ObjectBox CRUD associée
class PdfFieldCoord {
  final String id;
  final int page;
  final String section;
  final String labelAr;
  final String labelFr;
  final double xLeftPct;
  final double xRightPct;
  final double yPct;
  final double fontSize;
  final String align;
  final bool isRtl;
  final bool multiline;
  final bool maskBackground;
  final String? syncKey;
  final String? catalogCategory;
  final String initialValue;

  const PdfFieldCoord({
    required this.id,
    required this.page,
    required this.section,
    required this.labelAr,
    required this.labelFr,
    required this.xLeftPct,
    required this.xRightPct,
    required this.yPct,
    required this.fontSize,
    required this.align,
    required this.isRtl,
    this.multiline = false,
    this.maskBackground = false,
    this.syncKey,
    this.catalogCategory,
    this.initialValue = '',
  });
}

/// Les 52 champs cartographiés sur les 3 pages (Tous centrés, 69 Wilayas dynamiques, quantités centrées)
const List<PdfFieldCoord> kOranPdfFields = [
${fieldsDartArray}
];

class PdfFormWorkspaceScreen extends StatefulWidget {
  const PdfFormWorkspaceScreen({super.key});

  @override
  State<PdfFormWorkspaceScreen> createState() => _PdfFormWorkspaceScreenState();
}

class _PdfFormWorkspaceScreenState extends State<PdfFormWorkspaceScreen> {
  final Map<String, TextEditingController> _controllers = {};
  Uint8List? _originalPdfBytes;
  Uint8List? _cairoFontBytes;
  int _selectedPage = 1;
  int? _activeDossierId;
  bool _autoSyncFields = true;
  bool _strikeExternalMarket = ${options.marketStrike === 'strike_external'};

  @override
  void initState() {
    super.initState();
    for (final field in kOranPdfFields) {
      _controllers[field.id] = TextEditingController(text: field.initialValue);
    }
    _loadDefaultAssets();
  }

  Future<void> _loadDefaultAssets() async {
    try {
      final fontData = await rootBundle.load('assets/fonts/Cairo-SemiBold.ttf');
      _cairoFontBytes = fontData.buffer.asUint8List();
    } catch (_) {}
    try {
      final pdfData = await rootBundle.load('assets/formulaire_oran.pdf');
      setState(() {
        _originalPdfBytes = pdfData.buffer.asUint8List();
      });
    } catch (_) {}
  }

  Future<void> _pickOriginalPdf() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );
    if (result != null && result.files.single.bytes != null) {
      setState(() {
        _originalPdfBytes = result.files.single.bytes!;
      });
    }
  }

  void _onFieldChanged(PdfFieldCoord changedField, String newValue) {
    if (_autoSyncFields && changedField.syncKey != null) {
      for (final f in kOranPdfFields) {
        if (f.id != changedField.id && f.syncKey == changedField.syncKey) {
          _controllers[f.id]?.text = newValue;
        }
      }
    }
    if (changedField.id == 'p3_indoor_cam_qty' ||
        changedField.id == 'p3_outdoor_cam_qty' ||
        changedField.id == 'p3_recorder_qty') {
      final q1 = int.tryParse(_controllers['p3_indoor_cam_qty']?.text.trim() ?? '') ?? 0;
      final q2 = int.tryParse(_controllers['p3_outdoor_cam_qty']?.text.trim() ?? '') ?? 0;
      final q3 = int.tryParse(_controllers['p3_recorder_qty']?.text.trim() ?? '') ?? 0;
      final sum = q1 + q2 + q3;
      if (sum > 0) {
        _controllers['p3_total_qty']?.text = sum.toString().padLeft(2, '0');
      }
    }
    setState(() {});
  }

  /// Sauvegarde le dossier actuel dans ObjectBox
  void _saveCurrentDossierToObjectBox() {
    final Map<String, String> currentMap = {};
    for (final f in kOranPdfFields) {
      currentMap[f.id] = _controllers[f.id]?.text ?? '';
    }

    final entity = DossierSubmissionEntity(
      id: _activeDossierId ?? 0,
      wilaya: currentMap['p1_wilaya'] ?? 'ولاية وهران',
      applicantName: currentMap['p1_applicant_name'] ?? 'بدون اسم',
      companyName: currentMap['p2_company_name'] ?? '—',
      installationAddress: currentMap['p3_installation_address'] ?? '—',
      installerCompany: currentMap['p3_installer_ref_address'] ?? '—',
      totalQty: currentMap['p3_total_qty'] ?? '00',
      strikeExternalMarket: _strikeExternalMarket,
      fieldsJson: jsonEncode(currentMap),
    );

    final id = objectBox.saveDossier(entity);
    setState(() => _activeDossierId = id);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم حفظ الملف في قاعدة بيانات ObjectBox (#\$id)')),
    );
  }

  void _openLazyHistoryModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _ObjectBoxLazyHistorySheet(
        onSelectDossier: (dossier) {
          final map = dossier.decodedFields;
          for (final f in kOranPdfFields) {
            _controllers[f.id]?.text = map[f.id] ?? '';
          }
          setState(() {
            _activeDossierId = dossier.id;
            _strikeExternalMarket = dossier.strikeExternalMarket;
          });
          Navigator.pop(context);
        },
      ),
    );
  }

  void _openCrudCatalogModal(PdfFieldCoord field) {
    if (field.catalogCategory == null) return;
    showDialog(
      context: context,
      builder: (_) => _CrudChoiceDialog(
        categoryKey: field.catalogCategory!,
        titleAr: field.labelAr,
        onPickValue: (valAr) {
          _controllers[field.id]?.text = valAr;
          _onFieldChanged(field, valAr);
          Navigator.pop(context);
        },
      ),
    ).then((_) => setState(() {}));
  }

  void _openPrivacyPolicyScreen() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()),
    );
  }

  /// Génère le PDF rempli en police Cairo (centré dans chaque champ)
  Future<Uint8List> _buildFilledPdfBytes() async {
    if (_originalPdfBytes == null) {
      throw Exception('Veuillez charger le fichier PDF original.');
    }
    final PdfDocument document = PdfDocument(inputBytes: _originalPdfBytes!);
    late PdfFont cairoFont;
    if (_cairoFontBytes != null) {
      cairoFont = PdfTrueTypeFont(_cairoFontBytes!, 12);
    } else {
      cairoFont = PdfStandardFont(PdfFontFamily.helvetica, 12);
    }
    final PdfBrush inkBrush = PdfSolidBrush(PdfColor(15, 23, 42));
    final PdfBrush whiteMaskBrush = PdfSolidBrush(PdfColor(255, 255, 255));

    if (_strikeExternalMarket && document.pages.count >= 3) {
      final PdfPage page3 = document.pages[2];
      final Size size3 = page3.getClientSize();
      page3.graphics.drawLine(
        PdfPen(PdfColor(15, 23, 42), width: 1.5),
        Offset(size3.width * 0.195, size3.height * 0.193),
        Offset(size3.width * 0.275, size3.height * 0.193),
      );
    }

    for (final field in kOranPdfFields) {
      final String text = (_controllers[field.id]?.text ?? '').trim();
      if (text.isEmpty || field.page > document.pages.count) continue;

      final PdfPage page = document.pages[field.page - 1];
      final Size pageSize = page.getClientSize();
      final double xLeft = (field.xLeftPct / 100.0) * pageSize.width;
      final double xRight = (field.xRightPct / 100.0) * pageSize.width;
      final double boxWidth = (xRight - xLeft).clamp(20.0, pageSize.width);
      final double boxHeight = field.multiline ? 42.0 : 22.0;
      final double yTop = ((field.yPct / 100.0) * pageSize.height) - (field.fontSize * 1.15);

      // Si maskBackground est actif (ex: remplacement de "ولاية وهران" par une des 69 Wilayas)
      if (field.maskBackground) {
        page.graphics.drawRectangle(
          brush: whiteMaskBrush,
          bounds: Rect.fromLTWH(xLeft, yTop, boxWidth, boxHeight),
        );
      }

      final PdfFont fieldFont = _cairoFontBytes != null
          ? PdfTrueTypeFont(_cairoFontBytes!, field.fontSize, style: PdfFontStyle.bold)
          : cairoFont;

      page.graphics.drawString(
        text,
        fieldFont,
        brush: inkBrush,
        bounds: Rect.fromLTWH(xLeft, yTop, boxWidth, boxHeight),
        format: PdfStringFormat(
          textDirection: field.isRtl
              ? PdfTextDirection.rightToLeft
              : PdfTextDirection.leftToRight,
          alignment: PdfTextAlignment.center,
          lineAlignment: PdfVerticalAlignment.middle,
        ),
      );
    }

    final List<int> bytes = await document.save();
    document.dispose();
    return Uint8List.fromList(bytes);
  }

  Widget _buildFormPane(List<PdfFieldCoord> pageFields) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: SegmentedButton<int>(
            segments: const [
              ButtonSegment(value: 1, label: Text('صفحة 1: التعهد (5)')),
              ButtonSegment(value: 2, label: Text('صفحة 2: الاستمارة (23)')),
              ButtonSegment(value: 3, label: Text('صفحة 3: التجهيزات (24)')),
            ],
            selected: {_selectedPage},
            onSelectionChanged: (s) => setState(() => _selectedPage = s.first),
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: pageFields.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (context, index) {
              final field = pageFields[index];
              final choices = field.catalogCategory != null
                  ? objectBox.getChoicesByCategory(field.catalogCategory!)
                  : <ChoiceCatalogItemEntity>[];

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (field.catalogCategory != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6.0),
                      child: Row(
                        children: [
                          Expanded(
                            child: DropdownButtonFormField<String>(
                              isExpanded: true,
                              decoration: const InputDecoration(
                                isDense: true,
                                labelText: 'اختيار من قائمة ObjectBox (أو إضافة جديد)',
                                border: OutlineInputBorder(),
                              ),
                              items: choices
                                  .map(
                                    (c) => DropdownMenuItem<String>(
                                      value: c.valueAr,
                                      child: Text(
                                        '\${c.valueAr} (\${c.noteFr})',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.cairo(fontSize: 13),
                                      ),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) {
                                  _controllers[field.id]?.text = val;
                                  _onFieldChanged(field, val);
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          IconButton.filledTonal(
                            tooltip: 'إضافة / تعديل / حذف (CRUD ObjectBox)',
                            onPressed: () => _openCrudCatalogModal(field),
                            icon: const Icon(Icons.edit_note),
                          ),
                        ],
                      ),
                    ),
                  TextField(
                    controller: _controllers[field.id],
                    textDirection: field.isRtl ? TextDirection.rtl : TextDirection.ltr,
                    textAlign: TextAlign.center,
                    maxLines: field.multiline ? 2 : 1,
                    style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      labelText: field.labelAr,
                      helperText: field.labelFr,
                      border: const OutlineInputBorder(),
                    ),
                    onChanged: (val) => _onFieldChanged(field, val),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPdfPreviewPane() {
    if (_originalPdfBytes == null) {
      return Center(
        child: ElevatedButton.icon(
          onPressed: _pickOriginalPdf,
          icon: const Icon(Icons.picture_as_pdf),
          label: const Text('اختر ملف PDF الأصلي لمعاينته مباشرة'),
        ),
      );
    }
    return PdfPreview(
      build: (_) => _buildFilledPdfBytes(),
      canChangeOrientation: false,
      canChangePageFormat: false,
      pdfFileName: 'Dossier_Equipements_Sensibles_Cairo.pdf',
    );
  }

  @override
  Widget build(BuildContext context) {
    final pageFields = kOranPdfFields.where((f) => f.page == _selectedPage).toList();

    return Directionality(
      textDirection: TextDirection.rtl,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth >= 900;
          return DefaultTabController(
            length: 2,
            child: Scaffold(
              appBar: AppBar(
                title: Text(
                  'استمارة التجهيزات الحساسة (69 ولاية · ObjectBox · Cairo)',
                  style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                actions: [
                  IconButton(
                    tooltip: 'سياسة الخصوصية / Règles de confidentialité (Play Store)',
                    onPressed: _openPrivacyPolicyScreen,
                    icon: const Icon(Icons.privacy_tip_outlined),
                  ),
                  TextButton.icon(
                    onPressed: _openLazyHistoryModal,
                    icon: const Icon(Icons.history),
                    label: const Text('سجل ObjectBox'),
                  ),
                  TextButton.icon(
                    onPressed: _saveCurrentDossierToObjectBox,
                    icon: const Icon(Icons.save_outlined),
                    label: const Text('حفظ'),
                  ),
                  const SizedBox(width: 6),
                  FilledButton.icon(
                    onPressed: () async {
                      _saveCurrentDossierToObjectBox();
                      final bytes = await _buildFilledPdfBytes();
                      await Printing.sharePdf(
                        bytes: bytes,
                        filename: 'Dossier_Equipements_Sensibles_Cairo.pdf',
                      );
                    },
                    icon: const Icon(Icons.download),
                    label: const Text('تصدير PDF'),
                  ),
                  const SizedBox(width: 12),
                ],
                bottom: isWide
                    ? null
                    : const TabBar(
                        tabs: [
                          Tab(icon: Icon(Icons.edit_document), text: 'الاستمارة'),
                          Tab(icon: Icon(Icons.picture_as_pdf), text: 'معاينة PDF'),
                        ],
                      ),
              ),
              body: isWide
                  ? Row(
                      children: [
                        Expanded(flex: 5, child: _buildFormPane(pageFields)),
                        const VerticalDivider(width: 1),
                        Expanded(flex: 6, child: _buildPdfPreviewPane()),
                      ],
                    )
                  : TabBarView(
                      children: [
                        _buildFormPane(pageFields),
                        _buildPdfPreviewPane(),
                      ],
                    ),
            ),
          );
        },
      ),
    );
  }
}

/// Écran intégré des Règles de Confidentialité (Conforme Google Play Store)
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Règles de confidentialité / سياسة الخصوصية'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Règles de Confidentialité (Privacy Policy) — DRAG Wilaya PDF & ObjectBox',
            style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            '1. Traitement 100 % local sur l’appareil (ObjectBox) :\\n'
            'Toutes les données saisies dans le formulaire administratif de 3 pages (identité, CNI/passeport, société, choix parmi les 69 Wilayas, inventaire des caméras et DVR) sont enregistrées exclusivement en local sur votre appareil via la base de données embarquée ObjectBox. Aucune donnée n’est transmise à un serveur externe.',
          ),
          const SizedBox(height: 12),
          const Text(
            '2. Absence totale de partage avec des tiers :\\n'
            'Nous ne collectons, ne vendons et ne partageons aucune donnée personnelle ou sensible avec des tiers, régies publicitaires ou courtiers de données.',
          ),
          const SizedBox(height: 12),
          const Text(
            '3. Contrôle utilisateur et suppression des données (CRUD) :\\n'
            'Vous pouvez consulter, modifier ou supprimer définitivement chaque dossier ou liste de choix directement depuis l’application à tout moment, ou en désinstallant l’application.',
          ),
        ],
      ),
    );
  }
}

/// Widget d'historique ObjectBox avec Lazy Loading (ScrollController + pagination offset/limit)
class _ObjectBoxLazyHistorySheet extends StatefulWidget {
  final ValueChanged<DossierSubmissionEntity> onSelectDossier;

  const _ObjectBoxLazyHistorySheet({required this.onSelectDossier});

  @override
  State<_ObjectBoxLazyHistorySheet> createState() => _ObjectBoxLazyHistorySheetState();
}

class _ObjectBoxLazyHistorySheetState extends State<_ObjectBoxLazyHistorySheet> {
  static const int _pageSize = 10;
  final ScrollController _scrollController = ScrollController();
  final List<DossierSubmissionEntity> _items = [];
  String _search = '';
  bool _hasMore = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadInitial();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 120) {
      _loadNextBatch();
    }
  }

  void _loadInitial() {
    final batch = objectBox.getDossiersLazy(offset: 0, limit: _pageSize, search: _search);
    final total = objectBox.countDossiers(search: _search);
    setState(() {
      _items
        ..clear()
        ..addAll(batch);
      _hasMore = _items.length < total;
    });
  }

  void _loadNextBatch() {
    if (_isLoading || !_hasMore) return;
    setState(() => _isLoading = true);
    final nextBatch = objectBox.getDossiersLazy(
      offset: _items.length,
      limit: _pageSize,
      search: _search,
    );
    final total = objectBox.countDossiers(search: _search);
    setState(() {
      _items.addAll(nextBatch);
      _hasMore = _items.length < total;
      _isLoading = false;
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'سجل الملفات المحفوظة في ObjectBox (Lazy List)',
              style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'بحث بالولاية أو الاسم أو الشركة أو العنوان...',
                border: OutlineInputBorder(),
              ),
              onChanged: (v) {
                _search = v;
                _loadInitial();
              },
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                itemCount: _items.length + (_hasMore ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index >= _items.length) {
                    return const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  final d = _items[index];
                  return Card(
                    child: ListTile(
                      title: Text(
                        '\${d.wilaya} — \${d.applicantName}',
                        style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        'العنوان: \${d.installationAddress}\\nالمؤسسة المعتمدة: \${d.installerCompany}',
                        style: GoogleFonts.cairo(fontSize: 12),
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                            onPressed: () {
                              objectBox.deleteDossier(d.id);
                              _loadInitial();
                            },
                          ),
                          FilledButton(
                            onPressed: () => widget.onSelectDossier(d),
                            child: const Text('تحميل'),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Boîte de dialogue CRUD ObjectBox (69 Wilayas + 14 listes d'équipements/entreprises)
class _CrudChoiceDialog extends StatefulWidget {
  final String categoryKey;
  final String titleAr;
  final ValueChanged<String> onPickValue;

  const _CrudChoiceDialog({
    required this.categoryKey,
    required this.titleAr,
    required this.onPickValue,
  });

  @override
  State<_CrudChoiceDialog> createState() => _CrudChoiceDialogState();
}

class _CrudChoiceDialogState extends State<_CrudChoiceDialog> {
  final TextEditingController _arCtrl = TextEditingController();
  final TextEditingController _frCtrl = TextEditingController();
  int? _editingId;

  @override
  Widget build(BuildContext context) {
    final items = objectBox.getChoicesByCategory(widget.categoryKey);

    return Directionality(
      textDirection: TextDirection.rtl,
      child: AlertDialog(
        title: Text('إدارة القائمة (ObjectBox CRUD) — \${widget.titleAr}'),
        content: SizedBox(
          width: 560,
          height: 440,
          child: Column(
            children: [
              TextField(
                controller: _arCtrl,
                decoration: const InputDecoration(
                  labelText: 'القيمة بالعربية (تكتب بخط Cairo في PDF)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _frCtrl,
                      decoration: const InputDecoration(
                        labelText: 'ملاحظة أو ترجمة (اختياري)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton.icon(
                    onPressed: () {
                      if (_arCtrl.text.trim().isEmpty) return;
                      objectBox.saveChoice(
                        ChoiceCatalogItemEntity(
                          id: _editingId ?? 0,
                          categoryKey: widget.categoryKey,
                          valueAr: _arCtrl.text.trim(),
                          noteFr: _frCtrl.text.trim(),
                        ),
                      );
                      _arCtrl.clear();
                      _frCtrl.clear();
                      setState(() => _editingId = null);
                    },
                    icon: const Icon(Icons.add),
                    label: Text(_editingId == null ? 'إضافة' : 'تحديث'),
                  ),
                ],
              ),
              const Divider(height: 24),
              Expanded(
                child: ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (_, idx) {
                    final item = items[idx];
                    return ListTile(
                      title: Text(item.valueAr, style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                      subtitle: Text(item.noteFr),
                      onTap: () => widget.onPickValue(item.valueAr),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit),
                            onPressed: () {
                              setState(() {
                                _editingId = item.id;
                                _arCtrl.text = item.valueAr;
                                _frCtrl.text = item.noteFr;
                              });
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                            onPressed: () {
                              objectBox.deleteChoice(item.id);
                              setState(() {});
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }
}
`;
}

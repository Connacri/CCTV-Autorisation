import { PdfFieldConfig } from '../data/pdfSchema';
import { RenderOverlayOptions } from './pdfTemplateRenderer';

export function generateFlutterPubspec(): string {
  return `name: oran_drag_pdf_filler
description: Application Flutter (Web, Android, iOS, Desktop) pour remplir le formulaire officiel d'équipements sensibles de la Wilaya d'Oran en arabe avec la police Cairo.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # Lecture et écriture directe sur un PDF existant sans le modifier
  syncfusion_flutter_pdf: ^27.1.58
  # Prévisualisation et impression PDF multiplateforme (Web / Mobile / Desktop)
  printing: ^5.13.4
  # Police Cairo pour l'interface et l'intégration TTF dans le PDF
  google_fonts: ^6.2.1
  # Sélection du fichier PDF original si non embarqué dans les assets
  file_picker: ^8.1.4

flutter:
  uses-material-design: true
  assets:
    - assets/formulaire_oran.pdf
    - assets/fonts/Cairo-Regular.ttf
    - assets/fonts/Cairo-SemiBold.ttf
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
    syncKey: ${f.syncKey ? `'${f.syncKey}'` : 'null'},
    initialValue: '${val}',
  )`;
    })
    .join(',\n');

  return `import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:google_fonts/google_fonts.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:file_picker/file_picker.dart';

void main() {
  runApp(const OranDragPdfFillerApp());
}

class OranDragPdfFillerApp extends StatelessWidget {
  const OranDragPdfFillerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DRAG Oran — Remplisseur PDF Officiel (Police Cairo)',
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

/// Modèle de coordonnées exactes (en % de la page A4) pour chaque case du PDF
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
  final String align; // 'right' | 'center' | 'left'
  final bool isRtl;
  final bool multiline;
  final String? syncKey;
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
    this.syncKey,
    this.initialValue = '',
  });
}

/// Liste exhaustive des 49 champs cartographiés sur les 3 pages du PDF de la Wilaya d'Oran
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
    } catch (_) {
      // Si non présent dans assets, sera téléchargé via GoogleFonts ou chargé à la volée
    }
    try {
      final pdfData = await rootBundle.load('assets/formulaire_oran.pdf');
      setState(() {
        _originalPdfBytes = pdfData.buffer.asUint8List();
      });
    } catch (_) {
      // L'utilisateur peut aussi importer le PDF via FilePicker
    }
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
    // Calcul automatique du total des équipements sur la Page 3
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

  /// Génère le PDF rempli sans modifier la structure du PDF original,
  /// en écrivant les textes arabes avec la police Cairo exactement dans chaque case.
  Future<Uint8List> _buildFilledPdfBytes() async {
    if (_originalPdfBytes == null) {
      throw Exception('Veuillez charger le fichier PDF original (formulaire_oran.pdf).');
    }

    // Charge le document PDF original sans altérer son contenu existant
    final PdfDocument document = PdfDocument(inputBytes: _originalPdfBytes!);

    // Charge la police TrueType Cairo pour le support complet de l'arabe (RTL + ligatures)
    late PdfFont cairoFont;
    if (_cairoFontBytes != null) {
      cairoFont = PdfTrueTypeFont(_cairoFontBytes!, 12);
    } else {
      cairoFont = PdfStandardFont(PdfFontFamily.helvetica, 12);
    }

    final PdfBrush inkBrush = PdfSolidBrush(PdfColor(15, 23, 42));

    // Biffure optionnelle de "- الخارجية (1)" sur la Page 3
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
      if (text.isEmpty) continue;
      if (field.page > document.pages.count) continue;

      final PdfPage page = document.pages[field.page - 1];
      final Size pageSize = page.getClientSize();

      final double xLeft = (field.xLeftPct / 100.0) * pageSize.width;
      final double xRight = (field.xRightPct / 100.0) * pageSize.width;
      final double boxWidth = (xRight - xLeft).clamp(20.0, pageSize.width);
      final double boxHeight = field.multiline ? 42.0 : 22.0;
      final double yTop = ((field.yPct / 100.0) * pageSize.height) - (field.fontSize * 1.15);

      final PdfFont fieldFont = _cairoFontBytes != null
          ? PdfTrueTypeFont(_cairoFontBytes!, field.fontSize, style: PdfFontStyle.bold)
          : cairoFont;

      final PdfTextAlignment alignment = field.align == 'right'
          ? PdfTextAlignment.right
          : field.align == 'center'
              ? PdfTextAlignment.center
              : PdfTextAlignment.left;

      final PdfStringFormat format = PdfStringFormat(
        textDirection: field.isRtl
            ? PdfTextDirection.rightToLeft
            : PdfTextDirection.leftToRight,
        alignment: alignment,
        lineAlignment: PdfVerticalAlignment.top,
      );

      page.graphics.drawString(
        text,
        fieldFont,
        brush: inkBrush,
        bounds: Rect.fromLTWH(xLeft, yTop, boxWidth, boxHeight),
        format: format,
      );
    }

    final List<int> bytes = await document.save();
    document.dispose();
    return Uint8List.fromList(bytes);
  }

  @override
  Widget build(BuildContext context) {
    final pageFields = kOranPdfFields.where((f) => f.page == _selectedPage).toList();

    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'ملء استمارة التجهيزات الحساسة — ولاية وهران (خط Cairo)',
            style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 18),
          ),
          actions: [
            TextButton.icon(
              onPressed: _pickOriginalPdf,
              icon: const Icon(Icons.upload_file),
              label: const Text('استيراد ملف PDF الأصلي'),
            ),
            const SizedBox(width: 8),
            FilledButton.icon(
              onPressed: () async {
                final bytes = await _buildFilledPdfBytes();
                await Printing.sharePdf(
                  bytes: bytes,
                  filename: 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf',
                );
              },
              icon: const Icon(Icons.download),
              label: const Text('تحميل PDF المملوء (Cairo)'),
            ),
            const SizedBox(width: 16),
          ],
        ),
        body: Row(
          children: [
            // Panneau de formulaire à droite (RTL)
            Expanded(
              flex: 5,
              child: Column(
                children: [
                  // Sélecteur de page (Page 1, Page 2, Page 3)
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: SegmentedButton<int>(
                      segments: const [
                        ButtonSegment(value: 1, label: Text('الصفحة 1: التعهد')),
                        ButtonSegment(value: 2, label: Text('الصفحة 2: استمارة المعلومات')),
                        ButtonSegment(value: 3, label: Text('الصفحة 3: جدول التجهيزات')),
                      ],
                      selected: {_selectedPage},
                      onSelectionChanged: (s) => setState(() => _selectedPage = s.first),
                    ),
                  ),
                  SwitchListTile(
                    title: const Text('مزامنة تلقائية للبيانات المشتركة بين الصفحات الثلاث'),
                    value: _autoSyncFields,
                    onChanged: (v) => setState(() => _autoSyncFields = v),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: pageFields.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final field = pageFields[index];
                        return TextField(
                          controller: _controllers[field.id],
                          textDirection: field.isRtl ? TextDirection.rtl : TextDirection.ltr,
                          maxLines: field.multiline ? 2 : 1,
                          style: GoogleFonts.cairo(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                          decoration: InputDecoration(
                            labelText: field.labelAr,
                            helperText: field.labelFr,
                            border: const OutlineInputBorder(),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                          ),
                          onChanged: (val) => _onFieldChanged(field, val),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const VerticalDivider(width: 1),
            // Aperçu PDF direct à gauche
            Expanded(
              flex: 6,
              child: _originalPdfBytes == null
                  ? Center(
                      child: ElevatedButton.icon(
                        onPressed: _pickOriginalPdf,
                        icon: const Icon(Icons.picture_as_pdf),
                        label: const Text('اختر ملف PDF الأصلي لمعاينته مباشرة'),
                      ),
                    )
                  : PdfPreview(
                      build: (_) => _buildFilledPdfBytes(),
                      canChangeOrientation: false,
                      canChangePageFormat: false,
                      pdfFileName: 'Dossier_Equipements_Sensibles_Oran_Cairo.pdf',
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
`;
}

import 'dart:convert';
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
  PdfFieldCoord(
    id: 'p1_wilaya',
    page: 1,
    section: 'التعهد وهوية المصرح (Page 1)',
    labelAr: 'الولاية (أعلى يمين الصفحة 1)',
    labelFr: 'Wilaya d’en-tête (69 Wilayas disponibles ou ajout CRUD)',
    xLeftPct: 76.00,
    xRightPct: 95.20,
    yPct: 8.10,
    fontSize: 13.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: true,
    syncKey: 'wilaya_header',
    catalogCategory: 'wilaya',
    initialValue: 'ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p1_applicant_name',
    page: 1,
    section: 'التعهد وهوية المصرح (Page 1)',
    labelAr: 'أنا الممضي أسفله (ة) (1)',
    labelFr: 'Je soussigné(e) — Nom & Prénom ou Raison Sociale (1)',
    xLeftPct: 21.00,
    xRightPct: 73.50,
    yPct: 40.30,
    fontSize: 12.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'applicant_name',
    catalogCategory: null,
    initialValue: 'بن أحمد محمد (مسير شركة الأمان للحراسة ش.ذ.م.م)',
  ),
  PdfFieldCoord(
    id: 'p1_exploitation_address',
    page: 1,
    section: 'التعهد وهوية المصرح (Page 1)',
    labelAr: 'عنوان مكان استغلال نظام كاميرات المراقبة (2)',
    labelFr: 'Adresse du lieu d’exploitation du système de vidéosurveillance (2)',
    xLeftPct: 16.50,
    xRightPct: 55.80,
    yPct: 45.40,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'installation_address',
    catalogCategory: null,
    initialValue: 'نهج العقيد لطفي رقم 24، بلدية وهران، ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p1_location',
    page: 1,
    section: 'التوقيع والتاريخ (Page 1)',
    labelAr: 'حرر بـ',
    labelFr: 'Fait à (Lieu)',
    xLeftPct: 27.60,
    xRightPct: 40.20,
    yPct: 71.30,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_location',
    catalogCategory: 'doc_location',
    initialValue: 'وهران',
  ),
  PdfFieldCoord(
    id: 'p1_date',
    page: 1,
    section: 'التوقيع والتاريخ (Page 1)',
    labelAr: 'في (التاريخ)',
    labelFr: 'Le (Date)',
    xLeftPct: 12.80,
    xRightPct: 25.40,
    yPct: 71.30,
    fontSize: 11.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_date',
    catalogCategory: null,
    initialValue: '2026/10/06',
  ),
  PdfFieldCoord(
    id: 'p2_wilaya',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'الولاية (أعلى يمين الصفحة 2)',
    labelFr: 'Wilaya d’en-tête (69 Wilayas disponibles ou ajout CRUD)',
    xLeftPct: 76.00,
    xRightPct: 95.20,
    yPct: 8.30,
    fontSize: 13.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: true,
    syncKey: 'wilaya_header',
    catalogCategory: 'wilaya',
    initialValue: 'ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p2_identity',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'هوية الطالب (1)',
    labelFr: 'Identité du demandeur ou Raison sociale (1)',
    xLeftPct: 16.00,
    xRightPct: 82.00,
    yPct: 37.80,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'applicant_name',
    catalogCategory: null,
    initialValue: 'بن أحمد محمد (مسير شركة الأمان للحراسة ش.ذ.م.م)',
  ),
  PdfFieldCoord(
    id: 'p2_father_name',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'ابن (اسم الأب)',
    labelFr: 'Fils / Fille de (Prénom du père)',
    xLeftPct: 56.50,
    xRightPct: 91.80,
    yPct: 41.20,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'عبد القادر',
  ),
  PdfFieldCoord(
    id: 'p2_mother_name',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'و (اسم ولقب الأم)',
    labelFr: 'Et de (Nom et prénom de la mère)',
    xLeftPct: 15.50,
    xRightPct: 54.50,
    yPct: 41.20,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'بوزيان فاطمة الزهراء',
  ),
  PdfFieldCoord(
    id: 'p2_birth_date',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'المولود (ة) في',
    labelFr: 'Né(e) le (Date de naissance)',
    xLeftPct: 55.50,
    xRightPct: 84.80,
    yPct: 44.50,
    fontSize: 11.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: 'birth_date',
    catalogCategory: null,
    initialValue: '1984/05/14',
  ),
  PdfFieldCoord(
    id: 'p2_birth_place',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'بـ (مكان الميلاد)',
    labelFr: 'À (Lieu de naissance)',
    xLeftPct: 15.50,
    xRightPct: 53.50,
    yPct: 44.50,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'birth_place',
    catalogCategory: null,
    initialValue: 'وهران - ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p2_address',
    page: 2,
    section: 'الحالة المدنية لطالب الرخصة (Page 2)',
    labelAr: 'العنوان (2)',
    labelFr: 'Adresse personnelle ou du siège social (2)',
    xLeftPct: 15.00,
    xRightPct: 86.20,
    yPct: 47.80,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'حي العقيد لطفي فيلا رقم 12، بلدية بئر الجير، وهران',
  ),
  PdfFieldCoord(
    id: 'p2_id_number',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'بطاقة تعريف الوطنية رقم',
    labelFr: 'Carte Nationale d’Identité N°',
    xLeftPct: 62.00,
    xRightPct: 76.50,
    yPct: 50.90,
    fontSize: 11.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '10984051400234',
  ),
  PdfFieldCoord(
    id: 'p2_id_issued_by',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'الصادرة عن (بطاقة التعريف)',
    labelFr: 'Délivrée par (Daira / Commune)',
    xLeftPct: 38.20,
    xRightPct: 53.80,
    yPct: 50.90,
    fontSize: 11.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'authority_issued_by',
    initialValue: 'بلدية وهران',
  ),
  PdfFieldCoord(
    id: 'p2_id_issue_date',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'بتاريخ (إصدار بطاقة التعريف)',
    labelFr: 'En date du (Date d’émission CNI)',
    xLeftPct: 13.00,
    xRightPct: 32.50,
    yPct: 50.90,
    fontSize: 11.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '2021/03/22',
  ),
  PdfFieldCoord(
    id: 'p2_passport_number',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'جواز سفر رقم',
    labelFr: 'Passeport N°',
    xLeftPct: 64.00,
    xRightPct: 84.80,
    yPct: 54.10,
    fontSize: 11.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'N84592013',
  ),
  PdfFieldCoord(
    id: 'p2_passport_issued_by',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'الصادر عن (جواز السفر)',
    labelFr: 'Délivré par (Autorité passeport)',
    xLeftPct: 14.00,
    xRightPct: 55.50,
    yPct: 54.10,
    fontSize: 11.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'authority_issued_by',
    initialValue: 'دائرة وهران',
  ),
  PdfFieldCoord(
    id: 'p2_passport_issue_date',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'تاريخ الإصدار (جواز السفر)',
    labelFr: 'Date de délivrance du passeport',
    xLeftPct: 63.20,
    xRightPct: 84.50,
    yPct: 57.30,
    fontSize: 11.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '2020/09/10',
  ),
  PdfFieldCoord(
    id: 'p2_passport_expiry_date',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'تاريخ انتهاء مدة الصلاحية',
    labelFr: 'Date d’expiration du passeport',
    xLeftPct: 13.00,
    xRightPct: 43.00,
    yPct: 57.30,
    fontSize: 11.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '2030/09/09',
  ),
  PdfFieldCoord(
    id: 'p2_nationality',
    page: 2,
    section: 'وثائق الهوية والجواز (Page 2)',
    labelAr: 'الجنسية',
    labelFr: 'Nationalité',
    xLeftPct: 14.00,
    xRightPct: 89.00,
    yPct: 60.50,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'nationality',
    catalogCategory: 'nationality',
    initialValue: 'جزائرية',
  ),
  PdfFieldCoord(
    id: 'p2_company_name',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'بصفتي مسير للشركة',
    labelFr: 'En ma qualité de gérant de la société',
    xLeftPct: 62.50,
    xRightPct: 80.80,
    yPct: 63.70,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'الأمان للحراسة ش.ذ.م.م',
  ),
  PdfFieldCoord(
    id: 'p2_company_address',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'الكائنة بـ (مقر الشركة)',
    labelFr: 'Sise à (Adresse de la société)',
    xLeftPct: 14.00,
    xRightPct: 54.50,
    yPct: 63.70,
    fontSize: 11.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'نهج العقيد لطفي رقم 24، بلدية وهران',
  ),
  PdfFieldCoord(
    id: 'p2_phone',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'رقم الهاتف',
    labelFr: 'Numéro de téléphone',
    xLeftPct: 72.60,
    xRightPct: 87.20,
    yPct: 66.90,
    fontSize: 10.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '0550 12 34 56',
  ),
  PdfFieldCoord(
    id: 'p2_fax',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'الفاكس',
    labelFr: 'Numéro de Fax',
    xLeftPct: 52.20,
    xRightPct: 67.40,
    yPct: 66.90,
    fontSize: 10.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '041 33 44 55',
  ),
  PdfFieldCoord(
    id: 'p2_email',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'البريد الالكتروني',
    labelFr: 'Adresse e-mail',
    xLeftPct: 12.50,
    xRightPct: 38.00,
    yPct: 66.90,
    fontSize: 10.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'contact@alaman-dz.com',
  ),
  PdfFieldCoord(
    id: 'p2_shareholders',
    page: 2,
    section: 'معلومات الشركة والاتصال (Page 2)',
    labelAr: 'اسم ولقب المساهمين',
    labelFr: 'Nom et prénom des associés / actionnaires',
    xLeftPct: 14.00,
    xRightPct: 80.50,
    yPct: 70.10,
    fontSize: 11.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'بن أحمد محمد (60%) - بن أحمد كريم (40%)',
  ),
  PdfFieldCoord(
    id: 'p2_location',
    page: 2,
    section: 'التوقيع والتاريخ (Page 2)',
    labelAr: 'حرر بـ',
    labelFr: 'Fait à (Lieu)',
    xLeftPct: 23.20,
    xRightPct: 35.20,
    yPct: 80.80,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_location',
    catalogCategory: 'doc_location',
    initialValue: 'وهران',
  ),
  PdfFieldCoord(
    id: 'p2_date',
    page: 2,
    section: 'التوقيع والتاريخ (Page 2)',
    labelAr: 'في (التاريخ)',
    labelFr: 'Le (Date)',
    xLeftPct: 7.50,
    xRightPct: 21.20,
    yPct: 80.80,
    fontSize: 11.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_date',
    catalogCategory: null,
    initialValue: '2026/10/06',
  ),
  PdfFieldCoord(
    id: 'p3_wilaya',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'الولاية (أعلى يمين الصفحة 3)',
    labelFr: 'Wilaya d’en-tête (69 Wilayas disponibles ou ajout CRUD)',
    xLeftPct: 76.00,
    xRightPct: 95.20,
    yPct: 6.10,
    fontSize: 13.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: true,
    syncKey: 'wilaya_header',
    catalogCategory: 'wilaya',
    initialValue: 'ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p3_ref_number',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'رقم التسجيل (رقم/ ...)',
    labelFr: 'N° d’enregistrement (Optionnel)',
    xLeftPct: 89.20,
    xRightPct: 92.60,
    yPct: 13.88,
    fontSize: 10.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '142',
  ),
  PdfFieldCoord(
    id: 'p3_identity',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'هوية الطالب (2)',
    labelFr: 'Identité du demandeur (2)',
    xLeftPct: 4.00,
    xRightPct: 81.50,
    yPct: 25.30,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'applicant_name',
    catalogCategory: null,
    initialValue: 'بن أحمد محمد (مسير شركة الأمان للحراسة ش.ذ.م.م)',
  ),
  PdfFieldCoord(
    id: 'p3_birth_date',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'المولود (ة) في',
    labelFr: 'Né(e) le',
    xLeftPct: 50.00,
    xRightPct: 84.50,
    yPct: 28.10,
    fontSize: 11.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: 'birth_date',
    catalogCategory: null,
    initialValue: '1984/05/14',
  ),
  PdfFieldCoord(
    id: 'p3_birth_place',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'بـ (مكان الميلاد)',
    labelFr: 'À (Lieu de naissance)',
    xLeftPct: 3.50,
    xRightPct: 47.00,
    yPct: 28.10,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'birth_place',
    catalogCategory: null,
    initialValue: 'وهران - ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p3_nationality',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'الجنسية',
    labelFr: 'Nationalité',
    xLeftPct: 3.50,
    xRightPct: 89.00,
    yPct: 31.00,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'nationality',
    catalogCategory: 'nationality',
    initialValue: 'جزائرية',
  ),
  PdfFieldCoord(
    id: 'p3_installation_address',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'عنوان تركيب الكاميرات (3)',
    labelFr: 'Adresse d’installation des caméras (3)',
    xLeftPct: 3.50,
    xRightPct: 73.00,
    yPct: 33.90,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'installation_address',
    catalogCategory: null,
    initialValue: 'نهج العقيد لطفي رقم 24، بلدية وهران، ولاية وهران',
  ),
  PdfFieldCoord(
    id: 'p3_profession',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'المهنة (4)',
    labelFr: 'Profession (4)',
    xLeftPct: 3.50,
    xRightPct: 87.00,
    yPct: 36.80,
    fontSize: 12.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'profession',
    initialValue: 'مسير شركة ذات مسؤولية محدودة',
  ),
  PdfFieldCoord(
    id: 'p3_activity_type',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'نوع النشاطات (5)',
    labelFr: 'Nature des activités (5)',
    xLeftPct: 3.50,
    xRightPct: 80.00,
    yPct: 39.60,
    fontSize: 11.5,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'activity_type',
    initialValue: 'حراسة ونقل الأموال والمواد الحساسة والخدمات الأمنية',
  ),
  PdfFieldCoord(
    id: 'p3_installer_ref_address',
    page: 3,
    section: 'معلومات صاحب الطلب والتركيب (Page 3)',
    labelAr: 'مرجع اعتماد و عنوان مؤسسة تركيب الكاميرات (6)',
    labelFr: 'Référence d’agrément et adresse de l’entreprise d’installation (6)',
    xLeftPct: 3.50,
    xRightPct: 54.50,
    yPct: 42.50,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'installer_company',
    initialValue: 'اعتماد رقم 45/2023 - مؤسسة تيلي سيكوريتي، بئر الجير، وهران',
  ),
  PdfFieldCoord(
    id: 'p3_indoor_cam_nature',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'طبيعة كاميرات المراقبة الداخلية (النوع، العلامة، النموذج، الرقم التسلسلي)',
    labelFr: 'Nature des caméras intérieures (Type, Marque, Modèle, N° Série)',
    xLeftPct: 48.20,
    xRightPct: 75.60,
    yPct: 56.20,
    fontSize: 10.0,
    align: 'center',
    isRtl: true,
    multiline: true,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'indoor_cam_model',
    initialValue: 'كاميرا داخلية ثابتة بدون أشعة حمراء HIKVISION DS-2CE56D0T\nالرقم التسلسلي: HK-2026-001 إلى HK-2026-004',
  ),
  PdfFieldCoord(
    id: 'p3_indoor_cam_qty',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'كمية كاميرات المراقبة الداخلية',
    labelFr: 'Quantité de caméras intérieures',
    xLeftPct: 4.00,
    xRightPct: 20.80,
    yPct: 58.40,
    fontSize: 13.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '04',
  ),
  PdfFieldCoord(
    id: 'p3_outdoor_cam_nature',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'طبيعة كاميرات المراقبة الخارجية (النوع، العلامة، النموذج، الرقم التسلسلي)',
    labelFr: 'Nature des caméras extérieures (Type, Marque, Modèle, N° Série)',
    xLeftPct: 48.20,
    xRightPct: 75.60,
    yPct: 62.40,
    fontSize: 10.0,
    align: 'center',
    isRtl: true,
    multiline: true,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'outdoor_cam_model',
    initialValue: 'كاميرا خارجية نهارية بدون أشعة حمراء HIKVISION DS-2CE16D0T\nالرقم التسلسلي: HK-2026-005 إلى HK-2026-006',
  ),
  PdfFieldCoord(
    id: 'p3_outdoor_cam_qty',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'كمية كاميرات المراقبة الخارجية',
    labelFr: 'Quantité de caméras extérieures',
    xLeftPct: 4.00,
    xRightPct: 20.80,
    yPct: 64.60,
    fontSize: 13.0,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '02',
  ),
  PdfFieldCoord(
    id: 'p3_recorder_designation',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'تعيين نوع المسجل (تحت عبارة نوع المسجل)',
    labelFr: 'Désignation du type d’enregistreur (DVR / NVR)',
    xLeftPct: 76.80,
    xRightPct: 95.60,
    yPct: 71.00,
    fontSize: 10.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'recorder_designation',
    initialValue: 'مسجل فيديو رقمي DVR 08 قنوات',
  ),
  PdfFieldCoord(
    id: 'p3_recorder_nature',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'طبيعة المسجل (النوع، العلامة، النموذج، الرقم التسلسلي)',
    labelFr: 'Nature de l’enregistreur (Type, Marque, Modèle, N° Série)',
    xLeftPct: 48.20,
    xRightPct: 75.60,
    yPct: 68.80,
    fontSize: 10.0,
    align: 'center',
    isRtl: true,
    multiline: true,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'recorder_model',
    initialValue: 'مسجل رقمي HIKVISION DVR-7208HQHI-K1 (بدون ربط بالأنترنت)\nالرقم التسلسلي: SN-98451200',
  ),
  PdfFieldCoord(
    id: 'p3_recorder_qty',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'كمية المسجل',
    labelFr: 'Quantité d’enregistreurs',
    xLeftPct: 4.00,
    xRightPct: 20.80,
    yPct: 69.00,
    fontSize: 12.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '01',
  ),
  PdfFieldCoord(
    id: 'p3_total_qty',
    page: 3,
    section: 'جدول التجهيزات الحساسة والكميات (Page 3)',
    labelAr: 'المجموع الكلي للتجهيزات',
    labelFr: 'Total général des équipements',
    xLeftPct: 3.60,
    xRightPct: 12.20,
    yPct: 71.90,
    fontSize: 12.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: '07',
  ),
  PdfFieldCoord(
    id: 'p3_location',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'حرر بـ',
    labelFr: 'Fait à (Lieu)',
    xLeftPct: 16.20,
    xRightPct: 25.80,
    yPct: 74.90,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_location',
    catalogCategory: 'doc_location',
    initialValue: 'وهران',
  ),
  PdfFieldCoord(
    id: 'p3_date',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'في (التاريخ)',
    labelFr: 'Le (Date)',
    xLeftPct: 3.60,
    xRightPct: 14.00,
    yPct: 74.90,
    fontSize: 10.5,
    align: 'center',
    isRtl: false,
    multiline: false,
    maskBackground: false,
    syncKey: 'doc_date',
    catalogCategory: null,
    initialValue: '2026/10/06',
  ),
  PdfFieldCoord(
    id: 'p3_origin_country',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'بلد منشأ التجهيزات',
    labelFr: 'Pays d’origine des équipements',
    xLeftPct: 3.00,
    xRightPct: 82.50,
    yPct: 78.30,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'origin_country',
    initialValue: 'الصين (مقتناة من السوق الوطنية عبر متعامل معتمد)',
  ),
  PdfFieldCoord(
    id: 'p3_provenance_country',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'بلد قدوم التجهيزات',
    labelFr: 'Pays de provenance des équipements',
    xLeftPct: 3.00,
    xRightPct: 82.50,
    yPct: 80.40,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'provenance_country',
    initialValue: 'الجزائر - السوق الوطنية (ولاية وهران)',
  ),
  PdfFieldCoord(
    id: 'p3_transport_method',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'كيفيات نقل التجهيزات',
    labelFr: 'Modalités de transport des équipements',
    xLeftPct: 3.00,
    xRightPct: 81.50,
    yPct: 82.40,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'transport_method',
    initialValue: 'نقل بري عبر المركبة النفعية الخاصة بالشركة بعد تسلم رخصة الاقتناء',
  ),
  PdfFieldCoord(
    id: 'p3_storage_use_places',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'مكان و أماكن تخزين و استعمال التجهيزات',
    labelFr: 'Lieu(x) de stockage et d’utilisation des équipements',
    xLeftPct: 3.00,
    xRightPct: 71.50,
    yPct: 84.40,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: null,
    initialValue: 'المقر الاجتماعي للشركة الكائن بنهج العقيد لطفي رقم 24، بلدية وهران',
  ),
  PdfFieldCoord(
    id: 'p3_security_conditions',
    page: 3,
    section: 'المصدر والنقل وشروط الحفظ (Page 3)',
    labelAr: 'شروط حفظ التجهيزات في مأمن',
    labelFr: 'Conditions de mise en sécurité et conservation des équipements',
    xLeftPct: 3.00,
    xRightPct: 77.00,
    yPct: 86.40,
    fontSize: 11.0,
    align: 'center',
    isRtl: true,
    multiline: false,
    maskBackground: false,
    syncKey: null,
    catalogCategory: 'security_conditions',
    initialValue: 'خزانة تقنية حديدية مؤمنة بقفل مزدوج داخل مكتب المسير الرئيسي',
  )
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
  bool _strikeExternalMarket = true;

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
      SnackBar(content: Text('تم حفظ الملف في قاعدة بيانات ObjectBox (#$id)')),
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
                                        '${c.valueAr} (${c.noteFr})',
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
            '1. Traitement 100 % local sur l’appareil (ObjectBox) :\n'
            'Toutes les données saisies dans le formulaire administratif de 3 pages (identité, CNI/passeport, société, choix parmi les 69 Wilayas, inventaire des caméras et DVR) sont enregistrées exclusivement en local sur votre appareil via la base de données embarquée ObjectBox. Aucune donnée n’est transmise à un serveur externe.',
          ),
          const SizedBox(height: 12),
          const Text(
            '2. Absence totale de partage avec des tiers :\n'
            'Nous ne collectons, ne vendons et ne partageons aucune donnée personnelle ou sensible avec des tiers, régies publicitaires ou courtiers de données.',
          ),
          const SizedBox(height: 12),
          const Text(
            '3. Contrôle utilisateur et suppression des données (CRUD) :\n'
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
                        '${d.wilaya} — ${d.applicantName}',
                        style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        'العنوان: ${d.installationAddress}\nالمؤسسة المعتمدة: ${d.installerCompany}',
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
        title: Text('إدارة القائمة (ObjectBox CRUD) — ${widget.titleAr}'),
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

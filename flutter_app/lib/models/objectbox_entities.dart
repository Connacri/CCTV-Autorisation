import 'dart:convert';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../objectbox.g.dart'; // Généré par : dart run build_runner build

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
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية وهران',
    noteFr: 'Wilaya 31 - Oran (Par défaut)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية أدرار',
    noteFr: 'Wilaya 01 - Adrar',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الشلف',
    noteFr: 'Wilaya 02 - Chlef',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الأغواط',
    noteFr: 'Wilaya 03 - Laghouat',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية أم البواقي',
    noteFr: 'Wilaya 04 - Oum El Bouaghi',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية باتنة',
    noteFr: 'Wilaya 05 - Batna',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بجاية',
    noteFr: 'Wilaya 06 - Béjaïa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بسكرة',
    noteFr: 'Wilaya 07 - Biskra',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بشار',
    noteFr: 'Wilaya 08 - Béchar',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية البليدة',
    noteFr: 'Wilaya 09 - Blida',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية البويرة',
    noteFr: 'Wilaya 10 - Bouira',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تمنراست',
    noteFr: 'Wilaya 11 - Tamanrasset',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تبسة',
    noteFr: 'Wilaya 12 - Tébessa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تلمسان',
    noteFr: 'Wilaya 13 - Tlemcen',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تيارت',
    noteFr: 'Wilaya 14 - Tiaret',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تيزي وزو',
    noteFr: 'Wilaya 15 - Tizi Ouzou',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الجزائر',
    noteFr: 'Wilaya 16 - Alger',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الجلفة',
    noteFr: 'Wilaya 17 - Djelfa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية جيجل',
    noteFr: 'Wilaya 18 - Jijel',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية سطيف',
    noteFr: 'Wilaya 19 - Sétif',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية سعيدة',
    noteFr: 'Wilaya 20 - Saïda',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية سكيكدة',
    noteFr: 'Wilaya 21 - Skikda',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية سيدي بلعباس',
    noteFr: 'Wilaya 22 - Sidi Bel Abbès',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عنابة',
    noteFr: 'Wilaya 23 - Annaba',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية قالمة',
    noteFr: 'Wilaya 24 - Guelma',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية قسنطينة',
    noteFr: 'Wilaya 25 - Constantine',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية المدية',
    noteFr: 'Wilaya 26 - Médéa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية مستغانم',
    noteFr: 'Wilaya 27 - Mostaganem',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية المسيلة',
    noteFr: 'Wilaya 28 - M’Sila',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية معسكر',
    noteFr: 'Wilaya 29 - Mascara',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية ورقلة',
    noteFr: 'Wilaya 30 - Ouargla',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية البيض',
    noteFr: 'Wilaya 32 - El Bayadh',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية إيليزي',
    noteFr: 'Wilaya 33 - Illizi',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية برج بوعريريج',
    noteFr: 'Wilaya 34 - Bordj Bou Arréridj',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بومرداس',
    noteFr: 'Wilaya 35 - Boumerdès',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الطارف',
    noteFr: 'Wilaya 36 - El Tarf',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تندوف',
    noteFr: 'Wilaya 37 - Tindouf',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تسمسيلت',
    noteFr: 'Wilaya 38 - Tissemsilt',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الوادي',
    noteFr: 'Wilaya 39 - El Oued',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية خنشلة',
    noteFr: 'Wilaya 40 - Khenchela',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية سوق أهراس',
    noteFr: 'Wilaya 41 - Souk Ahras',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تيبازة',
    noteFr: 'Wilaya 42 - Tipaza',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية ميلة',
    noteFr: 'Wilaya 43 - Mila',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عين الدفلى',
    noteFr: 'Wilaya 44 - Aïn Defla',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية النعامة',
    noteFr: 'Wilaya 45 - Naâma',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عين تموشنت',
    noteFr: 'Wilaya 46 - Aïn Témouchent',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية غرداية',
    noteFr: 'Wilaya 47 - Ghardaïa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية غليزان',
    noteFr: 'Wilaya 48 - Relizane',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تيميمون',
    noteFr: 'Wilaya 49 - Timimoun',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية برج باجي مختار',
    noteFr: 'Wilaya 50 - Bordj Badji Mokhtar',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية أولاد جلال',
    noteFr: 'Wilaya 51 - Ouled Djellal',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بني عباس',
    noteFr: 'Wilaya 52 - Béni Abbès',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عين صالح',
    noteFr: 'Wilaya 53 - In Salah',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عين قزام',
    noteFr: 'Wilaya 54 - In Guezzam',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية تقرت',
    noteFr: 'Wilaya 55 - Touggourt',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية جانت',
    noteFr: 'Wilaya 56 - Djanet',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية المغير',
    noteFr: 'Wilaya 57 - El M’Ghair',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية المنيعة',
    noteFr: 'Wilaya 58 - El Meniaa',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية آفلو',
    noteFr: 'Wilaya 59 - Aflou',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بريكة',
    noteFr: 'Wilaya 60 - Barika',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية قصر الشلالة',
    noteFr: 'Wilaya 61 - Ksar Chellala',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية مسعد',
    noteFr: 'Wilaya 62 - Messaad',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية عين وسارة',
    noteFr: 'Wilaya 63 - Aïn Oussera',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بوسعادة',
    noteFr: 'Wilaya 64 - Boussaâda',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية الأبيض سيدي الشيخ',
    noteFr: 'Wilaya 65 - El Abiodh Sidi Cheikh',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية القنطرة',
    noteFr: 'Wilaya 66 - El Kantara',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية بئر العاتر',
    noteFr: 'Wilaya 67 - Bir El Ater',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية قصر البخاري',
    noteFr: 'Wilaya 68 - Ksar El Boukhari',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'wilaya',
    valueAr: 'ولاية العريشة',
    noteFr: 'Wilaya 69 - El Aricha',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 45/2023 - مؤسسة تيلي سيكوريتي، بئر الجير، وهران',
    noteFr: 'Télé-Sécurité Bir El Djir (Agrément 45/2023)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 18/2022 - شركة أورون تكنولوجي للأمن والمراقبة، السانيا، وهران',
    noteFr: 'Oran Technologie Sécurité — Es Senia (Agrément 18/2022)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 89/2024 - مؤسسة الغرب للأنظمة الإلكترونية، حي العقيد لطفي، وهران',
    noteFr: 'Al-Gharb Systèmes Électroniques — Col. Lotfi (Agrément 89/2024)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 104/2023 - شركة أطلس بروتيكت ش.ذ.م.م، نهج جبهة التحرير الوطني، وهران',
    noteFr: 'SARL Atlas Protect — Front de Mer Oran (Agrément 104/2023)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 62/2024 - مؤسسة ديجيتال فيزيون للحماية، أرزيو، ولاية وهران',
    noteFr: 'Digital Vision Protection — Arzew (Agrément 62/2024)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة بدون أشعة حمراء HIKVISION DS-2CE56D0T\nالرقم التسلسلي: HK-2026-001 إلى HK-2026-004',
    noteFr: 'Hikvision DS-2CE56D0T (Dôme Intérieur Jour sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية سقفية بدون أشعة حمراء DAHUA HAC-HDW1200M\nالرقم التسلسلي: DH-IN-8801 إلى DH-IN-8806',
    noteFr: 'Dahua HAC-HDW1200M (Dôme Intérieur 2MP sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة نهارية AXIS M3065-V بدون أشعة تحت الحمراء\nالرقم التسلسلي: AX-44101 إلى AX-44104',
    noteFr: 'Axis M3065-V (Mini-Dôme Fixe Intérieur sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة UNV UAC-T112-F28 بدون أشعة حمراء\nالرقم التسلسلي: UV-2026-101 إلى UV-2026-108',
    noteFr: 'Uniview UAC-T112-F28 (Tourelle Intérieure sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية نهارية بدون أشعة حمراء HIKVISION DS-2CE16D0T\nالرقم التسلسلي: HK-2026-005 إلى HK-2026-006',
    noteFr: 'Hikvision DS-2CE16D0T (Bullet Extérieur IP67 sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية مقاومة للعوامل الجوية بدون أشعة حمراء DAHUA HAC-HFW1200T\nالرقم التسلسلي: DH-EX-301 إلى DH-EX-304',
    noteFr: 'Dahua HAC-HFW1200T (Bullet Extérieur sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية ثابتة نهارية BOSCH DINION 4000 بدون أشعة حمراء\nالرقم التسلسلي: BS-9012 إلى BS-9015',
    noteFr: 'Bosch Dinion 4000 (Caméra Extérieure Jour sans IR)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 04 قنوات',
    noteFr: 'DVR 04 Canaux (Circuit fermé)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 08 قنوات',
    noteFr: 'DVR 08 Canaux (Circuit fermé)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 16 قناة',
    noteFr: 'DVR 16 Canaux (Circuit fermé)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو محلي NVR 08 قنوات (غير متصل بالأنترنت)',
    noteFr: 'NVR Local 08 Canaux hors-ligne',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي HIKVISION DVR-7208HQHI-K1 (بدون ربط بالأنترنت)\nالرقم التسلسلي: SN-98451200',
    noteFr: 'Hikvision DVR-7208HQHI-K1 (8ch Turbo HD)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي DAHUA XVR5108HS-I3 (محلي غير مرتبط بالأنترنت)\nالرقم التسلسلي: DH-XVR-774120',
    noteFr: 'Dahua XVR5108HS-I3 (8ch Penta-brid)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي HIKVISION iDS-7216HQHI-M1 (16 قناة محلي)\nالرقم التسلسلي: HK-DVR-663210',
    noteFr: 'Hikvision iDS-7216HQHI-M1 (16ch)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية وهران',
    noteFr: 'APC d’Oran',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة وهران',
    noteFr: 'Daïra d’Oran',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية بئر الجير',
    noteFr: 'APC de Bir El Djir',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة بئر الجير',
    noteFr: 'Daïra de Bir El Djir',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية السانيا',
    noteFr: 'APC d’Es Senia',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة أرزيو',
    noteFr: 'Daïra d’Arzew',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية عين الترك',
    noteFr: 'APC d’Aïn El Turk',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'وهران',
    noteFr: 'Oran',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'بئر الجير',
    noteFr: 'Bir El Djir',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'السانيا',
    noteFr: 'Es Senia',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'أرزيو',
    noteFr: 'Arzew',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'عين الترك',
    noteFr: 'Aïn El Turk',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'doc_location',
    valueAr: 'قديل',
    noteFr: 'Gdyel',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'nationality',
    valueAr: 'جزائرية',
    noteFr: 'Algérienne',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'profession',
    valueAr: 'مسير شركة ذات مسؤولية محدودة',
    noteFr: 'Gérant de SARL',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'profession',
    valueAr: 'مسير مؤسسة ذات شخص وحيد وذات مسؤولية محدودة',
    noteFr: 'Gérant d’EURL',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'profession',
    valueAr: 'رئيس مدير عام لشركة ذات أسهم',
    noteFr: 'PDG de SPA',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'profession',
    valueAr: 'تاجر مسجل بالسجل التجاري',
    noteFr: 'Commerçant inscrit au CNRC',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'profession',
    valueAr: 'مدير مؤسسة استشفائية خاصة',
    noteFr: 'Directeur de clinique privée',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'activity_type',
    valueAr: 'حراسة ونقل الأموال والمواد الحساسة والخدمات الأمنية',
    noteFr: 'Gardiennage et transport de fonds',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'activity_type',
    valueAr: 'تجارة التجزئة والجملة للتجهيزات المكتبية والإعلام الآلي',
    noteFr: 'Commerce de gros et détail informatique/bureautique',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'activity_type',
    valueAr: 'صناعة تحويلية وتخزين المواد الغذائية',
    noteFr: 'Industrie de transformation et stockage agroalimentaire',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'activity_type',
    valueAr: 'عيادة طبية جراحية وخدمات صحية خاصة',
    noteFr: 'Clinique médico-chirurgicale privée',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'activity_type',
    valueAr: 'صياغة وتجارة المجوهرات والمعادن الثمينة',
    noteFr: 'Bijouterie et commerce de métaux précieux',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'origin_country',
    valueAr: 'الصين (مقتناة من السوق الوطنية عبر متعامل معتمد)',
    noteFr: 'Chine (Acquis sur le marché national)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'origin_country',
    valueAr: 'كوريا الجنوبية (مقتناة من السوق الوطنية)',
    noteFr: 'Corée du Sud (Marché national)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'origin_country',
    valueAr: 'ألمانيا (مقتناة من السوق الوطنية)',
    noteFr: 'Allemagne (Marché national)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'provenance_country',
    valueAr: 'الجزائر - السوق الوطنية (ولاية وهران)',
    noteFr: 'Algérie — Marché National (Wilaya d’Oran)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'provenance_country',
    valueAr: 'الجزائر - السوق الوطنية (ولاية الجزائر)',
    noteFr: 'Algérie — Marché National (Wilaya d’Alger)',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'transport_method',
    valueAr: 'نقل بري عبر المركبة النفعية الخاصة بالشركة بعد تسلم رخصة الاقتناء',
    noteFr: 'Transport routier par véhicule utilitaire de l’entreprise',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'transport_method',
    valueAr: 'نقل بري مؤمن بواسطة مركبة المؤسسة المعتمدة للتركيب',
    noteFr: 'Transport routier assuré par le véhicule de l’installateur agréé',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'security_conditions',
    valueAr: 'خزانة تقنية حديدية مؤمنة بقفل مزدوج داخل مكتب المسير الرئيسي',
    noteFr: 'Armoire métallique sécurisée à double serrure dans le bureau du gérant',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'security_conditions',
    valueAr: 'غرفة تقنية مغلقة ومحمية بباب حديدي تحت المسؤولية المباشرة للمسير',
    noteFr: 'Local technique fermé avec porte blindée sous responsabilité du gérant',
  ),
  ChoiceCatalogItemEntity(
    categoryKey: 'security_conditions',
    valueAr: 'خزانة حائطية مصفحة ومقفلة بمفتاح خاص لدى مسؤول الأمن الداخلي',
    noteFr: 'Coffret mural blindé verrouillé sous contrôle du responsable sécurité',
  )
      ]);
    }
  }
}

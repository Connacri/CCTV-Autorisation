import {
  CatalogCategoryKey,
  SAMPLE_ARABIC_VALUES,
} from '../data/pdfSchema';
import { MarketStrikeOption } from '../utils/pdfTemplateRenderer';

/**
 * ObjectBox Entity 1: DossierSubmissionEntity
 * Represents a complete 3-page PDF dossier saved in ObjectBox history.
 */
export interface DossierSubmissionEntity {
  id: number; // @Id() in ObjectBox
  createdAt: string; // @Index() DateTime
  updatedAt: string;
  wilaya: string; // @Index()
  applicantName: string; // @Index()
  companyName: string;
  installationAddress: string;
  installerCompany: string;
  totalQty: string;
  marketStrike: MarketStrikeOption;
  values: Record<string, string>;
}

/**
 * ObjectBox Entity 2: ChoiceCatalogItemEntity
 * Represents a reusable dropdown choice item in ObjectBox with full CRUD.
 */
export interface ChoiceCatalogItemEntity {
  id: number; // @Id() in ObjectBox
  categoryKey: CatalogCategoryKey; // @Index()
  valueAr: string;
  noteFr: string;
  createdAt: string;
}

export interface LazyQueryResult<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

const DOSSIER_BOX_KEY = 'oran_objectbox_dossiers_v2';
const CATALOG_BOX_KEY = 'oran_objectbox_catalog_v2';

/**
 * Complete official list of the 69 Wilayas of Algeria
 * (58 Wilayas + 11 newly promoted Wilayas = 69 Wilayas)
 */
export const ALGERIA_69_WILAYAS: Array<{ code: string; valueAr: string; nameFr: string }> = [
  { code: '31', valueAr: 'ولاية وهران', nameFr: '31 - Oran (Par défaut)' },
  { code: '01', valueAr: 'ولاية أدرار', nameFr: '01 - Adrar' },
  { code: '02', valueAr: 'ولاية الشلف', nameFr: '02 - Chlef' },
  { code: '03', valueAr: 'ولاية الأغواط', nameFr: '03 - Laghouat' },
  { code: '04', valueAr: 'ولاية أم البواقي', nameFr: '04 - Oum El Bouaghi' },
  { code: '05', valueAr: 'ولاية باتنة', nameFr: '05 - Batna' },
  { code: '06', valueAr: 'ولاية بجاية', nameFr: '06 - Béjaïa' },
  { code: '07', valueAr: 'ولاية بسكرة', nameFr: '07 - Biskra' },
  { code: '08', valueAr: 'ولاية بشار', nameFr: '08 - Béchar' },
  { code: '09', valueAr: 'ولاية البليدة', nameFr: '09 - Blida' },
  { code: '10', valueAr: 'ولاية البويرة', nameFr: '10 - Bouira' },
  { code: '11', valueAr: 'ولاية تمنراست', nameFr: '11 - Tamanrasset' },
  { code: '12', valueAr: 'ولاية تبسة', nameFr: '12 - Tébessa' },
  { code: '13', valueAr: 'ولاية تلمسان', nameFr: '13 - Tlemcen' },
  { code: '14', valueAr: 'ولاية تيارت', nameFr: '14 - Tiaret' },
  { code: '15', valueAr: 'ولاية تيزي وزو', nameFr: '15 - Tizi Ouzou' },
  { code: '16', valueAr: 'ولاية الجزائر', nameFr: '16 - Alger' },
  { code: '17', valueAr: 'ولاية الجلفة', nameFr: '17 - Djelfa' },
  { code: '18', valueAr: 'ولاية جيجل', nameFr: '18 - Jijel' },
  { code: '19', valueAr: 'ولاية سطيف', nameFr: '19 - Sétif' },
  { code: '20', valueAr: 'ولاية سعيدة', nameFr: '20 - Saïda' },
  { code: '21', valueAr: 'ولاية سكيكدة', nameFr: '21 - Skikda' },
  { code: '22', valueAr: 'ولاية سيدي بلعباس', nameFr: '22 - Sidi Bel Abbès' },
  { code: '23', valueAr: 'ولاية عنابة', nameFr: '23 - Annaba' },
  { code: '24', valueAr: 'ولاية قالمة', nameFr: '24 - Guelma' },
  { code: '25', valueAr: 'ولاية قسنطينة', nameFr: '25 - Constantine' },
  { code: '26', valueAr: 'ولاية المدية', nameFr: '26 - Médéa' },
  { code: '27', valueAr: 'ولاية مستغانم', nameFr: '27 - Mostaganem' },
  { code: '28', valueAr: 'ولاية المسيلة', nameFr: '28 - M’Sila' },
  { code: '29', valueAr: 'ولاية معسكر', nameFr: '29 - Mascara' },
  { code: '30', valueAr: 'ولاية ورقلة', nameFr: '30 - Ouargla' },
  { code: '32', valueAr: 'ولاية البيض', nameFr: '32 - El Bayadh' },
  { code: '33', valueAr: 'ولاية إيليزي', nameFr: '33 - Illizi' },
  { code: '34', valueAr: 'ولاية برج بوعريريج', nameFr: '34 - Bordj Bou Arréridj' },
  { code: '35', valueAr: 'ولاية بومرداس', nameFr: '35 - Boumerdès' },
  { code: '36', valueAr: 'ولاية الطارف', nameFr: '36 - El Tarf' },
  { code: '37', valueAr: 'ولاية تندوف', nameFr: '37 - Tindouf' },
  { code: '38', valueAr: 'ولاية تسمسيلت', nameFr: '38 - Tissemsilt' },
  { code: '39', valueAr: 'ولاية الوادي', nameFr: '39 - El Oued' },
  { code: '40', valueAr: 'ولاية خنشلة', nameFr: '40 - Khenchela' },
  { code: '41', valueAr: 'ولاية سوق أهراس', nameFr: '41 - Souk Ahras' },
  { code: '42', valueAr: 'ولاية تيبازة', nameFr: '42 - Tipaza' },
  { code: '43', valueAr: 'ولاية ميلة', nameFr: '43 - Mila' },
  { code: '44', valueAr: 'ولاية عين الدفلى', nameFr: '44 - Aïn Defla' },
  { code: '45', valueAr: 'ولاية النعامة', nameFr: '45 - Naâma' },
  { code: '46', valueAr: 'ولاية عين تموشنت', nameFr: '46 - Aïn Témouchent' },
  { code: '47', valueAr: 'ولاية غرداية', nameFr: '47 - Ghardaïa' },
  { code: '48', valueAr: 'ولاية غليزان', nameFr: '48 - Relizane' },
  { code: '49', valueAr: 'ولاية تيميمون', nameFr: '49 - Timimoun' },
  { code: '50', valueAr: 'ولاية برج باجي مختار', nameFr: '50 - Bordj Badji Mokhtar' },
  { code: '51', valueAr: 'ولاية أولاد جلال', nameFr: '51 - Ouled Djellal' },
  { code: '52', valueAr: 'ولاية بني عباس', nameFr: '52 - Béni Abbès' },
  { code: '53', valueAr: 'ولاية عين صالح', nameFr: '53 - In Salah' },
  { code: '54', valueAr: 'ولاية عين قزام', nameFr: '54 - In Guezzam' },
  { code: '55', valueAr: 'ولاية تقرت', nameFr: '55 - Touggourt' },
  { code: '56', valueAr: 'ولاية جانت', nameFr: '56 - Djanet' },
  { code: '57', valueAr: 'ولاية المغير', nameFr: '57 - El M’Ghair' },
  { code: '58', valueAr: 'ولاية المنيعة', nameFr: '58 - El Meniaa' },
  { code: '59', valueAr: 'ولاية آفلو', nameFr: '59 - Aflou' },
  { code: '60', valueAr: 'ولاية بريكة', nameFr: '60 - Barika' },
  { code: '61', valueAr: 'ولاية قصر الشلالة', nameFr: '61 - Ksar Chellala' },
  { code: '62', valueAr: 'ولاية مسعد', nameFr: '62 - Messaad' },
  { code: '63', valueAr: 'ولاية عين وسارة', nameFr: '63 - Aïn Oussera' },
  { code: '64', valueAr: 'ولاية بوسعادة', nameFr: '64 - Boussaâda' },
  { code: '65', valueAr: 'ولاية الأبيض سيدي الشيخ', nameFr: '65 - El Abiodh Sidi Cheikh' },
  { code: '66', valueAr: 'ولاية القنطرة', nameFr: '66 - El Kantara' },
  { code: '67', valueAr: 'ولاية بئر العاتر', nameFr: '67 - Bir El Ater' },
  { code: '68', valueAr: 'ولاية قصر البخاري', nameFr: '68 - Ksar El Boukhari' },
  { code: '69', valueAr: 'ولاية العريشة', nameFr: '69 - El Aricha' },
];

export const DEFAULT_CATALOG_ITEMS: Omit<ChoiceCatalogItemEntity, 'id' | 'createdAt'>[] = [
  // 0. Les 69 Wilayas d'Algérie (الولاية في الصفحات 1 و 2 و 3)
  ...ALGERIA_69_WILAYAS.map((w) => ({
    categoryKey: 'wilaya' as CatalogCategoryKey,
    valueAr: w.valueAr,
    noteFr: `Wilaya ${w.nameFr}`,
  })),

  // 1. Entreprises d'installation agréées (مرجع اعتماد و عنوان مؤسسة تركيب الكاميرات)
  {
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 45/2023 - مؤسسة تيلي سيكوريتي، بئر الجير، وهران',
    noteFr: 'Télé-Sécurité Bir El Djir (Agrément 45/2023)',
  },
  {
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 18/2022 - شركة أورون تكنولوجي للأمن والمراقبة، السانيا، وهران',
    noteFr: 'Oran Technologie Sécurité — Es Senia (Agrément 18/2022)',
  },
  {
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 89/2024 - مؤسسة الغرب للأنظمة الإلكترونية، حي العقيد لطفي، وهران',
    noteFr: 'Al-Gharb Systèmes Électroniques — Col. Lotfi (Agrément 89/2024)',
  },
  {
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 104/2023 - شركة أطلس بروتيكت ش.ذ.م.م، نهج جبهة التحرير الوطني، وهران',
    noteFr: 'SARL Atlas Protect — Front de Mer Oran (Agrément 104/2023)',
  },
  {
    categoryKey: 'installer_company',
    valueAr: 'اعتماد رقم 62/2024 - مؤسسة ديجيتال فيزيون للحماية، أرزيو، ولاية وهران',
    noteFr: 'Digital Vision Protection — Arzew (Agrément 62/2024)',
  },

  // 2. Modèles de caméras intérieures sans IR (طبيعة كاميرات المراقبة الداخلية)
  {
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة بدون أشعة حمراء HIKVISION DS-2CE56D0T\nالرقم التسلسلي: HK-2026-001 إلى HK-2026-004',
    noteFr: 'Hikvision DS-2CE56D0T (Dôme Intérieur Jour sans IR)',
  },
  {
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية سقفية بدون أشعة حمراء DAHUA HAC-HDW1200M\nالرقم التسلسلي: DH-IN-8801 إلى DH-IN-8806',
    noteFr: 'Dahua HAC-HDW1200M (Dôme Intérieur 2MP sans IR)',
  },
  {
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة نهارية AXIS M3065-V بدون أشعة تحت الحمراء\nالرقم التسلسلي: AX-44101 إلى AX-44104',
    noteFr: 'Axis M3065-V (Mini-Dôme Fixe Intérieur sans IR)',
  },
  {
    categoryKey: 'indoor_cam_model',
    valueAr: 'كاميرا داخلية ثابتة UNV UAC-T112-F28 بدون أشعة حمراء\nالرقم التسلسلي: UV-2026-101 إلى UV-2026-108',
    noteFr: 'Uniview UAC-T112-F28 (Tourelle Intérieure sans IR)',
  },

  // 3. Modèles de caméras extérieures sans IR (طبيعة كاميرات المراقبة الخارجية)
  {
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية نهارية بدون أشعة حمراء HIKVISION DS-2CE16D0T\nالرقم التسلسلي: HK-2026-005 إلى HK-2026-006',
    noteFr: 'Hikvision DS-2CE16D0T (Bullet Extérieur IP67 sans IR)',
  },
  {
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية مقاومة للعوامل الجوية بدون أشعة حمراء DAHUA HAC-HFW1200T\nالرقم التسلسلي: DH-EX-301 إلى DH-EX-304',
    noteFr: 'Dahua HAC-HFW1200T (Bullet Extérieur sans IR)',
  },
  {
    categoryKey: 'outdoor_cam_model',
    valueAr: 'كاميرا خارجية ثابتة نهارية BOSCH DINION 4000 بدون أشعة حمراء\nالرقم التسلسلي: BS-9012 إلى BS-9015',
    noteFr: 'Bosch Dinion 4000 (Caméra Extérieure Jour sans IR)',
  },

  // 4. Désignation du type d'enregistreur (تعيين نوع المسجل)
  {
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 04 قنوات',
    noteFr: 'DVR 04 Canaux (Circuit fermé)',
  },
  {
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 08 قنوات',
    noteFr: 'DVR 08 Canaux (Circuit fermé)',
  },
  {
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو رقمي DVR 16 قناة',
    noteFr: 'DVR 16 Canaux (Circuit fermé)',
  },
  {
    categoryKey: 'recorder_designation',
    valueAr: 'مسجل فيديو محلي NVR 08 قنوات (غير متصل بالأنترنت)',
    noteFr: 'NVR Local 08 Canaux hors-ligne',
  },

  // 5. Nature de l'enregistreur (طبيعة المسجل)
  {
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي HIKVISION DVR-7208HQHI-K1 (بدون ربط بالأنترنت)\nالرقم التسلسلي: SN-98451200',
    noteFr: 'Hikvision DVR-7208HQHI-K1 (8ch Turbo HD)',
  },
  {
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي DAHUA XVR5108HS-I3 (محلي غير مرتبط بالأنترنت)\nالرقم التسلسلي: DH-XVR-774120',
    noteFr: 'Dahua XVR5108HS-I3 (8ch Penta-brid)',
  },
  {
    categoryKey: 'recorder_model',
    valueAr: 'مسجل رقمي HIKVISION iDS-7216HQHI-M1 (16 قناة محلي)\nالرقم التسلسلي: HK-DVR-663210',
    noteFr: 'Hikvision iDS-7216HQHI-M1 (16ch)',
  },

  // 6. Autorités de délivrance CNI / Passeport (الصادرة عن / الصادر عن)
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية وهران',
    noteFr: 'APC d’Oran',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة وهران',
    noteFr: 'Daïra d’Oran',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية بئر الجير',
    noteFr: 'APC de Bir El Djir',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة بئر الجير',
    noteFr: 'Daïra de Bir El Djir',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية السانيا',
    noteFr: 'APC d’Es Senia',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'دائرة أرزيو',
    noteFr: 'Daïra d’Arzew',
  },
  {
    categoryKey: 'authority_issued_by',
    valueAr: 'بلدية عين الترك',
    noteFr: 'APC d’Aïn El Turk',
  },

  // 7. Lieux de signature (حرر بـ)
  {
    categoryKey: 'doc_location',
    valueAr: 'وهران',
    noteFr: 'Oran',
  },
  {
    categoryKey: 'doc_location',
    valueAr: 'بئر الجير',
    noteFr: 'Bir El Djir',
  },
  {
    categoryKey: 'doc_location',
    valueAr: 'السانيا',
    noteFr: 'Es Senia',
  },
  {
    categoryKey: 'doc_location',
    valueAr: 'أرزيو',
    noteFr: 'Arzew',
  },
  {
    categoryKey: 'doc_location',
    valueAr: 'عين الترك',
    noteFr: 'Aïn El Turk',
  },
  {
    categoryKey: 'doc_location',
    valueAr: 'قديل',
    noteFr: 'Gdyel',
  },

  // 8. Nationalité (الجنسية)
  {
    categoryKey: 'nationality',
    valueAr: 'جزائرية',
    noteFr: 'Algérienne',
  },

  // 9. Professions (المهنة)
  {
    categoryKey: 'profession',
    valueAr: 'مسير شركة ذات مسؤولية محدودة',
    noteFr: 'Gérant de SARL',
  },
  {
    categoryKey: 'profession',
    valueAr: 'مسير مؤسسة ذات شخص وحيد وذات مسؤولية محدودة',
    noteFr: 'Gérant d’EURL',
  },
  {
    categoryKey: 'profession',
    valueAr: 'رئيس مدير عام لشركة ذات أسهم',
    noteFr: 'PDG de SPA',
  },
  {
    categoryKey: 'profession',
    valueAr: 'تاجر مسجل بالسجل التجاري',
    noteFr: 'Commerçant inscrit au CNRC',
  },
  {
    categoryKey: 'profession',
    valueAr: 'مدير مؤسسة استشفائية خاصة',
    noteFr: 'Directeur de clinique privée',
  },

  // 10. Nature des activités (نوع النشاطات)
  {
    categoryKey: 'activity_type',
    valueAr: 'حراسة ونقل الأموال والمواد الحساسة والخدمات الأمنية',
    noteFr: 'Gardiennage et transport de fonds',
  },
  {
    categoryKey: 'activity_type',
    valueAr: 'تجارة التجزئة والجملة للتجهيزات المكتبية والإعلام الآلي',
    noteFr: 'Commerce de gros et détail informatique/bureautique',
  },
  {
    categoryKey: 'activity_type',
    valueAr: 'صناعة تحويلية وتخزين المواد الغذائية',
    noteFr: 'Industrie de transformation et stockage agroalimentaire',
  },
  {
    categoryKey: 'activity_type',
    valueAr: 'عيادة طبية جراحية وخدمات صحية خاصة',
    noteFr: 'Clinique médico-chirurgicale privée',
  },
  {
    categoryKey: 'activity_type',
    valueAr: 'صياغة وتجارة المجوهرات والمعادن الثمينة',
    noteFr: 'Bijouterie et commerce de métaux précieux',
  },

  // 11. Pays d'origine (بلد منشأ التجهيزات)
  {
    categoryKey: 'origin_country',
    valueAr: 'الصين (مقتناة من السوق الوطنية عبر متعامل معتمد)',
    noteFr: 'Chine (Acquis sur le marché national)',
  },
  {
    categoryKey: 'origin_country',
    valueAr: 'كوريا الجنوبية (مقتناة من السوق الوطنية)',
    noteFr: 'Corée du Sud (Marché national)',
  },
  {
    categoryKey: 'origin_country',
    valueAr: 'ألمانيا (مقتناة من السوق الوطنية)',
    noteFr: 'Allemagne (Marché national)',
  },

  // 12. Pays de provenance (بلد قدوم التجهيزات)
  {
    categoryKey: 'provenance_country',
    valueAr: 'الجزائر - السوق الوطنية (ولاية وهران)',
    noteFr: 'Algérie — Marché National (Wilaya d’Oran)',
  },
  {
    categoryKey: 'provenance_country',
    valueAr: 'الجزائر - السوق الوطنية (ولاية الجزائر)',
    noteFr: 'Algérie — Marché National (Wilaya d’Alger)',
  },

  // 13. Modalités de transport (كيفيات نقل التجهيزات)
  {
    categoryKey: 'transport_method',
    valueAr: 'نقل بري عبر المركبة النفعية الخاصة بالشركة بعد تسلم رخصة الاقتناء',
    noteFr: 'Transport routier par véhicule utilitaire de l’entreprise',
  },
  {
    categoryKey: 'transport_method',
    valueAr: 'نقل بري مؤمن بواسطة مركبة المؤسسة المعتمدة للتركيب',
    noteFr: 'Transport routier assuré par le véhicule de l’installateur agréé',
  },

  // 14. Conditions de conservation en lieu sûr (شروط حفظ التجهيزات في مأمن)
  {
    categoryKey: 'security_conditions',
    valueAr: 'خزانة تقنية حديدية مؤمنة بقفل مزدوج داخل مكتب المسير الرئيسي',
    noteFr: 'Armoire métallique sécurisée à double serrure dans le bureau du gérant',
  },
  {
    categoryKey: 'security_conditions',
    valueAr: 'غرفة تقنية مغلقة ومحمية بباب حديدي تحت المسؤولية المباشرة للمسير',
    noteFr: 'Local technique fermé avec porte blindée sous responsabilité du gérant',
  },
  {
    categoryKey: 'security_conditions',
    valueAr: 'خزانة حائطية مصفحة ومقفلة بمفتاح خاص لدى مسؤول الأمن الداخلي',
    noteFr: 'Coffret mural blindé verrouillé sous contrôle du responsable sécurité',
  },
];

function createInitialSeedDossiers(): DossierSubmissionEntity[] {
  const base = SAMPLE_ARABIC_VALUES;

  const seeds: Array<{
    wilaya: string;
    applicant: string;
    father: string;
    mother: string;
    company: string;
    address: string;
    installer: string;
    indoorQty: string;
    outdoorQty: string;
    recQty: string;
    totalQty: string;
    date: string;
    location: string;
    createdAt: string;
  }> = [
    {
      wilaya: 'ولاية وهران',
      applicant: 'بن أحمد محمد (مسير شركة الأمان للحراسة ش.ذ.م.م)',
      father: 'عبد القادر',
      mother: 'بوزيان فاطمة الزهراء',
      company: 'الأمان للحراسة ش.ذ.م.م',
      address: 'نهج العقيد لطفي رقم 24، بلدية وهران، ولاية وهران',
      installer: 'اعتماد رقم 45/2023 - مؤسسة تيلي سيكوريتي، بئر الجير، وهران',
      indoorQty: '04',
      outdoorQty: '02',
      recQty: '01',
      totalQty: '07',
      date: '2026/10/06',
      location: 'وهران',
      createdAt: '2026-10-06T09:15:00.000Z',
    },
    {
      wilaya: 'ولاية وهران',
      applicant: 'مرادفه عبد الكريم (مسير عيادة الشفاء الجراحية)',
      father: 'لحسن',
      mother: 'بلقاسم خديجة',
      company: 'عيادة الشفاء الجراحية ش.ذ.م.م',
      address: 'حي الياسمين 2 رقم 118، بلدية بئر الجير، وهران',
      installer: 'اعتماد رقم 18/2022 - شركة أورون تكنولوجي للأمن والمراقبة، السانيا، وهران',
      indoorQty: '08',
      outdoorQty: '04',
      recQty: '01',
      totalQty: '13',
      date: '2026/10/04',
      location: 'بئر الجير',
      createdAt: '2026-10-04T14:30:00.000Z',
    },
    {
      wilaya: 'ولاية الجزائر',
      applicant: 'بن عيسى سفيان (مسير مؤسسة أطلس للتوزيع)',
      father: 'مصطفى',
      mother: 'حمزاوي سعاد',
      company: 'أطلس للتوزيع والتبريد ش.ش.و.ذ.م.م',
      address: 'المنطقة الصناعية الرويبة قطعة رقم 14، ولاية الجزائر',
      installer: 'اعتماد رقم 89/2024 - مؤسسة الغرب للأنظمة الإلكترونية',
      indoorQty: '06',
      outdoorQty: '04',
      recQty: '02',
      totalQty: '12',
      date: '2026/09/28',
      location: 'الجزائر',
      createdAt: '2026-09-28T11:20:00.000Z',
    },
    {
      wilaya: 'ولاية تلمسان',
      applicant: 'زروقي كمال (تاجر مجوهرات ومعادن ثمينة)',
      father: 'أحمد',
      mother: 'طاهري مريم',
      company: 'مجوهرات الزروقي',
      address: 'شارع العربي بن مهيدي رقم 52، تلمسان',
      installer: 'اعتماد رقم 104/2023 - شركة أطلس بروتيكت ش.ذ.م.م',
      indoorQty: '05',
      outdoorQty: '02',
      recQty: '01',
      totalQty: '08',
      date: '2026/09/19',
      location: 'تلمسان',
      createdAt: '2026/09/19T16:05:00.000Z',
    },
    {
      wilaya: 'ولاية قسنطينة',
      applicant: 'بلحاج ياسين (مسير شركة الشرق للوجستيك)',
      father: 'محمد الصالح',
      mother: 'قرطبي جميلة',
      company: 'الشرق للوجستيك ش.ذ.أ',
      address: 'المنطقة الصناعية الخروب، ولاية قسنطينة',
      installer: 'اعتماد رقم 62/2024 - مؤسسة ديجيتال فيزيون للحماية',
      indoorQty: '10',
      outdoorQty: '06',
      recQty: '02',
      totalQty: '18',
      date: '2026/09/10',
      location: 'قسنطينة',
      createdAt: '2026-09-10T10:00:00.000Z',
    },
  ];

  return seeds.map((s, idx) => ({
    id: idx + 1,
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
    wilaya: s.wilaya,
    applicantName: s.applicant,
    companyName: s.company,
    installationAddress: s.address,
    installerCompany: s.installer,
    totalQty: s.totalQty,
    marketStrike: 'strike_external',
    values: {
      ...base,
      p1_wilaya: s.wilaya,
      p2_wilaya: s.wilaya,
      p3_wilaya: s.wilaya,
      p1_applicant_name: s.applicant,
      p1_exploitation_address: s.address,
      p1_location: s.location,
      p1_date: s.date,
      p2_identity: s.applicant,
      p2_father_name: s.father,
      p2_mother_name: s.mother,
      p2_address: s.address,
      p2_company_name: s.company,
      p2_company_address: s.address,
      p2_location: s.location,
      p2_date: s.date,
      p3_identity: s.applicant,
      p3_installation_address: s.address,
      p3_installer_ref_address: s.installer,
      p3_indoor_cam_qty: s.indoorQty,
      p3_outdoor_cam_qty: s.outdoorQty,
      p3_recorder_qty: s.recQty,
      p3_total_qty: s.totalQty,
      p3_location: s.location,
      p3_date: s.date,
      p3_storage_use_places: s.address,
    },
  }));
}

class ObjectBoxDatabaseService {
  private loadDossiersFromStorage(): DossierSubmissionEntity[] {
    try {
      const raw = localStorage.getItem(DOSSIER_BOX_KEY);
      if (!raw) {
        const seeded = createInitialSeedDossiers();
        localStorage.setItem(DOSSIER_BOX_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as DossierSubmissionEntity[];
    } catch {
      return createInitialSeedDossiers();
    }
  }

  private saveDossiersToStorage(list: DossierSubmissionEntity[]): void {
    try {
      localStorage.setItem(DOSSIER_BOX_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('ObjectBox storage error:', e);
    }
  }

  private loadCatalogFromStorage(): ChoiceCatalogItemEntity[] {
    try {
      const raw = localStorage.getItem(CATALOG_BOX_KEY);
      if (!raw) {
        const seeded = this.buildDefaultCatalogEntities();
        localStorage.setItem(CATALOG_BOX_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as ChoiceCatalogItemEntity[];
    } catch {
      return this.buildDefaultCatalogEntities();
    }
  }

  private saveCatalogToStorage(list: ChoiceCatalogItemEntity[]): void {
    try {
      localStorage.setItem(CATALOG_BOX_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('ObjectBox catalog storage error:', e);
    }
  }

  private buildDefaultCatalogEntities(): ChoiceCatalogItemEntity[] {
    const now = new Date().toISOString();
    return DEFAULT_CATALOG_ITEMS.map((item, idx) => ({
      id: idx + 1,
      categoryKey: item.categoryKey,
      valueAr: item.valueAr,
      noteFr: item.noteFr,
      createdAt: now,
    }));
  }

  public queryDossiersLazy(params: {
    offset: number;
    limit: number;
    search?: string;
  }): LazyQueryResult<DossierSubmissionEntity> {
    const { offset, limit, search = '' } = params;
    const all = this.loadDossiersFromStorage().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const q = search.trim().toLowerCase();
    const filtered = q
      ? all.filter(
          (d) =>
            (d.wilaya || '').toLowerCase().includes(q) ||
            d.applicantName.toLowerCase().includes(q) ||
            d.companyName.toLowerCase().includes(q) ||
            d.installationAddress.toLowerCase().includes(q) ||
            d.installerCompany.toLowerCase().includes(q) ||
            d.createdAt.toLowerCase().includes(q)
        )
      : all;

    const sliced = filtered.slice(offset, offset + limit);
    return {
      items: sliced,
      totalCount: filtered.length,
      offset,
      limit,
      hasMore: offset + sliced.length < filtered.length,
    };
  }

  public putDossier(params: {
    id?: number;
    values: Record<string, string>;
    marketStrike: MarketStrikeOption;
  }): DossierSubmissionEntity {
    const list = this.loadDossiersFromStorage();
    const now = new Date().toISOString();

    const wilaya =
      params.values['p1_wilaya'] ||
      params.values['p2_wilaya'] ||
      params.values['p3_wilaya'] ||
      'ولاية وهران';
    const applicantName =
      params.values['p1_applicant_name'] ||
      params.values['p2_identity'] ||
      params.values['p3_identity'] ||
      'بدون اسم';
    const companyName = params.values['p2_company_name'] || 'شخص طبيعي / شركة';
    const installationAddress =
      params.values['p3_installation_address'] ||
      params.values['p1_exploitation_address'] ||
      '—';
    const installerCompany = params.values['p3_installer_ref_address'] || '—';
    const totalQty = params.values['p3_total_qty'] || '00';

    if (params.id) {
      const idx = list.findIndex((d) => d.id === params.id);
      if (idx !== -1) {
        const updated: DossierSubmissionEntity = {
          ...list[idx],
          updatedAt: now,
          wilaya,
          applicantName,
          companyName,
          installationAddress,
          installerCompany,
          totalQty,
          marketStrike: params.marketStrike,
          values: { ...params.values },
        };
        list[idx] = updated;
        this.saveDossiersToStorage(list);
        return updated;
      }
    }

    const nextId = list.reduce((max, d) => Math.max(max, d.id), 0) + 1;
    const created: DossierSubmissionEntity = {
      id: nextId,
      createdAt: now,
      updatedAt: now,
      wilaya,
      applicantName,
      companyName,
      installationAddress,
      installerCompany,
      totalQty,
      marketStrike: params.marketStrike,
      values: { ...params.values },
    };
    list.unshift(created);
    this.saveDossiersToStorage(list);
    return created;
  }

  public removeDossier(id: number): void {
    const list = this.loadDossiersFromStorage().filter((d) => d.id !== id);
    this.saveDossiersToStorage(list);
  }

  public getTotalDossierCount(): number {
    return this.loadDossiersFromStorage().length;
  }

  public getAllCatalogItems(): ChoiceCatalogItemEntity[] {
    return this.loadCatalogFromStorage();
  }

  public getChoicesByCategory(categoryKey: CatalogCategoryKey): ChoiceCatalogItemEntity[] {
    return this.loadCatalogFromStorage().filter((c) => c.categoryKey === categoryKey);
  }

  public putChoice(params: {
    id?: number;
    categoryKey: CatalogCategoryKey;
    valueAr: string;
    noteFr: string;
  }): ChoiceCatalogItemEntity {
    const list = this.loadCatalogFromStorage();
    const now = new Date().toISOString();

    if (params.id) {
      const idx = list.findIndex((c) => c.id === params.id);
      if (idx !== -1) {
        const updated: ChoiceCatalogItemEntity = {
          ...list[idx],
          categoryKey: params.categoryKey,
          valueAr: params.valueAr.trim(),
          noteFr: params.noteFr.trim(),
        };
        list[idx] = updated;
        this.saveCatalogToStorage(list);
        return updated;
      }
    }

    const nextId = list.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const created: ChoiceCatalogItemEntity = {
      id: nextId,
      categoryKey: params.categoryKey,
      valueAr: params.valueAr.trim(),
      noteFr: params.noteFr.trim() || params.valueAr.trim(),
      createdAt: now,
    };
    list.unshift(created);
    this.saveCatalogToStorage(list);
    return created;
  }

  public removeChoice(id: number): void {
    const list = this.loadCatalogFromStorage().filter((c) => c.id !== id);
    this.saveCatalogToStorage(list);
  }

  public resetDefaultCatalog(): ChoiceCatalogItemEntity[] {
    const defaults = this.buildDefaultCatalogEntities();
    this.saveCatalogToStorage(defaults);
    return defaults;
  }
}

export const objectBoxStore = new ObjectBoxDatabaseService();

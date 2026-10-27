export type DeviceType =
  | 'camera_bullet'
  | 'camera_dome'
  | 'camera_ptz'
  | 'dvr'
  | 'alarm_siren'
  | 'pir_sensor'
  | 'monitor_screen';

export type ToolType =
  | 'select'
  | 'eraser'
  | 'room'
  | 'door'
  | 'gate'
  | 'stairs'
  | 'window'
  | 'emergency_exit'
  | 'camera_bullet'
  | 'camera_dome'
  | 'camera_ptz'
  | 'dvr'
  | 'alarm_siren'
  | 'pir_sensor'
  | 'monitor_screen'
  | 'text'
  | 'measure';

export interface RoomElement {
  id: string;
  name: string;
  nameAr: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // in meters
  height: number; // in meters
  color: string;
  wallHeight: number; // meters (e.g. 2.8)
  locked?: boolean; // When true, element cannot be dragged or accidentally deleted
}

export interface DoorElement {
  id: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // width in meters (default 0.9)
  angle: number; // rotation in degrees: 0, 90, 180, 270
  isEmergencyExit: boolean;
  label?: string;
  locked?: boolean;
}

export interface GateElement {
  id: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // width in meters (default 3.5m for vehicle gate)
  angle: number; // rotation in degrees: 0, 90, 180, 270
  isMotorized: boolean; // motorized / electric gate
  label?: string;
  locked?: boolean;
}

export interface StairElement {
  id: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // width in meters (default 1.2)
  length: number; // length in meters (default 2.8)
  steps: number; // number of steps (default 12)
  angle: number; // rotation in degrees: 0, 90, 180, 270
  direction: 'up' | 'down';
  label?: string;
  locked?: boolean;
}

export interface WindowElement {
  id: string;
  x: number; // in meters
  y: number; // in meters
  width: number; // width in meters (default 1.2)
  angle: number; // rotation in degrees: 0, 90, 180, 270
  locked?: boolean;
}

export interface SecurityDeviceElement {
  id: string;
  type: DeviceType;
  x: number; // in meters
  y: number; // in meters
  z: number; // elevation in meters (e.g. 2.4 for camera, 0.7 for DVR)
  rotation: number; // direction angle in degrees (0 = right, 90 = down, etc.)
  fovAngle: number; // field of view in degrees (e.g. 75, 90, 120, 360)
  range: number; // detection range in meters (e.g. 10 to 30)
  label: string; // User display text
  modelName: string; // e.g. "Dahua HAC-HFW1500TL", "Hikvision DS-2CD2143G2"
  isOutdoor: boolean;
  resolution: string; // e.g. "5MP / 4K UHD", "4MP", "2MP Full HD"
  channel?: number;
  locked?: boolean;
}

export interface TextAnnotationElement {
  id: string;
  x: number; // in meters
  y: number; // in meters
  text: string;
  fontSize: number;
  color: string;
  locked?: boolean;
}

export interface FloorPlanData {
  id?: string;
  name: string;
  widthMeters: number; // width of total canvas
  heightMeters: number; // height of total canvas
  rooms: RoomElement[];
  doors: DoorElement[];
  gates?: GateElement[];
  stairs?: StairElement[];
  windows: WindowElement[];
  devices: SecurityDeviceElement[];
  annotations: TextAnnotationElement[];
  isStructureLocked?: boolean; // When true, entire architectural structure is frozen
  isDevicesLocked?: boolean; // When true, all security devices are frozen
}

export const PRESET_VILLA_ORAN: FloorPlanData = {
  name: 'Villa Résidentielle (Oran - Haï El Khemisti)',
  widthMeters: 22,
  heightMeters: 16,
  rooms: [
    {
      id: 'room_facade',
      name: 'Cour Extérieure & Allée',
      nameAr: 'الفناء الخارجي والمدخل',
      x: 1,
      y: 1,
      width: 20,
      height: 4,
      color: '#e2e8f0',
      wallHeight: 2.5,
    },
    {
      id: 'room_salon',
      name: 'Grand Salon & Accueil',
      nameAr: 'صالون الاستقبال الكبير',
      x: 1,
      y: 5.5,
      width: 9,
      height: 6,
      color: '#f8fafc',
      wallHeight: 3.0,
    },
    {
      id: 'room_garage',
      name: 'Garage & Accès Véhicules',
      nameAr: 'المرآب وموقف السيارات',
      x: 10.5,
      y: 5.5,
      width: 5,
      height: 6,
      color: '#f1f5f9',
      wallHeight: 3.0,
    },
    {
      id: 'room_security_post',
      name: 'Local Technique / DVR',
      nameAr: 'غرفة المراقبة وجهاز التسجيل',
      x: 16,
      y: 5.5,
      width: 5,
      height: 3,
      color: '#fef3c7',
      wallHeight: 3.0,
    },
    {
      id: 'room_depot',
      name: 'Réserve & Bureau Privé',
      nameAr: 'المخزن والمكتب الخاص',
      x: 16,
      y: 9,
      width: 5,
      height: 2.5,
      color: '#f1f5f9',
      wallHeight: 3.0,
    },
    {
      id: 'room_garden',
      name: 'Jardin Arrière & Terrasse',
      nameAr: 'الحديقة الخلفية والفناء',
      x: 1,
      y: 12,
      width: 20,
      height: 3.5,
      color: '#ecfdf5',
      wallHeight: 2.2,
    },
  ],
  doors: [
    {
      id: 'door_main',
      x: 5,
      y: 5.5,
      width: 1.1,
      angle: 0,
      isEmergencyExit: false,
      label: 'Porte Principale',
    },
    {
      id: 'door_garage',
      x: 13,
      y: 5.5,
      width: 2.4,
      angle: 0,
      isEmergencyExit: false,
      label: 'Portail Garage',
    },
    {
      id: 'door_exit_back',
      x: 6,
      y: 11.5,
      width: 1.0,
      angle: 0,
      isEmergencyExit: true,
      label: 'Issue de Secours Arrière',
    },
  ],
  gates: [
    {
      id: 'gate_main_villa',
      x: 11,
      y: 1.0,
      width: 3.6,
      angle: 0,
      isMotorized: true,
      label: 'Portail Véhicules Motorisé (3.6m)',
    },
  ],
  stairs: [
    {
      id: 'stairs_main_villa',
      x: 8.5,
      y: 6.5,
      width: 1.2,
      length: 2.8,
      steps: 12,
      angle: 90,
      direction: 'up',
      label: 'Escalier Accès 1er Étage',
    },
  ],
  windows: [
    { id: 'win_1', x: 2.5, y: 5.5, width: 1.5, angle: 0 },
    { id: 'win_2', x: 8, y: 5.5, width: 1.5, angle: 0 },
    { id: 'win_3', x: 2.5, y: 11.5, width: 1.5, angle: 0 },
  ],
  devices: [
    {
      id: 'dev_cam1',
      type: 'camera_bullet',
      x: 1.5,
      y: 1.5,
      z: 2.8,
      rotation: 60,
      fovAngle: 85,
      range: 12,
      label: 'CAM-01 Façade Ouest (Bullet 5MP)',
      modelName: 'Dahua IPC-HFW2431S',
      isOutdoor: true,
      resolution: '5MP 4K UHD - IR 30m',
      channel: 1,
    },
    {
      id: 'dev_cam2',
      type: 'camera_bullet',
      x: 11.0,
      y: 1.8,
      z: 2.8,
      rotation: 90,
      fovAngle: 85,
      range: 12,
      label: 'CAM-02 Portail & Entrée Véhicules (LPR)',
      modelName: 'Dahua IPC-HFW2431S',
      isOutdoor: true,
      resolution: '5MP 4K UHD - IR 30m',
      channel: 2,
    },
    {
      id: 'dev_cam3',
      type: 'camera_dome',
      x: 5.5,
      y: 8,
      z: 2.7,
      rotation: 0,
      fovAngle: 110,
      range: 8,
      label: 'CAM-03 Salon & Hall (Dôme Intérieur)',
      modelName: 'Hikvision DS-2CD2143G2-I',
      isOutdoor: false,
      resolution: '4MP AcuSense 1080p',
      channel: 3,
    },
    {
      id: 'dev_cam4',
      type: 'camera_bullet',
      x: 10.5,
      y: 14.5,
      z: 2.6,
      rotation: 270,
      fovAngle: 90,
      range: 10,
      label: 'CAM-04 Jardin Arrière (Bullet IP67)',
      modelName: 'Dahua IPC-HFW1431S',
      isOutdoor: true,
      resolution: '4MP Vision Nocturne',
      channel: 4,
    },
    {
      id: 'dev_ptz1',
      type: 'camera_ptz',
      x: 19.5,
      y: 1.5,
      z: 3.5,
      rotation: 180,
      fovAngle: 360,
      range: 25,
      label: 'CAM-05 Dôme PTZ 360° Cour & Angle',
      modelName: 'Dahua SD49225XA-HNR (25x Optical Zoom)',
      isOutdoor: true,
      resolution: '4MP PTZ 360° Starlight',
      channel: 5,
    },
    {
      id: 'dev_dvr',
      type: 'dvr',
      x: 18.2,
      y: 6.8,
      z: 0.8,
      rotation: 0,
      fovAngle: 0,
      range: 0,
      label: 'NVR / DVR 16 Voies 4K (Dahua NVR4116)',
      modelName: 'Dahua NVR4116-4KS2/L (HDD 4To)',
      isOutdoor: false,
      resolution: '16 Canaux 4K H.265+',
    },
    {
      id: 'dev_monitor',
      type: 'monitor_screen',
      x: 19.5,
      y: 6.8,
      z: 1.2,
      rotation: 0,
      fovAngle: 0,
      range: 0,
      label: 'Moniteur Surveillance 32" 4K',
      modelName: 'Dahua DHI-LM32-F200 LED',
      isOutdoor: false,
      resolution: '4K Ultra HD',
    },
    {
      id: 'dev_pir',
      type: 'pir_sensor',
      x: 1.5,
      y: 6.0,
      z: 2.2,
      rotation: 45,
      fovAngle: 90,
      range: 8,
      label: 'Détecteur Mouvement PIR Entrée',
      modelName: 'Ajax MotionProtect Plus',
      isOutdoor: false,
      resolution: 'Capteur double technologie',
    },
    {
      id: 'dev_alarm',
      type: 'alarm_siren',
      x: 18.5,
      y: 5.6,
      z: 2.8,
      rotation: 90,
      fovAngle: 180,
      range: 15,
      label: 'Centrale Alarme & Sirène Flash Extérieure',
      modelName: 'Ajax Hub 2 Plus + StreetSiren',
      isOutdoor: true,
      resolution: '113 dB + Flash LED',
    },
  ],
  annotations: [
    {
      id: 'ann_1',
      x: 1.5,
      y: 4.5,
      text: 'Zone publique sous surveillance 24h/24',
      fontSize: 12,
      color: '#047857',
    },
    {
      id: 'ann_2',
      x: 16.2,
      y: 8.2,
      text: 'Baie réseau sécurisée sous clé',
      fontSize: 11,
      color: '#b45309',
    },
  ],
};

export const PRESET_STORE_ORAN: FloorPlanData = {
  name: 'Local Commercial / Supérette (Oran Centre)',
  widthMeters: 18,
  heightMeters: 14,
  rooms: [
    {
      id: 'store_sales',
      name: 'Espace de Vente & Rayonnages',
      nameAr: 'قاعة العرض والبيع',
      x: 1,
      y: 1,
      width: 11,
      height: 12,
      color: '#ffffff',
      wallHeight: 3.2,
    },
    {
      id: 'store_checkout',
      name: 'Zone Caisses & Entrée',
      nameAr: 'منطقة الصناديق والمحاسبة',
      x: 12.5,
      y: 1,
      width: 4.5,
      height: 5,
      color: '#f8fafc',
      wallHeight: 3.2,
    },
    {
      id: 'store_stock',
      name: 'Réserve Marchandises / Stock',
      nameAr: 'مستودع تخزين البضائع',
      x: 12.5,
      y: 6.5,
      width: 4.5,
      height: 6.5,
      color: '#f1f5f9',
      wallHeight: 3.2,
    },
  ],
  doors: [
    {
      id: 'd_store_front',
      x: 14.5,
      y: 1,
      width: 1.6,
      angle: 0,
      isEmergencyExit: false,
      label: 'Entrée Clientèle',
    },
    {
      id: 'd_store_emergency',
      x: 12.5,
      y: 12.5,
      width: 1.0,
      angle: 90,
      isEmergencyExit: true,
      label: 'Issue de Secours',
    },
  ],
  gates: [
    {
      id: 'gate_store_loading',
      x: 14.0,
      y: 13.0,
      width: 2.8,
      angle: 0,
      isMotorized: false,
      label: 'Rideau Métallique / Portail Livraison',
    },
  ],
  stairs: [
    {
      id: 'stairs_store_mezzanine',
      x: 13.0,
      y: 7.2,
      width: 1.0,
      length: 2.4,
      steps: 10,
      angle: 0,
      direction: 'up',
      label: 'Escalier Accès Mezzanine & Stock',
    },
  ],
  windows: [
    { id: 'w_store_1', x: 2, y: 1, width: 3, angle: 0 },
    { id: 'w_store_2', x: 6, y: 1, width: 3, angle: 0 },
  ],
  devices: [
    {
      id: 'scam_1',
      type: 'camera_dome',
      x: 14.5,
      y: 3.2,
      z: 2.8,
      rotation: 180,
      fovAngle: 100,
      range: 6,
      label: 'CAM-01 Surveillance Caisse (Dôme 5MP)',
      modelName: 'Hikvision DS-2CD2143G2',
      isOutdoor: false,
      resolution: '5MP HD Audio',
      channel: 1,
    },
    {
      id: 'scam_2',
      type: 'camera_dome',
      x: 6.5,
      y: 6.5,
      z: 3.0,
      rotation: 0,
      fovAngle: 120,
      range: 9,
      label: 'CAM-02 Rayons Centraux (Dôme 360°)',
      modelName: 'Dahua IPC-HDBW2431E',
      isOutdoor: false,
      resolution: '4MP Grand Angle',
      channel: 2,
    },
    {
      id: 'scam_3',
      type: 'camera_bullet',
      x: 14.8,
      y: 0.8,
      z: 3.1,
      rotation: 270,
      fovAngle: 80,
      range: 14,
      label: 'CAM-03 Façade & Trottoir Extérieur',
      modelName: 'Dahua IPC-HFW2431S',
      isOutdoor: true,
      resolution: '5MP IR 30m',
      channel: 3,
    },
    {
      id: 'scam_4',
      type: 'camera_bullet',
      x: 13,
      y: 7.2,
      z: 2.8,
      rotation: 45,
      fovAngle: 85,
      range: 8,
      label: 'CAM-04 Réserve & Quai Déchargement',
      modelName: 'Hikvision DS-2CD1043G0',
      isOutdoor: false,
      resolution: '4MP IR',
      channel: 4,
    },
    {
      id: 's_dvr',
      type: 'dvr',
      x: 15.5,
      y: 11.5,
      z: 1.0,
      rotation: 0,
      fovAngle: 0,
      range: 0,
      label: 'Enregistreur NVR 8 Voies (Coffre Blindé)',
      modelName: 'Dahua NVR2108HS-4KS2',
      isOutdoor: false,
      resolution: '8 Canaux 4K',
    },
    {
      id: 's_monitor',
      type: 'monitor_screen',
      x: 13.5,
      y: 2.5,
      z: 1.4,
      rotation: 180,
      fovAngle: 0,
      range: 0,
      label: 'Moniteur Surveillance Caisse',
      modelName: 'Moniteur 24" Full HD',
      isOutdoor: false,
      resolution: '1080p',
    },
    {
      id: 's_alarm',
      type: 'alarm_siren',
      x: 14.5,
      y: 0.9,
      z: 3.2,
      rotation: 270,
      fovAngle: 180,
      range: 15,
      label: 'Sirène Alarme Anti-intrusion Auto-protégée',
      modelName: 'Sirène Extérieure Flash Rouge',
      isOutdoor: true,
      resolution: '115 dB',
    },
  ],
  annotations: [
    {
      id: 's_ann_1',
      x: 12.6,
      y: 4.8,
      text: 'Affichage légal : Établissement sous vidéosurveillance',
      fontSize: 10,
      color: '#047857',
    },
  ],
};

export const PRESET_BLANK: FloorPlanData = {
  name: 'Nouveau Bâti Vierge',
  widthMeters: 20,
  heightMeters: 14,
  rooms: [],
  doors: [],
  gates: [],
  stairs: [],
  windows: [],
  devices: [],
  annotations: [],
};

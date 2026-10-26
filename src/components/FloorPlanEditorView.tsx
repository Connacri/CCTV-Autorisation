import React, { useRef, useState, useEffect } from 'react';
import {
  FloorPlanData,
  DeviceType,
  ToolType,
  RoomElement,
  DoorElement,
  WindowElement,
  SecurityDeviceElement,
  TextAnnotationElement,
  PRESET_VILLA_ORAN,
  PRESET_STORE_ORAN,
  PRESET_BLANK,
} from '../data/floorPlanSchema';
import { FloorPlan3DCanvas } from './FloorPlan3DCanvas';
import {
  Video,
  Box,
  DoorOpen,
  AppWindow,
  ShieldAlert,
  Server,
  Type,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  CheckCircle2,
  Move,
  RotateCw,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2,
  Check,
  Eraser,
  Undo2,
  Redo2,
  X,
} from 'lucide-react';
import { AppLocale, TRANSLATIONS } from '../i18n/translations';

interface FloorPlanEditorViewProps {
  locale: AppLocale;
  onSyncWithPdfForm?: (stats: {
    indoorCamQty: number;
    outdoorCamQty: number;
    totalCamQty: number;
    recorderQty: number;
    camTypesSummary: string;
    recorderTypeSummary: string;
  }) => void;
  applicantName?: string;
}

export const FloorPlanEditorView: React.FC<FloorPlanEditorViewProps> = ({
  locale,
  onSyncWithPdfForm,
  applicantName = 'Demandeur Wilaya d’Oran',
}) => {
  const t = TRANSLATIONS[locale];
  const isRtl = locale === 'ar';

  // Persistence key
  const STORAGE_KEY = 'cctv_floor_plan_data_v1';

  const [plan, setPlan] = useState<FloorPlanData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Erreur chargement plan:', e);
      }
    }
    return PRESET_VILLA_ORAN;
  });

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>('dev_cam1');
  const [selectedType, setSelectedType] = useState<
    'room' | 'door' | 'window' | 'device' | 'annotation' | null
  >('device');

  // Drawing state for 2D canvas
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawCoord, setCurrentDrawCoord] = useState<{ x: number; y: number } | null>(null);

  // Dragging state for moving elements
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Undo & Redo History (Snapshots of plan, up to 30 states)
  const [undoStack, setUndoStack] = useState<FloorPlanData[]>([]);
  const [redoStack, setRedoStack] = useState<FloorPlanData[]>([]);
  const dragStartPlanRef = useRef<FloorPlanData | null>(null);

  // Hover state for Eraser tool
  const [hoveredEraseId, setHoveredEraseId] = useState<string | null>(null);

  // Save snapshot to undo stack before any modification
  const recordUndoSnapshot = (customSnapshot?: FloorPlanData) => {
    const snapshot = customSnapshot
      ? JSON.parse(JSON.stringify(customSnapshot))
      : JSON.parse(JSON.stringify(plan));
    setUndoStack((prev) => [...prev.slice(-29), snapshot]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    setRedoStack((r) => [...r.slice(-29), JSON.parse(JSON.stringify(plan))]);
    setUndoStack(newUndoStack);
    setPlan(previous);
    setSelectedId(null);
    setSelectedType(null);
    setHoveredEraseId(null);
    showToast(isRtl ? 'تم التراجع عن آخر تعديل (Ctrl+Z)' : 'Action annulée (Ctrl+Z)');
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    setUndoStack((u) => [...u.slice(-29), JSON.parse(JSON.stringify(plan))]);
    setRedoStack(newRedoStack);
    setPlan(next);
    setSelectedId(null);
    setSelectedType(null);
    setHoveredEraseId(null);
    showToast(isRtl ? 'تمت استعادة التعديل (Ctrl+Y)' : 'Action rétablie (Ctrl+Y)');
  };

  const handleEraseElement = (
    id: string,
    type: 'room' | 'door' | 'window' | 'device' | 'annotation'
  ) => {
    recordUndoSnapshot();
    setPlan((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== id),
      doors: prev.doors.filter((d) => d.id !== id),
      windows: prev.windows.filter((w) => w.id !== id),
      devices: prev.devices.filter((dev) => dev.id !== id),
      annotations: prev.annotations.filter((a) => a.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
    setHoveredEraseId(null);
    const labelMap: Record<string, string> = {
      room: isRtl ? 'تم مسح الغرفة' : 'Pièce effacée',
      door: isRtl ? 'تم مسح الباب' : 'Porte effacée',
      window: isRtl ? 'تم مسح النافذة' : 'Fenêtre effacée',
      device: isRtl ? 'تم مسح الكاميرا / الجهاز' : 'Équipement effacé',
      annotation: isRtl ? 'تم مسح النص' : 'Texte effacé',
    };
    showToast(labelMap[type] || (isRtl ? 'تم مسح العنصر' : 'Élément effacé avec la gomme'));
  };

  // Keyboard shortcut listener for Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z, E (Eraser), S (Select), Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (isCmdOrCtrl && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'e' || e.key === 'E') {
        if (!isCmdOrCtrl) {
          e.preventDefault();
          setActiveTool('eraser');
          showToast(
            isRtl
              ? 'أداة الممحاة مفعلة'
              : 'Outil Gomme activé [E] : cliquez sur un élément pour l’effacer'
          );
        }
      } else if (e.key === 's' || e.key === 'S' || e.key === 'v' || e.key === 'V') {
        if (!isCmdOrCtrl) {
          e.preventDefault();
          setActiveTool('select');
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !isDrawingRoom) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, plan, selectedId, isDrawingRoom, isRtl]);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
      } catch (e) {
        console.error('Erreur sauvegarde plan:', e);
      }
    }
  }, [plan]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Metrics & Stats for Dossier Sync
  const bulletCount = plan.devices.filter((d) => d.type === 'camera_bullet').length;
  const domeCount = plan.devices.filter((d) => d.type === 'camera_dome').length;
  const totalCams = bulletCount + domeCount;
  const indoorCams = plan.devices.filter(
    (d) => (d.type === 'camera_bullet' || d.type === 'camera_dome') && !d.isOutdoor
  ).length;
  const outdoorCams = plan.devices.filter(
    (d) => (d.type === 'camera_bullet' || d.type === 'camera_dome') && d.isOutdoor
  ).length;
  const dvrCount = plan.devices.filter((d) => d.type === 'dvr').length;
  const alarmCount = plan.devices.filter((d) => d.type === 'alarm_siren').length;

  // Selected item reference
  const selectedDevice = plan.devices.find((d) => d.id === selectedId);
  const selectedRoom = plan.rooms.find((r) => r.id === selectedId);
  const selectedDoor = plan.doors.find((d) => d.id === selectedId);
  const selectedWindow = plan.windows.find((w) => w.id === selectedId);
  const selectedAnnotation = plan.annotations.find((a) => a.id === selectedId);

  // Scale: pixels per meter on 2D SVG canvas
  const SCALE = 36; // 36 px = 1 meter
  const canvasWidthPx = plan.widthMeters * SCALE;
  const canvasHeightPx = plan.heightMeters * SCALE;

  // Long-Press Quick Creation Menu State
  interface LongPressMenuState {
    x: number;
    y: number;
    pixelX: number;
    pixelY: number;
  }
  const [longPressMenu, setLongPressMenu] = useState<LongPressMenuState | null>(null);
  const longPressTimerRef = useRef<any>(null);
  const pressStartPosRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Coordinate conversion helper (supports Mouse and Touch)
  const getCanvasCoords = (e: React.MouseEvent<any> | React.TouchEvent<any> | MouseEvent | TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0, rawX: 0, rawY: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in (e as any)) {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }
    const pixelX = clientX - rect.left;
    const pixelY = clientY - rect.top;
    // Snap to 0.25m grid for smooth sliding
    const rawMeterX = pixelX / SCALE;
    const rawMeterY = pixelY / SCALE;
    const snapMeterX = Math.round(rawMeterX * 4) / 4;
    const snapMeterY = Math.round(rawMeterY * 4) / 4;
    return {
      x: Math.max(0, Math.min(plan.widthMeters, snapMeterX)),
      y: Math.max(0, Math.min(plan.heightMeters, snapMeterY)),
      rawX: pixelX,
      rawY: pixelY,
    };
  };

  const startLongPressTimer = (
    clientX: number,
    clientY: number,
    coords: { x: number; y: number; rawX: number; rawY: number }
  ) => {
    if (activeTool === 'eraser') return;
    pressStartPosRef.current = { clientX, clientY };
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressMenu({
        x: coords.x,
        y: coords.y,
        pixelX: coords.rawX,
        pixelY: coords.rawY,
      });
      longPressTimerRef.current = null;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(45);
        } catch (_) {}
      }
    }, 450);
  };

  const cancelLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressStartPosRef.current = null;
  };

  // Centralized Device / Opening Creation Helper
  const createDeviceOrElementAtCoords = (tool: ToolType, x: number, y: number) => {
    if (tool === 'room' || tool === 'eraser' || tool === 'select') return;

    if (tool === 'door') {
      const newDoor: DoorElement = {
        id: `door_${Date.now()}`,
        x,
        y,
        width: 1.0,
        angle: 0,
        isEmergencyExit: false,
        label: 'Porte d’accès',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, doors: [...prev.doors, newDoor] }));
      setSelectedId(newDoor.id);
      setSelectedType('door');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة الباب (Ctrl+Z للتراجع)' : 'Porte ajoutée sur le plan (Ctrl+Z pour annuler).');
    } else if (tool === 'emergency_exit') {
      const newExit: DoorElement = {
        id: `exit_${Date.now()}`,
        x,
        y,
        width: 1.1,
        angle: 0,
        isEmergencyExit: true,
        label: 'Issue de Secours',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, doors: [...prev.doors, newExit] }));
      setSelectedId(newExit.id);
      setSelectedType('door');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة مخرج الطوارئ (Ctrl+Z للتراجع)' : 'Issue de secours ajoutée sur le plan (Ctrl+Z pour annuler).');
    } else if (tool === 'window') {
      const newWin: WindowElement = {
        id: `win_${Date.now()}`,
        x,
        y,
        width: 1.4,
        angle: 0,
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, windows: [...prev.windows, newWin] }));
      setSelectedId(newWin.id);
      setSelectedType('window');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة النافذة (Ctrl+Z للتراجع)' : 'Fenêtre ajoutée sur le plan (Ctrl+Z pour annuler).');
    } else if (tool === 'camera_bullet') {
      const nextNum = bulletCount + 1;
      const newCam: SecurityDeviceElement = {
        id: `dev_bullet_${Date.now()}`,
        type: 'camera_bullet',
        x,
        y,
        z: 2.8,
        rotation: 45,
        fovAngle: 85,
        range: 12,
        label: `CAM-${String(nextNum).padStart(2, '0')} Bullet Extérieure`,
        modelName: 'Dahua IPC-HFW2431S 4MP',
        isOutdoor: true,
        resolution: '4MP / IR 30m',
        channel: totalCams + 1,
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newCam] }));
      setSelectedId(newCam.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة كاميرا أفقية (اسحب لتحريك الكاميرا)' : 'Caméra Bullet placée (Glissez pour déplacer / Ctrl+Z).');
    } else if (tool === 'camera_dome') {
      const nextNum = domeCount + 1;
      const newDome: SecurityDeviceElement = {
        id: `dev_dome_${Date.now()}`,
        type: 'camera_dome',
        x,
        y,
        z: 2.7,
        rotation: 0,
        fovAngle: 110,
        range: 8,
        label: `CAM-${String(nextNum).padStart(2, '0')} Dôme Intérieure`,
        modelName: 'Hikvision DS-2CD2143G2 4MP',
        isOutdoor: false,
        resolution: '4MP AcuSense 1080p',
        channel: totalCams + 1,
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newDome] }));
      setSelectedId(newDome.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة كاميرا دائرية (اسحب لتحريك الكاميرا)' : 'Caméra Dôme placée (Glissez pour déplacer / Ctrl+Z).');
    } else if (tool === 'dvr') {
      const newDvr: SecurityDeviceElement = {
        id: `dev_dvr_${Date.now()}`,
        type: 'dvr',
        x,
        y,
        z: 0.8,
        rotation: 0,
        fovAngle: 0,
        range: 0,
        label: 'Enregistreur NVR/DVR 16 Voies',
        modelName: 'Dahua NVR4116-4KS2',
        isOutdoor: false,
        resolution: '16 Canaux 4K',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newDvr] }));
      setSelectedId(newDvr.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة جهاز التسجيل DVR' : 'Enregistreur DVR placé (Glissez pour déplacer / Ctrl+Z).');
    } else if (tool === 'alarm_siren') {
      const newAlarm: SecurityDeviceElement = {
        id: `dev_alarm_${Date.now()}`,
        type: 'alarm_siren',
        x,
        y,
        z: 2.8,
        rotation: 0,
        fovAngle: 180,
        range: 15,
        label: 'Sirène Extérieure & Flash Alarme',
        modelName: 'StreetSiren 113dB',
        isOutdoor: true,
        resolution: 'Alarme sonore & lumineuse',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newAlarm] }));
      setSelectedId(newAlarm.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة صفارة الإنذار' : 'Sirène d’alarme placée (Glissez pour déplacer / Ctrl+Z).');
    } else if (tool === 'text') {
      const newAnn: TextAnnotationElement = {
        id: `ann_${Date.now()}`,
        x,
        y,
        text: 'Zone de surveillance',
        fontSize: 12,
        color: '#047857',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, annotations: [...prev.annotations, newAnn] }));
      setSelectedId(newAnn.id);
      setSelectedType('annotation');
      setActiveTool('select');
      showToast(isRtl ? 'تمت إضافة النص' : 'Texte ajouté sur le plan (Ctrl+Z pour annuler).');
    }
  };

  // Canvas Click / MouseDown Handler
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (longPressMenu) {
      setLongPressMenu(null);
    }
    const coords = getCanvasCoords(e);

    // If in select, room, or device mode, initiate long-press detection
    if (activeTool === 'select' || activeTool === 'camera_bullet' || activeTool === 'camera_dome') {
      startLongPressTimer(e.clientX, e.clientY, coords);
    }

    if (activeTool === 'room') {
      setIsDrawingRoom(true);
      setDrawStart(coords);
      setCurrentDrawCoord(coords);
    } else if (
      activeTool === 'door' ||
      activeTool === 'emergency_exit' ||
      activeTool === 'window' ||
      activeTool === 'camera_bullet' ||
      activeTool === 'camera_dome' ||
      activeTool === 'dvr' ||
      activeTool === 'alarm_siren' ||
      activeTool === 'text'
    ) {
      createDeviceOrElementAtCoords(activeTool, coords.x, coords.y);
    } else if (activeTool === 'select') {
      // Clicked on empty canvas background -> deselect
      if ((e.target as HTMLElement).tagName === 'svg') {
        setSelectedId(null);
        setSelectedType(null);
      }
    }
  };

  const handleSvgMouseMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in (e as any)) {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    if (pressStartPosRef.current) {
      const dist = Math.hypot(
        clientX - pressStartPosRef.current.clientX,
        clientY - pressStartPosRef.current.clientY
      );
      if (dist > 8) {
        cancelLongPressTimer();
      }
    }

    const coords = getCanvasCoords(e);
    if (isDrawingRoom) {
      setCurrentDrawCoord(coords);
    } else if (isDraggingElement && selectedId) {
      const newX = Math.max(0, Math.min(plan.widthMeters, coords.x - dragOffset.x));
      const newY = Math.max(0, Math.min(plan.heightMeters, coords.y - dragOffset.y));

      setPlan((prev) => {
        if (selectedType === 'device') {
          return {
            ...prev,
            devices: prev.devices.map((d) =>
              d.id === selectedId ? { ...d, x: newX, y: newY } : d
            ),
          };
        }
        if (selectedType === 'room') {
          return {
            ...prev,
            rooms: prev.rooms.map((r) =>
              r.id === selectedId ? { ...r, x: newX, y: newY } : r
            ),
          };
        }
        if (selectedType === 'door') {
          return {
            ...prev,
            doors: prev.doors.map((d) =>
              d.id === selectedId ? { ...d, x: newX, y: newY } : d
            ),
          };
        }
        if (selectedType === 'window') {
          return {
            ...prev,
            windows: prev.windows.map((w) =>
              w.id === selectedId ? { ...w, x: newX, y: newY } : w
            ),
          };
        }
        if (selectedType === 'annotation') {
          return {
            ...prev,
            annotations: prev.annotations.map((a) =>
              a.id === selectedId ? { ...a, x: newX, y: newY } : a
            ),
          };
        }
        return prev;
      });
    }
  };

  const handleSvgMouseUp = () => {
    cancelLongPressTimer();

    if (isDrawingRoom && drawStart && currentDrawCoord) {
      const x = Math.min(drawStart.x, currentDrawCoord.x);
      const y = Math.min(drawStart.y, currentDrawCoord.y);
      const width = Math.max(1.5, Math.abs(currentDrawCoord.x - drawStart.x));
      const height = Math.max(1.5, Math.abs(currentDrawCoord.y - drawStart.y));

      const newRoom: RoomElement = {
        id: `room_${Date.now()}`,
        name: `Pièce / Zone ${plan.rooms.length + 1}`,
        nameAr: `قاعة / منطقة ${plan.rooms.length + 1}`,
        x,
        y,
        width,
        height,
        color: '#f8fafc',
        wallHeight: 2.8,
      };

      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
      setSelectedId(newRoom.id);
      setSelectedType('room');
      setIsDrawingRoom(false);
      setDrawStart(null);
      setCurrentDrawCoord(null);
      setActiveTool('select');
      showToast(isRtl ? 'تم رسم الغرفة بنجاح (Ctrl+Z للتراجع)' : 'Nouvelle pièce dessinée (Ctrl+Z pour annuler).');
    }

    if (isDraggingElement && dragStartPlanRef.current) {
      if (JSON.stringify(dragStartPlanRef.current) !== JSON.stringify(plan)) {
        setUndoStack((prev) => [...prev.slice(-29), dragStartPlanRef.current!]);
        setRedoStack([]);
      }
      dragStartPlanRef.current = null;
    }
    setIsDraggingElement(false);
  };

  // Select element on click/touch or erase if in eraser mode (Always enables direct dragging/sliding)
  const handleElementMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    type: 'room' | 'door' | 'window' | 'device' | 'annotation',
    itemX: number,
    itemY: number
  ) => {
    e.stopPropagation();
    cancelLongPressTimer();

    if (activeTool === 'eraser') {
      handleEraseElement(id, type);
      return;
    }

    // Direct sliding: immediately activate select and start dragging!
    setActiveTool('select');
    dragStartPlanRef.current = JSON.parse(JSON.stringify(plan));
    setSelectedId(id);
    setSelectedType(type);
    setIsDraggingElement(true);
    const coords = getCanvasCoords(e as any);
    setDragOffset({ x: coords.x - itemX, y: coords.y - itemY });
  };

  // Rotate selected item
  const handleRotateSelected = (delta: number) => {
    if (!selectedId) return;
    recordUndoSnapshot();
    setPlan((prev) => {
      if (selectedType === 'device') {
        return {
          ...prev,
          devices: prev.devices.map((d) =>
            d.id === selectedId
              ? { ...d, rotation: (d.rotation + delta + 360) % 360 }
              : d
          ),
        };
      }
      if (selectedType === 'door') {
        return {
          ...prev,
          doors: prev.doors.map((d) =>
            d.id === selectedId
              ? { ...d, angle: (d.angle + delta + 360) % 360 }
              : d
          ),
        };
      }
      if (selectedType === 'window') {
        return {
          ...prev,
          windows: prev.windows.map((w) =>
            w.id === selectedId
              ? { ...w, angle: (w.angle + delta + 360) % 360 }
              : w
          ),
        };
      }
      return prev;
    });
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    recordUndoSnapshot();
    setPlan((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== selectedId),
      doors: prev.doors.filter((d) => d.id !== selectedId),
      windows: prev.windows.filter((w) => w.id !== selectedId),
      devices: prev.devices.filter((dev) => dev.id !== selectedId),
      annotations: prev.annotations.filter((a) => a.id !== selectedId),
    }));
    setSelectedId(null);
    setSelectedType(null);
    setHoveredEraseId(null);
    showToast(isRtl ? 'تم حذف العنصر (يمكنك التراجع بـ Ctrl+Z)' : 'Élément supprimé (annulable via Ctrl+Z).');
  };

  // Synchronize with DRAG Oran PDF Page 3
  const handleSyncToForm = () => {
    if (onSyncWithPdfForm) {
      const camTypesSummary = `${bulletCount} Bullet Ext. (${outdoorCams} Ext / ${indoorCams} Int)`;
      const recorderTypeSummary = `${dvrCount} NVR/DVR 16 Voies`;
      onSyncWithPdfForm({
        indoorCamQty: indoorCams,
        outdoorCamQty: outdoorCams,
        totalCamQty: totalCams,
        recorderQty: dvrCount,
        camTypesSummary,
        recorderTypeSummary,
      });
      showToast(
        `Synchronisé ! Page 3 du Formulaire DRAG mise à jour : ${totalCams} caméras (${outdoorCams} ext, ${indoorCams} int), ${dvrCount} DVR.`
      );
    }
  };

  // Export Plan to High-Resolution PNG Image with Cartouche
  const handleExportPlanImage = () => {
    const canvas = document.createElement('canvas');
    const width = 1600;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title Block / Cartouche Officiel DRAG Oran
    ctx.fillStyle = '#047857';
    ctx.fillRect(0, 0, width, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DIRECTION DE LA RÉGLEMENTATION ET DES AFFAIRES GÉNÉRALES (DRAG) · WILAYA D’ORAN', 30, 36);
    ctx.font = '15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Plan de Situation & Implantation CCTV — ${plan.name} · Demandeur: ${applicantName}`, 30, 60);

    // Grid on plan area
    const offsetX = 50;
    const offsetY = 110;
    const planWidthPx = width - 100;
    const planHeightPx = height - 240;
    const scaleFactor = Math.min(
      planWidthPx / (plan.widthMeters * SCALE),
      planHeightPx / (plan.heightMeters * SCALE)
    );

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleFactor, scaleFactor);

    // Draw Rooms
    plan.rooms.forEach((r) => {
      ctx.fillStyle = r.color || '#f8fafc';
      ctx.fillRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(r.x * SCALE, r.y * SCALE, r.width * SCALE, r.height * SCALE);

      // Room Name
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(r.name, r.x * SCALE + 10, r.y * SCALE + 24);
    });

    // Draw Doors & Exits
    plan.doors.forEach((d) => {
      ctx.fillStyle = d.isEmergencyExit ? '#16a34a' : '#78350f';
      ctx.fillRect(d.x * SCALE - 12, d.y * SCALE - 6, 24, 12);
      ctx.font = '10px sans-serif';
      ctx.fillText(d.isEmergencyExit ? 'ISSUE' : 'PORTE', d.x * SCALE - 16, d.y * SCALE - 10);
    });

    // Draw Cameras & Vision Cones
    plan.devices.forEach((dev) => {
      const cx = dev.x * SCALE;
      const cy = dev.y * SCALE;

      if (dev.type === 'camera_bullet' || dev.type === 'camera_dome') {
        // Vision Cone
        const angleRad = (dev.rotation * Math.PI) / 180;
        const halfFov = ((dev.fovAngle || 80) * Math.PI) / 360;
        const rangePx = (dev.range || 10) * SCALE;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, rangePx, angleRad - halfFov, angleRad + halfFov);
        ctx.closePath();
        ctx.fillStyle = dev.isOutdoor ? 'rgba(16, 185, 129, 0.22)' : 'rgba(56, 189, 248, 0.22)';
        ctx.fill();
        ctx.strokeStyle = dev.isOutdoor ? '#059669' : '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Camera Icon
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fillStyle = dev.type === 'camera_bullet' ? '#047857' : '#0284c7';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(dev.label, cx + 14, cy + 4);
      } else if (dev.type === 'dvr') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 14, cy - 10, 28, 20);
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 14, cy - 10, 28, 20);
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(dev.label, cx + 18, cy + 5);
      }
    });

    ctx.restore();

    // Footer Legend
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, height - 90, width, 90);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, height - 90, width, 90);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('LÉGENDE OFFICIELLE DU SCHÉMA :', 30, height - 60);
    ctx.font = '12px sans-serif';
    ctx.fillText(`• Caméras Extérieures (Bullet) : ${outdoorCams} unités  |  • Caméras Intérieures (Dôme) : ${indoorCams} unités`, 30, height - 38);
    ctx.fillText(`• Enregistreur DVR/NVR : ${dvrCount} unité(s)  |  • Sirène Alarme : ${alarmCount}  |  • Issues de Secours : ${plan.doors.filter(d => d.isEmergencyExit).length}`, 30, height - 18);

    ctx.fillText(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Système Conforme DRAG Wilaya d'Oran`, width - 420, height - 20);

    // Download PNG
    const link = document.createElement('a');
    link.download = `schema_cctv_${plan.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Schéma d’implantation exporté en PNG haute définition.');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-emerald-500/50 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Module Schéma d'Implantation CCTV 2D/3D
            </span>
            <span className="text-xs text-slate-500">
              Conforme Arrêté Interministériel DRAG Wilaya d’Oran
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            Schéma Architectural du Bâti & Positionnement des Caméras
          </h1>
          <p className="text-xs text-slate-600 max-w-3xl">
            Dessinez les pièces, murs, portes, fenêtres et issues de secours. Placez les caméras
            bullet, dôme, DVR et sirènes avec leurs angles et portées, visualisez en 3D
            isométrique, et synchronisez automatiquement les quantités sur la Page 3 du Formulaire
            Officiel.
          </p>
        </div>

        {/* 2D / 3D Mode Switcher & Sync Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('2d')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === '2d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Plan 2D (Dessin)</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === '3d'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vue 3D Isométrique</span>
            </button>
          </div>

          <button
            onClick={handleSyncToForm}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Copier les quantités de caméras et DVR vers la Page 3 du formulaire DRAG"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Synchroniser vers Formulaire PDF</span>
          </button>

          <button
            onClick={handleExportPlanImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Télécharger le plan avec le cartouche officiel DRAG Wilaya d'Oran"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger Plan (PNG)</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-medium">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Total Caméras:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {totalCams}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Extérieures (Bullet):</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {outdoorCams}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Intérieures (Dôme):</span>
          <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            {indoorCams}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Enregistreurs DVR:</span>
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {dvrCount}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Sirènes / Alarme:</span>
          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
            {alarmCount}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Issues de Secours:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            {plan.doors.filter((d) => d.isEmergencyExit).length}
          </span>
        </div>
      </div>

      {/* Main Workspace Area: Sidebar Palette + Canvas + Property Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Toolbar / Palette (Cols 1-3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Preset Chooser */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Modèles de Bâti Prédéfinis</span>
            </h3>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                onClick={() => {
                  recordUndoSnapshot();
                  setPlan(PRESET_VILLA_ORAN);
                  setSelectedId(null);
                  showToast(
                    isRtl
                      ? 'تم تحميل نموذج الفيلا السكنية (يمكن التراجع بـ Ctrl+Z)'
                      : 'Modèle Villa Résidentielle (Oran) chargé (Ctrl+Z pour annuler).'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">🏡 Villa Individuelle</div>
                <div className="text-[11px] text-slate-500">4 Caméras, DVR, Alarme, Cour & Jardin</div>
              </button>
              <button
                onClick={() => {
                  recordUndoSnapshot();
                  setPlan(PRESET_STORE_ORAN);
                  setSelectedId(null);
                  showToast(
                    isRtl
                      ? 'تم تحميل نموذج المحل التجاري (يمكن التراجع بـ Ctrl+Z)'
                      : 'Modèle Local Commercial chargé (Ctrl+Z pour annuler).'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
              >
                <div className="font-semibold text-slate-800">🏪 Local Commercial / Supérette</div>
                <div className="text-[11px] text-slate-500">Espace vente, caisse, réserve, 4 caméras</div>
              </button>
              <button
                onClick={() => {
                  recordUndoSnapshot();
                  setPlan(PRESET_BLANK);
                  setSelectedId(null);
                  showToast(
                    isRtl
                      ? 'مخطط فارغ جديد جاهز (يمكن التراجع بـ Ctrl+Z)'
                      : 'Nouveau plan vierge prêt (Ctrl+Z pour annuler).'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600"
              >
                <div className="font-semibold">✏️ Nouveau Plan Vierge</div>
                <div className="text-[11px] text-slate-400">Dessinez votre bâti de zéro</div>
              </button>
            </div>
          </div>

          {/* Drawing & Element Tools */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Outils de Dessin & Équipements
            </h3>

            <div className="space-y-1">
              {/* Select Tool */}
              <button
                onClick={() => setActiveTool('select')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'select'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Move className="w-4 h-4 shrink-0" />
                  <span>Sélectionner / Déplacer</span>
                </div>
                <kbd className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">
                  S
                </kbd>
              </button>

              {/* Eraser Tool */}
              <button
                onClick={() => {
                  setActiveTool('eraser');
                  showToast(
                    isRtl
                      ? 'أداة الممحاة مفعلة: اضغط على أي عنصر لمسحه فوراً'
                      : 'Outil Gomme activé : Cliquez sur n’importe quel élément du plan pour l’effacer instantanément.'
                  );
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs ring-2 ring-rose-400'
                    : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200'
                }`}
                title="Supprimer facilement des éléments en cliquant dessus (Touche E)"
              >
                <div className="flex items-center gap-2.5">
                  <Eraser className="w-4 h-4 shrink-0" />
                  <span>Outil Gomme (Effacer)</span>
                </div>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">
                  [E] Clic
                </span>
              </button>

              {/* Room (Square) */}
              <button
                onClick={() => {
                  setActiveTool('room');
                  showToast('Mode Dessin : Cliquez et glissez sur le plan pour tracer une pièce.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'room'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Tracer Pièce / Bâti</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Glisser
                </span>
              </button>

              {/* Door */}
              <button
                onClick={() => {
                  setActiveTool('door');
                  showToast('Cliquez sur le plan pour déposer une porte.');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'door'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <DoorOpen className="w-4 h-4 shrink-0 text-amber-700" />
                <span>Porte d’accès (0.9m)</span>
              </button>

              {/* Window */}
              <button
                onClick={() => {
                  setActiveTool('window');
                  showToast('Cliquez sur le plan pour déposer une fenêtre.');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'window'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <AppWindow className="w-4 h-4 shrink-0 text-sky-600" />
                <span>Fenêtre vitrée (1.4m)</span>
              </button>

              {/* Emergency Exit */}
              <button
                onClick={() => {
                  setActiveTool('emergency_exit');
                  showToast('Cliquez sur le plan pour ajouter une issue de secours.');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTool === 'emergency_exit'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <DoorOpen className="w-4 h-4 shrink-0 text-emerald-600 font-bold" />
                <span>Issue de Secours (Verte)</span>
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Matériel Vidéosurveillance & Sécurité
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                  Glisser & Déposer
                </span>
              </div>

              {/* Bullet Camera (Click or Drag & Drop) */}
              <button
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'camera_bullet');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  setActiveTool('camera_bullet');
                  showToast('Cliquez ou glissez sur le plan pour placer une Caméra Bullet (Tube).');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-grab active:cursor-grabbing ${
                  activeTool === 'camera_bullet'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Cliquer pour placer ou glisser-déposer directement sur le plan"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Caméra Bullet (Tube)</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                  Glisser ⠿
                </span>
              </button>

              {/* Dome Camera (Click or Drag & Drop) */}
              <button
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'camera_dome');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  setActiveTool('camera_dome');
                  showToast('Cliquez ou glissez sur le plan pour placer une Caméra Dôme.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-grab active:cursor-grabbing ${
                  activeTool === 'camera_dome'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Cliquer pour placer ou glisser-déposer directement sur le plan"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-cyan-600" />
                  <span>Caméra Dôme (Plafond)</span>
                </div>
                <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-mono">
                  Glisser ⠿
                </span>
              </button>

              {/* DVR Unit (Click or Drag & Drop) */}
              <button
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'dvr');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  setActiveTool('dvr');
                  showToast('Cliquez ou glissez sur le plan pour placer l’enregistreur DVR/NVR.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-grab active:cursor-grabbing ${
                  activeTool === 'dvr'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Cliquer pour placer ou glisser-déposer directement sur le plan"
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>Enregistreur NVR / DVR</span>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                  Glisser ⠿
                </span>
              </button>

              {/* Alarm Siren (Click or Drag & Drop) */}
              <button
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'alarm_siren');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  setActiveTool('alarm_siren');
                  showToast('Cliquez ou glissez sur le plan pour placer la sirène d’alarme.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-grab active:cursor-grabbing ${
                  activeTool === 'alarm_siren'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title="Cliquer pour placer ou glisser-déposer directement sur le plan"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Sirène & Centrale Alarme</span>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                  Glisser ⠿
                </span>
              </button>

              {/* Text Annotation */}
              <button
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'text');
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => {
                  setActiveTool('text');
                  showToast('Cliquez sur le plan pour insérer une annotation textuelle.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-grab ${
                  activeTool === 'text'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Texte / Annotation</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  Glisser ⠿
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas Area (Cols 4-9) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col min-h-[580px]">
          {/* Canvas Mode Header with Undo, Redo, and Eraser Controls */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {viewMode === '2d' ? 'Éditeur Architectural 2D' : 'Rendu 3D Temps Réel Three.js'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 hidden sm:inline">
                Grille métrique : 1m | Échelle : 1:100
              </span>
            </div>

            {/* Quick Actions Bar: Undo, Redo, Gomme, Rotate, Delete */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Undo Button */}
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title={isRtl ? 'تراجع عن آخر تعديل (Ctrl+Z)' : 'Annuler la dernière action (Ctrl+Z)'}
              >
                <Undo2 className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">{isRtl ? 'تراجع' : 'Annuler'}</span>
                <kbd className="hidden md:inline px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-[9px] text-slate-500 font-mono">
                  Ctrl+Z
                </kbd>
                {undoStack.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                    {undoStack.length}
                  </span>
                )}
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title={isRtl ? 'استعادة التعديل الملغى (Ctrl+Y)' : 'Rétablir l’action annulée (Ctrl+Y)'}
              >
                <Redo2 className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">{isRtl ? 'استعادة' : 'Rétablir'}</span>
                <kbd className="hidden md:inline px-1 py-0.2 bg-slate-100 border border-slate-300 rounded text-[9px] text-slate-500 font-mono">
                  Ctrl+Y
                </kbd>
              </button>

              <div className="h-4 w-px bg-slate-300 mx-0.5" />

              {/* Eraser Quick Toggle */}
              <button
                onClick={() => setActiveTool((curr) => (curr === 'eraser' ? 'select' : 'eraser'))}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-2xs font-semibold ring-1 ring-rose-400'
                    : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border-slate-200'
                }`}
                title={isRtl ? 'أداة الممحاة (E)' : 'Activer l’outil Gomme pour effacer en 1 clic (Touche E)'}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{isRtl ? 'ممحاة' : 'Gomme'}</span>
                <kbd className="hidden md:inline px-1 py-0.2 bg-black/10 rounded text-[9px] font-mono">
                  E
                </kbd>
              </button>

              {selectedId && (
                <>
                  <button
                    onClick={() => handleRotateSelected(45)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                    title="Pivoter de 45° vers la droite"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                    title="Supprimer l'élément sélectionné (Suppr / Backspace)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Active Eraser Banner */}
          {activeTool === 'eraser' && (
            <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-fade-in">
              <span className="flex items-center gap-2 font-medium">
                <Eraser className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                <span>
                  {isRtl
                    ? 'وضع الممحاة نشط: انقر فوق أي غرفة، باب، نافذة أو كاميرا لمسحها فوراً (يمكن التراجع بـ Ctrl+Z).'
                    : 'Mode Gomme actif : Cliquez sur une pièce, porte, fenêtre ou caméra pour l’effacer instantanément (Ctrl+Z pour annuler).'}
                </span>
              </span>
              <button
                onClick={() => setActiveTool('select')}
                className="underline text-[11px] font-semibold text-rose-900 hover:text-rose-950 cursor-pointer ml-2 whitespace-nowrap"
              >
                {isRtl ? 'إيقاف الممحاة (S)' : 'Quitter la gomme (S)'}
              </button>
            </div>
          )}

          {/* Canvas Body: 2D SVG or 3D Three.js */}
          <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-auto flex items-center justify-center">
            {viewMode === '2d' ? (
              <div className="bg-white border-2 border-slate-300 rounded-lg shadow-sm overflow-hidden relative">
                <svg
                  ref={svgRef}
                  width={canvasWidthPx}
                  height={canvasHeightPx}
                  onMouseDown={handleSvgMouseDown}
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onTouchStart={(e) => {
                    if (longPressMenu) setLongPressMenu(null);
                    const coords = getCanvasCoords(e);
                    if (e.touches.length > 0) {
                      startLongPressTimer(e.touches[0].clientX, e.touches[0].clientY, coords);
                    }
                    if (activeTool === 'room') {
                      setIsDrawingRoom(true);
                      setDrawStart(coords);
                      setCurrentDrawCoord(coords);
                    }
                  }}
                  onTouchMove={(e) => handleSvgMouseMove(e as any)}
                  onTouchEnd={() => handleSvgMouseUp()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const tool = e.dataTransfer.getData('text/plain') as ToolType;
                    if (tool) {
                      const coords = getCanvasCoords(e as any);
                      createDeviceOrElementAtCoords(tool, coords.x, coords.y);
                    }
                  }}
                  className={`select-none block touch-none ${
                    isDraggingElement
                      ? 'cursor-grabbing'
                      : activeTool === 'eraser'
                      ? 'cursor-crosshair'
                      : activeTool === 'room'
                      ? 'cursor-crosshair'
                      : 'cursor-default'
                  }`}
                >
                  {/* Metric Grid Pattern */}
                  <defs>
                    <pattern id="smallGrid" width={SCALE / 2} height={SCALE / 2} patternUnits="userSpaceOnUse">
                      <path d={`M ${SCALE / 2} 0 L 0 0 0 ${SCALE / 2}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    </pattern>
                    <pattern id="grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
                      <rect width={SCALE} height={SCALE} fill="url(#smallGrid)" />
                      <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* 1. Draw Rooms / Bâti */}
                  {plan.rooms.map((room) => {
                    const isSelected = selectedId === room.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === room.id;
                    return (
                      <g
                        key={room.id}
                        onMouseDown={(e) =>
                          handleElementMouseDown(e, room.id, 'room', room.x, room.y)
                        }
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(room.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                      >
                        {/* Floor Slab */}
                        <rect
                          x={room.x * SCALE}
                          y={room.y * SCALE}
                          width={room.width * SCALE}
                          height={room.height * SCALE}
                          fill={isEraseHovered ? '#fee2e2' : room.color || '#f8fafc'}
                          stroke={isEraseHovered ? '#ef4444' : isSelected ? '#047857' : '#0f172a'}
                          strokeWidth={isEraseHovered ? 3.5 : isSelected ? 3 : 2}
                          strokeDasharray={isEraseHovered ? '6 3' : undefined}
                          rx={3}
                        />
                        {/* Room Label */}
                        <text
                          x={room.x * SCALE + 8}
                          y={room.y * SCALE + 20}
                          fontSize="12"
                          fontWeight="600"
                          fill={isEraseHovered ? '#b91c1c' : '#334155'}
                          className="pointer-events-none"
                        >
                          {room.name} {isEraseHovered && '✖ (Effacer)'}
                        </text>
                        {room.nameAr && (
                          <text
                            x={room.x * SCALE + 8}
                            y={room.y * SCALE + 36}
                            fontSize="11"
                            fontWeight="500"
                            fill={isEraseHovered ? '#b91c1c' : '#64748b'}
                            fontFamily="Cairo, sans-serif"
                            className="pointer-events-none"
                          >
                            {room.nameAr}
                          </text>
                        )}
                        {/* Dimension Badge */}
                        <text
                          x={room.x * SCALE + room.width * SCALE - 60}
                          y={room.y * SCALE + room.height * SCALE - 8}
                          fontSize="10"
                          fill="#94a3b8"
                          className="pointer-events-none font-mono"
                        >
                          {room.width}m × {room.height}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Active Room Drawing Preview */}
                  {isDrawingRoom && drawStart && currentDrawCoord && (
                    <rect
                      x={Math.min(drawStart.x, currentDrawCoord.x) * SCALE}
                      y={Math.min(drawStart.y, currentDrawCoord.y) * SCALE}
                      width={Math.abs(currentDrawCoord.x - drawStart.x) * SCALE}
                      height={Math.abs(currentDrawCoord.y - drawStart.y) * SCALE}
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* 2. Draw Windows */}
                  {plan.windows.map((win) => {
                    const isSelected = selectedId === win.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === win.id;
                    const wx = win.x * SCALE;
                    const wy = win.y * SCALE;
                    const wWidth = win.width * SCALE;
                    return (
                      <g
                        key={win.id}
                        onMouseDown={(e) =>
                          handleElementMouseDown(e, win.id, 'window', win.x, win.y)
                        }
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(win.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={wx - wWidth / 2}
                          y={wy - 4}
                          width={wWidth}
                          height={8}
                          fill={isEraseHovered ? '#fca5a5' : '#bae6fd'}
                          stroke={isEraseHovered ? '#ef4444' : isSelected ? '#0284c7' : '#0369a1'}
                          strokeWidth={isEraseHovered ? 2.5 : isSelected ? 2 : 1}
                          strokeDasharray={isEraseHovered ? '4 2' : undefined}
                          rx={2}
                          transform={`rotate(${win.angle}, ${wx}, ${wy})`}
                        />
                      </g>
                    );
                  })}

                  {/* 3. Draw Doors & Emergency Exits */}
                  {plan.doors.map((door) => {
                    const isSelected = selectedId === door.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === door.id;
                    const dx = door.x * SCALE;
                    const dy = door.y * SCALE;
                    const dWidth = door.width * SCALE;
                    return (
                      <g
                        key={door.id}
                        onMouseDown={(e) =>
                          handleElementMouseDown(e, door.id, 'door', door.x, door.y)
                        }
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(door.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                      >
                        {/* Door swing arc */}
                        <path
                          d={`M ${dx} ${dy} A ${dWidth} ${dWidth} 0 0 1 ${dx + dWidth} ${dy}`}
                          fill="none"
                          stroke={isEraseHovered ? '#ef4444' : door.isEmergencyExit ? '#22c55e' : '#94a3b8'}
                          strokeWidth={isEraseHovered ? 2 : 1}
                          strokeDasharray="3 3"
                          transform={`rotate(${door.angle}, ${dx}, ${dy})`}
                        />
                        {/* Door Leaf */}
                        <line
                          x1={dx}
                          y1={dy}
                          x2={dx + dWidth}
                          y2={dy}
                          stroke={isEraseHovered ? '#ef4444' : door.isEmergencyExit ? '#16a34a' : '#78350f'}
                          strokeWidth={isEraseHovered ? 5 : isSelected ? 4 : 3}
                          transform={`rotate(${door.angle}, ${dx}, ${dy})`}
                        />
                        {/* Door Label Badge */}
                        <text
                          x={dx + 4}
                          y={dy - 6}
                          fontSize="9"
                          fontWeight="600"
                          fill={isEraseHovered ? '#ef4444' : door.isEmergencyExit ? '#16a34a' : '#475569'}
                        >
                          {isEraseHovered ? '✖ EFFACER' : door.isEmergencyExit ? '🚪 ISSUE DE SECOURS' : 'PORTE'}
                        </text>
                      </g>
                    );
                  })}

                  {/* 4. Draw Security Devices (Cameras with Vision Cones, DVR, Alarm) */}
                  {plan.devices.map((dev) => {
                    const isSelected = selectedId === dev.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === dev.id;
                    const cx = dev.x * SCALE;
                    const cy = dev.y * SCALE;

                    if (dev.type === 'camera_bullet' || dev.type === 'camera_dome') {
                      const angleRad = (dev.rotation * Math.PI) / 180;
                      const halfFov = ((dev.fovAngle || 80) * Math.PI) / 360;
                      const rangePx = (dev.range || 10) * SCALE;
                      const startAngle = angleRad - halfFov;
                      const endAngle = angleRad + halfFov;

                      const x1 = cx + rangePx * Math.cos(startAngle);
                      const y1 = cy + rangePx * Math.sin(startAngle);
                      const x2 = cx + rangePx * Math.cos(endAngle);
                      const y2 = cy + rangePx * Math.sin(endAngle);

                      const conePath = `M ${cx} ${cy} L ${x1} ${y1} A ${rangePx} ${rangePx} 0 0 1 ${x2} ${y2} Z`;

                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onTouchStart={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={
                            activeTool === 'eraser'
                              ? 'cursor-pointer'
                              : 'cursor-grab active:cursor-grabbing'
                          }
                        >
                          {/* FOV Vision Cone */}
                          <path
                            d={conePath}
                            fill={
                              isEraseHovered
                                ? 'rgba(239, 68, 68, 0.25)'
                                : dev.isOutdoor
                                ? 'rgba(16, 185, 129, 0.18)'
                                : 'rgba(56, 189, 248, 0.18)'
                            }
                            stroke={isEraseHovered ? '#ef4444' : dev.isOutdoor ? '#10b981' : '#38bdf8'}
                            strokeWidth={isEraseHovered ? 2 : 1.5}
                            strokeDasharray={isEraseHovered ? '3 3' : '4 2'}
                          />

                          {/* Camera Icon Body */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isEraseHovered ? 12 : 10}
                            fill={isEraseHovered ? '#ef4444' : isSelected ? '#059669' : '#0f172a'}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />

                          {/* Direction Indicator Arrow */}
                          <line
                            x1={cx}
                            y1={cy}
                            x2={cx + 14 * Math.cos(angleRad)}
                            y2={cy + 14 * Math.sin(angleRad)}
                            stroke={isEraseHovered ? '#fca5a5' : isSelected ? '#34d399' : '#38bdf8'}
                            strokeWidth={3}
                            strokeLinecap="round"
                          />

                          {/* Live coordinate feedback while dragging */}
                          {isSelected && isDraggingElement && (
                            <g transform={`translate(${cx}, ${cy - 24})`}>
                              <rect
                                x="-44"
                                y="-14"
                                width="88"
                                height="18"
                                rx="9"
                                fill="#0f172a"
                                stroke="#10b981"
                                strokeWidth="1.5"
                              />
                              <text
                                x="0"
                                y="-2"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="9.5"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {dev.x.toFixed(2)}m · {dev.y.toFixed(2)}m
                              </text>
                            </g>
                          )}

                          {/* Device Text Label */}
                          <text
                            x={cx + 14}
                            y={cy - 4}
                            fontSize="11"
                            fontWeight="700"
                            fill={isEraseHovered ? '#b91c1c' : '#0f172a'}
                            className="bg-white/90"
                          >
                            {dev.label} {isEraseHovered && '✖'}
                          </text>
                          <text
                            x={cx + 14}
                            y={cy + 10}
                            fontSize="9.5"
                            fontWeight="500"
                            fill={isEraseHovered ? '#ef4444' : '#64748b'}
                          >
                            {isEraseHovered ? 'Cliquer pour effacer' : `${dev.modelName} (${dev.resolution})`}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'dvr') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onTouchStart={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={
                            activeTool === 'eraser'
                              ? 'cursor-pointer'
                              : 'cursor-grab active:cursor-grabbing'
                          }
                        >
                          <rect
                            x={cx - 16}
                            y={cy - 12}
                            width={32}
                            height={24}
                            fill={isEraseHovered ? '#ef4444' : isSelected ? '#047857' : '#0f172a'}
                            stroke={isEraseHovered ? '#b91c1c' : '#10b981'}
                            strokeWidth={2}
                            rx={3}
                          />
                          <text
                            x={cx}
                            y={cy + 3}
                            fontSize="9"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            {isEraseHovered ? '✖' : 'DVR'}
                          </text>
                          {isSelected && isDraggingElement && (
                            <g transform={`translate(${cx}, ${cy - 24})`}>
                              <rect
                                x="-44"
                                y="-14"
                                width="88"
                                height="18"
                                rx="9"
                                fill="#0f172a"
                                stroke="#10b981"
                                strokeWidth="1.5"
                              />
                              <text
                                x="0"
                                y="-2"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="9.5"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {dev.x.toFixed(2)}m · {dev.y.toFixed(2)}m
                              </text>
                            </g>
                          )}
                          <text
                            x={cx + 20}
                            y={cy + 4}
                            fontSize="11"
                            fontWeight="700"
                            fill={isEraseHovered ? '#ef4444' : '#047857'}
                          >
                            {dev.label} {isEraseHovered && '(Effacer)'}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'alarm_siren') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onTouchStart={(e) =>
                            handleElementMouseDown(e, dev.id, 'device', dev.x, dev.y)
                          }
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={
                            activeTool === 'eraser'
                              ? 'cursor-pointer'
                              : 'cursor-grab active:cursor-grabbing'
                          }
                        >
                          <circle
                            cx={cx}
                            cy={cy}
                            r={11}
                            fill={isEraseHovered ? '#7f1d1d' : isSelected ? '#b91c1c' : '#dc2626'}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                          <text
                            x={cx}
                            y={cy + 4}
                            fontSize="10"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            {isEraseHovered ? '✖' : '🚨'}
                          </text>
                          {isSelected && isDraggingElement && (
                            <g transform={`translate(${cx}, ${cy - 24})`}>
                              <rect
                                x="-44"
                                y="-14"
                                width="88"
                                height="18"
                                rx="9"
                                fill="#0f172a"
                                stroke="#10b981"
                                strokeWidth="1.5"
                              />
                              <text
                                x="0"
                                y="-2"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="9.5"
                                fontFamily="monospace"
                                fontWeight="700"
                              >
                                {dev.x.toFixed(2)}m · {dev.y.toFixed(2)}m
                              </text>
                            </g>
                          )}
                          <text
                            x={cx + 16}
                            y={cy + 4}
                            fontSize="11"
                            fontWeight="700"
                            fill={isEraseHovered ? '#b91c1c' : '#dc2626'}
                          >
                            {dev.label} {isEraseHovered && '(Effacer)'}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })}

                  {/* 5. Draw Text Annotations */}
                  {plan.annotations.map((ann) => {
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === ann.id;
                    return (
                      <text
                        key={ann.id}
                        x={ann.x * SCALE}
                        y={ann.y * SCALE}
                        fontSize={ann.fontSize || 12}
                        fontWeight="600"
                        fill={isEraseHovered ? '#ef4444' : ann.color || '#047857'}
                        textDecoration={isEraseHovered ? 'line-through' : undefined}
                        onMouseDown={(e) =>
                          handleElementMouseDown(e, ann.id, 'annotation', ann.x, ann.y)
                        }
                        onTouchStart={(e) =>
                          handleElementMouseDown(e, ann.id, 'annotation', ann.x, ann.y)
                        }
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(ann.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer select-none"
                      >
                        {ann.text} {isEraseHovered && '✖'}
                      </text>
                    );
                  })}
                </svg>

                {/* Long Press Quick Device Creation Popup Modal */}
                {longPressMenu && (
                  <div
                    className="absolute z-40 bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/60 shadow-2xl rounded-2xl p-3.5 w-72 sm:w-80 animate-in zoom-in-95 duration-150"
                    style={{
                      left: Math.min(
                        Math.max(12, longPressMenu.pixelX - 140),
                        canvasWidthPx - 300
                      ),
                      top: Math.min(
                        Math.max(12, longPressMenu.pixelY - 170),
                        canvasHeightPx - 250
                      ),
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-700/70 text-xs">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>{isRtl ? 'إضافة جهاز (ضغط مطول)' : 'Appui Long : Poser un équipement'}</span>
                      </span>
                      <button
                        onClick={() => setLongPressMenu(null)}
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 py-1.5 font-mono">
                      <span>Position :</span>
                      <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        X = {longPressMenu.x.toFixed(2)}m · Y = {longPressMenu.y.toFixed(2)}m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('camera_bullet', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-700 border border-emerald-700/60 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-emerald-800 group-hover:bg-emerald-600 text-white shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Caméra Bullet</div>
                          <div className="text-[10px] text-emerald-300">Tube Ext/Int</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('camera_dome', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-700 border border-cyan-700/60 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-cyan-800 group-hover:bg-cyan-600 text-white shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Caméra Dôme</div>
                          <div className="text-[10px] text-cyan-300">360° Plafond</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('dvr', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-700 border border-indigo-700/60 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-indigo-800 group-hover:bg-indigo-600 text-white shrink-0">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Enregistreur</div>
                          <div className="text-[10px] text-indigo-300">NVR / DVR 16ch</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('alarm_siren', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/80 hover:bg-rose-700 border border-rose-700/60 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-rose-800 group-hover:bg-rose-600 text-white shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Sirène Alarme</div>
                          <div className="text-[10px] text-rose-300">113 dB Flash</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('door', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-slate-700 group-hover:bg-slate-600 text-amber-400 shrink-0">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Porte</div>
                          <div className="text-[10px] text-slate-300">Battant 1.0m</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          createDeviceOrElementAtCoords('emergency_exit', longPressMenu.x, longPressMenu.y);
                          setLongPressMenu(null);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors cursor-pointer group"
                      >
                        <div className="p-1.5 rounded-md bg-slate-700 group-hover:bg-slate-600 text-emerald-400 shrink-0">
                          <DoorOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Sortie Secours</div>
                          <div className="text-[10px] text-emerald-300">Issue Verte</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full min-h-[540px]">
                <FloorPlan3DCanvas
                  plan={plan}
                  activeDeviceId={selectedType === 'device' ? selectedId : null}
                  onSelectDevice={(id) => {
                    setSelectedId(id);
                    setSelectedType('device');
                  }}
                  isRtl={isRtl}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Inspector & Property Editor (Cols 10-12) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Propriétés de l'Élément</span>
              {selectedId && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  {selectedType}
                </span>
              )}
            </h3>

            {/* If a Camera or Security Device is selected */}
            {selectedDevice && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nom / Libellé Affiché
                  </label>
                  <input
                    type="text"
                    value={selectedDevice.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        devices: prev.devices.map((d) =>
                          d.id === selectedDevice.id ? { ...d, label: val } : d
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Modèle / Marque Matériel
                  </label>
                  <input
                    type="text"
                    value={selectedDevice.modelName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        devices: prev.devices.map((d) =>
                          d.id === selectedDevice.id ? { ...d, modelName: val } : d
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* If Camera: FOV and Angle Controls */}
                {(selectedDevice.type === 'camera_bullet' ||
                  selectedDevice.type === 'camera_dome') && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Emplacement
                        </label>
                        <select
                          value={selectedDevice.isOutdoor ? 'outdoor' : 'indoor'}
                          onChange={(e) => {
                            const isOut = e.target.value === 'outdoor';
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, isOutdoor: isOut } : d
                              ),
                            }));
                          }}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white"
                        >
                          <option value="outdoor">Extérieure (IP67)</option>
                          <option value="indoor">Intérieure</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Angle Direction ({selectedDevice.rotation}°)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={selectedDevice.rotation}
                          onChange={(e) => {
                            const rot = parseInt(e.target.value, 10);
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, rotation: rot } : d
                              ),
                            }));
                          }}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Champ de Vision FOV ({selectedDevice.fovAngle}°)
                        </label>
                        <input
                          type="range"
                          min="45"
                          max="140"
                          step="5"
                          value={selectedDevice.fovAngle}
                          onChange={(e) => {
                            const fov = parseInt(e.target.value, 10);
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, fovAngle: fov } : d
                              ),
                            }));
                          }}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Portée Vision ({selectedDevice.range}m)
                        </label>
                        <input
                          type="range"
                          min="4"
                          max="30"
                          step="1"
                          value={selectedDevice.range}
                          onChange={(e) => {
                            const r = parseInt(e.target.value, 10);
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, range: r } : d
                              ),
                            }));
                          }}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleRotateSelected(45)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pivoter 45°</span>
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* If a Room is selected */}
            {selectedRoom && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nom de la Pièce (Français)
                  </label>
                  <input
                    type="text"
                    value={selectedRoom.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        rooms: prev.rooms.map((r) =>
                          r.id === selectedRoom.id ? { ...r, name: val } : r
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 font-cairo">
                    Nom de la Pièce (العربية)
                  </label>
                  <input
                    type="text"
                    value={selectedRoom.nameAr || ''}
                    dir="rtl"
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        rooms: prev.rooms.map((r) =>
                          r.id === selectedRoom.id ? { ...r, nameAr: val } : r
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium font-cairo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Largeur : {selectedRoom.width}m
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="25"
                      step="0.5"
                      value={selectedRoom.width}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value);
                        setPlan((prev) => ({
                          ...prev,
                          rooms: prev.rooms.map((r) =>
                            r.id === selectedRoom.id ? { ...r, width: w } : r
                          ),
                        }));
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Longueur : {selectedRoom.height}m
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="0.5"
                      value={selectedRoom.height}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value);
                        setPlan((prev) => ({
                          ...prev,
                          rooms: prev.rooms.map((r) =>
                            r.id === selectedRoom.id ? { ...r, height: h } : r
                          ),
                        }));
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer cette pièce</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Door is selected */}
            {selectedDoor && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Type d'Accès
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedDoor.isEmergencyExit}
                        onChange={(e) => {
                          const isExit = e.target.checked;
                          setPlan((prev) => ({
                            ...prev,
                            doors: prev.doors.map((d) =>
                              d.id === selectedDoor.id ? { ...d, isEmergencyExit: isExit } : d
                            ),
                          }));
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-semibold text-emerald-800">
                        Issue de Secours Officielle (Balisée)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Orientation ({selectedDoor.angle}°)
                  </label>
                  <button
                    onClick={() => handleRotateSelected(90)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pivoter 90°</span>
                  </button>
                </div>

                <button
                  onClick={handleDeleteSelected}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer cette porte</span>
                </button>
              </div>
            )}

            {/* Empty state when nothing is selected */}
            {!selectedId && (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Sliders className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">
                  Cliquez sur un équipement, une caméra ou un mur du plan pour modifier ses
                  propriétés.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

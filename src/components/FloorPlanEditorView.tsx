import React, { useRef, useState, useEffect } from 'react';
import {
  FloorPlanData,
  DeviceType,
  ToolType,
  RoomElement,
  DoorElement,
  GateElement,
  StairElement,
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
  ZoomIn,
  ZoomOut,
  Ruler,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  MonitorPlay,
  Sun,
  Moon,
  Crosshair,
  HelpCircle,
  Info,
  Monitor,
  Radio,
  Fence,
  Link2,
  FileText,
  CheckCheck,
} from 'lucide-react';
import { AppLocale, TRANSLATIONS } from '../i18n/translations';

export interface FloorPlanFullSyncData {
  indoorCamQty: number;
  outdoorCamQty: number;
  totalCamQty: number;
  recorderQty: number;
  indoorCamNature: string;
  outdoorCamNature: string;
  recorderDesignation: string;
  recorderNature: string;
  storageUsePlaces: string;
  securityConditions: string;
  camTypesSummary: string;
  recorderTypeSummary: string;
}

export interface FloorPlanEditorViewProps {
  locale: AppLocale;
  onSyncWithPdfForm?: (stats: {
    indoorCamQty: number;
    outdoorCamQty: number;
    totalCamQty: number;
    recorderQty: number;
    camTypesSummary: string;
    recorderTypeSummary: string;
  }) => void;
  onSyncAllWithForm?: (fullData: FloorPlanFullSyncData) => void;
  currentFormValues?: Record<string, string>;
  plan?: FloorPlanData;
  onPlanChange?: (newPlan: FloorPlanData) => void;
  onJumpToWorkspacePage?: (page: 1 | 2 | 3) => void;
  applicantName?: string;
}

export const FloorPlanEditorView: React.FC<FloorPlanEditorViewProps> = ({
  locale,
  onSyncWithPdfForm,
  onSyncAllWithForm,
  currentFormValues,
  plan: controlledPlan,
  onPlanChange,
  onJumpToWorkspacePage,
  applicantName = 'Demandeur Wilaya d’Oran',
}) => {
  const t = TRANSLATIONS[locale];
  const isRtl = locale === 'ar';

  // Persistence key
  const STORAGE_KEY = 'cctv_floor_plan_data_v3';

  const [internalPlan, setInternalPlan] = useState<FloorPlanData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
        const legacy2 = localStorage.getItem('cctv_floor_plan_data_v2');
        if (legacy2) return JSON.parse(legacy2);
        const legacy1 = localStorage.getItem('cctv_floor_plan_data_v1');
        if (legacy1) return JSON.parse(legacy1);
      } catch (e) {
        console.error('Erreur chargement plan:', e);
      }
    }
    return PRESET_VILLA_ORAN;
  });

  const plan = controlledPlan || internalPlan;
  const setPlan: React.Dispatch<React.SetStateAction<FloorPlanData>> = (action) => {
    if (typeof action === 'function') {
      const next = (action as (prev: FloorPlanData) => FloorPlanData)(plan);
      if (onPlanChange) onPlanChange(next);
      else setInternalPlan(next);
    } else {
      if (onPlanChange) onPlanChange(action);
      else setInternalPlan(action);
    }
  };

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>('dev_cam1');
  const [selectedType, setSelectedType] = useState<
    'room' | 'door' | 'gate' | 'stairs' | 'window' | 'device' | 'annotation' | null
  >('device');

  // Canvas zoom & view options
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showFovCones, setShowFovCones] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [gridSnapOn, setGridSnapOn] = useState<boolean>(true);

  // Beginner Helper / Onboarding State
  const [showBeginnerGuide, setShowBeginnerGuide] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Measure Tool State
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureCurrent, setMeasureCurrent] = useState<{ x: number; y: number } | null>(null);

  // Live Camera POV Simulator Modal
  const [simulatedCameraId, setSimulatedCameraId] = useState<string | null>(null);
  const [simNightMode, setSimNightMode] = useState<boolean>(false);
  const [simDigitalZoom, setSimDigitalZoom] = useState<number>(1);
  const [simTimestamp, setSimTimestamp] = useState<string>('');

  // Field Wiring & Form Synchronization Modal State
  const [isWiringModalOpen, setIsWiringModalOpen] = useState<boolean>(false);
  const [activeWiringTab, setActiveWiringTab] = useState<'equipment' | 'security' | 'site'>('equipment');

  // Drawing state for 2D canvas (Room creation)
  const [isDrawingRoom, setIsDrawingRoom] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawCoord, setCurrentDrawCoord] = useState<{ x: number; y: number } | null>(null);

  // === LONG PRESS + SLIDE DRAG SYSTEM ===
  const [pendingLongPress, setPendingLongPress] = useState<{
    id: string;
    type: 'room' | 'door' | 'gate' | 'stairs' | 'window' | 'device' | 'annotation';
    clientX: number;
    clientY: number;
    itemX: number;
    itemY: number;
    meterX: number;
    meterY: number;
  } | null>(null);

  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<any>(null);
  const dragStartPlanRef = useRef<FloorPlanData | null>(null);

  // Hover state for Eraser tool
  const [hoveredEraseId, setHoveredEraseId] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Undo & Redo History (Snapshots of plan, up to 35 states)
  const [undoStack, setUndoStack] = useState<FloorPlanData[]>([]);
  const [redoStack, setRedoStack] = useState<FloorPlanData[]>([]);

  // Real-time clock for simulated camera
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSimTimestamp(now.toISOString().replace('T', ' ').substring(0, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save snapshot to undo stack before any modification
  const recordUndoSnapshot = (customSnapshot?: FloorPlanData) => {
    const snapshot = customSnapshot
      ? JSON.parse(JSON.stringify(customSnapshot))
      : JSON.parse(JSON.stringify(plan));
    setUndoStack((prev) => [...prev.slice(-34), snapshot]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    setRedoStack((r) => [...r.slice(-34), JSON.parse(JSON.stringify(plan))]);
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
    setUndoStack((u) => [...u.slice(-34), JSON.parse(JSON.stringify(plan))]);
    setRedoStack(newRedoStack);
    setPlan(next);
    setSelectedId(null);
    setSelectedType(null);
    setHoveredEraseId(null);
    showToast(isRtl ? 'تمت استعادة التعديل (Ctrl+Y)' : 'Action rétablie (Ctrl+Y)');
  };

  const handleEraseElement = (
    id: string,
    type: 'room' | 'door' | 'gate' | 'stairs' | 'window' | 'device' | 'annotation'
  ) => {
    recordUndoSnapshot();
    setPlan((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== id),
      doors: prev.doors.filter((d) => d.id !== id),
      gates: (prev.gates || []).filter((g) => g.id !== id),
      stairs: (prev.stairs || []).filter((s) => s.id !== id),
      windows: prev.windows.filter((w) => w.id !== id),
      devices: prev.devices.filter((dev) => dev.id !== id),
      annotations: prev.annotations.filter((a) => a.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedType(null);
    }
    setHoveredEraseId(null);
    showToast(isRtl ? 'تم مسح العنصر' : 'Élément effacé du plan.');
  };

  // Keyboard shortcut listener
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
          showToast(isRtl ? 'أداة الممحاة مفعلة' : 'Outil Gomme activé [E]');
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
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Metrics & Stats
  const bulletCount = plan.devices.filter((d) => d.type === 'camera_bullet').length;
  const domeCount = plan.devices.filter((d) => d.type === 'camera_dome').length;
  const ptzCount = plan.devices.filter((d) => d.type === 'camera_ptz').length;
  const totalCams = bulletCount + domeCount + ptzCount;
  const indoorCams = plan.devices.filter(
    (d) => (d.type === 'camera_bullet' || d.type === 'camera_dome') && !d.isOutdoor
  ).length;
  const outdoorCams = plan.devices.filter(
    (d) =>
      d.type === 'camera_ptz' ||
      ((d.type === 'camera_bullet' || d.type === 'camera_dome') && d.isOutdoor)
  ).length;
  const dvrCount = plan.devices.filter((d) => d.type === 'dvr').length;
  const alarmCount = plan.devices.filter((d) => d.type === 'alarm_siren').length;
  const monitorCount = plan.devices.filter((d) => d.type === 'monitor_screen').length;
  const gateCount = (plan.gates || []).length;
  const stairCount = (plan.stairs || []).length;

  // Selected item reference
  const selectedDevice = plan.devices.find((d) => d.id === selectedId);
  const selectedRoom = plan.rooms.find((r) => r.id === selectedId);
  const selectedDoor = plan.doors.find((d) => d.id === selectedId);
  const selectedGate = (plan.gates || []).find((g) => g.id === selectedId);
  const selectedStair = (plan.stairs || []).find((s) => s.id === selectedId);
  const selectedWindow = plan.windows.find((w) => w.id === selectedId);
  const selectedAnnotation = plan.annotations.find((a) => a.id === selectedId);

  // Scale: pixels per meter on 2D SVG canvas
  const BASE_SCALE = 36;
  const SCALE = BASE_SCALE * zoomLevel;
  const canvasWidthPx = plan.widthMeters * SCALE;
  const canvasHeightPx = plan.heightMeters * SCALE;

  // Blind Spot Analysis
  const allAccessPoints = [
    ...plan.doors.map((d) => ({ ...d, isGate: false })),
    ...(plan.gates || []).map((g) => ({ ...g, isGate: true, isEmergencyExit: false })),
  ];

  const doorCoverageAnalysis = allAccessPoints.map((access) => {
    const isCovered = plan.devices.some((dev) => {
      if (dev.type !== 'camera_bullet' && dev.type !== 'camera_dome' && dev.type !== 'camera_ptz') {
        return false;
      }
      const dist = Math.hypot(dev.x - access.x, dev.y - access.y);
      if (dist > (dev.range || 12)) return false;
      if (dev.type === 'camera_ptz') return true; // 360 degree coverage
      const angleToAccess = (Math.atan2(access.y - dev.y, access.x - dev.x) * 180) / Math.PI;
      const normAngle = (angleToAccess + 360) % 360;
      const devRot = (dev.rotation + 360) % 360;
      let angleDiff = Math.abs(normAngle - devRot);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;
      const halfFov = (dev.fovAngle || 85) / 2;
      return angleDiff <= halfFov + 15;
    });
    return { access, isCovered };
  });

  const uncoveredAccess = doorCoverageAnalysis.filter((a) => !a.isCovered);
  const siteCoverageScore =
    allAccessPoints.length > 0
      ? Math.round(
          ((allAccessPoints.length - uncoveredAccess.length) / allAccessPoints.length) * 100
        )
      : totalCams > 0
      ? 100
      : 0;

  // Storage calculation for 30 days retention
  const estimatedStorageGb = Math.round(totalCams * 24.5 * 30);
  const recommendedHddTb =
    estimatedStorageGb <= 1800 ? '2 To' : estimatedStorageGb <= 3800 ? '4 To' : '8 To';

  // Coordinate conversion helper
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

    const rawMeterX = pixelX / SCALE;
    const rawMeterY = pixelY / SCALE;
    const snap = gridSnapOn ? 0.25 : 0.05;
    const snapMeterX = Math.round(rawMeterX / snap) * snap;
    const snapMeterY = Math.round(rawMeterY / snap) * snap;

    return {
      x: Math.max(0, Math.min(plan.widthMeters, snapMeterX)),
      y: Math.max(0, Math.min(plan.heightMeters, snapMeterY)),
      rawX: pixelX,
      rawY: pixelY,
    };
  };

  // === LONG PRESS HANDLERS ===
  const handleElementPressStart = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
    type: 'room' | 'door' | 'gate' | 'stairs' | 'window' | 'device' | 'annotation',
    itemX: number,
    itemY: number
  ) => {
    e.stopPropagation();

    if (activeTool === 'eraser') {
      handleEraseElement(id, type);
      return;
    }

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const coords = getCanvasCoords(e as any);

    setPendingLongPress({
      id,
      type,
      clientX,
      clientY,
      itemX,
      itemY,
      meterX: coords.x,
      meterY: coords.y,
    });

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 280ms threshold for long-press moving
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(45);
        } catch (_) {}
      }
      dragStartPlanRef.current = JSON.parse(JSON.stringify(plan));
      setIsDraggingElement(true);
      setDraggingId(id);
      setSelectedId(id);
      setSelectedType(type);
      setDragOffset({ x: coords.x - itemX, y: coords.y - itemY });
      setPendingLongPress(null);
      longPressTimerRef.current = null;
      showToast(
        isRtl
          ? 'تم تفعيل التحريك: حرّك الفأرة أو الإصبع للموضع المطلوب'
          : 'Déplacement actif : glissez pour positionner l’élément'
      );
    }, 280);
  };

  const handleSvgMouseMove = (
    e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>
  ) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in (e as any)) {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    if (pendingLongPress) {
      const dist = Math.hypot(
        clientX - pendingLongPress.clientX,
        clientY - pendingLongPress.clientY
      );
      if (dist > 8) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        setPendingLongPress(null);
      }
    }

    const coords = getCanvasCoords(e);

    if (activeTool === 'measure' && measureStart) {
      setMeasureCurrent(coords);
    }

    if (isDrawingRoom) {
      setCurrentDrawCoord(coords);
    } else if (isDraggingElement && draggingId) {
      const snap = gridSnapOn ? 0.25 : 0.05;
      const rawX = coords.x - dragOffset.x;
      const rawY = coords.y - dragOffset.y;
      const newX = Math.max(0, Math.min(plan.widthMeters, Math.round(rawX / snap) * snap));
      const newY = Math.max(0, Math.min(plan.heightMeters, Math.round(rawY / snap) * snap));

      setPlan((prev) => {
        if (selectedType === 'device') {
          return {
            ...prev,
            devices: prev.devices.map((d) =>
              d.id === draggingId ? { ...d, x: newX, y: newY } : d
            ),
          };
        }
        if (selectedType === 'room') {
          return {
            ...prev,
            rooms: prev.rooms.map((r) =>
              r.id === draggingId ? { ...r, x: newX, y: newY } : r
            ),
          };
        }
        if (selectedType === 'door') {
          return {
            ...prev,
            doors: prev.doors.map((d) =>
              d.id === draggingId ? { ...d, x: newX, y: newY } : d
            ),
          };
        }
        if (selectedType === 'gate') {
          return {
            ...prev,
            gates: (prev.gates || []).map((g) =>
              g.id === draggingId ? { ...g, x: newX, y: newY } : g
            ),
          };
        }
        if (selectedType === 'stairs') {
          return {
            ...prev,
            stairs: (prev.stairs || []).map((s) =>
              s.id === draggingId ? { ...s, x: newX, y: newY } : s
            ),
          };
        }
        if (selectedType === 'window') {
          return {
            ...prev,
            windows: prev.windows.map((w) =>
              w.id === draggingId ? { ...w, x: newX, y: newY } : w
            ),
          };
        }
        if (selectedType === 'annotation') {
          return {
            ...prev,
            annotations: prev.annotations.map((a) =>
              a.id === draggingId ? { ...a, x: newX, y: newY } : a
            ),
          };
        }
        return prev;
      });
    }
  };

  const handleSvgMouseUp = () => {
    // If long press timer was still active, it was a SIMPLE TAP/CLICK!
    if (longPressTimerRef.current && pendingLongPress) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setSelectedId(pendingLongPress.id);
      setSelectedType(pendingLongPress.type);
      setPendingLongPress(null);
      return;
    }

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
      showToast(isRtl ? 'تم رسم الغرفة بنجاح' : 'Nouvelle pièce dessinée (Ctrl+Z pour annuler).');
    }

    if (isDraggingElement && dragStartPlanRef.current) {
      if (JSON.stringify(dragStartPlanRef.current) !== JSON.stringify(plan)) {
        setUndoStack((prev) => [...prev.slice(-34), dragStartPlanRef.current!]);
        setRedoStack([]);
        showToast(isRtl ? 'تم تثبيت الموضع بنجاح' : 'Élément positionné avec succès (Ctrl+Z pour annuler).');
      }
      dragStartPlanRef.current = null;
      setIsDraggingElement(false);
      setDraggingId(null);
    }

    if (activeTool === 'measure' && measureStart && measureCurrent) {
      const dist = Math.hypot(measureCurrent.x - measureStart.x, measureCurrent.y - measureStart.y);
      showToast(`Distance mesurée : ${dist.toFixed(2)} mètres`);
      setMeasureStart(null);
      setMeasureCurrent(null);
    }
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCanvasCoords(e);

    if (activeTool === 'room') {
      setIsDrawingRoom(true);
      setDrawStart(coords);
      setCurrentDrawCoord(coords);
    } else if (activeTool === 'measure') {
      setMeasureStart(coords);
      setMeasureCurrent(coords);
    } else if (
      activeTool === 'door' ||
      activeTool === 'gate' ||
      activeTool === 'stairs' ||
      activeTool === 'emergency_exit' ||
      activeTool === 'window' ||
      activeTool === 'camera_bullet' ||
      activeTool === 'camera_dome' ||
      activeTool === 'camera_ptz' ||
      activeTool === 'dvr' ||
      activeTool === 'alarm_siren' ||
      activeTool === 'pir_sensor' ||
      activeTool === 'monitor_screen' ||
      activeTool === 'text'
    ) {
      createDeviceOrElementAtCoords(activeTool, coords.x, coords.y);
    } else if (activeTool === 'select') {
      if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
        setSelectedId(null);
        setSelectedType(null);
      }
    }
  };

  const createDeviceOrElementAtCoords = (tool: ToolType, x: number, y: number) => {
    if (tool === 'room' || tool === 'eraser' || tool === 'select' || tool === 'measure') return;

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
      showToast('Porte ajoutée (Appui long + glisser pour déplacer).');
    } else if (tool === 'gate') {
      const newGate: GateElement = {
        id: `gate_${Date.now()}`,
        x,
        y,
        width: 3.5,
        angle: 0,
        isMotorized: true,
        label: 'Portail Véhicules Motorisé (3.5m)',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, gates: [...(prev.gates || []), newGate] }));
      setSelectedId(newGate.id);
      setSelectedType('gate');
      setActiveTool('select');
      showToast('Portail d’accès véhicules ajouté sur le plan.');
    } else if (tool === 'stairs') {
      const newStair: StairElement = {
        id: `stairs_${Date.now()}`,
        x,
        y,
        width: 1.2,
        length: 2.8,
        steps: 12,
        angle: 0,
        direction: 'up',
        label: 'Escalier Accès Étage',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, stairs: [...(prev.stairs || []), newStair] }));
      setSelectedId(newStair.id);
      setSelectedType('stairs');
      setActiveTool('select');
      showToast('Escalier d’accès ajouté sur le plan.');
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
      showToast('Issue de secours ajoutée sur le plan.');
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
      showToast('Fenêtre vitrée ajoutée.');
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
      showToast('Caméra Bullet placée (Appui long + glisser pour déplacer).');
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
      showToast('Caméra Dôme placée.');
    } else if (tool === 'camera_ptz') {
      const nextNum = ptzCount + 1;
      const newPtz: SecurityDeviceElement = {
        id: `dev_ptz_${Date.now()}`,
        type: 'camera_ptz',
        x,
        y,
        z: 3.5,
        rotation: 0,
        fovAngle: 360,
        range: 22,
        label: `CAM-${String(nextNum).padStart(2, '0')} PTZ 360° Motorisée`,
        modelName: 'Dahua SD49225XA-HNR (25x Zoom)',
        isOutdoor: true,
        resolution: '4MP Starlight Panoramique',
        channel: totalCams + 1,
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newPtz] }));
      setSelectedId(newPtz.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast('Caméra PTZ 360° motorisée placée sur le plan.');
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
        modelName: 'Dahua NVR4116-4KS2 (HDD 4To)',
        isOutdoor: false,
        resolution: '16 Canaux 4K',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newDvr] }));
      setSelectedId(newDvr.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast('Enregistreur NVR/DVR placé.');
    } else if (tool === 'monitor_screen') {
      const newScreen: SecurityDeviceElement = {
        id: `dev_screen_${Date.now()}`,
        type: 'monitor_screen',
        x,
        y,
        z: 1.2,
        rotation: 0,
        fovAngle: 0,
        range: 0,
        label: 'Écran Moniteur Vidéo 32" 4K',
        modelName: 'Moniteur Surveillance 4K 24/7',
        isOutdoor: false,
        resolution: '4K Ultra HD',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newScreen] }));
      setSelectedId(newScreen.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast('Moniteur de contrôle placé.');
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
      showToast('Sirène d’alarme placée.');
    } else if (tool === 'pir_sensor') {
      const newPir: SecurityDeviceElement = {
        id: `dev_pir_${Date.now()}`,
        type: 'pir_sensor',
        x,
        y,
        z: 2.2,
        rotation: 0,
        fovAngle: 90,
        range: 8,
        label: 'Détecteur Intrusion Volumétrique PIR',
        modelName: 'Ajax MotionProtect',
        isOutdoor: false,
        resolution: 'Détecteur PIR',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, devices: [...prev.devices, newPir] }));
      setSelectedId(newPir.id);
      setSelectedType('device');
      setActiveTool('select');
      showToast('Détecteur PIR placé.');
    } else if (tool === 'text') {
      const newAnn: TextAnnotationElement = {
        id: `ann_${Date.now()}`,
        x,
        y,
        text: 'Zone sous surveillance 24h/24',
        fontSize: 12,
        color: '#047857',
      };
      recordUndoSnapshot();
      setPlan((prev) => ({ ...prev, annotations: [...prev.annotations, newAnn] }));
      setSelectedId(newAnn.id);
      setSelectedType('annotation');
      setActiveTool('select');
      showToast('Texte d’annotation ajouté.');
    }
  };

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
            d.id === selectedId ? { ...d, angle: (d.angle + delta + 360) % 360 } : d
          ),
        };
      }
      if (selectedType === 'gate') {
        return {
          ...prev,
          gates: (prev.gates || []).map((g) =>
            g.id === selectedId ? { ...g, angle: (g.angle + delta + 360) % 360 } : g
          ),
        };
      }
      if (selectedType === 'stairs') {
        return {
          ...prev,
          stairs: (prev.stairs || []).map((s) =>
            s.id === selectedId ? { ...s, angle: (s.angle + delta + 360) % 360 } : s
          ),
        };
      }
      if (selectedType === 'window') {
        return {
          ...prev,
          windows: prev.windows.map((w) =>
            w.id === selectedId ? { ...w, angle: (w.angle + delta + 360) % 360 } : w
          ),
        };
      }
      return prev;
    });
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    recordUndoSnapshot();
    setPlan((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== selectedId),
      doors: prev.doors.filter((d) => d.id !== selectedId),
      gates: (prev.gates || []).filter((g) => g.id !== selectedId),
      stairs: (prev.stairs || []).filter((s) => s.id !== selectedId),
      windows: prev.windows.filter((w) => w.id !== selectedId),
      devices: prev.devices.filter((dev) => dev.id !== selectedId),
      annotations: prev.annotations.filter((a) => a.id !== selectedId),
    }));
    setSelectedId(null);
    setSelectedType(null);
    setHoveredEraseId(null);
    showToast(isRtl ? 'تم حذف العنصر' : 'Élément supprimé (Ctrl+Z pour annuler).');
  };

  // 1-Click Auto-Secure
  const handleAutoSecurePlan = () => {
    recordUndoSnapshot();
    const newDevices: SecurityDeviceElement[] = [];

    // 1. Cover vehicle gate with bullet camera for LPR
    (plan.gates || []).forEach((gate, gIdx) => {
      newDevices.push({
        id: `auto_gate_cam_${gIdx}_${Date.now()}`,
        type: 'camera_bullet',
        x: Math.round(Math.max(1, gate.x) * 4) / 4,
        y: Math.round(Math.max(1, gate.y + 2.5) * 4) / 4,
        z: 2.8,
        rotation: 270,
        fovAngle: 85,
        range: 14,
        label: `CAM-0${newDevices.length + 1} Portail Véhicules & LPR`,
        modelName: 'Dahua IPC-HFW2431S 4MP',
        isOutdoor: true,
        resolution: '5MP 4K UHD - IR 30m',
        channel: newDevices.length + 1,
      });
    });

    // 2. Cover doors with cameras
    plan.doors.forEach((door, idx) => {
      const isExit = door.isEmergencyExit;
      const camId = `auto_cam_door_${idx + 1}_${Date.now()}`;
      const angleRad = (door.angle * Math.PI) / 180;
      const offsetX = Math.cos(angleRad + Math.PI / 2) * 2.5;
      const offsetY = Math.sin(angleRad + Math.PI / 2) * 2.5;
      const camX = Math.max(1, Math.min(plan.widthMeters - 1, door.x + offsetX));
      const camY = Math.max(1, Math.min(plan.heightMeters - 1, door.y + offsetY));
      const targetAngle = (Math.atan2(door.y - camY, door.x - camX) * 180) / Math.PI;

      newDevices.push({
        id: camId,
        type: isExit ? 'camera_dome' : 'camera_bullet',
        x: Math.round(camX * 4) / 4,
        y: Math.round(camY * 4) / 4,
        z: 2.8,
        rotation: Math.round((targetAngle + 360) % 360),
        fovAngle: 90,
        range: 12,
        label: isExit
          ? `CAM-0${newDevices.length + 1} Issue de Secours`
          : `CAM-0${newDevices.length + 1} Surveillance Entrée`,
        modelName: isExit ? 'Hikvision DS-2CD2143G2' : 'Dahua IPC-HFW2431S 4MP',
        isOutdoor: !isExit,
        resolution: '4MP AcuSense 1080p',
        channel: newDevices.length + 1,
      });
    });

    // 3. Central indoor dome in main rooms
    plan.rooms.slice(0, 2).forEach((room, rIdx) => {
      const centerX = Math.round((room.x + room.width / 2) * 4) / 4;
      const centerY = Math.round((room.y + room.height / 2) * 4) / 4;
      newDevices.push({
        id: `auto_room_cam_${rIdx}_${Date.now()}`,
        type: 'camera_dome',
        x: centerX,
        y: centerY,
        z: 2.7,
        rotation: 0,
        fovAngle: 120,
        range: 8,
        label: `CAM-0${newDevices.length + 1} Panoramique ${room.name}`,
        modelName: 'Dahua IPC-HDBW2431E 4MP',
        isOutdoor: false,
        resolution: '4MP Grand Angle 360°',
        channel: newDevices.length + 1,
      });
    });

    // 4. Add NVR & Monitor in technical room
    const safeRoom = plan.rooms[plan.rooms.length - 1] || { x: 2, y: 2, width: 4, height: 3 };
    newDevices.push({
      id: `auto_dvr_${Date.now()}`,
      type: 'dvr',
      x: Math.round((safeRoom.x + 1.2) * 4) / 4,
      y: Math.round((safeRoom.y + 1.2) * 4) / 4,
      z: 0.8,
      rotation: 0,
      fovAngle: 0,
      range: 0,
      label: 'NVR 16 Canaux 4K (Local Sécurisé)',
      modelName: 'Dahua NVR4116-4KS2 (4 To HDD)',
      isOutdoor: false,
      resolution: '16 Canaux 4K H.265+',
    });

    newDevices.push({
      id: `auto_monitor_${Date.now()}`,
      type: 'monitor_screen',
      x: Math.round((safeRoom.x + 2.2) * 4) / 4,
      y: Math.round((safeRoom.y + 1.2) * 4) / 4,
      z: 1.2,
      rotation: 0,
      fovAngle: 0,
      range: 0,
      label: 'Moniteur Surveillance PC Sécurité 32"',
      modelName: 'Moniteur 32" Ultra HD',
      isOutdoor: false,
      resolution: '4K Ultra HD',
    });

    // 5. Add siren near front door or gate
    const frontPos = (plan.gates && plan.gates[0]) || plan.doors[0] || { x: 4, y: 4 };
    newDevices.push({
      id: `auto_alarm_${Date.now()}`,
      type: 'alarm_siren',
      x: Math.max(1, frontPos.x - 1.5),
      y: Math.max(1, frontPos.y),
      z: 2.8,
      rotation: 90,
      fovAngle: 180,
      range: 15,
      label: 'Sirène Extérieure Flash Auto-protégée',
      modelName: 'Ajax StreetSiren 113dB',
      isOutdoor: true,
      resolution: '113 dB Lumineux',
    });

    setPlan((prev) => ({
      ...prev,
      devices: newDevices,
    }));
    setSelectedId(newDevices[0]?.id || null);
    setSelectedType('device');
    showToast(t.autoSecureToast);
  };

  const getFullSyncPayload = (): FloorPlanFullSyncData => {
    const indoorQty = indoorCams;
    const outdoorQty = outdoorCams;
    const recQty = Math.max(1, dvrCount);
    const totalEquipment = indoorQty + outdoorQty + recQty;

    const indoorNature =
      indoorQty > 0
        ? `كاميرات مراقبة داخلية ثابتة بدون أشعة تحت الحمراء (${indoorQty} كاميرات) طراز HIKVISION DS-2CE56D0T - أرقام: HK-INT-001 إلى HK-INT-${String(
            indoorQty
          ).padStart(3, '0')}`
        : 'لا توجد كاميرات داخلية في المخطط';

    const outdoorNature =
      outdoorQty > 0
        ? `كاميرات مراقبة خارجية نهارية بدون أشعة تحت الحمراء (${outdoorQty} كاميرات${
            ptzCount > 0 ? ` منها ${ptzCount} متحركة PTZ 360°` : ''
          }) طراز HIKVISION DS-2CE16D0T - أرقام: HK-EXT-001 إلى HK-EXT-${String(
            outdoorQty
          ).padStart(3, '0')}`
        : 'لا توجد كاميرات خارجية في المخطط';

    const recDesignation = `مسجل فيديو رقمي DVR (${recQty} جهاز) 16 قناة (دارة مغلقة CCTV غير موصول بالإنترنت)`;
    const recNature = `مسجل HIKVISION DVR-7216HQHI-K2 سعة حفظ 30 يوماً - الرقم التسلسلي: SN-98451200`;

    const dvrDev = plan.devices.find((d) => d.type === 'dvr');
    const dvrRm = dvrDev
      ? plan.rooms.find(
          (r) =>
            dvrDev.x >= r.x &&
            dvrDev.x <= r.x + r.width &&
            dvrDev.y >= r.y &&
            dvrDev.y <= r.y + r.height
        )
      : null;
    const roomName = dvrRm ? dvrRm.nameAr || dvrRm.name : 'الغرفة التقنية المؤمنة';
    const siteAddr =
      currentFormValues?.['p3_installation_address'] ||
      currentFormValues?.['p1_exploitation_address'] ||
      'نهج العقيد لطفي رقم 24، بلدية وهران';

    const storagePlaces = `مقر المنشأة (${roomName}) - ${siteAddr}`;
    const securityCond = `خزانة حديدية مصفحة ومغلقة بمفتاح في ${roomName} تحت مسؤولية المسير المباشرة، مع نظام إنذار وغير موصول بشبكة الإنترنت (مدة حفظ التسجيلات 30 يوماً)`;

    const camTypesSummary = `${bulletCount} Bullet Ext. (${outdoorCams} Ext / ${indoorCams} Int)${
      ptzCount > 0 ? ` + ${ptzCount} PTZ 360°` : ''
    }`;
    const recorderTypeSummary = `${recQty} NVR/DVR 16 Voies`;

    return {
      indoorCamQty: indoorQty,
      outdoorCamQty: outdoorQty,
      totalCamQty: totalEquipment,
      recorderQty: recQty,
      indoorCamNature: indoorNature,
      outdoorCamNature: outdoorNature,
      recorderDesignation: recDesignation,
      recorderNature: recNature,
      storageUsePlaces: storagePlaces,
      securityConditions: securityCond,
      camTypesSummary,
      recorderTypeSummary,
    };
  };

  const handleApplyWiringToForm = () => {
    const payload = getFullSyncPayload();
    if (onSyncAllWithForm) {
      onSyncAllWithForm(payload);
    }
    if (onSyncWithPdfForm) {
      onSyncWithPdfForm({
        indoorCamQty: payload.indoorCamQty,
        outdoorCamQty: payload.outdoorCamQty,
        totalCamQty: payload.indoorCamQty + payload.outdoorCamQty,
        recorderQty: payload.recorderQty,
        camTypesSummary: payload.camTypesSummary,
        recorderTypeSummary: payload.recorderTypeSummary,
      });
    }
    setIsWiringModalOpen(false);
    showToast(t.wiringSuccessToast);
  };

  const handleImportEquipmentFromForm = () => {
    if (!currentFormValues) {
      showToast('Aucune valeur de formulaire disponible.');
      return;
    }
    const targetIndoor = parseInt((currentFormValues['p3_indoor_cam_qty'] || '0').trim(), 10) || 0;
    const targetOutdoor = parseInt((currentFormValues['p3_outdoor_cam_qty'] || '0').trim(), 10) || 0;
    const targetDvr = parseInt((currentFormValues['p3_recorder_qty'] || '1').trim(), 10) || 1;

    recordUndoSnapshot();
    const newDevs: SecurityDeviceElement[] = [];

    // Keep monitors and alarms
    plan.devices
      .filter(
        (d) => d.type === 'alarm_siren' || d.type === 'monitor_screen' || d.type === 'pir_sensor'
      )
      .forEach((d) => newDevs.push(d));

    // Place DVR
    const safeRoom = plan.rooms[0] || { x: 2, y: 2, width: 4, height: 4 };
    for (let i = 0; i < targetDvr; i++) {
      newDevs.push({
        id: `imported_dvr_${i + 1}`,
        type: 'dvr',
        x: Math.round((safeRoom.x + 1.2 + i * 0.8) * 4) / 4,
        y: Math.round((safeRoom.y + 1.2) * 4) / 4,
        z: 0.8,
        rotation: 0,
        fovAngle: 0,
        range: 0,
        label: `DVR-0${i + 1} 16 Voies (${safeRoom.name})`,
        modelName: 'HIKVISION DVR-7216HQHI-K2',
        isOutdoor: false,
        resolution: '16 Ch. 4K HDMI',
      });
    }

    // Place outdoor cameras
    for (let i = 0; i < targetOutdoor; i++) {
      const g = (plan.gates && plan.gates[i]) || plan.doors[i] || { x: 2 + i * 4, y: 1.5 };
      newDevs.push({
        id: `imported_cam_ext_${i + 1}`,
        type: i === 0 && targetOutdoor > 2 ? 'camera_ptz' : 'camera_bullet',
        x: Math.round((g.x + 1) * 4) / 4,
        y: Math.round((g.y + 2) * 4) / 4,
        z: 2.8,
        rotation: 270,
        fovAngle: i === 0 && targetOutdoor > 2 ? 360 : 85,
        range: 15,
        label: `CAM-EXT-0${i + 1} Périmètre & Accès`,
        modelName: 'HIKVISION DS-2CE16D0T',
        isOutdoor: true,
        resolution: '5MP Ultra HD',
        channel: newDevs.length + 1,
      });
    }

    // Place indoor cameras
    for (let i = 0; i < targetIndoor; i++) {
      const room = plan.rooms[i % Math.max(1, plan.rooms.length)] || {
        x: 4,
        y: 6,
        width: 4,
        height: 4,
      };
      newDevs.push({
        id: `imported_cam_int_${i + 1}`,
        type: 'camera_dome',
        x: Math.round((room.x + room.width / 2 + (i % 2 === 0 ? -0.5 : 0.5)) * 4) / 4,
        y: Math.round((room.y + room.height / 2 + (i % 2 === 0 ? -0.5 : 0.5)) * 4) / 4,
        z: 2.5,
        rotation: (i * 90) % 360,
        fovAngle: 90,
        range: 10,
        label: `CAM-INT-0${i + 1} ${room.name}`,
        modelName: 'HIKVISION DS-2CE56D0T',
        isOutdoor: false,
        resolution: '4MP Dôme Intérieur',
        channel: newDevs.length + 1,
      });
    }

    setPlan((prev) => ({
      ...prev,
      devices: newDevs,
    }));
    setIsWiringModalOpen(false);
    showToast(
      `Configuration importée du Formulaire : ${targetIndoor} caméras intérieures, ${targetOutdoor} extérieures, ${targetDvr} DVR.`
    );
  };

  const handleSyncToForm = () => {
    handleApplyWiringToForm();
  };

  // Export Plan to High-Resolution PNG with Cartouche
  const handleExportPlanImage = () => {
    const canvas = document.createElement('canvas');
    const width = 1600;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#047857';
    ctx.fillRect(0, 0, width, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('DIRECTION DE LA RÉGLEMENTATION ET DES AFFAIRES GÉNÉRALES (DRAG) · WILAYA D’ORAN', 30, 36);
    ctx.font = '15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Plan de Situation & Implantation CCTV — ${plan.name} · Demandeur: ${applicantName}`, 30, 60);

    const offsetX = 50;
    const offsetY = 110;
    const planWidthPx = width - 100;
    const planHeightPx = height - 240;
    const scaleFactor = Math.min(
      planWidthPx / (plan.widthMeters * BASE_SCALE),
      planHeightPx / (plan.heightMeters * BASE_SCALE)
    );

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scaleFactor, scaleFactor);

    // Rooms
    plan.rooms.forEach((r) => {
      ctx.fillStyle = r.color || '#f8fafc';
      ctx.fillRect(r.x * BASE_SCALE, r.y * BASE_SCALE, r.width * BASE_SCALE, r.height * BASE_SCALE);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(r.x * BASE_SCALE, r.y * BASE_SCALE, r.width * BASE_SCALE, r.height * BASE_SCALE);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(r.name, r.x * BASE_SCALE + 10, r.y * BASE_SCALE + 24);
    });

    // Stairs
    (plan.stairs || []).forEach((stair) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(stair.x * BASE_SCALE, stair.y * BASE_SCALE, stair.width * BASE_SCALE, stair.length * BASE_SCALE);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(stair.x * BASE_SCALE, stair.y * BASE_SCALE, stair.width * BASE_SCALE, stair.length * BASE_SCALE);

      // Steps lines
      const stepCount = stair.steps || 12;
      const stepH = (stair.length * BASE_SCALE) / stepCount;
      for (let i = 1; i < stepCount; i++) {
        ctx.beginPath();
        ctx.moveTo(stair.x * BASE_SCALE, stair.y * BASE_SCALE + i * stepH);
        ctx.lineTo(stair.x * BASE_SCALE + stair.width * BASE_SCALE, stair.y * BASE_SCALE + i * stepH);
        ctx.stroke();
      }
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('ESCALIER', stair.x * BASE_SCALE + 4, stair.y * BASE_SCALE + 14);
    });

    // Gates
    (plan.gates || []).forEach((gate) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gate.x * BASE_SCALE - 6, gate.y * BASE_SCALE - 6, 12, 12);
      ctx.fillRect((gate.x + gate.width) * BASE_SCALE - 6, gate.y * BASE_SCALE - 6, 12, 12);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(gate.x * BASE_SCALE, gate.y * BASE_SCALE);
      ctx.lineTo((gate.x + gate.width) * BASE_SCALE, gate.y * BASE_SCALE);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('PORTAIL', gate.x * BASE_SCALE + 10, gate.y * BASE_SCALE - 10);
    });

    // Doors
    plan.doors.forEach((d) => {
      ctx.fillStyle = d.isEmergencyExit ? '#16a34a' : '#78350f';
      ctx.fillRect(d.x * BASE_SCALE - 12, d.y * BASE_SCALE - 6, 24, 12);
      ctx.font = '10px sans-serif';
      ctx.fillText(d.isEmergencyExit ? 'ISSUE' : 'PORTE', d.x * BASE_SCALE - 16, d.y * BASE_SCALE - 10);
    });

    // Devices & Vision Cones
    plan.devices.forEach((dev) => {
      const cx = dev.x * BASE_SCALE;
      const cy = dev.y * BASE_SCALE;

      if (dev.type === 'camera_bullet' || dev.type === 'camera_dome' || dev.type === 'camera_ptz') {
        const angleRad = (dev.rotation * Math.PI) / 180;
        const halfFov = ((dev.fovAngle || 80) * Math.PI) / 360;
        const rangePx = (dev.range || 10) * BASE_SCALE;

        ctx.beginPath();
        if (dev.type === 'camera_ptz') {
          ctx.arc(cx, cy, rangePx, 0, Math.PI * 2);
        } else {
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, rangePx, angleRad - halfFov, angleRad + halfFov);
          ctx.closePath();
        }
        ctx.fillStyle =
          dev.type === 'camera_ptz'
            ? 'rgba(168, 85, 247, 0.18)'
            : dev.isOutdoor
            ? 'rgba(16, 185, 129, 0.22)'
            : 'rgba(56, 189, 248, 0.22)';
        ctx.fill();
        ctx.strokeStyle = dev.type === 'camera_ptz' ? '#9333ea' : dev.isOutdoor ? '#059669' : '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fillStyle = dev.type === 'camera_ptz' ? '#9333ea' : dev.type === 'camera_bullet' ? '#047857' : '#0284c7';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

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
    ctx.fillText(
      `• Caméras Extérieures (Bullet/PTZ) : ${outdoorCams} unités  |  • Caméras Intérieures (Dôme) : ${indoorCams} unités  |  • Portails : ${gateCount}  |  • Escaliers : ${stairCount}`,
      30,
      height - 38
    );
    ctx.fillText(
      `• Enregistreur DVR/NVR : ${dvrCount} unité(s)  |  • Moniteurs : ${monitorCount}  |  • Sirènes : ${alarmCount}  |  • Couverture du site : ${siteCoverageScore}%`,
      30,
      height - 18
    );

    ctx.fillText(`Généré le ${new Date().toLocaleDateString('fr-FR')} — Système Conforme DRAG Wilaya d'Oran`, width - 420, height - 20);

    const link = document.createElement('a');
    link.download = `schema_cctv_${plan.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Schéma d’implantation exporté en PNG haute définition.');
  };

  const activePovCamera = plan.devices.find((d) => d.id === simulatedCameraId);

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
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
              Module CCTV 2D/3D & Assistant Débutant
            </span>
            <span className="text-xs text-slate-500">
              Conforme Arrêté Interministériel DRAG Wilaya d’Oran
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">
            {t.floorPlanTitle}
          </h1>
          <p className="text-xs text-slate-600 max-w-3xl">
            {t.floorPlanSubtitle}
          </p>
        </div>

        {/* 2D / 3D Switcher & Fast Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('2d')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Plan 2D</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
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
            onClick={handleAutoSecurePlan}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Analyser le plan et placer automatiquement les caméras sur toutes les entrées"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.btnAutoSecure}</span>
          </button>

          <button
            onClick={() => setIsWiringModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Mappage direct des champs du plan avec les 3 pages du Formulaire DRAG"
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t.btnFieldWiring}</span>
          </button>

          <button
            onClick={handleSyncToForm}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Copier les quantités vers la Page 3 du formulaire DRAG"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sync Page 3</span>
          </button>

          <button
            onClick={handleExportPlanImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            title="Télécharger le plan avec le cartouche officiel DRAG Wilaya d'Oran"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG Haute Déf.</span>
          </button>
        </div>
      </div>

      {/* Beginner Step-by-Step Guide Banner */}
      {showBeginnerGuide && (
        <div className="bg-slate-900 text-white rounded-xl p-3 sm:p-4 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-600/30 text-emerald-400 rounded-lg">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Guide Pas-à-Pas Simplifié · Créer votre schéma sans effort
                </h3>
                <p className="text-[11px] text-slate-300">
                  {t.longPressDragHint} · {t.tapToSelectHint}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBeginnerGuide(false)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Masquer</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => {
                setActiveStep(1);
                setActiveTool('room');
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Box className="w-3.5 h-3.5" />
                <span>{t.step1Rooms}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Tracez les pièces et configurez les murs.
              </div>
            </button>

            <button
              onClick={() => {
                setActiveStep(2);
                setActiveTool('gate');
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Fence className="w-3.5 h-3.5" />
                <span>2. Portails & Escaliers</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Ajoutez portails véhicules, escaliers, portes.
              </div>
            </button>

            <button
              onClick={() => {
                setActiveStep(3);
                setActiveTool('camera_bullet');
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 3
                  ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-cyan-400">
                <Video className="w-3.5 h-3.5" />
                <span>{t.step3Cameras}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Déposez caméras Bullet, Dôme, PTZ 360°, NVR.
              </div>
            </button>

            <button
              onClick={() => {
                setActiveStep(4);
                handleSyncToForm();
              }}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activeStep === 4
                  ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.step4Export}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Exportez le PNG et synchronisez le PDF officiel.
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Safety Audit & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.coveragePercent}:</span>
            <span className="font-bold text-slate-900">{siteCoverageScore}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                siteCoverageScore >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
              style={{ width: `${siteCoverageScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Total Caméras:</span>
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
            {totalCams}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Portails & Escaliers:</span>
          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono">
            {gateCount + stairCount}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Extérieures / PTZ:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
            {outdoorCams}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Autonomie 30j :</span>
          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">
            {recommendedHddTb}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-slate-500">Accès Couverts:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded font-mono ${
              uncoveredAccess.length === 0
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-amber-700 bg-amber-50'
            }`}
          >
            {allAccessPoints.length - uncoveredAccess.length}/{allAccessPoints.length}
          </span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Toolbar / Library (Cols 1-3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Preset Models */}
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
                      ? 'تم تحميل نموذج الفيلا السكنية (Ctrl+Z للتراجع)'
                      : 'Modèle Villa Résidentielle (Oran) chargé.'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">🏡 Villa Individuelle</div>
                <div className="text-[11px] text-slate-500">Portail motorisé, escalier, PTZ, cour, salon</div>
              </button>
              <button
                onClick={() => {
                  recordUndoSnapshot();
                  setPlan(PRESET_STORE_ORAN);
                  setSelectedId(null);
                  showToast(
                    isRtl
                      ? 'تم تحميل نموذج المحل التجاري (Ctrl+Z للتراجع)'
                      : 'Modèle Local Commercial chargé.'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">🏪 Local Commercial / Supérette</div>
                <div className="text-[11px] text-slate-500">Portail livraison, escalier mezzanine, caisses</div>
              </button>
              <button
                onClick={() => {
                  recordUndoSnapshot();
                  setPlan(PRESET_BLANK);
                  setSelectedId(null);
                  showToast(
                    isRtl
                      ? 'مخطط فارغ جديد جاهز (Ctrl+Z للتراجع)'
                      : 'Nouveau plan vierge prêt.'
                  );
                }}
                className="text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
              >
                <div className="font-semibold">✏️ Nouveau Plan Vierge</div>
                <div className="text-[11px] text-slate-400">Dessinez votre bâti de zéro</div>
              </button>
            </div>
          </div>

          {/* Tools Palette */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Outils & Équipements
            </h3>

            <div className="space-y-1">
              {/* Select Tool */}
              <button
                onClick={() => setActiveTool('select')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'select'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Move className="w-4 h-4 shrink-0" />
                  <span>Sélectionner / Déplacer</span>
                </div>
                <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono">
                  Appui Long
                </span>
              </button>

              {/* Eraser Tool */}
              <button
                onClick={() => {
                  setActiveTool('eraser');
                  showToast(isRtl ? 'أداة الممحاة مفعلة' : 'Outil Gomme activé : Cliquez pour effacer.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white font-semibold shadow-xs ring-2 ring-rose-400'
                    : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Eraser className="w-4 h-4 shrink-0" />
                  <span>Outil Gomme (Effacer)</span>
                </div>
                <span className="text-[10px] bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded font-mono font-bold">
                  [E] Clic
                </span>
              </button>

              {/* Measure Ruler Tool */}
              <button
                onClick={() => {
                  setActiveTool('measure');
                  showToast('Outil Mesure : Cliquez et glissez entre deux points pour mesurer.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'measure'
                    ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                    : 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ruler className="w-4 h-4 shrink-0" />
                  <span>Règle Métrique (Mesure)</span>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">
                  Mètres
                </span>
              </button>

              {/* Room (Square) */}
              <button
                onClick={() => {
                  setActiveTool('room');
                  showToast('Mode Dessin : Cliquez et glissez sur le plan pour tracer une pièce.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'room'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Tracer Pièce / Mur</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Glisser
                </span>
              </button>

              {/* Portal / Vehicle Gate (NEW) */}
              <button
                onClick={() => {
                  setActiveTool('gate');
                  showToast('Cliquez sur le plan pour poser un Portail Véhicules.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'gate'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Fence className="w-4 h-4 shrink-0 text-amber-800" />
                  <span>Portail Véhicules (3.5m)</span>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Stairs (NEW) */}
              <button
                onClick={() => {
                  setActiveTool('stairs');
                  showToast('Cliquez sur le plan pour poser un Escalier.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'stairs'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-600 rotate-90" />
                  <span>Escalier d'accès</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Door */}
              <button
                onClick={() => {
                  setActiveTool('door');
                  showToast('Cliquez sur le plan pour poser une porte.');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                  showToast('Cliquez sur le plan pour poser une fenêtre.');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                  Matériel CCTV & Sécurité
                </span>
              </div>

              {/* Bullet Camera */}
              <button
                onClick={() => {
                  setActiveTool('camera_bullet');
                  showToast('Cliquez sur le plan pour poser une Caméra Bullet.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'camera_bullet'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Caméra Bullet (Tube Extérieur)</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Dome Camera */}
              <button
                onClick={() => {
                  setActiveTool('camera_dome');
                  showToast('Cliquez sur le plan pour poser une Caméra Dôme.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'camera_dome'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-cyan-600" />
                  <span>Caméra Dôme (Plafond Intérieur)</span>
                </div>
                <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* PTZ 360 Camera (NEW) */}
              <button
                onClick={() => {
                  setActiveTool('camera_ptz');
                  showToast('Cliquez sur le plan pour poser une Caméra PTZ 360° motorisée.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'camera_ptz'
                    ? 'bg-purple-700 text-white font-semibold shadow-xs'
                    : 'text-purple-800 bg-purple-50/70 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>Caméra PTZ 360° (Motorisée)</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono">
                  360°
                </span>
              </button>

              {/* DVR Unit */}
              <button
                onClick={() => {
                  setActiveTool('dvr');
                  showToast('Cliquez sur le plan pour placer l’enregistreur DVR/NVR.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'dvr'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>Enregistreur NVR / DVR</span>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Monitor Screen (NEW) */}
              <button
                onClick={() => {
                  setActiveTool('monitor_screen');
                  showToast('Cliquez sur le plan pour placer un Moniteur de Surveillance.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'monitor_screen'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 shrink-0 text-sky-600" />
                  <span>Moniteur Écran Vidéo</span>
                </div>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* PIR Detector (NEW) */}
              <button
                onClick={() => {
                  setActiveTool('pir_sensor');
                  showToast('Cliquez sur le plan pour placer un détecteur PIR volumétrique.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'pir_sensor'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Détecteur Mouvement PIR</span>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Alarm Siren */}
              <button
                onClick={() => {
                  setActiveTool('alarm_siren');
                  showToast('Cliquez sur le plan pour placer la sirène d’alarme.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTool === 'alarm_siren'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Sirène & Flash Alarme</span>
                </div>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                  Poser
                </span>
              </button>

              {/* Text Annotation */}
              <button
                onClick={() => {
                  setActiveTool('text');
                  showToast('Cliquez sur le plan pour insérer une annotation textuelle.');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
                  Poser
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas Area (Cols 4-9) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col min-h-[600px]">
          {/* Canvas Mode Header */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                {viewMode === '2d' ? 'Éditeur Architectural 2D' : 'Rendu 3D Isométrique Three.js'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 hidden sm:inline">
                Grille : 1m | Snap : {gridSnapOn ? '0.25m' : 'Libre'}
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, Math.round((z - 0.15) * 100) / 100))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  title="Zoom arrière (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[10px] font-mono font-semibold text-slate-700">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.0, Math.round((z + 0.15) * 100) / 100))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                  title="Zoom avant (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setShowFovCones((v) => !v)}
                className={`p-1.5 rounded-md text-xs border cursor-pointer transition-colors ${
                  showFovCones
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}
                title="Afficher/Masquer les cônes de vision"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-300 mx-0.5" />

              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Annuler (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Annuler</span>
                {undoStack.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                    {undoStack.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                title="Rétablir (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Rétablir</span>
              </button>

              <button
                onClick={() => setActiveTool((curr) => (curr === 'eraser' ? 'select' : 'eraser'))}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  activeTool === 'eraser'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-2xs font-semibold ring-1 ring-rose-400'
                    : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border-slate-200'
                }`}
                title="Outil Gomme (E)"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Gomme</span>
              </button>

              {selectedId && (
                <>
                  <button
                    onClick={() => handleRotateSelected(45)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
                    title="Pivoter 45°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-colors cursor-pointer"
                    title="Supprimer (Suppr)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Long Press Interaction Reminder Tip */}
          <div className="px-3 py-1 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                <strong>Déplacement :</strong> Maintenez appuyé (0.3s) sur un élément puis glissez. Clic simple = sélectionner.
              </span>
            </span>
            <span className="text-emerald-700 font-mono text-[10px] hidden md:inline">
              Portails & Escaliers actifs
            </span>
          </div>

          {/* Active Eraser Banner */}
          {activeTool === 'eraser' && (
            <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-fade-in">
              <span className="flex items-center gap-2 font-medium">
                <Eraser className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
                <span>
                  Mode Gomme actif : Cliquez sur n'importe quel élément pour l'effacer immédiatement.
                </span>
              </span>
              <button
                onClick={() => setActiveTool('select')}
                className="underline text-[11px] font-semibold text-rose-900 hover:text-rose-950 cursor-pointer ml-2 whitespace-nowrap"
              >
                Quitter la gomme
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
                    const coords = getCanvasCoords(e);
                    if (activeTool === 'room') {
                      setIsDrawingRoom(true);
                      setDrawStart(coords);
                      setCurrentDrawCoord(coords);
                    }
                  }}
                  onTouchMove={(e) => handleSvgMouseMove(e as any)}
                  onTouchEnd={() => handleSvgMouseUp()}
                  className={`select-none block touch-none ${
                    isDraggingElement
                      ? 'cursor-grabbing'
                      : activeTool === 'eraser'
                      ? 'cursor-crosshair'
                      : activeTool === 'room' || activeTool === 'measure'
                      ? 'cursor-crosshair'
                      : 'cursor-default'
                  }`}
                >
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

                  {/* 1. Rooms */}
                  {plan.rooms.map((room) => {
                    const isSelected = selectedId === room.id;
                    const isBeingDragged = isDraggingElement && draggingId === room.id;
                    const isPending = pendingLongPress?.id === room.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === room.id;

                    return (
                      <g
                        key={room.id}
                        onMouseDown={(e) => handleElementPressStart(e, room.id, 'room', room.x, room.y)}
                        onTouchStart={(e) => handleElementPressStart(e, room.id, 'room', room.x, room.y)}
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(room.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={room.x * SCALE}
                          y={room.y * SCALE}
                          width={room.width * SCALE}
                          height={room.height * SCALE}
                          fill={isEraseHovered ? '#fee2e2' : room.color || '#f8fafc'}
                          stroke={isEraseHovered ? '#ef4444' : isSelected ? '#047857' : isPending ? '#059669' : '#0f172a'}
                          strokeWidth={isEraseHovered ? 3.5 : isSelected ? 3 : isPending ? 3 : 2}
                          strokeDasharray={isPending ? '4 2' : isEraseHovered ? '6 3' : undefined}
                          rx={3}
                          className={isBeingDragged ? 'filter drop-shadow-md' : ''}
                        />
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
                        {showDimensions && (
                          <text
                            x={room.x * SCALE + room.width * SCALE - 64}
                            y={room.y * SCALE + room.height * SCALE - 8}
                            fontSize="10"
                            fill="#94a3b8"
                            className="pointer-events-none font-mono"
                          >
                            {room.width}m × {room.height}m
                          </text>
                        )}
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

                  {/* 2. Stairs (NEW) */}
                  {(plan.stairs || []).map((stair) => {
                    const isSelected = selectedId === stair.id;
                    const isPending = pendingLongPress?.id === stair.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === stair.id;
                    const sx = stair.x * SCALE;
                    const sy = stair.y * SCALE;
                    const sWidth = stair.width * SCALE;
                    const sLength = stair.length * SCALE;
                    const stepCount = stair.steps || 12;
                    const stepH = sLength / stepCount;

                    return (
                      <g
                        key={stair.id}
                        onMouseDown={(e) => handleElementPressStart(e, stair.id, 'stairs', stair.x, stair.y)}
                        onTouchStart={(e) => handleElementPressStart(e, stair.id, 'stairs', stair.x, stair.y)}
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(stair.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                        transform={`rotate(${stair.angle}, ${sx + sWidth / 2}, ${sy + sLength / 2})`}
                      >
                        {/* Stair Base Box */}
                        <rect
                          x={sx}
                          y={sy}
                          width={sWidth}
                          height={sLength}
                          fill={isEraseHovered ? '#fee2e2' : '#f1f5f9'}
                          stroke={isEraseHovered ? '#ef4444' : isSelected ? '#047857' : isPending ? '#059669' : '#334155'}
                          strokeWidth={isSelected ? 3 : 2}
                          rx={2}
                        />
                        {/* Stair Step Lines */}
                        {Array.from({ length: stepCount - 1 }).map((_, idx) => (
                          <line
                            key={idx}
                            x1={sx}
                            y1={sy + (idx + 1) * stepH}
                            x2={sx + sWidth}
                            y2={sy + (idx + 1) * stepH}
                            stroke="#64748b"
                            strokeWidth={1}
                          />
                        ))}
                        {/* Direction Arrow */}
                        <line
                          x1={sx + sWidth / 2}
                          y1={sy + sLength - 6}
                          x2={sx + sWidth / 2}
                          y2={sy + 8}
                          stroke="#0f172a"
                          strokeWidth={2}
                          markerEnd="url(#arrow)"
                        />
                        <text
                          x={sx + sWidth / 2}
                          y={sy + sLength / 2 + 4}
                          fontSize="9"
                          fontWeight="bold"
                          fill="#0f172a"
                          textAnchor="middle"
                          className="pointer-events-none select-none"
                        >
                          {stair.direction === 'up' ? 'MONTÉE ↗' : 'DESCENTE ↘'}
                        </text>
                        <text
                          x={sx + 4}
                          y={sy - 4}
                          fontSize="9"
                          fontWeight="bold"
                          fill="#334155"
                          className="pointer-events-none select-none"
                        >
                          {stair.label || 'Escalier'} ({stair.steps} marches)
                        </text>
                      </g>
                    );
                  })}

                  {/* 3. Vehicle Gates (NEW) */}
                  {(plan.gates || []).map((gate) => {
                    const isSelected = selectedId === gate.id;
                    const isPending = pendingLongPress?.id === gate.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === gate.id;
                    const gx = gate.x * SCALE;
                    const gy = gate.y * SCALE;
                    const gWidth = gate.width * SCALE;

                    return (
                      <g
                        key={gate.id}
                        onMouseDown={(e) => handleElementPressStart(e, gate.id, 'gate', gate.x, gate.y)}
                        onTouchStart={(e) => handleElementPressStart(e, gate.id, 'gate', gate.x, gate.y)}
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(gate.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                        transform={`rotate(${gate.angle}, ${gx + gWidth / 2}, ${gy})`}
                      >
                        {/* Left & Right Gate Pillars */}
                        <rect x={gx - 8} y={gy - 8} width={16} height={16} fill="#0f172a" stroke="#ffffff" strokeWidth={1.5} rx={2} />
                        <rect x={gx + gWidth - 8} y={gy - 8} width={16} height={16} fill="#0f172a" stroke="#ffffff" strokeWidth={1.5} rx={2} />

                        {/* Heavy Gate Crossbeam */}
                        <line
                          x1={gx}
                          y1={gy}
                          x2={gx + gWidth}
                          y2={gy}
                          stroke={isEraseHovered ? '#ef4444' : isSelected ? '#047857' : '#1e293b'}
                          strokeWidth={isSelected ? 6 : 5}
                          strokeDasharray={gate.isMotorized ? '6 3' : undefined}
                        />

                        {/* Motorized Tag */}
                        <text
                          x={gx + gWidth / 2}
                          y={gy - 12}
                          fontSize="10"
                          fontWeight="bold"
                          fill="#0f172a"
                          textAnchor="middle"
                          className="pointer-events-none select-none font-sans"
                        >
                          🚗 {gate.label || 'Portail Véhicules'} {gate.isMotorized ? '(Motorisé)' : ''}
                        </text>
                      </g>
                    );
                  })}

                  {/* 4. Windows */}
                  {plan.windows.map((win) => {
                    const isSelected = selectedId === win.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === win.id;
                    const wx = win.x * SCALE;
                    const wy = win.y * SCALE;
                    const wWidth = win.width * SCALE;

                    return (
                      <g
                        key={win.id}
                        onMouseDown={(e) => handleElementPressStart(e, win.id, 'window', win.x, win.y)}
                        onTouchStart={(e) => handleElementPressStart(e, win.id, 'window', win.x, win.y)}
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
                          strokeWidth={isEraseHovered ? 2.5 : isSelected ? 2.5 : 1}
                          rx={2}
                          transform={`rotate(${win.angle}, ${wx}, ${wy})`}
                        />
                      </g>
                    );
                  })}

                  {/* 5. Doors & Emergency Exits */}
                  {plan.doors.map((door) => {
                    const isSelected = selectedId === door.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === door.id;
                    const dx = door.x * SCALE;
                    const dy = door.y * SCALE;
                    const dWidth = door.width * SCALE;

                    return (
                      <g
                        key={door.id}
                        onMouseDown={(e) => handleElementPressStart(e, door.id, 'door', door.x, door.y)}
                        onTouchStart={(e) => handleElementPressStart(e, door.id, 'door', door.x, door.y)}
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(door.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer"
                      >
                        <path
                          d={`M ${dx} ${dy} A ${dWidth} ${dWidth} 0 0 1 ${dx + dWidth} ${dy}`}
                          fill="none"
                          stroke={isEraseHovered ? '#ef4444' : door.isEmergencyExit ? '#22c55e' : '#94a3b8'}
                          strokeWidth={isEraseHovered ? 2 : 1}
                          strokeDasharray="3 3"
                          transform={`rotate(${door.angle}, ${dx}, ${dy})`}
                        />
                        <line
                          x1={dx}
                          y1={dy}
                          x2={dx + dWidth}
                          y2={dy}
                          stroke={isEraseHovered ? '#ef4444' : door.isEmergencyExit ? '#16a34a' : '#78350f'}
                          strokeWidth={isEraseHovered ? 5 : isSelected ? 4 : 3}
                          transform={`rotate(${door.angle}, ${dx}, ${dy})`}
                        />
                        <text
                          x={dx + 4}
                          y={dy - 6}
                          fontSize="9.5"
                          fontWeight="700"
                          fill={door.isEmergencyExit ? '#16a34a' : '#78350f'}
                          className="pointer-events-none select-none font-sans"
                        >
                          {door.isEmergencyExit ? '🚨 ISSUE DE SECOURS' : door.label || 'PORTE'}
                        </text>
                      </g>
                    );
                  })}

                  {/* 6. Security Devices (Cameras, PTZ, DVR, Monitor, Siren, PIR) */}
                  {plan.devices.map((dev) => {
                    const isSelected = selectedId === dev.id;
                    const isBeingDragged = isDraggingElement && draggingId === dev.id;
                    const isPending = pendingLongPress?.id === dev.id;
                    const isEraseHovered = activeTool === 'eraser' && hoveredEraseId === dev.id;

                    const cx = dev.x * SCALE;
                    const cy = dev.y * SCALE;

                    if (
                      dev.type === 'camera_bullet' ||
                      dev.type === 'camera_dome' ||
                      dev.type === 'camera_ptz'
                    ) {
                      const angleRad = (dev.rotation * Math.PI) / 180;
                      const halfFov = ((dev.fovAngle || 80) * Math.PI) / 360;
                      const rangePx = (dev.range || 10) * SCALE;

                      const startAngle = angleRad - halfFov;
                      const endAngle = angleRad + halfFov;

                      const x1 = cx + Math.cos(startAngle) * rangePx;
                      const y1 = cy + Math.sin(startAngle) * rangePx;
                      const x2 = cx + Math.cos(endAngle) * rangePx;
                      const y2 = cy + Math.sin(endAngle) * rangePx;

                      const largeArc = dev.fovAngle > 180 ? 1 : 0;
                      const conePath =
                        dev.type === 'camera_ptz'
                          ? `M ${cx - rangePx} ${cy} A ${rangePx} ${rangePx} 0 1 0 ${cx + rangePx} ${cy} A ${rangePx} ${rangePx} 0 1 0 ${cx - rangePx} ${cy}`
                          : `M ${cx} ${cy} L ${x1} ${y1} A ${rangePx} ${rangePx} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onTouchStart={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={isBeingDragged ? 'cursor-grabbing' : 'cursor-pointer'}
                        >
                          {showFovCones && (
                            <path
                              d={conePath}
                              fill={
                                isEraseHovered
                                  ? 'rgba(239, 68, 68, 0.25)'
                                  : dev.type === 'camera_ptz'
                                  ? 'rgba(168, 85, 247, 0.18)'
                                  : dev.isOutdoor
                                  ? 'rgba(16, 185, 129, 0.22)'
                                  : 'rgba(56, 189, 248, 0.22)'
                              }
                              stroke={
                                isEraseHovered
                                  ? '#ef4444'
                                  : dev.type === 'camera_ptz'
                                  ? '#9333ea'
                                  : dev.isOutdoor
                                  ? '#059669'
                                  : '#0284c7'
                              }
                              strokeWidth={isSelected ? 1.8 : 1}
                              strokeDasharray={isSelected ? '4 2' : undefined}
                              className="pointer-events-none"
                            />
                          )}

                          {isPending && (
                            <circle cx={cx} cy={cy} r={22} fill="none" stroke="#10b981" strokeWidth={2.5} className="animate-ping" />
                          )}

                          <circle
                            cx={cx}
                            cy={cy}
                            r={dev.type === 'camera_ptz' ? 14 : dev.type === 'camera_bullet' ? 12 : 11}
                            fill={
                              isEraseHovered
                                ? '#ef4444'
                                : isSelected
                                ? '#047857'
                                : dev.type === 'camera_ptz'
                                ? '#9333ea'
                                : dev.isOutdoor
                                ? '#059669'
                                : '#0284c7'
                            }
                            stroke="#ffffff"
                            strokeWidth={2.5}
                            className={isBeingDragged ? 'filter drop-shadow-lg' : ''}
                          />

                          {dev.type !== 'camera_ptz' && (
                            <line
                              x1={cx}
                              y1={cy}
                              x2={cx + Math.cos(angleRad) * 16}
                              y2={cy + Math.sin(angleRad) * 16}
                              stroke="#ffffff"
                              strokeWidth={3}
                              strokeLinecap="round"
                            />
                          )}

                          <text
                            x={cx}
                            y={cy + 3.5}
                            fontSize="9"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                            className="pointer-events-none select-none font-mono"
                          >
                            {dev.type === 'camera_ptz' ? '360°' : dev.channel || '●'}
                          </text>

                          {isBeingDragged && (
                            <g transform={`translate(${cx}, ${cy - 24})`}>
                              <rect x="-48" y="-14" width="96" height="18" rx="9" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                              <text x="0" y="-2" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                                {dev.x.toFixed(2)}m · {dev.y.toFixed(2)}m
                              </text>
                            </g>
                          )}

                          <text x={cx + 16} y={cy + 4} fontSize="10.5" fontWeight="700" fill={isEraseHovered ? '#ef4444' : '#0f172a'} className="pointer-events-none select-none">
                            {dev.label}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'dvr') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onTouchStart={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={isBeingDragged ? 'cursor-grabbing' : 'cursor-pointer'}
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
                            className={isBeingDragged ? 'filter drop-shadow-lg' : ''}
                          />
                          <text x={cx} y={cy + 3} fontSize="9" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                            {isEraseHovered ? '✖' : 'DVR'}
                          </text>
                          <text x={cx + 20} y={cy + 4} fontSize="11" fontWeight="700" fill={isEraseHovered ? '#ef4444' : '#047857'}>
                            {dev.label}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'monitor_screen') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onTouchStart={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={isBeingDragged ? 'cursor-grabbing' : 'cursor-pointer'}
                        >
                          <rect x={cx - 14} y={cy - 10} width={28} height={20} fill="#1e293b" stroke="#38bdf8" strokeWidth={1.5} rx={2} />
                          <rect x={cx - 11} y={cy - 8} width={22} height={14} fill="#0284c7" />
                          <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 14} stroke="#1e293b" strokeWidth={2} />
                          <line x1={cx - 6} y1={cy + 14} x2={cx + 6} y2={cy + 14} stroke="#1e293b" strokeWidth={2} />
                          <text x={cx + 18} y={cy + 4} fontSize="10.5" fontWeight="700" fill="#0369a1">
                            🖥️ {dev.label}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'pir_sensor') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onTouchStart={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={isBeingDragged ? 'cursor-grabbing' : 'cursor-pointer'}
                        >
                          <rect x={cx - 8} y={cy - 10} width={16} height={20} fill="#ffffff" stroke="#d97706" strokeWidth={1.5} rx={2} />
                          <circle cx={cx} cy={cy - 2} r={4} fill="#f59e0b" />
                          <text x={cx + 14} y={cy + 4} fontSize="10.5" fontWeight="700" fill="#b45309">
                            📡 {dev.label}
                          </text>
                        </g>
                      );
                    } else if (dev.type === 'alarm_siren') {
                      return (
                        <g
                          key={dev.id}
                          onMouseDown={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onTouchStart={(e) => handleElementPressStart(e, dev.id, 'device', dev.x, dev.y)}
                          onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(dev.id)}
                          onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                          className={isBeingDragged ? 'cursor-grabbing' : 'cursor-pointer'}
                        >
                          <circle cx={cx} cy={cy} r={12} fill={isEraseHovered ? '#7f1d1d' : isSelected ? '#b91c1c' : '#dc2626'} stroke="#ffffff" strokeWidth={2} />
                          <text x={cx} y={cy + 4} fontSize="10" fontWeight="bold" fill="#ffffff" textAnchor="middle">
                            {isEraseHovered ? '✖' : '🚨'}
                          </text>
                          <text x={cx + 16} y={cy + 4} fontSize="11" fontWeight="700" fill={isEraseHovered ? '#b91c1c' : '#dc2626'}>
                            {dev.label}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })}

                  {/* 7. Text Annotations */}
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
                        onMouseDown={(e) => handleElementPressStart(e, ann.id, 'annotation', ann.x, ann.y)}
                        onTouchStart={(e) => handleElementPressStart(e, ann.id, 'annotation', ann.x, ann.y)}
                        onMouseEnter={() => activeTool === 'eraser' && setHoveredEraseId(ann.id)}
                        onMouseLeave={() => activeTool === 'eraser' && setHoveredEraseId(null)}
                        className="cursor-pointer select-none"
                      >
                        {ann.text} {isEraseHovered && '✖'}
                      </text>
                    );
                  })}

                  {/* 8. Active Distance Measurement Line */}
                  {activeTool === 'measure' && measureStart && measureCurrent && (
                    <g className="pointer-events-none">
                      <line
                        x1={measureStart.x * SCALE}
                        y1={measureStart.y * SCALE}
                        x2={measureCurrent.x * SCALE}
                        y2={measureCurrent.y * SCALE}
                        stroke="#4f46e5"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      <circle cx={measureStart.x * SCALE} cy={measureStart.y * SCALE} r={4} fill="#4f46e5" />
                      <circle cx={measureCurrent.x * SCALE} cy={measureCurrent.y * SCALE} r={4} fill="#4f46e5" />
                      <rect
                        x={(measureStart.x + measureCurrent.x) / 2 * SCALE - 35}
                        y={(measureStart.y + measureCurrent.y) / 2 * SCALE - 12}
                        width="70"
                        height="20"
                        rx="10"
                        fill="#312e81"
                      />
                      <text
                        x={(measureStart.x + measureCurrent.x) / 2 * SCALE}
                        y={(measureStart.y + measureCurrent.y) / 2 * SCALE + 2}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {Math.hypot(measureCurrent.x - measureStart.x, measureCurrent.y - measureStart.y).toFixed(2)}m
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            ) : (
              <div className="w-full h-full min-h-[560px]">
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

            {/* If Gate Selected (NEW) */}
            {selectedGate && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nom du Portail
                  </label>
                  <input
                    type="text"
                    value={selectedGate.label || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        gates: (prev.gates || []).map((g) =>
                          g.id === selectedGate.id ? { ...g, label: val } : g
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Largeur d'Ouverture : {selectedGate.width}m
                  </label>
                  <input
                    type="range"
                    min="2.0"
                    max="6.0"
                    step="0.25"
                    value={selectedGate.width}
                    onChange={(e) => {
                      const w = parseFloat(e.target.value);
                      setPlan((prev) => ({
                        ...prev,
                        gates: (prev.gates || []).map((g) =>
                          g.id === selectedGate.id ? { ...g, width: w } : g
                        ),
                      }));
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={selectedGate.isMotorized}
                    onChange={(e) => {
                      const mot = e.target.checked;
                      setPlan((prev) => ({
                        ...prev,
                        gates: (prev.gates || []).map((g) =>
                          g.id === selectedGate.id ? { ...g, isMotorized: mot } : g
                        ),
                      }));
                    }}
                    className="rounded text-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">
                    Portail Motorisé Électrique (Télécommande)
                  </span>
                </label>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleRotateSelected(90)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                  >
                    Pivoter 90°
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* If Stair Selected (NEW) */}
            {selectedStair && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nom de l'Escalier
                  </label>
                  <input
                    type="text"
                    value={selectedStair.label || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPlan((prev) => ({
                        ...prev,
                        stairs: (prev.stairs || []).map((s) =>
                          s.id === selectedStair.id ? { ...s, label: val } : s
                        ),
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Largeur : {selectedStair.width}m
                    </label>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={selectedStair.width}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value);
                        setPlan((prev) => ({
                          ...prev,
                          stairs: (prev.stairs || []).map((s) =>
                            s.id === selectedStair.id ? { ...s, width: w } : s
                          ),
                        }));
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Longueur : {selectedStair.length}m
                    </label>
                    <input
                      type="range"
                      min="1.5"
                      max="5.0"
                      step="0.2"
                      value={selectedStair.length}
                      onChange={(e) => {
                        const len = parseFloat(e.target.value);
                        setPlan((prev) => ({
                          ...prev,
                          stairs: (prev.stairs || []).map((s) =>
                            s.id === selectedStair.id ? { ...s, length: len } : s
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
                      Nb Marches : {selectedStair.steps}
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="24"
                      value={selectedStair.steps}
                      onChange={(e) => {
                        const st = parseInt(e.target.value, 10) || 12;
                        setPlan((prev) => ({
                          ...prev,
                          stairs: (prev.stairs || []).map((s) =>
                            s.id === selectedStair.id ? { ...s, steps: st } : s
                          ),
                        }));
                      }}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sens Escalier
                    </label>
                    <select
                      value={selectedStair.direction}
                      onChange={(e) => {
                        const dir = e.target.value as 'up' | 'down';
                        setPlan((prev) => ({
                          ...prev,
                          stairs: (prev.stairs || []).map((s) =>
                            s.id === selectedStair.id ? { ...s, direction: dir } : s
                          ),
                        }));
                      }}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="up">Montée ↗</option>
                      <option value="down">Descente ↘</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleRotateSelected(90)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                  >
                    Pivoter 90°
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* If Camera / Security Device Selected */}
            {selectedDevice && (
              <div className="space-y-3 text-xs">
                {(selectedDevice.type === 'camera_bullet' ||
                  selectedDevice.type === 'camera_dome' ||
                  selectedDevice.type === 'camera_ptz') && (
                  <button
                    onClick={() => setSimulatedCameraId(selectedDevice.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <MonitorPlay className="w-4 h-4 text-emerald-400" />
                    <span>{t.btnLivePov}</span>
                  </button>
                )}

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

                {/* Precision Coordinates Control */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Position Métrique (X, Y)</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {selectedDevice.x.toFixed(2)}m · {selectedDevice.y.toFixed(2)}m
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500">Axe X:</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => {
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, x: Math.max(0, d.x - 0.5) } : d
                              ),
                            }));
                          }}
                          className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          -0.5
                        </button>
                        <button
                          onClick={() => {
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, x: Math.min(plan.widthMeters, d.x + 0.5) } : d
                              ),
                            }));
                          }}
                          className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          +0.5
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Axe Y:</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => {
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, y: Math.max(0, d.y - 0.5) } : d
                              ),
                            }));
                          }}
                          className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          -0.5
                        </button>
                        <button
                          onClick={() => {
                            setPlan((prev) => ({
                              ...prev,
                              devices: prev.devices.map((d) =>
                                d.id === selectedDevice.id ? { ...d, y: Math.min(plan.heightMeters, d.y + 0.5) } : d
                              ),
                            }));
                          }}
                          className="px-1.5 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          +0.5
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* If Camera: FOV and Angle Controls */}
                {(selectedDevice.type === 'camera_bullet' ||
                  selectedDevice.type === 'camera_dome' ||
                  selectedDevice.type === 'camera_ptz') && (
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
                          Angle ({selectedDevice.rotation}°)
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
                          Portée ({selectedDevice.range}m)
                        </label>
                        <input
                          type="range"
                          min="4"
                          max="35"
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

                      {selectedDevice.type !== 'camera_ptz' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            FOV ({selectedDevice.fovAngle}°)
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
                      )}
                    </div>
                  </>
                )}

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleRotateSelected(45)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pivoter 45°</span>
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center justify-center p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* If Room Selected */}
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
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer cette pièce</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Door Selected */}
            {selectedDoor && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Type d'Accès
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
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

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Orientation ({selectedDoor.angle}°)
                  </label>
                  <button
                    onClick={() => handleRotateSelected(90)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pivoter 90°</span>
                  </button>
                </div>

                <button
                  onClick={handleDeleteSelected}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer cette porte</span>
                </button>
              </div>
            )}

            {!selectedId && (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Sliders className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-xs">
                  Cliquez sur un équipement, portail, escalier ou mur pour modifier ses propriétés.
                </p>
                <p className="text-[11px] text-slate-400">
                  💡 Pour déplacer un élément : appuyez longuement (0.3s) puis faites-le glisser.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Live Camera POV Modal */}
      {activePovCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold text-xs uppercase tracking-wider text-rose-400">
                  DIRECT · SURVEILLANCE CCTV
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-xs font-semibold text-slate-200">
                  {activePovCamera.label}
                </span>
              </div>
              <button
                onClick={() => setSimulatedCameraId(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`relative aspect-video w-full overflow-hidden flex items-center justify-center transition-colors duration-300 ${
                simNightMode ? 'bg-slate-950 text-emerald-400' : 'bg-slate-900 text-white'
              }`}
            >
              <div className="absolute inset-4 pointer-events-none border border-white/15 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <Crosshair className="w-16 h-16" />
                </div>

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold drop-shadow">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px]">
                      ● REC
                    </span>
                    <span>{simTimestamp}</span>
                  </div>
                  <div>
                    <span>{activePovCamera.resolution}</span> · <span>30 FPS</span> · <span>H.265+</span>
                  </div>
                </div>

                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-32 h-44 border-2 border-emerald-400/80 bg-emerald-500/10 rounded flex flex-col justify-between p-1">
                  <span className="text-[9px] font-mono bg-emerald-950/80 text-emerald-300 px-1 py-0.5 rounded self-start font-bold">
                    DÉTECTION : VÉHICULE (98%)
                  </span>
                  <span className="text-[9px] font-mono text-emerald-300 self-end">
                    DIST : 8.2m
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold drop-shadow">
                  <span>CANAL 0{activePovCamera.channel || 1} · {activePovCamera.modelName}</span>
                  <span>ZOOM : {simDigitalZoom}x {simNightMode && '· MODE INFRAROUGE (IR)'}</span>
                </div>
              </div>

              <div
                className="text-center space-y-2 pointer-events-none select-none transition-transform duration-200"
                style={{ transform: `scale(${simDigitalZoom})` }}
              >
                <Video className={`w-16 h-16 mx-auto ${simNightMode ? 'text-emerald-500/40' : 'text-slate-600'}`} />
                <div className="text-xs font-mono text-slate-400">
                  Angle de vue : {activePovCamera.rotation}° | Portée IR : {activePovCamera.range}m
                </div>
                <div className="text-[11px] text-slate-500">
                  Flux vidéo haute fidélité simulé pour la Wilaya d'Oran
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSimNightMode((n) => !n)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    simNightMode
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {simNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{simNightMode ? 'Mode Jour' : 'Vision Nocturne IR'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Zoom Numérique :</span>
                {[1, 2, 4].map((z) => (
                  <button
                    key={z}
                    onClick={() => setSimDigitalZoom(z)}
                    className={`px-2.5 py-1 rounded-md font-mono font-bold cursor-pointer transition-colors ${
                      simDigitalZoom === z
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Câblage & Mappage des Champs Modal */}
      {isWiringModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{t.wiringModalTitle}</span>
                    <span className="text-[10px] bg-emerald-700 text-white font-mono px-2 py-0.5 rounded-full font-bold">
                      Décret 09-410
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-1">
                    {t.wiringModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWiringModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-3 gap-2 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveWiringTab('equipment')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeWiringTab === 'equipment'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Tableau Équipements Page 3 ({totalCams + Math.max(1, dvrCount)})
              </button>
              <button
                onClick={() => setActiveWiringTab('security')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeWiringTab === 'security'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Stockage DVR & Sécurité Page 3
              </button>
              <button
                onClick={() => setActiveWiringTab('site')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeWiringTab === 'site'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                3. Bâti & Périmètre ({plan.rooms.length} pièces, {gateCount} portails)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {(() => {
                const payload = getFullSyncPayload();
                return (
                  <>
                    {activeWiringTab === 'equipment' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                          <div>
                            <span className="font-bold">Tableau Page 3 : </span>
                            <span>Les caméras et l’enregistreur sont conformes au Décret 09-410 (Section ج Sous-section 01 : matériel sans IR, circuit fermé).</span>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px] shrink-0 font-mono">
                            {totalCams + payload.recorderQty} Équipements
                          </span>
                        </div>

                        {/* Cards for each wired field */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Caméras Intérieures (Dômes)</span>
                              <span className="font-mono font-bold text-xs bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded">
                                p3_indoor_cam_qty : {String(payload.indoorCamQty).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-cairo bg-white p-2 rounded border border-slate-200" dir="rtl">
                              {payload.indoorCamNature}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Actuel dans le Formulaire : <span className="font-mono font-semibold">{currentFormValues?.['p3_indoor_cam_qty'] || '00'}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Caméras Extérieures (Bullet / PTZ)</span>
                              <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                                p3_outdoor_cam_qty : {String(payload.outdoorCamQty).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-cairo bg-white p-2 rounded border border-slate-200" dir="rtl">
                              {payload.outdoorCamNature}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Actuel dans le Formulaire : <span className="font-mono font-semibold">{currentFormValues?.['p3_outdoor_cam_qty'] || '00'}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Enregistreur Numérique (DVR / NVR)</span>
                              <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                                p3_recorder_qty : {String(payload.recorderQty).padStart(2, '0')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 font-cairo bg-white p-2 rounded border border-slate-200" dir="rtl">
                              {payload.recorderNature}
                            </div>
                            <div className="text-[10px] text-slate-500 font-cairo" dir="rtl">
                              التعيين : {payload.recorderDesignation}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">Total Général des Équipements</span>
                              <span className="font-mono font-bold text-xs bg-slate-800 text-white px-2 py-0.5 rounded">
                                p3_total_qty : {String(payload.totalCamQty).padStart(2, '0')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Somme certifiée des caméras intérieures ({payload.indoorCamQty}) + caméras extérieures ({payload.outdoorCamQty}) + enregistreur ({payload.recorderQty}).
                            </p>
                            <div className="text-[10px] text-slate-500">
                              Actuel dans le Formulaire : <span className="font-mono font-semibold">{currentFormValues?.['p3_total_qty'] || '00'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeWiringTab === 'security' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Lieu de Stockage et d’Utilisation (Page 3)</span>
                            <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                              p3_storage_use_places
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Déduit de la pièce où est positionné l’icône DVR sur le plan 2D/3D.
                          </p>
                          <div className="text-xs font-cairo font-semibold text-slate-800 bg-white p-2.5 rounded border border-slate-200" dir="rtl">
                            {payload.storageUsePlaces}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Conditions de Mise en Sécurité en Lieu Sûr (Page 3)</span>
                            <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                              p3_security_conditions
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Garantit le respect des exigences DRAG Wilaya d’Oran (armoire métallique fermée, 30 jours de rétention, aucun raccordement Internet).
                          </p>
                          <div className="text-xs font-cairo font-semibold text-slate-800 bg-white p-2.5 rounded border border-slate-200" dir="rtl">
                            {payload.securityConditions}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeWiringTab === 'site' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-lg font-bold text-slate-900 font-mono">
                              {plan.rooms.reduce((acc, r) => acc + r.width * r.height, 0)} m²
                            </div>
                            <div className="text-[11px] text-slate-500">Surface totale bâti</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-lg font-bold text-slate-900 font-mono">
                              {plan.rooms.length}
                            </div>
                            <div className="text-[11px] text-slate-500">Pièces & Locaux</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-lg font-bold text-slate-900 font-mono">
                              {gateCount}
                            </div>
                            <div className="text-[11px] text-slate-500">Portails Véhicules</div>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                            <div className="text-lg font-bold text-emerald-700 font-mono">
                              {siteCoverageScore}%
                            </div>
                            <div className="text-[11px] text-slate-500">Couverture Accès</div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                          <span className="font-bold text-slate-900">Locaux répertoriés sur le plan :</span>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.rooms.map((r) => (
                              <span key={r.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] text-slate-700">
                                {r.name} ({r.width * r.height} m²)
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleImportEquipmentFromForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer shadow-xs"
                title="Créer automatiquement sur le plan le nombre de caméras configuré dans le formulaire"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.btnImportFromForm}</span>
              </button>

              <div className="flex items-center gap-2">
                {onJumpToWorkspacePage && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsWiringModalOpen(false);
                      onJumpToWorkspacePage(3);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Aller à la Page 3</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApplyWiringToForm}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{t.btnApplyWiring}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

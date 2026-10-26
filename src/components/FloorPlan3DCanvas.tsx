import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FloorPlanData, SecurityDeviceElement } from '../data/floorPlanSchema';
import { Eye, Sun, Moon, RotateCcw, Maximize2, ShieldAlert } from 'lucide-react';

interface FloorPlan3DCanvasProps {
  plan: FloorPlanData;
  activeDeviceId: string | null;
  onSelectDevice: (id: string | null) => void;
  isRtl?: boolean;
}

export const FloorPlan3DCanvas: React.FC<FloorPlan3DCanvasProps> = ({
  plan,
  activeDeviceId,
  onSelectDevice,
  isRtl = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [activePovCameraId, setActivePovCameraId] = useState<string | null>(null);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameId = useRef<number | null>(null);
  const orbitState = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 },
    target: new THREE.Vector3(plan.widthMeters / 2, 0, plan.heightMeters / 2),
  });

  const activePovCamera = plan.devices.find(
    (d) => d.id === activePovCameraId && (d.type === 'camera_bullet' || d.type === 'camera_dome')
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(nightMode ? 0x090d16 : 0xf1f5f9);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(
      nightMode ? 0x1e293b : 0xffffff,
      nightMode ? 0.4 : 0.8
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(
      nightMode ? 0x38bdf8 : 0xffffff,
      nightMode ? 0.35 : 1.2
    );
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // 5. Ground / Floor Grid
    const groundGeo = new THREE.PlaneGeometry(
      plan.widthMeters + 12,
      plan.heightMeters + 12
    );
    const groundMat = new THREE.MeshStandardMaterial({
      color: nightMode ? 0x0f172a : 0xe2e8f0,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(plan.widthMeters / 2, -0.05, plan.heightMeters / 2);
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(
      Math.max(plan.widthMeters, plan.heightMeters) * 1.5,
      Math.round(Math.max(plan.widthMeters, plan.heightMeters) * 1.5),
      nightMode ? 0x334155 : 0xc7d2fe,
      nightMode ? 0x1e293b : 0xe0e7ff
    );
    gridHelper.position.set(plan.widthMeters / 2, 0, plan.heightMeters / 2);
    scene.add(gridHelper);

    // 6. Rooms & Walls Construction
    plan.rooms.forEach((room) => {
      // Room Floor Slab
      const floorGeo = new THREE.BoxGeometry(room.width - 0.05, 0.1, room.height - 0.05);
      const floorMat = new THREE.MeshStandardMaterial({
        color: nightMode ? 0x1e293b : 0xf8fafc,
        roughness: 0.6,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.set(
        room.x + room.width / 2,
        0.05,
        room.y + room.height / 2
      );
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // Walls (4 walls around each room)
      const wallThickness = 0.22;
      const wallHeight = room.wallHeight || 2.8;
      const wallMat = new THREE.MeshStandardMaterial({
        color: nightMode ? 0x334155 : 0xdbeafe,
        roughness: 0.5,
      });

      // Top Wall
      const topWallGeo = new THREE.BoxGeometry(room.width, wallHeight, wallThickness);
      const topWall = new THREE.Mesh(topWallGeo, wallMat);
      topWall.position.set(room.x + room.width / 2, wallHeight / 2, room.y);
      topWall.castShadow = true;
      topWall.receiveShadow = true;
      scene.add(topWall);

      // Bottom Wall
      const botWallGeo = new THREE.BoxGeometry(room.width, wallHeight, wallThickness);
      const botWall = new THREE.Mesh(botWallGeo, wallMat);
      botWall.position.set(room.x + room.width / 2, wallHeight / 2, room.y + room.height);
      botWall.castShadow = true;
      botWall.receiveShadow = true;
      scene.add(botWall);

      // Left Wall
      const leftWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, room.height);
      const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
      leftWall.position.set(room.x, wallHeight / 2, room.y + room.height / 2);
      leftWall.castShadow = true;
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      // Right Wall
      const rightWallGeo = new THREE.BoxGeometry(wallThickness, wallHeight, room.height);
      const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
      rightWall.position.set(room.x + room.width, wallHeight / 2, room.y + room.height / 2);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      scene.add(rightWall);
    });

    // 7. Doors in 3D
    plan.doors.forEach((door) => {
      const doorHeight = 2.1;
      const doorMat = new THREE.MeshStandardMaterial({
        color: door.isEmergencyExit ? 0x16a34a : 0x78350f,
        roughness: 0.4,
      });
      const doorGeo = new THREE.BoxGeometry(door.width, doorHeight, 0.12);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(door.x, doorHeight / 2, door.y);
      doorMesh.rotation.y = (door.angle * Math.PI) / 180;
      doorMesh.castShadow = true;
      scene.add(doorMesh);

      // If Emergency exit, add glowing exit signage
      if (door.isEmergencyExit) {
        const signGeo = new THREE.BoxGeometry(0.6, 0.25, 0.08);
        const signMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const signMesh = new THREE.Mesh(signGeo, signMat);
        signMesh.position.set(door.x, doorHeight + 0.2, door.y);
        scene.add(signMesh);
      }
    });

    // 8. Windows in 3D
    plan.windows.forEach((win) => {
      const winHeight = 1.2;
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
      });
      const winGeo = new THREE.BoxGeometry(win.width, winHeight, 0.1);
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(win.x, 1.6, win.y);
      winMesh.rotation.y = (win.angle * Math.PI) / 180;
      scene.add(winMesh);
    });

    // 8b. Vehicle Gates in 3D (Portails)
    plan.gates?.forEach((gate) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(gate.x, 0, gate.y);
      gateGroup.rotation.y = (gate.angle * Math.PI) / 180;

      const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      const barMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });

      // Left and Right Posts
      const postGeo = new THREE.BoxGeometry(0.2, 2.4, 0.2);
      const postL = new THREE.Mesh(postGeo, postMat);
      postL.position.set(-gate.width / 2, 1.2, 0);
      postL.castShadow = true;
      gateGroup.add(postL);

      const postR = new THREE.Mesh(postGeo, postMat);
      postR.position.set(gate.width / 2, 1.2, 0);
      postR.castShadow = true;
      gateGroup.add(postR);

      // Horizontal Top & Bottom Frame
      const barGeo = new THREE.BoxGeometry(gate.width - 0.2, 0.08, 0.06);
      const barTop = new THREE.Mesh(barGeo, barMat);
      barTop.position.set(0, 2.1, 0);
      gateGroup.add(barTop);

      const barBot = new THREE.Mesh(barGeo, barMat);
      barBot.position.set(0, 0.3, 0);
      gateGroup.add(barBot);

      // Vertical Grille Bars
      const numBars = Math.floor(gate.width * 5);
      for (let i = 1; i < numBars; i++) {
        const vBarGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 8);
        const vBar = new THREE.Mesh(vBarGeo, barMat);
        const step = (gate.width - 0.4) / numBars;
        vBar.position.set(-gate.width / 2 + 0.2 + i * step, 1.2, 0);
        vBar.castShadow = true;
        gateGroup.add(vBar);
      }

      // Motor Box if motorized
      if (gate.isMotorized) {
        const motorGeo = new THREE.BoxGeometry(0.3, 0.4, 0.25);
        const motorMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
        const motor = new THREE.Mesh(motorGeo, motorMat);
        motor.position.set(gate.width / 2 + 0.2, 0.4, 0.1);
        gateGroup.add(motor);
      }

      scene.add(gateGroup);
    });

    // 8c. Stairs in 3D (Escaliers)
    plan.stairs?.forEach((stair) => {
      const stairGroup = new THREE.Group();
      stairGroup.position.set(stair.x, 0, stair.y);
      stairGroup.rotation.y = (stair.angle * Math.PI) / 180;

      const stepCount = stair.steps || 12;
      const totalHeight = 2.8;
      const stepHeight = totalHeight / stepCount;
      const stepLength = (stair.length || 2.8) / stepCount;

      const stepMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });

      for (let s = 0; s < stepCount; s++) {
        const h = (s + 1) * stepHeight;
        const boxGeo = new THREE.BoxGeometry(stair.width, h, stepLength);
        const stepMesh = new THREE.Mesh(boxGeo, stepMat);
        stepMesh.position.set(0, h / 2, -stair.length / 2 + (s + 0.5) * stepLength);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        stairGroup.add(stepMesh);
      }

      // Side Handrail
      const railMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
      const railGeo = new THREE.CylinderGeometry(0.03, 0.03, Math.hypot(stair.length, totalHeight), 8);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(stair.width / 2, totalHeight / 2 + 0.8, 0);
      rail.rotation.x = Math.atan2(stair.length, totalHeight);
      stairGroup.add(rail);

      scene.add(stairGroup);
    });

    // 9. Security Equipment in 3D (Cameras, DVR, Alarm, PTZ, Monitor, PIR)
    plan.devices.forEach((dev) => {
      const isSelected = dev.id === activeDeviceId;
      const deviceGroup = new THREE.Group();
      deviceGroup.position.set(dev.x, dev.z || 2.5, dev.y);
      deviceGroup.rotation.y = -(dev.rotation * Math.PI) / 180;

      if (dev.type === 'camera_bullet') {
        // Bullet Camera 3D Model
        // Base plate
        const baseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.rotation.x = Math.PI / 2;
        deviceGroup.add(baseMesh);

        // Arm
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
        const armMesh = new THREE.Mesh(armGeo, baseMat);
        armMesh.position.set(0, 0, 0.12);
        armMesh.rotation.x = Math.PI / 3;
        deviceGroup.add(armMesh);

        // Body cylinder
        const bodyGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.45, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x059669 : 0xffffff,
          roughness: 0.3,
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.position.set(0, 0, 0.32);
        bodyMesh.rotation.x = Math.PI / 2;
        bodyMesh.castShadow = true;
        deviceGroup.add(bodyMesh);

        // Black Lens Ring & Glass
        const lensGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const lensMesh = new THREE.Mesh(lensGeo, lensMat);
        lensMesh.position.set(0, 0, 0.55);
        lensMesh.rotation.x = Math.PI / 2;
        deviceGroup.add(lensMesh);

        // Status LED
        const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
        const ledMat = new THREE.MeshBasicMaterial({
          color: nightMode ? 0xef4444 : 0x10b981,
        });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.position.set(0.06, 0.08, 0.53);
        deviceGroup.add(ledMesh);

        // 3D Visual Vision Cone (FOV Frustum)
        const coneHeight = Math.min(dev.range || 10, 14);
        const coneRadius = coneHeight * Math.tan(((dev.fovAngle || 80) * Math.PI) / 360);
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 20, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x10b981 : 0x38bdf8,
          transparent: true,
          opacity: nightMode ? 0.28 : 0.15,
          side: THREE.DoubleSide,
          wireframe: false,
        });
        const coneMesh = new THREE.Mesh(coneGeo, coneMat);
        coneMesh.position.set(0, 0, coneHeight / 2 + 0.55);
        coneMesh.rotation.x = -Math.PI / 2;
        deviceGroup.add(coneMesh);
      } else if (dev.type === 'camera_dome') {
        // Dome Camera 3D Model
        const mountGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20);
        const mountMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x059669 : 0xffffff,
        });
        const mountMesh = new THREE.Mesh(mountGeo, mountMat);
        deviceGroup.add(mountMesh);

        const domeGeo = new THREE.SphereGeometry(
          0.18,
          20,
          16,
          0,
          Math.PI * 2,
          0,
          Math.PI / 2
        );
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.1,
          metalness: 0.6,
        });
        const domeMesh = new THREE.Mesh(domeGeo, domeMat);
        domeMesh.position.set(0, -0.02, 0);
        domeMesh.rotation.x = Math.PI;
        deviceGroup.add(domeMesh);

        // Dome Vision Cone
        const coneHeight = Math.min(dev.range || 8, 10);
        const coneRadius = coneHeight * Math.tan(((dev.fovAngle || 100) * Math.PI) / 360);
        const coneGeo = new THREE.ConeGeometry(coneRadius, coneHeight, 20, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x10b981 : 0x06b6d4,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
        });
        const coneMesh = new THREE.Mesh(coneGeo, coneMat);
        coneMesh.position.set(0, -coneHeight / 2, 0);
        coneMesh.rotation.x = Math.PI;
        deviceGroup.add(coneMesh);
      } else if (dev.type === 'dvr') {
        // DVR / NVR Console Box
        const dvrGeo = new THREE.BoxGeometry(0.8, 0.25, 0.55);
        const dvrMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x047857 : 0x0f172a,
          roughness: 0.2,
          metalness: 0.8,
        });
        const dvrMesh = new THREE.Mesh(dvrGeo, dvrMat);
        dvrMesh.castShadow = true;
        deviceGroup.add(dvrMesh);

        // Blinking REC LED
        const ledGeo = new THREE.BoxGeometry(0.05, 0.03, 0.02);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const ledMesh = new THREE.Mesh(ledGeo, ledMat);
        ledMesh.position.set(0.3, 0.05, 0.28);
        deviceGroup.add(ledMesh);
      } else if (dev.type === 'alarm_siren') {
        // Alarm Siren
        const sirenGeo = new THREE.BoxGeometry(0.35, 0.45, 0.22);
        const sirenMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const sirenMesh = new THREE.Mesh(sirenGeo, sirenMat);
        deviceGroup.add(sirenMesh);

        // Red Strobe Beacon
        const beaconGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.set(0, 0.12, 0.12);
        deviceGroup.add(beaconMesh);
      } else if (dev.type === 'camera_ptz') {
        // PTZ 360 Camera
        const ptzBaseGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 16);
        const ptzBaseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
        const ptzBase = new THREE.Mesh(ptzBaseGeo, ptzBaseMat);
        deviceGroup.add(ptzBase);

        const ptzSphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
        const ptzSphereMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
        const ptzSphere = new THREE.Mesh(ptzSphereGeo, ptzSphereMat);
        ptzSphere.position.set(0, -0.15, 0);
        deviceGroup.add(ptzSphere);

        // 360 Panoramic Vision Frustum (Ring/Disc)
        const fovDiscGeo = new THREE.CylinderGeometry(Math.min(dev.range || 15, 18), Math.min(dev.range || 15, 18), 0.05, 32);
        const fovDiscMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x10b981 : 0xa855f7,
          transparent: true,
          opacity: 0.15,
        });
        const fovDisc = new THREE.Mesh(fovDiscGeo, fovDiscMat);
        fovDisc.position.set(0, -(dev.z || 3), 0);
        deviceGroup.add(fovDisc);
      } else if (dev.type === 'monitor_screen') {
        // Security Display Monitor (Flat Screen)
        const screenFrameGeo = new THREE.BoxGeometry(0.9, 0.55, 0.06);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const frameMesh = new THREE.Mesh(screenFrameGeo, frameMat);
        deviceGroup.add(frameMesh);

        const displayGeo = new THREE.PlaneGeometry(0.84, 0.5);
        const displayMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const displayMesh = new THREE.Mesh(displayGeo, displayMat);
        displayMesh.position.set(0, 0, 0.035);
        deviceGroup.add(displayMesh);
      } else if (dev.type === 'pir_sensor') {
        // PIR Motion Sensor
        const pirGeo = new THREE.BoxGeometry(0.18, 0.28, 0.12);
        const pirMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
        const pirMesh = new THREE.Mesh(pirGeo, pirMat);
        deviceGroup.add(pirMesh);

        const lensGeo = new THREE.SphereGeometry(0.06, 8, 8, 0, Math.PI);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const lensMesh = new THREE.Mesh(lensGeo, lensMat);
        lensMesh.position.set(0, -0.04, 0.06);
        deviceGroup.add(lensMesh);
      }

      scene.add(deviceGroup);
    });

    // 10. Update Camera Matrix & Render Loop
    const updateCameraPosition = () => {
      if (activePovCamera) {
        // Point of View of the active camera
        camera.position.set(
          activePovCamera.x,
          activePovCamera.z || 2.5,
          activePovCamera.y
        );
        const angleRad = -(activePovCamera.rotation * Math.PI) / 180;
        const targetX = activePovCamera.x + Math.sin(angleRad) * 8;
        const targetZ = activePovCamera.y + Math.cos(angleRad) * 8;
        camera.lookAt(targetX, (activePovCamera.z || 2.5) - 0.8, targetZ);
      } else {
        // Orbit overview position
        const { spherical, target } = orbitState.current;
        const x =
          target.x +
          spherical.radius *
            Math.sin(spherical.phi) *
            Math.sin(spherical.theta);
        const y = target.y + spherical.radius * Math.cos(spherical.phi);
        const z =
          target.z +
          spherical.radius *
            Math.sin(spherical.phi) *
            Math.cos(spherical.theta);
        camera.position.set(x, y, z);
        camera.lookAt(target);
      }
    };

    updateCameraPosition();

    const render = () => {
      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(render);
    };
    render();

    // 11. Mouse & Touch Controls
    const handleMouseDown = (e: MouseEvent) => {
      if (activePovCameraId) return; // In POV mode, locked to camera angle
      orbitState.current.isDragging = true;
      orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!orbitState.current.isDragging || activePovCameraId) return;
      const deltaX = e.clientX - orbitState.current.previousMousePosition.x;
      const deltaY = e.clientY - orbitState.current.previousMousePosition.y;

      orbitState.current.spherical.theta -= deltaX * 0.007;
      orbitState.current.spherical.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2.05, orbitState.current.spherical.phi - deltaY * 0.007)
      );

      orbitState.current.previousMousePosition = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      orbitState.current.isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (activePovCameraId) return;
      orbitState.current.spherical.radius = Math.max(
        6,
        Math.min(50, orbitState.current.spherical.radius + e.deltaY * 0.02)
      );
      updateCameraPosition();
    };

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('wheel', handleWheel);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [plan, activeDeviceId, nightMode, activePovCameraId]);

  const handleResetCamera = () => {
    setActivePovCameraId(null);
    orbitState.current.spherical = {
      radius: 24,
      theta: Math.PI / 4,
      phi: Math.PI / 3,
    };
    orbitState.current.target = new THREE.Vector3(
      plan.widthMeters / 2,
      0,
      plan.heightMeters / 2
    );
  };

  const cameraDevices = plan.devices.filter(
    (d) => d.type === 'camera_bullet' || d.type === 'camera_dome'
  );

  return (
    <div className="relative w-full h-full min-h-[480px] bg-slate-900 rounded-xl overflow-hidden shadow-inner flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Control Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode Indicators & Camera POV Selector */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-white shadow-lg">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Vue 3D Isométrique & Bâti
          </span>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* POV Selector */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={activePovCameraId || ''}
              onChange={(e) => setActivePovCameraId(e.target.value || null)}
              className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Vue Globale (Survol 3D)</option>
              {cameraDevices.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  POV: {cam.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Night Mode & Reset Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/80 px-2 py-1.5 rounded-lg text-xs text-white shadow-lg">
          <button
            onClick={() => setNightMode((n) => !n)}
            title={nightMode ? 'Activer Mode Jour' : 'Activer Vision Nocturne IR (Infrarouge)'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              nightMode
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            {nightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {nightMode ? 'Nocturne (IR)' : 'Mode Jour'}
            </span>
          </button>

          <button
            onClick={handleResetCamera}
            title="Recentrer la vue 3D"
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Legend Overlay in 3D */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] text-slate-300">
        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-700/60 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Cam Bullet (Ext)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Cam Dôme (Int)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-950 border border-emerald-500" />
            <span>DVR / Baie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Alarme & Sirène</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-md border border-slate-700/60 hidden md:block">
          💡 Clic gauche + glisser pour pivoter · Molette pour zoomer
        </div>
      </div>
    </div>
  );
};

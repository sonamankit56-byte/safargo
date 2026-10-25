import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sun, Moon, Zap, Shield, Sparkles, Navigation } from 'lucide-react';

export const Bus3DHero: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isNightMode, setIsNightMode] = useState(true);
  const [speed, setSpeed] = useState<'normal' | 'turbo'>('normal');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const busGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const roadStripesRef = useRef<THREE.Mesh[]>([]);
  const headlightBeamLeftRef = useRef<THREE.SpotLight | null>(null);
  const headlightBeamRightRef = useRef<THREE.SpotLight | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x080e1e : 0xe0e7ff);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x080e1e : 0xe0e7ff, 0.025);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(9, 4, 11);
    camera.lookAt(0, 0.8, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isNightMode ? 0.6 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, isNightMode ? 1.0 : 2.0);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // 5. Road / Highway
    const roadWidth = 8;
    const roadLength = 50;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.85,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.01;
    road.receiveShadow = true;
    scene.add(road);

    // Moving Road Stripes
    const stripes: THREE.Mesh[] = [];
    const stripeGeo = new THREE.PlaneGeometry(0.2, 2.5);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    for (let i = -roadLength / 2; i < roadLength / 2; i += 5) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, i);
      scene.add(stripe);
      stripes.push(stripe);
    }
    roadStripesRef.current = stripes;

    // 6. VOLVO 9600 3D BUS MODEL
    const busGroup = new THREE.Group();
    busGroupRef.current = busGroup;

    // Main Bus Body
    const bodyLength = 7.6;
    const bodyHeight = 2.3;
    const bodyWidth = 2.4;
    const bodyGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xE11D48, // SafarGo Crimson Red
      metalness: 0.6,
      roughness: 0.25
    });
    const busBody = new THREE.Mesh(bodyGeo, bodyMat);
    busBody.position.y = 1.45;
    busBody.castShadow = true;
    busBody.receiveShadow = true;
    busGroup.add(busBody);

    // Top Aero Cap (Navy Blue luxury accent)
    const roofGeo = new THREE.BoxGeometry(bodyWidth * 0.96, 0.4, bodyLength * 0.98);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0B194C, // SafarGo Royal Navy
      metalness: 0.5,
      roughness: 0.3
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 2.7, 0);
    roof.castShadow = true;
    busGroup.add(roof);

    // Front Windshield (Aerodynamic Sloped Glass)
    const frontWindshieldGeo = new THREE.PlaneGeometry(bodyWidth * 0.92, 1.2);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.6
    });
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
    frontWindshield.position.set(0, 1.75, bodyLength / 2 + 0.02);
    busGroup.add(frontWindshield);

    // Side Windows (Upper Deck + Lower Deck Sleeper panoramic glass)
    const sideWindowGeo = new THREE.BoxGeometry(bodyWidth + 0.05, 0.7, bodyLength * 0.82);
    const sideWindowsUpper = new THREE.Mesh(sideWindowGeo, glassMat);
    sideWindowsUpper.position.set(0, 2.05, -0.1);
    busGroup.add(sideWindowsUpper);

    const sideWindowsLower = new THREE.Mesh(sideWindowGeo, glassMat);
    sideWindowsLower.position.set(0, 1.25, -0.1);
    busGroup.add(sideWindowsLower);

    // Front Destination LED Board ("SAFARGO PRIMO LUXURY")
    const ledBoardGeo = new THREE.PlaneGeometry(1.6, 0.3);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ledBoard = new THREE.Mesh(ledBoardGeo, ledMat);
    ledBoard.position.set(0, 2.45, bodyLength / 2 + 0.03);
    busGroup.add(ledBoard);

    // Front Headlights
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlightGeo = new THREE.BoxGeometry(0.35, 0.18, 0.1);

    const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
    hlLeft.position.set(-0.85, 0.75, bodyLength / 2 + 0.02);
    busGroup.add(hlLeft);

    const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
    hlRight.position.set(0.85, 0.75, bodyLength / 2 + 0.02);
    busGroup.add(hlRight);

    // Front Headlight Beams (Spotlights on the road)
    const beamL = new THREE.SpotLight(0xfffbeb, 4, 15, Math.PI / 6, 0.4, 1.2);
    beamL.position.set(-0.85, 0.75, bodyLength / 2);
    beamL.target.position.set(-0.85, 0, bodyLength / 2 + 10);
    scene.add(beamL);
    scene.add(beamL.target);
    headlightBeamLeftRef.current = beamL;

    const beamR = new THREE.SpotLight(0xfffbeb, 4, 15, Math.PI / 6, 0.4, 1.2);
    beamR.position.set(0.85, 0.75, bodyLength / 2);
    beamR.target.position.set(0.85, 0, bodyLength / 2 + 10);
    scene.add(beamR);
    scene.add(beamR.target);
    headlightBeamRightRef.current = beamR;

    // Rear Taillights (Red LED strips)
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailLightGeo = new THREE.BoxGeometry(0.4, 0.12, 0.08);

    const tlLeft = new THREE.Mesh(tailLightGeo, tailLightMat);
    tlLeft.position.set(-0.9, 0.8, -bodyLength / 2 - 0.02);
    busGroup.add(tlLeft);

    const tlRight = new THREE.Mesh(tailLightGeo, tailLightMat);
    tlRight.position.set(0.9, 0.8, -bodyLength / 2 - 0.02);
    busGroup.add(tlRight);

    // Multi-Axle Wheels (6 wheels: 2 Front + 4 Rear for Volvo 9600)
    const wheels: THREE.Mesh[] = [];
    const wheelRadius = 0.48;
    const wheelThickness = 0.32;
    const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.2 });

    const wheelPositions = [
      [-bodyWidth / 2 - 0.05, wheelRadius, 2.4],   // Front Left
      [bodyWidth / 2 + 0.05, wheelRadius, 2.4],    // Front Right
      [-bodyWidth / 2 - 0.05, wheelRadius, -1.8],  // Rear Mid Left
      [bodyWidth / 2 + 0.05, wheelRadius, -1.8],   // Rear Mid Right
      [-bodyWidth / 2 - 0.05, wheelRadius, -2.8],  // Rear Back Left
      [bodyWidth / 2 + 0.05, wheelRadius, -2.8],   // Rear Back Right
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelMesh = new THREE.Mesh(wheelGeo, tyreMat);
      wheelMesh.rotation.z = Math.PI / 2;
      wheelMesh.position.set(x, y, z);
      wheelMesh.castShadow = true;

      // Chrome Rim
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelThickness + 0.02, 16),
        rimMat
      );
      wheelMesh.add(rim);

      busGroup.add(wheelMesh);
      wheels.push(wheelMesh);
    });
    wheelsRef.current = wheels;

    scene.add(busGroup);

    // 7. Interactive Mouse / Touch Orbit Dragging
    let isDragging = false;
    let previousMouseX = 0;
    let rotationVelocity = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      if (busGroupRef.current) {
        busGroupRef.current.rotation.y += deltaX * 0.01;
        rotationVelocity = deltaX * 0.005;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMouseX;
      previousMouseX = e.touches[0].clientX;
      if (busGroupRef.current) {
        busGroupRef.current.rotation.y += deltaX * 0.01;
        rotationVelocity = deltaX * 0.005;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 8. Animation Loop
    let animationFrameId: number;
    const currentSpeedVal = speed === 'turbo' ? 0.35 : 0.18;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Move road stripes for highway motion
      stripes.forEach(s => {
        s.position.z += currentSpeedVal;
        if (s.position.z > roadLength / 2) {
          s.position.z -= roadLength;
        }
      });

      // Spin wheels
      wheels.forEach(w => {
        w.rotation.x += currentSpeedVal * 1.5;
      });

      // Gentle floating suspension bounce
      if (busGroupRef.current) {
        busGroup.position.y = Math.sin(Date.now() * 0.008) * 0.025;

        // Auto rotate if not dragged
        if (!isDragging) {
          if (isRotating) {
            busGroup.rotation.y += 0.004;
          } else if (Math.abs(rotationVelocity) > 0.0001) {
            busGroup.rotation.y += rotationVelocity;
            rotationVelocity *= 0.95;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isNightMode, speed]);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 shadow-2xl border border-slate-800">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge Strip */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white text-xs font-black shadow-lg flex items-center gap-1.5 border border-rose-500/40">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
          <span>3D वोल्वो 9600 मल्टी-एक्सल</span>
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>SafarGo Primo Certified</span>
        </span>
      </div>

      {/* Bottom Floating Interactive 3D Controls */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
          {/* Rotate Toggle */}
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isRotating ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
            title="360° ऑटो-रोटेशन चालू/बंद"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>{isRotating ? '360° रोटेटिंग' : 'स्थिर'}</span>
          </button>

          {/* Day / Night Mode */}
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={isNightMode ? 'दिन का दृश्य (Day Mode)' : 'रात का दृश्य (Night Mode)'}
          >
            {isNightMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          </button>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => setSpeed(speed === 'normal' ? 'turbo' : 'normal')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              speed === 'turbo' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="हाईवे क्रूज स्पीड"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{speed === 'turbo' ? 'टर्बो 100km/h' : 'क्रूज 80km/h'}</span>
          </button>
        </div>

        {/* Milestone Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-white text-xs font-bold">
          <Navigation className="w-3.5 h-3.5 text-rose-500" />
          <span>भोपाल ➔ इंदौर ➔ उज्जैन हाईवे</span>
        </div>
      </div>
    </div>
  );
};

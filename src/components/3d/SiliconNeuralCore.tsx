import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

interface SiliconNeuralCoreProps {
  interactive?: boolean;
  className?: string;
}

export const SiliconNeuralCore: React.FC<SiliconNeuralCoreProps> = ({
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isDarkMode } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for all core elements
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Color definitions based on theme
    const primaryAccent = new THREE.Color(0xc8102e); // Snapdragon Crimson
    const secondaryColor = isDarkMode ? new THREE.Color(0xf2efe9) : new THREE.Color(0x1a1918);
    const ambientWireColor = isDarkMode ? new THREE.Color(0x383531) : new THREE.Color(0xd1ccc4);

    // 1. Central Hexagonal Silicon Core
    const hexRadius = 1.6;
    const hexHeight = 0.5;
    const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, hexHeight, 6, 1);
    
    const hexMaterial = new THREE.MeshStandardMaterial({
      color: isDarkMode ? 0x181716 : 0xf4f1ea,
      roughness: 0.35,
      metalness: 0.85,
      flatShading: true,
    });
    const hexCore = new THREE.Mesh(hexGeometry, hexMaterial);
    hexCore.rotation.x = Math.PI / 4;
    mainGroup.add(hexCore);

    // Hexagon wireframe overlay
    const wireGeo = new THREE.EdgesGeometry(hexGeometry);
    const wireMat = new THREE.LineBasicMaterial({
      color: primaryAccent,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const hexWire = new THREE.LineSegments(wireGeo, wireMat);
    hexCore.add(hexWire);

    // 2. Concentric Wave Rings (representing 30-sec audio chunks and 45 TOPS tensor pipelines)
    const ringsGroup = new THREE.Group();
    mainGroup.add(ringsGroup);

    const numRings = 4;
    const ringMeshes: THREE.Line[] = [];

    for (let r = 0; r < numRings; r++) {
      const ringRadius = 2.4 + r * 0.75;
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * ringRadius, Math.sin(theta) * ringRadius, 0));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: r % 2 === 0 ? primaryAccent : ambientWireColor,
        transparent: true,
        opacity: 0.35 + r * 0.12,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3 + (r * 0.15);
      ring.rotation.y = (r * Math.PI) / 6;
      ringsGroup.add(ring);
      ringMeshes.push(ring);
    }

    // 3. Neural Synapse / Tensor Nodes (floating points around the core)
    const particleCount = 72;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOriginals = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + Math.random() * 1.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleOriginals[i * 3] = x;
      particleOriginals[i * 3 + 1] = y;
      particleOriginals[i * 3 + 2] = z;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: primaryAccent,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const particleCloud = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particleCloud);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.7 : 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xc8102e, 2.5, 15);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(isDarkMode ? 0xffffff : 0x888888, 1.2, 10);
    backLight.position.set(-4, -3, -4);
    scene.add(backLight);

    // Interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;

      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        mainGroup.rotation.y += deltaX * 0.01;
        mainGroup.rotation.x += deltaY * 0.01;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
      } else {
        targetX = x * 1.2;
        targetY = y * 1.2;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Idle Rotation
      if (!isDragging) {
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = time * 0.25 + mouseX * 0.8;
        mainGroup.rotation.x = Math.sin(time * 0.2) * 0.15 + mouseY * 0.8;
      }

      // Wave Rings pulsing
      ringMeshes.forEach((ring, idx) => {
        ring.rotation.z = time * (0.15 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
        const scaleWave = 1 + Math.sin(time * 2 + idx) * 0.035;
        ring.scale.set(scaleWave, scaleWave, scaleWave);
      });

      // Neural Synapses breathing
      const posArray = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const ox = particleOriginals[i * 3];
        const oy = particleOriginals[i * 3 + 1];
        const oz = particleOriginals[i * 3 + 2];

        const pulse = 1 + Math.sin(time * 3 + i) * 0.06;
        posArray[i * 3] = ox * pulse;
        posArray[i * 3 + 1] = oy * pulse;
        posArray[i * 3 + 2] = oz * pulse;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      hexGeometry.dispose();
      hexMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [isDarkMode, interactive]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
      title="Interactive 3D Snapdragon® Hexagon™ Silicon Core (Click & Drag to rotate)"
    >
      {/* Subtle floating telemetry tag */}
      <div className="absolute bottom-2 left-2 z-10 pointer-events-none text-[10px] font-mono-code text-[#666666] dark:text-[#99958F] bg-white/70 dark:bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded border border-[#E5E0D8]/60 dark:border-[#2A2825]/60 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-ping" />
        <span>Qualcomm® Hexagon™ 45 TOPS Visualizer</span>
      </div>
    </div>
  );
};

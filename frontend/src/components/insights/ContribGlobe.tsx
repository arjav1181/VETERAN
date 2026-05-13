import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface CommitLocation {
  lat: number;
  lng: number;
  count: number;
}

interface ContribGlobeProps {
  locations?: CommitLocation[];
  className?: string;
}

const SAMPLE_LOCATIONS: CommitLocation[] = [
  { lat: 40.7128, lng: -74.006, count: 150 },
  { lat: 37.7749, lng: -122.4194, count: 200 },
  { lat: 51.5074, lng: -0.1278, count: 120 },
  { lat: 48.8566, lng: 2.3522, count: 80 },
  { lat: 35.6762, lng: 139.6503, count: 90 },
  { lat: 31.2304, lng: 121.4737, count: 60 },
  { lat: 52.52, lng: 13.405, count: 70 },
  { lat: 55.7558, lng: 37.6173, count: 45 },
  { lat: 37.5665, lng: 126.978, count: 55 },
  { lat: 19.076, lng: 72.8777, count: 40 },
];

export function ContribGlobe({ locations = SAMPLE_LOCATIONS, className }: ContribGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.min(400, width * 0.6);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d')!;
    ctx.fillStyle = '#13161E';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.strokeStyle = '#21262D';
    ctx.lineWidth = 1;
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (90 - lat) / 180 * 512;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng + 180) / 360 * 1024;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(textureCanvas);

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0x58a6ff,
      emissive: 0x0a0c10,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    const glowGeometry = new THREE.SphereGeometry(2.05, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x58a6ff,
      transparent: true,
      opacity: 0.1,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);

    const pointLight = new THREE.PointLight(0x58a6ff, 1, 20);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const markerGroup = new THREE.Group();
    locations.forEach(loc => {
      const phi = (90 - loc.lat) * Math.PI / 180;
      const theta = (loc.lng + 180) * Math.PI / 180;
      const x = -2 * Math.sin(phi) * Math.cos(theta);
      const y = 2 * Math.cos(phi);
      const z = 2 * Math.sin(phi) * Math.sin(theta);

      const size = Math.min(0.15, Math.max(0.05, loc.count / 2000));
      const markerGeometry = new THREE.SphereGeometry(size, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xe8b84b });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      markerGroup.add(marker);

      const ringGeometry = new THREE.RingGeometry(size, size * 2, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xe8b84b, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0);
      markerGroup.add(ring);
    });
    scene.add(markerGroup);

    camera.position.z = 5;

    let angle = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      angle += 0.002;
      globe.rotation.y = angle;
      glow.rotation.y = angle;
      markerGroup.rotation.y = angle;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = Math.min(400, w * 0.6);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [locations]);

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="px-4 py-2 bg-surface border-b border-border">
        <h3 className="text-sm font-medium text-text-primary">Global Contributions</h3>
      </div>
      <div ref={containerRef} className="flex items-center justify-center" style={{ minHeight: '300px' }} />
    </div>
  );
}

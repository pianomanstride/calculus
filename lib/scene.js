import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Erzeugt die geteilte Three.js-Bühne. Level legen ihre Objekte in stage.levelGroup,
// die beim Levelwechsel komplett entsorgt wird.
export function createScene(host) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1220);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
  camera.position.set(0, 4, 14);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(6, 10, 8);
  scene.add(dirLight);

  const levelGroup = new THREE.Group();
  scene.add(levelGroup);

  const tickers = new Set();

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  new ResizeObserver(resize).observe(host);
  resize();

  renderer.setAnimationLoop(() => {
    controls.update();
    tickers.forEach((fn) => fn());
    renderer.render(scene, camera);
  });

  function clearLevel() {
    tickers.clear();
    levelGroup.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    levelGroup.clear();
  }

  function resetCamera([px, py, pz], [tx, ty, tz]) {
    camera.position.set(px, py, pz);
    controls.target.set(tx, ty, tz);
    controls.update();
  }

  return {
    scene,
    camera,
    controls,
    levelGroup,
    clearLevel,
    resetCamera,
    onTick(fn) {
      tickers.add(fn);
      return () => tickers.delete(fn);
    },
  };
}

// ---------- Wiederverwendbare 3D-Bausteine ----------

// Text als Sprite (immer zur Kamera gedreht, immer sichtbar).
export function makeLabel(text, { color = '#e2e8f0', fontSize = 56, scale = 0.6 } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `bold ${fontSize}px "Avenir Next", "Segoe UI", sans-serif`;
  ctx.font = font;
  const pad = 18;
  canvas.width = Math.ceil(ctx.measureText(text).width) + pad * 2;
  canvas.height = fontSize + pad * 2;
  ctx.font = font; // canvas-Resize setzt den Kontext zurück
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  );
  sprite.scale.set(scale * (canvas.width / canvas.height), scale, 1);
  return sprite;
}

// Dicke "Linie" als Zylinder zwischen zwei Punkten — per updateCylinder verschiebbar.
export function cylinderBetween(p1, p2, radius, color) {
  const geo = new THREE.CylinderGeometry(radius, radius, 1, 12);
  geo.translate(0, 0.5, 0); // Fußpunkt als Pivot, Länge über scale.y
  const mesh = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ color, roughness: 0.35 })
  );
  updateCylinder(mesh, p1, p2);
  return mesh;
}

export function updateCylinder(mesh, p1, p2) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const len = Math.max(dir.length(), 1e-6);
  mesh.position.copy(p1);
  mesh.scale.set(1, len, 1);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
}

// Kurve als Röhre (sichtbar dicker als THREE.Line).
export function tubeFromPoints(points, radius, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, Math.max(64, points.length * 2), radius, 10, false);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
}

// Koordinatenachsen mit Pfeilspitzen und Beschriftung.
export function addAxes(group, { x = 6, y = 6, z = 0, xLabel = 'x', yLabel = 'f(x)', zLabel = 'z' } = {}) {
  const axes = [
    { dir: new THREE.Vector3(1, 0, 0), len: x, label: xLabel },
    { dir: new THREE.Vector3(0, 1, 0), len: y, label: yLabel },
    { dir: new THREE.Vector3(0, 0, 1), len: z, label: zLabel },
  ];
  for (const { dir, len, label } of axes) {
    if (!len) continue;
    group.add(new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), len, 0x94a3b8, 0.35, 0.18));
    const l = makeLabel(label, { color: '#94a3b8', scale: 0.5 });
    l.position.copy(dir.clone().multiplyScalar(len + 0.45));
    group.add(l);
  }
}

// Kariertes "Millimeterpapier" in der x/y-Ebene (für 2D-Kurven im Raum).
export function addGridXY(group, size = 12, divisions = 12) {
  const grid = new THREE.GridHelper(size, divisions, 0x334155, 0x1e293b);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = -0.06;
  group.add(grid);
}

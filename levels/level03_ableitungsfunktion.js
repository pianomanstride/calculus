import * as THREE from 'three';
import { sampleCurve } from '../lib/math.js';
import {
  makeLabel,
  cylinderBetween,
  updateCylinder,
  tubeFromPoints,
  addAxes,
  addGridXY,
} from '../lib/scene.js';
import { renderMath, makeSlider } from '../lib/ui.js';
import { t } from '../lib/i18n.js';

const f = (x) => (x * x * x) / 12 - x + 2;
const fp = (x) => (x * x) / 4 - 1; // exakte Ableitung
const X_MIN = -5;
const X_MAX = 5;
const STEP = 0.1;
const BINS = Math.round((X_MAX - X_MIN) / STEP) + 1;
const NEED = Math.ceil(BINS * 0.95);

export default {
  num: 3,
  title: 'Die Ableitungs-Funktion',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([0, 3, 15], [0, 1.5, 0]);

    addGridXY(g, 12, 12);
    addAxes(g, { x: 6, y: 6 });

    const pts = sampleCurve(f, X_MIN, X_MAX, 200).map(([x, y]) => new THREE.Vector3(x, y, 0));
    g.add(tubeFromPoints(pts, 0.07, 0x60a5fa));

    // Wanderpunkt P auf f mit Tangente
    const P = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 })
    );
    const pLabel = makeLabel('P', { color: '#93c5fd', scale: 0.55 });
    pLabel.position.set(0, 0.55, 0);
    P.add(pLabel);
    g.add(P);

    const tangent = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.04, 0x22c55e);
    g.add(tangent);

    // Spur-Punkte der Ableitung: ein kleiner Marker pro x-Bin, anfangs unsichtbar
    const trailGeo = new THREE.SphereGeometry(0.07, 10, 8);
    const trailMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const trail = [];
    for (let i = 0; i < BINS; i++) {
      const x = X_MIN + i * STEP;
      const dot = new THREE.Mesh(trailGeo, trailMat);
      dot.position.set(x, fp(x), 0);
      dot.visible = false;
      g.add(dot);
      trail.push(dot);
    }
    const visited = new Set();

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv3.info');
    renderMath(document.getElementById('lv3-fp-sym'), "f'(x)");
    renderMath(document.getElementById('lv3-fx'), 'f(x) = \\tfrac{x^3}{12} - x + 2');

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const slopeReadout = document.createElement('div');
    const progReadout = document.createElement('div');
    readoutWrap.append(slopeReadout, progReadout);

    const state = { x: 0 };
    const sX = makeSlider({
      label: t('lv3.slider'),
      min: X_MIN,
      max: X_MAX,
      step: STEP,
      value: state.x,
      onInput: (v) => {
        state.x = v;
        update();
      },
    });
    ui.controls.append(sX.root, readoutWrap);

    ui.mission.innerHTML = t('lv3.mission');

    let done = false;
    function update() {
      const { x } = state;
      const Pp = new THREE.Vector3(x, f(x), 0);
      P.position.copy(Pp);

      const m = fp(x);
      const tDir = new THREE.Vector3(1, m, 0).normalize();
      updateCylinder(
        tangent,
        Pp.clone().addScaledVector(tDir, -1.6),
        Pp.clone().addScaledVector(tDir, 1.6)
      );

      const bin = Math.round((x - X_MIN) / STEP);
      if (bin >= 0 && bin < BINS && !visited.has(bin)) {
        visited.add(bin);
        trail[bin].visible = true;
      }

      renderMath(slopeReadout, `f'(${x.toFixed(1)}) = ${m.toFixed(2)}`, true);
      const pct = Math.round((visited.size / BINS) * 100);
      progReadout.textContent = t('lv3.coverage', { pct });

      if (!done && visited.size >= NEED) {
        done = true;
        // komplette Ableitung als glatte Kurve enthüllen
        const fpPts = sampleCurve(fp, X_MIN, X_MAX, 200).map(([px, py]) => new THREE.Vector3(px, py, 0));
        g.add(tubeFromPoints(fpPts, 0.06, 0xf59e0b));
        renderMath(document.getElementById('lv3-reveal'), "f'(x) = \\tfrac{x^2}{4} - 1", true);
        complete(t('lv3.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv3.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

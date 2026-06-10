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

const f = (x) => (x * x) / 5;
const X_MIN = -5;
const X_MAX = 5;
const TARGET = 1.2;
const TOL = 0.05;

export default {
  num: 1,
  title: 'Steigung erleben',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([0, 4, 14], [0, 2.5, 0]);

    addGridXY(g, 12, 12);
    addAxes(g, { x: 6, y: 6 });

    const pts = sampleCurve(f, X_MIN, X_MAX, 160).map(([x, y]) => new THREE.Vector3(x, y, 0));
    g.add(tubeFromPoints(pts, 0.07, 0x60a5fa));

    const mkPoint = (color, label, labelColor) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 24, 16),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
      );
      const l = makeLabel(label, { color: labelColor, scale: 0.55 });
      l.position.set(0, 0.55, 0);
      m.add(l);
      g.add(m);
      return m;
    };
    const A = mkPoint(0x2563eb, 'A', '#93c5fd');
    const B = mkPoint(0xf59e0b, 'B', '#fcd34d');

    const secant = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.04, 0xe2e8f0);
    const dxLine = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0.03, 0x2563eb);
    const dyLine = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.03, 0xf59e0b);
    g.add(secant, dxLine, dyLine);

    const dxLabel = makeLabel('Δx', { color: '#93c5fd', scale: 0.5 });
    const dyLabel = makeLabel('Δy', { color: '#fcd34d', scale: 0.5 });
    g.add(dxLabel, dyLabel);

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv1.info');
    renderMath(
      document.getElementById('lv1-formula'),
      'm = \\frac{\\Delta y}{\\Delta x} = \\frac{f(b) - f(a)}{b - a}',
      true
    );
    renderMath(document.getElementById('lv1-fx'), 'f(x) = \\tfrac{x^2}{5}');

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const readout = document.createElement('div');
    readoutWrap.appendChild(readout);

    const state = { a: -2, b: 2 };
    const sA = makeSlider({
      label: t('lv1.sliderA'),
      min: X_MIN,
      max: X_MAX,
      step: 0.1,
      value: state.a,
      onInput: (v) => {
        state.a = v;
        update();
      },
    });
    const sB = makeSlider({
      label: t('lv1.sliderB'),
      min: X_MIN,
      max: X_MAX,
      step: 0.1,
      value: state.b,
      onInput: (v) => {
        state.b = v;
        update();
      },
    });
    ui.controls.append(sA.root, sB.root, readoutWrap);

    ui.mission.innerHTML = t('lv1.mission');

    let done = false;
    function update() {
      const { a, b } = state;
      const Pa = new THREE.Vector3(a, f(a), 0);
      const Pb = new THREE.Vector3(b, f(b), 0);
      A.position.copy(Pa);
      B.position.copy(Pb);

      const span = new THREE.Vector3().subVectors(Pb, Pa);
      const degenerate = span.length() < 1e-3;
      secant.visible = !degenerate;
      dxLine.visible = !degenerate;
      dyLine.visible = !degenerate;
      dxLabel.visible = !degenerate;
      dyLabel.visible = !degenerate;
      if (degenerate) {
        renderMath(readout, t('lv1.noSecant'), true);
        return;
      }

      const Pc = new THREE.Vector3(b, f(a), 0);
      updateCylinder(dxLine, Pa, Pc);
      updateCylinder(dyLine, Pc, Pb);
      dxLabel.position.set((a + b) / 2, f(a) - 0.4, 0);
      dyLabel.position.set(b + 0.45, (f(a) + f(b)) / 2, 0);

      const dir = span.clone().normalize();
      updateCylinder(secant, Pa.clone().addScaledVector(dir, -3), Pb.clone().addScaledVector(dir, 3));

      const m = (f(b) - f(a)) / (b - a);
      renderMath(
        readout,
        `m = \\frac{${(f(b) - f(a)).toFixed(2)}}{${(b - a).toFixed(2)}} = ${m.toFixed(2)}`,
        true
      );

      if (!done && Math.abs(m - TARGET) <= TOL) {
        done = true;
        complete(t('lv1.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv1.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

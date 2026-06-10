import * as THREE from 'three';
import { sampleCurve, derivative } from '../lib/math.js';
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
const X_MIN = -5;
const X_MAX = 5;
const H_WIN = 0.05; // Mission: h unter diesen Wert drücken

export default {
  num: 2,
  title: 'Die Tangente',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([0, 3.5, 14], [0, 2, 0]);

    addGridXY(g, 12, 12);
    addAxes(g, { x: 6, y: 6 });

    const pts = sampleCurve(f, X_MIN, X_MAX, 200).map(([x, y]) => new THREE.Vector3(x, y, 0));
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
    const P = mkPoint(0x2563eb, 'P', '#93c5fd');
    const Q = mkPoint(0xf59e0b, 'Q', '#fcd34d');

    const secant = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.04, 0xe2e8f0);
    const hLine = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0.03, 0xf59e0b);
    const tangent = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 1, 0), 0.045, 0x22c55e);
    tangent.visible = false; // wird erst durch die Mission enthüllt
    g.add(secant, hLine, tangent);

    const hLabel = makeLabel('h', { color: '#fcd34d', scale: 0.5 });
    g.add(hLabel);

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv2.info');
    renderMath(
      document.getElementById('lv2-formula'),
      "f'(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) - f(x_0)}{h}",
      true
    );
    renderMath(document.getElementById('lv2-fx'), 'f(x) = \\tfrac{x^3}{12} - x + 2');

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const dqReadout = document.createElement('div');
    const trueReadout = document.createElement('div');
    readoutWrap.append(dqReadout, trueReadout);

    const state = { x0: 1.5, h: 2 };
    const sX = makeSlider({
      label: t('lv2.sliderX'),
      min: -4,
      max: 3,
      step: 0.1,
      value: state.x0,
      onInput: (v) => {
        state.x0 = v;
        update();
      },
    });
    const sH = makeSlider({
      label: t('lv2.sliderH'),
      min: 0.01,
      max: 2,
      step: 0.01,
      value: state.h,
      format: (v) => v.toFixed(2),
      onInput: (v) => {
        state.h = v;
        update();
      },
    });
    ui.controls.append(sX.root, sH.root, readoutWrap);

    ui.mission.innerHTML = t('lv2.mission');

    let done = false;
    function update() {
      const { x0, h } = state;
      const Pp = new THREE.Vector3(x0, f(x0), 0);
      const Pq = new THREE.Vector3(x0 + h, f(x0 + h), 0);
      P.position.copy(Pp);
      Q.position.copy(Pq);

      // Sekante durch P und Q, beidseitig verlängert
      const dir = new THREE.Vector3().subVectors(Pq, Pp).normalize();
      updateCylinder(secant, Pp.clone().addScaledVector(dir, -3.5), Pq.clone().addScaledVector(dir, 3.5));

      // h-Marker unter dem Bogen
      const Pc = new THREE.Vector3(x0 + h, f(x0), 0);
      updateCylinder(hLine, Pp, Pc);
      hLabel.position.set(x0 + h / 2, f(x0) - 0.4, 0);

      const dq = (f(x0 + h) - f(x0)) / h;
      const m = derivative(f, x0);
      renderMath(
        dqReadout,
        `\\frac{f(x_0+h) - f(x_0)}{h} = ${dq.toFixed(3)}`,
        true
      );

      if (done) {
        // Tangente folgt nach der Enthüllung dem Berührpunkt
        const tDir = new THREE.Vector3(1, m, 0).normalize();
        updateCylinder(
          tangent,
          Pp.clone().addScaledVector(tDir, -3.5),
          Pp.clone().addScaledVector(tDir, 3.5)
        );
        renderMath(trueReadout, `f'(x_0) = ${m.toFixed(3)}`, true);
      } else {
        renderMath(trueReadout, "f'(x_0) = \\;?", true);
      }

      if (!done && h <= H_WIN) {
        done = true;
        tangent.visible = true;
        update(); // Tangente und Readout sofort nachziehen
        complete(t('lv2.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv2.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

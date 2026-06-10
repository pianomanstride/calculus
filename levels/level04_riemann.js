import * as THREE from 'three';
import { sampleCurve } from '../lib/math.js';
import { tubeFromPoints, addAxes, addGridXY } from '../lib/scene.js';
import { renderMath, makeSlider } from '../lib/ui.js';
import { t } from '../lib/i18n.js';

const f = (x) => 3 + 1.5 * Math.sin(1.2 * x) - (x * x) / 20;
const X_MIN = -4;
const X_MAX = 4;
// ∫f über [-4,4]: 3x - 1.25·cos(1.2x) - x³/60 → Sinus-Anteil hebt sich aus Symmetrie weg
const A_EXACT = 24 - 128 / 60;
const ERR_WIN = 0.005; // Mission: relativer Fehler unter 0,5 %

export default {
  num: 4,
  title: 'Fläche unter der Kurve',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([0, 4.5, 13], [0, 2, 0]);

    addGridXY(g, 12, 12);
    addAxes(g, { x: 5.5, y: 5.5 });

    const pts = sampleCurve(f, X_MIN, X_MAX, 200).map(([x, y]) => new THREE.Vector3(x, y, 0));
    g.add(tubeFromPoints(pts, 0.07, 0x60a5fa));

    // Exakte Fläche als transparenter "Geist"-Körper (das Ziel der Annäherung)
    const shape = new THREE.Shape();
    shape.moveTo(X_MIN, 0);
    for (const [x, y] of sampleCurve(f, X_MIN, X_MAX, 120)) shape.lineTo(x, y);
    shape.lineTo(X_MAX, 0);
    shape.closePath();
    const ghost = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 0.6, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, transparent: true, opacity: 0.22, roughness: 0.6 })
    );
    ghost.position.z = -0.3;
    g.add(ghost);

    // Riemann-Blöcke (werden bei jeder Änderung neu aufgebaut)
    const blocks = new THREE.Group();
    g.add(blocks);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45 });

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv4.info');
    renderMath(
      document.getElementById('lv4-formula'),
      'S_n = \\sum_{i=1}^{n} f(x_i^*) \\cdot \\Delta x \\;\\xrightarrow{\\,n \\to \\infty\\,}\\; \\int_a^b f(x)\\,dx',
      true
    );

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const sumReadout = document.createElement('div');
    const errReadout = document.createElement('div');
    readoutWrap.append(sumReadout, errReadout);

    const state = { n: 4, rule: 'left' };

    const sN = makeSlider({
      label: t('lv4.slider'),
      min: 1,
      max: 80,
      step: 1,
      value: state.n,
      format: (v) => v.toFixed(0),
      onInput: (v) => {
        state.n = Math.round(v);
        update();
      },
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const ruleBtns = {};
    for (const [key, label] of [['left', t('lv4.left')], ['mid', t('lv4.mid')], ['right', t('lv4.right')]]) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = label;
      b.addEventListener('click', () => {
        state.rule = key;
        update();
      });
      ruleBtns[key] = b;
      btnRow.appendChild(b);
    }
    const ruleLabel = document.createElement('div');
    ruleLabel.className = 'ctl-caption';
    ruleLabel.textContent = t('lv4.ruleCaption');

    ui.controls.append(sN.root, ruleLabel, btnRow, readoutWrap);

    ui.mission.innerHTML = t('lv4.mission');

    let done = false;
    function update() {
      const { n, rule } = state;
      for (const key in ruleBtns) ruleBtns[key].classList.toggle('active', key === rule);

      // Blöcke neu aufbauen
      for (const c of [...blocks.children]) {
        c.geometry.dispose();
        blocks.remove(c);
      }
      const dx = (X_MAX - X_MIN) / n;
      let S = 0;
      for (let i = 0; i < n; i++) {
        const xL = X_MIN + i * dx;
        const xi = rule === 'left' ? xL : rule === 'right' ? xL + dx : xL + dx / 2;
        const h = f(xi);
        S += h * dx;
        const box = new THREE.Mesh(new THREE.BoxGeometry(dx * 0.96, h, 0.5), blockMat);
        box.position.set(xL + dx / 2, h / 2, 0);
        blocks.add(box);
      }

      const err = Math.abs(S - A_EXACT) / A_EXACT;
      renderMath(sumReadout, `S_{${n}} = ${S.toFixed(3)}`, true);
      renderMath(
        errReadout,
        `A = ${A_EXACT.toFixed(3)}, \\quad \\text{${t('common.error')}} = ${(err * 100).toFixed(2)}\\,\\%`,
        true
      );

      if (!done && err <= ERR_WIN) {
        done = true;
        renderMath(
          document.getElementById('lv4-reveal'),
          `\\int_{-4}^{4} f(x)\\,dx = ${A_EXACT.toFixed(3)}`,
          true
        );
        complete(t('lv4.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv4.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

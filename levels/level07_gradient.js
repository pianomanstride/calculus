import * as THREE from 'three';
import { makeLabel, addAxes } from '../lib/scene.js';
import { renderMath, makeSlider } from '../lib/ui.js';
import { t } from '../lib/i18n.js';

// Zwei-Gipfel-Landschaft: Hauptgipfel (hoch, rechts) und Verführer-Hügel (niedrig, links).
const bump = (x, y, cx, cy, s) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);
const F = (x, y) => 0.4 + 3.2 * bump(x, y, 1.2, -0.8, 6) + 1.8 * bump(x, y, -2.5, 2, 4);
const R = 4;
const H_MIN = 0.4;
const H_MAX = 3.65;
const SUMMIT_H = 3.4;
const START = { x: -3.5, y: 2.5 }; // im Einzugsgebiet des falschen Gipfels!
const EPS = 1e-3;

const fx = (x, y) => (F(x + EPS, y) - F(x - EPS, y)) / (2 * EPS);
const fy = (x, y) => (F(x, y + EPS) - F(x, y - EPS)) / (2 * EPS);

export default {
  num: 7,
  title: 'Der Gradient',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([9.5, 8, 9.5], [0, 1.5, 0]);

    const floor = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
    g.add(floor);
    addAxes(g, { x: 5.2, y: 4.6, z: 5.2, xLabel: 'x', yLabel: 'f(x, y)', zLabel: 'y' });

    // Landschaft mit Höhenfärbung
    const geo = new THREE.PlaneGeometry(2 * R, 2 * R, 64, 64);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cLow = new THREE.Color(0x1d4ed8);
    const cHigh = new THREE.Color(0xf59e0b);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = F(pos.getX(i), pos.getZ(i));
      pos.setY(i, h);
      c.copy(cLow).lerp(cHigh, (h - H_MIN) / (H_MAX - H_MIN));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    g.add(
      new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, side: THREE.DoubleSide })
      )
    );

    // Gipfelfahne auf dem echten Gipfel
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
    );
    flagPole.position.set(1.2, F(1.2, -0.8) + 0.5, -0.8);
    const flagLabel = makeLabel(t('lv7.flag'), { color: '#22c55e', scale: 0.5 });
    flagLabel.position.set(0, 0.7, 0);
    flagPole.add(flagLabel);
    g.add(flagPole);

    // Bergsteiger + Gradientenpfeil + Spur
    const climber = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.25 })
    );
    const youLabel = makeLabel(t('lv7.you'), { color: '#22c55e', scale: 0.5 });
    youLabel.position.set(0, 0.5, 0);
    climber.add(youLabel);
    g.add(climber);

    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(),
      1.4,
      0x22c55e,
      0.35,
      0.2
    );
    g.add(arrow);

    const trail = new THREE.Group();
    g.add(trail);
    const trailGeo = new THREE.SphereGeometry(0.06, 8, 6);
    const trailMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv7.info');
    renderMath(
      document.getElementById('lv7-formula'),
      '\\nabla f = \\begin{pmatrix} \\partial f / \\partial x \\\\ \\partial f / \\partial y \\end{pmatrix}',
      true
    );

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const hReadout = document.createElement('div');
    const gradReadout = document.createElement('div');
    const stepReadout = document.createElement('div');
    stepReadout.className = 'ctl-caption';
    readoutWrap.append(hReadout, gradReadout, stepReadout);

    const state = { x: START.x, y: START.y, lambda: 0.8, steps: 0 };
    let stuckHintShown = false;

    const sL = makeSlider({
      label: t('lv7.slider'),
      min: 0.2,
      max: 1.5,
      step: 0.1,
      value: state.lambda,
      onInput: (v) => {
        state.lambda = v;
      },
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'btn-row';
    const stepBtn = document.createElement('button');
    stepBtn.className = 'btn';
    stepBtn.textContent = t('lv7.stepBtn');
    const respawnBtn = document.createElement('button');
    respawnBtn.className = 'btn';
    respawnBtn.textContent = t('lv7.respawnBtn');
    btnRow.append(stepBtn, respawnBtn);

    ui.controls.append(sL.root, btnRow, readoutWrap);

    ui.mission.innerHTML = t('lv7.mission');

    function addTrailDot() {
      const dot = new THREE.Mesh(trailGeo, trailMat);
      dot.position.set(state.x, F(state.x, state.y) + 0.03, state.y);
      trail.add(dot);
    }

    let done = false;
    function update() {
      const { x, y } = state;
      const h = F(x, y);
      climber.position.set(x, h + 0.12, y);

      const gx = fx(x, y);
      const gy = fy(x, y);
      const norm = Math.hypot(gx, gy);
      if (norm > 1e-4) {
        arrow.visible = true;
        // Steilster Anstieg als Tangentialrichtung an der Oberfläche
        arrow.setDirection(new THREE.Vector3(gx / norm, norm, gy / norm).normalize());
        arrow.position.set(x, h + 0.15, y);
      } else {
        arrow.visible = false;
      }

      renderMath(hReadout, `f(${x.toFixed(2)},\\,${y.toFixed(2)}) = ${h.toFixed(2)}`, true);
      renderMath(gradReadout, `\\lVert \\nabla f \\rVert = ${norm.toFixed(3)}`, true);
      stepReadout.textContent = t('lv7.steps', { n: state.steps });

      if (!done && h >= SUMMIT_H) {
        done = true;
        renderMath(document.getElementById('lv7-reveal'), t('lv7.revealLatex'), true);
        complete(t('lv7.success', { n: state.steps }));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv7.teaser');
        ui.mission.appendChild(teaser);
      } else if (!done && norm < 0.05 && h < SUMMIT_H && state.steps > 0 && !stuckHintShown) {
        stuckHintShown = true;
        const warn = document.createElement('p');
        warn.className = 'hint';
        warn.textContent = t('lv7.stuck');
        ui.mission.appendChild(warn);
      }
    }

    stepBtn.addEventListener('click', () => {
      const gx = fx(state.x, state.y);
      const gy = fy(state.x, state.y);
      const norm = Math.hypot(gx, gy);
      if (norm < 1e-4) return; // völlig flach: kein Schritt möglich
      addTrailDot();
      state.x = Math.max(-R, Math.min(R, state.x + (state.lambda * gx) / norm));
      state.y = Math.max(-R, Math.min(R, state.y + (state.lambda * gy) / norm));
      state.steps += 1;
      update();
    });

    respawnBtn.addEventListener('click', () => {
      state.x = -R + Math.random() * 2 * R;
      state.y = -R + Math.random() * 2 * R;
      state.steps = 0;
      stuckHintShown = false;
      update();
    });

    update();

    return { dispose() {} };
  },
};

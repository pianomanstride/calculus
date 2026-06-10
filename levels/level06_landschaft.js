import * as THREE from 'three';
import {
  makeLabel,
  cylinderBetween,
  updateCylinder,
  tubeFromPoints,
  addAxes,
} from '../lib/scene.js';
import { renderMath, makeSlider } from '../lib/ui.js';
import { t } from '../lib/i18n.js';

// Höhenfunktion der Landschaft. Mathe-Koordinaten (x, y) → Three (x, z), Höhe → Three-y.
const F = (x, y) => 2 + 1.3 * Math.sin(0.8 * x) * Math.cos(0.7 * y);
const R = 4; // Definitionsbereich [-R, R] in beiden Richtungen
const H_MIN = 0.7;
const H_MAX = 3.3;
const FLAT_TOL = 0.05;
const EPS = 1e-3;

const fx = (x, y) => (F(x + EPS, y) - F(x - EPS, y)) / (2 * EPS);
const fy = (x, y) => (F(x, y + EPS) - F(x, y - EPS)) / (2 * EPS);

export default {
  num: 6,
  title: 'Landschaften: f(x, y)',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([9, 7.5, 9], [0, 1.5, 0]);

    const floor = new THREE.GridHelper(10, 10, 0x334155, 0x1e293b);
    g.add(floor);
    addAxes(g, { x: 5.2, y: 4.4, z: 5.2, xLabel: 'x', yLabel: 'f(x, y)', zLabel: 'y' });

    // Landschaft: verschobenes Gitter mit Höhenfärbung (blau = Tal, amber = Gipfel)
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
    const surface = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, side: THREE.DoubleSide })
    );
    g.add(surface);

    // Wanderpunkt P mit zwei Schnitt-Tangenten
    const P = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    const pLabel = makeLabel('P', { color: '#ffffff', scale: 0.5 });
    pLabel.position.set(0, 0.5, 0);
    P.add(pLabel);
    g.add(P);

    const tanX = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), 0.045, 0x2563eb);
    const tanY = cylinderBetween(new THREE.Vector3(), new THREE.Vector3(0, 0, 1), 0.045, 0xf59e0b);
    g.add(tanX, tanY);

    // Schnittkurven durch P (werden bei Bewegung neu aufgebaut)
    let sliceX = null;
    let sliceY = null;
    function rebuildSlices(x0, y0) {
      for (const old of [sliceX, sliceY]) {
        if (old) {
          old.geometry.dispose();
          old.material.dispose();
          g.remove(old);
        }
      }
      const ptsX = [];
      const ptsY = [];
      for (let i = 0; i <= 80; i++) {
        const t = -R + (2 * R * i) / 80;
        ptsX.push(new THREE.Vector3(t, F(t, y0) + 0.02, y0));
        ptsY.push(new THREE.Vector3(x0, F(x0, t) + 0.02, t));
      }
      sliceX = tubeFromPoints(ptsX, 0.035, 0x93c5fd);
      sliceY = tubeFromPoints(ptsY, 0.035, 0xfcd34d);
      g.add(sliceX, sliceY);
    }

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv6.info');
    renderMath(document.getElementById('lv6-f'), 'f(x, y)');
    renderMath(document.getElementById('lv6-formula'), t('lv6.formulaLatex'), true);

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const partialReadout = document.createElement('div');
    readoutWrap.appendChild(partialReadout);

    const state = { x: -3, y: -1 };
    const sX = makeSlider({
      label: t('lv6.sliderX'),
      min: -R,
      max: R,
      step: 0.05,
      value: state.x,
      format: (v) => v.toFixed(2),
      onInput: (v) => {
        state.x = v;
        update();
      },
    });
    const sY = makeSlider({
      label: t('lv6.sliderY'),
      min: -R,
      max: R,
      step: 0.05,
      value: state.y,
      format: (v) => v.toFixed(2),
      onInput: (v) => {
        state.y = v;
        update();
      },
    });
    ui.controls.append(sX.root, sY.root, readoutWrap);

    ui.mission.innerHTML = t('lv6.mission');

    let done = false;
    function update() {
      const { x, y } = state;
      const h = F(x, y);
      P.position.set(x, h, y);

      const mx = fx(x, y);
      const my = fy(x, y);
      const dirX = new THREE.Vector3(1, mx, 0).normalize();
      const dirY = new THREE.Vector3(0, my, 1).normalize();
      const base = new THREE.Vector3(x, h + 0.02, y);
      updateCylinder(tanX, base.clone().addScaledVector(dirX, -1.3), base.clone().addScaledVector(dirX, 1.3));
      updateCylinder(tanY, base.clone().addScaledVector(dirY, -1.3), base.clone().addScaledVector(dirY, 1.3));

      rebuildSlices(x, y);

      renderMath(
        partialReadout,
        `\\frac{\\partial f}{\\partial x} = ${mx.toFixed(2)}, \\qquad \\frac{\\partial f}{\\partial y} = ${my.toFixed(2)}`,
        true
      );

      if (!done && Math.abs(mx) <= FLAT_TOL && Math.abs(my) <= FLAT_TOL) {
        done = true;
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 24, 16),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x92600a, roughness: 0.2 })
        );
        star.position.set(x, h + 0.6, y);
        const starLabel = makeLabel(t('lv6.star'), { color: '#fbbf24', scale: 0.45 });
        starLabel.position.set(0, 0.45, 0);
        star.add(starLabel);
        g.add(star);
        renderMath(
          document.getElementById('lv6-reveal'),
          `\\nabla f(${x.toFixed(2)}, ${y.toFixed(2)}) \\approx \\vec{0}`,
          true
        );
        complete(t('lv6.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv6.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

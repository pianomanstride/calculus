import * as THREE from 'three';
import { sampleCurve } from '../lib/math.js';
import { tubeFromPoints, addAxes } from '../lib/scene.js';
import { renderMath, makeSlider } from '../lib/ui.js';
import { t } from '../lib/i18n.js';

const f = (x) => 1.6 + 0.7 * Math.sin(1.1 * x) + x / 10; // Vasen-Profil, überall > 0
const X_MIN = -4;
const X_MAX = 4;
const ERR_WIN = 0.01; // Scheiben-Fehler unter 1 %

// "Exaktes" Volumen V = π·∫f² per Simpson-Regel (numerisch bis weit unter Anzeige-Genauigkeit)
function simpsonVolume(n = 2000) {
  const h = (X_MAX - X_MIN) / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const x = X_MIN + i * h;
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    s += w * f(x) * f(x);
  }
  return (Math.PI * s * h) / 3;
}
const V_EXACT = simpsonVolume();

export default {
  num: 5,
  title: 'Rotationskörper',
  init({ stage, ui, complete }) {
    const g = stage.levelGroup;
    stage.resetCamera([7, 4.5, 10], [0, 0, 0]);

    // Bodengitter unterhalb des Körpers (xy-Gitter würde ihn durchschneiden)
    const floor = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b);
    floor.position.y = -3.4;
    g.add(floor);
    addAxes(g, { x: 5.5, y: 3.6, z: 3.6, yLabel: 'f(x)' });

    // Profilkurve und gespiegelte Silhouette in der x/y-Ebene
    const pts = sampleCurve(f, X_MIN, X_MAX, 160).map(([x, y]) => new THREE.Vector3(x, y, 0));
    g.add(tubeFromPoints(pts, 0.06, 0x60a5fa));
    const mirror = tubeFromPoints(
      sampleCurve(f, X_MIN, X_MAX, 160).map(([x, y]) => new THREE.Vector3(x, -y, 0)),
      0.04,
      0x3b5d8f
    );
    g.add(mirror);

    // Rotationskörper: LatheGeometry dreht um die y-Achse → per rotation.z auf die x-Achse gelegt
    const profile = sampleCurve(f, X_MIN, X_MAX, 80).map(([x, y]) => new THREE.Vector2(y, x));
    const latheMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
    });
    let lathe = null;
    function rebuildLathe(angleDeg) {
      if (lathe) {
        lathe.geometry.dispose();
        g.remove(lathe);
        lathe = null;
      }
      if (angleDeg <= 0) return;
      const geo = new THREE.LatheGeometry(profile, 96, 0, (angleDeg / 180) * Math.PI);
      lathe = new THREE.Mesh(geo, latheMat);
      lathe.rotation.z = -Math.PI / 2; // Drehachse = x-Achse
      g.add(lathe);
    }

    // Scheiben (Zylinder quer zur x-Achse) für die Volumen-Annäherung
    const disks = new THREE.Group();
    g.add(disks);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.45,
      transparent: true,
      opacity: 0.55,
    });

    // ---------- Panel ----------
    ui.info.innerHTML = t('lv5.info');
    renderMath(
      document.getElementById('lv5-formula'),
      'V = \\pi \\int_a^b \\bigl[f(x)\\bigr]^2 \\, dx',
      true
    );

    const readoutWrap = document.createElement('div');
    readoutWrap.className = 'readout';
    const sumReadout = document.createElement('div');
    const errReadout = document.createElement('div');
    readoutWrap.append(sumReadout, errReadout);

    const state = { sweep: 40, n: 4 };
    let sweptFull = false;

    const sSweep = makeSlider({
      label: t('lv5.sliderSweep'),
      min: 0,
      max: 360,
      step: 5,
      value: state.sweep,
      format: (v) => `${v.toFixed(0)}°`,
      onInput: (v) => {
        state.sweep = v;
        update();
      },
    });
    const sN = makeSlider({
      label: t('lv5.sliderN'),
      min: 2,
      max: 60,
      step: 1,
      value: state.n,
      format: (v) => v.toFixed(0),
      onInput: (v) => {
        state.n = Math.round(v);
        update();
      },
    });
    ui.controls.append(sSweep.root, sN.root, readoutWrap);

    ui.mission.innerHTML = t('lv5.mission');

    let done = false;
    function update() {
      const { sweep, n } = state;
      rebuildLathe(sweep);
      if (sweep >= 360) sweptFull = true;

      // Scheiben neu aufbauen (Mittelpunkts-Radien)
      for (const c of [...disks.children]) {
        c.geometry.dispose();
        disks.remove(c);
      }
      const dx = (X_MAX - X_MIN) / n;
      let V = 0;
      for (let i = 0; i < n; i++) {
        const mid = X_MIN + (i + 0.5) * dx;
        const r = f(mid);
        V += Math.PI * r * r * dx;
        const disk = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dx * 0.92, 40), diskMat);
        disk.rotation.z = Math.PI / 2; // Zylinderachse auf die x-Achse legen
        disk.position.set(mid, 0, 0);
        disks.add(disk);
      }

      const err = Math.abs(V - V_EXACT) / V_EXACT;
      renderMath(sumReadout, `V_{${n}} = ${V.toFixed(2)}`, true);
      renderMath(
        errReadout,
        `V = ${V_EXACT.toFixed(2)}, \\quad \\text{${t('common.error')}} = ${(err * 100).toFixed(2)}\\,\\%`,
        true
      );

      if (!done && sweptFull && err <= ERR_WIN) {
        done = true;
        renderMath(
          document.getElementById('lv5-reveal'),
          `V = \\pi \\int_{-4}^{4} [f(x)]^2\\,dx \\approx ${V_EXACT.toFixed(2)}`,
          true
        );
        complete(t('lv5.success'));
        const teaser = document.createElement('p');
        teaser.className = 'hint';
        teaser.textContent = t('lv5.teaser');
        ui.mission.appendChild(teaser);
      }
    }
    update();

    return { dispose() {} };
  },
};

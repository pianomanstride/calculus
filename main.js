import { createScene } from './lib/scene.js';
import { t, getLang, setLang } from './lib/i18n.js';

// Level-Registry: loader === null heißt "noch in Arbeit". Titel kommen aus lib/i18n.js (lvN.title).
const LEVELS = [
  { num: 1, loader: () => import('./levels/level01_steigung.js') },
  { num: 2, loader: () => import('./levels/level02_tangente.js') },
  { num: 3, loader: () => import('./levels/level03_ableitungsfunktion.js') },
  { num: 4, loader: () => import('./levels/level04_riemann.js') },
  { num: 5, loader: () => import('./levels/level05_rotation.js') },
  { num: 6, loader: () => import('./levels/level06_landschaft.js') },
  { num: 7, loader: () => import('./levels/level07_gradient.js') },
];

const STORE_KEY = 'calculus3d.unlocked';
let unlocked = parseInt(localStorage.getItem(STORE_KEY) || '1', 10);
let activeNum = null;
let current = null;

const stage = createScene(document.getElementById('canvas-host'));
const ui = {
  info: document.getElementById('level-info'),
  controls: document.getElementById('level-controls'),
  mission: document.getElementById('mission'),
};
const nav = document.getElementById('level-list');

function completeLevel(num, message) {
  ui.mission.classList.add('done');
  const p = document.createElement('p');
  p.className = 'mission-success';
  p.textContent = `🎉 ${message}`;
  ui.mission.appendChild(p);

  if (num + 1 > unlocked) {
    unlocked = num + 1;
    localStorage.setItem(STORE_KEY, String(unlocked));
    const next = LEVELS.find((l) => l.num === num + 1);
    if (next) {
      const hint = document.createElement('p');
      hint.className = 'mission-unlock';
      hint.textContent = t('unlock.msg', {
        num: next.num,
        title: t(`lv${next.num}.title`),
        rest: next.loader ? t('unlock.now') : t('unlock.soon'),
      });
      ui.mission.appendChild(hint);
    }
  }
  renderSidebar();
}

async function loadLevel(entry, force = false) {
  if (!entry.loader || entry.num > unlocked || (entry.num === activeNum && !force)) return;
  if (current && current.dispose) current.dispose();
  current = null;
  stage.clearLevel();
  ui.info.innerHTML = '';
  ui.controls.innerHTML = '';
  ui.mission.innerHTML = '';
  ui.mission.classList.remove('done');

  const mod = await entry.loader();
  activeNum = entry.num;
  current =
    mod.default.init({
      stage,
      ui,
      complete: (msg) => completeLevel(entry.num, msg),
    }) || {};
  renderSidebar();
}

function renderSidebar() {
  nav.innerHTML = '';
  for (const l of LEVELS) {
    const locked = l.num > unlocked;
    const wip = !l.loader;
    const btn = document.createElement('button');
    btn.className = 'level-item';
    if (l.num === activeNum) btn.classList.add('active');
    btn.disabled = locked || wip;
    const status = locked ? '🔒' : wip ? '🚧' : l.num < unlocked ? '✅' : '▶️';
    btn.innerHTML = `<span class="lv-num">${l.num}</span><span class="lv-title">${t(`lv${l.num}.title`)}</span><span class="lv-status">${status}</span>`;
    btn.addEventListener('click', () => loadLevel(l));
    nav.appendChild(btn);
  }
}

// ---------- Sprachumschaltung ----------
const langButtons = {};
const langSwitch = document.getElementById('lang-switch');
for (const l of ['de', 'en']) {
  const b = document.createElement('button');
  b.className = 'lang-btn';
  b.textContent = l.toUpperCase();
  b.addEventListener('click', () => switchLang(l));
  langButtons[l] = b;
  langSwitch.appendChild(b);
}

function applyLang() {
  document.documentElement.lang = getLang();
  document.getElementById('tagline').textContent = t('app.tagline');
  for (const l in langButtons) langButtons[l].classList.toggle('active', l === getLang());
  renderSidebar();
}

async function switchLang(l) {
  if (l === getLang()) return;
  setLang(l);
  applyLang();
  if (activeNum) {
    const entry = LEVELS.find((e) => e.num === activeNum);
    await loadLevel(entry, true); // Level neu laden, damit alle Texte umschalten
  }
}

applyLang();
loadLevel(LEVELS[0]);

// UI-Helfer: KaTeX-Rendering und Steuerelemente für das rechte Panel.

export function renderMath(el, tex, display = false) {
  if (window.katex) {
    window.katex.render(tex, el, { displayMode: display, throwOnError: false });
  } else {
    el.textContent = tex; // Fallback, falls das CDN nicht erreichbar ist
  }
}

export function makeSlider({ label, min, max, step = 0.1, value, format = (v) => v.toFixed(1), onInput }) {
  const root = document.createElement('div');
  root.className = 'ctl-slider';

  const lab = document.createElement('label');
  const name = document.createElement('span');
  name.textContent = label;
  const val = document.createElement('span');
  val.className = 'ctl-value';
  val.textContent = format(value);
  lab.append(name, val);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = value;
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    val.textContent = format(v);
    onInput(v);
  });

  root.append(lab, input);
  return {
    root,
    input,
    set(v) {
      input.value = v;
      val.textContent = format(v);
    },
  };
}

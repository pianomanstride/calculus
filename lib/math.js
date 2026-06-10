// Reine Mathe-Helfer, bewusst ohne Three.js-Abhängigkeit.

export function sampleCurve(f, x0, x1, n = 100) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    out.push([x, f(x)]);
  }
  return out;
}

// Numerische Ableitung (zentraler Differenzenquotient).
export function derivative(f, x, h = 1e-4) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

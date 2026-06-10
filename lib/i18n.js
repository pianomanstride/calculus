// Zweisprachigkeit (DE/EN). Alle UI-Texte leben hier; Level holen sie per t(key).
// Sprachwechsel: setLang() + Neuladen des aktiven Levels (Texte werden bei init() gezogen).

const STORE_KEY = 'calculus3d.lang';
let lang = localStorage.getItem(STORE_KEY) === 'de' ? 'de' : 'en'; // Default: EN (öffentliches Repo)

export function getLang() {
  return lang;
}

export function setLang(l) {
  lang = l === 'en' ? 'en' : 'de';
  localStorage.setItem(STORE_KEY, lang);
}

export function t(key, vars = {}) {
  const s = STR[lang][key] ?? STR.de[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

const STR = {
  de: {
    'app.tagline': 'Spielerisch von der Steigung zum Gradienten',
    'unlock.msg': '🔓 Level {num} „{title}“ ist freigeschaltet{rest}',
    'unlock.now': '!',
    'unlock.soon': ' – Inhalt kommt bald!',
    'common.error': 'Fehler',

    'lv1.title': 'Steigung erleben',
    'lv1.info': `
      <h2>Level 1 · Steigung erleben</h2>
      <p>Wie steil ist eine Kurve? Zwischen zwei Punkten beantwortet das die <b>Sekante</b> –
      die Gerade durch <span class="tag-a">A</span> und <span class="tag-b">B</span>.
      Ihre Steigung ist die <b>durchschnittliche Änderungsrate</b>:</p>
      <div class="formula" id="lv1-formula"></div>
      <p>Die Kurve hier ist <span id="lv1-fx"></span>.
      Bewege A und B und beobachte das Steigungsdreieck. Die Szene lässt sich mit der Maus drehen und zoomen.</p>`,
    'lv1.sliderA': 'Punkt A (x-Wert)',
    'lv1.sliderB': 'Punkt B (x-Wert)',
    'lv1.mission': `
      <h3>🎯 Mission</h3>
      <p>Stelle A und B so ein, dass die Sekante <b>genau die Steigung m = 1,2</b> hat (Toleranz ±0,05).</p>
      <p class="hint">Tipp: Es gibt viele Lösungen – findest du zwei verschiedene?</p>`,
    'lv1.noSecant': 'A = B:\\;\\text{keine Sekante}',
    'lv1.success': 'Stark! Du hast die Sekante auf Steigung 1,2 gebracht.',
    'lv1.teaser':
      'Probier mal: Schiebe B ganz nah an A heran – die Sekante wird fast zur Tangente. Genau darum geht es in Level 2!',

    'lv2.title': 'Die Tangente',
    'lv2.info': `
      <h2>Level 2 · Die Tangente</h2>
      <p>In Level 1 hast du die Sekante kennengelernt. Jetzt die Schlüsselidee der Differentialrechnung:
      Was passiert, wenn der zweite Punkt <span class="tag-b">Q</span> immer näher an
      <span class="tag-a">P</span> heranrückt – wenn also <b>h gegen 0</b> schrumpft?</p>
      <div class="formula" id="lv2-formula"></div>
      <p>Der Grenzwert dieses Differenzenquotienten ist die <b>Ableitung</b> – die Steigung der Kurve
      in genau einem Punkt. Die Kurve hier ist <span id="lv2-fx"></span>.</p>`,
    'lv2.sliderX': 'Berührpunkt x₀',
    'lv2.sliderH': 'Abstand h',
    'lv2.mission': `
      <h3>🎯 Mission</h3>
      <p>Lass h schrumpfen: Drücke <b>h unter 0,05</b> und enthülle die verborgene Tangente.</p>
      <p class="hint">Beobachte, wie die weiße Sekante sich beim Schrumpfen einpendelt – worauf läuft sie zu?</p>`,
    'lv2.success': 'Enthüllt! Die Sekante ist zur Tangente geworden – ihre Steigung ist die Ableitung.',
    'lv2.teaser':
      'Verschiebe jetzt x₀: Die Tangente wandert mit und ihre Steigung ändert sich von Punkt zu Punkt. Diese „Steigungsfunktion“ ist das Thema von Level 3!',

    'lv3.title': 'Die Ableitungs-Funktion',
    'lv3.info': `
      <h2>Level 3 · Die Ableitungs-Funktion</h2>
      <p>In Level 2 hast du die Ableitung <b>in einem Punkt</b> entdeckt. Aber die Steigung ändert sich
      ja von Punkt zu Punkt – sie ist selbst eine <b>Funktion</b>: die Ableitungsfunktion
      <span id="lv3-fp-sym"></span>.</p>
      <p>Fahre mit <span class="tag-a">P</span> über die Kurve <span id="lv3-fx"></span>.
      Jeder Punkt hinterlässt eine <span class="tag-b">Spur</span> auf Höhe seiner Steigung –
      du zeichnest die Ableitung selbst!</p>
      <div class="formula" id="lv3-reveal"></div>`,
    'lv3.slider': 'Punkt P (x-Wert)',
    'lv3.mission': `
      <h3>🎯 Mission</h3>
      <p>Zeichne die komplette Ableitungsfunktion: Fahre mit P über die <b>gesamte Kurve</b>
      (Abdeckung ≥ 95 %).</p>
      <p class="hint">Schau auf die Spur: Wo liegt sie über der x-Achse, wo darunter – und was macht f dort gerade?</p>`,
    'lv3.coverage': 'Abdeckung: {pct} %',
    'lv3.success': 'Du hast die Ableitungsfunktion gezeichnet – eine Parabel!',
    'lv3.teaser':
      'Schau genau hin: Wo f′ die x-Achse schneidet (f′ = 0), hat f einen Hoch- oder Tiefpunkt. Als Nächstes drehen wir den Spieß um: Aus der Steigung zurück zur Fläche – Level 4!',

    'lv4.title': 'Fläche unter der Kurve',
    'lv4.info': `
      <h2>Level 4 · Fläche unter der Kurve</h2>
      <p>Wie misst man eine <b>krumme Fläche</b>? Der Trick der Integralrechnung: Man pflastert sie
      mit Rechtecken, deren Höhe die Funktion vorgibt – und macht die Rechtecke dann immer schmaler.</p>
      <div class="formula" id="lv4-formula"></div>
      <p>Der blaue Geist-Körper ist die exakte Fläche. Staple Blöcke und wähle, wo jeder Block
      die Kurve berührt (Stützstelle).</p>
      <div class="formula" id="lv4-reveal"></div>`,
    'lv4.slider': 'Anzahl Blöcke n',
    'lv4.ruleCaption': 'Stützstelle: Wo berührt jeder Block die Kurve?',
    'lv4.left': 'Links',
    'lv4.mid': 'Mitte',
    'lv4.right': 'Rechts',
    'lv4.mission': `
      <h3>🎯 Mission</h3>
      <p>Nähere die Fläche so gut an, dass der <b>Fehler unter 0,5 %</b> liegt.</p>
      <p class="hint">Probiere alle drei Stützstellen: Welche Regel kommt mit den wenigsten Blöcken aus – und warum?</p>`,
    'lv4.success': 'Die Blöcke schmiegen sich an die Kurve – du hast das Integral eingefangen!',
    'lv4.teaser':
      'Merke: „Mitte“ gewinnt fast immer – die Überstände links und rechts gleichen sich aus. In Level 5 lassen wir Flächen rotieren und daraus Körper entstehen!',

    'lv5.title': 'Rotationskörper',
    'lv5.info': `
      <h2>Level 5 · Rotationskörper</h2>
      <p>Lass die blaue Profilkurve um die x-Achse <b>rotieren</b> – aus der Fläche wird ein Körper,
      wie auf einer Töpferscheibe. Sein Volumen liefert die <b>Scheiben-Methode</b>: Jede dünne
      Scheibe ist (fast) ein Zylinder mit Radius f(x):</p>
      <div class="formula" id="lv5-formula"></div>
      <p>Erst drehen, dann mit Scheiben füllen und das Volumen einfangen.</p>
      <div class="formula" id="lv5-reveal"></div>`,
    'lv5.sliderSweep': 'Rotationswinkel',
    'lv5.sliderN': 'Anzahl Scheiben n',
    'lv5.mission': `
      <h3>🎯 Mission</h3>
      <p>1. Drehe die Fläche <b>einmal ganz herum</b> (360°).<br>
      2. Bringe den Scheiben-Fehler <b>unter 1 %</b>.</p>
      <p class="hint">Dreh die Szene mit der Maus zur Seite – dann siehst du die Scheiben im Inneren des Körpers.</p>`,
    'lv5.success': 'Töpferscheibe gemeistert – Fläche rotiert, Volumen eingefangen!',
    'lv5.teaser':
      'Bisher lebte alles in der Ebene und wir haben sie rotiert. In Level 6 wird die Funktion selbst dreidimensional: f(x, y) – eine ganze Landschaft!',

    'lv6.title': 'Landschaften: f(x, y)',
    'lv6.info': `
      <h2>Level 6 · Landschaften: f(x, y)</h2>
      <p>Eine Funktion mit <b>zwei</b> Eingängen ist eine Landschaft: Über jedem Punkt (x, y) liegt
      die Höhe <span id="lv6-f"></span>. Steigung gibt es jetzt <b>je Richtung</b> – das sind die
      <b>partiellen Ableitungen</b>:</p>
      <div class="formula" id="lv6-formula"></div>
      <p>Die <span class="tag-a">blaue</span> Schnittkurve hält y fest, die
      <span class="tag-b">gelbe</span> hält x fest. Die beiden Tangenten in P zeigen die jeweilige Steigung.</p>
      <div class="formula" id="lv6-reveal"></div>`,
    'lv6.formulaLatex':
      '\\frac{\\partial f}{\\partial x}: \\text{Steigung in x-Richtung}, \\qquad \\frac{\\partial f}{\\partial y}: \\text{Steigung in y-Richtung}',
    'lv6.sliderX': 'Position x',
    'lv6.sliderY': 'Position y',
    'lv6.mission': `
      <h3>🎯 Mission</h3>
      <p>Finde einen <b>flachen Punkt</b> der Landschaft: beide partiellen Ableitungen
      betragsmäßig ≤ 0,05.</p>
      <p class="hint">Es gibt Gipfel, Täler – und Sattelpunkte, die in eine Richtung hoch- und in die andere
      hinabführen. Wo werden beide Tangenten waagerecht?</p>`,
    'lv6.star': '★ kritischer Punkt',
    'lv6.success': 'Flachen Punkt gefunden – hier verschwinden beide partiellen Ableitungen!',
    'lv6.teaser':
      'Beide Steigungen zusammen bilden einen Vektor: den Gradienten ∇f. Er zeigt immer bergauf – und genau damit spielen wir in Level 7!',

    'lv7.title': 'Der Gradient',
    'lv7.info': `
      <h2>Level 7 · Der Gradient</h2>
      <p>Alle Steigungen einer Landschaft stecken in <b>einem</b> Vektor – dem Gradienten:</p>
      <div class="formula" id="lv7-formula"></div>
      <p>Er zeigt immer in die Richtung des <b>steilsten Anstiegs</b>. Dein Bergsteiger darf sich nur
      so bewegen: ein Schritt der Länge λ, immer dem grünen Pfeil nach.</p>
      <div class="formula" id="lv7-reveal"></div>`,
    'lv7.slider': 'Schrittweite λ',
    'lv7.stepBtn': '⬆ Gradient-Schritt',
    'lv7.respawnBtn': '🎲 Umsetzen',
    'lv7.mission': `
      <h3>🎯 Mission</h3>
      <p>Erklimme den <b>höchsten Gipfel</b> (Höhe ≥ 3,4) – nur mit Gradient-Schritten.</p>
      <p class="hint">Vorsicht: Der Gradient kennt nur „bergauf von hier“. Nicht jeder Hügel,
      auf dem er dich ablädt, ist DER Gipfel …</p>`,
    'lv7.flag': '⛳ Gipfel',
    'lv7.you': 'Du',
    'lv7.steps': 'Schritte seit Start/Umsetzen: {n}',
    'lv7.revealLatex': '\\text{Am Gipfel gilt: } \\nabla f = \\vec{0}',
    'lv7.success': 'Gipfel erreicht – in {n} Schritten! Du hast Gradient-Aufstieg gemeistert.',
    'lv7.stuck':
      '⚠️ Lokales Maximum! Hier oben ist der Gradient null, aber es ist nicht der höchste Punkt. Setze dich um und versuche es von woanders.',
    'lv7.teaser':
      'Genau so trainieren neuronale Netze – nur abwärts: Gradient-Abstieg auf einer Fehler-Landschaft mit Millionen Dimensionen. Du hast das Prinzip jetzt in 3D gesehen!',
  },

  en: {
    'app.tagline': 'A playful journey from slope to gradient',
    'unlock.msg': '🔓 Level {num} “{title}” unlocked{rest}',
    'unlock.now': '!',
    'unlock.soon': ' – content coming soon!',
    'common.error': 'Error',

    'lv1.title': 'Feel the Slope',
    'lv1.info': `
      <h2>Level 1 · Feel the Slope</h2>
      <p>How steep is a curve? Between two points the <b>secant</b> answers that –
      the line through <span class="tag-a">A</span> and <span class="tag-b">B</span>.
      Its slope is the <b>average rate of change</b>:</p>
      <div class="formula" id="lv1-formula"></div>
      <p>The curve here is <span id="lv1-fx"></span>.
      Move A and B and watch the slope triangle. Drag and zoom the scene with your mouse.</p>`,
    'lv1.sliderA': 'Point A (x value)',
    'lv1.sliderB': 'Point B (x value)',
    'lv1.mission': `
      <h3>🎯 Mission</h3>
      <p>Position A and B so the secant has <b>a slope of exactly m = 1.2</b> (tolerance ±0.05).</p>
      <p class="hint">Tip: there are many solutions – can you find two different ones?</p>`,
    'lv1.noSecant': 'A = B:\\;\\text{no secant}',
    'lv1.success': 'Great! You brought the secant to a slope of 1.2.',
    'lv1.teaser':
      'Try this: slide B very close to A – the secant almost becomes a tangent. That is exactly what Level 2 is about!',

    'lv2.title': 'The Tangent',
    'lv2.info': `
      <h2>Level 2 · The Tangent</h2>
      <p>In Level 1 you met the secant. Now for the key idea of differential calculus:
      what happens when the second point <span class="tag-b">Q</span> moves closer and closer to
      <span class="tag-a">P</span> – when <b>h shrinks towards 0</b>?</p>
      <div class="formula" id="lv2-formula"></div>
      <p>The limit of this difference quotient is the <b>derivative</b> – the slope of the curve
      at a single point. The curve here is <span id="lv2-fx"></span>.</p>`,
    'lv2.sliderX': 'Point of tangency x₀',
    'lv2.sliderH': 'Distance h',
    'lv2.mission': `
      <h3>🎯 Mission</h3>
      <p>Let h shrink: push <b>h below 0.05</b> and reveal the hidden tangent.</p>
      <p class="hint">Watch the white secant settle as it shrinks – what is it approaching?</p>`,
    'lv2.success': 'Revealed! The secant has become the tangent – its slope is the derivative.',
    'lv2.teaser':
      'Now move x₀: the tangent travels along and its slope changes from point to point. That “slope function” is the topic of Level 3!',

    'lv3.title': 'The Derivative Function',
    'lv3.info': `
      <h2>Level 3 · The Derivative Function</h2>
      <p>In Level 2 you discovered the derivative <b>at one point</b>. But the slope changes
      from point to point – it is itself a <b>function</b>: the derivative function
      <span id="lv3-fp-sym"></span>.</p>
      <p>Sweep <span class="tag-a">P</span> along the curve <span id="lv3-fx"></span>.
      Every point leaves a <span class="tag-b">trace</span> at the height of its slope –
      you are drawing the derivative yourself!</p>
      <div class="formula" id="lv3-reveal"></div>`,
    'lv3.slider': 'Point P (x value)',
    'lv3.mission': `
      <h3>🎯 Mission</h3>
      <p>Draw the complete derivative function: sweep P across the <b>entire curve</b>
      (coverage ≥ 95 %).</p>
      <p class="hint">Watch the trace: where is it above the x-axis, where below – and what is f doing there?</p>`,
    'lv3.coverage': 'Coverage: {pct} %',
    'lv3.success': 'You traced the derivative function – a parabola!',
    'lv3.teaser':
      'Look closely: where f′ crosses the x-axis (f′ = 0), f has a peak or a valley. Next we flip the question: from slope back to area – Level 4!',

    'lv4.title': 'Area Under the Curve',
    'lv4.info': `
      <h2>Level 4 · Area Under the Curve</h2>
      <p>How do you measure a <b>curved area</b>? The trick of integral calculus: pave it
      with rectangles whose height follows the function – then make them ever narrower.</p>
      <div class="formula" id="lv4-formula"></div>
      <p>The blue ghost solid is the exact area. Stack blocks and choose where each block
      touches the curve (sample point).</p>
      <div class="formula" id="lv4-reveal"></div>`,
    'lv4.slider': 'Number of blocks n',
    'lv4.ruleCaption': 'Sample point: where does each block touch the curve?',
    'lv4.left': 'Left',
    'lv4.mid': 'Middle',
    'lv4.right': 'Right',
    'lv4.mission': `
      <h3>🎯 Mission</h3>
      <p>Approximate the area so well that the <b>error drops below 0.5 %</b>.</p>
      <p class="hint">Try all three sample points: which rule needs the fewest blocks – and why?</p>`,
    'lv4.success': 'The blocks hug the curve – you captured the integral!',
    'lv4.teaser':
      'Remember: “middle” almost always wins – the overhangs left and right cancel out. In Level 5 we spin areas into solid bodies!',

    'lv5.title': 'Solids of Revolution',
    'lv5.info': `
      <h2>Level 5 · Solids of Revolution</h2>
      <p>Let the blue profile curve <b>rotate</b> around the x-axis – the area becomes a solid,
      like on a potter's wheel. Its volume comes from the <b>disk method</b>: every thin
      slice is (almost) a cylinder with radius f(x):</p>
      <div class="formula" id="lv5-formula"></div>
      <p>First spin it, then fill it with disks and capture the volume.</p>
      <div class="formula" id="lv5-reveal"></div>`,
    'lv5.sliderSweep': 'Rotation angle',
    'lv5.sliderN': 'Number of disks n',
    'lv5.mission': `
      <h3>🎯 Mission</h3>
      <p>1. Spin the area <b>all the way around</b> (360°).<br>
      2. Push the disk error <b>below 1 %</b>.</p>
      <p class="hint">Rotate the scene with your mouse – you can see the disks inside the solid.</p>`,
    'lv5.success': "Potter's wheel mastered – area spun, volume captured!",
    'lv5.teaser':
      'So far everything lived in the plane and we rotated it. In Level 6 the function itself becomes three-dimensional: f(x, y) – an entire landscape!',

    'lv6.title': 'Landscapes: f(x, y)',
    'lv6.info': `
      <h2>Level 6 · Landscapes: f(x, y)</h2>
      <p>A function with <b>two</b> inputs is a landscape: above every point (x, y) sits the height
      <span id="lv6-f"></span>. Slope now exists <b>per direction</b> – these are the
      <b>partial derivatives</b>:</p>
      <div class="formula" id="lv6-formula"></div>
      <p>The <span class="tag-a">blue</span> slice curve keeps y fixed, the
      <span class="tag-b">yellow</span> one keeps x fixed. The two tangents at P show each slope.</p>
      <div class="formula" id="lv6-reveal"></div>`,
    'lv6.formulaLatex':
      '\\frac{\\partial f}{\\partial x}: \\text{slope in x-direction}, \\qquad \\frac{\\partial f}{\\partial y}: \\text{slope in y-direction}',
    'lv6.sliderX': 'Position x',
    'lv6.sliderY': 'Position y',
    'lv6.mission': `
      <h3>🎯 Mission</h3>
      <p>Find a <b>flat point</b> of the landscape: both partial derivatives
      ≤ 0.05 in absolute value.</p>
      <p class="hint">There are peaks, valleys – and saddle points that climb in one direction and
      descend in the other. Where do both tangents become horizontal?</p>`,
    'lv6.star': '★ critical point',
    'lv6.success': 'Flat point found – both partial derivatives vanish here!',
    'lv6.teaser':
      'Both slopes together form a vector: the gradient ∇f. It always points uphill – and that is exactly what we play with in Level 7!',

    'lv7.title': 'The Gradient',
    'lv7.info': `
      <h2>Level 7 · The Gradient</h2>
      <p>All slopes of a landscape live in <b>one</b> vector – the gradient:</p>
      <div class="formula" id="lv7-formula"></div>
      <p>It always points in the direction of <b>steepest ascent</b>. Your climber may only move
      like this: one step of length λ, always following the green arrow.</p>
      <div class="formula" id="lv7-reveal"></div>`,
    'lv7.slider': 'Step size λ',
    'lv7.stepBtn': '⬆ Gradient step',
    'lv7.respawnBtn': '🎲 Respawn',
    'lv7.mission': `
      <h3>🎯 Mission</h3>
      <p>Climb the <b>highest summit</b> (height ≥ 3.4) – using only gradient steps.</p>
      <p class="hint">Careful: the gradient only knows “uphill from here”. Not every hill
      it strands you on is THE summit …</p>`,
    'lv7.flag': '⛳ Summit',
    'lv7.you': 'You',
    'lv7.steps': 'Steps since start/respawn: {n}',
    'lv7.revealLatex': '\\text{At the summit: } \\nabla f = \\vec{0}',
    'lv7.success': 'Summit reached – in {n} steps! You have mastered gradient ascent.',
    'lv7.stuck':
      '⚠️ Local maximum! The gradient is zero up here, but it is not the highest point. Respawn and try from somewhere else.',
    'lv7.teaser':
      'This is exactly how neural networks train – just downhill: gradient descent on an error landscape with millions of dimensions. You have now seen the principle in 3D!',
  },
};

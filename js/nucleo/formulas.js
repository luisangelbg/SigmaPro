/* SigmaPro — fórmulas: un subconjunto de TeX convertido a MathML (sin bibliotecas).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las fichas de Fundamentos escriben sus modelos en TeX («y_{ij} = \mu + \tau_i + \varepsilon_{ij}») y aquí se vuelven
   MathML, que los navegadores dibujan sin nada que descargar (la app no hace peticiones fuera del equipo). Módulo puro,
   probado en node:

     SP.formulas.mathml(tex, { bloque })   → '<math …>…</math>'; lanza un Error si el TeX usa algo fuera del subconjunto
     SP.formulas.texto(tex)                → la fórmula en texto plano (para el reporte y los lectores sin MathML)
     SP.formulas.omml(tex, { bloque })     → la fórmula como ecuación de Word (Office Math, OMML) para el .docx (hito 5.8)

   El subconjunto: letras y números, ^{} _{}, \frac{}{}, \sqrt{}, \sum \prod con límites, \bar \hat \tilde \overline,
   griegas, \cdot \times \pm \sim \le \ge \ne \approx \to \in \mid \infty \partial \ldots \cdots, \log \exp \ln \max
   \min, \text{} \mathrm{} \mathbf{} \mathcal{}, \left( \right), ( ) [ ] \{ \} | , = + - < > y \quad. */
SP.definir('formulas', function (SP) {
  'use strict';
  const GRIEGAS = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ',
    iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ',
    chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
  const OPERADORES = { cdot: '·', times: '×', pm: '±', mp: '∓', sim: '∼', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈',
    to: '→', rightarrow: '→', leftarrow: '←', in: '∈', notin: '∉', mid: '∣', propto: '∝', equiv: '≡', ldots: '…', cdots: '⋯', infty: '∞',
    partial: '∂', forall: '∀', exists: '∃', cup: '∪', cap: '∩', subset: '⊂', setminus: '∖', prime: '′', vert: '|' };
  const FUNCIONES = ['log', 'exp', 'ln', 'max', 'min', 'sin', 'cos', 'logit', 'var', 'cov', 'E', 'det', 'tr'];
  const GRANDES = { sum: '∑', prod: '∏', int: '∫' };
  const ACENTOS = { bar: '¯', hat: '^', tilde: '~', overline: '¯', vec: '→', dot: '˙' };
  const CALIGRAFICAS = { N: '𝒩', L: 'ℒ', E: 'ℰ', F: 'ℱ', B: 'ℬ', O: '𝒪', P: '𝒫', R: 'ℛ', I: 'ℐ', M: 'ℳ' };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- léxico ---------------- */
  function fichas(tex) {
    const out = [];
    let i = 0;
    const poner = (f, largo) => { f.i = i; f.f = i + largo; out.push(f); i += largo; };
    while (i < tex.length) {
      const c = tex[i];
      if (c === '\\') {
        const m = /^\\([A-Za-z]+|.)/.exec(tex.slice(i));
        poner({ t: 'cmd', v: m[1] }, m[0].length);
      } else if (/\s/.test(c)) { i++; }
      else if (/[0-9.]/.test(c)) { const m = /^[0-9]+(\.[0-9]+)?|^\./.exec(tex.slice(i)); poner({ t: 'num', v: m[0] }, m[0].length); }
      else if (/[A-Za-z]/.test(c)) poner({ t: 'id', v: c }, 1);
      else if (c === '{' || c === '}' || c === '^' || c === '_') poner({ t: c }, 1);
      else poner({ t: 'op', v: c }, 1);
    }
    return out;
  }

  /* ---------------- sintaxis: una lista de átomos con sus índices ---------------- */
  function parser(tex) {
    const F = fichas(tex);
    let k = 0;
    const ver = () => F[k], tomar = () => F[k++];
    const fallo = m => { throw new Error('Fórmula: ' + m + ' en «' + tex + '»'); };
    function grupo() {                                   // { … } o un solo átomo
      const f = ver();
      if (!f) fallo('falta un argumento');
      if (f.t === '{') { tomar(); const l = lista('}'); if (!ver() || ver().t !== '}') fallo('falta }'); tomar(); return { t: 'row', l }; }
      return atomo();
    }
    function textoCrudo() {                              // el contenido de \text{…} tal cual, con sus espacios
      if (!ver() || ver().t !== '{') fallo('\\text sin {');
      const abre = tomar();
      let prof = 1, cierra = null;
      while (k < F.length && prof > 0) {
        const f = tomar();
        if (f.t === '{') prof++;
        else if (f.t === '}' && --prof === 0) cierra = f;
      }
      if (!cierra) fallo('\\text sin }');
      return tex.slice(abre.f, cierra.i).replace(/\\([%_&#$ ,;])/g, (m, c) => (c === ',' || c === ';' ? ' ' : c));
    }
    function atomo() {
      const f = tomar();
      if (!f) fallo('fin inesperado');
      if (f.t === 'num') return { t: 'mn', v: f.v };
      if (f.t === 'id') return { t: 'mi', v: f.v };
      if (f.t === 'op') {
        if (f.v === '(' || f.v === ')' || f.v === '[' || f.v === ']' || f.v === '|') return { t: 'mo', v: f.v, cerco: true };
        return { t: 'mo', v: f.v === '-' ? '−' : f.v === '*' ? '∗' : f.v === "'" ? '′' : f.v };
      }
      if (f.t === '{') { k--; return grupo(); }
      if (f.t === 'cmd') {
        const c = f.v;
        if (GRIEGAS[c]) return { t: 'mi', v: GRIEGAS[c], normal: /^[A-Z]/.test(c) };
        if (OPERADORES[c]) return { t: 'mo', v: OPERADORES[c] };
        if (GRANDES[c]) return { t: 'mo', v: GRANDES[c], grande: true };
        if (FUNCIONES.includes(c)) return { t: 'mi', v: c, normal: true, funcion: true };
        if (c === '{' || c === '}') return { t: 'mo', v: c, cerco: true };
        if (c === ',' || c === ';' || c === ' ' || c === '!') return { t: 'espacio', v: c === '!' ? '-0.1667em' : c === ',' ? '0.1667em' : c === ';' ? '0.2778em' : '0.2222em' };
        if (c === 'quad') return { t: 'espacio', v: '1em' };
        if (c === 'qquad') return { t: 'espacio', v: '2em' };
        if (c === '%') return { t: 'mo', v: '%' };
        if (c === 'frac') return { t: 'frac', a: grupo(), b: grupo() };
        if (c === 'sqrt') return { t: 'sqrt', a: grupo() };
        if (ACENTOS[c]) return { t: 'acento', a: grupo(), v: ACENTOS[c], ancho: c === 'overline' };
        if (c === 'text' || c === 'mathrm' || c === 'operatorname') return { t: 'mtext', v: textoCrudo(), rm: c !== 'text' };
        if (c === 'mathbf') return { t: 'estilo', a: grupo(), v: 'bold' };
        if (c === 'mathcal') { const g = grupo(); const l = g.t === 'row' ? g.l : [g]; return { t: 'row', l: l.map(x => (x.t === 'mi' && CALIGRAFICAS[x.v] ? { t: 'mi', v: CALIGRAFICAS[x.v], normal: true } : x)) }; }
        if (c === 'left' || c === 'right') { const d = tomar(); if (!d) fallo('\\' + c + ' sin delimitador'); const v = d.t === 'cmd' ? (d.v === '{' ? '{' : d.v === '}' ? '}' : d.v === '|' ? '‖' : '') : d.v; return { t: 'mo', v: v === '.' ? '' : v, cerco: true, estira: true }; }
        fallo('comando desconocido \\' + c);
      }
      fallo('símbolo inesperado ' + f.t);
    }
    function lista(fin) {
      const l = [];
      while (k < F.length && !(fin && ver().t === fin)) {
        if (ver().t === '}') fallo('} de más');
        let base = atomo();
        let sub = null, sup = null;
        while (ver() && (ver().t === '_' || ver().t === '^')) {
          const op = tomar().t;
          const arg = grupo();
          if (op === '_') { if (sub) fallo('dos subíndices'); sub = arg; } else { if (sup) fallo('dos superíndices'); sup = arg; }
        }
        l.push(sub || sup ? { t: 'script', base, sub, sup } : base);
      }
      return l;
    }
    const l = lista(null);
    if (k < F.length) fallo('sobra «' + (F[k].v || F[k].t) + '»');
    return l;
  }

  /* ---------------- MathML ---------------- */
  function ml(n) {
    switch (n.t) {
      case 'row': return '<mrow>' + n.l.map(ml).join('') + '</mrow>';
      case 'mn': return '<mn>' + esc(n.v) + '</mn>';
      case 'mi': return n.normal || n.v.length > 1 ? '<mi mathvariant="normal">' + esc(n.v) + '</mi>' + (n.funcion ? '<mo>&#x2061;</mo>' : '') : '<mi>' + esc(n.v) + '</mi>';
      case 'mo': return '<mo' + (n.grande ? ' largeop="true"' : '') + (n.cerco ? (n.estira ? ' stretchy="true"' : ' stretchy="false"') : '') + '>' + esc(n.v) + '</mo>';
      /* los espacios al principio o al final de \text{…} se pierden en MathML: van como mspace */
      case 'mtext': {
        if (n.rm) return '<mi mathvariant="normal">' + esc(n.v) + '</mi>';
        const ini = /^\s/.test(n.v), fin = /\s$/.test(n.v), sp = '<mspace width="0.3em"/>';
        return (ini ? sp : '') + '<mtext>' + esc(n.v.trim()) + '</mtext>' + (fin ? sp : '');
      }
      case 'espacio': return '<mspace width="' + n.v + '"/>';
      case 'frac': return '<mfrac>' + ml(n.a) + ml(n.b) + '</mfrac>';
      case 'sqrt': return '<msqrt>' + ml(n.a) + '</msqrt>';
      case 'acento': return '<mover accent="true">' + ml(n.a) + '<mo' + (n.ancho ? ' stretchy="true"' : '') + '>' + esc(n.v) + '</mo></mover>';
      case 'estilo': return '<mstyle mathvariant="bold">' + ml(n.a) + '</mstyle>';
      case 'script': {
        const b = ml(n.base), lim = n.base.t === 'mo' && n.base.grande;
        if (n.sub && n.sup) return (lim ? '<munderover>' : '<msubsup>') + b + ml(n.sub) + ml(n.sup) + (lim ? '</munderover>' : '</msubsup>');
        if (n.sub) return (lim ? '<munder>' : '<msub>') + b + ml(n.sub) + (lim ? '</munder>' : '</msub>');
        return (lim ? '<mover>' : '<msup>') + b + ml(n.sup) + (lim ? '</mover>' : '</msup>');
      }
    }
    throw new Error('Fórmula: nodo ' + n.t);
  }
  function texto(n) {
    switch (n.t) {
      case 'row': return n.l.map(texto).join('');
      case 'mn': case 'mi': case 'mo': return n.v + (n.funcion ? ' ' : '');
      case 'mtext': return n.v;
      case 'espacio': return ' ';
      case 'frac': return '(' + texto(n.a) + ')/(' + texto(n.b) + ')';
      case 'sqrt': return '√(' + texto(n.a) + ')';
      case 'acento': return texto(n.a) + n.v;
      case 'estilo': return texto(n.a);
      case 'script': return texto(n.base) + (n.sub ? '_' + envolver(texto(n.sub)) : '') + (n.sup ? '^' + envolver(texto(n.sup)) : '');
    }
    return '';
  }
  const envolver = s => (s.length > 1 ? '(' + s + ')' : s);

  /* ---------------- Office Math (OMML), para el .docx ---------------- */
  /* los acentos de OMML son caracteres combinantes */
  const COMBINANTES = { '¯': '\u0304', '^': '\u0302', '~': '\u0303', '→': '\u20D7', '˙': '\u0307' };
  const corrida = (v, op) => {
    const sty = op.negrita ? (op.recto ? 'b' : 'bi') : op.recto ? 'p' : '';
    const rPr = op.nor ? '<m:rPr><m:nor/></m:rPr>' : sty ? `<m:rPr><m:sty m:val="${sty}"/></m:rPr>` : '';
    return `<m:r>${rPr}<m:t xml:space="preserve">${esc(v)}</m:t></m:r>`;
  };
  function om(n, est) {
    const neg = !!(est && est.negrita);
    switch (n.t) {
      case 'row': return n.l.map(x => om(x, est)).join('');
      case 'mn': return corrida(n.v, { recto: true, negrita: neg });
      case 'mi': return corrida(n.v, { recto: !!(n.normal || n.v.length > 1), negrita: neg }) + (n.funcion ? corrida(' ', { recto: true }) : '');
      case 'mo': return corrida(n.v, { recto: true, negrita: neg });
      case 'mtext': return n.rm ? corrida(n.v, { recto: true, negrita: neg }) : corrida(n.v, { nor: true });
      case 'espacio': return /^-/.test(n.v) ? '' : corrida(parseFloat(n.v) >= 1 ? '\u2003' : '\u2009', { recto: true });
      case 'frac': return `<m:f><m:num>${om(n.a, est)}</m:num><m:den>${om(n.b, est)}</m:den></m:f>`;
      case 'sqrt': return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${om(n.a, est)}</m:e></m:rad>`;
      case 'acento': return n.ancho ? `<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>${om(n.a, est)}</m:e></m:bar>`
        : `<m:acc><m:accPr><m:chr m:val="${COMBINANTES[n.v] || n.v}"/></m:accPr><m:e>${om(n.a, est)}</m:e></m:acc>`;
      case 'estilo': return om(n.a, { negrita: true });
      case 'script': {
        const b = om(n.base, est);
        /* los límites de ∑ y ∏ van debajo y encima */
        if (n.base.t === 'mo' && n.base.grande) {
          let x = b;
          if (n.sub) x = `<m:limLow><m:e>${x}</m:e><m:lim>${om(n.sub, est)}</m:lim></m:limLow>`;
          if (n.sup) x = `<m:limUpp><m:e>${x}</m:e><m:lim>${om(n.sup, est)}</m:lim></m:limUpp>`;
          return x;
        }
        if (n.sub && n.sup) return `<m:sSubSup><m:e>${b}</m:e><m:sub>${om(n.sub, est)}</m:sub><m:sup>${om(n.sup, est)}</m:sup></m:sSubSup>`;
        if (n.sub) return `<m:sSub><m:e>${b}</m:e><m:sub>${om(n.sub, est)}</m:sub></m:sSub>`;
        return `<m:sSup><m:e>${b}</m:e><m:sup>${om(n.sup, est)}</m:sup></m:sSup>`;
      }
    }
    throw new Error('Fórmula: nodo ' + n.t);
  }
  /** El TeX como ecuación de Word: <m:oMath> (en línea) o, con { bloque: true }, <m:oMathPara> en su propio párrafo. El
      prefijo m: es el espacio de nombres de Office Math, que el documento declara. */
  function omml(tex, op) {
    const m = '<m:oMath>' + parser(String(tex || '')).map(x => om(x)).join('') + '</m:oMath>';
    return op && op.bloque ? '<m:oMathPara>' + m + '</m:oMathPara>' : m;
  }

  /** El TeX en MathML; con { bloque: true }, centrado en su propio renglón. */
  function mathml(tex, op) {
    const l = parser(String(tex || ''));
    const plano = l.map(texto).join('').replace(/\s+/g, ' ').trim();
    return '<math xmlns="http://www.w3.org/1998/Math/MathML"' + (op && op.bloque ? ' display="block"' : '') + ' aria-label="' + esc(plano).replace(/"/g, '&quot;') + '"><mrow>' + l.map(ml).join('') + '</mrow></math>';
  }
  SP.formulas = { mathml, omml, texto: tex => parser(String(tex || '')).map(texto).join('').replace(/\s+/g, ' ').trim() };
});

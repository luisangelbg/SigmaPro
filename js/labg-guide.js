/* LABG Suite — LABGuide 1.2.0: medidores y curvas de referencia para leer estadísticos
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán
   This program is free software: you can redistribute it and/or modify it under
   the terms of the GNU General Public License as published by the Free Software
   Foundation, either version 3 of the License, or (at your option) any later
   version. It is distributed in the hope that it will be useful, but WITHOUT ANY
   WARRANTY; see the GNU General Public License, in the file LICENSE at the root
   of this program, or <https://www.gnu.org/licenses/>.

   Qué hace
   --------
   Dibuja, sin bibliotecas y sin pedir nada a internet, dos piezas para leer un número:
     1. Medidor  una regla con zonas (de una guía publicada) y una o varias marcas. Con una marca es un role="meter"
                 con su texto; con varias, una imagen descrita y la lista de valores con su zona.
     2. Curva    la densidad de referencia (t, F, χ² o normal) con el valor crítico, el observado y el área del p
                 sombreada, para ver dónde cae el estadístico de una prueba.
     3. Tarjeta  (1.1.0) bajo un medidor, los párrafos que lo interpretan con los números del caso y, plegado, qué es
                 el estadístico; bajo una curva, una frase de lectura.
     4. Panel    (1.2.0) varias reglas en un solo SVG con sus colores fijos (el tema claro), para un documento
                 exportado: el nombre, la regla con la marca y el valor con su zona en cada renglón.
   No sabe de ningún análisis en particular: la app le pasa la escala (límites, zonas y fuente) y los valores. Los
   colores salen de las variables de css/labg-guide.css, que siguen el tema claro u oscuro de la app.

   Uso
   ---
     LABGuide.medidor({ min, max, eje, zonas: [{ hasta, etiqueta, tono }], marcas: [{ valor, etiqueta }],
                        referencias: [{ valor, etiqueta }], formato, formatoEje, titulo, fuente, nota,
                        tarjeta: { textos: [párrafo…], que: { titulo, texto }, extra: HTML } })      → HTML
     LABGuide.curva({ dist: 't' | 'F' | 'chi2' | 'z', gl1, gl2, observado, criticos: [x…], colas: 'derecha' |
                      'izquierda' | 'dos', p, alfa, titulo, formato, lectura })                   → HTML
   En la tarjeta, «extra» es HTML de la app (ya escapado) que va al final, como un formulario para ajustar la guía.
     LABGuide.densidad(dist, x, gl1, gl2)                                                          → número
     LABGuide.panel([{ titulo, valor, escala, formato, formatoEje }], { titulo })  → { svg, ancho, alto, descripcion, textos, n }
   eje: 'lineal', 'log', 'abs' (el valor absoluto) o 'logabs' (una razón: 1/2 se lee como 2). tono: 'n0' a 'n3'
   (magnitud) u 'ok', 'ok2' (bien, más claro), 'aviso', 'mal' (calidad). Los textos propios siguen el idioma de <html lang>. */
(function (raiz) {
  'use strict';
  if (raiz.LABGuide && raiz.LABGuide.version) return;
  const VERSION = '1.2.0';
  const en = () => typeof document !== 'undefined' && (document.documentElement.lang || 'es').slice(0, 2) === 'en';
  const tx = (es, ing) => (en() ? ing : es);
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  let serie = 0;
  const uid = p => 'lg' + p + (++serie);
  const num = (v, d) => (Number.isFinite(v) ? (Math.abs(v) >= 1000 || (Math.abs(v) > 0 && Math.abs(v) < 0.001) ? v.toPrecision(3) : v.toFixed(d == null ? 3 : d)).replace(/^-/, '−') : '—');

  /* ---------------- densidades (las curvas no dependen de la app) ---------------- */
  /* log Γ(x) por la aproximación de Lanczos (g = 7, 9 coeficientes): error relativo cerca de 1e-15 */
  const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    let a = LANCZOS[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  const lbeta = (a, b) => lgamma(a) + lgamma(b) - lgamma(a + b);
  function densidad(dist, x, a, b) {
    if (!Number.isFinite(x)) return 0;
    if (dist === 'z' || (dist === 't' && !(a < Infinity))) return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
    if (dist === 't') return Math.exp(lgamma((a + 1) / 2) - lgamma(a / 2) - 0.5 * Math.log(a * Math.PI) - (a + 1) / 2 * Math.log1p(x * x / a));
    if (dist === 'chi2') {
      if (x < 0) return 0;
      if (x === 0) return a === 2 ? 0.5 : a < 2 ? Infinity : 0;
      return Math.exp((a / 2 - 1) * Math.log(x) - x / 2 - (a / 2) * Math.LN2 - lgamma(a / 2));
    }
    if (dist === 'F') {
      if (x < 0) return 0;
      if (!(b < Infinity)) return a * densidad('chi2', a * x, a);
      if (x === 0) return a === 2 ? 1 : a < 2 ? Infinity : 0;
      return Math.exp(0.5 * (a * Math.log(a * x) + b * Math.log(b) - (a + b) * Math.log(a * x + b)) - Math.log(x) - lbeta(a / 2, b / 2));
    }
    return NaN;
  }

  /* ---------------- medidor ---------------- */
  const W = 360, BAR_Y = 20, BAR_H = 11;
  /** La posición (0 a 1) de un valor en la escala. */
  function posicion(o, v) {
    const lee = o.eje === 'abs' ? Math.abs(v) : o.eje === 'logabs' ? (v > 0 ? Math.max(v, 1 / v) : NaN) : v;
    if (!Number.isFinite(lee)) return NaN;
    let t;
    if (o.eje === 'log' || o.eje === 'logabs') {
      const lo = Math.log(Math.max(o.min, 1e-300)), hi = Math.log(o.max);
      t = (Math.log(Math.max(lee, o.min)) - lo) / (hi - lo);
    } else t = (lee - o.min) / (o.max - o.min);
    return Math.max(0, Math.min(1, t));
  }
  const zonaDe = (o, v) => {
    const lee = o.eje === 'abs' ? Math.abs(v) : o.eje === 'logabs' ? Math.max(v, 1 / v) : v;
    let i = o.zonas.findIndex(q => (o.inclusivo && !q.estricta ? lee <= q.hasta : lee < q.hasta));
    return i < 0 ? o.zonas.length - 1 : i;
  };
  /**
   * Una regla con zonas y marcas. Con una marca, el contenedor es role="meter"; con varias, la regla es una imagen
   * descrita y debajo va la lista de valores (o, si son muchas, cuántas caen en cada zona).
   */
  function medidor(o) {
    const fmt = o.formato || (v => num(v)), fmtEje = o.formatoEje || fmt;
    const zonas = o.zonas || [], marcas = (o.marcas || []).filter(m => Number.isFinite(m.valor));
    const x = t => 8 + t * (W - 16);
    /* los rótulos de los cortes no se enciman: uno que no cabe junto al anterior (o junto a los extremos) se omite;
       la raya del corte se queda */
    let ini = 0, svg = '', ultimo = 8 + 18;
    zonas.forEach((q, i) => {
      const fin = i === zonas.length - 1 ? 1 : posicion(o, q.hasta);
      if (fin > ini) svg += `<rect class="lg-z lg-${esc(q.tono || 'n0')}" x="${x(ini).toFixed(1)}" y="${BAR_Y}" width="${(x(fin) - x(ini)).toFixed(1)}" height="${BAR_H}"/>`;
      if (i < zonas.length - 1 && fin > 0 && fin < 1) {
        svg += `<line class="lg-corte" x1="${x(fin).toFixed(1)}" x2="${x(fin).toFixed(1)}" y1="${BAR_Y - 3}" y2="${BAR_Y + BAR_H + 3}"/>`;
        const rot = fmtEje(q.hasta), ancho = 3.4 * String(rot).length + 6;
        if (x(fin) - ancho / 2 > ultimo + 4 && x(fin) + ancho / 2 < W - 8 - 18) {
          svg += `<text class="lg-num" x="${x(fin).toFixed(1)}" y="${BAR_Y + BAR_H + 16}" text-anchor="middle">${esc(rot)}</text>`;
          ultimo = x(fin) + ancho / 2;
        }
      }
      ini = Math.max(ini, fin);
    });
    (o.referencias || []).forEach(r => {
      const t = posicion(o, r.valor);
      if (Number.isFinite(t)) svg += `<line class="lg-ref" x1="${x(t).toFixed(1)}" x2="${x(t).toFixed(1)}" y1="${BAR_Y - 8}" y2="${BAR_Y + BAR_H + 4}"/>`;
    });
    /* las marcas: un triángulo sobre la regla (si son muchas, puntos) */
    const muchas = marcas.length > 12;
    marcas.forEach(m => {
      const t = posicion(o, m.valor);
      if (!Number.isFinite(t)) return;
      const cx = x(t);
      svg += muchas ? `<circle class="lg-marca" cx="${cx.toFixed(1)}" cy="${BAR_Y - 6}" r="3"/>`
        : `<path class="lg-marca" d="M${(cx - 6).toFixed(1)} ${BAR_Y - 11}L${(cx + 6).toFixed(1)} ${BAR_Y - 11}L${cx.toFixed(1)} ${BAR_Y - 1}Z"/>`;
    });
    const extremos = `<text class="lg-num" x="8" y="${BAR_Y + BAR_H + 16}">${esc(o.etiquetaMin || fmtEje(o.min))}</text>` +
      `<text class="lg-num" x="${W - 8}" y="${BAR_Y + BAR_H + 16}" text-anchor="end">${esc(o.etiquetaMax || fmtEje(o.max) + (o.abierto ? '+' : ''))}</text>`;
    const textoMarca = m => (m.etiqueta ? m.etiqueta + ': ' : '') + fmt(m.valor) + ' — ' + zonas[zonaDe(o, m.valor)].etiqueta;
    const leyenda = '<ul class="lg-zonas">' + zonas.map(q => `<li><span class="lg-cuadrito lg-${esc(q.tono || 'n0')}" aria-hidden="true"></span>${esc(q.etiqueta)}</li>`).join('') + '</ul>';
    let lista = '';
    if (marcas.length > 1 && marcas.length <= 12) lista = '<ul class="lg-marcas">' + marcas.map(m => `<li>${esc(textoMarca(m))}</li>`).join('') + '</ul>';
    else if (marcas.length > 12) {
      const k = zonas.map(() => 0);
      marcas.forEach(m => { k[zonaDe(o, m.valor)]++; });
      lista = `<p class="lg-resumen">${esc(tx('{n} valores: ', '{n} values: ').replace('{n}', marcas.length) + zonas.map((q, i) => (k[i] ? k[i] + ' ' + q.etiqueta : '')).filter(Boolean).join('; '))}.</p>`;
    }
    const id = uid('m'), titulo = o.titulo ? `<p class="lg-tit" id="${id}">${esc(o.titulo)}</p>` : '';
    const vb = `viewBox="0 0 ${W} ${BAR_Y + BAR_H + 22}"`;
    const fuente = o.fuente ? `<p class="lg-fuente">${esc(tx('Guía: ', 'Guide: ') + o.fuente)}${o.nota ? ' · ' + esc(o.nota) : ''}</p>` : '';
    /* la tarjeta va fuera del role="meter": un medidor no puede tener controles dentro (el «¿Qué es?» se despliega) */
    const t = o.tarjeta || {};
    const tarjeta = (t.textos && t.textos.length) || t.que || t.extra ? `<div class="lg-tarjeta">${(t.textos || []).map(x => `<p>${esc(x)}</p>`).join('')}` +
      (t.que && t.que.texto ? `<details class="lg-que"><summary>${esc(t.que.titulo || tx('¿Qué es?', 'What is it?'))}</summary><p>${esc(t.que.texto)}</p></details>` : '') + (t.extra || '') + '</div>' : '';
    if (marcas.length === 1) {
      const m = marcas[0];
      return `<div class="lg-medidor"><div class="lg-meter" role="meter" aria-valuemin="${o.min}" aria-valuemax="${o.max}" aria-valuenow="${Math.max(o.min, Math.min(o.max, o.eje === 'abs' ? Math.abs(m.valor) : o.eje === 'logabs' ? Math.max(m.valor, 1 / m.valor) : m.valor))}"` +
        ` aria-valuetext="${esc(textoMarca(m))}"${titulo ? ` aria-labelledby="${id}"` : ''}>${titulo}<p class="lg-valor">${esc(textoMarca(m))}</p>` +
        `<svg class="lg-regla" ${vb} aria-hidden="true" focusable="false">${svg}${extremos}</svg></div>${leyenda}${tarjeta}${fuente}</div>`;
    }
    const desc = (o.titulo ? o.titulo + '. ' : '') + tx('Regla de {a} a {b} con zonas: ', 'Scale from {a} to {b} with zones: ').replace('{a}', fmt(o.min)).replace('{b}', fmt(o.max)) + zonas.map(q => q.etiqueta).join(', ') + '.';
    return `<div class="lg-medidor">${titulo}<svg class="lg-regla" ${vb} role="img" aria-label="${esc(desc)}" focusable="false">${svg}${extremos}</svg>${lista}${leyenda}${tarjeta}${fuente}</div>`;
  }

  /* ---------------- curva de referencia ---------------- */
  const CW = 320, CH = 150, M = { l: 10, r: 10, t: 22, b: 30 };
  /**
   * La densidad de referencia con el valor observado, el o los valores críticos (al α dado) y el área del p
   * sombreada (la cola o las colas más allá de lo observado).
   */
  function curva(o) {
    const d = o.dist, a = o.gl1, b = o.gl2, obs = o.observado, fmt = o.formato || (v => num(v, 2));
    const crit = (o.criticos || []).filter(Number.isFinite);
    let x0, x1;
    if (d === 'z' || d === 't') {
      const lim = Math.max(4, Math.min(6.5, Math.abs(obs) + 0.6), ...crit.map(c => Math.abs(c) + 0.6));
      x0 = -lim; x1 = lim;
    } else if (d === 'chi2') {
      x0 = 0; x1 = Math.max(a + 4.5 * Math.sqrt(2 * a), 6, ...crit.map(c => c * 1.35));
      if (obs > x1 && obs < x1 * 1.6) x1 = obs * 1.08;
    } else {
      x0 = 0; x1 = Math.max(4, ...crit.map(c => c * 1.7));
      if (obs > x1 && obs < x1 * 1.6) x1 = obs * 1.08;
    }
    const n = 140, xs = Array.from({ length: n + 1 }, (_, i) => x0 + (x1 - x0) * i / n);
    const ys = xs.map(v => densidad(d, v, a, b));
    /* el máximo para la escala vertical, sin los picos infinitos junto al 0 (χ² o F con 1 gl) */
    const finitos = ys.filter((v, i) => Number.isFinite(v) && i > 2);
    const ymax = Math.max(...finitos) * 1.08 || 1;
    const X = v => M.l + (v - x0) / (x1 - x0) * (CW - M.l - M.r), Y = v => CH - M.b - Math.min(v, ymax) / ymax * (CH - M.t - M.b);
    const pts = xs.map((v, i) => [X(v), Y(Number.isFinite(ys[i]) ? ys[i] : ymax)]);
    const linea = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    /* el área del p: la cola más allá de lo observado (o las dos colas) */
    const dentro = v => v >= x0 && v <= x1;
    const area = (desde, hasta) => {
      const seg = pts.filter((p, i) => xs[i] >= desde && xs[i] <= hasta);
      if (!seg.length) return '';
      const a0 = X(Math.max(desde, x0)), a1 = X(Math.min(hasta, x1));
      return `<path class="lg-area" d="M${a0.toFixed(1)} ${Y(0).toFixed(1)}L${seg.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')}L${a1.toFixed(1)} ${Y(0).toFixed(1)}Z"/>`;
    };
    let areas = '';
    if (Number.isFinite(obs)) {
      if (o.colas === 'dos') areas = area(Math.abs(obs), x1) + area(x0, -Math.abs(obs));
      else if (o.colas === 'izquierda') areas = area(x0, obs);
      else areas = area(obs, x1);
    }
    const eje = `<line class="lg-eje" x1="${M.l}" x2="${CW - M.r}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}"/>`;
    const marcasEje = [x0, (x0 + x1) / 2, x1].map(v => `<text class="lg-num" x="${X(v).toFixed(1)}" y="${CH - M.b + 13}" text-anchor="${v === x0 ? 'start' : v === x1 ? 'end' : 'middle'}">${esc(fmt(v))}</text>`).join('');
    const criticos = crit.filter(dentro).map(c => `<line class="lg-critico" x1="${X(c).toFixed(1)}" x2="${X(c).toFixed(1)}" y1="${M.t - 4}" y2="${Y(0).toFixed(1)}"/>`).join('');
    let observado = '';
    if (Number.isFinite(obs)) {
      if (dentro(obs)) observado = `<line class="lg-obs" x1="${X(obs).toFixed(1)}" x2="${X(obs).toFixed(1)}" y1="${M.t - 10}" y2="${Y(0).toFixed(1)}"/>` +
        `<text class="lg-num lg-obs-t" x="${X(obs).toFixed(1)}" y="${M.t - 13}" text-anchor="${X(obs) > CW - 50 ? 'end' : X(obs) < 50 ? 'start' : 'middle'}">${esc(fmt(obs))}</text>`;
      else {
        /* fuera de la gráfica: una flecha al borde con el valor */
        const der = obs > x1, xe = der ? CW - M.r : M.l;
        observado = `<text class="lg-num lg-obs-t" x="${xe}" y="${M.t - 6}" text-anchor="${der ? 'end' : 'start'}">${der ? esc(fmt(obs)) + ' →' : '← ' + esc(fmt(obs))}</text>`;
      }
    }
    const nombre = d === 'z' ? tx('normal estándar', 'standard normal') : d === 't' ? 't' + (Number.isFinite(a) ? ` (${tx('gl', 'df')} = ${fmt(a)})` : '')
      : d === 'chi2' ? `χ² (${tx('gl', 'df')} = ${fmt(a)})` : `F (${fmt(a)}, ${fmt(b)} ${tx('gl', 'df')})`;
    const pTxt = Number.isFinite(o.p) ? (o.p < 0.001 ? 'p < 0.001' : 'p = ' + o.p.toFixed(3)) : '';
    const alfa = Number.isFinite(o.alfa) ? o.alfa : 0.05;
    const critTxt = crit.length ? crit.map(c => fmt(c)).join(tx(' y ', ' and ')) : '';
    const fuera = Number.isFinite(obs) && !dentro(obs);
    const desc = tx('Distribución {d}: ', '{d} distribution: ').replace('{d}', nombre) +
      tx('el valor observado {o}', 'the observed value {o}').replace('{o}', fmt(obs)) +
      (critTxt ? tx(' frente al valor crítico {c} (α = {a})', ' against the critical value {c} (α = {a})').replace('{c}', critTxt).replace('{a}', alfa) : '') +
      (fuera ? tx(', fuera de la gráfica', ', beyond the plot') : '') + (pTxt ? tx('; el área sombreada es el ', '; the shaded area is the ') + pTxt : '') + '.';
    const svg = `<svg class="lg-curva" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="${esc(desc)}" focusable="false">${areas}<path class="lg-dens" d="${linea}"/>${eje}${criticos}${observado}${marcasEje}</svg>`;
    const pie = `<figcaption><span class="lg-cl"><span class="lg-cuadrito lg-area-c" aria-hidden="true"></span>${esc(tx('área = ', 'area = ') + (pTxt || 'p'))}</span>` +
      (critTxt ? ` <span class="lg-cl"><span class="lg-raya" aria-hidden="true"></span>${esc(tx('crítico ', 'critical ') + critTxt + ' (α = ' + alfa + ')')}</span>` : '') + '</figcaption>';
    return `<figure class="lg-curva-fig">${o.titulo ? `<p class="lg-tit">${esc(o.titulo)}</p>` : ''}${svg}${pie}${o.lectura ? `<p class="lg-curva-lee">${esc(o.lectura)}</p>` : ''}</figure>`;
  }

  /* ---------------- panel para documentos (1.2.0) ---------------- */
  /* Colores fijos del tema claro: el panel va en un documento (HTML, PDF, .docx), sin la hoja de estilo de la app. */
  const TONOS = { n0: '#f1e9d2', n1: '#e2cd8f', n2: '#c9a227', n3: '#8c6d1a', ok: '#2f7d4f', ok2: '#9ccfaa', aviso: '#c98a12', mal: '#b3261e' };
  const P = { ancho: 640, fila: 38, etq: 206, x0: 214, x1: 452, val: 466, texto: '#1d1d1b', tenue: '#5c5a54', linea: '#d8d2c4', letra: 'Helvetica, Arial, sans-serif' };
  const corta = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  /* un texto en dos renglones de hasta n caracteres, por palabras (lo que no cabe en el segundo se corta con «…») */
  function partir(s, n) {
    const palabras = String(s == null ? '' : s).split(/\s+/).filter(Boolean), out = [''];
    for (const w of palabras) {
      const i = out.length - 1, prueba = out[i] ? out[i] + ' ' + w : w;
      if (prueba.length <= n || !out[i]) out[i] = prueba;
      else if (out.length < 2) out.push(w);
      else { out[i] = prueba; }
    }
    return out.map(x => corta(x, n));
  }
  /**
   * Varias reglas, una por renglón, en un solo SVG con sus colores: el nombre del estadístico a la izquierda, la regla
   * con sus zonas y la marca al centro, y el valor con su zona a la derecha. Para el reporte exportado.
   *   filas: [{ titulo, valor, escala: { min, max, eje, zonas, inclusivo, abierto, etiquetaMin, etiquetaMax },
   *            formato, formatoEje }]
   * → { svg, ancho, alto, descripcion }
   */
  function panel(filas, o) {
    o = o || {};
    const lista = (filas || []).filter(f => f && f.escala && Number.isFinite(f.valor) && (f.escala.zonas || []).length);
    const alto = lista.length * P.fila + 4;
    const x = t => P.x0 + t * (P.x1 - P.x0);
    const txt = (cx, cy, s, a) => `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" font-family="${P.letra}" font-size="${a.tam || 11}" fill="${a.color || P.texto}"${a.fin ? ' text-anchor="' + a.fin + '"' : ''}${a.negrita ? ' font-weight="bold"' : ''}>${esc(s)}</text>`;
    const desc = [];
    let svg = '';
    lista.forEach((f, k) => {
      const e = f.escala, y0 = k * P.fila + 2, by = y0 + 11, bh = 10;
      const fmt = f.formato || (v => num(v)), fmtEje = f.formatoEje || fmt;
      const zona = e.zonas[zonaDe(e, f.valor)];
      if (k) svg += `<line x1="0" x2="${P.ancho}" y1="${y0 - 2}" y2="${y0 - 2}" stroke="${P.linea}" stroke-width="0.6"/>`;
      /* el nombre en uno o dos renglones; con uno, debajo va qué mide la escala («Evidencia contra la hipótesis nula») */
      const renglones = partir(f.titulo, 33);
      svg += txt(0, by + 3, renglones[0], { negrita: true });
      if (renglones[1]) svg += txt(0, by + 16, renglones[1], { negrita: true });
      else if (e.titulo) svg += txt(0, by + 16, corta(e.titulo, 40), { tam: 9.5, color: P.tenue });
      let ini = 0, ultimo = P.x0 + 14;
      e.zonas.forEach((q, i) => {
        const fin = i === e.zonas.length - 1 ? 1 : posicion(e, q.hasta);
        if (fin > ini) svg += `<rect x="${x(ini).toFixed(1)}" y="${by}" width="${(x(fin) - x(ini)).toFixed(1)}" height="${bh}" fill="${TONOS[q.tono] || TONOS.n0}"/>`;
        if (i < e.zonas.length - 1 && fin > 0 && fin < 1) {
          svg += `<line x1="${x(fin).toFixed(1)}" x2="${x(fin).toFixed(1)}" y1="${by - 2}" y2="${by + bh + 2}" stroke="${P.tenue}" stroke-width="0.8"/>`;
          const rot = String(fmtEje(q.hasta)), anch = 4.6 * rot.length + 4;
          if (x(fin) - anch / 2 > ultimo + 3 && x(fin) + anch / 2 < P.x1 - 14) { svg += txt(x(fin), by + bh + 11, rot, { tam: 8.5, color: P.tenue, fin: 'middle' }); ultimo = x(fin) + anch / 2; }
        }
        ini = Math.max(ini, fin);
      });
      svg += `<rect x="${P.x0}" y="${by}" width="${P.x1 - P.x0}" height="${bh}" fill="none" stroke="${P.linea}" stroke-width="0.6"/>`;
      svg += txt(P.x0, by + bh + 11, e.etiquetaMin || fmtEje(e.min), { tam: 8.5, color: P.tenue });
      svg += txt(P.x1, by + bh + 11, e.etiquetaMax || fmtEje(e.max) + (e.abierto ? '+' : ''), { tam: 8.5, color: P.tenue, fin: 'end' });
      const t = posicion(e, f.valor);
      if (Number.isFinite(t)) svg += `<path d="M${(x(t) - 5).toFixed(1)} ${by - 8}L${(x(t) + 5).toFixed(1)} ${by - 8}L${x(t).toFixed(1)} ${by + 1}Z" fill="${P.texto}" stroke="#ffffff" stroke-width="0.8"/>`;
      svg += txt(P.val, by + 3, corta(fmt(f.valor), 30), { negrita: true });
      svg += txt(P.val, by + 16, corta(zona.etiqueta, 32), { tam: 9.5, color: P.tenue });
      desc.push(f.titulo + ': ' + fmt(f.valor) + ' — ' + zona.etiqueta);
    });
    const descripcion = (o.titulo ? o.titulo + '. ' : '') + desc.join('; ') + '.';
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${P.ancho} ${alto}" width="${P.ancho}" height="${alto}" role="img" aria-label="${esc(descripcion)}">` +
        `<rect x="0" y="0" width="${P.ancho}" height="${alto}" fill="#ffffff"/>${svg}</svg>`,
      ancho: P.ancho, alto, descripcion, textos: desc, n: lista.length,
    };
  }

  raiz.LABGuide = { version: VERSION, medidor, curva, densidad, posicion, panel };
})(typeof window !== 'undefined' ? window : globalThis);

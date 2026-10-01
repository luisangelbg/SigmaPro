/* SigmaPro — gráficas de diagnóstico en SVG (siguen al tema claro u oscuro por CSS).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Pequeño motor propio para las gráficas que acompañan a los resultados; el Estudio de figuras LABG
   (Hito 1.11) las toma para editarlas y exportarlas.

     SP.graficas.dispersion({
       titulo, descripcion,                         descripcion: texto alternativo (lector de pantalla)
       x: { titulo }, y: { titulo },
       puntos: [{ x, y, marca, etiqueta }],         marca: se resalta; etiqueta: número junto al punto
       banda: { x: [], inf: [], sup: [] },          área sombreada (banda de confianza)
       linea: { x: [], y: [] },                     línea continua (p. ej. los residuos en orden)
       referencias: [{ y, discontinua }],           líneas horizontales
       diagonal: true                               la recta y = x
     }) → SVG */
(function () {
  'use strict';
  const esc = SP.ui.esc;
  const W = 520, H = 340, M = { l: 58, r: 14, t: 16, b: 50 };

  /** Marcas «bonitas» (1, 2, 2.5, 5 × 10ᵏ) que cubren [a, b]. */
  function marcas(a, b, cuantas) {
    if (!(b > a)) { const d = Math.abs(a) || 1; a -= d / 2; b += d / 2; }
    const crudo = (b - a) / (cuantas || 5), e = Math.pow(10, Math.floor(Math.log10(crudo)));
    const paso = [1, 2, 2.5, 5, 10].map(m => m * e).find(p => p >= crudo);
    const lista = [];
    for (let v = Math.ceil(a / paso) * paso; v <= b + paso * 1e-9; v += paso) lista.push(Math.abs(v) < paso * 1e-9 ? 0 : v);
    return { lista, paso };
  }
  /* los decimales que necesita el paso (0.25 pide dos, 2.5 pide uno) */
  const texto = (v, paso) => {
    let d = Math.max(0, -Math.floor(Math.log10(paso) + 1e-9));
    while (d < 6 && Math.abs(paso * 10 ** d - Math.round(paso * 10 ** d)) > 1e-6 * paso * 10 ** d) d++;
    return v.toFixed(d).replace(/^-/, '−');
  };

  function dispersion(op) {
    const xs = [], ys = [];
    for (const p of op.puntos || []) { xs.push(p.x); ys.push(p.y); }
    if (op.banda) { xs.push(...op.banda.x); ys.push(...op.banda.inf, ...op.banda.sup); }
    if (op.linea) { xs.push(...op.linea.x); ys.push(...op.linea.y); }
    for (const r of op.referencias || []) ys.push(r.y);
    const fin = v => v.filter(Number.isFinite);
    let x0 = Math.min(...fin(xs)), x1 = Math.max(...fin(xs)), y0 = Math.min(...fin(ys)), y1 = Math.max(...fin(ys));
    if (op.diagonal) { const a = Math.min(x0, y0), b = Math.max(x1, y1); x0 = y0 = a; x1 = y1 = b; }
    const hx = (x1 - x0) * 0.04 || 1, hy = (y1 - y0) * 0.06 || 1;
    x0 -= hx; x1 += hx; y0 -= hy; y1 += hy;
    const X = v => M.l + (v - x0) / (x1 - x0) * (W - M.l - M.r), Y = v => M.t + (y1 - v) / (y1 - y0) * (H - M.t - M.b);
    const mx = marcas(x0, x1, 6), my = marcas(y0, y1, 5);
    const partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${H - M.t - M.b}" class="gr-fondo"/>`);
    for (const v of mx.lista) partes.push(`<line x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" y1="${M.t}" y2="${H - M.b}" class="gr-rejilla"/><text x="${X(v).toFixed(1)}" y="${H - M.b + 16}" text-anchor="middle" class="gr-etq">${texto(v, mx.paso)}</text>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq">${texto(v, my.paso)}</text>`);
    if (op.banda) {
      const ida = op.banda.x.map((v, i) => `${X(v).toFixed(1)},${Y(op.banda.sup[i]).toFixed(1)}`);
      const vuelta = op.banda.x.map((v, i) => `${X(v).toFixed(1)},${Y(op.banda.inf[i]).toFixed(1)}`).reverse();
      partes.push(`<polygon points="${ida.concat(vuelta).join(' ')}" class="gr-banda"/>`);
    }
    if (op.diagonal) partes.push(`<line x1="${X(x0)}" y1="${Y(x0)}" x2="${X(x1)}" y2="${Y(x1)}" class="gr-ref"/>`);
    for (const r of op.referencias || []) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" class="gr-ref${r.discontinua ? ' disc' : ''}"/>`);
    if (op.linea) partes.push(`<polyline points="${op.linea.x.map((v, i) => `${X(v).toFixed(1)},${Y(op.linea.y[i]).toFixed(1)}`).join(' ')}" class="gr-linea"/>`);
    const normales = [], marcados = [];
    for (const p of op.puntos || []) (p.marca ? marcados : normales).push(p);
    for (const p of normales) partes.push(`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3" class="gr-punto"/>`);
    for (const p of marcados) {
      partes.push(`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4.2" class="gr-punto marca"/>`);
      if (p.etiqueta !== undefined) partes.push(`<text x="${(X(p.x) + 7).toFixed(1)}" y="${(Y(p.y) - 6).toFixed(1)}" class="gr-etq gr-etq-punto">${esc(p.etiqueta)}</text>`);
    }
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" class="gr-eje"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${H - M.b}" class="gr-eje"/>`);
    partes.push(`<text x="${(M.l + W - M.r) / 2}" y="${H - 10}" text-anchor="middle" class="gr-titulo-eje">${esc(op.x.titulo)}</text>`);
    partes.push(`<text transform="translate(16 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje">${esc(op.y.titulo)}</text>`);
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /** Muestra a lo más «tope» puntos (los marcados siempre entran), para que 100 000 filas no saturen el SVG. */
  function adelgazar(puntos, tope) {
    if (puntos.length <= tope) return puntos;
    const marcados = puntos.filter(p => p.marca), resto = puntos.filter(p => !p.marca);
    const paso = resto.length / Math.max(1, tope - marcados.length);
    const elegidos = [];
    for (let k = 0; k < resto.length; k += paso) elegidos.push(resto[Math.floor(k)]);
    return elegidos.concat(marcados);
  }

  /**
   * Cajas por grupo con los puntos encima (desplazados de lado sin azar), la media opcional, una letra
   * sobre cada grupo y líneas de referencia:
   *   SP.graficas.grupos({ titulo, descripcion, y: { titulo }, media: true,
   *     grupos: [{ nombre, valores, letra }], referencias: [{ y, discontinua }] })
   * Bigotes hasta el dato más extremo dentro de 1.5 RIC (como boxplot de R); los de más allá se resaltan.
   */
  function grupos(op) {
    const gs = op.grupos.map(g => {
      const v = Array.from(g.valores).filter(Number.isFinite), s = Float64Array.from(v).sort();
      const [q1, me, q3] = s.length ? SP.desc.cuantil(s, [0.25, 0.5, 0.75]) : [NaN, NaN, NaN];
      const ric = q3 - q1, dentro = s.filter(x => x >= q1 - 1.5 * ric && x <= q3 + 1.5 * ric);
      return { nombre: g.nombre, letra: g.letra, v, max: s.length ? s[s.length - 1] : NaN, q1, me, q3, bajo: dentro.length ? dentro[0] : q1, alto: dentro.length ? dentro[dentro.length - 1] : q3, media: s.length ? SP.num.media(s) : NaN };
    });
    const k = gs.length;
    let y0 = Infinity, y1 = -Infinity;
    for (const g of gs) for (const v of g.v) { if (v < y0) y0 = v; if (v > y1) y1 = v; }
    for (const r of op.referencias || []) { y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y); }
    const hy = (y1 - y0) * 0.06 || 1;
    y0 -= hy; y1 += hy * (gs.some(g => g.letra) ? 2.6 : 1);
    const largo = Math.max(...gs.map(g => String(g.nombre).length));
    const ancho = (W - M.l - M.r) / k, girar = largo * 6.6 > ancho - 6;
    const mb = girar ? Math.min(120, 30 + largo * 4.6) : M.b;
    const alto = H + (girar ? mb - M.b : 0);
    const Y = v => M.t + (y1 - v) / (y1 - y0) * (alto - M.t - mb), cx = j => M.l + ancho * (j + 0.5);
    const caja = Math.min(64, ancho * 0.55), my = marcas(y0, y1, 5), partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${alto - M.t - mb}" class="gr-fondo"/>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq">${texto(v, my.paso)}</text>`);
    for (const r of op.referencias || []) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" class="gr-ref${r.discontinua ? ' disc' : ''}"/>`);
    gs.forEach((g, j) => {
      const x = cx(j), a = caja / 2;
      if (Number.isFinite(g.q1)) {
        partes.push(`<line x1="${x}" x2="${x}" y1="${Y(g.alto).toFixed(1)}" y2="${Y(g.q3).toFixed(1)}" class="gr-bigote"/><line x1="${x}" x2="${x}" y1="${Y(g.q1).toFixed(1)}" y2="${Y(g.bajo).toFixed(1)}" class="gr-bigote"/>`);
        partes.push(`<line x1="${(x - a / 2).toFixed(1)}" x2="${(x + a / 2).toFixed(1)}" y1="${Y(g.alto).toFixed(1)}" y2="${Y(g.alto).toFixed(1)}" class="gr-bigote"/><line x1="${(x - a / 2).toFixed(1)}" x2="${(x + a / 2).toFixed(1)}" y1="${Y(g.bajo).toFixed(1)}" y2="${Y(g.bajo).toFixed(1)}" class="gr-bigote"/>`);
        partes.push(`<rect x="${(x - a).toFixed(1)}" y="${Y(g.q3).toFixed(1)}" width="${caja.toFixed(1)}" height="${Math.max(1, Y(g.q1) - Y(g.q3)).toFixed(1)}" class="gr-caja"/>`);
        partes.push(`<line x1="${(x - a).toFixed(1)}" x2="${(x + a).toFixed(1)}" y1="${Y(g.me).toFixed(1)}" y2="${Y(g.me).toFixed(1)}" class="gr-mediana"/>`);
      }
      const pts = g.v.length > 400 ? adelgazar(g.v.map(y => ({ y })), 400).map(p => p.y) : g.v;
      pts.forEach((y, i) => {
        const dx = (((i * 0.6180339887) % 1) - 0.5) * caja * 0.8, fuera = y < g.bajo || y > g.alto;
        partes.push(`<circle cx="${(x + dx).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${fuera ? 3.6 : 2.6}" class="gr-punto${fuera ? ' marca' : ''}"/>`);
      });
      if (op.media && Number.isFinite(g.media)) {
        const ym = Y(g.media);
        partes.push(`<path d="M${x} ${(ym - 5).toFixed(1)} L${x + 5} ${ym.toFixed(1)} L${x} ${(ym + 5).toFixed(1)} L${x - 5} ${ym.toFixed(1)} Z" class="gr-media"/>`);
      }
      if (g.letra) partes.push(`<text x="${x}" y="${Math.max(M.t + 13, Y(g.max) - 9).toFixed(1)}" text-anchor="middle" class="gr-letra">${esc(g.letra)}</text>`);
      const et = esc(g.nombre), ty = alto - mb + 16;
      partes.push(girar
        ? `<text transform="translate(${x + 4} ${ty - 4}) rotate(-35)" text-anchor="end" class="gr-etq">${et}</text>`
        : `<text x="${x}" y="${ty}" text-anchor="middle" class="gr-etq">${et}</text>`);
    });
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${alto - mb}" y2="${alto - mb}" class="gr-eje"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${alto - mb}" class="gr-eje"/>`);
    partes.push(`<text transform="translate(16 ${(M.t + alto - mb) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje">${esc(op.y.titulo)}</text>`);
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${alto}" role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  SP.graficas = { dispersion, grupos, adelgazar, marcas };
})();

/* SigmaPro — gráficas de diagnóstico en SVG (siguen al tema claro u oscuro por CSS).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Pequeño motor propio para las gráficas que acompañan a los resultados; el Estudio de figuras LABG
   (Hito 1.11) las toma para editarlas y exportarlas.

     SP.graficas.dispersion({
       titulo, descripcion,                         descripcion: texto alternativo (lector de pantalla)
       x: { titulo }, y: { titulo },
       puntos: [{ x, y, marca, etiqueta }],         marca: se resalta; etiqueta: número junto al punto
       banda: { x: [], inf: [], sup: [] },          área sombreada (banda de confianza)
       bandas: [{ x, inf, sup, prediccion }],       varias bandas; la de predicción, más tenue y con borde discontinuo
       linea: { x: [], y: [] },                     línea continua (p. ej. los residuos en orden)
       lineas: [{ x: [], y: [], serie }],           una línea por grupo, con el trazo de su serie
       referencias: [{ y, discontinua }],           líneas horizontales
       verticales: [{ x, discontinua }],            líneas verticales
       diagonal: true,                              la recta y = x
       leyenda: { titulo, series: [nombre] }        los puntos con «serie» llevan el marcador de su grupo
     }) → SVG */
(function () {
  'use strict';
  const esc = SP.ui.esc;
  const W = 520, H = 340, M = { l: 58, r: 14, t: 16, b: 50 };

  /** Marcas «bonitas» (1, 2, 2.5, 5 × 10ᵏ) que cubren [a, b]. */
  function marcas(a, b, cuantas) {
    if (!(b - a > 1e-9 * Math.max(Math.abs(a), Math.abs(b)))) { const d = Math.abs(a) || 1; a -= d / 2; b += d / 2; }
    const crudo = (b - a) / (cuantas || 5), e = Math.pow(10, Math.floor(Math.log10(crudo)));
    const paso = [1, 2, 2.5, 5, 10].map(m => m * e).find(p => p >= crudo);
    const lista = [];
    for (let v = Math.ceil(a / paso) * paso, k = 0; v <= b + paso * 1e-9 && k < 100; v += paso, k++) lista.push(Math.abs(v) < paso * 1e-9 ? 0 : v);
    return { lista, paso };
  }
  /* margen alrededor de los datos; si todos valen lo mismo (salvo el redondeo, p. ej. ajustados de un modelo con solo la
     media) se abre un margen proporcional al valor, porque un rango de 1e-13 no deja poner marcas */
  const margen = (a, b, f) => (b - a > 1e-9 * Math.max(Math.abs(a), Math.abs(b)) ? (b - a) * f : Math.abs(a) * 0.05 || 1);
  /* los decimales que necesita el paso (0.25 pide dos, 2.5 pide uno) */
  const texto = (v, paso) => {
    let d = Math.max(0, -Math.floor(Math.log10(paso) + 1e-9));
    while (d < 6 && Math.abs(paso * 10 ** d - Math.round(paso * 10 ** d)) > 1e-6 * paso * 10 ** d) d++;
    return v.toFixed(d).replace(/^-/, '−');
  };
  /* los colores van en el propio SVG, con las variables del tema (siguen al tema claro u oscuro), para que el editor ✎
     pueda cambiarlos; las clases gr-* se quedan con grosores, trazos y tipografía (css/sigma.css) */
  const TEXTO = 'fill="var(--text)"', TENUE = 'fill="var(--text-muted)"', ORO = 'var(--btn-oro-texto)';
  const PUNTO = 'fill="var(--text)"', PUNTO_MARCA = `fill="${ORO}" stroke="var(--card-bg)"`, TITULO = 'fill="var(--text)" font-weight="600"';
  const BIGOTE = 'stroke="var(--text-muted)"', REF = 'stroke="var(--text-muted)"', LETRA = 'fill="var(--text)" font-weight="700"';
  /* cada serie de lineas(): su línea, el relleno y el borde de su marcador (las dos últimas, huecas) */
  const SERIE = [['var(--text)', 'var(--text)', 'var(--card-bg)'], [ORO, ORO, 'var(--card-bg)'], ['var(--text-muted)', 'var(--text-muted)', 'var(--card-bg)'],
    ['var(--text)', 'var(--card-bg)', 'var(--text)'], [ORO, 'var(--card-bg)', ORO]];
  const marcaDe = i => ` fill="${SERIE[i % 5][1]}" stroke="${SERIE[i % 5][2]}"`;
  /* en dispersion(), de la sexta serie en adelante el marcador se repite pero con otro color y trazo: la serie 5 no se
     confunde con la 0 */
  const estilo = i => (i + Math.floor(i / 5)) % 5;
  /* las marcas para el editor ✎ y el Estudio de figuras: el área de la gráfica y el rango de cada eje numérico */
  const area = (x, y, w, h, xr, yr) => ` data-plot="${[x, y, w, h].map(v => +(+v).toFixed(2)).join(' ')}"` +
    (xr ? ` data-xr="${xr.map(v => +(+v).toPrecision(10)).join(' ')}"` : '') + (yr ? ` data-yr="${yr.map(v => +(+v).toPrecision(10)).join(' ')}"` : '');

  function dispersion(op) {
    const xs = [], ys = [];
    const bandas = (op.bandas || []).concat(op.banda ? [op.banda] : []);
    for (const p of op.puntos || []) { xs.push(p.x); ys.push(p.y); }
    for (const b of bandas) { xs.push(...b.x); ys.push(...b.inf, ...b.sup); }
    if (op.linea) { xs.push(...op.linea.x); ys.push(...op.linea.y); }
    for (const l of op.lineas || []) { xs.push(...l.x); ys.push(...l.y); }
    for (const r of op.referencias || []) ys.push(r.y);
    for (const r of op.verticales || []) xs.push(r.x);
    const fin = v => v.filter(Number.isFinite);
    let x0 = Math.min(...fin(xs)), x1 = Math.max(...fin(xs)), y0 = Math.min(...fin(ys)), y1 = Math.max(...fin(ys));
    if (op.diagonal) { const a = Math.min(x0, y0), b = Math.max(x1, y1); x0 = y0 = a; x1 = y1 = b; }
    const hx = margen(x0, x1, 0.04), hy = margen(y0, y1, 0.06);
    x0 -= hx; x1 += hx; y0 -= hy; y1 += hy;
    const X = v => M.l + (v - x0) / (x1 - x0) * (W - M.l - M.r), Y = v => M.t + (y1 - v) / (y1 - y0) * (H - M.t - M.b);
    const mx = marcas(x0, x1, 6), my = marcas(y0, y1, 5);
    const partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${H - M.t - M.b}" class="gr-fondo"/>`);
    for (const v of mx.lista) partes.push(`<line x1="${X(v).toFixed(1)}" x2="${X(v).toFixed(1)}" y1="${M.t}" y2="${H - M.b}" class="gr-rejilla" data-role="grid"/><text x="${X(v).toFixed(1)}" y="${H - M.b + 16}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${texto(v, mx.paso)}</text>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla" data-role="grid"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${texto(v, my.paso)}</text>`);
    for (const b of bandas) {
      const ida = b.x.map((v, i) => `${X(v).toFixed(1)},${Y(b.sup[i]).toFixed(1)}`);
      const vuelta = b.x.map((v, i) => `${X(v).toFixed(1)},${Y(b.inf[i]).toFixed(1)}`).reverse();
      partes.push(b.prediccion
        ? `<polygon points="${ida.concat(vuelta).join(' ')}" class="gr-banda pred" fill="var(--btn-oro-suave)" fill-opacity=".45" stroke="${ORO}" stroke-dasharray="5 4"/>`
        : `<polygon points="${ida.concat(vuelta).join(' ')}" class="gr-banda" fill="var(--btn-oro-suave)" stroke="rgba(212, 168, 72, .55)"/>`);
    }
    for (const r of op.verticales || []) partes.push(`<line x1="${X(r.x).toFixed(1)}" x2="${X(r.x).toFixed(1)}" y1="${M.t}" y2="${H - M.b}" class="gr-ref${r.discontinua ? ' disc' : ''}" ${REF}/>`);
    if (op.diagonal) partes.push(`<line x1="${X(x0)}" y1="${Y(x0)}" x2="${X(x1)}" y2="${Y(x1)}" class="gr-ref" ${REF}/>`);
    for (const r of op.referencias || []) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" class="gr-ref${r.discontinua ? ' disc' : ''}" ${REF}/>`);
    if (op.linea) partes.push(`<polyline points="${op.linea.x.map((v, i) => `${X(v).toFixed(1)},${Y(op.linea.y[i]).toFixed(1)}`).join(' ')}" class="gr-linea" stroke="${ORO}"/>`);
    for (const l of op.lineas || []) {
      const i = l.serie || 0;
      const e = estilo(i);
      partes.push(`<polyline points="${l.x.map((v, k) => `${X(v).toFixed(1)},${Y(l.y[k]).toFixed(1)}`).join(' ')}" class="gr-serie gr-s${e}" stroke="${SERIE[e][0]}"${TRAZOS[e] ? ` stroke-dasharray="${TRAZOS[e]}"` : ''}/>`);
    }
    const normales = [], marcados = [], porSerie = [];
    for (const p of op.puntos || []) (p.serie !== undefined ? porSerie : p.marca ? marcados : normales).push(p);
    for (const p of porSerie) partes.push(`<g class="gr-marca gr-s${estilo(p.serie)}">${MARCAS[p.serie % 5](+X(p.x).toFixed(1), +Y(p.y).toFixed(1), marcaDe(estilo(p.serie)))}</g>`);
    for (const p of normales) partes.push(`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3" class="gr-punto" ${PUNTO}/>`);
    for (const p of marcados) {
      partes.push(`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4.2" class="gr-punto marca" ${PUNTO_MARCA}/>`);
      if (p.etiqueta !== undefined) partes.push(`<text x="${(X(p.x) + 7).toFixed(1)}" y="${(Y(p.y) - 6).toFixed(1)}" class="gr-etq gr-etq-punto" ${LETRA}>${esc(p.etiqueta)}</text>`);
    }
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" class="gr-eje" data-role="axis"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${H - M.b}" class="gr-eje" data-role="axis"/>`);
    partes.push(`<text x="${(M.l + W - M.r) / 2}" y="${H - 10}" text-anchor="middle" class="gr-titulo-eje" data-role="xlab" ${TITULO}>${esc(op.x.titulo)}</text>`);
    partes.push(`<text transform="translate(16 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    let alto = H;
    if (op.leyenda && op.leyenda.series.length) {
      /* leyenda debajo, en filas de tres, como en lineas() */
      const S = op.leyenda.series, colW = (W - M.l - M.r) / 3, y0l = H + 6;
      alto = H + 22 + Math.ceil(S.length / 3) * 18;
      partes.push('<g data-role="legend">');
      if (op.leyenda.titulo) partes.push(`<text x="${M.l}" y="${y0l}" class="gr-etq" ${TENUE}>${esc(op.leyenda.titulo)}:</text>`);
      S.forEach((nombre, i) => {
        const x = M.l + (i % 3) * colW, y = y0l + 18 + Math.floor(i / 3) * 18;
        const e = estilo(i);
        if (op.lineas && op.lineas.length) partes.push(`<line x1="${x}" x2="${x + 26}" y1="${y - 4}" y2="${y - 4}" class="gr-serie gr-s${e}" stroke="${SERIE[e][0]}"${TRAZOS[e] ? ` stroke-dasharray="${TRAZOS[e]}"` : ''} data-li="${i}"/>`);
        partes.push(`<g class="gr-marca gr-s${e}" data-li="${i}">${MARCAS[i % 5](x + 13, y - 4, marcaDe(e))}</g><text x="${x + 32}" y="${y}" class="gr-etq gr-ley" data-li="${i}" ${TEXTO}>${esc(nombre)}</text>`);
      });
      partes.push('</g>');
    }
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${alto}"${area(M.l, M.t, W - M.l - M.r, H - M.t - M.b, [x0, x1], [y0, y1])} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Muestra a lo más «tope» puntos, repartidos parejo y sin azar, para que 100 000 filas no saturen el SVG. Los marcados
   * entran todos mientras no pasen de la mitad del tope; si son más (con 100 000 filas, los residuos mayores que 2 son
   * miles) también se adelgazan, y primero se quedan los que llevan etiqueta. Se dibujan al final, encima del resto.
   */
  function adelgazar(puntos, tope) {
    if (puntos.length <= tope) return puntos;
    const parejo = (lista, cuantos) => {
      if (lista.length <= cuantos) return lista;
      const paso = lista.length / Math.max(1, cuantos), out = [];
      for (let k = 0; k < lista.length && out.length < cuantos; k += paso) out.push(lista[Math.floor(k)]);
      return out;
    };
    let marcados = puntos.filter(p => p.marca);
    const resto = puntos.filter(p => !p.marca);
    if (marcados.length > tope / 2) {
      const conEtq = parejo(marcados.filter(p => p.etiqueta !== undefined), Math.floor(tope / 4));
      marcados = conEtq.concat(parejo(marcados.filter(p => p.etiqueta === undefined), Math.floor(tope / 2) - conEtq.length));
    }
    return parejo(resto, tope - marcados.length).concat(marcados);
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
    const hy = margen(y0, y1, 0.06);
    y0 -= hy; y1 += hy * (gs.some(g => g.letra) ? 2.6 : 1);
    const largo = Math.max(...gs.map(g => String(g.nombre).length));
    const ancho = (W - M.l - M.r) / k, girar = largo * 6.6 > ancho - 6;
    const mb = girar ? Math.min(120, 30 + largo * 4.6) : M.b;
    const alto = H + (girar ? mb - M.b : 0);
    const Y = v => M.t + (y1 - v) / (y1 - y0) * (alto - M.t - mb), cx = j => M.l + ancho * (j + 0.5);
    const caja = Math.min(64, ancho * 0.55), my = marcas(y0, y1, 5), partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${alto - M.t - mb}" class="gr-fondo"/>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla" data-role="grid"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${texto(v, my.paso)}</text>`);
    for (const r of op.referencias || []) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" class="gr-ref${r.discontinua ? ' disc' : ''}" ${REF}/>`);
    gs.forEach((g, j) => {
      const x = cx(j), a = caja / 2;
      if (Number.isFinite(g.q1)) {
        partes.push(`<line x1="${x}" x2="${x}" y1="${Y(g.alto).toFixed(1)}" y2="${Y(g.q3).toFixed(1)}" class="gr-bigote" ${BIGOTE}/><line x1="${x}" x2="${x}" y1="${Y(g.q1).toFixed(1)}" y2="${Y(g.bajo).toFixed(1)}" class="gr-bigote" ${BIGOTE}/>`);
        partes.push(`<line x1="${(x - a / 2).toFixed(1)}" x2="${(x + a / 2).toFixed(1)}" y1="${Y(g.alto).toFixed(1)}" y2="${Y(g.alto).toFixed(1)}" class="gr-bigote" ${BIGOTE}/><line x1="${(x - a / 2).toFixed(1)}" x2="${(x + a / 2).toFixed(1)}" y1="${Y(g.bajo).toFixed(1)}" y2="${Y(g.bajo).toFixed(1)}" class="gr-bigote" ${BIGOTE}/>`);
        partes.push(`<rect x="${(x - a).toFixed(1)}" y="${Y(g.q3).toFixed(1)}" width="${caja.toFixed(1)}" height="${Math.max(1, Y(g.q1) - Y(g.q3)).toFixed(1)}" class="gr-caja" fill="var(--btn-oro-suave)" stroke="${ORO}"/>`);
        partes.push(`<line x1="${(x - a).toFixed(1)}" x2="${(x + a).toFixed(1)}" y1="${Y(g.me).toFixed(1)}" y2="${Y(g.me).toFixed(1)}" class="gr-mediana" stroke="${ORO}"/>`);
      }
      const pts = g.v.length > 400 ? adelgazar(g.v.map(y => ({ y })), 400).map(p => p.y) : g.v;
      pts.forEach((y, i) => {
        const dx = (((i * 0.6180339887) % 1) - 0.5) * caja * 0.8, fuera = y < g.bajo || y > g.alto;
        partes.push(`<circle cx="${(x + dx).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="${fuera ? 3.6 : 2.6}" class="gr-punto${fuera ? ' marca' : ''}" ${fuera ? PUNTO_MARCA : PUNTO}/>`);
      });
      if (op.media && Number.isFinite(g.media)) {
        const ym = Y(g.media);
        partes.push(`<path d="M${x} ${(ym - 5).toFixed(1)} L${x + 5} ${ym.toFixed(1)} L${x} ${(ym + 5).toFixed(1)} L${x - 5} ${ym.toFixed(1)} Z" class="gr-media" fill="var(--card-bg)" stroke="var(--text)"/>`);
      }
      if (g.letra) partes.push(`<text x="${x}" y="${Math.max(M.t + 13, Y(g.max) - 9).toFixed(1)}" text-anchor="middle" class="gr-letra" ${LETRA}>${esc(g.letra)}</text>`);
      const et = esc(g.nombre), ty = alto - mb + 16;
      partes.push(girar
        ? `<text transform="translate(${x + 4} ${ty - 4}) rotate(-35)" text-anchor="end" class="gr-etq" data-role="xtick" ${TENUE}>${et}</text>`
        : `<text x="${x}" y="${ty}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${et}</text>`);
    });
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${alto - mb}" y2="${alto - mb}" class="gr-eje" data-role="axis"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${alto - mb}" class="gr-eje" data-role="axis"/>`);
    partes.push(`<text transform="translate(16 ${(M.t + alto - mb) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${alto}"${area(M.l, M.t, W - M.l - M.r, alto - M.t - mb, null, [y0, y1])} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Gráfica de interacción: medias de las combinaciones, los niveles de un factor en el eje x y una línea por
   * nivel del otro, cada una con su marcador y su trazo (se distinguen sin color):
   *   SP.graficas.lineas({ titulo, descripcion, x: { titulo, niveles }, y: { titulo }, leyenda, series: [{ nombre, valores }] })
   */
  const MARCAS = [
    (x, y, a = '') => `<circle cx="${x}" cy="${y}" r="4.2"${a}/>`,
    (x, y, a = '') => `<rect x="${x - 3.8}" y="${y - 3.8}" width="7.6" height="7.6"${a}/>`,
    (x, y, a = '') => `<path d="M${x} ${y - 5} L${x + 4.6} ${y + 3.6} L${x - 4.6} ${y + 3.6} Z"${a}/>`,
    (x, y, a = '') => `<path d="M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5} L${x - 5} ${y} Z"${a}/>`,
    (x, y, a = '') => `<path d="M${x} ${y + 5} L${x + 4.6} ${y - 3.6} L${x - 4.6} ${y - 3.6} Z"${a}/>`,
  ];
  const TRAZOS = ['', '7 4', '2 3', '9 3 2 3', '4 2'];
  function lineas(op) {
    const k = op.x.niveles.length, S = op.series;
    let y0 = Infinity, y1 = -Infinity;
    for (const s of S) for (const v of s.valores) if (Number.isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    const hy = margen(y0, y1, 0.08);
    y0 -= hy; y1 += hy;
    const filasLey = Math.ceil(S.length / 3), mb = M.b + 20 + filasLey * 18, alto = H + filasLey * 18 + 20;
    const ancho = (W - M.l - M.r) / k, cx = j => M.l + ancho * (j + 0.5);
    const Y = v => M.t + (y1 - v) / (y1 - y0) * (alto - M.t - mb), my = marcas(y0, y1, 5), partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${alto - M.t - mb}" class="gr-fondo"/>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla" data-role="grid"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${texto(v, my.paso)}</text>`);
    S.forEach((s, i) => {
      let tramo = [];
      const cierra = () => { if (tramo.length > 1) partes.push(`<polyline points="${tramo.join(' ')}" class="gr-serie gr-s${i % 5}" stroke="${SERIE[i % 5][0]}"${TRAZOS[i % 5] ? ` stroke-dasharray="${TRAZOS[i % 5]}"` : ''}/>`); tramo = []; };
      s.valores.forEach((v, j) => { if (Number.isFinite(v)) tramo.push(`${cx(j).toFixed(1)},${Y(v).toFixed(1)}`); else cierra(); });
      cierra();
      partes.push(`<g class="gr-marca gr-s${i % 5}">${s.valores.map((v, j) => (Number.isFinite(v) ? MARCAS[i % 5](+cx(j).toFixed(1), +Y(v).toFixed(1), marcaDe(i)) : '')).join('')}</g>`);
    });
    op.x.niveles.forEach((l, j) => partes.push(`<text x="${cx(j)}" y="${alto - mb + 16}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${esc(l)}</text>`));
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${alto - mb}" y2="${alto - mb}" class="gr-eje" data-role="axis"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${alto - mb}" class="gr-eje" data-role="axis"/>`);
    partes.push(`<text x="${(M.l + W - M.r) / 2}" y="${alto - mb + 34}" text-anchor="middle" class="gr-titulo-eje" data-role="xlab" ${TITULO}>${esc(op.x.titulo)}</text>`);
    partes.push(`<text transform="translate(16 ${(M.t + alto - mb) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    /* leyenda debajo, en filas de tres */
    const y0l = alto - mb + 52, colW = (W - M.l - M.r) / 3;
    partes.push('<g data-role="legend">');   /* para el editor ✎ y el Estudio de figuras */
    if (op.leyenda) partes.push(`<text x="${M.l}" y="${y0l - 4}" class="gr-etq" ${TENUE}>${esc(op.leyenda)}:</text>`);
    S.forEach((s, i) => {
      const x = M.l + (i % 3) * colW + (op.leyenda ? 0 : 0), y = y0l + 14 + Math.floor(i / 3) * 18;
      partes.push(`<line x1="${x}" x2="${x + 26}" y1="${y - 4}" y2="${y - 4}" class="gr-serie gr-s${i % 5}" stroke="${SERIE[i % 5][0]}"${TRAZOS[i % 5] ? ` stroke-dasharray="${TRAZOS[i % 5]}"` : ''} data-li="${i}"/>`);
      partes.push(`<g class="gr-marca gr-s${i % 5}" data-li="${i}">${MARCAS[i % 5](x + 13, y - 4, marcaDe(i))}</g><text x="${x + 32}" y="${y}" class="gr-etq gr-ley" data-li="${i}" ${TEXTO}>${esc(s.nombre)}</text>`);
    });
    partes.push('</g>');
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${alto + 6}"${area(M.l, M.t, W - M.l - M.r, alto - M.t - mb, null, [y0, y1])} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Medias con su barra (± EE o el intervalo) y su letra arriba:
   *   SP.graficas.medias({ titulo, descripcion, y: { titulo }, grupos: [{ nombre, media, inf, sup, letra, marca }] })
   * «marca» resalta un nivel (el testigo de Dunnett). log: true dibuja en escala logarítmica (razones de momios);
   * referencias: [{ y, discontinua }] (p. ej. y = 1, sin efecto).
   */
  function medias(op) {
    const lg = !!op.log, tr = v => (lg ? Math.log10(v) : v);
    const gs = op.grupos.map(g => Object.assign({}, g, { media: tr(g.media), inf: tr(g.inf), sup: tr(g.sup) })), k = gs.length;
    const refs = (op.referencias || []).map(r => ({ y: tr(r.y), discontinua: r.discontinua }));
    const etqY = (v, paso) => (lg ? String(Number((10 ** v).toPrecision(3))) : texto(v, paso));
    let y0 = Infinity, y1 = -Infinity;
    for (const g of gs) for (const v of [g.media, g.inf, g.sup]) if (Number.isFinite(v)) { y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    for (const r of refs) { y0 = Math.min(y0, r.y); y1 = Math.max(y1, r.y); }
    const hy = margen(y0, y1, 0.08);
    y0 -= hy; y1 += hy * (gs.some(g => g.letra) ? 2.4 : 1);
    const largo = Math.max(...gs.map(g => String(g.nombre).length));
    const ancho = (W - M.l - M.r) / k, girar = largo * 6.6 > ancho - 6;
    const mb = girar ? Math.min(120, 30 + largo * 4.6) : M.b, alto = H + (girar ? mb - M.b : 0);
    const Y = v => M.t + (y1 - v) / (y1 - y0) * (alto - M.t - mb), cx = j => M.l + ancho * (j + 0.5), my = marcas(y0, y1, 5), partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${alto - M.t - mb}" class="gr-fondo"/>`);
    for (const v of my.lista) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-rejilla" data-role="grid"/><text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${etqY(v, my.paso)}</text>`);
    for (const r of refs) partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y).toFixed(1)}" y2="${Y(r.y).toFixed(1)}" class="gr-ref${r.discontinua ? ' disc' : ''}" ${REF}/>`);
    gs.forEach((g, j) => {
      const x = cx(j), tapa = Math.min(10, ancho * 0.15);
      if (Number.isFinite(g.inf) && Number.isFinite(g.sup) && g.sup > g.inf) {
        partes.push(`<line x1="${x}" x2="${x}" y1="${Y(g.inf).toFixed(1)}" y2="${Y(g.sup).toFixed(1)}" class="gr-bigote" ${BIGOTE}/>`);
        for (const v of [g.inf, g.sup]) partes.push(`<line x1="${(x - tapa).toFixed(1)}" x2="${(x + tapa).toFixed(1)}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gr-bigote" ${BIGOTE}/>`);
      }
      if (Number.isFinite(g.media)) partes.push(`<circle cx="${x}" cy="${Y(g.media).toFixed(1)}" r="${g.marca ? 6 : 5}" class="gr-punto-media${g.marca ? ' marca' : ''}" ${g.marca ? 'fill="var(--card-bg)" stroke="var(--text)"' : `fill="${ORO}" stroke="var(--card-bg)"`}/>`);
      const tope = Number.isFinite(g.sup) ? g.sup : g.media;
      if (g.letra && Number.isFinite(tope)) partes.push(`<text x="${x}" y="${Math.max(M.t + 13, Y(tope) - 9).toFixed(1)}" text-anchor="middle" class="gr-letra" ${LETRA}>${esc(g.letra)}</text>`);
      const et = esc(g.nombre), ty = alto - mb + 16;
      partes.push(girar ? `<text transform="translate(${x + 4} ${ty - 4}) rotate(-35)" text-anchor="end" class="gr-etq" data-role="xtick" ${TENUE}>${et}</text>` : `<text x="${x}" y="${ty}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${et}</text>`);
    });
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${alto - mb}" y2="${alto - mb}" class="gr-eje" data-role="axis"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${alto - mb}" class="gr-eje" data-role="axis"/>`);
    partes.push(`<text transform="translate(16 ${(M.t + alto - mb) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${alto}"${area(M.l, M.t, W - M.l - M.r, alto - M.t - mb, null, [y0, y1])} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Mapa de calor de una matriz (correlaciones o frecuencias), con el valor escrito en cada celda:
   *   SP.graficas.mapaCalor({ titulo, descripcion, filas: [], columnas: [], valores: [[]], textos: [[]],
   *     escala: 'divergente' (−1 a 1: oro positivo, gris negativo) | 'secuencial' (0 al máximo, oro), leyenda: 'r' })
   * La barra de color va en <g data-legend="colorbar"> para el Estudio de figuras.
   */
  function mapaCalor(op) {
    const R = op.filas.length, C = op.columnas.length, div = op.escala !== 'secuencial';
    let vmax = 0;
    for (const f of op.valores) for (const v of f) if (Number.isFinite(v)) vmax = Math.max(vmax, Math.abs(v));
    if (div) vmax = 1;
    const largoF = Math.max(...op.filas.map(s => String(s).length)), largoC = Math.max(...op.columnas.map(s => String(s).length));
    const ml = Math.min(150, 14 + largoF * 6.4), celda = Math.max(22, Math.min(54, (W - ml - 16) / C)), girar = largoC * 6.2 > celda - 4;
    const mt = 12, alto = mt + R * celda, mb = girar ? Math.min(120, 24 + largoC * 4.8) : 26, barra = 46, totalH = alto + mb + barra;
    const X = j => ml + j * celda, Y = i => mt + i * celda, partes = [];
    const color = v => (div ? (v >= 0 ? ORO : 'var(--text-muted)') : ORO);
    const opac = v => (Number.isFinite(v) ? Math.min(1, Math.abs(v) / (vmax || 1)) * 0.92 : 0);
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const v = op.valores[i][j], o = opac(v), t = op.textos ? op.textos[i][j] : (Number.isFinite(v) ? texto(v, 0.01) : '');
      partes.push(`<rect x="${X(j).toFixed(1)}" y="${Y(i).toFixed(1)}" width="${(celda - 1).toFixed(1)}" height="${(celda - 1).toFixed(1)}" fill="${color(v)}" fill-opacity="${o.toFixed(3)}" stroke="var(--border)" stroke-width="0.5"/>`);
      if (t) partes.push(`<text x="${(X(j) + celda / 2).toFixed(1)}" y="${(Y(i) + celda / 2 + 4).toFixed(1)}" text-anchor="middle" class="gr-etq gr-celda" ${o > 0.55 ? 'fill="var(--card-bg)"' : TEXTO}>${esc(t)}</text>`);
    }
    op.filas.forEach((f, i) => partes.push(`<text x="${ml - 6}" y="${(Y(i) + celda / 2 + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${esc(f)}</text>`));
    op.columnas.forEach((c, j) => {
      const x = X(j) + celda / 2, ty = alto + 14;
      partes.push(girar ? `<text transform="translate(${(x + 4).toFixed(1)} ${ty - 4}) rotate(-35)" text-anchor="end" class="gr-etq" data-role="xtick" ${TENUE}>${esc(c)}</text>`
        : `<text x="${x.toFixed(1)}" y="${ty}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${esc(c)}</text>`);
    });
    /* barra de color */
    const yb = alto + mb + 8, xb = ml, wb = Math.min(260, W - ml - 20), pasos = 10;
    partes.push('<g data-legend="colorbar">');
    for (let k = 0; k < pasos; k++) {
      const v = div ? -1 + (2 * (k + 0.5)) / pasos : vmax * (k + 0.5) / pasos;
      partes.push(`<rect x="${(xb + k * wb / pasos).toFixed(1)}" y="${yb}" width="${(wb / pasos).toFixed(1)}" height="10" fill="${color(v)}" fill-opacity="${opac(v).toFixed(3)}" stroke="var(--border)" stroke-width="0.5"/>`);
    }
    const etiquetas = div ? [[-1, '−1'], [0, '0'], [1, '1']] : [[0, '0'], [vmax, texto(vmax, vmax >= 10 ? 1 : 0.1)]];
    for (const [v, t] of etiquetas) partes.push(`<text x="${(xb + (div ? (v + 1) / 2 : v / (vmax || 1)) * wb).toFixed(1)}" y="${yb + 24}" text-anchor="middle" class="gr-etq" ${TENUE}>${t}</text>`);
    if (op.leyenda) partes.push(`<text x="${xb + wb + 8}" y="${yb + 9}" class="gr-etq" ${TEXTO}>${esc(op.leyenda)}</text>`);
    partes.push('</g>');
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${totalH}"${area(ml, mt, C * celda, R * celda)} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Mosaico de una tabla de contingencia: el ancho de cada barra es el total de su fila y las alturas, la proporción de
   * cada columna dentro de ella; el tono, el residuo ajustado (oro: más casos de los esperados; gris: menos).
   *   SP.graficas.mosaico({ titulo, descripcion, filas: [], columnas: [], conteos: [[]], residuos: [[]], x: { titulo }, y: { titulo } })
   */
  const TONOS = [['var(--text-muted)', 0.75, '< −2'], ['var(--text-muted)', 0.3, '−2 a 0'], [ORO, 0.3, '0 a 2'], [ORO, 0.85, '> 2']];
  const tonoDe = r => (r < -2 ? 0 : r < 0 ? 1 : r <= 2 ? 2 : 3);
  function mosaico(op) {
    const R = op.filas.length, C = op.columnas.length, tot = op.conteos.map(f => f.reduce((a, b) => a + b, 0)), n = tot.reduce((a, b) => a + b, 0);
    const largoC = Math.max(...op.columnas.map(s => String(s).length)), ml = Math.min(150, 20 + largoC * 6.4), mr = 12, mt = 12, hueco = 4;
    const anchoUtil = W - ml - mr - hueco * (R - 1), altoPlot = 230;
    const largoF = Math.max(...op.filas.map(s => String(s).length)), girar = R > 1 && largoF * 6.2 > anchoUtil / R - 6;
    const mb = girar ? Math.min(120, 30 + largoF * 4.8) : 40, yl = mt + altoPlot + mb, totalH = yl + 34;
    const partes = [];
    let x = ml;
    op.conteos.forEach((f, i) => {
      const w = anchoUtil * tot[i] / n;
      let y = mt;
      f.forEach((c, j) => {
        const h = tot[i] ? altoPlot * c / tot[i] : 0, t = TONOS[tonoDe(op.residuos[i][j])];
        if (h > 0) partes.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0.5, w).toFixed(1)}" height="${h.toFixed(1)}" fill="${t[0]}" fill-opacity="${t[1]}" stroke="var(--card-bg)" stroke-width="1.5"><title>${esc(op.filas[i] + ' · ' + op.columnas[j] + ': ' + c)}</title></rect>`);
        if (i === 0 && h > 0) partes.push(`<text x="${ml - 6}" y="${(y + h / 2 + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${esc(op.columnas[j])}</text>`);
        y += h;
      });
      const cx = x + w / 2, ty = mt + altoPlot + 16;
      partes.push(girar ? `<text transform="translate(${(cx + 4).toFixed(1)} ${ty - 4}) rotate(-35)" text-anchor="end" class="gr-etq" data-role="xtick" ${TENUE}>${esc(op.filas[i])}</text>`
        : `<text x="${cx.toFixed(1)}" y="${ty}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${esc(op.filas[i])}</text>`);
      x += w + hueco;
    });
    if (op.x && op.x.titulo) partes.push(`<text x="${(ml + W - mr) / 2}" y="${yl - 8}" text-anchor="middle" class="gr-titulo-eje" data-role="xlab" ${TITULO}>${esc(op.x.titulo)}</text>`);
    if (op.y && op.y.titulo) partes.push(`<text transform="translate(14 ${mt + altoPlot / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    /* leyenda del residuo ajustado */
    partes.push('<g data-role="legend">');
    partes.push(`<text x="${ml}" y="${yl + 14}" class="gr-etq" ${TENUE}>${esc(op.leyenda || 'Residuo ajustado')}:</text>`);
    TONOS.forEach((t, k) => {
      const xx = ml + 120 + k * 90;
      partes.push(`<rect x="${xx}" y="${yl + 4}" width="16" height="12" fill="${t[0]}" fill-opacity="${t[1]}" stroke="var(--border)" stroke-width="0.5" data-li="${k}"/><text x="${xx + 22}" y="${yl + 14}" class="gr-etq gr-ley" data-li="${k}" ${TEXTO}>${esc(t[2])}</text>`);
    });
    partes.push('</g>');
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${totalH}"${area(ml, mt, W - ml - mr, altoPlot)} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  /**
   * Curvas de nivel de una superficie z(x, y), como contour() de R:
   *   SP.graficas.contorno({ titulo, descripcion, x: { titulo, rango: [a, b] }, y: { titulo, rango: [a, b] }, z: (x, y) => valor,
   *     puntos: [{ x, y }], marca: { x, y, etiqueta }, camino: { x: [], y: [] } })
   * Malla de 81 × 81 y marching squares (las celdas ambiguas se resuelven con el valor del centro); cada curva lleva su
   * valor escrito y su tono: más oscura en oro cuanto mayor es el nivel. «puntos» son los del diseño; «marca», el punto
   * estacionario; «camino», la cresta.
   */
  function contorno(op) {
    const NM = 80, [xa, xb] = op.x.rango, [ya, yb] = op.y.rango;
    const gx = i => xa + (xb - xa) * i / NM, gy = j => ya + (yb - ya) * j / NM;
    const Zm = [];
    let z0 = Infinity, z1 = -Infinity;
    for (let j = 0; j <= NM; j++) {
      const fila = new Float64Array(NM + 1);
      for (let i = 0; i <= NM; i++) { const v = op.z(gx(i), gy(j)); fila[i] = v; if (v < z0) z0 = v; if (v > z1) z1 = v; }
      Zm.push(fila);
    }
    const mz = marcas(z0, z1, 12), niveles = mz.lista.filter(v => v > z0 && v < z1);
    const X = v => M.l + (v - xa) / (xb - xa) * (W - M.l - M.r), Y = v => M.t + (yb - v) / (yb - ya) * (H - M.t - M.b);
    const mx = marcas(xa, xb, 6), my = marcas(ya, yb, 5), partes = [];
    partes.push(`<rect x="${M.l}" y="${M.t}" width="${W - M.l - M.r}" height="${H - M.t - M.b}" class="gr-fondo"/>`);
    for (const v of mx.lista) partes.push(`<text x="${X(v).toFixed(1)}" y="${H - M.b + 16}" text-anchor="middle" class="gr-etq" data-role="xtick" ${TENUE}>${texto(v, mx.paso)}</text>`);
    for (const v of my.lista) partes.push(`<text x="${M.l - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end" class="gr-etq" data-role="ytick" ${TENUE}>${texto(v, my.paso)}</text>`);
    const P = (i, j) => [X(gx(i)), Y(gy(j))];
    const corte = (a, b, va, vb, L) => { const t = (L - va) / (vb - va); return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; };
    niveles.forEach((L, li) => {
      const seg = [];
      for (let j = 0; j < NM; j++) for (let i = 0; i < NM; i++) {
        const v = [Zm[j][i], Zm[j][i + 1], Zm[j + 1][i + 1], Zm[j + 1][i]], p = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
        const caso = (v[0] > L ? 1 : 0) | (v[1] > L ? 2 : 0) | (v[2] > L ? 4 : 0) | (v[3] > L ? 8 : 0);
        if (caso === 0 || caso === 15) continue;
        const e = k => corte(p[k], p[(k + 1) % 4], v[k], v[(k + 1) % 4], L);   // arista k: de la esquina k a la k + 1
        const cruza = [0, 1, 2, 3].filter(k => (v[k] > L) !== (v[(k + 1) % 4] > L));
        if (cruza.length === 2) seg.push([e(cruza[0]), e(cruza[1])]);
        else {
          const centro = (v[0] + v[1] + v[2] + v[3]) / 4 > L, alto0 = v[0] > L;
          /* silla: si el centro está del lado de la esquina 0, se unen las aristas que la rodean de otra forma */
          if (centro === alto0) { seg.push([e(0), e(1)]); seg.push([e(2), e(3)]); } else { seg.push([e(3), e(0)]); seg.push([e(1), e(2)]); }
        }
      }
      if (!seg.length) return;
      const f = niveles.length > 1 ? li / (niveles.length - 1) : 1;
      const trazo = f >= 0.5 ? ORO : 'var(--text-muted)', opac = (0.45 + 0.55 * (f >= 0.5 ? (f - 0.5) * 2 : (0.5 - f) * 2)).toFixed(2);
      partes.push(`<path d="${seg.map(s => `M${s[0][0].toFixed(1)} ${s[0][1].toFixed(1)}L${s[1][0].toFixed(1)} ${s[1][1].toFixed(1)}`).join('')}" class="gr-contorno" fill="none" stroke="${trazo}" stroke-opacity="${opac}" stroke-width="1.4" data-nivel="${L}"/>`);
      const orden = seg.slice().sort((a, b) => a[0][0] + a[1][0] - b[0][0] - b[1][0]), s = orden[Math.floor(orden.length * [0.5, 0.3, 0.7][li % 3])];
      const cx = (s[0][0] + s[1][0]) / 2, cy = (s[0][1] + s[1][1]) / 2;
      partes.push(`<text x="${cx.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" text-anchor="middle" class="gr-etq gr-nivel" ${TEXTO} stroke="var(--card-bg)" stroke-width="3" paint-order="stroke">${texto(L, mz.paso)}</text>`);
    });
    if (op.camino && op.camino.x.length > 1) partes.push(`<polyline points="${op.camino.x.map((v, k) => `${X(v).toFixed(1)},${Y(op.camino.y[k]).toFixed(1)}`).join(' ')}" class="gr-linea" fill="none" stroke="${ORO}" stroke-width="2" stroke-dasharray="6 4"/>`);
    for (const p of op.puntos || []) partes.push(`<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3" class="gr-punto" ${PUNTO}/>`);
    if (op.marca && op.marca.x >= xa && op.marca.x <= xb && op.marca.y >= ya && op.marca.y <= yb) {
      const x = X(op.marca.x), y = Y(op.marca.y);
      partes.push(`<path d="M${x.toFixed(1)} ${(y - 7).toFixed(1)} L${(x + 7).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 7).toFixed(1)} L${(x - 7).toFixed(1)} ${y.toFixed(1)} Z" class="gr-punto marca" ${PUNTO_MARCA}/>`);
      if (op.marca.etiqueta) partes.push(`<text x="${(x + 10).toFixed(1)}" y="${(y - 8).toFixed(1)}" class="gr-etq gr-etq-punto" ${LETRA} stroke="var(--card-bg)" stroke-width="3" paint-order="stroke">${esc(op.marca.etiqueta)}</text>`);
    }
    partes.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${H - M.b}" y2="${H - M.b}" class="gr-eje" data-role="axis"/><line x1="${M.l}" x2="${M.l}" y1="${M.t}" y2="${H - M.b}" class="gr-eje" data-role="axis"/>`);
    partes.push(`<text x="${(M.l + W - M.r) / 2}" y="${H - 10}" text-anchor="middle" class="gr-titulo-eje" data-role="xlab" ${TITULO}>${esc(op.x.titulo)}</text>`);
    partes.push(`<text transform="translate(16 ${(M.t + H - M.b) / 2}) rotate(-90)" text-anchor="middle" class="gr-titulo-eje" data-role="ylab" ${TITULO}>${esc(op.y.titulo)}</text>`);
    return `<figure class="sp-grafica"><svg viewBox="0 0 ${W} ${H}"${area(M.l, M.t, W - M.l - M.r, H - M.t - M.b, [xa, xb], [ya, yb])} role="img" aria-label="${esc(op.descripcion || op.titulo)}" data-sigmapro-figura="${esc(op.titulo)}">` +
      `<title>${esc(op.titulo)}</title>${partes.join('')}</svg><figcaption>${esc(op.titulo)}</figcaption></figure>`;
  }

  SP.graficas = { dispersion, grupos, lineas, medias, mapaCalor, mosaico, contorno, adelgazar, marcas };
})();

/* SigmaPro — «Cómo leer este cuadro» (hito 5.1).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Debajo de cada cuadro con estadísticos que tienen una guía de lectura, un desplegable con:
     · un medidor por estadístico (el p con su α, los tamaños del efecto, la R², el CV, el VIF…), con las zonas y la
       fuente de su escala (SP.guias.escala) y una marca por fila;
     · la curva de la distribución de referencia (F, t, χ² o normal) de cada prueba del cuadro, con el valor crítico,
       el observado y el área del p.
   El estadístico se reconoce por el título de su columna (F, p, CV…) o, en los cuadros «Medida · Valor», por el nombre
   de la fila. Las escalas que dependen del análisis toman su contexto ({ alfa, n, gl }) del resultado. Lo que se dibuja
   (LABGuide, js/labg-guide.js) se arma al abrir el desplegable, no al pintar el resultado.

     SP.lectura.html(cuadro, { visibles, contexto })  → el desplegable (o '' si el cuadro no tiene qué leer)
     SP.lectura.items(cuadro, visibles, contexto)     → { escalas: [{ ficha, columna, contexto, marcas }], curvas: […] }
     SP.lectura.contexto(resultado, opciones)         → { alfa, n, gl } */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const norm = s => (SP.guias ? SP.guias.normalizar(s) : String(s || '').toLowerCase());
  const esNumero = v => typeof v === 'number' && Number.isFinite(v);
  /* la fila del error con que se prueba un término (la primera que sigue; en parcelas divididas, la de su estrato) */
  const ERROR = /^(error|residuo|residual)/;
  const MAX_CURVAS = 8, MAX_MARCAS = 2000;

  /** El contexto de las escalas a partir del resultado: el α, el número de observaciones y, en una tabla de
      contingencia, min(filas, columnas) − 1 (para la V de Cramér). */
  function contexto(r, op) {
    const c = {};
    const a = (r && r.alfa) || (op && op.alfa);
    if (a > 0 && a < 1) c.alfa = +a;
    if (r && r.n > 0) c.n = r.n;
    const obs = r && r.observados;
    if (Array.isArray(obs) && Array.isArray(obs[0])) c.gl = Math.min(obs.length, obs[0].length) - 1;
    return c;
  }

  function items(c, visibles, ctx) {
    if (!SP.guias || !SP.guias.escala || !c || !Array.isArray(c.filas)) return { escalas: [], curvas: [], mas: 0 };
    ctx = ctx || {};
    const cols = SP.cuadros.columnasVisibles(c, visibles);
    const etq = cols.find(k => k.formato === 'texto');
    const nombre = f => (etq && f[etq.clave] != null ? String(f[etq.clave]) : '');
    const numerica = k => k.formato !== 'texto' && !String(k.formato).startsWith('intervalo');
    const fichas = cols.map(k => (numerica(k) ? SP.guias.buscar(k.clave, k.titulo) : null));
    const glCols = cols.filter((k, i) => fichas[i] && fichas[i].id === 'gl');
    const pCol = cols.find((k, i) => fichas[i] && fichas[i].id === 'p'), pAjCol = cols.find((k, i) => fichas[i] && fichas[i].id === 'p-ajustado');
    const filas = c.filas.filter(f => !f._total);
    const escalas = [], curvas = [];
    const conTitulo = t => Object.assign({}, ctx, { titulo: t });
    const glError = j => {
      if (!glCols[0]) return NaN;
      for (let i = j + 1; i < filas.length; i++) if (ERROR.test(norm(nombre(filas[i])))) return filas[i][glCols[0].clave];
      return NaN;
    };
    const curva = (dist, x, f, j, titulo) => {
      let gl1 = NaN, gl2 = NaN;
      if (dist !== 'z') gl1 = glCols[0] ? f[glCols[0].clave] : NaN;
      if (dist === 'F') gl2 = glCols[1] ? f[glCols[1].clave] : glError(j);
      if ((dist !== 'z' && !(gl1 > 0)) || (dist === 'F' && !(gl2 > 0))) return;
      curvas.push({ dist, x, gl1, gl2, p: pCol && esNumero(f[pCol.clave]) ? f[pCol.clave] : null, pAjustado: pAjCol && esNumero(f[pAjCol.clave]) ? f[pAjCol.clave] : null, titulo });
    };
    /* por columna */
    cols.forEach((k, i) => {
      const g = fichas[i];
      if (!g) return;
      if (SP.guias.escala(g.id, conTitulo(k.titulo))) {
        const marcas = filas.map(f => ({ valor: f[k.clave], etiqueta: nombre(f) })).filter(m => esNumero(m.valor)).slice(0, MAX_MARCAS);
        if (marcas.length) escalas.push({ ficha: g.id, columna: k.titulo, fila: false, contexto: conTitulo(k.titulo), marcas });
      }
      const d = SP.guias.distribucion(g.id);
      if (d) filas.forEach((f, j) => { if (esNumero(f[k.clave])) curva(d, f[k.clave], f, j, nombre(f) ? k.titulo + ' · ' + nombre(f) : k.titulo); });
    });
    /* por fila: en los cuadros «Medida · Valor» el estadístico es el nombre de la fila */
    const val = etq && cols.find((k, i) => k !== etq && numerica(k) && !fichas[i]);
    if (val) filas.forEach((f, j) => {
      const g = SP.guias.buscar(null, nombre(f)), x = f[val.clave];
      if (!g || !esNumero(x)) return;
      if (SP.guias.escala(g.id, conTitulo(nombre(f)))) escalas.push({ ficha: g.id, columna: nombre(f), fila: true, contexto: conTitulo(nombre(f)), marcas: [{ valor: x, etiqueta: '' }] });
      const d = SP.guias.distribucion(g.id);
      if (d) curva(d, x, f, j, nombre(f));
    });
    return { escalas, curvas: curvas.slice(0, MAX_CURVAS), mas: Math.max(0, curvas.length - MAX_CURVAS) };
  }

  function html(c, op) {
    op = op || {};
    const L = items(c, op.visibles, op.contexto);
    if (!L.escalas.length && !L.curvas.length) return '';
    return `<details class="lg-lectura" data-lg="${esc(JSON.stringify(L))}"><summary>${esc(T('Cómo leer este cuadro'))}</summary><div class="lg-cuerpo"></div></details>`;
  }

  /* ---------------- dibujar al abrir ---------------- */
  const D = () => SP.dist;
  const fmtP = v => (v < 0.001 ? '< 0.001' : v.toFixed(3));
  const fmtNum = v => {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    const s = a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : a >= 1 ? v.toFixed(2) : a >= 0.01 ? v.toFixed(3) : v.toPrecision(2);
    return s.replace(/^-/, '−');
  };
  /** El valor crítico, las colas y el p de la curva (el área sombreada) con el α del análisis. */
  function prueba(cv, alfa) {
    const d = cv.dist, x = cv.x;
    if (d === 'F') return { criticos: [D().qf(alfa, cv.gl1, cv.gl2, false)], colas: 'derecha', p: D().pf(x, cv.gl1, cv.gl2, false) };
    if (d === 'chi2') return { criticos: [D().qchisq(alfa, cv.gl1, false)], colas: 'derecha', p: D().pchisq(x, cv.gl1, false) };
    const cola = d === 't' ? D().pt(Math.abs(x), cv.gl1, false) : D().pnorm(Math.abs(x), 0, 1, false);
    const q = a => (d === 't' ? D().qt(a, cv.gl1, false) : D().qnorm(a, 0, 1, false));
    /* una o dos colas: la que coincide con el p del cuadro (si lo trae); si no, dos */
    const una = esNumero(cv.p) && Math.abs(cv.p - cola) < Math.abs(cv.p - 2 * cola);
    if (una) return { criticos: [x < 0 ? -q(alfa) : q(alfa)], colas: x < 0 ? 'izquierda' : 'derecha', p: cola };
    return { criticos: [-q(alfa / 2), q(alfa / 2)], colas: 'dos', p: Math.min(1, 2 * cola) };
  }
  function pintar(det) {
    const cuerpo = det.querySelector('.lg-cuerpo');
    if (!cuerpo || !window.LABGuide) return;
    let L;
    try { L = JSON.parse(det.dataset.lg); } catch (e) { return; }
    const fuentes = new Map();
    const medidores = L.escalas.map(it => {
      const g = SP.guias.ficha(it.ficha), e = SP.guias.escala(it.ficha, it.contexto);
      if (!g || !e) return '';
      fuentes.set(e.fuenteCorta, e.fuenteCompleta);
      const col = norm(it.columna), propio = col === norm(g.nombre) || col === norm(g.simbolo);
      /* el nombre de la fila (los cuadros «Medida · Valor») ya dice qué es; en una columna, el de la ficha */
      const titulo = (it.fila ? it.columna : g.nombre + (propio ? '' : ' · ' + it.columna)) + (e.titulo ? ' — ' + e.titulo : '');
      return window.LABGuide.medidor(Object.assign({}, e, { titulo, marcas: it.marcas, fuente: e.fuenteCorta, nota: e.nota, formato: it.ficha === 'p' || it.ficha === 'p-ajustado' ? fmtP : fmtNum,
        formatoEje: it.ficha === 'p' || it.ficha === 'p-ajustado' ? (v => String(v)) : fmtNum }));
    }).join('');
    const alfa = (L.escalas[0] && L.escalas[0].contexto && L.escalas[0].contexto.alfa) || 0.05;
    const curvas = L.curvas.map(cv => {
      const r = prueba(cv, alfa);
      const nota = esNumero(cv.pAjustado) && !esNumero(cv.p) ? `<p class="lg-fuente">${esc(T('El cuadro da el p ajustado por las comparaciones múltiples ({p}); el área es el p de esta prueba sola.', { p: fmtP(cv.pAjustado) }))}</p>`
        : esNumero(cv.p) && r.p > 1e-12 && Math.abs(cv.p - r.p) / r.p > 0.02 ? `<p class="lg-fuente">${esc(T('El cuadro da p = {p}: sale de otra aproximación (exacta o ajustada); la curva muestra la de referencia.', { p: fmtP(cv.p) }))}</p>` : '';
      return '<div class="lg-curva-item">' + window.LABGuide.curva({ dist: cv.dist, gl1: cv.gl1, gl2: cv.gl2, observado: cv.x, criticos: r.criticos, colas: r.colas, p: r.p, alfa, titulo: cv.titulo, formato: fmtNum }) + nota + '</div>';
    }).join('');
    cuerpo.innerHTML = (medidores ? `<div class="lg-medidores">${medidores}</div>` : '') +
      (curvas ? `<p class="lg-sub">${esc(T('Dónde cae cada prueba en su distribución de referencia'))}</p><div class="lg-curvas">${curvas}</div>` +
        (L.mas ? `<p class="lg-fuente">${esc(T('Y {k} pruebas más en el cuadro.', { k: L.mas }))}</p>` : '') : '') +
      (fuentes.size ? `<details class="lg-refs"><summary>${esc(T('Fuentes de las guías'))}</summary><ul>${[...fuentes.values()].map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : '') +
      `<p class="lg-fuente">${esc(T('Las guías son convenciones para orientar la lectura, no reglas: el contexto del ensayo pesa más.'))}</p>`;
  }
  /* el evento toggle no sube: se escucha en la fase de captura */
  if (typeof document !== 'undefined') document.addEventListener('toggle', e => {
    const d = e.target;
    if (d && d.matches && d.matches('details.lg-lectura') && d.open && !d.dataset.lgPintado) { d.dataset.lgPintado = '1'; pintar(d); }
  }, true);

  SP.lectura = { html, items, contexto, pintar };
})();

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
   Hito 5.2: bajo cada medidor, la tarjeta que lo interpreta con los números del caso (SP.guias.interpretar) y, bajo cada
   curva, dónde cae el valor frente al crítico. El medidor del CV trae un formulario para cambiar su guía por la de un
   cultivo y variable o por límites propios; la guía elegida se recuerda en el navegador («sigmapro.cv.guia») y se
   aplica a todos los cuadros.

     SP.lectura.html(cuadro, { visibles, contexto })  → el desplegable (o '' si el cuadro no tiene qué leer)
     SP.lectura.items(cuadro, visibles, contexto)     → { escalas: [{ ficha, columna, contexto, marcas }], curvas: […] }
     SP.lectura.contexto(resultado, opciones)         → { alfa, n, gl }
     SP.lectura.guiaCV() / SP.lectura.ponerGuiaCV(g)  → la guía del CV guardada / la cambia y vuelve a dibujar */
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
    /* la media general del mismo cuadro: la tarjeta del CV dice a cuánto equivale la desviación del error */
    let media;
    if (val) filas.forEach(f => { const g = SP.guias.buscar(null, nombre(f)); if (media === undefined && g && g.id === 'media' && esNumero(f[val.clave])) media = f[val.clave]; });
    if (val) filas.forEach((f, j) => {
      const g = SP.guias.buscar(null, nombre(f)), x = f[val.clave];
      if (!g || !esNumero(x)) return;
      const cx = Object.assign(conTitulo(nombre(f)), g.id === 'cv' && media !== undefined ? { media } : {});
      if (SP.guias.escala(g.id, cx)) escalas.push({ ficha: g.id, columna: nombre(f), fila: true, contexto: cx, marcas: [{ valor: x, etiqueta: '' }] });
      const d = SP.guias.distribucion(g.id);
      if (d) curva(d, x, f, j, nombre(f));
    });
    return { escalas, curvas: curvas.slice(0, MAX_CURVAS), mas: Math.max(0, curvas.length - MAX_CURVAS) };
  }

  function html(c, op) {
    op = op || {};
    const L = items(c, op.visibles, op.contexto);
    if (!L.escalas.length && !L.curvas.length) return '';
    const cual = (op.numero ? T('Cuadro {n}.', { n: op.numero }) + ' ' : '') + (c.titulo || '');
    return `<details class="lg-lectura" data-lg="${esc(JSON.stringify(L))}"><summary><span class="lg-sum-std">${esc(T('Cómo leer este cuadro'))}</span>` +
      `<span class="lg-sum-basico">${esc(T('Lectura · {c}', { c: cual }))}</span></summary><div class="lg-cuerpo"></div></details>`;
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
    const fuentes = new Map(), guia = leerGuiaCV();
    const medidores = L.escalas.map(it => {
      const ctx = it.ficha === 'cv' ? Object.assign({}, it.contexto, { guiaCV: guia }) : it.contexto;
      const g = SP.guias.ficha(it.ficha), e = SP.guias.escala(it.ficha, ctx);
      if (!g || !e) return '';
      fuentes.set(e.fuenteCorta, e.fuenteCompleta);
      const col = norm(it.columna), propio = col === norm(g.nombre) || col === norm(g.simbolo);
      /* el nombre de la fila (los cuadros «Medida · Valor») ya dice qué es; en una columna, el de la ficha */
      const titulo = (it.fila ? it.columna : g.nombre + (propio ? '' : ' · ' + it.columna)) + (e.titulo ? ' — ' + e.titulo : '');
      const f = SP.guias.formatoDe(it.ficha), esP = it.ficha === 'p' || it.ficha === 'p-ajustado';
      const textos = SP.guias.interpretar(it.ficha, it.marcas, ctx);
      if (it.ficha === 'cv' && e.guia && e.guia.id === 'general') textos.push(T('Si conoces la guía de tu cultivo y variable, ajústala abajo.'));
      const tarjeta = { textos, que: g.que ? { titulo: T('Qué es: {n}', { n: g.nombre }), texto: g.que } : null, extra: (it.ficha === 'cv' ? formGuiaCV(guia) : '') + (SP.glosario ? `<p class="lg-glosario"><button type="button" class="btn btn-ghost btn-sm" data-glosario="${esc(it.ficha)}">${esc(T('En el glosario'))}</button></p>` : '') };
      return `<div class="lg-item" data-ficha="${esc(it.ficha)}">` + window.LABGuide.medidor(Object.assign({}, e, { titulo, marcas: it.marcas, fuente: e.fuenteCorta, nota: e.nota, formato: f,
        formatoEje: esP ? (v => String(v)) : f, tarjeta })) + '</div>';
    }).join('');
    const alfa = (L.escalas[0] && L.escalas[0].contexto && L.escalas[0].contexto.alfa) || 0.05;
    const curvas = L.curvas.map(cv => {
      const r = prueba(cv, alfa);
      const nota = esNumero(cv.pAjustado) && !esNumero(cv.p) ? `<p class="lg-fuente">${esc(T('El cuadro da el p ajustado por las comparaciones múltiples ({p}); el área es el p de esta prueba sola.', { p: fmtP(cv.pAjustado) }))}</p>`
        : esNumero(cv.p) && r.p > 1e-12 && Math.abs(cv.p - r.p) / r.p > 0.02 ? `<p class="lg-fuente">${esc(T('El cuadro da p = {p}: sale de otra aproximación (exacta o ajustada); la curva muestra la de referencia.', { p: fmtP(cv.p) }))}</p>` : '';
      const lectura = SP.guias.interpretarPrueba({ x: cv.x, criticos: r.criticos, colas: r.colas, p: r.p, alfa });
      return '<div class="lg-curva-item">' + window.LABGuide.curva({ dist: cv.dist, gl1: cv.gl1, gl2: cv.gl2, observado: cv.x, criticos: r.criticos, colas: r.colas, p: r.p, alfa, titulo: cv.titulo, formato: fmtNum, lectura }) + nota + '</div>';
    }).join('');
    cuerpo.innerHTML = (medidores ? `<div class="lg-medidores">${medidores}</div>` : '') +
      (curvas ? `<p class="lg-sub">${esc(T('Dónde cae cada prueba en su distribución de referencia'))}</p>` +
        `<p class="lg-fuente lg-curvas-intro">${esc(T('En cada curva, el área sombreada es el p: la probabilidad de un valor tan extremo como el observado, o más, si no hubiera efecto. Cuando el valor pasa la raya punteada (el valor crítico al α del análisis), p < α.'))}</p><div class="lg-curvas">${curvas}</div>` +
        (L.mas ? `<p class="lg-fuente">${esc(T('Y {k} pruebas más en el cuadro.', { k: L.mas }))}</p>` : '') : '') +
      (fuentes.size ? `<details class="lg-refs"><summary>${esc(T('Fuentes de las guías'))}</summary><ul>${[...fuentes.values()].map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : '') +
      `<p class="lg-fuente">${esc(T('Las guías son convenciones para orientar la lectura, no reglas: el contexto del ensayo pesa más.'))}</p>`;
  }
  /* ---------------- la guía del CV por cultivo y variable (hito 5.2) ---------------- */
  const CLAVE_CV = 'sigmapro.cv.guia';
  function leerGuiaCV() {
    try { const g = JSON.parse(localStorage.getItem(CLAVE_CV) || 'null'); return g && typeof g === 'object' ? g : null; } catch (e) { return null; }
  }
  function guardarGuiaCV(g) {
    try { if (!g || g.id === 'general') localStorage.removeItem(CLAVE_CV); else localStorage.setItem(CLAVE_CV, JSON.stringify(g)); } catch (e) { /* sin almacenamiento */ }
  }
  /** El formulario plegado bajo el medidor del CV: la guía (general, una variable de maíz o límites propios). */
  function formGuiaCV(dato) {
    const g = SP.guias.guiaCV(dato), d = dato || {}, todas = SP.guias.guiasCV(), propia = g.id === 'propia';
    const op = x => `<option value="${esc(x.id)}"${x.id === g.id ? ' selected' : ''}>${esc(x.variable || x.nombre)}</option>`;
    const sel = `<label class="field lg-cv-campo"><span>${esc(T('Guía'))}</span><select class="select" data-cvguia="id">${op(todas[0])}` +
      `<optgroup label="${esc(T('Maíz (Fritsche-Neto et al., 2012)'))}">${todas.filter(x => x.cultivo).map(op).join('')}</optgroup>` +
      `<option value="propia"${propia ? ' selected' : ''}>${esc(T('Límites propios'))}</option></select></label>`;
    const l = propia ? g.limites : ['', '', ''];
    const campo = (k, et, v, num) => `<label class="field lg-cv-campo"><span>${esc(et)}</span><input class="input" data-cvguia="${k}" ` +
      (num ? 'type="number" step="any" min="0" inputmode="decimal"' : 'type="text"') + ` value="${esc(v == null ? '' : v)}"></label>`;
    const propios = `<fieldset class="lg-cv-propia"${propia ? '' : ' hidden'}><legend>${esc(T('Tus límites del CV, en %'))}</legend>` +
      `<div class="lg-cv-fila">${campo('cultivo', T('Cultivo'), propia ? d.cultivo : '')}${campo('variable', T('Variable'), propia ? d.variable : '')}</div>` +
      `<div class="lg-cv-fila">${campo('l1', T('Bajo hasta'), l[0], true)}${campo('l2', T('Medio hasta'), l[1], true)}${campo('l3', T('Alto hasta'), l[2], true)}</div>` +
      `<details class="lg-cv-garcia"><summary>${esc(T('Calcularlos con los CV de ensayos parecidos (Garcia, 1989)'))}</summary>` +
      `<label class="field"><span>${esc(T('CV de ensayos parecidos, en %, separados por comas, espacios o renglones'))}</span><textarea class="textarea" rows="2" data-cvguia="lista"></textarea></label>` +
      `<p class="small muted">${esc(T('Bajo hasta la media − 1 DE; medio hasta la media + 1 DE; alto hasta la media + 2 DE; muy alto, después.'))}</p>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-cvguia-accion="calcular">${esc(T('Calcular los límites'))}</button></details>` +
      `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" data-cvguia-accion="aplicar">${esc(T('Aplicar mis límites'))}</button></div></fieldset>`;
    return `<details class="lg-cv-guia"><summary>${esc(T('Ajustar la guía del CV a tu cultivo y variable'))}</summary>` +
      `<div class="lg-cv-form">${sel}${propios}<p class="small lg-cv-msg" role="status" data-cvguia-msg></p></div></details>`;
  }
  const aviso = (form, texto) => { const p = form && form.querySelector('[data-cvguia-msg]'); if (p) p.textContent = texto; };
  /** Guarda la guía del CV y vuelve a dibujar los medidores del CV que ya están abiertos (en Análisis y en el reporte). */
  function ponerGuiaCV(g, form) {
    guardarGuiaCV(g);
    if (typeof document === 'undefined') return;
    const panel = form && form.closest('details.lg-lectura');
    const a = document.activeElement, foco = a && a.dataset ? a.dataset.cvguia || (a.dataset.cvguiaAccion && 'accion:' + a.dataset.cvguiaAccion) : null;
    document.querySelectorAll('details.lg-lectura[data-lg-pintado]').forEach(d => { if (d.querySelector('.lg-item[data-ficha="cv"]')) pintar(d); });
    if (panel) {
      const guiaD = panel.querySelector('details.lg-cv-guia');
      if (guiaD) guiaD.open = true;
      const el = foco && panel.querySelector(foco.startsWith('accion:') ? `[data-cvguia-accion="${foco.slice(7)}"]` : `[data-cvguia="${foco}"]`);
      if (el) el.focus();
      const gg = SP.guias.guiaCV(leerGuiaCV()), e = SP.guias.escala('cv', { guiaCV: leerGuiaCV() });
      aviso(panel.querySelector('.lg-cv-form'), T('Guía aplicada: {g} — {f}.', { g: gg.nombre, f: e.fuenteCorta }));
    }
    document.dispatchEvent(new CustomEvent('sp:guia-cv', { detail: { guia: leerGuiaCV() } }));
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('change', e => {
      const s = e.target;
      if (!s || !s.matches || !s.matches('select[data-cvguia="id"]')) return;
      const form = s.closest('.lg-cv-form');
      if (s.value === 'propia') {
        form.querySelector('.lg-cv-propia').hidden = false;
        aviso(form, T('Escribe tus límites o calcúlalos, y pulsa «Aplicar mis límites».'));
        return;
      }
      ponerGuiaCV({ id: s.value }, form);
    });
    document.addEventListener('input', e => {
      const t = e.target;
      if (t && t.matches && t.matches('input[data-cvguia^="l"]')) { const form = t.closest('.lg-cv-form'); if (form) delete form.dataset.garcia; }
    });
    document.addEventListener('click', e => {
      const b = e.target && e.target.closest && e.target.closest('[data-cvguia-accion]');
      if (!b) return;
      const form = b.closest('.lg-cv-form'), val = k => String((form.querySelector(`[data-cvguia="${k}"]`) || {}).value || '');
      if (b.dataset.cvguiaAccion === 'calcular') {
        const r = SP.guias.limitesGarcia(val('lista').split(/[\s,;]+/).filter(Boolean).map(Number));
        if (!r) { aviso(form, T('Hacen falta al menos tres CV positivos, y la media menos una DE tiene que ser mayor que 0.')); return; }
        ['l1', 'l2', 'l3'].forEach((k, i) => { form.querySelector(`[data-cvguia="${k}"]`).value = r.limites[i]; });
        form.dataset.garcia = JSON.stringify({ n: r.n, media: r.media, de: r.de });
        aviso(form, T('Con {n} CV: media {m} %, DE {s} %. Bajo hasta {a} %, medio hasta {b} %, alto hasta {c} %. Revísalos y pulsa «Aplicar mis límites».',
          { n: r.n, m: r.media.toFixed(2), s: r.de.toFixed(2), a: r.limites[0], b: r.limites[1], c: r.limites[2] }));
        return;
      }
      const lim = ['l1', 'l2', 'l3'].map(k => parseFloat(val(k)));
      if (!(lim.every(x => Number.isFinite(x) && x > 0) && lim[0] < lim[1] && lim[1] < lim[2])) {
        aviso(form, T('Los tres límites tienen que ser números positivos y crecientes: bajo < medio < alto.'));
        return;
      }
      const g = { id: 'propia', cultivo: val('cultivo').trim(), variable: val('variable').trim(), limites: lim };
      if (form.dataset.garcia) { try { g.garcia = JSON.parse(form.dataset.garcia); } catch (er) { /* sin el cálculo */ } }
      ponerGuiaCV(g, form);
    });
  }

  /* el evento toggle no sube: se escucha en la fase de captura */
  if (typeof document !== 'undefined') document.addEventListener('toggle', e => {
    const d = e.target;
    if (d && d.matches && d.matches('details.lg-lectura') && d.open && !d.dataset.lgPintado) { d.dataset.lgPintado = '1'; pintar(d); }
  }, true);

  /* ---------------- el panel del reporte exportado (hito 5.8) ---------------- */
  const MAX_PANEL = 8, MAX_MARCAS_PANEL = 6, INTERCEPTO = /^\(?(intercepto|intercept|constante)\)?$/i;
  /** Los estadísticos clave de un resultado, en el orden de sus cuadros: un renglón por valor (el p de cada efecto, el
      CV, la R²…), hasta ocho. Las columnas con muchos valores (las comparaciones por pares) se leen mejor en el cuadro. */
  function resumen(cuadros, visibles, ctx) {
    const filas = [], vistos = new Set();
    for (const c of cuadros || []) {
      for (const it of items(c, visibles, ctx).escalas) {
        if (it.marcas.length > MAX_MARCAS_PANEL) continue;
        const g = SP.guias.ficha(it.ficha);
        if (!g) continue;
        const col = norm(it.columna), propio = col === norm(g.nombre) || col === norm(g.simbolo);
        for (const m of it.marcas) {
          const etq = String(m.etiqueta || '').trim();
          if (INTERCEPTO.test(etq)) continue;
          const titulo = it.fila ? it.columna.trim() : g.nombre + (propio ? '' : ' · ' + it.columna) + (etq ? ' · ' + etq : '');
          const clave = it.ficha + '|' + titulo + '|' + m.valor;
          if (vistos.has(clave)) continue;
          vistos.add(clave);
          filas.push({ ficha: it.ficha, titulo, valor: m.valor, contexto: it.contexto, multiple: it.marcas.length > 1 });
          if (filas.length >= MAX_PANEL) return filas;
        }
      }
    }
    return filas;
  }
  /** El panel «Lectura de los indicadores» de un elemento del reporte → { svg, descripcion, fuentes, n } o null. */
  function panel(el) {
    if (!window.LABGuide || !window.LABGuide.panel || !el || !el.rep) return null;
    const guia = leerGuiaCV(), fuentes = [];
    const filas = resumen(el.rep.cuadros, el.visibles, contexto(el.r, el.op)).map(f => {
      const ctx = f.ficha === 'cv' ? Object.assign({}, f.contexto, { guiaCV: guia }) : f.contexto;
      const e = SP.guias.escala(f.ficha, ctx);
      if (!e) return null;
      if (e.fuenteCorta && !fuentes.includes(e.fuenteCorta)) fuentes.push(e.fuenteCorta);
      const fmt = SP.guias.formatoDe(f.ficha), esP = f.ficha === 'p' || f.ficha === 'p-ajustado';
      return { titulo: f.titulo, valor: f.valor, escala: e, formato: fmt, formatoEje: esP ? (v => String(v)) : fmt };
    }).filter(Boolean);
    if (!filas.length) return null;
    const p = window.LABGuide.panel(filas, { titulo: T('Lectura de los indicadores') });
    return Object.assign(p, { fuentes });
  }

  SP.lectura = { html, items, contexto, pintar, resumen, panel, guiaCV: leerGuiaCV, ponerGuiaCV: g => ponerGuiaCV(g, null) };
})();

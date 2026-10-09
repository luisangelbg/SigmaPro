/* SigmaPro — bloque 5: el Reporte LABG.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada análisis que se agrega desde Explorar o Análisis queda como { metodo, e, op, ctx, vista, visibles }: el reporte
   no guarda resultados, los vuelve a calcular con los datos de ese momento (y los recuerda mientras los datos no
   cambien). Por cada análisis muestra la conclusión en palabras, los cuadros de revista numerados, las figuras, los
   supuestos con semáforo (en completamente al azar y bloques se revisan solos), el párrafo para la tesis o el
   artículo, los detalles técnicos y el código R.

     SP.app.reporte.agregar(p) · tiene(p) · quitar(id) · mover(id, ±1) · items · calcular(item) · elementos()
     SP.app.reporte.reemplazar({ titulo, autor, items }) (al abrir un proyecto)
     SP.app.reporte.listo() → promesa: los análisis del motor R (Fase 2) se calculan aparte; mientras tanto se muestran
     como «calculando» y no entran a las exportaciones, que esperan a que terminen. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const leer = (k, d) => { try { const v = JSON.parse(localStorage.getItem('sigmapro.reporte.' + k)); return v == null ? d : v; } catch (e) { return d; } };
  const guardar = (k, v) => { try { localStorage.setItem('sigmapro.reporte.' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };

  const est = SP.app.reporte = {
    titulo: '', autor: leer('autor', ''), items: [], siguiente: 1, version: 0, pendiente: true,
    opciones: Object.assign({ barras: 'ee', hoja: 'carta', codigo: true, detalles: true, anchoCm: 16 }, leer('opciones', {})),
  };
  const cache = new Map();
  const SUPUESTOS_SOLOS = ['dca', 'dbca'];
  /* motor R: un cálculo por análisis y versión de los datos; mientras corre, calcular() lanza PENDIENTE */
  const remotos = new Map(), PENDIENTE = { pendiente: true };
  let repintado = null;
  const repintar = () => {
    clearTimeout(repintado);
    repintado = setTimeout(() => {
      const panel = $('#panel-5');
      if (panel && panel.classList.contains('active')) pintar(); else est.pendiente = true;
      document.dispatchEvent(new CustomEvent('sp:reporte', { detail: { items: est.items.length } }));
    }, 30);
  };
  function ejecutarItem(it, ficha, t, opciones) {
    if (ficha.motor !== 'r') return SP.ejecutar(it.metodo, t, it.e || {}, opciones);
    const k = clave(it) + '|' + versionDatos;
    let x = remotos.get(k);
    if (!x) {
      x = { listo: false };
      x.promesa = SP.ejecutarAsync(it.metodo, t, it.e || {}, opciones)
        .then(s => { x.salida = s; }, err => { x.error = err; })
        .then(() => { x.listo = true; repintar(); });
      remotos.set(k, x);
    }
    if (!x.listo) throw PENDIENTE;
    if (x.error) throw x.error;
    return x.salida;
  }
  /** Espera a que terminen los análisis del motor R (antes de exportar). */
  est.listo = async () => {
    for (const it of est.items) { try { calcular(it); } catch (e) { /* los errores quedan en su análisis */ } }
    await Promise.all([...remotos.values()].map(x => x.promesa));
  };

  const clave = p => JSON.stringify([p.metodo, p.e || {}, p.op || {}, p.vista || null]);
  est.tiene = p => !!p && est.items.some(it => clave(it) === clave(p));
  est.agregar = function (p) {
    const it = { id: est.siguiente++, metodo: p.metodo, e: JSON.parse(JSON.stringify(p.e || {})), op: JSON.parse(JSON.stringify(p.op || {})),
      ctx: p.ctx ? JSON.parse(JSON.stringify(p.ctx)) : null, bloque: p.bloque || 4, vista: p.vista, visibles: p.visibles, titulo: p.titulo || '', nota: p.nota || '' };
    est.items.push(it);
    cambio();
    if (L()) L().toast(T('Agregado al reporte ({k} análisis). Míralo en el bloque Resultados.', { k: est.items.length }), { type: 'success' });
    return it;
  };
  est.quitar = id => { est.items = est.items.filter(it => it.id !== id); cache.delete(id); cambio(); };
  est.mover = (id, d) => {
    const i = est.items.findIndex(it => it.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= est.items.length) return;
    [est.items[i], est.items[j]] = [est.items[j], est.items[i]];
    cambio();
  };
  est.reemplazar = r => {
    est.titulo = r.titulo || ''; est.autor = r.autor || est.autor;
    est.items = []; cache.clear(); est.siguiente = 1;
    (r.items || []).forEach(x => est.items.push(Object.assign({ id: est.siguiente++, bloque: SP.metodos[x.metodo] && ['descriptivos', 'frecuencias', 'proporciones', 'bondad-ajuste'].includes(x.metodo) ? 3 : 4 }, JSON.parse(JSON.stringify(x)))));
    cambio();
  };
  function cambio() {
    est.version++;
    const panel = $('#panel-5');
    if (panel && panel.classList.contains('active')) pintar(); else est.pendiente = true;
    document.dispatchEvent(new CustomEvent('sp:reporte', { detail: { items: est.items.length } }));
  }

  /* ---------------- cálculo de un análisis con los datos de ahora ---------------- */
  let versionDatos = 0;
  const respuestaDe = e => e.respuesta || e.y || (e.variables && e.variables.join(', ')) || e.fila || e.exitos || e.categoria || e.evaluador1 || e.antes || '';
  function calcular(it) {
    const c = cache.get(it.id);
    if (c && c.datos === versionDatos && c.clave === clave(it) + it.titulo && c.barras === est.opciones.barras) return c.res;
    const res = { error: null };
    try {
      const t = SP.app.tablaAnalisis(), ficha = SP.metodos[it.metodo];
      if (!t && !(ficha && ficha.sinDatos)) throw new SP.ErrorSP(T('No hay datos cargados.'));
      if (!ficha) throw new SP.ErrorSP(T('Este análisis ya no existe en SigmaPro: «{m}».', { m: it.metodo }));
      const opciones = SP.opcionesCon(ficha, it.op || {});
      const numFactor = !t ? [] : t.nombres.filter(n => t.col(n).tipo === 'numerica' && !t.col(n).fecha && SP.estructura.pareceFactorNumerico(t.col(n), t.n));
      const { resultado, ms } = ejecutarItem(it, ficha, t, opciones);
      const ctx = Object.assign({ factoresNumericos: numFactor }, it.ctx || {});
      let rep = it.bloque === 3 ? ficha.reporte(resultado, ctx) : ficha.reporte(resultado);
      if (it.vista) rep = Object.assign({}, rep, { cuadros: rep.cuadros.filter(q => q.id === it.vista).concat(rep.cuadros.some(q => q.id === it.vista) ? [] : rep.cuadros.slice(0, 1)) });
      Object.assign(res, { r: resultado, rep, ms, opciones, tabla: t, ficha, ctx,
        codigo: ficha.codigoR(it.e || {}, opciones, Object.assign({ resultado }, ctx)) });
      /* en completamente al azar y bloques, los supuestos del mismo modelo se revisan solos */
      if (SUPUESTOS_SOLOS.includes(it.metodo) && SP.metodos.supuestos) {
        try {
          const es = { respuesta: it.e.respuesta, tratamientos: [].concat(it.e.tratamientos || []), bloque: it.e.bloque || '' };
          const rs = SP.ejecutar('supuestos', t, es, SP.opcionesCon(SP.metodos.supuestos, {})).resultado;
          res.supuestos = { r: rs, rep: SP.metodos.supuestos.reporte(rs) };
        } catch (e) { res.supuestos = null; }
      }
      res.titulo = it.titulo || rep.titulo + (respuestaDe(it.e || {}) ? ' · ' + respuestaDe(it.e || {}) : '');
      res.parrafo = SP.informe.parrafo(it.metodo, resultado, rep, it.e || {}, opciones);
      res.figurasHTML = it.bloque === 3 || !SP.app.analisis || !SP.app.analisis.graficasDe ? '' : SP.app.analisis.graficasDe(it.metodo, resultado, { barras: est.opciones.barras });
      res.figuras = figurasDe(res.figurasHTML);
      res.detalles = detalles(it, res, t);
    } catch (e) {
      if (e === PENDIENTE) {
        res.pendiente = true;
        res.titulo = it.titulo || (SP.metodos[it.metodo] ? SP.metodos[it.metodo].nombre : it.metodo);
        return res;
      }
      if (!(e instanceof SP.ErrorSP) && !(e && e.arreglo !== undefined)) console.error(e);
      res.error = e;
      res.titulo = it.titulo || (SP.metodos[it.metodo] ? SP.metodos[it.metodo].nombre : it.metodo);
    }
    cache.set(it.id, { datos: versionDatos, clave: clave(it) + it.titulo, barras: est.opciones.barras, res });
    return res;
  }
  est.calcular = calcular;
  /* título y descripción de cada gráfica (la descripción declara las barras de error y se usa en la leyenda) */
  function figurasDe(html) {
    if (!html) return [];
    const t = document.createElement('template');
    t.innerHTML = html;
    return [...t.content.querySelectorAll('figure.sp-grafica')].map(f => {
      const svg = f.querySelector('svg');
      return { titulo: (f.querySelector('figcaption') || {}).textContent || '', descripcion: svg ? svg.getAttribute('aria-label') || '' : '' };
    });
  }
  /* los detalles técnicos (los mismos de las notas técnicas de Análisis en el nivel Experto: js/interfaz/detalle.js) */
  const detalles = (it, res, t) => SP.detalle.filas({ metodo: it.metodo, e: it.e, opciones: res.opciones, r: res.r, ms: res.ms, nota: it.nota, tabla: t });
  /** Todo lo que necesita el documento: un elemento por análisis que se pudo calcular. */
  est.elementos = () => est.items.map(it => ({ it, res: calcular(it) })).filter(x => !x.res.error && !x.res.pendiente).map(({ it, res }) => ({
    item: it, titulo: res.titulo, id: it.metodo, e: it.e, op: res.opciones, r: res.r, rep: res.rep, codigo: res.codigo, supuestos: res.supuestos,
    detalles: res.detalles, visibles: it.visibles, figurasHTML: res.figurasHTML, figuras: res.figuras, parrafo: res.parrafo,
  }));

  /* ---------------- pintar el bloque ---------------- */
  const ETIQUETA = { verde: 'Bien', ambar: 'Revisar', rojo: 'Problema', gris: 'No aplica' };
  const PEOR = { gris: 0, verde: 1, ambar: 2, rojo: 3 };
  function semaforo(sem, recs) {
    if (!sem || !sem.length) return '';
    const g = sem.map(s => s.color).reduce((a, b) => (PEOR[b] > PEOR[a] ? b : a), 'verde');
    return `<div class="semaforo s-${g}" role="group" aria-label="${esc(T('Semáforo de los supuestos'))}"><p class="semaforo-global">${SP.ui.luz(g)}<b>${esc(({ verde: T('Los supuestos se cumplen'), ambar: T('Hay supuestos que revisar'), rojo: T('Hay supuestos que no se cumplen'), gris: T('Sin datos suficientes') }[g]))}</b></p>` +
      `<ul>${sem.map(s => `<li class="s-${s.color}">${SP.ui.luz(s.color)}<span class="nombre">${esc(s.nombre)}</span><span class="estado">${esc(T(ETIQUETA[s.color]))}</span><span class="texto">${esc(s.texto)}</span></li>`).join('')}</ul></div>` +
      (recs && recs.length ? `<div class="callout"><p><b>${esc(T('Qué hacer'))}</b></p><ul class="ana-rec">${recs.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '');
  }
  function pintar() {
    est.pendiente = false;
    const vacio = !est.items.length;
    $('#repVacio').hidden = !vacio;
    $('#repTrabajo').hidden = vacio;
    if (vacio) return;
    const ti = $('#repTitulo'), au = $('#repAutor');
    if (document.activeElement !== ti) ti.value = est.titulo;
    if (document.activeElement !== au) au.value = est.autor;
    let nc = 0, nf = 0, errores = 0;
    const indice = [], partes = [];
    est.items.forEach((it, k) => {
      const res = calcular(it), num = k + 1, idt = 'repT' + it.id;
      indice.push(`<li><a href="#repItem${it.id}">${esc(num + '. ' + res.titulo)}</a>${res.error ? ' <span class="pill gris">' + esc(T('no se pudo calcular')) + '</span>' : res.pendiente ? ' <span class="pill gris">' + esc(T('calculando')) + '</span>' : ''}</li>`);
      const barra = `<div class="btn-row rep-acciones" role="group" aria-label="${esc(T('Acciones del análisis {n}', { n: num }))}">` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rep="subir" data-id="${it.id}"${k === 0 ? ' disabled' : ''} aria-label="${esc(T('Subir el análisis {n}', { n: num }))}">↑</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rep="bajar" data-id="${it.id}"${k === est.items.length - 1 ? ' disabled' : ''} aria-label="${esc(T('Bajar el análisis {n}', { n: num }))}">↓</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rep="abrir" data-id="${it.id}">${esc(it.bloque === 3 ? T('Abrir en Explorar') : T('Abrir en Análisis'))}</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rep="quitar" data-id="${it.id}">${esc(T('Quitar'))}</button></div>`;
      const ajustes = `<details class="exp-extras rep-ajustes"><summary>${esc(T('Título y nota'))}</summary>` +
        `<label class="field"><span>${esc(T('Título en el reporte'))}</span><input class="input" data-rep-campo="titulo" data-id="${it.id}" value="${esc(it.titulo)}" placeholder="${esc(res.titulo)}"></label>` +
        `<label class="field"><span>${esc(T('Nota (va en los detalles técnicos)'))}</span><textarea class="textarea" rows="2" data-rep-campo="nota" data-id="${it.id}">${esc(it.nota)}</textarea></label></details>`;
      if (res.pendiente) {
        partes.push(`<article class="rep-item" id="repItem${it.id}" aria-labelledby="${idt}"><header class="rep-item-cabeza"><h3 id="${idt}">${esc(num + '. ' + res.titulo)}</h3>${barra}</header>` +
          `<p class="ana-espera small" role="status">${esc(T('Calculando en el motor R… (la primera vez se descarga)'))}</p></article>`);
        return;
      }
      if (res.error) {
        errores++;
        partes.push(`<article class="rep-item" id="repItem${it.id}" aria-labelledby="${idt}"><header class="rep-item-cabeza"><h3 id="${idt}">${esc(num + '. ' + res.titulo)}</h3>${barra}</header>` +
          (SP.errores ? SP.errores.html(res.error, { titulo: T('Este análisis no se pudo calcular con los datos actuales') }) :
            `<div class="msg msg-error"><strong>${esc(T('Este análisis no se pudo calcular con los datos actuales: {m}', { m: res.error.message }))}</strong>${res.error.arreglo ? `<span class="msg-fix">${esc(res.error.arreglo)}</span>` : ''}</div>`) + '</article>');
        return;
      }
      const cuadros = res.rep.cuadros.map(q => { nc++; return SP.cuadros.html(q, { numero: nc, visibles: it.visibles, contexto: Object.assign(SP.lectura ? SP.lectura.contexto(res.r, res.opciones) : {}, it.bloque === 3 ? { descriptivo: true } : {}) }) + `<div class="btn-row exp-acciones cuadro-acciones"><button type="button" class="btn btn-secondary btn-sm" data-rep="copiar-cuadro" data-id="${it.id}" data-cuadro="${esc(q.id)}">${esc(T('Copiar cuadro {n}', { n: nc }))}</button></div>`; }).join('');
      let figs = '';
      if (res.figurasHTML) {
        const t = document.createElement('template');
        t.innerHTML = res.figurasHTML;
        t.content.querySelectorAll('figure.sp-grafica').forEach(f => { nf++; const cap = f.querySelector('figcaption'); if (cap) cap.innerHTML = `<b>${esc(T('Figura {n}.', { n: nf }))}</b> ${esc(cap.textContent)}`; });
        const div = document.createElement('div'); div.appendChild(t.content.cloneNode(true));
        figs = div.innerHTML;
      }
      const sup = res.supuestos ? semaforo(res.supuestos.rep.semaforo, res.supuestos.rep.recomendaciones) : semaforo(res.rep.semaforo, res.rep.recomendaciones);
      const p = res.parrafo, claro = SP.reportar && it.bloque !== 3 ? SP.reportar.claro(it.metodo, res.r, res.rep) : '';
      partes.push(`<article class="rep-item" id="repItem${it.id}" aria-labelledby="${idt}">` +
        `<header class="rep-item-cabeza"><h3 id="${idt}">${esc(num + '. ' + res.titulo)}</h3>${barra}</header>` + ajustes +
        claro + `<div class="callout exp-conclusion${claro ? ' conclusion-tecnica' : ''}">${res.rep.conclusiones.map(x => `<p>${esc(x)}</p>`).join('')}</div>` +
        cuadros + figs +
        (sup ? `<h4 class="rep-sub">${esc(T('Supuestos'))}</h4>${sup}` : '') +
        `<section class="rep-parrafo" aria-label="${esc(T('Párrafo para la tesis o el artículo'))}"><h4 class="rep-sub">${esc(T('Para tu tesis o artículo'))}</h4>` +
        (p.metodos ? `<p><b>${esc(T('Métodos.'))}</b> ${esc(p.metodos)}</p>` : '') + (p.resultados ? `<p><b>${esc(T('Resultados.'))}</b> ${esc(p.resultados)}</p>` : '') +
        `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" data-rep="copiar-parrafo" data-id="${it.id}">${esc(T('Copiar el párrafo'))}</button>` +
        `<span class="small muted">${esc(T('Es un punto de partida: revisa la redacción y agrega tu interpretación.'))}</span></div>` +
        (SP.reportar ? SP.reportar.html({ metodo: it.metodo, r: res.r, e: it.e || {}, op: res.opciones, ctx: it.bloque === 3 ? res.ctx : null, tabla: res.tabla }) : '') + '</section>' +
        `<details class="exp-extras rep-tecnico"><summary>${esc(T('Detalles técnicos'))}</summary><dl class="dat-kv rep-detalles">${res.detalles.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></details>` +
        `<details class="exp-codigo"><summary>${esc(T('Código R equivalente'))}</summary><pre><code>${esc(res.codigo)}</code></pre>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rep="copiar-r" data-id="${it.id}">${esc(T('Copiar el código'))}</button></details></article>`);
    });
    const d = SP.app.datos;
    $('#repResumen').textContent = T('{k} análisis · {c} cuadros · {f} figuras{d}{e}', { k: est.items.length, c: nc, f: nf,
      d: d && d.origen ? T(' · datos: {o}', { o: d.origen }) : '', e: errores ? T(' · {e} sin calcular', { e: errores }) : '' });
    $('#repIndice').innerHTML = indice.join('');
    $('#repItems').innerHTML = partes.join('');
    /* el nivel de detalle (js/interfaz/detalle.js): Básico abre las lecturas; Experto, los detalles y el código */
    $('#repDetalle').innerHTML = SP.detalle.selector() + SP.detalle.avisoBasico();
    SP.detalle.aplicar($('#repItems'));
  }
  est.pintar = pintar;

  const textoParrafos = (lista, todos) => {
    const ms = lista.map(x => x.parrafo.metodos).filter(Boolean), rs = lista.map((x, k) => (todos ? (k + 1) + '. ' : '') + x.parrafo.resultados).filter(Boolean);
    if (todos) ms.push(SP.informe.software(lista).texto);
    return T('Métodos') + '\n\n' + ms.join('\n\n') + '\n\n' + T('Resultados') + '\n\n' + rs.join('\n\n');
  };

  function iniciar() {
    const panel = $('#panel-5');
    if (!panel) return;
    $('#repTitulo').addEventListener('input', e => { est.titulo = e.target.value; });
    $('#repAutor').addEventListener('input', e => { est.autor = e.target.value; guardar('autor', est.autor); });
    $('#repItems').addEventListener('change', e => {
      const el = e.target.closest('[data-rep-campo]');
      if (!el) return;
      const it = est.items.find(x => x.id === +el.dataset.id);
      if (!it) return;
      it[el.dataset.repCampo] = el.value;
      cambio();
    });
    panel.addEventListener('click', async e => {
      const b = e.target.closest('[data-rep]');
      if (!b) return;
      const id = +b.dataset.id, it = est.items.find(x => x.id === id), accion = b.dataset.rep;
      if (accion === 'copiar-todo') {
        const lista = est.elementos();
        if (await SP.cuadros.copiar(textoParrafos(lista, true))) L() && L().toast(T('Párrafos copiados.'), { type: 'success' });
        return;
      }
      if (!it) return;
      if (accion === 'subir') est.mover(id, -1);
      else if (accion === 'bajar') est.mover(id, 1);
      else if (accion === 'quitar') { est.quitar(id); if (L()) L().toast(T('Análisis quitado del reporte.'), {}); }
      else if (accion === 'abrir') {
        if (it.bloque === 3) { SP.app.ir(3); if (L()) L().toast(T('Este resumen se armó en Explorar; ahí se puede ajustar y agregar de nuevo.'), {}); }
        else { SP.app.analisis.usar(it.metodo, it.e, it.op); SP.app.ir(4); }
      } else if (accion === 'copiar-parrafo' || accion === 'copiar-r' || accion === 'copiar-cuadro') {
        const res = calcular(it);
        const texto = accion === 'copiar-r' ? res.codigo : accion === 'copiar-parrafo' ? textoParrafos([{ parrafo: res.parrafo }], false)
          : SP.cuadros.tsv(res.rep.cuadros.find(q => q.id === b.dataset.cuadro), it.visibles);
        if (texto && await SP.cuadros.copiar(texto)) L() && L().toast({ 'copiar-r': T('Código R copiado.'), 'copiar-parrafo': T('Párrafo copiado.'), 'copiar-cuadro': T('Cuadro copiado.') }[accion], { type: 'success' });
      }
    });
    document.addEventListener('sp:datos', () => { versionDatos++; remotos.clear(); if (panel.classList.contains('active')) pintar(); else est.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 5 && est.pendiente) pintar(); });
    if (panel.classList.contains('active')) pintar();
  }
  SP.alArrancar(iniciar);
})();

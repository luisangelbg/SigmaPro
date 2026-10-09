/* SigmaPro — modo presentación (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un resultado de Análisis o de Explorar, o el reporte completo, como diapositivas a pantalla completa y con letra
   grande, para proyectar en una clase o en una reunión: el título del análisis, «En pocas palabras», la conclusión,
   cada gráfica y cada cuadro (con sus notas), en el orden en que están y como se ven en el nivel de detalle elegido.
   Lo abre un botón «Presentar» (data-presentar="#contenedor"). ← → (o Re Pág / Av Pág y la barra espaciadora)
   cambian de diapositiva, Inicio y Fin van a la primera y a la última, y Esc sale; el foco vuelve al botón.
   Las diapositivas son copias de lo que está en la pantalla (sin ids ni botones): no cambian nada del resultado.

     SP.presentacion.abrir(contenedor, boton?)   true si hay qué presentar
     SP.presentacion.diapositivas(contenedor)    [elemento] (lo que se presentaría)
     SP.presentacion.cerrar() */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const PARTES = '.rep-item-cabeza h3, .exp-cabeza h3, .sp-claro, .exp-conclusion, figure.sp-grafica, .tabla-wrap';
  const est = { capa: null, i: 0, partes: [], origen: null };
  const visible = el => !!(el && el.getClientRects().length);

  function diapositivas(raiz) {
    if (!raiz) return [];
    return [...raiz.querySelectorAll(PARTES)].filter(el => visible(el) && !el.closest('details:not([open])'));
  }
  /* los ids de la copia, renombrados con sus referencias (las gráficas recortan y marcan con url(#…)), para que no se
     repitan en la página */
  function renombrarIds(c) {
    const mapa = new Map();
    [c, ...c.querySelectorAll('[id]')].forEach(x => { if (x.id) { mapa.set(x.id, x.id + '-pres'); x.id = x.id + '-pres'; } });
    if (!mapa.size) return;
    for (const x of [c, ...c.querySelectorAll('*')]) for (const a of [...x.attributes]) {
      let v = a.value, nuevo = v;
      if (v.includes('url(#')) nuevo = v.replace(/url\(#([^)]+)\)/g, (m, id) => (mapa.has(id) ? `url(#${mapa.get(id)})` : m));
      else if (/^#/.test(v) && mapa.has(v.slice(1))) nuevo = '#' + mapa.get(v.slice(1));
      else if (/^aria-(labelledby|describedby)$|^for$/.test(a.name)) nuevo = v.split(/\s+/).map(t => mapa.get(t) || t).join(' ');
      if (nuevo !== v) x.setAttribute(a.name, nuevo);
    }
  }
  /* la copia de una parte: sin botones ni controles, con sus ids renombrados; un cuadro lleva sus notas */
  function copia(el) {
    const c = el.cloneNode(true);
    renombrarIds(c);
    c.querySelectorAll('button, .lfs-btn, .lg-lectura, input, select, details').forEach(x => x.remove());
    c.querySelectorAll('[tabindex]').forEach(x => x.removeAttribute('tabindex'));
    c.removeAttribute('tabindex');
    const caja = document.createElement('div');
    caja.className = 'sp-pres-parte';
    if (/^H3$/.test(el.tagName)) { const h = document.createElement('h2'); h.className = 'sp-pres-titulo'; h.textContent = el.textContent; caja.appendChild(h); return caja; }
    caja.appendChild(c);
    if (el.classList.contains('tabla-wrap') && el.nextElementSibling && el.nextElementSibling.classList.contains('pie-cuadro')) {
      const n = el.nextElementSibling.cloneNode(true); renombrarIds(n); caja.appendChild(n);
    }
    return caja;
  }
  /* el título de la sección a la que pertenece una parte (el análisis) */
  function seccion(el) {
    const art = el.closest('.rep-item');
    const h = art ? art.querySelector('.rep-item-cabeza h3') : (el.closest('#anaResultado, #expResultado') || document).querySelector('.exp-cabeza h3');
    return h ? h.textContent.trim() : '';
  }

  function pintar() {
    const c = est.capa, el = est.partes[est.i];
    c.querySelector('.sp-pres-escena').replaceChildren(copia(el));
    c.querySelector('.sp-pres-seccion').textContent = seccion(el);
    c.querySelector('.sp-pres-cuenta').textContent = T('{k} de {n}', { k: est.i + 1, n: est.partes.length });
    c.querySelector('[data-pres="ant"]').disabled = est.i === 0;
    c.querySelector('[data-pres="sig"]').disabled = est.i === est.partes.length - 1;
    const anuncio = c.querySelector('[data-pres-anuncio]'); if (anuncio) anuncio.textContent = T('Diapositiva {k} de {n}', { k: est.i + 1, n: est.partes.length });
  }
  function ir(i) { if (!est.capa) return; est.i = Math.max(0, Math.min(est.partes.length - 1, i)); pintar(); }
  function tecla(e) {
    if (!est.capa) return;
    const k = e.key;
    if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }
    else if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); ir(est.i + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); ir(est.i - 1); }
    else if (k === 'Home') { e.preventDefault(); ir(0); }
    else if (k === 'End') { e.preventDefault(); ir(est.partes.length - 1); }
    else if (k === 'Tab') {   /* el foco se queda en la presentación */
      const f = [...est.capa.querySelectorAll('button:not(:disabled)')], a = f.indexOf(document.activeElement);
      e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }

  /** Abre la presentación de lo que hay en un contenedor. */
  function abrir(raiz, boton) {
    const partes = diapositivas(raiz);
    if (!partes.length) { if (window.LABG && window.LABG.toast) window.LABG.toast(T('No hay nada que presentar todavía.'), { type: 'warning' }); return false; }
    cerrar();
    const c = document.createElement('div');
    c.className = 'sp-pres';
    c.setAttribute('role', 'dialog'); c.setAttribute('aria-modal', 'true'); c.setAttribute('aria-label', T('Modo presentación'));
    c.innerHTML = `<div class="sp-pres-barra"><span class="sp-pres-seccion"></span><span class="sp-pres-cuenta" aria-hidden="true"></span>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-pres="ant" aria-label="${esc(T('Diapositiva anterior'))}">‹</button>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-pres="sig" aria-label="${esc(T('Diapositiva siguiente'))}">›</button>` +
      `<button type="button" class="btn btn-secondary btn-sm" data-pres="fin">${esc(T('Salir (Esc)'))}</button></div>` +
      `<p class="sr-only" role="status" data-pres-anuncio></p><div class="sp-pres-escena"></div>`;
    c.addEventListener('click', e => {
      const b = e.target.closest('[data-pres]');
      if (!b) return;
      if (b.dataset.pres === 'ant') ir(est.i - 1); else if (b.dataset.pres === 'sig') ir(est.i + 1); else cerrar();
    });
    document.body.appendChild(c);
    Object.assign(est, { capa: c, i: 0, partes, origen: boton || document.activeElement });
    document.documentElement.classList.add('sp-presentando');
    document.addEventListener('keydown', tecla, true);
    pintar();
    c.querySelector('[data-pres="sig"]:not(:disabled), [data-pres="fin"]').focus();
    if (c.requestFullscreen) c.requestFullscreen().catch(() => { /* sin pantalla completa: la capa ya cubre la ventana */ });
    return true;
  }
  function cerrar() {
    if (!est.capa) return;
    const c = est.capa;
    est.capa = null;
    document.removeEventListener('keydown', tecla, true);
    document.documentElement.classList.remove('sp-presentando');
    if (document.fullscreenElement === c && document.exitFullscreen) document.exitFullscreen().catch(() => { /* nada */ });
    c.remove();
    const o = est.origen; est.origen = null;
    if (o && o.isConnected && o.focus) o.focus({ preventScroll: true });
  }

  function iniciar() {
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-presentar]');
      if (b) { e.preventDefault(); abrir(document.querySelector(b.dataset.presentar), b); }
    });
    /* al salir de la pantalla completa con la tecla del navegador, también se cierra */
    document.addEventListener('fullscreenchange', () => { if (est.capa && !document.fullscreenElement && est.capa.dataset.pantalla === '1') cerrar(); if (est.capa && document.fullscreenElement === est.capa) est.capa.dataset.pantalla = '1'; });
  }
  SP.presentacion = { abrir, cerrar, diapositivas, estado: est };
  SP.alArrancar(iniciar);
})();

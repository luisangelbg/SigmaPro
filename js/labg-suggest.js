/* LABGSuggest 1.0.0 — tarjetas «Continúa en la suite LABG» para las apps de la suite.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later.

   Sin dependencias, sin ventanas emergentes y sin peticiones: devuelve HTML como texto y escucha los clics con un solo
   manejador. Cada tarjeta lleva el logo oficial de la app como enlace (pestaña nueva, rel="noopener"), su nombre, una
   frase de por qué conviene en ese lugar, «Enviar datos a <App>» cuando la app de origen lo permite, y un botón para
   no volver a sugerirla en ese lugar (se recuerda en el navegador). La app pone los datos de las apps (nombre, url,
   logo, estado) y los motivos ya traducidos.

     LABGSuggest.tarjeta(app, { motivo, contexto, enviar })     una tarjeta; enviar = true muestra el botón
     LABGSuggest.franja(lista, { titulo, contexto, enviar, clase })   varias tarjetas con su título ('' si todas se ocultaron)
     LABGSuggest.conectar({ alEnviar(appId, boton) })            una vez: ocultar y enviar
     LABGSuggest.oculta(contexto, appId) · LABGSuggest.mostrarTodas()

   app = { id, nombre?, url, logo, estado ('publicada' | 'pendiente') } */
(function (raiz) {
  'use strict';
  const VERSION = '1.0.0';
  const CLAVE = 'labg.suggest.ocultas';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ingles = () => /^en/i.test((raiz.document && raiz.document.documentElement.lang) || '');
  const t = (es, en, v) => (ingles() ? en : es).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : m));
  const leer = () => { try { return new Set(JSON.parse(localStorage.getItem(CLAVE)) || []); } catch (e) { return new Set(); } };
  const guardar = s => { try { localStorage.setItem(CLAVE, JSON.stringify([...s])); } catch (e) { /* sin almacenamiento */ } };
  const llave = (ctx, id) => (ctx || '*') + '|' + id;
  const oculta = (ctx, id) => leer().has(llave(ctx, id));
  const nombreDe = a => a.nombre || a.id;
  const publicada = a => a.estado !== 'pendiente' && /^https:\/\//.test(a.url || '');

  function tarjeta(a, o) {
    o = o || {};
    if (oculta(o.contexto, a.id)) return '';
    const n = nombreDe(a), pub = publicada(a);
    const logo = `<img src="${esc(a.logo)}" alt="" width="44" height="44" loading="lazy" decoding="async">`;
    return `<div class="lgs-tarjeta${pub ? '' : ' lgs-pendiente'}" data-lgs-app="${esc(a.id)}" data-lgs-ctx="${esc(o.contexto || '*')}">` +
      (pub ? `<a class="lgs-logo" href="${esc(a.url)}" target="_blank" rel="noopener" aria-label="${esc(t('Abrir {a} (en una pestaña nueva)', 'Open {a} (in a new tab)', { a: n }))}">${logo}</a>`
        : `<span class="lgs-logo" aria-hidden="true">${logo}</span>`) +
      `<div class="lgs-cuerpo"><p class="lgs-nombre">${esc(n)}${pub ? '' : ` <span class="lgs-pronto">${esc(t('Próximamente', 'Coming soon'))}</span>`}</p>` +
      `<p class="lgs-motivo">${esc(o.motivo || '')}</p>` +
      (o.enviar && pub ? `<button type="button" class="lgs-enviar" data-lgs-enviar="${esc(a.id)}" title="${esc(t('Descarga tus datos en el formato que lee {a} y abre la app', 'Downloads your data in the format {a} reads and opens the app', { a: n }))}">${esc(t('Enviar datos a {a}', 'Send data to {a}', { a: n }))}</button>` : '') +
      `</div><button type="button" class="lgs-cerrar" data-lgs-ocultar aria-label="${esc(t('No volver a sugerir {a} aquí', 'Do not suggest {a} here again', { a: n }))}" title="${esc(t('No volver a sugerir aquí', 'Do not suggest here again'))}">×</button></div>`;
  }
  function franja(lista, o) {
    o = o || {};
    const html = (lista || []).map(x => tarjeta(x.app, Object.assign({}, o, { motivo: x.motivo }))).join('');
    if (!html) return '';
    return `<section class="lgs-franja${o.clase ? ' ' + o.clase : ''}" aria-label="${esc(o.titulo || t('Continúa en la suite LABG', 'Continue in the LABG suite'))}">` +
      `<p class="lgs-titulo">${esc(o.titulo || t('Continúa en la suite LABG', 'Continue in the LABG suite'))}</p><div class="lgs-tarjetas">${html}</div></section>`;
  }
  let conectado = false, alEnviar = null;
  function conectar(op) {
    alEnviar = (op && op.alEnviar) || alEnviar;
    if (conectado) return;
    conectado = true;
    raiz.document.addEventListener('click', e => {
      const x = e.target && e.target.closest && e.target.closest('[data-lgs-ocultar], [data-lgs-enviar]');
      if (!x) return;
      const card = x.closest('.lgs-tarjeta');
      if (x.hasAttribute('data-lgs-ocultar') && card) {
        const s = leer(); s.add(llave(card.dataset.lgsCtx, card.dataset.lgsApp)); guardar(s);
        const fr = card.closest('.lgs-franja');
        const sig = card.nextElementSibling || card.previousElementSibling;
        card.remove();
        if (fr && !fr.querySelector('.lgs-tarjeta')) fr.remove();
        else if (sig) { const b = sig.querySelector('button, a'); if (b) b.focus(); }
      } else if (x.hasAttribute('data-lgs-enviar') && alEnviar) alEnviar(x.getAttribute('data-lgs-enviar'), x);
    });
  }
  raiz.LABGSuggest = { version: VERSION, tarjeta, franja, conectar, oculta, mostrarTodas: () => guardar(new Set()), t };
})(typeof window !== 'undefined' ? window : globalThis);

/* SigmaPro — idioma de la interfaz (Hito 4.5).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El idioma se decide antes de cargar el núcleo (un guion corto en el <head> de index.html): ?lang=en|es en la
   dirección o el que se eligió la última vez (localStorage «sigmapro.idioma»); con inglés se carga js/i18n/en.js, que
   deja el catálogo en self.SP_CATALOGO, y SP.T lo usa desde el primer texto. Cambiar de idioma guarda el trabajo y
   recarga la página (los textos de los métodos se arman al cargar).

   Lo que viene escrito en index.html (títulos, ayudas, botones) se traduce aquí una vez, al arrancar: cada nodo de
   texto y los atributos title, aria-label, placeholder y alt cuyo texto (sin espacios de más) está en el catálogo. */
(function () {
  'use strict';
  const T = SP.T, cat = SP.T.catalogo;
  const limpio = s => s.replace(/\s+/g, ' ').trim();

  /** Traduce el HTML fijo de la página (una sola vez). */
  function traducirPagina(raiz) {
    if (!cat) return;
    const recorre = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.parentElement && n.parentElement.closest('script, style, code, pre, [data-sin-traducir]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodos = [];
    for (let n = recorre.nextNode(); n; n = recorre.nextNode()) nodos.push(n);
    for (const n of nodos) {
      const k = limpio(n.nodeValue);
      if (!k || !Object.prototype.hasOwnProperty.call(cat, k)) continue;
      const ini = /^\s/.test(n.nodeValue) ? ' ' : '', fin = /\s$/.test(n.nodeValue) ? ' ' : '';
      n.nodeValue = ini + cat[k] + fin;
    }
    for (const el of raiz.querySelectorAll('[title], [aria-label], [placeholder], [alt]')) {
      for (const a of ['title', 'aria-label', 'placeholder', 'alt']) {
        const v = el.getAttribute(a);
        if (v && Object.prototype.hasOwnProperty.call(cat, limpio(v))) el.setAttribute(a, cat[limpio(v)]);
      }
    }
    if (Object.prototype.hasOwnProperty.call(cat, limpio(document.title))) document.title = cat[limpio(document.title)];
    const d = document.querySelector('meta[name="description"]');
    if (d && Object.prototype.hasOwnProperty.call(cat, limpio(d.content))) d.content = cat[limpio(d.content)];
  }

  /** Cambiar de idioma: se guarda el trabajo y se recarga con el idioma nuevo. */
  async function cambiar(l) {
    if (l === SP.IDIOMA) return;
    try { localStorage.setItem('sigmapro.idioma', l); } catch (e) { /* sin almacenamiento: va en la dirección */ }
    try { if (SP.app && SP.app.autoguardado && SP.app.autoguardado.guardar) await SP.app.autoguardado.guardar(); } catch (e) { /* se intentó */ }
    const u = new URL(location.href);
    u.searchParams.set('lang', l);
    location.replace(u.toString());
  }

  traducirPagina(document.body);
  for (const b of document.querySelectorAll('[data-lang]')) {
    b.setAttribute('aria-pressed', String(b.dataset.lang === SP.IDIOMA));
    b.addEventListener('click', () => cambiar(b.dataset.lang));
  }
  SP.idioma = { traducirPagina, cambiar, T };
})();

/* SigmaPro — temas de las gráficas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Seis temas para todas las gráficas de la app (Análisis, Explorar y Figuras): SigmaPro, Minimalista, Cuadrícula,
   Revista, Daltonismo y Presentación. El tema es un atributo de <html> (data-graficas) que el guion del <head> pone
   antes de pintar; los colores, trazos y letras de cada uno están en css/sigma.css. Se recuerda en el navegador
   («sigmapro.graficas.tema»). Las descargas (js/interfaz/figuras.js) y el Estudio de figuras toman la gráfica con su
   tema. Cada <select data-graf-tema> de la página cambia el tema y todos se mantienen iguales. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const TEMAS = () => [
    ['sigmapro', T('SigmaPro (oro y negro)')], ['minimalista', T('Minimalista (grises, sin rejilla)')], ['cuadricula', T('Cuadrícula (panel gris)')],
    ['revista', T('Revista (blanco y negro, serifas)')], ['daltonismo', T('Daltonismo (paleta Okabe-Ito)')], ['presentacion', T('Presentación (letras grandes)')],
  ];
  const actual = () => document.documentElement.getAttribute('data-graficas') || 'sigmapro';
  /** Pone el tema en todas las gráficas. */
  function poner(id) {
    if (!TEMAS().some(t => t[0] === id)) id = 'sigmapro';
    if (id === 'sigmapro') document.documentElement.removeAttribute('data-graficas'); else document.documentElement.setAttribute('data-graficas', id);
    try { localStorage.setItem('sigmapro.graficas.tema', id); } catch (e) { /* sin almacenamiento */ }
    document.querySelectorAll('select[data-graf-tema]').forEach(s => { if (s.value !== id) s.value = id; });
    document.dispatchEvent(new CustomEvent('sp:tema-graficas', { detail: { tema: id } }));
  }
  /** El selector, para ponerlo junto a las gráficas. */
  const selector = () => `<label class="graf-tema"><span>${esc(T('Tema de las gráficas'))}</span><select data-graf-tema>` +
    TEMAS().map(([k, n]) => `<option value="${k}"${k === actual() ? ' selected' : ''}>${esc(n)}</option>`).join('') + '</select></label>';
  document.addEventListener('change', e => { if (e.target && e.target.matches && e.target.matches('select[data-graf-tema]')) poner(e.target.value); });
  /* los selectores escritos en index.html arrancan con el tema guardado */
  const sincronizar = () => document.querySelectorAll('select[data-graf-tema]').forEach(s => { s.value = actual(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sincronizar); else sincronizar();
  SP.temasGraficas = { TEMAS, actual, poner, selector };
})();

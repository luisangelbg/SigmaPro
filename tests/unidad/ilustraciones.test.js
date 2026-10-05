/* Pruebas de js/interfaz/ilustraciones.js (las miniaturas del catálogo) y de los temas de las gráficas
   (js/interfaz/temas-graficas.js). Usan el DOM: solo en el navegador (tests/index.html). */
SPT.describir('Catálogo · ilustraciones y temas de las gráficas', () => {
  SPT.caso('Cada análisis del catálogo tiene su ilustración y es un SVG decorativo bien formado', () => {
    const sin = Object.keys(SP.metodos).filter(id => !SP.ilustraciones.ids().includes(id));
    SPT.igualJSON(sin, []);
    for (const id of Object.keys(SP.metodos)) {
      const s = SP.ilustraciones.svg(id);
      const doc = new DOMParser().parseFromString(s, 'image/svg+xml');
      SPT.afirmar(!doc.querySelector('parsererror'), id + ': SVG mal formado');
      const r = doc.documentElement;
      SPT.igual(r.getAttribute('aria-hidden'), 'true', id);
      SPT.igual(r.getAttribute('viewBox'), '0 0 64 40', id);
      SPT.afirmar(r.childElementCount > 0, id + ': vacía');
      SPT.afirmar(!/NaN|undefined/.test(s), id + ': NaN o undefined en el SVG');
    }
    SPT.afirmar(/<svg/.test(SP.ilustraciones.svg('no-existe')), 'genérica');
  }, { navegador: true });
  SPT.caso('Temas: seis, con SigmaPro primero; poner() cambia <html> y lo recuerda; uno desconocido vuelve a SigmaPro', () => {
    const html = document.documentElement, antes = html.getAttribute('data-graficas');
    try {
      SPT.igualJSON(SP.temasGraficas.TEMAS().map(t => t[0]), ['sigmapro', 'minimalista', 'cuadricula', 'revista', 'daltonismo', 'presentacion']);
      SP.temasGraficas.poner('cuadricula');
      SPT.igual(html.getAttribute('data-graficas'), 'cuadricula');
      SPT.igual(SP.temasGraficas.actual(), 'cuadricula');
      SPT.afirmar(/value="cuadricula" selected/.test(SP.temasGraficas.selector()), 'el selector marca el tema actual');
      SP.temasGraficas.poner('otro');
      SPT.igual(html.getAttribute('data-graficas'), null);
      SPT.igual(SP.temasGraficas.actual(), 'sigmapro');
    } finally {
      if (antes) html.setAttribute('data-graficas', antes); else html.removeAttribute('data-graficas');
      try { localStorage.removeItem('sigmapro.graficas.tema'); } catch (e) { /* sin almacenamiento */ }
    }
  }, { navegador: true });
});

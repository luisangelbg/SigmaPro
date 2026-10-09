/* Pruebas de los errores en palabras y del modo presentación (hito 5.7): js/interfaz/errores.js y
   js/interfaz/presentacion.js. En la app, con un análisis y el reporte: tests/orientacion.mjs. */
SPT.describir('Errores en palabras', () => {
  const X = e => SP.errores.explicar(e);
  SPT.caso('Un error de los datos: su mensaje y su arreglo; sin arreglo, uno sugerido por lo que dice', () => {
    const a = X(new SP.ErrorSP('Hacen falta al menos 8 observaciones.', 'Junta más fechas.'));
    SPT.igual(a.tipo, 'datos'); SPT.igual(a.arreglo, 'Junta más fechas.'); SPT.igual(a.detalle, '');
    SPT.afirmar(/tipo a numérica/.test(X(new SP.ErrorSP('La respuesta debe ser numérica.')).arreglo), 'numérica');
    SPT.afirmar(/un solo papel/.test(X(new SP.ErrorSP('«rend» está en dos papeles a la vez.')).arreglo), 'dos papeles');
    SPT.afirmar(/vuelve a elegirlas/.test(X(new SP.ErrorSP('No existe la columna «x».')).arreglo), 'columna que ya no existe');
    SPT.igual(X(new SP.ErrorSP('Elige la variable de respuesta.')).arreglo, '', 'una instrucción no lleva arreglo');
  }, { navegador: true });
  SPT.caso('Un error de R conocido se traduce y su texto queda en el detalle; uno desconocido, en palabras generales', () => {
    const e = new SP.ErrorSP('R no pudo terminar el cálculo: …'); e.r = 'number of levels of each grouping factor must be < number of observations (problems: parcela)';
    const x = X(e);
    SPT.igual(x.tipo, 'r');
    SPT.afirmar(/tantos niveles como observaciones/.test(x.mensaje) && /efecto fijo/.test(x.arreglo) && x.detalle === e.r, JSON.stringify(x));
    const o = new SP.ErrorSP('R no pudo terminar el cálculo: algo raro'); o.r = 'algo raro';
    SPT.afirmar(/motor R devolvió un error/.test(X(o).mensaje), 'desconocido');
  }, { navegador: true });
  SPT.caso('Un error del programa no culpa a los datos y deja el detalle para reportarlo', () => {
    let err; try { null.x(); } catch (e) { err = e; }
    const x = X(err), h = SP.errores.html(err);
    SPT.igual(x.tipo, 'programa');
    SPT.afirmar(/No es un problema de tus datos/.test(x.mensaje) && /Reportar un problema/.test(x.arreglo), x.mensaje);
    SPT.afirmar(/TypeError/.test(x.detalle), x.detalle);
    SPT.afirmar(/<details class="sp-error-d">/.test(h) && /data-error-copiar/.test(h), 'el detalle plegado');
    SPT.afirmar(!/<details/.test(SP.errores.html(new SP.ErrorSP('Elige la variable.'))), 'un error de los datos no lleva detalle');
    SPT.afirmar(/Este análisis no se pudo calcular/.test(SP.errores.html(new SP.ErrorSP('x'), { titulo: 'Este análisis no se pudo calcular' })), 'el título del reporte');
  }, { navegador: true });
});

SPT.describir('Modo presentación', () => {
  SPT.caso('Una diapositiva por título, recuadro, conclusión, gráfica y cuadro; ← → las recorren y Esc sale', async () => {
    const c = document.createElement('div');
    c.innerHTML = '<div class="exp-cabeza"><h3>Bloques</h3><button data-x>b</button></div><div class="sp-claro"><ul><li>uno</li></ul></div>' +
      '<div class="callout exp-conclusion"><p>dos</p></div>' +
      '<figure class="sp-grafica"><svg width="40" height="20"><defs><clipPath id="t-recorte"><rect width="9" height="9"/></clipPath></defs><g clip-path="url(#t-recorte)"><rect width="40" height="20"/></g></svg></figure>' + SP.cuadros.html({ id: 'anova', titulo: 'Cuadro', columnas: [{ clave: 'F', titulo: 'F', formato: 'f2' }], filas: [{ F: 2 }], notas: ['nota'] }, { lectura: false });
    document.body.appendChild(c);
    const b = document.createElement('button'); document.body.appendChild(b); b.focus();
    try {
      SPT.igual(SP.presentacion.diapositivas(c).length, 5);
      SPT.afirmar(SP.presentacion.abrir(c, b), 'abrió');
      const capa = document.querySelector('.sp-pres');
      SPT.afirmar(capa && /1 de 5/.test(capa.querySelector('.sp-pres-cuenta').textContent), 'la cuenta');
      SPT.afirmar(capa.querySelector('.sp-pres-titulo') && !capa.querySelector('.sp-pres-escena button'), 'el título, sin botones');
      const tecla = k => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      tecla('ArrowRight'); tecla('ArrowRight'); tecla('ArrowRight');
      const g = capa.querySelector('.sp-pres-escena');
      SPT.afirmar(g.querySelector('clipPath#t-recorte-pres') && g.querySelector('g[clip-path="url(#t-recorte-pres)"]'), 'la gráfica, con sus ids y sus referencias renombrados');
      SPT.igual(document.querySelectorAll('#t-recorte').length, 1, 'sin ids repetidos en la página');
      tecla('End');
      SPT.afirmar(/5 de 5/.test(capa.querySelector('.sp-pres-cuenta').textContent), 'la última');
      SPT.afirmar(capa.querySelector('.sp-pres-escena table.sp-cuadro') && /nota/.test(capa.querySelector('.sp-pres-escena').textContent), 'el cuadro con su nota');
      tecla('Escape');
      SPT.afirmar(!document.querySelector('.sp-pres') && document.activeElement === b, 'Esc sale y el foco vuelve');
    } finally { SP.presentacion.cerrar(); c.remove(); b.remove(); }
  }, { navegador: true });
});

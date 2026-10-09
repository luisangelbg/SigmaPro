/* vista: 1400x900 */
/* 4.5: un análisis que no se puede calcular (una prueba t con una sola observación): qué pasó y qué hacer */
(async () => {
  const l = SP.csv.leerColumnas('peso\n5.2\n\n', { delimitador: ',', decimal: '.' });
  SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas }), 'una sola observación'); await W(300);
  await usar('prueba-t', { modo: 'una', variable: 'peso' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.sp-error')], 8);
})()

/* vista: 1400x1300 */
/* 6.1: el bloque Figuras con el reporte del maíz: barras de error, ancho, resumen y las primeras figuras con sus descargas */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(6); await W(1200); limpio();
  window.scrollTo(0, 0); await W(300);
  const t = $$('#figGaleria .fig-tarjeta');
  return caja([$('#figBarra'), $('#figResumen'), t[0], t[1]], 8);
})()

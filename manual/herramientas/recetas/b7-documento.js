/* vista: 1000x1300 */
/* 7.2: el principio del reporte exportado como página HTML */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(5); await W(800);
  const h = await SP.app.exportar.construir.html();
  document.open(); document.write(h.datos); document.close();
  document.documentElement.style.overflow = 'hidden'; await W(1500);
  /* la portada y los métodos, sin el margen de arriba */
  window.__recorte = '0,150,1000,830';
  return window.__recorte;
})()

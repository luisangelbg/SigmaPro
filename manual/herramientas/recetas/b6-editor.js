/* vista: 1400x1300 */
/* 6.3: el editor ✎ abierto sobre la figura de las medias de los híbridos */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(6); await W(1200); limpio();
  const t = $$('#figGaleria .fig-tarjeta')[1], b = t.querySelector('.fig-ed');
  irA(t, 110); await W(300);
  b.click(); await W(900); limpio();
  const p = $('.fe-panel');
  return caja([t, p], 8);
})()

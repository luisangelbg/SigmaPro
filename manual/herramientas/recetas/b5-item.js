/* vista: 1400x1400 */
/* 5.3: el primer análisis del reporte: su barra, «Título y nota» abierto, la conclusión y el cuadro 1 */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(5); await W(900); limpio();
  const a = $('#repItems .rep-item'); a.querySelector('.rep-ajustes').open = true; await W(200);
  irA(a, 110); await W(300); limpio();
  const t = a.querySelector('table');
  return caja([a.querySelector('.rep-item-cabeza'), a.querySelector('.rep-ajustes'), a.querySelector('.exp-conclusion'), t.closest('.tabla-wrap') || t], 8);
})()

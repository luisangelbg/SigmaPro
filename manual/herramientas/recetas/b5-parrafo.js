/* vista: 1400x1400 */
/* 5.4: el párrafo para la tesis del primer análisis y sus detalles técnicos */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(5); await W(900); limpio();
  const a = $('#repItems .rep-item'), d = [...a.querySelectorAll('details.exp-extras')].find(x => !x.classList.contains('rep-ajustes'));
  d.open = true; await W(200);
  const p = a.querySelector('.rep-parrafo'); irA(p, 110); await W(300); limpio();
  return caja([p, d], 8);
})()

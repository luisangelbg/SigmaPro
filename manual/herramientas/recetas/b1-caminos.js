/* vista: 1400x1100 */
/* 1.2: los tres caminos del Inicio y «Lo último que analizaste» (con dos análisis del maíz en el historial) */
(async () => {
  try { localStorage.removeItem('sigmapro.historial'); } catch (e) { /* nada */ }
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  await usar('comparaciones-medias', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, { metodo: 'tukey' });
  SP.app.ir(1); await W(400);
  const c = $('.caminos'), h = $('#iniHistorial');
  irA(c, 110); await W(300); limpio();
  return caja([c, h], 8);
})()

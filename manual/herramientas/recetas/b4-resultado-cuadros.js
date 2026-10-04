/* vista: 1400x1700 */
/* Bloque 4: los cuadros del mismo resultado (ANOVA, resumen y medias) */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'), caps = [...r.querySelectorAll('table')];
  irA(caps[0], 120); await W(300); limpio();
  return caja([caps[0].closest('.tabla-wrap') || caps[0], caps[1].closest('.tabla-wrap') || caps[1]], 8);
})()

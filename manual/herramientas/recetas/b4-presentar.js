/* vista: 1280x720 */
/* 4.5: el modo presentación del maíz en bloques al azar, en la diapositiva de la gráfica de interacción (la cuarta) */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  window.scrollTo(0, 0); await W(200);
  $('#anaResultado [data-presentar]').click(); await W(400);
  for (let k = 0; k < 3; k++) { $('.sp-pres [data-pres="sig"]').click(); await W(300); }
  limpio();
  return caja([$('.sp-pres')], 0);
})()

/* vista: 1400x1500 */
/* 4.11: comparación de medias de Tukey de los híbridos del maíz */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('comparaciones-medias', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, { metodo: 'tukey', alfa: 0.05 });
  irA($('#anaOpciones'), 110); await W(300); limpio();
  const r = $('#anaResultado'), ts = r.querySelectorAll('table');
  return caja([$('#anaOpciones'), r.querySelector('.exp-cabeza'), ts[1].closest('.tabla-wrap') || ts[1]], 8);
})()

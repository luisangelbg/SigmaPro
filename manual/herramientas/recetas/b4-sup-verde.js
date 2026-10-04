/* vista: 1400x1500 */
/* 4.7: la revisión de los supuestos del maíz: semáforo en verde y las tres gráficas */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('supuestos', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.ana-graficas')], 8);
})()

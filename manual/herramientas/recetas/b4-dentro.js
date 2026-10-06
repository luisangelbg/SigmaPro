/* vista: 1400x1500 */
/* 4.11: Tukey de las dosis dentro de cada híbrido del maíz: una conclusión y una gráfica por híbrido */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('comparaciones-medias', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['dosis'], dentro: ['hibrido'] }, { metodo: 'tukey', alfa: 0.05 });
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.ana-graficas')], 8);
})()

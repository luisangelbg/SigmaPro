/* vista: 1400x1500 */
/* 4.12: ANCOVA del sorgo: conclusión, semáforo de los supuestos y las dos gráficas */
(async () => {
  await ejemplo('Sorgo');
  await usar('ancova', { respuesta: 'rend', tratamientos: ['variedad'], bloque: 'bloque', covariables: ['plantas'] }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), r.querySelector('.semaforo'), r.querySelector('.ana-graficas')], 8);
})()

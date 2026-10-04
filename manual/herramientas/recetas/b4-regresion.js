/* vista: 1400x1300 */
/* 4.12: regresión múltiple del café: conclusión y semáforo de los supuestos */
(async () => {
  await ejemplo('Café');
  await usar('regresion-lineal', { respuesta: 'rendimiento', predictores: ['altitud', 'materia_organica', 'sombra'] }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), r.querySelector('.semaforo')], 8);
})()

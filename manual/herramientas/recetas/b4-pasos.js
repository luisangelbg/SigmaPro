/* vista: 1400x1300 */
/* 4.12: selección paso a paso por AIC con los siete predictores del café */
(async () => {
  await ejemplo('Café');
  await usar('seleccion-pasos', { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, {});
  const r = $('#anaResultado'), t = r.querySelector('table'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), t.closest('.tabla-wrap') || t], 8);
})()

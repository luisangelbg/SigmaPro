/* vista: 1400x1500 */
/* 4.12: las cuatro gráficas de diagnóstico de la regresión del café */
(async () => {
  await ejemplo('Café');
  await usar('regresion-lineal', { respuesta: 'rendimiento', predictores: ['altitud', 'materia_organica', 'sombra'] }, {});
  const g = $('#anaResultado .ana-graficas'); irA(g, 110); await W(300); limpio();
  return caja([g], 8);
})()

/* vista: 1400x1400 */
/* 4.13: matriz de correlaciones del café: el mapa de calor */
(async () => {
  await ejemplo('Café');
  await usar('matriz-correlacion', { variables: ['altitud', 'temperatura', 'materia_organica', 'sombra', 'rendimiento'] }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.ana-graficas figure')], 6);
})()

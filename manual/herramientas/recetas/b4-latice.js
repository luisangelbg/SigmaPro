/* vista: 1400x1400 */
/* 4.10: el alfa-látice de 24 genotipos: el ANOVA intrabloque */
(async () => {
  await ejemplo('Alfa-látice');
  await usar('latice', { respuesta: 'rendimiento', tratamientos: 'genotipo', bloque: 'bloque', repeticion: 'repeticion' }, {});
  const r = $('#anaResultado'); const t = r.querySelector('table'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion')].concat([t.closest('.tabla-wrap') || t]), 8);
})()

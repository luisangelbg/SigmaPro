/* vista: 1400x1500 */
/* 4.9: Kruskal-Wallis con los venenos: conclusión, gráfica con letras y el cuadro de rangos */
(async () => {
  await ejemplo('Venenos');
  await usar('kruskal-wallis', { respuesta: 'tiempo', tratamiento: 'veneno' }, { posthoc: 'dunn', ajuste: 'holm' });
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  const t = r.querySelector('table');
  return caja([r.querySelector('.exp-cabeza'), t.closest('.tabla-wrap') || t], 8);
})()

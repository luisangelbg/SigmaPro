/* vista: 1400x1400 */
/* 4.11: polinomios ortogonales de la dosis de nitrógeno: la curva y el cuadro */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('polinomios', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['dosis'] }, { grado: 2 });
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  const t = r.querySelector('table');
  return caja([r.querySelector('.exp-cabeza'), t.closest('.tabla-wrap') || t], 8);
})()

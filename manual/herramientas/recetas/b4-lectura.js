/* vista: 1400x1600 */
/* 4.5: «Cómo leer este cuadro» abierto bajo el ANOVA de bloques del maíz: medidores del p y curvas F de cada término */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'), d = r.querySelector('details.lg-lectura');
  d.open = true; await W(500);
  irA(d, 110); await W(300); limpio();
  return caja([d], 8);
})()

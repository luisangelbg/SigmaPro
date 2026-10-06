/* vista: 1400x1300 */
/* 4.22: muestreo estratificado del aguacate: la conclusión (con la asignación de Neyman que pasa del total) y la media de cada huerta */
(async () => {
  await ejemplo('muestreo en tres huertas');
  await usar('muestreo-estratificado', { respuesta: 'rendimiento_kg', estrato: 'huerta' }, { poblaciones: 'Ladera=420; Planicie=900; Vega=260', nTotal: 60 });
  const r = $('#anaResultado'), c = r.querySelector('.exp-conclusion'), f = r.querySelector('.ana-graficas figure');
  irA(c, 110);
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([c, f], 8);
})()

/* vista: 1400x1600 */
/* 4.5: el nivel Experto en el ANOVA del maíz: las notas técnicas con el modelo y sus hipótesis, y el código R abierto */
(async () => {
  document.documentElement.setAttribute('data-detalle', 'experto');
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado');
  SP.detalle.aplicar(r); await W(1500);
  const t = r.querySelector('details.exp-tecnico');
  irA(t, 110); await W(300); limpio();
  return caja([t], 8);
})()

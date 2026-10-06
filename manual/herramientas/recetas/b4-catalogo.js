/* vista: 1400x2400 */
/* Bloque 4: el catálogo de análisis, de la cabecera a la tercera familia */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('catalogo'); await W(600); limpio();
  /* lo de arriba (datos, recomendación y filtros) y las tres primeras familias */
  const c = $('#anaCatalogo'), fams = $$('#anaCatalogo .cat-familia');
  return caja([c.firstElementChild, fams[2]], 8);
})()

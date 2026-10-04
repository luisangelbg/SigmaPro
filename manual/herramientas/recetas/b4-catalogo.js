/* vista: 1400x2400 */
/* Bloque 4: el catálogo completo de análisis */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('catalogo'); await W(600); limpio();
  return caja([$('#anaCatalogo')], 8);
})()

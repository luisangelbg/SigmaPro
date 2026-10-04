/* vista: 1400x1250 */
/* Bloque 4: el constructor de modelo con el ejemplo del maíz */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('constructor'); await W(600); limpio();
  window.scrollTo(0, 0); await W(200);
  return caja([$('#anaConstructor')], 8);
})()

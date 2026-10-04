/* vista: 1400x1500 */
/* Bloque 4: el asistente con el ejemplo del maíz: las primeras preguntas y la recomendación */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('asistente'); await W(600); limpio();
  window.scrollTo(0, 0); await W(200);
  const ps = $$('#anaAsistente .asis-p');
  return caja([$('#anaModos'), $('#anaAsistente .asis-reco'), ps[3]], 8);
})()

/* vista: 1400x1200 */
/* Bloque 3: frecuencias cruzadas de los dos evaluadores de roya */
(async () => {
  await ejemplo('Roya: dos evaluadores');
  SP.app.ir(3); await W(400);
  $('#expTipos [data-tipo="frec"]').click(); await W(400);
  const f = $('#expOpciones [data-campo="columna"]'); if (f) { f.value = 'evaluador_B'; f.dispatchEvent(new Event('change', { bubbles: true })); }
  await W(500); limpio(); window.scrollTo(0, 0);
  return caja([$('#expTipos'), $('#panel-3 .exp-grid')], 8);
})()

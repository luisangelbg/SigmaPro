/* vista: 1400x1300 */
/* Bloque 3: proporción de germinación del frijol por tratamiento, con tres intervalos */
(async () => {
  await ejemplo('Frijol: germinación (%)');
  SP.app.ir(3); await W(400);
  $('#expTipos [data-tipo="prop"]').click(); await W(400);
  $('#expOpciones [data-modo="conteos"]').click(); await W(300);
  const s = (k, v) => { const el = $(`#expOpciones [data-campo="${k}"]`); if (el) { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); } };
  s('exitos', 'germinadas'); await W(200); s('ensayos', 'sembradas'); await W(200); s('grupo', 'tratamiento'); await W(500);
  limpio(); window.scrollTo(0, 0);
  return caja([$('#expTipos'), $('#panel-3 .exp-grid')], 8);
})()

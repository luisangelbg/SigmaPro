/* vista: 1400x1200 */
/* Bloque 3: bondad de ajuste 9:3:3:1 con los datos de Mendel */
(async () => {
  await ejemplo('Chícharo: segregación de Mendel');
  SP.app.ir(3); await W(400);
  $('#expTipos [data-tipo="bondad"]').click(); await W(400);
  const s = (k, v) => { const el = $(`#expOpciones [data-campo="${k}"]`); if (el) { el.value = v; el.dispatchEvent(new Event(el.tagName === 'INPUT' ? 'input' : 'change', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } };
  s('categoria', 'fenotipo'); await W(200); s('conteo', 'semillas'); await W(200); s('proporciones', '9:3:3:1'); await W(600);
  limpio(); window.scrollTo(0, 0);
  return caja([$('#expTipos'), $('#panel-3 .exp-grid')], 8);
})()

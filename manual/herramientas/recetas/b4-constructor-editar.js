/* vista: 1400x1250 */
/* Bloque 4: el constructor con la fórmula en edición y la lectura de cada término */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('constructor'); await W(600);
  $('#consEditar').click(); await W(400);
  const i = $('#consDerecha'); i.value = 'bloque + hibrido * dosis'; i.dispatchEvent(new Event('input', { bubbles: true })); await W(500);
  i.blur(); limpio();
  const ed = $('#anaConstructor .cons-editor');
  return caja([ed], 8);
})()

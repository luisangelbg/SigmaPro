/* Bloque 2: la ventana de filtrar filas con una condición */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(300); limpio();
  $('#datFiltrar').click(); await W(400);
  const d = dialogo(), a = d.querySelector('#fiExpr');
  a.value = 'bloque != "4" & dosis > 0'; a.dispatchEvent(new Event('input', { bubbles: true })); await W(300); a.blur();
  return caja([d], 0);
})()

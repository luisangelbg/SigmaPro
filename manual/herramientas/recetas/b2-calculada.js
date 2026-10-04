/* Bloque 2: la ventana de variable calculada con una expresión */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(300); limpio();
  $('#datCalcular').click(); await W(400);
  const d = dialogo();
  d.querySelector('#calNombre').value = 'nivel_N';
  const a = d.querySelector('#calExpr'); a.value = 'ifelse(dosis >= 120, "alta", "baja")'; a.dispatchEvent(new Event('input', { bubbles: true }));
  await W(300); a.blur();
  return caja([d], 0);
})()

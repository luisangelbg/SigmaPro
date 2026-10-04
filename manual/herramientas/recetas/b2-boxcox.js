/* vista: 1400x1250 */
/* Bloque 2: transformar con Box-Cox el tiempo de supervivencia (venenos × tratamientos) */
(async () => {
  await ejemplo('Venenos');
  SP.app.ir(2); await W(300); limpio();
  const h = SP.datosUI.estado().hoja;
  SP.datosDialogos.transformar(h.nombres.indexOf('tiempo')); await W(400);
  const d = dialogo();
  d.querySelector('input[name="trTipo"][value="boxcox"]').click(); await W(300);
  d.querySelector('#bcEstimar').click();
  for (let k = 0; k < 60 && !d.querySelector('.bc-svg'); k++) await W(200);
  await W(500);
  return caja([d], 0);
})()

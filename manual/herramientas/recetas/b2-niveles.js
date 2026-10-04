/* Bloque 2: el orden de los niveles de un factor */
(async () => {
  await ejemplo('Frijol: germinación (%)');
  SP.app.ir(2); await W(300); limpio();
  const h = SP.datosUI.estado().hoja;
  SP.datosDialogos.niveles(h.nombres.indexOf('tratamiento')); await W(400);
  return caja([dialogo()], 0);
})()

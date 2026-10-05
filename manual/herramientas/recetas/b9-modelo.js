/* vista: 1400x1300 */
/* 9.4: el modelo de bloques completos al azar con sus términos y las hipótesis, al final del fundamento teórico */
(async () => {
  await SP.app.fundamentos.cargar('dbca'); SP.app.fundamentos.abrir('dbca'); await W(900); limpio();
  const m = $('#fun-s-teoria .fun-modelo'), h = $('#fun-s-teoria .fun-hip');
  irA(m, 190); await W(400);
  return caja([m, $('#fun-s-teoria .fun-terminos'), h], 8);
})()

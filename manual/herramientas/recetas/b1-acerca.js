/* vista: 1400x900 */
/* 1.6: la tarjeta «Acerca de SigmaPro»: autor, licencia y los controles de la pantalla de apertura */
(async () => {
  SP.app.ir(1); await W(500);
  const c = $('#acerca'); irA(c, 190); await W(400); limpio();
  return caja([c], 8);
})()

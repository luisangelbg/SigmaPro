/* vista: 1400x1000 */
/* 2.14: «Continúa en la suite LABG» al pie del bloque Datos con el ejemplo del maíz (tratamientos y bloques: AgriDesign) */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(600);
  const f = $('#datSuite .lgs-franja'); irA(f, 190); await W(400); limpio();
  return caja([f], 8);
})()

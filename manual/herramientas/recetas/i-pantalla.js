/* Introducción: la pantalla de SigmaPro (bloque Datos con el ejemplo del maíz) y sus partes comunes marcadas */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(500);
  window.scrollTo(0, 0); await W(400); limpio();
  const lado = conTexto(/^BLOQUES/i, '[class*="lnav"]');
  const plegar = lado && [...lado.parentElement.querySelectorAll('button')].find(b => b.getBoundingClientRect().left > 250 && b.getBoundingClientRect().top < 140);
  const toc = conTexto(/^EN ESTE BLOQUE/i, '[class*="lnav"]');
  const abajo = conTexto(/^Buscar/, '[class*="lnav"] button, [class*="lnav"] a');
  marcas([
    [1, $('.brand-mark')], [2, $('.suite-link')], [3, $('#themeBtn')], [4, $('.labg-report')], [5, $('#helpBtn')],
    [6, lado, -40, 0], [7, plegar], [8, $('.lnav-crumbs'), -30, 0], [9, $('.lnav-seg')], [10, $('.lnav-k'), -30, 0], [11, toc],
    [12, abajo, 60, 0], [13, $('#t2'), 60, 0],
  ]);
})()

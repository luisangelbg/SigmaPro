/* Introducción: la pantalla de SigmaPro (bloque Datos con el ejemplo del maíz) y sus partes comunes marcadas */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(500);
  window.scrollTo(0, 0); await W(400); limpio();
  const lado = conTexto(/^(BLOQUES|BLOCKS)/i, '[class*="lnav"]');
  const plegar = lado && [...lado.parentElement.querySelectorAll('button')].find(b => b.getBoundingClientRect().left > 180 && b.getBoundingClientRect().top < 140);
  const toc = conTexto(/^(EN ESTE BLOQUE|IN THIS BLOCK)/i, '[class*="lnav"]');
  const abajo = conTexto(/^(Buscar|Search)/, '[class*="lnav"] button, [class*="lnav"] a');
  /* el título: su texto (el encabezado ocupa todo el ancho) */
  const titulo = document.createRange(); titulo.selectNodeContents($('#t2'));
  /* las marcas van junto a lo que señalan, sin taparlo: los botones de arriba a la derecha llevan su número debajo */
  const bajo = n => n && n.getBoundingClientRect().height / 2 + 26, der = n => n && n.getBoundingClientRect().width / 2 + 16;
  const izq = n => n && -(n.getBoundingClientRect().width / 2 + 16);
  const sub = $('.brand-sub'), suite = $('.suite-link'), lang = $('.lang-seg'), tema = $('#themeBtn'), glo = $('#glosarioBtn'), rep = $('.labg-report'), ayuda = $('#helpBtn');
  const ruta = $('.lnav-crumbs'), seg = $('.lnav-seg'), k = $('.lnav-k');
  marcas([
    [1, sub, der(sub) + 14, 0], [2, suite, 0, bajo(suite)], [3, lang, 0, bajo(lang)], [4, tema, 0, bajo(tema)], [5, glo, 0, bajo(glo)], [6, rep, 0, bajo(rep)], [7, ayuda, 0, bajo(ayuda)],
    [8, lado, 70, 0], [9, plegar], [10, ruta, der(ruta) + 24, 0], [11, seg, izq(seg), 0], [12, k, 0, bajo(k)], [13, toc, izq(toc) - 26, 10],
    [14, abajo, 60, 0], [15, titulo, titulo.getBoundingClientRect().width / 2 + 34, 0],
  ]);
})()

/* vista: 1400x1100 */
/* 1.5: la tarjeta «Qué puedes analizar» de Inicio: el título, la nota y las primeras familias de la lista */
(async () => {
  SP.app.ir(1); await W(500);
  const c = $('#iniAnalisisCard'); irA(c, 190); await W(400); limpio();
  const r = c.getBoundingClientRect();
  /* el recorte: la tarjeta hasta unos 560 px de alto (las primeras familias) */
  const alto = Math.min(r.height, 560);
  window.__recorte = [Math.round(r.left - 8), Math.round(r.top - 8), Math.round(r.width + 16), Math.round(alto + 16)].join(',');
  return window.__recorte;
})()

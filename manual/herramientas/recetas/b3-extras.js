/* vista: 1400x1300 */
/* Bloque 3: más estadísticos en el cuadro y el código R */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(3); await W(600);
  const ex = $('#expResultado .exp-extras'); if (ex) ex.open = true;
  for (const c of ['media_geometrica', 'asimetria', 'ic_mediana']) { const x = $(`#expResultado .exp-extras input[value="${c}"]`); if (x && !x.checked) { x.click(); await W(250); } }
  const ex2 = $('#expResultado .exp-extras'); if (ex2) ex2.open = true;
  const cod = $('#expResultado .exp-codigo'); if (cod) cod.open = true;
  await W(300); limpio();
  const r = $('#expResultado'); irA(r, 120); await W(300);
  return caja([r], 8);
})()

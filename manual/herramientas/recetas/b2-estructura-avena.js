/* Bloque 2: lo que SigmaPro ve en el ensayo de avena en parcelas divididas */
(async () => {
  await ejemplo('Avena en parcelas');
  SP.app.ir(2); await W(400); limpio();
  const c = $('#datEstructura'); irA(c, 120); await W(300);
  return caja([c], 8);
})()

/* Bloque 2: la tabla del jitomate ya en forma larga (sustrato, planta, dds, altura) */
(async () => {
  await ejemplo('Jitomate');
  SP.app.ir(2); await W(300);
  $('#datReformar').click(); await W(400);
  const d = dialogo();
  d.querySelector('#reClave').value = 'dds'; d.querySelector('#reValor').value = 'altura';
  d.querySelectorAll('.reId').forEach(x => { x.checked = ['sustrato', 'planta'].includes(x.value); });
  d.querySelectorAll('.reMed').forEach(x => { x.checked = /^altura_/.test(x.value); }); d.querySelector('.reMed').dispatchEvent(new Event('change', { bubbles: true })); await W(200);
  [...d.querySelectorAll('.sp-dialogo-pie button')].pop().click(); await W(700); limpio();
  window.scrollTo(0, 0); await W(200);
  return caja([$('#datVolver').closest('.dat-barra'), $('#datTrabajo')], 8);
})()

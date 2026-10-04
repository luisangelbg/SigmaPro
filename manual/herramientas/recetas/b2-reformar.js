/* vista: 1400x1000 */
/* Bloque 2: ancha → larga con las alturas del jitomate */
(async () => {
  await ejemplo('Jitomate');
  SP.app.ir(2); await W(300); limpio();
  $('#datReformar').click(); await W(400);
  const d = dialogo();
  d.querySelector('#reClave').value = 'dds'; d.querySelector('#reValor').value = 'altura';
  d.querySelectorAll('.reId').forEach(x => { x.checked = ['sustrato', 'planta'].includes(x.value); });
  d.querySelectorAll('.reMed').forEach(x => { x.checked = /^altura_/.test(x.value); }); d.querySelector('.reMed').dispatchEvent(new Event('change', { bubbles: true })); await W(200);
  return caja([d], 0);
})()

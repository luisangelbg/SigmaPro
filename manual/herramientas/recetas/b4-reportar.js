/* vista: 1400x1500 */
/* 4.5: «Cómo reportarlo (APA)» abierto bajo el resultado del maíz, en inglés */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'), d = r.querySelector('details.sp-reportar');
  d.open = true; await W(500);
  d.querySelector('[data-rp-idioma="en"]').click(); await W(2500);
  irA(d, 110); await W(300); limpio();
  return caja([d], 8);
})()

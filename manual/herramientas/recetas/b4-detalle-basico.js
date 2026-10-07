/* vista: 1400x1500 */
/* 4.5: el nivel Básico en el ANOVA del maíz: En pocas palabras (la conclusión técnica se oculta) y la lectura de cada cuadro abierta, sin los cuadros
   (se oculta la gráfica de interacción, que va entre la conclusión y la lectura; el pie lo dice) */
(async () => {
  document.documentElement.setAttribute('data-detalle', 'basico');
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado');
  SP.detalle.aplicar(r); await W(700);
  r.querySelectorAll('.graf-tema, .ana-graficas').forEach(e => { e.style.display = 'none'; });
  const lec = r.querySelector('details.lg-lectura');
  irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.sp-detalle'), r.querySelector('.sp-claro'), r.querySelector('.sp-basico-aviso'), lec.querySelector('summary'), lec.querySelector('.lg-item .lg-tit')], 8);
})()

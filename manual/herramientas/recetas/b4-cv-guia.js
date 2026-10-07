/* vista: 760x1700 */
/* 4.5: el formulario de la guía del CV bajo el resumen del ensayo del maíz: límites propios calculados por el método de Garcia */
(async () => {
  try { localStorage.removeItem('sigmapro.cv.guia'); } catch (e) { /* sin almacenamiento */ }
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'), d = [...r.querySelectorAll('details.lg-lectura')][1];
  d.open = true; await W(500);
  const item = d.querySelector('.lg-item[data-ficha="cv"]'), g = item.querySelector('details.lg-cv-guia');
  g.open = true;
  const s = g.querySelector('select[data-cvguia="id"]'); s.value = 'propia'; s.dispatchEvent(new Event('change', { bubbles: true })); await W(200);
  const f = g.querySelector('.lg-cv-form');
  f.querySelector('[data-cvguia="cultivo"]').value = 'Maíz de temporal'; f.querySelector('[data-cvguia="variable"]').value = 'Rendimiento de grano';
  f.querySelector('details.lg-cv-garcia').open = true;
  f.querySelector('[data-cvguia="lista"]').value = '9.8, 12.4, 7.6, 15.1, 11.0, 13.7, 8.9, 10.5';
  f.querySelector('[data-cvguia-accion="calcular"]').click(); await W(300);
  irA(g, 110); await W(300); limpio();
  return caja([g], 8);
})()

/* vista: 1400x1400 */
/* 4.5: «Cómo leer este cuadro» bajo el resumen del diseño en bloques del maíz: CV, R² y eficiencia relativa */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'), d = [...r.querySelectorAll('details.lg-lectura')][1];
  d.open = true; await W(500);
  irA(d, 110); await W(300); limpio();
  return caja([d], 8);
})()

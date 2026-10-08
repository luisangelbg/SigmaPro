/* vista: 1400x900 */
/* I.6: la ayuda emergente sobre el encabezado F del análisis de varianza del maíz */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const t = $('#anaResultado table[data-cuadro="anova"]');
  irA(t, 260); await W(300); limpio();
  t.querySelector('th[data-clave="F"]').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  await W(700);
  return caja([t.querySelector('thead'), $('#spAyuda'), t.querySelector('tbody tr:nth-child(3)')], 8);
})()

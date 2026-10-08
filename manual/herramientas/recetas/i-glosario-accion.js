/* vista: 1400x1100 */
/* I.6: «Ver en acción» de «Interacción»: el ANOVA del maíz con el renglón hibrido × dosis señalado */
(async () => {
  await ejemplo('Maíz: híbridos');
  await SP.glosarioUI.ver('interaccion', 0); await W(4200);
  const r = $('#anaResultado'), t = r.querySelector('table[data-cuadro="anova"]');
  /* la marca, sin el parpadeo, como queda al final */
  document.querySelectorAll('.sp-gl-marca').forEach(x => { x.style.animation = 'none'; });
  t.scrollIntoView({ block: 'center' }); await W(300); limpio();
  document.activeElement.blur(); await W(200);
  return caja([t.closest('.tabla-wrap')], 8);
})()

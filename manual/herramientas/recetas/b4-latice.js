/* vista: 1400x1400 */
/* 4.10: el alfa-látice de 24 genotipos: el ANOVA intrabloque. Como en las parcelas divididas, la figura empieza en la
   conclusión (el título, el nivel de detalle y «En pocas palabras» están en la sección 4.5): así cabe bajo su párrafo */
(async () => {
  await ejemplo('Alfa-látice');
  await usar('latice', { respuesta: 'rendimiento', tratamientos: 'genotipo', bloque: 'bloque', repeticion: 'repeticion' }, {});
  const r = $('#anaResultado'); const t = r.querySelector('table'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-conclusion'), t.closest('.tabla-wrap') || t], 8);
})()

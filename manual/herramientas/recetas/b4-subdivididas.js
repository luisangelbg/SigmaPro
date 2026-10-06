/* vista: 1400x1800 */
/* 4.10: parcelas subdivididas del arroz: la conclusión con la interacción riego × nitrógeno y el ANOVA con tres errores (sin la gráfica) */
(async () => {
  await ejemplo('Arroz: riego');
  await usar('parcelas-subdivididas', { respuesta: 'rendimiento', parcelaGrande: 'riego', subparcela: 'variedad', subsubparcela: 'nitrogeno', bloque: 'bloque' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  /* la gráfica de la interacción (entre la conclusión y el cuadro) se oculta para que la figura quepa en una hoja; el pie lo dice */
  r.querySelectorAll('.ana-graficas, .graf-tema').forEach(n => { n.style.display = 'none'; }); await W(200);
  const t = r.querySelector('table');
  return caja([r.querySelector('.exp-conclusion'), t.closest('.tabla-wrap') || t], 8);
})()

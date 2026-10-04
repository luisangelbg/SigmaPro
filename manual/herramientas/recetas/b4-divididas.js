/* vista: 1400x1700 */
/* 4.10: parcelas divididas de Yates: conclusión, interacción y el ANOVA con sus dos errores */
(async () => {
  await ejemplo('Avena en parcelas');
  await usar('parcelas-divididas', { respuesta: 'rendimiento', parcelaGrande: 'variedad', subparcela: 'nitrogeno', bloque: 'bloque', principal: 'dbca' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  const t = r.querySelector('table');
  return caja([r.querySelector('.exp-conclusion'), t.closest('.tabla-wrap') || t], 8);
})()

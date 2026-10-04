/* vista: 1400x1400 */
/* 4.17: trips del aguacate (binomial negativa, elegida por la sobredispersión): la tasa de cada tratamiento */
(async () => {
  await ejemplo('Aguacate: trips');
  await usar('glm-conteos', { respuesta: 'trips', tratamientos: ['tratamiento'], bloque: 'bloque' }, { familia: 'auto' });
  const f = $('#anaResultado .ana-graficas figure'); irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

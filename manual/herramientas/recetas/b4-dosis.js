/* vista: 1400x1400 */
/* 4.18: dosis-respuesta log-logística de los dos herbicidas */
(async () => {
  await ejemplo('Herbicidas');
  await usar('dosis-respuesta', { respuesta: 'peso_seco', dosis: 'dosis', grupo: 'herbicida' }, { modelo: 'll4' });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

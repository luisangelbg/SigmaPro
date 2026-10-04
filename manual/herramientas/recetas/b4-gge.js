/* vista: 1400x1400 */
/* 4.20: biplot GGE «quién ganó dónde» de la avena de 14 ambientes */
(async () => {
  await ejemplo('Avena en 14');
  await usar('gge', { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, {});
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

/* vista: 1400x1400 */
/* 4.20: media contra pendiente de Eberhart y Russell en la avena de 14 ambientes */
(async () => {
  await ejemplo('Avena en 14');
  await usar('estabilidad', { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, {});
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110);
  /* la tarjeta se ajusta a su gráfica (en la fila, se estira a la altura de la de al lado) */
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([f], 6);
})()

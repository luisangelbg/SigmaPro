/* vista: 1400x1400 */
/* 4.18: curvas logísticas de la altura del maíz, una por dosis de nitrógeno */
(async () => {
  await ejemplo('Maíz: altura');
  await usar('curva-crecimiento', { respuesta: 'altura', x: 'dds', grupo: 'tratamiento' }, { modelo: 'logistico' });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

/* vista: 1400x1400 */
/* 4.19: contornos de la superficie de respuesta del tomate (N × K) */
(async () => {
  await ejemplo('Tomate');
  await usar('superficie-respuesta', { respuesta: 'rendimiento', factores: ['N', 'K'] }, { orden: 'segundo', objetivo: 'maximo' });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

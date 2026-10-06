/* vista: 1400x1400 */
/* 4.19: curvas de nivel de la deseabilidad global del fruto (rendimiento mayor, costo menor y pH meta de 6.5) */
(async () => {
  await ejemplo('Fruto:');
  await usar('deseabilidad', { respuestas: ['rendimiento', 'costo', 'ph'], factores: ['N', 'riego'] },
    { metas: ['max', 'min', 'valor'], inferiores: [70, 11, 6], superiores: [86, 15, 7], objetivos: [0, 0, 6.5], exponentes: [1, 1, 1], exponentes2: [1, 1, 1], importancias: [1, 1, 1], region: 'cubo' });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

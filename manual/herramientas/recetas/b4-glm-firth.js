/* vista: 1400x1400 */
/* 4.17: regresión logística con la corrección de Firth (frijol: germinó o no; las escarificadas germinaron todas): título, conclusión y semáforo */
(async () => {
  await ejemplo('Frijol: días');
  await usar('glm', { respuesta: 'germino' }, { derecha: 'lote + tratamiento + peso_semilla', familia: 'binomial', firth: true, comparar: ['tratamiento'] });
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), r.querySelector('.semaforo')], 8);
})()

/* vista: 1400x1600 */
/* Bloque 4: un resultado completo (bloques al azar del maíz): cabeza, conclusión, gráfica y botón de comparar */
(async () => {
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  const b = [...r.querySelectorAll('button')].find(x => /Comparar las medias/.test(x.textContent));
  return caja([r.querySelector('.exp-cabeza'), b], 8);
})()

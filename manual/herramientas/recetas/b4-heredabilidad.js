/* vista: 1400x1400 */
/* 4.16: heredabilidad del alfa-látice: los BLUP de los genotipos y los BLUP contra los BLUE */
(async () => {
  await ejemplo('Alfa-látice');
  await usar('heredabilidad', { respuesta: 'rendimiento', genotipo: 'genotipo', repeticion: 'repeticion', bloque: 'bloque' }, { seleccion: 0.1, direccion: 'mayor' });
  const g = $('#anaResultado .ana-graficas'); irA(g, 110); await W(300); limpio();
  return caja([g], 8);
})()

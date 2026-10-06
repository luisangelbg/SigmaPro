/* vista: 1400x1400 */
/* 4.19: el alargamiento del hilo en el triángulo de la mezcla (modelo cuadrático de Scheffé, Cornell 2002) */
(async () => {
  await ejemplo('Hilo');
  await usar('mezclas', { respuesta: 'alargamiento', componentes: ['polietileno', 'poliestireno', 'polipropileno'] }, { modelo: 'cuadratico', objetivo: 'maximo' });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110);
  /* la tarjeta se ajusta a su gráfica (en la fila, se estira a la altura de la traza de Cox) */
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([f], 6);
})()

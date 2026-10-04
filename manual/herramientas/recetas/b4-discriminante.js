/* vista: 1400x1400 */
/* 4.21: las cuatro variedades de chile en las dos primeras funciones discriminantes */
(async () => {
  await ejemplo('Chile');
  await usar('discriminante', { variables: ['largo_cm', 'ancho_cm', 'peso_g', 'pared_mm'], grupo: 'variedad' }, {});
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110);
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([f], 6);
})()

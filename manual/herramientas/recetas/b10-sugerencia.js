/* vista: 1400x1100 */
/* 10.3: «Continúa en la suite LABG» al pie del resultado de una regresión lineal con los datos de café */
(async () => {
  await ejemplo('Café');
  await usar('regresion-lineal', { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra'] }, {});
  const f = $('#anaResultado .lgs-franja'); irA(f, 40); await W(300); limpio();
  return caja([f], 8);
})()

/* vista: 1400x1300 */
/* 4.12: mejores subconjuntos del café: las gráficas del BIC y de la Cp y los botones que llevan el modelo a la regresión */
(async () => {
  await ejemplo('Café');
  await usar('mejores-subconjuntos', { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, {});
  const r = $('#anaResultado'), g = r.querySelector('.ana-graficas'), b = $$('#anaResultado [data-accion="analizar-modelo"]');
  irA(g, 110); await W(300); limpio();
  return caja([g, ...b], 8);
})()

/* vista: 1400x1400 */
/* 4.24: la lluvia mensual con su pronóstico ARIMA(1,0,0)(0,1,1)12 a doce meses */
(async () => {
  await ejemplo('Estación');
  await usar('arima', { respuesta: 'precipitacion_mm', tiempo: 'periodo' }, { p: 1, d: 0, q: 0, P: 0, D: 1, Q: 1, periodo: 12, horizonte: 12 });
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110);
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([f], 6);
})()

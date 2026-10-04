/* vista: 1400x1500 */
/* 4.8: la t de Welch con los venenos: tratamientos A y B */
(async () => {
  await ejemplo('Venenos');
  await usar('prueba-t', { modo: 'independientes', respuesta: 'tiempo', grupo: 'tratamiento', niveles: ['A', 'B'] }, {});
  window.scrollTo(0, 0); await W(200);
  const r = $('#anaResultado'); irA($('#anaOpciones'), 110); await W(300); limpio();
  return caja([$('#anaOpciones'), r.querySelector('.exp-cabeza'), r.querySelector('.ana-graficas')], 8);
})()

/* vista: 1400x1500 */
/* 4.7: el cuadro de las pruebas de los supuestos (venenos) */
(async () => {
  await ejemplo('Venenos');
  await usar('supuestos', { respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'] }, {});
  const t = $('#anaResultado table'); irA(t, 140); await W(300); limpio();
  return caja([t.closest('.tabla-wrap') || t], 8);
})()

/* 4.11: contrastes planeados entre los venenos: el campo de contrastes y el cuadro */
(async () => {
  await ejemplo('Venenos');
  await usar('contrastes', { diseno: 'dca', respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'], comparar: ['veneno'] }, { contrastes: 'I y II vs III: 1 1 -2\nI vs II: 1 -1 0' });
  const r = $('#anaResultado'), t = r.querySelector('table'); irA(t, 160); await W(300); limpio();
  const campo = $('#anaOpciones textarea');
  return caja([t.closest('.tabla-wrap') || t], 8);
})()

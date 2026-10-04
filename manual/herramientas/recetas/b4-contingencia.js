/* vista: 1400x1300 */
/* 4.14: tabla de contingencia de la semilla tratada: el mosaico */
(async () => {
  await ejemplo('semilla tratada');
  await usar('tabla-contingencia', { fila: 'tratamiento', columna: 'germinacion', frecuencia: 'semillas' }, {});
  const f = $('#anaResultado .ana-graficas figure'); irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

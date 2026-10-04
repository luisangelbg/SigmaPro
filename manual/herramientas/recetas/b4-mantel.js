/* vista: 1400x1300 */
/* 4.14: Cochran-Mantel-Haenszel: la razón de momios de cada lote y la común */
(async () => {
  await ejemplo('semilla tratada');
  await usar('mantel-haenszel', { fila: 'tratamiento', columna: 'germinacion', estrato: 'lote', frecuencia: 'semillas' }, {});
  const f = $('#anaResultado .ana-graficas figure'); irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

/* vista: 1400x1500 motor */
/* 4.15: parcelas divididas como modelo mixto (avena de Yates): conclusión y semáforo */
(async () => {
  await ejemplo('Avena en parcelas');
  try { localStorage.setItem('sigmapro.motorR.usado', '1'); } catch (e) { /* sin almacenamiento */ }
  SP.app.analisis.motorAceptado = true;
  await usar('mixto-divididas', { respuesta: 'rendimiento', parcelaGrande: 'variedad', subparcela: 'nitrogeno', bloque: 'bloque' }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), r.querySelector('.semaforo')], 8);
})()

/* vista: 1400x1500 motor */
/* 4.15: medidas repetidas del maíz: el perfil de la altura en el tiempo */
(async () => {
  await ejemplo('Maíz: altura');
  try { localStorage.setItem('sigmapro.motorR.usado', '1'); } catch (e) { /* sin almacenamiento */ }
  SP.app.analisis.motorAceptado = true;
  await usar('medidas-repetidas', { respuesta: 'altura', tiempo: 'dds', sujeto: 'planta', tratamientos: ['tratamiento'], bloque: 'bloque' }, {});
  const f = $('#anaResultado .ana-graficas figure'); irA(f, 110); await W(300); limpio();
  return caja([f], 6);
})()

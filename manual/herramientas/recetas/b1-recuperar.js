/* Bloque 1: el aviso para recuperar el trabajo guardado */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.reporte.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: {} });
  SP.app.reporte.agregar({ metodo: 'comparaciones-medias', e: { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, op: { metodo: 'tukey' } });
  await SP.app.autoguardado.guardar(); await SP.app.autoguardado.revisar();
  SP.app.ir(1); await W(400); window.scrollTo(0, 0); await W(200); limpio();
  return caja([$('#panel-1 .rec-aviso')], 10);
})()

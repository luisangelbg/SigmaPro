/* Bloque 4: el aviso del motor R la primera vez que se usa */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('catalogo'); await W(300);
  SP.app.analisis.usar('mixto-bloques', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}); await W(800); limpio();
  const r = $('#anaResultado .ana-motor'); irA(r, 200); await W(200);
  return caja([r], 8);
})()

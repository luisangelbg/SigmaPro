/* Pruebas de js/nucleo/hilos.js: el núcleo se reconstruye desde su texto y da lo mismo
   en un hilo de trabajo que en la página. */
SPT.describir('Núcleo · cálculos en hilos de trabajo', () => {
  const datos = [5.03, 4.17, 6.11, 4.81, 'NA', 5.87, 4.5].map(v => (v === 'NA' ? NaN : v));

  SPT.caso('el texto del núcleo reconstruye todos los módulos en un contexto nuevo', () => {
    const g = __nuevoContexto(SP.hilo.fuenteNucleo());
    SPT.igualJSON(g.SP.fabricas.map(f => f[0]), SP.fabricas.map(f => f[0]));
    SPT.igualJSON(g.SP.num.resumen(datos), SP.num.resumen(datos), 'mismo resultado en el núcleo reconstruido');
  }, { node: true });

  SPT.caso('en la página (sin hilo) da el mismo resultado y conecta el avance', async () => {
    const previo = SP.avance;
    const propio = function () {};
    const r = await SP.hilo.correr('num.resumen', [datos], { enLinea: true, alProgreso: propio });
    SPT.igualJSON(r, SP.num.resumen(datos));
    SP.__pruebaAvance = () => SP.avance;
    try {
      const durante = await SP.hilo.correr('__pruebaAvance', [], { enLinea: true, alProgreso: propio });
      SPT.igual(durante, propio, 'durante el cálculo, SP.avance es el del que llama');
    } finally { delete SP.__pruebaAvance; }
    SPT.igual(SP.avance, previo, 'SP.avance vuelve a su valor al terminar');
  });

  SPT.caso('en un hilo de trabajo real da el mismo resultado', async () => {
    SPT.afirmar(SP.hilo.disponible, 'este navegador permite hilos de trabajo');
    const r = await SP.hilo.correr('num.resumen', [new Float64Array(datos)]);
    SPT.igualJSON(r, SP.num.resumen(datos));
  }, { navegador: true });

  SPT.caso('los errores del hilo llegan con su mensaje y su arreglo', async () => {
    let e = null;
    try { await SP.hilo.correr('no.existe', []); } catch (x) { e = x; }
    SPT.afirmar(e && /No existe la función SP\.no\.existe/.test(e.message), 'función inexistente');
    e = null;
    try { await SP.hilo.correr('tabla.aNumero', ['abc']); } catch (x) { e = x; }
    SPT.afirmar(e && /no es un número/.test(e.message), 'mensaje del ErrorSP');
    SPT.afirmar(e.arreglo && e.arreglo.length > 0, 'trae el arreglo');
  }, { navegador: true });

  SPT.caso('un cálculo cancelado antes de empezar no corre', async () => {
    const c = new AbortController();
    c.abort();
    let e = null;
    try { await SP.hilo.correr('num.resumen', [datos], { senal: c.signal }); } catch (x) { e = x; }
    SPT.afirmar(e && e.name === 'AbortError');
  }, { navegador: true });
});

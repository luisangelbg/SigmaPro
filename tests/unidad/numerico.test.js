/* Pruebas de js/nucleo/numerico.js con valores resueltos a mano. Los casos contra R
   están en tests/casos/num-resumen/. */
SPT.describir('Núcleo · sumas, medias y varianzas', () => {
  SPT.caso('la suma compensada no pierde el 1 entre 1e16 y −1e16', () => {
    SPT.igual(SP.num.suma([1e16, 1, -1e16]), 1);
    SPT.igual([1e16, 1, -1e16].reduce((a, b) => a + b, 0), 0, 'la suma directa sí lo pierde (la prueba discrimina)');
  });

  SPT.caso('diez veces 0.1 suman exactamente 1', () => {
    const x = new Array(10).fill(0.1);
    SPT.igual(SP.num.suma(x), 1);
  });

  SPT.caso('media y varianza de un ejemplo a mano', () => {
    const x = [2, 4, 4, 4, 5, 5, 7, 9];          // media 5, Σ(x − 5)² = 32
    SPT.igual(SP.num.media(x), 5);
    SPT.cerca(SP.num.varianza(x), 32 / 7, 1e-15);
    SPT.cerca(SP.num.media(new Float64Array([1, 2, 3, 4])), 2.5, 0);
  });

  SPT.caso('varianza exacta con un desplazamiento de mil millones', () => {
    const x = [4, 7, 13, 16].map(v => 1e9 + v);   // varianza exacta = 30
    SPT.cerca(SP.num.varianza(x), 30, 1e-12);
    const n = x.length, s = x.reduce((a, b) => a + b, 0), s2 = x.reduce((a, b) => a + b * b, 0);
    const unaPasada = (s2 - s * s / n) / (n - 1);
    SPT.afirmar(Math.abs(unaPasada - 30) > 1, 'la fórmula de una pasada falla aquí (' + unaPasada + '), así que el caso discrimina');
  });

  SPT.caso('casos límite como en R: vacío, un dato, infinitos', () => {
    SPT.igual(SP.num.media([]), NaN, 'mean(numeric(0)) es NaN');
    SPT.igual(SP.num.varianza([3]), NaN, 'var de un dato es NA');
    SPT.igual(SP.num.media([1, Infinity]), Infinity);
    SPT.igual(SP.num.varianza([1, Infinity]), NaN, 'var(c(1, Inf)) es NaN');
    SPT.igual(SP.num.suma([1, Infinity, 2]), Infinity);
  });

  SPT.caso('resumen descarta faltantes y los cuenta', () => {
    const r = SP.num.resumen([3, NaN, 5, null, 7, undefined]);
    SPT.igual(r.n, 3);
    SPT.igual(r.faltantes, 3);
    SPT.igual(r.media, 5);
    SPT.igual(r.varianza, 4);
    SPT.igual(r.de, 2);
    SPT.igual(r.min, 3);
    SPT.igual(r.max, 7);
    const v = SP.num.resumen([]);
    SPT.igual(v.n, 0); SPT.igual(v.media, NaN); SPT.igual(v.min, NaN);
  });

  SPT.caso('sinFaltantes devuelve Float64Array sin NaN ni null', () => {
    const s = SP.num.sinFaltantes([1, NaN, 2, null]);
    SPT.afirmar(s instanceof Float64Array);
    SPT.igualJSON(Array.from(s), [1, 2]);
  });
});

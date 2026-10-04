/* Pruebas de series de tiempo (js/nucleo/series.js y js/metodos/series.js): la ACF de una serie alternante, la PACF
   de un AR(1) teórico, la media móvil centrada a mano, la descomposición de una serie puramente estacional, el S de
   Mann-Kendall de una serie creciente, la pendiente de Sen de una recta, el redondeo de R, los mensajes de error, el
   reporte, el código R y el párrafo. Los números contra R están en tests/casos/series. */
SPT.describir('Series de tiempo · núcleo', () => {
  SPT.caso('ACF de una serie alternante y PACF de las correlaciones de un AR(1)', () => {
    const Z = SP.series, a = Z.acf([1, -1, 1, -1, 1, -1, 1, -1], 2);
    SPT.cerca(a[0], 1, 1e-15); SPT.cerca(a[1], -7 / 8, 1e-15); SPT.cerca(a[2], 6 / 8, 1e-15);
    /* con r_k = φ^k la PACF es φ y luego 0 */
    const p = Z.pacf([1, 0.6, 0.36, 0.216, 0.1296], 4);
    SPT.cerca(p[0], 0.6, 1e-14); for (let k = 1; k < 4; k++) SPT.cerca(p[k], 0, 1e-14);
    SPT.igual(Z.rezagosR(72), 18); SPT.igual(Z.rezagosR(5), 4);
  });
  SPT.caso('Media móvil centrada (par e impar) y descomposición de una serie puramente estacional', () => {
    const Z = SP.series, x = [1, 2, 3, 4, 5, 6, 7, 8];
    const m4 = Z.mediaMovil(x, 4);
    SPT.afirmar(Number.isNaN(m4[0]) && Number.isNaN(m4[1]) && Number.isNaN(m4[7]), 'sin ventana completa en los extremos');
    SPT.cerca(m4[2], (0.5 * 1 + 2 + 3 + 4 + 0.5 * 5) / 4, 1e-15);
    SPT.cerca(Z.mediaMovil(x, 3)[1], 2, 1e-15);
    const ciclo = [3, -1, -2], s = Array.from({ length: 12 }, (_, i) => 10 + ciclo[i % 3]), d = Z.descomponer(s, 3, 'aditiva');
    d.figura.forEach((v, k) => SPT.cerca(v, ciclo[k], 1e-12));
    d.residuo.filter(Number.isFinite).forEach(v => SPT.cerca(v, 0, 1e-12));
  });
  SPT.caso('Mann-Kendall de una serie creciente, Sen de una recta y el redondeo de R', () => {
    const Z = SP.series, n = 10, x = Array.from({ length: n }, (_, i) => 2 + 0.5 * i);
    const mk = Z.mannKendall(x);
    SPT.igual(mk.S, n * (n - 1) / 2); SPT.cerca(mk.tau, 1, 1e-15);
    SPT.cerca(mk.varS, n * (n - 1) * (2 * n + 5) / 18, 1e-12);
    const s = Z.sen(x, 0.95);
    SPT.cerca(s.pendiente, 0.5, 1e-15); SPT.cerca(s.inf, 0.5, 1e-15); SPT.cerca(s.sup, 0.5, 1e-15);
    SPT.igualJSON([0.5, 1.5, 2.5, -0.5, 2.4, 2.6].map(Z.redondearR), [0, 2, 2, 0, 2, 3]);
  });
});

SPT.describir('Series de tiempo · métodos', () => {
  const tabla = () => SP.tabla.crear({ mes: Array.from({ length: 36 }, (_, i) => 36 - i), lluvia: Array.from({ length: 36 }, (_, i) => 50 + 30 * Math.sin(2 * Math.PI * (36 - i) / 12) + (i % 5)) }, {});
  SPT.caso('Reporte, código R y párrafo de los tres métodos', () => {
    const t = tabla();
    const pedidos = [['autocorrelacion', { respuesta: 'lluvia', tiempo: 'mes' }, { lagBox: 12 }, 'Box.test'], ['descomposicion', { respuesta: 'lluvia', tiempo: 'mes' }, { frecuencia: 12 }, 'decompose'],
      ['tendencia', { respuesta: 'lluvia', tiempo: 'mes' }, {}, 'sens.slope']];
    for (const [id, e, op0, fn] of pedidos) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, op0), r = SP.ejecutar(id, t, e, op).resultado, rep = f.reporte(r);
      const todo = rep.conclusiones.join(' ');
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length && !/undefined|NaN|\{[a-zA-Z]+\}/.test(todo), id + ': ' + todo.slice(0, 200));
      SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes(fn), id + ': ' + fn);
      const p = SP.informe.parrafo(id, r, rep, e, op);
      SPT.afirmar(p.metodos && p.resultados && !/undefined|NaN|\{[a-zA-Z]+\}/.test(p.metodos + p.resultados), id + ': ' + p.metodos + ' ' + p.resultados);
      for (const k of p.citas) SPT.afirmar(SP.informe.referencia(k).length > 20, id + ': cita sin referencia ' + k);
    }
    /* el orden por la columna del tiempo: la serie quedó de mes 1 a mes 36 */
    const r = SP.ejecutar('tendencia', t, { respuesta: 'lluvia', tiempo: 'mes' }, SP.opcionesCon(SP.metodos.tendencia, {})).resultado;
    SPT.igualJSON(r.tiempos.slice(0, 3), [1, 2, 3]);
  });
  SPT.caso('Mensajes de error', () => {
    const op = (id, x) => SP.opcionesCon(SP.metodos[id], x || {});
    const hueco = SP.tabla.crear({ y: [1, 2, NaN, 4, 5, 6, 7, 8] }, {});
    SPT.lanza(() => SP.ejecutar('autocorrelacion', hueco, { respuesta: 'y' }, op('autocorrelacion')), 'faltantes');
    const corta = SP.tabla.crear({ y: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, {});
    SPT.lanza(() => SP.ejecutar('descomposicion', corta, { respuesta: 'y' }, op('descomposicion', { frecuencia: 12 })), 'dos ciclos');
    const repetido = SP.tabla.crear({ t: [1, 2, 2, 3], y: [1, 2, 3, 4] }, {});
    SPT.lanza(() => SP.ejecutar('tendencia', repetido, { respuesta: 'y', tiempo: 't' }, op('tendencia')), 'repite');
  });
});

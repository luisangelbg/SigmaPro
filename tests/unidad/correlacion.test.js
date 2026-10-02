/* Pruebas de js/metodos/correlacion.js y contingencia.js que no cubren los casos contra R: propiedades de las
   distribuciones exactas, el τ-b de Knight contra la definición, la Fisher r × c contra la enumeración completa,
   casos límite y reportes. */
SPT.describir('Correlación y contingencia · distribuciones, algoritmos y casos límite', () => {
  let s = 17;
  const az = () => (s = (s * 16807) % 2147483647) / 2147483647;

  SPT.caso('Kendall exacta: suma 1 y es simétrica; Spearman exacta (n ≤ 9) también', () => {
    for (const n of [3, 7, 12, 30]) {
      const N = n * (n - 1) / 2;
      SPT.cerca(SP.dist.pkendall(N, n), 1, 1e-14);
      for (const qq of [0, 3, Math.floor(N / 3)]) SPT.cerca(SP.dist.pkendall(qq, n) + SP.dist.pkendall(N - qq - 1, n), 1, 1e-12);
    }
    /* P(S ≥ s) + P(S < s) = 1 y la cola superior en el máximo es 1/n! */
    for (const n of [4, 6, 9]) {
      const smax = n * (n * n - 1) / 3;
      for (const sv of [2, 10, 40]) SPT.cerca(SP.dist.prho(n, sv, true) + SP.dist.prho(n, sv, false), 1, 1e-14);
      SPT.cerca(SP.dist.prho(n, smax, false), 1 / [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880][n], 1e-15);
    }
  });

  SPT.caso('τ-b por el algoritmo de Knight = la definición con todos los pares (con empates)', () => {
    const x = Array.from({ length: 300 }, () => Math.round(az() * 20)), y = x.map(v => Math.round(v / 3 + az() * 6));
    let c = 0, d = 0, tx = 0, ty = 0, n0 = 0;
    for (let i = 0; i < x.length; i++) for (let j = i + 1; j < x.length; j++) {
      const a = Math.sign(x[i] - x[j]), b = Math.sign(y[i] - y[j]);
      n0++; if (a * b > 0) c++; else if (a * b < 0) d++;
      if (a === 0) tx++; if (b === 0) ty++;
    }
    const k = SP.cor.kendall(x, y);
    SPT.cerca(k.tau, (c - d) / Math.sqrt((n0 - tx) * (n0 - ty)), 1e-14);
    SPT.igual(k.S, c - d);
  });

  SPT.caso('Fisher r × c por niveles = la suma sobre todas las tablas con esos márgenes', () => {
    const x = [[3, 1, 0, 2], [1, 4, 2, 0], [0, 2, 3, 3]];
    const sr = x.map(f => f.reduce((a, b) => a + b, 0)), sc = x[0].map((_, j) => x.reduce((a, f) => a + f[j], 0)), n = sr.reduce((a, b) => a + b, 0);
    const lf = k => SP.dist.lgamma(k + 1), cte = sr.reduce((a, v) => a + lf(v), 0) + sc.reduce((a, v) => a + lf(v), 0) - lf(n);
    const logp = t => cte - t.flat().reduce((a, v) => a + lf(v), 0), obs = logp(x);
    let suma = 0;
    /* enumeración completa: cada columna repartida entre las filas */
    const t = x.map(f => f.map(() => 0)), resto = sr.slice();
    const col = j => {
      if (j === sc.length) { if (resto.every(v => v === 0)) { const l = logp(t); if (l <= obs + Math.log(1 + 1e-7)) suma += Math.exp(l); } return; }
      const fila = (i, quedan) => {
        if (i === x.length - 1) { if (quedan <= resto[i]) { t[i][j] = quedan; resto[i] -= quedan; col(j + 1); resto[i] += quedan; } return; }
        for (let v = 0; v <= Math.min(quedan, resto[i]); v++) { t[i][j] = v; resto[i] -= v; fila(i + 1, quedan - v); resto[i] += v; }
      };
      fila(0, sc[j]);
    };
    col(0);
    SPT.cerca(SP.cont.fisherRxC(x).p, suma, 1e-10);
    /* en 2 × 2 coincide con la bilateral de fisher2x2 */
    SPT.cerca(SP.cont.fisherRxC([[7, 2], [3, 8]]).p, SP.cont.fisher2x2([[7, 2], [3, 8]]).p, 1e-12);
  });

  SPT.caso('tablas: niveles vacíos fuera, frecuencias no enteras sin Fisher, Bowker con un par vacío', () => {
    const t = SP.tabla.crear({ a: ['x', 'y', 'x', 'y', 'x'], b: ['p', 'p', 'q', 'q', 'q'], w: [2.5, 3, 1, 4, 2] }, { a: { tipo: 'factor', niveles: ['x', 'y', 'z'] }, b: { tipo: 'factor' } });
    const r = SP.ejecutar('tabla-contingencia', t, { fila: 'a', columna: 'b', frecuencia: 'w' }, {}).resultado;
    SPT.igualJSON(r.niveles[0], ['x', 'y'], 'el nivel z sin datos no entra');
    SPT.afirmar(r.fisher === null && r.avisos.some(a => /no son enteras/.test(a)));
    const m = SP.cont.mcnemar([[5, 2, 0], [3, 6, 1], [0, 4, 7]], false);
    SPT.igual(m.gl, 2, 'el par sin cambios (1, 3) no cuenta'); SPT.igual(m.vacios, 1);
  });

  SPT.caso('kappa con acuerdo perfecto vale 1; CMH pide al menos dos estratos', () => {
    const k = SP.cont.kappa([[10, 0, 0], [0, 7, 0], [0, 0, 5]], 'cuadratica');
    SPT.cerca(k.simple.estimado, 1, 1e-15); SPT.cerca(k.ponderada.estimado, 1, 1e-15);
    const t = SP.tabla.crear({ a: ['x', 'y', 'x', 'y'], b: ['p', 'q', 'q', 'p'], s: ['L1', 'L1', 'L1', 'L1'] }, { a: { tipo: 'factor' }, b: { tipo: 'factor' }, s: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('mantel-haenszel', t, { fila: 'a', columna: 'b', estrato: 's' }, {}), /dos niveles/);
  });

  SPT.caso('correlación: una variable constante y la parcial con un control que la determina dan errores claros', () => {
    const t = SP.tabla.crear({ x: [1, 2, 3, 4, 5], y: [2, 2, 2, 2, 2], z: [2, 4, 6, 8, 10], w: [1, 3, 2, 5, 4] });
    SPT.lanza(() => SP.ejecutar('correlacion', t, { x: 'x', y: 'y' }, {}), /constante/);
    SPT.lanza(() => SP.ejecutar('correlacion-parcial', t, { x: 'x', y: 'w', controles: ['z'] }, {}), /constante|determinada/);
    const r = SP.ejecutar('correlacion', t, { x: 'x', y: 'w' }, { metodo: 'kendall' }).resultado;
    SPT.igual(r.comparar.length, 3);
    SPT.afirmar(/Kendall/.test(SP.metodos.correlacion.reporte(r).titulo));
  });
});

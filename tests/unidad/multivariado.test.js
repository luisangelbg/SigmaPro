/* Pruebas del multivariado (js/nucleo/multivariado.js y js/metodos/multivariado.js): los valores propios de Jacobi,
   la MANOVA con una sola respuesta repetida reduce a la F del ANOVA, Wilks con un valor propio, el discriminante de dos
   grupos y la validación cruzada contra refitear sin cada unidad, los mensajes de error, el reporte, el código R y el
   párrafo. Los números contra R están en tests/casos/multivariado. */
SPT.describir('Multivariado · núcleo', () => {
  SPT.caso('Valores propios de una matriz simétrica (Jacobi)', () => {
    const p = SP.multivariado.propios([[2, 1], [1, 2]]);
    SPT.cerca(p.valores[0], 3, 1e-14); SPT.cerca(p.valores[1], 1, 1e-14);
    SPT.cerca(Math.abs(p.vectores[0][0]), Math.SQRT1_2, 1e-14);
  });
  SPT.caso('Las cuatro pruebas con un solo valor propio coinciden con la F del ANOVA', () => {
    /* con p = 1 respuesta, λ = SCtrat/SCerror y todas dan F = λ·glE/q */
    const t = SP.multivariado.pruebas([0.6], 2, 12);
    for (const k of ['pillai', 'wilks', 'hotelling', 'roy']) SPT.cerca(t[k].F, 0.6 * 12 / 2, 1e-12);
    SPT.cerca(t.wilks.estadistico, 1 / 1.6, 1e-15);
  });
  SPT.caso('Validación cruzada de lda: la fórmula exacta es igual a ajustar sin cada unidad', () => {
    const x = [[1, 2], [2, 1.5], [1.5, 2.5], [2.2, 2.1], [4, 4.2], [4.5, 3.8], [3.8, 4.6], [5, 5.1], [2.8, 3.2], [3.3, 2.9]], g = [0, 0, 0, 0, 1, 1, 1, 1, 0, 1];
    const L = SP.multivariado.lda(x, g, 2);
    for (let i = 0; i < x.length; i++) {
      const xs = x.filter((_, j) => j !== i), gs = g.filter((_, j) => j !== i), M = SP.multivariado.lda(xs, gs, 2, { previas: L.previa });   // lda(CV = TRUE) usa las previas de todos los datos
      /* la posterior de la unidad i con el ajuste sin ella (plug-in con todas las funciones) */
      const z = M.escala[0].map((_, c) => x[i].reduce((s, v, j) => s + (v - M.xbar[j]) * M.escala[j][c], 0));
      const d = M.medias_puntaje.map((m, h) => 0.5 * m.reduce((s, v) => s + v * v, 0) - Math.log(M.previa[h]) - m.reduce((s, v, c) => s + v * z[c], 0));
      const w = d.map(v => Math.exp(-(v - Math.min(...d)))), sw = w[0] + w[1];
      SPT.cerca(L.cv.posterior[i][0], w[0] / sw, 1e-9);
    }
  });
});

SPT.describir('Multivariado · métodos', () => {
  const tabla = () => SP.tabla.crear({ trat: ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C'], bloque: ['1', '2', '3', '4', '1', '2', '3', '4', '1', '2', '3', '4'],
    y1: [5.1, 5.4, 4.9, 5.3, 6.0, 6.3, 5.8, 6.4, 5.5, 5.2, 5.9, 5.6], y2: [20, 22, 19, 21, 24, 23, 25, 26, 21, 23, 22, 22], y3: [1.1, 1.3, 1.0, 1.2, 1.5, 1.4, 1.6, 1.6, 1.2, 1.3, 1.2, 1.4] },
    { trat: { tipo: 'factor' }, bloque: { tipo: 'factor' } });
  SPT.caso('Reporte, código R y párrafo de MANOVA y del discriminante', () => {
    const t = tabla();
    const pedidos = [['manova', { respuestas: ['y1', 'y2', 'y3'], tratamientos: ['trat'], bloque: 'bloque' }, {}, 'summary.aov'], ['manova', { respuestas: ['y1', 'y2'], tratamientos: ['trat'] }, { prueba: 'wilks' }, 'Wilks'],
      ['discriminante', { variables: ['y1', 'y2', 'y3'], grupo: 'trat' }, {}, 'CV = TRUE']];
    for (const [id, e, op0, fn] of pedidos) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, op0), r = SP.ejecutar(id, t, e, op).resultado, rep = f.reporte(r);
      const todo = rep.conclusiones.join(' ');
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length && !/undefined|NaN|\{[a-zA-Z]+\}/.test(todo), id + ': ' + todo.slice(0, 200));
      SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes(fn), id + ': ' + fn);
      const p = SP.informe.parrafo(id, r, rep, e, op);
      SPT.afirmar(p.metodos && p.resultados && !/undefined|NaN|\{[a-zA-Z]+\}|\s\s|\s,/.test(p.metodos + p.resultados), id + ': ' + p.metodos + ' ' + p.resultados);
      for (const k of p.citas) SPT.afirmar(SP.informe.referencia(k).length > 20, id + ': cita sin referencia ' + k);
    }
  });
  SPT.caso('El modelo de la MANOVA: columnas como model.matrix (bloque, efectos principales e interacción)', () => {
    const cods = [{ niveles: ['a', 'b'], cod: [0, 1, 0, 1, 0, 1] }, { niveles: ['x', 'y', 'z'], cod: [0, 0, 1, 1, 2, 2] }];
    const M = SP.metodosMultivariado.modelo(cods, ['A', 'B'], false);
    SPT.igualJSON(M.terminos, ['A', 'B', 'A:B']);
    SPT.igualJSON(M.asignacion, [0, 1, 2, 2, 3, 3]);
    SPT.igualJSON(M.X[3], [1, 1, 1, 0, 1, 0]);   // fila 4: A = b, B = y → (1, Ab, By, Bz, Ab:By, Ab:Bz)
  });
  SPT.caso('M de Box: grupos con la misma covarianza dan χ² = 0; la prueba sale en el reporte, el código R y el párrafo', () => {
    const base = [[1, 2], [2, 1], [3, 4], [4, 6], [5, 3]], Y = base.concat(base.map(f => [f[0] + 10, f[1] - 5])), g = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1];
    const B = SP.multivariado.boxM(Y, g, 2);
    SPT.cerca(B.chi2, 0, 1e-12); SPT.cerca(B.p, 1, 1e-12); SPT.igual(B.gl, 3);
    const t = tabla(), f = SP.metodos.discriminante, op = SP.opcionesCon(f, {}), e = { variables: ['y1', 'y2', 'y3'], grupo: 'trat' };
    const r = SP.ejecutar('discriminante', t, e, op).resultado, rep = f.reporte(r);
    SPT.afirmar(rep.cuadros.some(q => q.id === 'box') && rep.semaforo.some(s => /Box/.test(s.nombre)), 'cuadro y semáforo de la M de Box');
    SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes('boxM'), 'código R con boxM');
    SPT.afirmar(/M de Box \(Box, 1949\)/.test(SP.informe.parrafo('discriminante', r, rep, e, op).resultados), 'párrafo con la M de Box');
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla(), op = id => SP.opcionesCon(SP.metodos[id], {});
    SPT.lanza(() => SP.ejecutar('manova', t, { respuestas: ['y1'], tratamientos: ['trat'] }, op('manova')), 'al menos dos variables respuesta');
    const col = SP.tabla.crear({ g: ['a', 'a', 'a', 'b', 'b', 'b'], u: [1, 2, 3, 4, 5, 6], v: [2, 4, 6, 8, 10, 12] }, { g: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('discriminante', col, { variables: ['u', 'v'], grupo: 'g' }, op('discriminante')), 'colineales');
  });
});

SPT.describir('Multivariado · M de Box sin grupos suficientes y filas usadas', () => {
  SPT.caso('Sin dos grupos con más unidades que variables, la M de Box no se calcula: ni gl negativos ni cuadro, y el semáforo dice por qué', () => {
    const Y = [[1, 2, 3], [2, 2, 1], [4, 5, 2], [3, 1, 6], [5, 4, 6], [8, 4, 9], [2, 6, 1], [7, 3, 5], [3, 8, 4]], g = [0, 0, 0, 1, 1, 1, 2, 2, 2];
    const B = SP.multivariado.boxM(Y, g, 3);
    SPT.afirmar(Number.isNaN(B.p) && Number.isNaN(B.gl) && Number.isNaN(B.chi2), 'sin estadístico');
    SPT.igual(B.validos, 0); SPT.igual(B.variables, 3);
    const t = SP.tabla.crear({ g: ['x', 'x', 'x', 'y', 'y', 'y', 'z', 'z', 'z'], a: Y.map(f => f[0]), b: Y.map(f => f[1]), c: Y.map(f => f[2]) }, { g: { tipo: 'factor' } });
    const f = SP.metodos.manova, r = SP.ejecutar('manova', t, { respuestas: ['a', 'b', 'c'], tratamientos: ['g'] }, SP.opcionesCon(f, {})).resultado, rep = f.reporte(r);
    SPT.afirmar(!rep.cuadros.some(q => q.id === 'box'), 'sin cuadro de la M de Box');
    const s = rep.semaforo.find(x => /Box/.test(x.nombre));
    SPT.igual(s.color, 'gris'); SPT.afirmar(/ninguno las tiene/.test(s.texto), s.texto);
    /* el CSV para PCAPro y ClusteringPro sale de las filas que usó la MANOVA */
    SPT.igual(r.filas.length, 9);
  });
});

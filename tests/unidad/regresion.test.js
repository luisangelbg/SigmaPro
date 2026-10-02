/* Pruebas de js/metodos/regresion.js y ancova.js que no cubren los casos contra R: la SVD de Jacobi, la lectura de
   los valores para predecir, casos límite (ajuste perfecto, colinealidad, pocos valores de x), validaciones y reportes. */
SPT.describir('Regresión y ANCOVA · casos límite, validaciones y reportes', () => {
  const cars = () => SP.tabla.crear({
    speed: [4, 4, 7, 7, 8, 9, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 16, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 20, 20, 20, 20, 20, 22, 23, 24, 24, 24, 24, 25],
    dist: [2, 10, 4, 22, 16, 10, 18, 26, 34, 17, 28, 14, 20, 24, 28, 26, 34, 34, 46, 26, 36, 60, 80, 20, 26, 54, 32, 40, 32, 40, 50, 42, 56, 76, 84, 36, 46, 68, 32, 48, 52, 56, 64, 66, 54, 70, 92, 93, 120, 85],
  });

  SPT.caso('SVD de Jacobi: valores singulares de una matriz conocida y vectores ortonormales', () => {
    /* A = U·diag(5, 2, 0.001)·Vᵀ con U y V rotaciones: los valores salen de mayor a menor, el pequeño con exactitud relativa */
    const c = Math.cos(0.7), s = Math.sin(0.7), U = [[c, -s, 0], [s, c, 0], [0, 0, 1]], V = [[1, 0, 0], [0, c, s], [0, -s, c]], d = [5, 2, 0.001];
    const A = new Float64Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let v = 0; for (let k = 0; k < 3; k++) v += U[i][k] * d[k] * V[j][k]; A[i + j * 3] = v; }
    const r = SP.algebra.svdJacobi(A, 3, 3);
    SPT.cerca(r.d[0], 5, 1e-13); SPT.cerca(r.d[1], 2, 1e-13); SPT.cerca(r.d[2] / 0.001, 1, 1e-10);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      let p = 0; for (let i = 0; i < 3; i++) p += r.V[i + a * 3] * r.V[i + b * 3];
      SPT.cerca(p, a === b ? 1 : 0, 1e-13);
    }
  });

  SPT.caso('valores para predecir: espacios, punto y coma, coma decimal y errores claros', () => {
    SPT.igualJSON(SP.reg.leerValores('10 21,5; 30', 1), [[10], [21.5], [30]]);
    SPT.igualJSON(SP.reg.leerValores('8.3 70\n12,5 80', 2), [[8.3, 70], [12.5, 80]]);
    SPT.igualJSON(SP.reg.leerValores('−2', 1), [[-2]]);
    SPT.lanza(() => SP.reg.leerValores('8.3', 2), /2 números/);
    SPT.lanza(() => SP.reg.leerValores('diez', 1), /no es un número/);
  });

  SPT.caso('ajuste perfecto: sin error, el semáforo queda gris y no se calculan pruebas', () => {
    const t = SP.tabla.crear({ y: [3, 5, 7, 9, 11], x: [1, 2, 3, 4, 5] });
    const r = SP.ejecutar('regresion-lineal', t, { respuesta: 'y', predictores: ['x'] }, {}).resultado;
    SPT.afirmar(r.perfecto);
    const rep = SP.metodos['regresion-lineal'].reporte(r);
    SPT.igualJSON(rep.semaforo.map(s => s.color), ['gris']);
    SPT.afirmar(/Ajuste perfecto/.test(rep.conclusiones[0]));
  });

  SPT.caso('colinealidad perfecta y polinomio con pocos valores de x: errores con su arreglo', () => {
    const t = SP.tabla.crear({ y: [3, 5, 7, 9, 11, 4], x: [1, 2, 3, 4, 5, 6], z: [2, 4, 6, 8, 10, 12] });
    SPT.lanza(() => SP.ejecutar('regresion-lineal', t, { respuesta: 'y', predictores: ['x', 'z'] }, {}), /combinación lineal exacta/);
    const t2 = SP.tabla.crear({ y: [3, 5, 7, 9, 11, 4, 5, 6], x: [1, 1, 2, 2, 3, 3, 1, 2] });
    SPT.lanza(() => SP.ejecutar('regresion-polinomial', t2, { respuesta: 'y', predictores: 'x' }, { grado: 3 }), /al menos 4 valores distintos/);
    SPT.lanza(() => SP.ejecutar('regresion-polinomial', t2, { respuesta: 'y', predictores: 'x' }, { grado: 5 }), /grado del polinomio/);
    SPT.lanza(() => SP.ejecutar('regresion-lineal', t, { respuesta: 'y', predictores: ['y'] }, {}), /respuesta no puede ser también predictor/);
  });

  SPT.caso('regresión simple: conclusión con la pendiente, falta de ajuste por repeticiones y bandas para la gráfica', () => {
    const r = SP.ejecutar('regresion-lineal', cars(), { respuesta: 'dist', predictores: ['speed'] }, { predecir: '10 21.5' }).resultado;
    const rep = SP.metodos['regresion-lineal'].reporte(r);
    SPT.afirmar(/aumenta en promedio 3\.932/.test(rep.conclusiones[0]));
    SPT.igual(r.falta_ajuste.grupos, 19);
    SPT.igual(r.banda.x.length, 101);
    SPT.afirmar(r.banda.ip_inf.every((v, i) => v < r.banda.ic_inf[i]), 'la banda de predicción es más ancha');
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['coeficientes', 'anova', 'ajuste', 'pruebas', 'influyentes', 'predicciones']);
    SPT.igual(rep.semaforo.length, 5, 'sin colinealidad con un predictor');
    SPT.afirmar(/predict\(modelo, nuevos, interval = "prediction"/.test(SP.metodos['regresion-lineal'].codigoR({ respuesta: 'dist', predictores: ['speed'] }, SP.opcionesCon(SP.metodos['regresion-lineal'], { predecir: '10' }))));
  });

  SPT.caso('óptimo de la curva: máximo de la cuadrática y sin raíces reales en la cúbica', () => {
    const o = SP.reg.optimo([1, 4, -2], 0, 3);
    SPT.cerca(o.x, 1, 1e-15); SPT.cerca(o.y, 3, 1e-15); SPT.igual(o.tipo, 'maximo'); SPT.afirmar(o.dentro);
    SPT.afirmar(SP.reg.optimo([0, 1, 0, 1], -5, 5) === null, 'derivada 3x² + 1 sin raíces');
    const c = SP.reg.optimo([0, -3, 0, 1], -5, 5);
    SPT.cerca(c.x, -1, 1e-12); SPT.igual(c.tipo, 'maximo');
  });

  SPT.caso('selección: validaciones y número de filas de mejores subconjuntos', () => {
    const t = SP.tabla.crear({ y: [1, 3, 2, 5, 4, 6, 8, 7, 9, 12], a: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], b: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9], c: [5, 3, 4, 1, 2, 6, 9, 7, 8, 10] });
    const e = { respuesta: 'y', predictores: ['a', 'b', 'c'] };
    SPT.lanza(() => SP.ejecutar('seleccion-pasos', t, { respuesta: 'y', predictores: ['a'] }, {}), /al menos dos/);
    SPT.lanza(() => SP.ejecutar('seleccion-pasos', t, e, { criterio: 'p', direccion: 'mixta', entrada: 0.2, salida: 0.1 }), /sin fin/);
    const s = SP.ejecutar('mejores-subconjuntos', t, e, { mejores: 3 }).resultado;
    SPT.igualJSON(s.filas.map(f => f.tamano), [1, 1, 1, 2, 2, 2, 3]);
    SPT.afirmar(s.filas.every((f, i) => i === 0 || f.tamano !== s.filas[i - 1].tamano || f.rss >= s.filas[i - 1].rss), 'ordenados por SCE dentro de cada tamaño');
    const p = SP.ejecutar('seleccion-pasos', t, e, { criterio: 'aic', direccion: 'adelante' }).resultado;
    SPT.igual(p.pasos[0].variables.length, 0, 'hacia adelante empieza sin predictores');
    SPT.afirmar(p.pasos.every((x, i) => i === 0 || x.aic < p.pasos[i - 1].aic), 'cada paso baja el AIC');
  });

  SPT.caso('ANCOVA con muchas filas: comprimir por celdas da los mismos coeficientes, SC y medias ajustadas', () => {
    let s = 11;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { y: [], A: [], B: [], bloque: [], x: [], z: [] };
    for (let i = 0; i < 900; i++) {
      const a = i % 3, b = Math.floor(i / 3) % 2, bl = Math.floor(i / 6) % 5, x = 10 + 5 * az(), z = az();
      c.A.push('a' + a); c.B.push('b' + b); c.bloque.push('k' + bl); c.x.push(x); c.z.push(z);
      c.y.push(2 + a * 0.4 - b * 0.3 + bl * 0.2 + 0.3 * x * (1 + 0.1 * a) - z + az());
    }
    const t = SP.tabla.crear(c, { A: { tipo: 'factor' }, B: { tipo: 'factor' }, bloque: { tipo: 'factor' } });
    for (const f of ['y ~ bloque + x + z + A * B', 'y ~ bloque + x + A * B + x:A + x:B + x:A:B', 'x ~ bloque + A * B']) {
      const a0 = SP.lineal.ajustar(t, f, { agrupar: false }), a1 = SP.lineal.ajustar(t, f, { agrupar: true });
      SPT.afirmar(a1.agrupado && a1.qr.n < 100, 'se comprimió a pocas filas: ' + f);
      SPT.cerca(a1.scResidual / a0.scResidual, 1, 1e-11);
      a0.coeficientes.forEach((b, j) => SPT.cerca(a1.coeficientes[j], b, 1e-9 * Math.max(1, Math.abs(b))));
      for (const tipo of [1, 2, 3]) {
        const t0 = SP.lineal.anova(t, f, { tipo, agrupar: false }), t1 = SP.lineal.anova(t, f, { tipo, agrupar: true });
        t0.sc.forEach((v, k) => SPT.cerca(t1.sc[k], v, 1e-9 * Math.max(1, v)));
      }
    }
    const f = 'y ~ bloque + x + A * B', m0 = SP.medias.emm(t, SP.lineal.ajustar(t, f, { agrupar: false }), ['A']), m1 = SP.medias.emm(t, SP.lineal.ajustar(t, f, { agrupar: true }), ['A']);
    m0.forEach((m, k) => { SPT.cerca(m1[k].emm, m.emm, 1e-10); SPT.cerca(m1[k].ee, m.ee, 1e-10); });
  });

  SPT.caso('ANCOVA: covariable confundida, covariable idéntica en cada tratamiento y reporte con medias ajustadas', () => {
    const t = SP.tabla.crear({ y: [5, 6, 7, 8, 6, 7, 9, 10], trat: ['A', 'A', 'B', 'B', 'A', 'A', 'B', 'B'], x: [1, 1, 2, 2, 1, 1, 2, 2] }, { trat: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('ancova', t, { respuesta: 'y', tratamientos: ['trat'], covariables: ['x'] }, {}), /confundida/);
    /* la misma covariable en cada tratamiento: la F de los tratamientos sobre ella vale 0 (p = 1), no un faltante */
    const t2 = SP.tabla.crear({ y: [5.1, 6.3, 7.2, 5.9, 7.8, 8.1], trat: ['A', 'A', 'A', 'B', 'B', 'B'], x: [1, 2, 3, 1, 2, 3] }, { trat: { tipo: 'factor' } });
    const r = SP.ejecutar('ancova', t2, { respuesta: 'y', tratamientos: ['trat'], covariables: ['x'] }, {}).resultado;
    SPT.igual(r.independencia[0].F, 0); SPT.igual(r.independencia[0].p, 1);
    const rep = SP.metodos.ancova.reporte(r);
    SPT.afirmar(/completamente al azar/.test(rep.titulo));
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['anova', 'pendientes', 'supuestos', 'medias-trat', 'resumen']);
    SPT.igual(rep.semaforo.length, 2);
  });
});

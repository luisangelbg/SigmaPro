/* Pruebas del REML del núcleo (js/nucleo/reml.js) y de los métodos de componentes de varianza, heredabilidad y
   repetibilidad (js/metodos/geneticos.js). Los números contra R están en tests/casos/geneticos; aquí van las piezas:
   el álgebra, que absorber el término mayor dé lo mismo que el cálculo denso, la frontera y los mensajes de error. */
SPT.describir('REML · álgebra y piezas', () => {
  const { chol, resolver, inversa, inversaChica, normales } = SP.reml._alg;

  SPT.caso('Cholesky, solución e inversa de una matriz definida positiva', () => {
    const C = Float64Array.from([4, 2, 0.6, 2, 5, 1, 0.6, 1, 3]), L = chol(C, 3);
    const x = resolver(L, 3, Float64Array.from([1, 2, 3]));
    for (let i = 0; i < 3; i++) SPT.cerca(C[i * 3] * x[0] + C[i * 3 + 1] * x[1] + C[i * 3 + 2] * x[2], [1, 2, 3][i], 1e-14, 'C·x');
    const I = inversa(L, 3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += C[i * 3 + k] * I[k * 3 + j];
      SPT.cerca(s, i === j ? 1 : 0, 1e-14, 'C·C⁻¹');
    }
    SPT.igual(chol(Float64Array.from([1, 2, 2, 1]), 2), null, 'no definida positiva');
    const Ii = inversaChica([[2, 1], [1, 3]]);
    SPT.cerca(Ii[0][0], 0.6, 1e-15); SPT.cerca(Ii[0][1], -0.2, 1e-15);
    SPT.igual(inversaChica([[1, 2], [2, 4]]), null, 'singular');
  });

  SPT.caso('Ecuaciones normales: quitan las columnas dependientes y dan la SC residual', () => {
    const n = 6, X = new Float64Array(n * 4), y = Float64Array.from([3, 5, 4, 7, 6, 9]);
    for (let i = 0; i < n; i++) { X[i] = 1; X[i + n] = i % 2; X[i + 2 * n] = 1 - (i % 2); X[i + 3 * n] = i; }   // col 2 = col 0 − col 1
    const r = normales(X, n, 4, y);
    SPT.igualJSON(r.columnas, [0, 1, 3]);
    /* mínimos cuadrados con 1, x1 y la tendencia */
    const ls = SP.algebra.minimosCuadrados(Float64Array.from([...X.subarray(0, 2 * n), ...X.subarray(3 * n)]), n, 3, y);
    SPT.cerca(r.scr, ls.scResidual, 1e-12);
    SPT.igualJSON(normales(new Float64Array(n * 2).fill(0, 0, n), n, 2).columnas, [], 'columna de ceros fuera');
  });

  SPT.caso('Media de la varianza de las diferencias entre pares y p en la frontera', () => {
    const M = Float64Array.from([2, 0.5, 0.1, 0.5, 3, 0.2, 0.1, 0.2, 1.5]);
    let s = 0, k = 0;
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) { s += M[i * 3 + i] + M[j * 3 + j] - 2 * M[i * 3 + j]; k++; }
    SPT.cerca(SP.reml.mediaDifPares(M, 3), s / k, 1e-15);
    SPT.igual(SP.reml.pFrontera(0), 1);
    SPT.cerca(SP.reml.pFrontera(3.84), 0.5 * SP.dist.pchisq(3.84, 1, false), 1e-15);
    SPT.cerca(SP.reml.armonica([2, 4, 4]), 3, 1e-15);
  });
});

SPT.describir('REML · absorción, frontera y errores', () => {
  /* ensayo pequeño: 12 genotipos × 3 ambientes × 2 repeticiones, con bloques de 4 dentro de cada repetición */
  function ensayo(sinGE) {
    let s = 7;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647, nr = () => Math.sqrt(-2 * Math.log(az())) * Math.cos(2 * Math.PI * az());
    const c = { y: [], gen: [], amb: [], rep: [], blq: [] }, g = Array.from({ length: 12 }, nr), ge = Array.from({ length: 36 }, nr);
    for (let a = 0; a < 3; a++) for (let r = 0; r < 2; r++) for (let k = 0; k < 12; k++) {
      c.gen.push('G' + (k + 1)); c.amb.push('E' + (a + 1)); c.rep.push('R' + (r + 1)); c.blq.push('B' + (Math.floor(k / 4) + 1));
      c.y.push(20 + 2 * a + 1.5 * g[k] + (sinGE ? 0 : 0.8 * ge[k * 3 + a]) + 0.7 * nr());
    }
    return SP.tabla.crear(c, { gen: { tipo: 'factor' }, amb: { tipo: 'factor' }, rep: { tipo: 'factor' }, blq: { tipo: 'factor' } });
  }
  const cerca = (a, b, tol, msg) => { a = Array.from(a); b = Array.from(b); SPT.igual(a.length, b.length, msg); a.forEach((v, i) => SPT.cerca(v, b[i], tol, msg + ' [' + i + ']')); };

  SPT.caso('Absorber el término aleatorio mayor da lo mismo que el cálculo denso', () => {
    const m = SP.reml.modeloDe(ensayo(), 'y', [['amb'], ['amb', 'rep']], [['gen'], ['gen', 'amb'], ['amb', 'rep', 'blq']]);
    const a = SP.reml.ajustar(m), b = SP.reml.ajustar(m, { sinAbsorber: true });
    cerca(a.sigma2, b.sigma2, 1e-9, 'σ²');
    SPT.cerca(a.logLik, b.logLik, 1e-11, 'logLik');
    cerca(a.u[1], b.u[1], 1e-8, 'BLUP G × A');
    cerca(a.pev(1), b.pev(1), 1e-8, 'PEV del término absorbido');
    cerca(a.pev(0), b.pev(0), 1e-8, 'PEV de genotipos');
    cerca(a.varB(), b.varB(), 1e-8, 'varianza de los fijos');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) SPT.cerca(a.cov[i][j], b.cov[i][j], 1e-7, 'cov');
  });

  SPT.caso('Absorber un factor fijo de indicadoras (genotipos fijos) da lo mismo que el cálculo denso', () => {
    const m = SP.reml.modeloDe(ensayo(), 'y', [['amb'], ['amb', 'rep'], ['gen']], [['gen', 'amb']]);
    const a = SP.reml.ajustar(m), b = SP.reml.ajustar(m, { sinAbsorber: true });
    cerca(a.sigma2, b.sigma2, 1e-9, 'σ²');
    cerca(a.b, b.b, 1e-9, 'efectos fijos');
    cerca(a.varB(), b.varB(), 1e-9, 'varianza de los fijos (cruza la parte absorbida)');
    SPT.cerca(a.logLik, b.logLik, 1e-11, 'logLik');
  });

  SPT.caso('Un componente en cero queda en la frontera: sin EE, BLUP y PEV en cero, y p = 1', () => {
    const t = SP.tabla.crear({ y: [1.4, 1.6, 1.5, 1.3, 1.7, 1.45, 1.55, 1.5, 1.35, 1.65, 1.5, 1.6], lote: ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c', 'd', 'd', 'd'] }, { lote: { tipo: 'factor' } });
    const r = SP.ejecutar('componentes-varianza', t, { respuesta: 'y', aleatorios: ['lote'] }, {}).resultado;
    SPT.igual(r.componentes[0].sigma2, 0); SPT.afirmar(r.componentes[0].frontera, 'frontera');
    SPT.afirmar(Number.isNaN(r.componentes[0].ee), 'sin EE');
    SPT.igual(r.lrt[0].p, 1); SPT.igual(r.lrt[0].chi2, 0);
    SPT.afirmar(r.ajuste.convergio, 'convergió');
  });

  SPT.caso('Los métodos piden lo que necesitan y explican cómo arreglarlo', () => {
    const t = ensayo();
    SPT.lanza(() => SP.ejecutar('heredabilidad', t, { respuesta: 'y', genotipo: 'gen', repeticion: 'gen' }, {}), 'dos papeles');
    SPT.lanza(() => SP.ejecutar('heredabilidad', t, { respuesta: 'y', genotipo: 'gen' }, { seleccion: 0.7 }), 'proporción seleccionada');
    SPT.lanza(() => SP.ejecutar('heredabilidad', t, { respuesta: 'y', genotipo: 'rep' }, {}), 'tres genotipos');
    /* una parcela por genotipo y ambiente: la interacción se confunde con el error */
    const una = SP.tabla.crear({ y: [1, 2, 3, 4, 5, 7, 2, 3, 5], g: ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'], e: ['x', 'x', 'x', 'y', 'y', 'y', 'z', 'z', 'z'] }, { g: { tipo: 'factor' }, e: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('heredabilidad', una, { respuesta: 'y', genotipo: 'g', ambiente: 'e' }, {}), 'se confunde con el error');
    SPT.lanza(() => SP.ejecutar('repetibilidad', SP.tabla.crear({ y: [1, 2, 3], i: ['a', 'b', 'c'] }, { i: { tipo: 'factor' } }), { respuesta: 'y', individuo: 'i' }, {}), 'más de una medida');
    SPT.lanza(() => SP.ejecutar('componentes-varianza', t, { respuesta: 'y', aleatorios: ['gen'], fijos: ['gen'] }, {}), 'dos papeles');
    SPT.lanza(() => SP.ejecutar('componentes-varianza', t, { respuesta: 'y', aleatorios: ['gen'] }, { estructura: 'otra' }), 'Estructura desconocida');
  });
});

SPT.describir('Componentes, heredabilidad y repetibilidad · diseño, reporte y código R', () => {
  SPT.caso('Términos aleatorios según la estructura y el modelo de cada diseño genético', () => {
    const G = SP.geneticos;
    SPT.igualJSON(G.terminosAleatorios(['a', 'b', 'c'], 'anidados'), [['a'], ['a', 'b'], ['a', 'b', 'c']]);
    SPT.igualJSON(G.terminosAleatorios(['a', 'b'], 'cruzados'), [['a'], ['b']]);
    SPT.igualJSON(G.terminosAleatorios(['a', 'b', 'c'], 'cruzados-interaccion'), [['a'], ['b'], ['c'], ['a', 'b'], ['a', 'c'], ['b', 'c']]);
    SPT.igualJSON(G.disenoGenetico({ genotipo: 'g' }), { fijos: [], aleatorios: [['g']] });
    SPT.igualJSON(G.disenoGenetico({ genotipo: 'g', repeticion: 'r', bloque: 'b' }), { fijos: [['r']], aleatorios: [['g'], ['r', 'b']] });
    SPT.igualJSON(G.disenoGenetico({ genotipo: 'g', repeticion: 'r', ambiente: 'e' }), { fijos: [['e'], ['e', 'r']], aleatorios: [['g'], ['g', 'e']] });
  });

  SPT.caso('Reporte y código R de la heredabilidad en varios ambientes', () => {
    let s = 11;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { y: [], g: [], e: [], r: [] };
    for (let a = 0; a < 3; a++) for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) { c.g.push('L' + k); c.e.push('E' + a); c.r.push(String(r + 1)); c.y.push(10 + a + (k % 4) + 2 * az()); }
    const t = SP.tabla.crear(c, { g: { tipo: 'factor' }, e: { tipo: 'factor' }, r: { tipo: 'factor' } }), f = SP.metodos.heredabilidad;
    const e = { respuesta: 'y', genotipo: 'g', repeticion: 'r', ambiente: 'e' }, op = SP.opcionesCon(f, { seleccion: 0.25, direccion: 'mayor' });
    const r = SP.ejecutar('heredabilidad', t, e, op).resultado, rep = f.reporte(r);
    SPT.igualJSON(rep.cuadros.map(q => q.id), ['componentes', 'heredabilidad', 'parametros', 'seleccion', 'genotipos']);
    SPT.igual(r.seleccion.k, 2);
    SPT.igual(rep.cuadros[4].filas.filter(x => x.sel === '✓').length, 2, 'dos seleccionados');
    SPT.afirmar(rep.titulo.includes('3 ambientes'), rep.titulo);
    const cod = f.codigoR(e, op);
    SPT.afirmar(cod.includes('lmer(y ~ e + e:r + (1 | g) + (1 | g:e)'), cod.split('\n')[4]);
    SPT.afirmar(cod.includes('H2_cullis') && cod.includes('H2_piepho'), 'Cullis y Piepho');
    const p = SP.informe.parrafo('heredabilidad', r, rep, e, op);
    SPT.afirmar(/Cullis et al\., 2006/.test(p.metodos) && /Piepho y Möhring, 2007/.test(p.metodos), p.metodos);
  });
});

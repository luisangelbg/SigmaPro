/* Pruebas de js/metodos/comparaciones.js que no cubren los casos contra R: el Dunnett contra el cuadro publicado,
   errores con su arreglo, lectura de contrastes y reportes. */
SPT.describir('Comparaciones de medias · Dunnett, errores y reportes', () => {
  const plantas = () => SP.tabla.crear({
    peso: [4.17, 5.58, 5.18, 6.11, 4.50, 4.61, 5.17, 4.53, 5.33, 5.14, 4.81, 4.17, 4.41, 3.59, 5.87, 3.83, 6.03, 4.89, 4.32, 4.69, 6.31, 5.12, 5.54, 5.50, 5.37, 5.29, 4.92, 6.15, 5.80, 5.26],
    grupo: [...Array(10).fill('ctrl'), ...Array(10).fill('trt1'), ...Array(10).fill('trt2')],
  }, { grupo: { tipo: 'factor' } });
  const e = { diseno: 'dca', respuesta: 'peso', tratamientos: ['grupo'], comparar: ['grupo'] };

  SPT.caso('Dunnett exacto reproduce el cuadro de Dunnett (1955): bilateral, 3 tratamientos, 20 gl, α = 0.05 → 2.54', () => {
    const lam = [Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2];
    SPT.cerca(SP.comp.dunnettProb(2.54, lam, 20, true), 0.05, 2e-3);
    /* con gl infinitos y un solo tratamiento es la normal */
    SPT.cerca(SP.comp.dunnettProb(1.959963984540054, [0], Infinity, true), 0.05, 1e-10);
    /* una cola, 2 tratamientos, 12 gl: 2.11 en el cuadro */
    SPT.cerca(SP.comp.dunnettProb(2.11, [Math.SQRT1_2, Math.SQRT1_2], 12, false), 0.05, 2e-3);
  });

  SPT.caso('λ de forma producto: se reconstruyen, y una correlación que no lo es se rechaza', () => {
    const l = SP.comp.lambdasProducto([[1, 0.3, 0.2], [0.3, 1, 0.24], [0.2, 0.24, 1]]);
    SPT.afirmar(l, 'forma producto con λ = (0.5, 0.6, 0.4)');
    SPT.cerca(l[0], 0.5, 1e-12); SPT.cerca(l[1], 0.6, 1e-12); SPT.cerca(l[2], 0.4, 1e-12);
    SPT.afirmar(SP.comp.lambdasProducto([[1, 0.5, 0.1], [0.5, 1, 0.5], [0.1, 0.5, 1]]) === null);
  });

  SPT.caso('comparaciones: reporte con letras, DMS protegida y Dunnett', () => {
    const t = plantas(), f = SP.metodos['comparaciones-medias'];
    const r = SP.ejecutar('comparaciones-medias', t, e, { metodo: 'tukey' }).resultado;
    const rep = f.reporte(r);
    SPT.afirmar(/Tukey/.test(rep.titulo));
    SPT.igual(rep.cuadros[0].filas[0].nombre, 'trt2', 'las medias van de mayor a menor');
    const d = SP.ejecutar('comparaciones-medias', t, e, { metodo: 'dunnett', testigo: 'ctrl' }).resultado;
    SPT.igual(d.grupos[0].comparaciones.length, 2);
    SPT.lanza(() => SP.ejecutar('comparaciones-medias', t, e, { metodo: 'dunnett', testigo: 'nada' }), /testigo/);
  });

  SPT.caso('restricciones explicadas: Games-Howell, Duncan con estratos, comparar un factor ajeno', () => {
    const t = plantas();
    SPT.lanza(() => SP.ejecutar('comparaciones-medias', t, Object.assign({}, e, { comparar: ['peso'] }), { metodo: 'tukey' }), /factores de tratamiento/);
    const c = { y: [], bloque: [], A: [], B: [] };
    for (let b = 1; b <= 3; b++) for (let a = 1; a <= 2; a++) for (let k = 1; k <= 3; k++) { c.bloque.push('b' + b); c.A.push('a' + a); c.B.push('n' + k); c.y.push(10 + a + k * 0.5 + b * 0.2 + ((a * k * b) % 5) * 0.1); }
    const tp = SP.tabla.crear(c, { bloque: { tipo: 'factor' }, A: { tipo: 'factor' }, B: { tipo: 'factor' } });
    const ep = { diseno: 'parcelas-divididas', respuesta: 'y', parcelaGrande: 'A', subparcela: 'B', bloque: 'bloque', principal: 'dbca', comparar: ['B'] };
    SPT.lanza(() => SP.ejecutar('comparaciones-medias', tp, ep, { metodo: 'duncan' }), /un solo error/);
    SPT.lanza(() => SP.ejecutar('comparaciones-medias', tp, ep, { metodo: 'games-howell' }), /un solo factor/);
    const r = SP.ejecutar('comparaciones-medias', tp, Object.assign({}, ep, { dentro: ['A'] }), { metodo: 'tukey' }).resultado;
    SPT.igual(r.grupos.length, 2, 'B dentro de cada A');
  });

  SPT.caso('contrastes: se leen «nombre: coeficientes», se revisa la ortogonalidad y el número de coeficientes', () => {
    const t = plantas();
    const r = SP.ejecutar('contrastes', t, e, { contrastes: 'testigo vs tratados: 2 -1 -1\ntrt1 vs trt2: 0, 1, -1' }).resultado;
    SPT.afirmar(r.grupos[0].todosOrtogonales);
    const sc = r.grupos[0].contrastes.reduce((s, x) => s + x.sc, 0), anova = SP.lineal.anova(t, 'peso ~ grupo', { tipo: 1 });
    SPT.cerca(sc, anova.sc[0], 1e-9, 'dos contrastes ortogonales parten la SC del factor');
    SPT.lanza(() => SP.ejecutar('contrastes', t, e, { contrastes: 'malo: 1 -1' }), /coeficientes/);
    const no = SP.ejecutar('contrastes', t, e, { contrastes: 'a: 1 -1 0\nb: 1 0 -1' }).resultado;
    SPT.afirmar(!no.grupos[0].todosOrtogonales);
  });

  SPT.caso('polinomios: piden niveles numéricos y dan la dosis óptima de la cuadrática', () => {
    const t = plantas();
    SPT.lanza(() => SP.ejecutar('polinomios', t, e, { grado: 2 }), /números/);
    const c = { y: [], dosis: [] };
    for (const d of [0, 40, 80, 120, 160]) for (let r = 0; r < 4; r++) { c.dosis.push(d); c.y.push(10 + 0.1 * d - 0.0004 * d * d + (r - 1.5) * 0.2); }
    const t2 = SP.tabla.crear(c);
    const r = SP.ejecutar('polinomios', t2, { diseno: 'dca', respuesta: 'y', tratamientos: ['dosis'], comparar: ['dosis'] }, { grado: 2 }).resultado;
    SPT.cerca(r.grupos[0].optimo.x, 125, 1e-8, 'máximo de 10 + 0.1x − 0.0004x² en x = 125');
    SPT.igual(r.grupos[0].optimo.tipo, 'maximo');
  });

  SPT.caso('Dunnett exacto con p chicos en segundos: BIB de 7 tratamientos contra T1 (6 comparaciones, 8 gl, λ² = 0.5) en menos de 10 s', () => {
    /* tests/casos/disenos/bib-siete.csv; con la bisección de tolerancia por tramo tardaba 153 s en node */
    const t = SP.tabla.crear({
      y: [11.6, 13.07, 13.85, 11.62, 12.18, 12.78, 11.51, 11.4, 12.67, 12.78, 12.77, 15.07, 17.84, 17.95, 15.08, 13.63, 14.37, 10.57, 14.98, 11.34, 12.57],
      bloque: ['b1', 'b1', 'b1', 'b2', 'b2', 'b2', 'b3', 'b3', 'b3', 'b4', 'b4', 'b4', 'b5', 'b5', 'b5', 'b6', 'b6', 'b6', 'b7', 'b7', 'b7'],
      trat: ['T1', 'T2', 'T4', 'T2', 'T3', 'T5', 'T3', 'T4', 'T6', 'T4', 'T5', 'T7', 'T5', 'T6', 'T1', 'T6', 'T7', 'T2', 'T7', 'T1', 'T3'],
    }, { bloque: { tipo: 'factor' }, trat: { tipo: 'factor' } });
    const t0 = Date.now();
    const r = SP.ejecutar('comparaciones-medias', t, { diseno: 'bib', respuesta: 'y', tratamientos: ['trat'], bloque: 'bloque', comparar: ['trat'] }, { metodo: 'dunnett', testigo: 'T1' }).resultado;
    const ms = Date.now() - t0;
    SPT.afirmar(ms < 10000, 'tardó ' + (ms / 1000).toFixed(1) + ' s');
    /* R 4.4.2: la misma integral doble con integrate(rel.tol = 1e-12) (dunnett_r de tests/casos/comparaciones/generar.R)
       con las t de contrast(emmeans(lm(y ~ bloque + trat), "trat"), "trt.vs.ctrl"); error relativo como en los casos */
    const R = { T2: 0.12750847275387789, T3: 0.0057080661641649979, T4: 0.0025717623381685483, T5: 0.00076884880948623947, T6: 9.4779401458790943e-05, T7: 1.0741429918452737e-05 };
    const comps = r.grupos[0].comparaciones;
    SPT.igual(comps.length, 6);
    for (const x of comps) SPT.cerca(x.p_ajustado / R[x.nivel], 1, 1e-6, 'p de ' + x.nivel);
  });
});

SPT.describir('Comparaciones de medias · la conclusión', () => {
  const concl = y => { const t = SP.tabla.crear({ t: ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'], y }, { t: { tipo: 'factor' } });
    const f = SP.metodos['comparaciones-medias'], r = SP.ejecutar('comparaciones-medias', t, { diseno: 'dca', respuesta: 'y', tratamientos: ['t'], comparar: ['t'] }, SP.opcionesCon(f, { metodo: 'tukey' })).resultado;
    return f.reporte(r).conclusiones[0]; };
  SPT.caso('Las letras van en orden (a, b, c), no en el de aparición de los tratamientos', () => {
    SPT.igual(concl([1, 1.1, 0.9, 5, 5.1, 4.9, 9, 9.1, 8.9]), '3 grupos de medias según Tukey (α = 0.05): a: C; b: B; c: A.');
  });
  SPT.caso('Un solo grupo va en singular', () => {
    SPT.igual(concl([1, 2, 3, 2, 1, 3, 3, 2, 1]), 'Un solo grupo de medias según Tukey (α = 0.05): a: A, B, C.');
  });
});

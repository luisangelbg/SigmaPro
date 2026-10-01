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
});

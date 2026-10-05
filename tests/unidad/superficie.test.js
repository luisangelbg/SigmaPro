/* Pruebas de las superficies de respuesta (js/nucleo/superficie.js y js/metodos/superficie.js): la codificación, los
   valores propios, la cresta (cada punto en su esfera y sin otro mejor en ella), la invariancia de la ecuación en
   unidades originales, los mensajes de error, el reporte, el código R y el párrafo. Los números contra R están en
   tests/casos/superficie. */
SPT.describir('Superficies de respuesta · núcleo', () => {
  SPT.caso('Codificación: central compuesto (axiales en ±α), tres niveles y datos ya codificados', () => {
    const c1 = SP.superficie.codificacion([79.29, 100, 150, 200, 220.71, 150, 100]);
    SPT.cerca(c1.centro, 150, 1e-12); SPT.cerca(c1.paso, 50, 1e-12);
    const c2 = SP.superficie.codificacion([20, 25, 30, 25]);
    SPT.cerca(c2.centro, 25, 1e-12); SPT.cerca(c2.paso, 5, 1e-12);
    const c3 = SP.superficie.codificacion([-1.682, -1, 0, 1, 1.682]);
    SPT.cerca(c3.centro, 0, 1e-12); SPT.cerca(c3.paso, 1, 1e-12);
    const c4 = SP.superficie.codificacion([0, 50, 100, 150]);   // cuatro niveles: punto medio y medio rango
    SPT.cerca(c4.centro, 75, 1e-12); SPT.cerca(c4.paso, 75, 1e-12);
  });
  SPT.caso('Valores propios por Jacobi: de mayor a menor, vectores unitarios con el primer componente positivo', () => {
    const e = SP.superficie.propios([[2, 1], [1, 2]]);
    SPT.cerca(e.valores[0], 3, 1e-14); SPT.cerca(e.valores[1], 1, 1e-14);
    SPT.cerca(e.vectores[0][0], Math.SQRT1_2, 1e-14); SPT.cerca(e.vectores[0][1], Math.SQRT1_2, 1e-14);
    SPT.cerca(e.vectores[1][0], Math.SQRT1_2, 1e-14); SPT.cerca(e.vectores[1][1], -Math.SQRT1_2, 1e-14);
    const A = [[4, -2, 0.5], [-2, 3, 1], [0.5, 1, -1]], f = SP.superficie.propios(A);
    f.vectores.forEach((v, j) => A.forEach((fila, i) => SPT.cerca(fila.reduce((s, a, h) => s + a * v[h], 0), f.valores[j] * v[i], 1e-12, 'A·v = λ·v')));
  });
  SPT.caso('Cresta: cada punto está en su esfera y ningún otro punto de ella da más respuesta', () => {
    const B = [[-1.2, 0.4, 0.1], [0.4, 0.6, -0.3], [0.1, -0.3, -2]], b = [0.8, -0.5, 0.3], eig = SP.superficie.propios(B);
    const y = x => b.reduce((s, v, i) => s + v * x[i], 0) + B.reduce((s, f, i) => s + f.reduce((t, v, j) => t + x[i] * v * x[j], 0), 0);
    let semilla = 3;
    const az = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647 - 0.5;
    for (const r of [0.5, 1, 1.7]) for (const sgn of [1, -1]) {
      const x = SP.superficie.cresta(eig, b, r, sgn);
      SPT.cerca(Math.hypot(...x), r, 1e-12, 'radio');
      for (let k = 0; k < 400; k++) {
        const u = [az(), az(), az()], nu = Math.hypot(...u), p = u.map(v => r * v / nu);
        SPT.afirmar(sgn * (y(p) - y(x)) <= 1e-12, 'otro punto mejor en r = ' + r);
      }
    }
  });
});

SPT.describir('Superficies de respuesta · métodos', () => {
  const ccd = () => {
    const z = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-Math.SQRT2, 0], [Math.SQRT2, 0], [0, -Math.SQRT2], [0, Math.SQRT2], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
    const ruido = [0.12, -0.2, 0.05, 0.1, -0.15, 0.08, -0.02, 0.11, 0.03, -0.09, 0.14, -0.06, 0.02];
    const c = { N: [], K: [], rend: [] };
    z.forEach(([a, b], i) => {
      c.N.push(+(180 + 60 * a).toFixed(1)); c.K.push(+(150 + 50 * b).toFixed(1));
      c.rend.push(62 + 4 * a + 2 * b - 3.5 * a * a - 2.5 * b * b - a * b + ruido[i]);
    });
    return SP.tabla.crear(c, {});
  };
  SPT.caso('Central compuesto: máximo cerca del verdadero, ecuación original equivalente, reporte, código R y párrafo', () => {
    const f = SP.metodos['superficie-respuesta'], e = { respuesta: 'rend', factores: ['N', 'K'] }, op = SP.opcionesCon(f, {});
    const t = ccd(), r = SP.ejecutar('superficie-respuesta', t, e, op).resultado;
    SPT.igual(r.estacionario.naturaleza, 'maximo');
    /* óptimo verdadero de 62 + 4a + 2b − 3.5a² − 2.5b² − ab: a = 9/17, b = 5/17 */
    SPT.afirmar(Math.abs(r.estacionario.codificado[0] - 9 / 17) < 0.05 && Math.abs(r.estacionario.codificado[1] - 5 / 17) < 0.05, 'xs ' + r.estacionario.codificado);
    const N = r.naturales.estimado, x = t.col('N').valores, k = t.col('K').valores;
    r.ajustados.forEach((v, i) => SPT.cerca(N[0] + N[1] * x[i] + N[2] * k[i] + N[3] * x[i] * k[i] + N[4] * x[i] ** 2 + N[5] * k[i] ** 2, v, 1e-9, 'misma predicción'));
    const rep = f.reporte(r);
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['anova', 'coeficientes', 'naturales', 'codificacion', 'estacionario', 'canonico', 'cresta', 'ajuste']);
    SPT.afirmar(/máximo/.test(rep.conclusiones.join(' ')), rep.conclusiones.join(' | '));
    const cod = f.codigoR(e, op, { resultado: r });
    SPT.afirmar(cod.includes('m <- lm(y ~ z1 + z2 + I(z1 * z2) + I(z1^2) + I(z2^2), data = d)'), cod);
    SPT.afirmar(cod.includes('xs <- -0.5 * solve(B, b)'), 'punto estacionario');
    const p = SP.informe.parrafo('superficie-respuesta', r, rep, e, op);
    SPT.afirmar(/Box y Wilson, 1951/.test(p.metodos) && /Draper, 1963/.test(p.metodos) && /máximo/.test(p.resultados), p.metodos + ' ' + p.resultados);
  });
  SPT.caso('Primer orden: el camino sigue la dirección de b y la falta de ajuste detecta la curvatura', () => {
    const c = { A: [-1, 1, -1, 1, 0, 0, 0, 0], B: [-1, -1, 1, 1, 0, 0, 0, 0] };
    c.y = c.A.map((a, i) => 10 + 2 * a + c.B[i] - (a === 0 ? -1.5 : 0) + [0.05, -0.04, 0.02, 0.01, 0.03, -0.02, 0.01, -0.03][i]);
    const r = SP.ejecutar('ascenso-pronunciado', SP.tabla.crear(c, {}), { respuesta: 'y', factores: ['A', 'B'] }, SP.opcionesCon(SP.metodos['ascenso-pronunciado'], {})).resultado;
    const d = r.cresta.codificado[2];
    SPT.cerca(d[0] / d[1], r.coeficientes.estimado[1] / r.coeficientes.estimado[2], 1e-10, 'dirección');
    SPT.afirmar(r.falta_ajuste.p < 0.01, 'curvatura ' + r.falta_ajuste.p);
    SPT.afirmar(!r.estacionario, 'sin punto estacionario en primer orden');
  });
  SPT.caso('Mensajes de error', () => {
    const t = ccd();
    SPT.lanza(() => SP.ejecutar('superficie-respuesta', t, { respuesta: 'rend', factores: ['N'] }, { orden: 'segundo', objetivo: 'maximo', nivel: 0.95 }), 'al menos dos factores');
    const dos = SP.tabla.crear({ a: [-1, 1, -1, 1, -1, 1, -1, 1], b: [-1, -1, 1, 1, -1, -1, 1, 1], y: [1, 2, 3, 4, 1.1, 2.1, 3.1, 4.2] }, {});
    SPT.lanza(() => SP.ejecutar('superficie-respuesta', dos, { respuesta: 'y', factores: ['a', 'b'] }, { orden: 'segundo', objetivo: 'maximo', nivel: 0.95 }), 'no permite estimar');
    const fijo = SP.tabla.crear({ a: [1, 1, 1, 1, 1, 1, 1], b: [-1, 0, 1, -1, 0, 1, 0], y: [1, 2, 3, 4, 5, 6, 7] }, {});
    SPT.lanza(() => SP.ejecutar('ascenso-pronunciado', fijo, { respuesta: 'y', factores: ['a', 'b'] }, { objetivo: 'maximo', nivel: 0.95 }), 'un solo valor');
  });
});

SPT.describir('Superficies de respuesta · Fase 4 (diseños, codificación a mano, mezclas, deseabilidad)', () => {
  const S = () => SP.superficie;
  SPT.caso('Diseños: corridas, α y propiedades; la semilla da siempre el mismo orden', () => {
    const c2 = S().generarDiseno({ tipo: 'ccd', k: 2, alfa: 'rotable' });
    SPT.igual(c2.codificado.length, 13); SPT.cerca(c2.alfa, Math.SQRT2, 1e-15);
    const c3 = S().generarDiseno({ tipo: 'ccd', k: 3, alfa: 'bloques', centros: 6 });
    /* bloques ortogonales: en cada bloque, Σz_j² / n_bloque es el mismo */
    const m = b => { const f = c3.codificado.filter((_, i) => c3.bloque[i] === b); return f.reduce((s, z) => s + z[0] * z[0], 0) / f.length; };
    SPT.cerca(m(1), m(2), 1e-12, 'ortogonal en bloques');
    const c5 = S().generarDiseno({ tipo: 'ccd', k: 5, alfa: 'rotable' });
    SPT.igual(c5.factorial, 16); SPT.afirmar(c5.codificado.slice(0, 16).every(z => z[4] === z[0] * z[1] * z[2] * z[3]), 'media fracción I = ABCDE');
    SPT.igual(S().generarDiseno({ tipo: 'bbd', k: 4 }).codificado.length, 27);
    const lat = S().generarDiseno({ tipo: 'latice', k: 3, grado: 2 });
    SPT.igual(lat.codificado.length, 6); SPT.afirmar(lat.codificado.every(z => Math.abs(z.reduce((a, b) => a + b, 0) - 1) < 1e-15), 'suman 1');
    SPT.igual(S().generarDiseno({ tipo: 'centroide', k: 4 }).codificado.length, 15);
    const a = S().generarDiseno({ tipo: 'ccd', k: 3, alfa: 'rotable', semilla: 42 }), b = S().generarDiseno({ tipo: 'ccd', k: 3, alfa: 'rotable', semilla: 42 });
    SPT.igualJSON(a.orden, b.orden); SPT.afirmar(a.orden.some((v, i) => v !== i), 'al azar');
    SPT.igualJSON([...a.orden].sort((x, y) => x - y), a.orden.map((_, i) => i));
    const r = SP.ejecutar('diseno-superficie', null, {}, SP.opcionesCon(SP.metodos['diseno-superficie'], { tipo: 'ccd', k: 2, nombres: 'N, densidad', bajos: '100, 60', altos: '200, 80' })).resultado;
    SPT.cerca(r.natural[r.natural.length - 1][1], 70 + 10 * Math.SQRT2, 1e-12, 'axial en unidades originales');
    SPT.lanza(() => SP.ejecutar('diseno-superficie', null, {}, SP.opcionesCon(SP.metodos['diseno-superficie'], { tipo: 'ccd', k: 2, bajos: '100', altos: '200, 80' })), 'niveles bajos');
  });
  SPT.caso('Codificación a mano: las mismas predicciones que la automática; cambian los coeficientes codificados', () => {
    const Z = S().generarDiseno({ tipo: 'ccd', k: 2, alfa: 'rotable' }).codificado, c = { N: [], D: [], y: [] };
    Z.forEach((z, i) => { c.N.push(150 + 50 * z[0]); c.D.push(70 + 10 * z[1]); c.y.push(8 + 0.9 * z[0] + 0.4 * z[1] - 0.8 * z[0] * z[0] - 0.5 * z[1] * z[1] + 0.05 * Math.sin(3 * i)); });
    const t = SP.tabla.crear(c, {}), e = { respuesta: 'y', factores: ['N', 'D'] };
    const a = SP.ejecutar('superficie-respuesta', t, e, SP.opcionesCon(SP.metodos['superficie-respuesta'], {})).resultado;
    const m = SP.ejecutar('superficie-respuesta', t, e, SP.opcionesCon(SP.metodos['superficie-respuesta'], { codificacion: 'manual', bajos: [90, 55], altos: [210, 85] })).resultado;
    a.ajustados.forEach((v, i) => SPT.cerca(m.ajustados[i], v, 1e-10));
    SPT.cerca(m.estacionario.natural[0], a.estacionario.natural[0], 1e-9);
    SPT.cerca(m.codificacion.paso[0], 60, 1e-15);
  });
  SPT.caso('Mezclas: Scheffé reproduce el hilo de Cornell y la mejor mezcla cumple Σx = 1 y las condiciones de Lagrange', () => {
    const t = SP.tabla.crear({ x1: [1, 1, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5], x2: [0, 0, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0],
      x3: [0, 0, 0, 0, 0, 0, 0, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5], y: [11.0, 12.4, 15.0, 14.8, 16.1, 8.8, 10.0, 10.0, 9.7, 11.8, 16.8, 16.0, 17.7, 16.4, 16.6] }, {});
    const r = SP.ejecutar('mezclas', t, { respuesta: 'y', componentes: ['x1', 'x2', 'x3'] }, SP.opcionesCon(SP.metodos.mezclas, { modelo: 'cuadratico' })).resultado;
    [11.7, 9.4, 16.4, 19.0, 11.4, -9.6].forEach((b, j) => SPT.cerca(r.coeficientes.estimado[j], b, 1e-12, 'b' + j));
    SPT.cerca(r.optimo.mezcla.reduce((a, b) => a + b, 0), 1, 1e-14);
    /* sobre la arista x1–x3 (x2 = 0): ∂f/∂x1 = ∂f/∂x3 en el óptimo */
    const [x1, , x3] = r.optimo.mezcla;
    SPT.cerca(11.7 + 11.4 * x3, 16.4 + 11.4 * x1, 1e-9, 'Lagrange');
    const pct = SP.tabla.crear({ a: [100, 0, 50], b: [0, 100, 50], y: [1, 2, 3] }, {});
    SPT.lanza(() => SP.ejecutar('mezclas', SP.tabla.crear({ a: [1, 0, 0.6], b: [0, 1, 0.5], y: [1, 2, 3] }, {}), { respuesta: 'y', componentes: ['a', 'b'] }, SP.opcionesCon(SP.metodos.mezclas, { modelo: 'lineal' })), 'no suman lo mismo');
    SPT.afirmar(pct.n === 3, 'tabla en porcentaje');
  });
  SPT.caso('Deseabilidad: las d de Derringer y Suich en sus bordes y la D es la media geométrica ponderada', () => {
    const d = S().deseabilidadUna;
    SPT.igual(d(5, { meta: 'max', L: 5, U: 10 }), 0); SPT.igual(d(10, { meta: 'max', L: 5, U: 10 }), 1); SPT.cerca(d(7.5, { meta: 'max', L: 5, U: 10, s: 2 }), 0.25, 1e-15);
    SPT.igual(d(5, { meta: 'min', L: 5, U: 10 }), 1); SPT.cerca(d(6, { meta: 'valor', L: 5, U: 10, T: 7 }), 0.5, 1e-15); SPT.igual(d(7, { meta: 'valor', L: 5, U: 10, T: 7 }), 1);
    SPT.cerca(S().deseabilidadGlobal([0.5, 0.8], [1, 3]), Math.exp((Math.log(0.5) + 3 * Math.log(0.8)) / 4), 1e-15);
    SPT.igual(S().deseabilidadGlobal([0.5, 0], [1, 1]), 0);
  });
});

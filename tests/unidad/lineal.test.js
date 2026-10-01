/* Pruebas de algebra.js, formula.js y lineal.js con casos resueltos a mano y propiedades.
   La comparación contra R está en tests/casos/lineal. */
SPT.describir('Núcleo · álgebra', () => {
  const A = SP.algebra;
  /* X por columnas: n = 4, p = 2 */
  const X = Float64Array.from([1, 1, 1, 1, 1, 2, 3, 4]);

  SPT.caso('mínimos cuadrados de una recta resuelta a mano', () => {
    const y = [2, 4, 5, 8];        // b = (Xᵀ X)⁻¹ Xᵀ y = (0, 1.9);  ŷ = 1.9x
    const r = A.minimosCuadrados(X, 4, 2, y);
    SPT.cerca(r.coeficientes[0], 0, 1e-14);
    SPT.cerca(r.coeficientes[1], 1.9, 1e-14);
    SPT.cerca(r.scResidual, 0.7, 1e-14);      // residuales 0.1, 0.2, −0.7, 0.4
    SPT.cerca(r.residuales[2], -0.7, 1e-14);
  });

  SPT.caso('una columna colineal se pasa al final y queda sin estimar', () => {
    /* columnas: 1, x, 2x, z → la tercera es 2 × la segunda */
    const x = [1, 2, 3, 4, 5], z = [3, 1, 4, 1, 5];
    const M = Float64Array.from([1, 1, 1, 1, 1, ...x, ...x.map(v => 2 * v), ...z]);
    const d = A.qr(M, 5, 4);
    SPT.igual(d.rango, 3);
    SPT.igualJSON(Array.from(d.pivote), [0, 1, 3, 2]);
    const r = A.minimosCuadrados(M, 5, 4, [2, 3, 5, 4, 7]);
    SPT.afirmar(Number.isNaN(r.coeficientes[2]) && !Number.isNaN(r.coeficientes[3]));
  });

  SPT.caso('(RᵀR)⁻¹ es la inversa de XᵀX', () => {
    const d = A.qr(X, 4, 2);
    const V = A.rtrInversa(d);
    /* XᵀX = [[4, 10], [10, 30]] → inversa = [[1.5, −0.5], [−0.5, 0.2]] */
    SPT.cerca(V[0], 1.5, 1e-14); SPT.cerca(V[1], -0.5, 1e-14); SPT.cerca(V[3], 0.2, 1e-14);
  });

  SPT.caso('la SC residual de un submodelo en el espacio comprimido es la del ajuste directo', () => {
    const n = 30, p = 4, M = new Float64Array(n * p), y = new Float64Array(n);
    let s = 7;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) { M[i] = 1; M[n + i] = azar(); M[2 * n + i] = azar() * 3; M[3 * n + i] = azar() - 0.5; y[i] = azar() * 10; }
    const full = A.minimosCuadrados(M, n, p, y);
    const comp = A.comprimir(full.qr, full.efectos);
    for (const S of [[0], [0, 2], [0, 1, 3], [1, 2, 3]]) {
      const sub = new Float64Array(n * S.length);
      S.forEach((j, k) => sub.set(M.subarray(j * n, j * n + n), k * n));
      const directo = A.minimosCuadrados(sub, n, S.length, y).scResidual;
      SPT.cerca(full.scResidual + A.scResidualSub(comp, S).sc, directo, 1e-12, 'columnas ' + S);
    }
  });

  SPT.caso('Cholesky reconstruye la matriz y rechaza las no definidas positivas', () => {
    const M = Float64Array.from([4, 2, 2, 3]);
    const L = A.cholesky(M, 2);
    SPT.cerca(L[0] * L[0], 4, 1e-15); SPT.cerca(L[1] * L[0], 2, 1e-15); SPT.cerca(L[1] * L[1] + L[3] * L[3], 3, 1e-15);
    SPT.lanza(() => A.cholesky(Float64Array.from([1, 2, 2, 1]), 2), 'definida positiva');
  });
});

SPT.describir('Núcleo · fórmulas', () => {
  const F = SP.formula;
  const etiquetas = f => F.analizar(f).terminos.map(t => t.etiqueta);

  SPT.caso('expansión y orden de los términos como en R', () => {
    SPT.igualJSON(etiquetas('y ~ a*b + c'), ['a', 'b', 'c', 'a:b']);
    SPT.igualJSON(etiquetas('y ~ a*b*c'), ['a', 'b', 'c', 'a:b', 'a:c', 'b:c', 'a:b:c']);
    SPT.igualJSON(etiquetas('y ~ (a + b + c)^2'), ['a', 'b', 'c', 'a:b', 'a:c', 'b:c']);
    SPT.igualJSON(etiquetas('y ~ a/b'), ['a', 'a:b']);
    SPT.igualJSON(etiquetas('y ~ (a + b)/c'), ['a', 'b', 'a:b:c']);
    SPT.igualJSON(etiquetas('y ~ a*b - a:b'), ['a', 'b']);
    SPT.igualJSON(etiquetas('y ~ b:a + a'), ['a', 'b:a'], 'las variables van en el orden de aparición');
    SPT.igualJSON(etiquetas('y ~ a + a + a:a'), ['a'], 'sin repetidos');
  });

  SPT.caso('intercepto: 0, −1, +1 y solo intercepto', () => {
    SPT.igual(F.analizar('y ~ a').intercepto, true);
    SPT.igual(F.analizar('y ~ 0 + a').intercepto, false);
    SPT.igual(F.analizar('y ~ a - 1').intercepto, false);
    SPT.igual(F.analizar('y ~ -1 + a').intercepto, false);
    const s = F.analizar('y ~ 1');
    SPT.igual(s.intercepto, true); SPT.igual(s.terminos.length, 0);
    SPT.igual(F.analizar('`peso seco` ~ trat').respuesta, 'peso seco', 'nombres con espacios entre comillas invertidas');
  });

  SPT.caso('errores de sintaxis explicados', () => {
    SPT.lanza(() => F.analizar('y = a + b'), '«~»');
    SPT.lanza(() => F.analizar('y ~ (a + b'), 'mal formada');
    SPT.lanza(() => F.analizar('y ~ a + 3'), '0 o 1');
    SPT.lanza(() => F.analizar('y ~ a $ b'), 'No entiendo');
  });

  SPT.caso('matrices de contrastes', () => {
    const p = F.contrastes('polinomial', ['1', '2', '3']).matriz;
    SPT.cerca(p[0][0], -Math.SQRT1_2, 1e-15); SPT.cerca(p[1][0], 0, 1e-15); SPT.cerca(p[2][0], Math.SQRT1_2, 1e-15);
    SPT.cerca(p[0][1], 1 / Math.sqrt(6), 1e-15); SPT.cerca(p[1][1], -2 / Math.sqrt(6), 1e-15);
    SPT.igualJSON(F.contrastes('suma', ['a', 'b', 'c']).matriz, [[1, 0], [0, 1], [-1, -1]]);
    SPT.igualJSON(F.contrastes('helmert', ['a', 'b', 'c']).matriz, [[-1, -1], [1, -1], [0, 2]]);
    SPT.igualJSON(F.contrastes('tratamiento', ['a', 'b', 'c']).nombres, ['b', 'c']);
    /* polinomios con dosis desigualmente espaciadas: ortonormales */
    const q = F.polinomios(4, [0, 50, 100, 200]);
    for (let g = 0; g < 4; g++) for (let h = 0; h < 4; h++) {
      const pr = q.reduce((s, fila) => s + fila[g] * fila[h], 0);
      SPT.cerca(pr, g === h ? 1 : 0, 1e-13, `grados ${g} y ${h}`);
    }
  });

  SPT.caso('la matriz omite filas incompletas y niveles sin datos', () => {
    const t = SP.tabla.crear({ y: [1, 2, 'NA', 4, 5], g: ['a', 'b', 'c', 'a', 'b'] }, { g: { tipo: 'factor' } });
    const m = F.matrizModelo(t, 'y ~ g');
    SPT.igual(m.n, 4);
    SPT.igualJSON(m.columnas, ['(Intercepto)', 'gb'], 'el nivel c solo estaba en la fila con faltante');
    SPT.lanza(() => F.matrizModelo(SP.tabla.crear({ y: [1, 2], g: ['a', 'a'] }, { g: { tipo: 'factor' } }), 'y ~ g'), 'un solo nivel');
    SPT.lanza(() => F.matrizModelo(t, 'y ~ h'), 'No existe la columna');
  });
});

SPT.describir('Núcleo · modelo lineal', () => {
  const datos = () => SP.tabla.crear({
    y: [12, 15, 11, 18, 21, 17, 25, 27, 22, 14, 16, 13],
    t: ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C', 'A', 'B', 'C'],
    b: ['1', '2', '3', '1', '2', '3', '1', '2', '3', '4', '4', '4'],
  }, { t: { tipo: 'factor' }, b: { tipo: 'factor' } });

  SPT.caso('bloques completos al azar resueltos a mano', () => {
    /* SC total = Σ(y − ȳ)²; SC trat = b Σ(ȳ_t − ȳ)²; SC bloque = t Σ(ȳ_b − ȳ)² */
    const tab = datos(), y = tab.col('y').valores;
    const m = SP.num.media(y);
    const medias = (f) => { const c = tab.col(f); const s = {}, n = {}; c.codigos.forEach((k, i) => { s[k] = (s[k] || 0) + y[i]; n[k] = (n[k] || 0) + 1; }); return Object.keys(s).map(k => [s[k] / n[k], n[k]]); };
    const sc = f => medias(f).reduce((a, [mu, n]) => a + n * (mu - m) ** 2, 0);
    let sct = 0; for (const v of y) sct += (v - m) ** 2;
    const a = SP.lineal.anova(tab, 'y ~ b + t');
    SPT.igualJSON(a.fuente, ['b', 't', 'Residuales']);
    SPT.igualJSON(a.gl, [3, 2, 6]);
    SPT.cerca(a.sc[0], sc('b'), 1e-12); SPT.cerca(a.sc[1], sc('t'), 1e-12);
    SPT.cerca(a.sc[2], sct - sc('b') - sc('t'), 1e-12);
  });

  SPT.caso('con datos balanceados los tipos I, II y III coinciden', () => {
    const tab = datos();
    const [a1, a2, a3] = [1, 2, 3].map(tipo => SP.lineal.anova(tab, 'y ~ b + t', { tipo }));
    for (const k of [0, 1]) {
      SPT.cerca(a2.sc[k], a1.sc[k], 1e-11);
      SPT.cerca(a3.sc[k + 1], a1.sc[k], 1e-11, 'el tipo III trae primero el intercepto');
    }
    SPT.igual(a3.fuente[0], '(Intercepto)');
  });

  SPT.caso('el tipo III se niega con coeficientes no estimables y lo explica', () => {
    const tab = SP.tabla.crear({ y: [1, 2, 3, 4, 5], a: ['x', 'x', 'y', 'y', 'y'], b: ['p', 'p', 'q', 'q', 'q'] },
      { a: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const e = SPT.lanza(() => SP.lineal.anova(tab, 'y ~ a + b', { tipo: 3 }), 'tipo III no están definidas');
    SPT.afirmar(e.arreglo.includes('tipo II'));
    SPT.igualJSON(SP.lineal.anova(tab, 'y ~ a + b', { tipo: 1 }).fuente, ['a', 'Residuales'], 'el tipo I omite el término confundido');
  });

  SPT.caso('infinitos y respuestas no numéricas se rechazan', () => {
    const tab = SP.tabla.crear({ y: [1, 'Inf', 3, 4], x: [1, 2, 3, 5] });
    SPT.lanza(() => SP.lineal.ajustar(tab, 'y ~ x'), 'infinitos');
    const t2 = SP.tabla.crear({ y: ['a', 'b', 'a', 'b'], x: [1, 2, 3, 4] }, { y: { tipo: 'factor' } });
    SPT.lanza(() => SP.lineal.ajustar(t2, 'y ~ x'), 'debe ser numérica');
  });

  SPT.caso('100 000 filas: factorial 4 × 5 con covariable en menos de 3 s', () => {
    const n = 100000, y = new Float64Array(n), x = new Float64Array(n), a = [], b = [];
    let s = 11;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      a.push('a' + (i % 4)); b.push('b' + ((i * 7) % 5)); x[i] = azar() * 10;
      y[i] = 5 + (i % 4) * 0.3 + x[i] * 0.2 + azar();
    }
    const tab = SP.tabla.crear({ y, x, a, b }, { a: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const t0 = Date.now();
    const r = SP.lineal.anova(tab, 'y ~ x + a * b', { tipo: 2 });
    const ms = Date.now() - t0;
    SPT.igual(r.gl[r.gl.length - 1], n - 21);
    SPT.afirmar(ms < 3000, 'tardó ' + ms + ' ms');
  });
});

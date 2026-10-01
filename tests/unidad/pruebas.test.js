/* Pruebas de js/metodos/pruebas-t.js y no-parametricas.js que no cubren los casos contra R:
   reportes, errores con su arreglo y propiedades de las letras. */
SPT.describir('Pruebas t y no paramétricas · reportes y errores', () => {
  const tablaGrupos = () => SP.tabla.crear(
    { y: [5.1, 4.9, 5.6, 5.8, 6.1, 6.4, 7.2, 6.9, 7.5, 8.1, 8.4, 7.9], g: ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c'] },
    { g: { tipo: 'factor' } });

  SPT.caso('la prueba t arma su reporte en los tres modos, con Student o Welch según se pida', () => {
    const t = tablaGrupos();
    const ind = SP.ejecutar('prueba-t', t, { modo: 'independientes', respuesta: 'y', grupo: 'g', niveles: ['a', 'c'] }, { varIguales: true }).resultado;
    const rep = SP.metodos['prueba-t'].reporte(ind);
    SPT.igual(rep.titulo, 't de Student');
    SPT.igual(rep.cuadros[0].filas[1].prueba, 't de Welch', 'la otra queda como referencia');
    SPT.afirmar(rep.semaforo.some(s => s.clave === 'varianzas'));
    const una = SP.ejecutar('prueba-t', t, { modo: 'una', variable: 'y' }, { mu: 6 }).resultado;
    SPT.igual(SP.metodos['prueba-t'].reporte(una).cuadros[1].filas.length, 1);
    const t2 = SP.tabla.crear({ a: [1, 2, 3, 4, 5], b: [1.4, 2.1, 3.6, 4.2, 5.9] });
    const par = SP.ejecutar('prueba-t', t2, { modo: 'pareadas', antes: 'a', despues: 'b' }, {}).resultado;
    SPT.igual(par.grupos.length, 3, 'antes, después y diferencia');
    SPT.afirmar(/t pareada/.test(SP.metodos['prueba-t'].reporte(par).titulo));
  });

  SPT.caso('t: errores claros con datos constantes, pocos datos o columnas repetidas', () => {
    SPT.lanza(() => SP.pruebaT.unaMuestra([3, 3, 3, 3]), /constantes/);
    SPT.lanza(() => SP.pruebaT.dosMuestras([1], [2, 3]), /al menos dos/);
    const t = SP.tabla.crear({ a: [1, 2, 3], b: [2, 3, 4] });
    SPT.lanza(() => SP.ejecutar('prueba-t', t, { modo: 'pareadas', antes: 'a', despues: 'a' }, {}), /distintas/);
  });

  SPT.caso('la g de Hedges usa la corrección exacta y su IC contiene a la g', () => {
    SPT.cerca(SP.pruebaT.J(10), 0.9227, 1e-4);                     // Hedges (1981): J(10) = 0.9227
    const e = SP.pruebaT.efecto([5.1, 4.9, 5.6, 5.8], [7.2, 6.9, 7.5, 8.1]);
    SPT.afirmar(e.ic_g[0] < e.g && e.g < e.ic_g[1]);
    SPT.afirmar(e.d < 0, 'x menor que y da d negativa');
  });

  SPT.caso('Wilcoxon: reporte en los tres modos y aviso de los ceros', () => {
    const t = tablaGrupos();
    const f = SP.metodos.wilcoxon;
    const ind = SP.ejecutar('wilcoxon', t, { modo: 'independientes', respuesta: 'y', grupo: 'g' }, {}).resultado;
    SPT.afirmar(ind.prueba.exacta, 'sin empates y n < 50: exacta');
    SPT.afirmar(/Mann-Whitney/.test(f.reporte(ind).titulo));
    const una = SP.ejecutar('wilcoxon', t, { modo: 'una', variable: 'y' }, { mu: 5.6 }).resultado;
    SPT.igual(una.prueba.ceros, 1);
    SPT.afirmar(f.reporte(una).cuadros[0].notas.some(n => /no entran/.test(n)));
    SPT.lanza(() => SP.np.signoRango([2, 2, 2], null, { mu: 2 }), /cero/);
  });

  SPT.caso('Kruskal-Wallis y Friedman: letras, cuadros y orden por rangos', () => {
    const t = tablaGrupos();
    const r = SP.ejecutar('kruskal-wallis', t, { respuesta: 'y', tratamiento: 'g' }, { posthoc: 'conover', ajuste: 'holm' }).resultado;
    SPT.igual(r.letras.length, 3);
    const rep = SP.metodos['kruskal-wallis'].reporte(r);
    SPT.igualJSON(rep.cuadros[0].filas.map(x => x.nombre), ['c', 'b', 'a'], 'de mayor a menor rango medio');
    SPT.afirmar(rep.cuadros[0].filas[0].letras.startsWith('a'), 'la «a» es del más alto');
    const fr = SP.tabla.crear({ y: [1, 2, 3, 2, 3, 4, 1, 3, 2, 2, 4, 3], t: 'ABCABCABCABC'.split(''), b: ['1', '1', '1', '2', '2', '2', '3', '3', '3', '4', '4', '4'] },
      { t: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const rf = SP.ejecutar('friedman', fr, { respuesta: 'y', tratamiento: 't', bloque: 'b' }, { posthoc: 'nemenyi' }).resultado;
    SPT.afirmar(rf.prueba.W >= 0 && rf.prueba.W <= 1, 'W de Kendall entre 0 y 1');
    SPT.igual(SP.metodos.friedman.reporte(rf).cuadros.length, 3);
  });

  SPT.caso('Friedman explica cómo arreglar las repeticiones y las combinaciones faltantes', () => {
    const rep = SP.tabla.crear({ y: [1, 2, 3, 4], t: ['A', 'A', 'B', 'B'], b: ['1', '1', '1', '1'] }, { t: { tipo: 'factor' }, b: { tipo: 'factor' } });
    SPT.lanza(() => SP.np.friedman(rep.col('y').valores, rep.col('t'), rep.col('b')), /repeticiones/);
    const falta = SP.tabla.crear({ y: [1, 2, 3], t: ['A', 'B', 'A'], b: ['1', '1', '2'] }, { t: { tipo: 'factor' }, b: { tipo: 'factor' } });
    SPT.lanza(() => SP.np.friedman(falta.col('y').valores, falta.col('t'), falta.col('b')), /faltan combinaciones/);
  });

  SPT.caso('letras: cada par que no difiere comparte letra y cada par que difiere no', () => {
    let s = 11;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let rep = 0; rep < 40; rep++) {
      const n = 3 + (rep % 9), niveles = Array.from({ length: n }, (_, i) => 'n' + i), sig = [];
      for (let j = 0; j < n - 1; j++) for (let i = j + 1; i < n; i++) sig.push(azar() < 0.5);
      const l = SP.np.letras(niveles, sig);
      let k = 0;
      for (let j = 0; j < n - 1; j++) for (let i = j + 1; i < n; i++) {
        const comparten = [...l[j]].some(c => l[i].includes(c));
        SPT.afirmar(comparten === !sig[k], `patrón ${rep}, par (${j}, ${i})`);
        k++;
      }
    }
  });

  SPT.caso('p.adjust: Holm y BH son monótonos y nunca pasan de 1', () => {
    const p = [0.01, 0.04, 0.03, 0.2, 0.5, 0.001];
    for (const m of ['holm', 'BH', 'bonferroni']) {
      const a = SP.np.ajustarP(p, m);
      SPT.afirmar(a.every((v, i) => v >= p[i] && v <= 1), m);
      const o = p.map((v, i) => i).sort((x, y) => p[x] - p[y]);
      for (let i = 1; i < o.length; i++) SPT.afirmar(a[o[i]] >= a[o[i - 1]], m + ' monótono');
    }
  });
});

/* Pruebas de js/metodos/descriptiva.js y js/metodos/frecuencias.js (lo que no cubren los casos contra R). */
SPT.describir('Descriptivos · piezas', () => {
  SPT.caso('grupos anidados: el primer factor cambia más despacio, sin combinaciones vacías y contando las filas fuera', () => {
    const t = SP.tabla.crear({ a: ['x', 'y', 'x', 'y', null, 'x'], b: ['q', 'p', 'p', 'p', 'p', 'q'], v: [1, 2, 3, 4, 5, 6] },
      { a: { tipo: 'factor', niveles: ['x', 'y'] }, b: { tipo: 'factor', niveles: ['p', 'q'] } });
    const g = SP.desc.grupos(t, ['a', 'b']);
    SPT.igualJSON(g.grupos.map(x => x.niveles.join('')), ['xp', 'xq', 'yp']);
    SPT.igualJSON(g.grupos.map(x => Array.from(x.filas)), [[2], [0, 5], [1, 3]]);
    SPT.igual(g.excluidas, 1);
  });
  SPT.caso('moda: todos los valores más repetidos; sin repetidos no hay moda', () => {
    SPT.igualJSON(SP.desc.moda([3, 1, 3, 2, 1, NaN]), { valores: [1, 3], frecuencia: 2 });
    SPT.igualJSON(SP.desc.moda([4, 5, 6]).valores, []);
  });
  SPT.caso('intervalo de la mediana: con n = 10 al 95 % son los órdenes 2 y 9 (confianza real 97.85 %)', () => {
    const r = SP.desc.icMediana([10, 1, 9, 2, 8, 3, 7, 4, 6, 5], 0.95);
    SPT.igual(r.inf, 2); SPT.igual(r.sup, 9); SPT.cerca(r.nivel, 1 - 2 * 11 / 1024, 1e-15);
    SPT.afirmar(Number.isNaN(SP.desc.icMediana([1, 2, 3, 4, 5], 0.95).inf), 'con n = 5 no hay intervalo al 95 %');
  });
  SPT.caso('media recortada, geométrica y armónica', () => {
    SPT.cerca(SP.desc.mediaRecortada([1, 2, 3, 4, 100], 0.2), 3, 1e-15);
    SPT.cerca(SP.desc.geometrica([1, 4, 16]), 4, 1e-14);
    SPT.cerca(SP.desc.armonica([1, 2, 4]), 3 / 1.75, 1e-15);
    SPT.afirmar(Number.isNaN(SP.desc.geometrica([0, 2])), 'con un cero no hay media geométrica');
  });
  SPT.caso('el método explica sus errores', () => {
    const t = SP.tabla.crear({ f: ['a', 'b'], y: [1, 2] }, { f: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('descriptivos', t, { variables: [] }, {}), 'al menos una variable');
    SPT.lanza(() => SP.ejecutar('descriptivos', t, { variables: ['f'] }, {}), 'no es numérica');
    SPT.lanza(() => SP.ejecutar('descriptivos', t, { variables: ['y'], grupos: ['f', 'f', 'f', 'f'] }, {}), 'tres factores');
    SPT.lanza(() => SP.ejecutar('descriptivos', t, { variables: ['y'] }, { tipoCuantil: 10 }), 'de 1 a 9');
  });
  SPT.caso('reporte y código R', () => {
    const t = SP.tabla.crear({ g: ['a', 'a', 'a', 'b', 'b', 'b'], y: [1.25, 2.5, 3.75, 5, 6.25, 7.5] }, { g: { tipo: 'factor' } });
    const f = SP.metodos.descriptivos;
    const r = SP.ejecutar('descriptivos', t, { variables: ['y'], grupos: ['g'] }, {}).resultado;
    SPT.igual(r.decimales.y, 2);
    const rep = f.reporte(r);
    SPT.afirmar(/la media más alta es la de b \(6\.250\)/.test(rep.conclusiones[0]), rep.conclusiones[0]);
    SPT.igual(rep.cuadros[0].filas.length, 2);
    const cod = f.codigoR({ variables: ['y'], grupos: ['g'] }, {});
    SPT.afirmar(/aggregate\(datos\[c\("y"\)\], by = datos\[c\("g"\)\]/.test(cod) && /qbinom\(0\.025, n, 0\.5\)/.test(cod), cod);
  });
});

SPT.describir('Frecuencias · piezas', () => {
  SPT.caso('proporciones esperadas escritas de varias formas', () => {
    SPT.igualJSON(SP.bondad.leerProporciones('9:3:3:1'), [9, 3, 3, 1]);
    SPT.igualJSON(SP.bondad.leerProporciones(' 1 2 1 '), [1, 2, 1]);
    SPT.igualJSON(SP.bondad.leerProporciones('0.25, 0.5; 0.25'), [0.25, 0.5, 0.25]);
    SPT.lanza(() => SP.bondad.leerProporciones('a:b'), 'separados por «:»');
  });
  SPT.caso('la bondad de ajuste pide una proporción por categoría', () => {
    const t = SP.tabla.crear({ c: ['a', 'b', 'c', 'a'] }, { c: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('bondad-ajuste', t, { categoria: 'c' }, { proporciones: [1, 2] }), '3 categorías pero 2');
  });
  SPT.caso('proporciones: éxitos y ensayos se revisan fila por fila', () => {
    const t = SP.tabla.crear({ x: [3, 7], n: [5, 6] });
    SPT.lanza(() => SP.ejecutar('proporciones', t, { exitos: 'x', ensayos: 'n' }, {}), 'más éxitos (7) que ensayos (6)');
    const u = SP.tabla.crear({ x: [2.5], n: [5] });
    SPT.lanza(() => SP.ejecutar('proporciones', u, { exitos: 'x', ensayos: 'n' }, {}), 'enteros');
    SPT.igualJSON(SP.prop.ic(6, 5, 0.95, 'wilson').map(Number.isNaN), [true, true]);
  });
  SPT.caso('tabla cruzada con faltantes como categoría', () => {
    const t = SP.tabla.crear({ a: ['x', null, 'y'], b: ['p', 'p', null] }, { a: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const sin = SP.ejecutar('frecuencias', t, { fila: 'a', columna: 'b' }, {}).resultado;
    SPT.igual(sin.total, 1); SPT.igual(sin.excluidas, 2);
    const con = SP.ejecutar('frecuencias', t, { fila: 'a', columna: 'b' }, { faltantes: true }).resultado;
    SPT.igualJSON(con.niveles_fila, ['x', 'y', '(faltante)']); SPT.igual(con.total, 3);
  });
});

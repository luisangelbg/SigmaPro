/* Pruebas de js/nucleo/tabla.js. */
SPT.describir('Núcleo · tabla en columnas', () => {
  SPT.caso('columnas numéricas: faltantes como NaN e infinitos como en R', () => {
    const t = SP.tabla.crear({ y: [1.5, 'NA', '', null, 'Inf', '-Inf', '2'] });
    const v = t.col('y').valores;
    SPT.afirmar(v instanceof Float64Array);
    SPT.igual(t.n, 7);
    SPT.igual(v[0], 1.5); SPT.igual(v[1], NaN); SPT.igual(v[2], NaN); SPT.igual(v[3], NaN);
    SPT.igual(v[4], Infinity); SPT.igual(v[5], -Infinity); SPT.igual(v[6], 2);
  });

  SPT.caso('un texto que no es número se explica con su arreglo', () => {
    const e = SPT.lanza(() => SP.tabla.crear({ y: [1, 'abc'] }), '«abc» no es un número');
    SPT.afirmar(e.arreglo && e.arreglo.length > 0, 'trae cómo resolverlo');
  });

  SPT.caso('factores con niveles dados respetan ese orden', () => {
    const t = SP.tabla.crear({ trat: ['B', 'A', 'C', 'A', 'NA'] }, { trat: { tipo: 'factor', niveles: ['C', 'B', 'A'] } });
    const f = t.col('trat');
    SPT.igualJSON(f.niveles, ['C', 'B', 'A']);
    SPT.igualJSON(Array.from(f.codigos), [1, 2, 0, 2, SP.tabla.FALTANTE]);
  });

  SPT.caso('sin niveles dados, el orden es el de aparición', () => {
    const f = SP.tabla.crear({ g: ['z', 'a', 'z', 'm'] }, { g: { tipo: 'factor' } }).col('g');
    SPT.igualJSON(f.niveles, ['z', 'a', 'm']);
  });

  SPT.caso('errores claros: nivel desconocido, niveles repetidos, largos distintos, columna inexistente', () => {
    SPT.lanza(() => SP.tabla.crear({ g: ['a', 'x'] }, { g: { tipo: 'factor', niveles: ['a', 'b'] } }), 'no está entre sus niveles');
    SPT.lanza(() => SP.tabla.crear({ g: ['a'] }, { g: { tipo: 'factor', niveles: ['a', 'a'] } }), 'niveles repetidos');
    SPT.lanza(() => SP.tabla.crear({ a: [1, 2], b: [1] }), 'tiene 1 filas y debería tener 2');
    SPT.lanza(() => SP.tabla.crear({ a: [1] }).col('b'), 'No existe la columna «b»');
    SPT.lanza(() => SP.tabla.crear({ a: [1] }, { a: { tipo: 'fecha' } }), 'Tipo de columna desconocido');
  });
});

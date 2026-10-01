/* Pruebas de js/nucleo/sp.js: espacio de nombres, textos y errores. */
SPT.describir('Núcleo · espacio de nombres SP', () => {
  SPT.caso('SP.T devuelve el texto en español y llena las variables', () => {
    SPT.igual(SP.T('Hola'), 'Hola');
    SPT.igual(SP.T('{n} filas y {k} columnas', { n: 48, k: 4 }), '48 filas y 4 columnas');
    SPT.igual(SP.T('Falta {x}', { n: 1 }), 'Falta {x}', 'una variable no dada se queda como está');
  });

  SPT.caso('SP.T usa el catálogo si existe (preparado para otro idioma)', () => {
    const previo = SP.T.catalogo;
    try {
      SP.T.catalogo = { '{n} filas': '{n} rows' };
      SPT.igual(SP.T('{n} filas', { n: 3 }), '3 rows');
      SPT.igual(SP.T('Sin traducir'), 'Sin traducir');
    } finally { SP.T.catalogo = previo; }
  });

  SPT.caso('SP.definir rechaza nombres no válidos, fábricas que no son función y módulos repetidos', () => {
    SPT.lanza(() => SP.definir('Mal Nombre', function () {}), 'nombre de módulo');
    SPT.lanza(() => SP.definir('x-prueba', 42), 'no es una función');
    SPT.lanza(() => SP.definir('numerico', function () {}), 'ya existe');
  });

  SPT.caso('los módulos del núcleo quedan registrados en orden', () => {
    const nombres = SP.fabricas.map(f => f[0]);
    ['numerico', 'tabla', 'registro', 'hilos'].forEach(n => SPT.afirmar(nombres.includes(n), 'falta ' + n));
    SPT.afirmar(nombres.indexOf('numerico') < nombres.indexOf('tabla'), 'numerico antes que tabla');
  });

  SPT.caso('ErrorSP lleva el mensaje y cómo resolverlo', () => {
    const e = new SP.ErrorSP('Falta la respuesta.', 'Elige una columna numérica.');
    SPT.igual(e.name, 'ErrorSP');
    SPT.igual(e.message, 'Falta la respuesta.');
    SPT.igual(e.arreglo, 'Elige una columna numérica.');
    SPT.afirmar(e instanceof Error);
  });

  SPT.caso('faltante y finito siguen la convención de R', () => {
    [null, undefined, NaN].forEach(v => SPT.afirmar(SP.faltante(v), String(v) + ' es faltante'));
    [0, -1, Infinity, -Infinity].forEach(v => SPT.afirmar(!SP.faltante(v), String(v) + ' no es faltante'));
    SPT.afirmar(SP.finito(1.5) && !SP.finito(Infinity) && !SP.finito(NaN) && !SP.finito('1'));
  });
});

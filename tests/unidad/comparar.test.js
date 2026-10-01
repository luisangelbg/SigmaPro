/* Pruebas del comparador (tests/lib/comparar.js). Es la pieza que decide si un método
   aprueba, así que se prueba que acepte lo que debe y, sobre todo, que rechace. */
SPT.describir('Validación · comparador contra R', () => {
  const ok = (o, e, op) => SPT.comparar(o, e, op).aprobado;

  SPT.caso('iguales y dentro de la tolerancia aprueban; fuera, fallan', () => {
    SPT.afirmar(ok({ a: 1 }, { a: 1 }));
    SPT.afirmar(ok({ a: 1 + 5e-7 }, { a: 1 }), '5e-7 ≤ 1e-6');
    SPT.afirmar(!ok({ a: 1 + 2e-6 }, { a: 1 }), '2e-6 > 1e-6');
    SPT.afirmar(ok({ F: 1000 + 5e-4 }, { F: 1000 }), 'escala con |R| cuando es mayor que 1');
    SPT.afirmar(!ok({ F: 1000 + 2e-3 }, { F: 1000 }));
  });

  SPT.caso('el detector detecta: un número cambiado hace fallar el caso y dice dónde', () => {
    const r = SPT.comparar({ tabla: [{ F: 10.4 }, { F: 60.63 }] }, { tabla: [{ F: 10.4 }, { F: 60.6348 }] });
    SPT.afirmar(!r.aprobado);
    SPT.igual(r.fallas.length, 1);
    SPT.igual(r.fallas[0].ruta, 'tabla[1].F');
    SPT.igual(r.valores, 2);
  });

  SPT.caso('magnitudes pequeñas: el modo mixto aprueba por diferencia absoluta; el relativo no', () => {
    SPT.afirmar(ok({ v: 2e-9 }, { v: 1e-9 }), 'mixto: |dif| = 1e-9 ≤ 1e-6');
    SPT.afirmar(!ok({ v: 2e-9 }, { v: 1e-9 }, { modo: 'relativo' }));
    SPT.afirmar(ok({ v: 1e-9 * (1 + 1e-7) }, { v: 1e-9 }, { modo: 'relativo' }));
  });

  SPT.caso('valores p diminutos exigen error relativo aunque el modo sea mixto', () => {
    SPT.afirmar(!ok({ p: 2e-20 }, { p: 1e-20 }), 'p = 2e-20 frente a 1e-20 falla');
    SPT.afirmar(ok({ p: 1e-20 * (1 + 1e-7) }, { p: 1e-20 }));
    SPT.afirmar(!ok({ p_ajustado: 3e-12 }, { p_ajustado: 1e-12 }), 'claves que empiezan con p_');
    SPT.afirmar(!ok({ tukey_p: [0.5, 3e-12] }, { tukey_p: [0.5, 1e-12] }), 'claves que terminan en _p, también en arreglos');
    SPT.afirmar(ok({ pendiente: 3e-12 }, { pendiente: 1e-12 }), 'una clave que no es valor p sigue el modo mixto');
  });

  SPT.caso('el piso absoluto de una ruta acepta p diminutos que solo tienen cifras absolutas, y nada más', () => {
    const op = { tolerancias: { 'pares[*].p_ajustado': { absoluto: 1e-12, motivo: 'p = 1 − ptukey' } } };
    SPT.afirmar(ok({ pares: [{ p_ajustado: 3.0509e-11 }] }, { pares: [{ p_ajustado: 3.0495e-11 }] }, op), '|dif| = 1.4e-14 ≤ 1e-12');
    SPT.afirmar(!ok({ pares: [{ p_ajustado: 3e-11 }] }, { pares: [{ p_ajustado: 1e-11 }] }, op), '|dif| = 2e-11 > 1e-12');
    SPT.afirmar(!ok({ pares: [{ p_ajustado: 0.2 + 2e-6 }] }, { pares: [{ p_ajustado: 0.2 }] }, op), 'los p normales siguen con 1e-6');
    SPT.afirmar(!ok({ otro: { p_ajustado: 3.0509e-11 } }, { otro: { p_ajustado: 3.0495e-11 } }, op), 'solo en la ruta indicada');
  });

  SPT.caso('NA, NaN, Inf y -Inf de R', () => {
    SPT.afirmar(ok({ a: NaN, b: null }, { a: 'NA', b: 'NaN' }));
    SPT.afirmar(!ok({ a: 0 }, { a: 'NA' }), 'un número donde R dio NA falla');
    SPT.afirmar(ok({ a: Infinity, b: -Infinity }, { a: 'Inf', b: '-Inf' }));
    SPT.afirmar(!ok({ a: 1e308 }, { a: 'Inf' }));
    SPT.afirmar(!ok({ a: NaN }, { a: 1 }), 'un faltante donde R dio número falla');
  });

  SPT.caso('textos y lógicos exactos; arreglos con el mismo largo; claves presentes', () => {
    SPT.afirmar(ok({ letras: ['a', 'ab', 'b'] }, { letras: ['a', 'ab', 'b'] }));
    SPT.afirmar(!ok({ letras: ['a', 'b', 'b'] }, { letras: ['a', 'ab', 'b'] }));
    SPT.afirmar(!ok({ x: true }, { x: false }));
    SPT.afirmar(!ok({ v: [1, 2] }, { v: [1, 2, 3] }), 'largo distinto');
    const r = SPT.comparar({ a: 1 }, { a: 1, b: 2 });
    SPT.afirmar(!r.aprobado && r.fallas[0].motivo === 'falta en el resultado');
    SPT.afirmar(ok({ a: 1, extra: 99 }, { a: 1 }), 'el resultado puede traer más claves');
    SPT.afirmar(ok({ v: new Float64Array([1, 2]) }, { v: [1, 2] }), 'arreglos tipados');
  });

  SPT.caso('tolerancias propias por ruta, con comodín', () => {
    const op = { tolerancias: { 'dunnett.p[*]': { tol: 1e-4, motivo: 'cuasi Monte Carlo de R' } } };
    SPT.afirmar(ok({ dunnett: { p: [0.0123 + 5e-5] } }, { dunnett: { p: [0.0123] } }, op));
    SPT.afirmar(!ok({ dunnett: { p: [0.0123 + 5e-5] } }, { dunnett: { p: [0.0123] } }), 'sin la regla falla');
    SPT.afirmar(!ok({ otro: { p: [0.0123 + 5e-5] } }, { otro: { p: [0.0123] } }, op), 'la regla no alcanza otras rutas');
  });

  SPT.caso('informa la mayor diferencia escalada y su ruta', () => {
    const r = SPT.comparar({ a: 1 + 1e-9, b: 100 + 5e-8 }, { a: 1, b: 100 });
    SPT.afirmar(r.aprobado);
    SPT.igual(r.peor, 'a');
    SPT.cerca(r.difEscaladaMax, 1e-9, 1e-6);
  });
});

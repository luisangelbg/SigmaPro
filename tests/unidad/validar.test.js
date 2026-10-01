/* Pruebas de tests/lib/validar.js con un SP de mentira, para no tocar el registro real. */
SPT.describir('Validación · ejecución de casos', () => {
  const spFalso = () => ({
    tabla: SP.tabla,
    falso: {
      resumen: x => ({ n: SP.num.sinFaltantes(x).length, media: SP.num.media(SP.num.sinFaltantes(x)) }),
      niveles: f => ({ niveles: f.niveles }),
      falla: () => { throw new Error('se rompió a propósito'); },
    },
    ejecutar: (id, tabla, entradas, opciones) => ({ resultado: { id, n: tabla.n, alfa: opciones.alfa } }),
  });
  const caso = cambios => Object.assign({
    id: 'falso.resumen/uno', objetivo: { tipo: 'funcion', nombre: 'falso.resumen' },
    datos: { columnas: { x: [1, 2, 'NA', 3] }, tipos: { x: { tipo: 'numerica' } } },
    argumentos: [{ columna: 'x' }],
    esperado: { n: 3, media: 2 },
  }, cambios);

  SPT.caso('una función recibe la columna como Float64Array y aprueba', () => {
    const r = SPT.ejecutarCaso(caso(), spFalso());
    SPT.igual(r.error, '');
    SPT.afirmar(r.aprobado);
    SPT.igual(r.valores, 2);
  });

  SPT.caso('un resultado distinto se reporta como falla, sin lanzar', () => {
    const r = SPT.ejecutarCaso(caso({ esperado: { n: 3, media: 2.1 } }), spFalso());
    SPT.afirmar(!r.aprobado);
    SPT.igual(r.fallas[0].ruta, 'media');
  });

  SPT.caso('los factores llegan con sus niveles en el orden de R', () => {
    const r = SPT.ejecutarCaso(caso({
      objetivo: { tipo: 'funcion', nombre: 'falso.niveles' },
      datos: { columnas: { g: ['b', 'a'] }, tipos: { g: { tipo: 'factor', niveles: ['b', 'a'] } } },
      argumentos: [{ columna: 'g' }],
      esperado: { niveles: ['b', 'a'] },
    }), spFalso());
    SPT.afirmar(r.aprobado, r.error || JSON.stringify(r.fallas));
  });

  SPT.caso('los métodos reciben la tabla, las entradas y las opciones', () => {
    const r = SPT.ejecutarCaso(caso({
      objetivo: { tipo: 'metodo', nombre: 'm-falso' }, entradas: { y: 'x' }, opciones: { alfa: 0.01 },
      esperado: { id: 'm-falso', n: 4, alfa: 0.01 },
    }), spFalso());
    SPT.afirmar(r.aprobado, r.error || JSON.stringify(r.fallas));
  });

  SPT.caso('errores al calcular o casos mal formados quedan en el resultado', () => {
    const a = SPT.ejecutarCaso(caso({ objetivo: { tipo: 'funcion', nombre: 'falso.falla' } }), spFalso());
    SPT.afirmar(!a.aprobado && a.error === 'se rompió a propósito');
    const b = SPT.ejecutarCaso(caso({ objetivo: { tipo: 'funcion', nombre: 'falso.noexiste' } }), spFalso());
    SPT.afirmar(!b.aprobado && /No existe la función/.test(b.error));
    const c = SPT.ejecutarCaso(caso({ objetivo: { tipo: 'otro', nombre: 'x' } }), spFalso());
    SPT.afirmar(!c.aprobado && /Tipo de objetivo/.test(c.error));
  });

  SPT.caso('el resumen cuenta casos, valores y objetivos', () => {
    const r1 = SPT.ejecutarCaso(caso(), spFalso());
    const r2 = SPT.ejecutarCaso(caso({ esperado: { n: 4 } }), spFalso());
    const s = SPT.resumirCasos([r1, r2]);
    SPT.igual(s.casos, 2); SPT.igual(s.aprobados, 1); SPT.igual(s.fallidos, 1);
    SPT.igual(s.valores, 3); SPT.igual(s.objetivos, 1);
  });
});

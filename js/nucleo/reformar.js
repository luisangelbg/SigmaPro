/* SigmaPro — tabla ancha ⇄ tabla larga.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Ancha: una fila por unidad y una columna por fecha, tratamiento o variable medida
          (planta | rend_2024 | rend_2025).
   Larga: una fila por observación (planta | año | rend), la forma que piden los análisis.

     SP.reformar.aLarga({ nombres, columnas }, { ids, medidas, nombreClave, nombreValor, comoNumero })
     SP.reformar.aAncha({ nombres, columnas }, { ids, clave, valor })
     SP.reformar.numerosDe(medidas) → el número de cada nombre (altura_15dds → 15), o null si no todos traen uno solo
   Con comoNumero, la columna de los nombres guarda esos números (días, años, dosis) en vez del nombre completo.
   Trabajan con columnas crudas (arreglos), así sirven para la hoja y para las pruebas. */
SP.definir('reformar', function (SP) {
  'use strict';
  const T = SP.T;

  /** El único número de cada nombre de columna (con decimal de punto o coma), si todos traen uno y son distintos. */
  function numerosDe(medidas) {
    if (!medidas || medidas.length < 2) return null;
    const xs = medidas.map(m => { const k = String(m).match(/\d+(?:[.,]\d+)?/g); return k && k.length === 1 ? Number(k[0].replace(',', '.')) : NaN; });
    return xs.every(Number.isFinite) && new Set(xs).size === xs.length ? xs : null;
  }

  function aLarga(t, op) {
    const ids = op.ids || [], medidas = op.medidas;
    if (!medidas || !medidas.length) throw new SP.ErrorSP(T('Elige las columnas que se van a apilar.'));
    for (const c of [...ids, ...medidas]) if (!t.columnas[c]) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c }));
    const clave = op.nombreClave || 'variable', valor = op.nombreValor || 'valor';
    const numeros = op.comoNumero ? numerosDe(medidas) : null;
    if (op.comoNumero && !numeros) throw new SP.ErrorSP(T('No todos los nombres de las columnas apiladas traen un solo número.'), T('Quita la opción de quedarse con el número.'));
    const n = t.columnas[medidas[0]].length;
    const out = {};
    for (const c of ids) out[c] = [];
    out[clave] = []; out[valor] = [];
    /* como stack()/reshape(): primero todas las filas de la primera medida, luego la segunda … */
    medidas.forEach((m, k) => {
      for (let i = 0; i < n; i++) {
        for (const c of ids) out[c].push(t.columnas[c][i]);
        out[clave].push(numeros ? numeros[k] : m);
        out[valor].push(t.columnas[m][i]);
      }
    });
    return { nombres: [...ids, clave, valor], columnas: out };
  }

  function aAncha(t, op) {
    const ids = op.ids || [], clave = op.clave, valor = op.valor;
    if (!clave || !valor) throw new SP.ErrorSP(T('Elige la columna con los nombres de las columnas nuevas y la de los valores.'));
    const n = t.columnas[clave].length;
    const niveles = SP.tipos.ordenarNiveles(t.columnas[clave], 'aparicion');
    const filas = new Map();
    const out = {};
    for (const c of ids) out[c] = [];
    for (const nv of niveles) out[nv] = [];
    let repetidos = 0;
    for (let i = 0; i < n; i++) {
      const id = ids.map(c => String(t.columnas[c][i])).join('\u0001');
      let r = filas.get(id);
      if (r === undefined) {
        r = filas.size; filas.set(id, r);
        for (const c of ids) out[c].push(t.columnas[c][i]);
        for (const nv of niveles) out[nv].push(null);
      }
      const k = t.columnas[clave][i];
      if (k === null || k === undefined || k === '') continue;
      if (out[String(k)][r] !== null) repetidos++;
      out[String(k)][r] = t.columnas[valor][i];
    }
    if (repetidos) {
      throw new SP.ErrorSP(T('{k} combinaciones se repiten: la tabla ancha no sabría qué valor poner.', { k: repetidos }),
        T('Agrega a los identificadores la columna que distingue esas filas.'));
    }
    return { nombres: [...ids, ...niveles], columnas: out };
  }

  SP.reformar = { aLarga, aAncha, numerosDe };
});

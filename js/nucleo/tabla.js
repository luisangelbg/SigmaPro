/* SigmaPro — tabla de datos en columnas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Forma mínima que comparten todos los métodos (el Hito 1.2 le agrega fechas,
   texto, edición e importación):

     tabla = { n, nombres: [..], columnas: { nombre: columna }, col(nombre) }
     numérica: { nombre, tipo: 'numerica', valores: Float64Array }   faltante = NaN
     factor:   { nombre, tipo: 'factor', codigos: Int32Array, niveles: [..] }   faltante = −1

   El orden de los niveles importa: decide el orden de las medias, de los
   contrastes y de los coeficientes. Por eso se puede fijar a mano; si no se da,
   es el orden de aparición en los datos. Los casos de validación siempre lo fijan
   igual que R, para que los resultados se comparen en el mismo orden. */
SP.definir('tabla', function (SP) {
  'use strict';

  const FALTANTE = -1;
  /* textos que cuentan como faltantes al leer (en el Hito 1.2 serán configurables) */
  const TEXTOS_FALTANTES = new Set(['', 'NA', 'NaN', 'N/A', 'na', 'nan', '.']);

  const esFaltante = v => v === null || v === undefined ||
    (typeof v === 'number' && Number.isNaN(v)) ||
    (typeof v === 'string' && TEXTOS_FALTANTES.has(v.trim()));

  /** Convierte un valor a número: faltantes → NaN, «Inf»/«-Inf» → ±Infinity. */
  function aNumero(v) {
    if (esFaltante(v)) return NaN;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    const s = String(v).trim();
    if (s === 'Inf' || s === '+Inf') return Infinity;
    if (s === '-Inf') return -Infinity;
    const x = Number(s);
    if (Number.isNaN(x)) throw new SP.ErrorSP(SP.T('«{v}» no es un número.', { v: s }), SP.T('Revisa la celda o marca la columna como factor.'));
    return x;
  }

  function numerica(nombre, valores) {
    const v = new Float64Array(valores.length);
    for (let i = 0; i < valores.length; i++) v[i] = aNumero(valores[i]);
    return { nombre, tipo: 'numerica', valores: v };
  }

  function factor(nombre, valores, niveles) {
    const etiquetas = Array.from(valores, x => (esFaltante(x) ? null : String(x)));
    let lista;
    if (niveles) {
      lista = niveles.map(String);
      if (new Set(lista).size !== lista.length) throw new SP.ErrorSP(SP.T('Hay niveles repetidos en «{c}».', { c: nombre }));
    } else {
      lista = [];
      const vistos = new Set();
      for (const e of etiquetas) if (e !== null && !vistos.has(e)) { vistos.add(e); lista.push(e); }
    }
    const indice = new Map(lista.map((e, i) => [e, i]));
    const codigos = new Int32Array(etiquetas.length);
    for (let i = 0; i < etiquetas.length; i++) {
      const e = etiquetas[i];
      if (e === null) { codigos[i] = FALTANTE; continue; }
      const k = indice.get(e);
      if (k === undefined) {
        throw new SP.ErrorSP(SP.T('El valor «{v}» de «{c}» no está entre sus niveles.', { v: e, c: nombre }),
          SP.T('Agrega el nivel o corrige el valor.'));
      }
      codigos[i] = k;
    }
    return { nombre, tipo: 'factor', codigos, niveles: lista };
  }

  /**
   * Arma una tabla a partir de columnas planas.
   * @param {Object<string, Array>} columnas  nombre → valores
   * @param {Object<string, {tipo: string, niveles?: string[]}>} [tipos]  por omisión, numérica
   */
  function crear(columnas, tipos) {
    const nombres = Object.keys(columnas);
    if (!nombres.length) throw new SP.ErrorSP(SP.T('La tabla no tiene columnas.'));
    const n = columnas[nombres[0]].length;
    const cols = {};
    for (const nom of nombres) {
      const v = columnas[nom];
      if (v.length !== n) throw new SP.ErrorSP(SP.T('La columna «{c}» tiene {k} filas y debería tener {n}.', { c: nom, k: v.length, n }));
      const t = (tipos && tipos[nom]) || { tipo: 'numerica' };
      if (t.tipo === 'numerica') cols[nom] = numerica(nom, v);
      else if (t.tipo === 'factor') cols[nom] = factor(nom, v, t.niveles);
      else throw new SP.ErrorSP(SP.T('Tipo de columna desconocido: «{t}».', { t: t.tipo }));
    }
    return {
      n,
      nombres,
      columnas: cols,
      col(nombre) {
        const c = cols[nombre];
        if (!c) throw new SP.ErrorSP(SP.T('No existe la columna «{c}».', { c: nombre }));
        return c;
      },
    };
  }

  SP.tabla = { crear, numerica, factor, aNumero, esFaltante, FALTANTE };
});

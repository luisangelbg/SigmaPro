/* SigmaPro — ejecuta un caso de validación (el mismo código en node y en el navegador).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un caso es el JSON que escribe tests/r/comun.R (formato en docs/VALIDACION.md):

     { id, objetivo: { tipo: 'funcion' | 'metodo', nombre }, titulo, fuente, clase,
       datos: { columnas, tipos }, argumentos | (entradas, opciones),
       esperado, comparacion: { tol, modo, tolerancias }, referencia: { r, paquetes, codigo } }

   - tipo 'funcion': llama SP.<nombre>(...argumentos). Un argumento
     { columna: 'x' } se convierte en esa columna (Float64Array si es numérica,
     el objeto del factor si es factor); { tabla: true } en la tabla completa.
   - tipo 'metodo': arma la tabla y corre SP.ejecutar(nombre, tabla, entradas, opciones). */
(function (raiz) {
  'use strict';
  const SPT = raiz.SPT || (raiz.SPT = {});

  function resolver(SP, ruta) {
    let fn = SP;
    for (const p of String(ruta).split('.')) fn = fn == null ? undefined : fn[p];
    if (typeof fn !== 'function') throw new Error('No existe la función SP.' + ruta);
    return fn;
  }

  function argumento(a, tabla) {
    if (a && typeof a === 'object' && !Array.isArray(a)) {
      if (typeof a.columna === 'string') {
        const c = tabla.col(a.columna);
        return c.tipo === 'numerica' ? c.valores : c;
      }
      if (a.tabla === true) return tabla;
    }
    return a;
  }

  /** Corre un caso y lo compara. Nunca lanza: los errores quedan en el resultado. */
  SPT.ejecutarCaso = function (caso, SP) {
    SP = SP || raiz.SP;
    const r = {
      id: caso.id,
      objetivo: caso.objetivo,
      titulo: caso.titulo || '',
      fuente: caso.fuente || '',
      clase: caso.clase || 'A',
      referencia: caso.referencia || {},
      comparacion: caso.comparacion || {},
      aprobado: false,
      valores: 0,
      difMax: null,
      difEscaladaMax: null,
      peor: null,
      fallas: [],
      error: '',
      ms: 0,
    };
    try {
      if (!caso.objetivo || !caso.objetivo.nombre) throw new Error('El caso no dice qué se valida (objetivo)');
      const d = caso.datos || { columnas: {} };
      const tabla = Object.keys(d.columnas || {}).length ? SP.tabla.crear(d.columnas, d.tipos) : null;
      const t0 = Date.now();
      let obtenido;
      if (caso.objetivo.tipo === 'funcion') {
        const args = (caso.argumentos || []).map(a => argumento(a, tabla));
        obtenido = resolver(SP, caso.objetivo.nombre).apply(null, args);
      } else if (caso.objetivo.tipo === 'metodo') {
        obtenido = SP.ejecutar(caso.objetivo.nombre, tabla, caso.entradas || {}, caso.opciones || {}).resultado;
      } else {
        throw new Error('Tipo de objetivo desconocido: ' + caso.objetivo.tipo);
      }
      r.ms = Date.now() - t0;
      const c = SPT.comparar(obtenido, caso.esperado, caso.comparacion || {});
      Object.assign(r, { aprobado: c.aprobado, valores: c.valores, difMax: c.difMax, difEscaladaMax: c.difEscaladaMax, peor: c.peor, fallas: c.fallas.slice(0, 20) });
      r.totalFallas = c.fallas.length;
    } catch (e) {
      r.error = (e && e.message) || String(e);
      r.aprobado = false;
    }
    return r;
  };

  /** Resume una lista de resultados de casos. */
  SPT.resumirCasos = function (resultados) {
    const s = { casos: resultados.length, aprobados: 0, fallidos: 0, valores: 0, difEscaladaMax: 0, objetivos: 0 };
    const objetivos = new Set();
    for (const r of resultados) {
      if (r.aprobado) s.aprobados++; else s.fallidos++;
      s.valores += r.valores || 0;
      if (r.difEscaladaMax > s.difEscaladaMax) s.difEscaladaMax = r.difEscaladaMax;
      if (r.objetivo) objetivos.add(r.objetivo.tipo + ':' + r.objetivo.nombre);
    }
    s.objetivos = objetivos.size;
    return s;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

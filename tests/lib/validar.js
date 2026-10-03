/* SigmaPro — ejecuta un caso de validación (el mismo código en node y en el navegador).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un caso es el JSON que escribe tests/r/comun.R (formato en docs/VALIDACION.md):

     { id, objetivo: { tipo: 'funcion' | 'metodo', nombre }, titulo, fuente, clase,
       datos: { columnas, tipos }, argumentos | (entradas, opciones),
       esperado, comparacion: { tol, modo, tolerancias }, referencia: { r, paquetes, codigo } }

   - tipo 'funcion': llama SP.<nombre>(...argumentos). Un argumento
     { columna: 'x' } se convierte en esa columna (Float64Array si es numérica,
     el objeto del factor si es factor); { tabla: true } en la tabla completa.
   - vectorizar: true (solo funciones): los argumentos que son arreglos se recorren
     juntos y el resultado es el arreglo de valores (rejillas de distribuciones).
   - tipo 'metodo': arma la tabla y corre SP.ejecutar(nombre, tabla, entradas, opciones).
   - Los métodos del motor R (motor: 'r', Fase 2) se corren con SPT.ejecutarCasoAsync en el navegador
     (tests/motor-r.mjs); ejecutarCaso los marca con motorR: true y no los corre. */
(function (raiz) {
  'use strict';
  const SPT = raiz.SPT || (raiz.SPT = {});

  function resolver(SP, ruta) {
    let fn = SP;
    for (const p of String(ruta).split('.')) fn = fn == null ? undefined : fn[p];
    if (typeof fn !== 'function') throw new Error('No existe la función SP.' + ruta);
    return fn;
  }

  /* R escribe los no finitos como texto: en los argumentos se vuelven números */
  const ESPECIALES = { Inf: Infinity, '-Inf': -Infinity, NaN: NaN, NA: NaN };
  const numeroDe = v => (typeof v === 'string' && Object.prototype.hasOwnProperty.call(ESPECIALES, v) ? ESPECIALES[v] : v);

  function argumento(a, tabla) {
    if (Array.isArray(a)) return a.map(numeroDe);
    if (typeof a === 'string') return numeroDe(a);
    if (a && typeof a === 'object') {
      if (typeof a.columna === 'string' && Object.keys(a).length === 1) {   // { columna: 'x' } es una referencia; { fila, columna, … }, unas entradas
        const c = tabla.col(a.columna);
        return c.tipo === 'numerica' ? c.valores : c;
      }
      if (a.tabla === true) return tabla;
    }
    return a;
  }

  /** ¿El caso es de un método del motor R? */
  SPT.esMotorR = function (caso, SP) {
    SP = SP || raiz.SP;
    const o = caso && caso.objetivo;
    return !!(o && o.tipo === 'metodo' && SP.metodos && SP.metodos[o.nombre] && SP.metodos[o.nombre].motor === 'r');
  };
  function nuevoResultado(caso) {
    return {
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
  }
  function anotarComparacion(r, obtenido, caso) {
    const c = SPT.comparar(obtenido, caso.esperado, caso.comparacion || {});
    Object.assign(r, { aprobado: c.aprobado, valores: c.valores, difMax: c.difMax, difEscaladaMax: c.difEscaladaMax, peor: c.peor, fallas: c.fallas.slice(0, 20) });
    r.totalFallas = c.fallas.length;
  }

  /** Corre un caso y lo compara. Nunca lanza: los errores quedan en el resultado. */
  SPT.ejecutarCaso = function (caso, SP) {
    SP = SP || raiz.SP;
    const r = nuevoResultado(caso);
    if (SPT.esMotorR(caso, SP)) {
      r.motorR = true;
      r.error = 'Se valida en el motor R: node tests/motor-r.mjs';
      return r;
    }
    try {
      if (!caso.objetivo || !caso.objetivo.nombre) throw new Error('El caso no dice qué se valida (objetivo)');
      const d = caso.datos || { columnas: {} };
      const tabla = Object.keys(d.columnas || {}).length ? SP.tabla.crear(d.columnas, d.tipos) : null;
      const t0 = Date.now();
      let obtenido;
      if (caso.objetivo.tipo === 'funcion') {
        const args = (caso.argumentos || []).map(a => argumento(a, tabla));
        const fn = resolver(SP, caso.objetivo.nombre);
        if (caso.vectorizar) {
          /* rejilla: los argumentos que son arreglos en el caso se recorren juntos; los escalares y las
             columnas de datos ({ columna }) se pasan enteros en cada llamada */
          const recorre = (caso.argumentos || []).map(a => Array.isArray(a));
          const largo = Math.max(0, ...args.map((a, k) => (recorre[k] ? a.length : 0)));
          obtenido = [];
          for (let i = 0; i < largo; i++) obtenido.push(fn.apply(null, args.map((a, k) => (recorre[k] ? a[i] : a))));
        } else {
          obtenido = fn.apply(null, args);
        }
      } else if (caso.objetivo.tipo === 'metodo') {
        obtenido = SP.ejecutar(caso.objetivo.nombre, tabla, caso.entradas || {}, caso.opciones || {}).resultado;
      } else {
        throw new Error('Tipo de objetivo desconocido: ' + caso.objetivo.tipo);
      }
      r.ms = Date.now() - t0;
      anotarComparacion(r, obtenido, caso);
    } catch (e) {
      r.error = (e && e.message) || String(e);
      r.aprobado = false;
    }
    return r;
  };

  /** Lo mismo para cualquier caso, también los del motor R (en el navegador). Devuelve una promesa; nunca la rechaza. */
  SPT.ejecutarCasoAsync = async function (caso, SP) {
    SP = SP || raiz.SP;
    if (!SPT.esMotorR(caso, SP)) return SPT.ejecutarCaso(caso, SP);
    const r = nuevoResultado(caso);
    r.motorR = true;
    try {
      const d = caso.datos || { columnas: {} };
      const tabla = SP.tabla.crear(d.columnas, d.tipos);
      const t0 = Date.now();
      const salida = await SP.ejecutarAsync(caso.objetivo.nombre, tabla, caso.entradas || {}, caso.opciones || {});
      r.ms = Date.now() - t0;
      r.motor = Object.assign({ webr: SP.motorR.CONFIG.version }, (salida.resultado && salida.resultado.versiones) || {});
      anotarComparacion(r, salida.resultado, caso);
    } catch (e) {
      r.error = (e && e.message) || String(e);
      if (e && e.r) r.error += ' (R: ' + e.r + ')';
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

/* SigmaPro — espacio de nombres y piezas comunes del núcleo.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán

   This program is free software: you can redistribute it and/or modify it under
   the terms of the GNU General Public License as published by the Free Software
   Foundation, either version 3 of the License, or (at your option) any later
   version. It is distributed in the hope that it will be useful, but WITHOUT ANY
   WARRANTY; see the GNU General Public License, in the file LICENSE at the root
   of this program, or <https://www.gnu.org/licenses/>.

   El núcleo no toca el DOM. Las mismas funciones corren en la página, en un hilo
   de trabajo y en node (pruebas automáticas, sin navegador).

   Cada archivo del núcleo se declara así:

     SP.definir('nombre', function (SP) { … });

   SP.definir ejecuta la fábrica y la guarda, en orden, en SP.fabricas. Con eso
   hilos.js reconstruye el núcleo completo dentro de un hilo de trabajo a partir
   del texto de las funciones, que es lo único que funciona con doble clic
   (file:// no deja cargar archivos desde un hilo). */
(function sigmaproBase(raiz) {
  'use strict';

  const SP = raiz.SP || (raiz.SP = {});
  SP.VERSION = '0.5.5';
  /* El arranque de los módulos de la interfaz. index.html carga los guiones en dos tiempos (hito 5.11): primero la
     página y la barra común, después los de la app, que llegan cuando la página ya se leyó. Cada módulo arranca cuando
     están todos (evento sp:listo, en el orden de carga, como antes en DOMContentLoaded); en una página que los carga
     como siempre, al terminar de leerla. En un hilo de trabajo o en node no hace nada. */
  SP.alArrancar = function (fn) {
    if (typeof document === 'undefined') return;
    if (document.documentElement.hasAttribute('data-sp-listo')) fn();
    else if (document.getElementById('spGuiones')) document.addEventListener('sp:listo', fn, { once: true });
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };
  SP._base = sigmaproBase;            // para reconstruir el núcleo en un hilo
  SP.fabricas = SP.fabricas || [];    // [[nombre, fábrica]] en orden de carga

  SP.definir = function (nombre, fabrica) {
    if (typeof nombre !== 'string' || !/^[a-z][a-z0-9-]*$/.test(nombre)) {
      throw new TypeError('SP.definir: nombre de módulo no válido: ' + nombre);
    }
    if (typeof fabrica !== 'function') throw new TypeError('SP.definir: la fábrica de «' + nombre + '» no es una función');
    if (SP.fabricas.some(f => f[0] === nombre)) throw new Error('SP.definir: el módulo «' + nombre + '» ya existe');
    SP.fabricas.push([nombre, fabrica]);
    fabrica(SP);
  };

  /* ---------------- textos ----------------
     Todo texto visible pasa por SP.T con el texto en español como clave; en inglés, el catálogo
     (js/i18n/en.js deja self.SP_CATALOGO antes de cargar el núcleo; en el hilo de trabajo lo
     antepone hilos.js) da la traducción. Las variables van entre llaves: SP.T('{n} filas', { n: 48 }).
     Una palabra que en inglés depende del contexto lleva su contexto tras «@@» ('media@@nivel'):
     sin catálogo se muestra sin él. */
  SP.T = function (es, vars) {
    const cat = SP.T.catalogo;
    let s = cat && Object.prototype.hasOwnProperty.call(cat, es) ? cat[es] : es;
    if (s === es && es.indexOf('@@') > 0) s = es.slice(0, es.indexOf('@@'));
    if (cat && s === es && SP.T.faltantes && !Object.prototype.hasOwnProperty.call(cat, es)) SP.T.faltantes.add(es);   // tests/idioma.mjs
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
    /* con la interfaz traducida, de qué texto en español salió cada texto corto (títulos de columna, nombres de
       medidas): el registro de estadísticos (guias.js) los reconoce en español */
    if (cat && s.length <= 80) {
      let o = es.indexOf('@@') > 0 ? es.slice(0, es.indexOf('@@')) : es;
      if (vars) o = o.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
      if (o !== s) { if (SP.T.origen.size > 50000) SP.T.origen.clear(); SP.T.origen.set(s, o); }
    }
    return s;
  };
  SP.T.catalogo = raiz.SP_CATALOGO || null;
  SP.T.origen = new Map();
  /** Un nombre (columna, nivel) entre comillas: «x» en español, “x” en inglés. */
  SP.comillas = x => SP.T('«{c}»', { c: x });
  /** El idioma de la interfaz ('es' | 'en') y el formato local de fechas y números. */
  SP.IDIOMA = SP.T.catalogo ? 'en' : 'es';
  SP.LOCAL = SP.IDIOMA === 'en' ? 'en-US' : 'es-MX';

  /* ---------------- errores para la persona usuaria ----------------
     Un ErrorSP lleva el mensaje en lenguaje claro y, aparte, cómo resolverlo. Los
     métodos lo lanzan desde validar(); la interfaz lo muestra con su arreglo. */
  class ErrorSP extends Error {
    constructor(mensaje, arreglo) {
      super(mensaje);
      this.name = 'ErrorSP';
      this.arreglo = arreglo || '';
    }
  }
  SP.ErrorSP = ErrorSP;

  /* ---------------- avance de cálculos largos ----------------
     Un cálculo largo informa su avance con SP.avance(fracción 0–1, mensaje). Por omisión
     no hace nada; hilos.js lo conecta con la barra de espera de la página. */
  SP.avance = function () {};

  /* ---------------- utilidades mínimas ---------------- */
  /** Valor faltante: null, undefined o NaN (como NA y NaN en R). ±Infinity no es faltante. */
  SP.faltante = v => v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
  /** Número finito. */
  SP.finito = v => typeof v === 'number' && Number.isFinite(v);

  return SP;
})(typeof globalThis !== 'undefined' ? globalThis : this);

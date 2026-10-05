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
  SP.VERSION = '0.4.0';
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
     La interfaz es solo en español. Aun así todo texto visible pasa por SP.T: si un
     día se quiere otro idioma, basta un catálogo cuya clave sea el texto en español,
     sin reescribir la app. Las variables van entre llaves: SP.T('{n} filas', { n: 48 }). */
  SP.T = function (es, vars) {
    const cat = SP.T.catalogo;
    let s = cat && Object.prototype.hasOwnProperty.call(cat, es) ? cat[es] : es;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
    return s;
  };
  SP.T.catalogo = null;

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

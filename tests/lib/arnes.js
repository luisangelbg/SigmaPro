/* SigmaPro — arnés de pruebas mínimo (el mismo en node y en el navegador).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SPT.describir('Suma compensada', () => {
       SPT.caso('cancela 1e16', () => SPT.igual(SP.num.suma([1e16, 1, -1e16]), 1));
       SPT.caso('asíncrono', async () => { … });
       SPT.caso('solo en el navegador', () => { … }, { navegador: true });
       SPT.caso('solo en node', () => { … }, { node: true });
     });
     const r = await SPT.correr();   // { aprobadas, fallidas, omitidas, detalles }

   Afirmaciones: afirmar, igual (===, o mismo NaN), cerca (|a − b| ≤ tol·máx(1,|b|)),
   igualJSON y lanza (con texto o expresión regular del mensaje). */
(function (raiz) {
  'use strict';
  const SPT = raiz.SPT || (raiz.SPT = {});
  SPT.suites = [];
  let actual = null;
  const enNavegador = typeof window !== 'undefined' && typeof document !== 'undefined' && !raiz.__SPT_NODE;
  SPT.enNavegador = enNavegador;

  class FallaPrueba extends Error { constructor(m) { super(m); this.name = 'FallaPrueba'; } }

  const mostrar = v => {
    if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (typeof v === 'string') return JSON.stringify(v);
    try { return JSON.stringify(v, (k, x) => (typeof x === 'number' && !Number.isFinite(x) ? String(x) : (ArrayBuffer.isView(x) ? Array.from(x) : x))); } catch (e) { return String(v); }
  };

  SPT.describir = function (nombre, fn) {
    const suite = { nombre, casos: [] };
    SPT.suites.push(suite);
    const previa = actual; actual = suite;
    try { fn(); } finally { actual = previa; }
  };
  SPT.caso = function (nombre, fn, op) {
    if (!actual) throw new Error('SPT.caso fuera de SPT.describir: ' + nombre);
    actual.casos.push({ nombre, fn, op: op || {} });
  };

  SPT.afirmar = function (cond, msg) { if (!cond) throw new FallaPrueba(msg || 'la condición no se cumple'); };
  SPT.igual = function (a, b, msg) {
    const ok = a === b || (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b));
    if (!ok) throw new FallaPrueba((msg ? msg + ': ' : '') + 'se obtuvo ' + mostrar(a) + ', se esperaba ' + mostrar(b));
  };
  SPT.cerca = function (a, b, tol, msg) {
    tol = tol === undefined ? 1e-12 : tol;
    const ok = (typeof a === 'number' && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b))) || a === b;
    if (!ok) throw new FallaPrueba((msg ? msg + ': ' : '') + 'se obtuvo ' + mostrar(a) + ', se esperaba ' + mostrar(b) + ' (tolerancia ' + tol + ')');
  };
  SPT.igualJSON = function (a, b, msg) {
    const sa = mostrar(a), sb = mostrar(b);
    if (sa !== sb) throw new FallaPrueba((msg ? msg + ': ' : '') + 'se obtuvo ' + sa + ', se esperaba ' + sb);
  };
  SPT.lanza = function (fn, patron, msg) {
    try { fn(); } catch (e) {
      if (!patron) return e;
      const texto = (e && e.message) || String(e);
      const ok = patron instanceof RegExp ? patron.test(texto) : texto.includes(patron);
      if (!ok) throw new FallaPrueba((msg ? msg + ': ' : '') + 'el error dice «' + texto + '» y se esperaba ' + patron);
      return e;
    }
    throw new FallaPrueba((msg ? msg + ': ' : '') + 'no lanzó ningún error');
  };

  /** Corre todas las suites en orden. Los casos { navegador: true } se omiten fuera del navegador. */
  SPT.correr = async function (alCaso) {
    const r = { aprobadas: 0, fallidas: 0, omitidas: 0, detalles: [] };
    for (const s of SPT.suites) {
      for (const c of s.casos) {
        const d = { suite: s.nombre, caso: c.nombre, ok: true, omitida: false, error: '' };
        if ((c.op.navegador && !enNavegador) || (c.op.node && enNavegador)) { d.omitida = true; r.omitidas++; }
        else {
          const t0 = Date.now();
          try { await c.fn(); r.aprobadas++; }
          catch (e) { d.ok = false; d.error = (e && e.stack && e.name !== 'FallaPrueba') ? String(e.stack).split('\n').slice(0, 3).join(' | ') : ((e && e.message) || String(e)); r.fallidas++; }
          d.ms = Date.now() - t0;
        }
        r.detalles.push(d);
        if (alCaso) alCaso(d);
      }
    }
    return r;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* SigmaPro — comparación de resultados contra las referencias de R.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Criterio (docs/VALIDACION.md):

     aprobado si |obtenido − esperado| ≤ tol · máx(1, |esperado|),  tol = 1e-6

   Reglas adicionales:
   - Valores p (la clave se llama «p», empieza con «p_» o termina en «_p»): si
     0 < |esperado| < 1e-6 se exige además el error RELATIVO ≤ tol, para que un
     p de 1e-20 no apruebe solo por ser «casi cero».
   - modo 'relativo' (por caso o por ruta): |obtenido − esperado| ≤ tol · |esperado|,
     para magnitudes muy pequeñas que no son valores p.
   - Tolerancias propias por ruta, con su motivo (clases B, C y E):
       tolerancias: { 'dunnett.p[*]': { tol: 1e-4, motivo: '…' } }
     El patrón usa * como comodín.
   - En la referencia, «NA» y «NaN» esperan un faltante (NaN o null); «Inf» y «-Inf»
     esperan infinito. Textos y lógicos se comparan exactos.
   - Solo se comparan las claves que trae la referencia (el resultado puede tener más),
     pero cada una debe existir en el resultado.

   Devuelve { aprobado, valores, difMax, difEscaladaMax, peor, fallas: [...] }. */
(function (raiz) {
  'use strict';
  const SPT = raiz.SPT || (raiz.SPT = {});

  const TOL = 1e-6;
  const esClaveP = k => typeof k === 'string' && (k === 'p' || /^p_/.test(k) || /_p$/.test(k));
  const esFaltante = v => v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
  const esArreglo = v => Array.isArray(v) || (ArrayBuffer.isView(v) && !(v instanceof DataView));

  function patronARegex(p) {
    return new RegExp('^' + p.replace(/[.+?^${}()|\\]/g, '\\$&').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\*/g, '.*') + '$');
  }

  SPT.comparar = function (obtenido, esperado, opciones) {
    const op = opciones || {};
    const tolBase = op.tol === undefined ? TOL : op.tol;
    const modoBase = op.modo || 'mixto';
    const reglas = Object.entries(op.tolerancias || {}).map(([pat, r]) => ({ re: patronARegex(pat), r }));
    const out = { aprobado: true, valores: 0, difMax: 0, difEscaladaMax: 0, peor: null, fallas: [] };

    const regla = ruta => { for (const x of reglas) if (x.re.test(ruta)) return x.r; return null; };
    const falla = (ruta, obt, esp, motivo, dif, limite) => {
      out.aprobado = false;
      out.fallas.push({ ruta, obtenido: obt, esperado: esp, motivo, dif: dif === undefined ? null : dif, limite: limite === undefined ? null : limite });
    };

    function numero(ruta, clave, obt, esp) {
      out.valores++;
      if (typeof obt !== 'number') return falla(ruta, obt, esp, 'no es un número');
      if (Number.isNaN(obt)) return falla(ruta, obt, esp, 'se obtuvo un faltante');
      const r = regla(ruta);
      const tol = r && r.tol !== undefined ? r.tol : tolBase;
      const modo = (r && r.modo) || modoBase;
      const a = Math.abs(esp);
      let limite = modo === 'relativo' ? tol * a : tol * Math.max(1, a);
      if (esClaveP(clave) && a > 0 && a < 1e-6) limite = Math.min(limite, tol * a);
      const dif = obt === esp ? 0 : Math.abs(obt - esp);
      const escala = modo === 'relativo' || (esClaveP(clave) && a > 0 && a < 1e-6) ? (a || 1) : Math.max(1, a);
      const esc = dif / escala;
      if (dif > out.difMax) out.difMax = dif;
      if (esc > out.difEscaladaMax) { out.difEscaladaMax = esc; out.peor = ruta; }
      if (!(dif <= limite)) falla(ruta, obt, esp, 'diferencia mayor que la tolerancia', dif, limite);
    }

    function recorrer(obt, esp, ruta, clave) {
      if (typeof esp === 'number') return numero(ruta, clave, obt, esp);
      if (typeof esp === 'string') {
        if (esp === 'NA' || esp === 'NaN') { out.valores++; if (!esFaltante(obt)) falla(ruta, obt, esp, 'se esperaba un faltante'); return; }
        if (esp === 'Inf' || esp === '-Inf') {
          out.valores++;
          const inf = esp === 'Inf' ? Infinity : -Infinity;
          if (obt !== inf) falla(ruta, obt, esp, 'se esperaba ' + (esp === 'Inf' ? '+∞' : '−∞'));
          return;
        }
        out.valores++;
        if (obt !== esp) falla(ruta, obt, esp, 'texto distinto');
        return;
      }
      if (typeof esp === 'boolean') { out.valores++; if (obt !== esp) falla(ruta, obt, esp, 'valor lógico distinto'); return; }
      if (esp === null) { out.valores++; if (!esFaltante(obt)) falla(ruta, obt, esp, 'se esperaba un faltante'); return; }
      if (esArreglo(esp)) {
        if (!esArreglo(obt)) return falla(ruta, obt, '[arreglo]', 'no es un arreglo');
        if (obt.length !== esp.length) return falla(ruta, obt.length, esp.length, 'longitud distinta');
        for (let i = 0; i < esp.length; i++) recorrer(obt[i], esp[i], ruta + '[' + i + ']', clave);
        return;
      }
      if (typeof esp === 'object') {
        if (obt === null || typeof obt !== 'object') return falla(ruta, obt, '{objeto}', 'no es un objeto');
        for (const k of Object.keys(esp)) {
          const r2 = ruta ? ruta + '.' + k : k;
          if (!(k in obt)) { falla(r2, undefined, esp[k], 'falta en el resultado'); continue; }
          recorrer(obt[k], esp[k], r2, k);
        }
        return;
      }
      falla(ruta, obt, esp, 'tipo de referencia no reconocido');
    }

    recorrer(obtenido, esperado, '', '');
    return out;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);

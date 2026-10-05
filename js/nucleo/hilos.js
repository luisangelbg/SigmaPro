/* SigmaPro — cálculos en un hilo de trabajo.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Con doble clic (file://) el navegador no deja crear un hilo desde un archivo
   ni cargar scripts dentro de él. Por eso el hilo se arma desde texto: la base
   de sp.js más cada fábrica registrada con SP.definir, en el mismo orden. Así el
   hilo tiene exactamente el mismo núcleo que la página.

     SP.hilo.correr('num.resumen', [valores], { alProgreso, senal })  → Promise

   Si el navegador no permite el hilo, el cálculo corre en la página con el mismo
   resultado (solo que la página se ocupa mientras tanto). */
SP.definir('hilos', function (SP) {
  'use strict';

  const disponible = typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined';

  /** Texto que reconstruye el núcleo completo. */
  function fuenteNucleo() {
    /* en inglés, el hilo recibe el mismo catálogo que la página */
    return (SP.T.catalogo ? 'self.SP_CATALOGO = ' + JSON.stringify(SP.T.catalogo) + ';\n' : '') + '(' + SP._base.toString() + ')(self);\n' +
      SP.fabricas.map(([n, f]) => 'SP.definir(' + JSON.stringify(n) + ', ' + f.toString() + ');').join('\n');
  }

  function resolver(sp, ruta) {
    let fn = sp;
    for (const p of String(ruta).split('.')) fn = fn == null ? undefined : fn[p];
    if (typeof fn !== 'function') throw new Error('No existe la función SP.' + ruta);
    return fn;
  }

  const PIE = `
let __ultimo = 0;
SP.avance = function (f, msg) {
  const t = Date.now();
  if (f === 1 || t - __ultimo > 60) { __ultimo = t; postMessage({ tipo: 'avance', f: f, msg: msg }); }
};
onmessage = async function (e) {
  try {
    let fn = SP;
    for (const p of String(e.data.ruta).split('.')) fn = fn == null ? undefined : fn[p];
    if (typeof fn !== 'function') throw new Error('No existe la función SP.' + e.data.ruta);
    const r = await fn.apply(null, e.data.args || []);
    postMessage({ tipo: 'listo', r: r });
  } catch (err) {
    postMessage({ tipo: 'error', msg: (err && err.message) || String(err), arreglo: (err && err.arreglo) || '' });
  }
};`;

  let url = null, urlModulos = -1;
  function urlHilo() {
    /* se rehace si se registraron módulos después de la primera vez */
    if (!url || urlModulos !== SP.fabricas.length) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(new Blob([fuenteNucleo() + PIE], { type: 'text/javascript' }));
      urlModulos = SP.fabricas.length;
    }
    return url;
  }

  function errorDe(msg, arreglo) {
    const e = arreglo ? new SP.ErrorSP(msg, arreglo) : new Error(msg);
    return e;
  }
  function abortado() { const e = new Error('Cálculo cancelado'); e.name = 'AbortError'; return e; }

  /** Corre SP.<ruta>(...args) en la página. */
  async function enLinea(ruta, args, op) {
    const previo = SP.avance;
    if (op && op.alProgreso) SP.avance = op.alProgreso;
    try {
      if (op && op.senal && op.senal.aborted) throw abortado();
      return await resolver(SP, ruta).apply(null, args || []);
    } finally {
      SP.avance = previo;
    }
  }

  /** Corre SP.<ruta>(...args) en un hilo de trabajo (o en la página si no se puede). */
  function correr(ruta, args, op) {
    op = op || {};
    if (!disponible || op.enLinea) return enLinea(ruta, args, op);
    return new Promise((resolve, reject) => {
      let w;
      try { w = new Worker(urlHilo()); } catch (e) { enLinea(ruta, args, op).then(resolve, reject); return; }
      let oyo = false;
      const fin = () => { w.terminate(); if (op.senal) op.senal.removeEventListener('abort', alAbortar); };
      const alAbortar = () => { fin(); reject(abortado()); };
      if (op.senal) {
        if (op.senal.aborted) { fin(); reject(abortado()); return; }
        op.senal.addEventListener('abort', alAbortar);
      }
      w.onmessage = e => {
        oyo = true;
        const m = e.data || {};
        if (m.tipo === 'avance') { if (op.alProgreso) op.alProgreso(m.f, m.msg); }
        else if (m.tipo === 'listo') { fin(); resolve(m.r); }
        else if (m.tipo === 'error') { fin(); reject(errorDe(m.msg, m.arreglo)); }
      };
      w.onerror = e => {
        fin();
        /* un hilo que falla antes de hablar (el navegador lo bloqueó): se calcula en la página */
        if (!oyo) enLinea(ruta, args, op).then(resolve, reject);
        else reject(new Error((e && e.message) || 'Error en el hilo de trabajo'));
      };
      w.postMessage({ ruta, args: args || [] });
    });
  }

  SP.hilo = { correr, fuenteNucleo, disponible };
});

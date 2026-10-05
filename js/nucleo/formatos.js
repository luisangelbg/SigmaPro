/* SigmaPro — formato de los números de los cuadros (el mismo en pantalla, en el reporte y en cada exportación).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un cuadro es { id, titulo, columnas: [{ clave, titulo, formato }], columnasExtra?, filas: [{ … }], notas: [texto] }.
   Formatos: texto · entero · escala (decimales de la fila, _dec) · dato (los de los datos: _dec − 1) · escala2 · pct (1 decimal) ·
   pct100 y pctp (proporción × 100) · intervalo, intervalo2, intervalo100, intervaloDato e intervaloSig ([a, b]) · forma (3) ·
   forma2 (2) · num · num2 · prop (4) · pvalor (< 0.001 o 3 decimales) · auto4 (entero o 4 decimales) ·
   sig (4 cifras significativas; coeficientes de cualquier escala).

     SP.formatos.texto(valor, formato, fila, paraCopiar)   → texto (paraCopiar: sin «−» tipográfico, intervalos con tabulador)
     SP.formatos.columnas(cuadro, visibles)                → columnas que se muestran
     SP.formatos.celdas(cuadro, visibles)                  → { cabecera: [texto], filas: [[texto]], numericas: [bool] }
     SP.formatos.valores(cuadro, visibles)                 → { cabecera, filas } con números (los intervalos en dos columnas) */
SP.definir('formatos', function (SP) {
  'use strict';
  const MENOS = '−';

  function fijo(x, d) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
    const s = x.toFixed(d);
    return /^-0(\.0+)?$/.test(s) ? s.slice(1) : s;      // sin «−0.000»
  }
  /* k cifras significativas: decimales fijos entre 1e-4 y 1e7, notación científica fuera */
  function signif(x, k) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
    if (x === 0) return '0';
    const a = Math.abs(x);
    if (a >= 1e-4 && a < 1e7) return fijo(x, Math.min(12, Math.max(0, k - 1 - Math.floor(Math.log10(a)))));
    return x.toExponential(k - 1).replace('e+', 'e');
  }
  const INTERVALOS = { intervalo: 'escala', intervalo2: 'escala2', intervalo100: 'pct100', intervaloDato: 'dato', intervaloSig: 'sig' };
  function texto(v, f, fila, paraCopiar) {
    const d = fila && fila._dec !== undefined ? fila._dec : 2;
    let s;
    switch (f) {
      case 'texto': return v === null || v === undefined ? '' : String(v);
      case 'entero': s = Number.isFinite(v) ? String(Math.round(v)) : '—'; break;
      case 'escala': s = fijo(v, d); break;
      case 'dato': s = fijo(v, Math.max(0, d - 1)); break;           // un valor observado: con los decimales de los datos
      case 'escala2': s = fijo(v, Math.min(8, d + 1)); break;
      case 'pct': s = fijo(v, 1); break;
      case 'pct100': case 'pctp': s = fijo(v * 100, 1); break;
      case 'forma': s = fijo(v, 3); break;
      case 'forma2': s = fijo(v, 2); break;
      case 'num2': s = fijo(v, 2); break;
      case 'prop': s = fijo(v, 4); break;
      case 'pvalor': s = !Number.isFinite(v) ? '—' : v < 0.001 ? '< 0.001' : fijo(v, 3); break;
      case 'sig': s = signif(v, 4); break;
      case 'sigEnt': s = Number.isInteger(v) ? String(v) : signif(v, 4); break;   // cuadros de parámetros: los enteros (n, N, grupos) sin decimales
      case 'auto4': s = Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : fijo(v, 4)) : '—'; break;
      case 'num': s = Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : fijo(v, 2)) : '—'; break;
      default:
        if (INTERVALOS[f]) {
          /* un extremo faltante (un perfil que no llega por ese lado) se muestra como — y el otro sí */
          if (!Array.isArray(v) || !(Number.isFinite(v[0]) || (Number.isNaN(v[0]) && Number.isFinite(v[1])))) return '—';
          const lado = x => (Number.isNaN(x) ? (paraCopiar ? '' : '—') : texto(x, INTERVALOS[f], fila, paraCopiar));
          const a = lado(v[0]), b = lado(v[1]);
          return paraCopiar ? a + '\t' + b : a + ' – ' + b;
        }
        s = String(v);
    }
    return paraCopiar ? s.replace(/^—$/, '').replace(/^−∞$/, '-Inf').replace(/^∞$/, 'Inf') : s.replace(/^-/, MENOS);
  }
  const esIntervalo = f => !!INTERVALOS[f];

  function columnas(c, visibles) {
    const extra = (c.columnasExtra || []).filter(x => visibles && visibles.includes(x.clave));
    return c.columnas.concat(extra);
  }
  /** El cuadro como texto, celda por celda (para .docx, LaTeX y HTML). */
  function celdas(c, visibles) {
    const cols = columnas(c, visibles);
    return {
      cabecera: cols.map(k => k.titulo),
      filas: c.filas.map(f => cols.map(k => texto(f[k.clave], k.formato, f))),
      numericas: cols.map(k => k.formato !== 'texto'),
      totales: c.filas.map(f => !!f._total),
    };
  }
  /** El cuadro con sus números completos (para la hoja de cálculo): los intervalos van en dos columnas. */
  function valores(c, visibles) {
    const cols = columnas(c, visibles);
    const cabecera = cols.flatMap(k => (esIntervalo(k.formato) ? [k.titulo + ' (inf.)', k.titulo + ' (sup.)'] : [k.titulo]));
    const num = (v, f) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return Number.isFinite(v) ? (f === 'pct100' || f === 'pctp' ? v * 100 : v) : (Number.isNaN(v) ? null : (v > 0 ? 'Inf' : '-Inf'));
      return String(v);
    };
    const filas = c.filas.map(f => cols.flatMap(k => {
      const v = f[k.clave];
      if (esIntervalo(k.formato)) return Array.isArray(v) ? [num(v[0], INTERVALOS[k.formato]), num(v[1], INTERVALOS[k.formato])] : [null, null];
      if (k.formato === 'texto') return [v === null || v === undefined || v === '' ? null : String(v)];
      return [num(v, k.formato)];
    }));
    return { cabecera, filas };
  }

  SP.formatos = { fijo, signif, texto, columnas, celdas, valores, esIntervalo };
});

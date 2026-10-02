/* SigmaPro — cuadros de resultados al estilo de revista, a partir del reporte() de cada método.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un reporte es { titulo, conclusiones: [texto], cuadros: [cuadro] } y un cuadro es
     { id, titulo, columnas: [{ clave, titulo, formato }], columnasExtra?, filas: [{ … }], notas: [texto] }
   Formatos: texto · entero · escala (decimales de la fila, _dec) · dato (los de los datos: _dec − 1) · escala2 · pct (1 decimal) ·
   pct100 y pctp (proporción × 100) · intervalo, intervalo2 e intervalo100 ([a, b]) · forma (3) ·
   forma2 (2) · num · num2 · prop (4) · pvalor (< 0.001 o 3 decimales) · auto4 (entero o 4 decimales) ·
   sig (4 cifras significativas; coeficientes de cualquier escala) e intervaloSig.

     SP.cuadros.html(cuadro, { numero, visibles })   → HTML de la tabla con su título y notas
     SP.cuadros.tsv(cuadro, visibles)                → texto separado por tabuladores (para pegar en una hoja)
     SP.cuadros.formato(valor, formato, fila, paraCopiar) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
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
  function formato(v, f, fila, paraCopiar) {
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
      case 'auto4': s = Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : fijo(v, 4)) : '—'; break;
      case 'num': s = Number.isFinite(v) ? (Number.isInteger(v) ? String(v) : fijo(v, 2)) : '—'; break;
      case 'intervalo': case 'intervalo2': case 'intervalo100': case 'intervaloDato': case 'intervaloSig': {
        const g = { intervalo: 'escala', intervalo2: 'escala2', intervalo100: 'pct100', intervaloDato: 'dato', intervaloSig: 'sig' }[f];
        if (!Array.isArray(v) || !Number.isFinite(v[0])) return '—';
        const a = formato(v[0], g, fila, paraCopiar), b = formato(v[1], g, fila, paraCopiar);
        return paraCopiar ? a + '\t' + b : a + ' – ' + b;
      }
      default: s = String(v);
    }
    return paraCopiar ? s.replace(/^—$/, '').replace(/^−∞$/, '-Inf').replace(/^∞$/, 'Inf') : s.replace(/^-/, MENOS);
  }
  const esTexto = f => f === 'texto';

  function columnasVisibles(c, visibles) {
    const extra = (c.columnasExtra || []).filter(x => visibles && visibles.includes(x.clave));
    return c.columnas.concat(extra);
  }

  function html(c, op) {
    op = op || {};
    const cols = columnasVisibles(c, op.visibles);
    const cab = cols.map(k => `<th scope="col" class="${esTexto(k.formato) ? 'izq' : ''}">${esc(k.titulo)}</th>`).join('');
    /* las primeras columnas de texto (los grupos) se escriben una vez mientras no cambian, como en una revista;
       el valor repetido queda para los lectores de pantalla */
    let guia = 0;
    while (guia < cols.length - 1 && esTexto(cols[guia].formato)) guia++;
    const cuerpo = c.filas.map((f, i) => {
      const ant = i > 0 && !f._total ? c.filas[i - 1] : null;
      let igual = !!ant;
      return '<tr' + (f._total ? ' class="total"' : '') + '>' + cols.map((k, j) => {
        const v = formato(f[k.clave], k.formato, f);
        igual = igual && j < guia && ant[k.clave] === f[k.clave] && !ant._total;
        const contenido = igual && j < guia - 1 ? `<span class="sr-only">${esc(v)}</span>` : esc(v);
        const etiqueta = j === 0 && esTexto(k.formato);
        return etiqueta ? `<th scope="row" class="izq">${contenido}</th>` : `<td class="${esTexto(k.formato) ? 'izq' : ''}${k.formato.startsWith('intervalo') || k.formato === 'pvalor' ? ' nowrap' : ''}">${contenido}</td>`;
      }).join('') + '</tr>';
    }).join('');
    const numero = op.numero ? T('Cuadro {n}.', { n: op.numero }) + ' ' : '';
    return `<div class="tabla-wrap"><table class="revista sp-cuadro"><caption><b>${esc(numero)}</b>${esc(c.titulo)}</caption>` +
      `<thead><tr>${cab}</tr></thead><tbody>${cuerpo}</tbody></table></div>` +
      (c.notas && c.notas.length ? `<div class="pie-cuadro">${c.notas.map(n => `<p>${esc(n)}</p>`).join('')}</div>` : '');
  }

  function tsv(c, visibles) {
    const cols = columnasVisibles(c, visibles);
    const cab = cols.flatMap(k => (k.formato.startsWith('intervalo') ? [k.titulo + ' (inf.)', k.titulo + ' (sup.)'] : [k.titulo]));
    const filas = c.filas.map(f => cols.map(k => formato(f[k.clave], k.formato, f, true)).join('\t'));
    return [c.titulo, cab.join('\t'), ...filas, ...(c.notas || [])].join('\n');
  }

  /** Copia texto al portapapeles (con respaldo para file:// en navegadores que no dan el permiso). */
  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; } catch (e) {
      const a = document.createElement('textarea');
      a.value = texto; a.setAttribute('readonly', ''); a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      a.remove();
      return ok;
    }
  }

  SP.cuadros = { html, tsv, formato, copiar, columnasVisibles };
})();

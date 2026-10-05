/* SigmaPro — cuadros de resultados al estilo de revista, a partir del reporte() de cada método.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un reporte es { titulo, conclusiones: [texto], cuadros: [cuadro] }; el cuadro y sus formatos se describen en
   js/nucleo/formatos.js.

     SP.cuadros.html(cuadro, { numero, visibles })   → HTML de la tabla con su título y notas
     SP.cuadros.tsv(cuadro, visibles)                → texto separado por tabuladores (para pegar en una hoja)
     SP.cuadros.csv(cuadro, visibles)                → CSV (RFC 4180) con los valores sin redondear, para otro programa
     SP.cuadros.bajarCSV(cuadro, visibles)           → lo baja como archivo .csv (UTF-8 con BOM, para que Excel lea los acentos)
     SP.cuadros.formato(valor, formato, fila, paraCopiar) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;

  /* el formato de cada celda vive en js/nucleo/formatos.js: el mismo en pantalla y en las exportaciones */
  const formato = (v, f, fila, paraCopiar) => SP.formatos.texto(v, f, fila, paraCopiar);
  const esTexto = f => f === 'texto';

  const columnasVisibles = (c, visibles) => SP.formatos.columnas(c, visibles);

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

  /**
   * CSV del cuadro: una fila de títulos y una por fila del cuadro, con los números completos (sin el redondeo de la
   * pantalla: sirven para volver a calcular), los intervalos en dos columnas (inf. y sup.), coma como separador y punto
   * decimal. Un faltante queda vacío.
   */
  function csv(c, visibles) {
    const cols = columnasVisibles(c, visibles);
    const campo = v => {
      if (v === null || v === undefined || (typeof v === 'number' && !Number.isFinite(v) && !(v === Infinity || v === -Infinity))) return '';
      const s = typeof v === 'number' ? (v === Infinity ? 'Inf' : v === -Infinity ? '-Inf' : String(v)) : String(v);
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const cab = cols.flatMap(k => (k.formato.startsWith('intervalo') ? [k.titulo + ' (' + T('inf.') + ')', k.titulo + ' (' + T('sup.') + ')'] : [k.titulo]));
    const filas = c.filas.map(f => cols.flatMap(k => {
      const v = f[k.clave];
      if (k.formato.startsWith('intervalo')) return Array.isArray(v) ? [campo(v[0]), campo(v[1])] : ['', ''];
      return [k.formato === 'texto' || typeof v !== 'number' ? campo(v === undefined ? '' : formato(v, k.formato, f, true)) : campo(v)];
    }).join(','));
    return [cab.map(campo).join(','), ...filas].join('\r\n') + '\r\n';
  }
  /** Nombre de archivo a partir del título del cuadro. */
  const nombreArchivo = t => (String(t || T('cuadro')).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).toLowerCase() || 'cuadro') + '.csv';
  /** Baja el cuadro como archivo .csv. */
  function bajarCSV(c, visibles) {
    const b = new Blob(['\ufeff' + csv(c, visibles)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = nombreArchivo(c.titulo);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return a.download;
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

  SP.cuadros = { html, tsv, csv, bajarCSV, nombreArchivo, formato, copiar, columnasVisibles };
})();

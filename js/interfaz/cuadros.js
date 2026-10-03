/* SigmaPro — cuadros de resultados al estilo de revista, a partir del reporte() de cada método.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un reporte es { titulo, conclusiones: [texto], cuadros: [cuadro] }; el cuadro y sus formatos se describen en
   js/nucleo/formatos.js.

     SP.cuadros.html(cuadro, { numero, visibles })   → HTML de la tabla con su título y notas
     SP.cuadros.tsv(cuadro, visibles)                → texto separado por tabuladores (para pegar en una hoja)
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

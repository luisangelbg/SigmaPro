/* SigmaPro — rejilla tipo hoja de cálculo (virtualizada).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Dibuja una SP.hoja: solo las filas visibles más un margen, así 100 000 filas se mueven
   igual que 100. Teclado como en una hoja de cálculo:

     flechas, Inicio/Fin, Ctrl+Inicio/Fin, RePág/AvPág   moverse (con Mayús, seleccionar)
     Intro o F2, o empezar a escribir                     editar la celda (Intro guarda, Esc cancela)
     Tab / Mayús+Tab                                      celda siguiente / anterior
     Supr o Retroceso                                     vaciar las celdas seleccionadas
     Ctrl+C / Ctrl+V                                      copiar / pegar (texto separado por tabuladores)
     Ctrl+Z / Ctrl+Y                                      deshacer / rehacer
     Ctrl+A                                               seleccionar todo

   Accesible: role=grid con aria-rowcount/colcount, aria-activedescendant en la celda activa
   y anuncios de lo que se edita o pega.

     const r = SP.rejilla.crear(contenedor, { alCambiar, alMenuColumna, alPegarNuevo, alSeleccionar })
     r.fijarHoja(hoja) · r.refrescar() · r.irA(i, j) · r.seleccion() */
(function () {
  'use strict';
  const T = SP.T;
  const ALTO = 30, ANCHO_NUM = 58, MARGEN = 12;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const L = () => window.LABG;
  let secuencia = 0;

  function crear(host, op) {
    op = op || {};
    const id = 'rej' + (++secuencia);
    host.innerHTML =
      `<div class="rej" role="grid" tabindex="0" aria-multiselectable="true" aria-label="${esc(T('Hoja de datos'))}" id="${id}">` +
      `<div class="rej-scroll"><div class="rej-cab" role="rowgroup"></div><div class="rej-espacio" role="rowgroup"><div class="rej-ventana"></div></div>` +
      `<input class="rej-editor" type="text" hidden aria-label="${esc(T('Editar celda'))}" autocomplete="off" spellcheck="false"></div>` +
      `<p class="rej-vacia" hidden></p></div>`;
    const raiz = host.querySelector('.rej'), scroll = raiz.querySelector('.rej-scroll');
    const cab = raiz.querySelector('.rej-cab'), espacio = raiz.querySelector('.rej-espacio'), ventana = raiz.querySelector('.rej-ventana');
    const editor = raiz.querySelector('.rej-editor'), vacia = raiz.querySelector('.rej-vacia');

    let hoja = null, anchos = [], plantilla = '';
    let act = { i: 0, j: 0 }, ancla = { i: 0, j: 0 }, editando = false, arrastrando = false;
    let pendiente = false;

    /* ---------------- geometría ---------------- */
    function medir() {
      anchos = hoja.cols.map((c, j) => {
        let m = Math.max(c.nombre.length + 2, 8);
        const muestra = Math.min(hoja.n, 300);
        for (let i = 0; i < muestra; i++) m = Math.max(m, hoja.texto(i, j).length);
        return Math.max(84, Math.min(240, m * 8 + 26));
      });
      plantilla = ANCHO_NUM + 'px ' + anchos.map(a => a + 'px').join(' ');
      raiz.style.setProperty('--rej-columnas', plantilla);
      raiz.style.setProperty('--rej-ancho', (ANCHO_NUM + anchos.reduce((s, a) => s + a, 0)) + 'px');
    }
    const izquierda = j => ANCHO_NUM + anchos.slice(0, j).reduce((s, a) => s + a, 0);

    /* ---------------- dibujo ---------------- */
    function rango() {
      return { i0: Math.min(act.i, ancla.i), i1: Math.max(act.i, ancla.i), j0: Math.min(act.j, ancla.j), j1: Math.max(act.j, ancla.j) };
    }
    const celdaId = (i, j) => id + '-' + i + '-' + j;
    const ETIQ_TIPO = { numerica: 'núm.', factor: 'factor', fecha: 'fecha', texto: 'texto', id: 'id' };

    function dibujarCabecera() {
      const r = rango();
      cab.innerHTML = `<div class="rej-fila rej-encabezado" role="row" aria-rowindex="1"><div class="rej-esquina" role="columnheader" aria-colindex="1">#</div>` +
        hoja.cols.map((c, j) => {
          const sel = j >= r.j0 && j <= r.j1;
          const extra = c.tipo === 'factor' ? ' · ' + c.niveles.length : '';
          const marca = c.origen === 'calculada' ? ' ƒ' : c.origen === 'transformada' ? ' ↻' : '';
          return `<div class="rej-col${sel ? ' sel' : ''}" role="columnheader" aria-colindex="${j + 2}" data-j="${j}" title="${esc(c.detalle || c.razon || '')}">` +
            `<span class="nom">${esc(c.nombre)}${marca}</span><span class="tipo t-${c.tipo}">${esc(T(ETIQ_TIPO[c.tipo]) + extra)}</span>` +
            `<button type="button" class="rej-menu" data-menu="${j}" aria-label="${esc(T('Opciones de la columna {c}', { c: c.nombre }))}" tabindex="-1">⋮</button></div>`;
        }).join('') + '</div>';
    }
    function dibujarFilas() {
      pendiente = false;
      if (!hoja) return;
      const alto = scroll.clientHeight || 400;
      const arriba = Math.max(0, scroll.scrollTop - cab.offsetHeight);
      const i0 = Math.max(0, Math.floor(arriba / ALTO) - MARGEN);
      const i1 = Math.min(hoja.n - 1, Math.ceil((arriba + alto) / ALTO) + MARGEN);
      const r = rango(), filtro = op.filasVisibles ? op.filasVisibles() : null;
      let h = '';
      for (let i = i0; i <= i1; i++) {
        const fueraFiltro = filtro && !filtro.has(i);
        h += `<div class="rej-fila${fueraFiltro ? ' filtrada' : ''}" role="row" aria-rowindex="${i + 2}"><div class="rej-num" role="rowheader">${i + 1}</div>`;
        for (let j = 0; j < hoja.p; j++) {
          const c = hoja.cols[j];
          const sel = i >= r.i0 && i <= r.i1 && j >= r.j0 && j <= r.j1;
          const activa = i === act.i && j === act.j;
          const num = c.tipo === 'numerica' || c.tipo === 'fecha';
          h += `<div class="rej-celda${num ? ' num' : ''}${sel ? ' sel' : ''}${activa ? ' act' : ''}" role="gridcell" id="${celdaId(i, j)}" aria-colindex="${j + 2}"` +
            `${sel ? ' aria-selected="true"' : ''} data-i="${i}" data-j="${j}">${esc(hoja.texto(i, j))}</div>`;
        }
        h += '</div>';
      }
      ventana.style.transform = `translateY(${i0 * ALTO}px)`;
      ventana.innerHTML = h;
      raiz.setAttribute('aria-activedescendant', celdaId(act.i, act.j));
    }
    const programar = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(dibujarFilas); } };
    function refrescar(remedir) {
      if (!hoja) return;
      vacia.hidden = hoja.p > 0;
      if (remedir || anchos.length !== hoja.p) medir();
      act.i = Math.min(act.i, Math.max(0, hoja.n - 1)); act.j = Math.min(act.j, Math.max(0, hoja.p - 1));
      ancla.i = Math.min(ancla.i, Math.max(0, hoja.n - 1)); ancla.j = Math.min(ancla.j, Math.max(0, hoja.p - 1));
      espacio.style.height = (hoja.n * ALTO) + 'px';
      raiz.setAttribute('aria-rowcount', String(hoja.n + 1));
      raiz.setAttribute('aria-colcount', String(hoja.p + 1));
      dibujarCabecera();
      dibujarFilas();
    }

    function verCelda(i, j) {
      const top = i * ALTO, h = scroll.clientHeight - cab.offsetHeight;
      if (top < scroll.scrollTop) scroll.scrollTop = top;
      else if (top + ALTO > scroll.scrollTop + h) scroll.scrollTop = top + ALTO - h;
      const x = izquierda(j), w = anchos[j] || 0;
      if (x - ANCHO_NUM < scroll.scrollLeft) scroll.scrollLeft = x - ANCHO_NUM;
      else if (x + w > scroll.scrollLeft + scroll.clientWidth) scroll.scrollLeft = x + w - scroll.clientWidth;
    }
    function irA(i, j, extender) {
      if (!hoja || !hoja.p) return;
      act = { i: Math.max(0, Math.min(hoja.n - 1, i)), j: Math.max(0, Math.min(hoja.p - 1, j)) };
      if (!extender) ancla = { i: act.i, j: act.j };
      verCelda(act.i, act.j);
      dibujarCabecera(); dibujarFilas();
      if (op.alSeleccionar) op.alSeleccionar(act, rango());
    }

    /* ---------------- edición ---------------- */
    function abrirEditor(inicial) {
      if (!hoja || !hoja.p || !hoja.n) return;
      editando = true;
      verCelda(act.i, act.j);
      editor.hidden = false;
      editor.style.top = (cab.offsetHeight + act.i * ALTO) + 'px';
      editor.style.left = izquierda(act.j) + 'px';
      editor.style.width = anchos[act.j] + 'px';
      editor.value = inicial !== undefined ? inicial : hoja.texto(act.i, act.j);
      editor.focus();
      if (inicial === undefined) editor.select();
    }
    function cerrarEditor(guardar, mover) {
      if (!editando) return;
      if (guardar) {
        try {
          const antes = hoja.texto(act.i, act.j);
          if (editor.value !== antes) {
            hoja.editar(act.i, act.j, editor.value);
            avisarCambio(T('Celda {c}, fila {f}: {v}', { c: hoja.cols[act.j].nombre, f: act.i + 1, v: editor.value || T('vacía') }));
          }
        } catch (e) {
          if (L()) L().toast(e.message + (e.arreglo ? ' ' + e.arreglo : ''), { type: 'error' });
          editor.focus();
          return;
        }
      }
      editando = false;
      editor.hidden = true;
      raiz.focus();
      if (mover) irA(act.i + mover[0], act.j + mover[1]); else refrescar();
    }
    function avisarCambio(texto) {
      refrescar(false);
      if (texto && L()) L().announce(texto);
      if (op.alCambiar) op.alCambiar();
    }

    /* ---------------- portapapeles ---------------- */
    function textoSeleccion() {
      const r = rango(), filas = [];
      for (let i = r.i0; i <= r.i1; i++) {
        const f = [];
        for (let j = r.j0; j <= r.j1; j++) f.push(hoja.texto(i, j));
        filas.push(f.join('\t'));
      }
      return filas.join('\n');
    }
    function pegarTexto(texto) {
      const matriz = SP.csv.analizar(texto.replace(/\r?\n$/, ''), { delimitador: '\t', comillas: '"' });
      if (!matriz.length) return;
      if (!hoja || !hoja.p) { if (op.alPegarNuevo) op.alPegarNuevo(texto); return; }
      try {
        const r = hoja.pegar(act.i, act.j, matriz);
        ancla = { i: act.i, j: act.j };
        act = { i: act.i + matriz.length - 1, j: act.j + Math.max(...matriz.map(f => f.length)) - 1 };
        const msg = T('Pegadas {n} celdas', { n: r.celdas }) + (r.rechazadas ? ' · ' + T('{k} no eran del tipo de su columna y se dejaron como estaban', { k: r.rechazadas }) : '');
        if (L()) L().toast(msg, { type: r.rechazadas ? 'warning' : 'success' });
        avisarCambio(msg);
      } catch (e) {
        if (L()) L().toast(e.message + (e.arreglo ? ' ' + e.arreglo : ''), { type: 'error' });
      }
    }

    /* ---------------- eventos ---------------- */
    scroll.addEventListener('scroll', programar, { passive: true });
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(programar).observe(scroll);

    raiz.addEventListener('mousedown', e => {
      const m = e.target.closest('[data-menu]');
      if (m) { e.preventDefault(); if (op.alMenuColumna) op.alMenuColumna(+m.dataset.menu, m); return; }
      const col = e.target.closest('.rej-col');
      if (col) { e.preventDefault(); const j = +col.dataset.j; ancla = { i: 0, j: e.shiftKey ? ancla.j : j }; act = { i: hoja.n - 1, j }; raiz.focus(); dibujarCabecera(); dibujarFilas(); if (op.alSeleccionar) op.alSeleccionar(act, rango()); return; }
      const c = e.target.closest('.rej-celda');
      if (!c || e.target === editor) return;
      if (editando) cerrarEditor(true);
      e.preventDefault();
      raiz.focus();
      irA(+c.dataset.i, +c.dataset.j, e.shiftKey);
      arrastrando = true;
    });
    raiz.addEventListener('mouseover', e => {
      if (!arrastrando) return;
      const c = e.target.closest('.rej-celda');
      if (c) irA(+c.dataset.i, +c.dataset.j, true);
    });
    window.addEventListener('mouseup', () => { arrastrando = false; });
    raiz.addEventListener('dblclick', e => { if (e.target.closest('.rej-celda')) abrirEditor(); });

    editor.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); cerrarEditor(true, [e.shiftKey ? -1 : 1, 0]); }
      else if (e.key === 'Tab') { e.preventDefault(); cerrarEditor(true, [0, e.shiftKey ? -1 : 1]); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrarEditor(false); }
      else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.shiftKey) { e.preventDefault(); cerrarEditor(true, [e.key === 'ArrowUp' ? -1 : 1, 0]); }
    });
    editor.addEventListener('blur', () => { if (editando) cerrarEditor(true); });

    raiz.addEventListener('keydown', e => {
      if (editando || e.target === editor || !hoja) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const paso = Math.max(1, Math.floor((scroll.clientHeight - cab.offsetHeight) / ALTO) - 1);
      const mov = {
        ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], PageUp: [-paso, 0], PageDown: [paso, 0],
      }[e.key];
      if (mov && !e.altKey) {
        e.preventDefault();
        if (ctrl) irA(mov[0] < 0 ? 0 : mov[0] > 0 ? hoja.n - 1 : act.i, mov[1] < 0 ? 0 : mov[1] > 0 ? hoja.p - 1 : act.j, e.shiftKey);
        else irA(act.i + mov[0], act.j + mov[1], e.shiftKey);
        return;
      }
      if (e.key === 'Home') { e.preventDefault(); irA(ctrl ? 0 : act.i, 0, e.shiftKey); return; }
      if (e.key === 'End') { e.preventDefault(); irA(ctrl ? hoja.n - 1 : act.i, hoja.p - 1, e.shiftKey); return; }
      if (e.key === 'Tab') { e.preventDefault(); irA(act.i, act.j + (e.shiftKey ? -1 : 1)); return; }
      if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); abrirEditor(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const r = rango();
        hoja.borrar(r.i0, r.j0, r.i1, r.j1);
        avisarCambio(T('Celdas vaciadas'));
        return;
      }
      if (ctrl && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) { e.preventDefault(); const d = hoja.deshacer(); if (d) { if (L()) L().toast(T('Deshecho: {d}', { d }), {}); avisarCambio(T('Deshecho: {d}', { d })); } return; }
      if (ctrl && (e.key === 'y' || e.key === 'Y' || ((e.key === 'z' || e.key === 'Z') && e.shiftKey))) { e.preventDefault(); const d = hoja.rehacer(); if (d) { if (L()) L().toast(T('Rehecho: {d}', { d }), {}); avisarCambio(T('Rehecho: {d}', { d })); } return; }
      if (ctrl && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); ancla = { i: 0, j: 0 }; act = { i: hoja.n - 1, j: hoja.p - 1 }; dibujarCabecera(); dibujarFilas(); return; }
      if (!ctrl && !e.altKey && e.key.length === 1 && hoja.p && hoja.n) { e.preventDefault(); abrirEditor(e.key); }
    });
    raiz.addEventListener('copy', e => {
      if (editando || !hoja || !hoja.p) return;
      e.preventDefault();
      e.clipboardData.setData('text/plain', textoSeleccion());
      if (L()) L().announce(T('Copiadas las celdas seleccionadas'));
    });
    raiz.addEventListener('paste', e => {
      if (editando) return;
      const t = e.clipboardData && e.clipboardData.getData('text/plain');
      if (!t) return;
      e.preventDefault();
      pegarTexto(t);
    });

    return {
      fijarHoja(h) { hoja = h; act = { i: 0, j: 0 }; ancla = { i: 0, j: 0 }; scroll.scrollTop = 0; scroll.scrollLeft = 0; refrescar(true); },
      refrescar,
      irA,
      seleccion: () => Object.assign({ activa: Object.assign({}, act) }, rango()),
      pegarTexto,
      textoSeleccion,
      enfocar: () => raiz.focus(),
      mensajeVacia(texto) { vacia.textContent = texto; },
      raiz,
    };
  }

  SP.rejilla = { crear };
})();

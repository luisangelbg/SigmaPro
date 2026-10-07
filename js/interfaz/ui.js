/* SigmaPro — piezas de interfaz comunes: ventanas de diálogo, menús y formato.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.ui.dialogo({ titulo, cuerpo, botones: [{ texto, tipo: 'primario'|'secundario', accion(d) → false para no cerrar }],
                    alAbrir(d), ancho }) → { el, cuerpo, cerrar() }
     SP.ui.menu(boton, [{ texto, accion, marcado, separador, deshabilitado }])
     SP.ui.esc(texto) · SP.ui.num(x, decimales) */
(function () {
  'use strict';
  const T = SP.T;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let seq = 0;

  function dialogo(op) {
    const d = document.createElement('dialog');
    const id = 'dlg' + (++seq);
    d.className = 'labg-dialog sp-dialogo';
    if (op.ancho) d.style.width = op.ancho;
    d.setAttribute('aria-labelledby', id + 't');
    d.innerHTML =
      `<div class="dialog-head"><h2 id="${id}t">${esc(op.titulo)}</h2>` +
      `<button type="button" class="icon-btn" data-cerrar aria-label="${esc(T('Cerrar'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>` +
      `<div class="dialog-body">${op.cuerpo || ''}</div>` +
      `<div class="sp-dialogo-pie"><p class="sp-dialogo-error msg msg-error" role="alert" hidden></p><div class="btn-row"></div></div>`;
    document.body.appendChild(d);
    const fila = d.querySelector('.sp-dialogo-pie .btn-row');
    const api = {
      el: d,
      cuerpo: d.querySelector('.dialog-body'),
      cerrar() { if (d.open) d.close(); },
      error(texto) {
        const e = d.querySelector('.sp-dialogo-error');
        e.hidden = !texto; e.textContent = texto || '';
      },
      boton: k => fila.children[k],
    };
    (op.botones || [{ texto: T('Cerrar'), tipo: 'secundario' }]).forEach(b => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'btn ' + (b.tipo === 'primario' ? 'btn-primary' : b.tipo === 'peligro' ? 'btn-danger' : 'btn-secondary');
      el.textContent = b.texto;
      el.addEventListener('click', async () => {
        api.error('');
        try {
          const r = b.accion ? await b.accion(api) : undefined;
          if (r !== false) api.cerrar();
        } catch (e) {
          api.error(e.message + (e.arreglo ? ' ' + e.arreglo : ''));
        }
      });
      fila.appendChild(el);
    });
    d.querySelector('[data-cerrar]').addEventListener('click', () => api.cerrar());
    d.addEventListener('click', e => { if (e.target === d) api.cerrar(); });
    d.addEventListener('close', () => { d.remove(); if (op.alCerrar) op.alCerrar(); });
    d.showModal();
    if (op.alAbrir) op.alAbrir(api);
    const primero = d.querySelector('.dialog-body input, .dialog-body select, .dialog-body textarea, .dialog-body button');
    if (primero) primero.focus();
    return api;
  }

  /** Menú desplegable junto a un botón; se maneja con flechas, Intro y Esc. */
  function menu(boton, items, op) {
    op = op || {};
    document.querySelectorAll('.sp-menu').forEach(m => m.remove());
    const m = document.createElement('div');
    m.className = 'sp-menu';
    m.setAttribute('role', 'menu');
    if (op.etiqueta) m.setAttribute('aria-label', op.etiqueta);
    items.forEach(it => {
      if (it.separador) { const s = document.createElement('div'); s.className = 'sp-menu-sep'; s.setAttribute('role', 'separator'); m.appendChild(s); return; }
      if (it.titulo) { const s = document.createElement('div'); s.className = 'sp-menu-titulo'; s.textContent = it.titulo; m.appendChild(s); return; }
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', it.marcado !== undefined ? 'menuitemradio' : 'menuitem');
      if (it.marcado !== undefined) b.setAttribute('aria-checked', String(!!it.marcado));
      b.className = 'sp-menu-item';
      b.innerHTML = (it.marcado ? '<span class="marca" aria-hidden="true">✓</span>' : '<span class="marca" aria-hidden="true"></span>') +
        '<span>' + esc(it.texto) + '</span>' + (it.descripcion ? '<small>' + esc(it.descripcion) + '</small>' : '');
      if (it.deshabilitado) b.disabled = true;
      b.addEventListener('click', () => { cerrar(); it.accion && it.accion(); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    /* abajo del botón si cabe; si no, arriba; si no cabe en ninguno, del lado con más espacio y con barra */
    const r = boton.getBoundingClientRect();
    const ancho = m.offsetWidth;
    const abajo = window.innerHeight - r.bottom - 12, arriba = r.top - 12;
    let alto = m.offsetHeight;
    const haciaAbajo = alto <= abajo || (alto > arriba && abajo >= arriba);
    if (alto > (haciaAbajo ? abajo : arriba)) { alto = Math.max(120, haciaAbajo ? abajo : arriba); m.style.maxHeight = alto + 'px'; }
    m.style.left = Math.max(8, Math.min(window.innerWidth - ancho - 8, r.left + window.scrollX)) + 'px';
    m.style.top = (haciaAbajo ? r.bottom + window.scrollY + 4 : r.top + window.scrollY - alto - 4) + 'px';
    const botones = () => [...m.querySelectorAll('.sp-menu-item:not(:disabled)')];
    const primero = botones()[0];
    if (primero) primero.focus();
    function cerrar() { m.remove(); document.removeEventListener('mousedown', fuera, true); boton.focus(); }
    function fuera(e) { if (!m.contains(e.target) && e.target !== boton) { m.remove(); document.removeEventListener('mousedown', fuera, true); } }
    document.addEventListener('mousedown', fuera, true);
    m.addEventListener('keydown', e => {
      const bs = botones(), k = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); bs[(k + 1) % bs.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); bs[(k - 1 + bs.length) % bs.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); bs[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); bs[bs.length - 1].focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); cerrar(); }
    });
    return m;
  }

  /** Número para mostrar: decimales fijos o 4 cifras significativas. */
  function num(x, dec) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
    if (dec !== undefined) return x.toFixed(dec);
    const a = Math.abs(x);
    if (a !== 0 && (a < 1e-3 || a >= 1e6)) return x.toExponential(3);
    return String(Number(x.toPrecision(4)));
  }

  /** Carga un guion de la app una sola vez y avisa cuando está listo (una promesa por archivo). */
  const cargados = new Map();
  function cargarScript(src) {
    if (!cargados.has(src)) cargados.set(src, new Promise((ok, mal) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => ok();
      s.onerror = () => { cargados.delete(src); s.remove(); mal(new Error(T('No se pudo cargar {f}.', { f: src }))); };
      document.head.appendChild(s);
    }));
    return cargados.get(src);
  }
  /* el ícono de una luz del semáforo (hito 5.3): palomita, exclamación, cruz o raya; el estado se lee también en palabras */
  const LUZ = {
    verde: '<path d="M3.6 8.4l2.9 2.9 5.9-6.6" fill="none"/>',
    ambar: '<path d="M8 3.4v5.6" fill="none"/><circle cx="8" cy="12.3" r="1.25" stroke="none"/>',
    rojo: '<path d="M4.6 4.6l6.8 6.8M11.4 4.6l-6.8 6.8" fill="none"/>',
    gris: '<path d="M4.6 8h6.8" fill="none"/>',
  };
  const luz = color => `<span class="luz" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false">${LUZ[color] || LUZ.gris}</svg></span>`;
  SP.ui = { dialogo, menu, esc, num, cargarScript, luz };
})();

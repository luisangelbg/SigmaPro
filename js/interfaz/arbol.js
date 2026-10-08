/* SigmaPro — el árbol de decisiones en la pantalla (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Dibuja SP.arbol (js/nucleo/arbol.js) como columnas: la primera pregunta, y a la derecha la que sigue de la opción
   elegida, hasta la hoja con sus análisis. Las líneas que unen cada opción elegida con la pregunta siguiente se dibujan
   en un SVG detrás de las columnas (el camino, en oro). Cada análisis de la hoja trae su ficha, «Abrir este análisis»
   y, si su ficha de Fundamentos tiene ejemplo, «Probar con el ejemplo». En una pantalla angosta las columnas van una
   bajo otra. El camino se recuerda mientras la pestaña esté abierta (sessionStorage «sigmapro.arbol»).
   Vive en Fundamentos (vista «Árbol de decisiones»); el asistente de Análisis y el tercer camino de Inicio llevan a él.

     SP.arbolUI.html()                 el árbol con el camino actual
     SP.arbolUI.conectar(raiz)         ajusta las líneas (después de pintar o al cambiar el tamaño)
     SP.arbolUI.camino(c) / .ir(metodo)
                                       pone un camino; o el primero que llega a un método (y lo señala) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const L = () => window.LABG;
  const CLAVE = 'sigmapro.arbol';
  const est = { camino: [], marcado: null };
  try { const v = JSON.parse(sessionStorage.getItem(CLAVE) || '[]'); if (Array.isArray(v)) est.camino = v; } catch (e) { /* nada */ }
  const guardar = () => { try { sessionStorage.setItem(CLAVE, JSON.stringify(est.camino)); } catch (e) { /* nada */ } };
  const lengua = () => (SP.IDIOMA === 'en' ? 'en' : 'es');
  const paraQue = id => { const x = (window.SP_FUNDAMENTOS_INDICE || {})[id]; return x && x[lengua()] ? x[lengua()].paraQue || '' : ''; };
  const conEjemplo = id => { const x = (window.SP_FUNDAMENTOS_INDICE || {})[id]; return !!(x && x.ejemplo); };

  /* ---------------- el árbol ---------------- */
  function columna(n, k) {
    const elegido = est.camino[k];
    return `<section class="arb-col" data-arb-col="${k}" aria-labelledby="arbQ${k}">` +
      `<h3 class="arb-q" id="arbQ${k}" tabindex="-1">${esc(n.pregunta)}</h3>${n.ayuda ? `<p class="arb-ayuda">${esc(n.ayuda)}</p>` : ''}` +
      `<ul class="arb-ops">${n.opciones.map(o => `<li><button type="button" class="arb-op${o.hoja ? ' arb-op-hoja' : ''}" data-arb-k="${k}" data-arb-op="${esc(o.id)}" aria-pressed="${o.id === elegido}">` +
        `<span class="arb-op-t">${esc(o.texto)}</span>${o.detalle ? `<span class="arb-op-d">${esc(o.detalle)}</span>` : ''}</button></li>`).join('')}</ul></section>`;
  }
  function hoja(o, k) {
    const tarjetas = o.hoja.filter(([m]) => SP.metodos[m]).map(([m, cuando]) => {
      const f = SP.metodos[m], pq = paraQue(m);
      return `<li class="arb-met${est.marcado === m ? ' arb-marca' : ''}" data-arb-met="${esc(m)}">` +
        `<p class="arb-met-n">${esc(f.nombre)}${f.motor === 'r' ? ` <span class="pill gris">${esc(T('motor R'))}</span>` : ''}</p>` +
        (cuando ? `<p class="arb-met-c">${esc(cuando)}</p>` : '') + (pq ? `<p class="arb-met-p">${esc(pq)}</p>` : '') +
        `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" data-ficha="${esc(m)}">${esc(T('Ficha'))}</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-arb-abrir="${esc(m)}">${esc(T('Abrir este análisis'))}</button>` +
        (conEjemplo(m) ? `<button type="button" class="btn btn-ghost btn-sm" data-arb-ejemplo="${esc(m)}">${esc(T('Probar con el ejemplo'))}</button>` : '') + '</div></li>';
    }).join('');
    return `<section class="arb-col arb-hoja" data-arb-col="${k}" aria-labelledby="arbQ${k}"><h3 class="arb-q" id="arbQ${k}" tabindex="-1">${esc(o.hoja.length > 1 ? T('Los análisis para «{o}»', { o: o.texto }) : T('El análisis para «{o}»', { o: o.texto }))}</h3>` +
      `<ul class="arb-mets">${tarjetas}</ul></section>`;
  }
  function html() {
    const cols = [], migas = [];
    let n = SP.arbol.raiz(), k = 0;
    while (n && n.opciones) {
      cols.push(columna(n, k));
      const o = n.opciones.find(x => x.id === est.camino[k]);
      if (!o) { est.camino = est.camino.slice(0, k); break; }
      migas.push(o.texto);
      if (o.hoja) { cols.push(hoja(o, k + 1)); est.camino = est.camino.slice(0, k + 1); break; }
      n = o.sig; k++;
    }
    return `<div class="arb" data-arbol>` +
      `<div class="arb-barra"><p class="arb-migas"><b>${esc(T('Tu camino:'))}</b> ${migas.length ? migas.map(esc).join(' <span aria-hidden="true">›</span> ') : esc(T('elige una respuesta en la primera columna'))}</p>` +
      (migas.length ? `<button type="button" class="btn btn-ghost btn-sm" data-arb-reiniciar>${esc(T('Empezar de nuevo'))}</button>` : '') + '</div>' +
      `<p class="sr-only" role="status" data-arb-anuncio></p>` +
      `<div class="arb-cols"><svg class="arb-lineas" aria-hidden="true" focusable="false"></svg>${cols.join('')}</div></div>`;
  }

  /* las líneas: de cada opción elegida a la pregunta que sigue */
  function conectar(raiz) {
    const caja = raiz && raiz.querySelector('.arb-cols'), svg = caja && caja.querySelector('.arb-lineas');
    if (!svg) return;
    /* la barra común y el ancho de la ventana cambian el de las columnas después de pintar: las líneas se vuelven a
       trazar cada vez que cambia el tamaño del árbol */
    if (window.ResizeObserver && !caja._observador) {
      caja._observador = new ResizeObserver(() => { if (caja.isConnected) conectar(raiz); else caja._observador.disconnect(); });
      caja._observador.observe(caja);
    }
    const W = caja.scrollWidth, H = caja.scrollHeight;
    /* sin viewBox: una unidad es un píxel del contenido (el CSS común limita el ancho de los svg; aquí no) */
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.width = W + 'px'; svg.style.height = H + 'px';
    const base = caja.getBoundingClientRect(), dx = caja.scrollLeft - base.left, dy = caja.scrollTop - base.top;
    const vertical = getComputedStyle(caja).flexDirection === 'column';
    let d = '';
    caja.querySelectorAll('.arb-op[aria-pressed="true"]').forEach(b => {
      const k = Number(b.dataset.arbK), sig = caja.querySelector(`[data-arb-col="${k + 1}"] .arb-q`);
      if (!sig) return;
      const a = b.getBoundingClientRect(), q = sig.getBoundingClientRect();
      if (vertical) return;
      const x1 = a.right + dx, y1 = a.top + a.height / 2 + dy, x2 = q.left + dx - 4, y2 = q.top + q.height / 2 + dy, m = (x1 + x2) / 2;
      d += `M${x1.toFixed(1)} ${y1.toFixed(1)} C${m.toFixed(1)} ${y1.toFixed(1)} ${m.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
    });
    svg.innerHTML = d ? `<path d="${d}" class="arb-linea"/>` : '';
  }

  /* ---------------- acciones ---------------- */
  function pintarEn(raiz, enfocar) {
    const r = raiz.querySelector('[data-arbol]');
    if (!r) return;
    r.outerHTML = html();
    const nuevo = raiz.querySelector('[data-arbol]');
    requestAnimationFrame(() => conectar(nuevo));
    if (enfocar !== undefined) {
      const q = nuevo.querySelector(`[data-arb-col="${enfocar}"] .arb-q`);
      if (q) { q.focus({ preventScroll: true }); q.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      const a = nuevo.querySelector('[data-arb-anuncio]'); if (a && q) a.textContent = q.textContent;
    }
  }
  function camino(c) { est.camino = (c || []).slice(); est.marcado = null; guardar(); }
  /** El primer camino que llega al método, con el método señalado. */
  function ir(metodo) {
    const cs = SP.arbol.caminos(metodo);
    if (!cs.length) return false;
    est.camino = cs[0]; est.marcado = metodo; guardar();
    return true;
  }
  async function abrirAnalisis(m, conEj) {
    const F = SP.app.fundamentos;
    if (!F) return;
    const f = SP.metodos[m];
    /* el tamaño de muestra y la potencia no piden datos */
    if (f && f.familia === 'potencia' && !(SP.app.datos && SP.app.datos.hoja) && !conEj) SP.app.analisis.sinDatos = true;
    if (conEj) { try { await F.cargar(m); } catch (e) { L() && L().toast(e.message, { type: 'warning' }); return; } }
    F.abrirMetodo(m, !!conEj);
  }
  function iniciar() {
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('[data-arbol-metodo]');
      if (a && SP.app.fundamentos) { e.preventDefault(); SP.app.fundamentos.arbolEn(a.dataset.arbolMetodo || null); return; }
      const t = e.target.closest && e.target.closest('[data-arb-op], [data-arb-reiniciar], [data-arb-abrir], [data-arb-ejemplo]');
      if (!t) return;
      const raiz = t.closest('[data-arbol]') && t.closest('[data-arbol]').parentElement;
      if (t.dataset.arbOp) {
        const k = Number(t.dataset.arbK);
        est.camino = est.camino.slice(0, k).concat(t.dataset.arbOp); est.marcado = null; guardar();
        pintarEn(raiz, k + 1);
      } else if (t.hasAttribute('data-arb-reiniciar')) { camino([]); pintarEn(raiz, 0); }
      else if (t.dataset.arbAbrir) abrirAnalisis(t.dataset.arbAbrir, false);
      else if (t.dataset.arbEjemplo) abrirAnalisis(t.dataset.arbEjemplo, true);
    });
    let reloj = 0;
    window.addEventListener('resize', () => { clearTimeout(reloj); reloj = setTimeout(() => document.querySelectorAll('[data-arbol]').forEach(conectar), 120); });
  }
  SP.arbolUI = { html, conectar, camino, ir, estado: est };
  SP.alArrancar(iniciar);
})();

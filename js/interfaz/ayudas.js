/* SigmaPro — ayudas emergentes (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un recuadro breve junto a un control, al pasar el puntero (después de un instante) o al llegar con el teclado:
     · data-ayuda="texto"            el texto (se traduce con SP.T, como el resto de la interfaz);
     · data-ayuda-termino="id"       la definición de un término del glosario (SP.glosario), con «Ctrl+G: glosario»;
     · el encabezado de una columna de un cuadro (th[data-clave]) cuyo estadístico está en el registro (SP.guias):
       su nombre y qué es.
   Cumple con WCAG 1.4.13: se cierra con Esc sin mover el foco, el puntero puede pasar al recuadro sin que se cierre y
   sigue a la vista mientras el puntero o el foco estén en el control. Mientras se ve, el control lo nombra en
   aria-describedby. Los botones del encabezado usan data-ayuda en lugar de title (que el teclado no muestra).

     SP.ayudas.texto(el)   el texto de la ayuda de un elemento ('' si no tiene)
     SP.ayudas.ocultar() */
(function () {
  'use strict';
  const T = SP.T;
  const ID = 'spAyuda';
  const SEL = '[data-ayuda], [data-ayuda-termino], .sp-cuadro thead th[data-clave]';
  let tip = null, actual = null, reloj = 0, cierre = 0;

  function texto(el) {
    if (!el) return '';
    if (el.dataset.ayuda) return T(el.dataset.ayuda);
    if (el.dataset.ayudaTermino && SP.glosario) {
      const t = SP.glosario.termino(el.dataset.ayudaTermino);
      return t ? t.nombre + ': ' + t.que : '';
    }
    if (el.matches && el.matches('.sp-cuadro thead th[data-clave]') && SP.guias) {
      const f = SP.guias.buscar(el.dataset.clave, el.textContent.trim());
      return f ? f.nombre + ': ' + f.que : '';
    }
    return '';
  }
  const conGlosario = el => !!(el && (el.dataset.ayudaTermino || el.tagName === 'TH') && SP.glosarioUI);

  function crear() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = ID;
    tip.className = 'sp-ayuda';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    tip.addEventListener('mouseenter', () => clearTimeout(cierre));
    tip.addEventListener('mouseleave', () => ocultarLuego());
    document.body.appendChild(tip);
    return tip;
  }
  function colocar(el) {
    const r = el.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 16);
    tip.style.maxWidth = w + 'px';
    const alto = tip.offsetHeight, ancho = tip.offsetWidth;
    const arriba = r.top - alto - 8 > 8;
    const y = arriba ? r.top - alto - 8 : Math.min(window.innerHeight - alto - 8, r.bottom + 8);
    const x = Math.max(8, Math.min(window.innerWidth - ancho - 8, r.left + r.width / 2 - ancho / 2));
    tip.style.left = Math.round(x + window.scrollX) + 'px';
    tip.style.top = Math.round(y + window.scrollY) + 'px';
    tip.dataset.lado = arriba ? 'arriba' : 'abajo';
  }
  function mostrar(el) {
    const t = texto(el);
    if (!t) return;
    clearTimeout(cierre);
    if (actual && actual !== el) quitarDescripcion(actual);
    crear();
    tip.innerHTML = '';
    const p = document.createElement('span'); p.textContent = t; tip.appendChild(p);
    if (conGlosario(el)) { const g = document.createElement('span'); g.className = 'sp-ayuda-g'; g.textContent = T('Ctrl+G: glosario'); tip.appendChild(g); }
    tip.hidden = false;
    colocar(el);
    actual = el;
    const d = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!d.includes(ID)) el.setAttribute('aria-describedby', d.concat(ID).join(' '));
  }
  function quitarDescripcion(el) {
    const d = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(x => x && x !== ID);
    if (d.length) el.setAttribute('aria-describedby', d.join(' ')); else el.removeAttribute('aria-describedby');
  }
  function ocultar() {
    clearTimeout(reloj); clearTimeout(cierre);
    if (tip) tip.hidden = true;
    if (actual) quitarDescripcion(actual);
    actual = null;
  }
  function ocultarLuego() { clearTimeout(cierre); cierre = setTimeout(ocultar, 180); }

  function iniciar() {
    document.addEventListener('mouseover', e => {
      const el = e.target.closest && e.target.closest(SEL);
      if (!el || el === actual) { if (el) clearTimeout(cierre); return; }
      clearTimeout(reloj);
      /* si el puntero sale antes, mouseout cancela la espera */
      reloj = setTimeout(() => mostrar(el), 400);
    });
    document.addEventListener('mouseout', e => {
      const el = e.target.closest && e.target.closest(SEL);
      if (!el) return;
      clearTimeout(reloj);
      if (el === actual && !(e.relatedTarget && (el.contains(e.relatedTarget) || (tip && tip.contains(e.relatedTarget))))) ocultarLuego();
    });
    document.addEventListener('focusin', e => {
      const el = e.target.closest && e.target.closest('[data-ayuda], [data-ayuda-termino]');
      if (el && el === e.target && e.target.matches(':focus-visible')) mostrar(el);
    });
    document.addEventListener('focusout', e => { if (actual && e.target === actual) ocultar(); });
    /* Esc la cierra sin mover el foco (y sin cerrar la ventana en que esté) */
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && tip && !tip.hidden) { e.preventDefault(); e.stopPropagation(); ocultar(); } }, true);
    document.addEventListener('mousedown', e => { if (actual && !(tip && tip.contains(e.target))) ocultar(); }, true);
    document.addEventListener('change', () => ocultar(), true);
    window.addEventListener('scroll', () => { if (actual) colocar(actual); }, { passive: true });
    window.addEventListener('resize', ocultar);
  }
  SP.ayudas = { texto, ocultar };
  SP.alArrancar(iniciar);
})();

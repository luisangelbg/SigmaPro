/* SigmaPro — «En pocas palabras» y «Cómo reportarlo» en cada resultado (hito 5.4).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.reportar.claro(metodo, r, rep)    → el recuadro «En pocas palabras» (SP.claro.frases), o '' si no hay frases
     SP.reportar.html({ metodo, r, e, op, ctx, tabla })
                                          → el desplegable «Cómo reportarlo (APA)»: los párrafos de métodos y de resultados
                                            del reporte (SP.informe.parrafo) con las convenciones de APA 7
                                            (SP.claro.apaHTML), en español y en inglés, cada uno con «Copiar»
   Los párrafos se arman al abrir el desplegable. El idioma que no es el de la interfaz se arma con el otro catálogo:
   el español es el texto original; el inglés (js/i18n/en.js) se carga la primera vez que se pide y no cambia el
   idioma de la app (SP.T usa ese catálogo solo mientras arma el texto). En los métodos del núcleo el resultado se vuelve
   a calcular con ese catálogo (con la tabla de cuando se pidió), porque guarda nombres ya traducidos («genotipos»,
   «lineal»); tests/idioma.mjs comprueba que el texto salga igual que con la app en ese idioma. Los del motor R usan el
   resultado que ya tienen. Al copiar se llevan el texto y su versión con cursivas, que un procesador de textos conserva. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const pedidos = new Map();
  let serie = 0, catalogoEN = SP.T.catalogo || null, cargando = null;

  /** El recuadro «En pocas palabras». */
  function claro(metodo, r, rep) {
    let fr = [];
    try { fr = SP.claro ? SP.claro.frases(metodo, r, rep) : []; } catch (e) { fr = []; }
    if (!fr.length) return '';
    return `<div class="sp-claro" role="note" aria-labelledby="spClaro${++serie}"><p class="sp-claro-t" id="spClaro${serie}">${esc(T('En pocas palabras'))}</p>` +
      `<ul>${fr.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>`;
  }

  /** El desplegable «Cómo reportarlo (APA)»; o = { metodo, r, e, op, ctx }. */
  function html(o) {
    if (!o || !SP.informe || !SP.metodos[o.metodo]) return '';
    const id = 'rp' + (++serie);
    pedidos.set(id, o);
    if (pedidos.size > 16) pedidos.delete(pedidos.keys().next().value);
    return `<details class="sp-reportar" data-rp="${id}"><summary>${esc(T('Cómo reportarlo (APA)'))}</summary><div class="sp-rp-cuerpo"></div></details>`;
  }

  /* el texto de un idioma: con el catálogo de ese idioma mientras se arma */
  function textos(o, idioma) {
    const antes = SP.T.catalogo;
    SP.T.catalogo = idioma === 'en' ? catalogoEN : null;
    try {
      const f = SP.metodos[o.metodo];
      let r = o.r;
      if (idioma !== actual() && f.motor !== 'r' && o.tabla !== undefined) {
        try { r = SP.ejecutar(o.metodo, o.tabla, o.e || {}, o.op || {}).resultado; } catch (e) { r = o.r; }
      }
      const rep = o.ctx ? f.reporte(r, o.ctx) : f.reporte(r);
      return SP.informe.parrafo(o.metodo, r, rep, o.e || {}, o.op || {});
    } finally { SP.T.catalogo = antes; }
  }
  /* el catálogo inglés, la primera vez que se pide (sin cambiar el idioma de la app) */
  function cargarEN() {
    if (catalogoEN) return Promise.resolve(catalogoEN);
    if (cargando) return cargando;
    cargando = new Promise((ok, mal) => {
      const previo = Object.prototype.hasOwnProperty.call(window, 'SP_CATALOGO') ? window.SP_CATALOGO : undefined;
      const s = document.createElement('script');
      s.src = 'js/i18n/en.js';
      s.onload = () => {
        catalogoEN = window.SP_CATALOGO || null;
        if (previo === undefined) { try { delete window.SP_CATALOGO; } catch (e) { window.SP_CATALOGO = undefined; } } else window.SP_CATALOGO = previo;
        s.remove();
        if (catalogoEN) ok(catalogoEN); else mal(new Error('sin catálogo'));
      };
      s.onerror = () => { s.remove(); cargando = null; mal(new Error(T('No se pudo cargar el texto en inglés.'))); };
      document.head.appendChild(s);
    });
    return cargando;
  }

  const actual = () => (SP.IDIOMA === 'en' ? 'en' : 'es');
  function bloque(titulo, texto, k, idioma) {
    if (!texto) return '';
    return `<div class="sp-rp-bloque"><p class="sp-rp-t">${esc(titulo)}</p><p class="sp-rp-p" data-rp-texto="${k}">${SP.claro.apaHTML(texto, idioma)}</p>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-rp-copiar="${k}">${esc(T('Copiar'))}</button></div>`;
  }
  async function pintar(det, idioma) {
    const o = pedidos.get(det.dataset.rp), cuerpo = det.querySelector('.sp-rp-cuerpo');
    if (!o || !cuerpo) return;
    idioma = idioma || det.dataset.rpIdioma || actual();
    det.dataset.rpIdioma = idioma;
    const pestanas = `<div class="seg sp-rp-idiomas" role="group" aria-label="${esc(T('Idioma del texto'))}">` +
      [['es', 'Español'], ['en', 'English']].map(([k, n]) => `<button type="button" data-rp-idioma="${k}" aria-pressed="${k === idioma}" lang="${k}">${n}</button>`).join('') + '</div>';
    let par;
    try {
      if (idioma === 'en' && actual() !== 'en') { cuerpo.innerHTML = pestanas + `<p class="small muted" role="status">${esc(T('Cargando el texto en inglés…'))}</p>`; await cargarEN(); }
      par = textos(o, idioma);
    } catch (e) {
      cuerpo.innerHTML = pestanas + `<p class="small msg-error">${esc(e.message || String(e))}</p>`;
      return;
    }
    const L = idioma === 'en' ? { m: 'Methods', r: 'Results' } : { m: 'Métodos', r: 'Resultados' };
    det._rpTextos = { m: SP.claro.apa(par.metodos || '', idioma), r: SP.claro.apa(par.resultados || '', idioma) };
    cuerpo.innerHTML = pestanas + `<div lang="${idioma}">` + bloque(L.m, par.metodos, 'm', idioma) + bloque(L.r, par.resultados, 'r', idioma) + '</div>' +
      `<p class="small muted">${esc(T('Estilo APA 7: los símbolos estadísticos en cursiva, p y los estadísticos que no pasan de 1 sin el cero inicial (p < .001) y los intervalos entre corchetes. Al pegar en un procesador de textos se conserva la cursiva. Es un punto de partida: revisa la redacción.'))}</p>`;
  }
  async function copiar(texto, htmlTexto) {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([texto], { type: 'text/plain' }), 'text/html': new Blob([htmlTexto], { type: 'text/html' }) })]);
        return true;
      }
    } catch (e) { /* sin el portapapeles enriquecido: solo el texto */ }
    return SP.cuadros.copiar(texto);
  }

  if (typeof document !== 'undefined') {
    /* el evento toggle no sube: se escucha en la fase de captura */
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (d && d.matches && d.matches('details.sp-reportar') && d.open && !d.dataset.rpPintado) { d.dataset.rpPintado = '1'; pintar(d); }
    }, true);
    document.addEventListener('click', async e => {
      const b = e.target && e.target.closest && e.target.closest('[data-rp-idioma], [data-rp-copiar]');
      if (!b) return;
      const det = b.closest('details.sp-reportar');
      if (!det) return;
      if (b.dataset.rpIdioma) { await pintar(det, b.dataset.rpIdioma); const otro = det.querySelector(`[data-rp-idioma="${b.dataset.rpIdioma}"]`); if (otro) otro.focus(); return; }
      const k = b.dataset.rpCopiar, p = det.querySelector(`[data-rp-texto="${k}"]`), t = det._rpTextos && det._rpTextos[k];
      if (!p || !t) return;
      const ok = await copiar(t, p.innerHTML);
      const L = window.LABG;
      if (L && L.toast) L.toast(ok ? T('Texto copiado.') : T('No se pudo copiar.'), { type: ok ? 'success' : 'warning' });
    });
  }

  SP.reportar = { claro, html, pintar, textos, cargarEN };
})();

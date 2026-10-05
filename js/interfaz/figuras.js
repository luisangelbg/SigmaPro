/* SigmaPro — bloque 6: las figuras del reporte, listas para publicar.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada figura del reporte, numerada, con su leyenda (que declara las barras de error: ± 1 EE o IC) y sus descargas:
   SVG, PDF vectorial (texto seleccionable), PNG y TIFF a 600 ppp con la resolución dentro del archivo. Para tamaños de
   revista (1, 1.5 o 2 columnas), letra mínima y paletas, cada figura se abre en el Estudio de figuras LABG; el estudio
   le pide a SigmaPro el PDF vectorial en lugar de una imagen. El editor ✎ funciona aquí igual que en Análisis.

     SP.app.figuras.preparar(svg) → copia del SVG con cada color, grosor y letra escritos en el elemento (tema claro)
     SP.app.figuras.svg(svg, anchoCm) · png(svg, anchoCm, ppp) · tiff(svg, anchoCm, ppp) · pdf(svg, anchoCm) → bytes o texto
     SP.app.figuras.lista() → [{ numero, titulo, descripcion, svg, item }] (las del reporte, en orden) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity',
    'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'visibility', 'display', 'paint-order'];
  const FUENTE = 'Helvetica, Arial, sans-serif';
  const NS = 'http://www.w3.org/2000/svg';

  /** Copia del SVG con los estilos resueltos en el tema claro (como se imprime): cada elemento lleva su color, grosor y
      letra, sin depender de la hoja de estilo de la página. Lo cambiado con el editor ✎ o el estudio ya está en el SVG. */
  function preparar(svg) {
    const html = document.documentElement, antes = html.getAttribute('data-theme');
    html.setAttribute('data-theme', 'light');
    try {
      const copia = svg.cloneNode(true);
      const orig = [svg, ...svg.querySelectorAll('*')], dest = [copia, ...copia.querySelectorAll('*')];
      orig.forEach((o, i) => {
        const d = dest[i];
        if (!d || !(o instanceof SVGElement)) return;
        const cs = getComputedStyle(o);
        for (const p of PROPS) {
          const v = cs.getPropertyValue(p);
          if (v !== '') d.setAttribute(p, v.replace(/(\d)px/g, '$1'));
        }
        if (/^(text|tspan)$/i.test(o.tagName)) d.setAttribute('font-family', /times|serif/i.test(cs.fontFamily) && !/sans-serif/i.test(cs.fontFamily) ? '"Times New Roman", Times, serif' : FUENTE);
        d.removeAttribute('class'); d.removeAttribute('style');
      });
      /* lo que agregan el editor y el estudio para trabajar (asas, marcos) no va en el archivo */
      copia.querySelectorAll('[data-fe-skip], .fe-handle, .lfs-own').forEach(n => n.remove());
      copia.setAttribute('xmlns', NS);
      return copia;
    } finally {
      if (antes === null) html.removeAttribute('data-theme'); else html.setAttribute('data-theme', antes);
    }
  }
  const caja = svg => { const vb = svg.viewBox && svg.viewBox.baseVal; return vb && vb.width ? { w: vb.width, h: vb.height } : { w: 520, h: 340 }; };
  const altoCm = (svg, anchoCm) => { const b = caja(svg); return anchoCm * b.h / b.w; };

  function svgTexto(svg, anchoCm) {
    const p = preparar(svg);
    if (anchoCm) { p.setAttribute('width', (anchoCm * 10).toFixed(2) + 'mm'); p.setAttribute('height', (altoCm(svg, anchoCm) * 10).toFixed(2) + 'mm'); }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(p);
  }
  /* la figura dibujada en un lienzo blanco del tamaño de salida */
  async function lienzo(svg, anchoCm, ppp) {
    const ancho = Math.round(anchoCm / 2.54 * ppp), alto = Math.round(altoCm(svg, anchoCm) / 2.54 * ppp);
    const p = preparar(svg);
    p.setAttribute('width', ancho); p.setAttribute('height', alto);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(p)], { type: 'image/svg+xml' }));
    try {
      const im = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(new Error(T('No se pudo dibujar la figura.'))); i.src = url; });
      const cv = document.createElement('canvas');
      cv.width = ancho; cv.height = alto;
      const g = cv.getContext('2d');
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, ancho, alto);
      g.drawImage(im, 0, 0, ancho, alto);
      return cv;
    } finally { URL.revokeObjectURL(url); }
  }
  async function png(svg, anchoCm, ppp) {
    const cv = await lienzo(svg, anchoCm, ppp);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/png'));
    return SP.imagen.pngConPpp(new Uint8Array(await blob.arrayBuffer()), ppp);
  }
  async function tiff(svg, anchoCm, ppp) {
    const cv = await lienzo(svg, anchoCm, ppp);
    return SP.imagen.tiff(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height, ppp);
  }
  function pdf(svg, anchoCm, altoCmPedido) {
    const p = preparar(svg);
    const titulo = svg.getAttribute('data-sigmapro-figura') || '';
    return SP.svgPdf.construir(p, { anchoPt: anchoCm / 2.54 * 72, altoPt: (altoCmPedido || altoCm(svg, anchoCm)) / 2.54 * 72, titulo });
  }

  /* el Estudio de figuras pide a SigmaPro el PDF vectorial de sus gráficas (las demás salidas las hace el estudio) */
  window.LABG_FIGSTUDIO = Object.assign(window.LABG_FIGSTUDIO || {}, {
    nativeExport(rec) {
      const el = rec && rec.el;
      const svg = el && (el.tagName && el.tagName.toLowerCase() === 'svg' ? el : el.querySelector && el.querySelector('svg'));
      if (!svg || !svg.hasAttribute('data-sigmapro-figura')) return null;
      return { label: 'SigmaPro', formats: ['pdf'], preview: false, render: (fmt, o) => pdf(svg, (o.wmm || 160) / 10, o.hmm ? o.hmm / 10 : null).then(b => new Blob([b], { type: 'application/pdf' })) };
    },
    /* el tema de las gráficas (js/interfaz/temas-graficas.js) también en el estudio: el selector junto a la figura o, si
       no hay, el del bloque Figuras */
    controlsFor(rec) {
      const h = rec && rec.host;
      if (!h || !h.closest || !(h.closest('.sp-grafica') || (h.querySelector && h.querySelector('.sp-grafica')))) return null;
      const card = h.closest('.card, section');
      const nodo = (card && card.querySelector('.graf-tema, .fig-tema')) || document.querySelector('.fig-tema');
      return nodo ? { node: nodo, title: ['Tema de las gráficas', 'Chart theme'] } : null;
    },
  });

  /* ---------------- bloque 6 ---------------- */
  const est = SP.app.figuras = { preparar, svg: svgTexto, png, tiff, pdf, altoCm, pendiente: true };
  const nombreArchivo = (n, t) => 'figura-' + String(n).padStart(2, '0') + '-' + String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  est.nombreArchivo = nombreArchivo;
  function descargar(datos, nombre, tipo) {
    const url = URL.createObjectURL(datos instanceof Blob ? datos : new Blob([datos], { type: tipo }));
    const a = document.createElement('a');
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  est.descargar = descargar;

  /** Las figuras del reporte en el orden del documento, con el SVG vivo de la galería (con lo editado). */
  est.lista = () => {
    if (est.pendiente) pintar();
    return [...document.querySelectorAll('#figGaleria .fig-tarjeta')].map(c => ({
      numero: +c.dataset.numero, titulo: c.dataset.titulo, descripcion: c.dataset.descripcion, item: +c.dataset.item, svg: c.querySelector('svg'),
    })).filter(f => f.svg);
  };

  function pintar() {
    est.pendiente = false;
    const R = SP.app.reporte;
    const elems = R ? R.elementos() : [];
    const conFig = elems.filter(x => x.figurasHTML);
    $('#figVacio').hidden = !!conFig.length;
    $('#figTrabajo').hidden = !conFig.length;
    if (!conFig.length) return;
    document.querySelectorAll('#figBarras [data-barras]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.barras === R.opciones.barras)));
    const ancho = $('#figAncho'); if (ancho) ancho.value = String(R.opciones.anchoCm);
    let n = 0;
    const partes = [];
    elems.forEach((x, k) => {
      if (!x.figurasHTML) return;
      const t = document.createElement('template');
      t.innerHTML = x.figurasHTML;
      t.content.querySelectorAll('figure.sp-grafica').forEach(f => {
        n++;
        const svg = f.querySelector('svg'), titulo = (f.querySelector('figcaption') || {}).textContent || '', desc = svg ? svg.getAttribute('aria-label') || '' : '';
        const cap = f.querySelector('figcaption');
        if (cap) cap.innerHTML = `<b>${esc(T('Figura {n}.', { n }))}</b> ${esc(titulo)}. ${esc(desc)}`;
        const caja = document.createElement('div');
        caja.appendChild(f.cloneNode(true));
        partes.push(`<div class="fig-tarjeta" data-numero="${n}" data-titulo="${esc(titulo)}" data-descripcion="${esc(desc)}" data-item="${x.item.id}">` +
          `<p class="small muted fig-origen">${esc(T('Del análisis {k}: {t}', { k: k + 1, t: x.titulo }))}</p>${caja.innerHTML}` +
          `<div class="btn-row fig-acciones" role="group" aria-label="${esc(T('Descargas de la figura {n}', { n }))}">` +
          `<button type="button" class="btn btn-secondary btn-sm" data-fig="estudio" data-n="${n}">${esc(T('Abrir en el estudio'))}</button>` +
          ['svg', 'pdf', 'png', 'tiff'].map(fmt => `<button type="button" class="btn btn-ghost btn-sm" data-fig="${fmt}" data-n="${n}" aria-label="${esc(T('Descargar la figura {n} en {f}', { n, f: fmt.toUpperCase() }))}">${fmt === 'png' || fmt === 'tiff' ? fmt.toUpperCase() + ' 600 ppp' : fmt.toUpperCase()}</button>`).join('') +
          `</div></div>`);
      });
    });
    $('#figResumen').textContent = T('{n} figuras de {k} análisis. El ancho elegido se usa en el documento y en las descargas; para el tamaño exacto de una revista, ábrela en el estudio.', { n, k: conFig.length });
    $('#figGaleria').innerHTML = partes.join('');
  }
  est.pintar = pintar;

  function iniciar() {
    const panel = $('#panel-6');
    if (!panel) return;
    panel.addEventListener('click', async e => {
      const b = e.target.closest('[data-barras], [data-fig]');
      if (!b) return;
      const R = SP.app.reporte;
      if (b.dataset.barras) { R.opciones.barras = b.dataset.barras; try { localStorage.setItem('sigmapro.reporte.opciones', JSON.stringify(R.opciones)); } catch (x) { /* nada */ } R.version++; document.dispatchEvent(new CustomEvent('sp:reporte', {})); pintar(); return; }
      const f = est.lista().find(x => x.numero === +b.dataset.n);
      if (!f) return;
      if (b.dataset.fig === 'estudio') {
        if (window.LABGFigureStudio && window.LABGFigureStudio.open) window.LABGFigureStudio.open(f.svg);
        else if (L()) L().toast(T('El Estudio de figuras todavía está cargando; intenta de nuevo.'), { type: 'warning' });
        return;
      }
      const ancho = R.opciones.anchoCm, nombre = nombreArchivo(f.numero, f.titulo);
      b.disabled = true;
      try {
        if (b.dataset.fig === 'svg') descargar(svgTexto(f.svg, ancho), nombre + '.svg', 'image/svg+xml');
        else if (b.dataset.fig === 'pdf') descargar(await pdf(f.svg, ancho), nombre + '.pdf', 'application/pdf');
        else if (b.dataset.fig === 'png') descargar(await png(f.svg, ancho, 600), nombre + '-600ppp.png', 'image/png');
        else if (b.dataset.fig === 'tiff') descargar(await tiff(f.svg, ancho, 600), nombre + '-600ppp.tif', 'image/tiff');
      } catch (x) { console.error(x); if (L()) L().toast(T('No se pudo exportar la figura: {m}', { m: x.message }), { type: 'error' }); }
      finally { b.disabled = false; }
    });
    const ancho = $('#figAncho');
    if (ancho) ancho.addEventListener('change', () => { const R = SP.app.reporte; R.opciones.anchoCm = +ancho.value; try { localStorage.setItem('sigmapro.reporte.opciones', JSON.stringify(R.opciones)); } catch (x) { /* nada */ } $('#figResumen').textContent = T('Ancho: {a} cm.', { a: ancho.value }); });
    const repintar = () => { if (panel.classList.contains('active')) pintar(); else est.pendiente = true; };
    document.addEventListener('sp:reporte', repintar);
    document.addEventListener('sp:datos', repintar);
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 6 && est.pendiente) pintar(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

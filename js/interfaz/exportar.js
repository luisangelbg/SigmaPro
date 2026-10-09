/* SigmaPro — bloque 7: exportar el reporte, los cuadros, las figuras y el proyecto.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     Reporte  .docx (figuras PNG a 300 ppp con su tamaño), HTML (figuras vectoriales en la página) y PDF (la misma página,
              con el diálogo de impresión del navegador). Desde el hito 5.8: portada con su ficha, índice, resumen en pocas
              palabras y, en cada análisis, el panel «Lectura de los indicadores» (SP.lectura.panel); el apéndice
              metodológico con la ficha de Fundamentos de cada método, y Markdown (un ZIP con reporte.md y sus figuras)
     Cuadros  hoja de cálculo .xlsx (un cuadro por hoja, con todas las cifras, y un índice) y LaTeX (booktabs)
     Figuras  un ZIP con SVG, PDF vectorial y PNG a 600 ppp (y TIFF si se pide), con su índice
     Proyecto .labg: datos, análisis, ajustes de las figuras y el código R, con la huella SHA-256 de cada archivo
   Todo se arma en el navegador; nada sale del equipo. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const R = () => SP.app.reporte;
  const F = () => SP.app.figuras;
  const hoy = () => new Date().toISOString().slice(0, 10);
  const base = () => (R().titulo || 'reporte').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'reporte';
  const estado = t => { const s = $('#expoEstado'); if (s) s.textContent = t; };

  /* ---------------- el documento ---------------- */
  function opcionesDoc() {
    const d = SP.app.datos, r = R();
    return { titulo: r.titulo || T('Reporte de análisis estadístico'), autor: r.autor, datos: d && d.origen, n: d && d.hoja ? (d.filtro ? d.filtro.filas.length : d.hoja.n) : null,
      conCodigo: r.opciones.codigo, conDetalles: r.opciones.detalles, conResumen: r.opciones.resumen !== false, conLectura: r.opciones.lectura !== false, conMetodos: r.opciones.metodos !== false, hoja: r.opciones.hoja };
  }
  /** Los elementos del documento con sus figuras: como SVG (HTML) o como PNG con su tamaño (docx). */
  async function items(conPng) {
    const elems = R().elementos(), figs = F().lista();
    const ancho = Math.min(R().opciones.anchoCm, SP.docx.anchoUtilCm(R().opciones.hoja));
    const out = [];
    for (const x of elems) {
      const propias = figs.filter(f => f.item === x.item.id);
      const figuras = [];
      for (const f of propias) {
        const g = { titulo: f.titulo, descripcion: f.descripcion, alt: f.descripcion };
        if (conPng) Object.assign(g, { imagen: await F().png(f.svg, ancho, 300), anchoCm: ancho, altoCm: F().altoCm(f.svg, ancho), nombre: F().nombreArchivo(f.numero, f.titulo) + '.png' });
        else g.svg = new XMLSerializer().serializeToString(F().preparar(f.svg));
        figuras.push(g);
      }
      out.push(Object.assign({}, x, { figuras, lectura: await lectura(x, conPng) }));
    }
    return out;
  }
  /** El panel «Lectura de los indicadores» de un elemento: el SVG (HTML) y, para el .docx, su PNG a 300 ppp. */
  async function lectura(x, conPng) {
    if (R().opciones.lectura === false || !SP.lectura || !SP.lectura.panel) return null;
    let p = null;
    try { p = SP.lectura.panel(x); } catch (e) { console.error(e); }
    if (!p) return null;
    const anchoCm = Math.min(16, SP.docx.anchoUtilCm(R().opciones.hoja)), altoCm = anchoCm * p.alto / p.ancho;
    const out = { svg: p.svg, descripcion: p.descripcion, textos: p.textos, fuentes: p.fuentes, anchoCm, altoCm };
    if (conPng) {
      const svg = new DOMParser().parseFromString(p.svg, 'image/svg+xml').documentElement;
      out.imagen = await F().png(svg, anchoCm, 300);
    }
    return out;
  }
  /** Las fichas de Fundamentos de los métodos del reporte, para el apéndice metodológico (en el idioma de la app). */
  async function metodos(elems) {
    if (R().opciones.metodos === false || !SP.app.fundamentos || !SP.app.fundamentos.cargar) return [];
    const out = [];
    for (const id of [...new Set(elems.map(x => x.id))]) {
      let f = null;
      try { f = await SP.app.fundamentos.cargar(id); } catch (e) { f = null; }
      const ficha = f && (f[SP.IDIOMA] || f.es);
      if (ficha) out.push({ id, nombre: SP.metodos[id] ? SP.metodos[id].nombre : id, ficha });
    }
    return out;
  }
  /** Las opciones del documento con el apéndice metodológico. */
  async function opcionesCon(its) { return Object.assign(opcionesDoc(), { metodos: await metodos(its) }); }
  const hayReporte = () => { if (R().items.length) return true; if (L()) L().toast(T('El reporte está vacío: agrega análisis desde Explorar o Análisis.'), { type: 'warning' }); return false; };
  async function trabajo(boton, mensaje, fn) {
    if (boton && boton.tagName) boton.disabled = true;
    estado(mensaje);
    try { return L() && L().work && L().work.run ? await L().work.run({ title: mensaje, delay: 400 }, () => fn()) : await fn(); }
    catch (e) { console.error(e); estado(''); if (L()) L().toast(T('No se pudo exportar: {m}', { m: e.message }), { type: 'error' }); return null; }
    finally { if (boton && boton.tagName) boton.disabled = false; }
  }

  /* cada exportación se arma aparte de su descarga (las pruebas piden los bytes) → { datos, nombre, tipo, mensaje } */
  const construir = {
    async docx() {
      const its = await items(true), o = await opcionesCon(its), bloques = SP.informe.bloques(its, o);
      const datos = SP.docx.construir({ titulo: o.titulo, autor: o.autor, hoja: o.hoja, bloques });
      const nombre = base() + '-' + hoy() + '.docx';
      return { datos, nombre, tipo: SP.docx.MIME, mensaje: T('Listo: {n} ({k} KB).', { n: nombre, k: Math.max(1, Math.round(datos.length / 1024)) }) };
    },
    async html() {
      return { datos: await paginaHtml(), nombre: base() + '-' + hoy() + '.html', tipo: 'text/html;charset=utf-8', mensaje: T('Listo: la página trae las figuras vectoriales y se abre en cualquier navegador.') };
    },
    async markdown() {
      const its = await items(true), o = await opcionesCon(its), bloques = SP.informe.bloques(its, o);
      /* cada figura y cada panel de lectura, como archivo en «figuras/» */
      const archivos = [];
      let nl = 0;
      for (const b of bloques) {
        if (b.tipo === 'figura' && b.imagen) { b.archivo = 'figuras/' + b.nombre; archivos.push({ nombre: b.archivo, datos: b.imagen }); }
        else if (b.tipo === 'lectura' && b.imagen) { b.archivo = 'figuras/lectura-' + (++nl) + '.png'; archivos.push({ nombre: b.archivo, datos: b.imagen }); }
      }
      archivos.unshift({ nombre: 'reporte.md', datos: SP.informe.markdown(bloques) });
      const nombre = base() + '-markdown-' + hoy() + '.zip';
      return { datos: await SP.zip.construirComprimido(archivos), nombre, tipo: 'application/zip', mensaje: T('Listo: {n}, con reporte.md y {k} imágenes en «figuras».', { n: nombre, k: archivos.length - 1 }) };
    },
    async xlsx() {
      const lista = cuadros();
      const indice = { nombre: T('Índice'), filas: [[T('Cuadro'), T('Título'), T('Análisis'), T('Notas')]].concat(lista.map(c => [c.numero, c.cuadro.titulo, c.analisis, (c.cuadro.notas || []).join(' ')])) };
      const hojas = [indice].concat(lista.map(c => { const v = SP.formatos.valores(c.cuadro, c.visibles); return { nombre: T('C{n} {t}', { n: c.numero, t: c.cuadro.titulo }), filas: [v.cabecera].concat(v.filas) }; }));
      return { datos: SP.xlsx.construir(hojas, { titulo: R().titulo }), nombre: base() + '-cuadros-' + hoy() + '.xlsx', tipo: SP.xlsx.MIME, mensaje: T('Listo: {k} cuadros, uno por hoja, con todas sus cifras.', { k: lista.length }) };
    },
    async latex() {
      const lista = cuadros();
      const tex = SP.latex.documento(lista.map(c => ({ cuadro: c.cuadro, numero: c.numero, visibles: c.visibles })), { titulo: R().titulo });
      return { datos: tex, nombre: base() + '-cuadros-' + hoy() + '.tex', tipo: 'application/x-tex;charset=utf-8', mensaje: T('Listo: {k} cuadros con las reglas de booktabs; compila con pdfLaTeX o copia cada tabla a tu documento.', { k: lista.length }) };
    },
    async figuras(conTiff) {
      const figs = F().lista();
      const ancho = R().opciones.anchoCm, archivos = [], indice = [['numero', 'titulo', 'descripcion', 'archivos'].join(',')];
      for (const fg of figs) {
        const n = F().nombreArchivo(fg.numero, fg.titulo), propios = [n + '.svg', n + '.pdf', n + '-600ppp.png'].concat(conTiff ? [n + '-600ppp.tif'] : []);
        archivos.push({ nombre: 'figuras/' + n + '.svg', datos: F().svg(fg.svg, ancho) });
        archivos.push({ nombre: 'figuras/' + n + '.pdf', datos: await F().pdf(fg.svg, ancho) });
        archivos.push({ nombre: 'figuras/' + n + '-600ppp.png', datos: await F().png(fg.svg, ancho, 600) });
        if (conTiff) archivos.push({ nombre: 'figuras/' + n + '-600ppp.tif', datos: await F().tiff(fg.svg, ancho, 600) });
        indice.push([fg.numero, fg.titulo, fg.descripcion, propios.join(' ')].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','));
      }
      archivos.push({ nombre: 'figuras/indice.csv', datos: '\ufeff' + indice.join('\n') + '\n' });
      return { datos: await SP.zip.construirComprimido(archivos), nombre: base() + '-figuras-' + hoy() + '.zip', tipo: 'application/zip', n: figs.length,
        mensaje: T('Listo: {k} figuras de {a} cm en SVG, PDF vectorial y PNG a 600 ppp{t}.', { k: figs.length, a: ancho, t: conTiff ? T(' y TIFF') : '' }) };
    },
    async proyecto() {
      const d = SP.app.datos;
      const items = R().items.map(it => { const res = R().calcular(it); return { metodo: it.metodo, e: it.e, op: it.op, ctx: it.ctx || undefined, vista: it.vista, visibles: it.visibles, titulo: it.titulo, nota: it.nota, codigo: res.error ? undefined : res.codigo }; });
      const datos = await SP.proyecto.armar({ hoja: d.hoja, filtro: d.filtro, origen: d.origen, reporte: { titulo: R().titulo, autor: R().autor, items }, estilos: estilos() });
      const nombre = base() + '-' + hoy() + '.labg';
      return { datos, nombre, tipo: 'application/zip', mensaje: T('Proyecto guardado: {n} ({k} KB, con la huella SHA-256 de cada archivo).', { n: nombre, k: Math.max(1, Math.round(datos.length / 1024)) }) };
    },
  };
  /* los análisis del motor R se calculan aparte: antes de armar cualquier archivo se espera a que terminen */
  for (const k of Object.keys(construir)) { const f = construir[k]; construir[k] = async (...a) => { await R().listo(); return f(...a); }; }
  /* armar y descargar, con la espera de la suite */
  async function exportar(boton, mensaje, que, arg) {
    const r = await trabajo(boton, mensaje, () => construir[que](arg));
    if (!r) return null;
    F().descargar(r.datos, r.nombre, r.tipo);
    estado(r.mensaje);
    return r;
  }
  const docx = b => (hayReporte() ? exportar(b, T('Armando el documento .docx…'), 'docx') : null);
  async function paginaHtml() {
    await R().listo();
    const its = await items(false), o = await opcionesCon(its);
    return SP.informe.html(SP.informe.bloques(its, o), o);
  }
  const html = b => (hayReporte() ? exportar(b, T('Armando la página…'), 'html') : null);
  const markdown = b => (hayReporte() ? exportar(b, T('Armando el Markdown…'), 'markdown') : null);
  async function imprimir(boton) {
    if (!hayReporte()) return;
    await trabajo(boton, T('Preparando la impresión…'), async () => {
      const h = await paginaHtml();
      let marco = $('#expoMarco');
      if (marco) marco.remove();
      marco = document.createElement('iframe');
      marco.id = 'expoMarco'; marco.title = T('Página para imprimir'); marco.setAttribute('aria-hidden', 'true');
      marco.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(marco);
      await new Promise(ok => { marco.onload = ok; marco.srcdoc = h; });
      est.imprimirMarco(marco);
      estado(T('En el diálogo de impresión elige «Guardar como PDF».'));
    });
  }

  /* ---------------- cuadros ---------------- */
  function cuadros() {
    const lista = [];
    let n = 0;
    R().elementos().forEach((x, k) => x.rep.cuadros.forEach(q => { n++; lista.push({ numero: n, cuadro: q, analisis: (k + 1) + '. ' + x.titulo, visibles: x.visibles }); }));
    return lista;
  }
  const xlsx = b => (hayReporte() ? exportar(b, T('Armando la hoja de cálculo…'), 'xlsx') : null);
  const latex = b => (hayReporte() ? exportar(b, T('Armando los cuadros en LaTeX…'), 'latex') : null);

  /* ---------------- figuras ---------------- */
  function figurasZip(b) {
    if (!hayReporte()) return null;
    const k = F().lista().length;
    if (!k) { if (L()) L().toast(T('Los análisis del reporte no tienen figuras.'), { type: 'warning' }); return null; }
    return exportar(b, T('Exportando {k} figuras…', { k }), 'figuras', !!($('#expoTiff') && $('#expoTiff').checked));
  }

  /* ---------------- proyecto .labg ---------------- */
  function estilos() {
    const e = { figuras: { barras: R().opciones.barras, anchoCm: R().opciones.anchoCm }, editor: null, estudio: {} };
    try {
      e.editor = JSON.parse(localStorage.getItem('sigmapro:figedit') || 'null');
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('labg-fstudio:sigmapro:')) e.estudio[k.slice('labg-fstudio:sigmapro:'.length)] = JSON.parse(localStorage.getItem(k)); }
    } catch (x) { /* sin almacenamiento */ }
    return e;
  }
  function guardarProyecto(b) {
    const d = SP.app.datos;
    if (!d || !d.hoja) { if (L()) L().toast(T('No hay datos que guardar.'), { type: 'warning' }); return null; }
    return exportar(b, T('Guardando el proyecto…'), 'proyecto');
  }
  /** Carga un proyecto abierto (o un trabajo recuperado del guardado automático, con op.recuperado). */
  function aplicarProyecto(p, op) {
    op = op || {};
    if (p.hoja) SP.datosUI.cargar(p.hoja, p.origen || T('Proyecto .labg'));
    if (p.hoja && p.filtro && p.filtro.expresion) {
      const e = SP.datosUI.estado();
      e.filtro = { expresion: p.filtro.expresion, filas: [] };
      SP.datosUI.cambio();
    }
    const es = p.estilos || {};
    try {
      if (es.editor) localStorage.setItem('sigmapro:figedit', JSON.stringify(es.editor));
      for (const [k, v] of Object.entries(es.estudio || {})) localStorage.setItem('labg-fstudio:sigmapro:' + k, JSON.stringify(v));
    } catch (x) { /* sin almacenamiento */ }
    if (es.figuras) Object.assign(R().opciones, es.figuras);
    R().reemplazar(p.reporte || {});
    const n = p.hoja ? p.hoja.n : 0, k = ((p.reporte || {}).items || []).length;
    if (op.recuperado) {
      if (L()) L().toast(T('Trabajo recuperado: {n} filas y {k} análisis; los resultados se recalcularon con sus datos.', { n, k }), { type: 'success' });
      SP.app.ir(k ? 5 : 2);
      return;
    }
    estado(T('Proyecto abierto: {n} filas, {k} análisis en el reporte.', { n, k }));
    if (L()) L().toast(T('Proyecto abierto: los resultados se recalcularon con sus datos.'), { type: 'success' });
    SP.app.ir(5);
  }
  async function abrirProyecto(archivo) {
    try {
      const p = SP.proyecto.abrir(new Uint8Array(await archivo.arrayBuffer()));
      const v = p.verificacion, hayAlgo = (SP.app.datos && SP.app.datos.hoja) || R().items.length;
      const cambiados = v.archivos.filter(a => !a.ok).map(a => a.ruta);
      const cuerpo = (v.ok ? `<p>${esc(T('Las huellas SHA-256 de los {k} archivos coinciden con el manifiesto: el proyecto está tal como se guardó.', { k: v.archivos.length }))}</p>`
        : `<p class="msg msg-warning"><strong>${esc(T('Algunos archivos cambiaron después de guardarse (su huella no coincide): {l}.', { l: cambiados.join(', ') || T('el manifiesto') }))}</strong></p>`) +
        `<p>${esc(T('Guardado el {f} con SigmaPro {v}: {n} filas, {c} columnas y {k} análisis.', { f: new Date(p.manifiesto.creado).toLocaleString(SP.LOCAL), v: p.manifiesto.version_programa, n: p.hoja.n, c: p.hoja.p, k: (p.reporte.items || []).length }))}</p>` +
        (hayAlgo ? `<p>${esc(T('Abrirlo reemplaza los datos y el reporte actuales.'))}</p>` : '');
      if (v.ok && !hayAlgo) { aplicarProyecto(p); return; }
      SP.ui.dialogo({ titulo: T('Abrir el proyecto «{t}»', { t: p.manifiesto.titulo || archivo.name }), cuerpo, botones: [
        { texto: T('Cancelar'), tipo: 'secundario', accion: () => true },
        { texto: v.ok ? T('Abrir') : T('Abrir de todos modos'), tipo: 'primario', accion: () => { aplicarProyecto(p); return true; } },
      ] });
    } catch (e) {
      if (!(e instanceof SP.ErrorSP)) console.error(e);
      if (L()) L().toast(e.message + (e.arreglo ? ' ' + e.arreglo : ''), { type: 'error' });
    }
  }

  /* ---------------- bloque 7 ---------------- */
  const est = SP.app.exportar = { docx, html, imprimir, xlsx, latex, figurasZip, guardarProyecto, abrirProyecto, aplicarProyecto, paginaHtml, items, construir, estilos,
    imprimirMarco: marco => marco.contentWindow.print() };
  function pintar() {
    const r = R(), n = r.items.length;
    $('#expoResumen').innerHTML = n ? esc(T('El reporte tiene {k} análisis{t}.', { k: n, t: r.titulo ? T(': «{t}»', { t: r.titulo }) : '' }))
      : esc(T('El reporte está vacío: agrega análisis desde Explorar o Análisis para exportarlo.')) + ' ' +
        `<button type="button" class="btn btn-secondary btn-sm" data-ir="4">${esc(T('Ir a Análisis'))}</button> <button type="button" class="btn btn-ghost btn-sm" data-ir="3">${esc(T('Ir a Explorar'))}</button>`;
    document.querySelectorAll('#panel-7 [data-expo]:not([data-expo="abrir"]):not([data-expo="proyecto"])').forEach(b => { b.disabled = !n; });
    const pr = $('[data-expo="proyecto"]'); if (pr) pr.disabled = !(SP.app.datos && SP.app.datos.hoja);
    const hoja = $('#expoHoja'); if (hoja) hoja.value = r.opciones.hoja;
    const cod = $('#expoCodigo'); if (cod) cod.checked = !!r.opciones.codigo;
    const det = $('#expoDetalles'); if (det) det.checked = !!r.opciones.detalles;
    const res = $('#expoClaro'); if (res) res.checked = r.opciones.resumen !== false;
    const lec = $('#expoLectura'); if (lec) lec.checked = r.opciones.lectura !== false;
    const met = $('#expoMetodos'); if (met) met.checked = r.opciones.metodos !== false;
  }
  function iniciar() {
    const panel = $('#panel-7');
    if (!panel) return;
    panel.addEventListener('click', e => {
      const b = e.target.closest('[data-expo]');
      if (!b) return;
      const acc = b.dataset.expo;
      if (acc === 'abrir') { $('#expoArchivo').click(); return; }
      ({ docx, html, markdown, imprimir, xlsx, latex, figuras: figurasZip, proyecto: guardarProyecto }[acc] || (() => {}))(b);
    });
    panel.addEventListener('change', e => {
      const el = e.target, o = R().opciones;
      if (el.id === 'expoHoja') o.hoja = el.value;
      else if (el.id === 'expoCodigo') o.codigo = el.checked;
      else if (el.id === 'expoDetalles') o.detalles = el.checked;
      else if (el.id === 'expoClaro') o.resumen = el.checked;
      else if (el.id === 'expoLectura') o.lectura = el.checked;
      else if (el.id === 'expoMetodos') o.metodos = el.checked;
      else return;
      try { localStorage.setItem('sigmapro.reporte.opciones', JSON.stringify(o)); } catch (x) { /* nada */ }
    });
    $('#expoArchivo').addEventListener('change', e => { const f = e.target.files && e.target.files[0]; if (f) abrirProyecto(f); e.target.value = ''; });
    const abrirVacio = $('#repAbrir');
    if (abrirVacio) abrirVacio.addEventListener('click', () => $('#expoArchivo').click());
    document.addEventListener('sp:reporte', pintar);
    document.addEventListener('sp:datos', pintar);
    document.addEventListener('sp:bloque', ev => { if (ev.detail.bloque === 7) pintar(); });
    pintar();
  }
  SP.alArrancar(iniciar);
})();

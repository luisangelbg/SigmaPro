/* SigmaPro — bloque 8: el reporte de validación dentro de la app.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Lee window.SP_VALIDACION, que escribe tests/correr.mjs en js/generado/validacion.js
   cada vez que corren las pruebas. Es la misma información que el reporte publicado
   en tests/reporte-validacion.html. Debajo, las otras comprobaciones (window.SP_COMPROBACIONES,
   js/generado/comprobaciones.js): el código R equivalente, las exportaciones, el rendimiento,
   la privacidad, el uso sin conexión y la accesibilidad.
   Hito 5.9 (rendimiento en el teléfono): el resumen se pinta en cuanto se abre el bloque, con lo que la app carga al
   arrancar (window.SP_VALIDACION_RESUMEN); la tabla muestra los primeros 120 casos y los demás conforme se baja por
   ella (o con «Mostrar más casos»); el buscador y los filtros siguen viendo todos. El detalle de cada caso se arma
   cuando se abre. */
(function () {
  'use strict';
  const T = SP.T;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 2.2e-16 → «2.2 × 10⁻¹⁶»; 0 → «0» */
  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function cientifico(x) {
    if (x === null || x === undefined || Number.isNaN(x)) return '—';
    if (x === 0) return '0';
    if (x >= 1e-3 && x < 1e4) return String(Number(x.toPrecision(3)));
    const [m, e] = x.toExponential(1).split('e');
    return m + ' × 10' + String(Number(e)).replace(/[-0-9]/g, c => SUP[c]);
  }
  const miles = n => Number(n).toLocaleString(SP.LOCAL);

  function nombreObjetivo(o) {
    if (!o) return '';
    if (o.tipo === 'metodo') {
      const f = SP.metodos && SP.metodos[o.nombre];
      return T('Método') + ' · ' + (f ? f.nombre : o.nombre);
    }
    const nom = SP.nombresFunciones && SP.nombresFunciones[o.nombre] && T(SP.nombresFunciones[o.nombre]);
    return (nom || T('Función del núcleo')) + ' · SP.' + o.nombre;
  }
  const nombreCaso = c => (c.id || '').split('/').slice(1).join('/');

  let filtro = 'todos', busqueda = '';

  function detalle(c) {
    const paq = Object.entries((c.referencia && c.referencia.paquetes) || {}).map(([p, v]) => p + ' ' + v).join(', ');
    const cmp = c.comparacion || {};
    const tol = cmp.tol !== undefined ? cmp.tol : 1e-6;
    const regla = (cmp.modo === 'relativo' ? T('relativa') : T('mixta')) + ', ' + T('tolerancia') + ' ' + cientifico(tol) +
      (cmp.tolerancias ? ' · ' + T('con tolerancias propias por ruta') : '');
    let h = '<dl>' +
      '<dt>' + T('Qué prueba') + '</dt><dd>' + esc(T(c.titulo)) + '</dd>' +
      '<dt>' + T('Referencia') + '</dt><dd>' + esc((c.referencia && c.referencia.r) || '') + (paq ? ' · ' + esc(paq) : '') + '</dd>' +
      '<dt>' + T('Comparación') + '</dt><dd>' + esc(regla) + '</dd>' +
      '<dt>' + T('Valor más alejado') + '</dt><dd>' + esc(c.peor || '—') + '</dd>';
    if (c.error) h += '<dt>' + T('Error') + '</dt><dd>' + esc(c.error) + '</dd>';
    if (c.fallas && c.fallas.length) {
      h += '<dt>' + T('Fallas') + '</dt><dd>' + c.fallas.map(f => esc(f.ruta + ': ' + f.motivo + (f.dif !== null && f.dif !== undefined ? ' (dif. ' + cientifico(f.dif) + ')' : ''))).join('<br>') + '</dd>';
    }
    h += '</dl>';
    if (c.referencia && c.referencia.codigo) h += '<pre aria-label="' + T('Código R de la referencia') + '">' + esc(c.referencia.codigo) + '</pre>';
    return h;
  }

  const TANDA = 120;
  let lista = [], turno = 0, filasHTML = [], mostradas = 0, vigia = null;
  function pintarTabla(V) {
    const tbody = $('#valTabla tbody');
    if (!tbody || !V) return;
    const q = busqueda.trim().toLowerCase();
    const visibles = V.casos.filter(c =>
      (filtro === 'todos' || (filtro === 'aprobados' ? c.aprobado : !c.aprobado)) &&
      (!q || [c.id, c.titulo, c.fuente, nombreObjetivo(c.objetivo)].join(' ').toLowerCase().includes(q)));
    lista = visibles;
    const filas = [];
    let grupo = null;
    visibles.forEach((c, i) => {
      const g = nombreObjetivo(c.objetivo);
      let h = '';
      if (g !== grupo) { grupo = g; h += '<tr class="grupo"><td colspan="7">' + esc(g) + '</td></tr>'; }
      h += '<tr><td class="izq">' + esc(T(c.titulo || '') || nombreCaso(c)) + '<br><span class="muted small">' + esc(nombreCaso(c)) + '</span></td><td class="izq">' + esc(T(c.fuente || '')) + '</td>' +
        '<td>' + esc(c.clase) + '</td><td>' + miles(c.valores || 0) + '</td><td class="nowrap">' + cientifico(c.difEscaladaMax) + '</td>' +
        '<td><span class="veredicto ' + (c.aprobado ? 'ok' : 'falla') + '">' + (c.aprobado ? T('Aprobado') : T('Falla')) + '</span></td>' +
        '<td><button type="button" class="det" aria-expanded="false" data-caso="' + i + '">' + T('Detalles') + '</button></td></tr>';
      filas.push(h);
    });
    ++turno;
    filasHTML = filas; mostradas = 0;
    if (!filas.length) { tbody.innerHTML = '<tr><td colspan="7" class="izq muted">' + T('Ningún caso coincide con el filtro.') + '</td></tr>'; return; }
    tbody.innerHTML = '';
    masFilas();
  }
  /** La siguiente tanda de casos; al final queda un renglón con «Mostrar más casos» mientras falten. */
  function masFilas() {
    const tbody = $('#valTabla tbody');
    if (!tbody || mostradas >= filasHTML.length) return;
    const previo = tbody.querySelector('tr.val-mas');
    const conFoco = !!(previo && previo.contains(document.activeElement));
    if (previo) previo.remove();
    const desde = mostradas;
    mostradas = Math.min(filasHTML.length, mostradas + TANDA);
    tbody.insertAdjacentHTML('beforeend', filasHTML.slice(desde, mostradas).join('') + (mostradas < filasHTML.length
      ? '<tr class="val-mas"><td colspan="7" class="izq"><button type="button" class="btn btn-ghost btn-sm" data-val-mas>' + esc(T('Mostrar más casos ({a} de {n})', { a: mostradas, n: filasHTML.length })) + '</button></td></tr>' : ''));
    /* con el teclado, el foco sigue en el primer caso nuevo */
    if (conFoco) { const b = tbody.querySelectorAll('button.det')[desde]; if (b) b.focus(); }
    /* y al acercarse al final de la tabla, la siguiente tanda llega sola */
    const fin = tbody.querySelector('tr.val-mas');
    if (vigia) vigia.disconnect();
    if (fin && typeof IntersectionObserver === 'function') {
      vigia = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) masFilas(); }, { rootMargin: '400px 0px' });
      vigia.observe(fin);
    }
  }
  /** El detalle de un caso, armado la primera vez que se abre. */
  function alternarDetalle(boton) {
    let fila = boton.hasAttribute('aria-controls') ? document.getElementById(boton.getAttribute('aria-controls')) : null;
    if (!fila) {
      const c = lista[+boton.dataset.caso];
      if (!c) return;
      const id = 'valDet' + turno + '-' + boton.dataset.caso;
      boton.closest('tr').insertAdjacentHTML('afterend', '<tr class="detalle" id="' + id + '" hidden><td colspan="7">' + detalle(c) + '</td></tr>');
      boton.setAttribute('aria-controls', id);
      fila = document.getElementById(id);
    }
    const abrir = boton.getAttribute('aria-expanded') !== 'true';
    boton.setAttribute('aria-expanded', String(abrir));
    fila.hidden = !abrir;
  }

  /* la mayor diferencia puede pasar de 10⁻⁶ en los casos con una tolerancia propia, documentada en el caso (clase D:
     ARIMA, GLMM): la nota lo dice, para que no parezca una falla */
  function notaLimite(V) {
    const k = Array.isArray(V.casos) ? V.casos.filter(c => c.aprobado && c.difEscaladaMax > 1e-6).length : (V.conTolerancia || 0);
    return !k ? T('escalada; el límite es 10⁻⁶')
      : k === 1 ? T('escalada; el límite es 10⁻⁶, salvo un caso con su tolerancia documentada')
        : T('escalada; el límite es 10⁻⁶, salvo {k} casos con su tolerancia documentada', { k });
  }
  /** Las tejas del resumen y la fecha, del reporte completo o del resumen que la app carga al arrancar. */
  function pintarResumen(V) {
    const r = V.resumen;
    const fecha = V.generado ? new Date(V.generado) : null;
    $('#valFecha').textContent = fecha ? T('Generado el {f}', { f: fecha.toLocaleDateString(SP.LOCAL, { year: 'numeric', month: 'long', day: 'numeric' }) }) : '';
    $('#valTejas').innerHTML =
      '<div class="teja"><div class="k">' + T('Casos aprobados') + '</div><div class="v">' + r.aprobados + ' <small>' + T('de {n}', { n: r.casos }) + '</small></div></div>' +
      '<div class="teja"><div class="k">' + T('Valores comparados') + '</div><div class="v">' + miles(r.valores) + '</div></div>' +
      '<div class="teja"><div class="k">' + T('Mayor diferencia') + '</div><div class="v">' + cientifico(r.difEscaladaMax) + '</div><div class="nota">' + notaLimite(V) + '</div></div>' +
      '<div class="teja"><div class="k">' + T('Referencia') + '</div><div class="v" style="font-size:var(--fs-lg)">' + esc((V.referencias || []).map(s => s.replace(/^R version ([\d.]+).*$/, 'R $1')).join(', ')) + '</div><div class="nota">' + esc(r.objetivos === 1 ? T('1 función o método') : T('{n} funciones y métodos', { n: r.objetivos })) + '</div></div>';
  }
  function pintar() {
    const V = window.SP_VALIDACION;
    const vacio = $('#valVacio'), cont = $('#valContenido');
    if (!vacio || !cont) return;
    if (!V || !Array.isArray(V.casos) || !V.casos.length) { vacio.hidden = false; cont.hidden = true; return; }
    vacio.hidden = true; cont.hidden = false;
    pintarResumen(V);
    pintarTabla(V);
    cont.classList.remove('val-cargando');
    pintarOtras();
    if (window.LABG) window.LABG.markStep(8, V.resumen.fallidos ? 'warn' : 'done');
  }
  /* lo que se puede mostrar antes de que llegue el reporte completo: el resumen, las otras comprobaciones y la tabla
     con un aviso de que sus casos vienen en camino */
  function pintarAntes() {
    const VR = window.SP_VALIDACION_RESUMEN, cont = $('#valContenido'), tbody = $('#valTabla tbody');
    if (!VR || !VR.resumen || !cont) return false;
    cont.hidden = false;
    pintarResumen(VR);
    pintarOtras();
    if (tbody && !tbody.children.length) tbody.innerHTML = '<tr><td colspan="7" class="izq muted">' + esc(T('Cargando los casos…')) + '</td></tr>';
    return true;
  }
  /* las comprobaciones que no son casos contra R */
  const ORDEN = ['codigo-r', 'exportar', 'rendimiento', 'sin-conexion', 'accesibilidad'];
  /* el título de una comprobación en el idioma de la interfaz; su resumen y su detalle los escriben las pruebas en
     español (con la interfaz en inglés se marcan como texto en español y una nota lo dice) */
  function tituloOtra(x) {
    const m = /^Rendimiento con ([\d,. ]+) filas$/.exec(x.titulo || '');
    return m ? T('Rendimiento con {n} filas', { n: m[1] }) : T(x.titulo || '');
  }
  function pintarOtras() {
    const C = window.SP_COMPROBACIONES || {}, el = $('#valOtras');
    if (!el) return;
    const ingles = SP.IDIOMA === 'en', es = ingles ? ' lang="es"' : '';
    let nota = $('#valOtrasNota');
    if (ingles && !nota) { nota = document.createElement('p'); nota.id = 'valOtrasNota'; nota.className = 'small muted'; nota.textContent = T('El resumen y el detalle de cada comprobación los escriben las pruebas, en español.'); el.parentNode.insertBefore(nota, el); }
    const claves = ORDEN.filter(k => C[k]).concat(Object.keys(C).filter(k => !ORDEN.includes(k)));
    el.closest('.card').hidden = !claves.length;
    el.innerHTML = claves.map(k => {
      const x = C[k], f = x.fecha ? new Date(x.fecha).toLocaleDateString(SP.LOCAL, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      return '<li><p class="val-otra-cabeza"><span class="veredicto ' + (x.ok ? 'ok' : 'falla') + '">' + (x.ok ? T('Aprobado') : T('Con fallas')) + '</span> <b>' + esc(tituloOtra(x)) + '</b>' +
        (f ? ' <span class="small muted">· ' + esc(f) + '</span>' : '') + '</p><p class="small"' + es + '>' + esc(x.resumen) + '</p>' +
        (x.renglones && x.renglones.length ? '<details class="exp-extras"><summary>' + esc(T('Detalle')) + '</summary><ul class="small"' + es + '>' + x.renglones.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul></details>' : '') + '</li>';
    }).join('');
  }

  /* el reporte completo (js/generado/validacion.js, unos 700 KB) se carga la primera vez que se abre el bloque; al
     arrancar, la marca del bloque en la barra sale del resumen que carga la app */
  let listo = null;
  function cargar() {
    if (!listo) {
      const vacio = $('#valVacio'), estado = $('#valCargando');
      if (estado) estado.hidden = false;
      /* el bloque se muestra con el resumen (sp:validacion: la página con enlace directo a Validación espera esta señal) y
         los casos llegan después */
      let avisado = false;
      const avisar = () => { if (!avisado) { avisado = true; document.dispatchEvent(new Event('sp:validacion')); } };
      if (!window.SP_VALIDACION && pintarAntes()) { if (estado) estado.hidden = true; avisar(); }
      listo = (window.SP_VALIDACION ? Promise.resolve() : SP.ui.cargarScript('js/generado/validacion.js'))
        .then(() => { if (estado) estado.hidden = true; pintar(); avisar(); })
        .catch(() => { if (estado) estado.hidden = true; if (vacio) vacio.hidden = false; listo = null; });
    }
    return listo;
  }
  SP.app.validacion = { listo: cargar };
  function iniciar() {
    const VR = window.SP_VALIDACION_RESUMEN;
    if (VR && VR.resumen && window.LABG) window.LABG.markStep(8, VR.resumen.fallidos ? 'warn' : 'done');
    const panel = $('#panel-8');
    if (panel && panel.classList.contains('active')) cargar();
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 8) cargar(); });
    const cont = $('#valContenido');
    if (!cont) return;
    cont.addEventListener('click', e => {
      const f = e.target.closest('[data-filtro]');
      if (f) {
        filtro = f.dataset.filtro;
        cont.querySelectorAll('[data-filtro]').forEach(b => b.setAttribute('aria-pressed', String(b === f)));
        pintarTabla(window.SP_VALIDACION);
        return;
      }
      if (e.target.closest('[data-val-mas]')) { masFilas(); return; }
      const d = e.target.closest('button.det');
      if (d) alternarDetalle(d);
    });
    const b = $('#valBuscar');
    if (b) b.addEventListener('input', () => { busqueda = b.value; pintarTabla(window.SP_VALIDACION); });
  }

  SP.alArrancar(iniciar);
})();

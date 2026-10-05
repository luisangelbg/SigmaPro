/* SigmaPro — bloque 8: el reporte de validación dentro de la app.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Lee window.SP_VALIDACION, que escribe tests/correr.mjs en js/generado/validacion.js
   cada vez que corren las pruebas. Es la misma información que el reporte publicado
   en tests/reporte-validacion.html. Debajo, las otras comprobaciones (window.SP_COMPROBACIONES,
   js/generado/comprobaciones.js): el código R equivalente, las exportaciones, el rendimiento,
   la privacidad, el uso sin conexión y la accesibilidad. */
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

  function pintarTabla(V) {
    const tbody = $('#valTabla tbody');
    const q = busqueda.trim().toLowerCase();
    const visibles = V.casos.filter(c =>
      (filtro === 'todos' || (filtro === 'aprobados' ? c.aprobado : !c.aprobado)) &&
      (!q || [c.id, c.titulo, c.fuente, nombreObjetivo(c.objetivo)].join(' ').toLowerCase().includes(q)));
    let h = '', grupo = null, i = 0;
    for (const c of visibles) {
      const g = nombreObjetivo(c.objetivo);
      if (g !== grupo) { grupo = g; h += '<tr class="grupo"><td colspan="7">' + esc(g) + '</td></tr>'; }
      const idDet = 'valDet' + (i++);
      h += '<tr><td class="izq">' + esc(T(c.titulo || '') || nombreCaso(c)) + '<br><span class="muted small">' + esc(nombreCaso(c)) + '</span></td><td class="izq">' + esc(T(c.fuente || '')) + '</td>' +
        '<td>' + esc(c.clase) + '</td><td>' + miles(c.valores || 0) + '</td><td class="nowrap">' + cientifico(c.difEscaladaMax) + '</td>' +
        '<td><span class="veredicto ' + (c.aprobado ? 'ok' : 'falla') + '">' + (c.aprobado ? T('Aprobado') : T('Falla')) + '</span></td>' +
        '<td><button type="button" class="det" aria-expanded="false" aria-controls="' + idDet + '">' + T('Detalles') + '</button></td></tr>' +
        '<tr class="detalle" id="' + idDet + '" hidden><td colspan="7">' + detalle(c) + '</td></tr>';
    }
    if (!visibles.length) h = '<tr><td colspan="7" class="izq muted">' + T('Ningún caso coincide con el filtro.') + '</td></tr>';
    tbody.innerHTML = h;
  }

  /* la mayor diferencia puede pasar de 10⁻⁶ en los casos con una tolerancia propia, documentada en el caso (clase D:
     ARIMA, GLMM): la nota lo dice, para que no parezca una falla */
  function notaLimite(V) {
    const k = V.casos.filter(c => c.aprobado && c.difEscaladaMax > 1e-6).length;
    return !k ? T('escalada; el límite es 10⁻⁶')
      : k === 1 ? T('escalada; el límite es 10⁻⁶, salvo un caso con su tolerancia documentada')
        : T('escalada; el límite es 10⁻⁶, salvo {k} casos con su tolerancia documentada', { k });
  }
  function pintar() {
    const V = window.SP_VALIDACION;
    const vacio = $('#valVacio'), cont = $('#valContenido');
    if (!vacio || !cont) return;
    if (!V || !Array.isArray(V.casos) || !V.casos.length) { vacio.hidden = false; cont.hidden = true; return; }
    vacio.hidden = true; cont.hidden = false;
    const r = V.resumen;
    const fecha = V.generado ? new Date(V.generado) : null;
    $('#valFecha').textContent = fecha ? T('Generado el {f}', { f: fecha.toLocaleDateString(SP.LOCAL, { year: 'numeric', month: 'long', day: 'numeric' }) }) : '';
    $('#valTejas').innerHTML =
      '<div class="teja"><div class="k">' + T('Casos aprobados') + '</div><div class="v">' + r.aprobados + ' <small>' + T('de {n}', { n: r.casos }) + '</small></div></div>' +
      '<div class="teja"><div class="k">' + T('Valores comparados') + '</div><div class="v">' + miles(r.valores) + '</div></div>' +
      '<div class="teja"><div class="k">' + T('Mayor diferencia') + '</div><div class="v">' + cientifico(r.difEscaladaMax) + '</div><div class="nota">' + notaLimite(V) + '</div></div>' +
      '<div class="teja"><div class="k">' + T('Referencia') + '</div><div class="v" style="font-size:var(--fs-lg)">' + esc((V.referencias || []).map(s => s.replace(/^R version ([\d.]+).*$/, 'R $1')).join(', ')) + '</div><div class="nota">' + esc(r.objetivos === 1 ? T('1 función o método') : T('{n} funciones y métodos', { n: r.objetivos })) + '</div></div>';
    pintarTabla(V);
    pintarOtras();
    if (window.LABG) window.LABG.markStep(8, r.fallidos ? 'warn' : 'done');
  }
  /* las comprobaciones que no son casos contra R */
  const ORDEN = ['codigo-r', 'exportar', 'rendimiento', 'sin-conexion', 'accesibilidad'];
  function pintarOtras() {
    const C = window.SP_COMPROBACIONES || {}, el = $('#valOtras');
    if (!el) return;
    const claves = ORDEN.filter(k => C[k]).concat(Object.keys(C).filter(k => !ORDEN.includes(k)));
    el.closest('.card').hidden = !claves.length;
    el.innerHTML = claves.map(k => {
      const x = C[k], f = x.fecha ? new Date(x.fecha).toLocaleDateString(SP.LOCAL, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      return '<li><p class="val-otra-cabeza"><span class="veredicto ' + (x.ok ? 'ok' : 'falla') + '">' + (x.ok ? T('Aprobado') : T('Con fallas')) + '</span> <b>' + esc(x.titulo) + '</b>' +
        (f ? ' <span class="small muted">· ' + esc(f) + '</span>' : '') + '</p><p class="small">' + esc(x.resumen) + '</p>' +
        (x.renglones && x.renglones.length ? '<details class="exp-extras"><summary>' + esc(T('Detalle')) + '</summary><ul class="small">' + x.renglones.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul></details>' : '') + '</li>';
    }).join('');
  }

  function iniciar() {
    pintar();
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
      const d = e.target.closest('button.det');
      if (d) {
        const fila = document.getElementById(d.getAttribute('aria-controls'));
        const abrir = d.getAttribute('aria-expanded') !== 'true';
        d.setAttribute('aria-expanded', String(abrir));
        fila.hidden = !abrir;
      }
    });
    const b = $('#valBuscar');
    if (b) b.addEventListener('input', () => { busqueda = b.value; pintarTabla(window.SP_VALIDACION); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

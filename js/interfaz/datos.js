/* SigmaPro — bloque 2: Datos.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Estado compartido con los demás bloques:
     SP.app.datos = { hoja, filtro: { expresion, filas: [..] } | null, origen }
     evento 'sp:datos' en document cada vez que cambian los datos o el filtro.
   SP.app.tablaAnalisis() da la tabla (filtrada) que usan los análisis. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const estado = SP.app.datos = { hoja: null, filtro: null, origen: '', anterior: null };
  let rejilla = null, seleccionada = 0;

  const NOMBRE_TIPO = { numerica: 'numérica', factor: 'factor', fecha: 'fecha', texto: 'texto', id: 'identificador' };

  SP.app.tablaAnalisis = () => (estado.hoja ? estado.hoja.aTabla(estado.filtro ? estado.filtro.filas : undefined) : null);
  /** Carga una hoja hecha en otro bloque (p. ej. el diseño generado en Análisis), conservando la anterior para volver. */
  SP.app.cargarHoja = (hoja, origen) => cargar(hoja, origen, true);

  /* ---------------- cargar ---------------- */
  function cargar(hoja, origen, conservarAnterior) {
    estado.anterior = conservarAnterior ? { hoja: estado.hoja, origen: estado.origen } : null;
    estado.hoja = hoja; estado.filtro = null; estado.origen = origen || '';
    seleccionada = 0;
    rejilla.fijarHoja(hoja);
    cambio();
    if (L()) L().announce(T('Datos cargados: {n} filas y {p} columnas', { n: hoja.n, p: hoja.p }));
  }
  /** Después de cualquier cambio: paneles, filtro y aviso a los demás bloques. */
  function cambio() {
    const h = estado.hoja;
    if (h && estado.filtro) {
      try { estado.filtro.filas = SP.expresiones.filtrar(h, estado.filtro.expresion); }
      catch (e) { estado.filtro = null; if (L()) L().toast(T('El filtro dejó de ser válido y se quitó: {m}', { m: e.message }), { type: 'warning' }); }
    }
    pintar();
    document.dispatchEvent(new CustomEvent('sp:datos', { detail: { hoja: h, filtro: estado.filtro } }));
    if (L()) L().markStep(2, h && h.n ? 'done' : null);
  }

  /* ---------------- pintar ---------------- */
  function pintar() {
    const h = estado.hoja, hay = !!(h && h.p);
    $('#datInicio').hidden = hay;
    $('#datTrabajo').hidden = !hay;
    for (const b of ['#datCalcular', '#datTransformar', '#datFiltrar', '#datReformar']) $(b).disabled = !hay;
    $('#datDeshacer').disabled = !(h && h.puedeDeshacer());
    $('#datRehacer').disabled = !(h && h.puedeRehacer());
    $('#datDeshacer').title = h && h.puedeDeshacer() ? T('Deshacer: {d} (Ctrl+Z)', { d: h.descripcionDeshacer() }) : T('Nada que deshacer');
    $('#datRehacer').title = h && h.puedeRehacer() ? T('Rehacer: {d} (Ctrl+Y)', { d: h.descripcionRehacer() }) : T('Nada que rehacer');
    $('#datVolver').hidden = !estado.anterior;
    if (!hay) return;
    seleccionada = Math.min(seleccionada, h.p - 1);
    pintarLista(); pintarDetalle(); pintarEstado(); pintarFiltro(); pintarEstructura();
  }

  function pintarLista() {
    const h = estado.hoja;
    $('#datLista').innerHTML = h.cols.map((c, j) => {
      const f = h.faltantes(j);
      const extra = c.tipo === 'factor' ? ' · ' + c.niveles.length : '';
      return `<li><button type="button" class="dat-var${j === seleccionada ? ' activa' : ''}" data-j="${j}" aria-pressed="${j === seleccionada}">` +
        `<span class="nom">${esc(c.nombre)}${c.origen === 'calculada' ? ' <span aria-label="' + esc(T('calculada')) + '">ƒ</span>' : c.origen === 'transformada' ? ' <span aria-label="' + esc(T('transformada')) + '">↻</span>' : ''}</span>` +
        `<span class="tipo t-${c.tipo}">${esc(T(NOMBRE_TIPO[c.tipo]) + extra)}</span>` +
        (f ? `<span class="falt" title="${esc(T('{k} faltantes', { k: f }))}">${f} ${esc(T('falt.'))}</span>` : '') + '</button></li>';
    }).join('');
  }

  function pintarDetalle() {
    const h = estado.hoja, j = seleccionada, c = h.cols[j];
    const filas = estado.filtro ? estado.filtro.filas : null;
    let cuerpo = '';
    if (c.tipo === 'numerica' || c.tipo === 'fecha') {
      const vals = filas ? Float64Array.from(filas, i => c.datos[i]) : c.datos;
      const r = SP.num.resumen(vals);
      const f = c.tipo === 'fecha' ? x => SP.tipos.textoFecha(x) : x => SP.ui.num(x);
      cuerpo = `<dl class="dat-kv"><dt>${T('n')}</dt><dd>${r.n}</dd><dt>${T('Faltantes')}</dt><dd>${r.faltantes}</dd>` +
        (c.tipo === 'numerica' ? `<dt>${T('Media')}</dt><dd>${f(r.media)}</dd><dt>${T('DE')}</dt><dd>${f(r.de)}</dd>` : '') +
        `<dt>${T('Mínimo')}</dt><dd>${f(r.min)}</dd><dt>${T('Máximo')}</dt><dd>${f(r.max)}</dd></dl>`;
    } else if (c.tipo === 'factor') {
      const cuenta = new Map(c.niveles.map(n => [n, 0]));
      let falt = 0;
      const idx = filas || Array.from({ length: h.n }, (_, i) => i);
      for (const i of idx) { const v = c.datos[i]; if (v === null) falt++; else cuenta.set(v, (cuenta.get(v) || 0) + 1); }
      const lista = [...cuenta].slice(0, 12).map(([k, v]) => `<li><span>${esc(k)}</span><span>${v}</span></li>`).join('');
      cuerpo = `<p class="small muted">${T('{k} niveles, en este orden:', { k: c.niveles.length })}</p><ul class="dat-niveles">${lista}</ul>` +
        (c.niveles.length > 12 ? `<p class="small muted">${T('… y {k} más', { k: c.niveles.length - 12 })}</p>` : '') +
        (falt ? `<p class="small">${T('Faltantes: {k}', { k: falt })}</p>` : '') +
        `<button type="button" class="btn btn-ghost btn-sm" data-accion="niveles">${T('Ordenar niveles…')}</button>`;
    } else {
      cuerpo = `<p class="small muted">${c.tipo === 'id' ? T('Identifica cada unidad; no entra a los análisis.') : T('Texto libre; entra a los análisis como factor si se usa.')}</p>`;
    }
    const opciones = Object.keys(NOMBRE_TIPO).map(t => `<option value="${t}"${t === c.tipo ? ' selected' : ''}>${esc(T(NOMBRE_TIPO[t]))}</option>`).join('');
    $('#datDetalle').innerHTML =
      `<h4>${esc(c.nombre)}</h4>` +
      (c.razon ? `<p class="small dat-razon">${esc(c.razon)}</p>` : '') +
      (c.detalle ? `<p class="small muted">${esc(c.detalle)}</p>` : '') +
      `<label class="field"><span class="small">${T('Tipo')}</span><select id="datTipo">${opciones}</select></label>` +
      cuerpo +
      (c.tipo === 'numerica' ? `<button type="button" class="btn btn-ghost btn-sm" data-accion="transformar">${T('Transformar…')}</button>` : '');
  }

  function pintarEstado() {
    const h = estado.hoja;
    let falt = 0;
    for (let j = 0; j < h.p; j++) falt += h.faltantes(j);
    $('#datEstado').textContent = [
      T('{n} filas', { n: h.n.toLocaleString(SP.LOCAL) }), T('{p} columnas', { p: h.p }),
      falt ? T('{k} celdas faltantes', { k: falt.toLocaleString(SP.LOCAL) }) : T('sin faltantes'),
      estado.origen,
    ].filter(Boolean).join(' · ');
  }
  function pintarFiltro() {
    const a = $('#datFiltroAviso'), f = estado.filtro;
    a.hidden = !f;
    if (f) {
      a.innerHTML = `<span>${T('Filtro activo')}: <code>${esc(f.expresion)}</code> — ${T('pasan {k} de {n} filas; los análisis usan solo esas.', { k: f.filas.length, n: estado.hoja.n })}</span> ` +
        `<button type="button" class="btn btn-ghost btn-sm" id="datQuitarFiltro">${T('Quitar el filtro')}</button>`;
    }
  }
  function pintarEstructura() {
    let t;
    try { t = SP.app.tablaAnalisis(); } catch (e) { $('#datHallazgos').innerHTML = `<li class="aviso"><span class="ico" aria-hidden="true">!</span><span>${esc(e.message)}</span></li>`; return; }
    if (!t || !t.n) { $('#datHallazgos').innerHTML = ''; return; }
    const r = SP.estructura.analizar(t);
    const ico = { ok: '✓', aviso: '!', info: 'i' };
    const nombre = { ok: T('correcto'), aviso: T('atención'), info: T('nota') };
    $('#datHallazgos').innerHTML = r.hallazgos.map(x =>
      `<li class="${x.tipo}"><span class="ico" aria-hidden="true">${ico[x.tipo]}</span><span><span class="sr-only">${nombre[x.tipo]}: </span>${esc(x.texto)}</span></li>`).join('') ||
      `<li class="info"><span class="ico" aria-hidden="true">i</span><span>${T('Sin observaciones.')}</span></li>`;
  }

  /* ---------------- acciones sobre columnas ---------------- */
  function cambiarTipo(j, tipo) {
    const h = estado.hoja, c = h.cols[j];
    const r = h.cambiarTipo(j, tipo);
    if (r.fallidos) L() && L().toast(T('{k} valores de «{c}» no se pudieron convertir a {t} y quedaron como faltantes (puedes deshacer).', { k: r.fallidos, c: c.nombre, t: T(NOMBRE_TIPO[tipo]) }), { type: 'warning' });
    rejilla.refrescar(true); cambio();
  }
  function menuColumna(j, boton) {
    const h = estado.hoja, c = h.cols[j];
    seleccionada = j; pintar();
    SP.ui.menu(boton, [
      { titulo: c.nombre },
      { texto: T('Renombrar…'), accion: () => SP.datosDialogos.renombrar(j) },
      ...(c.tipo === 'numerica' ? [{ texto: T('Transformar…'), accion: () => SP.datosDialogos.transformar(j) }] : []),
      ...(c.tipo === 'factor' ? [{ texto: T('Ordenar niveles…'), accion: () => SP.datosDialogos.niveles(j) }] : []),
      { separador: true },
      { titulo: T('Tipo de variable') },
      ...Object.keys(NOMBRE_TIPO).map(t => ({ texto: T(NOMBRE_TIPO[t]), marcado: c.tipo === t, accion: () => { if (c.tipo !== t) cambiarTipo(j, t); } })),
      { separador: true },
      { texto: T('Eliminar la columna'), accion: () => { h.eliminarColumna(j); rejilla.refrescar(true); cambio(); L() && L().toast(T('Columna «{c}» eliminada (Ctrl+Z la regresa).', { c: c.nombre }), {}); } },
    ], { etiqueta: T('Opciones de la columna {c}', { c: c.nombre }) });
  }

  /* ---------------- ejemplos ---------------- */
  function menuEjemplos(boton) {
    const lista = window.SP_EJEMPLOS || [];
    SP.ui.menu(boton, lista.map(e => ({
      texto: T(e.nombre), descripcion: T(e.descripcion),
      accion: () => {
        const leido = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' });
        cargar(SP.hoja.crear({ nombres: leido.nombres, columnas: leido.columnas, tipos: e.tipos }), T('Ejemplo: {e}', { e: T(e.nombre) }));
      },
    })), { etiqueta: T('Datos de ejemplo') });
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    rejilla = SP.rejilla.crear($('#datRejilla'), {
      alCambiar: () => cambio(),
      alMenuColumna: (j, b) => menuColumna(j, b),
      alSeleccionar: act => { if (act.j !== seleccionada) { seleccionada = act.j; pintarLista(); pintarDetalle(); } },
      alPegarNuevo: texto => SP.datosDialogos.importarTexto(texto, T('Tabla pegada')),
      filasVisibles: () => (estado.filtro ? new Set(estado.filtro.filas) : null),
    });
    SP.app.rejilla = rejilla;

    $('#datImportar').addEventListener('click', () => $('#datArchivo').click());
    $('#datInicioImportar').addEventListener('click', () => $('#datArchivo').click());
    $('#datArchivo').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) SP.datosDialogos.importarArchivo(f); });
    $('#datPegar').addEventListener('click', () => SP.datosDialogos.pegar());
    $('#datInicioPegar').addEventListener('click', () => SP.datosDialogos.pegar());
    $('#datEjemplos').addEventListener('click', e => menuEjemplos(e.currentTarget));
    /* desde cualquier bloque (Inicio, los estados vacíos): data-datos="importar|pegar|ejemplo"; con data-datos-ir, al llegar
       los datos se va a ese bloque (si se cancela, el siguiente cambio de bloque lo olvida) */
    let irAlCargar = null;
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-datos]');
      if (!b) return;
      irAlCargar = b.dataset.datosIr || null;
      if (b.dataset.datos === 'importar') $('#datArchivo').click();
      else if (b.dataset.datos === 'pegar') SP.datosDialogos.pegar();
      else if (b.dataset.datos === 'ejemplo') menuEjemplos(b);
    });
    document.addEventListener('sp:datos', ev => { if (irAlCargar && ev.detail && ev.detail.hoja) { const k = irAlCargar; irAlCargar = null; SP.app.ir(k); } });
    document.addEventListener('sp:bloque', () => { irAlCargar = null; });
    $('#datInicioEjemplo').addEventListener('click', e => menuEjemplos(e.currentTarget));
    $('#datNueva').addEventListener('click', () => SP.datosDialogos.nueva());
    $('#datCalcular').addEventListener('click', () => SP.datosDialogos.calcular());
    $('#datTransformar').addEventListener('click', () => SP.datosDialogos.transformar(seleccionada));
    $('#datFiltrar').addEventListener('click', () => SP.datosDialogos.filtrar());
    $('#datReformar').addEventListener('click', () => SP.datosDialogos.reformar());
    $('#datVolver').addEventListener('click', () => { const a = estado.anterior; if (a && a.hoja) cargar(a.hoja, a.origen); });
    $('#datDeshacer').addEventListener('click', () => { const d = estado.hoja.deshacer(); rejilla.refrescar(true); cambio(); if (d && L()) L().toast(T('Deshecho: {d}', { d }), {}); });
    $('#datRehacer').addEventListener('click', () => { const d = estado.hoja.rehacer(); rejilla.refrescar(true); cambio(); if (d && L()) L().toast(T('Rehecho: {d}', { d }), {}); });
    $('#datLista').addEventListener('click', e => {
      const b = e.target.closest('.dat-var');
      if (!b) return;
      seleccionada = +b.dataset.j; rejilla.irA(rejilla.seleccion().activa.i, seleccionada); pintarLista(); pintarDetalle();
    });
    $('#datDetalle').addEventListener('change', e => { if (e.target.id === 'datTipo') cambiarTipo(seleccionada, e.target.value); });
    $('#datDetalle').addEventListener('click', e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'niveles') SP.datosDialogos.niveles(seleccionada);
      if (a.dataset.accion === 'transformar') SP.datosDialogos.transformar(seleccionada);
    });
    $('#datFiltroAviso').addEventListener('click', e => { if (e.target.id === 'datQuitarFiltro') { estado.filtro = null; rejilla.refrescar(); cambio(); } });
    if (L()) L().guardUnload(() => !!(estado.hoja && estado.hoja.n && estado.hoja.version > 0));
    pintar();
  }

  SP.datosUI = { cargar, menuEjemplos, cambio, estado: () => estado, seleccionada: () => seleccionada, refrescar: remedir => { rejilla.refrescar(remedir); cambio(); } };
  SP.alArrancar(iniciar);
})();

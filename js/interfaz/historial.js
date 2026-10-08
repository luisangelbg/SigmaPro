/* SigmaPro — historial de análisis (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Recuerda los análisis que se calcularon en Análisis y en Explorar (el evento sp:resultado): el método, las variables
   y opciones del pedido, de qué datos (su origen: «Ejemplo: …» o el nombre del archivo) y cuándo. Un mismo método con
   los mismos datos ocupa un solo renglón, el del último cálculo. Se guarda en este navegador (localStorage
   «sigmapro.historial», a lo más 30), sin ningún valor de los datos.
   «Historial» en Análisis y «Lo último que analizaste» en Inicio vuelven a abrir un análisis: si los datos actuales no
   tienen sus columnas y eran de un ejemplo, lo cargan (la tabla de antes queda en «Volver a la tabla anterior»).

     SP.historial.anotar({ bloque, metodo, e, op, origen })
     SP.historial.lista()              [{ bloque, metodo, e, op, origen, columnas, t }], el más reciente primero
     SP.historial.abrir(i)             vuelve a abrir el renglón i; promesa con true si lo abrió
     SP.historial.borrar()
     SP.historial.menu(boton)          el menú del historial junto a un botón */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const CLAVE = 'sigmapro.historial', MAX = 30;

  /* ---------------- lo guardado ---------------- */
  let memoria = null;
  function leer() {
    if (memoria) return memoria;
    try { const v = JSON.parse(localStorage.getItem(CLAVE) || '[]'); memoria = Array.isArray(v) ? v.filter(x => x && SP.metodos[x.metodo]) : []; }
    catch (e) { memoria = []; }
    return memoria;
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(memoria)); } catch (e) { /* sin almacenamiento: queda en esta sesión */ } }
  /* las columnas que nombra un pedido: los valores de texto de sus entradas que son columnas de la tabla */
  function columnasDe(e, nombres) {
    const s = new Set();
    const ver = v => { if (typeof v === 'string' && nombres.has(v)) s.add(v); else if (Array.isArray(v)) v.forEach(ver); };
    Object.values(e || {}).forEach(ver);
    return [...s];
  }
  const datosApp = () => (SP.app && SP.app.datos) || {};
  const nombresActuales = () => { const h = datosApp().hoja; return new Set(h ? h.cols.map(c => c.nombre) : []); };

  function anotar(p) {
    if (!p || !SP.metodos[p.metodo]) return;
    const lista = leer(), origen = p.origen || datosApp().origen || '';
    const x = { bloque: p.bloque === 3 ? 3 : 4, metodo: p.metodo, e: JSON.parse(JSON.stringify(p.e || {})), op: JSON.parse(JSON.stringify(p.op || {})),
      origen, columnas: columnasDe(p.e, nombresActuales()), t: Date.now() };
    const i = lista.findIndex(y => y.metodo === x.metodo && y.bloque === x.bloque && y.origen === x.origen);
    if (i >= 0) lista.splice(i, 1);
    lista.unshift(x);
    if (lista.length > MAX) lista.length = MAX;
    guardar();
    pintarInicio();
  }
  const lista = () => leer().slice();
  function borrar() { memoria = []; guardar(); pintarInicio(); }

  /* ---------------- cómo se lee un renglón ---------------- */
  function hace(t) {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (s < 60) return T('hace un momento');
    const m = Math.round(s / 60);
    if (m < 60) return m === 1 ? T('hace 1 minuto') : T('hace {n} minutos', { n: m });
    const h = Math.round(m / 60);
    if (h < 24) return h === 1 ? T('hace 1 hora') : T('hace {n} horas', { n: h });
    const d = Math.round(h / 24);
    return d === 1 ? T('ayer') : T('hace {n} días', { n: d });
  }
  const nombre = x => (SP.metodos[x.metodo] ? SP.metodos[x.metodo].nombre : x.metodo);
  const detalle = x => [x.columnas.length ? x.columnas.join(', ') : '', x.origen, hace(x.t)].filter(Boolean).join(' · ');

  /* ---------------- volver a abrir ---------------- */
  /* el ejemplo de un origen «Ejemplo: …» */
  function ejemploDe(origen) {
    return (window.SP_EJEMPLOS || []).find(e => T('Ejemplo: {e}', { e: T(e.nombre) }) === origen) || null;
  }
  async function abrir(i) {
    const x = leer()[i];
    if (!x) return false;
    const actuales = nombresActuales(), faltan = x.columnas.filter(c => !actuales.has(c));
    if (faltan.length || !datosApp().hoja) {
      const ej = ejemploDe(x.origen);
      if (!ej) {
        L() && L().toast(T('Para volver a abrir «{m}» hacen falta los datos «{o}» (faltan las columnas {c}).', { m: nombre(x), o: x.origen || T('sin nombre'), c: faltan.join(', ') || '—' }), { type: 'warning' });
        return false;
      }
      const lc = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
      SP.app.cargarHoja(SP.hoja.crear({ nombres: lc.nombres, columnas: lc.columnas, tipos: ej.tipos }), x.origen);
      L() && L().toast(T('Datos de ejemplo cargados: {n}', { n: T(ej.nombre) }), { type: 'success' });
    }
    const e = JSON.parse(JSON.stringify(x.e)), op = JSON.parse(JSON.stringify(x.op));
    const F = SP.app.fundamentos;
    if (x.bloque === 3 && F && F.abrirExplorar) F.abrirExplorar(x.metodo, e, op);
    else { SP.app.ir(4); SP.app.analisis.usar(x.metodo, e, op); }
    return true;
  }

  /* ---------------- en la pantalla ---------------- */
  function menu(boton) {
    const l = leer();
    const items = l.length ? l.slice(0, 15).map((x, i) => ({ texto: nombre(x), descripcion: detalle(x), accion: () => abrir(i) }))
      .concat([{ separador: true }, { texto: T('Borrar el historial'), accion: () => { borrar(); L() && L().toast(T('Historial borrado.'), {}); } }])
      : [{ texto: T('Todavía no hay análisis en el historial.'), deshabilitado: true }];
    SP.ui.menu(boton, items, { etiqueta: T('Historial de análisis') });
  }
  function pintarInicio() {
    const caja = $('#iniHistorial'), ul = $('#iniHistorialLista');
    if (!caja || !ul) return;
    const l = leer().slice(0, 5);
    caja.hidden = !l.length;
    ul.innerHTML = l.map((x, i) => `<li><button type="button" class="ini-hist-item" data-hist="${i}"><span class="ini-hist-nom">${esc(nombre(x))}</span>` +
      `<span class="ini-hist-det">${esc(detalle(x))}</span></button></li>`).join('');
  }

  function iniciar() {
    document.addEventListener('sp:resultado', e => anotar(e.detail));
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-hist], [data-historial]');
      if (!b) return;
      if (b.dataset.hist !== undefined) abrir(Number(b.dataset.hist));
      else if (b.hasAttribute('data-historial')) menu(b);
    });
    const borrarB = $('#iniHistorialBorrar');
    if (borrarB) borrarB.addEventListener('click', () => { borrar(); L() && L().toast(T('Historial borrado.'), {}); });
    pintarInicio();
    /* el «hace…» se pone al día al volver a Inicio */
    document.addEventListener('sp:bloque', ev => { if (ev.detail && ev.detail.bloque === 1) pintarInicio(); });
  }
  SP.historial = { anotar, lista, abrir, borrar, menu };
  SP.alArrancar(iniciar);
})();

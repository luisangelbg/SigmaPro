/* SigmaPro — el glosario en la pantalla (hito 5.5).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una ventana con los términos de SP.glosario (js/nucleo/glosario.js): un buscador, el grupo, la lista y la ficha del
   término elegido, con qué es, dónde aparece y sus relacionados. Se abre con Ctrl+G (⌘G), con el botón del libro del
   encabezado, con «Glosario» de Fundamentos y con «En el glosario» bajo cada medidor de «Cómo leer este cuadro»
   (cualquier elemento con data-glosario, vacío o con el id de un término).
   «Ver en acción» carga los datos de ejemplo del análisis donde aparece el término (con SP.app.cargarHoja, que deja la
   tabla de antes en «Volver a la tabla anterior», en Datos), lo corre en Análisis o en Explorar y señala el cuadro, la
   columna o el renglón. Los lugares los calcula tools/glosario/glosario.mjs (js/generado/glosario.js, que se carga la
   primera vez que se abre el glosario).

     SP.glosarioUI.abrir(id?, texto?)   abre la ventana (en un término o con una búsqueda)
     SP.glosarioUI.ver(id, k?)          ver en acción: el lugar k (0 = el primero); devuelve una promesa con true si lo
                                        señaló
     SP.glosarioUI.datos()              promesa con SP_GLOSARIO (lo carga si hace falta) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const L = () => window.LABG;
  const est = { q: '', grupo: '', id: null, datos: window.SP_GLOSARIO || null, cargando: null, dlg: null, marcas: [], reloj: 0 };
  const ANCHO_CORTO = '(max-width: 720px)';

  /* ---------------- los lugares (js/generado/glosario.js) ---------------- */
  function datos() {
    if (est.datos) return Promise.resolve(est.datos);
    if (window.SP_GLOSARIO) return Promise.resolve(est.datos = window.SP_GLOSARIO);
    if (est.cargando) return est.cargando;
    est.cargando = new Promise(ok => {
      const s = document.createElement('script');
      s.src = 'js/generado/glosario.js';
      s.onload = () => { est.datos = window.SP_GLOSARIO || null; s.remove(); ok(est.datos); };
      s.onerror = () => { s.remove(); est.cargando = null; ok(null); };
      document.head.appendChild(s);
    });
    return est.cargando;
  }

  /* ---------------- la ventana ---------------- */
  const nombreGrupo = g => (SP.glosario.grupos().find(x => x[0] === g) || [g, ''])[1];
  const nombreMetodo = id => (SP.metodos[id] ? SP.metodos[id].nombre : id);
  const ejemplo = conjunto => (window.SP_EJEMPLOS || []).find(e => e.id === conjunto) || null;
  const corto = () => window.matchMedia && window.matchMedia(ANCHO_CORTO).matches;

  function crear() {
    if (est.dlg) return est.dlg;
    const d = document.createElement('dialog');
    d.className = 'labg-dialog sp-gl';
    d.id = 'spGlosario';
    d.setAttribute('aria-labelledby', 'spGlT');
    d.innerHTML =
      `<div class="dialog-head"><h2 id="spGlT">${esc(T('Glosario'))}</h2><kbd class="sp-gl-atajo" aria-hidden="true">Ctrl+G</kbd>` +
      `<button type="button" class="icon-btn" data-gl-cerrar aria-label="${esc(T('Cerrar el glosario'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>` +
      `<div class="sp-gl-busca"><label class="sp-gl-q"><span class="sr-only">${esc(T('Buscar en el glosario'))}</span>` +
      `<input type="search" class="input" id="spGlQ" autocomplete="off" spellcheck="false" placeholder="${esc(T('Buscar: F, interacción, BLUP, sobredispersión…'))}" aria-describedby="spGlCuenta"></label>` +
      `<label class="sp-gl-grupo"><span class="sr-only">${esc(T('Grupo'))}</span><select class="select" id="spGlGrupo"><option value="">${esc(T('Todos los términos'))}</option>` +
      SP.glosario.grupos().map(([k, n]) => `<option value="${esc(k)}">${esc(n)}</option>`).join('') + '</select></label></div>' +
      `<p class="small muted sp-gl-cuenta" id="spGlCuenta" role="status"></p>` +
      `<div class="sp-gl-cuerpo"><ul class="sp-gl-lista" id="spGlLista" aria-label="${esc(T('Términos'))}"></ul>` +
      `<section class="sp-gl-ficha" id="spGlFicha" tabindex="-1" aria-label="${esc(T('El término elegido'))}"></section></div>`;
    document.body.appendChild(d);
    const q = d.querySelector('#spGlQ'), g = d.querySelector('#spGlGrupo'), lista = d.querySelector('#spGlLista');
    let reloj = 0;
    q.addEventListener('input', () => { est.q = q.value; clearTimeout(reloj); reloj = setTimeout(filtrar, 90); });
    g.addEventListener('change', () => { est.grupo = g.value; filtrar(); });
    q.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { const b = lista.querySelector('.sp-gl-item'); if (b) { e.preventDefault(); b.focus(); } }
      else if (e.key === 'Enter') { const b = lista.querySelector('.sp-gl-item'); if (b) { e.preventDefault(); elegir(b.dataset.glId, true); } }
    });
    lista.addEventListener('keydown', e => {
      const b = e.target.closest('.sp-gl-item');
      if (!b) return;
      const todos = [...lista.querySelectorAll('.sp-gl-item')], i = todos.indexOf(b);
      const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? todos.length - 1 : null;
      if (j === null) return;
      e.preventDefault();
      if (j < 0) { q.focus(); return; }
      if (todos[Math.min(j, todos.length - 1)]) todos[Math.min(j, todos.length - 1)].focus();
    });
    d.addEventListener('click', e => {
      if (e.target === d) { d.close(); return; }   /* un clic en el fondo cierra */
      const t = e.target.closest('button, a');
      if (!t || !d.contains(t)) return;
      if (t.hasAttribute('data-gl-cerrar')) { d.close(); return; }
      if (t.dataset.glId) { elegir(t.dataset.glId, !t.classList.contains('sp-gl-item')); return; }
      if (t.hasAttribute('data-gl-volver')) { d.classList.remove('sp-gl-detalle'); const b = lista.querySelector('[aria-current="true"]') || lista.querySelector('.sp-gl-item'); if (b) b.focus(); return; }
      if (t.dataset.glVer !== undefined) { ver(est.id, Number(t.dataset.glVer) || 0); return; }
      if (t.hasAttribute('data-gl-fundamentos')) { buscarEnFundamentos(est.q); return; }
      /* «Aparece en»: la ficha de Fundamentos (la abre js/interfaz/fundamentos.js) */
      if (t.dataset.ficha) d.close();
    });
    d.addEventListener('close', () => { d.classList.remove('sp-gl-detalle'); });
    est.dlg = d;
    return d;
  }

  function filtrar() {
    const d = est.dlg, lista = d.querySelector('#spGlLista');
    const r = SP.glosario.buscar(est.q, est.grupo), total = SP.glosario.terminos().length;
    d.querySelector('#spGlCuenta').textContent = est.q || est.grupo ? T('{k} de {n} términos', { k: r.length, n: total }) : T('{n} términos', { n: total });
    lista.innerHTML = r.length ? r.map(t => `<li><button type="button" class="sp-gl-item" data-gl-id="${esc(t.id)}"${t.id === est.id ? ' aria-current="true"' : ''}>` +
      `<span class="sp-gl-nom">${esc(t.nombre)}</span>${simbolo(t) ? `<span class="sp-gl-sim">${esc(t.simbolo)}</span>` : ''}` +
      `<span class="sp-gl-gru">${esc(nombreGrupo(t.grupo))}</span></button></li>`).join('') :
      `<li class="sp-gl-nada"><p>${esc(T('Ningún término coincide con «{q}».', { q: est.q }))}</p>` +
      (est.q ? `<button type="button" class="btn btn-secondary btn-sm" data-gl-fundamentos>${esc(T('Buscar «{q}» en Fundamentos', { q: est.q }))}</button>` : '') + '</li>';
    /* sin un término elegido (o si el filtro lo dejó fuera), la ficha muestra el primero */
    if (!corto() && r.length && !r.some(t => t.id === est.id)) pintarFicha(r[0].id);
    else if (!r.length && !corto()) d.querySelector('#spGlFicha').innerHTML = '';
  }
  /* el símbolo, si no repite el nombre */
  const simbolo = t => t.simbolo && SP.glosario.normalizar(t.simbolo) !== SP.glosario.normalizar(t.nombre) ? t.simbolo : '';

  function elegir(id, enfocarFicha) {
    if (!SP.glosario.termino(id)) return;
    pintarFicha(id);
    const d = est.dlg;
    if (corto()) { d.classList.add('sp-gl-detalle'); enfocarFicha = true; }
    if (enfocarFicha) d.querySelector('#spGlFicha').focus();
  }

  function pintarFicha(id) {
    est.id = id;
    const d = est.dlg, t = SP.glosario.termino(id), f = d.querySelector('#spGlFicha');
    d.querySelectorAll('.sp-gl-item').forEach(b => { if (b.dataset.glId === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (!t) { f.innerHTML = ''; return; }
    let h = `<button type="button" class="btn btn-ghost btn-sm sp-gl-volver" data-gl-volver>${esc(T('← Volver a la lista'))}</button>` +
      `<h3 class="sp-gl-tit">${esc(t.nombre)}${simbolo(t) ? ` <span class="sp-gl-sim">${esc(t.simbolo)}</span>` : ''}</h3>` +
      `<p class="sp-gl-gru">${esc(nombreGrupo(t.grupo))}</p><p class="sp-gl-que">${esc(t.que)}</p>`;
    if (!est.datos) h += `<p class="small muted" role="status">${esc(est.cargando ? T('Buscando dónde aparece…') : T('No se pudo cargar dónde aparece cada término.'))}</p>`;
    else {
      const lug = SP.glosario.lugares(id, est.datos);
      if (lug.length) {
        const p = est.datos.pedidos[lug[0].metodo], ej = p && p[0] ? ejemplo(p[0]) : null;
        h += `<div class="sp-gl-accion"><button type="button" class="btn btn-primary btn-sm" data-gl-ver="0">${esc(T('Ver en acción'))}</button>` +
          `<p class="small">${esc(ej ? T('Abre «{m}» con los datos de ejemplo «{e}» y señala dónde aparece.', { m: nombreMetodo(lug[0].metodo), e: T(ej.nombre) })
            : T('Abre «{m}» con sus valores de partida y señala dónde aparece.', { m: nombreMetodo(lug[0].metodo) }))}</p>`;
        const A = (SP.app && SP.app.datos) || {}, hoja = A.hoja;
        if (ej && hoja && hoja.p && A.origen !== T('Ejemplo: {e}', { e: T(ej.nombre) }))
          h += `<p class="small muted">${esc(T('Los datos de ejemplo toman el lugar de tu tabla; «Volver a la tabla anterior», en Datos, la regresa.'))}</p>`;
        if (lug.length > 1) h += `<p class="small sp-gl-otros"><span>${esc(T('También en:'))}</span> ` +
          lug.slice(1).map((l, i) => `<button type="button" class="btn btn-ghost btn-sm" data-gl-ver="${i + 1}">${esc(nombreMetodo(l.metodo))}</button>`).join('') + '</p>';
        h += '</div>';
      }
      const ap = SP.glosario.aparece(id, est.datos), MAX = 12;
      if (ap.length) h += `<p class="sp-gl-donde"><b>${esc(T('Aparece en'))}</b> ` + ap.slice(0, MAX).map(m => `<a href="#b9" data-ficha="${esc(m)}">${esc(nombreMetodo(m))}</a>`).join(', ') +
        (ap.length > MAX ? ' ' + esc(T('y {n} más', { n: ap.length - MAX })) : '') + '.</p>';
    }
    if (t.relacionados.length) h += `<p class="sp-gl-rel"><b>${esc(T('Relacionados'))}</b> ` +
      t.relacionados.map(r => SP.glosario.termino(r)).filter(Boolean).map(r => `<button type="button" class="btn btn-ghost btn-sm" data-gl-id="${esc(r.id)}">${esc(r.nombre)}</button>`).join('') + '</p>';
    f.innerHTML = h;
  }

  function abrir(id, texto) {
    const d = crear();
    if (texto !== undefined && texto !== null) { est.q = String(texto); d.querySelector('#spGlQ').value = est.q; }
    if (!d.open) d.showModal();
    filtrar();
    if (id && SP.glosario.termino(id)) elegir(id, true);
    else { const q = d.querySelector('#spGlQ'); q.focus(); q.select(); }
    if (!est.datos) datos().then(() => { if (d.open && est.id) pintarFicha(est.id); });
  }
  function cerrar() { if (est.dlg && est.dlg.open) est.dlg.close(); }
  function buscarEnFundamentos(q) {
    const F = SP.app.fundamentos;
    cerrar();
    if (!F) return;
    Object.assign(F.estado, { vista: 'catalogo', id: null, buscar: q || '' });
    SP.app.ir(9);
    F.pintar();
  }

  /* ---------------- ver en acción ---------------- */
  function quitarMarcas() {
    clearTimeout(est.reloj);
    est.marcas.forEach(el => el.classList.remove('sp-gl-marca'));
    est.marcas = [];
  }
  /* el lugar dentro del resultado: lo que se señala y a qué se lleva la vista */
  function lugarEn(raiz, l) {
    if (!raiz) return null;
    if (l.modo === 's') { const el = raiz.querySelector(l.x); return el ? { celdas: [el], ver: el } : null; }
    const tabla = raiz.querySelector(`table[data-cuadro="${CSS.escape(l.cuadro)}"]`);
    if (!tabla) return null;
    const cuadro = tabla.closest('.tabla-wrap') || tabla;
    if (l.modo === 'q') return { celdas: [cuadro], ver: cuadro, tabla };
    const filas = tabla.tBodies[0] ? [...tabla.tBodies[0].rows] : [];
    if (l.modo === 'f') { const tr = filas[l.x]; return tr ? { celdas: [tr], ver: tr, tabla } : null; }
    const th = tabla.querySelector(`thead th[data-clave="${CSS.escape(l.x)}"]`);
    if (!th) return null;
    const j = [...th.parentNode.children].indexOf(th);
    return { celdas: [th].concat(filas.map(tr => tr.cells[j]).filter(Boolean)), ver: th, tabla };
  }
  const esperar = (fn, ms) => new Promise(ok => {
    const fin = Date.now() + ms;
    (function paso() { const r = fn(); if (r || Date.now() > fin) ok(r || null); else setTimeout(paso, 60); })();
  });
  const visible = el => !!(el && el.getClientRects().length);

  async function ver(id, k) {
    const D = await datos();
    const t = SP.glosario.termino(id), l = SP.glosario.lugares(id, D)[k || 0];
    if (!t || !l) return false;
    /* copias: el análisis guarda y cambia lo que recibe */
    const [conjunto, e, op] = JSON.parse(JSON.stringify(D.pedidos[l.metodo]));
    cerrar();
    quitarMarcas();
    /* los datos del ejemplo (la tabla de antes queda para volver a ella) */
    if (conjunto) {
      const ej = ejemplo(conjunto);
      if (!ej) { L() && L().toast(T('No se encontró el conjunto de ejemplo.'), { type: 'warning' }); return false; }
      const origen = T('Ejemplo: {e}', { e: T(ej.nombre) });
      if (!SP.app.datos.hoja || SP.app.datos.origen !== origen) {
        const habia = SP.app.datos.hoja && SP.app.datos.hoja.p;
        const lc = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
        SP.app.cargarHoja(SP.hoja.crear({ nombres: lc.nombres, columnas: lc.columnas, tipos: ej.tipos }), origen);
        L() && L().toast(habia ? T('Datos de ejemplo cargados: {n}. Tu tabla está en «Volver a la tabla anterior», en Datos.', { n: T(ej.nombre) })
          : T('Datos de ejemplo cargados: {n}', { n: T(ej.nombre) }), { type: 'success' });
      }
    } else if (!SP.app.datos.hoja) SP.app.analisis.sinDatos = true;
    /* el análisis */
    const F = SP.app.fundamentos, enExplorar = !!(F && F.EXPLORAR && F.EXPLORAR[l.metodo]);
    if (enExplorar) F.abrirExplorar(l.metodo, e, op);
    else { SP.app.ir(4); SP.app.analisis.usar(l.metodo, e, op); }
    const raiz = () => document.querySelector(enExplorar ? '#expResultado' : '#anaResultado');
    let lugar = await esperar(() => lugarEn(raiz(), l), 6000);
    if (!lugar) { L() && L().toast(T('No se encontró «{t}» en el resultado.', { t: t.nombre }), { type: 'warning' }); return false; }
    /* en Básico los cuadros no se ven: se pasa a Estándar */
    if (!visible(lugar.ver) && SP.detalle && SP.detalle.actual() === 'basico') {
      SP.detalle.poner('estandar');
      L() && L().toast(T('Se cambió al nivel Estándar para mostrar el cuadro.'), {});
      lugar = lugarEn(raiz(), l) || lugar;
    }
    for (let p = lugar.ver.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true;
    marcar(lugar, t, l);
    /* si el resultado se vuelve a pintar enseguida (al llegar los datos), se señala otra vez */
    setTimeout(() => { if (lugar.ver.isConnected) return; const otra = lugarEn(raiz(), l); if (otra) marcar(otra, t, l, true); }, 500);
    return true;
  }
  function marcar(lugar, t, l, callado) {
    quitarMarcas();
    lugar.celdas.forEach(el => el.classList.add('sp-gl-marca'));
    est.marcas = lugar.celdas.slice();
    const quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lugar.ver.scrollIntoView({ block: 'center', inline: 'nearest', behavior: quieto ? 'auto' : 'smooth' });
    const foco = lugar.tabla ? (lugar.tabla.closest('.tabla-wrap') || lugar.tabla) : lugar.ver;
    if (!foco.hasAttribute('tabindex')) foco.setAttribute('tabindex', '-1');
    foco.focus({ preventScroll: true });
    est.reloj = setTimeout(quitarMarcas, 12000);
    if (!callado && L()) {
      const m = T('«{t}» señalado en «{m}».', { t: t.nombre, m: nombreMetodo(l.metodo) });
      L().toast(m, { type: 'success' });
      if (L().announce) L().announce(m);
    }
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    document.addEventListener('keydown', e => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || (e.key !== 'g' && e.key !== 'G')) return;
      if (document.querySelector('.lfs-studio.on')) return;   /* el estudio de figuras tiene su propio teclado */
      e.preventDefault();
      if (est.dlg && est.dlg.open) cerrar(); else abrir();
    });
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-glosario]');
      if (!b || (est.dlg && est.dlg.contains(b))) return;
      e.preventDefault();
      abrir(b.dataset.glosario || null);
    });
    /* al cambiar los datos o el nivel, lo señalado ya no corresponde */
    document.addEventListener('sp:datos', () => { if (est.marcas.length && !est.marcas[0].isConnected) quitarMarcas(); });
  }
  SP.glosarioUI = { abrir, cerrar, ver, datos };
  SP.alArrancar(iniciar);
})();

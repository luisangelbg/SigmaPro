/* SigmaPro — bloque 3: Explorar (descriptivos, frecuencias, proporciones y bondad de ajuste).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada resumen es un método registrado (js/metodos/): aquí solo se arma el formulario con las
   columnas de la tabla, se llama SP.ejecutar con la tabla de análisis (con el filtro del bloque 2)
   y se pinta su reporte. Un método solo se ofrece si su validación contra R aprobó. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const METODO = { desc: 'descriptivos', frec: 'frecuencias', prop: 'proporciones', bondad: 'bondad-ajuste' };
  const estado = SP.app.explorar = {
    tipo: 'desc', pendiente: true,
    desc: { variables: [], grupos: [], nivel: 0.95, tipoCuantil: 7, recorte: 0.1, tipoForma: 2, percentiles: '' },
    frec: { fila: '', columna: '', faltantes: false, vista: 'conteos' },
    prop: { modo: 'categoria', categoria: '', exitos: '', ensayos: '', grupo: '', nivel: 0.95, metodos: ['wilson', 'clopper_pearson'] },
    bondad: { categoria: '', conteo: '', proporciones: '', alfa: 0.05 },
  };
  const leer = (k, omision) => { try { const v = localStorage.getItem('sigmapro.' + k); return v ? JSON.parse(v) : omision; } catch (e) { return omision; } };
  const guardar = (k, v) => { try { localStorage.setItem('sigmapro.' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  let extras = leer('desc.extras', ['faltantes', 'ic_mediana', 'asimetria', 'curtosis']);

  /* ---------------- columnas disponibles ---------------- */
  function columnas() {
    let t;
    try { t = SP.app.tablaAnalisis(); } catch (e) { return null; }
    if (!t || !t.n) return null;
    const numericas = t.nombres.filter(n => t.col(n).tipo === 'numerica' && !t.col(n).fecha);
    const factores = t.nombres.filter(n => t.col(n).tipo === 'factor');
    const numFactor = numericas.filter(n => SP.estructura.pareceFactorNumerico(t.col(n), t.n));
    return { t, pap: SP.estructura.adivinarPapeles(t), numericas, factores, numFactor, agrupables: factores.concat(numFactor) };
  }
  /** Quita columnas que ya no existen y pone valores de inicio razonables. */
  function sanear(c) {
    const d = estado.desc, f = estado.frec, p = estado.prop, b = estado.bondad;
    const en = (lista, v) => (lista.includes(v) ? v : '');
    d.variables = d.variables.filter(v => c.numericas.includes(v));
    if (!d.variables.length) {
      const varia = v => { const x = c.t.col(v).valores; let a = NaN; for (const y of x) { if (Number.isNaN(y)) continue; if (Number.isNaN(a)) a = y; else if (y !== a) return true; } return false; };
      const resp = c.pap.respuestas.filter(varia);
      d.variables = (resp.length ? resp : c.numericas).slice(0, 2);
    }
    d.grupos = d.grupos.filter(g => c.agrupables.includes(g) && !d.variables.includes(g)).slice(0, 3);
    if (!d._iniciado) { d._iniciado = true; const tr = c.pap.factores.find(x => x !== c.pap.bloque); if (tr && !d.grupos.length) d.grupos = [tr]; }
    const primerFactor = c.pap.factores[0] || c.factores[0] || c.agrupables[0] || '';
    f.fila = en(c.agrupables, f.fila) || primerFactor; f.columna = en(c.agrupables, f.columna);
    if (f.columna === f.fila) f.columna = '';
    p.categoria = en(c.agrupables, p.categoria) || primerFactor; p.grupo = en(c.agrupables, p.grupo);
    p.exitos = en(c.numericas, p.exitos); p.ensayos = en(c.numericas, p.ensayos);
    b.categoria = en(c.agrupables, b.categoria) || primerFactor; b.conteo = en(c.numericas, b.conteo);
    if (!b.conteo && !b._conteoVisto && b.categoria) {
      /* tabla ya agregada (una fila por categoría): los conteos son la primera columna de enteros no negativos */
      b._conteoVisto = true;
      const cat = SP.estructura.comoFactor(c.t, b.categoria);
      if (cat.niveles.length === c.t.n) b.conteo = c.numericas.find(n => Array.from(c.t.col(n).valores).every(v => v >= 0 && v === Math.floor(v))) || '';
    }
    if (p.modo === 'conteos' && (!p.exitos || !p.ensayos)) {
      /* ensayos: la columna entera que nunca es menor que otra entera; éxitos: la primera que cabe en ella */
      const enteras = c.numericas.filter(n => Array.from(c.t.col(n).valores).every(v => Number.isNaN(v) || (v >= 0 && v === Math.floor(v))));
      const cabe = (a, b) => { const A = c.t.col(a).valores, B = c.t.col(b).valores; for (let i = 0; i < c.t.n; i++) if (A[i] > B[i]) return false; return true; };
      const ens = enteras.find(b => enteras.some(a => a !== b && cabe(a, b)));
      if (ens) { p.ensayos = p.ensayos || ens; p.exitos = p.exitos || enteras.find(a => a !== p.ensayos && cabe(a, p.ensayos)) || ''; }
    }
  }

  /* ---------------- formularios ---------------- */
  const opcion = (v, texto, sel) => `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(texto)}</option>`;
  const selector = (id, etiqueta, valores, sel, vacio, ayuda) =>
    `<label class="field"><span>${esc(etiqueta)}</span><select data-campo="${id}">${vacio !== undefined ? opcion('', vacio, sel) : ''}` +
    valores.map(v => (Array.isArray(v) ? opcion(v[0], v[1], sel) : opcion(v, v, sel))).join('') + '</select>' +
    (ayuda ? `<span class="field-help">${esc(ayuda)}</span>` : '') + '</label>';
  const casillas = (id, etiqueta, valores, marcados, ayuda, nombre) =>
    `<fieldset class="exp-casillas"><legend>${esc(etiqueta)}</legend>` +
    (valores.length ? valores.map(v => `<label class="imp-check"><input type="checkbox" data-lista="${id}" value="${esc(v)}"${marcados.includes(v) ? ' checked' : ''}> ${esc(nombre ? nombre(v) : v)}</label>`).join('')
      : `<p class="small muted">${esc(T('No hay columnas de este tipo.'))}</p>`) +
    (ayuda ? `<p class="field-help">${esc(ayuda)}</p>` : '') + '</fieldset>';
  const NIVELES = [[0.9, '90 %'], [0.95, '95 %'], [0.99, '99 %']];
  const CUANTILES = [
    [7, T('7 · interpolación lineal (la de R y las hojas de cálculo)')], [6, T('6 · (n + 1)·p, la de muchos libros de texto')],
    [8, T('8 · aproximadamente insesgada para la mediana')], [9, T('9 · aproximadamente insesgada para la normal')],
    [5, T('5 · por tramos, centrada')], [4, T('4 · interpolación de la función de distribución')],
    [1, T('1 · inversa de la distribución empírica')], [2, T('2 · como la 1, promediando en los saltos')], [3, T('3 · el valor observado más cercano')],
  ];
  const FORMAS = [[2, T('G₁ y G₂: insesgados bajo normalidad (los de uso común)')], [1, T('g₁ y g₂: de momentos')], [3, T('b₁ y b₂: corregidos por (n − 1)/n')]];

  function formulario(c) {
    const e = estado[estado.tipo];
    const marcaNum = n => (c.numFactor.includes(n) ? [n, T('{c} (numérica)', { c: n })] : n);
    switch (estado.tipo) {
      case 'desc': return casillas('variables', T('Variables'), c.numericas, e.variables) +
        casillas('grupos', T('Agrupar por (hasta 3)'), c.agrupables, e.grupos, T('Las columnas numéricas con pocos valores repetidos (dosis) se agrupan por cada valor.')) +
        `<div class="exp-fila">${selector('nivel', T('Confianza'), NIVELES, e.nivel)}${selector('recorte', T('Media recortada'), [[0.05, '5 %'], [0.1, '10 %'], [0.2, '20 %'], [0.25, '25 %']], e.recorte)}</div>` +
        selector('tipoCuantil', T('Definición de los cuartiles'), CUANTILES, e.tipoCuantil) +
        selector('tipoForma', T('Asimetría y curtosis'), FORMAS, e.tipoForma) +
        `<label class="field"><span>${esc(T('Percentiles adicionales'))}</span><input data-campo="percentiles" value="${esc(e.percentiles)}" placeholder="5, 95" inputmode="decimal"><span class="field-help">${esc(T('En por ciento, separados por comas.'))}</span></label>`;
      case 'frec': return selector('fila', T('Variable'), c.agrupables.map(marcaNum), e.fila) +
        selector('columna', T('Cruzar con'), c.agrupables.filter(x => x !== e.fila).map(marcaNum), e.columna, T('— sin cruzar —')) +
        `<label class="imp-check"><input type="checkbox" data-campo="faltantes"${e.faltantes ? ' checked' : ''}> ${esc(T('Contar los faltantes como una categoría'))}</label>`;
      case 'prop': return `<div class="seg exp-modo" role="group" aria-label="${esc(T('Origen de la proporción'))}">` +
        `<button type="button" data-modo="categoria" aria-pressed="${e.modo === 'categoria'}">${esc(T('Categorías de un factor'))}</button>` +
        `<button type="button" data-modo="conteos" aria-pressed="${e.modo === 'conteos'}">${esc(T('Éxitos sobre ensayos'))}</button></div>` +
        (e.modo === 'categoria'
          ? selector('categoria', T('Variable categórica'), c.agrupables.map(marcaNum), e.categoria)
          : selector('exitos', T('Éxitos (p. ej. semillas germinadas)'), c.numericas, e.exitos, T('— elige —')) +
            selector('ensayos', T('Ensayos (p. ej. semillas sembradas)'), c.numericas, e.ensayos, T('— elige —'))) +
        selector('grupo', T('Por grupo'), c.agrupables.filter(x => e.modo !== 'categoria' || x !== e.categoria).map(marcaNum), e.grupo, T('— sin agrupar —')) +
        selector('nivel', T('Confianza'), NIVELES, e.nivel) +
        casillas('metodos', T('Intervalos'), SP.prop.METODOS, e.metodos, T('Wilson y Jeffreys son los recomendados; Clopper-Pearson es el exacto (conservador).'), k => SP.prop.NOMBRES[k]);
      case 'bondad': {
        let niveles = [];
        try { niveles = SP.estructura.comoFactor(c.t, e.categoria).niveles; } catch (err) { niveles = []; }
        return selector('categoria', T('Categorías'), c.agrupables.map(marcaNum), e.categoria) +
          selector('conteo', T('Conteos'), c.numericas.filter(x => x !== e.categoria), e.conteo, T('— una fila por observación —'), T('Elige una columna si cada fila ya trae cuántas observaciones tiene su categoría.')) +
          `<label class="field"><span>${esc(T('Proporción esperada'))}</span><input data-campo="proporciones" value="${esc(e.proporciones)}" placeholder="${esc(niveles.map(() => '1').join(':') || '9:3:3:1')}">` +
          `<span class="field-help">${esc(T('En el orden: {n}. Vacío = todas iguales.', { n: niveles.join(', ') }))}</span></label>` +
          selector('alfa', T('Nivel de significancia'), [[0.05, '0.05'], [0.01, '0.01'], [0.1, '0.10']], e.alfa);
      }
    }
    return '';
  }

  /* ---------------- entradas y opciones de cada método ---------------- */
  function armar(c) {
    const e = estado[estado.tipo];
    switch (estado.tipo) {
      case 'desc': {
        const percentiles = String(e.percentiles || '').split(/[,;\s]+/).filter(Boolean).map(s => SP.csv.aNumero(s, '.') / 100);
        if (percentiles.some(p => !(p >= 0 && p <= 1))) throw new SP.ErrorSP(T('Los percentiles adicionales van de 0 a 100.'));
        return { entradas: { variables: e.variables, grupos: e.grupos }, opciones: { nivel: +e.nivel, tipoCuantil: +e.tipoCuantil, recorte: +e.recorte, tipoForma: +e.tipoForma, percentiles },
          ctx: { factoresNumericos: c.numFactor } };
      }
      case 'frec': return { entradas: { fila: e.fila, columna: e.columna || undefined }, opciones: { faltantes: !!e.faltantes }, ctx: {} };
      case 'prop': return {
        entradas: e.modo === 'categoria' ? { categoria: e.categoria, grupo: e.grupo || undefined } : { exitos: e.exitos, ensayos: e.ensayos, grupo: e.grupo || undefined },
        opciones: { nivel: +e.nivel, metodos: e.metodos.length ? e.metodos : ['wilson'] }, ctx: {} };
      case 'bondad': return { entradas: { categoria: e.categoria, conteo: e.conteo || undefined },
        opciones: { proporciones: e.proporciones.trim() ? SP.bondad.leerProporciones(e.proporciones) : [] },
        ctx: { alfa: +e.alfa, textoProporciones: e.proporciones.trim() || null } };
    }
  }

  /* ---------------- pintar ---------------- */
  let ultimo = null;
  /* el resumen en pantalla como análisis del reporte (con el cuadro elegido y las columnas extra a la vista) */
  function pedidoActual() {
    const c = columnas();
    if (!c) return null;
    const { entradas, opciones, ctx } = armar(c);
    return { metodo: METODO[estado.tipo], e: entradas, op: opciones, ctx, bloque: 3, visibles: extras.slice(), vista: estado.tipo === 'frec' ? estado.frec.vista : undefined };
  }
  const botonReporte = () => {
    let p = null; try { p = pedidoActual(); } catch (e) { p = null; }
    const ya = p && SP.app.reporte && SP.app.reporte.tiene(p);
    return `<button type="button" class="btn ${ya ? 'btn-ghost' : 'btn-secondary'} btn-sm exp-reporte" data-accion="reporte"${ya ? ' aria-pressed="true"' : ''}>${esc(ya ? T('En el reporte ✓') : T('Agregar al reporte'))}</button>`;
  };
  /* la ficha de Fundamentos del resumen (bloque 9) */
  const botonFicha = () => (SP.app.fundamentos ? `<button type="button" class="btn btn-ghost btn-sm exp-ficha" data-ficha="${esc(METODO[estado.tipo])}" title="${esc(T('Fundamentos: el modelo, los supuestos y los datos que necesita'))}"><span aria-hidden="true">ⓘ</span> ${esc(T('¿Qué es este análisis?'))}</button>` : '');
  function pintarResultado(rep, codigo, ms) {
    const r = $('#expResultado');
    const varios = rep.cuadros.length > 1;
    const vista = estado.tipo === 'frec' ? estado.frec.vista : null;
    const cuadro = varios ? (rep.cuadros.find(x => x.id === vista) || rep.cuadros[0]) : rep.cuadros[0];
    ultimo = { rep, cuadro };
    const extrasDisp = cuadro.columnasExtra || [];
    r.innerHTML =
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('calculado en {ms} ms', { ms: Math.max(1, Math.round(ms)) }))}</span>` +
      `<a class="exp-a-opciones small" href="#expOpciones">${esc(T('Cambiar las opciones ↓'))}</a>${botonFicha()}${botonReporte()}</div>` +
      `<div class="callout exp-conclusion">${rep.conclusiones.map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      (varios ? `<div class="seg exp-vistas" role="group" aria-label="${esc(T('Cuadro que se muestra'))}">${rep.cuadros.map(x => `<button type="button" data-vista="${esc(x.id)}" aria-pressed="${x === cuadro}">${esc({ conteos: T('Frecuencias'), 'pct-fila': T('% por fila'), 'pct-columna': T('% por columna'), 'pct-total': T('% del total') }[x.id] || x.titulo)}</button>`).join('')}</div>` : '') +
      SP.cuadros.html(cuadro, { numero: 1, visibles: extras }) +
      `<div class="btn-row exp-acciones"><button type="button" class="btn btn-secondary btn-sm" data-accion="copiar">${esc(T('Copiar cuadro'))}</button>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-accion="csv">${esc(T('Bajar en CSV'))}</button>` +
      `<span class="small muted">${esc(T('Se pega como tabla en una hoja de cálculo o en un procesador de textos.'))}</span></div>` +
      (extrasDisp.length ? `<details class="exp-extras"><summary>${esc(T('Más estadísticos en el cuadro'))}</summary><div class="chips">` +
        extrasDisp.map(x => `<label class="imp-check"><input type="checkbox" data-extra="${esc(x.clave)}"${extras.includes(x.clave) ? ' checked' : ''}> ${esc(x.titulo)}</label>`).join('') + '</div></details>' : '') +
      `<details class="exp-codigo"><summary>${esc(T('Código R equivalente'))}</summary><pre><code>${esc(codigo)}</code></pre>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-accion="copiar-r">${esc(T('Copiar el código'))}</button></details>`;
    r.dataset.codigo = codigo;
  }
  function pintarError(e) {
    ultimo = null;
    $('#expResultado').innerHTML = `<div class="msg msg-error"><strong>${esc(e.message)}</strong>${e.arreglo ? `<span class="msg-fix">${esc(e.arreglo)}</span>` : ''}</div>`;
  }

  function calcular() {
    estado.pendiente = false;
    const c = columnas();
    $('#expVacio').hidden = !!c;
    $('#expTrabajo').hidden = !c;
    if (!c) return;
    sanear(c);
    document.querySelectorAll('#expTipos [data-tipo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tipo === estado.tipo)));
    const filtro = SP.app.datos.filtro;
    $('#expFiltro').hidden = !filtro;
    if (filtro) $('#expFiltro').textContent = T('Con el filtro del bloque Datos: se usan {k} de {n} filas.', { k: filtro.filas.length, n: SP.app.datos.hoja.n });
    const form = $('#expOpciones');
    const foco = document.activeElement && form.contains(document.activeElement) ? (document.activeElement.dataset.campo || document.activeElement.dataset.lista + ':' + document.activeElement.value) : null;
    form.innerHTML = formulario(c);
    if (foco) { const el = form.querySelector(`[data-campo="${foco}"]`) || form.querySelector(`[data-lista="${foco.split(':')[0]}"][value="${CSS.escape(foco.split(':').slice(1).join(':'))}"]`); if (el) el.focus(); }
    const id = METODO[estado.tipo];
    if (!SP.metodoDisponible(id)) {
      $('#expResultado').innerHTML = `<div class="msg msg-warning">${esc(T('Este resumen todavía no tiene su validación contra R aprobada, así que no se ofrece.'))}</div>`;
      return;
    }
    try {
      const { entradas, opciones, ctx } = armar(c);
      const ficha = SP.metodos[id];
      const { resultado, ms } = SP.ejecutar(id, c.t, entradas, opciones);
      pintarResultado(ficha.reporte(resultado, ctx), ficha.codigoR(entradas, opciones, ctx), ms);
    } catch (e) {
      if (!(e instanceof SP.ErrorSP) && !(e && e.arreglo !== undefined)) console.error(e);
      pintarError(e);
    }
  }
  let reloj = null;
  const recalcular = () => { clearTimeout(reloj); reloj = setTimeout(calcular, 120); };
  estado.calcular = calcular;   // para las pruebas y las capturas automáticas

  /* ---------------- eventos ---------------- */
  function iniciar() {
    const panel = $('#panel-3');
    $('#expTipos').addEventListener('click', e => {
      const b = e.target.closest('[data-tipo]');
      if (!b || b.dataset.tipo === estado.tipo) return;
      estado.tipo = b.dataset.tipo;
      calcular();
    });
    const form = $('#expOpciones');
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('change', e => {
      const el = e.target, s = estado[estado.tipo];
      if (el.dataset.lista) {
        const k = el.dataset.lista, marcados = [...form.querySelectorAll(`[data-lista="${k}"]:checked`)].map(x => x.value);
        if (k === 'grupos' && marcados.length > 3) { el.checked = false; L() && L().toast(T('Se puede agrupar por tres factores como máximo.'), { type: 'warning' }); return; }
        s[k] = marcados;
        if (k === 'variables') s.grupos = s.grupos.filter(g => !marcados.includes(g));
      } else if (el.dataset.campo) {
        s[el.dataset.campo] = el.type === 'checkbox' ? el.checked : el.value;
      }
      calcular();
    });
    form.addEventListener('input', e => { if (e.target.dataset.campo && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { estado[estado.tipo][e.target.dataset.campo] = e.target.value; recalcular(); } });
    form.addEventListener('click', e => { const b = e.target.closest('[data-modo]'); if (b) { estado.prop.modo = b.dataset.modo; calcular(); } });
    $('#expResultado').addEventListener('click', async e => {
      const v = e.target.closest('[data-vista]');
      if (v) { estado.frec.vista = v.dataset.vista; calcular(); return; }
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'reporte') {
        const p = pedidoActual();
        if (!p) return;
        if (SP.app.reporte.tiene(p)) { SP.app.ir(5); return; }
        SP.app.reporte.agregar(p);
        a.outerHTML = botonReporte();
        return;
      }
      if (a.dataset.accion === 'csv') {
        if (ultimo) { const n = SP.cuadros.bajarCSV(ultimo.cuadro, extras); L() && L().toast(T('Cuadro bajado: {f}', { f: n }), { type: 'success' }); }
        return;
      }
      const texto = a.dataset.accion === 'copiar' ? (ultimo && SP.cuadros.tsv(ultimo.cuadro, extras)) : $('#expResultado').dataset.codigo;
      if (texto && await SP.cuadros.copiar(texto)) L() && L().toast(a.dataset.accion === 'copiar' ? T('Cuadro copiado: pégalo en tu hoja de cálculo o documento.') : T('Código R copiado.'), { type: 'success' });
      else L() && L().toast(T('El navegador no dejó copiar; selecciona el texto y usa Ctrl+C.'), { type: 'warning' });
    });
    $('#expResultado').addEventListener('change', e => {
      if (!e.target.dataset.extra) return;
      extras = [...$('#expResultado').querySelectorAll('[data-extra]:checked')].map(x => x.dataset.extra);
      guardar('desc.extras', extras);
      const abierto = true;
      calcular();
      const d = $('#expResultado .exp-extras'); if (d) d.open = abierto;
    });
    document.addEventListener('sp:datos', () => { if (panel.classList.contains('active')) recalcular(); else estado.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 3 && estado.pendiente) calcular(); });
    if (panel.classList.contains('active')) calcular();
  }
  SP.alArrancar(iniciar);
})();

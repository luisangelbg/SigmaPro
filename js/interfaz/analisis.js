/* SigmaPro — bloque 4: Análisis (catálogo, supuestos, pruebas t, no paramétricas, diseños, comparaciones, ANCOVA y regresión).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El catálogo lista las familias de SP.familias de la Fase 1. Un análisis aparece activo solo si su método
   está registrado y su validación contra R aprobó (SP.metodoDisponible); los demás muestran el hito en que
   llegan. Cada método tiene su formulario; la prueba t y Wilcoxon comparten el suyo (estado «dos»), y
   Kruskal-Wallis y Friedman el de los rangos (estado «rangos»); las regresiones y la selección de variables comparten
   el estado «reg», así cambiar de uno a otro conserva lo elegido. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const HITO = {};
  const DISENOS = ['dca', 'dbca', 'cuadro-latino', 'parcelas-divididas', 'parcelas-subdivididas', 'franjas', 'bib', 'latice'];
  const MODOS = ['asistente', 'catalogo', 'constructor'];
  const COMPARAR = ['comparaciones-medias', 'contrastes', 'polinomios', 'medias-ajustadas'];
  const REGRESION = ['regresion-lineal', 'regresion-polinomial', 'seleccion-pasos', 'mejores-subconjuntos'];
  const CORREL = ['correlacion', 'matriz-correlacion', 'correlacion-parcial'];
  const CONTING = ['tabla-contingencia', 'mcnemar', 'mantel-haenszel', 'kappa'];
  const estado = SP.app.analisis = {
    metodo: 'supuestos', pendiente: true, turno: 0, modo: (() => { try { const m = localStorage.getItem('sigmapro.analisis.modo'); return MODOS.includes(m) ? m : 'asistente'; } catch (e) { return 'asistente'; } })(),
    pintores: {},   // asistente y constructor (js/interfaz/asistente.js y constructor.js)
    sup: { respuesta: '', tratamientos: [], bloque: '', orden: '', alfa: 0.05, _iniciado: false },
    dos: { modo: '', variable: '', respuesta: '', grupo: '', nivelA: '', nivelB: '', antes: '', despues: '', mu: 0, alternativa: 'bilateral', nivel: 0.95, varIguales: false, exacta: 'auto', correccion: true, alfa: 0.05, _iniciado: false },
    rangos: { respuesta: '', tratamiento: '', bloque: '', posthocKW: 'dunn', posthocF: 'conover', ajuste: 'holm', alfa: 0.05, _iniciado: false },
    cmp: { diseno: 'dbca', comparar: [], dentro: '', metodo: 'tukey', testigo: '', alternativa: 'bilateral', contrastes: '', grado: 2, nivel: 0.95, alfa: 0.05 },
    dis: { respuesta: '', tratamientos: [], bloque: '', fila: '', columna: '', repeticion: '', principal: 'dbca', parcelaGrande: '', subparcela: '', subsubparcela: '',
      franjaA: '', franjaB: '', tipoSC: 3, alfa: 0.05, _iniciado: false },
    reg: { respuesta: '', predictores: [], x: '', grado: 2, nivel: 0.95, alfa: 0.05, predecir: '', criterio: 'aic', direccion: 'ambas', entrada: 0.05, salida: 0.1, mejores: 1, _iniciado: false },
    anc: { respuesta: '', tratamientos: [], bloque: '', covariables: [], tipoSC: 3, metodo: 'tukey', alfa: 0.05, nivel: 0.95, _iniciado: false },
    cor: { x: '', y: '', variables: [], controles: [], metodo: 'pearson', alternativa: 'bilateral', nivel: 0.95, alfa: 0.05, exacta: 'auto', continuidad: false, ajuste: 'holm', faltantes: 'completas', _iniciado: false },
    cont: { fila: '', columna: '', frecuencia: '', antes: '', despues: '', estrato: '', evaluador1: '', evaluador2: '', correccion: true, ponderacion: 'cuadratica', nivel: 0.95, alfa: 0.05, _iniciado: false },
    ml: { respuesta: '', derecha: '', comoFactor: [], tipoSC: 3, alfa: 0.05, nivel: 0.95, _iniciado: false },
  };

  /* ---------------- catálogo ---------------- */
  function catalogo() {
    const fams = SP.familias.filter(f => f.fase === 1 && f.id !== 'descriptiva');
    if (!SP.metodoDisponible(estado.metodo)) estado.metodo = 'supuestos';
    $('#anaCatalogo').innerHTML = fams.map(f => {
      const metodos = SP.listaMetodos(f.id).filter(m => SP.metodoDisponible(m.id));
      const items = metodos.length
        ? metodos.map(m => `<li><button type="button" class="ana-item${m.id === estado.metodo ? ' activo' : ''}" data-metodo="${esc(m.id)}" aria-pressed="${m.id === estado.metodo}" title="${esc(m.resumen)}"><b>${esc(m.nombre)}</b></button></li>`).join('')
        : `<li><span class="ana-item pronto"><b>${esc(T('Pronto'))}</b><span class="pill gris">${esc(T('Hito {h}', { h: HITO[f.id] || '' }))}</span></span></li>`;
      return `<li class="ana-familia"><p class="ana-fam-titulo">${esc(T(f.nombre))}</p><ul>${items}</ul></li>`;
    }).join('');
  }

  /* ---------------- columnas y papeles ---------------- */
  function columnas() {
    let t;
    try { t = SP.app.tablaAnalisis(); } catch (e) { return null; }
    if (!t || !t.n) return null;
    const numericas = t.nombres.filter(n => t.col(n).tipo === 'numerica' && !t.col(n).fecha);
    const fechas = t.nombres.filter(n => t.col(n).fecha);
    const factores = t.nombres.filter(n => t.col(n).tipo === 'factor');
    const numFactor = numericas.filter(n => SP.estructura.pareceFactorNumerico(t.col(n), t.n));
    return { t, pap: SP.estructura.adivinarPapeles(t), numericas, fechas, factores, numFactor, agrupables: factores.concat(numFactor) };
  }
  const nivelesDe = (c, nom) => { try { return SP.estructura.comoFactor(c.t, nom).niveles; } catch (e) { return []; } };
  const medidas = c => c.numericas.filter(n => !c.numFactor.includes(n));
  function sanearSup(c) {
    const s = estado.sup;
    if (!c.numericas.includes(s.respuesta)) s.respuesta = c.pap.respuestas[0] || c.numericas[0] || '';
    s.tratamientos = s.tratamientos.filter(x => c.agrupables.includes(x) && x !== s.respuesta).slice(0, 3);
    if (s.bloque && !c.agrupables.includes(s.bloque)) s.bloque = '';
    if (s.orden && !c.numericas.concat(c.fechas).includes(s.orden)) s.orden = '';
    if (!s._iniciado) {
      s._iniciado = true;
      s.bloque = c.pap.bloque || '';
      s.tratamientos = c.pap.factores.filter(x => x !== s.bloque && x !== s.respuesta).slice(0, 3);
    }
    s.tratamientos = s.tratamientos.filter(x => x !== s.bloque);
  }
  function sanearDos(c) {
    const s = estado.dos, med = medidas(c).length ? medidas(c) : c.numericas;
    const resp = c.pap.respuestas.find(n => med.includes(n)) || med[0] || '';
    if (!med.includes(s.variable)) s.variable = resp;
    if (!med.includes(s.respuesta)) s.respuesta = resp;
    const grupos = c.agrupables.filter(n => n !== s.respuesta && nivelesDe(c, n).length >= 2);
    if (!grupos.includes(s.grupo)) s.grupo = grupos.find(n => nivelesDe(c, n).length === 2) || c.pap.factores.find(n => grupos.includes(n)) || grupos[0] || '';
    const niv = s.grupo ? nivelesDe(c, s.grupo) : [];
    if (!niv.includes(s.nivelA)) s.nivelA = niv[0] || '';
    if (!niv.includes(s.nivelB) || s.nivelB === s.nivelA) s.nivelB = niv.find(n => n !== s.nivelA) || '';
    if (!med.includes(s.antes)) s.antes = med[0] || '';
    if (!med.includes(s.despues) || s.despues === s.antes) s.despues = med.find(n => n !== s.antes) || '';
    if (!s._iniciado || !s.modo) {
      s._iniciado = true;
      s.modo = s.grupo ? 'independientes' : med.length >= 2 ? 'pareadas' : 'una';
    }
    return { med, grupos, niv };
  }
  function sanearRangos(c) {
    const s = estado.rangos, med = medidas(c).length ? medidas(c) : c.numericas;
    if (!med.includes(s.respuesta)) s.respuesta = c.pap.respuestas.find(n => med.includes(n)) || med[0] || '';
    const agr = c.agrupables.filter(n => n !== s.respuesta && nivelesDe(c, n).length >= 2);
    if (!s._iniciado) { s._iniciado = true; s.bloque = c.pap.bloque && agr.includes(c.pap.bloque) ? c.pap.bloque : ''; s.tratamiento = ''; }
    if (!agr.includes(s.tratamiento) || s.tratamiento === s.bloque) s.tratamiento = c.pap.factores.find(n => agr.includes(n) && n !== s.bloque) || agr.find(n => n !== s.bloque) || '';
    if (s.bloque && (!agr.includes(s.bloque) || s.bloque === s.tratamiento)) s.bloque = '';
    if (!s.bloque) s.bloque = agr.find(n => n !== s.tratamiento) || '';
    return { med, agr };
  }

  /** Papeles de los diseños: se proponen una vez por tabla y luego se respetan. */
  function sanearDis(c) {
    const s = estado.dis, med = medidas(c).length ? medidas(c) : c.numericas;
    const agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!med.includes(s.respuesta)) s.respuesta = c.pap.respuestas.find(n => med.includes(n)) || med[0] || '';
    if (!s._iniciado) {
      s._iniciado = true;
      const facs = c.pap.factores.filter(n => agr.includes(n) && n !== s.respuesta);
      s.bloque = c.pap.bloque && agr.includes(c.pap.bloque) ? c.pap.bloque : '';
      s.fila = c.pap.fila || ''; s.columna = c.pap.columna || '';
      s.repeticion = agr.find(n => /^rep/i.test(n)) || '';
      s.tratamientos = facs.filter(n => ![s.bloque, s.fila, s.columna, s.repeticion].includes(n)).slice(0, 3);
      [s.parcelaGrande, s.subparcela, s.subsubparcela] = [s.tratamientos[0] || '', s.tratamientos[1] || '', s.tratamientos[2] || ''];
      [s.franjaA, s.franjaB] = [s.tratamientos[0] || '', s.tratamientos[1] || ''];
    }
    for (const k of ['bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB']) if (s[k] && !agr.includes(s[k])) s[k] = '';
    s.tratamientos = s.tratamientos.filter(n => agr.includes(n) && n !== s.respuesta);
    return { med, agr };
  }
  const MAX_TRAT = { dca: 3, dbca: 3, 'cuadro-latino': 2, bib: 1, latice: 1 };
  /* la respuesta por omisión de la regresión y la ANCOVA: la última columna numérica que no parece factor (suele ir al final) */
  const ultimaRespuesta = c => (c.pap.respuestas.length ? c.pap.respuestas[c.pap.respuestas.length - 1] : c.numericas[c.numericas.length - 1] || '');
  function sanearReg(c) {
    const s = estado.reg, num = c.numericas;
    if (!num.includes(s.respuesta)) s.respuesta = ultimaRespuesta(c);
    s.predictores = s.predictores.filter(x => num.includes(x) && x !== s.respuesta);
    if (!s._iniciado) {
      s._iniciado = true;
      s.predictores = num.filter(x => x !== s.respuesta && !c.numFactor.includes(x)).slice(0, 15);
      if (!s.predictores.length) s.predictores = num.filter(x => x !== s.respuesta).slice(0, 1);
    }
    if (!num.includes(s.x) || s.x === s.respuesta) s.x = s.predictores[0] || num.find(x => x !== s.respuesta) || '';
    return { num };
  }
  function sanearAnc(c) {
    const s = estado.anc, med = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!med.includes(s.respuesta)) s.respuesta = ultimaRespuesta(c);
    if (!s._iniciado) {
      s._iniciado = true;
      s.bloque = c.pap.bloque && agr.includes(c.pap.bloque) ? c.pap.bloque : '';
      s.tratamientos = c.pap.factores.filter(n => agr.includes(n) && n !== s.bloque && n !== s.respuesta).slice(0, 1);
      s.covariables = med.filter(n => n !== s.respuesta && !c.numFactor.includes(n)).slice(0, 1);
    }
    s.tratamientos = s.tratamientos.filter(n => agr.includes(n) && n !== s.respuesta && n !== s.bloque).slice(0, 2);
    if (s.bloque && (!agr.includes(s.bloque) || s.bloque === s.respuesta)) s.bloque = '';
    s.covariables = s.covariables.filter(n => med.includes(n) && n !== s.respuesta && !s.tratamientos.includes(n) && n !== s.bloque).slice(0, 2);
    return { med, agr };
  }

  /* ---------------- formularios ---------------- */
  const opcion = (v, t, sel) => `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(t)}</option>`;
  const campo = (grupo, nombre, etiqueta, opciones, sel, ayuda) =>
    `<label class="field"><span>${esc(etiqueta)}</span><select data-grupo="${grupo}" data-campo="${nombre}">${opciones.map(([v, t]) => opcion(v, t, sel)).join('')}</select>` +
    (ayuda ? `<span class="field-help">${esc(ayuda)}</span>` : '') + '</label>';
  const lista = nombres => nombres.map(n => [n, n]);
  const ALFAS = [[0.05, '0.05'], [0.01, '0.01'], [0.1, '0.10']];
  const NIVELES = [[0.95, '95 %'], [0.99, '99 %'], [0.9, '90 %']];
  const ALTERNATIVAS = [['bilateral', T('Bilateral (≠)')], ['menor', T('Menor (<)')], ['mayor', T('Mayor (>)')]];

  function formSupuestos(c) {
    const s = estado.sup, marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    return `<label class="field"><span>${esc(T('Variable de respuesta'))}</span><select data-grupo="sup" data-campo="respuesta">${c.numericas.map(n => opcion(n, n, s.respuesta)).join('')}</select></label>` +
      `<fieldset class="exp-casillas"><legend>${esc(T('Tratamientos (hasta 3, cruzados)'))}</legend>` +
      (c.agrupables.filter(n => n !== s.respuesta && n !== s.bloque).map(n => `<label class="imp-check"><input type="checkbox" data-lista="tratamientos" value="${esc(n)}"${s.tratamientos.includes(n) ? ' checked' : ''}> ${esc(marca(n))}</label>`).join('') ||
        `<p class="small muted">${esc(T('No hay factores en la tabla.'))}</p>`) + '</fieldset>' +
      `<label class="field"><span>${esc(T('Bloques'))}</span><select data-grupo="sup" data-campo="bloque">${opcion('', T('— sin bloques —'), s.bloque)}${c.agrupables.filter(n => n !== s.respuesta && !s.tratamientos.includes(n)).map(n => opcion(n, marca(n), s.bloque)).join('')}</select></label>` +
      `<label class="field"><span>${esc(T('Orden para la independencia'))}</span><select data-grupo="sup" data-campo="orden">${opcion('', T('— el de las filas —'), s.orden)}${c.numericas.concat(c.fechas).filter(n => n !== s.respuesta).map(n => opcion(n, n, s.orden)).join('')}</select>` +
      `<span class="field-help">${esc(T('Si las filas siguen la posición en el campo o la fecha de medición, Durbin-Watson detecta parcelas vecinas parecidas.'))}</span></label>` +
      campo('sup', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formDos(c, esT) {
    const s = estado.dos, { med, grupos, niv } = sanearDos(c);
    const modos = [['independientes', T('Dos grupos independientes')], ['pareadas', T('Mediciones pareadas')], ['una', T('Una muestra contra un valor')]];
    let h = campo('dos', 'modo', T('Tipo de comparación'), modos, s.modo);
    if (s.modo === 'una') h += campo('dos', 'variable', T('Variable'), lista(med), s.variable);
    else if (s.modo === 'pareadas') {
      h += campo('dos', 'antes', T('Primera medición'), lista(med), s.antes) + campo('dos', 'despues', T('Segunda medición'), lista(med.filter(n => n !== s.antes)), s.despues,
        T('Cada fila es la misma unidad medida dos veces; se compara primera − segunda.'));
    } else {
      h += campo('dos', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
      h += grupos.length ? campo('dos', 'grupo', T('Columna de los grupos'), lista(grupos), s.grupo) : `<p class="small muted">${esc(T('No hay una columna con grupos.'))}</p>`;
      if (niv.length > 2) h += campo('dos', 'nivelA', T('Grupo 1'), lista(niv), s.nivelA) + campo('dos', 'nivelB', T('Grupo 2'), lista(niv.filter(n => n !== s.nivelA)), s.nivelB);
    }
    h += `<label class="field"><span>${esc(s.modo === 'una' ? T('Valor de referencia (μ₀)') : T('Diferencia bajo H₀'))}</span><input type="number" step="any" data-grupo="dos" data-campo="mu" value="${esc(s.mu)}"></label>`;
    h += campo('dos', 'alternativa', T('Hipótesis alternativa'), ALTERNATIVAS, s.alternativa) + campo('dos', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel);
    if (esT && s.modo === 'independientes') h += `<label class="imp-check"><input type="checkbox" data-grupo="dos" data-campo="varIguales"${s.varIguales ? ' checked' : ''}> ${esc(T('Suponer varianzas iguales (t de Student)'))}</label>`;
    if (!esT) {
      h += campo('dos', 'exacta', T('Valor p'), [['auto', T('Exacto si se puede')], ['si', T('Exacto')], ['no', T('Aproximación normal')]], s.exacta,
        T('Exacto con menos de 50 datos por grupo y sin empates, como R.'));
      h += `<label class="imp-check"><input type="checkbox" data-grupo="dos" data-campo="correccion"${s.correccion ? ' checked' : ''}> ${esc(T('Corrección por continuidad'))}</label>`;
    }
    return h + campo('dos', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formRangos(c, friedman) {
    const s = estado.rangos, { med, agr } = sanearRangos(c);
    let h = campo('rangos', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta) +
      campo('rangos', 'tratamiento', T('Tratamientos'), lista(agr.filter(n => !friedman || n !== s.bloque)), s.tratamiento);
    if (friedman) h += campo('rangos', 'bloque', T('Bloques'), lista(agr.filter(n => n !== s.tratamiento)), s.bloque, T('Un dato por tratamiento en cada bloque (p. ej., juez, parcela, fecha).'));
    const ph = friedman ? 'posthocF' : 'posthocKW';
    const comps = friedman ? [['conover', 'Conover'], ['nemenyi', 'Nemenyi'], ['wilcoxon', T('Wilcoxon pareada')]] : [['dunn', 'Dunn'], ['conover', 'Conover-Iman'], ['nemenyi', 'Nemenyi']];
    h += campo('rangos', ph, T('Comparaciones por pares'), comps, s[ph]);
    if (s[ph] !== 'nemenyi') {
      const ajustes = [['holm', 'Holm'], ['bonferroni', 'Bonferroni'], ['BH', T('Benjamini-Hochberg (FDR)')], ['ninguno', T('Sin ajuste')]];
      if (s[ph] === 'conover') ajustes.push(['tukey', T('Tukey (un paso)')]);
      if (s.ajuste === 'tukey' && s[ph] !== 'conover') s.ajuste = 'holm';
      h += campo('rangos', 'ajuste', T('Ajuste de los valores p'), ajustes, s.ajuste);
    }
    return h + campo('rangos', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formDiseno(c, d, paraComparar) {
    const s = estado.dis, { med, agr } = sanearDis(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    const opcFac = (excluir, conVacio) => (conVacio ? [['', T('— elige —')]] : []).concat(agr.filter(n => !excluir.includes(n) && n !== s.respuesta).map(n => [n, marca(n)]));
    const sel = (k, etq, excluir, ayuda) => campo('dis', k, etq, opcFac(excluir, !s[k]), s[k], ayuda);
    let h = campo('dis', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
    const papeles = [];
    if (MAX_TRAT[d]) {
      const max = MAX_TRAT[d], bloq = [s.bloque, s.fila, s.columna, s.repeticion].filter(Boolean);
      if (max === 1) {
        if (s.tratamientos.length > 1) s.tratamientos = s.tratamientos.slice(0, 1);
        const opc = opcFac(bloq, !s.tratamientos[0]);
        h += `<label class="field"><span>${esc(T('Tratamientos'))}</span><select data-grupo="dis" data-campo="tratamiento1">${opc.map(([v, t]) => opcion(v, t, s.tratamientos[0] || '')).join('')}</select></label>`;
      } else {
        s.tratamientos = s.tratamientos.filter(n => !bloq.includes(n)).slice(0, max);
        h += `<fieldset class="exp-casillas"><legend>${esc(max === 3 ? T('Factores de tratamiento (hasta 3, cruzados)') : T('Factores de tratamiento (hasta 2)'))}</legend>` +
          (agr.filter(n => n !== s.respuesta && !bloq.includes(n)).map(n => `<label class="imp-check"><input type="checkbox" data-lista="tratamientos" data-grupo="dis" value="${esc(n)}"${s.tratamientos.includes(n) ? ' checked' : ''}> ${esc(marca(n))}</label>`).join('') ||
            `<p class="small muted">${esc(T('No hay factores en la tabla.'))}</p>`) + '</fieldset>';
      }
      papeles.push(...s.tratamientos);
    }
    if (d === 'parcelas-divididas') h += campo('dis', 'principal', T('Las parcelas grandes están en'), [['dbca', T('bloques completos al azar')], ['dca', T('un diseño completamente al azar')], ['latino', T('un cuadro latino')]], s.principal);
    if (['parcelas-divididas', 'parcelas-subdivididas'].includes(d)) {
      h += sel('parcelaGrande', T('Factor de la parcela grande'), [s.subparcela, s.subsubparcela, s.bloque, s.repeticion, s.fila, s.columna]);
      h += sel('subparcela', T('Factor de la subparcela'), [s.parcelaGrande, s.subsubparcela, s.bloque, s.repeticion, s.fila, s.columna]);
      if (d === 'parcelas-subdivididas') h += sel('subsubparcela', T('Factor de la sub-subparcela'), [s.parcelaGrande, s.subparcela, s.bloque]);
    }
    if (d === 'franjas') {
      h += sel('franjaA', T('Factor en franjas horizontales'), [s.franjaB, s.bloque]) + sel('franjaB', T('Factor en franjas verticales'), [s.franjaA, s.bloque]);
    }
    const usados = [s.parcelaGrande, s.subparcela, s.subsubparcela, s.franjaA, s.franjaB].filter(Boolean).concat(MAX_TRAT[d] ? s.tratamientos : []);
    const conBloque = ['dbca', 'bib', 'latice', 'parcelas-subdivididas', 'franjas'].includes(d) || (d === 'parcelas-divididas' && s.principal === 'dbca');
    if (d === 'latice') h += sel('repeticion', T('Repeticiones'), usados.concat([s.bloque]));
    if (conBloque) h += sel('bloque', d === 'latice' ? T('Bloques incompletos (dentro de cada repetición)') : T('Bloques'), usados.concat([s.repeticion]));
    if (d === 'cuadro-latino' || (d === 'parcelas-divididas' && s.principal === 'latino')) h += sel('fila', T('Filas'), usados.concat([s.columna])) + sel('columna', T('Columnas'), usados.concat([s.fila]));
    if (d === 'parcelas-divididas' && s.principal === 'dca') h += sel('repeticion', T('Repetición de la parcela grande'), usados, T('Número de repetición de cada parcela grande dentro de su tratamiento.'));
    if (paraComparar) return h;
    if (['dca', 'dbca', 'cuadro-latino'].includes(d)) {
      h += campo('dis', 'tipoSC', T('Sumas de cuadrados'), [[3, T('Tipo III (medias marginales)')], [2, T('Tipo II (marginalidad)')], [1, T('Tipo I (secuenciales)')]], s.tipoSC,
        T('Con datos balanceados las tres coinciden; con desbalance cambian la hipótesis que se prueba.'));
    }
    return h + campo('dis', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Papeles del diseño elegido para comparar (los mismos que su método). */
  function papelesDis(d) {
    const s = estado.dis, e = { respuesta: s.respuesta };
    if (MAX_TRAT[d]) e.tratamientos = MAX_TRAT[d] === 1 ? s.tratamientos[0] : s.tratamientos.slice();
    for (const k of ['bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB']) if (s[k]) e[k] = s[k];
    if (d === 'parcelas-divididas') e.principal = s.principal;
    return e;
  }
  function factoresDis(d) { try { return SP.disenos.modeloDe(d, papelesDis(d)).factores.filter(Boolean); } catch (err) { return []; } }
  const nivelesDeFactor = (c, f) => { try { return SP.estructura.comoFactor(c.t, f).niveles; } catch (err) { return []; } };
  function formComparar(c, m) {
    const s = estado.cmp, d = s.diseno;
    let h = campo('cmp', 'diseno', T('Diseño del experimento'), DISENOS.map(x => [x, T(SP.disenos.DISENOS[x].nombre)]), d) + formDiseno(c, d, true);
    const facs = factoresDis(d);
    s.comparar = s.comparar.filter(f => facs.includes(f));
    if (!s.comparar.length && facs.length) s.comparar = [facs[0]];
    const uno = m === 'contrastes' || m === 'polinomios';
    if (uno && s.comparar.length > 1) s.comparar = s.comparar.slice(0, 1);
    if (uno) h += campo('cmp', 'comparar1', m === 'polinomios' ? T('Factor cuantitativo (dosis)') : T('Factor'), lista(facs), s.comparar[0] || '');
    else {
      h += '<fieldset class="exp-casillas"><legend>' + esc(T('Medias de')) + '</legend>' +
        facs.map(n => '<label class="imp-check"><input type="checkbox" data-lista="comparar" data-grupo="cmp" value="' + esc(n) + '"' + (s.comparar.includes(n) ? ' checked' : '') + '> ' + esc(n) + '</label>').join('') + '</fieldset>';
    }
    if (s.dentro && (!facs.includes(s.dentro) || s.comparar.includes(s.dentro))) s.dentro = '';
    h += campo('cmp', 'dentro', T('Dentro de cada nivel de'), [['', T('— todos juntos —')]].concat(facs.filter(f => !s.comparar.includes(f)).map(f => [f, f])), s.dentro,
      T('Con interacción, compara un factor dentro de cada nivel del otro.'));
    if (m === 'comparaciones-medias') {
      const met = [['tukey', 'Tukey'], ['dms', T('DMS de Fisher')], ['dms-protegida', T('DMS protegida')], ['duncan', 'Duncan'], ['snk', 'Student-Newman-Keuls'], ['scheffe', 'Scheffé'],
        ['bonferroni', 'Bonferroni'], ['sidak', 'Šidák'], ['holm', 'Holm'], ['dunnett', T('Dunnett (contra un testigo)')], ['games-howell', T('Games-Howell (varianzas distintas)')]];
      h += campo('cmp', 'metodo', T('Prueba'), met, s.metodo);
      if (s.metodo === 'dunnett') {
        const niv = nivelesDeFactor(c, s.comparar[0]);
        if (!niv.includes(s.testigo)) s.testigo = niv[0] || '';
        h += campo('cmp', 'testigo', T('Testigo'), lista(niv), s.testigo) +
          campo('cmp', 'alternativa', T('Hipótesis'), [['bilateral', T('Distinto del testigo')], ['mayor', T('Mayor que el testigo')], ['menor', T('Menor que el testigo')]], s.alternativa);
      }
    }
    if (m === 'contrastes') {
      const niv = nivelesDeFactor(c, s.comparar[0]);
      const ejemplo = T('Testigo vs resto: ') + niv.map((_, i) => (i === 0 ? niv.length - 1 : -1)).join(' ');
      h += '<label class="field"><span>' + esc(T('Contrastes (uno por renglón)')) + '</span><textarea data-grupo="cmp" data-campo="contrastes" rows="4" spellcheck="false" placeholder="' + esc(ejemplo) + '">' + esc(s.contrastes) + '</textarea>' +
        '<span class="field-help">' + esc(T('«nombre: coeficientes» en el orden de los niveles: {n}.', { n: niv.join(', ') })) + '</span></label>';
    }
    if (m === 'polinomios') h += campo('cmp', 'grado', T('Grado de la curva'), [[1, T('Recta')], [2, T('Cuadrática (con la dosis óptima)')], [3, T('Cúbica')]], s.grado);
    if (m === 'medias-ajustadas') h += campo('cmp', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel);
    else h += campo('cmp', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
    return h;
  }
  function sanearCor(c) {
    const s = estado.cor, num = c.numericas, medida = num.filter(n => !c.numFactor.includes(n)), base = medida.length >= 2 ? medida : num;
    if (!s._iniciado) {
      s._iniciado = true;
      s.y = ultimaRespuesta(c); s.x = base.find(n => n !== s.y) || '';
      s.variables = base.slice(0, 8); s.controles = base.filter(n => n !== s.x && n !== s.y).slice(0, 1);
    }
    if (!num.includes(s.x)) s.x = base[0] || '';
    if (!num.includes(s.y) || s.y === s.x) s.y = base.find(n => n !== s.x) || '';
    s.variables = s.variables.filter(n => num.includes(n));
    s.controles = s.controles.filter(n => num.includes(n) && n !== s.x && n !== s.y);
    return { num };
  }
  const FREC_RE = /^(n|frec.*|frecuencia.*|conteos?|cuentas?|casos|semillas|veces|freq?)$/i;
  function sanearCont(c) {
    const s = estado.cont, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2 && nivelesDe(c, n).length <= 50);
    const enteros = c.numericas.filter(n => { const v = c.t.col(n).valores; for (let i = 0; i < v.length; i++) if (v[i] === v[i] && (v[i] < 0 || v[i] !== Math.round(v[i]))) return false; return true; });
    if (!s._iniciado) {
      s._iniciado = true;
      s.frecuencia = enteros.find(n => FREC_RE.test(n)) || '';
      const facs = c.pap.factores.filter(n => agr.includes(n)).concat(agr.filter(n => !c.pap.factores.includes(n))).filter(n => n !== s.frecuencia);
      [s.fila, s.columna, s.estrato] = [facs[0] || '', facs[1] || '', facs[2] || ''];
      /* pareados: dos columnas con las mismas categorías */
      const par = (() => { for (let i = 0; i < agr.length; i++) for (let j = i + 1; j < agr.length; j++) { const a = nivelesDe(c, agr[i]), b = nivelesDe(c, agr[j]); if (a.length === b.length && a.every(l => b.includes(l))) return [agr[i], agr[j]]; } return [facs[0] || '', facs[1] || '']; })();
      [s.antes, s.despues] = par; [s.evaluador1, s.evaluador2] = par;
    }
    for (const k of ['fila', 'columna', 'estrato', 'antes', 'despues', 'evaluador1', 'evaluador2']) if (s[k] && !agr.includes(s[k])) s[k] = '';
    if (s.frecuencia && !enteros.includes(s.frecuencia)) s.frecuencia = '';
    return { agr, enteros };
  }
  function formCorrelacion(c, m) {
    const s = estado.cor, { num } = sanearCor(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    const metodos = [['pearson', T('Pearson (relación lineal)')], ['spearman', T('Spearman (rangos)')], ['kendall', T('Kendall (rangos)')]];
    let h = '';
    if (m === 'matriz-correlacion') {
      h += casillas('cor', 'variables', T('Variables (de 2 a 30)'), num, s.variables, marca, T('No hay columnas numéricas.'));
      h += campo('cor', 'metodo', T('Coeficiente'), metodos, s.metodo);
      h += campo('cor', 'ajuste', T('Ajuste de los valores p'), [['holm', 'Holm'], ['bonferroni', 'Bonferroni'], ['BH', T('Benjamini-Hochberg (FDR)')], ['ninguno', T('Sin ajuste')]], s.ajuste);
      h += campo('cor', 'faltantes', T('Filas con faltantes'), [['completas', T('Solo las completas en todas las variables')], ['pares', T('Cada par con sus filas completas')]], s.faltantes);
      return h + campo('cor', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
    }
    h += campo('cor', 'x', T('Variable x'), num.map(n => [n, marca(n)]), s.x) + campo('cor', 'y', T('Variable y'), num.filter(n => n !== s.x).map(n => [n, marca(n)]), s.y);
    if (m === 'correlacion-parcial') {
      h += casillas('cor', 'controles', T('Variables de control (de 1 a 10)'), num.filter(n => n !== s.x && n !== s.y), s.controles, marca, T('No hay otras columnas numéricas.'));
      if (s.metodo === 'kendall') s.metodo = 'pearson';
      h += campo('cor', 'metodo', T('Coeficiente'), metodos.slice(0, 2), s.metodo);
      return h + campo('cor', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
    }
    h += campo('cor', 'metodo', T('Coeficiente'), metodos, s.metodo) + campo('cor', 'alternativa', T('Hipótesis alternativa'), [['bilateral', T('Correlación distinta de cero')], ['mayor', T('Correlación positiva')], ['menor', T('Correlación negativa')]], s.alternativa);
    if (s.metodo === 'pearson') h += campo('cor', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel);
    else {
      h += campo('cor', 'exacta', T('Valor p'), [['auto', T('Exacto si se puede')], ['no', T('Aproximado')]], s.exacta, T('Exacto sin empates: Spearman hasta 1290 datos y Kendall con menos de 50, como R.'));
      h += '<label class="imp-check"><input type="checkbox" data-grupo="cor" data-campo="continuidad"' + (s.continuidad ? ' checked' : '') + '> ' + esc(T('Corrección por continuidad (en el p aproximado)')) + '</label>';
    }
    return h + campo('cor', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formContingencia(c, m) {
    const s = estado.cont, { agr, enteros } = sanearCont(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    const opc = (excluir, vacio) => (vacio ? [['', vacio]] : []).concat(agr.filter(n => !excluir.includes(n)).map(n => [n, marca(n)]));
    const sel = (k, etq, excluir, ayuda) => campo('cont', k, etq, opc(excluir.concat([s.frecuencia]), s[k] ? '' : T('— elige —')), s[k], ayuda);
    let h = '';
    if (m === 'tabla-contingencia' || m === 'mantel-haenszel') {
      const est = m === 'mantel-haenszel' ? [s.estrato] : [];      // el estrato solo cuenta en Mantel-Haenszel
      h += sel('fila', T('Variable de las filas'), [s.columna, ...est]) + sel('columna', T('Variable de las columnas'), [s.fila, ...est]);
      if (m === 'mantel-haenszel') h += sel('estrato', T('Estratos (lotes, sitios, años)'), [s.fila, s.columna]);
    } else if (m === 'mcnemar') {
      h += sel('antes', T('Primera clasificación (antes)'), [s.despues]) + sel('despues', T('Segunda clasificación (después)'), [s.antes], T('Cada fila es el mismo caso clasificado dos veces, con las mismas categorías.'));
    } else {
      h += sel('evaluador1', T('Evaluador 1'), [s.evaluador2]) + sel('evaluador2', T('Evaluador 2'), [s.evaluador1], T('Las dos columnas con las mismas categorías; para la ponderada, en orden.'));
    }
    const usadas = { 'tabla-contingencia': [s.fila, s.columna], 'mantel-haenszel': [s.fila, s.columna, s.estrato], mcnemar: [s.antes, s.despues], kappa: [s.evaluador1, s.evaluador2] }[m];
    h += campo('cont', 'frecuencia', T('Frecuencias'), [['', T('— cada fila es un caso —')]].concat(enteros.filter(n => !usadas.includes(n)).map(n => [n, n])), s.frecuencia, T('Si la tabla ya trae los conteos, elige su columna.'));
    if (m === 'kappa') h += campo('cont', 'ponderacion', T('Pesos de la kappa ponderada'), [['cuadratica', T('Cuadráticos')], ['lineal', T('Lineales')]], s.ponderacion);
    else h += '<label class="imp-check"><input type="checkbox" data-grupo="cont" data-campo="correccion"' + (s.correccion ? ' checked' : '') + '> ' + esc(m === 'tabla-contingencia' ? T('Corrección de Yates (tablas 2 × 2)') : T('Corrección por continuidad')) + '</label>';
    if (m !== 'mcnemar') h += campo('cont', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel);
    return h + campo('cont', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  const casillas = (grupo, nombreLista, leyenda, nombres, elegidos, marca, vacio) => '<fieldset class="exp-casillas"><legend>' + esc(leyenda) + '</legend>' +
    (nombres.map(n => '<label class="imp-check"><input type="checkbox" data-lista="' + nombreLista + '" data-grupo="' + grupo + '" value="' + esc(n) + '"' + (elegidos.includes(n) ? ' checked' : '') + '> ' + esc(marca(n)) + '</label>').join('') ||
      '<p class="small muted">' + esc(vacio) + '</p>') + '</fieldset>';
  function formRegresion(c, m) {
    const s = estado.reg, { num } = sanearReg(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    let h = campo('reg', 'respuesta', T('Variable de respuesta (y)'), lista(num), s.respuesta);
    const cand = num.filter(n => n !== s.respuesta);
    if (m === 'regresion-polinomial') {
      h += campo('reg', 'x', T('Variable x'), cand.map(n => [n, marca(n)]), s.x) +
        campo('reg', 'grado', T('Grado del polinomio'), [[2, T('2 (cuadrático)')], [3, T('3 (cúbico)')], [4, T('4 (cuártico)')]], s.grado);
    } else {
      h += casillas('reg', 'predictores', m === 'regresion-lineal' ? T('Predictores (hasta 15)') : T('Predictores candidatos (de 2 a 15)'), cand, s.predictores, marca, T('No hay otras columnas numéricas.'));
    }
    if (m === 'seleccion-pasos') {
      h += campo('reg', 'criterio', T('Criterio'), [['aic', T('AIC (como step de R)')], ['p', T('Valor p de la F parcial')]], s.criterio);
      const dirs = s.criterio === 'aic' ? [['ambas', T('Ambas direcciones, desde el modelo completo')], ['atras', T('Hacia atrás')], ['adelante', T('Hacia adelante')]]
        : [['mixta', T('Mixta (entra y sale)')], ['adelante', T('Hacia adelante')], ['atras', T('Hacia atrás')]];
      if (!dirs.some(d => d[0] === s.direccion)) s.direccion = dirs[0][0];
      h += campo('reg', 'direccion', T('Dirección'), dirs, s.direccion);
      if (s.criterio === 'p') {
        h += campo('reg', 'entrada', T('Nivel para entrar'), [[0.05, '0.05'], [0.1, '0.10'], [0.15, '0.15'], [0.01, '0.01']], s.entrada) +
          campo('reg', 'salida', T('Nivel para salir'), [[0.1, '0.10'], [0.05, '0.05'], [0.15, '0.15'], [0.2, '0.20']], s.salida, T('En la mixta, el nivel para entrar no puede ser mayor que el de salir.'));
      }
      return h;
    }
    if (m === 'mejores-subconjuntos') return h + campo('reg', 'mejores', T('Modelos por tamaño'), [[1, '1'], [2, '2'], [3, '3']], s.mejores);
    const vars = m === 'regresion-polinomial' ? [s.x] : s.predictores;
    h += '<label class="field"><span>' + esc(T('Predecir en (opcional)')) + '</span><textarea data-grupo="reg" data-campo="predecir" rows="3" spellcheck="false" placeholder="' + esc(vars.length > 1 ? '' : '10 20 30') + '">' + esc(s.predecir) + '</textarea>' +
      '<span class="field-help">' + esc(vars.length > 1 ? T('Un renglón por punto con los valores de {v}, en ese orden, separados por espacios.', { v: vars.join(', ') }) : T('Valores de {v} separados por espacios.', { v: vars[0] || 'x' })) + '</span></label>';
    return h + campo('reg', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('reg', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formAncova(c) {
    const s = estado.anc, { med, agr } = sanearAnc(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    let h = campo('anc', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
    h += casillas('anc', 'tratamientos', T('Factores de tratamiento (hasta 2, cruzados)'), agr.filter(n => n !== s.respuesta && n !== s.bloque && !s.covariables.includes(n)), s.tratamientos, marca, T('No hay factores en la tabla.'));
    h += campo('anc', 'bloque', T('Bloques'), [['', T('— sin bloques (completamente al azar) —')]].concat(agr.filter(n => n !== s.respuesta && !s.tratamientos.includes(n) && !s.covariables.includes(n)).map(n => [n, marca(n)])), s.bloque);
    h += casillas('anc', 'covariables', T('Covariables (hasta 2)'), med.filter(n => n !== s.respuesta && !s.tratamientos.includes(n) && n !== s.bloque), s.covariables, n => n, T('No hay otras columnas numéricas.'));
    h += campo('anc', 'tipoSC', T('Sumas de cuadrados'), [[3, T('Tipo III (medias marginales)')], [2, T('Tipo II (marginalidad)')], [1, T('Tipo I (tratamientos ajustados por la covariable)')]], s.tipoSC);
    h += campo('anc', 'metodo', T('Comparación de las medias ajustadas'), [['tukey', 'Tukey'], ['dms', T('DMS de Fisher')], ['bonferroni', 'Bonferroni'], ['sidak', 'Šidák'], ['holm', 'Holm'], ['scheffe', 'Scheffé'], ['ninguna', T('Ninguna')]], s.metodo);
    return h + campo('anc', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('anc', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formModelo(c) {
    const s = estado.ml, num = c.numericas;
    if (!s._iniciado) {
      s._iniciado = true;
      s.respuesta = ultimaRespuesta(c);
      const b = c.pap.bloque, fs = c.pap.factores.filter(n => n !== b && n !== s.respuesta).slice(0, 2);
      s.derecha = [b, fs.join(' * ')].filter(Boolean).join(' + ');
      s.comoFactor = c.numFactor.filter(n => s.derecha.split(/[^\p{L}\p{N}_.]+/u).includes(n));
    }
    if (!num.includes(s.respuesta)) s.respuesta = ultimaRespuesta(c);
    let h = campo('ml', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += '<label class="field"><span>' + esc(T('Términos del modelo (lo que va después de «~»)')) + '</span><input type="text" data-grupo="ml" data-campo="derecha" spellcheck="false" autocomplete="off" value="' + esc(s.derecha) + '" placeholder="bloque + variedad * dosis">' +
      '<span class="field-help">' + esc(T('+ suma términos, * cruza con su interacción, : solo la interacción, / anida (a / b = b dentro de a), (a + b)^2 hasta las dobles, - 1 sin intercepto.')) + '</span></label>';
    const inf = { numericas: c.numericas, factores: c.t.nombres.filter(n => !c.numericas.includes(n)) };
    const lec = SP.constructorModelos.interpretar(s.respuesta, s.derecha, inf, s.comoFactor);
    if (lec.ok) {
      h += '<ul class="ml-terminos small">' + lec.terminos.map(x => '<li><b>' + esc(x.etiqueta) + '</b>: ' + esc(x.explicacion) + '</li>').join('') + '</ul>';
      const numEnFormula = lec.variables.filter(v => c.numericas.includes(v));
      s.comoFactor = s.comoFactor.filter(v => numEnFormula.includes(v));
      if (numEnFormula.length) h += casillas('ml', 'comoFactor', T('Numéricas que son tratamientos (factor)'), numEnFormula, s.comoFactor, n => n, '');
    } else h += '<p class="msg msg-error small" role="alert"><strong>' + esc(lec.mensaje) + '</strong>' + (lec.arreglo ? ' <span class="msg-fix">' + esc(lec.arreglo) + '</span>' : '') + '</p>';
    h += campo('ml', 'tipoSC', T('Sumas de cuadrados'), [[3, T('Tipo III (medias marginales)')], [2, T('Tipo II (marginalidad)')], [1, T('Tipo I (secuenciales)')]], s.tipoSC);
    return h + campo('ml', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('ml', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formulario(c) {
    if (estado.metodo === 'modelo-lineal') return formModelo(c);
    if (CORREL.includes(estado.metodo)) return formCorrelacion(c, estado.metodo);
    if (CONTING.includes(estado.metodo)) return formContingencia(c, estado.metodo);
    if (REGRESION.includes(estado.metodo)) return formRegresion(c, estado.metodo);
    if (estado.metodo === 'ancova') return formAncova(c);
    if (DISENOS.includes(estado.metodo)) return formDiseno(c, estado.metodo);
    if (COMPARAR.includes(estado.metodo)) return formComparar(c, estado.metodo);
    if (estado.metodo === 'prueba-t') return formDos(c, true);
    if (estado.metodo === 'wilcoxon') return formDos(c, false);
    if (estado.metodo === 'kruskal-wallis') return formRangos(c, false);
    if (estado.metodo === 'friedman') return formRangos(c, true);
    return formSupuestos(c);
  }
  /** Entradas y opciones del método elegido, desde el estado del formulario. */
  function pedido() {
    const m = estado.metodo;
    if (m === 'modelo-lineal') { const s = estado.ml; return { e: { respuesta: s.respuesta }, op: { derecha: s.derecha, comoFactor: s.comoFactor.slice(), tipoSC: +s.tipoSC, alfa: +s.alfa, nivel: +s.nivel } }; }
    if (CORREL.includes(m)) {
      const s = estado.cor;
      if (m === 'matriz-correlacion') return { e: { variables: s.variables.slice() }, op: { metodo: s.metodo, ajuste: s.ajuste, faltantes: s.faltantes, alfa: +s.alfa } };
      if (m === 'correlacion-parcial') return { e: { x: s.x, y: s.y, controles: s.controles.slice() }, op: { metodo: s.metodo, alfa: +s.alfa } };
      return { e: { x: s.x, y: s.y }, op: { metodo: s.metodo, alternativa: s.alternativa, nivel: +s.nivel, alfa: +s.alfa, exacta: s.exacta, continuidad: !!s.continuidad } };
    }
    if (CONTING.includes(m)) {
      const s = estado.cont, fr = s.frecuencia ? { frecuencia: s.frecuencia } : {};
      if (m === 'tabla-contingencia') return { e: Object.assign({ fila: s.fila, columna: s.columna }, fr), op: { correccion: !!s.correccion, nivel: +s.nivel, alfa: +s.alfa } };
      if (m === 'mcnemar') return { e: Object.assign({ antes: s.antes, despues: s.despues }, fr), op: { correccion: !!s.correccion, alfa: +s.alfa } };
      if (m === 'mantel-haenszel') return { e: Object.assign({ fila: s.fila, columna: s.columna, estrato: s.estrato }, fr), op: { correccion: !!s.correccion, nivel: +s.nivel, alfa: +s.alfa } };
      return { e: Object.assign({ evaluador1: s.evaluador1, evaluador2: s.evaluador2 }, fr), op: { ponderacion: s.ponderacion, nivel: +s.nivel, alfa: +s.alfa } };
    }
    if (REGRESION.includes(m)) {
      const s = estado.reg;
      if (m === 'regresion-polinomial') return { e: { respuesta: s.respuesta, predictores: s.x }, op: { grado: +s.grado, nivel: +s.nivel, alfa: +s.alfa, predecir: s.predecir } };
      const e = { respuesta: s.respuesta, predictores: s.predictores.slice() };
      if (m === 'regresion-lineal') return { e, op: { nivel: +s.nivel, alfa: +s.alfa, predecir: s.predecir } };
      if (m === 'seleccion-pasos') return { e, op: { criterio: s.criterio, direccion: s.direccion, entrada: +s.entrada, salida: +s.salida } };
      return { e, op: { mejores: +s.mejores } };
    }
    if (m === 'ancova') {
      const s = estado.anc, e = { respuesta: s.respuesta, tratamientos: s.tratamientos.slice(), covariables: s.covariables.slice() };
      if (s.bloque) e.bloque = s.bloque;
      return { e, op: { tipoSC: +s.tipoSC, metodo: s.metodo, alfa: +s.alfa, nivel: +s.nivel } };
    }
    if (COMPARAR.includes(m)) {
      const s = estado.cmp, e = Object.assign({ diseno: s.diseno }, papelesDis(s.diseno), { comparar: s.comparar.slice() });
      if (s.dentro) e.dentro = [s.dentro];
      const op = { alfa: +s.alfa };
      if (m === 'comparaciones-medias') Object.assign(op, { metodo: s.metodo, testigo: s.testigo, alternativa: s.alternativa });
      if (m === 'contrastes') op.contrastes = s.contrastes;
      if (m === 'polinomios') op.grado = +s.grado;
      if (m === 'medias-ajustadas') op.nivel = +s.nivel;
      return { e, op };
    }
    if (DISENOS.includes(m)) {
      const s = estado.dis, e = { respuesta: s.respuesta };
      if (MAX_TRAT[m]) e.tratamientos = MAX_TRAT[m] === 1 ? s.tratamientos[0] : s.tratamientos.slice();
      for (const k of ['bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB']) if (s[k]) e[k] = s[k];
      if (m === 'parcelas-divididas') e.principal = s.principal;
      return { e, op: { tipoSC: +s.tipoSC, alfa: +s.alfa } };
    }
    if (m === 'prueba-t' || m === 'wilcoxon') {
      const s = estado.dos, e = { modo: s.modo };
      if (s.modo === 'una') e.variable = s.variable;
      else if (s.modo === 'pareadas') Object.assign(e, { antes: s.antes, despues: s.despues });
      else Object.assign(e, { respuesta: s.respuesta, grupo: s.grupo, niveles: [s.nivelA, s.nivelB] });
      const op = { mu: Number(s.mu) || 0, alternativa: s.alternativa, nivel: +s.nivel, alfa: +s.alfa };
      if (m === 'prueba-t') op.varIguales = !!s.varIguales; else Object.assign(op, { exacta: s.exacta, correccion: !!s.correccion });
      return { e, op };
    }
    if (m === 'kruskal-wallis' || m === 'friedman') {
      const s = estado.rangos, f = m === 'friedman', posthoc = f ? s.posthocF : s.posthocKW;
      const e = { respuesta: s.respuesta, tratamiento: s.tratamiento };
      if (f) e.bloque = s.bloque;
      return { e, op: { posthoc, ajuste: posthoc === 'nemenyi' ? 'tukey' : s.ajuste, alfa: +s.alfa } };
    }
    const s = estado.sup;
    return { e: { respuesta: s.respuesta, tratamientos: s.tratamientos, bloque: s.bloque || undefined, orden: s.orden || undefined }, op: { alfa: +s.alfa } };
  }

  /* ---------------- resultado ---------------- */
  const ETIQUETA = { verde: 'Bien', ambar: 'Revisar', rojo: 'Problema', gris: 'No aplica' };
  const PEOR = { gris: 0, verde: 1, ambar: 2, rojo: 3 };
  function semaforoHTML(lista, global, titulo, aria) {
    return `<div class="semaforo s-${global}" role="group" aria-label="${esc(aria)}">` +
      `<p class="semaforo-global"><span class="luz" aria-hidden="true"></span><b>${esc(titulo)}</b></p>` +
      `<ul>${lista.map(s => `<li class="s-${s.color}"><span class="luz" aria-hidden="true"></span><span class="nombre">${esc(s.nombre)}</span><span class="estado">${esc(T(ETIQUETA[s.color]))}</span><span class="texto">${esc(s.texto)}</span></li>`).join('')}</ul></div>`;
  }
  const codigoHTML = codigo => `<details class="exp-codigo"><summary>${esc(T('Código R equivalente'))}</summary><pre><code>${esc(codigo)}</code></pre>` +
    `<button type="button" class="btn btn-ghost btn-sm" data-accion="copiar-r">${esc(T('Copiar el código'))}</button></details>`;
  /* el análisis que está en pantalla, tal como se pidió (método, entradas y opciones) */
  const pedidoActual = () => Object.assign({ metodo: estado.metodo, bloque: 4 }, pedido());
  const botonReporte = () => {
    const ya = SP.app.reporte && SP.app.reporte.tiene(pedidoActual());
    return `<button type="button" class="btn ${ya ? 'btn-ghost' : 'btn-secondary'} btn-sm exp-reporte" data-accion="reporte"${ya ? ' aria-pressed="true"' : ''}>${esc(ya ? T('En el reporte ✓') : T('Agregar al reporte'))}</button>`;
  };
  const copiarHTML = i => `<div class="btn-row exp-acciones"><button type="button" class="btn btn-secondary btn-sm" data-accion="copiar" data-cuadro="${i}">${esc(T('Copiar cuadro'))}</button></div>`;

  function graficasSupuestos(r) {
    const g = r.graficas, qq = g.qq;
    /* banda en las posiciones de cada punto (interpolada entre las posiciones donde se calculó) */
    const bt = qq.banda.teorico, interp = (arr, x) => { let k = 1; while (k < bt.length - 1 && bt[k] < x) k++; const t0 = bt[k - 1], t1 = bt[k]; const w = t1 > t0 ? (x - t0) / (t1 - t0) : 0; return arr[k - 1] + w * (arr[k] - arr[k - 1]); };
    const fuera = qq.teorico.map((x, i) => qq.observado[i] < interp(qq.banda.inf, x) || qq.observado[i] > interp(qq.banda.sup, x));
    const etiquetas = new Set(fuera.map((f, i) => (f ? i : -1)).filter(i => i >= 0).sort((a, b) => Math.abs(qq.observado[b]) - Math.abs(qq.observado[a])).slice(0, 4));
    const pqq = qq.teorico.map((x, i) => ({ x, y: qq.observado[i], marca: fuera[i], etiqueta: etiquetas.has(i) ? qq.fila[i] : undefined }));
    const graficaQQ = SP.graficas.dispersion({
      titulo: T('Q-Q normal de los residuos estandarizados'), x: { titulo: T('Cuantil teórico de la normal') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Gráfico Q-Q: {k} de {n} residuos quedan fuera de la banda de confianza.', { k: fuera.filter(Boolean).length, n: qq.teorico.length }),
      puntos: SP.graficas.adelgazar(pqq, 2500), banda: { x: bt, inf: qq.banda.inf, sup: qq.banda.sup }, diagonal: true,
    });
    const pr = g.ajustados.map((x, i) => ({ x, y: g.residuos[i], marca: Math.abs(g.residuos[i]) > 2, etiqueta: Math.abs(g.residuos[i]) > 3 ? g.filas[i] : undefined }));
    const graficaRA = SP.graficas.dispersion({
      titulo: T('Residuos contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Residuos contra ajustados: {k} residuos pasan de ±2.', { k: pr.filter(p => p.marca).length }),
      puntos: SP.graficas.adelgazar(pr.filter(p => Number.isFinite(p.y)), 2500), referencias: [{ y: 0 }, { y: 2, discontinua: true }, { y: -2, discontinua: true }],
    });
    const orden = g.residuos.map((y, i) => ({ x: i + 1, y })).filter(p => Number.isFinite(p.y));
    const pocos = orden.length <= 400;
    const graficaOrden = SP.graficas.dispersion({
      titulo: r.independencia.orden ? T('Residuos en el orden de «{c}»', { c: r.independencia.orden }) : T('Residuos en el orden de las filas'),
      x: { titulo: T('Posición') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Residuos en orden; Durbin-Watson = {d}.', { d: r.independencia.durbin_watson.DW.toFixed(3) }),
      puntos: pocos ? orden : [], linea: { x: SP.graficas.adelgazar(orden, 3000).map(p => p.x), y: SP.graficas.adelgazar(orden, 3000).map(p => p.y) }, referencias: [{ y: 0 }],
    });
    return `<div class="ana-graficas">${graficaQQ}${graficaRA}${graficaOrden}</div>`;
  }
  function pintarSupuestos(r, rep, codigo, ms) {
    const rec = rep.recomendaciones;
    $('#anaResultado').innerHTML =
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('modelo {m} · n = {n} · calculado en {ms} ms', { m: r.formula, n: r.n, ms: Math.max(1, Math.round(ms)) }))}</span>${botonReporte()}</div>` +
      semaforoHTML(rep.semaforo, r.global, T({ verde: 'Los supuestos se cumplen', ambar: 'Hay supuestos que revisar', rojo: 'Hay supuestos que no se cumplen', gris: 'Sin datos suficientes' }[r.global]), T('Semáforo de los supuestos')) +
      (rec.length ? `<div class="callout exp-conclusion"><p><b>${esc(T('Qué hacer'))}</b></p><ul class="ana-rec">${rec.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '') +
      (r.excluidas ? `<p class="small muted">${esc(T('{k} filas con algún valor faltante en el modelo no entran.', { k: r.excluidas }))}</p>` : '') +
      graficasSupuestos(r) +
      SP.cuadros.html(rep.cuadros[0], { numero: 1 }) + copiarHTML(0) +
      (rep.cuadros[1] ? `<details class="exp-extras"><summary>${esc(T('Varianza de los residuos por tratamiento'))}</summary>${SP.cuadros.html(rep.cuadros[1], { numero: 2 })}</details>` : '') +
      codigoHTML(codigo);
  }

  /** Gráficas de la regresión: la recta o curva con sus bandas (o observados contra ajustados) y el diagnóstico. */
  function graficasRegresion(r) {
    const inf = r.influencia, n = r.observados.length, p = r.coeficientes.nombre.length, out = [];
    const etq = i => (inf.banderas.cook[i] || Math.abs(inf.rstudent[i]) > 3 ? r.filas[i] : undefined);
    if (r.banda) {
      const b = r.banda;
      out.push(SP.graficas.dispersion({
        titulo: r.modelo === 'polinomial' ? T('Curva ajustada de grado {g}', { g: r.grado }) : T('Recta ajustada'), x: { titulo: r.predictores[0] }, y: { titulo: r.respuesta },
        descripcion: T('«{y}» contra «{x}» con la línea ajustada, la banda de confianza de la media al {c} % (sombreada) y la de predicción (borde discontinuo); {k} observaciones influyentes resaltadas.', { y: r.respuesta, x: r.predictores[0], c: Math.round(100 * r.nivel), k: inf.n_influyentes }),
        puntos: SP.graficas.adelgazar(r.x.map((x, i) => ({ x, y: r.observados[i], marca: inf.influyente[i], etiqueta: etq(i) })), 2500),
        bandas: [{ x: b.x, inf: b.ip_inf, sup: b.ip_sup, prediccion: true }, { x: b.x, inf: b.ic_inf, sup: b.ic_sup }], linea: { x: b.x, y: b.ajuste },
      }));
    } else {
      out.push(SP.graficas.dispersion({
        titulo: T('Observados contra ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('«{y}» observado', { y: r.respuesta }) }, diagonal: true,
        descripcion: T('Valores observados de «{y}» contra los ajustados; con un buen ajuste quedan cerca de la diagonal.', { y: r.respuesta }),
        puntos: SP.graficas.adelgazar(r.ajustados.map((x, i) => ({ x, y: r.observados[i], marca: inf.influyente[i], etiqueta: etq(i) })), 2500),
      }));
    }
    out.push(SP.graficas.dispersion({
      titulo: T('Residuos contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Residuos estandarizados contra ajustados: una nube sin forma y de ancho parejo indica un modelo adecuado.'),
      puntos: SP.graficas.adelgazar(r.ajustados.map((x, i) => ({ x, y: inf.rstandard[i], marca: Math.abs(inf.rstandard[i]) > 2, etiqueta: etq(i) })).filter(q => Number.isFinite(q.y)), 2500),
      referencias: [{ y: 0 }, { y: 2, discontinua: true }, { y: -2, discontinua: true }],
    }));
    const rs = Array.from(inf.rstandard).filter(Number.isFinite).sort((a, b) => a - b), m = rs.length, a = m <= 10 ? 3 / 8 : 1 / 2;
    const qq = rs.map((y, i) => ({ x: SP.dist.qnorm((i + 1 - a) / (m + 1 - 2 * a)), y }));
    out.push(SP.graficas.dispersion({
      titulo: T('Q-Q normal de los residuos'), x: { titulo: T('Cuantil teórico de la normal') }, y: { titulo: T('Residuo estandarizado') }, diagonal: true,
      descripcion: T('Gráfico Q-Q de los residuos estandarizados: cerca de la diagonal si son normales.'), puntos: SP.graficas.adelgazar(qq, 2500),
    }));
    const corte = SP.dist.qf(0.5, p, n - p);
    out.push(SP.graficas.dispersion({
      titulo: T('Residuos contra palanca'), x: { titulo: T('Palanca (hᵢᵢ)') }, y: { titulo: T('Residuo estudentizado') },
      descripcion: T('Residuo estudentizado contra palanca: los puntos a la derecha de la línea vertical tienen palanca alta; {k} con distancia de Cook mayor que el percentil 50 de F({p}, {g}) = {c}.', { k: inf.banderas.cook.filter(Boolean).length, p, g: n - p, c: corte.toFixed(3) }),
      puntos: SP.graficas.adelgazar(Array.from(inf.palanca, (h, i) => ({ x: h, y: inf.rstudent[i], marca: inf.influyente[i], etiqueta: etq(i) })).filter(q => Number.isFinite(q.y)), 2500),
      referencias: [{ y: 0 }, { y: 2, discontinua: true }, { y: -2, discontinua: true }], verticales: [{ x: inf.cotas.palanca, discontinua: true }],
    }));
    return out.join('');
  }
  function graficasAncova(r) {
    const g = r.grafica, out = [];
    out.push(SP.graficas.dispersion({
      titulo: T('«{y}» contra «{c}»: una recta por tratamiento', { y: r.respuesta, c: g.covariable }), x: { titulo: g.covariable }, y: { titulo: r.respuesta },
      descripcion: T('Cada punto es una parcela con el marcador de su tratamiento; las rectas paralelas tienen la pendiente común y pasan por la media ajustada de cada tratamiento en la media de «{c}».', { c: g.covariable }),
      puntos: SP.graficas.adelgazar(g.puntos.map(q => ({ x: q.x, y: q.y, serie: q.g })), 2500),
      lineas: g.rectas.map((rc, k) => ({ x: rc.x, y: rc.x.map(x => rc.media + g.pendiente * (x - g.xbar)), serie: k })).filter(l => Number.isFinite(l.y[0])),
      leyenda: { titulo: r.tratamientos.join(' × '), series: g.grupos },
    }));
    const m = r.medias[0], cmp = r.comparaciones.find(x => x.factor === m.factor);
    out.push(SP.graficas.medias({
      titulo: T('Medias ajustadas de «{f}»', { f: m.factor }), y: { titulo: r.respuesta },
      descripcion: T('Medias de {f} ajustadas por la covariable, con su intervalo de confianza{l}.', { f: m.factor, l: cmp ? T('; medias con una letra en común no difieren') : '' }),
      grupos: m.filas.map((f, i) => ({ nombre: f.nombre, media: f.media, inf: f.ic[0], sup: f.ic[1], letra: cmp ? cmp.medias[i].letras : '' })),
    }));
    return out.join('');
  }
  function graficasSeleccion(r) {
    if (r.tipo === 'seleccion') {
      const xs = r.pasos.map((_, k) => k), ys = r.pasos.map(q => q.aic);
      return SP.graficas.dispersion({
        titulo: T('AIC en cada paso'), x: { titulo: T('Paso') }, y: { titulo: 'AIC' }, descripcion: T('AIC del modelo después de cada paso de la selección; menor es mejor.'),
        puntos: xs.map((x, k) => ({ x, y: ys[k], marca: k === xs.length - 1 })), linea: { x: xs, y: ys },
      });
    }
    const prim = r.filas.filter(f => f.rango === 1), xs = prim.map(f => f.tamano);
    return SP.graficas.dispersion({
      titulo: T('BIC del mejor modelo de cada tamaño'), x: { titulo: T('Número de predictores') }, y: { titulo: 'BIC' },
      descripcion: T('BIC del mejor modelo con cada número de predictores; el mínimo ({k}) es el elegido.', { k: r.elegido.bic }),
      puntos: prim.map(f => ({ x: f.tamano, y: f.bic, marca: f.tamano === r.elegido.bic })), linea: { x: xs, y: prim.map(f => f.bic) },
    }) + SP.graficas.dispersion({
      titulo: T('Cp de Mallows contra coeficientes'), x: { titulo: T('Coeficientes (p)') }, y: { titulo: 'Cp' },
      descripcion: T('Cp del mejor modelo de cada tamaño; los buenos modelos quedan cerca de la recta Cp = p o debajo.'),
      puntos: prim.map(f => ({ x: f.tamano + 1, y: f.cp, marca: f.tamano === r.elegido.cp })), linea: { x: [xs[0] + 1, xs[xs.length - 1] + 1], y: [xs[0] + 1, xs[xs.length - 1] + 1] },
    });
  }

  function graficasCorrelacion(r) {
    const f3 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '');
    if (r.tipo === 'correlacion') {
      const xs = r.puntos.x, x0 = Math.min(...xs), x1 = Math.max(...xs), b = r.recta;
      return SP.graficas.dispersion({
        titulo: T('«{y}» contra «{x}»', { x: r.x, y: r.y }), x: { titulo: r.x }, y: { titulo: r.y },
        descripcion: T('Dispersión de {n} pares con la recta de mínimos cuadrados; coeficiente = {v}.', { n: r.n, v: f3(r.estimado) }),
        puntos: SP.graficas.adelgazar(xs.map((x, i) => ({ x, y: r.puntos.y[i] })), 2500), linea: { x: [x0, x1], y: [b.intercepto + b.pendiente * x0, b.intercepto + b.pendiente * x1] },
      });
    }
    if (r.tipo === 'matriz') {
      const est = p => (p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : '');
      const pa = (i, j) => { const x = r.pares.find(z => (z.i === i && z.j === j) || (z.i === j && z.j === i)); return x ? x.p_ajustado : NaN; };
      return SP.graficas.mapaCalor({
        titulo: T('Matriz de correlaciones'), filas: r.variables, columnas: r.variables, valores: r.r, escala: 'divergente', leyenda: r.metodo === 'pearson' ? 'r' : r.metodo === 'spearman' ? 'ρ' : 'τ',
        textos: r.r.map((f, i) => f.map((v, j) => (i === j ? '1' : f3(v) + est(pa(i, j))))),
        descripcion: T('Mapa de calor de las correlaciones entre {k} variables: oro, positivas; gris, negativas; más intenso, más fuerte. Asteriscos: p ajustado < 0.05, 0.01 y 0.001.', { k: r.variables.length }),
      });
    }
    const ex = r.residuos.x, ey = r.residuos.y, x0 = Math.min(...ex), x1 = Math.max(...ex);
    let sxy = 0, sxx = 0; for (let i = 0; i < ex.length; i++) { sxy += ex[i] * ey[i]; sxx += ex[i] * ex[i]; }
    return SP.graficas.dispersion({
      titulo: T('«{y}» contra «{x}» sin los controles', { x: r.x, y: r.y }), x: { titulo: T('«{x}» (residuo)', { x: r.x }) }, y: { titulo: T('«{y}» (residuo)', { y: r.y }) },
      descripcion: T('Gráfica de variable agregada: los residuos de cada variable sobre los controles; su correlación es la parcial ({v}).', { v: f3(r.parcial.r) }),
      puntos: SP.graficas.adelgazar(ex.map((x, i) => ({ x, y: ey[i] })), 2500), linea: { x: [x0, x1], y: [sxy / sxx * x0, sxy / sxx * x1] }, referencias: [{ y: 0, discontinua: true }],
    });
  }
  function graficasContingencia(r) {
    if (r.tipo === 'contingencia') {
      const [nf, nc] = r.niveles;
      return SP.graficas.mosaico({
        titulo: T('Mosaico de «{f}» × «{c}»', { f: r.fila, c: r.columna }), filas: nf, columnas: nc, conteos: r.observados, residuos: r.chi.ajustados,
        x: { titulo: r.fila }, y: { titulo: r.columna },
        descripcion: T('Mosaico: el ancho de cada barra es el total de «{f}» y las alturas, la proporción de cada «{c}»; oro intenso, muchos más casos de los esperados; gris intenso, muchos menos.', { f: r.fila, c: r.columna }),
      });
    }
    if (r.tipo === 'mcnemar' || r.tipo === 'kappa') {
      const a = r.tipo === 'kappa' ? r.evaluador1 : r.antes, b = r.tipo === 'kappa' ? r.evaluador2 : r.despues;
      return SP.graficas.mapaCalor({
        titulo: T('«{a}» contra «{b}»', { a, b }), filas: r.niveles, columnas: r.niveles, valores: r.observados, escala: 'secuencial', leyenda: T('casos'),
        textos: r.observados.map(f => f.map(v => String(v))),
        descripcion: T('Frecuencias de cada combinación; la diagonal son los casos que no cambiaron (o en que coinciden).'),
      });
    }
    if (r.tipo === 'cmh' && r.estratos) {
      const nombres = r.niveles[2].concat([T('Común')]), ors = r.estratos.concat([{ razon_momios: r.razon_momios, ic: r.ic }]);
      return SP.graficas.medias({
        titulo: T('Razón de momios por estrato'), y: { titulo: T('Razón de momios (escala log)') }, log: true, referencias: [{ y: 1, discontinua: true }],
        descripcion: T('Razón de momios de cada nivel de «{s}» con su IC y la común de Mantel-Haenszel; la línea punteada es 1 (sin asociación).', { s: r.estrato }),
        grupos: nombres.map((nm, k) => ({ nombre: nm, media: ors[k].razon_momios, inf: ors[k].ic[0], sup: ors[k].ic[1], marca: k === nombres.length - 1 })),
      });
    }
    return '';
  }

  /** Gráfica de cajas del método: los grupos comparados, con letras cuando las hay. */
  function graficaMetodo(r, op) {
    op = op || {};
    if (r.tipo === 'modelo') {
      if (r.celdas) {
        const [A, B] = r.celdas.factores, nivA = [], nivB = [];
        for (const x of r.celdas.filas) { if (!nivA.includes(x.niveles[A])) nivA.push(x.niveles[A]); if (!nivB.includes(x.niveles[B])) nivB.push(x.niveles[B]); }
        const valor = (a, b) => { const x = r.celdas.filas.find(z => z.niveles[A] === a && z.niveles[B] === b); return x ? x.emm : NaN; };
        return SP.graficas.lineas({ titulo: T('Medias marginales de {a} × {b}', { a: A, b: B }), x: { titulo: A, niveles: nivA }, y: { titulo: r.respuesta }, leyenda: B,
          descripcion: T('Medias marginales estimadas de «{v}» para cada {a}, una línea por cada {b}.', { v: r.respuesta, a: A, b: B }), series: nivB.map(b => ({ nombre: b, valores: nivA.map(a => valor(a, b)) })) });
      }
      if (r.medias.length) {
        /* sin interacciones, la gráfica es la del factor con el efecto más claro (mayor F) */
        const F = f => { const k = r.anova.fuente.indexOf(f); return k >= 0 && Number.isFinite(r.anova.F[k]) ? r.anova.F[k] : -1; };
        const m = r.medias.slice().sort((x, y) => F(y.factor) - F(x.factor))[0];
        return SP.graficas.medias({ titulo: T('Medias marginales de «{f}»', { f: m.factor }), y: { titulo: r.respuesta }, descripcion: T('Medias marginales estimadas con su intervalo de confianza.'),
          grupos: m.filas.map(x => ({ nombre: x.nivel, media: x.media, inf: x.ic[0], sup: x.ic[1] })) });
      }
      return SP.graficas.dispersion({ titulo: T('Observados contra ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: r.respuesta }, diagonal: true,
        descripcion: T('Valores observados contra los ajustados por el modelo.'), puntos: SP.graficas.adelgazar(r.valores.ajustados.map((x, i) => ({ x, y: r.valores.observados[i] })), 2500) });
    }
    if (['correlacion', 'matriz', 'parcial'].includes(r.tipo)) return graficasCorrelacion(r);
    if (['contingencia', 'mcnemar', 'kappa', 'cmh'].includes(r.tipo)) return graficasContingencia(r);
    if (r.tipo === 'regresion') return graficasRegresion(r);
    if (r.tipo === 'ancova') return graficasAncova(r);
    if (r.tipo === 'seleccion' || r.tipo === 'subconjuntos') return graficasSeleccion(r);
    if (r.tipo === 'pares' || r.tipo === 'dunnett' || r.tipo === 'medias' || r.tipo === 'contrastes') {
      const lista = r.grupos.slice(0, 6), que = (r.comparar || [r.factor]).join(' × ');
      /* las barras: el intervalo de confianza en las medias ajustadas; en las comparaciones, ± 1 EE o el IC si se pide */
      const conIC = r.tipo === 'medias' || op.barras === 'ic', nivel = r.nivel || 0.95;
      const banda = f => { if (r.tipo === 'medias') return f.ic; const w = op.barras === 'ic' && f.gl > 0 ? SP.dist.qt(1 - (1 - nivel) / 2, f.gl) * (f.ee || 0) : (f.ee || 0); return [f.media - w, f.media + w]; };
      return lista.map(g => {
        const filas = r.tipo === 'medias' ? g.filas : g.medias;
        const titulo = Object.keys(g.dentro || {}).length ? Object.entries(g.dentro).map(([f, l]) => f + ' = ' + l).join(', ') : T('Medias de {q}', { q: que });
        return SP.graficas.medias({
          titulo, y: { titulo: r.respuesta || T('Media') },
          descripcion: T('Medias de {q} con {b}{l}.', { q: que, b: conIC ? T('su intervalo de confianza al {n} %', { n: Math.round(100 * nivel) }) : T('± un error estándar'), l: r.tipo === 'pares' ? T('; medias con una letra en común no difieren') : '' }),
          grupos: filas.map(f => { const b = banda(f); return { nombre: f.nombre, media: f.media, inf: b[0], sup: b[1], letra: f.letras, marca: r.tipo === 'dunnett' && f.nombre === g.testigo }; }),
        });
      }).join('');
    }
    if (r.tipo === 'polinomios') {
      return r.grupos.slice(0, 6).map(g => {
        const x0 = Math.min(...g.x), x1 = Math.max(...g.x), xs = Array.from({ length: 61 }, (_, i) => x0 + (x1 - x0) * i / 60);
        const ys = xs.map(x => g.curva.coef.reduce((s, b, dd) => s + b * Math.pow(x, dd), 0));
        return SP.graficas.dispersion({
          titulo: Object.keys(g.dentro).length ? Object.entries(g.dentro).map(([f, l]) => f + ' = ' + l).join(', ') : T('Respuesta a {f}', { f: r.factor }),
          x: { titulo: r.factor }, y: { titulo: r.respuesta }, descripcion: T('Medias de cada dosis y la curva de grado {g} ajustada.', { g: g.grado }),
          puntos: g.x.map((x, i) => ({ x, y: g.medias[i], marca: true })), linea: { x: xs, y: ys },
        });
      }).join('');
    }
    if (r.diseno) {
      if (r.celdas) {
        const [A, B] = r.celdas.factores, nivA = [], nivB = [];
        for (const x of r.celdas.filas) { if (!nivA.includes(x.niveles[A])) nivA.push(x.niveles[A]); if (!nivB.includes(x.niveles[B])) nivB.push(x.niveles[B]); }
        const valor = (a, b) => { const x = r.celdas.filas.find(f => f.niveles[A] === a && f.niveles[B] === b); return x ? (x.emm ?? x.media) : NaN; };
        return SP.graficas.lineas({
          titulo: T('Interacción {a} × {b}', { a: A, b: B }), x: { titulo: A, niveles: nivA }, y: { titulo: T('Media de «{v}»', { v: r.respuesta }) }, leyenda: B,
          descripcion: T('Medias de «{v}» para cada {a}, una línea por cada {b}; líneas paralelas indican que no hay interacción.', { v: r.respuesta, a: A, b: B }),
          series: nivB.map(b => ({ nombre: b, valores: nivA.map(a => valor(a, b)) })),
        });
      }
      const v = r.valores;
      return SP.graficas.grupos({
        titulo: T('«{v}» por {f}', { v: r.respuesta, f: v.factor }), y: { titulo: r.respuesta }, media: true,
        descripcion: T('Cajas de «{v}» en cada nivel de {f}, con la media marcada.', { v: r.respuesta, f: v.factor }),
        grupos: v.niveles.map((n, j) => ({ nombre: n, valores: v.valores[j] })),
      });
    }
    if (r.tipo === 'kruskal' || r.tipo === 'friedman') {
      const orden = r.prueba.grupos.map((g, j) => j);
      return SP.graficas.grupos({
        titulo: T('«{v}» por tratamiento', { v: r.respuesta }), y: { titulo: r.respuesta },
        descripcion: T('Cajas de «{v}» en {k} tratamientos; tratamientos con una letra en común no difieren.', { v: r.respuesta, k: orden.length }),
        grupos: orden.map(j => ({ nombre: r.prueba.grupos[j].nombre, valores: r.valores[j], letra: r.letras[j] })),
      });
    }
    const una = r.modo !== 'independientes', esT = !!r.efecto;
    const nombres = r.modo === 'independientes' ? r.etiquetas : r.modo === 'pareadas' ? [T('{a} − {b}', { a: r.etiquetas[0], b: r.etiquetas[1] })] : [r.etiquetas[0]];
    return SP.graficas.grupos({
      titulo: r.modo === 'pareadas' ? T('Diferencias pareadas') : r.modo === 'una' ? T('Valores de «{v}»', { v: r.etiquetas[0] }) : T('Valores por grupo'),
      y: { titulo: r.modo === 'pareadas' ? T('Diferencia') : T('Valor') }, media: esT,
      descripcion: una ? T('Cajas de los valores con la línea del valor de referencia {m}.', { m: r.mu }) : T('Cajas de los dos grupos comparados.'),
      grupos: nombres.map((nombre, j) => ({ nombre, valores: r.valores[j] })),
      referencias: una ? [{ y: r.mu, discontinua: true }] : [],
    });
  }
  function pintarMetodo(r, rep, codigo, ms) {
    const sem = rep.semaforo;
    const global = sem && sem.length ? sem.map(s => s.color).reduce((a, b) => (PEOR[b] > PEOR[a] ? b : a), 'verde') : null;
    $('#anaResultado').innerHTML =
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('calculado en {ms} ms', { ms: Math.max(1, Math.round(ms)) }))}</span>${botonReporte()}</div>` +
      `<div class="callout exp-conclusion">${rep.conclusiones.map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      (global ? semaforoHTML(sem, global, T({ verde: 'Los supuestos de la prueba se cumplen', ambar: 'Hay supuestos que revisar', rojo: 'Hay supuestos que no se cumplen', gris: 'Sin datos suficientes' }[global]), T('Semáforo de los supuestos')) : '') +
      graficasHTML(graficaMetodo(r)) +
      (r.diseno && !r.tipo && r.factores && r.factores.length ? `<div class="btn-row exp-acciones"><button type="button" class="btn btn-primary btn-sm" data-accion="comparar">${esc(T('Comparar las medias de este diseño'))}</button></div>` : '') +
      botonesModelo(r) +
      rep.cuadros.map((q, i) => SP.cuadros.html(q, { numero: i + 1 }) + copiarHTML(i)).join('') +
      codigoHTML(codigo);
  }
  /** Tras la selección, botones que llevan el modelo elegido a la regresión lineal con todo su diagnóstico. */
  function botonesModelo(r) {
    const boton = (vars, texto) => '<button type="button" class="btn btn-primary btn-sm" data-accion="analizar-modelo" data-vars="' + esc(JSON.stringify(vars)) + '">' + esc(texto) + '</button>';
    if (r.tipo === 'seleccion' && r.finales.length) return '<div class="btn-row exp-acciones">' + boton(r.finales, T('Analizar el modelo elegido')) + '</div>';
    if (r.tipo === 'subconjuntos') {
      const de = k => r.filas.find(f => f.tamano === k && f.rango === 1).variables, hechos = new Set(), bs = [];
      for (const [crit, k] of [['BIC', r.elegido.bic], ['Cp', r.elegido.cp], [T('R² ajustada'), r.elegido.r2_ajustada]]) {
        if (hechos.has(k)) continue;
        hechos.add(k); bs.push(boton(de(k), T('Analizar el modelo de {c} ({k} predictores)', { c: crit, k })));
      }
      return '<div class="btn-row exp-acciones">' + bs.join('') + '</div>';
    }
    return '';
  }
  /* una gráfica ocupa una columna de lectura; varias (comparaciones dentro de cada nivel) van en rejilla */
  const graficasHTML = g => (g ? `<div class="ana-graficas${(g.match(/<figure/g) || []).length > 1 ? '' : ' ana-una'}">${g}</div>` : '');

  function calcular() {
    estado.pendiente = false;
    const c = columnas();
    $('#anaVacio').hidden = !!c;
    $('#anaTrabajo').hidden = !c;
    if (!c) return;
    document.querySelectorAll('#anaModos [data-modo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modo === estado.modo)));
    $('#anaCatalogoVista').hidden = estado.modo !== 'catalogo';
    $('#anaAsistente').hidden = estado.modo !== 'asistente';
    $('#anaConstructor').hidden = estado.modo !== 'constructor';
    if (estado.modo !== 'catalogo') { const p = estado.pintores[estado.modo]; if (p) p(c); return; }
    catalogo();
    /* con otra tabla, los papeles vuelven a proponerse; con ediciones de la misma, se respetan */
    if (SP.app.datos.hoja !== estado.hoja) { estado.hoja = SP.app.datos.hoja; estado.sup._iniciado = estado.dos._iniciado = estado.rangos._iniciado = estado.dis._iniciado = estado.reg._iniciado = estado.anc._iniciado = estado.cor._iniciado = estado.cont._iniciado = estado.ml._iniciado = false; }
    if (estado.metodo === 'supuestos') sanearSup(c);
    const form = $('#anaOpciones');
    const foco = document.activeElement && form.contains(document.activeElement) ? document.activeElement : null;
    const clave = foco ? (foco.dataset.campo ? (foco.dataset.grupo || '') + '|' + foco.dataset.campo : 'lista|' + foco.value) : null;
    form.innerHTML = formulario(c);
    if (clave) {
      const [g, k] = clave.split('|');
      const el = g === 'lista' ? form.querySelector(`[data-lista][value="${CSS.escape(k)}"]`) : form.querySelector(`[data-grupo="${g}"][data-campo="${k}"]`);
      if (el) el.focus();
    }
    const id = estado.metodo, ficha = SP.metodos[id];
    if (!ficha || !SP.metodoDisponible(id)) { $('#anaResultado').innerHTML = `<div class="msg msg-warning">${esc(T('Este análisis todavía no tiene su validación contra R aprobada.'))}</div>`; return; }
    const { e, op } = pedido(), turno = ++estado.turno;
    const opciones = SP.opcionesCon(ficha, op);
    const mostrar = (resultado, ms) => {
      if (turno !== estado.turno) return;
      const rep = ficha.reporte(resultado), codigo = ficha.codigoR(e, opciones, { factoresNumericos: c.numFactor, resultado });
      (id === 'supuestos' ? pintarSupuestos : pintarMetodo)(resultado, rep, codigo, ms);
      $('#anaResultado').dataset.codigo = codigo;
      estado.ultimo = rep;
    };
    const fallar = err => {
      if (turno !== estado.turno) return;
      if (!(err instanceof SP.ErrorSP) && err.arreglo === undefined) console.error(err);
      $('#anaResultado').classList.remove('calculando');
      $('#anaResultado').innerHTML = `<div class="msg msg-error"><strong>${esc(err.message)}</strong>${err.arreglo ? `<span class="msg-fix">${esc(err.arreglo)}</span>` : ''}</div>`;
    };
    const correr = () => {
      try {
        const { resultado, ms } = SP.ejecutar(id, c.t, e, opciones);
        $('#anaResultado').classList.remove('calculando');
        mostrar(resultado, ms);
      } catch (err) { fallar(err); }
    };
    /* con tablas grandes (hasta ~2 s con 100 000 filas y muchos tratamientos), primero se avisa y se deja pintar.
       Un hilo de trabajo resultó más lento: arranca sin el código optimizado y con menos prioridad (Hito 1.12). */
    if (c.t.n >= 20000) {
      const r0 = $('#anaResultado');
      r0.classList.add('calculando');
      if (!r0.querySelector('.ana-espera')) r0.insertAdjacentHTML('afterbegin', `<p class="ana-espera small" role="status">${esc(T('Calculando con {n} filas…', { n: c.t.n.toLocaleString('es-MX') }))}</p>`);
      setTimeout(() => { if (turno === estado.turno) correr(); }, 30);
    } else correr();
  }
  let reloj = null;
  const recalcular = () => { clearTimeout(reloj); reloj = setTimeout(calcular, 150); };
  estado.calcular = calcular;

  /* ---------------- aplicar un pedido (del asistente o del constructor) ---------------- */
  const ROLES_DIS = ['bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB'];
  function aplicar(m, e, op) {
    e = e || {}; op = op || {};
    const pon = (s, campos) => { for (const [k, v] of Object.entries(campos)) if (v !== undefined) s[k] = Array.isArray(v) ? v.slice() : v; s._iniciado = true; };
    estado.hoja = SP.app.datos.hoja;      // lo aplicado no se vuelve a proponer
    if (DISENOS.includes(m)) {
      const s = estado.dis;
      for (const k of ROLES_DIS) s[k] = '';
      pon(s, { respuesta: e.respuesta, tratamientos: [].concat(e.tratamientos || []), principal: e.principal, tipoSC: op.tipoSC });
      for (const k of ROLES_DIS) if (e[k]) s[k] = e[k];
      estado.cmp.diseno = m;
    } else if (COMPARAR.includes(m)) {
      const roles = Object.assign({}, e); delete roles.diseno; delete roles.comparar; delete roles.dentro;
      aplicar(e.diseno, roles, {});
      pon(estado.cmp, { diseno: e.diseno, comparar: [].concat(e.comparar || []), dentro: (e.dentro || [])[0] || '', metodo: op.metodo, testigo: op.testigo, alternativa: op.alternativa,
        contrastes: op.contrastes, grado: op.grado, nivel: op.nivel });
    } else if (REGRESION.includes(m)) {
      const s = estado.reg;
      if (m === 'regresion-polinomial') pon(s, { respuesta: e.respuesta, x: [].concat(e.predictores)[0], grado: op.grado });
      else pon(s, { respuesta: e.respuesta, predictores: [].concat(e.predictores || []), criterio: op.criterio, direccion: op.direccion, mejores: op.mejores });
    } else if (m === 'ancova') {
      pon(estado.anc, { respuesta: e.respuesta, tratamientos: [].concat(e.tratamientos || []), bloque: e.bloque || '', covariables: [].concat(e.covariables || []), tipoSC: op.tipoSC, metodo: op.metodo });
    } else if (CORREL.includes(m)) {
      if (m === 'matriz-correlacion') pon(estado.cor, { variables: e.variables, metodo: op.metodo, ajuste: op.ajuste });
      else pon(estado.cor, { x: e.x, y: e.y, controles: e.controles || [], metodo: op.metodo });
    } else if (CONTING.includes(m)) {
      pon(estado.cont, { frecuencia: e.frecuencia || '', fila: e.fila, columna: e.columna, estrato: e.estrato, antes: e.antes, despues: e.despues, evaluador1: e.evaluador1, evaluador2: e.evaluador2, ponderacion: op.ponderacion });
    } else if (m === 'prueba-t' || m === 'wilcoxon') {
      pon(estado.dos, { modo: e.modo, respuesta: e.respuesta, grupo: e.grupo, variable: e.variable, antes: e.antes, despues: e.despues, varIguales: op.varIguales });
    } else if (m === 'kruskal-wallis' || m === 'friedman') {
      pon(estado.rangos, { respuesta: e.respuesta, tratamiento: e.tratamiento, bloque: e.bloque || '' });
    } else if (m === 'supuestos') {
      pon(estado.sup, { respuesta: e.respuesta, tratamientos: [].concat(e.tratamientos || []), bloque: e.bloque || '', orden: '' });
    } else if (m === 'modelo-lineal') {
      pon(estado.ml, { respuesta: e.respuesta, derecha: op.derecha, comoFactor: op.comoFactor || [], tipoSC: op.tipoSC });
    }
    estado.metodo = m;
  }
  /** Aplica el pedido, pasa al catálogo y calcula. */
  function usar(m, e, op) {
    aplicar(m, e, op);
    ponerModo('catalogo');
    const r = $('#anaResultado');
    if (r) r.scrollIntoView({ block: 'start' });
  }
  function ponerModo(m) {
    if (!MODOS.includes(m)) m = 'catalogo';
    estado.modo = m;
    try { localStorage.setItem('sigmapro.analisis.modo', m); } catch (e) { /* sin almacenamiento */ }
    document.querySelectorAll('#anaModos [data-modo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modo === m)));
    $('#anaCatalogoVista').hidden = m !== 'catalogo';
    $('#anaAsistente').hidden = m !== 'asistente';
    $('#anaConstructor').hidden = m !== 'constructor';
    calcular();
  }
  /** Las gráficas de un resultado (para el reporte y el bloque Figuras); op.barras: 'ee' | 'ic'. */
  const graficasDe = (id, r, op) => (id === 'supuestos' ? graficasSupuestos(r) : graficasHTML(graficaMetodo(r, op)));
  Object.assign(estado, { aplicar, usar, ponerModo, graficasDe });

  function iniciar() {
    const panel = $('#panel-4');
    const form = $('#anaOpciones');
    $('#anaModos').addEventListener('click', e => { const b = e.target.closest('[data-modo]'); if (b) ponerModo(b.dataset.modo); });
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.lista === 'comparar') {
        const marcados = [...form.querySelectorAll('[data-lista="comparar"]:checked')].map(x => x.value);
        if (!marcados.length) { el.checked = true; return; }
        if (marcados.length > 2) { el.checked = false; L() && L().toast(T('Compara las medias de uno o dos factores a la vez.'), { type: 'warning' }); return; }
        estado.cmp.comparar = marcados;
      } else if (el.dataset.campo === 'comparar1') {
        estado.cmp.comparar = el.value ? [el.value] : [];
      } else if (['predictores', 'covariables', 'variables', 'controles', 'comoFactor'].includes(el.dataset.lista)) {
        const marcados = [...form.querySelectorAll('[data-lista="' + el.dataset.lista + '"]:checked')].map(x => x.value), max = { covariables: 2, predictores: 15, variables: 30, controles: 10, comoFactor: 30 }[el.dataset.lista];
        if (marcados.length > max) { el.checked = false; L() && L().toast(T('Hasta {k} variables.', { k: max }), { type: 'warning' }); return; }
        estado[el.dataset.grupo][el.dataset.lista] = marcados;
      } else if (el.dataset.lista === 'tratamientos') {
        const grupo = el.dataset.grupo || 'sup', dsel = DISENOS.includes(estado.metodo) ? estado.metodo : estado.cmp.diseno, max = grupo === 'dis' ? (MAX_TRAT[dsel] || 3) : grupo === 'anc' ? 2 : 3;
        const marcados = [...form.querySelectorAll('[data-lista="tratamientos"]:checked')].map(x => x.value);
        if (marcados.length > max) { el.checked = false; L() && L().toast(max === 2 ? T('Hasta dos factores de tratamiento.') : T('Hasta tres factores de tratamiento.'), { type: 'warning' }); return; }
        estado[grupo].tratamientos = marcados;
      } else if (el.dataset.campo === 'tratamiento1') {
        estado.dis.tratamientos = el.value ? [el.value] : [];
      } else if (el.dataset.campo) {
        const s = estado[el.dataset.grupo || 'sup'];
        s[el.dataset.campo] = el.type === 'checkbox' ? el.checked : el.value;
      }
      calcular();
    });
    $('#anaResultado').addEventListener('click', async e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'analizar-modelo') {
        estado.reg.predictores = JSON.parse(a.dataset.vars);
        estado.metodo = 'regresion-lineal';
        calcular();
        $('#anaCatalogo').scrollIntoView({ block: 'nearest' });
        return;
      }
      if (a.dataset.accion === 'reporte') {
        const p = pedidoActual();
        if (SP.app.reporte.tiene(p)) { SP.app.ir(5); return; }
        SP.app.reporte.agregar(p);
        a.outerHTML = botonReporte();
        return;
      }
      if (a.dataset.accion === 'comparar') {
        estado.cmp.diseno = estado.metodo;
        estado.metodo = 'comparaciones-medias';
        calcular();
        $('#anaCatalogo').scrollIntoView({ block: 'nearest' });
        return;
      }
      const texto = a.dataset.accion === 'copiar' ? (estado.ultimo && SP.cuadros.tsv(estado.ultimo.cuadros[+a.dataset.cuadro || 0])) : $('#anaResultado').dataset.codigo;
      if (texto && await SP.cuadros.copiar(texto)) L() && L().toast(a.dataset.accion === 'copiar' ? T('Cuadro copiado.') : T('Código R copiado.'), { type: 'success' });
    });
    $('#anaCatalogo').addEventListener('click', e => {
      const b = e.target.closest('[data-metodo]');
      if (!b) return;
      estado.metodo = b.dataset.metodo;
      if (DISENOS.includes(estado.metodo)) estado.cmp.diseno = estado.metodo;   // las comparaciones usan el último diseño elegido
      calcular();
    });
    document.addEventListener('sp:datos', () => { if (panel.classList.contains('active')) recalcular(); else estado.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 4 && estado.pendiente) calcular(); });
    if (panel.classList.contains('active')) calcular();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

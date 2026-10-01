/* SigmaPro — bloque 4: Análisis (catálogo, supuestos, pruebas t y pruebas no paramétricas).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El catálogo lista las familias de SP.familias de la Fase 1. Un análisis aparece activo solo si su método
   está registrado y su validación contra R aprobó (SP.metodoDisponible); los demás muestran el hito en que
   llegan. Cada método tiene su formulario; la prueba t y Wilcoxon comparten el suyo (estado «dos»), y
   Kruskal-Wallis y Friedman el de los rangos (estado «rangos»), así cambiar de uno a otro conserva lo elegido. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const HITO = { comparaciones: '1.7', regresion: '1.8', correlacion: '1.9', contingencia: '1.9' };
  const DISENOS = ['dca', 'dbca', 'cuadro-latino', 'parcelas-divididas', 'parcelas-subdivididas', 'franjas', 'bib', 'latice'];
  const estado = SP.app.analisis = {
    metodo: 'supuestos', pendiente: true, turno: 0,
    sup: { respuesta: '', tratamientos: [], bloque: '', orden: '', alfa: 0.05, _iniciado: false },
    dos: { modo: '', variable: '', respuesta: '', grupo: '', nivelA: '', nivelB: '', antes: '', despues: '', mu: 0, alternativa: 'bilateral', nivel: 0.95, varIguales: false, exacta: 'auto', correccion: true, alfa: 0.05, _iniciado: false },
    rangos: { respuesta: '', tratamiento: '', bloque: '', posthocKW: 'dunn', posthocF: 'conover', ajuste: 'holm', alfa: 0.05, _iniciado: false },
    dis: { respuesta: '', tratamientos: [], bloque: '', fila: '', columna: '', repeticion: '', principal: 'dbca', parcelaGrande: '', subparcela: '', subsubparcela: '',
      franjaA: '', franjaB: '', tipoSC: 3, alfa: 0.05, _iniciado: false },
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
  function formDiseno(c, d) {
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
    if (['dca', 'dbca', 'cuadro-latino'].includes(d)) {
      h += campo('dis', 'tipoSC', T('Sumas de cuadrados'), [[3, T('Tipo III (medias marginales)')], [2, T('Tipo II (marginalidad)')], [1, T('Tipo I (secuenciales)')]], s.tipoSC,
        T('Con datos balanceados las tres coinciden; con desbalance cambian la hipótesis que se prueba.'));
    }
    return h + campo('dis', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  function formulario(c) {
    if (DISENOS.includes(estado.metodo)) return formDiseno(c, estado.metodo);
    if (estado.metodo === 'prueba-t') return formDos(c, true);
    if (estado.metodo === 'wilcoxon') return formDos(c, false);
    if (estado.metodo === 'kruskal-wallis') return formRangos(c, false);
    if (estado.metodo === 'friedman') return formRangos(c, true);
    return formSupuestos(c);
  }
  /** Entradas y opciones del método elegido, desde el estado del formulario. */
  function pedido() {
    const m = estado.metodo;
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
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('modelo {m} · n = {n} · calculado en {ms} ms', { m: r.formula, n: r.n, ms: Math.max(1, Math.round(ms)) }))}</span></div>` +
      semaforoHTML(rep.semaforo, r.global, T({ verde: 'Los supuestos se cumplen', ambar: 'Hay supuestos que revisar', rojo: 'Hay supuestos que no se cumplen', gris: 'Sin datos suficientes' }[r.global]), T('Semáforo de los supuestos')) +
      (rec.length ? `<div class="callout exp-conclusion"><p><b>${esc(T('Qué hacer'))}</b></p><ul class="ana-rec">${rec.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '') +
      (r.excluidas ? `<p class="small muted">${esc(T('{k} filas con algún valor faltante en el modelo no entran.', { k: r.excluidas }))}</p>` : '') +
      graficasSupuestos(r) +
      SP.cuadros.html(rep.cuadros[0], { numero: 1 }) + copiarHTML(0) +
      (rep.cuadros[1] ? `<details class="exp-extras"><summary>${esc(T('Varianza de los residuos por tratamiento'))}</summary>${SP.cuadros.html(rep.cuadros[1], { numero: 2 })}</details>` : '') +
      codigoHTML(codigo);
  }

  /** Gráfica de cajas del método: los grupos comparados, con letras cuando las hay. */
  function graficaMetodo(r) {
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
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('calculado en {ms} ms', { ms: Math.max(1, Math.round(ms)) }))}</span></div>` +
      `<div class="callout exp-conclusion">${rep.conclusiones.map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      (global ? semaforoHTML(sem, global, T({ verde: 'Los supuestos de la prueba se cumplen', ambar: 'Hay supuestos que revisar', rojo: 'Hay supuestos que no se cumplen', gris: 'Sin datos suficientes' }[global]), T('Semáforo de los supuestos')) : '') +
      `<div class="ana-graficas ana-una">${graficaMetodo(r)}</div>` +
      rep.cuadros.map((q, i) => SP.cuadros.html(q, { numero: i + 1 }) + copiarHTML(i)).join('') +
      codigoHTML(codigo);
  }

  function calcular() {
    estado.pendiente = false;
    const c = columnas();
    $('#anaVacio').hidden = !!c;
    $('#anaTrabajo').hidden = !c;
    if (!c) return;
    catalogo();
    /* con otra tabla, los papeles vuelven a proponerse; con ediciones de la misma, se respetan */
    if (SP.app.datos.hoja !== estado.hoja) { estado.hoja = SP.app.datos.hoja; estado.sup._iniciado = estado.dos._iniciado = estado.rangos._iniciado = estado.dis._iniciado = false; }
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

  function iniciar() {
    const panel = $('#panel-4');
    const form = $('#anaOpciones');
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.lista === 'tratamientos') {
        const grupo = el.dataset.grupo || 'sup', max = grupo === 'dis' ? (MAX_TRAT[estado.metodo] || 3) : 3;
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
      const texto = a.dataset.accion === 'copiar' ? (estado.ultimo && SP.cuadros.tsv(estado.ultimo.cuadros[+a.dataset.cuadro || 0])) : $('#anaResultado').dataset.codigo;
      if (texto && await SP.cuadros.copiar(texto)) L() && L().toast(a.dataset.accion === 'copiar' ? T('Cuadro copiado.') : T('Código R copiado.'), { type: 'success' });
    });
    $('#anaCatalogo').addEventListener('click', e => { const b = e.target.closest('[data-metodo]'); if (b) { estado.metodo = b.dataset.metodo; calcular(); } });
    document.addEventListener('sp:datos', () => { if (panel.classList.contains('active')) recalcular(); else estado.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 4 && estado.pendiente) calcular(); });
    if (panel.classList.contains('active')) calcular();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

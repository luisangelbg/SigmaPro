/* SigmaPro — bloque 4: Análisis (catálogo, supuestos, pruebas t, no paramétricas, diseños, comparaciones, ANCOVA y regresión).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El catálogo lista las familias de SP.familias de la Fase 1. Un análisis aparece activo solo si su método
   está registrado y su validación contra R aprobó (SP.metodoDisponible); los demás muestran el hito en que
   llegan. Cada método tiene su formulario; la prueba t y Wilcoxon comparten el suyo (estado «dos»), y
   Kruskal-Wallis y Friedman el de los rangos (estado «rangos»); las regresiones y la selección de variables comparten
   el estado «reg», así cambiar de uno a otro conserva lo elegido.
   Los métodos del motor R (motor: 'r', Fase 2) corren con SP.ejecutarAsync: la primera vez se pide permiso para
   descargar el motor (después se recuerda), se muestra cada paso y se puede cancelar. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  /* familias de la Fase 2 que todavía no tienen métodos: el hito en que llegan (propuesta/FASE2.md §6) */
  const HITO = { mixtos: '2.1', geneticos: '2.3', generalizados: '2.4', 'no-lineal': '2.6', superficies: '2.7', multiambiente: '2.8', potencia: '3.0', supervivencia: '3.2', multivariado: '3.4' };
  const MOTOR_USADO = 'sigmapro.motorR.usado';
  const DISENOS = ['dca', 'dbca', 'cuadro-latino', 'parcelas-divididas', 'parcelas-subdivididas', 'franjas', 'bib', 'latice'];
  const MODOS = ['asistente', 'catalogo', 'constructor'];
  const COMPARAR = ['comparaciones-medias', 'contrastes', 'polinomios', 'medias-ajustadas'];
  const REGRESION = ['regresion-lineal', 'regresion-polinomial', 'seleccion-pasos', 'mejores-subconjuntos'];
  const CORREL = ['correlacion', 'matriz-correlacion', 'correlacion-parcial'];
  const CONTING = ['tabla-contingencia', 'mcnemar', 'mantel-haenszel', 'kappa'];
  const MIXTOS_DIS = ['mixto-bloques', 'mixto-divididas', 'mixto-latice', 'mixto-localidades'];
  const GENETICOS = ['componentes-varianza', 'heredabilidad', 'repetibilidad'];
  const GLMS = ['glm-conteos', 'glm-proporciones', 'glm-gamma', 'glm', 'glmm-bloques', 'glmm'];
  const NOLINEAL = ['curva-crecimiento', 'dosis-respuesta', 'respuesta-meseta'];
  const SUPERFICIES = ['superficie-respuesta', 'ascenso-pronunciado'];
  const MULTI = ['ensayos-multiambiente', 'dos-etapas', 'estabilidad', 'ammi', 'gge'];
  const POTENCIA = ['potencia-medias', 'potencia-anova', 'potencia-proporciones', 'potencia-correlacion', 'repeticiones'];
  const MUESTREO = ['tamano-muestra', 'muestreo-simple', 'muestreo-estratificado'];
  const SUPERVIVENCIA = ['kaplan-meier', 'cox'];
  const SERIES = ['autocorrelacion', 'descomposicion', 'tendencia', 'arima'];
  const MULTIVARIADO = ['manova', 'discriminante'];
  /* sin datos cargados, los métodos que no los necesitan (potencia y tamaño de muestra) corren con estas columnas vacías */
  const SIN_DATOS = { t: null, pap: { respuestas: [], factores: [], bloque: null }, numericas: [], fechas: [], factores: [], numFactor: [], agrupables: [], sinDatos: true };
  const AJUSTES_MX = () => [['tukey', 'Tukey'], ['bonferroni', 'Bonferroni'], ['holm', 'Holm'], ['sidak', 'Šidák'], ['none', T('Sin ajuste (DMS)')]];
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
    mx: { respuesta: '', derecha: '', comoFactor: [], tipoSC: 3, gl: 'satterthwaite', estimacion: 'reml', compararMx: null, dentro: '', ajuste: 'tukey', alfa: 0.05, nivel: 0.95, _iniciado: false },
    mxd: { respuesta: '', tratamientos: [], bloque: '', parcelaGrande: '', subparcela: '', subsubparcela: '', repeticion: '', tratamiento: '', genotipo: '', localidad: '',
      repeticionAleatoria: false, localidadFija: false, compararMx: null, dentro: '', ajuste: 'tukey', gl: 'satterthwaite', estimacion: 'reml', alfa: 0.05, nivel: 0.95, _iniciado: false },
    rep: { respuesta: '', tiempo: '', sujeto: '', tratamientos: [], bloque: '', estructura: 'auto', criterio: 'aic', compararMx: null, dentro: '', ajuste: 'tukey', alfa: 0.05, nivel: 0.95, _iniciado: false },
    nl: { respuesta: '', x: '', grupo: '', pesos: '', modelo: '', nivel: 0.95, alfa: 0.05, intervalo: 'wald', precioProducto: '', precioInsumo: '', ejeLog: false, metodo: '', _iniciado: false },
    srf: { respuesta: '', factores: [], bloque: '', orden: 'segundo', objetivo: 'maximo', nivel: 0.95, alfa: 0.05, codificacion: 'auto', bajos: {}, altos: {}, _iniciado: false },
    dsn: { tipo: 'ccd', k: 2, alfa: 'rotable', centros: '', grado: 2, nombres: '', bajos: '', altos: '', total: 1, semilla: '' },
    mez: { respuesta: '', componentes: [], modelo: 'cuadratico', objetivo: 'maximo', nivel: 0.95, alfa: 0.05, _iniciado: false },
    des: { factores: [], respuestasDes: [], por: {}, region: 'cubo', _iniciado: false },
    vista3d: { azimut: 35, elevacion: 28 },
    ma: { respuesta: '', genotipo: '', ambiente: '', repeticion: '', eeb: 'propio', objetivo: 'maximo', escala: 'ninguna', particion: 'simetrica', alfa: 0.05, imputar: true, ejesImputar: 1,
      ejesWaas: 0, pesoRespuesta: 50, probAnnicchiarico: 0.25, genotipoA: '', genotipoB: '', _iniciado: false },
    pot: { calcular: 'n', n: 10, diferencia: 1, de: 1, tipo: 'dos', alternativa: 'bilateral', alfa: 0.05, potencia: 0.8, grupos: 4, medias: '', varEntre: 1, p1: 0.5, p2: 0.7, r: 0.3,
      cv: 12, difPct: 20, tratamientos: 5, diseno: 'dbca' },
    mue: { que: 'media', escala: 'absoluto', de: 1, errorAbs: 0.25, cv: 20, errorPct: 10, p: 0.5, errorProp: 0.05, N: 0, confianza: 0.95, respuesta: '', estrato: '', tipoSimple: 'auto', nTotal: 0, _iniciado: false },
    mueN: {},   // el tamaño de la población de cada estrato, por el nombre del nivel
    mv: { respuestas: [], tratamientos: [], bloque: '', prueba: 'pillai', alfa: 0.05, variables: [], grupo: '', _iniciado: false },
    ts: { respuesta: '', tiempo: '', rezagos: 0, lagBox: 0, fitdf: 0, nivel: 0.95, frecuencia: 12, tipo: 'aditiva', ap: 1, ad: 0, aq: 0, aP: 0, aD: 0, aQ: 0, periodoA: 1, mediaA: 'si', buscarA: 'no', horizonte: 12, _iniciado: false },
    sv: { tiempo: '', evento: '', grupo: '', estrato: '', conf: 'log', nivel: 0.95, rho: 0, factoresSv: [], covariablesSv: [], empates: 'efron', _iniciado: false },
    sinDatos: false,
    gen: { respuesta: '', aleatorios: [], fijos: [], estructura: 'cruzados', genotipo: '', repeticion: '', bloque: '', ambiente: '', seleccion: 0.1, direccion: 'mayor',
      individuo: '', fijosRep: [], _iniciado: false },
    glm: { respuesta: '', tratamientos: [], bloque: '', covariables: [], ensayos: '', exposicion: '', familia: '', enlace: '', tipo: 2, compararMx: null, dentro: '', ajuste: 'tukey',
      nivel: 0.95, alfa: 0.05, derecha: '', comoFactor: [], sobredispersion: 'auto', intervalo: 'wald', firth: false, lambda: 0.5, nagq: 1, pruebaAleatorios: true, metodo: '', _iniciado: false },
    motorAceptado: false,
  };

  /* ---------------- catálogo ---------------- */
  function catalogo(c) {
    const vacio = c && c.sinDatos;
    if (!SP.metodoDisponible(estado.metodo) || (vacio && !(SP.metodos[estado.metodo] || {}).sinDatos)) estado.metodo = vacio ? 'potencia-medias' : 'supuestos';
    /* el catálogo nuevo (js/interfaz/catalogo.js): tarjetas con lo que se puede hacer con los datos */
    if (SP.catalogoUI) {
      SP.catalogoUI.iniciar(() => catalogo(columnas() || (estado.sinDatos ? SIN_DATOS : null)));
      SP.catalogoUI.dibujar({ tabla: c && !vacio ? c.t : null, vacio, metodo: estado.metodo });
      return;
    }
    const fams = SP.familias.filter(f => f.fase <= 3 && f.id !== 'descriptiva' && (!vacio || f.id === 'potencia'));
    $('#anaCatalogo').innerHTML = fams.map(f => {
      const metodos = SP.listaMetodos(f.id).filter(m => SP.metodoDisponible(m.id) && (!vacio || m.sinDatos));
      const items = metodos.length
        ? metodos.map(m => `<li><button type="button" class="ana-item${m.id === estado.metodo ? ' activo' : ''}" data-metodo="${esc(m.id)}" aria-pressed="${m.id === estado.metodo}" title="${esc(m.resumen)}"><b>${esc(m.nombre)}</b></button></li>`).join('')
        : `<li><span class="ana-item pronto"><b>${esc(T('Pronto'))}</b><span class="pill gris">${esc(T('Hito {h}', { h: HITO[f.id] || '' }))}</span></span></li>`;
      return `<li class="ana-familia"><p class="ana-fam-titulo">${esc(f.nombre)}</p><ul>${items}</ul></li>`;
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
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  /** Lo que significa cada efecto aleatorio, en palabras. */
  function explicarAleatorio(a) {
    const g = a.agrupan, pend = a.variables.filter(v => v !== '1' && v !== '0');
    const quien = a.grupos.includes('/') ? T('{b} dentro de {a}', { a: g[0], b: g.slice(1).join(T(' dentro de ')) }) : a.grupos.includes(':') ? T('cada combinación {g}', { g: g.join(' × ') }) : g[0];
    if (!pend.length) return a.grupos.includes('/') ? T('efecto aleatorio de {a} y de {q}: cada uno tiene su propio nivel medio.', { a: g[0], q: quien }) : T('cada nivel de {q} tiene su propio nivel medio (intercepto aleatorio).', { q: quien });
    return T('la pendiente de {v} cambia en cada {q}{c}.', { v: pend.join(', '), q: quien, c: a.doble ? T(', sin correlación con el intercepto') : /^\s*0\s*\+/.test(a.expr) ? '' : T(', correlacionada con su intercepto') });
  }
  function formMixto(c) {
    const s = estado.mx, num = c.numericas;
    if (!s._iniciado) {
      s._iniciado = true;
      s.respuesta = ultimaRespuesta(c);
      const b = c.pap.bloque, fs = c.pap.factores.filter(n => n !== b && n !== s.respuesta).slice(0, 2);
      s.derecha = [fs.map(q).join(' * '), b ? '(1 | ' + q(b) + ')' : ''].filter(Boolean).join(' + ');
      s.comoFactor = c.numFactor.filter(n => fs.includes(n));
    }
    if (!num.includes(s.respuesta)) s.respuesta = ultimaRespuesta(c);
    let h = campo('mx', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += '<label class="field"><span>' + esc(T('Términos del modelo (lo que va después de «~»)')) + '</span><input type="text" data-grupo="mx" data-campo="derecha" spellcheck="false" autocomplete="off" value="' + esc(s.derecha) + '" placeholder="variedad * dosis + (1 | bloque)">' +
      '<span class="field-help">' + esc(T('Los efectos fijos como en el modelo lineal; cada efecto aleatorio entre paréntesis con su agrupamiento: (1 | bloque) un nivel propio por bloque, (1 | bloque/parcela) parcelas dentro de bloques, (dias | planta) una pendiente por planta.')) + '</span></label>';
    try {
      const sep = SP.mixtos.separar(s.derecha), inf = { numericas: c.numericas, factores: c.t.nombres.filter(n => !c.numericas.includes(n)) };
      const items = [];
      let numEnFijos = [];
      if (sep.fijos) {
        const lec = SP.constructorModelos.interpretar(s.respuesta, sep.fijos, inf, s.comoFactor);
        if (!lec.ok) throw new SP.ErrorSP(lec.mensaje, lec.arreglo);
        lec.terminos.forEach(x => items.push('<li><b>' + esc(x.etiqueta) + '</b>: ' + esc(x.explicacion) + '</li>'));
        numEnFijos = lec.variables.filter(v => c.numericas.includes(v));
      }
      sep.aleatorios.forEach(a => items.push('<li><b>' + esc(a.texto) + '</b>: ' + esc(explicarAleatorio(a)) + '</li>'));
      if (!sep.aleatorios.length) items.push('<li class="msg-error">' + esc(T('Falta al menos un efecto aleatorio, como (1 | bloque).')) + '</li>');
      h += '<ul class="ml-terminos small">' + items.join('') + '</ul>';
      s.comoFactor = s.comoFactor.filter(v => numEnFijos.includes(v));
      if (numEnFijos.length) h += casillas('mx', 'comoFactor', T('Numéricas que son tratamientos (factor)'), numEnFijos, s.comoFactor, n => n, '');
      /* medias marginales: los factores fijos que entran como efecto principal */
      const facs = inf.factores.concat(s.comoFactor);
      const principales = sep.fijos ? SP.formula.analizar(q(s.respuesta) + ' ~ ' + sep.fijos).terminos.filter(t => t.variables.length === 1 && facs.includes(t.variables[0])).map(t => t.variables[0]) : [];
      h += formCompararMx('mx', s, principales, true);
    } catch (err) {
      h += '<p class="msg msg-error small" role="alert"><strong>' + esc(err.message) + '</strong>' + (err.arreglo ? ' <span class="msg-fix">' + esc(err.arreglo) + '</span>' : '') + '</p>';
    }
    h += campo('mx', 'tipoSC', T('Sumas de cuadrados'), [[3, T('Tipo III (medias marginales)')], [2, T('Tipo II (marginalidad)')], [1, T('Tipo I (secuenciales)')]], s.tipoSC);
    h += campo('mx', 'gl', T('Grados de libertad de las pruebas'), [['satterthwaite', 'Satterthwaite'], ['kenward-roger', T('Kenward-Roger (más exacto con pocos grupos; tarda más)')]], s.gl);
    h += campo('mx', 'estimacion', T('Estimación'), [['reml', T('REML (componentes de varianza sin sesgo)')], ['ml', T('Máxima verosimilitud (para comparar efectos fijos entre modelos)')]], s.estimacion);
    h += '<p class="small muted">' + esc(T('Corre en el motor R dentro de tu navegador (lme4, lmerTest y emmeans).')) + '</p>';
    return h + campo('mx', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('mx', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Qué medias comparar, dentro de qué factor y con qué ajuste (modelo mixto y sus diseños). */
  function formCompararMx(grupo, s, principales, conDentro) {
    if (!principales.length) { s.compararMx = null; return ''; }
    if (s.compararMx) s.compararMx = s.compararMx.filter(v => principales.includes(v));
    const elegidos = s.compararMx || principales.slice(0, 3);
    if (s.dentro && (!principales.includes(s.dentro) || elegidos.includes(s.dentro) && elegidos.length === 1)) s.dentro = '';
    let h = casillas(grupo, 'compararMx', T('Comparar las medias de'), principales, elegidos, n => n, '');
    if (conDentro && principales.length > 1) h += campo(grupo, 'dentro', T('Dentro de cada nivel de'), [['', T('— todos los niveles juntos —')]].concat(principales.map(n => [n, n])), s.dentro || '', T('Para comparar un factor por separado en cada nivel de otro cuando interactúan.'));
    return h + campo(grupo, 'ajuste', T('Ajuste de las comparaciones'), AJUSTES_MX(), s.ajuste);
  }
  /** Papeles de los diseños con efectos aleatorios: se proponen una vez por tabla. */
  function formDisenoMixto(c, m) {
    const s = estado.mxd, med = medidas(c).length ? medidas(c) : c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    const marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    if (!s._iniciado) {
      s._iniciado = true;
      /* primero por el nombre de la columna; nunca la misma columna en dos papeles */
      const usadas = new Set();
      const busca = re => { const n = agr.find(x => re.test(x) && !usadas.has(x)) || ''; if (n) usadas.add(n); return n; };
      s.respuesta = c.pap.respuestas.find(n => med.includes(n)) || med[0] || '';
      s.repeticion = busca(/^(rep|repeticion|repetición)/i);
      s.bloque = busca(/^(bloque|block|blq)/i) || (c.pap.bloque && agr.includes(c.pap.bloque) && !usadas.has(c.pap.bloque) ? (usadas.add(c.pap.bloque), c.pap.bloque) : '');
      s.localidad = busca(/(locali|ambiente|^env|^amb|sitio|^loc)/i);
      s.genotipo = busca(/(genotipo|^gen|clon|variedad|hibrido|híbrido|linea|línea)/i);
      const facs = c.pap.factores.filter(n => agr.includes(n) && ![s.respuesta, s.bloque, s.repeticion, s.localidad].includes(n));
      s.tratamientos = facs.slice(0, 2); s.tratamiento = s.genotipo || facs[0] || '';
      [s.parcelaGrande, s.subparcela] = [facs[0] || '', facs[1] || ''];
    }
    if (!med.includes(s.respuesta)) s.respuesta = med[0] || '';
    const opc = (excl, vacio) => (vacio ? [['', vacio]] : []).concat(agr.filter(n => n !== s.respuesta && !excl.includes(n)).map(n => [n, marca(n)]));
    let h = campo('mxd', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
    let trats = [];
    if (m === 'mixto-bloques') {
      s.tratamientos = s.tratamientos.filter(x => agr.includes(x) && x !== s.bloque);
      h += casillas('mxd', 'tratamientos', T('Factores de tratamiento (hasta 3, cruzados)'), agr.filter(n => n !== s.respuesta && n !== s.bloque), s.tratamientos, marca, T('No hay factores en la tabla.'));
      h += campo('mxd', 'bloque', T('Bloques (aleatorios)'), opc(s.tratamientos, T('— elige —')), s.bloque);
      trats = s.tratamientos;
    } else if (m === 'mixto-divididas') {
      h += campo('mxd', 'parcelaGrande', T('Factor en las parcelas grandes'), opc([s.bloque, s.repeticion], T('— elige —')), s.parcelaGrande);
      h += campo('mxd', 'subparcela', T('Factor en las subparcelas'), opc([s.bloque, s.repeticion, s.parcelaGrande], T('— elige —')), s.subparcela);
      h += campo('mxd', 'subsubparcela', T('Factor en sub-subparcelas (opcional)'), opc([s.bloque, s.repeticion, s.parcelaGrande, s.subparcela], T('— ninguno —')), s.subsubparcela);
      h += campo('mxd', 'bloque', T('Bloques (aleatorios)'), opc([s.parcelaGrande, s.subparcela, s.subsubparcela], T('— sin bloques —')), s.bloque);
      if (!s.bloque) h += campo('mxd', 'repeticion', T('Repetición (identifica cada parcela grande)'), opc([s.parcelaGrande, s.subparcela, s.subsubparcela], T('— elige —')), s.repeticion);
      trats = [s.parcelaGrande, s.subparcela, s.subsubparcela].filter(Boolean);
    } else if (m === 'mixto-latice') {
      h += campo('mxd', 'tratamiento', T('Tratamientos (genotipos, variedades)'), opc([s.repeticion, s.bloque], T('— elige —')), s.tratamiento);
      h += campo('mxd', 'repeticion', T('Repetición'), opc([s.tratamiento, s.bloque], T('— elige —')), s.repeticion);
      h += campo('mxd', 'bloque', T('Bloque incompleto (dentro de la repetición)'), opc([s.tratamiento, s.repeticion], T('— elige —')), s.bloque);
      h += '<label class="imp-check"><input type="checkbox" data-grupo="mxd" data-campo="repeticionAleatoria"' + (s.repeticionAleatoria ? ' checked' : '') + '> ' + esc(T('Repeticiones también aleatorias')) + '</label>';
      trats = [s.tratamiento].filter(Boolean);
    } else {
      h += campo('mxd', 'genotipo', T('Genotipos (fijos)'), opc([s.localidad, s.repeticion], T('— elige —')), s.genotipo);
      h += campo('mxd', 'localidad', T('Localidad o ambiente'), opc([s.genotipo, s.repeticion], T('— elige —')), s.localidad);
      h += campo('mxd', 'repeticion', T('Repetición (dentro de cada localidad)'), opc([s.genotipo, s.localidad], T('— elige —')), s.repeticion);
      h += '<label class="imp-check"><input type="checkbox" data-grupo="mxd" data-campo="localidadFija"' + (s.localidadFija ? ' checked' : '') + '> ' + esc(T('Localidades fijas (solo estas localidades interesan)')) + '</label>';
      trats = [s.genotipo].filter(Boolean);
    }
    try {
      const r = pedido(), f = SP.metodos[m];
      if (r && f) { f.validar(c.t, r.e, SP.opcionesCon(f, r.op)); } if (r && f) h += '<p class="small"><b>' + esc(T('Modelo:')) + '</b> <code>' + esc(q(s.respuesta) + ' ~ ' + SP.mixtos.opcionesDiseno(m, c.t, r.e, SP.opcionesCon(f, r.op)).derecha) + '</code></p>';
    } catch (err) { /* papeles incompletos */ }
    h += formCompararMx('mxd', s, trats, true);
    h += campo('mxd', 'gl', T('Grados de libertad de las pruebas'), [['satterthwaite', 'Satterthwaite'], ['kenward-roger', T('Kenward-Roger (más exacto con pocos grupos; tarda más)')]], s.gl);
    h += campo('mxd', 'estimacion', T('Estimación'), [['reml', T('REML (componentes de varianza sin sesgo)')], ['ml', T('Máxima verosimilitud')]], s.estimacion);
    h += '<p class="small muted">' + esc(T('Corre en el motor R dentro de tu navegador (lme4, lmerTest y emmeans).')) + '</p>';
    return h + campo('mxd', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('mxd', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Medidas repetidas: papeles propuestos por el nombre de las columnas; la estructura de covarianza, automática o pedida. */
  function formRepetidas(c) {
    const s = estado.rep, med = medidas(c).length ? medidas(c) : c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    const marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    if (!s._iniciado) {
      s._iniciado = true;
      const usadas = new Set(), todas = c.t.nombres;
      const busca = (re, lista0) => { const n = lista0.find(x => re.test(x) && !usadas.has(x)) || ''; if (n) usadas.add(n); return n; };
      s.tiempo = busca(/^(dds|dde|ddt|dia|día|dias|días|fecha|tiempo|semana|mes|edad|time|day|age|muestreo)/i, todas);
      s.sujeto = busca(/^(planta|sujeto|parcela|unidad|animal|arbol|árbol|rata|individuo|id|subject)/i, todas);
      s.bloque = busca(/^(bloque|block|blq|rep)/i, agr);
      s.respuesta = c.pap.respuestas.find(n => med.includes(n) && !usadas.has(n)) || med.find(n => !usadas.has(n)) || '';
      s.tratamientos = c.pap.factores.filter(n => agr.includes(n) && !usadas.has(n) && n !== s.respuesta).slice(0, 1);
      s.compararMx = null;
    }
    const todas = c.t.nombres.filter(n => n !== s.respuesta);
    let h = campo('rep', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
    h += campo('rep', 'tiempo', T('Tiempo (fecha de medición)'), [['', T('— elige —')]].concat(todas.filter(n => n !== s.sujeto).map(n => [n, n])), s.tiempo,
      T('Numérico (días, semanas) o factor; si es numérico se puede usar la AR(1) continua para fechas desiguales.'));
    h += campo('rep', 'sujeto', T('Unidad medida en cada fecha (planta, parcela, animal)'), [['', T('— elige —')]].concat(todas.filter(n => n !== s.tiempo).map(n => [n, n])), s.sujeto,
      T('Puede repetir su número en cada tratamiento: la unidad es la combinación de unidad, tratamiento y bloque.'));
    s.tratamientos = s.tratamientos.filter(x => agr.includes(x) && ![s.tiempo, s.sujeto, s.bloque].includes(x));
    h += casillas('rep', 'tratamientos', T('Factores de tratamiento (hasta 2; pueden faltar)'), agr.filter(n => ![s.respuesta, s.tiempo, s.sujeto, s.bloque].includes(n)), s.tratamientos, marca, T('No hay factores en la tabla.'));
    h += campo('rep', 'bloque', T('Bloques'), [['', T('— sin bloques —')]].concat(agr.filter(n => ![s.respuesta, s.tiempo, s.sujeto, ...s.tratamientos].includes(n)).map(n => [n, marca(n)])), s.bloque);
    const R = SP.repetidas;
    h += campo('rep', 'estructura', T('Estructura de covarianza entre fechas'), [['auto', T('La mejor según el criterio (se comparan todas)')]].concat(Object.entries(R.ESTRUCTURAS).map(([k, x]) => [k, x.nombre])), s.estructura);
    h += campo('rep', 'criterio', T('Criterio para elegirla'), [['aic', T('AIC (Akaike)')], ['bic', T('BIC (Schwarz)')]], s.criterio);
    if (s.compararMx === null) { s.compararMx = s.tratamientos.length ? [s.tratamientos[0]] : (s.tiempo ? [s.tiempo] : []); s.dentro = s.tratamientos.length ? s.tiempo : ''; }
    h += formCompararMx('rep', s, s.tratamientos.concat(s.tiempo ? [s.tiempo] : []), true);
    h += '<p class="small muted">' + esc(T('Corre en el motor R dentro de tu navegador (nlme y emmeans).')) + '</p>';
    return h + campo('rep', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('rep', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Componentes de varianza, heredabilidad y repetibilidad: papeles propuestos por el nombre de las columnas (una vez por tabla). */
  function sanearGen(c) {
    const s = estado.gen, med = medidas(c).length ? medidas(c) : c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!s._iniciado) {
      s._iniciado = true;
      const usadas = new Set(), busca = re => { const n = agr.find(x => re.test(x) && !usadas.has(x)) || ''; if (n) usadas.add(n); return n; };
      s.respuesta = c.pap.respuestas.find(n => med.includes(n)) || med[0] || '';
      s.genotipo = busca(/(genotipo|^gen|clon|variedad|cultivar|hibrido|híbrido|linea|línea|familia|progenie|accesi)/i);
      s.ambiente = busca(/(ambiente|locali|^env|^amb|sitio|^loc)/i);
      s.repeticion = busca(/^(rep|repeticion|repetición)/i);
      s.bloque = busca(/^(bloque|block|blq)/i);
      if (s.bloque && !s.repeticion) { s.repeticion = s.bloque; s.bloque = ''; }   // un solo nivel de bloques: completos
      const u2 = new Set(), busca2 = re => { const n = agr.find(x => re.test(x) && !u2.has(x)) || ''; if (n) u2.add(n); return n; };
      s.individuo = busca2(/^(arbol|árbol|planta|individuo|animal|vaca|sujeto|subject|parcela|rail|riel|id)/i) || s.genotipo;
      u2.add(s.individuo);
      s.fijosRep = [busca2(/(cosecha|año|anio|fecha|medici|evaluador|ciclo|ocasi|type|tipo)/i)].filter(Boolean);
      s.aleatorios = c.pap.factores.filter(n => agr.includes(n) && n !== s.respuesta).slice(0, 2);
      s.fijos = [];
    }
    if (!med.includes(s.respuesta)) s.respuesta = med[0] || '';
    for (const k of ['genotipo', 'repeticion', 'bloque', 'ambiente', 'individuo']) if (s[k] && !agr.includes(s[k])) s[k] = '';
    s.aleatorios = s.aleatorios.filter(n => agr.includes(n) && n !== s.respuesta).slice(0, 4);
    s.fijos = s.fijos.filter(n => agr.includes(n) && n !== s.respuesta && !s.aleatorios.includes(n)).slice(0, 3);
    s.fijosRep = s.fijosRep.filter(n => agr.includes(n) && n !== s.respuesta && n !== s.individuo).slice(0, 3);
    return { med, agr };
  }
  const PROPORCIONES = [[0.05, '5 %'], [0.1, '10 %'], [0.15, '15 %'], [0.2, '20 %'], [0.25, '25 %'], [0.3, '30 %'], [0.4, '40 %'], [0.5, '50 %']];
  function formGenetico(c, m) {
    const s = estado.gen, { med, agr } = sanearGen(c), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    let h = campo('gen', 'respuesta', T('Variable de respuesta'), lista(med), s.respuesta);
    const opc = (excl, vacio) => (vacio ? [['', vacio]] : []).concat(agr.filter(n => n !== s.respuesta && !excl.includes(n)).map(n => [n, marca(n)]));
    if (m === 'componentes-varianza') {
      h += casillas('gen', 'aleatorios', T('Factores aleatorios (hasta 4)'), agr.filter(n => n !== s.respuesta && !s.fijos.includes(n)), s.aleatorios, marca, T('No hay factores en la tabla.'));
      h += campo('gen', 'estructura', T('Cómo se relacionan'), Object.entries(SP.geneticos.ESTRUCTURAS).map(([k, v]) => [k, T(v)]), s.estructura,
        T('Anidados: cada factor dentro de los anteriores, en el orden de la tabla (por ejemplo, plantas dentro de parcelas dentro de localidades).'));
      h += casillas('gen', 'fijos', T('Factores fijos (opcional, hasta 3)'), agr.filter(n => n !== s.respuesta && !s.aleatorios.includes(n)), s.fijos, marca, T('No hay más factores.'));
    } else if (m === 'heredabilidad') {
      h += campo('gen', 'genotipo', T('Genotipos (aleatorios)'), opc([s.repeticion, s.bloque, s.ambiente], T('— elige —')), s.genotipo);
      h += campo('gen', 'repeticion', T('Repetición o bloque completo (fijo)'), opc([s.genotipo, s.bloque, s.ambiente], T('— sin repeticiones (completamente al azar) —')), s.repeticion);
      h += campo('gen', 'bloque', T('Bloque incompleto dentro de la repetición (aleatorio)'), opc([s.genotipo, s.repeticion, s.ambiente], T('— sin bloques incompletos —')), s.bloque,
        T('Para alfa-látice y otros diseños con bloques incompletos.'));
      h += campo('gen', 'ambiente', T('Ambiente o localidad (fijo)'), opc([s.genotipo, s.repeticion, s.bloque], T('— un solo ambiente —')), s.ambiente,
        T('Con varios ambientes, la interacción genotipo × ambiente entra como aleatoria.'));
      try { const ds = SP.geneticos.disenoGenetico({ genotipo: s.genotipo, repeticion: s.repeticion, bloque: s.bloque, ambiente: s.ambiente });
        if (s.genotipo) h += '<p class="small"><b>' + esc(T('Modelo:')) + '</b> <code>' + esc(q(s.respuesta) + ' ~ ' + (ds.fijos.length ? ds.fijos.map(t => t.map(q).join(':')).join(' + ') : '1') + ' + ' +
          ds.aleatorios.map(t => '(1 | ' + t.map(q).join(':') + ')').join(' + ')) + '</code></p>'; } catch (err) { /* papeles incompletos */ }
      h += campo('gen', 'seleccion', T('Proporción seleccionada'), PROPORCIONES, s.seleccion);
      h += campo('gen', 'direccion', T('Se seleccionan los valores'), [['mayor', T('Mayores (rendimiento, peso, contenido)')], ['menor', T('Menores (días a floración, altura, daño)')]], s.direccion);
    } else {
      h += campo('gen', 'individuo', T('Individuo medido varias veces (árbol, planta, animal)'), opc([], T('— elige —')), s.individuo);
      h += casillas('gen', 'fijosRep', T('Factores fijos (opcional: cosecha, año, evaluador)'), agr.filter(n => n !== s.respuesta && n !== s.individuo), s.fijosRep, marca, T('No hay más factores.'));
    }
    return h + '<p class="small muted">' + esc(T('Corre en tu navegador (REML por información promedio, validado contra lme4).')) + '</p>';
  }
  /** Modelos lineales generalizados: papeles propuestos por el nombre de las columnas; familia y enlace según el método. */
  const FAM_GLM = () => ({ auto: T('Automática (por la sobredispersión)'), binomial: T('Binomial'), cuasibinomial: T('Cuasibinomial (con sobredispersión)'), poisson: 'Poisson',
    cuasipoisson: T('Cuasi-Poisson (con sobredispersión)'), 'binomial-negativa': T('Binomial negativa'), gamma: T('Gamma'), 'inversa-gaussiana': T('Gaussiana inversa') });
  const ENL_GLM = () => ({ logit: 'logit', probit: 'probit', cloglog: T('log-log complementario'), log: T('logaritmo'), inverso: T('inverso'), identidad: T('identidad'),
    raiz: T('raíz cuadrada'), inverso2: '1/μ²', potencia: T('potencia (μ^λ)') });
  /** Un solo intercepto aleatorio en la fórmula escrita: lo que admite la cuadratura de Gauss-Hermite. */
  const unInterceptoTexto = d => { try { const sep = SP.mixtos.separar(d); return SP.glmmGen.unIntercepto({ aleatorios: sep.aleatorios }); } catch (err) { return false; } };
  const RESP_GLM = { 'glm-conteos': /(conteo|count|insect|trips|plant|larva|numero|número|lesion|lesión|fruto|mosca|huevo|adulto)/i, 'glm-proporciones': /(germin|muert|enferm|viva|exito|éxito|positiv|dead|kill)/i,
    'glm-gamma': /(tiempo|dias|días|time|conc|dura)/i, glm: /./ };
  RESP_GLM['glmm-bloques'] = new RegExp(RESP_GLM['glm-conteos'].source + '|' + RESP_GLM['glm-proporciones'].source, 'i');
  RESP_GLM.glmm = RESP_GLM['glmm-bloques'];
  const esMixtoGlm = m => m === 'glmm-bloques' || m === 'glmm';
  function sanearGlm(c, m) {
    const s = estado.glm, med = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!s._iniciado) {
      s._iniciado = true;
      s.respuesta = med.find(n => RESP_GLM[m].test(n)) || ultimaRespuesta(c);   // los conteos suelen parecer factores numéricos: no se excluyen
      s.ensayos = med.find(n => /(sembrad|total|ensayo|semillas|evaluad|^n$)/i.test(n) && n !== s.respuesta) || '';
      s.exposicion = '';
      s.bloque = c.pap.bloque && agr.includes(c.pap.bloque) ? c.pap.bloque : '';
      s.tratamientos = c.pap.factores.filter(n => agr.includes(n) && n !== s.bloque && n !== s.respuesta).slice(0, 2);
      s.covariables = [];
      s.derecha = [s.bloque, s.tratamientos.join(' * ')].filter(Boolean).join(' + ');
      s.comoFactor = c.numFactor.filter(n => s.derecha.split(/[^\p{L}\p{N}_.]+/u).includes(n));
      s.compararMx = null; s.metodo = '';
    }
    if (s.metodo !== m) {
      s.metodo = m;
      /* cada método propone su respuesta (conteo, éxitos, tiempo) y, en proporciones, sus ensayos */
      const r0 = m !== 'glm' && med.find(n => RESP_GLM[m].test(n));
      if (r0) s.respuesta = r0;
      if (m === 'glm-proporciones' && !s.ensayos) s.ensayos = med.find(n => /(sembrad|total|ensayo|semillas|evaluad|^n$)/i.test(n) && n !== s.respuesta) || '';
      s.familia = m === 'glm-gamma' ? 'gamma' : m === 'glm' || esMixtoGlm(m) ? (s.ensayos && /(germin|muert|enferm|viva|exito|éxito|positiv)/i.test(s.respuesta) ? 'binomial' : 'poisson') : 'auto';
      /* el modelo mixto desde la fórmula: el bloque como aleatorio */
      if (m === 'glm' && /\|/.test(s.derecha)) s.derecha = [s.bloque, s.tratamientos.join(' * ')].filter(Boolean).join(' + ');   // sin aleatorios
      if (m === 'glmm' && !/\|/.test(s.derecha)) s.derecha = [s.tratamientos.join(' * ') || '1', s.bloque ? '(1 | ' + s.bloque + ')' : ''].filter(Boolean).join(' + ');
      s.enlace = '';
    }
    if (!med.includes(s.respuesta)) s.respuesta = ultimaRespuesta(c);
    s.tratamientos = s.tratamientos.filter(n => agr.includes(n) && n !== s.respuesta && n !== s.bloque).slice(0, 3);
    if (s.bloque && (!agr.includes(s.bloque) || s.bloque === s.respuesta)) s.bloque = '';
    s.covariables = s.covariables.filter(n => med.includes(n) && n !== s.respuesta && !s.tratamientos.includes(n) && n !== s.bloque).slice(0, 2);
    for (const k of ['ensayos', 'exposicion']) if (s[k] && (!med.includes(s[k]) || s[k] === s.respuesta)) s[k] = '';
    return { med, agr };
  }
  function formGlm(c, m) {
    const s = estado.glm, { med, agr } = sanearGlm(c, m), marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n), G = SP.glm;
    let h = campo('glm', 'respuesta', m === 'glm-proporciones' ? T('Respuesta: éxitos (germinadas, enfermas) o 0/1') : m === 'glm-conteos' ? T('Respuesta: el conteo') : T('Variable de respuesta'), lista(med), s.respuesta);
    let principales;
    const mixtoG = esMixtoGlm(m);
    if (m === 'glmm') {
      h += '<label class="field"><span>' + esc(T('Términos del modelo con los aleatorios (lo que va después de «~»)')) + '</span><input type="text" data-grupo="glm" data-campo="derecha" spellcheck="false" autocomplete="off" value="' + esc(s.derecha) + '" placeholder="tratamiento + (1 | bloque)">' +
        '<span class="field-help">' + esc(T('Los efectos aleatorios van entre paréntesis como en lme4: (1 | bloque), (1 | localidad/bloque).')) + '</span></label>';
      const usadas = s.derecha.split(/[^\p{L}\p{N}_.]+/u);
      h += casillas('glm', 'comoFactor', T('Numéricas que son factor (dosis, bloque numerado)'), c.numFactor.filter(n => usadas.includes(n)), s.comoFactor, n => n, T('Ninguna columna numérica del modelo parece factor.'));
      let vars = [];
      try { vars = SP.modeloLineal.leerFormula(s.respuesta, SP.mixtos.separar(s.derecha).fijos || '1').variables; } catch (err) { /* fórmula incompleta */ }
      principales = vars.filter(v => c.factores.includes(v) || s.comoFactor.includes(v));
    } else if (m === 'glmm-bloques') {
      h += casillas('glm', 'tratamientos', T('Factores de tratamiento (hasta 3, cruzados)'), agr.filter(n => n !== s.respuesta && n !== s.bloque), s.tratamientos, marca, T('No hay factores en la tabla.'));
      h += campo('glm', 'bloque', T('Bloques (aleatorios)'), [['', T('— elige —')]].concat(agr.filter(n => n !== s.respuesta && !s.tratamientos.includes(n)).map(n => [n, marca(n)])), s.bloque);
      principales = s.tratamientos.slice();
    } else if (m === 'glm') {
      h += '<label class="field"><span>' + esc(T('Términos del modelo (lo que va después de «~»)')) + '</span><input type="text" data-grupo="glm" data-campo="derecha" spellcheck="false" autocomplete="off" value="' + esc(s.derecha) + '" placeholder="bloque + variedad * dosis">' +
        '<span class="field-help">' + esc(T('+ suma términos, * cruza con su interacción, : solo la interacción, / anida; las numéricas entran como covariables, salvo las que marques como factor.')) + '</span></label>';
      const usadas = s.derecha.split(/[^\p{L}\p{N}_.]+/u);
      h += casillas('glm', 'comoFactor', T('Numéricas que son factor (dosis, bloque numerado)'), c.numFactor.filter(n => usadas.includes(n)), s.comoFactor, n => n, T('Ninguna columna numérica del modelo parece factor.'));
      let vars = [];
      try { vars = SP.modeloLineal.leerFormula(s.respuesta, s.derecha).variables; } catch (err) { /* fórmula incompleta */ }
      principales = vars.filter(v => c.factores.includes(v) || s.comoFactor.includes(v));
    } else {
      h += casillas('glm', 'tratamientos', T('Factores de tratamiento (hasta 3, cruzados)'), agr.filter(n => n !== s.respuesta && n !== s.bloque), s.tratamientos, marca, T('No hay factores en la tabla.'));
      h += campo('glm', 'bloque', T('Bloques'), [['', T('— sin bloques —')]].concat(agr.filter(n => n !== s.respuesta && !s.tratamientos.includes(n)).map(n => [n, marca(n)])), s.bloque);
      h += casillas('glm', 'covariables', T('Covariables (opcional, hasta 2)'), med.filter(n => n !== s.respuesta && !s.tratamientos.includes(n) && n !== s.bloque && n !== s.ensayos && n !== s.exposicion && !c.numFactor.includes(n)), s.covariables, n => n, T('No hay más columnas numéricas.'));
      principales = s.tratamientos.slice();
    }
    const fams = mixtoG ? SP.glmmGen.FAMILIAS : m === 'glm' ? ['binomial', 'cuasibinomial', 'poisson', 'cuasipoisson', 'binomial-negativa', 'gamma', 'inversa-gaussiana'] : SP.generalizados.FAMILIAS_DE[m];
    if (!fams.includes(s.familia)) s.familia = fams[0];
    const base = s.familia === 'auto' ? SP.generalizados.BASE_DE[m] : s.familia, alt = s.familia === 'auto' ? SP.generalizados.ALTERNATIVA[base] : null;
    const enlaces = mixtoG ? SP.glmmGen.ENLACES[base] : G.FAMILIAS[base].enlaces.filter(x => !alt || G.FAMILIAS[alt].enlaces.includes(x));
    if (!enlaces.includes(s.enlace)) s.enlace = m === 'glm-gamma' ? 'log' : G.ENLACE_OMISION[base];
    const binomial = base === 'binomial' || base === 'cuasibinomial';
    if (binomial) h += campo('glm', 'ensayos', T('Ensayos de cada fila (semillas sembradas, plantas evaluadas)'), [['', T('— la respuesta es 0/1 —')]].concat(med.filter(n => n !== s.respuesta).map(n => [n, n])), s.ensayos);
    else if (base !== 'gamma' && base !== 'inversa-gaussiana') h += campo('glm', 'exposicion', T('Exposición (opcional: área o tiempo muestreado)'), [['', T('— todas las unidades iguales —')]].concat(med.filter(n => n !== s.respuesta).map(n => [n, n])), s.exposicion,
      T('Con exposición, las medias son tasas por unidad (por m², por día).'));
    if (fams.length > 1) h += campo('glm', 'familia', T('Familia'), fams.map(k => [k, FAM_GLM()[k]]), s.familia);
    if (enlaces.length > 1) h += campo('glm', 'enlace', T('Enlace'), enlaces.map(k => [k, ENL_GLM()[k]]), s.enlace);
    if (s.enlace === 'potencia') h += numero('glm', 'lambda', T('Exponente λ del enlace (μ^λ)'), s.lambda, '', ' min="0.01" step="0.05"');
    if (mixtoG) {
      if ((s.familia === 'binomial' || s.familia === 'poisson') && (m === 'glmm-bloques' || unInterceptoTexto(s.derecha))) h += campo('glm', 'nagq', T('Aproximación de la verosimilitud'),
        [[1, T('Laplace (1 nodo)')], [5, T('Gauss-Hermite con 5 nodos')], [10, T('Gauss-Hermite con 10 nodos')], [25, T('Gauss-Hermite con 25 nodos')]], s.nagq,
        T('Con un solo efecto aleatorio, la cuadratura es más exacta que Laplace (sobre todo con proporciones de pocos ensayos).'));
      else s.nagq = 1;
      if (s.familia !== 'gamma') h += `<label class="imp-check"><input type="checkbox" data-grupo="glm" data-campo="pruebaAleatorios"${s.pruebaAleatorios ? ' checked' : ''}> ${esc(T('Probar cada efecto aleatorio (razón de verosimilitudes)'))}</label>`;
      if (s.familia === 'poisson' || (s.familia === 'binomial' && s.ensayos)) h += campo('glm', 'sobredispersion', T('Efecto por observación (sobredispersión)'),
        [['auto', T('Automático: si la prueba de Pearson lo pide')], ['si', T('Sí, siempre')], ['no', T('No')]], s.sobredispersion, T('Un efecto aleatorio por fila absorbe la variación de más (Harrison 2014).'));
      if (+s.tipo === 1) s.tipo = 2;
      h += campo('glm', 'tipo', T('Pruebas de los efectos fijos'), [[2, T('χ² de Wald tipo II')], [3, T('χ² de Wald tipo III (suma cero)')]], s.tipo);
    } else {
      h += campo('glm', 'tipo', T('Análisis de devianza'), [[2, T('Tipo II (cada término ajustado por los que no lo contienen)')], [3, T('Tipo III (suma cero)')], [1, T('Tipo I (secuencial)')]], s.tipo);
      const puedeFirth = base === 'binomial' && (s.familia === 'binomial' || s.familia === 'auto') && s.enlace === 'logit';
      if (!puedeFirth) s.firth = false;
      if (puedeFirth) h += `<label class="imp-check"><input type="checkbox" data-grupo="glm" data-campo="firth"${s.firth ? ' checked' : ''}> ${esc(T('Corrección de Firth (para la separación: grupos con 0 % o 100 %)'))}</label>`;
      if (!s.firth) h += campo('glm', 'intervalo', T('Intervalos de los coeficientes'), [['wald', T('De Wald (estimado ± z·EE)')], ['perfil', T('Por verosimilitud perfilada')]], s.intervalo,
        s.intervalo === 'perfil' ? T('Pueden ser asimétricos; más exactos con pocos datos o probabilidades cerca de 0 o 1.') : '');
      else h += '<p class="small muted">' + esc(T('Con Firth, los p salen de la razón de verosimilitudes penalizadas y los intervalos de su perfil (como logistf).')) + '</p>';
    }
    if (s.compararMx === null) s.compararMx = principales.slice(0, 3);
    h += formCompararMx('glm', s, principales, true);
    h += '<p class="small muted">' + esc(mixtoG ? T('Corre en el motor R dentro de tu navegador (lme4, car y emmeans).') : T('Corre en tu navegador (mínimos cuadrados iterativamente reponderados, validado contra glm y glm.nb de R).')) + '</p>';
    return h + campo('glm', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('glm', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Regresión no lineal: la x (tiempo o dosis) y la respuesta propuestas por nombre; el modelo, según el método. */
  const X_NL = { 'curva-crecimiento': /^(dds|dde|ddt|dia|día|dias|días|tiempo|semana|mes|edad|time|day|age)/i, 'dosis-respuesta': /(dosis|dose|conc|^n$|^n_|nitr|kg|ppm)/i, 'respuesta-meseta': /(dosis|dose|^n$|^n_|nitr|kg|riego|lamina|lámina)/i };
  function formNoLineal(c, m) {
    const s = estado.nl, num = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2), NL = SP.metodosNoLineal;
    if (!s._iniciado || s.metodo !== m) {
      if (!s._iniciado || !num.includes(s.x) || !X_NL[m].test(s.x)) s.x = num.find(n => X_NL[m].test(n)) || '';
      if (!s._iniciado) s.respuesta = (c.pap.respuestas.filter(n => n !== s.x).slice(-1)[0]) || num.find(n => n !== s.x) || '';
      s._iniciado = true; s.metodo = m;
    }
    if (s.modelo !== 'auto' && !NL.MODELOS_DE[m].includes(s.modelo)) s.modelo = NL.MODELOS_DE[m][0];
    if (!num.includes(s.respuesta)) s.respuesta = num.find(n => n !== s.x) || '';
    if (s.grupo && !agr.includes(s.grupo)) s.grupo = '';
    if (s.pesos && (!num.includes(s.pesos) || [s.respuesta, s.x].includes(s.pesos))) s.pesos = '';
    let h = campo('nl', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += campo('nl', 'x', m === 'curva-crecimiento' ? T('Tiempo (días, semanas)') : T('Dosis'), [['', T('— elige —')]].concat(num.filter(n => n !== s.respuesta).map(n => [n, n])), s.x);
    h += campo('nl', 'grupo', T('Grupos que comparar (opcional)'), [['', T('— una sola curva —')]].concat(agr.filter(n => n !== s.respuesta && n !== s.x).map(n => [n, n])), s.grupo,
      T('Con grupos (variedades, productos), una curva por grupo y la prueba de si difieren.'));
    const may = k => NL.NOMBRE[k].charAt(0).toUpperCase() + NL.NOMBRE[k].slice(1);
    h += campo('nl', 'modelo', T('Modelo'), [['auto', T('El de menor AIC (ajusta todos y compara)')]].concat(NL.MODELOS_DE[m].map(k => [k, may(k)])), s.modelo,
      s.modelo === 'auto' ? T('Ajusta {l} a los mismos datos y se queda con el de menor AIC.', { l: NL.MODELOS_DE[m].map(k => NL.NOMBRE[k]).join(', ') }) : NL.ECUACION[s.modelo]);
    h += campo('nl', 'pesos', T('Pesos (opcional)'), [['', T('— sin pesos —')]].concat(num.filter(n => n !== s.respuesta && n !== s.x).map(n => [n, n])), s.pesos,
      T('Una columna con el peso de cada fila (p. ej. el número de plantas de la media): cuenta más la fila con más peso. Las filas con peso cero no entran.'));
    h += campo('nl', 'intervalo', T('Intervalos de los parámetros'), [['wald', T('De Wald (estimado ± t·EE)')], ['perfil', T('Por verosimilitud perfilada')]], s.intervalo,
      s.intervalo === 'perfil' ? T('Más exactos cuando la curva es muy no lineal (pueden ser asimétricos); tardan más. Lineal-meseta queda con Wald.') : '');
    if (m === 'respuesta-meseta') {
      h += numero('nl', 'precioProducto', T('Precio del producto (por unidad de respuesta)'), s.precioProducto, '', ' min="0" placeholder="' + esc(T('opcional')) + '"') +
        numero('nl', 'precioInsumo', T('Precio del insumo (por unidad de dosis)'), s.precioInsumo, '', ' min="0" placeholder="' + esc(T('opcional')) + '"');
      h += '<p class="small muted">' + esc(T('Con los dos precios, la dosis económica óptima: donde la última unidad de insumo todavía se paga con lo que agrega.')) + '</p>';
    }
    if (m !== 'curva-crecimiento') h += `<label class="imp-check"><input type="checkbox" data-grupo="nl" data-campo="ejeLog"${s.ejeLog ? ' checked' : ''}> ${esc(T('Dosis en escala logarítmica en la gráfica'))}</label>`;
    h += '<p class="small muted">' + esc(T('Corre en tu navegador (mínimos cuadrados no lineales con gradiente analítico, validado contra nls de R).')) + '</p>';
    return h + campo('nl', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('nl', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /**
   * Superficies de respuesta: los factores propuestos son las numéricas con pocos valores distintos (los niveles del
   * diseño: tres en un Box-Behnken, cinco en un central compuesto), sin la respuesta.
   */
  const nivelesNum = (c, n) => new Set(Array.from(c.t.col(n).valores).filter(v => v === v)).size;
  const esFactorDiseno = (c, n) => { const k = nivelesNum(c, n); return k >= 2 && k <= 7 && k <= c.t.n / 2; };
  function formSuperficie(c, m) {
    const s = estado.srf, num = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2 && !num.includes(n));
    if (!s._iniciado) {
      const disenos = num.filter(n => esFactorDiseno(c, n));
      s.respuesta = num.filter(n => !disenos.includes(n)).slice(-1)[0] || num[num.length - 1] || '';
      s.factores = disenos.filter(n => n !== s.respuesta).slice(0, 6);
      s.bloque = agr.find(n => /bloq|block|rep/i.test(n)) || '';
      s._iniciado = true;
    }
    if (!num.includes(s.respuesta)) s.respuesta = num[num.length - 1] || '';
    s.factores = s.factores.filter(n => num.includes(n) && n !== s.respuesta);
    if (s.bloque && (!agr.includes(s.bloque) || s.factores.includes(s.bloque))) s.bloque = '';
    let h = campo('srf', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += casillas('srf', 'factores', T('Factores del diseño (numéricos, de 2 a 6)'), num.filter(n => n !== s.respuesta), s.factores, n => n, T('No hay más columnas numéricas.'));
    h += campo('srf', 'bloque', T('Bloques (opcional)'), [['', T('— sin bloques —')]].concat(agr.filter(n => n !== s.respuesta).map(n => [n, n])), s.bloque);
    if (m === 'superficie-respuesta') h += campo('srf', 'orden', T('Modelo'), [['segundo', T('Segundo orden (con los cuadráticos)')], ['interacciones', T('Primer orden con interacciones')]], s.orden);
    h += campo('srf', 'objetivo', T('Buscar'), [['maximo', T('La máxima respuesta')], ['minimo', T('La mínima respuesta')]], s.objetivo,
      m === 'ascenso-pronunciado' ? T('El camino va en la dirección en que la respuesta cambia más rápido.') : T('La cresta da la mejor combinación a cada distancia del centro del diseño.'));
    h += campo('srf', 'codificacion', T('Codificación de los factores'), [['auto', T('La del diseño (centro y paso de sus niveles)')], ['manual', T('A mano: el nivel −1 y el +1 de cada factor')]], s.codificacion);
    if (s.codificacion === 'manual') for (const f of s.factores) {
      const v = (o, k) => (o[k] === undefined ? '' : o[k]);
      h += numero('srf', 'bajo|' + f, T('{f}: nivel −1', { f }), v(s.bajos, f)) + numero('srf', 'alto|' + f, T('{f}: nivel +1', { f }), v(s.altos, f));
    }
    h += '<p class="small muted">' + esc(T('Corre en tu navegador (mínimos cuadrados y análisis canónico, validado contra lm y eigen de R).')) + '</p>';
    return h + campo('srf', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('srf', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Generador de diseños (sin datos): el tipo, cuántos factores, α, centros y, si se quiere, nombres y niveles. */
  function formDisenoSuperficie(c) {
    const s = estado.dsn, mezcla = s.tipo === 'latice' || s.tipo === 'centroide';
    let h = c.sinDatos ? '<p class="small muted">' + esc(T('No hace falta cargar datos: el diseño se arma con los valores de abajo y se abre en Datos.')) + '</p>' : '';
    h += campo('dsn', 'tipo', T('Diseño'), [['ccd', T('Central compuesto')], ['bbd', 'Box-Behnken'], ['factorial', T('Factorial 2^k con centros')], ['latice', T('Simplex-látice (mezclas)')], ['centroide', T('Simplex-centroide (mezclas)')]], s.tipo);
    const rango = s.tipo === 'bbd' ? [3, 4, 5] : [2, 3, 4, 5, 6];
    if (!rango.includes(+s.k)) s.k = rango[0];
    h += campo('dsn', 'k', mezcla ? T('Componentes') : T('Factores'), rango.map(k => [k, String(k)]), s.k);
    if (s.tipo === 'ccd') h += campo('dsn', 'alfa', 'α', [['rotable', T('Rotable (α = F^¼)')], ['ortogonal', T('Ortogonal')], ['cara', T('Caras centradas (α = 1)')], ['bloques', T('Dos bloques ortogonales')]], s.alfa,
      T('Rotable: la misma precisión a la misma distancia del centro. Caras centradas: solo tres niveles por factor. Dos bloques: la parte factorial y la axial en días o lotes distintos.'));
    if (s.tipo === 'latice') h += campo('dsn', 'grado', T('Grado del látice'), [[2, '2 (0, ½, 1)'], [3, '3 (0, ⅓, ⅔, 1)'], [4, '4']], s.grado);
    h += numero('dsn', 'centros', mezcla ? T('Repeticiones del centroide') : T('Puntos centrales'), s.centros, T('Vacío: los de omisión del diseño.'), ' min="0" max="20" step="1" placeholder="' + esc(T('omisión')) + '"');
    h += '<label class="field"><span>' + esc(mezcla ? T('Nombres de los componentes (opcional)') : T('Nombres de los factores (opcional)')) + '</span><input type="text" class="input" data-grupo="dsn" data-campo="nombres" value="' + esc(s.nombres) + '" placeholder="' + esc(mezcla ? 'arcilla, arena, limo' : 'N, P') + '"></label>';
    if (mezcla) h += numero('dsn', 'total', T('Total de la mezcla'), s.total, T('1 para proporciones, 100 para porcentajes, o la masa total.'), ' min="0" step="any"');
    else {
      h += '<label class="field"><span>' + esc(T('Nivel bajo (−1) de cada factor (opcional)')) + '</span><input type="text" class="input" data-grupo="dsn" data-campo="bajos" value="' + esc(s.bajos) + '" placeholder="100, 50"></label>';
      h += '<label class="field"><span>' + esc(T('Nivel alto (+1) de cada factor (opcional)')) + '</span><input type="text" class="input" data-grupo="dsn" data-campo="altos" value="' + esc(s.altos) + '" placeholder="200, 90"></label>';
    }
    h += numero('dsn', 'semilla', T('Semilla para el orden al azar (opcional)'), s.semilla, T('La misma semilla da el mismo orden de corrida.'), ' step="1"');
    return h + '<p class="small muted">' + esc(T('Corre en tu navegador; el diseño se compara contra su construcción en R.')) + '</p>';
  }
  /** Mezclas: la respuesta, los componentes (proporciones) y el modelo de Scheffé. */
  function formMezclas(c) {
    const s = estado.mez, num = c.numericas;
    if (!s._iniciado) {
      s.respuesta = c.pap.respuestas.slice(-1)[0] || num[num.length - 1] || '';
      s.componentes = num.filter(n => n !== s.respuesta).slice(0, 3);
      s._iniciado = true;
    }
    if (!num.includes(s.respuesta)) s.respuesta = num[num.length - 1] || '';
    s.componentes = s.componentes.filter(n => num.includes(n) && n !== s.respuesta);
    let h = campo('mez', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += casillas('mez', 'componentes', T('Componentes de la mezcla (de 2 a 6; cada fila suma lo mismo)'), num.filter(n => n !== s.respuesta), s.componentes, n => n, T('No hay más columnas numéricas.'));
    h += campo('mez', 'modelo', T('Modelo de Scheffé'), [['lineal', T('Lineal (cada componente solo)')], ['cuadratico', T('Cuadrático (con las mezclas de dos)')], ['cubico-especial', T('Cúbico especial (con las de tres)')]], s.modelo);
    h += campo('mez', 'objetivo', T('Buscar'), [['maximo', T('La mezcla de mayor respuesta')], ['minimo', T('La mezcla de menor respuesta')]], s.objetivo);
    h += '<p class="small muted">' + esc(T('Corre en tu navegador (mínimos cuadrados sin intercepto, validado contra lm de R).')) + '</p>';
    return h + campo('mez', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel) + campo('mez', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Deseabilidad: las respuestas con su meta y sus límites, los factores y la región. */
  function formDeseabilidad(c) {
    const s = estado.des, num = c.numericas;
    if (!s._iniciado) {
      const disenos = num.filter(n => esFactorDiseno(c, n));
      s.factores = disenos.slice(0, 6);
      s.respuestasDes = num.filter(n => !disenos.includes(n)).slice(0, 4);
      s._iniciado = true;
    }
    s.factores = s.factores.filter(n => num.includes(n));
    s.respuestasDes = s.respuestasDes.filter(n => num.includes(n) && !s.factores.includes(n));
    let h = casillas('des', 'factores', T('Factores del diseño (numéricos, de 2 a 6)'), num, s.factores, n => n, T('No hay columnas numéricas.'));
    h += casillas('des', 'respuestasDes', T('Respuestas que combinar (de 1 a 6)'), num.filter(n => !s.factores.includes(n)), s.respuestasDes, n => n, T('No hay más columnas numéricas.'));
    for (const y of s.respuestasDes) {
      const v = Array.from(c.t.col(y).valores).filter(x => x === x), lo = Math.min(...v), hi = Math.max(...v);
      const p = s.por[y] || (s.por[y] = { meta: 'max', L: +lo.toPrecision(6), U: +hi.toPrecision(6), T: +((lo + hi) / 2).toPrecision(6), s: 1, t: 1, r: 1 });
      h += '<fieldset class="field des-resp"><legend>' + esc(y) + '</legend>' +
        campo('des', 'meta|' + y, T('Buscar'), [['max', T('La mayor')], ['min', T('La menor')], ['valor', T('Un valor meta')]], p.meta) +
        numero('des', 'L|' + y, T('Límite inferior'), p.L) + (p.meta === 'valor' ? numero('des', 'T|' + y, T('Valor meta'), p.T) : '') + numero('des', 'U|' + y, T('Límite superior'), p.U) +
        numero('des', 's|' + y, T('Exponente'), p.s, T('1: lineal; mayor que 1: exige acercarse más a la meta.'), ' min="0.1" step="0.1"') + (p.meta === 'valor' ? numero('des', 't|' + y, T('Exponente (arriba de la meta)'), p.t, '', ' min="0.1" step="0.1"') : '') +
        numero('des', 'r|' + y, T('Importancia'), p.r, '', ' min="0.1" step="0.1"') + '</fieldset>';
    }
    h += campo('des', 'region', T('Región de búsqueda'), [['cubo', T('El cubo de los niveles del diseño')], ['esfera', T('La esfera del diseño (central compuesto rotable)')]], s.region);
    return h + '<p class="small muted">' + esc(T('Cada respuesta con su modelo de segundo orden; la búsqueda corre en tu navegador (validada contra R).')) + '</p>';
  }

  /** Ensayos multiambiente: genotipo, ambiente y repetición propuestos por nombre. */
  function formMultiambiente(c, m) {
    const s = estado.ma, num = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!s._iniciado) {
      s.genotipo = agr.find(n => /gen|var|h[ií]brido|clon|cult|l[ií]nea/i.test(n)) || agr[0] || '';
      s.ambiente = agr.find(n => n !== s.genotipo && /amb|loc|env|a[ñn]o|sitio|ciclo|ensayo/i.test(n)) || agr.find(n => n !== s.genotipo) || '';
      s.repeticion = agr.find(n => n !== s.genotipo && n !== s.ambiente && /rep|bloq|block/i.test(n)) || '';
      s.respuesta = c.pap.respuestas.slice(-1)[0] || num[num.length - 1] || '';
      s._iniciado = true;
    }
    if (!num.includes(s.respuesta)) s.respuesta = num[num.length - 1] || '';
    for (const k of ['genotipo', 'ambiente', 'repeticion']) if (s[k] && (!agr.includes(s[k]) || s[k] === s.respuesta)) s[k] = '';
    const op = (sin, vacio) => [['', vacio]].concat(agr.filter(n => n !== s.respuesta && !sin.includes(n)).map(n => [n, n]));
    let h = campo('ma', 'respuesta', T('Variable de respuesta'), lista(num), s.respuesta);
    h += campo('ma', 'genotipo', T('Genotipos (variedades, híbridos, líneas)'), op([s.ambiente, s.repeticion], T('— elige —')), s.genotipo);
    h += campo('ma', 'ambiente', T('Ambientes (localidades, años, fechas)'), op([s.genotipo, s.repeticion], T('— elige —')), s.ambiente);
    h += campo('ma', 'repeticion', T('Repeticiones o bloques (opcional)'), op([s.genotipo, s.ambiente], T('— una media por celda —')), s.repeticion,
      T('Con repeticiones, el error de cada ambiente sale de sus bloques; sin ellas, cada fila es la media de un genotipo en un ambiente.'));
    if (m === 'estabilidad') {
      h += campo('ma', 'eeb', T('Error estándar de b'), [['propio', T('De la regresión de cada genotipo')], ['error', T('Del error combinado de los ambientes')]], s.eeb);
      h += campo('ma', 'probAnnicchiarico', T('Riesgo del índice de Annicchiarico'), [[0.25, '0.25 (z = 0.67)'], [0.1, '0.10 (z = 1.28)'], [0.05, '0.05 (z = 1.64)']], s.probAnnicchiarico,
        T('Wi = media − z·DE de la respuesta en % de la media del ambiente: un riesgo menor castiga más la inestabilidad.'));
    }
    if (m === 'ammi') {
      h += campo('ma', 'ejesWaas', T('Ejes del WAAS'), [[0, T('Los significativos (F de Gollob)')]].concat([1, 2, 3, 4, 5].map(k => [k, String(k)])), s.ejesWaas);
      h += numero('ma', 'pesoRespuesta', T('Peso de la respuesta en el WAASY (%)'), s.pesoRespuesta, T('0: solo estabilidad; 100: solo la respuesta.'), ' min="0" max="100" step="5"');
    }
    if (m === 'dos-etapas') h += '<p class="small muted">' + esc(T('Cada ambiente necesita error propio: repeticiones o varias parcelas por genotipo. Los genotipos que faltan en un ambiente no estorban.')) + '</p>';
    if (m === 'gge') {
      h += campo('ma', 'escala', T('Tabla'), [['ninguna', T('Centrada por ambiente')], ['desviacion', T('Centrada y dividida por la desviación de cada ambiente')]], s.escala);
      h += campo('ma', 'particion', T('Partición del valor singular'), [['simetrica', T('Simétrica')], ['genotipo', T('Por genotipo (para comparar genotipos)')], ['ambiente', T('Por ambiente (para comparar ambientes)')]], s.particion);
      const gens = s.genotipo ? nivelesDe(c, s.genotipo) : [];
      if (!gens.includes(s.genotipoA)) s.genotipoA = '';
      if (!gens.includes(s.genotipoB)) s.genotipoB = '';
      h += campo('ma', 'genotipoA', T('Comparar dos genotipos (opcional)'), [['', T('— ninguno —')]].concat(gens.map(n => [n, n])), s.genotipoA);
      if (s.genotipoA) h += campo('ma', 'genotipoB', T('… con'), [['', T('— elige —')]].concat(gens.filter(n => n !== s.genotipoA).map(n => [n, n])), s.genotipoB,
        T('En qué ambientes es mejor cada uno, según el biplot y según los datos.'));
    }
    if (m !== 'dos-etapas') {
      h += '<label class="imp-check"><input type="checkbox" data-grupo="ma" data-campo="imputar"' + (s.imputar ? ' checked' : '') + '> ' + esc(T('Imputar las celdas genotipo × ambiente vacías (EM-AMMI)')) + '</label>';
      if (s.imputar) h += campo('ma', 'ejesImputar', T('Ejes de la imputación'), [[0, T('0 (solo efectos aditivos)')], [1, '1'], [2, '2'], [3, '3']], s.ejesImputar);
    }
    h += campo('ma', 'objetivo', T('Lo mejor es'), [['maximo', T('La mayor respuesta')], ['minimo', T('La menor respuesta')]], s.objetivo);
    h += '<p class="small muted">' + esc(T('Corre en tu navegador (validado contra lm y svd de R).')) + '</p>';
    return h + campo('ma', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
  }
  /** Potencia y tamaño de muestra: números en lugar de columnas; se elige qué calcular y se dan los demás. */
  const numero = (grupo, nombre, etiqueta, valor, ayuda, extra) => `<label class="field"><span>${esc(etiqueta)}</span><input type="number" class="input" step="any" data-grupo="${grupo}" data-campo="${nombre}" value="${esc(String(valor))}"${extra || ''}>` +
    (ayuda ? `<span class="field-help">${esc(ayuda)}</span>` : '') + '</label>';
  function formPotencia(c, m) {
    const s = estado.pot, CALC = { 'potencia-medias': ['n', 'potencia', 'diferencia'], 'potencia-anova': ['n', 'potencia', 'varEntre'], 'potencia-proporciones': ['n', 'potencia'], 'potencia-correlacion': ['n', 'potencia', 'r'] }[m];
    const NOM = { n: T('El tamaño de muestra'), potencia: T('La potencia'), diferencia: T('La diferencia que se puede detectar'), varEntre: T('La variación entre medias que se puede detectar'), r: T('La correlación que se puede detectar') };
    let h = c.sinDatos ? '<p class="small muted">' + esc(T('No hace falta cargar datos: todo se calcula con los valores de abajo.')) + '</p>' : '';
    if (m === 'repeticiones') {
      h += numero('pot', 'cv', T('Coeficiente de variación esperado (%)'), s.cv, T('El de ensayos anteriores del mismo cultivo y variable.'), ' min="0"');
      h += numero('pot', 'difPct', T('Diferencia que interesa detectar (% de la media)'), s.difPct, '', ' min="0"');
      h += numero('pot', 'tratamientos', T('Tratamientos'), s.tratamientos, '', ' min="2" step="1"');
      h += campo('pot', 'diseno', T('Diseño'), [['dbca', T('Bloques completos al azar')], ['dca', T('Completamente al azar')]], s.diseno);
    } else {
      if (!CALC.includes(s.calcular)) s.calcular = 'n';
      h += campo('pot', 'calcular', T('¿Qué quieres calcular?'), CALC.map(k => [k, NOM[k]]), s.calcular);
      if (m === 'potencia-medias') {
        h += campo('pot', 'tipo', T('Comparación'), [['dos', T('Dos grupos independientes')], ['pareada', T('Pares (antes y después, la misma unidad)')], ['una', T('Una media contra un valor')]], s.tipo);
        if (s.calcular !== 'diferencia') h += numero('pot', 'diferencia', T('Diferencia entre medias que interesa'), s.diferencia, T('En las unidades de la variable (por ejemplo, 0.5 t/ha).'));
        h += numero('pot', 'de', T('Desviación estándar'), s.de, T('La del error, de un ensayo anterior o de la literatura.'), ' min="0"');
      } else if (m === 'potencia-anova') {
        h += `<label class="field"><span>${esc(T('Medias esperadas de los tratamientos (opcional)'))}</span><input type="text" class="input" data-grupo="pot" data-campo="medias" value="${esc(s.medias)}" placeholder="4.2, 4.8, 5.1, 5.6"><span class="field-help">${esc(T('Separadas por comas. Si las das, ya no hacen falta el número de tratamientos ni la varianza de las medias.'))}</span></label>`;
        if (!String(s.medias).trim()) {
          h += numero('pot', 'grupos', T('Tratamientos'), s.grupos, '', ' min="2" step="1"');
          if (s.calcular !== 'varEntre') h += numero('pot', 'varEntre', T('Varianza de las medias de los tratamientos'), s.varEntre, '', ' min="0"');
        }
        h += numero('pot', 'de', T('Desviación estándar del error'), s.de, '', ' min="0"');
      } else if (m === 'potencia-proporciones') {
        h += numero('pot', 'p1', T('Proporción en el grupo 1 (0 a 1)'), s.p1, '', ' min="0" max="1"') + numero('pot', 'p2', T('Proporción en el grupo 2 (0 a 1)'), s.p2, '', ' min="0" max="1"');
      } else if (s.calcular !== 'r') h += numero('pot', 'r', T('Correlación que interesa detectar'), s.r, '', ' min="-1" max="1"');
      if (s.calcular !== 'n') h += numero('pot', 'n', m === 'potencia-anova' ? T('Repeticiones por tratamiento') : m === 'potencia-correlacion' ? T('Pares de observaciones') : T('Tamaño de muestra (por grupo)'), s.n, '', ' min="2"');
      if (m !== 'potencia-anova') h += campo('pot', 'alternativa', T('Hipótesis alternativa'), [['bilateral', T('Bilateral (≠)')], ['unilateral', T('Unilateral (en una dirección)')]], s.alternativa);
    }
    if (s.calcular !== 'potencia' || m === 'repeticiones') h += numero('pot', 'potencia', T('Potencia deseada (0 a 1)'), s.potencia, T('Lo usual: 0.8 o 0.9.'), ' min="0" max="1"');
    h += numero('pot', 'alfa', T('Nivel de significancia'), s.alfa, '', ' min="0" max="1"');
    return h + '<p class="small muted">' + esc(T('Corre en tu navegador con las mismas fórmulas que R (validado contra power.t.test, power.anova.test, power.prop.test y pwr).')) + '</p>';
  }
  /** Multivariado: varias respuestas y los factores (MANOVA) o las variables y el grupo (discriminante). */
  function formMultivariado(c, m) {
    const s = estado.mv, num = c.numericas, agr = c.agrupables.filter(n => { const k = nivelesDe(c, n).length; return k >= 2 && k <= 30; });
    if (!s._iniciado) {
      const disenos = num.filter(n => esFactorDiseno(c, n));
      s.respuestas = c.pap.respuestas.filter(n => !disenos.includes(n)).slice(0, 4);
      if (s.respuestas.length < 2) s.respuestas = num.filter(n => !disenos.includes(n)).slice(-4);
      s.variables = s.respuestas.slice();
      s.bloque = agr.find(n => /bloq|block|rep/i.test(n)) || '';
      s.tratamientos = agr.filter(n => n !== s.bloque && /trat|var|h[ií]brido|gen|dosis|esp|origen|grupo|regi/i.test(n)).slice(0, 1);
      if (!s.tratamientos.length) s.tratamientos = agr.filter(n => n !== s.bloque).slice(0, 1);
      s.grupo = s.tratamientos[0] || '';
      s._iniciado = true;
    }
    let h = '';
    if (m === 'manova') {
      s.tratamientos = s.tratamientos.filter(n => agr.includes(n) && n !== s.bloque);
      s.respuestas = s.respuestas.filter(n => num.includes(n));
      h += casillas('mv', 'respuestasMv', T('Variables respuesta (de 2 a 10)'), num, s.respuestas, n => n, T('No hay columnas numéricas.'));
      h += casillas('mv', 'tratamientos', T('Factores de tratamiento (hasta 3, cruzados)'), agr.filter(n => n !== s.bloque), s.tratamientos, n => n, T('No hay factores en la tabla.'));
      h += campo('mv', 'bloque', T('Bloques (opcional)'), [['', T('— sin bloques —')]].concat(agr.filter(n => !s.tratamientos.includes(n)).map(n => [n, n])), s.bloque);
      h += campo('mv', 'prueba', T('Prueba principal'), [['pillai', T('Pillai (la más robusta)')], ['wilks', 'Wilks'], ['hotelling', 'Hotelling-Lawley'], ['roy', T('Roy (cota superior)')]], s.prueba);
      h += campo('mv', 'alfa', T('Nivel de significancia'), ALFAS, s.alfa);
    } else {
      s.variables = s.variables.filter(n => num.includes(n) && n !== s.grupo);
      if (s.grupo && !agr.includes(s.grupo)) s.grupo = '';
      h += campo('mv', 'grupo', T('Grupos que se quieren separar'), [['', T('— elige —')]].concat(agr.map(n => [n, n])), s.grupo);
      h += casillas('mv', 'variablesMv', T('Variables que los describen (de 2 a 15)'), num.filter(n => n !== s.grupo), s.variables, n => n, T('No hay columnas numéricas.'));
    }
    return h + '<p class="small muted">' + esc(m === 'manova' ? T('Corre en tu navegador (validado contra manova y summary.manova de R).') : T('Corre en tu navegador (validado contra lda de MASS, con su validación cruzada).')) + '</p>';
  }
  /** Series de tiempo: la variable y, si hace falta ordenarla, la columna del tiempo. */
  function formSeries(c, m) {
    const s = estado.ts, num = c.numericas, tiempos = num.concat(c.fechas || []);
    if (!s._iniciado) {
      s.tiempo = tiempos.find(n => /^(mes|a[ñn]o|anio|fecha|semana|d[ií]a|trimestre|tiempo|periodo|t)$|mes|a[ñn]o|anio|fecha|semana|trimestre|periodo/i.test(n)) || '';
      s.respuesta = c.pap.respuestas.filter(n => n !== s.tiempo).slice(-1)[0] || num.filter(n => n !== s.tiempo).slice(-1)[0] || '';
      s._iniciado = true;
    }
    if (!num.includes(s.respuesta)) s.respuesta = num.filter(n => n !== s.tiempo).slice(-1)[0] || '';
    if (s.tiempo && (!tiempos.includes(s.tiempo) || s.tiempo === s.respuesta)) s.tiempo = '';
    let h = campo('ts', 'respuesta', T('Variable medida en el tiempo'), lista(num.filter(n => n !== s.tiempo)), s.respuesta);
    h += campo('ts', 'tiempo', T('Columna del tiempo (para ordenar la serie)'), [['', T('— las filas ya están en orden —')]].concat(lista(tiempos.filter(n => n !== s.respuesta))), s.tiempo,
      T('Mes, año, semana o fecha: un valor por fila y a intervalos iguales.'));
    if (m === 'autocorrelacion') {
      h += numero('ts', 'rezagos', T('Rezagos de la ACF y la PACF (0 = como R: 10·log10(n))'), s.rezagos, '', ' min="0" step="1"');
      h += numero('ts', 'lagBox', T('Rezagos de las pruebas de Ljung-Box y Box-Pierce (0 = 10)'), s.lagBox, T('Con datos mensuales, 12 o 24.'), ' min="0" step="1"');
      h += numero('ts', 'fitdf', T('Parámetros ajustados antes (fitdf)'), s.fitdf, T('0 para una serie cruda; p + q si son los residuos de un modelo ARMA(p, q).'), ' min="0" step="1"');
      h += campo('ts', 'nivel', T('Nivel de la banda'), NIVELES, s.nivel);
    } else if (m === 'descomposicion') {
      h += numero('ts', 'frecuencia', T('Observaciones por ciclo (frecuencia)'), s.frecuencia, T('12 para meses en un año, 4 para trimestres, 7 para días en una semana, 52 para semanas.'), ' min="2" step="1"');
      h += campo('ts', 'tipo', T('Tipo'), [['aditiva', T('Aditiva (el ciclo suma lo mismo cada año)')], ['multiplicativa', T('Multiplicativa (el ciclo crece con el nivel)')]], s.tipo);
    } else if (m === 'arima') {
      const ord = (k, et, ayuda, max) => numero('ts', k, et, s[k], ayuda, ` min="0" max="${max}" step="1"`);
      h += campo('ts', 'buscarA', T('Orden del modelo'), [['no', T('Lo elijo yo')], ['si', T('Buscar el de menor AIC (p, q = 0…2; P, Q = 0…1)')]], s.buscarA, T('La búsqueda usa la d y la D que pongas abajo; con periodo prueba 36 modelos y tarda unos segundos.'));
      if (s.buscarA !== 'si') h += ord('ap', T('p: autorregresivos'), '', 5) + ord('aq', T('q: medias móviles'), '', 5);
      h += ord('ad', T('d: diferencias'), T('1 si la serie sube o baja sin volver a un nivel; 0 si oscila alrededor de su media.'), 2);
      h += numero('ts', 'periodoA', T('Periodo estacional (1 = sin parte estacional)'), s.periodoA, T('12 para meses, 4 para trimestres, 7 para días de la semana.'), ' min="1" step="1"');
      if (+s.periodoA > 1) {
        if (s.buscarA !== 'si') h += ord('aP', T('P: autorregresivos estacionales'), '', 2) + ord('aQ', T('Q: medias móviles estacionales'), '', 2);
        h += ord('aD', T('D: diferencias estacionales'), T('1 si el ciclo se repite año con año.'), 1);
      }
      if (+s.ad + (+s.periodoA > 1 ? +s.aD : 0) === 0) h += campo('ts', 'mediaA', T('Media de la serie'), [['si', T('Estimarla (la serie oscila alrededor de un nivel)')], ['no', T('Sin media (centrada en 0)')]], s.mediaA);
      h += numero('ts', 'horizonte', T('Pasos a pronosticar'), s.horizonte, '', ' min="1" max="120" step="1"');
      h += campo('ts', 'nivel', T('Nivel del intervalo de pronóstico'), NIVELES, s.nivel);
      return h + '<p class="small muted">' + esc(T('Corre en tu navegador (validado contra arima, predict y Box.test de R).')) + '</p>';
    } else h += campo('ts', 'nivel', T('Nivel de confianza de la pendiente'), NIVELES, s.nivel);
    return h + '<p class="small muted">' + esc(T('Corre en tu navegador (validado contra acf, pacf, Box.test y decompose de R, y mk.test y sens.slope de trend).')) + '</p>';
  }
  /** Supervivencia: el tiempo, el evento (0/1) y el grupo (Kaplan-Meier) o los factores y covariables (Cox). */
  function formSupervivencia(c, m) {
    const s = estado.sv, num = c.numericas, agr = c.agrupables.filter(n => { const k = nivelesDe(c, n).length; return k >= 2 && k <= 12; });
    const binaria = n => { const v = c.t.col(n).valores; let k = 0; for (const x of v) if (x === x) { if (x !== 0 && x !== 1) return false; k++; } return k > 0; };
    if (!s._iniciado) {
      const bins = num.filter(binaria);
      s.evento = bins.find(n => /event|muri|muert|germin|status|estado|flor|brot|cens|vivo|falla/i.test(n)) || bins[0] || '';
      s.tiempo = num.find(n => n !== s.evento && /tiempo|d[ií]as?|horas?|semanas?|meses|a[ñn]os|time|dds|dap/i.test(n)) || num.find(n => n !== s.evento && !binaria(n)) || '';
      s.grupo = agr.find(n => /trat|grupo|var|gen|h[ií]brido|insect|sustrato/i.test(n)) || '';
      s.factoresSv = s.grupo ? [s.grupo] : [];
      s.covariablesSv = [];
      s._iniciado = true;
    }
    if (!num.includes(s.tiempo)) s.tiempo = '';
    if (!num.includes(s.evento)) s.evento = '';
    let h = campo('sv', 'tiempo', T('Tiempo hasta el evento (o hasta la censura)'), [['', T('— elige —')]].concat(lista(num.filter(n => n !== s.evento))), s.tiempo, T('Días a germinar, horas hasta la muerte, semanas de vida…'));
    const evs = num.filter(n => n !== s.tiempo && binaria(n));
    h += campo('sv', 'evento', T('Evento (1 = ocurrió, 0 = censura)'), [['', T('— elige —')]].concat(lista(evs.length ? evs : num.filter(n => n !== s.tiempo))), s.evento,
      T('0 si la unidad terminó el ensayo sin el evento (no germinó, seguía viva) o se perdió.'));
    const libres = n => n !== s.tiempo && n !== s.evento;
    if (m === 'kaplan-meier') {
      if (s.grupo && (!agr.includes(s.grupo) || !libres(s.grupo))) s.grupo = '';
      h += campo('sv', 'grupo', T('Grupos que se comparan (opcional)'), [['', T('— una sola curva —')]].concat(lista(agr.filter(libres))), s.grupo);
      h += campo('sv', 'conf', T('Intervalo de la curva'), [['log', T('log (el de survival)')], ['log-log', 'log-log'], ['plain', T('lineal (plain)')]], s.conf);
      if (s.grupo) h += campo('sv', 'rho', T('Prueba para comparar las curvas'), [['0', T('Log-rank (mismo peso a todos los tiempos)')], ['1', T('Peto-Peto (más peso a los tiempos tempranos)')]], String(s.rho));
      if (s.estrato && (!agr.includes(s.estrato) || !libres(s.estrato) || s.estrato === s.grupo)) s.estrato = '';
      if (s.grupo) h += campo('sv', 'estrato', T('Estratos (opcional)'), [['', T('— sin estratos —')]].concat(lista(agr.filter(n => libres(n) && n !== s.grupo))), s.estrato,
        T('Lotes, sitios o fechas con distinto riesgo base: los grupos se comparan dentro de cada estrato.'));
    } else {
      s.factoresSv = s.factoresSv.filter(n => agr.includes(n) && libres(n));
      s.covariablesSv = s.covariablesSv.filter(n => num.includes(n) && libres(n));
      h += casillas('sv', 'factoresSv', T('Factores (tratamientos, variedades)'), agr.filter(libres), s.factoresSv, n => n, T('No hay factores en la tabla.'));
      h += casillas('sv', 'covariablesSv', T('Covariables numéricas'), num.filter(libres), s.covariablesSv, n => n, T('No hay más columnas numéricas.'));
      if (s.estrato && (!agr.includes(s.estrato) || !libres(s.estrato) || s.factoresSv.includes(s.estrato))) s.estrato = '';
      h += campo('sv', 'estrato', T('Estratos (opcional)'), [['', T('— sin estratos —')]].concat(lista(agr.filter(n => libres(n) && !s.factoresSv.includes(n)))), s.estrato,
        T('Cada estrato (lote, sitio, fecha de siembra) tiene su propio riesgo base, sin coeficiente: los HR se estiman dentro de los estratos.'));
      h += campo('sv', 'empates', T('Tiempos empatados'), [['efron', T('Efron (el de survival)')], ['breslow', 'Breslow']], s.empates, T('Con tiempos en días enteros hay muchos empates: Efron los trata mejor.'));
    }
    h += '<p class="small muted">' + esc(T('Corre en tu navegador (validado contra survfit, survdiff, coxph y cox.zph del paquete survival de R).')) + '</p>';
    return h + campo('sv', 'nivel', T('Nivel de confianza'), NIVELES, s.nivel);
  }
  /** Muestreo: el tamaño de muestra sin datos; la estimación con una columna y, en el estratificado, el tamaño de cada estrato. */
  function formMuestreo(c, m) {
    const s = estado.mue, pie = '<p class="small muted">' + esc(T('Corre en tu navegador con las fórmulas de Cochran (1977), validadas contra R.')) + '</p>';
    let h = '';
    if (m === 'tamano-muestra') {
      if (c.sinDatos) h += '<p class="small muted">' + esc(T('No hace falta cargar datos: todo se calcula con los valores de abajo.')) + '</p>';
      h += campo('mue', 'que', T('¿Qué se quiere estimar?'), [['media', T('Una media (peso, altura, rendimiento)')], ['proporcion', T('Una proporción (incidencia, germinación)')]], s.que);
      if (s.que === 'proporcion') {
        h += numero('mue', 'p', T('Proporción esperada (0 a 1)'), s.p, T('Si no se sabe, 0.5 da el tamaño más grande (el más seguro).'), ' min="0" max="1"');
        h += numero('mue', 'errorProp', T('Error máximo aceptable (± en proporción)'), s.errorProp, T('Por ejemplo, 0.05 para ± 5 puntos porcentuales.'), ' min="0" max="1"');
      } else {
        h += campo('mue', 'escala', T('La variación y el error se dan'), [['absoluto', T('En las unidades de la variable (DE y ± e)')], ['relativo', T('En porcentaje de la media (CV y ± %)')]], s.escala);
        if (s.escala === 'relativo') {
          h += numero('mue', 'cv', T('Coeficiente de variación esperado (%)'), s.cv, T('De un muestreo anterior o de la literatura.'), ' min="0"');
          h += numero('mue', 'errorPct', T('Error máximo aceptable (± % de la media)'), s.errorPct, '', ' min="0"');
        } else {
          h += numero('mue', 'de', T('Desviación estándar esperada'), s.de, T('De un muestreo anterior o de la literatura.'), ' min="0"');
          h += numero('mue', 'errorAbs', T('Error máximo aceptable (± en las unidades de la variable)'), s.errorAbs, '', ' min="0"');
        }
      }
      h += numero('mue', 'N', T('Tamaño de la población (0 si es muy grande)'), s.N, T('Plantas del lote, árboles de la huerta, sacos del almacén…'), ' min="0" step="1"');
      return h + campo('mue', 'confianza', T('Nivel de confianza'), NIVELES, s.confianza) + pie;
    }
    const num = c.numericas, agr = c.agrupables.filter(n => nivelesDe(c, n).length >= 2);
    if (!s._iniciado) {
      /* se propone una medida (kg, altura) antes que una columna 0/1, que se estima mejor como proporción en el aleatorio simple */
      const binaria = n => { const v = c.t.col(n).valores; let k = 0; for (const x of v) if (x === x) { if (x !== 0 && x !== 1) return false; k++; } return k > 0; };
      s.respuesta = c.pap.respuestas.filter(n => !binaria(n)).slice(-1)[0] || num.filter(n => !binaria(n)).slice(-1)[0] || num[num.length - 1] || '';
      s.estrato = agr.find(n => /estr|huert|lote|regi|zona|parc|suelo|sitio|loc/i.test(n)) || agr[0] || '';
      s._iniciado = true;
    }
    if (!num.includes(s.respuesta)) s.respuesta = num[num.length - 1] || '';
    h += campo('mue', 'respuesta', T('Variable medida en la muestra'), lista(num), s.respuesta);
    if (m === 'muestreo-simple') {
      h += campo('mue', 'tipoSimple', T('Estimar'), [['auto', T('Automático (proporción si la columna es 0/1)')], ['media', T('La media y el total')], ['proporcion', T('Una proporción (columna 0/1)')]], s.tipoSimple);
      h += numero('mue', 'N', T('Tamaño de la población (0 si es muy grande o desconocido)'), s.N, T('Con él se corrige el error por población finita y se estima el total.'), ' min="0" step="1"');
    } else {
      if (s.estrato && (!agr.includes(s.estrato) || s.estrato === s.respuesta)) s.estrato = '';
      h += campo('mue', 'estrato', T('Estratos (huertas, lotes, regiones, tipos de suelo)'), [['', T('— elige —')]].concat(agr.filter(n => n !== s.respuesta).map(n => [n, n])), s.estrato);
      if (s.estrato) {
        h += `<fieldset class="exp-casillas"><legend>${esc(T('Tamaño de la población de cada estrato (N_h)'))}</legend>`;
        for (const l of nivelesDe(c, s.estrato)) h += numero('mueN', esc(l), l, estado.mueN[l] === undefined ? '' : estado.mueN[l], '', ' min="1" step="1"');
        h += `<p class="small muted">${esc(T('Las unidades que hay en cada estrato, no solo las muestreadas.'))}</p></fieldset>`;
      }
      h += numero('mue', 'nTotal', T('Repartir una muestra nueva de (opcional)'), s.nTotal, T('Con un total, propone cuántas unidades tomar en cada estrato: proporcional y de Neyman.'), ' min="0" step="1"');
    }
    return h + campo('mue', 'confianza', T('Nivel de confianza'), NIVELES, s.confianza) + pie;
  }
  function formulario(c) {
    if (POTENCIA.includes(estado.metodo)) return formPotencia(c, estado.metodo);
    if (MUESTREO.includes(estado.metodo)) return formMuestreo(c, estado.metodo);
    if (SUPERVIVENCIA.includes(estado.metodo)) return formSupervivencia(c, estado.metodo);
    if (SERIES.includes(estado.metodo)) return formSeries(c, estado.metodo);
    if (MULTIVARIADO.includes(estado.metodo)) return formMultivariado(c, estado.metodo);
    if (MULTI.includes(estado.metodo)) return formMultiambiente(c, estado.metodo);
    if (SUPERFICIES.includes(estado.metodo)) return formSuperficie(c, estado.metodo);
    if (estado.metodo === 'diseno-superficie') return formDisenoSuperficie(c);
    if (estado.metodo === 'mezclas') return formMezclas(c);
    if (estado.metodo === 'deseabilidad') return formDeseabilidad(c);
    if (NOLINEAL.includes(estado.metodo)) return formNoLineal(c, estado.metodo);
    if (GLMS.includes(estado.metodo)) return formGlm(c, estado.metodo);
    if (GENETICOS.includes(estado.metodo)) return formGenetico(c, estado.metodo);
    if (estado.metodo === 'medidas-repetidas') return formRepetidas(c);
    if (estado.metodo === 'modelo-mixto') return formMixto(c);
    if (MIXTOS_DIS.includes(estado.metodo)) return formDisenoMixto(c, estado.metodo);
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
    if (m === 'modelo-mixto') {
      const s = estado.mx;
      return { e: { respuesta: s.respuesta }, op: Object.assign({ derecha: s.derecha, comoFactor: s.comoFactor.slice(), tipoSC: +s.tipoSC, gl: s.gl, reml: s.estimacion !== 'ml', ajuste: s.ajuste, alfa: +s.alfa, nivel: +s.nivel },
        s.compararMx ? { comparar: s.compararMx.slice() } : {}, s.dentro ? { dentro: s.dentro } : {}) };
    }
    if (POTENCIA.includes(m)) {
      const s = estado.pot, n = k => +s[k], base = { alfa: n('alfa'), potencia: n('potencia') };
      if (m === 'repeticiones') return { e: {}, op: Object.assign(base, { cv: n('cv'), diferencia: n('difPct'), tratamientos: n('tratamientos'), diseno: s.diseno }) };
      const op = Object.assign(base, { calcular: s.calcular, n: n('n') });
      if (m === 'potencia-medias') Object.assign(op, { diferencia: n('diferencia'), de: n('de'), tipo: s.tipo, alternativa: s.alternativa });
      else if (m === 'potencia-anova') Object.assign(op, { grupos: n('grupos'), medias: String(s.medias || ''), varEntre: n('varEntre'), de: n('de') });
      else if (m === 'potencia-proporciones') Object.assign(op, { p1: n('p1'), p2: n('p2'), alternativa: s.alternativa });
      else Object.assign(op, { r: n('r'), alternativa: s.alternativa });
      return { e: {}, op };
    }
    if (MULTIVARIADO.includes(m)) {
      const s = estado.mv;
      if (m === 'manova') return { e: Object.assign({ respuestas: s.respuestas.slice(), tratamientos: s.tratamientos.slice() }, s.bloque ? { bloque: s.bloque } : {}), op: { prueba: s.prueba, alfa: +s.alfa } };
      return { e: { variables: s.variables.slice(), grupo: s.grupo }, op: {} };
    }
    if (SERIES.includes(m)) {
      const s = estado.ts, e = { respuesta: s.respuesta };
      if (s.tiempo) e.tiempo = s.tiempo;
      if (m === 'autocorrelacion') return { e, op: { rezagos: +s.rezagos, lagBox: +s.lagBox, fitdf: +s.fitdf, nivel: +s.nivel } };
      if (m === 'descomposicion') return { e, op: { frecuencia: +s.frecuencia, tipo: s.tipo } };
      if (m === 'arima') {
        const est = +s.periodoA > 1;
        return { e, op: { p: +s.ap, d: +s.ad, q: +s.aq, P: est ? +s.aP : 0, D: est ? +s.aD : 0, Q: est ? +s.aQ : 0, periodo: +s.periodoA, media: s.mediaA !== 'no', buscar: s.buscarA === 'si', horizonte: +s.horizonte, nivel: +s.nivel } };
      }
      return { e, op: { nivel: +s.nivel } };
    }
    if (SUPERVIVENCIA.includes(m)) {
      const s = estado.sv, e = { tiempo: s.tiempo, evento: s.evento };
      if (m === 'kaplan-meier') { if (s.grupo) { e.grupo = s.grupo; if (s.estrato) e.estrato = s.estrato; } return { e, op: { conf: s.conf, nivel: +s.nivel, rho: +s.rho } }; }
      if (s.factoresSv.length) e.factores = s.factoresSv.slice();
      if (s.covariablesSv.length) e.covariables = s.covariablesSv.slice();
      if (s.estrato) e.estrato = s.estrato;
      return { e, op: { empates: s.empates, nivel: +s.nivel } };
    }
    if (MUESTREO.includes(m)) {
      const s = estado.mue;
      if (m === 'tamano-muestra') return { e: {}, op: { tipo: s.que, escala: s.escala, de: +s.de, cv: +s.cv, p: +s.p, N: +s.N, confianza: +s.confianza,
        error: +(s.que === 'proporcion' ? s.errorProp : s.escala === 'relativo' ? s.errorPct : s.errorAbs) } };
      if (m === 'muestreo-simple') return { e: { respuesta: s.respuesta }, op: { N: +s.N, tipo: s.tipoSimple, confianza: +s.confianza } };
      /* los tamaños escritos, de este estrato y de otros (el método toma los de sus niveles) */
      const pob = Object.entries(estado.mueN).filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([k, v]) => k + '=' + v).join('; ');
      return { e: { respuesta: s.respuesta, estrato: s.estrato }, op: { poblaciones: pob, nTotal: +s.nTotal, confianza: +s.confianza } };
    }
    if (MULTI.includes(m)) {
      const s = estado.ma, e = { respuesta: s.respuesta, genotipo: s.genotipo, ambiente: s.ambiente };
      if (s.repeticion) e.repeticion = s.repeticion;
      const imp = m === 'dos-etapas' ? {} : { imputar: !!s.imputar, ejesImputar: +s.ejesImputar };
      return { e, op: Object.assign({ objetivo: s.objetivo, alfa: +s.alfa }, imp, m === 'estabilidad' ? { eeb: s.eeb, probAnnicchiarico: +s.probAnnicchiarico } : {},
        m === 'ammi' ? { ejesWaas: +s.ejesWaas, pesoRespuesta: +s.pesoRespuesta } : {},
        m === 'gge' ? Object.assign({ escala: s.escala, particion: s.particion }, s.genotipoA && s.genotipoB && s.genotipoA !== s.genotipoB ? { genotipoA: s.genotipoA, genotipoB: s.genotipoB } : {}) : {}) };
    }
    if (SUPERFICIES.includes(m)) {
      const s = estado.srf, e = { respuesta: s.respuesta, factores: s.factores.slice() };
      if (s.bloque) e.bloque = s.bloque;
      const manual = s.codificacion === 'manual' && s.factores.every(f => s.bajos[f] !== undefined && s.bajos[f] !== '' && s.altos[f] !== undefined && s.altos[f] !== '');
      return { e, op: Object.assign(m === 'superficie-respuesta' ? { orden: s.orden } : {}, { objetivo: s.objetivo, nivel: +s.nivel, alfa: +s.alfa },
        manual ? { codificacion: 'manual', bajos: s.factores.map(f => +s.bajos[f]), altos: s.factores.map(f => +s.altos[f]) } : {}) };
    }
    if (m === 'diseno-superficie') { const s = estado.dsn; return { e: {}, op: { tipo: s.tipo, k: +s.k, alfa: s.alfa, centros: s.centros, grado: +s.grado, nombres: s.nombres, bajos: s.bajos, altos: s.altos, total: +s.total || 1, semilla: s.semilla } }; }
    if (m === 'mezclas') { const s = estado.mez; return { e: { respuesta: s.respuesta, componentes: s.componentes.slice() }, op: { modelo: s.modelo, objetivo: s.objetivo, nivel: +s.nivel, alfa: +s.alfa } }; }
    if (m === 'deseabilidad') {
      const s = estado.des, R = s.respuestasDes, p = y => s.por[y] || {};
      return { e: { respuestas: R.slice(), factores: s.factores.slice() }, op: { metas: R.map(y => p(y).meta || 'max'), inferiores: R.map(y => +p(y).L), superiores: R.map(y => +p(y).U), objetivos: R.map(y => +p(y).T || 0),
        exponentes: R.map(y => +p(y).s || 1), exponentes2: R.map(y => +p(y).t || 1), importancias: R.map(y => +p(y).r || 1), region: s.region } };
    }
    if (NOLINEAL.includes(m)) {
      const s = estado.nl, e = { respuesta: s.respuesta };
      e[m === 'curva-crecimiento' ? 'x' : 'dosis'] = s.x;
      if (s.grupo) e.grupo = s.grupo;
      if (s.pesos) e.pesos = s.pesos;
      const op = { modelo: s.modelo, nivel: +s.nivel, alfa: +s.alfa, intervalo: s.intervalo };
      if (m === 'respuesta-meseta' && (+s.precioProducto > 0 || +s.precioInsumo > 0)) Object.assign(op, { precioProducto: +s.precioProducto || 0, precioInsumo: +s.precioInsumo || 0 });
      if (m !== 'curva-crecimiento' && s.ejeLog) op.ejeLog = true;
      return { e, op };
    }
    if (GLMS.includes(m)) {
      const s = estado.glm, binomial = ['binomial', 'cuasibinomial'].includes(s.familia) || (s.familia === 'auto' && m === 'glm-proporciones');
      const e = { respuesta: s.respuesta };
      if (m === 'glmm-bloques') { e.tratamientos = s.tratamientos.slice(); e.bloque = s.bloque; }
      else if (m !== 'glm' && m !== 'glmm') { e.tratamientos = s.tratamientos.slice(); if (s.bloque) e.bloque = s.bloque; if (s.covariables.length) e.covariables = s.covariables.slice(); }
      if (binomial && s.ensayos) e.ensayos = s.ensayos;
      if (!binomial && s.familia !== 'gamma' && s.familia !== 'inversa-gaussiana' && s.exposicion) e.exposicion = s.exposicion;
      const op = { familia: s.familia, enlace: s.enlace, tipo: +s.tipo, comparar: (s.compararMx || []).slice(), dentro: s.dentro || '', ajuste: s.ajuste, nivel: +s.nivel, alfa: +s.alfa };
      if (m === 'glm' || m === 'glmm') Object.assign(op, { derecha: s.derecha, comoFactor: s.comoFactor.slice() });
      if (s.enlace === 'potencia') op.lambda = +s.lambda;
      if (esMixtoGlm(m)) Object.assign(op, { sobredispersion: s.sobredispersion, nagq: +s.nagq || 1, pruebaAleatorios: !!s.pruebaAleatorios });
      else if (s.firth) op.firth = true;
      else op.intervalo = s.intervalo;
      if (s.compararMx === null) delete op.comparar;
      return { e, op };
    }
    if (GENETICOS.includes(m)) {
      const s = estado.gen;
      if (m === 'componentes-varianza') return { e: Object.assign({ respuesta: s.respuesta, aleatorios: s.aleatorios.slice() }, s.fijos.length ? { fijos: s.fijos.slice() } : {}), op: { estructura: s.estructura } };
      if (m === 'heredabilidad') {
        const e = { respuesta: s.respuesta, genotipo: s.genotipo };
        for (const k of ['repeticion', 'bloque', 'ambiente']) if (s[k]) e[k] = s[k];
        return { e, op: { seleccion: +s.seleccion, direccion: s.direccion } };
      }
      return { e: Object.assign({ respuesta: s.respuesta, individuo: s.individuo }, s.fijosRep.length ? { fijos: s.fijosRep.slice() } : {}), op: {} };
    }
    if (m === 'medidas-repetidas') {
      const s = estado.rep;
      return { e: Object.assign({ respuesta: s.respuesta, tiempo: s.tiempo, sujeto: s.sujeto, tratamientos: s.tratamientos.slice() }, s.bloque ? { bloque: s.bloque } : {}),
        op: { estructura: s.estructura, criterio: s.criterio, comparar: (s.compararMx || []).slice(), dentro: s.dentro || '', ajuste: s.ajuste, alfa: +s.alfa, nivel: +s.nivel } };
    }
    if (MIXTOS_DIS.includes(m)) {
      const s = estado.mxd, e = { respuesta: s.respuesta };
      if (m === 'mixto-bloques') Object.assign(e, { tratamientos: s.tratamientos.slice(), bloque: s.bloque });
      else if (m === 'mixto-divididas') Object.assign(e, { parcelaGrande: s.parcelaGrande, subparcela: s.subparcela }, s.subsubparcela ? { subsubparcela: s.subsubparcela } : {}, s.bloque ? { bloque: s.bloque } : { repeticion: s.repeticion });
      else if (m === 'mixto-latice') Object.assign(e, { tratamiento: s.tratamiento, repeticion: s.repeticion, bloque: s.bloque });
      else Object.assign(e, { genotipo: s.genotipo, localidad: s.localidad, repeticion: s.repeticion });
      return { e, op: Object.assign({ gl: s.gl, reml: s.estimacion !== 'ml', ajuste: s.ajuste, alfa: +s.alfa, nivel: +s.nivel },
        s.compararMx ? { comparar: s.compararMx.slice() } : {}, s.dentro ? { dentro: s.dentro } : {}, m === 'mixto-latice' ? { repeticionAleatoria: !!s.repeticionAleatoria } : {}, m === 'mixto-localidades' ? { localidadFija: !!s.localidadFija } : {}) };
    }
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
  /* la ficha de Fundamentos del análisis (bloque 9) */
  const botonFicha = () => (estado.metodo && SP.app.fundamentos ? `<button type="button" class="btn btn-ghost btn-sm exp-ficha" data-ficha="${esc(estado.metodo)}" title="${esc(T('Fundamentos: el modelo, los supuestos y los datos que necesita'))}"><span aria-hidden="true">ⓘ</span> ${esc(T('¿Qué es este análisis?'))}</button>` : '');
  const copiarHTML = i => `<div class="btn-row exp-acciones"><button type="button" class="btn btn-secondary btn-sm" data-accion="copiar" data-cuadro="${i}">${esc(T('Copiar cuadro'))}</button>` +
    `<button type="button" class="btn btn-ghost btn-sm" data-accion="csv" data-cuadro="${i}">${esc(T('Bajar en CSV'))}</button></div>`;

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
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('modelo {m} · n = {n} · calculado en {ms} ms', { m: r.formula, n: r.n, ms: Math.max(1, Math.round(ms)) }))}</span>${botonFicha()}${botonReporte()}</div>` +
      semaforoHTML(rep.semaforo, r.global, ({ verde: T('Los supuestos se cumplen'), ambar: T('Hay supuestos que revisar'), rojo: T('Hay supuestos que no se cumplen'), gris: T('Sin datos suficientes') }[r.global]), T('Semáforo de los supuestos')) +
      (rec.length ? `<div class="callout exp-conclusion"><p><b>${esc(T('Qué hacer'))}</b></p><ul class="ana-rec">${rec.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '') +
      (r.excluidas ? `<p class="small muted">${esc(T('{k} filas con algún valor faltante en el modelo no entran.', { k: r.excluidas }))}</p>` : '') +
      (SP.temasGraficas ? SP.temasGraficas.selector() : '') + graficasSupuestos(r) +
      SP.cuadros.html(rep.cuadros[0], { numero: 1 }) + copiarHTML(0) +
      (rep.cuadros[1] ? `<details class="exp-extras"><summary>${esc(T('Varianza de los residuos por tratamiento'))}</summary>${SP.cuadros.html(rep.cuadros[1], { numero: 2 })}</details>` : '') +
      codigoHTML(codigo) +
      (SP.app.suite ? SP.app.suite.franjaMetodo('supuestos') : '');
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
        titulo: T('AIC en cada paso'), x: { titulo: T('Paso'), enteros: true }, y: { titulo: 'AIC' }, descripcion: T('AIC del modelo después de cada paso de la selección; menor es mejor.'),
        puntos: xs.map((x, k) => ({ x, y: ys[k], marca: k === xs.length - 1 })), linea: { x: xs, y: ys },
      });
    }
    const prim = r.filas.filter(f => f.rango === 1), xs = prim.map(f => f.tamano);
    return SP.graficas.dispersion({
      titulo: T('BIC del mejor modelo de cada tamaño'), x: { titulo: T('Número de predictores'), enteros: true }, y: { titulo: 'BIC' },
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
  /** Medidas repetidas: el perfil de cada tratamiento en el tiempo (o la media de cada fecha) y los residuos normalizados. */
  /** Componentes: el porcentaje de cada uno. Heredabilidad y repetibilidad: los valores predichos (BLUP) con su intervalo y,
      según el caso, BLUP contra BLUE (el encogimiento) o la determinación según el número de medidas. */
  function graficasGeneticos(r) {
    if (r.tipo === 'componentes') {
      return SP.graficas.medias({ titulo: T('Porcentaje de la varianza total'), y: { titulo: T('% de la varianza total') },
        descripcion: T('Parte de la varianza total de «{y}» que aporta cada componente.', { y: r.respuesta }),
        grupos: r.componentes.map(x => ({ nombre: r.etiqueta(x.termino), media: x.porcentaje })) });
    }
    const her = r.tipo === 'heredabilidad', out = [];
    const vals = r.blup.map((b, j) => ({ nombre: her ? b.genotipo : b.individuo, v: r.media + b.u, ee: Math.sqrt(b.pev), blue: her ? r.blue[j].media : NaN }));
    const menor = r.direccion === 'menor', ord = vals.slice().sort((a, b) => (menor ? a.v - b.v : b.v - a.v)), sel = new Set(her ? r.seleccion.seleccionados : []);
    const tope = 40, muestra = ord.slice(0, tope);
    out.push(SP.graficas.medias({ titulo: her ? T('Valores genotípicos predichos (BLUP)') : T('Valor permanente de cada individuo (BLUP)'), y: { titulo: r.respuesta },
      descripcion: T('{q} ordenados{m}, con su intervalo de ± 1.96 √PEV; la línea discontinua es la media general{s}.', { q: her ? T('Genotipos') : T('Individuos'),
        m: ord.length > tope ? T(' (los {k} mejores de {n})', { k: tope, n: ord.length }) : '', s: sel.size ? T('; los seleccionados, resaltados') : '' }),
      grupos: muestra.map(b => ({ nombre: b.nombre, media: b.v, inf: b.v - 1.96 * b.ee, sup: b.v + 1.96 * b.ee, marca: sel.has(b.nombre) })), referencias: [{ y: r.media, discontinua: true }] }));
    if (her) {
      out.push(SP.graficas.dispersion({ titulo: T('BLUP contra BLUE'), x: { titulo: T('Media ajustada (BLUE)') }, y: { titulo: T('Valor genotípico (BLUP)') }, diagonal: true,
        descripcion: T('Cada punto es un genotipo. Los BLUP se acercan a la media general (encogimiento) tanto más cuanto menor es la heredabilidad; la diagonal es BLUP = BLUE.'),
        puntos: SP.graficas.adelgazar(vals.map(b => ({ x: b.blue, y: b.v, marca: sel.has(b.nombre), etiqueta: sel.has(b.nombre) ? b.nombre : undefined })), 2500) }));
    } else {
      const ms = Array.from({ length: 10 }, (_, k) => k + 1), rr = r.repetibilidad.r;
      out.push(SP.graficas.lineas({ titulo: T('Determinación según el número de medidas'), x: { titulo: T('Medidas por individuo'), niveles: ms.map(String) }, y: { titulo: 'R²' }, leyenda: '',
        descripcion: T('Determinación R² = m·r / (1 + (m − 1)·r) con 1 a 10 medidas por individuo, para r = {r}.', { r: rr.toFixed(3) }),
        series: [{ nombre: 'R²', valores: ms.map(m => m * rr / (1 + (m - 1) * rr)) }] }));
    }
    return out.join('');
  }
  /** GLM: las medias en la escala de la respuesta (con su intervalo y letras, o una línea por nivel del otro factor) y los
      residuos de Pearson contra los valores ajustados. */
  function graficasGlm(r) {
    const out = [], md = r.medias[0], ESC = { probabilidad: T('Probabilidad'), tasa: T('Tasa'), media: T('Media') };
    if (md && md.filas.length) {
      const ytit = ESC[md.escala] + (r.exposicion ? T(' por unidad de {x}', { x: r.exposicion }) : '');
      if (md.dentro) {
        const niv = [...new Set(md.filas.map(x => x.nivel))], por = [...new Set(md.filas.map(x => x.por))];
        const valor = (a, b) => { const x = md.filas.find(z => z.nivel === a && z.por === b); return x ? x.respuesta : NaN; };
        out.push(SP.graficas.lineas({ titulo: T('{e} de «{f}» en cada nivel de «{d}»', { e: ESC[md.escala], f: md.factor, d: md.dentro }), x: { titulo: md.factor, niveles: niv }, y: { titulo: ytit }, leyenda: md.dentro,
          descripcion: T('Medias marginales en la escala de la respuesta de «{f}», una línea por cada nivel de «{d}».', { f: md.factor, d: md.dentro }), series: por.map(b => ({ nombre: b, valores: niv.map(a => valor(a, b)) })) }));
      } else {
        out.push(SP.graficas.medias({ titulo: T('{e} estimada por nivel de «{f}»', { e: ESC[md.escala], f: md.factor }), y: { titulo: ytit },
          descripcion: T('Medias marginales en la escala de la respuesta con su intervalo de confianza; niveles con una letra en común no difieren.'),
          grupos: md.filas.map(x => ({ nombre: x.nivel, media: x.respuesta, inf: x.ic[0], sup: x.ic[1], letra: x.letras })) }));
      }
    }
    const v = r.valores;
    out.push(SP.graficas.dispersion({ titulo: T('Residuos de Pearson contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo de Pearson') },
      descripcion: T('Con la familia adecuada, los residuos de Pearson quedan sin forma y casi todos entre −2 y 2; una nube que se abre indica que la varianza crece más que la de la familia.'),
      puntos: SP.graficas.adelgazar(v.ajustados.map((x, i) => ({ x, y: v.pearson[i], marca: Math.abs(v.pearson[i]) > 3 })), 2500), referencias: [{ y: 0 }, { y: 2, discontinua: true }, { y: -2, discontinua: true }] }));
    return out.join('');
  }
  /** Regresión no lineal: los datos con la curva ajustada (una por grupo) y los residuos. */
  /**
   * Dosis en escala logarítmica (como el eje partido de drc): log10 de cada dosis positiva; la dosis cero va una década
   * debajo de la menor positiva, con la marca «0». La curva se vuelve a trazar con puntos repartidos en el logaritmo.
   */
  function ejeLogaritmico(r) {
    const pos = r.valores.x.filter(x => x > 0);
    if (!r.ejeLog || pos.length < 2) return null;
    const L1 = Math.log10(Math.min(...pos)), L2 = Math.log10(Math.max(...pos)), cero = r.valores.x.some(x => x <= 0), L0 = L1 - 1;
    const tx = x => (x > 0 ? Math.log10(x) : L0), marcas = [];
    const num = k => { const v = 10 ** k; return v >= 1 ? String(Math.round(v)) : v.toFixed(-k); };
    /* con menos de tres potencias de 10 dentro del rango, también los 2 y los 5 de cada década */
    let decadas = 0;
    for (let k = Math.ceil(L1 - 1e-9); k <= L2 + 1e-9; k++) decadas++;
    for (let k = Math.floor(L1); k <= Math.ceil(L2); k++) for (const m of decadas >= 3 ? [1] : [1, 2, 5]) {
      const v = Math.log10(m) + k;
      if (v >= L1 - 1e-9 && v <= L2 + 1e-9) marcas.push({ v, t: m === 1 ? num(k) : String(+(m * 10 ** k).toPrecision(6)) });
    }
    if (cero) marcas.unshift({ v: L0, t: '0' });
    const desde = cero ? L0 : L1, M = SP.nolineal.MODELOS[r.modelo];
    const malla = Array.from({ length: 161 }, (_, k) => 10 ** (desde + (L2 - desde) * k / 160));
    return { tx, marcas, curvas: r.curvas.map(c => ({ x: malla.map(Math.log10), y: malla.map(x => M.f(x, c.parametros)[0]) })) };
  }
  function graficasNoLineal(r) {
    const v = r.valores, G = r.niveles.length, out = [], lg = ejeLogaritmico(r);
    const tx = lg ? lg.tx : (x => x), curvas = lg && r.curvas.every(c => c.parametros) ? lg.curvas : r.curvas;
    out.push(SP.graficas.dispersion({ titulo: T('Curva ajustada: modelo {m}', { m: SP.metodosNoLineal.NOMBRE[r.modelo] }), x: lg ? { titulo: T('{x} (escala logarítmica)', { x: r.x }), marcas: lg.marcas } : { titulo: r.x }, y: { titulo: r.respuesta },
      descripcion: T('Cada punto es una observación; la línea es la curva ajustada{g}.', { g: G ? T(', una por cada nivel de «{f}»', { f: r.grupo }) : '' }) + (lg && v.x.some(x => x <= 0) ? ' ' + T('La dosis cero va a la izquierda, una década debajo de la menor dosis.') : ''),
      puntos: SP.graficas.adelgazar(v.x.map((x, i) => ({ x: tx(x), y: v.y[i], serie: G ? v.g[i] : undefined })), 2500),
      lineas: curvas.map((c, k) => ({ x: c.x, y: c.y, serie: G ? k : undefined })),
      leyenda: G ? { titulo: r.grupo, series: r.niveles } : undefined }));
    out.push(SP.graficas.dispersion({ titulo: T('Residuos contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo') },
      descripcion: T('Sin patrón (una nube pareja alrededor de cero) el modelo describe bien la forma de los datos; una curva en los residuos indica que falta forma.'),
      puntos: SP.graficas.adelgazar(r.ajustados.map((x, i) => ({ x, y: v.residuos[i], marca: Math.abs(v.residuos[i]) > 3 * r.ajuste.sigma })), 2500), referencias: [{ y: 0 }] }));
    return out.join('');
  }
  function graficasPotencia(r) {
    if (r.metodo === 'repeticiones') {
      const it = r.iteraciones;
      return SP.graficas.dispersion({ titulo: T('Repeticiones requeridas contra puestas'), x: { titulo: T('Repeticiones puestas') }, y: { titulo: T('Repeticiones requeridas') }, diagonal: true,
        descripcion: T('Para cada número de repeticiones, las que pide la fórmula de Cochran y Cox con sus gl; la respuesta es la primera que queda por debajo de la diagonal.'),
        puntos: it.map(x => ({ x: x.r, y: x.requeridas, marca: x.r === r.repeticiones })), linea: { x: it.map(x => x.r), y: it.map(x => x.requeridas) } });
    }
    if (!r.curva || !r.curva.n.length) return '';
    return SP.graficas.dispersion({ titulo: T('Potencia según el tamaño de muestra'), x: { titulo: T('Tamaño de muestra') }, y: { titulo: T('Potencia') },
      descripcion: T('La potencia para cada tamaño de muestra con el mismo efecto; la línea vertical es el tamaño calculado o dado y la horizontal, la potencia.'),
      linea: { x: r.curva.n, y: r.curva.potencia }, referencias: [{ y: r.potencia, discontinua: true }], verticales: [{ x: r.n, discontinua: true }] });
  }
  function graficasMultivariado(r) {
    if (r.metodo === 'discriminante') {
      const dos = r.sv.length >= 2, pts = r.puntajes.map((z, i) => ({ x: z[0], y: dos ? z[1] : 0, serie: r.grupoReal[i] }));
      if (!dos) {
        /* una sola función: cada grupo en su renglón */
        return SP.graficas.dispersion({ titulo: T('Puntajes de la función discriminante'), x: { titulo: 'LD1' }, y: { titulo: r.grupo },
          descripcion: T('Cada unidad en la única función discriminante; los grupos bien separados no se enciman.'),
          puntos: r.puntajes.map((z, i) => ({ x: z[0], y: r.grupoReal[i] + 1, serie: r.grupoReal[i] })), leyenda: { titulo: r.grupo, series: r.niveles } });
      }
      return SP.graficas.dispersion({ titulo: T('Unidades en las dos primeras funciones discriminantes'), x: { titulo: T('LD1 ({p} %)', { p: SP.formatos.texto(100 * r.proporcion[0], 'pct') }) },
        y: { titulo: T('LD2 ({p} %)', { p: SP.formatos.texto(100 * r.proporcion[1], 'pct') }) },
        descripcion: T('Cada unidad con su grupo real; los grupos separados en este plano se distinguen bien con las variables elegidas.'),
        puntos: SP.graficas.adelgazar(pts, 2500), leyenda: { titulo: r.grupo, series: r.niveles } });
    }
    const out = [];
    for (const m of r.medias) {
      if (m.niveles.length > 12) continue;
      out.push(SP.graficas.lineas({ titulo: T('Perfil de medias por «{f}» (estandarizadas)', { f: m.factor }), x: { titulo: T('Respuesta'), niveles: r.respuestas }, y: { titulo: T('Media estandarizada') }, leyenda: m.factor,
        descripcion: T('Cada respuesta en unidades de su DE entre las medias, para ver juntas variables de escalas distintas; perfiles paralelos indican un efecto parecido en todas.'),
        series: m.niveles.map((nv, l) => ({ nombre: nv, valores: r.respuestas.map((_, j) => { const col = m.medias.map(f => f[j]), mu = col.reduce((a, b) => a + b, 0) / col.length, sd = Math.sqrt(col.reduce((a, b) => a + (b - mu) ** 2, 0) / Math.max(1, col.length - 1)) || 1; return (m.medias[l][j] - mu) / sd; }) })) }));
    }
    return out.join('');
  }
  function graficasSeries(r) {
    const out = [], tramo = (xs, ys) => { const x = [], y = []; xs.forEach((v, i) => { if (Number.isFinite(ys[i])) { x.push(v); y.push(ys[i]); } }); return { x, y }; };
    if (r.metodo === 'arima') {
      const P = r.pronostico, ultimo = r.tiempos.length - 1, ult = r.x[ultimo];
      const unir = v => (Number.isFinite(ult) ? [r.tiempos[ultimo]].concat(P.tiempos) : P.tiempos), con = v => (Number.isFinite(ult) ? [ult].concat(v) : v);
      out.push(SP.graficas.dispersion({ titulo: T('Serie y pronóstico'), x: { titulo: r.tiempoCol || T('Orden') }, y: { titulo: r.respuesta },
        descripcion: T('La serie observada, el pronóstico del modelo y su intervalo al {k} % (la banda se abre con el horizonte).', { k: Math.round(100 * r.nivel) }),
        /* lo observado, continuo y oscuro; el pronóstico, discontinuo y dorado, como su banda */
        lineas: [Object.assign(tramo(r.tiempos, r.x), { serie: 0 }), { x: unir(), y: con(P.media), serie: 1 }],
        bandas: [{ x: unir(), inf: con(P.inf), sup: con(P.sup) }], leyenda: { series: [r.respuesta, T('Pronóstico')] } }));
      const nr = r.residuos.filter(v => v === v).length, banda = SP.dist.qnorm(0.975, 0, 1, true) / Math.sqrt(nr);
      out.push(SP.graficas.dispersion({ titulo: T('Autocorrelación de los residuos'), x: { titulo: T('Rezago') }, y: { titulo: 'ACF' },
        descripcion: T('Si el modelo captó la estructura, las barras quedan dentro de la banda de ± {b}.', { b: SP.formatos.texto(banda, 'forma') }),
        lineas: r.acfResiduos.slice(1).map((v, k) => ({ x: [k + 1, k + 1], y: [0, v], serie: 0 })), referencias: [{ y: 0 }, { y: banda, discontinua: true }, { y: -banda, discontinua: true }] }));
      return out.join('');
    }
    if (r.metodo === 'autocorrelacion') {
      for (const [nombre, vals, desde] of [[T('Autocorrelación (ACF)'), r.acf, 0], [T('Autocorrelación parcial (PACF)'), r.pacf, 1]]) {
        out.push(SP.graficas.dispersion({ titulo: nombre, x: { titulo: T('Rezago') }, y: { titulo: nombre.split(' (')[0] },
          descripcion: T('Cada barra es la correlación de la serie con ella misma k pasos atrás; las líneas punteadas son la banda de ± {b}.', { b: SP.formatos.texto(r.banda, 'forma') }),
          lineas: vals.map((v, k) => ({ x: [k + desde, k + desde], y: [0, v], serie: 0 })), referencias: [{ y: 0 }, { y: r.banda, discontinua: true }, { y: -r.banda, discontinua: true }] }));
      }
      return out.join('');
    }
    if (r.metodo === 'descomposicion') {
      out.push(SP.graficas.dispersion({ titulo: T('Serie y tendencia'), x: { titulo: r.tiempoCol || T('Orden') }, y: { titulo: r.respuesta },
        descripcion: T('La serie (línea fina) y su tendencia, la media móvil centrada de un ciclo (línea gruesa).'),
        lineas: [Object.assign(tramo(r.tiempos, r.x), { serie: 1 }), Object.assign(tramo(r.tiempos, r.tendencia), { serie: 0 })], leyenda: { series: [T('Tendencia'), r.respuesta] } }));
      out.push(SP.graficas.dispersion({ titulo: T('Componente estacional'), x: { titulo: T('Posición en el ciclo') }, y: { titulo: r.tipoDesc === 'aditiva' ? T('Efecto') : T('Índice') },
        descripcion: r.tipoDesc === 'aditiva' ? T('Lo que cada posición del ciclo suma a la tendencia (suman 0).') : T('Cuánto multiplica cada posición del ciclo a la tendencia (promedian 1).'),
        linea: { x: r.figura.map((_, k) => k + 1), y: r.figura }, puntos: r.figura.map((v, k) => ({ x: k + 1, y: v })), referencias: [{ y: r.tipoDesc === 'aditiva' ? 0 : 1, discontinua: true }] }));
      const res = tramo(r.tiempos, r.residuo);
      out.push(SP.graficas.dispersion({ titulo: T('Residuo'), x: { titulo: r.tiempoCol || T('Orden') }, y: { titulo: T('Residuo') },
        descripcion: T('Lo que queda sin tendencia ni ciclo: debe verse como ruido, sin patrón.'), puntos: res.x.map((x, i) => ({ x, y: res.y[i] })),
        referencias: [{ y: r.tipoDesc === 'aditiva' ? 0 : 1, discontinua: true }] }));
      return out.join('');
    }
    const k = r.x.map((_, i) => i), med = v => { const s = v.slice().sort((p, q) => p - q), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
    const b0 = med(r.x.map((v, i) => v - r.pendiente * i));
    return SP.graficas.dispersion({ titulo: T('Serie con la pendiente de Sen'), x: { titulo: r.tiempoCol || T('Orden') }, y: { titulo: r.respuesta },
      descripcion: T('Cada observación en el tiempo y la recta con la pendiente de Sen (que pasa por la mediana de los datos sin la pendiente).'),
      puntos: r.x.map((v, i) => ({ x: r.tiempos[i], y: v })), linea: { x: r.tiempos, y: k.map(i => b0 + r.pendiente * i) } });
  }
  function graficasSupervivencia(r) {
    if (r.metodo === 'kaplan-meier') {
      const lineas = [], puntos = [], bandas = [], escalon = (ts, vs) => { const x = [0], y = [1]; let ant = 1; ts.forEach((t, i) => { x.push(t, t); y.push(ant, vs[i]); ant = vs[i]; }); return { x, y }; };
      r.grupos.forEach((g, k) => {
        const c = g.curva;
        lineas.push(Object.assign(escalon(c.tiempo, c.S), { serie: k }));
        c.tiempo.forEach((t, i) => { if (c.censuras[i] > 0) puntos.push({ x: t, y: c.S[i], serie: k }); });
        if (r.grupos.length === 1) {
          const lim = v => v.map((x, i) => (Number.isFinite(x) ? x : c.S[i])), a = escalon(c.tiempo, lim(c.inf)), b = escalon(c.tiempo, lim(c.sup));
          bandas.push({ x: a.x, inf: a.y, sup: b.y });
        }
      });
      return SP.graficas.dispersion({ titulo: T('Curvas de supervivencia (Kaplan-Meier)'), x: { titulo: r.tiempo }, y: { titulo: T('Proporción sin el evento') }, lineas, puntos, bandas,
        referencias: [{ y: 0.5, discontinua: true }], leyenda: r.grupo ? { titulo: r.grupo, series: r.grupos.map(g => g.nombre) } : undefined,
        descripcion: r.grupos.length === 1 ? T('La proporción que sigue sin el evento en cada tiempo, con su intervalo; las marcas son unidades censuradas y la línea punteada, la mitad (la mediana).')
          : T('La proporción que sigue sin el evento en cada grupo; las marcas son unidades censuradas y la línea punteada, la mitad (la mediana).') });
    }
    return SP.graficas.medias({ titulo: T('Razones de riesgo (HR) con su intervalo'), y: { titulo: T('Razón de riesgo (escala logarítmica)') }, log: true,
      descripcion: T('Cada término con su HR e intervalo; la línea es HR = 1 (sin efecto). A la derecha de 1 (arriba), el evento llega antes.'),
      grupos: r.nombres.map((n, j) => ({ nombre: n, media: r.hr[j], inf: r.hr_inf[j], sup: r.hr_sup[j], marca: r.p[j] < 0.05 })), referencias: [{ y: 1, discontinua: true }] });
  }
  function graficasMuestreo(r) {
    if (r.metodo === 'tamano-muestra') {
      const es = [], ns = [];
      for (let k = 0; k <= 40; k++) {
        const e = r.error * (0.5 + 1.5 * k / 40);
        es.push(e);
        ns.push(SP.muestreo.tamano({ tipo: r.que, de: r.de, cv: r.cv, p: r.p, error: e, relativo: r.escala === 'relativo', N: r.N, confianza: r.confianza }).n);
      }
      return SP.graficas.dispersion({ titulo: T('Tamaño de muestra según el error aceptado'), x: { titulo: T('Error máximo (±)') }, y: { titulo: T('Tamaño de muestra') },
        descripcion: T('Las unidades que hacen falta para cada error, con la misma variación y confianza; la línea vertical es el error pedido. Reducir el error a la mitad cuadruplica la muestra (si la población es grande).'),
        linea: { x: es, y: ns }, referencias: [{ y: r.n, discontinua: true }], verticales: [{ x: r.error, discontinua: true }] });
    }
    const qt = (g, conf) => SP.dist.qt(1 - (1 - conf) / 2, g, true);
    if (r.metodo === 'muestreo-simple') {
      const tope = r.N ? Math.min(r.N, Math.max(4 * r.n, 20)) : Math.max(4 * r.n, 20), paso = Math.max(1, Math.ceil((tope - 2) / 80)), ns = [], semi = [];
      for (let k = 2; k <= tope; k += paso) { ns.push(k); semi.push(qt(k - 1, r.confianza) * Math.sqrt((1 - (r.N ? k / r.N : 0)) * r.varianza / k)); }
      return SP.graficas.dispersion({ titulo: T('Precisión según el tamaño de muestra'), x: { titulo: T('Tamaño de muestra (n)') }, y: { titulo: T('Semiamplitud del intervalo (±)') },
        descripcion: T('El ± del intervalo de confianza para cada n, con la varianza de esta muestra; la línea vertical es la muestra tomada.'),
        linea: { x: ns, y: semi }, verticales: [{ x: r.n, discontinua: true }] });
    }
    return SP.graficas.medias({ titulo: T('Media de cada estrato'), y: { titulo: r.respuesta },
      descripcion: T('La media de cada estrato con su intervalo de confianza; la línea es la media estratificada, en la que cada estrato pesa según su tamaño en la población.'),
      grupos: r.estratos.map(x => { const ee = Math.sqrt((1 - x.f) * x.varianza / x.nh), t = qt(x.nh - 1, r.confianza); return { nombre: x.estrato, media: x.media, inf: x.media - t * ee, sup: x.media + t * ee }; }),
      referencias: [{ y: r.media, discontinua: true }] });
  }
  function graficasMultiambiente(r) {
    const Gn = r.genotipos, An = r.ambientes_nombre, out = [], f1 = v => SP.formatos.texto(v, 'forma2');
    if (r.metodo === 'ensayos-multiambiente' && Gn.length <= 12) {
      const orden = An.map((_, j) => j).sort((a, b) => r.medias_ambiente[a] - r.medias_ambiente[b]);
      out.push(SP.graficas.lineas({ titulo: T('Cada genotipo en los ambientes'), x: { titulo: T('Ambientes, de menor a mayor media'), niveles: orden.map(j => An[j]) }, y: { titulo: r.respuesta }, leyenda: r.genotipo,
        descripcion: T('Medias de cada genotipo en los ambientes ordenados por su media; las líneas que se cruzan muestran la interacción genotipo × ambiente.'),
        series: Gn.map((g, i) => ({ nombre: g, valores: orden.map(j => r.tabla[i][j]) })) }));
    }
    if (r.metodo === 'estabilidad') {
      out.push(SP.graficas.biplot({ titulo: T('Media contra pendiente (Eberhart y Russell)'), x: { titulo: T('Media de «{y}»', { y: r.respuesta }) }, y: { titulo: T('Pendiente b') },
        descripcion: T('Cada genotipo con su media y su pendiente sobre el índice ambiental; la línea horizontal es b = 1 (adaptación general) y la vertical, la media general.'),
        genotipos: Gn.map((g, i) => ({ x: r.medias[i], y: r.regresion.b[i], nombre: g })), referencias: [{ x: r.media_general }, { y: 1 }] }));
      if (Gn.length <= 10) out.push(SP.graficas.dispersion({ titulo: T('Regresión de cada genotipo sobre el índice ambiental'), x: { titulo: T('Índice ambiental') }, y: { titulo: r.respuesta },
        descripcion: T('Medias de cada genotipo en cada ambiente contra el índice del ambiente, con su recta de regresión.'),
        puntos: Gn.flatMap((_, i) => r.indice.map((x, j) => ({ x, y: r.tabla[i][j], serie: i }))),
        lineas: Gn.map((_, i) => { const lo = Math.min(...r.indice), hi = Math.max(...r.indice); return { x: [lo, hi], y: [lo, hi].map(v => r.medias[i] + r.regresion.b[i] * v), serie: i }; }),
        leyenda: { titulo: r.genotipo, series: Gn } }));
    }
    if (r.metodo === 'ammi') {
      const X = r.ammi, ej = X.ejes;
      out.push(SP.graficas.biplot({ titulo: T('AMMI1: media contra EJE1'), x: { titulo: T('Media de «{y}»', { y: r.respuesta }) }, y: { titulo: T('EJE1 ({p} %)', { p: f1(ej.pct[0]) }) },
        descripcion: T('Genotipos y ambientes con su media y su puntaje en el primer eje de la interacción; cerca de cero, más estable.'),
        genotipos: Gn.map((g, i) => ({ x: r.medias[i], y: X.genotipos[i][0], nombre: g })), ambientes: An.map((a, j) => ({ x: r.medias_ambiente[j], y: X.ambientes[j][0], nombre: a })),
        referencias: [{ x: r.media_general }, { y: 0 }], leyenda: [T('Genotipos'), T('Ambientes')] }));
      if (X.genotipos[0].length >= 2) out.push(SP.graficas.biplot({ titulo: T('AMMI2: EJE1 contra EJE2'), x: { titulo: T('EJE1 ({p} %)', { p: f1(ej.pct[0]) }) }, y: { titulo: T('EJE2 ({p} %)', { p: f1(ej.pct[1]) }) },
        descripcion: T('Los dos primeros ejes de la interacción; un genotipo y un ambiente en la misma dirección interactúan a favor.'),
        genotipos: Gn.map((g, i) => ({ x: X.genotipos[i][0], y: X.genotipos[i][1], nombre: g })), ambientes: An.map((a, j) => ({ x: X.ambientes[j][0], y: X.ambientes[j][1], nombre: a })),
        vectores: true, iguales: true, leyenda: [T('Genotipos'), T('Ambientes')] }));
      if (r.waas) {
        const Wa = r.waas, mW = Wa.genotipos.reduce((a, b) => a + b, 0) / Gn.length;
        out.push(SP.graficas.biplot({ titulo: T('Respuesta contra estabilidad (WAAS)'), x: { titulo: T('Media de «{y}»', { y: r.respuesta }) }, y: { titulo: T('WAAS ({k} {e})', { k: Wa.ejes, e: Wa.ejes === 1 ? T('eje') : T('ejes') }) },
          descripcion: T('Cada genotipo con su media y su WAAS; abajo, más estable. Las líneas son la media general y el WAAS medio: el cuadrante de {c} junta respuesta y estabilidad.', { c: r.objetivo === 'minimo' ? T('abajo a la izquierda') : T('abajo a la derecha') }),
          genotipos: Gn.map((g, i) => ({ x: r.medias[i], y: Wa.genotipos[i], nombre: g })), referencias: [{ x: r.media_general }, { y: mW }] }));
      }
    }
    if (r.metodo === 'dos-etapas') {
      const X = r.estimados, z = SP.dist.qnorm(0.975), s = r.objetivo === 'minimo' ? -1 : 1, orden = Gn.map((_, i) => i).sort((a, b) => s * (X.media[b] - X.media[a]));
      out.push(SP.graficas.medias({ titulo: T('Medias ajustadas en el conjunto de ambientes'), y: { titulo: r.respuesta },
        descripcion: T('Media de cada genotipo en el análisis en dos etapas, con su intervalo de 95 % (± 1.96 EE).'),
        grupos: orden.map(i => ({ nombre: Gn[i], media: X.media[i], inf: X.media[i] - z * X.ee[i], sup: X.media[i] + z * X.ee[i] })) }));
    }
    if (r.metodo === 'gge') {
      const Q = r.gge, ejes = { x: { titulo: T('EJE1 ({p} %)', { p: f1(Q.pct[0]) }) }, y: { titulo: T('EJE2 ({p} %)', { p: f1(Q.pct[1]) }) } };
      const gs = Gn.map((g, i) => ({ x: Q.genotipos[i][0], y: Q.genotipos[i][1], nombre: g })), as = An.map((a, j) => ({ x: Q.ambientes[j][0], y: Q.ambientes[j][1], nombre: a }));
      out.push(SP.graficas.biplot(Object.assign({ titulo: T('Quién ganó dónde'), descripcion: T('Polígono de los genotipos más alejados; los rayos dividen los ambientes en sectores y el vértice de cada sector es el ganador ahí.'),
        genotipos: gs, ambientes: as, poligono: Q.indices_vertices, rayos: true, iguales: true, leyenda: [T('Genotipos'), T('Ambientes')] }, ejes)));
      out.push(SP.graficas.biplot(Object.assign({ titulo: T('Media contra estabilidad'), descripcion: T('El eje del ambiente promedio (la flecha señala la mejor respuesta): la proyección de cada genotipo sobre él es su desempeño y la distancia al eje, su inestabilidad.'),
        genotipos: gs, ambientes: as, eje: Q.media_ambiente, iguales: true, leyenda: [T('Genotipos'), T('Ambientes')] }, ejes)));
      if (Q.genotipo_ideal) {
        const anillos = (d, n) => { const mx = Math.max(...d); return Array.from({ length: n }, (_, k) => mx * (k + 1) / n); };
        out.push(SP.graficas.biplot(Object.assign({ titulo: T('Genotipos respecto del ideal'), descripcion: T('El círculo dorado es el genotipo ideal (alto y estable), sobre el eje del ambiente promedio; los anillos marcan la distancia a él: más adentro, mejor.'),
          genotipos: gs, eje: Q.media_ambiente, ideal: { x: Q.genotipo_ideal[0], y: Q.genotipo_ideal[1], radios: anillos(Q.distancia_genotipos, 4) }, iguales: true }, ejes)));
        out.push(SP.graficas.biplot(Object.assign({ titulo: T('Ambientes respecto del ideal'), descripcion: T('El ambiente ideal discrimina mucho entre genotipos y representa a los demás; los anillos marcan la distancia a él.'),
          ambientes: as, vectores: true, eje: Q.media_ambiente, ideal: { x: Q.ambiente_ideal[0], y: Q.ambiente_ideal[1], radios: anillos(Q.distancia_ambientes, 4) }, iguales: true }, ejes)));
      }
      if (Q.comparacion) {
        const ia = Gn.indexOf(Q.comparacion.a), ib = Gn.indexOf(Q.comparacion.b);
        out.push(SP.graficas.biplot(Object.assign({ titulo: T('{a} contra {b}', { a: Q.comparacion.a, b: Q.comparacion.b }),
          descripcion: T('La recta une a los dos genotipos; la perpendicular por el origen divide a los ambientes: del lado de cada genotipo, ese genotipo es mejor según el biplot.'),
          genotipos: gs, ambientes: as, par: [ia, ib], vectores: true, iguales: true, leyenda: [T('Genotipos'), T('Ambientes')] }, ejes)));
      }
    }
    return out.join('');
  }
  function graficasSuperficie(r) {
    const F = r.factores, k = F.length, C = r.codificacion, out = [], E = r.estacionario, dentro = E && E.distancia <= r.radio + 1e-9;
    const nat = (h, z) => C.centro[h] + C.paso[h] * z, cod = (h, x) => (x - C.centro[h]) / C.paso[h];
    const zr = F.map((_, j) => Math.max(...r.valores.x[j].map(v => Math.abs(cod(j, v)))));
    const fijo = F.map((_, j) => (dentro ? E.codificado[j] : 0));
    const marcaE = { maximo: T('máximo'), minimo: T('mínimo'), silla: T('silla') };
    const pares = [];
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) pares.push([i, j]);
    for (const [i, j] of pares.slice(0, 6)) {
      const otros = F.map((f, h) => (h === i || h === j ? '' : f + ' = ' + SP.formatos.texto(nat(h, fijo[h]), 'sig'))).filter(Boolean);
      const xr = [nat(i, -zr[i]), nat(i, zr[i])], yr = [nat(j, -zr[j]), nat(j, zr[j])], adentro = p => p[i] >= xr[0] && p[i] <= xr[1] && p[j] >= yr[0] && p[j] <= yr[1];
      const camino = r.cresta.natural.filter(adentro);
      out.push(SP.graficas.contorno({
        titulo: T('Contornos de «{y}»: {a} × {b}', { y: r.respuesta, a: F[i], b: F[j] }),
        descripcion: T('Curvas de nivel de «{y}» estimada en {a} y {b}{o}; los puntos son los del diseño{e}{c}.', { y: r.respuesta, a: F[i], b: F[j],
          o: otros.length ? T(', con {l}', { l: otros.join(', ') }) : '', e: E && dentro ? T(', el rombo es el punto estacionario') : '', c: k === 2 && camino.length > 1 ? T(' y la línea discontinua, la cresta') : '' }),
        x: { titulo: F[i], rango: xr }, y: { titulo: F[j], rango: yr },
        z: (a, b) => { const z = fijo.slice(); z[i] = cod(i, a); z[j] = cod(j, b); return SP.superficie.predecir(r, z); },
        puntos: r.valores.x[i].map((v, n) => ({ x: v, y: r.valores.x[j][n] })),
        marca: E && dentro ? { x: E.natural[i], y: E.natural[j], etiqueta: marcaE[E.naturaleza] } : undefined,
        camino: k === 2 && camino.length > 1 ? { x: camino.map(p => p[i]), y: camino.map(p => p[j]) } : undefined,
      }));
    }
    if (r.orden !== 'primer') out.push(superficie3dDe(r));
    const Cr = r.cresta, qt = SP.dist.qt(1 - (1 - (r.nivel || 0.95)) / 2, r.ajuste.gl);
    out.push(SP.graficas.dispersion({ titulo: r.orden === 'primer' ? T('Respuesta estimada sobre el camino de {s}', { s: r.objetivo === 'minimo' ? T('descenso') : T('ascenso') }) : T('Respuesta estimada sobre la cresta'),
      x: { titulo: T('Distancia al centro (unidades codificadas)') }, y: { titulo: r.respuesta },
      descripcion: T('Predicción con su intervalo de confianza de {c} % a cada distancia del centro del diseño; la línea vertical marca hasta dónde llegan los datos.', { c: Math.round(100 * (r.nivel || 0.95)) }),
      linea: { x: Cr.distancia, y: Cr.prediccion }, banda: { x: Cr.distancia, inf: Cr.prediccion.map((v, i) => v - qt * Cr.ee[i]), sup: Cr.prediccion.map((v, i) => v + qt * Cr.ee[i]) },
      verticales: [{ x: r.radio, discontinua: true }] }));
    out.push(SP.graficas.dispersion({ titulo: T('Residuos contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo') },
      descripcion: T('Sin patrón (una nube pareja alrededor de cero) el modelo describe bien la superficie.'),
      puntos: r.ajustados.map((x, i) => ({ x, y: r.residuos[i], marca: Math.abs(r.residuos[i]) > 3 * r.ajuste.sigma })), referencias: [{ y: 0 }] }));
    return out.join('');
  }
  /** La superficie en 3D de los dos primeros factores (los demás en el punto estacionario si está dentro, si no en el centro). */
  function superficie3dDe(r) {
    const F = r.factores, k = F.length, C = r.codificacion, E = r.estacionario, dentro = E && E.distancia <= r.radio + 1e-9;
    const cod = (h, x) => (x - C.centro[h]) / C.paso[h], nat = (h, z) => C.centro[h] + C.paso[h] * z;
    const zr = [0, 1].map(j => Math.max(...r.valores.x[j].map(v => Math.abs(cod(j, v))))), fijo = F.map((_, j) => (dentro ? E.codificado[j] : 0)), n = 25;
    const xs = Array.from({ length: n }, (_, a) => nat(0, -zr[0] + 2 * zr[0] * a / (n - 1))), ys = Array.from({ length: n }, (_, b) => nat(1, -zr[1] + 2 * zr[1] * b / (n - 1)));
    const Z = xs.map(x => ys.map(y => { const z = fijo.slice(); z[0] = cod(0, x); z[1] = cod(1, y); return SP.superficie.predecir(r, z); }));
    const otros = F.slice(2).map((f, h) => f + ' = ' + SP.formatos.texto(nat(h + 2, fijo[h + 2]), 'sig'));
    return SP.graficas.superficie3d({ titulo: T('Superficie en 3D de «{y}»: {a} × {b}', { y: r.respuesta, a: F[0], b: F[1] }),
      descripcion: T('La respuesta estimada sobre {a} y {b}{o}{p}; los botones giran la vista.', { a: F[0], b: F[1], o: otros.length ? T(', con {l}', { l: otros.join(', ') }) : '', p: k === 2 ? T('; los puntos son las observaciones') : '' }),
      x: { titulo: F[0], valores: xs }, y: { titulo: F[1], valores: ys }, z: { titulo: r.respuesta, valores: Z }, azimut: estado.vista3d.azimut, elevacion: estado.vista3d.elevacion,
      puntos: k === 2 ? r.valores.y.map((v, i) => [r.valores.x[0][i], r.valores.x[1][i], v]) : [] });
  }
  /** Generador de diseños: los puntos en las dos primeras coordenadas codificadas, o el triángulo de una mezcla de tres. */
  function graficasDiseno(r) {
    if ((r.clase === 'latice' || r.clase === 'centroide') && r.k === 3) return SP.graficas.ternaria({ titulo: T('Mezclas del diseño'), descripcion: T('Cada punto es una mezcla del diseño en el triángulo de los tres componentes.'),
      vertices: r.nombres, f: () => 0, puntos: r.codificado, divisiones: 2 });
    const pts = r.codificado.map((z, i) => ({ x: z[0], y: z[1], serie: r.bloque[i] > 1 ? 1 : 0 }));
    return SP.graficas.dispersion({ titulo: T('Corridas del diseño: {a} × {b} (codificados)', { a: r.nombres[0], b: r.nombres[1] }), x: { titulo: r.nombres[0] }, y: { titulo: r.nombres[1] }, diagonal: false,
      descripcion: T('Las corridas en los dos primeros factores codificados (los centros y los puntos repetidos se enciman).'), puntos: pts,
      leyenda: new Set(r.bloque).size > 1 ? { titulo: T('Bloque'), series: ['1', '2'] } : undefined });
  }
  /** Mezclas: el triángulo del modelo (con tres componentes) y la traza de Cox. */
  function graficasMezclas(r) {
    const q = r.componentes.length, out = [], f = x => r.terminos.reduce((s, t, j) => s + r.coeficientes.estimado[j] * t.reduce((p, i) => p * x[i], 1), 0);
    if (q === 3) out.push(SP.graficas.ternaria({ titulo: T('«{y}» en el triángulo de la mezcla', { y: r.respuesta }), descripcion: T('Respuesta estimada por el modelo en cada mezcla (más oscuro, mayor); los puntos son las mezclas del ensayo y el círculo, la mejor.'),
      vertices: r.componentes, f: (a, b, c) => f([a, b, c]), puntos: r.proporciones, marca: { x: r.optimo.mezcla, etiqueta: r.objetivo === 'minimo' ? T('mínimo') : T('máximo') } }));
    const ts = Array.from({ length: 41 }, (_, i) => i / 40);
    out.push(SP.graficas.dispersion({ titulo: T('Traza de Cox'), x: { titulo: T('Proporción del componente') }, y: { titulo: r.respuesta },
      descripcion: T('Cada línea mueve un componente desde 0 hasta 1 y reparte el resto por igual entre los demás (la dirección de Cox desde el centroide): la pendiente muestra cuánto pesa cada componente.'),
      lineas: r.componentes.map((_, i) => ({ x: ts, y: ts.map(t => f(r.componentes.map((__, h) => (h === i ? t : (1 - t) / (q - 1))))), serie: i })),
      verticales: [{ x: 1 / q, discontinua: true }], leyenda: { titulo: T('Componente'), series: r.componentes } }));
    return out.join('');
  }
  /** Deseabilidad: contornos de D en los dos primeros factores (los demás en el óptimo). */
  function graficasDeseabilidad(r) {
    const C = r.codificacion, O = r.optimo, F = r.factores, cod = (h, x) => (x - C.centro[h]) / C.paso[h];
    const D = z => SP.superficie.deseabilidadGlobal(r.modelos.map((m, i) => SP.superficie.deseabilidadUna(SP.superficie.predecir(m, z), Object.assign({ meta: r.metas[i] }, r.limites[i]))), r.limites.map(l => l.r));
    const rango = h => { const zs = r.puntosCodificados ? r.puntosCodificados[h] : [-1, 1]; return [C.centro[h] + C.paso[h] * Math.min(...zs), C.centro[h] + C.paso[h] * Math.max(...zs)]; };
    return SP.graficas.contorno({ titulo: T('Deseabilidad global: {a} × {b}', { a: F[0], b: F[1] }), descripcion: T('Curvas de nivel de D en {a} y {b}{o}; el rombo es la combinación más deseable.', { a: F[0], b: F[1],
      o: F.length > 2 ? T(', con los demás factores en su mejor valor') : '' }), x: { titulo: F[0], rango: rango(0) }, y: { titulo: F[1], rango: rango(1) },
      z: (a, b) => { const z = O.codificado.slice(); z[0] = cod(0, a); z[1] = cod(1, b); return D(z); }, marca: { x: O.natural[0], y: O.natural[1], etiqueta: 'D = ' + O.D.toFixed(2) } });
  }
  function graficasRepetidas(r) {
    let g0 = '';
    const md = (r.medias || [])[0];
    if (md && md.filas.length) {
      if (md.dentro === r.tiempo) {
        const fechas = [...new Set(md.filas.map(f => f.por))], niv = [...new Set(md.filas.map(f => f.nivel))];
        const valor = (n, t) => { const x = md.filas.find(f => f.nivel === n && f.por === t); return x ? x.media : NaN; };
        g0 = SP.graficas.lineas({ titulo: T('Perfil de «{v}» en el tiempo', { v: r.respuesta }), x: { titulo: r.tiempo, niveles: fechas }, y: { titulo: r.respuesta }, leyenda: md.factor,
          descripcion: T('Medias marginales estimadas de «{v}» en cada {t}, una línea por cada nivel de {f}.', { v: r.respuesta, t: r.tiempo, f: md.factor }), series: niv.map(n => ({ nombre: n, valores: fechas.map(t => valor(n, t)) })) });
      } else if (!md.dentro && md.filas.length <= 40) {
        g0 = SP.graficas.medias({ titulo: T('Medias marginales de «{f}»', { f: md.factor }), y: { titulo: r.respuesta },
          descripcion: T('Medias marginales estimadas con su intervalo de confianza; la misma letra indica que no difieren.'),
          grupos: md.filas.map(x => ({ nombre: x.nivel, media: x.media, inf: x.ic[0], sup: x.ic[1], letra: x.letras })) });
      }
    }
    return g0 + graficasMixto(Object.assign({}, r, { medias: [] }));
  }
  /** Residuos del modelo mixto: contra los ajustados y su Q-Q. */
  function graficasMixto(r) {
    const res = r.valores.residuos, aj = r.valores.ajustados, n = res.length;
    if (!n) return '';
    let g0 = '';
    const md = (r.medias || [])[0];
    if (md && md.filas.length) {
      if (md.dentro) {
        const nivA = [...new Set(md.filas.map(f => f.nivel))], nivB = [...new Set(md.filas.map(f => f.por))];
        const valor = (a, b) => { const x = md.filas.find(f => f.nivel === a && f.por === b); return x ? x.media : NaN; };
        g0 = SP.graficas.lineas({ titulo: T('Medias de {a} dentro de {b}', { a: md.factor, b: md.dentro }), x: { titulo: md.factor, niveles: nivA }, y: { titulo: r.respuesta }, leyenda: md.dentro,
          descripcion: T('Medias marginales estimadas de «{v}» para cada {a}, una línea por cada {b}.', { v: r.respuesta, a: md.factor, b: md.dentro }), series: nivB.map(b => ({ nombre: b, valores: nivA.map(a => valor(a, b)) })) });
      } else if (md.filas.length <= 40) {
        g0 = SP.graficas.medias({ titulo: T('Medias marginales de «{f}»', { f: md.factor }), y: { titulo: r.respuesta },
          descripcion: T('Medias marginales estimadas del modelo mixto con su intervalo de confianza de {c} %; la misma letra indica que no difieren ({a}).', { c: Math.round(100 * r.nivel), a: md.ajuste }),
          grupos: md.filas.map(x => ({ nombre: x.nivel, media: x.media, inf: x.ic[0], sup: x.ic[1], letra: x.letras })) });
      }
    }
    const g1 = SP.graficas.dispersion({ titulo: T('Residuos contra ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo') }, referencias: [{ y: 0 }],
      descripcion: T('Residuos condicionales (con los efectos aleatorios) contra los valores ajustados: sin patrón si el modelo es adecuado.'),
      puntos: SP.graficas.adelgazar(aj.map((x, i) => ({ x, y: res[i] })).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)), 2500) });
    const ord = res.filter(Number.isFinite).slice().sort((a, b) => a - b), m = ord.length, a = m <= 10 ? 3 / 8 : 0.5;
    const g2 = SP.graficas.dispersion({ titulo: T('Gráfico Q-Q de los residuos'), x: { titulo: T('Cuantil normal teórico') }, y: { titulo: T('Residuo') },
      descripcion: T('Residuos ordenados contra los cuantiles de la normal: cerca de una recta si son normales.'),
      puntos: SP.graficas.adelgazar(ord.map((y, i) => ({ x: SP.dist.qnorm((i + 1 - a) / (m + 1 - 2 * a)), y })), 2500) });
    return g0 + g1 + g2;
  }
  function graficaMetodo(r, op) {
    op = op || {};
    if (r.tipo === 'mixto') return graficasMixto(r);
    if (r.tipo === 'repetidas') return graficasRepetidas(r);
    if (r.tipo === 'componentes' || r.tipo === 'heredabilidad' || r.tipo === 'repetibilidad') return graficasGeneticos(r);
    if (r.tipo === 'glm' || r.tipo === 'glmm') return graficasGlm(r);
    if (r.tipo === 'nolineal') return graficasNoLineal(r);
    if (r.tipo === 'superficie') return graficasSuperficie(r);
    if (r.tipo === 'diseno-superficie') return graficasDiseno(r);
    if (r.tipo === 'mezclas') return graficasMezclas(r);
    if (r.tipo === 'deseabilidad') return graficasDeseabilidad(r);
    if (r.tipo === 'multiambiente') return graficasMultiambiente(r);
    if (r.tipo === 'potencia') return graficasPotencia(r);
    if (r.tipo === 'muestreo') return graficasMuestreo(r);
    if (r.tipo === 'supervivencia') return graficasSupervivencia(r);
    if (r.tipo === 'series') return graficasSeries(r);
    if (r.tipo === 'multivariado') return graficasMultivariado(r);
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
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('calculado en {ms} ms', { ms: Math.max(1, Math.round(ms)) }))}</span>${botonFicha()}${botonReporte()}</div>` +
      `<div class="callout exp-conclusion">${rep.conclusiones.map(t => `<p>${esc(t)}</p>`).join('')}</div>` +
      (global ? semaforoHTML(sem, global, ({ verde: T('Los supuestos de la prueba se cumplen'), ambar: T('Hay supuestos que revisar'), rojo: T('Hay supuestos que no se cumplen'), gris: T('Sin datos suficientes') }[global]), T('Semáforo de los supuestos')) : '') +
      graficasHTML(graficaMetodo(r)) +
      (r.diseno && !r.tipo && r.factores && r.factores.length ? `<div class="btn-row exp-acciones"><button type="button" class="btn btn-primary btn-sm" data-accion="comparar">${esc(T('Comparar las medias de este diseño'))}</button></div>` : '') +
      botonesModelo(r) +
      rep.cuadros.map((q, i) => SP.cuadros.html(q, { numero: i + 1 }) + copiarHTML(i)).join('') +
      codigoHTML(codigo) +
      (SP.app.suite ? SP.app.suite.franjaMetodo(estado.metodo) : '');
  }
  /** Tras la selección, botones que llevan el modelo elegido a la regresión lineal con todo su diagnóstico. */
  function botonesModelo(r) {
    if (r.tipo === 'superficie' && r.orden !== 'primer') {
      const b = (dir, et, txt) => '<button type="button" class="btn btn-secondary btn-sm" data-accion="girar3d" data-dir="' + dir + '" aria-label="' + esc(txt) + '">' + et + '</button>';
      return '<div class="btn-row exp-acciones"><span class="small muted">' + esc(T('Girar la superficie en 3D:')) + '</span>' + b('izq', '⟲', T('Girar a la izquierda')) + b('der', '⟳', T('Girar a la derecha')) + b('arriba', '↑', T('Ver desde más arriba')) + b('abajo', '↓', T('Ver desde más abajo')) + '</div>';
    }
    if (r.tipo === 'diseno-superficie') return '<div class="btn-row exp-acciones"><button type="button" class="btn btn-primary btn-sm" data-accion="abrir-diseno">' + esc(T('Abrir el diseño en Datos (con una columna para la respuesta)')) + '</button></div>';
    if (r.tipo === 'multivariado') {
      /* el ACP y los conglomerados están en las otras apps de la suite: se les prepara el CSV */
      const b = (app, texto) => '<button type="button" class="btn btn-secondary btn-sm" data-accion="csv-suite" data-app="' + app + '">' + esc(texto) + '</button>';
      return '<div class="btn-row exp-acciones">' + b('PCAPro', T('CSV para PCAPro (componentes principales)')) + b('ClusteringPro', T('CSV para ClusteringPro (conglomerados)')) + '</div>' +
        '<p class="small muted">' + esc(T('Baja las variables de este análisis con su grupo para abrirlas en la otra app (Datos → Importar):')) + ' <a href="https://luisangelbg.github.io/PCAPro/" target="_blank" rel="noopener">PCAPro</a> · <a href="https://luisangelbg.github.io/ClusteringPro/" target="_blank" rel="noopener">ClusteringPro</a></p>';
    }
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
  const graficasHTML = g => (g ? (SP.temasGraficas ? SP.temasGraficas.selector() : '') + `<div class="ana-graficas${(g.match(/<figure/g) || []).length > 1 ? '' : ' ana-una'}">${g}</div>` : '');

  function calcular() {
    estado.pendiente = false;
    const datos = columnas();
    if (datos) estado.sinDatos = false;
    const c = datos || (estado.sinDatos ? SIN_DATOS : null);
    if (c && c.sinDatos) estado.modo = 'catalogo';
    $('#anaVacio').hidden = !!c;
    $('#anaTrabajo').hidden = !c;
    if (!c) return;
    document.querySelectorAll('#anaModos [data-modo]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modo === estado.modo)));
    $('#anaCatalogoVista').hidden = estado.modo !== 'catalogo';
    $('#anaAsistente').hidden = estado.modo !== 'asistente';
    $('#anaConstructor').hidden = estado.modo !== 'constructor';
    if (estado.modo !== 'catalogo') { const p = estado.pintores[estado.modo]; if (p) p(c); return; }
    catalogo(c);
    /* con otra tabla, los papeles vuelven a proponerse; con ediciones de la misma, se respetan */
    if (SP.app.datos.hoja !== estado.hoja) { estado.hoja = SP.app.datos.hoja; estado.sup._iniciado = estado.dos._iniciado = estado.rangos._iniciado = estado.dis._iniciado = estado.reg._iniciado = estado.anc._iniciado = estado.cor._iniciado = estado.cont._iniciado = estado.ml._iniciado = estado.mx._iniciado = estado.mxd._iniciado = estado.rep._iniciado = estado.gen._iniciado = estado.glm._iniciado = estado.nl._iniciado = estado.srf._iniciado = estado.ma._iniciado = estado.mue._iniciado = estado.sv._iniciado = estado.ts._iniciado = estado.mv._iniciado = estado.mez._iniciado = estado.des._iniciado = false; }
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
      estado.ultimoResultado = resultado;
    };
    const fallar = err => {
      if (turno !== estado.turno) return;
      if (!(err instanceof SP.ErrorSP) && err.arreglo === undefined) console.error(err);
      $('#anaResultado').classList.remove('calculando');
      $('#anaResultado').innerHTML = `<div class="msg msg-error"><strong>${esc(err.message)}</strong>${err.arreglo ? `<span class="msg-fix">${esc(err.arreglo)}</span>` : ''}</div>`;
    };
    if (ficha.motor === 'r') { correrR(id, c, e, opciones, turno, mostrar, fallar); return; }
    const correr = () => {
      try {
        const { resultado, ms } = SP.ejecutar(id, c.t, e, opciones);
        $('#anaResultado').classList.remove('calculando');
        mostrar(resultado, ms);
      } catch (err) { fallar(err); }
    };
    /* con tablas grandes (hasta ~2 s con 100 000 filas y muchos tratamientos), primero se avisa y se deja pintar.
       Un hilo de trabajo resultó más lento: arranca sin el código optimizado y con menos prioridad (Hito 1.12). */
    /* el REML de los métodos genéticos itera: con más de 1500 filas también se avisa antes */
    if (c.t && (c.t.n >= 20000 || (GENETICOS.includes(id) && c.t.n >= 1500))) {
      const r0 = $('#anaResultado');
      r0.classList.add('calculando');
      if (!r0.querySelector('.ana-espera')) r0.insertAdjacentHTML('afterbegin', `<p class="ana-espera small" role="status">${esc(T('Calculando con {n} filas…', { n: c.t.n.toLocaleString('es-MX') }))}</p>`);
      setTimeout(() => { if (turno === estado.turno) correr(); }, 30);
    } else correr();
  }
  /** Un método del motor R: la primera vez pide permiso para descargarlo; luego muestra cada paso y se puede cancelar. */
  const motorAceptado = () => { if (estado.motorAceptado) return true; try { return localStorage.getItem(MOTOR_USADO) === '1'; } catch (e) { return false; } };
  function correrR(id, c, e, opciones, turno, mostrar, fallar) {
    const r0 = $('#anaResultado'), st = SP.motorR.estado();
    if (!motorAceptado() && st.fase !== 'listo' && st.fase !== 'ocupado') {
      r0.classList.remove('calculando');
      r0.innerHTML = '<div class="callout ana-motor"><p><b>' + esc(T('Este análisis usa el motor R dentro de tu navegador')) + '</b></p><p class="small">' +
        esc(T('La primera vez se descargan R y sus paquetes (unos 25 MB, con internet); después quedan en la caché del navegador. Tus datos no salen del equipo: el cálculo corre aquí mismo.')) +
        '</p><div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-accion="motor-cargar">' + esc(T('Cargar el motor R y calcular')) + '</button></div></div>';
      return;
    }
    r0.classList.add('calculando');
    const viejo = r0.querySelector('.ana-espera');
    if (viejo) viejo.remove();
    r0.insertAdjacentHTML('afterbegin', '<div class="ana-espera ana-motor-espera small" role="status"><span data-motor-paso>' + esc(st.paso || T('Calculando en el motor R…')) + '</span> ' +
      '<button type="button" class="btn btn-ghost btn-sm" data-accion="motor-cancelar">' + esc(T('Cancelar')) + '</button></div>');
    SP.ejecutarAsync(id, c.t, e, opciones).then(({ resultado, ms }) => {
      try { localStorage.setItem(MOTOR_USADO, '1'); } catch (err) { /* sin almacenamiento */ }
      if (turno !== estado.turno) return;
      r0.classList.remove('calculando');
      mostrar(resultado, ms);
    }, err => { if (turno === estado.turno) fallar(err); });
  }
  let reloj = null;
  const recalcular = () => { clearTimeout(reloj); reloj = setTimeout(calcular, 150); };
  estado.calcular = calcular;

  /* ---------------- aplicar un pedido (del asistente o del constructor) ---------------- */
  const ROLES_DIS = ['bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB'];
  const OPC_COMUNES = ['nivel', 'alfa', 'predecir', 'entrada', 'salida', 'alternativa', 'mu', 'exacta', 'correccion', 'continuidad', 'faltantes'];
  function aplicar(m, e, op) {
    e = e || {}; op = op || {};
    let ultimo = null;
    const pon = (s, campos) => { for (const [k, v] of Object.entries(campos)) if (v !== undefined) s[k] = Array.isArray(v) ? v.slice() : v; s._iniciado = true; ultimo = s; };
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
      /* los dos grupos elegidos y las opciones de la prueba también vuelven (al reabrir desde el Reporte o una ficha) */
      const niv = [].concat(e.niveles || []);
      pon(estado.dos, { modo: e.modo, respuesta: e.respuesta, grupo: e.grupo, variable: e.variable, antes: e.antes, despues: e.despues, varIguales: op.varIguales,
        nivelA: niv[0], nivelB: niv[1], mu: op.mu, alternativa: op.alternativa, nivel: op.nivel, exacta: op.exacta, correccion: op.correccion, alfa: op.alfa });
    } else if (m === 'kruskal-wallis' || m === 'friedman') {
      const ph = m === 'friedman' ? { posthocF: op.posthoc } : { posthocKW: op.posthoc };
      pon(estado.rangos, Object.assign(ph, { respuesta: e.respuesta, tratamiento: e.tratamiento, bloque: e.bloque || '', ajuste: op.posthoc === 'nemenyi' ? undefined : op.ajuste, alfa: op.alfa }));
    } else if (m === 'supuestos') {
      pon(estado.sup, { respuesta: e.respuesta, tratamientos: [].concat(e.tratamientos || []), bloque: e.bloque || '', orden: e.orden || '', alfa: op.alfa });
    } else if (m === 'modelo-lineal') {
      pon(estado.ml, { respuesta: e.respuesta, derecha: op.derecha, comoFactor: op.comoFactor || [], tipoSC: op.tipoSC });
    } else if (m === 'modelo-mixto') {
      pon(estado.mx, { respuesta: e.respuesta, derecha: op.derecha, comoFactor: op.comoFactor || [], tipoSC: op.tipoSC, gl: op.gl, estimacion: op.reml === false ? 'ml' : op.reml === undefined ? undefined : 'reml',
        ajuste: op.ajuste, dentro: op.dentro || '' });
      estado.mx.compararMx = op.comparar ? [].concat(op.comparar) : null;
    } else if (m === 'medidas-repetidas') {
      pon(estado.rep, { respuesta: e.respuesta, tiempo: e.tiempo, sujeto: e.sujeto, tratamientos: [].concat(e.tratamientos || []), bloque: e.bloque || '',
        estructura: op.estructura, criterio: op.criterio, ajuste: op.ajuste, dentro: op.dentro === undefined ? undefined : op.dentro });
      estado.rep.compararMx = op.comparar ? [].concat(op.comparar) : null;
    } else if (POTENCIA.includes(m)) {
      pon(estado.pot, m === 'repeticiones' ? { cv: op.cv, difPct: op.diferencia, tratamientos: op.tratamientos, diseno: op.diseno, alfa: op.alfa, potencia: op.potencia }
        : { calcular: op.calcular, n: op.n, diferencia: op.diferencia, de: op.de, tipo: op.tipo, alternativa: op.alternativa, grupos: op.grupos, medias: op.medias, varEntre: op.varEntre, p1: op.p1, p2: op.p2, r: op.r, alfa: op.alfa, potencia: op.potencia });
    } else if (MULTIVARIADO.includes(m)) {
      pon(estado.mv, m === 'manova' ? { respuestas: [].concat(e.respuestas || []), tratamientos: [].concat(e.tratamientos || []), bloque: e.bloque || '', prueba: op.prueba, alfa: op.alfa }
        : { variables: [].concat(e.variables || []), grupo: e.grupo });
    } else if (SERIES.includes(m)) {
      pon(estado.ts, m === 'arima' ? { respuesta: e.respuesta, tiempo: e.tiempo || '', ap: op.p, ad: op.d, aq: op.q, aP: op.P, aD: op.D, aQ: op.Q, periodoA: op.periodo,
        mediaA: op.media === undefined ? undefined : op.media === false ? 'no' : 'si', buscarA: op.buscar === undefined ? undefined : op.buscar ? 'si' : 'no', horizonte: op.horizonte, nivel: op.nivel }
        : { respuesta: e.respuesta, tiempo: e.tiempo || '', rezagos: op.rezagos, lagBox: op.lagBox, fitdf: op.fitdf, nivel: op.nivel, frecuencia: op.frecuencia, tipo: op.tipo });
    } else if (SUPERVIVENCIA.includes(m)) {
      pon(estado.sv, { tiempo: e.tiempo, evento: e.evento, grupo: m === 'kaplan-meier' ? e.grupo || '' : undefined, estrato: e.estrato || '', conf: op.conf, nivel: op.nivel, rho: op.rho, empates: op.empates,
        factoresSv: m === 'cox' ? [].concat(e.factores || []) : undefined, covariablesSv: m === 'cox' ? [].concat(e.covariables || []) : undefined });
    } else if (MUESTREO.includes(m)) {
      const s = estado.mue;
      if (m === 'tamano-muestra') {
        pon(s, { que: op.tipo, escala: op.escala, de: op.de, cv: op.cv, p: op.p, N: op.N, confianza: op.confianza });
        if (op.error !== undefined) s[op.tipo === 'proporcion' ? 'errorProp' : op.escala === 'relativo' ? 'errorPct' : 'errorAbs'] = op.error;
      } else pon(s, { respuesta: e.respuesta, estrato: e.estrato, N: op.N, tipoSimple: op.tipo, nTotal: op.nTotal, confianza: op.confianza });
      for (const parte of String(op.poblaciones || '').split(/[;\n]+/)) { const x = parte.match(/^\s*(.+)[=:]\s*([\d.]+)\s*$/); if (x) estado.mueN[x[1].trim()] = +x[2]; }
    } else if (MULTI.includes(m)) {
      pon(estado.ma, { respuesta: e.respuesta, genotipo: e.genotipo, ambiente: e.ambiente, repeticion: e.repeticion || '', eeb: op.eeb, objetivo: op.objetivo, escala: op.escala, particion: op.particion,
        imputar: op.imputar !== false, ejesImputar: op.ejesImputar === undefined ? 1 : op.ejesImputar, ejesWaas: op.ejesWaas || 0, pesoRespuesta: op.pesoRespuesta === undefined ? 50 : op.pesoRespuesta,
        probAnnicchiarico: op.probAnnicchiarico || 0.25, genotipoA: op.genotipoA || '', genotipoB: op.genotipoB || '' });
    } else if (SUPERFICIES.includes(m)) {
      pon(estado.srf, { respuesta: e.respuesta, factores: [].concat(e.factores || []), bloque: e.bloque || '', orden: op.orden, objetivo: op.objetivo, nivel: op.nivel, codificacion: op.codificacion || 'auto' });
      if (op.codificacion === 'manual') (e.factores || []).forEach((f, j) => { estado.srf.bajos[f] = op.bajos[j]; estado.srf.altos[f] = op.altos[j]; });
    } else if (m === 'diseno-superficie') {
      pon(estado.dsn, { tipo: op.tipo, k: op.k, alfa: op.alfa, centros: op.centros, grado: op.grado, nombres: op.nombres, bajos: op.bajos, altos: op.altos, total: op.total, semilla: op.semilla });
    } else if (m === 'mezclas') {
      pon(estado.mez, { respuesta: e.respuesta, componentes: [].concat(e.componentes || []), modelo: op.modelo, objetivo: op.objetivo, nivel: op.nivel });
    } else if (m === 'deseabilidad') {
      pon(estado.des, { factores: [].concat(e.factores || []), respuestasDes: [].concat(e.respuestas || []), region: op.region });
      (e.respuestas || []).forEach((y, i) => { estado.des.por[y] = { meta: op.metas[i], L: op.inferiores[i], U: op.superiores[i], T: (op.objetivos || [])[i], s: (op.exponentes || [])[i] || 1, t: (op.exponentes2 || [])[i] || 1, r: (op.importancias || [])[i] || 1 }; });
    } else if (NOLINEAL.includes(m)) {
      pon(estado.nl, { respuesta: e.respuesta, x: e.x || e.dosis, grupo: e.grupo || '', pesos: e.pesos || '', modelo: op.modelo, nivel: op.nivel, intervalo: op.intervalo || 'wald',
        precioProducto: op.precioProducto > 0 ? op.precioProducto : '', precioInsumo: op.precioInsumo > 0 ? op.precioInsumo : '', ejeLog: !!op.ejeLog, metodo: m });
    } else if (GLMS.includes(m)) {
      estado.glm.metodo = m;
      pon(estado.glm, { respuesta: e.respuesta, tratamientos: e.tratamientos ? [].concat(e.tratamientos) : undefined, bloque: e.bloque || '', covariables: [].concat(e.covariables || []),
        ensayos: e.ensayos || '', exposicion: e.exposicion || '', familia: op.familia, enlace: op.enlace, tipo: op.tipo, dentro: op.dentro || '', ajuste: op.ajuste,
        derecha: op.derecha, comoFactor: op.comoFactor ? [].concat(op.comoFactor) : undefined, sobredispersion: op.sobredispersion,
        intervalo: op.intervalo || 'wald', firth: !!op.firth, lambda: op.lambda, nagq: op.nagq || 1, pruebaAleatorios: op.pruebaAleatorios !== false });
      estado.glm.compararMx = op.comparar && op.comparar.length ? [].concat(op.comparar) : null;
    } else if (GENETICOS.includes(m)) {
      pon(estado.gen, m === 'componentes-varianza' ? { respuesta: e.respuesta, aleatorios: [].concat(e.aleatorios || []), fijos: [].concat(e.fijos || []), estructura: op.estructura }
        : m === 'heredabilidad' ? { respuesta: e.respuesta, genotipo: e.genotipo, repeticion: e.repeticion || '', bloque: e.bloque || '', ambiente: e.ambiente || '', seleccion: op.seleccion, direccion: op.direccion }
          : { respuesta: e.respuesta, individuo: e.individuo, fijosRep: [].concat(e.fijos || []) });
    } else if (MIXTOS_DIS.includes(m)) {
      pon(estado.mxd, Object.assign({}, e, { tratamientos: e.tratamientos ? [].concat(e.tratamientos) : undefined, subsubparcela: e.subsubparcela || '', bloque: e.bloque || '',
        gl: op.gl, estimacion: op.reml === false ? 'ml' : op.reml === undefined ? undefined : 'reml', ajuste: op.ajuste, dentro: op.dentro || '', repeticionAleatoria: op.repeticionAleatoria, localidadFija: op.localidadFija }));
      estado.mxd.compararMx = op.comparar ? [].concat(op.comparar) : null;
    }
    /* las opciones que se llaman igual en el pedido y en el formulario (niveles, valores para predecir, pruebas exactas…):
       un análisis que se reabre desde el reporte, también de un proyecto o de lo recuperado, vuelve con las suyas */
    if (ultimo) for (const k of OPC_COMUNES) if (op[k] !== undefined && k in ultimo) ultimo[k] = Array.isArray(op[k]) ? op[k].slice() : op[k];
    estado.metodo = m;
  }
  /** Aplica el pedido, pasa al catálogo y calcula. */
  function usar(m, e, op) {
    if (SP.catalogoUI) SP.catalogoUI.recoger();
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
  const graficasDe = (id, r, op) => (id === 'supuestos' ? (SP.temasGraficas ? SP.temasGraficas.selector() : '') + graficasSupuestos(r) : graficasHTML(graficaMetodo(r, op)));
  Object.assign(estado, { aplicar, usar, ponerModo, graficasDe });

  function iniciar() {
    const panel = $('#panel-4');
    const form = $('#anaOpciones');
    $('#anaModos').addEventListener('click', e => { const b = e.target.closest('[data-modo]'); if (b) ponerModo(b.dataset.modo); });
    /* sin datos: los cálculos que no los necesitan (potencia y tamaño de muestra) */
    const sd = $('#anaSinDatos');
    if (sd) sd.addEventListener('click', () => { estado.sinDatos = true; estado.metodo = 'potencia-medias'; SP.app.ir(4); ponerModo('catalogo'); });
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
      } else if (['predictores', 'covariables', 'variables', 'controles', 'comoFactor', 'compararMx', 'aleatorios', 'fijos', 'fijosRep', 'factores', 'factoresSv', 'covariablesSv', 'respuestasMv', 'variablesMv', 'componentes', 'respuestasDes'].includes(el.dataset.lista)) {
        const marcados = [...form.querySelectorAll('[data-lista="' + el.dataset.lista + '"]:checked')].map(x => x.value), max = { covariables: 2, predictores: 15, variables: 30, controles: 10, comoFactor: 30, compararMx: 6, aleatorios: 4, fijos: 3, fijosRep: 3, factores: 6, factoresSv: 4, covariablesSv: 10, respuestasMv: 10, variablesMv: 15, componentes: 6, respuestasDes: 6 }[el.dataset.lista];
        if (marcados.length > max) { el.checked = false; L() && L().toast(T('Hasta {k} variables.', { k: max }), { type: 'warning' }); return; }
        estado[el.dataset.grupo][el.dataset.lista] = marcados;
      } else if (el.dataset.lista === 'tratamientos') {
        const grupo = el.dataset.grupo || 'sup', dsel = DISENOS.includes(estado.metodo) ? estado.metodo : estado.cmp.diseno, max = grupo === 'dis' ? (MAX_TRAT[dsel] || 3) : grupo === 'anc' ? 2 : 3;
        const marcados = [...form.querySelectorAll('[data-lista="tratamientos"]:checked')].map(x => x.value);
        if (marcados.length > max) { el.checked = false; L() && L().toast(max === 2 ? T('Hasta dos factores de tratamiento.') : T('Hasta tres factores de tratamiento.'), { type: 'warning' }); return; }
        estado[grupo].tratamientos = marcados;
      } else if (el.dataset.campo === 'tratamiento1') {
        estado.dis.tratamientos = el.value ? [el.value] : [];
      } else if (el.dataset.grupo === 'des' && el.dataset.campo && el.dataset.campo.includes('|')) {
        const [k, y] = el.dataset.campo.split('|');
        (estado.des.por[y] = estado.des.por[y] || {})[k] = el.value;
      } else if (el.dataset.grupo === 'srf' && el.dataset.campo && /^(bajo|alto)\|/.test(el.dataset.campo)) {
        const [k, f2] = el.dataset.campo.split('|');
        estado.srf[k === 'bajo' ? 'bajos' : 'altos'][f2] = el.value;
      } else if (el.dataset.campo) {
        const s = estado[el.dataset.grupo || 'sup'];
        s[el.dataset.campo] = el.type === 'checkbox' ? el.checked : el.value;
      }
      calcular();
    });
    $('#anaResultado').addEventListener('click', async e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      if (a.dataset.accion === 'motor-cargar') { estado.motorAceptado = true; calcular(); return; }
      if (a.dataset.accion === 'motor-cancelar') { SP.motorR.cancelar(); return; }
      if (a.dataset.accion === 'csv-suite') {
        const r = estado.ultimoResultado, t = SP.app.tablaAnalisis();
        if (!r || !t) return;
        const vars = r.variables || r.respuestas, facs = r.grupo ? [r.grupo] : (r.bloque ? [r.bloque] : []).concat(r.tratamientos || []), cols = facs.concat(vars);
        const celda = v => { const s = v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v)) ? '' : String(v); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
        const valor = (nom, i) => { const c = t.col(nom); return c.tipo === 'factor' ? (c.codigos[i] >= 0 ? c.niveles[c.codigos[i]] : '') : c.valores[i]; };
        const lineas = [cols.map(celda).join(',')].concat(r.filas.map(i => cols.map(nm => celda(valor(nm, i))).join(',')));
        SP.app.figuras.descargar('\ufeff' + lineas.join('\r\n') + '\r\n', 'sigmapro-para-' + a.dataset.app.toLowerCase() + '.csv', 'text/csv;charset=utf-8');
        L() && L().toast(T('CSV listo: ábrelo en {a} (Datos → Importar).', { a: a.dataset.app }), { type: 'success' });
        return;
      }
      if (a.dataset.accion === 'girar3d') {
        const v = estado.vista3d, d = a.dataset.dir;
        if (d === 'izq') v.azimut -= 20; else if (d === 'der') v.azimut += 20; else if (d === 'arriba') v.elevacion = Math.min(85, v.elevacion + 10); else v.elevacion = Math.max(5, v.elevacion - 10);
        const r = estado.ultimoResultado, fig = $('#anaResultado').querySelector('svg[data-sigmapro-figura^="' + T('Superficie en 3D') + '"]');
        if (r && fig) fig.closest('figure').outerHTML = superficie3dDe(r);
        return;
      }
      if (a.dataset.accion === 'abrir-diseno') {
        const r = estado.ultimoResultado;
        if (!r || r.tipo !== 'diseno-superficie') return;
        const nombres = ['corrida', 'estandar'].concat(new Set(r.bloque).size > 1 ? ['bloque'] : [], r.nombres, ['respuesta']), cols = {};
        nombres.forEach(n => { cols[n] = []; });
        r.orden.forEach((st, c) => {
          cols.corrida.push(c + 1); cols.estandar.push(st + 1); if (cols.bloque) cols.bloque.push(String(r.bloque[st]));
          r.nombres.forEach((n, j) => cols[n].push(r.natural ? +r.natural[st][j].toPrecision(10) : +r.codificado[st][j].toPrecision(10))); cols.respuesta.push(NaN);
        });
        const hoja = SP.hoja.crear({ nombres, columnas: cols, tipos: cols.bloque ? { bloque: { tipo: 'factor' } } : {} });
        SP.app.cargarHoja(hoja, T('Diseño generado: {t}', { t: SP.metodos['diseno-superficie'].nombre }));
        SP.app.ir(2);
        L() && L().toast(T('El diseño quedó en Datos: anota la respuesta de cada corrida en la columna «respuesta».'), { type: 'success' });
        return;
      }
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
      if (a.dataset.accion === 'csv') {
        const c = estado.ultimo && estado.ultimo.cuadros[+a.dataset.cuadro || 0];
        if (c) { const n = SP.cuadros.bajarCSV(c); L() && L().toast(T('Cuadro bajado: {f}', { f: n }), { type: 'success' }); }
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
      if (SP.catalogoUI) SP.catalogoUI.recoger();
      calcular();
      /* elegido: al formulario del análisis */
      const f = $('#anaOpciones');
      if (f) { f.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); const p = f.querySelector('select, input, button'); if (p) p.focus({ preventScroll: true }); }
    });
    document.addEventListener('sp:datos', () => { if (panel.classList.contains('active')) recalcular(); else estado.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 4 && estado.pendiente) calcular(); });
    /* el paso del motor R, en vivo */
    if (SP.motorR) SP.motorR.al(s => { const el = document.querySelector('#anaResultado [data-motor-paso]'); if (el && s.paso) el.textContent = s.paso; });
    if (panel.classList.contains('active')) calcular();
  }
  SP.alArrancar(iniciar);
})();

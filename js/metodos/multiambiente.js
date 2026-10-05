/* SigmaPro — ensayos multiambiente y estabilidad (familia Ensayos multiambiente y estabilidad), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cuatro métodos con el mismo cálculo (SP.multiambiente, validado contra lm y svd de R):
   - ensayos-multiambiente: análisis conjunto, análisis de cada ambiente, homogeneidad de los errores y medias;
   - estabilidad: Finlay-Wilkinson y Eberhart-Russell (b y S²d), ecovalencia de Wricke, varianza de Shukla y
     superioridad de Lin y Binns;
   - ammi: ejes con la F de Gollob y la F_R de Cornelius, puntajes y ASV, biplots AMMI1 y AMMI2;
   - gge: biplot GGE con quién ganó dónde y media contra estabilidad.
   Los datos son parcelas (genotipo, ambiente y, si hay, repetición) o una media por genotipo y ambiente. */
SP.definir('metodos-multiambiente', function (SP) {
  'use strict';
  const T = SP.T;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const M = () => SP.multiambiente;
  const lista = xs => (xs.length <= 1 ? (xs[0] || '') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);
  const NOMBRE = { 'ensayos-multiambiente': T('Ensayo en varios ambientes'), 'dos-etapas': T('Análisis en dos etapas'), estabilidad: T('Estabilidad'), ammi: 'AMMI', gge: T('Biplot GGE') };

  function datosDe(tabla, e) {
    const yv = tabla.col(e.respuesta).valores, gc = SP.estructura.comoFactor(tabla, e.genotipo), ac = SP.estructura.comoFactor(tabla, e.ambiente);
    const rc = e.repeticion ? SP.estructura.comoFactor(tabla, e.repeticion) : null;
    const y = [], g0 = [], a0 = [], r0 = [];
    for (let i = 0; i < tabla.n; i++) {
      if (yv[i] !== yv[i] || gc.codigos[i] < 0 || ac.codigos[i] < 0 || (rc && rc.codigos[i] < 0)) continue;
      y.push(yv[i]); g0.push(gc.codigos[i]); a0.push(ac.codigos[i]); if (rc) r0.push(rc.codigos[i]);
    }
    const recodificar = (c0, niveles) => {
      const usados = [...new Set(c0)].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      return { cod: Int32Array.from(c0, c => mapa.get(c)), niveles: usados.map(c => niveles[c]) };
    };
    const G = recodificar(g0, gc.niveles), A = recodificar(a0, ac.niveles);
    return { y, gen: G.cod, genos: G.niveles, amb: A.cod, ambs: A.niveles, rep: rc ? Int32Array.from(r0) : null };
  }
  function validar(id) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      exigir(e.genotipo && tabla.columnas[e.genotipo], T('Elige la columna de los genotipos.'));
      exigir(e.ambiente && tabla.columnas[e.ambiente], T('Elige la columna de los ambientes (localidades, años o fechas de siembra).'));
      exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
      if (e.repeticion) exigir(tabla.columnas[e.repeticion], T('No existe la columna «{c}».', { c: e.repeticion }));
      const todas = [e.respuesta, e.genotipo, e.ambiente].concat(e.repeticion ? [e.repeticion] : []);
      exigir(new Set(todas).size === todas.length, T('Cada columna va en un solo papel.'));
      if (id === 'estabilidad') exigir(['propio', 'error'].includes(op.eeb), T('Opción no válida para el error estándar de b.'));
      if (id === 'gge') exigir(['ninguna', 'desviacion'].includes(op.escala) && ['simetrica', 'genotipo', 'ambiente'].includes(op.particion), T('Opción no válida del biplot GGE.'));
      if (op.objetivo !== undefined) exigir(['maximo', 'minimo'].includes(op.objetivo), T('El objetivo es la mayor o la menor respuesta.'));
      if (op.ejesImputar !== undefined) exigir(Number.isInteger(+op.ejesImputar) && +op.ejesImputar >= 0, T('Los ejes de la imputación son un entero (0 o más).'));
      if (id === 'ammi') {
        exigir(op.pesoRespuesta >= 0 && op.pesoRespuesta <= 100, T('El peso de la respuesta en WAASY va de 0 a 100.'));
        exigir(!op.ejesWaas || (Number.isInteger(+op.ejesWaas) && +op.ejesWaas >= 1), T('Los ejes del WAAS son un entero de 1 o más.'));
      }
      if (id === 'estabilidad') exigir(op.probAnnicchiarico > 0 && op.probAnnicchiarico < 0.5, T('La probabilidad del índice de Annicchiarico va entre 0 y 0.5.'));
      if (id === 'gge' && (op.genotipoA || op.genotipoB)) exigir(op.genotipoA && op.genotipoB && op.genotipoA !== op.genotipoB, T('Para comparar dos genotipos elige dos distintos.'));
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e), G = d.genos.length, E = d.ambs.length;
      exigir(G >= 3, T('Hacen falta al menos 3 genotipos.'));
      exigir(E >= (id === 'gge' ? 2 : 3), T('Hacen falta al menos {k} ambientes.', { k: id === 'gge' ? 2 : 3 }));
      if (id === 'dos-etapas') {
        const q = M().dosEtapas(d);
        return Object.assign({ tipo: 'multiambiente', metodo: id, respuesta: e.respuesta, genotipo: e.genotipo, ambiente: e.ambiente, repeticion: e.repeticion || '',
          genotipos: d.genos, ambientes_nombre: d.ambs, alfa: op.alfa || 0.05, objetivo: op.objetivo || 'maximo', n: d.y.length, excluidas: tabla.n - d.y.length }, q);
      }
      const p = M().preparar(d, { imputar: op.imputar !== false, ejes: op.ejesImputar === undefined ? 1 : +op.ejesImputar });
      const faltan = p.imputacion ? p.imputacion.celdas.length : 0;
      const r = Object.assign({ tipo: 'multiambiente', metodo: id, respuesta: e.respuesta, genotipo: e.genotipo, ambiente: e.ambiente, repeticion: e.repeticion || '',
        genotipos: d.genos, ambientes_nombre: d.ambs, tabla: p.Y, r: p.r, cme: p.cme, gle: p.gle, anova: p.anova, alfa: op.alfa || 0.05, objetivo: op.objetivo || 'maximo',
        n: d.y.length, excluidas: tabla.n - d.y.length }, p.ambientes ? { ambientes: p.ambientes } : {}, p.bartlett ? { bartlett: p.bartlett } : {}, p.genotipos_vs_ga ? { genotipos_vs_ga: p.genotipos_vs_ga } : {},
      p.imputacion ? { imputacion: p.imputacion } : {});
      const A = M().aditiva(p.Y);
      Object.assign(r, { medias: A.gm, medias_ambiente: A.em, media_general: A.gran });
      if (id === 'estabilidad') {
        Object.assign(r, M().estabilidad(p.Y, { r: p.r, cme: p.cme, gle: p.gle, eeb: op.eeb, objetivo: r.objetivo }), { eeb: op.eeb });
        r.huehn = M().huehn(p.Y, r.objetivo);
        if (p.gle > 0) r.kang = M().kang(p.Y, { r: p.r, cme: p.cme, gle: p.gle, objetivo: r.objetivo });
        if (r.objetivo === 'maximo') r.annicchiarico = M().annicchiarico(p.Y, op.probAnnicchiarico || 0.25);
      }
      if (id === 'ammi') {
        r.ammi = M().ammi(p.Y, { r: p.r, cme: p.cme, gle: p.gle, alfa: r.alfa, faltan });
        r.waas = M().waas(r.ammi, A.gm, { ejes: op.ejesWaas ? +op.ejesWaas : 0, alfa: r.alfa, objetivo: r.objetivo, pesoRespuesta: op.pesoRespuesta });
      }
      if (id === 'gge') {
        const q = M().gge(p.Y, op), ia = op.genotipoA ? d.genos.indexOf(op.genotipoA) : -1, ib = op.genotipoB ? d.genos.indexOf(op.genotipoB) : -1;
        if (op.genotipoA) exigir(ia >= 0 && ib >= 0, T('El genotipo «{g}» no está en los datos.', { g: ia < 0 ? op.genotipoA : op.genotipoB }));
        const vistas = M().ggeVistas(q, p.Y, { a: ia >= 0 ? ia : undefined, b: ib >= 0 ? ib : undefined, escala: op.escala, objetivo: r.objetivo });
        r.gge = Object.assign(q, { ganador: q.ganador.map(i => d.genos[i]), indices_vertices: q.vertices, vertices: q.vertices.map(i => d.genos[i]).sort() }, vistas,
          vistas.comparacion ? { comparacion: Object.assign(vistas.comparacion, { a: d.genos[ia], b: d.genos[ib] }) } : {});
        Object.assign(r, { escala: op.escala, particion: op.particion });
      }
      return r;
    };
  }

  /* ======================= reporte ======================= */
  const anovaCuadro = (r, titulo, extra) => {
    const a = r.anova, filas = a.fuente.map((f, i) => ({ f, gl: a.gl[i], sc: a.sc[i], cm: a.cm[i], F: a.F[i], p: a.p[i] }));
    return { id: 'anova', titulo, columnas: [col('f', T('Fuente'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'sig'), col('cm', T('CM'), 'sig'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: filas.concat(extra || []),
      notas: [r.repeticion ? T('Ambientes contra repeticiones dentro de ambientes; lo demás contra el error combinado.') : r.gle > 0 ? T('Todo contra el error combinado de los ambientes.') : T('Una media por celda: G × A hace de residuo.')] };
  };
  function conclusionesBase(r) {
    const out = [], a = r.alfa, an = r.anova, iGA = an.fuente.indexOf(T('G × A')), iG = an.fuente.indexOf(T('Genotipos'));
    if (iGA >= 0) out.push(an.p[iGA] < a ? T('La interacción genotipo × ambiente es significativa (F = {F}, p {p}): el orden de los genotipos cambia entre ambientes.', { F: f2(an.F[iGA]), p: fp(an.p[iGA]) })
      : T('La interacción genotipo × ambiente no es significativa (F = {F}, p {p}): los genotipos responden igual en todos los ambientes.', { F: f2(an.F[iGA]), p: fp(an.p[iGA]) }));
    if (r.genotipos_vs_ga) out.push(T('Los genotipos {d} (contra el error: F = {F}, p {p}; contra G × A, como con ambientes aleatorios: F = {F2}, p {p2}).',
      { d: an.p[iG] < a ? T('difieren') : T('no difieren'), F: f2(an.F[iG]), p: fp(an.p[iG]), F2: f2(r.genotipos_vs_ga.F), p2: fp(r.genotipos_vs_ga.p) }));
    return out;
  }
  const mejorPorMedia = r => { const s = r.objetivo === 'minimo' ? -1 : 1; let k = 0; r.medias.forEach((v, i) => { if (s * (v - r.medias[k]) > 0) k = i; }); return k; };

  function reporte(r) {
    const conclusiones = [], cuadros = [], semaforo = [], Gn = r.genotipos, An = r.ambientes_nombre, a = r.alfa, kM = r.medias ? mejorPorMedia(r) : -1;
    const titulo = { 'ensayos-multiambiente': T('Análisis conjunto de ensayos en varios ambientes'), 'dos-etapas': T('Análisis en dos etapas'), estabilidad: T('Estabilidad de los genotipos'), ammi: T('Modelo AMMI'), gge: T('Biplot GGE') }[r.metodo];
    if (r.metodo === 'dos-etapas') return reporteDosEtapas(r, titulo);
    const im = r.imputacion;
    if (im) {
      conclusiones.push(T('Se imputaron {k} {c} genotipo × ambiente por EM-AMMI ({e} {x}, {i} vueltas): {l}. Los análisis usan la tabla completa; la interacción pierde un grado de libertad por celda imputada.',
        { k: im.celdas.length, c: im.celdas.length === 1 ? T('celda vacía') : T('celdas vacías'), e: im.ejes, x: im.ejes === 1 ? T('eje') : T('ejes'), i: im.iteraciones, l: lista(im.celdas.slice(0, 6).map(z => z.genotipo + ' en ' + z.ambiente)) + (im.celdas.length > 6 ? '…' : '') }));
      const fr = im.celdas.length / (Gn.length * An.length);
      semaforo.push({ nombre: T('Celdas imputadas'), color: fr <= 0.1 ? 'ambar' : 'rojo', texto: T('{k} de {t} celdas ({p} %) se estimaron con EM-AMMI.', { k: im.celdas.length, t: Gn.length * An.length, p: f2(100 * fr) }) });
    }
    if (r.bartlett) semaforo.push({ nombre: T('Homogeneidad de los errores'), color: r.bartlett.razon <= 3 ? 'verde' : r.bartlett.razon <= 9 ? 'ambar' : 'rojo',
      texto: T('Razón entre el mayor y el menor CME: {k} (Bartlett: χ² = {c}, p {p}).', { k: f2(r.bartlett.razon), c: f2(r.bartlett.chi2), p: fp(r.bartlett.p) }) });
    if (r.metodo === 'ensayos-multiambiente') {
      conclusiones.push(...conclusionesBase(r));
      conclusiones.push(T('{g} tiene la {o} media general ({v}).', { g: Gn[kM], o: r.objetivo === 'minimo' ? T('menor') : T('mayor'), v: sig(r.medias[kM]) }));
      if (r.bartlett) conclusiones.push(r.bartlett.razon <= 3 ? T('Los errores de los ambientes son parecidos (razón máx./mín. {k} ≤ 3): el análisis conjunto es apropiado.', { k: f2(r.bartlett.razon) })
        : T('Los errores de los ambientes difieren (razón máx./mín. {k} > 3; Bartlett p {p}): las pruebas del análisis conjunto son aproximadas: interprétalas con cautela.', { k: f2(r.bartlett.razon), p: fp(r.bartlett.p) }));
      cuadros.push(anovaCuadro(r, T('Análisis de varianza conjunto')));
      if (r.ambientes) {
        const P = r.ambientes;
        cuadros.push({ id: 'ambientes', titulo: T('Análisis de cada ambiente'), columnas: [col('a', T('Ambiente'), 'texto'), col('m', T('Media'), 'sig'), col('cme', T('CME'), 'sig'), col('gl', T('gl'), 'entero'),
          col('cv', T('CV (%)'), 'forma2'), col('F', T('F genotipos'), 'forma2'), col('p', 'p', 'pvalor')],
        filas: An.map((n, j) => ({ a: n, m: P.media[j], cme: P.cme[j], gl: P.gl[j], cv: P.cv[j], F: P.F[j], p: P.p[j] })),
        notas: [T('Cada ambiente por separado ({m}); el CME combinado es {c} con {g} gl.', { m: r.repeticion ? T('bloques completos al azar') : T('completamente al azar'), c: sig(r.cme), g: r.gle })] });
      }
    }
    if (r.metodo === 'estabilidad') {
      const R = r.regresion, W = r.wricke, S = r.shukla;
      const estables = Gn.filter((_, i) => R.p[i] >= a && (!R.p_dev || R.p_dev[i] >= a));
      conclusiones.push(T('Según Eberhart y Russell, el genotipo ideal tiene una media alta, b = 1 y S²d = 0; cumplen b = 1{s}: {l}.', { s: R.p_dev ? T(' y S²d = 0') : '', l: estables.length ? lista(estables) : T('ninguno') }));
      const adapt = Gn.map((g, i) => ({ g, b: R.b[i], p: R.p[i] })).filter(x => x.p < a);
      if (adapt.length) conclusiones.push(T('Responden distinto al ambiente: {l}.', { l: lista(adapt.map(x => x.g + (x.b > 1 ? T(' (b > 1: aprovecha los buenos ambientes)') : T(' (b < 1: se adapta a los malos)')))) }));
      const kW = W.W.indexOf(Math.min(...W.W)), kL = r.lin_binns.indexOf(Math.min(...r.lin_binns));
      conclusiones.push(T('El más estable por la ecovalencia de Wricke es {g} ({p} % de la interacción); el de mejor superioridad de Lin y Binns (menor Pi) es {l}.', { g: Gn[kW], p: f2(W.pct[kW]), l: Gn[kL] }));
      cuadros.push({ id: 'regresion', titulo: T('Regresión sobre el índice ambiental (Finlay y Wilkinson; Eberhart y Russell)'),
        columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('b', 'b', 'forma'), col('ee', T('EE(b)'), 'forma'), col('t', 't (b = 1)', 'forma2'), col('p', 'p', 'pvalor')]
          .concat(R.s2d ? [col('s2d', 'S²d', 'sig'), col('F', 'F (S²d = 0)', 'forma2'), col('pd', 'p', 'pvalor')] : [], [col('r2', 'R²', 'forma')]),
        filas: Gn.map((g, i) => Object.assign({ g, m: r.medias[i], b: R.b[i], ee: R.ee[i], t: R.t[i], p: R.p[i], r2: R.r2[i] }, R.s2d ? { s2d: R.s2d[i], F: R.F[i], pd: R.p_dev[i] } : {})),
        notas: [r.eeb === 'error' ? T('EE(b) con el error combinado (CME/r), t con sus gl.') : T('EE(b) de la regresión de cada genotipo (e − 2 gl).'), T('S²d en la escala de las medias: CM de las desviaciones − CME/r.')] });
      cuadros.push({ id: 'varianzas', titulo: T('Varianzas de estabilidad y superioridad'),
        columnas: [col('g', T('Genotipo'), 'texto'), col('W', T('Wricke W'), 'sig'), col('Wp', 'W (%)', 'forma2'), col('s', T('Shukla σ²'), 'sig')]
          .concat(S.F ? [col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')] : [], [col('P', T('Lin y Binns Pi'), 'sig')]),
        filas: Gn.map((g, i) => Object.assign({ g, W: W.W[i], Wp: W.pct[i], s: S.sigma2[i], P: r.lin_binns[i] }, S.F ? { F: S.F[i], p: S.p[i] } : {})),
        notas: [T('W en la escala de las parcelas; σ² de Shukla en la de las medias (F contra CME/r); Pi con el {o} de cada ambiente.', { o: r.objetivo === 'minimo' ? T('mínimo') : T('máximo') })] });
      const E = r.eberhart_russell;
      cuadros.push({ id: 'eberhart_russell', titulo: T('Análisis de varianza de Eberhart y Russell'),
        columnas: [col('f', T('Fuente'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'sig'), col('cm', T('CM'), 'sig'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
        filas: E.fuente.map((f, i) => ({ f, gl: E.gl[i], sc: E.sc[i], cm: E.cm[i], F: E.F[i], p: E.p[i] })),
        notas: [T('Genotipos y G × A (lineal) contra las desviaciones combinadas; estas, contra el error. Desviaciones con g(e − 2) gl, como en el original.')] });
      cuadros.push({ id: 'indice', titulo: T('Índice ambiental'), columnas: [col('a', T('Ambiente'), 'texto'), col('m', T('Media'), 'sig'), col('I', T('Índice'), 'sig')],
        filas: An.map((n, j) => ({ a: n, m: r.medias_ambiente[j], I: r.indice[j] })), notas: [T('Índice = media del ambiente − media general.')] });
      /* no paramétricas de Huehn */
      const H = r.huehn, kS1 = H.S1.indexOf(Math.min(...H.S1)), kS3 = H.S3.indexOf(Math.min(...H.S3));
      conclusiones.push(T('Por los rangos de Huehn, el que menos cambia de lugar entre ambientes es {g} (S1 = {s}); el mejor en respuesta y estabilidad juntas (menor S3) es {h}. La suma de Z1 {d} (χ² = {z}, p {p}).',
        { g: Gn[kS1], s: f2(H.S1[kS1]), h: Gn[kS3], d: H.suma.p1 < a ? T('indica cambios de rango significativos') : T('no indica cambios de rango significativos'), z: f2(H.suma.Z1), p: fp(H.suma.p1) }));
      cuadros.push({ id: 'huehn', titulo: T('Estadísticas no paramétricas de Huehn'),
        columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('S1', 'S1', 'forma'), col('Z1', 'Z1', 'forma2'), col('p1', 'p', 'pvalor'),
          col('S2', 'S2', 'forma'), col('Z2', 'Z2', 'forma2'), col('p2', 'p', 'pvalor'), col('S3', 'S3', 'forma'), col('S6', 'S6', 'forma')],
        filas: Gn.map((g, i) => ({ g, m: r.medias[i], S1: H.S1[i], Z1: H.Z1[i], p1: H.p1[i], S2: H.S2[i], Z2: H.Z2[i], p2: H.p2[i], S3: H.S3[i], S6: H.S6[i] })),
        notas: [T('S1 y S2 con los rangos de la respuesta corregida por el efecto del genotipo; S3 y S6 con los de la respuesta (menor, mejor).'),
          T('Sin interacción se esperan S1 = {a} y S2 = {b}; Z = (S − E)²/V contra χ² con 1 gl (con {g} genotipos, conviene p < {c} por Bonferroni); ΣZ1 = {z1} y ΣZ2 = {z2} contra χ² con {g} gl (p {p1} y {p2}).',
            { a: f2(H.esperado.S1), b: f2(H.esperado.S2), g: Gn.length, c: +(0.05 / Gn.length).toPrecision(2), z1: f2(H.suma.Z1), z2: f2(H.suma.Z2), p1: fp(H.suma.p1), p2: fp(H.suma.p2) })] });
      if (r.kang) {
        const K = r.kang, sel = Gn.filter((_, i) => K.seleccionado[i]);
        conclusiones.push(T('Por el YS de Kang (rendimiento y estabilidad), se seleccionan {l} (YS mayor que el medio, {m}).', { l: sel.length ? lista(sel) : T('ninguno'), m: f2(K.YS_media) }));
        cuadros.push({ id: 'kang', titulo: T('Rendimiento-estabilidad de Kang (YS)'),
          columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('R', T('Rango'), 'entero'), col('aj', T('Ajuste por la DMS'), 'entero'), col('s', T('σ² de Shukla'), 'sig'),
            col('F', 'F', 'forma2'), col('c', T('Calificación'), 'entero'), col('ys', 'YS', 'entero'), col('sel', T('Seleccionado'), 'texto')],
          filas: Gn.map((g, i) => ({ g, m: r.medias[i], R: K.rango[i], aj: K.ajuste[i], s: K.sigma2[i], F: K.F[i], c: K.califica[i], ys: K.YS[i], sel: K.seleccionado[i] ? T('sí') : '' })),
          notas: [T('Rango 1 = la {o} media. DMS (t de una cola al 5 %) = {d}. σ² de Shukla en la escala de parcela, F contra el CME: −2, −4 y −8 si pasa del cuantil 90, 95 y 99 % (Kang, 1993).', { o: r.objetivo === 'minimo' ? T('mayor') : T('menor'), d: sig(K.dms) })] });
      }
      if (r.annicchiarico) {
        const N = r.annicchiarico, kg = N.general.Wi.indexOf(Math.max(...N.general.Wi)), ff = N.favorables, fd = N.desfavorables;
        conclusiones.push(T('Por el índice de confianza de Annicchiarico, el de menor riesgo de quedar por debajo de la media del ambiente es {g} (Wi = {w} %).', { g: Gn[kg], w: f2(N.general.Wi[kg]) }));
        cuadros.push({ id: 'annicchiarico', titulo: T('Índice de confianza de Annicchiarico (Wi, % de la media del ambiente)'),
          columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media (%)'), 'forma2'), col('de', T('DE (%)'), 'forma2'), col('W', 'Wi', 'forma2'), col('o', T('Orden'), 'num')]
            .concat(ff ? [col('Wf', T('Wi favorables'), 'forma2')] : [], fd ? [col('Wd', T('Wi desfavorables'), 'forma2')] : []),
          filas: Gn.map((g, i) => Object.assign({ g, m: N.general.pct[i], de: N.general.de[i], W: N.general.Wi[i], o: N.general.rango[i] }, ff ? { Wf: ff.Wi[i] } : {}, fd ? { Wd: fd.Wi[i] } : {})),
          notas: [T('Wi = media − z·DE con z = {z} (probabilidad {p}); favorables: índice ambiental ≥ 0 ({f}); desfavorables: < 0 ({d}).',
            { z: f2(N.z), p: N.prob, f: ff ? lista(ff.ambientes.map(j => An[j])) : T('menos de dos'), d: fd ? lista(fd.ambientes.map(j => An[j])) : T('menos de dos') })] });
      }
    }
    if (r.metodo === 'ammi') {
      const X = r.ammi, ej = X.ejes, m = ej.sv.length;
      conclusiones.push(...conclusionesBase(r));
      conclusiones.push(T('Los dos primeros ejes explican el {p} % de la interacción (EJE1 {a} %, EJE2 {b} %).', { p: f2(ej.acum[Math.min(1, m - 1)]), a: f2(ej.pct[0]), b: m > 1 ? f2(ej.pct[1]) : '—' }));
      if (X.fr) conclusiones.push(T('La prueba F_R de Cornelius retiene {n} {e}; la F de Gollob, {g}.', { n: X.n_fr, e: X.n_fr === 1 ? T('eje') : T('ejes'), g: ej.p.filter((p, k) => p < a && ej.p.slice(0, k).every(q => q < a)).length }));
      if (X.asv) { const k = X.asv.indexOf(Math.min(...X.asv)); conclusiones.push(T('El genotipo más estable por el ASV es {g} (ASV = {v}).', { g: Gn[k], v: f2(X.asv[k]) })); }
      const extra = ej.sv.map((_, k) => ({ f: T('  EJE{k}', { k: k + 1 }), gl: ej.gl[k], sc: ej.sc[k], cm: ej.cm[k], F: ej.F ? ej.F[k] : NaN, p: ej.p ? ej.p[k] : NaN })).filter(x => Number.isFinite(x.gl));
      if (X.residuo) extra.push({ f: T('  Residuo AMMI'), gl: X.residuo.gl, sc: X.residuo.sc, cm: X.residuo.cm, F: X.residuo.F, p: X.residuo.p });
      const c0 = anovaCuadro(r, T('Análisis de varianza AMMI'));
      const u = c0.filas.length - (r.gle > 0 ? 1 : 0);
      c0.filas = c0.filas.slice(0, u).concat(extra, c0.filas.slice(u));
      c0.notas.push(T('Ejes con la F de Gollob (gl = g + e − 1 − 2k), contra el error.'));
      cuadros.push(c0);
      if (X.fr) cuadros.push({ id: 'fr', titulo: T('Prueba F_R de Cornelius: interacción que queda después de n ejes'),
        columnas: [col('n', T('Ejes ajustados'), 'entero'), col('sc', T('SC'), 'sig'), col('gl', T('gl'), 'entero'), col('cm', T('CM'), 'sig'), col('F', 'F_R', 'forma2'), col('p', 'p', 'pvalor')],
        filas: X.fr.n.map((n, i) => ({ n, sc: X.fr.sc[i], gl: X.fr.gl[i], cm: X.fr.cm[i], F: X.fr.F[i], p: X.fr.p[i] })),
        notas: [T('El número de ejes es el primer n cuyo residuo deja de ser significativo (más confiable que la F de Gollob).')] });
      const k2 = Math.min(m, 3);
      cuadros.push({ id: 'puntajes', titulo: T('Puntajes de los genotipos'), columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig')]
        .concat(Array.from({ length: k2 }, (_, k) => col('e' + k, T('EJE{k}', { k: k + 1 }), 'forma')), X.asv ? [col('asv', 'ASV', 'forma')] : []),
        filas: Gn.map((g, i) => Object.assign({ g, m: r.medias[i], asv: X.asv ? X.asv[i] : undefined }, ...Array.from({ length: k2 }, (_, k) => ({ ['e' + k]: X.genotipos[i][k] })))),
        notas: [T('Puntajes simétricos (vector singular × √valor singular); ASV de Purchase: menor, más estable.')] });
      cuadros.push({ id: 'puntajes_ambientes', titulo: T('Puntajes de los ambientes'), columnas: [col('a', T('Ambiente'), 'texto'), col('m', T('Media'), 'sig')]
        .concat(Array.from({ length: k2 }, (_, k) => col('e' + k, T('EJE{k}', { k: k + 1 }), 'forma'))),
        filas: An.map((n, j) => Object.assign({ a: n, m: r.medias_ambiente[j] }, ...Array.from({ length: k2 }, (_, k) => ({ ['e' + k]: X.ambientes[j][k] })))) });
      const Wa = r.waas, orden = Gn.map((_, i) => i).sort((x, y) => Wa.waasy[y] - Wa.waasy[x]), kE = Wa.genotipos.indexOf(Math.min(...Wa.genotipos));
      conclusiones.push(T('Por el WAAS ({k} {e}), el más estable es {g}; combinando respuesta y estabilidad (WAASY, {p} % a la respuesta), el mejor es {h}.',
        { k: Wa.ejes, e: Wa.ejes === 1 ? T('eje') : T('ejes'), g: Gn[kE], p: Wa.peso_respuesta, h: Gn[orden[0]] }));
      cuadros.push({ id: 'waas', titulo: T('WAAS y WAASY: estabilidad y respuesta juntas'),
        columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('w', 'WAAS', 'forma'), col('pr', T('Respuesta (0–100)'), 'forma2'), col('pw', T('Estabilidad (0–100)'), 'forma2'),
          col('wy', 'WAASY', 'forma2'), col('o', T('Orden'), 'entero')],
        filas: orden.map((i, k) => ({ g: Gn[i], m: r.medias[i], w: Wa.genotipos[i], pr: Wa.pct_respuesta[i], pw: Wa.pct_waas[i], wy: Wa.waasy[i], o: k + 1 })),
        notas: [T('WAAS: promedio de los puntajes absolutos en los primeros {k} ejes, ponderado por el % de la interacción de cada eje (Olivoto et al., 2019); menor, más estable. {c}', { k: Wa.ejes,
          c: { pedido: T('Ejes: los pedidos.'), gollob: T('Ejes: los significativos por la F de Gollob.'), todos: T('Sin error para probar los ejes, se usan todos.') }[Wa.criterio] }),
          T('WAASY = {a} % de la respuesta y {b} % de la estabilidad, cada una reescalada de 0 (la peor) a 100 (la mejor).', { a: Wa.peso_respuesta, b: 100 - Wa.peso_respuesta })] });
    }
    if (r.metodo === 'gge') {
      const Q = r.gge, megas = new Map();
      Q.ganador.forEach((w, j) => { if (!megas.has(w)) megas.set(w, []); megas.get(w).push(An[j]); });
      conclusiones.push(T('Los dos primeros ejes del biplot explican el {p} % de G + G × A (EJE1 {a} %, EJE2 {b} %).', { p: f2(Q.pct[0] + Q.pct[1]), a: f2(Q.pct[0]), b: f2(Q.pct[1]) }));
      conclusiones.push(megas.size > 1 ? T('Quién ganó dónde: {k} megaambientes; {l}.', { k: megas.size, l: [...megas].map(([w, e]) => T('{g} gana en {e}', { g: w, e: lista(e) })).join('; ') })
        : T('Quién ganó dónde: {g} gana en todos los ambientes.', { g: [...megas.keys()][0] }));
      const orden = Gn.map((_, i) => i).sort((x, y) => Q.proyeccion[y] - Q.proyeccion[x]);
      conclusiones.push(T('Media contra estabilidad: el mejor desempeño promedio es de {g}; entre los tres mejores, el más estable (menor distancia al eje del ambiente promedio) es {e}.',
        { g: Gn[orden[0]], e: Gn[orden.slice(0, 3).sort((x, y) => Q.perpendicular[x] - Q.perpendicular[y])[0]] }));
      cuadros.push({ id: 'valores', titulo: T('Valores singulares'), columnas: [col('k', T('Eje'), 'entero'), col('d', T('Valor singular'), 'sig'), col('p', T('% de G + G × A'), 'forma2')],
        filas: Q.valores.map((d, k) => ({ k: k + 1, d, p: Q.pct[k] })),
        notas: [T('Tabla centrada por ambiente{e}; partición {p}.', { e: r.escala === 'desviacion' ? T(' y dividida por su desviación estándar') : '', p: { simetrica: T('simétrica'), genotipo: T('por genotipo (compara genotipos)'), ambiente: T('por ambiente (compara ambientes)') }[r.particion] })] });
      cuadros.push({ id: 'ganadores', titulo: T('Quién ganó dónde'), columnas: [col('a', T('Ambiente'), 'texto'), col('g', T('Ganador en el biplot'), 'texto'), col('E1', 'EJE1', 'forma'), col('E2', 'EJE2', 'forma')],
        filas: An.map((n, j) => ({ a: n, g: Q.ganador[j], E1: Q.ambientes[j][0], E2: Q.ambientes[j][1] })),
        notas: [T('Ganador: el vértice del polígono con la mayor proyección sobre el vector del ambiente. Vértices: {v}.', { v: lista(Q.vertices) })] });
      cuadros.push({ id: 'media_estabilidad', titulo: T('Media contra estabilidad'), columnas: [col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('E1', 'EJE1', 'forma'), col('E2', 'EJE2', 'forma'),
        col('pr', T('Desempeño (proyección)'), 'forma'), col('pe', T('Inestabilidad (distancia al eje)'), 'forma')],
        filas: orden.map(i => ({ g: Gn[i], m: r.medias[i], E1: Q.genotipos[i][0], E2: Q.genotipos[i][1], pr: Q.proyeccion[i], pe: Q.perpendicular[i] })),
        notas: [T('Ordenados por su proyección sobre el eje del ambiente promedio (Yan y Kang, 2003){o}.', { o: r.objetivo === 'minimo' ? T('; con la menor respuesta como objetivo, la tabla se invirtió') : '' })] });
      const og = Gn.map((_, i) => i).sort((x, y) => Q.distancia_genotipos[x] - Q.distancia_genotipos[y]), oa = An.map((_, j) => j).sort((x, y) => Q.distancia_ambientes[x] - Q.distancia_ambientes[y]);
      conclusiones.push(T('El genotipo más cercano al ideal (alto y estable) es {g}; el ambiente más cercano al ideal (que mejor discrimina y representa a los demás) es {a}.', { g: Gn[og[0]], a: An[oa[0]] }));
      cuadros.push({ id: 'ideal', titulo: T('Distancia al genotipo ideal'), columnas: [col('o', T('Orden'), 'entero'), col('g', T('Genotipo'), 'texto'), col('m', T('Media'), 'sig'), col('d', T('Distancia al ideal'), 'forma')],
        filas: og.map((i, k) => ({ o: k + 1, g: Gn[i], m: r.medias[i], d: Q.distancia_genotipos[i] })),
        notas: [T('Genotipo ideal: el punto del eje del ambiente promedio, del lado positivo, a la distancia del vector de genotipo más largo (Yan y Tinker, 2006); conviene la partición por genotipo.')] });
      cuadros.push({ id: 'ambiente_ideal', titulo: T('Distancia al ambiente ideal'), columnas: [col('o', T('Orden'), 'entero'), col('a', T('Ambiente'), 'texto'), col('m', T('Media'), 'sig'), col('d', T('Distancia al ideal'), 'forma')],
        filas: oa.map((j, k) => ({ o: k + 1, a: An[j], m: r.medias_ambiente[j], d: Q.distancia_ambientes[j] })),
        notas: [T('Ambiente ideal: el punto del eje del ambiente promedio a la distancia del vector de ambiente más largo: discrimina mucho y representa a los demás; conviene la partición por ambiente.')] });
      if (Q.comparacion) {
        const C = Q.comparacion, s = r.objetivo === 'minimo' ? -1 : 1, gana = An.filter((_, j) => s * C.prevista[j] > 0), ganaObs = An.filter((_, j) => s * C.observada[j] > 0);
        conclusiones.push(T('{a} contra {b}: según el biplot, {a} es mejor en {l}; en los datos, en {o}.', { a: C.a, b: C.b, l: gana.length ? lista(gana) : T('ningún ambiente'), o: ganaObs.length ? lista(ganaObs) : T('ningún ambiente') }));
        cuadros.push({ id: 'comparacion_par', titulo: T('Comparación de {a} con {b}', { a: C.a, b: C.b }), columnas: [col('a', T('Ambiente'), 'texto'), col('p', T('Diferencia en el biplot'), 'sig'), col('o', T('Diferencia observada'), 'sig'), col('g', T('Mejor'), 'texto')],
          filas: An.map((n, j) => ({ a: n, p: C.prevista[j], o: C.observada[j], g: s * C.prevista[j] > 0 ? C.a : C.b })),
          notas: [T('Diferencia {a} − {b} que predicen los dos ejes del biplot, en las unidades de la respuesta, y la de las medias.', { a: C.a, b: C.b })] });
      }
    }
    if (im) cuadros.push({ id: 'imputadas', titulo: T('Celdas imputadas por EM-AMMI'), columnas: [col('g', T('Genotipo'), 'texto'), col('a', T('Ambiente'), 'texto'), col('v', T('Valor imputado'), 'sig')],
      filas: im.celdas.map(z => ({ g: z.genotipo, a: z.ambiente, v: z.valor })),
      notas: [T('EM-AMMI con {e} {x} (Gauch y Zobel, 1990): cada celda vacía toma el valor del modelo aditivo más los ejes de la interacción, hasta que deja de cambiar ({i} vueltas{c}).',
        { e: im.ejes, x: im.ejes === 1 ? T('eje') : T('ejes'), i: im.iteraciones, c: im.convergio ? '' : T('; no llegó a la tolerancia') })] });
    cuadros.push({ id: 'medias', titulo: T('Medias de los genotipos en cada ambiente'), columnas: [col('g', T('Genotipo'), 'texto')].concat(An.map((n, j) => col('a' + j, n, 'sig')), [col('m', T('Media'), 'sig')]),
      filas: Gn.map((g, i) => Object.assign({ g, m: r.medias[i] }, ...An.map((_, j) => ({ ['a' + j]: r.tabla[i][j] })))).concat([Object.assign({ g: T('Media'), m: r.media_general }, ...An.map((_, j) => ({ ['a' + j]: r.medias_ambiente[j] })))]),
      notas: [T('Medias aritméticas de las parcelas de cada celda (r = {r}).', { r: f2(r.r) })] });
    return { titulo, conclusiones: conclusiones.map(may), cuadros, semaforo };
  }

  /** Reporte del análisis en dos etapas. */
  function reporteDosEtapas(r, titulo) {
    const Gn = r.genotipos, An = r.ambientes_nombre, a = r.alfa, P = r.ambientes, X = r.estimados, W = r.wald, s = r.objetivo === 'minimo' ? -1 : 1;
    const conclusiones = [], cuadros = [], semaforo = [];
    const orden = Gn.map((_, i) => i).sort((x, y) => s * (X.media[y] - X.media[x]));
    conclusiones.push(W.p < a ? T('Los genotipos difieren en el conjunto de ambientes (Wald: F = {F} con {g1} y {g2} gl, p {p}).', { F: f2(W.F), g1: W.gl1, g2: W.gl2, p: fp(W.p) })
      : T('Los genotipos no difieren en el conjunto de ambientes (Wald: F = {F} con {g1} y {g2} gl, p {p}).', { F: f2(W.F), g1: W.gl1, g2: W.gl2, p: fp(W.p) }));
    conclusiones.push(T('{g} tiene la {o} media ajustada en el conjunto ({v} ± {e}).', { g: Gn[orden[0]], o: s > 0 ? T('mayor') : T('menor'), v: sig(X.media[orden[0]]), e: sig(X.ee[orden[0]]) }));
    conclusiones.push(r.sigma2_ga > 0 ? T('La interacción genotipo × ambiente, ya sin el error de cada ambiente, tiene varianza {v} (REML).', { v: sig(r.sigma2_ga) })
      : T('La varianza de la interacción genotipo × ambiente se estimó en cero: las diferencias entre ambientes las explica el error de cada uno.'));
    const razon = Math.max(...P.cme) / Math.min(...P.cme);
    semaforo.push({ nombre: T('Errores de los ambientes'), color: razon <= 3 ? 'verde' : 'ambar', texto: razon <= 3 ? T('Parecidos (razón máx./mín. {k}).', { k: f2(razon) })
      : T('Distintos (razón máx./mín. {k}): por eso conviene ponderar cada media por su varianza, como aquí.', { k: f2(razon) }) });
    const incompletos = P.genotipos.filter(k => k < Gn.length).length;
    if (incompletos) conclusiones.push(T('{k} {a} no tienen todos los genotipos; el análisis usa las {c} medias que hay.', { k: incompletos, a: incompletos === 1 ? T('ambiente') : T('ambientes'), c: r.celdas }));
    cuadros.push({ id: 'etapa1', titulo: T('Primera etapa: cada ambiente'), columnas: [col('a', T('Ambiente'), 'texto'), col('m', T('Media'), 'sig'), col('cme', T('CME'), 'sig'), col('gl', T('gl'), 'entero'),
      col('cv', T('CV (%)'), 'forma2'), col('k', T('Genotipos'), 'entero')],
      filas: An.map((n, j) => ({ a: n, m: P.media[j], cme: P.cme[j], gl: P.gl[j], cv: P.cv[j], k: P.genotipos[j] })),
      notas: [T('En cada ambiente, {m}; de ahí, la media ajustada de cada genotipo y su varianza (EE²).', { m: r.repeticion ? 'y ~ ' + T('repetición') + ' + ' + T('genotipo') : 'y ~ ' + T('genotipo') })] });
    cuadros.push({ id: 'genotipos', titulo: T('Segunda etapa: medias ajustadas de los genotipos'), columnas: [col('o', T('Orden'), 'entero'), col('g', T('Genotipo'), 'texto'), col('m', T('Media ajustada'), 'sig'),
      col('ee', T('EE'), 'sig'), col('sm', T('Media simple'), 'sig')],
      filas: orden.map((i, k) => ({ o: k + 1, g: Gn[i], m: X.media[i], ee: X.ee[i], sm: X.simple[i] })),
      notas: [T('Mínimos cuadrados generalizados con pesos 1/(σ²_GA + v_ij): cada media de la primera etapa pesa según su precisión. Media ajustada: promedio igual de los ambientes. Media simple: el promedio de las medias de los ambientes (solo con el genotipo en todos).')] });
    cuadros.push({ id: 'wald', titulo: T('Prueba de los genotipos'), columnas: [col('f', T('Fuente'), 'texto'), col('w', 'Wald', 'forma2'), col('g1', T('gl num.'), 'entero'), col('g2', T('gl den.'), 'entero'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: [{ f: T('Genotipos'), w: W.W, g1: W.gl1, g2: W.gl2, F: W.F, p: W.p }],
      notas: [T('F = Wald/(g − 1); gl del denominador: celdas − parámetros. σ²_GA = {v} por REML con la varianza de cada media fija (Smith et al., 2001; Piepho et al., 2012).', { v: sig(r.sigma2_ga) })] });
    return { titulo, conclusiones: conclusiones.map(may), cuadros, semaforo };
  }
  function codigoR(id) {
    return (e, op, ctx) => {
      const res = ctx && ctx.resultado, im = res && res.imputacion, faltan = im ? im.celdas.length : 0;
      const L = ['# ' + NOMBRE[id] + ' (código R equivalente a SigmaPro' + (id === 'dos-etapas' ? '; emmeans y metafor' : id === 'estabilidad' ? '; Kang con agricolae' : im ? '; la imputación con metan' : '; solo R base') + ')',
        `d <- data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], gen = factor(datos[[${JSON.stringify(e.genotipo)}]]), amb = factor(datos[[${JSON.stringify(e.ambiente)}]])${e.repeticion ? `, rep = factor(datos[[${JSON.stringify(e.repeticion)}]])` : ''})`,
        'd <- na.omit(d)'];
      if (id === 'dos-etapas') {
        L.push('# etapa 1: en cada ambiente, la media ajustada de cada genotipo y su varianza',
          `e1 <- do.call(rbind, lapply(levels(d$amb), function(a) { m <- lm(y ~ ${e.repeticion ? 'rep + ' : ''}gen, data = droplevels(subset(d, amb == a)))`,
          '  em <- as.data.frame(emmeans::emmeans(m, "gen")); data.frame(amb = a, gen = em$gen, media = em$emmean, v = em$SE^2) }))',
          'e1$gen <- factor(e1$gen, levels = levels(d$gen)); e1$amb <- factor(e1$amb)',
          '# etapa 2: G × A aleatoria y la varianza de cada media fija (el modelo de metafor: varianzas conocidas)',
          'm2 <- metafor::rma(yi = media, vi = v, mods = ~ gen + amb, data = e1, method = "REML", control = list(threshold = 1e-10))',
          'm2$tau2   # varianza de G × A',
          'G <- nlevels(e1$gen); E <- nlevels(e1$amb); L <- cbind(1, rbind(0, diag(G - 1)), matrix(1 / E, G, E - 1))',
          'cbind(media = drop(L %*% coef(m2)), ee = sqrt(diag(L %*% vcov(m2) %*% t(L))))   # medias ajustadas en el conjunto',
          'W <- anova(m2, btt = 2:G)$QM   # Wald (QM) de los genotipos',
          'c(Wald = W, F = W / (G - 1), p = pf(W / (G - 1), G - 1, nrow(e1) - length(coef(m2)), lower.tail = FALSE))   # prueba de los genotipos (gl: celdas − parámetros)');
        return L.join('\n');
      }
      L.push('Y <- tapply(d$y, list(d$gen, d$amb), mean)   # medias genotipo × ambiente');
      if (im) L.push(`Y <- metan::impute_missing_val(Y, naxis = ${im.ejes}, algorithm = "EM-AMMI", tol = 1e-12, max_iter = 10000, verbose = FALSE)$.data   # EM-AMMI (${faltan} ${faltan === 1 ? 'celda vacía' : 'celdas vacías'})`);
      L.push('r <- 1 / mean(1 / tapply(d$y, list(d$gen, d$amb), length), na.rm = TRUE)',
        `cme <- sapply(levels(d$amb), function(a) { m <- lm(y ~ ${e.repeticion ? 'rep + ' : ''}gen, data = droplevels(subset(d, amb == a))); c(deviance(m), df.residual(m)) })`,
        'gle <- sum(cme[2, ]); cme <- sum(cme[1, ]) / gle   # error combinado');
      if (id === 'ensayos-multiambiente') L.push(`anova(lm(y ~ amb${e.repeticion ? ' + amb:rep' : ''} + gen + gen:amb, data = d))   # conjunto (ambientes contra ${e.repeticion ? 'amb:rep' : 'el error'})`);
      if (id === 'estabilidad') {
        L.push('I <- colMeans(Y) - mean(Y)   # índice ambiental',
          `t(apply(Y, 1, function(v) { m <- lm(v ~ I); c(b = coef(m)[[2]], S2d = deviance(m) / (length(v) - 2) - cme / r) }))   # Eberhart y Russell`,
          'Z <- Y - outer(rowMeans(Y), colMeans(Y), "+") + mean(Y); W <- r * rowSums(Z^2); W   # ecovalencia de Wricke',
          'g <- nrow(Y); e <- ncol(Y); (g * (g - 1) * W - sum(W)) / ((g - 1) * (g - 2) * (e - 1)) / r   # varianza de Shukla (escala de medias)',
          `rowSums(sweep(Y, 2, apply(Y, 2, ${op.objetivo === 'minimo' ? 'min' : 'max'}))^2) / (2 * ncol(Y))   # Lin y Binns`,
          `Rc <- apply(${op.objetivo === 'minimo' ? '-(Y - rowMeans(Y) + mean(Y))' : 'Y - rowMeans(Y) + mean(Y)'}, 2, rank); Ry <- apply(${op.objetivo === 'minimo' ? '-Y' : 'Y'}, 2, rank)   # rangos de Huehn`,
          'cbind(S1 = apply(Rc, 1, function(v) mean(abs(outer(v, v, "-"))[upper.tri(diag(length(v)))])), S2 = apply(Rc, 1, var),',
          '      S3 = rowSums((Ry - rowMeans(Ry))^2) / rowMeans(Ry), S6 = rowSums(abs(Ry - rowMeans(Ry))) / rowMeans(Ry))');
        if (res ? res.kang : true) L.push(`agricolae::stability.par(${op.objetivo === 'minimo' ? '-Y' : 'Y'}, rep = r, MSerror = cme)$stability   # YS de Kang`);
        if (op.objetivo !== 'minimo') L.push(`P <- sweep(Y, 2, colMeans(Y), "/") * 100; rowMeans(P) - qnorm(1 - ${op.probAnnicchiarico || 0.25}) * apply(P, 1, sd)   # Wi de Annicchiarico`);
      }
      if (id === 'ammi') {
        L.push('Z <- Y - outer(rowMeans(Y), colMeans(Y), "+") + mean(Y)   # interacción', 's <- svd(Z); g <- nrow(Y); e <- ncol(Y); k <- seq_len(min(g, e) - 1)',
          'sc <- r * s$d[k]^2; gl <- g + e - 1 - 2 * k; F <- sc / gl / cme; cbind(sc, gl, F, p = pf(F, gl, gle, lower.tail = FALSE))   # Gollob',
          `scr <- r * sum(Z^2) - c(0, cumsum(sc))[k]; glr <- (g - k) * (e - k)${faltan ? ' - ' + faltan : ''}; cbind(scr, glr, FR = scr / glr / cme)   # F_R de Cornelius`,
          'G <- s$u[, 1:2] %*% diag(sqrt(s$d[1:2])); sqrt((sc[1] / sc[2] * G[, 1])^2 + G[, 2]^2)   # ASV (los signos de los ejes son arbitrarios)');
        const kw = res && res.waas ? res.waas.ejes : 'sum(p < 0.05)', pr = res && res.waas ? res.waas.peso_respuesta : (op.pesoRespuesta === undefined ? 50 : op.pesoRespuesta);
        L.push(`kw <- ${kw}; pe <- 100 * s$d^2 / sum(s$d^2); Gs <- s$u %*% diag(sqrt(s$d))`,
          'WAAS <- apply(abs(Gs[, 1:kw, drop = FALSE]), 1, weighted.mean, w = pe[1:kw])   # WAAS',
          `y0 <- rowMeans(Y); PR <- ${op.objetivo === 'minimo' ? '100 * (max(y0) - y0)' : '100 * (y0 - min(y0))'} / diff(range(y0)); PW <- 100 * (max(WAAS) - WAAS) / diff(range(WAAS))`,
          `cbind(WAAS, WAASY = (PR * ${pr} + PW * ${100 - pr}) / 100)`);
      }
      if (id === 'gge') {
        const f = { simetrica: 0.5, genotipo: 1, ambiente: 0 }[op.particion || 'simetrica'];
        L.push(`Z <- ${op.objetivo === 'minimo' ? '-' : ''}sweep(Y, 2, colMeans(Y))${op.escala === 'desviacion' ? '; Z <- sweep(Z, 2, apply(Y, 2, sd), "/")' : ''}   # centrada por ambiente`,
          's <- svd(Z); 100 * s$d^2 / sum(s$d^2)   # % de G + G × A',
          `G <- s$u[, 1:2] %*% diag(s$d[1:2]^${f}); E <- s$v[, 1:2] %*% diag(s$d[1:2]^${1 - f}); rownames(G) <- rownames(Y)`,
          'rownames(Y)[apply(G %*% t(E), 2, which.max)]   # quién ganó dónde', 'rownames(Y)[chull(G)]   # vértices del polígono',
          'u <- colMeans(E) / sqrt(sum(colMeans(E)^2))   # eje del ambiente promedio',
          'sort(setNames(sqrt(rowSums(sweep(G, 2, max(sqrt(rowSums(G^2))) * u)^2)), rownames(Y)))   # distancia al genotipo ideal',
          'sort(setNames(sqrt(rowSums(sweep(E, 2, max(sqrt(rowSums(E^2))) * u)^2)), colnames(Y)))   # distancia al ambiente ideal');
        if (op.genotipoA && op.genotipoB) L.push(`drop((G[${JSON.stringify(op.genotipoA)}, ] - G[${JSON.stringify(op.genotipoB)}, ]) %*% t(E))${op.escala === 'desviacion' ? ' * apply(Y, 2, sd)' : ''}${op.objetivo === 'minimo' ? ' * -1' : ''}   # ${op.genotipoA} − ${op.genotipoB} según el biplot`,
          `Y[${JSON.stringify(op.genotipoA)}, ] - Y[${JSON.stringify(op.genotipoB)}, ]   # observada`);
      }
      return L.join('\n');
    };
  }

  const ENT = { respuesta: { tipo: 'numerica' }, genotipo: { tipo: 'factor' }, ambiente: { tipo: 'factor' }, repeticion: { tipo: 'factor', opcional: true } };
  const OB = { objetivo: { tipo: 'texto', omision: 'maximo' } }, AL = { alfa: { tipo: 'numero', omision: 0.05 } };
  const IM = { imputar: { tipo: 'logico', omision: true }, ejesImputar: { tipo: 'numero', omision: 1 } };
  SP.metodosMultiambiente = { NOMBRE, reporte };
  SP.metodo({ id: 'ensayos-multiambiente', familia: 'multiambiente', motor: 'js', orden: 10, nombre: T('Análisis conjunto de varios ambientes'),
    resumen: T('Genotipos en varias localidades o años: ANOVA conjunto, interacción G × A, cada ambiente y la homogeneidad de sus errores.'),
    entradas: ENT, opciones: Object.assign({}, OB, AL, IM), validar: validar('ensayos-multiambiente'), calcular: calcular('ensayos-multiambiente'), reporte, codigoR: codigoR('ensayos-multiambiente') });
  SP.metodo({ id: 'dos-etapas', familia: 'multiambiente', motor: 'js', orden: 15, nombre: T('Análisis en dos etapas (una varianza por ambiente)'),
    resumen: T('Medias ajustadas de cada ambiente con su varianza y el análisis conjunto ponderado: sirve con errores distintos entre ambientes y con genotipos que faltan.'),
    entradas: ENT, opciones: Object.assign({}, OB, AL), validar: validar('dos-etapas'), calcular: calcular('dos-etapas'), reporte, codigoR: codigoR('dos-etapas') });
  SP.metodo({ id: 'estabilidad', familia: 'multiambiente', motor: 'js', orden: 20, nombre: T('Estabilidad (Eberhart-Russell, Wricke, Shukla, Huehn, Kang, Annicchiarico)'),
    resumen: T('Regresión sobre el índice ambiental (b y S²d), ecovalencia de Wricke, varianza de Shukla, superioridad de Lin y Binns, rangos de Huehn, YS de Kang e índice de Annicchiarico.'),
    entradas: ENT, opciones: Object.assign({ eeb: { tipo: 'texto', omision: 'propio' }, probAnnicchiarico: { tipo: 'numero', omision: 0.25 } }, OB, AL, IM), validar: validar('estabilidad'), calcular: calcular('estabilidad'), reporte, codigoR: codigoR('estabilidad') });
  SP.metodo({ id: 'ammi', familia: 'multiambiente', motor: 'js', orden: 30, nombre: T('AMMI (efectos principales aditivos e interacción multiplicativa)'),
    resumen: T('Ejes de la interacción con las pruebas de Gollob y Cornelius, puntajes, ASV, WAAS y WAASY, y biplots AMMI1 y AMMI2.'),
    entradas: ENT, opciones: Object.assign({ ejesWaas: { tipo: 'numero', omision: 0 }, pesoRespuesta: { tipo: 'numero', omision: 50 } }, OB, AL, IM), validar: validar('ammi'), calcular: calcular('ammi'), reporte, codigoR: codigoR('ammi') });
  SP.metodo({ id: 'gge', familia: 'multiambiente', motor: 'js', orden: 40, nombre: T('Biplot GGE'),
    resumen: T('Quién ganó dónde (megaambientes), media contra estabilidad, genotipo y ambiente ideales y la comparación de dos genotipos.'),
    entradas: ENT, opciones: Object.assign({ escala: { tipo: 'texto', omision: 'ninguna' }, particion: { tipo: 'texto', omision: 'simetrica' }, genotipoA: { tipo: 'texto', omision: '' }, genotipoB: { tipo: 'texto', omision: '' } }, OB, AL, IM),
    validar: validar('gge'), calcular: calcular('gge'), reporte, codigoR: codigoR('gge') });
});

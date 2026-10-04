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
  const NOMBRE = { 'ensayos-multiambiente': T('Ensayo en varios ambientes'), estabilidad: T('Estabilidad'), ammi: 'AMMI', gge: T('Biplot GGE') };

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
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e), G = d.genos.length, E = d.ambs.length;
      exigir(G >= 3, T('Hacen falta al menos 3 genotipos.'));
      exigir(E >= (id === 'gge' ? 2 : 3), T('Hacen falta al menos {k} ambientes.', { k: id === 'gge' ? 2 : 3 }));
      const p = M().preparar(d);
      const r = Object.assign({ tipo: 'multiambiente', metodo: id, respuesta: e.respuesta, genotipo: e.genotipo, ambiente: e.ambiente, repeticion: e.repeticion || '',
        genotipos: d.genos, ambientes_nombre: d.ambs, tabla: p.Y, r: p.r, cme: p.cme, gle: p.gle, anova: p.anova, alfa: op.alfa || 0.05, objetivo: op.objetivo || 'maximo',
        n: d.y.length, excluidas: tabla.n - d.y.length }, p.ambientes ? { ambientes: p.ambientes } : {}, p.bartlett ? { bartlett: p.bartlett } : {}, p.genotipos_vs_ga ? { genotipos_vs_ga: p.genotipos_vs_ga } : {});
      const A = M().aditiva(p.Y);
      Object.assign(r, { medias: A.gm, medias_ambiente: A.em, media_general: A.gran });
      if (id === 'estabilidad') Object.assign(r, M().estabilidad(p.Y, { r: p.r, cme: p.cme, gle: p.gle, eeb: op.eeb, objetivo: r.objetivo }), { eeb: op.eeb });
      if (id === 'ammi') r.ammi = M().ammi(p.Y, { r: p.r, cme: p.cme, gle: p.gle, alfa: r.alfa });
      if (id === 'gge') {
        const q = M().gge(p.Y, op);
        r.gge = Object.assign(q, { ganador: q.ganador.map(i => d.genos[i]), indices_vertices: q.vertices, vertices: q.vertices.map(i => d.genos[i]).sort() });
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
    const conclusiones = [], cuadros = [], semaforo = [], Gn = r.genotipos, An = r.ambientes_nombre, a = r.alfa, kM = mejorPorMedia(r);
    const titulo = { 'ensayos-multiambiente': T('Análisis conjunto de ensayos en varios ambientes'), estabilidad: T('Estabilidad de los genotipos'), ammi: T('Modelo AMMI'), gge: T('Biplot GGE') }[r.metodo];
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
        notas: [T('Ordenados por su proyección sobre el eje del ambiente promedio (Yan 2001){o}.', { o: r.objetivo === 'minimo' ? T('; con la menor respuesta como objetivo, la tabla se invirtió') : '' })] });
    }
    cuadros.push({ id: 'medias', titulo: T('Medias de los genotipos en cada ambiente'), columnas: [col('g', T('Genotipo'), 'texto')].concat(An.map((n, j) => col('a' + j, n, 'sig')), [col('m', T('Media'), 'sig')]),
      filas: Gn.map((g, i) => Object.assign({ g, m: r.medias[i] }, ...An.map((_, j) => ({ ['a' + j]: r.tabla[i][j] })))).concat([Object.assign({ g: T('Media'), m: r.media_general }, ...An.map((_, j) => ({ ['a' + j]: r.medias_ambiente[j] })))]),
      notas: [T('Medias aritméticas de las parcelas de cada celda (r = {r}).', { r: f2(r.r) })] });
    return { titulo, conclusiones: conclusiones.map(may), cuadros, semaforo };
  }

  function codigoR(id) {
    return (e, op) => {
      const L = ['# ' + NOMBRE[id] + ' (código R equivalente a SigmaPro; solo R base)',
        `d <- data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], gen = factor(datos[[${JSON.stringify(e.genotipo)}]]), amb = factor(datos[[${JSON.stringify(e.ambiente)}]])${e.repeticion ? `, rep = factor(datos[[${JSON.stringify(e.repeticion)}]])` : ''})`,
        'd <- na.omit(d)',
        'Y <- tapply(d$y, list(d$gen, d$amb), mean)   # medias genotipo × ambiente',
        'r <- 1 / mean(1 / tapply(d$y, list(d$gen, d$amb), length))',
        `cme <- sapply(levels(d$amb), function(a) { m <- lm(y ~ ${e.repeticion ? 'rep + ' : ''}gen, data = droplevels(subset(d, amb == a))); c(deviance(m), df.residual(m)) })`,
        'gle <- sum(cme[2, ]); cme <- sum(cme[1, ]) / gle   # error combinado'];
      if (id === 'ensayos-multiambiente') L.push(`anova(lm(y ~ amb${e.repeticion ? ' + amb:rep' : ''} + gen + gen:amb, data = d))   # conjunto (ambientes contra ${e.repeticion ? 'amb:rep' : 'el error'})`);
      if (id === 'estabilidad') L.push('I <- colMeans(Y) - mean(Y)   # índice ambiental',
        `t(apply(Y, 1, function(v) { m <- lm(v ~ I); c(b = coef(m)[[2]], S2d = deviance(m) / (length(v) - 2) - cme / r) }))   # Eberhart y Russell`,
        'Z <- Y - outer(rowMeans(Y), colMeans(Y), "+") + mean(Y); W <- r * rowSums(Z^2); W   # ecovalencia de Wricke',
        'g <- nrow(Y); e <- ncol(Y); (g * (g - 1) * W - sum(W)) / ((g - 1) * (g - 2) * (e - 1)) / r   # varianza de Shukla (escala de medias)',
        `rowSums(sweep(Y, 2, apply(Y, 2, ${op.objetivo === 'minimo' ? 'min' : 'max'}))^2) / (2 * ncol(Y))   # Lin y Binns`);
      if (id === 'ammi') L.push('Z <- Y - outer(rowMeans(Y), colMeans(Y), "+") + mean(Y)   # interacción', 's <- svd(Z); g <- nrow(Y); e <- ncol(Y); k <- seq_len(min(g, e) - 1)',
        'sc <- r * s$d[k]^2; gl <- g + e - 1 - 2 * k; F <- sc / gl / cme; cbind(sc, gl, F, p = pf(F, gl, gle, lower.tail = FALSE))   # Gollob',
        'scr <- r * sum(Z^2) - c(0, cumsum(sc))[k]; glr <- (g - k) * (e - k); cbind(scr, glr, FR = scr / glr / cme)   # F_R de Cornelius',
        'G <- s$u[, 1:2] %*% diag(sqrt(s$d[1:2])); sqrt((sc[1] / sc[2] * G[, 1])^2 + G[, 2]^2)   # ASV (los signos de los ejes son arbitrarios)');
      if (id === 'gge') {
        const f = { simetrica: 0.5, genotipo: 1, ambiente: 0 }[op.particion || 'simetrica'];
        L.push(`Z <- ${op.objetivo === 'minimo' ? '-' : ''}sweep(Y, 2, colMeans(Y))${op.escala === 'desviacion' ? '; Z <- sweep(Z, 2, apply(Y, 2, sd), "/")' : ''}   # centrada por ambiente`,
          's <- svd(Z); 100 * s$d^2 / sum(s$d^2)   # % de G + G × A',
          `G <- s$u[, 1:2] %*% diag(s$d[1:2]^${f}); E <- s$v[, 1:2] %*% diag(s$d[1:2]^${1 - f})`,
          'rownames(Y)[apply(G %*% t(E), 2, which.max)]   # quién ganó dónde', 'rownames(Y)[chull(G)]   # vértices del polígono');
      }
      return L.join('\n');
    };
  }

  const ENT = { respuesta: { tipo: 'numerica' }, genotipo: { tipo: 'factor' }, ambiente: { tipo: 'factor' }, repeticion: { tipo: 'factor', opcional: true } };
  const OB = { objetivo: { tipo: 'texto', omision: 'maximo' } }, AL = { alfa: { tipo: 'numero', omision: 0.05 } };
  SP.metodosMultiambiente = { NOMBRE, reporte };
  SP.metodo({ id: 'ensayos-multiambiente', familia: 'multiambiente', motor: 'js', orden: 10, nombre: T('Análisis conjunto de varios ambientes'),
    resumen: T('Genotipos en varias localidades o años: ANOVA conjunto, interacción G × A, cada ambiente y la homogeneidad de sus errores.'),
    entradas: ENT, opciones: Object.assign({}, OB, AL), validar: validar('ensayos-multiambiente'), calcular: calcular('ensayos-multiambiente'), reporte, codigoR: codigoR('ensayos-multiambiente') });
  SP.metodo({ id: 'estabilidad', familia: 'multiambiente', motor: 'js', orden: 20, nombre: T('Estabilidad (Eberhart-Russell, Wricke, Shukla)'),
    resumen: T('Regresión sobre el índice ambiental (b y S²d), ecovalencia de Wricke, varianza de Shukla y superioridad de Lin y Binns.'),
    entradas: ENT, opciones: Object.assign({ eeb: { tipo: 'texto', omision: 'propio' } }, OB, AL), validar: validar('estabilidad'), calcular: calcular('estabilidad'), reporte, codigoR: codigoR('estabilidad') });
  SP.metodo({ id: 'ammi', familia: 'multiambiente', motor: 'js', orden: 30, nombre: T('AMMI (efectos principales aditivos e interacción multiplicativa)'),
    resumen: T('Ejes de la interacción con las pruebas de Gollob y Cornelius, puntajes, ASV y biplots AMMI1 y AMMI2.'),
    entradas: ENT, opciones: Object.assign({}, OB, AL), validar: validar('ammi'), calcular: calcular('ammi'), reporte, codigoR: codigoR('ammi') });
  SP.metodo({ id: 'gge', familia: 'multiambiente', motor: 'js', orden: 40, nombre: T('Biplot GGE'),
    resumen: T('Quién ganó dónde (megaambientes) y media contra estabilidad, con la tabla centrada por ambiente.'),
    entradas: ENT, opciones: Object.assign({ escala: { tipo: 'texto', omision: 'ninguna' }, particion: { tipo: 'texto', omision: 'simetrica' } }, OB, AL),
    validar: validar('gge'), calcular: calcular('gge'), reporte, codigoR: codigoR('gge') });
});

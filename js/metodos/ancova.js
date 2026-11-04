/* SigmaPro — análisis de covarianza (ANCOVA) en diseños completamente al azar y en bloques completos al azar.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Modelo: y ~ [bloque +] covariables + tratamientos (hasta dos factores cruzados), con una pendiente común por
   covariable. Da:
     - el ANOVA con SC tipo I (los tratamientos ajustados por bloques y covariables), II o III (car::Anova);
     - las pendientes comunes con su IC;
     - homogeneidad de pendientes: F que compara el modelo con una pendiente por tratamiento (anova(m0, m1));
     - independencia de la covariable: F de los tratamientos sobre la covariable (no debe depender de ellos);
     - medias ajustadas (la covariable en su media, como emmeans) con sus comparaciones y letras;
     - eficiencia relativa de la covarianza (Cochran y Cox, 1957), con una covariable:
         CM efectivo = CM error ajustado · (1 + CMtrat(x) / SCerror(x)),  ER = CM error sin covariable / CM efectivo. */
SP.definir('ancova', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);
  Object.assign(SP.nombresFunciones, { 'ancova.analizarDe': 'ANCOVA: ANOVA, pendientes, homogeneidad, medias ajustadas y eficiencia' });

  /** Tabla con la respuesta y las covariables (numéricas) y los factores del diseño. */
  function tablaAncova(tabla, e) {
    const cols = {}, nombres = [];
    const agrega = (nom, fac) => { if (!nom || cols[nom]) return; cols[nom] = fac ? SP.estructura.comoFactor(tabla, nom) : tabla.col(nom); nombres.push(nom); };
    agrega(e.respuesta, false);
    lista(e.covariables).forEach(c => agrega(c, false));
    if (e.bloque) agrega(e.bloque, true);
    lista(e.tratamientos).forEach(f => agrega(f, true));
    return { n: tabla.n, nombres, columnas: cols, col(n) { const c = cols[n]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: n })); return c; } };
  }
  const tratTerm = trs => trs.map(q).join(' * ');
  const formulaDe = (e, y) => `${q(y || e.respuesta)} ~ ${e.bloque ? q(e.bloque) + ' + ' : ''}${lista(e.covariables).map(q).join(' + ')} + ${tratTerm(lista(e.tratamientos))}`;
  /** Términos de interacción de una covariable con todos los términos de tratamiento: c:A + c:B + c:A:B. */
  function interaccionesCov(c, trs) {
    const ts = trs.length === 1 ? [[trs[0]]] : [[trs[0]], [trs[1]], [trs[0], trs[1]]];
    return ts.map(t => [c, ...t].map(q).join(':'));
  }
  /** F de comparar dos modelos anidados ajustados sobre las mismas filas (como anova(m0, m1)). */
  function compara(a0, a1) {
    const gl1 = a0.glResidual - a1.glResidual, gl2 = a1.glResidual;
    if (gl1 < 1 || gl2 < 1) return null;
    /* una diferencia negativa solo puede ser redondeo (los modelos están anidados): es cero */
    const sc = Math.max(0, a0.scResidual - a1.scResidual), F = (sc / gl1) / (a1.scResidual / gl2);
    return { F, gl1, gl2, p: D().pf(F, gl1, gl2, false), sc };
  }

  function analizar(tabla, e, op) {
    op = Object.assign({ tipoSC: 3, metodo: 'tukey', alfa: 0.05, nivel: 0.95 }, op || {});
    const t = tablaAncova(tabla, e), covs = lista(e.covariables), trs = lista(e.tratamientos), avisos = [];
    const formula = formulaDe(e);
    let tipo = Number(op.tipoSC) || 3, tablaA;
    try { tablaA = SP.lineal.anova(t, formula, { tipo }); }
    catch (err) {
      if (tipo !== 3) throw err;
      tipo = 2; tablaA = SP.lineal.anova(t, formula, { tipo });
      avisos.push(T('Las sumas de cuadrados tipo III no existen con celdas vacías; se usaron las de tipo II.'));
    }
    const a = SP.lineal.ajustar(t, formula), mm = a.modelo, n = mm.n, filas = Array.from(mm.filas);
    /* cada covariable debe aportar un grado de libertad propio: si es constante dentro de los bloques o los tratamientos,
       queda confundida con ellos (y R deja sin estimar algún coeficiente) */
    const base = e.bloque ? q(e.bloque) : '1';
    const sinCov = SP.lineal.ajustar(t, `${q(e.respuesta)} ~ ${base} + ${tratTerm(trs)}`, { filas });
    exigir(a.rango === sinCov.rango + covs.length, T('La covariable está confundida con los bloques o los tratamientos (es constante dentro de ellos, o una es combinación de la otra): no se puede ajustar.'),
      T('Una covariable debe variar entre las parcelas de un mismo tratamiento.'));
    const res = SP.lineal.resumen(a), cme = a.scResidual / a.glResidual;
    const idx = tablaA.fuente.map((_, k) => k).filter(k => tablaA.fuente[k] !== '(Intercepto)');
    const anova = { fuente: idx.map(k => tablaA.fuente[k]), gl: idx.map(k => tablaA.gl[k]), sc: idx.map(k => tablaA.sc[k]), cm: idx.map(k => tablaA.cm[k]), F: idx.map(k => tablaA.F[k]), p: idx.map(k => tablaA.p[k]) };
    /* pendientes comunes */
    const cq = D().qt(1 - (1 - op.nivel) / 2, a.glResidual);
    const pendientes = covs.map(c => {
      const j = mm.columnas.indexOf(c), b = res.coeficientes.estimado[j], ee = res.coeficientes.ee[j];
      return { covariable: c, estimado: b, ee, t: res.coeficientes.t[j], p: res.coeficientes.p[j], ic: [b - cq * ee, b + cq * ee] };
    });
    /* homogeneidad de pendientes: una pendiente por tratamiento, covariable por covariable */
    const homogeneidad = covs.map(c => {
      const a1 = SP.lineal.ajustar(t, formula + ' + ' + interaccionesCov(c, trs).join(' + '), { filas });
      return Object.assign({ covariable: c }, compara(a, a1) || { F: NaN, gl1: 0, gl2: NaN, p: NaN });
    });
    /* la covariable no debe depender de los tratamientos; la misma comparación da T_xx y E_xx */
    const independencia = covs.map(c => {
      const x0 = SP.lineal.ajustar(t, `${q(c)} ~ ${base}`, { filas }), x1 = SP.lineal.ajustar(t, `${q(c)} ~ ${base} + ${tratTerm(trs)}`, { filas });
      const r = compara(x0, x1) || { F: NaN, gl1: 0, gl2: NaN, p: NaN, sc: NaN };
      return Object.assign({ covariable: c, sc_trat: r.sc, sc_error: x1.scResidual }, r);
    });
    /* ANOVA sin covariable sobre las mismas filas */
    const cmeSin = sinCov.scResidual / sinCov.glResidual;
    let eficiencia = null;
    if (covs.length === 1) {
      const ind = independencia[0], cmEf = cme * (1 + (ind.sc_trat / ind.gl1) / ind.sc_error);
      eficiencia = { cm_sin: cmeSin, cm_efectivo: cmEf, relativa: 100 * cmeSin / cmEf };
    }
    /* medias ajustadas y comparaciones */
    const M = SP.comp.modeloLineal(t, a);
    const medias = trs.map(f => ({ factor: f, filas: SP.comp.medias(M, [f], [], op.nivel)[0].filas }));
    const comparaciones = op.metodo === 'ninguna' ? [] : trs.map(f => Object.assign({ factor: f }, SP.comp.pares(M, [f], [], op.metodo, op.alfa)[0]));
    const y = mm.y;
    let my = 0; for (let i = 0; i < n; i++) my += y[i]; my /= n;
    let sct = 0; for (let i = 0; i < n; i++) sct += (y[i] - my) ** 2;
    const out = {
      tipo: 'ancova', respuesta: e.respuesta, covariables: covs, tratamientos: trs, bloque: e.bloque || null, formula, tipoSC: tipo, alfa: op.alfa, nivel: op.nivel, metodo: op.metodo,
      n, excluidas: tabla.n - n, anova, total: { gl: n - 1, sc: sct }, pendientes, homogeneidad, independencia, eficiencia, medias, comparaciones,
      resumen: { media: my, cme, gl: a.glResidual, cv: 100 * sqrt(cme) / my, r2: 1 - a.scResidual / sct, cme_sin: cmeSin }, avisos,
    };
    if (trs.length === 2) {
      out.celdas = SP.comp.medias(M, trs, [], op.nivel)[0].filas;
      const k = anova.fuente.indexOf(trs.join(':'));
      if (k >= 0 && anova.p[k] < op.alfa && op.metodo !== 'ninguna') out.dentro = SP.comp.pares(M, [trs[0]], [trs[1]], op.metodo, op.alfa);
    }
    /* medias sin ajustar de la respuesta y de las covariables */
    out.crudas = trs.map(f => {
      const c = t.col(f), niv = mm.niveles[f];
      return { factor: f, filas: niv.map(l => {
        const k = c.niveles.indexOf(l), sel = filas.filter(i => c.codigos[i] === k);
        const prom = col => sel.reduce((s, i) => s + t.col(col).valores[i], 0) / sel.length;
        return { nivel: l, n: sel.length, media: prom(e.respuesta), covariables: covs.map(prom) };
      }) };
    });
    /* gráfica: la respuesta contra la primera covariable, con una recta paralela por tratamiento */
    const c0 = covs[0], xs = t.col(c0).valores, ys = t.col(e.respuesta).valores, fs = trs.map(f => t.col(f));
    /* el grupo de cada fila se calcula una vez (con 100 000 filas, armar la etiqueta por fila y por grupo es lento) */
    const grupos = [], gi = new Map(), grupoDe = new Int32Array(n), x0 = [], x1 = [];
    filas.forEach((i, r) => {
      let clave = 0;
      for (const c of fs) clave = clave * (c.niveles.length + 1) + c.codigos[i];
      let k = gi.get(clave);
      if (k === undefined) { k = grupos.length; gi.set(clave, k); grupos.push(fs.map(c => c.niveles[c.codigos[i]]).join(' · ')); x0.push(Infinity); x1.push(-Infinity); }
      grupoDe[r] = k;
      if (xs[i] < x0[k]) x0[k] = xs[i];
      if (xs[i] > x1[k]) x1[k] = xs[i];
    });
    const xbar = filas.reduce((s, i) => s + xs[i], 0) / n;
    const celdasAj = trs.length === 1 ? medias[0].filas : out.celdas;
    const mediaDe = new Map(celdasAj.map(f => [f.nombre.split(' : ').join(' · '), f.media]));
    out.grafica = {
      covariable: c0, pendiente: pendientes[0].estimado, xbar,
      puntos: filas.map((i, r) => ({ x: xs[i], y: ys[i], g: grupoDe[r] })), grupos,
      rectas: grupos.map((g, k) => ({ nombre: g, x: [x0[k], x1[k]], media: mediaDe.has(g) ? mediaDe.get(g) : NaN })),
    };
    return out;
  }

  /** Versión plana para las pruebas. */
  function analizarDe(tabla, e, op) {
    const r = analizar(tabla, e, op);
    return {
      anova: r.anova, pendientes: r.pendientes, homogeneidad: r.homogeneidad, independencia: r.independencia, eficiencia: r.eficiencia, resumen: r.resumen,
      medias: r.medias.map(m => ({ factor: m.factor, media: m.filas.map(f => f.media), ee: m.filas.map(f => f.ee), ic_inf: m.filas.map(f => f.ic[0]), ic_sup: m.filas.map(f => f.ic[1]) })),
      comparaciones: r.comparaciones.map(c => ({ factor: c.factor, letras: c.medias.map(x => x.letras), dif: c.pares.map(x => x.dif), ee: c.pares.map(x => x.ee), t: c.pares.map(x => x.t), p: c.pares.map(x => x.p_ajustado) })),
    };
  }
  SP.ancova = { analizar, analizarDe, formulaDe, tablaAncova };

  /* ======================= método ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const etiqueta = s => String(s).split(':').join(' × ');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const color = (p, alfa) => (!Number.isFinite(p) ? 'gris' : p >= alfa ? 'verde' : p >= alfa / 5 ? 'ambar' : 'rojo');
  const METODOS = { tukey: 'Tukey', dms: 'DMS de Fisher', bonferroni: 'Bonferroni', sidak: 'Šidák', holm: 'Holm', scheffe: 'Scheffé' };

  function validar(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    const trs = lista(e.tratamientos), covs = lista(e.covariables);
    exigir(trs.length >= 1 && trs.length <= 2, T('Elige uno o dos factores de tratamiento.'));
    exigir(covs.length >= 1 && covs.length <= 2, T('Elige una o dos covariables.'));
    const usados = [e.respuesta];
    const usa = c => { exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c })); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); };
    trs.forEach(usa);
    if (e.bloque) usa(e.bloque);
    covs.forEach(c => { usa(c); exigir(tabla.col(c).tipo === 'numerica', T('La covariable «{c}» debe ser numérica.', { c })); });
    exigir([1, 2, 3].includes(Number(op.tipoSC)), T('El tipo de suma de cuadrados es 1, 2 o 3.'));
    exigir(op.metodo === 'ninguna' || METODOS[op.metodo], T('Método de comparación desconocido: {m}.', { m: op.metodo }));
    exigir(op.alfa > 0 && op.alfa < 0.5, T('El nivel de significancia va entre 0 y 0.5.'));
  }

  function reporte(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], sem = [];
    const pTerm = f => { const k = r.anova.fuente.indexOf(f); return k >= 0 ? { F: r.anova.F[k], p: r.anova.p[k] } : null; };
    for (const s of r.pendientes) {
      conclusiones.push(s.p < a
        ? T('La covariable «{c}» explica parte de la variación: por cada unidad más, «{y}» cambia {b} en promedio (t = {t}, p {p}).', { c: s.covariable, y: r.respuesta, b: f3(s.estimado), t: f3(s.t), p: fp(s.p) })
        : T('La covariable «{c}» no tiene efecto significativo (t = {t}, p {p}): el ajuste casi no cambia las medias ni gana precisión.', { c: s.covariable, t: f3(s.t), p: fp(s.p) }));
    }
    const trTerms = r.anova.fuente.filter(f => f.split(':').every(x => r.tratamientos.includes(x)));
    for (const f of trTerms) {
      const x = pTerm(f);
      conclusiones.push(x.p < a ? T('Ajustado por la covariable, {t} tiene efecto (F = {F}, p {p}).', { t: etiqueta(f), F: f3(x.F), p: fp(x.p) })
        : T('Ajustado por la covariable, {t} no tiene efecto (F = {F}, p {p}).', { t: etiqueta(f), F: f3(x.F), p: fp(x.p) }));
    }
    for (const h of r.homogeneidad) {
      sem.push({ nombre: T('Pendientes iguales ({c})', { c: h.covariable }), color: color(h.p, a), texto: T('F = {F} con {g1} y {g2} gl, p {p}.', { F: f3(h.F), g1: h.gl1, g2: h.gl2, p: fp(h.p) }) });
      if (h.p < a) conclusiones.push(T('Las pendientes de «{c}» difieren entre tratamientos (F = {F}, p {p}): la diferencia entre tratamientos cambia con el valor de la covariable y las medias ajustadas valen solo en su media.', { c: h.covariable, F: f3(h.F), p: fp(h.p) }));
    }
    for (const d of r.independencia) {
      sem.push({ nombre: T('Covariable no afectada por los tratamientos ({c})', { c: d.covariable }), color: color(d.p, a), texto: T('F = {F} con {g1} y {g2} gl, p {p}.', { F: f3(d.F), g1: d.gl1, g2: d.gl2, p: fp(d.p) }) });
      if (d.p < a) conclusiones.push(T('«{c}» difiere entre tratamientos (F = {F}, p {p}): si los tratamientos la afectan, ajustar por ella quita parte de su efecto. Úsala solo si se midió antes de aplicarlos.', { c: d.covariable, F: f3(d.F), p: fp(d.p) }));
    }
    if (r.eficiencia) conclusiones.push(T('Eficiencia relativa de la covarianza: {e} % (la ANCOVA equivale a tener {r} veces las repeticiones del ANOVA sin covariable).', { e: r.eficiencia.relativa.toFixed(1), r: (r.eficiencia.relativa / 100).toFixed(2) }));

    const filas = r.anova.fuente.map((f, k) => ({ fuente: f === 'Residuales' ? T('Error') : etiqueta(f), gl: r.anova.gl[k], sc: r.anova.sc[k], cm: r.anova.cm[k], F: r.anova.F[k], p: r.anova.p[k] }));
    filas.push({ fuente: T('Total'), gl: r.total.gl, sc: r.total.sc, cm: NaN, F: NaN, p: NaN });
    cuadros.push({ id: 'anova', titulo: T('Análisis de covarianza'),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'auto4'), col('cm', T('CM'), 'auto4'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas, notas: [T('Sumas de cuadrados tipo {t}. {x}', { t: ['', 'I', 'II', 'III'][r.tipoSC], x: ['',
        T('Tipo I: en el orden del modelo; los tratamientos van ajustados por los bloques y la covariable.'),
        T('Tipo II: cada término ajustado por los demás que no lo contienen (los tratamientos por la covariable y la covariable por los tratamientos).'),
        T('Tipo III: cada término ajustado por todos los demás, con contrastes de suma cero.')][r.tipoSC] })].concat(r.avisos) });
    cuadros.push({ id: 'pendientes', titulo: T('Pendiente común de cada covariable'),
      columnas: [col('cov', T('Covariable'), 'texto'), col('b', T('Pendiente'), 'sig'), col('ee', T('EE'), 'sig'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')],
      filas: r.pendientes.map(s => ({ cov: s.covariable, b: s.estimado, ee: s.ee, t: s.t, p: s.p, ic: s.ic })), notas: [] });
    cuadros.push({ id: 'supuestos', titulo: T('Supuestos de la covarianza'),
      columnas: [col('prueba', T('Prueba'), 'texto'), col('F', 'F', 'forma2'), col('gl', T('gl'), 'texto'), col('p', 'p', 'pvalor')],
      filas: r.homogeneidad.map(h => ({ prueba: T('Pendientes iguales: {c} × tratamientos', { c: h.covariable }), F: h.F, gl: `${h.gl1}, ${h.gl2}`, p: h.p }))
        .concat(r.independencia.map(d => ({ prueba: T('Tratamientos sobre {c}', { c: d.covariable }), F: d.F, gl: `${d.gl1}, ${d.gl2}`, p: d.p }))),
      notas: [T('Pendientes iguales: compara el modelo con una pendiente común contra uno con una pendiente por tratamiento. Tratamientos sobre la covariable: ANOVA de la covariable con el mismo diseño; si difiere, puede que los tratamientos la afecten.')] });
    const conLetras = r.comparaciones.length > 0;
    for (const m of r.medias) {
      const cmp = r.comparaciones.find(c => c.factor === m.factor), cr = r.crudas.find(c => c.factor === m.factor);
      cuadros.push({ id: 'medias-' + m.factor, titulo: T('Medias ajustadas de «{f}»', { f: m.factor }),
        columnas: [col('nivel', m.factor, 'texto'), col('cruda', T('Media sin ajustar'), 'sig')].concat(r.covariables.map((c, j) => col('c' + j, T('Media de {c}', { c }), 'sig')))
          .concat([col('media', T('Media ajustada'), 'sig'), col('ee', T('EE'), 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')]).concat(conLetras ? [col('letras', T('Grupo'), 'texto')] : []),
        filas: m.filas.map((f, i) => Object.assign({ nivel: f.nombre, cruda: cr.filas[i].media, media: f.media, ee: f.ee, ic: f.ic, letras: cmp ? cmp.medias[i].letras : '' },
          Object.fromEntries(r.covariables.map((_, j) => ['c' + j, cr.filas[i].covariables[j]])))),
        notas: [T('Medias ajustadas a {v}: lo que valdría cada tratamiento si todas las parcelas tuvieran la misma covariable.', { v: r.covariables.map(c => T('«{c}» en su media', { c })).join(T(' y ')) })]
          .concat(conLetras ? [T('{m} (α = {a}): medias con una letra en común no difieren.', { m: T(METODOS[r.metodo]), a: a })] : []) });
    }
    if (r.dentro) {
      cuadros.push({ id: 'dentro', titulo: T('«{a}» dentro de cada nivel de «{b}» (medias ajustadas)', { a: r.tratamientos[0], b: r.tratamientos[1] }),
        columnas: [col('dentro', r.tratamientos[1], 'texto'), col('nivel', r.tratamientos[0], 'texto'), col('media', T('Media ajustada'), 'sig'), col('ee', T('EE'), 'sig'), col('letras', T('Grupo'), 'texto')],
        filas: r.dentro.flatMap(g => g.medias.map(x => ({ dentro: g.dentro[r.tratamientos[1]], nivel: x.nombre, media: x.media, ee: x.ee, letras: x.letras }))),
        notas: [T('La interacción es significativa: se compara un factor dentro de cada nivel del otro.')] });
    }
    const res = [{ medida: T('Media general'), valor: r.resumen.media, _dec: 3 }, { medida: T('Observaciones'), valor: r.n, _dec: 0 },
      { medida: T('Coeficiente de variación, %'), valor: r.resumen.cv, _dec: 1 }, { medida: 'R²', valor: r.resumen.r2, _dec: 3 },
      { medida: T('CM del error con covariable'), valor: r.resumen.cme, _dec: 4 }, { medida: T('CM del error sin covariable'), valor: r.resumen.cme_sin, _dec: 4 }];
    if (r.eficiencia) res.push({ medida: T('Eficiencia relativa de la covarianza, %'), valor: r.eficiencia.relativa, _dec: 1 });
    cuadros.push({ id: 'resumen', titulo: T('Resumen del ensayo'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')], filas: res,
      notas: r.eficiencia ? [T('Eficiencia relativa: CM del error sin covariable entre el CM efectivo con covariable, CMe·(1 + CMtrat(x)/SCerror(x)) (Cochran y Cox, 1957).')] : [] });
    return { titulo: r.bloque ? T('Análisis de covarianza en bloques completos al azar') : T('Análisis de covarianza completamente al azar'), conclusiones: conclusiones.map(may), cuadros, semaforo: sem };
  }

  function codigoR(e, op) {
    const trs = lista(e.tratamientos), covs = lista(e.covariables), y = q(e.respuesta), tipo = Number(op.tipoSC || 3);
    const facs = [e.bloque, ...trs].filter(Boolean), f = formulaDe(e), base = e.bloque ? q(e.bloque) : '1';
    const usadas = [e.respuesta, ...covs, ...facs].map(x => JSON.stringify(x)).join(', ');
    const L = ['# Análisis de covarianza (código R equivalente a SigmaPro)', `datos <- na.omit(datos[c(${usadas})])   # las filas completas del modelo`,
      ...facs.map(x => `datos$${q(x)} <- factor(datos$${q(x)})`),
      `modelo <- lm(${f}, data = datos${tipo === 3 ? ', contrasts = list(' + facs.map(x => `${q(x)} = contr.sum`).join(', ') + ')' : ''})`,
      tipo === 1 ? 'anova(modelo)' : `car::Anova(modelo, type = ${tipo})`, `confint(modelo, c(${covs.map(c => `"${c}"`).join(', ')}), level = ${op.nivel})   # pendientes comunes`];
    for (const c of covs) L.push(`anova(modelo, update(modelo, . ~ . + ${interaccionesCov(c, trs).join(' + ')}))   # pendientes iguales (${c})`,
      `anova(lm(${q(c)} ~ ${base}, data = datos), lm(${q(c)} ~ ${base} + ${tratTerm(trs)}, data = datos))   # tratamientos sobre ${c}`);
    L.push('# medias ajustadas (covariables en su media) y comparaciones: install.packages("emmeans")');
    for (const t of trs) L.push(`em <- emmeans::emmeans(modelo, "${t}"); confint(em, level = ${op.nivel})`, op.metodo !== 'ninguna' ? `(pr <- pairs(em, adjust = "${op.metodo === 'dms' ? 'none' : op.metodo}"))` : '');
    if (covs.length === 1) {
      L.push(`# eficiencia relativa: CM sin covariable / (CMe · (1 + CMtrat(x)/SCerror(x)))`,
        `sin <- lm(${y} ~ ${base} + ${tratTerm(trs)}, data = datos); ax <- anova(lm(${q(covs[0])} ~ ${base}, data = datos), lm(${q(covs[0])} ~ ${base} + ${tratTerm(trs)}, data = datos))`,
        `(er <- 100 * (deviance(sin) / df.residual(sin)) / (sigma(modelo)^2 * (1 + (ax$\`Sum of Sq\`[2] / ax$Df[2]) / ax$RSS[2])))`);
    }
    return L.filter(Boolean).join('\n');
  }

  SP.metodo({
    id: 'ancova', familia: 'regresion', motor: 'js', orden: 0, nombre: T('Análisis de covarianza (ANCOVA)'),
    resumen: T('Tratamientos ajustados por una o dos covariables en completamente al azar o en bloques: pendientes, supuestos, medias ajustadas y eficiencia.'),
    entradas: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 2 }, bloque: { tipo: 'factor', opcional: true }, covariables: { tipo: 'numerica+', maximo: 2 } },
    opciones: { tipoSC: { tipo: 'numero', omision: 3 }, metodo: { tipo: 'texto', omision: 'tukey' }, alfa: { tipo: 'numero', omision: 0.05 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar, calcular: analizar, reporte, codigoR,
  });
});

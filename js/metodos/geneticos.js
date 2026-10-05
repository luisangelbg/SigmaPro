/* SigmaPro — componentes de varianza, heredabilidad y repetibilidad (familia Componentes de varianza y heredabilidad).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Los tres métodos corren en el núcleo JS con el REML de SP.reml (validado contra lme4):
   - componentes-varianza: factores aleatorios cruzados, anidados (cada uno dentro de los anteriores) o cruzados con sus
     interacciones dobles, y factores fijos opcionales. Cada componente con su EE (inversa de la información promedio),
     su porcentaje de la varianza total y la razón de verosimilitudes restringidas del modelo sin él (p con la mezcla
     ½χ²₀ + ½χ²₁, porque la varianza no puede ser negativa: Self y Liang 1987).
   - heredabilidad: genotipos aleatorios en completamente al azar, bloques completos, bloques incompletos dentro de
     repeticiones (alfa-látice) o varios ambientes (ambientes y repeticiones fijos; genotipo × ambiente y bloques
     incompletos aleatorios). H² en medias (con medias armónicas de ambientes y parcelas por genotipo, Holland y col.
     2003), por parcela, de Cullis, Smith y Coombes (2006) = 1 − v̄BLUP/(2σ²g) y de Piepho y Möhring (2007) =
     σ²g/(σ²g + v̄BLUE/2); BLUP con su PEV y confiabilidad; BLUE (genotipos fijos, promediados sobre las parcelas del
     ensayo); ganancia por selección por BLUP, por la ecuación del criador (i·H²·σF) y por el diferencial de selección.
   - repetibilidad: la misma unidad medida varias veces (cosechas, años, evaluadores); r = σ²u/(σ²u + σ²e), el número
     de medidas para una determinación dada y el valor permanente predicho (BLUP) de cada individuo. */
SP.definir('geneticos', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, max, floor } = Math;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const lista = v => [].concat(v || []).filter(Boolean);
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2) : '—'), f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const R_ = () => SP.reml;
  const CTL = 'ctl <- lmerControl(optimizer = "bobyqa", optCtrl = list(rhobeg = 0.2, rhoend = 1e-12, maxfun = 1e5))   # tolerancia estricta: las mismas cifras que SigmaPro';

  /* ---------------- piezas comunes ---------------- */
  function componentesDe(a) {
    const tot = a.sigma2.reduce((s, v) => s + v, 0), R = a.nombres.length;
    return a.sigma2.map((v, k) => ({ termino: k < R ? a.nombres[k] : 'Residual', sigma2: v, ee: Number.isFinite(a.cov[k][k]) ? sqrt(a.cov[k][k]) : NaN,
      porcentaje: 100 * v / tot, frontera: k < R ? a.frontera[k] : false }));
  }
  /** Razón de verosimilitudes restringidas de cada término aleatorio: el modelo sin él, con las mismas filas y efectos fijos. */
  function lrtDe(m, a) {
    return m.aleatorios.map((t, k) => {
      if (a.frontera[k]) return { termino: t.nombre, chi2: 0, p: 1 };
      const red = R_().ajustar({ y: m.y, X: m.X, p: m.p, asignacion: m.asignacion, aleatorios: m.aleatorios.filter((_, j) => j !== k) });
      const x = max(0, 2 * (a.logLik - red.logLik));
      return { termino: t.nombre, chi2: x, p: R_().pFrontera(x) };
    });
  }
  const ajusteDe = a => ({ n: a.n, logLik: a.logLik, AIC: a.aic, BIC: a.bic, iteraciones: a.iteraciones, convergio: a.convergio });
  /** EE de una función g(σ²) por el método delta: gradiente sobre los índices dados (la covarianza de la frontera es cero). */
  function delta(a, idx, grad) {
    let s = 0;
    idx.forEach((i, x) => idx.forEach((j, z) => { const c = a.cov[i][j]; if (Number.isFinite(c)) s += grad[x] * c * grad[z]; }));
    return sqrt(max(0, s));
  }
  /** Residuos condicionales (y − Xb − Zu) y BLUP del primer término para el semáforo. */
  function supuestosDe(m, a) {
    const res = Array.from(m.y, (v, i) => v - a.ajustados[i]), out = {};
    try { if (res.length >= 3 && res.length <= 5000) out.normalidad = SP.sup.shapiro(res); } catch (e) { /* sin prueba */ }
    try { const u = Array.from(a.u[0]); if (u.length >= 5 && !a.frontera[0]) out.normalidadBlup = SP.sup.shapiro(u); } catch (e) { /* sin prueba */ }
    const s = sqrt(a.sigma2[a.sigma2.length - 1]);
    out.atipicos = res.filter(r => Math.abs(r / s) > 3.5).length;
    return out;
  }
  const colorP = p => (!Number.isFinite(p) ? 'gris' : p >= 0.05 ? 'verde' : p >= 0.01 ? 'ambar' : 'rojo');
  function semaforoDe(r, nombreBlup) {
    const s = r.supuestos, out = [];
    out.push(s.normalidad ? { nombre: T('Normalidad de los residuos'), color: colorP(s.normalidad.p), texto: T('Shapiro-Wilk W = {w}, p {p}.', { w: s.normalidad.W.toFixed(3), p: fp(s.normalidad.p) }) }
      : { nombre: T('Normalidad de los residuos'), color: 'gris', texto: T('Sin prueba (se necesitan entre 3 y 5000 residuos).') });
    if (s.normalidadBlup) out.push({ nombre: T('Normalidad de los efectos aleatorios'), color: colorP(s.normalidadBlup.p), texto: T('BLUP de {g}: Shapiro-Wilk W = {w}, p {p}.', { g: nombreBlup, w: s.normalidadBlup.W.toFixed(3), p: fp(s.normalidadBlup.p) }) });
    out.push({ nombre: T('Observaciones atípicas'), color: s.atipicos ? 'ambar' : 'verde', texto: s.atipicos === 1 ? T('Un residuo pasa de 3.5 desviaciones estándar: revisa esa observación.') : s.atipicos ? T('{k} residuos pasan de 3.5 desviaciones estándar: revisa esas observaciones.', { k: s.atipicos }) : T('Ningún residuo pasa de 3.5 desviaciones estándar.') });
    const front = r.componentes.filter(c => c.frontera);
    out.push({ nombre: T('Ajuste REML'), color: !r.ajuste.convergio ? 'rojo' : front.length ? 'ambar' : 'verde',
      texto: !r.ajuste.convergio ? T('El cálculo no convergió; los resultados no son confiables.') : front.length ? T('Componentes en cero: {c}.', { c: front.map(c => r.etiqueta(c.termino)).join(', ') })
        : T('Convergió en {k} iteraciones; ningún componente quedó en cero.', { k: r.ajuste.iteraciones }) });
    return out;
  }
  function cuadroComponentes(r, titulo, notaExtra) {
    const cl = Object.fromEntries(r.lrt.map(x => [x.termino, x]));
    return { id: 'componentes', titulo,
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('niveles', T('Niveles'), 'entero'), col('s2', 'σ²', 'sig'), col('ee', T('EE'), 'sig'), col('pct', T('% del total'), 'pct'),
        col('chi2', T('χ² (RV)'), 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.componentes.map((c, k) => ({ fuente: r.etiqueta(c.termino), niveles: k < r.niveles.length ? r.niveles[k] : NaN, s2: c.sigma2, ee: c.ee, pct: c.porcentaje,
        chi2: cl[c.termino] ? cl[c.termino].chi2 : NaN, p: cl[c.termino] ? cl[c.termino].p : NaN })),
      notas: [T('Componentes de varianza por REML (máxima verosimilitud restringida); EE asintótico de la inversa de la información promedio.'),
        T('χ² (RV): razón de verosimilitudes restringidas contra el modelo sin ese componente; p con la mezcla ½χ²₀ + ½χ²₁, porque una varianza no puede ser negativa.')]
        .concat(r.componentes.some(c => c.frontera) ? [T('Un componente en cero quedó en la frontera del espacio de parámetros (su estimación sería negativa): no tiene EE.')] : []).concat(notaExtra || []) };
  }
  const nivelH = h => (h < 0.3 ? T('baja') : h < 0.6 ? T('media@@nivel') : T('alta'));

  /* ======================= componentes de varianza ======================= */
  const ESTRUCTURAS = { cruzados: 'Cruzados', anidados: 'Anidados (cada uno dentro de los anteriores)', 'cruzados-interaccion': 'Cruzados, con sus interacciones dobles' };
  function terminosAleatorios(al, estructura) {
    if (estructura === 'anidados') return al.map((_, k) => al.slice(0, k + 1));
    const t = al.map(f => [f]);
    if (estructura === 'cruzados-interaccion') for (let i = 0; i < al.length - 1; i++) for (let j = i + 1; j < al.length; j++) t.push([al[i], al[j]]);
    return t;
  }
  function validarComp(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    const al = lista(e.aleatorios), fj = lista(e.fijos);
    exigir(al.length >= 1 && al.length <= 4, T('Elige de uno a cuatro factores aleatorios.'));
    exigir(fj.length <= 3, T('Elige hasta tres factores fijos.'));
    const usados = [e.respuesta];
    for (const c of al.concat(fj)) { exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c })); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); }
    exigir(ESTRUCTURAS[op.estructura], T('Estructura desconocida: {e}.', { e: op.estructura }));
  }
  function componentes(tabla, e, op) {
    const al = lista(e.aleatorios), fj = lista(e.fijos), estructura = op.estructura || 'cruzados';
    const m = R_().modeloDe(tabla, e.respuesta, fj.map(f => [f]), terminosAleatorios(al, estructura)), a = R_().ajustar(m);
    const nombreDe = t => {
      const fs = t.split(':');
      return estructura === 'anidados' && fs.length > 1 ? T('{b} dentro de {a}', { b: fs[fs.length - 1], a: fs.slice(0, -1).join(' × ') }) : fs.join(' × ');
    };
    return { tipo: 'componentes', respuesta: e.respuesta, aleatorios: al, fijos: fj, estructura, componentes: componentesDe(a), lrt: lrtDe(m, a),
      niveles: m.aleatorios.map(t => t.niveles.length), ajuste: ajusteDe(a), media: a.media, formula: m.formula, quitadas: m.quitadas,
      supuestos: supuestosDe(m, a), etiqueta: t => (t === 'Residual' ? T('Error (residual)') : nombreDe(t)) };
  }
  function reporteComp(r) {
    const conclusiones = [], cuadros = [], tot = r.componentes.reduce((s, c) => s + c.sigma2, 0);
    const orden = r.componentes.slice().sort((x, y) => y.sigma2 - x.sigma2);
    conclusiones.push(T('La mayor parte de la variación de «{y}» está en {f} ({p} % del total).', { y: r.respuesta, f: r.etiqueta(orden[0].termino), p: orden[0].porcentaje.toFixed(1) }));
    for (const x of r.lrt) {
      const c = r.componentes.find(z => z.termino === x.termino);
      conclusiones.push(c.frontera ? T('{f}: su varianza quedó en cero (sin variación entre niveles más allá de la del error).', { f: r.etiqueta(x.termino) })
        : x.p < 0.05 ? T('{f}: aporta variación (σ² = {s}, {pc} %; χ² = {c}, p {p}).', { f: r.etiqueta(x.termino), s: sig(c.sigma2), pc: c.porcentaje.toFixed(1), c: f2(x.chi2), p: fp(x.p) })
          : T('{f}: sin evidencia de variación (σ² = {s}; χ² = {c}, p {p}).', { f: r.etiqueta(x.termino), s: sig(c.sigma2), c: f2(x.chi2), p: fp(x.p) }));
    }
    cuadros.push(cuadroComponentes(r, T('Componentes de varianza de «{y}»', { y: r.respuesta }),
      r.fijos.length ? [T('Efectos fijos en el modelo: {f}. Para sus pruebas F usa el modelo lineal mixto.', { f: r.fijos.join(', ') })] : []));
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste del modelo'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: T('Observaciones'), valor: r.ajuste.n, _dec: 0 }, { medida: T('Media general estimada'), valor: r.media, _dec: 4 }, { medida: T('Varianza total (suma de componentes)'), valor: tot, _dec: 4 },
        { medida: T('Log-verosimilitud restringida'), valor: r.ajuste.logLik, _dec: 3 }, { medida: 'AIC', valor: r.ajuste.AIC, _dec: 2 }, { medida: 'BIC', valor: r.ajuste.BIC, _dec: 2 }],
      notas: [T('AIC y BIC de REML: solo comparan modelos con los mismos efectos fijos.')] });
    return { titulo: T('Componentes de varianza (REML)'), conclusiones: conclusiones.map(may), cuadros, semaforo: semaforoDe(r, r.etiqueta(r.componentes[0].termino)) };
  }
  function codigoComp(e, op) {
    const al = lista(e.aleatorios), fj = lista(e.fijos), ts = terminosAleatorios(al, op.estructura || 'cruzados');
    const fac = al.concat(fj);
    return ['# Componentes de varianza por REML (código R equivalente a SigmaPro)', 'library(lme4)', CTL,
      `datos <- na.omit(datos[c(${[e.respuesta].concat(fac).map(x => JSON.stringify(x)).join(', ')})])`, ...fac.map(f => `datos$${q(f)} <- factor(datos$${q(f)})`),
      `m <- lmer(${q(e.respuesta)} ~ ${fj.length ? fj.map(q).join(' + ') : '1'} + ${ts.map(t => '(1 | ' + t.map(q).join(':') + ')').join(' + ')}, data = datos, REML = TRUE, control = ctl)`,
      'vc <- as.data.frame(VarCorr(m)); vc$porcentaje <- 100 * vc$vcov / sum(vc$vcov); vc[c("grp", "vcov", "porcentaje")]',
      '# razón de verosimilitudes de cada componente (p con la mezcla ½χ²₀ + ½χ²₁: la mitad del p de ranova)',
      'rv <- lmerTest::ranova(lmerTest::as_lmerModLmerTest(m)); rv$p_frontera <- 0.5 * rv$`Pr(>Chisq)`; rv',
      'logLik(m); AIC(m); BIC(m)'].join('\n');
  }

  /* ======================= heredabilidad ======================= */
  function disenoGenetico(e) {
    const amb = e.ambiente || '', rep = e.repeticion || '', bl = e.bloque || '', gen = e.genotipo;
    const fijos = [];
    if (amb) fijos.push([amb]);
    if (rep) fijos.push(amb ? [amb, rep] : [rep]);
    const al = [[gen]];
    if (amb) al.push([gen, amb]);
    if (bl) al.push([amb, rep, bl].filter(Boolean));
    return { fijos, aleatorios: al };
  }
  function validarH(tabla, e, op) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    exigir(e.genotipo && tabla.columnas[e.genotipo], T('Elige la columna de los genotipos.'));
    const usados = [e.respuesta];
    for (const k of ['genotipo', 'repeticion', 'bloque', 'ambiente']) {
      const c = e[k];
      if (!c) continue;
      exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c }));
      exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c }));
      usados.push(c);
    }
    exigir(SP.estructura.comoFactor(tabla, e.genotipo).niveles.length >= 3, T('Se necesitan al menos tres genotipos.'));
    exigir(op.seleccion > 0 && op.seleccion <= 0.5, T('La proporción seleccionada va entre 0 y 0.5.'), T('Por ejemplo, 0.10 para seleccionar el mejor 10 %.'));
    exigir(op.direccion === 'mayor' || op.direccion === 'menor', T('La dirección de la selección es «mayor» o «menor».'));
  }
  function heredabilidad(tabla, e, op) {
    const gen = e.genotipo, amb = e.ambiente || '', ds = disenoGenetico(e), RR = R_();
    const m = RR.modeloDe(tabla, e.respuesta, ds.fijos, ds.aleatorios);
    const R = ds.aleatorios.length, gt = m.aleatorios[0], ng = gt.niveles.length;
    if (amb) {
      const celdas = new Map();
      for (let r = 0; r < m.n; r++) { const k = m.aleatorios[1].codigos[r]; celdas.set(k, (celdas.get(k) || 0) + 1); }
      exigir([...celdas.values()].some(v => v > 1), T('Con una sola parcela por genotipo y ambiente, la interacción genotipo × ambiente se confunde con el error.'),
        T('Elige la columna de las repeticiones dentro de cada ambiente.'));
    }
    const a = RR.ajustar(m);
    const s2g = a.sigma2[0], s2ge = amb ? a.sigma2[1] : 0, s2e = a.sigma2[R];
    const cuenta = new Float64Array(ng);
    for (const k of gt.codigos) cuenta[k]++;
    const ph = RR.armonica(Array.from(cuenta));
    let eh = 1, nAmbientes = 1;
    if (amb) {
      const ca = m.tabla.col(amb).codigos, vistos = Array.from({ length: ng }, () => new Set()), todos = new Set();
      for (let r = 0; r < m.n; r++) { vistos[gt.codigos[r]].add(ca[m.filas[r]]); todos.add(ca[m.filas[r]]); }
      eh = RR.armonica(vistos.map(s => s.size));
      nAmbientes = todos.size;
    }
    const Dn = s2g + s2ge / eh + s2e / ph, H2 = s2g / Dn;
    const idx = [0].concat(amb ? [1] : [], [R]), gr = [(s2ge / eh + s2e / ph) / (Dn * Dn)].concat(amb ? [-s2g / (eh * Dn * Dn)] : [], [-s2g / (ph * Dn * Dn)]);
    const pev = a.pev(0), vblup = RR.mediaDifPares(pev, ng), cullis = s2g > 0 ? 1 - vblup / (2 * s2g) : 0;
    /* BLUE: los genotipos fijos (al final de la parte fija); el resto igual */
    const mb = RR.modeloDe(tabla, e.respuesta, ds.fijos.concat([[gen]]), ds.aleatorios.slice(1)), b = RR.ajustar(mb);
    /* el término de los genotipos (la fórmula pone los efectos principales antes que las interacciones, como R) */
    const tg = 1 + mb.terminos.findIndex(v => v.length === 1 && v[0] === gen), n = mb.n, p = mb.p, cg = new Int32Array(ng).fill(-1), Lb = new Float64Array(p);
    const colG = mb.tabla.col(gen), posG = new Map(gt.niveles.map((l, k) => [l, k]));
    for (let j = 0; j < p; j++) {
      if (mb.asignacion[j] === tg) { for (let i = 0; i < n; i++) if (mb.X[i + j * n] === 1) { cg[posG.get(colG.niveles[colG.codigos[mb.filas[i]]])] = j; break; } continue; }
      let s = 0;
      for (let i = 0; i < n; i++) s += mb.X[i + j * n];
      Lb[j] = s / n;
    }
    const V = b.varB(), VLb = new Float64Array(p);
    let LbVLb = 0, Lbb = 0;
    for (let i = 0; i < p; i++) { let s = 0; for (let j = 0; j < p; j++) s += V[i * p + j] * Lb[j]; VLb[i] = s; LbVLb += Lb[i] * s; Lbb += Lb[i] * b.b[i]; }
    const blue = Array.from(cg, c => Lbb + (c >= 0 ? b.b[c] : 0)), VL = new Float64Array(ng * ng);
    for (let i = 0; i < ng; i++) for (let j = 0; j < ng; j++) {
      const ci = cg[i], cj = cg[j];
      VL[i * ng + j] = LbVLb + (ci >= 0 ? VLb[ci] : 0) + (cj >= 0 ? VLb[cj] : 0) + (ci >= 0 && cj >= 0 ? V[ci * p + cj] : 0);
    }
    const vblue = RR.mediaDifPares(VL, ng), piepho = s2g / (s2g + vblue / 2);
    /* selección */
    const s = op.direccion === 'menor' ? -1 : 1, u = Array.from(a.u[0]);
    const k = max(1, floor(op.seleccion * ng + 0.5)), pe = k / ng, z = SP.dist.qnorm(1 - pe), inten = Math.exp(-0.5 * z * z) / sqrt(2 * Math.PI) / pe;
    const ordU = u.map((_, j) => j).sort((x, y) => s * u[y] - s * u[x]).slice(0, k);
    const ordB = blue.map((_, j) => j).sort((x, y) => s * blue[y] - s * blue[x]).slice(0, k);
    const dgb = ordU.reduce((t, j) => t + u[j], 0) / k, mB = blue.reduce((t, v) => t + v, 0) / ng, DS = ordB.reduce((t, j) => t + blue[j], 0) / k - mB;
    const comps = componentesDe(a), etq = { [gt.nombre]: T('Genotipos') };
    if (amb) etq[m.aleatorios[1].nombre] = T('Genotipo × ambiente');
    if (e.bloque) etq[m.aleatorios[R - 1].nombre] = e.repeticion || amb ? T('Bloques incompletos (dentro de {r})', { r: [amb, e.repeticion].filter(Boolean).join(' × ') }) : T('Bloques');
    return {
      tipo: 'heredabilidad', respuesta: e.respuesta, genotipo: gen, ambiente: amb, nAmbientes, repeticion: e.repeticion || '', bloque: e.bloque || '', direccion: op.direccion, proporcion: op.seleccion,
      componentes: comps, lrt: lrtDe(m, a), niveles: m.aleatorios.map(t => t.niveles.length), ajuste: ajusteDe(a),
      heredabilidad: { estandar: H2, ee: a.frontera[0] ? NaN : delta(a, idx, gr), parcela: s2g / (s2g + s2ge + s2e), cullis, piepho, vblup, vblue, ph, eh },
      media: a.media, cvg: 100 * sqrt(s2g) / a.media, cve: 100 * sqrt(s2e) / a.media, sigmaF: sqrt(Dn),
      blup: gt.niveles.map((g, j) => ({ genotipo: g, u: u[j], pev: pev[j * ng + j], confiabilidad: s2g > 0 ? 1 - pev[j * ng + j] / s2g : NaN })),
      blue: gt.niveles.map((g, j) => ({ genotipo: g, media: blue[j], ee: sqrt(VL[j * ng + j]) })),
      seleccion: { k, intensidad: inten, dg_blup: dgb, dg_blup_pct: 100 * dgb / a.media, dg_clasica: s * inten * H2 * sqrt(Dn), ds: DS, dg_ds: H2 * DS, seleccionados: ordU.map(j => gt.niveles[j]) },
      formula: m.formula, supuestos: supuestosDe(m, a), etiqueta: t => (t === 'Residual' ? T('Error (residual)') : etq[t] || t.split(':').join(' × ')),
    };
  }
  function disenoTexto(r) {
    return r.ambiente ? T('{k} ambientes', { k: r.nAmbientes })
      : r.bloque && r.repeticion ? T('bloques incompletos dentro de repeticiones') : r.bloque ? T('bloques incompletos aleatorios') : r.repeticion ? T('bloques completos al azar') : T('completamente al azar');
  }
  function reporteH(r) {
    const h = r.heredabilidad, S = r.seleccion, conclusiones = [], cuadros = [];
    const g = r.lrt[0], cg = r.componentes[0];
    conclusiones.push(cg.frontera ? T('La varianza genética quedó en cero: con estos datos no hay diferencias genéticas detectables entre genotipos y la selección no daría ganancia.')
      : g.p < 0.05 ? T('Hay variación genética entre genotipos (σ²g = {s}, χ² = {c}, p {p}).', { s: sig(cg.sigma2), c: f2(g.chi2), p: fp(g.p) })
        : T('La variación genética entre genotipos no es significativa (σ²g = {s}, χ² = {c}, p {p}).', { s: sig(cg.sigma2), c: f2(g.chi2), p: fp(g.p) }));
    conclusiones.push(T('La heredabilidad en medias es {n} (H² = {h} ± {e}): el {pc} % de la variación entre las medias de los genotipos es genética. H² de Cullis = {c}; de Piepho y Möhring = {pm}.',
      { n: nivelH(h.estandar), h: f3(h.estandar), e: f3(h.ee), pc: (100 * h.estandar).toFixed(0), c: f3(h.cullis), pm: f3(h.piepho) }));
    if (r.ambiente) {
      const cge = r.componentes[1];
      conclusiones.push(T('La varianza de la interacción genotipo × ambiente (σ²ga = {s}) es {r} la genética: {t}', { r: cge.sigma2 > cg.sigma2 ? T('mayor que') : T('menor que'), s: sig(cge.sigma2),
        t: cge.sigma2 > cg.sigma2 ? T('el orden de los genotipos cambia bastante entre ambientes; conviene seleccionar por ambiente o con más ambientes.') : T('el orden de los genotipos se mantiene en buena medida entre ambientes.') }));
    }
    conclusiones.push(T('Seleccionando {k} de {n} genotipos ({pc} %) por {d} BLUP, la ganancia esperada es {g} ({gp} % de la media).',
      { k: S.k, n: r.blup.length, pc: (100 * S.k / r.blup.length).toFixed(0), d: r.direccion === 'menor' ? T('el menor') : T('el mayor'), g: sig(S.dg_blup), gp: f2(S.dg_blup_pct) }));
    cuadros.push(cuadroComponentes(r, T('Componentes de varianza de «{y}»', { y: r.respuesta }), [T('Modelo: {y} ~ {f} con genotipos aleatorios{x}.', { y: r.respuesta, f: r.formula,
      x: r.componentes.length > 2 ? T(' y {t}', { t: r.componentes.slice(1, -1).map(c => r.etiqueta(c.termino).toLowerCase()).join(T(' y ')) }) + T(' aleatorios') : '' })]));
    cuadros.push({ id: 'heredabilidad', titulo: T('Heredabilidad'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'forma'), col('nota', T('Fórmula'), 'texto')],
      filas: [{ medida: T('H² en medias de genotipos'), valor: h.estandar, nota: r.ambiente ? T('σ²g / (σ²g + σ²ga/a + σ²e/n)') : T('σ²g / (σ²g + σ²e/n)') },
        { medida: T('EE de H² en medias'), valor: h.ee, nota: T('método delta') },
        { medida: T('H² por parcela'), valor: h.parcela, nota: r.ambiente ? T('σ²g / (σ²g + σ²ga + σ²e)') : T('σ²g / (σ²g + σ²e)') },
        { medida: T('H² de Cullis'), valor: h.cullis, nota: T('1 − v̄BLUP / (2σ²g)') },
        { medida: T('H² de Piepho y Möhring'), valor: h.piepho, nota: T('σ²g / (σ²g + v̄BLUE / 2)') }],
      notas: [T('n = {p} parcelas por genotipo{a} (medias armónicas; Holland y col. 2003). v̄BLUP = {vb} y v̄BLUE = {vu}: varianzas medias de la diferencia entre dos genotipos, con genotipos aleatorios (BLUP) y fijos (BLUE).',
        { p: f2(h.ph), a: r.ambiente ? T(' y a = {e} ambientes por genotipo', { e: f2(h.eh) }) : '', vb: sig(h.vblup), vu: sig(h.vblue) }),
        T('Con datos desbalanceados o bloques incompletos, las de Cullis y de Piepho y Möhring son las más fieles (Schmidt y col. 2019).')] });
    cuadros.push({ id: 'parametros', titulo: T('Parámetros genéticos'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: T('Media general estimada'), valor: r.media, _dec: 4 }, { medida: T('Varianza genética (σ²g)'), valor: r.componentes[0].sigma2, _dec: 4 },
        { medida: T('Varianza fenotípica de las medias (σ²F)'), valor: r.sigmaF * r.sigmaF, _dec: 4 }, { medida: T('CV genético, %'), valor: r.cvg, _dec: 2 },
        { medida: T('CV del error, %'), valor: r.cve, _dec: 2 }, { medida: T('Razón CVg / CVe'), valor: r.cvg / r.cve, _dec: 3 }],
      notas: [T('Una razón CVg/CVe mayor que 1 indica condiciones favorables para la selección.')] });
    cuadros.push({ id: 'seleccion', titulo: T('Ganancia esperada por selección'), columnas: [col('medida', T('Criterio'), 'texto'), col('valor', T('Ganancia'), 'sig'), col('pct', T('% de la media'), 'num2')],
      filas: [{ medida: T('Por BLUP (media de los BLUP seleccionados)'), valor: S.dg_blup, pct: S.dg_blup_pct },
        { medida: T('Ecuación del criador: i · H² · σF'), valor: S.dg_clasica, pct: 100 * S.dg_clasica / r.media },
        { medida: T('Diferencial de selección (BLUE) × H²'), valor: S.dg_ds, pct: 100 * S.dg_ds / r.media }],
      notas: [T('Se seleccionan {k} de {n} genotipos ({pc} %) por el {d} valor; intensidad de selección i = {i}. Diferencial de selección con los BLUE: {ds}.',
        { k: S.k, n: r.blup.length, pc: (100 * S.k / r.blup.length).toFixed(1), d: r.direccion === 'menor' ? T('menor') : T('mayor'), i: f3(S.intensidad), ds: sig(S.ds) }),
        T('Seleccionados (BLUP): {g}.', { g: S.seleccionados.join(', ') })] });
    const ord = r.blup.map((_, j) => j).sort((x, y) => (r.direccion === 'menor' ? r.blup[x].u - r.blup[y].u : r.blup[y].u - r.blup[x].u)), sel = new Set(S.seleccionados);
    cuadros.push({ id: 'genotipos', titulo: T('BLUP y BLUE de los genotipos'),
      columnas: [col('orden', T('Orden'), 'entero'), col('genotipo', r.genotipo, 'texto'), col('valor', T('Valor genotípico (BLUP)'), 'sig'), col('u', T('Efecto (BLUP)'), 'sig'), col('ee', T('EE (√PEV)'), 'sig'),
        col('conf', T('Confiabilidad'), 'forma'), col('blue', T('Media ajustada (BLUE)'), 'sig'), col('eeb', T('EE BLUE'), 'sig'), col('sel', T('Seleccionado'), 'texto')],
      filas: ord.map((j, k) => ({ orden: k + 1, genotipo: r.blup[j].genotipo, valor: r.media + r.blup[j].u, u: r.blup[j].u, ee: sqrt(r.blup[j].pev), conf: r.blup[j].confiabilidad,
        blue: r.blue[j].media, eeb: r.blue[j].ee, sel: sel.has(r.blup[j].genotipo) ? '✓' : '' })),
      notas: [T('Valor genotípico = media general + BLUP: lo que se espera del genotipo en un ensayo nuevo como este. Confiabilidad = 1 − PEV/σ²g.'),
        T('BLUE: medias con los genotipos como efecto fijo, promediadas sobre las parcelas del ensayo (con datos balanceados, las de emmeans).')] });
    const titulo = T('Heredabilidad y BLUP de genotipos ({d})', { d: disenoTexto(r) });
    return { titulo, conclusiones: conclusiones.map(may), cuadros, semaforo: semaforoDe(r, T('genotipos')) };
  }
  function codigoH(e, op) {
    const ds = disenoGenetico(e), y = q(e.respuesta), g = q(e.genotipo), amb = e.ambiente ? q(e.ambiente) : '';
    const fac = [e.genotipo, e.ambiente, e.repeticion, e.bloque].filter(Boolean);
    const fija = ds.fijos.length ? ds.fijos.map(t => t.map(q).join(':')).join(' + ') : '1';
    const ale = ds.aleatorios.map(t => '(1 | ' + t.map(q).join(':') + ')').join(' + '), aleB = ds.aleatorios.slice(1).map(t => '(1 | ' + t.map(q).join(':') + ')').join(' + ');
    return ['# Heredabilidad, BLUP y BLUE de genotipos (código R equivalente a SigmaPro)', 'library(lme4)', CTL,
      `datos <- na.omit(datos[c(${[e.respuesta].concat(fac).map(x => JSON.stringify(x)).join(', ')})])`, ...fac.map(f => `datos$${q(f)} <- factor(datos$${q(f)})`),
      `m <- lmer(${y} ~ ${fija} + ${ale}, data = datos, REML = TRUE, control = ctl)`,
      `vc <- as.data.frame(VarCorr(m)); s2g <- vc$vcov[vc$grp == "${e.genotipo}"]; s2e <- sigma(m)^2${amb ? `; s2ga <- vc$vcov[vc$grp == "${e.genotipo}:${e.ambiente}"]` : ''}`,
      `n <- 1 / mean(1 / table(datos$${g}))   # parcelas por genotipo (media armónica)`,
      amb ? `a <- 1 / mean(1 / rowSums(table(datos$${g}, datos$${amb}) > 0))   # ambientes por genotipo` : '',
      `(H2 <- s2g / (s2g + ${amb ? 's2ga / a + ' : ''}s2e / n))`,
      `blup <- ranef(m)$${g}[, 1]   # efectos de los genotipos (BLUP); valor genotípico = media general + BLUP`,
      '# PEV de los BLUP (con la incertidumbre de los efectos fijos): σ²g·I − σ⁴g·Zg\'PZg, con V y P completas',
      'X <- getME(m, "X"); Zl <- lapply(getME(m, "Ztlist"), function(z) t(as.matrix(z))); s2 <- vc$vcov[seq_along(Zl)]',
      'V <- Reduce(`+`, Map(function(Z, s) s * tcrossprod(Z), Zl, s2), s2e * diag(nrow(X))); Vi <- solve(V)',
      'P <- Vi - Vi %*% X %*% solve(t(X) %*% Vi %*% X, t(X) %*% Vi)',
      `Zg <- Zl[["${e.genotipo}.(Intercept)"]]; PEV <- s2g * diag(ncol(Zg)) - s2g^2 * t(Zg) %*% P %*% Zg`,
      'k0 <- ncol(PEV); vblup <- 2 * (k0 * sum(diag(PEV)) - sum(PEV)) / (k0 * (k0 - 1))   # varianza media de la diferencia entre dos BLUP',
      '(H2_cullis <- 1 - vblup / (2 * s2g))',
      '# H² de Piepho y Möhring: con los genotipos fijos (BLUE)',
      `mb <- lmer(${y} ~ ${fija === '1' ? '' : fija + ' + '}${g}${aleB ? ' + ' + aleB : ''}, data = datos, REML = TRUE, control = ctl)`,
      `emm <- emmeans::emmeans(mb, "${e.genotipo}", lmer.df = "asymptotic"); vblue <- mean(summary(pairs(emm))$SE^2)`,
      '(H2_piepho <- s2g / (s2g + vblue / 2))',
      `# ganancia por selección (proporción ${op.seleccion}): i · H² · σF y la media de los BLUP seleccionados`,
      `k <- max(1, floor(${op.seleccion} * nlevels(datos$${g}) + 0.5)); i <- dnorm(qnorm(1 - k / nlevels(datos$${g}))) / (k / nlevels(datos$${g}))`,
      `mean(sort(blup, decreasing = ${op.direccion === 'menor' ? 'FALSE' : 'TRUE'})[1:k])`].filter(Boolean).join('\n');
  }

  /* ======================= repetibilidad ======================= */
  const OBJETIVOS = [0.8, 0.85, 0.9, 0.95, 0.99];
  function validarRep(tabla, e) {
    exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(tabla.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    exigir(e.individuo && tabla.columnas[e.individuo], T('Elige la columna que identifica a cada individuo medido varias veces.'));
    const fj = lista(e.fijos), usados = [e.respuesta, e.individuo];
    exigir(fj.length <= 3, T('Elige hasta tres factores fijos.'));
    for (const c of fj) { exigir(tabla.columnas[c], T('No existe la columna «{c}».', { c })); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); }
  }
  function repetibilidad(tabla, e) {
    const fj = lista(e.fijos), RR = R_(), m = RR.modeloDe(tabla, e.respuesta, fj.map(f => [f]), [[e.individuo]]), it = m.aleatorios[0], ni = it.niveles.length;
    const cuenta = new Float64Array(ni);
    for (const k of it.codigos) cuenta[k]++;
    exigir(Array.from(cuenta).some(v => v > 1), T('Ningún individuo tiene más de una medida.'), T('La repetibilidad necesita varias medidas de cada individuo (cosechas, años, evaluadores).'));
    const a = RR.ajustar(m), sI = a.sigma2[0], sE = a.sigma2[1], D = sI + sE, r = sI / D, mh = RR.armonica(Array.from(cuenta)), pev = a.pev(0);
    return {
      tipo: 'repetibilidad', respuesta: e.respuesta, individuo: e.individuo, fijos: fj, componentes: componentesDe(a), lrt: lrtDe(m, a), niveles: [ni], ajuste: ajusteDe(a),
      repetibilidad: { r, ee: a.frontera[0] ? NaN : delta(a, [0, 1], [sE / (D * D), -sI / (D * D)]), m: mh, R2: mh * r / (1 + (mh - 1) * r) },
      necesarias: OBJETIVOS.map(o => ({ R2: o, medidas: r > 0 ? o * (1 - r) / ((1 - o) * r) : NaN })),
      media: a.media,
      blup: it.niveles.map((g, j) => ({ individuo: g, u: a.u[0][j], pev: pev[j * ni + j], confiabilidad: sI > 0 ? 1 - pev[j * ni + j] / sI : NaN })),
      formula: m.formula, supuestos: supuestosDe(m, a), etiqueta: t => (t === 'Residual' ? T('Error temporal (entre medidas)') : T('Individuos ({c})', { c: t })),
    };
  }
  function reporteRep(r) {
    const R = r.repetibilidad, conclusiones = [], cuadros = [];
    conclusiones.push(T('La repetibilidad de «{y}» es {n} (r = {r} ± {e}): el {pc} % de la variación entre medidas se debe a diferencias permanentes entre individuos.',
      { y: r.respuesta, n: nivelH(R.r), r: f3(R.r), e: f3(R.ee), pc: (100 * R.r).toFixed(0) }));
    conclusiones.push(T('Con {m} medidas por individuo, la determinación del valor permanente es R² = {R} ({pc} %).', { m: f2(R.m), R: f3(R.R2), pc: (100 * R.R2).toFixed(0) }));
    const n90 = r.necesarias.find(x => x.R2 === 0.9);
    if (n90 && Number.isFinite(n90.medidas)) conclusiones.push(T('Para una determinación de 90 % harían falta {k} medidas por individuo.', { k: Math.ceil(n90.medidas - 1e-9) }));
    cuadros.push(cuadroComponentes(r, T('Componentes de varianza de «{y}»', { y: r.respuesta }), r.fijos.length ? [T('Efectos fijos: {f} (por ejemplo, la cosecha o el año).', { f: r.fijos.join(', ') })] : []));
    cuadros.push({ id: 'repetibilidad', titulo: T('Repetibilidad'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'forma')],
      filas: [{ medida: T('Repetibilidad (r)'), valor: R.r }, { medida: T('EE de r'), valor: R.ee }, { medida: T('Medidas por individuo (media armónica)'), valor: R.m },
        { medida: T('Determinación con esas medidas (R²)'), valor: R.R2 }],
      notas: [T('r = σ²i / (σ²i + σ²e): correlación entre dos medidas del mismo individuo. R² = m·r / (1 + (m − 1)·r) (Falconer y Mackay 1996). EE de r por el método delta.')] });
    cuadros.push({ id: 'medidas', titulo: T('Medidas necesarias por individuo'), columnas: [col('R2', T('Determinación deseada (R²)'), 'forma2'), col('m', T('Medidas (η)'), 'num2'), col('mc', T('Redondeado hacia arriba'), 'entero')],
      filas: r.necesarias.map(x => ({ R2: x.R2, m: x.medidas, mc: Number.isFinite(x.medidas) ? Math.ceil(x.medidas - 1e-9) : NaN })),
      notas: [T('η = R²·(1 − r) / ((1 − R²)·r) (Cruz, Regazzi y Carneiro 2012).')] });
    const ord = r.blup.map((_, j) => j).sort((x, y) => r.blup[y].u - r.blup[x].u);
    cuadros.push({ id: 'individuos', titulo: T('Valor permanente predicho de cada individuo'),
      columnas: [col('orden', T('Orden'), 'entero'), col('ind', r.individuo, 'texto'), col('valor', T('Valor permanente'), 'sig'), col('u', T('Efecto (BLUP)'), 'sig'), col('ee', T('EE (√PEV)'), 'sig'), col('conf', T('Confiabilidad'), 'forma')],
      filas: ord.map((j, k) => ({ orden: k + 1, ind: r.blup[j].individuo, valor: r.media + r.blup[j].u, u: r.blup[j].u, ee: sqrt(r.blup[j].pev), conf: r.blup[j].confiabilidad })),
      notas: [T('Valor permanente = media general + BLUP del individuo: lo que se espera de él en una medida nueva, sin el error temporal.')] });
    return { titulo: T('Repetibilidad'), conclusiones: conclusiones.map(may), cuadros, semaforo: semaforoDe(r, T('individuos')) };
  }
  function codigoRep(e) {
    const fj = lista(e.fijos), fac = [e.individuo].concat(fj);
    return ['# Repetibilidad (código R equivalente a SigmaPro)', 'library(lme4)', CTL,
      `datos <- na.omit(datos[c(${[e.respuesta].concat(fac).map(x => JSON.stringify(x)).join(', ')})])`, ...fac.map(f => `datos$${q(f)} <- factor(datos$${q(f)})`),
      `m <- lmer(${q(e.respuesta)} ~ ${fj.length ? fj.map(q).join(' + ') : '1'} + (1 | ${q(e.individuo)}), data = datos, REML = TRUE, control = ctl)`,
      `vc <- as.data.frame(VarCorr(m)); si <- vc$vcov[1]; se <- vc$vcov[2]`,
      '(r <- si / (si + se))',
      `mh <- 1 / mean(1 / table(datos$${q(e.individuo)}))   # medidas por individuo (media armónica)`,
      'mh * r / (1 + (mh - 1) * r)   # determinación R² con esas medidas',
      'R2 <- c(0.8, 0.85, 0.9, 0.95, 0.99); R2 * (1 - r) / ((1 - R2) * r)   # medidas necesarias',
      `fixef(m)[1] + ranef(m, condVar = TRUE)$${q(e.individuo)}   # valor permanente (con datos balanceados y sin efectos fijos)`].join('\n');
  }

  SP.geneticos = { componentes, heredabilidad, repetibilidad, terminosAleatorios, disenoGenetico, ESTRUCTURAS, OBJETIVOS };

  SP.metodo({
    id: 'componentes-varianza', familia: 'geneticos', motor: 'js', orden: 10, nombre: T('Componentes de varianza (REML)'),
    resumen: T('Cuánta variación aporta cada factor aleatorio (cruzados, anidados o con interacciones), con su error estándar y su prueba.'),
    entradas: { respuesta: { tipo: 'numerica' }, aleatorios: { tipo: 'factor+', maximo: 4 }, fijos: { tipo: 'factor+', opcional: true, maximo: 3 } },
    opciones: { estructura: { tipo: 'texto', omision: 'cruzados' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarComp, calcular: componentes, reporte: reporteComp, codigoR: codigoComp,
  });
  SP.metodo({
    id: 'heredabilidad', familia: 'geneticos', motor: 'js', orden: 20, nombre: T('Heredabilidad y BLUP de genotipos'),
    resumen: T('Heredabilidad en medias, de Cullis y de Piepho; BLUP y BLUE de genotipos y ganancia por selección, en uno o varios ambientes.'),
    entradas: { respuesta: { tipo: 'numerica' }, genotipo: { tipo: 'factor' }, repeticion: { tipo: 'factor', opcional: true }, bloque: { tipo: 'factor', opcional: true }, ambiente: { tipo: 'factor', opcional: true } },
    opciones: { seleccion: { tipo: 'numero', omision: 0.1 }, direccion: { tipo: 'texto', omision: 'mayor' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarH, calcular: heredabilidad, reporte: reporteH, codigoR: codigoH,
  });
  SP.metodo({
    id: 'repetibilidad', familia: 'geneticos', motor: 'js', orden: 30, nombre: T('Repetibilidad'),
    resumen: T('Correlación entre medidas repetidas del mismo individuo, medidas necesarias y valor permanente de cada uno.'),
    entradas: { respuesta: { tipo: 'numerica' }, individuo: { tipo: 'factor' }, fijos: { tipo: 'factor+', opcional: true, maximo: 3 } },
    opciones: { alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarRep, calcular: repetibilidad, reporte: reporteRep, codigoR: codigoRep,
  });
});

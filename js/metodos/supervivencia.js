/* SigmaPro — supervivencia (familia Supervivencia y series de tiempo), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tiempo hasta un evento (germinar, morir, florecer, brotar) con censura (la unidad terminó el ensayo sin el evento):
   - kaplan-meier: la curva de cada grupo con su intervalo, la mediana y los cuartiles con sus intervalos, y la
     comparación de las curvas (log-rank o Peto-Peto, también estratificada), como survfit y survdiff;
   - cox: el modelo de riesgos proporcionales con factores y covariables (y estratos, cada uno con su riesgo base),
     razones de riesgo con su intervalo, las tres pruebas globales, la concordancia y la prueba de riesgos
     proporcionales, como coxph y cox.zph. */
SP.definir('metodos-supervivencia', function (SP) {
  'use strict';
  const T = SP.T;
  const S = () => SP.supervivencia;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sig = x => SP.formatos.texto(x, 'sig');
  const f2 = x => SP.formatos.texto(x, 'forma2');
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + SP.formatos.texto(p, 'forma'));
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const colorP = p => (!Number.isFinite(p) ? 'gris' : p >= 0.05 ? 'verde' : p >= 0.01 ? 'ambar' : 'rojo');
  const PROBS = [0.25, 0.5, 0.75];
  const CONF = { log: 'log', 'log-log': 'log-log', plain: T('lineal (plain)') };

  /** Tiempo, evento (0/1) y, si hay, los códigos de grupo, sin las filas con faltantes. */
  function leer(tabla, e, factores) {
    const tv = tabla.col(e.tiempo).valores, ev = tabla.col(e.evento).valores, fs = (factores || []).map(f => SP.estructura.comoFactor(tabla, f));
    const filas = [];
    for (let i = 0; i < tabla.n; i++) if (tv[i] === tv[i] && ev[i] === ev[i] && fs.every(f => f.codigos[i] >= 0)) filas.push(i);
    exigir(filas.length >= 2, T('Hacen falta al menos dos unidades con tiempo y evento.'));
    for (const i of filas) {
      exigir(ev[i] === 0 || ev[i] === 1, T('«{e}» debe valer 1 (ocurrió el evento: germinó, murió, floreció) o 0 (censura: terminó sin el evento).', { e: e.evento }));
      exigir(tv[i] >= 0, T('«{t}» no puede ser negativo.', { t: e.tiempo }));
    }
    exigir(filas.some(i => ev[i] === 1), T('Ninguna unidad tuvo el evento: no hay curva que estimar.'));
    return { filas, t: filas.map(i => tv[i]), ev: filas.map(i => ev[i]), fs, excluidas: tabla.n - filas.length };
  }

  /* ======================= Kaplan-Meier ======================= */
  function calcularKM(tabla, e, op) {
    const L = leer(tabla, e, (e.grupo ? [e.grupo] : []).concat(e.estrato ? [e.estrato] : [])), conf = { tipo: op.conf, nivel: +op.nivel };
    const fe = e.estrato ? L.fs[L.fs.length - 1] : null, estr = fe ? L.filas.map(i => fe.codigos[i]) : null;
    let niveles = ['todos'], cod = L.filas.map(() => 0);
    if (e.grupo) {
      const f = L.fs[0], usados = [...new Set(L.filas.map(i => f.codigos[i]))].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      niveles = usados.map(c => f.niveles[c]); cod = L.filas.map(i => mapa.get(f.codigos[i]));
      exigir(niveles.length >= 2, T('«{g}» tiene un solo grupo con datos: quita el grupo para ver una sola curva.', { g: e.grupo }));
      exigir(niveles.length <= 12, T('Hasta 12 grupos.'));
    }
    const grupos = niveles.map((nombre, k) => {
      const t = [], ev = [];
      cod.forEach((c, j) => { if (c === k) { t.push(L.t[j]); ev.push(L.ev[j]); } });
      const curva = S().km(t, ev, conf), q = S().cuantiles(curva, PROBS);
      const { n, total_eventos, ...resto } = curva;
      return { nombre, n, eventos: total_eventos, curva: resto, cuantiles: { tiempo: q.map(x => x.tiempo), inf: q.map(x => x.inf), sup: q.map(x => x.sup) } };
    });
    const r = { tipo: 'supervivencia', metodo: 'kaplan-meier', tiempo: e.tiempo, evento: e.evento, grupo: e.grupo || '', estrato: e.estrato || '', conf: op.conf, nivel: +op.nivel, rho: +op.rho,
      n: L.t.length, excluidas: L.excluidas, grupos };
    if (e.grupo) r.comparacion = Object.assign(S().logrank(L.t, L.ev, cod, niveles.length, +op.rho, estr), { rho: +op.rho, estratos: estr ? new Set(estr).size : 1 });
    return r;
  }
  const corto = x => String(Number((+x).toPrecision(6)));   // un tiempo de los datos tal cual (17, no 17.00)
  const tiempoTxt = v => (Number.isFinite(v) ? corto(v) : T('no se alcanza'));
  function reporteKM(r) {
    const c = [], u = r.tiempo;
    for (const g of r.grupos) {
      const m = g.cuantiles.tiempo[1];
      c.push(Number.isFinite(m) ? T('{g}la mediana de «{t}» hasta el evento es {m} (IC {k} %: {i} a {s}), con {e} eventos de {n}.', { g: r.grupo ? T('En {x}, ', { x: g.nombre }) : '', m: corto(m), t: u, k: Math.round(100 * r.nivel), i: tiempoTxt(g.cuantiles.inf[1]), s: tiempoTxt(g.cuantiles.sup[1]), e: g.eventos, n: g.n })
        : T('{g}la curva no bajó a la mitad: la mediana no se alcanza ({e} eventos de {n}; al final quedan {p} % sin el evento).', { g: r.grupo ? T('En {x}, ', { x: g.nombre }) : '', e: g.eventos, n: g.n, p: SP.formatos.texto(100 * g.curva.S[g.curva.S.length - 1], 'pct') }));
    }
    if (r.comparacion) {
      const C = r.comparacion, prueba = (r.rho === 1 ? 'Peto-Peto' : 'log-rank') + (r.estrato ? T(' estratificada por «{s}»', { s: r.estrato }) : '');
      c.push(C.p < 0.05 ? T('Las curvas difieren: {pr} χ²({g}) = {x}, p {p}.', { pr: prueba, g: C.gl, x: f2(C.chi2), p: fp(C.p) }) : T('No hay evidencia de que las curvas difieran: {pr} χ²({g}) = {x}, p {p}.', { pr: prueba, g: C.gl, x: f2(C.chi2), p: fp(C.p) }));
    }
    const cuadros = [{ id: 'resumen', titulo: T('Mediana y cuartiles del tiempo hasta el evento'),
      columnas: [col('g', r.grupo || T('Curva'), 'texto'), col('n', 'n', 'entero'), col('e', T('Eventos'), 'entero'), col('q1', T('Cuartil 25 %'), 'sigEnt'), col('m', T('Mediana'), 'sigEnt'),
        col('mi', T('IC inferior'), 'sigEnt'), col('ms', T('IC superior'), 'sigEnt'), col('q3', T('Cuartil 75 %'), 'sigEnt')],
      filas: r.grupos.map(g => ({ g: g.nombre, n: g.n, e: g.eventos, q1: g.cuantiles.tiempo[0], m: g.cuantiles.tiempo[1], mi: g.cuantiles.inf[1], ms: g.cuantiles.sup[1], q3: g.cuantiles.tiempo[2] })),
      notas: [T('El cuartil 25 % es el tiempo en que una cuarta parte tuvo el evento. «—»: la curva (o su límite) no baja hasta ahí.'), T('Intervalos {c} al {k} % (survfit).', { c: CONF[r.conf], k: Math.round(100 * r.nivel) })] }];
    if (r.comparacion) {
      const C = r.comparacion;
      cuadros.push({ id: 'comparacion', titulo: r.rho === 1 ? T('Comparación de las curvas (Peto-Peto)') : T('Comparación de las curvas (log-rank)'),
        columnas: [col('g', r.grupo, 'texto'), col('n', 'n', 'entero'), col('o', T('Observados'), 'forma2'), col('e', T('Esperados'), 'forma2'), col('oe', '(O − E)²/E', 'forma2')],
        filas: r.grupos.map((g, h) => ({ g: g.nombre, n: g.n, o: C.observados[h], e: C.esperados[h], oe: (C.observados[h] - C.esperados[h]) ** 2 / C.esperados[h] })),
        notas: [T('χ²({g}) = {x}, p {p}.', { g: C.gl, x: f2(C.chi2), p: fp(C.p) })].concat(r.estrato ? [T('Estratificada por «{s}» ({k} estratos): cada estrato compara sus grupos con su propio riesgo base y se suman los observados, los esperados y la varianza (survdiff con strata).', { s: r.estrato, k: C.estratos })] : [], [r.rho === 1 ? T('Peto-Peto pesa cada tiempo con la supervivencia conjunta: da más peso a las diferencias tempranas.') : T('Log-rank: el mismo peso a todos los tiempos; es la más potente si los riesgos son proporcionales.')]) });
    }
    const filas = [];
    for (const g of r.grupos) g.curva.tiempo.forEach((t, i) => { if (g.curva.eventos[i] > 0 && filas.length < 400) filas.push({ g: g.nombre, t, n: g.curva.n_riesgo[i], d: g.curva.eventos[i], s: g.curva.S[i], ee: g.curva.S[i] * g.curva.ee[i], i: g.curva.inf[i], u: g.curva.sup[i] }); });
    cuadros.push({ id: 'curva', titulo: T('Tabla de supervivencia (tiempos con eventos)'),
      columnas: (r.grupo ? [col('g', r.grupo, 'texto')] : []).concat([col('t', r.tiempo, 'sig'), col('n', T('En riesgo'), 'entero'), col('d', T('Eventos'), 'entero'), col('s', T('Supervivencia'), 'forma'),
        col('ee', T('EE'), 'forma'), col('i', T('IC inferior'), 'forma'), col('u', T('IC superior'), 'forma')]), filas,
      notas: [T('EE de Greenwood. La supervivencia es la proporción que sigue sin el evento.')] });
    const censuras = r.grupos.reduce((s, g) => s + g.n - g.eventos, 0);
    const semaforo = [{ nombre: T('Censura'), color: censuras / r.n > 0.5 ? 'ambar' : 'verde', texto: T('{c} de {n} unidades censuradas ({p} %).', { c: censuras, n: r.n, p: SP.formatos.texto(100 * censuras / r.n, 'pct') }) }];
    return { titulo: r.grupo ? T('Kaplan-Meier: «{t}» por «{g}»', { t: r.tiempo, g: r.grupo }) : T('Kaplan-Meier: «{t}»', { t: r.tiempo }), conclusiones: c.map(may), cuadros, semaforo };
  }
  function codigoKM(e, op) {
    const ti = nomR(e.tiempo), en = nomR(e.evento), f = `Surv(${ti}, ${en}) ~ ${e.grupo ? 'g' : '1'}`;
    return ['# Kaplan-Meier (código R equivalente a SigmaPro)', 'library(survival)',
      `d <- na.omit(data.frame(${ti} = datos[[${JSON.stringify(e.tiempo)}]], ${en} = datos[[${JSON.stringify(e.evento)}]]${e.grupo ? `, g = factor(datos[[${JSON.stringify(e.grupo)}]])` : ''}${e.estrato ? `, s = factor(datos[[${JSON.stringify(e.estrato)}]])` : ''}, check.names = FALSE))`,
      `fit <- survfit(${f}, data = d, conf.type = "${op.conf}", conf.int = ${op.nivel})`, 'summary(fit)',
      'q <- quantile(fit, c(0.25, 0.5, 0.75)); q   # cuartiles y mediana con su IC'].concat(e.grupo ? [`sd <- survdiff(${f}${e.estrato ? ' + strata(s)' : ''}, data = d, rho = ${op.rho}); sd   # ${+op.rho === 1 ? 'Peto-Peto' : 'log-rank'}${e.estrato ? ' estratificada' : ''}`] : []).join('\n');
  }
  const nomR = n => (/^[A-Za-z.][A-Za-z0-9._]*$/.test(n) ? n : '`' + n.replace(/`/g, '') + '`');

  /* ======================= Cox ======================= */
  function calcularCox(tabla, e, op) {
    const factores = [].concat(e.factores || []), covs = [].concat(e.covariables || []);
    const L = leer(tabla, e, factores.concat(e.estrato ? [e.estrato] : [])), n = L.t.length;
    const columnas = [], nombres = [], terminos = [], fe = e.estrato ? L.fs[factores.length] : null;
    L.fs.slice(0, factores.length).forEach((f, k) => {
      const usados = [...new Set(L.filas.map(i => f.codigos[i]))].sort((a, b) => a - b);
      exigir(usados.length >= 2, T('«{f}» tiene un solo nivel con datos.', { f: factores[k] }));
      const cols = [];
      for (const c of usados.slice(1)) { cols.push(columnas.length); columnas.push(L.filas.map(i => (f.codigos[i] === c ? 1 : 0))); nombres.push(factores[k] + f.niveles[c]); }
      terminos.push({ nombre: factores[k], columnas: cols, niveles: usados.map(c => f.niveles[c]) });
    });
    const filasOk = L.filas.map((i, j) => covs.every(cv => { const v = tabla.col(cv).valores[i]; return v === v; }));
    for (const cv of covs) { const v = tabla.col(cv).valores; terminos.push({ nombre: cv, columnas: [columnas.length] }); columnas.push(L.filas.map(i => v[i])); nombres.push(cv); }
    const usar = filasOk.map((ok, j) => (ok ? j : -1)).filter(j => j >= 0);
    const t = usar.map(j => L.t[j]), ev = usar.map(j => L.ev[j]), X = usar.map(j => columnas.map(c => c[j])), estr = fe ? usar.map(j => fe.codigos[L.filas[j]]) : null;
    exigir(columnas.length >= 1, T('Elige al menos un factor o una covariable.'));
    exigir(ev.reduce((a, b) => a + b, 0) > columnas.length, T('Hay muy pocos eventos para tantos coeficientes.'));
    const empates = op.empates === 'breslow' ? 'breslow' : 'efron', A = S().cox(t, ev, X, { empates, estratos: estr });
    const z = SP.dist.qnorm(1 - (1 - op.nivel) / 2, 0, 1, true), b = A.coef, ee = A.ee, p = b.length;
    const lp = X.map(f => f.reduce((s, v, j) => s + v * b[j], 0)), cc = S().concordancia(t, ev, lp, estr);
    const zph = S().zph(t, ev, X, b, empates === 'efron', terminos.map(tm => ({ nombre: tm.nombre, columnas: tm.columnas })), estr);
    const pc = x => SP.dist.pchisq(x, p, false);
    return { tipo: 'supervivencia', metodo: 'cox', tiempo: e.tiempo, evento: e.evento, factores, covariables: covs, estrato: e.estrato || '', estratos: estr ? new Set(estr).size : 1, empates, nivel: +op.nivel, terminos,
      nombres, coef: b, ee, z: b.map((v, j) => v / ee[j]), p: b.map((v, j) => 2 * SP.dist.pnorm(-Math.abs(v / ee[j]), 0, 1, true)),
      hr: b.map(v => Math.exp(v)), hr_inf: b.map((v, j) => Math.exp(v - z * ee[j])), hr_sup: b.map((v, j) => Math.exp(v + z * ee[j])),
      ll0: A.ll0, ll: A.ll, lr: A.lr, score: A.score, wald: A.wald, gl: p, p_lr: pc(A.lr), p_score: pc(A.score), p_wald: pc(A.wald),
      n: t.length, eventos: ev.reduce((a, v) => a + v, 0), excluidas: tabla.n - t.length, convergio: A.convergio, iteraciones: A.iteraciones,
      concordancia: cc, zph: { terminos: zph.terminos.map(x => x.termino).concat(['GLOBAL']), chi2: zph.terminos.map(x => x.chi2).concat([zph.global.chi2]),
        gl: zph.terminos.map(x => x.gl).concat([zph.global.gl]), p: zph.terminos.map(x => x.p).concat([zph.global.p]) },
      lp, t, ev };
  }
  function reporteCox(r) {
    const c = [], k = Math.round(100 * r.nivel);
    c.push(r.p_lr < 0.05 ? T('El modelo explica el riesgo del evento: razón de verosimilitudes χ²({g}) = {x}, p {p}.', { g: r.gl, x: f2(r.lr), p: fp(r.p_lr) })
      : T('El modelo no explica el riesgo mejor que el azar: razón de verosimilitudes χ²({g}) = {x}, p {p}.', { g: r.gl, x: f2(r.lr), p: fp(r.p_lr) }));
    r.nombres.forEach((nm, j) => {
      const hr = r.hr[j], cambio = hr >= 1 ? T('{x} veces mayor', { x: sig(hr) }) : T('{x} % menor', { x: SP.formatos.texto(100 * (1 - hr), 'pct') });
      const tm = r.terminos.find(x => x.columnas.includes(j)), dq = tm && tm.niveles ? T('{nv} frente a {ref}', { nv: nm.slice(tm.nombre.length), ref: tm.niveles[0] }) : T('cada unidad más de «{v}»', { v: nm });
      if (r.p[j] < 0.05) c.push(T('Con {d}, el riesgo instantáneo del evento es {c} (HR = {h}; IC {k} %: {i} a {s}; p {p}).', { d: dq, c: cambio, h: sig(hr), k, i: sig(r.hr_inf[j]), s: sig(r.hr_sup[j]), p: fp(r.p[j]) }));
    });
    if (!r.p.some(p => p < 0.05)) c.push(T('Ningún coeficiente difiere de cero (p ≥ 0.05).'));
    const cuadros = [{ id: 'coeficientes', titulo: T('Coeficientes y razones de riesgo'),
      columnas: [col('v', T('Término'), 'texto'), col('b', T('Coeficiente'), 'forma'), col('ee', T('EE'), 'forma'), col('z', 'z', 'forma2'), col('p', 'p', 'pvalor'),
        col('hr', 'HR', 'forma'), col('i', T('HR inferior'), 'forma'), col('s', T('HR superior'), 'forma')],
      filas: r.nombres.map((v, j) => ({ v, b: r.coef[j], ee: r.ee[j], z: r.z[j], p: r.p[j], hr: r.hr[j], i: r.hr_inf[j], s: r.hr_sup[j] })),
      notas: [T('HR = exp(coeficiente): el cociente de los riesgos instantáneos. HR > 1, el evento llega antes; HR < 1, después.'),
        T('Empates de {e}; intervalos de Wald al {k} %. En los factores, cada nivel se compara con el primero.', { e: r.empates === 'efron' ? 'Efron' : 'Breslow', k })]
        .concat(r.estrato ? [T('Estratificado por «{s}» ({m} estratos): cada estrato tiene su propio riesgo base, sin coeficiente; los HR son los mismos en todos.', { s: r.estrato, m: r.estratos })] : []) },
    { id: 'pruebas', titulo: T('Pruebas globales (todos los coeficientes = 0)'), columnas: [col('t', T('Prueba'), 'texto'), col('x', 'χ²', 'forma2'), col('g', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: [{ t: T('Razón de verosimilitudes'), x: r.lr, g: r.gl, p: r.p_lr }, { t: 'Wald', x: r.wald, g: r.gl, p: r.p_wald }, { t: T('Score (log-rank)'), x: r.score, g: r.gl, p: r.p_score }],
      notas: [T('Log-verosimilitud parcial: {a} sin covariables y {b} con ellas. n = {n}, {e} eventos.', { a: f2(r.ll0), b: f2(r.ll), n: r.n, e: r.eventos }),
        T('Concordancia (C de Harrell) = {c}: la proporción de pares en que el de mayor riesgo predicho tuvo antes el evento.', { c: SP.formatos.texto(r.concordancia.C, 'forma') })] },
    { id: 'proporcionales', titulo: T('Prueba de riesgos proporcionales'), columnas: [col('t', T('Término'), 'texto'), col('x', 'χ²', 'forma2'), col('g', 'gl', 'entero'), col('p', 'p', 'pvalor')],
      filas: r.zph.terminos.map((t, j) => ({ t: t === 'GLOBAL' ? T('Global') : t, x: r.zph.chi2[j], g: r.zph.gl[j], p: r.zph.p[j] })),
      notas: [T('Prueba score de que el efecto cambie con el tiempo (cox.zph, con la escala de Kaplan-Meier). p < 0.05: el riesgo no es proporcional.')] }];
    const pg = r.zph.p[r.zph.p.length - 1];
    const semaforo = [{ nombre: T('Riesgos proporcionales'), color: colorP(pg), texto: pg >= 0.05 ? T('Sin evidencia de que los efectos cambien con el tiempo (p {p}).', { p: fp(pg) }) : T('El efecto cambia con el tiempo (p {p}): los HR son un promedio; considera estratificar o separar el tiempo.', { p: fp(pg) }) },
      { nombre: T('Eventos por coeficiente'), color: r.eventos / r.gl >= 10 ? 'verde' : r.eventos / r.gl >= 5 ? 'ambar' : 'rojo', texto: T('{e} eventos para {g} coeficientes ({x} por coeficiente; se recomiendan 10 o más).', { e: r.eventos, g: r.gl, x: f2(r.eventos / r.gl) }) },
      { nombre: T('Convergencia'), color: r.convergio && r.coef.every(b => Math.abs(b) < 15) ? 'verde' : 'rojo', texto: r.convergio && r.coef.every(b => Math.abs(b) < 15) ? T('El ajuste llegó al óptimo.') : T('Algún coeficiente se va al infinito (un grupo sin eventos o separación): la razón de riesgo no es confiable.') }];
    return { titulo: T('Modelo de Cox: «{t}»', { t: r.tiempo }), conclusiones: c.map(may), cuadros, semaforo };
  }
  function codigoCox(e, op) {
    const fs = [].concat(e.factores || []), cs = [].concat(e.covariables || []), vars = fs.concat(cs);
    const cols = [e.tiempo, e.evento].concat(vars, e.estrato ? [e.estrato] : []).map(v => `${nomR(v)} = datos[[${JSON.stringify(v)}]]`).join(', ');
    return ['# Modelo de riesgos proporcionales de Cox (código R equivalente a SigmaPro)', 'library(survival)', `d <- na.omit(data.frame(${cols}, check.names = FALSE))`]
      .concat(fs.map(f => `d$${nomR(f)} <- factor(d$${nomR(f)})`), [
        `fit <- coxph(Surv(${nomR(e.tiempo)}, ${nomR(e.evento)}) ~ ${vars.map(nomR).join(' + ')}${e.estrato ? ` + strata(${nomR(e.estrato)})` : ''}, data = d, ties = "${op.empates === 'breslow' ? 'breslow' : 'efron'}")`,
        `summary(fit, conf.int = ${op.nivel})   # coeficientes, HR con su IC, pruebas globales y concordancia`,
        'zph <- cox.zph(fit); zph   # riesgos proporcionales']).join('\n');
  }

  SP.metodosSupervivencia = { leer };
  SP.metodo({ id: 'kaplan-meier', familia: 'supervivencia', motor: 'js', orden: 10, nombre: T('Curvas de supervivencia (Kaplan-Meier)'),
    resumen: T('Tiempo hasta germinar, morir o florecer con censura: la curva de cada grupo, su mediana y la prueba log-rank.'),
    entradas: { tiempo: { tipo: 'numerica' }, evento: { tipo: 'numerica' }, grupo: { tipo: 'factor', opcional: true }, estrato: { tipo: 'factor', opcional: true } },
    opciones: { conf: { tipo: 'texto', omision: 'log' }, nivel: { tipo: 'numero', omision: 0.95 }, rho: { tipo: 'numero', omision: 0 } },
    validar: (t, e, op) => {
      exigir(e.tiempo && t.columnas[e.tiempo] && e.evento && t.columnas[e.evento], T('Elige la columna del tiempo y la del evento.'));
      exigir(e.tiempo !== e.evento && e.grupo !== e.tiempo && e.grupo !== e.evento, T('Cada columna va en un solo papel.'));
      if (e.estrato) {
        exigir(e.grupo, T('Los estratos sirven para comparar grupos: elige también los grupos.'));
        exigir(t.columnas[e.estrato] && ![e.tiempo, e.evento, e.grupo].includes(e.estrato), T('El estrato debe ser otra columna.'));
      }
      exigir(['log', 'log-log', 'plain'].includes(op.conf), T('Intervalo desconocido.'));
      exigir(+op.rho === 0 || +op.rho === 1, T('La prueba es log-rank (ρ = 0) o Peto-Peto (ρ = 1).'));
    }, calcular: calcularKM, reporte: reporteKM, codigoR: codigoKM });
  SP.metodo({ id: 'cox', familia: 'supervivencia', motor: 'js', orden: 20, nombre: T('Modelo de riesgos proporcionales de Cox'),
    resumen: T('El efecto de tratamientos y covariables sobre el riesgo del evento: razones de riesgo con su intervalo.'),
    entradas: { tiempo: { tipo: 'numerica' }, evento: { tipo: 'numerica' }, factores: { tipo: 'factor+', opcional: true, maximo: 4 }, covariables: { tipo: 'numerica+', opcional: true, maximo: 10 }, estrato: { tipo: 'factor', opcional: true } },
    opciones: { empates: { tipo: 'texto', omision: 'efron' }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar: (t, e, op) => {
      exigir(e.tiempo && t.columnas[e.tiempo] && e.evento && t.columnas[e.evento], T('Elige la columna del tiempo y la del evento.'));
      const vs = [].concat(e.factores || [], e.covariables || []);
      exigir(vs.length >= 1, T('Elige al menos un factor o una covariable.'));
      exigir(new Set([e.tiempo, e.evento].concat(vs, e.estrato ? [e.estrato] : [])).size === vs.length + 2 + (e.estrato ? 1 : 0), T('Cada columna va en un solo papel.'));
      if (e.estrato) exigir(t.columnas[e.estrato], T('No existe la columna «{c}».', { c: e.estrato }));
      vs.forEach(v => exigir(t.columnas[v], T('No existe la columna «{c}».', { c: v })));
    }, calcular: calcularCox, reporte: reporteCox, codigoR: codigoCox });
});

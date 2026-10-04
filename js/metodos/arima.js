/* SigmaPro — modelos ARIMA (familia Supervivencia y series de tiempo), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   arima: un modelo ARIMA(p, d, q) o SARIMA(p, d, q)(P, D, Q)s por máxima verosimilitud exacta, como arima de R; o la
   búsqueda del orden por AIC entre p, q = 0…2 (y P, Q = 0…1 con periodo), con d y D dados. Con los coeficientes y su
   EE, σ², la verosimilitud, AIC y BIC, la prueba de Ljung-Box de los residuos y el pronóstico con su intervalo, como
   predict.Arima. La serie se ordena por la columna del tiempo; los faltantes se quedan en su lugar (el filtro de
   Kalman los salta). */
SP.definir('metodos-arima', function (SP) {
  'use strict';
  const T = SP.T;
  const A = () => SP.arima;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sig = x => SP.formatos.texto(x, 'sig');
  const f2 = x => SP.formatos.texto(x, 'forma2');
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + SP.formatos.texto(p, 'forma'));
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const ent = v => Math.max(0, Math.round(+v || 0));

  /** La serie en el orden del tiempo, con los faltantes en su lugar. */
  function serie(tabla, e) {
    const y = tabla.col(e.respuesta).valores, tv = e.tiempo ? tabla.col(e.tiempo).valores : null;
    let idx = [...Array(tabla.n).keys()];
    if (tv) {
      exigir(idx.every(i => tv[i] === tv[i]), T('La columna del tiempo «{t}» tiene faltantes.', { t: e.tiempo }));
      idx.sort((a, b) => tv[a] - tv[b] || a - b);
      for (let k = 1; k < idx.length; k++) exigir(tv[idx[k]] !== tv[idx[k - 1]], T('«{t}» repite el tiempo {v}: cada tiempo debe aparecer una vez.', { t: e.tiempo, v: tv[idx[k]] }));
    }
    return { x: idx.map(i => y[i]), tiempos: tv ? idx.map(i => tv[i]) : idx.map((_, k) => k + 1) };
  }
  const orden = op => ({ p: ent(op.p), d: ent(op.d), q: ent(op.q), P: ent(op.P), D: ent(op.D), Q: ent(op.Q), s: ent(op.periodo), media: op.media !== false && op.media !== 'no' });
  const nombreModelo = o => (o.P || o.D || o.Q ? `ARIMA(${o.p}, ${o.d}, ${o.q})(${o.P}, ${o.D}, ${o.Q})${o.s}` : `ARIMA(${o.p}, ${o.d}, ${o.q})`);
  const lagBoxDe = (op, o, n) => (+op.lagBox > 0 ? Math.min(+op.lagBox, n - 1) : o.s > 1 && (o.P + o.D + o.Q) > 0 ? Math.min(2 * o.s, n - 1) : Math.min(10, n - 1));

  /** La autocorrelación con faltantes, como acf(na.action = na.pass). */
  function acfNA(x, L) {
    const v = x.filter(z => z === z), m = v.reduce((a, b) => a + b, 0) / v.length, d = x.map(z => z - m), out = [];
    for (let k = 0; k <= L; k++) { let s = 0, nu = 0; for (let t = 0; t + k < x.length; t++) if (d[t] === d[t] && d[t + k] === d[t + k]) { s += d[t] * d[t + k]; nu++; } out.push(nu > 0 ? s / (nu + k) : NaN); }
    return out.map(c => c / out[0]);
  }

  function calcular(tabla, e, op) {
    const S = serie(tabla, e), nobs = S.x.filter(v => v === v).length;
    exigir(nobs >= 8, T('Hacen falta al menos 8 observaciones.'));
    let o = orden(op);
    if (o.P + o.D + o.Q > 0) exigir(o.s >= 2, T('Con parte estacional hace falta el periodo (12 para meses, 4 para trimestres).'));
    exigir(o.p <= 5 && o.q <= 5 && o.P <= 2 && o.Q <= 2 && o.d <= 2 && o.D <= 1, T('Órdenes hasta p, q ≤ 5, P, Q ≤ 2, d ≤ 2 y D ≤ 1.'));
    let busqueda = null;
    if (op.buscar === true || op.buscar === 'si') {
      /* la rejilla de R: p, q = 0…2 y, con periodo, P, Q = 0…1 (los mismos d y D) */
      const est = o.s > 1, filas = [];
      for (let P = 0; P <= (est ? 1 : 0); P++) for (let Q = 0; Q <= (est ? 1 : 0); Q++) for (let p = 0; p <= 2; p++) for (let q = 0; q <= 2; q++) {
        let aic = NaN;
        try { aic = A().ajustar(S.x, Object.assign({}, o, { p, q, P, Q, soloAIC: true })).aic; } catch (err) { /* no se pudo ajustar */ }
        filas.push({ p, q, P, Q, aic });
      }
      const ok = filas.filter(f => Number.isFinite(f.aic));
      exigir(ok.length, T('Ningún modelo de la búsqueda se pudo ajustar.'));
      const mejor = ok.reduce((a, b) => (b.aic < a.aic ? b : a));
      o = Object.assign({}, o, { p: mejor.p, q: mejor.q, P: mejor.P, Q: mejor.Q });
      busqueda = { aic: filas.map(f => f.aic), modelos: filas.map(f => nombreModelo(Object.assign({}, o, f))), elegido: [mejor.p, mejor.q, mejor.P, mejor.Q] };
    }
    const aj = A().ajustar(S.x, o), h = Math.max(1, Math.min(120, ent(op.horizonte) || 12)), z = SP.dist.qnorm(1 - (1 - op.nivel) / 2, 0, 1, true);
    const pr = A().predecir(aj, h), lag = lagBoxDe(op, o, S.x.length), k = o.p + o.q + o.P + o.Q;
    exigir(lag > k, T('Los rezagos de Ljung-Box deben ser más que los parámetros ARMA ({k}).', { k }));
    const ac = acfNA(aj.residuos, lag), nRes = aj.residuos.filter(v => v === v).length;
    let qlb = 0; for (let j = 1; j <= lag; j++) qlb += ac[j] * ac[j] / (nRes - j);
    qlb *= nRes * (nRes + 2);
    const paso = S.tiempos.length > 1 ? S.tiempos[S.tiempos.length - 1] - S.tiempos[S.tiempos.length - 2] : 1;
    return { tipo: 'series', metodo: 'arima', respuesta: e.respuesta, tiempoCol: e.tiempo || '', orden: o, modelo: nombreModelo(o), nivel: +op.nivel,
      coef: aj.coef, nombres: aj.nombres, ee: aj.ee, sigma2: aj.sigma2, loglik: aj.loglik, aic: aj.aic, bic: aj.bic, n: aj.nUsed, residuos: aj.residuos,
      pronostico: { media: pr.media, ee: pr.ee, inf: pr.media.map((m, i) => m - z * pr.ee[i]), sup: pr.media.map((m, i) => m + z * pr.ee[i]),
        tiempos: pr.media.map((_, i) => S.tiempos[S.tiempos.length - 1] + (i + 1) * paso) },
      box: { q: qlb, gl: lag - k, p: SP.dist.pchisq(qlb, lag - k, false), lag }, busqueda, avisos: aj.avisos, x: S.x, tiempos: S.tiempos, acfResiduos: ac };
  }
  const NOMBRE_COEF = n => ({ intercept: T('media') }[n] || n);
  function reporte(r) {
    const k = Math.round(100 * r.nivel), o = r.orden, B = r.box, c = [];
    c.push(T('Modelo {m}{b}: σ² = {s}, AIC = {a}.', { m: r.modelo, b: r.busqueda ? T(' (el de menor AIC de {k} probados)', { k: r.busqueda.aic.filter(Number.isFinite).length }) : '', s: sig(r.sigma2), a: f2(r.aic) }));
    c.push(B.p >= 0.05 ? T('Los residuos se comportan como ruido blanco: Ljung-Box Q({g}) = {q}, p {p}.', { g: B.gl, q: f2(B.q), p: fp(B.p) })
      : T('Los residuos todavía tienen autocorrelación (Ljung-Box Q({g}) = {q}, p {p}): prueba otro orden.', { g: B.gl, q: f2(B.q), p: fp(B.p) }));
    c.push(T('Pronóstico a {h} pasos: {m} (IC {k} %: {i} a {s}) en el último.', { h: r.pronostico.media.length, m: sig(r.pronostico.media[r.pronostico.media.length - 1]), k,
      i: sig(r.pronostico.inf[r.pronostico.inf.length - 1]), s: sig(r.pronostico.sup[r.pronostico.sup.length - 1]) }));
    const cuadros = [{ id: 'coeficientes', titulo: T('Coeficientes'), columnas: [col('t', T('Término'), 'texto'), col('b', T('Estimación'), 'forma'), col('ee', T('EE'), 'forma'), col('z', 'z', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.nombres.map((n, j) => ({ t: NOMBRE_COEF(n), b: r.coef[j], ee: r.ee[j], z: r.coef[j] / r.ee[j], p: 2 * SP.dist.pnorm(-Math.abs(r.coef[j] / r.ee[j]), 0, 1, true) })),
      notas: [T('ar: autorregresivos; ma: medias móviles; sar y sma: los estacionales; media: la media de la serie (solo sin diferenciar).'),
        T('EE del hessiano numérico, como arima; z y p con la aproximación normal.')] },
    { id: 'ajuste', titulo: T('Ajuste'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'sigEnt')],
      filas: [{ m: T('Observaciones usadas'), v: r.n }, { m: 'σ²', v: r.sigma2 }, { m: T('Log-verosimilitud'), v: r.loglik }, { m: 'AIC', v: r.aic }, { m: 'BIC', v: r.bic },
        { m: T('Ljung-Box Q ({l} rezagos)', { l: B.lag }), v: B.q }, { m: T('gl'), v: B.gl }, { m: 'p', v: B.p }],
      notas: [T('Ljung-Box de los residuos con gl = rezagos − (p + q + P + Q).')] },
    { id: 'pronostico', titulo: T('Pronóstico'), columnas: [col('h', T('Paso'), 'entero'), col('t', r.tiempoCol || T('Tiempo'), 'sigEnt'), col('m', T('Pronóstico'), 'sig'), col('ee', T('EE'), 'sig'),
      col('i', T('IC inferior'), 'sig'), col('s', T('IC superior'), 'sig')],
      filas: r.pronostico.media.map((m, i) => ({ h: i + 1, t: r.pronostico.tiempos[i], m, ee: r.pronostico.ee[i], i: r.pronostico.inf[i], s: r.pronostico.sup[i] })),
      notas: [T('Intervalos al {k} % (± z·EE), como predict de arima.', { k })] }];
    if (r.busqueda) cuadros.push({ id: 'busqueda', titulo: T('Modelos comparados por AIC'), columnas: [col('m', T('Modelo'), 'texto'), col('a', 'AIC', 'forma2')],
      filas: r.busqueda.modelos.map((m, i) => ({ m, a: r.busqueda.aic[i] })).sort((a, b) => (Number.isFinite(a.a) ? a.a : Infinity) - (Number.isFinite(b.a) ? b.a : Infinity)),
      notas: [T('Mismos d y D; «—»: el modelo no se pudo ajustar. Menor AIC es mejor.')] });
    const semaforo = [{ nombre: T('Residuos sin autocorrelación'), color: B.p >= 0.05 ? 'verde' : B.p >= 0.01 ? 'ambar' : 'rojo', texto: T('Ljung-Box Q({g}) = {q}, p {p}.', { g: B.gl, q: f2(B.q), p: fp(B.p) }) }];
    if (r.avisos && r.avisos.length) semaforo.push({ nombre: T('Ajuste'), color: 'ambar', texto: r.avisos.join(' ') });
    return { titulo: T('{m} de «{y}»', { m: r.modelo, y: r.respuesta }), conclusiones: c.map(may), cuadros, semaforo };
  }
  function codigoR(e, op, ctx) {
    const r = ctx && ctx.resultado, o = r ? r.orden : orden(op), k = o.p + o.q + o.P + o.Q + (o.media && o.d + o.D === 0 ? 1 : 0), est = o.P + o.D + o.Q > 0;
    const args = `order = c(${o.p}, ${o.d}, ${o.q})${est ? `, seasonal = list(order = c(${o.P}, ${o.D}, ${o.Q}), period = ${o.s})` : ''}, include.mean = ${o.media ? 'TRUE' : 'FALSE'}`;
    const lag = r ? r.box.lag : 10, h = r ? r.pronostico.media.length : 12;
    return ['# Modelo ARIMA (código R equivalente a SigmaPro)', `x <- ts(datos[[${JSON.stringify(e.respuesta)}]]${e.tiempo ? `[order(datos[[${JSON.stringify(e.tiempo)}]])]` : ''}, frequency = ${Math.max(1, o.s)})`,
      `fit <- arima(x, ${args})   # el ajuste por omisión (CSS-ML)`,
      k ? '# arima se detiene con reltol = 1e-8 (unas 5 cifras): se pule por máxima verosimilitud y se evalúa ahí con sus opciones de siempre' : '',
      k ? '# (con method = "ML", arima transforma init dos veces: se le da ya «deshecho» con ARIMA_undoPars)' : '',
      k ? 'deshacer <- function(f) .Call(stats:::C_ARIMA_undoPars, as.double(coef(f)), f$arma)' : '',
      k ? `fit <- arima(x, ${args}, method = "ML", init = deshacer(fit), optim.control = list(reltol = 1e-15, maxit = 5000, ndeps = rep(1e-7, ${k})))` : '',
      k ? `fit <- arima(x, ${args}, method = "ML", init = deshacer(fit), optim.control = list(maxit = 0))   # los EE que da SigmaPro` : '', 'fit; BIC(fit)',
      `pr <- predict(fit, n.ahead = ${h}); pr$pred; pr$se   # IC: pr$pred ± qnorm(${1 - (1 - (op.nivel || 0.95)) / 2}) * pr$se`,
      `lb <- Box.test(residuals(fit), lag = ${lag}, type = "Ljung-Box", fitdf = ${o.p + o.q + o.P + o.Q}); lb`].filter(Boolean).join('\n');
  }

  SP.metodosArima = { serie, acfNA };
  SP.metodo({ id: 'arima', familia: 'supervivencia', motor: 'js', orden: 70, nombre: T('Modelo ARIMA y pronóstico'),
    resumen: T('Ajusta un ARIMA o SARIMA (o busca el orden por AIC), revisa los residuos y pronostica con su intervalo.'),
    entradas: { respuesta: { tipo: 'numerica' }, tiempo: { tipo: 'numerica', opcional: true } },
    opciones: { p: { tipo: 'numero', omision: 1 }, d: { tipo: 'numero', omision: 0 }, q: { tipo: 'numero', omision: 0 }, P: { tipo: 'numero', omision: 0 }, D: { tipo: 'numero', omision: 0 },
      Q: { tipo: 'numero', omision: 0 }, periodo: { tipo: 'numero', omision: 1 }, media: { tipo: 'logico', omision: true }, buscar: { tipo: 'logico', omision: false },
      horizonte: { tipo: 'numero', omision: 12 }, nivel: { tipo: 'numero', omision: 0.95 }, lagBox: { tipo: 'numero', omision: 0 } },
    validar: (t, e) => { exigir(e.respuesta && t.columnas[e.respuesta], T('Elige la variable.')); exigir(!e.tiempo || (t.columnas[e.tiempo] && e.tiempo !== e.respuesta), T('La columna del tiempo debe ser otra.')); },
    calcular, reporte, codigoR });
});

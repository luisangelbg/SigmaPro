/* SigmaPro — series de tiempo (familia Supervivencia y series de tiempo), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una variable medida en el tiempo a intervalos iguales (precipitación mensual, rendimiento por año, captura semanal
   de una trampa), ordenada por la columna del tiempo si se da:
   - autocorrelacion: acf, pacf y las pruebas de Box-Pierce y Ljung-Box, como acf, pacf y Box.test;
   - descomposicion: tendencia, componente estacional y residuo (aditiva o multiplicativa), como decompose;
   - tendencia: Mann-Kendall y la pendiente de Sen con su intervalo, como mk.test y sens.slope (trend). */
SP.definir('metodos-series', function (SP) {
  'use strict';
  const T = SP.T;
  const Z = () => SP.series;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sig = x => SP.formatos.texto(x, 'sig');
  const f2 = x => SP.formatos.texto(x, 'forma2');
  const f3 = x => SP.formatos.texto(x, 'forma');
  const fp = p => (!Number.isFinite(p) ? '= —' : p < 0.001 ? '< 0.001' : '= ' + SP.formatos.texto(p, 'forma'));
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const nomR = n => (/^[A-Za-z.][A-Za-z0-9._]*$/.test(n) ? n : '`' + n.replace(/`/g, '') + '`');

  /** La serie en el orden del tiempo (si se da). completa: sin faltantes (si no, error). */
  function serie(tabla, e, completa) {
    const y = tabla.col(e.respuesta).valores, tv = e.tiempo ? tabla.col(e.tiempo).valores : null;
    let idx = [...Array(tabla.n).keys()];
    if (tv) {
      exigir(idx.every(i => tv[i] === tv[i]), T('La columna del tiempo «{t}» tiene faltantes.', { t: e.tiempo }));
      idx.sort((a, b) => tv[a] - tv[b] || a - b);
      for (let k = 1; k < idx.length; k++) exigir(tv[idx[k]] !== tv[idx[k - 1]], T('«{t}» repite el tiempo {v}: cada tiempo debe aparecer una vez (una serie, no un ensayo con repeticiones).', { t: e.tiempo, v: tv[idx[k]] }));
    }
    const faltan = idx.filter(i => y[i] !== y[i]).length;
    if (completa) exigir(!faltan, T('La serie tiene {k} faltantes: este análisis necesita la serie completa, sin huecos.', { k: faltan }), T('Rellena los faltantes en el bloque Datos (por ejemplo, con el promedio de los vecinos) o usa la tendencia de Mann-Kendall, que los omite.'));
    idx = idx.filter(i => y[i] === y[i]);
    return { x: idx.map(i => y[i]), tiempos: tv ? idx.map(i => tv[i]) : idx.map((_, k) => k + 1), excluidas: faltan };
  }

  /* ======================= autocorrelación ======================= */
  function calcularAcf(tabla, e, op) {
    const s = serie(tabla, e, true), n = s.x.length;
    exigir(n >= 4, T('Hacen falta al menos 4 observaciones.'));
    const L = +op.rezagos > 0 ? Math.min(+op.rezagos, n - 1) : Z().rezagosR(n), lag = Math.min(+op.lagBox > 0 ? +op.lagBox : Math.min(10, n - 1), n - 1);
    exigir(lag > (+op.fitdf || 0), T('Los rezagos de la prueba deben ser más que los parámetros ajustados.'));
    const a = Z().acf(s.x, Math.max(L, lag)), p = Z().pacf(a, L);
    return { tipo: 'series', metodo: 'autocorrelacion', respuesta: e.respuesta, tiempoCol: e.tiempo || '', n, nivel: +op.nivel, rezagos: L,
      acf: a.slice(0, L + 1), pacf: p, banda: SP.dist.qnorm(1 - (1 - op.nivel) / 2, 0, 1, true) / Math.sqrt(n), box: Object.assign(Z().box(a, n, lag, +op.fitdf || 0), { lag }), x: s.x, tiempos: s.tiempos };
  }
  function reporteAcf(r) {
    const fuera = r.acf.slice(1).map((v, k) => [k + 1, v]).filter(([, v]) => Math.abs(v) > r.banda), B = r.box;
    const c = [B.p_ljung_box < 0.05 ? T('La serie tiene autocorrelación: Ljung-Box Q({g}) = {q}, p {p}; los valores cercanos en el tiempo se parecen (no son independientes).', { g: B.gl, q: f2(B.ljung_box), p: fp(B.p_ljung_box) })
      : T('No hay evidencia de autocorrelación hasta el rezago {l}: Ljung-Box Q({g}) = {q}, p {p}.', { l: B.lag, g: B.gl, q: f2(B.ljung_box), p: fp(B.p_ljung_box) })];
    if (fuera.length) c.push(T('Rezagos fuera de la banda de ± {b}: {l}.', { b: f3(r.banda), l: fuera.slice(0, 8).map(([k, v]) => k + ' (' + f2(v) + ')').join(', ') }));
    return { titulo: T('Autocorrelación de «{y}»', { y: r.respuesta }), conclusiones: c.map(may), semaforo: [],
      cuadros: [{ id: 'acf', titulo: T('Autocorrelación simple y parcial'), columnas: [col('k', T('Rezago'), 'entero'), col('a', 'ACF', 'forma'), col('p', 'PACF', 'forma')],
        filas: r.acf.slice(1).map((v, k) => ({ k: k + 1, a: v, p: r.pacf[k] })), notas: [T('Banda de ± {b} (± z/√n al {k} %): fuera de ella, la correlación difiere de cero.', { b: f3(r.banda), k: Math.round(100 * r.nivel) })] },
      { id: 'box', titulo: T('Pruebas de independencia (rezagos 1 a {l})', { l: B.lag }), columnas: [col('t', T('Prueba'), 'texto'), col('q', 'Q', 'forma2'), col('g', T('gl'), 'entero'), col('p', 'p', 'pvalor')],
        filas: [{ t: 'Ljung-Box', q: B.ljung_box, g: B.gl, p: B.p_ljung_box }, { t: 'Box-Pierce', q: B.box_pierce, g: B.gl, p: B.p_box_pierce }],
        notas: [T('Ljung-Box corrige a Box-Pierce en series cortas. p < 0.05: hay autocorrelación.')] }] };
  }
  const datosR = (e, extra) => `x <- datos[[${JSON.stringify(e.respuesta)}]]` + (e.tiempo ? `[order(datos[[${JSON.stringify(e.tiempo)}]])]` : '') + (extra || '');
  function codigoAcf(e, op, ctx) {
    const r = ctx && ctx.resultado, L = r ? r.rezagos : +op.rezagos || 'NULL', lag = r ? r.box.lag : +op.lagBox || 10;
    return ['# Autocorrelación (código R equivalente a SigmaPro)', datosR(e), `a <- acf(x, lag.max = ${L}, plot = FALSE); a`, `p <- pacf(x, lag.max = ${L}, plot = FALSE); p`,
      `lb <- Box.test(x, lag = ${lag}, type = "Ljung-Box", fitdf = ${+op.fitdf || 0}); lb`, `bp <- Box.test(x, lag = ${lag}, type = "Box-Pierce", fitdf = ${+op.fitdf || 0}); bp`].join('\n');
  }

  /* ======================= descomposición ======================= */
  function calcularDesc(tabla, e, op) {
    const s = serie(tabla, e, true), f = Math.round(+op.frecuencia), tipo = op.tipo === 'multiplicativa' ? 'multiplicativa' : 'aditiva';
    exigir(f >= 2, T('La frecuencia (observaciones por ciclo) debe ser 2 o más: 12 para meses, 4 para trimestres, 7 para días de la semana.'));
    const d = Z().descomponer(s.x, f, tipo), fin = d.residuo.filter(Number.isFinite), vR = varianza(fin), vE = varianza(s.x.map((v, i) => (Number.isFinite(d.residuo[i]) ? (tipo === 'aditiva' ? v - d.tendencia[i] : v / d.tendencia[i]) : NaN)).filter(Number.isFinite));
    return { tipo: 'series', metodo: 'descomposicion', respuesta: e.respuesta, tiempoCol: e.tiempo || '', n: s.x.length, frecuencia: f, tipoDesc: tipo,
      tendencia: d.tendencia, estacional: d.estacional, residuo: d.residuo, figura: d.figura, fuerza_estacional: Math.max(0, 1 - vR / vE), x: s.x, tiempos: s.tiempos };
  }
  function varianza(v) { const m = v.reduce((a, b) => a + b, 0) / v.length; return v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1); }
  function reporteDesc(r) {
    const fig = r.figura, imax = fig.indexOf(Math.max(...fig)), imin = fig.indexOf(Math.min(...fig)), aditiva = r.tipoDesc === 'aditiva';
    const tend = r.tendencia.filter(Number.isFinite);
    const c = [aditiva ? T('En el ciclo de {f}, la posición {a} queda {x} por encima de la tendencia y la {b}, {y} por debajo.', { f: r.frecuencia, a: imax + 1, x: sig(fig[imax]), b: imin + 1, y: sig(-fig[imin]) })
      : T('En el ciclo de {f}, la posición {a} queda {x} % por encima de la tendencia y la {b}, {y} % por debajo.', { f: r.frecuencia, a: imax + 1, x: f2(100 * (fig[imax] - 1)), b: imin + 1, y: f2(100 * (1 - fig[imin])) }),
      T('La tendencia (media móvil de un ciclo) pasa de {a} a {b}.', { a: sig(tend[0]), b: sig(tend[tend.length - 1]) }),
      T('La estacionalidad explica el {p} % de la variación sin tendencia (1 − var(residuo)/var(serie sin tendencia)).', { p: f2(100 * r.fuerza_estacional) })];
    return { titulo: T('Descomposición {t} de «{y}»', { t: aditiva ? T('aditiva') : T('multiplicativa'), y: r.respuesta }), conclusiones: c, semaforo: [],
      cuadros: [{ id: 'figura', titulo: T('Componente estacional (posición en el ciclo)'), columnas: [col('k', T('Posición'), 'entero'), col('v', aditiva ? T('Efecto (unidades de la variable)') : T('Índice (1 = sin efecto)'), 'forma')],
        filas: fig.map((v, k) => ({ k: k + 1, v })), notas: [T('La posición 1 es la de la primera observación de la serie.'), aditiva ? T('Los efectos suman 0 en el ciclo.') : T('Los índices promedian 1 en el ciclo.')] },
      { id: 'componentes', titulo: T('Serie y componentes'), columnas: [col('t', r.tiempoCol || T('Orden'), 'sigEnt'), col('x', r.respuesta, 'sigEnt'), col('tr', T('Tendencia'), 'sig'), col('e', T('Estacional'), 'sig'), col('r', T('Residuo'), 'sig')],
        filas: r.x.map((x, i) => ({ t: r.tiempos[i], x, tr: r.tendencia[i], e: r.estacional[i], r: r.residuo[i] })).slice(0, 600),
        notas: [T('La media móvil no alcanza la mitad de un ciclo en cada extremo: ahí la tendencia y el residuo faltan («—»).')] }] };
  }
  function codigoDesc(e, op) {
    return ['# Descomposición clásica (código R equivalente a SigmaPro)', datosR(e), `d <- decompose(ts(x, frequency = ${Math.round(+op.frecuencia)}), type = "${op.tipo === 'multiplicativa' ? 'multiplicative' : 'additive'}")`,
      'd$figure   # componente estacional', 'plot(d)'].join('\n');
  }

  /* ======================= tendencia ======================= */
  function calcularTend(tabla, e, op) {
    const s = serie(tabla, e, false);
    exigir(s.x.length <= 3000, T('Mann-Kendall y Sen comparan todos los pares: hasta 3000 observaciones (hay {n}).', { n: s.x.length }), T('Resume la serie (por ejemplo, la media de cada mes o de cada año) y vuelve a probar.'));
    const mk = Z().mannKendall(s.x), sn = Z().sen(s.x, +op.nivel);
    return Object.assign({ tipo: 'series', metodo: 'tendencia', respuesta: e.respuesta, tiempoCol: e.tiempo || '', nivel: +op.nivel, excluidas: s.excluidas, x: s.x, tiempos: s.tiempos },
      mk, { pendiente: sn.pendiente, pendiente_inf: sn.inf, pendiente_sup: sn.sup });
  }
  function reporteTend(r) {
    const k = Math.round(100 * r.nivel), paso = r.tiempoCol ? T('por paso de «{t}»', { t: r.tiempoCol }) : T('por observación');
    const c = [r.p < 0.05 ? T('Hay una tendencia {d}: Mann-Kendall τ = {t}, z = {z}, p {p}.', { d: r.S > 0 ? T('creciente') : T('decreciente'), t: f3(r.tau), z: f2(r.z), p: fp(r.p) })
      : T('No hay evidencia de una tendencia monótona: Mann-Kendall τ = {t}, z = {z}, p {p}.', { t: f3(r.tau), z: f2(r.z), p: fp(r.p) }),
      T('La pendiente de Sen es {b} {u} (IC {k} %: {i} a {s}).', { b: sig(r.pendiente), u: paso, k, i: sig(r.pendiente_inf), s: sig(r.pendiente_sup) })];
    return { titulo: T('Tendencia de «{y}» (Mann-Kendall y Sen)', { y: r.respuesta }), conclusiones: c.map(may), semaforo: [],
      cuadros: [{ id: 'tendencia', titulo: T('Prueba de tendencia y pendiente'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'sigEnt')],
        filas: [{ m: 'n', v: r.n }, { m: 'S', v: r.S }, { m: T('Varianza de S'), v: r.varS }, { m: 'τ de Kendall', v: r.tau }, { m: 'z', v: r.z }, { m: 'p', v: r.p },
          { m: T('Pendiente de Sen'), v: r.pendiente }, { m: T('IC inferior'), v: r.pendiente_inf }, { m: T('IC superior'), v: r.pendiente_sup }],
        notas: [T('Mann-Kendall no supone normalidad: cuenta cuántos pares crecen y cuántos bajan (con la corrección por empates y de continuidad).'),
          T('La pendiente de Sen es la mediana de las pendientes entre todos los pares; resiste valores extremos. Supone intervalos de tiempo iguales.')] }] };
  }
  function codigoTend(e, op) {
    return ['# Tendencia de Mann-Kendall y pendiente de Sen (código R equivalente a SigmaPro)', 'library(trend)', datosR(e, '\nx <- x[!is.na(x)]'), 'mk.test(x)', `sens.slope(x, conf.level = ${op.nivel})`].join('\n');
  }

  const SERIE = { respuesta: { tipo: 'numerica' }, tiempo: { tipo: 'numerica', opcional: true } };
  const validar = (t, e) => { exigir(e.respuesta && t.columnas[e.respuesta], T('Elige la variable.')); exigir(!e.tiempo || (t.columnas[e.tiempo] && e.tiempo !== e.respuesta), T('La columna del tiempo debe ser otra.')); };
  SP.metodosSeries = { serie };
  SP.metodo({ id: 'autocorrelacion', familia: 'supervivencia', motor: 'js', orden: 40, nombre: T('Autocorrelación de una serie de tiempo'),
    resumen: T('¿Se parecen los valores cercanos en el tiempo? ACF, PACF y las pruebas de Ljung-Box y Box-Pierce.'), entradas: SERIE,
    opciones: { rezagos: { tipo: 'numero', omision: 0 }, lagBox: { tipo: 'numero', omision: 0 }, fitdf: { tipo: 'numero', omision: 0 }, nivel: { tipo: 'numero', omision: 0.95 } },
    validar, calcular: calcularAcf, reporte: reporteAcf, codigoR: codigoAcf });
  SP.metodo({ id: 'descomposicion', familia: 'supervivencia', motor: 'js', orden: 50, nombre: T('Descomposición de una serie (tendencia y estacionalidad)'),
    resumen: T('Separa la tendencia, el ciclo estacional y el residuo de una serie mensual, trimestral o semanal.'), entradas: SERIE,
    opciones: { frecuencia: { tipo: 'numero', omision: 12 }, tipo: { tipo: 'texto', omision: 'aditiva' } },
    validar, calcular: calcularDesc, reporte: reporteDesc, codigoR: codigoDesc });
  SP.metodo({ id: 'tendencia', familia: 'supervivencia', motor: 'js', orden: 60, nombre: T('Tendencia monótona (Mann-Kendall y Sen)'),
    resumen: T('¿Sube o baja la serie con el tiempo? Prueba no paramétrica y la pendiente de Sen con su intervalo.'), entradas: SERIE,
    opciones: { nivel: { tipo: 'numero', omision: 0.95 } }, validar, calcular: calcularTend, reporte: reporteTend, codigoR: codigoTend });
});

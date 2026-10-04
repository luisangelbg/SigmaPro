/* SigmaPro — muestreo (familia Tamaño de muestra, potencia y muestreo), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tres métodos con las fórmulas de Cochran (1977), SP.muestreo:
   - tamano-muestra: cuántas unidades muestrear para estimar una media o una proporción con un error dado (sin datos);
   - muestreo-simple: media, total o proporción de una muestra aleatoria simple, con la corrección por población finita;
   - muestreo-estratificado: la media y el total con estratos (lotes, parcelas, regiones), sus EE, y cómo repartir
     una muestra entre los estratos (proporcional o de Neyman). */
SP.definir('metodos-muestreo', function (SP) {
  'use strict';
  const T = SP.T;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const M = () => SP.muestreo;
  const pc = c => Math.round(100 * c);
  const dado = x => String(Number((+x).toPrecision(6)));   // un valor que escribió el usuario, tal cual (0.05, no 0.05000)

  /* ======================= tamaño de muestra ======================= */
  function calcularTam(tabla, e, op) {
    const r = M().tamano({ tipo: op.tipo, de: +op.de, cv: +op.cv, p: +op.p, error: +op.error, relativo: op.escala === 'relativo', N: +op.N, confianza: +op.confianza });
    return Object.assign(r, { tipo: 'muestreo', metodo: 'tamano-muestra', que: op.tipo, escala: op.escala, de: +op.de, cv: +op.cv, p: +op.p, error: +op.error, N: +op.N, confianza: +op.confianza });
  }
  function reporteTam(r) {
    const err = r.que === 'proporcion' ? T('± {e} (en proporción)', { e: dado(r.error) }) : r.escala === 'relativo' ? T('± {e} % de la media', { e: dado(r.error) }) : T('± {e}', { e: dado(r.error) });
    const c = [T('Para estimar {q} con un error de {e} y {c} % de confianza hacen falta {n} unidades{f}.', { q: r.que === 'proporcion' ? T('la proporción') : T('la media'), e: err, c: pc(r.confianza), n: r.n_entero,
      f: r.N > 0 ? T(' de una población de {N} (sin la corrección por población finita serían {n0})', { N: r.N, n0: Math.ceil(r.n0 - 1e-9) }) : '' })];
    return { titulo: T('Tamaño de muestra para estimar {q}', { q: r.que === 'proporcion' ? T('una proporción') : T('una media') }), conclusiones: c, semaforo: [],
      cuadros: [{ id: 'tamano', titulo: T('Tamaño de muestra'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'sigEnt')],
        filas: [{ m: 'z', v: r.z }, { m: T('n sin la población finita (n₀)'), v: r.n0 }].concat(r.N > 0 ? [{ m: T('Población (N)'), v: r.N }] : [], [{ m: T('n'), v: r.n }, { m: T('n redondeada hacia arriba'), v: r.n_entero }]),
        notas: [r.que === 'proporcion' ? T('n₀ = z²·p(1 − p)/e² con p = {p}.', { p: dado(r.p) }) : r.escala === 'relativo' ? T('n₀ = (z·CV/e)² con CV = {cv} %.', { cv: dado(r.cv) }) : T('n₀ = (z·S/e)² con S = {s}.', { s: dado(r.de) }),
          r.N > 0 ? T('Con población finita, n = n₀/(1 + n₀/N) (Cochran, 1977).') : T('Población grande (sin corrección).')] }] };
  }
  function codigoTam(e, op) {
    const s0 = op.tipo === 'proporcion' ? `z^2 * ${op.p} * (1 - ${op.p}) / ${op.error}^2` : op.escala === 'relativo' ? `(z * ${op.cv} / ${op.error})^2` : `(z * ${op.de} / ${op.error})^2`;
    return ['# Tamaño de muestra (Cochran, 1977; código R equivalente a SigmaPro)', `z <- qnorm(1 - (1 - ${op.confianza}) / 2)`, `n0 <- ${s0}`,
      +op.N > 0 ? `n <- n0 / (1 + n0 / ${op.N})` : 'n <- n0', 'c(n0 = n0, n = n, redondeada = ceiling(n - 1e-9))'].join('\n');
  }

  /* ======================= aleatorio simple ======================= */
  const esBinaria = v => v.length > 1 && v.every(x => x === 0 || x === 1);
  function calcularSimple(tabla, e, op) {
    const v = Array.from(tabla.col(e.respuesta).valores).filter(x => x === x), prop = op.tipo === 'proporcion' || (op.tipo === 'auto' && esBinaria(v));
    if (prop) exigir(esBinaria(v), T('Para estimar una proporción, «{r}» debe valer 0 o 1.', { r: e.respuesta }));
    const r = M().simple({ y: v, N: +op.N, confianza: +op.confianza, proporcion: prop });
    return Object.assign(r, { tipo: 'muestreo', metodo: 'muestreo-simple', respuesta: e.respuesta, proporcion: prop, confianza: +op.confianza, excluidas: tabla.n - v.length });
  }
  function reporteSimple(r) {
    const c = [r.proporcion ? T('La proporción estimada de «{y}» es {m} (IC {c} %: {i} a {s}; EE = {e}).', { y: r.respuesta, m: sig(r.media), c: pc(r.confianza), i: sig(r.ic[0]), s: sig(r.ic[1]), e: sig(r.ee) })
      : T('La media estimada de «{y}» es {m} (IC {c} %: {i} a {s}; EE = {e}).', { y: r.respuesta, m: sig(r.media), c: pc(r.confianza), i: sig(r.ic[0]), s: sig(r.ic[1]), e: sig(r.ee) })];
    if (r.N) c.push(T('El total estimado en la población de {N} es {t} (IC: {i} a {s}).', { N: r.N, t: sig(r.total), i: sig(r.ic_total[0]), s: sig(r.ic_total[1]) }));
    const filas = [{ m: 'n', v: r.n }].concat(r.N ? [{ m: 'N', v: r.N }, { m: T('Fracción de muestreo (f)'), v: r.f }] : [], [{ m: r.proporcion ? T('Proporción') : T('Media'), v: r.media },
      { m: r.proporcion ? T('p(1 − p)·n/(n − 1)') : T('Varianza (s²)'), v: r.varianza }, { m: T('EE de la media'), v: r.ee }, { m: T('t ({g} gl)', { g: r.n - 1 }), v: r.t },
      { m: T('IC inferior'), v: r.ic[0] }, { m: T('IC superior'), v: r.ic[1] }], r.proporcion ? [] : [{ m: 'CV (%)', v: r.cv }],
      r.N ? [{ m: T('Total'), v: r.total }, { m: T('EE del total'), v: r.ee_total }] : []);
    return { titulo: T('Muestreo aleatorio simple: «{y}»', { y: r.respuesta }), conclusiones: c, semaforo: [],
      cuadros: [{ id: 'estimacion', titulo: T('Estimación'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'sigEnt')], filas,
        notas: [r.N ? T('EE con la corrección por población finita: √((1 − f)·s²/n) (Cochran, 1977).') : T('Población grande (sin corrección por población finita).'), T('Intervalos con t de n − 1 gl.')] }] };
  }
  function codigoSimple(e, op) {
    return ['# Muestreo aleatorio simple (Cochran, 1977; código R equivalente a SigmaPro)', `y <- na.omit(datos[[${JSON.stringify(e.respuesta)}]]); n <- length(y)`,
      +op.N > 0 ? `N <- ${op.N}; f <- n / N` : 'f <- 0', 'm <- mean(y)', op.tipo === 'proporcion' ? 's2 <- m * (1 - m) * n / (n - 1)' : 's2 <- var(y)   # con 0/1, m * (1 - m) * n / (n - 1)',
      'ee <- sqrt((1 - f) * s2 / n); t <- qt(1 - (1 - ' + op.confianza + ') / 2, n - 1)', 'c(media = m, ee = ee, inf = m - t * ee, sup = m + t * ee)'].concat(+op.N > 0 ? ['c(total = N * m, ee = N * ee)'] : []).join('\n');
  }

  /* ======================= estratificado ======================= */
  function poblaciones(texto, niveles) {
    const mapa = new Map();
    for (const parte of String(texto || '').split(/[;\n]+/)) {
      const m = parte.match(/^\s*(.+)[=:]\s*([\d.]+)\s*$/);   // el último = o : (el nombre puede llevar dos puntos)
      if (m) mapa.set(m[1].trim(), +m[2]);
    }
    const faltan = niveles.filter(l => !(mapa.get(l) > 0));
    exigir(!faltan.length, T('Falta el tamaño de la población de {l}.', { l: faltan.map(l => '«' + l + '»').join(', ') }), T('Escribe cada estrato con su tamaño, como «{e}=120; …».', { e: niveles[0] }));
    return niveles.map(l => mapa.get(l));
  }
  function calcularEstr(tabla, e, op) {
    const yv = tabla.col(e.respuesta).valores, fc = SP.estructura.comoFactor(tabla, e.estrato), y = [], g = [];
    for (let i = 0; i < tabla.n; i++) if (yv[i] === yv[i] && fc.codigos[i] >= 0) { y.push(yv[i]); g.push(fc.codigos[i]); }
    const usados = [...new Set(g)].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k])), niveles = usados.map(c => fc.niveles[c]);
    const r = M().estratificado({ y, estrato: g.map(c => mapa.get(c)), niveles, Nh: poblaciones(op.poblaciones, niveles), confianza: +op.confianza, nTotal: +op.nTotal });
    return Object.assign(r, { tipo: 'muestreo', metodo: 'muestreo-estratificado', respuesta: e.respuesta, estrato: e.estrato, confianza: +op.confianza, excluidas: tabla.n - y.length });
  }
  function reporteEstr(r) {
    const c = [T('La media estratificada de «{y}» es {m} (IC {c} %: {i} a {s}; EE = {e}, {g} gl efectivos).', { y: r.respuesta, m: sig(r.media), c: pc(r.confianza), i: sig(r.ic[0]), s: sig(r.ic[1]), e: sig(r.ee), g: Number.isInteger(r.gl) ? String(r.gl) : r.gl.toFixed(2) }),
      T('El total estimado en la población de {N} es {t} (IC: {i} a {s}).', { N: r.N, t: sig(r.total), i: sig(r.ic_total[0]), s: sig(r.ic_total[1]) })];
    const cuadros = [{ id: 'estratos', titulo: T('Estratos'), columnas: [col('e', r.estrato, 'texto'), col('N', 'N_h', 'entero'), col('n', 'n_h', 'entero'), col('W', 'W_h', 'forma'), col('m', T('Media'), 'sig'), col('s', T('DE'), 'sig'), col('a', T('Aporte a la varianza'), 'sig')],
      filas: r.estratos.map(x => ({ e: x.estrato, N: x.Nh, n: x.nh, W: x.W, m: x.media, s: x.de, a: x.aporte })), notas: [T('W_h = N_h/N; aporte = W_h²(1 − f_h)s_h²/n_h (Cochran, 1977, cap. 5).')] },
    { id: 'estimacion', titulo: T('Estimación estratificada'), columnas: [col('m', T('Medida'), 'texto'), col('v', T('Valor'), 'sigEnt')],
      filas: [{ m: T('Media'), v: r.media }, { m: T('EE'), v: r.ee }, { m: T('gl efectivos (Satterthwaite)'), v: r.gl }, { m: T('IC inferior'), v: r.ic[0] }, { m: T('IC superior'), v: r.ic[1] },
        { m: T('Total'), v: r.total }, { m: T('EE del total'), v: r.ee_total }] }];
    if (r.asignacion) {
      const lista = r.estratos.map((x, h) => T('{v} en {e}', { v: Math.ceil(r.asignacion.neyman[h] - 1e-9), e: x.estrato }));
      c.push(T('Para una muestra de {n}, la asignación de Neyman (más unidades en los estratos grandes y variables) toma {l}.', { n: r.asignacion.n, l: lista.slice(0, -1).join(', ') + (lista.length > 1 ? T(' y ') : '') + lista[lista.length - 1] }));
      cuadros.push({ id: 'asignacion', titulo: T('Cómo repartir una muestra de {n}', { n: r.asignacion.n }), columnas: [col('e', r.estrato, 'texto'), col('p', T('Proporcional'), 'forma2'), col('ny', T('Neyman'), 'forma2')],
        filas: r.estratos.map((x, h) => ({ e: x.estrato, p: r.asignacion.proporcional[h], ny: r.asignacion.neyman[h] })), notas: [T('Proporcional: n·N_h/N. Neyman: n·N_h·s_h/Σ N_h·s_h, con las s_h de esta muestra. Redondea hacia arriba.')] });
    }
    return { titulo: T('Muestreo estratificado: «{y}» por «{e}»', { y: r.respuesta, e: r.estrato }), conclusiones: c, cuadros, semaforo: [] };
  }
  function codigoEstr(e, op) {
    return ['# Muestreo estratificado (Cochran, 1977; código R equivalente a SigmaPro)',
      `d <- na.omit(data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], h = factor(datos[[${JSON.stringify(e.estrato)}]])))`,
      `Nh <- c(${String(op.poblaciones || '').split(/[;\n]+/).filter(x => /[=:]/.test(x)).map(x => { const [a, b] = x.split(/[=:]/); return JSON.stringify(a.trim()) + ' = ' + b.trim(); }).join(', ')})[levels(d$h)]`,
      'nh <- tapply(d$y, d$h, length); m <- tapply(d$y, d$h, mean); s2 <- tapply(d$y, d$h, var); W <- Nh / sum(Nh)',
      'mst <- sum(W * m); ee <- sqrt(sum(W^2 * (1 - nh / Nh) * s2 / nh))',
      'g <- Nh * (Nh - nh) / nh * s2; gl <- sum(g)^2 / sum(g^2 / (nh - 1))   # gl efectivos de Satterthwaite',
      `t <- qt(1 - (1 - ${op.confianza}) / 2, gl); c(media = mst, ee = ee, gl = gl, inf = mst - t * ee, sup = mst + t * ee, total = sum(Nh) * mst)`]
      .concat(+op.nTotal > 0 ? [`n <- ${op.nTotal}; cbind(proporcional = n * Nh / sum(Nh), neyman = n * Nh * sqrt(s2) / sum(Nh * sqrt(s2)))`] : []).join('\n');
  }

  const CONF = { confianza: { tipo: 'numero', omision: 0.95 } };
  SP.metodosMuestreo = { poblaciones };
  SP.metodo({ id: 'tamano-muestra', familia: 'potencia', motor: 'js', sinDatos: true, orden: 60, nombre: T('Tamaño de muestra para estimar una media o una proporción'),
    resumen: T('Cuántas plantas, frutos o parcelas muestrear para estimar con un error dado, también en poblaciones finitas.'), entradas: {},
    opciones: Object.assign({ tipo: { tipo: 'texto', omision: 'media' }, escala: { tipo: 'texto', omision: 'absoluto' }, de: { tipo: 'numero', omision: 1 }, cv: { tipo: 'numero', omision: 20 },
      p: { tipo: 'numero', omision: 0.5 }, error: { tipo: 'numero', omision: 0.1 }, N: { tipo: 'numero', omision: 0 } }, CONF),
    validar: (t, e, op) => {
      exigir(['media', 'proporcion'].includes(op.tipo), T('Elige si se estima una media o una proporción.'));
      exigir(+op.confianza > 0 && +op.confianza < 1, T('La confianza va entre 0 y 1.'));
      exigir(+op.error > 0, T('El error debe ser mayor que cero.'));
      if (op.tipo === 'proporcion') exigir(+op.p > 0 && +op.p < 1 && +op.error < 1, T('La proporción esperada y el error van entre 0 y 1.'));
      else exigir(op.escala === 'relativo' ? +op.cv > 0 : +op.de > 0, T('La variación esperada (DE o CV) debe ser mayor que cero.'));
      exigir(+op.N >= 0, T('El tamaño de la población no puede ser negativo (0: población grande).'));
    }, calcular: calcularTam, reporte: reporteTam, codigoR: codigoTam });
  SP.metodo({ id: 'muestreo-simple', familia: 'potencia', motor: 'js', orden: 70, nombre: T('Estimación con muestreo aleatorio simple'),
    resumen: T('La media, el total o la proporción de una muestra al azar, con la corrección por población finita.'), entradas: { respuesta: { tipo: 'numerica' } },
    opciones: Object.assign({ N: { tipo: 'numero', omision: 0 }, tipo: { tipo: 'texto', omision: 'auto' } }, CONF),
    validar: (t, e, op) => { exigir(e.respuesta && t.columnas[e.respuesta], T('Elige la variable.')); exigir(+op.N >= 0, T('El tamaño de la población no puede ser negativo (0: desconocido).')); exigir(+op.confianza > 0 && +op.confianza < 1, T('La confianza va entre 0 y 1.')); },
    calcular: calcularSimple, reporte: reporteSimple, codigoR: codigoSimple });
  SP.metodo({ id: 'muestreo-estratificado', familia: 'potencia', motor: 'js', orden: 80, nombre: T('Estimación con muestreo estratificado'),
    resumen: T('Media y total por estratos (lotes, regiones, tipos de suelo) y cómo repartir la muestra entre ellos.'), entradas: { respuesta: { tipo: 'numerica' }, estrato: { tipo: 'factor' } },
    opciones: Object.assign({ poblaciones: { tipo: 'texto', omision: '' }, nTotal: { tipo: 'numero', omision: 0 } }, CONF),
    validar: (t, e, op) => { exigir(e.respuesta && t.columnas[e.respuesta] && e.estrato && t.columnas[e.estrato], T('Elige la variable y la columna del estrato.')); exigir(e.respuesta !== e.estrato, T('Cada columna va en un solo papel.')); exigir(+op.confianza > 0 && +op.confianza < 1, T('La confianza va entre 0 y 1.')); },
    calcular: calcularEstr, reporte: reporteEstr, codigoR: codigoEstr });
});

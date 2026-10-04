/* SigmaPro — regresión no lineal (familia Regresión no lineal), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tres métodos con el mismo cálculo (SP.nolineal, validado contra nls con el gradiente analítico):
   - curva-crecimiento: logístico, Gompertz (con su punto de inflexión) y Weibull, en el tiempo;
   - dosis-respuesta: log-logístico de 4 y de 3 parámetros (límite inferior en 0), con DE10, DE50 y DE90;
   - respuesta-meseta: lineal-meseta y cuadrático-meseta (dosis óptima y rendimiento en la meseta) y Mitscherlich.
   Con un factor de grupo (variedades, herbicidas, híbridos), un juego de parámetros por grupo y la comparación de
   curvas: la prueba F de la suma de cuadrados extra contra una curva común y contra cada parámetro común. */
SP.definir('metodos-nolineal', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt } = Math;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const N = () => SP.nolineal;

  const MODELOS_DE = { 'curva-crecimiento': ['logistico', 'gompertz', 'weibull'], 'dosis-respuesta': ['ll4', 'll3'], 'respuesta-meseta': ['lineal-meseta', 'cuadratico-meseta', 'mitscherlich'] };
  const NOMBRE = { logistico: T('logístico'), gompertz: 'Gompertz', weibull: 'Weibull', ll4: T('log-logístico de 4 parámetros'), ll3: T('log-logístico de 3 parámetros'),
    'lineal-meseta': T('lineal-meseta'), 'cuadratico-meseta': T('cuadrático-meseta'), mitscherlich: 'Mitscherlich' };
  const ECUACION = { logistico: 'y = Asym / (1 + exp((xmid − x) / scal))', gompertz: 'y = Asym · exp(−b2 · b3^x)', weibull: 'y = Asym − Drop · exp(−exp(lrc) · x^pwr)',
    ll4: 'y = c + (d − c) / (1 + exp(b · (log x − log e)))', ll3: 'y = d / (1 + exp(b · (log x − log e)))', mitscherlich: 'y = a − b · exp(−c · x)',
    'cuadratico-meseta': 'y = a + b·x + c·x² si x < −b/(2c); a − b²/(4c) después', 'lineal-meseta': 'y = a + b · mín(x, x0)' };
  const FORMULA_R = { logistico: 'Asym / (1 + exp((xmid - x) / scal))', gompertz: 'Asym * exp(-b2 * b3^x)', weibull: 'Asym - Drop * exp(-exp(lrc) * x^pwr)',
    ll4: 'c + (d - c) / (1 + exp(b * (log(x) - log(e))))', ll3: 'd / (1 + exp(b * (log(x) - log(e))))', mitscherlich: 'a - b * exp(-c * x)',
    'cuadratico-meseta': 'ifelse(x < -b / (2 * c), a + b * x + c * x^2, a - b^2 / (4 * c))', 'lineal-meseta': 'a + b * pmin(x, x0)' };
  const SENTIDO = {
    Asym: T('asíntota (valor máximo)'), xmid: T('x del punto de inflexión'), scal: T('escala (menor = subida más rápida)'), b2: T('desplazamiento'), b3: T('tasa (0 < b3 < 1)'),
    Drop: T('caída desde la asíntota'), lrc: T('log de la tasa'), pwr: T('potencia del tiempo'), b: T('pendiente en la DE50'), c: T('límite inferior'), d: T('límite superior'),
    e: T('DE50 (dosis de 50 % de efecto)'), a: T('intercepto o máximo'), x0: T('dosis óptima (inicio de la meseta)'),
  };
  /* a, b y c no significan lo mismo en todos los modelos: en el lineal-meseta, b es la pendiente antes de la meseta, no la
     del log-logístico en la DE50 */
  const SENTIDO_MODELO = {
    'lineal-meseta': { a: T('respuesta sin dosis (intercepto)'), b: T('aumento por unidad de dosis antes de la meseta') },
    'cuadratico-meseta': { a: T('respuesta sin dosis (intercepto)'), b: T('término lineal'), c: T('término cuadrático (negativo: la curva baja)') },
    mitscherlich: { a: T('asíntota (respuesta máxima)'), b: T('lo que la dosis puede agregar (a menos la respuesta sin dosis)'), c: T('tasa de acercamiento a la asíntota') },
  };
  const sentidoDe = (modelo, par) => (SENTIDO_MODELO[modelo] || {})[par] || SENTIDO[par] || '';
  const NOMBRE_DER = { inflexion: T('Punto de inflexión'), DE10: 'DE10', DE50: 'DE50', DE90: 'DE90', dosis_optima: T('Dosis óptima'), meseta: T('Valor en la meseta') };

  /** Datos completos, el grupo y las validaciones del modelo. */
  function datosDe(tabla, e, id, op) {
    const xn = e.x || e.dosis, yv = tabla.col(e.respuesta).valores, xv = tabla.col(xn).valores, gc = e.grupo ? SP.estructura.comoFactor(tabla, e.grupo) : null;
    const x = [], y = [], g0 = [];
    for (let i = 0; i < tabla.n; i++) {
      if (yv[i] !== yv[i] || xv[i] !== xv[i] || (gc && gc.codigos[i] < 0)) continue;
      x.push(xv[i]); y.push(yv[i]); if (gc) g0.push(gc.codigos[i]);
    }
    let g = null, niveles = [];
    if (gc) {
      const usados = [...new Set(g0)].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      niveles = usados.map(c => gc.niveles[c]); g = Int32Array.from(g0, c => mapa.get(c));
      exigir(niveles.length >= 2, T('El factor de grupo tiene un solo nivel con datos.'), T('Quita el grupo para ajustar una sola curva.'));
    }
    const m = op.modelo, P = N().MODELOS[m].par.length, G = Math.max(1, niveles.length);
    exigir(x.length > P * G + 1, T('Faltan datos: el modelo {m} con {g} necesita más de {k} observaciones.', { m: NOMBRE[m], g: G > 1 ? T('{k} grupos', { k: G }) : T('una curva'), k: P * G + 1 }));
    if (m === 'll4' || m === 'll3') exigir(x.every(v => v >= 0), T('Las dosis no pueden ser negativas en el modelo log-logístico.'));
    if (m === 'weibull') exigir(x.every(v => v >= 0), T('El tiempo no puede ser negativo en el modelo de Weibull.'));
    return { x, y, g, niveles };
  }
  function validar(id) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      const xn = e.x || e.dosis;
      exigir(xn && tabla.columnas[xn], id === 'curva-crecimiento' ? T('Elige la columna del tiempo (días, semanas).') : T('Elige la columna de la dosis.'));
      exigir(tabla.col(e.respuesta).tipo === 'numerica' && tabla.col(xn).tipo === 'numerica', T('La respuesta y {x} deben ser numéricas.', { x: id === 'curva-crecimiento' ? T('el tiempo') : T('la dosis') }));
      exigir(e.respuesta !== xn && (!e.grupo || (e.grupo !== xn && e.grupo !== e.respuesta)), T('Cada columna va en un solo papel.'));
      if (e.grupo) exigir(tabla.columnas[e.grupo], T('No existe la columna «{c}».', { c: e.grupo }));
      exigir(MODELOS_DE[id].includes(op.modelo), T('Modelo no válido para este análisis: {m}.', { m: op.modelo }));
      exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e, id, op), r = N().analizar(op.modelo, d.x, d.y, d.g, d.niveles, op.nivel);
      return Object.assign(r, { tipo: 'nolineal', metodo: id, modelo: op.modelo, respuesta: e.respuesta, x: e.x || e.dosis, grupo: e.grupo || '', niveles: d.niveles, nivel: op.nivel, alfa: op.alfa,
        valores: { x: d.x, y: d.y, g: d.g ? Array.from(d.g) : null, residuos: d.y.map((v, i) => v - r.ajustados[i]) }, n: d.x.length, excluidas: tabla.n - d.x.length });
    };
  }

  /* ======================= reporte ======================= */
  function reporte(r) {
    const a = r.alfa || 0.05, conclusiones = [], cuadros = [], G = Math.max(1, r.niveles.length), A = r.ajuste;
    conclusiones.push(T('El modelo {m} explica el {p} % de la variación de «{y}» (R² = {r}; σ = {s}).', { m: NOMBRE[r.modelo], p: (100 * A.r2).toFixed(1), y: r.respuesta, r: A.r2.toFixed(3), s: sig(A.sigma) }));
    for (const z of r.derivados) conclusiones.push(T('{n}{g}: {v} (IC {c} %: {i} a {s}).', { n: NOMBRE_DER[z.nombre], g: z.grupo ? T(' de {g}', { g: z.grupo }) : '', v: sig(z.valor), c: Math.round(100 * r.nivel), i: sig(z.ic[0]), s: sig(z.ic[1]) }));
    if (r.comparacion) {
      const c = r.comparacion.global;
      conclusiones.push(c.p < a ? T('Las curvas de {g} difieren (F = {F} con {g1} y {g2} gl, p {p}).', { g: r.grupo, F: f2(c.F), g1: c.gl1, g2: c.gl2, p: fp(c.p) })
        : T('Las curvas de {g} no difieren: una curva común basta (F = {F} con {g1} y {g2} gl, p {p}).', { g: r.grupo, F: f2(c.F), g1: c.gl1, g2: c.gl2, p: fp(c.p) }));
      for (const x of r.comparacion.parametros) if (x.p < a) conclusiones.push(T('El parámetro {p} difiere entre grupos (F = {F}, p {v}).', { p: x.parametro, F: f2(x.F), v: fp(x.p) }));
    }
    if (!A.convergio) conclusiones.push(T('Aviso: el ajuste no llegó a la tolerancia; revisa los resultados.'));
    const P = r.parametros;
    cuadros.push({ id: 'parametros', titulo: T('Parámetros del modelo {m}', { m: NOMBRE[r.modelo] }),
      columnas: [col('par', T('Parámetro'), 'texto')].concat(G > 1 ? [col('grupo', r.grupo, 'texto')] : [], [col('est', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'),
        col('t', 't', 'forma2'), col('p', 'p', 'pvalor'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig'), col('sentido', T('Significado'), 'texto')]),
      filas: P.estimado.map((b, j) => ({ par: P.parametro[j], grupo: P.grupo[j], est: b, ee: P.ee[j], t: P.t[j], p: P.p[j], ic: [P.ic_inf[j], P.ic_sup[j]], sentido: sentidoDe(r.modelo, P.parametro[j]) })),
      notas: [T('Modelo: {e}. Mínimos cuadrados no lineales; IC de Wald con t de {g} gl.', { e: ECUACION[r.modelo], g: A.gl })] });
    if (r.derivados.length) cuadros.push({ id: 'derivados', titulo: T('Valores derivados'),
      columnas: [col('n', T('Cantidad'), 'texto')].concat(G > 1 ? [col('grupo', r.grupo, 'texto')] : [], [col('v', T('Valor'), 'sig'), col('ee', T('EE'), 'sig'), col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')]),
      filas: r.derivados.map(z => ({ n: NOMBRE_DER[z.nombre], grupo: z.grupo, v: z.valor, ee: z.ee, ic: z.ic })),
      notas: [T('EE por el método delta.')].concat(r.modelo.startsWith('ll') ? [T('DEp: dosis con p % del efecto entre los límites superior e inferior.')] : []) });
    if (r.comparacion) {
      const c = r.comparacion;
      cuadros.push({ id: 'comparacion', titulo: T('Comparación de las curvas de «{g}»', { g: r.grupo }),
        columnas: [col('h', T('Hipótesis'), 'texto'), col('F', 'F', 'forma2'), col('g1', T('gl num.'), 'entero'), col('g2', T('gl den.'), 'entero'), col('p', 'p', 'pvalor')],
        filas: [{ h: T('Una curva común para todos'), F: c.global.F, g1: c.global.gl1, g2: c.global.gl2, p: c.global.p }]
          .concat(c.parametros.map(x => ({ h: T('{p} común (los demás por grupo)', { p: x.parametro }), F: x.F, g1: x.gl1, g2: x.gl2, p: x.p }))),
        notas: [T('Prueba F de la suma de cuadrados extra contra el modelo con todos los parámetros por grupo.')] });
    }
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: T('Observaciones'), valor: A.n, _dec: 0 }, { medida: T('gl del error'), valor: A.gl, _dec: 0 }, { medida: T('Suma de cuadrados residual'), valor: A.rss, _dec: 4 },
        { medida: T('Error estándar residual (σ)'), valor: A.sigma, _dec: 4 }, { medida: T('R² (1 − SCR/SCT)'), valor: A.r2, _dec: 4 }, { medida: 'AIC', valor: A.AIC, _dec: 2 }, { medida: 'BIC', valor: A.BIC, _dec: 2 }],
      notas: [T('AIC y BIC comparan modelos ajustados a los mismos datos (menor es mejor).')] });
    const res = r.valores.residuos, sd = A.sigma, grandes = res.filter(v => Math.abs(v / sd) > 3).length;
    let rachas = 0; for (let i = 1; i < res.length; i++) if (Math.sign(res[i]) !== Math.sign(res[i - 1])) rachas++;
    const semaforo = [{ nombre: T('Convergencia'), color: A.convergio ? 'verde' : 'rojo', texto: A.convergio ? T('El ajuste llegó al óptimo.') : T('El ajuste no llegó a la tolerancia.') },
      { nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde', texto: grandes === 1 ? T('Un residuo pasa de 3σ: revisa esa observación.') : grandes ? T('{k} residuos pasan de 3σ.', { k: grandes }) : T('Ningún residuo pasa de 3σ.') }];
    return { titulo: T('Regresión no lineal: modelo {m}', { m: NOMBRE[r.modelo] }), conclusiones: conclusiones.map(may), cuadros, semaforo };
  }

  function codigoR(id) {
    return (e, op, ctx) => {
      const xn = e.x || e.dosis, res = ctx && ctx.resultado, m = op.modelo, P = N().MODELOS[m].par, G = res && res.niveles.length > 1 ? res.niveles.length : 0;
      let f = FORMULA_R[m];
      if (G) for (const pn of P) f = f.replace(new RegExp('\\b' + pn + '\\b', 'g'), pn + '[g]');
      const ini = res ? P.map((pn, k) => pn + ' = ' + (G ? 'c(' + res.niveles.map((_, h) => +res.parametros.estimado[k * G + h].toPrecision(12)).join(', ') + ')' : +res.parametros.estimado[k].toPrecision(12))).join(', ') : P.map(pn => pn + ' = 1').join(', ');
      const L = ['# Regresión no lineal (código R equivalente a SigmaPro)', `d <- data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], x = datos[[${JSON.stringify(xn)}]]${e.grupo ? `, g = factor(datos[[${JSON.stringify(e.grupo)}]])` : ''})`,
        'd <- na.omit(d)', `# arranca en los valores de SigmaPro (nls converge al mismo óptimo)`,
        `m <- nls(y ~ ${f}, data = d, start = list(${ini}))`, 'summary(m)',
        `cf <- summary(m)$coefficients; qt <- qt(${1 - (1 - (op.nivel || 0.95)) / 2}, df.residual(m)); cbind(cf[, 1:2], inf = cf[, 1] - qt * cf[, 2], sup = cf[, 1] + qt * cf[, 2])   # IC de Wald`,
        'c(SCR = deviance(m), sigma = summary(m)$sigma, R2 = 1 - deviance(m) / sum((d$y - mean(d$y))^2), AIC = AIC(m), BIC = BIC(m))'];
      if (m.startsWith('ll')) L.push('# DEp = e · (p / (100 − p))^(1/b); su EE por el método delta (p. ej. car::deltaMethod(m, "e * (10/90)^(1/b)"))');
      if (m === 'cuadratico-meseta') L.push('# dosis óptima = −b/(2c) y meseta = a − b²/(4c), con su EE por el método delta (car::deltaMethod)');
      if (m === 'lineal-meseta') L.push('# x0 es la dosis óptima; la meseta es a + b·x0 (car::deltaMethod(m, "a + b * x0"))');
      if (G) L.push(`m0 <- nls(y ~ ${FORMULA_R[m]}, data = d, start = list(${P.map((pn, k) => pn + ' = ' + +(res.parametros.estimado.slice(k * G, (k + 1) * G).reduce((s, v) => s + v, 0) / G).toPrecision(8)).join(', ')}))`,
        'anova(m0, m)   # ¿una curva común para todos los grupos?');
      return L.join('\n');
    };
  }

  const OPC = d => ({ modelo: { tipo: 'texto', omision: d }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } });
  SP.metodosNoLineal = { MODELOS_DE, NOMBRE, ECUACION, SENTIDO, sentidoDe, NOMBRE_DER, reporte };
  SP.metodo({
    id: 'curva-crecimiento', familia: 'no-lineal', motor: 'js', orden: 10, nombre: T('Curva de crecimiento'),
    resumen: T('Logístico, Gompertz o Weibull en el tiempo: asíntota, punto de inflexión y comparación de curvas entre grupos.'),
    entradas: { respuesta: { tipo: 'numerica' }, x: { tipo: 'numerica' }, grupo: { tipo: 'factor', opcional: true } }, opciones: OPC('logistico'),
    validar: validar('curva-crecimiento'), calcular: calcular('curva-crecimiento'), reporte, codigoR: codigoR('curva-crecimiento'),
  });
  SP.metodo({
    id: 'dosis-respuesta', familia: 'no-lineal', motor: 'js', orden: 20, nombre: T('Dosis-respuesta (log-logístico)'),
    resumen: T('Herbicidas, fungicidas o tóxicos: DE10, DE50 y DE90 con su intervalo y comparación entre productos.'),
    entradas: { respuesta: { tipo: 'numerica' }, dosis: { tipo: 'numerica' }, grupo: { tipo: 'factor', opcional: true } }, opciones: OPC('ll4'),
    validar: validar('dosis-respuesta'), calcular: calcular('dosis-respuesta'), reporte, codigoR: codigoR('dosis-respuesta'),
  });
  SP.metodo({
    id: 'respuesta-meseta', familia: 'no-lineal', motor: 'js', orden: 30, nombre: T('Respuesta a la dosis con meseta'),
    resumen: T('Fertilización y riego: lineal-meseta, cuadrático-meseta o Mitscherlich, con la dosis óptima y el rendimiento máximo.'),
    entradas: { respuesta: { tipo: 'numerica' }, dosis: { tipo: 'numerica' }, grupo: { tipo: 'factor', opcional: true } }, opciones: OPC('lineal-meseta'),
    validar: validar('respuesta-meseta'), calcular: calcular('respuesta-meseta'), reporte, codigoR: codigoR('respuesta-meseta'),
  });
});

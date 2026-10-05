/* SigmaPro — regresión no lineal (familia Regresión no lineal), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tres métodos con el mismo cálculo (SP.nolineal, validado contra nls con el gradiente analítico):
   - curva-crecimiento: logístico, Gompertz (con su punto de inflexión) y Weibull, en el tiempo;
   - dosis-respuesta: log-logístico de 4 y de 3 parámetros (límite inferior en 0), con DE10, DE50 y DE90, y
     Brain-Cousens (hormesis: estímulo a dosis bajas) de 5 y 4 parámetros, con la DE50 y la dosis de máxima respuesta;
   - respuesta-meseta: lineal-meseta y cuadrático-meseta (dosis óptima y rendimiento en la meseta), Mitscherlich y
     Michaelis-Menten (con y sin respuesta en la dosis cero), con la dosis económica óptima si se dan los precios.
   Con un factor de grupo (variedades, herbicidas, híbridos), un juego de parámetros por grupo y la comparación de
   curvas: la prueba F de la suma de cuadrados extra contra una curva común y contra cada parámetro común. Opcionales:
   pesos por observación, intervalos por verosimilitud perfilada y la elección del modelo por AIC. */
SP.definir('metodos-nolineal', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt } = Math;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const N = () => SP.nolineal;

  const MODELOS_DE = { 'curva-crecimiento': ['logistico', 'gompertz', 'weibull'], 'dosis-respuesta': ['ll4', 'll3', 'bc5', 'bc4'],
    'respuesta-meseta': ['lineal-meseta', 'cuadratico-meseta', 'mitscherlich', 'mm2', 'mm3'] };
  const NOMBRE = { logistico: T('logístico'), gompertz: 'Gompertz', weibull: 'Weibull', ll4: T('log-logístico de 4 parámetros'), ll3: T('log-logístico de 3 parámetros'),
    bc5: T('Brain-Cousens de 5 parámetros (hormesis)'), bc4: T('Brain-Cousens de 4 parámetros (hormesis)'),
    'lineal-meseta': T('lineal-meseta'), 'cuadratico-meseta': T('cuadrático-meseta'), mitscherlich: 'Mitscherlich', mm2: 'Michaelis-Menten', mm3: T('Michaelis-Menten con respuesta sin dosis') };
  const ECUACION = { logistico: 'y = Asym / (1 + exp((xmid − x) / scal))', gompertz: 'y = Asym · exp(−b2 · b3^x)', weibull: 'y = Asym − Drop · exp(−exp(lrc) · x^pwr)',
    ll4: 'y = c + (d − c) / (1 + exp(b · (log x − log e)))', ll3: 'y = d / (1 + exp(b · (log x − log e)))', mitscherlich: 'y = a − b · exp(−c · x)',
    bc5: 'y = c + (d − c + f·x) / (1 + exp(b · (log x − log e)))', bc4: 'y = (d + f·x) / (1 + exp(b · (log x − log e)))',
    mm2: 'y = d · x / (e + x)', mm3: 'y = c + (d − c) · x / (e + x)',
    'cuadratico-meseta': 'y = a + b·x + c·x² si x < −b/(2c); a − b²/(4c) después', 'lineal-meseta': 'y = a + b · mín(x, x0)' };
  const FORMULA_R = { logistico: 'Asym / (1 + exp((xmid - x) / scal))', gompertz: 'Asym * exp(-b2 * b3^x)', weibull: 'Asym - Drop * exp(-exp(lrc) * x^pwr)',
    ll4: 'c + (d - c) / (1 + exp(b * (log(x) - log(e))))', ll3: 'd / (1 + exp(b * (log(x) - log(e))))', mitscherlich: 'a - b * exp(-c * x)',
    bc5: 'c + (d - c + f * x) / (1 + exp(b * (log(x) - log(e))))', bc4: '(d + f * x) / (1 + exp(b * (log(x) - log(e))))',
    mm2: 'd * x / (e + x)', mm3: 'c + (d - c) * x / (e + x)',
    'cuadratico-meseta': 'ifelse(x < -b / (2 * c), a + b * x + c * x^2, a - b^2 / (4 * c))', 'lineal-meseta': 'a + b * pmin(x, x0)' };
  const SENTIDO = {
    Asym: T('asíntota (valor máximo)'), xmid: T('x del punto de inflexión'), scal: T('escala (menor = subida más rápida)'), b2: T('desplazamiento'), b3: T('tasa (0 < b3 < 1)'),
    Drop: T('caída desde la asíntota'), lrc: T('log de la tasa'), pwr: T('potencia del tiempo'), b: T('pendiente en la DE50'), c: T('límite inferior'), d: T('límite superior'),
    e: T('DE50 (dosis de 50 % de efecto)'), a: T('intercepto o máximo'), x0: T('dosis óptima (inicio de la meseta)'),
  };
  /* a, b y c no significan lo mismo en todos los modelos: en el lineal-meseta, b es la pendiente antes de la meseta, no la
     del log-logístico en la DE50 */
  const BC = { b: T('pendiente de la caída'), c: T('límite inferior'), d: T('respuesta sin dosis (testigo)'), e: T('posición de la caída (no es la DE50)'), f: T('estímulo a dosis bajas (hormesis si f > 0)') };
  const SENTIDO_MODELO = {
    'lineal-meseta': { a: T('respuesta sin dosis (intercepto)'), b: T('aumento por unidad de dosis antes de la meseta') },
    'cuadratico-meseta': { a: T('respuesta sin dosis (intercepto)'), b: T('término lineal'), c: T('término cuadrático (negativo: la curva baja)') },
    mitscherlich: { a: T('asíntota (respuesta máxima)'), b: T('lo que la dosis puede agregar (a menos la respuesta sin dosis)'), c: T('tasa de acercamiento a la asíntota') },
    mm2: { d: T('respuesta máxima (asíntota)'), e: T('dosis con la mitad de la respuesta máxima') },
    mm3: { c: T('respuesta sin dosis'), d: T('respuesta máxima (asíntota)'), e: T('dosis con la mitad del aumento') },
    bc5: BC, bc4: BC,
  };
  const sentidoDe = (modelo, par) => (SENTIDO_MODELO[modelo] || {})[par] || SENTIDO[par] || '';
  const NOMBRE_DER = { inflexion: T('Punto de inflexión'), DE10: 'DE10', DE50: 'DE50', DE90: 'DE90', dosis_optima: T('Dosis óptima'), meseta: T('Valor en la meseta'),
    dosis_maxima: T('Dosis de máxima respuesta (hormesis)'), respuesta_maxima: T('Respuesta máxima'), dosis_economica: T('Dosis económica óptima'), respuesta_economica: T('Respuesta en la dosis económica') };
  const SOLO_POSITIVA = new Set(['ll4', 'll3', 'bc5', 'bc4', 'mm2', 'mm3']);

  /** Datos completos (con pesos positivos, si los hay) y el grupo. */
  function datosDe(tabla, e) {
    const xn = e.x || e.dosis, yv = tabla.col(e.respuesta).valores, xv = tabla.col(xn).valores, gc = e.grupo ? SP.estructura.comoFactor(tabla, e.grupo) : null;
    const wv = e.pesos ? tabla.col(e.pesos).valores : null;
    const x = [], y = [], g0 = [], w = [];
    for (let i = 0; i < tabla.n; i++) {
      if (yv[i] !== yv[i] || xv[i] !== xv[i] || (gc && gc.codigos[i] < 0)) continue;
      if (wv) { if (wv[i] !== wv[i] || wv[i] === 0) continue; exigir(wv[i] > 0, T('Los pesos no pueden ser negativos (fila {i}).', { i: i + 1 })); w.push(wv[i]); }
      x.push(xv[i]); y.push(yv[i]); if (gc) g0.push(gc.codigos[i]);
    }
    let g = null, niveles = [];
    if (gc) {
      const usados = [...new Set(g0)].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      niveles = usados.map(c => gc.niveles[c]); g = Int32Array.from(g0, c => mapa.get(c));
      exigir(niveles.length >= 2, T('El factor de grupo tiene un solo nivel con datos.'), T('Quita el grupo para ajustar una sola curva.'));
    }
    return { x, y, g, niveles, w: wv ? w : null };
  }
  /** Lo que cada modelo pide de los datos. */
  function revisar(m, d) {
    const P = N().MODELOS[m].par.length, G = Math.max(1, d.niveles.length);
    exigir(d.x.length > P * G + 1, T('Faltan datos: el modelo {m} con {g} necesita más de {k} observaciones.', { m: NOMBRE[m], g: G > 1 ? T('{k} grupos', { k: G }) : T('una curva'), k: P * G + 1 }));
    if (SOLO_POSITIVA.has(m)) exigir(d.x.every(v => v >= 0), T('Las dosis no pueden ser negativas en el modelo {m}.', { m: NOMBRE[m] }));
    if (m === 'weibull') exigir(d.x.every(v => v >= 0), T('El tiempo no puede ser negativo en el modelo de Weibull.'));
  }
  function validar(id) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      const xn = e.x || e.dosis;
      exigir(xn && tabla.columnas[xn], id === 'curva-crecimiento' ? T('Elige la columna del tiempo (días, semanas).') : T('Elige la columna de la dosis.'));
      exigir(tabla.col(e.respuesta).tipo === 'numerica' && tabla.col(xn).tipo === 'numerica', T('La respuesta y {x} deben ser numéricas.', { x: id === 'curva-crecimiento' ? T('el tiempo') : T('la dosis') }));
      const roles = [e.respuesta, xn, e.grupo, e.pesos].filter(Boolean);
      exigir(new Set(roles).size === roles.length, T('Cada columna va en un solo papel.'));
      if (e.grupo) exigir(tabla.columnas[e.grupo], T('No existe la columna «{c}».', { c: e.grupo }));
      if (e.pesos) exigir(tabla.columnas[e.pesos] && tabla.col(e.pesos).tipo === 'numerica', T('Los pesos deben ser una columna numérica.'));
      exigir(op.modelo === 'auto' || MODELOS_DE[id].includes(op.modelo), T('Modelo no válido para este análisis: {m}.', { m: op.modelo }));
      exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
      exigir(['wald', 'perfil'].includes(op.intervalo), T('Los intervalos son de Wald o por perfil.'));
      const hay = v => v !== null && v !== undefined && v !== '' && v !== 0;
      if (hay(op.precioProducto) || hay(op.precioInsumo)) exigir(op.precioProducto > 0 && op.precioInsumo > 0, T('Para la dosis económica escribe los dos precios, mayores que cero.'));
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e), precios = op.precioProducto > 0 && op.precioInsumo > 0 ? { producto: op.precioProducto, insumo: op.precioInsumo } : null;
      let modelo = op.modelo, seleccion = null;
      if (modelo === 'auto') {
        /* cada modelo de la familia con los mismos datos; gana el de menor AIC entre los que convergen */
        seleccion = MODELOS_DE[id].map(m => {
          try {
            revisar(m, d);
            const a = N().analizar(m, d.x, d.y, d.g, d.niveles, op.nivel, { pesos: d.w }).ajuste;
            return { modelo: m, parametros: a.n - a.gl, AIC: a.AIC, BIC: a.BIC, sigma: a.sigma, r2: a.r2, convergio: a.convergio };
          } catch (err) { return { modelo: m, error: err.message || String(err) }; }
        });
        const ok = seleccion.filter(z => !z.error && z.convergio);
        exigir(ok.length, T('Ningún modelo converge con estos datos.'), T('Revisa que los datos tengan la forma de la familia (crecimiento, caída o meseta).'));
        const min = Math.min(...ok.map(z => z.AIC)), suma = ok.reduce((s, z) => s + Math.exp(-(z.AIC - min) / 2), 0);
        for (const z of ok) { z.delta = z.AIC - min; z.peso = Math.exp(-z.delta / 2) / suma; }
        modelo = ok.find(z => z.AIC === min).modelo;
      }
      revisar(modelo, d);
      const r = N().analizar(modelo, d.x, d.y, d.g, d.niveles, op.nivel, { pesos: d.w, intervalo: op.intervalo, precios });
      return Object.assign(r, { tipo: 'nolineal', metodo: id, modelo, seleccion, respuesta: e.respuesta, x: e.x || e.dosis, grupo: e.grupo || '', pesos: e.pesos || '', niveles: d.niveles, nivel: op.nivel, alfa: op.alfa,
        ejeLog: !!op.ejeLog, valores: { x: d.x, y: d.y, g: d.g ? Array.from(d.g) : null, w: d.w, residuos: d.y.map((v, i) => v - r.ajustados[i]) }, n: d.x.length, excluidas: tabla.n - d.x.length });
    };
  }

  /* ======================= reporte ======================= */
  function reporte(r) {
    const a = r.alfa || 0.05, conclusiones = [], cuadros = [], G = Math.max(1, r.niveles.length), A = r.ajuste, perfil = r.intervalo === 'perfil', ICt = T('IC {c} %', { c: Math.round(100 * r.nivel) });
    if (r.seleccion) {
      const ok = r.seleccion.filter(z => z.delta !== undefined).sort((x, y) => x.delta - y.delta);
      conclusiones.push(ok.length > 1 ? T('Entre {k} modelos, el de menor AIC es el {m} (AIC = {a}); le sigue el {m2} con ΔAIC = {d}.', { k: ok.length, m: NOMBRE[r.modelo], a: f2(ok[0].AIC), m2: NOMBRE[ok[1].modelo], d: f2(ok[1].delta) })
        : T('Solo el modelo {m} converge con estos datos.', { m: NOMBRE[r.modelo] }));
    }
    conclusiones.push(T('El modelo {m} explica el {p} % de la variación de «{y}» (R² = {r}; σ = {s}).', { m: NOMBRE[r.modelo], p: (100 * A.r2).toFixed(1), y: r.respuesta, r: A.r2.toFixed(3), s: sig(A.sigma) }));
    for (const z of r.derivados) {
      if (z.recortada) { if (z.nombre === 'dosis_economica') conclusiones.push(T('{n}{g}: 0; a esos precios la primera unidad de insumo ya no se paga.', { n: NOMBRE_DER[z.nombre], g: z.grupo ? T(' de {g}', { g: z.grupo }) : '' })); continue; }
      conclusiones.push(T('{n}{g}: {v} (IC {c} %: {i} a {s}).', { n: NOMBRE_DER[z.nombre], g: z.grupo ? T(' de {g}', { g: z.grupo }) : '', v: sig(z.valor), c: Math.round(100 * r.nivel), i: sig(z.ic[0]), s: sig(z.ic[1]) }));
    }
    if (r.modelo.startsWith('bc')) {
      const fi = N().MODELOS[r.modelo].par.indexOf('f');
      for (let h = 0; h < G; h++) {
        const fv = r.parametros.estimado[G > 1 ? fi * G + h : fi], grupo = G > 1 ? r.niveles[h] : '';
        if (!r.derivados.some(z => z.nombre === 'dosis_maxima' && z.grupo === grupo)) conclusiones.push(T('{g}no hay estímulo a dosis bajas (f = {f}, o la pendiente b ≤ 1): no hay dosis de máxima respuesta; un log-logístico basta.', { g: grupo ? grupo + ': ' : '', f: sig(fv) }));
      }
    }
    if (r.comparacion) {
      const c = r.comparacion.global;
      conclusiones.push(c.p < a ? T('Las curvas de {g} difieren (F = {F} con {g1} y {g2} gl, p {p}).', { g: r.grupo, F: f2(c.F), g1: c.gl1, g2: c.gl2, p: fp(c.p) })
        : T('Las curvas de {g} no difieren: una curva común basta (F = {F} con {g1} y {g2} gl, p {p}).', { g: r.grupo, F: f2(c.F), g1: c.gl1, g2: c.gl2, p: fp(c.p) }));
      for (const x of r.comparacion.parametros) if (x.p < a) conclusiones.push(T('El parámetro {p} difiere entre grupos (F = {F}, p {v}).', { p: x.parametro, F: f2(x.F), v: fp(x.p) }));
    }
    if (!A.convergio) conclusiones.push(T('Aviso: el ajuste no llegó a la tolerancia; revisa los resultados.'));
    if (r.seleccion) cuadros.push({ id: 'modelos', titulo: T('Comparación de modelos por AIC'),
      columnas: [col('m', T('Modelo'), 'texto'), col('k', T('Parámetros'), 'entero'), col('aic', 'AIC', 'forma2'), col('d', 'ΔAIC', 'forma2'), col('w', T('Peso de Akaike'), 'forma'),
        col('s', 'σ', 'sig'), col('r2', 'R²', 'forma'), col('nota', T('Nota'), 'texto')],
      filas: r.seleccion.slice().sort((x, y) => (x.delta ?? Infinity) - (y.delta ?? Infinity)).map(z => (z.error ? { m: may(NOMBRE[z.modelo]), nota: z.error }
        : { m: may(NOMBRE[z.modelo]), k: z.parametros, aic: z.AIC, d: z.delta, w: z.peso, s: z.sigma, r2: z.r2, nota: !z.convergio ? T('no converge') : z.modelo === r.modelo ? T('elegido') : '' })),
      notas: [T('Cada modelo, ajustado a los mismos datos{g}. ΔAIC: diferencia con el mejor; el peso de Akaike es la probabilidad relativa de que cada modelo sea el mejor de la lista.', { g: G > 1 ? T(' con una curva por grupo') : '' })] });
    const P = r.parametros, falta = P.ic_inf.some(v => !Number.isFinite(v)) || P.ic_sup.some(v => !Number.isFinite(v));
    cuadros.push({ id: 'parametros', titulo: T('Parámetros del modelo {m}', { m: NOMBRE[r.modelo] }),
      columnas: [col('par', T('Parámetro'), 'texto')].concat(G > 1 ? [col('grupo', r.grupo, 'texto')] : [], [col('est', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'),
        col('t', 't', 'forma2'), col('p', 'p', 'pvalor'), col('ic', perfil ? T('{c} (perfil)', { c: ICt }) : ICt, 'intervaloSig'), col('sentido', T('Significado'), 'texto')]),
      filas: P.estimado.map((b, j) => ({ par: P.parametro[j], grupo: P.grupo[j], est: b, ee: P.ee[j], t: P.t[j], p: P.p[j], ic: [P.ic_inf[j], P.ic_sup[j]], sentido: sentidoDe(r.modelo, P.parametro[j]) })),
      notas: [T('Modelo: {e}. Mínimos cuadrados no lineales{w}; {i}.', { e: ECUACION[r.modelo], w: r.pesos ? T(' ponderados por «{p}»', { p: r.pesos }) : '',
        i: perfil ? T('IC por verosimilitud perfilada (los demás parámetros se reajustan en cada valor), con t de {g} gl', { g: A.gl }) : T('IC de Wald con t de {g} gl', { g: A.gl }) })]
        .concat(falta ? [T('—: el perfil no llega a ese nivel de confianza por ese lado (los datos no acotan el parámetro).')] : [])
        .concat(r.intervalo === 'wald' && N().SIN_PERFIL.has(r.modelo) ? [T('El quiebre de lineal-meseta no deja perfilar: sus intervalos son de Wald.')] : []) });
    if (r.derivados.length) {
      const notas = [T('EE por el método delta; IC de Wald.')];
      if (r.modelo.startsWith('ll')) notas.push(T('DEp: dosis con p % del efecto entre los límites superior e inferior.'));
      if (r.modelo.startsWith('bc')) notas.push(T('Hormesis: la dosis de máxima respuesta es donde la curva deja de subir; la DE50 es la dosis, después de ese máximo, en que la respuesta baja a la mitad entre d y c (como en drc).'));
      if (r.precios) notas.push(T('Dosis económica: la pendiente de la curva iguala la razón de precios {r} (insumo {i} entre producto {p}).', { r: sig(r.precios.razon), i: sig(r.precios.insumo), p: sig(r.precios.producto) }));
      cuadros.push({ id: 'derivados', titulo: T('Valores derivados'),
        columnas: [col('n', T('Cantidad'), 'texto')].concat(G > 1 ? [col('grupo', r.grupo, 'texto')] : [], [col('v', T('Valor'), 'sig'), col('ee', T('EE'), 'sig'), col('ic', ICt, 'intervaloSig')]),
        filas: r.derivados.map(z => ({ n: NOMBRE_DER[z.nombre], grupo: z.grupo, v: z.valor, ee: z.ee, ic: z.ic })), notas });
    }
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
      notas: [T('AIC y BIC comparan modelos ajustados a los mismos datos (menor es mejor).')].concat(A.ponderado ? [T('Con pesos, las sumas de cuadrados son ponderadas: SCR = Σ w·(y − ŷ)² y SCT = Σ w·(y − ȳw)².')] : []) });
    const res = r.valores.residuos, w = r.valores.w, sd = A.sigma, grandes = res.filter((v, i) => Math.abs(v * (w ? sqrt(w[i]) : 1) / sd) > 3).length;
    const semaforo = [{ nombre: T('Convergencia'), color: A.convergio ? 'verde' : 'rojo', texto: A.convergio ? T('El ajuste llegó al óptimo.') : T('El ajuste no llegó a la tolerancia.') },
      { nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde', texto: grandes === 1 ? T('Un residuo pasa de 3σ: revisa esa observación.') : grandes ? T('{k} residuos pasan de 3σ.', { k: grandes }) : T('Ningún residuo pasa de 3σ.') }];
    return { titulo: T('Regresión no lineal: modelo {m}', { m: NOMBRE[r.modelo] }), conclusiones: conclusiones.map(may), cuadros, semaforo };
  }

  /* expresiones de la dosis económica y de la respuesta en ella, para car::deltaMethod (R: razón de precios) */
  const ECON_R = {
    'cuadratico-meseta': ['(R - b) / (2 * c)', X => `a + b * (${X}) + c * (${X})^2`],
    mitscherlich: ['log(b * c / R) / c', X => `a - b * exp(-c * (${X}))`],
    mm2: ['sqrt(d * e / R) - e', X => `d * (${X}) / (e + (${X}))`],
    mm3: ['sqrt((d - c) * e / R) - e', X => `c + (d - c) * (${X}) / (e + (${X}))`],
    'lineal-meseta': ['x0', () => 'a + b * x0'],
  };
  function codigoR(id) {
    return (e, op, ctx) => {
      const xn = e.x || e.dosis, res = ctx && ctx.resultado, m = res ? res.modelo : op.modelo === 'auto' ? MODELOS_DE[id][0] : op.modelo, P = N().MODELOS[m].par, G = res && res.niveles.length > 1 ? res.niveles.length : 0;
      let f = FORMULA_R[m];
      if (G) for (const pn of P) f = f.replace(new RegExp('\\b' + pn + '\\b', 'g'), pn + '[g]');
      const ini = res ? P.map((pn, k) => pn + ' = ' + (G ? 'c(' + res.niveles.map((_, h) => +res.parametros.estimado[k * G + h].toPrecision(12)).join(', ') + ')' : +res.parametros.estimado[k].toPrecision(12))).join(', ') : P.map(pn => pn + ' = 1').join(', ');
      const pesos = e.pesos ? ', weights = w' : '';
      const L = ['# Regresión no lineal (código R equivalente a SigmaPro)', `d <- data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], x = datos[[${JSON.stringify(xn)}]]${e.grupo ? `, g = factor(datos[[${JSON.stringify(e.grupo)}]])` : ''}${e.pesos ? `, w = datos[[${JSON.stringify(e.pesos)}]]` : ''})`,
        'd <- na.omit(d)'].concat(e.pesos ? ['d <- d[d$w > 0, ]   # las filas con peso cero no cuentan'] : []);
      if (res && res.seleccion) L.push('# SigmaPro ajustó ' + res.seleccion.map(z => z.modelo).join(', ') + ' y eligió el de menor AIC: ' + m);
      L.push('# arranca en los valores de SigmaPro (nls converge al mismo óptimo)',
        `m <- nls(y ~ ${f}, data = d, start = list(${ini})${pesos})`, 'summary(m)',
        res && res.intervalo === 'perfil' ? 'confint(m)   # IC por verosimilitud perfilada (perfil de nls)'
          : `cf <- summary(m)$coefficients; qt <- qt(${1 - (1 - (op.nivel || 0.95)) / 2}, df.residual(m)); cbind(cf[, 1:2], inf = cf[, 1] - qt * cf[, 2], sup = cf[, 1] + qt * cf[, 2])   # IC de Wald`,
        `c(SCR = deviance(m), sigma = summary(m)$sigma, R2 = 1 - deviance(m) / sum(${e.pesos ? 'd$w * (d$y - weighted.mean(d$y, d$w))^2' : '(d$y - mean(d$y))^2'}), AIC = AIC(m), BIC = BIC(m))`);
      if (m.startsWith('ll')) L.push('# DEp = e · (p / (100 − p))^(1/b); su EE por el método delta (p. ej. car::deltaMethod(m, "e * (10/90)^(1/b)"))');
      if (m.startsWith('bc')) L.push(`# DE50 y dosis de máxima respuesta como en drc: m2 <- drc::drm(y ~ x${e.grupo ? ', curveid = g' : ''}, data = d, fct = drc::${m === 'bc5' ? 'BC.5' : 'BC.4'}()); drc::ED(m2, 50, interval = "delta"); drc::MAX(m2)`);
      if (m === 'cuadratico-meseta') L.push('# dosis óptima = −b/(2c) y meseta = a − b²/(4c), con su EE por el método delta (car::deltaMethod)');
      if (m === 'lineal-meseta') L.push('# x0 es la dosis óptima; la meseta es a + b·x0 (car::deltaMethod(m, "a + b * x0"))');
      if (res && res.precios && ECON_R[m]) {
        const [dx, dy] = ECON_R[m], R = +res.precios.razon.toPrecision(15), con = (s, h) => (G ? P.reduce((t, pn) => t.replace(new RegExp('\\b' + pn + '\\b', 'g'), pn + (h + 1)), s) : s).replace(/\bR\b/g, String(R));
        L.push(`# dosis económica: la pendiente iguala la razón de precios R = ${R} (insumo ${res.precios.insumo} / producto ${res.precios.producto})`);
        for (let h = 0; h < (G || 1); h++) {
          const X = con(dx, h);
          L.push(`car::deltaMethod(m, "${X}")${G ? '   # ' + res.niveles[h] : ''}`, `car::deltaMethod(m, "${con(dy(dx), h)}")   # respuesta en esa dosis`);
        }
      }
      if (G) L.push(`m0 <- nls(y ~ ${FORMULA_R[m]}, data = d, start = list(${P.map((pn, k) => pn + ' = ' + +(res.parametros.estimado.slice(k * G, (k + 1) * G).reduce((s, v) => s + v, 0) / G).toPrecision(8)).join(', ')})${pesos})`,
        'anova(m0, m)   # ¿una curva común para todos los grupos?');
      return L.join('\n');
    };
  }

  const OPC = d => ({ modelo: { tipo: 'texto', omision: d }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 }, intervalo: { tipo: 'texto', omision: 'wald' },
    precioProducto: { tipo: 'numero', omision: 0 }, precioInsumo: { tipo: 'numero', omision: 0 }, ejeLog: { tipo: 'logico', omision: false } });
  const ENT = x => Object.assign({ respuesta: { tipo: 'numerica' } }, x, { grupo: { tipo: 'factor', opcional: true }, pesos: { tipo: 'numerica', opcional: true } });
  SP.metodosNoLineal = { MODELOS_DE, NOMBRE, ECUACION, SENTIDO, sentidoDe, NOMBRE_DER, reporte };
  SP.metodo({
    id: 'curva-crecimiento', familia: 'no-lineal', motor: 'js', orden: 10, nombre: T('Curva de crecimiento'),
    resumen: T('Logístico, Gompertz o Weibull en el tiempo: asíntota, punto de inflexión y comparación de curvas entre grupos.'),
    entradas: ENT({ x: { tipo: 'numerica' } }), opciones: OPC('logistico'),
    validar: validar('curva-crecimiento'), calcular: calcular('curva-crecimiento'), reporte, codigoR: codigoR('curva-crecimiento'),
  });
  SP.metodo({
    id: 'dosis-respuesta', familia: 'no-lineal', motor: 'js', orden: 20, nombre: T('Dosis-respuesta (log-logístico)'),
    resumen: T('Herbicidas, fungicidas o tóxicos: DE10, DE50 y DE90 con su intervalo, hormesis (Brain-Cousens) y comparación entre productos.'),
    entradas: ENT({ dosis: { tipo: 'numerica' } }), opciones: OPC('ll4'),
    validar: validar('dosis-respuesta'), calcular: calcular('dosis-respuesta'), reporte, codigoR: codigoR('dosis-respuesta'),
  });
  SP.metodo({
    id: 'respuesta-meseta', familia: 'no-lineal', motor: 'js', orden: 30, nombre: T('Respuesta a la dosis con meseta'),
    resumen: T('Fertilización y riego: lineal-meseta, cuadrático-meseta, Mitscherlich o Michaelis-Menten, con la dosis óptima, el rendimiento máximo y la dosis económica.'),
    entradas: ENT({ dosis: { tipo: 'numerica' } }), opciones: OPC('lineal-meseta'),
    validar: validar('respuesta-meseta'), calcular: calcular('respuesta-meseta'), reporte, codigoR: codigoR('respuesta-meseta'),
  });
});

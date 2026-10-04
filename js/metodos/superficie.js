/* SigmaPro — superficies de respuesta (familia Superficies de respuesta), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Dos métodos con el mismo cálculo (SP.superficie, validado contra lm y eigen de R):
   - superficie-respuesta: modelo de segundo orden (o de primer orden con interacciones), falta de ajuste, análisis
     canónico, punto estacionario (máximo, mínimo o silla) y la cresta de máxima o de mínima respuesta;
   - ascenso-pronunciado: modelo de primer orden con el camino de ascenso (o descenso) más pronunciado, para salir de
     la región actual hacia el óptimo.
   Los factores son columnas numéricas (2 a 6); un factor de bloques es opcional. */
SP.definir('metodos-superficie', function (SP) {
  'use strict';
  const T = SP.T;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f2 = x => (Number.isFinite(x) ? x.toFixed(2).replace(/^-/, '−') : '—');
  const sig = x => SP.formatos.texto(x, 'sig');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const S = () => SP.superficie;
  const ORDEN = { segundo: T('segundo orden'), interacciones: T('primer orden con interacciones'), primer: T('primer orden') };
  const NATURALEZA = { maximo: T('un máximo'), minimo: T('un mínimo'), silla: T('un punto silla') };

  function datosDe(tabla, e) {
    const yv = tabla.col(e.respuesta).valores, xs = e.factores.map(f => tabla.col(f).valores), bc = e.bloque ? SP.estructura.comoFactor(tabla, e.bloque) : null;
    const y = [], x = e.factores.map(() => []), b0 = [];
    for (let i = 0; i < tabla.n; i++) {
      if (yv[i] !== yv[i] || xs.some(v => v[i] !== v[i]) || (bc && bc.codigos[i] < 0)) continue;
      y.push(yv[i]); xs.forEach((v, j) => x[j].push(v[i])); if (bc) b0.push(bc.codigos[i]);
    }
    let bloque = null;
    if (bc) {
      const usados = [...new Set(b0)].sort((a, b) => a - b), mapa = new Map(usados.map((c, k) => [c, k]));
      bloque = { nombre: e.bloque, niveles: usados.map(c => bc.niveles[c]), codigos: Int32Array.from(b0, c => mapa.get(c)) };
      if (bloque.niveles.length < 2) bloque = null;
    }
    return { y, x, bloque };
  }
  function validar(id) {
    return (tabla, e, op) => {
      exigir(e.respuesta && tabla.columnas[e.respuesta], T('Elige la variable de respuesta.'));
      exigir(Array.isArray(e.factores) && e.factores.length >= 2, T('Elige al menos dos factores numéricos (las variables del diseño).'));
      exigir(e.factores.length <= 6, T('A lo más seis factores.'));
      for (const f of e.factores) exigir(tabla.columnas[f], T('No existe la columna «{c}».', { c: f }));
      exigir([e.respuesta].concat(e.factores).every(c => tabla.col(c).tipo === 'numerica'), T('La respuesta y los factores deben ser numéricos.'));
      const todas = [e.respuesta].concat(e.factores, e.bloque ? [e.bloque] : []);
      exigir(new Set(todas).size === todas.length, T('Cada columna va en un solo papel.'));
      if (e.bloque) exigir(tabla.columnas[e.bloque], T('No existe la columna «{c}».', { c: e.bloque }));
      if (id === 'superficie-respuesta') exigir(['segundo', 'interacciones'].includes(op.orden), T('Orden del modelo no válido: {o}.', { o: op.orden }));
      exigir(['maximo', 'minimo'].includes(op.objetivo), T('El objetivo es la máxima o la mínima respuesta.'));
      exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e), orden = id === 'ascenso-pronunciado' ? 'primer' : op.orden;
      const r = S().analizar({ y: d.y, x: d.x, nombres: e.factores, bloque: d.bloque, orden, objetivo: op.objetivo, nivel: op.nivel });
      return Object.assign(r, { tipo: 'superficie', metodo: id, orden, objetivo: op.objetivo, respuesta: e.respuesta, factores: e.factores.slice(), bloque: d.bloque ? e.bloque : '',
        nivel: op.nivel, alfa: op.alfa, valores: { x: d.x, y: d.y }, n: d.y.length, excluidas: tabla.n - d.y.length });
    };
  }

  /* ======================= reporte ======================= */
  const lista = (nombres, valores) => nombres.map((f, j) => f + ' = ' + sig(valores[j])).join(', ');
  function reporte(r) {
    const a = r.alfa || 0.05, A = r.ajuste, conclusiones = [], cuadros = [], F = r.factores, c = Math.round(100 * r.nivel);
    conclusiones.push(T('El modelo de {o} explica el {p} % de la variación de «{y}» (R² = {r}; R² ajustada = {ra}).', { o: ORDEN[r.orden], p: (100 * A.r2).toFixed(1), y: r.respuesta, r: A.r2.toFixed(3), ra: A.r2_ajustada.toFixed(3) }));
    const fa = r.falta_ajuste;
    if (fa) conclusiones.push(fa.p >= a ? T('No hay falta de ajuste (F = {F} con {g1} y {g2} gl, p {p}): el modelo describe bien la respuesta en la región.', { F: f2(fa.F), g1: fa.gl1, g2: fa.gl2, p: fp(fa.p) })
      : r.orden === 'primer' ? T('Hay falta de ajuste (F = {F} con {g1} y {g2} gl, p {p}): la respuesta se curva; cerca del óptimo conviene un diseño de segundo orden.', { F: f2(fa.F), g1: fa.gl1, g2: fa.gl2, p: fp(fa.p) })
        : T('Hay falta de ajuste (F = {F} con {g1} y {g2} gl, p {p}): la respuesta tiene una forma que el modelo no capta; interpreta el óptimo con cuidado.', { F: f2(fa.F), g1: fa.gl1, g2: fa.gl2, p: fp(fa.p) }));
    else conclusiones.push(T('No hay puntos repetidos (sin error puro), así que la falta de ajuste no se puede probar.'));
    const E = r.estacionario, dentro = E ? E.distancia <= r.radio + 1e-9 : true;
    if (E) {
      conclusiones.push(E.naturaleza === 'silla'
        ? T('El punto estacionario es un punto silla ({x}): la respuesta sube en unas direcciones y baja en otras, así que no hay un óptimo; sigue la cresta.', { x: lista(F, E.natural) })
        : T('El punto estacionario es {n}: {x}, con una respuesta estimada de {v} (IC {c} %: {i} a {s}).', { n: NATURALEZA[E.naturaleza], x: lista(F, E.natural), v: sig(E.prediccion), c, i: sig(E.ic_inf), s: sig(E.ic_sup) }));
      if (!dentro) conclusiones.push(T('Ese punto está fuera de la región experimental ({d} unidades codificadas del centro; los datos llegan a {r}): es una extrapolación; usa la cresta.', { d: f2(E.distancia), r: f2(r.radio) }));
      const lam = r.canonico.valores.map(Math.abs);
      if (E.naturaleza !== 'silla' && Math.min(...lam) < 0.1 * Math.max(...lam)) conclusiones.push(T('Un valor propio es casi cero: hay una cresta casi plana y muchas combinaciones dan casi la misma respuesta.'));
    }
    const C = r.cresta, ult = C.distancia.length - 1;
    if (r.orden === 'primer') {
      const paso = C.natural[2].map((v, j) => v - C.natural[0][j]);
      conclusiones.push(T('Camino de {s} más pronunciado: por cada unidad codificada de distancia, {d}.', { s: r.objetivo === 'minimo' ? T('descenso') : T('ascenso'),
        d: F.map((f, j) => f + ' ' + (paso[j] >= 0 ? '+' : '−') + sig(Math.abs(paso[j]))).join(', ') }));
    } else if (!E || E.naturaleza === 'silla' || !dentro || (E.naturaleza === 'maximo') !== (r.objetivo === 'maximo')) {
      let k = 0;
      C.prediccion.forEach((v, i) => { if ((r.objetivo === 'minimo' ? -1 : 1) * (v - C.prediccion[k]) > 0) k = i; });
      conclusiones.push(T('Sobre la cresta, la {o} respuesta estimada dentro de la región es {v} con {x} (a {d} del centro).', { o: r.objetivo === 'minimo' ? T('menor') : T('mayor'), v: sig(C.prediccion[k]), x: lista(F, C.natural[k]), d: C.distancia[k] }));
    }
    cuadros.push({ id: 'anova', titulo: T('Análisis de varianza del modelo de {o}', { o: ORDEN[r.orden] }),
      columnas: [col('f', T('Fuente'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'sig'), col('cm', T('CM'), 'sig'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.anova.fuente.map((f, i) => ({ f, gl: r.anova.gl[i], sc: r.anova.sc[i], cm: r.anova.cm[i], F: r.anova.F[i], p: r.anova.p[i] })),
      notas: [T('Sumas de cuadrados secuenciales por grupo de términos; la falta de ajuste se prueba contra el error puro (puntos repetidos).')] });
    const K = r.coeficientes;
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes en unidades codificadas'),
      columnas: [col('t', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('tv', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: K.nombre.map((t, j) => ({ t, b: K.estimado[j], ee: K.ee[j], tv: K.t[j], p: K.p[j] })),
      notas: [T('Variables codificadas: z = (x − centro) / paso (cuadro de la codificación).')] });
    const N = r.naturales;
    cuadros.push({ id: 'naturales', titulo: T('Ecuación en unidades originales'),
      columnas: [col('t', T('Término'), 'texto'), col('b', T('Coeficiente'), 'sig'), col('ee', T('EE'), 'sig'), col('tv', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: N.nombre.map((t, j) => ({ t, b: N.estimado[j], ee: N.ee[j], tv: N.t[j], p: N.p[j] })),
      notas: [T('El mismo modelo escrito con las variables originales; los t de los términos de menor orden prueban otra hipótesis (la pendiente en x = 0).')] });
    cuadros.push({ id: 'codificacion', titulo: T('Codificación de los factores'),
      columnas: [col('f', T('Factor'), 'texto'), col('c', T('Centro (z = 0)'), 'sig'), col('s', T('Paso (z = 1)'), 'sig')],
      filas: F.map((f, j) => ({ f, c: r.codificacion.centro[j], s: r.codificacion.paso[j] })),
      notas: [T('Con cinco niveles simétricos (central compuesto), el paso va del centro al punto factorial y los axiales quedan en ±α; si no, del centro a los extremos.')] });
    if (E) {
      cuadros.push({ id: 'estacionario', titulo: T('Punto estacionario: {n}', { n: NATURALEZA[E.naturaleza] }),
        columnas: [col('f', T('Factor'), 'texto'), col('z', T('Codificado'), 'sig'), col('x', T('Original'), 'sig')],
        filas: F.map((f, j) => ({ f, z: E.codificado[j], x: E.natural[j] })),
        notas: [T('Respuesta estimada: {v} (EE {e}; IC {c} %: {i} a {s}); distancia al centro: {d} (los datos llegan a {r}).', { v: sig(E.prediccion), e: sig(E.ee), c, i: sig(E.ic_inf), s: sig(E.ic_sup), d: f2(E.distancia), r: f2(r.radio) })] });
      cuadros.push({ id: 'canonico', titulo: T('Análisis canónico'),
        columnas: [col('l', T('Valor propio'), 'sig')].concat(F.map((f, j) => col('v' + j, f, 'forma'))),
        filas: r.canonico.valores.map((l, h) => Object.assign({ l }, ...F.map((_, j) => ({ ['v' + j]: r.canonico.vectores[j][h] })))),
        notas: [T('Todos negativos: máximo; todos positivos: mínimo; con signos distintos: silla. Cada fila da la dirección (en unidades codificadas) de su eje canónico; un valor propio cerca de cero indica una cresta.')] });
    }
    cuadros.push({ id: 'cresta', titulo: r.orden === 'primer' ? T('Camino de {s} más pronunciado', { s: r.objetivo === 'minimo' ? T('descenso') : T('ascenso') }) : T('Cresta de {o} respuesta', { o: r.objetivo === 'minimo' ? T('mínima') : T('máxima') }),
      columnas: [col('d', T('Distancia'), 'forma2')].concat(F.map((f, j) => col('x' + j, f, 'sig')), [col('y', T('Predicción'), 'sig'), col('ee', T('EE'), 'sig')]),
      filas: C.distancia.map((d, i) => Object.assign({ d, y: C.prediccion[i], ee: C.ee[i] }, ...F.map((_, j) => ({ ['x' + j]: C.natural[i][j] })))),
      notas: [r.orden === 'primer' ? T('Distancia en unidades codificadas desde el centro del diseño; más allá de {r} es extrapolación: confirma con nuevos ensayos sobre el camino.', { r: f2(r.radio) })
        : T('Para cada distancia (unidades codificadas), la combinación con la {o} respuesta estimada sobre la esfera de ese radio (análisis de cresta).', { o: r.objetivo === 'minimo' ? T('menor') : T('mayor') })] });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: T('Observaciones'), valor: A.n, _dec: 0 }, { medida: T('gl del error'), valor: A.gl, _dec: 0 }, { medida: T('Error estándar residual (σ)'), valor: A.sigma, _dec: 4 },
        { medida: 'R²', valor: A.r2, _dec: 4 }, { medida: T('R² ajustada'), valor: A.r2_ajustada, _dec: 4 }] });
    const grandes = r.residuos.filter(v => Math.abs(v / A.sigma) > 3).length;
    const semaforo = [
      { nombre: T('Falta de ajuste'), color: !fa ? 'gris' : fa.p >= a ? 'verde' : 'ambar', texto: !fa ? T('Sin puntos repetidos no se puede probar.') : fa.p >= a ? T('El modelo describe bien la respuesta (p {p}).', { p: fp(fa.p) }) : T('Hay falta de ajuste (p {p}).', { p: fp(fa.p) }) },
      { nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde', texto: grandes === 1 ? T('Un residuo pasa de 3σ: revisa esa observación.') : grandes ? T('{k} residuos pasan de 3σ.', { k: grandes }) : T('Ningún residuo pasa de 3σ.') }];
    if (E) semaforo.push({ nombre: T('Punto estacionario'), color: dentro && E.naturaleza !== 'silla' ? 'verde' : 'ambar',
      texto: E.naturaleza === 'silla' ? T('Es un punto silla: no hay óptimo; usa la cresta.') : dentro ? T('Está dentro de la región experimental.') : T('Está fuera de la región experimental: es una extrapolación.') });
    return { titulo: r.orden === 'primer' ? T('Primer orden y ascenso más pronunciado') : T('Superficie de respuesta: modelo de {o}', { o: ORDEN[r.orden] }), conclusiones: conclusiones.map(may), cuadros, semaforo };
  }

  function codigoR(id) {
    return (e, op, ctx) => {
      const res = ctx && ctx.resultado, F = e.factores || [], k = F.length, orden = id === 'ascenso-pronunciado' ? 'primer' : op.orden || 'segundo';
      const z = F.map((_, j) => 'z' + (j + 1)), cen = res ? res.codificacion.centro : F.map(() => 0), pas = res ? res.codificacion.paso : F.map(() => 1);
      const num = v => +(+v).toPrecision(12);
      const pares = [];
      for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) pares.push([i, j]);
      const terminos = z.slice().concat(orden === 'primer' ? [] : pares.map(([i, j]) => `I(${z[i]} * ${z[j]})`), orden === 'segundo' ? z.map(v => `I(${v}^2)`) : []);
      const L = ['# Superficie de respuesta (código R equivalente a SigmaPro; solo R base)',
        `d <- data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], ${F.map((f, j) => `x${j + 1} = datos[[${JSON.stringify(f)}]]`).join(', ')}${e.bloque ? `, bloque = factor(datos[[${JSON.stringify(e.bloque)}]])` : ''})`,
        'd <- na.omit(d)',
        `# codificación z = (x − centro) / paso: ${F.map((f, j) => `${z[j]} = ${f}`).join(', ')}`,
        F.map((_, j) => `d$${z[j]} <- (d$x${j + 1} - ${num(cen[j])}) / ${num(pas[j])}`).join('; '),
        `m <- lm(y ~ ${e.bloque ? 'bloque + ' : ''}${terminos.join(' + ')}, data = d)`, 'summary(m)',
        `anova(m)   # secuencial por término (SigmaPro suma ${orden === 'primer' ? 'el primer orden' : 'los de cada grupo: primer orden, interacciones' + (orden === 'segundo' ? ', cuadráticos' : '')})`,
        `pe <- lm(y ~ ${e.bloque ? 'bloque + ' : ''}factor(paste(${F.map((_, j) => 'x' + (j + 1)).join(', ')})), data = d)   # error puro`,
        'anova(m, pe)   # falta de ajuste',
        `cf <- coef(m); b <- cf[c(${z.map(v => JSON.stringify(v)).join(', ')})]`];
      if (orden !== 'primer') {
        L.push(`B <- diag(${orden === 'segundo' ? `cf[c(${z.map(v => JSON.stringify(`I(${v}^2)`)).join(', ')})]` : `0, ${k}`}, ${k})`);
        for (const [i, j] of pares) L.push(`B[${i + 1}, ${j + 1}] <- B[${j + 1}, ${i + 1}] <- cf[${JSON.stringify(`I(${z[i]} * ${z[j]})`)}] / 2`);
      }
      if (orden === 'segundo') L.push('xs <- -0.5 * solve(B, b); xs   # punto estacionario (codificado)', `c(${cen.map(num).join(', ')}) + c(${pas.map(num).join(', ')}) * xs   # en unidades originales`, 'eigen(B)   # análisis canónico');
      if (orden === 'primer') L.push(`b / sqrt(sum(b^2))   # dirección de ${op.objetivo === 'minimo' ? 'descenso (con signo contrario)' : 'ascenso'} más pronunciado (codificada)`);
      else L.push(`# cresta de radio r: x = 0.5 * solve(mu * diag(${k}) - B, b) con mu ${op.objetivo === 'minimo' ? '< min(eigen(B)$values)' : '> max(eigen(B)$values)'} tal que sqrt(sum(x^2)) = r (uniroot)`);
      return L.join('\n');
    };
  }

  const OPC = { orden: { tipo: 'texto', omision: 'segundo' }, objetivo: { tipo: 'texto', omision: 'maximo' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } };
  SP.metodosSuperficie = { ORDEN, NATURALEZA, reporte };
  SP.metodo({
    id: 'superficie-respuesta', familia: 'superficies', motor: 'js', orden: 10, nombre: T('Superficie de respuesta (segundo orden)'),
    resumen: T('Central compuesto o Box-Behnken: falta de ajuste, punto estacionario (máximo, mínimo o silla), análisis canónico y cresta.'),
    entradas: { respuesta: { tipo: 'numerica' }, factores: { tipo: 'numerica+', maximo: 6 }, bloque: { tipo: 'factor', opcional: true } }, opciones: OPC,
    validar: validar('superficie-respuesta'), calcular: calcular('superficie-respuesta'), reporte, codigoR: codigoR('superficie-respuesta'),
  });
  SP.metodo({
    id: 'ascenso-pronunciado', familia: 'superficies', motor: 'js', orden: 20, nombre: T('Primer orden y ascenso más pronunciado'),
    resumen: T('Factorial con puntos centrales: modelo de primer orden, curvatura (falta de ajuste) y el camino hacia la mejor respuesta.'),
    entradas: { respuesta: { tipo: 'numerica' }, factores: { tipo: 'numerica+', maximo: 6 }, bloque: { tipo: 'factor', opcional: true } },
    opciones: { objetivo: OPC.objetivo, nivel: OPC.nivel, alfa: OPC.alfa },
    validar: validar('ascenso-pronunciado'), calcular: calcular('ascenso-pronunciado'), reporte, codigoR: codigoR('ascenso-pronunciado'),
  });
});

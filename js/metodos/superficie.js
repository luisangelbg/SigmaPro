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
      exigir(['auto', 'manual'].includes(op.codificacion || 'auto'), T('La codificación es la del diseño o a mano.'));
      if (op.codificacion === 'manual') {
        const b = (op.bajos || []).map(Number), a = (op.altos || []).map(Number), k = e.factores.length;
        exigir(b.length === k && a.length === k && b.every(Number.isFinite) && a.every(Number.isFinite) && b.every((v, j) => a[j] > v),
          T('Para la codificación a mano da el nivel −1 y el +1 de cada factor (el +1 mayor que el −1).'));
      }
    };
  }
  function calcular(id) {
    return (tabla, e, op) => {
      const d = datosDe(tabla, e), orden = id === 'ascenso-pronunciado' ? 'primer' : op.orden;
      const manual = op.codificacion === 'manual' ? { centros: op.bajos.map((b, j) => (+b + +op.altos[j]) / 2), pasos: op.bajos.map((b, j) => (+op.altos[j] - +b) / 2) } : null;
      const r = S().analizar({ y: d.y, x: d.x, nombres: e.factores, bloque: d.bloque, orden, objetivo: op.objetivo, nivel: op.nivel, codificacion: manual });
      return Object.assign(r, { tipo: 'superficie', metodo: id, orden, objetivo: op.objetivo, codificacionManual: !!manual, respuesta: e.respuesta, factores: e.factores.slice(), bloque: d.bloque ? e.bloque : '',
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
      C.prediccion.forEach((v, i) => { if (C.distancia[i] <= r.radio + 1e-9 && (r.objetivo === 'minimo' ? -1 : 1) * (v - C.prediccion[k]) > 0) k = i; });
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
      notas: [r.codificacionManual ? T('Codificación a mano: z = −1 y +1 en los niveles dados para cada factor.') : T('Con cinco niveles simétricos (central compuesto), el paso va del centro al punto factorial y los axiales quedan en ±α; si no, del centro a los extremos.')] });
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

  /* ======================= generador de diseños ======================= */
  const TIPOS_DISENO = { ccd: T('Central compuesto'), bbd: 'Box-Behnken', factorial: T('Factorial 2^k con centros'), latice: T('Simplex-látice (mezclas)'), centroide: T('Simplex-centroide (mezclas)') };
  const ALFAS = { rotable: T('rotable'), ortogonal: T('ortogonal'), cara: T('de caras centradas'), bloques: T('en dos bloques ortogonales') };
  const lista3 = s => String(s === undefined || s === null ? '' : s).split(/[;,]\s*|\s+/).map(v => v.trim()).filter(Boolean);
  const esMezcla = t => t === 'latice' || t === 'centroide';
  function validarDiseno(t, e, op) {
    exigir(TIPOS_DISENO[op.tipo], T('Tipo de diseño no válido: {t}.', { t: op.tipo }));
    exigir(Number.isInteger(+op.k), T('El número de factores o componentes es un entero.'));
    if (op.tipo === 'ccd') exigir(ALFAS[op.alfa], T('Tipo de α no válido: {a}.', { a: op.alfa }));
    if (op.centros !== '' && op.centros !== null && op.centros !== undefined) exigir(Number.isInteger(+op.centros) && +op.centros >= 0 && +op.centros <= 20, T('Los puntos centrales van de 0 a 20.'));
    if (op.semilla !== '' && op.semilla !== null && op.semilla !== undefined) exigir(Number.isInteger(+op.semilla), T('La semilla es un número entero.'));
    const nom = lista3(op.nombres);
    if (nom.length) exigir(nom.length === +op.k && new Set(nom).size === nom.length, T('Escribe {k} nombres distintos (o ninguno).', { k: op.k }));
    if (!esMezcla(op.tipo) && (lista3(op.bajos).length || lista3(op.altos).length)) {
      const b = lista3(op.bajos).map(Number), a = lista3(op.altos).map(Number);
      exigir(b.length === +op.k && a.length === +op.k && b.every(Number.isFinite) && a.every(Number.isFinite) && b.every((v, j) => a[j] > v),
        T('Para las unidades originales escribe {k} niveles bajos (−1) y {k} altos (+1), cada alto mayor que su bajo.', { k: op.k }));
    }
    if (esMezcla(op.tipo) && op.total !== undefined && op.total !== '') exigir(+op.total > 0, T('El total de la mezcla debe ser mayor que cero.'));
  }
  function calcularDiseno(t, e, op) {
    const k = +op.k, vacio = v => v === '' || v === null || v === undefined;
    const d = S().generarDiseno({ tipo: op.tipo, k, alfa: op.alfa, grado: +op.grado || 2, centros: vacio(op.centros) ? undefined : +op.centros, semilla: vacio(op.semilla) ? undefined : +op.semilla });
    const nombres = lista3(op.nombres).length ? lista3(op.nombres) : Array.from({ length: k }, (_, j) => (esMezcla(op.tipo) ? String.fromCharCode(65 + j) : 'x' + (j + 1)));
    let natural = null;
    if (esMezcla(op.tipo)) { const tot = vacio(op.total) ? 1 : +op.total; natural = d.codificado.map(z => z.map(v => v * tot)); }
    else if (lista3(op.bajos).length) {
      const b = lista3(op.bajos).map(Number), a = lista3(op.altos).map(Number);
      natural = d.codificado.map(z => z.map((v, j) => (a[j] + b[j]) / 2 + (a[j] - b[j]) / 2 * v));
    }
    return Object.assign({}, d, { clase: d.tipo, tipo: 'diseno-superficie', metodo: 'diseno-superficie', nombres, natural, total: esMezcla(op.tipo) ? (vacio(op.total) ? 1 : +op.total) : undefined });
  }
  function reporteDiseno(r) {
    const n = r.codificado.length, k = r.k, conclusiones = [], cuadros = [], nb = new Set(r.bloque).size;
    const centros = r.codificado.filter(z => z.every(v => (esMezcla(r.clase) ? Math.abs(v - 1 / k) < 1e-12 : v === 0))).length;
    if (r.clase === 'ccd') conclusiones.push(T('Central compuesto {a} de {k} factores: {n} corridas ({f} factoriales{m}, {x} axiales con α = {al} y {c} centros).',
      { a: ALFAS[r.tipoAlfa], k, n, f: r.factorial, m: k >= 5 ? T(' de la media fracción') : '', x: 2 * k, al: r.alfa.toFixed(4), c: centros }));
    else if (r.clase === 'bbd') conclusiones.push(T('Box-Behnken de {k} factores: {n} corridas, {c} de ellas en el centro; cada factor toma tres niveles (−1, 0 y +1).', { k, n, c: centros }));
    else if (r.clase === 'factorial') conclusiones.push(T('Factorial 2^{k} con {c} centros: {n} corridas; sirve para el primer orden y para probar la curvatura.', { k, c: centros, n }));
    else conclusiones.push(T('{t} de {k} componentes: {n} mezclas{c}.', { t: TIPOS_DISENO[r.clase], k, n, c: centros ? T(', {c} en el centroide', { c: centros }) : '' }));
    const p2 = esMezcla(r.clase) ? k * (k + 1) / 2 : (k + 1) * (k + 2) / 2;
    const mod = esMezcla(r.clase) ? T('cuadrático de Scheffé') : T('de segundo orden');
    if (r.clase !== 'factorial') conclusiones.push(n > p2 ? (n - p2 === 1 ? T('El modelo {m} tiene {p} coeficientes: queda 1 grado de libertad para el error.', { m: mod, p: p2 }) : T('El modelo {m} tiene {p} coeficientes: quedan {g} grados de libertad para el error.', { m: mod, p: p2, g: n - p2 }))
      : esMezcla(r.clase) ? T('El modelo {m} tiene {p} coeficientes y el diseño, {n} mezclas: repite algunas mezclas (por ejemplo el centroide) para estimar el error.', { m: mod, p: p2, n })
        : T('El modelo {m} tiene {p} coeficientes y el diseño, {n} corridas: agrega puntos centrales para estimar el error.', { m: mod, p: p2, n }));
    if (r.natural && !esMezcla(r.clase) && r.natural.some(f => f.some(v => v < 0))) conclusiones.push(T('Aviso: en unidades originales hay niveles negativos (los axiales salen del rango ±1); revisa que tengan sentido o usa α de caras centradas.'));
    const azar = r.orden.some((v, i) => v !== i), cols = [col('c', T('Corrida'), 'entero'), col('s', T('Estándar'), 'entero')].concat(nb > 1 ? [col('b', T('Bloque'), 'entero')] : [],
      r.nombres.map((nm, j) => col('z' + j, esMezcla(r.clase) ? nm : T('{f} (codificado)', { f: nm }), 'auto4')), r.natural && !esMezcla(r.clase) ? r.nombres.map((nm, j) => col('x' + j, nm, 'auto4')) : [],
      r.natural && esMezcla(r.clase) && r.total !== 1 ? r.nombres.map((nm, j) => col('x' + j, T('{f} (de {t})', { f: nm, t: r.total }), 'auto4')) : []);
    cuadros.push({ id: 'corridas', titulo: T('Corridas del diseño'), columnas: cols,
      filas: r.orden.map((s, c) => Object.assign({ c: c + 1, s: s + 1, b: r.bloque[s] }, ...r.codificado[s].map((v, j) => ({ ['z' + j]: v })), ...(r.natural ? r.natural[s].map((v, j) => ({ ['x' + j]: v })) : []))),
      notas: [azar ? T('Corrida: el orden al azar (con la semilla); Estándar: el orden del diseño.') : T('En el orden estándar; con una semilla, la app da el orden de corrida al azar.')] });
    return { titulo: T('Diseño: {t}', { t: TIPOS_DISENO[r.clase] }), conclusiones: conclusiones.map(may), cuadros, semaforo: [] };
  }
  function codigoRDiseno(e, op) {
    const k = +op.k, L = ['# ' + TIPOS_DISENO[op.tipo] + ' (código R equivalente a SigmaPro; solo R base, en el orden estándar)'];
    if (op.tipo === 'ccd') {
      L.push(`F <- as.matrix(expand.grid(rep(list(c(-1, 1)), ${k >= 5 ? k - 1 : k})))${k >= 5 ? '; F <- cbind(F, apply(F, 1, prod))   # media fracción' : ''}`,
        `nF <- nrow(F); k <- ${k}; n0 <- ${op.centros === '' || op.centros === undefined ? { 2: 5, 3: 6, 4: 7, 5: 6, 6: 9 }[k] : +op.centros}`,
        { rotable: 'alfa <- nF^(1/4)', cara: 'alfa <- 1', ortogonal: 'alfa <- (nF * (sqrt(nF + 2 * k + n0) - sqrt(nF))^2 / 4)^(1/4)', bloques: 'n1 <- ceiling(n0 / 2); n2 <- n0 - n1; alfa <- sqrt(k * (1 + n2 / (2 * k)) / (1 + n1 / nF))' }[op.alfa],
        'A <- do.call(rbind, lapply(1:k, function(j) { m <- matrix(0, 2, k); m[, j] <- c(-alfa, alfa); m }))',
        op.alfa === 'bloques' ? 'X <- rbind(F, matrix(0, n1, k), A, matrix(0, n2, k)); bloque <- rep(1:2, c(nF + n1, 2 * k + n2))' : 'X <- rbind(F, matrix(0, n0, k), A)');
    } else if (op.tipo === 'bbd') L.push(`k <- ${k}; p <- t(combn(k, 2))`, 'X <- do.call(rbind, lapply(1:nrow(p), function(r) t(sapply(list(c(-1, -1), c(1, -1), c(-1, 1), c(1, 1)), function(s) { z <- rep(0, k); z[p[r, ]] <- s; z }))))',
      `X <- rbind(X, matrix(0, ${op.centros === '' || op.centros === undefined ? (k === 5 ? 6 : 3) : +op.centros}, k))`);
    else if (op.tipo === 'factorial') L.push(`X <- rbind(as.matrix(expand.grid(rep(list(c(-1, 1)), ${k}))), matrix(0, ${op.centros === '' || op.centros === undefined ? 4 : +op.centros}, ${k}))`);
    else if (op.tipo === 'latice') L.push(`k <- ${k}; m <- ${+op.grado || 2}`, 'X <- as.matrix(expand.grid(rep(list(0:m), k))); X <- X[rowSums(X) == m, ] / m   # simplex-látice (otro orden)');
    else L.push(`k <- ${k}`, 'X <- do.call(rbind, lapply(1:k, function(s) t(apply(combn(k, s), 2, function(i) { z <- rep(0, k); z[i] <- 1 / s; z }))))   # simplex-centroide');
    L.push('X', '# orden al azar: X[sample(nrow(X)), ] (la semilla de R no da el mismo orden que la de SigmaPro)');
    return L.join('\n');
  }

  /* ======================= mezclas ======================= */
  const MODELOS_MEZCLA = { lineal: T('lineal'), cuadratico: T('cuadrático'), 'cubico-especial': T('cúbico especial') };
  function validarMezclas(t, e, op) {
    exigir(e.respuesta && t.columnas[e.respuesta], T('Elige la variable de respuesta.'));
    exigir(Array.isArray(e.componentes) && e.componentes.length >= 2 && e.componentes.length <= 6, T('Elige de 2 a 6 componentes (las proporciones de la mezcla).'));
    for (const c of e.componentes) exigir(t.columnas[c] && t.col(c).tipo === 'numerica', T('Cada componente debe ser una columna numérica.'));
    exigir(t.col(e.respuesta).tipo === 'numerica', T('La respuesta debe ser numérica.'));
    exigir(!e.componentes.includes(e.respuesta) && new Set(e.componentes).size === e.componentes.length, T('Cada columna va en un solo papel.'));
    exigir(MODELOS_MEZCLA[op.modelo], T('Modelo de mezcla no válido: {m}.', { m: op.modelo }));
    if (op.modelo === 'cubico-especial') exigir(e.componentes.length >= 3, T('El cúbico especial necesita al menos tres componentes.'));
    exigir(['maximo', 'minimo'].includes(op.objetivo), T('El objetivo es la máxima o la mínima respuesta.'));
  }
  function calcularMezclas(t, e, op) {
    const yv = t.col(e.respuesta).valores, xs = e.componentes.map(c => t.col(c).valores), y = [], x = e.componentes.map(() => []);
    for (let i = 0; i < t.n; i++) { if (yv[i] !== yv[i] || xs.some(v => v[i] !== v[i])) continue; y.push(yv[i]); xs.forEach((v, j) => x[j].push(v[i])); }
    const r = S().mezclas({ y, x, nombres: e.componentes, modelo: op.modelo, objetivo: op.objetivo, nivel: op.nivel });
    return Object.assign(r, { tipo: 'mezclas', metodo: 'mezclas', respuesta: e.respuesta, componentes: e.componentes.slice(), modelo: op.modelo, objetivo: op.objetivo, nivel: op.nivel, alfa: op.alfa,
      valores: { y }, n: y.length, excluidas: t.n - y.length });
  }
  function reporteMezclas(r) {
    const a = r.alfa || 0.05, A = r.ajuste, conclusiones = [], cuadros = [], C = r.componentes, O = r.optimo, c = Math.round(100 * r.nivel), tot = r.total;
    conclusiones.push(T('El modelo {m} de Scheffé explica el {p} % de la variación de «{y}» (R² = {r}; R² ajustada = {ra}).', { m: MODELOS_MEZCLA[r.modelo], p: (100 * A.r2).toFixed(1), y: r.respuesta, r: A.r2.toFixed(3), ra: A.r2_ajustada.toFixed(3) }));
    const fa = r.falta_ajuste;
    if (fa) conclusiones.push(fa.p >= a ? T('No hay falta de ajuste (F = {F} con {g1} y {g2} gl, p {p}).', { F: f2(fa.F), g1: fa.gl1, g2: fa.gl2, p: fp(fa.p) })
      : T('Hay falta de ajuste (F = {F} con {g1} y {g2} gl, p {p}): prueba un modelo con más términos.', { F: f2(fa.F), g1: fa.gl1, g2: fa.gl2, p: fp(fa.p) }));
    const sinergias = r.coeficientes.nombre.map((nm, j) => ({ nm, b: r.coeficientes.estimado[j], p: r.coeficientes.p[j], t: r.terminos[j] })).filter(z => z.t.length > 1 && z.p < a);
    if (sinergias.length) conclusiones.push(T('Mezclas con efecto conjunto: {l}.', { l: sinergias.map(z => z.nm + (z.b > 0 ? T(' (sinergia: más de lo que suman)') : T(' (antagonismo)'))).join('; ') }));
    conclusiones.push(T('La mezcla de {o} respuesta estimada es {m}: {v} (IC {c} %: {i} a {s}).', { o: r.objetivo === 'minimo' ? T('menor') : T('mayor'),
      m: C.map((nm, j) => nm + ' ' + (100 * O.mezcla[j]).toFixed(1) + ' %').join(', '), v: sig(O.prediccion), c, i: sig(O.ic_inf), s: sig(O.ic_sup) }));
    cuadros.push({ id: 'anova', titulo: T('Análisis de varianza del modelo {m}', { m: MODELOS_MEZCLA[r.modelo] }),
      columnas: [col('f', T('Fuente'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'sig'), col('cm', T('CM'), 'sig'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.anova.fuente.map((f, i) => ({ f, gl: r.anova.gl[i], sc: r.anova.sc[i], cm: r.anova.cm[i], F: r.anova.F[i], p: r.anova.p[i] })),
      notas: [T('Modelo contra la media (como las proporciones suman 1, la media está en el modelo); falta de ajuste contra el error puro de las mezclas repetidas.')] });
    cuadros.push({ id: 'coeficientes', titulo: T('Coeficientes de Scheffé'),
      columnas: [col('t', T('Término'), 'texto'), col('b', T('Estimado'), 'sig'), col('ee', T('EE'), 'sig'), col('tv', 't', 'forma2'), col('p', 'p', 'pvalor')],
      filas: r.coeficientes.nombre.map((t, j) => ({ t, b: r.coeficientes.estimado[j], ee: r.coeficientes.ee[j], tv: r.coeficientes.t[j], p: r.coeficientes.p[j] })),
      notas: [T('Sobre las proporciones (cada fila dividida por su suma{t}). Cada componente solo: la respuesta del componente puro; los productos: cuánto se aparta la mezcla de lo que suman sus partes.', { t: Math.abs(tot - 1) > 1e-9 ? T(', {s}', { s: sig(tot) }) : '' })] });
    cuadros.push({ id: 'optimo', titulo: T('La mezcla de {o} respuesta', { o: r.objetivo === 'minimo' ? T('menor') : T('mayor') }),
      columnas: [col('c', T('Componente'), 'texto'), col('p', T('Proporción'), 'forma'), col('x', T('Cantidad'), 'sig')],
      filas: C.map((nm, j) => ({ c: nm, p: O.mezcla[j], x: O.mezcla[j] * tot })),
      notas: [T('Respuesta estimada: {v} (EE {e}; IC {c} %: {i} a {s}). La mejor mezcla del modelo en todo el simplex (en cada cara, el punto estacionario con Σx = 1, y los vértices).', { v: sig(O.prediccion), e: sig(O.ee), c, i: sig(O.ic_inf), s: sig(O.ic_sup) })] });
    cuadros.push({ id: 'ajuste', titulo: T('Ajuste'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')],
      filas: [{ medida: T('Mezclas'), valor: A.n, _dec: 0 }, { medida: T('gl del error'), valor: A.gl, _dec: 0 }, { medida: T('Error estándar residual (σ)'), valor: A.sigma, _dec: 4 }, { medida: 'R²', valor: A.r2, _dec: 4 }, { medida: T('R² ajustada'), valor: A.r2_ajustada, _dec: 4 }] });
    const grandes = r.residuos.filter(v => Math.abs(v / A.sigma) > 3).length;
    return { titulo: T('Mezclas: modelo {m} de Scheffé', { m: MODELOS_MEZCLA[r.modelo] }), conclusiones: conclusiones.map(may), cuadros,
      semaforo: [{ nombre: T('Falta de ajuste'), color: !fa ? 'gris' : fa.p >= a ? 'verde' : 'ambar', texto: !fa ? (r.gl_error_puro > 0 ? T('El modelo tiene tantos coeficientes como mezclas distintas ({g}): no queda con qué probarla.', { g: r.distintas }) : T('Sin mezclas repetidas no se puede probar.')) : fa.p >= a ? T('El modelo describe bien la respuesta (p {p}).', { p: fp(fa.p) }) : T('Hay falta de ajuste (p {p}).', { p: fp(fa.p) }) },
        { nombre: T('Observaciones atípicas'), color: grandes ? 'ambar' : 'verde', texto: grandes ? T('{k} residuos pasan de 3σ.', { k: grandes }) : T('Ningún residuo pasa de 3σ.') }] };
  }
  function codigoRMezclas(e, op) {
    const C = e.componentes || [], q = C.length, x = C.map((_, j) => 'x' + (j + 1));
    const pares = [], ternas = [];
    for (let i = 0; i < q; i++) for (let j = i + 1; j < q; j++) { pares.push(`${x[i]}:${x[j]}`); for (let k = j + 1; k < q; k++) ternas.push(`${x[i]}:${x[j]}:${x[k]}`); }
    const terms = x.concat(op.modelo !== 'lineal' ? pares : [], op.modelo === 'cubico-especial' ? ternas : []), v = 'c(' + x.map(s => JSON.stringify(s)).join(', ') + ')';
    return ['# Mezclas: modelo de Scheffé (código R equivalente a SigmaPro; solo R base)',
      `d <- na.omit(data.frame(y = datos[[${JSON.stringify(e.respuesta)}]], ${C.map((c, j) => `${x[j]} = datos[[${JSON.stringify(c)}]]`).join(', ')}))`,
      `d[${v}] <- d[${v}] / rowSums(d[${v}])   # proporciones`,
      `m <- lm(y ~ 0 + ${terms.join(' + ')}, data = d)`, 'summary(m)$coefficients',
      'sct <- sum((d$y - mean(d$y))^2); scr <- deviance(m); c(R2 = 1 - scr / sct, F = ((sct - scr) / (length(coef(m)) - 1)) / (scr / df.residual(m)))   # contra la media',
      `anova(m, lm(y ~ factor(paste(${x.join(', ')})), data = d))   # falta de ajuste contra el error puro`].join('\n');
  }

  /* ======================= deseabilidad ======================= */
  function validarDeseabilidad(t, e, op) {
    exigir(Array.isArray(e.respuestas) && e.respuestas.length >= 1 && e.respuestas.length <= 6, T('Elige de 1 a 6 respuestas.'));
    exigir(Array.isArray(e.factores) && e.factores.length >= 2 && e.factores.length <= 6, T('Elige de 2 a 6 factores numéricos.'));
    for (const c of e.respuestas.concat(e.factores)) exigir(t.columnas[c] && t.col(c).tipo === 'numerica', T('Las respuestas y los factores deben ser columnas numéricas.'));
    const todas = e.respuestas.concat(e.factores);
    exigir(new Set(todas).size === todas.length, T('Cada columna va en un solo papel.'));
    const m = e.respuestas.length, arr = v => Array.isArray(v) && v.length === m;
    exigir(arr(op.metas) && op.metas.every(v => ['max', 'min', 'valor'].includes(v)), T('Indica, para cada respuesta, si se busca la mayor, la menor o un valor.'));
    exigir(arr(op.inferiores) && arr(op.superiores) && op.inferiores.every((v, i) => +op.superiores[i] > +v), T('Para cada respuesta el límite superior debe ser mayor que el inferior.'));
    op.metas.forEach((mt, i) => { if (mt === 'valor') exigir(arr(op.objetivos) && +op.objetivos[i] > +op.inferiores[i] && +op.objetivos[i] < +op.superiores[i], T('El valor meta de «{r}» debe quedar entre sus límites.', { r: e.respuestas[i] })); });
    exigir(['cubo', 'esfera'].includes(op.region), T('La región es el cubo o la esfera del diseño.'));
  }
  function calcularDeseabilidad(t, e, op) {
    const cols = e.respuestas.concat(e.factores).map(c => t.col(c).valores), filas = [];
    for (let i = 0; i < t.n; i++) if (cols.every(v => v[i] === v[i])) filas.push(i);
    const toma = c => filas.map(i => t.col(c).valores[i]), m = e.respuestas.length, g = (a, i, d) => (Array.isArray(a) && a[i] !== undefined && a[i] !== '' ? +a[i] : d);
    const respuestas = e.respuestas.map((nm, i) => ({ nombre: nm, y: toma(nm), meta: op.metas[i], L: +op.inferiores[i], U: +op.superiores[i], T: g(op.objetivos, i, NaN),
      s: g(op.exponentes, i, 1), t: g(op.exponentes2, i, 1), r: g(op.importancias, i, 1) }));
    const r = S().deseabilidad({ x: e.factores.map(toma), nombres: e.factores, respuestas, region: op.region });
    return Object.assign(r, { tipo: 'deseabilidad', metodo: 'deseabilidad', respuestas: e.respuestas.slice(), factores: e.factores.slice(), metas: op.metas.slice(),
      limites: respuestas.map(c => ({ L: c.L, U: c.U, T: c.T, s: c.s, t: c.t, r: c.r })), n: filas.length, excluidas: t.n - filas.length, m });
  }
  const META = { max: T('la mayor'), min: T('la menor'), valor: T('un valor meta') };
  function reporteDeseabilidad(r) {
    const O = r.optimo, F = r.factores, Rs = r.respuestas, conclusiones = [], cuadros = [];
    conclusiones.push(O.D > 0 ? T('La mejor combinación ({x}) da una deseabilidad global D = {D}.', { x: F.map((f, j) => f + ' = ' + sig(O.natural[j])).join(', '), D: O.D.toFixed(3) })
      : T('Ninguna combinación de la región deja todas las respuestas dentro de sus límites (D = 0): afloja algún límite.'));
    Rs.forEach((nm, i) => conclusiones.push(T('«{y}» ({m}): {v} estimada, d = {d}.', { y: nm, m: META[r.metas[i]], v: sig(O.prediccion[i]), d: O.d[i].toFixed(3) })));
    const malos = r.modelos.filter(m => m.r2 < 0.7).length;
    if (malos) conclusiones.push(T('Aviso: {k} {r} con R² menor que 0.7: su predicción, y por eso la deseabilidad, es poco confiable.', { k: malos, r: malos === 1 ? T('respuesta tiene un modelo') : T('respuestas tienen modelos') }));
    cuadros.push({ id: 'optimo', titulo: T('La combinación más deseable'), columnas: [col('f', T('Factor'), 'texto'), col('z', T('Codificado'), 'forma'), col('x', T('Original'), 'sig')],
      filas: F.map((f, j) => ({ f, z: O.codificado[j], x: O.natural[j] })),
      notas: [T('Región: {r}. Búsqueda de Nelder-Mead desde cada punto del diseño y el centro.', { r: r.region === 'esfera' ? T('la esfera de radio {d} (unidades codificadas)', { d: f2(r.radio) }) : T('el cubo de los niveles codificados de los datos') })] });
    cuadros.push({ id: 'respuestas', titulo: T('Respuestas en ese punto'), columnas: [col('y', T('Respuesta'), 'texto'), col('m', T('Meta'), 'texto'), col('L', T('Inferior'), 'sig'), col('T', T('Valor meta'), 'sig'),
      col('U', T('Superior'), 'sig'), col('p', T('Predicción'), 'sig'), col('d', 'd', 'forma'), col('r2', T('R² del modelo'), 'forma')],
      filas: Rs.map((nm, i) => ({ y: nm, m: META[r.metas[i]], L: r.limites[i].L, T: r.metas[i] === 'valor' ? r.limites[i].T : NaN, U: r.limites[i].U, p: O.prediccion[i], d: O.d[i], r2: r.modelos[i].r2 })),
      notas: [T('d = 0 fuera de los límites y 1 en la meta; D = media geométrica de las d (con sus importancias). Derringer y Suich (1980).')] });
    cuadros.push({ id: 'puntos', titulo: T('Deseabilidad de cada corrida'), columnas: [col('i', T('Corrida'), 'entero'), col('D', 'D', 'forma')],
      filas: r.puntos.D.map((D, i) => ({ i: i + 1, D })) });
    return { titulo: T('Deseabilidad de {m} respuestas', { m: Rs.length }), conclusiones: conclusiones.map(may), cuadros, semaforo: [] };
  }
  function codigoRDeseabilidad(e, op, ctx) {
    const F = e.factores || [], R = e.respuestas || [], res = ctx && ctx.resultado, k = F.length, num = v => +(+v).toPrecision(12);
    const cen = res ? res.codificacion.centro : F.map(() => 0), pas = res ? res.codificacion.paso : F.map(() => 1), z = F.map((_, j) => 'z' + (j + 1));
    const pares = []; for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) pares.push(`I(${z[i]} * ${z[j]})`);
    const formula = z.concat(pares, z.map(v => `I(${v}^2)`)).join(' + '), g = (a, i, d) => (Array.isArray(a) && a[i] !== undefined && a[i] !== '' ? +a[i] : d);
    const dR = (i) => { const L = g(op.inferiores, i, 0), U = g(op.superiores, i, 1), s = g(op.exponentes, i, 1), t = g(op.exponentes2, i, 1), Tg = g(op.objetivos, i, 0);
      return (op.metas || [])[i] === 'min' ? `function(y) if (y >= ${U}) 0 else if (y <= ${L}) 1 else ((${U} - y) / (${U - L}))^${s}`
        : (op.metas || [])[i] === 'valor' ? `function(y) if (y < ${L} || y > ${U}) 0 else if (y <= ${Tg}) ((y - ${L}) / (${Tg - L}))^${s} else ((${U} - y) / (${U - Tg}))^${t}`
          : `function(y) if (y <= ${L}) 0 else if (y >= ${U}) 1 else ((y - ${L}) / (${U - L}))^${s}`; };
    return ['# Deseabilidad de Derringer y Suich (código R equivalente a SigmaPro; solo R base)',
      `d <- na.omit(datos[c(${R.concat(F).map(c => JSON.stringify(c)).join(', ')})])`,
      `Z <- data.frame(${F.map((f, j) => `${z[j]} = (d[[${JSON.stringify(f)}]] - ${num(cen[j])}) / ${num(pas[j])}`).join(', ')})   # codificación de SigmaPro`,
      `mods <- lapply(c(${R.map(c => JSON.stringify(c)).join(', ')}), function(y) lm(d[[y]] ~ ${formula}, data = Z))   # segundo orden por respuesta`,
      `dfun <- list(${R.map((_, i) => dR(i)).join(',\n  ')})`,
      `imp <- c(${R.map((_, i) => g(op.importancias, i, 1)).join(', ')})`,
      'D <- function(z) { nd <- as.data.frame(as.list(setNames(z, names(Z)))); yp <- sapply(mods, predict, newdata = nd)',
      '  ds <- mapply(function(f, y) f(y), dfun, yp); if (any(ds <= 0)) 0 else exp(sum(imp * log(ds)) / sum(imp)) }',
      op.region === 'esfera' ? 'radio <- max(sqrt(rowSums(Z^2))); llevar <- function(z) { r <- sqrt(sum(z^2)); if (r > radio) z * radio / r else z }   # la esfera del diseño'
        : 'lo <- sapply(Z, min); hi <- sapply(Z, max); llevar <- function(z) pmin(hi, pmax(lo, z))   # el cubo de los niveles',
      'o <- lapply(c(lapply(seq_len(nrow(Z)), function(r) unlist(Z[r, ])), list(rep(0, ncol(Z)))), function(z0) optim(z0, function(z) -D(llevar(z)), control = list(reltol = 1e-15, maxit = 20000)))',
      'mejor <- o[[which.min(sapply(o, function(x) x$value))]]; z <- llevar(mejor$par)',
      `c(z, D = D(z), natural = c(${cen.map(num).join(', ')}) + c(${pas.map(num).join(', ')}) * z)`].join('\n');
  }

  const OPC = { orden: { tipo: 'texto', omision: 'segundo' }, objetivo: { tipo: 'texto', omision: 'maximo' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 },
    codificacion: { tipo: 'texto', omision: 'auto' }, bajos: { tipo: 'lista', omision: [] }, altos: { tipo: 'lista', omision: [] } };
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
    opciones: { objetivo: OPC.objetivo, nivel: OPC.nivel, alfa: OPC.alfa, codificacion: OPC.codificacion, bajos: OPC.bajos, altos: OPC.altos },
    validar: validar('ascenso-pronunciado'), calcular: calcular('ascenso-pronunciado'), reporte, codigoR: codigoR('ascenso-pronunciado'),
  });
  SP.metodo({
    id: 'diseno-superficie', familia: 'superficies', motor: 'js', sinDatos: true, orden: 5, nombre: T('Generar un diseño de superficie o de mezclas'),
    resumen: T('Central compuesto, Box-Behnken, factorial con centros, simplex-látice o simplex-centroide: las corridas codificadas y en unidades originales, en orden al azar, para abrir en Datos.'),
    entradas: {}, opciones: { tipo: { tipo: 'texto', omision: 'ccd' }, k: { tipo: 'numero', omision: 2 }, alfa: { tipo: 'texto', omision: 'rotable' }, centros: { tipo: 'numero', omision: '' }, grado: { tipo: 'numero', omision: 2 },
      nombres: { tipo: 'texto', omision: '' }, bajos: { tipo: 'texto', omision: '' }, altos: { tipo: 'texto', omision: '' }, total: { tipo: 'numero', omision: 1 }, semilla: { tipo: 'numero', omision: '' } },
    validar: validarDiseno, calcular: calcularDiseno, reporte: reporteDiseno, codigoR: codigoRDiseno,
  });
  SP.metodo({
    id: 'mezclas', familia: 'superficies', motor: 'js', orden: 30, nombre: T('Mezclas (modelos de Scheffé)'),
    resumen: T('Proporciones de componentes que suman lo mismo (sustratos, raciones, formulaciones): modelos lineal, cuadrático o cúbico especial y la mejor mezcla.'),
    entradas: { respuesta: { tipo: 'numerica' }, componentes: { tipo: 'numerica+', maximo: 6 } }, opciones: { modelo: { tipo: 'texto', omision: 'cuadratico' }, objetivo: OPC.objetivo, nivel: OPC.nivel, alfa: OPC.alfa },
    validar: validarMezclas, calcular: calcularMezclas, reporte: reporteMezclas, codigoR: codigoRMezclas,
  });
  SP.metodo({
    id: 'deseabilidad', familia: 'superficies', motor: 'js', orden: 40, nombre: T('Deseabilidad de varias respuestas'),
    resumen: T('Varias respuestas a la vez (rendimiento alto, costo bajo, calidad en un valor): la combinación de factores más deseable (Derringer y Suich).'),
    entradas: { respuestas: { tipo: 'numerica+', maximo: 6 }, factores: { tipo: 'numerica+', maximo: 6 } },
    opciones: { metas: { tipo: 'lista', omision: [] }, inferiores: { tipo: 'lista', omision: [] }, superiores: { tipo: 'lista', omision: [] }, objetivos: { tipo: 'lista', omision: [] },
      exponentes: { tipo: 'lista', omision: [] }, exponentes2: { tipo: 'lista', omision: [] }, importancias: { tipo: 'lista', omision: [] }, region: { tipo: 'texto', omision: 'cubo' } },
    validar: validarDeseabilidad, calcular: calcularDeseabilidad, reporte: reporteDeseabilidad, codigoR: codigoRDeseabilidad,
  });
});

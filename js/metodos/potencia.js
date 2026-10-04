/* SigmaPro — tamaño de muestra y potencia (familia Tamaño de muestra, potencia y muestreo), en el núcleo JS.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cinco métodos que no necesitan datos (todo va en las opciones), con el mismo cálculo que R (SP.potencia):
   - potencia-medias: comparar dos medias (o una contra un valor, o pareadas), como power.t.test;
   - potencia-anova: k tratamientos con un ANOVA de una vía, como power.anova.test;
   - potencia-proporciones: dos proporciones, como power.prop.test;
   - potencia-correlacion: una correlación, como pwr.r.test;
   - repeticiones: cuántas repeticiones necesita un experimento para detectar una diferencia (en % de la media) con
     el CV esperado (Cochran y Cox 1957).
   Cada uno calcula lo que falta: la potencia, el tamaño de muestra o el efecto que se puede detectar. */
SP.definir('metodos-potencia', function (SP) {
  'use strict';
  const T = SP.T;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const sig = x => SP.formatos.texto(x, 'sig');
  const pct = x => (100 * x).toFixed(1) + ' %';
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const P = () => SP.potencia;
  const num = (v, nombre, cond, msg) => { exigir(Number.isFinite(+v) && (!cond || cond(+v)), msg || T('Revisa el valor de «{n}».', { n: nombre })); return +v; };
  const prob = (v, nombre) => num(v, nombre, x => x > 0 && x < 1, T('«{n}» va entre 0 y 1.', { n: nombre }));
  const CALCULO = { potencia: T('la potencia'), n: T('el tamaño de muestra'), diferencia: T('la diferencia detectable'), varEntre: T('la variación entre medias detectable'), r: T('la correlación detectable') };

  function validarComun(op, opcionesCalc) {
    exigir(opcionesCalc.includes(op.calcular), T('Elige qué calcular.'));
    prob(op.alfa, T('nivel de significancia'));
    if (op.calcular !== 'potencia') prob(op.potencia, T('potencia'));
    if (op.calcular !== 'n') num(op.n, 'n', x => x >= 2, T('El tamaño de muestra debe ser al menos 2.'));
  }
  const filasDe = pares => pares.map(([m, v, nota]) => ({ medida: m, valor: v, nota: nota || '' }));
  const cuadroPar = (titulo, pares, notas) => ({ id: 'parametros', titulo, columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'sigEnt'), col('nota', '', 'texto')],
    filas: filasDe(pares), notas });
  const cuadroCurva = (r, unidad) => ({ id: 'curva', titulo: T('Potencia según el tamaño de muestra'), columnas: [col('n', unidad, 'entero'), col('p', T('Potencia'), 'forma')],
    filas: r.curva.n.map((n, i) => ({ n, p: r.curva.potencia[i] })).filter((_, i) => i % Math.max(1, Math.round(r.curva.n.length / 15)) === 0) });
  const nEntero = n => Math.ceil(n - 1e-9);
  const fmtN = x => (Number.isInteger(x) ? String(x) : sig(x));

  /* ======================= medias ======================= */
  const TIPOS_T = { dos: T('dos muestras independientes'), una: T('una muestra contra un valor'), pareada: T('muestras pareadas') };
  function calcularT(tabla, e, op) {
    const r = P().potenciaT({ n: +op.n, diferencia: +op.diferencia, de: +op.de, alfa: +op.alfa, potencia: +op.potencia, tipo: op.tipo, alternativa: op.alternativa, calcular: op.calcular });
    return Object.assign(r, { tipo: 'potencia', metodo: 'potencia-medias', calcular: op.calcular, tipoT: op.tipo, alternativa: op.alternativa });
  }
  function reporteT(r) {
    const n = nEntero(r.n), unidad = r.tipoT === 'dos' ? T('unidades por grupo') : r.tipoT === 'pareada' ? T('pares') : T('observaciones');
    const c = [];
    if (r.calcular === 'n') c.push(T('Hacen falta {n} {u} para detectar una diferencia de {d} (DE = {s}) con potencia de {p} y α = {a} (n exacta: {x}).', { n, u: unidad, d: sig(r.diferencia), s: sig(r.de), p: pct(r.potencia), a: r.alfa, x: sig(r.n) }));
    else if (r.calcular === 'potencia') c.push(T('Con {n} {u}, la potencia para detectar una diferencia de {d} (DE = {s}) es {p} (α = {a}).', { n: fmtN(r.n), u: unidad, d: sig(r.diferencia), s: sig(r.de), p: pct(r.potencia), a: r.alfa }));
    else c.push(T('Con {n} {u} se detecta, con potencia de {p}, una diferencia de {d} ({e} desviaciones estándar).', { n: fmtN(r.n), u: unidad, p: pct(r.potencia), d: sig(r.diferencia), e: sig(r.diferencia / r.de) }));
    if (r.potencia < 0.8 && r.calcular === 'potencia') c.push(T('Una potencia menor que 80 % deja una probabilidad alta de no ver una diferencia que sí existe.'));
    return { titulo: T('Tamaño de muestra y potencia: prueba t ({t})', { t: TIPOS_T[r.tipoT] }), conclusiones: c,
      cuadros: [cuadroPar(T('Parámetros'), [[T('Tamaño de muestra ({u})', { u: unidad }), r.n], [T('Diferencia'), r.diferencia], [T('Desviación estándar'), r.de], [T('d de Cohen'), r.diferencia / r.de],
        [T('Nivel de significancia'), r.alfa], [T('Potencia'), r.potencia]], [T('Prueba t {a} ({t}); t no central, como power.t.test.', { a: r.alternativa === 'unilateral' ? T('unilateral') : T('bilateral'), t: TIPOS_T[r.tipoT] }), T('Se calculó {c}.', { c: CALCULO[r.calcular] })]),
      cuadroCurva(r, T('n ({u})', { u: unidad }))], semaforo: [] };
  }
  function codigoT(e, op) {
    const arg = { n: op.calcular === 'n' ? 'NULL' : op.n, delta: op.calcular === 'diferencia' ? 'NULL' : op.diferencia, power: op.calcular === 'potencia' ? 'NULL' : op.potencia };
    return `# Potencia de la prueba t (código R equivalente a SigmaPro)\nres <- power.t.test(n = ${arg.n}, delta = ${arg.delta}, sd = ${op.de}, sig.level = ${op.alfa}, power = ${arg.power},\n  type = "${{ dos: 'two.sample', una: 'one.sample', pareada: 'paired' }[op.tipo]}", alternative = "${op.alternativa === 'unilateral' ? 'one.sided' : 'two.sided'}")
res`;
  }

  /* ======================= ANOVA ======================= */
  function mediasDe(op) { const m = String(op.medias || '').split(/[;,\s]+/).filter(Boolean).map(Number); return m.length >= 2 && m.every(Number.isFinite) ? m : null; }
  function calcularAnova(tabla, e, op) {
    const m = mediasDe(op);
    let varEntre = +op.varEntre;
    if (m) { const mu = m.reduce((a, b) => a + b, 0) / m.length; varEntre = m.reduce((s, v) => s + (v - mu) ** 2, 0) / (m.length - 1); }
    const grupos = m ? m.length : +op.grupos;
    const r = P().potenciaAnova({ grupos, n: +op.n, varEntre, varDentro: (+op.de) ** 2, alfa: +op.alfa, potencia: +op.potencia, calcular: op.calcular });
    return Object.assign(r, { tipo: 'potencia', metodo: 'potencia-anova', calcular: op.calcular, medias: m, de: +op.de });
  }
  function reporteAnova(r) {
    const n = nEntero(r.n), c = [];
    if (r.calcular === 'n') c.push(T('Hacen falta {n} repeticiones por tratamiento ({k} tratamientos) para que el ANOVA detecte esas diferencias con potencia de {p} (n exacta: {x}).', { n, k: r.grupos, p: pct(r.potencia), x: sig(r.n) }));
    else if (r.calcular === 'potencia') c.push(T('Con {n} repeticiones por tratamiento ({k} tratamientos), la potencia del ANOVA es {p}.', { n: fmtN(r.n), k: r.grupos, p: pct(r.potencia) }));
    else c.push(T('Con {n} repeticiones se detecta, con potencia de {p}, una varianza entre medias de {v} (f de Cohen = {f}).', { n: fmtN(r.n), p: pct(r.potencia), v: sig(r.varEntre), f: sig(r.f) }));
    return { titulo: T('Tamaño de muestra y potencia: ANOVA de {k} tratamientos', { k: r.grupos }), conclusiones: c,
      cuadros: [cuadroPar(T('Parámetros'), [[T('Tratamientos'), r.grupos], [T('Repeticiones por tratamiento'), r.n], [T('Varianza de las medias'), r.varEntre], [T('Desviación estándar del error'), r.de],
        [T('f de Cohen'), r.f], [T('Nivel de significancia'), r.alfa], [T('Potencia'), r.potencia]], [T('F no central, como power.anova.test.'), r.medias ? T('Medias esperadas: {m}.', { m: r.medias.join(', ') }) : '', T('Se calculó {c}.', { c: CALCULO[r.calcular] })].filter(Boolean)),
      cuadroCurva(r, T('Repeticiones'))], semaforo: [] };
  }
  function codigoAnova(e, op) {
    const m = mediasDe(op), vb = m ? `var(c(${m.join(', ')}))` : (op.calcular === 'varEntre' ? 'NULL' : op.varEntre);
    return `# Potencia del ANOVA de una vía (código R equivalente a SigmaPro)\nres <- power.anova.test(groups = ${m ? m.length : op.grupos}, n = ${op.calcular === 'n' ? 'NULL' : op.n}, between.var = ${vb},\n  within.var = ${op.de}^2, sig.level = ${op.alfa}, power = ${op.calcular === 'potencia' ? 'NULL' : op.potencia})
res`;
  }

  /* ======================= proporciones ======================= */
  function calcularProp(tabla, e, op) {
    const r = P().potenciaProp({ n: +op.n, p1: +op.p1, p2: +op.p2, alfa: +op.alfa, potencia: +op.potencia, alternativa: op.alternativa, calcular: op.calcular });
    return Object.assign(r, { tipo: 'potencia', metodo: 'potencia-proporciones', calcular: op.calcular, alternativa: op.alternativa });
  }
  function reporteProp(r) {
    const c = [r.calcular === 'n'
      ? T('Hacen falta {n} unidades por grupo para distinguir {a} de {b} con potencia de {p} (n exacta: {x}).', { n: nEntero(r.n), a: pct(r.p1), b: pct(r.p2), p: pct(r.potencia), x: sig(r.n) })
      : T('Con {n} unidades por grupo, la potencia para distinguir {a} de {b} es {p}.', { n: fmtN(r.n), a: pct(r.p1), b: pct(r.p2), p: pct(r.potencia) })];
    return { titulo: T('Tamaño de muestra y potencia: dos proporciones'), conclusiones: c,
      cuadros: [cuadroPar(T('Parámetros'), [[T('Tamaño de muestra por grupo'), r.n], [T('Proporción 1'), r.p1], [T('Proporción 2'), r.p2], [T('h de Cohen'), r.h], [T('Nivel de significancia'), r.alfa], [T('Potencia'), r.potencia]],
        [T('Aproximación normal, como power.prop.test.'), T('Se calculó {c}.', { c: CALCULO[r.calcular] })]), cuadroCurva(r, T('n por grupo'))], semaforo: [] };
  }
  const codigoProp = (e, op) => `# Potencia para dos proporciones (código R equivalente a SigmaPro)\nres <- power.prop.test(n = ${op.calcular === 'n' ? 'NULL' : op.n}, p1 = ${op.p1}, p2 = ${op.p2}, sig.level = ${op.alfa},\n  power = ${op.calcular === 'potencia' ? 'NULL' : op.potencia}, alternative = "${op.alternativa === 'unilateral' ? 'one.sided' : 'two.sided'}")
res`;

  /* ======================= correlación ======================= */
  function calcularR(tabla, e, op) {
    const r = P().potenciaR({ n: +op.n, r: +op.r, alfa: +op.alfa, potencia: +op.potencia, alternativa: op.alternativa, calcular: op.calcular });
    return Object.assign(r, { tipo: 'potencia', metodo: 'potencia-correlacion', calcular: op.calcular, alternativa: op.alternativa });
  }
  function reporteR(r) {
    const c = [r.calcular === 'n' ? T('Hacen falta {n} pares de observaciones para detectar una correlación de {r} con potencia de {p} (n exacta: {x}).', { n: nEntero(r.n), r: sig(r.r), p: pct(r.potencia), x: sig(r.n) })
      : r.calcular === 'potencia' ? T('Con {n} pares, la potencia para detectar una correlación de {r} es {p}.', { n: fmtN(r.n), r: sig(r.r), p: pct(r.potencia) })
        : T('Con {n} pares se detecta, con potencia de {p}, una correlación de {r}.', { n: fmtN(r.n), p: pct(r.potencia), r: sig(r.r) })];
    return { titulo: T('Tamaño de muestra y potencia: correlación'), conclusiones: c,
      cuadros: [cuadroPar(T('Parámetros'), [[T('Pares de observaciones'), r.n], [T('Correlación'), r.r], [T('Nivel de significancia'), r.alfa], [T('Potencia'), r.potencia]],
        [T('Transformación z de Fisher, como pwr.r.test (paquete pwr).'), T('Se calculó {c}.', { c: CALCULO[r.calcular] })]), cuadroCurva(r, T('Pares'))], semaforo: [] };
  }
  const codigoR = (e, op) => `# Potencia para una correlación (código R equivalente a SigmaPro)\nlibrary(pwr)\nres <- pwr.r.test(n = ${op.calcular === 'n' ? 'NULL' : op.n}, r = ${op.calcular === 'r' ? 'NULL' : op.r}, sig.level = ${op.alfa},\n  power = ${op.calcular === 'potencia' ? 'NULL' : op.potencia}, alternative = "${op.alternativa === 'unilateral' ? 'greater' : 'two.sided'}")
res`;

  /* ======================= repeticiones ======================= */
  const DISENOS = { dca: T('completamente al azar'), dbca: T('bloques completos al azar') };
  function calcularRep(tabla, e, op) {
    const r = P().repeticiones({ cv: +op.cv, diferencia: +op.diferencia, tratamientos: +op.tratamientos, alfa: +op.alfa, potencia: +op.potencia, diseno: op.diseno });
    return Object.assign(r, { tipo: 'potencia', metodo: 'repeticiones', cv: +op.cv, diferencia: +op.diferencia, tratamientos: +op.tratamientos, alfa: +op.alfa, potencia: +op.potencia, diseno: op.diseno });
  }
  function reporteRep(r) {
    return { titulo: T('Número de repeticiones de un experimento'),
      conclusiones: [T('Con un CV de {cv} % y {k} tratamientos en {d}, hacen falta {r} repeticiones para detectar una diferencia de {dif} % de la media con potencia de {p} (α = {a}).',
        { cv: sig(r.cv), k: r.tratamientos, d: DISENOS[r.diseno], r: r.repeticiones, dif: sig(r.diferencia), p: pct(r.potencia), a: r.alfa })],
      cuadros: [{ id: 'iteraciones', titulo: T('Búsqueda de las repeticiones'), columnas: [col('r', T('Repeticiones'), 'entero'), col('gl', T('gl del error'), 'entero'), col('t1', 't₁', 'forma'), col('t2', 't₂', 'forma'), col('req', T('Requeridas'), 'forma2')],
        filas: r.iteraciones.map(x => ({ r: x.r, gl: x.gl, t1: x.t1, t2: x.t2, req: x.requeridas })),
        notas: [T('r ≥ 2·(t₁ + t₂)²·(CV/d)², con t₁ = t(1 − α/2) y t₂ = t(potencia) en los gl del error, que dependen de r (Cochran y Cox, 1957).')] }], semaforo: [] };
  }
  const codigoRep = (e, op) => [`# Repeticiones de un experimento (Cochran y Cox, 1957; código R equivalente a SigmaPro)`,
    `cv <- ${op.cv}; d <- ${op.diferencia}; k <- ${op.tratamientos}; alfa <- ${op.alfa}; potencia <- ${op.potencia}`,
    `gl <- function(r) ${op.diseno === 'dca' ? 'k * (r - 1)' : '(k - 1) * (r - 1)'}`,
    'for (r in 2:1000) { t1 <- qt(1 - alfa / 2, gl(r)); t2 <- qt(potencia, gl(r)); req <- 2 * (t1 + t2)^2 * (cv / d)^2; if (r >= req) break }',
    'c(repeticiones = r, requeridas = req)'].join('\n');

  /* ======================= registro ======================= */
  const NADA = {};
  const base = { alfa: { tipo: 'numero', omision: 0.05 }, potencia: { tipo: 'numero', omision: 0.8 } };
  SP.metodosPotencia = { CALCULO, TIPOS_T, DISENOS };
  SP.metodo({ id: 'potencia-medias', familia: 'potencia', motor: 'js', sinDatos: true, orden: 10, nombre: T('Potencia y tamaño de muestra: medias (prueba t)'),
    resumen: T('Cuántas unidades hacen falta para detectar una diferencia entre dos medias, o qué potencia tiene un ensayo.'),
    entradas: NADA, opciones: Object.assign({ calcular: { tipo: 'texto', omision: 'n' }, n: { tipo: 'numero', omision: 10 }, diferencia: { tipo: 'numero', omision: 1 }, de: { tipo: 'numero', omision: 1 },
      tipo: { tipo: 'texto', omision: 'dos' }, alternativa: { tipo: 'texto', omision: 'bilateral' } }, base),
    validar: (t, e, op) => { validarComun(op, ['potencia', 'n', 'diferencia']); num(op.de, T('desviación estándar'), x => x > 0); if (op.calcular !== 'diferencia') num(op.diferencia, T('diferencia'), x => x !== 0); exigir(['dos', 'una', 'pareada'].includes(op.tipo), T('Tipo de prueba no válido.')); },
    calcular: calcularT, reporte: reporteT, codigoR: codigoT });
  SP.metodo({ id: 'potencia-anova', familia: 'potencia', motor: 'js', sinDatos: true, orden: 20, nombre: T('Potencia y repeticiones: ANOVA de varios tratamientos'),
    resumen: T('Repeticiones por tratamiento para que el ANOVA detecte las diferencias esperadas entre medias.'),
    entradas: NADA, opciones: Object.assign({ calcular: { tipo: 'texto', omision: 'n' }, grupos: { tipo: 'numero', omision: 4 }, medias: { tipo: 'texto', omision: '' }, varEntre: { tipo: 'numero', omision: 1 },
      de: { tipo: 'numero', omision: 1 }, n: { tipo: 'numero', omision: 5 } }, base),
    validar: (t, e, op) => { validarComun(op, ['potencia', 'n', 'varEntre']); num(op.de, T('desviación estándar'), x => x > 0); if (!mediasDe(op)) { num(op.grupos, T('tratamientos'), x => x >= 2 && Number.isInteger(x)); if (op.calcular !== 'varEntre') num(op.varEntre, T('varianza de las medias'), x => x > 0); } },
    calcular: calcularAnova, reporte: reporteAnova, codigoR: codigoAnova });
  SP.metodo({ id: 'potencia-proporciones', familia: 'potencia', motor: 'js', sinDatos: true, orden: 30, nombre: T('Potencia y tamaño de muestra: dos proporciones'),
    resumen: T('Germinación, sobrevivencia o incidencia: cuántas unidades por grupo para distinguir dos porcentajes.'),
    entradas: NADA, opciones: Object.assign({ calcular: { tipo: 'texto', omision: 'n' }, n: { tipo: 'numero', omision: 50 }, p1: { tipo: 'numero', omision: 0.5 }, p2: { tipo: 'numero', omision: 0.7 },
      alternativa: { tipo: 'texto', omision: 'bilateral' } }, base),
    validar: (t, e, op) => { validarComun(op, ['potencia', 'n']); prob(op.p1, 'p1'); prob(op.p2, 'p2'); exigir(+op.p1 !== +op.p2, T('Las dos proporciones deben ser distintas.')); },
    calcular: calcularProp, reporte: reporteProp, codigoR: codigoProp });
  SP.metodo({ id: 'potencia-correlacion', familia: 'potencia', motor: 'js', sinDatos: true, orden: 40, nombre: T('Potencia y tamaño de muestra: correlación'),
    resumen: T('Cuántos pares de observaciones hacen falta para detectar una correlación.'),
    entradas: NADA, opciones: Object.assign({ calcular: { tipo: 'texto', omision: 'n' }, n: { tipo: 'numero', omision: 30 }, r: { tipo: 'numero', omision: 0.3 }, alternativa: { tipo: 'texto', omision: 'bilateral' } }, base),
    validar: (t, e, op) => { validarComun(op, ['potencia', 'n', 'r']); if (op.calcular !== 'n') num(op.n, 'n', x => x > 4, T('Hacen falta más de 4 pares.')); if (op.calcular !== 'r') num(op.r, 'r', x => x > -1 && x < 1 && x !== 0, T('La correlación va entre −1 y 1 (sin el 0).')); },
    calcular: calcularR, reporte: reporteR, codigoR });
  SP.metodo({ id: 'repeticiones', familia: 'potencia', motor: 'js', sinDatos: true, orden: 50, nombre: T('Número de repeticiones de un experimento'),
    resumen: T('Con el CV esperado y la diferencia que interesa (en % de la media), cuántas repeticiones poner.'),
    entradas: NADA, opciones: Object.assign({ cv: { tipo: 'numero', omision: 12 }, diferencia: { tipo: 'numero', omision: 20 }, tratamientos: { tipo: 'numero', omision: 5 }, diseno: { tipo: 'texto', omision: 'dbca' } }, base),
    validar: (t, e, op) => { prob(op.alfa, T('nivel de significancia')); prob(op.potencia, T('potencia')); num(op.cv, 'CV', x => x > 0); num(op.diferencia, T('diferencia'), x => x > 0); num(op.tratamientos, T('tratamientos'), x => x >= 2 && Number.isInteger(x)); exigir(['dca', 'dbca'].includes(op.diseno), T('Diseño no válido.')); },
    calcular: calcularRep, reporte: reporteRep, codigoR: codigoRep });
});

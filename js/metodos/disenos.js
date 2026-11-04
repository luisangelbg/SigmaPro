/* SigmaPro — análisis de varianza de los diseños experimentales.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un motor (SP.disenos.analizar) y un método por diseño:
     dca                   completamente al azar, con 1 a 3 factores cruzados              y ~ A*B*C
     dbca                  bloques completos al azar; generalizado si hay repeticiones      y ~ bloque + A*B*C
                           por bloque (y ~ bloque * (A*B*C)); parcelas perdidas con SC tipo III o II
     cuadro-latino         filas y columnas como bloques                                    y ~ fila + columna + A*B
     parcelas-divididas    A en parcelas grandes y B en subparcelas, con las parcelas grandes en bloques,
                           al azar o en cuadro latino: estratos de error como aov(… + Error(bloque/A))
     parcelas-subdivididas tres estratos: Error(bloque/A/B)
     franjas               A y B en franjas cruzadas: Error(bloque/(A + B))
     bib                   bloques incompletos balanceados, análisis intrabloque (tratamientos ajustados)
     latice                látice y alfa-látice, análisis intrabloque: y ~ rep + rep:bloque + trat, en ese orden (como
                           terms(…, keep.order = TRUE)): los tratamientos al final, ajustados por los bloques
   Además: media, CV (uno por cada error), R², eficiencia relativa de los bloques y del cuadro latino (Gomez y
   Gomez, 1984), medias marginales estimadas con su EE (SP.medias) y efectos simples cuando hay dos o más factores
   (pruebas conjuntas, como emmeans::joint_tests). */
SP.definir('disenos', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);

  const DISENOS = {
    dca: { nombre: 'Completamente al azar', roles: ['tratamientos'] },
    dbca: { nombre: 'Bloques completos al azar', roles: ['tratamientos', 'bloque'] },
    'cuadro-latino': { nombre: 'Cuadro latino', roles: ['tratamientos', 'fila', 'columna'] },
    'parcelas-divididas': { nombre: 'Parcelas divididas', roles: ['parcelaGrande', 'subparcela', 'bloque', 'repeticion', 'fila', 'columna'], estratos: true },
    'parcelas-subdivididas': { nombre: 'Parcelas subdivididas', roles: ['parcelaGrande', 'subparcela', 'subsubparcela', 'bloque'], estratos: true },
    franjas: { nombre: 'Parcelas en franjas', roles: ['franjaA', 'franjaB', 'bloque'], estratos: true },
    bib: { nombre: 'Bloques incompletos balanceados', roles: ['tratamientos', 'bloque'] },
    latice: { nombre: 'Látice y alfa-látice', roles: ['tratamientos', 'bloque', 'repeticion'] },
  };

  /** Tabla con la respuesta y los factores del diseño (las columnas numéricas de diseño, como factor). */
  function tablaDiseno(tabla, e, roles) {
    const cols = {}, nombres = [];
    const agrega = (nom, fac) => { if (!nom || cols[nom]) return; cols[nom] = fac ? SP.estructura.comoFactor(tabla, nom) : tabla.col(nom); nombres.push(nom); };
    agrega(e.respuesta, false);
    for (const r of roles) lista(e[r]).forEach(n => agrega(n, true));
    return { n: tabla.n, nombres, columnas: cols, col(n) { const c = cols[n]; if (!c) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: n })); return c; } };
  }

  /** Conteo de observaciones por combinación de los factores dados (filas completas). */
  function conteos(t, filas, factores) {
    const cols = factores.map(f => t.col(f)), m = new Map();
    for (const i of filas) { const k = cols.map(c => c.codigos[i]).join('|'); m.set(k, (m.get(k) || 0) + 1); }
    const posibles = cols.reduce((x, c) => x * new Set(filas.map(i => c.codigos[i])).size, 1);
    const vals = [...m.values()];
    return { celdas: m.size, posibles, min: Math.min(...vals), max: Math.max(...vals), completo: m.size === posibles, igual: Math.min(...vals) === Math.max(...vals) };
  }

  /** Fórmula y estructura de cada diseño. */
  function modeloDe(diseno, e) {
    const tr = lista(e.tratamientos), trat = tr.map(q).join(' * '), y = q(e.respuesta);
    switch (diseno) {
      case 'dca': return { formula: `${y} ~ ${trat}`, factores: tr };
      case 'dbca': return { formula: `${y} ~ ${q(e.bloque)} + ${trat}`, factores: tr, bloques: [e.bloque] };
      case 'cuadro-latino': return { formula: `${y} ~ ${q(e.fila)} + ${q(e.columna)} + ${trat}`, factores: tr, bloques: [e.fila, e.columna] };
      case 'parcelas-divididas': {
        const A = q(e.parcelaGrande), B = q(e.subparcela);
        if (e.principal === 'dca') return { formula: `${y} ~ ${A} * ${B}`, error: `${A}:${q(e.repeticion)}`, factores: [e.parcelaGrande, e.subparcela], unidades: [[e.parcelaGrande, e.repeticion], [e.parcelaGrande, e.repeticion, e.subparcela]] };
        if (e.principal === 'latino') return { formula: `${y} ~ ${q(e.fila)} + ${q(e.columna)} + ${A} * ${B}`, error: `${q(e.fila)}:${q(e.columna)}`, factores: [e.parcelaGrande, e.subparcela], bloques: [e.fila, e.columna], unidades: [[e.fila, e.columna], [e.fila, e.columna, e.subparcela]] };
        return { formula: `${y} ~ ${q(e.bloque)} + ${A} * ${B}`, error: `${q(e.bloque)}/${A}`, factores: [e.parcelaGrande, e.subparcela], bloques: [e.bloque], unidades: [[e.bloque, e.parcelaGrande], [e.bloque, e.parcelaGrande, e.subparcela]] };
      }
      case 'parcelas-subdivididas': {
        const A = q(e.parcelaGrande), B = q(e.subparcela), C = q(e.subsubparcela);
        return { formula: `${y} ~ ${q(e.bloque)} + ${A} * ${B} * ${C}`, error: `${q(e.bloque)}/${A}/${B}`, factores: [e.parcelaGrande, e.subparcela, e.subsubparcela], bloques: [e.bloque],
          unidades: [[e.bloque, e.parcelaGrande], [e.bloque, e.parcelaGrande, e.subparcela], [e.bloque, e.parcelaGrande, e.subparcela, e.subsubparcela]] };
      }
      case 'franjas': {
        const A = q(e.franjaA), B = q(e.franjaB);
        return { formula: `${y} ~ ${q(e.bloque)} + ${A} * ${B}`, error: `${q(e.bloque)}/(${A} + ${B})`, factores: [e.franjaA, e.franjaB], bloques: [e.bloque],
          unidades: [[e.bloque, e.franjaA], [e.bloque, e.franjaB], [e.bloque, e.franjaA, e.franjaB]] };
      }
      case 'bib': return { formula: `${y} ~ ${q(e.bloque)} + ${q(tr[0])}`, factores: [tr[0]], bloques: [e.bloque], intrabloque: true };
      case 'latice': return { formula: `${y} ~ ${q(e.repeticion)} + ${q(e.repeticion)}:${q(e.bloque)} + ${q(tr[0])}`, factores: [tr[0]], bloques: [e.repeticion, e.bloque], intrabloque: true, conservarOrden: true };
      default: throw new SP.ErrorSP(T('Diseño desconocido: {d}.', { d: diseno }));
    }
  }

  /* ---------------- eficiencia relativa (Gomez y Gomez, 1984, pp. 32 y 37) ---------------- */
  /** Factor de ajuste por grados de libertad del error, que se aplica cuando el error tiene menos de 20 gl. */
  const ajusteGl = (gl1, gl2) => ((gl1 + 1) * (gl2 + 3)) / ((gl1 + 3) * (gl2 + 1));
  function eficienciaBloques(cmBloque, cmError, r, t) {
    const ER = ((r - 1) * cmBloque + r * (t - 1) * cmError) / ((r * t - 1) * cmError);
    const gl1 = (r - 1) * (t - 1), gl2 = t * (r - 1);
    return [{ contra: 'dca', relativa: ER, ajustada: gl1 < 20 ? ER * ajusteGl(gl1, gl2) : ER, factor: gl1 < 20 ? ajusteGl(gl1, gl2) : 1 }];
  }
  function eficienciaLatino(cmFila, cmCol, cmError, t) {
    const glLS = (t - 1) * (t - 2), aj = (gl2, er) => (glLS < 20 ? er * ajusteGl(glLS, gl2) : er);
    const vsDCA = (cmFila + cmCol + (t - 1) * cmError) / ((t + 1) * cmError);
    /* frente a bloques con las filas como bloques, la variación de las columnas pasaría al error: esa eficiencia
       depende del CM de columnas (y la de las columnas como bloques, del CM de filas) */
    const vsFilas = (cmCol + (t - 1) * cmError) / (t * cmError), vsCols = (cmFila + (t - 1) * cmError) / (t * cmError);
    return [
      { contra: 'dca', relativa: vsDCA, ajustada: aj(t * (t - 1), vsDCA), factor: glLS < 20 ? ajusteGl(glLS, t * (t - 1)) : 1 },
      { contra: 'dbca-filas', relativa: vsFilas, ajustada: aj((t - 1) * (t - 1), vsFilas), factor: glLS < 20 ? ajusteGl(glLS, (t - 1) * (t - 1)) : 1 },
      { contra: 'dbca-columnas', relativa: vsCols, ajustada: aj((t - 1) * (t - 1), vsCols), factor: glLS < 20 ? ajusteGl(glLS, (t - 1) * (t - 1)) : 1 },
    ];
  }

  /* ---------------- medias crudas (para los diseños con estratos) ---------------- */
  function mediasCrudas(t, filas, factores) {
    const cols = factores.map(f => t.col(f)), y = t.col(t.nombres[0]).valores, m = new Map();
    for (const i of filas) { const k = cols.map(c => c.codigos[i]).join('|'); const a = m.get(k) || [0, 0]; a[0] += y[i]; a[1]++; m.set(k, a); }
    const niveles = cols.map(c => c.niveles.filter((_, j) => filas.some(i => c.codigos[i] === j)));
    const idx = cols.map((c, k) => niveles[k].map(l => c.niveles.indexOf(l)));
    /* el primer factor varía más rápido: se recorre del último al primero */
    const orden = factores.map((_, k) => k).reverse();
    const out2 = [];
    const rec2 = (h, cod, et) => {
      if (h === orden.length) { const a = m.get(cod.join('|')); out2.push({ niveles: Object.assign({}, et), media: a ? a[0] / a[1] : NaN, n: a ? a[1] : 0 }); return; }
      const k = orden[h];
      idx[k].forEach((j, x) => { cod[k] = j; et[factores[k]] = niveles[k][x]; rec2(h + 1, cod, et); });
    };
    rec2(0, new Array(cols.length), {});
    return out2;
  }

  /* ---------------- motor ---------------- */
  /**
   * @param {object} tabla
   * @param {string} diseno  clave de DISENOS
   * @param {object} e       papeles: respuesta, tratamientos, bloque, fila, columna, parcelaGrande, subparcela,
   *                         subsubparcela, franjaA, franjaB, repeticion, principal ('dbca' | 'dca' | 'latino')
   * @param {object} op      { tipoSC: 1 | 2 | 3, alfa }
   */
  function analizar(tabla, diseno, e, op) {
    op = Object.assign({ tipoSC: 3, alfa: 0.05 }, op || {});
    const def = DISENOS[diseno];
    exigir(def, T('Diseño desconocido: {d}.', { d: diseno }));
    const t = tablaDiseno(tabla, e, def.roles);
    const mod = modeloDe(diseno, e);
    const avisos = [];
    const out = { diseno, respuesta: e.respuesta, factores: mod.factores, bloques: mod.bloques || [], formula: mod.formula, error: mod.error || null, alfa: op.alfa, avisos };

    if (mod.error) {
      const r = SP.estratos.anova(t, mod.formula, mod.error);
      avisos.push(...r.avisos);
      const filas = Array.from(r.filas), y = t.col(e.respuesta).valores;
      const n = filas.length;
      let media = 0; for (const i of filas) media += y[i]; media /= n;
      let sct = 0; for (const i of filas) sct += (y[i] - media) ** 2;
      /* balance: cada unidad de cada estrato con exactamente una observación por combinación */
      const todos = [...new Set(mod.unidades.flat())];
      const c = conteos(t, filas, todos);
      out.balanceado = c.completo && c.igual && c.max === 1;
      if (!out.balanceado) avisos.push(T('El diseño no está balanceado (faltan o sobran parcelas): con estratos de error las pruebas F dejan de ser exactas y los términos se reparten entre estratos. El análisis correcto es un modelo mixto (familia Modelos mixtos del catálogo).'));
      let letra = 0;
      out.estratos = r.estratos.map(s => {
        const et = s.residual ? 'Error ' + 'abcdefgh'[letra++] : null;
        return { nombre: s.nombre, error: et, filas: s.filas, residual: s.residual, cv: s.residual ? 100 * sqrt(s.residual.cm) / media : NaN };
      });
      out.total = { gl: n - 1, sc: sct };
      out.resumen = { n, media, excluidas: tabla.n - n, cv: out.estratos.filter(s => s.residual).map(s => ({ error: s.error, cv: s.cv })) };
      out.medias = mod.factores.map(f => ({ factor: f, filas: mediasCrudas(t, filas, [f]) }));
      if (mod.factores.length > 1) out.celdas = { factores: mod.factores.slice(0, 2), filas: mediasCrudas(t, filas, mod.factores.slice(0, 2)) };
      out.valores = valoresPor(t, filas, mod.factores[0]);
      return out;
    }

    /* un solo estrato */
    let tipo = mod.intrabloque ? 1 : Number(op.tipoSC) || 3;
    const filasModelo = SP.estratos.filasCompletas(t, t.nombres);
    let formula = mod.formula;
    if (diseno === 'dbca') {
      const c = conteos(t, filasModelo, [e.bloque, ...mod.factores]);
      if (c.max > 1) {
        out.generalizado = true;
        formula = `${q(e.respuesta)} ~ ${q(e.bloque)} * (${mod.factores.map(q).join(' * ')})`;
        avisos.push(T('Hay más de una parcela por tratamiento en cada bloque (bloques generalizados): se estima la interacción bloque × tratamiento y el error es la variación dentro de bloque y tratamiento.'));
      }
      if (!c.completo) { out.perdidas = c.posibles - c.celdas; avisos.push(T('Faltan {k} combinaciones de bloque y tratamiento (parcelas perdidas): las medias son ajustadas y las sumas de cuadrados no son ortogonales.', { k: c.posibles - c.celdas })); }
    }
    if (diseno === 'dca' || diseno === 'cuadro-latino') {
      const c = conteos(t, filasModelo, mod.factores);
      if (!c.completo) avisos.push(T('Faltan {k} combinaciones de tratamientos: algunas medias no se pueden estimar.', { k: c.posibles - c.celdas }));
    }
    out.formula = formula;
    let tablaA;
    const orden = { conservarOrden: !!mod.conservarOrden };
    try { tablaA = SP.lineal.anova(t, formula, Object.assign({ tipo }, orden)); }
    catch (err) {
      if (tipo !== 3) throw err;
      tipo = 2; tablaA = SP.lineal.anova(t, formula, Object.assign({ tipo }, orden));
      avisos.push(T('Las sumas de cuadrados tipo III no existen con celdas vacías; se usaron las de tipo II.'));
    }
    const a = SP.lineal.ajustar(t, formula, orden);
    const tipo1 = tipo === 1 ? tablaA : SP.lineal.anova(t, formula, Object.assign({ tipo: 1 }, orden));
    const confundidos = a.modelo.terminos.map(x => x.etiqueta).filter(x => !tablaA.fuente.includes(x));
    if (confundidos.length) avisos.push(T('{t} no tiene grados de libertad propios: está confundido con otro término (por ejemplo, con los bloques) y no se puede probar.', { t: confundidos.map(etiqueta).join(', ') }));
    out.tipoSC = tipo;
    out.intrabloque = !!mod.intrabloque;
    const sinInt = k => tablaA.fuente[k] !== '(Intercepto)';
    const idx = tablaA.fuente.map((_, k) => k).filter(sinInt);
    out.anova = { fuente: idx.map(k => tablaA.fuente[k]), gl: idx.map(k => tablaA.gl[k]), sc: idx.map(k => tablaA.sc[k]), cm: idx.map(k => tablaA.cm[k]), F: idx.map(k => tablaA.F[k]), p: idx.map(k => tablaA.p[k]) };
    const y = a.modelo.y, n = a.modelo.n;
    let media = 0; for (let i = 0; i < n; i++) media += y[i]; media /= n;
    let sct = 0; for (let i = 0; i < n; i++) sct += (y[i] - media) ** 2;
    const cmE = a.glResidual > 0 ? a.scResidual / a.glResidual : NaN;
    out.total = { gl: n - 1, sc: sct };
    out.resumen = { n, media, excluidas: tabla.n - n, cv: 100 * sqrt(cmE) / media, r2: 1 - a.scResidual / sct, cmError: cmE, glError: a.glResidual };
    /* comprobación de balance para decir si los tipos coinciden */
    out.balanceado = tipo1.sc.every((s, k) => Math.abs(s - (tablaA.sc[tablaA.fuente.indexOf(tipo1.fuente[k])] ?? s)) <= 1e-9 * Math.max(1, sct));

    /* eficiencia relativa: un dato por celda, sin parcelas perdidas */
    const cm = f => { const k = tipo1.fuente.indexOf(f); return k >= 0 ? tipo1.cm[k] : NaN; };
    if (diseno === 'dbca' && !out.generalizado && !out.perdidas) {
      const r = new Set(Array.from(a.modelo.filas, i => t.col(e.bloque).codigos[i])).size, tt = n / r;
      out.eficiencia = eficienciaBloques(cm(e.bloque), cmE, r, tt);
    }
    if (diseno === 'cuadro-latino') {
      const tt = new Set(Array.from(a.modelo.filas, i => t.col(e.fila).codigos[i])).size;
      if (n === tt * tt) out.eficiencia = eficienciaLatino(cm(e.fila), cm(e.columna), cmE, tt);
    }
    /* bloques incompletos balanceados: parámetros y eficiencia */
    if (diseno === 'bib') out.bib = parametrosBIB(t, Array.from(a.modelo.filas), e.bloque, mod.factores[0], avisos);

    /* medias marginales estimadas y efectos simples */
    out.medias = mod.factores.map(f => ({ factor: f, filas: SP.medias.emm(t, a, [f]) }));
    if (mod.factores.length > 1) {
      out.celdas = { factores: mod.factores.slice(0, 2), filas: SP.medias.emm(t, a, mod.factores.slice(0, 2)) };
      out.simples = [];
      for (const f of mod.factores) {
        const otros = mod.factores.filter(x => x !== f);
        for (const s of SP.medias.pruebasConjuntas(t, a, [f])) if (s.termino.split(':').every(x => otros.includes(x))) out.simples.push(Object.assign({ factor: f, nivel: s.por[f] }, s));
      }
    }
    out.valores = valoresPor(t, Array.from(a.modelo.filas), mod.factores[0]);
    return out;
  }
  function parametrosBIB(t, filas, bloque, trat, avisos) {
    const cb = t.col(bloque), ct = t.col(trat), porBloque = new Map(), porTrat = new Map(), pares = new Map();
    const enBloque = new Map();
    for (const i of filas) {
      porBloque.set(cb.codigos[i], (porBloque.get(cb.codigos[i]) || 0) + 1);
      porTrat.set(ct.codigos[i], (porTrat.get(ct.codigos[i]) || 0) + 1);
      if (!enBloque.has(cb.codigos[i])) enBloque.set(cb.codigos[i], []);
      enBloque.get(cb.codigos[i]).push(ct.codigos[i]);
    }
    for (const ts of enBloque.values()) for (let x = 0; x < ts.length; x++) for (let z = x + 1; z < ts.length; z++) { const k = Math.min(ts[x], ts[z]) + '|' + Math.max(ts[x], ts[z]); pares.set(k, (pares.get(k) || 0) + 1); }
    const k = new Set(porBloque.values()), r = new Set(porTrat.values()), tt = porTrat.size, b = porBloque.size;
    const lambdas = new Set(pares.values()), todosPares = pares.size === tt * (tt - 1) / 2;
    const balanceado = k.size === 1 && r.size === 1 && lambdas.size === 1 && todosPares;
    const kk = [...k][0], rr = [...r][0], lam = rr * (kk - 1) / (tt - 1);
    if (!balanceado) avisos.push(T('No es un diseño de bloques incompletos balanceado exacto (bloques de distinto tamaño o pares que no coinciden el mismo número de veces): el análisis intrabloque sigue siendo válido, pero no se calcula la eficiencia.'));
    return { t: tt, b, k: balanceado ? kk : NaN, r: balanceado ? rr : NaN, lambda: balanceado ? lam : NaN, eficiencia: balanceado ? lam * tt / (rr * kk) : NaN, balanceado };
  }
  function valoresPor(t, filas, f) {
    const c = t.col(f), y = t.col(t.nombres[0]).valores;
    const niveles = c.niveles.filter((_, j) => filas.some(i => c.codigos[i] === j));
    const out = niveles.map(() => []);
    for (const i of filas) out[niveles.indexOf(c.niveles[c.codigos[i]])].push(y[i]);
    return { factor: f, niveles, valores: out };
  }

  /** Versión plana para las pruebas: la tabla de ANOVA y el resumen. */
  function anovaDe(tabla, diseno, e, op) {
    const r = analizar(tabla, diseno, e, op);
    return { anova: r.anova, estratos: r.estratos, resumen: r.resumen, eficiencia: r.eficiencia, bib: r.bib };
  }

  SP.disenos = { DISENOS, analizar, anovaDe, modeloDe, tablaDiseno, eficienciaBloques, eficienciaLatino };

  /* ======================= métodos ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const etiqueta = s => String(s).split(':').join(' × ');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });

  function validarDiseno(diseno) {
    return (tabla, e, op) => {
      const num = c => { exigir(c && tabla.columnas[c], T('Falta elegir la variable de respuesta.')); exigir(tabla.col(c).tipo === 'numerica', T('«{c}» debe ser numérica.', { c })); };
      const fac = (c, papel) => exigir(c && tabla.columnas[c], T('Falta elegir {p}.', { p: papel }));
      num(e.respuesta);
      const usados = [e.respuesta];
      const usa = (c, papel) => { fac(c, papel); exigir(!usados.includes(c), T('«{c}» está en dos papeles a la vez.', { c })); usados.push(c); };
      if (['dca', 'dbca', 'cuadro-latino', 'bib', 'latice'].includes(diseno)) {
        const tr = lista(e.tratamientos);
        exigir(tr.length >= 1, T('Elige al menos un factor de tratamiento.'));
        exigir(tr.length <= (['bib', 'latice'].includes(diseno) ? 1 : diseno === 'cuadro-latino' ? 2 : 3), T('Este diseño admite {k} factores de tratamiento a lo más.', { k: ['bib', 'latice'].includes(diseno) ? 1 : diseno === 'cuadro-latino' ? 2 : 3 }));
        tr.forEach(x => usa(x, T('los tratamientos')));
      }
      if (['dbca', 'bib', 'latice', 'parcelas-subdivididas', 'franjas'].includes(diseno) || (diseno === 'parcelas-divididas' && (e.principal || 'dbca') === 'dbca')) usa(e.bloque, T('la columna de bloques'));
      if (diseno === 'latice') usa(e.repeticion, T('la columna de repeticiones'));
      if (diseno === 'cuadro-latino' || (diseno === 'parcelas-divididas' && e.principal === 'latino')) { usa(e.fila, T('la columna de filas')); usa(e.columna, T('la columna de columnas')); }
      if (diseno === 'parcelas-divididas' && e.principal === 'dca') usa(e.repeticion, T('la columna de repeticiones de las parcelas grandes'));
      if (diseno === 'parcelas-divididas' || diseno === 'parcelas-subdivididas') { usa(e.parcelaGrande, T('el factor de la parcela grande')); usa(e.subparcela, T('el factor de la subparcela')); }
      if (diseno === 'parcelas-subdivididas') usa(e.subsubparcela, T('el factor de la sub-subparcela'));
      if (diseno === 'franjas') { usa(e.franjaA, T('el factor de las franjas horizontales')); usa(e.franjaB, T('el factor de las franjas verticales')); }
      exigir([1, 2, 3].includes(Number(op.tipoSC || 3)), T('El tipo de suma de cuadrados es 1, 2 o 3.'));
    };
  }
  const calcularDiseno = diseno => (tabla, e, op) => analizar(tabla, diseno, e, op);

  function reporteDiseno(r) {
    const a = r.alfa || 0.05, conclusiones = [], cuadros = [];
    const nombre = T(DISENOS[r.diseno].nombre);
    /* conclusiones: cada término de tratamiento */
    const filasPrueba = r.estratos ? r.estratos.flatMap(s => s.filas) : r.anova.fuente.map((f, k) => ({ fuente: f, gl: r.anova.gl[k], F: r.anova.F[k], p: r.anova.p[k] }));
    const deTrat = filasPrueba.filter(f => f.fuente.split(':').every(x => r.factores.includes(x)));
    const inter = deTrat.filter(f => f.fuente.includes(':') && f.p < a);
    for (const f of deTrat) {
      if (!Number.isFinite(f.p)) continue;
      conclusiones.push(f.p < a
        ? T('{t}: hay diferencias (F = {F}, p {p}).', { t: etiqueta(f.fuente), F: f3(f.F), p: fp(f.p) })
        : T('{t}: no hay evidencia de diferencias (F = {F}, p {p}).', { t: etiqueta(f.fuente), F: f3(f.F), p: fp(f.p) }));
    }
    /* con estratos (parcelas divididas, franjas…) no hay cuadro de efectos simples: la vía es comparar dentro de cada nivel */
    if (inter.length) conclusiones.push(r.estratos
      ? T('La interacción {i} es significativa: el efecto de un factor depende del nivel del otro; compara un factor dentro de cada nivel del otro (Comparaciones de medias, «Dentro de cada nivel de»), no los efectos principales por separado.', { i: inter.map(f => etiqueta(f.fuente)).join(', ') })
      : T('La interacción {i} es significativa: el efecto de un factor depende del nivel del otro; interpreta los efectos simples y las medias de las combinaciones, no los efectos principales por separado.', { i: inter.map(f => etiqueta(f.fuente)).join(', ') }));
    const rs = r.resumen;
    conclusiones.push(r.estratos
      ? T('Media general {m}; {cv}.', { m: f3(rs.media), cv: rs.cv.map(c => T('CV({e}) = {v} %', { e: c.error.replace('Error ', ''), v: c.cv.toFixed(1) })).join(', ') })
      : T('Media general {m}; CV = {cv} %; R² = {r2}.', { m: f3(rs.media), cv: rs.cv.toFixed(1), r2: rs.r2.toFixed(3) }));

    /* cuadro 1: análisis de varianza */
    const notas = [];
    let filas;
    if (r.estratos) {
      filas = [];
      for (const s of r.estratos) {
        for (const f of s.filas) filas.push({ fuente: etiqueta(f.fuente), gl: f.gl, sc: f.sc, cm: f.cm, F: f.F, p: f.p });
        if (s.residual) filas.push({ fuente: s.error, gl: s.residual.gl, sc: s.residual.sc, cm: s.residual.cm, F: NaN, p: NaN, _clase: 'error' });
      }
      notas.push(T('Cada término se prueba contra el error de su estrato: {e}.', { e: r.estratos.filter(s => s.residual).map(s => T('{err} = {u}', { err: s.error, u: s.nombre === 'Within' ? T('variación dentro de las unidades más pequeñas') : etiqueta(s.nombre) })).join('; ') }));
      if (r.bloques.length) notas.push(T('Los bloques no se prueban: su estrato no tiene error propio.'));
    } else {
      filas = r.anova.fuente.map((f, k) => ({ fuente: f === 'Residuales' ? T('Error') : etiqueta(f), gl: r.anova.gl[k], sc: r.anova.sc[k], cm: r.anova.cm[k], F: r.anova.F[k], p: r.anova.p[k] }));
      /* bloques incompletos: tipo I a propósito, con los tratamientos al final (no se compara con los otros tipos) */
      if (r.intrabloque) notas.push(T('Análisis intrabloque: sumas de cuadrados secuenciales (tipo I) en el orden del cuadro; los tratamientos van al final, ajustados por los bloques, y sus medias son ajustadas.'));
      else notas.push(r.balanceado ? T('Datos balanceados: las sumas de cuadrados tipo I, II y III coinciden.')
        : T('Datos desbalanceados: sumas de cuadrados tipo {t}. {x}', { t: ['', 'I', 'II', 'III'][r.tipoSC], x: [
          '', T('Tipo I: cada término ajustado por los anteriores (el orden importa).'),
          T('Tipo II: cada término ajustado por los demás que no lo contienen; es la más potente si no hay interacción.'),
          T('Tipo III: cada término ajustado por todos los demás, con contrastes de suma cero; prueba las medias marginales con pesos iguales.')][r.tipoSC] }));
    }
    filas.push({ fuente: T('Total'), gl: r.total.gl, sc: r.total.sc, cm: NaN, F: NaN, p: NaN });
    cuadros.push({ id: 'anova', titulo: T('Análisis de varianza: {d}', { d: nombre }),
      columnas: [col('fuente', T('Fuente de variación'), 'texto'), col('gl', T('gl'), 'entero'), col('sc', T('SC'), 'auto4'), col('cm', T('CM'), 'auto4'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas, notas: notas.concat(r.avisos) });

    /* cuadro 2: resumen y eficiencia */
    const res = [{ medida: T('Media general'), valor: rs.media, _dec: 3 }, { medida: T('Observaciones'), valor: rs.n, _dec: 0 }];
    if (r.estratos) rs.cv.forEach(c => res.push({ medida: T('CV ({e}), %', { e: c.error }), valor: c.cv, _dec: 1 }));
    else res.push({ medida: T('Coeficiente de variación, %'), valor: rs.cv, _dec: 1 }, { medida: 'R²', valor: rs.r2, _dec: 3 });
    const CONTRA = { dca: T('Eficiencia relativa frente a completamente al azar, %'), 'dbca-filas': T('Eficiencia relativa frente a bloques (las filas como bloques), %'), 'dbca-columnas': T('Eficiencia relativa frente a bloques (las columnas como bloques), %') };
    for (const ef of r.eficiencia || []) res.push({ medida: CONTRA[ef.contra], valor: 100 * ef.ajustada, _dec: 1 });
    if (r.bib) res.push({ medida: T('Factor de eficiencia del BIB (E = λt / rk)'), valor: r.bib.eficiencia, _dec: 3 }, { medida: 'λ', valor: r.bib.lambda, _dec: 0 });
    cuadros.push({ id: 'resumen', titulo: T('Resumen del ensayo'), columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'escala')], filas: res,
      notas: r.eficiencia ? [T('Eficiencia relativa de Gomez y Gomez (1984), con el factor de ajuste por grados de libertad cuando el error tiene menos de 20.')] : [] });

    /* cuadro 3: medias */
    const conEE = !r.estratos;
    for (const m of r.medias) {
      cuadros.push({ id: 'medias-' + m.factor, titulo: conEE ? T('Medias de «{f}» (marginales estimadas)', { f: m.factor }) : T('Medias de «{f}»', { f: m.factor }),
        columnas: [col('nivel', m.factor, 'texto'), col('media', T('Media'), 'forma')].concat(conEE ? [col('ee', T('EE'), 'forma')] : [col('n', 'n', 'entero')]),
        filas: m.filas.map(x => ({ nivel: x.niveles[m.factor], media: conEE ? x.emm : x.media, ee: x.ee, n: x.n })),
        notas: conEE && m.filas.some(x => !x.estimable) ? [T('«—»: media no estimable (le faltan combinaciones).')] : [] });
    }
    if (r.celdas) {
      const [A, B] = r.celdas.factores;
      cuadros.push({ id: 'celdas', titulo: T('Medias de las combinaciones {a} × {b}', { a: A, b: B }),
        columnas: [col('a', A, 'texto'), col('b', B, 'texto'), col('media', T('Media'), 'forma')].concat(conEE ? [col('ee', T('EE'), 'forma')] : []),
        filas: r.celdas.filas.map(x => ({ a: x.niveles[A], b: x.niveles[B], media: conEE ? x.emm : x.media, ee: x.ee })), notas: [] });
    }
    if (r.simples && r.simples.length) {
      cuadros.push({ id: 'simples', titulo: T('Efectos simples (pruebas F dentro de cada nivel)'),
        columnas: [col('dentro', T('Dentro de'), 'texto'), col('termino', T('Efecto de'), 'texto'), col('gl1', T('gl'), 'entero'), col('gl2', T('gl error'), 'entero'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
        filas: r.simples.map(s => ({ dentro: `${s.factor} = ${s.nivel}`, termino: etiqueta(s.termino), gl1: s.gl1, gl2: s.gl2, F: s.F, p: s.p })),
        notas: [T('Cada prueba usa el error del modelo completo; es la misma que emmeans::joint_tests(modelo, by = …).')] });
    }
    return { titulo: nombre, conclusiones, cuadros, interaccion: inter.length > 0 };
  }

  /* ---------------- código R ---------------- */
  function codigoDiseno(diseno) {
    return (e, op, ctx) => {
      const mod = modeloDe(diseno, e), tipo = Number(op.tipoSC || 3);
      const facs = [...new Set([...(mod.bloques || []), ...mod.factores, ...(mod.unidades || []).flat()].filter(Boolean))];
      const L = [`# ${T(DISENOS[diseno].nombre)} (código R equivalente a SigmaPro)`];
      L.push(...facs.map(f => `datos$${q(f)} <- factor(datos$${q(f)})`));
      if (mod.error) {
        L.push(`modelo <- aov(${mod.formula} + Error(${mod.error}), data = datos)`, 'summary(modelo)',
          `# CV de cada error: 100 * sqrt(CM del error) / mean(datos$${q(e.respuesta)})`);
        if (diseno === 'parcelas-divididas' && (e.principal || 'dbca') === 'dbca') L.push(`# también: with(datos, agricolae::sp.plot(${q(e.bloque)}, ${q(e.parcelaGrande)}, ${q(e.subparcela)}, ${q(e.respuesta)}))`);
        if (diseno === 'parcelas-subdivididas') L.push(`# también: with(datos, agricolae::ssp.plot(${q(e.bloque)}, ${q(e.parcelaGrande)}, ${q(e.subparcela)}, ${q(e.subsubparcela)}, ${q(e.respuesta)}))`);
        if (diseno === 'franjas') L.push(`# también: with(datos, agricolae::strip.plot(${q(e.bloque)}, ${q(e.franjaA)}, ${q(e.franjaB)}, ${q(e.respuesta)}))`);
        return L.join('\n');
      }
      const generalizado = diseno === 'dbca' && !!(ctx && ctx.resultado && ctx.resultado.generalizado);
      const f = generalizado ? `${q(e.respuesta)} ~ ${q(e.bloque)} * (${mod.factores.map(q).join(' * ')})` : mod.formula;
      /* el látice conserva el orden escrito (los tratamientos al final): terms(…, keep.order = TRUE) */
      L.push(`modelo <- lm(${mod.conservarOrden ? `terms(${f}, keep.order = TRUE)` : f}, data = datos${tipo === 3 && !mod.intrabloque ? ', contrasts = ' + 'list(' + facs.map(x => `${q(x)} = contr.sum`).join(', ') + ')' : ''})`);
      if (mod.intrabloque || tipo === 1) L.push('anova(modelo)   # tipo I: los tratamientos al final, ajustados por los bloques');
      else L.push(`car::Anova(modelo, type = ${tipo})`);
      L.push(`media <- mean(datos$${q(e.respuesta)}, na.rm = TRUE); 100 * sigma(modelo) / media   # CV`, 'summary(modelo)$r.squared   # R²');
      L.push('# medias marginales y efectos simples: install.packages("emmeans")', ...mod.factores.map(x => `emmeans::emmeans(modelo, "${x}")`));
      if (mod.factores.length > 1) L.push(...mod.factores.map(x => `emmeans::joint_tests(modelo, by = "${x}")`));
      if (diseno === 'bib') L.push(`# también: with(datos, agricolae::BIB.test(${q(e.bloque)}, ${q(mod.factores[0])}, ${q(e.respuesta)}, console = TRUE))`);
      return L.join('\n');
    };
  }

  const OPCIONES = { tipoSC: { tipo: 'numero', omision: 3 }, alfa: { tipo: 'numero', omision: 0.05 } };
  const ENTRADAS = {
    dca: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 3 } },
    dbca: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 3 }, bloque: { tipo: 'factor' } },
    'cuadro-latino': { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor+', maximo: 2 }, fila: { tipo: 'factor' }, columna: { tipo: 'factor' } },
    'parcelas-divididas': { respuesta: { tipo: 'numerica' }, parcelaGrande: { tipo: 'factor' }, subparcela: { tipo: 'factor' }, bloque: { tipo: 'factor', opcional: true },
      repeticion: { tipo: 'factor', opcional: true }, fila: { tipo: 'factor', opcional: true }, columna: { tipo: 'factor', opcional: true }, principal: { tipo: 'cualquiera', opcional: true } },
    'parcelas-subdivididas': { respuesta: { tipo: 'numerica' }, parcelaGrande: { tipo: 'factor' }, subparcela: { tipo: 'factor' }, subsubparcela: { tipo: 'factor' }, bloque: { tipo: 'factor' } },
    franjas: { respuesta: { tipo: 'numerica' }, franjaA: { tipo: 'factor' }, franjaB: { tipo: 'factor' }, bloque: { tipo: 'factor' } },
    bib: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor' }, bloque: { tipo: 'factor' } },
    latice: { respuesta: { tipo: 'numerica' }, tratamientos: { tipo: 'factor' }, bloque: { tipo: 'factor' }, repeticion: { tipo: 'factor' } },
  };
  const RESUMEN = {
    dca: 'Tratamientos (hasta 3 factores cruzados) aplicados al azar a unidades homogéneas.',
    dbca: 'Tratamientos (hasta 3 factores) en bloques completos; detecta parcelas perdidas y bloques generalizados.',
    'cuadro-latino': 'Tratamientos con bloqueo en dos direcciones (filas y columnas), con su eficiencia relativa.',
    'parcelas-divididas': 'Un factor en parcelas grandes y otro en subparcelas, con un error para cada uno; parcelas grandes en bloques, al azar o en cuadro latino.',
    'parcelas-subdivididas': 'Tres factores en parcelas, subparcelas y sub-subparcelas, con tres errores.',
    franjas: 'Dos factores aplicados en franjas que se cruzan, con tres errores.',
    bib: 'Bloques más chicos que el número de tratamientos, balanceados: medias ajustadas por bloque (intrabloque).',
    latice: 'Látice y alfa-látice: bloques incompletos dentro de repeticiones, con medias ajustadas (intrabloque).',
  };
  for (const [id, def] of Object.entries(DISENOS)) {
    SP.metodo({
      id, familia: 'disenos', motor: 'js', nombre: T(def.nombre), resumen: T(RESUMEN[id]), orden: Object.keys(DISENOS).indexOf(id),
      entradas: ENTRADAS[id], opciones: OPCIONES,
      validar: validarDiseno(id), calcular: calcularDiseno(id), reporte: reporteDiseno, codigoR: codigoDiseno(id),
    });
  }
});

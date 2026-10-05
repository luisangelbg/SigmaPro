/* SigmaPro — frecuencias, intervalos de proporciones y bondad de ajuste.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   SP.prop.ic(x, n, nivel, metodo) → [inferior, superior], con seis métodos:
     'wilson'           puntaje de Wilson (1927), el de prop.test(correct = FALSE) de R
     'wilson_cc'        Wilson con corrección de continuidad, como prop.test() de R: la corrección se
                        limita a |x − n/2| (su p nula por omisión), así que con x = n/2 no se corrige
     'clopper_pearson'  exacto por la beta (Clopper y Pearson, 1934), el de binom.test() de R
     'agresti_coull'    Agresti y Coull (1998), con x + z²/2 éxitos en n + z² ensayos
     'jeffreys'         cuantiles de la beta(x + ½, n − x + ½), con los extremos 0 y 1 en x = 0 y x = n
     'wald'             p ± z·√(p(1 − p)/n), solo como referencia: su cobertura real es mala con n chico
   Los de Wald y Agresti-Coull se recortan a [0, 1].
   Métodos registrados: 'frecuencias', 'proporciones', 'bondad-ajuste'. */
SP.definir('frecuencias', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, max, min, abs } = Math;
  const FALTANTE = '(faltante)';
  Object.assign(SP.nombresFunciones, { 'prop.ic': 'Intervalos de confianza de una proporción (seis métodos)' });

  /* ---------------- intervalos de una proporción ---------------- */
  const METODOS = ['wilson', 'wilson_cc', 'clopper_pearson', 'agresti_coull', 'jeffreys', 'wald'];
  const NOMBRES = {
    wilson: T('Wilson'), wilson_cc: T('Wilson con corrección'), clopper_pearson: T('Clopper-Pearson (exacto)'),
    agresti_coull: T('Agresti-Coull'), jeffreys: T('Jeffreys'), wald: T('Wald'),
  };
  function wilsonR(x, n, z, yates) {
    const est = x / n, z22n = z * z / (2 * n);
    let pc = est + yates / n;
    const pu = pc >= 1 ? 1 : (pc + z22n + z * sqrt(pc * (1 - pc) / n + z22n / (2 * n))) / (1 + 2 * z22n);
    pc = est - yates / n;
    const pl = pc <= 0 ? 0 : (pc + z22n - z * sqrt(pc * (1 - pc) / n + z22n / (2 * n))) / (1 + 2 * z22n);
    return [max(pl, 0), min(pu, 1)];
  }
  function ic(x, n, nivel, metodo) {
    if (!(n > 0) || !(x >= 0) || x > n) return [NaN, NaN];
    const a = 1 - nivel, z = SP.dist.qnorm(1 - a / 2);
    switch (metodo || 'wilson') {
      case 'wilson': return wilsonR(x, n, z, 0);
      case 'wilson_cc': return wilsonR(x, n, z, min(0.5, abs(x - n * 0.5)));
      case 'clopper_pearson':
        return [x === 0 ? 0 : SP.dist.qbeta(a / 2, x, n - x + 1), x === n ? 1 : SP.dist.qbeta(1 - a / 2, x + 1, n - x)];
      case 'jeffreys':
        return [x === 0 ? 0 : SP.dist.qbeta(a / 2, x + 0.5, n - x + 0.5), x === n ? 1 : SP.dist.qbeta(1 - a / 2, x + 0.5, n - x + 0.5)];
      case 'agresti_coull': {
        const nt = n + z * z, pt = (x + z * z / 2) / nt, h = z * sqrt(pt * (1 - pt) / nt);
        return [max(0, pt - h), min(1, pt + h)];
      }
      case 'wald': {
        const p = x / n, h = z * sqrt(p * (1 - p) / n);
        return [max(0, p - h), min(1, p + h)];
      }
      default: throw new SP.ErrorSP(T('Método de intervalo desconocido: «{m}».', { m: metodo }));
    }
  }
  SP.prop = { ic, METODOS, NOMBRES };

  const lista = v => (v === undefined || v === null || v === '' ? [] : Array.isArray(v) ? v : [v]);
  const existe = (tabla, c) => { if (!tabla.columnas[c]) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c })); };
  const vec = xs => 'c(' + xs.map(x => JSON.stringify(x)).join(', ') + ')';
  const comoFactor = (t, c) => SP.estructura.comoFactor(t, c);
  const fmt = (x, d) => (Number.isFinite(x) ? x.toFixed(d) : '—');
  const nR = x => String(Number(x.toPrecision(12)));      // número limpio para el código R (0.025, no 0.025000000000000022)

  /* ======================= frecuencias de una y dos vías ======================= */
  /** Códigos de un factor con la categoría «(faltante)» al final, si se pide y hay faltantes. */
  function codificar(f, conFaltantes) {
    const niveles = f.niveles.slice(), cod = Int32Array.from(f.codigos);
    if (conFaltantes && cod.some(c => c < 0)) { const k = niveles.length; niveles.push(FALTANTE); for (let i = 0; i < cod.length; i++) if (cod[i] < 0) cod[i] = k; }
    return { niveles, cod };
  }
  function calcularFrecuencias(tabla, e, op) {
    const A = comoFactor(tabla, e.fila), conF = !!op.faltantes;
    const a = codificar(A, conF);
    if (!e.columna) {
      const frec = new Array(a.niveles.length).fill(0);
      let falt = 0;
      for (const c of a.cod) { if (c < 0) falt++; else frec[c]++; }
      const total = frec.reduce((s, v) => s + v, 0);
      let acum = 0;
      const acumulada = frec.map(v => (acum += v));
      return {
        vias: 1, fila: e.fila, niveles: a.niveles, frecuencia: frec, total, faltantes: falt,
        porcentaje: frec.map(v => 100 * v / total), acumulada, porcentaje_acumulado: acumulada.map(v => 100 * v / total),
      };
    }
    const b = codificar(comoFactor(tabla, e.columna), conF);
    const I = a.niveles.length, J = b.niveles.length;
    const conteos = Array.from({ length: I }, () => new Array(J).fill(0));
    let excluidas = 0;
    for (let i = 0; i < a.cod.length; i++) { const x = a.cod[i], y = b.cod[i]; if (x < 0 || y < 0) excluidas++; else conteos[x][y]++; }
    const tf = conteos.map(r => r.reduce((s, v) => s + v, 0)), tc = b.niveles.map((_, j) => conteos.reduce((s, r) => s + r[j], 0));
    const total = tf.reduce((s, v) => s + v, 0);
    return {
      vias: 2, fila: e.fila, columna: e.columna, niveles_fila: a.niveles, niveles_columna: b.niveles, conteos,
      total_fila: tf, total_columna: tc, total, excluidas,
      pct_total: conteos.map(r => r.map(v => 100 * v / total)),
      pct_fila: conteos.map((r, i) => r.map(v => 100 * v / tf[i])),
      pct_columna: conteos.map(r => r.map((v, j) => 100 * v / tc[j])),
    };
  }
  function reporteFrecuencias(r) {
    const conclusiones = [], col = (clave, titulo, formato) => ({ clave, titulo, formato });
    if (r.vias === 1) {
      const k = r.frecuencia.indexOf(Math.max(...r.frecuencia));
      conclusiones.push(T('«{f}» tiene {k} categorías en {n} observaciones; la más frecuente es «{c}» ({p} %).',
        { f: r.fila, k: r.niveles.length, n: r.total, c: r.niveles[k], p: fmt(r.porcentaje[k], 1) }));
      if (r.faltantes) conclusiones.push(T('{k} observaciones sin valor no entran en los porcentajes.', { k: r.faltantes }));
      return {
        titulo: T('Frecuencias de {f}', { f: r.fila }), conclusiones,
        cuadros: [{
          id: 'frecuencias', titulo: T('Frecuencias de {f}', { f: r.fila }),
          columnas: [col('nivel', r.fila, 'texto'), col('frecuencia', T('Frecuencia'), 'entero'), col('porcentaje', '%', 'pct'),
            col('acumulada', T('Acumulada'), 'entero'), col('porcentaje_acumulado', T('% acumulado'), 'pct')],
          filas: r.niveles.map((nv, i) => ({ nivel: nv, frecuencia: r.frecuencia[i], porcentaje: r.porcentaje[i], acumulada: r.acumulada[i], porcentaje_acumulado: r.porcentaje_acumulado[i] }))
            .concat([{ nivel: T('Total'), frecuencia: r.total, porcentaje: 100, _total: true }]),
          notas: r.faltantes ? [T('Sin contar {k} observaciones faltantes.', { k: r.faltantes })] : [],
        }],
      };
    }
    conclusiones.push(T('Tabla de {a} × {b} con {n} observaciones en {i} × {j} celdas.', { a: r.fila, b: r.columna, n: r.total, i: r.niveles_fila.length, j: r.niveles_columna.length }));
    const vacias = r.conteos.flat().filter(v => v === 0).length;
    if (vacias) conclusiones.push(T('{k} celdas no tienen ninguna observación.', { k: vacias }));
    if (r.excluidas) conclusiones.push(T('{k} observaciones con algún valor faltante no entran.', { k: r.excluidas }));
    const cuadro = (id, titulo, valor, formato, totales) => ({
      id, titulo,
      columnas: [col('nivel', r.fila + ' \\ ' + r.columna, 'texto'), ...r.niveles_columna.map((c, j) => col('c' + j, c, formato)), col('total', T('Total'), formato)],
      filas: r.niveles_fila.map((nv, i) => {
        const f = { nivel: nv, total: totales.fila(i) };
        r.niveles_columna.forEach((_, j) => { f['c' + j] = valor(i, j); });
        return f;
      }).concat([Object.assign({ nivel: T('Total'), total: totales.total, _total: true }, Object.fromEntries(r.niveles_columna.map((_, j) => ['c' + j, totales.col(j)])))]),
      notas: [],
    });
    return {
      titulo: T('Tabla de frecuencias de {a} × {b}', { a: r.fila, b: r.columna }), conclusiones,
      cuadros: [
        cuadro('conteos', T('Frecuencias de {a} × {b}', { a: r.fila, b: r.columna }), (i, j) => r.conteos[i][j], 'entero',
          { fila: i => r.total_fila[i], col: j => r.total_columna[j], total: r.total }),
        cuadro('pct-fila', T('Porcentaje dentro de cada {a}', { a: r.fila }), (i, j) => r.pct_fila[i][j], 'pct',
          { fila: () => 100, col: j => 100 * r.total_columna[j] / r.total, total: 100 }),
        cuadro('pct-columna', T('Porcentaje dentro de cada {b}', { b: r.columna }), (i, j) => r.pct_columna[i][j], 'pct',
          { fila: i => 100 * r.total_fila[i] / r.total, col: () => 100, total: 100 }),
        cuadro('pct-total', T('Porcentaje del total'), (i, j) => r.pct_total[i][j], 'pct',
          { fila: i => 100 * r.total_fila[i] / r.total, col: j => 100 * r.total_columna[j] / r.total, total: 100 }),
      ],
    };
  }
  SP.metodo({
    id: 'frecuencias', familia: 'descriptiva', motor: 'js',
    nombre: T('Tablas de frecuencias'),
    resumen: T('Conteos, porcentajes y acumulados de un factor, o la tabla cruzada de dos.'),
    entradas: { fila: { tipo: 'factor' }, columna: { tipo: 'factor', opcional: true } },
    opciones: { faltantes: { tipo: 'logico', omision: false } },
    validar(tabla, e) {
      if (!e.fila) throw new SP.ErrorSP(T('Elige la variable de la tabla.'));
      existe(tabla, e.fila);
      if (e.columna) { existe(tabla, e.columna); if (e.columna === e.fila) throw new SP.ErrorSP(T('Para la tabla cruzada elige dos variables distintas.')); }
    },
    calcular: calcularFrecuencias, reporte: reporteFrecuencias,
    codigoR(e, op) {
      op = op || {};
      const na = op.faltantes ? ', useNA = "ifany"' : '';
      if (!e.columna) return [
        '# Tabla de frecuencias (código R equivalente a SigmaPro)',
        `tabla <- table(datos$${e.fila}${na})`,
        'data.frame(tabla, porcentaje = 100 * prop.table(as.vector(tabla)),',
        '           acumulada = cumsum(as.vector(tabla)), porcentaje_acumulado = 100 * cumsum(prop.table(as.vector(tabla))))',
      ].join('\n');
      return [
        '# Tabla cruzada (código R equivalente a SigmaPro)',
        `tabla <- table(datos$${e.fila}, datos$${e.columna}${na})`,
        'addmargins(tabla)',
        'round(100 * prop.table(tabla, 1), 1)   # % dentro de cada fila',
        'round(100 * prop.table(tabla, 2), 1)   # % dentro de cada columna',
        'round(100 * prop.table(tabla), 1)      # % del total',
      ].join('\n');
    },
  });

  /* ======================= proporciones con su intervalo ======================= */
  function revisarProporciones(tabla, e, op) {
    const porConteos = !!(e.exitos || e.ensayos);
    if (porConteos) {
      if (!e.exitos || !e.ensayos) throw new SP.ErrorSP(T('Indica la columna de éxitos y la de ensayos (por ejemplo, semillas germinadas y semillas sembradas).'));
      existe(tabla, e.exitos); existe(tabla, e.ensayos);
      const x = tabla.col(e.exitos), n = tabla.col(e.ensayos);
      if (x.tipo !== 'numerica' || n.tipo !== 'numerica') throw new SP.ErrorSP(T('Éxitos y ensayos deben ser columnas numéricas.'));
      for (let i = 0; i < tabla.n; i++) {
        const a = x.valores[i], b = n.valores[i];
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        if (a < 0 || b < 0 || a !== Math.floor(a) || b !== Math.floor(b)) throw new SP.ErrorSP(T('Fila {i}: éxitos y ensayos deben ser enteros no negativos.', { i: i + 1 }));
        if (a > b) throw new SP.ErrorSP(T('Fila {i}: hay más éxitos ({a}) que ensayos ({b}).', { i: i + 1, a, b }));
      }
    } else {
      if (!e.categoria) throw new SP.ErrorSP(T('Elige la variable categórica, o las columnas de éxitos y ensayos.'));
      existe(tabla, e.categoria);
    }
    if (e.grupo) existe(tabla, e.grupo);
    if (!(op.nivel > 0 && op.nivel < 1)) throw new SP.ErrorSP(T('El nivel de confianza va entre 0 y 1 (por ejemplo 0.95).'));
    for (const m of lista(op.metodos)) if (!METODOS.includes(m)) throw new SP.ErrorSP(T('Método de intervalo desconocido: «{m}».', { m }));
  }
  function calcularProporciones(tabla, e, op) {
    const metodos = lista(op.metodos).length ? lista(op.metodos) : METODOS;
    const G = e.grupo ? comoFactor(tabla, e.grupo) : null;
    const out = { grupo: [], categoria: [], x: [], n: [], p: [] };
    for (const m of metodos) { out[m + '_inf'] = []; out[m + '_sup'] = []; }
    const agregar = (g, cat, x, n) => {
      out.grupo.push(g); out.categoria.push(cat); out.x.push(x); out.n.push(n); out.p.push(n > 0 ? x / n : NaN);
      for (const m of metodos) { const r = ic(x, n, op.nivel, m); out[m + '_inf'].push(r[0]); out[m + '_sup'].push(r[1]); }
    };
    const grupos = G ? G.niveles.map((nv, k) => ({ nv, k })) : [{ nv: '', k: -2 }];
    const enGrupo = (i, k) => k === -2 || (G && G.codigos[i] === k);
    let excluidas = 0;
    if (e.exitos) {
      const X = tabla.col(e.exitos).valores, N = tabla.col(e.ensayos).valores;
      for (let i = 0; i < tabla.n; i++) if (Number.isNaN(X[i]) || Number.isNaN(N[i]) || (G && G.codigos[i] < 0)) excluidas++;
      for (const g of grupos) {
        let x = 0, n = 0;
        for (let i = 0; i < tabla.n; i++) if (enGrupo(i, g.k) && !Number.isNaN(X[i]) && !Number.isNaN(N[i])) { x += X[i]; n += N[i]; }
        agregar(g.nv, e.exitos, x, n);
      }
    } else {
      const C = comoFactor(tabla, e.categoria);
      for (let i = 0; i < tabla.n; i++) if (C.codigos[i] < 0 || (G && G.codigos[i] < 0)) excluidas++;
      for (const g of grupos) {
        const cuenta = new Array(C.niveles.length).fill(0);
        let n = 0;
        for (let i = 0; i < tabla.n; i++) if (enGrupo(i, g.k) && C.codigos[i] >= 0) { cuenta[C.codigos[i]]++; n++; }
        C.niveles.forEach((nv, j) => agregar(g.nv, nv, cuenta[j], n));
      }
    }
    return { modo: e.exitos ? 'conteos' : 'categoria', nivel: op.nivel, metodos, grupo: e.grupo || null, excluidas, tabla: out };
  }
  function reporteProporciones(r) {
    const t = r.tabla, nv = Math.round(r.nivel * 100), m0 = r.metodos.includes('wilson') ? 'wilson' : r.metodos[0];
    const conclusiones = [];
    const nombreFila = i => [t.grupo[i], r.modo === 'categoria' ? T('«{c}»', { c: t.categoria[i] }) : ''].filter(Boolean).join(' · ') || T('Total');
    const muestra = Math.min(t.p.length, 4);
    for (let i = 0; i < muestra; i++) {
      conclusiones.push(T('{g}: {p} % ({x} de {n}); IC {nv} % de {m}: {a} a {b} %.', {
        g: nombreFila(i), p: fmt(100 * t.p[i], 1), x: t.x[i], n: t.n[i], nv, m: NOMBRES[m0], a: fmt(100 * t[m0 + '_inf'][i], 1), b: fmt(100 * t[m0 + '_sup'][i], 1),
      }));
    }
    if (t.p.length > muestra) conclusiones.push(t.p.length - muestra === 1 ? T('… y una proporción más en el cuadro.') : T('… y {k} proporciones más en el cuadro.', { k: t.p.length - muestra }));
    if (r.metodos.includes('wald') && t.n.some(n => n > 0 && n < 30)) conclusiones.push(T('Con menos de 30 ensayos, el intervalo de Wald no es confiable; usa el de Wilson o el exacto de Clopper-Pearson.'));
    if (r.excluidas) conclusiones.push(T('{k} filas con algún valor faltante no entran.', { k: r.excluidas }));
    const col = (clave, titulo, formato) => ({ clave, titulo, formato });
    const columnas = [
      ...(r.grupo ? [col('grupo', r.grupo, 'texto')] : []),
      ...(r.modo === 'categoria' ? [col('categoria', T('Categoría'), 'texto')] : []),
      col('x', r.modo === 'categoria' ? T('Frecuencia') : T('Éxitos'), 'entero'), col('n', 'n', 'entero'), col('p', T('Proporción (%)'), 'pct100'),
      ...r.metodos.map(m => col('ic_' + m, NOMBRES[m], 'intervalo100')),
    ];
    const filas = t.p.map((_, i) => {
      const f = { grupo: t.grupo[i], categoria: t.categoria[i], x: t.x[i], n: t.n[i], p: t.p[i] };
      for (const m of r.metodos) f['ic_' + m] = [t[m + '_inf'][i], t[m + '_sup'][i]];
      return f;
    });
    return {
      titulo: T('Proporciones con su intervalo de confianza al {nv} %', { nv }), conclusiones,
      cuadros: [{ id: 'proporciones', titulo: T('Proporciones (%) e intervalos de confianza al {nv} %', { nv }), columnas, filas,
        notas: [T('Wilson: puntaje de Wilson (1927); Clopper-Pearson: exacto por la distribución beta; Agresti-Coull (1998); Jeffreys: a posteriori con la previa beta(½, ½); Wald: aproximación normal, solo como referencia. Brown, Cai y DasGupta (2001) recomiendan el de Wilson o el de Jeffreys.')] }],
    };
  }
  SP.metodo({
    id: 'proporciones', familia: 'descriptiva', motor: 'js',
    nombre: T('Proporciones e intervalos de confianza'),
    resumen: T('Proporción de cada categoría, o de éxitos sobre ensayos (germinación, mortalidad, incidencia), con seis intervalos.'),
    entradas: { categoria: { tipo: 'factor', opcional: true }, exitos: { tipo: 'numerica', opcional: true }, ensayos: { tipo: 'numerica', opcional: true }, grupo: { tipo: 'factor', opcional: true } },
    opciones: { nivel: { tipo: 'numero', omision: 0.95 }, metodos: { tipo: 'lista', omision: METODOS.slice() } },
    validar: revisarProporciones, calcular: calcularProporciones, reporte: reporteProporciones,
    codigoR(e, op) {
      op = SP.opcionesCon(SP.metodos.proporciones, op);
      const nivel = op.nivel, z = `qnorm(${nR(1 - (1 - nivel) / 2)})`;
      const L = ['# Proporciones con sus intervalos (código R equivalente a SigmaPro)'];
      if (e.exitos) {
        L.push(e.grupo
          ? `agr <- aggregate(cbind(x = ${e.exitos}, n = ${e.ensayos}) ~ ${e.grupo}, data = datos, FUN = sum)`
          : `agr <- data.frame(x = sum(datos$${e.exitos}, na.rm = TRUE), n = sum(datos$${e.ensayos}, na.rm = TRUE))`);
      } else {
        L.push(e.grupo
          ? `agr <- as.data.frame(table(${e.grupo} = datos$${e.grupo}, categoria = datos$${e.categoria}), responseName = "x")\nagr$n <- ave(agr$x, agr$${e.grupo}, FUN = sum)`
          : `agr <- as.data.frame(table(categoria = datos$${e.categoria}), responseName = "x")\nagr$n <- sum(agr$x)`);
      }
      L.push(
        `z <- ${z}`,
        'ic <- t(mapply(function(x, n) {',
        '  w   <- prop.test(x, n, conf.level = ' + nivel + ', correct = FALSE)$conf.int        # Wilson',
        '  wcc <- prop.test(x, n, conf.level = ' + nivel + ')$conf.int                         # Wilson con corrección',
        '  cp  <- binom.test(x, n, conf.level = ' + nivel + ')$conf.int                        # Clopper-Pearson',
        '  nt <- n + z^2; pt <- (x + z^2 / 2) / nt                                  # Agresti-Coull',
        '  ac <- pmin(1, pmax(0, pt + c(-1, 1) * z * sqrt(pt * (1 - pt) / nt)))',
        `  je <- c(if (x == 0) 0 else qbeta(${nR((1 - nivel) / 2)}, x + 0.5, n - x + 0.5), if (x == n) 1 else qbeta(${nR(1 - (1 - nivel) / 2)}, x + 0.5, n - x + 0.5))   # Jeffreys`,
        '  wa <- pmin(1, pmax(0, x / n + c(-1, 1) * z * sqrt(x / n * (1 - x / n) / n)))   # Wald',
        '  c(p = x / n, wilson = w, wilson_cc = wcc, clopper_pearson = cp, agresti_coull = ac, jeffreys = je, wald = wa)',
        '}, agr$x, agr$n))',
        'cbind(agr, round(100 * ic, 2))');
      return L.join('\n');
    },
  });

  /* ======================= bondad de ajuste ji cuadrada ======================= */
  /** «9:3:3:1», «1 2 1» o «0.25, 0.5, 0.25» → [números]. */
  function leerProporciones(texto) {
    const p = String(texto).trim().split(/\s*[:;,\s]\s*/).filter(Boolean).map(s => SP.csv.aNumero(s, '.'));
    if (!p.length || p.some(v => !(v >= 0))) throw new SP.ErrorSP(T('Escribe las proporciones esperadas como números separados por «:» (por ejemplo 9:3:3:1).'));
    return p;
  }
  function calcularBondad(tabla, e, op) {
    const C = comoFactor(tabla, e.categoria), k = C.niveles.length;
    const obs = new Array(k).fill(0);
    let excluidas = 0;
    const W = e.conteo ? tabla.col(e.conteo).valores : null;
    for (let i = 0; i < tabla.n; i++) {
      const c = C.codigos[i];
      if (c < 0 || (W && Number.isNaN(W[i]))) { excluidas++; continue; }
      obs[c] += W ? W[i] : 1;
    }
    let p = lista(op.proporciones);
    if (typeof op.proporciones === 'string') p = leerProporciones(op.proporciones);
    if (!p.length) p = new Array(k).fill(1);
    if (p.length !== k) throw new SP.ErrorSP(T('Hay {k} categorías pero {m} proporciones esperadas.', { k, m: p.length }), T('Escribe una proporción por categoría, en el orden de los niveles: {n}.', { n: C.niveles.join(', ') }));
    const sp = p.reduce((s, v) => s + v, 0);
    if (!(sp > 0)) throw new SP.ErrorSP(T('Las proporciones esperadas suman cero.'));
    const prop = p.map(v => v / sp), n = obs.reduce((s, v) => s + v, 0);
    const esperado = prop.map(v => n * v);
    const contribucion = obs.map((o, j) => (o - esperado[j]) ** 2 / esperado[j]);
    const chi2 = SP.num.suma(contribucion), gl = k - 1;
    return {
      categoria: C.niveles, observado: obs, proporcion: prop, esperado,
      residuo: obs.map((o, j) => (o - esperado[j]) / sqrt(esperado[j])),
      residuo_estandarizado: obs.map((o, j) => (o - esperado[j]) / sqrt(n * prop[j] * (1 - prop[j]))),
      contribucion, chi2, gl, p: SP.dist.pchisq(chi2, gl, false), n, excluidas,
      min_esperado: Math.min(...esperado), celdas_bajas: esperado.filter(v => v < 5).length,
    };
  }
  function reporteBondad(r, ctx) {
    const alfa = (ctx && ctx.alfa) || 0.05;
    const iguales = r.proporcion.every(v => Math.abs(v - r.proporcion[0]) < 1e-12);
    const razon = ctx && ctx.textoProporciones ? T('la proporción {r}', { r: ctx.textoProporciones })
      : iguales ? T('proporciones iguales en las {k} categorías', { k: r.proporcion.length }) : T('la proporción {r}', { r: r.proporcion.map(v => fmt(v, 3)).join(' : ') });
    const pTexto = r.p < 0.001 ? '< 0.001' : '= ' + r.p.toFixed(3);
    const conclusiones = [r.p < alfa
      ? T('Las frecuencias observadas NO son compatibles con {r} (χ² = {c}, gl = {g}, p {p}).', { r: razon, c: fmt(r.chi2, 3), g: r.gl, p: pTexto })
      : T('Las frecuencias observadas son compatibles con {r} (χ² = {c}, gl = {g}, p {p}).', { r: razon, c: fmt(r.chi2, 3), g: r.gl, p: pTexto })];
    const j = r.residuo_estandarizado.reduce((a, v, i) => (abs(v) > abs(r.residuo_estandarizado[a]) ? i : a), 0);
    if (r.p < alfa) conclusiones.push(T('La mayor desviación está en «{c}»: {o} observados contra {e} esperados (residuo estandarizado {z}).',
      { c: r.categoria[j], o: r.observado[j], e: fmt(r.esperado[j], 1), z: fmt(r.residuo_estandarizado[j], 2) }));
    if (r.celdas_bajas) conclusiones.push(T('{k} categorías esperan menos de 5 observaciones: la aproximación ji cuadrada puede no ser buena; junta categorías o usa una prueba exacta.', { k: r.celdas_bajas }));
    const col = (clave, titulo, formato) => ({ clave, titulo, formato });
    return {
      titulo: T('Bondad de ajuste ji cuadrada'), conclusiones,
      cuadros: [{
        id: 'bondad', titulo: T('Frecuencias observadas y esperadas'),
        columnas: [col('categoria', T('Categoría'), 'texto'), col('observado', T('Observado'), 'num'), col('proporcion', T('Proporción esperada'), 'prop'),
          col('esperado', T('Esperado'), 'num2'), col('residuo_estandarizado', T('Residuo estandarizado'), 'forma2'), col('contribucion', T('Contribución a χ²'), 'forma')],
        filas: r.categoria.map((c, i) => ({ categoria: c, observado: r.observado[i], proporcion: r.proporcion[i], esperado: r.esperado[i], residuo_estandarizado: r.residuo_estandarizado[i], contribucion: r.contribucion[i] }))
          .concat([{ categoria: T('Total'), observado: r.n, proporcion: 1, esperado: r.n, contribucion: r.chi2, _total: true }]),
        notas: [T('χ² = {c}, gl = {g}, p {p}. Residuo estandarizado: (O − E)/√(n·p·(1 − p)); más de 2 en valor absoluto señala la categoría que más se aleja.', { c: fmt(r.chi2, 4), g: r.gl, p: pTexto })],
      }],
    };
  }
  SP.metodo({
    id: 'bondad-ajuste', familia: 'descriptiva', motor: 'js',
    nombre: T('Bondad de ajuste ji cuadrada'),
    resumen: T('¿Las frecuencias observadas siguen una proporción esperada? Por ejemplo, la segregación 9:3:3:1.'),
    entradas: { categoria: { tipo: 'factor' }, conteo: { tipo: 'numerica', opcional: true } },
    opciones: { proporciones: { tipo: 'lista', omision: [] } },
    validar(tabla, e) {
      if (!e.categoria) throw new SP.ErrorSP(T('Elige la variable con las categorías.'));
      existe(tabla, e.categoria);
      if (e.conteo) {
        existe(tabla, e.conteo);
        if (tabla.col(e.conteo).tipo !== 'numerica') throw new SP.ErrorSP(T('La columna de conteos debe ser numérica.'));
        if (Array.from(tabla.col(e.conteo).valores).some(v => v < 0)) throw new SP.ErrorSP(T('Hay conteos negativos.'));
      }
    },
    calcular: calcularBondad, reporte: reporteBondad,
    codigoR(e, op) {
      const p = typeof op.proporciones === 'string' ? leerProporciones(op.proporciones) : lista(op.proporciones);
      return [
        '# Bondad de ajuste ji cuadrada (código R equivalente a SigmaPro)',
        e.conteo ? `observado <- tapply(datos$${e.conteo}, datos$${e.categoria}, sum, na.rm = TRUE)` : `observado <- table(datos$${e.categoria})`,
        p.length ? `prueba <- chisq.test(observado, p = ${vec(p)}, rescale.p = TRUE)` : 'prueba <- chisq.test(observado)   # proporciones iguales',
        'prueba',
        'cbind(observado = prueba$observed, esperado = prueba$expected, residuo_estandarizado = prueba$stdres)',
      ].join('\n');
    },
  });
  SP.bondad = { leerProporciones };
});

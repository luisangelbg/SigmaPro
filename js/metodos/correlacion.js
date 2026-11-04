/* SigmaPro — correlación: Pearson, Spearman y Kendall con su prueba, matrices con p ajustados, parcial y semiparcial.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las pruebas siguen a cor.test de R:
     Pearson   t = r·√(n − 2)/√(1 − r²) con n − 2 gl; IC por la z de Fisher (atanh r ± z/√(n − 3)).
     Spearman  ρ = Pearson de los rangos; S = (n³ − n)(1 − ρ)/6. Sin empates, p exacto (n ≤ 9) o por la serie de
               Edgeworth (AS 89) hasta n = 1290; con empates o más datos, la t con n − 2 gl.
     Kendall   τ-b (con empates) por el algoritmo de Knight, O(n log n). Sin empates y n < 50, p exacto con el número
               de pares concordantes T; si no, la normal con la varianza corregida por empates.
   Parcial y semiparcial por residuos: la parcial es la correlación de los residuos de x y de y sobre los controles;
   la semiparcial, la de una variable con los residuos de la otra. Ambas con t de n − 2 − k gl (k controles), como
   el paquete ppcor de R. Con Spearman, todo sobre los rangos. */
SP.definir('correlacion', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, max, min, round, atanh, tanh, sign } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);
  Object.assign(SP.nombresFunciones, {
    'cor.pruebaDe': 'Correlación de Pearson, Spearman y Kendall con su prueba e intervalo',
    'cor.matrizDe': 'Matriz de correlaciones con valores p ajustados',
    'cor.parcialDe': 'Correlación parcial y semiparcial',
    'dist.pkendall': 'Kendall: distribución exacta del número de pares concordantes',
    'dist.prho': 'Spearman: distribución de S (exacta y serie de Edgeworth, AS 89)',
  });

  /* ---------------- coeficientes ---------------- */
  function media(v) { let s = 0; for (const x of v) s += x; let m = s / v.length, c = 0; for (const x of v) c += x - m; return m + c / v.length; }
  function pearson(x, y) {
    const mx = media(x), my = media(y);
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < x.length; i++) { const a = x[i] - mx, b = y[i] - my; sxx += a * a; syy += b * b; sxy += a * b; }
    const r = sxy / sqrt(sxx * syy);
    return r > 1 ? 1 : r < -1 ? -1 : r;
  }
  /** τ-b de Kendall por el algoritmo de Knight (1966): pares discordantes = inversiones de y con x ordenada. */
  function kendall(x, y) {
    const n = x.length, idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => (x[a] - x[b]) || (y[a] - y[b]));
    let n1 = 0, n3 = 0;
    for (let i = 0; i < n;) {
      let j = i + 1;
      while (j < n && x[idx[j]] === x[idx[i]]) j++;
      const t = j - i; n1 += t * (t - 1) / 2;
      for (let a = i; a < j;) { let b = a + 1; while (b < j && y[idx[b]] === y[idx[a]]) b++; const u = b - a; n3 += u * (u - 1) / 2; a = b; }
      i = j;
    }
    /* inversiones de y por mezcla (orden estable): cada par i < j con y_i > y_j es discordante */
    let v = Float64Array.from(idx, i => y[i]), aux = new Float64Array(n), inv = 0;
    for (let w = 1; w < n; w *= 2) {
      for (let lo = 0; lo < n; lo += 2 * w) {
        const mid = min(lo + w, n), hi = min(lo + 2 * w, n);
        let a = lo, b = mid, k = lo;
        while (a < mid && b < hi) { if (v[a] <= v[b]) aux[k++] = v[a++]; else { aux[k++] = v[b++]; inv += mid - a; } }
        while (a < mid) aux[k++] = v[a++];
        while (b < hi) aux[k++] = v[b++];
      }
      [v, aux] = [aux, v];
    }
    let n2 = 0;
    for (let i = 0; i < n;) { let j = i + 1; while (j < n && v[j] === v[i]) j++; const u = j - i; n2 += u * (u - 1) / 2; i = j; }
    const n0 = n * (n - 1) / 2, S = n0 - n1 - n2 + n3 - 2 * inv;
    return { tau: S / sqrt((n0 - n1) * (n0 - n2)), S };
  }
  const rangos = v => SP.sup.rangos(v);
  /* tamaños de los grupos de valores repetidos (table(x[duplicated(x)]) + 1 en R) */
  function empatesDe(v) {
    const m = new Map();
    for (const x of v) m.set(x, (m.get(x) || 0) + 1);
    return [...m.values()].filter(t => t > 1);
  }

  /**
   * Prueba de correlación como cor.test.
   * @param {object} op { metodo: 'pearson'|'spearman'|'kendall', alternativa: 'bilateral'|'mayor'|'menor', nivel, exacta: 'auto'|'no', continuidad }
   */
  function prueba(x, y, op) {
    op = Object.assign({ metodo: 'pearson', alternativa: 'bilateral', nivel: 0.95, exacta: 'auto', continuidad: false }, op || {});
    const n = x.length, alt = op.alternativa;
    const cola = (z, dist) => (alt === 'menor' ? dist(z, true) : alt === 'mayor' ? dist(z, false) : 2 * min(dist(z, true), dist(z, false)));
    const out = { metodo: op.metodo, n, alternativa: alt };
    if (op.metodo === 'pearson') {
      exigir(n >= 3, T('Pearson necesita al menos 3 pares de datos.'));
      const r = pearson(x, y), gl = n - 2, t = sqrt(gl) * r / sqrt(1 - r * r);
      exigir(Number.isFinite(r), T('Una de las variables es constante: no hay correlación que calcular.'));
      Object.assign(out, { estimado: r, estadistico: t, nombre: 't', gl, p: cola(t, (z, inf) => D().pt(z, gl, inf)) });
      if (n > 3) {
        const z = atanh(r), s = 1 / sqrt(n - 3);
        const ic = alt === 'menor' ? [-Infinity, z + s * D().qnorm(op.nivel)] : alt === 'mayor' ? [z - s * D().qnorm(op.nivel), Infinity] : [z - s * D().qnorm((1 + op.nivel) / 2), z + s * D().qnorm((1 + op.nivel) / 2)];
        out.ic = ic.map(v => (Number.isFinite(v) ? tanh(v) : v > 0 ? 1 : -1));
      }
      out.r2 = r * r;
      return out;
    }
    exigir(n >= 2, T('Hacen falta al menos 2 pares de datos.'));
    const empates = new Set(x).size < n || new Set(y).size < n;
    out.empates = empates;
    if (op.metodo === 'kendall') {
      const k = kendall(x, y), r = k.tau;
      exigir(Number.isFinite(r), T('Una de las variables es constante: no hay correlación que calcular.'));
      out.estimado = r;
      const exacta = op.exacta === 'no' ? false : n < 50;
      if (exacta && !empates) {
        const qv = round((r + 1) * n * (n - 1) / 4), pk = v => D().pkendall(v, n);
        Object.assign(out, { estadistico: qv, nombre: 'T', exacta: true,
          p: alt === 'mayor' ? 1 - pk(qv - 1) : alt === 'menor' ? pk(qv) : min(2 * (qv > n * (n - 1) / 4 ? 1 - pk(qv - 1) : pk(qv)), 1) });
      } else {
        const xt = empatesDe(x), yt = empatesDe(y), T0 = n * (n - 1) / 2;
        const T1 = xt.reduce((s, t) => s + t * (t - 1), 0) / 2, T2 = yt.reduce((s, t) => s + t * (t - 1), 0) / 2;
        let S = r * sqrt((T0 - T1) * (T0 - T2));
        const v0 = n * (n - 1) * (2 * n + 5), vt = xt.reduce((s, t) => s + t * (t - 1) * (2 * t + 5), 0), vu = yt.reduce((s, t) => s + t * (t - 1) * (2 * t + 5), 0);
        const v1 = xt.reduce((s, t) => s + t * (t - 1), 0) * yt.reduce((s, t) => s + t * (t - 1), 0);
        const v2 = xt.reduce((s, t) => s + t * (t - 1) * (t - 2), 0) * yt.reduce((s, t) => s + t * (t - 1) * (t - 2), 0);
        const varS = (v0 - vt - vu) / 18 + v1 / (2 * n * (n - 1)) + v2 / (9 * n * (n - 1) * (n - 2));
        if (op.continuidad) S = sign(S) * (abs(S) - 1);
        const z = S / sqrt(varS);
        Object.assign(out, { estadistico: z, nombre: 'z', exacta: false, p: cola(z, (zz, inf) => D().pnorm(zz, 0, 1, inf)) });
      }
      return out;
    }
    /* Spearman */
    const r = pearson(rangos(x), rangos(y));
    exigir(Number.isFinite(r), T('Una de las variables es constante: no hay correlación que calcular.'));
    const qv = (n * n * n - n) * (1 - r) / 6, exacta = op.exacta !== 'no' && !empates && n <= 1290;
    const ps = (qq, inferior) => {
      if (exacta) return D().prho(n, round(qq) + 2 * (inferior ? 1 : 0), inferior);
      let den = n * (n * n - 1) / 6;
      if (op.continuidad) den += 1;
      const rr = 1 - qq / den;
      return D().pt(rr / sqrt((1 - rr * rr) / (n - 2)), n - 2, !inferior);
    };
    Object.assign(out, { estimado: r, estadistico: qv, nombre: 'S', exacta,
      p: alt === 'mayor' ? ps(qv, true) : alt === 'menor' ? ps(qv, false) : min(2 * (qv > (n * n * n - n) / 6 ? ps(qv, false) : ps(qv, true)), 1) });
    return out;
  }

  /* ---------------- datos ---------------- */
  /** Filas completas en todas las columnas dadas: { filas, valores: { col: Float64Array } }. */
  function completas(tabla, cols) {
    const vs = cols.map(c => tabla.col(c).valores), filas = [];
    for (let i = 0; i < tabla.n; i++) if (vs.every(v => v[i] === v[i])) filas.push(i);
    const valores = {};
    cols.forEach((c, k) => { valores[c] = Float64Array.from(filas, i => vs[k][i]); });
    return { filas, valores };
  }

  function correlacion(tabla, e, op) {
    const d = completas(tabla, [e.x, e.y]), x = d.valores[e.x], y = d.valores[e.y];
    const r = prueba(x, y, op);
    /* los tres coeficientes, para compararlos */
    const comparar = ['pearson', 'spearman', 'kendall'].map(m => { try { const t = prueba(x, y, Object.assign({}, op, { metodo: m })); return { metodo: m, estimado: t.estimado, p: t.p }; } catch (err) { return { metodo: m, estimado: NaN, p: NaN }; } });
    /* recta de mínimos cuadrados para la gráfica */
    const mx = media(x), my = media(y);
    let sxx = 0, sxy = 0;
    for (let i = 0; i < x.length; i++) { sxx += (x[i] - mx) ** 2; sxy += (x[i] - mx) * (y[i] - my); }
    return Object.assign(r, { tipo: 'correlacion', x: e.x, y: e.y, excluidas: tabla.n - x.length, nivel: op.nivel, alfa: op.alfa, comparar,
      puntos: { x: Array.from(x), y: Array.from(y) }, recta: { pendiente: sxy / sxx, intercepto: my - sxy / sxx * mx } });
  }

  /**
   * Matriz de correlaciones. op.faltantes: 'completas' (las filas completas en todas) o 'pares' (cada par con sus
   * filas completas); op.ajuste: el de p.adjust sobre los m(m − 1)/2 pares.
   */
  function matriz(tabla, e, op) {
    op = Object.assign({ metodo: 'pearson', ajuste: 'holm', faltantes: 'completas', nivel: 0.95, exacta: 'auto' }, op || {});
    const vars = lista(e.variables), m = vars.length;
    const base = op.faltantes === 'pares' ? null : completas(tabla, vars);
    const r = vars.map(() => new Array(m).fill(NaN)), p = vars.map(() => new Array(m).fill(NaN)), nn = vars.map(() => new Array(m).fill(0));
    const pares = [];
    for (let i = 0; i < m; i++) {
      r[i][i] = 1;
      for (let j = i + 1; j < m; j++) {
        const d = base || completas(tabla, [vars[i], vars[j]]);
        const x = d.valores[vars[i]], y = d.valores[vars[j]];
        let t;
        try { t = prueba(x, y, op); } catch (err) { t = { estimado: NaN, p: NaN, n: x.length }; }
        r[i][j] = r[j][i] = t.estimado; p[i][j] = p[j][i] = t.p; nn[i][j] = nn[j][i] = t.n;
        pares.push({ i, j, a: vars[i], b: vars[j], r: t.estimado, p: t.p, n: t.n, ic: t.ic || null, estadistico: t.estadistico });
      }
    }
    const adj = SP.np.ajustarP(pares.map(x => x.p), op.ajuste);
    pares.forEach((x, k) => { x.p_ajustado = adj[k]; });
    for (let i = 0; i < m; i++) nn[i][i] = base ? base.filas.length : completas(tabla, [vars[i]]).filas.length;
    return { tipo: 'matriz', metodo: op.metodo, ajuste: op.ajuste, faltantes: op.faltantes, variables: vars, r, p, n: nn, pares, alfa: op.alfa, nivel: op.nivel,
      excluidas: base ? tabla.n - base.filas.length : 0 };
  }

  /** Residuos de v sobre [1, Z] (QR de Householder). */
  function residuos(Z, n, k, v) {
    const X = new Float64Array(n * (k + 1));
    X.fill(1, 0, n);
    Z.forEach((z, j) => X.set(z, (j + 1) * n));
    return SP.algebra.minimosCuadrados(X, n, k + 1, v, 1e-7).residuales;
  }
  function parcial(tabla, e, op) {
    op = Object.assign({ metodo: 'pearson' }, op || {});
    const ctrl = lista(e.controles), d = completas(tabla, [e.x, e.y, ...ctrl]), n = d.filas.length, k = ctrl.length;
    exigir(n - 2 - k >= 1, T('Hacen falta más datos ({n}) que variables más dos ({k}).', { n, k: k + 2 }));
    const val = c => (op.metodo === 'spearman' ? rangos(d.valores[c]) : d.valores[c]);
    const x = val(e.x), y = val(e.y), Z = ctrl.map(val);
    const ex = residuos(Z, n, k, x), ey = residuos(Z, n, k, y);
    /* si los controles determinan una variable, su residuo es ruido de redondeo: no hay parcial */
    const ss = v => { const m = media(v); let t = 0; for (const u of v) t += (u - m) ** 2; return t; };
    for (const [v, res, nom] of [[x, ex, e.x], [y, ey, e.y]]) exigir(ss(res) > 1e-12 * ss(v), T('«{c}» está determinada por los controles (es combinación lineal de ellos): no queda nada que correlacionar.', { c: nom }));
    const gl = n - 2 - k;
    const prueba1 = r => { const t = r * sqrt(gl / (1 - r * r)); return { r, t, gl, p: 2 * D().pt(-abs(t), gl, true) }; };
    const simple = pearson(x, y);
    const out = {
      tipo: 'parcial', metodo: op.metodo, x: e.x, y: e.y, controles: ctrl, n, excluidas: tabla.n - n, alfa: op.alfa,
      simple: Object.assign(prueba1(simple), { gl: n - 2, t: simple * sqrt((n - 2) / (1 - simple * simple)) }),
      parcial: prueba1(pearson(ex, ey)),
      semiparcial_x: prueba1(pearson(y, ex)),     // los controles se quitan solo de x
      semiparcial_y: prueba1(pearson(x, ey)),     // los controles se quitan solo de y
      residuos: { x: Array.from(ex), y: Array.from(ey) },
    };
    out.simple.p = 2 * D().pt(-abs(out.simple.t), n - 2, true);
    exigir(Number.isFinite(out.parcial.r), T('Una variable queda constante después de quitar los controles (está determinada por ellos).'));
    return out;
  }

  /* ---------------- atajos planos para las pruebas ---------------- */
  function pruebaDe(tabla, e, op) {
    const d = completas(tabla, [e.x, e.y]), r = prueba(d.valores[e.x], d.valores[e.y], op);
    return { estimado: r.estimado, estadistico: r.estadistico, gl: r.gl === undefined ? null : r.gl, p: r.p, ic: r.ic || null, n: r.n, exacta: r.exacta === undefined ? null : r.exacta };
  }
  const matrizDe = (tabla, e, op) => { const r = matriz(tabla, e, op); return { r: r.r, n: r.n, pares: r.pares.map(x => ({ r: x.r, p: x.p, p_ajustado: x.p_ajustado, n: x.n, ic: x.ic })) }; };
  const parcialDe = (tabla, e, op) => { const r = parcial(tabla, e, op); return { simple: r.simple, parcial: r.parcial, semiparcial_x: r.semiparcial_x, semiparcial_y: r.semiparcial_y, n: r.n }; };
  SP.cor = { pearson, kendall, prueba, correlacion, matriz, parcial, pruebaDe, matrizDe, parcialDe };

  /* ======================= métodos ======================= */
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const may = s => s.charAt(0).toUpperCase() + s.slice(1);
  const NOMBRE = { pearson: 'Pearson', spearman: 'Spearman', kendall: 'Kendall' };
  const SIMBOLO = { pearson: 'r', spearman: 'ρ', kendall: 'τ' };
  /* fuerza según Cohen (1988): 0.1 pequeña, 0.3 mediana, 0.5 grande */
  const fuerza = r => { const a = abs(r); return a < 0.1 ? T('despreciable') : a < 0.3 ? T('débil') : a < 0.5 ? T('moderada') : T('fuerte'); };
  const estrellas = p => (p < 0.001 ? '***' : p < 0.01 ? '**' : p < 0.05 ? '*' : '');
  const ALT = { bilateral: 'two.sided', mayor: 'greater', menor: 'less' };
  const RMET = { pearson: 'pearson', spearman: 'spearman', kendall: 'kendall' };

  function validarNumericas(tabla, cols) {
    for (const c of cols) {
      exigir(c && tabla.columnas[c], T('Falta elegir una variable.'));
      exigir(tabla.col(c).tipo === 'numerica', T('«{c}» debe ser numérica.', { c }));
    }
    exigir(new Set(cols).size === cols.length, T('Una variable está repetida.'));
  }
  const validarComun = op => {
    exigir(['pearson', 'spearman', 'kendall'].includes(op.metodo), T('Coeficiente desconocido: {m}.', { m: op.metodo }));
    exigir(op.nivel > 0.5 && op.nivel < 1, T('El nivel de confianza va entre 0.5 y 1.'));
    exigir(op.alfa > 0 && op.alfa < 0.5, T('El nivel de significancia va entre 0 y 0.5.'));
  };

  function reporteCorrelacion(r) {
    const a = r.alfa, s = SIMBOLO[r.metodo], conclusiones = [], cuadros = [];
    const sentido = r.estimado >= 0 ? T('positiva') : T('negativa');
    const ic = r.ic ? T(' (IC {c} %: {i} a {s})', { c: Math.round(100 * r.nivel), i: f3(r.ic[0]), s: f3(r.ic[1]) }) : '';
    conclusiones.push(r.p < a
      ? T('Correlación {s} {f} y significativa entre «{x}» y «{y}»: {sim} = {v}{ic}, p {p}.', { s: sentido, f: fuerza(r.estimado), x: r.x, y: r.y, sim: s, v: f3(r.estimado), ic, p: fp(r.p) })
      : T('No hay evidencia de correlación entre «{x}» y «{y}»: {sim} = {v}{ic}, p {p}.', { x: r.x, y: r.y, sim: s, v: f3(r.estimado), ic, p: fp(r.p) }));
    if (r.metodo === 'pearson') conclusiones.push(T('Las dos variables comparten el {v} % de su variación (r² = {r2}). Pearson mide la relación lineal; si la nube es curva o hay valores extremos, usa Spearman.', { v: (100 * r.r2).toFixed(1), r2: r.r2.toFixed(3) }));
    else conclusiones.push(T('{m} mide si las variables crecen juntas (relación monótona), con los rangos de los datos: no supone normalidad y resiste a los valores extremos.', { m: NOMBRE[r.metodo] }));
    if (r.exacta === false && r.metodo !== 'pearson' && r.empates) conclusiones.push(T('Hay empates: el valor p es aproximado (sin empates y con pocos datos sería exacto).'));
    const est = r.nombre === 't' ? `t = ${f3(r.estadistico)}, gl = ${r.gl}` : r.nombre === 'z' ? `z = ${f3(r.estadistico)}` : `${r.nombre} = ${Number.isInteger(r.estadistico) ? r.estadistico : f3(r.estadistico)}`;
    cuadros.push({ id: 'prueba', titulo: T('Correlación de {m} entre «{x}» y «{y}»', { m: NOMBRE[r.metodo], x: r.x, y: r.y }),
      columnas: [col('medida', T('Medida'), 'texto'), col('valor', T('Valor'), 'texto')],
      filas: [{ medida: T('Coeficiente ({s})', { s }), valor: f3(r.estimado) }].concat(r.ic ? [{ medida: T('IC {c} %', { c: Math.round(100 * r.nivel) }), valor: `${f3(r.ic[0])} – ${f3(r.ic[1])}` }] : [])
        .concat([{ medida: T('Estadístico'), valor: est }, { medida: T('Valor p'), valor: fp(r.p).replace('= ', '') },
          { medida: T('Cálculo del p'), valor: r.metodo === 'pearson' ? T('t de Student') : r.exacta ? T('exacto') : r.metodo === 'kendall' ? T('normal (con corrección por empates)') : T('t de Student (aproximado)') },
          { medida: T('Pares de datos'), valor: String(r.n) }]),
      notas: [T('Hipótesis alternativa: {h}.', { h: { bilateral: T('correlación distinta de cero'), mayor: T('correlación positiva'), menor: T('correlación negativa') }[r.alternativa] })].concat(r.excluidas ? [T('{k} filas con algún faltante no entran.', { k: r.excluidas })] : []) });
    cuadros.push({ id: 'comparar', titulo: T('Los tres coeficientes'), columnas: [col('m', T('Coeficiente'), 'texto'), col('v', T('Valor'), 'forma'), col('p', 'p', 'pvalor')],
      filas: r.comparar.map(c => ({ m: `${NOMBRE[c.metodo]} (${SIMBOLO[c.metodo]})`, v: c.estimado, p: c.p })),
      notas: [T('Si Pearson y Spearman difieren mucho, la relación no es lineal o hay valores que pesan demasiado.')] });
    return { titulo: T('Correlación de {m}', { m: NOMBRE[r.metodo] }), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoCorrelacion(e, op) {
    const ex = op.exacta === 'no' ? ', exact = FALSE' : '', co = op.continuidad && op.metodo !== 'pearson' ? ', continuity = TRUE' : '';
    return ['# Correlación (código R equivalente a SigmaPro)',
      `(prueba <- cor.test(datos$${q(e.x)}, datos$${q(e.y)}, method = "${RMET[op.metodo]}", alternative = "${ALT[op.alternativa]}", conf.level = ${op.nivel}${ex}${co}))`,
      `cor(datos[c("${e.x}", "${e.y}")], use = "complete.obs", method = "spearman")   # los otros coeficientes: "pearson", "kendall"`].join('\n');
  }

  function reporteMatriz(r) {
    const a = r.alfa, s = SIMBOLO[r.metodo], vars = r.variables, conclusiones = [], cuadros = [];
    const sig = r.pares.filter(x => x.p_ajustado < a).sort((x, y) => abs(y.r) - abs(x.r));
    conclusiones.push(sig.length
      ? T('{k} de {m} pares de variables tienen correlación significativa (p ajustado por {aj} < {a}).', { k: sig.length, m: r.pares.length, aj: AJ[r.ajuste], a })
      : T('Ningún par tiene correlación significativa con el ajuste de {aj}.', { aj: AJ[r.ajuste] }));
    if (sig.length) conclusiones.push(T('La más fuerte: «{a}» con «{b}», {s} = {v}.', { a: sig[0].a, b: sig[0].b, s, v: f3(sig[0].r) }));
    const filas = vars.map((v, i) => Object.assign({ variable: v }, Object.fromEntries(vars.map((_, j) => ['c' + j, j < i ? f3(r.r[i][j]) + estrellas(r.pares.find(x => x.i === j && x.j === i).p_ajustado) : j === i ? '1' : '']))));
    cuadros.push({ id: 'matriz', titulo: T('Matriz de correlaciones de {m}', { m: NOMBRE[r.metodo] }), columnas: [col('variable', '', 'texto')].concat(vars.map((v, j) => col('c' + j, v, 'texto'))),
      filas, notas: [T('* p < 0.05; ** p < 0.01; *** p < 0.001, con el ajuste de {aj} para {m} comparaciones.', { aj: AJ[r.ajuste], m: r.pares.length })]
        .concat(r.faltantes === 'pares' ? [T('Cada par usa sus filas completas (el n de cada par está en el cuadro 2).')] : r.excluidas ? [T('{k} filas con algún faltante no entran.', { k: r.excluidas })] : []) });
    cuadros.push({ id: 'pares', titulo: T('Cada par de variables'),
      columnas: [col('a', T('Variable 1'), 'texto'), col('b', T('Variable 2'), 'texto'), col('r', s, 'forma')].concat(r.metodo === 'pearson' ? [col('ic', T('IC {c} %', { c: Math.round(100 * r.nivel) }), 'intervaloSig')] : [])
        .concat([col('p', 'p', 'pvalor'), col('pa', T('p ajustado'), 'pvalor'), col('n', 'n', 'entero')]),
      filas: r.pares.map(x => ({ a: x.a, b: x.b, r: x.r, ic: x.ic, p: x.p, pa: x.p_ajustado, n: x.n })), notas: [] });
    return { titulo: T('Matriz de correlaciones'), conclusiones: conclusiones.map(may), cuadros };
  }
  const AJ = { holm: 'Holm', bonferroni: 'Bonferroni', BH: 'Benjamini-Hochberg', ninguno: T('ninguno (sin ajuste)') };
  const RAJ = { holm: 'holm', bonferroni: 'bonferroni', BH: 'BH', ninguno: 'none' };
  function codigoMatriz(e, op) {
    const vars = lista(e.variables), uso = op.faltantes === 'pares' ? 'pairwise.complete.obs' : 'complete.obs';
    return ['# Matriz de correlaciones (código R equivalente a SigmaPro)',
      `d <- datos[c(${vars.map(v => JSON.stringify(v)).join(', ')})]` + (op.faltantes === 'pares' ? '' : '\nd <- na.omit(d)   # las filas completas en todas las variables'),
      `(r <- cor(d, use = "${uso}", method = "${RMET[op.metodo]}"))`,
      'pares <- combn(names(d), 2)',
      `p <- apply(pares, 2, function(v) cor.test(d[[v[1]]], d[[v[2]]], method = "${RMET[op.metodo]}"${op.exacta === 'no' ? ', exact = FALSE' : ''})$p.value)`,
      `data.frame(t(pares), p = p, p.ajustado = p.adjust(p, "${RAJ[op.ajuste]}"))`].join('\n');
  }

  function reporteParcial(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], ctrl = r.controles.join(', ');
    const pr = r.parcial;
    conclusiones.push(pr.p < a
      ? T('Descontando el efecto de {c}, «{x}» y «{y}» siguen correlacionadas: correlación parcial = {v} (t = {t}, gl = {g}, p {p}).', { c: ctrl, x: r.x, y: r.y, v: f3(pr.r), t: f3(pr.t), g: pr.gl, p: fp(pr.p) })
      : T('Descontando el efecto de {c}, «{x}» y «{y}» ya no se correlacionan: correlación parcial = {v} (p {p}).', { c: ctrl, x: r.x, y: r.y, v: f3(pr.r), p: fp(pr.p) }));
    conclusiones.push(T('Sin controlar, la correlación es {v}: {cmp}.', { v: f3(r.simple.r), cmp: abs(pr.r) < abs(r.simple.r) - 0.1 ? T('parte de la relación se debe a {c}', { c: ctrl }) : abs(pr.r) > abs(r.simple.r) + 0.1 ? T('{c} ocultaba parte de la relación', { c: ctrl }) : T('los controles casi no la cambian') }));
    conclusiones.push(T('La semiparcial al cuadrado ({v}) es la parte de la variación de «{y}» que «{x}» explica por sí sola, además de {c}.', { v: (r.semiparcial_x.r ** 2).toFixed(3), y: r.y, x: r.x, c: ctrl }));
    const fila = (nombre, z) => ({ medida: nombre, r: z.r, t: z.t, gl: z.gl, p: z.p });
    cuadros.push({ id: 'parcial', titulo: T('Correlaciones de «{x}» y «{y}» ({m})', { x: r.x, y: r.y, m: NOMBRE[r.metodo] }),
      columnas: [col('medida', T('Correlación'), 'texto'), col('r', T('Valor'), 'forma'), col('t', 't', 'forma2'), col('gl', T('gl'), 'entero'), col('p', 'p', 'pvalor')],
      filas: [fila(T('Simple'), r.simple), fila(T('Parcial (controles quitados de las dos)'), r.parcial), fila(T('Semiparcial: «{y}» con «{x}» sin los controles', { x: r.x, y: r.y }), r.semiparcial_x),
        fila(T('Semiparcial: «{x}» con «{y}» sin los controles', { x: r.x, y: r.y }), r.semiparcial_y)],
      notas: [T('Controles: {c}. Pruebas t con n − 2 − k grados de libertad (k = {k} controles), como el paquete ppcor.', { c: ctrl, k: r.controles.length })].concat(r.metodo === 'spearman' ? [T('Spearman: las mismas fórmulas sobre los rangos de cada variable.')] : [])
        .concat(r.excluidas ? [T('{k} filas con algún faltante no entran.', { k: r.excluidas })] : []) });
    return { titulo: T('Correlación parcial y semiparcial'), conclusiones: conclusiones.map(may), cuadros };
  }
  function codigoParcial(e, op) {
    const ctrl = lista(e.controles), vars = [e.x, e.y, ...ctrl], rk = op.metodo === 'spearman';
    return ['# Correlación parcial y semiparcial (código R equivalente a SigmaPro)',
      `d <- na.omit(datos[c(${vars.map(v => JSON.stringify(v)).join(', ')})])` + (rk ? '\nd[] <- lapply(d, rank)   # Spearman: todo sobre los rangos' : ''),
      `ex <- residuals(lm(${q(e.x)} ~ ${ctrl.map(q).join(' + ')}, data = d))   # x sin los controles`,
      `ey <- residuals(lm(${q(e.y)} ~ ${ctrl.map(q).join(' + ')}, data = d))   # y sin los controles`,
      `gl <- nrow(d) - 2 - ${ctrl.length}`,
      'prueba <- function(r) c(r = r, t = r * sqrt(gl / (1 - r^2)), p = 2 * pt(-abs(r * sqrt(gl / (1 - r^2))), gl))',
      `prueba(cor(ex, ey))          # parcial`,
      `prueba(cor(d$${q(e.y)}, ex))    # semiparcial: y con x sin los controles`,
      `prueba(cor(d$${q(e.x)}, ey))    # semiparcial: x con y sin los controles`,
      '# también: ppcor::pcor.test(...) y ppcor::spcor.test(...)'].join('\n');
  }

  const OPC = { metodo: { tipo: 'texto', omision: 'pearson' }, alternativa: { tipo: 'texto', omision: 'bilateral' }, nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 },
    exacta: { tipo: 'texto', omision: 'auto' }, continuidad: { tipo: 'logico', omision: false } };
  SP.metodo({
    id: 'correlacion', familia: 'correlacion', motor: 'js', orden: 0, nombre: T('Correlación de dos variables'),
    resumen: T('Pearson con su intervalo, Spearman y Kendall (exactos sin empates), con la prueba y la gráfica de dispersión.'),
    entradas: { x: { tipo: 'numerica' }, y: { tipo: 'numerica' } }, opciones: OPC,
    validar: (tabla, e, op) => { validarNumericas(tabla, [e.x, e.y]); validarComun(op); exigir(['bilateral', 'mayor', 'menor'].includes(op.alternativa), T('Hipótesis alternativa no válida.')); },
    calcular: correlacion, reporte: reporteCorrelacion, codigoR: codigoCorrelacion,
  });
  SP.metodo({
    id: 'matriz-correlacion', familia: 'correlacion', motor: 'js', orden: 1, nombre: T('Matriz de correlaciones'),
    resumen: T('Todas las correlaciones entre varias variables, con valores p ajustados (Holm, Bonferroni o Benjamini-Hochberg) y el mapa de calor.'),
    entradas: { variables: { tipo: 'numerica+', maximo: 30 } }, opciones: Object.assign({}, OPC, { ajuste: { tipo: 'texto', omision: 'holm' }, faltantes: { tipo: 'texto', omision: 'completas' } }),
    validar: (tabla, e, op) => {
      const vs = lista(e.variables);
      exigir(vs.length >= 2 && vs.length <= 30, T('Elige de 2 a 30 variables.'));
      validarNumericas(tabla, vs); validarComun(op);
      exigir(SP.np.AJUSTES.includes(op.ajuste), T('Ajuste desconocido: {m}.', { m: op.ajuste }));
      exigir(['completas', 'pares'].includes(op.faltantes), T('Manejo de faltantes no válido.'));
    },
    calcular: matriz, reporte: reporteMatriz, codigoR: codigoMatriz,
  });
  SP.metodo({
    id: 'correlacion-parcial', familia: 'correlacion', motor: 'js', orden: 2, nombre: T('Correlación parcial y semiparcial'),
    resumen: T('La correlación de dos variables con otras mantenidas constantes, y la parte que aporta cada una por sí sola.'),
    entradas: { x: { tipo: 'numerica' }, y: { tipo: 'numerica' }, controles: { tipo: 'numerica+', maximo: 10 } },
    opciones: { metodo: { tipo: 'texto', omision: 'pearson' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (tabla, e, op) => {
      const c = lista(e.controles);
      exigir(c.length >= 1 && c.length <= 10, T('Elige de 1 a 10 variables de control.'));
      validarNumericas(tabla, [e.x, e.y, ...c]);
      exigir(['pearson', 'spearman'].includes(op.metodo), T('La parcial usa Pearson o Spearman.'));
      exigir(op.alfa > 0 && op.alfa < 0.5, T('El nivel de significancia va entre 0 y 0.5.'));
    },
    calcular: parcial, reporte: reporteParcial, codigoR: codigoParcial,
  });
});

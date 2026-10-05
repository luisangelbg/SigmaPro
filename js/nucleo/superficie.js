/* SigmaPro — superficies de respuesta: modelo de primer o segundo orden, falta de ajuste, análisis canónico, punto
   estacionario, cresta y ascenso más pronunciado.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Codificación: z = (x − centro) / paso. Con cinco niveles simétricos (central compuesto) el centro es el nivel del
   medio y el paso, la mitad de la distancia entre el segundo y el cuarto (los axiales quedan en ±α); si no, el punto
   medio y la mitad del rango. Datos ya codificados (−1, 0, 1 o −α … α) quedan igual.
   Columnas en el orden de la metodología: intercepto, bloques (contrastes de tratamiento), primer orden z_j,
   interacciones z_i·z_j (i < j) y cuadráticos puros z_j². El ANOVA es secuencial por grupos de términos (los efectos
   Qᵀy de la QR) y la falta de ajuste se prueba contra el error puro de y ~ bloque + combinación de x.
   Canónico: b (primer orden) y B (cuadráticos en la diagonal, interacciones / 2 fuera); punto estacionario −½·B⁻¹b;
   valores y vectores propios de B por Jacobi, cada vector con su primer componente no despreciable positivo.
   Cresta (Hoerl 1959; Draper 1963): para cada radio r, x(μ) = ½·(μI − B)⁻¹b con μ > λ_max (máximo) o μ < λ_min
   (mínimo) y ‖x‖ = r; μ por el método de Brent. Primer orden: ascenso más pronunciado r·b/‖b‖.
   Las predicciones promedian los bloques. Coeficientes en unidades originales por la transformación lineal exacta
   (con su matriz de covarianzas A·V·Aᵀ). Referencia: tests/r/superficie.R (R base). */
SP.definir('superficie', function (SP) {
  'use strict';
  const T = SP.T;
  const { abs, sqrt, log, ceil, max } = Math;

  /** Centro y paso de un factor. */
  function codificacion(x) {
    const u = [...new Set(x)].sort((a, b) => a - b), r = u[u.length - 1] - u[0];
    if (u.length === 5 && abs((u[0] + u[4]) - (u[1] + u[3])) <= 1e-6 * r && abs((u[1] + u[3]) - 2 * u[2]) <= 1e-6 * r) return { centro: u[2], paso: (u[3] - u[1]) / 2 };
    return { centro: (u[0] + u[u.length - 1]) / 2, paso: r / 2 };
  }

  /** Valores y vectores propios de una matriz simétrica k × k (filas), por Jacobi cíclico; valores de mayor a menor. */
  function propios(A) {
    const k = A.length, a = A.map(f => f.slice()), V = A.map((_, i) => A.map((_, j) => (i === j ? 1 : 0)));
    for (let barrido = 0; barrido < 100; barrido++) {
      let fuera = 0;
      for (let p = 0; p < k; p++) for (let q = p + 1; q < k; q++) fuera += a[p][q] * a[p][q];
      if (fuera === 0 || fuera < 1e-300) break;
      for (let p = 0; p < k - 1; p++) for (let q = p + 1; q < k; q++) {
        if (a[p][q] === 0) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = (th >= 0 ? 1 : -1) / (abs(th) + sqrt(th * th + 1)), c = 1 / sqrt(t * t + 1), s = t * c;
        for (let r = 0; r < k; r++) { const arp = a[r][p], arq = a[r][q]; a[r][p] = c * arp - s * arq; a[r][q] = s * arp + c * arq; }
        for (let r = 0; r < k; r++) { const apr = a[p][r], aqr = a[q][r]; a[p][r] = c * apr - s * aqr; a[q][r] = s * apr + c * aqr; }
        for (let r = 0; r < k; r++) { const vp = V[r][p], vq = V[r][q]; V[r][p] = c * vp - s * vq; V[r][q] = s * vp + c * vq; }
      }
    }
    const orden = Array.from({ length: k }, (_, j) => j).sort((i, j) => a[j][j] - a[i][i]);
    const valores = orden.map(j => a[j][j]), vectores = orden.map(j => {
      const v = V.map(f => f[j]), i = v.findIndex(x => abs(x) > 1e-6);
      return v[i] < 0 ? v.map(x => -x) : v;
    });
    return { valores, vectores };   // vectores[j] = j-ésimo vector propio
  }

  /** Las columnas del modelo (sin intercepto ni bloques) a partir de las variables (codificadas o no). */
  function columnas(Z, orden) {
    const k = Z.length, n = Z[0].length, pares = [];
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) pares.push([i, j]);
    return {
      pares: orden === 'primer' ? [] : pares,
      FO: Z,
      TWI: orden === 'primer' ? [] : pares.map(([i, j]) => Float64Array.from({ length: n }, (_, r) => Z[i][r] * Z[j][r])),
      PQ: orden === 'segundo' ? Z.map(z => Float64Array.from(z, v => v * v)) : [],
    };
  }

  /** Mínimos cuadrados con su matriz de covarianzas sin escalar en el orden original. */
  function ajustarLM(cols, n, y) {
    const p = cols.length, X = new Float64Array(n * p);
    cols.forEach((c, j) => X.set(c, j * n));
    const mc = SP.algebra.minimosCuadrados(X, n, p, Float64Array.from(y), 1e-7);
    return Object.assign(mc, { p, X });
  }
  function covarianzas(mc) {
    const k = mc.qr.rango, Vp = SP.algebra.rtrInversa(mc.qr), p = mc.p, V = Array.from({ length: p }, () => new Float64Array(p));
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) V[mc.qr.pivote[a]][mc.qr.pivote[b]] = Vp[a + b * k];
    return V;
  }

  /**
   * analizar({ y, x: [columnas numéricas], nombres, bloque: { codigos, niveles } | null, orden, objetivo, nivel, codificacion })
   * Las filas ya vienen completas. codificacion = { centros, pasos } fija la codificación a mano (si no, la del diseño).
   */
  function analizar(o) {
    const y = o.y, n = y.length, k = o.x.length, nombres = o.nombres, orden = o.orden, nivel = o.nivel || 0.95;
    const cod = o.codificacion ? o.codificacion.centros.map((c, j) => ({ centro: c, paso: o.codificacion.pasos[j] })) : o.x.map(codificacion);
    cod.forEach((c, j) => { if (!(c.paso > 0)) throw new SP.ErrorSP(T('«{f}» tiene un solo valor: no es un factor del diseño.', { f: nombres[j] })); });
    const Z = o.x.map((x, j) => Float64Array.from(x, v => (v - cod[j].centro) / cod[j].paso));
    const cz = columnas(Z, orden), uno = new Float64Array(n).fill(1);
    const B0 = o.bloque ? o.bloque.niveles.length : 0, nb = max(0, B0 - 1);
    const bloques = Array.from({ length: nb }, (_, h) => Float64Array.from(o.bloque.codigos, c => (c === h + 1 ? 1 : 0)));
    const cols = [uno].concat(bloques, cz.FO, cz.TWI, cz.PQ), p = cols.length;
    const nombreCol = ['(Intercepto)'].concat(o.bloque ? o.bloque.niveles.slice(1).map(l => o.bloque.nombre + l) : [], nombres,
      cz.pares.map(([i, j]) => nombres[i] + ':' + nombres[j]), cz.PQ.length ? nombres.map(f => f + '^2') : []);
    if (n <= p) throw new SP.ErrorSP(T('Faltan datos: el modelo tiene {p} coeficientes y hay {n} observaciones.', { p, n }), T('Hacen falta más puntos que coeficientes para estimar el error.'));
    const mc = ajustarLM(cols, n, y);
    if (mc.qr.rango < p) throw new SP.ErrorSP(T('El diseño no permite estimar el modelo de {o}.', { o: orden === 'segundo' ? T('segundo orden') : orden === 'interacciones' ? T('primer orden con interacciones') : T('primer orden') }),
      T('El segundo orden necesita al menos tres niveles por factor (por ejemplo, un central compuesto o un Box-Behnken).'));
    const gl = n - p, scr = mc.scResidual, s2 = scr / gl, Vu = covarianzas(mc), coef = Array.from(mc.coeficientes);
    const ee = coef.map((_, j) => sqrt(s2 * Vu[j][j])), tv = coef.map((b, j) => b / ee[j]);
    const pv = tv.map(t => 2 * SP.dist.pt(abs(t), gl, false));
    /* ANOVA secuencial por grupos */
    const grupos = [[T('Bloques'), nb], [T('Primer orden'), cz.FO.length], [T('Interacciones'), cz.TWI.length], [T('Cuadráticos puros'), cz.PQ.length]].filter(g => g[1] > 0);
    const posicion = new Int32Array(p);
    mc.qr.pivote.forEach((j, jp) => { posicion[j] = jp; });
    const anova = { fuente: [], gl: [], sc: [], cm: [], F: [], p: [] };
    const fila = (f, g, sc, F, pp) => { anova.fuente.push(f); anova.gl.push(g); anova.sc.push(sc); anova.cm.push(sc / g); anova.F.push(F); anova.p.push(pp); };
    let desde = 1;
    for (const [f, g] of grupos) {
      let sc = 0;
      for (let j = desde; j < desde + g; j++) sc += mc.efectos[posicion[j]] ** 2;
      const F = (sc / g) / s2;
      fila(f, g, sc, F, SP.dist.pf(F, g, gl, false));
      desde += g;
    }
    fila(T('Residuo'), gl, scr, NaN, NaN);
    /* falta de ajuste contra el error puro de y ~ [bloque +] combinación de x. Sin bloques es la suma de cuadrados
       dentro de cada combinación (una pasada); con bloques, el modelo por celdas de SP.lineal (que agrupa las filas
       iguales). Con más de 5000 combinaciones y bloques casi no hay repeticiones: la prueba se omite. */
    const clave = Array.from({ length: n }, (_, r) => o.x.map(x => x[r]).join('|')), mapa = new Map();
    for (const c of clave) if (!mapa.has(c)) mapa.set(c, mapa.size);
    let glpe = 0, scpe = 0;
    if (!o.bloque) {
      const G = mapa.size, sum = new Float64Array(G), cnt = new Float64Array(G), cod = clave.map(c => mapa.get(c));
      for (let r = 0; r < n; r++) { sum[cod[r]] += y[r]; cnt[cod[r]]++; }
      for (let r = 0; r < n; r++) scpe += (y[r] - sum[cod[r]] / cnt[cod[r]]) ** 2;
      glpe = n - G;
    } else if (mapa.size <= 5000) {
      const mpe = SP.lineal.ajustar(SP.tabla.crear({ y: Array.from(y), c: clave, b: Array.from(o.bloque.codigos, k => 'b' + k) }, { c: { tipo: 'factor' }, b: { tipo: 'factor' } }), 'y ~ b + c');
      glpe = mpe.glResidual; scpe = mpe.scResidual;
    }
    const gllof = gl - glpe;
    let falta = null;
    if (glpe > 0 && gllof > 0) {
      const F = ((scr - scpe) / gllof) / (scpe / glpe);
      falta = { F, gl1: gllof, gl2: glpe, p: SP.dist.pf(F, gllof, glpe, false) };
      fila(T('Falta de ajuste'), gllof, scr - scpe, F, falta.p);
      fila(T('Error puro'), glpe, scpe, NaN, NaN);
    }
    let media = 0;
    for (const v of y) media += v;
    media /= n;
    let sct = 0;
    for (const v of y) sct += (v - media) ** 2;
    const ajuste = { n, gl, sigma: sqrt(s2), r2: 1 - scr / sct, r2_ajustada: 1 - (scr / gl) / (sct / (n - 1)) };
    /* unidades originales: β_nat = A·β */
    const A = Array.from({ length: p }, (_, i) => new Float64Array(p)), c0 = cod.map(c => c.centro), sp = cod.map(c => c.paso);
    const iFO = j => 1 + nb + j, iTW = r => 1 + nb + k + r, iPQ = j => 1 + nb + k + cz.pares.length + j;
    A[0][0] = 1;
    for (let h = 1; h <= nb; h++) A[h][h] = 1;
    for (let j = 0; j < k; j++) { A[iFO(j)][iFO(j)] = 1 / sp[j]; A[0][iFO(j)] = -c0[j] / sp[j]; }
    cz.pares.forEach(([i, j], r) => {
      const d = sp[i] * sp[j];
      A[iTW(r)][iTW(r)] = 1 / d; A[iFO(i)][iTW(r)] = -c0[j] / d; A[iFO(j)][iTW(r)] = -c0[i] / d; A[0][iTW(r)] = c0[i] * c0[j] / d;
    });
    if (cz.PQ.length) for (let j = 0; j < k; j++) { const d = sp[j] * sp[j]; A[iPQ(j)][iPQ(j)] = 1 / d; A[iFO(j)][iPQ(j)] = -2 * c0[j] / d; A[0][iPQ(j)] = c0[j] * c0[j] / d; }
    const nat = A.map(f => f.reduce((s, v, j) => s + v * coef[j], 0));
    const eeN = A.map(f => { let s = 0; for (let a = 0; a < p; a++) if (f[a]) for (let b = 0; b < p; b++) if (f[b]) s += f[a] * Vu[a][b] * f[b]; return sqrt(s2 * s); });
    const tN = nat.map((b, j) => b / eeN[j]);
    /* predicción con los bloques promediados */
    const filaPred = z => [1].concat(Array(nb).fill(1 / (nb + 1)), z, cz.pares.map(([i, j]) => z[i] * z[j]), cz.PQ.length ? z.map(v => v * v) : []);
    const predecir = z => {
      const a = filaPred(z);
      let v = 0, s = 0;
      for (let i = 0; i < p; i++) { v += a[i] * coef[i]; for (let j = 0; j < p; j++) s += a[i] * Vu[i][j] * a[j]; }
      return [v, sqrt(s2 * s)];
    };
    const b = coef.slice(1 + nb, 1 + nb + k), B = Array.from({ length: k }, () => new Array(k).fill(0));
    cz.pares.forEach(([i, j], r) => { B[i][j] = B[j][i] = coef[iTW(r)] / 2; });
    if (cz.PQ.length) for (let j = 0; j < k; j++) B[j][j] = coef[iPQ(j)];
    let radio = 0;
    for (let r = 0; r < n; r++) { let s = 0; for (let j = 0; j < k; j++) s += Z[j][r] ** 2; radio = max(radio, sqrt(s)); }
    const out = {
      coeficientes: { nombre: nombreCol, estimado: coef, ee, t: tv, p: pv },
      naturales: { nombre: nombreCol, estimado: nat, ee: eeN, t: tN, p: tN.map(t => 2 * SP.dist.pt(abs(t), gl, false)) },
      anova, ajuste, codificacion: { factor: nombres.slice(), centro: c0, paso: sp }, radio,
      ajustados: Array.from(mc.ajustados), residuos: Array.from(mc.residuales),
      modelo: { orden, k, nb, pares: cz.pares, coef },
    };
    if (falta) out.falta_ajuste = falta;
    const qt = SP.dist.qt(1 - (1 - nivel) / 2, gl);
    const eig = cz.pares.length || cz.PQ.length ? propios(B) : null;
    if (orden === 'segundo') {
      const { valores: lam, vectores: Vv } = eig;
      /* −½·B⁻¹b = −½ Σ (v_jᵀb / λ_j) v_j */
      const xs = new Array(k).fill(0);
      Vv.forEach((v, j) => { const c = v.reduce((s, x, i) => s + x * b[i], 0) / lam[j]; for (let i = 0; i < k; i++) xs[i] -= 0.5 * c * v[i]; });
      const [pr, e] = predecir(xs);
      out.estacionario = { codificado: xs, natural: xs.map((v, j) => c0[j] + sp[j] * v), prediccion: pr, ee: e, ic_inf: pr - qt * e, ic_sup: pr + qt * e,
        distancia: sqrt(xs.reduce((s, v) => s + v * v, 0)), naturaleza: lam.every(v => v < 0) ? 'maximo' : lam.every(v => v > 0) ? 'minimo' : 'silla' };
      out.canonico = { valores: lam, vectores: Array.from({ length: k }, (_, i) => Vv.map(v => v[i])) };
    }
    /* cresta o ascenso más pronunciado */
    const sgn = o.objetivo === 'minimo' ? -1 : 1, nb2 = sqrt(b.reduce((s, v) => s + v * v, 0));
    let dist, camino;
    if (orden === 'primer') {
      dist = Array.from({ length: 11 }, (_, i) => i * 0.5);
      camino = dist.map(r => b.map(v => (nb2 > 0 ? sgn * r * v / nb2 : 0)));
    } else {
      const R = ceil(radio / 0.25 - 1e-9) * 0.25;
      dist = Array.from({ length: Math.round(R / 0.25) + 1 }, (_, i) => i * 0.25);
      camino = dist.map(r => cresta(eig, b, r, sgn));
    }
    const pp = camino.map(predecir);
    out.cresta = { distancia: dist, codificado: camino, natural: camino.map(z => z.map((v, j) => c0[j] + sp[j] * v)), prediccion: pp.map(v => v[0]), ee: pp.map(v => v[1]) };
    return out;
  }

  /** Un punto de la cresta a distancia r del centro (sgn = 1, máxima respuesta; −1, mínima). */
  function cresta(eig, b, r, sgn) {
    const k = b.length;
    if (r === 0) return new Array(k).fill(0);
    const { valores: lam, vectores: V } = eig, j = sgn > 0 ? 0 : k - 1;
    const c = V.map(v => v.reduce((s, x, i) => s + x * b[i], 0)), nb = sqrt(b.reduce((s, v) => s + v * v, 0));
    const x = mu => { const out = new Array(k).fill(0); V.forEach((v, h) => { const w = 0.5 * c[h] / (mu - lam[h]); for (let i = 0; i < k; i++) out[i] += w * v[i]; }); return out; };
    const norma = z => sqrt(z.reduce((s, v) => s + v * v, 0));
    if (abs(c[j]) <= 1e-12 * nb) {
      /* b sin componente en la dirección extrema: la cresta llega con μ → λ_j y sigue por esa dirección */
      const base = new Array(k).fill(0);
      V.forEach((v, h) => { if (h !== j && lam[h] !== lam[j]) { const w = 0.5 * c[h] / (lam[j] - lam[h]); for (let i = 0; i < k; i++) base[i] += w * v[i]; } });
      const r0 = norma(base);
      if (r >= r0) { const s = sqrt(r * r - r0 * r0); return base.map((v, i) => v + s * V[j][i]); }
      const f = t => log(norma(x(lam[j] + sgn * t))) - log(r), hi = nb / (2 * r);
      let lo = hi * 1e-12;
      const t = SP.num.raizR(f, lo, hi, undefined, undefined, 1e-300, 5000);
      return x(lam[j] + sgn * t);
    }
    const f = t => log(norma(x(lam[j] + sgn * t))) - log(r);
    const lo = abs(c[j]) / (2 * r) * 0.5, hi = nb / (2 * r);
    const t = SP.num.raizR(f, lo, hi, undefined, undefined, 1e-300, 5000);
    return x(lam[j] + sgn * t);
  }

  /** Predicción del modelo en un punto codificado (para las gráficas), con los bloques promediados. */
  function predecir(r, z) {
    const m = r.modelo, a = [1].concat(Array(m.nb).fill(1 / (m.nb + 1)), z, m.pares.map(([i, j]) => z[i] * z[j]), m.orden === 'segundo' ? z.map(v => v * v) : []);
    return a.reduce((s, v, i) => s + v * m.coef[i], 0);
  }

  /* ---------------- generador de diseños ---------------- */
  /** Centros por omisión de un central compuesto (precisión uniforme; Montgomery, tabla 11.11). */
  const CENTROS_CCD = { 2: 5, 3: 6, 4: 7, 5: 6, 6: 9 };
  /** Generador pseudoaleatorio con semilla (mulberry32): el mismo orden de corrida con la misma semilla. */
  function azar(semilla) {
    let a = semilla >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /** La parte factorial 2^k (o 2^(k−1) con el último factor = producto de los demás, para k ≥ 5), en orden estándar. */
  function factorial2(k, media) {
    const kb = media ? k - 1 : k, filas = [];
    for (let r = 0; r < 2 ** kb; r++) {
      const z = Array.from({ length: kb }, (_, j) => ((r >> j) & 1 ? 1 : -1));
      if (media) z.push(z.reduce((p, v) => p * v, 1));
      filas.push(z);
    }
    return filas;
  }
  /**
   * Diseños de superficie de respuesta y de mezclas, en unidades codificadas y en el orden estándar; con la semilla,
   * también el orden de corrida al azar.
   *   tipo 'ccd': central compuesto, alfa 'rotable' (α = F^¼), 'ortogonal' (α = (F·Q/4)^¼, Q = (√(F + T) − √F)²,
   *     T = 2k + n0), 'cara' (α = 1) o 'bloques' (dos bloques ortogonales, factorial y axial: α = √(k(1 + nA/2k)/(1 + nF/F)));
   *     con k ≥ 5, la parte factorial es la media fracción (I = ABC…).
   *   tipo 'bbd': Box-Behnken (k = 3 a 5): cada par de factores en ±1 con los demás en 0, más los centros.
   *   tipo 'factorial': 2^k con centros (para un modelo de primer orden o el ascenso).
   *   tipo 'latice': simplex-látice {q, m}: todas las mezclas con proporciones 0, 1/m, …, 1 que suman 1.
   *   tipo 'centroide': simplex-centroide: los 2^q − 1 centroides de las caras (vértices, puntos medios, …, centro).
   */
  function generarDiseno(o) {
    const k = o.k, filas = [], bloque = [];
    let alfa = null, F = 0;
    if (o.tipo === 'ccd') {
      if (!(k >= 2 && k <= 6)) throw new SP.ErrorSP(T('El central compuesto se arma con 2 a 6 factores.'));
      const fac = factorial2(k, k >= 5);
      F = fac.length;
      const n0 = o.centros === undefined ? CENTROS_CCD[k] : o.centros;
      const nF = o.alfa === 'bloques' ? Math.ceil(n0 / 2) : n0, nA = o.alfa === 'bloques' ? n0 - nF : 0;
      if (o.alfa === 'rotable') alfa = Math.pow(F, 0.25);
      else if (o.alfa === 'cara') alfa = 1;
      else if (o.alfa === 'ortogonal') { const Tt = 2 * k + n0, Q = (Math.sqrt(F + Tt) - Math.sqrt(F)) ** 2; alfa = Math.pow(F * Q / 4, 0.25); }
      else if (o.alfa === 'bloques') alfa = Math.sqrt(k * (1 + nA / (2 * k)) / (1 + nF / F));
      else throw new SP.ErrorSP(T('Tipo de α no válido: {a}.', { a: o.alfa }));
      for (const z of fac) { filas.push(z); bloque.push(1); }
      const centrosF = o.alfa === 'bloques' ? nF : n0;
      for (let c = 0; c < centrosF; c++) { filas.push(new Array(k).fill(0)); bloque.push(1); }
      for (let j = 0; j < k; j++) for (const s of [-1, 1]) { const z = new Array(k).fill(0); z[j] = s * alfa; filas.push(z); bloque.push(o.alfa === 'bloques' ? 2 : 1); }
      for (let c = 0; c < nA; c++) { filas.push(new Array(k).fill(0)); bloque.push(2); }
    } else if (o.tipo === 'bbd') {
      if (!(k >= 3 && k <= 5)) throw new SP.ErrorSP(T('El Box-Behnken se arma con 3 a 5 factores.'));
      for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const z = new Array(k).fill(0); z[i] = a; z[j] = b; filas.push(z); bloque.push(1); }
      const n0 = o.centros === undefined ? (k === 5 ? 6 : 3) : o.centros;
      for (let c = 0; c < n0; c++) { filas.push(new Array(k).fill(0)); bloque.push(1); }
    } else if (o.tipo === 'factorial') {
      if (!(k >= 2 && k <= 6)) throw new SP.ErrorSP(T('El factorial se arma con 2 a 6 factores.'));
      for (const z of factorial2(k, false)) { filas.push(z); bloque.push(1); }
      const n0 = o.centros === undefined ? 4 : o.centros;
      for (let c = 0; c < n0; c++) { filas.push(new Array(k).fill(0)); bloque.push(1); }
    } else if (o.tipo === 'latice') {
      const m = o.grado;
      if (!(k >= 2 && k <= 6 && m >= 1 && m <= 4)) throw new SP.ErrorSP(T('El simplex-látice se arma con 2 a 6 componentes y grado 1 a 4.'));
      const rec = (resto, pref) => { if (pref.length === k - 1) { filas.push(pref.concat(resto).map(v => v / m)); bloque.push(1); return; } for (let a = resto; a >= 0; a--) rec(resto - a, pref.concat(a)); };
      rec(m, []);
      const n0 = o.centros || 0;
      for (let c = 0; c < n0; c++) { filas.push(new Array(k).fill(1 / k)); bloque.push(1); }
    } else if (o.tipo === 'centroide') {
      if (!(k >= 2 && k <= 6)) throw new SP.ErrorSP(T('El simplex-centroide se arma con 2 a 6 componentes.'));
      const subs = [];
      for (let s = 1; s < 2 ** k; s++) subs.push(s);
      subs.sort((a, b) => popcount(a) - popcount(b) || a - b);
      for (const s of subs) { const c = popcount(s); filas.push(Array.from({ length: k }, (_, j) => ((s >> j) & 1 ? 1 / c : 0))); bloque.push(1); }
      const n0 = o.centros === undefined ? 0 : o.centros - 1;
      for (let c = 0; c < n0; c++) { filas.push(new Array(k).fill(1 / k)); bloque.push(1); }
    } else throw new SP.ErrorSP(T('Tipo de diseño no válido: {t}.', { t: o.tipo }));
    /* el orden de corrida: al azar dentro de cada bloque (Fisher-Yates con la semilla); orden[c] = la corrida estándar que va en el lugar c */
    const n = filas.length;
    let orden = Array.from({ length: n }, (_, i) => i);
    if (o.semilla !== undefined && o.semilla !== null && o.semilla !== '') {
      const u = azar(+o.semilla), nuevo = [];
      for (const bq of [...new Set(bloque)].sort((p, q) => p - q)) {
        const idx = orden.filter(i => bloque[i] === bq);
        for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
        nuevo.push(...idx);
      }
      orden = nuevo;
    }
    return { tipo: o.tipo, tipoAlfa: o.tipo === 'ccd' ? o.alfa : null, k, alfa, factorial: F, codificado: filas, bloque, orden };
  }
  const popcount = s => { let c = 0; while (s) { c += s & 1; s >>= 1; } return c; };

  /* ---------------- mezclas (Scheffé 1958) ---------------- */
  /** Los términos de Scheffé: índices de los componentes de cada columna. */
  function terminosScheffe(q, modelo) {
    const t = [];
    for (let i = 0; i < q; i++) t.push([i]);
    if (modelo !== 'lineal') for (let i = 0; i < q; i++) for (let j = i + 1; j < q; j++) t.push([i, j]);
    if (modelo === 'cubico-especial') for (let i = 0; i < q; i++) for (let j = i + 1; j < q; j++) for (let k = j + 1; k < q; k++) t.push([i, j, k]);
    return t;
  }
  const valorTermino = (x, idx) => idx.reduce((p, i) => p * x[i], 1);
  /**
   * Mezclas: modelo de Scheffé sin intercepto sobre las proporciones (cada fila dividida por su suma): lineal
   * Σβ_i·x_i; cuadrático, más Σβ_ij·x_i·x_j; cúbico especial, más Σβ_ijk·x_i·x_j·x_k. Como Σx = 1, la media está en el
   * modelo: el ANOVA y el R² son contra la media (con p − 1 gl), y la falta de ajuste, contra el error puro de las
   * mezclas repetidas. o = { y, x: [q columnas], nombres, modelo, objetivo, nivel }.
   */
  function mezclas(o) {
    const q = o.x.length, n = o.y.length, nivel = o.nivel || 0.95;
    if (q < 2 || q > 6) throw new SP.ErrorSP(T('Una mezcla tiene de 2 a 6 componentes.'));
    const X = Array.from({ length: n }, (_, r) => { const fila = o.x.map(c => c[r]), s = fila.reduce((a, b) => a + b, 0); return fila.map(v => v / s); });
    const sumas = Array.from({ length: n }, (_, r) => o.x.reduce((a, c) => a + c[r], 0)), sm = sumas.reduce((a, b) => a + b, 0) / n;
    if (sumas.some(s => !(s > 0) || abs(s - sm) > 1e-6 * sm)) throw new SP.ErrorSP(T('Los componentes no suman lo mismo en todas las filas (deben ser proporciones de la mezcla).'),
      T('Cada fila debe sumar 1 (o 100 %, o el total de la mezcla).'));
    if (X.some(f => f.some(v => v < -1e-12))) throw new SP.ErrorSP(T('Hay proporciones negativas.'));
    const terms = terminosScheffe(q, o.modelo), p = terms.length;
    if (n <= p) throw new SP.ErrorSP(T('Faltan datos: el modelo tiene {p} coeficientes y hay {n} mezclas.', { p, n }), T('Usa un modelo más sencillo o más mezclas.'));
    const cols = terms.map(t => Float64Array.from(X, f => valorTermino(f, t)));
    const mc = ajustarLM(cols, n, o.y);
    if (mc.qr.rango < p) throw new SP.ErrorSP(T('Las mezclas no permiten estimar el modelo {m}.', { m: o.modelo }), T('El cuadrático necesita los puntos medios de las aristas; el cúbico especial, el centroide de cada cara de tres componentes.'));
    const gl = n - p, scr = mc.scResidual, s2 = scr / gl, Vu = covarianzas(mc), coef = Array.from(mc.coeficientes);
    const ee = coef.map((_, j) => sqrt(s2 * Vu[j][j])), tv = coef.map((b, j) => b / ee[j]);
    let media = 0; for (const v of o.y) media += v; media /= n;
    let sct = 0; for (const v of o.y) sct += (v - media) ** 2;
    const scm = sct - scr, Fm = (scm / (p - 1)) / s2;
    const anova = { fuente: [T('Modelo'), T('Residuo')], gl: [p - 1, gl], sc: [scm, scr], cm: [scm / (p - 1), s2], F: [Fm, NaN], p: [SP.dist.pf(Fm, p - 1, gl, false), NaN] };
    /* falta de ajuste: mezclas repetidas (con 10 cifras) */
    const mapa = new Map(), cod = X.map(f => { const c = f.map(v => v.toFixed(10)).join('|'); if (!mapa.has(c)) mapa.set(c, mapa.size); return mapa.get(c); });
    const G = mapa.size, sum = new Float64Array(G), cnt = new Float64Array(G);
    for (let r = 0; r < n; r++) { sum[cod[r]] += o.y[r]; cnt[cod[r]]++; }
    let scpe = 0; for (let r = 0; r < n; r++) scpe += (o.y[r] - sum[cod[r]] / cnt[cod[r]]) ** 2;
    const glpe = n - G, gllof = gl - glpe;
    let falta = null;
    if (glpe > 0 && gllof > 0) {
      const F = ((scr - scpe) / gllof) / (scpe / glpe);
      falta = { F, gl1: gllof, gl2: glpe, p: SP.dist.pf(F, gllof, glpe, false) };
      anova.fuente.push(T('Falta de ajuste'), T('Error puro')); anova.gl.push(gllof, glpe); anova.sc.push(scr - scpe, scpe); anova.cm.push((scr - scpe) / gllof, scpe / glpe);
      anova.F.push(F, NaN); anova.p.push(falta.p, NaN);
    }
    const f = x => terms.reduce((s, t, j) => s + coef[j] * valorTermino(x, t), 0);
    const predecirM = x => { const a = terms.map(t => valorTermino(x, t)); let v = 0, s = 0; for (let i = 0; i < p; i++) { v += a[i] * coef[i]; for (let j = 0; j < p; j++) s += a[i] * Vu[i][j] * a[j]; } return [v, sqrt(s2 * s)]; };
    const opt = optimoMezcla(q, terms, coef, o.objetivo === 'minimo' ? -1 : 1);
    const [pr, epr] = predecirM(opt.x), qt = SP.dist.qt(1 - (1 - nivel) / 2, gl);
    const nombreT = terms.map(t => t.map(i => o.nombres[i]).join(' × '));
    return {
      coeficientes: { nombre: nombreT, estimado: coef, ee, t: tv, p: tv.map(t => 2 * SP.dist.pt(abs(t), gl, false)) },
      anova, ajuste: { n, gl, sigma: sqrt(s2), r2: scm / sct, r2_ajustada: 1 - s2 / (sct / (n - 1)) }, falta_ajuste: falta || undefined,
      optimo: { mezcla: opt.x, prediccion: pr, ee: epr, ic_inf: pr - qt * epr, ic_sup: pr + qt * epr, componentes_activos: opt.x.filter(v => v > 1e-9).length },
      terminos: terms, proporciones: X, ajustados: Array.from(mc.ajustados), residuos: Array.from(mc.residuales), total: sm, distintas: G, gl_error_puro: glpe,
    };
  }
  /**
   * La mejor mezcla del modelo en el simplex (sgn = 1 la máxima respuesta, −1 la mínima): en cada cara S (subconjunto de
   * componentes), los puntos estacionarios de f restringida a Σ_S x = 1 resuelven ∂f/∂x_i = λ (i en S) por Newton desde
   * los puntos de una rejilla de la cara; se quedan los factibles (todas las x ≥ 0) y gana el mejor, junto con los
   * vértices. En el lineal solo cuentan los vértices; en el cuadrático, una vuelta de Newton es exacta.
   */
  function optimoMezcla(q, terms, coef, sgn) {
    const f = x => terms.reduce((s, t, j) => s + coef[j] * valorTermino(x, t), 0);
    const grad = x => { const g = new Array(q).fill(0); terms.forEach((t, j) => { for (const i of t) g[i] += coef[j] * t.reduce((p, h) => (h === i ? p : p * x[h]), 1); }); return g; };
    const hess = x => { const H = Array.from({ length: q }, () => new Array(q).fill(0)); terms.forEach((t, j) => { if (t.length < 2) return; for (const a of t) for (const b of t) if (a !== b) H[a][b] += coef[j] * t.reduce((p, h) => (h === a || h === b ? p : p * x[h]), 1); }); return H; };
    let mejor = null;
    const considera = x => { if (x.some(v => v < -1e-10)) return; const z = x.map(v => Math.max(0, v)), s = z.reduce((a, b) => a + b, 0), w = z.map(v => v / s), val = sgn * f(w); if (!mejor || val > mejor.val + 1e-13) mejor = { x: w, val }; };
    for (let i = 0; i < q; i++) considera(Array.from({ length: q }, (_, h) => (h === i ? 1 : 0)));
    const lineal = terms.every(t => t.length === 1);
    if (!lineal) for (let s = 1; s < 2 ** q; s++) {
      const S = []; for (let i = 0; i < q; i++) if ((s >> i) & 1) S.push(i);
      if (S.length < 2) continue;
      const m = S.length, inicios = [];
      /* rejilla de la cara: puntos de grado 3 (y el centroide) */
      const rec = (resto, pref) => { if (pref.length === m - 1) { inicios.push(pref.concat(resto).map(v => v / 3)); return; } for (let a = resto; a >= 0; a--) rec(resto - a, pref.concat(a)); };
      rec(3, []); inicios.push(new Array(m).fill(1 / m));
      for (const ini of inicios) {
        let x = new Array(q).fill(0); S.forEach((i, h) => { x[i] = ini[h]; });
        let lam = 0, ok = false;
        for (let it = 0; it < 60; it++) {
          const g = grad(x), H = hess(x), A = Array.from({ length: m + 1 }, () => new Array(m + 1).fill(0)), b = new Array(m + 1).fill(0);
          S.forEach((i, a) => { S.forEach((j, c) => { A[a][c] = H[i][j]; }); A[a][m] = -1; A[m][a] = 1; b[a] = -(g[i] - lam); });
          b[m] = -(S.reduce((t, i) => t + x[i], 0) - 1);
          const d = resolver(A, b);
          if (!d) break;
          S.forEach((i, a) => { x[i] += d[a]; }); lam += d[m];
          if (Math.max(...d.map(abs)) < 1e-14) { ok = true; break; }
        }
        if (ok) considera(x);
      }
    }
    return { x: mejor.x, valor: sgn * mejor.val };
  }
  /** Sistema lineal pequeño por Gauss con pivote (null si es singular). */
  function resolver(A, b) {
    const n = b.length, M = A.map((f, i) => f.concat(b[i]));
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (abs(M[r][c]) > abs(M[piv][c])) piv = r;
      if (abs(M[piv][c]) < 1e-14) return null;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = c + 1; r < n; r++) { const fct = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= fct * M[c][j]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j]; x[r] = s / M[r][r]; }
    return x;
  }

  /* ---------------- deseabilidad (Derringer y Suich 1980) ---------------- */
  /**
   * Deseabilidad individual: maximizar d = ((y − L)/(U − L))^s entre L y U (0 debajo, 1 arriba); minimizar
   * d = ((U − y)/(U − L))^s; un valor meta T: ((y − L)/(T − L))^s de L a T y ((U − y)/(U − T))^t de T a U (0 fuera).
   */
  function deseabilidadUna(y, c) {
    const { meta, L, U } = c, s = c.s === undefined ? 1 : c.s, t = c.t === undefined ? 1 : c.t;
    if (meta === 'max') return y <= L ? 0 : y >= U ? 1 : Math.pow((y - L) / (U - L), s);
    if (meta === 'min') return y >= U ? 0 : y <= L ? 1 : Math.pow((U - y) / (U - L), s);
    if (y < L || y > U) return 0;
    return y <= c.T ? Math.pow((y - L) / (c.T - L), s) : Math.pow((U - y) / (U - c.T), t);
  }
  /** Deseabilidad global: media geométrica de las d con sus importancias r: D = (Π d^r)^(1/Σr). */
  function deseabilidadGlobal(ds, r) {
    let sr = 0, l = 0;
    for (let i = 0; i < ds.length; i++) { if (!(ds[i] > 0)) return 0; sr += r[i]; l += r[i] * log(ds[i]); }
    return Math.exp(l / sr);
  }
  /** Nelder-Mead para minimizar f en R^k (como optim de R: α = 1, γ = 2, ρ = 0.5, σ = 0.5). */
  function nelderMead(f, x0, paso, tol, maxit) {
    const k = x0.length;
    let S = [x0.slice()].concat(Array.from({ length: k }, (_, j) => { const v = x0.slice(); v[j] += paso; return v; }));
    let F = S.map(f);
    for (let it = 0; it < maxit; it++) {
      const o = F.map((_, i) => i).sort((a, b) => F[a] - F[b]);
      S = o.map(i => S[i]); F = o.map(i => F[i]);
      if (abs(F[k] - F[0]) <= tol * (abs(F[0]) + tol)) break;
      const c = new Array(k).fill(0);
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) c[j] += S[i][j] / k;
      const pt = a => c.map((v, j) => v + a * (S[k][j] - v));
      const xr = pt(-1), fr = f(xr);
      if (fr < F[0]) { const xe = pt(-2), fe = f(xe); if (fe < fr) { S[k] = xe; F[k] = fe; } else { S[k] = xr; F[k] = fr; } }
      else if (fr < F[k - 1]) { S[k] = xr; F[k] = fr; }
      else {
        const xc = fr < F[k] ? pt(-0.5) : pt(0.5), fc = f(xc);
        if (fc < Math.min(fr, F[k])) { S[k] = xc; F[k] = fc; }
        else { for (let i = 1; i <= k; i++) { S[i] = S[i].map((v, j) => S[0][j] + 0.5 * (v - S[0][j])); F[i] = f(S[i]); } }
      }
    }
    const i0 = F.indexOf(Math.min(...F));
    return { x: S[i0], valor: F[i0] };
  }
  /**
   * Deseabilidad de varias respuestas: cada una con su modelo de segundo orden (el mismo diseño y la misma
   * codificación), las d y la D en cada punto, y la combinación de factores con la mayor D dentro de la región del
   * experimento (el cubo de los niveles codificados de los datos o la esfera de radio la mayor distancia de un punto
   * al centro). La búsqueda: Nelder-Mead (con el punto llevado a la región) desde cada punto del diseño y el centro;
   * gana la mayor D. o = { x: [k columnas], nombres, respuestas: [{ nombre, y, meta, L, U, T, s, t, r }], region }.
   */
  function deseabilidad(o) {
    const k = o.x.length, cod = o.x.map(codificacion);
    const Z = o.x.map((x, j) => Float64Array.from(x, v => (v - cod[j].centro) / cod[j].paso)), n = Z[0].length;
    const modelos = o.respuestas.map(c => analizar({ y: c.y, x: o.x, nombres: o.nombres, bloque: null, orden: 'segundo', objetivo: 'maximo', nivel: 0.95 }));
    const lo = Z.map(z => Math.min(...z)), hi = Z.map(z => Math.max(...z));
    let radio = 0; for (let r = 0; r < n; r++) radio = max(radio, sqrt(Z.reduce((s, z) => s + z[r] * z[r], 0)));
    const llevar = z => {
      if (o.region === 'esfera') { const d = sqrt(z.reduce((s, v) => s + v * v, 0)); return d > radio ? z.map(v => v * radio / d) : z.slice(); }
      return z.map((v, j) => Math.min(hi[j], Math.max(lo[j], v)));
    };
    const imp = o.respuestas.map(c => (c.r === undefined ? 1 : c.r));
    const evalua = z => { const yp = modelos.map(m => predecir(m, z)), ds = yp.map((y, i) => deseabilidadUna(y, o.respuestas[i])); return { yp, ds, D: deseabilidadGlobal(ds, imp) }; };
    const inicios = Array.from({ length: n }, (_, r) => Z.map(z => z[r])).concat([new Array(k).fill(0)]);
    let mejor = null;
    for (const z0 of inicios) {
      const res = nelderMead(z => -evalua(llevar(z)).D, z0, 0.1, 1e-14, 5000), z = llevar(res.x), e = evalua(z);
      if (!mejor || e.D > mejor.D + 1e-12) mejor = Object.assign({ z }, e);
    }
    const puntos = Array.from({ length: n }, (_, r) => evalua(Z.map(z => z[r])));
    return { codificacion: { factor: o.nombres.slice(), centro: cod.map(c => c.centro), paso: cod.map(c => c.paso) }, region: o.region, radio,
      modelos: modelos.map(m => ({ r2: m.ajuste.r2, sigma: m.ajuste.sigma, coef: m.coeficientes.estimado, modelo: m.modelo })),
      optimo: { codificado: mejor.z, natural: mejor.z.map((v, j) => cod[j].centro + cod[j].paso * v), prediccion: mejor.yp, d: mejor.ds, D: mejor.D },
      puntos: { D: puntos.map(p => p.D), d: puntos.map(p => p.ds) }, puntosCodificados: Z.map(z => Array.from(z)) };
  }

  SP.superficie = { codificacion, propios, analizar, cresta, predecir, generarDiseno, terminosScheffe, mezclas, optimoMezcla, deseabilidadUna, deseabilidadGlobal, nelderMead, deseabilidad };
});

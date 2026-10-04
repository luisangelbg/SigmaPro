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
   * analizar({ y, x: [columnas numéricas], nombres, bloque: { codigos, niveles } | null, orden, objetivo, nivel })
   * Las filas ya vienen completas.
   */
  function analizar(o) {
    const y = o.y, n = y.length, k = o.x.length, nombres = o.nombres, orden = o.orden, nivel = o.nivel || 0.95;
    const cod = o.x.map(codificacion);
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

  SP.superficie = { codificacion, propios, analizar, cresta, predecir };
});

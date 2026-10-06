/* SigmaPro — comparaciones de medias, contrastes, polinomios ortogonales y medias ajustadas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Todo se hace sobre las medias marginales estimadas del diseño (SP.medias): con datos balanceados son las medias
   de siempre; con parcelas perdidas o bloques incompletos son las ajustadas. Cada combinación lineal L·b tiene su
   varianza y sus grados de libertad:
     - un solo error (DCA, DBCA, cuadro latino, BIB, látice): V = CMerror·(XᵀX)⁻, gl del error;
     - estratos (parcelas divididas, subdivididas, franjas): cada coeficiente con el error de su estrato y los gl de
       Satterthwaite (SP.estratos.varianzaCombinada), como emmeans con un modelo de estratos.
   Métodos de comparación por pares (dentro de cada nivel de los factores «dentro de»):
     dms         t de Student sin ajuste (DMS de Fisher)
     tukey       rango estudentizado (Tukey-Kramer con repeticiones distintas)
     duncan, snk rango múltiple con el número de medias abarcadas, con el EE común de agricolae (repeticiones
                 efectivas con su media armónica)
     scheffe     F con k − 1 gl
     bonferroni, sidak, holm   sobre los p de la DMS
     dunnett     contra un testigo, bilateral o de una cola, con la probabilidad multivariada t exacta (integral
                 doble por cuadratura adaptativa de Gauss-Kronrod) cuando las correlaciones son de forma producto
     games-howell  varianzas distintas (un factor, completamente al azar)
   Letras: inserción y absorción (SP.np.letras) con la «a» para la media más alta. */
SP.definir('comparaciones', function (SP) {
  'use strict';
  const T = SP.T;
  const { sqrt, abs, max, min, exp, log, SQRT2 } = Math;
  const D = () => SP.dist;
  const exigir = (c, m, a) => { if (!c) throw new SP.ErrorSP(m, a); };
  Object.assign(SP.nombresFunciones, {
    'comp.paresDe': 'Comparaciones de medias por pares (DMS, Tukey, Scheffé, Bonferroni, Šidák, Holm)',
    'comp.rangoMultipleDe': 'Duncan y Student-Newman-Keuls',
    'comp.dunnettDe': 'Dunnett contra un testigo (probabilidad multivariada t exacta)',
    'comp.gamesHowellDe': 'Games-Howell (varianzas distintas)',
    'comp.contrastesDe': 'Contrastes definidos por el usuario y su partición de la suma de cuadrados',
    'comp.polinomiosDe': 'Polinomios ortogonales, curva ajustada y dosis óptima',
    'comp.mediasDe': 'Medias marginales estimadas con intervalo de confianza',
    'comp.dunnettProb': 'Probabilidad multivariada t de Dunnett (integral doble)',
  });

  /* ---------------- modelo para combinaciones lineales ---------------- */
  function modelo(tabla, diseno, e, op) {
    op = op || {};
    const r = SP.disenos.analizar(tabla, diseno, e, Object.assign({}, op, { tipoSC: 1 }));
    const t = SP.disenos.tablaDiseno(tabla, e, SP.disenos.DISENOS[diseno].roles);
    if (r.error) {
      const co = SP.estratos.anova(t, r.formula, r.error, { todosSuma: true, coeficientes: true });
      const a = { modelo: co.modelo, opciones: { todosSuma: true } };
      const R = SP.medias.rejilla(t, a);
      return {
        tipo: 'estratos', r, t, a, R,
        est(L) { let s = 0; for (let j = 0; j < L.length; j++) if (L[j]) { if (Number.isNaN(co.b[j])) return NaN; s += L[j] * co.b[j]; } return s; },
        varianza: L => SP.estratos.varianzaCombinada(co, L),
        cme: NaN, glE: NaN,
      };
    }
    return modeloLineal(t, SP.lineal.ajustar(t, r.formula), r);
  }
  /** Modelo de un solo error a partir de un ajuste de SP.lineal (también la ANCOVA, con las covariables en su media). */
  function modeloLineal(t, a, r) {
    const P = SP.medias.partes(a), R = SP.medias.rejilla(t, a);
    const p = P.p;
    return {
      tipo: 'lineal', r, t, a, R, cme: P.s2, glE: a.glResidual,
      est(L) { if (!SP.medias.esEstimable(L, P.nula)) return NaN; let s = 0; for (let j = 0; j < p; j++) s += L[j] * P.b[j]; return s; },
      varianza(L) {
        if (!SP.medias.esEstimable(L, P.nula)) return { v: NaN, gl: NaN };
        return { v: this.covarianza(L, L), gl: a.glResidual };
      },
      covarianza(L1, L2) {
        let s = 0;
        for (let j = 0; j < p; j++) { if (!L2[j]) continue; let u = 0; for (let i = 0; i < p; i++) u += L1[i] * P.V[i + j * p]; s += u * L2[j]; }
        return s;
      },
    };
  }
  /** Medias de «spec» en cada grupo de «dentro»: [{ dentro, filas: [{ niveles, L, est, ee, gl }] }]. */
  function grupos(M, spec, dentro) {
    const F = SP.medias.filasMedias(M.R, spec, dentro), celdas = F.tam.slice(0, spec.length).reduce((x, y) => x * y, 1);
    const nG = F.L.length / celdas, out = [];
    for (let g = 0; g < nG; g++) {
      const filas = [];
      for (let c = 0; c < celdas; c++) {
        const L = F.L[c + g * celdas], et = F.etiquetas[c + g * celdas], vv = M.varianza(L);
        const niveles = {}; for (const f of spec) niveles[f] = et[f];
        filas.push({ niveles, nombre: spec.map(f => et[f]).join(' : '), L, est: M.est(L), ee: sqrt(vv.v), gl: vv.gl });
      }
      const de = {}; for (const f of dentro) de[f] = F.etiquetas[g * celdas][f];
      out.push({ dentro: de, filas });
    }
    return out;
  }
  const diferencia = (a, b) => Float64Array.from(a, (v, j) => v - b[j]);

  /* ---------------- ajustes de los valores p ---------------- */
  function ajustar(pares, metodo, k) {
    const m = pares.length;
    for (const x of pares) {
      const t = abs(x.t);
      x.p_dms = 2 * D().pt(t, x.gl, false);
      if (metodo === 'tukey') x.p_ajustado = D().ptukey(t * SQRT2, k, x.gl, false);
      else if (metodo === 'scheffe') x.p_ajustado = D().pf(t * t / (k - 1), k - 1, x.gl, false);
      else if (metodo === 'bonferroni') x.p_ajustado = min(1, m * x.p_dms);
      else if (metodo === 'sidak') x.p_ajustado = -Math.expm1(m * Math.log1p(-x.p_dms));
      else if (metodo === 'dms') x.p_ajustado = x.p_dms;
    }
    if (metodo === 'holm') { const adj = SP.np.ajustarP(pares.map(x => x.p_dms), 'holm'); pares.forEach((x, i) => { x.p_ajustado = adj[i]; }); }
    /* una sola comparación: todos los ajustes valen lo mismo que la t (como emmeans); así se evita el error de la
       integral del rango estudentizado con pocos grados de libertad */
    if (m === 1) pares[0].p_ajustado = pares[0].p_dms;
  }

  /** Comparaciones por pares de las medias de spec dentro de cada grupo de «dentro». */
  function pares(M, spec, dentro, metodo, alfa) {
    exigir(['dms', 'tukey', 'scheffe', 'bonferroni', 'sidak', 'holm', 'duncan', 'snk'].includes(metodo), T('Método de comparación desconocido: {m}.', { m: metodo }));
    if (metodo === 'duncan' || metodo === 'snk') exigir(M.tipo === 'lineal', T('Duncan y Student-Newman-Keuls necesitan un solo error; en parcelas divididas usa Tukey, DMS o Bonferroni.'));
    return grupos(M, spec, dentro).map(G => {
      const k = G.filas.length, lista = [];
      for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
        const L = diferencia(G.filas[a].L, G.filas[b].L), d = G.filas[a].est - G.filas[b].est, vv = M.varianza(L);
        lista.push({ a, b, dif: d, ee: sqrt(vv.v), gl: vv.gl, t: d / sqrt(vv.v) });
      }
      if (metodo === 'duncan' || metodo === 'snk') rangoMultiple(M, G, lista, metodo);
      else ajustar(lista, metodo, k);
      const letras = SP.np.letrasPorOrden(G.filas.map(f => f.est), lista, alfa);
      return { dentro: G.dentro, medias: G.filas.map((f, i) => ({ nombre: f.nombre, niveles: f.niveles, media: f.est, ee: f.ee, gl: f.gl, letras: letras[i] })), pares: lista };
    });
  }
  /** Duncan y SNK como agricolae: EE común √(CMerror/r̄ₕ) y el número de medias abarcadas en el orden de las medias. */
  function rangoMultiple(M, G, lista, metodo) {
    const k = G.filas.length;
    const r = G.filas.map(f => M.cme / (f.ee * f.ee)), rh = k / r.reduce((s, x) => s + 1 / x, 0);
    const sdt = sqrt(M.cme / rh);
    const orden = G.filas.map((f, i) => i).sort((x, y) => (G.filas[y].est - G.filas[x].est) || x - y), pos = [];
    orden.forEach((i, o) => { pos[i] = o; });
    for (const x of lista) {
      const pasos = abs(pos[x.a] - pos[x.b]) + 1, q = abs(x.dif) / sdt;
      x.pasos = pasos; x.q = q; x.ee_comun = sdt;
      const pt = D().ptukey(q, pasos, M.glE, false);
      x.p_ajustado = metodo === 'snk' ? pt : -Math.expm1(Math.log1p(-pt) / (pasos - 1));
      x.p_dms = 2 * D().pt(abs(x.t), x.gl, false);
    }
  }

  /* ---------------- Dunnett ---------------- */
  /* Gauss-Kronrod de 21 puntos (QUADPACK), con bisección adaptativa de criterio global */
  const XGK = [0.995657163025808080735527280689003, 0.973906528517171720077964012084452, 0.930157491355708226001207180059508, 0.865063366688984510732096688423493,
    0.780817726586416897063717578345042, 0.679409568299024406234327365114874, 0.562757134668604683339000099272694, 0.433395394129247190799265943165784,
    0.294392862701460198131126603103866, 0.148874338981631210884826001129720, 0];
  const WGK = [0.011694638867371874278064396062192, 0.032558162307964727478818972459390, 0.054755896574351996031381300244580, 0.075039674810919952767043140916190,
    0.093125454583697605535065465083366, 0.109387158802297641899210590325805, 0.123491976262065851077958109831074, 0.134709217311473325928054001771707,
    0.142775938577060080797094273138717, 0.147739104901338491374841515972068, 0.149445554002916905664936468389821];
  const WG = [0.066671344308688137593568809893332, 0.149451349150580593145776339657697, 0.219086362515982043995534934228163, 0.269266719309996355091226921569469, 0.295524224714752870173892994651338];
  function gk21(f, a, b) {
    const c = (a + b) / 2, h = (b - a) / 2, fc = f(c);
    let k = fc * WGK[10], g = 0;
    for (let j = 0; j < 10; j++) {
      const x = h * XGK[j], s = f(c - x) + f(c + x);
      k += WGK[j] * s;
      if (j % 2 === 1) g += WG[(j - 1) / 2] * s;
    }
    return { v: k * h, err: abs((k - g) * h), a, b };
  }
  /* Como QUADPACK (integrate de R): se parte el tramo de mayor error hasta que la SUMA de los errores quede bajo
     tol·|integral|, con 1000 tramos a lo más. Exigir tol a cada tramo por separado multiplicaba las bisecciones donde
     el integrando es despreciable (las colas de un p chico: 44 s por p con t = 8) sin ganar cifras en el total. */
  function integrar(f, a, b, tol) {
    const tramos = [gk21(f, a, b)];
    for (;;) {
      let v = 0, err = 0, k = 0;
      for (let i = 0; i < tramos.length; i++) { v += tramos[i].v; err += tramos[i].err; if (tramos[i].err > tramos[k].err) k = i; }
      if (err <= max(tol * abs(v), 1e-300) || tramos.length >= 1000) return v;
      const r = tramos[k], m = (r.a + r.b) / 2;
      tramos[k] = gk21(f, r.a, m); tramos.push(gk21(f, m, r.b));
    }
  }
  /**
   * P(algún |Tᵢ| > c) (bilateral) o P(algún Tᵢ > c) (una cola) para t multivariada con gl y correlaciones λᵢλⱼ:
   * ∫ f(s) ∫ φ(z) [1 − Πᵢ (1 − qᵢ(z, s))] dz ds, con qᵢ la cola de Zᵢ = λᵢz + √(1 − λᵢ²)eᵢ más allá de c·s.
   * Se integra el complemento para conservar cifras relativas en los p chicos. En la bilateral qᵢ(z) = qᵢ(−z) con
   * cualquier signo de λᵢ: basta el doble de la integral en [0, 9].
   */
  function dunnettProb(c, lambdas, gl, bilateral) {
    bilateral = bilateral !== false;
    const sig = lambdas.map(l => sqrt(1 - l * l));
    const interior = s => (bilateral ? 2 : 1) * integrar(z => {
      let suma = 0;
      for (let i = 0; i < lambdas.length; i++) {
        const lz = lambdas[i] * z;
        let qv = D().pnorm((lz - c * s) / sig[i], 0, 1, true);
        if (bilateral) qv += D().pnorm((-c * s - lz) / sig[i], 0, 1, true);
        suma += Math.log1p(-min(qv, 1));
      }
      return exp(-0.5 * z * z) / sqrt(2 * Math.PI) * -Math.expm1(suma);
    }, bilateral ? 0 : -9, 9, 1e-12);
    if (!Number.isFinite(gl)) return interior(1);
    const cte = log(2) + (gl / 2) * log(gl / 2) - D().lgamma(gl / 2);
    const dens = s => exp(cte + (gl - 1) * log(s) - gl * s * s / 2);
    const s0 = sqrt(D().qchisq(1e-15, gl) / gl), s1 = sqrt(D().qchisq(1e-15, gl, false) / gl);
    return integrar(s => dens(s) * interior(s), s0, s1, 1e-11);
  }
  /** Dunnett: cada nivel contra el testigo, p de un solo paso (single-step) exactos. */
  function dunnett(M, spec, dentro, testigo, alternativa) {
    exigir(M.tipo === 'lineal', T('Dunnett necesita un solo error; en parcelas divididas compara con Bonferroni u Holm, que ajustan todos los pares (contra el testigo resultan conservadoras).'));
    return grupos(M, spec, dentro).map(G => {
      const ic = G.filas.findIndex(f => f.nombre === testigo);
      exigir(ic >= 0, T('El testigo «{t}» no es un nivel de lo que se compara.', { t: testigo }));
      const otros = G.filas.map((f, i) => i).filter(i => i !== ic);
      const L = otros.map(i => diferencia(G.filas[i].L, G.filas[ic].L));
      const vv = L.map(l => M.varianza(l)), se = vv.map(v => sqrt(v.v)), gl = M.glE;
      /* correlaciones entre las comparaciones: deben ser de forma producto λᵢλⱼ */
      const m = L.length, rho = [];
      for (let i = 0; i < m; i++) { rho.push([]); for (let j = 0; j < m; j++) rho[i].push(M.covarianza(L[i], L[j]) / (se[i] * se[j])); }
      const lam = lambdasProducto(rho);
      exigir(lam, T('Con estas medias (parcelas perdidas o bloques incompletos) las comparaciones contra el testigo no tienen la correlación de forma producto que necesita el Dunnett exacto.'), T('Usa Bonferroni u Holm: ajustan todos los pares, así que las comparaciones contra el testigo quedan protegidas de más (conservadoras).'));
      const comps = otros.map((i, k) => {
        const d = G.filas[i].est - G.filas[ic].est, t = d / se[k];
        let p;
        if (alternativa === 'mayor') p = m === 1 ? D().pt(t, gl, false) : dunnettProb(t, lam, gl, false);
        else if (alternativa === 'menor') p = m === 1 ? D().pt(t, gl) : dunnettProb(-t, lam, gl, false);
        else p = m === 1 ? 2 * D().pt(abs(t), gl, false) : dunnettProb(abs(t), lam, gl, true);
        return { nivel: G.filas[i].nombre, dif: d, ee: se[k], gl, t, p_ajustado: min(1, max(0, p)) };
      });
      return { dentro: G.dentro, testigo, medias: G.filas.map(f => ({ nombre: f.nombre, media: f.est, ee: f.ee })), comparaciones: comps, lambdas: lam };
    });
  }
  function lambdasProducto(rho) {
    const m = rho.length;
    if (m === 1) return [0];
    let lam;
    if (m === 2) { const l = sqrt(abs(rho[0][1])); lam = [l, rho[0][1] < 0 ? -l : l]; }
    else {
      lam = [];
      for (let i = 0; i < m; i++) {
        const [j, k] = [0, 1, 2].filter(x => x !== i).slice(0, 2);
        const v = rho[i][j] * rho[i][k] / rho[j][k];
        if (!(v >= 0)) return null;
        lam.push(sqrt(v));
      }
      /* signos: el del primero positivo, los demás según ρ₀ᵢ */
      for (let i = 1; i < m; i++) if (rho[0][i] < 0) lam[i] = -lam[i];
    }
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) if (abs(rho[i][j] - lam[i] * lam[j]) > 1e-9) return null;
    if (lam.some(l => !(abs(l) < 1))) return null;
    return lam;
  }

  /* ---------------- Games-Howell ---------------- */
  function gamesHowell(t, respuesta, factor, alfa) {
    const y = t.col(respuesta).valores, g = t.col(factor), grupos = [];
    g.niveles.forEach((nombre, j) => {
      const v = [];
      for (let i = 0; i < y.length; i++) if (g.codigos[i] === j && !Number.isNaN(y[i])) v.push(y[i]);
      if (v.length) grupos.push({ nombre, n: v.length, media: SP.num.media(v), s2: SP.num.varianza(v) });
    });
    const k = grupos.length, lista = [];
    exigir(grupos.every(x => x.n >= 2), T('Games-Howell necesita al menos dos observaciones por grupo.'));
    for (let a = 0; a < k - 1; a++) for (let b = a + 1; b < k; b++) {
      const A = grupos[a].s2 / grupos[a].n + grupos[b].s2 / grupos[b].n, dif = grupos[a].media - grupos[b].media;
      const gl = A * A / (grupos[a].s2 ** 2 / (grupos[a].n ** 2 * (grupos[a].n - 1)) + grupos[b].s2 ** 2 / (grupos[b].n ** 2 * (grupos[b].n - 1)));
      const q = dif / sqrt(A) * SQRT2;
      lista.push({ a, b, dif, ee: sqrt(A), gl, q, p_ajustado: D().ptukey(abs(q), k, gl, false) });
    }
    const letras = SP.np.letrasPorOrden(grupos.map(x => x.media), lista, alfa);
    return [{ dentro: {}, medias: grupos.map((x, i) => ({ nombre: x.nombre, media: x.media, ee: sqrt(x.s2 / x.n), n: x.n, letras: letras[i] })), pares: lista }];
  }

  /* ---------------- contrastes y polinomios ---------------- */
  /** Contrastes de las medias de un factor: C = [{ nombre, coef: [..] }] en el orden de los niveles. */
  function contrastes(M, factor, dentro, C) {
    const cuenta = conteoNiveles(M, factor);
    return grupos(M, [factor], dentro).map(G => {
      const k = G.filas.length;
      const filas = C.map(c => {
        exigir(c.coef.length === k, T('El contraste «{n}» tiene {a} coeficientes y hay {k} niveles.', { n: c.nombre, a: c.coef.length, k }));
        const L = new Float64Array(G.filas[0].L.length);
        c.coef.forEach((w, i) => { if (w) G.filas[i].L.forEach((v, j) => { L[j] += w * v; }); });
        const est = M.est(L), vv = M.varianza(L), ee = sqrt(vv.v), t = est / ee;
        const out = { nombre: c.nombre, coef: c.coef.slice(), est, ee, gl: vv.gl, t, F: t * t, p: 2 * D().pt(abs(t), vv.gl, false), sumaCero: abs(c.coef.reduce((s, x) => s + x, 0)) < 1e-9 };
        if (M.tipo === 'lineal') out.sc = t * t * M.cme;
        return out;
      });
      /* ortogonalidad con las repeticiones de cada nivel: Σ cᵢc′ᵢ/nᵢ = 0 */
      const n = G.filas.map(f => cuenta.get(f.niveles[factor]) || 1);
      const orto = [];
      for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) {
        let s = 0, escala = 0;
        for (let h = 0; h < k; h++) { s += C[i].coef[h] * C[j].coef[h] / n[h]; escala += abs(C[i].coef[h] * C[j].coef[h]) / n[h]; }
        orto.push({ i, j, ortogonales: abs(s) <= 1e-10 * max(1, escala) });
      }
      return { dentro: G.dentro, medias: G.filas.map(f => ({ nombre: f.nombre, media: f.est })), contrastes: filas, ortogonalidad: orto, todosOrtogonales: orto.every(x => x.ortogonales) };
    });
  }
  function conteoNiveles(M, factor) {
    const c = M.t.col(factor), m = new Map();
    const y = M.t.col(M.r.respuesta).valores;
    for (let i = 0; i < y.length; i++) if (c.codigos[i] >= 0 && !Number.isNaN(y[i])) { const l = c.niveles[c.codigos[i]]; m.set(l, (m.get(l) || 0) + 1); }
    return m;
  }
  /** Polinomios ortogonales sobre los niveles numéricos de un factor, curva ajustada a las medias y su óptimo. */
  function polinomios(M, factor, dentro, grado) {
    return grupos(M, [factor], dentro).map(G => {
      const x = G.filas.map(f => Number(f.niveles[factor]));
      exigir(x.every(Number.isFinite), T('Los niveles de «{f}» deben ser números (dosis, densidades, fechas…) para los polinomios.', { f: factor }));
      const k = x.length;
      exigir(k >= 3, T('Hacen falta al menos tres niveles para los polinomios.'));
      const g = Math.min(grado || 3, k - 1);
      const P = SP.formula.polinomios(k, x);
      const NOM = ['', T('Lineal'), T('Cuadrático'), T('Cúbico'), T('Cuártico'), T('Grado 5')];
      const C = Array.from({ length: k - 1 }, (_, d) => ({ nombre: NOM[d + 1] || T('Grado {g}', { g: d + 1 }), coef: P.map(fila => fila[d + 1]) }));
      const filas = C.map(c => {
        const L = new Float64Array(G.filas[0].L.length);
        c.coef.forEach((w, i) => { if (w) G.filas[i].L.forEach((v, j) => { L[j] += w * v; }); });
        const est = M.est(L), vv = M.varianza(L), ee = sqrt(vv.v), t = est / ee;
        const out = { nombre: c.nombre, coef: c.coef, est, ee, gl: vv.gl, t, F: t * t, p: 2 * D().pt(abs(t), vv.gl, false) };
        if (M.tipo === 'lineal') out.sc = t * t * M.cme;
        return out;
      });
      /* curva de grado g ajustada a las medias (pesos iguales) */
      const y = G.filas.map(f => f.est), X = new Float64Array(k * (g + 1));
      for (let i = 0; i < k; i++) for (let d = 0; d <= g; d++) X[i + d * k] = Math.pow(x[i], d);
      const mc = SP.algebra.minimosCuadrados(X, k, g + 1, Float64Array.from(y), 1e-10);
      const coef = Array.from(mc.coeficientes);
      let r2 = NaN;
      { const ym = y.reduce((s, v) => s + v, 0) / k; const sct = y.reduce((s, v) => s + (v - ym) ** 2, 0); r2 = sct > 0 ? 1 - mc.scResidual / sct : NaN; }
      let optimo = null;
      if (g === 2 && coef[2] !== 0) {
        const xo = -coef[1] / (2 * coef[2]);
        optimo = { x: xo, y: coef[0] + coef[1] * xo + coef[2] * xo * xo, tipo: coef[2] < 0 ? 'maximo' : 'minimo', dentro: xo >= Math.min(...x) && xo <= Math.max(...x) };
      }
      return { dentro: G.dentro, x, medias: y, grado: g, polinomios: filas, curva: { coef, r2 }, optimo };
    });
  }

  /** Medias marginales estimadas con su intervalo de confianza. */
  function medias(M, spec, dentro, nivel) {
    return grupos(M, spec, dentro).map(G => ({
      dentro: G.dentro,
      filas: G.filas.map(f => {
        const c = D().qt(1 - (1 - nivel) / 2, f.gl);
        return { nombre: f.nombre, niveles: f.niveles, media: f.est, ee: f.ee, gl: f.gl, ic: [f.est - c * f.ee, f.est + c * f.ee] };
      }),
    }));
  }

  /* ---------------- atajos planos para las pruebas ---------------- */
  const disenoDe = (e) => { const d = Object.assign({}, e); const dis = d.diseno; delete d.diseno; return { dis, d }; };
  function paresDe(tabla, e, spec, dentro, metodos, alfa) {
    const { dis, d } = disenoDe(e), M = modelo(tabla, dis, d);
    const out = {};
    for (const m of metodos) {
      const r = pares(M, spec, dentro || [], m, alfa || 0.05);
      out[m] = r.map(G => ({ medias: G.medias.map(x => x.media), letras: G.medias.map(x => x.letras), dif: G.pares.map(x => x.dif), ee: G.pares.map(x => x.ee), gl: G.pares.map(x => x.gl), t: G.pares.map(x => x.t), p: G.pares.map(x => x.p_ajustado) }));
    }
    return out;
  }
  const rangoMultipleDe = (tabla, e, spec, dentro, metodo, alfa) => paresDe(tabla, e, spec, dentro, [metodo], alfa)[metodo];
  function dunnettDe(tabla, e, spec, dentro, testigo, alternativa) {
    const { dis, d } = disenoDe(e), M = modelo(tabla, dis, d);
    return dunnett(M, spec, dentro || [], testigo, alternativa || 'bilateral').map(G => ({ dif: G.comparaciones.map(x => x.dif), ee: G.comparaciones.map(x => x.ee), t: G.comparaciones.map(x => x.t), p: G.comparaciones.map(x => x.p_ajustado) }));
  }
  function gamesHowellDe(tabla, respuesta, factor) {
    const G = gamesHowell(tabla, respuesta, factor, 0.05)[0];
    return { q: G.pares.map(x => x.q), gl: G.pares.map(x => x.gl), p: G.pares.map(x => x.p_ajustado), letras: G.medias.map(x => x.letras) };
  }
  function contrastesDe(tabla, e, factor, dentro, C) {
    const { dis, d } = disenoDe(e), M = modelo(tabla, dis, d);
    return contrastes(M, factor, dentro || [], C).map(G => ({ est: G.contrastes.map(x => x.est), ee: G.contrastes.map(x => x.ee), gl: G.contrastes.map(x => x.gl), t: G.contrastes.map(x => x.t), p: G.contrastes.map(x => x.p), sc: G.contrastes.map(x => x.sc ?? NaN), ortogonales: G.todosOrtogonales }));
  }
  function polinomiosDe(tabla, e, factor, dentro, grado) {
    const { dis, d } = disenoDe(e), M = modelo(tabla, dis, d);
    return polinomios(M, factor, dentro || [], grado).map(G => ({ est: G.polinomios.map(x => x.est), ee: G.polinomios.map(x => x.ee), gl: G.polinomios.map(x => x.gl), F: G.polinomios.map(x => x.F), p: G.polinomios.map(x => x.p),
      sc: G.polinomios.map(x => x.sc ?? NaN), curva: G.curva.coef, optimo: G.optimo ? [G.optimo.x, G.optimo.y] : null }));
  }
  function mediasDe(tabla, e, spec, dentro, nivel) {
    const { dis, d } = disenoDe(e), M = modelo(tabla, dis, d);
    return medias(M, spec, dentro || [], nivel || 0.95).map(G => ({ media: G.filas.map(x => x.media), ee: G.filas.map(x => x.ee), gl: G.filas.map(x => x.gl), inf: G.filas.map(x => x.ic[0]), sup: G.filas.map(x => x.ic[1]) }));
  }

  SP.comp = { modelo, modeloLineal, grupos, pares, dunnett, dunnettProb, gamesHowell, contrastes, polinomios, medias, lambdasProducto,
    paresDe, rangoMultipleDe, dunnettDe, gamesHowellDe, contrastesDe, polinomiosDe, mediasDe };

  /* ======================= métodos ======================= */
  const PAPELES = ['respuesta', 'tratamientos', 'bloque', 'fila', 'columna', 'repeticion', 'parcelaGrande', 'subparcela', 'subsubparcela', 'franjaA', 'franjaB', 'principal'];
  const NOMBRE_METODO = { dms: 'DMS de Fisher', 'dms-protegida': 'DMS de Fisher protegida', tukey: 'Tukey', duncan: 'Duncan', snk: 'Student-Newman-Keuls', scheffe: 'Scheffé',
    bonferroni: 'Bonferroni', sidak: 'Šidák', holm: 'Holm', dunnett: 'Dunnett', 'games-howell': 'Games-Howell' };
  const lista = v => [].concat(v || []).filter(Boolean);
  const papelesDe = e => { const d = {}; for (const k of PAPELES) if (e[k] !== undefined) d[k] = e[k]; return d; };
  const fp = p => (!Number.isFinite(p) ? '—' : p < 0.001 ? '< 0.001' : '= ' + p.toFixed(3));
  const f3 = x => (Number.isFinite(x) ? x.toFixed(3).replace(/^-/, '−') : '—');
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  const etDentro = de => Object.entries(de).map(([f, l]) => `${f} = ${l}`).join(', ');
  const may = t => t.charAt(0).toUpperCase() + t.slice(1);
  /* gl de Satterthwaite que salen 44.999999… se muestran enteros */
  const glBonito = g => (Number.isFinite(g) && Math.abs(g - Math.round(g)) < 1e-8 ? Math.round(g) : g);

  /** Factores de tratamiento del diseño (los que se pueden comparar). */
  function factoresDe(e) {
    const def = SP.disenos.modeloDe(e.diseno, papelesDe(e));
    return def.factores;
  }
  function validarComp(tabla, e, op) {
    exigir(SP.disenos.DISENOS[e.diseno], T('Elige el diseño del experimento.'));
    SP.metodos[e.diseno].validar(tabla, papelesDe(e), Object.assign({ tipoSC: 1 }, op));
    const facs = factoresDe(e), comp = lista(e.comparar), den = lista(e.dentro);
    exigir(comp.length >= 1, T('Elige el factor cuyas medias quieres comparar.'));
    exigir(comp.every(f => facs.includes(f)), T('Solo se comparan factores de tratamiento del diseño.'));
    exigir(den.every(f => facs.includes(f) && !comp.includes(f)), T('«Dentro de» debe ser otro factor de tratamiento del diseño.'));
    exigir(op.alfa > 0 && op.alfa < 1, T('El nivel de significancia va entre 0 y 1.'));
  }
  /** p de la prueba F del término comparado (para la DMS protegida). */
  function pDelTermino(r, termino) {
    const filas = r.estratos ? r.estratos.flatMap(s => s.filas) : r.anova.fuente.map((f, k) => ({ fuente: f, p: r.anova.p[k] }));
    const f = filas.find(x => x.fuente === termino);
    return f ? f.p : NaN;
  }

  /* ---- comparaciones de medias ---- */
  function calcularComparaciones(tabla, e, op) {
    const comp = lista(e.comparar), den = lista(e.dentro), metodo = op.metodo;
    if (metodo === 'games-howell') {
      exigir(e.diseno === 'dca' && lista(e.tratamientos).length === 1 && !den.length, T('Games-Howell es para un solo factor en un diseño completamente al azar (varianzas distintas por grupo).'), T('Para otros diseños usa Tukey o Bonferroni.'));
      const t = SP.disenos.tablaDiseno(tabla, papelesDe(e), SP.disenos.DISENOS.dca.roles);
      return { tipo: 'pares', metodo, comparar: comp, dentro: den, alfa: op.alfa, respuesta: e.respuesta, grupos: gamesHowell(t, e.respuesta, comp[0], op.alfa) };
    }
    const M = modelo(tabla, e.diseno, papelesDe(e));
    const base = { metodo, comparar: comp, dentro: den, alfa: op.alfa, respuesta: e.respuesta, diseno: e.diseno, tipoModelo: M.tipo, resumen: M.r.resumen };
    if (metodo === 'dunnett') {
      exigir(op.testigo, T('Elige el testigo para Dunnett.'));
      return Object.assign(base, { tipo: 'dunnett', alternativa: op.alternativa || 'bilateral', grupos: dunnett(M, comp, den, op.testigo, op.alternativa || 'bilateral') });
    }
    const protegida = metodo === 'dms-protegida';
    const G = pares(M, comp, den, protegida ? 'dms' : metodo, op.alfa);
    if (protegida) {
      const termino = comp.join(':'), pF = pDelTermino(M.r, termino);
      base.pF = pF;
      if (!(pF < op.alfa)) for (const g of G) { for (const x of g.pares) x.p_ajustado = 1; g.medias.forEach(m => { m.letras = 'a'; }); }
    }
    return Object.assign(base, { tipo: 'pares', grupos: G });
  }
  function reporteComparaciones(r) {
    const a = r.alfa, conclusiones = [], cuadros = [], nm = NOMBRE_METODO[r.metodo];
    const que = r.comparar.join(' × ');
    if (r.tipo === 'dunnett') {
      for (const g of r.grupos) {
        const dif = g.comparaciones.filter(c => c.p_ajustado < a);
        const pre = Object.keys(g.dentro).length ? etDentro(g.dentro) + ': ' : '';
        conclusiones.push(dif.length
          ? T('{pre}difieren del testigo «{t}»: {l}.', { pre, t: g.testigo, l: dif.map(c => `${c.nombre || c.nivel} (${c.dif > 0 ? '+' : '−'}${f3(Math.abs(c.dif))}, p ${fp(c.p_ajustado)})`).join('; ') })
          : T('{pre}ningún tratamiento difiere del testigo «{t}» (α = {a}).', { pre, t: g.testigo, a }));
        cuadros.push({ id: 'dunnett-' + cuadros.length, titulo: T('Dunnett contra «{t}»{d}', { t: g.testigo, d: pre ? ' (' + pre.slice(0, -2) + ')' : '' }),
          columnas: [col('nivel', que, 'texto'), col('dif', T('Diferencia con el testigo'), 'forma'), col('ee', T('EE'), 'forma'), col('t', 't', 'forma2'), col('p', T('p ajustado'), 'pvalor'), col('decision', T('¿Difiere?'), 'texto')],
          filas: g.comparaciones.map(c => ({ nivel: c.nivel, dif: c.dif, ee: c.ee, t: c.t, p: c.p_ajustado, decision: c.p_ajustado < a ? T('sí') : T('no') })),
          notas: [T('{alt}; p de un solo paso con la t multivariada exacta (gl = {gl}).', { alt: { bilateral: T('Bilateral'), mayor: T('Una cola: mayor que el testigo'), menor: T('Una cola: menor que el testigo') }[r.alternativa], gl: g.comparaciones[0] ? g.comparaciones[0].gl : '' })] });
      }
      return { titulo: T('Dunnett: cada tratamiento contra el testigo'), conclusiones: conclusiones.map(may), cuadros };
    }
    for (const g of r.grupos) {
      const pre = Object.keys(g.dentro).length ? etDentro(g.dentro) : '';
      const orden = g.medias.map((m, i) => i).sort((x, y) => g.medias[y].media - g.medias[x].media);
      const letras = [...new Set(g.medias.flatMap(m => m.letras.split('')))];
      conclusiones.push(T('{pre}{k} grupos de medias según {m} (α = {a}): {l}.', { pre: pre ? pre + ': ' : '', k: letras.length, m: nm, a,
        l: letras.map(L => `${L}: ${orden.filter(i => g.medias[i].letras.includes(L)).map(i => g.medias[i].nombre).join(', ')}`).join('; ') }));
      cuadros.push({ id: 'medias-' + cuadros.length, titulo: T('Medias de {q}{d} con su grupo ({m})', { q: que, d: pre ? ' (' + pre + ')' : '', m: nm }),
        columnas: [col('nombre', que, 'texto'), col('media', T('Media'), 'forma')].concat(g.medias.some(m => Number.isFinite(m.ee)) ? [col('ee', T('EE'), 'forma')] : []).concat([col('letras', T('Grupo'), 'texto')]),
        filas: orden.map(i => g.medias[i]),
        notas: [T('Medias con una letra en común no difieren (α = {a}).', { a }).concat(r.tipoModelo === 'estratos' ? ' ' + T('Diseño con estratos de error: cada diferencia usa el error que le corresponde y los gl de Satterthwaite.') : '')]
          .concat(r.metodo === 'dms-protegida' ? [Number.isFinite(r.pF) && r.pF < a ? T('La F de {t} fue significativa (p {p}): se aplica la DMS.', { t: que, p: fp(r.pF) }) : T('La F de {t} no fue significativa (p {p}): la DMS protegida no separa medias.', { t: que, p: fp(r.pF) })] : []) });
      const usaQ = r.metodo === 'duncan' || r.metodo === 'snk' || r.metodo === 'games-howell';
      cuadros.push({ id: 'pares-' + cuadros.length, titulo: T('Comparaciones por pares{d}: {m}', { d: pre ? ' (' + pre + ')' : '', m: nm }),
        columnas: [col('par', T('Par'), 'texto'), col('dif', T('Diferencia'), 'forma'), col('ee', T('EE'), 'forma'), col('gl', 'gl', 'num'), col('est', usaQ ? 'q' : 't', 'forma2'), col('p', T('p ajustado'), 'pvalor'), col('decision', T('¿Difieren?'), 'texto')],
        filas: g.pares.map(x => ({ par: `${g.medias[x.a].nombre} – ${g.medias[x.b].nombre}`, dif: x.dif, ee: x.ee_comun ? x.ee_comun : x.ee, gl: glBonito(x.gl), est: x.q !== undefined ? x.q : x.t, p: x.p_ajustado, decision: x.p_ajustado < a ? T('sí') : T('no') })),
        notas: r.metodo === 'duncan' || r.metodo === 'snk' ? [T('EE común de una media con la media armónica de las repeticiones, como en los cuadros clásicos de rango múltiple.')] : [] });
    }
    return { titulo: T('Comparación de medias: {m}', { m: nm }), conclusiones: conclusiones.map(may), cuadros };
  }

  /* ---- contrastes ---- */
  /** «nombre: 2 -1 -1» por renglón (también con comas o punto y coma). */
  function leerContrastes(texto, k) {
    const C = String(texto || '').split(/\n/).map(s => s.trim()).filter(Boolean).map((s, i) => {
      const m = s.match(/^(.*?)[:=]\s*(.*)$/);
      const nombre = m ? m[1].trim() : T('Contraste {i}', { i: i + 1 }), resto = m ? m[2] : s;
      const coef = resto.split(/[\s,;]+/).filter(Boolean).map(Number);
      exigir(coef.length && coef.every(Number.isFinite), T('El renglón «{s}» no tiene coeficientes numéricos.', { s }));
      exigir(coef.length === k, T('El contraste «{n}» tiene {a} coeficientes y el factor {k} niveles.', { n: nombre, a: coef.length, k }));
      return { nombre, coef };
    });
    exigir(C.length >= 1, T('Escribe al menos un contraste: un renglón por contraste, «nombre: coeficientes».'));
    return C;
  }
  function calcularContrastes(tabla, e, op) {
    const comp = lista(e.comparar), den = lista(e.dentro);
    exigir(comp.length === 1, T('Los contrastes se definen sobre un solo factor.'));
    const M = modelo(tabla, e.diseno, papelesDe(e));
    const k = M.R.niveles[M.R.factores.indexOf(comp[0])].length;
    const C = leerContrastes(op.contrastes, k);
    return { tipo: 'contrastes', factor: comp[0], niveles: M.R.niveles[M.R.factores.indexOf(comp[0])], dentro: den, alfa: op.alfa, tipoModelo: M.tipo, grupos: contrastes(M, comp[0], den, C) };
  }
  function reporteContrastes(r) {
    const a = r.alfa, conclusiones = [], cuadros = [];
    for (const g of r.grupos) {
      const pre = Object.keys(g.dentro).length ? etDentro(g.dentro) + ': ' : '';
      for (const c of g.contrastes) conclusiones.push(c.p < a
        ? T('{pre}«{n}» es significativo: estimación {e} (t = {t}, p {p}).', { pre, n: c.nombre, e: f3(c.est), t: f3(c.t), p: fp(c.p) })
        : T('{pre}«{n}» no es significativo (estimación {e}, p {p}).', { pre, n: c.nombre, e: f3(c.est), p: fp(c.p) }));
      const notas = [g.todosOrtogonales ? T('Los contrastes son ortogonales: sus sumas de cuadrados se suman sin traslaparse.') : T('Hay contrastes que no son ortogonales entre sí: sus sumas de cuadrados se traslapan.')];
      if (g.contrastes.some(c => !c.sumaCero)) notas.push(T('Algún renglón no suma cero: no es un contraste entre medias sino una combinación lineal.'));
      cuadros.push({ id: 'contrastes-' + cuadros.length, titulo: T('Contrastes de «{f}»{d}', { f: r.factor, d: pre ? ' (' + pre.slice(0, -2) + ')' : '' }),
        columnas: [col('nombre', T('Contraste'), 'texto'), col('coef', T('Coeficientes'), 'texto'), col('est', T('Estimación'), 'forma'), col('ee', T('EE'), 'forma'), col('gl', 'gl', 'num'), col('t', 't', 'forma2'), col('p', 'p', 'pvalor')]
          .concat(r.tipoModelo === 'lineal' ? [col('sc', T('SC'), 'auto4')] : []),
        filas: g.contrastes.map(c => ({ nombre: c.nombre, coef: c.coef.map(x => String(x).replace(/^-/, '−')).join(' '), est: c.est, ee: c.ee, gl: glBonito(c.gl), t: c.t, p: c.p, sc: c.sc })),
        notas: notas.concat([T('Coeficientes en el orden de los niveles: {n}.', { n: r.niveles.join(', ') })]) });
    }
    return { titulo: T('Contrastes de «{f}»', { f: r.factor }), conclusiones: conclusiones.map(may), cuadros };
  }

  /* ---- polinomios ortogonales ---- */
  function calcularPolinomios(tabla, e, op) {
    const comp = lista(e.comparar), den = lista(e.dentro);
    exigir(comp.length === 1, T('Los polinomios se calculan sobre un solo factor cuantitativo (dosis, densidad…).'));
    const M = modelo(tabla, e.diseno, papelesDe(e));
    return { tipo: 'polinomios', factor: comp[0], dentro: den, alfa: op.alfa, respuesta: e.respuesta, tipoModelo: M.tipo, grupos: polinomios(M, comp[0], den, Number(op.grado) || 2) };
  }
  function ecuacion(coef) {
    const t = coef.map((b, d) => {
      const v = (Math.abs(b) >= 1e-3 || b === 0 ? b.toPrecision(4) : b.toExponential(3)).replace(/^-/, '−');
      return d === 0 ? v : `${v}·x${d > 1 ? (d === 2 ? '²' : '³') : ''}`;
    });
    return 'y = ' + t.join(' + ').replace(/\+ −/g, '− ');
  }
  function reportePolinomios(r) {
    const a = r.alfa, conclusiones = [], cuadros = [];
    for (const g of r.grupos) {
      const pre = Object.keys(g.dentro).length ? etDentro(g.dentro) + ': ' : '';
      const sig = g.polinomios.filter(x => x.p < a).map(x => x.nombre.toLowerCase());
      const lista = sig.length > 1 ? sig.slice(0, -1).join(', ') + ' ' + T('y') + ' ' + sig[sig.length - 1] : sig[0];
      conclusiones.push(sig.length ? (sig.length > 1 ? T('{pre}la respuesta a {f} tiene componentes {c} significativos.', { pre, f: r.factor, c: lista }) : T('{pre}la respuesta a {f} tiene componente {c} significativo.', { pre, f: r.factor, c: lista })) : T('{pre}ningún componente polinomial de {f} es significativo (α = {a}).', { pre, f: r.factor, a }));
      if (g.optimo) {
        conclusiones.push(g.optimo.dentro
          ? T('{pre}la curva cuadrática tiene su {t} en {f} = {x} (respuesta estimada {y}).', { pre, t: g.optimo.tipo === 'maximo' ? T('máximo') : T('mínimo'), f: r.factor, x: f3(g.optimo.x), y: f3(g.optimo.y) })
          : T('{pre}el {t} de la curva cuadrática ({f} = {x}) cae fuera de las dosis probadas: no conviene extrapolar.', { pre, t: g.optimo.tipo === 'maximo' ? T('máximo') : T('mínimo'), f: r.factor, x: f3(g.optimo.x) }));
      }
      cuadros.push({ id: 'polinomios-' + cuadros.length, titulo: T('Polinomios ortogonales de «{f}»{d}', { f: r.factor, d: pre ? ' (' + pre.slice(0, -2) + ')' : '' }),
        columnas: [col('nombre', T('Componente'), 'texto'), col('est', T('Estimación'), 'forma'), col('ee', T('EE'), 'forma'), col('gl', 'gl', 'num'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')].concat(r.tipoModelo === 'lineal' ? [col('sc', T('SC'), 'auto4')] : []),
        filas: g.polinomios.map(x => Object.assign({}, x, { gl: glBonito(x.gl) })),
        notas: [T('Coeficientes ortogonales sobre los niveles reales ({x}), también si no están igualmente espaciados.', { x: g.x.join(', ') }),
          T('Curva de grado {g} ajustada a las medias: {e} (R² = {r}).', { g: g.grado, e: ecuacion(g.curva.coef), r: f3(g.curva.r2) })] });
    }
    return { titulo: T('Polinomios ortogonales de «{f}»', { f: r.factor }), conclusiones: conclusiones.map(may), cuadros };
  }

  /* ---- medias ajustadas ---- */
  function calcularMedias(tabla, e, op) {
    const comp = lista(e.comparar), den = lista(e.dentro);
    const M = modelo(tabla, e.diseno, papelesDe(e));
    exigir(M.tipo === 'lineal', T('Las medias ajustadas con su intervalo necesitan un solo error; en parcelas divididas compara las medias con «Comparaciones de medias».'));
    return { tipo: 'medias', comparar: comp, dentro: den, nivel: op.nivel, respuesta: e.respuesta, grupos: medias(M, comp, den, op.nivel) };
  }
  function reporteMedias(r) {
    const nv = Math.round(r.nivel * 100), cuadros = r.grupos.map((g, i) => ({ id: 'medias-' + i,
      titulo: T('Medias marginales estimadas de {q}{d}', { q: r.comparar.join(' × '), d: Object.keys(g.dentro).length ? ' (' + etDentro(g.dentro) + ')' : '' }),
      columnas: [col('nombre', r.comparar.join(' × '), 'texto'), col('media', T('Media'), 'forma'), col('ee', T('EE'), 'forma'), col('gl', 'gl', 'num'), col('ic', T('IC {nv} %', { nv }), 'intervalo')],
      filas: g.filas.map(f => Object.assign({ _dec: 3 }, f, { gl: glBonito(f.gl) })), notas: [T('Promedios con pesos iguales sobre los demás factores (rejilla de referencia); con datos balanceados son las medias de siempre.')] }));
    return { titulo: T('Medias ajustadas'), conclusiones: [T('Medias de {q} con su intervalo de confianza del {nv} %.', { q: r.comparar.join(' × '), nv })], cuadros };
  }

  /* ---- código R ---- */
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  function modeloR(e) {
    const def = SP.disenos.modeloDe(e.diseno, papelesDe(e));
    const facs = [...new Set([...(def.bloques || []), ...def.factores, ...(def.unidades || []).flat()].filter(Boolean))];
    const L = facs.map(f => `datos$${q(f)} <- factor(datos$${q(f)})`);
    if (def.error) {
      /* los bloques solo en el error, como los usa emmeans para combinar estratos */
      const fija = e.diseno === 'parcelas-divididas' && e.principal === 'latino' ? def.formula : `${q(e.respuesta)} ~ ${def.factores.map(q).join(' * ')}`;
      L.push(`modelo <- aov(${fija} + Error(${def.error}), data = datos)`);
    } else L.push(`modelo <- lm(${def.formula}, data = datos)`);
    return L;
  }
  const especR = e => { const c = lista(e.comparar).map(q).join(' * '), d = lista(e.dentro).map(q).join(' * '); return `~ ${c}${d ? ' | ' + d : ''}`; };
  const LETRAS_R = ['# letras como SigmaPro: en cada grupo, medias de mayor a menor y multcompView::multcompLetters(p < alfa)',
    'letras <- function(emm, pr, alfa) {',
    '  med <- as.data.frame(emm); fin <- which(names(med) == "emmean") - 1; por <- intersect(setdiff(names(pr), c("contrast", "estimate", "SE", "df", "t.ratio", "p.value")), names(med)[seq_len(fin)])',
    '  spec <- setdiff(names(med)[seq_len(fin)], por)',
    '  g1 <- if (length(por)) interaction(med[por], drop = TRUE) else factor(rep(1, nrow(med))); g2 <- if (length(por)) interaction(pr[por], drop = TRUE) else factor(rep(1, nrow(pr)))',
    '  unlist(lapply(levels(g1), function(g) {',
    '    x <- med[g1 == g, ]; niv <- do.call(paste, c(x[spec], sep = ":")); k <- length(niv)',
    '    m <- matrix(FALSE, k, k, dimnames = list(niv, niv)); m[lower.tri(m)] <- pr$p.value[g2 == g] < alfa; m <- m | t(m); o <- order(-x$emmean)',
    '    multcompView::multcompLetters(m[o, o])$Letters[niv]',
    '  }))',
    '}'];
  function codigoComparaciones(e, op) {
    const adj = { dms: 'none', 'dms-protegida': 'none', tukey: 'tukey', scheffe: 'scheffe', bonferroni: 'bonferroni', sidak: 'sidak', holm: 'holm' }[op.metodo];
    const L = [`# ${NOMBRE_METODO[op.metodo]} (código R equivalente a SigmaPro)`, ...modeloR(e), '# install.packages(c("emmeans", "multcompView", "agricolae"))'];
    if (op.metodo === 'games-howell') L.push(`PMCMRplus::gamesHowellTest(datos$${q(e.respuesta)}, datos$${q(lista(e.comparar)[0])})`);
    else if (op.metodo === 'duncan' || op.metodo === 'snk') L.push(`agricolae::${op.metodo === 'duncan' ? 'duncan.test' : 'SNK.test'}(modelo, "${lista(e.comparar).join(':')}", alpha = ${op.alfa}, console = TRUE)`);
    else if (op.metodo === 'dunnett') L.push(`emm <- emmeans::emmeans(modelo, ${especR(e)})`, `dn <- emmeans::contrast(emm, "trt.vs.ctrl", ref = "${op.testigo}", adjust = "mvt", side = "${{ bilateral: '=', mayor: '>', menor: '<' }[op.alternativa || 'bilateral']}")`);
    else L.push(`emm <- emmeans::emmeans(modelo, ${especR(e)})`, `pr <- as.data.frame(pairs(emm, adjust = "${adj}")); pr`, ...LETRAS_R, `letras(emm, pr, ${op.alfa})`);
    return L.join('\n');
  }
  function codigoContrastes(e, op) {
    let C = [];
    try { C = String(op.contrastes || '').split('\n').filter(s => s.trim()).map((s, i) => { const m = s.match(/^(.*?)[:=]\s*(.*)$/); return { n: m ? m[1].trim() : `c${i + 1}`, c: (m ? m[2] : s).split(/[\s,;]+/).filter(Boolean).join(', ') }; }); } catch (err) { C = []; }
    return [`# Contrastes (código R equivalente a SigmaPro)`, ...modeloR(e), `emm <- emmeans::emmeans(modelo, ${especR(e)})`,
      `ct <- emmeans::contrast(emm, method = list(${C.map(x => `${JSON.stringify(x.n)} = c(${x.c})`).join(', ')}))`, '# SC de un contraste = t² · CM del error'].join('\n');
  }
  function codigoPolinomios(e, op) {
    const f = lista(e.comparar)[0];
    return [`# Polinomios ortogonales (código R equivalente a SigmaPro)`, ...modeloR(e), `x <- sort(unique(as.numeric(as.character(datos$${q(f)}))))`,
      `P <- contr.poly(length(x), scores = x)   # coeficientes ortogonales con los niveles reales`,
      `emm <- emmeans::emmeans(modelo, ${especR(e)})`, `pc <- emmeans::contrast(emm, method = setNames(lapply(seq_len(ncol(P)), function(j) P[, j]), c("lineal", "cuadratico", "cubico", paste0("grado", 4:9))[seq_len(ncol(P))]))`,
      `medias <- as.data.frame(emm)$emmean`, `curva <- lm(medias ~ poly(x, ${Number(op.grado) || 2}, raw = TRUE)); coef(curva)`,
      ...(Number(op.grado || 2) === 2 ? ['-coef(curva)[2] / (2 * coef(curva)[3])   # dosis del máximo o del mínimo'] : [])].join('\n');
  }
  function codigoMedias(e, op) {
    return [`# Medias ajustadas (código R equivalente a SigmaPro)`, ...modeloR(e), `ci <- confint(emmeans::emmeans(modelo, ${especR(e)}), level = ${op.nivel}); ci`].join('\n');
  }

  const ENTRADAS = { diseno: { tipo: 'cualquiera' }, respuesta: { tipo: 'numerica' }, comparar: { tipo: 'factor+' }, dentro: { tipo: 'factor+', opcional: true },
    tratamientos: { tipo: 'factor+', opcional: true }, bloque: { tipo: 'factor', opcional: true }, fila: { tipo: 'factor', opcional: true }, columna: { tipo: 'factor', opcional: true },
    repeticion: { tipo: 'factor', opcional: true }, parcelaGrande: { tipo: 'factor', opcional: true }, subparcela: { tipo: 'factor', opcional: true },
    subsubparcela: { tipo: 'factor', opcional: true }, franjaA: { tipo: 'factor', opcional: true }, franjaB: { tipo: 'factor', opcional: true }, principal: { tipo: 'cualquiera', opcional: true } };
  SP.metodo({ id: 'comparaciones-medias', familia: 'comparaciones', motor: 'js', orden: 0, nombre: T('Comparaciones de medias'),
    resumen: T('Tukey, DMS, Duncan, SNK, Scheffé, Bonferroni, Šidák, Holm, Dunnett o Games-Howell sobre las medias del diseño, con letras; también dentro de cada nivel de otro factor y en parcelas divididas.'),
    entradas: ENTRADAS, opciones: { metodo: { tipo: 'texto', omision: 'tukey' }, testigo: { tipo: 'texto', omision: '' }, alternativa: { tipo: 'texto', omision: 'bilateral' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (t, e, op) => { validarComp(t, e, op); exigir(NOMBRE_METODO[op.metodo], T('Método de comparación desconocido.')); },
    calcular: calcularComparaciones, reporte: reporteComparaciones, codigoR: codigoComparaciones });
  SP.metodo({ id: 'contrastes', familia: 'comparaciones', motor: 'js', orden: 1, nombre: T('Contrastes'),
    resumen: T('Contrastes que tú defines entre las medias de un factor, con su prueba, su suma de cuadrados y la revisión de ortogonalidad.'),
    entradas: ENTRADAS, opciones: { contrastes: { tipo: 'texto', omision: '' }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarComp, calcular: calcularContrastes, reporte: reporteContrastes, codigoR: codigoContrastes });
  SP.metodo({ id: 'polinomios', familia: 'comparaciones', motor: 'js', orden: 2, nombre: T('Polinomios ortogonales'),
    resumen: T('Respuesta lineal, cuadrática o cúbica a dosis (igual o desigualmente espaciadas), con la curva ajustada y la dosis óptima.'),
    entradas: ENTRADAS, opciones: { grado: { tipo: 'numero', omision: 2 }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: validarComp, calcular: calcularPolinomios, reporte: reportePolinomios, codigoR: codigoPolinomios });
  SP.metodo({ id: 'medias-ajustadas', familia: 'comparaciones', motor: 'js', orden: 3, nombre: T('Medias ajustadas'),
    resumen: T('Medias marginales estimadas con su error estándar e intervalo de confianza (ajustadas por bloques, parcelas perdidas o bloques incompletos).'),
    entradas: ENTRADAS, opciones: { nivel: { tipo: 'numero', omision: 0.95 }, alfa: { tipo: 'numero', omision: 0.05 } },
    validar: (t, e, op) => { validarComp(t, e, op); exigir(op.nivel > 0 && op.nivel < 1, T('El nivel de confianza va entre 0 y 1.')); },
    calcular: calcularMedias, reporte: reporteMedias, codigoR: codigoMedias });
});

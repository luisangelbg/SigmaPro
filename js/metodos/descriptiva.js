/* SigmaPro — descriptivos de variables numéricas, por hasta tres factores.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Funciones puras (SP.desc), validadas por separado contra R:
     cuantil(x, probs, tipo)        las nueve definiciones de Hyndman y Fan (1996), con el mismo código
                                    que quantile() de R 4.4 (incluido su margen de 4ε en los tipos 4 a 9)
     moda(x)                        { valores, frecuencia }: todos los valores más repetidos
     asimetria(x, tipo), curtosis(x, tipo)
                                    tipos 1, 2 y 3 de Joanes y Gill (1998); el 2 es el de uso común
                                    (estimador insesgado bajo normalidad) y trae su error estándar
     mediaRecortada(x, recorte)     como mean(x, trim) de R
     icMedia, icMediana, icVarianza intervalos t, de orden por la binomial y por la ji cuadrada
     resumen(x, opciones)           todo junto para un vector
     grupos(tabla, factores)        combinaciones de niveles presentes, en orden anidado
   Método registrado: 'descriptivos'. */
SP.definir('descriptiva', function (SP) {
  'use strict';
  const T = SP.T;
  const { floor, ceil, sqrt, abs, exp, log, min, max } = Math;
  const EPS = 2.220446049250313e-16;

  Object.assign(SP.nombresFunciones, {
    'desc.cuantil': 'Cuantiles: las nueve definiciones',
    'desc.asimetria': 'Coeficiente de asimetría (tres definiciones)',
    'desc.curtosis': 'Coeficiente de curtosis (tres definiciones)',
    'dist.qbinom': 'Binomial: cuantiles',
  });

  /** Copia ordenada sin faltantes. */
  const ordenado = x => SP.num.sinFaltantes(x).sort();

  /* ---------------- cuantiles ---------------- */
  const AB = { 4: [0, 1], 5: [0.5, 0.5], 6: [0, 0], 8: [1 / 3, 1 / 3], 9: [3 / 8, 3 / 8] };
  /** Cuantil p de una muestra YA ORDENADA, tipo 1 a 9. */
  function cuantilOrdenado(s, p, tipo) {
    const n = s.length;
    if (n === 0 || Number.isNaN(p)) return NaN;
    p = max(0, min(1, p));
    if (tipo === 7) {
      const indice = 1 + (n - 1) * p, lo = floor(indice), hi = ceil(indice);
      const qs = s[lo - 1];
      if (indice > lo && s[hi - 1] !== qs) { const h = indice - lo; return (1 - h) * qs + h * s[hi - 1]; }
      return qs;
    }
    let j, h;
    if (tipo <= 3) {
      const nppm = tipo === 3 ? n * p - 0.5 : n * p;
      j = floor(nppm);
      if (tipo === 1) h = nppm > j ? 1 : 0;
      else if (tipo === 2) h = ((nppm > j ? 1 : 0) + 1) / 2;
      else h = nppm !== j || ((j % 2) + 2) % 2 === 1 ? 1 : 0;     // j %% 2 de R (resto con el signo del divisor)
    } else {
      const [a, b] = AB[tipo];
      const fuzz = 4 * EPS;
      const nppm = a + p * (n + 1 - a - b);
      j = floor(nppm + fuzz);
      h = nppm - j;
      if (abs(h) < fuzz) h = 0;
    }
    /* R rellena la muestra con dos copias de cada extremo: x′ = (x₁, x₁, x₁ … xₙ, xₙ, xₙ) */
    const x = k => s[min(max(k - 3, 0), n - 1)];
    const a2 = x(j + 2), a3 = x(j + 3);
    if (h === 1) return a3;
    if (h > 0 && h < 1 && a2 !== a3) return (1 - h) * a2 + h * a3;
    return a2;
  }
  function cuantil(x, probs, tipo) {
    tipo = tipo === undefined ? 7 : tipo;
    if (!(tipo >= 1 && tipo <= 9 && tipo === floor(tipo))) throw new SP.ErrorSP(T('El tipo de cuantil va de 1 a 9.'));
    const s = ordenado(x);
    const una = !Array.isArray(probs) && !ArrayBuffer.isView(probs);
    const r = Array.from(una ? [probs] : probs, p => cuantilOrdenado(s, p, tipo));
    return una ? r[0] : r;
  }
  /** Mediana como median() de R (promedio de los dos centrales con n par). */
  function medianaOrdenada(s) {
    const n = s.length;
    if (!n) return NaN;
    const k = floor((n + 1) / 2);
    return n % 2 ? s[k - 1] : (s[k - 1] + s[k]) / 2;
  }

  /* ---------------- moda ---------------- */
  function modaOrdenada(s) {
    let mejor = 0, valores = [];
    for (let i = 0; i < s.length;) {
      let k = i + 1;
      while (k < s.length && s[k] === s[i]) k++;
      const f = k - i;
      if (f > mejor) { mejor = f; valores = [s[i]]; } else if (f === mejor) valores.push(s[i]);
      i = k;
    }
    return mejor > 1 ? { valores, frecuencia: mejor } : { valores: [], frecuencia: mejor };
  }
  const moda = x => modaOrdenada(ordenado(x));

  /* ---------------- forma ---------------- */
  /** Σ(x − x̄)², Σ(x − x̄)³ y Σ(x − x̄)⁴ con la media en dos pasadas. */
  function sumasCentrales(v) {
    const m = SP.num.media(v);
    let s2 = 0, s3 = 0, s4 = 0;
    for (let i = 0; i < v.length; i++) { const d = v[i] - m, d2 = d * d; s2 += d2; s3 += d2 * d; s4 += d2 * d2; }
    return { n: v.length, s2, s3, s4 };
  }
  function asimetriaDe(c, tipo) {
    const n = c.n;
    const g1 = sqrt(n) * c.s3 / Math.pow(c.s2, 1.5);
    if (tipo === 1) return g1;
    if (tipo === 2) return n < 3 ? NaN : g1 * sqrt(n * (n - 1)) / (n - 2);
    return g1 * Math.pow(1 - 1 / n, 1.5);
  }
  function curtosisDe(c, tipo) {
    const n = c.n;
    const r = n * c.s4 / (c.s2 * c.s2);
    if (tipo === 1) return r - 3;
    if (tipo === 2) return n < 4 ? NaN : ((n + 1) * (r - 3) + 6) * (n - 1) / ((n - 2) * (n - 3));
    return r * (1 - 1 / n) * (1 - 1 / n) - 3;
  }
  const revisarTipo = t => { if (t !== 1 && t !== 2 && t !== 3) throw new SP.ErrorSP(T('La definición de asimetría y curtosis es 1, 2 o 3.')); };
  function asimetria(x, tipo) { tipo = tipo || 2; revisarTipo(tipo); return asimetriaDe(sumasCentrales(SP.num.sinFaltantes(x)), tipo); }
  function curtosis(x, tipo) { tipo = tipo || 2; revisarTipo(tipo); return curtosisDe(sumasCentrales(SP.num.sinFaltantes(x)), tipo); }
  /** Errores estándar de la asimetría y la curtosis del tipo 2 bajo normalidad. */
  function eeForma(n) {
    const ea = n < 3 ? NaN : sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3)));
    const ek = n < 4 ? NaN : 2 * ea * sqrt((n * n - 1) / ((n - 3) * (n + 5)));
    return { asimetria: ea, curtosis: ek };
  }

  /* ---------------- medias ---------------- */
  function mediaRecortadaOrdenada(s, recorte) {
    const n = s.length;
    if (!n) return NaN;
    if (!(recorte > 0)) return SP.num.media(s);
    if (recorte >= 0.5) return medianaOrdenada(s);
    const lo = floor(n * recorte) + 1, hi = n + 1 - lo;
    return SP.num.media(s.subarray(lo - 1, hi));
  }
  const mediaRecortada = (x, recorte) => mediaRecortadaOrdenada(ordenado(x), recorte);
  /** Media geométrica y armónica: solo con todos los valores mayores que cero. */
  function geometrica(v) {
    if (!v.length || v.some(x => !(x > 0))) return NaN;
    return exp(SP.num.media(Float64Array.from(v, log)));
  }
  function armonica(v) {
    if (!v.length || v.some(x => !(x > 0))) return NaN;
    return 1 / SP.num.media(Float64Array.from(v, x => 1 / x));
  }

  /* ---------------- intervalos ---------------- */
  function icMedia(v, nivel) {
    const n = v.length;
    if (n < 2) return [NaN, NaN];
    const m = SP.num.media(v), ee = sqrt(SP.num.varianza(v) / n), t = SP.dist.qt((1 + nivel) / 2, n - 1);
    return [m - t * ee, m + t * ee];
  }
  /** Intervalo de la mediana por estadísticos de orden: [x₍ₖ₎, x₍ₙ₋ₖ₊₁₎] con k = qbinom(α/2, n, ½). */
  function icMedianaOrdenada(s, nivel) {
    const n = s.length;
    if (!n) return { inf: NaN, sup: NaN, nivel: NaN, k: NaN };
    const k = SP.dist.qbinom((1 - nivel) / 2, n, 0.5);
    if (k < 1) return { inf: NaN, sup: NaN, nivel: NaN, k };
    return { inf: s[k - 1], sup: s[n - k], nivel: 1 - 2 * SP.dist.pbinom(k - 1, n, 0.5), k };
  }
  const icMediana = (x, nivel) => icMedianaOrdenada(ordenado(x), nivel);
  function icVarianza(v, nivel) {
    const n = v.length;
    if (n < 2) return [NaN, NaN];
    const sc = (n - 1) * SP.num.varianza(v), a = 1 - nivel;
    return [sc / SP.dist.qchisq(1 - a / 2, n - 1), sc / SP.dist.qchisq(a / 2, n - 1)];
  }

  /* ---------------- resumen de un vector ---------------- */
  const OMISION = { nivel: 0.95, tipoCuantil: 7, recorte: 0.1, tipoForma: 2, percentiles: [] };
  function resumen(x, op) {
    op = Object.assign({}, OMISION, op || {});
    const v = SP.num.sinFaltantes(x), s = Float64Array.from(v).sort(), n = v.length;
    const media = SP.num.media(v), varianza = SP.num.varianza(v), de = sqrt(varianza);
    const q1 = cuantilOrdenado(s, 0.25, op.tipoCuantil), q3 = cuantilOrdenado(s, 0.75, op.tipoCuantil);
    const mo = modaOrdenada(s), c = sumasCentrales(v), ef = eeForma(n);
    const im = icMedia(v, op.nivel), imd = icMedianaOrdenada(s, op.nivel), iv = icVarianza(v, op.nivel);
    const r = {
      n, faltantes: x.length - n,
      media, mediana: medianaOrdenada(s),
      moda: mo.valores.length ? mo.valores[0] : NaN, modas: mo.valores.length, frec_moda: mo.valores.length ? mo.frecuencia : NaN,
      de, varianza, ee: de / sqrt(n), cv: 100 * de / media,
      min: n ? s[0] : NaN, max: n ? s[n - 1] : NaN, rango: n ? s[n - 1] - s[0] : NaN,
      q1, q3, ric: q3 - q1,
      media_recortada: mediaRecortadaOrdenada(s, op.recorte),
      media_geometrica: geometrica(v), media_armonica: armonica(v),
      asimetria: n ? asimetriaDe(c, op.tipoForma) : NaN, curtosis: n ? curtosisDe(c, op.tipoForma) : NaN,
      ee_asimetria: ef.asimetria, ee_curtosis: ef.curtosis,
      ic_media_inf: im[0], ic_media_sup: im[1],
      ic_mediana_inf: imd.inf, ic_mediana_sup: imd.sup, ic_mediana_nivel: imd.nivel,
      ic_varianza_inf: iv[0], ic_varianza_sup: iv[1], ic_de_inf: sqrt(iv[0]), ic_de_sup: sqrt(iv[1]),
    };
    for (const p of op.percentiles || []) r['p' + clavePercentil(p)] = cuantilOrdenado(s, p, op.tipoCuantil);
    return r;
  }
  /** 0.05 → «5», 0.025 → «2.5» (clave del percentil en el resultado). */
  const clavePercentil = p => String(Number((p * 100).toPrecision(12)));

  /** Cifras decimales con que vienen los datos (para mostrar las medias con una más). */
  function decimalesDe(v) {
    let d = 0;
    const paso = max(1, floor(v.length / 5000));
    for (let i = 0; i < v.length; i += paso) {
      const x = v[i];
      if (!Number.isFinite(x)) continue;
      while (d < 6) {
        const e = x * Math.pow(10, d);
        if (abs(e - Math.round(e)) <= 1e-9 * max(1, abs(e))) break;
        d++;
      }
      if (d === 6) break;
    }
    return d;
  }

  /* ---------------- grupos ---------------- */
  /**
   * Combinaciones de niveles con al menos una fila, en orden anidado (el primer factor cambia más
   * despacio). Las filas con algún factor faltante quedan fuera y se cuentan.
   */
  function grupos(tabla, factores) {
    factores = factores || [];
    if (!factores.length) return { grupos: [{ niveles: [], filas: null }], excluidas: 0 };
    const cols = factores.map(f => SP.estructura.comoFactor(tabla, f));
    const tam = cols.map(c => c.niveles.length);
    const porClave = new Map();
    let excluidas = 0;
    for (let i = 0; i < tabla.n; i++) {
      let k = 0, ok = true;
      for (let j = 0; j < cols.length; j++) { const c = cols[j].codigos[i]; if (c < 0) { ok = false; break; } k = k * tam[j] + c; }
      if (!ok) { excluidas++; continue; }
      let l = porClave.get(k);
      if (!l) porClave.set(k, (l = []));
      l.push(i);
    }
    const lista = [...porClave.keys()].sort((a, b) => a - b).map(k => {
      const niveles = new Array(cols.length);
      let r = k;
      for (let j = cols.length - 1; j >= 0; j--) { niveles[j] = cols[j].niveles[r % tam[j]]; r = floor(r / tam[j]); }
      return { niveles, filas: Int32Array.from(porClave.get(k)) };
    });
    return { grupos: lista, excluidas };
  }

  SP.desc = {
    cuantil, cuantilOrdenado, mediana: x => medianaOrdenada(ordenado(x)), moda, asimetria, curtosis, eeForma,
    mediaRecortada, geometrica: x => geometrica(SP.num.sinFaltantes(x)), armonica: x => armonica(SP.num.sinFaltantes(x)),
    icMedia: (x, nivel) => icMedia(SP.num.sinFaltantes(x), nivel), icMediana,
    icVarianza: (x, nivel) => icVarianza(SP.num.sinFaltantes(x), nivel),
    resumen, grupos, decimalesDe, clavePercentil, OMISION,
  };

  /* ======================= método: descriptivos ======================= */
  const ESTADISTICOS = ['n', 'faltantes', 'media', 'mediana', 'moda', 'modas', 'frec_moda', 'de', 'varianza', 'ee', 'cv',
    'min', 'max', 'rango', 'q1', 'q3', 'ric', 'media_recortada', 'media_geometrica', 'media_armonica',
    'asimetria', 'curtosis', 'ee_asimetria', 'ee_curtosis', 'ic_media_inf', 'ic_media_sup',
    'ic_mediana_inf', 'ic_mediana_sup', 'ic_mediana_nivel', 'ic_varianza_inf', 'ic_varianza_sup', 'ic_de_inf', 'ic_de_sup'];
  const lista = v => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);

  function revisarEntradas(tabla, e, op) {
    const vars = lista(e.variables), facs = lista(e.grupos);
    if (!vars.length) throw new SP.ErrorSP(T('Elige al menos una variable numérica.'));
    for (const v of vars) {
      if (!tabla.columnas[v]) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: v }));
      if (tabla.col(v).tipo !== 'numerica') throw new SP.ErrorSP(T('«{c}» no es numérica.', { c: v }), T('Los descriptivos son para mediciones; para un factor usa las frecuencias.'));
    }
    if (facs.length > 3) throw new SP.ErrorSP(T('Se puede agrupar por tres factores como máximo.'));
    for (const f of facs) {
      if (!tabla.columnas[f]) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: f }));
      if (vars.includes(f)) throw new SP.ErrorSP(T('«{c}» no puede ser a la vez variable y factor de agrupación.', { c: f }));
    }
    if (!(op.nivel > 0 && op.nivel < 1)) throw new SP.ErrorSP(T('El nivel de confianza va entre 0 y 1 (por ejemplo 0.95).'));
    if (!(op.tipoCuantil >= 1 && op.tipoCuantil <= 9)) throw new SP.ErrorSP(T('El tipo de cuantil va de 1 a 9.'));
    if (!(op.recorte >= 0 && op.recorte <= 0.5)) throw new SP.ErrorSP(T('El recorte de la media va de 0 a 0.5.'));
    revisarTipo(op.tipoForma);
    for (const p of op.percentiles || []) if (!(p >= 0 && p <= 1)) throw new SP.ErrorSP(T('Los percentiles van entre 0 y 1.'));
  }

  function calcular(tabla, e, op) {
    const vars = lista(e.variables), facs = lista(e.grupos);
    const { grupos: gs, excluidas } = grupos(tabla, facs);
    const out = { variable: [], grupo: {} };
    for (const f of facs) out.grupo[f] = [];
    for (const k of ESTADISTICOS) out[k] = [];
    const claves = (op.percentiles || []).map(p => 'p' + clavePercentil(p));
    for (const k of claves) out[k] = [];
    const decimales = {};
    for (const v of vars) {
      const col = tabla.col(v).valores;
      decimales[v] = decimalesDe(col);
      for (const g of gs) {
        const x = g.filas ? Float64Array.from(g.filas, i => col[i]) : col;
        const r = resumen(x, op);
        out.variable.push(v);
        facs.forEach((f, j) => out.grupo[f].push(g.niveles[j]));
        for (const k of ESTADISTICOS) out[k].push(r[k]);
        for (const k of claves) out[k].push(r[k]);
      }
    }
    return { variables: vars, factores: facs, excluidas, nivel: op.nivel, tipoCuantil: op.tipoCuantil, recorte: op.recorte,
      tipoForma: op.tipoForma, percentiles: (op.percentiles || []).slice(), decimales, tabla: out };
  }

  /* ---------------- reporte: conclusión en palabras y cuadros ---------------- */
  function reporte(res) {
    const t = res.tabla, filas = t.variable.length, facs = res.factores;
    const nv = Math.round(res.nivel * 100);
    const conclusiones = [];
    const fmt = (x, d) => (Number.isFinite(x) ? x.toFixed(d) : '—');
    for (const v of res.variables) {
      const idx = [];
      for (let i = 0; i < filas; i++) if (t.variable[i] === v) idx.push(i);
      const d = min(6, res.decimales[v] + 1);
      if (!facs.length) {
        const i = idx[0];
        conclusiones.push(T('«{v}» (n = {n}): media {m} (IC {nv} %: {a} a {b}), desviación estándar {s} y coeficiente de variación {cv} %.',
          { v, n: t.n[i], m: fmt(t.media[i], d), nv, a: fmt(t.ic_media_inf[i], d), b: fmt(t.ic_media_sup[i], d), s: fmt(t.de[i], d), cv: fmt(t.cv[i], 1) }) +
          (t.faltantes[i] ? ' ' + T('Hay {k} valores faltantes que no entran.', { k: t.faltantes[i] }) : ''));
      } else {
        const validos = idx.filter(i => Number.isFinite(t.media[i]));
        if (!validos.length) continue;
        const hi = validos.reduce((a, b) => (t.media[b] > t.media[a] ? b : a)), lo = validos.reduce((a, b) => (t.media[b] < t.media[a] ? b : a));
        const nombre = i => facs.map(f => t.grupo[f][i]).join(' · ');
        conclusiones.push(T('«{v}»: la media más alta es la de {a} ({ma}) y la más baja la de {b} ({mb}), en {k} grupos. Si las diferencias son reales se prueba en el bloque Análisis.',
          { v, a: nombre(hi), ma: fmt(t.media[hi], d), b: nombre(lo), mb: fmt(t.media[lo], d), k: validos.length }));
      }
      const fuera = idx.filter(i => t.n[i] >= 8 && abs(t.asimetria[i]) > 2 * t.ee_asimetria[i]);
      if (fuera.length) conclusiones.push(T('En «{v}», {k} de {g} grupos muestran una asimetría mayor que el doble de su error estándar: revisa valores atípicos o una transformación.', { v, k: fuera.length, g: idx.length }));
    }
    if (res.excluidas) conclusiones.push(T('{k} filas no tienen nivel en algún factor de agrupación y quedaron fuera.', { k: res.excluidas }));
    const etiquetaForma = { 1: 'g₁, g₂', 2: 'G₁, G₂', 3: 'b₁, b₂' }[res.tipoForma];
    const col = (clave, titulo, formato) => ({ clave, titulo, formato });
    const columnas = [
      ...(res.variables.length > 1 ? [col('variable', T('Variable'), 'texto')] : []),
      ...facs.map(f => col('g:' + f, f, 'texto')),
      col('n', 'n', 'entero'), col('media', T('Media'), 'escala'), col('de', T('DE'), 'escala'), col('ee', T('EE'), 'escala'),
      col('cv', T('CV (%)'), 'pct'), col('ic_media', T('IC {nv} % de la media', { nv }), 'intervalo'),
      col('min', T('Mín.'), 'dato'), col('q1', 'Q1', 'escala'), col('mediana', T('Mediana'), 'escala'), col('q3', 'Q3', 'escala'), col('max', T('Máx.'), 'dato'),
    ];
    const columnasExtra = [
      col('faltantes', T('Faltantes'), 'entero'), col('moda', T('Moda'), 'dato'), col('modas', T('Modas'), 'entero'), col('frec_moda', T('Frec. de la moda'), 'entero'),
      col('varianza', T('Varianza'), 'escala2'), col('rango', T('Rango'), 'dato'), col('ric', T('RIC'), 'escala'),
      col('media_recortada', T('Media recortada {r} %', { r: Math.round(res.recorte * 100) }), 'escala'),
      col('media_geometrica', T('Media geométrica'), 'escala'), col('media_armonica', T('Media armónica'), 'escala'),
      col('asimetria', T('Asimetría ({t})', { t: etiquetaForma.split(',')[0] }), 'forma'), col('ee_asimetria', T('EE asimetría'), 'forma'),
      col('curtosis', T('Curtosis ({t})', { t: etiquetaForma.split(', ')[1] }), 'forma'), col('ee_curtosis', T('EE curtosis'), 'forma'),
      col('ic_mediana', T('IC de la mediana'), 'intervaloDato'), col('ic_mediana_nivel', T('Confianza real (%)'), 'pctp'),
      col('ic_varianza', T('IC {nv} % de la varianza', { nv }), 'intervalo2'), col('ic_de', T('IC {nv} % de la DE', { nv }), 'intervalo'),
      ...res.percentiles.map(p => col('p' + clavePercentil(p), 'P' + clavePercentil(p), 'escala')),
    ];
    const filasCuadro = [];
    for (let i = 0; i < filas; i++) {
      const f = { _dec: min(6, res.decimales[t.variable[i]] + 1), variable: t.variable[i] };
      for (const g of facs) f['g:' + g] = t.grupo[g][i];
      for (const k of Object.keys(t)) if (k !== 'variable' && k !== 'grupo') f[k] = t[k][i];
      f.ic_media = [t.ic_media_inf[i], t.ic_media_sup[i]];
      f.ic_mediana = [t.ic_mediana_inf[i], t.ic_mediana_sup[i]];
      f.ic_varianza = [t.ic_varianza_inf[i], t.ic_varianza_sup[i]];
      f.ic_de = [t.ic_de_inf[i], t.ic_de_sup[i]];
      filasCuadro.push(f);
    }
    const titulo = facs.length
      ? T('Estadísticos descriptivos de {v} por {f}', { v: res.variables.join(', '), f: facs.join(' × ') })
      : T('Estadísticos descriptivos de {v}', { v: res.variables.join(', ') });
    return {
      titulo, conclusiones,
      cuadros: [{
        id: 'descriptivos', titulo, columnas, columnasExtra, filas: filasCuadro,
        notas: [
          T('DE: desviación estándar; EE: error estándar de la media; CV: coeficiente de variación; Q1 y Q3: cuartiles (definición {q} de Hyndman y Fan, 1996).', { q: res.tipoCuantil }),
          T('IC de la media por t de Student; de la mediana, por estadísticos de orden y la binomial (su confianza real es la mínima que alcanza o supera la pedida); de la varianza y la DE, por la ji cuadrada (supone normalidad).'),
          T('Asimetría y curtosis: {e} (Joanes y Gill, 1998); 0 en una distribución normal.', { e: etiquetaForma }),
        ],
      }],
    };
  }

  /* ---------------- código R equivalente ---------------- */
  function codigoR(e, op, ctx) {
    op = SP.opcionesCon(SP.metodos.descriptivos, op);
    const vars = lista(e.variables), facs = lista(e.grupos), numericos = (ctx && ctx.factoresNumericos) || [];
    const vec = xs => 'c(' + xs.map(x => JSON.stringify(x)).join(', ') + ')';
    const nR = x => String(Number(x.toPrecision(12)));
    const a = nR((1 - op.nivel) / 2), b = nR(1 - (1 - op.nivel) / 2);
    const L = [
      '# Estadísticos descriptivos (código R equivalente a SigmaPro)',
      '# datos <- read.csv("tus-datos.csv")',
      '# requiere el paquete e1071 para la asimetría y la curtosis: install.packages("e1071")',
      ...numericos.filter(f => facs.includes(f)).map(f => `datos$${f} <- factor(datos$${f})   # la dosis numérica se agrupa por sus valores`),
      'descriptivos <- function(x) {',
      '  faltantes <- sum(is.na(x)); x <- x[!is.na(x)]; n <- length(x); xs <- sort(x)',
      `  q <- quantile(x, c(0.25, 0.75), type = ${op.tipoCuantil})`,
      `  k <- qbinom(${a}, n, 0.5)                      # IC de la mediana por estadísticos de orden`,
      `  ic_media <- mean(x) + c(-1, 1) * qt(${b}, n - 1) * sd(x) / sqrt(n)`,
      `  ic_var <- (n - 1) * var(x) / qchisq(c(${b}, ${a}), n - 1)`,
      '  c(n = n, faltantes = faltantes, media = mean(x), mediana = median(x), de = sd(x), varianza = var(x),',
      '    ee = sd(x) / sqrt(n), cv = 100 * sd(x) / mean(x), min = min(x), q1 = q[[1]], q3 = q[[2]], max = max(x),',
      `    ric = q[[2]] - q[[1]], media_recortada = mean(x, trim = ${op.recorte}),`,
      '    media_geometrica = if (all(x > 0)) exp(mean(log(x))) else NA,',
      '    media_armonica = if (all(x > 0)) 1 / mean(1 / x) else NA,',
      `    asimetria = e1071::skewness(x, type = ${op.tipoForma}), curtosis = e1071::kurtosis(x, type = ${op.tipoForma}),`,
      '    ic_media_inf = ic_media[1], ic_media_sup = ic_media[2],',
      '    ic_mediana_inf = if (k >= 1) xs[k] else NA, ic_mediana_sup = if (k >= 1) xs[n - k + 1] else NA,',
      '    ic_varianza_inf = ic_var[1], ic_varianza_sup = ic_var[2])',
      '}',
      facs.length
        ? `resultado <- aggregate(datos[${vec(vars)}], by = datos[${vec(facs)}], FUN = descriptivos)`
        : `resultado <- sapply(datos[${vec(vars)}], descriptivos)`,
      'resultado',
    ];
    if ((op.percentiles || []).length) L.push(`sapply(datos[${vec(vars)}], quantile, probs = c(${op.percentiles.join(', ')}), type = ${op.tipoCuantil}, na.rm = TRUE)`);
    return L.join('\n');
  }

  SP.metodo({
    id: 'descriptivos', familia: 'descriptiva', motor: 'js',
    nombre: T('Estadísticos descriptivos'),
    resumen: T('Media, mediana, dispersión, forma, cuantiles e intervalos de confianza, por hasta tres factores.'),
    entradas: { variables: { tipo: 'numerica+' }, grupos: { tipo: 'factor+', opcional: true, maximo: 3 } },
    opciones: {
      nivel: { tipo: 'numero', omision: 0.95 }, tipoCuantil: { tipo: 'entero', omision: 7 }, recorte: { tipo: 'numero', omision: 0.1 },
      tipoForma: { tipo: 'entero', omision: 2 }, percentiles: { tipo: 'lista', omision: [] },
    },
    validar: revisarEntradas, calcular, reporte, codigoR,
  });
});

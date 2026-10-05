/* SigmaPro — estructura del ensayo: qué diseño parece tener la tabla.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.estructura.adivinarPapeles(tabla) → { respuestas, factores, bloque, fila, columna, numericosComoFactor, identificadores, submuestras }
     SP.estructura.analizar(tabla, papeles) → { hallazgos: [{ tipo: 'ok'|'aviso'|'info', texto }], datos: { … } }

   Revisa: observaciones completas, combinaciones de tratamientos y celdas vacías,
   balance, bloques completos (con una o varias repeticiones por bloque), cuadro latino
   (fila × columna × tratamiento, cada par una vez) y si los niveles de un factor son
   dosis igualmente espaciadas (útil para estudiar la tendencia). El asistente y el
   constructor del modelo (Hito 1.10) usan este diagnóstico. */
SP.definir('estructura', function (SP) {
  'use strict';
  const T = SP.T;
  const PAT = {
    bloque: /^(bloques?|blocks?|rep|reps|repetici[oó]n(es)?|r)$/i,
    fila: /^(filas?|hileras?|rows?)$/i,
    columna: /^(columnas?|cols?|columns?)$/i,
    /* la unidad medida dentro de la parcela (fruto 1, 2, …, 5): submuestra, no tratamiento */
    submuestra: /^(frutos?|plantas?|hojas?|muestras?|submuestras?|individuos?|ejemplar(es)?|semillas?|tallos?|espigas?|mazorcas?|vainas?|[aá]rbol(es)?|n[uú]m(ero)?)$/i,
    /* la parcela (grande, chica o franja) de un diseño con parcelas: identifica unidades, no es un tratamiento (Hito 4.4) */
    parcela: /^(parcelas?|parcelas?[_ .]?(grandes?|chicas?|principal(es)?)|pg|sub[_ .]?parcelas?|franjas?|franjas?[_ .]?(h|v|horizontal(es)?|vertical(es)?|a|b|1|2))$/i,
  };
  /** ¿Valores 1, 2, …, k (un contador)? */
  const esContador = c => { const v = [...new Set(Array.from(c.valores).filter(x => !Number.isNaN(x)))].sort((a, b) => a - b); return v.length >= 2 && v.every((x, i) => x === i + 1); };

  /** ¿Columna numérica con pocos valores, repetidos casi por igual? (dosis, densidades, años del diseño) */
  function pareceFactorNumerico(c, n) {
    const cuenta = new Map();
    for (const v of c.valores) if (!Number.isNaN(v)) cuenta.set(v, (cuenta.get(v) || 0) + 1);
    const k = cuenta.size, veces = [...cuenta.values()];
    return k >= 2 && k <= Math.min(12, n / 2) && Math.min(...veces) >= 2 && Math.max(...veces) <= 2 * Math.min(...veces);
  }

  function adivinarPapeles(tabla) {
    const p = { respuestas: [], factores: [], bloque: null, fila: null, columna: null, numericosComoFactor: [], identificadores: [], submuestras: [], parcelas: [] };
    const candidatos = [];
    for (const nom of tabla.nombres) {
      const c = tabla.col(nom);
      if (c.fecha) continue;
      const numerica = c.tipo === 'numerica', comoDiseno = numerica && pareceFactorNumerico(c, tabla.n);
      if (numerica && !comoDiseno) { p.respuestas.push(nom); continue; }
      if (comoDiseno && PAT.submuestra.test(nom) && esContador(c)) { p.submuestras.push(nom); continue; }
      if (PAT.parcela.test(nom) && (comoDiseno || !numerica)) { p.parcelas.push(nom); continue; }
      /* todos distintos en una tabla de al menos 10 filas: identificador (en una tabla corta ya agregada, son categorías) */
      if (!numerica && tabla.n >= 10 && c.niveles.length === tabla.n) { p.identificadores.push(nom); continue; }
      if (!p.bloque && PAT.bloque.test(nom)) p.bloque = nom;
      else if (!p.fila && PAT.fila.test(nom)) p.fila = nom;
      else if (!p.columna && PAT.columna.test(nom)) p.columna = nom;
      else if (comoDiseno) candidatos.push(nom);
      else p.factores.push(nom);
    }
    /* si todas las numéricas parecen factores, la última queda como respuesta */
    if (!p.respuestas.length && candidatos.length) p.respuestas.push(candidatos.pop());
    for (const nom of candidatos) { p.factores.push(nom); p.numericosComoFactor.push(nom); }
    return p;
  }

  /** Vista de factor de una columna: las numéricas se codifican por sus valores en orden, con las etiquetas
      de factor() en R (15 cifras). */
  function comoFactor(tabla, nom) {
    const c = tabla.col(nom);
    if (c.tipo !== 'numerica') return c;
    const valores = [...new Set(Array.from(c.valores).filter(v => !Number.isNaN(v)))].sort((a, b) => a - b);
    const idx = new Map(valores.map((v, k) => [v, k]));
    return { nombre: nom, tipo: 'factor', niveles: valores.map(SP.tipos.numeroATexto), codigos: Int32Array.from(c.valores, v => (Number.isNaN(v) ? -1 : idx.get(v))) };
  }

  /** Clave de la combinación de factores de la fila i (null si falta alguno). */
  function claveFila(cols, i) {
    const partes = [];
    for (const c of cols) { const k = c.codigos[i]; if (k < 0) return null; partes.push(k); }
    return partes.join('|');
  }

  function analizar(tabla, papeles) {
    papeles = papeles || adivinarPapeles(tabla);
    const h = [];
    const ok = texto => h.push({ tipo: 'ok', texto }), aviso = texto => h.push({ tipo: 'aviso', texto }), info = texto => h.push({ tipo: 'info', texto });
    const datos = {};
    const resp = papeles.respuesta || papeles.respuestas[0];
    const facs = (papeles.factores || []).map(f => comoFactor(tabla, f));
    const bloque = papeles.bloque ? comoFactor(tabla, papeles.bloque) : null;
    if (!resp) { aviso(T('No hay ninguna columna numérica que pueda ser la respuesta.')); return { hallazgos: h, datos }; }
    const y = tabla.col(resp).valores;
    const filas = [];
    for (let i = 0; i < tabla.n; i++) if (!Number.isNaN(y[i])) filas.push(i);
    const faltan = tabla.n - filas.length;
    datos.n = filas.length; datos.faltantes = faltan;
    if (faltan) aviso(T('«{r}» tiene {k} valores faltantes de {n}: el análisis usará {m} observaciones.', { r: resp, k: faltan, n: tabla.n, m: filas.length }));
    for (const nom of papeles.identificadores || []) {
      info(T('«{f}» tiene un valor distinto en cada fila: parece un identificador de la unidad y no un factor. Márcala como identificador.', { f: nom }));
    }
    for (const nom of papeles.submuestras || []) {
      info(T('«{f}» numera las unidades medidas dentro de cada parcela (1, 2, …): son submuestras, no un tratamiento.', { f: nom }));
    }
    for (const nom of papeles.numericosComoFactor || []) {
      const c = comoFactor(tabla, nom);
      info(T('«{f}» es numérica pero solo tiene {k} valores repetidos ({v}): se tomó como factor del diseño. En el análisis puedes usarla como factor o estudiar su tendencia.', { f: nom, k: c.niveles.length, v: c.niveles.join(', ') }));
    }
    if (!facs.length) { info(T('No se reconoció ningún factor de tratamiento. Indícalos en el constructor del modelo.')); return { hallazgos: h, datos }; }

    /* combinaciones de tratamientos */
    const totalCeldas = facs.reduce((s, c) => s * c.niveles.length, 1);
    const cuenta = new Map();
    for (const i of filas) { const k = claveFila(facs, i); if (k !== null) cuenta.set(k, (cuenta.get(k) || 0) + 1); }
    const vacias = totalCeldas - cuenta.size;
    const conteos = [...cuenta.values()];
    const minC = Math.min(...conteos), maxC = Math.max(...conteos);
    datos.tratamientos = totalCeldas; datos.celdasVacias = vacias; datos.balanceado = !vacias && minC === maxC;
    const descr = facs.length === 1
      ? T('«{f}» con {k} niveles', { f: facs[0].nombre, k: facs[0].niveles.length })
      : T('Factorial {d} ({f})', { d: facs.map(c => c.niveles.length).join(' × '), f: facs.map(c => c.nombre).join(' × ') });
    const por = facs.length === 1 ? T('por tratamiento') : T('por combinación');
    if (vacias) aviso(T('{d}: hay {v} combinaciones sin ninguna observación de {t}. Las sumas de cuadrados tipo III no estarán definidas.', { d: descr, v: vacias, t: totalCeldas }));
    else if (datos.balanceado) ok(T('{d}, balanceado: {r} observaciones {p}.', { d: descr, r: minC, p: por }));
    /* con un solo factor los tipos I, II y III coinciden aunque haya desbalance; con dos o más, no */
    else if (facs.length === 1) info(T('{d}, desbalanceado: entre {a} y {b} observaciones {p}. Con un solo factor no cambia el ANOVA, pero las comparaciones de medias usarán el ajuste para tamaños distintos.', { d: descr, a: minC, b: maxC, p: por }));
    else aviso(T('{d}, desbalanceado: entre {a} y {b} observaciones {p}. Las sumas de cuadrados tipo I, II y III darán resultados distintos.', { d: descr, a: minC, b: maxC, p: por }));

    /* bloques */
    if (bloque) {
      const porBloque = new Map();
      for (const i of filas) {
        const b = bloque.codigos[i], k = claveFila(facs, i);
        if (b < 0 || k === null) continue;
        if (!porBloque.has(b)) porBloque.set(b, new Map());
        const m = porBloque.get(b); m.set(k, (m.get(k) || 0) + 1);
      }
      const nb = bloque.niveles.length;
      const completos = [...porBloque.values()].filter(m => m.size === totalCeldas).length;
      const veces = new Set([...porBloque.values()].flatMap(m => [...m.values()]));
      datos.bloques = nb; datos.bloquesCompletos = completos;
      if (completos === nb && veces.size === 1) {
        const r = [...veces][0];
        ok(r === 1
          ? T('{b} bloques completos: cada bloque tiene cada tratamiento una vez (bloques completos al azar).', { b: nb })
          : T('{b} bloques completos con {r} repeticiones de cada tratamiento por bloque (bloques generalizados).', { b: nb, r }));
        datos.diseno = r === 1 ? 'dbca' : 'dbca-generalizado';
      } else if (completos === nb) {
        aviso(T('{b} bloques con todos los tratamientos, pero no el mismo número de veces en cada uno.', { b: nb }));
      } else {
        const tamanos = [...porBloque.values()].map(m => m.size).filter(k => k < totalCeldas);
        const a = Math.min(...tamanos), z = Math.max(...tamanos);
        aviso(T('{c} de {b} bloques están completos; {o} tienen {r} de los {t} tratamientos (¿bloques incompletos o faltantes?).',
          { c: completos, b: nb, o: nb - completos === 1 ? T('el otro') : T('los otros {k}', { k: nb - completos }), r: a === z ? a : T('entre {a} y {z}', { a, z }), t: totalCeldas }));
        datos.diseno = 'bloques-incompletos';
      }
    }

    /* cuadro latino */
    if (papeles.fila && papeles.columna && facs.length === 1) {
      const F = comoFactor(tabla, papeles.fila), C = comoFactor(tabla, papeles.columna), Tr = facs[0];
      const k = Tr.niveles.length;
      const pares = (a, b) => { const s = new Set(); for (const i of filas) { if (a.codigos[i] >= 0 && b.codigos[i] >= 0) s.add(a.codigos[i] + '|' + b.codigos[i]); } return s.size; };
      const esCL = F.niveles.length === k && C.niveles.length === k && filas.length === k * k &&
        pares(F, C) === k * k && pares(F, Tr) === k * k && pares(C, Tr) === k * k;
      datos.cuadroLatino = esCL;
      if (esCL) { ok(T('Cuadro latino {k} × {k}: cada tratamiento aparece una vez en cada fila y en cada columna.', { k })); datos.diseno = 'cuadro-latino'; }
      else aviso(T('Hay fila y columna, pero no forman un cuadro latino completo de {k} × {k}.', { k }));
    }

    /* dosis igualmente espaciadas */
    for (const c of facs) {
      const nums = c.niveles.map(Number);
      if (c.niveles.length >= 3 && nums.every(Number.isFinite)) {
        const s = nums.slice().sort((a, b) => a - b), dif = s.slice(1).map((v, i) => v - s[i]);
        const igual = dif.every(d => Math.abs(d - dif[0]) <= 1e-9 * Math.max(1, Math.abs(dif[0])));
        info(igual
          ? T('Los niveles de «{f}» son números igualmente espaciados ({v}): se puede estudiar la tendencia con polinomios ortogonales.', { f: c.nombre, v: s.join(', ') })
          : T('Los niveles de «{f}» son números no igualmente espaciados ({v}): la tendencia se estudia con polinomios para esos valores.', { f: c.nombre, v: s.join(', ') }));
      }
    }
    if (bloque && !papeles.fila && !papeles.columna) info(T('No hay columnas de fila y columna de campo: sin ellas no se puede revisar si quedó un gradiente en el terreno.'));
    return { hallazgos: h, datos };
  }

  SP.estructura = { adivinarPapeles, analizar, pareceFactorNumerico, comoFactor };
});

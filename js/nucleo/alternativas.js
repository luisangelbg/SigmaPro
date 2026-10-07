/* SigmaPro — alternativas cuando un supuesto falla (hito 5.3).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   A partir del semáforo de un resultado, la lista de análisis que conviene probar, listos para correrse con las mismas
   variables: la transformación que propone Box-Cox (en una columna nueva), la prueba por rangos, el modelo de conteos,
   la t de Welch, la binomial negativa… Cada alternativa dice qué supuesto atiende. No calcula nada: solo arma el pedido
   (método, entradas y opciones) que la interfaz corre con SP.app.analisis.usar. Módulo puro (sin DOM), probado en node:

     SP.alternativas.de({ metodo, e, op, r, rep, tabla })
        → [{ supuesto, texto, metodo, e, op, transformar }]
          transformar = { columna, tipo, parametros, nombre, detalle } cuando antes hay que crear la columna transformada
     SP.alternativas.transformacion(sugerencia) → { tipo, parametros, prefijo, nombre } de la sugerencia de Box-Cox

   El semáforo se lee por la clave de cada renglón o, si no la trae, por su nombre en español (SP.T.origen). */
SP.definir('alternativas', function (SP) {
  'use strict';
  const T = SP.T;
  const malo = c => c === 'ambar' || c === 'rojo';
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  /* el color de un renglón del semáforo, por su clave o por su nombre en español */
  function colorDe(rep, clave, nombre) {
    const sem = (rep && rep.semaforo) || [];
    const s = sem.find(x => (clave && x.clave === clave) || (nombre && norm((SP.T.origen && SP.T.origen.get(x.nombre)) || x.nombre) === norm(nombre)));
    return s ? s.color : null;
  }
  /* las transformaciones que propone Box-Cox, como las hace el bloque Datos (los mismos prefijos del nombre) */
  const PREFIJO = { log: 'ln', raiz: 'raiz', reciproco: 'inv', boxcox: 'bc' };
  function transformacion(sug) {
    const t = sug && (sug.transformacion || sug);
    const lam = sug && Number.isFinite(sug.lambda) ? sug.lambda : null;
    const de = (tipo, nombre, parametros) => ({ tipo, parametros: parametros || {}, prefijo: PREFIJO[tipo], nombre });
    switch (t) {
      case 'log': return de('log', T('el logaritmo'));
      case 'raiz': return de('raiz', T('la raíz cuadrada'));
      case 'reciproco': return de('reciproco', T('el recíproco'));
      case 'reciproco de la raiz': return de('boxcox', T('el recíproco de la raíz'), { lambda: -0.5 });
      case 'cuadrado': return de('boxcox', T('el cuadrado'), { lambda: 2 });
      default: return lam != null && lam !== 1 ? de('boxcox', T('Box-Cox con λ = {l}', { l: lam }), { lambda: lam }) : null;
    }
  }
  /* el pedido que crea la columna transformada y vuelve a correr el análisis con ella */
  function conTransformacion(metodo, e, op, columna, tr, supuesto, texto) {
    const nombre = tr.prefijo + '_' + columna;
    const d = tr.tipo === 'boxcox' ? T('Box-Cox de «{c}» · λ = {l}', { c: columna, l: String(tr.parametros.lambda).replace('-', '−') }) : T('{t} de «{c}»', { t: tr.nombre, c: columna });
    const detalle = d.charAt(0).toUpperCase() + d.slice(1);
    return { supuesto, texto, metodo, e: Object.assign({}, e, { respuesta: nombre }), op, transformar: { columna, tipo: tr.tipo, parametros: tr.parametros, nombre, detalle } };
  }
  /* los valores de una columna numérica de la tabla (sin faltantes), o null */
  function valores(tabla, nombre) {
    try {
      const c = tabla && tabla.col(nombre);
      if (!c || c.tipo !== 'numerica') return null;
      return Array.from(c.valores).filter(v => Number.isFinite(v));
    } catch (err) { return null; }
  }

  const POR_METODO = {
    /* la revisión de los supuestos de un experimento */
    supuestos: ({ e, op, r, rep }) => {
      const out = [], n = c => colorDe(rep, c), trs = [].concat(e.tratamientos || []), y = e.respuesta;
      const forma = malo(n('normalidad')) || malo(n('varianzas')), sup = malo(n('varianzas')) ? 'varianzas' : 'normalidad';
      const tr = forma && r && r.boxcox ? transformacion(r.boxcox.sugerencia) : null;
      if (tr) out.push(conTransformacion('supuestos', e, op, y, tr, sup, T('Transformar con {t} y volver a revisar', { t: tr.nombre })));
      if (forma && r && r.respuesta_tipo === 'conteos') out.push({ supuesto: sup, texto: T('Modelo de conteos (Poisson o binomial negativa)'), metodo: 'glm-conteos',
        e: { respuesta: y, tratamientos: trs, bloque: e.bloque || '' }, op: { familia: 'auto' } });
      if (trs.length === 1 && (malo(n('varianzas')) || (malo(n('normalidad')) && r && r.n < 30))) {
        if (!e.bloque) out.push({ supuesto: sup, texto: T('Kruskal-Wallis (por rangos: no supone normalidad)'), metodo: 'kruskal-wallis', e: { respuesta: y, tratamiento: trs[0] }, op: {} });
        else out.push({ supuesto: sup, texto: T('Friedman (por rangos, con bloques)'), metodo: 'friedman', e: { respuesta: y, tratamiento: trs[0], bloque: e.bloque }, op: {} });
      }
      if (malo(n('varianzas')) && trs.length === 1 && !e.bloque) out.push({ supuesto: 'varianzas', texto: T('Comparar las medias con Games-Howell (varianzas distintas)'), metodo: 'comparaciones-medias',
        e: { diseno: 'dca', respuesta: y, comparar: [trs[0]], tratamientos: [trs[0]] }, op: { metodo: 'games-howell' } });
      return out;
    },
    /* las pruebas t */
    'prueba-t': ({ e, op, rep }) => {
      const out = [];
      if (malo(colorDe(rep, 'varianzas'))) out.push({ supuesto: 'varianzas', texto: T('t de Welch (no supone varianzas iguales)'), metodo: 'prueba-t', e, op: Object.assign({}, op, { varIguales: false }) });
      if (malo(colorDe(rep, 'normalidad'))) out.push({ supuesto: 'normalidad', texto: e.modo === 'independientes' ? T('Wilcoxon-Mann-Whitney (por rangos)') : T('Wilcoxon de rangos con signo'),
        metodo: 'wilcoxon', e, op: { mu: op && op.mu, alternativa: op && op.alternativa, nivel: op && op.nivel } });
      return out;
    },
    /* la regresión lineal: transformar la respuesta, una curva, conteos o menos predictores */
    'regresion-lineal': ({ metodo, e, op, rep, tabla }) => {
      const out = [], y = e.respuesta, pred = [].concat(e.predictores || []);
      const forma = malo(colorDe(rep, null, 'Varianza constante')) || malo(colorDe(rep, null, 'Normalidad de los residuos'));
      const v = forma ? valores(tabla, y) : null;
      if (v && v.length && v.every(x => x > 0)) out.push(conTransformacion(metodo || 'regresion-lineal', e, op, y, transformacion('log'), 'varianzas', T('Transformar con el logaritmo y volver a ajustar')));
      if (v && v.length && v.every(x => x >= 0 && Number.isInteger(x)) && pred.length <= 2) out.push({ supuesto: 'varianzas', texto: T('Modelo de conteos (Poisson o binomial negativa)'), metodo: 'glm-conteos',
        e: { respuesta: y, tratamientos: [], bloque: '', covariables: pred }, op: { familia: 'auto' } });
      if (malo(colorDe(rep, null, 'Forma del modelo')) && (metodo || 'regresion-lineal') === 'regresion-lineal' && pred.length === 1) out.push({ supuesto: 'forma', texto: T('Probar una curva de grado 2 (regresión polinomial)'),
        metodo: 'regresion-polinomial', e: { respuesta: y, predictores: pred }, op: { grado: 2 } });
      if (malo(colorDe(rep, null, 'Colinealidad')) && pred.length > 2) out.push({ supuesto: 'colinealidad', texto: T('Elegir los predictores con los mejores subconjuntos'), metodo: 'mejores-subconjuntos',
        e: { respuesta: y, predictores: pred }, op: {} });
      return out;
    },
    /* los modelos generalizados: la sobredispersión */
    'glm-conteos': ({ metodo, e, op, r, rep }) => {
      if (!malo(colorDe(rep, null, 'Sobredispersión')) || !r) return [];
      if (r.familia === 'poisson') return [{ supuesto: 'sobredispersion', texto: T('Correr con la binomial negativa (modela la sobredispersión)'), metodo, e, op: Object.assign({}, op, { familia: 'binomial-negativa' }) }];
      if (r.familia === 'binomial') return [{ supuesto: 'sobredispersion', texto: T('Correr con la cuasibinomial (modela la sobredispersión)'), metodo, e, op: Object.assign({}, op, { familia: 'cuasibinomial' }) }];
      return [];
    },
  };
  /* los modelos mixtos y las medidas repetidas (motor R): con la respuesta positiva, el logaritmo */
  const logSiPositiva = nombres => ({ metodo, e, op, rep, tabla }) => {
    const malos = nombres.filter(nm => malo(colorDe(rep, null, nm)));
    const v = malos.length ? valores(tabla, e.respuesta) : null;
    if (!v || !v.length || !v.every(x => x > 0)) return [];
    return [conTransformacion(metodo, e, op, e.respuesta, transformacion('log'), /^varianzas/i.test(norm(malos[0])) ? 'varianzas' : 'normalidad', T('Transformar con el logaritmo y volver a ajustar'))];
  };
  for (const m of ['mixto-bloques', 'mixto-divididas', 'mixto-latice', 'mixto-localidades', 'modelo-mixto']) POR_METODO[m] = logSiPositiva(['Normalidad de los residuos', 'Varianzas iguales']);
  POR_METODO['medidas-repetidas'] = logSiPositiva(['Normalidad de los residuos', 'Varianzas entre fechas']);
  POR_METODO['regresion-polinomial'] = POR_METODO['regresion-lineal'];
  POR_METODO['glm-proporciones'] = POR_METODO['glm-conteos'];
  POR_METODO.glm = POR_METODO['glm-conteos'];

  /** Las alternativas de un resultado: una por remedio, en el orden de las recomendaciones; [] si nada falla. */
  function de(o) {
    const f = POR_METODO[o && o.metodo];
    if (!f || !o.rep || !(o.rep.semaforo || []).some(s => malo(s.color))) return [];
    return f({ metodo: o.metodo, e: o.e || {}, op: o.op || {}, r: o.r, rep: o.rep, tabla: o.tabla }).filter(a => a && SP.metodos[a.metodo]);
  }

  SP.alternativas = { de, transformacion, metodos: () => Object.keys(POR_METODO) };
});

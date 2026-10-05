/* SigmaPro — qué análisis se pueden hacer con los datos cargados (catálogo).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Módulo puro (sin DOM), probado en node (tests/unidad/aplicable.test.js):

     SP.aplicable.perfil(tabla)          lo que hay en la tabla: numéricas, factores (con sus niveles), bloques, fechas,
                                         conteos, proporciones, columnas 0/1, identificadores
     SP.aplicable.revisar(metodo, perfil) { estado: 'listo' | 'falta' | 'sinDatos', falta: [texto] }

   La regla general sale de las entradas que declara cada método (SP.metodo): cada papel obligatorio pide una columna
   numérica o un factor distinto; «+» pide al menos una. Encima, unos pocos requisitos propios que las entradas no dicen
   (dos grupos para la t, un 0/1 para el evento, fechas o un orden para una serie…). Es una guía: el formulario de cada
   análisis sigue revisando todo al calcular. */
SP.definir('aplicable', function (SP) {
  'use strict';
  const T = SP.T;

  /** El perfil de la tabla (null si no hay datos). */
  function perfil(tabla) {
    if (!tabla || !tabla.n) return null;
    const inf = SP.asistente.info(tabla);
    const fechas = tabla.nombres.filter(n => tabla.col(n).fecha);
    const tipo = inf.tipoNum || {};
    return {
      n: tabla.n,
      numericas: inf.medidas.length ? inf.medidas : inf.numericas,
      todasNumericas: inf.numericas,
      factores: inf.factores,
      niveles: inf.niveles,
      numFactor: inf.numFactor,
      bloque: inf.pap.bloque && inf.factores.includes(inf.pap.bloque) ? inf.pap.bloque : '',
      filaColumna: !!(inf.pap.fila && inf.pap.columna),
      fechas,
      /* una numérica con pocos valores repetidos (una dosis) es factor del diseño, no un conteo */
      conteos: inf.numericas.filter(n => tipo[n] === 'conteo' && !inf.numFactor.includes(n)),
      proporciones: inf.numericas.filter(n => tipo[n] === 'proporcion' && !(inf.binarias || []).includes(n) && !inf.numFactor.includes(n)),
      binarias: inf.binarias || [],
      parcelas: inf.parcelasCol || [],
      identificadores: inf.pap.identificadores || [],
      info: inf,
    };
  }

  /* Cómo se nombra lo que falta, por papel (lo demás: «una columna numérica» o «un factor»). */
  const PAPEL = () => ({
    bloque: T('una columna de bloques o repeticiones'), fila: T('filas y columnas (dos factores de bloqueo)'), columna: T('filas y columnas (dos factores de bloqueo)'),
    genotipo: T('una columna de genotipos'), ambiente: T('una columna de ambientes o localidades'), tiempo: T('una columna de tiempo'),
    evento: T('una columna 0/1 que diga si ocurrió el evento'), parcelaGrande: T('el factor de las parcelas grandes'), subparcela: T('el factor de las subparcelas'),
    subsubparcela: T('el factor de las sub-subparcelas'), franjaA: T('un factor en franjas horizontales'), franjaB: T('un factor en franjas verticales'),
    repeticion: T('una columna de repeticiones'), individuo: T('una columna que identifique cada individuo medido varias veces'),
  });

  /** Requisitos que las entradas no dicen. Cada uno devuelve el texto de lo que falta, o '' si se cumple. */
  const PROPIOS = {
    'prueba-t': p => (p.factores.some(f => (p.niveles[f] || []).length === 2) || p.numericas.length >= 2 ? '' : T('un factor con dos grupos, o dos columnas numéricas (antes y después)')),
    wilcoxon: p => PROPIOS['prueba-t'](p),
    'kaplan-meier': p => (p.binarias.length ? '' : T('una columna 0/1 que diga si ocurrió el evento')),
    cox: p => PROPIOS['kaplan-meier'](p),
    'glm-proporciones': p => (p.binarias.length || p.proporciones.length || p.conteos.length ? '' : T('una respuesta 0/1 o éxitos de un total')),
    'glm-conteos': p => (p.conteos.length ? '' : T('una respuesta de conteos (enteros, con ceros)')),
    'glmm-bloques': p => (p.conteos.length || p.binarias.length || p.proporciones.length ? '' : T('una respuesta de conteos o de proporciones')),
    autocorrelacion: p => (p.fechas.length || p.n >= 12 ? '' : T('al menos 12 observaciones ordenadas en el tiempo')),
    descomposicion: p => (p.n >= 24 ? '' : T('al menos dos ciclos completos (24 observaciones mensuales)')),
    tendencia: p => (p.n >= 8 ? '' : T('al menos 8 observaciones ordenadas en el tiempo')),
    arima: p => (p.n >= 20 ? '' : T('al menos 20 observaciones ordenadas en el tiempo')),
    'cuadro-latino': p => (p.factores.length >= 3 ? '' : T('filas y columnas (dos factores de bloqueo)')),
    latice: p => (p.factores.length >= 3 ? '' : T('repeticiones y bloques incompletos dentro de ellas')),
    'mixto-latice': p => PROPIOS.latice(p),
    mezclas: p => (p.todasNumericas.length >= 3 ? '' : T('las proporciones de al menos dos componentes y una respuesta')),
    deseabilidad: p => (p.todasNumericas.length >= 3 ? '' : T('al menos una respuesta y dos factores numéricos')),
    'superficie-respuesta': p => (p.todasNumericas.length >= 3 ? '' : T('una respuesta y al menos dos factores numéricos')),
    'ascenso-pronunciado': p => PROPIOS['superficie-respuesta'](p),
    manova: p => (p.numericas.length >= 2 ? '' : T('al menos dos respuestas numéricas')),
    discriminante: p => (p.numericas.length >= 2 ? '' : T('al menos dos variables numéricas')),
    'matriz-correlacion': p => (p.numericas.length >= 3 ? '' : T('al menos tres variables numéricas')),
    'correlacion-parcial': p => (p.numericas.length >= 3 ? '' : T('al menos tres variables numéricas')),
    'muestreo-estratificado': p => (p.factores.length ? '' : T('una columna de estratos')),
    'medidas-repetidas': p => (p.fechas.length || p.numFactor.length || p.factores.length >= 3 ? '' : T('una columna de fechas o muestreos y otra que identifique cada unidad')),
  };

  /** ¿Se puede hacer el análisis con estos datos? */
  function revisar(m, p) {
    if (m.sinDatos && !Object.keys(m.entradas || {}).some(k => !m.entradas[k].opcional)) return { estado: 'sinDatos', falta: [] };
    if (!p) return { estado: m.sinDatos ? 'sinDatos' : 'falta', falta: [T('datos cargados')] };
    const falta = [], papeles = PAPEL();
    let necNum = 0, necFac = 0;
    for (const [rol, e] of Object.entries(m.entradas || {})) {
      if (e.opcional || e.tipo === 'cualquiera') continue;
      if (e.tipo === 'numerica' || e.tipo === 'numerica+') necNum++;
      else if (e.tipo === 'factor' || e.tipo === 'factor+') {
        necFac++;
        if (necFac > p.factores.length) {
          /* si la tabla ya tiene bloques, lo que falta es otro factor de tratamiento, no los bloques */
          const txt = (rol === 'bloque' || rol === 'repeticion') && p.bloque ? T('un factor más ({k} en total, contando los bloques)', { k: necFac }) : papeles[rol];
          if (txt && !falta.includes(txt)) falta.push(txt);
        }
      }
    }
    /* una numérica con pocos valores sirve de factor o de numérica, pero no de las dos a la vez */
    const soloNum = p.todasNumericas.filter(n => !p.numFactor.includes(n)).length, soloFac = p.factores.filter(f => !p.numFactor.includes(f)).length;
    const ambos = p.numFactor.length;
    const faltanNum = Math.max(0, necNum - soloNum), faltanFac = Math.max(0, necFac - soloFac);
    if (faltanNum + faltanFac > ambos) {
      if (necNum > p.todasNumericas.length || faltanNum > ambos) falta.push(necNum === 1 ? T('una columna numérica (la respuesta)') : T('{k} columnas numéricas', { k: necNum }));
      if ((necFac > p.factores.length || faltanFac > ambos) && !falta.some(f => Object.values(papeles).includes(f))) falta.push(necFac === 1 ? T('un factor (grupos o tratamientos)') : T('{k} factores', { k: necFac }));
      if (!falta.length) falta.push(T('{k} columnas distintas', { k: necNum + necFac }));
    }
    const propio = PROPIOS[m.id] ? PROPIOS[m.id](p) : '';
    if (propio && !falta.includes(propio)) falta.push(propio);
    return { estado: falta.length ? 'falta' : 'listo', falta };
  }

  SP.aplicable = { perfil, revisar, PROPIOS };
});

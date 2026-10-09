/* SigmaPro — la hoja de trabajo para clase (hito 5.8).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Del reporte, una hoja de ejercicios para el estudiante y, al final, su clave de respuestas para quien enseña. Cada
   análisis del reporte es un ejercicio: el planteamiento (el párrafo de métodos: qué se hizo con qué datos), su cuadro
   principal con huecos para completar y unas preguntas con renglones para contestar:
     · Completa el cuadro: en el análisis de varianza, los cuadrados medios (CM = SC/gl) y las F (CM del efecto entre el
       CM del error que le corresponde) quedan en blanco; las sumas de cuadrados, los gl y los valores p, a la vista.
     · Decide con los valores p y el α del análisis qué efectos son significativos.
     · Interpreta hasta dos indicadores del resultado (el CV, la R², un tamaño del efecto…) con su guía.
     · Di de qué supuestos depende el método (de su ficha de Fundamentos).
     · Escribe la conclusión en palabras sencillas.
   La clave trae el cuadro completo y la respuesta de cada pregunta con los números del caso: la conclusión del análisis,
   la tarjeta de interpretación de cada indicador (SP.guias.interpretar), los supuestos de la ficha y «En pocas
   palabras» (SP.claro). Módulo puro (sin DOM): los bloques que entienden SP.informe.html y SP.docx.

     SP.hojaTrabajo.bloques(items, opciones) → bloques del documento
       items: los elementos del reporte (como los de SP.informe.bloques), con indicadores?: [{ ficha, titulo, valor,
              contexto, multiple }] (SP.lectura.resumen) y la ficha de Fundamentos en opciones.metodos
       opciones: { titulo, datos: { nombres, filas, origen }, conDatos, conClave, metodos, maxFilas }
     SP.hojaTrabajo.huecos(cuadro, visibles)  → { cabecera, filas, numericas, totales, huecos: n } con «________» donde se
                                                 completa (un ejercicio sin cuadro para completar muestra su cuadro principal) */
SP.definir('hoja-trabajo', function (SP) {
  'use strict';
  const T = SP.T;
  const RENGLONES = 3, MAX_FILAS = 60, MAX_INDICADORES = 2, HUECO = '________';
  const ERROR = /^(error|residuo|residual|dentro)/i;
  const ficha = k => (SP.guias ? SP.guias.buscar(k.clave, k.titulo) : null);

  /** El cuadro para completar: en un análisis de varianza, sin los CM ni las F (lo demás, igual que en el reporte). */
  function huecos(c, visibles) {
    const k = SP.formatos.celdas(c, visibles), cols = SP.formatos.columnas(c, visibles);
    const ids = cols.map(col => { const g = ficha(col); return g ? g.id : null; });
    const jSC = ids.indexOf('sc'), jGL = ids.indexOf('gl'), jCM = ids.indexOf('cm'), jF = ids.indexOf('F');
    let n = 0;
    if (jSC < 0 || jGL < 0 || (jCM < 0 && jF < 0)) return Object.assign(k, { huecos: 0 });
    const filas = k.filas.map((f, i) => f.map((v, j) => {
      if (k.totales[i] || v === '' || v === '—') return v;
      if (j === jCM || j === jF) { n++; return HUECO; }
      return v;
    }));
    return Object.assign({}, k, { filas, huecos: n });
  }

  const nombreFicha = id => { const g = SP.guias && SP.guias.ficha(id); return g ? g.nombre : id; };
  const fmt = (id, v) => { try { return SP.guias.formatoDe(id)(v); } catch (e) { return String(v); } };

  /** Las preguntas de un análisis, cada una con su respuesta. */
  function preguntas(it, o) {
    const out = [], rep = it.rep || {}, alfa = (it.op && it.op.alfa) || (it.r && it.r.alfa) || 0.05;
    const c0 = (rep.cuadros || [])[0];
    const q = (texto, respuesta, extra) => out.push(Object.assign({ texto, respuesta }, extra || {}));
    /* 1. el cuadro para completar */
    const h = c0 ? huecos(c0, it.visibles) : null;
    if (h && h.huecos) q(T('Completa el cuadro: calcula cada cuadrado medio (CM = SC / gl) y cada F (el CM del efecto entre el CM del error con que se prueba).'),
      T('El cuadro completo va abajo.'), { cuadro: { c: c0, h } });
    /* 2. decidir con los valores p */
    const cols = c0 ? SP.formatos.columnas(c0, it.visibles) : [];
    const pCol = cols.find(col => { const g = ficha(col); return g && g.id === 'p'; });
    if (pCol && (rep.conclusiones || []).length) q(T('Con los valores p del cuadro y α = {a}, ¿qué efectos son significativos? Justifica tu respuesta.', { a: alfa }), rep.conclusiones.join(' '));
    /* 3. interpretar indicadores */
    /* un indicador de un solo valor (no los de una columna con un valor por grupo: ahí la guía no es la del caso) */
    (it.indicadores || []).filter(x => x.ficha !== 'p' && x.ficha !== 'p-ajustado' && !x.multiple).slice(0, MAX_INDICADORES).forEach(x => {
      let r = [];
      try { r = SP.guias.interpretar(x.ficha, [{ valor: x.valor, etiqueta: '' }], x.contexto || {}); } catch (e) { r = []; }
      if (r.length) q(T('{n} = {v}. ¿Qué dice este valor del resultado?', { n: x.titulo, v: fmt(x.ficha, x.valor) }), r.join(' '));
    });
    /* 4. los supuestos, de la ficha del método */
    const m = (o.metodos || []).find(z => z.id === it.id);
    const sup = m && m.ficha && (m.ficha.supuestos || []);
    if (sup && sup.length) q(T('¿De qué supuestos depende este análisis?'), sup.map(s => s.nombre).join('; ') + '.');
    /* 5. la conclusión en palabras */
    let fr = [];
    try { fr = SP.claro ? SP.claro.frases(it.id, it.r, rep) : []; } catch (e) { fr = []; }
    fr = fr.filter(x => !/bloque Análisis|Analysis block/.test(x));
    if (fr.length) q(T('Escribe la conclusión de este análisis en dos o tres frases, sin símbolos estadísticos.'), fr.join(' '));
    return out;
  }

  function bloques(items, opciones) {
    const o = Object.assign({ titulo: T('Reporte de análisis estadístico'), conDatos: true, conClave: true, maxFilas: MAX_FILAS }, opciones || {});
    const out = [], clave = [];
    out.push({ tipo: 'titulo', texto: o.titulo });
    out.push({ tipo: 'subtitulo', texto: T('Hoja de trabajo para clase') });
    out.push({ tipo: 'campos', campos: [T('Nombre'), T('Grupo'), T('Fecha')] });
    out.push({ tipo: 'parrafo', texto: T('Lee el planteamiento de cada ejercicio, completa sus cuadros y contesta las preguntas en los renglones. Los números salen de los datos de esta hoja.') });
    /* los datos */
    const d = o.datos;
    if (o.conDatos && d && d.nombres && d.filas && d.filas.length) {
      out.push({ tipo: 'encabezado', nivel: 1, texto: T('Los datos') });
      const filas = d.filas.slice(0, o.maxFilas).map(f => f.map(v => (v === null || v === undefined ? '' : String(v))));
      out.push({ tipo: 'cuadro', leyenda: { etiqueta: T('Cuadro'), numero: 1, texto: d.origen || T('Los datos'), seq: 'Cuadro' }, cabecera: d.nombres, filas,
        numericas: d.nombres.map((_, j) => filas.every(f => f[j] === '' || !isNaN(Number(f[j])))), totales: filas.map(() => false),
        notas: d.filas.length > o.maxFilas ? [T('Se muestran {k} de {n} filas; los datos completos van en el archivo de la clase.', { k: o.maxFilas, n: d.filas.length })] : [T('{n} filas.', { n: d.filas.length })] });
    }
    let nq = 0, nc = out.some(b => b.tipo === 'cuadro') ? 1 : 0;
    items.forEach((it, i) => {
      out.push({ tipo: 'encabezado', nivel: 1, texto: T('Ejercicio {k}. {t}', { k: i + 1, t: it.titulo }) });
      let p = null;
      try { p = SP.informe.parrafo(it.id, it.r, it.rep, it.e, it.op); } catch (e) { p = null; }
      if (p && p.metodos) out.push({ tipo: 'parrafo', texto: p.metodos });
      const qs = preguntas(it, o);
      /* sin cuadro para completar, el cuadro principal a la vista: las preguntas se contestan con él */
      const c0 = ((it.rep || {}).cuadros || [])[0];
      if (c0 && !qs.some(x => x.cuadro)) {
        const k = SP.formatos.celdas(c0, it.visibles);
        nc++;
        out.push({ tipo: 'cuadro', leyenda: { etiqueta: T('Cuadro'), numero: nc, texto: c0.titulo, seq: 'Cuadro' }, cabecera: k.cabecera, filas: k.filas, numericas: k.numericas, totales: k.totales, notas: c0.notas || [] });
      }
      clave.push({ titulo: T('Ejercicio {k}. {t}', { k: i + 1, t: it.titulo }), qs: qs.map(x => Object.assign({ numero: 0 }, x)) });
      qs.forEach((x, j) => {
        nq++;
        clave[clave.length - 1].qs[j].numero = nq;
        out.push({ tipo: 'pregunta', numero: nq, texto: x.texto, renglones: x.cuadro ? 0 : RENGLONES });
        if (x.cuadro) {
          nc++;
          out.push({ tipo: 'cuadro', leyenda: { etiqueta: T('Cuadro'), numero: nc, texto: x.cuadro.c.titulo + ' ' + T('(para completar)'), seq: 'Cuadro' },
            cabecera: x.cuadro.h.cabecera, filas: x.cuadro.h.filas, numericas: x.cuadro.h.numericas, totales: x.cuadro.h.totales, notas: [] });
          clave[clave.length - 1].qs[j].numeroCuadro = nc;
        }
      });
    });
    /* la clave */
    if (o.conClave && clave.some(e => e.qs.length)) {
      out.push({ tipo: 'salto' });
      out.push({ tipo: 'encabezado', nivel: 1, texto: T('Clave de respuestas (para quien enseña)') });
      clave.forEach((e, i) => {
        if (!e.qs.length) return;
        out.push({ tipo: 'encabezado', nivel: 2, texto: e.titulo });
        e.qs.forEach(x => {
          out.push({ tipo: 'respuesta', numero: x.numero, texto: x.respuesta });
          if (x.cuadro) {
            const k = SP.formatos.celdas(x.cuadro.c, items[i].visibles);
            /* el mismo número que en la hoja: sin campo SEQ, que lo volvería a contar */
            out.push({ tipo: 'cuadro', leyenda: { etiqueta: T('Cuadro'), numero: x.numeroCuadro, texto: x.cuadro.c.titulo, fijo: true },
              cabecera: k.cabecera, filas: k.filas, numericas: k.numericas, totales: k.totales, notas: x.cuadro.c.notas || [] });
          }
        });
      });
    }
    return out;
  }

  SP.hojaTrabajo = { bloques, huecos, preguntas };
});

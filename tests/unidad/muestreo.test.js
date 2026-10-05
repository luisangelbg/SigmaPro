/* Pruebas del muestreo (js/nucleo/muestreo.js y js/metodos/muestreo.js): valores de libro del tamaño de muestra, el
   censo (sin error de muestreo), la suma de las asignaciones, la lectura de los tamaños de los estratos, los mensajes
   de error, el reporte, el código R y el párrafo. Los números contra R están en tests/casos/muestreo. */
SPT.describir('Muestreo · núcleo', () => {
  SPT.caso('Tamaño de muestra: los valores de libro de una proporción y de una media', () => {
    const M = SP.muestreo;
    const p = M.tamano({ tipo: 'proporcion', p: 0.5, error: 0.05, N: 0, confianza: 0.95 });
    SPT.cerca(p.n0, 384.1458820694124, 1e-9);
    SPT.igual(p.n_entero, 385);
    const pf = M.tamano({ tipo: 'proporcion', p: 0.5, error: 0.05, N: 1500, confianza: 0.95 });
    /* para la proporción, la corrección por población finita es n₀/[1 + (n₀ − 1)/N] (Cochran, 1977, cap. 4) */
    SPT.cerca(pf.n, 384.1458820694124 / (1 + 383.1458820694124 / 1500), 1e-12);
    SPT.igual(pf.n_entero, 306);
    const mf = M.tamano({ tipo: 'media', de: 18, error: 4.5, N: 200, confianza: 0.95 });
    SPT.cerca(mf.n, mf.n0 / (1 + mf.n0 / 200), 1e-12);
    /* con CV y error relativos da lo mismo que con S y e absolutos de la misma proporción */
    const a = M.tamano({ tipo: 'media', de: 18, error: 4.5, N: 0, confianza: 0.95 }), r = M.tamano({ tipo: 'media', relativo: true, cv: 20, error: 5, N: 0, confianza: 0.95 });
    SPT.cerca(a.n0, r.n0, 1e-12);
  });
  SPT.caso('Aleatorio simple: un censo no tiene error de muestreo y una proporción 0/1 usa p(1 − p)·n/(n − 1)', () => {
    const y = [3, 5, 4, 6, 7, 5, 4];
    const censo = SP.muestreo.simple({ y, N: y.length, confianza: 0.95 });
    SPT.igual(censo.ee, 0);
    SPT.cerca(censo.total, 34, 1e-12);
    const b = [1, 0, 0, 1, 1, 0, 0, 0, 1, 0];
    const p = SP.muestreo.simple({ y: b, N: 0, confianza: 0.95, proporcion: true }), m = SP.muestreo.simple({ y: b, N: 0, confianza: 0.95 });
    SPT.cerca(p.varianza, m.varianza, 1e-14);
    SPT.cerca(p.varianza, 0.4 * 0.6 * 10 / 9, 1e-14);
  });
  SPT.caso('Estratificado: con un solo estrato es el aleatorio simple; las asignaciones suman la muestra', () => {
    const y = [5.1, 6.3, 4.8, 5.9, 6.6, 5.2];
    const e = SP.muestreo.estratificado({ y, estrato: y.map(() => 0), niveles: ['A'], Nh: [40], confianza: 0.95, nTotal: 0 });
    const s = SP.muestreo.simple({ y, N: 40, confianza: 0.95 });
    SPT.cerca(e.media, s.media, 1e-14); SPT.cerca(e.ee, s.ee, 1e-14); SPT.cerca(e.gl, y.length - 1, 1e-12); SPT.cerca(e.ic[1], s.ic[1], 1e-12);
    const y2 = [4, 5, 6, 5, 9, 12, 10, 11, 20, 26, 23], h = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
    /* censo: todos los estratos completos → EE = 0, sin NaN en los gl ni en el intervalo */
    const cs = SP.muestreo.estratificado({ y: [2, 4, 3, 7, 9], estrato: [0, 0, 0, 1, 1], niveles: ['a', 'b'], Nh: [3, 2], confianza: 0.95, nTotal: 0 });
    SPT.igual(cs.ee, 0);
    SPT.afirmar(cs.ic.every(Number.isFinite) && cs.ic[0] === cs.media && cs.ic[1] === cs.media, 'el intervalo de un censo es el punto');
    const r = SP.muestreo.estratificado({ y: y2, estrato: h, niveles: ['a', 'b', 'c'], Nh: [100, 60, 30], confianza: 0.9, nTotal: 50 });
    SPT.cerca(r.asignacion.proporcional.reduce((a, b) => a + b, 0), 50, 1e-12);
    SPT.cerca(r.asignacion.neyman.reduce((a, b) => a + b, 0), 50, 1e-12);
    SPT.cerca(r.estratos.reduce((a, x) => a + x.W, 0), 1, 1e-14);
    /* Neyman da más unidades, por unidad de población, al estrato más variable */
    SPT.afirmar(r.asignacion.neyman[2] / 30 > r.asignacion.neyman[0] / 100, 'Neyman favorece al estrato variable');
  });
});

SPT.describir('Muestreo · métodos', () => {
  const tabla = () => SP.tabla.crear({ huerta: ['Ladera', 'Ladera', 'Ladera', 'Vega', 'Vega', 'Vega', 'Vega', 'Planicie', 'Planicie', 'Planicie'],
    kg: [40, 45, 38, 61, 66, 58, 63, 50, 47, 52], plaga: [0, 1, 0, 0, 0, 1, 0, 0, 1, 0] }, { huerta: { tipo: 'factor' } });
  SPT.caso('Los tamaños de los estratos se leen con = o :, con espacios y con nombres que llevan dos puntos', () => {
    const P = SP.metodosMuestreo.poblaciones;
    SPT.igualJSON(P('A=10; B: 20\nC = 30', ['A', 'B', 'C']), [10, 20, 30]);
    SPT.igualJSON(P('lote: 1=30; lote: 2=45', ['lote: 1', 'lote: 2']), [30, 45]);
    SPT.lanza(() => P('A=10', ['A', 'B']), '«B»');
  });
  SPT.caso('Reporte, código R y párrafo de los tres métodos', () => {
    const t = tabla();
    const pedidos = [['tamano-muestra', null, {}, { tipo: 'proporcion', p: 0.3, error: 0.05, N: 800 }, 'qnorm'],
      ['muestreo-simple', t, { respuesta: 'kg' }, { N: 400 }, 'sqrt((1 - f)'], ['muestreo-simple', t, { respuesta: 'plaga' }, {}, 'var(y)'],
      ['muestreo-estratificado', t, { respuesta: 'kg', estrato: 'huerta' }, { poblaciones: 'Ladera=120; Planicie=300; Vega=80', nTotal: 30 }, 'neyman']];
    for (const [id, tb, e, op0, fn] of pedidos) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, op0), r = SP.ejecutar(id, tb, e, op).resultado, rep = f.reporte(r);
      const todo = rep.conclusiones.join(' ') + JSON.stringify(rep.cuadros);
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length && !/undefined|NaN|\{[a-zA-Z]+\}/.test(todo), id + ': ' + todo.slice(0, 200));
      SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes(fn), id + ': ' + fn);
      const p = SP.informe.parrafo(id, r, rep, e, op);
      SPT.afirmar(/Cochran, 1977/.test(p.metodos) && p.resultados && !/undefined|NaN|\{[a-zA-Z]+\}/.test(p.metodos + p.resultados), id + ': ' + p.metodos + ' ' + p.resultados);
      for (const k of p.citas) SPT.afirmar(SP.informe.referencia(k).length > 20, id + ': cita sin referencia ' + k);
    }
    const pr = SP.ejecutar('muestreo-simple', t, { respuesta: 'plaga' }, SP.opcionesCon(SP.metodos['muestreo-simple'], {})).resultado;
    SPT.afirmar(pr.proporcion, 'una columna 0/1 se toma como proporción');
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla(), op = (id, x) => SP.opcionesCon(SP.metodos[id], x);
    SPT.lanza(() => SP.ejecutar('muestreo-estratificado', t, { respuesta: 'kg', estrato: 'huerta' }, op('muestreo-estratificado', { poblaciones: 'Ladera=120; Vega=80' })), '«Planicie»');
    SPT.lanza(() => SP.ejecutar('muestreo-estratificado', t, { respuesta: 'kg', estrato: 'huerta' }, op('muestreo-estratificado', { poblaciones: 'Ladera=2; Planicie=300; Vega=80' })), 'menor que la muestra');
    SPT.lanza(() => SP.ejecutar('muestreo-simple', t, { respuesta: 'kg' }, op('muestreo-simple', { N: 5 })), 'menor que la muestra');
    SPT.lanza(() => SP.ejecutar('muestreo-simple', t, { respuesta: 'kg' }, op('muestreo-simple', { tipo: 'proporcion' })), '0 o 1');
    SPT.lanza(() => SP.ejecutar('tamano-muestra', null, {}, op('tamano-muestra', { tipo: 'proporcion', p: 1.2 })), 'entre 0 y 1');
    SPT.lanza(() => SP.ejecutar('tamano-muestra', null, {}, op('tamano-muestra', { error: 0 })), 'mayor que cero');
  });
});

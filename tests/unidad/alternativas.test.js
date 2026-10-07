/* Pruebas de js/nucleo/alternativas.js (hito 5.3): qué alternativa se ofrece cuando un supuesto falla y que el pedido
   que arma corra con el método al que lleva. */
SPT.describir('Alternativas cuando un supuesto falla', () => {
  const A = o => SP.alternativas.de(o);
  const correr = (metodo, t, e, op) => {
    const f = SP.metodos[metodo], opciones = SP.opcionesCon(f, op || {}), r = SP.ejecutar(metodo, t, e, opciones).resultado;
    return { r, rep: f.reporte(r), opciones };
  };
  /* tres grupos con dispersión creciente: las varianzas difieren */
  const tablaDispersa = () => SP.tabla.crear({
    y: [5.0, 5.1, 4.9, 5.2, 4.8, 5.05, 8, 10, 6, 11, 7, 9, 12, 25, 8, 30, 15, 20],
    g: ['a', 'a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c', 'c', 'c'],
  }, { g: { tipo: 'factor' } });

  SPT.caso('La t de Student con varianzas distintas ofrece la de Welch, y la de Welch las deja en verde', () => {
    const t = SP.tabla.crear({ y: [10.1, 9.8, 10.3, 10.0, 9.9, 10.2, 4, 18, 7, 25, 1, 13], g: ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B'] }, { g: { tipo: 'factor' } });
    const e = { modo: 'independientes', respuesta: 'y', grupo: 'g', niveles: ['A', 'B'] }, x = correr('prueba-t', t, e, { varIguales: true });
    const alts = A({ metodo: 'prueba-t', e, op: x.opciones, r: x.r, rep: x.rep, tabla: t });
    const welch = alts.find(a => a.supuesto === 'varianzas');
    SPT.afirmar(welch && welch.metodo === 'prueba-t' && welch.op.varIguales === false, JSON.stringify(alts));
    const y = correr(welch.metodo, t, welch.e, welch.op);
    SPT.igual(y.rep.titulo, 't de Welch');
    SPT.igual(y.rep.semaforo.find(s => s.clave === 'varianzas').color, 'verde');
  });
  SPT.caso('Supuestos de un factor con varianzas distintas: la transformación, Kruskal-Wallis y Games-Howell, y todas corren', () => {
    const t = tablaDispersa(), e = { respuesta: 'y', tratamientos: ['g'] }, x = correr('supuestos', t, e, {});
    SPT.afirmar(x.rep.semaforo.find(s => s.clave === 'varianzas').color !== 'verde', 'las varianzas fallan');
    const alts = A({ metodo: 'supuestos', e, op: x.opciones, r: x.r, rep: x.rep, tabla: t });
    const metodos = alts.map(a => a.metodo);
    SPT.afirmar(metodos.includes('kruskal-wallis') && metodos.includes('comparaciones-medias'), metodos.join(', '));
    for (const a of alts) {
      let t2 = t;
      if (a.transformar) {
        const datos = SP.transformar.aplicar(a.transformar.tipo, t.col(a.transformar.columna).valores, a.transformar.parametros);
        t2 = SP.tabla.crear({ y: Array.from(t.col('y').valores), g: ['a', 'a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c', 'c', 'c'], [a.transformar.nombre]: Array.from(datos) }, { g: { tipo: 'factor' } });
        SPT.igual(a.e.respuesta, a.transformar.nombre, 'el análisis usa la columna nueva');
      }
      const y = correr(a.metodo, t2, a.e, a.op);
      SPT.afirmar(y.rep && y.rep.titulo, a.metodo + ' corre');
    }
  });
  SPT.caso('Con dos factores no hay prueba por rangos; sin fallas no hay alternativas', () => {
    const rep = { semaforo: [{ clave: 'normalidad', color: 'rojo' }, { clave: 'varianzas', color: 'rojo' }] };
    const alts = A({ metodo: 'supuestos', e: { respuesta: 'y', tratamientos: ['a', 'b'] }, op: {}, r: { boxcox: { sugerencia: { transformacion: 'log', lambda: 0 } }, respuesta_tipo: 'continua', n: 48 }, rep });
    SPT.igualJSON(alts.map(a => a.metodo), ['supuestos'], 'solo la transformación');
    SPT.igual(alts[0].transformar.nombre, 'ln_y'); SPT.igual(alts[0].e.respuesta, 'ln_y'); SPT.igual(alts[0].transformar.detalle, 'El logaritmo de «y»');
    SPT.igualJSON(A({ metodo: 'supuestos', e: { respuesta: 'y', tratamientos: ['a'] }, op: {}, r: {}, rep: { semaforo: [{ clave: 'normalidad', color: 'verde' }] } }), []);
    SPT.igualJSON(A({ metodo: 'dbca', e: {}, op: {}, r: {}, rep: { semaforo: [{ clave: 'x', color: 'rojo' }] } }), [], 'un método sin alternativas registradas');
  });
  SPT.caso('Conteos con sobredispersión: la binomial negativa', () => {
    const y = [0, 0, 1, 15, 2, 0, 22, 3, 5, 40, 0, 2, 60, 1, 3, 30, 9, 0, 70, 2, 45, 1, 0, 33];
    const t = SP.tabla.crear({ y, g: y.map((v, i) => ['A', 'B', 'C'][Math.floor(i / 8)]) }, { g: { tipo: 'factor' } });
    const e = { respuesta: 'y', tratamientos: ['g'], bloque: '' }, x = correr('glm-conteos', t, e, { familia: 'poisson' });
    const alts = A({ metodo: 'glm-conteos', e, op: x.opciones, r: x.r, rep: x.rep, tabla: t });
    SPT.igual(alts.length, 1); SPT.igual(alts[0].op.familia, 'binomial-negativa');
    const z = correr('glm-conteos', t, alts[0].e, alts[0].op);
    SPT.igual(z.r.familia, 'binomial-negativa');
  });
  SPT.caso('Regresión: el logaritmo, la curva de grado 2, los conteos y los mejores subconjuntos, por el nombre de cada renglón', () => {
    const t = SP.tabla.crear({ y: [3, 5, 9, 14, 22, 35, 51, 80], x1: [1, 2, 3, 4, 5, 6, 7, 8], x2: [2, 1, 4, 3, 6, 5, 8, 7], x3: [1, 1, 2, 2, 3, 3, 4, 4] });
    const rep = nombres => ({ semaforo: nombres.map(([nombre, color]) => ({ nombre, color })) });
    const una = A({ metodo: 'regresion-lineal', e: { respuesta: 'y', predictores: ['x1'] }, op: {}, rep: rep([['Varianza constante', 'rojo'], ['Forma del modelo', 'ambar']]), tabla: t });
    SPT.igualJSON(una.map(a => a.metodo), ['regresion-lineal', 'glm-conteos', 'regresion-polinomial']);
    SPT.igual(una[0].transformar.tipo, 'log'); SPT.igual(una[2].op.grado, 2);
    const tres = A({ metodo: 'regresion-lineal', e: { respuesta: 'y', predictores: ['x1', 'x2', 'x3'] }, op: {}, rep: rep([['Colinealidad', 'rojo']]), tabla: t });
    SPT.igualJSON(tres.map(a => a.metodo), ['mejores-subconjuntos']);
    const neg = SP.tabla.crear({ y: [-1, 2, 3, 4.5], x1: [1, 2, 3, 4] });
    SPT.igualJSON(A({ metodo: 'regresion-lineal', e: { respuesta: 'y', predictores: ['x1'] }, op: {}, rep: rep([['Normalidad de los residuos', 'rojo']]), tabla: neg }), [], 'con valores no positivos no hay logaritmo');
  });
  SPT.caso('Modelos mixtos y medidas repetidas: el logaritmo si la respuesta es positiva', () => {
    const t = SP.tabla.crear({ y: [2.1, 3.4, 5.6, 1.2], b: ['1', '1', '2', '2'] }, { b: { tipo: 'factor' } });
    const rep = { semaforo: [{ nombre: 'Normalidad de los residuos', color: 'verde' }, { nombre: 'Varianzas iguales', color: 'rojo' }] };
    const alts = A({ metodo: 'mixto-bloques', e: { respuesta: 'y', tratamientos: ['b'], bloque: 'b' }, op: {}, rep, tabla: t });
    SPT.igual(alts.length, 1); SPT.igual(alts[0].supuesto, 'varianzas'); SPT.igual(alts[0].metodo, 'mixto-bloques'); SPT.igual(alts[0].e.respuesta, 'ln_y');
    SPT.igualJSON(A({ metodo: 'medidas-repetidas', e: { respuesta: 'y' }, op: {}, rep: { semaforo: [{ nombre: 'Varianzas entre fechas', color: 'ambar' }] }, tabla: t }).map(a => a.transformar.tipo), ['log']);
  });
  SPT.caso('Las sugerencias de Box-Cox, como transformaciones del bloque Datos', () => {
    const tr = s => SP.alternativas.transformacion({ transformacion: s, lambda: 0 });
    SPT.igualJSON([tr('log'), tr('raiz'), tr('reciproco')].map(x => [x.tipo, x.prefijo]), [['log', 'ln'], ['raiz', 'raiz'], ['reciproco', 'inv']]);
    SPT.igualJSON(tr('reciproco de la raiz').parametros, { lambda: -0.5 }); SPT.igualJSON(tr('cuadrado').parametros, { lambda: 2 });
    SPT.igual(SP.alternativas.transformacion({ transformacion: 'ninguna', lambda: 1 }), null);
  });
});

/* Pruebas de js/metodos/supuestos.js que no cubren los casos contra R. */
SPT.describir('Supuestos · piezas', () => {
  SPT.caso('AS 153 reproduce la tabla publicada por Farebrother (1984), con x = 0', () => {
    /* P(Σ aᵢ uᵢ² < c): a, c y la probabilidad impresa a cuatro decimales */
    const tabla = [
      [[1, 3, 6], 1, 0.0542], [[1, 3, 6], 7, 0.4936], [[1, 3, 6], 20, 0.8760],
      [[1, 3, 5, 7, 9], 5, 0.0544], [[1, 3, 5, 7, 9], 20, 0.4853], [[1, 3, 5, 7, 9], 50, 0.9069],
      [[3, 4, 5, 6, 7], 5, 0.0405], [[3, 4, 5, 6, 7], 20, 0.4603], [[3, 4, 5, 6, 7], 50, 0.9200],
    ];
    for (const [a, c, p] of tabla) SPT.cerca(SP.sup.pan([0, ...a], a.length, c, 15), p, 5e-5);
  });
  SPT.caso('valores propios de una matriz simétrica (Jacobi)', () => {
    /* [[2, 1, 0], [1, 2, 1], [0, 1, 2]] tiene 2 + √2, 2 y 2 − √2 */
    const v = SP.sup.valoresPropios(Float64Array.from([2, 1, 0, 1, 2, 1, 0, 1, 2]), 3);
    SPT.cerca(v[0], 2 + Math.SQRT2, 1e-14); SPT.cerca(v[1], 2, 1e-14); SPT.cerca(v[2], 2 - Math.SQRT2, 1e-14);
  });
  SPT.caso('el ajuste por celdas (tablas grandes) da lo mismo que la QR completa', () => {
    let s = 5;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { y: [], b: [], a: [], d: [] };
    for (let i = 0; i < 2400; i++) { const b = 1 + (i % 6), a = 1 + Math.floor(i / 6) % 5, d = [0, 40, 80, 120][Math.floor(i / 30) % 4]; c.b.push('B' + b); c.a.push('A' + a); c.d.push(String(d)); c.y.push(10 + b / 3 + a * (1 + d / 100) + 2 * (azar() - 0.5)); }
    const t = SP.tabla.crear(c, { b: { tipo: 'factor' }, a: { tipo: 'factor' }, d: { tipo: 'factor' } });
    const f = 'y ~ b + a * d';
    const rapido = SP.sup.ajustarModelo(t, f), lento = SP.lineal.ajustar(t, f);
    SPT.afirmar(rapido.agrupado === true, 'se ajustó por celdas');
    SPT.igual(rapido.glResidual, lento.glResidual);
    SPT.cerca(rapido.scResidual, lento.scResidual, 1e-10 * lento.scResidual);
    let dif = 0;
    for (let i = 0; i < 2400; i++) dif = Math.max(dif, Math.abs(rapido.residuales[i] - lento.residuales[i]));
    SPT.afirmar(dif < 1e-11, 'residuos: ' + dif);
    const ir = SP.sup.influencia(rapido), il = SP.sup.influencia(lento);
    let dh = 0, dr = 0;
    for (let i = 0; i < 2400; i++) { dh = Math.max(dh, Math.abs(ir.palanca[i] - il.palanca[i])); dr = Math.max(dr, Math.abs(ir.rstudent[i] - il.rstudent[i])); }
    SPT.afirmar(dh < 1e-12 && dr < 1e-10, 'palancas ' + dh + ', residuos estudentizados ' + dr);
    const dwr = SP.sup.durbinWatson(rapido, 'mayor'), dwl = SP.sup.durbinWatson(lento, 'mayor');
    SPT.cerca(dwr.DW, dwl.DW, 1e-12); SPT.cerca(dwr.p, dwl.p, 1e-10);
  });
  SPT.caso('la tabla en forma plana (para los hilos) da el mismo resultado', () => {
    const t = SP.tabla.crear({ y: [4.2, 5.1, 3.9, 6.0, 5.5, 4.8, 6.3, 5.9, 4.1], g: ['a', 'b', 'a', 'c', 'b', 'a', 'c', 'c', 'b'] }, { g: { tipo: 'factor', niveles: ['a', 'b', 'c'] } });
    t.col('y').fecha = false;
    const e = { respuesta: 'y', tratamientos: ['g'] };
    const directo = SP.ejecutar('supuestos', t, e, {}).resultado;
    const plano = SP.ejecutarPlano('supuestos', JSON.parse(JSON.stringify(SP.tabla.aPlano(t), (k, v) => (v instanceof Float64Array ? Array.from(v) : v))), e, {});
    SPT.cerca(plano.normalidad.shapiro.W, directo.normalidad.shapiro.W, 0);
    SPT.igual(plano.global, directo.global);
    SPT.igualJSON(plano.varianzas.grupos, ['a', 'b', 'c']);
  });
  SPT.caso('reglas del semáforo', () => {
    SPT.igualJSON([0.2, 0.05, 0.049, 0.01, 0.0099, NaN].map(p => SP.sup.color(p, 0.05)), ['verde', 'verde', 'ambar', 'ambar', 'rojo', 'gris']);
  });
  SPT.caso('Fligner conserva los empates exactos que la resta binaria rompe', () => {
    /* 0.015 − 0.010 y 0.020 − 0.015 son el mismo 0.005: deben recibir el mismo rango */
    const y = [0.010, 0.015, 0.020, 0.40, 0.41, 0.43, 0.44];
    const g = { codigos: Int32Array.from([0, 0, 0, 1, 1, 1, 1]), niveles: ['a', 'b'] };
    const r = SP.sup.fligner(y, g);
    const y2 = [0, 5, 10, 400, 410, 430, 440];        // la misma muestra en otra escala (sin ruido): mismo estadístico
    SPT.cerca(r.X2, SP.sup.fligner(y2, g).X2, 1e-12);
  });
  SPT.caso('los papeles del modelo se revisan', () => {
    const t = SP.tabla.crear({ y: [1, 2, 3, 4, 5, 6], g: ['a', 'a', 'b', 'b', 'c', 'c'] }, { g: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('supuestos', t, { respuesta: 'g' }, {}), 'numérica');
    SPT.lanza(() => SP.ejecutar('supuestos', t, { respuesta: 'y', tratamientos: ['g'], bloque: 'g' }, {}), 'dos papeles');
    const u = SP.tabla.crear({ y: [1, 2, 3], g: ['a', 'b', 'c'] }, { g: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('supuestos', u, { respuesta: 'y', tratamientos: ['g'] }, {}), 'grados de libertad');
  });
  SPT.caso('recomendaciones: conteos, un solo factor y Box-Cox', () => {
    const c = { y: [], g: [] };
    const medias = { a: 2, b: 8, c: 30 };
    let s = 3;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (const k of ['a', 'b', 'c']) for (let i = 0; i < 12; i++) { c.y.push(Math.max(0, Math.round(medias[k] + (azar() - 0.5) * medias[k] * 1.6))); c.g.push(k); }
    const t = SP.tabla.crear(c, { g: { tipo: 'factor' } });
    const f = SP.metodos.supuestos, r = SP.ejecutar('supuestos', t, { respuesta: 'y', tratamientos: ['g'] }, {}).resultado;
    SPT.igual(r.respuesta_tipo, 'conteos');
    SPT.igual(r.un_factor, true);
    const rep = f.reporte(r);
    SPT.afirmar(rep.semaforo.length === 5 && rep.semaforo.every(x => x.texto), 'cinco renglones con texto');
    if (r.semaforo[1].color !== 'verde') SPT.afirmar(rep.recomendaciones.some(x => /Games-Howell/.test(x)) && rep.recomendaciones.some(x => /conteos/.test(x)), rep.recomendaciones.join(' | '));
    const cod = f.codigoR({ respuesta: 'y', tratamientos: ['g'], bloque: 'b' }, {});
    SPT.afirmar(/nonadditivity\(datos\$y, datos\$b, g/.test(cod) && /dwtest\(m\)/.test(cod), cod);
  });
});

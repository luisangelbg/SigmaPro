/* Pruebas de supervivencia (js/nucleo/supervivencia.js y js/metodos/supervivencia.js): Kaplan-Meier sin censura es
   la proporción empírica, la prueba score de Cox con una covariable binaria y sin empates es el log-rank, la
   concordancia de un orden perfecto, la verosimilitud parcial a mano, los mensajes de error, el reporte, el código R
   y el párrafo. Los números contra survival están en tests/casos/supervivencia. */
SPT.describir('Supervivencia · núcleo', () => {
  SPT.caso('Kaplan-Meier sin censura: la proporción que aún no tiene el evento; Greenwood a mano', () => {
    const t = [3, 1, 4, 1, 5, 9, 2, 6], ev = t.map(() => 1), c = SP.supervivencia.km(t, ev, { tipo: 'log', nivel: 0.95 });
    SPT.igualJSON(c.tiempo, [1, 2, 3, 4, 5, 6, 9]);
    c.tiempo.forEach((x, i) => SPT.cerca(c.S[i], t.filter(v => v > x).length / t.length, 1e-14));
    /* Greenwood en t = 1: d = 2, n = 8 → √(2/(8·6)) */
    SPT.cerca(c.ee[0], Math.sqrt(2 / 48), 1e-14);
    SPT.igual(c.S[c.S.length - 1], 0);
    SPT.afirmar(c.ee[c.ee.length - 1] === Infinity && Number.isNaN(c.inf[c.inf.length - 1]), 'al llegar a 0 el EE es infinito y el intervalo falta');
  });
  SPT.caso('La mediana: el primer tiempo en que S ≤ 0.5 y el punto medio si S se queda en 0.5', () => {
    const K = SP.supervivencia, conf = { tipo: 'log', nivel: 0.95 };
    SPT.igual(K.cuantiles(K.km([1, 2, 3, 4, 5], [1, 1, 1, 1, 1], conf), [0.5])[0].tiempo, 3);
    SPT.igual(K.cuantiles(K.km([1, 2, 3, 4, 5, 6], [1, 1, 1, 0, 1, 0], conf), [0.5])[0].tiempo, 4);
    SPT.afirmar(Number.isNaN(K.cuantiles(K.km([1, 2, 3, 4], [1, 0, 0, 0], conf), [0.5])[0].tiempo), 'sin llegar a 0.5 no hay mediana');
  });
  SPT.caso('Cox con una covariable binaria y sin empates: la prueba score es el log-rank', () => {
    const t = [2, 3, 5, 7, 8, 11, 12, 15, 17, 20, 22, 25], ev = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1], g = [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1];
    const lr = SP.supervivencia.logrank(t, ev, g, 2, 0), cx = SP.supervivencia.cox(t, ev, g.map(v => [v]), { empates: 'efron' });
    SPT.cerca(cx.score, lr.chi2, 1e-10);
    /* en el óptimo el gradiente es cero y la LR es positiva */
    const e = SP.supervivencia.evaluar(t, ev, g.map(v => [v]), cx.coef, true);
    SPT.cerca(e.U[0], 0, 1e-9);
    SPT.afirmar(cx.lr > 0 && cx.convergio, 'LR > 0 y converge');
  });
  SPT.caso('Verosimilitud parcial a mano (dos tiempos, sin empates) y Efron = Breslow sin empates', () => {
    const t = [1, 2, 3], ev = [1, 1, 0], x = [[0], [1], [2]], b = 0.4;
    const r = x.map(v => Math.exp(b * v[0])), ll = Math.log(r[0] / (r[0] + r[1] + r[2])) + Math.log(r[1] / (r[1] + r[2]));
    SPT.cerca(SP.supervivencia.evaluar(t, ev, x, [b], true).ll, ll, 1e-14);
    SPT.cerca(SP.supervivencia.evaluar(t, ev, x, [b], false).ll, ll, 1e-14);
  });
  SPT.caso('Concordancia: 1 con el orden perfecto, 0 con el inverso y 0.5 con el predictor constante', () => {
    const t = [1, 2, 3, 4, 5], ev = [1, 1, 1, 1, 0], C = SP.supervivencia.concordancia;
    SPT.igual(C(t, ev, [5, 4, 3, 2, 1]).C, 1);
    SPT.igual(C(t, ev, [1, 2, 3, 4, 5]).C, 0);
    SPT.igual(C(t, ev, [1, 1, 1, 1, 1]).C, 0.5);
  });
});

SPT.describir('Supervivencia · métodos', () => {
  const tabla = () => SP.tabla.crear({ trat: ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B'], dias: [2, 3, 3, 5, 8, 10, 4, 6, 9, 10, 10, 10],
    germino: [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0], peso: [1.2, 1.0, 1.4, 0.9, 1.1, 1.3, 0.8, 1.0, 0.7, 0.9, 1.2, 0.6] }, { trat: { tipo: 'factor' } });
  SPT.caso('Reporte, código R y párrafo de Kaplan-Meier y de Cox', () => {
    const t = tabla();
    const pedidos = [['kaplan-meier', { tiempo: 'dias', evento: 'germino', grupo: 'trat' }, {}, 'survdiff'], ['kaplan-meier', { tiempo: 'dias', evento: 'germino' }, { conf: 'plain' }, 'survfit'],
      ['cox', { tiempo: 'dias', evento: 'germino', factores: ['trat'], covariables: ['peso'] }, {}, 'cox.zph']];
    for (const [id, e, op0, fn] of pedidos) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, op0), r = SP.ejecutar(id, t, e, op).resultado, rep = f.reporte(r);
      const todo = rep.conclusiones.join(' ') + JSON.stringify(rep.cuadros);
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length && !/undefined|NaN|\{[a-zA-Z]+\}/.test(todo), id + ': ' + todo.slice(0, 200));
      SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes(fn), id + ': ' + fn);
      const p = SP.informe.parrafo(id, r, rep, e, op);
      SPT.afirmar(p.metodos && p.resultados && !/undefined|NaN|\{[a-zA-Z]+\}/.test(p.metodos + p.resultados), id + ': ' + p.metodos + ' ' + p.resultados);
      for (const k of p.citas) SPT.afirmar(SP.informe.referencia(k).length > 20, id + ': cita sin referencia ' + k);
    }
  });
  SPT.caso('Estratos: log-rank suma los estratos, Cox con un solo estrato es el de sin estratos, la concordancia solo cuenta pares del mismo estrato', () => {
    const K = SP.supervivencia, t = [2, 3, 5, 7, 8, 11, 12, 15, 17, 20, 22, 25], ev = [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1], g = [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1], s = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
    const a = K.logrank(t.slice(0, 6), ev.slice(0, 6), g.slice(0, 6), 2, 0), b = K.logrank(t.slice(6), ev.slice(6), g.slice(6), 2, 0), e = K.logrank(t, ev, g, 2, 0, s);
    SPT.cerca(e.observados[1], a.observados[1] + b.observados[1], 1e-14);
    SPT.cerca(e.esperados[0], a.esperados[0] + b.esperados[0], 1e-14);
    SPT.cerca(e.varianza[1][1], a.varianza[1][1] + b.varianza[1][1], 1e-14);
    const X = g.map(v => [v]), uno = K.cox(t, ev, X, { empates: 'efron', estratos: t.map(() => 0) }), sin = K.cox(t, ev, X, { empates: 'efron' });
    SPT.cerca(uno.coef[0], sin.coef[0], 1e-12); SPT.cerca(uno.ll, sin.ll, 1e-12);
    /* con estratos, el log-verosímil parcial es la suma de los de cada estrato */
    const est = K.cox(t, ev, X, { empates: 'efron', estratos: s });
    const ll = K.evaluar(t.slice(0, 6), ev.slice(0, 6), X.slice(0, 6), est.coef, true).ll + K.evaluar(t.slice(6), ev.slice(6), X.slice(6), est.coef, true).ll;
    SPT.cerca(est.ll, ll, 1e-12);
    const lp = t.map((_, i) => -i), cE = K.concordancia(t, ev, lp, s), c1 = K.concordancia(t.slice(0, 6), ev.slice(0, 6), lp.slice(0, 6)), c2 = K.concordancia(t.slice(6), ev.slice(6), lp.slice(6));
    SPT.igual(cE.concordantes + cE.discordantes, c1.concordantes + c1.discordantes + c2.concordantes + c2.discordantes);
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla(), op = id => SP.opcionesCon(SP.metodos[id], {});
    SPT.lanza(() => SP.ejecutar('kaplan-meier', SP.tabla.crear({ d: [1, 2, 3, 4], e: [1, 1, 0, 1], l: ['a', 'a', 'b', 'b'] }, { l: { tipo: 'factor' } }), { tiempo: 'd', evento: 'e', estrato: 'l' }, op('kaplan-meier')), 'elige también los grupos');
    SPT.lanza(() => SP.ejecutar('kaplan-meier', t, { tiempo: 'dias', evento: 'peso' }, op('kaplan-meier')), '1 (ocurrió el evento');
    SPT.lanza(() => SP.ejecutar('cox', t, { tiempo: 'dias', evento: 'germino' }, op('cox')), 'al menos un factor');
    const sinEventos = SP.tabla.crear({ t: [1, 2, 3], e: [0, 0, 0] }, {});
    SPT.lanza(() => SP.ejecutar('kaplan-meier', sinEventos, { tiempo: 't', evento: 'e' }, op('kaplan-meier')), 'Ninguna unidad');
    const negativo = SP.tabla.crear({ t: [1, -2, 3], e: [1, 0, 1] }, {});
    SPT.lanza(() => SP.ejecutar('kaplan-meier', negativo, { tiempo: 't', evento: 'e' }, op('kaplan-meier')), 'negativo');
  });
});

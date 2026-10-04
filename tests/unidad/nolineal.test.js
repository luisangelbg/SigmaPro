/* Pruebas de la regresión no lineal (js/nucleo/nolineal.js y js/metodos/nolineal.js): los gradientes analíticos contra
   diferencias finitas, el mínimo de Brent, el perfil de lineal-meseta, la dosis cero del log-logístico, los mensajes
   de error, el reporte y el código R. Los números contra nls están en tests/casos/nolineal. */
SPT.describir('Regresión no lineal · modelos y gradientes', () => {
  SPT.caso('Cada gradiente analítico coincide con las diferencias finitas', () => {
    const casos = { logistico: [[3, 7], [190, 700, 350]], gompertz: [[0.5, 2], [4.6, 2.3, 0.7]], weibull: [[3, 8], [160, 115, -5.9, 2.6]], ll4: [[20, 150], [1.8, 0.4, 5, 60]],
      ll3: [[2, 9], [2.2, 92, 5]], mitscherlich: [[4, 15], [94, 102, 0.04]], 'cuadratico-meseta': [[30, 400], [4, 0.04, -0.0001]], 'lineal-meseta': [[50, 200], [4, 0.035, 140]] };
    for (const [m, [xs, p]] of Object.entries(casos)) for (const x of xs) {
      const g = SP.nolineal.MODELOS[m].f(x, p)[1];
      p.forEach((v, k) => {
        const h = 1e-6 * (Math.abs(v) || 1), mas = p.slice(), menos = p.slice();
        mas[k] += h; menos[k] -= h;
        const fd = (SP.nolineal.MODELOS[m].f(x, mas)[0] - SP.nolineal.MODELOS[m].f(x, menos)[0]) / (2 * h);
        SPT.cerca(g[k], fd, 1e-5, m + ' ∂/∂' + SP.nolineal.MODELOS[m].par[k] + ' en x = ' + x);
      });
    }
  });
  SPT.caso('Dosis cero en el log-logístico: el límite superior y gradiente solo en d', () => {
    const [v, g] = SP.nolineal.MODELOS.ll4.f(0, [1.8, 0.4, 5, 60]);
    SPT.igual(v, 5); SPT.igualJSON(g, [0, 0, 1, 0]);
    SPT.igual(SP.nolineal.MODELOS.ll3.f(0, [2, 92, 5])[0], 92);
  });
  SPT.caso('Brent encuentra el mínimo y el perfil de lineal-meseta da el quiebre exacto', () => {
    const o = SP.nolineal.brentMin(x => (x - 2.5) ** 2 + 1, 0, 10, 1e-14);
    SPT.cerca(o.x, 2.5, 1e-7); SPT.cerca(o.f, 1, 1e-14);
    const x = [0, 40, 80, 120, 160, 200, 240], y = x.map(v => 4 + 0.035 * Math.min(v, 140));
    const [a, b, x0] = SP.nolineal.perfilMeseta(x, y);
    SPT.cerca(a, 4, 1e-9); SPT.cerca(b, 0.035, 1e-9); SPT.cerca(x0, 140, 1e-6);
  });
});

SPT.describir('Regresión no lineal · métodos', () => {
  const tabla = () => {
    let s = 5;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { dosis: [], peso: [], prod: [] };
    for (const prod of ['A', 'B']) for (const d of [0, 10, 25, 50, 100, 200, 400]) for (let r = 0; r < 3; r++) {
      c.dosis.push(d); c.prod.push(prod); c.peso.push(0.4 + 4.6 / (1 + Math.pow(d / (prod === 'A' ? 60 : 140), 1.8)) + 0.3 * (az() - 0.5));
    }
    return SP.tabla.crear(c, { prod: { tipo: 'factor' } });
  };
  SPT.caso('Dosis-respuesta por producto: DE50 cerca de la verdadera, comparación, reporte, código R y párrafo', () => {
    const f = SP.metodos['dosis-respuesta'], e = { respuesta: 'peso', dosis: 'dosis', grupo: 'prod' }, op = SP.opcionesCon(f, { modelo: 'll4' });
    const r = SP.ejecutar('dosis-respuesta', tabla(), e, op).resultado;
    const de50 = r.derivados.filter(z => z.nombre === 'DE50');
    SPT.afirmar(Math.abs(de50[0].valor - 60) < 8 && Math.abs(de50[1].valor - 140) < 20, 'DE50 ' + de50.map(z => z.valor.toFixed(1)));
    SPT.afirmar(r.comparacion.global.p < 0.001, 'los productos difieren');
    SPT.igual(r.parametros.estimado.length, 8);
    const rep = f.reporte(r);
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['parametros', 'derivados', 'comparacion', 'ajuste']);
    const cod = f.codigoR(e, op, { resultado: r });
    SPT.afirmar(cod.includes('nls(y ~ c[g] + (d[g] - c[g]) / (1 + exp(b[g] * (log(x) - log(e[g]))))'), cod.split('\n')[4]);
    SPT.afirmar(cod.includes('anova(m0, m)'), 'comparación');
    const p = SP.informe.parrafo('dosis-respuesta', r, rep, e, op);
    SPT.afirmar(/Seefeldt et al\., 1995/.test(p.metodos) && /DE50/.test(p.resultados), p.resultados);
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla(), f = id => SP.metodos[id];
    SPT.lanza(() => SP.ejecutar('dosis-respuesta', t, { respuesta: 'peso', dosis: 'dosis' }, { modelo: 'logistico' }), 'Modelo no válido');
    SPT.lanza(() => SP.ejecutar('curva-crecimiento', t, { respuesta: 'peso' }, { modelo: 'logistico' }), 'tiempo');
    const neg = SP.tabla.crear({ d: [-1, 1, 2, 3, 4, 5, 6], y: [5, 4, 3, 2, 1, 1, 1] }, {});
    SPT.lanza(() => SP.ejecutar('dosis-respuesta', neg, { respuesta: 'y', dosis: 'd' }, { modelo: 'll4' }), 'negativas');
    const poco = SP.tabla.crear({ d: [1, 2, 3, 4], y: [5, 4, 3, 2] }, {});
    SPT.lanza(() => SP.ejecutar('dosis-respuesta', poco, { respuesta: 'y', dosis: 'd' }, { modelo: 'll4' }), 'Faltan datos');
  });
  SPT.caso('El significado de cada parámetro depende del modelo (b del lineal-meseta no es la pendiente en la DE50)', () => {
    const s = SP.metodosNoLineal.sentidoDe;
    SPT.igual(s('ll4', 'b'), 'pendiente en la DE50');
    SPT.igual(s('lineal-meseta', 'b'), 'aumento por unidad de dosis antes de la meseta');
    SPT.igual(s('lineal-meseta', 'x0'), 'dosis óptima (inicio de la meseta)');
    SPT.igual(s('mitscherlich', 'c'), 'tasa de acercamiento a la asíntota');
    SPT.igual(s('ll4', 'c'), 'límite inferior');
    const d = [0, 0, 50, 50, 100, 100, 150, 150, 200, 200], y = [4.1, 4.3, 5.9, 6.1, 7.2, 7.4, 7.3, 7.5, 7.2, 7.4];
    const r = SP.ejecutar('respuesta-meseta', SP.tabla.crear({ d, y }, {}), { respuesta: 'y', dosis: 'd' }, { modelo: 'lineal-meseta' });
    const filas = SP.metodos['respuesta-meseta'].reporte(r.resultado).cuadros.find(c => c.id === 'parametros').filas;
    SPT.igual(filas.find(f => f.par === 'b').sentido, 'aumento por unidad de dosis antes de la meseta');
  });
});

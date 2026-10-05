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

SPT.describir('Regresión no lineal · Fase 4 (hormesis, Michaelis-Menten, perfiles, pesos, precios, AIC)', () => {
  const lechuga = () => SP.tabla.crear({ conc: [0, 0, 0.32, 0.32, 1, 1, 3.2, 3.2, 10, 10, 32, 32, 100, 100],
    peso: [1.126, 0.833, 1.096, 1.106, 1.163, 1.336, 0.985, 0.754, 0.716, 0.683, 0.560, 0.488, 0.375, 0.344] }, {});
  const puro = () => SP.tabla.crear({ conc: [0.02, 0.02, 0.06, 0.06, 0.11, 0.11, 0.22, 0.22, 0.56, 0.56, 1.1, 1.1], vel: [76, 47, 97, 107, 123, 139, 159, 152, 191, 201, 207, 200] }, {});
  const corre = (id, t, e, op) => SP.ejecutar(id, t, e, SP.opcionesCon(SP.metodos[id], op)).resultado;
  SPT.caso('Gradientes de Brain-Cousens y Michaelis-Menten contra diferencias finitas; e ≤ 0 queda fuera del dominio', () => {
    const casos = { bc5: [[0.5, 20], [1.5, 0.28, 0.96, 1.12, 0.99]], bc4: [[0.5, 20], [1.28, 0.97, 0.85, 1.62]], mm2: [[0.05, 1], [212, 0.064]], mm3: [[0.05, 1], [32, 222, 0.1]] };
    for (const [m, [xs, p]] of Object.entries(casos)) for (const x of xs) {
      const g = SP.nolineal.MODELOS[m].f(x, p)[1];
      p.forEach((v, k) => {
        const h = 1e-6 * (Math.abs(v) || 1), mas = p.slice(), menos = p.slice();
        mas[k] += h; menos[k] -= h;
        SPT.cerca(g[k], (SP.nolineal.MODELOS[m].f(x, mas)[0] - SP.nolineal.MODELOS[m].f(x, menos)[0]) / (2 * h), 1e-5, m + ' ∂/∂' + SP.nolineal.MODELOS[m].par[k] + ' en x = ' + x);
      });
    }
    SPT.igual(SP.nolineal.MODELOS.bc5.f(0, [1.5, 0.28, 0.96, 1.12, 0.99])[0], 0.96);
    SPT.afirmar(Number.isNaN(SP.nolineal.MODELOS.ll4.f(5, [1.5, 0.3, 1, -2])[0]), 'll4 con e < 0');
    SPT.afirmar(Number.isNaN(SP.nolineal.MODELOS.bc5.f(5, [1.5, 0.3, 1, -2, 1])[0]), 'Brain-Cousens con e < 0');
  });
  SPT.caso('Residuos grandes: el log-logístico ante hormesis llega al óptimo (antes el pulido de Gauss-Newton lo alejaba)', () => {
    const r = corre('dosis-respuesta', lechuga(), { respuesta: 'peso', dosis: 'conc' }, { modelo: 'll4' });
    SPT.cerca(r.ajuste.rss, 0.20707501687, 1e-9);
    SPT.cerca(r.parametros.estimado[0], 1.3833121467, 1e-6);
    SPT.afirmar(r.ajuste.convergio, 'convergió');
  });
  SPT.caso('Hormesis: dosis y respuesta máximas, DE50 después del máximo y la nota de f', () => {
    const r = corre('dosis-respuesta', lechuga(), { respuesta: 'peso', dosis: 'conc' }, { modelo: 'bc5' });
    const z = Object.fromEntries(r.derivados.map(v => [v.nombre, v.valor]));
    SPT.afirmar(z.dosis_maxima > 0.3 && z.dosis_maxima < 2 && z.DE50 > z.dosis_maxima, JSON.stringify(z));
    const rep = SP.metodos['dosis-respuesta'].reporte(r);
    SPT.afirmar(rep.cuadros.find(c => c.id === 'derivados').notas.some(n => /Hormesis/.test(n)), 'nota de hormesis');
    /* sin estímulo (datos log-logísticos): no hay dosis máxima y la conclusión lo dice */
    const sin = SP.tabla.crear({ d: [0, 0, 1, 1, 3, 3, 10, 10, 30, 30, 100, 100], y: [10, 10.2, 9.8, 9.9, 8.1, 8.3, 4.9, 5.2, 2.1, 2.0, 1.1, 1.0] }, {});
    const r2 = corre('dosis-respuesta', sin, { respuesta: 'y', dosis: 'd' }, { modelo: 'bc5' });
    SPT.afirmar(!r2.derivados.some(v => v.nombre === 'dosis_maxima'), 'sin dosis máxima');
    SPT.afirmar(SP.metodos['dosis-respuesta'].reporte(r2).conclusiones.some(c => /No hay estímulo/.test(c)), 'conclusión sin estímulo');
  });
  SPT.caso('Dosis económica: la pendiente iguala la razón de precios; recortada a 0 si el insumo es caro', () => {
    const r = corre('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'mm2', precioProducto: 10, precioInsumo: 200 });
    const x = r.derivados.find(z => z.nombre === 'dosis_economica');
    SPT.cerca(SP.nolineal.pendiente('mm2', x.valor, r.parametros.estimado), 20, 1e-9);
    const caro = corre('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'mm2', precioProducto: 1, precioInsumo: 1e6 });
    const z = caro.derivados.find(v => v.nombre === 'dosis_economica');
    SPT.afirmar(z.recortada && z.valor === 0 && Number.isNaN(z.ee), 'recortada');
    SPT.afirmar(SP.metodos['respuesta-meseta'].reporte(caro).conclusiones.some(c => /no se paga/.test(c)), 'conclusión');
    SPT.afirmar(/no conviene aplicar/.test(SP.informe.parrafo('respuesta-meseta', caro, SP.metodos['respuesta-meseta'].reporte(caro), { respuesta: 'vel', dosis: 'conc' }, {}).resultados), 'párrafo');
    SPT.lanza(() => SP.ejecutar('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'mm2', precioProducto: 10 }), 'dos precios');
  });
  SPT.caso('Intervalos perfilados: asimétricos; un límite faltante se muestra como —; lineal-meseta queda con Wald', () => {
    const r = corre('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'mm2', intervalo: 'perfil' });
    SPT.igual(r.intervalo, 'perfil');
    const P = r.parametros;
    SPT.afirmar(P.ic_inf[0] < P.estimado[0] && P.ic_sup[0] > P.estimado[0] && P.ic_sup[1] - P.estimado[1] > P.estimado[1] - P.ic_inf[1], 'asimétrico en e');
    SPT.igual(SP.formatos.texto([NaN, 5.25], 'intervaloSig'), '— – 5.250');
    SPT.igual(SP.formatos.texto([NaN, NaN], 'intervaloSig'), '—');
    const lm = corre('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'lineal-meseta', intervalo: 'perfil' });
    SPT.igual(lm.intervalo, 'wald');
  });
  SPT.caso('Pesos: filas con peso cero fuera, pesos negativos con error; el código R lleva weights', () => {
    const t = SP.tabla.crear({ conc: [0.02, 0.02, 0.06, 0.06, 0.11, 0.11, 0.22, 0.22, 0.56, 0.56, 1.1, 1.1], vel: [76, 47, 97, 107, 123, 139, 159, 152, 191, 201, 207, 200], w: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 0, 2] }, {});
    const e = { respuesta: 'vel', dosis: 'conc', pesos: 'w' }, r = corre('respuesta-meseta', t, e, { modelo: 'mm2' });
    SPT.igual(r.n, 11); SPT.afirmar(r.ajuste.ponderado, 'ponderado');
    const cod = SP.metodos['respuesta-meseta'].codigoR(e, SP.opcionesCon(SP.metodos['respuesta-meseta'], { modelo: 'mm2' }), { resultado: r });
    SPT.afirmar(cod.includes('weights = w') && cod.includes('d$w > 0'), cod);
    const neg = SP.tabla.crear({ conc: [0.02, 0.06, 0.11, 0.22, 0.56, 1.1], vel: [76, 97, 123, 159, 191, 207], w: [1, 1, -1, 1, 1, 1] }, {});
    SPT.lanza(() => SP.ejecutar('respuesta-meseta', neg, { respuesta: 'vel', dosis: 'conc', pesos: 'w' }, { modelo: 'mm2' }), 'negativos');
    SPT.lanza(() => SP.ejecutar('respuesta-meseta', neg, { respuesta: 'vel', dosis: 'conc', pesos: 'vel' }, { modelo: 'mm2' }), 'un solo papel');
  });
  SPT.caso('Elección por AIC: todos los modelos de la familia, el cuadro con ΔAIC y pesos, y el párrafo', () => {
    const r = corre('respuesta-meseta', puro(), { respuesta: 'vel', dosis: 'conc' }, { modelo: 'auto' });
    SPT.igual(r.seleccion.length, 5);
    const ok = r.seleccion.filter(z => z.peso !== undefined);
    SPT.cerca(ok.reduce((s, z) => s + z.peso, 0), 1, 1e-12);
    SPT.igual(r.seleccion.find(z => z.delta === 0).modelo, r.modelo);
    const rep = SP.metodos['respuesta-meseta'].reporte(r);
    SPT.igual(rep.cuadros[0].id, 'modelos');
    SPT.afirmar(/menor AIC/.test(rep.conclusiones[0]), rep.conclusiones[0]);
    const p = SP.informe.parrafo('respuesta-meseta', r, rep, { respuesta: 'vel', dosis: 'conc' }, {});
    SPT.afirmar(/Akaike, 1974/.test(p.metodos) && /Michaelis y Menten, 1913/.test(p.metodos), p.metodos);
  });
  SPT.caso('Lineal-meseta con grupos: cada parámetro común por perfil exacto (x0 común o por grupo)', () => {
    const N = [], g = [], y = [];
    for (const h of ['A', 'B']) for (const d of [0, 40, 80, 120, 160, 200]) for (let k = 0; k < 2; k++) {
      N.push(d); g.push(h); y.push((h === 'A' ? 4 + 0.03 * Math.min(d, 120) : 4 + 0.03 * Math.min(d, 160)) + (k ? 0.05 : -0.05));
    }
    const r = corre('respuesta-meseta', SP.tabla.crear({ N, g, y }, { g: { tipo: 'factor' } }), { respuesta: 'y', dosis: 'N', grupo: 'g' }, { modelo: 'lineal-meseta' });
    SPT.igualJSON(r.comparacion.parametros.map(z => z.parametro), ['a', 'b', 'x0']);
    SPT.afirmar(r.comparacion.parametros[2].p < 0.001 && r.comparacion.parametros[0].p > 0.5, 'x0 difiere; a no');
    /* el patrón todo común es el perfil de una sola curva */
    const x = N.slice(0, 12), yy = y.slice(0, 12), th = SP.nolineal.mesetaPorPatron(x, yy, null, new Int32Array(12), 1, [false, false, false]);
    SPT.igualJSON(th.map(v => +v.toFixed(8)), SP.nolineal.perfilMeseta(x, yy).map(v => +v.toFixed(8)));
  });
});

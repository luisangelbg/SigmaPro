/* Pruebas del GLM del núcleo (js/nucleo/glm.js) y de sus métodos (js/metodos/generalizados.js). Los números contra R
   están en tests/casos/generalizados; aquí van las funciones especiales, los enlaces, la columna colineal, la familia
   automática, los mensajes de error, el reporte, el código R y el párrafo. */
SPT.describir('GLM · funciones especiales y enlaces', () => {
  SPT.caso('digamma y trigamma en valores conocidos', () => {
    const g = 0.5772156649015329;
    SPT.cerca(SP.glm.digamma(1), -g, 1e-14);
    SPT.cerca(SP.glm.digamma(0.5), -g - 2 * Math.log(2), 1e-14);
    SPT.cerca(SP.glm.digamma(100), 4.600161852738087, 1e-14);
    SPT.cerca(SP.glm.trigamma(1), Math.PI ** 2 / 6, 1e-14);
    SPT.cerca(SP.glm.trigamma(0.5), Math.PI ** 2 / 2, 1e-14);
  });
  SPT.caso('Cada enlace y su inversa; los límites de R en logit y probit', () => {
    const E = SP.glm.ENLACES;
    for (const [k, mu] of [['logit', 0.3], ['probit', 0.8], ['cloglog', 0.25], ['log', 7.5], ['inverso', 0.4], ['identidad', 3]]) SPT.cerca(E[k].inv(E[k].fun(mu)), mu, 1e-13, k);
    SPT.cerca(E.logit.inv(40), 1 / (1 + 2.220446049250313e-16), 1e-15, 'logit más allá de 30');
    SPT.igual(E.logit.deta(-31), 2.220446049250313e-16);
    SPT.afirmar(E.probit.inv(-50) > 0, 'probit nunca da 0');
    SPT.afirmar(!E.inverso.valido(0), 'η = 0 no vale con el enlace inverso');
  });
});

SPT.describir('GLM · ajuste', () => {
  /* conteos de seis tratamientos con 4 repeticiones, sin sobredispersión */
  function conteos(sobre) {
    let s = 9;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const pois = l => { let k = 0, p = Math.exp(-l), f = p, u = az(); while (u > f) { k++; p *= l / k; f += p; } return k; };
    const c = { y: [], t: [], b: [] };
    for (let b = 1; b <= 4; b++) for (let t = 0; t < 6; t++) { const l = [5, 8, 12, 6, 15, 9][t] * (sobre ? Math.exp(1.2 * (az() - 0.5)) : 1); c.y.push(pois(l)); c.t.push('T' + t); c.b.push('B' + b); }
    return SP.tabla.crear(c, { t: { tipo: 'factor' }, b: { tipo: 'factor' } });
  }
  SPT.caso('Columna colineal: su coeficiente queda sin estimar y se avisa', () => {
    const t = conteos(false), c = { y: [], t: [], t2: [] };
    for (let i = 0; i < t.n; i++) { c.y.push(t.col('y').valores[i]); const k = t.col('t').niveles[t.col('t').codigos[i]]; c.t.push(k); c.t2.push(k); }
    const t2 = SP.tabla.crear(c, { t: { tipo: 'factor' }, t2: { tipo: 'factor' } });
    const r = SP.ejecutar('glm', t2, { respuesta: 'y' }, { derecha: 't + t2', familia: 'poisson' }).resultado;
    SPT.afirmar(r.coeficientes.estimado.filter(Number.isNaN).length === 5, 'cinco coeficientes de t2 sin estimar');
    SPT.afirmar(r.avisos.some(x => /sin estimar/.test(x)), 'aviso');
  });
  SPT.caso('La familia automática se queda en Poisson sin sobredispersión y pasa a binomial negativa con ella', () => {
    const r1 = SP.ejecutar('glm-conteos', conteos(false), { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, { familia: 'auto' }).resultado;
    SPT.igual(r1.familia, 'poisson');
    SPT.afirmar(r1.auto.p >= 0.05, 'sin sobredispersión');
    const r2 = SP.ejecutar('glm-conteos', conteos(true), { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, { familia: 'auto' }).resultado;
    SPT.igual(r2.familia, 'binomial-negativa');
    SPT.afirmar(r2.theta > 0 && r2.ee_theta > 0, 'θ con su EE');
    /* en el óptimo, el gradiente de θ es cero */
    const o = { y: Float64Array.from(r2.valores.observados), mu: Float64Array.from(r2.valores.ajustados) }, w = new Float64Array(o.y.length).fill(1);
    SPT.cerca(SP.glm.thetaML(o.y, o.mu, w, r2.theta), r2.theta, 1e-10, 'θ es punto fijo');
  });
  SPT.caso('Mensajes de error: respuesta no válida para la familia, enlace, ensayos y papeles', () => {
    const t = SP.tabla.crear({ y: [0, 1, 2, 1, 0, 1], g: ['a', 'a', 'b', 'b', 'c', 'c'], n: [3, 3, 3, 3, 3, 3], z: [1, 0, 2, 3, 1, 1] }, { g: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('glm-proporciones', t, { respuesta: 'y', tratamientos: ['g'] }, { familia: 'binomial' }), '0 o 1');
    SPT.lanza(() => SP.ejecutar('glm-gamma', t, { respuesta: 'z', tratamientos: ['g'] }, { familia: 'gamma', enlace: 'log' }), 'valores positivos');
    SPT.lanza(() => SP.ejecutar('glm', t, { respuesta: 'y' }, { derecha: 'g', familia: 'poisson', enlace: 'logit' }), 'no es de la familia');
    SPT.lanza(() => SP.ejecutar('glm', t, { respuesta: 'y', ensayos: 'n' }, { derecha: 'g', familia: 'poisson' }), 'ensayos solo se usa');
    SPT.lanza(() => SP.ejecutar('glm-conteos', t, { respuesta: 'y', tratamientos: ['g'], bloque: 'g' }, {}), 'dos papeles');
    SPT.lanza(() => SP.ejecutar('glm-conteos', t, { respuesta: 'y', tratamientos: ['g'] }, { familia: 'gamma' }), 'no válida');
    const ok = SP.ejecutar('glm-proporciones', t, { respuesta: 'y', ensayos: 'n', tratamientos: ['g'] }, { familia: 'binomial' }).resultado;
    SPT.afirmar(ok.medias[0].filas.every(f => f.respuesta > 0 && f.respuesta < 1), 'probabilidades');
  });
});

SPT.describir('GLM · reporte, código R y párrafo', () => {
  SPT.caso('Proporciones con ensayos: cuadros, razón de momios, código R y citas', () => {
    let s = 4;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { g: [], n: [], t: [], b: [] };
    for (let b = 1; b <= 3; b++) for (let t = 0; t < 4; t++) { let k = 0; for (let i = 0; i < 40; i++) if (az() < [0.3, 0.45, 0.6, 0.5][t]) k++; c.g.push(k); c.n.push(40); c.t.push('T' + t); c.b.push('B' + b); }
    const tabla = SP.tabla.crear(c, { t: { tipo: 'factor' }, b: { tipo: 'factor' } }), f = SP.metodos['glm-proporciones'];
    const e = { respuesta: 'g', ensayos: 'n', tratamientos: ['t'], bloque: 'b' }, op = SP.opcionesCon(f, { familia: 'binomial' });
    const r = SP.ejecutar('glm-proporciones', tabla, e, op).resultado, rep = f.reporte(r);
    SPT.igualJSON(rep.cuadros.map(q => q.id), ['devianza', 'coeficientes', 'medias-t', 'pares-t', 'ajuste']);
    SPT.afirmar(rep.cuadros[1].columnas.some(x => x.titulo === 'Razón de momios'), 'razón de momios');
    SPT.cerca(r.razones.razon[1], Math.exp(r.coeficientes.estimado[1]), 1e-15);
    const cod = f.codigoR(e, op, { resultado: r });
    SPT.afirmar(cod.includes('glm(cbind(g, n - g) ~ b + t, family = binomial(link = "logit")'), cod);
    SPT.afirmar(cod.includes('datos$b <- factor(datos$b)') && cod.includes('emmeans::emmeans(m, "t"'), 'factores y medias');
    const p = SP.informe.parrafo('glm-proporciones', r, rep, e, op);
    SPT.afirmar(/Nelder y Wedderburn, 1972/.test(p.metodos) && /Lenth, 2016/.test(p.metodos), p.metodos);
  });
});

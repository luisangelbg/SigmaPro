/* Pruebas de los modelos ARIMA (js/nucleo/arima.js y js/metodos/arima.js): la transformación de los AR y su inversa,
   el polinomio de la diferenciación, la inversión de un MA, la covarianza estacionaria de un AR(1), la verosimilitud
   exacta de un AR(1) contra su fórmula cerrada, el pronóstico de un AR(1), los mensajes de error, el reporte, el código
   R y el párrafo. Los números contra R están en tests/casos/arima. */
SPT.describir('ARIMA · núcleo', () => {
  SPT.caso('La transformación de los AR va y vuelve, y deja los AR en la región estacionaria', () => {
    const A = SP.arima, raw = [0.8, -1.3, 2.1], phi = A.partrans(raw);
    A.invpartrans(phi).forEach((v, i) => SPT.cerca(v, raw[i], 1e-12));
    SPT.afirmar(A.arEstacionario(phi), 'AR estacionario');
    SPT.afirmar(!A.arEstacionario([1.2]) && A.arEstacionario([0.5, 0.3]), 'raíces fuera y dentro del círculo');
  });
  SPT.caso('Diferenciación (1 − B)(1 − B⁴) y la inversión de un MA', () => {
    const A = SP.arima;
    SPT.igualJSON(A.deltaDe(1, 1, 4), [1, 0, 0, 1, -1]);
    SPT.igualJSON(A.deltaDe(2, 0, 1), [2, -1]);
    SPT.cerca(A.maInvert([2])[0], 0.5, 1e-15);
    const m = A.maInvert([2.5, 1]);   // 1 + 2.5z + z² = (1 + 0.5z)(1 + 2z): la raíz −0.5 se refleja a −2 → (1 + 0.5z)²
    SPT.cerca(m[0], 1, 1e-10); SPT.cerca(m[1], 0.25, 1e-10);
  });
  SPT.caso('AR(1): la covarianza estacionaria, la verosimilitud exacta y el pronóstico', () => {
    const A = SP.arima, phi = 0.6, x = [0.3, -0.5, 1.1, 0.4, -0.2, 0.8, 0.1, -0.7];
    SPT.cerca(A.modelo([phi], [], []).Pn[0][0], 1 / (1 - phi * phi), 1e-14);
    const k = A.kalman(x, A.modelo([phi], [], []), false);
    /* fórmula cerrada: S = (1 − φ²)x₁² + Σ (x_t − φx_{t−1})², Σ log F = −log(1 − φ²) */
    let S = (1 - phi * phi) * x[0] * x[0];
    for (let t = 1; t < x.length; t++) S += (x[t] - phi * x[t - 1]) ** 2;
    SPT.cerca(k.ssq, S, 1e-12); SPT.cerca(k.sumlog, -Math.log(1 - phi * phi), 1e-12); SPT.igual(k.nu, x.length);
    const aj = A.ajustar(x.map(v => v + 10).concat([10.5, 9.4, 11.2, 10.1, 9.8, 10.6, 9.9, 10.3]), { p: 1, d: 0, q: 0, P: 0, D: 0, Q: 0, s: 1, media: true });
    const f = A.predecir(aj, 3), m = aj.coef[1], ph = aj.coef[0], xn = 10.3;
    SPT.cerca(f.media[0], m + ph * (xn - m), 1e-10);
    SPT.cerca(f.media[2], m + ph ** 3 * (xn - m), 1e-10);
    SPT.cerca(f.ee[0], Math.sqrt(aj.sigma2), 1e-10);
  });
});

SPT.describir('ARIMA · métodos', () => {
  const tabla = () => { const y = [], t = []; let v = 0; for (let i = 0; i < 60; i++) { v = 0.6 * v + Math.sin(i * 1.7) + 0.3 * Math.cos(i * 0.4); y.push(20 + v); t.push(i + 1); } return SP.tabla.crear({ t, y }, {}); };
  SPT.caso('Reporte, código R y párrafo; la búsqueda por AIC elige el menor', () => {
    const t = tabla();
    for (const [op0, fn] of [[{ p: 1, q: 1 }, 'predict'], [{ buscar: true, horizonte: 4 }, 'ARIMA_undoPars']]) {
      const f = SP.metodos.arima, op = SP.opcionesCon(f, op0), e = { respuesta: 'y', tiempo: 't' }, r = SP.ejecutar('arima', t, e, op).resultado, rep = f.reporte(r);
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length && !/undefined|NaN|\{[a-zA-Z]+\}/.test(rep.conclusiones.join(' ')), rep.conclusiones.join(' '));
      SPT.afirmar(f.codigoR(e, op, { resultado: r }).includes(fn), fn);
      const p = SP.informe.parrafo('arima', r, rep, e, op);
      SPT.afirmar(/Gardner et al\., 1980/.test(p.metodos) && p.resultados && !/undefined|NaN/.test(p.metodos + p.resultados), p.metodos + ' ' + p.resultados);
      if (r.busqueda) SPT.cerca(Math.min(...r.busqueda.aic.filter(Number.isFinite)), r.aic, 1e-6);   // la búsqueda usa el modo rápido (solo el AIC)
    }
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla(), op = x => SP.opcionesCon(SP.metodos.arima, x);
    SPT.lanza(() => SP.ejecutar('arima', t, { respuesta: 'y', tiempo: 't' }, op({ P: 1 })), 'periodo');
    SPT.lanza(() => SP.ejecutar('arima', SP.tabla.crear({ y: [1, 2, 3, 4, 5] }, {}), { respuesta: 'y' }, op({})), 'al menos 8');
    SPT.lanza(() => SP.ejecutar('arima', SP.tabla.crear({ t: [1, 1, 2, 3, 4, 5, 6, 7, 8], y: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, {}), { respuesta: 'y', tiempo: 't' }, op({})), 'repite');
  });
});

/* Pruebas de js/nucleo/dist.js con identidades matemáticas, independientes de R.
   La comparación contra R está en tests/casos/dist-*. */
SPT.describir('Núcleo · distribuciones (identidades)', () => {
  const D = SP.dist;
  const relativo = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

  SPT.caso('la normal de Cody coincide con la serie y la fracción continua (constantes correctas)', () => {
    let peor = 0;
    for (let i = -5000; i <= 5000; i++) {
      const z = i * 0.0074;               // −37 … 37
      const a = D.pnorm(z), b = D._interno.pnormSerie(z);
      if (b > 1e-300) peor = Math.max(peor, relativo(a, b));
    }
    SPT.afirmar(peor < 1e-12, 'diferencia relativa máxima ' + peor);
  });

  SPT.caso('normal: simetría, valores conocidos e inversa', () => {
    SPT.igual(D.pnorm(0), 0.5);
    SPT.cerca(D.pnorm(1.96) + D.pnorm(-1.96), 1, 1e-15);
    SPT.cerca(D.pnorm(-1.96, 0, 1, false), D.pnorm(1.96), 1e-15);
    SPT.cerca(D.qnorm(0.975), 1.959963984540054, 1e-14);
    for (const z of [-30, -8, -2, -0.3, 0, 0.7]) SPT.cerca(D.qnorm(D.pnorm(z)), z, 1e-12, 'qnorm(pnorm(' + z + '))');
    /* del lado derecho se usa la cola superior: pnorm(9) = 1 − 1e-19 ya es 1 en doble precisión */
    for (const z of [3, 9, 30]) SPT.cerca(D.qnorm(D.pnorm(z, 0, 1, false), 0, 1, false), z, 1e-12, 'cola superior ' + z);
    SPT.cerca(D.qnorm(1e-300), -37.0470962993612, 1e-13);
  });

  SPT.caso('log Γ en enteros y semienteros', () => {
    let f = 1;
    for (let n = 1; n <= 20; n++) { SPT.cerca(D.lgamma(n + 1), Math.log(f *= n), 1e-14, 'log ' + (n) + '!'); }
    SPT.cerca(D.lgamma(0.5), 0.5 * Math.log(Math.PI), 1e-15);
    SPT.cerca(D.lgamma(1), 0, 1e-15);
  });

  SPT.caso('F con 1 gl en el numerador = t al cuadrado', () => {
    for (const gl of [1, 3, 12, 140, 5e5]) for (const t of [0.3, 1.7, 4, 25]) {
      SPT.cerca(D.pf(t * t, 1, gl, false), 2 * D.pt(t, gl, false), 1e-12, `gl ${gl}, t ${t}`);
    }
  });

  SPT.caso('ji cuadrada con 2 gl es exponencial; con 1 gl es la normal al cuadrado', () => {
    for (const x of [0.01, 1, 7, 90, 700]) SPT.cerca(D.pchisq(x, 2, false), Math.exp(-x / 2), 1e-13, 'x ' + x);
    for (const z of [0.2, 1.5, 6, 20]) SPT.cerca(D.pchisq(z * z, 1, false) / (2 * D.pnorm(-z)), 1, 1e-12, 'z ' + z);
  });

  SPT.caso('t con 1 gl es Cauchy; t con infinitos gl es normal', () => {
    for (const t of [-50, -1, 0.4, 3, 1e6]) SPT.cerca(D.pt(t, 1), 0.5 + Math.atan(t) / Math.PI, 1e-13, 't ' + t);
    SPT.igual(D.pt(1.3, Infinity), D.pnorm(1.3));
  });

  SPT.caso('beta: simetría I_x(a,b) = 1 − I_{1−x}(b,a) y beta(1,1) uniforme', () => {
    for (const [x, a, b] of [[0.2, 2, 5], [0.7, 0.5, 0.5], [0.01, 30, 2], [0.5, 1e3, 1e3]]) {
      SPT.cerca(D.pbeta(x, a, b), D.pbeta(1 - x, b, a, false), 1e-13, `x ${x}, a ${a}, b ${b}`);
    }
    for (const x of [0.1, 0.37, 0.9]) SPT.cerca(D.pbeta(x, 1, 1), x, 1e-15);
  });

  SPT.caso('discretas: sumas acumuladas de la masa', () => {
    let s = 0;
    for (let k = 0; k <= 12; k++) { s += D.dbinom(k, 30, 0.3); SPT.cerca(D.pbinom(k, 30, 0.3), s, 1e-13, 'binomial k ' + k); }
    s = 0;
    for (let k = 0; k <= 15; k++) { s += D.dpois(k, 6.5); SPT.cerca(D.ppois(k, 6.5), s, 1e-13, 'Poisson k ' + k); }
  });

  SPT.caso('rango estudentizado con 2 medias = √2 · |t|', () => {
    for (const gl of [3, 10, 33, 200, Infinity]) for (const q of [0.5, 2, 3.5, 6]) {
      const desdeT = 1 - 2 * D.pt(q / Math.SQRT2, gl, false);
      SPT.cerca(D.ptukey(q, 2, gl), desdeT, 1e-9, `gl ${gl}, q ${q}`);
    }
  });

  SPT.caso('los cuantiles invierten a las distribuciones en ambas colas', () => {
    for (const p of [1e-12, 0.01, 0.4, 0.95]) {
      SPT.cerca(D.pt(D.qt(p, 7), 7), p, 1e-12, 'qt');
      SPT.cerca(D.pt(D.qt(p, 7, false), 7, false), p, 1e-12, 'qt superior');
      SPT.cerca(D.pf(D.qf(p, 4, 20), 4, 20), p, 1e-12, 'qf');
      SPT.cerca(D.pchisq(D.qchisq(p, 9, false), 9, false), p, 1e-12, 'qchisq superior');
      SPT.cerca(D.pbeta(D.qbeta(p, 2.5, 0.8), 2.5, 0.8), p, 1e-12, 'qbeta');
    }
    SPT.cerca(D.ptukey(D.qtukey(0.95, 4, 20), 4, 20), 0.95, 1e-12, 'qtukey');
  });

  SPT.caso('argumentos fuera de dominio dan NaN; extremos dan 0 o 1', () => {
    SPT.igual(D.pt(1, -2), NaN); SPT.igual(D.qnorm(1.2), NaN); SPT.igual(D.ptukey(2, 1, 10), NaN);
    SPT.igual(D.pf(-1, 2, 3), 0); SPT.igual(D.pchisq(Infinity, 3), 1); SPT.igual(D.qt(1, 4), Infinity);
  });
});

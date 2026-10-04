/* SigmaPro — el Reporte LABG: el párrafo de métodos y el de resultados de cada análisis, las referencias de cada método
   y el documento completo (portada, métodos, resultados con cuadros y figuras numerados, referencias y anexos).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Módulo puro (sin DOM): recibe los resultados ya calculados y su reporte(); se prueba en node con todos los métodos.
   Los párrafos describen lo que se hizo y lo que salió, con la estadística como la piden las revistas
   (F(2, 33) = 60.63; p < 0.001), y no interpretan más allá de la significancia: el texto es un punto de partida para la
   tesis o el artículo, que la persona revisa y ajusta.

     SP.informe.parrafo(id, r, rep, e, op) → { metodos, resultados, citas: [clave] }
     SP.informe.software(items?)            → { texto, citas } (con items: menciona el motor R si alguno lo usó)
     SP.informe.referencia(clave)            → texto de la referencia (estilo autor-año)
     SP.informe.bloques(items, opciones)     → bloques del documento (los que entiende SP.docx y SP.informe.html)
     SP.informe.html(bloques, opciones)      → página HTML completa, con su hoja de estilo e imprimible */
SP.definir('informe', function (SP) {
  'use strict';
  const T = SP.T;
  const F = SP.formatos;

  /* ---------------- referencias ---------------- */
  const REF = {
    sigmapro: () => T('Barrera-Guzmán, L. A. (2026). SigmaPro: estadística para la investigación agronómica y biológica (versión {v}) [Programa de cómputo]. LABG Suite.', { v: SP.VERSION }),
    rcore: () => 'R Core Team (2024). R: A language and environment for statistical computing. R Foundation for Statistical Computing, Viena, Austria. https://www.R-project.org/',
    gomez1984: () => 'Gomez, K. A. y Gomez, A. A. (1984). Statistical procedures for agricultural research (2.ª ed.). John Wiley & Sons.',
    yates1936b: () => 'Yates, F. (1936). Incomplete randomized blocks. Annals of Eugenics, 7(2), 121–140.',
    yates1936l: () => 'Yates, F. (1936). A new method of arranging variety trials involving a large number of varieties. Journal of Agricultural Science, 26(3), 424–455.',
    patterson1976: () => 'Patterson, H. D. y Williams, E. R. (1976). A new class of resolvable incomplete block designs. Biometrika, 63(1), 83–92.',
    satterthwaite1946: () => 'Satterthwaite, F. E. (1946). An approximate distribution of estimates of variance components. Biometrics Bulletin, 2(6), 110–114.',
    searle1980: () => 'Searle, S. R., Speed, F. M. y Milliken, G. A. (1980). Population marginal means in the linear model: an alternative to least squares means. The American Statistician, 34(4), 216–221.',
    tukey1949: () => 'Tukey, J. W. (1949). Comparing individual means in the analysis of variance. Biometrics, 5(2), 99–114.',
    tukey1949na: () => 'Tukey, J. W. (1949). One degree of freedom for non-additivity. Biometrics, 5(3), 232–242.',
    duncan1955: () => 'Duncan, D. B. (1955). Multiple range and multiple F tests. Biometrics, 11(1), 1–42.',
    scheffe1953: () => 'Scheffé, H. (1953). A method for judging all contrasts in the analysis of variance. Biometrika, 40(1/2), 87–110.',
    sidak1967: () => 'Šidák, Z. (1967). Rectangular confidence regions for the means of multivariate normal distributions. Journal of the American Statistical Association, 62(318), 626–633.',
    holm1979: () => 'Holm, S. (1979). A simple sequentially rejective multiple test procedure. Scandinavian Journal of Statistics, 6(2), 65–70.',
    dunnett1955: () => 'Dunnett, C. W. (1955). A multiple comparison procedure for comparing several treatments with a control. Journal of the American Statistical Association, 50(272), 1096–1121.',
    games1976: () => 'Games, P. A. y Howell, J. F. (1976). Pairwise multiple comparison procedures with unequal n\'s and/or variances: a Monte Carlo study. Journal of Educational Statistics, 1(2), 113–125.',
    benjamini1995: () => 'Benjamini, Y. y Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B, 57(1), 289–300.',
    shapiro1965: () => 'Shapiro, S. S. y Wilk, M. B. (1965). An analysis of variance test for normality (complete samples). Biometrika, 52(3/4), 591–611.',
    levene1960: () => 'Levene, H. (1960). Robust tests for equality of variances. En I. Olkin (Ed.), Contributions to probability and statistics (pp. 278–292). Stanford University Press.',
    brown1974: () => 'Brown, M. B. y Forsythe, A. B. (1974). Robust tests for the equality of variances. Journal of the American Statistical Association, 69(346), 364–367.',
    durbin1950: () => 'Durbin, J. y Watson, G. S. (1950). Testing for serial correlation in least squares regression. I. Biometrika, 37(3/4), 409–428.',
    cook1977: () => 'Cook, R. D. (1977). Detection of influential observation in linear regression. Technometrics, 19(1), 15–18.',
    student1908: () => 'Student (1908). The probable error of a mean. Biometrika, 6(1), 1–25.',
    welch1947: () => 'Welch, B. L. (1947). The generalization of "Student\'s" problem when several different population variances are involved. Biometrika, 34(1/2), 28–35.',
    hedges1981: () => 'Hedges, L. V. (1981). Distribution theory for Glass\'s estimator of effect size and related estimators. Journal of Educational Statistics, 6(2), 107–128.',
    wilcoxon1945: () => 'Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80–83.',
    mann1947: () => 'Mann, H. B. y Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. The Annals of Mathematical Statistics, 18(1), 50–60.',
    hodges1963: () => 'Hodges, J. L. y Lehmann, E. L. (1963). Estimates of location based on rank tests. The Annals of Mathematical Statistics, 34(2), 598–611.',
    kruskal1952: () => 'Kruskal, W. H. y Wallis, W. A. (1952). Use of ranks in one-criterion variance analysis. Journal of the American Statistical Association, 47(260), 583–621.',
    friedman1937: () => 'Friedman, M. (1937). The use of ranks to avoid the assumption of normality implicit in the analysis of variance. Journal of the American Statistical Association, 32(200), 675–701.',
    kendall1939: () => 'Kendall, M. G. y Babington Smith, B. (1939). The problem of m rankings. The Annals of Mathematical Statistics, 10(3), 275–287.',
    dunn1964: () => 'Dunn, O. J. (1964). Multiple comparisons using rank sums. Technometrics, 6(3), 241–252.',
    conover1979: () => 'Conover, W. J. e Iman, R. L. (1979). On multiple-comparisons procedures (Informe técnico LA-7677-MS). Los Alamos Scientific Laboratory.',
    nemenyi1963: () => 'Nemenyi, P. (1963). Distribution-free multiple comparisons [Tesis doctoral]. Princeton University.',
    cochran1957: () => 'Cochran, W. G. (1957). Analysis of covariance: its nature and uses. Biometrics, 13(3), 261–281.',
    koenker1981: () => 'Koenker, R. (1981). A note on studentizing a test for heteroscedasticity. Journal of Econometrics, 17(1), 107–112.',
    ramsey1969: () => 'Ramsey, J. B. (1969). Tests for specification errors in classical linear least-squares regression analysis. Journal of the Royal Statistical Society B, 31(2), 350–371.',
    akaike1974: () => 'Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control, 19(6), 716–723.',
    mallows1973: () => 'Mallows, C. L. (1973). Some comments on CP. Technometrics, 15(4), 661–675.',
    schwarz1978: () => 'Schwarz, G. (1978). Estimating the dimension of a model. The Annals of Statistics, 6(2), 461–464.',
    pearson1895: () => 'Pearson, K. (1895). Notes on regression and inheritance in the case of two parents. Proceedings of the Royal Society of London, 58, 240–242.',
    spearman1904: () => 'Spearman, C. (1904). The proof and measurement of association between two things. The American Journal of Psychology, 15(1), 72–101.',
    kendall1938: () => 'Kendall, M. G. (1938). A new measure of rank correlation. Biometrika, 30(1/2), 81–93.',
    pearson1900: () => 'Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. Philosophical Magazine, 50(302), 157–175.',
    yates1934: () => 'Yates, F. (1934). Contingency tables involving small numbers and the χ² test. Supplement to the Journal of the Royal Statistical Society, 1(2), 217–235.',
    fisher1922: () => 'Fisher, R. A. (1922). On the interpretation of χ² from contingency tables, and the calculation of P. Journal of the Royal Statistical Society, 85(1), 87–94.',
    cramer1946: () => 'Cramér, H. (1946). Mathematical methods of statistics. Princeton University Press.',
    mcnemar1947: () => 'McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. Psychometrika, 12(2), 153–157.',
    bowker1948: () => 'Bowker, A. H. (1948). A test for symmetry in contingency tables. Journal of the American Statistical Association, 43(244), 572–574.',
    mantel1959: () => 'Mantel, N. y Haenszel, W. (1959). Statistical aspects of the analysis of data from retrospective studies of disease. Journal of the National Cancer Institute, 22(4), 719–748.',
    breslow1980: () => 'Breslow, N. E. y Day, N. E. (1980). Statistical methods in cancer research. Volume I: The analysis of case-control studies. International Agency for Research on Cancer.',
    tarone1985: () => 'Tarone, R. E. (1985). On heterogeneity tests based on efficient scores. Biometrika, 72(1), 91–95.',
    cohen1960: () => 'Cohen, J. (1960). A coefficient of agreement for nominal scales. Educational and Psychological Measurement, 20(1), 37–46.',
    cohen1968: () => 'Cohen, J. (1968). Weighted kappa: nominal scale agreement with provision for scaled disagreement or partial credit. Psychological Bulletin, 70(4), 213–220.',
    wilson1927: () => 'Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158), 209–212.',
    clopper1934: () => 'Clopper, C. J. y Pearson, E. S. (1934). The use of confidence or fiducial limits illustrated in the case of the binomial. Biometrika, 26(4), 404–413.',
    agresti1998: () => 'Agresti, A. y Coull, B. A. (1998). Approximate is better than "exact" for interval estimation of binomial proportions. The American Statistician, 52(2), 119–126.',
    brown2001: () => 'Brown, L. D., Cai, T. T. y DasGupta, A. (2001). Interval estimation for a binomial proportion. Statistical Science, 16(2), 101–133.',
    bates2015: () => 'Bates, D., Mächler, M., Bolker, B. y Walker, S. (2015). Fitting linear mixed-effects models using lme4. Journal of Statistical Software, 67(1), 1–48.',
    kuznetsova2017: () => 'Kuznetsova, A., Brockhoff, P. B. y Christensen, R. H. B. (2017). lmerTest package: tests in linear mixed effects models. Journal of Statistical Software, 82(13), 1–26.',
    kenward1997: () => 'Kenward, M. G. y Roger, J. H. (1997). Small sample inference for fixed effects from restricted maximum likelihood. Biometrics, 53(3), 983–997.',
    pinheiro2000: () => 'Pinheiro, J. C. y Bates, D. M. (2000). Mixed-effects models in S and S-PLUS. Springer.',
    wolfinger1993: () => 'Wolfinger, R. D. (1993). Covariance structure selection in general mixed models. Communications in Statistics – Simulation and Computation, 22(4), 1079–1106.',
    halekoh2014: () => 'Halekoh, U. y Højsgaard, S. (2014). A Kenward-Roger approximation and parametric bootstrap methods for tests in linear mixed models – the R package pbkrtest. Journal of Statistical Software, 59(9), 1–32.',
    patterson1971: () => 'Patterson, H. D. y Thompson, R. (1971). Recovery of inter-block information when block sizes are unequal. Biometrika, 58(3), 545–554.',
    henderson1975: () => 'Henderson, C. R. (1975). Best linear unbiased estimation and prediction under a selection model. Biometrics, 31(2), 423–447.',
    gilmour1995: () => 'Gilmour, A. R., Thompson, R. y Cullis, B. R. (1995). Average information REML: an efficient algorithm for variance parameter estimation in linear mixed models. Biometrics, 51(4), 1440–1450.',
    self1987: () => 'Self, S. G. y Liang, K.-Y. (1987). Asymptotic properties of maximum likelihood estimators and likelihood ratio tests under nonstandard conditions. Journal of the American Statistical Association, 82(398), 605–610.',
    holland2003: () => 'Holland, J. B., Nyquist, W. E. y Cervantes-Martínez, C. T. (2003). Estimating and interpreting heritability for plant breeding: an update. Plant Breeding Reviews, 22, 9–112.',
    cullis2006: () => 'Cullis, B. R., Smith, A. B. y Coombes, N. E. (2006). On the design of early generation variety trials with correlated data. Journal of Agricultural, Biological, and Environmental Statistics, 11(4), 381–393.',
    piepho2007: () => 'Piepho, H.-P. y Möhring, J. (2007). Computing heritability and selection response from unbalanced plant breeding trials. Genetics, 177(3), 1881–1888.',
    schmidt2019: () => 'Schmidt, P., Hartung, J., Rath, J. y Piepho, H.-P. (2019). Estimating broad-sense heritability with unbalanced data from agricultural cultivar trials. Crop Science, 59(2), 525–536.',
    falconer1996: () => 'Falconer, D. S. y Mackay, T. F. C. (1996). Introduction to quantitative genetics (4.ª ed.). Longman.',
    cruz2012: () => 'Cruz, C. D., Regazzi, A. J. y Carneiro, P. C. S. (2012). Modelos biométricos aplicados ao melhoramento genético (4.ª ed., vol. 1). Editora UFV.',
    nelder1972: () => 'Nelder, J. A. y Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A, 135(3), 370–384.',
    mccullagh1989: () => 'McCullagh, P. y Nelder, J. A. (1989). Generalized linear models (2.ª ed.). Chapman and Hall.',
    venables2002: () => 'Venables, W. N. y Ripley, B. D. (2002). Modern applied statistics with S (4.ª ed.). Springer.',
    wedderburn1974: () => 'Wedderburn, R. W. M. (1974). Quasi-likelihood functions, generalized linear models, and the Gauss-Newton method. Biometrika, 61(3), 439–447.',
    lenth2016: () => 'Lenth, R. V. (2016). Least-squares means: the R package lsmeans. Journal of Statistical Software, 69(1), 1–33.',
  };
  /* cómo se cita cada clave dentro del texto */
  const CITA = {
    sigmapro: 'Barrera-Guzmán, 2026', rcore: 'R Core Team, 2024', gomez1984: 'Gomez y Gomez, 1984', yates1936b: 'Yates, 1936a', yates1936l: 'Yates, 1936b',
    patterson1976: 'Patterson y Williams, 1976', satterthwaite1946: 'Satterthwaite, 1946', searle1980: 'Searle et al., 1980', tukey1949: 'Tukey, 1949a',
    tukey1949na: 'Tukey, 1949b', duncan1955: 'Duncan, 1955', scheffe1953: 'Scheffé, 1953', sidak1967: 'Šidák, 1967', holm1979: 'Holm, 1979',
    dunnett1955: 'Dunnett, 1955', games1976: 'Games y Howell, 1976', benjamini1995: 'Benjamini y Hochberg, 1995', shapiro1965: 'Shapiro y Wilk, 1965',
    levene1960: 'Levene, 1960', brown1974: 'Brown y Forsythe, 1974', durbin1950: 'Durbin y Watson, 1950', cook1977: 'Cook, 1977', student1908: 'Student, 1908',
    welch1947: 'Welch, 1947', hedges1981: 'Hedges, 1981', wilcoxon1945: 'Wilcoxon, 1945', mann1947: 'Mann y Whitney, 1947', hodges1963: 'Hodges y Lehmann, 1963',
    kruskal1952: 'Kruskal y Wallis, 1952', friedman1937: 'Friedman, 1937', kendall1939: 'Kendall y Babington Smith, 1939', dunn1964: 'Dunn, 1964',
    conover1979: 'Conover e Iman, 1979', nemenyi1963: 'Nemenyi, 1963', cochran1957: 'Cochran, 1957', koenker1981: 'Koenker, 1981', ramsey1969: 'Ramsey, 1969',
    akaike1974: 'Akaike, 1974', mallows1973: 'Mallows, 1973', schwarz1978: 'Schwarz, 1978', pearson1895: 'Pearson, 1895', spearman1904: 'Spearman, 1904',
    kendall1938: 'Kendall, 1938', pearson1900: 'Pearson, 1900', yates1934: 'Yates, 1934', fisher1922: 'Fisher, 1922', cramer1946: 'Cramér, 1946',
    mcnemar1947: 'McNemar, 1947', bowker1948: 'Bowker, 1948', mantel1959: 'Mantel y Haenszel, 1959', breslow1980: 'Breslow y Day, 1980', tarone1985: 'Tarone, 1985',
    cohen1960: 'Cohen, 1960', cohen1968: 'Cohen, 1968', wilson1927: 'Wilson, 1927', clopper1934: 'Clopper y Pearson, 1934', agresti1998: 'Agresti y Coull, 1998',
    brown2001: 'Brown et al., 2001', bates2015: 'Bates et al., 2015', kuznetsova2017: 'Kuznetsova et al., 2017', kenward1997: 'Kenward y Roger, 1997',
    halekoh2014: 'Halekoh y Højsgaard, 2014', patterson1971: 'Patterson y Thompson, 1971', pinheiro2000: 'Pinheiro y Bates, 2000', wolfinger1993: 'Wolfinger, 1993',
    henderson1975: 'Henderson, 1975', gilmour1995: 'Gilmour et al., 1995', self1987: 'Self y Liang, 1987', holland2003: 'Holland et al., 2003',
    cullis2006: 'Cullis et al., 2006', piepho2007: 'Piepho y Möhring, 2007', schmidt2019: 'Schmidt et al., 2019', falconer1996: 'Falconer y Mackay, 1996',
    cruz2012: 'Cruz et al., 2012', nelder1972: 'Nelder y Wedderburn, 1972', mccullagh1989: 'McCullagh y Nelder, 1989', venables2002: 'Venables y Ripley, 2002',
    wedderburn1974: 'Wedderburn, 1974', lenth2016: 'Lenth, 2016',
  };
  const referencia = k => (REF[k] ? REF[k]() : '');

  /* ---------------- formato de la estadística en el texto ---------------- */
  const n2 = x => F.texto(x, 'forma2'), n3 = x => F.texto(x, 'forma'), s4 = x => F.texto(x, 'sig');
  const gl = g => (Number.isInteger(g) ? String(g) : F.fijo(g, 2));
  const fp = p => (!Number.isFinite(p) ? 'p = —' : p < 0.001 ? 'p < 0.001' : 'p = ' + F.fijo(p, 3));
  const pct = (x, d) => F.fijo(x, d === undefined ? 1 : d);
  const y = xs => (xs.length <= 1 ? (xs[0] || '') : xs.slice(0, -1).join(', ') + ' y ' + xs[xs.length - 1]);
  const ic = (a, nivel, fmt) => (Array.isArray(a) && (Number.isFinite(a[0]) || Number.isFinite(a[1])) ? T('IC {n} %: {a} a {b}', { n: Math.round(100 * (nivel || 0.95)), a: (fmt || s4)(a[0]), b: (fmt || s4)(a[1]) }) : '');
  const entre = s => (s ? ' (' + s + ')' : '');
  const minuscula = s => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  /* cita narrativa: «Satterthwaite (1946)» */
  const narrativa = (k, citas) => { citas.add(k); const c = CITA[k] || ''; const i = c.lastIndexOf(', '); return i > 0 ? c.slice(0, i) + ' (' + c.slice(i + 2) + ')' : c; };
  const lista = v => [].concat(v || []).filter(Boolean);
  const fin = s => (s && !/[.!?]$/.test(s.trim()) ? s.trim() + '.' : (s || '').trim());
  const cita = (claves, citas) => { claves.forEach(k => citas.add(k)); return claves.map(k => CITA[k]).join('; '); };
  const cuadroDe = (rep, id) => (rep && rep.cuadros ? rep.cuadros.find(c => c.id === id || c.id.startsWith(id)) : null);

  /** Frases del ANOVA a partir de su cuadro: cada término con su F contra el error de su estrato (la fila «Error…»
      que le sigue). Sirve para todos los diseños, la ANCOVA y el modelo lineal general. */
  function frasesAnova(cuadro, alfa, glError, bloqueos) {
    bloqueos = lista(bloqueos);
    if (!cuadro) return [];
    const filas = cuadro.filas, out = [];
    const esError = f => /^(error|residual)/i.test(String(f.fuente || ''));
    filas.forEach((f, i) => {
      if (esError(f) || f._total || !Number.isFinite(f.F) || !Number.isFinite(f.p)) return;
      let g2 = glError;
      for (let j = i + 1; j < filas.length; j++) if (esError(filas[j])) { g2 = filas[j].gl; break; }
      let nombre = String(f.fuente);
      const partes = nombre.split(/\s*[×:]\s*/);
      /* un bloque dentro de su repetición (látice) no es una interacción */
      if (partes.length === 2 && partes.every(x => bloqueos.includes(x))) nombre = T('{b} dentro de {r}', { b: partes.find(x => x !== bloqueos[1]) || partes[1], r: bloqueos[1] && partes.includes(bloqueos[1]) ? bloqueos[1] : partes[0] });
      const inter = partes.length > 1 && !(partes.length === 2 && partes.every(x => bloqueos.includes(x))), sig = f.p < alfa;
      const est = `F(${gl(f.gl)}, ${gl(g2)}) = ${n2(f.F)}; ${fp(f.p)}`;
      out.push(inter
        ? (sig ? T('la interacción {t} fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e: est }) : T('la interacción {t} no fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e: est }))
        : (sig ? T('el efecto de {t} fue significativo ({e})', { t: nombre, e: est }) : T('el efecto de {t} no fue significativo ({e})', { t: nombre, e: est })));
    });
    return out;
  }
  const may = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const oracion = frases => (frases.length ? fin(may(frases.join('; '))) : '');

  const DISENOS = {
    dca: 'completamente al azar', dbca: 'de bloques completos al azar', 'cuadro-latino': 'en cuadro latino', 'parcelas-divididas': 'de parcelas divididas',
    'parcelas-subdivididas': 'de parcelas subdivididas', franjas: 'de parcelas en franjas', bib: 'de bloques incompletos balanceados', latice: 'en látice',
  };
  const COMPARACION = {
    tukey: ['la prueba de Tukey', ['tukey1949']], dms: ['la diferencia mínima significativa de Fisher', []], duncan: ['la prueba de rango múltiple de Duncan', ['duncan1955']],
    snk: ['la prueba de Student-Newman-Keuls', []], scheffe: ['el método de Scheffé', ['scheffe1953']], bonferroni: ['pruebas t con la corrección de Bonferroni', []],
    sidak: ['pruebas t con la corrección de Šidák', ['sidak1967']], holm: ['pruebas t con el ajuste de Holm', ['holm1979']], dunnett: ['la prueba de Dunnett contra el testigo', ['dunnett1955']],
    'games-howell': ['la prueba de Games-Howell', ['games1976']],
  };
  const AJUSTE = { holm: ['el método de Holm', ['holm1979']], bonferroni: ['la corrección de Bonferroni', []], BH: ['el método de Benjamini y Hochberg', ['benjamini1995']], none: ['ningún ajuste', []] };
  const POSTHOC = { dunn: ['la prueba de Dunn', ['dunn1964']], conover: ['la prueba de Conover-Iman', ['conover1979']], nemenyi: ['la prueba de Nemenyi', ['nemenyi1963']], wilcoxon: ['pruebas de Wilcoxon pareadas', ['wilcoxon1945']] };
  const SC = t => ['', 'I', 'II', 'III'][Number(t) || 3];

  /* ---------------- párrafo por familia ---------------- */
  function diseno(id, r, rep, e, op, citas) {
    const facs = lista(r.factores), nivelesDe = f => { const m = (r.medias || []).find(x => x.factor === f); return m ? m.filas.length : null; };
    const cuentas = facs.map(nivelesDe);
    const arreglo = facs.length > 1 ? T(' con arreglo factorial {f}{n}', { f: facs.join(' × '), n: cuentas.every(Boolean) ? ' (' + cuentas.join(' × ') + ')' : '' })
      : facs.length ? T(' con {f} como factor de tratamiento', { f: facs[0] }) : '';
    let bloques = '';
    if (id === 'dbca' || id === 'bib' || id === 'latice') bloques = e.bloque ? T('; {b} fue la variable de bloque', { b: e.bloque }) : '';
    if (id === 'latice' && e.repeticion) bloques += T(' y {r}, la repetición', { r: e.repeticion });
    if (id === 'cuadro-latino') bloques = T('; {f} y {c} fueron las hileras y las columnas', { f: e.fila, c: e.columna });
    let estratos = '';
    if (id === 'parcelas-divididas') estratos = T(', con {a} en las parcelas grandes y {b} en las subparcelas; cada factor se probó contra el error de su estrato', { a: e.parcelaGrande, b: e.subparcela });
    if (id === 'parcelas-subdivididas') estratos = T(', con {a} en las parcelas grandes, {b} en las subparcelas y {c} en las sub-subparcelas; cada factor se probó contra el error de su estrato', { a: e.parcelaGrande, b: e.subparcela, c: e.subsubparcela });
    if (id === 'franjas') estratos = T(', con {a} y {b} en franjas que se cruzan; cada factor y su interacción se probaron contra su propio error', { a: e.franjaA, b: e.franjaB });
    const refs = ['gomez1984'].concat(id === 'bib' ? ['yates1936b'] : id === 'latice' ? ['yates1936l', 'patterson1976'] : []);
    const sc = r.tipoSC && !r.estratos ? T(' Se usaron sumas de cuadrados tipo {t}.', { t: SC(r.tipoSC) }) : '';
    const metodos = T('Los datos de {y} se analizaron con un análisis de varianza para un diseño {d}{a}{b}{s} ({c}).', { y: r.respuesta, d: DISENOS[id] || id, a: arreglo, b: bloques, s: estratos, c: cita(refs, citas) }) + sc;
    const frases = frasesAnova(cuadroDe(rep, 'anova'), r.alfa || 0.05, r.resumen && r.resumen.glError, [e.bloque, e.repeticion]);
    let resumen = '';
    const rs = r.resumen || {};
    if (Array.isArray(rs.cv)) resumen = T('La media general fue {m}; los coeficientes de variación fueron {cv}.', { m: s4(rs.media), cv: y(rs.cv.map(c => pct(c.cv) + ' % (' + c.error.toLowerCase() + ')')) });
    else if (Number.isFinite(rs.media)) resumen = T('La media general fue {m}, con un coeficiente de variación de {cv} %{r}.', { m: s4(rs.media), cv: pct(rs.cv), r: Number.isFinite(rs.r2) ? T(' y R² = {r}', { r: n3(rs.r2) }) : '' });
    return { metodos, resultados: [oracion(frases), resumen].filter(Boolean).join(' ') };
  }

  function comparaciones(id, r, rep, e, op, citas) {
    const que = lista(r.comparar || e.comparar).join(' × ') || r.factor;
    const dentro = lista(r.dentro).length ? T(' dentro de cada nivel de {d}', { d: lista(r.dentro).join(' × ') }) : '';
    const alfa = r.alfa || 0.05;
    const satt = r.tipoModelo && r.tipoModelo !== 'lineal' ? T(' Con varios estratos de error, los grados de libertad se aproximaron con el método de {c}.', { c: narrativa('satterthwaite1946', citas) }) : '';
    /* «Con variedad = Victory, las medias…» */
    const conGrupo = (g, frase) => (g.dentro && Object.keys(g.dentro).length ? T('Con {d}, {f}', { d: Object.entries(g.dentro).map(([k, v]) => k + ' = ' + v).join(', '), f: minuscula(frase) }) : frase);
    if (id === 'contrastes') {
      const metodos = T('Se probaron contrastes planeados entre los niveles de {f}{d}.', { f: r.factor, d: dentro }) + satt;
      const res = r.grupos.slice(0, 6).map(g => conGrupo(g, g.contrastes.map(c => T('{n}: estimado = {e}, t({g}) = {t}; {p}', { n: c.nombre, e: s4(c.est), g: gl(c.gl), t: n2(c.t), p: fp(c.p) })).join('; ') + '.'));
      return { metodos, resultados: res.join(' ') };
    }
    if (id === 'polinomios') {
      const g0 = r.grupos[0];
      const metodos = T('La respuesta de {y} a {f} se descompuso en polinomios ortogonales (componentes de grado 1 a {k}){d}.', { y: r.respuesta, f: r.factor, k: g0 ? g0.polinomios.length : '', d: dentro }) + satt;
      const res = r.grupos.slice(0, 6).map(g => {
        const comp = g.polinomios.map(c => (c.p < alfa ? T('el componente {n} fue significativo (F(1, {g}) = {f}; {p})', { n: c.nombre.toLowerCase(), g: gl(c.gl), f: n2(c.F), p: fp(c.p) })
          : T('el componente {n} no fue significativo (F(1, {g}) = {f}; {p})', { n: c.nombre.toLowerCase(), g: gl(c.gl), f: n2(c.F), p: fp(c.p) })));
        const o = g.optimo;
        const opt = o && Number.isFinite(o.x) ? (o.dentro === false ? T(' El {t} de la curva de grado {g} queda fuera del intervalo probado.', { t: o.tipo === 'minimo' ? T('mínimo') : T('máximo'), g: g.grado })
          : T(' La curva de grado {g} estimó la {t} respuesta con {f} = {x} ({y} = {v}).', { g: g.grado, t: o.tipo === 'minimo' ? T('mínima') : T('máxima'), f: r.factor, x: s4(o.x), y: r.respuesta, v: s4(o.y) })) : '';
        return conGrupo(g, oracion(comp) + opt);
      });
      return { metodos, resultados: res.join(' ') };
    }
    if (id === 'medias-ajustadas') {
      const metodos = T('Se estimaron las medias marginales de {q}{d} ({c}) con intervalos de confianza al {n} %.', { q: que, d: dentro, c: cita(['searle1980'], citas), n: Math.round(100 * (r.nivel || 0.95)) }) + satt;
      const res = r.grupos.slice(0, 6).map(g => conGrupo(g, T('Medias: {l}.', { l: g.filas.map(f => T('{n}: {m}{i}', { n: f.nombre, m: s4(f.media), i: entre(ic(f.ic, r.nivel)) })).join('; ') })));
      return { metodos, resultados: res.join(' ') };
    }
    const [nombre, refs] = COMPARACION[r.metodo] || [r.metodo, []];
    const metodos = T('Las medias de {q}{d} se compararon con {m} ({c}α = {a}).', { q: que, d: dentro, m: nombre, c: refs.length ? cita(refs, citas) + '; ' : '', a: alfa }) + satt;
    let res;
    if (r.tipo === 'dunnett') {
      res = r.grupos.slice(0, 6).map(g => {
        const dif = g.comparaciones.filter(c => c.p_ajustado < alfa), igual = g.comparaciones.filter(c => !(c.p_ajustado < alfa));
        return conGrupo(g, (dif.length ? T('Difirieron del testigo {t}: {l}.', { t: g.testigo, l: y(dif.map(c => T('{n} (diferencia = {d}; {p})', { n: c.nivel, d: s4(c.dif), p: fp(c.p_ajustado) }))) }) : T('Ningún tratamiento difirió del testigo {t}.', { t: g.testigo }))
          + (igual.length && dif.length ? ' ' + T('No difirieron: {l}.', { l: y(igual.map(c => c.nivel)) }) : ''));
      });
    } else {
      res = r.grupos.slice(0, 6).map(g => {
        const orden = g.medias.slice().sort((a, b) => b.media - a.media);
        return conGrupo(g, T('Las medias, de mayor a menor, fueron {l}', { l: y(orden.map(m => `${m.nombre} (${s4(m.media)}${m.letras ? ' ' + m.letras : ''})`)) }) + (orden.some(m => m.letras) ? T('; medias con una letra en común no difieren.') : '.'));
      });
    }
    return { metodos, resultados: res.join(' ') };
  }

  function pruebaT(r, e, citas) {
    const p = r.prueba, a = r.etiquetas[0], b = r.etiquetas[1];
    const alt = { bilateral: T('bilateral'), menor: T('unilateral (menor)'), mayor: T('unilateral (mayor)') }[r.alternativa] || r.alternativa;
    let metodos;
    if (r.modo === 'independientes') metodos = p.varIguales ? T('Las medias de {y} en {a} y {b} se compararon con la prueba t de Student para varianzas iguales ({c}), {al}.', { y: e.respuesta, a, b, c: cita(['student1908'], citas), al: alt })
      : T('Las medias de {y} en {a} y {b} se compararon con la prueba t de Welch ({c}), {al}.', { y: e.respuesta, a, b, c: cita(['welch1947'], citas), al: alt });
    else if (r.modo === 'pareadas') metodos = T('Las diferencias entre {a} y {b} se analizaron con la prueba t para muestras pareadas ({c}), {al}.', { a, b, c: cita(['student1908'], citas), al: alt });
    else metodos = T('La media de {a} se comparó con el valor de referencia {m} con la prueba t para una muestra ({c}), {al}.', { a, m: r.mu, c: cita(['student1908'], citas), al: alt });
    if (r.efecto) metodos += ' ' + T('El tamaño del efecto se expresó con la g de Hedges ({c}).', { c: cita(['hedges1981'], citas) });
    const g = r.grupos || [];
    let resultados = g.length ? y(g.map(x => T('{n}: media = {m} (DE = {d}; n = {k})', { n: x.nombre, m: s4(x.media), d: s4(x.de), k: x.n }))) + '. ' : '';
    const est = r.modo === 'independientes' ? T('La diferencia de medias fue {d}{i}', { d: s4(p.diferencia), i: entre(ic(p.ic, r.nivel)) })
      : r.modo === 'pareadas' ? T('La media de las diferencias fue {d}{i}', { d: s4(Array.isArray(p.estimado) ? p.estimado[0] : p.estimado), i: entre(ic(p.ic, r.nivel)) })
        : T('La media fue {d}{i}', { d: s4(Array.isArray(p.estimado) ? p.estimado[0] : p.estimado), i: entre(ic(p.ic, r.nivel)) });
    resultados += est + T('; t({g}) = {t}; {p}', { g: gl(p.gl), t: n2(p.t), p: fp(p.p) });
    if (r.efecto) resultados += T('; g de Hedges = {g}{i}', { g: n2(r.efecto.g), i: entre(ic(r.efecto.ic_g, r.nivel, n2)) });
    return { metodos, resultados: fin(resultados) };
  }

  function rangos(id, r, rep, e, citas) {
    if (id === 'wilcoxon') {
      const p = r.prueba, ind = r.modo === 'independientes';
      const metodos = ind ? T('Las distribuciones de {y} en {a} y {b} se compararon con la prueba de suma de rangos de Wilcoxon-Mann-Whitney ({c}), con el estimador de Hodges-Lehmann de la diferencia de ubicación ({h}).', { y: e.respuesta, a: r.etiquetas[0], b: r.etiquetas[1], c: cita(['wilcoxon1945', 'mann1947'], citas), h: cita(['hodges1963'], citas) })
        : T('{q} se analizó con la prueba de rangos con signo de Wilcoxon ({c}), con el estimador de Hodges-Lehmann ({h}).', { q: r.modo === 'pareadas' ? T('La diferencia entre {a} y {b}', { a: r.etiquetas[0], b: r.etiquetas[1] }) : T('La ubicación de {a}', { a: r.etiquetas[0] }), c: cita(['wilcoxon1945'], citas), h: cita(['hodges1963'], citas) });
      const meds = (r.grupos || []).map(x => T('{n}: mediana = {m}', { n: x.nombre, m: s4(x.mediana) }));
      const resultados = (meds.length ? y(meds) + '. ' : '') + T('{w} = {v}; {p}{x}; estimador de Hodges-Lehmann = {h}{i}.', { w: ind ? 'W' : 'V', v: n2(p.estadistico), p: fp(p.p), x: p.exacta ? T(' (exacta)') : '', h: s4(p.estimado), i: entre(ic(p.ic, p.nivel || r.nivel)) });
      return { metodos, resultados };
    }
    const kw = id === 'kruskal-wallis', c = r.comparaciones || {}, [ph, phr] = POSTHOC[c.metodo] || [c.metodo, []], [aj, ajr] = AJUSTE[c.ajuste] || [c.ajuste, []];
    const metodos = (kw ? T('La variable {y} se comparó entre los niveles de {t} con la prueba de Kruskal-Wallis ({c})', { y: r.respuesta, t: r.tratamiento, c: cita(['kruskal1952'], citas) })
      : T('La variable {y} se comparó entre los niveles de {t} dentro de cada {b} con la prueba de Friedman ({c}) y la W de Kendall ({w})', { y: r.respuesta, t: r.tratamiento, b: r.bloque, c: cita(['friedman1937'], citas), w: cita(['kendall1939'], citas) }))
      + (ph ? T('; las comparaciones por pares se hicieron con {p}{c} y valores p ajustados con {a}{d}.', { p: ph, c: phr.length ? ' (' + cita(phr, citas) + ')' : '', a: aj, d: ajr.length ? ' (' + cita(ajr, citas) + ')' : '' }) : '.');
    const p = r.prueba;
    const est = kw ? T('H({g}) = {h}; {p}', { g: gl(p.gl), h: n2(p.H), p: fp(p.p) }) + (Number.isFinite(p.eta2) ? T('; η² = {e}', { e: n3(p.eta2) }) : '')
      : T('χ²({g}) = {q}; {p}; W de Kendall = {w}', { g: gl(p.gl), q: n2(p.Q), p: fp(p.p), w: n3(p.W) });
    const cg = cuadroDe(rep, 'grupos');
    const meds = cg ? cg.filas.slice().sort((a, b) => (b.mediana - a.mediana) || (b.rangoMedio - a.rangoMedio)).map(f => `${f.nombre} (${s4(f.mediana)}${f.letras ? ' ' + f.letras : ''})`) : [];
    const resultados = fin(est) + (meds.length ? ' ' + T('Medianas, de mayor a menor: {l}{n}', { l: y(meds), n: cg.filas.some(f => f.letras) ? T('; tratamientos con una letra en común no difieren.') : '.' }) : '');
    return { metodos, resultados };
  }

  function regresion(id, r, rep, e, citas) {
    if (id === 'seleccion-pasos') {
      const dir = { adelante: T('hacia adelante'), atras: T('hacia atrás'), ambas: T('en ambos sentidos'), mixta: T('mixta') }[r.direccion] || r.direccion;
      const metodos = r.criterio === 'aic' ? T('Los predictores de {y} se seleccionaron paso a paso ({d}) entre {k} candidatos con el criterio de información de Akaike ({c}).', { y: r.respuesta, d: dir, k: r.candidatos.length, c: cita(['akaike1974'], citas) })
        : T('Los predictores de {y} se seleccionaron paso a paso ({d}) entre {k} candidatos por su valor p (entrada {a}, salida {s}).', { y: r.respuesta, d: dir, k: r.candidatos.length, a: r.entrada, s: r.salida });
      const f = r.final || {};
      const resultados = r.finales.length ? T('El modelo final incluyó {v} (R² ajustada = {r}{a}).', { v: y(r.finales), r: n3(f.r2_ajustada), a: Number.isFinite(f.aic) ? T('; AIC = {a}', { a: n2(f.aic) }) : '' }) : T('Ningún predictor quedó en el modelo final.');
      return { metodos, resultados };
    }
    if (id === 'mejores-subconjuntos') {
      const metodos = T('Se evaluaron todos los subconjuntos de los {k} predictores candidatos de {y} y se compararon con la R² ajustada, el Cp de Mallows ({m}) y el criterio bayesiano de Schwarz (BIC; {s}).', { k: r.candidatos.length, y: r.respuesta, m: cita(['mallows1973'], citas), s: cita(['schwarz1978'], citas) });
      const cs = cuadroDe(rep, 'subconjuntos'), vars = k => { const f = cs && cs.filas.find(x => x.tam === k && x.rango === 1); return f ? f.vars : ''; };
      const el = r.elegido || {};
      const resultados = T('El BIC eligió el modelo de {b} predictores ({vb}); el Cp, el de {c} ({vc}); y la R² ajustada, el de {r} ({vr}).', { b: el.bic, vb: vars(el.bic), c: el.cp, vc: vars(el.cp), r: el.r2_ajustada, vr: vars(el.r2_ajustada) });
      return { metodos, resultados };
    }
    const pred = lista(r.predictores), multiple = pred.length > 1 && r.modelo !== 'polinomial';
    const metodos = (r.modelo === 'polinomial' ? T('Se ajustó una regresión polinomial de grado {g} de {y} sobre {x} por mínimos cuadrados.', { g: r.grado, y: r.respuesta, x: pred[0] })
      : T('Se ajustó una regresión lineal {t} de {y} sobre {x} por mínimos cuadrados.', { t: multiple ? T('múltiple') : T('simple'), y: r.respuesta, x: y(pred) }))
      + ' ' + T('Se revisaron la normalidad de los residuos (Shapiro-Wilk; {s}), la varianza constante (Breusch-Pagan estudentizada; {k}), la forma del modelo (RESET; {r}){v} y las observaciones influyentes (distancia de Cook; {c}).',
        { s: cita(['shapiro1965'], citas), k: cita(['koenker1981'], citas), r: cita(['ramsey1969'], citas), v: multiple ? T(', la colinealidad (factor de inflación de la varianza)') : '', c: cita(['cook1977'], citas) });
    const a = r.anova.regresion, aj = r.ajuste, c = r.coeficientes;
    let resultados = (a.p < r.alfa ? T('El modelo fue significativo') : T('El modelo no fue significativo')) + T(' (F({a}, {b}) = {f}; {p}) y explicó {r} % de la variación de {y} (R² ajustada = {ra}; error estándar = {s}).',
      { a: gl(a.gl), b: gl(r.anova.error.gl), f: n2(a.F), p: fp(a.p), r: pct(100 * aj.r2), y: r.respuesta, ra: n3(aj.r2_ajustada), s: s4(aj.sigma) });
    const terminos = c.nombre.map((nm, j) => (j === 0 && /intercep/i.test(nm) ? s4(c.estimado[j]) : (c.estimado[j] < 0 ? '− ' : '+ ') + s4(Math.abs(c.estimado[j])) + '·' + nm));
    resultados += ' ' + T('La ecuación ajustada fue ŷ = {e}.', { e: terminos.join(' ').replace(/^\+ /, '') });
    const coefs = c.nombre.map((nm, j) => ({ nm, j })).filter(x => !/intercep/i.test(x.nm)).map(x => T('{n} (b = {b}; t({g}) = {t}; {p})', { n: x.nm, b: s4(c.estimado[x.j]), g: gl(r.anova.error.gl), t: n2(c.t[x.j]), p: fp(c.p[x.j]) }));
    if (coefs.length) resultados += ' ' + T('Coeficientes: {l}.', { l: y(coefs) });
    const o = r.optimo;
    if (o && Number.isFinite(o.x)) resultados += ' ' + (o.dentro === false ? T('El {t} de la curva queda fuera del intervalo de {x} observado.', { t: o.tipo === 'minimo' ? T('mínimo') : T('máximo'), x: pred[0] })
      : T('La curva alcanzó su {t} en {x} = {v} ({y} = {w}).', { t: o.tipo === 'minimo' ? T('mínimo') : T('máximo'), x: pred[0], v: s4(o.x), y: r.respuesta, w: s4(o.y) }));
    const pr = r.pruebas || {};
    const diag = [];
    if (pr.shapiro) diag.push(T('Shapiro-Wilk W = {w}; {p}', { w: n3(pr.shapiro.W), p: fp(pr.shapiro.p) }));
    if (pr.breusch_pagan) diag.push(T('Breusch-Pagan = {b}; {p}', { b: n2(pr.breusch_pagan.BP), p: fp(pr.breusch_pagan.p) }));
    if (pr.reset) diag.push(T('RESET F({a}, {b}) = {f}; {p}', { a: gl(pr.reset.gl1), b: gl(pr.reset.gl2), f: n2(pr.reset.F), p: fp(pr.reset.p) }));
    if (diag.length) resultados += ' ' + T('Diagnóstico: {d}.', { d: diag.join('; ') });
    return { metodos, resultados };
  }

  function ancova(r, rep, e, citas) {
    const covs = lista(r.covariables), trs = lista(r.tratamientos);
    const [nm, refs] = COMPARACION[r.metodo] || [r.metodo, []];
    const metodos = T('Se realizó un análisis de covarianza ({c}) de {y} con {v} como {cv} y {t} como {ft}{b}; se usaron sumas de cuadrados tipo {s}.', {
      c: cita(['cochran1957'], citas), y: r.respuesta, v: y(covs), cv: covs.length > 1 ? T('covariables') : T('covariable'), t: trs.join(' × '),
      ft: trs.length > 1 ? T('factores de tratamiento') : T('factor de tratamiento'), b: r.bloque ? T(', en bloques completos al azar ({b})', { b: r.bloque }) : '', s: SC(r.tipoSC) })
      + ' ' + T('Se probaron la homogeneidad de las pendientes y que la covariable no dependiera de los tratamientos; las medias ajustadas se compararon con {m}{c}.', { m: nm, c: refs.length ? ' (' + cita(refs, citas) + ')' : '' });
    const frases = frasesAnova(cuadroDe(rep, 'anova'), r.alfa || 0.05, r.resumen && r.resumen.gl);
    const extra = [];
    (r.pendientes || []).forEach(p => extra.push(T('La pendiente común de {c} fue b = {b} (t({g}) = {t}; {p}).', { c: p.covariable, b: s4(p.estimado), g: gl(r.resumen.gl), t: n2(p.t), p: fp(p.p) })));
    (r.homogeneidad || []).forEach(h => extra.push((h.p < (r.alfa || 0.05) ? T('Las pendientes de {c} no fueron homogéneas', { c: h.covariable }) : T('Las pendientes de {c} fueron homogéneas', { c: h.covariable })) + T(' (F({a}, {b}) = {f}; {p}).', { a: gl(h.gl1), b: gl(h.gl2), f: n2(h.F), p: fp(h.p) })));
    if (r.eficiencia && Number.isFinite(r.eficiencia.relativa)) extra.push(T('La eficiencia relativa de la covarianza fue {e} %.', { e: pct(r.eficiencia.relativa, 0) }));
    (r.comparaciones || []).slice(0, 3).forEach(cmp => {
      const orden = cmp.medias.slice().sort((a, b) => b.media - a.media);
      extra.push(T('Medias ajustadas de {f}, de mayor a menor: {l}.', { f: cmp.factor, l: y(orden.map(m => `${m.nombre} (${s4(m.media)}${m.letras ? ' ' + m.letras : ''})`)) }));
    });
    return { metodos, resultados: [oracion(frases)].concat(extra).filter(Boolean).join(' ') };
  }

  function correlacion(id, r, e, citas) {
    const NOMBRE = { pearson: ['de Pearson', ['pearson1895'], 'r'], spearman: ['de Spearman', ['spearman1904'], 'ρ'], kendall: ['de Kendall', ['kendall1938'], 'τ'] };
    const [nm, refs, sim] = NOMBRE[r.metodo] || NOMBRE.pearson;
    if (id === 'matriz-correlacion') {
      const [aj, ajr] = AJUSTE[r.ajuste] || [r.ajuste, []];
      const metodos = T('Se calculó la matriz de correlaciones {n} ({c}) entre {k} variables ({v}), con los valores p ajustados con {a}{d}.', { n: nm, c: cita(refs, citas), k: r.variables.length, v: y(r.variables), a: aj, d: ajr.length ? ' (' + cita(ajr, citas) + ')' : '' });
      const sig = r.pares.filter(p => p.p_ajustado < r.alfa).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
      const resultados = T('{s} de las {m} correlaciones fueron significativas después del ajuste (α = {a})', { s: sig.length, m: r.pares.length, a: r.alfa })
        + (sig.length ? T('; las más fuertes: {l}.', { l: y(sig.slice(0, 4).map(p => T('{a} con {b} ({s} = {r}; p ajustado {p})', { a: p.a, b: p.b, s: sim, r: n3(p.r), p: fp(p.p_ajustado).replace(/^p /, '') }))) }) : '.');
      return { metodos, resultados };
    }
    if (id === 'correlacion-parcial') {
      const metodos = T('La relación entre {x} y {y} descontando {c} se midió con la correlación parcial {n} ({r}), junto con las semiparciales.', { x: e.x, y: r.y, c: y(r.controles), n: nm, r: cita(refs, citas) });
      const pa = r.parcial, si = r.simple;
      const resultados = T('La correlación parcial fue {s} = {r} (t({g}) = {t}; {p}), frente a una correlación simple de {s} = {r0} ({p0}).', { s: sim, r: n3(pa.r), g: gl(pa.gl), t: n2(pa.t), p: fp(pa.p), r0: n3(si.r), p0: fp(si.p) });
      return { metodos, resultados };
    }
    const metodos = T('La asociación entre {x} y {y} se midió con el coeficiente de correlación {n} ({c}).', { x: e.x, y: e.y, n: nm, c: cita(refs, citas) });
    const est = r.nombre === 't' ? T('t({g}) = {t}', { g: gl(r.gl), t: n2(r.estadistico) }) : `${r.nombre} = ${n2(r.estadistico)}`;
    const resultados = T('{s} = {r}{i}; {e}; {p}; n = {n}.', { s: sim, r: n3(r.estimado), i: entre(ic(r.ic, r.nivel, n3)), e: est, p: fp(r.p), n: r.n });
    return { metodos, resultados };
  }

  function contingencia(id, r, e, op, citas) {
    if (id === 'mcnemar') {
      const bowker = r.niveles && r.niveles.length > 2;
      const metodos = bowker ? T('El cambio entre {a} y {b} se evaluó con la prueba de simetría de Bowker ({c}).', { a: r.antes, b: r.despues, c: cita(['bowker1948'], citas) })
        : T('El cambio entre {a} y {b} se evaluó con la prueba de McNemar ({c}){y}.', { a: r.antes, b: r.despues, c: cita(['mcnemar1947'], citas), y: r.correccion ? T(' con corrección por continuidad') : '' });
      return { metodos, resultados: T('χ²({g}) = {x}; {p}; n = {n}.', { g: gl(r.gl), x: n2(r.X2), p: fp(r.p), n: r.n }) };
    }
    if (id === 'mantel-haenszel') {
      const metodos = T('La asociación entre {f} y {c} controlando {s} se evaluó con la prueba de Cochran-Mantel-Haenszel ({m})', { f: r.fila, c: r.columna, s: r.estrato, m: cita(['mantel1959'], citas) })
        + (r.breslow_day ? T('; la homogeneidad de la razón de momios entre estratos se probó con Breslow-Day ({b}) con la corrección de Tarone ({t}).', { b: cita(['breslow1980'], citas), t: cita(['tarone1985'], citas) }) : '.');
      let resultados = T('χ²({g}) = {x}; {p}', { g: gl(r.gl), x: n2(r.X2), p: fp(r.p) });
      if (Number.isFinite(r.razon_momios)) resultados += T('; razón de momios común = {o}{i}', { o: s4(r.razon_momios), i: entre(ic(r.ic, r.nivel)) });
      const bd = r.breslow_day;
      if (bd && Number.isFinite(bd.X2_tarone)) resultados += T('; Breslow-Day con Tarone χ²({g}) = {x}; {p}', { g: gl(bd.gl), x: n2(bd.X2_tarone), p: fp(bd.p_tarone) });
      return { metodos, resultados: fin(resultados) };
    }
    if (id === 'kappa') {
      const pesos = r.ponderada && r.ponderada.pesos === 'lineal' ? T('lineales') : T('cuadráticos');
      const metodos = T('La concordancia entre {a} y {b} se midió con la kappa de Cohen ({c}) y la kappa ponderada con pesos {p} ({d}).', { a: r.evaluador1, b: r.evaluador2, c: cita(['cohen1960'], citas), p: pesos, d: cita(['cohen1968'], citas) });
      const s = r.simple, w = r.ponderada;
      const resultados = T('El acuerdo observado fue {o} % (esperado por azar, {e} %); κ = {k} ({i}z = {z}; {p}) y κ ponderada = {kw}{iw}.', { o: pct(100 * r.acuerdo), e: pct(100 * r.esperado), k: n3(s.estimado), i: ic(s.ic, r.nivel, n3) ? ic(s.ic, r.nivel, n3) + '; ' : '', z: n2(s.z), p: fp(s.p), kw: n3(w.estimado), iw: entre(ic(w.ic, r.nivel, n3)) });
      return { metodos, resultados };
    }
    const ch = r.chi, yates = ch.yates && r.correccion;
    const metodos = T('La asociación entre {f} y {c} se evaluó con la prueba ji cuadrada de independencia ({p}){y} y la prueba exacta de Fisher ({fi}); su intensidad se midió con la V de Cramér ({cr}).',
      { f: r.fila, c: r.columna, p: cita(['pearson1900'], citas), y: yates ? T(' con la corrección por continuidad de Yates ({c})', { c: cita(['yates1934'], citas) }) : '', fi: cita(['fisher1922'], citas), cr: cita(['cramer1946'], citas) });
    let resultados = T('χ²({g}) = {x}; {p}; V de Cramér = {v}', { g: gl(ch.gl), x: n2(ch.X2), p: fp(ch.p), v: n3(r.medidas.v_cramer) });
    if (r.fisher && Number.isFinite(r.fisher.p)) resultados += T('; prueba exacta de Fisher: {p}', { p: fp(r.fisher.p) }) + (Number.isFinite(r.fisher.razon_momios) ? T(' (razón de momios = {o}{i})', { o: s4(r.fisher.razon_momios), i: ic(r.fisher.ic, r.nivel) ? '; ' + ic(r.fisher.ic, r.nivel) : '' }) : '');
    resultados = fin(resultados);
    if (ch.menores5) resultados += ' ' + T('{k} de {n} celdas tuvieron una frecuencia esperada menor que 5.', { k: ch.menores5, n: ch.celdas });
    return { metodos, resultados };
  }

  function explorar(id, r, rep, e, op, citas) {
    if (id === 'descriptivos') {
      const facs = lista(r.factores);
      const metodos = T('Se calcularon la media, la desviación estándar (DE), el error estándar, el coeficiente de variación y los cuartiles de {v}{g}, con intervalos de confianza al {n} % para la media.', { v: y(lista(r.variables)), g: facs.length ? T(' en cada combinación de {f}', { f: facs.join(' × ') }) : '', n: Math.round(100 * (r.nivel || 0.95)) });
      const c = cuadroDe(rep, 'descriptivos');
      if (!c) return { metodos, resultados: '' };
      const gcols = c.columnas.filter(k => k.clave.startsWith('g:')).map(k => k.clave);
      const filas = c.filas.slice(0, 16).map(f => {
        const g = gcols.map(k => f[k]).join(' · '), v = lista(r.variables).length > 1 ? f.variable + (g ? ', ' : '') : '';
        return T('{g}: {m} ± {d} (n = {n})', { g: v + g || f.variable, m: s4(f.media), d: s4(f.de), n: f.n });
      });
      return { metodos, resultados: T('Media ± DE: {l}{x}.', { l: filas.join('; '), x: c.filas.length > 16 ? T('; …') : '' }) };
    }
    if (id === 'frecuencias') {
      const c = rep.cuadros[0];
      const metodos = T('Se obtuvieron las frecuencias absolutas y relativas de {f}{c}.', { f: r.fila, c: r.columna ? T(' cruzadas con {c}', { c: r.columna }) : '' });
      const res = r.vias === 1 && r.niveles ? y(r.niveles.slice(0, 20).map((n, i) => T('{n}: {k} ({p} %)', { n, k: r.frecuencia[i], p: pct(r.porcentaje[i]) }))) + '.' : (c ? T('Ver el cuadro de frecuencias.') : '');
      return { metodos, resultados: res };
    }
    if (id === 'proporciones') {
      const ms = lista(r.metodos);
      const extra = [];
      const refs = ['wilson1927'];
      if (ms.includes('clopper_pearson')) refs.push('clopper1934');
      if (ms.includes('agresti_coull')) refs.push('agresti1998');
      if (ms.includes('jeffreys')) refs.push('brown2001');
      const metodos = T('Se estimaron las proporciones{g} con intervalos de confianza al {n} % de Wilson y otros métodos ({c}).', { g: r.grupo ? T(' de cada nivel de {g}', { g: r.grupo }) : '', n: Math.round(100 * (r.nivel || 0.95)), c: cita(refs, citas) });
      const t = r.tabla;
      if (t && t.p) for (let i = 0; i < Math.min(16, t.p.length); i++) extra.push(T('{g}: {p} ({x}/{n}; IC de Wilson: {a} a {b})', { g: (t.grupo && t.grupo[i]) || (t.categoria && t.categoria[i]) || '', p: n3(t.p[i]), x: t.x[i], n: t.n[i], a: n3(t.wilson_inf[i]), b: n3(t.wilson_sup[i]) }));
      return { metodos, resultados: extra.length ? fin(y(extra)) : '' };
    }
    if (id === 'bondad-ajuste') {
      const metodos = T('La concordancia de las frecuencias de {c} con las proporciones esperadas ({p}) se evaluó con la prueba ji cuadrada de bondad de ajuste ({r}).', { c: e.categoria, p: [].concat((op && op.proporciones) || []).join(':') || T('iguales'), r: cita(['pearson1900'], citas) });
      return { metodos, resultados: T('χ²({g}) = {x}; {p}; n = {n}.', { g: gl(r.gl), x: n2(r.chi2), p: fp(r.p), n: r.n }) };
    }
    return null;
  }

  function supuestos(r, rep, citas) {
    const metodos = T('Los supuestos del modelo {f} se revisaron con la prueba de Shapiro-Wilk para la normalidad de los residuos ({s}), la de Levene centrada en la mediana para la igualdad de varianzas ({l}), la de no aditividad de Tukey ({t}) para los bloques, la de Durbin-Watson para la independencia ({d}) y los residuos estudentizados con el ajuste de Bonferroni para los valores atípicos.',
      { f: r.formula, s: cita(['shapiro1965'], citas), l: cita(['levene1960', 'brown1974'], citas), t: cita(['tukey1949na'], citas), d: cita(['durbin1950'], citas) });
    const sem = rep.semaforo || [];
    const resultados = sem.map(s => fin(s.nombre + ': ' + minuscula(s.texto))).join(' ');
    return { metodos, resultados };
  }

  function modeloLineal(r, rep, citas) {
    const cf = lista(r.comoFactor);
    const metodos = T('Se ajustó el modelo lineal {f} por mínimos cuadrados, con sumas de cuadrados tipo {s}{c}.', { f: r.formula, s: SC(r.tipoSC), c: cf.length ? T('; {v} se {t} como {x}', { v: y(cf), t: cf.length > 1 ? T('trataron') : T('trató'), x: cf.length > 1 ? T('factores') : T('factor') }) : '' });
    const frases = frasesAnova(cuadroDe(rep, 'anova'), r.alfa || 0.05, r.resumen && r.resumen.gl);
    const rs = r.resumen || {};
    return { metodos, resultados: [oracion(frases), T('R² = {r} (ajustada = {a}); error estándar = {s}; CV = {cv} %.', { r: n3(rs.r2), a: n3(rs.r2_ajustada), s: s4(rs.sigma), cv: pct(rs.cv) })].filter(Boolean).join(' ') };
  }

  /** Modelo lineal mixto (motor R): cómo se ajustó y las pruebas de sus efectos fijos con los gl del modelo. */
  function mixto(r, rep, citas) {
    const cf = lista(r.comoFactor), kr = r.gl === 'Kenward-Roger';
    const est = r.reml ? T('máxima verosimilitud restringida (REML; {c})', { c: cita(['patterson1971'], citas) }) : T('máxima verosimilitud');
    const pruebas = kr ? T('Kenward-Roger ({c})', { c: cita(['kenward1997', 'halekoh2014'], citas) }) : T('Satterthwaite ({c})', { c: cita(['satterthwaite1946'], citas) });
    const DIS = { 'mixto-bloques': T('Los datos se analizaron como bloques completos al azar con los bloques como efecto aleatorio. '),
      'mixto-divididas': T('Los datos se analizaron como parcelas divididas, con los bloques y las parcelas grandes como efectos aleatorios. '),
      'mixto-latice': T('Los datos se analizaron como un diseño en látice con los bloques incompletos como efecto aleatorio, lo que recupera la información entre bloques. '),
      'mixto-localidades': T('Los datos se analizaron como un ensayo en varias localidades con los genotipos fijos. ') };
    const metodos = (DIS[r.diseno] || '') + T('Se ajustó el modelo lineal mixto {f} por {e} con lme4 ({l}); los efectos fijos se probaron con sumas de cuadrados tipo {s} y grados de libertad de {g}, calculados con lmerTest ({t}){c}.', {
      f: r.formula, e: est, l: cita(['bates2015'], citas), s: SC(r.tipoSC), g: pruebas, t: cita(['kuznetsova2017'], citas),
      c: cf.length ? T('; {v} se {t} como {x}', { v: y(cf), t: cf.length > 1 ? T('trataron') : T('trató'), x: cf.length > 1 ? T('factores') : T('factor') }) : '' }) +
      ((r.medias || []).length ? ' ' + T('Las medias marginales ({m}) se estimaron con emmeans con esos mismos grados de libertad y se compararon {a}.', {
        m: cita(['searle1980'], citas), a: ({ tukey: T('con la prueba de Tukey ({c})', { c: cita(['tukey1949'], citas) }), holm: T('con el ajuste de Holm ({c})', { c: cita(['holm1979'], citas) }),
          sidak: T('con el ajuste de Šidák ({c})', { c: cita(['sidak1967'], citas) }), bonferroni: T('con el ajuste de Bonferroni'), none: T('por pares sin ajuste') })[r.medias[0].ajuste] || '' }) : '') +
      (r.ranova && r.ranova.termino.length > 1 ? ' ' + T('Cada efecto aleatorio se probó con una prueba de razón de verosimilitudes.') : '');
    const a = r.anova, alfa = r.alfa || 0.05, frases = [];
    a.termino.forEach((t, i) => {
      if (!Number.isFinite(a.F[i]) || !Number.isFinite(a.p[i])) return;
      const nombre = String(t), inter = nombre.includes(':'), sig = a.p[i] < alfa;
      const glm = g => (Math.abs(g - Math.round(g)) < 0.005 ? String(Math.round(g)) : F.fijo(g, 2));
      const e = `F(${glm(a.gl1[i])}, ${glm(a.gl2[i])}) = ${n2(a.F[i])}; ${fp(a.p[i])}`;
      frases.push(inter
        ? (sig ? T('la interacción {t} fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }) : T('la interacción {t} no fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }))
        : (sig ? T('el efecto de {t} fue significativo ({e})', { t: nombre, e }) : T('el efecto de {t} no fue significativo ({e})', { t: nombre, e })));
    });
    const vc = r.varianzas, soloInt = vc.grupo.every((g, k) => g === 'Residual' || (vc.var1[k] === '(Intercept)' && (vc.var2[k] === null || vc.var2[k] === undefined)));
    let varianzas = '';
    if (soloInt) {
      const total = vc.varianza.reduce((s, x) => s + x, 0);
      const partes = vc.grupo.map((g, k) => (g === 'Residual' ? T('la residual, {v}', { v: s4(vc.varianza[k]) }) : T('la de {g}, {v} ({p} % de la variación aleatoria)', { g, v: s4(vc.varianza[k]), p: pct(total > 0 ? 100 * vc.varianza[k] / total : NaN) })));
      varianzas = T('Las varianzas estimadas fueron: {l}.', { l: y(partes) });
    }
    /* medias: todas si son pocas; si no, la mayor y la menor */
    const medias = (r.medias || []).filter(md => !md.dentro).map(md => {
      const fs = md.filas.filter(f => Number.isFinite(f.media)).slice().sort((p, q) => q.media - p.media), con = f => s4(f.media) + (f.letras ? ' ' + f.letras : '');
      if (!fs.length) return '';
      return fs.length <= 12
        ? T('Las medias de {f} fueron: {l}', { f: md.factor, l: fs.map(f => f.nivel + ', ' + con(f)).join('; ') }) + (fs.some(f => f.letras) ? T(' (medias con la misma letra no difieren)') : '') + '.'
        : T('La media más alta de {f} fue la de {a} ({x}) y la más baja la de {b} ({z}).', { f: md.factor, a: fs[0].nivel, x: con(fs[0]), b: fs[fs.length - 1].nivel, z: con(fs[fs.length - 1]) });
    }).filter(Boolean);
    const rv = r.ranova, aleatorios = [];
    if (rv) rv.termino.forEach((t, i) => {
      if (t === '<none>' || !Number.isFinite(rv.p[i])) return;
      const e = `χ²(${rv.gl[i]}) = ${n2(rv.LRT[i])}; ${fp(rv.p[i])}`;
      aleatorios.push(rv.p[i] < alfa ? T('el efecto aleatorio {t} fue significativo ({e})', { t, e }) : T('el efecto aleatorio {t} no fue significativo ({e})', { t, e }));
    });
    return { metodos, resultados: [oracion(frases), varianzas, oracion(aleatorios)].concat(medias).concat([r.ajuste && r.ajuste.singular ? T('El ajuste fue singular: al menos un componente de varianza se estimó en cero.') : '']).filter(Boolean).join(' ') };
  }

  /** Medidas repetidas (motor R): la estructura de covarianza elegida y las pruebas de los efectos fijos. */
  function repetidas(r, rep, citas) {
    const el = r.estructuras.find(x => x.clave === r.elegida) || { nombre: r.elegida };
    const nombreE = n => (/^[A-Z][A-Z(]/.test(n) ? n : minuscula(n));   // las siglas, como AR(1), se quedan
    const ajustes = { tukey: () => T('con la prueba de Tukey ({c})', { c: cita(['tukey1949'], citas) }), holm: () => T('con el ajuste de Holm ({c})', { c: cita(['holm1979'], citas) }),
      sidak: () => T('con el ajuste de Šidák ({c})', { c: cita(['sidak1967'], citas) }), bonferroni: () => T('con el ajuste de Bonferroni'), none: () => T('por pares sin ajuste') };
    const metodos = T('Las mediciones repetidas en el tiempo se analizaron con un modelo de mínimos cuadrados generalizados ({f}) ajustado por REML con nlme ({c}). ', { f: r.formula, c: cita(['pinheiro2000'], citas) }) +
      (r.forzada ? T('La covarianza entre las fechas de una misma unidad se modeló con una estructura {e}. ', { e: nombreE(el.nombre) })
        : T('La estructura de covarianza entre las fechas de una misma unidad ({e}) se eligió por el menor {k} ({kc}) entre {n} candidatas ({w}). ', {
          e: nombreE(el.nombre), k: r.criterio, kc: cita([r.criterio === 'BIC' ? 'schwarz1978' : 'akaike1974'], citas), n: r.estructuras.filter(x => !x.error).length, w: cita(['wolfinger1993'], citas) })) +
      T('Los efectos fijos se probaron con pruebas F marginales con {g} grados de libertad del error.', { g: r.gl }) +
      ((r.medias || []).length ? ' ' + T('Las medias marginales ({m}) se compararon {a}.', { m: cita(['searle1980'], citas), a: (ajustes[r.medias[0].ajuste] || (() => ''))() }) : '');
    const frases = [];
    r.anova.termino.forEach((t, i) => {
      if (!Number.isFinite(r.anova.F[i]) || !Number.isFinite(r.anova.p[i])) return;
      const sig = r.anova.p[i] < (r.alfa || 0.05), e = `F(${r.anova.gl1[i]}, ${r.anova.gl2[i]}) = ${n2(r.anova.F[i])}; ${fp(r.anova.p[i])}`, nombre = String(t);
      frases.push(nombre.includes(':') ? (sig ? T('la interacción {t} fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }) : T('la interacción {t} no fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }))
        : (sig ? T('el efecto de {t} fue significativo ({e})', { t: nombre, e }) : T('el efecto de {t} no fue significativo ({e})', { t: nombre, e })));
    });
    const cor = r.correlacion && r.correlacion.valor.length === 1 ? T('La correlación estimada entre fechas de una misma unidad fue {v}.', { v: n3(r.correlacion.valor[0]) }) : '';
    return { metodos, resultados: [oracion(frases), cor].filter(Boolean).join(' ') };
  }

  /** Componentes de varianza, heredabilidad y repetibilidad (núcleo JS, REML). */
  function genetico(id, r, citas) {
    const reml = T('máxima verosimilitud restringida (REML; {c}) con el algoritmo de información promedio ({g})', { c: cita(['patterson1971'], citas), g: cita(['gilmour1995'], citas) });
    const prueba = T('Cada componente se probó con una prueba de razón de verosimilitudes restringidas contra el modelo sin él, con la distribución ½χ²₀ + ½χ²₁ porque una varianza no puede ser negativa ({c}).', { c: cita(['self1987'], citas) });
    const comps = r.componentes.filter(x => x.termino !== 'Residual'), resid = r.componentes.find(x => x.termino === 'Residual');
    const lrt = Object.fromEntries(r.lrt.map(x => [x.termino, x])), alfa = 0.05;
    const frasesLrt = comps.map(x => {
      const l = lrt[x.termino], e = l && l.chi2 > 0 ? T('χ² = {c}; {p}', { c: n2(l.chi2), p: fp(l.p) }) : T('en cero');
      return x.frontera ? T('la varianza de {t} se estimó en cero', { t: minuscula(r.etiqueta(x.termino)) })
        : (l && l.p < alfa ? T('la varianza de {t} fue significativa ({e})', { t: minuscula(r.etiqueta(x.termino)), e }) : T('la varianza de {t} no fue significativa ({e})', { t: minuscula(r.etiqueta(x.termino)), e }));
    });
    const lista0 = r.componentes.map(x => T('{t}, {v} ({p} %)', { t: minuscula(r.etiqueta(x.termino)), v: s4(x.sigma2), p: pct(x.porcentaje) }));
    if (id === 'componentes-varianza') {
      const metodos = T('Los componentes de varianza de {y} se estimaron por {m}, con {a} como efectos aleatorios{f}. ', { y: r.respuesta, m: reml,
        a: y(comps.map(x => minuscula(r.etiqueta(x.termino)))), f: r.fijos.length === 1 ? T(' y {x} como efecto fijo', { x: r.fijos[0] }) : r.fijos.length ? T(' y {x} como efectos fijos', { x: y(r.fijos) }) : '' }) + prueba;
      return { metodos, resultados: [T('Las varianzas estimadas (y su porcentaje de la varianza total) fueron: {l}.', { l: y(lista0) }), oracion(frasesLrt)].filter(Boolean).join(' ') };
    }
    if (id === 'heredabilidad') {
      const h = r.heredabilidad, S = r.seleccion;
      const dis = r.ambiente ? T('un ensayo en {k} ambientes, con los ambientes y las repeticiones dentro de ellos como efectos fijos y la interacción genotipo × ambiente como aleatoria', { k: r.nAmbientes })
        : r.bloque && r.repeticion ? T('bloques incompletos aleatorios dentro de repeticiones fijas') : r.bloque ? T('bloques incompletos aleatorios') : r.repeticion ? T('bloques completos al azar (fijos)') : T('un diseño completamente al azar');
      const metodos = T('Los componentes de varianza se estimaron por {m} en un modelo con {d} y los genotipos como efecto aleatorio. ', { m: reml, d: dis }) + prueba + ' ' +
        T('La heredabilidad en sentido amplio se calculó con base en medias de genotipos, con medias armónicas del número de parcelas{a} por genotipo ({c}), y también como la definen {cu} y {pm} ({sc}). ', {
          a: r.ambiente ? T(' y de ambientes') : '', c: cita(['holland2003'], citas), cu: cita(['cullis2006'], citas), pm: cita(['piepho2007'], citas), sc: cita(['schmidt2019'], citas) }) +
        T('Los valores genotípicos se predijeron por BLUP ({h}) y la ganancia esperada se calculó al seleccionar el {p} % de los genotipos con {d} valor ({f}).', {
          h: cita(['henderson1975'], citas), p: pct(100 * S.k / r.blup.length, 0), d: r.direccion === 'menor' ? T('menor') : T('mayor'), f: cita(['falconer1996'], citas) });
      const resultados = [T('Las varianzas estimadas fueron: {l}.', { l: y(lista0) }), oracion(frasesLrt),
        T('La heredabilidad en medias fue H² = {h} (EE = {e}); la de Cullis, {c}, y la de Piepho y Möhring, {p}. El coeficiente de variación genético fue {cg} % y el del error, {ce} %.', {
          h: n3(h.estandar), e: n3(h.ee), c: n3(h.cullis), p: n3(h.piepho), cg: pct(r.cvg, 2), ce: pct(r.cve, 2) }),
        T('Al seleccionar {k} de {n} genotipos ({g}), la ganancia esperada fue {d} ({dp} % de la media general).', { k: S.k, n: r.blup.length, g: y(S.seleccionados), d: s4(S.dg_blup), dp: pct(S.dg_blup_pct, 2) })];
      return { metodos, resultados: resultados.filter(Boolean).join(' ') };
    }
    const R = r.repetibilidad, n90 = r.necesarias.find(x => x.R2 === 0.9);
    const metodos = T('La repetibilidad de {y} se estimó como la correlación intraclase entre medidas del mismo individuo, r = σ²i / (σ²i + σ²e) ({f}), con los componentes de varianza por {m}{x}. ', {
      y: r.respuesta, f: cita(['falconer1996'], citas), m: reml, x: r.fijos.length === 1 ? T(', con {v} como efecto fijo', { v: r.fijos[0] }) : r.fijos.length ? T(', con {v} como efectos fijos', { v: y(r.fijos) }) : '' }) + prueba + ' ' +
      T('El número de medidas necesario para una determinación R² se calculó como η = R²(1 − r)/[(1 − R²)r] ({c}) y el valor permanente de cada individuo se predijo por BLUP ({h}).', {
        c: cita(['cruz2012'], citas), h: cita(['henderson1975'], citas) });
    const resultados = [T('La repetibilidad fue r = {r} (EE = {e}); con {m} medidas por individuo, la determinación fue R² = {R}.', { r: n3(R.r), e: n3(R.ee), m: n2(R.m), R: n3(R.R2) }),
      oracion(frasesLrt), n90 && Number.isFinite(n90.medidas) ? T('Para una determinación de 90 % se necesitan {k} medidas por individuo.', { k: Math.ceil(n90.medidas - 1e-9) }) : ''];
    return { metodos, resultados: resultados.filter(Boolean).join(' ') };
  }

  /** Modelos lineales generalizados (núcleo JS). */
  function generalizado(r, citas) {
    const FAM = { binomial: T('binomial'), cuasibinomial: T('cuasibinomial'), poisson: T('de Poisson'), cuasipoisson: T('cuasi-Poisson'), 'binomial-negativa': T('binomial negativa'), gamma: T('gamma') };
    const ENL = { logit: 'logit', probit: 'probit', cloglog: T('log-log complementario'), log: T('logarítmico'), inverso: T('inverso'), identidad: T('identidad') };
    const ref = r.familia === 'binomial-negativa' ? ['venables2002'] : /cuasi/.test(r.familia) ? ['wedderburn1974'] : [];
    const autoTxt = r.auto && !r.auto.binaria ? ' ' + (r.familia === r.auto.base ? T('La familia se eligió después de comprobar con la prueba de Pearson que no había sobredispersión (χ²/gl = {v}).', { v: n2(r.auto.razon) })
      : T('Se usó esta familia porque el modelo {b} mostró sobredispersión (Pearson χ²/gl = {v}; {p}).', { b: FAM[r.auto.base], v: n2(r.auto.razon), p: fp(r.auto.p) })) : '';
    const fija = r.prueba === 'chi2';
    const metodos = T('Se ajustó un modelo lineal generalizado ({c}) con distribución {f} y enlace {e}: {fm}.', { c: cita(['nelder1972', 'mccullagh1989'].concat(ref), citas), f: FAM[r.familia], e: ENL[r.enlace], fm: r.formula }) + autoTxt + ' ' +
      T('Los efectos se probaron con un análisis de devianza tipo {t} ({s}).', { t: ['', 'I', 'II', 'III'][r.tipoDev], s: fija ? T('razón de verosimilitudes, χ²') : T('prueba F con la dispersión estimada por Pearson') }) +
      (r.medias.length ? ' ' + T('Las medias marginales ({m}) se estimaron en la escala de la respuesta y se compararon {a}.', { m: cita(['lenth2016'], citas),
        a: ({ tukey: T('con la prueba de Tukey ({c})', { c: cita(['tukey1949'], citas) }), holm: T('con el ajuste de Holm ({c})', { c: cita(['holm1979'], citas) }), sidak: T('con el ajuste de Šidák ({c})', { c: cita(['sidak1967'], citas) }),
          bonferroni: T('con el ajuste de Bonferroni'), none: T('por pares sin ajuste') })[r.medias[0].ajuste] || '' }) : '');
    const frases = [];
    for (const x of r.devianza) {
      if (!Number.isFinite(x.p)) continue;
      const e = fija ? `χ²(${x.gl}) = ${n2(x.estadistico)}; ${fp(x.p)}` : `F(${x.gl}, ${r.ajuste.gl}) = ${n2(x.estadistico)}; ${fp(x.p)}`, nombre = x.termino;
      frases.push(nombre.includes(':') ? (x.p < (r.alfa || 0.05) ? T('la interacción {t} fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }) : T('la interacción {t} no fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }))
        : (x.p < (r.alfa || 0.05) ? T('el efecto de {t} fue significativo ({e})', { t: nombre, e }) : T('el efecto de {t} no fue significativo ({e})', { t: nombre, e })));
    }
    const ESC = { probabilidad: T('probabilidades'), tasa: T('tasas'), media: T('medias') };
    const medias = r.medias.filter(m => !m.dentro).map(m => {
      const fs = m.filas.slice().sort((p, q) => q.respuesta - p.respuesta), con = x => s4(x.respuesta) + (x.letras ? ' ' + x.letras : '');
      return fs.length <= 12 ? T('Las {e} estimadas de {f} fueron: {l} (niveles con la misma letra no difieren).', { e: ESC[m.escala], f: m.factor, l: fs.map(x => x.nivel + ', ' + con(x)).join('; ') })
        : T('La más alta de {f} fue {a} ({x}) y la más baja {b} ({z}).', { f: m.factor, a: fs[0].nivel, x: con(fs[0]), b: fs[fs.length - 1].nivel, z: con(fs[fs.length - 1]) });
    });
    const extra = r.familia === 'binomial-negativa' ? T('El parámetro de forma de la binomial negativa fue θ = {t} (EE = {e}).', { t: s4(r.theta), e: s4(r.ee_theta) })
      : !fija ? T('La dispersión estimada fue φ = {f}.', { f: s4(r.ajuste.dispersion) }) : '';
    return { metodos, resultados: [oracion(frases)].concat(medias, [extra]).filter(Boolean).join(' ') };
  }

  /** El párrafo de métodos y el de resultados de un análisis. */
  function parrafo(id, r, rep, e, op) {
    e = e || {}; op = op || {};
    const citas = new Set();
    let p = null;
    if (DISENOS[id]) p = diseno(id, r, rep, e, op, citas);
    else if (['comparaciones-medias', 'contrastes', 'polinomios', 'medias-ajustadas'].includes(id)) p = comparaciones(id, r, rep, e, op, citas);
    else if (id === 'prueba-t') p = pruebaT(r, e, citas);
    else if (['wilcoxon', 'kruskal-wallis', 'friedman'].includes(id)) p = rangos(id, r, rep, e, citas);
    else if (['regresion-lineal', 'regresion-polinomial', 'seleccion-pasos', 'mejores-subconjuntos'].includes(id)) p = regresion(id, r, rep, e, citas);
    else if (id === 'ancova') p = ancova(r, rep, e, citas);
    else if (['correlacion', 'matriz-correlacion', 'correlacion-parcial'].includes(id)) p = correlacion(id, r, e, citas);
    else if (['tabla-contingencia', 'mcnemar', 'mantel-haenszel', 'kappa'].includes(id)) p = contingencia(id, r, e, op, citas);
    else if (id === 'supuestos') p = supuestos(r, rep, citas);
    else if (id === 'modelo-lineal') p = modeloLineal(r, rep, citas);
    else if (id === 'modelo-mixto' || /^mixto-/.test(id)) p = mixto(r, rep, citas);
    else if (id === 'medidas-repetidas') p = repetidas(r, rep, citas);
    else if (['componentes-varianza', 'heredabilidad', 'repetibilidad'].includes(id)) p = genetico(id, r, citas);
    else if (['glm-conteos', 'glm-proporciones', 'glm-gamma', 'glm'].includes(id)) p = generalizado(r, citas);
    else p = explorar(id, r, rep, e, op, citas);
    if (!p) p = { metodos: '', resultados: (rep && rep.conclusiones || []).join(' ') };
    return { metodos: fin(p.metodos), resultados: fin(p.resultados), citas: [...citas] };
  }

  /** La frase del programa (va una vez, al final de los métodos); con los análisis, también el motor R si alguno lo usó. */
  function software(items) {
    const v = typeof globalThis !== 'undefined' && globalThis.SP_VALIDACION ? globalThis.SP_VALIDACION : null;
    const rv = v && v.referencias && v.referencias[0] ? (String(v.referencias[0]).match(/R version ([\d.]+)/) || [])[1] : '';
    const casos = v && v.resumen ? v.resumen.casos : null;
    const motor = (items || []).map(it => it && it.r && it.r.versiones).find(x => x && x.R);
    return {
      texto: T('Los análisis se hicieron con SigmaPro {v} ({c}), cuyos cálculos se validan contra R{r} ({rc}){k} con una tolerancia de 1 × 10⁻⁶.', {
        v: SP.VERSION, c: CITA.sigmapro, r: rv ? ' ' + rv : '', rc: CITA.rcore, k: casos ? T(' en {n} casos de prueba', { n: casos.toLocaleString('es-MX') }) : '' }) +
        (motor ? ' ' + T('Los análisis con paquetes de R se calcularon en R {r} dentro del propio navegador (webR {w}).', { r: motor.R, w: SP.motorR ? SP.motorR.CONFIG.version : '' }) : ''),
      citas: ['sigmapro', 'rcore'],
    };
  }

  /* ---------------- el documento ---------------- */
  /**
   * items: [{ titulo, id, e, op, r, rep, codigo, figuras: [{ titulo, descripcion, png?, anchoCm?, altoCm?, svg? }],
   *           supuestos?: { rep, r }, detalles: [[clave, valor]] }]
   * opciones: { titulo, autor, fecha (Date), datos (nombre del conjunto), n, conCodigo, conDetalles }
   */
  function bloques(items, opciones) {
    const o = Object.assign({ titulo: T('Reporte de análisis estadístico'), autor: '', conCodigo: true, conDetalles: true }, opciones || {});
    const out = [], citas = new Set();
    const fecha = (o.fecha || new Date()).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    out.push({ tipo: 'titulo', texto: o.titulo });
    out.push({ tipo: 'subtitulo', texto: T('Reporte LABG de SigmaPro') });
    if (o.autor) out.push({ tipo: 'portada', texto: o.autor });
    out.push({ tipo: 'portada', texto: fecha });
    if (o.datos) out.push({ tipo: 'portada', texto: T('Datos: {d}{n}', { d: o.datos, n: o.n ? T(' ({n} filas)', { n: o.n }) : '' }) });
    out.push({ tipo: 'portada', texto: T('Generado con SigmaPro {v}; cada cálculo se valida contra R.', { v: SP.VERSION }) });
    out.push({ tipo: 'salto' });
    const pars = items.map(it => parrafo(it.id, it.r, it.rep, it.e, it.op));
    pars.forEach(p => p.citas.forEach(c => citas.add(c)));
    /* 1. métodos */
    out.push({ tipo: 'encabezado', nivel: 1, texto: T('Métodos') });
    items.forEach((it, i) => { if (pars[i].metodos) out.push({ tipo: 'parrafo', texto: pars[i].metodos }); });
    const sw = software(items); sw.citas.forEach(c => citas.add(c));
    out.push({ tipo: 'parrafo', texto: sw.texto });
    /* 2. resultados, con cuadros y figuras numerados en orden */
    out.push({ tipo: 'encabezado', nivel: 1, texto: T('Resultados') });
    let nc = 0, nf = 0;
    items.forEach((it, i) => {
      out.push({ tipo: 'encabezado', nivel: 2, texto: (i + 1) + '. ' + it.titulo });
      if (it.rep && it.rep.conclusiones && it.rep.conclusiones.length) out.push({ tipo: 'conclusion', texto: it.rep.conclusiones.join(' ') });
      if (pars[i].resultados) out.push({ tipo: 'parrafo', texto: pars[i].resultados });
      for (const c of (it.rep && it.rep.cuadros) || []) {
        nc++;
        const k = SP.formatos.celdas(c, it.visibles);
        out.push({ tipo: 'cuadro', leyenda: { etiqueta: T('Cuadro'), numero: nc, texto: c.titulo, seq: 'Cuadro' }, cabecera: k.cabecera, filas: k.filas, numericas: k.numericas, totales: k.totales, notas: c.notas || [], cuadro: c });
      }
      for (const f of it.figuras || []) {
        nf++;
        out.push(Object.assign({ tipo: 'figura', leyenda: { etiqueta: T('Figura'), numero: nf, texto: f.titulo + (f.descripcion ? '. ' + f.descripcion : ''), seq: 'Figura' } }, f));
      }
      const sup = it.supuestos && it.supuestos.rep;
      const sem = (sup && sup.semaforo) || (it.rep && it.rep.semaforo);
      if (sem && sem.length) {
        out.push({ tipo: 'encabezado', nivel: 3, texto: T('Supuestos') });
        out.push({ tipo: 'semaforo', filas: sem.map(s => ({ color: s.color, nombre: s.nombre, texto: s.texto })) });
        const rec = (sup && sup.recomendaciones) || [];
        rec.forEach(t => out.push({ tipo: 'parrafo', texto: '• ' + t }));
      }
    });
    /* 3. referencias */
    out.push({ tipo: 'encabezado', nivel: 1, texto: T('Referencias') });
    [...citas].map(k => ({ k, t: referencia(k) })).filter(x => x.t).sort((a, b) => a.t.localeCompare(b.t, 'es')).forEach(x => out.push({ tipo: 'referencia', texto: x.t }));
    /* anexos */
    if (o.conDetalles) {
      out.push({ tipo: 'salto' });
      out.push({ tipo: 'encabezado', nivel: 1, texto: T('Anexo A. Detalles técnicos') });
      items.forEach((it, i) => {
        out.push({ tipo: 'encabezado', nivel: 3, texto: (i + 1) + '. ' + it.titulo });
        (it.detalles || []).forEach(([k, v]) => out.push({ tipo: 'parrafo', trozos: [{ texto: k + ': ', negrita: true }, { texto: v }] }));
      });
    }
    if (o.conCodigo) {
      out.push({ tipo: 'encabezado', nivel: 1, texto: T('Anexo B. Código R equivalente') });
      out.push({ tipo: 'parrafo', texto: T('Cada análisis se puede repetir en R con este código (los datos, en un archivo «datos.csv» con las mismas columnas).') });
      items.forEach((it, i) => { out.push({ tipo: 'encabezado', nivel: 3, texto: (i + 1) + '. ' + it.titulo }); out.push({ tipo: 'codigo', texto: it.codigo || '' }); });
    }
    return out;
  }

  /* ---------------- página HTML ---------------- */
  const escH = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ESTILO = `
    :root { color-scheme: light; }
    body { font: 11.5pt/1.5 "Times New Roman", Times, serif; color: #17150F; background: #fff; margin: 0; }
    main { max-width: 17cm; margin: 0 auto; padding: 1.5cm 1.2cm 2cm; }
    h1.titulo { font-size: 22pt; text-align: center; margin: 3cm 0 .4cm; } p.subtitulo { text-align: center; font-size: 14pt; margin: 0 0 1cm; }
    p.portada { text-align: center; margin: .15cm 0; }
    h2 { font-size: 15pt; margin: 1cm 0 .3cm; } h3 { font-size: 12.5pt; margin: .7cm 0 .2cm; } h4 { font-size: 11.5pt; font-style: italic; margin: .5cm 0 .15cm; }
    p { text-align: justify; margin: 0 0 .25cm; } p.conclusion { border-left: 3px solid #9C7128; padding: .1cm .3cm; background: #FAF6EC; text-align: left; }
    figure { margin: .4cm 0 .5cm; text-align: center; break-inside: avoid; } figure svg, figure img { max-width: 100%; height: auto; }
    figcaption, caption { font-size: 10pt; text-align: left; caption-side: top; margin: 0 0 .1cm; } figcaption b, caption b { font-weight: bold; }
    table.revista { border-collapse: collapse; margin: .3cm 0 .1cm; font-size: 9.5pt; border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; break-inside: avoid; }
    table.revista th, table.revista td { padding: 2px 8px; text-align: right; } table.revista .izq { text-align: left; }
    table.revista thead th { border-bottom: 1px solid #000; } table.revista tr.total td, table.revista tr.total th { border-top: 1px solid #000; font-weight: bold; }
    .nota { font-size: 9pt; margin: 0 0 .1cm; } pre { font: 8.5pt/1.35 "Courier New", monospace; white-space: pre-wrap; background: #F6F4EF; padding: .2cm .3cm; }
    ul.semaforo { list-style: none; padding: 0; margin: 0 0 .3cm; font-size: 10pt; } ul.semaforo li { margin: .08cm 0; }
    .luz { display: inline-block; width: .3cm; height: .3cm; border-radius: 50%; margin-right: .15cm; vertical-align: -1px; border: 1px solid #555; }
    .s-verde { background: #2E7D32; } .s-ambar { background: #E0A100; } .s-rojo { background: #C62828; } .s-gris { background: #fff; }
    p.referencia { padding-left: 1cm; text-indent: -1cm; text-align: left; }
    .salto { break-after: page; height: 0; }
    @page { size: letter; margin: 2cm; }
    @media print { main { padding: 0; max-width: none; } h2, h3, h4 { break-after: avoid; } }`;
  const ETIQUETA_SEM = { verde: 'Bien', ambar: 'Revisar', rojo: 'Problema', gris: 'No aplica' };
  function html(bs, opciones) {
    const o = opciones || {};
    const partes = bs.map(b => {
      switch (b.tipo) {
        case 'titulo': return `<h1 class="titulo">${escH(b.texto)}</h1>`;
        case 'subtitulo': return `<p class="subtitulo">${escH(b.texto)}</p>`;
        case 'portada': return `<p class="portada">${escH(b.texto)}</p>`;
        case 'salto': return '<div class="salto"></div>';
        case 'encabezado': return `<h${b.nivel + 1}>${escH(b.texto)}</h${b.nivel + 1}>`;
        case 'conclusion': return `<p class="conclusion">${escH(b.texto)}</p>`;
        case 'parrafo': return `<p>${b.trozos ? b.trozos.map(t => (t.negrita ? `<b>${escH(t.texto)}</b>` : t.cursiva ? `<i>${escH(t.texto)}</i>` : escH(t.texto))).join('') : escH(b.texto)}</p>`;
        case 'referencia': return `<p class="referencia">${escH(b.texto)}</p>`;
        case 'codigo': return `<pre>${escH(b.texto)}</pre>`;
        case 'semaforo': return `<ul class="semaforo">${b.filas.map(s => `<li><span class="luz s-${s.color}" aria-hidden="true"></span><b>${escH(s.nombre)}</b> — ${escH(T(ETIQUETA_SEM[s.color] || ''))}: ${escH(s.texto)}</li>`).join('')}</ul>`;
        case 'cuadro': {
          const cab = b.cabecera.map((h, j) => `<th scope="col" class="${b.numericas[j] ? '' : 'izq'}">${escH(h)}</th>`).join('');
          const filas = b.filas.map((f, i) => `<tr${b.totales && b.totales[i] ? ' class="total"' : ''}>` + f.map((v, j) => `<td class="${b.numericas[j] ? '' : 'izq'}">${escH(v)}</td>`).join('') + '</tr>').join('');
          return `<table class="revista"><caption><b>${escH(b.leyenda.etiqueta)} ${b.leyenda.numero}.</b> ${escH(b.leyenda.texto)}</caption><thead><tr>${cab}</tr></thead><tbody>${filas}</tbody></table>`
            + (b.notas || []).map(n => `<p class="nota">${escH(n)}</p>`).join('');
        }
        case 'figura': {
          const img = b.svg || (b.imagenUrl ? `<img src="${b.imagenUrl}" alt="${escH(b.alt || b.titulo)}">` : '');
          return `<figure>${img}<figcaption><b>${escH(b.leyenda.etiqueta)} ${b.leyenda.numero}.</b> ${escH(b.leyenda.texto)}</figcaption></figure>`;
        }
        default: return '';
      }
    });
    return `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator" content="SigmaPro ${escH(SP.VERSION)}">`
      + `<title>${escH(o.titulo || T('Reporte de análisis estadístico'))}</title><style>${ESTILO.replace(/size: letter/, 'size: ' + (o.hoja === 'a4' ? 'A4' : 'letter'))}</style></head><body><main>${partes.join('\n')}</main></body></html>`;
  }

  SP.informe = { parrafo, software, referencia, bloques, html, frasesAnova, REFERENCIAS: Object.keys(REF) };
});

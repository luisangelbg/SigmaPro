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
    sigmapro: () => T('Barrera-Guzmán, L. Á. (2026). SigmaPro: estadística para la investigación agronómica y biológica (versión {v}) [Programa de cómputo]. LABG Suite.', { v: SP.VERSION }),
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
    cohen1968: () => 'Cohen, J. (1968). Weighted kappa: Nominal scale agreement provision for scaled disagreement or partial credit. Psychological Bulletin, 70(4), 213–220.',
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
    firth1993: () => 'Firth, D. (1993). Bias reduction of maximum likelihood estimates. Biometrika, 80(1), 27–38.',
    heinze2002: () => 'Heinze, G. y Schemper, M. (2002). A solution to the problem of separation in logistic regression. Statistics in Medicine, 21(16), 2409–2419.',
    venzon1988: () => 'Venzon, D. J. y Moolgavkar, S. H. (1988). A method for computing profile-likelihood-based confidence intervals. Journal of the Royal Statistical Society C (Applied Statistics), 37(1), 87–94.',
    pinheiro1995: () => 'Pinheiro, J. C. y Bates, D. M. (1995). Approximations to the log-likelihood function in the nonlinear mixed-effects model. Journal of Computational and Graphical Statistics, 4(1), 12–35.',
    mccullagh1989: () => 'McCullagh, P. y Nelder, J. A. (1989). Generalized linear models (2.ª ed.). Chapman and Hall.',
    venables2002: () => 'Venables, W. N. y Ripley, B. D. (2002). Modern applied statistics with S (4.ª ed.). Springer.',
    wedderburn1974: () => 'Wedderburn, R. W. M. (1974). Quasi-likelihood functions, generalized linear models, and the Gauss-Newton method. Biometrika, 61(3), 439–447.',
    lenth2016: () => 'Lenth, R. V. (2016). Least-squares means: the R package lsmeans. Journal of Statistical Software, 69(1), 1–33.',
    bolker2009: () => 'Bolker, B. M., Brooks, M. E., Clark, C. J., Geange, S. W., Poulsen, J. R., Stevens, M. H. H. y White, J.-S. S. (2009). Generalized linear mixed models: a practical guide for ecology and evolution. Trends in Ecology and Evolution, 24(3), 127–135.',
    harrison2014: () => 'Harrison, X. A. (2014). Using observation-level random effects to model overdispersion in count data in ecology and evolution. PeerJ, 2, e616.',
    fox2019: () => 'Fox, J. y Weisberg, S. (2019). An R companion to applied regression (3.ª ed.). Sage.',
    bates1988: () => 'Bates, D. M. y Watts, D. G. (1988). Nonlinear regression analysis and its applications. Wiley.',
    archontoulis2015: () => 'Archontoulis, S. V. y Miguez, F. E. (2015). Nonlinear regression models and applications in agricultural research. Agronomy Journal, 107(2), 786–798.',
    ritz2015: () => 'Ritz, C., Baty, F., Streibig, J. C. y Gerhard, D. (2015). Dose-response analysis using R. PLoS ONE, 10(12), e0146021.',
    seefeldt1995: () => 'Seefeldt, S. S., Jensen, J. E. y Fuerst, E. P. (1995). Log-logistic analysis of herbicide dose-response relationships. Weed Technology, 9(2), 218–227.',
    cerrato1990: () => 'Cerrato, M. E. y Blackmer, A. M. (1990). Comparison of models for describing corn yield response to nitrogen fertilizer. Agronomy Journal, 82(1), 138–143.',
    brain1989: () => 'Brain, P. y Cousens, R. (1989). An equation to describe dose responses where there is stimulation of growth at low doses. Weed Research, 29(2), 93–96.',
    michaelis1913: () => 'Michaelis, L. y Menten, M. L. (1913). Die Kinetik der Invertinwirkung. Biochemische Zeitschrift, 49, 333–369.',
    box1951: () => 'Box, G. E. P. y Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society B, 13(1), 1–45.',
    myers2016: () => 'Myers, R. H., Montgomery, D. C. y Anderson-Cook, C. M. (2016). Response surface methodology: process and product optimization using designed experiments (4.ª ed.). Wiley.',
    box1957: () => 'Box, G. E. P. y Hunter, J. S. (1957). Multi-factor experimental designs for exploring response surfaces. The Annals of Mathematical Statistics, 28(1), 195–241.',
    box1960: () => 'Box, G. E. P. y Behnken, D. W. (1960). Some new three level designs for the study of quantitative variables. Technometrics, 2(4), 455–475.',
    scheffe1958: () => 'Scheffé, H. (1958). Experiments with mixtures. Journal of the Royal Statistical Society B, 20(2), 344–360.',
    cornell2002: () => 'Cornell, J. A. (2002). Experiments with mixtures: designs, models, and the analysis of mixture data (3.ª ed.). Wiley.',
    derringer1980: () => 'Derringer, G. y Suich, R. (1980). Simultaneous optimization of several response variables. Journal of Quality Technology, 12(4), 214–219.',
    nelder1965: () => 'Nelder, J. A. y Mead, R. (1965). A simplex method for function minimization. The Computer Journal, 7(4), 308–313.',
    hoerl1959: () => 'Hoerl, A. E. (1959). Optimum solution of many variables equations. Chemical Engineering Progress, 55, 69–78.',
    draper1963: () => 'Draper, N. R. (1963). «Ridge analysis» of response surfaces. Technometrics, 5(4), 469–479.',
    bartlett1937: () => 'Bartlett, M. S. (1937). Properties of sufficiency and statistical tests. Proceedings of the Royal Society of London A, 160(901), 268–282.',
    finlay1963: () => 'Finlay, K. W. y Wilkinson, G. N. (1963). The analysis of adaptation in a plant-breeding programme. Australian Journal of Agricultural Research, 14(6), 742–754.',
    eberhart1966: () => 'Eberhart, S. A. y Russell, W. A. (1966). Stability parameters for comparing varieties. Crop Science, 6(1), 36–40.',
    wricke1962: () => 'Wricke, G. (1962). Über eine Methode zur Erfassung der ökologischen Streubreite in Feldversuchen. Zeitschrift für Pflanzenzüchtung, 47, 92–96.',
    shukla1972: () => 'Shukla, G. K. (1972). Some statistical aspects of partitioning genotype-environmental components of variability. Heredity, 29(2), 237–245.',
    lin1988: () => 'Lin, C. S. y Binns, M. R. (1988). A superiority measure of cultivar performance for cultivar × location data. Canadian Journal of Plant Science, 68(1), 193–198.',
    gauch1988: () => 'Gauch, H. G. (1988). Model selection and validation for yield trials with interaction. Biometrics, 44(3), 705–715.',
    gollob1968: () => 'Gollob, H. F. (1968). A statistical model which combines features of factor analytic and analysis of variance techniques. Psychometrika, 33(1), 73–115.',
    cornelius1992: () => 'Cornelius, P. L., Seyedsadr, M. y Crossa, J. (1992). Using the shifted multiplicative model to search for «separability» in crop cultivar trials. Theoretical and Applied Genetics, 84(1–2), 161–172.',
    purchase2000: () => 'Purchase, J. L., Hatting, H. y van Deventer, C. S. (2000). Genotype × environment interaction of winter wheat (Triticum aestivum L.) in South Africa: II. Stability analysis of yield performance. South African Journal of Plant and Soil, 17(3), 101–107.',
    yan2000: () => 'Yan, W., Hunt, L. A., Sheng, Q. y Szlavnics, Z. (2000). Cultivar evaluation and mega-environment investigation based on the GGE biplot. Crop Science, 40(3), 597–605.',
    gauch1990: () => 'Gauch, H. G. y Zobel, R. W. (1990). Imputing missing yield trial data. Theoretical and Applied Genetics, 79(6), 753–761.',
    nassar1987: () => 'Nassar, R. y Huehn, M. (1987). Studies on estimation of phenotypic stability: tests of significance for nonparametric measures of phenotypic stability. Biometrics, 43(1), 45–53.',
    huehn1990: () => 'Huehn, M. (1990). Nonparametric measures of phenotypic stability. Part 1: Theory. Euphytica, 47(3), 189–194.',
    kang1993: () => 'Kang, M. S. (1993). Simultaneous selection for yield and stability in crop performance trials: consequences for growers. Agronomy Journal, 85(3), 754–757.',
    annicchiarico1992: () => 'Annicchiarico, P. (1992). Cultivar adaptation and recommendation from alfalfa trials in Northern Italy. Journal of Genetics and Breeding, 46, 269–278.',
    olivoto2019: () => 'Olivoto, T., Lúcio, A. D. C., da Silva, J. A. G., Marchioro, V. S., de Souza, V. Q. y Jost, E. (2019). Mean performance and stability in multi-environment trials I: combining features of AMMI and BLUP techniques. Agronomy Journal, 111(6), 2949–2960.',
    yan2006: () => 'Yan, W. y Tinker, N. A. (2006). Biplot analysis of multi-environment trial data: principles and applications. Canadian Journal of Plant Science, 86(3), 623–645.',
    smith2001: () => 'Smith, A., Cullis, B. y Gilmour, A. (2001). The analysis of crop variety evaluation data in Australia. Australian and New Zealand Journal of Statistics, 43(2), 129–145.',
    piepho2012: () => 'Piepho, H.-P., Möhring, J., Schulz-Streeck, T. y Ogutu, J. O. (2012). A stage-wise approach for the analysis of multi-environment trials. Biometrical Journal, 54(6), 844–860.',
    yan2003: () => 'Yan, W. y Kang, M. S. (2003). GGE biplot analysis: a graphical tool for breeders, geneticists, and agronomists. CRC Press.',
    cohen1988: () => 'Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2.ª ed.). Lawrence Erlbaum.',
    cochranCox1957: () => 'Cochran, W. G. y Cox, G. M. (1957). Experimental designs (2.ª ed.). Wiley.',
    /* las que citan las notas de los cuadros y las conclusiones (no los párrafos); el documento las recoge de ahí */
    agresti2002: () => 'Agresti, A. (2002). Categorical data analysis (2.ª ed.). Wiley.',
    belsley1980: () => 'Belsley, D. A., Kuh, E. y Welsch, R. E. (1980). Regression diagnostics: identifying influential data and sources of collinearity. Wiley.',
    fleiss1969: () => 'Fleiss, J. L., Cohen, J. y Everitt, B. S. (1969). Large sample standard errors of kappa and weighted kappa. Psychological Bulletin, 72(5), 323–327.',
    hyndman1996: () => 'Hyndman, R. J. y Fan, Y. (1996). Sample quantiles in statistical packages. The American Statistician, 50(4), 361–365.',
    joanes1998: () => 'Joanes, D. N. y Gill, C. A. (1998). Comparing measures of sample skewness and kurtosis. Journal of the Royal Statistical Society D, 47(1), 183–189.',
    landis1977: () => 'Landis, J. R. y Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159–174.',
    steiger1997: () => 'Steiger, J. H. y Fouladi, R. T. (1997). Noncentrality interval estimation and the evaluation of statistical models. En L. L. Harlow, S. A. Mulaik y J. H. Steiger (eds.), What if there were no significance tests? (pp. 221–257). Lawrence Erlbaum.',
    champely2020: () => 'Champely, S. (2020). pwr: basic functions for power analysis (versión 1.3-0) [paquete de R].',
    cochran1977: () => 'Cochran, W. G. (1977). Sampling techniques (3.ª ed.). Wiley.',
    kaplan1958: () => 'Kaplan, E. L. y Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association, 53(282), 457–481.',
    greenwood1926: () => 'Greenwood, M. (1926). The natural duration of cancer. Reports on Public Health and Medical Subjects, 33, 1–26.',
    mantel1966: () => 'Mantel, N. (1966). Evaluation of survival data and two new rank order statistics arising in its consideration. Cancer Chemotherapy Reports, 50(3), 163–170.',
    peto1972: () => 'Peto, R. y Peto, J. (1972). Asymptotically efficient rank invariant test procedures. Journal of the Royal Statistical Society A, 135(2), 185–207.',
    cox1972: () => 'Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B, 34(2), 187–220.',
    efron1977: () => 'Efron, B. (1977). The efficiency of Cox\'s likelihood function for censored data. Journal of the American Statistical Association, 72(359), 557–565.',
    breslow1974: () => 'Breslow, N. (1974). Covariance analysis of censored survival data. Biometrics, 30(1), 89–99.',
    grambsch1994: () => 'Grambsch, P. M. y Therneau, T. M. (1994). Proportional hazards tests and diagnostics based on weighted residuals. Biometrika, 81(3), 515–526.',
    harrell1982: () => 'Harrell, F. E., Califf, R. M., Pryor, D. B., Lee, K. L. y Rosati, R. A. (1982). Evaluating the yield of medical tests. JAMA, 247(18), 2543–2546.',
    therneau2024: () => 'Therneau, T. M. (2024). A package for survival analysis in R (versión 3.7-0) [paquete de R].',
    box1970: () => 'Box, G. E. P. y Pierce, D. A. (1970). Distribution of residual autocorrelations in autoregressive-integrated moving average time series models. Journal of the American Statistical Association, 65(332), 1509–1526.',
    ljung1978: () => 'Ljung, G. M. y Box, G. E. P. (1978). On a measure of lack of fit in time series models. Biometrika, 65(2), 297–303.',
    kendall1983: () => 'Kendall, M. y Stuart, A. (1983). The advanced theory of statistics, vol. 3 (4.ª ed.). Griffin.',
    mann1945: () => 'Mann, H. B. (1945). Nonparametric tests against trend. Econometrica, 13(3), 245–259.',
    kendall1975: () => 'Kendall, M. G. (1975). Rank correlation methods (4.ª ed.). Griffin.',
    sen1968: () => 'Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall\'s tau. Journal of the American Statistical Association, 63(324), 1379–1389.',
    pohlert2023: () => 'Pohlert, T. (2023). trend: non-parametric trend tests and change-point detection (versión 1.1.8) [paquete de R].',
    pillai1955: () => 'Pillai, K. C. S. (1955). Some new test criteria in multivariate analysis. The Annals of Mathematical Statistics, 26(1), 117–121.',
    wilks1932: () => 'Wilks, S. S. (1932). Certain generalizations in the analysis of variance. Biometrika, 24(3–4), 471–494.',
    hotelling1951: () => 'Hotelling, H. (1951). A generalized T test and measure of multivariate dispersion. En J. Neyman (ed.), Proceedings of the Second Berkeley Symposium on Mathematical Statistics and Probability (pp. 23–41). University of California Press.',
    roy1953: () => 'Roy, S. N. (1953). On a heuristic method of test construction and its use in multivariate analysis. The Annals of Mathematical Statistics, 24(2), 220–238.',
    fisher1936: () => 'Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. Annals of Eugenics, 7(2), 179–188.',
    box1949: () => 'Box, G. E. P. (1949). A general distribution theory for a class of likelihood criteria. Biometrika, 36(3–4), 317–346.',
    box1976: () => 'Box, G. E. P. y Jenkins, G. M. (1976). Time series analysis: forecasting and control (ed. revisada). Holden-Day.',
    gardner1980: () => 'Gardner, G., Harvey, A. C. y Phillips, G. D. A. (1980). Algorithm AS 154: an algorithm for exact maximum likelihood estimation of autoregressive-moving average models by means of Kalman filtering. Applied Statistics, 29(3), 311–322.',
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
    firth1993: 'Firth, 1993', heinze2002: 'Heinze y Schemper, 2002', venzon1988: 'Venzon y Moolgavkar, 1988', pinheiro1995: 'Pinheiro y Bates, 1995',
    wedderburn1974: 'Wedderburn, 1974', lenth2016: 'Lenth, 2016', bolker2009: 'Bolker et al., 2009', harrison2014: 'Harrison, 2014', fox2019: 'Fox y Weisberg, 2019',
    bates1988: 'Bates y Watts, 1988', archontoulis2015: 'Archontoulis y Miguez, 2015', ritz2015: 'Ritz et al., 2015', seefeldt1995: 'Seefeldt et al., 1995', cerrato1990: 'Cerrato y Blackmer, 1990', brain1989: 'Brain y Cousens, 1989', michaelis1913: 'Michaelis y Menten, 1913',
    box1951: 'Box y Wilson, 1951', myers2016: 'Myers et al., 2016', box1957: 'Box y Hunter, 1957', box1960: 'Box y Behnken, 1960', scheffe1958: 'Scheffé, 1958',
    cornell2002: 'Cornell, 2002', derringer1980: 'Derringer y Suich, 1980', nelder1965: 'Nelder y Mead, 1965', hoerl1959: 'Hoerl, 1959', draper1963: 'Draper, 1963',
    bartlett1937: 'Bartlett, 1937', finlay1963: 'Finlay y Wilkinson, 1963', eberhart1966: 'Eberhart y Russell, 1966', wricke1962: 'Wricke, 1962', shukla1972: 'Shukla, 1972',
    lin1988: 'Lin y Binns, 1988', gauch1988: 'Gauch, 1988', gollob1968: 'Gollob, 1968', cornelius1992: 'Cornelius et al., 1992', purchase2000: 'Purchase et al., 2000',
    yan2000: 'Yan et al., 2000', yan2003: 'Yan y Kang, 2003', gauch1990: 'Gauch y Zobel, 1990', nassar1987: 'Nassar y Huehn, 1987', huehn1990: 'Huehn, 1990',
    kang1993: 'Kang, 1993', annicchiarico1992: 'Annicchiarico, 1992', olivoto2019: 'Olivoto et al., 2019', yan2006: 'Yan y Tinker, 2006', smith2001: 'Smith et al., 2001', piepho2012: 'Piepho et al., 2012', cohen1988: 'Cohen, 1988', cochranCox1957: 'Cochran y Cox, 1957', agresti2002: 'Agresti, 2002', belsley1980: 'Belsley et al., 1980', fleiss1969: 'Fleiss et al., 1969',
    hyndman1996: 'Hyndman y Fan, 1996', joanes1998: 'Joanes y Gill, 1998', landis1977: 'Landis y Koch, 1977', steiger1997: 'Steiger y Fouladi, 1997', champely2020: 'Champely, 2020', cochran1977: 'Cochran, 1977',
    kaplan1958: 'Kaplan y Meier, 1958', greenwood1926: 'Greenwood, 1926', mantel1966: 'Mantel, 1966', peto1972: 'Peto y Peto, 1972', cox1972: 'Cox, 1972',
    efron1977: 'Efron, 1977', breslow1974: 'Breslow, 1974', grambsch1994: 'Grambsch y Therneau, 1994', harrell1982: 'Harrell et al., 1982', therneau2024: 'Therneau, 2024',
    box1970: 'Box y Pierce, 1970', ljung1978: 'Ljung y Box, 1978', kendall1983: 'Kendall y Stuart, 1983', mann1945: 'Mann, 1945', kendall1975: 'Kendall, 1975', sen1968: 'Sen, 1968', pohlert2023: 'Pohlert, 2023',
    pillai1955: 'Pillai, 1955', wilks1932: 'Wilks, 1932', hotelling1951: 'Hotelling, 1951', roy1953: 'Roy, 1953', fisher1936: 'Fisher, 1936', box1949: 'Box, 1949', box1976: 'Box y Jenkins, 1976', gardner1980: 'Gardner et al., 1980',
  };
  /** En inglés, las citas y las referencias en el estilo APA inglés: «and» y «&» entre autores, «2nd ed.», «In», «[R package]». */
  const ORD = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: '8th' };
  const refIdioma = s => (SP.IDIOMA !== 'en' ? s : s.replace(/^([^(]*?) y /, '$1, & ').replace(/\((\d)\.ª ed\.\)/g, (m, d) => '(' + (ORD[d] || d + 'th') + ' ed.)')
    .replace(/\. En ([^(]*?) y /, '. In $1, & ').replace(/\. En /, '. In ').replace(/\[Tesis doctoral\]/, '[Doctoral dissertation]').replace(/\[Programa de cómputo\]/, '[Computer software]')
    .replace(/\[paquete de R\]/, '[R package]').replace(/\(versión /, '(version ').replace('SigmaPro: estadística para la investigación agronómica y biológica', 'SigmaPro: Statistics for agronomic and biological research'));
  const citaDe = k => (SP.IDIOMA === 'en' ? String(CITA[k] || '').replace(/ y /g, ' and ').replace(/ y col\./g, ' et al.') : CITA[k]);
  const referencia = k => (REF[k] ? refIdioma(REF[k]()) : '');
  /* Encuentra en un texto las obras de CITA, escritas como las escriben los métodos: «Landis y Koch (1977)»,
     «(Cochran y Cox, 1957)», «Holland y col. 2003», «Brown, Cai y DasGupta (2001)», «Agresti-Coull (1998)». Para cada
     obra, el primer apellido y el año; entre ellos, lo que corresponde a uno, dos o más autores (uno solo no acepta un
     segundo apellido: «Cochran y Cox, 1957» no es «Cochran, 1957»). */
  const escRE = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let patrones = null;
  function citasEnTexto(texto, citas) {
    if (!texto) return;
    if (!patrones) patrones = Object.entries(CITA).map(([k, c]) => {
      const i = c.lastIndexOf(', '), autores = c.slice(0, i), anio = escRE(c.slice(i + 2)), primero = escRE(autores.split(/[ ,]/)[0]);
      const medio = / et al\.$/.test(autores) ? '(?: y col\\.| et al\\.|,[^;()0-9]{1,60}?)'
        : / y /.test(autores) ? '(?: y | and | & |-)' + escRE(autores.split(' y ').pop()) : '';
      return [k, new RegExp('(?<![\\p{L}])' + primero + medio + '\\s?,?\\s?\\(?' + anio + '(?![0-9a-z])', 'u')];
    });
    for (const [k, re] of patrones) if (re.test(texto)) citas.add(k);
  }

  /* ---------------- formato de la estadística en el texto ---------------- */
  const n2 = x => F.texto(x, 'forma2'), n3 = x => F.texto(x, 'forma'), s4 = x => F.texto(x, 'sig');
  const gl = g => (Number.isInteger(g) ? String(g) : F.fijo(g, 2));
  const fp = p => (!Number.isFinite(p) ? 'p = —' : p < 0.001 ? 'p < 0.001' : 'p = ' + F.fijo(p, 3));
  const pct = (x, d) => F.fijo(x, d === undefined ? 1 : d);
  const y = xs => (xs.length <= 1 ? (xs[0] || '') : xs.slice(0, -1).join(', ') + T(' y ') + xs[xs.length - 1]);
  const ic = (a, nivel, fmt) => (Array.isArray(a) && (Number.isFinite(a[0]) || Number.isFinite(a[1])) ? T('IC {n} %: {a} a {b}', { n: Math.round(100 * (nivel || 0.95)), a: (fmt || s4)(a[0]), b: (fmt || s4)(a[1]) }) : '');
  const entre = s => (s ? ' (' + s + ')' : '');
  const minuscula = s => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  /* cita narrativa: «Satterthwaite (1946)» */
  const narrativa = (k, citas) => { citas.add(k); const c = citaDe(k) || ''; const i = c.lastIndexOf(', '); return i > 0 ? c.slice(0, i) + ' (' + c.slice(i + 2) + ')' : c; };
  const lista = v => [].concat(v || []).filter(Boolean);
  const fin = s => (s && !/[.!?]$/.test(s.trim()) ? s.trim() + '.' : (s || '').trim());
  const cita = (claves, citas) => { claves.forEach(k => citas.add(k)); return claves.map(citaDe).join('; '); };
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
    dca: T('completamente al azar'), dbca: T('de bloques completos al azar'), 'cuadro-latino': T('en cuadro latino'), 'parcelas-divididas': T('de parcelas divididas'),
    'parcelas-subdivididas': T('de parcelas subdivididas'), franjas: T('de parcelas en franjas'), bib: T('de bloques incompletos balanceados'), latice: T('en látice'),
  };
  const COMPARACION = {
    tukey: [T('la prueba de Tukey'), ['tukey1949']], dms: [T('la diferencia mínima significativa de Fisher'), []], duncan: [T('la prueba de rango múltiple de Duncan'), ['duncan1955']],
    snk: [T('la prueba de Student-Newman-Keuls'), []], scheffe: [T('el método de Scheffé'), ['scheffe1953']], bonferroni: [T('pruebas t con la corrección de Bonferroni'), []],
    sidak: [T('pruebas t con la corrección de Šidák'), ['sidak1967']], holm: [T('pruebas t con el ajuste de Holm'), ['holm1979']], dunnett: [T('la prueba de Dunnett contra el testigo'), ['dunnett1955']],
    'games-howell': [T('la prueba de Games-Howell'), ['games1976']],
  };
  const AJUSTE = { holm: [T('el método de Holm'), ['holm1979']], bonferroni: [T('la corrección de Bonferroni'), []], BH: [T('el método de Benjamini y Hochberg'), ['benjamini1995']], none: [T('ningún ajuste'), []] };
  const POSTHOC = { dunn: [T('la prueba de Dunn'), ['dunn1964']], conover: [T('la prueba de Conover-Iman'), ['conover1979']], nemenyi: [T('la prueba de Nemenyi'), ['nemenyi1963']], wilcoxon: [T('pruebas de Wilcoxon pareadas'), ['wilcoxon1945']] };
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
    const FAM = { binomial: T('binomial'), cuasibinomial: T('cuasibinomial'), poisson: T('de Poisson'), cuasipoisson: T('cuasi-Poisson'), 'binomial-negativa': T('binomial negativa'), gamma: T('gamma'),
      'inversa-gaussiana': T('gaussiana inversa') };
    const ENL = { logit: 'logit', probit: 'probit', cloglog: T('log-log complementario'), log: T('logarítmico'), inverso: T('inverso'), identidad: T('identidad'), raiz: T('raíz cuadrada'), inverso2: '1/μ²',
      potencia: T('de potencia (μ^{l})', { l: r.lambda }) };
    const ref = r.familia === 'binomial-negativa' ? ['venables2002'] : /cuasi/.test(r.familia) ? ['wedderburn1974'] : [];
    const autoTxt = r.auto && !r.auto.binaria ? ' ' + (r.familia === r.auto.base ? T('La familia se eligió después de comprobar con la prueba de Pearson que no había sobredispersión (χ²/gl = {v}).', { v: n2(r.auto.razon) })
      : T('Se usó esta familia porque el modelo {b} mostró sobredispersión (Pearson χ²/gl = {v}; {p}).', { b: FAM[r.auto.base], v: n2(r.auto.razon), p: fp(r.auto.p) })) : '';
    const fija = r.prueba !== 'F';
    const metodos = T('Se ajustó un modelo lineal generalizado ({c}) con distribución {f} y enlace {e}: {fm}.', { c: cita(['nelder1972', 'mccullagh1989'].concat(ref), citas), f: FAM[r.familia], e: ENL[r.enlace], fm: r.formula }) + autoTxt + ' ' +
      (r.firth ? T('Para evitar el sesgo y la separación (grupos con 0 % o 100 %), los coeficientes se estimaron por máxima verosimilitud penalizada ({c}); sus pruebas son de razón de verosimilitudes penalizadas y sus intervalos, del perfil penalizado.', { c: cita(['firth1993', 'heinze2002'], citas) }) + ' ' : '') +
      (!r.firth && r.intervalo === 'perfil' ? T('Los intervalos de confianza de los coeficientes se obtuvieron por verosimilitud perfilada ({c}).', { c: cita(['venzon1988'], citas) }) + ' ' : '') +
      T('Los efectos se probaron con un análisis de devianza tipo {t} ({s}).', { t: ['', 'I', 'II', 'III'][r.tipoDev], s: r.firth ? T('razón de verosimilitudes penalizadas, χ²') : fija ? T('razón de verosimilitudes, χ²') : T('prueba F con la dispersión estimada por Pearson') }) +
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

  /** Modelos lineales generalizados mixtos (motor R). */
  function generalizadoMixto(r, citas) {
    const FAM = { binomial: T('binomial'), poisson: T('de Poisson'), 'binomial-negativa': T('binomial negativa'), gamma: T('gamma') };
    const ENL = { logit: 'logit', probit: 'probit', cloglog: T('log-log complementario'), log: T('logarítmico'), identidad: T('identidad'), inverso: T('inverso') };
    const aleat = r.aleatorios.filter(a => !/\.obs/.test(a)).map(a => a.replace(/^\(1 \| (.*)\)$/, '$1'));
    const aprox = r.ajuste.nagq > 1 ? T('por cuadratura adaptativa de Gauss-Hermite con {k} nodos ({p})', { k: r.ajuste.nagq, p: cita(['pinheiro1995'], citas) }) : T('por aproximación de Laplace');
    const metodos = T('Se ajustó un modelo lineal generalizado mixto ({c}) con distribución {f}, enlace {e} y {a} como {x}, {ap} con lme4 ({l}): {fm}.', {
      c: cita(['bolker2009'], citas), f: FAM[r.familia], e: ENL[r.enlace], a: y(aleat), x: aleat.length > 1 ? T('efectos aleatorios') : T('efecto aleatorio'), ap: aprox, l: cita(['bates2015'], citas), fm: r.formula }) +
      (r.pruebaAleatorios ? ' ' + T('Cada efecto aleatorio se probó con la razón de verosimilitudes contra el modelo sin él.') : '') +
      (r.obs.usado ? ' ' + T('La sobredispersión se modeló con un efecto aleatorio por observación ({h}){p}.', { h: cita(['harrison2014'], citas),
        p: Number.isFinite(r.obs.p) ? T(', agregado porque la prueba de Pearson del modelo sin él la mostró (χ²/gl = {v}; {q})', { v: n2(r.obs.razon), q: fp(r.obs.p) }) : '' }) : '') +
      ' ' + T('Los efectos fijos se probaron con pruebas χ² de Wald tipo {t} ({c}).', { t: r.tipoDev === 3 ? 'III' : 'II', c: cita(['fox2019'], citas) }) +
      (r.medias.length ? ' ' + T('Las medias marginales ({m}) se estimaron en la escala de la respuesta y se compararon {a}.', { m: cita(['lenth2016'], citas),
        a: ({ tukey: T('con la prueba de Tukey ({c})', { c: cita(['tukey1949'], citas) }), holm: T('con el ajuste de Holm ({c})', { c: cita(['holm1979'], citas) }), sidak: T('con el ajuste de Šidák ({c})', { c: cita(['sidak1967'], citas) }),
          bonferroni: T('con el ajuste de Bonferroni'), none: T('por pares sin ajuste') })[r.medias[0].ajuste] || '' }) : '');
    const frases = r.wald.termino.map((t, k) => {
      const e = `χ²(${r.wald.gl[k]}) = ${n2(r.wald.chi2[k])}; ${fp(r.wald.p[k])}`, nombre = String(t), sig = r.wald.p[k] < (r.alfa || 0.05);
      return nombre.includes(':') ? (sig ? T('la interacción {t} fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }) : T('la interacción {t} no fue significativa ({e})', { t: nombre.replace(/:/g, ' × '), e }))
        : (sig ? T('el efecto de {t} fue significativo ({e})', { t: nombre, e }) : T('el efecto de {t} no fue significativo ({e})', { t: nombre, e }));
    });
    const vc = r.varianzas, partes = vc.grupo.map((g, k) => (vc.var2[k] ? '' : T('{g}, {v}', { g: g === '.obs' ? T('la de cada observación') : T('la de {x}', { x: g }), v: s4(Math.abs(vc.varianza[k]) < 1e-10 ? 0 : vc.varianza[k]) }))).filter(Boolean);
    const ESC = { probabilidad: T('probabilidades'), tasa: T('tasas'), media: T('medias') };
    const medias = r.medias.filter(m => !m.dentro).map(m => {
      const fs = m.filas.slice().sort((p, q) => q.respuesta - p.respuesta), con = x => s4(x.respuesta) + (x.letras ? ' ' + x.letras : '');
      return fs.length <= 12 ? T('Las {e} estimadas de {f} fueron: {l} (niveles con la misma letra no difieren).', { e: ESC[m.escala], f: m.factor, l: fs.map(x => x.nivel + ', ' + con(x)).join('; ') })
        : T('La más alta de {f} fue {a} ({x}) y la más baja {b} ({z}).', { f: m.factor, a: fs[0].nivel, x: con(fs[0]), b: fs[fs.length - 1].nivel, z: con(fs[fs.length - 1]) });
    });
    const pa = r.pruebaAleatorios, lrt = pa ? pa.termino.map((t, k) => (Number.isFinite(pa.p[k]) ? T('{t}, χ²({g}) = {v}; {p}', { t: t === '(1 | .obs)' ? T('el de cada observación') : t, g: pa.gl[k], v: n2(pa.lrt[k]), p: fp(pa.p[k]) }) : '')).filter(Boolean) : [];
    return { metodos, resultados: [oracion(frases), partes.length ? T('Las varianzas de los efectos aleatorios (escala del enlace) fueron: {l}.', { l: y(partes) }) : '',
      lrt.length ? T('La prueba de razón de verosimilitudes de cada efecto aleatorio dio: {l}.', { l: y(lrt) }) : ''].concat(medias,
      [r.theta !== undefined ? T('El parámetro de forma de la binomial negativa fue θ = {t}.', { t: s4(r.theta) }) : '', r.ajuste.sigma !== undefined ? T('La dispersión de la gamma fue σ² = {s}.', { s: s4(r.ajuste.sigma * r.ajuste.sigma) }) : '',
        r.ajuste.singular ? T('El ajuste fue singular: al menos un componente de varianza se estimó en cero.') : '']).filter(Boolean).join(' ') };
  }

  /** Regresión no lineal (núcleo JS). */
  function noLineal(r, citas) {
    const NL = SP.metodosNoLineal, A = r.ajuste, G = r.niveles.length;
    const nom = z => { const n = NL.NOMBRE_DER[z]; return /^(DE|ED)\d/.test(n) ? n : n.charAt(0).toLowerCase() + n.slice(1); };
    const ref = r.modelo.startsWith('ll') ? ['seefeldt1995', 'ritz2015'] : r.modelo.startsWith('bc') ? ['brain1989', 'ritz2015'] : r.modelo.startsWith('mm') ? ['michaelis1913']
      : /meseta/.test(r.modelo) ? ['cerrato1990'] : ['archontoulis2015'];
    const perfil = r.intervalo === 'perfil', econ = r.derivados.some(z => z.nombre === 'dosis_economica');
    const metodos = (r.seleccion ? T('Entre {k} modelos ajustados a los mismos datos se eligió el de menor criterio de información de Akaike ({c}).', { k: r.seleccion.filter(z => !z.error).length, c: cita(['akaike1974'], citas) }) + ' ' : '') +
      T('Se ajustó el modelo {m} ({e}) por mínimos cuadrados no lineales{w} ({c}){g}.', { m: NL.NOMBRE[r.modelo], e: NL.ECUACION[r.modelo], c: cita(['bates1988'].concat(ref), citas),
        w: r.pesos ? T(' ponderados por «{p}»', { p: r.pesos }) : '', g: G ? T(', con un juego de parámetros para cada nivel de {f}', { f: r.grupo }) : '' }) +
      (perfil ? ' ' + T('Los intervalos de los parámetros se obtuvieron por verosimilitud perfilada ({c}).', { c: cita(['bates1988'], citas) }) : '') +
      (r.derivados.length ? ' ' + (perfil ? T('Los valores derivados ({d}) y sus errores estándar se obtuvieron por el método delta, con intervalos de Wald con t de {g} grados de libertad.', { d: y([...new Set(r.derivados.map(z => nom(z.nombre)))]), g: A.gl })
        : T('Los valores derivados ({d}) y sus errores estándar se obtuvieron por el método delta; los intervalos son de Wald con t de {g} grados de libertad.', { d: y([...new Set(r.derivados.map(z => nom(z.nombre)))]), g: A.gl }))
        : perfil ? '' : ' ' + T('Los intervalos de los parámetros son de Wald con t de {g} grados de libertad.', { g: A.gl })) +
      (econ ? ' ' + T('La dosis económica óptima es la dosis en que la pendiente de la curva iguala la razón entre el precio del insumo y el del producto ({r}; {c}).', { r: s4(r.precios.razon), c: cita(['cerrato1990'], citas) }) : '') +
      (r.comparacion ? ' ' + T('Las curvas se compararon con la prueba F de la suma de cuadrados extra ({c}).', { c: cita(['bates1988'], citas) }) : '');
    const der = r.derivados.filter(z => !(z.recortada && z.nombre === 'respuesta_economica')).map(z => (z.recortada
      ? T('{n}{g} = 0 (a esos precios no conviene aplicar)', { n: nom(z.nombre), g: z.grupo ? T(' de {x}', { x: z.grupo }) : '' })
      : T('{n}{g} = {v} (IC: {i} a {s})', { n: nom(z.nombre), g: z.grupo ? T(' de {x}', { x: z.grupo }) : '', v: s4(z.valor), i: s4(z.ic[0]), s: s4(z.ic[1]) })));
    const c = r.comparacion, comp = c ? (c.global.p < (r.alfa || 0.05) ? T('Las curvas de {f} difirieron (F({a}, {b}) = {v}; {p}).', { f: r.grupo, a: c.global.gl1, b: c.global.gl2, v: n2(c.global.F), p: fp(c.global.p) })
      : T('Las curvas de {f} no difirieron (F({a}, {b}) = {v}; {p}).', { f: r.grupo, a: c.global.gl1, b: c.global.gl2, v: n2(c.global.F), p: fp(c.global.p) })) : '';
    return { metodos, resultados: [T('El modelo explicó el {p} % de la variación (R² = {r}; error estándar residual = {s}).', { p: pct(100 * A.r2), r: n3(A.r2), s: s4(A.sigma) }),
      der.length ? fin(may(y(der))) : '', comp].filter(Boolean).join(' ') };
  }

  /** Generador de diseños (Hito 4.2). */
  function disenoSuperficie(r, citas) {
    const n = r.codificado.length, c = { ccd: ['box1951', 'box1957'], bbd: ['box1960'], factorial: ['box1951'], latice: ['scheffe1958', 'cornell2002'], centroide: ['scheffe1958', 'cornell2002'] }[r.clase];
    const tipo = { ccd: T('central compuesto ({a}, α = {v})', { a: { rotable: T('rotable'), ortogonal: T('ortogonal'), cara: T('de caras centradas'), bloques: T('en dos bloques ortogonales') }[r.tipoAlfa], v: r.alfa ? r.alfa.toFixed(3) : '' }),
      bbd: 'Box-Behnken', factorial: T('factorial 2^{k} con puntos centrales', { k: r.k }), latice: T('simplex-látice'), centroide: T('simplex-centroide') }[r.clase];
    return { metodos: T('Se usó un diseño {t} con {k} {f} y {n} corridas ({c}){o}.', { t: tipo, k: r.k, f: r.clase === 'latice' || r.clase === 'centroide' ? T('componentes') : T('factores'), n, c: cita(c, citas),
      o: r.orden.some((v, i) => v !== i) ? T(', en orden al azar') : '' }), resultados: '' };
  }
  /** Mezclas (Hito 4.2). */
  function mezclas(r, citas) {
    const A = r.ajuste, fa = r.falta_ajuste, O = r.optimo, M = { lineal: T('lineal'), cuadratico: T('cuadrático'), 'cubico-especial': T('cúbico especial') }[r.modelo];
    const metodos = T('Las proporciones de {k} componentes se analizaron con el modelo {m} de Scheffé por mínimos cuadrados sin intercepto ({c}); la mezcla de {o} respuesta se buscó en todo el simplex.',
      { k: r.componentes.length, m: M, c: cita(['scheffe1958', 'cornell2002'], citas), o: r.objetivo === 'minimo' ? T('menor') : T('mayor') });
    const res = [T('El modelo explicó el {p} % de la variación (R² = {r}; R² ajustada = {a}).', { p: pct(100 * A.r2), r: n3(A.r2), a: n3(A.r2_ajustada) })];
    if (fa) res.push(fa.p >= (r.alfa || 0.05) ? T('La falta de ajuste no fue significativa (F({a}, {b}) = {v}; {p}).', { a: fa.gl1, b: fa.gl2, v: n2(fa.F), p: fp(fa.p) })
      : T('La falta de ajuste fue significativa (F({a}, {b}) = {v}; {p}).', { a: fa.gl1, b: fa.gl2, v: n2(fa.F), p: fp(fa.p) }));
    res.push(T('La mejor mezcla fue {x}, con una respuesta estimada de {v} (IC {c} %: {i} a {s}).', { x: y(r.componentes.map((c, j) => c + ' ' + n2(100 * O.mezcla[j]) + ' %')), v: s4(O.prediccion), c: Math.round(100 * (r.nivel || 0.95)), i: s4(O.ic_inf), s: s4(O.ic_sup) }));
    return { metodos, resultados: res.join(' ') };
  }
  /** Deseabilidad (Hito 4.2). */
  function deseabilidad(r, citas) {
    const O = r.optimo;
    return { metodos: T('Las {m} respuestas se modelaron con superficies de segundo orden y se combinaron en una deseabilidad global ({c}); la combinación más deseable se buscó con el simplex sin derivadas ({c2}) dentro de {g}.',
      { m: r.respuestas.length, c: cita(['derringer1980'], citas), c2: cita(['nelder1965'], citas), g: r.region === 'esfera' ? T('la esfera del diseño') : T('los niveles del diseño') }),
      resultados: !(O.D > 0) ? T('Ninguna combinación de la región dejó todas las respuestas dentro de sus límites (D = 0).') : T('La mayor deseabilidad global fue D = {d}, con {x}; ahí se estimó {p}.', { d: n3(O.D), x: y(r.factores.map((f, j) => f + ' = ' + s4(O.natural[j]))),
        p: y(r.respuestas.map((v, i) => v + ' = ' + s4(O.prediccion[i]) + ' (d = ' + n3(O.d[i]) + ')')) }) };
  }

  function superficie(r, citas) {
    const A = r.ajuste, E = r.estacionario, fa = r.falta_ajuste, F = r.factores, NS = SP.metodosSuperficie, minimo = r.objetivo === 'minimo';
    const lista = (vals) => y(F.map((f, j) => f + ' = ' + s4(vals[j])));
    const cod = y(F.map((f, j) => T('{f} con centro {c} y paso {p}', { f, c: s4(r.codificacion.centro[j]), p: s4(r.codificacion.paso[j]) })));
    let metodos = T('Se ajustó un modelo de {o} con los factores codificados{m} ({c}) por mínimos cuadrados ({cit}){b}.', { o: NS.ORDEN[r.orden], c: cod, m: r.codificacionManual ? T(' a mano, −1 y +1 en los niveles indicados') : '', cit: cita(['box1951', 'myers2016'], citas), b: r.bloque ? T(', con el efecto de {b}', { b: r.bloque }) : '' });
    if (fa) metodos += ' ' + T('La falta de ajuste se probó contra el error puro de los puntos repetidos.');
    if (E) metodos += ' ' + T('El punto estacionario se caracterizó con el análisis canónico y se trazó la cresta de {o} respuesta ({c}).', { o: minimo ? T('mínima') : T('máxima'), c: cita(['hoerl1959', 'draper1963'], citas) });
    else if (r.orden === 'primer') metodos += ' ' + T('Se calculó el camino de {s} más pronunciado ({c}).', { s: minimo ? T('descenso') : T('ascenso'), c: cita(['box1951'], citas) });
    else metodos += ' ' + T('Se trazó la cresta de {o} respuesta ({c}).', { o: minimo ? T('mínima') : T('máxima'), c: cita(['hoerl1959', 'draper1963'], citas) });
    const res = [T('El modelo explicó el {p} % de la variación (R² = {r}; R² ajustada = {a}).', { p: pct(100 * A.r2), r: n3(A.r2), a: n3(A.r2_ajustada) })];
    if (fa) res.push(fa.p >= (r.alfa || 0.05) ? T('La falta de ajuste no fue significativa (F({a}, {b}) = {v}; {p}).', { a: fa.gl1, b: fa.gl2, v: n2(fa.F), p: fp(fa.p) })
      : T('La falta de ajuste fue significativa (F({a}, {b}) = {v}; {p}).', { a: fa.gl1, b: fa.gl2, v: n2(fa.F), p: fp(fa.p) }));
    const dentro = E && E.distancia <= r.radio + 1e-9;
    if (E) res.push(E.naturaleza === 'silla' ? T('El punto estacionario fue un punto silla ({x}; valores propios de signo distinto), por lo que la superficie no tiene un óptimo.', { x: lista(E.natural) })
      : T('El punto estacionario fue {n} en {x}, con una respuesta estimada de {v} (IC: {i} a {s}){d}.', { n: NS.NATURALEZA[E.naturaleza], x: lista(E.natural), v: s4(E.prediccion), i: s4(E.ic_inf), s: s4(E.ic_sup),
        d: dentro ? '' : T(', fuera de la región experimental') }));
    const C = r.cresta;
    if (r.orden === 'primer') {
      const paso = C.natural[2].map((v, j) => v - C.natural[0][j]);
      res.push(T('Sobre el camino de {s}, cada unidad codificada de distancia cambia {d}.', { s: minimo ? T('descenso') : T('ascenso'), d: y(F.map((f, j) => f + T(' en {v}', { v: s4(paso[j]) }))) }));
    } else if (!E || E.naturaleza === 'silla' || !dentro || (E.naturaleza === 'maximo') === minimo) {
      let k = 0;
      C.prediccion.forEach((v, i) => { if ((minimo ? -1 : 1) * (v - C.prediccion[k]) > 0) k = i; });
      res.push(T('Sobre la cresta, la {o} respuesta estimada en la región fue {v}, con {x}.', { o: minimo ? T('menor') : T('mayor'), v: s4(C.prediccion[k]), x: lista(C.natural[k]) }));
    }
    return { metodos, resultados: res.join(' ') };
  }

  function multiambiente(id, r, citas) {
    const G = r.genotipos, E = r.ambientes_nombre, a = r.alfa || 0.05;
    if (id === 'dos-etapas') {
      const X = r.estimados, W = r.wald, s = r.objetivo === 'minimo' ? -1 : 1, mejor = G.map((_, i) => i).sort((p, q) => s * (X.media[q] - X.media[p]))[0];
      return { metodos: T('Se evaluaron {g} genotipos en {e} ambientes con un análisis en dos etapas ({c}): en cada ambiente se estimaron las medias ajustadas de los genotipos y su varianza, y en el análisis conjunto cada media se ponderó por el inverso de su varianza más la de la interacción genotipo × ambiente, estimada por máxima verosimilitud restringida.', { g: G.length, e: E.length, c: cita(['smith2001', 'piepho2012'], citas) }),
        resultados: [T('La varianza de la interacción genotipo × ambiente fue {v}.', { v: s4(r.sigma2_ga) }),
          T('Los genotipos {d} (F({a}, {b}) = {f}; {p}); la mayor media ajustada fue la de {m} ({v}).', { d: W.p < a ? T('difirieron') : T('no difirieron'), a: W.gl1, b: W.gl2, f: n2(W.F), p: fp(W.p), m: G[mejor], v: s4(X.media[mejor]) })].join(' ') };
    }
    const an = r.anova, iGA = an.fuente.indexOf(T('G × A')), iG = an.fuente.indexOf(T('Genotipos'));
    const im = r.imputacion ? ' ' + T('Las {k} celdas genotipo × ambiente vacías se imputaron por EM-AMMI con {e} {x} ({c}).', { k: r.imputacion.celdas.length, e: r.imputacion.ejes, x: r.imputacion.ejes === 1 ? T('eje') : T('ejes'), c: cita(['gauch1990'], citas) }) : '';
    const base = T('Se evaluaron {g} genotipos en {e} ambientes{r}.', { g: G.length, e: E.length, r: r.repeticion ? T(' con repeticiones (r = {r})', { r: n2(r.r) }) : T(' (una media por genotipo y ambiente)') }) + im;
    const ga = iGA >= 0 ? T('La interacción genotipo × ambiente {s} (F({a}, {b}) = {v}; {p}).', { s: an.p[iGA] < a ? T('fue significativa') : T('no fue significativa'), a: an.gl[iGA], b: an.gl[an.gl.length - 1], v: n2(an.F[iGA]), p: fp(an.p[iGA]) }) : '';
    if (id === 'ensayos-multiambiente') {
      const metodos = base + ' ' + T('Después del análisis de cada ambiente se hizo el análisis de varianza conjunto ({c}){h}.', { c: cita(['gomez1984'], citas),
        h: r.bartlett ? T('; la homogeneidad de los errores de los ambientes se revisó con la prueba de Bartlett ({c})', { c: cita(['bartlett1937'], citas) }) : '' });
      const res = [ga];
      if (iG >= 0) res.push(T('Los genotipos {s} (F({a}, {b}) = {v}; {p}).', { s: an.p[iG] < a ? T('difirieron') : T('no difirieron'), a: an.gl[iG], b: an.gl[an.gl.length - 1], v: n2(an.F[iG]), p: fp(an.p[iG]) }));
      if (r.bartlett) res.push(T('La razón entre el mayor y el menor cuadrado medio del error fue {k} (χ² de Bartlett = {c}; {p}).', { k: n2(r.bartlett.razon), c: n2(r.bartlett.chi2), p: fp(r.bartlett.p) }));
      return { metodos, resultados: res.filter(Boolean).join(' ') };
    }
    if (id === 'estabilidad') {
      const R = r.regresion, estables = G.filter((_, i) => R.p[i] >= a && (!R.p_dev || R.p_dev[i] >= a));
      const kW = r.wricke.W.indexOf(Math.min(...r.wricke.W)), kL = r.lin_binns.indexOf(Math.min(...r.lin_binns));
      return { metodos: base + ' ' + T('La estabilidad se evaluó con la regresión sobre el índice ambiental ({c1}), la ecovalencia ({c2}), la varianza de estabilidad ({c3}), la superioridad ({c4}) y las medidas no paramétricas de Huehn ({c5}){k}{n}.',
        { c1: cita(['finlay1963', 'eberhart1966'], citas), c2: cita(['wricke1962'], citas), c3: cita(['shukla1972'], citas), c4: cita(['lin1988'], citas), c5: cita(['huehn1990', 'nassar1987'], citas),
          k: r.kang ? T(', el estadístico de rendimiento y estabilidad YS ({c})', { c: cita(['kang1993'], citas) }) : '', n: r.annicchiarico ? T(' y el índice de confianza ({c})', { c: cita(['annicchiarico1992'], citas) }) : '' }),
      resultados: [T('Las pendientes fueron de {a} a {b}.', { a: n2(Math.min(...R.b)), b: n2(Math.max(...R.b)) }),
        estables.length ? T('No se apartaron de b = 1{s}: {l}.', { s: R.p_dev ? T(' ni de S²d = 0') : '', l: y(estables) }) : T('Todos los genotipos se apartaron de b = 1{s}.', { s: R.p_dev ? T(' o de S²d = 0') : '' }),
        T('La menor ecovalencia fue la de {g} ({p} % de la interacción) y la mejor superioridad, la de {l}.', { g: G[kW], p: n2(r.wricke.pct[kW]), l: G[kL] }),
        r.kang ? T('Por el YS se seleccionaron {l}.', { l: y(G.filter((_, i) => r.kang.seleccionado[i])) || T('ninguno') }) : ''].filter(Boolean).join(' ') };
    }
    if (id === 'ammi') {
      const X = r.ammi, ej = X.ejes;
      const metodos = base + ' ' + T('Se ajustó el modelo AMMI ({c1}); los ejes de la interacción se probaron con la prueba F ({c2}) y la prueba F_R ({c3}){s}.',
        { c1: cita(['gauch1988'], citas), c2: cita(['gollob1968'], citas), c3: cita(['cornelius1992'], citas), s: (X.asv ? T(', la estabilidad se midió con el ASV ({c})', { c: cita(['purchase2000'], citas) }) : '') +
          (r.waas ? T(' y con el WAAS en {k} {e}, combinado con la respuesta en el WAASY ({c})', { k: r.waas.ejes, e: r.waas.ejes === 1 ? T('eje') : T('ejes'), c: cita(['olivoto2019'], citas) }) : '') });
      const res = [ga, T('Los dos primeros ejes explicaron el {p} % de la suma de cuadrados de la interacción.', { p: pct(ej.acum[Math.min(1, ej.acum.length - 1)]) })];
      if (X.fr) res.push(T('La prueba F_R retuvo {n} {e}.', { n: X.n_fr, e: X.n_fr === 1 ? T('eje') : T('ejes') }));
      if (X.asv) { const k = X.asv.indexOf(Math.min(...X.asv)); res.push(T('El genotipo más estable según el ASV fue {g}.', { g: G[k] })); }
      if (r.waas) { const k = r.waas.waasy.indexOf(Math.max(...r.waas.waasy)); res.push(T('El mayor WAASY fue el de {g}.', { g: G[k] })); }
      return { metodos, resultados: res.filter(Boolean).join(' ') };
    }
    const Q = r.gge, megas = [...new Set(Q.ganador)];
    const orden = G.map((_, i) => i).sort((p, q) => Q.proyeccion[q] - Q.proyeccion[p]);
    return { metodos: base + ' ' + T('Se construyó el biplot GGE ({c}) con la tabla centrada por ambiente{e} y la partición {p} del valor singular.', { c: cita(['yan2000', 'yan2003'], citas),
      e: r.escala === 'desviacion' ? T(' y escalada por su desviación estándar') : '', p: { simetrica: T('simétrica'), genotipo: T('por genotipo'), ambiente: T('por ambiente') }[r.particion] }),
    resultados: [T('Los dos primeros ejes explicaron el {p} % de G + G × A.', { p: pct(Q.pct[0] + Q.pct[1]) }),
      megas.length > 1 ? T('Se distinguieron {k} megaambientes, con {l} como ganadores.', { k: megas.length, l: y(megas) }) : T('{g} ganó en todos los ambientes.', { g: megas[0] }),
      T('El mejor desempeño promedio fue el de {g}.', { g: G[orden[0]] }),
      Q.distancia_genotipos ? T('El genotipo más cercano al ideal ({c}) fue {g}.', { c: cita(['yan2006'], citas), g: G[Q.distancia_genotipos.indexOf(Math.min(...Q.distancia_genotipos))] }) : ''].filter(Boolean).join(' ') };
  }

  function potencia(id, r, citas) {
    if (id === 'repeticiones') return {
      metodos: T('El número de repeticiones se calculó con la fórmula de Cochran y Cox ({c}), r ≥ 2(t₁ + t₂)²(CV/d)², con un CV esperado de {cv} %, una diferencia de {d} % de la media, α = {a} y una potencia de {p} %, en un diseño {dis} con {k} tratamientos.',
        { c: cita(['cochranCox1957'], citas), cv: n2(r.cv), d: n2(r.diferencia), a: r.alfa, p: pct(100 * r.potencia), dis: SP.metodosPotencia.DISENOS[r.diseno], k: r.tratamientos }),
      resultados: T('Se requieren {r} repeticiones ({q} según la fórmula con {g} grados de libertad del error).', { r: r.repeticiones, q: n2(r.requeridas), g: r.gl }) };
    const que = { potencia: T('la potencia'), n: T('el tamaño de muestra'), diferencia: T('la diferencia detectable'), varEntre: T('la variación detectable entre medias'), r: T('la correlación detectable') }[r.calcular];
    const prueba = { 'potencia-medias': T('una prueba t'), 'potencia-anova': T('un análisis de varianza de una vía'), 'potencia-proporciones': T('la comparación de dos proporciones'), 'potencia-correlacion': T('la prueba de una correlación') }[id];
    const ref = id === 'potencia-correlacion' ? ['cohen1988', 'champely2020'] : ['cohen1988'];
    const u = { 'potencia-medias': r.tipoT === 'pareada' ? T('pares') : r.tipoT === 'una' ? T('observaciones') : T('unidades por grupo'), 'potencia-anova': T('repeticiones por tratamiento'),
      'potencia-proporciones': T('unidades por grupo'), 'potencia-correlacion': T('pares de observaciones') }[id];
    const nn = Number.isInteger(r.n) ? String(r.n) : s4(r.n);
    const res = r.calcular === 'n' ? T('Se necesitan {n} {u} (valor exacto {x}) para una potencia de {p} % con α = {a}.', { n: Math.ceil(r.n - 1e-9), u, x: n2(r.n), p: pct(100 * r.potencia), a: r.alfa })
      : r.calcular === 'potencia' ? T('La potencia es de {p} % con {n} {u} y α = {a}.', { p: pct(100 * r.potencia), n: nn, u, a: r.alfa })
        : T('Con {n} {u} y una potencia de {p} % se detecta {q} de {v}.', { n: nn, u, p: pct(100 * r.potencia), q: que, v: s4(r.calcular === 'r' ? r.r : r.calcular === 'diferencia' ? r.diferencia : r.varEntre) });
    return { metodos: T('Se calculó {q} para {t} ({c}) con las fórmulas exactas de R.', { q: que, t: prueba, c: cita(ref, citas) }), resultados: res };
  }

  function multivariado(id, r, citas) {
    /* la M de Box: la igualdad de covarianzas, como supuesto */
    const box = r.boxM && Number.isFinite(r.boxM.p) ? ' ' + T('La igualdad de las matrices de covarianza se revisó con la prueba M de Box ({c}): χ²({g}) = {x}, {p}.', { c: cita(['box1949'], citas), g: r.boxM.gl, x: n2(r.boxM.chi2), p: fp(r.boxM.p) }) : '';
    if (id === 'manova') {
      const nombre = { pillai: 'Pillai', wilks: 'Wilks', hotelling: 'Hotelling-Lawley', roy: 'Roy' }[r.prueba];
      const met = T('Las respuestas {y} se analizaron en conjunto con un análisis de varianza multivariado (MANOVA){d}, con la traza de {n} ({c}) y sumas de cuadrados secuenciales; después, cada respuesta con su ANOVA.',
        { y: y(r.respuestas.map(v => SP.comillas(v))), d: r.bloque ? T(' en bloques') : '', n: nombre, c: cita([{ pillai: 'pillai1955', wilks: 'wilks1932', hotelling: 'hotelling1951', roy: 'roy1953' }[r.prueba]], citas) });
      const res = r.terminos.filter(t => t.pruebas).map(t => { const x = t.pruebas[r.prueba]; return T('{t}: {n} = {v}, F({a}, {b}) = {f}, {p}', { t: t.termino, n: nombre, v: n3(x.estadistico), a: gl(x.gl1), b: gl(x.gl2), f: n2(x.F), p: fp(x.p) }); });
      return { metodos: met, resultados: T('Resultados de la MANOVA: {l}.', { l: res.join('; ') }) + box };
    }
    const pct = x => F.fijo(100 * x, 1);
    return { metodos: T('Los grupos de «{g}» se describieron con {v} mediante un análisis discriminante lineal ({c}) con previas iguales a las proporciones de los grupos, como lda de MASS ({m}); la clasificación se evaluó con validación cruzada dejando uno fuera.',
      { g: r.grupo, v: y(r.variables.map(v => SP.comillas(v))), c: cita(['fisher1936'], citas), m: cita(['venables2002'], citas) }),
      resultados: T('La primera función discriminante explicó el {a} % de la separación entre grupos; con validación cruzada se clasificó correctamente el {b} % de las unidades.', { a: pct(r.proporcion[0]), b: pct(r.acierto_cv) }) + box };
  }
  function series(id, r, citas) {
    if (id === 'arima') {
      const B = r.box, coefs = r.nombres.map((n, j) => T('{n} = {b} (EE {e})', { n: n === 'intercept' ? T('media') : n, b: s4(r.coef[j]), e: s4(r.ee[j]) }));
      const P = r.pronostico, u = P.media.length - 1;
      return { metodos: T('La serie «{y}» se modeló con un {m}{b} ({bj}), ajustado por máxima verosimilitud exacta con el filtro de Kalman ({g}), con las mismas fórmulas que arima de R; la adecuación se revisó con la prueba de Ljung y Box de los residuos ({lb}) con {k} rezagos.',
        { y: r.respuesta, m: r.modelo, b: r.busqueda ? T(', el de menor AIC ({a}) entre los órdenes probados', { a: cita(['akaike1974'], citas) }) : '', bj: cita(['box1976'], citas), g: cita(['gardner1980'], citas), lb: cita(['ljung1978'], citas), k: B.lag }),
        resultados: T('Coeficientes: {c}; σ² = {s}, AIC = {a}.', { c: y(coefs), s: s4(r.sigma2), a: n2(r.aic) }) + ' ' +
          (B.p >= 0.05 ? T('Los residuos no mostraron autocorrelación (Q({g}) = {q}, {p}).', { g: B.gl, q: n2(B.q), p: fp(B.p) }) : T('Los residuos conservaron autocorrelación (Q({g}) = {q}, {p}).', { g: B.gl, q: n2(B.q), p: fp(B.p) })) + ' ' +
          T('El pronóstico a {h} pasos fue {m} (IC {k} %: {i} a {s}).', { h: u + 1, m: s4(P.media[u]), k: Math.round(100 * r.nivel), i: s4(P.inf[u]), s: s4(P.sup[u]) }) };
    }
    if (id === 'autocorrelacion') {
      const B = r.box;
      return { metodos: T('La autocorrelación simple y parcial de «{y}» (n = {n}) se estimó hasta el rezago {l}, y la independencia de la serie se probó con las pruebas de Ljung y Box ({lb}) y de Box y Pierce ({bp}) con {k} rezagos.',
        { y: r.respuesta, n: r.n, l: r.rezagos, lb: cita(['ljung1978'], citas), bp: cita(['box1970'], citas), k: B.lag }),
        resultados: B.p_ljung_box < 0.05 ? T('La serie mostró autocorrelación (Ljung-Box Q({g}) = {q}, {p}).', { g: B.gl, q: n2(B.ljung_box), p: fp(B.p_ljung_box) })
          : T('No hubo evidencia de autocorrelación (Ljung-Box Q({g}) = {q}, {p}).', { g: B.gl, q: n2(B.ljung_box), p: fp(B.p_ljung_box) }) };
    }
    if (id === 'descomposicion') {
      const fig = r.figura, a = fig.indexOf(Math.max(...fig)), b = fig.indexOf(Math.min(...fig)), ad = r.tipoDesc === 'aditiva';
      return { metodos: T('La serie «{y}» se descompuso en tendencia (media móvil centrada de {f} observaciones), componente estacional y residuo con el método clásico {t} ({c}).',
        { y: r.respuesta, f: r.frecuencia, t: ad ? T('aditivo') : T('multiplicativo'), c: cita(['kendall1983'], citas) }),
        resultados: T('El efecto estacional fue máximo en la posición {a} del ciclo ({x}) y mínimo en la {b} ({z}); la estacionalidad explicó el {p} % de la variación sin tendencia.',
          { a: a + 1, x: ad ? s4(fig[a]) : '×' + n3(fig[a]), b: b + 1, z: ad ? s4(fig[b]) : '×' + n3(fig[b]), p: n2(100 * r.fuerza_estacional) }) };
    }
    const k = Math.round(100 * r.nivel);
    return { metodos: T('La tendencia de «{y}» se probó con la prueba de Mann-Kendall ({mk}) y su magnitud se estimó con la pendiente de Sen ({s}), con las fórmulas del paquete trend ({t}).',
      { y: r.respuesta, mk: cita(['mann1945', 'kendall1975'], citas), s: cita(['sen1968'], citas), t: cita(['pohlert2023'], citas) }),
      resultados: (r.p < 0.05 ? T('La serie tuvo una tendencia {d} (τ = {tau}, z = {z}, {p}).', { d: r.S > 0 ? T('creciente') : T('decreciente'), tau: n3(r.tau), z: n2(r.z), p: fp(r.p) })
        : T('No hubo evidencia de tendencia (τ = {tau}, z = {z}, {p}).', { tau: n3(r.tau), z: n2(r.z), p: fp(r.p) })) + ' ' +
        T('La pendiente de Sen fue {b} por paso de tiempo (IC {k} %: {i} a {s}).', { b: s4(r.pendiente), k, i: s4(r.pendiente_inf), s: s4(r.pendiente_sup) }) };
  }
  function supervivencia(id, r, citas) {
    const k = Math.round(100 * r.nivel);
    if (id === 'kaplan-meier') {
      const conf = { log: T('log'), 'log-log': 'log-log', plain: T('lineales') }[r.conf];
      let met = T('Las curvas de supervivencia de «{t}» se estimaron con el método de Kaplan y Meier ({c}), con el error estándar de Greenwood ({g}) e intervalos {i} al {k} %',
        { t: r.tiempo, c: cita(['kaplan1958'], citas), g: cita(['greenwood1926'], citas), i: conf, k });
      if (r.comparacion) met += T(', y se compararon entre niveles de «{g}» con la prueba {p} ({c}){s}', { g: r.grupo, p: r.rho === 1 ? T('de Peto-Peto') : 'log-rank', c: cita([r.rho === 1 ? 'peto1972' : 'mantel1966'], citas),
        s: r.estrato ? T(' estratificada por «{e}»', { e: r.estrato }) : '' });
      met += T(', con las mismas fórmulas que el paquete survival ({c}).', { c: cita(['therneau2024'], citas) });
      const corto = x => (Number.isFinite(x) ? String(Number((+x).toPrecision(6))) : '—');
      const meds = r.grupos.map(g => Number.isFinite(g.cuantiles.tiempo[1]) ? T('{g}{m} (IC: {i} a {s})', { g: r.grupo ? g.nombre + ', ' : '', m: corto(g.cuantiles.tiempo[1]), i: corto(g.cuantiles.inf[1]), s: corto(g.cuantiles.sup[1]) })
        : T('{g}no se alcanzó', { g: r.grupo ? g.nombre + ', ' : '' }));
      let res = T('La mediana del tiempo hasta el evento fue: {l}.', { l: meds.join('; ') });
      if (r.comparacion) res += ' ' + (r.comparacion.p < 0.05 ? T('Las curvas difirieron (χ²({g}) = {x}, {p}).', { g: r.comparacion.gl, x: n2(r.comparacion.chi2), p: fp(r.comparacion.p) })
        : T('Las curvas no difirieron (χ²({g}) = {x}, {p}).', { g: r.comparacion.gl, x: n2(r.comparacion.chi2), p: fp(r.comparacion.p) }));
      return { metodos: met, resultados: res };
    }
    const vars = y(r.factores.map(f => T('el factor «{f}»', { f })).concat(r.covariables.map(v => T('la covariable «{v}»', { v }))));
    const met = T('Se ajustó un modelo de riesgos proporcionales de Cox ({c}) con {v}{s}, con los empates de {e} ({ce}); el supuesto de riesgos proporcionales se revisó con la prueba de Grambsch y Therneau ({g}) y la discriminación, con la concordancia de Harrell ({h}).',
      { c: cita(['cox1972'], citas), v: vars, s: r.estrato ? T(', estratificado por «{e}» (un riesgo base por estrato)', { e: r.estrato }) : '', e: r.empates === 'efron' ? 'Efron' : 'Breslow', ce: cita([r.empates === 'efron' ? 'efron1977' : 'breslow1974'], citas), g: cita(['grambsch1994'], citas), h: cita(['harrell1982'], citas) });
    /* el nombre legible de cada coeficiente: el nivel frente al de referencia, o la covariable por unidad */
    const etiqueta = (n, j) => { const tm = (r.terminos || []).find(x => x.columnas.includes(j)); return tm && tm.niveles ? T('{nv} frente a {ref}', { nv: n.slice(tm.nombre.length), ref: tm.niveles[0] }) : T('«{v}» (por unidad)', { v: n }); };
    const sig = r.nombres.map((n, j) => (r.p[j] < 0.05 ? T('{n} (HR = {h}; IC {k} %: {i} a {s}; {p})', { n: etiqueta(n, j), h: s4(r.hr[j]), k, i: s4(r.hr_inf[j]), s: s4(r.hr_sup[j]), p: fp(r.p[j]) }) : null)).filter(Boolean);
    const pg = r.zph.p[r.zph.p.length - 1];
    const res = [T('El modelo fue {s} (razón de verosimilitudes χ²({g}) = {x}, {p}; concordancia = {c}).', { s: r.p_lr < 0.05 ? T('significativo') : T('no significativo'), g: r.gl, x: n2(r.lr), p: fp(r.p_lr), c: n3(r.concordancia.C) }),
      sig.length ? T('Cambiaron el riesgo: {l}.', { l: y(sig) }) : T('Ningún término cambió el riesgo de forma significativa.'),
      pg >= 0.05 ? T('No hubo evidencia contra los riesgos proporcionales (χ²({g}) = {x}, {p}).', { g: r.zph.gl[r.zph.gl.length - 1], x: n2(r.zph.chi2[r.zph.chi2.length - 1]), p: fp(pg) })
        : T('Los riesgos no fueron proporcionales (χ²({g}) = {x}, {p}): los HR son un promedio en el tiempo.', { g: r.zph.gl[r.zph.gl.length - 1], x: n2(r.zph.chi2[r.zph.chi2.length - 1]), p: fp(pg) })].join(' ');
    return { metodos: met, resultados: res };
  }
  function muestreo(id, r, citas) {
    const c = cita(['cochran1977'], citas), conf = Math.round(100 * r.confianza), dado = x => String(Number((+x).toPrecision(6)));
    if (id === 'tamano-muestra') {
      const q = r.que === 'proporcion' ? T('una proporción (esperada de {p})', { p: dado(r.p) }) : T('una media');
      const e = r.que === 'proporcion' ? dado(r.error) : r.escala === 'relativo' ? T('{e} % de la media (con un CV esperado de {cv} %)', { e: dado(r.error), cv: dado(r.cv) }) : T('{e} (con una desviación estándar esperada de {s})', { e: dado(r.error), s: dado(r.de) });
      return { metodos: T('El tamaño de muestra para estimar {q} con un error de ± {e} y {k} % de confianza se calculó con las fórmulas de Cochran ({c}){f}.',
        { q, e, k: conf, c, f: r.N > 0 ? T(', con la corrección por población finita (N = {N})', { N: r.N }) : '' }),
        resultados: T('Se necesitan {n} unidades (valor exacto {x}).', { n: r.n_entero, x: n2(r.n) }) };
    }
    if (id === 'muestreo-simple') {
      const q = r.proporcion ? T('La proporción') : T('La media');
      return { metodos: T('{q} de «{y}» se estimó con muestreo aleatorio simple ({c}) con n = {n}{f}; el intervalo de confianza del {k} % usó t con {g} gl.',
        { q, y: r.respuesta, c, n: r.n, f: r.N ? T(' de una población de {N}, con la corrección por población finita', { N: r.N }) : '', k: conf, g: r.n - 1 }),
        resultados: T('{q} estimada fue {m} ± {ee} (EE), con un intervalo de {i} a {s}{t}.', { q, m: s4(r.media), ee: s4(r.ee), i: s4(r.ic[0]), s: s4(r.ic[1]),
          t: r.N ? T('; el total estimado fue {t} ± {e}', { t: s4(r.total), e: s4(r.ee_total) }) : '' }) };
    }
    let res = T('La media estratificada fue {m} ± {ee} (EE), con un intervalo de {i} a {s} ({g} gl); el total estimado fue {t} ± {et}.',
      { m: s4(r.media), ee: s4(r.ee), i: s4(r.ic[0]), s: s4(r.ic[1]), g: gl(r.gl), t: s4(r.total), et: s4(r.ee_total) });
    if (r.asignacion) res += ' ' + T('Para una muestra de {n}, la asignación de Neyman sería de {l}.', { n: r.asignacion.n, l: y(r.estratos.map((x, h) => T('{v} en {e}', { v: Math.ceil(r.asignacion.neyman[h] - 1e-9), e: x.estrato }))) });
    return { metodos: T('La media de «{y}» se estimó con muestreo aleatorio estratificado ({c}) en {H} estratos de «{e}» (N = {N}; n = {n}): la varianza combinó la de cada estrato con su peso y la corrección por población finita, y el intervalo de confianza del {k} % usó los gl efectivos de Satterthwaite ({sat}).',
      { y: r.respuesta, c, H: r.estratos.length, e: r.estrato, N: r.N, n: r.n, k: conf, sat: cita(['satterthwaite1946'], citas) }), resultados: res };
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
    else if (id === 'glmm-bloques' || id === 'glmm') p = generalizadoMixto(r, citas);
    else if (['curva-crecimiento', 'dosis-respuesta', 'respuesta-meseta'].includes(id)) p = noLineal(r, citas);
    else if (['superficie-respuesta', 'ascenso-pronunciado'].includes(id)) p = superficie(r, citas);
    else if (id === 'diseno-superficie') p = disenoSuperficie(r, citas);
    else if (id === 'mezclas') p = mezclas(r, citas);
    else if (id === 'deseabilidad') p = deseabilidad(r, citas);
    else if (['ensayos-multiambiente', 'dos-etapas', 'estabilidad', 'ammi', 'gge'].includes(id)) p = multiambiente(id, r, citas);
    else if (['potencia-medias', 'potencia-anova', 'potencia-proporciones', 'potencia-correlacion', 'repeticiones'].includes(id)) p = potencia(id, r, citas);
    else if (['tamano-muestra', 'muestreo-simple', 'muestreo-estratificado'].includes(id)) p = muestreo(id, r, citas);
    else if (id === 'kaplan-meier' || id === 'cox') p = supervivencia(id, r, citas);
    else if (['autocorrelacion', 'descomposicion', 'tendencia', 'arima'].includes(id)) p = series(id, r, citas);
    else if (id === 'manova' || id === 'discriminante') p = multivariado(id, r, citas);
    else p = explorar(id, r, rep, e, op, citas);
    if (!p) p = { metodos: '', resultados: (rep && rep.conclusiones || []).join(' ') };
    return { metodos: fin(p.metodos), resultados: fin(p.resultados), citas: [...citas] };
  }

  /** La frase del programa (va una vez, al final de los métodos); con los análisis, también el motor R si alguno lo usó. */
  function software(items) {
    const v = SP.validacion ? SP.validacion.actual() : null;
    const rv = v && v.referencias && v.referencias[0] ? (String(v.referencias[0]).match(/R version ([\d.]+)/) || [])[1] : '';
    const casos = v && v.resumen ? v.resumen.casos : null;
    const motor = (items || []).map(it => it && it.r && it.r.versiones).find(x => x && x.R);
    return {
      texto: T('Los análisis se hicieron con SigmaPro {v} ({c}), cuyos cálculos se validan contra R{r} ({rc}){k} con una tolerancia de 1 × 10⁻⁶.', {
        v: SP.VERSION, c: CITA.sigmapro, r: rv ? ' ' + rv : '', rc: CITA.rcore, k: casos ? T(' en {n} casos de prueba', { n: casos.toLocaleString(SP.LOCAL) }) : '' }) +
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
    const fecha = (o.fecha || new Date()).toLocaleDateString(SP.LOCAL, { day: 'numeric', month: 'long', year: 'numeric' });
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
    items.forEach(it => {
      const rep = it.rep || {}, sup = (it.supuestos && it.supuestos.rep) || {};
      [].concat(rep.conclusiones || [], ...(rep.cuadros || []).map(c => c.notas || []), (rep.semaforo || []).map(s => s.texto),
        (sup.semaforo || []).map(s => s.texto), rep.recomendaciones || [], sup.recomendaciones || []).forEach(t => citasEnTexto(t, citas));
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
    return `<!doctype html>\n<html lang="${SP.IDIOMA}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator" content="SigmaPro ${escH(SP.VERSION)}">`
      + `<title>${escH(o.titulo || T('Reporte de análisis estadístico'))}</title><style>${ESTILO.replace(/size: letter/, 'size: ' + (o.hoja === 'a4' ? 'A4' : 'letter'))}</style></head><body><main>${partes.join('\n')}</main></body></html>`;
  }

  SP.informe = { parrafo, software, referencia, citasEnTexto: t => { const s = new Set(); citasEnTexto(t, s); return [...s]; }, bloques, html, frasesAnova, REFERENCIAS: Object.keys(REF) };
});

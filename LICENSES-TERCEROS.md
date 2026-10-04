# Componentes de terceros

SigmaPro es software libre bajo la licencia GPL-3.0 o posterior. Casi todo su código es propio. Lo que
viene de terceros se declara aquí con su licencia; todas son compatibles con la GPL-3.0.

## Que viajan con la app

### Íconos de Lucide (v1.49.0)

- **Dónde:** dentro de `js/labg-navigator.js` y `js/labg-figure-studio.js` (módulos compartidos de la
  LABG Suite, v1.0.0), como trazos SVG dibujados con línea de 1.5.
- **De dónde vienen:** proyecto Lucide, <https://lucide.dev>.
- **Licencia:** ISC; los íconos que Lucide tomó del proyecto Feather llevan además la licencia MIT. El texto
  completo de ambas, sin traducir como piden, está en `shared/LICENSES-TERCEROS.md` del portal de la suite
  y se reproduce abajo.

```text
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

The MIT License (MIT) (for the icons derived from Feather)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Editor ✎ de figuras

- **Dónde:** `js/labg-figedit.js` (módulo común de la LABG Suite, Editor ✎ LABG v1.0.0).
- **De dónde viene:** portal de la suite, `shared/figure-editor/`; obra del mismo autor, GPL-3.0. No trae íconos ni
  código de terceros.

### Letras de la suite

El navegador y el estudio de figuras usan «LABG Sans» y «LABG Serif» (IBM Plex, SIL Open Font License 1.1),
servidas desde el portal de la suite; sin conexión se usan las letras del sistema. No viajan dentro de esta
carpeta.

### Datos publicados en los ejemplos

`datos/ejemplos.js` trae once conjuntos ficticios generados por `datos/generar-ejemplos.R` (obra propia) y
cinco publicados: los tiempos de supervivencia del cuadro 1 de Box, G. E. P. y Cox, D. R. (1964), *An analysis
of transformations*, J. R. Stat. Soc. B 26: 211–252 (el script los coteja celda por celda con la copia del
paquete boot de R); los conteos de la F2 dihíbrida del chícharo de Mendel, G. (1866), *Versuche über
Pflanzen-Hybriden*; y los rendimientos de avena en parcelas divididas de Yates, F. (1935), *Complex experiments*,
Suppl. J. R. Stat. Soc. 2: 181–247 (cotejados parcela por parcela con la copia del paquete MASS de R); y el alfa-látice
de 24 genotipos y la avena en 14 ambientes de Olivoto, T. y Lúcio, A. D. (2020), *metan: an R package for
multi-environment trial analysis*, Methods Ecol. Evol. 11: 783–789 (conjuntos data_alpha y data_ge del paquete metan,
GPL-3). Son datos de publicaciones científicas, citados en el archivo y en la app.

### Algoritmos traducidos de código publicado

Para dar exactamente los mismos números que R, algunos algoritmos se tradujeron a JavaScript de su código
fuente público. La traducción es obra derivada bajo la misma licencia (GPL), compatible con la de SigmaPro:

| Algoritmo | Publicación | Código de origen | Licencia |
|---|---|---|---|
| Shapiro-Wilk (`js/metodos/supuestos.js`) | Royston (1995), algoritmo AS R94, *Applied Statistics* 44: 547–551 | `src/library/stats/src/swilk.c` de R 4.4.2 | GPL-2 o GPL-3 |
| Distribución exacta de Kolmogorov | Marsaglia, Tsang y Wang (2003), *J. Stat. Softw.* 8(18) | `src/library/stats/src/ks.c` de R 4.4.2 | GPL-2 o GPL-3 |
| P exacto de Durbin-Watson | Farebrother (1980, 1984), algoritmo AS 153 / AS R52, con la corrección de C. Cummins (1996) | `src/pan.f` del paquete lmtest | GPL-2 o GPL-3 |
| Distribuciones exactas del rango con signo y de la suma de rangos de Wilcoxon (`js/nucleo/dist.js`) | conteos de Wilcoxon (1945) y Mann y Whitney (1947) | `src/nmath/signrank.c` y `src/nmath/wilcox.c` de R 4.4.2 | GPL-2 o GPL-3 |
| t no central | Lenth (1989), algoritmo AS 243, con la serie de Guenther (1978) | `src/nmath/pnt.c` de R 4.4.2 | GPL-2 o GPL-3 |
| Raíz de una función por el método de Brent como `uniroot()` (`js/nucleo/numerico.js`) | Brent (1973) | `R_zeroin2` de `src/library/stats/src/zeroin.c` de R 4.4.2 | GPL-2 o GPL-3 |
| Detección de factores anidados en la rejilla de referencia (`js/nucleo/medias.js`) | — | `.find_nests` del paquete emmeans | GPL-2 o GPL-3 |
| Distribución de S de Spearman (`js/nucleo/dist.js`) | Best y Roberts (1975), algoritmo AS 89, *Applied Statistics* 24: 377–379 | `src/library/stats/src/prho.c` de R | GPL-2 o GPL-3 |
| Distribución exacta de Kendall (`js/nucleo/dist.js`) | conteos de inversiones (Kendall, 1938) | `ckendall` de `src/library/stats/src/kendall.c` de R | GPL-2 o GPL-3 |
| Razón de momios condicional y su IC en la Fisher 2 × 2 (`js/metodos/contingencia.js`) | Fisher (1935); Cornfield (1956) | `fisher.test` de R (código R) | GPL-2 o GPL-3 |

El análisis con estratos de error sigue el procedimiento público de Yates (1937) tal como lo aplica `aov` con
`Error()` en R (incluido su umbral de 1e-5 para las columnas que se anulan en un estrato); las medias marginales y la
estimabilidad, a Searle, Speed y Milliken (1980) y al paquete estimability (GPL); los efectos simples, a
`joint_tests` de emmeans (GPL); y la eficiencia relativa, a las fórmulas publicadas de Gomez y Gomez (1984).

Comparaciones de medias (`js/metodos/comparaciones.js`): la combinación de estratos con los gl de Satterthwaite
sigue a emmeans con un modelo de estratos (GPL); Duncan y Student-Newman-Keuls, a las fórmulas de agricolae (GPL);
Games-Howell, a PMCMRplus (GPL-3); y el Dunnett exacto integra la t multivariada de Dunnett (1955) con la regla de
Gauss-Kronrod de 21 puntos de QUADPACK (Piessens y col., 1983, dominio público; solo sus nodos y pesos).

Las letras de agrupación siguen el algoritmo de inserción y absorción de Piepho (2004) tal como lo programa
`multcompLetters` de multcompView (GPL); el ajuste de los valores p, a `p.adjust` de R; y las comparaciones tras
Kruskal-Wallis y Friedman, a las fórmulas de PMCMRplus (GPL-3).

ANCOVA y regresión (`js/metodos/ancova.js` y `regresion.js`): los criterios de influencia siguen a `influence.measures`
de R (GPL); el VIF generalizado, a `car::vif` (GPL); Breusch-Pagan y RESET, a lmtest (GPL); la selección paso a paso,
a `step`, `add1` y `drop1` de R (GPL); Cp y BIC de los mejores subconjuntos, a las fórmulas de `summary.regsubsets`
del paquete leaps (GPL); los índices de condición, a Belsley, Kuh y Welsch (1980), *Regression Diagnostics*; y la
eficiencia relativa de la covarianza, a Cochran y Cox (1957), *Experimental Designs*. Todo se programó a partir de las
fórmulas; ninguno de esos códigos viaja con la app.

Correlación y contingencia: el τ-b sigue el algoritmo publicado de Knight (1966); Cochran-Mantel-Haenszel, a
`mantelhaen.test` de R (GPL); la varianza de kappa, a Fleiss, Cohen y Everitt (1969) tal como la programa `cohen.kappa` de
psych (GPL); las medidas de asociación, a Agresti (2002) y Brown y Benedetti (1977); Breslow-Day, a Breslow y Day (1980) y
Tarone (1985); y la Fisher r × c, a la idea del algoritmo de red de Mehta y Patel (1983), programada de nuevo.

Las fórmulas de Lilliefors (Dallal y Wilkinson, 1986) y Anderson-Darling (Stephens, 1986) siguen al paquete
nortest; la no aditividad de Tukey, a agricolae; Grubbs, a outliers, y las rachas, a randtests (todos GPL). El
código de R se consultó en su copia pública (github.com/wch/r-source, etiqueta R-4-4-2).

## Que viajan con las pruebas (no los carga la app)

### Libros de ejemplo del paquete readxl

- **Dónde:** `tests/casos/importar/*.json`, en base64, como entrada de los casos que comparan el lector
  propio de .xlsx contra readxl: `datasets.xlsx`, `deaths.xlsx`, `type-me.xlsx`, `geometry.xlsx` y
  `clippy.xlsx`.
- **De dónde vienen:** readxl 1.4.3, <https://readxl.tidyverse.org>.
- **Licencia:** MIT. El texto que pide el paquete:

```text
YEAR: 2023
COPYRIGHT HOLDER: readxl authors
```

```text
MIT License

Copyright (c) 2023 readxl authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Conjuntos de datos clásicos

Los casos de `tests/casos/` usan además datos publicados que R distribuye en su paquete datasets (PlantGrowth,
airquality, trees, cars, stackloss, swiss, mtcars, longley, women, chickwts, warpbreaks, HairEyeColor, UCBAdmissions,
occupationalStatus) o en los paquetes boot
(poisons), MASS (oats, anorexia, npk, snails, quine, Insurance, birthwt), agricolae (frijol, plots, plrv), carData (Soils), lme4 (sleepstudy, Penicillin, Dyestuff, Dyestuff2, Pastes),
nlme (Oats, Machines, Orthodont, BodyWeight, Rail, ergoStool) y metan (data_alpha, data_ge, data_ge2); cada caso cita la publicación original en su
campo `fuente`. Los escarabajos de Bliss (1935) y los tiempos de coagulación de McCullagh y Nelder (1989) van
transcritos en `tests/casos/generalizados/generar.R`.

## Que se descargan al usarse (motor R, Fase 2)

No viajan dentro de esta carpeta: el navegador los descarga la primera vez que se usa un método del motor R
(`js/nucleo/motor-r.js`) y los guarda en su caché. Corren dentro de la página; los datos no salen del equipo.

| Componente | Versión | Licencia | De dónde se descarga | Uso |
|---|---|---|---|---|
| webR (R compilado a WebAssembly) | 0.6.0 | binarios GPL-3; el resto del proyecto, MIT | <https://webr.r-wasm.org/v0.6.0/> | El motor R en el navegador |
| R y sus paquetes base | 4.6.0 (dentro de webR) | GPL-2 o GPL-3 | con webR | — |
| lme4 | 2.0-1 | GPL ≥ 2 | repositorio de webR, <https://repo.r-wasm.org/> | Modelos lineales mixtos |
| lmerTest | 3.2-1 | GPL ≥ 2 | ídem | Grados de libertad de Satterthwaite y ANOVA de los efectos fijos |
| pbkrtest | 0.5.5 | GPL ≥ 2 | ídem | Kenward-Roger (solo si se elige) |
| emmeans | 2.0.3 | GPL-2 o GPL-3 | ídem | Medias marginales y comparaciones de los modelos mixtos |
| nlme | 3.1-169 | GPL ≥ 2 | con webR (paquete recomendado de R) | Medidas repetidas con estructuras de covarianza |
| car | 3.1-5 | GPL ≥ 2 | repositorio de webR | Pruebas χ² de Wald de los modelos lineales generalizados mixtos |
| carData, Formula, mgcv, quantreg, SparseM, MatrixModels, survival, abind | las del repositorio de webR | GPL ≥ 2, GPL-2 o GPL-3, LGPL ≥ 2 o MIT, según el paquete | ídem | Dependencias de car |
| Dependencias de los anteriores (Matrix, minqa, nloptr, numDeriv, MASS, boot, Rcpp, RcppEigen y otras) | las del repositorio de webR | GPL-2, GPL ≥ 2, LGPL ≥ 3 o MIT, según el paquete | ídem | Las instala R junto con los anteriores |

Dos dependencias son solo GPL-2 (minqa, de lme4; numDeriv, de lmerTest): no se enlazan con el código de SigmaPro, que
se comunica con el motor por mensajes; si se publican en un repositorio propio (cierre de la Fase 2), irán con su
código fuente, como pide la GPL-2. Cada resultado del motor R registra la versión de R y de sus paquetes (detalles
técnicos del reporte y `tests/generado/motor-r.json`).

## Solo para generar referencias de validación (no se distribuyen)

Se usan en el equipo del autor para calcular los resultados de referencia de `tests/casos/`: R 4.4.2 y los
paquetes jsonlite (MIT), y según el caso stats, MASS, car, agricolae, emmeans, multcomp, mvtnorm, nortest,
PMCMRplus, FSA, dunn.test, leaps, lmtest, multcompView, carData y psych (licencias GPL). Las versiones exactas quedan
registradas en cada caso y en `tests/r/sesion.txt`.

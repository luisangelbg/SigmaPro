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

`datos/ejemplos.js` trae nueve conjuntos ficticios generados por `datos/generar-ejemplos.R` (obra propia) y
tres publicados: los tiempos de supervivencia del cuadro 1 de Box, G. E. P. y Cox, D. R. (1964), *An analysis
of transformations*, J. R. Stat. Soc. B 26: 211–252 (el script los coteja celda por celda con la copia del
paquete boot de R); los conteos de la F2 dihíbrida del chícharo de Mendel, G. (1866), *Versuche über
Pflanzen-Hybriden*; y los rendimientos de avena en parcelas divididas de Yates, F. (1935), *Complex experiments*,
Suppl. J. R. Stat. Soc. 2: 181–247 (cotejados parcela por parcela con la copia del paquete MASS de R). Son datos de
publicaciones científicas, citados en el archivo y en la app.

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
(poisons), MASS (oats, anorexia), agricolae (frijol) y carData (Soils); cada caso cita la publicación original en su
campo `fuente`.

## Que se descargan al usarse (Fase 2, aún no incluidos)

| Componente | Licencia | Uso |
|---|---|---|
| webR v0.6.0 (R compilado a WebAssembly) | binarios GPL-3; resto del proyecto MIT | Motor R para modelos mixtos, cargado solo cuando se necesita |
| R y sus paquetes base | GPL-2 \| GPL-3 | Dentro de webR |
| lme4, nlme, lmerTest, pbkrtest | GPL ≥ 2 | Modelos mixtos |
| emmeans | GPL-2 \| GPL-3 | Medias marginales |

## Solo para generar referencias de validación (no se distribuyen)

Se usan en el equipo del autor para calcular los resultados de referencia de `tests/casos/`: R 4.4.2 y los
paquetes jsonlite (MIT), y según el caso stats, MASS, car, agricolae, emmeans, multcomp, mvtnorm, nortest,
PMCMRplus, FSA, dunn.test, leaps, lmtest, multcompView, carData y psych (licencias GPL). Las versiones exactas quedan
registradas en cada caso y en `tests/r/sesion.txt`.

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

### Letras de la suite

El navegador y el estudio de figuras usan «LABG Sans» y «LABG Serif» (IBM Plex, SIL Open Font License 1.1),
servidas desde el portal de la suite; sin conexión se usan las letras del sistema. No viajan dentro de esta
carpeta.

### Datos publicados en los ejemplos

`datos/ejemplos.js` trae cinco conjuntos ficticios generados por `datos/generar-ejemplos.R` (obra propia) y
uno publicado: los tiempos de supervivencia del cuadro 1 de Box, G. E. P. y Cox, D. R. (1964), *An analysis
of transformations*, J. R. Stat. Soc. B 26: 211–252. Son datos de un artículo científico, citados en el
archivo y en la app; el script los coteja celda por celda con la copia del paquete boot de R.

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

Los casos de `tests/casos/` usan además datos publicados que R distribuye en su paquete datasets o en boot
(PlantGrowth, airquality, trees, poisons); cada caso cita la publicación original en su campo `fuente`.

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
PMCMRplus, FSA, dunn.test, leaps, lmtest y multcompView (licencias GPL). Las versiones exactas quedan
registradas en cada caso y en `tests/r/sesion.txt`.

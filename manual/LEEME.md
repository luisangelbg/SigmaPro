# Manual de usuario de SigmaPro

El manual se escribe por partes, en HTML, con el mismo formato que los manuales de las demás apps LABG (PhenologyPro,
EconomicsPro, CladisticsPro…), en español (`es/`) y en inglés (`en/`, desde la 1.0.0). Cuando todas las partes están listas se unen en un solo documento y
se imprime a PDF **una sola vez**, al final.

```
manual/
  manual.css           hoja común de la portada: tamaño carta
  interior.css         páginas interiores: hojas blancas, vivos en oro oscuro y negro, un color por bloque
  paginar.js           reparte el contenido en hojas tamaño carta (encabezados, números de página, índice)
  img/                 capturas de pantalla de la app (las toma captura.mjs)
  herramientas/
    navegador.mjs      el navegador sin ventana de las herramientas (Edge o Chrome, perfil temporal)
    captura.mjs        abre la app por file://, ejecuta una receta y guarda img/<receta>.png al doble de resolución
    recetas/           una receta por captura (JS); _ayudas.js define las ayudas comunes
    hojas.mjs          revisa una parte paginada: el hueco al pie de cada hoja, imágenes rotas y, si se pide,
                       guarda hojas como imagen para revisarlas a la vista
    huecos.js          el guion de hojas.mjs que mide los huecos
    unir.mjs           une la portada y las partes en es/manual-completo.html; con --pdf, lo imprime a PDF;
                       con --partes 04, solo un capítulo partido en varios archivos, para revisar su paginación
    indice.mjs         escribe el índice general de la introducción con los títulos de las partes
  es/                  las partes, en español
```

Solo letras del sistema (Palatino, Georgia, Segoe UI y las que haya): el manual no descarga tipografías ni nada de
internet, como la app.

Las capturas se toman con la app abierta desde `file://`, tema claro, 1400 × 900 (o el alto que diga la receta), al
doble de resolución, sin trabajo guardado. Los datos son los **ejemplos de la propia app** (bloque Datos → Ejemplos),
así que cada número del manual se puede repetir con un clic; el principal es «Maíz: híbridos × nitrógeno» (factorial
3 × 4 en bloques completos al azar).

## Plan de partes

| Parte | Archivo | Contenido |
|---|---|---|
| 1 | `00a-portada.html` | portada |
| 2 | `00b-introduccion.html` | créditos, índice general, cómo leer el manual e introducción I.1–I.10 |
| 3 | `01-bloque1.html` | Bloque 1 · Inicio |
| 4 | `02-bloque2.html` | Bloque 2 · Datos: importar, pegar, ejemplos, la hoja, tipos, variables calculadas, transformar, filtrar, ancha ⇄ larga, la estructura del ensayo |
| 5 | `03-bloque3.html` | Bloque 3 · Explorar: descriptivos, frecuencias, proporciones y bondad de ajuste |
| 6 | `04a-bloque4.html` | Bloque 4 · Análisis I: el asistente, el catálogo, el constructor de modelos y cómo se lee un resultado |
| 7 | `04b-bloque4.html` | Análisis II: supuestos, pruebas t y no paramétricas |
| 8 | `04c-bloque4.html` | Análisis III: diseños experimentales y comparaciones de medias |
| 9 | `04d-bloque4.html` | Análisis IV: ANCOVA, regresión, correlación y tablas de contingencia |
| 10 | `04e-bloque4.html` | Análisis V: modelos mixtos, generalizados, componentes de varianza y heredabilidad |
| 11 | `04f-bloque4.html` | Análisis VI: regresión no lineal, superficies de respuesta y ensayos multiambiente |
| 12 | `04g-bloque4.html` | Análisis VII: multivariado, tamaño de muestra y muestreo, supervivencia y series de tiempo |
| 13 | `05-bloque5.html` | Bloque 5 · Resultados: el Reporte LABG |
| 14 | `06-bloque6.html` | Bloque 6 · Figuras |
| 15 | `07-bloque7.html` | Bloque 7 · Exportar, el proyecto .labg y el guardado automático |
| 16 | `08-bloque8.html` | Bloque 8 · Validación |
| 17 | `09-bloque9.html` | Bloque 9 · Fundamentos: el catálogo y el mapa de métodos, la ficha de cada análisis, datos necesarios y plantillas, la revisión de las fichas |
| 18 | `10-bloque10.html` | Bloque 10 · Suite LABG: las apps hermanas, las sugerencias dentro del trabajo, enviar los datos y citar |
| 19 | `11-apendices.html` | apéndices: archivos, mensajes y cuando algo no sale, glosario, referencias, licencia y cita |

El capítulo N explica el Bloque N (secciones, figuras y cuadros N.x); la introducción no lleva número (I.x). El
capítulo 4 es largo y va en siete archivos, pero es un solo capítulo con secciones 4.1, 4.2…

## Colores por bloque

| Bloque | Color | Variable |
|---|---|---|
| Preliminares e introducción | negro `#111111` | `--b0` |
| 1 Inicio | oro oscuro `#7D5B14` | `--b1` |
| 2 Datos | verde azulado `#1f6f6a` | `--b2` |
| 3 Explorar | azul `#2b6aa3` | `--b3` |
| 4 Análisis | vino `#8c2f39` | `--b4` |
| 5 Resultados | oliva `#55712a` | `--b5` |
| 6 Figuras | violeta `#66509a` | `--b6` |
| 7 Exportar | naranja tostado `#b0601c` | `--b7` |
| 8 Validación | pizarra `#4f5d78` | `--b8` |
| 9 Fundamentos | verde pino `#3d6b4f` | `--b9` |
| 10 Suite LABG | oro viejo `#8c6d1a` | `--b10` |
| Apéndices | sepia `#3a352c` | `--bx` |

## Cómo se trabaja

1. Cada parte se abre con doble clic y se ve ya paginada. Se revisa con
   `node manual/herramientas/hojas.mjs es/NN-….html` (hueco al pie de cada hoja, imágenes, elementos demasiado altos)
   y, para mirarlas, `--png 1-4 --salida <carpeta>`.
2. Las capturas: `node manual/herramientas/captura.mjs <receta> [<receta> …]` desde la carpeta de la app; con
   `--idioma en`, la app abre con la interfaz en inglés (`?lang=en`) y la captura va a `img/en/` (las recetas sirven a
   los dos idiomas: `ejemplo()` busca el nombre traducido y `SP.IDIOMA` elige los textos que escribe la receta).
3. El capítulo 4 va en siete archivos que corren seguidos: su paginación se revisa junta con
   `node manual/herramientas/unir.mjs es --partes 04 --salida _cap4.html` y `hojas.mjs es/_cap4.html` (los `_*` no se
   guardan en git). Las capturas (`img/`, `img/en/`) sí: las usa el manual en HTML publicado; se regeneran con sus recetas.
4. El índice general: `node manual/herramientas/indice.mjs es` lo reescribe con los títulos de las partes.
5. Al terminar todas las partes, una sola vez: `node manual/herramientas/unir.mjs es --pdf SigmaPro_Manual_de_usuario_ES.pdf`,
   que une las partes en `es/manual-completo.html` y lo imprime a PDF.
6. La edición inglesa: las mismas partes en `en/` (mismos nombres, mismas clases e id; `<html lang="en">`; las imágenes en
   `../img/en/`), con los textos de botones y menús tal como los muestra la interfaz inglesa (catálogo `js/i18n/en.js`).
   El paginador y la portada toman el idioma de la página. `node manual/herramientas/indice.mjs en` escribe su índice y
   `node manual/herramientas/unir.mjs en --pdf "en/SigmaPro User's Manual (English).pdf"` la une y la imprime.

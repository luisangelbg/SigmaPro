# SigmaPro

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23935865.svg)](https://doi.org/10.5281/zenodo.23935865)

**Estadística para la investigación agronómica y biológica, con cifras que se pueden comprobar** · *English:
[README.md](README.md)*

SigmaPro es un programa de estadística para la investigación agronómica y biológica que funciona por completo dentro
del navegador: lleva los datos de un ensayo, del archivo de campo a la tabla y la figura publicadas, por un solo
camino. Abarca los diseños experimentales y las comparaciones de medias, la regresión y la correlación, los modelos
lineales mixtos y generalizados, los modelos no lineales, las superficies de respuesta, los ensayos multiambiente, el
tamaño de muestra y la potencia, el muestreo, la supervivencia, las series de tiempo y el multivariado: **78 análisis
en 18 familias**. La interfaz está en español y en inglés, con tema claro y oscuro. Forma parte de la
[LABG Suite](https://luisangelbg.github.io/).

- **Exactitud verificada.** Cada método se compara contra R, número por número, con una tolerancia de 10⁻⁶ relativa al
  tamaño de cada valor: **849 casos y 93 169 valores, todos dentro de la tolerancia**. Un método no se libera hasta que
  pasan sus casos. El reporte de validación está en la propia app (bloque 8) y en
  [`tests/reporte-validacion.html`](tests/reporte-validacion.html).
- **Reproducible.** Cada resultado trae el código R equivalente; el proyecto `.labg` guarda los datos, los análisis y la
  huella SHA-256 de cada archivo.
- **Privado.** Todo se calcula en el navegador; los datos no salen del equipo.
- **Explica lo que calcula.** Cada resultado empieza con su conclusión en palabras, revisa sus supuestos con un semáforo
  que puede correr la alternativa y trae «Cómo leer este cuadro» con guías de lectura publicadas. Cada uno de los 78
  análisis tiene su ficha (bloque 9): para qué sirve, el modelo y sus hipótesis, los supuestos y cómo revisarlos, los
  datos que necesita con plantillas, cómo se lee y sus referencias.

## Abrirlo

- **En línea:** https://luisangelbg.github.io/SigmaPro/ — la primera visita guarda la app en el navegador y después
  abre sin conexión.
- **En tu computadora:** descarga el repositorio y abre `index.html` con doble clic. Sin servidor, sin instalar nada.

Los pocos análisis que necesitan la maquinaria de ajuste de R (los modelos lineales mixtos y sus diseños, las medidas
repetidas y los modelos lineales generalizados mixtos) corren en un **motor R dentro del navegador** (webR). Se
descarga la primera vez que se usa uno de ellos (unos 25 MB, que luego quedan guardados); los datos tampoco salen del
equipo. Servida por http junto a su repositorio propio (`motor-r/`, que arma `node tools/motor-r/armar.mjs`), funciona
sin internet desde la primera visita; ese repositorio no forma parte de este.

## Los diez bloques

1. **Inicio** — tres maneras de empezar, lo último que analizaste, el estado del desarrollo y la lista de los 78 análisis.
2. **Datos** — CSV, TSV, .xlsx y .ods con lectores propios, tablas pegadas y 27 ensayos de ejemplo; la hoja de trabajo
   para 100 000 filas con deshacer; los tipos de variable explicados; variables calculadas, transformaciones (Box-Cox),
   filtros, ancha ⇄ larga, y lo que SigmaPro ve en tu ensayo.
3. **Explorar** — descriptivos por hasta tres factores con sus intervalos, frecuencias, proporciones con seis intervalos
   y bondad de ajuste ji cuadrada.
4. **Análisis** — el asistente, el catálogo y el constructor visual de modelos, con los 74 análisis restantes: supuestos,
   pruebas t y no paramétricas, diseños experimentales y comparaciones de medias, ANCOVA, regresión, correlación,
   tablas de contingencia, modelos mixtos, componentes de varianza y heredabilidad, modelos generalizados, no lineales,
   superficies de respuesta, ensayos multiambiente, tamaño de muestra y potencia, muestreo, supervivencia, series de
   tiempo y multivariado.
5. **Resultados** — el Reporte LABG: conclusión, cuadros, figuras, supuestos, el párrafo para la tesis o el artículo
   (también en estilo APA) y el código R.
6. **Figuras** — figuras de publicación con seis temas, el editor ✎ y el Estudio de figuras.
7. **Exportar** — el reporte en .docx, PDF, HTML y Markdown, la hoja de trabajo para clase, los cuadros, las figuras,
   el proyecto `.labg` y el guardado automático.
8. **Validación** — la comparación de cada caso contra R y las demás comprobaciones de la batería.
9. **Fundamentos** — las 78 fichas en español y en inglés, el mapa de métodos y el árbol de decisiones.
10. **Suite LABG** — las apps hermanas que continúan el trabajo.

## Pruebas

```
Rscript tests/r/generar-todo.R        # las referencias, calculadas con R 4.4.2 y sus paquetes
node tests/correr.mjs                 # pruebas unitarias y los 849 casos contra R → tests/reporte-validacion.html
node tests/navegador.mjs              # las mismas pruebas en el navegador
node tests/codigo-r.mjs               # el código R que muestra la app corre en R y da lo mismo
node tests/idioma.mjs                 # la interfaz en inglés: catálogo completo y los mismos números en los dos idiomas
node tests/exportar.mjs               # cada exportación, leída con lectores independientes
node tests/sin-conexion.mjs           # privacidad (ninguna petición sale del navegador) y uso sin conexión
node tests/accesibilidad/auditar.mjs  # accesibilidad AA, en claro y oscuro, a 1280 y 360 px
```

En Windows, `tests/pruebas.ps1` las corre todas. El método está en [`docs/VALIDACION.md`](docs/VALIDACION.md) y el
capítulo 8 del manual explica las quince comprobaciones de la batería. `tests/index.html`, con doble clic, corre las
pruebas unitarias en el navegador. La historia de cada versión, hito por hito, está en
[`CHANGELOG.md`](CHANGELOG.md), y el plan de cada fase en [`propuesta/`](propuesta/).

## Manual

- Español: [`manual/SigmaPro_Manual_de_usuario_ES.pdf`](manual/)
- English: [`manual/en/SigmaPro User's Manual (English).pdf`](manual/en/)

Sus partes en HTML están en `manual/es/` y `manual/en/`; `manual/LEEME.md` explica cómo se arman.

## Cómo citarlo

Barrera-Guzmán, L. Á. (2026). SigmaPro: estadística para la investigación agronómica y biológica (versión 1.0.0)
[Programa de cómputo]. LABG Suite. Zenodo. https://doi.org/10.5281/zenodo.23935865

El DOI lleva siempre a la versión más reciente; cada versión tiene su propio DOI en la página de Zenodo (versión 1.0.0:
10.5281/zenodo.23935866). Cita la versión que usaste. Código: https://github.com/luisangelbg/SigmaPro

El párrafo de métodos de cada reporte cita SigmaPro y R con sus versiones. `CITATION.cff` trae los mismos datos para
los gestores de referencias.

## Problemas y propuestas

En https://github.com/luisangelbg/SigmaPro/issues (el botón **Reportar un problema** de la app abre uno con el bloque y
el navegador ya escritos).

## Licencia

GPL-3.0 o posterior (ver [`LICENSE`](LICENSE)). Componentes de terceros en
[`LICENSES-TERCEROS.md`](LICENSES-TERCEROS.md).

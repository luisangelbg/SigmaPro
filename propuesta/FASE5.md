# SigmaPro — Fase 5: app insignia de la suite LABG

Plan de la quinta fase (4 de octubre de 2026), después de la versión 0.4.2. Convierte a SigmaPro en la app insignia
de la suite: cada número que muestra se puede **leer** (medidor con zonas, tarjeta de interpretación con los números
del caso, conclusión en lenguaje claro y cómo reportarlo), la app **orienta** (inicio con tres caminos, asistente
visual, glosario, recorridos) y **conecta** con las demás apps de la suite. Sin cambiar ningún cálculo: la validación
contra R (`docs/VALIDACION.md`) sigue igual y una prueba de regresión nueva fija lo que se muestra.

Contenido: 1. Decisiones · 2. Componentes · 3. Hitos · 4. Calidad · 5. Riesgos.

## 1. Decisiones

| # | Tema | Decisión |
|---|---|---|
| 1 | Sin dependencias | La app sigue sin bibliotecas ni peticiones fuera del equipo (abre con doble clic). Medidores, curvas y fórmulas se dibujan en SVG y MathML propios. axe-core y Lighthouse solo en las pruebas (Lighthouse se instala con permiso). |
| 2 | Una sola fuente | Cada estadístico se describe una vez en el **registro** (`js/nucleo/guias.js`): nombres, sinónimos (las claves y títulos de columna con que aparece), escalas y zonas, interpretación con los números del caso, supuestos, errores comunes, fórmula y referencias. De ahí salen los medidores, las tarjetas, el glosario y `docs/inventario-estadisticos.md`. |
| 3 | Los cálculos no cambian | Nada de esta fase toca `calcular()` ni el motor R. `tests/regresion.mjs` guarda la huella de cada resultado y de cada cuadro mostrado en los casos del núcleo JS y falla si cambia sin `--actualizar`. |
| 4 | Módulos comunes | No se tocan el navegador, el estudio de figuras, el editor ✎ ni el núcleo LABG. Lo nuevo reutilizable va en módulos propios con nombre `labg-*` (LABGuide, LABGSuggest), con sus textos en español e inglés, listos para que otra app los adopte. |
| 5 | Otras apps | No se modifican. «Enviar datos a…» deja un CSV y un formato de intercambio documentado; recibirlo directo será un cambio de cada app. |
| 6 | Idioma | Todo texto nuevo pasa por `SP.T` y se traduce en el mismo hito (`tools/i18n/agregar.mjs`; `tests/idioma.mjs` falla si falta uno). |
| 7 | Versión | Cada hito sube el tercer número; Fundamentos y la suite fueron la 0.5.0 (sección 6) y el cierre de la fase será la 0.6.0. La 1.0.0 queda para la publicación. No se publica nada sin confirmación. |

## 2. Componentes

- **Registro de estadísticos** (`SP.guias`, sin DOM): `buscar(clave, titulo)` → ficha; `zona(ficha, valor, contexto)` →
  { zona, etiqueta, color }; `interpretar(ficha, valor, contexto)` → texto con los números. Escalas: p (con α del
  análisis), tamaños de efecto (d, g, r, η², η²p, ω², f, V de Cramér, odds ratio) con las guías de Cohen y otras
  citadas, R² y R² ajustada, CV con contexto editable (cultivo y variable: las guías agronómicas de Pimentel-Gomes y
  de las tablas de CV por cultivo), VIF, Durbin-Watson, W de Shapiro-Wilk, asimetría y curtosis, AIC/BIC con Δ,
  razón de verosimilitudes, Cp de Mallows, RMSE relativo, ancho del IC, potencia y n alcanzado contra requerido.
- **LABGuide** (`js/labg-guide.js`, `css/labg-guide.css`): dibuja medidores (regla con zonas y marca, accesible como
  `role="meter"` con su texto), la curva de la distribución de referencia (F, t, χ², z) con el valor crítico, el
  observado y el área del p sombreada, y la tarjeta de interpretación desplegable.
- **Modo de detalle** Básico / Estándar / Experto (persistente): Básico muestra la conclusión clara, los medidores y
  el semáforo; Estándar, además los cuadros; Experto, además fórmulas, código R y notas técnicas.
- **LABGSuggest** (`js/labg-suggest.js`, `data/suite.json`, `img/suite/*.svg`): tarjetas «Continúa tu análisis con…»
  según el análisis y los datos, descartables, con «no volver a sugerir»; «Enviar datos a…» (CSV con el formato de
  intercambio); «Otras herramientas de LABG» en el reporte.

## 3. Hitos (cada uno con su batería completa y su commit)

| Hito | Contenido |
|---|---|
| 5.0 | Inventario: `tools/inventario/inventario.mjs` corre los casos del núcleo JS (y lee el código de los métodos del motor R) y lista, por análisis, los cuadros, columnas, medidas por fila y semáforos; los relaciona con el registro y escribe `docs/inventario-estadisticos.md`. Registro inicial con los estadísticos más frecuentes. `tests/regresion.mjs` y su huella. |
| 5.1 | LABGuide: medidores y curvas de referencia, en los cuadros de cada análisis; registro completo de las escalas. |
| 5.2 | Tarjetas de interpretación con los números del caso; modo Básico / Estándar / Experto. |
| 5.3 | Semáforo de supuestos con íconos y un botón que corre la alternativa (transformación, no paramétrica, GLM, Welch). |
| 5.4 | Conclusión en lenguaje claro y «Cómo reportarlo» (APA, español e inglés) en cada análisis. |
| 5.5 | Glosario buscable (Ctrl+G) con «ver en acción» (abre un ejemplo donde aparece). |
| 5.6 | LABGSuggest y el catálogo de la suite. |
| 5.7 | Inicio con tres caminos, asistente visual en árbol SVG, historial de análisis, modo presentación, recorridos por bloque, ayudas emergentes, estados vacíos y mensajes de error humanos. |
| 5.8 | Reporte rediseñado (portada, índice, medidores, apéndice metodológico), Markdown, hoja de trabajo para clase. |
| 5.9 | Calidad: pruebas de cada escala, coherencia texto-número en todos los análisis, enlaces y logos; axe-core en las pruebas; Lighthouse ≥ 90. |
| 5.10 | Documentación: README, manual (capítulos nuevos), CHANGELOG, `codemeta.json` y `CITATION.cff`, `docs/estilo-insignia.md`; versión 0.5.0. El PDF del manual, al final. |

## 4. Calidad

- La batería de siempre en cada hito (generar, motor R, casos contra R, navegador, código R, idioma, exportar, sin
  conexión, accesibilidad AA) más `tests/regresion.mjs` desde el 5.0.
- Las zonas de cada escala se prueban en sus bordes; cada texto de interpretación se arma con todos los casos y se
  revisa que cite los números del resultado (coherencia texto-número).

## 5. Riesgos

1. Volumen: cientos de columnas en 78 análisis. El inventario agrupa las que son el mismo estadístico (por clave y
   título) y deja a la vista las que aún no tienen ficha.
2. Textos que contradigan al número: se prueban con la revisión automática de coherencia en todos los casos.
3. Rendimiento con medidores en cada cuadro: se dibujan al abrir la tarjeta o en los modos Estándar y Experto.
4. Escalas discutibles (CV «bajo» o «alto» depende del cultivo y la variable): siempre con la fuente citada y, para el
   CV, con el contexto que la persona puede cambiar.

## 6. Avance y cambio de plan

| Hito | Versión | Estado |
|---|---|---|
| 5.0 | 0.4.3 | Hecho (8cd1963): registro de estadísticos, inventario y `tests/regresion.mjs`. |
| Fundamentos | 0.5.0 | Hecho (4 y 5 oct): no estaba en el plan original. Bloque 9 con una ficha por análisis (78, ES y EN) en `data/fundamentos/`, buscador, filtros y mapa de métodos; fórmulas en MathML con un convertidor propio (`js/nucleo/formulas.js`); plantillas CSV y XLSX; revisión técnica independiente (`docs/revision-fundamentos.md`) que corrigió 49 fichas y 18 errores de la app; `tests/fundamentos.mjs`. |
| 5.6 | 0.5.0 | Hecho con Fundamentos: LABGSuggest 1.0.0 (`js/labg-suggest.js`) y el bloque 10, Suite LABG. Los datos van en `data/suite.js` y `data/suite-rules.js` (no `.json`, para que abran con doble clic); `tests/suite-enlaces.mjs`. |
| 5.10 (parte) | 0.5.0 | README, capítulos 9 y 10 del manual (apéndices al 11), CHANGELOG, `codemeta.json` y `CITATION.cff`. El PDF del manual, al final. |
| 5.1–5.5, 5.7–5.9 | 0.5.x | Pendientes, en el orden del cuadro de la sección 3. La versión del cierre de la fase será la 0.6.0. |
| 5.11 | 0.5.4 | Hecho (rendimiento de carga): Lighthouse en escritorio de 39 a 98 en Inicio, 97 en Fundamentos y 96 en Suite (CLS 0; Validación por enlace directo 66, porque espera su reporte para no reacomodar la página); en el teléfono de 15 a 69–76. Reporte de validación completo bajo demanda (resumen de 8 KB al abrir), Fundamentos al abrir su bloque, la app en dos tiempos (página y barra común primero, guiones de la app después, SP.alArrancar y sp:listo), sin desplazamientos (hoja de la barra desde el principio, bloque activo de una pantalla, Fundamentos sin índice de la derecha). Pendiente en el teléfono: el tiempo bloqueado (340–500 ms) pide cargar por bloque lo que solo usa un bloque. |

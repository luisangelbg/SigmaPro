# Cambios

## Sin publicar

### 0.5.1 · Dunnett exacto en segundos (5 oct 2026)

- **La probabilidad exacta de Dunnett ya no se dispara con los p chicos** (`comp.dunnettProb`). La cuadratura
  adaptativa de Gauss-Kronrod partía cada tramo hasta que *su propio* error relativo bajara de 1e-12, aun donde el
  integrando es despreciable (las colas de un p chico), y las bisecciones se multiplicaban. Ahora el criterio es
  global, como QUADPACK (`integrate` de R, con el que se generan las referencias): se parte el tramo de mayor error
  hasta que la suma de los errores quede bajo 1e-12 (integral interior) y 1e-11 (exterior) del total, con 1000 tramos
  a lo más; los p chicos conservan sus cifras relativas. En la bilateral el integrando interior es simétrico en z y
  basta el doble de la integral en [0, 9]. Con 6 comparaciones, 8 gl y λ² = 0.5, un p pasa de 1.6 s (t = 2), 9 s
  (t = 5) y 44 s (t = 8) a 0.2–0.4 s en node; el Dunnett de `bib-siete` contra T1, de 153 s a 2 s.
- **Mismos resultados**: frente al cálculo anterior los p cambian a lo más en los últimos bits (4.8e-16 relativo en
  360 combinaciones de 2 a 5 comparaciones, λ de 0.05 a 0.97 con signos mezclados, gl de 1 a ∞, una y dos colas; el
  conjunto tardó 919 s antes y 38 s ahora); los 7 casos de Dunnett contra R siguen con la mayor diferencia escalada de 5.7e-14, y en 13 configuraciones extremas
  (p hasta 3e-10, 12 comparaciones, gl de 2 a ∞, λ de 0.999) la versión nueva difiere de `integrate` en 6.1e-14 a lo
  más. La huella de `tests/regresion.mjs` de `metodo-dunnett-bloques` se actualizó: sus cuatro p cambiaron en 1 o 2
  ulp (3.3e-16 relativo), sin cambio visible en el reporte.
- Prueba unitaria nueva: el Dunnett de `bib-siete` contra T1 tarda menos de 10 s y da los seis p de R a 1e-6
  relativo.
- La auditoría de accesibilidad da hasta 300 s a los escenarios del motor R (el arranque de webR en el navegador
  sin ventana a veces pasaba de los 180 s y la medición no terminaba).

### 0.5.0 · Fundamentos y suite LABG (5 oct 2026)

- **Bloque 9, Fundamentos**: una ficha por cada uno de los 78 análisis, en español y en inglés, con nueve apartados:
  para qué sirve (y sus otros nombres), preguntas típicas, el fundamento teórico con el modelo, sus términos y las
  hipótesis, los supuestos con cómo revisarlos en la app y su alternativa (con botones que las abren), los **datos
  necesarios** en un recuadro dorado (columnas con tipo y papel, tamaño mínimo, faltantes y desbalance, formato largo
  frente a ancho, las primeras filas del ejemplo, errores frecuentes, «Cargar estos datos de ejemplo» y plantillas
  CSV y XLSX), cómo se interpreta con un ejemplo de redacción y las guías de cada estadístico, limitaciones y métodos
  relacionados, 3 a 5 referencias APA y «Continúa en la suite LABG». Catálogo con buscador (también por los otros
  nombres) y filtros por familia, tipo de respuesta, grupos y factores y diseño; **mapa de métodos** en SVG
  (respuesta × estructura, cada nombre abre su ficha). Se llega desde «¿Qué es este análisis?» en el catálogo y en
  cada resultado, y desde la lista «Qué puedes analizar» de Inicio. Las fichas son datos (`data/fundamentos/<id>.js`,
  con su índice generado por `tools/fundamentos/indice.mjs`), se cargan al abrirse y quedan en la caché sin conexión.
- **Fórmulas en MathML** con un convertidor propio de TeX (`js/nucleo/formulas.js`): sin bibliotecas ni peticiones,
  legibles con lector de pantalla.
- **Bloque 10, Suite LABG** y **LABGSuggest 1.0.0** (`js/labg-suggest.js`, `css/labg-suggest.css`): el recuadro
  «Explora la suite LABG» (también al final de Inicio) con PCAPro, ClusteringPro, AgriDesign y CorrelationPro: logo
  como enlace, versión, lema, funciones tomadas de su documentación publicada, Abrir app, Manual y Citar (APA y
  BibTeX). CorrelationPro, sin versión pública, va con marca provisional y sus datos como PENDIENTE. Las sugerencias
  aparecen solo donde continúan el trabajo (al pie del resultado y en la ficha de los análisis de las reglas, al pie
  de las familias y en el bloque Datos según la estructura de la tabla), sin ventanas emergentes; cada una se oculta
  en su lugar y «Enviar datos a …» descarga la tabla en CSV y abre la app. Datos en `data/suite.js` y reglas en
  `data/suite-rules.js`.
- **Revisión técnica independiente** de las 78 fichas en seis grupos (`docs/revision-fundamentos.md`; inventario de
  análisis y fichas en `docs/inventario-analisis.md`): 49 fichas corregidas. Dos conjuntos de ejemplo nuevos y
  ficticios: `arroz-subdivididas` (parcelas subdivididas) y `sorgo-bib` (bloques incompletos balanceados).
- **Errores de la app corregidos** que encontró la revisión:
  - **Kappa ponderada**: si el primer evaluador no usaba alguna categoría, la ponderación usaba un orden falso. Caso
    nuevo contra R (`contingencia/severidad-sin-categoria`).
  - **Eficiencia relativa del cuadro latino**: las etiquetas «filas como bloques» y «columnas como bloques» estaban
    invertidas. Casos `latino-cinco` y `latino-huertos` regenerados.
  - **Tamaño de muestra de una proporción con población finita**: ahora n₀/[1 + (n₀ − 1)/N] (Cochran, 1977); la de la
    media sigue igual. **Muestreo estratificado** con todos los estratos completos: el intervalo ya no sale `NaN`.
  - **Potencia del ANOVA con la varianza entre medias**: el código R fallaba y las notas mostraban medias sin uso.
  - Reabrir un análisis desde el Reporte o una ficha conserva los grupos y las opciones de la prueba t, Wilcoxon,
    Kruskal-Wallis, Friedman y la revisión de supuestos.
  - Los diseños mixtos (bloques y parcelas divididas) ofrecen «Dentro de cada nivel de»; los BLUP que no caben en el
    cuadro lo avisan.
  - Textos: recomendaciones de supuestos sin «Hito 1.5/1.6» ni un ANOVA de Welch inexistente; Friedman y Dunnett con
    alternativas que existen; la interacción en diseños con estratos remite a comparar dentro de cada nivel; Neyman
    avisa cuando la suma redondeada pasa del total; «del perfil», el nombre del modelo de mezclas, «(faltante)»
    traducido, la guía del WAAS y el título de Cohen (1968).
- Pruebas: `tests/fundamentos.mjs` (cobertura del 100 %, nueve apartados en los dos idiomas, 63 ejemplos corridos en
  node, 1472 fórmulas, plantillas e índice) y `tests/suite-enlaces.mjs` (logos, datos PENDIENTE solo donde toca,
  reglas y enlaces vivos), en la batería; seis escenarios de accesibilidad nuevos y el recorrido con Tab por los 10
  bloques. El auditor reconoce cada parada del foco por el elemento (antes, dos cuadros con el mismo comienzo de título
  cortaban el recorrido): ahora recorre más de 600 paradas en cada ancho, todas con su anillo de foco.
- **Accesibilidad**: los cuadros y las fórmulas más anchos que su espacio reciben el foco con Tab, como región con el
  título del cuadro, para recorrerlos a los lados con el teclado (solo mientras se desplazan); los enlaces de «Qué
  puedes analizar» y la casilla de la intro miden al menos 24 px. Revisión con axe-core 4.13 (WCAG 2.1 A y AA) en
  Inicio, Datos, el catálogo y el mapa de Fundamentos, dos fichas, la Suite y un resultado, en claro y oscuro, a 1280
  y 360 px: sin violaciones, salvo la rejilla de Datos, que se recorre desde la cuadrícula (role="grid", flechas y
  Re Pág/Av Pág). Lighthouse 12: accesibilidad 99–100, buenas prácticas 100 y SEO 100; el rendimiento de carga queda
  en 28–50 (4.2 MB de JavaScript en 108 archivos al abrir) y pasa a un hito propio de la Fase 5.
- Documentación: README, capítulos 9 (Fundamentos) y 10 (Suite LABG) del manual (los apéndices pasan al 11; el
  cuadro de ejemplos, a 27), `codemeta.json` y `CITATION.cff`.

### 0.4.3 · Intro, logo σ e inventario de estadísticos (4 oct 2026)

- **Secuencia de apertura** (`js/intro.js`, `css/intro.css`, ≈ 39 KB, sin imágenes, fuentes ni bibliotecas): un punto
  dorado, la constelación de letras griegas de la estadística con paralaje, el logo que se traza y se llena como metal
  líquido, un destello y una onda, «SigmaPro» letra por letra y el isotipo LABG. A los 5.6 s se queda fija, con
  destellos en el logo y el botón **Start** (negro con vivos dorados) que lleva a la app: el logo y el isotipo viajan a
  su lugar en el encabezado y el fondo se abre en iris. La completa la primera vez, una corta (1.5 s) después; nada en
  recargas de la misma pestaña; Esc o «Saltar»; con «reducir movimiento», la escena quieta. Inicio → «Acerca de
  SigmaPro»: ver la intro, pantalla de presentación en bucle (para clase o un stand) y desactivarla. Animada en el
  compositor: no se traba mientras cargan los scripts. Guion, tiempos y constantes en `docs/intro.md`; prueba
  `tests/intro.mjs` (en la batería).
- **Logo nuevo**: la σ minúscula con serifas en oro sobre el cuadro negro, en el encabezado, el favicon y
  `iconos/` (SVG y PNG de 192 y 512).
- **Fase 5, Hito 5.0** (plan en `propuesta/FASE5.md`): registro de estadísticos `js/nucleo/guias.js` (119 fichas con
  nombre, símbolo, grupo, qué es y los títulos con que aparece; `SP.guias.buscar` también con la interfaz en inglés,
  gracias a `SP.T.origen`); `tools/inventario/inventario.mjs` corre los casos en los dos idiomas y escribe
  `docs/inventario-estadisticos.md` (78 análisis; ≈ 80 % de las columnas de estadísticos ya con ficha);
  `tests/regresion.mjs` fija la huella de los resultados (70 474 números de 272 casos) y de los reportes.

### 0.4.2 · Ilustraciones en el catálogo y temas de las gráficas (4 oct 2026)

- **Ilustraciones del catálogo**: cada uno de los 78 análisis tiene su miniatura vectorial propia
  (`js/interfaz/ilustraciones.js`): el croquis del diseño, la curva, las barras con letras, el escalón de
  supervivencia… En su tarjeta, en la recomendación del asistente y en la barra del análisis elegido. Siguen el tema
  claro u oscuro y son decorativas para los lectores de pantalla (el nombre y el resumen dicen lo mismo).
- **Seis temas para todas las gráficas** (`js/interfaz/temas-graficas.js`): SigmaPro (oro y negro, el de siempre),
  Minimalista (grises, sin rejilla), Cuadrícula (panel gris con rejilla blanca), Revista (blanco y negro, letra con
  serifas, fondo blanco aun en oscuro), Daltonismo (paleta de Okabe e Ito) y Presentación (letras grandes y trazos
  gruesos). El selector está arriba de las gráficas de cada análisis, en el bloque Figuras y en el Estudio de figuras
  (con los ajustes de la app); se recuerda en el navegador. Las descargas SVG, PNG, TIFF y PDF y el reporte salen con
  el tema elegido (Revista, con letra Times).
- Pruebas: cada análisis tiene su ilustración y es un SVG bien formado; los temas (seis, el desconocido vuelve a
  SigmaPro); dos escenarios de accesibilidad con el selector y un tema puesto.

### 0.4.1 · Catálogo nuevo, cuadros en CSV y un arreglo (4 oct 2026)

- **Catálogo de análisis rediseñado**: arriba, «Con tus datos» (filas, numéricas, factores con sus niveles, bloques,
  parcelas, fechas, conteos, proporciones, columnas 0/1), cuántos análisis se pueden hacer con la tabla y el que
  recomienda el asistente con su porqué y los pasos siguientes. Abajo, cada familia con su ícono y sus análisis en
  tarjetas: nombre, para qué sirve y su estado (listo con tus datos, qué le falta, no necesita datos, motor R). Búsqueda
  por texto, filtro «solo los que puedo hacer con mis datos» (se recuerda) y por familia. Al elegir un análisis, el
  catálogo se recoge en una barra con el elegido y el botón para volver a abrirlo. La revisión vive en
  `js/nucleo/aplicable.js` (sin DOM, con pruebas unitarias): las entradas de cada método y algunos requisitos propios.
- **Cuadros en CSV**: cada cuadro de Análisis y de Explorar tiene «Bajar en CSV», con los números completos (sin el
  redondeo de la pantalla), los intervalos en dos columnas, coma y punto decimal, en UTF-8 con BOM.
- **Arreglo**: desde el Hito 4.2, el formulario de los diseños experimentales (bloques, cuadro latino, parcelas…) y el
  de las comparaciones de medias mostraban el del generador de diseños: la función nueva se llamaba igual que la
  anterior (`formDiseno`) y la tapaba. Ahora es `formDisenoSuperficie`. Dos guardas nuevas: `tests/correr.mjs` rechaza
  dos funciones con el mismo nombre en un archivo, y la auditoría marca como falla un escenario cuyo análisis termina
  en error (antes contaba solo la accesibilidad del mensaje).
- `tools/i18n/agregar.mjs`: agrega traducciones a `js/i18n/en.js` y lista las que faltan.

### Hito 4.5 · Interfaz en inglés (4 oct 2026)

- **Español e inglés**: el selector ES | EN de la barra cambia el idioma de toda la app (se guarda el trabajo y se
  recarga); también `?lang=en` en la dirección. El idioma elegido se recuerda en el navegador. Español por omisión.
- Catálogo inglés de 5,848 textos (`js/i18n/en.js`, que solo se carga con la interfaz en
  inglés): controles, mensajes, resultados, conclusiones, semáforos, párrafos del informe con sus citas y referencias
  en el estilo APA inglés, las figuras, el asistente, el constructor, los datos de ejemplo y el bloque de validación.
  El hilo de cálculo recibe el mismo catálogo.
- Textos que estaban fijos en español ahora pasan por la traducción: «dentro de» de los efectos aleatorios, las celdas
  imputadas, los ejes del AMMI y del GGE (PC1, PC2), las DE (ED10, ED50, ED90), el nivel de la heredabilidad, la forma
  de la tabla, las listas («y»), las comillas de los nombres de columnas («x» → “x”), las fechas y los números
  (es-MX o en-US), el idioma del reporte HTML y del Word, los nombres de las familias del catálogo, de los diseños y
  de las comparaciones en el informe y los hitos.
- `tests/idioma.mjs` (también en `tests/pruebas.ps1`): cada texto del código, de la página y de los ejemplos tiene su
  traducción con los mismos marcadores; 809 casos dan exactamente los mismos 71,548
  números en español y en inglés, y al armar sus reportes, párrafos y código R en inglés no queda ningún texto sin
  traducir. La auditoría de accesibilidad se puede correr en inglés (`SIGMAPRO_AA_IDIOMA=en`).
- Quedan en español: los comentarios del código R equivalente y el manual de usuario.

### 0.4.0 · Hito 4.4 · El asistente reconoce las parcelas; cierre de los cálculos de la Fase 4 (4 oct 2026)

- **Asistente**: cuando una columna identifica las parcelas (parcela, subparcela, franja…), reconoce en los datos las
  parcelas divididas (un factor que no cambia dentro de cada parcela del bloque), las subdivididas y las franjas; las
  propone en su pregunta y en la recomendación dice lo que vio. Sin bloques, la parcela queda como la repetición de
  cada parcela grande. Lo que se conteste en la pregunta manda.
- Las columnas que se llaman como parcelas ya no se proponen como factores de tratamiento.
- Ejemplo nuevo: «Trigo: riego × variedad (parcelas divididas)», con la columna de la parcela grande (ficticio).
- **Versión 0.4.0**: los cálculos de la Fase 4 (Hitos 4.0 a 4.4) están completos, con 848 casos y 93 157 valores
  contra R. Falta la interfaz en inglés (Hito 4.5).

### Hito 4.3 · Modelos generalizados ampliados (4 oct 2026)

- **Intervalos por verosimilitud perfilada** de los coeficientes del GLM (opción del formulario), los de `confint()`
  de glm, pero con la raíz exacta del perfil en lugar de su interpolación por splines; con la dispersión de Pearson en
  las cuasi, la gamma y la gaussiana inversa, y con θ fija en la binomial negativa. Si la verosimilitud no baja lo
  suficiente en una dirección, ese límite queda como «—».
- **Corrección de Firth** para la separación en la binomial con logit (grupos con 0 % o 100 %): coeficientes de la
  verosimilitud penalizada, sus p por la razón de verosimilitudes penalizadas, intervalos por el perfil penalizado y
  análisis de devianza con la misma razón (como logistf), medias y pares. El código R lo hace en R base. Cuando el
  ajuste ordinario tiene separación, su aviso sugiere Firth.
- **Gaussiana inversa** (en «respuestas positivas» y en la fórmula) y los enlaces **raíz cuadrada**, **1/μ²** y **de
  potencia** μ^λ (`power()` de R); la binomial negativa admite también la raíz.
- **GLMM**: la familia **gamma** (con su dispersión), la **cuadratura adaptativa de Gauss-Hermite** (de 5 a 25 nodos,
  con un solo intercepto aleatorio y la binomial o la de Poisson; con el efecto por observación vuelve a Laplace) y la
  **prueba de razón de verosimilitudes de cada efecto aleatorio** (contra el modelo sin él).
- Tres hallazgos de lme4, documentados en la validación: con nAGQ > 1 su log-verosimilitud omite la del modelo
  saturado (la app se la suma: así el AIC, el BIC y la prueba quedan bien; en cbpp, −91.983, igual a la integral
  directa); glmer.nb con nAGQ > 1 estima mal θ, porque esa parte depende de θ (la cuadratura queda solo para binomial
  y Poisson), y la varianza de los aleatorios de la gamma es (θ·σ)², que lme4 2.0 ya no informa así (la app la calcula
  aparte). La gamma mixta va sin la prueba de los aleatorios: su verosimilitud de Laplace no se compara con la de glm.
- Validación: 14 casos nuevos (11 del GLM y 3 del GLMM) y 23 regenerados con los intervalos y la prueba de los
  aleatorios; cuatro escenarios del código R, cinco pruebas unitarias y cinco escenarios de accesibilidad. El escenario
  del GLMM por fórmula usaba una columna que la tabla toma como identificador y daba un error (el auditor no lo veía
  porque el mensaje también es accesible): ahora usa los bloques del aguacate.

### Hito 4.2 · Superficies de respuesta ampliadas (4 oct 2026)

- **Generador de diseños** (método nuevo, sin datos): central compuesto rotable, ortogonal, de caras centradas o en dos
  bloques ortogonales (con la media fracción desde cinco factores), Box-Behnken, factorial 2^k con puntos centrales,
  simplex-látice y simplex-centroide. Da las corridas codificadas y, con los niveles bajo y alto (o el total de la
  mezcla), en unidades originales; con una semilla, el orden de corrida al azar dentro de cada bloque. El botón «Abrir
  en Datos» lo convierte en una hoja lista para anotar la respuesta.
- **Codificación a mano** en la superficie de respuesta: −1 y +1 en los niveles que se indiquen para cada factor (las
  predicciones no cambian; los coeficientes codificados sí).
- **Mezclas** (método nuevo): modelos lineal, cuadrático y cúbico especial de Scheffé sobre las proporciones (cada fila
  dividida por su suma, también en porcentaje o en cantidades), ANOVA contra la media, falta de ajuste contra el error
  puro, las sinergias y los antagonismos, y la mezcla de mayor (o menor) respuesta en todo el simplex con su IC.
  Gráficas: la superficie ternaria con curvas de nivel y la traza de Cox.
- **Deseabilidad** (método nuevo): varias respuestas, cada una con su modelo de segundo orden, combinadas con las d de
  Derringer y Suich (la mayor, la menor o un valor meta; exponentes e importancias) en una D global; la combinación más
  deseable se busca con Nelder-Mead en el cubo o la esfera del diseño. Gráfica: las curvas de nivel de D.
- **Superficie en 3D**: la superficie ajustada en perspectiva, con botones para girarla, junto a las curvas de nivel.
- Ejemplos nuevos: el alargamiento del hilo (Cornell 2002, mezclas) y tres respuestas de un fruto (sintético,
  deseabilidad). El informe tiene el párrafo de métodos y resultados de los tres métodos nuevos.
- Validación: 22 casos nuevos (14 diseños, 5 mezclas, 2 de deseabilidad y la codificación a mano; 32 en la familia,
  4 198 valores), cinco escenarios del código R, cuatro pruebas unitarias y cuatro escenarios de accesibilidad.

### Hito 4.1 · Ensayos multiambiente ampliados (4 oct 2026)

- **Celdas genotipo × ambiente vacías**: se imputan por EM-AMMI (Gauch y Zobel, 1990), como metan, con los ejes que se
  elijan (1 por omisión); el reporte lista las celdas imputadas y la interacción pierde un grado de libertad por cada
  una. Desactivar la casilla devuelve el aviso de antes.
- **Estabilidad**: las estadísticas no paramétricas de Huehn (S1, S2 con sus pruebas Z; S3 y S6), el YS de Kang
  (rendimiento y estabilidad, con los genotipos seleccionados) y el índice de confianza de Annicchiarico (en todos
  los ambientes, los favorables y los desfavorables).
- **AMMI**: WAAS (estabilidad con los ejes significativos, o los que se pidan) y WAASY (respuesta y estabilidad con el
  peso que se elija), con su cuadro y la gráfica de respuesta contra estabilidad.
- **GGE**: el genotipo ideal y el ambiente ideal (con su gráfica de anillos) y la comparación de dos genotipos: en
  qué ambientes es mejor cada uno según el biplot y según los datos.
- **Análisis en dos etapas** (método nuevo): las medias ajustadas de cada ambiente con su varianza y el análisis
  conjunto ponderado, con la varianza de la interacción por REML; sirve con errores distintos entre ambientes y con
  genotipos que faltan, sin imputar. El asistente lo sugiere después del análisis conjunto.
- Validación: 9 casos nuevos y 15 regenerados (24 de multiambiente, 8 360 valores, diferencia máxima 1.4 × 10⁻¹²);
  cuatro escenarios del código R y cinco pruebas unitarias. Hallazgos documentados: la errata de agricolae en la varianza
  de S1, el S1 de metan, y que nlme con sigma fija no da la REML estándar.

### Hito 4.0 · Regresión no lineal ampliada (4 oct 2026)

Primer hito de la Fase 4 (`propuesta/FASE4.md`): las mejoras que quedaban pendientes para versiones futuras.

- **Brain-Cousens** (hormesis: estímulo a dosis bajas), de 5 y 4 parámetros, en dosis-respuesta: la DE50 después del
  máximo, la dosis de máxima respuesta y la respuesta máxima, con su EE por la derivada implícita (como ED y MAX de
  drc). Sin estímulo (f ≤ 0 o b ≤ 1), la conclusión lo dice.
- **Michaelis-Menten**, con y sin respuesta en la dosis cero, en la respuesta con meseta.
- **Dosis económica óptima**: con el precio del producto y el del insumo, la dosis en que la pendiente de la curva
  iguala la razón de precios, y la respuesta en ella, con su EE (cuadrático-meseta, lineal-meseta, Mitscherlich y
  Michaelis-Menten). Si la curva empieza más plana que la razón, la dosis es cero y lo dice.
- **Pesos** por observación (una columna; las filas con peso cero no entran), como `nls(weights = )`.
- **Intervalos por verosimilitud perfilada** (opción del formulario): pueden ser asimétricos y, si los datos no acotan
  un parámetro por un lado, ese límite queda como «—». Lineal-meseta queda con Wald (su quiebre no deja perfilar).
- **Elegir el modelo por AIC**: ajusta todos los de la familia y los ordena en un cuadro con ΔAIC y pesos de Akaike.
- **Lineal-meseta con grupos**: también la prueba de cada parámetro común, con el óptimo exacto por perfil.
- **Gráfica con la dosis en escala logarítmica** (casilla del formulario), con la dosis cero una década debajo de la
  menor, como el eje partido de drc.
- **Error corregido**: con residuos grandes (un log-logístico ante hormesis), el pulido final de Gauss-Newton se
  alejaba del óptimo y el ajuste quedaba marcado como convergido con más suma de cuadrados (0.2132 contra 0.2071 en la
  lechuga de van Ewijk y Hoekstra). Ahora el paso se amortigua y, si no llega, queda el punto de Levenberg-Marquardt.
  Con e ≤ 0 el log-logístico ya no devuelve su límite inferior: queda fuera del dominio.
- Validación: 8 casos nuevos y 2 regenerados (18 de regresión no lineal, 1 074 valores, diferencia máxima 8.2 × 10⁻⁸),
  tres escenarios del código R y ocho pruebas unitarias. Las pruebas que corren R usan la versión con que se generaron
  las referencias (`tests/r/sesion.txt`), porque una versión recién instalada llega sin paquetes.

### 0.3.3 · Arreglos encontrados al escribir el manual (4 oct 2026)

Al escribir el manual de usuario, cada resultado se revisó en la pantalla y salieron estos errores:

- **Látice y alfa-látice**: el análisis intrabloque presentaba los tratamientos **sin ajustar** por los bloques. R
  reordena `rep/bloque + trat` como `rep + trat + rep:bloque`, y la referencia de las pruebas cometía el mismo error. Ahora
  el modelo es `y ~ rep + rep:bloque + trat` con el orden escrito (`analizar(texto, { conservarOrden })`, como
  `terms(…, keep.order = TRUE)`): los tratamientos van al final, ajustados por los bloques, y sus medias son ajustadas. El
  código R usa `keep.order = TRUE`, la referencia `tests/casos/disenos/generar.R` se corrigió, los casos `latice-simple`
  y `latice-alfa` se regeneraron (el alfa-látice de 24 genotipos pasa de F = 7.333 a 5.242) y la nota del cuadro dice
  «Análisis intrabloque…» en lugar de «Datos balanceados» (también en los bloques incompletos balanceados).
- **Reabrir un análisis** desde el reporte, desde un proyecto o desde lo recuperado volvía con sus papeles pero no con
  todas sus opciones (el nivel de confianza, el de significancia, los valores para predecir, la prueba exacta…): ahora
  las opciones que se llaman igual en el pedido y en el formulario pasan siempre. `tests/exportar.mjs` lo comprueba.
- **Regresión no lineal**: el cuadro de parámetros describía la *b* del lineal-meseta como «pendiente en la DE50» y la
  *c* de Mitscherlich como «límite inferior»; el significado de cada parámetro depende ahora del modelo.
- **Ancha → larga**: las columnas que identifican cada unidad pasan a factor, y una casilla deja el número de cada
  nombre de columna como valor numérico (`altura_15dds` → 15) para usar el tiempo como número.
- **Gráficas**:
  - la selección paso a paso y los mejores subconjuntos marcaban el eje x con 0.2, 0.4…: ahora con enteros
    (`dispersion({ x: { enteros: true } })`);
  - el mapa de calor de las correlaciones dejaba un hueco grande entre los nombres girados y la barra de color;
  - las etiquetas de los puntos resaltados (BLUP contra BLUE de la heredabilidad) y las de los biplots (GGE, AMMI) se
    encimaban: cada una busca ahora un lugar libre entre ocho alrededor de su punto, sin tapar otra etiqueta ni otro
    punto;
  - en el pronóstico ARIMA, la serie observada salía discontinua y dorada y el pronóstico continuo y negro: ahora al
    revés, con el pronóstico del color de su banda.
- **Textos**: los atajos de teclado del constructor no listaban A, E ni M; el estado del desarrollo en Inicio no
  mencionaba los Hitos 3.6 a 3.9; la conclusión de los polinomios dice «tiene componentes lineal y cuadrático
  significativos» cuando son varios.
- La página de pruebas (`tests/index.html`) carga ahora `ui.js` y `graficas.js`, así que las pruebas de las gráficas
  corren de verdad en el navegador (antes se daban por buenas sin el módulo).
- **Referencias del reporte**: la lista solo recogía las obras que citan los párrafos de métodos, y las conclusiones y
  las notas de los cuadros citaban otras sin su referencia completa (Landis y Koch, 1977, en el kappa; Fleiss, Cohen y
  Everitt, 1969; Belsley, Kuh y Welsch, 1980; Hyndman y Fan, 1996; Joanes y Gill, 1998; Steiger y Fouladi, 1997;
  Agresti, 2002). Las siete están ahora en la bibliografía y el documento recoge las citas de las conclusiones, las
  notas, el semáforo y las recomendaciones, escritas de cualquiera de las formas que usan los métodos
  (`SP.informe.citasEnTexto`). La nota del GGE cita el libro de Yan y Kang (2003).
- La cita del programa dice «Barrera-Guzmán, L. Á.», como en el resto de la suite; el aviso del motor R, «unos 25 MB»
  como los demás textos; y la teja «Mayor diferencia» de la validación dice cuántos casos tienen su tolerancia
  documentada (4 de clase D pasan de 10⁻⁶ con su motivo), para que no parezca una falla.
- El resumen del rendimiento en el bloque Validación dice «un navegador Chromium» y su versión, sin nombre comercial.
- **Manual de usuario** en español (`manual/`): introducción, un capítulo por bloque y cinco apéndices (archivos,
  cuando algo no sale, glosario, referencias y licencia), con capturas de la app y las herramientas para rehacerlas,
  unir las partes, revisar los huecos de las hojas e imprimir el PDF (`manual/LEEME.md`).
- Versión 0.3.3. 276 pruebas unitarias en el navegador.

### 0.3.2 · Hito 3.9 · Guardado automático del trabajo (4 oct 2026)

- Mientras se trabaja, los datos (con sus tipos, columnas derivadas y filtro), los análisis del reporte (con su vista y
  sus columnas visibles) y los ajustes de las figuras se guardan en el almacenamiento del navegador (IndexedDB), dos
  segundos después del último cambio y al ocultar o cerrar la pestaña. Nada sale del equipo; también con doble clic.
- Al volver a abrir SigmaPro, Inicio y Datos avisan que quedó un trabajo (fecha, origen, filas, análisis) con
  **Recuperar el trabajo** y **Descartar**. Lo encontrado se aparta mientras se decide: trabajar en otra cosa no lo pierde.
  Recuperarlo con otros datos abiertos pide confirmación; los resultados se recalculan, como al abrir un proyecto .labg.
- Exportar tiene la tarjeta **Guardado automático**: la casilla para desactivarlo (y entonces se borra lo guardado), la
  hora y el contenido de lo último guardado y **Borrar lo guardado**, para las computadoras compartidas. Si el navegador
  no deja guardar (ventana privada, almacenamiento bloqueado), la tarjeta lo dice y la app sigue igual.
- Es rápido: con 100 000 filas y 10 columnas, guardar toma unos 30 ms (12 ms bloquean la página): las columnas numéricas
  pasan tal cual (`SP.hoja.serializar(true)`), sin comprimir ni calcular huellas.
- `SP.proyecto.instantanea` y `deInstantanea` (el formato, con su versión); `aplicarProyecto` acepta un trabajo sin
  datos (solo cálculos sin tabla) y el mensaje de lo recuperado.
- Versión 0.3.2. 267 pruebas unitarias, 87 escenarios de accesibilidad; `tests/exportar.mjs` recupera el trabajo en
  una página nueva con los mismos cuadros y comprueba que desactivarlo borra lo guardado.

### Arreglo · rango estudentizado (4 oct 2026)

- `ptukey`: el primer término de la integral interna (`probRango`) usa ahora el umbral exp(−50/k) del algoritmo
  clásico; antes se elevaba a la k sin umbral. Solo cambian valores menores de 2e-22, así que ningún resultado se
  mueve: 266 pruebas unitarias y 795 casos contra R siguen aprobados.

### 0.3.1 · Hito 3.8 · Cox y MANOVA desde el constructor (4 oct 2026)

- El constructor de modelos arma también los métodos de la Fase 3:
  - zona **Evento (0/1)** (tecla E): con ella, la respuesta es el tiempo hasta el evento y el modelo es el de **Cox**,
    `Surv(tiempo, evento) ~ factores + covariables + strata(bloque)` (el bloque como estrato); sin factores ni
    covariables, la curva de **Kaplan-Meier**;
  - zona **Más respuestas** (tecla M): las respuestas se analizan juntas con la **MANOVA**,
    `cbind(y1, y2, …) ~ bloque + factores cruzados`.
  - Lo que esos métodos no admiten se dice con su arreglo: efectos aleatorios o parcelas grandes en Cox o en la MANOVA,
    covariables en la MANOVA (MANCOVA), un evento junto con varias respuestas. Con ellos la fórmula sale de las zonas
    (no se edita a mano) y la distribución de la respuesta no aplica.
- El asistente lleva también una recomendación de Cox o de MANOVA al constructor («Ajustar en el constructor»).
- Arreglo: una columna numérica que solo numera las unidades medidas dentro de la parcela (`fruto` 1, 2, …, 5; también
  planta, hoja, muestra, semilla, árbol…) ya no se propone como factor de tratamiento: se anota como submuestra en el
  diagnóstico de la estructura. Con el ejemplo del chile, el asistente proponía la MANOVA `~ bloque + variedad * fruto`;
  ahora `~ bloque + variedad`. La columna sigue disponible para agrupar (por ejemplo, como sujeto de medidas repetidas).
- Con estos tres hitos (3.6 a 3.8) quedan resueltos los pendientes de la Fase 3 que se habían anotado como principales:
  los estratos en Cox y en log-rank, los modelos ARIMA, la prueba M de Box y el constructor para la Fase 3.
- Versión 0.3.1 (`SP.VERSION` y el servicio sin conexión). 795 casos contra R con 83 645 valores, 266 pruebas
  unitarias, 86 escenarios de accesibilidad.

### Hito 3.7 · Modelos ARIMA y pronóstico (4 oct 2026)

- Método nuevo **Modelo ARIMA y pronóstico**: ARIMA(p, d, q) y SARIMA(p, d, q)(P, D, Q)s por máxima verosimilitud
  exacta, como arima de R: el modelo en espacio de estados con la parte no estacionaria difusa (κ = 1e6), el filtro de
  Kalman con la estructura de R, los AR transformados para quedar en la región estacionaria, el arranque por suma de
  cuadrados condicional y el óptimo pulido con Newton. Los faltantes dentro de la serie se quedan en su lugar.
- Los coeficientes con su EE **igual que arima**: el hessiano numérico de optim (paso 1e-3 con su parscale) en el
  espacio transformado y el jacobiano de la transformación. σ², log-verosimilitud, AIC y BIC; la prueba de Ljung-Box
  de los residuos; el pronóstico con su intervalo, como predict.
- **Búsqueda del orden** por AIC entre p, q = 0…2 (y P, Q = 0…1 con periodo), con la d y la D dadas. Cada modelo se
  prueba en un modo rápido (solo el AIC, sin el pulido ni el hessiano) y el elegido se ajusta completo: los 36
  modelos con periodo tardan unos 6 s en el navegador.
- Gráficas: la serie con el pronóstico y su banda, y la autocorrelación de los residuos; el párrafo del reporte con
  sus citas y el código R (con el pulido del óptimo y la nota de que arima, con method = "ML" e init, transforma init
  dos veces).
- Validación: 10 casos contra arima en su óptimo (AR, ARMA, integrados, un SARIMA, el modelo «airline» de los
  pasajeros aéreos, el lago Hurón, faltantes y la búsqueda por AIC): 1724 valores. Sin diferenciación coinciden a
  1e-8; con diferenciación, la inicial difusa deja en la verosimilitud un ruido de ~1e-13 (en R y en la app) y el
  óptimo solo queda fijo a ~1e-6: esos casos se comparan con 1e-5 (5e-5 con diferencia estacional), con el motivo en
  cada caso. 795 casos en total.

### Hito 3.6 · Estratos en supervivencia y prueba M de Box (4 oct 2026)

- **Estratos** en la supervivencia, como `strata()` de survival: cada estrato (lote, sitio, fecha de siembra) con su
  propio riesgo base.
  - **Log-rank y Peto-Peto estratificados**: cada estrato compara sus grupos y se suman los observados, los esperados
    y la varianza (survdiff con strata).
  - **Cox estratificado**: los conjuntos de riesgo se forman dentro de cada estrato, el estrato no tiene coeficiente,
    la concordancia cuenta solo pares del mismo estrato y la prueba de riesgos proporcionales usa la escala de tiempo
    de todos (como cox.zph).
- **Prueba M de Box** de igualdad de las matrices de covarianza, como supuesto de la MANOVA (entre las combinaciones
  de tratamientos) y del discriminante (entre los grupos): χ² de Box con su cuadro de log |S| por grupo, el semáforo
  (verde, ámbar entre 0.001 y 0.05 porque la prueba es muy sensible, rojo con su consejo) y el párrafo del reporte.
  Los grupos con menos unidades que variables quedan fuera, como en heplots.
- La escala de tiempo de la prueba de riesgos proporcionales se busca por bisección (antes, O(n · tiempos)).
- El ejemplo del frijol trae el lote de semilla, para estratificar.
- Validación: 4 casos nuevos de supervivencia con estratos contra survival y la M de Box en los 8 casos del
  multivariado contra heplots::boxM (uno con un grupo más chico que el número de variables): supervivencia 2357
  valores (4.3 × 10⁻¹²), multivariado 3052 valores (2.5 × 10⁻¹²). 785 casos en total.

### 0.3.0 · Hito 3.5 · Cierre de la Fase 3 (4 oct 2026)

- **La Fase 3 está completa**: versión 0.3.0 (`SP.VERSION` y el servicio sin conexión).
- **Asistente para la Fase 3**: cinco objetivos nuevos. «Tiempo hasta un evento» (Kaplan-Meier con log-rank; con
  covariables, Cox), «una variable medida en el tiempo» (tendencia, ciclo o autocorrelación), «varias respuestas a la
  vez» (MANOVA o discriminante), «muestreo» (aleatorio simple o estratificado) y «planear un ensayo» (las
  repeticiones con el CV de la respuesta de la tabla, y la potencia como paso siguiente). El constructor de modelos
  sigue para los modelos de fórmula: los métodos de la Fase 3 se eligen en el asistente o en el catálogo.
- **Rendimiento de la Fase 3** (`tests/rendimiento/medir.mjs`): los métodos nuevos con 100 000 filas, en meta. Lo
  que salió al medir: la concordancia de Cox comparaba todos los pares (O(n²), minutos con 100 000 filas); ahora
  recorre los tiempos de mayor a menor con un árbol de Fenwick (O(n log n)) y da los mismos conteos. Mann-Kendall y
  Sen comparan todos los pares: el método admite hasta 3000 observaciones y lo dice si hay más; la pendiente de Sen
  ordena sus 4.5 millones de pendientes una sola vez en un arreglo tipado (de 8.4 s a 0.7 s, los mismos resultados).
- 61 medidas de rendimiento, 84 escenarios de accesibilidad, 257 pruebas unitarias; 780 casos
  contra R con 80 646 valores.

### Hito 3.4 · Multivariado: MANOVA y discriminante (4 oct 2026)

- Familia **Análisis multivariado**, con dos métodos en el núcleo JS:
  - **MANOVA** en completamente al azar, bloques o factorial (hasta tres factores): las cuatro pruebas (Pillai,
    Wilks, Hotelling-Lawley y Roy) con su F aproximada para cada término, con sumas de cuadrados secuenciales como
    summary.manova; el ANOVA de cada respuesta y las medias por tratamiento.
  - **Análisis discriminante lineal** como MASS::lda: valores singulares y proporción de la traza, coeficientes de
    las funciones, centroides de los grupos y la tabla de clasificación con **validación cruzada** dejando uno fuera
    (la fórmula exacta de lda con CV = TRUE).
- Gráficas: el perfil de medias estandarizadas por tratamiento y las unidades en las dos primeras funciones
  discriminantes; párrafo del reporte con sus citas y el código R.
- **El ACP y los conglomerados no se duplican**: los análisis multivariados traen dos botones que bajan el CSV con
  las variables y el grupo para abrirlo en PCAPro o ClusteringPro (con la liga a cada app). El traspaso directo, sin
  archivo, queda pendiente: necesita que esas apps lo lean.
- Ejemplo nuevo: **Chile: medidas del fruto de cuatro variedades** (en bloques).
- Series de tiempo: el cuadro de componentes muestra el tiempo y los datos enteros sin decimales de relleno.
- Validación: 7 casos contra manova/summary.manova y summary.aov (stats) y lda/predict/lda(CV = TRUE) (MASS),
  incluido iris de Fisher: 2546 valores, diferencia escalada máxima 2.5 × 10⁻¹². 780 casos en total.

### Hito 3.3 · Series de tiempo (4 oct 2026)

- Tres métodos para una variable medida a intervalos iguales (lluvia mensual, rendimiento por año, capturas por día),
  ordenada por la columna del tiempo si se da:
  - **Autocorrelación**: ACF y PACF con su banda y las pruebas de **Ljung-Box** y **Box-Pierce** (con fitdf para los
    residuos de un modelo).
  - **Descomposición clásica** aditiva o multiplicativa: tendencia (media móvil centrada de un ciclo), componente
    estacional por posición del ciclo, residuo y la fuerza de la estacionalidad.
  - **Tendencia monótona**: prueba de **Mann-Kendall** (con empates y la corrección de continuidad) y la **pendiente
    de Sen** con su intervalo; omite los faltantes.
- Gráficas: correlogramas, serie con su tendencia, componente estacional, residuo y la serie con la recta de Sen;
  párrafo del reporte con sus citas y el código R.
- Ejemplo nuevo: **Estación meteorológica: lluvia y temperatura mensuales** (8 años).
- Kaplan-Meier: el cuadro de la mediana y los cuartiles muestra los tiempos enteros sin decimales de relleno.
- Validación: 11 casos contra acf, pacf, Box.test y decompose (stats) y mk.test y sens.slope (trend): 626 valores,
  diferencia escalada máxima 2.5 × 10⁻¹⁴. 773 casos en total.

### Hito 3.2 · Supervivencia (4 oct 2026)

- Familia **Supervivencia y series de tiempo**, con el tiempo hasta un evento (germinar, morir, florecer) y la
  censura (la unidad terminó el ensayo sin el evento):
  - **Curvas de Kaplan-Meier** por grupo con su intervalo (log, log-log o lineal), la mediana y los cuartiles con
    sus intervalos, la tabla de supervivencia (Greenwood) y la comparación de las curvas con **log-rank** o
    **Peto-Peto**.
  - **Modelo de riesgos proporcionales de Cox** con factores y covariables, empates de Efron o de Breslow: razones de
    riesgo con su intervalo, las pruebas de razón de verosimilitudes, Wald y score, la concordancia de Harrell y la
    **prueba de riesgos proporcionales** (Grambsch y Therneau) por término y global.
- Gráficas: las curvas escalonadas con las censuras marcadas (y la banda del intervalo con una sola curva) y las
  razones de riesgo en escala logarítmica; el párrafo del reporte con sus citas y el código R (survival).
- Ejemplo nuevo: **Frijol: días a la germinación** (tres tratamientos pregerminativos, censura a los 21 días).
- `tests/correr.mjs` revisa que ninguna referencia del informe tenga la clave repetida (en un objeto literal la
  última pisa a la primera sin aviso, como pasó en el Hito 3.0). El muestreo estratificado dice en su conclusión
  cuántas unidades tomar en cada estrato con la asignación de Neyman.
- Validación: 10 casos contra survfit, quantile, survdiff, coxph (pulido con eps = 1e-12) y cox.zph del paquete
  survival: 1588 valores, diferencia escalada máxima 4.3 × 10⁻¹². 762 casos en total.

### Hito 3.1 · Muestreo (4 oct 2026)

- Tres métodos nuevos en la familia **Tamaño de muestra, potencia y muestreo**, con las fórmulas de Cochran (1977):
  - **Tamaño de muestra** para estimar una media (con la DE y un error en unidades, o con el CV y un error en % de la
    media) o una proporción, con la corrección por población finita. No necesita datos.
  - **Estimación con muestreo aleatorio simple**: la media o la proporción (una columna 0/1 se reconoce sola), su EE
    con la corrección por población finita, el intervalo con t de n − 1 gl y el total de la población.
  - **Muestreo estratificado**: la media y el total de la población con estratos (huertas, lotes, regiones, tipos de
    suelo), con el tamaño de cada estrato escrito en el formulario, el aporte de cada estrato a la varianza, los gl
    efectivos de Satterthwaite y, con un tamaño total, cómo repartir una muestra nueva (proporcional y de Neyman).
- Gráficas: el tamaño de muestra según el error aceptado, la precisión según n y la media de cada estrato con su
  intervalo; el párrafo del reporte con sus citas y el código R.
- Ejemplo nuevo: **Aguacate: muestreo en tres huertas** (kilogramos por árbol y presencia de trips).
- Arreglo del Hito 3.0: la referencia de las repeticiones (Cochran y Cox, 1957) pisaba la del ANCOVA (Cochran, 1957)
  en el reporte; ahora cada una tiene su clave y una prueba lo vigila.
- Validación: 11 casos contra las fórmulas de Cochran escritas en R base por otro camino: 217 valores, diferencia
  escalada máxima 1.2 × 10⁻¹⁴. 752 casos en total.

### Hito 3.0 · Tamaño de muestra y potencia (3 oct 2026)

- **Empieza la Fase 3** (plan en `propuesta/FASE3.md`): potencia, muestreo, supervivencia, series de tiempo y
  multivariado, todo en el núcleo JS.
- Familia nueva **Tamaño de muestra, potencia y muestreo**, con cinco métodos que **no necesitan datos** (todo va en
  las opciones; el bloque Análisis los ofrece también sin datos cargados): medias con la prueba t (dos grupos,
  pareada o contra un valor), ANOVA de k tratamientos (con las medias esperadas o la varianza entre medias), dos
  proporciones, correlación, y el **número de repeticiones** de un experimento con el CV esperado y la diferencia que
  interesa (Cochran y Cox), en completamente al azar o en bloques.
- Cada uno calcula lo que falta: la potencia, el tamaño de muestra o el efecto detectable; con la curva de potencia
  según n, el párrafo con sus citas (Cohen 1988; Cochran y Cox 1957; Champely 2020) y el código R.
- Las mismas fórmulas que R y la misma búsqueda de la raíz (el zeroin2 de uniroot, con su intervalo y su tolerancia
  por omisión), así que hasta el n «exacto» coincide; la F no central es la de R (pnbeta).
- Validación: 14 casos contra power.t.test, power.anova.test, power.prop.test (stats) y pwr.r.test (pwr): 1020
  valores, diferencia escalada máxima 3.5 × 10⁻¹⁴. 741 casos en total.

### 0.2.0 · Hito 2.10 · Cierre de la Fase 2 (3 oct 2026)

- **La Fase 2 está completa**: versión 0.2.0 (`SP.VERSION` y el servicio sin conexión).
- **Repositorio propio del motor R**: `tools/motor-r/armar.mjs` arma `motor-r/` con webR 0.6.0 y los 70 paquetes de R
  que usan los métodos del motor (lme4, lmerTest, pbkrtest, nlme, emmeans, car y sus dependencias), con versiones y
  huellas fijas en `tools/motor-r/manifiesto.json`, el índice `PACKAGES.rds` y, con `--fuentes`, el código fuente
  exacto de webR y de cada paquete (GPL). No va en el repositorio por su tamaño: se arma y se publica junto a la app.
- **Motor R sin conexión**: servida por http(s) con su repositorio propio, la app toma webR y los paquetes del mismo
  origen; el servicio sin conexión los guarda en un almacén aparte (sin volver a la red y respondiendo también a las
  comprobaciones HEAD de webR). La prueba de privacidad lo comprueba: ninguna petición externa, y con la red cortada
  y el servidor apagado se calcula el modelo mixto. Con doble clic sigue el repositorio público de webR.
- **Rendimiento de la Fase 2** (`tests/rendimiento/medir.mjs --motor`): siete métodos del núcleo con 100 000 filas y el
  modelo mixto del motor R con 20 000; 53 operaciones, todas en meta. Correcciones que salieron de medir (sin cambiar
  ningún número de los casos): la familia automática del GLM pide una sobredispersión que importe (razón > 1.1, también
  en el efecto por observación del GLMM), reusa el ajuste de la familia base y detiene la θ de la binomial negativa en
  10⁸ con un aviso; IRLS también para cuando los coeficientes ya no cambian; las curvas no lineales se ajustan sobre
  las medias de cada celda (x, grupo) pesadas; la falta de ajuste de las superficies ya no arma una matriz densa.
- **Base común nueva** (`css/labg-base.css`): el nombre de la app no se encima con las herramientas en el celular.
- Documentación: pendientes, validación, licencias de terceros (los 70 paquetes y sus fuentes) y el README con cómo
  publicar el motor R sin conexión.

### Hito 2.9 · Asistente y constructor para la Fase 2 (3 oct 2026)

- **Asistente**: objetivo nuevo «Comparar genotipos en varios ambientes», que reconoce las columnas de genotipo, ambiente
  y repetición y lleva al análisis conjunto, la estabilidad, el AMMI o el biplot GGE (y al modelo mixto con BLUP).
- Conteos → **modelo lineal generalizado** (Poisson o binomial negativa); proporciones con su total o de 0/1 →
  **binomial**; sin el total, el ANOVA de los porcentajes con el aviso de lo que falta.
- Pregunta nueva por **bloques aleatorios**: bloques al azar, parcelas divididas y látice pasan al modelo mixto, y los
  conteos y proporciones al generalizado mixto (motor R, con el aviso de la descarga).
- **Medidas repetidas** en el tiempo: el modelo mixto con estructura de covarianza, con la pregunta de qué columna
  identifica cada planta o parcela; las parcelas divididas en el tiempo quedan como aproximación clásica.
- En «Relación entre variables»: curvas de crecimiento, dosis-respuesta, curva con meseta y la **superficie de
  respuesta** (combinación óptima); con una dosis numérica, también la curva con meseta entre los pasos siguientes.
- **Constructor**: zona nueva de **efectos aleatorios** (tecla A) y distribución de la respuesta (normal, conteo o
  gamma): modelo lineal mixto, generalizado o generalizado mixto, con la parcela grande como (1 | bloque:parcela); la
  fórmula escrita acepta efectos aleatorios y los explica.
- Textos que decían «llega en la Fase 2» actualizados en los supuestos, los diseños y el asistente.
- Pruebas: 3 casos nuevos del asistente y el constructor (las ramas de la Fase 2); 3 escenarios de accesibilidad más.

### Hito 2.8 · Ensayos multiambiente y estabilidad (3 oct 2026)

- **Familia nueva: Ensayos multiambiente y estabilidad**, en el núcleo JS (js/nucleo/multiambiente.js), adaptada del
  motor del bloque 9 de BreedingPro (del mismo autor, ya validado contra R).
- **Análisis conjunto de varios ambientes**: análisis de cada ambiente (bloques o completamente al azar), error
  combinado, ANOVA conjunto (ambientes contra repeticiones dentro de ambientes; genotipos también contra G × A, como
  con ambientes aleatorios), homogeneidad de los errores (Bartlett y razón máx./mín.) y la tabla de medias. Acepta
  parcelas perdidas (r armónica) o una media por celda.
- **Estabilidad**: regresión sobre el índice ambiental (Finlay-Wilkinson; Eberhart-Russell con b, S²d y su análisis
  de varianza), con el EE de b de cada regresión o del error combinado; ecovalencia de Wricke, varianza de Shukla y
  superioridad de Lin y Binns (con la mayor o la menor respuesta como objetivo).
- **AMMI**: ejes de la interacción con la F de Gollob y la F_R de Cornelius (número de ejes), puntajes de genotipos y
  ambientes, ASV; biplots AMMI1 y AMMI2.
- **Biplot GGE**: tabla centrada (o escalada) por ambiente, partición simétrica, por genotipo o por ambiente; quién
  ganó dónde (polígono, rayos y megaambientes) y media contra estabilidad (eje del ambiente promedio).
- Gráficas nuevas: biplot con polígono, rayos, vectores y eje del ambiente promedio; respuesta de cada genotipo por
  ambiente; regresiones sobre el índice. Párrafo con 12 referencias nuevas; código R solo con R base.
- Validación: 15 casos (data_ge y data_ge2 de metan, plrv de agricolae; balanceados, con parcelas perdidas y con
  una media por celda) contra lm, svd y chull de R: 3 248 valores, diferencia escalada máxima 2.8 × 10⁻¹³. 727 casos en total.
  El código R se corre en R en 4 escenarios más.

### Hito 2.7 · Superficies de respuesta (3 oct 2026)

- **Familia nueva: Superficies de respuesta**, en el núcleo JS (js/nucleo/superficie.js), sin paquetes de R.
- **Superficie de respuesta (segundo orden)**: modelo de segundo orden (o de primer orden con interacciones) en los
  factores codificados, con bloques opcionales; ANOVA por grupos de términos (primer orden, interacciones,
  cuadráticos puros) con la **falta de ajuste** contra el error puro; coeficientes codificados y la ecuación en
  unidades originales con sus EE; **punto estacionario** (máximo, mínimo o silla) con la respuesta estimada y su
  intervalo; **análisis canónico** (valores y vectores propios) y la **cresta** de máxima o mínima respuesta (análisis
  de cresta de Hoerl y Draper) dentro de la región experimental.
- **Primer orden y ascenso más pronunciado**: factorial con puntos centrales, curvatura por la falta de ajuste y el
  camino de ascenso (o descenso) más pronunciado en unidades originales.
- Codificación automática: en un central compuesto los axiales quedan en ±α; en otros diseños, del centro a los
  extremos; los datos ya codificados quedan igual.
- Gráfica nueva de **curvas de nivel** (marching squares, con el valor en cada curva, los puntos del diseño, el punto
  estacionario y la cresta), la respuesta sobre la cresta con su banda y los residuos; párrafo con cuatro referencias
  nuevas; código R solo con R base (lm, solve, eigen).
- Ejemplo nuevo (ficticio): **tomate, nitrógeno × potasio en un central compuesto rotable**.
- Validación: 10 casos (central compuesto rotable, en bloques y de caras centradas con cuatro factores, Box-Behnken
  con silla, factorial 3 × 3 sin error puro, factoriales con centros) contra lm, eigen y uniroot de R: 2 015 valores,
  diferencia escalada máxima 5.9 × 10⁻¹³. 712 casos en total. El código R se corre en R en 2 escenarios más.

### Hito 2.6 · Regresión no lineal y dosis-respuesta (3 oct 2026)

- **Familia nueva: Regresión no lineal**, en el núcleo JS (js/nucleo/nolineal.js): mínimos cuadrados no lineales por
  Levenberg-Marquardt con el gradiente analítico de cada modelo, valores iniciales por linealización y pasos finales de
  Gauss-Newton hasta un paso relativo de 1e-13. Lineal-meseta (no derivable en el quiebre) se ajusta por perfil (Brent
  en cada intervalo entre dosis) y luego se pule igual.
- Tres métodos: **Curva de crecimiento** (logístico, Gompertz con su punto de inflexión, Weibull), **Dosis-respuesta**
  (log-logístico de 4 y de 3 parámetros, con DE10, DE50 y DE90; admite la dosis cero) y **Respuesta a la dosis con
  meseta** (lineal-meseta y cuadrático-meseta con la dosis óptima y el valor en la meseta, y Mitscherlich).
- Con un factor de grupo (variedades, herbicidas, híbridos): un juego de parámetros por grupo y la **comparación de
  curvas** con la prueba F de la suma de cuadrados extra, contra una curva común y contra cada parámetro común.
- Parámetros con EE, t, p e intervalo de Wald con t; derivados por el método delta; ajuste (SCR, σ, R², AIC, BIC);
  gráfica de los datos con la curva de cada grupo y de los residuos; párrafo con cinco referencias nuevas; código R
  con nls que arranca en los valores de la app.
- Ejemplo nuevo (ficticio): **herbicidas, peso seco por dosis**.
- Validación: 10 casos (Orange por árbol, ChickWeight, DNase, Loblolly y ensayos sintéticos de herbicidas, tóxico y
  nitrógeno con meseta) contra nls con el mismo gradiente y el óptimo pulido: 572 valores, diferencia escalada máxima
  3.3 × 10⁻¹³. 702 casos en total. El código R se corre en R en 3 escenarios más.

### Hito 2.5 · Modelos lineales generalizados mixtos (3 oct 2026)

- **Dos métodos nuevos en la familia Modelos lineales generalizados, en el motor R** (lme4, car y emmeans):
  **Conteos o proporciones en bloques aleatorios** (desde un formulario) y **Modelo lineal generalizado mixto desde una
  fórmula** con términos aleatorios como en lme4. Binomial (con ensayos o 0/1), Poisson (con exposición) y binomial
  negativa (glmer.nb); enlaces logit, probit, log-log complementario, log e identidad.
- **Sobredispersión con un efecto aleatorio por observación** (Harrison 2014): sí, no o automático (si la prueba de
  Pearson del modelo sin él da p < 0.05, con conteos o proporciones agrupadas).
- Pruebas χ² de Wald de los efectos fijos tipo II o III (car::Anova; el III con contrastes de suma cero), coeficientes
  con razones de momios o de tasas, varianzas de los efectos aleatorios, ajuste (log-verosimilitud de Laplace, AIC,
  BIC, Pearson χ²/gl), medias en la escala de la respuesta con pares y letras, semáforo (sobredispersión, atípicos,
  ajuste singular), las gráficas del GLM, el párrafo para tesis con tres referencias nuevas y el código R.
- **Control estricto de glmer** (bobyqa con rhoend = 1e-12 y tolPwrss = 1e-12): con el de omisión, glmer se queda hasta
  1.4 × 10⁻⁴ del óptimo en los coeficientes (el ajuste interno sin converger desvía la verosimilitud 3 × 10⁻⁶).
- **EE**: de la hessiana de la verosimilitud de Laplace (lo de omisión de lme4), salvo con la binomial negativa o un
  ajuste singular, que van con RX: lme4 2.0 (el del motor) ya no calcula ahí la hessiana y la 1.1 del escritorio sí
  (hasta 2 % de diferencia); se fija la regla en los dos lados.
- Validación en el navegador: 8 casos (cbpp de Lesnoff et al. 2004 con y sin el efecto por observación, grouseticks
  de Elston et al. 2001 con dos agrupamientos y una covariable, el aguacate de los ejemplos con un ajuste singular y
  ensayos sintéticos con probit, binomial negativa con dos factores y tipo III, y exposición): 907 valores, diferencia
  escalada máxima 4.1 × 10⁻⁶ (grouseticks, con 5 cifras documentadas en los EE; los demás, 8.6 × 10⁻⁷). 692 casos en total.
- Motor R: al comprobar los paquetes instalados se callan sus mensajes (car avisa al cargarse que reemplaza un método de
  lme4 y la consola lo mostraba).

### Hito 2.4 · Modelos lineales generalizados (3 oct 2026)

- **Familia nueva: Modelos lineales generalizados**, en el núcleo JS (sin internet, al instante). Mínimos cuadrados
  iterativamente reponderados como glm.fit de R (con los mismos límites de los enlaces y la reducción del paso), hasta
  un cambio relativo de devianza de 1e-14. Binomial, cuasibinomial, Poisson, cuasi-Poisson, binomial negativa (θ por
  máxima verosimilitud alternada con el ajuste, como MASS::glm.nb, con su EE) y gamma; enlaces logit, probit, log-log
  complementario, log, inverso e identidad.
- Cuatro métodos: **Conteos** (Poisson y binomial negativa, con la exposición —área o tiempo muestreado— como
  desplazamiento log), **Proporciones** (éxitos de n ensayos o respuestas 0/1), **Respuestas positivas asimétricas**
  (gamma) y **Modelo lineal generalizado desde una fórmula**. La familia automática elige por la prueba de Pearson:
  con sobredispersión, binomial negativa en conteos y cuasibinomial en proporciones agrupadas.
- Análisis de devianza tipo I, II o III (χ² con la dispersión fija; F con la de Pearson en las cuasi y la gamma),
  coeficientes con z o t, razones de momios, de tasas o de medias con su intervalo de Wald, dispersión y prueba de
  sobredispersión, AIC y BIC, y las **medias en la escala de la respuesta** (probabilidades, tasas por unidad o medias)
  con su intervalo, sus pares (razones con los enlaces log y logit) y letras, también dentro de los niveles de otro
  factor. Reutiliza la rejilla de referencia y las comparaciones de la Fase 1.
- Semáforo (sobredispersión, atípicos, convergencia y separación en la binomial), gráficas de las medias y de los
  residuos de Pearson, párrafo para tesis con cinco referencias nuevas y el código R equivalente (glm o glm.nb, car,
  emmeans), con convergencia estricta para que dé las mismas cifras.
- Validación: 15 casos (InsectSprays, warpbreaks, snails, quine, Insurance y birthwt; los escarabajos de Bliss y la
  coagulación de McCullagh y Nelder; ensayos sintéticos con bloques, sobredispersión, exposición y dosis numéricas)
  contra glm, glm.nb (con θ pulida), anova.glm, car::Anova y emmeans: 2 006 valores, diferencia escalada máxima
  7.4 × 10⁻⁸. 684 casos en total. El código R se corre en R en 4 escenarios más.
- Auditoría de accesibilidad: los escenarios del motor R (que descargan R en cada perfil nuevo) los corre un solo
  auditor, uno tras otro; tres descargas a la vez agotaban el tiempo. Cuatro escenarios nuevos (58 en total).

### Hito 2.3 · Componentes de varianza por REML, heredabilidad y repetibilidad (3 oct 2026)

- **Familia nueva: Componentes de varianza y heredabilidad**, en el núcleo JS (sin internet, al instante). REML por
  información promedio (Gilmour, Thompson y Cullis 1995) sobre las ecuaciones del modelo mixto de Henderson, el de
  BreedingPro con un criterio de convergencia más estricto. El término con más niveles (por ejemplo, genotipo ×
  ambiente, o los genotipos fijos de los BLUE) se absorbe con el complemento de Schur porque su bloque es diagonal:
  200 genotipos en 4 ambientes en 0.4 s, 1000 genotipos en 1.6 s y 500 en 4 ambientes (6000 parcelas) en unos 5 s. Un
  componente que llega a cero queda en la frontera, sin EE, como en lme4.
- **Componentes de varianza (REML)**: factores aleatorios cruzados, anidados (cada uno dentro de los anteriores) o
  cruzados con sus interacciones dobles, y factores fijos opcionales. Cada componente con su EE (inversa de la
  información promedio), su porcentaje del total y la razón de verosimilitudes restringidas contra el modelo sin él,
  con p de la mezcla ½χ²₀ + ½χ²₁ (Self y Liang 1987).
- **Heredabilidad y BLUP de genotipos**: completamente al azar, bloques completos, bloques incompletos dentro de
  repeticiones (alfa-látice) y varios ambientes (genotipo × ambiente aleatorio). H² en medias con medias armónicas
  (Holland y col. 2003) y su EE por el método delta, H² por parcela, de Cullis, Smith y Coombes (2006) y de Piepho y
  Möhring (2007); BLUP con PEV y confiabilidad, BLUE (genotipos fijos) y la gráfica de BLUP contra BLUE; CV genético y
  del error; ganancia esperada por selección por BLUP, por la ecuación del criador y por el diferencial de selección,
  hacia valores mayores o menores.
- **Repetibilidad**: r = σ²i/(σ²i + σ²e) con su EE, la determinación con las medidas que hay, las medidas necesarias
  para 80 a 99 % (Cruz, Regazzi y Carneiro 2012) y el valor permanente predicho de cada individuo.
- Párrafos para tesis con sus citas (nueve referencias nuevas), semáforo (normalidad de residuos y de BLUP,
  atípicos, convergencia) y el código R equivalente con lme4, con tolerancia estricta del optimizador para que dé las
  mismas cifras (con las de omisión, lme4 se queda a 10⁻⁵ en algunos casos).
- Ejemplo nuevo (ficticio): **guayabo, 20 árboles en cuatro cosechas**; el alfa-látice y la avena en 14 ambientes
  sirven también para la heredabilidad.
- Validación: 17 casos (Dyestuff, Dyestuff2, Penicillin, Pastes, Rail y ergoStool; el alfa-látice, data_ge y
  data_ge2 de metan, desbalanceados, con componentes en cero y selección hacia el menor valor). La referencia ajusta con
  lme4 y pule el óptimo con pasos de Newton sobre V y P completas: 1 451 valores, diferencia escalada máxima
  4.9 × 10⁻¹⁰. 669 casos en total. El código R de los tres métodos se corre en R en 4 escenarios más.

### Hito 2.2 · Medidas repetidas en el tiempo con estructuras de covarianza (3 oct 2026)

- **Medidas repetidas en el tiempo** (familia Modelos mixtos, motor R con nlme y emmeans): la misma planta, parcela o
  animal medida en varias fechas, con los tratamientos entre unidades, el tiempo como factor y, si los hay, bloques.
  Se ajustan por REML las estructuras de covarianza entre fechas —independientes, simetría compuesta (y heterogénea),
  AR(1) (y heterogénea), AR(1) continua para fechas desiguales y no estructurada— y se elige la de menor AIC o BIC, o
  la que se pida; la tabla de las candidatas dice cuál se eligió y cuáles no se pudieron ajustar. De la elegida: pruebas
  F marginales de los efectos fijos con los gl del error de nlme (N − p), coeficientes, la correlación entre fechas, la
  matriz de covarianzas (y correlaciones) entre fechas de una unidad, las medias marginales con letras —por omisión,
  los tratamientos dentro de cada fecha— con esos mismos gl, el semáforo de los residuos normalizados (Shapiro-Wilk y
  Levene entre fechas), el perfil de cada tratamiento en el tiempo, el párrafo con sus citas (Pinheiro y Bates 2000;
  Wolfinger 1993; Akaike 1974 o Schwarz 1978) y el código R.
- La unidad es la combinación de unidad, tratamientos y bloque (las plantas pueden numerarse de nuevo en cada
  tratamiento). El tiempo numérico se mide en unidades del intervalo más corto entre fechas: así la AR(1) continua es
  la AR(1) cuando las fechas son parejas (con días, el optimizador se atoraba) y su parámetro es la correlación entre
  dos fechas seguidas. La no estructurada no entra sola con más de ocho fechas (demasiados parámetros).
- Ejemplo nuevo (ficticio): **maíz, altura en cinco fechas**, 4 dosis de N en 4 bloques, con correlación entre fechas
  y varianza creciente.
- Validación en el navegador: 6 casos (Orthodont de Potthoff y Roy 1964 con elección por AIC y por BIC, faltantes y la
  no estructurada pedida; BodyWeight de Crowder y Hand 1990 con fechas desiguales; sleepstudy sin tratamientos; el
  ejemplo de maíz con bloques) contra el R de escritorio: 2 370 valores, diferencia escalada máxima 1.4 × 10⁻⁷ (nlme
  3.1-169 en el motor y 3.1-166 en el escritorio). 652 casos en total.
- Corrección: el formulario de las comparaciones de los modelos mixtos (Hito 2.1) se llamaba igual que el de las
  comparaciones de medias de la Fase 1 y lo reemplazaba; ahora tienen nombres distintos.
- Auditoría de accesibilidad: cada escenario empieza en el modo Catálogo del bloque Análisis y cuenta como falla un
  error de la preparación o de la página (así se halló la corrección anterior); el corredor espera a que el navegador
  anterior suelte su perfil antes de abrir otro en el mismo puerto (las corridas alternaban una buena y una mala) y
  repite una vez la corrida que no devuelve nada.

### Hito 2.1 · Modelos mixtos completos y diseños con efectos aleatorios (3 oct 2026)

- Modelo lineal mixto, ahora con: **medias marginales** de los factores fijos (emmeans, con los grados de libertad de
  Satterthwaite o Kenward-Roger del modelo) y sus **comparaciones por pares** con Tukey, Bonferroni, Holm, Šidák o sin
  ajuste, con **letras** (la «a» para la media más alta) y la opción de comparar un factor **dentro de cada nivel** de
  otro; la **prueba de razón de verosimilitudes de cada efecto aleatorio** (ranova, con la advertencia de que su p es
  conservador); los **BLUP** con su DE condicional; y el **semáforo de los supuestos** sobre los residuos (Shapiro-Wilk,
  Levene, normalidad de los BLUP y avisos del ajuste) con qué hacer si fallan.
- **Cuatro diseños con efectos aleatorios** desde un formulario (familia Modelos mixtos), que arman su fórmula y la
  muestran: **bloques al azar con bloques aleatorios** (con parcelas perdidas recupera la información entre bloques),
  **parcelas divididas** (y subdivididas; con bloques, o sin bloques con la repetición de cada parcela grande),
  **látice y alfa-látice** con bloques incompletos aleatorios (recuperación entre bloques; repeticiones fijas o
  aleatorias) y **ensayos en varias localidades** (localidad, repetición y genotipo × localidad aleatorios, o
  localidades fijas). Los papeles se proponen por el nombre de las columnas, sin repetir columna.
- Gráficas: medias marginales con su IC y letras (o líneas cuando se compara dentro de otro factor), residuos y Q-Q.
  Párrafo para la tesis con la frase del diseño, las comparaciones con su cita y la prueba de los aleatorios.
- Dos ejemplos publicados nuevos (Olivoto y Lúcio, 2020, conjuntos de metan): un **alfa-látice** de 24 genotipos y
  **avena en 14 ambientes**.
- Validación en el navegador: 22 casos de 5 métodos (13 622 valores; diferencia escalada máxima 4.7 × 10⁻⁹), con los
  diseños sobre npk (Yates), Oats, plots (agricolae), el alfa-látice y data_ge (metan) y los clones de papa de plrv
  (agricolae); 646 casos en total. Los p de Tukey menores que 10⁻⁶ se comparan en valor absoluto (1 − ptukey, como en
  la Fase 1).
- Auditoría de accesibilidad más estricta: desde el Hito 1.10 el bloque Análisis abre en el Asistente, y 24 escenarios
  que eligen un método sin cambiar de modo estaban auditando el asistente en lugar de su formulario; ahora cada
  escenario empieza en el Catálogo, y los errores de la preparación y de la página (excepciones, promesas rechazadas)
  cuentan como falla. Con eso apareció —y se corrigió antes de publicarse— un choque de nombres en esta entrega que
  dejaba sin formulario a las comparaciones de medias. 49 escenarios, 98 revisiones, sin fallas.
- Corregido: la huella de los casos del motor R no incluía el archivo del método cuando la ficha se declara como clave
  de un objeto; ahora cuenta todo archivo de métodos que nombre el id. El generador de referencias del modelo mixto ya
  no carga lmerTest con library() (su step() tapaba al de stats en los generadores siguientes).

### Hito 2.0 · Motor R en el navegador y modelo lineal mixto (3 oct 2026)

- Plan detallado de la Fase 2 en `propuesta/FASE2.md`: decisiones (webR 0.6.0 fijado, paquetes y licencias), qué
  corre en JS y qué en el motor R, los métodos, el puente, la validación y los hitos 2.0 a 2.10.
- **Motor R** (`js/nucleo/motor-r.js`): webR (R 4.6.0 compilado a WebAssembly) se descarga solo cuando se usa un
  método que lo necesita y corre en su propio hilo dentro de la página; los datos no salen del navegador. Instala los
  paquetes uno por uno con reintentos, atiende un trabajo a la vez, avisa cada paso y se puede cancelar (cierra el
  motor; lo descargado queda en la caché del navegador). Un serializador propio en R devuelve los resultados con 17
  cifras, NA, NaN e infinitos y las dimensiones de las matrices (la conversión automática de webR los perdía); los
  errores y avisos de R llegan traducidos, con el texto original.
- Contrato de las fichas con `motor: 'r'`: `paquetes`, `preparar()` (el trabajo para R) y `leer()` (la salida), las
  dos puras y probadas en node; `SP.ejecutarAsync` corre cualquier método.
- **Modelo lineal mixto desde una fórmula** (familia Modelos mixtos): efectos fijos como en el modelo lineal y cada
  aleatorio entre paréntesis, como en lme4 — `hibrido * dosis + (1 | bloque)`, `(1 | bloque/parcela)`,
  `Days + (Days | Subject)`, `(x || g)` —; ANOVA de los efectos fijos con SC tipo III, II o I y grados de libertad de
  Satterthwaite o Kenward-Roger (lmerTest), coeficientes, componentes de varianza (REML o máxima verosimilitud) con su
  proporción, ajuste (logLik, AIC, BIC), avisos de ajuste singular o falta de convergencia, gráficas de residuos y Q-Q,
  párrafo para la tesis con sus citas (Bates et al. 2015, Kuznetsova et al. 2017, Satterthwaite 1946, Kenward y Roger
  1997) y el código R equivalente.
- Bloque Análisis: el catálogo muestra las familias de la Fase 2 (las que aún no tienen métodos, con su hito); la
  primera vez que se usa el motor R se explica la descarga y se pide permiso (luego se recuerda); mientras calcula se
  ve cada paso y el botón Cancelar. Reporte: los análisis del motor R se calculan aparte y se pintan al terminar; las
  exportaciones esperan a que acaben; los detalles técnicos y el párrafo de métodos dicen la versión de R y de los
  paquetes.
- **Validación del motor R** (`tests/motor-r.mjs`): corre en el navegador los 12 casos del modelo mixto (sleepstudy,
  Penicillin, Oats como parcelas divididas con Satterthwaite y Kenward-Roger y por máxima verosimilitud, Machines
  balanceado y desbalanceado con SC tipo III y I, faltantes, agrupamiento numérico y el maíz de los ejemplos) contra el
  R de escritorio: 710 valores, diferencia máxima 4.7 × 10⁻¹⁶ (lme4 2.0-1 en el motor, 1.1-35.5 en el escritorio).
  `tests/correr.mjs` integra esos resultados al reporte de validación solo si ni el caso ni el código del método
  cambiaron desde la corrida (`tests/lib/huella-motor-r.mjs`); si cambiaron, el caso queda sin aprobar y el método no
  aparece en la app. 636 casos en total.
- **Privacidad con el motor R** (`tests/sin-conexion.mjs`): se registran también las peticiones del hilo del motor;
  solo hay descargas de código (GET o HEAD sin parámetros ni cuerpo) de webR y de su repositorio de paquetes.
- Comprobado: con un tipo III de lmerTest, las F no dependen de la codificación de contrastes (desbalanceado), así que
  los coeficientes conservan los contrastes de tratamiento.

### Hito 1.12 · Sin conexión, 100 000 filas, privacidad, accesibilidad y cierre de la Fase 1 (2 oct 2026)

- **Servicio sin conexión** (`sw.js`) y manifiesto con íconos para GitHub Pages: la primera visita guarda la app y
  después abre y calcula sin red (las páginas, primero de la red y si no del guardado; lo demás, del guardado y se
  actualiza en segundo plano). Con doble clic no se registra (file:// no lo permite) y no hace falta.
- **Rendimiento con 100 000 filas** (`tests/rendimiento/`): un ensayo sintético de 99 941 filas medido en el
  navegador, por file://, en 43 operaciones (datos, cada familia de análisis, el bloque Análisis, el reporte, las
  figuras y las exportaciones), todas dentro de su meta. Las del plan: descriptivos de 10 variables en 105 ms (meta
  150), una vía + Tukey en 82 ms (meta 250) y el factorial 4 × 3 × 2 desbalanceado con SC tipo III en 142 ms (meta
  1.5 s).
- Más rápido, con los mismos números (624 de 624 casos contra R sin cambios): la matriz del modelo busca cada columna
  una vez y no por fila; los modelos solo con factores agrupan sus celdas con una clave entera; los rangos hacen una
  búsqueda binaria en lugar de dos; el intervalo de Hodges-Lehmann ordena una sola vez y en cada paso mezcla dos
  listas ordenadas; los anidamientos se detectan con arreglos de enteros. Bloques al azar de 895 a 186 ms, factorial
  en bloques con dosis de 3.3 a 0.55 s, Mann-Whitney con Hodges-Lehmann de 1.68 s a 73 ms.
- Las gráficas de dispersión con miles de filas dibujan a lo más 2 500 puntos también cuando hay muchos marcados
  (antes entraban todos los residuos mayores que 2: con 100 000 filas, 52 000 círculos en el reporte). El reporte de 5
  análisis bajó de 5.4 a 2.6 s, el .docx de 3.5 a 1.0 s y el proyecto .labg de 7.0 a 1.4 s.
- **Privacidad y sin conexión** (`tests/sin-conexion.mjs`): con datos, seis análisis, el asistente, el constructor, el
  reporte y seis exportaciones, ningún dato sale del navegador. Por doble clic ninguna petición sale del equipo salvo
  las letras de la suite; servida por http, todas son GET sin parámetros a archivos de la propia app. Después se apaga
  el servidor, se corta la red y la app abre, calcula, exporta y verifica las huellas del proyecto.
- Bloque 8: tarjeta **«Otras comprobaciones»** con el resultado más reciente de cada prueba que no es un caso contra R
  (código R, exportaciones, rendimiento, privacidad y sin conexión), que esas pruebas escriben en
  `js/generado/comprobaciones.js`.
- Pruebas en el navegador más firmes (`tests/lib/navegador.mjs`): un perfil nuevo de Edge podía iniciar sesión solo,
  instalar una extensión y dejar su pestaña al frente; la página de la prueba quedaba oculta y las corridas largas se
  detenían. Ahora sin extensiones ni sincronización, y la prueba en su propia ventana.
- **Accesibilidad AA** (`tests/accesibilidad/auditar.mjs`): 46 escenarios (cada bloque, análisis de todas las
  familias, asistente, constructor, diálogos, reporte, figuras y exportación) con el auditor de la suite a 1280 y 360
  px: 92 revisiones, 19 370 textos con contraste AA en claro y oscuro, sin fallas de nombres, etiquetas, ids ni
  desborde. El foco se revisa con el teclado de verdad: 569 paradas de Tab en los 8 bloques, todas con su anillo.
- `tests/pruebas.ps1 -Completo` corre también las exportaciones, la privacidad, el rendimiento y la accesibilidad.
- Inicio: la Fase 1 aparece completa y las fases 2 y 3 como pendientes.
- Capturas de la app terminada en `docs/capturas/` (inicio, datos, asistente, constructor, resultados en claro y oscuro,
  reporte, figuras, exportar, celular y validación).
- Corregido: en los cuadros de revista de la app, la línea inferior no cubría la primera columna cuando era encabezado
  de fila (las medias, el resumen del ensayo).
- `docs/PENDIENTES.md`: lo que falta para publicar, los límites conocidos de la Fase 1 y las fases 2 y 3.

### Hito 1.11 · Reporte LABG, figuras de publicación, exportaciones y proyecto .labg (2 oct 2026)

- **Agregar al reporte**: cada resultado de Explorar y de Análisis tiene su botón; el reporte guarda el análisis
  (método, entradas y opciones), no el resultado, y lo vuelve a calcular con los datos de ese momento.
- **Bloque 5 · Resultados (Reporte LABG)**: título y autor; por cada análisis, la conclusión en palabras, los cuadros de
  revista numerados en todo el reporte, sus figuras, los supuestos con semáforo (en completamente al azar y bloques
  se revisan solos) y «Qué hacer», el **párrafo para la tesis o el artículo** (métodos y resultados, con la estadística
  como la piden las revistas —F(2, 33) = 60.63; p < 0.001— y la cita de cada prueba), los detalles técnicos y el código
  R; ordenar, quitar, renombrar, anotar, abrir de nuevo en Análisis y copiar párrafos, cuadros y código.
- `js/nucleo/informe.js`: los párrafos de los 34 métodos, 58 referencias en estilo autor-año (solo las citadas, en
  orden alfabético), la frase del programa con la versión de R validada, y el documento completo (portada, métodos,
  resultados, referencias, anexos de detalles técnicos y de código R) para el .docx y la página HTML.
- **Bloque 6 · Figuras**: las figuras del reporte numeradas, con su leyenda (que declara las barras: ± 1 EE o IC 95 %,
  a elegir en las gráficas de medias), el ancho para el documento (8.5, 12, 16 o 17.5 cm) y sus descargas: SVG, **PDF
  vectorial** (texto seleccionable), PNG y TIFF a 600 ppp con la resolución dentro del archivo. El Estudio de figuras
  le pide a SigmaPro el PDF vectorial en lugar de una imagen; el editor ✎ funciona igual.
- **Bloque 7 · Exportar**: reporte en .docx (figuras a 300 ppp con su tamaño físico; carta o A4; anexos opcionales), PDF
  (la misma página, con el diálogo de impresión) y HTML (figuras vectoriales en la página); cuadros en hoja de cálculo
  (uno por hoja, todas las cifras, con índice) y en LaTeX (booktabs); todas las figuras en un ZIP con índice; y el
  **proyecto .labg**.
- **Proyecto .labg** (`js/exportar/proyecto.js`): ZIP comprimido con manifiesto (versión, fecha y la huella SHA-256 de
  cada archivo y del conjunto), la hoja con sus tipos, niveles, columnas derivadas y filtro, las filas en CSV, el reporte,
  los ajustes de las figuras (editor ✎ y estudio) y el código R que repite todo. Al abrir se verifican las huellas y se
  avisa si algo cambió; los resultados se recalculan.
- Escritores propios en `js/exportar/`: .docx, .xlsx y SVG → PDF vectorial adaptados de SciMetricsPro (mismo autor),
  LaTeX, PNG con su bloque de resolución y TIFF con PackBits; en el núcleo, SHA-256 (FIPS 180-4), ZIP comprimido y el
  formato de los cuadros compartido entre la pantalla y las exportaciones (`js/nucleo/formatos.js`).
- Validación: `tests/exportar.mjs` arma todas las exportaciones en un navegador sin ventana y las lee con lectores
  independientes: en R, readxl (246 números de la hoja idénticos a la app y el ANOVA y las medias iguales a car y
  emmeans), xml2 (cada parte del .docx válida, con el texto exacto de sus 16 cuadros y sus 7 figuras a 300 ppp),
  pdftools (cada PDF del tamaño pedido, con su texto), png (600 ppp) y openssl (las huellas del proyecto); el código R
  del proyecto corre de principio a fin; el TIFF se compara con el PNG píxel por píxel con el lector de imágenes del
  sistema; el proyecto se reabre en una página nueva y da los mismos cuadros. 10 pruebas unitarias nuevas (SHA-256
  contra el estándar y contra crypto de node, ZIP, hoja leída de vuelta, .docx, LaTeX, PNG y TIFF, párrafos de 14
  métodos, documento y proyecto con su huella).
- Corregido: los bloques 5 a 7 seguían marcados como «pronto» en la barra y Alt+→ saltaba de Resultados al Inicio; un
  subíndice («hᵢᵢ») salía como «h??» en el PDF; las pruebas en el navegador dejaban perfiles temporales (ahora se
  cierran todos los procesos del perfil).
- Auditoría de accesibilidad de los bloques 5, 6 y 7 y de los botones nuevos: 0 fallas en claro y oscuro, 1280 y 360 px.

### Hito 1.10 · asistente de análisis y constructor visual de modelos (1 oct 2026)

- Bloque 4 con tres formas de elegir el análisis: **Asistente**, **Catálogo** y **Constructor de modelo** (la
  elección se recuerda).
- `js/nucleo/asistente.js`: preguntas en lenguaje del campo que cambian según las respuestas (qué quieres saber, qué
  mediste y qué clase de dato es, qué factores, bloques en una o dos direcciones o incompletos, parcelas grandes o
  franjas, covariable, mediciones en el tiempo, dosis numérica, testigo). La recomendación dice el análisis, por qué,
  qué supuestos se revisarán, qué hacer si fallan y los pasos siguientes (polinomios, Dunnett, contrastes, Tukey,
  supuestos), y lleva todo al catálogo con «Usar y calcular». Cubre los diseños, la ANCOVA, las pruebas t y de rangos,
  correlación y regresión, tablas de contingencia, McNemar, kappa y Mantel-Haenszel, y los descriptivos del bloque 3.
  Propone las respuestas a partir de la tabla: tipo de dato (continuo, conteo, proporción, escala), datos ya contados,
  pares de columnas que se determinan una a otra (no se cruzan), mismas categorías en dos columnas (evaluadores o
  antes y después). Las escalas de calificación (daño, severidad…) no se toman como factor numérico.
- `js/nucleo/constructor.js` y `js/interfaz/constructor.js`: las variables se ponen en zonas (respuesta, bloques,
  factores, parcela grande, covariables) arrastrándolas, con el menú «Agregar…» de cada zona (también en el celular)
  o con las teclas R, F, B, C y P (Supr la quita). El constructor elige el diseño y muestra su fórmula; la fórmula se
  puede editar a mano con la explicación de cada término (efecto, pendiente, interacción, anidado, pendiente por
  grupo) o del error y cómo arreglarlo. «Efectos aleatorios» queda marcado para la Fase 2.
- `js/metodos/modelo-lineal.js`: **modelo lineal general** desde una fórmula (`+`, `*`, `:`, `/`, `(…)^2`, `- 1`, con
  numéricas tomadas como factor): ANOVA con SC tipo I, II o III (pasa a tipo II si hay coeficientes sin estimar, y a
  tipo I sin intercepto, con aviso), coeficientes como `summary(lm)`, R², medias marginales con IC de cada factor
  principal y la gráfica de la primera interacción entre dos factores. Avisa de términos confundidos.
- Validación: 14 casos nuevos contra R (976 valores, diferencia escalada máxima 2.5e-13) con lm, car y emmeans y los
  datos warpbreaks, CO2 y stackloss (factoriales desbalanceados, anidados, factor × covariable, numérica como factor,
  `(a + b + c)^2`, faltantes, sin intercepto). 11 pruebas unitarias nuevas (todas las ramas del asistente, el
  constructor y la lectura de fórmulas) y 3 escenarios del código R (47 en total).
- Auditoría de accesibilidad de las pantallas nuevas: 0 fallas de contraste, nombres o etiquetas, en claro y oscuro,
  a 1280 y 360 px.

### Hito 1.9 · correlación y tablas de contingencia (1 oct 2026)

- `js/metodos/correlacion.js`: correlación de Pearson con IC por la z de Fisher, Spearman y Kendall con sus p exactos
  sin empates (distribuciones de AS 89 y de ckendall, como R) y aproximados con empates y corrección por continuidad;
  τ-b por el algoritmo de Knight (O(n log n)); matriz de correlaciones con p ajustados (Holm, Bonferroni,
  Benjamini-Hochberg) y filas completas o por pares; correlación parcial y semiparciales con su t, también con rangos.
- `js/metodos/contingencia.js`: tabla de contingencia (con una columna de frecuencias opcional) con ji cuadrada (Yates
  en 2 × 2), G², esperados y residuos ajustados; Fisher exacta 2 × 2 con la razón de momios condicional y su IC exacto,
  y r × c con un recorrido por niveles al estilo del algoritmo de red; φ, V de Cramér, coeficiente de contingencia, λ,
  incertidumbre, γ, τ-b, τ-c y d de Somers con sus EE; razón de momios y riesgo relativo. McNemar con binomial exacta y
  simetría de Bowker; Cochran-Mantel-Haenszel 2 × 2 × K e I × J × K con la razón de momios común y Breslow-Day (con
  Tarone); kappa de Cohen simple y ponderada.
- Bloque 4: familias «Correlación» (tres métodos) y «Tablas de contingencia» (cuatro), con gráficas nuevas: mapa de
  calor (matriz de correlaciones, McNemar y kappa), mosaico con residuos ajustados, gráfica de variable agregada para
  la parcial y razón de momios por estrato en escala logarítmica.
- Datos: dos ejemplos nuevos (germinación de frijol tratada por lote, con conteos; roya calificada por dos evaluadores).
- Validación: 90 casos nuevos contra R (1 754 valores, diferencia escalada máxima 8.6e-13) con cor.test, chisq.test,
  fisher.test, mcnemar.test, mantelhaen.test, psych y datos clásicos (HairEyeColor, UCBAdmissions, occupationalStatus,
  la cata de té y los gemelos de Fisher, la satisfacción laboral de Agresti, la tabla de Cohen). 6 pruebas unitarias y
  7 escenarios del código R nuevos (44 en total). El arnés ya no confunde unas entradas con una clave «columna» con
  una referencia a una columna de datos.
- Con 100 000 filas: correlaciones de un par en 0.2–0.3 s, matriz de Pearson de 10 variables en 0.1 s (la de Kendall,
  3.8 s), tablas de contingencia en milisegundos.

### Hito 1.8 · ANCOVA y regresión con diagnóstico y selección de variables (1 oct 2026)

- `js/metodos/ancova.js`: análisis de covarianza en completamente al azar y en bloques, con uno o dos factores y una o
  dos covariables: ANOVA con SC tipo I, II o III, pendientes comunes con IC, homogeneidad de pendientes, prueba de
  que la covariable no depende de los tratamientos, medias ajustadas con IC y sus comparaciones (Tukey, DMS,
  Bonferroni, Šidák, Holm, Scheffé) con letras, comparaciones dentro de cada nivel si hay interacción y eficiencia
  relativa de la covarianza (Cochran y Cox, 1957). Avisa si la covariable está confundida con los tratamientos.
- `js/metodos/regresion.js`: regresión lineal simple y múltiple (hasta 15 predictores) y polinomial de grado 2 a 4:
  coeficientes con IC y β estandarizados, ANOVA de la regresión con falta de ajuste cuando hay repeticiones, SC
  secuenciales y parciales, R², R² ajustada, CV, AIC y BIC, predicciones con IC de la media y de predicción, máximo o
  mínimo de la curva; diagnóstico como `influence.measures` (palancas, residuos, Cook, DFFITS, DFBETAS, COVRATIO y
  sus criterios), Shapiro-Wilk, Breusch-Pagan, RESET y Durbin-Watson con semáforo; VIF e índices de condición de
  Belsley, Kuh y Welsch. Selección paso a paso por AIC (como `step`) o por valor p (adelante, atrás, mixta) y mejores
  subconjuntos con R² ajustada, Cp y BIC (como `leaps`), con un botón que lleva el modelo elegido a la regresión.
- Núcleo: `SP.algebra.svdJacobi` (SVD de Jacobi de un lado) y `minimosCuadradosCeldas`, que ajusta los modelos con
  factores y covariables comprimiendo cada celda por su QR: la ANCOVA con 100 000 filas pasa de 12 s a 1–4 s.
  `SP.comp.modeloLineal` reutiliza las comparaciones con cualquier ajuste.
- Bloque 4: familia «ANCOVA y regresión» con cinco métodos; gráficas de dispersión con bandas de confianza y de
  predicción, series por grupo con su marcador y leyenda (rectas paralelas de la ANCOVA), residuos, Q-Q, residuos
  contra palanca, AIC por paso, BIC y Cp por tamaño. Formato de cuadros con cifras significativas (`sig`) y valores p
  sin partir. Corregido: el eje de una gráfica entraba en un ciclo sin fin si todos los valores eran iguales salvo
  por el redondeo (residuos de un modelo con solo la media).
- Datos: dos ejemplos nuevos (sorgo con número de plantas para la ANCOVA; café con siete variables del sitio para la
  regresión y la selección).
- Validación: 54 casos nuevos contra R (7 689 valores; diferencia escalada máxima 1.4e-11, también con Longley),
  con lm, car, lmtest, leaps, emmeans y los datos clásicos cars, trees, stackloss, swiss, mtcars, longley, women,
  airquality, anorexia, frijol y Soils. 9 pruebas unitarias y 8 escenarios del código R nuevos (37 en total).
- Suite: editor ✎ común (`js/labg-figedit.js`), Estudio de figuras 1.3.1 y las gráficas marcadas para ambos, con
  los colores en el SVG (cambios de la sesión de la suite, incluidos en este hito).

### Hito 1.7 · comparaciones de medias, contrastes y medias ajustadas (1 oct 2026)

- `js/metodos/comparaciones.js`: un motor de combinaciones lineales sobre las medias marginales del diseño, con un
  solo error o con estratos (cada diferencia con el error de su estrato y los gl de Satterthwaite, como emmeans).
  Pares con DMS (también protegida), Tukey-Kramer, Duncan, SNK, Scheffé, Bonferroni, Šidák y Holm; Dunnett bilateral o
  de una cola con la t multivariada exacta (integral doble de Gauss-Kronrod adaptativa, que reproduce el cuadro de
  Dunnett, 1955); Games-Howell; letras por inserción y absorción con la «a» para la media más alta; comparaciones
  dentro de cada nivel de otro factor; contrastes escritos como texto con su prueba, su SC y la revisión de
  ortogonalidad; polinomios ortogonales con dosis igual o desigualmente espaciadas, la curva ajustada a las medias y la
  dosis óptima; medias ajustadas con su intervalo.
- `SP.estratos` entrega los coeficientes por estrato y la varianza combinada; `SP.medias` expone la rejilla y las
  filas de medias.
- Bloque 4: familia «Comparaciones de medias y contrastes» (cuatro métodos) con el diseño y sus papeles en el mismo
  formulario, gráfica de medias con barras de error y letras (`SP.graficas.medias`), varias gráficas cuando se compara
  dentro de cada nivel, curva de los polinomios, y el botón «Comparar las medias de este diseño» en cada ANOVA.
- Validación: 49 casos nuevos contra R (5 642 valores) con emmeans, agricolae, PMCMRplus y una integral independiente
  para Dunnett; hallazgos documentados: el Šidák de emmeans pierde cifras con p diminutos (clase B) y el ptukey de R
  tiene un error de hasta 2e-5 con pocos gl (con una sola comparación se usa la t, como emmeans). 6 pruebas unitarias
  y 5 escenarios del código R nuevos (29 en total), que verifican también las letras.
- Con 100 000 filas, cada comparación tarda entre 0.4 y 1.5 s.

### Hito 1.6 · ANOVA de diseños experimentales (1 oct 2026)

- Núcleo: `js/nucleo/estratos.js`, análisis de varianza con estratos de error como `aov(… + Error())` (parcelas
  divididas, subdivididas y en franjas); `js/nucleo/medias.js`, rejilla de referencia con medias marginales estimadas,
  su EE, estimabilidad con celdas vacías o términos confundidos, detección de factores anidados como emmeans, y efectos
  simples por pruebas F conjuntas (como `joint_tests`). El modelo de la fórmula acepta `filas` para ajustar dos
  modelos sobre las mismas filas.
- `js/metodos/disenos.js`: un método por diseño (completamente al azar, bloques completos al azar, cuadro latino,
  parcelas divididas con las grandes en bloques, al azar o en cuadro latino, subdivididas, franjas, bloques incompletos
  balanceados, látice y alfa-látice), factoriales de hasta tres factores, bloques generalizados y parcelas perdidas
  detectados solos, SC tipo I, II y III con la explicación de cada una (tipo II automático si el III no existe),
  avisos de términos confundidos y de desbalance en estratos, media, CV (uno por error), R², eficiencia relativa de los
  bloques y del cuadro latino (Gomez y Gomez, 1984) y efectos simples.
- Bloque 4: formularios por diseño con los papeles propuestos a partir de la tabla (bloques, filas, columnas,
  repeticiones), gráfica de interacción con marcadores y trazos distintos (`SP.graficas.lineas`) y cuadros de ANOVA
  con el total, resumen, medias y efectos simples. El catálogo ordena los diseños de lo simple a lo complejo.
- Ejemplo nuevo: la avena en parcelas divididas de Yates (1935), cotejada con la copia de R.
- Validación: 45 casos nuevos contra R (1 905 valores), con agricolae (sp.plot, ssp.plot, strip.plot, BIB.test) además de
  aov, car y emmeans; clase B nueva: emmeans redondea la F de las pruebas conjuntas. 7 pruebas unitarias nuevas y 5
  escenarios más del código R (24 en total).
- Rendimiento: con 2 000 filas o más y pocas celdas, el modelo lineal y los estratos se ajustan por celdas ponderadas
  (mismas sumas de cuadrados): un bloque generalizado de 100 000 filas pasó de 23 s a 2 s, unas subdivididas de 16 s a 1 s.

### Hito 1.5 · pruebas t y no paramétricas (1 oct 2026)

- Núcleo: distribuciones exactas del rango con signo y de la suma de rangos de Wilcoxon (`psignrank`, `qsignrank`,
  `pwilcox`, `qwilcox`, con los conteos y el margen de 10ε de R), la t no central (AS 243, como `pnt.c`) y
  `SP.num.raizR`, traducción paso a paso del `uniroot` de R para llegar a la misma raíz en funciones escalonadas.
- `js/metodos/pruebas-t.js`: t de una muestra, de dos (Student y Welch) y pareada como `t.test`, F de razón de
  varianzas como `var.test`, y d de Cohen y g de Hedges (corrección exacta) con su IC por la t no central. Método
  «Prueba t» con semáforo de normalidad y varianzas (con Welch, varianzas distintas no son un problema).
- `js/metodos/no-parametricas.js`: Wilcoxon de una muestra y pareada y Mann-Whitney con el estimador e intervalo de
  Hodges-Lehmann (exacto o por la normal, como `wilcox.test`); Kruskal-Wallis con η² de H y comparaciones de Dunn,
  Conover-Iman o Nemenyi; Friedman con la W de Kendall y comparaciones de Conover, Nemenyi o Wilcoxon pareada;
  ajustes de Holm, Bonferroni, Benjamini-Hochberg o Tukey; y letras de agrupación por inserción y absorción (como
  `multcompLetters`), con la «a» para el tratamiento de mayor rango.
- Bloque 4 de la app: formularios para la prueba t y Wilcoxon (que comparten lo elegido) y para Kruskal-Wallis y
  Friedman; gráfica de cajas con los puntos, la media y las letras (`SP.graficas.grupos`); un botón de copiar por
  cuadro. Las marcas de los ejes usan los decimales que pide el paso (0.25 ya no se muestra como 0.3).
- Validación: 115 casos nuevos contra R (7 471 valores) y dos hallazgos de clase B: `qwilcox(0.5, 49, 49)` da 1201
  en vez de 1200 (C(98, 49) con error relativo de 4e-15), y los p de Nemenyi y de Tukey son 1 − `ptukey()`, que
  debajo de 1e-6 solo tiene cifras absolutas (nueva regla `absoluto` del comparador). Documentado también: dunn.test
  no hace monótonos sus p de Holm y BH, y PMCMRplus falla con bloques incompletos tras Friedman.
- `tests/codigo-r.mjs`: 9 escenarios más (19 en total); el tamaño del efecto se escribe en R base. 9 pruebas
  unitarias nuevas (reportes, errores con su arreglo, letras que respetan cada par, `p.adjust` monótono).
- Con 100 000 filas: t en 0.03 s, Kruskal-Wallis en 0.11 s, Friedman en 0.18 s y Wilcoxon con su intervalo en
  menos de 1 s.

### Hito 1.4 · supuestos y semáforo (1 oct 2026)

- `js/metodos/supuestos.js`: normalidad (Shapiro-Wilk con el algoritmo AS R94 de R, Lilliefors, Anderson-Darling,
  Kolmogorov-Smirnov contra una normal dada, exacta de Marsaglia-Tsang-Wang y de Birnbaum-Tingey o asintótica),
  varianzas (Levene, Brown-Forsythe, Bartlett, Fligner-Killeen), no aditividad de Tukey, independencia
  (Durbin-Watson con p exacto por el algoritmo AS 153 de Farebrother o con media y varianza exactas; rachas exactas
  o normales), atípicos e influencia (palancas, residuos estandarizados y estudentizados con Bonferroni, distancia de
  Cook, Grubbs, cercas de Tukey) y la banda del gráfico Q-Q por estadísticos de orden.
- Método «Revisar los supuestos del modelo»: ajusta el modelo del experimento (bloques + tratamientos cruzados),
  prueba sus residuos y arma un semáforo de cinco renglones con reglas documentadas, más recomendaciones (Box-Cox
  con el mismo modelo, conteos, porcentajes, Welch o Kruskal-Wallis, revisar una fila atípica, el orden en campo).
- Bloque 4 de la app: catálogo de análisis por familias (los que faltan muestran su hito), formulario del modelo,
  semáforo (el color siempre con su palabra), gráficas Q-Q con banda, residuos contra ajustados y en orden
  (`js/interfaz/graficas.js`, SVG propio que sigue al tema), cuadro de pruebas y código R.
- Validación: 103 casos nuevos contra R (3 921 valores) y dos hallazgos de clase B documentados (`fligner.test` rompe
  empates exactos por el redondeo de la resta; agricolae calcula p = 1 − pf y pierde cifras con p diminuto). El
  AS 153 reproduce la tabla publicada por Farebrother (1984). `tests/codigo-r.mjs` corre también el código R de
  los supuestos (10 escenarios).
- Rendimiento: el ajuste por celdas (`SP.algebra.minimosCuadradosAgrupados`) evita la QR completa en tablas grandes
  de solo factores; Durbin-Watson normal por diferencias dispersas; palancas por celda. Con 100 000 filas: 1.1 s con
  un factor y 2.5 s con bloques × factorial de 109 columnas (antes 7.3 s), con aviso «Calculando…».
- La prueba del código R encontró y corrigió un `$` perdido en la línea de no aditividad. `sp_caso` ahora se detiene
  si dos casos de una carpeta comparten nombre: así apareció un caso de expresión del Hito 1.2 («estandarizar») que
  otro del mismo nombre había pisado; se restauró.

### Hito 1.3 · explorar (1 oct 2026)

- Métodos registrados (`js/metodos/`), los primeros que ofrece la app bajo la regla de liberación:
  **descriptivos** (n, faltantes, media, mediana, moda, DE, varianza, EE, CV, extremos, cuartiles con las nueve
  definiciones de Hyndman y Fan, RIC, media recortada, geométrica y armónica, asimetría y curtosis en las tres
  definiciones de Joanes y Gill con sus errores estándar, percentiles a elegir, e intervalos de la media por t,
  de la mediana por estadísticos de orden y de la varianza y la DE por ji cuadrada) por hasta tres factores;
  **frecuencias** de una y dos vías con porcentajes y acumulados; **proporciones** de categorías o de éxitos
  sobre ensayos con seis intervalos (Wilson, Wilson con corrección, Clopper-Pearson, Agresti-Coull, Jeffreys
  y Wald); y **bondad de ajuste ji cuadrada** con proporciones como «9:3:3:1».
- Bloque 3 de la app: formulario por resumen, cálculo inmediato, conclusión en palabras, cuadro de revista
  (con el factor repetido escrito una vez), columnas adicionales a elegir, copia a hoja de cálculo y código R.
- `tests/codigo-r.mjs`: el código R que muestra la app se ejecuta en R y reproduce sus números
  (8 escenarios, 209 valores).
- Núcleo: cuantil de la binomial (`SP.dist.qbinom`), validado; en los empates exactos (p justo en un salto)
  da el valor exacto, donde R se equivoca por redondeo (clase B documentada).
- Validación: 46 casos nuevos contra R (5 079 valores); los cuantiles coinciden con `quantile()` sin ninguna
  diferencia. 10 pruebas unitarias nuevas.
- Un séptimo ejemplo: la F2 dihíbrida del chícharo de Mendel (1866); el frijol trae ahora las semillas
  sembradas.
- Con 100 000 filas, cada resumen tarda menos de 0.1 s (200 grupos con dos variables, interfaz incluida).

### Hito 1.2 · datos (1 oct 2026)

- Lectores propios, sin bibliotecas: CSV y texto (RFC 4180, separador y decimal detectados, UTF-8, Latin-1 y
  UTF-16), .xlsx y .ods (descompresor DEFLATE, lector ZIP y XML propios; fechas, base 1904, errores de celda).
  Libros grandes se leen en un hilo de trabajo.
- Tipos de variable inferidos con su explicación (numérica, factor, fecha, texto, identificador), con
  números con textos sueltos tomados como faltantes y códigos con cero inicial respetados; el usuario decide.
- Hoja editable (`js/nucleo/hoja.js`) con deshacer y rehacer de 200 pasos, pegar desde hojas de cálculo,
  variables calculadas y filtros con expresiones de semántica de R (`js/nucleo/expresiones.js`),
  transformaciones siempre en columna nueva (`js/nucleo/transformar.js`) y Box-Cox con λ̂, intervalo,
  sugerencia de potencia sencilla y perfil, estimado en un hilo con el modelo del experimento.
- Cambio de forma ancha ⇄ larga (`js/nucleo/reformar.js`) y diagnóstico del ensayo
  (`js/nucleo/estructura.js`): tratamientos y factorial, balance, celdas vacías, bloques completos o no,
  cuadro latino, dosis numéricas tomadas como factor del diseño, identificadores y fechas fuera del diseño.
- Bloque 2 de la app: rejilla virtualizada con teclado de hoja de cálculo (accesible como `grid`), lista de
  variables con resumen, menú por columna, ventanas de importar, pegar, calcular, transformar, filtrar,
  cambiar la forma, renombrar y ordenar niveles; seis ejemplos agronómicos (`datos/ejemplos.js`, generados
  por `datos/generar-ejemplos.R`), entre ellos los venenos de Box y Cox (1964).
- Validación: 35 casos nuevos contra R (7 156 valores): CSV contra `read.csv`, .xlsx contra readxl en
  6 610 celdas, 16 expresiones, 8 transformaciones y 3 estimaciones de Box-Cox (clase D).
- Rendimiento con 100 000 filas: crear la hoja 0.4 s, pintar 0.4 s, desplazar 3 a 10 ms, filtrar 0.1 s,
  Box-Cox 0.6 s con la descomposición exacta por celdas (antes 3.9 s).
- Correcciones al Navegador LABG compartido: ya no falla si la página se desplaza antes de arrancar.

### Hito 1.1 · núcleo numérico (1 oct 2026)

- Distribuciones (`js/nucleo/dist.js`): log Γ (Lanczos), log B sin cancelación (Stirling reordenado), normal
  (Cody 1969, verificada contra serie y fracción continua propias), gamma y beta incompletas, t, F, ji cuadrada,
  gamma, beta, binomial, Poisson y rango estudentizado (Copenhaver y Holland 1988); cuantiles por el método de
  Brent en escala logarítmica o logit, hasta colas de 1e-300.
- Álgebra (`js/nucleo/algebra.js`): QR de Householder con el pivoteo limitado de R (tol 1e-7), mínimos
  cuadrados, (RᵀR)⁻¹, Cholesky y el espacio comprimido Q_kᵀX para ajustar submodelos en O(p³).
- Fórmulas (`js/nucleo/formula.js`): `~ + - * : / ^ %in% 0 1`, orden de términos de R, contrastes de
  tratamiento, suma cero, Helmert y polinomiales (también con dosis desiguales), regla de marginalidad para
  elegir contrastes o indicadoras, omisión de filas incompletas y de niveles sin datos.
- Modelo lineal (`js/nucleo/lineal.js`): coeficientes con EE, t y p, R², R² ajustada y F global; análisis de
  varianza con sumas de cuadrados tipo I, II y III (III siempre con suma cero y rechazada con alias).
- Validación: 68 casos nuevos contra R (6 813 valores), de los cuales 2 son de clase B documentados
  (`qtukey` y `qt` de R menos precisos que su propia función de distribución); 26 pruebas unitarias con
  identidades independientes de R; factorial con covariable de 100 000 filas en menos de 3 s.

### Hito 1.0 · cimientos (1 oct 2026)

- Núcleo sin DOM (`js/nucleo/`): espacio de nombres `SP` con textos centralizados (`SP.T`) y errores con
  arreglo (`SP.ErrorSP`); suma compensada, media y varianza en dos pasadas (`SP.num`); tabla en columnas
  con factores de niveles ordenados (`SP.tabla`); registro declarativo de métodos con regla de liberación
  (`SP.metodo`, `SP.metodoDisponible`); cálculos en hilos de trabajo armados desde el texto del núcleo,
  que funcionan con doble clic (`SP.hilo`).
- Validación: arnés de pruebas común a node y navegador, comparador con el criterio 1e-6 y sus reglas,
  generador de referencias con R (`tests/r/`), corredores `tests/correr.mjs` y `tests/navegador.mjs`,
  reporte HTML y CSV, y bloque 8 de la app con el mismo reporte.
- Interfaz: barra común de la suite, Navegador LABG y Estudio de figuras LABG (v1.0.0), portada con el
  estado de los hitos, bloques 2 a 7 anunciados y bloque 8 de validación.
- Primeros casos contra R: `SP.num.resumen` con PlantGrowth, airquality (37 faltantes), un desplazamiento
  de mil millones y magnitudes del orden de 1e-9.

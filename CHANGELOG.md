# Cambios

## Sin publicar

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

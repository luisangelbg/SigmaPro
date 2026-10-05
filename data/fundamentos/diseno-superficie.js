SP_FICHA({
  "id": "diseno-superficie",
  "familia": "superficies",
  "respuesta": "ninguna",
  "estructura": "ninguna",
  "disenos": ["superficie"],
  "relacionados": ["superficie-respuesta", "ascenso-pronunciado", "mezclas", "deseabilidad", "repeticiones"],
  "ejemplo": null,
  "formato": null,
  "es": {
    "alias": ["Generador de diseños de superficie", "Diseño central compuesto", "Diseño Box-Behnken", "Simplex-látice y simplex-centroide"],
    "paraQue": "Arma la lista de corridas de un diseño para superficie de respuesta o para mezclas, en unidades codificadas y originales, en orden al azar y lista para capturar la respuesta.",
    "preguntas": [
      "¿Cuántas corridas y con qué dosis necesitas para estudiar nitrógeno, fósforo y riego con un central compuesto?",
      "¿Qué proporciones de tierra, arena y composta conviene probar para elegir el mejor sustrato de plántula?",
      "¿Qué diseño de tres niveles evita probar a la vez las dosis extremas de dos herbicidas?"
    ],
    "teoria": [
      "Antes de ajustar una superficie hay que decidir dónde medir. Un diseño de segundo orden necesita al menos tres niveles por factor y bastantes puntos para estimar todos los coeficientes y el error. El central compuesto combina un factorial 2^k (la media fracción con 5 o 6 factores), puntos axiales a una distancia α del centro y varios puntos centrales. La α puede ser rotable (α = F^¼, la misma precisión a la misma distancia del centro), ortogonal, de caras centradas (α = 1, solo tres niveles por factor) o la que deja la parte factorial y la axial en dos bloques ortogonales. El Box-Behnken (3 a 5 factores) prueba cada par de factores en ±1 con los demás en el centro y evita las esquinas del cubo. El factorial 2^k con centros sirve para el primer orden y el ascenso más pronunciado.",
      "En las mezclas los componentes suman una constante, así que no se pueden variar libremente. El simplex-látice {q, m} toma todas las mezclas con proporciones 0, 1/m, …, 1 que suman 1; el simplex-centroide, los vértices, los puntos medios de las aristas y los centroides de cada cara hasta el centro.",
      "SigmaPro da cada corrida en unidades codificadas y, si escribes el nivel bajo (−1) y alto (+1) de cada factor o el total de la mezcla, en unidades originales. Con una semilla sortea el orden de corrida (dentro de cada bloque) y abre el diseño en Datos con una columna vacía para la respuesta."
    ],
    "modelo": {
      "tex": "x_i = \\frac{L_i + U_i}{2} + \\frac{U_i - L_i}{2} z_i, \\quad \\alpha = F^{1/4}",
      "terminos": [
        ["z_i", "el nivel codificado del factor i en la corrida (−1, 0, +1 o ±α)"],
        ["x_i", "el mismo nivel en unidades originales"],
        ["L_i, U_i", "los niveles bajo (−1) y alto (+1) que escribes para el factor i"],
        ["\\alpha", "la distancia de los puntos axiales del central compuesto (aquí, la rotable)"],
        ["F", "el número de corridas de la parte factorial"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "La región elegida contiene el óptimo o está cerca de él", "como": "No se prueba al generar el diseño: después, la falta de ajuste y el punto estacionario de la superficie dicen si la región era la adecuada.", "verificar": "superficie-respuesta", "siFalla": "Si el óptimo queda fuera, muévete con el camino de ascenso más pronunciado y genera un diseño nuevo centrado allí.", "alternativa": "ascenso-pronunciado" },
      { "nombre": "Corridas independientes y en orden aleatorio", "como": "Da una semilla para que la app sortee el orden; los puntos centrales deben ser corridas completas, no lecturas repetidas de una misma unidad.", "verificar": null, "siFalla": "Si las corridas se reparten en días o lotes, elige el central compuesto en dos bloques ortogonales y analiza con el bloque.", "alternativa": null },
      { "nombre": "En mezclas, los componentes suman una constante", "como": "El generador produce proporciones que suman 1 (o el total que indiques); al analizar, la app revisa que cada fila sume lo mismo.", "verificar": "mezclas", "siFalla": "Si también cambia la cantidad total, no es un problema de mezclas: trata las cantidades como factores de una superficie.", "alternativa": "superficie-respuesta" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "Diseño", "tipo": "opción", "papel": "central compuesto, Box-Behnken, factorial 2^k con centros, simplex-látice o simplex-centroide" },
        { "nombre": "Factores o componentes", "tipo": "número entero", "papel": "de 2 a 6 (Box-Behnken, de 3 a 5)" },
        { "nombre": "α", "tipo": "opción", "papel": "solo en el central compuesto: rotable, ortogonal, caras centradas o dos bloques ortogonales" },
        { "nombre": "Grado del látice", "tipo": "número entero", "papel": "solo en el simplex-látice: 2, 3 o 4" },
        { "nombre": "Puntos centrales o repeticiones del centroide", "tipo": "número entero (0 a 20)", "papel": "vacío: los de omisión del diseño" },
        { "nombre": "Nombres, nivel bajo (−1) y alto (+1), total de la mezcla", "tipo": "texto y números (opcionales)", "papel": "para escribir las corridas en unidades originales" },
        { "nombre": "Semilla", "tipo": "número entero (opcional)", "papel": "sortea el orden de corrida; la misma semilla da el mismo orden" }
      ],
      "minimo": "No usa datos. El resumen indica cuántos coeficientes tiene el modelo y cuántos grados de libertad quedan para el error; si no queda ninguno, agrega puntos centrales.",
      "balance": "No aplica: el diseño sale completo. Si las unidades originales producen niveles negativos (los axiales pasan del rango ±1), la app lo avisa para que revises la α o uses caras centradas.",
      "notaFormato": "El diseño se abre en Datos en formato largo: columnas corrida (orden al azar), estandar (orden del diseño), bloque (si hay dos), una por factor o componente y una columna «respuesta» vacía para anotar lo que midas.",
      "errores": [
        "Escribir los niveles bajo y alto como los extremos del rango que quieres explorar: en un central compuesto rotable los axiales salen más allá, a ±α.",
        "Correr las corridas en el orden estándar en lugar del orden al azar.",
        "Quitar los puntos centrales para ahorrar corridas: sin ellos no hay error puro ni prueba de falta de ajuste.",
        "Usar un simplex-látice de grado 2 sin repetir ninguna mezcla: el modelo cuadrático queda sin grados de libertad para el error."
      ]
    },
    "interpretacion": {
      "orden": [
        "Lee el resumen: el tipo de diseño, el número de corridas y cuántos grados de libertad quedan para el error.",
        "Revisa el cuadro de corridas en unidades codificadas y originales, y atiende cualquier aviso de niveles negativos.",
        "Mira la gráfica de las corridas (o el triángulo de la mezcla) para comprobar que cubren la región que te interesa.",
        "Abre el diseño en Datos, corre el experimento en el orden indicado y anota la respuesta; después analízalo con superficie de respuesta o mezclas."
      ],
      "ejemplo": "Ejemplo de redacción (cifras ilustrativas): «Se usó un diseño central compuesto rotable (α = 1.682) con tres factores, nitrógeno (80 a 220 kg/ha), fósforo (40 a 160 kg/ha) y riego (10 a 30 cm), en 20 corridas (8 factoriales, 6 axiales y 6 centrales) realizadas en orden aleatorio».",
      "guias": ["gl", "n"]
    },
    "limitaciones": [
      "Genera diseños estándar; no construye diseños óptimos (D u otros) para regiones irregulares ni con restricciones.",
      "En las mezclas, supone que cada componente puede ir de 0 a 1; no maneja límites inferiores o superiores de los componentes.",
      "No combina factores de mezcla con factores de proceso en un mismo diseño.",
      "Para decidir cuántas repeticiones necesita un experimento de comparación de tratamientos, usa el cálculo del número de repeticiones."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Box, G. E. P., & Hunter, J. S. (1957). Multi-factor experimental designs for exploring response surfaces. The Annals of Mathematical Statistics, 28(1), 195–241.",
      "Box, G. E. P., & Behnken, D. W. (1960). Some new three level designs for the study of quantitative variables. Technometrics, 2(4), 455–475.",
      "Scheffé, H. (1958). Experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 20(2), 344–360.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley."
    ]
  },
  "en": {
    "alias": ["Response surface design generator", "Central composite design", "Box-Behnken design", "Simplex-lattice and simplex-centroid designs"],
    "paraQue": "Builds the list of runs of a response surface or mixture design, in coded and original units, in random order and ready for recording the response.",
    "preguntas": [
      "How many runs, and at which rates, do you need to study nitrogen, phosphorus and irrigation with a central composite design?",
      "Which proportions of soil, sand and compost should be tested to choose the best seedling substrate?",
      "Which three-level design avoids testing the extreme rates of two herbicides at the same time?"
    ],
    "teoria": [
      "Before fitting a surface you must decide where to measure. A second-order design needs at least three levels per factor and enough points to estimate every coefficient and the error. The central composite design combines a 2^k factorial (the half fraction with 5 or 6 factors), axial points at a distance α from the center and several center points. α can be rotatable (α = F^¼, the same precision at the same distance from the center), orthogonal, face-centered (α = 1, only three levels per factor) or the one that places the factorial and axial parts in two orthogonal blocks. The Box-Behnken design (3 to 5 factors) tests each pair of factors at ±1 with the others at the center and avoids the corners of the cube. The 2^k factorial with center points serves the first-order model and steepest ascent.",
      "In mixtures the components add up to a constant, so they cannot be varied freely. The {q, m} simplex-lattice takes every mixture with proportions 0, 1/m, …, 1 that add up to 1; the simplex-centroid takes the vertices, the midpoints of the edges and the centroids of each face up to the overall center.",
      "SigmaPro gives each run in coded units and, if you enter the low (−1) and high (+1) level of each factor or the mixture total, in original units. With a seed it randomizes the run order (within each block) and opens the design in Data with an empty column for the response."
    ],
    "modelo": {
      "tex": "x_i = \\frac{L_i + U_i}{2} + \\frac{U_i - L_i}{2} z_i, \\quad \\alpha = F^{1/4}",
      "terminos": [
        ["z_i", "the coded level of factor i in the run (−1, 0, +1 or ±α)"],
        ["x_i", "the same level in original units"],
        ["L_i, U_i", "the low (−1) and high (+1) levels you enter for factor i"],
        ["\\alpha", "the distance of the axial points of the central composite design (here, the rotatable one)"],
        ["F", "the number of runs in the factorial part"]
      ]
    },
    "hipotesis": [],
    "supuestos": [
      { "nombre": "The chosen region contains the optimum or is close to it", "como": "It is not tested when generating the design: later, the lack of fit and the stationary point of the surface tell whether the region was right.", "verificar": "superficie-respuesta", "siFalla": "If the optimum falls outside, move along the path of steepest ascent and generate a new design centered there.", "alternativa": "ascenso-pronunciado" },
      { "nombre": "Independent runs in random order", "como": "Enter a seed so the app randomizes the order; center points must be complete runs, not repeated readings of the same unit.", "verificar": null, "siFalla": "If the runs are spread over days or batches, choose the central composite design in two orthogonal blocks and analyze it with the block.", "alternativa": null },
      { "nombre": "In mixtures, the components add up to a constant", "como": "The generator produces proportions that add up to 1 (or the total you enter); at analysis time, the app checks that every row has the same sum.", "verificar": "mezclas", "siFalla": "If the total amount also changes, it is not a mixture problem: treat the amounts as factors of a response surface.", "alternativa": "superficie-respuesta" }
    ],
    "datos": {
      "columnas": [
        { "nombre": "Design", "tipo": "option", "papel": "central composite, Box-Behnken, 2^k factorial with center points, simplex-lattice or simplex-centroid" },
        { "nombre": "Factors or components", "tipo": "integer", "papel": "2 to 6 (Box-Behnken, 3 to 5)" },
        { "nombre": "α", "tipo": "option", "papel": "central composite only: rotatable, orthogonal, face-centered or two orthogonal blocks" },
        { "nombre": "Lattice degree", "tipo": "integer", "papel": "simplex-lattice only: 2, 3 or 4" },
        { "nombre": "Center points or centroid replicates", "tipo": "integer (0 to 20)", "papel": "empty: the design defaults" },
        { "nombre": "Names, low (−1) and high (+1) levels, mixture total", "tipo": "text and numbers (optional)", "papel": "to write the runs in original units" },
        { "nombre": "Seed", "tipo": "integer (optional)", "papel": "randomizes the run order; the same seed gives the same order" }
      ],
      "minimo": "It uses no data. The summary states how many coefficients the model has and how many degrees of freedom remain for error; if none remain, add center points.",
      "balance": "Not applicable: the design comes out complete. If the original units produce negative levels (the axial points go beyond the ±1 range), the app warns you so you can review α or use the face-centered option.",
      "notaFormato": "The design opens in Data in long format: columns corrida (random order), estandar (design order), bloque (if there are two blocks), one per factor or component and an empty “respuesta” column to record what you measure.",
      "errores": [
        "Entering the low and high levels as the ends of the range you want to explore: in a rotatable central composite design the axial points go beyond them, to ±α.",
        "Running the experiment in standard order instead of the random order.",
        "Dropping the center points to save runs: without them there is no pure error and no lack-of-fit test.",
        "Using a degree-2 simplex-lattice without replicating any mixture: the quadratic model is left with no error degrees of freedom."
      ]
    },
    "interpretacion": {
      "orden": [
        "Read the summary: the design type, the number of runs and how many degrees of freedom remain for error.",
        "Review the runs table in coded and original units, and heed any warning about negative levels.",
        "Look at the plot of the runs (or the mixture triangle) to check that they cover the region you care about.",
        "Open the design in Data, run the experiment in the order shown and record the response; then analyze it with the response surface or mixtures."
      ],
      "ejemplo": "Example write-up (illustrative figures): “A rotatable central composite design (α = 1.682) was used with three factors, nitrogen (80 to 220 kg/ha), phosphorus (40 to 160 kg/ha) and irrigation (10 to 30 cm), in 20 runs (8 factorial, 6 axial and 6 center points) carried out in random order.”",
      "guias": ["gl", "n"]
    },
    "limitaciones": [
      "It generates standard designs; it does not build optimal designs (D-optimal or others) for irregular or constrained regions.",
      "For mixtures, it assumes each component can range from 0 to 1; it does not handle lower or upper bounds on the components.",
      "It does not combine mixture components with process factors in the same design.",
      "To decide how many replicates a treatment-comparison experiment needs, use the number-of-replicates calculation."
    ],
    "referencias": [
      "Box, G. E. P., & Wilson, K. B. (1951). On the experimental attainment of optimum conditions. Journal of the Royal Statistical Society: Series B (Methodological), 13(1), 1–45.",
      "Box, G. E. P., & Hunter, J. S. (1957). Multi-factor experimental designs for exploring response surfaces. The Annals of Mathematical Statistics, 28(1), 195–241.",
      "Box, G. E. P., & Behnken, D. W. (1960). Some new three level designs for the study of quantitative variables. Technometrics, 2(4), 455–475.",
      "Scheffé, H. (1958). Experiments with mixtures. Journal of the Royal Statistical Society: Series B (Methodological), 20(2), 344–360.",
      "Myers, R. H., Montgomery, D. C., & Anderson-Cook, C. M. (2016). Response surface methodology: Process and product optimization using designed experiments (4th ed.). Wiley."
    ]
  }
});

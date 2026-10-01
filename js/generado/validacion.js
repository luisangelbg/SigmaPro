/* Generado por tests/correr.mjs — no editar a mano. */
window.SP_VALIDACION = {
 "version": "0.1.0",
 "generado": "2026-10-01T18:04:24.267Z",
 "motor": "node v24.19.0",
 "criterio": {
  "tol": 0.000001,
  "regla": "|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)"
 },
 "referencias": [
  "R version 4.4.2 (2024-10-31 ucrt)"
 ],
 "resumen": {
  "casos": 372,
  "aprobados": 372,
  "fallidos": 0,
  "valores": 30492,
  "difEscaladaMax": 2.0258232202030768e-7,
  "objetivos": 78
 },
 "casos": [
  {
   "id": "num.resumen/desplazamiento-grande",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "num.resumen"
   },
   "titulo": "Cuatro valores alrededor de mil millones (varianza exacta = 30)",
   "fuente": "Datos sintéticos (ejemplo clásico de cancelación numérica)",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "n = sum(!is.na(x)); faltantes = sum(is.na(x))\nmedia = mean(x, na.rm = TRUE); varianza = var(x, na.rm = TRUE); de = sd(x, na.rm = TRUE)\nmin = min(x, na.rm = TRUE); max = max(x, na.rm = TRUE)"
   }
  },
  {
   "id": "num.resumen/magnitudes-pequenas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "num.resumen"
   },
   "titulo": "Seis concentraciones del orden de 1e-9 (comparación relativa)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 9.62964972193618e-35,
   "difEscaladaMax": 1.4731743582768251e-16,
   "peor": "varianza",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "n = sum(!is.na(x)); faltantes = sum(is.na(x))\nmedia = mean(x, na.rm = TRUE); varianza = var(x, na.rm = TRUE); de = sd(x, na.rm = TRUE)\nmin = min(x, na.rm = TRUE); max = max(x, na.rm = TRUE)"
   }
  },
  {
   "id": "num.resumen/ozono-con-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "num.resumen"
   },
   "titulo": "Ozono diario con 37 faltantes de 153",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "n = sum(!is.na(x)); faltantes = sum(is.na(x))\nmedia = mean(x, na.rm = TRUE); varianza = var(x, na.rm = TRUE); de = sd(x, na.rm = TRUE)\nmin = min(x, na.rm = TRUE); max = max(x, na.rm = TRUE)"
   }
  },
  {
   "id": "num.resumen/plantgrowth",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "num.resumen"
   },
   "titulo": "Peso seco de 30 plantas (tres tratamientos juntos)",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "n = sum(!is.na(x)); faltantes = sum(is.na(x))\nmedia = mean(x, na.rm = TRUE); varianza = var(x, na.rm = TRUE); de = sd(x, na.rm = TRUE)\nmin = min(x, na.rm = TRUE); max = max(x, na.rm = TRUE)"
   }
  },
  {
   "id": "dist.pnorm/cola-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pnorm"
   },
   "titulo": "P(Z ≤ q) en 33 puntos, de −37 a 37",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 33,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pnorm(q)"
   }
  },
  {
   "id": "dist.pnorm/cola-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pnorm"
   },
   "titulo": "P(Z > q) en 33 puntos, de −37 a 37",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 33,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pnorm(q, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.pnorm/media-y-de",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pnorm"
   },
   "titulo": "Normal con media 10 y desviación estándar 3",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 8,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pnorm(q, 10, 3)"
   }
  },
  {
   "id": "dist.qnorm/cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qnorm"
   },
   "titulo": "Cuantiles de la normal para 22 probabilidades (cola inferior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 22,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 5.3997413821329e-16,
   "peor": "[17]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(p)"
   }
  },
  {
   "id": "dist.qnorm/cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qnorm"
   },
   "titulo": "Cuantiles de la normal para 22 probabilidades (cola superior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 22,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 5.3997413821329e-16,
   "peor": "[17]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(p, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.dnorm/densidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.dnorm"
   },
   "titulo": "Densidad normal en 7 puntos",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 1.9995926145460648e-14,
   "peor": "[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "dnorm(z)"
   }
  },
  {
   "id": "dist.lgamma/rejilla",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.lgamma"
   },
   "titulo": "log Γ(x) en 22 puntos, de 1e-10 a 1e10",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 22,
   "difMax": 0.000030517578125,
   "difEscaladaMax": 5.551115123125783e-16,
   "peor": "[11]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "lgamma(x)"
   }
  },
  {
   "id": "dist.qf/f-cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qf"
   },
   "titulo": "Cuantiles de F en 120 combinaciones (cola inferior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 120,
   "difMax": 3.5925040720030665e-11,
   "difEscaladaMax": 4.599154390660942e-12,
   "peor": "[115]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qf(p, gl1, gl2)"
   }
  },
  {
   "id": "dist.qf/f-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qf"
   },
   "titulo": "Cuantiles de F en 120 combinaciones (cola superior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 120,
   "difMax": 8.028268271471024e+44,
   "difEscaladaMax": 4.599071123934095e-12,
   "peor": "[117]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qf(p, gl1, gl2, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.df/f-densidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.df"
   },
   "titulo": "Densidad de F en 35 puntos",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 35,
   "difMax": 1.9984014443252818e-15,
   "difEscaladaMax": 5.7853223696756625e-15,
   "peor": "[29]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "df(x, gl1, gl2)"
   }
  },
  {
   "id": "dist.pf/f-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pf"
   },
   "titulo": "P(F ≤ q) en 196 combinaciones de q, gl1 y gl2",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 196,
   "difMax": 1.1435297153639112e-14,
   "difEscaladaMax": 4.655322971293321e-14,
   "peor": "[141]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pf(q, gl1, gl2)"
   }
  },
  {
   "id": "dist.pf/f-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pf"
   },
   "titulo": "P(F > q) en 190 combinaciones de q, gl1 y gl2",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 190,
   "difMax": 1.1433562430163136e-14,
   "difEscaladaMax": 1.5481259070101053e-12,
   "peor": "[157]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pf(q, gl1, gl2, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qchisq/ji2-cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qchisq"
   },
   "titulo": "Cuantiles de ji cuadrada en 63 combinaciones (cola inferior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 63,
   "difMax": 5.456968210637569e-10,
   "difEscaladaMax": 5.4573320284605196e-14,
   "peor": "[59]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qchisq(p, gl)"
   }
  },
  {
   "id": "dist.qchisq/ji2-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qchisq"
   },
   "titulo": "Cuantiles de ji cuadrada en 63 combinaciones (cola superior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 63,
   "difMax": 5.456968210637569e-10,
   "difEscaladaMax": 5.4573320284605196e-14,
   "peor": "[59]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qchisq(p, gl, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.pchisq/ji2-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pchisq"
   },
   "titulo": "P(X² ≤ q) en 94 combinaciones de q y gl",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 94,
   "difMax": 1.850741782050136e-12,
   "difEscaladaMax": 3.695267795816981e-12,
   "peor": "[93]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pchisq(q, gl)"
   }
  },
  {
   "id": "dist.pchisq/ji2-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pchisq"
   },
   "titulo": "P(X² > q) en 109 combinaciones de q y gl",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 109,
   "difMax": 1.8507972932013672e-12,
   "difEscaladaMax": 3.707831487930834e-12,
   "peor": "[108]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pchisq(q, gl, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qt/t-cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qt"
   },
   "titulo": "Cuantiles de t en 144 combinaciones (cola inferior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 144,
   "difMax": 1.147258064484217e+185,
   "difEscaladaMax": 1.6194376414520768e-12,
   "peor": "[15]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qt(p, gl)"
   }
  },
  {
   "id": "dist.qt/t-cuantil-inversion-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qt"
   },
   "titulo": "Cuantiles de t con menos de 1 grado de libertad y colas diminutas (inversión exacta de pt)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "B",
   "valores": 11,
   "difMax": 1.7917957937422434e+103,
   "difEscaladaMax": 2.848008494990301e-14,
   "peor": "[8]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "exp(uniroot(function(u) log(pt(exp(u), gl, lower.tail = FALSE)) - log(p), c(-5, 700), tol = 1e-15)$root)"
   }
  },
  {
   "id": "dist.qt/t-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qt"
   },
   "titulo": "Cuantiles de t en 142 combinaciones (cola superior)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 142,
   "difMax": 7.81924229120856e+85,
   "difEscaladaMax": 2.8808312389924344e-8,
   "peor": "[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qt(p, gl, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.dt/t-densidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.dt"
   },
   "titulo": "Densidad de t en 24 puntos",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 24,
   "difMax": 8.28281887521598e-13,
   "difEscaladaMax": 2.07836496545653e-12,
   "peor": "[23]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "dt(x, gl)"
   }
  },
  {
   "id": "dist.pt/t-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pt"
   },
   "titulo": "P(T ≤ q) en 285 combinaciones de q y gl",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 285,
   "difMax": 5.293725527377724e-15,
   "difEscaladaMax": 4.490038632484286e-11,
   "peor": "[248]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(q, gl)"
   }
  },
  {
   "id": "dist.pt/t-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pt"
   },
   "titulo": "P(T > q) en 285 combinaciones de q y gl",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 285,
   "difMax": 5.293725527377724e-15,
   "difEscaladaMax": 4.490038632484286e-11,
   "peor": "[264]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(q, gl, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qbeta/beta-cuantil",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qbeta"
   },
   "titulo": "Cuantiles de la beta en 80 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 80,
   "difMax": 4.840230438674098e-10,
   "difEscaladaMax": 4.840230438674098e-10,
   "peor": "[39]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qbeta(p, a, b)"
   }
  },
  {
   "id": "dist.pbeta/beta-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pbeta"
   },
   "titulo": "I_x(a, b) en 115 combinaciones de x, a y b",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 115,
   "difMax": 4.304334666471732e-13,
   "difEscaladaMax": 8.608669332943464e-13,
   "peor": "[96]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pbeta(x, a, b)"
   }
  },
  {
   "id": "dist.pbeta/beta-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pbeta"
   },
   "titulo": "1 − I_x(a, b) en 122 combinaciones de x, a y b",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 122,
   "difMax": 4.304334666471732e-13,
   "difEscaladaMax": 8.608669332943464e-13,
   "peor": "[98]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pbeta(x, a, b, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qbinom/binomial-cuantil-mediana-simetrica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qbinom"
   },
   "titulo": "Cuantil 0.5 de la binomial simétrica con n impar: (n − 1)/2 exacto (R da n = 51 → 26)",
   "fuente": "Identidad exacta por simetría: P(X ≤ (n − 1)/2) = 1/2",
   "clase": "B",
   "valores": 6,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "(n - 1) / 2   # referencia exacta; qbinom(0.5, n, 0.5) de R da 0, 3, 26, 50, 499, 2500 porque su pbinom redondea por debajo de 1/2"
   }
  },
  {
   "id": "dist.qbinom/binomial-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qbinom"
   },
   "titulo": "Cuantiles de la binomial, cola superior, en 189 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 189,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qbinom(p, n, prob, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qbinom/binomial-cuantil",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qbinom"
   },
   "titulo": "Cuantiles de la binomial en 189 combinaciones (con p justo en un salto)",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 189,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qbinom(p, n, prob)"
   }
  },
  {
   "id": "dist.pbinom/binomial-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pbinom"
   },
   "titulo": "P(X ≤ k) binomial en 97 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 97,
   "difMax": 1.8318679906315083e-14,
   "difEscaladaMax": 7.192391451266529e-14,
   "peor": "[87]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pbinom(k, n, p)"
   }
  },
  {
   "id": "dist.pbinom/binomial-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pbinom"
   },
   "titulo": "P(X > k) binomial en 81 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 81,
   "difMax": 1.8318679906315083e-14,
   "difEscaladaMax": 5.347067463250035e-14,
   "peor": "[65]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pbinom(k, n, p, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.dbinom/binomial-masa",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.dbinom"
   },
   "titulo": "P(X = k) binomial en 93 combinaciones de k, n y p",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 93,
   "difMax": 1.2219392164780629e-14,
   "difEscaladaMax": 3.693465058522996e-13,
   "peor": "[73]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "dbinom(k, n, p)"
   }
  },
  {
   "id": "dist.qgamma/gamma-cuantil",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qgamma"
   },
   "titulo": "Cuantiles de la gamma en 35 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 35,
   "difMax": 2.7193891583010554e-10,
   "difEscaladaMax": 5.4391409216989843e-14,
   "peor": "[32]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qgamma(p, forma)"
   }
  },
  {
   "id": "dist.pgamma/gamma-escala",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pgamma"
   },
   "titulo": "Gamma con escala 2.5 en 15 puntos",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 15,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.3849812135385176e-14,
   "peor": "[10]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pgamma(q, forma, scale = 2.5)"
   }
  },
  {
   "id": "dist.pgamma/gamma-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pgamma"
   },
   "titulo": "P(X ≤ q) gamma en 60 combinaciones de q y forma",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 60,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 7.396028685446777e-14,
   "peor": "[53]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pgamma(q, forma)"
   }
  },
  {
   "id": "dist.pgamma/gamma-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pgamma"
   },
   "titulo": "P(X > q) gamma en 57 combinaciones de q y forma",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 57,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 2.4147361778843374e-13,
   "peor": "[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pgamma(q, forma, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.ppois/poisson-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ppois"
   },
   "titulo": "P(X ≤ k) Poisson en 45 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 45,
   "difMax": 8.220854552654089e-15,
   "difEscaladaMax": 6.62525975293704e-13,
   "peor": "[43]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ppois(k, lambda)"
   }
  },
  {
   "id": "dist.ppois/poisson-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ppois"
   },
   "titulo": "P(X > k) Poisson en 37 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 37,
   "difMax": 8.215650382226158e-15,
   "difEscaladaMax": 3.40805863267544e-13,
   "peor": "[36]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ppois(k, lambda, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.dpois/poisson-masa",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.dpois"
   },
   "titulo": "P(X = k) Poisson en 37 combinaciones",
   "fuente": "Rejilla sintética con colas extremas",
   "clase": "A",
   "valores": 37,
   "difMax": 8.140189911021167e-16,
   "difEscaladaMax": 5.757905010379102e-13,
   "peor": "[35]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "dpois(k, lambda)"
   }
  },
  {
   "id": "dist.qtukey/inversion-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qtukey"
   },
   "titulo": "Cuantil del rango estudentizado en 105 combinaciones (inversión exacta de ptukey)",
   "fuente": "Rejilla sintética",
   "clase": "B",
   "valores": 105,
   "difMax": 2.212052763184147e-11,
   "difEscaladaMax": 6.060853092139555e-12,
   "peor": "[92]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "uniroot(function(x) ptukey(x, k, gl) - p, c(0.01, 200), tol = 1e-14)$root"
   }
  },
  {
   "id": "dist.qtukey/qtukey-de-r",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qtukey"
   },
   "titulo": "Contra qtukey de R tal cual (tolerancia 1e-4 por diseño), 105 combinaciones",
   "fuente": "Rejilla sintética",
   "clase": "B",
   "valores": 105,
   "difMax": 2.738583311234777e-7,
   "difEscaladaMax": 7.533201041296815e-8,
   "peor": "[16]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qtukey(p, k, gl)"
   }
  },
  {
   "id": "dist.ptukey/rejilla",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ptukey"
   },
   "titulo": "P(Q ≤ q) del rango estudentizado en 594 combinaciones de q, k y gl",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 594,
   "difMax": 5.240252676230739e-14,
   "difEscaladaMax": 5.240252676230739e-14,
   "peor": "[384]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ptukey(q, k, gl)"
   }
  },
  {
   "id": "lineal.anova/anova1-alias",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial en bloques con N:P:K confundido, SC tipo 1",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 48,
   "difMax": 5.400124791776761e-13,
   "difEscaladaMax": 1.3600232051658168e-14,
   "peor": "sc[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "anova(lm(yield ~ block + N * P * K))"
   }
  },
  {
   "id": "lineal.anova/anova1-covariable-y-factores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable y dos factores desbalanceados, SC tipo 1",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 24,
   "difMax": 7.958078640513122e-13,
   "difEscaladaMax": 6.3569552764695555e-15,
   "peor": "p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "anova(lm(mpg ~ wt + cyl + am))"
   }
  },
  {
   "id": "lineal.anova/anova1-desbalanceado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 3 × 2 desbalanceado, SC tipo 1",
   "fuente": "Fox y Weisberg (2019); conjunto Moore de carData",
   "clase": "A",
   "valores": 24,
   "difMax": 2.8421709430404007e-13,
   "difEscaladaMax": 8.802482552385287e-15,
   "peor": "sc[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "anova(lm(conformity ~ fcategory * partner.status))"
   }
  },
  {
   "id": "lineal.anova/anova1-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 2 × 3 balanceado, SC tipo 1 (las tres coinciden)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 24,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 1.387450312430964e-15,
   "peor": "sc[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "anova(lm(breaks ~ wool * tension))"
   }
  },
  {
   "id": "lineal.anova/anova1-pendientes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable por factor (pendientes distintas), SC tipo 1",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 24,
   "difMax": 7.958078640513122e-13,
   "difEscaladaMax": 1.5185588531894187e-15,
   "peor": "p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "anova(lm(mpg ~ wt * am))"
   }
  },
  {
   "id": "lineal.anova/anova2-alias",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial en bloques con N:P:K confundido, SC tipo 2 (por comparación de modelos)",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 48,
   "difMax": 6.821210263296962e-13,
   "difEscaladaMax": 8.021361352916756e-14,
   "peor": "sc[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(yield ~ block + N * P * K), type = 2)"
   }
  },
  {
   "id": "lineal.anova/anova2-covariable-y-factores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable y dos factores desbalanceados, SC tipo 2",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 24,
   "difMax": 1.2789769243681803e-13,
   "difEscaladaMax": 9.658940314238862e-15,
   "peor": "sc[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(mpg ~ wt + cyl + am), type = 2)"
   }
  },
  {
   "id": "lineal.anova/anova2-desbalanceado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 3 × 2 desbalanceado, SC tipo 2",
   "fuente": "Fox y Weisberg (2019); conjunto Moore de carData",
   "clase": "A",
   "valores": 24,
   "difMax": 3.410605131648481e-13,
   "difEscaladaMax": 2.447046357024808e-15,
   "peor": "sc[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(conformity ~ fcategory * partner.status), type = 2)"
   }
  },
  {
   "id": "lineal.anova/anova2-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 2 × 3 balanceado, SC tipo 2 (las tres coinciden)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 24,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 1.533258325621486e-15,
   "peor": "F[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(breaks ~ wool * tension), type = 2)"
   }
  },
  {
   "id": "lineal.anova/anova2-pendientes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable por factor (pendientes distintas), SC tipo 2",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 24,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 4.574118861455645e-14,
   "peor": "p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(mpg ~ wt * am), type = 2)"
   }
  },
  {
   "id": "lineal.anova/anova3-covariable-y-factores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable y dos factores desbalanceados, SC tipo 3",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 30,
   "difMax": 3.410605131648481e-13,
   "difEscaladaMax": 8.326672684688674e-15,
   "peor": "sc[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(mpg ~ wt + cyl + am, contrasts = <contr.sum en todos los factores>), type = 3)"
   }
  },
  {
   "id": "lineal.anova/anova3-desbalanceado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 3 × 2 desbalanceado, SC tipo 3",
   "fuente": "Fox y Weisberg (2019); conjunto Moore de carData",
   "clase": "A",
   "valores": 30,
   "difMax": 5.4569682106375694e-12,
   "difEscaladaMax": 1.579999534807727e-14,
   "peor": "p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(conformity ~ fcategory * partner.status, contrasts = <contr.sum en todos los factores>), type = 3)"
   }
  },
  {
   "id": "lineal.anova/anova3-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Factorial 2 × 3 balanceado, SC tipo 3 (las tres coinciden)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 30,
   "difMax": 7.275957614183426e-12,
   "difEscaladaMax": 1.1150547828954451e-14,
   "peor": "p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(breaks ~ wool * tension, contrasts = <contr.sum en todos los factores>), type = 3)"
   }
  },
  {
   "id": "lineal.anova/anova3-pendientes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.anova"
   },
   "titulo": "Covariable por factor (pendientes distintas), SC tipo 3",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 30,
   "difMax": 9.094947017729282e-13,
   "difEscaladaMax": 1.0908332688832602e-14,
   "peor": "p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::Anova(lm(mpg ~ wt * am, contrasts = <contr.sum en todos los factores>), type = 3)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-anidado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Factor anidado: tension dentro de wool (a/b)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 337,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ wool/tension)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Factorial 2 × 3 con contrastes de tratamiento",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 337,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ wool * tension)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Filas con faltantes omitidas",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 340,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(Ozone ~ Solar.R + Wind)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-pendientes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Covariable con pendientes por grupo (x + x:a)",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 103,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(mpg ~ wt + wt:am)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-polinomial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Contrastes polinomiales ortogonales (.L, .Q)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 169,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "valores[1][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ tension)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-potencia",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Interacciones hasta orden 2 de tres factores ((a + b + c)^2)",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 183,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(yield ~ (N + P + K)^2)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-sin-intercepto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Sin intercepto: el primer factor con indicadoras, el segundo con contrastes",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 225,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ 0 + wool + tension)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-solo-interaccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Interacción sin efectos principales (indicadoras)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 393,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ wool:tension)"
   }
  },
  {
   "id": "formula.matrizComoColumnas/matriz-suma-y-helmert",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "formula.matrizComoColumnas"
   },
   "titulo": "Contrastes de suma cero y de Helmert",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 337,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "model.matrix(breaks ~ wool * tension)"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-alias",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Factorial en bloques con N:P:K confundido con bloques (coeficiente no estimable)",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 75,
   "difMax": 4.973799150320701e-14,
   "difEscaladaMax": 2.7121009245424343e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(yield ~ block + N * P * K))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-colineal",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Colinealidad exacta: x3 = x1 + x2 queda sin estimar",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 30,
   "difMax": 1.0800249583553523e-12,
   "difEscaladaMax": 3.09725775231164e-14,
   "peor": "F.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(y ~ x1 + x2 + x3))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Factorial 2 × 3: coeficientes, EE, t, p, R² y F",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 40,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 4.877736005656419e-15,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(breaks ~ wool * tension))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Regresión múltiple con 42 filas incompletas omitidas",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 30,
   "difMax": 2.5579538487363607e-13,
   "difEscaladaMax": 1.228736431027159e-14,
   "peor": "coeficientes.p[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(Ozone ~ Solar.R + Wind + Temp))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-regresion-con-factor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Regresión con covariable y dos factores",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 35,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 7.385026392693922e-15,
   "peor": "F.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(mpg ~ wt + cyl + am))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-sin-intercepto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Modelo sin intercepto",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 25,
   "difMax": 7.105427357601002e-14,
   "difEscaladaMax": 1.912154577316059e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(breaks ~ 0 + tension))"
   }
  },
  {
   "id": "lineal.resumenDe/resumen-suma-cero",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "lineal.resumenDe"
   },
   "titulo": "Contrastes de suma cero",
   "fuente": "Fox y Weisberg (2019); conjunto Moore de carData",
   "clase": "A",
   "valores": 40,
   "difMax": 4.884981308350689e-15,
   "difEscaladaMax": 1.595799530155804e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "summary(lm(conformity ~ fcategory * partner.status))"
   }
  },
  {
   "id": "hojas.leerLibroBase64/clippy",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "hojas.leerLibroBase64"
   },
   "titulo": "Encabezado de dos filas y celdas combinadas",
   "fuente": "Libro de ejemplo «clippy.xlsx» del paquete readxl",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "readxl": "1.4.3"
    },
    "codigo": "read_excel(readxl_example(\"clippy.xlsx\"), sheet, col_names = FALSE, col_types = \"list\")"
   }
  },
  {
   "id": "hojas.leerLibroBase64/datasets",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "hojas.leerLibroBase64"
   },
   "titulo": "Cuatro hojas de datos clásicos (1 263 filas en total)",
   "fuente": "Libro de ejemplo «datasets.xlsx» del paquete readxl",
   "clase": "A",
   "valores": 6271,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "readxl": "1.4.3"
    },
    "codigo": "read_excel(readxl_example(\"datasets.xlsx\"), sheet, col_names = FALSE, col_types = \"list\")"
   }
  },
  {
   "id": "hojas.leerLibroBase64/deaths",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "hojas.leerLibroBase64"
   },
   "titulo": "Hojas con notas arriba y abajo, fechas y celdas vacías",
   "fuente": "Libro de ejemplo «deaths.xlsx» del paquete readxl",
   "clase": "A",
   "valores": 230,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "readxl": "1.4.3"
    },
    "codigo": "read_excel(readxl_example(\"deaths.xlsx\"), sheet, col_names = FALSE, col_types = \"list\")"
   }
  },
  {
   "id": "hojas.leerLibroBase64/geometry",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "hojas.leerLibroBase64"
   },
   "titulo": "Datos que no empiezan en la celda A1",
   "fuente": "Libro de ejemplo «geometry.xlsx» del paquete readxl",
   "clase": "A",
   "valores": 13,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "readxl": "1.4.3"
    },
    "codigo": "read_excel(readxl_example(\"geometry.xlsx\"), sheet, col_names = FALSE, col_types = \"list\")"
   }
  },
  {
   "id": "hojas.leerLibroBase64/type-me",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "hojas.leerLibroBase64"
   },
   "titulo": "Lógicos, números guardados como texto, fechas y textos mezclados",
   "fuente": "Libro de ejemplo «type-me.xlsx» del paquete readxl",
   "clase": "A",
   "valores": 72,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "readxl": "1.4.3"
    },
    "codigo": "read_excel(readxl_example(\"type-me.xlsx\"), sheet, col_names = FALSE, col_types = \"list\")"
   }
  },
  {
   "id": "csv.leerColumnas/comas-y-comillas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "csv.leerColumnas"
   },
   "titulo": "Coma, fin de línea CRLF, comillas con comas y comillas dobles, notación científica y faltantes",
   "fuente": "Texto sintético con casos difíciles",
   "clase": "A",
   "valores": 28,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "utils": "4.4.2"
    },
    "codigo": "read.csv(text = texto, sep = \",\", dec = \".\", na.strings = c(\"\", \"NA\"), strip.white = TRUE)"
   }
  },
  {
   "id": "csv.leerColumnas/punto-y-coma-coma-decimal",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "csv.leerColumnas"
   },
   "titulo": "Punto y coma con coma decimal y un faltante al final",
   "fuente": "Texto sintético con casos difíciles",
   "clase": "A",
   "valores": 18,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "utils": "4.4.2"
    },
    "codigo": "read.csv(text = texto, sep = \";\", dec = \",\", na.strings = c(\"\", \"NA\"), strip.white = TRUE)"
   }
  },
  {
   "id": "csv.leerColumnas/tabulador-salto-dentro",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "csv.leerColumnas"
   },
   "titulo": "Tabulador con un salto de línea dentro de un texto entre comillas",
   "fuente": "Texto sintético con casos difíciles",
   "clase": "A",
   "valores": 15,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "utils": "4.4.2"
    },
    "codigo": "read.csv(text = texto, sep = \"\t\", dec = \".\", na.strings = c(\"\", \"NA\"), strip.white = TRUE)"
   }
  },
  {
   "id": "transformar.boxcoxResumen/arboles-regresion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.boxcoxResumen"
   },
   "titulo": "Volumen de 31 cerezos contra altura y diámetro",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "D",
   "valores": 5,
   "difMax": 5.356890042662599e-9,
   "difEscaladaMax": 5.356890042662599e-9,
   "peor": "lambda",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ll <- function(la) -n/2 * log(sum(qr.resid(qr(X), (y^la - 1) / (la * gm^(la - 1)))^2))   # gm = media geométrica\noptimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12); IC: uniroot de ll(la) = máx − qchisq(0.95, 1)/2"
   }
  },
  {
   "id": "transformar.boxcoxResumen/ozono-sin-modelo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.boxcoxResumen"
   },
   "titulo": "Ozono diario, solo la media (116 observaciones; los faltantes se omiten)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "D",
   "valores": 5,
   "difMax": 8.306202947672148e-14,
   "difEscaladaMax": 8.306202947672148e-14,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ll <- function(la) -n/2 * log(sum(qr.resid(qr(X), (y^la - 1) / (la * gm^(la - 1)))^2))   # gm = media geométrica\noptimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12); IC: uniroot de ll(la) = máx − qchisq(0.95, 1)/2"
   }
  },
  {
   "id": "transformar.boxcoxResumen/venenos-box-cox-1964",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.boxcoxResumen"
   },
   "titulo": "Tiempos de supervivencia, 3 venenos × 4 tratamientos (ejemplo original de Box y Cox; publicaron λ ≈ −0.75)",
   "fuente": "Box y Cox (1964); conjunto poisons del paquete boot",
   "clase": "D",
   "valores": 5,
   "difMax": 8.264861017792668e-10,
   "difEscaladaMax": 8.264861017792668e-10,
   "peor": "lambda",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "boot": "1.3.31"
    },
    "codigo": "ll <- function(la) -n/2 * log(sum(qr.resid(qr(X), (y^la - 1) / (la * gm^(la - 1)))^2))   # gm = media geométrica\noptimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12); IC: uniroot de ll(la) = máx − qchisq(0.95, 1)/2"
   }
  },
  {
   "id": "transformar.aplicar/arcoseno-grados",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Arcoseno de la raíz de un porcentaje (grados)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 9,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.7528769599991083e-16,
   "peor": "[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "asin(sqrt(pct / 100)) * 180 / pi"
   }
  },
  {
   "id": "transformar.aplicar/arcoseno-porcentaje",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Arcoseno de la raíz de un porcentaje (radianes)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 9,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "asin(sqrt(pct / 100))"
   }
  },
  {
   "id": "transformar.aplicar/boxcox-lambda-dado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Box-Cox con λ = 0.37",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 2.8615140725306077e-16,
   "peor": "[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "(y^0.37 - 1) / 0.37"
   }
  },
  {
   "id": "transformar.aplicar/log-mas-c",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "ln(x + 1), para conteos con ceros",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "log(y + 1)"
   }
  },
  {
   "id": "transformar.aplicar/log",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Logaritmo natural",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "log(y)"
   }
  },
  {
   "id": "transformar.aplicar/log10",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Logaritmo base 10",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "log10(y)"
   }
  },
  {
   "id": "transformar.aplicar/raiz-mas-medio",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "√(x + 0.5)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "sqrt(y + 0.5)"
   }
  },
  {
   "id": "transformar.aplicar/transformar-estandarizar",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "transformar.aplicar"
   },
   "titulo": "Estandarizar (media 0, DE 1)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "as.vector(scale(y))"
   }
  },
  {
   "id": "expresiones.enTabla/arcoseno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "asin(sqrt(germ / 100))",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 1.5963604011212555e-16,
   "peor": "[19]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, asin(sqrt(germ / 100)))"
   }
  },
  {
   "id": "expresiones.enTabla/aritmetica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "log(rend) + 2 * altura",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 1.2912943399396733e-16,
   "peor": "[21]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, log(rend) + 2 * altura)"
   }
  },
  {
   "id": "expresiones.enTabla/condicion-numerica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "ifelse(dosis > 60, rend - 1, NA)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, ifelse(dosis > 60, rend - 1, NA))"
   }
  },
  {
   "id": "expresiones.enTabla/condicion-texto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "ifelse(rend > mean(rend, na.rm = TRUE), \"alto\", \"bajo\")",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, ifelse(rend > mean(rend, na.rm = TRUE), \"alto\", \"bajo\"))"
   }
  },
  {
   "id": "expresiones.enTabla/estandarizar",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "(rend - mean(rend, na.rm = TRUE)) / sd(rend, na.rm = TRUE)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, (rend - mean(rend, na.rm = TRUE)) / sd(rend, na.rm = TRUE))"
   }
  },
  {
   "id": "expresiones.enTabla/filtro-y",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "dosis >= 60 & hibrido != \"H-40\"",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, dosis >= 60 & hibrido != \"H-40\")"
   }
  },
  {
   "id": "expresiones.enTabla/logaritmos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "log(altura, 2) + log10(dosis + 1)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "[7]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, log(altura, 2) + log10(dosis + 1))"
   }
  },
  {
   "id": "expresiones.enTabla/logica-con-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "!is.na(rend) | altura > 2",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, !is.na(rend) | altura > 2)"
   }
  },
  {
   "id": "expresiones.enTabla/logico-por-numero",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "is.na(rend) * 1",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, is.na(rend) * 1)"
   }
  },
  {
   "id": "expresiones.enTabla/maximo-paralelo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "pmax(rend, 5)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, pmax(rend, 5))"
   }
  },
  {
   "id": "expresiones.enTabla/pegar",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "paste(hibrido, dosis, sep = \"-\")",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, paste(hibrido, dosis, sep = \"-\"))"
   }
  },
  {
   "id": "expresiones.enTabla/pertenencia",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "hibrido %in% c(\"H-52\", \"H-66\")",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, hibrido %in% c(\"H-52\", \"H-66\"))"
   }
  },
  {
   "id": "expresiones.enTabla/precedencia",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "-2^2 + rend^2",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, -2^2 + rend^2)"
   }
  },
  {
   "id": "expresiones.enTabla/raiz",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "sqrt(altura + 0.5)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, sqrt(altura + 0.5))"
   }
  },
  {
   "id": "expresiones.enTabla/redondeo-con-empates",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "round(altura, 1)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, round(altura, 1))"
   }
  },
  {
   "id": "expresiones.enTabla/redondeo-entero",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "round(altura * 2)",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, round(altura * 2))"
   }
  },
  {
   "id": "expresiones.enTabla/resto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "expresiones.enTabla"
   },
   "titulo": "rend %% 2",
   "fuente": "Datos sintéticos con faltantes, factores y empates para el redondeo",
   "clase": "A",
   "valores": 24,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "with(datos, rend %% 2)"
   }
  },
  {
   "id": "desc.asimetria/desplazado-asimetria",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.asimetria"
   },
   "titulo": "Cinco valores alrededor de mil millones (tipos 1, 2 y 3)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::skewness(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.asimetria/insectos-asimetria",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.asimetria"
   },
   "titulo": "Conteos de insectos con muchos ceros (tipos 1, 2 y 3)",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::skewness(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.asimetria/ozono-asimetria",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.asimetria"
   },
   "titulo": "Ozono con faltantes, sesgado a la derecha (tipos 1, 2 y 3)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::skewness(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.asimetria/precipitacion-asimetria",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.asimetria"
   },
   "titulo": "Precipitación de 70 ciudades (tipos 1, 2 y 3)",
   "fuente": "McNeil (1977); conjunto precip de R",
   "clase": "A",
   "valores": 3,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::skewness(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.curtosis/desplazado-curtosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.curtosis"
   },
   "titulo": "Cinco valores alrededor de mil millones (tipos 1, 2 y 3)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 6.135350829429478e-16,
   "peor": "[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::kurtosis(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.curtosis/insectos-curtosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.curtosis"
   },
   "titulo": "Conteos de insectos con muchos ceros (tipos 1, 2 y 3)",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 3,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::kurtosis(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.curtosis/ozono-curtosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.curtosis"
   },
   "titulo": "Ozono con faltantes, sesgado a la derecha (tipos 1, 2 y 3)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 3,
   "difMax": 2.886579864025407e-15,
   "difEscaladaMax": 2.2503165972789936e-15,
   "peor": "[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::kurtosis(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "desc.curtosis/precipitacion-curtosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.curtosis"
   },
   "titulo": "Precipitación de 70 ciudades (tipos 1, 2 y 3)",
   "fuente": "McNeil (1977); conjunto precip de R",
   "clase": "A",
   "valores": 3,
   "difMax": 1.3322676295501878e-15,
   "difEscaladaMax": 1.3322676295501878e-15,
   "peor": "[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "e1071": "1.7.16"
    },
    "codigo": "sapply(1:3, function(t) e1071::kurtosis(x, na.rm = TRUE, type = t))"
   }
  },
  {
   "id": "descriptivos/dientes-dosis-numerica",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Longitud de odontoblastos por suplemento × dosis (dosis numérica); 99 %, cuantil tipo 9",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "A",
   "valores": 220,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 9.350339414245024e-16,
   "peor": "tabla.curtosis[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 9, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 2), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.99; grupos = interaction(supp, dose, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/erupciones-sin-grupos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Duración y espera de 272 erupciones, sin agrupar, con percentiles 2.5, 10, 90 y 97.5",
   "fuente": "Azzalini y Bowman (1990); conjunto faithful de R",
   "clase": "A",
   "valores": 79,
   "difMax": 3.979039320256561e-13,
   "difEscaladaMax": 2.5062015285037716e-15,
   "peor": "tabla.curtosis[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 7, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 2), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.95; grupos = interaction(, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/insectos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Conteos de insectos por insecticida: empates, varias modas y ceros; cuantil tipo 2, forma tipo 3",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 213,
   "difMax": 2.1316282072803006e-14,
   "difEscaladaMax": 9.702116966313643e-16,
   "peor": "tabla.ic_varianza_inf[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 2, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 3), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.95; grupos = interaction(spray, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/npk-tres-factores",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Rendimiento de chícharo por N × P × K: grupos de 3 (sin IC de la mediana ni curtosis tipo 2)",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 301,
   "difMax": 1.8189894035458565e-12,
   "difEscaladaMax": 6.890467814867133e-16,
   "peor": "tabla.ic_varianza_sup[7]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 7, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 2), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.95; grupos = interaction(N, P, K, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/ozono-por-mes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Ozono, radiación y temperatura por mes, con faltantes; 90 %, cuantil tipo 6, recorte 20 %, forma tipo 1",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 530,
   "difMax": 1.2732925824820995e-11,
   "difEscaladaMax": 1.3322676295501878e-15,
   "peor": "tabla.curtosis[13]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 6, mean(trim = 0.2), media geométrica y armónica, e1071::skewness/kurtosis(type = 1), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.9; grupos = interaction(Month, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/plantas-factor-faltante",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Peso seco con tres filas sin tratamiento: quedan fuera y se cuentan",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R, con tres tratamientos borrados",
   "clase": "A",
   "valores": 108,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 5.270450579692402e-16,
   "peor": "tabla.curtosis[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 7, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 2), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.95; grupos = interaction(group, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "descriptivos/plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descriptivos"
   },
   "titulo": "Peso seco de plantas por tratamiento, con percentiles 5 y 95",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 114,
   "difMax": 2.3869795029440866e-15,
   "difEscaladaMax": 2.3869795029440866e-15,
   "peor": "tabla.curtosis[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "e1071": "1.7.16"
    },
    "codigo": "Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = 7, mean(trim = 0.1), media geométrica y armónica, e1071::skewness/kurtosis(type = 2), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al 0.95; grupos = interaction(group, lex.order = TRUE, drop = TRUE)"
   }
  },
  {
   "id": "desc.cuantil/erupciones",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Duración de 272 erupciones (bimodal): 171 combinaciones",
   "fuente": "Azzalini y Bowman (1990); conjunto faithful de R",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/n-dos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Dos valores: 171 combinaciones",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/n-tres-negativos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Tres valores con negativos: 171 combinaciones",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/n-uno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Un solo valor: 171 combinaciones",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/ozono-con-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Ozono con 37 faltantes y empates: 171 combinaciones",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "Precipitación anual de 70 ciudades: 171 combinaciones de probabilidad y tipo",
   "fuente": "McNeil (1977); conjunto precip de R",
   "clase": "A",
   "valores": 171,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "desc.cuantil/uno-a-diez-rejilla-fina",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "desc.cuantil"
   },
   "titulo": "1, 2, …, 10 con probabilidades en múltiplos de 1/20 (prueba el margen de 4ε): 189 combinaciones",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 189,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)"
   }
  },
  {
   "id": "frecuencias/autos-cambios-numerico",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Número de velocidades (columna numérica tomada como factor)",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 18,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(gear), useNA = \"no\"); prop.table(tab); cumsum(tab)"
   }
  },
  {
   "id": "frecuencias/autos-cilindros-cambios",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Cilindros × velocidades, con una celda vacía",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 51,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 2.131628207280301e-16,
   "peor": "pct_columna[0][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(cyl), factor(gear), useNA = \"no\"); 100 * prop.table(tab); 100 * prop.table(tab, 1); 100 * prop.table(tab, 2)"
   }
  },
  {
   "id": "frecuencias/ozono-por-mes-con-faltantes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Mes × nivel de ozono, con la categoría de faltantes",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 101,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 2.131628207280301e-16,
   "peor": "pct_fila[4][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(mes), factor(ozono), useNA = \"ifany\"); 100 * prop.table(tab); 100 * prop.table(tab, 1); 100 * prop.table(tab, 2)"
   }
  },
  {
   "id": "frecuencias/ozono-por-mes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Mes × nivel de ozono, 37 faltantes fuera",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 79,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 2.131628207280301e-16,
   "peor": "pct_fila[1][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(mes), factor(ozono), useNA = \"no\"); 100 * prop.table(tab); 100 * prop.table(tab, 1); 100 * prop.table(tab, 2)"
   }
  },
  {
   "id": "frecuencias/pollos-con-faltantes-dentro",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Seis alimentos con 4 faltantes como categoría",
   "fuente": "chickwts de R con cuatro valores borrados",
   "clase": "A",
   "valores": 38,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(feed), useNA = \"ifany\"); prop.table(tab); cumsum(tab)"
   }
  },
  {
   "id": "frecuencias/pollos-con-faltantes-fuera",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Seis alimentos con 4 faltantes que no entran",
   "fuente": "chickwts de R con cuatro valores borrados",
   "clase": "A",
   "valores": 33,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(feed), useNA = \"no\"); prop.table(tab); cumsum(tab)"
   }
  },
  {
   "id": "frecuencias/pollos-una-via",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "frecuencias"
   },
   "titulo": "Seis alimentos para pollos, grupos de 10 a 14",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 33,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "tab <- table(factor(feed), useNA = \"no\"); prop.table(tab); cumsum(tab)"
   }
  },
  {
   "id": "proporciones/autos-transmision-por-cilindros",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "proporciones"
   },
   "titulo": "Transmisión manual o automática dentro de cada número de cilindros (90 %)",
   "fuente": "Henderson y Velleman (1981); conjunto mtcars de R",
   "clase": "A",
   "valores": 104,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "tabla.agresti_coull_inf[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "x y n por grupo con table() o tapply(); intervalos con prop.test, binom.test y las fórmulas de Agresti-Coull, Jeffreys y Wald"
   }
  },
  {
   "id": "proporciones/germinacion-por-tratamiento",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "proporciones"
   },
   "titulo": "Germinación por tratamiento sumando cajas de 50 semillas (una caja sin dato)",
   "fuente": "Datos sintéticos de germinación",
   "clase": "A",
   "valores": 53,
   "difMax": 3.885780586188048e-16,
   "difEscaladaMax": 3.885780586188048e-16,
   "peor": "tabla.clopper_pearson_inf[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "x y n por grupo con table() o tapply(); intervalos con prop.test, binom.test y las fórmulas de Agresti-Coull, Jeffreys y Wald"
   }
  },
  {
   "id": "proporciones/germinacion-total-99",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "proporciones"
   },
   "titulo": "Germinación total al 99 % con Wilson y Jeffreys",
   "fuente": "Datos sintéticos de germinación",
   "clase": "A",
   "valores": 11,
   "difMax": 5.551115123125783e-16,
   "difEscaladaMax": 5.551115123125783e-16,
   "peor": "tabla.jeffreys_inf[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "x y n por grupo con table() o tapply(); intervalos con prop.test, binom.test y las fórmulas de Agresti-Coull, Jeffreys y Wald"
   }
  },
  {
   "id": "proporciones/pollos-categorias",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "proporciones"
   },
   "titulo": "Proporción de cada alimento entre 71 pollos",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 104,
   "difMax": 3.885780586188048e-16,
   "difEscaladaMax": 3.885780586188048e-16,
   "peor": "tabla.clopper_pearson_sup[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "x y n por grupo con table() o tapply(); intervalos con prop.test, binom.test y las fórmulas de Agresti-Coull, Jeffreys y Wald"
   }
  },
  {
   "id": "bondad-ajuste/dado-pocos-esperados",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "bondad-ajuste"
   },
   "titulo": "Veinte tiradas de un dado: todas las categorías esperan menos de 5",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 48,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.0816681711721678e-16,
   "peor": "contribucion[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "chisq.test(observado)"
   }
  },
  {
   "id": "bondad-ajuste/mendel-dihibrido",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "bondad-ajuste"
   },
   "titulo": "Cruza dihíbrida de chícharo de Mendel contra 9:3:3:1",
   "fuente": "Mendel (1866), semillas de la F2",
   "clase": "A",
   "valores": 34,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "chisq.test(observado, p = c(9, 3, 3, 1), rescale.p = TRUE)"
   }
  },
  {
   "id": "bondad-ajuste/mendel-monohibrido",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "bondad-ajuste"
   },
   "titulo": "Forma de la semilla de chícharo contra 3:1 (7 324 semillas)",
   "fuente": "Mendel (1866), forma de la semilla en la F2",
   "clase": "A",
   "valores": 20,
   "difMax": 1.3877787807814457e-17,
   "difEscaladaMax": 1.3877787807814457e-17,
   "peor": "contribucion[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "chisq.test(observado, p = c(3, 1), rescale.p = TRUE)"
   }
  },
  {
   "id": "bondad-ajuste/pollos-iguales",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "bondad-ajuste"
   },
   "titulo": "¿Los seis alimentos tienen el mismo número de pollos? (datos sin agregar)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 48,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "contribucion[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "chisq.test(observado)"
   }
  },
  {
   "id": "prop.ic/ic-agresti-coull",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de agresti_coull en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "[28][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "z <- qnorm(1 - (1 - nivel) / 2); nt <- n + z^2; pt <- (x + z^2 / 2) / nt; pmin(1, pmax(0, pt + c(-1, 1) * z * sqrt(pt * (1 - pt) / nt)))"
   }
  },
  {
   "id": "prop.ic/ic-clopper-pearson",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de clopper_pearson en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 1.3777173846207802e-14,
   "difEscaladaMax": 1.3777173846207802e-14,
   "peor": "[87][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "binom.test(x, n, conf.level = nivel)$conf.int"
   }
  },
  {
   "id": "prop.ic/ic-jeffreys",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de jeffreys en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 2.6201263381153694e-14,
   "difEscaladaMax": 2.6201263381153694e-14,
   "peor": "[69][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "c(if (x == 0) 0 else qbeta(a, x + 0.5, n - x + 0.5), if (x == n) 1 else qbeta(1 - a, x + 0.5, n - x + 0.5))"
   }
  },
  {
   "id": "prop.ic/ic-wald",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de wald en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "[8][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pmin(1, pmax(0, x / n + c(-1, 1) * z * sqrt(x / n * (1 - x / n) / n)))"
   }
  },
  {
   "id": "prop.ic/ic-wilson-cc",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de wilson_cc en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "[50][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "prop.test(x, n, conf.level = nivel)$conf.int   # la corrección se limita a |x − n/2|"
   }
  },
  {
   "id": "prop.ic/ic-wilson",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "prop.ic"
   },
   "titulo": "Intervalo de wilson en 93 combinaciones de x, n y nivel (incluye x = 0, x = n y x = n/2)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 2.7755575615628914e-16,
   "difEscaladaMax": 2.7755575615628914e-16,
   "peor": "[6][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "prop.test(x, n, conf.level = nivel, correct = FALSE)$conf.int"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-atipico-extremo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: atipico-extremo",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-erupciones",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: erupciones",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-normal-200",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: normal-200",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 3.186340080674199e-14,
   "difEscaladaMax": 3.186340080674199e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-ocho-valores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: ocho-valores",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-ozono",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: ozono",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 3.161428591075238e-13,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: plantas",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 1.0103029524088925e-14,
   "difEscaladaMax": 1.0103029524088925e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: precipitacion",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 1.4210854715202004e-14,
   "peor": "A",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.andersonDarling/anderson-uniforme-50",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.andersonDarling"
   },
   "titulo": "Anderson-Darling: uniforme-50",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 1.0547118733938987e-14,
   "difEscaladaMax": 1.0547118733938987e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::ad.test(x)"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n10-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 10, banda al 90 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 30,
   "difMax": 7.993605777301127e-15,
   "difEscaladaMax": 3.1129259134108044e-15,
   "peor": "sup[9]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n10-95",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 10, banda al 95 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 30,
   "difMax": 1.3766765505351941e-14,
   "difEscaladaMax": 4.910790981397757e-15,
   "peor": "sup[9]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n11-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 11, banda al 90 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 33,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.7763568394002505e-15,
   "peor": "sup[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n11-95",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 11, banda al 95 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 33,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.2212453270876722e-15,
   "peor": "sup[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n300-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 300, banda al 90 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 900,
   "difMax": 1.7008616737257398e-13,
   "difEscaladaMax": 4.7493234131591604e-14,
   "peor": "sup[299]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n300-95",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 300, banda al 95 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 900,
   "difMax": 3.2862601528904634e-13,
   "difEscaladaMax": 8.736158369801618e-14,
   "peor": "sup[299]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n5-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 5, banda al 90 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 15,
   "difMax": 1.3322676295501878e-15,
   "difEscaladaMax": 5.745804007316434e-16,
   "peor": "inf[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n5-95",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 5, banda al 95 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 15,
   "difMax": 8.43769498715119e-15,
   "difEscaladaMax": 3.2801703271027874e-15,
   "peor": "sup[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n50-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 50, banda al 90 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 150,
   "difMax": 3.1530333899354446e-14,
   "difEscaladaMax": 1.022784769958908e-14,
   "peor": "sup[49]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.bandaQQ/banda-qq-n50-95",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bandaQQ"
   },
   "titulo": "n = 50, banda al 95 %",
   "fuente": "Fórmulas",
   "clase": "A",
   "valores": 150,
   "difMax": 4.884981308350689e-15,
   "difEscaladaMax": 3.3288059582065236e-15,
   "peor": "sup[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qnorm(ppoints(n)); qnorm(qbeta(c(a/2, 1 - a/2), i, n - i + 1))"
   }
  },
  {
   "id": "sup.noAditividadTabla/bloques-aditivo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.noAditividadTabla"
   },
   "titulo": "Bloques × tratamientos aditivo (5 × 6, sin interacción)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.3533175408374518e-11,
   "difEscaladaMax": 5.150925545832111e-13,
   "peor": "P",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "agricolae": "1.3.7"
    },
    "codigo": "m <- aov(y ~ f1 + f2); agricolae::nonadditivity(y, f1, f2, df.residual(m), deviance(m) / df.residual(m))\np <- pf(F, 1, gl_residual, lower.tail = FALSE)   # agricolae da 0.9515949248 con 1 - pf()"
   }
  },
  {
   "id": "sup.noAditividadTabla/bloques-multiplicativo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.noAditividadTabla"
   },
   "titulo": "Efectos multiplicativos (la no aditividad debe salir significativa)",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 7,
   "difMax": 1.2369127944111824e-10,
   "difEscaladaMax": 3.2198468432238364e-13,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "agricolae": "1.3.7"
    },
    "codigo": "m <- aov(y ~ f1 + f2); agricolae::nonadditivity(y, f1, f2, df.residual(m), deviance(m) / df.residual(m))\np <- pf(F, 1, gl_residual, lower.tail = FALSE)   # agricolae da 6.858957846e-13 con 1 - pf()"
   }
  },
  {
   "id": "sup.noAditividadTabla/maiz-bloques-tratamientos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.noAditividadTabla"
   },
   "titulo": "Maíz: bloque × (híbrido · dosis), 4 × 12",
   "fuente": "Datos sintéticos del ejemplo de la app",
   "clase": "A",
   "valores": 7,
   "difMax": 2.149391775674303e-13,
   "difEscaladaMax": 4.3520742565306136e-14,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "agricolae": "1.3.7"
    },
    "codigo": "m <- aov(y ~ f1 + f2); agricolae::nonadditivity(y, f1, f2, df.residual(m), deviance(m) / df.residual(m))\np <- pf(F, 1, gl_residual, lower.tail = FALSE)   # agricolae da 0.6709818055 con 1 - pf()"
   }
  },
  {
   "id": "sup.noAditividadTabla/roturas-replicado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.noAditividadTabla"
   },
   "titulo": "Lana × tensión con 9 repeticiones por celda (r = 9: el residual no se corrige)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.0186340659856796e-9,
   "difEscaladaMax": 1.4999964329455993e-14,
   "peor": "Q",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "agricolae": "1.3.7"
    },
    "codigo": "m <- aov(y ~ f1 + f2); agricolae::nonadditivity(y, f1, f2, df.residual(m), deviance(m) / df.residual(m))\np <- pf(F, 1, gl_residual, lower.tail = FALSE)   # agricolae da 0.07582146416 con 1 - pf()"
   }
  },
  {
   "id": "sup.cercasTukey/cercas-erupciones",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.cercasTukey"
   },
   "titulo": "Cercas de Tukey: erupciones",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 5,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "boxplot.stats(x)"
   }
  },
  {
   "id": "sup.cercasTukey/cercas-insectos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.cercasTukey"
   },
   "titulo": "Cercas de Tukey: insectos",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 5,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "boxplot.stats(x)"
   }
  },
  {
   "id": "sup.cercasTukey/cercas-ozono",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.cercasTukey"
   },
   "titulo": "Cercas de Tukey: ozono",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "boxplot.stats(x)"
   }
  },
  {
   "id": "sup.cercasTukey/cercas-pares-de-bisagras",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.cercasTukey"
   },
   "titulo": "Cercas de Tukey: pares-de-bisagras",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "boxplot.stats(x)"
   }
  },
  {
   "id": "sup.cercasTukey/cercas-precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.cercasTukey"
   },
   "titulo": "Cercas de Tukey: precipitacion",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 10,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "boxplot.stats(x)"
   }
  },
  {
   "id": "sup.rachas/doce-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Doce valores alternados, exacta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 1.4432899320127035e-15,
   "difEscaladaMax": 1.4432899320127035e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"two.sided\", pvalue = \"exact\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.rachas/doce-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Doce valores, cola de muchas rachas, exacta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 7.216449660063518e-16,
   "difEscaladaMax": 7.216449660063518e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"right.sided\", pvalue = \"exact\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.rachas/lago-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Lo mismo con la distribución exacta",
   "fuente": "Brockwell y Davis (1991); conjunto LakeHuron de R",
   "clase": "A",
   "valores": 7,
   "difMax": 4.9217246446905147e-23,
   "difEscaladaMax": 2.1483760399147398e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"two.sided\", pvalue = \"exact\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.rachas/lago-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Lago Hurón, cola de pocas rachas, normal",
   "fuente": "Brockwell y Davis (1991); conjunto LakeHuron de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"left.sided\", pvalue = \"normal\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.rachas/lago",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Nivel del lago Hurón (98 años): muy pocas rachas",
   "fuente": "Brockwell y Davis (1991); conjunto LakeHuron de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"two.sided\", pvalue = \"normal\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.rachas/precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.rachas"
   },
   "titulo": "Precipitación de 70 ciudades en el orden de la tabla",
   "fuente": "McNeil (1977); conjunto precip de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "randtests": "1.0.2"
    },
    "codigo": "randtests::runs.test(x, alternative = \"two.sided\", pvalue = \"normal\")   # p recortado a 1"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-arboles-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Lo mismo, bilateral",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "A",
   "valores": 2,
   "difMax": 1.0269562977782698e-15,
   "difEscaladaMax": 1.0269562977782698e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(Volume ~ Girth + Height, alternative = \"two.sided\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-arboles-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Lo mismo, autocorrelación negativa",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "A",
   "valores": 2,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 7.01308899268815e-16,
   "peor": "DW",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(Volume ~ Girth + Height, alternative = \"less\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Volumen contra diámetro y altura (n = 31, exacto)",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "A",
   "valores": 2,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 7.01308899268815e-16,
   "peor": "DW",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(Volume ~ Girth + Height, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-frenado-normal-forzada",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Frenado con exact = FALSE",
   "fuente": "Ezekiel (1930); conjunto cars de R",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(dist ~ speed, alternative = \"greater\", exact = FALSE)"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-frenado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Distancia de frenado contra velocidad (n = 50, exacto)",
   "fuente": "Ezekiel (1930); conjunto cars de R",
   "clase": "A",
   "valores": 2,
   "difMax": 2.0372592501871623e-14,
   "difEscaladaMax": 2.0372592501871623e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(dist ~ speed, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-lago-huron",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Nivel del lago Hurón contra el año (n = 98, autocorrelación fuerte)",
   "fuente": "Brockwell y Davis (1991); conjunto LakeHuron de R",
   "clase": "A",
   "valores": 2,
   "difMax": 2.7922109069322687e-14,
   "difEscaladaMax": 1.9082337075263184e-12,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(nivel ~ anio, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-ozono-normal",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Ozono contra radiación, viento y temperatura (n = 111: aproximación normal)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 2,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.2944702765180633e-16,
   "peor": "DW",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(Ozone ~ Solar.R + Wind + Temp, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.durbinWatsonModelo/dw-plantas-factor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.durbinWatsonModelo"
   },
   "titulo": "Peso seco contra tratamiento, en el orden de las filas",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 2,
   "difMax": 6.661338147750939e-15,
   "difEscaladaMax": 6.661338147750939e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lmtest": "0.9.40"
    },
    "codigo": "lmtest::dwtest(weight ~ group, alternative = \"two.sided\")"
   }
  },
  {
   "id": "sup.grubbs/grubbs-atipico-alto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.grubbs"
   },
   "titulo": "Grubbs: atipico-alto",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 5.008755691834118e-16,
   "difEscaladaMax": 6.962761979821282e-10,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "outliers": "0.15"
    },
    "codigo": "outliers::grubbs.test(x)"
   }
  },
  {
   "id": "sup.grubbs/grubbs-atipico-bajo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.grubbs"
   },
   "titulo": "Grubbs: atipico-bajo",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 1.5989333932235195e-16,
   "peor": "G",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "outliers": "0.15"
    },
    "codigo": "outliers::grubbs.test(x)"
   }
  },
  {
   "id": "sup.grubbs/grubbs-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.grubbs"
   },
   "titulo": "Grubbs: plantas",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 2.7755575615628914e-15,
   "difEscaladaMax": 2.7755575615628914e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "outliers": "0.15"
    },
    "codigo": "outliers::grubbs.test(x)"
   }
  },
  {
   "id": "sup.grubbs/grubbs-precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.grubbs"
   },
   "titulo": "Grubbs: precipitacion",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 2.7200464103316335e-14,
   "difEscaladaMax": 2.7200464103316335e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "outliers": "0.15"
    },
    "codigo": "outliers::grubbs.test(x)"
   }
  },
  {
   "id": "sup.atipicoModelo/influencia-arboles-atipico",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.atipicoModelo"
   },
   "titulo": "Volumen ~ diámetro + altura · mayor residuo estudentizado",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "A",
   "valores": 5,
   "difMax": 2.220446049250313e-15,
   "difEscaladaMax": 1.609823385706477e-15,
   "peor": "bonferroni",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::outlierTest(lm(Volume ~ Girth + Height))"
   }
  },
  {
   "id": "sup.atipicoModelo/influencia-frenado-atipico",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.atipicoModelo"
   },
   "titulo": "Distancia ~ velocidad · mayor residuo estudentizado",
   "fuente": "Ezekiel (1930); conjunto cars de R",
   "clase": "A",
   "valores": 5,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.7755575615628914e-16,
   "peor": "bonferroni",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::outlierTest(lm(dist ~ speed))"
   }
  },
  {
   "id": "sup.atipicoModelo/influencia-npk-factorial-atipico",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.atipicoModelo"
   },
   "titulo": "Chícharo: bloque + N × P × K · mayor residuo estudentizado",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 5,
   "difMax": 2.220446049250313e-15,
   "difEscaladaMax": 1.0149095747287977e-15,
   "peor": "rstudent",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::outlierTest(lm(yield ~ block + N * P * K))"
   }
  },
  {
   "id": "sup.atipicoModelo/influencia-ozono-faltantes-atipico",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.atipicoModelo"
   },
   "titulo": "Ozono ~ temperatura + viento, con filas faltantes (los números de fila son los de la tabla) · mayor residuo estudentizado",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 5,
   "difMax": 1.7618285302889447e-19,
   "difEscaladaMax": 1.655403616789474e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3"
    },
    "codigo": "car::outlierTest(lm(Ozone ~ Temp + Wind))"
   }
  },
  {
   "id": "sup.influenciaModelo/influencia-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.influenciaModelo"
   },
   "titulo": "Volumen ~ diámetro + altura",
   "fuente": "Ryan, Joiner y Ryan (1976); conjunto trees de R",
   "clase": "A",
   "valores": 124,
   "difMax": 1.6209256159527285e-14,
   "difEscaladaMax": 1.057997531707756e-14,
   "peor": "rstudent[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "m <- lm(Volume ~ Girth + Height); hatvalues(m); rstandard(m); rstudent(m); cooks.distance(m)"
   }
  },
  {
   "id": "sup.influenciaModelo/influencia-frenado",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.influenciaModelo"
   },
   "titulo": "Distancia ~ velocidad",
   "fuente": "Ezekiel (1930); conjunto cars de R",
   "clase": "A",
   "valores": 200,
   "difMax": 9.769962616701378e-15,
   "difEscaladaMax": 9.769962616701378e-15,
   "peor": "rstandard[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "m <- lm(dist ~ speed); hatvalues(m); rstandard(m); rstudent(m); cooks.distance(m)"
   }
  },
  {
   "id": "sup.influenciaModelo/influencia-npk-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.influenciaModelo"
   },
   "titulo": "Chícharo: bloque + N × P × K",
   "fuente": "Yates (1935); conjunto npk de R",
   "clase": "A",
   "valores": 96,
   "difMax": 3.774758283725532e-15,
   "difEscaladaMax": 3.6637359812630166e-15,
   "peor": "rstudent[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "m <- lm(yield ~ block + N * P * K); hatvalues(m); rstandard(m); rstudent(m); cooks.distance(m)"
   }
  },
  {
   "id": "sup.influenciaModelo/influencia-ozono-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.influenciaModelo"
   },
   "titulo": "Ozono ~ temperatura + viento, con filas faltantes (los números de fila son los de la tabla)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 464,
   "difMax": 1.1102230246251565e-14,
   "difEscaladaMax": 1.1102230246251565e-14,
   "peor": "rstandard[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "m <- lm(Ozone ~ Temp + Wind); hatvalues(m); rstandard(m); rstudent(m); cooks.distance(m)"
   }
  },
  {
   "id": "sup.bartlett/insectos-bartlett",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bartlett"
   },
   "titulo": "Conteos por insecticida (varianzas muy distintas)",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 3,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.36854298322761e-16,
   "peor": "K2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "bartlett.test(y ~ g)"
   }
  },
  {
   "id": "sup.bartlett/ozono-por-mes-bartlett",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bartlett"
   },
   "titulo": "Ozono por mes, con faltantes",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 3,
   "difMax": 1.1191048088221578e-13,
   "difEscaladaMax": 8.319908201098211e-15,
   "peor": "K2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "bartlett.test(y ~ g)"
   }
  },
  {
   "id": "sup.bartlett/plantas-bartlett",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bartlett"
   },
   "titulo": "Peso seco por tratamiento",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "bartlett.test(y ~ g)"
   }
  },
  {
   "id": "sup.bartlett/roturas-lana-tension-bartlett",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.bartlett"
   },
   "titulo": "Roturas por lana × tensión (seis grupos)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 3,
   "difMax": 3.469446951953614e-18,
   "difEscaladaMax": 3.469446951953614e-18,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "bartlett.test(y ~ g)"
   }
  },
  {
   "id": "sup.levene/insectos-brown-forsythe",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Conteos por insecticida (varianzas muy distintas) · mediana",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 4,
   "difMax": 3.1086244689504383e-15,
   "difEscaladaMax": 8.134872056267871e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = median)"
   }
  },
  {
   "id": "sup.levene/insectos-levene",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Conteos por insecticida (varianzas muy distintas) · media",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 4,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 1.3758789946710705e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = mean)"
   }
  },
  {
   "id": "sup.levene/ozono-por-mes-brown-forsythe",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Ozono por mes, con faltantes · mediana",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 4,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 2.245268031111492e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = median)"
   }
  },
  {
   "id": "sup.levene/ozono-por-mes-levene",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Ozono por mes, con faltantes · media",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 4,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 2.165305729380999e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = mean)"
   }
  },
  {
   "id": "sup.levene/plantas-brown-forsythe",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Peso seco por tratamiento · mediana",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 4,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 5.951950760523589e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = median)"
   }
  },
  {
   "id": "sup.levene/plantas-levene",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Peso seco por tratamiento · media",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 4,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 1.795078859255e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = mean)"
   }
  },
  {
   "id": "sup.levene/roturas-lana-tension-brown-forsythe",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Roturas por lana × tensión (seis grupos) · mediana",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 4,
   "difMax": 1.3322676295501878e-15,
   "difEscaladaMax": 4.608359006407247e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = median)"
   }
  },
  {
   "id": "sup.levene/roturas-lana-tension-levene",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.levene"
   },
   "titulo": "Roturas por lana × tensión (seis grupos) · media",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 4,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 3.450379137824433e-16,
   "peor": "F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "car": "3.1.3"
    },
    "codigo": "car::leveneTest(y ~ g, center = mean)"
   }
  },
  {
   "id": "sup.fligner/insectos-fligner",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.fligner"
   },
   "titulo": "Conteos por insecticida (varianzas muy distintas)",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 3,
   "difMax": 3.469446951953614e-18,
   "difEscaladaMax": 3.469446951953614e-18,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "fórmula de fligner.test con rank(round(abs(x - mediana), 12 cifras de la escala)); fligner.test tal cual da X2 = 14.48278104"
   }
  },
  {
   "id": "sup.fligner/ozono-por-mes-fligner",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.fligner"
   },
   "titulo": "Ozono por mes, con faltantes",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 3,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.8369098865770722e-16,
   "peor": "X2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "fórmula de fligner.test con rank(round(abs(x - mediana), 12 cifras de la escala)); fligner.test tal cual da X2 = 19.34070748"
   }
  },
  {
   "id": "sup.fligner/plantas-fligner",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.fligner"
   },
   "titulo": "Peso seco por tratamiento",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 3,
   "difMax": 1.2434497875801753e-14,
   "difEscaladaMax": 5.29025016562201e-15,
   "peor": "X2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "fórmula de fligner.test con rank(round(abs(x - mediana), 12 cifras de la escala)); fligner.test tal cual da X2 = 2.349937131"
   }
  },
  {
   "id": "sup.fligner/roturas-lana-tension-fligner",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.fligner"
   },
   "titulo": "Roturas por lana × tensión (seis grupos)",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 3,
   "difMax": 1.9539925233402755e-14,
   "difEscaladaMax": 1.6341272390534907e-15,
   "peor": "X2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "fórmula de fligner.test con rank(round(abs(x - mediana), 12 cifras de la escala)); fligner.test tal cual da X2 = 11.95740746"
   }
  },
  {
   "id": "sup.kolmogorov/ks-asintotica-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 150: distribución límite de Kolmogorov",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 0, 1, alternative = \"two.sided\")"
   }
  },
  {
   "id": "sup.kolmogorov/ks-asintotica-forzada",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 20 con exact = FALSE",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 9, 2, alternative = \"two.sided\", exact = FALSE)"
   }
  },
  {
   "id": "sup.kolmogorov/ks-asintotica-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 150, cola superior asintótica",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", -0.2, 1, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.kolmogorov/ks-exacta-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 20, bilateral exacta (Marsaglia, Tsang y Wang)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 10, 2, alternative = \"two.sided\")"
   }
  },
  {
   "id": "sup.kolmogorov/ks-exacta-desplazada",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 60 con la media corrida, bilateral exacta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 0, 1, alternative = \"two.sided\")"
   }
  },
  {
   "id": "sup.kolmogorov/ks-exacta-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 20, cola superior exacta (Birnbaum y Tingey)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 11, 2, alternative = \"greater\")"
   }
  },
  {
   "id": "sup.kolmogorov/ks-exacta-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.kolmogorov"
   },
   "titulo": "n = 60, cola inferior exacta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 1.3877787807814457e-17,
   "difEscaladaMax": 1.3877787807814457e-17,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "ks.test(x, \"pnorm\", 0, 1, alternative = \"less\")"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-erupciones",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: erupciones",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-normal-200-p-grande",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: normal-200-p-grande",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-ozono-n-mayor-100",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: ozono-n-mayor-100",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: plantas",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-precipitacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: precipitacion",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-seis-valores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: seis-valores",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "sup.lilliefors/lilliefors-uniforme-50",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.lilliefors"
   },
   "titulo": "Lilliefors: uniforme-50",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nortest": "1.0.4"
    },
    "codigo": "nortest::lillie.test(x)"
   }
  },
  {
   "id": "supuestos/metodo-insectos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Conteos por insecticida: varianzas muy distintas (rojo)",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 70,
   "difMax": 1.2079226507921703e-13,
   "difEscaladaMax": 1.2079226507921703e-13,
   "peor": "atipicos.bonferroni",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(count ~ spray); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-maiz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Maíz: bloques + híbrido × dosis (dosis numérica)",
   "fuente": "Datos sintéticos del ejemplo de la app",
   "clase": "A",
   "valores": 90,
   "difMax": 4.296563105299356e-14,
   "difEscaladaMax": 4.296563105299356e-14,
   "peor": "aditividad.F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(rend ~ bloque + hibrido * dosis); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-ozono-ordenado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Ozono por mes en el orden del día del mes, con faltantes",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "D",
   "valores": 70,
   "difMax": 5.684341886080801e-13,
   "difEscaladaMax": 2.471148285998481e-13,
   "peor": "boxcox.ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(Ozone ~ Month); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Peso seco por tratamiento (un factor, sin bloques)",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 61,
   "difMax": 1.2434497875801753e-14,
   "difEscaladaMax": 7.93809462606987e-15,
   "peor": "normalidad.shapiro.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(weight ~ group); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-roturas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Roturas por lana × tensión",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "D",
   "valores": 73,
   "difMax": 3.622300416561419e-8,
   "difEscaladaMax": 3.622300416561419e-8,
   "peor": "boxcox.lambda",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(breaks ~ wool * tension); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-una-muestra",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Tiempo de espera entre erupciones, sin tratamientos",
   "fuente": "Azzalini y Bowman (1990); conjunto faithful de R",
   "clase": "D",
   "valores": 41,
   "difMax": 7.089966835849282e-8,
   "difEscaladaMax": 3.406733270475484e-8,
   "peor": "boxcox.lambda",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(waiting ~ 1); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "supuestos/metodo-venenos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "supuestos"
   },
   "titulo": "Venenos × tratamientos: varianzas desiguales, con Box-Cox",
   "fuente": "Box y Cox (1964); conjunto poisons del paquete boot",
   "clase": "D",
   "valores": 91,
   "difMax": 1.8061151685344612e-8,
   "difEscaladaMax": 1.8061151685344612e-8,
   "peor": "boxcox.lambda",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "nortest": "1.0.4",
     "car": "3.1.3",
     "lmtest": "0.9.40",
     "agricolae": "1.3.7",
     "randtests": "1.0.2",
     "e1071": "1.7.16"
    },
    "codigo": "m <- lm(time ~ poison * treat); e <- residuals(m); shapiro.test(e); nortest::lillie.test(e); nortest::ad.test(e); car::leveneTest(e ~ g, center = median); bartlett.test(e ~ g); fligner.test(e ~ g); agricolae::nonadditivity(...); lmtest::dwtest(m); randtests::runs.test(e); car::outlierTest(m); cooks.distance(m); semáforo con alfa = 0.05"
   }
  },
  {
   "id": "sup.shapiro/shapiro-erupciones",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "272 erupciones bimodales (p muy pequeño)",
   "fuente": "Azzalini y Bowman (1990); conjunto faithful de R",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n11",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Once valores (último tamaño con la primera transformación)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 7.771561172376096e-16,
   "difEscaladaMax": 7.771561172376096e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n12",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Doce valores exponenciales (primer tamaño de la segunda)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Tres valores (p exacto)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n4",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Cuatro valores",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n5",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Cinco valores",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-n6",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Seis valores (segunda fórmula de los coeficientes)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 3.885780586188048e-15,
   "difEscaladaMax": 3.885780586188048e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-normal-5000",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "5000 valores normales (el máximo permitido)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-ozono",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Ozono con 37 faltantes, sesgado (p diminuto)",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 2,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 2.47893103973102e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-p-obvio",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Nueve ceros y un uno: R da p = 1e-99",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 4.764560328305439e-22,
   "difEscaladaMax": 4.747030428407585e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Peso seco de 30 plantas",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 2,
   "difMax": 7.216449660063518e-15,
   "difEscaladaMax": 7.216449660063518e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-rango-diminuto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "Rango menor que 1e-10 (R reescala)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "sup.shapiro/shapiro-uniforme-5000",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "sup.shapiro"
   },
   "titulo": "5000 valores uniformes (p del orden de 1e-30)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 2,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 2.7102264393502315e-13,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "shapiro.test(x)"
   }
  },
  {
   "id": "dist.qsignrank/signrank-cuantil-en-saltos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qsignrank"
   },
   "titulo": "Cuantiles del rango con signo justo en los saltos (283 puntos)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 283,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qsignrank(psignrank(0:M, n), n)"
   }
  },
  {
   "id": "dist.qsignrank/signrank-cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qsignrank"
   },
   "titulo": "Cuantiles del rango con signo en 162 combinaciones (cola inferior)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 162,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qsignrank(p, n)"
   }
  },
  {
   "id": "dist.qsignrank/signrank-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qsignrank"
   },
   "titulo": "Cuantiles del rango con signo en 162 combinaciones (cola superior)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 162,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qsignrank(p, n, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.psignrank/signrank-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.psignrank"
   },
   "titulo": "P(V ≤ x) del rango con signo en 186 combinaciones de x y n",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "psignrank(x, n)"
   }
  },
  {
   "id": "dist.psignrank/signrank-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.psignrank"
   },
   "titulo": "P(V > x) del rango con signo en 186 combinaciones de x y n",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 186,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "psignrank(x, n, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.ptnc/tnc-inferior-relativa",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ptnc"
   },
   "titulo": "P(T ≤ t) de al menos 1e-6, con error relativo, en 744 combinaciones",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 744,
   "difMax": 1.7469359292476838e-12,
   "difEscaladaMax": 4.0772644002140865e-8,
   "peor": "[589]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(t, gl, ncp, lower.tail = TRUE)"
   }
  },
  {
   "id": "dist.ptnc/tnc-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ptnc"
   },
   "titulo": "P(T ≤ t) de la t no central en 1177 combinaciones de t, gl y ncp",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 1177,
   "difMax": 1.7469359292476838e-12,
   "difEscaladaMax": 1.7469359292476838e-12,
   "peor": "[85]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(t, gl, ncp)"
   }
  },
  {
   "id": "dist.ptnc/tnc-superior-relativa",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ptnc"
   },
   "titulo": "P(T > t) de al menos 1e-6, con error relativo, en 1014 combinaciones",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 1014,
   "difMax": 1.7468908264373084e-12,
   "difEscaladaMax": 2.0258232202030768e-7,
   "peor": "[23]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(t, gl, ncp, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.ptnc/tnc-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.ptnc"
   },
   "titulo": "P(T > t) de la t no central en 1188 combinaciones de t, gl y ncp",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 1188,
   "difMax": 1.7468908264373084e-12,
   "difEscaladaMax": 1.7468908264373084e-12,
   "peor": "[85]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pt(t, gl, ncp, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.qwilcox/wilcox-cuantil-en-saltos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qwilcox"
   },
   "titulo": "Cuantiles de la suma de rangos justo en los saltos (89 puntos)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 89,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qwilcox(pwilcox(0:mn, m, n), m, n)"
   }
  },
  {
   "id": "dist.qwilcox/wilcox-cuantil-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qwilcox"
   },
   "titulo": "Cuantiles de la suma de rangos en 263 combinaciones (cola inferior)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 263,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qwilcox(p, m, n)"
   }
  },
  {
   "id": "dist.qwilcox/wilcox-cuantil-mediana-simetrica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qwilcox"
   },
   "titulo": "Cuantil 0.5 con m·n impar (7 pares): exacto por simetría, (mn − 1)/2",
   "fuente": "Rejilla sintética",
   "clase": "B",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "(m * n - 1) / 2; R: qwilcox(0.5, m, n) = 0, 4, 13, 12, 112, 1201, 612"
   }
  },
  {
   "id": "dist.qwilcox/wilcox-cuantil-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.qwilcox"
   },
   "titulo": "Cuantiles de la suma de rangos en 263 combinaciones (cola superior)",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 263,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "qwilcox(p, m, n, lower.tail = FALSE)"
   }
  },
  {
   "id": "dist.pwilcox/wilcox-inferior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pwilcox"
   },
   "titulo": "P(W ≤ q) de la suma de rangos en 201 combinaciones de q, m y n",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 201,
   "difMax": 7.438494264988549e-15,
   "difEscaladaMax": 1.4876988529977167e-14,
   "peor": "[181]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pwilcox(q, m, n)"
   }
  },
  {
   "id": "dist.pwilcox/wilcox-superior",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "dist.pwilcox"
   },
   "titulo": "P(W > q) de la suma de rangos en 201 combinaciones de q, m y n",
   "fuente": "Rejilla sintética",
   "clase": "A",
   "valores": 201,
   "difMax": 7.438494264988549e-15,
   "difEscaladaMax": 1.4876988529977028e-14,
   "peor": "[181]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "modo": "relativo"
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "pwilcox(q, m, n, lower.tail = FALSE)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-desbalance-student",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "3 contra 40 observaciones · Student",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.886579864025407e-15,
   "difEscaladaMax": 1.5286492883626577e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = TRUE, mu = 0, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-desbalance-welch",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "3 contra 40 observaciones · Welch",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 8.326672684688674e-16,
   "difEscaladaMax": 8.326672684688674e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = FALSE, mu = 0, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-insectos-student",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Insecticida C contra A: varianzas muy distintas · Student",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 7,
   "difMax": 7.610061635487855e-23,
   "difEscaladaMax": 5.937795836043712e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = TRUE, mu = 0, alternative = \"less\", conf.level = 0.9)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-insectos-welch",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Insecticida C contra A: varianzas muy distintas · Welch",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 7,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 5.014662731006866e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = FALSE, mu = 0, alternative = \"less\", conf.level = 0.9)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-ozono-meses-student",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Ozono de mayo contra agosto, con faltantes · Student",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.5987211554602254e-14,
   "difEscaladaMax": 1.2829383485669703e-15,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = TRUE, mu = 0, alternative = \"two.sided\", conf.level = 0.99)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-ozono-meses-welch",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Ozono de mayo contra agosto, con faltantes · Welch",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 8.131516293641283e-20,
   "difEscaladaMax": 8.131516293641283e-20,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = FALSE, mu = 0, alternative = \"two.sided\", conf.level = 0.99)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-plantas-student",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Testigo contra tratamiento 1 · Student",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 7,
   "difMax": 4.996003610813204e-16,
   "difEscaladaMax": 4.996003610813204e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = TRUE, mu = 0, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-plantas-trt2-student",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Tratamiento 2 contra testigo, diferencia > 0.2 · Student",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.5265566588595902e-16,
   "difEscaladaMax": 1.5265566588595902e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = TRUE, mu = 0.2, alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-plantas-trt2-welch",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Tratamiento 2 contra testigo, diferencia > 0.2 · Welch",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 7,
   "difMax": 4.163336342344337e-17,
   "difEscaladaMax": 4.163336342344337e-17,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = FALSE, mu = 0.2, alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.dosMuestras/dos-plantas-welch",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.dosMuestras"
   },
   "titulo": "Testigo contra tratamiento 1 · Welch",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, var.equal = FALSE, mu = 0, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-dos-desbalance",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "3 contra 40, IC 90 %",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 8.881784197001252e-16,
   "peor": "ic_d[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-dos-grande",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "300 contra 250, efecto enorme (d ≈ −1.75)",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 1.9406698470447736e-13,
   "difEscaladaMax": 1.0767708345510728e-13,
   "peor": "ic_g[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-dos-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "Testigo contra tratamiento 2 (d ≈ −1.3)",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 1.5987211554602254e-14,
   "difEscaladaMax": 8.916914411727164e-15,
   "peor": "ic_g[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-nulo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "Efecto casi nulo con 5 por grupo",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 5.953033783737215e-16,
   "peor": "ic_g[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-pareada",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "Pareada: d_z de las diferencias",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 4.440892098500626e-15,
   "difEscaladaMax": 2.096722130915694e-15,
   "peor": "ic_d[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "pruebaT.efecto/efecto-una",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.efecto"
   },
   "titulo": "Una muestra con faltantes contra 30",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 3.7969627442180354e-14,
   "difEscaladaMax": 3.7969627442180354e-14,
   "peor": "ic_g[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "d de Cohen; IC: uniroot(function(n) pt(t, gl, n) - c(1 - a/2, a/2), tol = 1e-13); g = d * J(gl)"
   }
  },
  {
   "id": "prueba-t/metodo-dos-plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "prueba-t"
   },
   "titulo": "Peso: testigo contra tratamiento 1 (Welch)",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 20,
   "difMax": 5.773159728050814e-15,
   "difEscaladaMax": 4.248217928612404e-15,
   "peor": "efecto.ic_g[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(...); var.test(x, y); shapiro.test(...); IC del efecto por la t no central"
   }
  },
  {
   "id": "prueba-t/metodo-niveles-elegidos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "prueba-t"
   },
   "titulo": "Peso: tratamiento 2 contra testigo, Student, cola superior",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 20,
   "difMax": 1.554312234475219e-14,
   "difEscaladaMax": 8.669222344734742e-15,
   "peor": "efecto.ic_g[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(...); var.test(x, y); shapiro.test(...); IC del efecto por la t no central"
   }
  },
  {
   "id": "prueba-t/metodo-pareada",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "prueba-t"
   },
   "titulo": "Sueño extra con dos fármacos (pareada)",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 13,
   "difMax": 4.440892098500626e-15,
   "difEscaladaMax": 2.096722130915694e-15,
   "peor": "efecto.ic_d[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(...); var.test(x, y); shapiro.test(...); IC del efecto por la t no central"
   }
  },
  {
   "id": "prueba-t/metodo-una",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "prueba-t"
   },
   "titulo": "Ozono contra 40, IC 90 %",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 13,
   "difMax": 3.552713678800501e-14,
   "difEscaladaMax": 2.47893103973102e-14,
   "peor": "normalidad[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(...); var.test(x, y); shapiro.test(...); IC del efecto por la t no central"
   }
  },
  {
   "id": "pruebaT.pareada/pareada-faltante",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.pareada"
   },
   "titulo": "Pares con faltantes (se quitan los pares incompletos)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 6,
   "difMax": 3.0531133177191805e-16,
   "difEscaladaMax": 3.0531133177191805e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, paired = TRUE, mu = 0.1, alternative = \"greater\")"
   }
  },
  {
   "id": "pruebaT.pareada/pareada-sueno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.pareada"
   },
   "titulo": "Sueño extra con dos fármacos en los mismos 10 pacientes",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 6,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 6.661338147750939e-16,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, y, paired = TRUE, mu = 0, alternative = \"two.sided\")"
   }
  },
  {
   "id": "pruebaT.unaMuestra/una-dos-datos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.unaMuestra"
   },
   "titulo": "Solo dos observaciones (1 gl)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 6,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 8.59059676516831e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, mu = 1, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.unaMuestra/una-grande",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.unaMuestra"
   },
   "titulo": "2000 valores",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 6,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 1.425770712205479e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, mu = 100, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.unaMuestra/una-ozono-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.unaMuestra"
   },
   "titulo": "Ozono (37 faltantes) contra 40, cola superior, 90 %",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 6,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 1.8609640710912266e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, mu = 40, alternative = \"greater\", conf.level = 0.9)"
   }
  },
  {
   "id": "pruebaT.unaMuestra/una-plantas-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.unaMuestra"
   },
   "titulo": "Peso del testigo contra 5.3, cola inferior, 99 %",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 6,
   "difMax": 8.743006318923108e-16,
   "difEscaladaMax": 8.743006318923108e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, mu = 5.3, alternative = \"less\", conf.level = 0.99)"
   }
  },
  {
   "id": "pruebaT.unaMuestra/una-sueno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.unaMuestra"
   },
   "titulo": "Horas extra de sueño, grupo 1, contra 0",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 6,
   "difMax": 1.304512053934559e-15,
   "difEscaladaMax": 1.304512053934559e-15,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "t.test(x, mu = 0, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.razonVarianzas/varianzas-desbalance-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.razonVarianzas"
   },
   "titulo": "3 contra 40, razón 0.5, cola inferior",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.129230373768223e-14,
   "difEscaladaMax": 3.686891526592211e-14,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "var.test(x, y, ratio = 0.5, alternative = \"less\", conf.level = 0.95)"
   }
  },
  {
   "id": "pruebaT.razonVarianzas/varianzas-insectos-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.razonVarianzas"
   },
   "titulo": "Insecticida A contra C, cola superior",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.220446049250313e-15,
   "difEscaladaMax": 8.661772323948264e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "var.test(x, y, ratio = 1, alternative = \"greater\", conf.level = 0.9)"
   }
  },
  {
   "id": "pruebaT.razonVarianzas/varianzas-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "pruebaT.razonVarianzas"
   },
   "titulo": "Testigo contra tratamiento 1",
   "fuente": "Conjuntos de R y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 8.174665591479371e-16,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "var.test(x, y, ratio = 1, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "np.ajustarP/ajuste-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.ajustarP"
   },
   "titulo": "p.adjust con BH (empates y un faltante)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 10,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "p.adjust(p, \"BH\")"
   }
  },
  {
   "id": "np.ajustarP/ajuste-bonferroni",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.ajustarP"
   },
   "titulo": "p.adjust con bonferroni (empates y un faltante)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 10,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "p.adjust(p, \"bonferroni\")"
   }
  },
  {
   "id": "np.ajustarP/ajuste-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.ajustarP"
   },
   "titulo": "p.adjust con holm (empates y un faltante)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 10,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "p.adjust(p, \"holm\")"
   }
  },
  {
   "id": "np.friedman/friedman-campo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.friedman"
   },
   "titulo": "5 variedades en 6 bloques, un faltante (el bloque sale)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 15,
   "difMax": 6.938893903907228e-18,
   "difEscaladaMax": 6.938893903907228e-18,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "friedman.test(y, trat, bloque); W = Q / (n * (k - 1))"
   }
  },
  {
   "id": "np.friedman/friedman-catas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.friedman"
   },
   "titulo": "Calificaciones de 8 jueces a 4 muestras (muchos empates)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 13,
   "difMax": 5.421010862427522e-20,
   "difEscaladaMax": 5.421010862427522e-20,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "friedman.test(y, trat, bloque); W = Q / (n * (k - 1))"
   }
  },
  {
   "id": "np.friedman/friedman-redondeo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.friedman"
   },
   "titulo": "Tiempo para rodear la base con tres métodos, 22 jugadores (empates)",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "A",
   "valores": 11,
   "difMax": 8.673617379884035e-19,
   "difEscaladaMax": 8.673617379884035e-19,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "friedman.test(y, trat, bloque); W = Q / (n * (k - 1))"
   }
  },
  {
   "id": "np.kruskal/kruskal-insectos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.kruskal"
   },
   "titulo": "Conteos por insecticida, 6 grupos con empates",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 28,
   "difMax": 1.2924697071141057e-25,
   "difEscaladaMax": 8.554618022829326e-16,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "kruskal.test(y, g); eta2 = (H - k + 1) / (n - k); tapply(rank(y), g, mean)"
   }
  },
  {
   "id": "np.kruskal/kruskal-ozono",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.kruskal"
   },
   "titulo": "Ozono por mes, con faltantes",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 24,
   "difMax": 8.470329472543003e-22,
   "difEscaladaMax": 8.470329472543003e-22,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "kruskal.test(y, g); eta2 = (H - k + 1) / (n - k); tapply(rank(y), g, mean)"
   }
  },
  {
   "id": "np.kruskal/kruskal-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.kruskal"
   },
   "titulo": "Peso seco de plantas, 3 tratamientos",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 16,
   "difMax": 3.469446951953614e-18,
   "difEscaladaMax": 3.469446951953614e-18,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "kruskal.test(y, g); eta2 = (H - k + 1) / (n - k); tapply(rank(y), g, mean)"
   }
  },
  {
   "id": "np.kruskal/kruskal-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.kruskal"
   },
   "titulo": "Peso de pollos por alimento, 6 grupos desbalanceados",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 28,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.346053624587549e-14,
   "peor": "p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "kruskal.test(y, g); eta2 = (H - k + 1) / (n - k); tapply(rank(y), g, mean)"
   }
  },
  {
   "id": "np.letras/letras-azar-10",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: azar-10 (10 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 10,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-azar-13",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: azar-13 (13 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 13,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-azar-6",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: azar-6 (6 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 6,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-azar-8",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: azar-8 (8 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 8,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-escalera",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: escalera (5 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 5,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-extremos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: extremos (3 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 3,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-ninguno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: ninguno (4 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 4,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-sesenta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: sesenta (60 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 60,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "np.letras/letras-todos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.letras"
   },
   "titulo": "Letras: todos (4 tratamientos)",
   "fuente": "Patrones sintéticos",
   "clase": "A",
   "valores": 4,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "multcompView": "0.1.10"
    },
    "codigo": "multcompView::multcompLetters(m) con m[lower.tri(m)] <- sig"
   }
  },
  {
   "id": "friedman/metodo-friedman-campo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "friedman"
   },
   "titulo": "Variedades: Wilcoxon pareada con Bonferroni",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 39,
   "difMax": 6.938893903907228e-18,
   "difEscaladaMax": 6.938893903907228e-18,
   "peor": "prueba.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "friedman.test; PMCMRplus::frdAllPairs*Test o pairwise.wilcox.test(paired = TRUE); multcompLetters"
   }
  },
  {
   "id": "friedman/metodo-friedman-catas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "friedman"
   },
   "titulo": "Catas: Nemenyi",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 20,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "comparaciones.pares[2].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones.pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "friedman.test; PMCMRplus::frdAllPairs*Test o pairwise.wilcox.test(paired = TRUE); multcompLetters"
   }
  },
  {
   "id": "friedman/metodo-friedman-redondeo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "friedman"
   },
   "titulo": "Métodos para rodear la base: Conover con Holm",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "A",
   "valores": 16,
   "difMax": 2.7755575615628914e-16,
   "difEscaladaMax": 2.7755575615628914e-16,
   "peor": "comparaciones.pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "friedman.test; PMCMRplus::frdAllPairs*Test o pairwise.wilcox.test(paired = TRUE); multcompLetters"
   }
  },
  {
   "id": "kruskal-wallis/metodo-kruskal-insectos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kruskal-wallis"
   },
   "titulo": "Insecticidas: Conover-Iman con Tukey y letras",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "B",
   "valores": 55,
   "difMax": 1.432187701766452e-14,
   "difEscaladaMax": 1.432187701766452e-8,
   "peor": "comparaciones.pares[3].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones.pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "kruskal.test; PMCMRplus::kwAllPairs*Test; multcompView::multcompLetters con los niveles por rango medio decreciente"
   }
  },
  {
   "id": "kruskal-wallis/metodo-kruskal-plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kruskal-wallis"
   },
   "titulo": "Plantas: Dunn con Holm y letras",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 16,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "comparaciones.pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "kruskal.test; PMCMRplus::kwAllPairs*Test; multcompView::multcompLetters con los niveles por rango medio decreciente"
   }
  },
  {
   "id": "kruskal-wallis/metodo-kruskal-pollos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kruskal-wallis"
   },
   "titulo": "Pollos: Nemenyi y letras con α = 0.01",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 40,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.346053624587549e-14,
   "peor": "prueba.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones.pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12",
     "multcompView": "0.1.10"
    },
    "codigo": "kruskal.test; PMCMRplus::kwAllPairs*Test; multcompView::multcompLetters con los niveles por rango medio decreciente"
   }
  },
  {
   "id": "wilcoxon/metodo-wilcoxon-dos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "wilcoxon"
   },
   "titulo": "Plantas: tratamiento 2 contra testigo",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 5,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "wilcoxon/metodo-wilcoxon-pareada",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "wilcoxon"
   },
   "titulo": "Sueño con dos fármacos",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 5,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 7.723509243908497e-16,
   "peor": "prueba.ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"less\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "wilcoxon/metodo-wilcoxon-una",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "wilcoxon"
   },
   "titulo": "Ozono contra 40, IC 90 %",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 5,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 4.440887825091331e-16,
   "peor": "prueba.ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 40, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.9)"
   }
  },
  {
   "id": "np.signoRango/pareada-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Pareada exacta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 6.661338147750939e-16,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, paired = TRUE, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/pareada-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Pareada con pares incompletos",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, paired = TRUE, mu = 0, alternative = \"greater\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/pareada-sueno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Sueño con dos fármacos (pareada; empates y un cero)",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 6.021710276685323e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, paired = TRUE, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-ceros",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Tres valores iguales a μ (se quitan; normal)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.220446049250313e-15,
   "difEscaladaMax": 2.1146962127838808e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 3, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-empates-ozono",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Ozono contra 30: empates, normal con corrección e IC por raíz",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 30, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-exacta-forzada-empates",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Exacta pedida con empates: R pasa a la normal",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 1.4802717993460796e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 5, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95, exact = TRUE)"
   }
  },
  {
   "id": "np.signoRango/signo-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Sueño extra con el fármaco 2: exacta, sin empates ni ceros",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 7,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.5543122344752192e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-mayor-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Exacta, cola superior, IC 90 %",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 1, alternative = \"greater\", conf.int = TRUE, conf.level = 0.9)"
   }
  },
  {
   "id": "np.signoRango/signo-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Con empates, cola inferior",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 1.4071784621115377e-15,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 1.2, alternative = \"less\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-n-80",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "80 valores distintos: normal por tamaño (n ≥ 50)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-nivel-inalcanzable",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Tres datos: el IC 95 % no se alcanza (queda en 75 %)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.signoRango/signo-normal-pedida",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Normal pedida aunque podría ser exacta",
   "fuente": "Cushny y Peebles (1905); conjunto sleep de R",
   "clase": "A",
   "valores": 7,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.5543122344752192e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95, exact = FALSE)"
   }
  },
  {
   "id": "np.signoRango/signo-sin-correccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.signoRango"
   },
   "titulo": "Viento contra 10, sin corrección por continuidad",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.716276523907967e-16,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, mu = 10, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95, correct = FALSE)"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-campo-conover-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "5 variedades en 6 bloques, un faltante (el bloque sale): conover con ajuste holm",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 30,
   "difMax": 7.771561172376096e-16,
   "difEscaladaMax": 7.771561172376096e-16,
   "peor": "pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsConoverTest(y, trat, bloque, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-campo-wilcoxon-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "5 variedades en 6 bloques, un faltante (el bloque sale): wilcoxon con ajuste BH",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 30,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "pairwise.wilcox.test(y, trat, paired = TRUE, p.adjust.method = \"BH\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-catas-conover-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Calificaciones de 8 jueces a 4 muestras (muchos empates): conover con ajuste BH",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 18,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 6.441245065951524e-15,
   "peor": "pares[4].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsConoverTest(y, trat, bloque, p.adjust.method = \"BH\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-catas-nemenyi-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Calificaciones de 8 jueces a 4 muestras (muchos empates): nemenyi con ajuste tukey",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 12,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "pares[2].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsNemenyiTest(y, trat, bloque)"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-catas-wilcoxon-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Calificaciones de 8 jueces a 4 muestras (muchos empates): wilcoxon con ajuste holm",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 18,
   "difMax": 1.734723475976807e-18,
   "difEscaladaMax": 1.734723475976807e-18,
   "peor": "pares[2].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "pairwise.wilcox.test(y, trat, paired = TRUE, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-redondeo-conover-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Tiempo para rodear la base con tres métodos, 22 jugadores (empates): conover con ajuste holm",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "A",
   "valores": 9,
   "difMax": 2.7755575615628914e-16,
   "difEscaladaMax": 2.7755575615628914e-16,
   "peor": "pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsConoverTest(y, trat, bloque, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-redondeo-conover-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Tiempo para rodear la base con tres métodos, 22 jugadores (empates): conover con ajuste tukey",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "B",
   "valores": 9,
   "difMax": 2.7755575615628914e-16,
   "difEscaladaMax": 2.7755575615628914e-16,
   "peor": "pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsConoverTest(y, trat, bloque, p.adjust.method = \"single-step\")"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-redondeo-nemenyi-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Tiempo para rodear la base con tres métodos, 22 jugadores (empates): nemenyi con ajuste tukey",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "B",
   "valores": 6,
   "difMax": 1.1102230246251565e-15,
   "difEscaladaMax": 8.679012619367775e-16,
   "peor": "pares[0].estadistico",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::frdAllPairsNemenyiTest(y, trat, bloque)"
   }
  },
  {
   "id": "np.paresFriedman/pares-friedman-redondeo-wilcoxon-bonferroni",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresFriedman"
   },
   "titulo": "Tiempo para rodear la base con tres métodos, 22 jugadores (empates): wilcoxon con ajuste bonferroni",
   "fuente": "Hollander y Wolfe (1973), p. 140; ejemplo de friedman.test",
   "clase": "A",
   "valores": 9,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "pairwise.wilcox.test(y, trat, paired = TRUE, p.adjust.method = \"bonferroni\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-insectos-conover-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Conteos por insecticida, 6 grupos con empates: conover con ajuste holm",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 45,
   "difMax": 4.3298697960381105e-15,
   "difEscaladaMax": 1.3022951323470207e-14,
   "peor": "pares[7].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsConoverTest(y, g, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-insectos-dunn-bonferroni",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Conteos por insecticida, 6 grupos con empates: dunn con ajuste bonferroni",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "A",
   "valores": 45,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsDunnTest(y, g, p.adjust.method = \"bonferroni\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-insectos-nemenyi-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Conteos por insecticida, 6 grupos con empates: nemenyi con ajuste tukey",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "B",
   "valores": 30,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "pares[14].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsNemenyiTest(y, g)"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-ozono-conover-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Ozono por mes, con faltantes: conover con ajuste BH",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 30,
   "difMax": 4.7878367936959876e-15,
   "difEscaladaMax": 4.7878367936959876e-15,
   "peor": "pares[4].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsConoverTest(y, g, p.adjust.method = \"BH\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-ozono-dunn-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Ozono por mes, con faltantes: dunn con ajuste BH",
   "fuente": "Chambers y col. (1983); conjunto airquality de R",
   "clase": "A",
   "valores": 30,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsDunnTest(y, g, p.adjust.method = \"BH\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-plantas-conover-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso seco de plantas, 3 tratamientos: conover con ajuste tukey",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 9,
   "difMax": 3.6637359812630166e-15,
   "difEscaladaMax": 3.6637359812630166e-15,
   "peor": "pares[2].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsConoverTest(y, g, p.adjust.method = \"single-step\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-plantas-dunn-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso seco de plantas, 3 tratamientos: dunn con ajuste holm",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 9,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsDunnTest(y, g, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-plantas-nemenyi-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso seco de plantas, 3 tratamientos: nemenyi con ajuste tukey",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 6,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsNemenyiTest(y, g)"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-pollos-conover-bonferroni",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso de pollos por alimento, 6 grupos desbalanceados: conover con ajuste bonferroni",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 45,
   "difMax": 4.207745263329343e-14,
   "difEscaladaMax": 4.207745263329343e-14,
   "peor": "pares[9].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsConoverTest(y, g, p.adjust.method = \"bonferroni\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-pollos-dunn-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso de pollos por alimento, 6 grupos desbalanceados: dunn con ajuste holm",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 45,
   "difMax": 1.3877787807814457e-17,
   "difEscaladaMax": 3.4624790270504594e-16,
   "peor": "pares[8].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsDunnTest(y, g, p.adjust.method = \"holm\")"
   }
  },
  {
   "id": "np.paresKruskal/pares-kruskal-pollos-nemenyi-tukey",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.paresKruskal"
   },
   "titulo": "Peso de pollos por alimento, 6 grupos desbalanceados: nemenyi con ajuste tukey",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 30,
   "difMax": 3.3306690738754696e-16,
   "difEscaladaMax": 3.3306690738754696e-16,
   "peor": "pares[1].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): la integral numérica del rango estudentizado (AS 190) deja debajo de 1e-6 solo cifras absolutas, en R y en SigmaPro (difieren ~1e-14)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "PMCMRplus": "1.9.12"
    },
    "codigo": "PMCMRplus::kwAllPairsNemenyiTest(y, g)"
   }
  },
  {
   "id": "np.sumaRangos/suma-desbalance-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "3 contra 12, exacta, cola inferior",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"less\", conf.int = TRUE, conf.level = 0.9)"
   }
  },
  {
   "id": "np.sumaRangos/suma-empates-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Testigo contra tratamiento 1 (un empate: normal)",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.7586727615611923e-15,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-exacta",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Exacta, 9 contra 10",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-grandes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "60 contra 70 sin empates (normal por tamaño)",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 2.6645352591003757e-15,
   "peor": "ic[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-insectos-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Insecticida A contra C, cola superior, con empates",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 3.5527008053183906e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"greater\", conf.int = TRUE, conf.level = 0.9)"
   }
  },
  {
   "id": "np.sumaRangos/suma-menor-normal",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Tratamiento 1 contra 2, cola inferior (normal)",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"less\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-mu",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Exacta con desplazamiento μ = 0.5",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 6.661338147750939e-16,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0.5, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-nivel-inalcanzable",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "2 contra 3: el IC 95 % no se alcanza",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95)"
   }
  },
  {
   "id": "np.sumaRangos/suma-sin-correccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "np.sumaRangos"
   },
   "titulo": "Insecticidas B contra F, sin corrección",
   "fuente": "Conjuntos de R (PlantGrowth, InsectSprays) y datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 1.1842366250716381e-15,
   "peor": "ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "wilcox.test(x, y, mu = 0, alternative = \"two.sided\", conf.int = TRUE, conf.level = 0.95, correct = FALSE)"
   }
  }
 ]
};

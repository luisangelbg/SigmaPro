/* Generado por tests/correr.mjs — no editar a mano. */
window.SP_VALIDACION = {
 "version": "0.3.3",
 "generado": "2026-10-04T18:38:17.588Z",
 "motor": "node v24.19.0",
 "criterio": {
  "tol": 0.000001,
  "regla": "|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)"
 },
 "referencias": [
  "R version 4.4.2 (2024-10-31 ucrt)"
 ],
 "resumen": {
  "casos": 795,
  "aprobados": 795,
  "fallidos": 0,
  "valores": 83645,
  "difEscaladaMax": 0.000024564204685412263,
  "objetivos": 169
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
  },
  {
   "id": "bib/bib-siete",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "bib"
   },
   "titulo": "Bloques incompletos balanceados (t = 7, k = 3, λ = 1): medias ajustadas = BIB.test",
   "fuente": "Datos sintéticos; referencia también con agricolae::BIB.test",
   "clase": "A",
   "valores": 40,
   "difMax": 1.7763568394002505e-13,
   "difEscaladaMax": 3.685392312426733e-15,
   "peor": "anova.F[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "anova(lm(y ~ bloque + trat)); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dbca/dbca-factorial-maiz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dbca"
   },
   "titulo": "Factorial híbrido × dosis de N en bloques",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 88,
   "difMax": 7.815970093361102e-14,
   "difEscaladaMax": 1.7338331901756685e-14,
   "peor": "anova.p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(rend ~ bloque + hibrido * dosis), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dbca/dbca-generalizado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dbca"
   },
   "titulo": "Bloques generalizados: dos parcelas por tratamiento en cada bloque",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 31,
   "difMax": 1.7763568394002505e-14,
   "difEscaladaMax": 1.0903168729581242e-15,
   "peor": "resumen.cv",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(y ~ bloque * trat), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dbca/dbca-npk-tipo2",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dbca"
   },
   "titulo": "Factorial 2³ en bloques con N:P:K confundida (tipo II)",
   "fuente": "Yates (1935), factorial 2³ en bloques con N:P:K confundida; conjunto npk de R",
   "clase": "B",
   "valores": 129,
   "difMax": 6.821210263296962e-13,
   "difEscaladaMax": 8.021361352916756e-14,
   "peor": "anova.sc[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(yield ~ block + N * P * K), type = 2); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dbca/dbca-parcelas-perdidas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dbca"
   },
   "titulo": "Bloques con dos parcelas perdidas (tipo III, medias ajustadas)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 30,
   "difMax": 7.389644451905042e-13,
   "difEscaladaMax": 5.389147145918701e-15,
   "peor": "anova.sc[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(rend ~ bloque + variedad), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dbca/dbca-variedades",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dbca"
   },
   "titulo": "Bloques completos al azar: 5 variedades en 4 bloques, con eficiencia relativa",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 32,
   "difMax": 7.958078640513122e-13,
   "difEscaladaMax": 4.171447328273165e-15,
   "peor": "anova.sc[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(rend ~ bloque + variedad), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-celda-vacia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 3 × 3 con una celda vacía: el tipo III no existe y se usa el II",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 73,
   "difMax": 2.6645352591003757e-14,
   "difEscaladaMax": 2.527846219608008e-15,
   "peor": "simples[4].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(y ~ A * B), type = 2); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-factorial-desbalanceado-tipo1",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 2 × 3 desbalanceado, sumas de cuadrados tipo 1",
   "fuente": "Tippett (1950); conjunto warpbreaks de R sin cinco filas",
   "clase": "B",
   "valores": 65,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 5.4239850690280115e-15,
   "peor": "simples[4].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "anova(lm(roturas ~ lana * tension)); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-factorial-desbalanceado-tipo2",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 2 × 3 desbalanceado, sumas de cuadrados tipo 2",
   "fuente": "Tippett (1950); conjunto warpbreaks de R sin cinco filas",
   "clase": "B",
   "valores": 65,
   "difMax": 3.865352482534945e-12,
   "difEscaladaMax": 5.4239850690280115e-15,
   "peor": "simples[4].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(roturas ~ lana * tension), type = 2); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-factorial-desbalanceado-tipo3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 2 × 3 desbalanceado, sumas de cuadrados tipo 3",
   "fuente": "Tippett (1950); conjunto warpbreaks de R sin cinco filas",
   "clase": "B",
   "valores": 65,
   "difMax": 7.275957614183426e-12,
   "difEscaladaMax": 5.4239850690280115e-15,
   "peor": "simples[4].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(roturas ~ lana * tension), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-factorial-dientes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 2 × 3 completamente al azar, con efectos simples",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "B",
   "valores": 65,
   "difMax": 1.3642420526593924e-12,
   "difEscaladaMax": 3.028274291685521e-14,
   "peor": "simples[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(len ~ supp * dosis), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Completamente al azar, un factor balanceado",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 21,
   "difMax": 1.0658141036401503e-14,
   "difEscaladaMax": 1.0158263069037251e-15,
   "peor": "anova.sc[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(peso ~ grupo), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-pollos-desbalanceado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Completamente al azar desbalanceado (6 alimentos)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 27,
   "difMax": 1.4551915228366852e-10,
   "difEscaladaMax": 2.7867995625995013e-15,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(peso ~ alimento), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "dca/dca-tres-factores",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dca"
   },
   "titulo": "Factorial 2 × 2 × 3 completamente al azar",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 185,
   "difMax": 3.694822225952521e-13,
   "difEscaladaMax": 4.3185519691507085e-14,
   "peor": "simples[9].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(y ~ A * B * C), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "parcelas-divididas/divididas-avena",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "parcelas-divididas"
   },
   "titulo": "Parcelas divididas en bloques: avena de Yates (= agricolae::sp.plot)",
   "fuente": "Yates (1935), avena en parcelas divididas; conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 27,
   "difMax": 4.547473508864641e-11,
   "difEscaladaMax": 7.559580018428565e-15,
   "peor": "estratos[2].filas[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7"
    },
    "codigo": "summary(aov(Y ~ B + V * N + Error(B/V))); CV = 100 * sqrt(CM error) / media"
   }
  },
  {
   "id": "parcelas-divididas/divididas-dca",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "parcelas-divididas"
   },
   "titulo": "Parcelas divididas con las parcelas grandes completamente al azar",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 22,
   "difMax": 1.4210854715202004e-13,
   "difEscaladaMax": 7.003786766124034e-15,
   "peor": "estratos[1].filas[1].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7"
    },
    "codigo": "summary(aov(y ~ A * B + Error(A:rep))); CV = 100 * sqrt(CM error) / media"
   }
  },
  {
   "id": "parcelas-divididas/divididas-latino",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "parcelas-divididas"
   },
   "titulo": "Parcelas divididas con las parcelas grandes en cuadro latino",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 32,
   "difMax": 9.237055564881302e-14,
   "difEscaladaMax": 6.4413247584016395e-15,
   "peor": "estratos[1].filas[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7"
    },
    "codigo": "summary(aov(y ~ fila + columna + A * B + Error(fila:columna))); CV = 100 * sqrt(CM error) / media"
   }
  },
  {
   "id": "medias.emmDe/emm-aditivo-celda-vacia",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Modelo aditivo con una celda vacía: todas estimables",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 1.2604234905867434e-16,
   "peor": "emm[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(y ~ A + B), \"A\")"
   }
  },
  {
   "id": "medias.emmDe/emm-celda-vacia-a",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Medias de A con una celda vacía (a3:b3): la de a3 no es estimable",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 2.1367564226947677e-16,
   "peor": "emm[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(y ~ A * B), \"A\")"
   }
  },
  {
   "id": "medias.emmDe/emm-celda-vacia-celdas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Medias de celdas con una vacía",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 45,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 5.551115123125783e-16,
   "peor": "ee[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(y ~ A * B), c(\"A\", \"B\"))"
   }
  },
  {
   "id": "medias.emmDe/emm-dientes-celdas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Medias de suplemento dentro de cada dosis",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "A",
   "valores": 30,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 3.561617723108275e-15,
   "peor": "emm[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(len ~ supp * dosis), \"supp\", by = \"dosis\")"
   }
  },
  {
   "id": "medias.emmDe/emm-dientes-dosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Medias de dosis promediadas sobre el suplemento",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "A",
   "valores": 12,
   "difMax": 1.7763568394002505e-14,
   "difEscaladaMax": 1.6750182361152768e-15,
   "peor": "emm[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(len ~ supp * dosis), \"dosis\")"
   }
  },
  {
   "id": "medias.emmDe/emm-npk-confundido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Factorial 2³ con la interacción triple confundida con los bloques",
   "fuente": "Yates (1935), factorial 2³ en bloques con N:P:K confundida; conjunto npk de R",
   "clase": "A",
   "valores": 48,
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
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(yield ~ block + N * P * K), c(\"N\", \"P\", \"K\"))"
   }
  },
  {
   "id": "medias.emmDe/emm-npk-n",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Medias de N en el factorial confundido",
   "fuente": "Yates (1935), factorial 2³ en bloques con N:P:K confundida; conjunto npk de R",
   "clase": "A",
   "valores": 8,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 3.131982811741982e-15,
   "peor": "ee[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(yield ~ block + N * P * K), \"N\")"
   }
  },
  {
   "id": "medias.emmDe/emm-roturas-bloques",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.emmDe"
   },
   "titulo": "Covariable numérica en su media y un factor",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "A",
   "valores": 12,
   "difMax": 7.105427357601002e-14,
   "difEscaladaMax": 6.4808107578212636e-15,
   "peor": "ee[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans(lm(roturas ~ x + lana * tension), \"tension\")"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-avena-desbalanceada",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Avena sin tres subparcelas (desbalance: estratos no ortogonales)",
   "fuente": "Yates (1935), avena en parcelas divididas; conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 45,
   "difMax": 5.638867150992155e-11,
   "difEscaladaMax": 2.1875815670556256e-14,
   "peor": "[2].p[0]",
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
    "codigo": "summary(aov(Y ~ B + V * N + Error(B/V)))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-avena-sin-bloque",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Avena: los bloques solo en el error",
   "fuente": "Yates (1935), avena en parcelas divididas; conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 39,
   "difMax": 3.456079866737127e-11,
   "difEscaladaMax": 7.559580018428565e-15,
   "peor": "[2].p[0]",
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
    "codigo": "summary(aov(Y ~ V * N + Error(B/V)))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-avena",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Avena: variedad en parcela grande, nitrógeno en subparcela, con bloques en el modelo",
   "fuente": "Yates (1935), avena en parcelas divididas; conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 39,
   "difMax": 4.547473508864641e-11,
   "difEscaladaMax": 7.559580018428565e-15,
   "peor": "[2].p[0]",
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
    "codigo": "summary(aov(Y ~ B + V * N + Error(B/V)))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-divididas-dca",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Parcelas divididas en completamente al azar (error a = repetición dentro de A)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 32,
   "difMax": 1.4210854715202004e-13,
   "difEscaladaMax": 7.003786766124034e-15,
   "peor": "[1].F[1]",
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
    "codigo": "summary(aov(y ~ A * B + Error(A:rep)))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-divididas-latino",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Parcelas divididas en cuadro latino",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 44,
   "difMax": 9.237055564881302e-14,
   "difEscaladaMax": 6.4413247584016395e-15,
   "peor": "[1].p[0]",
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
    "codigo": "summary(aov(y ~ fila + columna + A * B + Error(fila:columna)))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-franjas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Parcelas en franjas (error a, error b y error c)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 46,
   "difMax": 1.1084466677857563e-12,
   "difEscaladaMax": 1.1520949500826219e-14,
   "peor": "[3].sc[0]",
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
    "codigo": "summary(aov(y ~ bloque + A * B + Error(bloque/(A + B))))"
   }
  },
  {
   "id": "estratos.anovaTabla/estratos-subdivididas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "estratos.anovaTabla"
   },
   "titulo": "Parcelas subdivididas en bloques (tres estratos de error)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 70,
   "difMax": 1.3145040611561853e-13,
   "difEscaladaMax": 3.0403360476682666e-14,
   "peor": "[3].F[0]",
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
    "codigo": "summary(aov(y ~ bloque + A * B * C + Error(bloque/A/B)))"
   }
  },
  {
   "id": "franjas/franjas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "franjas"
   },
   "titulo": "Parcelas en franjas (= agricolae::strip.plot)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 30,
   "difMax": 1.1084466677857563e-12,
   "difEscaladaMax": 1.1520949500826219e-14,
   "peor": "estratos[3].filas[0].sc",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7"
    },
    "codigo": "summary(aov(y ~ bloque + A * B + Error(bloque/(A + B)))); CV = 100 * sqrt(CM error) / media"
   }
  },
  {
   "id": "latice/latice-alfa",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "latice"
   },
   "titulo": "Alfa-látice: 12 tratamientos, bloques de 3, tres repeticiones",
   "fuente": "Datos sintéticos con agricolae::design.alpha",
   "clase": "A",
   "valores": 49,
   "difMax": 1.7763568394002505e-14,
   "difEscaladaMax": 3.750662566955657e-15,
   "peor": "anova.p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "anova(lm(terms(y ~ rep + rep:bloque + trat, keep.order = TRUE))); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "latice/latice-simple",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "latice"
   },
   "titulo": "Látice simple 3 × 3 con dos repeticiones (intrabloque)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 43,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 1.836338930007613e-15,
   "peor": "anova.F[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "anova(lm(terms(y ~ rep + rep:bloque + trat, keep.order = TRUE))); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "cuadro-latino/latino-cinco",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cuadro-latino"
   },
   "titulo": "Cuadro latino 5 × 5 (error con 12 gl: eficiencia ajustada)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 41,
   "difMax": 4.547473508864641e-13,
   "difEscaladaMax": 1.3255915368356495e-14,
   "peor": "anova.F[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(y ~ fila + columna + trat), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "cuadro-latino/latino-huertos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cuadro-latino"
   },
   "titulo": "Cuadro latino 8 × 8 con eficiencia relativa (error con 42 gl: sin ajuste)",
   "fuente": "Finney (1955); conjunto OrchardSprays de R",
   "clase": "A",
   "valores": 47,
   "difMax": 5.093170329928398e-11,
   "difEscaladaMax": 3.2646558129518272e-15,
   "peor": "medias[0].filas[0].emm",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "car::Anova(lm(decremento ~ fila + columna + tratamiento), type = 3); CV = 100 * sigma / media; emmeans; joint_tests (F exacta = qf(p))"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-celda-vacia",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "B dentro de cada A con una celda vacía (se pierde un grado de libertad)",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 18,
   "difMax": 4.440892098500626e-15,
   "difEscaladaMax": 2.110171150352292e-15,
   "peor": "F[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(y ~ A * B), by = \"A\")"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-con-bloques",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "Factorial en bloques: efectos simples con el error del modelo",
   "fuente": "Yates (1935), factorial 2³ en bloques con N:P:K confundida; conjunto npk de R",
   "clase": "B",
   "valores": 24,
   "difMax": 2.275957200481571e-15,
   "difEscaladaMax": 2.275957200481571e-15,
   "peor": "p[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(yield ~ block + N * P), by = \"N\")"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-dientes-por-dosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "Efecto del suplemento dentro de cada dosis",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "B",
   "valores": 18,
   "difMax": 3.197442310920451e-14,
   "difEscaladaMax": 3.885780586188048e-15,
   "peor": "p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(len ~ supp * dosis), by = \"dosis\")"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-dientes-por-suplemento",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "Efecto de la dosis dentro de cada suplemento",
   "fuente": "Crampton (1947); conjunto ToothGrowth de R",
   "clase": "B",
   "valores": 12,
   "difMax": 6.394884621840902e-14,
   "difEscaladaMax": 3.028274291685521e-14,
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
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(len ~ supp * dosis), by = \"supp\")"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-roturas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "Lana dentro de cada tensión",
   "fuente": "Tippett (1950); conjunto warpbreaks de R",
   "clase": "B",
   "valores": 18,
   "difMax": 7.549516567451064e-15,
   "difEscaladaMax": 6.0150903543611596e-15,
   "peor": "F[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(roturas ~ lana * tension), by = \"tension\")"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-tres-factores-dos-por",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "C dentro de cada combinación de A y B",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 28,
   "difMax": 1.2434497875801753e-14,
   "difEscaladaMax": 2.409797852025772e-15,
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
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(y ~ A * B * C), by = c(\"A\", \"B\"))"
   }
  },
  {
   "id": "medias.pruebasConjuntasDe/simples-tres-factores",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "medias.pruebasConjuntasDe"
   },
   "titulo": "Factorial 2 × 2 × 3: B, C y B:C dentro de cada A",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 36,
   "difMax": 1.1368683772161603e-13,
   "difEscaladaMax": 7.547769787664887e-15,
   "peor": "F[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::joint_tests(lm(y ~ A * B * C), by = \"A\")"
   }
  },
  {
   "id": "parcelas-subdivididas/subdivididas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "parcelas-subdivididas"
   },
   "titulo": "Parcelas subdivididas en bloques (= agricolae::ssp.plot)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 50,
   "difMax": 1.3145040611561853e-13,
   "difEscaladaMax": 3.0403360476682666e-14,
   "peor": "estratos[3].filas[0].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7"
    },
    "codigo": "summary(aov(y ~ bloque + A * B * C + Error(bloque/A/B))); CV = 100 * sqrt(CM error) / media"
   }
  },
  {
   "id": "comp.contrastesDe/contrastes-avena-n",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.contrastesDe"
   },
   "titulo": "Contrastes de nitrógeno en parcelas divididas (error b)",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 10,
   "difMax": 7.105427357601002e-14,
   "difEscaladaMax": 2.131152808470054e-14,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::contrast(emmeans(modelo, trt), method = list(...)); SC = t² · CMerror"
   }
  },
  {
   "id": "comp.contrastesDe/contrastes-bloques",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.contrastesDe"
   },
   "titulo": "Contrastes en bloques, uno no ortogonal",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 18,
   "difMax": 9.237055564881302e-13,
   "difEscaladaMax": 7.316298558852568e-15,
   "peor": "[0].sc[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::contrast(emmeans(modelo, trt), method = list(...)); SC = t² · CMerror"
   }
  },
  {
   "id": "comp.contrastesDe/contrastes-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.contrastesDe"
   },
   "titulo": "Dos contrastes ortogonales",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 12,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.6653345369377348e-15,
   "peor": "[0].t[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "emmeans::contrast(emmeans(modelo, trt), method = list(...)); SC = t² · CMerror"
   }
  },
  {
   "id": "comp.rangoMultipleDe/duncan-maiz",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "DUNCAN con las medias de híbrido de un factorial en bloques",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 12,
   "difMax": 2.8033131371785203e-15,
   "difEscaladaMax": 2.8033131371785203e-15,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::duncan.test(lm(rend ~ bloque + hibrido * dosis, data = mzf), \"hibrido\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.rangoMultipleDe/duncan-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "DUNCAN con un factor balanceado",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 12,
   "difMax": 4.3298697960381105e-15,
   "difEscaladaMax": 4.3298697960381105e-15,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::duncan.test(lm(peso ~ grupo, data = pg), \"grupo\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.rangoMultipleDe/duncan-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "DUNCAN desbalanceado (media armónica de las repeticiones)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 42,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 3.5249581228304116e-9,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::duncan.test(lm(peso ~ alimento, data = ck), \"alimento\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.rangoMultipleDe/snk-maiz",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "SNK con las medias de híbrido de un factorial en bloques",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 12,
   "difMax": 2.7755575615628914e-15,
   "difEscaladaMax": 2.7755575615628914e-15,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::SNK.test(lm(rend ~ bloque + hibrido * dosis, data = mzf), \"hibrido\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.rangoMultipleDe/snk-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "SNK con un factor balanceado",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 12,
   "difMax": 4.3298697960381105e-15,
   "difEscaladaMax": 4.3298697960381105e-15,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::SNK.test(lm(peso ~ grupo, data = pg), \"grupo\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.rangoMultipleDe/snk-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.rangoMultipleDe"
   },
   "titulo": "SNK desbalanceado (media armónica de las repeticiones)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 42,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 1.4099832412739488e-8,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "agricolae": "1.3.7",
     "multcompView": "0.1.10"
    },
    "codigo": "agricolae::SNK.test(lm(peso ~ alimento, data = ck), \"alimento\") con los p sin redondear; letras con multcompLetters"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-bloques",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett en bloques completos (testigo V1)",
   "fuente": "Datos sintéticos",
   "clase": "C",
   "valores": 16,
   "difMax": 2.1316282072803006e-14,
   "difEscaladaMax": 8.492130354645487e-15,
   "peor": "[0].p[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-dosis-en-hibrido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett contra la dosis 0 dentro de cada híbrido",
   "fuente": "Datos sintéticos",
   "clase": "C",
   "valores": 36,
   "difMax": 2.3092638912203256e-14,
   "difEscaladaMax": 2.4699063320888935e-14,
   "peor": "[1].p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-plantas-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett de una cola (mayor que el testigo)",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "C",
   "valores": 8,
   "difMax": 3.4416913763379853e-15,
   "difEscaladaMax": 3.4416913763379853e-15,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett bilateral contra el testigo, n iguales",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "C",
   "valores": 8,
   "difMax": 3.3306690738754696e-15,
   "difEscaladaMax": 2.502774343616238e-15,
   "peor": "[0].t[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-pollos-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett de una cola (menor que el testigo: casein)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "C",
   "valores": 20,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 2.8618988501463385e-14,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.dunnettDe/dunnett-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.dunnettDe"
   },
   "titulo": "Dunnett con n distintos (testigo: horsebean)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "C",
   "valores": 20,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 5.6510550613790405e-14,
   "peor": "[0].p[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "mvtnorm": "1.3.2"
    },
    "codigo": "P(máx |Tᵢ| > |t|) por integración doble (integrate, rel.tol 1e-12) con correlaciones λᵢλⱼ; emmeans(adjust = \"mvt\") como comprobación"
   }
  },
  {
   "id": "comp.gamesHowellDe/games-howell-insectos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.gamesHowellDe"
   },
   "titulo": "Games-Howell: insecticidas",
   "fuente": "Beall (1942); conjunto InsectSprays de R",
   "clase": "B",
   "valores": 51,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 3.9968028886505635e-9,
   "peor": "p[5]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
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
    "codigo": "PMCMRplus::gamesHowellTest(conteo, insecticida)"
   }
  },
  {
   "id": "comp.gamesHowellDe/games-howell-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.gamesHowellDe"
   },
   "titulo": "Games-Howell: alimentos de pollos",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 51,
   "difMax": 3.6637359812630166e-15,
   "difEscaladaMax": 3.6637359812630166e-9,
   "peor": "p[8]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
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
    "codigo": "PMCMRplus::gamesHowellTest(peso, alimento)"
   }
  },
  {
   "id": "comp.mediasDe/medias-bib",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.mediasDe"
   },
   "titulo": "Medias ajustadas de un BIB, IC 99 %",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 35,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "[0].ee[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "confint(emmeans(lm(y ~ bloque + trat, data = datos), \"trat\"), level = 0.99)"
   }
  },
  {
   "id": "comp.mediasDe/medias-maiz-hibrido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.mediasDe"
   },
   "titulo": "Medias de híbrido en un factorial en bloques, IC 95 %",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 15,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 4.3888935418782326e-16,
   "peor": "[0].sup[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "confint(emmeans(lm(rend ~ bloque + hibrido * dosis, data = mzf), \"hibrido\"), level = 0.95)"
   }
  },
  {
   "id": "comp.mediasDe/medias-perdidas-celdas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.mediasDe"
   },
   "titulo": "Medias de dosis dentro de híbrido con dos parcelas perdidas",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 60,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 5.898309006298508e-16,
   "peor": "[0].inf[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "confint(emmeans(lm(rend ~ bloque + hibrido * dosis, data = transform(mz[-c(5, 30), ], dosis = factor(dosis))), \"dosis\"), level = 0.95)"
   }
  },
  {
   "id": "comp.mediasDe/medias-pollos-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.mediasDe"
   },
   "titulo": "Medias de un factor desbalanceado, IC 90 %",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "A",
   "valores": 30,
   "difMax": 1.9895196601282805e-13,
   "difEscaladaMax": 1.0826723828020326e-15,
   "peor": "[0].inf[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "confint(emmeans(lm(peso ~ alimento, data = datos), \"alimento\"), level = 0.9)"
   }
  },
  {
   "id": "comparaciones-medias/metodo-bonferroni-pollos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "Bonferroni con un factor desbalanceado",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 87,
   "difMax": 2.4158453015843406e-13,
   "difEscaladaMax": 4.723998969780041e-14,
   "peor": "grupos[0].pares[9].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "grupos[*].pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(peso ~ alimento, data = datos), ...), adjust = \"bonferroni\"); letras con multcompLetters"
   }
  },
  {
   "id": "comparaciones-medias/metodo-dms-dosis-en-hibrido",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "DMS de la dosis dentro de cada híbrido",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 114,
   "difMax": 2.353672812205332e-14,
   "difEscaladaMax": 9.396668549823257e-15,
   "peor": "grupos[0].pares[0].t",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "grupos[*].pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(rend ~ bloque + hibrido * dosis, data = mzf), ...), adjust = \"none\"); letras con multcompLetters"
   }
  },
  {
   "id": "comparaciones-medias/metodo-dms-protegida-no-significativa",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "DMS protegida con F no significativa: todas las medias en un grupo",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 21,
   "difMax": 7.771561172376096e-16,
   "difEscaladaMax": 7.771561172376096e-16,
   "peor": "grupos[0].pares[5].dif",
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
    "codigo": "anova(modelo): F no significativa → la DMS protegida no separa medias"
   }
  },
  {
   "id": "comparaciones-medias/metodo-dunnett-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "Dunnett contra V1 en bloques completos",
   "fuente": "Datos sintéticos",
   "clase": "C",
   "valores": 12,
   "difMax": 2.1316282072803006e-14,
   "difEscaladaMax": 8.492130354645487e-15,
   "peor": "grupos[0].comparaciones[3].p_ajustado",
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
    "codigo": "Dunnett por integración doble (integrate)"
   }
  },
  {
   "id": "comparaciones-medias/metodo-tukey-avena-n-en-v",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "Tukey del nitrógeno dentro de cada variedad (parcelas divididas)",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "B",
   "valores": 114,
   "difMax": 1.8474111129762605e-13,
   "difEscaladaMax": 1.3211653993039363e-14,
   "peor": "grupos[2].pares[4].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "grupos[*].pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(Y ~ V * N + Error(B/V), data = datos), ...), adjust = \"tukey\"); letras con multcompLetters"
   }
  },
  {
   "id": "comparaciones-medias/metodo-tukey-maiz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "comparaciones-medias"
   },
   "titulo": "Tukey de los híbridos en un factorial en bloques",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 21,
   "difMax": 2.220446049250313e-14,
   "difEscaladaMax": 1.327693324865179e-14,
   "peor": "grupos[0].pares[0].t",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "grupos[*].pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(rend ~ bloque + hibrido * dosis, data = mzf), ...), adjust = \"tukey\"); letras con multcompLetters"
   }
  },
  {
   "id": "contrastes/metodo-contrastes-plantas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "contrastes"
   },
   "titulo": "Contrastes escritos como texto",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "A",
   "valores": 11,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.6653345369377348e-15,
   "peor": "grupos[0].contrastes[0].t",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contrast(emmeans(lm(peso ~ grupo), \"grupo\"), method = list(...))"
   }
  },
  {
   "id": "medias-ajustadas/metodo-medias-maiz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medias-ajustadas"
   },
   "titulo": "Medias ajustadas de híbrido con IC 90 %",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 15,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 3.0584334383243285e-16,
   "peor": "grupos[0].filas[2].ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "confint(emmeans(lm(rend ~ bloque + hibrido * dosis), \"hibrido\"), level = 0.9)"
   }
  },
  {
   "id": "polinomios/metodo-polinomios-maiz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "polinomios"
   },
   "titulo": "Dosis de N: lineal y cuadrático con la dosis óptima",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 15,
   "difMax": 2.4158453015843406e-13,
   "difEscaladaMax": 2.8360595375816606e-14,
   "peor": "grupos[0].polinomios[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contr.poly(4, scores = dosis); contrast(emmeans(...)); lm(medias ~ poly(dosis, 2, raw = TRUE))"
   }
  },
  {
   "id": "comp.paresDe/pares-avena-n-en-v",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Parcelas divididas: nitrógeno dentro de cada variedad",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "B",
   "valores": 684,
   "difMax": 1.8474111129762605e-13,
   "difEscaladaMax": 2.3584932876750253e-14,
   "peor": "dms[0].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(Y ~ V * N + Error(B/V), data = datos), \"N\", by = \"V\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-avena-nitrogeno",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Parcelas divididas: dosis de nitrógeno (error b)",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "B",
   "valores": 228,
   "difMax": 1.4210854715202004e-13,
   "difEscaladaMax": 2.5807864698565013e-14,
   "peor": "dms[0].p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(Y ~ V * N + Error(B/V), data = datos), \"N\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-avena-v-en-n",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Parcelas divididas: variedades dentro de cada dosis (errores combinados, Satterthwaite)",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "B",
   "valores": 504,
   "difMax": 1.334343746606237e-10,
   "difEscaladaMax": 1.334343746606237e-10,
   "peor": "tukey[1].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(Y ~ V * N + Error(B/V), data = datos), \"V\", by = \"N\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-avena-variedad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Parcelas divididas: variedades (error a)",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "B",
   "valores": 126,
   "difMax": 1.5631940186722204e-13,
   "difEscaladaMax": 5.440092820663267e-15,
   "peor": "dms[0].t[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(Y ~ V * N + Error(B/V), data = datos), \"V\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-bib",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Bloques incompletos balanceados: medias ajustadas correlacionadas",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 357,
   "difMax": 2.3092638912203256e-14,
   "difEscaladaMax": 8.881784197001252e-15,
   "peor": "dms[0].t[11]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(y ~ bloque + trat, data = datos), \"trat\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-bloques-perdidas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Bloques con parcelas perdidas: medias ajustadas",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 360,
   "difMax": 2.042810365310288e-14,
   "difEscaladaMax": 1.0880185641326534e-14,
   "peor": "bonferroni[0].p[8]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(rend ~ bloque + variedad, data = datos), \"variedad\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-franjas-a-en-b",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Franjas: A dentro de cada B (error a con error c)",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 228,
   "difMax": 3.2077651646034155e-9,
   "difEscaladaMax": 3.2077651646034155e-9,
   "peor": "tukey[0].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(y ~ A * B + Error(bloque/(A + B)), data = datos), \"A\", by = \"B\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-maiz-dosis-en-hibrido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Bloques, factorial: dosis dentro de cada híbrido",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 684,
   "difMax": 2.353672812205332e-14,
   "difEscaladaMax": 1.1102230246251565e-10,
   "peor": "tukey[1].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(rend ~ bloque + hibrido * dosis, data = mzf), \"dosis\", by = \"hibrido\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-maiz-hibrido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Bloques, factorial: medias de híbrido",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 126,
   "difMax": 2.220446049250313e-14,
   "difEscaladaMax": 1.6209256159527285e-14,
   "peor": "bonferroni[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(rend ~ bloque + hibrido * dosis, data = mzf), \"hibrido\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-plantas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Un factor balanceado: los seis métodos",
   "fuente": "Dobson (1983); conjunto PlantGrowth de R",
   "clase": "B",
   "valores": 126,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 3.552713678800501e-15,
   "peor": "tukey[0].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(peso ~ grupo, data = datos), \"grupo\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-pollos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Un factor desbalanceado (Tukey-Kramer)",
   "fuente": "Anónimo (1948); conjunto chickwts de R",
   "clase": "B",
   "valores": 522,
   "difMax": 2.4158453015843406e-13,
   "difEscaladaMax": 1.4210854715202004e-8,
   "peor": "tukey[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(peso ~ alimento, data = datos), \"alimento\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-roturas-celdas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Factorial desbalanceado: las seis combinaciones",
   "fuente": "Tippett (1950); conjunto warpbreaks de R sin cinco filas",
   "clase": "B",
   "valores": 261,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 2.4868995751603507e-14,
   "peor": "dms[0].dif[10]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(roturas ~ lana * tension, data = datos), c(\"lana\", \"tension\")), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-roturas-tension-en-lana",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Factorial desbalanceado: tensión dentro de cada lana",
   "fuente": "Tippett (1950); conjunto warpbreaks de R sin cinco filas",
   "clase": "B",
   "valores": 252,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 2.4868995751603507e-14,
   "peor": "dms[0].dif[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(lm(roturas ~ lana * tension, data = datos), \"tension\", by = \"lana\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-subdivididas-a-en-c",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Subdivididas: A dentro de cada C (tres errores combinados)",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 36,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 2.6209898276325307e-15,
   "peor": "dms[0].t[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(y ~ A * B * C + Error(bloque/A/B), data = datos), \"A\", by = \"C\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.paresDe/pares-subdivididas-b-en-a",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.paresDe"
   },
   "titulo": "Subdivididas: B dentro de cada A",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 84,
   "difMax": 1.9095836023552692e-14,
   "difEscaladaMax": 9.243369556878011e-15,
   "peor": "dms[0].t[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "tukey[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "pairs(emmeans(aov(y ~ A * B * C + Error(bloque/A/B), data = datos), \"B\", by = \"A\"), adjust = …); letras con multcompLetters"
   }
  },
  {
   "id": "comp.polinomiosDe/polinomios-avena",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.polinomiosDe"
   },
   "titulo": "Nitrógeno en parcelas divididas (0, 0.2, 0.4, 0.6 qq/acre), error b",
   "fuente": "Yates (1935); conjunto oats del paquete MASS",
   "clase": "A",
   "valores": 17,
   "difMax": 1.2789769243681803e-13,
   "difEscaladaMax": 1.0871070042286113e-14,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contrast(emmeans(...), method = columnas de contr.poly(k, scores = dosis)); lm(medias ~ poly(dosis, grado, raw = TRUE)); dosis óptima = −b₁/(2b₂)"
   }
  },
  {
   "id": "comp.polinomiosDe/polinomios-desiguales",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.polinomiosDe"
   },
   "titulo": "Dosis desigualmente espaciadas (0, 50, 100, 200) en completamente al azar",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 23,
   "difMax": 4.263256414560601e-13,
   "difEscaladaMax": 2.4121308251791745e-14,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contrast(emmeans(...), method = columnas de contr.poly(k, scores = dosis)); lm(medias ~ poly(dosis, grado, raw = TRUE)); dosis óptima = −b₁/(2b₂)"
   }
  },
  {
   "id": "comp.polinomiosDe/polinomios-maiz-en-hibrido",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.polinomiosDe"
   },
   "titulo": "Polinomios de la dosis dentro de cada híbrido",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 69,
   "difMax": 2.8421709430404007e-13,
   "difEscaladaMax": 1.6494218475181886e-14,
   "peor": "[0].F[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contrast(emmeans(...), method = columnas de contr.poly(k, scores = dosis)); lm(medias ~ poly(dosis, grado, raw = TRUE)); dosis óptima = −b₁/(2b₂)"
   }
  },
  {
   "id": "comp.polinomiosDe/polinomios-maiz",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "comp.polinomiosDe"
   },
   "titulo": "Dosis de N (0, 60, 120, 180) en un factorial en bloques: lineal, cuadrático y cúbico; óptimo",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 23,
   "difMax": 2.4158453015843406e-13,
   "difEscaladaMax": 2.8360595375816606e-14,
   "peor": "[0].p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "emmeans": "1.10.6"
    },
    "codigo": "contrast(emmeans(...), method = columnas de contr.poly(k, scores = dosis)); lm(medias ~ poly(dosis, grado, raw = TRUE)); dosis óptima = −b₁/(2b₂)"
   }
  },
  {
   "id": "ancova.analizarDe/anorexia-tipo1",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Un factor desbalanceado, SC tipo I (tratamientos ajustados por la covariable)",
   "fuente": "Hand, Daly, McConway, Lunn y Ostrowski (1993), A Handbook of Small Data Sets, conjunto 285; anorexia del paquete MASS",
   "clase": "A",
   "valores": 65,
   "difMax": 1.4779288903810084e-12,
   "difEscaladaMax": 2.0943650167098274e-14,
   "peor": "independencia[0].sc_trat",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(peso_final ~ peso_inicial + tratamiento); anova(m); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"none\")"
   }
  },
  {
   "id": "ancova.analizarDe/anorexia-tipo2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Un factor desbalanceado, SC tipo II, Bonferroni, IC 90 %",
   "fuente": "Hand, Daly, McConway, Lunn y Ostrowski (1993), A Handbook of Small Data Sets, conjunto 285; anorexia del paquete MASS",
   "clase": "A",
   "valores": 65,
   "difMax": 6.821210263296962e-13,
   "difEscaladaMax": 2.0943650167098274e-14,
   "peor": "independencia[0].sc_trat",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(peso_final ~ peso_inicial + tratamiento); car::Anova(m, type = 2); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"bonferroni\")"
   }
  },
  {
   "id": "ancova.analizarDe/anorexia-tipo3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Un factor desbalanceado, SC tipo III, Tukey",
   "fuente": "Hand, Daly, McConway, Lunn y Ostrowski (1993), A Handbook of Small Data Sets, conjunto 285; anorexia del paquete MASS",
   "clase": "B",
   "valores": 65,
   "difMax": 6.821210263296962e-13,
   "difEscaladaMax": 2.853273173286652e-14,
   "peor": "comparaciones[0].p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(peso_final ~ peso_inicial + tratamiento); car::Anova(m, type = 3); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "ancova.analizarDe/frijol",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Cuatro tecnologías con su índice: la covariable es la misma en cada tecnología (F = 0; R da NA)",
   "fuente": "Oriente antioqueño (1972), ICA, Colombia; conjunto frijol del paquete agricolae",
   "clase": "A",
   "valores": 82,
   "difMax": 3.725290298461914e-9,
   "difEscaladaMax": 1.1553825584554272e-14,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(produccion ~ indice + tecnologia); car::Anova(m, type = 3); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"holm\")"
   }
  },
  {
   "id": "ancova.analizarDe/sorgo-bloques",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Bloques completos con una covariable (número de plantas)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 107,
   "difMax": 1.0231815394945443e-12,
   "difEscaladaMax": 6.1117116327345396e-15,
   "peor": "comparaciones[0].t[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(rend ~ bloque + plantas + variedad); car::Anova(m, type = 3); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"none\")"
   }
  },
  {
   "id": "ancova.analizarDe/sorgo-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Bloques con dos parcelas sin dato (medias ajustadas)",
   "fuente": "Datos sintéticos",
   "clase": "B",
   "valores": 107,
   "difMax": 1.0800249583553523e-12,
   "difEscaladaMax": 9.769962616701378e-15,
   "peor": "comparaciones[0].t[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(rend ~ bloque + plantas + variedad); car::Anova(m, type = 2); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"sidak\")"
   }
  },
  {
   "id": "ancova.analizarDe/suelos-bloques-factorial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Bloques con factorial 3 × 4 y una covariable",
   "fuente": "Horton, Russell y Moore (1968), Biometrics 24: 845-858; conjunto Soils del paquete carData",
   "clase": "B",
   "valores": 123,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 3.6945310575456614e-14,
   "peor": "homogeneidad[0].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(N ~ bloque + densidad + contorno * profundidad); car::Anova(m, type = 3); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "ancova.analizarDe/suelos-dos-covariables",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "ancova.analizarDe"
   },
   "titulo": "Bloques con factorial y dos covariables, SC tipo II",
   "fuente": "Horton, Russell y Moore (1968), Biometrics 24: 845-858; conjunto Soils del paquete carData",
   "clase": "A",
   "valores": 141,
   "difMax": 4.796163466380676e-14,
   "difEscaladaMax": 2.7977620220553945e-14,
   "peor": "homogeneidad[1].F",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].p[*]": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(N ~ bloque + densidad + pH + contorno * profundidad); car::Anova(m, type = 2); anova(m, m + covariable:tratamientos); emmeans; pairs(adjust = \"scheffe\")"
   }
  },
  {
   "id": "ancova/metodo-ancova-anorexia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ancova"
   },
   "titulo": "ANCOVA con Tukey y eficiencia relativa",
   "fuente": "Hand, Daly, McConway, Lunn y Ostrowski (1993), A Handbook of Small Data Sets, conjunto 285; anorexia del paquete MASS",
   "clase": "B",
   "valores": 55,
   "difMax": 6.821210263296962e-13,
   "difEscaladaMax": 2.853273173286652e-14,
   "peor": "comparaciones[0].pares[2].p_ajustado",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "comparaciones[*].pares[*].p_ajustado": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6",
     "multcompView": "0.1.10"
    },
    "codigo": "lm(peso_final ~ peso_inicial + tratamiento, contrasts = contr.sum); car::Anova(type = 3); emmeans; pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "reg.colinealidadDe/colinealidad-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.colinealidadDe"
   },
   "titulo": "Dos predictores",
   "fuente": "Atkinson (1985), Plots, Transformations and Regression; conjunto trees de R",
   "clase": "A",
   "valores": 18,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 1.13518915337389e-15,
   "peor": "vif[0]",
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
    "codigo": "car::vif(lm(volumen ~ diametro + altura)); svd de la matriz del modelo con columnas de longitud 1"
   }
  },
  {
   "id": "reg.colinealidadDe/colinealidad-longley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.colinealidadDe"
   },
   "titulo": "Seis predictores muy colineales",
   "fuente": "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R",
   "clase": "A",
   "valores": 70,
   "difMax": 1.1568772606551647e-9,
   "difEscaladaMax": 2.370326157574709e-13,
   "peor": "proporciones[6][5]",
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
    "codigo": [
     "car::vif(lm(Employed ~ GNP.deflator + GNP + Unemployed + Armed.Forces + Population + )); svd de la matriz del modelo con columnas de longitud 1",
     "car::vif(lm(    Year)); svd de la matriz del modelo con columnas de longitud 1"
    ]
   }
  },
  {
   "id": "reg.colinealidadDe/colinealidad-stackloss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.colinealidadDe"
   },
   "titulo": "Tres predictores",
   "fuente": "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R",
   "clase": "A",
   "valores": 28,
   "difMax": 7.815970093361102e-14,
   "difEscaladaMax": 2.6645352591003757e-15,
   "peor": "proporciones[2][1]",
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
    "codigo": "car::vif(lm(perdida ~ aire + agua + acido)); svd de la matriz del modelo con columnas de longitud 1"
   }
  },
  {
   "id": "reg.colinealidadDe/colinealidad-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.colinealidadDe"
   },
   "titulo": "Cinco predictores",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 54,
   "difMax": 5.3290705182007514e-14,
   "difEscaladaMax": 1.9735047476468584e-15,
   "peor": "indices[5]",
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
    "codigo": [
     "car::vif(lm(Fertility ~ Agriculture + Examination + Education + Catholic + )); svd de la matriz del modelo con columnas de longitud 1",
     "car::vif(lm(    Infant.Mortality)); svd de la matriz del modelo con columnas de longitud 1"
    ]
   }
  },
  {
   "id": "reg.influenciaDe/influencia-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Dos predictores",
   "fuente": "Atkinson (1985), Plots, Transformations and Regression; conjunto trees de R",
   "clase": "A",
   "valores": 496,
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
    "codigo": "influence.measures(lm(volumen ~ diametro + altura)); rstandard; rstudent; influence()$sigma"
   }
  },
  {
   "id": "reg.influenciaDe/influencia-cars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Regresión simple",
   "fuente": "Ezekiel (1930), Methods of Correlation Analysis; conjunto cars de R",
   "clase": "A",
   "valores": 750,
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
    "codigo": "influence.measures(lm(dist ~ speed)); rstandard; rstudent; influence()$sigma"
   }
  },
  {
   "id": "reg.influenciaDe/influencia-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Con filas incompletas fuera",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 1887,
   "difMax": 4.85722573273506e-14,
   "difEscaladaMax": 4.85722573273506e-14,
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
    "codigo": "influence.measures(lm(Ozone ~ Solar.R + Wind + Temp)); rstandard; rstudent; influence()$sigma"
   }
  },
  {
   "id": "reg.influenciaDe/influencia-polinomial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Polinomio de grado 2",
   "fuente": "The World Almanac and Book of Facts (1975); conjunto women de R",
   "clase": "A",
   "valores": 240,
   "difMax": 1.1574075031717257e-12,
   "difEscaladaMax": 1.1574075031717257e-12,
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
    "codigo": "influence.measures(lm(peso ~ estatura + I(estatura^2))); rstandard; rstudent; influence()$sigma"
   }
  },
  {
   "id": "reg.influenciaDe/influencia-stackloss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Tres predictores",
   "fuente": "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R",
   "clase": "A",
   "valores": 357,
   "difMax": 2.9531932455029164e-14,
   "difEscaladaMax": 2.4417156548946105e-14,
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
    "codigo": "influence.measures(lm(perdida ~ aire + agua + acido)); rstandard; rstudent; influence()$sigma"
   }
  },
  {
   "id": "reg.influenciaDe/influencia-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.influenciaDe"
   },
   "titulo": "Cinco predictores",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 893,
   "difMax": 4.6629367034256575e-15,
   "difEscaladaMax": 4.6629367034256575e-15,
   "peor": "rstandard[18]",
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
    "codigo": [
     "influence.measures(lm(Fertility ~ Agriculture + Examination + Education + Catholic + )); rstandard; rstudent; influence()$sigma",
     "influence.measures(lm(    Infant.Mortality)); rstandard; rstudent; influence()$sigma"
    ]
   }
  },
  {
   "id": "seleccion-pasos/metodo-pasos-swiss",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "seleccion-pasos"
   },
   "titulo": "Paso a paso por AIC en ambas direcciones",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 37,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.9274609204387306e-14,
   "peor": "final.p[0]",
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
    "codigo": "step(lm(Fertility ~ ., data = swiss))"
   }
  },
  {
   "id": "regresion-polinomial/metodo-polinomial-dosis",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "regresion-polinomial"
   },
   "titulo": "Cuadrática con dosis óptima y falta de ajuste",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 54,
   "difMax": 4.831690603168681e-13,
   "difEscaladaMax": 3.14329842548492e-14,
   "peor": "coeficientes.p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "lmtest": "0.9.40"
    },
    "codigo": "lm(rend ~ poly(dosis, 2, raw = TRUE)); anova; óptimo −b1/(2·b2)"
   }
  },
  {
   "id": "regresion-lineal/metodo-regresion-stackloss",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "regresion-lineal"
   },
   "titulo": "Regresión múltiple con diagnóstico completo",
   "fuente": "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R",
   "clase": "A",
   "valores": 126,
   "difMax": 7.389644451905042e-13,
   "difEscaladaMax": 3.674740607931629e-14,
   "peor": "anova.regresion.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "lmtest": "0.9.40"
    },
    "codigo": "lm(perdida ~ aire + agua + acido); summary; anova; AIC; influence.measures; bptest; resettest; dwtest; vif; svd"
   }
  },
  {
   "id": "mejores-subconjuntos/metodo-subconjuntos-mtcars",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mejores-subconjuntos"
   },
   "titulo": "Mejores subconjuntos con diez candidatos",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 128,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 2.040563925332647e-14,
   "peor": "filas[1].cp",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "leaps": "3.2"
    },
    "codigo": "summary(leaps::regsubsets(mpg ~ ., data = mtcars, nvmax = 10))"
   }
  },
  {
   "id": "reg.analizarDe/multiple-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Dos predictores, IC al 90 % y predicción",
   "fuente": "Atkinson (1985), Plots, Transformations and Regression; conjunto trees de R",
   "clase": "A",
   "valores": 76,
   "difMax": 9.208633855450898e-12,
   "difEscaladaMax": 5.819316393137645e-14,
   "peor": "falta_ajuste.falta.F",
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
    "codigo": "lm(volumen ~ diametro + altura); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/multiple-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Tres predictores con faltantes (filas incompletas fuera)",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 66,
   "difMax": 1.2369127944111824e-10,
   "difEscaladaMax": 2.6304005542273883e-14,
   "peor": "coeficientes.ic_sup[0]",
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
    "codigo": "lm(Ozone ~ Solar.R + Wind + Temp); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/multiple-longley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Seis predictores muy colineales (prueba de exactitud numérica)",
   "fuente": "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R",
   "clase": "A",
   "valores": 108,
   "difMax": 1.2960299500264227e-11,
   "difEscaladaMax": 5.950795411990839e-14,
   "peor": "ajuste.logLik",
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
    "codigo": [
     "lm(Employed ~ GNP.deflator + GNP + Unemployed + Armed.Forces + Population + ); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))",
     "lm(    Year); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
    ]
   }
  },
  {
   "id": "reg.analizarDe/multiple-stackloss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Tres predictores (datos clásicos de influencia)",
   "fuente": "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R",
   "clase": "A",
   "valores": 72,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 3.674740607931629e-14,
   "peor": "anova.regresion.p",
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
    "codigo": "lm(perdida ~ aire + agua + acido); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/multiple-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Cinco predictores",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 94,
   "difMax": 2.0463630789890885e-12,
   "difEscaladaMax": 3.6245679850286947e-14,
   "peor": "coeficientes.p[0]",
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
    "codigo": [
     "lm(Fertility ~ Agriculture + Examination + Education + Catholic + ); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))",
     "lm(    Infant.Mortality); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
    ]
   }
  },
  {
   "id": "reg.analizarDe/polinomial-cubica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Cúbica con máximo dentro de los datos",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 72,
   "difMax": 3.865352482534945e-12,
   "difEscaladaMax": 3.875175360168983e-14,
   "peor": "terminos.sc2[0]",
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
    "codigo": "lm(altura ~ dias + I(dias^2) + I(dias^3)); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/polinomial-dosis",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Respuesta a la dosis: cuadrática con repeticiones y dosis óptima",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 65,
   "difMax": 4.831690603168681e-13,
   "difEscaladaMax": 5.3290705182007514e-14,
   "peor": "ajuste.bic",
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
    "codigo": "lm(rend ~ dosis + I(dosis^2)); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/polinomial-women-2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Polinomio de grado 2",
   "fuente": "The World Almanac and Book of Facts (1975); conjunto women de R",
   "clase": "A",
   "valores": 65,
   "difMax": 2.2009771782904863e-9,
   "difEscaladaMax": 1.8653689703995724e-12,
   "peor": "predicciones.ee[0]",
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
    "codigo": "lm(peso ~ estatura + I(estatura^2)); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/polinomial-women-3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Polinomio de grado 3",
   "fuente": "The World Almanac and Book of Facts (1975); conjunto women de R",
   "clase": "A",
   "valores": 63,
   "difMax": 1.275766408070922e-7,
   "difEscaladaMax": 1.4268312785552282e-11,
   "peor": "ajuste.logLik",
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
    "codigo": "lm(peso ~ estatura + I(estatura^2) + I(estatura^3)); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.analizarDe/simple-cars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.analizarDe"
   },
   "titulo": "Regresión simple con repeticiones de x (falta de ajuste) y predicción",
   "fuente": "Ezekiel (1930), Methods of Correlation Analysis; conjunto cars de R",
   "clase": "A",
   "valores": 56,
   "difMax": 1.0913936421275139e-11,
   "difEscaladaMax": 1.1792911587797733e-14,
   "peor": "anova.regresion.p",
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
    "codigo": "lm(dist ~ speed); summary, confint, anova, car::Anova(type = 2), AIC, BIC, predict(interval = …); falta de ajuste con anova(m, lm(y ~ factor(x)))"
   }
  },
  {
   "id": "reg.pasosDe/pasos-aic-adelante-mtcars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "AIC hacia adelante con 10 candidatos",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 42,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 2.20707116301624e-15,
   "peor": "final.p[0]",
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
    "codigo": "step(…, direction = \"adelante\")$anova"
   }
  },
  {
   "id": "reg.pasosDe/pasos-aic-adelante-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "AIC hacia adelante",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 52,
   "difMax": 3.183231456205249e-12,
   "difEscaladaMax": 4.457356441450281e-14,
   "peor": "final.p[0]",
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
    "codigo": "step(…, direction = \"adelante\")$anova"
   }
  },
  {
   "id": "reg.pasosDe/pasos-aic-ambas-mtcars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "AIC en ambas direcciones con 10 candidatos",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 62,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 1.0653715736521573e-15,
   "peor": "pasos[6].rss",
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
    "codigo": "step(…, direction = \"ambas\")$anova"
   }
  },
  {
   "id": "reg.pasosDe/pasos-aic-ambas-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "AIC en ambas direcciones",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 37,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.9274609204387306e-14,
   "peor": "final.p[0]",
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
    "codigo": "step(…, direction = \"ambas\")$anova"
   }
  },
  {
   "id": "reg.pasosDe/pasos-aic-atras-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "AIC hacia atrás",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 37,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.9274609204387306e-14,
   "peor": "final.p[0]",
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
    "codigo": "step(…, direction = \"atras\")$anova"
   }
  },
  {
   "id": "reg.pasosDe/pasos-p-adelante-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "Valor p hacia adelante",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 65,
   "difMax": 3.183231456205249e-12,
   "difEscaladaMax": 4.457356441450281e-14,
   "peor": "final.p[0]",
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
    "codigo": "add1/drop1(…, test = \"F\") con entrada 0.05 y salida 0.1"
   }
  },
  {
   "id": "reg.pasosDe/pasos-p-atras-longley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "Valor p hacia atrás con colinealidad",
   "fuente": "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R",
   "clase": "A",
   "valores": 49,
   "difMax": 1.000444171950221e-11,
   "difEscaladaMax": 4.4297898682543746e-14,
   "peor": "pasos[1].p",
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
    "codigo": "add1/drop1(…, test = \"F\") con entrada 0.05 y salida 0.05"
   }
  },
  {
   "id": "reg.pasosDe/pasos-p-atras-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "Valor p hacia atrás",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 41,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.9274609204387306e-14,
   "peor": "final.p[0]",
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
    "codigo": "add1/drop1(…, test = \"F\") con entrada 0.05 y salida 0.1"
   }
  },
  {
   "id": "reg.pasosDe/pasos-p-mixta-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "Valor p mixta con filas incompletas",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 52,
   "difMax": 7.275957614183426e-11,
   "difEscaladaMax": 7.25295809981285e-14,
   "peor": "final.p[1]",
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
    "codigo": "add1/drop1(…, test = \"F\") con entrada 0.1 y salida 0.1"
   }
  },
  {
   "id": "reg.pasosDe/pasos-p-mixta-mtcars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pasosDe"
   },
   "titulo": "Valor p mixta (0.15 para entrar y salir)",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 52,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 7.191714759913875e-15,
   "peor": "pasos[1].p",
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
    "codigo": "add1/drop1(…, test = \"F\") con entrada 0.15 y salida 0.15"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-arboles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Dos predictores",
   "fuente": "Atkinson (1985), Plots, Transformations and Regression; conjunto trees de R",
   "clase": "A",
   "valores": 11,
   "difMax": 3.552713678800501e-14,
   "difEscaladaMax": 9.992007221626409e-15,
   "peor": "shapiro.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": "m <- lm(volumen ~ diametro + altura); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-cars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Regresión simple (Durbin-Watson exacto)",
   "fuente": "Ezekiel (1930), Methods of Correlation Analysis; conjunto cars de R",
   "clase": "A",
   "valores": 11,
   "difMax": 2.0372592501871623e-14,
   "difEscaladaMax": 2.0372592501871623e-14,
   "peor": "durbin_watson.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": "m <- lm(dist ~ speed); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "111 datos: Durbin-Watson por la aproximación normal",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 11,
   "difMax": 2.4868995751603507e-14,
   "difEscaladaMax": 1.939852996263605e-14,
   "peor": "reset.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": "m <- lm(Ozone ~ Solar.R + Wind + Temp); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-longley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Seis predictores colineales",
   "fuente": "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R",
   "clase": "A",
   "valores": 11,
   "difMax": 5.595524044110789e-14,
   "difEscaladaMax": 3.3306690738754696e-14,
   "peor": "durbin_watson.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": [
     "m <- lm(Employed ~ GNP.deflator + GNP + Unemployed + Armed.Forces + Population + ); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)",
     "m <- lm(    Year); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
    ]
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-polinomial",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Polinomio de grado 2 con repeticiones",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 11,
   "difMax": 3.5083047578154947e-14,
   "difEscaladaMax": 1.554312234475219e-14,
   "peor": "shapiro.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": "m <- lm(rend ~ dosis + I(dosis^2)); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-stackloss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Tres predictores",
   "fuente": "Brownlee (1965), Statistical Theory and Methodology in Science and Engineering, pp. 491-500; conjunto stackloss de R",
   "clase": "A",
   "valores": 11,
   "difMax": 1.0658141036401503e-13,
   "difEscaladaMax": 2.179415044917952e-14,
   "peor": "breusch_pagan.BP",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": "m <- lm(perdida ~ aire + agua + acido); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
   }
  },
  {
   "id": "reg.pruebasDe/pruebas-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.pruebasDe"
   },
   "titulo": "Cinco predictores",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 11,
   "difMax": 1.4654943925052066e-14,
   "difEscaladaMax": 1.4654943925052066e-14,
   "peor": "shapiro.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "lmtest": "0.9.40"
    },
    "codigo": [
     "m <- lm(Fertility ~ Agriculture + Examination + Education + Catholic + ); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)",
     "m <- lm(    Infant.Mortality); shapiro.test(residuals(m)); lmtest::bptest(m); lmtest::resettest(m); lmtest::dwtest(m)"
    ]
   }
  },
  {
   "id": "reg.subconjuntosDe/subconjuntos-longley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.subconjuntosDe"
   },
   "titulo": "Seis candidatos colineales",
   "fuente": "Longley (1967), J. Am. Stat. Assoc. 62: 819-841; conjunto longley de R",
   "clase": "A",
   "valores": 166,
   "difMax": 9.124789812631207e-11,
   "difEscaladaMax": 1.1111213473714407e-12,
   "peor": "filas[7].cp",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "leaps": "3.2"
    },
    "codigo": "summary(leaps::regsubsets(…, nvmax = 6, nbest = 3))"
   }
  },
  {
   "id": "reg.subconjuntosDe/subconjuntos-mtcars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.subconjuntosDe"
   },
   "titulo": "Diez candidatos (1023 modelos)",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 128,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 2.040563925332647e-14,
   "peor": "filas[1].cp",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "leaps": "3.2"
    },
    "codigo": "summary(leaps::regsubsets(…, nvmax = 10, nbest = 1))"
   }
  },
  {
   "id": "reg.subconjuntosDe/subconjuntos-swiss-2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.subconjuntosDe"
   },
   "titulo": "Los dos mejores de cada tamaño",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 91,
   "difMax": 5.4569682106375694e-12,
   "difEscaladaMax": 3.618517173330157e-15,
   "peor": "filas[1].bic",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "leaps": "3.2"
    },
    "codigo": "summary(leaps::regsubsets(…, nvmax = 5, nbest = 2))"
   }
  },
  {
   "id": "reg.subconjuntosDe/subconjuntos-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "reg.subconjuntosDe"
   },
   "titulo": "Cinco candidatos",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 53,
   "difMax": 2.7284841053187847e-12,
   "difEscaladaMax": 3.4753176615575785e-15,
   "peor": "filas[2].cp",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "leaps": "3.2"
    },
    "codigo": "summary(leaps::regsubsets(…, nvmax = 5, nbest = 1))"
   }
  },
  {
   "id": "cor.pruebaDe/empates-kendall-continuidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall con empates y corrección por continuidad",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"less\", conf.level = 0.95, continuity = TRUE)"
   }
  },
  {
   "id": "cor.pruebaDe/empates-kendall",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall con empates (varianza corregida)",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.6329405765118812e-14,
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/empates-spearman-continuidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman con empates y corrección por continuidad",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.8027519557123122e-15,
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95, continuity = TRUE)"
   }
  },
  {
   "id": "cor.pruebaDe/empates-spearman",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman con empates (t de Student)",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 7,
   "difMax": 3.4530146555404696e-38,
   "difEscaladaMax": 1.5362705124778004e-14,
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/faltantes-pearson",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Pearson con faltantes",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 8,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 3.2844438465674977e-15,
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
    "codigo": "cor.test(x, y, method = \"pearson\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/grande-kendall",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall con 3000 datos y muchos empates (algoritmo de Knight)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 5.166026291698271e-15,
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/grande-spearman",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman con 3000 datos y empates",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.3988237764037803e-23,
   "difEscaladaMax": 3.39047545079646e-15,
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-kendall-aprox",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin la exacta (normal)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.662221289702459e-16,
   "peor": "estadistico",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95, exact = FALSE)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-kendall-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "kendall, alternativa bilateral, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-kendall-continuidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall normal con corrección por continuidad",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 1.4198513545079782e-16,
   "peor": "estadistico",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95, exact = FALSE, continuity = TRUE)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-kendall-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "kendall, alternativa mayor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-kendall-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "kendall, alternativa menor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"less\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-pearson-90",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Pearson con IC al 90 %",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 8,
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
    "codigo": "cor.test(x, y, method = \"pearson\", alternative = \"two.sided\", conf.level = 0.9)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-pearson-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "pearson, alternativa bilateral, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 8,
   "difMax": 2.636779683484747e-16,
   "difEscaladaMax": 2.636779683484747e-16,
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
    "codigo": "cor.test(x, y, method = \"pearson\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-pearson-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "pearson, alternativa mayor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 8,
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
    "codigo": "cor.test(x, y, method = \"pearson\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-pearson-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "pearson, alternativa menor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 8,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
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
    "codigo": "cor.test(x, y, method = \"pearson\", alternative = \"less\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-spearman-aprox",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin la exacta (t de Student)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 1.8041124150158794e-16,
   "difEscaladaMax": 1.8041124150158794e-16,
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95, exact = FALSE)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-spearman-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "spearman, alternativa bilateral, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-spearman-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "spearman, alternativa mayor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/hw-spearman-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "spearman, alternativa menor, n = 9 (exacta)",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"less\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n10",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 10",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n12",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 12",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n20",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 20",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n300",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 300",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.3292815144062241e-14,
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n35",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 35",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n4",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 4",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n49-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall exacta con n = 49, una cola",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"less\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n50",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall con n = 50: ya por la normal",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n6",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 6",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/kendall-n80",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Kendall sin empates, n = 80",
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
    "codigo": "cor.test(x, y, method = \"kendall\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n10-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 10, una cola",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n10",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 10",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n12-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 12, una cola",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.33066907387547e-16,
   "peor": "estadistico",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n12",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 12",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 4.263256414560601e-14,
   "difEscaladaMax": 3.33066907387547e-16,
   "peor": "estadistico",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n20-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 20, una cola",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n20",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 20",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n300-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 300, una cola",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n300",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 300",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n35-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 35, una cola",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n35",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 35",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n4-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 4, una cola",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n4",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 4",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n6-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 6, una cola",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n6",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 6",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n80-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 80, una cola",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.pruebaDe/spearman-n80",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.pruebaDe"
   },
   "titulo": "Spearman sin empates, n = 80",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 7,
   "difMax": 2.7755575615628914e-17,
   "difEscaladaMax": 2.7755575615628914e-17,
   "peor": "estimado",
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
    "codigo": "cor.test(x, y, method = \"spearman\", alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cor.matrizDe/matriz-faltantes-completas",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.matrizDe"
   },
   "titulo": "Faltantes: solo las filas completas en todas",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 62,
   "difMax": 2.4216739724636227e-15,
   "difEscaladaMax": 1.5818524833648682e-14,
   "peor": "pares[3].p",
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
    "codigo": "cor.test por par (spearman) y p.adjust(\"holm\"); filas completas"
   }
  },
  {
   "id": "cor.matrizDe/matriz-faltantes-pares",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.matrizDe"
   },
   "titulo": "Faltantes: cada par con sus filas completas",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 68,
   "difMax": 3.885780586188048e-16,
   "difEscaladaMax": 3.332419208230645e-14,
   "peor": "pares[1].p",
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
    "codigo": "cor.test por par (pearson) y p.adjust(\"none\"); filas pares"
   }
  },
  {
   "id": "cor.matrizDe/matriz-mtcars-kendall-bonferroni",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.matrizDe"
   },
   "titulo": "Seis variables con empates, Kendall con Bonferroni",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 147,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 5.388695913506233e-15,
   "peor": "pares[10].p",
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
    "codigo": "cor.test por par (kendall) y p.adjust(\"bonferroni\"); filas completas"
   }
  },
  {
   "id": "cor.matrizDe/matriz-swiss-pearson-holm",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.matrizDe"
   },
   "titulo": "Cinco variables, Pearson con Holm",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 110,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 1.1002949171261522e-14,
   "peor": "pares[7].p_ajustado",
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
    "codigo": "cor.test por par (pearson) y p.adjust(\"holm\"); filas completas"
   }
  },
  {
   "id": "cor.matrizDe/matriz-swiss-spearman-bh",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.matrizDe"
   },
   "titulo": "Cinco variables, Spearman con Benjamini-Hochberg",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 100,
   "difMax": 9.08995101411847e-16,
   "difEscaladaMax": 1.987735192122508e-15,
   "peor": "pares[5].p",
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
    "codigo": "cor.test por par (spearman) y p.adjust(\"BH\"); filas completas"
   }
  },
  {
   "id": "correlacion/metodo-correlacion-hw",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "correlacion"
   },
   "titulo": "Kendall exacta con la tabla de los tres coeficientes",
   "fuente": "Hollander y Wolfe (1973), Nonparametric Statistical Methods, p. 187 (ejemplo de cor.test)",
   "clase": "A",
   "valores": 10,
   "difMax": 2.636779683484747e-16,
   "difEscaladaMax": 2.636779683484747e-16,
   "peor": "comparar[0].p",
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
    "codigo": "cor.test(x, y, method = …) con los tres coeficientes"
   }
  },
  {
   "id": "matriz-correlacion/metodo-matriz-swiss",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "matriz-correlacion"
   },
   "titulo": "Matriz de Pearson con Holm",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 75,
   "difMax": 6.661338147750939e-16,
   "difEscaladaMax": 1.1002949171261522e-14,
   "peor": "pares[7].p_ajustado",
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
    "codigo": "cor.test por par y p.adjust(\"holm\")"
   }
  },
  {
   "id": "correlacion-parcial/metodo-parcial-swiss",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "correlacion-parcial"
   },
   "titulo": "Parcial y semiparciales",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 16,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 1.904707776881603e-15,
   "peor": "parcial.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "residuos de lm sobre los controles"
   }
  },
  {
   "id": "cor.parcialDe/parcial-faltantes",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.parcialDe"
   },
   "titulo": "Con faltantes y tres controles",
   "fuente": "Chambers, Cleveland, Kleiner y Tukey (1983), Graphical Methods for Data Analysis; conjunto airquality de R",
   "clase": "A",
   "valores": 17,
   "difMax": 8.881784197001252e-15,
   "difEscaladaMax": 4.842494216153195e-14,
   "peor": "simple.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "cor(residuals(lm(x ~ controles)), residuals(lm(y ~ controles))); semiparciales con el residuo de una sola; psych::partial.r"
   }
  },
  {
   "id": "cor.parcialDe/parcial-mtcars",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.parcialDe"
   },
   "titulo": "Rendimiento y peso controlando la potencia",
   "fuente": "Henderson y Velleman (1981), Biometrics 37: 391-411; conjunto mtcars de R",
   "clase": "A",
   "valores": 17,
   "difMax": 1.0658141036401503e-14,
   "difEscaladaMax": 3.196317671072867e-15,
   "peor": "simple.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "cor(residuals(lm(x ~ controles)), residuals(lm(y ~ controles))); semiparciales con el residuo de una sola; psych::partial.r"
   }
  },
  {
   "id": "cor.parcialDe/parcial-swiss-spearman",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.parcialDe"
   },
   "titulo": "Lo mismo con Spearman",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 17,
   "difMax": 8.881784197001252e-16,
   "difEscaladaMax": 2.7530046537996124e-16,
   "peor": "parcial.t",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "cor(residuals(lm(x ~ controles)), residuals(lm(y ~ controles))); semiparciales con el residuo de una sola; psych::partial.r"
   }
  },
  {
   "id": "cor.parcialDe/parcial-swiss",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cor.parcialDe"
   },
   "titulo": "Fertilidad y educación, controlando agricultura y catolicismo",
   "fuente": "Mosteller y Tukey (1977), Data Analysis and Regression, pp. 549-551; conjunto swiss de R",
   "clase": "A",
   "valores": 17,
   "difMax": 2.6645352591003757e-15,
   "difEscaladaMax": 1.904707776881603e-15,
   "peor": "parcial.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "cor(residuals(lm(x ~ controles)), residuals(lm(y ~ controles))); semiparciales con el residuo de una sola; psych::partial.r"
   }
  },
  {
   "id": "cont.mcnemarDe/aprobacion-sin-correccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.mcnemarDe"
   },
   "titulo": "2 × 2 sin corrección",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 350 (aprobación presidencial; ejemplo de mcnemar.test)",
   "clase": "A",
   "valores": 4,
   "difMax": 3.1170812458958252e-19,
   "difEscaladaMax": 3.1170812458958252e-19,
   "peor": "p_exacta",
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
    "codigo": "mcnemar.test(tabla, correct = FALSE); binom.test(b, b + c)"
   }
  },
  {
   "id": "cont.mcnemarDe/aprobacion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.mcnemarDe"
   },
   "titulo": "2 × 2 con corrección y binomial exacta",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 350 (aprobación presidencial; ejemplo de mcnemar.test)",
   "clase": "A",
   "valores": 4,
   "difMax": 3.1170812458958252e-19,
   "difEscaladaMax": 3.1170812458958252e-19,
   "peor": "p_exacta",
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
    "codigo": "mcnemar.test(tabla, correct = TRUE); binom.test(b, b + c)"
   }
  },
  {
   "id": "cont.mcnemarDe/bowker",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.mcnemarDe"
   },
   "titulo": "3 × 3: simetría de Bowker",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 4,
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
    "codigo": "mcnemar.test(tabla, correct = TRUE); binom.test(b, b + c)"
   }
  },
  {
   "id": "cont.mcnemarDe/pocos-cambios",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.mcnemarDe"
   },
   "titulo": "2 × 2 con pocos casos discordantes",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 4,
   "difMax": 2.498001805406602e-16,
   "difEscaladaMax": 2.498001805406602e-16,
   "peor": "p_exacta",
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
    "codigo": "mcnemar.test(tabla, correct = TRUE); binom.test(b, b + c)"
   }
  },
  {
   "id": "cont.cmhDe/berkeley-sin-correccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.cmhDe"
   },
   "titulo": "Lo mismo sin corrección e IC al 90 %",
   "fuente": "Bickel, Hammel y O'Connell (1975), Science 187: 398-403; conjunto UCBAdmissions de R",
   "clase": "A",
   "valores": 36,
   "difMax": 4.796163466380676e-13,
   "difEscaladaMax": 2.5476949602378838e-14,
   "peor": "breslow_day.X2_tarone",
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
    "codigo": "mantelhaen.test(tabla, correct = FALSE, conf.level = 0.9); Breslow-Day por su fórmula"
   }
  },
  {
   "id": "cont.cmhDe/berkeley",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.cmhDe"
   },
   "titulo": "2 × 2 × 6: admisiones por departamento",
   "fuente": "Bickel, Hammel y O'Connell (1975), Science 187: 398-403; conjunto UCBAdmissions de R",
   "clase": "A",
   "valores": 36,
   "difMax": 4.796163466380676e-13,
   "difEscaladaMax": 2.5476949602378838e-14,
   "peor": "breslow_day.X2_tarone",
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
    "codigo": "mantelhaen.test(tabla, correct = TRUE, conf.level = 0.95); Breslow-Day por su fórmula"
   }
  },
  {
   "id": "cont.cmhDe/conejos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.cmhDe"
   },
   "titulo": "2 × 2 × 5 con celdas en cero",
   "fuente": "Mantel (1963), J. Am. Stat. Assoc. 58: 690-700 (penicilina en conejos; ejemplo de mantelhaen.test)",
   "clase": "A",
   "valores": 32,
   "difMax": 5.684341886080801e-13,
   "difEscaladaMax": 3.29438002539648e-15,
   "peor": "breslow_day.X2",
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
    "codigo": "mantelhaen.test(tabla, correct = TRUE, conf.level = 0.95); Breslow-Day por su fórmula"
   }
  },
  {
   "id": "cont.cmhDe/satisfaccion-sexo",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.cmhDe"
   },
   "titulo": "4 × 4 × 2: estadístico generalizado con 9 gl",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 287 (satisfacción por ingreso y sexo; ejemplo de mantelhaen.test)",
   "clase": "A",
   "valores": 7,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 2.5762174073034943e-16,
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
    "codigo": "mantelhaen.test(tabla, correct = TRUE, conf.level = 0.95); Breslow-Day por su fórmula"
   }
  },
  {
   "id": "cont.kappaDe/cohen-cuadratica",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.kappaDe"
   },
   "titulo": "3 categorías, ponderada cuadrática",
   "fuente": "Cohen (1968), Psychol. Bull. 70: 213-220 (ejemplo de psych::cohen.kappa, 200 casos)",
   "clase": "A",
   "valores": 12,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 3.689529005599475e-14,
   "peor": "ponderada.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "psych::cohen.kappa(tabla, w.exp = 2); z con la varianza nula de Fleiss, Cohen y Everitt (1969)"
   }
  },
  {
   "id": "cont.kappaDe/cohen-lineal",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.kappaDe"
   },
   "titulo": "3 categorías, ponderada lineal e IC al 90 %",
   "fuente": "Cohen (1968), Psychol. Bull. 70: 213-220 (ejemplo de psych::cohen.kappa, 200 casos)",
   "clase": "A",
   "valores": 12,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 4.6643181663200543e-14,
   "peor": "ponderada.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "psych::cohen.kappa(tabla, w.exp = 1); z con la varianza nula de Fleiss, Cohen y Everitt (1969)"
   }
  },
  {
   "id": "cont.kappaDe/dos-categorias",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.kappaDe"
   },
   "titulo": "2 × 2",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 350 (aprobación presidencial; ejemplo de mcnemar.test)",
   "clase": "A",
   "valores": 12,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 9.991788087164842e-14,
   "peor": "ponderada.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "psych::cohen.kappa(tabla, w.exp = 1); z con la varianza nula de Fleiss, Cohen y Everitt (1969)"
   }
  },
  {
   "id": "cont.kappaDe/severidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.kappaDe"
   },
   "titulo": "4 grados de severidad",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 12,
   "difMax": 2.3092638912203256e-14,
   "difEscaladaMax": 2.0395480461339062e-13,
   "peor": "ponderada.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "psych::cohen.kappa(tabla, w.exp = 2); z con la varianza nula de Fleiss, Cohen y Everitt (1969)"
   }
  },
  {
   "id": "cont.independenciaDe/con-cero",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "Una fila sin datos se descarta",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 24,
   "difMax": 8.596456879672587e-13,
   "difEscaladaMax": 8.596456879672587e-13,
   "peor": "fisher.p",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/dos-por-dos-sin-yates",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 grande sin Yates",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 21,
   "difMax": 1.3322676295501878e-14,
   "difEscaladaMax": 3.876190689440163e-15,
   "peor": "fisher.razon_momios",
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
    "codigo": "chisq.test(tabla, correct = FALSE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/dos-por-dos-yates",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 grande con Yates",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 21,
   "difMax": 1.3322676295501878e-14,
   "difEscaladaMax": 3.876190689440163e-15,
   "peor": "fisher.razon_momios",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/dos-por-tres",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 3 con Fisher",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 24,
   "difMax": 1.6082968290476174e-13,
   "difEscaladaMax": 1.6082968290476174e-13,
   "peor": "fisher.p",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/gemelos-crudos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 con una fila por caso",
   "fuente": "Fisher (1962), Confidence limits for a cross-product ratio, Aust. J. Stat. 4: 41 (gemelos y condenas; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 21,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "fisher.ic[1]",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/gemelos-menor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 con Fisher de una cola (menor) e IC al 99 %",
   "fuente": "Fisher (1962), Confidence limits for a cross-product ratio, Aust. J. Stat. 4: 41 (gemelos y condenas; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 21,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 7.216449660063518e-16,
   "peor": "fisher.ic[1]",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"less\", conf.level = 0.99)"
   }
  },
  {
   "id": "cont.independenciaDe/pelo-ojos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "4 × 4 con 592 casos (sin Fisher)",
   "fuente": "Snee (1974), Graphical display of two-way contingency tables, Am. Stat. 28: 9-12; conjunto HairEyeColor de R",
   "clase": "A",
   "valores": 53,
   "difMax": 2.2958874039497803e-40,
   "difEscaladaMax": 8.360697124362323e-15,
   "peor": "p_G2",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/satisfaccion-fisher",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "4 × 4 con Fisher exacta (22 millones de nodos)",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 21 (satisfacción laboral e ingreso; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 54,
   "difMax": 3.299582829185965e-13,
   "difEscaladaMax": 3.299582829185965e-13,
   "peor": "fisher.p",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/te-bilateral",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 con Fisher bilateral",
   "fuente": "Fisher (1935), The Design of Experiments (la dama que prueba el té; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 21,
   "difMax": 3.296918293926865e-12,
   "difEscaladaMax": 5.301076346211419e-15,
   "peor": "fisher.ic[1]",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/te-mayor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "2 × 2 con Fisher de una cola (mayor)",
   "fuente": "Fisher (1935), The Design of Experiments (la dama que prueba el té; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 21,
   "difMax": 1.2434497875801753e-14,
   "difEscaladaMax": 2.1371793224034263e-15,
   "peor": "fisher.p",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"greater\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.independenciaDe/tres-por-tres",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.independenciaDe"
   },
   "titulo": "3 × 3 con Fisher",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 33,
   "difMax": 1.1126516374915241e-13,
   "difEscaladaMax": 1.1126516374915241e-13,
   "peor": "fisher.p",
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
    "codigo": "chisq.test(tabla, correct = TRUE); G² = 2 Σ O log(O/E); fisher.test(tabla, alternative = \"two.sided\", conf.level = 0.95)"
   }
  },
  {
   "id": "cont.medidasDe/medidas-con-cero",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.medidasDe"
   },
   "titulo": "2 × 2 con una celda en cero (+0.5)",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 52,
   "difMax": 4.547473508864641e-13,
   "difEscaladaMax": 5.397826245009091e-16,
   "peor": "riesgo_relativo.ic[1]",
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
    "codigo": "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")"
   }
  },
  {
   "id": "cont.medidasDe/medidas-gemelos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.medidasDe"
   },
   "titulo": "2 × 2 con razón de momios y riesgo relativo",
   "fuente": "Fisher (1962), Confidence limits for a cross-product ratio, Aust. J. Stat. 4: 41 (gemelos y condenas; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 52,
   "difMax": 1.6653345369377348e-16,
   "difEscaladaMax": 1.6653345369377348e-16,
   "peor": "razon_momios.ic[1]",
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
    "codigo": "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")"
   }
  },
  {
   "id": "cont.medidasDe/medidas-movilidad",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.medidasDe"
   },
   "titulo": "8 × 8 ordinal (estatus del padre y del hijo)",
   "fuente": "Glass (1954), Social Mobility in Britain; conjunto occupationalStatus de R",
   "clase": "A",
   "valores": 44,
   "difMax": 2.498001805406602e-16,
   "difEscaladaMax": 2.498001805406602e-16,
   "peor": "incertidumbre_r_c",
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
    "codigo": "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")"
   }
  },
  {
   "id": "cont.medidasDe/medidas-pelo-ojos",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.medidasDe"
   },
   "titulo": "4 × 4 nominal",
   "fuente": "Snee (1974), Graphical display of two-way contingency tables, Am. Stat. 28: 9-12; conjunto HairEyeColor de R",
   "clase": "A",
   "valores": 44,
   "difMax": 5.551115123125783e-17,
   "difEscaladaMax": 5.551115123125783e-17,
   "peor": "gamma.ic[1]",
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
    "codigo": "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")"
   }
  },
  {
   "id": "cont.medidasDe/medidas-satisfaccion",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "cont.medidasDe"
   },
   "titulo": "4 × 4 ordinal",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 21 (satisfacción laboral e ingreso; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 44,
   "difMax": 3.920475055707584e-16,
   "difEscaladaMax": 3.920475055707584e-16,
   "peor": "incertidumbre_r_c",
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
    "codigo": "fórmulas de Agresti (2002) en R base; τ-b cotejada con cor(method = \"kendall\")"
   }
  },
  {
   "id": "mantel-haenszel/metodo-cmh-berkeley",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mantel-haenszel"
   },
   "titulo": "Cochran-Mantel-Haenszel con Breslow-Day",
   "fuente": "Bickel, Hammel y O'Connell (1975), Science 187: 398-403; conjunto UCBAdmissions de R",
   "clase": "A",
   "valores": 12,
   "difMax": 4.796163466380676e-13,
   "difEscaladaMax": 2.5476949602378838e-14,
   "peor": "breslow_day.X2_tarone",
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
    "codigo": "mantelhaen.test y Breslow-Day"
   }
  },
  {
   "id": "kappa/metodo-kappa-cohen",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kappa"
   },
   "titulo": "Kappa simple y ponderada",
   "fuente": "Cohen (1968), Psychol. Bull. 70: 213-220 (ejemplo de psych::cohen.kappa, 200 casos)",
   "clase": "A",
   "valores": 12,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 3.689529005599475e-14,
   "peor": "ponderada.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "psych": "2.4.12"
    },
    "codigo": "psych::cohen.kappa"
   }
  },
  {
   "id": "mcnemar/metodo-mcnemar",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mcnemar"
   },
   "titulo": "McNemar con binomial exacta",
   "fuente": "Agresti (1990), Categorical Data Analysis, p. 350 (aprobación presidencial; ejemplo de mcnemar.test)",
   "clase": "A",
   "valores": 4,
   "difMax": 3.1170812458958252e-19,
   "difEscaladaMax": 3.1170812458958252e-19,
   "peor": "p_exacta",
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
    "codigo": "mcnemar.test"
   }
  },
  {
   "id": "tabla-contingencia/metodo-tabla-gemelos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tabla-contingencia"
   },
   "titulo": "Tabla 2 × 2 con Fisher y medidas",
   "fuente": "Fisher (1962), Confidence limits for a cross-product ratio, Aust. J. Stat. 4: 41 (gemelos y condenas; ejemplo de fisher.test)",
   "clase": "A",
   "valores": 18,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "fisher.ic[1]",
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
    "codigo": "chisq.test, fisher.test y las medidas"
   }
  },
  {
   "id": "modeloLineal.analizarDe/co2-covariable-interaccion-tipo2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Un factor con su propia pendiente de una covariable (tratamiento × conc), SC tipo II",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 53,
   "difMax": 1.5120349416974932e-11,
   "difEscaladaMax": 2.4110859321498193e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(captacion ~ origen + tratamiento * conc); summary(m); car::Anova(m, type = 2); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/co2-covariable-interaccion-tipo3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "La misma interacción factor × covariable con SC tipo III",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 53,
   "difMax": 5.002220859751105e-12,
   "difEscaladaMax": 5.702874400380345e-14,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(captacion ~ origen + tratamiento * conc); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/co2-dosis-como-factor",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Concentración numérica tomada como factor de 7 niveles",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 88,
   "difMax": 9.094947017729282e-12,
   "difEscaladaMax": 1.8509250048035634e-13,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "factor(conc); lm(captacion ~ origen * tratamiento + conc); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/co2-faltantes-tipo3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Con cinco datos faltantes: las medias marginales ya no son las aritméticas",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 88,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 6.517778894149395e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "factor(conc); lm(captacion ~ origen * tratamiento + conc); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/co2-interacciones-dobles",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "(a + b + c)^2: efectos principales e interacciones dobles, sin la triple",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 144,
   "difMax": 1.1823431123048067e-11,
   "difEscaladaMax": 2.5335658061198676e-13,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "factor(conc); lm(captacion ~ (origen + tratamiento + conc)^2); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/fertilizante-anidado-tipo1",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Anidado escrito como término (fertilizante + fertilizante:parcela), SC tipo I",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 70,
   "difMax": 2.5011104298755527e-12,
   "difEscaladaMax": 4.7252599767943274e-14,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(altura ~ fertilizante + fertilizante:parcela); summary(m); anova(m); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/fertilizante-anidado-tipo3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Parcelas anidadas en fertilizante (fertilizante / parcela), SC tipo III",
   "fuente": "Datos sintéticos",
   "clase": "A",
   "valores": 70,
   "difMax": 8.526512829121202e-13,
   "difEscaladaMax": 4.3842618341391605e-14,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(altura ~ fertilizante / parcela); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/lana-desbalanceado-tipo1",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Factorial desbalanceado, SC tipo I en el orden escrito (tensión primero)",
   "fuente": "Tippett (1950), Technological Applications of Statistics, p. 106; conjunto warpbreaks de R",
   "clase": "A",
   "valores": 55,
   "difMax": 1.000444171950221e-11,
   "difEscaladaMax": 4.544795863703486e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(roturas ~ tension * lana); summary(m); anova(m); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/lana-desbalanceado-tipo2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Factorial desbalanceado (seis datos menos), SC tipo II",
   "fuente": "Tippett (1950), Technological Applications of Statistics, p. 106; conjunto warpbreaks de R",
   "clase": "A",
   "valores": 55,
   "difMax": 5.4569682106375694e-12,
   "difEscaladaMax": 5.589321074432463e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(roturas ~ lana * tension); summary(m); car::Anova(m, type = 2); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/lana-factorial-tipo3",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Factorial 2 × 3 balanceado, SC tipo III",
   "fuente": "Tippett (1950), Technological Applications of Statistics, p. 106; conjunto warpbreaks de R",
   "clase": "A",
   "valores": 55,
   "difMax": 2.7284841053187847e-12,
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
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(roturas ~ lana * tension); summary(m); options(contrasts = c(\"contr.sum\", \"contr.poly\")); car::Anova(m, type = 3); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/lana-sin-intercepto",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Sin intercepto («- 1»): una media por tensión, SC tipo I y R² sin centrar",
   "fuente": "Tippett (1950), Technological Applications of Statistics, p. 106; conjunto warpbreaks de R",
   "clase": "A",
   "valores": 43,
   "difMax": 2.7284841053187847e-12,
   "difEscaladaMax": 1.2805782199174683e-14,
   "peor": "coeficientes.p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(roturas ~ tension + lana - 1); summary(m); anova(m); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/planta-superficie-tipo1",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "Producto de dos covariables (aire × agua) más una tercera, SC tipo I",
   "fuente": "Brownlee (1960), Statistical Theory and Methodology in Science and Engineering; conjunto stackloss de R",
   "clase": "A",
   "valores": 43,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 3.3458600725398254e-14,
   "peor": "anova.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(perdida ~ aire * agua + acido); summary(m); anova(m); emmeans(m, factor)"
   }
  },
  {
   "id": "modeloLineal.analizarDe/planta-superficie-tipo2",
   "objetivo": {
    "tipo": "funcion",
    "nombre": "modeloLineal.analizarDe"
   },
   "titulo": "El mismo modelo con SC tipo II",
   "fuente": "Brownlee (1960), Statistical Theory and Methodology in Science and Engineering; conjunto stackloss de R",
   "clase": "A",
   "valores": 43,
   "difMax": 5.4569682106375694e-12,
   "difEscaladaMax": 2.7505814285505628e-14,
   "peor": "coeficientes.estimado[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(perdida ~ aire * agua + acido); summary(m); car::Anova(m, type = 2); emmeans(m, factor)"
   }
  },
  {
   "id": "modelo-lineal/metodo-modelo-lineal-co2",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-lineal"
   },
   "titulo": "Modelo lineal general con una numérica como factor: ANOVA III, coeficientes y medias con IC",
   "fuente": "Potvin, Lechowicz y Tardif (1990), Ecology 71: 1389-1400; conjunto CO2 de R",
   "clase": "A",
   "valores": 116,
   "difMax": 9.094947017729282e-12,
   "difEscaladaMax": 1.8509250048035634e-13,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "lm(captacion ~ origen * tratamiento + factor(conc)); car::Anova(type = 3) con contr.sum; summary(m); confint(emmeans(m, factor))"
   }
  },
  {
   "id": "arima/airline-pasajeros",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "Pasajeros aéreos (log): SARIMA(0, 1, 1)(0, 1, 1)12, el modelo «airline»",
   "fuente": "datasets::AirPassengers de R (Box y Jenkins, 1976); referencia: stats::arima en su óptimo",
   "clase": "D",
   "valores": 255,
   "difMax": 0.000004730658666574072,
   "difEscaladaMax": 0.0000014065049178668687,
   "peor": "coef[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "coef[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "ee[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "residuos[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "pronostico.*": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "box.*": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "sigma2": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "arima(x, order = c(0, 1, 1), seasonal = list(order = c(0, 1, 1), period = 12), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/ar1-faltantes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "AR(1) con cuatro faltantes dentro de la serie",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 183,
   "difMax": 2.0200687345095503e-8,
   "difEscaladaMax": 9.9250376806026e-9,
   "peor": "residuos[71]",
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
    "codigo": "arima(x, order = c(1, 0, 0), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/ar1-media",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "AR(1) con media, pronóstico a 12 años",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 183,
   "difMax": 4.3699877494418615e-8,
   "difEscaladaMax": 2.9282002600439228e-8,
   "peor": "residuos[33]",
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
    "codigo": "arima(x, order = c(1, 0, 0), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/arima111",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "ARIMA(1, 1, 1)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 139,
   "difMax": 0.000004523842628501029,
   "difEscaladaMax": 0.0000013306203712204479,
   "peor": "residuos[31]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "coef[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "ee[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "residuos[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "pronostico.*": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "box.*": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "sigma2": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "arima(x, order = c(1, 1, 1), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/arma21-desordenada",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "ARMA(2, 1) con media, filas desordenadas que se ordenan por el tiempo, 90 %",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 203,
   "difMax": 5.119291213162569e-9,
   "difEscaladaMax": 4.745896768647499e-9,
   "peor": "residuos[83]",
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
    "codigo": "arima(x, order = c(2, 0, 1), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/busqueda-aic",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "Búsqueda del orden por AIC entre p, q = 0, 1, 2 (ARMA con media)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 171,
   "difMax": 7.193562723273317e-8,
   "difEscaladaMax": 6.966079424408633e-8,
   "peor": "residuos[84]",
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
    "codigo": "arima(x, order = c(1, 0, 0), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/ima11",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "IMA(1, 1): una diferencia y una media móvil",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 160,
   "difMax": 1.2657681480732208e-7,
   "difEscaladaMax": 1.164224627814292e-8,
   "peor": "residuos[30]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "coef[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "ee[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "residuos[*]": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "pronostico.*": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "box.*": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "sigma2": {
      "tol": 0.00001,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "arima(x, order = c(0, 1, 1), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/lago-huron-ar2",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "Nivel del lago Hurón: AR(2) con media",
   "fuente": "datasets::LakeHuron de R (Brockwell y Davis, 1991); referencia: stats::arima en su óptimo",
   "clase": "D",
   "valores": 156,
   "difMax": 1.0438157005410176e-8,
   "difEscaladaMax": 4.637809580820829e-9,
   "peor": "residuos[0]",
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
    "codigo": "arima(x, order = c(2, 0, 0), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/ma2-sin-media",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "MA(2) sin media y sin columna de tiempo",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 115,
   "difMax": 4.739957759625213e-9,
   "difEscaladaMax": 4.046116774958364e-9,
   "peor": "residuos[22]",
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
    "codigo": "arima(x, order = c(0, 0, 2), seasonal = list(order = c(0, 0, 0), period = 1), include.mean = FALSE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "arima/sarima-diferencia-estacional",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "arima"
   },
   "titulo": "SARIMA(1, 0, 0)(0, 1, 1)12: diferencia estacional y media móvil estacional",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::arima en su óptimo, predict y Box.test",
   "clase": "D",
   "valores": 159,
   "difMax": 0.00009592327856466909,
   "difEscaladaMax": 0.000024564204685412263,
   "peor": "residuos[78]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "coef[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "ee[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "residuos[*]": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "pronostico.*": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "box.*": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     },
     "sigma2": {
      "tol": 0.00005,
      "motivo": "con diferenciación, arima usa la inicial difusa κ = 1e6 y la verosimilitud trae un ruido de ~1e-13 (en R y en SigmaPro): el óptimo solo queda fijo a ~1e-6 (con diferencia estacional hay d + D·s estados difusos y el ruido crece: 5e-5)"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2"
    },
    "codigo": "arima(x, order = c(1, 0, 0), seasonal = list(order = c(0, 1, 1), period = 12), include.mean = TRUE) en su óptimo; predict; Box.test"
   }
  },
  {
   "id": "glm-proporciones/bajo-peso-binaria",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-proporciones"
   },
   "titulo": "Respuesta 0/1 con dos factores numéricos y una covariable (la automática se queda en binomial)",
   "fuente": "Hosmer y Lemeshow (1989), Applied Logistic Regression; conjunto birthwt de MASS",
   "clase": "D",
   "valores": 125,
   "difMax": 0.000001348996477190667,
   "difEscaladaMax": 7.409759751967725e-8,
   "peor": "razones.ic_sup[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(bajo ~ peso_madre + raza * fuma, family = binomial(link = logit)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-proporciones/germinacion-automatica",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-proporciones"
   },
   "titulo": "Germinadas de 50 en bloques: la automática pasa a cuasibinomial",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 137,
   "difMax": 8.091305403468141e-13,
   "difEscaladaMax": 3.5743770305144997e-13,
   "peor": "medias[0].pares[2].estadistico",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(germinadas ~ bloque + trat, family = cuasibinomial(link = logit)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-proporciones/germinacion-probit-tipo3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-proporciones"
   },
   "titulo": "Germinadas de 50 con enlace probit, binomial y tipo III",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 110,
   "difMax": 2.3169208773765604e-9,
   "difEscaladaMax": 5.976294136533389e-10,
   "peor": "coeficientes.estadistico[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(germinadas ~ bloque + trat, family = binomial(link = probit)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm/caracoles-binomial",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm"
   },
   "titulo": "Mortalidad de caracoles: binomial con ensayos, factores numéricos y una covariable",
   "fuente": "Venables y Ripley (2002), Modern Applied Statistics with S; conjunto snails de MASS (exposición de 2 a 4 semanas)",
   "clase": "D",
   "valores": 116,
   "difMax": 2.913225216616411e-13,
   "difEscaladaMax": 9.916928761900114e-13,
   "peor": "coeficientes.p[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(Deaths ~ Species + Exposure + Rel.Hum + Temp, family = binomial(link = logit)); tipo 2; emmeans"
   }
  },
  {
   "id": "glm/escarabajos-cloglog",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm"
   },
   "titulo": "Dosis-respuesta con enlace log-log complementario",
   "fuente": "Bliss (1935), Annals of Applied Biology 22: 134-167: mortalidad de escarabajos con disulfuro de carbono",
   "clase": "D",
   "valores": 27,
   "difMax": 7.005951374594588e-11,
   "difEscaladaMax": 2.6672975089977713e-10,
   "peor": "coeficientes.p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(muertos ~ dosis, family = binomial(link = cloglog)); tipo 2; emmeans"
   }
  },
  {
   "id": "glm/quine-binomial-negativa",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm"
   },
   "titulo": "Días de ausencia escolar: cuatro factores, binomial negativa, tipo II",
   "fuente": "Aitkin (1978), J. R. Stat. Soc. A 141: 195-223; conjunto quine de MASS (Venables y Ripley 2002)",
   "clase": "D",
   "valores": 149,
   "difMax": 2.724220848904224e-11,
   "difEscaladaMax": 5.843277665162661e-11,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(Days ~ Eth + Sex + Age + Lrn, family = binomial-negativa(link = log)); tipo 2; emmeans"
   }
  },
  {
   "id": "glm/roturas-cuasipoisson-tipo1",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm"
   },
   "titulo": "Análisis de devianza secuencial (tipo I) con cuasi-Poisson y la interacción",
   "fuente": "Tippett (1950), Technological Applications of Statistics; conjunto warpbreaks de R",
   "clase": "D",
   "valores": 148,
   "difMax": 4.887823479293729e-11,
   "difEscaladaMax": 5.8100053413360534e-11,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(breaks ~ wool * tension, family = cuasipoisson(link = log)); tipo 1; emmeans"
   }
  },
  {
   "id": "glm/seguros-exposicion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm"
   },
   "titulo": "Reclamaciones por asegurado: Poisson con el número de asegurados como exposición",
   "fuente": "Baxter, Coutts y Ross (1980); conjunto Insurance de MASS (factores ordenados tomados como nominales)",
   "clase": "D",
   "valores": 166,
   "difMax": 7.105427357601002e-13,
   "difEscaladaMax": 1.1102230246251565e-10,
   "peor": "medias[0].pares[1].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(Claims ~ District + Group + Age, family = poisson(link = log)); tipo 2; emmeans"
   }
  },
  {
   "id": "glm-gamma/coagulacion-inverso",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-gamma"
   },
   "titulo": "Tiempo de coagulación con la concentración (log) como covariable, enlace inverso",
   "fuente": "McCullagh y Nelder (1989), Generalized Linear Models, sección 8.4.2: tiempos de coagulación",
   "clase": "D",
   "valores": 56,
   "difMax": 1.893596390800667e-12,
   "difEscaladaMax": 1.025441432873725e-12,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(tiempo ~ log_u + lote, family = gamma(link = inverso)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-gamma/dias-germinacion-log",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-gamma"
   },
   "titulo": "Días a germinación en bloques, gamma con enlace log (razones de medias)",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 145,
   "difMax": 7.105427357601002e-14,
   "difEscaladaMax": 4.910126158443813e-15,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(dias ~ bloque + trat, family = gamma(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-conteos/insectos-automatica",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-conteos"
   },
   "titulo": "Seis insecticidas: la familia automática pasa a binomial negativa por la sobredispersión",
   "fuente": "Beall (1942), Biometrika 32: 243-262; conjunto InsectSprays de R",
   "clase": "D",
   "valores": 185,
   "difMax": 1.858779796748422e-11,
   "difEscaladaMax": 1.1102230246251565e-10,
   "peor": "medias[0].pares[2].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(count ~ spray, family = binomial-negativa(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-conteos/insectos-cuasipoisson",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-conteos"
   },
   "titulo": "Seis insecticidas con cuasi-Poisson (pruebas F y dispersión de Pearson), Holm",
   "fuente": "Beall (1942), Biometrika 32: 243-262; conjunto InsectSprays de R",
   "clase": "D",
   "valores": 183,
   "difMax": 2.823519196226698e-12,
   "difEscaladaMax": 2.288440252914879e-11,
   "peor": "medias[0].pares[11].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(count ~ spray, family = cuasipoisson(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"holm\")"
   }
  },
  {
   "id": "glm-conteos/plantulas-exposicion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-conteos"
   },
   "titulo": "Plántulas por parcela con área muestreada distinta (desplazamiento log) en bloques; la automática se queda en Poisson",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 172,
   "difMax": 1.1368683772161603e-13,
   "difEscaladaMax": 3.1009772262943356e-13,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(plantulas ~ bloque + trat, family = poisson(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "glm-conteos/roturas-poisson-tipo3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-conteos"
   },
   "titulo": "Dos factores con interacción, Poisson, tipo III y tensión dentro de cada lana (Bonferroni)",
   "fuente": "Tippett (1950), Technological Applications of Statistics; conjunto warpbreaks de R",
   "clase": "D",
   "valores": 148,
   "difMax": 2.502247298252769e-10,
   "difEscaladaMax": 2.0930617502596207e-10,
   "peor": "medias[0].pares[1].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(breaks ~ wool * tension, family = poisson(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"bonferroni\")"
   }
  },
  {
   "id": "glm-conteos/trips-dosis-numericas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glm-conteos"
   },
   "titulo": "Trips con la dosis y el bloque numéricos tomados como factores, binomial negativa",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 139,
   "difMax": 1.2278178473934531e-11,
   "difEscaladaMax": 1.8111766472672054e-11,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p de Tukey = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "stats": "4.4.2",
     "MASS": "7.3.61",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glm(trips ~ bloque + dosis, family = binomial-negativa(link = log)) [MASS::glm.nb con la binomial negativa]; car::Anova / anova; emmeans(type = \"response\", offset = 0); pairs(adjust = \"tukey\")"
   }
  },
  {
   "id": "componentes-varianza/alfa-genotipos-fijos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Repeticiones y bloques dentro de ellas aleatorios, con los genotipos fijos",
   "fuente": "Ensayo en alfa-látice (24 genotipos, 3 repeticiones); conjunto data_alpha de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 25,
   "difMax": 1.1226575225009583e-11,
   "difEscaladaMax": 1.939129404162397e-12,
   "peor": "lrt[1].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(YIELD ~ GEN + (1 | REP) + (1 | REP:BLOCK), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/dyestuff-una-via",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Una vía: lotes aleatorios (balanceado)",
   "fuente": "Davies y Goldsmith (1972), Statistical Methods in Research and Production; conjunto Dyestuff de lme4",
   "clase": "D",
   "valores": 17,
   "difMax": 1.3642420526593924e-11,
   "difEscaladaMax": 1.2941362168414066e-12,
   "peor": "lrt[0].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(Yield ~ 1 + (1 | Batch), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/dyestuff2-frontera",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Una vía con la varianza entre lotes en cero (frontera)",
   "fuente": "Box y Tiao (1973), Bayesian Inference in Statistical Analysis; conjunto Dyestuff2 de lme4",
   "clase": "D",
   "valores": 17,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.2248322514159625e-15,
   "peor": "componentes[1].ee",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(Yield ~ 1 + (1 | Batch), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/ge-cruzados-interaccion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Genotipos y ambientes aleatorios con su interacción",
   "fuente": "Ensayo multiambiente (10 genotipos, 14 ambientes, 3 repeticiones); conjunto data_ge de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 33,
   "difMax": 2.021351974690333e-10,
   "difEscaladaMax": 4.207242332015444e-11,
   "peor": "lrt[2].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(GY ~ 1 + (1 | GEN) + (1 | ENV) + (1 | GEN:ENV), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/pastas-anidados-desbalanceado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Anidados con ocho muestras menos (desbalanceado)",
   "fuente": "Davies y Goldsmith (1972); conjunto Pastes de lme4",
   "clase": "D",
   "valores": 25,
   "difMax": 5.4285465012071654e-11,
   "difEscaladaMax": 5.4285465012071654e-11,
   "peor": "lrt[0].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(strength ~ 1 + (1 | batch) + (1 | batch:cask), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/pastas-anidados",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Barriles dentro de lotes (anidados; el barril se numera de nuevo en cada lote)",
   "fuente": "Davies y Goldsmith (1972); conjunto Pastes de lme4",
   "clase": "D",
   "valores": 25,
   "difMax": 4.0657255340192933e-10,
   "difEscaladaMax": 4.0657255340192933e-10,
   "peor": "lrt[0].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(strength ~ 1 + (1 | batch) + (1 | batch:cask), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "componentes-varianza/penicilina-cruzados",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "componentes-varianza"
   },
   "titulo": "Dos factores aleatorios cruzados (placa y muestra)",
   "fuente": "Davies y Goldsmith (1972); conjunto Penicillin de lme4",
   "clase": "D",
   "valores": 25,
   "difMax": 1.9747403712244704e-10,
   "difEscaladaMax": 9.898280129047101e-11,
   "peor": "lrt[1].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(diameter ~ 1 + (1 | plate) + (1 | sample), REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término"
   }
  },
  {
   "id": "heredabilidad/alfa-latice-desbalanceado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Alfa-látice con cinco parcelas perdidas; selección del 20 %",
   "fuente": "Ensayo en alfa-látice (24 genotipos, 3 repeticiones); conjunto data_alpha de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 214,
   "difMax": 4.703792910731863e-12,
   "difEscaladaMax": 2.4290609201481805e-12,
   "peor": "lrt[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(YIELD ~ REP + (1 | GEN) + (1 | REP:BLOCK), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.2 (mayor)"
   }
  },
  {
   "id": "heredabilidad/alfa-latice",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Alfa-látice: genotipos y bloques incompletos aleatorios, repeticiones fijas",
   "fuente": "Ensayo en alfa-látice (24 genotipos, 3 repeticiones); conjunto data_alpha de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 211,
   "difMax": 1.1027623258996755e-11,
   "difEscaladaMax": 5.728404540601857e-12,
   "peor": "lrt[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(YIELD ~ REP + (1 | GEN) + (1 | REP:BLOCK), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.1 (mayor)"
   }
  },
  {
   "id": "heredabilidad/bloques-un-ambiente-menor",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Bloques completos en un ambiente; se selecciona la menor altura de mazorca (25 %)",
   "fuente": "Ensayo multiambiente (13 híbridos de maíz, 4 ambientes, 3 repeticiones); conjunto data_ge2 de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 128,
   "difMax": 8.597567102697212e-12,
   "difEscaladaMax": 2.643760675926504e-12,
   "peor": "lrt[0].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(EH ~ REP + (1 | GEN), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.25 (menor)"
   }
  },
  {
   "id": "heredabilidad/completamente-al-azar",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Completamente al azar con repeticiones desiguales (sin bloques)",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 121,
   "difMax": 1.0373923942097463e-11,
   "difEscaladaMax": 1.4065275813372018e-12,
   "peor": "lrt[0].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(peso ~ 1 + (1 | linea), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con linea fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.25 (mayor)"
   }
  },
  {
   "id": "heredabilidad/multiambiente-desbalanceado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Varios ambientes con parcelas perdidas y un híbrido ausente en un ambiente",
   "fuente": "Ensayo multiambiente (13 híbridos de maíz, 4 ambientes, 3 repeticiones); conjunto data_ge2 de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 134,
   "difMax": 2.2793489318218008e-11,
   "difEscaladaMax": 2.2793489318218008e-11,
   "peor": "lrt[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(KW ~ ENV + ENV:REP + (1 | GEN) + (1 | GEN:ENV), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.15 (mayor)"
   }
  },
  {
   "id": "heredabilidad/multiambiente-varianza-genetica-cero",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Varianza genética en cero: toda la variación genética está en la interacción",
   "fuente": "Ensayo multiambiente (13 híbridos de maíz, 4 ambientes, 3 repeticiones); conjunto data_ge2 de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 133,
   "difMax": 3.7061909097246826e-11,
   "difEscaladaMax": 1.5724821278707846e-12,
   "peor": "lrt[1].chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(EP ~ ENV + ENV:REP + (1 | GEN) + (1 | GEN:ENV), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.1 (mayor)"
   }
  },
  {
   "id": "heredabilidad/multiambiente",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "heredabilidad"
   },
   "titulo": "Varios ambientes: repeticiones dentro de ambientes fijas, genotipo × ambiente aleatorio",
   "fuente": "Ensayo multiambiente (10 genotipos, 14 ambientes, 3 repeticiones); conjunto data_ge de metan (Olivoto y Lúcio 2020)",
   "clase": "D",
   "valores": 113,
   "difMax": 7.87281351222191e-11,
   "difEscaladaMax": 4.020712589417227e-11,
   "peor": "lrt[1].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(GY ~ ENV + ENV:REP + (1 | GEN) + (1 | GEN:ENV), REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con GEN fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección 0.2 (mayor)"
   }
  },
  {
   "id": "repetibilidad/arboles-cosechas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "repetibilidad"
   },
   "titulo": "Veinte árboles en cuatro cosechas, con cinco faltantes y la cosecha fija",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 110,
   "difMax": 4.774847184307873e-12,
   "difEscaladaMax": 9.84999014781768e-13,
   "peor": "lrt[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(rendimiento ~ cosecha + (1 | arbol), REML = TRUE) pulido; r = σ²i/(σ²i + σ²e); R² = m·r/(1 + (m − 1)·r); η = R²(1 − r)/((1 − R²)r)"
   }
  },
  {
   "id": "repetibilidad/ergostool-tipo-fijo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "repetibilidad"
   },
   "titulo": "Esfuerzo de nueve personas en cuatro bancos (tipo de banco fijo)",
   "fuente": "Pinheiro y Bates (2000), Mixed-Effects Models in S and S-PLUS; conjunto ergoStool de nlme",
   "clase": "D",
   "valores": 66,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 6.161737786669619e-15,
   "peor": "blup[3].u",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(effort ~ Type + (1 | Subject), REML = TRUE) pulido; r = σ²i/(σ²i + σ²e); R² = m·r/(1 + (m − 1)·r); η = R²(1 − r)/((1 − R²)r)"
   }
  },
  {
   "id": "repetibilidad/rieles",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "repetibilidad"
   },
   "titulo": "Seis rieles medidos tres veces cada uno (sin efectos fijos)",
   "fuente": "Devore (2000), Probability and Statistics for Engineering and the Sciences; conjunto Rail de nlme (Pinheiro y Bates 2000)",
   "clase": "D",
   "valores": 54,
   "difMax": 7.901235221652314e-12,
   "difEscaladaMax": 1.0956570958897009e-13,
   "peor": "lrt[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "stats": "4.4.2"
    },
    "codigo": "lmer(travel ~ 1 + (1 | Rail), REML = TRUE) pulido; r = σ²i/(σ²i + σ²e); R² = m·r/(1 + (m − 1)·r); η = R²(1 − r)/((1 − R²)r)"
   }
  },
  {
   "id": "glmm/garrapatas-poisson",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm"
   },
   "titulo": "Garrapatas por pollo: Poisson con nidada y localidad aleatorias y una covariable",
   "fuente": "Elston et al. (2001), Parasitology 122: 563-569; conjunto grouseticks de lme4 (altura centrada y escalada)",
   "clase": "D",
   "valores": 91,
   "difMax": 0.0001436029605841327,
   "difEscaladaMax": 0.000004071746832135441,
   "peor": "coeficientes.z[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.ee[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "coeficientes.z[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "razones.ic_inf[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "razones.ic_sup[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "wald.chi2[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "medias[*].filas[*].ee": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "medias[*].filas[*].ee_eta": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "medias[*].filas[*].ic[*]": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "medias[*].pares[*].ee": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     },
     "medias[*].pares[*].estadistico": {
      "tol": 0.00001,
      "motivo": "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(TICKS ~ YEAR + altura + (1 | BROOD) + (1 | LOCATION), family = poisson(link = \"log\"), control = glmerControl(optimizer = \"bobyqa\", tolPwrss = 1e-12, optCtrl = list(rhoend = 1e-12))); car::Anova(type = 2); emmeans(type = \"response\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm/vacas-binomial",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm"
   },
   "titulo": "Incidencia de pleuroneumonía por periodo con los hatos aleatorios (binomial con ensayos; la automática no agrega el efecto por observación)",
   "fuente": "Lesnoff et al. (2004), Journal of Applied Ecology 41: 31-41; conjunto cbpp de lme4",
   "clase": "D",
   "valores": 107,
   "difMax": 0.000009463306351875644,
   "difEscaladaMax": 6.13060139418007e-7,
   "peor": "coeficientes.z[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(incidence ~ period + (1 | herd), family = binomial(link = \"logit\"), control = glmerControl(optimizer = \"bobyqa\", tolPwrss = 1e-12, optCtrl = list(rhoend = 1e-12))); car::Anova(type = 2); emmeans(type = \"response\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm/vacas-observacion-tipo3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm"
   },
   "titulo": "La misma con el efecto por observación pedido y pruebas de Wald tipo III",
   "fuente": "Lesnoff et al. (2004), Journal of Applied Ecology 41: 31-41; conjunto cbpp de lme4",
   "clase": "D",
   "valores": 109,
   "difMax": 0.000002702903899809428,
   "difEscaladaMax": 8.59724330791052e-7,
   "peor": "coeficientes.z[3]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(incidence ~ period + (1 | herd), family = binomial(link = \"logit\"), control = glmerControl(optimizer = \"bobyqa\", tolPwrss = 1e-12, optCtrl = list(rhoend = 1e-12))); car::Anova(type = 3); emmeans(type = \"response\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm-bloques/germinacion-probit",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm-bloques"
   },
   "titulo": "Germinadas de 40 en bloques aleatorios, enlace probit",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 89,
   "difMax": 0.0000023717479180618284,
   "difEscaladaMax": 7.099690313427942e-8,
   "peor": "coeficientes.z[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(germinadas ~ trat + (1 | bloque), family = binomial(link = \"probit\")) con el efecto por observación «auto»; car::Anova(type = 2); emmeans"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm-bloques/larvas-binomial-negativa",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm-bloques"
   },
   "titulo": "Larvas con dos factores cruzados, binomial negativa, tipo III y variedad dentro de cada riego",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 146,
   "difMax": 0.0000058607192201520775,
   "difEscaladaMax": 5.846696697342502e-7,
   "peor": "coeficientes.z[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(larvas ~ variedad * riego + (1 | bloque), family = binomial-negativa(link = \"log\")) con el efecto por observación «auto»; car::Anova(type = 3); emmeans"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm-bloques/malezas-exposicion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm-bloques"
   },
   "titulo": "Malezas en áreas muestreadas distintas (exposición) sin el efecto por observación",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 77,
   "difMax": 0.0000034838596292274815,
   "difEscaladaMax": 4.232156126212661e-8,
   "peor": "coeficientes.z[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(malezas ~ trat + (1 | bloque), family = poisson(link = \"log\")) con el efecto por observación «no»; car::Anova(type = 2); emmeans"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm-bloques/pulgones-automatica",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm-bloques"
   },
   "titulo": "Pulgones por planta en bloques numerados: la automática agrega el efecto por observación",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 144,
   "difMax": 0.000007929025677810841,
   "difEscaladaMax": 2.250630013294564e-7,
   "peor": "medias[0].filas[0].ee",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(pulgones ~ trat + (1 | bloque), family = poisson(link = \"log\")) con el efecto por observación «auto»; car::Anova(type = 2); emmeans"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "glmm-bloques/trips-aguacate-singular",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "glmm-bloques"
   },
   "titulo": "Trips del ejemplo del aguacate: efecto por observación automático y bloques con varianza en cero (ajuste singular, EE de RX)",
   "fuente": "Ejemplo ficticio de SigmaPro «Aguacate» (datos/generar-ejemplos.R)",
   "clase": "D",
   "valores": 144,
   "difMax": 1.1203370720025418e-7,
   "difEscaladaMax": 5.290165969988903e-8,
   "peor": "obs.razon",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-10,
      "motivo": "p de Tukey (integral numérica) y los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "coeficientes.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     },
     "wald.p[*]": {
      "absoluto": 1e-10,
      "motivo": "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "car": "3.1.3",
     "emmeans": "1.10.6"
    },
    "codigo": "glmer(trips ~ tratamiento + (1 | bloque), family = poisson(link = \"log\")) con el efecto por observación «auto»; car::Anova(type = 2); emmeans"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "car": "3.1.5",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/maiz-altura-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "Con bloques; la planta se numera de nuevo en cada tratamiento (la unidad es planta × tratamiento × bloque)",
   "fuente": "Ejemplo ficticio de SigmaPro «Maíz: altura en cinco fechas» (datos/generar-ejemplos.R)",
   "clase": "D",
   "valores": 515,
   "difMax": 9.322320693172514e-12,
   "difEscaladaMax": 2.651234506088716e-14,
   "peor": "estructuras[6].logLik",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(altura ~ tratamiento * dds + bloque, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | dds) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/orthodont-automatica",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "Siete estructuras candidatas, elegida por AIC; sexo comparado en cada edad",
   "fuente": "Potthoff y Roy (1964), Biometrika 51: 313-326; conjunto Orthodont de nlme",
   "clase": "D",
   "valores": 189,
   "difMax": 9.672021406004205e-9,
   "difEscaladaMax": 2.2362908857803197e-11,
   "peor": "estructuras[4].logLik",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(distancia ~ sexo * edad, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | edad) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/orthodont-faltantes-bic",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "Tres mediciones faltantes; estructura elegida por BIC",
   "fuente": "Potthoff y Roy (1964), Biometrika 51: 313-326; conjunto Orthodont de nlme",
   "clase": "D",
   "valores": 189,
   "difMax": 1.7053025658242404e-12,
   "difEscaladaMax": 4.220995646852216e-15,
   "peor": "estructuras[6].logLik",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(distancia ~ sexo * edad, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | edad) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/orthodont-no-estructurada",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "No estructurada pedida; medias de la edad (todas las unidades) con Holm",
   "fuente": "Potthoff y Roy (1964), Biometrika 51: 313-326; conjunto Orthodont de nlme",
   "clase": "D",
   "valores": 189,
   "difMax": 6.320102841073094e-8,
   "difEscaladaMax": 8.600378709585246e-8,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(distancia ~ sexo * edad, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | edad) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"holm\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/ratas-fechas-desiguales",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "Once fechas desiguales (días 1 a 64): AR(1) continua entre las candidatas; dieta en cada día",
   "fuente": "Crowder y Hand (1990), Analysis of Repeated Measures; conjunto BodyWeight de nlme",
   "clase": "D",
   "valores": 740,
   "difMax": 0.000004008687483292306,
   "difEscaladaMax": 1.4340374072715713e-7,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(peso ~ dieta * dia, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | dia) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "medidas-repetidas/sueno-sin-tratamientos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "medidas-repetidas"
   },
   "titulo": "Sin tratamientos: diez días (la no estructurada no entra sola con más de ocho fechas); medias de cada día",
   "fuente": "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4",
   "clase": "D",
   "valores": 548,
   "difMax": 0.000009085153578780591,
   "difEscaladaMax": 5.8861386555458376e-8,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "nlme": "3.1.166",
     "emmeans": "1.10.6"
    },
    "codigo": "gls(reaccion ~ dias, correlation = <cada estructura> (form = ~ orden | unidad), weights = varIdent(~ 1 | dias) en las heterogéneas, method = \"REML\"); AIC/BIC; anova(type = \"marginal\"); emmeans(mode = \"df.error\", df = N - p); pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "nlme": "3.1.169",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-latice/alfa-latice-repeticiones-aleatorias",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-latice"
   },
   "titulo": "El mismo alfa-látice con las repeticiones también aleatorias",
   "fuente": "Olivoto y Lúcio (2020), Methods in Ecology and Evolution 11: 783-789; conjunto data_alpha de metan (alfa-látice)",
   "clase": "D",
   "valores": 2098,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 4.440892098500626e-16,
   "peor": "medias[0].pares[60].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rend ~ genotipo + (1 | repeticion) + (1 | repeticion:bloque), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"genotipo\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-latice/alfa-latice",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-latice"
   },
   "titulo": "Alfa-látice de 24 genotipos: repeticiones fijas y bloques incompletos aleatorios",
   "fuente": "Olivoto y Lúcio (2020), Methods in Ecology and Evolution 11: 783-789; conjunto data_alpha de metan (alfa-látice)",
   "clase": "D",
   "valores": 2090,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 4.990402344761076e-16,
   "peor": "anova.sc[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rend ~ genotipo + repeticion + (1 | repeticion:bloque), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"genotipo\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-localidades/avena-14-ambientes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-localidades"
   },
   "titulo": "Diez genotipos de avena en 14 ambientes: ambiente, repetición dentro de ambiente y G × A aleatorios",
   "fuente": "Olivoto y Lúcio (2020), Methods in Ecology and Evolution 11: 783-789; conjunto data_ge de metan (avena en 14 ambientes)",
   "clase": "D",
   "valores": 1431,
   "difMax": 1.3073986337985843e-12,
   "difEscaladaMax": 1.1174349031257302e-14,
   "peor": "anova.gl2[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rend ~ genotipo + (1 | localidad) + (1 | localidad:repeticion) + (1 | genotipo:localidad), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"genotipo\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-localidades/papa-localidades-fijas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-localidades"
   },
   "titulo": "Clones de papa en 6 localidades fijas (genotipo × localidad fijos), repetición numérica dentro de localidad",
   "fuente": "Centro Internacional de la Papa; conjunto plrv de agricolae (de Mendiburu, 2023): clones de papa en 6 localidades",
   "clase": "D",
   "valores": 3585,
   "difMax": 2.572718358351267e-7,
   "difEscaladaMax": 4.741856048523032e-9,
   "peor": "anova.p[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "datos$repeticion <- factor(datos$repeticion); modelo <- lmer(rend ~ genotipo * localidad + (1 | localidad:repeticion), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"genotipo\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-divididas/avena-divididas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-divididas"
   },
   "titulo": "Variedad en parcelas grandes y nitrógeno (numérico, como factor) en subparcelas, con bloques",
   "fuente": "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme",
   "clase": "D",
   "valores": 352,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 2.6500428373337124e-16,
   "peor": "anova.cm[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "datos$nitrogeno <- factor(datos$nitrogeno); modelo <- lmer(rendimiento ~ variedad * nitrogeno + (1 | bloque) + (1 | bloque:variedad), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"variedad\" | \"nitrogeno\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-divididas/parcelas-sin-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-divididas"
   },
   "titulo": "Parcelas grandes sorteadas sin bloques: la repetición identifica cada parcela grande (1 | A:rep)",
   "fuente": "de Mendiburu (2023), agricolae: Statistical Procedures for Agricultural Research; conjunto plots (parcelas divididas)",
   "clase": "D",
   "valores": 172,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rend ~ A * B + (1 | A:rep), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"A\" | \"B\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-bloques/maiz-parcelas-perdidas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-bloques"
   },
   "titulo": "Tres parcelas perdidas: híbrido × dosis (numérica, como factor) con bloques aleatorios y Kenward-Roger",
   "fuente": "Ensayo ficticio de maíz de SigmaPro: 3 híbridos × 4 dosis de N en 4 bloques (propuesta/maqueta-maiz.csv)",
   "clase": "D",
   "valores": 240,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-10,
   "peor": "medias[1].pares[3].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6",
     "pbkrtest": "0.5.3"
    },
    "codigo": "datos$dosis <- factor(datos$dosis); modelo <- lmer(rend ~ hibrido * dosis + (1 | bloque), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Kenward-Roger\"); summary(modelo, ddf = \"Kenward-Roger\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"hibrido\" | \"dosis\", lmer.df = \"kenward-roger\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "mixto-bloques/npk-bloques-aleatorios",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "mixto-bloques"
   },
   "titulo": "Factorial 2 × 2 × 2 en bloques aleatorios con N × P × K confundida con los bloques (se recupera entre bloques)",
   "fuente": "Yates (1935); conjunto npk de MASS (Venables y Ripley, 2002, Modern Applied Statistics with S, 4.ª ed.)",
   "clase": "D",
   "valores": 213,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 1.4038626027147157e-16,
   "peor": "medias[1].filas[0].ic[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rend ~ N * P * K + (1 | bloque), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"N\" | \"P\" | \"K\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/avena-kenward-roger",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Las mismas parcelas divididas con grados de libertad de Kenward-Roger",
   "fuente": "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme",
   "clase": "D",
   "valores": 352,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 1.3398654974206838e-16,
   "peor": "varianzas.varianza[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6",
     "pbkrtest": "0.5.3"
    },
    "codigo": "datos$nitrogeno <- factor(datos$nitrogeno); modelo <- lmer(rendimiento ~ variedad * nitrogeno + (1 | bloque/variedad), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Kenward-Roger\"); summary(modelo, ddf = \"Kenward-Roger\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"variedad\" | \"nitrogeno\", lmer.df = \"kenward-roger\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/avena-maxima-verosimilitud",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Nitrógeno como covariable, ajuste por máxima verosimilitud (REML = FALSE)",
   "fuente": "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme",
   "clase": "D",
   "valores": 236,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.678696234671167e-16,
   "peor": "varianzas.varianza[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(rendimiento ~ variedad + nitrogeno + (1 | bloque/variedad), data = datos, REML = FALSE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"variedad\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/avena-nitrogeno-dentro-variedad",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Medias del nitrógeno dentro de cada variedad, comparadas con Holm",
   "fuente": "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme",
   "clase": "D",
   "valores": 435,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 2.6500428373337124e-16,
   "peor": "anova.cm[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "datos$nitrogeno <- factor(datos$nitrogeno); modelo <- lmer(rendimiento ~ variedad * nitrogeno + (1 | bloque/variedad), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"nitrogeno\", by = \"variedad\", lmer.df = \"satterthwaite\") y pairs(adjust = \"holm\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/avena-parcelas-divididas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Parcelas divididas como modelo mixto: (1 | bloque/variedad), nitrógeno como factor",
   "fuente": "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme",
   "clase": "D",
   "valores": 352,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 2.6500428373337124e-16,
   "peor": "anova.cm[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "datos$nitrogeno <- factor(datos$nitrogeno); modelo <- lmer(rendimiento ~ variedad * nitrogeno + (1 | bloque/variedad), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"variedad\" | \"nitrogeno\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maiz-bloques-aleatorios",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Factorial híbrido × dosis con bloques aleatorios (balanceado: mismas F que el ANOVA de bloques)",
   "fuente": "Ensayo ficticio de maíz de SigmaPro: 3 híbridos × 4 dosis de N en 4 bloques (propuesta/maqueta-maiz.csv)",
   "clase": "D",
   "valores": 240,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 4.718447854656915e-16,
   "peor": "anova.p[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "datos$dosis <- factor(datos$dosis); modelo <- lmer(rend ~ hibrido * dosis + (1 | bloque), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"hibrido\" | \"dosis\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maquinas-agrupamiento-numerico",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "El operario como columna numérica: se toma como factor de agrupamiento",
   "fuente": "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme",
   "clase": "D",
   "valores": 121,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 2.220446049250313e-10,
   "peor": "medias[0].pares[0].p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(puntaje ~ maquina + (1 | operario), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"maquina\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maquinas-bonferroni-kenward-roger",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Desbalanceado: medias con gl de Kenward-Roger y pares con Bonferroni",
   "fuente": "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme",
   "clase": "D",
   "valores": 223,
   "difMax": 6.394884621840902e-14,
   "difEscaladaMax": 6.248245033855723e-14,
   "peor": "coeficientes.p[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6",
     "pbkrtest": "0.5.3"
    },
    "codigo": "modelo <- lmer(puntaje ~ maquina + (1 | operario/maquina), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Kenward-Roger\"); summary(modelo, ddf = \"Kenward-Roger\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"maquina\", lmer.df = \"kenward-roger\") y pairs(adjust = \"bonferroni\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maquinas-desbalanceado-tipo1",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "El mismo diseño desbalanceado con SC tipo I",
   "fuente": "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme",
   "clase": "D",
   "valores": 223,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.514271063112094e-16,
   "peor": "varianzas.varianza[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(puntaje ~ maquina + (1 | operario) + (1 | operario:maquina), data = datos, REML = TRUE); anova(modelo, type = 1, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"maquina\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maquinas-desbalanceado-tipo3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Seis datos menos (desbalanceado): gl de Satterthwaite no enteros, SC tipo III",
   "fuente": "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme",
   "clase": "D",
   "valores": 223,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.8336731441770397e-16,
   "peor": "varianzas.de[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(puntaje ~ maquina + (1 | operario/maquina), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"maquina\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/maquinas-operario",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Operario aleatorio y su interacción con la máquina (1 | operario/maquina)",
   "fuente": "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme",
   "clase": "D",
   "valores": 223,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.277085695582275e-16,
   "peor": "varianzas.varianza[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(puntaje ~ maquina + (1 | operario/maquina), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE); emmeans(modelo, \"maquina\", lmer.df = \"satterthwaite\") y pairs(adjust = \"tukey\")"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1",
    "emmeans": "2.0.3"
   }
  },
  {
   "id": "modelo-mixto/penicilina-cruzados",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Dos efectos aleatorios cruzados (placa y muestra) y solo el intercepto fijo",
   "fuente": "Davies y Goldsmith (1972), Statistical Methods in Research and Production, 4.ª ed.; conjunto Penicillin de lme4",
   "clase": "D",
   "valores": 197,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "varianzas.varianza[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(diametro ~ 1 + (1 | placa) + (1 | muestra), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE)"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1"
   }
  },
  {
   "id": "modelo-mixto/sueno-faltantes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Cuatro respuestas faltantes: el modelo usa las 176 filas completas",
   "fuente": "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4",
   "clase": "D",
   "valores": 138,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(Reaction ~ Days + (1 | Subject), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE)"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1"
   }
  },
  {
   "id": "modelo-mixto/sueno-pendientes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Intercepto y pendiente aleatorios correlacionados por sujeto (Days | Subject)",
   "fuente": "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4",
   "clase": "D",
   "valores": 238,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(Reaction ~ Days + (Days | Subject), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE)"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1"
   }
  },
  {
   "id": "modelo-mixto/sueno-sin-correlacion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "modelo-mixto"
   },
   "titulo": "Intercepto y pendiente aleatorios sin correlación (Days || Subject)",
   "fuente": "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4",
   "clase": "D",
   "valores": 240,
   "difMax": 0,
   "difEscaladaMax": 0,
   "peor": null,
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {
    "tolerancias": {
     "medias[*].pares[*].p": {
      "absoluto": 1e-12,
      "motivo": "p = 1 − ptukey(): integral numérica (AS 190), con cifras absolutas debajo de 1e-6"
     }
    }
   },
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "lme4": "1.1.35.5",
     "lmerTest": "3.2.1",
     "emmeans": "1.10.6"
    },
    "codigo": "modelo <- lmer(Reaction ~ Days + (Days || Subject), data = datos, REML = TRUE); anova(modelo, type = 3, ddf = \"Satterthwaite\"); summary(modelo, ddf = \"Satterthwaite\"); VarCorr(modelo); ranova(modelo); ranef(modelo, condVar = TRUE)"
   },
   "motor": {
    "webr": "0.6.0",
    "R": "4.6.0",
    "lme4": "2.0.1",
    "lmerTest": "3.2.1"
   }
  },
  {
   "id": "muestreo-simple/altura-lote-finito",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-simple"
   },
   "titulo": "Altura de 60 plantas (2 faltantes) de un lote de 800, 90 % de confianza",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 17,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.3279950272235784e-15,
   "peor": "t",
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
    "codigo": "ref_simple(datos$altura, N = 800, confianza = 0.9) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-simple/peso-poblacion-grande",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-simple"
   },
   "titulo": "Peso de 40 frutos de una población grande",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 12,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.097768337838763e-15,
   "peor": "t",
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
    "codigo": "ref_simple(datos$peso, N = 0, confianza = 0.95) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-simple/proporcion-enfermos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-simple"
   },
   "titulo": "Árboles enfermos (0/1) en una muestra de 150 de una huerta de 2000",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 16,
   "difMax": 9.094947017729282e-13,
   "difEscaladaMax": 6.742200125953537e-15,
   "peor": "t",
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
    "codigo": "ref_simple(datos$enfermo, N = 2000, confianza = 0.95) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-simple/proporcion-explicita",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-simple"
   },
   "titulo": "La misma proporción, pedida como tal, sin población finita y con 99 %",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 11,
   "difMax": 3.019806626980426e-14,
   "difEscaladaMax": 1.1573564035401291e-14,
   "peor": "t",
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
    "codigo": "ref_simple(datos$enfermo, N = 0, confianza = 0.99) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-estratificado/brix-lotes-casi-censo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-estratificado"
   },
   "titulo": "Grados Brix en tres lotes numerados con fracciones de muestreo altas (5 de 9)",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 47,
   "difMax": 1.1368683772161603e-13,
   "difEscaladaMax": 3.905971348087088e-16,
   "peor": "gl",
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
    "codigo": "ref_estratificado(datos$brix, datos$lote, Nh = c(1=18; 2=25; 3=9), confianza = 0.95, nTotal = 30) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-estratificado/plagas-cuatro-regiones-asignacion",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-estratificado"
   },
   "titulo": "Insectos por trampa en cuatro regiones (faltantes), 90 % y cómo repartir 80 trampas",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 58,
   "difMax": 1.8189894035458565e-12,
   "difEscaladaMax": 2.6025444703365085e-16,
   "peor": "t",
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
    "codigo": "ref_estratificado(datos$plagas, datos$region, Nh = c(norte=120; oriente=45; poniente=80; sur=150), confianza = 0.9, nTotal = 80) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "muestreo-estratificado/rendimiento-tres-suelos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "muestreo-estratificado"
   },
   "titulo": "Rendimiento con tres tipos de suelo (hectáreas por estrato)",
   "fuente": "Datos sintéticos (generados en este archivo); fórmulas de Cochran (1977) en R base (tests/r/muestreo.R)",
   "clase": "B",
   "valores": 40,
   "difMax": 9.094947017729282e-13,
   "difEscaladaMax": 1.8434071749857172e-16,
   "peor": "total",
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
    "codigo": "ref_estratificado(datos$rendimiento, datos$suelo, Nh = c(arcilloso=240; arenoso=130; franco=410), confianza = 0.95, nTotal = 0) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "tamano-muestra/media-absoluta",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tamano-muestra"
   },
   "titulo": "Frutos para estimar el peso medio con ± 5 g (DE esperada 18 g)",
   "fuente": "Cochran, W. G. (1977), Sampling Techniques, 3.ª ed., caps. 2–5 (fórmulas en R base, tests/r/muestreo.R)",
   "clase": "A",
   "valores": 4,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 5.708854988235362e-16,
   "peor": "n0",
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
    "codigo": "ref_tamano(op) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "tamano-muestra/media-cv-poblacion-finita",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tamano-muestra"
   },
   "titulo": "Plantas de un lote de 400 para estimar la altura con ± 10 % (CV 25 %)",
   "fuente": "Cochran, W. G. (1977), Sampling Techniques, 3.ª ed., caps. 2–5 (fórmulas en R base, tests/r/muestreo.R)",
   "clase": "A",
   "valores": 4,
   "difMax": 4.440892098500626e-16,
   "difEscaladaMax": 2.2658029094053857e-16,
   "peor": "z",
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
    "codigo": "ref_tamano(op) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "tamano-muestra/proporcion-90",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tamano-muestra"
   },
   "titulo": "Hojas para estimar la incidencia (esperada 30 %) con ± 5 % y 90 % de confianza",
   "fuente": "Cochran, W. G. (1977), Sampling Techniques, 3.ª ed., caps. 2–5 (fórmulas en R base, tests/r/muestreo.R)",
   "clase": "A",
   "valores": 4,
   "difMax": 2.5579538487363607e-13,
   "difEscaladaMax": 1.1255347418826508e-15,
   "peor": "n0",
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
    "codigo": "ref_tamano(op) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "tamano-muestra/proporcion-finita-99",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tamano-muestra"
   },
   "titulo": "Árboles de una huerta de 1500 para estimar una proporción con ± 4 % y 99 %",
   "fuente": "Cochran, W. G. (1977), Sampling Techniques, 3.ª ed., caps. 2–5 (fórmulas en R base, tests/r/muestreo.R)",
   "clase": "A",
   "valores": 4,
   "difMax": 2.2737367544323206e-13,
   "difEscaladaMax": 2.1932391871980479e-16,
   "peor": "n0",
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
    "codigo": "ref_tamano(op) (tests/r/muestreo.R)"
   }
  },
  {
   "id": "ammi/avena-ammi",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ammi"
   },
   "titulo": "Avena: AMMI con Gollob, F_R de Cornelius, puntajes y ASV",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 383,
   "difMax": 9.094947017729282e-13,
   "difEscaladaMax": 1.0698055321190836e-13,
   "peor": "ammi.fr.p[1]",
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
    "codigo": "tapply + lm por ambiente; svd de la interacción; Gollob y F_R (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "ammi/maiz-medias-ammi",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ammi"
   },
   "titulo": "Una media por celda: AMMI sin pruebas",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 100,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.768733322789075e-14,
   "peor": "anova.p[0]",
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
    "codigo": "tapply + lm por ambiente; svd de la interacción; Gollob y F_R (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "ammi/papa-ammi",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ammi"
   },
   "titulo": "Papa: 28 clones en 6 localidades, AMMI",
   "fuente": "Mendiburu, F. de (2023), agricolae; conjunto plrv (28 clones de papa × 6 localidades × 3 repeticiones, Centro Internacional de la Papa)",
   "clase": "B",
   "valores": 299,
   "difMax": 7.275957614183426e-11,
   "difEscaladaMax": 2.8406980700766675e-13,
   "peor": "anova.p[3]",
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
    "codigo": "tapply + lm por ambiente; svd de la interacción; Gollob y F_R (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "ensayos-multiambiente/avena-conjunto",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ensayos-multiambiente"
   },
   "titulo": "Avena en 14 ambientes: análisis conjunto, cada ambiente y Bartlett",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 314,
   "difMax": 9.094947017729282e-13,
   "difEscaladaMax": 9.434522481750991e-14,
   "peor": "anova.p[3]",
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
    "codigo": "tapply + lm por ambiente; anova(lm(y ~ amb + amb:rep + gen + gen:amb)) (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "ensayos-multiambiente/avena-parcelas-perdidas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ensayos-multiambiente"
   },
   "titulo": "Avena con 12 parcelas perdidas: análisis conjunto desbalanceado",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 314,
   "difMax": 8.526512829121202e-14,
   "difEscaladaMax": 1.0026665827005171e-13,
   "peor": "anova.p[3]",
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
    "codigo": "tapply + lm por ambiente; anova(lm(y ~ amb + amb:rep + gen + gen:amb)) (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "ensayos-multiambiente/maiz-medias-conjunto",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ensayos-multiambiente"
   },
   "titulo": "Una media por celda (sin repeticiones): G × A como residuo",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 106,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 1.768733322789075e-14,
   "peor": "anova.p[0]",
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
    "codigo": "tapply + lm por ambiente; anova(lm(y ~ amb + amb:rep + gen + gen:amb)) (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/avena-estabilidad-ee-error",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Avena: EE de b con el error combinado (como metan)",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 194,
   "difMax": 3.979039320256561e-13,
   "difEscaladaMax": 8.42663202554184e-14,
   "peor": "eberhart_russell.p[4]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/avena-estabilidad",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Avena: Eberhart-Russell (EE de b propio), Wricke, Shukla y Lin-Binns",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 194,
   "difMax": 3.979039320256561e-13,
   "difEscaladaMax": 8.42663202554184e-14,
   "peor": "eberhart_russell.p[4]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/avena-parcelas-perdidas-estabilidad",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Avena con parcelas perdidas: estabilidad con r armónica",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 194,
   "difMax": 3.979039320256561e-13,
   "difEscaladaMax": 3.35219696629243e-14,
   "peor": "eberhart_russell.p[4]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/maiz-estabilidad-menor",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Maíz: estabilidad de la altura de mazorca con la menor como objetivo (Lin y Binns)",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 229,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 1.6623353575340803e-14,
   "peor": "eberhart_russell.p[4]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/maiz-medias-estabilidad",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Una media por celda: estabilidad sin error (sin S²d ni pruebas de Shukla)",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 164,
   "difMax": 1.5987211554602254e-14,
   "difEscaladaMax": 7.549516567451064e-15,
   "peor": "eberhart_russell.F[3]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "estabilidad/papa-estabilidad",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "estabilidad"
   },
   "titulo": "Papa: estabilidad de 28 clones",
   "fuente": "Mendiburu, F. de (2023), agricolae; conjunto plrv (28 clones de papa × 6 localidades × 3 repeticiones, Centro Internacional de la Papa)",
   "clase": "B",
   "valores": 456,
   "difMax": 2.9103830456733704e-10,
   "difEscaladaMax": 1.1905761899375965e-13,
   "peor": "eberhart_russell.p[4]",
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
    "codigo": "tapply + lm por ambiente; lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "gge/avena-gge",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "gge"
   },
   "titulo": "Avena: GGE simétrico, quién ganó dónde y media contra estabilidad",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 115,
   "difMax": 4.618527782440651e-14,
   "difEscaladaMax": 1.3600232051658168e-14,
   "peor": "gge.perpendicular[9]",
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
    "codigo": "tapply + lm por ambiente; svd de la tabla centrada; chull (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "gge/maiz-gge-genotipo-escalado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "gge"
   },
   "titulo": "Maíz en 4 ambientes: GGE escalado por ambiente con partición por genotipo",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 92,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 8.881784197001252e-15,
   "peor": "gge.genotipos[2][1]",
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
    "codigo": "tapply + lm por ambiente; svd de la tabla centrada; chull (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "gge/maiz-gge-menor-ambiente",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "gge"
   },
   "titulo": "Maíz: menor altura de mazorca como objetivo, partición por ambiente",
   "fuente": "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)",
   "clase": "B",
   "valores": 94,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 3.0588068244412647e-15,
   "peor": "gge.pct[3]",
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
    "codigo": "tapply + lm por ambiente; svd de la tabla centrada; chull (tests/r/multiambiente.R)"
   }
  },
  {
   "id": "discriminante/cuatro-regiones",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "discriminante"
   },
   "titulo": "Cuatro regiones de tamaños distintos y faltantes (tres funciones)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 508,
   "difMax": 1.2045919817182948e-14,
   "difEscaladaMax": 1.2045919817182948e-14,
   "peor": "puntajes[25][2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "MASS": "7.3.61"
    },
    "codigo": "MASS::lda(x, g); predict(); lda(CV = TRUE) (tests/r/multivariado.R)"
   }
  },
  {
   "id": "discriminante/dos-origenes",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "discriminante"
   },
   "titulo": "Dos orígenes de una especie (una función discriminante)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 195,
   "difMax": 5.329070518200751e-15,
   "difEscaladaMax": 3.608224830031759e-15,
   "peor": "cv.posterior[2][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "MASS": "7.3.61"
    },
    "codigo": "MASS::lda(x, g); predict(); lda(CV = TRUE) (tests/r/multivariado.R)"
   }
  },
  {
   "id": "discriminante/grupo-chico-box",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "discriminante"
   },
   "titulo": "Un grupo de 3 con 3 variables: fuera de la M de Box (heplots), dentro del discriminante",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 469,
   "difMax": 1.27675647831893e-14,
   "difEscaladaMax": 1.27675647831893e-14,
   "peor": "sv[2]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "MASS": "7.3.61"
    },
    "codigo": "MASS::lda(x, g); predict(); lda(CV = TRUE) (tests/r/multivariado.R)"
   }
  },
  {
   "id": "discriminante/iris-fisher",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "discriminante"
   },
   "titulo": "Iris: tres especies con cuatro medidas de la flor",
   "fuente": "Anderson (1935) y Fisher (1936), datasets::iris de R; referencia: MASS::lda",
   "clase": "A",
   "valores": 1535,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 1.1324274851176597e-14,
   "peor": "puntajes[106][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "MASS": "7.3.61"
    },
    "codigo": "MASS::lda(x, g); predict(); lda(CV = TRUE) (tests/r/multivariado.R)"
   }
  },
  {
   "id": "manova/cuatro-respuestas",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "manova"
   },
   "titulo": "Una vía con cuatro respuestas y cuatro tratamientos (q = 3 < p = 4)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 72,
   "difMax": 1.4779288903810084e-12,
   "difEscaladaMax": 2.247010124485538e-14,
   "peor": "boxM.chi2",
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
    "codigo": "manova(); summary(test = ...); summary.aov() (tests/r/multivariado.R)"
   }
  },
  {
   "id": "manova/factorial-desbalanceado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "manova"
   },
   "titulo": "Factorial riego × variedad con faltantes (sumas secuenciales)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 106,
   "difMax": 8.739675649849232e-13,
   "difEscaladaMax": 9.445662549990151e-14,
   "peor": "terminos[0].pruebas.pillai.p",
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
    "codigo": "manova(); summary(test = ...); summary.aov() (tests/r/multivariado.R)"
   }
  },
  {
   "id": "manova/iris-manova",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "manova"
   },
   "titulo": "Iris: MANOVA de las cuatro medidas por especie",
   "fuente": "Anderson (1935) y Fisher (1936), datasets::iris de R; referencia: stats::manova",
   "clase": "A",
   "valores": 72,
   "difMax": 3.865352482534945e-12,
   "difEscaladaMax": 2.5130575112245065e-12,
   "peor": "terminos[0].pruebas.pillai.p",
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
    "codigo": "manova(); summary(test = ...); summary.aov() (tests/r/multivariado.R)"
   }
  },
  {
   "id": "manova/maiz-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "manova"
   },
   "titulo": "Tres híbridos en bloques con rendimiento, altura y peso de grano",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats::manova y MASS::lda",
   "clase": "A",
   "valores": 95,
   "difMax": 3.922195901395753e-12,
   "difEscaladaMax": 6.486719639228925e-14,
   "peor": "terminos[0].H[1][2]",
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
    "codigo": "manova(); summary(test = ...); summary.aov() (tests/r/multivariado.R)"
   }
  },
  {
   "id": "curva-crecimiento/dnasa-gompertz",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "curva-crecimiento"
   },
   "titulo": "Gompertz con su punto de inflexión",
   "fuente": "Davidian y Giltinan (1995), Nonlinear Models for Repeated Measurement Data; conjunto DNase de R (corrida 1, log de la concentración)",
   "clase": "D",
   "valores": 32,
   "difMax": 8.526512829121202e-14,
   "difEscaladaMax": 2.512901590722911e-14,
   "peor": "parametros.p[1]",
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
    "codigo": "nls(densidad ~ <modelo gompertz con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "curva-crecimiento/naranjos-logistico",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "curva-crecimiento"
   },
   "titulo": "Logístico de los cinco naranjos juntos",
   "fuente": "Draper y Smith (1998), Applied Regression Analysis; conjunto Orange de R (Pinheiro y Bates 2000)",
   "clase": "D",
   "valores": 26,
   "difMax": 3.637978807091713e-12,
   "difEscaladaMax": 1.9641060929764644e-13,
   "peor": "parametros.p[0]",
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
    "codigo": "nls(circunferencia ~ <modelo logistico con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "curva-crecimiento/naranjos-por-arbol",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "curva-crecimiento"
   },
   "titulo": "Logístico por árbol con la comparación de curvas y de cada parámetro",
   "fuente": "Draper y Smith (1998), Applied Regression Analysis; conjunto Orange de R (Pinheiro y Bates 2000)",
   "clase": "D",
   "valores": 117,
   "difMax": 1.1368683772161603e-12,
   "difEscaladaMax": 4.116961644120597e-14,
   "peor": "parametros.p[0]",
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
    "codigo": "nls(circunferencia ~ <modelo logistico con gradiente analítico> por arbol) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "curva-crecimiento/pollo-weibull",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "curva-crecimiento"
   },
   "titulo": "Weibull del peso de un pollo",
   "fuente": "Crowder y Hand (1990), Analysis of Repeated Measures; conjunto ChickWeight de R (pollo 6)",
   "clase": "D",
   "valores": 32,
   "difMax": 3.979039320256561e-13,
   "difEscaladaMax": 2.1681708326012613e-14,
   "peor": "parametros.p[0]",
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
    "codigo": "nls(peso ~ <modelo weibull con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "dosis-respuesta/herbicidas-ll4",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dosis-respuesta"
   },
   "titulo": "Log-logístico de 4 parámetros con dosis cero: DE10, DE50 y DE90 de dos herbicidas y su comparación",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 116,
   "difMax": 3.069544618483633e-12,
   "difEscaladaMax": 1.2044856134795262e-13,
   "peor": "parametros.p[7]",
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
    "codigo": "nls(peso_seco ~ <modelo ll4 con gradiente analítico> por herbicida) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "dosis-respuesta/toxico-ll3",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "dosis-respuesta"
   },
   "titulo": "Log-logístico de 3 parámetros (límite inferior en 0) con dos faltantes",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 44,
   "difMax": 3.694822225952521e-13,
   "difEscaladaMax": 2.3593620786525828e-14,
   "peor": "parametros.p[1]",
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
    "codigo": "nls(germinacion ~ <modelo ll3 con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "respuesta-meseta/maiz-cuadratico-meseta",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "respuesta-meseta"
   },
   "titulo": "Cuadrático-meseta por híbrido con la prueba de cada parámetro",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 87,
   "difMax": 3.410605131648481e-13,
   "difEscaladaMax": 1.1297958674494277e-13,
   "peor": "parametros.p[0]",
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
    "codigo": "nls(rendimiento ~ <modelo cuadratico-meseta con gradiente analítico> por hibrido) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "respuesta-meseta/maiz-lineal-meseta-una",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "respuesta-meseta"
   },
   "titulo": "Lineal-meseta de un híbrido",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 32,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 1.1353060279842349e-14,
   "peor": "parametros.p[1]",
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
    "codigo": "nls(rendimiento ~ <modelo lineal-meseta con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "respuesta-meseta/maiz-lineal-meseta",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "respuesta-meseta"
   },
   "titulo": "Lineal-meseta por híbrido: dosis óptima, meseta y curva común",
   "fuente": "Datos sintéticos (generados en este archivo)",
   "clase": "D",
   "valores": 60,
   "difMax": 8.526512829121202e-14,
   "difEscaladaMax": 1.9956821942928115e-14,
   "peor": "parametros.p[5]",
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
    "codigo": "nls(rendimiento ~ <modelo lineal-meseta con gradiente analítico> por hibrido) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "respuesta-meseta/pino-mitscherlich",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "respuesta-meseta"
   },
   "titulo": "Mitscherlich (asintótico) de la altura de un pino",
   "fuente": "Kung (1986), Proceedings of the Fourth Southern Silvicultural Research Conference; conjunto Loblolly de R (semilla 329)",
   "clase": "D",
   "valores": 26,
   "difMax": 1.2789769243681803e-13,
   "difEscaladaMax": 6.854850064665278e-15,
   "peor": "ajuste.rss",
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
    "codigo": "nls(altura ~ <modelo mitscherlich con gradiente analítico>) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; IC de Wald con t; método delta; anova(curva común, una por grupo)"
   }
  },
  {
   "id": "potencia-anova/anova-medias-n",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-anova"
   },
   "titulo": "Repeticiones para cuatro híbridos con medias esperadas 4.2, 4.8, 5.1 y 5.6 t/ha",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 25,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 5.7822999590048505e-15,
   "peor": "n",
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
    "codigo": "ref_potencia_anova con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-anova/anova-potencia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-anova"
   },
   "titulo": "Potencia con 5 tratamientos y 4 repeticiones",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 25,
   "difMax": 6.8833827526759706e-15,
   "difEscaladaMax": 6.8833827526759706e-15,
   "peor": "curva.potencia[7]",
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
    "codigo": "ref_potencia_anova con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-anova/anova-varianza-detectable",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-anova"
   },
   "titulo": "Varianza entre medias detectable con 6 repeticiones de 3 tratamientos",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 29,
   "difMax": 5.10702591327572e-15,
   "difEscaladaMax": 3.165116956990108e-15,
   "peor": "varEntre",
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
    "codigo": "ref_potencia_anova con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-proporciones/prop-n",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-proporciones"
   },
   "titulo": "Semillas por lote para distinguir 65 % de 80 % de germinación",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 118,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 4.1216343838470952e-16,
   "peor": "n",
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
    "codigo": "ref_potencia_prop con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-proporciones/prop-potencia-unilateral",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-proporciones"
   },
   "titulo": "Potencia unilateral con 120 por grupo",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 126,
   "difMax": 2.220446049250313e-16,
   "difEscaladaMax": 2.220446049250313e-16,
   "peor": "curva.potencia[26]",
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
    "codigo": "ref_potencia_prop con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-correlacion/r-detectable",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-correlacion"
   },
   "titulo": "Correlación detectable con 40 pares",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 80,
   "difMax": 2.220446049250313e-15,
   "difEscaladaMax": 2.220446049250313e-15,
   "peor": "curva.potencia[5]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "pwr": "1.3.0"
    },
    "codigo": "ref_potencia_r con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-correlacion/r-n",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-correlacion"
   },
   "titulo": "Pares para detectar r = 0.35",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 122,
   "difMax": 3.410605131648481e-13,
   "difEscaladaMax": 5.597107457008815e-15,
   "peor": "n",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "pwr": "1.3.0"
    },
    "codigo": "ref_potencia_r con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-correlacion/r-potencia-unilateral",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-correlacion"
   },
   "titulo": "Potencia unilateral con 25 pares y r = 0.4",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 96,
   "difMax": 9.992007221626409e-16,
   "difEscaladaMax": 9.992007221626409e-16,
   "peor": "curva.potencia[41]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "pwr": "1.3.0"
    },
    "codigo": "ref_potencia_r con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "repeticiones/repeticiones-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "repeticiones"
   },
   "titulo": "Bloques con 6 tratamientos, CV 12 % y diferencia de 15 %",
   "fuente": "Cochran, W. G. y Cox, G. M. (1957), Experimental Designs, 2.ª ed.: r ≥ 2(t₁ + t₂)²(CV/d)²",
   "clase": "A",
   "valores": 55,
   "difMax": 6.039613253960852e-14,
   "difEscaladaMax": 5.721346922062873e-15,
   "peor": "iteraciones[7].requeridas",
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
    "codigo": "ref_repeticiones con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "repeticiones/repeticiones-dca-potencia-alta",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "repeticiones"
   },
   "titulo": "Completamente al azar, CV 8 %, diferencia 10 %, potencia 90 %",
   "fuente": "Cochran, W. G. y Cox, G. M. (1957), Experimental Designs, 2.ª ed.: r ≥ 2(t₁ + t₂)²(CV/d)²",
   "clase": "A",
   "valores": 70,
   "difMax": 8.171241461241152e-14,
   "difEscaladaMax": 5.777184143523299e-15,
   "peor": "iteraciones[9].requeridas",
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
    "codigo": "ref_repeticiones con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-medias/t-dos-muestras-n",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-medias"
   },
   "titulo": "Repeticiones por grupo para detectar 1.5 t/ha con DE 2.1",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 69,
   "difMax": 9.343636975245317e-13,
   "difEscaladaMax": 2.9422142429165035e-14,
   "peor": "n",
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
    "codigo": "ref_potencia_t con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-medias/t-dos-muestras-unilateral-n",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-medias"
   },
   "titulo": "n por grupo con alternativa unilateral y α = 0.01",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 71,
   "difMax": 4.760636329592671e-13,
   "difEscaladaMax": 3.530509218307998e-14,
   "peor": "curva.potencia[32]",
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
    "codigo": "ref_potencia_t con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-medias/t-pareada-potencia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-medias"
   },
   "titulo": "Potencia de una prueba pareada con 12 pares",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 51,
   "difMax": 2.9976021664879227e-15,
   "difEscaladaMax": 2.9976021664879227e-15,
   "peor": "curva.potencia[20]",
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
    "codigo": "ref_potencia_t con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "potencia-medias/t-una-muestra-diferencia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "potencia-medias"
   },
   "titulo": "Diferencia detectable contra un valor, unilateral, 90 % de potencia",
   "fuente": "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)",
   "clase": "A",
   "valores": 83,
   "difMax": 5.10702591327572e-15,
   "difEscaladaMax": 5.10702591327572e-15,
   "peor": "curva.potencia[34]",
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
    "codigo": "ref_potencia_t con los valores por omisión de R (tests/r/potencia.R)"
   }
  },
  {
   "id": "autocorrelacion/ar1-acf",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "autocorrelacion"
   },
   "titulo": "Serie AR(1) con φ = 0.7: la PACF se corta en el rezago 1",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 42,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 3.9985376121265404e-16,
   "peor": "pacf[12]",
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
    "codigo": "acf(); pacf(); Box.test() (tests/r/series.R)"
   }
  },
  {
   "id": "autocorrelacion/lluvia-acf",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "autocorrelacion"
   },
   "titulo": "Precipitación mensual: ACF y PACF automáticas, Ljung-Box con 12 rezagos",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 46,
   "difMax": 5.684341886080802e-14,
   "difEscaladaMax": 1.2073675392798577e-15,
   "peor": "pacf[10]",
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
    "codigo": "acf(); pacf(); Box.test() (tests/r/series.R)"
   }
  },
  {
   "id": "autocorrelacion/ruido-blanco",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "autocorrelacion"
   },
   "titulo": "Ruido blanco: sin autocorrelación",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 42,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "box.p_box_pierce",
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
    "codigo": "acf(); pacf(); Box.test() (tests/r/series.R)"
   }
  },
  {
   "id": "autocorrelacion/semilla-acf-ordenada",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "autocorrelacion"
   },
   "titulo": "Ventas trimestrales ordenadas por el tiempo: 8 rezagos, Box con fitdf = 1, 90 %",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 26,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 8.326672684688674e-16,
   "peor": "pacf[4]",
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
    "codigo": "acf(); pacf(); Box.test() (tests/r/series.R)"
   }
  },
  {
   "id": "descomposicion/lluvia-aditiva",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descomposicion"
   },
   "titulo": "Precipitación mensual: descomposición aditiva (frecuencia 12)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 230,
   "difMax": 2.842170943040401e-14,
   "difEscaladaMax": 2.526842105314705e-14,
   "peor": "residuo[31]",
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
    "codigo": "decompose(ts(x, frequency = 12), type = \"aditiva\")"
   }
  },
  {
   "id": "descomposicion/semilla-multiplicativa",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descomposicion"
   },
   "titulo": "Ventas trimestrales: descomposición multiplicativa, filas desordenadas",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 90,
   "difMax": 1.4210854715202004e-14,
   "difEscaladaMax": 2.397091060400532e-16,
   "peor": "tendencia[18]",
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
    "codigo": "decompose(ts(x, frequency = 4), type = \"multiplicativa\")"
   }
  },
  {
   "id": "descomposicion/trampa-frecuencia-7",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "descomposicion"
   },
   "titulo": "Capturas diarias con ciclo semanal (frecuencia impar, 7)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
   "clase": "A",
   "valores": 114,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 3.552713678800501e-15,
   "peor": "residuo[6]",
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
    "codigo": "decompose(ts(x, frequency = 7), type = \"aditiva\")"
   }
  },
  {
   "id": "tendencia/lluvia-tendencia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tendencia"
   },
   "titulo": "Precipitación mensual: Mann-Kendall y Sen",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
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
     "trend": "1.1.8"
    },
    "codigo": "trend::mk.test(x); trend::sens.slope(x, conf.level = 0.95)"
   }
  },
  {
   "id": "tendencia/rendimiento-anual-90",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tendencia"
   },
   "titulo": "El mismo rendimiento con intervalo de Sen al 90 %",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
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
     "trend": "1.1.8"
    },
    "codigo": "trend::mk.test(x); trend::sens.slope(x, conf.level = 0.9)"
   }
  },
  {
   "id": "tendencia/rendimiento-anual-empates",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tendencia"
   },
   "titulo": "Rendimiento anual con empates y un año faltante (se omite)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
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
     "trend": "1.1.8"
    },
    "codigo": "trend::mk.test(x); trend::sens.slope(x, conf.level = 0.95)"
   }
  },
  {
   "id": "tendencia/trampa-sin-tendencia",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "tendencia"
   },
   "titulo": "Capturas diarias sin tendencia (muchos empates)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: stats (acf, pacf, Box.test, decompose) y trend (mk.test, sens.slope)",
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
     "trend": "1.1.8"
    },
    "codigo": "trend::mk.test(x); trend::sens.slope(x, conf.level = 0.95)"
   }
  },
  {
   "id": "ascenso-pronunciado/ascenso-factorial-centros",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ascenso-pronunciado"
   },
   "titulo": "Factorial 2² con cinco centros: ascenso más pronunciado",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 144,
   "difMax": 2.3874235921539366e-12,
   "difEscaladaMax": 4.547615253359488e-14,
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
    "codigo": "lm(rendimiento ~ primer orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "ascenso-pronunciado/descenso-factorial-centros",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "ascenso-pronunciado"
   },
   "titulo": "El mismo factorial: descenso más pronunciado",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 144,
   "difMax": 2.3874235921539366e-12,
   "difEscaladaMax": 4.547615253359488e-14,
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
    "codigo": "lm(rendimiento ~ primer orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/biomasa-factorial-sin-error-puro",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Factorial 3 × 3 sin repeticiones (sin error puro)",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 155,
   "difMax": 2.1316282072803006e-13,
   "difEscaladaMax": 6.4911404577489135e-15,
   "peor": "naturales.t[5]",
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
    "codigo": "lm(biomasa ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/cafe-cara-centrada-cuatro",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Central compuesto de caras centradas con cuatro factores",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 326,
   "difMax": 5.7127635955112055e-12,
   "difEscaladaMax": 2.703583623832997e-13,
   "peor": "naturales.t[14]",
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
    "codigo": "lm(rendimiento ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/factorial-interacciones",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Factorial 2³ con centros: primer orden con interacciones y su cresta",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 184,
   "difMax": 2.8421709430404007e-13,
   "difEscaladaMax": 1.8096635301390052e-14,
   "peor": "naturales.t[5]",
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
    "codigo": "lm(rendimiento ~ primer orden + interacciones, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/germinacion-bbd-cresta-minima",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Box-Behnken: cresta de mínima respuesta",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 232,
   "difMax": 1.3145040611561853e-12,
   "difEscaladaMax": 7.100284800417871e-14,
   "peor": "naturales.t[0]",
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
    "codigo": "lm(germinacion ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/germinacion-bbd-silla",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Box-Behnken de tres factores con punto silla y cresta de máxima respuesta",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 232,
   "difMax": 1.3145040611561853e-12,
   "difEscaladaMax": 7.100284800417871e-14,
   "peor": "naturales.t[0]",
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
    "codigo": "lm(germinacion ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/maiz-ccd-bloques",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Central compuesto en dos bloques ortogonales, con un faltante",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 186,
   "difMax": 2.6716406864579767e-12,
   "difEscaladaMax": 5.870399347934354e-13,
   "peor": "naturales.t[4]",
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
    "codigo": "lm(rendimiento ~ bloque + segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/maiz-ccd-maximo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Central compuesto rotable de dos factores: máximo, análisis canónico y cresta",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 171,
   "difMax": 4.618527782440651e-13,
   "difEscaladaMax": 2.1885706537838987e-14,
   "peor": "naturales.t[3]",
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
    "codigo": "lm(rendimiento ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "superficie-respuesta/severidad-ccd3-minimo",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "superficie-respuesta"
   },
   "titulo": "Central compuesto rotable de tres factores con mínimo",
   "fuente": "Datos sintéticos (generados en este archivo con la respuesta y el diseño indicados)",
   "clase": "B",
   "valores": 241,
   "difMax": 6.679101716144942e-13,
   "difEscaladaMax": 2.280472770423752e-13,
   "peor": "naturales.p[0]",
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
    "codigo": "lm(severidad ~ segundo orden, datos codificados); eigen(B); uniroot para la cresta (tests/r/superficie.R)"
   }
  },
  {
   "id": "cox/bioensayo-cox-breslow-90",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "El mismo modelo con Breslow e intervalos al 90 %",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 48,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 8.288104286904194e-14,
   "peor": "p_lr",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(horas, muerto) ~ insecticida + peso, ties = \"breslow\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/bioensayo-cox-factor-covariable",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con el insecticida y el peso del insecto (Efron)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 48,
   "difMax": 1.7053025658242404e-13,
   "difEscaladaMax": 8.269778733830307e-14,
   "peor": "p_lr",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(horas, muerto) ~ insecticida + peso, ties = \"efron\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/germinacion-cox-breslow",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con el tratamiento (Breslow)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 37,
   "difMax": 7.638334409421077e-12,
   "difEscaladaMax": 5.687668383627616e-13,
   "peor": "wald",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(dias, germino) ~ tratamiento, ties = \"breslow\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/germinacion-cox-efron",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con el tratamiento (Efron, muchos empates)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 37,
   "difMax": 2.1511681325137033e-11,
   "difEscaladaMax": 1.4115473387580654e-12,
   "peor": "wald",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(dias, germino) ~ tratamiento, ties = \"efron\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/lotes-cox-estratos-covariable-breslow",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con tratamiento, peso y estratos por lote (Breslow)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 48,
   "difMax": 1.1368683772161603e-13,
   "difEscaladaMax": 4.315294188005291e-14,
   "peor": "z[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(dias, germino) ~ tratamiento + peso + strata(lote), ties = \"breslow\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/lotes-cox-estratos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con el tratamiento y estratos por lote (Efron)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 37,
   "difMax": 1.9968471320908066e-12,
   "difEscaladaMax": 1.4432870866648177e-12,
   "peor": "z[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(dias, germino) ~ tratamiento + strata(lote), ties = \"efron\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "cox/vivero-dos-covariables",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "cox"
   },
   "titulo": "Cox con dos covariables numéricas y riesgos que cambian con el tiempo",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "D",
   "valores": 40,
   "difMax": 5.064393349130114e-12,
   "difEscaladaMax": 4.32720526077901e-12,
   "peor": "z[1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "coxph(Surv(semanas, murio) ~ riego + sombra, ties = \"efron\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)"
   }
  },
  {
   "id": "kaplan-meier/bioensayo-tres-grupos",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Horas hasta la muerte con dos insecticidas y testigo (faltantes)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 494,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 1.4694393559018457e-15,
   "peor": "comparacion.p",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(horas, muerto) ~ insecticida, conf.type = \"log\", conf.int = 0.95); quantile(); survdiff(rho = 0)"
   }
  },
  {
   "id": "kaplan-meier/germinacion-log-log-peto",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Los mismos datos con intervalos log-log, 90 % y la prueba de Peto-Peto",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 366,
   "difMax": 1.0658141036401503e-14,
   "difEscaladaMax": 8.910127676042051e-16,
   "peor": "comparacion.chi2",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(dias, germino) ~ tratamiento, conf.type = \"log-log\", conf.int = 0.9); quantile(); survdiff(rho = 1)"
   }
  },
  {
   "id": "kaplan-meier/germinacion-log-rank",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Días hasta germinar con tres tratamientos (empates, censura a los 21 días), log-rank",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 366,
   "difMax": 1.7763568394002505e-15,
   "difEscaladaMax": 1.6653345369377348e-16,
   "peor": "grupos[0].curva.sup[6]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(dias, germino) ~ tratamiento, conf.type = \"log\", conf.int = 0.95); quantile(); survdiff(rho = 0)"
   }
  },
  {
   "id": "kaplan-meier/lotes-log-rank-estratificado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Log-rank estratificado por lote (cada lote con su riesgo base)",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 342,
   "difMax": 7.105427357601002e-15,
   "difEscaladaMax": 3.7428193103523837e-16,
   "peor": "comparacion.varianza[0][0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(dias, germino) ~ tratamiento, conf.type = \"log\", conf.int = 0.95); quantile(); survdiff(rho = 0)"
   }
  },
  {
   "id": "kaplan-meier/lotes-peto-estratificado",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Peto-Peto estratificada por lote, intervalos log-log",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 342,
   "difMax": 3.552713678800501e-15,
   "difEscaladaMax": 4.4263975787898207e-16,
   "peor": "comparacion.varianza[1][1]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(dias, germino) ~ tratamiento, conf.type = \"log-log\", conf.int = 0.95); quantile(); survdiff(rho = 1)"
   }
  },
  {
   "id": "kaplan-meier/mediana-punto-medio",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "La curva se queda justo en 0.5: la mediana es el punto medio del tramo",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 60,
   "difMax": 6.938893903907228e-18,
   "difEscaladaMax": 6.938893903907228e-18,
   "peor": "grupos[0].curva.inf[4]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(t, e) ~ 1, conf.type = \"log\", conf.int = 0.95); quantile(); survdiff(rho = 0)"
   }
  },
  {
   "id": "kaplan-meier/una-curva-plain-hasta-cero",
   "objetivo": {
    "tipo": "metodo",
    "nombre": "kaplan-meier"
   },
   "titulo": "Una curva con censuras en medio, intervalo plain, que llega a 0",
   "fuente": "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)",
   "clase": "A",
   "valores": 92,
   "difMax": 1.1102230246251565e-16,
   "difEscaladaMax": 1.1102230246251565e-16,
   "peor": "grupos[0].curva.inf[0]",
   "aprobado": true,
   "error": "",
   "fallas": [],
   "comparacion": {},
   "referencia": {
    "r": "R version 4.4.2 (2024-10-31 ucrt)",
    "plataforma": "x86_64-w64-mingw32",
    "paquetes": {
     "survival": "3.7.0"
    },
    "codigo": "survfit(Surv(t, e) ~ 1, conf.type = \"plain\", conf.int = 0.95); quantile(); survdiff(rho = 0)"
   }
  }
 ]
};

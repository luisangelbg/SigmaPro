/* Generado por tests/correr.mjs — no editar a mano. */
window.SP_VALIDACION = {
 "version": "0.1.0",
 "generado": "2026-10-01T13:26:40.890Z",
 "motor": "node v24.19.0",
 "criterio": {
  "tol": 0.000001,
  "regla": "|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)"
 },
 "referencias": [
  "R version 4.4.2 (2024-10-31 ucrt)"
 ],
 "resumen": {
  "casos": 72,
  "aprobados": 72,
  "fallidos": 0,
  "valores": 6841,
  "difEscaladaMax": 7.533201041296815e-8,
  "objetivos": 26
 },
 "casos": [
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
  }
 ]
};

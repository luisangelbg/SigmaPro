/* Generado por tests/correr.mjs — no editar a mano. */
window.SP_VALIDACION = {
 "version": "0.1.0",
 "generado": "2026-10-01T12:23:02.495Z",
 "motor": "node v24.19.0",
 "criterio": {
  "tol": 0.000001,
  "regla": "|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)"
 },
 "referencias": [
  "R version 4.4.2 (2024-10-31 ucrt)"
 ],
 "resumen": {
  "casos": 4,
  "aprobados": 4,
  "fallidos": 0,
  "valores": 28,
  "difEscaladaMax": 1.4731743582768251e-16,
  "objetivos": 1
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
  }
 ]
};

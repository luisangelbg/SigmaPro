# SigmaPro — utilidades para escribir casos de validación.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Cada carpeta tests/casos/<objetivo>/ tiene un generar.R que llama sp_caso() una vez
# por caso. sp_caso() escribe <nombre>.json (datos + resultado de R) y <nombre>.csv
# (los mismos datos, para leerlos a mano) en la carpeta del generar.R.
#
# Los números se escriben con 17 cifras significativas: la app lee exactamente los
# mismos valores de punto flotante que usó R. «NA», «NaN», «Inf» y «-Inf» van como
# texto (docs/VALIDACION.md explica cómo los compara la app).

suppressPackageStartupMessages(library(jsonlite))

# Tipos de columna como los entiende la app; los factores llevan sus niveles en el
# orden de R, para que medias, contrastes y coeficientes salgan en el mismo orden.
sp_tipos <- function(df) {
  lapply(df, function(v) {
    if (is.factor(v)) list(tipo = "factor", niveles = I(levels(v)))
    else if (is.numeric(v) || is.logical(v)) list(tipo = "numerica")
    else stop("sp_tipos: tipo de columna no soportado: ", class(v)[1])
  })
}

sp_columnas <- function(df) {
  lapply(df, function(v) I(if (is.factor(v)) as.character(v) else as.numeric(v)))
}

# Versión de cada paquete usado para la referencia.
sp_paquetes <- function(paquetes) {
  setNames(lapply(paquetes, function(p) as.character(packageVersion(p))), paquetes)
}

#' Escribe un caso de validación.
#' @param nombre      archivo sin extensión (minúsculas y guiones)
#' @param objetivo    función del núcleo ("num.resumen") o id de método ("anova-dca")
#' @param tipo        "funcion" o "metodo"
#' @param titulo      qué prueba el caso, en una línea
#' @param fuente      de dónde vienen los datos (libro, artículo o conjunto de R)
#' @param clase       A–E (docs/VALIDACION.md)
#' @param datos       data.frame con las columnas que usa el caso
#' @param argumentos  (funcion) lista de argumentos; list(columna = "x") es una columna
#' @param entradas    (metodo) papel → columna(s)
#' @param opciones    (metodo) opciones del método
#' @param esperado    lista con el resultado de R; envolver con I() los vectores de
#'                    longitud 1 que deban quedar como arreglo
#' @param comparacion list(tol, modo, tolerancias = list(patron = list(tol, motivo)))
#' @param paquetes    paquetes usados para calcular la referencia
#' @param codigo      el código de R que produce `esperado` (por omisión, la expresión dada)
#' @param vectorizar  TRUE para rejillas: la app recorre juntos los argumentos que son
#'                    vectores (envueltos en I()) y compara el vector de resultados
#
# Rejillas: sp_rejilla() devuelve un data.frame con todas las combinaciones, y
# sp_arg() envuelve una columna para que siga siendo arreglo aunque mida 1.
sp_rejilla <- function(...) expand.grid(..., KEEP.OUT.ATTRS = FALSE, stringsAsFactors = FALSE)
sp_arg <- function(x) I(unname(x))
.sp_escritos <- new.env()
sp_caso <- function(nombre, objetivo, tipo = c("funcion", "metodo"), titulo, fuente,
                    clase = "A", datos = NULL, argumentos = NULL, entradas = NULL, opciones = NULL,
                    esperado, comparacion = NULL, paquetes = "stats", codigo = NULL,
                    vectorizar = FALSE) {
  tipo <- match.arg(tipo)
  # dos casos con el mismo nombre en una carpeta se pisarían el archivo: se detiene
  clave <- file.path(getwd(), nombre)
  if (!is.null(.sp_escritos[[clave]])) stop("sp_caso: el nombre «", nombre, "» ya se usó en esta carpeta")
  .sp_escritos[[clave]] <- TRUE
  stopifnot(grepl("^[a-z0-9][a-z0-9-]*$", nombre), clase %in% c("A", "B", "C", "D", "E"))
  if (is.null(codigo)) codigo <- paste(deparse(substitute(esperado), width.cutoff = 90L), collapse = "\n")
  caso <- list(
    esquema = 1L,
    id = paste0(objetivo, "/", nombre),
    objetivo = list(tipo = tipo, nombre = objetivo),
    titulo = titulo,
    fuente = fuente,
    clase = clase,
    datos = if (!is.null(datos)) list(columnas = sp_columnas(datos), tipos = sp_tipos(datos)),
    vectorizar = if (isTRUE(vectorizar)) TRUE,
    argumentos = argumentos,
    entradas = entradas,
    opciones = opciones,
    esperado = esperado,
    comparacion = comparacion,
    referencia = list(
      r = R.version.string,
      plataforma = R.version$platform,
      paquetes = sp_paquetes(paquetes),
      codigo = codigo
    )
  )
  caso <- caso[!vapply(caso, is.null, logical(1))]
  json <- toJSON(caso, digits = I(17), na = "string", auto_unbox = TRUE, pretty = TRUE, null = "null")
  con <- file(paste0(nombre, ".json"), open = "w", encoding = "UTF-8")
  writeLines(json, con)
  close(con)
  if (!is.null(datos)) utils::write.csv(datos, paste0(nombre, ".csv"), row.names = FALSE, na = "", fileEncoding = "UTF-8")
  cat(sprintf("  · %s/%s\n", objetivo, nombre))
  invisible(caso)
}

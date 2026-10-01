# SigmaPro — regenera TODAS las referencias de validación con R.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Uso (desde cualquier carpeta):
#   Rscript tests/r/generar-todo.R              todos los casos
#   Rscript tests/r/generar-todo.R num-resumen  solo las carpetas que contienen ese texto
#
# Corre cada tests/casos/*/generar.R en su propia carpeta y guarda en
# tests/r/sesion.txt la versión de R y de cada paquete cargado: es parte del
# respaldo de la validación.

argumentos <- commandArgs(trailingOnly = FALSE)
este <- sub("^--file=", "", argumentos[grep("^--file=", argumentos)])
if (!length(este)) stop("Corre este archivo con Rscript.")
TESTS <- normalizePath(file.path(dirname(normalizePath(este)), ".."))
source(file.path(TESTS, "r", "comun.R"), encoding = "UTF-8")

filtro <- commandArgs(trailingOnly = TRUE)
generadores <- sort(list.files(file.path(TESTS, "casos"), pattern = "^generar\\.R$",
                               recursive = TRUE, full.names = TRUE))
if (length(filtro)) generadores <- generadores[grepl(filtro[1], generadores, fixed = TRUE)]
if (!length(generadores)) stop("No hay generadores que coincidan.")

errores <- 0L
for (g in generadores) {
  cat(sprintf("%s\n", basename(dirname(g))))
  ok <- tryCatch({
    source(g, chdir = TRUE, local = new.env(parent = globalenv()), encoding = "UTF-8")
    TRUE
  }, error = function(e) { cat("  ERROR: ", conditionMessage(e), "\n", sep = ""); FALSE })
  if (!ok) errores <- errores + 1L
}

con <- file(file.path(TESTS, "r", "sesion.txt"), open = "w", encoding = "UTF-8")
writeLines(c(paste("Generado:", format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z")), "", capture.output(sessionInfo())), con)
close(con)

cat(sprintf("\n%d generadores, %d con error.\n", length(generadores), errores))
if (errores > 0L) quit(status = 1L)

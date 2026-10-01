# Importación: texto delimitado contra read.csv y libros .xlsx contra readxl::read_excel.
# Los libros son los ejemplos que trae readxl, guardados por un programa de hoja de cálculo:
# así el escritor y el lector de referencia son ajenos a SigmaPro.

columnas_crudas <- function(d) lapply(d, function(v) I(if (is.numeric(v)) v else as.character(v)))

caso_csv <- function(nombre, titulo, texto, sep, dec) {
  d <- read.csv(text = texto, sep = sep, dec = dec, na.strings = c("", "NA"), strip.white = TRUE,
                check.names = FALSE, stringsAsFactors = FALSE, encoding = "UTF-8")
  sp_caso(nombre, objetivo = "csv.leerColumnas", titulo = titulo, fuente = "Texto sintético con casos difíciles",
    argumentos = list(texto, list(delimitador = sep, decimal = dec)),
    esperado = list(nombres = I(names(d)), columnas = columnas_crudas(d), delimitador = sep, decimal = dec, filas = nrow(d)),
    paquetes = "utils",
    codigo = sprintf('read.csv(text = texto, sep = "%s", dec = "%s", na.strings = c("", "NA"), strip.white = TRUE)', sep, dec))
}

caso_csv("comas-y-comillas", "Coma, fin de línea CRLF, comillas con comas y comillas dobles, notación científica y faltantes",
  paste0("parcela,tratamiento,rend,altura,obs\r\n",
         '1,"Testigo, sin N",4.21,1.85,\r\n',
         '2,"Urea ""granulada""",5.9,-0.5,"dañada por granizo"\r\n',
         "3,Sulfato,NA,2.1e-1,ok\r\n",
         '4, Testigo ,6.03,1.92,""\r\n'), ",", ".")
caso_csv("punto-y-coma-coma-decimal", "Punto y coma con coma decimal y un faltante al final",
  "bloque;dosis;rend\nI;0;4,22\nII;60;5,41\nIII;120;6,355\nIV;180;\n", ";", ",")
caso_csv("tabulador-salto-dentro", "Tabulador con un salto de línea dentro de un texto entre comillas",
  'id\tnota\tvalor\n1\t"línea uno\nlínea dos"\t3.5\n2\tsimple\t-2\n3\t\t1e3\n', "\t", ".")

# ---- libros .xlsx
suppressPackageStartupMessages(library(readxl))
celda <- function(x) {
  if (is.null(x) || (length(x) == 1 && is.na(x))) return("")
  if (inherits(x, "POSIXct")) {
    s <- format(x, "%Y-%m-%d %H:%M:%S", tz = "UTC")
    return(sub(" 00:00:00$", "", s))
  }
  if (is.logical(x)) return(if (x) "VERDADERO" else "FALSO")
  if (is.numeric(x)) return(x)
  as.character(x)
}
hoja_esperada <- function(ruta, hoja) {
  d <- suppressMessages(read_excel(ruta, sheet = hoja, col_names = FALSE, col_types = "list", .name_repair = "minimal"))
  filas <- lapply(seq_len(nrow(d)), function(i) lapply(d[i, ], function(col) celda(col[[1]])))
  vacia <- vapply(filas, function(f) all(vapply(f, function(v) identical(v, ""), logical(1))), logical(1))
  filas <- filas[!vacia]
  if (!length(filas)) return(list())
  # quitar columnas vacías a los lados
  ancho <- length(filas[[1]])
  llena <- vapply(seq_len(ancho), function(j) any(vapply(filas, function(f) !identical(f[[j]], ""), logical(1))), logical(1))
  rango <- range(which(llena))
  lapply(filas, function(f) unname(f[rango[1]:rango[2]]))
}
caso_libro <- function(archivo, titulo) {
  ruta <- readxl_example(archivo)
  hojas <- excel_sheets(ruta)
  b64 <- jsonlite::base64_enc(readBin(ruta, "raw", file.size(ruta)))
  esperado <- list(nombres = I(hojas), hojas = setNames(lapply(hojas, function(h) hoja_esperada(ruta, h)), hojas))
  sp_caso(sub("\\.xlsx$", "", archivo), objetivo = "hojas.leerLibroBase64", titulo = titulo,
    fuente = sprintf("Libro de ejemplo «%s» del paquete readxl", archivo),
    argumentos = list(b64), esperado = esperado, paquetes = "readxl",
    codigo = sprintf('read_excel(readxl_example("%s"), sheet, col_names = FALSE, col_types = "list")', archivo))
}
caso_libro("datasets.xlsx", "Cuatro hojas de datos clásicos (1 263 filas en total)")
caso_libro("deaths.xlsx", "Hojas con notas arriba y abajo, fechas y celdas vacías")
caso_libro("type-me.xlsx", "Lógicos, números guardados como texto, fechas y textos mezclados")
caso_libro("geometry.xlsx", "Datos que no empiezan en la celda A1")
caso_libro("clippy.xlsx", "Encabezado de dos filas y celdas combinadas")

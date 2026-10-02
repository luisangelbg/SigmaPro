# SigmaPro — genera datos/ejemplos.js con los conjuntos de ejemplo del bloque Datos.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
#
# Todos son ficticios y reproducibles (semilla fija), salvo tres publicados: los venenos de
# Box y Cox (1964, J. R. Stat. Soc. B 26: 211–252), cuadro 1, los chícharos de Mendel (1866) y la
# avena de Yates (1935). Cada ejemplo muestra algo: diseño en bloques, porcentajes para el arcoseno,
# cuadro latino, forma ancha con fechas, conteos con ceros y faltantes, Box-Cox, parcelas divididas,
# una covariable (ANCOVA) y regresión múltiple con colinealidad.
#
#   Rscript datos/generar-ejemplos.R        (desde la carpeta de SigmaPro)

csv_texto <- function(d) {
  con <- textConnection("salida", "w", local = TRUE)
  write.csv(d, con, row.names = FALSE, na = "NA", quote = TRUE, fileEncoding = "")
  close(con)
  # las columnas numéricas no llevan comillas; write.csv solo entrecomilla texto y factores
  paste(salida, collapse = "\n")
}
ejemplos <- list()
agregar <- function(id, nombre, descripcion, d, tipos = NULL) {
  ejemplos[[length(ejemplos) + 1]] <<- list(id = id, nombre = nombre, descripcion = descripcion,
                                           csv = csv_texto(d), tipos = tipos)
}

## 1. Maíz: 3 híbridos × 4 dosis de N en bloques completos al azar (la misma de la maqueta)
set.seed(2026)
d <- expand.grid(bloque = factor(1:4), hibrido = factor(c("H-40", "H-52", "H-66")), dosis = c(0, 60, 120, 180))
ef_bloque  <- c(0.25, 0.05, -0.10, -0.20)
ef_hibrido <- c("H-40" = -0.35, "H-52" = 0.10, "H-66" = 0.25)
resp_n <- function(n, h) (0.026 + 0.004 * (h == "H-66")) * n - (0.000085 + 0.00001 * (h == "H-66")) * n^2
d$rend <- round(4.6 + ef_bloque[d$bloque] + ef_hibrido[as.character(d$hibrido)] +
                resp_n(d$dosis, d$hibrido) + rnorm(nrow(d), 0, 0.22), 2)
d <- d[order(d$bloque, d$hibrido, d$dosis), c("bloque", "hibrido", "dosis", "rend")]
agregar("maiz", "Maíz: híbridos × nitrógeno",
        "Factorial 3 × 4 en bloques completos al azar; rendimiento de grano en t/ha (48 parcelas).", d)

## 2. Frijol: germinación con tratamientos pregerminativos (porcentajes; diseño completamente al azar)
set.seed(11)
trat <- c("Testigo", "Remojo 24 h", "GA3 100 ppm", "GA3 250 ppm", "Escarificación")
p <- c(0.38, 0.55, 0.71, 0.83, 0.93)
d <- data.frame(caja = sprintf("C%02d", 1:20), tratamiento = rep(trat, each = 4))   # caja: identificador de la unidad
d$sembradas <- 50
d$germinadas <- rbinom(nrow(d), 50, rep(p, each = 4))
d$germinacion <- 100 * d$germinadas / 50
agregar("frijol", "Frijol: germinación (%)",
        "Cinco tratamientos pregerminativos, 4 cajas de 50 semillas sembradas; el porcentaje pide el arcoseno o un modelo binomial.", d,
        list(tratamiento = list(tipo = "factor", niveles = trat)))

## 3. Trigo: cuadro latino 5 × 5 (hileras y columnas del terreno)
set.seed(5)
lat <- c("A", "B", "C", "D", "E")
cuadro <- sapply(0:4, function(k) lat[(0:4 + k) %% 5 + 1])          # cuadro cíclico
cuadro <- cuadro[sample(5), sample(5)]                               # aleatoriza hileras y columnas
ef_var <- c(A = 0, B = 0.42, C = -0.25, D = 0.61, E = 0.18)
d <- expand.grid(hilera = 1:5, columna = 1:5)
d$variedad <- cuadro[cbind(d$hilera, d$columna)]
d$rend <- round(5.2 + ef_var[d$variedad] + 0.09 * d$hilera - 0.07 * d$columna + rnorm(25, 0, 0.18), 2)
d <- d[order(d$hilera, d$columna), ]
agregar("trigo", "Trigo: cuadro latino 5 × 5",
        "Cinco variedades (A–E) con hileras y columnas como bloques; rendimiento en t/ha.", d,
        list(hilera = "factor", columna = "factor"))

## 4. Jitomate: altura de planta en invernadero, en forma ancha y con fecha de trasplante
set.seed(23)
d <- expand.grid(planta = 1:6, sustrato = c("Tezontle", "Fibra de coco", "Mezcla"), stringsAsFactors = FALSE)[, 2:1]
d$planta <- sprintf("P%02d", seq_len(nrow(d)))
d$trasplante <- format(as.Date("2026-02-10") + sample(0:3, nrow(d), TRUE), "%Y-%m-%d")
vel <- c("Tezontle" = 1.00, "Fibra de coco" = 1.12, "Mezcla" = 1.07)[d$sustrato]
for (dd in c(15, 30, 45, 60)) d[[paste0("altura_", dd, "dds")]] <- round(160 / (1 + exp(-(dd - 34) / 9)) * vel + rnorm(nrow(d), 0, 3), 1)
d$altura_60dds[c(5, 14)] <- NA                                       # dos plantas que se perdieron
agregar("jitomate", "Jitomate: altura en invernadero",
        "Tres sustratos, 6 plantas cada uno; alturas (cm) a los 15, 30, 45 y 60 días en forma ancha, para pasar a larga. Trae fechas y dos faltantes.", d)

## 5. Aguacate: conteo de trips por brote (conteos con ceros y faltantes)
set.seed(8)
trat <- c("Testigo", "Azadiractina", "Spinosad", "Jabón potásico", "Beauveria")
mu <- c(9, 4.5, 1.6, 5.5, 3.2)
d <- expand.grid(bloque = 1:6, tratamiento = trat, stringsAsFactors = FALSE)[, 2:1]
d <- d[order(d$bloque), c("bloque", "tratamiento")]
d$trips <- rnbinom(nrow(d), size = 6, mu = rep(mu, 6) * (1 + 0.15 * (d$bloque - 3.5) / 2.5))
d$trips[c(7, 22)] <- NA
agregar("aguacate", "Aguacate: trips por brote",
        "Cinco tratamientos en 6 bloques; conteos con ceros (piden √(x + 0.5) o un modelo de conteos) y dos faltantes.", d,
        list(tratamiento = list(tipo = "factor", niveles = trat)))

## 6. Venenos y tratamientos: los datos publicados por Box y Cox (1964), cuadro 1
tiempo <- c(0.31, 0.45, 0.46, 0.43, 0.82, 1.10, 0.88, 0.72, 0.43, 0.45, 0.63, 0.76, 0.45, 0.71, 0.66, 0.62,
            0.36, 0.29, 0.40, 0.23, 0.92, 0.61, 0.49, 1.24, 0.44, 0.35, 0.31, 0.40, 0.56, 1.02, 0.71, 0.38,
            0.22, 0.21, 0.18, 0.23, 0.30, 0.37, 0.38, 0.29, 0.23, 0.25, 0.24, 0.22, 0.30, 0.36, 0.31, 0.33)
d <- data.frame(veneno = rep(c("I", "II", "III"), each = 16), tratamiento = rep(rep(c("A", "B", "C", "D"), each = 4), 3),
                tiempo = tiempo)
p <- boot::poisons; p <- p[order(p$poison, p$treat), ]                      # cotejo celda por celda con la copia de R
stopifnot(identical(d$tiempo, p$time), identical(d$veneno, c("I", "II", "III")[p$poison]), identical(d$tratamiento, as.character(p$treat)))
agregar("venenos", "Venenos × tratamientos (Box y Cox, 1964)",
        "Datos publicados: tiempo de supervivencia (unidades de 10 h) de 48 animales; el ejemplo clásico de Box-Cox (λ cercana a −1).", d)

## 7. Chícharo: segregación dihíbrida de la F2 (Mendel, 1866), ya agregada por fenotipo
d <- data.frame(forma = c("redonda", "redonda", "rugosa", "rugosa"), color = c("amarilla", "verde", "amarilla", "verde"),
                semillas = c(315, 108, 101, 32))
d$fenotipo <- paste(d$forma, d$color)
d <- d[c("fenotipo", "forma", "color", "semillas")]
agregar("mendel", "Chícharo: segregación de Mendel",
        "Datos publicados de la F2 dihíbrida (Mendel, 1866): fenotipo (forma × color) de 556 semillas, ya contadas; para la bondad de ajuste 9:3:3:1 o 3:1 por carácter.", d,
        list(fenotipo = list(tipo = "factor", niveles = d$fenotipo), forma = list(tipo = "factor", niveles = c("redonda", "rugosa")),
             color = list(tipo = "factor", niveles = c("amarilla", "verde"))))

## 8. Avena en parcelas divididas: los datos publicados por Yates (1935)
rend <- c(111, 130, 157, 174, 117, 114, 161, 141, 105, 140, 118, 156, 61, 91, 97, 100, 70, 108, 126, 149, 96, 124, 121, 144,
          68, 64, 112, 86, 60, 102, 89, 96, 89, 129, 132, 124, 74, 89, 81, 122, 64, 103, 132, 133, 70, 89, 104, 117,
          62, 90, 100, 116, 80, 82, 94, 126, 63, 70, 109, 99, 53, 74, 118, 113, 89, 82, 86, 104, 97, 99, 119, 121)
d <- expand.grid(nitrogeno = c(0, 0.2, 0.4, 0.6), variedad = c("Victory", "Golden rain", "Marvellous"), bloque = c("I", "II", "III", "IV", "V", "VI"),
                 stringsAsFactors = FALSE)[, 3:1]
d$rendimiento <- rend
o <- MASS::oats                                                              # cotejo parcela por parcela con la copia de R
k <- match(paste(d$bloque, d$variedad, d$nitrogeno), paste(o$B, sub("Golden.rain", "Golden rain", o$V), as.numeric(sub("cwt", "", o$N))))
stopifnot(!anyNA(k), identical(as.numeric(d$rendimiento), as.numeric(o$Y[k])))
agregar("avena", "Avena en parcelas divididas (Yates, 1935)",
        "Datos publicados: 3 variedades en parcelas grandes y 4 dosis de nitrógeno (quintales por acre) en subparcelas, en 6 bloques; rendimiento en cuartos de libra por subparcela.", d,
        list(variedad = list(tipo = "factor", niveles = c("Victory", "Golden rain", "Marvellous")), bloque = list(tipo = "factor", niveles = c("I", "II", "III", "IV", "V", "VI"))))

## 9. Sorgo: variedades en bloques con el número de plantas por parcela (covariable de la ANCOVA)
set.seed(909)
d <- expand.grid(variedad = c("Línea 1", "Línea 2", "Línea 3", "Línea 4", "Línea 5", "Testigo"), bloque = 1:4, stringsAsFactors = FALSE)
d$plantas <- round(rnorm(nrow(d), 118, 10))                                 # plantas cosechadas: fallas de emergencia al azar
d$rend <- round(3.4 + c(0.55, 0.30, -0.05, 0.40, 0.15, -0.45)[match(d$variedad, unique(d$variedad))] +
                c(0.30, 0.10, -0.15, -0.25)[d$bloque] + 0.026 * (d$plantas - 118) + rnorm(nrow(d), 0, 0.14), 2)
d <- d[order(d$bloque), c("bloque", "variedad", "plantas", "rend")]
agregar("sorgo", "Sorgo: variedades y número de plantas",
        "Seis variedades en 4 bloques; rendimiento en t/ha y plantas cosechadas por parcela, la covariable para ajustar las medias (ANCOVA).", d,
        list(variedad = list(tipo = "factor", niveles = c("Línea 1", "Línea 2", "Línea 3", "Línea 4", "Línea 5", "Testigo"))))

## 10. Café: rendimiento de 40 fincas y las condiciones del sitio (regresión múltiple y selección de variables)
set.seed(1010)
n <- 40
d <- data.frame(finca = sprintf("F%02d", 1:n))
d$altitud <- round(runif(n, 900, 1700))
d$temperatura <- round(31.5 - 0.0062 * d$altitud + rnorm(n, 0, 0.45), 1)  # casi colineal con la altitud
d$lluvia <- round(runif(n, 1500, 2900))
d$materia_organica <- round(runif(n, 2, 7), 1)
d$ph <- round(runif(n, 4.6, 6.3), 1)
d$sombra <- round(runif(n, 15, 70))
d$edad <- round(runif(n, 3, 25))
d$rendimiento <- round(8 + 0.011 * (d$altitud - 1300) + 1.6 * d$materia_organica - 0.045 * d$sombra - 0.0009 * (d$lluvia - 2200) -
                       0.12 * pmax(d$edad - 12, 0) + rnorm(n, 0, 1.6), 1)
d$rendimiento[17] <- d$rendimiento[17] + 7                                  # una finca fuera de lo común
agregar("cafe", "Café: rendimiento y sitio",
        "Cuarenta fincas: rendimiento (quintales de café oro por hectárea) con altitud, temperatura, lluvia, materia orgánica, pH, sombra y edad del cafetal; para regresión, colinealidad (altitud y temperatura) y selección de variables.", d)

## escribir datos/ejemplos.js
js <- paste0(
  "/* SigmaPro — datos de ejemplo del bloque Datos. ARCHIVO GENERADO por datos/generar-ejemplos.R; no editar a mano.\n",
  "   Ficticios y reproducibles, salvo «venenos»: Box, G. E. P. y Cox, D. R. (1964). An analysis of transformations.\n",
  "   J. R. Stat. Soc. B 26: 211-252, cuadro 1; «mendel»: Mendel, G. (1866), Versuche über Pflanzen-Hybriden;\n",
  "   y «avena»: Yates, F. (1935). Complex experiments. Suppl. J. R. Stat. Soc. 2: 181-247. */\n",
  "window.SP_EJEMPLOS = ",
  jsonlite::toJSON(ejemplos, auto_unbox = TRUE, pretty = TRUE, null = "null"), ";\n")
salida <- file("datos/ejemplos.js", open = "w", encoding = "UTF-8")
writeLines(js, salida, sep = "")
close(salida)
cat("Escritos", length(ejemplos), "ejemplos en datos/ejemplos.js\n")

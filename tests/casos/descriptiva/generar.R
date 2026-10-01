# Descriptivos: cuantiles (nueve definiciones), asimetría y curtosis (tres definiciones) y el método completo.
suppressPackageStartupMessages(library(e1071))

# ---- cuantiles: cada caso recorre juntas las probabilidades y los nueve tipos
probs <- c(0, 0.001, 0.01, 0.05, 0.1, 0.2, 0.25, 1/3, 0.4, 0.5, 0.6, 2/3, 0.75, 0.8, 0.9, 0.95, 0.99, 0.999, 1)
cuantiles <- function(nombre, titulo, fuente, x, pr = probs) {
  g <- sp_rejilla(p = pr, tipo = 1:9)
  esperado <- mapply(function(p, t) quantile(x, p, type = t, names = FALSE, na.rm = TRUE), g$p, g$tipo)
  sp_caso(nombre, objetivo = "desc.cuantil", titulo = sprintf(titulo, nrow(g)), fuente = fuente,
    datos = data.frame(x = x), vectorizar = TRUE,
    argumentos = list(list(columna = "x"), sp_arg(g$p), sp_arg(g$tipo)), esperado = sp_arg(esperado),
    codigo = "mapply(function(p, t) quantile(x, p, type = t, na.rm = TRUE), p, tipo)")
}
cuantiles("precipitacion", "Precipitación anual de 70 ciudades: %d combinaciones de probabilidad y tipo",
  "McNeil (1977); conjunto precip de R", as.numeric(precip))
cuantiles("ozono-con-faltantes", "Ozono con 37 faltantes y empates: %d combinaciones",
  "Chambers y col. (1983); conjunto airquality de R", airquality$Ozone)
cuantiles("erupciones", "Duración de 272 erupciones (bimodal): %d combinaciones",
  "Azzalini y Bowman (1990); conjunto faithful de R", faithful$eruptions)
cuantiles("uno-a-diez-rejilla-fina", "1, 2, …, 10 con probabilidades en múltiplos de 1/20 (prueba el margen de 4ε): %d combinaciones",
  "Datos sintéticos", 1:10, seq(0, 1, by = 0.05))
cuantiles("n-uno", "Un solo valor: %d combinaciones", "Datos sintéticos", 4.2)
cuantiles("n-dos", "Dos valores: %d combinaciones", "Datos sintéticos", c(3.5, -1.25))
cuantiles("n-tres-negativos", "Tres valores con negativos: %d combinaciones", "Datos sintéticos", c(-7, 2.5, -0.5))

# ---- asimetría y curtosis: los tres tipos de Joanes y Gill (1998), como e1071
forma <- function(nombre, titulo, fuente, x) {
  sp_caso(paste0(nombre, "-asimetria"), objetivo = "desc.asimetria", titulo = paste(titulo, "(tipos 1, 2 y 3)"), fuente = fuente,
    datos = data.frame(x = x), vectorizar = TRUE, argumentos = list(list(columna = "x"), sp_arg(1:3)),
    esperado = sp_arg(sapply(1:3, function(t) skewness(x, na.rm = TRUE, type = t))), paquetes = c("e1071"),
    codigo = "sapply(1:3, function(t) e1071::skewness(x, na.rm = TRUE, type = t))")
  sp_caso(paste0(nombre, "-curtosis"), objetivo = "desc.curtosis", titulo = paste(titulo, "(tipos 1, 2 y 3)"), fuente = fuente,
    datos = data.frame(x = x), vectorizar = TRUE, argumentos = list(list(columna = "x"), sp_arg(1:3)),
    esperado = sp_arg(sapply(1:3, function(t) kurtosis(x, na.rm = TRUE, type = t))), paquetes = c("e1071"),
    codigo = "sapply(1:3, function(t) e1071::kurtosis(x, na.rm = TRUE, type = t))")
}
forma("precipitacion", "Precipitación de 70 ciudades", "McNeil (1977); conjunto precip de R", as.numeric(precip))
forma("ozono", "Ozono con faltantes, sesgado a la derecha", "Chambers y col. (1983); conjunto airquality de R", airquality$Ozone)
forma("insectos", "Conteos de insectos con muchos ceros", "Beall (1942); conjunto InsectSprays de R", InsectSprays$count)
forma("desplazado", "Cinco valores alrededor de mil millones", "Datos sintéticos", 1e9 + c(0.5, 1.25, 3, 7.5, 2))

# ---- el método completo: misma cuenta que la app, con base R y e1071
desc_r <- function(x, nivel, tipo_q, recorte, tipo_f, percentiles) {
  faltantes <- sum(is.na(x)); x <- x[!is.na(x)]; n <- length(x); xs <- sort(x); a <- (1 - nivel) / 2
  q <- if (n) quantile(x, c(0.25, 0.75), type = tipo_q, names = FALSE) else c(NA, NA)
  r <- rle(xs); m <- if (n) max(r$lengths) else 0
  k <- if (n) qbinom(a, n, 0.5) else 0
  icv <- if (n >= 2) (n - 1) * var(x) / qchisq(c(1 - a, a), n - 1) else c(NA, NA)
  ica <- if (n >= 2) mean(x) + c(-1, 1) * qt(1 - a, n - 1) * sd(x) / sqrt(n) else c(NA, NA)
  ea <- if (n >= 3) sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3))) else NA
  ek <- if (n >= 4) 2 * ea * sqrt((n^2 - 1) / ((n - 3) * (n + 5))) else NA
  out <- list(
    n = n, faltantes = faltantes, media = if (n) mean(x) else NA, mediana = if (n) median(x) else NA,
    moda = if (m > 1) min(r$values[r$lengths == m]) else NA, modas = if (m > 1) sum(r$lengths == m) else 0,
    frec_moda = if (m > 1) m else NA,
    de = if (n >= 2) sd(x) else NA, varianza = if (n >= 2) var(x) else NA, ee = if (n >= 2) sd(x) / sqrt(n) else NA,
    cv = if (n >= 2) 100 * sd(x) / mean(x) else NA,
    min = if (n) min(x) else NA, max = if (n) max(x) else NA, rango = if (n) max(x) - min(x) else NA,
    q1 = q[1], q3 = q[2], ric = q[2] - q[1],
    media_recortada = if (n) mean(x, trim = recorte) else NA,
    media_geometrica = if (n && all(x > 0)) exp(mean(log(x))) else NA,
    media_armonica = if (n && all(x > 0)) 1 / mean(1 / x) else NA,
    asimetria = if (n && !(tipo_f == 2 && n < 3)) skewness(x, type = tipo_f) else NA,
    curtosis = if (n && !(tipo_f == 2 && n < 4)) kurtosis(x, type = tipo_f) else NA,   # e1071 exige n ≥ 3 y n ≥ 4 en el tipo 2
    ee_asimetria = ea, ee_curtosis = ek,
    ic_media_inf = ica[1], ic_media_sup = ica[2],
    ic_mediana_inf = if (k >= 1) xs[k] else NA, ic_mediana_sup = if (k >= 1) xs[n - k + 1] else NA,
    ic_mediana_nivel = if (k >= 1) 1 - 2 * pbinom(k - 1, n, 0.5) else NA,
    ic_varianza_inf = icv[1], ic_varianza_sup = icv[2], ic_de_inf = sqrt(icv[1]), ic_de_sup = sqrt(icv[2]))
  for (p in percentiles) out[[paste0("p", signif(p * 100, 12))]] <- if (n) quantile(x, p, type = tipo_q, names = FALSE) else NA
  out
}
# grupos anidados (el primer factor cambia más despacio), solo combinaciones presentes, sin filas con factor faltante
descriptivos <- function(nombre, titulo, fuente, datos, variables, grupos = character(0), nivel = 0.95, tipo_q = 7,
                         recorte = 0.1, tipo_f = 2, percentiles = numeric(0)) {
  if (length(grupos)) {
    g <- interaction(lapply(datos[grupos], factor), lex.order = TRUE, drop = TRUE)
    excluidas <- sum(is.na(g))
    filas <- split(seq_len(nrow(datos)), g)
  } else {
    excluidas <- 0; filas <- list(seq_len(nrow(datos)))
  }
  tabla <- list(variable = character(0), grupo = setNames(lapply(grupos, function(f) character(0)), grupos))
  for (v in variables) for (fi in filas) {
    r <- desc_r(datos[[v]][fi], nivel, tipo_q, recorte, tipo_f, percentiles)
    tabla$variable <- c(tabla$variable, v)
    for (f in grupos) tabla$grupo[[f]] <- c(tabla$grupo[[f]], as.character(factor(datos[[f]])[fi[1]]))
    for (k in names(r)) tabla[[k]] <- c(tabla[[k]], r[[k]])
  }
  tabla$variable <- I(tabla$variable)
  tabla$grupo <- lapply(tabla$grupo, I)
  for (k in setdiff(names(tabla), c("variable", "grupo"))) tabla[[k]] <- I(tabla[[k]])
  if (!length(grupos)) tabla$grupo <- setNames(list(), character(0))
  opciones <- list(nivel = nivel, tipoCuantil = tipo_q, recorte = recorte, tipoForma = tipo_f, percentiles = I(percentiles))
  sp_caso(nombre, objetivo = "descriptivos", tipo = "metodo", titulo = titulo, fuente = fuente,
    datos = datos[c(grupos, variables)], entradas = list(variables = I(variables), grupos = I(grupos)), opciones = opciones,
    esperado = list(variables = I(variables), factores = I(grupos), excluidas = excluidas, tabla = tabla),
    paquetes = c("stats", "e1071"),
    codigo = sprintf("Por grupo: n, media, mediana, moda (rle), sd, var, cuantiles type = %d, mean(trim = %g), media geométrica y armónica, e1071::skewness/kurtosis(type = %d), IC de la media (qt), de la mediana (qbinom) y de la varianza (qchisq) al %g; grupos = interaction(%s, lex.order = TRUE, drop = TRUE)",
      tipo_q, recorte, tipo_f, nivel, paste(grupos, collapse = ", ")))
}

descriptivos("plantas", "Peso seco de plantas por tratamiento, con percentiles 5 y 95", "Dobson (1983); conjunto PlantGrowth de R",
  PlantGrowth, "weight", "group", percentiles = c(0.05, 0.95))
descriptivos("npk-tres-factores", "Rendimiento de chícharo por N × P × K: grupos de 3 (sin IC de la mediana ni curtosis tipo 2)",
  "Yates (1935); conjunto npk de R", npk, "yield", c("N", "P", "K"))
descriptivos("ozono-por-mes", "Ozono, radiación y temperatura por mes, con faltantes; 90 %, cuantil tipo 6, recorte 20 %, forma tipo 1",
  "Chambers y col. (1983); conjunto airquality de R", airquality, c("Ozone", "Solar.R", "Temp"), "Month",
  nivel = 0.90, tipo_q = 6, recorte = 0.2, tipo_f = 1)
descriptivos("insectos", "Conteos de insectos por insecticida: empates, varias modas y ceros; cuantil tipo 2, forma tipo 3",
  "Beall (1942); conjunto InsectSprays de R", InsectSprays, "count", "spray", tipo_q = 2, tipo_f = 3)
descriptivos("dientes-dosis-numerica", "Longitud de odontoblastos por suplemento × dosis (dosis numérica); 99 %, cuantil tipo 9",
  "Crampton (1947); conjunto ToothGrowth de R", ToothGrowth, "len", c("supp", "dose"), nivel = 0.99, tipo_q = 9)
descriptivos("erupciones-sin-grupos", "Duración y espera de 272 erupciones, sin agrupar, con percentiles 2.5, 10, 90 y 97.5",
  "Azzalini y Bowman (1990); conjunto faithful de R", faithful, c("eruptions", "waiting"), percentiles = c(0.025, 0.1, 0.9, 0.975))
pg <- PlantGrowth; pg$group[c(4, 17, 25)] <- NA
descriptivos("plantas-factor-faltante", "Peso seco con tres filas sin tratamiento: quedan fuera y se cuentan",
  "Dobson (1983); conjunto PlantGrowth de R, con tres tratamientos borrados", pg, "weight", "group")

# Bloque Datos: expresiones (variables calculadas y filtros), transformaciones y Box-Cox.

# ---- datos de prueba con faltantes, factores, porcentajes y empates para round()
set.seed(2026)
d <- data.frame(
  bloque = factor(rep(1:3, each = 8)),
  hibrido = factor(rep(c("H-40", "H-52", "H-66", "H-70"), 6), levels = c("H-40", "H-52", "H-66", "H-70")),
  dosis = rep(c(0, 60, 120, 180), each = 2, times = 3),
  rend = round(rnorm(24, 6, 1.2), 3),
  altura = c(1.25, 2.5, 0.15, 1.75, 2.05, 1.3, 2.25, 0.35, round(runif(16, 0.5, 2.8), 2)),
  germ = round(runif(24, 40, 99), 1)
)
d$rend[c(5, 17)] <- NA
fuente <- "Datos sintéticos con faltantes, factores y empates para el redondeo"

exprs <- list(
  "aritmetica" = "log(rend) + 2 * altura",
  "estandarizar" = "(rend - mean(rend, na.rm = TRUE)) / sd(rend, na.rm = TRUE)",
  "condicion-numerica" = "ifelse(dosis > 60, rend - 1, NA)",
  "raiz" = "sqrt(altura + 0.5)",
  "resto" = "rend %% 2",
  "redondeo-con-empates" = "round(altura, 1)",
  "redondeo-entero" = "round(altura * 2)",
  "filtro-y" = 'dosis >= 60 & hibrido != "H-40"',
  "pertenencia" = 'hibrido %in% c("H-52", "H-66")',
  "logica-con-faltantes" = "!is.na(rend) | altura > 2",
  "maximo-paralelo" = "pmax(rend, 5)",
  "arcoseno" = "asin(sqrt(germ / 100))",
  "precedencia" = "-2^2 + rend^2",
  "logaritmos" = "log(altura, 2) + log10(dosis + 1)",
  "condicion-texto" = 'ifelse(rend > mean(rend, na.rm = TRUE), "alto", "bajo")',
  "pegar" = 'paste(hibrido, dosis, sep = "-")',
  "logico-por-numero" = "is.na(rend) * 1"
)
for (nom in names(exprs)) {
  e <- exprs[[nom]]
  r <- with(d, eval(parse(text = e)))
  if (is.factor(r)) r <- as.character(r)
  sp_caso(nom, objetivo = "expresiones.enTabla", titulo = e, fuente = fuente, datos = d,
    argumentos = list(list(tabla = TRUE), e), esperado = I(r), codigo = sprintf("with(datos, %s)", e))
}

# ---- transformaciones (siempre a columna nueva)
x <- data.frame(y = c(0.8, 2.5, 4.1, 7.9, 12.4, 0.35, 19.6, 3.3, 5.5, NA, 9.1, 1.7))
p <- data.frame(pct = c(0, 3.5, 12, 50, 77.7, 99, 100, NA, 41.2))
sp_caso("log", objetivo = "transformar.aplicar", titulo = "Logaritmo natural", fuente = "Datos sintéticos", datos = x,
  argumentos = list("log", list(columna = "y"), list()), esperado = I(log(x$y)), codigo = "log(y)")
sp_caso("log10", objetivo = "transformar.aplicar", titulo = "Logaritmo base 10", fuente = "Datos sintéticos", datos = x,
  argumentos = list("log10", list(columna = "y"), list()), esperado = I(log10(x$y)), codigo = "log10(y)")
sp_caso("log-mas-c", objetivo = "transformar.aplicar", titulo = "ln(x + 1), para conteos con ceros", fuente = "Datos sintéticos",
  datos = data.frame(y = c(0, 1, 3, 0, 12, 7, 0, 25)), argumentos = list("logc", list(columna = "y"), list(c = 1)),
  esperado = I(log(c(0, 1, 3, 0, 12, 7, 0, 25) + 1)), codigo = "log(y + 1)")
sp_caso("raiz-mas-medio", objetivo = "transformar.aplicar", titulo = "√(x + 0.5)", fuente = "Datos sintéticos", datos = x,
  argumentos = list("raiz05", list(columna = "y"), list()), esperado = I(sqrt(x$y + 0.5)), codigo = "sqrt(y + 0.5)")
sp_caso("arcoseno-porcentaje", objetivo = "transformar.aplicar", titulo = "Arcoseno de la raíz de un porcentaje (radianes)",
  fuente = "Datos sintéticos", datos = p, argumentos = list("arcoseno", list(columna = "pct"), list(porcentaje = TRUE)),
  esperado = I(asin(sqrt(p$pct / 100))), codigo = "asin(sqrt(pct / 100))")
sp_caso("arcoseno-grados", objetivo = "transformar.aplicar", titulo = "Arcoseno de la raíz de un porcentaje (grados)",
  fuente = "Datos sintéticos", datos = p, argumentos = list("arcoseno", list(columna = "pct"), list(porcentaje = TRUE, grados = TRUE)),
  esperado = I(asin(sqrt(p$pct / 100)) * 180 / pi), codigo = "asin(sqrt(pct / 100)) * 180 / pi")
sp_caso("boxcox-lambda-dado", objetivo = "transformar.aplicar", titulo = "Box-Cox con λ = 0.37", fuente = "Datos sintéticos",
  datos = x, argumentos = list("boxcox", list(columna = "y"), list(lambda = 0.37)), esperado = I((x$y^0.37 - 1) / 0.37),
  codigo = "(y^0.37 - 1) / 0.37")
sp_caso("estandarizar", objetivo = "transformar.aplicar", titulo = "Estandarizar (media 0, DE 1)", fuente = "Datos sintéticos",
  datos = x, argumentos = list("estandarizar", list(columna = "y"), list()), esperado = I(as.vector(scale(x$y))),
  codigo = "as.vector(scale(y))")

# ---- Box-Cox: λ por verosimilitud perfilada (exacta), con su IC del 95 %
boxcox_ref <- function(f, datos) {
  mf <- model.frame(f, datos)
  y <- model.response(mf)
  X <- model.matrix(f, mf)
  qx <- qr(X)
  n <- length(y)
  gm <- exp(mean(log(y)))
  ll <- function(la) {
    z <- if (abs(la) < 1e-300) gm * log(y) else (y^la - 1) / (la * gm^(la - 1))
    -n / 2 * log(sum(qr.resid(qx, z)^2))
  }
  o <- optimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12)
  corte <- o$objective - qchisq(0.95, 1) / 2
  g <- function(la) ll(la) - corte
  ic <- c(uniroot(g, c(-5, o$maximum), tol = 1e-12)$root, uniroot(g, c(o$maximum, 5), tol = 1e-12)$root)
  list(lambda = o$maximum, ic = I(ic), loglik = o$objective, n = n)
}
codigo_bc <- paste(
  "ll <- function(la) -n/2 * log(sum(qr.resid(qr(X), (y^la - 1) / (la * gm^(la - 1)))^2))   # gm = media geométrica",
  "optimize(ll, c(-5, 5), maximum = TRUE, tol = 1e-12); IC: uniroot de ll(la) = máx − qchisq(0.95, 1)/2", sep = "\n")

venenos <- boot::poisons
venenos$poison <- factor(venenos$poison); venenos$treat <- factor(venenos$treat)
sp_caso("venenos-box-cox-1964", objetivo = "transformar.boxcoxResumen", clase = "D",
  titulo = "Tiempos de supervivencia, 3 venenos × 4 tratamientos (ejemplo original de Box y Cox; publicaron λ ≈ −0.75)",
  fuente = "Box y Cox (1964); conjunto poisons del paquete boot", datos = venenos,
  argumentos = list(list(tabla = TRUE), "time", "poison * treat"),
  esperado = boxcox_ref(time ~ poison * treat, venenos), paquetes = c("stats", "boot"), codigo = codigo_bc)
arboles <- datasets::trees
sp_caso("arboles-regresion", objetivo = "transformar.boxcoxResumen", clase = "D",
  titulo = "Volumen de 31 cerezos contra altura y diámetro", fuente = "Ryan, Joiner y Ryan (1976); conjunto trees de R",
  datos = arboles, argumentos = list(list(tabla = TRUE), "Volume", "Height + Girth"),
  esperado = boxcox_ref(Volume ~ Height + Girth, arboles), codigo = codigo_bc)
oz <- data.frame(Ozone = airquality$Ozone)
sp_caso("ozono-sin-modelo", objetivo = "transformar.boxcoxResumen", clase = "D",
  titulo = "Ozono diario, solo la media (116 observaciones; los faltantes se omiten)",
  fuente = "Chambers y col. (1983); conjunto airquality de R", datos = oz,
  argumentos = list(list(tabla = TRUE), "Ozone"), esperado = boxcox_ref(Ozone ~ 1, oz[!is.na(oz$Ozone), , drop = FALSE]), codigo = codigo_bc)

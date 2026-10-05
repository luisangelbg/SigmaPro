# Regresión no lineal (núcleo JS: Levenberg-Marquardt con gradiente analítico). La referencia (tests/r/nolineal.R) ajusta
# con nls y el mismo gradiente, pule el óptimo con Gauss-Newton y calcula los EE, los derivados (método delta) y las
# pruebas F de comparación de curvas. Cubre los ocho modelos, una curva y varias por grupo, dosis cero en el
# log-logístico y lineal-meseta por perfil (clase D).
source(file.path("..", "..", "r", "nolineal.R"), encoding = "UTF-8")

F_ORANGE <- "Draper y Smith (1998), Applied Regression Analysis; conjunto Orange de R (Pinheiro y Bates 2000)"
F_CHICK <- "Crowder y Hand (1990), Analysis of Repeated Measures; conjunto ChickWeight de R (pollo 6)"
F_DNASE <- "Davidian y Giltinan (1995), Nonlinear Models for Repeated Measurement Data; conjunto DNase de R (corrida 1, log de la concentración)"
F_LOB <- "Kung (1986), Proceedings of the Fourth Southern Silvicultural Research Conference; conjunto Loblolly de R (semilla 329)"
F_SINT <- "Datos sintéticos (generados en este archivo)"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

F_LETTUCE <- "van Ewijk y Hoekstra (1993), Ecotoxicology and Environmental Safety 25: 25-32; conjunto lettuce de drc (Ritz et al. 2015)"
F_PURO <- "Treloar (1974); Bates y Watts (1988), Nonlinear Regression Analysis and Its Applications; conjunto Puromycin de R"

caso_nl <- function(nombre, objetivo, titulo, fuente, datos, y, x, modelo, grupo = "", pesos = "", intervalo = "wald", precios = NULL) {
  r <- ref_nolineal(datos, y, x, modelo, grupo, pesos = pesos, intervalo = intervalo, precios = precios)
  op <- c(list(modelo = modelo), if (intervalo != "wald") list(intervalo = intervalo), if (!is.null(precios)) list(precioProducto = precios[["producto"]], precioInsumo = precios[["insumo"]]))
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = if (objetivo == "curva-crecimiento") ent(respuesta = y, x = x, grupo = grupo, pesos = pesos) else ent(respuesta = y, dosis = x, grupo = grupo, pesos = pesos),
    opciones = op, esperado = r, paquetes = c("stats", if (modelo %in% c("bc5", "bc4", "mm3")) "drc", if (any(grepl("^bc", modelo)) || !is.null(precios)) "numDeriv"),
    codigo = sprintf("nls(%s ~ <modelo %s con gradiente analítico>%s%s) pulido con Gauss-Newton; EE de σ²(J'J)⁻¹; %s; método delta%s; anova(curva común, una por grupo)",
                     y, modelo, if (nzchar(grupo)) paste0(" por ", grupo) else "", if (nzchar(pesos)) paste0(", weights = ", pesos) else "",
                     if (intervalo == "perfil") "IC por perfil (uniroot de τ = ±t con los demás reajustados)" else "IC de Wald con t",
                     if (!is.null(precios)) sprintf("; dosis económica: f'(x) = %g (D() y uniroot, gradiente de numDeriv)", precios[["insumo"]] / precios[["producto"]]) else ""))
}
#' Elección del modelo por AIC: cada modelo de la familia y, del elegido, todo lo demás.
caso_aic <- function(nombre, objetivo, titulo, fuente, datos, y, x, modelos, grupo = "") {
  s <- ref_nolineal_aic(datos, y, x, modelos, grupo)
  r <- ref_nolineal(datos, y, x, s$elegido, grupo)
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = if (objetivo == "curva-crecimiento") ent(respuesta = y, x = x, grupo = grupo) else ent(respuesta = y, dosis = x, grupo = grupo),
    opciones = list(modelo = "auto"), esperado = c(list(modelo = s$elegido, seleccion = s$seleccion), r), paquetes = c("stats", "drc"),
    codigo = sprintf("cada modelo (%s) con nls pulido; AIC = −2 log L + 2(p + 1); ΔAIC y pesos de Akaike; el de menor AIC con su ajuste completo", paste(modelos, collapse = ", ")))
}


# ---- crecimiento
o <- data.frame(arbol = factor(as.character(Orange$Tree), levels = c("1", "2", "3", "4", "5")), edad = Orange$age, circunferencia = Orange$circumference)
caso_nl("naranjos-logistico", "curva-crecimiento", "Logístico de los cinco naranjos juntos", F_ORANGE, o, "circunferencia", "edad", "logistico")
caso_nl("naranjos-por-arbol", "curva-crecimiento", "Logístico por árbol con la comparación de curvas y de cada parámetro", F_ORANGE, o, "circunferencia", "edad", "logistico", grupo = "arbol")
ch <- subset(ChickWeight, Chick == 6 & Time > 0); ch <- data.frame(dia = ch$Time, peso = ch$weight)
caso_nl("pollo-weibull", "curva-crecimiento", "Weibull del peso de un pollo", F_CHICK, ch, "peso", "dia", "weibull")
dn <- subset(DNase, Run == 1); dn <- data.frame(log_conc = log(dn$conc), densidad = dn$density)
caso_nl("dnasa-gompertz", "curva-crecimiento", "Gompertz con su punto de inflexión", F_DNASE, dn, "densidad", "log_conc", "gompertz")

# ---- dosis-respuesta
set.seed(71)
dr <- expand.grid(rep = 1:4, dosis = c(0, 10, 25, 50, 100, 200, 400), herbicida = c("A", "B"))
dr$peso_seco <- round(with(dr, 0.4 + (5 - 0.4) / (1 + exp(1.8 * (log(dosis) - log(ifelse(herbicida == "A", 60, 140))))) + rnorm(nrow(dr), 0, 0.25)), 3)
dr$herbicida <- factor(dr$herbicida); dr <- dr[c("herbicida", "rep", "dosis", "peso_seco")]
caso_nl("herbicidas-ll4", "dosis-respuesta", "Log-logístico de 4 parámetros con dosis cero: DE10, DE50 y DE90 de dos herbicidas y su comparación", F_SINT, dr, "peso_seco", "dosis", "ll4", grupo = "herbicida")
set.seed(73)
d3 <- expand.grid(rep = 1:3, dosis = c(0.5, 1, 2, 4, 8, 16, 32))
d3$germinacion <- round(92 / (1 + exp(2.2 * (log(d3$dosis) - log(5)))) + rnorm(nrow(d3), 0, 3), 1)
d3 <- d3[c("rep", "dosis", "germinacion")]; d3$germinacion[c(4, 15)] <- NA
caso_nl("toxico-ll3", "dosis-respuesta", "Log-logístico de 3 parámetros (límite inferior en 0) con dos faltantes", F_SINT, d3, "germinacion", "dosis", "ll3")

# ---- meseta
set.seed(72)
nm <- expand.grid(rep = 1:4, N = c(0, 40, 80, 120, 160, 200, 240), hibrido = c("H1", "H2"))
nm$rendimiento <- round(with(nm, ifelse(hibrido == "H1", pmin(4 + 0.035 * N, 4 + 0.035 * 140), pmin(3.5 + 0.03 * N, 3.5 + 0.03 * 170)) + rnorm(nrow(nm), 0, 0.3)), 3)
nm$hibrido <- factor(nm$hibrido); nm <- nm[c("hibrido", "rep", "N", "rendimiento")]
caso_nl("maiz-lineal-meseta", "respuesta-meseta", "Lineal-meseta por híbrido: dosis óptima, meseta, dosis económica, curva común y cada parámetro común", F_SINT, nm, "rendimiento", "N", "lineal-meseta", grupo = "hibrido", precios = c(producto = 5000, insumo = 25))
caso_nl("maiz-cuadratico-meseta", "respuesta-meseta", "Cuadrático-meseta por híbrido con la prueba de cada parámetro y la dosis económica", F_SINT, nm, "rendimiento", "N", "cuadratico-meseta", grupo = "hibrido", precios = c(producto = 5000, insumo = 25))
caso_nl("maiz-lineal-meseta-una", "respuesta-meseta", "Lineal-meseta de un híbrido", F_SINT, nm[nm$hibrido == "H1", c("N", "rendimiento")], "rendimiento", "N", "lineal-meseta")
lb <- Loblolly[Loblolly$Seed == "329", ]; lb <- data.frame(edad = lb$age, altura = lb$height)
caso_nl("pino-mitscherlich", "respuesta-meseta", "Mitscherlich (asintótico) de la altura de un pino", F_LOB, lb, "altura", "edad", "mitscherlich")

# ---- Fase 4: Brain-Cousens (hormesis), Michaelis-Menten, pesos, perfiles, dosis económica y elección por AIC
lt <- data.frame(concentracion = drc::lettuce$conc, peso = drc::lettuce$weight)
caso_nl("lechuga-bc5", "dosis-respuesta", "Brain-Cousens de 5 parámetros (hormesis): DE50, dosis y respuesta máximas", F_LETTUCE, lt, "peso", "concentracion", "bc5")
caso_nl("lechuga-bc4-perfil", "dosis-respuesta", "Brain-Cousens de 4 parámetros con intervalos por verosimilitud perfilada", F_LETTUCE, lt, "peso", "concentracion", "bc4", intervalo = "perfil")
caso_aic("lechuga-aic", "dosis-respuesta", "Elección por AIC entre log-logísticos y Brain-Cousens con hormesis", F_LETTUCE, lt, "peso", "concentracion", c("ll4", "ll3", "bc5", "bc4"))
pu <- data.frame(estado = factor(as.character(Puromycin$state), levels = c("treated", "untreated")), concentracion = Puromycin$conc, velocidad = Puromycin$rate)
put <- pu[pu$estado == "treated", c("concentracion", "velocidad")]
caso_nl("puromicina-mm2-perfil", "respuesta-meseta", "Michaelis-Menten con intervalos perfilados y la dosis económica", F_PURO, put, "velocidad", "concentracion", "mm2", intervalo = "perfil", precios = c(producto = 10, insumo = 200))
caso_nl("puromicina-mm3-estados", "respuesta-meseta", "Michaelis-Menten con respuesta sin dosis por estado, perfiles y comparación de cada parámetro", F_PURO, pu, "velocidad", "concentracion", "mm3", grupo = "estado", intervalo = "perfil")
caso_aic("puromicina-aic", "respuesta-meseta", "Elección por AIC entre los cinco modelos con meseta", F_PURO, put, "velocidad", "concentracion", c("lineal-meseta", "cuadratico-meseta", "mitscherlich", "mm2", "mm3"))
set.seed(74)
gp <- expand.grid(caja = 1:3, dosis = c(0, 1, 2, 4, 8, 16, 32, 64))
gp$semillas <- sample(20:50, nrow(gp), replace = TRUE)
gp$germinacion <- round(8 + (90 - 8) / (1 + exp(1.6 * (log(gp$dosis) - log(9)))) + rnorm(nrow(gp), 0, 25 / sqrt(gp$semillas)), 1)
gp <- gp[c("dosis", "caja", "semillas", "germinacion")]; gp$semillas[5] <- 0; gp$germinacion[11] <- NA
caso_nl("germinacion-pesos-perfil", "dosis-respuesta", "Log-logístico ponderado por el número de semillas de cada caja (un peso cero y un faltante), con perfiles", F_SINT, gp, "germinacion", "dosis", "ll4", pesos = "semillas", intervalo = "perfil")
set.seed(75)
tr <- expand.grid(rep = 1:4, N = c(0, 30, 60, 90, 120, 180, 240))
tr$parcelas <- rep(c(2, 3, 3, 4), 7)
tr$rendimiento <- round(6.8 - 4.1 * exp(-0.012 * tr$N) + rnorm(nrow(tr), 0, 0.35 / sqrt(tr$parcelas)), 3)
tr <- tr[c("rep", "N", "parcelas", "rendimiento")]
caso_nl("trigo-mitscherlich-economica", "respuesta-meseta", "Mitscherlich ponderado por parcelas con la dosis económica y su respuesta", F_SINT, tr, "rendimiento", "N", "mitscherlich", pesos = "parcelas", precios = c(producto = 6000, insumo = 22))

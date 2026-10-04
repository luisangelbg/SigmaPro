# Supervivencia (núcleo JS). La referencia (tests/r/supervivencia.R) es el paquete survival: survfit y quantile para
# Kaplan-Meier (intervalos log, log-log y plain), survdiff para log-rank y Peto-Peto, y coxph (Efron y Breslow, pulido
# con eps = 1e-12) con cox.zph para el modelo de Cox. Datos sintéticos con empates (días enteros), censura al final del
# ensayo y censuras en medio, una curva que se queda justo en 0.5 (la mediana es el punto medio) y otra que llega a 0.
source(file.path("..", "..", "r", "supervivencia.R"), encoding = "UTF-8")
F_SINT <- "Datos sintéticos (generados en este archivo); referencia: paquete survival de R (Therneau, 2024)"
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_km <- function(nombre, titulo, datos, tiempo, evento, grupo = "", conf = "log", nivel = 0.95, rho = 0, estrato = "") {
  r <- ref_km(datos, tiempo, evento, grupo, conf, nivel, rho, estrato)
  sp_caso(nombre, objetivo = "kaplan-meier", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "A", datos = datos,
    entradas = ent(tiempo = tiempo, evento = evento, grupo = grupo, estrato = estrato), opciones = list(conf = conf, nivel = nivel, rho = rho), esperado = r,
    paquetes = "survival", codigo = sprintf("survfit(Surv(%s, %s) ~ %s, conf.type = \"%s\", conf.int = %s); quantile(); survdiff(rho = %s)", tiempo, evento, if (nzchar(grupo)) grupo else "1", conf, nivel, rho))
}
caso_cox <- function(nombre, titulo, datos, tiempo, evento, factores = character(0), covariables = character(0), empates = "efron", nivel = 0.95, estrato = "") {
  r <- ref_cox(datos, tiempo, evento, factores, covariables, empates, nivel, estrato)
  sp_caso(nombre, objetivo = "cox", tipo = "metodo", titulo = titulo, fuente = F_SINT, clase = "D", datos = datos,
    entradas = ent(tiempo = tiempo, evento = evento, factores = factores, covariables = covariables, estrato = estrato), opciones = list(empates = empates, nivel = nivel), esperado = r,
    paquetes = "survival", codigo = sprintf("coxph(Surv(%s, %s) ~ %s, ties = \"%s\", control = coxph.control(eps = 1e-12, iter.max = 100)); cox.zph(fit)",
      tiempo, evento, paste(c(factores, covariables, if (nzchar(estrato)) sprintf("strata(%s)", estrato)), collapse = " + "), empates))
}

# ---- 1. germinación: días hasta germinar de 3 tratamientos pregerminativos, censura a los 21 días (no germinó)
set.seed(321)
trat <- rep(c("Escarificada", "Remojo", "Testigo"), each = 30)
tasa <- c(Escarificada = 1 / 5, Remojo = 1 / 8, Testigo = 1 / 16)[trat]
dias <- ceiling(rexp(90, tasa)); germino <- as.integer(dias <= 21); dias[dias > 21] <- 21
germ <- data.frame(tratamiento = factor(trat), dias = dias, germino = germino)
caso_km("germinacion-log-rank", "Días hasta germinar con tres tratamientos (empates, censura a los 21 días), log-rank", germ, "dias", "germino", "tratamiento")
caso_km("germinacion-log-log-peto", "Los mismos datos con intervalos log-log, 90 % y la prueba de Peto-Peto", germ, "dias", "germino", "tratamiento", conf = "log-log", nivel = 0.9, rho = 1)
caso_cox("germinacion-cox-efron", "Cox con el tratamiento (Efron, muchos empates)", germ, "dias", "germino", factores = "tratamiento")
caso_cox("germinacion-cox-breslow", "Cox con el tratamiento (Breslow)", germ, "dias", "germino", factores = "tratamiento", empates = "breslow")

# ---- 2. una sola curva sin grupo, intervalo plain, con la mediana en un tramo plano (S = 0.5) y la curva hasta 0
cur <- data.frame(t = c(1, 2, 3, 4, 5, 6, 7, 8, 9, 10), e = c(1, 1, 1, 0, 1, 1, 0, 1, 0, 1))
caso_km("una-curva-plain-hasta-cero", "Una curva con censuras en medio, intervalo plain, que llega a 0", cur, "t", "e", conf = "plain")
med <- data.frame(t = c(1, 2, 3, 4, 5, 6), e = c(1, 1, 1, 0, 1, 0))
caso_km("mediana-punto-medio", "La curva se queda justo en 0.5: la mediana es el punto medio del tramo", med, "t", "e")

# ---- 3. bioensayo: horas hasta la muerte de insectos con dos insecticidas y testigo, peso del insecto, censura a 72 h y faltantes
set.seed(322)
n <- 60
bio <- data.frame(insecticida = factor(rep(c("A", "B", "Testigo"), each = 20)), peso = round(rnorm(n, 12, 2.5), 1))
lam <- exp(c(A = 0.9, B = 0.4, Testigo = -0.8)[as.character(bio$insecticida)] - 0.08 * (bio$peso - 12)) / 20
h <- rweibull(n, 1.4, 1 / lam)
bio$horas <- round(pmin(h, 72), 1); bio$muerto <- as.integer(h <= 72)
bio$horas[c(5, 33)] <- NA; bio$peso[47] <- NA
caso_km("bioensayo-tres-grupos", "Horas hasta la muerte con dos insecticidas y testigo (faltantes)", bio, "horas", "muerto", "insecticida")
caso_cox("bioensayo-cox-factor-covariable", "Cox con el insecticida y el peso del insecto (Efron)", bio, "horas", "muerto", factores = "insecticida", covariables = "peso")
caso_cox("bioensayo-cox-breslow-90", "El mismo modelo con Breslow e intervalos al 90 %", bio, "horas", "muerto", factores = "insecticida", covariables = "peso", empates = "breslow", nivel = 0.9)

# ---- 4. plántulas en vivero: semanas de supervivencia con dos covariables numéricas (riego y sombra), efecto que cambia con el tiempo
set.seed(323)
n <- 80
viv <- data.frame(riego = round(runif(n, 2, 8), 1), sombra = round(runif(n, 0, 60)))
x <- -0.35 * (viv$riego - 5) + 0.02 * (viv$sombra - 30)
s <- ifelse(viv$sombra > 30, rexp(n, exp(x) / 10), rweibull(n, 0.6, 12 * exp(-x)))
viv$semanas <- round(pmin(s, 26), 1); viv$murio <- as.integer(s <= 26)
caso_cox("vivero-dos-covariables", "Cox con dos covariables numéricas y riesgos que cambian con el tiempo", viv, "semanas", "murio", covariables = c("riego", "sombra"))

# ---- 5. estratos: germinación en tres lotes de semilla (cada lote con su propia velocidad), tratamiento y peso
set.seed(325)
lot <- data.frame(lote = factor(rep(c("L1", "L2", "L3"), each = 36)), tratamiento = factor(rep(rep(c("Testigo", "Remojo", "Escarificada"), each = 12), 3), levels = c("Testigo", "Remojo", "Escarificada")))
lot$peso <- round(rnorm(108, 0.42, 0.05), 3)
base <- c(L1 = 1 / 12, L2 = 1 / 6, L3 = 1 / 20)[as.character(lot$lote)]
tasa <- base * c(Testigo = 1, Remojo = 1.8, Escarificada = 3.2)[as.character(lot$tratamiento)] * exp(-3 * (lot$peso - 0.42))
dias <- ceiling(rexp(108, tasa)); lot$germino <- as.integer(dias <= 21); lot$dias <- pmin(dias, 21)
lot$dias[c(7, 60)] <- NA
caso_km("lotes-log-rank-estratificado", "Log-rank estratificado por lote (cada lote con su riesgo base)", lot, "dias", "germino", "tratamiento", estrato = "lote")
caso_km("lotes-peto-estratificado", "Peto-Peto estratificada por lote, intervalos log-log", lot, "dias", "germino", "tratamiento", conf = "log-log", rho = 1, estrato = "lote")
caso_cox("lotes-cox-estratos", "Cox con el tratamiento y estratos por lote (Efron)", lot, "dias", "germino", factores = "tratamiento", estrato = "lote")
caso_cox("lotes-cox-estratos-covariable-breslow", "Cox con tratamiento, peso y estratos por lote (Breslow)", lot, "dias", "germino", factores = "tratamiento", covariables = "peso", empates = "breslow", estrato = "lote")

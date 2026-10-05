# Modelos lineales generalizados mixtos (motor R en el navegador: lme4::glmer y glmer.nb, car::Anova y emmeans). La
# referencia (tests/r/glmm.R) ajusta en el R de escritorio con el mismo control estricto que la app: binomial con ensayos,
# Poisson con dos agrupamientos y exposición, binomial negativa, enlaces logit y probit, el efecto por observación para
# la sobredispersión (sí, no y automático), Wald tipo II y III y las medias en la escala de la respuesta con sus pares,
# también dentro de los niveles de otro factor. Se corren en el navegador con node tests/motor-r.mjs (clase D).
source(file.path("..", "..", "r", "glmm.R"), encoding = "UTF-8")

F_CBPP <- "Lesnoff et al. (2004), Journal of Applied Ecology 41: 31-41; conjunto cbpp de lme4"
F_TICKS <- "Elston et al. (2001), Parasitology 122: 563-569; conjunto grouseticks de lme4 (altura centrada y escalada)"
F_SINT <- "Datos sintéticos (generados en este archivo)"
PISO_P <- "los EE salen de una hessiana por diferencias finitas: 7 cifras entre lme4 2.0-1 (motor) y 1.1-35.5 (escritorio); en los p menores que 1e-6 eso se amplifica (dp/p ≈ z²·dEE/EE) y se comparan en absoluto"
TOL <- list(tolerancias = list("medias[*].pares[*].p" = list(absoluto = 1e-10, motivo = paste("p de Tukey (integral numérica) y", PISO_P)),
                               "coeficientes.p[*]" = list(absoluto = 1e-10, motivo = PISO_P), "wald.p[*]" = list(absoluto = 1e-10, motivo = PISO_P)))
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_f <- function(nombre, titulo, fuente, datos, y, derecha, familia, enlace, ensayos = "", exposicion = "", comoFactor = character(0), olre = "no", tipo = 2,
                   comparar = character(0), dentro = "", ajuste = "tukey", tol = TOL, nagq = 1L) {
  r <- ref_glmm(datos, y, derecha, familia, enlace, ensayos, exposicion, comoFactor, olre, tipo, comparar, dentro, ajuste, nagq = nagq)
  sp_caso(nombre, objetivo = "glmm", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, ensayos = ensayos, exposicion = exposicion),
    opciones = c(list(derecha = derecha, comoFactor = I(comoFactor), familia = familia, enlace = enlace, sobredispersion = olre, tipo = tipo, comparar = I(comparar), dentro = dentro, ajuste = ajuste),
                 if (nagq > 1) list(nagq = nagq)),
    esperado = r, comparacion = tol, paquetes = c("lme4", "car", "emmeans"),
    codigo = sprintf("glmer(%s ~ %s, family = %s(link = \"%s\"), control = glmerControl(optimizer = \"bobyqa\", tolPwrss = 1e-12, optCtrl = list(rhoend = 1e-12))); car::Anova(type = %d); emmeans(type = \"response\")",
                     y, derecha, familia, enlace, tipo))
}
caso_b <- function(nombre, titulo, fuente, datos, y, trats, bloque, familia, enlace, ensayos = "", exposicion = "", olre = "auto", tipo = 2, comparar = NULL, dentro = "", ajuste = "tukey", nagq = 1L) {
  derecha <- paste0(paste(trats, collapse = " * "), " + (1 | ", bloque, ")")
  comoFactor <- Filter(function(v) is.numeric(datos[[v]]), c(trats, bloque))
  if (is.null(comparar)) comparar <- trats
  r <- ref_glmm(datos, y, derecha, familia, enlace, ensayos, exposicion, comoFactor, olre, tipo, comparar, dentro, ajuste, nagq = nagq)
  sp_caso(nombre, objetivo = "glmm-bloques", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, tratamientos = I(trats), bloque = bloque, ensayos = ensayos, exposicion = exposicion),
    opciones = c(list(familia = familia, enlace = enlace, sobredispersion = olre, tipo = tipo, comparar = I(comparar), dentro = dentro, ajuste = ajuste), if (nagq > 1) list(nagq = nagq)),
    esperado = r, comparacion = TOL, paquetes = c("lme4", "car", "emmeans"),
    codigo = sprintf("glmer(%s ~ %s, family = %s(link = \"%s\")) con el efecto por observación «%s»; car::Anova(type = %d); emmeans", y, derecha, familia, enlace, olre, tipo))
}

# ---- desde la fórmula
cb <- as.data.frame(lme4::cbpp)
caso_f("vacas-binomial", "Incidencia de pleuroneumonía por periodo con los hatos aleatorios (binomial con ensayos; la automática no agrega el efecto por observación)", F_CBPP,
       cb, "incidence", "period + (1 | herd)", "binomial", "logit", ensayos = "size", olre = "auto", comparar = "period")
caso_f("vacas-observacion-tipo3", "La misma con el efecto por observación pedido y pruebas de Wald tipo III", F_CBPP,
       cb, "incidence", "period + (1 | herd)", "binomial", "logit", ensayos = "size", olre = "si", tipo = 3, comparar = "period", ajuste = "holm")
gt <- lme4::grouseticks; gt <- data.frame(TICKS = gt$TICKS, YEAR = gt$YEAR, altura = as.numeric(scale(gt$HEIGHT)), BROOD = gt$BROOD, LOCATION = gt$LOCATION)
# con 118 nidadas y 63 localidades, la hessiana por diferencias finitas se evalúa en óptimos que difieren 1e-7 entre lme4 2.0-1
# y 1.1-35.5: los EE (y lo que sale de ellos) coinciden en 5 cifras
EE5 <- "EE de la hessiana por diferencias finitas evaluada en óptimos que difieren 1e-7 entre lme4 2.0-1 y 1.1-35.5 (dos agrupamientos con 118 y 63 niveles): 5 cifras"
TOL5 <- TOL; for (k in c("coeficientes.ee[*]", "coeficientes.z[*]", "razones.ic_inf[*]", "razones.ic_sup[*]", "wald.chi2[*]", "medias[*].filas[*].ee", "medias[*].filas[*].ee_eta",
                         "medias[*].filas[*].ic[*]", "medias[*].pares[*].ee", "medias[*].pares[*].estadistico")) TOL5$tolerancias[[k]] <- list(tol = 1e-5, motivo = EE5)
caso_f("garrapatas-poisson", "Garrapatas por pollo: Poisson con nidada y localidad aleatorias y una covariable", F_TICKS,
       gt, "TICKS", "YEAR + altura + (1 | BROOD) + (1 | LOCATION)", "poisson", "log", comparar = "YEAR", tol = TOL5)

# ---- tratamientos en bloques aleatorios
set.seed(61)
cn <- expand.grid(bloque = 1:6, trat = factor(c("Testigo", "Imidacloprid", "Spinosad", "Neem", "Jabón")))
cn$pulgones <- rpois(30, exp(log(c(40, 12, 9, 22, 25))[as.integer(cn$trat)] + rnorm(6, 0, 0.3)[cn$bloque] + rnorm(30, 0, 0.35)))
cn <- cn[c("bloque", "trat", "pulgones")]
caso_b("pulgones-automatica", "Pulgones por planta en bloques numerados: la automática agrega el efecto por observación", F_SINT, cn, "pulgones", "trat", "bloque", "poisson", "log")
set.seed(62)
gm <- expand.grid(bloque = factor(paste0("B", 1:5)), trat = factor(c("T1", "T2", "T3", "T4")))
gm$semillas <- 40
gm$germinadas <- rbinom(20, 40, pnorm(qnorm(c(0.5, 0.65, 0.7, 0.85))[as.integer(gm$trat)] + rnorm(5, 0, 0.2)[as.integer(gm$bloque)]))
gm <- gm[c("bloque", "trat", "semillas", "germinadas")]
caso_b("germinacion-probit", "Germinadas de 40 en bloques aleatorios, enlace probit", F_SINT, gm, "germinadas", "trat", "bloque", "binomial", "probit", ensayos = "semillas")
set.seed(63)
nb <- expand.grid(bloque = factor(paste0("B", 1:5)), variedad = factor(c("V1", "V2", "V3")), riego = factor(c("Riego", "Temporal")))
nb$larvas <- rnbinom(30, size = 3, mu = 15 * c(1, 0.6, 1.4)[as.integer(nb$variedad)] * c(1, 1.8)[as.integer(nb$riego)] * exp(rnorm(5, 0, 0.25))[as.integer(nb$bloque)])
nb <- nb[c("bloque", "variedad", "riego", "larvas")]
caso_b("larvas-binomial-negativa", "Larvas con dos factores cruzados, binomial negativa, tipo III y variedad dentro de cada riego", F_SINT, nb, "larvas", c("variedad", "riego"), "bloque",
       "binomial-negativa", "log", tipo = 3, comparar = "variedad", dentro = "riego", ajuste = "bonferroni")
set.seed(64)
ex <- expand.grid(bloque = factor(paste0("B", 1:4)), trat = factor(c("A", "B", "C")))
ex$m2 <- round(runif(12, 0.5, 2), 2)
ex$malezas <- rpois(12, ex$m2 * c(30, 18, 45)[as.integer(ex$trat)] * exp(rnorm(4, 0, 0.2))[as.integer(ex$bloque)])
ex <- ex[c("bloque", "trat", "m2", "malezas")]
caso_b("malezas-exposicion", "Malezas en áreas muestreadas distintas (exposición) sin el efecto por observación", F_SINT, ex, "malezas", "trat", "bloque", "poisson", "log", exposicion = "m2", olre = "no")

# ---- ajuste singular (la varianza de los bloques en cero): lme4 no calcula la hessiana y los EE salen de RX
ej <- jsonlite::fromJSON(sub(";[[:space:]]*$", "", sub("^[^=]*=[[:space:]]*", "", paste(readLines(file.path("..", "..", "..", "datos", "ejemplos.js"), encoding = "UTF-8"), collapse = "\n"))), simplifyVector = FALSE)
ag <- utils::read.csv(text = Filter(function(x) x$id == "aguacate", ej)[[1]]$csv, stringsAsFactors = FALSE)
ag$tratamiento <- factor(ag$tratamiento, levels = c("Testigo", "Azadiractina", "Spinosad", "Jabón potásico", "Beauveria"))
caso_b("trips-aguacate-singular", "Trips del ejemplo del aguacate: efecto por observación automático y bloques con varianza en cero (ajuste singular, EE de RX)",
       "Ejemplo ficticio de SigmaPro «Aguacate» (datos/generar-ejemplos.R)", ag, "trips", "tratamiento", "bloque", "poisson", "log")

# ---- Hito 4.3: cuadratura de Gauss-Hermite, familia gamma y la prueba de los efectos aleatorios (en todos los casos)
caso_f("vacas-gauss-hermite", "Pleuroneumonía con los hatos aleatorios por cuadratura adaptativa de Gauss-Hermite (10 nodos) y la prueba del efecto del hato", F_CBPP,
       cb, "incidence", "period + (1 | herd)", "binomial", "logit", ensayos = "size", olre = "no", comparar = "period", nagq = 10L)
caso_b("malezas-gauss-hermite", "Malezas con exposición en bloques aleatorios, Poisson por cuadratura (25 nodos)", F_SINT, ex, "malezas", "trat", "bloque", "poisson", "log",
       exposicion = "m2", olre = "no", nagq = 25L)
set.seed(65)
dg <- expand.grid(bloque = factor(paste0("B", 1:6)), trat = factor(c("Testigo", "GA3", "KNO3", "Frío")))
dg$dias <- round(rgamma(24, shape = 8, rate = 8 / (c(14, 10, 12, 9)[as.integer(dg$trat)] * exp(rnorm(6, 0, 0.15))[as.integer(dg$bloque)])), 2)
dg <- dg[c("bloque", "trat", "dias")]
caso_b("dias-gamma-bloques", "Días a germinación en bloques aleatorios: gamma con enlace log (con su dispersión; sin la prueba de los aleatorios)", F_SINT, dg, "dias", "trat", "bloque", "gamma", "log")

# Componentes de varianza, heredabilidad y repetibilidad (núcleo JS, REML por información promedio). La referencia
# (tests/r/geneticos.R) ajusta con lme4 y pule el óptimo con matrices completas; de ahí salen los componentes con su
# EE, las razones de verosimilitudes, las heredabilidades (en medias, por parcela, de Cullis y de Piepho y Möhring),
# los BLUP con su PEV, los BLUE, la ganancia por selección, la repetibilidad y las medidas necesarias. Cubre factores
# cruzados, anidados y con interacción, efectos fijos, desbalance, componentes en cero (frontera), completamente al
# azar, bloques completos, alfa-látice y varios ambientes, y la selección hacia valores menores (clase D).
source(file.path("..", "..", "r", "geneticos.R"), encoding = "UTF-8")
suppressPackageStartupMessages(requireNamespace("metan"))

F_DYE <- "Davies y Goldsmith (1972), Statistical Methods in Research and Production; conjunto Dyestuff de lme4"
F_DYE2 <- "Box y Tiao (1973), Bayesian Inference in Statistical Analysis; conjunto Dyestuff2 de lme4"
F_PEN <- "Davies y Goldsmith (1972); conjunto Penicillin de lme4"
F_PAS <- "Davies y Goldsmith (1972); conjunto Pastes de lme4"
F_ALFA <- "Ensayo en alfa-látice (24 genotipos, 3 repeticiones); conjunto data_alpha de metan (Olivoto y Lúcio 2020)"
F_GE <- "Ensayo multiambiente (10 genotipos, 14 ambientes, 3 repeticiones); conjunto data_ge de metan (Olivoto y Lúcio 2020)"
F_GE2 <- "Ensayo multiambiente (13 híbridos de maíz, 4 ambientes, 3 repeticiones); conjunto data_ge2 de metan (Olivoto y Lúcio 2020)"
F_RAIL <- "Devore (2000), Probability and Statistics for Engineering and the Sciences; conjunto Rail de nlme (Pinheiro y Bates 2000)"
F_ERGO <- "Pinheiro y Bates (2000), Mixed-Effects Models in S and S-PLUS; conjunto ergoStool de nlme"
F_SINT <- "Datos sintéticos (generados en este archivo)"

df_de <- function(x, vars) { x <- as.data.frame(x)[vars]; for (v in names(x)) if (is.factor(x[[v]])) x[[v]] <- factor(as.character(x[[v]]), levels = levels(x[[v]])); x }
ent <- function(...) { e <- list(...); e[vapply(e, function(v) length(v) > 0 && !identical(v, ""), TRUE)] }

caso_cv <- function(nombre, titulo, fuente, datos, y, aleatorios, estructura = "cruzados", fijos = character(0)) {
  r <- ref_componentes(datos, y, aleatorios, estructura, fijos)
  sp_caso(nombre, objetivo = "componentes-varianza", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, aleatorios = I(aleatorios), fijos = if (length(fijos)) I(fijos)), opciones = list(estructura = estructura),
    esperado = r, paquetes = c("lme4", "stats"),
    codigo = sprintf("lmer(%s ~ %s + %s, REML = TRUE) pulido con Newton sobre V y P completas; EE de la inversa de la información promedio; RV del modelo sin cada término",
                     y, if (length(fijos)) paste(fijos, collapse = " + ") else "1", paste0("(1 | ", vapply(terminos_aleatorios(aleatorios, estructura), gn_nombre, ""), ")", collapse = " + ")))
}
caso_h <- function(nombre, titulo, fuente, datos, y, gen, rep = "", bloque = "", amb = "", seleccion = 0.1, direccion = "mayor") {
  r <- ref_heredabilidad(datos, y, gen, rep, bloque, amb, seleccion, direccion)
  ds <- disenoGenetico(gen, rep, bloque, amb)
  sp_caso(nombre, objetivo = "heredabilidad", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, genotipo = gen, repeticion = rep, bloque = bloque, ambiente = amb), opciones = list(seleccion = seleccion, direccion = direccion),
    esperado = r, paquetes = c("lme4", "stats"),
    codigo = sprintf("lmer(%s ~ %s + %s, REML = TRUE) pulido; H² = σ²g/(σ²g + σ²ga/a + σ²e/n); Cullis 1 − v̄BLUP/(2σ²g); BLUE con %s fijo: Piepho σ²g/(σ²g + v̄BLUE/2); selección %s (%s)",
                     y, gn_fija(ds$fijos), paste0("(1 | ", vapply(ds$aleatorios, gn_nombre, ""), ")", collapse = " + "), gen, seleccion, direccion))
}
caso_r <- function(nombre, titulo, fuente, datos, y, individuo, fijos = character(0)) {
  r <- ref_repetibilidad(datos, y, individuo, fijos)
  sp_caso(nombre, objetivo = "repetibilidad", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = ent(respuesta = y, individuo = individuo, fijos = if (length(fijos)) I(fijos)), opciones = list(),
    esperado = r, paquetes = c("lme4", "stats"),
    codigo = sprintf("lmer(%s ~ %s + (1 | %s), REML = TRUE) pulido; r = σ²i/(σ²i + σ²e); R² = m·r/(1 + (m − 1)·r); η = R²(1 − r)/((1 − R²)r)",
                     y, if (length(fijos)) paste(fijos, collapse = " + ") else "1", individuo))
}

# ---- componentes de varianza
dye <- df_de(lme4::Dyestuff, c("Yield", "Batch"))
caso_cv("dyestuff-una-via", "Una vía: lotes aleatorios (balanceado)", F_DYE, dye, "Yield", "Batch")
caso_cv("dyestuff2-frontera", "Una vía con la varianza entre lotes en cero (frontera)", F_DYE2, df_de(lme4::Dyestuff2, c("Yield", "Batch")), "Yield", "Batch")
caso_cv("penicilina-cruzados", "Dos factores aleatorios cruzados (placa y muestra)", F_PEN, df_de(lme4::Penicillin, c("diameter", "plate", "sample")), "diameter", c("plate", "sample"))
pas <- df_de(lme4::Pastes, c("strength", "batch", "cask"))
caso_cv("pastas-anidados", "Barriles dentro de lotes (anidados; el barril se numera de nuevo en cada lote)", F_PAS, pas, "strength", c("batch", "cask"), "anidados")
caso_cv("pastas-anidados-desbalanceado", "Anidados con ocho muestras menos (desbalanceado)", F_PAS, pas[-c(2, 7, 15, 22, 31, 40, 48, 57), ], "strength", c("batch", "cask"), "anidados")
ge <- df_de(metan::data_ge, c("GY", "ENV", "GEN", "REP"))
caso_cv("ge-cruzados-interaccion", "Genotipos y ambientes aleatorios con su interacción", F_GE, ge, "GY", c("GEN", "ENV"), "cruzados-interaccion")
alfa <- df_de(metan::data_alpha, c("YIELD", "GEN", "REP", "BLOCK"))
caso_cv("alfa-genotipos-fijos", "Repeticiones y bloques dentro de ellas aleatorios, con los genotipos fijos", F_ALFA, alfa, "YIELD", c("REP", "BLOCK"), "anidados", fijos = "GEN")

# ---- heredabilidad
caso_h("alfa-latice", "Alfa-látice: genotipos y bloques incompletos aleatorios, repeticiones fijas", F_ALFA, alfa, "YIELD", "GEN", rep = "REP", bloque = "BLOCK")
caso_h("alfa-latice-desbalanceado", "Alfa-látice con cinco parcelas perdidas; selección del 20 %", F_ALFA, alfa[-c(3, 17, 30, 44, 61), ], "YIELD", "GEN", rep = "REP", bloque = "BLOCK", seleccion = 0.2)
ge2 <- df_de(metan::data_ge2, c("EH", "KW", "EP", "ENV", "GEN", "REP"))
a1 <- ge2[ge2$ENV == "A1", c("EH", "GEN", "REP")]; a1$GEN <- droplevels(a1$GEN)
caso_h("bloques-un-ambiente-menor", "Bloques completos en un ambiente; se selecciona la menor altura de mazorca (25 %)", F_GE2, a1, "EH", "GEN", rep = "REP", seleccion = 0.25, direccion = "menor")
set.seed(23)
lineas <- data.frame(linea = factor(rep(sprintf("L%02d", 1:12), times = c(3, 4, 2, 5, 3, 4, 4, 2, 3, 5, 4, 3))))
ef <- rnorm(12, 0, 1.6); lineas$peso <- round(30 + ef[as.integer(lineas$linea)] + rnorm(nrow(lineas), 0, 2), 2)
lineas <- lineas[c("peso", "linea")]
caso_h("completamente-al-azar", "Completamente al azar con repeticiones desiguales (sin bloques)", F_SINT, lineas, "peso", "linea", seleccion = 0.25)
caso_h("multiambiente", "Varios ambientes: repeticiones dentro de ambientes fijas, genotipo × ambiente aleatorio", F_GE, ge, "GY", "GEN", rep = "REP", amb = "ENV", seleccion = 0.2)
ge2d <- ge2[-c(5, 18, 40, 77, 101, 140), ]; ge2d <- ge2d[!(ge2d$GEN == "H5" & ge2d$ENV == "A2"), ]
caso_h("multiambiente-desbalanceado", "Varios ambientes con parcelas perdidas y un híbrido ausente en un ambiente", F_GE2, ge2d, "KW", "GEN", rep = "REP", amb = "ENV", seleccion = 0.15)
caso_h("multiambiente-varianza-genetica-cero", "Varianza genética en cero: toda la variación genética está en la interacción", F_GE2, ge2, "EP", "GEN", rep = "REP", amb = "ENV")

# ---- repetibilidad
caso_r("rieles", "Seis rieles medidos tres veces cada uno (sin efectos fijos)", F_RAIL, df_de(nlme::Rail, c("travel", "Rail")), "travel", "Rail")
caso_r("ergostool-tipo-fijo", "Esfuerzo de nueve personas en cuatro bancos (tipo de banco fijo)", F_ERGO, df_de(nlme::ergoStool, c("effort", "Type", "Subject")), "effort", "Subject", fijos = "Type")
set.seed(5)
gy <- expand.grid(cosecha = factor(c("2022", "2023", "2024", "2025")), arbol = factor(sprintf("A%02d", 1:20)))
gy$rendimiento <- round(42 + c(0, 4, -3, 6)[as.integer(gy$cosecha)] + rnorm(20, 0, 5)[as.integer(gy$arbol)] + rnorm(80, 0, 4), 1)
gy <- gy[-c(6, 19, 33, 54, 71), c("rendimiento", "arbol", "cosecha")]
caso_r("arboles-cosechas", "Veinte árboles en cuatro cosechas, con cinco faltantes y la cosecha fija", F_SINT, gy, "rendimiento", "arbol", fijos = "cosecha")

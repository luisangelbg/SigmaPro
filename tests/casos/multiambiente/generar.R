# Ensayos multiambiente y estabilidad (núcleo JS). La referencia (tests/r/multiambiente.R) rehace todo en R base:
# tapply y un lm por ambiente para la tabla y el error, anova(lm) del análisis conjunto, un lm por genotipo sobre el
# índice ambiental, fórmulas cerradas de Wricke, Shukla y Lin y Binns, svd() para AMMI y GGE y chull() para el
# polígono. Cubre datos balanceados, desbalanceados (parcelas perdidas), una media por celda (sin error), las dos
# versiones del EE de b, la menor respuesta como objetivo y las tres particiones del GGE.
source(file.path("..", "..", "r", "multiambiente.R"), encoding = "UTF-8")

F_GE <- "Olivoto, T. y Lúcio, A. D. (2020), metan: an R package for multi-environment trial analysis; conjunto data_ge (10 genotipos de avena × 14 ambientes × 3 repeticiones)"
F_GE2 <- "Olivoto, T. y Lúcio, A. D. (2020), metan; conjunto data_ge2 (13 híbridos de maíz × 4 ambientes × 3 repeticiones)"
F_PLRV <- "Mendiburu, F. de (2023), agricolae; conjunto plrv (28 clones de papa × 6 localidades × 3 repeticiones, Centro Internacional de la Papa)"

PARTES <- list(
  "ensayos-multiambiente" = c("genotipos", "ambientes_nombre", "anova", "genotipos_vs_ga", "ambientes", "bartlett", "tabla", "medias", "medias_ambiente", "media_general", "r", "cme", "gle", "imputacion"),
  estabilidad = c("medias", "indice", "regresion", "eberhart_russell", "wricke", "shukla", "lin_binns", "huehn", "kang", "annicchiarico", "imputacion"),
  ammi = c("anova", "ammi", "waas", "imputacion"),
  gge = c("medias", "gge", "imputacion"))
caso_ma <- function(nombre, objetivo, titulo, fuente, datos, y, rep = "repeticion", opciones = list()) {
  arg <- c(list(datos, y, "genotipo", "ambiente", rep), opciones[intersect(names(opciones), c("escala", "particion", "objetivo", "eeb", "ejesImputar", "ejesWaas", "pesoRespuesta", "probAnnicchiarico", "genotipoA", "genotipoB"))])
  r <- do.call(ref_multiambiente, arg)
  esperado <- r[intersect(PARTES[[objetivo]], names(r))]
  ent <- list(respuesta = y, genotipo = "genotipo", ambiente = "ambiente"); if (nzchar(rep)) ent$repeticion <- rep
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "B", datos = datos,
    entradas = ent, opciones = if (length(opciones)) opciones else NULL, esperado = esperado, paquetes = c("stats", "agricolae", "metan"),
    codigo = sprintf("tapply + lm por ambiente; %s (tests/r/multiambiente.R)", c("ensayos-multiambiente" = "anova(lm(y ~ amb + amb:rep + gen + gen:amb))",
      estabilidad = "lm por genotipo sobre el índice; Wricke, Shukla y Lin-Binns en fórmula cerrada", ammi = "svd de la interacción; Gollob y F_R", gge = "svd de la tabla centrada; chull")[[objetivo]]))
}

ge <- metan::data_ge
avena <- data.frame(ambiente = factor(ge$ENV, levels = paste0("E", 1:14)), genotipo = factor(ge$GEN, levels = paste0("G", 1:10)),
                    repeticion = factor(ge$REP), rendimiento = ge$GY)
caso_ma("avena-conjunto", "ensayos-multiambiente", "Avena en 14 ambientes: análisis conjunto, cada ambiente y Bartlett", F_GE, avena, "rendimiento")
caso_ma("avena-estabilidad", "estabilidad", "Avena: Eberhart-Russell (EE de b propio), Wricke, Shukla y Lin-Binns", F_GE, avena, "rendimiento")
caso_ma("avena-estabilidad-ee-error", "estabilidad", "Avena: EE de b con el error combinado (como metan)", F_GE, avena, "rendimiento", opciones = list(eeb = "error"))
caso_ma("avena-ammi", "ammi", "Avena: AMMI con Gollob, F_R de Cornelius, puntajes y ASV", F_GE, avena, "rendimiento")
caso_ma("avena-gge", "gge", "Avena: GGE simétrico, quién ganó dónde y media contra estabilidad", F_GE, avena, "rendimiento")

# parcelas perdidas (cada celda conserva al menos una parcela)
set.seed(91)
perdidas <- avena; perdidas$rendimiento[sample(nrow(perdidas), 12)] <- NA
caso_ma("avena-parcelas-perdidas", "ensayos-multiambiente", "Avena con 12 parcelas perdidas: análisis conjunto desbalanceado", F_GE, perdidas, "rendimiento")
caso_ma("avena-parcelas-perdidas-estabilidad", "estabilidad", "Avena con parcelas perdidas: estabilidad con r armónica", F_GE, perdidas, "rendimiento")

g2 <- metan::data_ge2
maiz <- data.frame(ambiente = factor(g2$ENV, levels = paste0("A", 1:4)), genotipo = factor(g2$GEN, levels = paste0("H", 1:13)), repeticion = factor(g2$REP),
                   altura_mazorca = g2$EH, altura_planta = g2$PH)
caso_ma("maiz-gge-genotipo-escalado", "gge", "Maíz en 4 ambientes: GGE escalado por ambiente con partición por genotipo", F_GE2, maiz, "altura_planta", opciones = list(escala = "desviacion", particion = "genotipo"))
caso_ma("maiz-gge-menor-ambiente", "gge", "Maíz: menor altura de mazorca como objetivo, partición por ambiente", F_GE2, maiz, "altura_mazorca", opciones = list(particion = "ambiente", objetivo = "minimo"))
caso_ma("maiz-estabilidad-menor", "estabilidad", "Maíz: estabilidad de la altura de mazorca con la menor como objetivo (Lin y Binns)", F_GE2, maiz, "altura_mazorca", opciones = list(objetivo = "minimo"))

medias <- aggregate(altura_planta ~ ambiente + genotipo, data = maiz, FUN = mean)
caso_ma("maiz-medias-conjunto", "ensayos-multiambiente", "Una media por celda (sin repeticiones): G × A como residuo", F_GE2, medias, "altura_planta", rep = "")
caso_ma("maiz-medias-estabilidad", "estabilidad", "Una media por celda: estabilidad sin error (sin S²d ni pruebas de Shukla)", F_GE2, medias, "altura_planta", rep = "")
caso_ma("maiz-medias-ammi", "ammi", "Una media por celda: AMMI sin pruebas", F_GE2, medias, "altura_planta", rep = "")

pl <- local({ e <- new.env(); utils::data("plrv", package = "agricolae", envir = e); e$plrv })
papa <- data.frame(ambiente = factor(pl$Locality), genotipo = factor(pl$Genotype), repeticion = factor(pl$Rep), rendimiento = pl$Yield)
caso_ma("papa-ammi", "ammi", "Papa: 28 clones en 6 localidades, AMMI", F_PLRV, papa, "rendimiento")
caso_ma("papa-estabilidad", "estabilidad", "Papa: estabilidad de 28 clones", F_PLRV, papa, "rendimiento")

# ---- Fase 4 (Hito 4.1): celdas vacías con EM-AMMI, comparación de dos genotipos en el GGE y análisis en dos etapas
vacias <- avena[!((avena$genotipo == "G1" & avena$ambiente %in% c("E1", "E2")) | (avena$genotipo == "G5" & avena$ambiente == "E7")), ]
caso_ma("avena-celdas-vacias-conjunto", "ensayos-multiambiente", "Avena con tres celdas genotipo × ambiente vacías: imputación EM-AMMI y análisis conjunto", F_GE, vacias, "rendimiento")
caso_ma("avena-celdas-vacias-ammi", "ammi", "Avena con celdas vacías: AMMI y WAAS sobre la tabla imputada (la interacción pierde 3 gl)", F_GE, vacias, "rendimiento")
caso_ma("avena-celdas-vacias-dos-ejes", "estabilidad", "Avena con celdas vacías imputadas con dos ejes: estabilidad, Huehn, Kang y Annicchiarico", F_GE, vacias, "rendimiento", opciones = list(ejesImputar = 2))
caso_ma("avena-waas-tres-ejes", "ammi", "Avena: WAAS con tres ejes y WAASY con 65 % a la respuesta", F_GE, avena, "rendimiento", opciones = list(ejesWaas = 3, pesoRespuesta = 65))
caso_ma("avena-gge-ideal-par", "gge", "Avena: genotipo y ambiente ideales y la comparación de G8 con G3 (partición por genotipo)", F_GE, avena, "rendimiento", opciones = list(particion = "genotipo", genotipoA = "G8", genotipoB = "G3"))
caso_ma("maiz-gge-par-escalado-menor", "gge", "Maíz: comparación de H5 con H11 con la tabla escalada y la menor altura como objetivo", F_GE2, maiz, "altura_mazorca", opciones = list(escala = "desviacion", objetivo = "minimo", genotipoA = "H5", genotipoB = "H11"))

caso_dos <- function(nombre, titulo, fuente, datos, y, rep = "repeticion", opciones = list()) {
  r <- ref_dos_etapas(datos, y, "genotipo", "ambiente", rep)
  ent <- list(respuesta = y, genotipo = "genotipo", ambiente = "ambiente"); if (nzchar(rep)) ent$repeticion <- rep
  sp_caso(nombre, objetivo = "dos-etapas", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos, entradas = ent,
    opciones = if (length(opciones)) opciones else NULL, esperado = r[c("ambientes", "celdas", "sigma2_ga", "estimados", "wald")], paquetes = c("stats", "emmeans", "nlme"),
    codigo = "emmeans en cada ambiente (lm y ~ rep + gen); REML de σ²_GA con V = diag(σ² + v) en R (optimize, comprobada contra nlme::lme con sigma = 1 y varFixed); GLS; Wald de los genotipos")
}
caso_dos("avena-dos-etapas", "Avena en 14 ambientes: dos etapas con la varianza de cada media", F_GE, avena, "rendimiento")
set.seed(92)
incompleta <- vacias; incompleta$rendimiento[sample(nrow(incompleta), 15)] <- NA
caso_dos("avena-dos-etapas-incompleta", "Avena con celdas vacías y 15 parcelas perdidas: dos etapas sin imputar", F_GE, incompleta, "rendimiento")
caso_dos("papa-dos-etapas", "Papa: 28 clones en 6 localidades con errores distintos", F_PLRV, papa, "rendimiento")

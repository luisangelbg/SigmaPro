# Diseños con efectos aleatorios que se piden con un formulario (motor R: lme4, lmerTest y emmeans): cada uno arma la
# fórmula del modelo mixto con sus papeles. La referencia ajusta esa fórmula en el R de escritorio (tests/r/mixto.R).
#   mixto-bloques      tratamientos * … + (1 | bloque)
#   mixto-divididas    A * B + (1 | bloque) + (1 | bloque:A)   ·  sin bloques: A * B + (1 | A:repetición)
#   mixto-latice       tratamiento + repetición + (1 | repetición:bloque)  ·  repeticiones aleatorias: + (1 | repetición)
#   mixto-localidades  genotipo + (1 | localidad) + (1 | localidad:repetición) + (1 | genotipo:localidad)
#                      ·  localidad fija: genotipo * localidad + (1 | localidad:repetición)
# Estos casos se corren en el navegador con node tests/motor-r.mjs (clase D).
source(file.path("..", "..", "r", "mixto.R"), encoding = "UTF-8")

F_NPK <- "Yates (1935); conjunto npk de MASS (Venables y Ripley, 2002, Modern Applied Statistics with S, 4.ª ed.)"
F_OATS <- "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme"
F_PLOTS <- "de Mendiburu (2023), agricolae: Statistical Procedures for Agricultural Research; conjunto plots (parcelas divididas)"
F_ALFA <- "Olivoto y Lúcio (2020), Methods in Ecology and Evolution 11: 783-789; conjunto data_alpha de metan (alfa-látice)"
F_GE <- "Olivoto y Lúcio (2020), Methods in Ecology and Evolution 11: 783-789; conjunto data_ge de metan (avena en 14 ambientes)"
F_PLRV <- "Centro Internacional de la Papa; conjunto plrv de agricolae (de Mendiburu, 2023): clones de papa en 6 localidades"
F_MAIZ <- "Ensayo ficticio de maíz de SigmaPro: 3 híbridos × 4 dosis de N en 4 bloques (propuesta/maqueta-maiz.csv)"

caso_dis <- function(nombre, objetivo, titulo, fuente, datos, y, papeles, formula, fijos, comoFactor = character(0), gl = "satterthwaite",
                     ajuste = "tukey", extra = list(), comparar) {
  ddf <- if (gl == "kenward-roger") "Kenward-Roger" else "Satterthwaite"
  esp <- ref_mixto(datos, y, formula, fijos, comoFactor, 3, ddf, TRUE, comparar, "", ajuste)
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = c(list(respuesta = y), papeles), opciones = c(list(gl = gl, ajuste = ajuste), extra), esperado = esp, comparacion = mx_comparacion(ajuste),
    paquetes = c("lme4", "lmerTest", "emmeans", if (ddf == "Kenward-Roger") "pbkrtest"),
    codigo = codigo_mixto(y, formula, comoFactor, 3, ddf, TRUE, comparar, "", ajuste))
}

np <- data.frame(rend = MASS::npk$yield, bloque = MASS::npk$block, N = MASS::npk$N, P = MASS::npk$P, K = MASS::npk$K)
caso_dis("npk-bloques-aleatorios", "mixto-bloques", "Factorial 2 × 2 × 2 en bloques aleatorios con N × P × K confundida con los bloques (se recupera entre bloques)", F_NPK,
  np, "rend", list(tratamientos = I(c("N", "P", "K")), bloque = "bloque"), "N * P * K + (1 | bloque)", "N * P * K", comparar = c("N", "P", "K"))
mz <- read.csv(file.path("..", "..", "..", "propuesta", "maqueta-maiz.csv"))
mz <- data.frame(bloque = factor(as.character(mz$bloque)), hibrido = factor(mz$hibrido), dosis = mz$dosis, rend = mz$rend)
mzp <- mz[-c(3, 17, 30), ]
caso_dis("maiz-parcelas-perdidas", "mixto-bloques", "Tres parcelas perdidas: híbrido × dosis (numérica, como factor) con bloques aleatorios y Kenward-Roger", F_MAIZ,
  mzp, "rend", list(tratamientos = I(c("hibrido", "dosis")), bloque = "bloque"), "hibrido * dosis + (1 | bloque)", "hibrido * dosis", comoFactor = "dosis",
  gl = "kenward-roger", comparar = c("hibrido", "dosis"))

oa <- data.frame(rendimiento = nlme::Oats$yield, bloque = factor(as.character(nlme::Oats$Block), levels = c("I", "II", "III", "IV", "V", "VI")),
                 variedad = factor(as.character(nlme::Oats$Variety)), nitrogeno = nlme::Oats$nitro)
caso_dis("avena-divididas", "mixto-divididas", "Variedad en parcelas grandes y nitrógeno (numérico, como factor) en subparcelas, con bloques", F_OATS,
  oa, "rendimiento", list(parcelaGrande = "variedad", subparcela = "nitrogeno", bloque = "bloque"), "variedad * nitrogeno + (1 | bloque) + (1 | bloque:variedad)",
  "variedad * nitrogeno", comoFactor = "nitrogeno", comparar = c("variedad", "nitrogeno"))
data(plots, package = "agricolae", envir = environment())
pl <- data.frame(rend = as.numeric(plots$yield), A = plots$A, B = plots$B, rep = factor(plots$block))
caso_dis("parcelas-sin-bloques", "mixto-divididas", "Parcelas grandes sorteadas sin bloques: la repetición identifica cada parcela grande (1 | A:rep)", F_PLOTS,
  pl, "rend", list(parcelaGrande = "A", subparcela = "B", repeticion = "rep"), "A * B + (1 | A:rep)", "A * B", comparar = c("A", "B"))

al <- data.frame(rend = metan::data_alpha$YIELD, genotipo = factor(as.character(metan::data_alpha$GEN)), repeticion = factor(as.character(metan::data_alpha$REP)),
                 bloque = factor(as.character(metan::data_alpha$BLOCK)))
caso_dis("alfa-latice", "mixto-latice", "Alfa-látice de 24 genotipos: repeticiones fijas y bloques incompletos aleatorios", F_ALFA,
  al, "rend", list(tratamiento = "genotipo", repeticion = "repeticion", bloque = "bloque"), "genotipo + repeticion + (1 | repeticion:bloque)",
  "genotipo + repeticion", comparar = "genotipo")
caso_dis("alfa-latice-repeticiones-aleatorias", "mixto-latice", "El mismo alfa-látice con las repeticiones también aleatorias", F_ALFA,
  al, "rend", list(tratamiento = "genotipo", repeticion = "repeticion", bloque = "bloque"), "genotipo + (1 | repeticion) + (1 | repeticion:bloque)",
  "genotipo", extra = list(repeticionAleatoria = TRUE), comparar = "genotipo")

ge <- data.frame(rend = metan::data_ge$GY, genotipo = factor(as.character(metan::data_ge$GEN), levels = paste0("G", 1:10)),
                 localidad = factor(as.character(metan::data_ge$ENV), levels = paste0("E", 1:14)), repeticion = factor(as.character(metan::data_ge$REP)))
caso_dis("avena-14-ambientes", "mixto-localidades", "Diez genotipos de avena en 14 ambientes: ambiente, repetición dentro de ambiente y G × A aleatorios", F_GE,
  ge, "rend", list(genotipo = "genotipo", localidad = "localidad", repeticion = "repeticion"),
  "genotipo + (1 | localidad) + (1 | localidad:repeticion) + (1 | genotipo:localidad)", "genotipo", comparar = "genotipo")
data(plrv, package = "agricolae", envir = environment())
pv <- data.frame(rend = plrv$Yield, genotipo = factor(as.character(plrv$Genotype)), localidad = factor(as.character(plrv$Locality)), repeticion = plrv$Rep)
caso_dis("papa-localidades-fijas", "mixto-localidades", "Clones de papa en 6 localidades fijas (genotipo × localidad fijos), repetición numérica dentro de localidad", F_PLRV,
  pv, "rend", list(genotipo = "genotipo", localidad = "localidad", repeticion = "repeticion"), "genotipo * localidad + (1 | localidad:repeticion)",
  "genotipo * localidad", comoFactor = "repeticion", extra = list(localidadFija = TRUE), comparar = "genotipo")

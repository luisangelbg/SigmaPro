# Modelo lineal mixto desde una fórmula (motor R en el navegador: lme4, lmerTest y emmeans). La referencia es el mismo
# modelo ajustado en el R de escritorio (tests/r/mixto.R): ANOVA de efectos fijos (SC tipo III, II o I; gl de
# Satterthwaite o de Kenward-Roger), coeficientes con sus gl, componentes de varianza, ajuste (logLik, AIC, BIC), medias
# marginales de los factores fijos y sus pares (emmeans), la prueba de cada efecto aleatorio (ranova) y los BLUP.
# Cubre intercepto y pendiente aleatorios correlacionados y sin correlación, efectos cruzados, parcelas divididas
# (bloque/parcela), un diseño desbalanceado, datos faltantes, un agrupamiento numérico, máxima verosimilitud, medias
# dentro de los niveles de otro factor con Holm y Bonferroni con Kenward-Roger, y el ensayo de maíz de los ejemplos.
# Estos casos se corren en el navegador con node tests/motor-r.mjs (clase D: optimización iterativa).
source(file.path("..", "..", "r", "mixto.R"), encoding = "UTF-8")

F_SLEEP <- "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4"
F_PENI <- "Davies y Goldsmith (1972), Statistical Methods in Research and Production, 4.ª ed.; conjunto Penicillin de lme4"
F_OATS <- "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme"
F_MACH <- "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme"
F_MAIZ <- "Ensayo ficticio de maíz de SigmaPro: 3 híbridos × 4 dosis de N en 4 bloques (propuesta/maqueta-maiz.csv)"

caso_mx <- function(nombre, titulo, fuente, datos, y, derecha, comoFactor = character(0), tipo = 3, gl = "satterthwaite", reml = TRUE,
                    comparar = NULL, dentro = "", ajuste = "tukey", comparacion = NULL) {
  ddf <- if (gl == "kenward-roger") "Kenward-Roger" else "Satterthwaite"
  fijos <- trimws(gsub("\\+?\\s*\\([^()]*\\|[^()]*\\)", "", derecha))
  fijos <- sub("^\\+\\s*", "", sub("\\s*\\+$", "", fijos)); if (!nzchar(fijos)) fijos <- "1"
  esp <- ref_mixto(datos, y, derecha, fijos, comoFactor, tipo, ddf, reml, comparar, dentro, ajuste)
  op <- list(derecha = derecha, comoFactor = I(comoFactor), tipoSC = tipo, gl = gl, reml = reml, ajuste = ajuste)
  if (!is.null(comparar)) op$comparar <- I(comparar)
  if (nzchar(dentro)) op$dentro <- dentro
  sp_caso(nombre, objetivo = "modelo-mixto", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = list(respuesta = y), opciones = op, esperado = esp, comparacion = if (is.null(comparacion)) mx_comparacion(ajuste) else comparacion,
    paquetes = c("lme4", "lmerTest", "emmeans", if (ddf == "Kenward-Roger") "pbkrtest"),
    codigo = codigo_mixto(y, derecha, comoFactor, tipo, ddf, reml, vapply(esp$medias, `[[`, "", "factor"), dentro, ajuste))
}

ss <- data.frame(Reaction = lme4::sleepstudy$Reaction, Days = lme4::sleepstudy$Days, Subject = factor(as.character(lme4::sleepstudy$Subject)))
caso_mx("sueno-pendientes", "Intercepto y pendiente aleatorios correlacionados por sujeto (Days | Subject)", F_SLEEP, ss, "Reaction", "Days + (Days | Subject)")
caso_mx("sueno-sin-correlacion", "Intercepto y pendiente aleatorios sin correlación (Days || Subject)", F_SLEEP, ss, "Reaction", "Days + (Days || Subject)")
ssna <- ss; ssna$Reaction[c(5, 37, 100, 151)] <- NA
caso_mx("sueno-faltantes", "Cuatro respuestas faltantes: el modelo usa las 176 filas completas", F_SLEEP, ssna, "Reaction", "Days + (1 | Subject)")

pe <- data.frame(diametro = lme4::Penicillin$diameter, placa = factor(as.character(lme4::Penicillin$plate)), muestra = factor(as.character(lme4::Penicillin$sample)))
caso_mx("penicilina-cruzados", "Dos efectos aleatorios cruzados (placa y muestra) y solo el intercepto fijo", F_PENI, pe, "diametro", "1 + (1 | placa) + (1 | muestra)")

oa <- data.frame(rendimiento = nlme::Oats$yield, bloque = factor(as.character(nlme::Oats$Block), levels = c("I", "II", "III", "IV", "V", "VI")),
                 variedad = factor(as.character(nlme::Oats$Variety)), nitrogeno = nlme::Oats$nitro)
caso_mx("avena-parcelas-divididas", "Parcelas divididas como modelo mixto: (1 | bloque/variedad), nitrógeno como factor", F_OATS, oa, "rendimiento", "variedad * nitrogeno + (1 | bloque/variedad)", comoFactor = "nitrogeno")
caso_mx("avena-kenward-roger", "Las mismas parcelas divididas con grados de libertad de Kenward-Roger", F_OATS, oa, "rendimiento", "variedad * nitrogeno + (1 | bloque/variedad)", comoFactor = "nitrogeno", gl = "kenward-roger")
caso_mx("avena-maxima-verosimilitud", "Nitrógeno como covariable, ajuste por máxima verosimilitud (REML = FALSE)", F_OATS, oa, "rendimiento", "variedad + nitrogeno + (1 | bloque/variedad)", reml = FALSE)
caso_mx("avena-nitrogeno-dentro-variedad", "Medias del nitrógeno dentro de cada variedad, comparadas con Holm", F_OATS, oa, "rendimiento", "variedad * nitrogeno + (1 | bloque/variedad)",
        comoFactor = "nitrogeno", comparar = "nitrogeno", dentro = "variedad", ajuste = "holm")

mq <- data.frame(puntaje = nlme::Machines$score, maquina = factor(as.character(nlme::Machines$Machine)), operario = factor(as.character(nlme::Machines$Worker), levels = as.character(1:6)))
caso_mx("maquinas-operario", "Operario aleatorio y su interacción con la máquina (1 | operario/maquina)", F_MACH, mq, "puntaje", "maquina + (1 | operario/maquina)")
mqd <- mq[-c(1, 2, 9, 30, 35, 50), ]
caso_mx("maquinas-desbalanceado-tipo3", "Seis datos menos (desbalanceado): gl de Satterthwaite no enteros, SC tipo III", F_MACH, mqd, "puntaje", "maquina + (1 | operario/maquina)")
caso_mx("maquinas-desbalanceado-tipo1", "El mismo diseño desbalanceado con SC tipo I", F_MACH, mqd, "puntaje", "maquina + (1 | operario) + (1 | operario:maquina)", tipo = 1)
caso_mx("maquinas-bonferroni-kenward-roger", "Desbalanceado: medias con gl de Kenward-Roger y pares con Bonferroni", F_MACH, mqd, "puntaje", "maquina + (1 | operario/maquina)",
        gl = "kenward-roger", ajuste = "bonferroni")
mqn <- mq; mqn$operario <- as.numeric(as.character(mqn$operario))
caso_mx("maquinas-agrupamiento-numerico", "El operario como columna numérica: se toma como factor de agrupamiento", F_MACH, mqn, "puntaje", "maquina + (1 | operario)")

mz <- read.csv(file.path("..", "..", "..", "propuesta", "maqueta-maiz.csv"))
mz <- data.frame(bloque = factor(as.character(mz$bloque)), hibrido = factor(mz$hibrido), dosis = mz$dosis, rend = mz$rend)
caso_mx("maiz-bloques-aleatorios", "Factorial híbrido × dosis con bloques aleatorios (balanceado: mismas F que el ANOVA de bloques)", F_MAIZ, mz, "rend", "hibrido * dosis + (1 | bloque)", comoFactor = "dosis")

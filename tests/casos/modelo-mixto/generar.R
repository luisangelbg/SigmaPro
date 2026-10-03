# Modelo lineal mixto desde una fórmula (motor R en el navegador: lme4 + lmerTest). La referencia es el mismo
# modelo ajustado en el R de escritorio: ANOVA de efectos fijos (SC tipo III, II o I; gl de Satterthwaite o de
# Kenward-Roger), coeficientes con sus gl, componentes de varianza y ajuste (logLik, AIC, BIC).
# Cubre intercepto y pendiente aleatorios correlacionados y sin correlación, efectos cruzados, parcelas divididas
# (bloque/parcela), un diseño desbalanceado, datos faltantes, un agrupamiento numérico, máxima verosimilitud y
# el ensayo de maíz de los ejemplos.
# Estos casos se corren en el navegador con node tests/motor-r.mjs (clase D: optimización iterativa).
# sin library(): cargar lmerTest dejaría su step() tapando al de stats en los generadores que siguen
suppressPackageStartupMessages(requireNamespace("lmerTest"))

F_SLEEP <- "Belenky et al. (2003), Journal of Sleep Research 12: 1-12; conjunto sleepstudy de lme4"
F_PENI <- "Davies y Goldsmith (1972), Statistical Methods in Research and Production, 4.ª ed.; conjunto Penicillin de lme4"
F_OATS <- "Yates (1935), Supplement to the Journal of the Royal Statistical Society 2: 181-247; conjunto Oats de nlme"
F_MACH <- "Milliken y Johnson (1992), Analysis of Messy Data, vol. 1; conjunto Machines de nlme"
F_MAIZ <- "Ensayo ficticio de maíz de SigmaPro: 3 híbridos × 4 dosis de N en 4 bloques (propuesta/maqueta-maiz.csv)"

v <- function(x) I(unname(as.numeric(x)))
tx <- function(x) I(unname(as.character(x)))

ref_mx <- function(datos, y, derecha, comoFactor = character(0), tipo = 3, ddf = "Satterthwaite", reml = TRUE) {
  d <- datos
  for (cn in comoFactor) d[[cn]] <- factor(d[[cn]])
  m <- lmerTest::lmer(as.formula(paste(y, "~", derecha)), data = d, REML = reml)
  s <- summary(m, ddf = ddf); a <- anova(m, type = tipo, ddf = ddf); cf <- coef(s); vc <- as.data.frame(lme4::VarCorr(m))
  list(anova = list(termino = tx(rownames(a)), sc = v(a[["Sum Sq"]]), cm = v(a[["Mean Sq"]]), gl1 = v(a[["NumDF"]]), gl2 = v(a[["DenDF"]]),
                    F = v(a[["F value"]]), p = v(a[["Pr(>F)"]])),
       coeficientes = list(nombre = tx(rownames(cf)), estimado = v(cf[, 1]), ee = v(cf[, 2]), gl = v(cf[, 3]), t = v(cf[, 4]), p = v(cf[, 5])),
       varianzas = list(grupo = tx(vc$grp), var1 = tx(vc$var1), var2 = tx(vc$var2), varianza = v(vc$vcov), de = v(vc$sdcor)),
       ajuste = list(n = nobs(m), logLik = as.numeric(logLik(m)), AIC = AIC(m), BIC = BIC(m), singular = lme4::isSingular(m)))
}
caso_mx <- function(nombre, titulo, fuente, datos, y, derecha, comoFactor = character(0), tipo = 3, gl = "satterthwaite", reml = TRUE, comparacion = NULL) {
  ddf <- if (gl == "kenward-roger") "Kenward-Roger" else "Satterthwaite"
  esp <- ref_mx(datos, y, derecha, comoFactor, tipo, ddf, reml)
  sp_caso(nombre, objetivo = "modelo-mixto", tipo = "metodo", titulo = titulo, fuente = fuente, clase = "D", datos = datos,
    entradas = list(respuesta = y), opciones = list(derecha = derecha, comoFactor = I(comoFactor), tipoSC = tipo, gl = gl, reml = reml),
    esperado = esp, comparacion = comparacion, paquetes = c("lme4", "lmerTest", if (ddf == "Kenward-Roger") "pbkrtest"),
    codigo = sprintf("%smodelo <- lmer(%s ~ %s, data = datos, REML = %s); anova(modelo, type = %d, ddf = \"%s\"); summary(modelo, ddf = \"%s\"); VarCorr(modelo)",
                     if (length(comoFactor)) sprintf("datos$%s <- factor(datos$%s); ", comoFactor, comoFactor) else "", y, derecha, reml, tipo, ddf, ddf))
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

mq <- data.frame(puntaje = nlme::Machines$score, maquina = factor(as.character(nlme::Machines$Machine)), operario = factor(as.character(nlme::Machines$Worker), levels = as.character(1:6)))
caso_mx("maquinas-operario", "Operario aleatorio y su interacción con la máquina (1 | operario/maquina)", F_MACH, mq, "puntaje", "maquina + (1 | operario/maquina)")
mqd <- mq[-c(1, 2, 9, 30, 35, 50), ]
caso_mx("maquinas-desbalanceado-tipo3", "Seis datos menos (desbalanceado): gl de Satterthwaite no enteros, SC tipo III", F_MACH, mqd, "puntaje", "maquina + (1 | operario/maquina)")
caso_mx("maquinas-desbalanceado-tipo1", "El mismo diseño desbalanceado con SC tipo I", F_MACH, mqd, "puntaje", "maquina + (1 | operario) + (1 | operario:maquina)", tipo = 1)
mqn <- mq; mqn$operario <- as.numeric(as.character(mqn$operario))
caso_mx("maquinas-agrupamiento-numerico", "El operario como columna numérica: se toma como factor de agrupamiento", F_MACH, mqn, "puntaje", "maquina + (1 | operario)")

mz <- read.csv(file.path("..", "..", "..", "propuesta", "maqueta-maiz.csv"))
mz <- data.frame(bloque = factor(as.character(mz$bloque)), hibrido = factor(mz$hibrido), dosis = mz$dosis, rend = mz$rend)
caso_mx("maiz-bloques-aleatorios", "Factorial híbrido × dosis con bloques aleatorios (balanceado: mismas F que el ANOVA de bloques)", F_MAIZ, mz, "rend", "hibrido * dosis + (1 | bloque)", comoFactor = "dosis")

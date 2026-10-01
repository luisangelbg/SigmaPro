# Datos de ejemplo de la maqueta de SigmaPro (ficticios, reproducibles).
# Ensayo de maíz: 3 híbridos × 4 dosis de nitrógeno en bloques completos al azar (4 bloques).
# Genera maqueta-maiz.csv y maqueta-resultados.json con las cifras que muestra la maqueta.
set.seed(2026)
d <- expand.grid(bloque = factor(1:4), hibrido = factor(c("H-40", "H-52", "H-66")),
                 dosis = c(0, 60, 120, 180))
ef_bloque  <- c(0.25, 0.05, -0.10, -0.20)
ef_hibrido <- c("H-40" = -0.35, "H-52" = 0.10, "H-66" = 0.25)
resp_n     <- function(n, h) (0.026 + 0.004 * (h == "H-66")) * n - (0.000085 + 0.00001 * (h == "H-66")) * n^2
d$rend <- round(4.6 + ef_bloque[d$bloque] + ef_hibrido[as.character(d$hibrido)] +
                resp_n(d$dosis, d$hibrido) + rnorm(nrow(d), 0, 0.22), 2)
d$N <- factor(d$dosis)
d <- d[order(d$bloque, d$hibrido, d$dosis), c("bloque", "hibrido", "dosis", "N", "rend")]
write.csv(d[, c("bloque", "hibrido", "dosis", "rend")], "maqueta-maiz.csv", row.names = FALSE)

m  <- aov(rend ~ bloque + hibrido * N, data = d)
tb <- summary(m)[[1]]
cv <- 100 * sqrt(tb["Residuals", "Mean Sq"]) / mean(d$rend)
r  <- residuals(m)
sw <- shapiro.test(r)
lev <- car::leveneTest(rend ~ hibrido * N, data = d, center = median)
nad <- agricolae::nonadditivity(d$rend, d$bloque, interaction(d$hibrido, d$N),
                                 df = tb["Residuals", "Df"], MSerror = tb["Residuals", "Mean Sq"])
em  <- emmeans::emmeans(m, ~ N | hibrido)
cl  <- multcomp::cld(em, Letters = letters, adjust = "tukey", reversed = TRUE)
# Tendencia (polinomios ortogonales de N, dentro de cada híbrido)
pol <- emmeans::contrast(em, "poly")
res <- list(
  anova = data.frame(fuente = trimws(rownames(tb)), gl = tb$Df, sc = tb$`Sum Sq`, cm = tb$`Mean Sq`,
                     F = tb$`F value`, p = tb$`Pr(>F)`),
  media = mean(d$rend), cv = cv, r2 = 1 - tb["Residuals", "Sum Sq"] / sum((d$rend - mean(d$rend))^2),
  shapiro = c(W = unname(sw$statistic), p = sw$p.value),
  levene = c(F = lev$`F value`[1], p = lev$`Pr(>F)`[1]),
  noaditividad = nad$ANOVA,
  medias = as.data.frame(cl),
  tendencia = as.data.frame(pol)
)
jsonlite::write_json(res, "maqueta-resultados.json", digits = 10, pretty = TRUE, auto_unbox = TRUE)
print(tb); cat("CV =", cv, "\n"); print(sw); print(lev); print(cl); print(pol)

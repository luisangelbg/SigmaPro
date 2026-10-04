# Potencia y tamaño de muestra (núcleo JS). Las referencias son las funciones de R con sus valores por omisión
# (tests/r/potencia.R): la app busca las raíces con el mismo algoritmo, intervalo y tolerancia que uniroot, así que
# también el n «exacto» coincide. Cubre las tres incógnitas de cada función, bilateral y unilateral, y el lazo de
# Cochran y Cox en completamente al azar y en bloques. Sin datos: todo va en las opciones.
source(file.path("..", "..", "r", "potencia.R"), encoding = "UTF-8")
F_R <- "Fórmulas de R (stats::power.t.test, power.anova.test y power.prop.test; pwr::pwr.r.test, Champely 2020)"
F_CC <- "Cochran, W. G. y Cox, G. M. (1957), Experimental Designs, 2.ª ed.: r ≥ 2(t₁ + t₂)²(CV/d)²"

caso_pot <- function(nombre, objetivo, titulo, fuente, op, f) {
  sp_caso(nombre, objetivo = objetivo, tipo = "metodo", titulo = titulo, fuente = fuente, clase = "A",
    entradas = setNames(list(), character(0)), opciones = op, esperado = f(op), paquetes = if (objetivo == "potencia-correlacion") "pwr" else "stats",
    codigo = sprintf("%s con los valores por omisión de R (tests/r/potencia.R)", deparse(substitute(f))))
}
base <- list(alfa = 0.05, potencia = 0.8)
mt <- function(...) modifyList(c(base, list(tipo = "dos", alternativa = "bilateral", n = 10, diferencia = 1, de = 1)), list(...))
caso_pot("t-dos-muestras-n", "potencia-medias", "Repeticiones por grupo para detectar 1.5 t/ha con DE 2.1", F_R, mt(calcular = "n", diferencia = 1.5, de = 2.1), ref_potencia_t)
caso_pot("t-pareada-potencia", "potencia-medias", "Potencia de una prueba pareada con 12 pares", F_R, mt(calcular = "potencia", tipo = "pareada", n = 12, diferencia = 0.8, de = 1.1), ref_potencia_t)
caso_pot("t-una-muestra-diferencia", "potencia-medias", "Diferencia detectable contra un valor, unilateral, 90 % de potencia", F_R, mt(calcular = "diferencia", tipo = "una", alternativa = "unilateral", n = 20, potencia = 0.9, de = 3.4), ref_potencia_t)
caso_pot("t-dos-muestras-unilateral-n", "potencia-medias", "n por grupo con alternativa unilateral y α = 0.01", F_R, mt(calcular = "n", alternativa = "unilateral", alfa = 0.01, diferencia = 12, de = 15), ref_potencia_t)

a <- function(...) modifyList(c(base, list(grupos = 4, medias = "", varEntre = 1, de = 1, n = 5)), list(...))
caso_pot("anova-medias-n", "potencia-anova", "Repeticiones para cuatro híbridos con medias esperadas 4.2, 4.8, 5.1 y 5.6 t/ha", F_R, a(calcular = "n", medias = "4.2, 4.8, 5.1, 5.6", de = 0.6), ref_potencia_anova)
caso_pot("anova-potencia", "potencia-anova", "Potencia con 5 tratamientos y 4 repeticiones", F_R, a(calcular = "potencia", grupos = 5, varEntre = 0.3, n = 4, de = 0.8), ref_potencia_anova)
caso_pot("anova-varianza-detectable", "potencia-anova", "Varianza entre medias detectable con 6 repeticiones de 3 tratamientos", F_R, a(calcular = "varEntre", grupos = 3, n = 6, de = 1.2, potencia = 0.85), ref_potencia_anova)

p <- function(...) modifyList(c(base, list(alternativa = "bilateral", n = 50, p1 = 0.5, p2 = 0.7)), list(...))
caso_pot("prop-n", "potencia-proporciones", "Semillas por lote para distinguir 65 % de 80 % de germinación", F_R, p(calcular = "n", p1 = 0.65, p2 = 0.8), ref_potencia_prop)
caso_pot("prop-potencia-unilateral", "potencia-proporciones", "Potencia unilateral con 120 por grupo", F_R, p(calcular = "potencia", alternativa = "unilateral", n = 120, p1 = 0.3, p2 = 0.42), ref_potencia_prop)

r <- function(...) modifyList(c(base, list(alternativa = "bilateral", n = 30, r = 0.3)), list(...))
caso_pot("r-n", "potencia-correlacion", "Pares para detectar r = 0.35", F_R, r(calcular = "n", r = 0.35), ref_potencia_r)
caso_pot("r-detectable", "potencia-correlacion", "Correlación detectable con 40 pares", F_R, r(calcular = "r", n = 40), ref_potencia_r)
caso_pot("r-potencia-unilateral", "potencia-correlacion", "Potencia unilateral con 25 pares y r = 0.4", F_R, r(calcular = "potencia", alternativa = "unilateral", n = 25, r = 0.4), ref_potencia_r)

rp <- function(...) modifyList(c(base, list(cv = 12, diferencia = 20, tratamientos = 5, diseno = "dbca")), list(...))
caso_pot("repeticiones-bloques", "repeticiones", "Bloques con 6 tratamientos, CV 12 % y diferencia de 15 %", F_CC, rp(cv = 12, diferencia = 15, tratamientos = 6), ref_repeticiones)
caso_pot("repeticiones-dca-potencia-alta", "repeticiones", "Completamente al azar, CV 8 %, diferencia 10 %, potencia 90 %", F_CC, rp(cv = 8, diferencia = 10, tratamientos = 4, diseno = "dca", potencia = 0.9), ref_repeticiones)

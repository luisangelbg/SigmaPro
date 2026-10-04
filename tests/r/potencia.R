# SigmaPro — referencia de potencia y tamaño de muestra (Hito 3.0): las funciones de R con sus valores por omisión
# (power.t.test, power.anova.test y power.prop.test de stats; pwr.r.test de pwr), para que la app dé lo mismo que R
# tal como lo usa cualquiera; y el lazo de Cochran y Cox (1957) para las repeticiones de un experimento.
# Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

# los tamaños de la curva de potencia, como SP.potencia (de mínimo al doble del calculado, hasta 60 puntos)
pot_curva_n <- function(n, minimo) {
  tope <- max(10, ceiling(if (is.finite(n)) n * 2 else 40))
  paso <- max(1, ceiling((tope - minimo) / 60))
  seq(ceiling(minimo + if (minimo == 4) 1 else 0), tope, by = paso)
}

ref_potencia_t <- function(op) {
  tipo <- c(dos = "two.sample", una = "one.sample", pareada = "paired")[[op$tipo]]
  alt <- if (op$alternativa == "unilateral") "one.sided" else "two.sided"
  a <- list(n = op$n, delta = op$diferencia, sd = op$de, sig.level = op$alfa, power = op$potencia, type = tipo, alternative = alt)
  a[[c(potencia = "power", n = "n", diferencia = "delta")[[op$calcular]]]] <- NULL
  r <- do.call(power.t.test, a)
  ns <- pot_curva_n(r$n, 2)
  list(n = r$n, diferencia = r$delta, de = op$de, alfa = op$alfa, potencia = r$power,
       curva = list(n = ns, potencia = vapply(ns, function(k) power.t.test(n = k, delta = r$delta, sd = op$de, sig.level = op$alfa, type = tipo, alternative = alt)$power, 0)))
}

ref_potencia_anova <- function(op) {
  medias <- if (nzchar(op$medias %||% "")) as.numeric(strsplit(op$medias, "[;,[:space:]]+")[[1]]) else NULL
  g <- if (length(medias)) length(medias) else op$grupos
  vb <- if (length(medias)) var(medias) else op$varEntre
  a <- list(groups = g, n = op$n, between.var = vb, within.var = op$de^2, sig.level = op$alfa, power = op$potencia)
  a[[c(potencia = "power", n = "n", varEntre = "between.var")[[op$calcular]]]] <- NULL
  r <- do.call(power.anova.test, a)
  ns <- pot_curva_n(r$n, 2)
  list(grupos = g, n = r$n, varEntre = r$between.var, varDentro = op$de^2, alfa = op$alfa, potencia = r$power,
       f = sqrt(r$between.var * (g - 1) / g / op$de^2),
       curva = list(n = ns, potencia = vapply(ns, function(k) power.anova.test(groups = g, n = k, between.var = r$between.var, within.var = op$de^2, sig.level = op$alfa)$power, 0)))
}

ref_potencia_prop <- function(op) {
  alt <- if (op$alternativa == "unilateral") "one.sided" else "two.sided"
  a <- list(n = op$n, p1 = op$p1, p2 = op$p2, sig.level = op$alfa, power = op$potencia, alternative = alt)
  a[[c(potencia = "power", n = "n")[[op$calcular]]]] <- NULL
  r <- do.call(power.prop.test, a)
  ns <- pot_curva_n(r$n, 1)
  list(n = r$n, p1 = op$p1, p2 = op$p2, alfa = op$alfa, potencia = r$power, h = abs(2 * asin(sqrt(op$p1)) - 2 * asin(sqrt(op$p2))),
       curva = list(n = ns, potencia = vapply(ns, function(k) power.prop.test(n = k, p1 = op$p1, p2 = op$p2, sig.level = op$alfa, alternative = alt)$power, 0)))
}

ref_potencia_r <- function(op) {
  alt <- if (op$alternativa == "unilateral") "greater" else "two.sided"
  a <- list(n = op$n, r = op$r, sig.level = op$alfa, power = op$potencia, alternative = alt)
  a[[c(potencia = "power", n = "n", r = "r")[[op$calcular]]]] <- NULL
  r <- do.call(pwr::pwr.r.test, a)
  ns <- pot_curva_n(r$n, 4)
  list(n = r$n, r = r$r, alfa = op$alfa, potencia = r$power,
       curva = list(n = ns, potencia = vapply(ns, function(k) pwr::pwr.r.test(n = k, r = r$r, sig.level = op$alfa, alternative = alt)$power, 0)))
}

ref_repeticiones <- function(op) {
  gl <- function(r) if (op$diseno == "dca") op$tratamientos * (r - 1) else (op$tratamientos - 1) * (r - 1)
  filas <- list()
  for (r in 2:1000) {
    t1 <- qt(1 - op$alfa / 2, gl(r)); t2 <- qt(op$potencia, gl(r)); req <- 2 * (t1 + t2)^2 * (op$cv / op$diferencia)^2
    filas[[length(filas) + 1]] <- data.frame(r = r, gl = gl(r), t1 = t1, t2 = t2, requeridas = req)
    if (r >= req) break
  }
  it <- do.call(rbind, filas)
  list(repeticiones = r, gl = gl(r), t1 = t1, t2 = t2, requeridas = req, iteraciones = it)
}

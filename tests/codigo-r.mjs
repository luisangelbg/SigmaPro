// SigmaPro — comprueba que el «código R equivalente» de cada método corre en R y da los mismos números.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/codigo-r.mjs        (necesita Rscript: en el PATH, en C:\Program Files\R o en SIGMAPRO_RSCRIPT)
//
// Para cada escenario: arma la tabla de un ejemplo de datos/ejemplos.js, corre el método en el núcleo,
// escribe el CSV y el código R que la app mostraría, lo ejecuta con Rscript y compara los números que
// el escenario indica (con la tolerancia de la validación, 1e-6 relativa).

import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const ctx = vm.createContext({ console, performance, TextEncoder, TextDecoder, structuredClone });
for (const s of scripts) vm.runInContext(readFileSync(join(RAIZ, s), 'utf8'), ctx, { filename: s });
vm.runInContext(readFileSync(join(RAIZ, 'datos/ejemplos.js'), 'utf8').replace('window.SP_EJEMPLOS', 'globalThis.SP_EJEMPLOS'), ctx);
const SP = ctx.SP, EJ = ctx.SP_EJEMPLOS;

function rscript() {
  if (process.env.SIGMAPRO_RSCRIPT) return process.env.SIGMAPRO_RSCRIPT;
  try { execFileSync('Rscript', ['--version'], { stdio: 'ignore' }); return 'Rscript'; } catch { /* no está en el PATH */ }
  const base = 'C:/Program Files/R';
  if (existsSync(base)) { const v = readdirSync(base).filter(d => /^R-/.test(d)).sort().pop(); if (v) return join(base, v, 'bin', 'Rscript.exe'); }
  return null;
}
const R = rscript();
if (!R) { console.log('No encontré Rscript: se omite la prueba del código R.'); process.exit(0); }

function hojaDe(id) {
  const e = EJ.find(x => x.id === id);
  const leido = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' });
  return { csv: e.csv, hoja: SP.hoja.crear({ nombres: leido.nombres, columnas: leido.columnas, tipos: e.tipos }) };
}

/* cada escenario: ejemplo, método, entradas, opciones, y cómo sacar en R y en el resultado los números a comparar */
const ESCENARIOS = [
  { ej: 'maiz', id: 'descriptivos', e: { variables: ['rend'], grupos: ['hibrido', 'dosis'] }, op: { percentiles: [0.1, 0.9] }, ctx: { factoresNumericos: ['dosis'] },
    r: 'unlist(lapply(c("media", "de", "q1", "q3", "media_recortada", "asimetria", "curtosis", "ic_media_inf", "ic_mediana_sup", "ic_varianza_inf"), function(k) resultado$rend[, k]))',
    js: res => ['media', 'de', 'q1', 'q3', 'media_recortada', 'asimetria', 'curtosis', 'ic_media_inf', 'ic_mediana_sup', 'ic_varianza_inf'].flatMap(k => ordenR(res, k)) },
  { ej: 'venenos', id: 'descriptivos', e: { variables: ['tiempo'], grupos: [] }, op: { nivel: 0.9, tipoCuantil: 6, tipoForma: 3, recorte: 0.2 },
    r: 'resultado[c("media", "q1", "q3", "media_recortada", "asimetria", "ic_media_inf", "ic_mediana_inf", "ic_varianza_sup"), "tiempo"]',
    js: res => ['media', 'q1', 'q3', 'media_recortada', 'asimetria', 'ic_media_inf', 'ic_mediana_inf', 'ic_varianza_sup'].map(k => res.tabla[k][0]) },
  { ej: 'aguacate', id: 'frecuencias', e: { fila: 'tratamiento' }, op: {},
    r: 'as.vector(tabla)', js: res => res.frecuencia },
  { ej: 'maiz', id: 'frecuencias', e: { fila: 'hibrido', columna: 'dosis' }, op: {},
    r: 'as.vector(t(100 * prop.table(tabla, 1)))', js: res => res.pct_fila.flat() },
  { ej: 'frijol', id: 'proporciones', e: { exitos: 'germinadas', ensayos: 'sembradas', grupo: 'tratamiento' }, op: { nivel: 0.95 },
    r: 'as.vector(t(ic[, c("wilson1", "wilson2", "clopper_pearson1", "clopper_pearson2", "jeffreys1", "jeffreys2")]))',
    js: res => res.tabla.p.flatMap((_, i) => ['wilson', 'clopper_pearson', 'jeffreys'].flatMap(m => [res.tabla[m + '_inf'][i], res.tabla[m + '_sup'][i]])),
    ordenR: 'grupo' },
  { ej: 'trigo', id: 'proporciones', e: { categoria: 'variedad' }, op: { nivel: 0.99 },
    r: 'as.vector(ic[, c("agresti_coull1", "agresti_coull2", "wald1", "wald2")])',
    js: res => ['agresti_coull_inf', 'agresti_coull_sup', 'wald_inf', 'wald_sup'].flatMap(k => res.tabla[k]) },
  { ej: 'trigo', id: 'bondad-ajuste', e: { categoria: 'variedad' }, op: { proporciones: [] },
    r: 'c(prueba$statistic, prueba$p.value, prueba$stdres)', js: res => [res.chi2, res.p, ...res.residuo_estandarizado] },
  { ej: 'frijol', id: 'bondad-ajuste', e: { categoria: 'tratamiento', conteo: 'germinadas' }, op: { proporciones: [1, 1, 2, 2, 3] },
    r: 'c(prueba$statistic, prueba$p.value, prueba$expected)', js: res => [res.chi2, res.p, ...res.esperado] },
  { ej: 'maiz', id: 'supuestos', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: {}, ctx: { factoresNumericos: ['dosis'] },
    r: 'c(sw$statistic, sw$p.value, li$statistic, ad$statistic, bf[1, "F value"], bf[1, "Pr(>F)"], lv[1, "F value"], ba$statistic, dw$statistic, dw$p.value)',
    js: res => [res.normalidad.shapiro.W, res.normalidad.shapiro.p, res.normalidad.lilliefors.D, res.normalidad.anderson.A, res.varianzas.brown_forsythe.F,
      res.varianzas.brown_forsythe.p, res.varianzas.levene.F, res.varianzas.bartlett.K2, res.independencia.durbin_watson.DW, res.independencia.durbin_watson.p] },
  { ej: 'venenos', id: 'supuestos', e: { respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'] }, op: {},
    r: 'c(sw$statistic, sw$p.value, bf[1, "F value"], ba$statistic, dw$statistic, dw$p.value, ot$rstudent)',
    js: res => [res.normalidad.shapiro.W, res.normalidad.shapiro.p, res.varianzas.brown_forsythe.F, res.varianzas.bartlett.K2,
      res.independencia.durbin_watson.DW, res.independencia.durbin_watson.p, res.atipicos.rstudent] },
  /* Hito 1.5: pruebas t y no paramétricas */
  { ej: 'venenos', id: 'prueba-t', e: { modo: 'independientes', respuesta: 'tiempo', grupo: 'tratamiento', niveles: ['A', 'B'] }, op: {},
    r: 'c(prueba$statistic, prueba$parameter, prueba$p.value, prueba$conf.int, varianzas$statistic, varianzas$p.value, varianzas$conf.int, efecto)',
    js: res => [res.prueba.t, res.prueba.gl, res.prueba.p, ...res.prueba.ic, res.varianzas.F, res.varianzas.p, ...res.varianzas.ic, ...efectoDe(res)] },
  { ej: 'jitomate', id: 'prueba-t', e: { modo: 'pareadas', antes: 'altura_30dds', despues: 'altura_15dds' }, op: { nivel: 0.9, mu: 40 },
    r: 'c(prueba$statistic, prueba$parameter, prueba$p.value, prueba$conf.int, efecto)', js: res => [res.prueba.t, res.prueba.gl, res.prueba.p, ...res.prueba.ic, ...efectoDe(res)] },
  { ej: 'frijol', id: 'prueba-t', e: { modo: 'una', variable: 'germinacion' }, op: { mu: 50, alternativa: 'menor' },
    r: 'c(prueba$statistic, prueba$parameter, prueba$p.value, prueba$conf.int, efecto)', js: res => [res.prueba.t, res.prueba.gl, res.prueba.p, ...res.prueba.ic, ...efectoDe(res)] },
  { ej: 'maiz', id: 'wilcoxon', e: { modo: 'independientes', respuesta: 'rend', grupo: 'hibrido' }, op: {},
    r: 'c(prueba$statistic, prueba$p.value, prueba$conf.int, prueba$estimate)', js: res => [res.prueba.estadistico, res.prueba.p, ...res.prueba.ic, res.prueba.estimado] },
  { ej: 'jitomate', id: 'wilcoxon', e: { modo: 'pareadas', antes: 'altura_60dds', despues: 'altura_45dds' }, op: { alternativa: 'mayor', mu: 30 },
    r: 'c(prueba$statistic, prueba$p.value, prueba$conf.int[1], prueba$estimate)', js: res => [res.prueba.estadistico, res.prueba.p, res.prueba.ic[0], res.prueba.estimado] },
  { ej: 'venenos', id: 'kruskal-wallis', e: { respuesta: 'tiempo', tratamiento: 'veneno' }, op: { posthoc: 'dunn', ajuste: 'holm' },
    r: 'c(prueba$statistic, prueba$p.value, pc$p.value[lower.tri(pc$p.value, TRUE)])', js: res => [res.prueba.H, res.prueba.p, ...res.comparaciones.pares.map(p => p.p_ajustado)] },
  { ej: 'aguacate', id: 'kruskal-wallis', e: { respuesta: 'trips', tratamiento: 'tratamiento' }, op: { posthoc: 'conover', ajuste: 'BH' },
    r: 'c(prueba$statistic, prueba$p.value, pc$p.value[lower.tri(pc$p.value, TRUE)])', js: res => [res.prueba.H, res.prueba.p, ...res.comparaciones.pares.map(p => p.p_ajustado)] },
  { ej: 'aguacate', id: 'friedman', e: { respuesta: 'trips', tratamiento: 'tratamiento', bloque: 'bloque' }, op: { posthoc: 'conover', ajuste: 'holm' },
    r: 'c(prueba$statistic, prueba$p.value, W, pc$p.value[lower.tri(pc$p.value, TRUE)])', js: res => [res.prueba.Q, res.prueba.p, res.prueba.W, ...res.comparaciones.pares.map(p => p.p_ajustado)] },
  { ej: 'aguacate', id: 'friedman', e: { respuesta: 'trips', tratamiento: 'tratamiento', bloque: 'bloque' }, op: { posthoc: 'wilcoxon', ajuste: 'bonferroni' },
    r: 'c(prueba$statistic, pc$p.value[lower.tri(pc$p.value, TRUE)])', js: res => [res.prueba.Q, ...res.comparaciones.pares.map(p => p.p_ajustado)] },
  /* Hito 1.6: diseños experimentales */
  { ej: 'maiz', id: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 },
    r: 'c(car::Anova(modelo, type = 3)[c("bloque", "hibrido", "dosis", "hibrido:dosis"), "F value"], 100 * sigma(modelo) / media, summary(modelo)$r.squared)',
    js: res => [...['bloque', 'hibrido', 'dosis', 'hibrido:dosis'].map(f => res.anova.F[res.anova.fuente.indexOf(f)]), res.resumen.cv, res.resumen.r2] },
  { ej: 'aguacate', id: 'dbca', e: { respuesta: 'trips', tratamientos: ['tratamiento'], bloque: 'bloque' }, op: { tipoSC: 3 },
    r: 'c(car::Anova(modelo, type = 3)[c("bloque", "tratamiento"), "F value"], 100 * sigma(modelo) / media)',
    js: res => [res.anova.F[0], res.anova.F[1], res.resumen.cv] },
  { ej: 'trigo', id: 'cuadro-latino', e: { respuesta: 'rend', tratamientos: ['variedad'], fila: 'hilera', columna: 'columna' }, op: { tipoSC: 2 },
    r: 'c(car::Anova(modelo, type = 2)[c("hilera", "columna", "variedad"), "F value"], 100 * sigma(modelo) / media)',
    js: res => [res.anova.F[0], res.anova.F[1], res.anova.F[2], res.resumen.cv] },
  { ej: 'venenos', id: 'dca', e: { respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'] }, op: { tipoSC: 1 },
    r: 'c(anova(modelo)[c("veneno", "tratamiento", "veneno:tratamiento"), "F value"], summary(modelo)$r.squared)',
    js: res => [res.anova.F[0], res.anova.F[1], res.anova.F[2], res.resumen.r2] },
  { ej: 'avena', id: 'parcelas-divididas', e: { respuesta: 'rendimiento', parcelaGrande: 'variedad', subparcela: 'nitrogeno', bloque: 'bloque', principal: 'dbca' }, op: {},
    r: 'unlist(lapply(summary(modelo), function(s) { d <- s[[1]]; d[!is.na(d[["F value"]]), "F value"] }))',
    js: res => res.estratos.flatMap(s => s.filas.filter(f => Number.isFinite(f.F)).map(f => f.F)) },
  /* Hito 1.7: comparaciones de medias */
  { ej: 'maiz', id: 'comparaciones-medias', e: { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, op: { metodo: 'tukey', alfa: 0.05 },
    r: 'c(pr$p.value, match(letras(emm, pr, 0.05), letters))', js: res => [...res.grupos[0].pares.map(p => p.p_ajustado), ...res.grupos[0].medias.map(m => 'abcdefghijklmnopqrstuvwxyz'.indexOf(m.letras) + 1)] },
  { ej: 'avena', id: 'comparaciones-medias', e: { diseno: 'parcelas-divididas', respuesta: 'rendimiento', parcelaGrande: 'variedad', subparcela: 'nitrogeno', bloque: 'bloque', principal: 'dbca', comparar: ['nitrogeno'], dentro: ['variedad'] }, op: { metodo: 'tukey', alfa: 0.05 },
    r: 'c(pr$estimate, pr$SE, pr$df, pr$p.value)', js: res => ['dif', 'ee', 'gl', 'p_ajustado'].flatMap(k => res.grupos.flatMap(g => g.pares.map(p => p[k]))) },
  { ej: 'venenos', id: 'contrastes', e: { diseno: 'dca', respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'], comparar: ['veneno'] }, op: { contrastes: ['I y II vs III: 1 1 -2', 'I vs II: 1 -1 0'].join('\n') },
    r: 'c(summary(ct)$estimate, summary(ct)$t.ratio, summary(ct)$p.value)', js: res => ['est', 't', 'p'].flatMap(k => res.grupos[0].contrastes.map(c => c[k])) },
  { ej: 'maiz', id: 'polinomios', e: { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['dosis'] }, op: { grado: 2 },
    r: 'c(as.data.frame(pc)$estimate, as.data.frame(pc)$p.value, coef(curva))', js: res => [...res.grupos[0].polinomios.map(x => x.est), ...res.grupos[0].polinomios.map(x => x.p), ...res.grupos[0].curva.coef] },
  { ej: 'maiz', id: 'medias-ajustadas', e: { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['dosis'], dentro: ['hibrido'] }, op: { nivel: 0.9 },
    r: 'c(as.data.frame(ci)$emmean, as.data.frame(ci)$lower.CL, as.data.frame(ci)$upper.CL)', js: res => ['media', 'inf', 'sup'].flatMap(k => res.grupos.flatMap(g => g.filas.map(f => (k === 'media' ? f.media : k === 'inf' ? f.ic[0] : f.ic[1])))) },
  { ej: 'cafe', id: 'regresion-lineal', e: { respuesta: 'rendimiento', predictores: ['altitud', 'materia_organica', 'sombra'] }, op: { nivel: 0.9, predecir: '1200 4 40\n1500 5.5 30' },
    r: 'c(coef(modelo), confint(modelo, level = 0.9), AIC(modelo), BIC(modelo), lmtest::bptest(modelo)$statistic, lmtest::resettest(modelo)$statistic, lmtest::dwtest(modelo)$p.value, car::vif(modelo), ic[, "lwr"], ip[, "upr"])',
    js: res => [...res.coeficientes.estimado, ...res.coeficientes.ic_inf, ...res.coeficientes.ic_sup, res.ajuste.aic, res.ajuste.bic, res.pruebas.breusch_pagan.BP, res.pruebas.reset.F, res.pruebas.durbin_watson.p, ...res.colinealidad.vif, ...res.predicciones.ic_inf, ...res.predicciones.ip_sup] },
  { ej: 'maiz', id: 'regresion-polinomial', e: { respuesta: 'rend', predictores: 'dosis' }, op: { grado: 2, nivel: 0.95, predecir: '90 150' },
    r: 'c(coef(modelo), anova(modelo)$`F value`[1], ic[, "fit"], ip[, "lwr"], shapiro.test(residuals(modelo))$p.value)',
    js: res => [...res.coeficientes.estimado, res.anova.regresion.F, ...res.predicciones.ajuste, ...res.predicciones.ip_inf, res.pruebas.shapiro.p] },
  { ej: 'cafe', id: 'seleccion-pasos', e: { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, op: { criterio: 'aic', direccion: 'ambas' },
    r: 'c(sel$anova$AIC, coef(sel))', js: res => [...res.pasos.map(p => p.aic), ...res.final.estimado] },
  { ej: 'cafe', id: 'seleccion-pasos', e: { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, op: { criterio: 'p', direccion: 'mixta', entrada: 0.05, salida: 0.1 },
    r: 'coef(ajusta(vs))', js: res => res.final.estimado },
  { ej: 'cafe', id: 'seleccion-pasos', e: { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, op: { criterio: 'p', direccion: 'atras', entrada: 0.05, salida: 0.05 },
    r: 'coef(ajusta(vs))', js: res => res.final.estimado },
  { ej: 'cafe', id: 'mejores-subconjuntos', e: { respuesta: 'rendimiento', predictores: ['altitud', 'temperatura', 'lluvia', 'materia_organica', 'ph', 'sombra', 'edad'] }, op: { mejores: 2 },
    r: 'c(s$rss, s$adjr2, s$cp, s$bic)', js: res => ['rss', 'r2_ajustada', 'cp', 'bic'].flatMap(k => res.filas.map(x => x[k])) },
  { ej: 'sorgo', id: 'ancova', e: { respuesta: 'rend', tratamientos: ['variedad'], bloque: 'bloque', covariables: ['plantas'] }, op: { tipoSC: 3, metodo: 'tukey', alfa: 0.05, nivel: 0.95 },
    r: 'c(car::Anova(modelo, type = 3)[-1, "F value"][1:3], as.data.frame(em)$emmean, as.data.frame(pr)$p.value, er)',
    js: res => [...res.anova.F.slice(0, 3), ...res.medias[0].filas.map(x => x.media), ...res.comparaciones[0].pares.map(x => x.p_ajustado), res.eficiencia.relativa] },
  { ej: 'maiz', id: 'ancova', e: { respuesta: 'rend', tratamientos: ['hibrido'], covariables: ['dosis'] }, op: { tipoSC: 1, metodo: 'bonferroni', alfa: 0.05, nivel: 0.9 },
    r: 'c(anova(modelo)[, "F value"][1:2], confint(em, level = 0.9)$lower.CL, as.data.frame(pr)$p.value)',
    js: res => [...res.anova.F.slice(0, 2), ...res.medias[0].filas.map(x => x.ic[0]), ...res.comparaciones[0].pares.map(x => x.p_ajustado)] },
  { ej: 'cafe', id: 'correlacion', e: { x: 'altitud', y: 'rendimiento' }, op: { metodo: 'pearson', alternativa: 'bilateral', nivel: 0.9 },
    r: 'c(prueba$estimate, prueba$conf.int, prueba$statistic, prueba$p.value)', js: res => [res.estimado, ...res.ic, res.estadistico, res.p] },
  { ej: 'cafe', id: 'correlacion', e: { x: 'lluvia', y: 'rendimiento' }, op: { metodo: 'kendall', alternativa: 'menor', continuidad: true },
    r: 'c(prueba$estimate, prueba$statistic, prueba$p.value)', js: res => [res.estimado, res.estadistico, res.p] },
  { ej: 'cafe', id: 'matriz-correlacion', e: { variables: ['altitud', 'temperatura', 'materia_organica', 'sombra', 'rendimiento'] }, op: { metodo: 'spearman', ajuste: 'BH', faltantes: 'completas' },
    r: 'c(apply(pares, 2, function(v) r[v[1], v[2]]), p.adjust(p, "BH"))', js: res => [...res.pares.map(x => x.r), ...res.pares.map(x => x.p_ajustado)] },
  { ej: 'cafe', id: 'correlacion-parcial', e: { x: 'temperatura', y: 'rendimiento', controles: ['altitud', 'sombra'] }, op: { metodo: 'pearson' },
    r: 'c(prueba(cor(ex, ey)), prueba(cor(d$rendimiento, ex)), prueba(cor(d$temperatura, ey)))', js: res => [res.parcial, res.semiparcial_x, res.semiparcial_y].flatMap(z => [z.r, z.t, z.p]) },
  { ej: 'mendel', id: 'tabla-contingencia', e: { fila: 'forma', columna: 'color', frecuencia: 'semillas' }, op: { correccion: true, nivel: 0.95 },
    r: 'c(prueba$statistic, prueba$p.value, G2, fisher.test(tabla)$p.value, fisher.test(tabla)$estimate, sqrt(chisq.test(tabla, correct = FALSE)$statistic / (sum(tabla) * (min(dim(tabla)) - 1))))',
    js: res => [res.chi.X2, res.chi.p, res.chi.G2, res.fisher.p, res.fisher.razon_momios, res.medidas.v_cramer] },
  { ej: 'germinacion-lotes', id: 'mantel-haenszel', e: { fila: 'tratamiento', columna: 'germinacion', estrato: 'lote', frecuencia: 'semillas' }, op: { correccion: true, nivel: 0.95 },
    r: 'c(mh$statistic, mh$p.value, mh$estimate, mh$conf.int)', js: res => [res.X2, res.p, res.razon_momios, ...res.ic] },
  { ej: 'roya-evaluadores', id: 'kappa', e: { evaluador1: 'evaluador_A', evaluador2: 'evaluador_B' }, op: { ponderacion: 'lineal', nivel: 0.95 },
    r: 'c(ck$kappa, ck$weighted.kappa, sqrt(ck$var.kappa), sqrt(ck$var.weighted))', js: res => [res.simple.estimado, res.ponderada.estimado, res.simple.ee, res.ponderada.ee] },
  { ej: 'maiz', id: 'modelo-lineal', e: { respuesta: 'rend' }, op: { derecha: 'bloque + hibrido * dosis', comoFactor: ['dosis'], tipoSC: 3 },
    r: 'c(local({ o <- options(contrasts = c("contr.sum", "contr.poly")); a <- car::Anova(update(modelo), type = 3); options(o); a[2:5, "F value"] }), coef(modelo), summary(modelo)$r.squared)',
    js: res => [...res.anova.F.slice(0, 4), ...res.coeficientes.estimado, res.resumen.r2] },
  { ej: 'sorgo', id: 'modelo-lineal', e: { respuesta: 'rend' }, op: { derecha: 'bloque + variedad * plantas', tipoSC: 2 },
    r: 'c(car::Anova(modelo, type = 2)[1:4, "F value"], coef(modelo))', js: res => [...res.anova.F.slice(0, 4), ...res.coeficientes.estimado] },
  { ej: 'maiz', id: 'modelo-lineal', e: { respuesta: 'rend' }, op: { derecha: 'hibrido + bloque - 1', tipoSC: 1 },
    r: 'c(anova(modelo)[1:2, "F value"], summary(modelo)$r.squared, coef(modelo))', js: res => [res.anova.F[0], res.anova.F[1], res.resumen.r2, ...res.coeficientes.estimado] },
  /* Hito 2.3: componentes de varianza, heredabilidad y repetibilidad (REML del núcleo contra lme4 con tolerancia estricta) */
  { ej: 'alfa-latice', id: 'componentes-varianza', e: { respuesta: 'rendimiento', aleatorios: ['repeticion', 'bloque'], fijos: ['genotipo'] }, op: { estructura: 'anidados' },
    r: 'vc$vcov[match(c("repeticion", "repeticion:bloque", "Residual"), vc$grp)]', js: res => res.componentes.map(x => x.sigma2) },
  { ej: 'alfa-latice', id: 'heredabilidad', e: { respuesta: 'rendimiento', genotipo: 'genotipo', repeticion: 'repeticion', bloque: 'bloque' }, op: { seleccion: 0.1, direccion: 'mayor' },
    r: 'c(s2g, s2e, H2, H2_cullis, H2_piepho)', js: res => [res.componentes[0].sigma2, res.componentes[2].sigma2, res.heredabilidad.estandar, res.heredabilidad.cullis, res.heredabilidad.piepho] },
  { ej: 'avena-ambientes', id: 'heredabilidad', e: { respuesta: 'rendimiento', genotipo: 'genotipo', repeticion: 'repeticion', ambiente: 'ambiente' }, op: { seleccion: 0.2, direccion: 'mayor' },
    r: 'c(s2g, s2ga, s2e, H2, H2_cullis, H2_piepho)', js: res => [res.componentes[0].sigma2, res.componentes[1].sigma2, res.componentes[2].sigma2, res.heredabilidad.estandar, res.heredabilidad.cullis, res.heredabilidad.piepho] },
  /* Hito 2.4: modelos lineales generalizados (la familia automática la decide la app y el código usa la elegida) */
  { ej: 'aguacate', id: 'glm-conteos', e: { respuesta: 'trips', tratamientos: ['tratamiento'], bloque: 'bloque' }, op: { familia: 'auto' },
    r: 'c(coef(m), deviance(m), as.data.frame(em)[, 2])', js: res => [...res.coeficientes.estimado, res.ajuste.devianza, ...res.medias[0].filas.map(f => f.respuesta)] },
  { ej: 'frijol', id: 'glm-proporciones', e: { respuesta: 'germinadas', ensayos: 'sembradas', tratamientos: ['tratamiento'] }, op: { familia: 'auto' },
    r: 'c(coef(m), as.data.frame(em)[, 2], as.data.frame(pairs(em, adjust = "tukey"))$p.value)', js: res => [...res.coeficientes.estimado, ...res.medias[0].filas.map(f => f.respuesta), ...res.medias[0].pares.map(x => x.p)] },
  { ej: 'venenos', id: 'glm-gamma', e: { respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'] }, op: { familia: 'gamma', enlace: 'log' },
    r: 'c(coef(m), sum(residuals(m, type = "pearson")^2) / df.residual(m), as.data.frame(em)[, 2])', js: res => [...res.coeficientes.estimado, res.ajuste.dispersion, ...res.medias[1].filas.map(f => f.respuesta)] },
  { ej: 'aguacate', id: 'glm', e: { respuesta: 'trips' }, op: { derecha: 'bloque + tratamiento', comoFactor: ['bloque'], familia: 'cuasipoisson', tipo: 1, comparar: ['tratamiento'] },
    r: 'c(coef(m), anova(m, test = "F")[-1, "F"])', js: res => [...res.coeficientes.estimado, ...res.devianza.map(x => x.estadistico)] },
  /* Hito 2.6: regresión no lineal (el código arranca en los valores de la app y nls converge al mismo óptimo) */
  { ej: 'herbicida-dosis', id: 'dosis-respuesta', e: { respuesta: 'peso_seco', dosis: 'dosis', grupo: 'herbicida' }, op: { modelo: 'll4' },
    r: 'c(coef(m), deviance(m), anova(m0, m)$F[2])', js: res => [...res.parametros.estimado, res.ajuste.rss, res.comparacion.global.F] },
  { ej: 'maiz-altura', id: 'curva-crecimiento', e: { respuesta: 'altura', x: 'dds' }, op: { modelo: 'logistico' },
    r: 'c(coef(m), summary(m)$coefficients[, 2], AIC(m))', js: res => [...res.parametros.estimado, ...res.parametros.ee, res.ajuste.AIC] },
  { ej: 'maiz', id: 'respuesta-meseta', e: { respuesta: 'rend', dosis: 'dosis' }, op: { modelo: 'cuadratico-meseta' },
    r: 'c(coef(m), summary(m)$sigma)', js: res => [...res.parametros.estimado, res.ajuste.sigma] },
  { ej: 'guayabo-cosechas', id: 'repetibilidad', e: { respuesta: 'rendimiento', individuo: 'arbol', fijos: ['cosecha'] }, op: {},
    r: 'c(r, mh * r / (1 + (mh - 1) * r), R2 * (1 - r) / ((1 - R2) * r))', js: res => [res.repetibilidad.r, res.repetibilidad.R2, ...res.necesarias.map(x => x.medidas)] },
  { ej: 'tomate-superficie', id: 'superficie-respuesta', e: { respuesta: 'rendimiento', factores: ['N', 'K'] }, op: { orden: 'segundo', objetivo: 'maximo' },
    r: 'c(coef(m), xs, eigen(B)$values, anova(m, pe)$F[2])', js: res => [...res.coeficientes.estimado, ...res.estacionario.codificado, ...res.canonico.valores, res.falta_ajuste.F] },
  { ej: 'tomate-superficie', id: 'ascenso-pronunciado', e: { respuesta: 'rendimiento', factores: ['N', 'K'] }, op: { objetivo: 'maximo' },
    r: 'c(coef(m), b / sqrt(sum(b^2)), anova(m, pe)$F[2])', js: res => [...res.coeficientes.estimado, ...res.cresta.codificado[2], res.falta_ajuste.F] },
  { ej: 'avena-ambientes', id: 'ensayos-multiambiente', e: { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, op: {},
    r: 'c(anova(lm(y ~ amb + amb:rep + gen + gen:amb, data = d))[c(1, 3, 2, 4, 5), 3], cme, gle)', js: res => [...res.anova.cm, res.cme, res.gle] },
  { ej: 'avena-ambientes', id: 'estabilidad', e: { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, op: {},
    r: 'c(t(apply(Y, 1, function(v) { m <- lm(v ~ I); c(b = coef(m)[[2]], S2d = deviance(m) / (length(v) - 2) - cme / r) })), W, (g * (g - 1) * W - sum(W)) / ((g - 1) * (g - 2) * (e - 1)) / r)',
    js: res => [...res.regresion.b, ...res.regresion.s2d, ...res.wricke.W, ...res.shukla.sigma2] },
  { ej: 'avena-ambientes', id: 'ammi', e: { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, op: {},
    r: 'c(sc, F, scr / glr / cme)', js: res => [...res.ammi.ejes.sc, ...res.ammi.ejes.F, ...res.ammi.fr.F] },
  { ej: 'avena-ambientes', id: 'gge', e: { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' }, op: {},
    r: '(100 * s$d^2 / sum(s$d^2))[1:4]', js: res => res.gge.pct.slice(0, 4) },
  { ej: 'maiz', id: 'potencia-medias', e: {}, op: { calcular: 'n', diferencia: 0.5, de: 0.4 }, r: 'c(res$n, res$power)', js: res => [res.n, res.potencia] },
  { ej: 'maiz', id: 'potencia-anova', e: {}, op: { calcular: 'potencia', medias: '4.2, 4.8, 5.1, 5.6', de: 0.6, n: 4 }, r: 'c(res$power, res$between.var)', js: res => [res.potencia, res.varEntre] },
  { ej: 'maiz', id: 'potencia-proporciones', e: {}, op: { calcular: 'n', p1: 0.65, p2: 0.8 }, r: 'res$n', js: res => [res.n] },
  { ej: 'maiz', id: 'potencia-correlacion', e: {}, op: { calcular: 'r', n: 40 }, r: 'res$r', js: res => [res.r] },
  { ej: 'maiz', id: 'repeticiones', e: {}, op: { cv: 12, diferencia: 15, tratamientos: 6 }, r: 'c(r, req)', js: res => [res.repeticiones, res.requeridas] },
  { ej: 'frijol-germinacion', id: 'kaplan-meier', e: { tiempo: 'dias', evento: 'germino', grupo: 'tratamiento' }, op: { conf: 'log', rho: 0 },
    r: 'c(fit$surv, fit$lower, q$quantile, sd$chisq)', js: res => [...res.grupos.flatMap(g => g.curva.S), ...res.grupos.flatMap(g => g.curva.inf), ...[0, 1, 2].flatMap(k => res.grupos.map(g => g.cuantiles.tiempo[k])), res.comparacion.chi2] },   // quantile() da una matriz grupos × p que c() aplana por columnas
  { ej: 'frijol-germinacion', id: 'cox', e: { tiempo: 'dias', evento: 'germino', factores: ['tratamiento'], covariables: ['peso_semilla'] }, op: { empates: 'efron' },
    r: 'c(coef(fit), sqrt(diag(fit$var)), fit$loglik, fit$score, fit$concordance[["concordance"]], zph$table[, "chisq"])',
    js: res => [...res.coef, ...res.ee, res.ll0, res.ll, res.score, res.concordancia.C, ...res.zph.chi2] },
  { ej: 'estacion-mensual', id: 'autocorrelacion', e: { respuesta: 'precipitacion_mm', tiempo: 'periodo' }, op: { lagBox: 12 },
    r: 'c(a$acf, p$acf, lb$statistic, bp$statistic)', js: res => [...res.acf, ...res.pacf, res.box.ljung_box, res.box.box_pierce] },
  { ej: 'estacion-mensual', id: 'descomposicion', e: { respuesta: 'temperatura', tiempo: 'periodo' }, op: { frecuencia: 12, tipo: 'aditiva' },
    r: 'c(d$figure, d$trend[7:90])', js: res => [...res.figura, ...res.tendencia.slice(6, 90)] },
  { ej: 'estacion-mensual', id: 'tendencia', e: { respuesta: 'temperatura', tiempo: 'periodo' }, op: { nivel: 0.95 },
    r: 'c(mk.test(x)$statistic, mk.test(x)$p.value, sens.slope(x)$estimates, sens.slope(x)$conf.int)', js: res => [res.z, res.p, res.pendiente, res.pendiente_inf, res.pendiente_sup] },
  { ej: 'chile-frutos', id: 'manova', e: { respuestas: ['largo_cm', 'ancho_cm', 'peso_g', 'pared_mm'], tratamientos: ['variedad'], bloque: 'bloque' }, op: { prueba: 'pillai' },
    r: 'c(summary(fit)$stats[1:2, 2:3], summary(fit, test = "Wilks")$stats[1:2, 2:3])', js: res => [res.terminos[0].pruebas.pillai.estadistico, res.terminos[1].pruebas.pillai.estadistico, res.terminos[0].pruebas.pillai.F, res.terminos[1].pruebas.pillai.F,
      res.terminos[0].pruebas.wilks.estadistico, res.terminos[1].pruebas.wilks.estadistico, res.terminos[0].pruebas.wilks.F, res.terminos[1].pruebas.wilks.F] },
  { ej: 'chile-frutos', id: 'discriminante', e: { variables: ['largo_cm', 'ancho_cm', 'peso_g', 'pared_mm'], grupo: 'variedad' }, op: {},
    r: 'c(fit$svd, prop, abs(fit$scaling), mean(cv$class == g))', js: res => [...res.sv, ...res.proporcion, ...res.escala[0].map((_, c) => res.escala.map(f => Math.abs(f[c]))).flat(), res.acierto_cv] },
  { ej: 'aguacate-huertas', id: 'tamano-muestra', e: {}, op: { tipo: 'proporcion', p: 0.3, error: 0.05, N: 900 }, r: 'c(n0, n)', js: res => [res.n0, res.n] },
  { ej: 'aguacate-huertas', id: 'muestreo-simple', e: { respuesta: 'con_trips' }, op: { N: 1580 }, r: 'c(m, ee, m - t * ee, N * m)', js: res => [res.media, res.ee, res.ic[0], res.total] },
  { ej: 'aguacate-huertas', id: 'muestreo-estratificado', e: { respuesta: 'rendimiento_kg', estrato: 'huerta' }, op: { poblaciones: 'Ladera=420; Planicie=900; Vega=260', nTotal: 60 },
    r: 'c(mst, ee, gl, sum(Nh) * mst, n * Nh * sqrt(s2) / sum(Nh * sqrt(s2)))', js: res => [res.media, res.ee, res.gl, res.total, ...res.asignacion.neyman] },
];
const efectoDe = res => [res.efecto.d, ...res.efecto.ic_d, res.efecto.g, ...res.efecto.ic_g];
/* aggregate() de R deja el primer factor cambiando más rápido; la app, el último */
function ordenR(res, k) {
  const facs = res.factores, t = res.tabla, idx = t[k].map((_, i) => i);
  const niveles = facs.map(f => [...new Set(t.grupo[f])]);
  idx.sort((a, b) => { for (let j = facs.length - 1; j >= 0; j--) { const d = niveles[j].indexOf(t.grupo[facs[j]][a]) - niveles[j].indexOf(t.grupo[facs[j]][b]); if (d) return d; } return 0; });
  return idx.map(i => t[k][i]);
}

const dir = mkdtempSync(join(tmpdir(), 'sigmapro-codigo-r-'));
let fallas = 0, numeros = 0;
const metodosR = new Set();
try {
  ESCENARIOS.forEach((s, n) => {
    const { csv, hoja } = hojaDe(s.ej);
    const ficha = SP.metodos[s.id];
    const { resultado } = SP.ejecutar(s.id, hoja.aTabla(), s.e, s.op);
    const codigo = ficha.codigoR(s.e, SP.opcionesCon(ficha, s.op), Object.assign({ resultado }, s.ctx || {}));
    const archivo = join(dir, 'datos.csv').replace(/\\/g, '/');
    writeFileSync(archivo, csv);
    const guion = `datos <- read.csv("${archivo}", stringsAsFactors = TRUE)\n` +
      (hoja.cols.filter(c => c.tipo === 'factor').map(c => `datos$${c.nombre} <- factor(datos$${c.nombre}, levels = ${'c(' + c.niveles.map(v => JSON.stringify(v)).join(', ') + ')'})`).join('\n')) + '\n' +
      `invisible(capture.output({\n${codigo}\n}))\ncat(sprintf("%.17g", ${s.r}), sep = "\\n")\n`;
    writeFileSync(join(dir, 'g.R'), guion);
    let salida;
    try { salida = execFileSync(R, [join(dir, 'g.R')], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { fallas++; console.log(`✗ ${n + 1}. ${s.id} con ${s.ej}: el código R falló\n${(e.stderr || e.message).split('\n').slice(0, 6).join('\n')}`); return; }
    const deR = salida.trim().split(/\s+/).map(v => (v === 'Inf' ? Infinity : v === '-Inf' ? -Infinity : Number(v))), deJS = s.js(resultado).map(Number);
    const malos = deR.map((v, i) => [v, deJS[i]]).filter(([a, b]) => !(a === b || (Number.isNaN(a) && Number.isNaN(b)) || Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a))));
    if (deR.length !== deJS.length || malos.length) { fallas++; console.log(`✗ ${n + 1}. ${s.id} con ${s.ej}: ${deR.length} números de R contra ${deJS.length} de la app; ${malos.length} distintos`, malos.slice(0, 4)); }
    else { numeros += deR.length; metodosR.add(s.id); console.log(`✓ ${n + 1}. ${s.id} con ${s.ej}: ${deR.length} números iguales`); }
  });
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log(fallas ? `\nHAY FALLAS (${fallas})` : '\nTODO APROBADO: el código R que muestra la app reproduce sus números');
guardar('codigo-r', { titulo: 'El código R equivalente', ok: !fallas,
  resumen: `${ESCENARIOS.length} escenarios de ${metodosR.size} métodos: el código R que muestra la app corre en R y da ${numeros.toLocaleString('es-MX')} números iguales a los de la app (tolerancia 1e-6)` + (fallas ? `; ${fallas} con fallas` : '') });
process.exit(fallas ? 1 : 0);

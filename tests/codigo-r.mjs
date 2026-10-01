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

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos)\//.test(s));
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
let fallas = 0;
try {
  ESCENARIOS.forEach((s, n) => {
    const { csv, hoja } = hojaDe(s.ej);
    const ficha = SP.metodos[s.id];
    const { resultado } = SP.ejecutar(s.id, hoja.aTabla(), s.e, s.op);
    const codigo = ficha.codigoR(s.e, s.op, s.ctx || {});
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
    else console.log(`✓ ${n + 1}. ${s.id} con ${s.ej}: ${deR.length} números iguales`);
  });
} finally { rmSync(dir, { recursive: true, force: true }); }
console.log(fallas ? `\nHAY FALLAS (${fallas})` : '\nTODO APROBADO: el código R que muestra la app reproduce sus números');
process.exit(fallas ? 1 : 0);

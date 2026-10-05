// SigmaPro — la interfaz en inglés (Hito 4.5).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/idioma.mjs
//
// 1. Cobertura del catálogo (js/i18n/en.js): cada texto que el código pasa a T('…'), cada texto fijo de index.html y
//    cada nombre y descripción de los datos de ejemplo tiene su traducción, con los mismos marcadores {x}.
// 2. Los cálculos no dependen del idioma: cada caso de tests/casos (los del núcleo JS) se corre con el núcleo en
//    español y en inglés y todos los números deben ser idénticos.
// 3. Ningún texto queda sin traducir al armar los resultados: con el núcleo en inglés se arma el reporte, el párrafo
//    del informe y el código R de cada caso, y SP.T anota las claves que no encontró en el catálogo.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');
const problemas = [];

/* ---------------- el catálogo ---------------- */
const contextoCat = vm.createContext({});
contextoCat.self = contextoCat;
vm.runInContext(leer(join(RAIZ, 'js', 'i18n', 'en.js')), contextoCat);
const CAT = contextoCat.SP_CATALOGO;
const tiene = k => Object.prototype.hasOwnProperty.call(CAT, k);
const marc = s => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const [k, v] of Object.entries(CAT)) {
  if (typeof v !== 'string' || !v.length) problemas.push('traducción vacía: «' + k + '»');
  else if (marc(k) !== marc(v)) problemas.push('marcadores distintos: «' + k + '» → «' + v + '»');
}

/* ---------------- 1. cobertura: los textos del código, de la página y de los ejemplos ---------------- */
const archivos = [];
(function rec(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (!/generado|i18n/.test(p)) rec(p); } else if (p.endsWith('.js') && !/labg-/.test(f)) archivos.push(p); } })(join(RAIZ, 'js'));
const literales = new Map();
for (const a of archivos) {
  const s = leer(a);
  for (const m of s.matchAll(/\bT\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1\s*[,)]/g)) {
    if (m[1] === '`' && m[2].includes('${')) continue;
    const t = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
    if (!literales.has(t)) literales.set(t, relative(RAIZ, a).replace(/\\/g, '/'));
  }
}
const sinTraducir = [...literales].filter(([k]) => !tiene(k));
for (const [k, a] of sinTraducir.slice(0, 30)) problemas.push('sin traducción (' + a + '): «' + k + '»');
if (sinTraducir.length > 30) problemas.push('… y ' + (sinTraducir.length - 30) + ' textos más sin traducción');
/* textos fijos de index.html (como los busca js/interfaz/idioma.js) */
{
  let h = leer(join(RAIZ, 'index.html')).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ');
  const ent = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&middot;/g, '·').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&rarr;/g, '→').replace(/&times;/g, '×');
  const limpio = s => ent(s).replace(/\s+/g, ' ').trim();
  const fijos = new Set();
  for (const m of h.matchAll(/\s(?:title|aria-label|placeholder|alt)="([^"]*)"/g)) { const v = limpio(m[1]); if (/[a-záéíóúñ]{3}/i.test(v)) fijos.add(v); }
  for (const parte of h.replace(/<head>[\s\S]*?<\/head>/, ' ').split(/<[^>]+>/)) { const v = limpio(parte); if (/[a-záéíóúñ]{3}/i.test(v)) fijos.add(v); }
  const neutros = new Set(['SigmaPro', 'LABG Suite', 'Sigma', 'Pro', 'Español', 'English', 'Idioma / Language']);
  const faltan = [...fijos].filter(k => !tiene(k) && !neutros.has(k));
  for (const k of faltan.slice(0, 20)) problemas.push('index.html sin traducción: «' + k + '»');
}
/* los datos de ejemplo */
{
  const c = vm.createContext({ window: {} });
  vm.runInContext(leer(join(RAIZ, 'datos', 'ejemplos.js')), c);
  for (const e of c.window.SP_EJEMPLOS) for (const k of [e.nombre, e.descripcion]) if (k && !tiene(k)) problemas.push('ejemplo sin traducción: «' + k + '»');
}

/* ---------------- 2 y 3. el núcleo en español y en inglés ---------------- */
const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
function nucleo(ingles) {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true, CompressionStream, DecompressionStream, Blob, Response });
  if (ingles) ctx.SP_CATALOGO = CAT;
  for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), ctx, { filename: s });
  for (const s of ['arnes.js', 'comparar.js', 'validar.js']) vm.runInContext(leer(join(TESTS, 'lib', s)), ctx, { filename: s });
  return ctx;
}
const ES = nucleo(false), EN = nucleo(true);
/* los nombres de las funciones validadas (bloque de validación) */
for (const v of Object.values(ES.SP.nombresFunciones || {})) if (!tiene(v)) problemas.push('función validada sin traducción: «' + v + '»');
if (ES.SP.IDIOMA !== 'es' || EN.SP.IDIOMA !== 'en') problemas.push('el idioma del núcleo no se detecta (es: ' + ES.SP.IDIOMA + ', en: ' + EN.SP.IDIOMA + ')');
EN.SP.T.faltantes = new Set();

const casos = [];
(function rec(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) rec(p); else if (p.endsWith('.json')) casos.push(JSON.parse(leer(p))); } })(join(TESTS, 'casos'));
/* el bloque de validación muestra el título y la fuente de cada caso */
{
  const faltan = [...new Set(casos.flatMap(c => [c.titulo, c.fuente]).filter(k => k && !tiene(k)))];
  for (const k of faltan.slice(0, 20)) problemas.push('caso de validación sin traducción: «' + k + '»');
  if (faltan.length > 20) problemas.push('… y ' + (faltan.length - 20) + ' títulos o fuentes más');
}
/** Los números de un resultado, en orden (los textos no cuentan: cambian con el idioma). */
function numeros(x, out = [], ruta = '') {
  if (typeof x === 'number') out.push([ruta, x]);
  else if (ArrayBuffer.isView(x)) Array.from(x).forEach((v, i) => out.push([ruta + '[' + i + ']', v]));
  else if (Array.isArray(x)) x.forEach((v, i) => numeros(v, out, ruta + '[' + i + ']'));
  else if (x && typeof x === 'object') for (const k of Object.keys(x)) if (typeof x[k] !== 'function') numeros(x[k], out, ruta + '.' + k);
  return out;
}
let comparados = 0, valores = 0, armados = 0;
const distintos = [];
for (const c of casos) {
  const correr = ctx => {
    const SP = ctx.SP;
    if (c.objetivo.tipo !== 'metodo') { const r = ctx.SPT.ejecutarCaso(c, SP); return { aprobado: r.aprobado, valores: r.valores, difMax: r.difMax }; }
    const f = SP.metodos[c.objetivo.nombre];
    if (!f || f.motor === 'r') return undefined;
    const d = c.datos || { columnas: {} }, tabla = Object.keys(d.columnas || {}).length ? SP.tabla.crear(d.columnas, d.tipos) : null;
    const op = SP.opcionesCon(f, c.opciones || {}), o = SP.ejecutar(c.objetivo.nombre, tabla, c.entradas || {}, op);
    /* lo que ve la persona: el reporte, el párrafo del informe y el código R */
    const rep = f.reporte ? f.reporte(o.resultado) : null;
    if (SP.informe && rep) SP.informe.parrafo(c.objetivo.nombre, o.resultado, rep, c.entradas || {}, op);
    if (f.codigoR) f.codigoR(c.entradas || {}, op, { resultado: o.resultado });
    if (ctx === EN) armados++;
    return o.resultado;
  };
  let a, b;
  try { a = correr(ES); b = correr(EN); } catch (e) { problemas.push(c.id + ': ' + e.message); continue; }
  if (a === undefined) continue;
  const na = numeros(a), nb = numeros(b);
  comparados++; valores += na.length;
  if (na.length !== nb.length) { distintos.push(c.id + ': ' + na.length + ' números en español y ' + nb.length + ' en inglés'); continue; }
  for (let i = 0; i < na.length; i++) {
    const [r, x] = na[i], y = nb[i][1];
    if (!(Object.is(x, y) || (Number.isNaN(x) && Number.isNaN(y)))) { distintos.push(c.id + ' ' + r + ': ' + x + ' ≠ ' + y); break; }
  }
}
for (const d of distintos.slice(0, 20)) problemas.push('el idioma cambió un cálculo: ' + d);
const faltantes = [...EN.SP.T.faltantes].filter(k => /[a-záéíóúñ]/i.test(k));
for (const k of faltantes.slice(0, 40)) problemas.push('texto sin traducir al armar resultados: «' + k + '»');
if (faltantes.length > 40) problemas.push('… y ' + (faltantes.length - 40) + ' más');

console.log('\nSigmaPro · la interfaz en inglés');
console.log('  catálogo: ' + Object.keys(CAT).length + ' textos; en el código: ' + literales.size + ' literales de T()');
console.log('  ' + comparados + ' casos corridos en español y en inglés (' + valores.toLocaleString('es-MX') + ' números), ' + armados + ' reportes, párrafos y códigos R armados en inglés');
for (const p of problemas) console.log('  ✗ ' + p);
console.log(problemas.length ? '\nHAY FALLAS (' + problemas.length + ')' : '\nTODO APROBADO');
guardar('idioma', { titulo: 'La interfaz en inglés', ok: !problemas.length,
  resumen: `${Object.keys(CAT).length} textos traducidos; ${comparados} casos con los mismos números en los dos idiomas (${valores.toLocaleString('es-MX')} valores); ${armados} resultados armados en inglés sin textos pendientes` + (problemas.length ? `; ${problemas.length} problemas` : '') });
process.exit(problemas.length ? 1 : 0);

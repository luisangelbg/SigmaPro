// SigmaPro — prueba de regresión de lo que muestra cada análisis (Fase 5).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/regresion.mjs               compara contra la huella guardada
//       node tests/regresion.mjs --actualizar  guarda la huella nueva (después de revisar qué cambió y por qué)
//
// Cada caso de tests/casos cuyo objetivo es un método del núcleo JS se corre y se guarda la huella (SHA-256) de:
//   · el resultado: todos sus números con precisión completa. En la Fase 5 nada debe cambiarlos: la interfaz crece
//     alrededor de los cálculos, que ya están validados contra R.
//   · el reporte: los cuadros (títulos, columnas y celdas), las conclusiones, el semáforo y las notas, tal como los
//     arma el método. Cambia cuando cambia un texto o un formato; entonces se revisa y se actualiza a propósito.
// Sale con código 1 si alguna huella no coincide. La huella vive en tests/generado/regresion.json.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const ARCHIVO = join(TESTS, 'generado', 'regresion.json');
const actualizar = process.argv.includes('--actualizar');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');

const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true, CompressionStream, DecompressionStream, Blob, Response });
for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), ctx, { filename: s });
const SP = ctx.SP;

const casos = [];
(function rec(d) { for (const f of readdirSync(d).sort()) { const p = join(d, f); if (statSync(p).isDirectory()) rec(p); else if (p.endsWith('.json')) casos.push(JSON.parse(leer(p))); } })(join(TESTS, 'casos'));

/** Forma canónica: números con su representación exacta (NaN, ±Inf y −0 incluidos), llaves en orden. */
function canonico(x) {
  if (typeof x === 'number') return Object.is(x, -0) ? '-0' : String(x);
  if (x === null || x === undefined || typeof x === 'boolean' || typeof x === 'string') return JSON.stringify(x === undefined ? null : x);
  if (ArrayBuffer.isView(x)) return '[' + Array.from(x, canonico).join(',') + ']';
  if (Array.isArray(x)) return '[' + x.map(canonico).join(',') + ']';
  if (typeof x === 'object') return '{' + Object.keys(x).sort().filter(k => typeof x[k] !== 'function').map(k => JSON.stringify(k) + ':' + canonico(x[k])).join(',') + '}';
  return 'null';
}
const huella = x => createHash('sha256').update(canonico(x)).digest('hex').slice(0, 24);
/** Solo los números del resultado (los textos que trae, como nombres de niveles, ya los cubre el reporte). */
function numeros(x, out = []) {
  if (typeof x === 'number') out.push(x);
  else if (ArrayBuffer.isView(x)) for (const v of x) out.push(v);
  else if (Array.isArray(x)) for (const v of x) numeros(v, out);
  else if (x && typeof x === 'object') for (const k of Object.keys(x).sort()) if (typeof x[k] !== 'function') numeros(x[k], out);
  return out;
}

const nuevas = {};
const problemas = [];
for (const c of casos) {
  if (!c.objetivo || c.objetivo.tipo !== 'metodo') continue;
  const f = SP.metodos[c.objetivo.nombre];
  if (!f || f.motor === 'r') continue;
  try {
    const d = c.datos || { columnas: {} };
    const tabla = Object.keys(d.columnas || {}).length ? SP.tabla.crear(d.columnas, d.tipos) : null;
    const op = SP.opcionesCon(f, c.opciones || {});
    const o = SP.ejecutar(f.id, tabla, c.entradas || {}, op);
    const rep = f.reporte ? f.reporte(o.resultado) : null;
    const nums = numeros(o.resultado);
    nuevas[c.id] = { numeros: nums.length, resultado: huella(nums), reporte: rep ? huella(rep) : null };
  } catch (e) { problemas.push(c.id + ': ' + e.message); }
}

const previa = existsSync(ARCHIVO) ? JSON.parse(leer(ARCHIVO)).casos || {} : null;
const cambios = { resultado: [], reporte: [], nuevos: [], quitados: [] };
if (previa) {
  for (const [id, h] of Object.entries(nuevas)) {
    const p = previa[id];
    if (!p) { cambios.nuevos.push(id); continue; }
    if (p.resultado !== h.resultado) cambios.resultado.push(id + ' (' + p.numeros + ' → ' + h.numeros + ' números)');
    if (p.reporte !== h.reporte) cambios.reporte.push(id);
  }
  for (const id of Object.keys(previa)) if (!nuevas[id]) cambios.quitados.push(id);
}

const n = Object.keys(nuevas).length, total = Object.values(nuevas).reduce((s, h) => s + h.numeros, 0);
console.log('\nSigmaPro · regresión de resultados y reportes');
console.log('  ' + n + ' casos del núcleo JS, ' + total.toLocaleString('es-MX') + ' números');
for (const p of problemas) console.log('  ✗ ' + p);
if (!previa) console.log('  (no había huella guardada)');
const lista = (t, a) => { if (a.length) console.log('  ' + t + ' (' + a.length + '): ' + a.slice(0, 12).join(', ') + (a.length > 12 ? ', …' : '')); };
lista('✗ cambió el RESULTADO', cambios.resultado);
lista('✗ cambió el reporte', cambios.reporte);
lista('casos nuevos', cambios.nuevos);
lista('casos quitados', cambios.quitados);

let ok = !problemas.length && (!previa || (!cambios.resultado.length && !cambios.reporte.length));
if (actualizar && !problemas.length) {
  writeFileSync(ARCHIVO, JSON.stringify({ generado: 'node tests/regresion.mjs --actualizar', version: SP.VERSION, casos: nuevas }, null, 1) + '\n');
  console.log('  huella guardada en tests/generado/regresion.json');
  ok = true;
} else if (!previa) ok = false;
console.log(ok ? '\nTODO APROBADO' : '\nHAY FALLAS' + (previa ? ' (si el cambio es a propósito: node tests/regresion.mjs --actualizar)' : ' (crea la huella con --actualizar)'));
guardar('regresion', { titulo: 'Regresión de resultados y reportes', ok, resumen: n + ' casos, ' + total + ' números; resultado cambiado en ' + cambios.resultado.length + ', reporte en ' + cambios.reporte.length });
process.exitCode = ok ? 0 : 1;

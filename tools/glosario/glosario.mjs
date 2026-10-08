// SigmaPro — dónde ver en acción cada término del glosario (hito 5.5).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tools/glosario/glosario.mjs [--comprobar]
//
// 1. Carga el núcleo como la app y los conjuntos de ejemplo (datos/ejemplos.js).
// 2. Corre el ejemplo de la ficha de Fundamentos de cada análisis del núcleo JS (data/fundamentos/<id>.js; los del motor R
//    no corren en node y no se usan) y anota, con el registro de estadísticos (SP.guias), en qué cuadro, columna o
//    renglón aparece cada estadístico, tal como se ve en la app (las columnas visibles; en Explorar, el primer cuadro).
// 3. Resuelve el lugar de cada concepto del glosario (SP.glosario.CONCEPTOS): su cuadro, su columna o el número de su
//    renglón; si ya no existe, falla y lo dice.
// 4. Toma de tests/generado/inventario.json (node tools/inventario/inventario.mjs) los análisis donde aparece cada
//    estadístico.
// 5. Escribe js/generado/glosario.js (self.SP_GLOSARIO), que la app carga al abrir el glosario. Con --comprobar no
//    escribe: termina con error si el archivo no corresponde a lo que saldría (lo usa tests/glosario.mjs).
// No se edita a mano: se vuelve a generar.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SALIDA = join(RAIZ, 'js', 'generado', 'glosario.js');
const comprobar = process.argv.includes('--comprobar');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');

/* el núcleo y los ejemplos */
const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true });
for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), ctx, { filename: s });
vm.runInContext(leer(join(RAIZ, 'datos', 'ejemplos.js')).replace('window.SP_EJEMPLOS', 'globalThis.SP_EJEMPLOS'), ctx);
const SP = ctx.SP, EJ = ctx.SP_EJEMPLOS;

/* las fichas de Fundamentos con su ejemplo */
const DIR = join(RAIZ, 'data', 'fundamentos');
const ejemplos = {};
for (const f of readdirSync(DIR).filter(x => x.endsWith('.js') && x !== 'indice.js').sort()) {
  new Function('SP_FICHA', leer(join(DIR, f)))(o => { if (o && o.ejemplo && o.ejemplo.conjunto) ejemplos[o.id] = o.ejemplo; });
}
/* los cálculos de potencia y tamaño de muestra no piden datos: su ejemplo son sus valores de partida */
for (const id of ['potencia-medias', 'potencia-anova', 'potencia-proporciones', 'potencia-correlacion', 'tamano-muestra', 'repeticiones'])
  if (SP.metodos[id] && !ejemplos[id]) ejemplos[id] = { conjunto: null, entradas: {}, opciones: {} };
/* los cuatro resúmenes de Explorar muestran un cuadro a la vez (el primero, al abrir) */
const EXPLORAR = new Set(['descriptivos', 'frecuencias', 'proporciones', 'bondad-ajuste']);
/* el orden en que se prefieren los ejemplos: los análisis más conocidos primero; después, por familia */
const PREFERIDOS = ['dbca', 'dca', 'prueba-t', 'correlacion', 'regresion-lineal', 'tabla-contingencia', 'comparaciones-medias', 'descriptivos',
  'kruskal-wallis', 'wilcoxon', 'ancova', 'supuestos', 'regresion-polinomial', 'glm-conteos', 'componentes-varianza', 'heredabilidad'];
const familia = id => { const i = SP.familias.findIndex(f => f.id === (SP.metodos[id] || {}).familia); return i < 0 ? 99 : i; };
const orden = Object.keys(ejemplos).filter(id => SP.metodos[id] && SP.metodos[id].motor !== 'r').sort((a, b) => {
  const pa = PREFERIDOS.indexOf(a), pb = PREFERIDOS.indexOf(b);
  return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb) || familia(a) - familia(b) || ((SP.metodos[a].orden || 0) - (SP.metodos[b].orden || 0)) || a.localeCompare(b);
});

function hojaDe(conjunto) {
  const e = EJ.find(x => x.id === conjunto);
  if (!e) throw new Error('no existe el conjunto de ejemplo ' + conjunto);
  const l = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' });
  return SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: e.tipos });
}
/* los cuadros que se ven al correr el ejemplo de un análisis */
const corridos = {};
function cuadros(id) {
  if (corridos[id]) return corridos[id];
  const ej = ejemplos[id], f = SP.metodos[id];
  const t = ej.conjunto ? hojaDe(ej.conjunto).aTabla() : null;
  const r = SP.ejecutar(id, t, ej.entradas || {}, SP.opcionesCon(f, ej.opciones || {})).resultado;
  const rep = f.reporte(r);
  let qs = rep.cuadros || [];
  if (EXPLORAR.has(id)) qs = qs.slice(0, 1);
  else if (id === 'supuestos') qs = qs.slice(0, 2);
  corridos[id] = qs.map(q => ({ id: q.id || '', columnas: SP.formatos.columnas(q), filas: q.filas || [] }));
  return corridos[id];
}

/* las columnas cuyas celdas nombran una medida (las del inventario y la «m» de los cuadros Medida · Valor) */
const COL_MEDIDA = new Set(['medida', 'prueba', 'estadistico', 'criterio', 'indice', 'parametro', 'metodo', 'cantidad', 'm']);
const MAX_LUGARES = 4;
const ver = {}, usados = new Set(), fallas = [];
for (const id of orden) {
  let qs;
  try { qs = cuadros(id); } catch (e) { fallas.push(id + ': el ejemplo no corre: ' + e.message); continue; }
  const vistos = new Set();
  qs.forEach(q => {
    if (!q.id || qs.filter(x => x.id === q.id).length > 1) return;
    const anotar = (ficha, modo, x) => {
      if (!ficha || vistos.has(ficha)) return;
      vistos.add(ficha);
      const l = ver[ficha] = ver[ficha] || [];
      if (l.length < MAX_LUGARES) { l.push([id, q.id, modo, x]); usados.add(id); }
    };
    for (const c of q.columnas) if (c.formato !== 'texto') { const g = SP.guias.buscar(c.clave, c.titulo); if (g) anotar(g.id, 'c', c.clave); }
    for (const c of q.columnas) if (COL_MEDIDA.has(c.clave)) q.filas.forEach((fila, i) => {
      const v = fila[c.clave];
      if (typeof v === 'string' && v.trim()) { const g = SP.guias.buscar(null, v); if (g) anotar(g.id, 'f', i); }
    });
  });
}

/* los conceptos */
const n = s => SP.glosario.normalizar(s);
const conceptos = {};
for (const [cid, , , , rel, accion] of SP.glosario.CONCEPTOS) {
  for (const r of rel) if (!SP.glosario.termino(r)) fallas.push(cid + ': el relacionado «' + r + '» no es un término del glosario');
  if (!accion) continue;
  const [metodo, cuadro, modo, x] = accion;
  if (!ejemplos[metodo] || SP.metodos[metodo].motor === 'r') { fallas.push(cid + ': ' + metodo + ' no tiene un ejemplo que corra en el núcleo'); continue; }
  let qs;
  try { qs = cuadros(metodo); } catch (e) { fallas.push(cid + ': el ejemplo de ' + metodo + ' no corre: ' + e.message); continue; }
  if (modo === 's') { conceptos[cid] = [metodo, null, 's', x]; usados.add(metodo); continue; }
  const q = qs.find(y => y.id === cuadro);
  if (!q) { fallas.push(cid + ': ' + metodo + ' no muestra el cuadro «' + cuadro + '»'); continue; }
  if (modo === 'q') conceptos[cid] = [metodo, cuadro, 'q', null];
  else if (modo === 'c') {
    if (!q.columnas.some(c => c.clave === x)) { fallas.push(cid + ': el cuadro «' + cuadro + '» de ' + metodo + ' no tiene la columna «' + x + '»'); continue; }
    conceptos[cid] = [metodo, cuadro, 'c', x];
  } else {
    const c0 = q.columnas[0], i = q.filas.findIndex(f => n(f[c0.clave]) === n(x));
    if (i < 0) { fallas.push(cid + ': el cuadro «' + cuadro + '» de ' + metodo + ' no tiene el renglón «' + x + '»'); continue; }
    conceptos[cid] = [metodo, cuadro, 'f', i];
  }
  usados.add(metodo);
}

/* dónde aparece cada estadístico (todos los análisis, también los del motor R) */
const INV = join(RAIZ, 'tests', 'generado', 'inventario.json');
const donde = {};
if (existsSync(INV)) {
  const inv = JSON.parse(leer(INV)).estadisticos || {};
  for (const f of SP.guias.fichas()) if (inv[f.id]) donde[f.id] = [...inv[f.id]].filter(m => SP.metodos[m]).sort((a, b) => familia(a) - familia(b) || (SP.metodos[a].orden || 0) - (SP.metodos[b].orden || 0) || a.localeCompare(b));
} else fallas.push('falta tests/generado/inventario.json (node tools/inventario/inventario.mjs)');

/* el archivo */
const pedidos = {};
for (const id of orden) if (usados.has(id)) pedidos[id] = [ejemplos[id].conjunto, ejemplos[id].entradas || {}, ejemplos[id].opciones || {}];
const bloque = (nombre, o) => '"' + nombre + '": {\n' + Object.keys(o).map(k => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(o[k])).join(',\n') + '\n }';
const fichasOrden = o => Object.fromEntries(SP.guias.fichas().map(f => f.id).filter(k => o[k]).map(k => [k, o[k]]));
const texto = '/* Generado por node tools/glosario/glosario.mjs con los ejemplos de Fundamentos y el inventario de estadísticos — no se edita a mano. */\n' +
  'self.SP_GLOSARIO = {\n ' + bloque('pedidos', pedidos) + ',\n ' + bloque('ver', fichasOrden(ver)) + ',\n ' +
  bloque('conceptos', conceptos) + ',\n ' + bloque('donde', fichasOrden(donde)) + '\n};\n';

const sinLugar = SP.guias.fichas().filter(f => !ver[f.id]).map(f => f.id);
if (fallas.length) { console.error('FALLAS:\n  ' + fallas.join('\n  ')); process.exit(1); }
if (comprobar) {
  const actual = existsSync(SALIDA) ? leer(SALIDA) : '';
  if (actual.replace(/\r\n/g, '\n') !== texto) { console.error('js/generado/glosario.js no está al día: corre node tools/glosario/glosario.mjs'); process.exit(1); }
  console.log('js/generado/glosario.js al día');
} else {
  writeFileSync(SALIDA, texto);
  console.log('js/generado/glosario.js: ' + Object.keys(pedidos).length + ' ejemplos, ' + Object.keys(ver).length + ' estadísticos con lugar, ' +
    Object.keys(conceptos).length + ' conceptos; ' + Math.round(texto.length / 1024) + ' KB');
}
console.log('estadísticos sin lugar para verlos en acción (' + sinLugar.length + '): ' + sinLugar.join(', '));

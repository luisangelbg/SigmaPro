// SigmaPro — inventario de los estadísticos que muestra cada análisis (Fase 5, Hito 5.0).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tools/inventario/inventario.mjs [--sin-escribir]
//
// 1. Carga el núcleo como la app (los scripts de js/nucleo, js/metodos y js/exportar de index.html).
// 2. Corre cada caso de tests/casos cuyo objetivo es un método del núcleo JS, arma su reporte y anota, por análisis:
//    los cuadros (id, título), sus columnas (clave, título, formato), las medidas con nombre en las filas (columnas
//    medida, prueba, estadistico, criterio, indice…) y los semáforos de supuestos. Los métodos del motor R no corren en
//    node: sus columnas se leen del código (col('clave', T('Título'), 'formato')).
// 3. Relaciona cada columna y cada medida con su ficha del registro de estadísticos (SP.guias, js/nucleo/guias.js).
// 4. Escribe tests/generado/inventario.json (lo usan las pruebas) y docs/inventario-estadisticos.md (para leer).
// No se edita a mano: se vuelve a generar.

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TESTS = join(RAIZ, 'tests');
const escribir = !process.argv.includes('--sin-escribir');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');

/* ---------------- el núcleo ---------------- */
const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
function nucleo(ingles) {
  const c = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true, CompressionStream, DecompressionStream, Blob, Response });
  if (ingles) { const k = vm.createContext({}); k.self = k; vm.runInContext(leer(join(RAIZ, 'js', 'i18n', 'en.js')), k); c.SP_CATALOGO = k.SP_CATALOGO; }
  for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), c, { filename: s });
  return c.SP;
}
const SP = nucleo(false), EN = nucleo(true);

/* ---------------- los casos ---------------- */
const casos = [];
(function rec(d) { for (const f of readdirSync(d).sort()) { const p = join(d, f); if (statSync(p).isDirectory()) rec(p); else if (p.endsWith('.json')) casos.push(JSON.parse(leer(p))); } })(join(TESTS, 'casos'));

/* columnas cuyas celdas nombran una medida o una prueba (no un tratamiento ni un término del modelo) */
const COL_MEDIDA = new Set(['medida', 'prueba', 'estadistico', 'criterio', 'indice', 'parametro', 'metodo', 'cantidad']);
const porMetodo = new Map();
const nuevo = (f, fuente) => ({ id: f.id, nombre: f.nombre, familia: f.familia, motor: f.motor || 'js', fuente, casos: 0, cuadros: new Map(), medidas: new Map(), semaforos: new Map(), errores: [] });
const sinNumeros = s => String(s).replace(/«[^»]*»/g, '«…»').replace(/\{\w+\}/g, '#').replace(/-?\d+(?:[.,]\d+)?/g, '#').replace(/\s+/g, ' ').trim();
/* una columna que lleva el nombre de un dato (un nivel, un ambiente, una variable de la tabla) no es un estadístico */
const PATRON_DATO = /^(media de |[EA]\d+$|x\d+ \(codificado\)$)/;
const fichaId = (G, clave, titulo) => { const f = G.buscar(clave, titulo); return f ? f.id : null; };
const distintosIdioma = [];

for (const c of casos) {
  if (!c.objetivo || c.objetivo.tipo !== 'metodo') continue;
  const f = SP.metodos[c.objetivo.nombre];
  if (!f || f.motor === 'r') continue;
  if (!porMetodo.has(f.id)) porMetodo.set(f.id, nuevo(f, 'casos'));
  const m = porMetodo.get(f.id);
  try {
    const armar = S => {
      const d = c.datos || { columnas: {} };
      const tabla = Object.keys(d.columnas || {}).length ? S.tabla.crear(d.columnas, d.tipos) : null;
      const op = S.opcionesCon(S.metodos[f.id], c.opciones || {});
      const o = S.ejecutar(f.id, tabla, c.entradas || {}, op);
      return S.metodos[f.id].reporte ? S.metodos[f.id].reporte(o.resultado) : null;
    };
    const rep = armar(SP), repEN = armar(EN);
    m.casos++;
    if (!rep) continue;
    const d = c.datos || { columnas: {} };
    const datos = new Set(Object.keys(d.columnas || {}));
    for (const v of Object.values(d.columnas || {})) for (const x of v) if (typeof x === 'string') datos.add(x);
    (rep.cuadros || []).forEach((q, iq) => {
      const qEN = (repEN.cuadros || [])[iq] || { columnas: [], filas: [] };
      const k = q.id || sinNumeros(q.titulo);
      if (!m.cuadros.has(k)) m.cuadros.set(k, { id: k, titulo: sinNumeros(q.titulo || ''), columnas: new Map() });
      const cu = m.cuadros.get(k);
      (q.columnas || []).forEach((col, ic) => {
        const ck = col.clave + '|' + sinNumeros(col.titulo);
        const dato = datos.has(String(col.titulo).trim()) || PATRON_DATO.test(String(col.titulo));
        if (!cu.columnas.has(ck)) cu.columnas.set(ck, { clave: col.clave, titulo: sinNumeros(col.titulo), formato: col.formato || '', dato, ficha: col.formato !== 'texto' ? fichaId(SP.guias, col.clave, col.titulo) : null });
        else if (!dato) cu.columnas.get(ck).dato = false;
        /* el registro reconoce lo mismo con la interfaz en inglés */
        const cEN = qEN.columnas[ic];
        if (cEN && col.formato !== 'texto' && fichaId(SP.guias, col.clave, col.titulo) !== fichaId(EN.guias, cEN.clave, cEN.titulo))
          distintosIdioma.push(f.id + ' · ' + col.titulo + ' / ' + cEN.titulo + ': ' + fichaId(SP.guias, col.clave, col.titulo) + ' ≠ ' + fichaId(EN.guias, cEN.clave, cEN.titulo));
        if (COL_MEDIDA.has(col.clave)) (q.filas || []).forEach((fila, iff) => {
          const v = fila[col.clave];
          if (typeof v !== 'string' || !v.trim()) return;
          const n = sinNumeros(v);
          if (!m.medidas.has(n)) m.medidas.set(n, { veces: 0, ficha: fichaId(SP.guias, null, v) });
          m.medidas.get(n).veces++;
          const vEN = cEN && qEN.filas[iff] ? qEN.filas[iff][cEN.clave] : null;
          if (typeof vEN === 'string' && fichaId(SP.guias, null, v) !== fichaId(EN.guias, null, vEN))
            distintosIdioma.push(f.id + ' · ' + v + ' / ' + vEN + ': ' + fichaId(SP.guias, null, v) + ' ≠ ' + fichaId(EN.guias, null, vEN));
        });
      });
    });
    for (const s of rep.semaforo || []) { const sk = s.clave || sinNumeros(s.nombre); if (!m.semaforos.has(sk)) m.semaforos.set(sk, sinNumeros(s.nombre || '')); }
  } catch (e) { m.errores.push(c.id + ': ' + e.message); }
}

/* los métodos del motor R: columnas leídas del código de su archivo */
{
  const dir = join(RAIZ, 'js', 'metodos');
  const textos = Object.fromEntries(readdirSync(dir).filter(x => x.endsWith('.js')).map(x => [x, leer(join(dir, x))]));
  const reCol = /col\(\s*'([^']+)'\s*,\s*(?:T\(\s*'((?:\\'|[^'])*)'[^)]*\)|'((?:\\'|[^'])*)')\s*(?:,\s*'([^']*)')?/g;
  for (const f of Object.values(SP.metodos)) {
    if (f.motor !== 'r' || porMetodo.has(f.id)) continue;
    const archivo = Object.keys(textos).find(x => new RegExp("id: *'" + f.id + "'").test(textos[x])) ||
      Object.keys(textos).find(x => /mixto/.test(f.id) && x === 'mixtos.js');
    const m = nuevo(f, archivo ? 'código (js/metodos/' + archivo + ')' : 'sin archivo');
    porMetodo.set(f.id, m);
    if (!archivo) continue;
    const cu = { id: 'código', titulo: T('columnas que aparecen en el código del archivo'), columnas: new Map() };
    for (const r of textos[archivo].matchAll(reCol)) {
      const titulo = (r[2] || r[3] || '').replace(/\\'/g, "'");
      const ck = r[1] + '|' + titulo;
      if (!cu.columnas.has(ck)) cu.columnas.set(ck, { clave: r[1], titulo: sinNumeros(titulo), formato: r[4] || '', dato: false,
        ficha: r[4] !== 'texto' ? fichaId(SP.guias, r[1], titulo.replace(/\{\w+\}/g, '95')) : null });
    }
    m.cuadros.set(cu.id, cu);
  }
  function T(s) { return s; }
}
/* los que no tienen casos ni son del motor R (no debería haber) */
for (const f of Object.values(SP.metodos)) if (!porMetodo.has(f.id)) { const m = nuevo(f, 'sin casos'); porMetodo.set(f.id, m); }

/* ---------------- relación con el registro ---------------- */
const G = SP.guias;
const familias = Object.fromEntries(SP.familias.map(f => [f.id, f.nombre]));
const metodos = [...porMetodo.values()].sort((a, b) => SP.familias.findIndex(f => f.id === a.familia) - SP.familias.findIndex(f => f.id === b.familia) || a.nombre.localeCompare(b.nombre, 'es'));
const salida = { generado: 'node tools/inventario/inventario.mjs', version: SP.VERSION, metodos: [], estadisticos: {}, sinFicha: {}, idioma: distintosIdioma };
const usar = (id, metodo) => (salida.estadisticos[id] = salida.estadisticos[id] || new Set()).add(metodo);
for (const m of metodos) {
  const mm = { id: m.id, nombre: m.nombre, familia: m.familia, motor: m.motor, fuente: m.fuente, casos: m.casos, errores: m.errores, cuadros: [], medidas: [], semaforos: [] };
  for (const cu of m.cuadros.values()) {
    const cols = [...cu.columnas.values()];
    for (const c of cols) {
      if (c.ficha) usar(c.ficha, m.id);
      else if (c.formato !== 'texto' && !c.dato) { const k = c.clave + ' · ' + c.titulo; (salida.sinFicha[k] = salida.sinFicha[k] || new Set()).add(m.id); }
    }
    mm.cuadros.push({ id: cu.id, titulo: cu.titulo, columnas: cols });
  }
  for (const [n, x] of m.medidas) {
    if (x.ficha) usar(x.ficha, m.id);
    mm.medidas.push({ nombre: n, veces: x.veces, ficha: x.ficha });
  }
  for (const [k, n] of m.semaforos) mm.semaforos.push({ clave: k, nombre: n });
  salida.metodos.push(mm);
}
for (const k of Object.keys(salida.estadisticos)) salida.estadisticos[k] = [...salida.estadisticos[k]];
for (const k of Object.keys(salida.sinFicha)) salida.sinFicha[k] = [...salida.sinFicha[k]];

/* ---------------- resumen ---------------- */
const todas = salida.metodos.flatMap(m => m.cuadros.flatMap(c => c.columnas));
const nCols = todas.length;
const nDatos = todas.filter(x => x.formato !== 'texto' && x.dato && !x.ficha).length;
const nEst = todas.filter(x => x.formato !== 'texto').length - nDatos;
const nCon = todas.filter(x => x.ficha).length;
const errores = salida.metodos.flatMap(m => m.errores);
salida.resumen = { metodos: salida.metodos.length, columnas: nCols, numericas: nEst, deDatos: nDatos, conFicha: nCon, fichas: G.fichas().length, fichasUsadas: Object.keys(salida.estadisticos).length, sinFicha: Object.keys(salida.sinFicha).length, errores: errores.length, idioma: distintosIdioma.length };

/* ---------------- documento ---------------- */
const md = [];
const pct = (a, b) => (b ? Math.round(100 * a / b) + ' %' : '—');
md.push('# Inventario de estadísticos de SigmaPro', '',
  '> Generado por `node tools/inventario/inventario.mjs` con la versión ' + SP.VERSION + '. No se edita a mano.', '',
  'Qué muestra cada análisis: sus cuadros con las columnas (clave interna, título y formato), las medidas que aparecen',
  'nombradas en las filas y los semáforos de supuestos. Cada columna numérica se relaciona con su ficha del registro de',
  'estadísticos (`js/nucleo/guias.js`), de donde salen los medidores, la interpretación y el glosario. Las columnas que',
  'llevan el nombre de un dato (un nivel, un ambiente, una variable) no son estadísticos y se cuentan aparte. Los análisis',
  'del motor R no corren en node: sus columnas se leen del código. Cada caso se arma también con la interfaz en inglés',
  'y el registro debe reconocer los mismos estadísticos.', '',
  '## Resumen', '',
  '| Concepto | Cantidad |', '|---|---:|',
  '| Análisis | ' + salida.resumen.metodos + ' |',
  '| Columnas en sus cuadros (sin repetir por análisis) | ' + nCols + ' |',
  '| Columnas numéricas con nombre de un dato | ' + nDatos + ' |',
  '| Columnas de estadísticos | ' + nEst + ' |',
  '| Columnas de estadísticos con ficha en el registro | ' + nCon + ' (' + pct(nCon, nEst) + ') |',
  '| Fichas del registro | ' + salida.resumen.fichas + ' (' + salida.resumen.fichasUsadas + ' en uso) |',
  '| Columnas distintas sin ficha | ' + salida.resumen.sinFicha + ' |',
  '| Diferencias entre español e inglés | ' + distintosIdioma.length + ' |', '');
if (errores.length) md.push('**Casos que no se pudieron armar:** ' + errores.length, '', ...errores.slice(0, 20).map(e => '- ' + e), '');
if (distintosIdioma.length) md.push('**El registro reconoce otra cosa en inglés:**', '', ...distintosIdioma.slice(0, 30).map(e => '- ' + e), '');
const grupos = Object.fromEntries(G.GRUPOS);
md.push('## Estadísticos del registro y dónde aparecen', '');
let gr = '';
for (const f of G.fichas()) {
  if (f.grupo !== gr) { gr = f.grupo; md.push('', '### ' + grupos[gr], '', '| Ficha | Estadístico | Análisis |', '|---|---|---|'); }
  md.push('| `' + f.id + '` | ' + f.nombre + ' (' + f.simbolo + ') | ' + ((salida.estadisticos[f.id] || []).join(', ') || '—') + ' |');
}
md.push('', '## Columnas sin ficha', '', 'Por clave y título (los números del título, como #). Las siguen los hitos 5.1 y 5.2.', '', '| Columna | Análisis |', '|---|---|');
for (const [k, v] of Object.entries(salida.sinFicha).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'es'))) md.push('| ' + k.replace(/\|/g, '\\|') + ' | ' + v.join(', ') + ' |');
md.push('', '## Por análisis', '');
let fam = '';
for (const m of salida.metodos) {
  if (m.familia !== fam) { fam = m.familia; md.push('### ' + (familias[fam] || fam), ''); }
  md.push('#### ' + m.nombre + ' (`' + m.id + '`' + (m.motor === 'r' ? ', motor R' : '') + ')', '',
    (m.casos ? m.casos + ' casos de validación armados.' : 'Fuente: ' + m.fuente + '.'), '');
  for (const cu of m.cuadros) {
    md.push('- **' + (cu.titulo || cu.id).replace(/\|/g, '\\|') + '** (`' + cu.id + '`): ' +
      cu.columnas.map(c => c.titulo.replace(/\|/g, '\\|') + (c.formato && c.formato !== 'texto' ? ' [' + (c.ficha ? '→ ' + c.ficha : c.dato ? 'dato' : c.formato) + ']' : '')).join(' · '));
  }
  if (m.medidas.length) md.push('- Medidas en las filas: ' + m.medidas.map(x => x.nombre + (x.ficha ? ' [→ ' + x.ficha + ']' : '')).join(' · '));
  if (m.semaforos.length) md.push('- Semáforo: ' + m.semaforos.map(x => x.nombre).join(' · '));
  md.push('');
}

if (escribir) {
  mkdirSync(join(TESTS, 'generado'), { recursive: true });
  writeFileSync(join(TESTS, 'generado', 'inventario.json'), JSON.stringify(salida, null, 1) + '\n');
  writeFileSync(join(RAIZ, 'docs', 'inventario-estadisticos.md'), md.join('\n'));
}
console.log('Inventario: ' + salida.resumen.metodos + ' análisis, ' + nEst + ' columnas de estadísticos (' + nCon + ' con ficha, ' + pct(nCon, nEst) + '), ' + nDatos + ' de datos, ' +
  salida.resumen.fichas + ' fichas, ' + salida.resumen.sinFicha + ' columnas distintas sin ficha' + (errores.length ? ', ' + errores.length + ' casos con error' : '') +
  (distintosIdioma.length ? ', ' + distintosIdioma.length + ' diferencias entre idiomas' : ''));
for (const e of errores.concat(distintosIdioma).slice(0, 15)) console.log('  ✗ ' + e);
process.exitCode = errores.length || distintosIdioma.length ? 1 : 0;

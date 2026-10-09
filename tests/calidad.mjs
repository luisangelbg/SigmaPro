// SigmaPro — calidad de lo que se lee (hito 5.9): las escalas en sus bordes y la coherencia entre textos y números.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/calidad.mjs
//
// 1. Cada escala del registro (SP.guias), en cada contexto que la cambia (el α, la guía del CV de cada cultivo), en cada
//    uno de sus bordes: un poco antes cae en su zona, en el límite según la escala lo incluya o no (y el valor negativo
//    o la razón inversa, en las que leen el valor absoluto o la razón mayor que 1), y un poco después en la siguiente.
//    En cada zona, la tarjeta de interpretación cita el valor como el medidor y nombra su zona.
// 2. Coherencia texto-número en todos los casos del núcleo JS (tests/casos): cada número de las conclusiones, de «En
//    pocas palabras» y de los párrafos de métodos y resultados está en el resultado o en sus cuadros (al redondeo con que
//    se escribe), o sale de ellos con una cuenta que el texto dice: cuántas filas o niveles, sumas acumuladas de una
//    columna (los porcentajes de los ejes), cuántos valores pasan un umbral, sumas de la asignación redondeada hacia
//    arriba, un cuadrado, un porcentaje como veces (108.1 % = 1.08 veces) o un cambio en porcentaje; en este último, la
//    palabra que lo acompaña («mayor», «encima» / «menor», «debajo») dice la dirección correcta. Quedan fuera el umbral
//    de «p < 0.001» y los años de las citas.
// 3. Las tarjetas con los valores reales de esos casos: cada valor de un cuadro con escala tiene su tarjeta, que lo
//    cita y nombra su zona.
// Control de la prueba: los números de dos o más decimales de los textos, alterados un 7 % y un 37 %, ya no deben
// encontrarse. Un 7 % puede caer en el valor de otro nivel del mismo cuadro (medias parecidas), así que se tolera hasta
// un 10 % de aceptados; más, la comparación sería demasiado permisiva para detectar un número equivocado.
// Sale con código 1 si algo falla.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');
const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true, CompressionStream, DecompressionStream, Blob, Response });
for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), ctx, { filename: s });
const SP = ctx.SP, G = SP.guias;
const fallas = [], notas = [];

/* ---------------- 1. las escalas en sus bordes ---------------- */
/* las tarjetas que dicen la zona con otras palabras (p ≥ α, κ < 0, ΔAIC = 0, η²H ≤ 0, DW cerca de 2) o con sus cuentas
   (la R² y la eficiencia) */
const sustituye = (id, v, e) => ({ p: v >= (e.alfa || 0.05), 'p-ajustado': v >= (e.alfa || 0.05), kappa: v < 0, 'delta-aic': v === 0, 'eta2-h': v <= 0,
  'r2-ajustada': true, r2: true, 'durbin-watson': v >= 1.5 && v <= 2.5, eficiencia: true })[id];
function tarjeta(id, v, cx, donde) {
  const t = G.interpretar(id, [{ valor: v, etiqueta: '' }], cx).join(' ');
  if (!(t.length > 20) || /undefined|NaN|\{\w+\}/.test(t)) { fallas.push(donde + ': tarjeta vacía o con huecos: «' + t + '»'); return false; }
  const fv = G.formatoDe(id), z = G.zona(id, v, cx);
  const cita = [fv(v), fv(Math.abs(v)), v < 0.001 ? '< 0.001' : '= ' + v.toFixed(3)].some(x => t.indexOf(x) >= 0);
  if (!cita) { fallas.push(donde + ': la tarjeta no cita ' + fv(v) + ': «' + t + '»'); return false; }
  if (!sustituye(id, v, Object.assign({ alfa: cx.alfa }, z.escala)) && t.indexOf(z.etiqueta) < 0) { fallas.push(donde + ': la tarjeta no nombra su zona «' + z.etiqueta + '»: «' + t + '»'); return false; }
  return true;
}
const contextos = id => {
  const base = { alfa: 0.05, n: 30, gl: 2, titulo: id === 'eficiencia' ? 'Eficiencia relativa frente a completamente al azar, %' : '' };
  if (id === 'p' || id === 'p-ajustado') return [base, Object.assign({}, base, { alfa: 0.01 }), Object.assign({}, base, { alfa: 0.1 })];
  if (id === 'cv') return [base].concat(G.guiasCV().map(g => Object.assign({}, base, { guiaCV: g })));
  return [base];
};
let nEscalas = 0, nBordes = 0, nZonas = 0;
for (const f of G.fichas()) {
  for (const cx of contextos(f.id)) {
    const e = G.escala(f.id, cx);
    if (!e) continue;
    nEscalas++;
    const donde = f.id + (cx.guiaCV ? ' (' + cx.guiaCV.id + ')' : cx.alfa !== 0.05 ? ' (α = ' + cx.alfa + ')' : '');
    const zi = v => { const z = G.zona(f.id, v, cx); return z ? z.indice : null; };
    /* el valor y sus equivalentes: el negativo, en las que leen el valor absoluto; la inversa, en las razones */
    const formas = v => (e.eje === 'abs' ? [v, -v] : e.eje === 'logabs' ? [v, 1 / v] : [v]);
    if (e.zonas.some(q => !q.etiqueta)) fallas.push(donde + ': una zona sin etiqueta');
    for (let i = 0; i < e.zonas.length - 1; i++) {
      const q = e.zonas[i], b = q.hasta, d = Math.max(Math.abs(b) * 1e-6, 1e-9);
      if (!(b > e.min - 1e-12) || b === e.zonas[i + 1].hasta) continue;
      nBordes++;
      const enLimite = e.inclusivo && !q.estricta ? i : i + 1;
      for (const [v, esperado, que] of [[b - d, i, 'antes'], [b, enLimite, 'en el límite'], [b + d, i + 1, 'después']]) {
        if (e.eje === 'logabs' && !(v > 0)) continue;
        /* la inversa justo en el límite queda de un lado o del otro por el redondeo de la máquina: no se prueba */
        for (const w of que === 'en el límite' && e.eje === 'logabs' ? [v] : formas(v)) {
          const z = zi(w);
          if (z !== esperado) fallas.push(donde + ': ' + w + ' (' + que + ' de ' + b + ') cae en la zona ' + z + ', no en la ' + esperado + ' («' + e.zonas[esperado].etiqueta + '»)');
        }
      }
    }
    /* en cada zona, un valor de en medio: la tarjeta lo cita y nombra su zona */
    let ini = e.min;
    for (let i = 0; i < e.zonas.length; i++) {
      const fin = e.zonas[i].hasta;
      let v = e.eje === 'log' || e.eje === 'logabs' ? Math.sqrt(Math.max(ini, 1e-6) * fin) : (ini + fin) / 2;
      if (i === e.zonas.length - 1 && e.abierto && !(fin > ini)) v = ini * 1.5 + 1;
      v = +v.toPrecision(3);
      if (G.zona(f.id, v, cx).indice === i) { nZonas++; tarjeta(f.id, v, cx, donde + ' zona «' + e.zonas[i].etiqueta + '»'); }
      ini = fin;
    }
  }
}
notas.push(nEscalas + ' escalas (con sus contextos), ' + nBordes + ' bordes probados antes, en y después del límite, ' + nZonas + ' tarjetas, una por zona');

/* ---------------- 2 y 3. todos los casos del núcleo JS ---------------- */
const casos = [];
(function rec(d) { for (const f of readdirSync(d).sort()) { const p = join(d, f); if (statSync(p).isDirectory()) rec(p); else if (p.endsWith('.json')) casos.push(JSON.parse(leer(p))); } })(join(TESTS, 'casos'));

/* los números de un resultado; las series largas (residuos, ajustados, datos) no: un texto no cita uno de ellos, y con
   miles de valores cualquier número coincidiría con alguno */
const LARGA = 200;
function numeros(x, out = [], prof = 0) {
  if (prof > 8) return out;
  if (typeof x === 'number') { if (Number.isFinite(x)) out.push(x); }
  else if (typeof x === 'string') { for (const m of x.matchAll(/-?\d+(?:\.\d+)?/g)) out.push(+m[0]); }
  else if (ArrayBuffer.isView(x)) { if (x.length <= LARGA) for (const v of x) { if (Number.isFinite(v)) out.push(v); } }
  else if (Array.isArray(x)) { if (x.length <= LARGA || typeof x[0] === 'object') { let k = 0; for (const v of x) { numeros(v, out, prof + 1); if (++k > 5000) break; } } }
  else if (x && typeof x === 'object') for (const k of Object.keys(x)) if (typeof x[k] !== 'function') numeros(x[k], out, prof + 1);
  return out;
}
/* los números de un texto, con sus decimales y lo que los rodea */
function enTexto(t) {
  const out = [];
  const s = String(t).replace(/−/g, '-').replace(/(\d),(\d{3})\b/g, '$1$2');
  for (const m of s.matchAll(/(?<![\w.])-?\d+(?:\.(\d+))?(?:e-?\d+)?(?![\w])/g)) {
    const txt = m[0];
    out.push({ txt, v: +txt, dec: m[1] ? m[1].length : 0, antes: s.slice(Math.max(0, m.index - 14), m.index), despues: s.slice(m.index + txt.length, m.index + txt.length + 30) });
  }
  return out;
}
const SUELTOS = [0, 1, 2, 3, 100, 95, 90, 99, 80];
const tolDe = n => (n.dec ? 0.5 * Math.pow(10, -n.dec) + 1e-9 : 0.5 + 1e-9);
/* el número del texto es el valor (o su valor absoluto) al redondeo con que se escribe; seguido de «%», también la
   proporción por 100 */
const cerca = (n, v) => Math.abs(v - n.v) <= tolDe(n) || Math.abs(Math.abs(v) - n.v) <= tolDe(n) || (/^\s?%|^\s?(a|–|-|y)\s?-?[\d.]+\s?%/.test(n.despues) && Math.abs(100 * v - n.v) <= tolDe(n));
let revisados = 0, derivados = 0, nCasos = 0, nTarjetas = 0, alterados = 0;
const hallados = { 1.07: 0, 1.37: 0 };
for (const c of casos) {
  if (!c.objetivo || c.objetivo.tipo !== 'metodo') continue;
  const f = SP.metodos[c.objetivo.nombre];
  if (!f || f.motor === 'r') continue;
  let o, rep, op;
  try {
    const d = c.datos || { columnas: {} };
    const tabla = Object.keys(d.columnas || {}).length ? SP.tabla.crear(d.columnas, d.tipos) : null;
    op = SP.opcionesCon(f, c.opciones || {});
    o = SP.ejecutar(f.id, tabla, c.entradas || {}, op);
    rep = f.reporte(o.resultado);
  } catch (e) { continue; }   /* los casos que esperan un error ya los revisa tests/correr.mjs */
  nCasos++;
  const r = o.resultado;
  const base = numeros(r).concat(numeros(rep.cuadros), numeros(op), numeros(c.entradas || {}));
  /* las cuentas que dicen los textos, con lo que significan */
  const cuentas = [];
  for (const q of rep.cuadros || []) {
    const filas = (q.filas || []).filter(x => !x._total);
    cuentas.push(['filas', filas.length], ['filas', (q.filas || []).length]);
    for (const col of q.columnas || []) {
      const vs = filas.map(x => x[col.clave]).filter(v => typeof v === 'number' && Number.isFinite(v));
      if (!vs.length) continue;
      let acum = 0, arriba = 0;
      vs.forEach(v => { acum += v; arriba += Math.ceil(v); cuentas.push(['suma acumulada', acum], ['suma redondeada hacia arriba', arriba]); });
      for (const u of [0.05, 0.01, 0.1]) cuentas.push(['valores < ' + u, vs.filter(v => v < u).length]);
      cuentas.push(['valores', vs.length], ['valores distintos', new Set(vs).size]);
    }
  }
  const cambios = [];
  for (const v of numeros(r).concat(numeros(rep.cuadros)).slice(0, 6000)) {
    cuentas.push(['cuadrado', v * v], ['veces', v / 100]);
    if (v > 0) cambios.push(v);
  }
  const textos = [];
  (rep.conclusiones || []).forEach(t => textos.push(['conclusión', t]));
  try { SP.claro.frases(f.id, r, rep).forEach(t => textos.push(['En pocas palabras', t])); } catch (e) { /* sin frases */ }
  try { const p = SP.informe.parrafo(f.id, r, rep, c.entradas || {}, op); textos.push(['métodos', p.metodos], ['resultados', p.resultados]); } catch (e) { /* sin párrafo */ }
  for (const [donde, t] of textos) {
    for (const n of enTexto(t || '')) {
      revisados++;
      if (SUELTOS.includes(n.v) && !n.dec) continue;
      if (/[<>≤≥]\s*$/.test(n.antes) && [0.001, 0.0001, 0.05, 0.01].includes(n.v)) continue;
      if (!n.dec && n.v >= 1880 && n.v <= 2100 && /(, |\(|y )$/.test(n.antes) && /^[a-z]?([;),]| y| \()/.test(n.despues)) continue;
      if (base.some(v => cerca(n, v))) {
        /* control: el mismo número alterado un 7 % ya no debe estar */
        if (n.dec >= 2 && Math.abs(n.v) >= 0.1 && alterados < 3000) {
          alterados++;
          for (const k of [1.07, 1.37]) { const m = Object.assign({}, n, { v: +(n.v * k).toFixed(n.dec) }); if (base.some(v => cerca(m, v))) hallados[k]++; }
        }
        continue;
      }
      const k = cuentas.find(([, v]) => Math.abs(v - n.v) <= tolDe(n));
      if (k) { derivados++; continue; }
      /* un cambio en porcentaje: (v − 1) × 100 con «mayor/encima» o (1 − v) × 100 con «menor/debajo» */
      const dir = /^\s*%?\s*(m[aá]s|mayor|por encima|encima|arriba)/.test(n.despues) ? 1 : /^\s*%?\s*(menos|menor|por debajo|debajo|abajo)/.test(n.despues) ? -1 : 0;
      const ok = cambios.find(v => Math.abs(Math.abs(v - 1) * 100 - n.v) <= tolDe(n));
      if (ok !== undefined) {
        if (dir && Math.sign(ok - 1) !== dir) fallas.push(c.id + ' [' + donde + ']: dice «' + n.txt + n.despues.slice(0, 18) + '» pero el valor es ' + ok + ' (' + (ok > 1 ? 'mayor' : 'menor') + ' que 1)');
        derivados++;
        continue;
      }
      fallas.push(c.id + ' [' + donde + ']: el ' + n.txt + ' de «…' + n.antes + n.txt + n.despues.slice(0, 12) + '…» no está en el resultado ni sale de él');
    }
  }
  /* 3. las tarjetas con los valores de sus cuadros */
  const alfa = (op && op.alfa) || (r && r.alfa) || 0.05;
  for (const q of rep.cuadros || []) {
    const cols = SP.formatos.columnas(q, null), etq = cols.find(k => k.formato === 'texto');
    const filas = (q.filas || []).filter(x => !x._total);
    const prueba = (id, v, titulo, dondeV) => {
      const cx = { alfa, n: r && r.n, titulo };
      if (!G.escala(id, cx) || typeof v !== 'number' || !Number.isFinite(v)) return;
      nTarjetas++;
      tarjeta(id, v, cx, c.id + ' · ' + q.titulo + ' · ' + dondeV);
    };
    for (const k of cols) {
      if (k.formato === 'texto' || String(k.formato).startsWith('intervalo')) continue;
      const g = G.buscar(k.clave, k.titulo);
      if (g) filas.slice(0, 40).forEach(x => prueba(g.id, x[k.clave], k.titulo, k.titulo));
    }
    if (etq) {
      const val = cols.find(k => k !== etq && k.formato !== 'texto' && !G.buscar(k.clave, k.titulo));
      if (val) filas.forEach(x => { const g = G.buscar(null, String(x[etq.clave] || '')); if (g) prueba(g.id, x[val.clave], String(x[etq.clave]), String(x[etq.clave])); });
    }
  }
}
notas.push(nCasos + ' casos del núcleo JS: ' + revisados.toLocaleString('es-MX') + ' números en sus textos, ' + derivados + ' de ellos calculados por el texto (con su dirección)');
notas.push(nTarjetas.toLocaleString('es-MX') + ' tarjetas con los valores reales de los cuadros');
const tasa = k => (alterados ? hallados[k] / alterados : 1);
notas.push('control: de ' + alterados.toLocaleString('es-MX') + ' números alterados, la comparación habría aceptado el ' + (100 * tasa(1.07)).toFixed(1) + ' % de los alterados un 7 % y el ' + (100 * tasa(1.37)).toFixed(1) + ' % de los alterados un 37 %');
if (!alterados || tasa(1.07) > 0.1 || tasa(1.37) > 0.1) fallas.push('la comparación de números es demasiado permisiva: acepta ' + (100 * Math.max(tasa(1.07), tasa(1.37))).toFixed(1) + ' % de los números alterados');

console.log('\nSigmaPro · calidad de lo que se lee');
for (const n of notas) console.log('  ' + n);
for (const f of fallas.slice(0, 60)) console.log('  ✗ ' + f);
if (fallas.length > 60) console.log('  … y ' + (fallas.length - 60) + ' más');
guardar('calidad', { titulo: 'Escalas en sus bordes y coherencia entre textos y números', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas.slice(0, 200) });
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
process.exit(fallas.length ? 1 : 0);

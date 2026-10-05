// SigmaPro — las fichas de Fundamentos (data/fundamentos/<id>.js) y su índice.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/fundamentos.mjs [id …]
//
// 1. Cobertura: cada análisis de SigmaPro (SP.metodos) tiene su ficha, y cada ficha corresponde a un análisis.
// 2. Estructura: los nueve apartados en español y en inglés (para qué sirve, preguntas, fundamento con modelo e
//    hipótesis, supuestos, datos necesarios, interpretación, limitaciones y relacionados, referencias; el noveno, la
//    suite, sale de data/suite-rules.js), con los mismos números de elementos en los dos idiomas.
// 3. Contra la app: familia, ids de métodos relacionados, de verificación y de alternativa, guías de SP.guias, el
//    conjunto de ejemplo y sus columnas; el ejemplo CORRE con el método (los del motor R se prueban en el navegador);
//    cada fórmula se convierte a MathML (SP.formulas).
// 4. Plantillas: la tabla de ejemplo da un CSV con el mismo número de columnas en cada renglón.
// 5. El índice data/fundamentos/indice.js corresponde a las fichas (node tools/fundamentos/indice.mjs lo regenera).
// 6. Sin instituciones, sin HTML ni Markdown en los textos.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(RAIZ, 'data', 'fundamentos');
const solo = process.argv.slice(2);
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');
const html = leer(join(RAIZ, 'index.html'));
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const c = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true });
for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), c, { filename: s });
const SP = c.SP;
const ce = vm.createContext({ window: {} }); vm.runInContext(leer(join(RAIZ, 'datos', 'ejemplos.js')), ce);
const EJ = Object.fromEntries(ce.window.SP_EJEMPLOS.map(e => [e.id, e]));

const RESP = ['continua', 'conteo', 'binaria', 'proporcion', 'categorica', 'tiempo-evento', 'serie', 'multivariada', 'ninguna'];
const ESTR = ['una-muestra', 'dos-grupos', 'k-grupos', 'factorial', 'bloques', 'parcelas', 'continua', 'aleatorios', 'ambientes', 'ninguna'];
const DIS = ['dca', 'dbca', 'latino', 'parcelas', 'latice', 'bib', 'medidas-repetidas', 'multiambiente', 'muestreo', 'superficie', 'ninguno'];
const palabras = a => a.join(' ').split(/\s+/).filter(Boolean).length;
const tex = (s, donde, p) => { try { SP.formulas.mathml(s); } catch (e) { p.push(donde + ': ' + e.message); } };

const fallas = [];
let total = 0, malas = 0, corridas = 0, formulas = 0;
const archivos = readdirSync(DIR).filter(f => f.endsWith('.js') && f !== 'indice.js');
/* 1. cobertura */
if (!solo.length) {
  const ids = new Set(archivos.map(f => f.replace(/\.js$/, '')));
  for (const id of Object.keys(SP.metodos)) if (!ids.has(id)) fallas.push('falta la ficha de ' + id);
  for (const id of ids) if (!SP.metodos[id]) fallas.push('ficha de un análisis que no existe: ' + id);
}
for (const f of archivos.filter(f => !solo.length || solo.includes(f.replace(/\.js$/, '')))) {
  total++;
  const p = [];
  const m = /^SP_FICHA\(([\s\S]*)\);?$/.exec(leer(join(DIR, f)).trim());
  let F = null;
  if (!m) p.push('no empieza con SP_FICHA( … );');
  else { try { F = JSON.parse(m[1]); } catch (e) { p.push('JSON no válido: ' + e.message); } }
  if (F) {
    const met = SP.metodos[F.id];
    if (!met) p.push('id desconocido: ' + F.id);
    if (F.id + '.js' !== f) p.push('el archivo no se llama como el id');
    if (met && met.familia !== F.familia) p.push('familia ' + F.familia + ' ≠ ' + met.familia);
    if (!RESP.includes(F.respuesta)) p.push('respuesta no válida: ' + F.respuesta);
    if (!ESTR.includes(F.estructura)) p.push('estructura no válida: ' + F.estructura);
    if (!Array.isArray(F.disenos) || F.disenos.some(d => !DIS.includes(d))) p.push('disenos no válidos: ' + JSON.stringify(F.disenos));
    for (const r of F.relacionados || []) if (!SP.metodos[r]) p.push('relacionado desconocido: ' + r);
    if (!(F.relacionados || []).length) p.push('sin relacionados');
    const fl = F.formato && F.formato.largo;
    if (F.ejemplo) {
      const ej = EJ[F.ejemplo.conjunto];
      if (!ej) p.push('conjunto de ejemplo desconocido: ' + F.ejemplo.conjunto);
      else {
        const cab = ej.csv.split('\n')[0].replace(/"/g, '').split(',');
        if (fl && fl[0].some(x => !cab.includes(x))) p.push('formato.largo: columnas que no están en ' + F.ejemplo.conjunto);
        const filasConjunto = ej.csv.trim().split('\n').length - 1, minimo = Math.min(5, filasConjunto) + 1;
        if (!fl || fl.length < minimo || fl.length > 9) p.push('formato.largo debe tener encabezado y 5–8 filas (o todas, si el conjunto tiene menos)');
        if (met && met.motor !== 'r') {
          try {
            const l = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
            const tabla = SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: ej.tipos }).aTabla();
            SP.ejecutar(F.id, tabla, F.ejemplo.entradas || {}, SP.opcionesCon(met, F.ejemplo.opciones || {}));
            corridas++;
          } catch (e) { p.push('el ejemplo no corre: ' + e.message); }
        }
      }
    } else if (met && !met.sinDatos && met.motor !== 'r') p.push('el método usa datos y la ficha no trae ejemplo');
    /* 4. la plantilla: renglones del mismo ancho */
    if (fl && fl.some(r => r.length !== fl[0].length)) p.push('la tabla de ejemplo tiene renglones de distinto ancho');
    for (const L of ['es', 'en']) {
      const x = F[L];
      if (!x) { p.push('falta ' + L); continue; }
      for (const k of ['alias', 'paraQue', 'preguntas', 'teoria', 'modelo', 'hipotesis', 'supuestos', 'datos', 'interpretacion', 'limitaciones', 'referencias']) if (x[k] == null) p.push(L + ': falta el apartado ' + k);
      if (x.preguntas && (x.preguntas.length < 2 || x.preguntas.length > 3)) p.push(L + ': 2–3 preguntas');
      if (x.teoria) { const n = palabras(x.teoria); if (n < 150 || n > 320) p.push(L + ': teoría de ' + n + ' palabras'); }
      if (x.modelo && (!x.modelo.tex || !Array.isArray(x.modelo.terminos))) p.push(L + ': modelo incompleto');
      if (x.modelo && x.modelo.tex) { tex(x.modelo.tex, L + ' modelo', p); formulas++; for (const t of x.modelo.terminos || []) { tex(t[0], L + ' término', p); formulas++; } }
      for (const h of x.hipotesis || []) { tex(h.h0 || '', L + ' H0', p); tex(h.h1 || '', L + ' H1', p); formulas += 2; }
      for (const s of x.supuestos || []) {
        if (s.verificar && !SP.metodos[s.verificar]) p.push(L + ': verificar desconocido: ' + s.verificar);
        if (s.alternativa && !SP.metodos[s.alternativa]) p.push(L + ': alternativa desconocida: ' + s.alternativa);
      }
      const d = x.datos || {};
      for (const k of ['columnas', 'minimo', 'balance', 'notaFormato', 'errores']) if (d[k] == null) p.push(L + ': datos.' + k);
      if (d.errores && (d.errores.length < 2 || d.errores.length > 6)) p.push(L + ': 2–6 errores frecuentes');
      const it = x.interpretacion || {};
      for (const g of it.guias || []) if (!SP.guias.ficha(g)) p.push(L + ': guía desconocida: ' + g);
      if (!it.orden || !it.ejemplo) p.push(L + ': interpretación incompleta');
      if (x.referencias && (x.referencias.length < 2 || x.referencias.length > 6)) p.push(L + ': 2–6 referencias');
      const todo = JSON.stringify(x);
      if (/universidad|chapingo|colegio de postgraduados|inifap|university(?! press)/i.test(todo)) p.push(L + ': menciona una institución');
      if (/<[a-z]+[ >]|\*\*|`/.test(todo)) p.push(L + ': HTML o Markdown en el texto');
    }
    if (F.es && F.en) for (const k of ['preguntas', 'supuestos', 'limitaciones', 'referencias']) if ((F.es[k] || []).length !== (F.en[k] || []).length) p.push('es/en con distinto número de ' + k);
  }
  if (p.length) { malas++; fallas.push(f + ': ' + p.join('; ')); }
}
/* 5. el índice */
if (!solo.length) {
  try { execFileSync(process.execPath, [join(RAIZ, 'tools', 'fundamentos', 'indice.mjs'), '--revisar'], { stdio: 'pipe' }); }
  catch (e) { fallas.push('data/fundamentos/indice.js no corresponde a las fichas: node tools/fundamentos/indice.mjs'); }
}
const resumen = (total - malas) + ' de ' + total + ' fichas sin problemas (' + Object.keys(SP.metodos).length + ' análisis); ' + corridas + ' ejemplos corridos en node; ' + formulas + ' fórmulas convertidas a MathML';
console.log('\nSigmaPro · Fundamentos\n  ' + resumen);
for (const f of fallas.slice(0, 40)) console.log('  ✗ ' + f);
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
if (!solo.length) guardar('fundamentos', { titulo: 'Fundamentos de cada análisis', ok: !fallas.length, resumen, renglones: fallas.slice(0, 40) });
process.exitCode = fallas.length ? 1 : 0;

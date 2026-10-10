// SigmaPro — los enlaces y los íconos de la app (hito 5.9). Los de la suite LABG los revisa tests/suite-enlaces.mjs.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/enlaces.mjs [--sin-red]
//
// Sin red:
//   · cada archivo que nombra index.html (hojas de estilo, guiones, también los de la carga en dos tiempos, íconos)
//     existe;
//   · cada ancla de la página (#main, #b1 … #b10, #expOpciones…) lleva a algo que existe: un id o un bloque;
//   · cada data-ir apunta a un bloque del 1 al 10; cada data-glosario, a un término del glosario; cada data-ficha, a
//     un análisis o a un estadístico del registro, y cada data-arbol-metodo, a un análisis (en index.html y en el código
//     de la interfaz);
//   · lo mismo en la página viva (Edge o Chrome sin ventana): con el ejemplo del maíz, un reporte, los bloques al
//     azar con su lectura abierta, la ficha de Fundamentos y el árbol, se recorren los diez bloques y se revisan los
//     enlaces que la interfaz arma al vuelo;
//   · los íconos del manifiesto existen, los PNG miden lo que declaran y el SVG se lee; el ícono de la pestaña (un SVG
//     en la propia página) también se lee.
// Con red (lo normal): cada dirección externa que la app muestra o usa (las licencias, R, el motor R, el repositorio
// para reportar un problema, el portal de la suite) responde. Como tests/suite-enlaces.mjs, sale a internet; la app no.

import { readFileSync, existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia, puertoLibre } from './lib/navegador.mjs';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const conRed = !process.argv.includes('--sin-red');
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');
const fallas = [], notas = [];
const html = leer(join(RAIZ, 'index.html'));

/* el núcleo, para el glosario y los análisis */
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => /^js\/(nucleo|metodos|exportar)\//.test(s));
const ctx = vm.createContext({ console, setTimeout, clearTimeout, performance, TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true, CompressionStream, DecompressionStream, Blob, Response });
for (const s of scripts) vm.runInContext(leer(join(RAIZ, s)), ctx, { filename: s });
const SP = ctx.SP;

/* 1. los archivos que nombra la página */
const locales = new Set();
for (const m of html.matchAll(/(?:src|href)="([^"#:?]+)"/g)) locales.add(decodeURIComponent(m[1]).replace(/^\.\//, ''));
let faltan = 0;
for (const r of locales) if (!existsSync(join(RAIZ, r))) { faltan++; fallas.push('index.html nombra «' + r + '», que no existe'); }
notas.push(locales.size + ' archivos que nombra index.html' + (faltan ? '' : ', todos presentes'));

/* 2. anclas, bloques, glosario, fichas y árbol */
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const codigoUI = readdirSync(join(RAIZ, 'js', 'interfaz')).filter(f => f.endsWith('.js')).map(f => leer(join(RAIZ, 'js', 'interfaz', f))).join('\n');
const todo = html + '\n' + codigoUI;
let anclas = 0;
for (const m of html.matchAll(/href="#([^"]*)"/g)) {
  anclas++;
  const a = m[1], b = /^b(\d+)$/.exec(a);
  if (b ? !(b[1] >= 1 && b[1] <= 10 && ids.has('panel-' + b[1])) : !ids.has(a)) fallas.push('el ancla #' + a + ' no lleva a nada');
}
let ir = 0;
for (const m of todo.matchAll(/data-ir="(\d+)"/g)) { ir++; if (!(m[1] >= 1 && m[1] <= 10 && ids.has('panel-' + m[1]))) fallas.push('data-ir="' + m[1] + '" no es un bloque'); }
const literales = (attr) => [...todo.matchAll(new RegExp(attr + '="([a-z0-9-]+)"', 'g'))].map(m => m[1]);
let gl = 0, fi = 0;
for (const t of new Set(literales('data-glosario'))) { gl++; if (!SP.glosario.termino(t)) fallas.push('data-glosario="' + t + '" no es un término del glosario'); }
/* data-ficha nombra un análisis (su ficha de Fundamentos) o, en la lectura de un cuadro, un estadístico del registro */
for (const id of new Set(literales('data-ficha'))) { fi++; if (!SP.metodos[id] && !SP.guias.ficha(id)) fallas.push('data-ficha="' + id + '" no es un análisis ni un estadístico del registro'); }
for (const id of new Set(literales('data-arbol-metodo'))) { fi++; if (!SP.metodos[id]) fallas.push('data-arbol-metodo="' + id + '" no es un análisis de SigmaPro'); }
notas.push(anclas + ' anclas de la página, ' + ir + ' data-ir, ' + gl + ' términos del glosario y ' + fi + ' fichas nombradas en la página y en la interfaz');

/* 2b. la página viva: los enlaces que la interfaz arma al vuelo */
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
const dormir = ms => new Promise(r => setTimeout(r, ms));
if (exe) {
  const puerto = await puertoLibre(), perfil = mkdtempSync(join(tmpdir(), 'sigmapro-enlaces-'));
  const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
  let ws, id = 0;
  const pend = new Map();
  const enviar = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const evaluar = async e => { const r = await enviar('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  try {
    let d; for (let k = 0; k < 75 && !d; k++) { await dormir(200); try { d = await paginaPropia(puerto); } catch { /* arranca */ } }
    ws = new WebSocket(d.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
    ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
    await enviar('Runtime.enable'); await enviar('Page.enable');
    await enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
    await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '?intro=no#b1' });
    for (let k = 0; k < 300; k++) { await dormir(50); try { if (await evaluar('document.documentElement.hasAttribute("data-sp-listo")')) break; } catch { /* cargando */ } }
    const vivo = await evaluar(`(async () => {
      const W = ms => new Promise(r => setTimeout(r, ms));
      const e = SP_EJEMPLOS.find(x => x.id === 'maiz'), l = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' });
      SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: e.tipos }), 'Ejemplo: ' + e.nombre);
      const R = SP.app.reporte; R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: {} });
      const vistos = { glosario: new Set(), ficha: new Set(), arbol: new Set(), ir: new Set(), anclas: new Set() };
      const juntar = () => {
        document.querySelectorAll('[data-glosario]').forEach(x => x.dataset.glosario && vistos.glosario.add(x.dataset.glosario));
        document.querySelectorAll('[data-ficha]').forEach(x => vistos.ficha.add(x.dataset.ficha));
        document.querySelectorAll('[data-arbol-metodo]').forEach(x => x.dataset.arbolMetodo && vistos.arbol.add(x.dataset.arbolMetodo));
        document.querySelectorAll('[data-ir]').forEach(x => vistos.ir.add(x.dataset.ir));
        document.querySelectorAll('a[href^="#"]').forEach(x => { const h = x.getAttribute('href').slice(1); if (h && !/^\\/|^b\\d+$/.test(h)) vistos.anclas.add(h); });
      };
      SP.app.ir(4); SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}); await W(600);
      document.querySelectorAll('#anaResultado details.lg-lectura').forEach(x => { x.open = true; }); await W(400); juntar();
      for (let b = 1; b <= 10; b++) { SP.app.ir(b); await W(400); juntar(); }
      SP.app.fundamentos.abrirMetodo && SP.app.fundamentos.abrirMetodo('dbca'); await W(800); juntar();
      if (SP.app.fundamentos.arbolEn) { SP.app.fundamentos.arbolEn(null); await W(500); juntar(); }
      const malos = [];
      vistos.glosario.forEach(t => { if (!SP.glosario.termino(t)) malos.push('data-glosario="' + t + '"'); });
      vistos.ficha.forEach(t => { if (!SP.metodos[t] && !SP.guias.ficha(t)) malos.push('data-ficha="' + t + '"'); });
      vistos.arbol.forEach(t => { if (!SP.metodos[t]) malos.push('data-arbol-metodo="' + t + '"'); });
      vistos.ir.forEach(t => { if (!document.getElementById('panel-' + t)) malos.push('data-ir="' + t + '"'); });
      vistos.anclas.forEach(t => { if (!document.getElementById(t)) malos.push('el ancla #' + t); });
      return { malos, n: Object.fromEntries(Object.entries(vistos).map(([k, v]) => [k, v.size])) };
    })()`);
    for (const m of vivo.malos) fallas.push('en la página: ' + m + ' no lleva a nada');
    notas.push('en la página viva: ' + vivo.n.glosario + ' términos del glosario, ' + vivo.n.ficha + ' fichas, ' + vivo.n.arbol + ' análisis del árbol, ' + vivo.n.ir + ' bloques y ' + vivo.n.anclas + ' anclas enlazados' + (vivo.malos.length ? '' : ', todos existen'));
  } finally {
    try { ws && ws.close(); } catch { /* nada */ }
    nav.kill();
    if (process.platform === 'win32') { const clave = perfil.split(/[\\/]/).pop(); try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ } }
    for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  }
} else notas.push('sin Edge ni Chrome: no se revisó la página viva');

/* 3. los íconos */
const manifiesto = JSON.parse(leer(join(RAIZ, 'manifest.webmanifest')));
let iconos = 0;
const pngTam = b => (b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null);
for (const ic of manifiesto.icons || []) {
  const p = join(RAIZ, ic.src);
  if (!existsSync(p)) { fallas.push('el ícono ' + ic.src + ' del manifiesto no existe'); continue; }
  iconos++;
  if (ic.type === 'image/png') {
    const t = pngTam(readFileSync(p)), [w, h] = (ic.sizes || '').split('x').map(Number);
    if (!t || t[0] !== w || t[1] !== h) fallas.push('el ícono ' + ic.src + ' mide ' + (t ? t.join('×') : '¿?') + ', no ' + ic.sizes);
  } else if (/svg/.test(ic.type) && !/<svg[\s>]/.test(leer(p))) fallas.push('el ícono ' + ic.src + ' no es un SVG');
}
const fav = /<link rel="icon"[^>]*href="data:image\/svg\+xml,([^"]+)"/.exec(html);
if (!fav || !/^<svg[\s\S]*<\/svg>$/.test(decodeURIComponent(fav[1]))) fallas.push('el ícono de la pestaña no es un SVG que se lea');
else iconos++;
notas.push(iconos + ' íconos (manifiesto y pestaña) que existen y miden lo que declaran');

/* 4. las direcciones externas */
const ESQUEMAS = /w3\.org\/(2000\/svg|1999\/xlink|1998\/Math|2001\/XMLSchema)|schemas\.openxmlformats\.org|purl\.org/;
const externas = new Set();
const fuentes = [html, codigoUI, ...readdirSync(join(RAIZ, 'js')).filter(f => /^labg-.*\.js$/.test(f)).map(f => leer(join(RAIZ, 'js', f))), leer(join(RAIZ, 'js', 'nucleo', 'motor-r.js')), leer(join(RAIZ, 'js', 'nucleo', 'informe.js'))];
for (const t of fuentes) for (const m of t.matchAll(/https?:\/\/[^\s"'`)<>\\]+/g)) { const u = m[0].replace(/[.,;]+$/, ''); if (!ESQUEMAS.test(u) && !/\$\{|\{/.test(u)) externas.add(u); }
if (conRed) {
  let ok = 0;
  for (const u of [...externas].sort()) {
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'SigmaPro-pruebas' } });
      if (r.status < 400) ok++; else fallas.push(u + ' responde ' + r.status);
    } catch (e) { fallas.push(u + ' no responde: ' + (e.cause && e.cause.code || e.message)); }
  }
  notas.push(ok + ' de ' + externas.size + ' direcciones externas responden');
} else notas.push(externas.size + ' direcciones externas (sin red: no se probaron)');

console.log('\nSigmaPro · enlaces e íconos de la app');
for (const n of notas) console.log('  ' + n);
for (const f of fallas) console.log('  ✗ ' + f);
guardar('enlaces', { titulo: 'Los enlaces y los íconos de la app', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas });
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
process.exit(fallas.length ? 1 : 0);

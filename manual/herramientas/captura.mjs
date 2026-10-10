// SigmaPro — manual: capturas de pantalla de la app.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso (desde la carpeta de la app):  node manual/herramientas/captura.mjs <receta> [<receta> …] [--ancho 1400] [--alto 900]
// Abre index.html por file:// (como con doble clic) en un navegador sin ventana, tema claro, sin trabajo guardado,
// ejecuta la receta (manual/herramientas/recetas/<receta>.js) y guarda manual/img/<receta>.png al doble de resolución.
// La receta puede dejar en window.__recorte el rectángulo «x,y,ancho,alto» (píxeles de la vista, como los da
// getBoundingClientRect) y las marcas numeradas en window.__marcas (ayuda marcas()), que se imprimen listas para pegar
// en la figura. Si la primera línea de la receta dice «vista: 390x844 movil» (o «vista: 1400x1900»), la app se abre
// con ese tamaño de pantalla; si dice «motor», la app se sirve por http desde su carpeta y el motor R sale de
// motor-r/ (sin internet).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrir, servir } from './navegador.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MANUAL = join(AQUI, '..'), APP = join(MANUAL, '..');
const args = process.argv.slice(2), opc = {}, recetas = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) opc[args[i].slice(2)] = +args[++i]; else recetas.push(args[i]); }
if (!recetas.length) { console.error('Uso: node manual/herramientas/captura.mjs <receta> [--ancho 1400] [--alto 900]'); process.exit(2); }
const ancho = opc.ancho || 1400, alto = opc.alto || 900;
let URL_APP = pathToFileURL(join(APP, 'index.html')).href;
const LISTO = '!!(window.SP && SP.app && SP.app.ir && SP.datosUI && SP.app.analisis && SP.app.reporte && SP.app.autoguardado && document.documentElement.hasAttribute("data-sp-listo") && document.querySelector(".lnav-body, .labg-bar, body"))';
const AYUDAS = readFileSync(join(AQUI, 'recetas', '_ayudas.js'), 'utf8');

const n = await abrir({ ancho, alto, escala: 2 });
const http = recetas.some(r => existsSync(join(AQUI, 'recetas', r + '.js')) && /motor/.test(readFileSync(join(AQUI, 'recetas', r + '.js'), 'utf8').split('\n')[0])) ? await servir(APP) : null;
let codigo = 0;
if (http) URL_APP = http.origen + '/index.html';
try {
  for (const r of recetas) {
    const archivo = join(AQUI, 'recetas', r + '.js');
    if (!existsSync(archivo)) { console.error('No existe la receta ' + r); codigo = 1; continue; }
    const texto = readFileSync(archivo, 'utf8'), v = /vista:\s*(\d+)x(\d+)(\s+movil)?/.exec(texto.split('\n')[0]);
    /* sin trabajo guardado ni preferencias de una receta anterior (tema, opciones): la app se abre limpia */
    await n.enviar('Emulation.setDeviceMetricsOverride', v ? { width: +v[1], height: +v[2], deviceScaleFactor: 2, mobile: !!v[3] } : { width: ancho, height: alto, deviceScaleFactor: 2, mobile: false });
    await n.ir(URL_APP + '#b1', LISTO);
    await n.evaluar('new Promise(ok => { try { localStorage.clear(); } catch (e) {} const r = indexedDB.deleteDatabase("sigmapro"); r.onsuccess = r.onerror = r.onblocked = () => ok(true); })');
    await n.ir('about:blank');
    await n.ir(URL_APP + '#b1', LISTO);
    /* sin barra de desplazamiento: al capturar más allá de la vista desaparece y el ancho de la página cambia después
       de medir el recorte (Explorar se ensanchaba 15 px y la orilla derecha quedaba fuera) */
    await n.evaluar('(() => { const s = document.createElement("style"); s.textContent = "html { scrollbar-width: none; }"; document.head.appendChild(s); return true; })()');
    await n.evaluar('new Promise(r => setTimeout(r, 900))');
    const consola0 = n.consola.length;
    await n.evaluar('window.__recorte = null; window.__marcas = null; ' + AYUDAS + '\n(' + texto.trim().replace(/;\s*$/, '') + ')', 240);
    await n.evaluar('new Promise(r => setTimeout(r, 500))');
    const rec = await n.evaluar('(() => { const v = window.__recorte; if (!v) return null; const [x, y, w, h] = String(v).split(",").map(Number); return { x: x + scrollX, y: y + scrollY, ancho: w, alto: h, fuera: y < 0 || y + h > innerHeight + 1 }; })()');
    /* la página sigue siendo la app: si algo la cambió entre la receta y la foto, la captura no sirve */
    const sigue = await n.evaluar('(window.SP && SP.app) ? location.href : ""');
    if (!String(sigue || '').startsWith(URL_APP)) throw new Error('La página dejó de ser la app antes de la captura de ' + r + ' (' + (sigue || 'otra página') + ').');
    const png = await n.png(rec, rec && rec.fuera);
    writeFileSync(join(MANUAL, 'img', r + '.png'), png);
    const errores = n.consola.slice(consola0).filter(c => !/motor R|webR/i.test(c));
    const marcas = await n.evaluar('window.__marcas');
    console.log('img/' + r + '.png' + (rec ? ' (' + rec.ancho + ' × ' + rec.alto + ')' : ' (vista completa)') + (errores.length ? ' · consola: ' + errores.join(' | ') : ''));
    if (marcas && marcas.length) console.log('  ' + marcas.map(m => `<span class="marca" style="left:${m.x}%;top:${m.y}%">${m.n}</span>`).join(''));
  }
} catch (e) { console.error(e); codigo = 1; } finally { await n.cerrar(); if (http) await http.cerrar(); process.exit(codigo); }

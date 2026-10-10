// SigmaPro — Lighthouse sobre la app servida como en la página publicada (hito 5.9).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  SIGMAPRO_LIGHTHOUSE=<carpeta con node_modules/lighthouse> node tests/rendimiento/lighthouse.mjs [página-forma …]
//       (sin la variable, busca node_modules/lighthouse junto a SigmaPro). Lighthouse se usa solo en las pruebas: la
//       app no lo carga ni depende de él.
//
// Sirve la app en 127.0.0.1 con compresión gzip, como la publica GitHub Pages (sin ella, la red simulada del teléfono
// tardaría tres o cuatro veces más en bajar lo mismo y el puntaje no diría lo que vive quien usa la app), y corre
// Lighthouse en teléfono (red 4G lenta y procesador 4 veces más lento, lo de Lighthouse por omisión) y en escritorio,
// sobre Inicio, Fundamentos, la Suite y Validación. Escribe tests/rendimiento/lighthouse.json y deja su resumen en el
// bloque 8. Cada página corre tres veces (SIGMAPRO_LH_VECES) y cuenta la mediana, como recomienda Lighthouse: su puntaje
// varía de una corrida a otra con lo que esté haciendo el equipo. La meta del hito 5.9: 90 o más en las cuatro categorías.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, normalize, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { guardar } from '../lib/comprobaciones.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = normalize(join(AQUI, '..', '..'));
const LH = [process.env.SIGMAPRO_LIGHTHOUSE, RAIZ, join(RAIZ, '..')].filter(Boolean).map(d => join(d, 'node_modules')).find(d => existsSync(join(d, 'lighthouse')));
if (!LH) { console.error('No encontré Lighthouse (SIGMAPRO_LIGHTHOUSE con la carpeta que tiene node_modules/lighthouse).'); process.exit(2); }
const lighthouse = (await import(pathToFileURL(join(LH, 'lighthouse', 'core', 'index.js')).href)).default;
const chromeLauncher = await import(pathToFileURL(join(LH, 'chrome-launcher', 'dist', 'index.js')).href);
const desktop = (await import(pathToFileURL(join(LH, 'lighthouse', 'core', 'config', 'desktop-config.js')).href)).default;
process.env.CHROME_PATH = process.env.CHROME_PATH || [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));

/* el servidor: como GitHub Pages, con gzip para el texto */
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm' };
const comprime = t => /^(text\/|application\/(json|manifest|javascript)|image\/svg)/.test(t);
const srv = createServer(async (q, r) => {
  try {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(RAIZ, p));
    if (!f.startsWith(RAIZ)) throw new Error('fuera');
    let d = await readFile(f);
    const tipo = TIPOS[extname(f)] || 'application/octet-stream', h = { 'Content-Type': tipo, 'Cache-Control': 'max-age=600' };
    if (comprime(tipo) && /gzip/.test(q.headers['accept-encoding'] || '')) { d = gzipSync(d, { level: 6 }); h['Content-Encoding'] = 'gzip'; h.Vary = 'Accept-Encoding'; }
    h['Content-Length'] = d.length;
    r.writeHead(200, h); r.end(d);
  } catch { r.writeHead(404); r.end(); }
});
await new Promise(ok => srv.listen(0, '127.0.0.1', ok));
const ORIGEN = 'http://127.0.0.1:' + srv.address().port;

const PAGINAS = { inicio: '/index.html?intro=no#b1', fundamentos: '/index.html?intro=no#b9', suite: '/index.html?intro=no#b10', validacion: '/index.html?intro=no#b8' };
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const SOLO = process.argv.slice(2);
const VECES = Math.max(1, +process.env.SIGMAPRO_LH_VECES || 3), TOPE = 150000;
const filas = [];
for (const forma of ['mobile', 'desktop']) {
  for (const [nombre, ruta] of Object.entries(PAGINAS)) {
    if (SOLO.length && !SOLO.includes(nombre + '-' + forma) && !SOLO.includes(nombre) && !SOLO.includes(forma)) continue;
    /* cada página, varias veces: la mediana (Lighthouse varía de una corrida a otra con lo que hace el equipo) */
    const corridas = [];
    for (let v = 0; v < VECES; v++) {
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions'] });
      try {
        /* con un tope: una corrida que se atora (el navegador deja de responder) no detiene a las demás */
        let reloj;
        const r = await Promise.race([
          lighthouse(ORIGEN + ruta, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: CATS, maxWaitForLoad: 60000 }, forma === 'desktop' ? desktop : undefined),
          new Promise((_, mal) => { reloj = setTimeout(() => mal(new Error('sin respuesta en ' + TOPE / 1000 + ' s')), TOPE); }),
        ]).finally(() => clearTimeout(reloj));
        corridas.push(r.lhr);
        if (process.env.SIGMAPRO_LH_DETALLE) writeFileSync(join(AQUI, 'lh-' + nombre + '-' + forma + '-' + v + '.json'), JSON.stringify(r.lhr));
      } catch (e) { console.log(nombre + ' ' + forma + ': ' + e.message); }
      finally { await chrome.kill(); }
    }
    if (!corridas.length) continue;
    const mediana = xs => { const o = xs.slice().sort((a, b) => a - b); return o[Math.floor(o.length / 2)]; };
    const p = x => mediana(corridas.map(l => Math.round(100 * (l.categories[x] ? l.categories[x].score : NaN))));
    const m = id => mediana(corridas.map(l => l.audits[id].numericValue));
    const ms = v => (v >= 1000 ? (v / 1000).toFixed(1) + ' s' : Math.round(v) + ' ms');
    /* la corrida de en medio por su puntaje de rendimiento, para lo que quedó bajo 90 */
    const tipica = corridas.slice().sort((a, b) => a.categories.performance.score - b.categories.performance.score)[Math.floor(corridas.length / 2)];
    const fila = { pagina: nombre, forma, corridas: corridas.length, rendimiento: p('performance'), accesibilidad: p('accessibility'), practicas: p('best-practices'), seo: p('seo'),
      rendimientos: corridas.map(l => Math.round(100 * l.categories.performance.score)),
      fcp: ms(m('first-contentful-paint')), lcp: ms(m('largest-contentful-paint')), tbt: ms(m('total-blocking-time')), cls: m('cumulative-layout-shift').toFixed(3), si: ms(m('speed-index')),
      bajo: Object.values(tipica.audits).filter(x => x.score !== null && x.score < 0.9 && ['binary', 'numeric'].includes(x.scoreDisplayMode)).map(x => x.id) };
    filas.push(fila);
    console.log(`${nombre.padEnd(12)} ${forma.padEnd(8)} rend ${fila.rendimiento} (${fila.rendimientos.join(', ')}) · acc ${fila.accesibilidad} · prác ${fila.practicas} · seo ${fila.seo} · FCP ${fila.fcp} · LCP ${fila.lcp} · TBT ${fila.tbt} · CLS ${fila.cls} · SI ${fila.si}` +
      (fila.bajo.length ? '\n    bajo 90: ' + fila.bajo.join(', ') : ''));
  }
}
await new Promise(ok => srv.close(ok));
writeFileSync(join(AQUI, 'lighthouse.json'), JSON.stringify(filas, null, 1) + '\n');
const minimo = filas.length ? Math.min(...filas.flatMap(f => [f.rendimiento, f.accesibilidad, f.practicas, f.seo])) : NaN;
if (!SOLO.length) guardar('lighthouse', { titulo: 'Lighthouse (teléfono y escritorio)', ok: minimo >= 90,
  resumen: filas.map(f => f.pagina + ' ' + (f.forma === 'mobile' ? 'teléfono' : 'escritorio') + ': ' + f.rendimiento + '/' + f.accesibilidad + '/' + f.practicas + '/' + f.seo).join('; ') + ' (rendimiento/accesibilidad/buenas prácticas/SEO)',
  renglones: filas.filter(f => Math.min(f.rendimiento, f.accesibilidad, f.practicas, f.seo) < 90).map(f => f.pagina + ' ' + f.forma + ': ' + f.bajo.join(', ')) });
console.log(minimo >= 90 ? '\nTODO EN 90 O MÁS' : '\nMÍNIMO ' + minimo + ' (la meta es 90)');
process.exit(minimo >= 90 ? 0 : 1);

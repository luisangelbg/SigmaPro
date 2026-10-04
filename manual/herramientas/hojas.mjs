// SigmaPro — manual: revisa una parte ya paginada.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso (desde la carpeta de la app):
//   node manual/herramientas/hojas.mjs es/01-bloque1.html                 el hueco al pie de cada hoja (huecos.js)
//   node manual/herramientas/hojas.mjs es/01-bloque1.html --png 3-5 --salida <carpeta>
//                                                                       además, las hojas 3 a 5 como imagen
// Avisa también de los elementos más altos que una hoja y de las imágenes que no cargaron.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrir } from './navegador.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url)), MANUAL = join(AQUI, '..');
const args = process.argv.slice(2), parte = args.find(a => !a.startsWith('--') && /\.html$/.test(a));
const valor = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
if (!parte) { console.error('Uso: node manual/herramientas/hojas.mjs es/NN-parte.html [--png 1-3] [--salida carpeta]'); process.exit(2); }
const n = await abrir({ ancho: 1000, alto: 1100, escala: 1 });
let codigo = 0;
try {
  await n.ir(pathToFileURL(join(MANUAL, parte)).href, 'document.documentElement.classList.contains("paginado") || !!document.querySelector(".page svg > *")', 60);
  console.log(await n.evaluar(readFileSync(join(AQUI, 'huecos.js'), 'utf8')));
  const malas = await n.evaluar('[...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute("src"))');
  if (malas.length) { console.log('IMÁGENES QUE NO CARGARON: ' + malas.join(', ')); codigo = 1; }
  const avisos = n.consola.filter(c => /más alto que una hoja/.test(c));
  if (avisos.length) { console.log('ELEMENTOS MÁS ALTOS QUE UNA HOJA: ' + avisos.length + ' · ' + avisos.map(a => a.slice(0, 120)).join(' · ')); codigo = 1; }
  const rango = valor('png');
  if (rango) {
    const [a, b] = rango.split('-').map(Number), salida = valor('salida') || join(tmpdir(), 'sigmapro-hojas');
    mkdirSync(salida, { recursive: true });
    for (let k = a; k <= (b || a); k++) {
      const r = await n.evaluar(`(() => { const h = document.querySelectorAll('.hoja, .page')[${k - 1}]; if (!h) return null; const b = h.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, ancho: b.width, alto: b.height }; })()`);
      if (!r) break;
      const f = join(salida, parte.replace(/[\\/]/g, '_').replace(/\.html$/, '') + '-' + String(k).padStart(2, '0') + '.png');
      writeFileSync(f, await n.png(r, true));
      console.log(f);
    }
  }
} catch (e) { console.error(e); codigo = 1; } finally { await n.cerrar(); process.exit(codigo); }

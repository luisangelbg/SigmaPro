// SigmaPro — manual: escribe el índice general de la introducción a partir de los títulos de cada parte.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso, desde la carpeta de la app:   node manual/herramientas/indice.mjs es
//
// Lee el <h1> de cada capítulo (section.capitulo, con su data-pestana) y sus <h2 id> con su número, y reescribe la lista
// <ol class="toc"> que está entre <!-- indice:inicio --> y <!-- indice:fin --> en es/00b-introduccion.html. Las partes
// de un mismo capítulo (04a…04g) se juntan bajo él. Así el índice nunca se queda atrás de los títulos.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const lang = process.argv[2] || 'es';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', lang);
const destino = join(dir, '00b-introduccion.html');
const partes = readdirSync(dir).filter(f => /^(00b|\d\d[a-z]?)-.*\.html$/.test(f) && f !== 'manual-completo.html').sort();
const sinEtiquetas = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const CHIP = { In: 'k0', Ap: 'kx' };

const capitulos = [];
for (const p of partes) {
  const t = readFileSync(join(dir, p), 'utf8');
  /* «Cómo leer este manual» es una sección preliminar con su propio id */
  for (const m of t.matchAll(/<section class="preliminares"[^>]*id="(como-leer)"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/g)) capitulos.push({ chip: 'P', clase: 'k0', id: m[1], titulo: sinEtiquetas(m[2]), secciones: [] });
  const cap = t.match(/<section class="capitulo" id="([^"]+)" data-pestana="([^"]+)"[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (cap) capitulos.push({ chip: cap[2].replace(/^B/, ''), clase: CHIP[cap[2]] || 'k' + cap[2].replace(/^B/, ''), id: cap[1], titulo: sinEtiquetas(cap[3]), secciones: [] });
  const actual = capitulos[capitulos.length - 1];
  if (!actual || actual.chip === 'P') continue;
  for (const m of t.matchAll(/<h2 id="([^"]+)"><span class="num">([^<]+)<\/span>([\s\S]*?)<\/h2>/g)) actual.secciones.push({ id: m[1], n: m[2], t: sinEtiquetas(m[3]) });
}

const li = c => `    <li>\n      <div class="toc-cap"><span class="chip ${c.clase}">${c.chip}</span><a href="#${c.id}">${c.titulo}</a><a class="pag" href="#${c.id}"></a></div>` +
  (c.secciones.length ? `\n      <ul>\n${c.secciones.map(s => `        <li><span class="n">${s.n}</span><a href="#${s.id}"><span class="t">${s.t}</span></a></li>`).join('\n')}\n      </ul>` : '') + '\n    </li>';
const toc = `<!-- indice:inicio -->\n  <ol class="toc">\n${capitulos.map(li).join('\n')}\n  </ol>\n  <!-- indice:fin -->`;

const html = readFileSync(destino, 'utf8');
if (!/<!-- indice:inicio -->[\s\S]*<!-- indice:fin -->/.test(html)) { console.error('00b-introduccion.html no tiene las marcas <!-- indice:inicio --> y <!-- indice:fin -->'); process.exit(1); }
writeFileSync(destino, html.replace(/<!-- indice:inicio -->[\s\S]*<!-- indice:fin -->/, toc));
console.log(`índice: ${capitulos.length} capítulos, ${capitulos.reduce((a, c) => a + c.secciones.length, 0)} secciones → ${lang}/00b-introduccion.html`);

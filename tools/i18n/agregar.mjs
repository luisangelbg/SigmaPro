// SigmaPro — agrega traducciones al catálogo inglés (js/i18n/en.js).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tools/i18n/agregar.mjs nuevas.json      (un objeto { "texto en español": "English text" })
//       node tools/i18n/agregar.mjs --faltan          (lista, como JSON, los literales de T() que aún no tienen traducción)
//
// Revisa que cada traducción conserve los marcadores {x} de su clave, ordena las claves y reescribe el archivo con el
// mismo encabezado. node tests/idioma.mjs comprueba después que no falte nada.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARCHIVO = join(RAIZ, 'js', 'i18n', 'en.js');
const texto = readFileSync(ARCHIVO, 'utf8');
const ctx = vm.createContext({}); ctx.self = ctx;
vm.runInContext(texto, ctx);
const cat = Object.assign({}, ctx.SP_CATALOGO);
const marc = s => (s.match(/\{\w+\}/g) || []).sort().join(',');

if (process.argv[2] === '--faltan') {
  const faltan = new Set();
  (function rec(d) {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { if (!/generado|i18n/.test(p)) rec(p); continue; }
      if (!p.endsWith('.js') || /labg-/.test(f)) continue;
      for (const m of readFileSync(p, 'utf8').matchAll(/\bT\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1\s*[,)]/g)) {
        if (m[1] === '`' && m[2].includes('${')) continue;
        const t = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        if (!Object.prototype.hasOwnProperty.call(cat, t)) faltan.add(t);
      }
    }
  })(join(RAIZ, 'js'));
  console.log(JSON.stringify(Object.fromEntries([...faltan].map(k => [k, ''])), null, 1));
  process.exit(0);
}

const nuevas = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const malas = Object.entries(nuevas).filter(([k, v]) => typeof v !== 'string' || !v || marc(k.replace(/@@\w+$/, '')) !== marc(v));
if (malas.length) { console.error('Traducciones vacías o con otros marcadores:', malas.slice(0, 5)); process.exit(1); }
let agregadas = 0, cambiadas = 0;
for (const [k, v] of Object.entries(nuevas)) {
  const limpio = v.replace(/«/g, '“').replace(/»/g, '”').replace(/’/g, "'");
  if (!Object.prototype.hasOwnProperty.call(cat, k)) agregadas++; else if (cat[k] !== limpio) cambiadas++;
  cat[k] = limpio;
}
const i = texto.indexOf('self.SP_CATALOGO = ');
const cuerpo = '{\n' + Object.keys(cat).sort().map(k => JSON.stringify(k) + ': ' + JSON.stringify(cat[k])).join(',\n') + '\n}';
writeFileSync(ARCHIVO, texto.slice(0, i) + 'self.SP_CATALOGO = ' + cuerpo + ';\n');
console.log(`en.js: ${Object.keys(cat).length} textos (${agregadas} nuevos, ${cambiadas} cambiados)`);

// SigmaPro — manual: une las partes de un idioma en un solo documento para paginarlo e imprimirlo a PDF.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso, desde la carpeta de la app:
//   node manual/herramientas/unir.mjs es                          → manual/es/manual-completo.html (portada y todas las partes)
//   node manual/herramientas/unir.mjs es --pdf SigmaPro_Manual_de_usuario_ES.pdf   → además, el PDF (solo al final)
//   node manual/herramientas/unir.mjs es --partes 04 --salida _cap4.html
//                                                                 → solo las partes cuyo nombre empieza con «04», sin portada,
//                                                                   para revisar con hojas.mjs la paginación de un capítulo
//                                                                   partido en varios archivos (sus partes corren seguidas)
//
// Escribe la portada (00a-portada.html) como primera hoja y las secciones de las demás partes en orden de nombre, con
// un solo paginar.js, para que la numeración de páginas sea continua y el índice encuentre las páginas de todo.
// Los estilos propios de cada parte se funden: un selector escrito igual en todas se conserva una vez; si dos capítulos
// le dan valores distintos (el ancho de figure.chica, por ejemplo), gana la versión más frecuente y las otras se acotan
// a las hojas de su capítulo con .hoja[data-pestana="…"]. Dos partes del mismo capítulo no pueden darle valores
// distintos al mismo selector: no habría cómo acotarlos, y se avisa.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MANUAL = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const lang = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--'))) || 'es';
const opc = n => (args.includes('--' + n) ? args[args.indexOf('--' + n) + 1] : null);
const prefijo = opc('partes'), salidaNombre = opc('salida') || 'manual-completo.html';
const dir = join(MANUAL, lang);
if (!existsSync(dir)) { console.error('No existe la carpeta ' + dir); process.exit(2); }

const partes = readdirSync(dir).filter(f => /^(00b|\d\d[a-z]?)-.*\.html$/.test(f) && f !== 'manual-completo.html' && !f.startsWith('00a-'))
  .filter(f => !prefijo || f.startsWith(prefijo)).sort();
if (!partes.length) { console.error('No hay partes en ' + dir + (prefijo ? ' que empiecen con ' + prefijo : '')); process.exit(2); }

const reglas = [], cuerpo = [];
for (const p of partes) {
  const t = readFileSync(join(dir, p), 'utf8');
  /* la pestaña del capítulo acota las reglas que solo valen en él */
  const pest = (t.match(/<section\b[^>]*data-pestana="([^"]+)"/) || [])[1] || null;
  const st = t.match(/<style>([\s\S]*?)<\/style>/);
  if (st) {
    const css = st[1].replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const sel = m[1].replace(/\s+/g, ' ').trim(), dec = m[2].replace(/\s+/g, ' ').trim();
      if (sel) reglas.push({ sel, dec, pest, arch: p });
    }
  }
  const i = t.indexOf('<body>'), j = t.lastIndexOf('</body>');
  if (i < 0 || j < 0) { console.error(p + ' no tiene <body>'); process.exit(1); }
  cuerpo.push(`\n<!-- ====================================================================== ${p} -->\n` + t.slice(i + 6, j).replace(/<script\b[\s\S]*?<\/script>/g, ''));
}

/* fusión de estilos: por selector, gana la declaración más repetida; las demás se acotan por capítulo */
const css = [], hechos = new Set();
for (const r of reglas) {
  if (hechos.has(r.sel)) continue;
  hechos.add(r.sel);
  const grupos = new Map();
  for (const x of reglas.filter(x => x.sel === r.sel)) { if (!grupos.has(x.dec)) grupos.set(x.dec, []); grupos.get(x.dec).push(x); }
  const orden = [...grupos.entries()].sort((a, b) => b[1].length - a[1].length);
  css.push(`  ${r.sel} { ${orden[0][0]} }`);
  const pestGanadora = new Set(orden[0][1].map(x => x.pest));
  for (const [dec, xs] of orden.slice(1)) for (const x of xs) {
    if (!x.pest) throw new Error(`${x.arch} redefine «${x.sel}» y no tiene pestaña de capítulo`);
    if (pestGanadora.has(x.pest)) throw new Error(`${x.arch} le da a «${x.sel}» otro valor que otra parte del mismo capítulo (${x.pest}): usa otro nombre de clase`);
    css.push('  ' + x.sel.split(/\s*,\s*/).map(s => `.hoja[data-pestana="${x.pest}"] ${s}`).join(', ') + ` { ${dec} }`);
  }
}

/* la portada no se pagina: es una hoja propia, sin encabezado ni número, dibujada por su propio script */
let portada = '';
const fPortada = join(dir, '00a-portada.html');
if (!prefijo && existsSync(fPortada)) {
  const t = readFileSync(fPortada, 'utf8');
  const svg = t.match(/<section class="page cover"[^>]*>([\s\S]*?)<\/section>/), scr = t.match(/(<script>[\s\S]*?<\/script>)/);
  if (!svg || !scr) { console.error('00a-portada.html no tiene la estructura esperada'); process.exit(1); }
  portada = `<div class="hoja portada cover" aria-label="Portada">${svg[1]}</div>\n${scr[1]}\n`;
  css.push('  .portada > svg { display: block; width: 100%; height: 100%; }');
}

const titulo = { es: 'SigmaPro · Manual de usuario', en: "SigmaPro · User's manual" }[lang] || 'SigmaPro';
const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- documento generado por herramientas/unir.mjs: no se edita a mano; se corrigen las partes -->
<link rel="stylesheet" href="../interior.css">
<script src="../paginar.js"></script>
<style>
${css.join('\n')}
</style>
</head>
<body>
${portada}${cuerpo.join('\n')}
</body>
</html>
`;
writeFileSync(join(dir, salidaNombre), html);
console.log(`${partes.length} partes, ${hechos.size} reglas de estilo distintas, ${(cuerpo.join('').match(/<section\b/g) || []).length} secciones → ${lang}/${salidaNombre}`);

/* con --pdf <archivo>: abre el documento unido en el navegador sin ventana, espera a que paginar.js termine y lo
   imprime a PDF tamaño carta (sin márgenes añadidos: cada hoja ya trae los suyos). Solo al final, una vez. */
const pdfNombre = opc('pdf');
if (pdfNombre) {
  const { abrir } = await import('./navegador.mjs');
  const { pathToFileURL } = await import('node:url');
  const n = await abrir({ ancho: 1100, alto: 1400, escala: 1 });
  try {
    await n.ir(pathToFileURL(join(dir, salidaNombre)).href, 'document.documentElement.classList.contains("paginado")', 180);
    const hojas = await n.evaluar('document.querySelectorAll(".hoja").length');
    const pdf = await n.pdf();
    writeFileSync(join(MANUAL, pdfNombre), pdf);
    console.log(`PDF: ${hojas} hojas, ${(pdf.length / 1048576).toFixed(1)} MB → manual/${pdfNombre}`);
  } finally { await n.cerrar(); }
}

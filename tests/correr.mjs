// SigmaPro — corredor de pruebas en node (sin navegador ni dependencias).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/correr.mjs [--solo <texto>] [--sin-escribir] [--detalle]
//
// 1. Carga el núcleo con la MISMA lista de scripts que index.html (js/nucleo y js/metodos).
// 2. Comprueba que tests/index.html carga lo mismo, en el mismo orden, y todas las pruebas.
// 3. Corre las pruebas unitarias (tests/unidad/*.test.js).
// 4. Corre cada caso de validación (tests/casos/*/*.json) y lo compara contra R.
// 5. Escribe: tests/generado/casos.js (los casos para la página de pruebas),
//    js/generado/validacion.js (el reporte que muestra la app),
//    tests/reporte-validacion.html y tests/reporte-validacion.csv.
// Sale con código 1 si algo falla.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const args = process.argv.slice(2);
const opt = {
  solo: args.includes('--solo') ? args[args.indexOf('--solo') + 1] : null,
  escribir: !args.includes('--sin-escribir'),
  detalle: args.includes('--detalle'),
};
const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '');
const rel = p => relative(RAIZ, p).replace(/\\/g, '/');
const problemas = [];

// ---------------------------------------------------------------- 1. núcleo
const htmlApp = leer(join(RAIZ, 'index.html'));
const scriptsDe = (html, re) => [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]).filter(s => re.test(s));
const NUCLEO = /^(\.\.\/)?js\/(nucleo|metodos)\//;
const nucleoApp = scriptsDe(htmlApp, NUCLEO);
if (!nucleoApp.length) problemas.push('index.html no carga ningún script de js/nucleo');

const ctx = vm.createContext({
  console, setTimeout, clearTimeout, setInterval, clearInterval, performance,
  TextEncoder, TextDecoder, structuredClone, __SPT_NODE: true,
});
ctx.__nuevoContexto = codigo => { const c = vm.createContext({ console }); c.self = c; vm.runInContext(codigo, c); return c; };
const correrEn = (archivo) => vm.runInContext(leer(archivo), ctx, { filename: rel(archivo) });

for (const s of nucleoApp) correrEn(join(RAIZ, s));
for (const s of ['arnes.js', 'comparar.js', 'validar.js']) correrEn(join(TESTS, 'lib', s));

// ---------------------------------------------------------------- 2. consistencia de carga
const htmlPruebas = leer(join(TESTS, 'index.html'));
const nucleoPruebas = scriptsDe(htmlPruebas, NUCLEO).map(s => s.replace(/^\.\.\//, ''));
if (JSON.stringify(nucleoPruebas) !== JSON.stringify(nucleoApp)) {
  problemas.push('tests/index.html no carga los mismos scripts del núcleo que index.html, o no en el mismo orden.\n' +
    '    app:     ' + nucleoApp.join(', ') + '\n    pruebas: ' + nucleoPruebas.join(', '));
}
const unidadEnPagina = scriptsDe(htmlPruebas, /^unidad\//);
const unidadEnCarpeta = readdirSync(join(TESTS, 'unidad')).filter(f => f.endsWith('.test.js')).map(f => 'unidad/' + f);
for (const f of unidadEnCarpeta) if (!unidadEnPagina.includes(f)) problemas.push('tests/index.html no carga ' + f);
for (const f of unidadEnPagina) if (!unidadEnCarpeta.includes(f)) problemas.push('tests/index.html carga ' + f + ', que no existe');

// ---------------------------------------------------------------- 3. pruebas unitarias
for (const f of unidadEnPagina) if (existsSync(join(TESTS, f))) correrEn(join(TESTS, f));
const unidad = await ctx.SPT.correr();

// ---------------------------------------------------------------- 4. casos contra R
const dirCasos = join(TESTS, 'casos');
/* las carpetas en el orden en que avanza la app (las nuevas, al final en orden alfabético) */
const ORDEN_CARPETAS = ['num-resumen', 'dist-normal', 'dist-t-f-chisq', 'dist-gamma-beta', 'dist-tukey', 'lineal',
  'importar', 'datos', 'descriptiva', 'frecuencias', 'supuestos', 'dist-rangos', 'pruebas-t', 'no-parametricas', 'disenos'];
const posicion = d => { const k = ORDEN_CARPETAS.indexOf(d); return k < 0 ? ORDEN_CARPETAS.length : k; };
const archivosCaso = existsSync(dirCasos)
  ? readdirSync(dirCasos, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
    .sort((a, b) => posicion(a) - posicion(b) || a.localeCompare(b))
    .flatMap(d => readdirSync(join(dirCasos, d)).filter(f => f.endsWith('.json')).sort().map(f => join(dirCasos, d, f)))
  : [];
const textos = archivosCaso.map(leer);
const casos = textos.map((t, i) => {
  try { return JSON.parse(t); } catch (e) { problemas.push(rel(archivosCaso[i]) + ': JSON no válido (' + e.message + ')'); return null; }
}).filter(Boolean);
const elegidos = casos.filter(c => !opt.solo || c.id.includes(opt.solo));
ctx.__casos = elegidos;
const resultados = vm.runInContext('__casos.map(c => SPT.ejecutarCaso(c, SP))', ctx);
/* agrupar por función o método, en el orden en que aparece cada uno por primera vez */
{
  const clave = r => r.objetivo.tipo + ':' + r.objetivo.nombre;
  const orden = new Map();
  resultados.forEach(r => { if (!orden.has(clave(r))) orden.set(clave(r), orden.size); });
  resultados.sort((a, b) => orden.get(clave(a)) - orden.get(clave(b)));
}
const resumen = ctx.SPT.resumirCasos(resultados);

// ---------------------------------------------------------------- 5. salidas
const ahora = new Date();
const referencias = [...new Set(casos.map(c => c.referencia && c.referencia.r).filter(Boolean))].sort();
const V = {
  version: ctx.SP.VERSION,
  generado: ahora.toISOString(),
  motor: 'node ' + process.version,
  criterio: { tol: 1e-6, regla: '|SigmaPro − R| ≤ 1e-6 · máx(1, |R|)' },
  referencias,
  resumen,
  casos: resultados.map(r => ({
    id: r.id, objetivo: r.objetivo, titulo: r.titulo, fuente: r.fuente, clase: r.clase,
    valores: r.valores, difMax: r.difMax, difEscaladaMax: r.difEscaladaMax, peor: r.peor,
    aprobado: r.aprobado, error: r.error, fallas: (r.fallas || []).slice(0, 5),
    comparacion: r.comparacion, referencia: r.referencia,
  })),
};

/* escribe solo si el contenido cambió (sin contar la fecha), para no ensuciar el historial */
function escribirSiCambia(archivo, contenido, sinFecha) {
  if (existsSync(archivo) && sinFecha) {
    const previo = leer(archivo);
    if (sinFecha(previo) === sinFecha(contenido)) return false;
  } else if (existsSync(archivo) && leer(archivo) === contenido) return false;
  mkdirSync(dirname(archivo), { recursive: true });
  writeFileSync(archivo, contenido, 'utf8');
  return true;
}
const quitarFecha = s => s.replace(/"generado": "[^"]*"/, '').replace(/Generado el [^<]*/, '').replace(/^# generado,[^\n]*\n/m, '');

if (opt.escribir && !opt.solo) {
  const cab = '/* Generado por tests/correr.mjs — no editar a mano. */\n';
  escribirSiCambia(join(TESTS, 'generado', 'casos.js'), cab + 'window.SP_CASOS = ' + JSON.stringify(casos) + ';\n');
  escribirSiCambia(join(RAIZ, 'js', 'generado', 'validacion.js'), cab + 'window.SP_VALIDACION = ' + JSON.stringify(V, null, 1) + ';\n', quitarFecha);
  escribirSiCambia(join(TESTS, 'reporte-validacion.html'), reporteHTML(V), quitarFecha);
  escribirSiCambia(join(TESTS, 'reporte-validacion.csv'), reporteCSV(V), quitarFecha);
}

// ---------------------------------------------------------------- consola
const color = c => (process.stdout.isTTY && !process.env.NO_COLOR ? s => '\x1b[' + c + 'm' + s + '\x1b[0m' : s => s);
const verde = color(32), rojo = color(31), gris = color(90);
const fmtDif = x => (x === null || x === undefined ? '—' : x === 0 ? '0' : x.toExponential(1));
console.log('\nSigmaPro ' + ctx.SP.VERSION + ' · pruebas en ' + V.motor);
for (const p of problemas) console.log(rojo('✗ ' + p));
console.log('\nPruebas unitarias: ' + verde(unidad.aprobadas + ' aprobadas') + ', ' +
  (unidad.fallidas ? rojo(unidad.fallidas + ' con falla') : '0 con falla') + ', ' + gris(unidad.omitidas + ' solo en el navegador'));
for (const d of unidad.detalles) if (!d.ok) console.log(rojo('  ✗ ' + d.suite + ' › ' + d.caso + '\n      ' + d.error));
console.log('\nCasos contra R (' + (referencias.join(', ') || 'sin referencias') + '):');
for (const r of resultados) {
  const linea = '  ' + (r.aprobado ? verde('✓') : rojo('✗')) + ' ' + r.id.padEnd(42) + ' ' + String(r.valores).padStart(5) + ' valores · dif. máx. ' + fmtDif(r.difEscaladaMax);
  if (opt.detalle || !r.aprobado) console.log(linea);
  if (r.error) console.log(rojo('      ' + r.error));
  for (const f of r.fallas || []) console.log(rojo('      ' + f.ruta + ': ' + f.motivo + ' (obtenido ' + f.obtenido + ', esperado ' + f.esperado + ')'));
}
console.log('  ' + (resumen.fallidos ? rojo : verde)(resumen.aprobados + ' de ' + resumen.casos + ' casos aprobados') +
  ' · ' + resumen.valores + ' valores · ' + (resumen.objetivos === 1 ? '1 función o método' : resumen.objetivos + ' funciones y métodos') + ' · mayor diferencia escalada ' + fmtDif(resumen.difEscaladaMax));
if (opt.escribir && !opt.solo) console.log(gris('\nReporte: tests/reporte-validacion.html · en la app: bloque 8'));
const ok = !problemas.length && !unidad.fallidas && !resumen.fallidos && resumen.casos > 0;
console.log('\n' + (ok ? verde('TODO APROBADO') : rojo('HAY FALLAS')) + '\n');
process.exitCode = ok ? 0 : 1;

// ================================================================ reportes
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function sci(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  if (x === 0) return '0';
  if (x >= 1e-3 && x < 1e4) return String(Number(x.toPrecision(3)));
  const [m, e] = x.toExponential(1).split('e');
  const sup = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  return m + ' × 10' + String(Number(e)).replace(/[-0-9]/g, c => sup[c]);
}
function nombreObjetivo(o) {
  if (o.tipo === 'metodo') return 'Método · ' + o.nombre;
  const nom = ctx.SP.nombresFunciones && ctx.SP.nombresFunciones[o.nombre];
  return (nom || 'Función del núcleo') + ' · SP.' + o.nombre;
}

function reporteHTML(V) {
  const r = V.resumen;
  const fecha = new Date(V.generado).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  let filas = '', grupo = null;
  for (const c of V.casos) {
    const g = nombreObjetivo(c.objetivo);
    if (g !== grupo) { grupo = g; filas += '<tr class="grupo"><td colspan="6">' + esc(g) + '</td></tr>'; }
    const paq = Object.entries((c.referencia && c.referencia.paquetes) || {}).map(([p, v]) => p + ' ' + v).join(', ');
    filas += '<tr><td class="izq"><b>' + esc(c.id.split('/').slice(1).join('/')) + '</b><br><span class="tenue">' + esc(c.titulo) + '</span></td>' +
      '<td class="izq">' + esc(c.fuente) + '</td><td>' + esc(c.clase) + '</td><td>' + c.valores + '</td><td>' + sci(c.difEscaladaMax) + '</td>' +
      '<td><span class="v ' + (c.aprobado ? 'ok' : 'mal') + '">' + (c.aprobado ? 'Aprobado' : 'Falla') + '</span></td></tr>' +
      '<tr class="det"><td colspan="6"><details><summary>Referencia de R</summary><p>' + esc((c.referencia && c.referencia.r) || '') +
      (paq ? ' · ' + esc(paq) : '') + (c.error ? '<br><b class="mal">Error:</b> ' + esc(c.error) : '') +
      ((c.fallas || []).length ? '<br>' + c.fallas.map(f => '<b class="mal">' + esc(f.ruta) + '</b>: ' + esc(f.motivo)).join('<br>') : '') +
      '</p><pre>' + esc((c.referencia && c.referencia.codigo) || '') + '</pre></details></td></tr>';
  }
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SigmaPro — reporte de validación</title>
<style>
:root { color-scheme: light dark; --oro: #7D5B14; --fondo: #F7F6F3; --tarjeta: #fff; --texto: #17150F; --tenue: #5B5750; --borde: #E2DDD2; --ok: #1d6b34; --okf: #e7f5eb; --mal: #a82c22; --malf: #fbe9e7; }
@media (prefers-color-scheme: dark) { :root { --oro: #E6C470; --fondo: #0C0C0D; --tarjeta: #1A1917; --texto: #EEE9DF; --tenue: #A8A196; --borde: #2B2925; --ok: #7fd497; --okf: rgba(92,194,122,.13); --mal: #f59189; --malf: rgba(240,113,102,.13); } }
* { box-sizing: border-box; } body { margin: 0; font: 15px/1.55 system-ui, sans-serif; background: var(--fondo); color: var(--texto); font-feature-settings: "tnum" 1; }
main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 56px; }
.marca { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: #111; color: #D4A848; font-weight: 800; font-size: 22px; border: 1px solid rgba(212,168,72,.55); vertical-align: middle; margin-right: 10px; }
h1 { font-size: 28px; margin: 0 0 6px; } h2 { font-size: 19px; margin: 32px 0 10px; } p { max-width: 75ch; }
.tenue { color: var(--tenue); } .mal { color: var(--mal); }
.tejas { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; margin: 20px 0; }
@media (max-width: 760px) { .tejas { grid-template-columns: repeat(2, minmax(0,1fr)); } }
.teja { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: 10px; padding: 10px 14px; }
.teja .k { font-size: 12px; color: var(--tenue); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; } .teja .x { font-size: 26px; font-weight: 800; }
.envoltura { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th { border-top: 1.5px solid var(--texto); border-bottom: 1px solid var(--texto); padding: 6px 10px; text-align: right; }
td { padding: 6px 10px; text-align: right; vertical-align: top; } .izq, th.izq { text-align: left; }
tbody tr:last-child td { border-bottom: 1.5px solid var(--texto); }
tr.grupo td { text-align: left; font-weight: 800; padding-top: 16px; border-bottom: 1px solid var(--borde); }
tr.det td { text-align: left; padding-top: 0; } details summary { cursor: pointer; color: var(--oro); font-size: 13px; font-weight: 700; }
pre { background: #111; color: #EEE9DF; padding: 10px 12px; border-radius: 6px; overflow: auto; font-size: 12px; }
.v { font-size: 12px; font-weight: 800; padding: 2px 9px; border-radius: 999px; white-space: nowrap; } .v.ok { background: var(--okf); color: var(--ok); } .v.mal { background: var(--malf); color: var(--mal); }
ol li { margin: 4px 0; }
</style></head>
<body><main>
<h1><span class="marca" aria-hidden="true">Σ</span>SigmaPro · reporte de validación</h1>
<p class="tenue">Versión ${esc(V.version)} · Generado el ${esc(fecha)} · pruebas en ${esc(V.motor)} · referencias: ${esc(V.referencias.join(', '))}</p>
<p>Cada resultado del programa se compara contra R con datos publicados o clásicos. Un caso aprueba si en <b>cada</b> número |SigmaPro − R| ≤ 10⁻⁶ · máx(1, |R|). Los valores p menores que 10⁻⁶ se comparan además con error relativo. Los datos, el script de R y la referencia de cada caso están en <code>tests/casos/</code>; cualquiera puede repetirlo.</p>
<div class="tejas">
<div class="teja"><div class="k">Casos aprobados</div><div class="x">${r.aprobados} <span class="tenue" style="font-size:15px">de ${r.casos}</span></div></div>
<div class="teja"><div class="k">Valores comparados</div><div class="x">${r.valores.toLocaleString('es-MX')}</div></div>
<div class="teja"><div class="k">Mayor diferencia</div><div class="x">${sci(r.difEscaladaMax)}</div></div>
<div class="teja"><div class="k">Funciones y métodos</div><div class="x">${r.objetivos}</div></div>
</div>
<h2>Caso por caso</h2>
<div class="envoltura"><table>
<thead><tr><th class="izq">Caso</th><th class="izq">Fuente de los datos</th><th>Clase</th><th>Valores</th><th>Dif. máx.</th><th>Resultado</th></tr></thead>
<tbody>${filas}</tbody></table></div>
<p class="tenue" style="font-size:13px">Dif. máx.: la mayor diferencia escalada, |SigmaPro − R| / máx(1, |R|), entre todos los números del caso; «0» = coinciden en todas las cifras.</p>
<h2>Clases de resultados</h2>
<ol>
<li><b>A · Fórmula cerrada o algoritmo exacto</b>: tolerancia 10⁻⁶.</li>
<li><b>B · R usa una aproximación publicada</b>: se implementa el mismo algoritmo; si R es menos preciso por diseño, la referencia se afina en R y se documenta.</li>
<li><b>C · R usa azar</b>: referencia determinista de alta precisión.</li>
<li><b>D · Optimización iterativa</b>: criterios de convergencia ajustados en ambos lados.</li>
<li><b>E · Libros y artículos</b>: media unidad en el último decimal impreso.</li>
</ol>
</main></body></html>
`;
}

function reporteCSV(V) {
  const q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
  const filas = [['id', 'tipo', 'objetivo', 'titulo', 'fuente', 'clase', 'valores', 'dif_max', 'dif_escalada_max', 'aprobado', 'error', 'r', 'paquetes'].join(',')];
  for (const c of V.casos) {
    const paq = Object.entries((c.referencia && c.referencia.paquetes) || {}).map(([p, v]) => p + ' ' + v).join('; ');
    filas.push([q(c.id), q(c.objetivo.tipo), q(c.objetivo.nombre), q(c.titulo), q(c.fuente), q(c.clase), c.valores,
      c.difMax === null ? '' : c.difMax, c.difEscaladaMax === null ? '' : c.difEscaladaMax, c.aprobado ? 'si' : 'no', q(c.error),
      q(c.referencia && c.referencia.r), q(paq)].join(','));
  }
  return '# generado,' + V.generado + '\n' + filas.join('\n') + '\n';
}

// SigmaPro — los enlaces y logos de la suite LABG (data/suite.js, data/suite-rules.js, img/suite/).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/suite-enlaces.mjs [--sin-red]
//
// Sin red: cada app tiene logo en img/suite/ (SVG que se lee), sus campos completos (o «PENDIENTE» declarado, solo en
// las apps con estado «pendiente»), y las reglas de sugerencia nombran apps y motivos que existen, en los dos idiomas.
// Con red (lo normal): además, la página de cada app publicada, su repositorio, su manual y el portal responden 200.
// Es la única prueba que sale a internet; la app no lo hace nunca.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const conRed = !process.argv.includes('--sin-red');
const c = vm.createContext({ window: {} });
vm.runInContext(readFileSync(join(RAIZ, 'data', 'suite.js'), 'utf8'), c);
vm.runInContext(readFileSync(join(RAIZ, 'data', 'suite-rules.js'), 'utf8'), c);
const S = c.window.SP_SUITE, R = c.window.SP_SUITE_REGLAS;
const fallas = [], notas = [];
const ids = new Set(S.apps.map(a => a.id));

for (const a of S.apps) {
  const pend = a.estado === 'pendiente';
  if (!existsSync(join(RAIZ, a.logo))) fallas.push(a.id + ': no existe el logo ' + a.logo);
  else if (!/^<svg[\s>]/.test(readFileSync(join(RAIZ, a.logo), 'utf8').trim()) && !/<svg[\s>]/.test(readFileSync(join(RAIZ, a.logo), 'utf8'))) fallas.push(a.id + ': el logo no es SVG');
  for (const k of ['url', 'repo', 'version', 'fecha', 'doi', 'titulo']) {
    const v = a[k];
    if (v === 'PENDIENTE') { if (!pend) fallas.push(a.id + ': ' + k + ' PENDIENTE en una app publicada'); }
    else if (!v) fallas.push(a.id + ': falta ' + k);
  }
  if (pend) notas.push(a.id + ': PENDIENTE (sin repositorio público; logo marcador)');
  for (const L of ['es', 'en']) {
    if (!a[L] || !a[L].eslogan || !a[L].descripcion) fallas.push(a.id + ': faltan eslogan o descripción en ' + L);
    if (!pend && a.destacada !== false && (!a[L].caracteristicas || a[L].caracteristicas.length < 4 || a[L].caracteristicas.length > 6)) fallas.push(a.id + ': 4–6 características en ' + L);
  }
  if (!pend && /universidad|university|chapingo/i.test(JSON.stringify(a))) fallas.push(a.id + ': menciona una institución');
}
for (const [m, lista] of Object.entries(R.metodos)) for (const [a, motivo] of lista) {
  if (!ids.has(a)) fallas.push('regla de ' + m + ': app desconocida ' + a);
  if (!R.motivos[motivo] || !R.motivos[motivo].es || !R.motivos[motivo].en) fallas.push('regla de ' + m + ': motivo sin texto ' + motivo);
}
for (const [f, lista] of Object.entries(R.familias)) for (const a of lista) if (!ids.has(a)) fallas.push('familia ' + f + ': app desconocida ' + a);
for (const r of R.datos) if (!ids.has(r.app) || !R.motivos[r.motivo]) fallas.push('regla de datos ' + r.si + ': app o motivo desconocido');

if (conRed) {
  const urls = [S.portal];
  for (const a of S.apps) if (a.estado !== 'pendiente') for (const k of ['url', 'repo', 'manual']) if (a[k] && /^https:/.test(a[k])) urls.push(a[k]);
  const res = await Promise.all(urls.map(async u => {
    try { const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000) }); return [u, r.status]; }
    catch (e) { return [u, 'sin respuesta: ' + e.message]; }
  }));
  for (const [u, s] of res) if (s !== 200) fallas.push(u + ' → ' + s);
  notas.push(res.filter(([, s]) => s === 200).length + ' de ' + urls.length + ' enlaces responden 200');
} else notas.push('sin red: no se revisaron los enlaces');

console.log('\nSigmaPro · enlaces y logos de la suite LABG');
console.log('  ' + S.apps.length + ' apps, ' + Object.keys(R.metodos).length + ' análisis con sugerencias, ' + Object.keys(R.familias).length + ' familias, ' + R.datos.length + ' reglas del bloque Datos');
for (const n of notas) console.log('  · ' + n);
for (const f of fallas) console.log('  ✗ ' + f);
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
guardar('suite', { titulo: 'Enlaces y logos de la suite LABG', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas });
process.exitCode = fallas.length ? 1 : 0;

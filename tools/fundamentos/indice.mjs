// SigmaPro — índice de las fichas de Fundamentos (data/fundamentos/indice.js).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tools/fundamentos/indice.mjs [--revisar]
//
// Lee cada data/fundamentos/<id>.js y escribe en data/fundamentos/indice.js lo que el catálogo, el buscador, los
// filtros y el mapa necesitan de las 78 fichas (tipo de respuesta, estructura, diseños, «para qué sirve» y alias en
// los dos idiomas), para no cargarlas todas al abrir el bloque. Cada ficha se carga completa al abrirla.
// Con --revisar no escribe: sale con código 1 si el índice guardado no corresponde a las fichas (lo usa la prueba).

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = join(RAIZ, 'data', 'fundamentos');
const ARCHIVO = join(DIR, 'indice.js');
const revisar = process.argv.includes('--revisar');

const indice = {};
for (const f of readdirSync(DIR).filter(x => x.endsWith('.js') && x !== 'indice.js').sort()) {
  const txt = readFileSync(join(DIR, f), 'utf8').trim();
  const m = /^SP_FICHA\(([\s\S]*)\);?$/.exec(txt);
  if (!m) throw new Error(f + ': no es SP_FICHA( … );');
  const F = JSON.parse(m[1]);
  const lado = L => ({ paraQue: F[L].paraQue, alias: F[L].alias || [] });
  indice[F.id] = { familia: F.familia, respuesta: F.respuesta, estructura: F.estructura, disenos: F.disenos, ejemplo: !!F.ejemplo, es: lado('es'), en: lado('en') };
}
const texto = '/* Generado por node tools/fundamentos/indice.mjs a partir de data/fundamentos/<id>.js — no se edita a mano. */\n' +
  'window.SP_FUNDAMENTOS_INDICE = ' + JSON.stringify(indice, null, 1) + ';\n';
if (revisar) {
  const igual = existsSync(ARCHIVO) && readFileSync(ARCHIVO, 'utf8') === texto;
  console.log(igual ? 'El índice corresponde a las ' + Object.keys(indice).length + ' fichas.' : 'El índice no corresponde a las fichas: node tools/fundamentos/indice.mjs');
  process.exitCode = igual ? 0 : 1;
} else {
  writeFileSync(ARCHIVO, texto);
  console.log('Índice: ' + Object.keys(indice).length + ' fichas en data/fundamentos/indice.js');
}

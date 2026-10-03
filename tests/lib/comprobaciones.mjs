// SigmaPro — registro de las comprobaciones que no son casos contra R (código R, exportaciones, rendimiento,
// privacidad y uso sin conexión). Cada prueba deja aquí su resumen y el bloque 8 de la app lo muestra.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
//   guardar('exportar', { titulo, ok, resumen, renglones: [texto] })
//   → js/generado/comprobaciones.js  (window.SP_COMPROBACIONES = { clave: { …, fecha, motor } })

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVO = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'js', 'generado', 'comprobaciones.js');

export function leer() {
  if (!existsSync(ARCHIVO)) return {};
  const t = readFileSync(ARCHIVO, 'utf8');
  try { return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); } catch { return {}; }
}

export function guardar(clave, datos) {
  const todo = leer();
  todo[clave] = Object.assign({}, datos, { fecha: new Date().toISOString(), motor: 'node ' + process.version });
  writeFileSync(ARCHIVO, '/* Generado por las pruebas de tests/ (codigo-r, exportar, rendimiento, sin-conexion) — no editar a mano. */\n' +
    'window.SP_COMPROBACIONES = ' + JSON.stringify(todo, null, 1) + ';\n');
}

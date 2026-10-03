// SigmaPro — huella de un caso del motor R: SHA-256 del archivo del caso más el código que lo calcula (el puente con el
// motor, el registro y el archivo que define el método). Si cambia cualquiera de ellos, el resultado guardado de la
// última corrida en el navegador (tests/generado/motor-r.json) deja de valer y el caso queda sin aprobar hasta volver a
// correr node tests/motor-r.mjs.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const leer = p => readFileSync(p, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');

/** Devuelve huella(textoDelCaso, nombreDelMetodo) para la carpeta raíz de SigmaPro. */
export function huellero(raiz) {
  const comun = ['nucleo/motor-r.js', 'nucleo/registro.js'].map(f => leer(join(raiz, 'js', f))).join('\n');
  const metodos = readdirSync(join(raiz, 'js', 'metodos')).filter(f => f.endsWith('.js')).map(f => leer(join(raiz, 'js', 'metodos', f)));
  const archivoDe = new Map();
  return function huella(textoCaso, metodo) {
    if (!archivoDe.has(metodo)) archivoDe.set(metodo, metodos.find(t => t.includes("id: '" + metodo + "'")) || '');
    return createHash('sha256').update(textoCaso.replace(/\r\n/g, '\n')).update('\0').update(comun).update('\0').update(archivoDe.get(metodo)).digest('hex');
  };
}

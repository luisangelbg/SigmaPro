// SigmaPro — qué Rscript usan las pruebas que corren R.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// En orden: la variable SIGMAPRO_RSCRIPT, el Rscript del PATH y, en C:\Program Files\R, la versión con que se
// generaron las referencias (la que anota tests/r/sesion.txt), porque los paquetes de R se instalan por versión y una
// versión recién instalada llega sin ellos; si esa no está, la más nueva.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const SESION = join(dirname(fileURLToPath(import.meta.url)), '..', 'r', 'sesion.txt');

export function rscript() {
  if (process.env.SIGMAPRO_RSCRIPT) return process.env.SIGMAPRO_RSCRIPT;
  try { execFileSync('Rscript', ['--version'], { stdio: 'ignore' }); return 'Rscript'; } catch { /* no está en el PATH */ }
  const base = 'C:/Program Files/R';
  if (!existsSync(base)) return null;
  const versiones = readdirSync(base).filter(d => /^R-/.test(d)).sort();
  let referencia = null;
  try { const m = readFileSync(SESION, 'utf8').match(/R version (\d+\.\d+\.\d+)/); if (m) referencia = 'R-' + m[1]; } catch { /* sin sesión */ }
  const v = referencia && versiones.includes(referencia) ? referencia : versiones.pop();
  return v ? join(base, v, 'bin', 'Rscript.exe') : null;
}

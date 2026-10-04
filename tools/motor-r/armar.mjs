// SigmaPro — arma el repositorio propio del motor R (Hito 2.10): webR fijado y los paquetes de R que usan los métodos
// del motor, con su índice, sus huellas y (con --fuentes) el código fuente exacto de cada uno, como pide la GPL.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tools/motor-r/armar.mjs               descarga en motor-r/ lo que falte y verifica todo (unos 100 MB)
//       node tools/motor-r/armar.mjs --fuentes     además el código fuente de webR y de cada paquete (unos 150 MB más)
//       node tools/motor-r/armar.mjs --manifiesto  recalcula tools/motor-r/manifiesto.json desde el índice de webR
//
// La carpeta motor-r/ no va al repositorio de la app (pesa demasiado): este script la arma igual cada vez, porque el
// manifiesto fija la versión de cada archivo y su huella (MD5 del índice de webR para los paquetes, SHA-256 propio
// para todo). Servida por http(s) junto a la app (por ejemplo en GitHub Pages), la app la usa en lugar del
// repositorio público de webR y el servicio sin conexión la guarda: el motor R funciona sin internet. Con doble clic
// (file://) el navegador no deja leer archivos locales desde el hilo del motor: ahí sigue el repositorio público.
//
// Necesita node 18 o más y R (Rscript) para escribir el índice PACKAGES.rds, que es el que lee webR.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const DESTINO = join(RAIZ, 'motor-r');
const MANIFIESTO = join(AQUI, 'manifiesto.json');
const WEBR = '0.6.0', R_MENOR = '4.6';
const BASE_WEBR = `https://webr.r-wasm.org/v${WEBR}/`, BASE_REPO = 'https://repo.r-wasm.org/';
const CONTRIB = `bin/emscripten/contrib/${R_MENOR}/`;
/* los paquetes que piden los métodos del motor R (paquetes: [...] en js/metodos); el resto son sus dependencias */
const RAICES = ['lme4', 'lmerTest', 'nlme', 'car', 'emmeans', 'pbkrtest'];
/* los archivos de webR que se descargan al arrancar el motor e instalar los paquetes (medido con el navegador) */
const ARCHIVOS_WEBR = ['webr.mjs', 'webr-worker.js', 'R.js', 'R.wasm', 'libRblas.so', 'libRlapack.so',
  ...['parallel', 'tcltk', 'translations'].flatMap(p => [`vfs/usr/lib/R/library/${p}.data.gz`, `vfs/usr/lib/R/library/${p}.js.metadata`]),
  'vfs/usr/lib/R/library/translations/DESCRIPTION'];
const BASE_R = new Set(['R', 'base', 'stats', 'utils', 'methods', 'graphics', 'grDevices', 'grid', 'splines', 'tools', 'parallel', 'compiler', 'datasets', 'stats4', 'tcltk']);

const huella = (algo, b) => createHash(algo).update(b).digest('hex');
const mb = n => (n / 1048576).toFixed(1) + ' MB';
async function bajar(url) {
  for (let k = 0; k < 4; k++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { if (k === 3) throw e; await new Promise(o => setTimeout(o, 1500 * (k + 1))); }
  }
}
function leerDCF(txt) {
  const out = [];
  for (const bloque of txt.replace(/\r/g, '').split(/\n\n+/)) {
    const c = {}; let ult = null;
    for (const l of bloque.split('\n')) {
      if (/^\s/.test(l) && ult) c[ult] += '\n' + l;
      else { const m = l.match(/^([\w@/.-]+):\s*(.*)$/); if (m) { ult = m[1]; c[ult] = m[2]; } }
    }
    if (c.Package) out.push({ campos: c, texto: bloque.trim() });
  }
  return out;
}

/* lo bajado al calcular el manifiesto se guarda de una vez en motor-r/ (el armado después solo lo verifica) */
const guardar = (ruta, b) => { const destino = join(DESTINO, ruta); mkdirSync(dirname(destino), { recursive: true }); writeFileSync(destino, b); };

/* ---------------- --manifiesto: fija versiones y huellas ---------------- */
async function manifiesto() {
  console.log('Índice de paquetes de webR…');
  const indice = leerDCF((await bajar(BASE_REPO + CONTRIB + 'PACKAGES')).toString('utf8'));
  const pk = new Map(indice.map(x => [x.campos.Package, x]));
  const deps = c => ['Depends', 'Imports'].flatMap(k => (c[k] || '').split(',').map(s => s.trim().replace(/\s*\([^)]*\)/, '')).filter(Boolean));
  const visto = new Set(), cola = RAICES.slice();
  while (cola.length) {
    const n = cola.shift();
    if (BASE_R.has(n) || visto.has(n)) continue;
    const p = pk.get(n);
    if (!p) throw new Error('El índice de webR no tiene el paquete ' + n);
    visto.add(n);
    cola.push(...deps(p.campos));
  }
  const paquetes = [];
  for (const n of [...visto].sort((a, b) => a.localeCompare(b, 'en'))) {
    const { campos, texto } = pk.get(n), archivo = campos.File || `${n}_${campos.Version}.tgz`;
    const b = await bajar(BASE_REPO + CONTRIB + archivo);
    if (huella('md5', b) !== campos.MD5sum) throw new Error('MD5 distinto en ' + archivo);
    guardar(join('repo', CONTRIB, archivo), b);
    paquetes.push({ paquete: n, version: campos.Version, licencia: campos.License, archivo, bytes: b.length, md5: campos.MD5sum, sha256: huella('sha256', b),
      fuente: `${n}_${campos.Version}.tar.gz`, dcf: texto });
    console.log('  ' + n + ' ' + campos.Version + ' (' + mb(b.length) + ')');
  }
  const webr = [];
  for (const ruta of ARCHIVOS_WEBR) { const b = await bajar(BASE_WEBR + ruta); guardar(join('webr', ruta), b); webr.push({ ruta, bytes: b.length, sha256: huella('sha256', b) }); }
  const m = { webr: { version: WEBR, base: BASE_WEBR, fuente: `https://github.com/r-wasm/webr/archive/refs/tags/v${WEBR}.tar.gz`, licencia: 'GPL-3 (binarios de webR y de R) y MIT (scripts de webR)', archivos: webr },
    repo: { base: BASE_REPO, contrib: CONTRIB, fuentes: BASE_REPO + 'src/contrib/', raices: RAICES, paquetes },
    fecha: new Date().toISOString().slice(0, 10) };
  writeFileSync(MANIFIESTO, JSON.stringify(m, null, 1) + '\n');
  console.log(`Manifiesto: webR ${WEBR} (${webr.length} archivos, ${mb(webr.reduce((s, x) => s + x.bytes, 0))}) y ${paquetes.length} paquetes (${mb(paquetes.reduce((s, x) => s + x.bytes, 0))}).`);
}

/* ---------------- armar motor-r/ ---------------- */
async function armar(conFuentes) {
  const m = JSON.parse(readFileSync(MANIFIESTO, 'utf8'));
  let bajados = 0, verificados = 0;
  const poner = async (ruta, url, comprobar) => {
    const destino = join(DESTINO, ruta);
    if (existsSync(destino)) {
      const b = readFileSync(destino);
      if (!comprobar || comprobar(b)) { verificados++; return b; }
      console.log('  huella distinta, se vuelve a bajar: ' + ruta);
    }
    const b = await bajar(url);
    if (comprobar && !comprobar(b)) throw new Error('Huella distinta en ' + url);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, b);
    bajados++;
    return b;
  };
  console.log(`webR ${m.webr.version}…`);
  for (const a of m.webr.archivos) await poner('webr/' + a.ruta, m.webr.base + a.ruta, b => huella('sha256', b) === a.sha256);
  console.log(`${m.repo.paquetes.length} paquetes…`);
  for (const p of m.repo.paquetes) await poner('repo/' + m.repo.contrib + p.archivo, m.repo.base + m.repo.contrib + p.archivo, b => huella('md5', b) === p.md5 && huella('sha256', b) === p.sha256);
  /* el índice: PACKAGES con los bloques del manifiesto y PACKAGES.rds (el que lee webR) escrito por R */
  const dirRepo = join(DESTINO, 'repo', m.repo.contrib);
  writeFileSync(join(dirRepo, 'PACKAGES'), m.repo.paquetes.map(p => p.dcf).join('\n\n') + '\n');
  const rscript = [process.env.RSCRIPT, 'C:/Program Files/R/R-4.4.2/bin/Rscript.exe', '/usr/bin/Rscript', '/usr/local/bin/Rscript'].filter(Boolean).find(p => existsSync(p)) || 'Rscript';
  execFileSync(rscript, ['-e', 'd <- commandArgs(TRUE)[1]; db <- read.dcf(file.path(d, "PACKAGES")); saveRDS(db, file.path(d, "PACKAGES.rds"), compress = "xz")', dirRepo], { stdio: 'inherit' });
  if (conFuentes) {
    console.log('Fuentes…');
    await poner('fuentes/webr-' + m.webr.version + '.tar.gz', m.webr.fuente);
    for (const p of m.repo.paquetes) await poner('fuentes/' + p.fuente, m.repo.fuentes + p.fuente);
  }
  const lista = m.repo.paquetes.map(p => `| ${p.paquete} | ${p.version} | ${p.licencia.replace(/\|/g, '\\|')} |`).join('\n');
  writeFileSync(join(DESTINO, 'LEEME.md'), `# Repositorio propio del motor R de SigmaPro

Armado con \`node tools/motor-r/armar.mjs${conFuentes ? ' --fuentes' : ''}\` el ${new Date().toISOString().slice(0, 10)} desde el manifiesto del ${m.fecha}.

- \`webr/\`: webR ${m.webr.version} (${m.webr.licencia}); código fuente: ${m.webr.fuente}.
- \`repo/${m.repo.contrib}\`: los ${m.repo.paquetes.length} paquetes de R compilados para webR, con su índice.
- \`fuentes/\`${conFuentes ? '' : ' (no incluida en este armado; con --fuentes)'}: el código fuente exacto con que se compiló cada paquete (${m.repo.fuentes}).

Cada archivo se verificó contra la huella del manifiesto (SHA-256; MD5 del índice de webR en los paquetes).

| Paquete | Versión | Licencia |
|---|---|---|
${lista}
`);
  writeFileSync(join(DESTINO, 'listo.json'), JSON.stringify({ webr: m.webr.version, r: R_MENOR, paquetes: m.repo.paquetes.length, fuentes: !!conFuentes, manifiesto: m.fecha }) + '\n');
  const tam = d => { let s = 0; for (const a of m.webr.archivos) if (d === 'webr') s += a.bytes; for (const p of m.repo.paquetes) if (d === 'repo') s += p.bytes; return s; };
  console.log(`Listo: motor-r/ con webR (${mb(tam('webr'))}) y ${m.repo.paquetes.length} paquetes (${mb(tam('repo'))}); ${bajados} archivos bajados, ${verificados} ya estaban y se verificaron.`);
}

if (process.argv.includes('--manifiesto')) await manifiesto();
else await armar(process.argv.includes('--fuentes'));

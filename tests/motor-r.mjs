// SigmaPro — validación de los métodos del motor R (Fase 2), en un navegador real.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/motor-r.mjs [--solo <texto>]
//
// Abre la app por file:// en Edge o Chrome sin ventana, carga el motor R (webR, la versión fijada en
// js/nucleo/motor-r.js; necesita internet: el perfil es nuevo en cada corrida y lo descarga), corre cada caso de
// tests/casos/ cuyo método tiene motor: 'r' y lo compara contra la referencia del R de escritorio con el mismo
// criterio que los demás casos (tests/lib/comparar.js).
// Escribe tests/generado/motor-r.json con el resultado de cada caso, su huella (del caso y del código que lo calcula:
// tests/lib/huella-motor-r.mjs) y las
// versiones de webR, R y los paquetes. tests/correr.mjs lo integra al reporte de validación: un caso que cambió
// después de esta corrida queda sin aprobar hasta volver a correrla.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia, puertoLibre } from './lib/navegador.mjs';
import { huellero } from './lib/huella-motor-r.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const args = process.argv.slice(2);
const solo = args.includes('--solo') ? args[args.indexOf('--solo') + 1] : null;
const leer = p => readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome (variable SIGMAPRO_NAVEGADOR).'); process.exit(2); }

/* los casos, con su huella */
const dirCasos = join(TESTS, 'casos');
const casos = [], huella = huellero(RAIZ);
for (const d of readdirSync(dirCasos, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name).sort()) {
  for (const f of readdirSync(join(dirCasos, d)).filter(x => x.endsWith('.json')).sort()) {
    const texto = leer(join(dirCasos, d, f));
    const c = JSON.parse(texto);
    casos.push({ caso: c, huella: huella(texto, c.objetivo && c.objetivo.nombre) });
  }
}

const PUERTO = await puertoLibre();   // lo da el sistema: ver tests/lib/navegador.mjs
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-motor-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pend = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expr, seg) => {
  const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: (seg || 600) * 1000 });
  if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

let codigo = 1;
try {
  let d;
  for (let k = 0; k < 75 && !d; k++) { await dormir(200); try { d = await paginaPropia(PUERTO); } catch { /* arranca */ } }
  if (!d) throw new Error('El navegador no abrió su puerto de depuración.');
  ws = new WebSocket(d.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') consola.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) consola.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  };
  await enviar('Runtime.enable'); await enviar('Page.enable');
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b1' });
  for (let k = 0; k < 50; k++) { await dormir(200); try { if (await evaluar('!!(window.SP && SP.motorR && SP.ejecutarAsync)', 5)) break; } catch { /* cargando */ } }
  for (const s of ['comparar.js', 'validar.js']) await evaluar(leer(join(TESTS, 'lib', s)) + '\n;true');
  const deR = await evaluar('Object.values(SP.metodos).filter(m => m.motor === "r").map(m => m.id)');
  const elegidos = casos.filter(x => x.caso.objetivo && x.caso.objetivo.tipo === 'metodo' && deR.includes(x.caso.objetivo.nombre) && (!solo || x.caso.id.includes(solo)));
  console.log('\nSigmaPro · casos del motor R en el navegador (file://): ' + elegidos.length + ' casos de ' + deR.length + ' métodos');
  const t0 = Date.now();
  await evaluar('SP.motorR.iniciar().then(() => true)', 300);
  const est = await evaluar('SP.motorR.estado()');
  console.log('  motor: webR ' + est.version + ', ' + est.r + ' (cargado en ' + Math.round((Date.now() - t0) / 1000) + ' s)');
  const salida = {};
  let aprobados = 0, valores = 0, peor = 0;
  for (const x of elegidos) {
    const r = await evaluar('SPT.ejecutarCasoAsync(' + JSON.stringify(x.caso) + ', SP)', 900);
    salida[x.caso.id] = { huella: x.huella, aprobado: r.aprobado, valores: r.valores, difMax: r.difMax, difEscaladaMax: r.difEscaladaMax, peor: r.peor,
      fallas: (r.fallas || []).slice(0, 5), error: r.error || '', ms: r.ms, motor: r.motor };
    if (r.aprobado) aprobados++;
    valores += r.valores || 0;
    if (r.difEscaladaMax > peor) peor = r.difEscaladaMax;
    console.log('  ' + (r.aprobado ? '✓' : '✗') + ' ' + x.caso.id.padEnd(44) + String(r.valores).padStart(5) + ' valores · dif. máx. ' + (r.difEscaladaMax == null ? '—' : r.difEscaladaMax.toExponential(1)) + ' · ' + (r.ms / 1000).toFixed(1) + ' s');
    if (r.error) console.log('      ' + r.error);
    for (const f of r.fallas || []) console.log('      ' + f.ruta + ': ' + f.motivo + ' (obtenido ' + f.obtenido + ', esperado ' + f.esperado + ')');
  }
  const ua = await evaluar('navigator.userAgent');
  if (!solo) {
    mkdirSync(join(TESTS, 'generado'), { recursive: true });
    writeFileSync(join(TESTS, 'generado', 'motor-r.json'), JSON.stringify({ generado: new Date().toISOString(), webr: est.version, r: est.r,
      navegador: (ua.match(/Edg\/[\d.]+|Chrome\/[\d.]+/) || [''])[0], casos: salida }, null, 1) + '\n');
  } else console.log('  (con --solo no se guarda tests/generado/motor-r.json)');
  console.log('  ' + aprobados + ' de ' + elegidos.length + ' casos aprobados · ' + valores + ' valores · mayor diferencia escalada ' + peor.toExponential(1));
  if (consola.length) console.log('  Consola:\n    ' + consola.join('\n    '));
  codigo = aprobados === elegidos.length && !consola.length ? 0 : 1;
  console.log('\n' + (codigo ? 'HAY FALLAS' : 'TODO APROBADO') + (solo ? '' : ' · corre node tests/correr.mjs para integrarlo al reporte') + '\n');
} catch (e) { console.error('Error: ' + e.message); codigo = 1; } finally {
  try { ws && ws.close(); } catch { /* nada */ }
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  process.exit(codigo);
}

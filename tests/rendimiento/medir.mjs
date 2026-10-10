// SigmaPro — rendimiento con 100 000 filas, medido en un navegador real (Edge o Chrome sin ventana, por file://).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/rendimiento/medir.mjs            mide todo y compara con las metas
//       node tests/rendimiento/medir.mjs --json     además escribe tests/rendimiento/resultados.json
//       --avance        muestra cada medida al empezar y al terminar
//       --solo=Interfaz solo los grupos cuyo título empieza así (no guarda resultados)
//       --motor         mide también el motor R con 20 000 filas (necesita internet la primera vez)
//
// En node los cálculos son mucho más lentos que en la página (las búsquedas de globales dentro de vm), así que se mide
// donde corre la app. Cada método se mide como lo usa la app (SP.ejecutar + reporte): la primera vez (en frío) y la
// mediana de tres veces más. La meta se compara con la primera vez, que es la que vive quien usa la app.
// Las metas de PROPUESTA.md §5.4 (descriptivos, una vía + Tukey, factorial de tres factores) van marcadas con «plan».

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia, puertoLibre } from '../lib/navegador.mjs';
import { guardar } from '../lib/comprobaciones.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome (variable SIGMAPRO_NAVEGADOR).'); process.exit(2); }
const PUERTO = await puertoLibre();   // lo da el sistema: ver tests/lib/navegador.mjs
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-rend-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pend = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 900000 }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

/* lo que corre en la página */
const PAGINA = readFileSync(join(AQUI, 'pagina.js'), 'utf8');

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
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'info' && /^\[(medida|inicio)\]/.test(String(m.params.args[0] && m.params.args[0].value))) { if (process.argv.includes('--avance')) console.log('  … ' + m.params.args[0].value); }
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consola.push('error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  };
  await enviar('Runtime.enable'); await enviar('Page.enable');
  await enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b1' });
  for (let k = 0; k < 50; k++) { await dormir(200); if (await evaluar('!!(window.SP && SP.app && SP.app.exportar && SP.datosUI && document.documentElement.hasAttribute("data-sp-listo"))')) break; }
  const t0 = Date.now();
  const solo = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7);
  if (solo) await evaluar('window.__soloGrupo = ' + JSON.stringify(solo));
  if (process.argv.includes('--motor')) await evaluar('window.__motor = true');
  const r = JSON.parse(await evaluar(PAGINA));
  const ua = await evaluar('navigator.userAgent');
  const fmt = x => (x >= 1000 ? (x / 1000).toFixed(2) + ' s' : Math.round(x) + ' ms');
  console.log('\nSigmaPro · rendimiento con ' + r.n.toLocaleString('es-MX') + ' filas (' + (ua.match(/Edg\/[\d.]+|Chrome\/[\d.]+/) || [''])[0] + ', file://; ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s en total)\n');
  let fallas = 0;
  for (const g of r.grupos) {
    console.log('  ' + g.titulo);
    for (const x of g.medidas) {
      const ok = !(x.primera > x.meta);
      if (!ok) fallas++;
      console.log('    ' + (ok ? '✓' : '✗') + ' ' + x.nombre.padEnd(52) + fmt(x.primera).padStart(9) + (x.mediana !== undefined ? ('  (después ' + fmt(x.mediana) + ')').padEnd(20) : ''.padEnd(20)) + ' meta ' + fmt(x.meta) + (x.plan ? ' (plan)' : '') + (x.nota ? '  · ' + x.nota : ''));
    }
  }
  const todas = r.grupos.flatMap(g => g.medidas), dentro = todas.filter(x => !(x.primera > x.meta)).length;
  const plan = todas.filter(x => x.plan).map(x => x.nombre + ': ' + fmt(x.primera) + ' (meta ' + fmt(x.meta) + ')');
  if (!solo) guardar('rendimiento', { titulo: 'Rendimiento con ' + r.n.toLocaleString('es-MX') + ' filas', ok: !fallas,
    /* sin nombres comerciales en lo que muestra la app: el motor del navegador, que es libre */
    resumen: dentro + ' de ' + todas.length + ' medidas dentro de su meta, en ' + ((ua.match(/Chrome\/([\d.]+)/) || [])[1] ? 'un navegador Chromium ' + ua.match(/Chrome\/([\d.]+)/)[1] : 'el navegador') + '. Las metas del plan: ' + plan.join('; ') + '.',
    renglones: todas.map(x => x.nombre + ': ' + fmt(x.primera) + (x.mediana !== undefined ? ' (después ' + fmt(x.mediana) + ')' : '') + ' · meta ' + fmt(x.meta)) });
  if (!solo && process.argv.includes('--json')) writeFileSync(join(AQUI, 'resultados.json'), JSON.stringify(Object.assign({ fecha: new Date().toISOString(), navegador: ua }, r), null, 1));
  if (consola.length) { console.log('\nConsola:\n  ' + consola.join('\n  ')); fallas++; }
  console.log(fallas ? '\n' + fallas + ' FUERA DE META' : '\nTODO DENTRO DE LAS METAS');
  codigo = fallas ? 1 : 0;
} catch (e) { console.error(e); codigo = 1; } finally {
  try { ws && ws.close(); } catch { /* nada */ }
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  process.exit(codigo);
}

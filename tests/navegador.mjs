// SigmaPro — corre las pruebas (o revisa la app) en un navegador real sin ventana.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/navegador.mjs            tests/index.html por file:// (como el doble clic)
//       node tests/navegador.mjs --app      index.html: errores de consola y bloque de validación
//
// Usa Edge o Chrome instalados y su protocolo de depuración (sin dependencias). El perfil
// temporal del navegador se borra al terminar.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from './lib/navegador.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const modoApp = process.argv.includes('--app');
const PUERTO = 9420 + Math.floor(Math.random() * 60);

const candidatos = [
  process.env.SIGMAPRO_NAVEGADOR,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const exe = candidatos.find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome. Indica la ruta en la variable SIGMAPRO_NAVEGADOR.'); process.exit(2); }

const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-nav-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pendientes = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pendientes.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r && r.result ? r.result.value : undefined; };

let codigo = 1;
try {
  let destino;
  for (let k = 0; k < 75 && !destino; k++) {
    await dormir(200);
    try { destino = await paginaPropia(PUERTO); } catch { /* aún arranca */ }
  }
  if (!destino) throw new Error('El navegador no abrió su puerto de depuración.');
  ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') consola.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) consola.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') consola.push('registro: ' + m.params.entry.text + (m.params.entry.url ? ' (' + m.params.entry.url + ')' : ''));
  };
  await enviar('Runtime.enable'); await enviar('Log.enable'); await enviar('Page.enable');

  if (!modoApp) {
    await enviar('Page.navigate', { url: pathToFileURL(join(TESTS, 'index.html')).href });
    let r;
    for (let k = 0; k < 300 && !r; k++) { await dormir(200); r = await evaluar('window.__resultado || null'); }
    if (!r) throw new Error('La página de pruebas no terminó en 60 s.');
    const ua = await evaluar('navigator.userAgent');
    console.log('\nSigmaPro · pruebas en el navegador (' + (ua.match(/Edg\/[\d.]+|Chrome\/[\d.]+/) || [''])[0] + ', file://)');
    if (r.error) console.log('  error: ' + r.error);
    else {
      console.log('  Pruebas unitarias: ' + r.unidad.aprobadas + ' aprobadas, ' + r.unidad.fallidas + ' con falla, ' + r.unidad.omitidas + ' solo en node');
      for (const d of r.unidad.detalles) if (!d.ok) console.log('    ✗ ' + d.suite + ' › ' + d.caso + ': ' + d.error);
      console.log('  Casos contra R: ' + r.casos.aprobados + ' de ' + r.casos.casos + ' aprobados, ' + r.casos.valores + ' valores, dif. máx. ' + r.casos.difEscaladaMax);
      for (const c of r.detallesCasos) if (!c.aprobado) console.log('    ✗ ' + c.id + ' ' + (c.error || ''));
    }
    codigo = r.ok && !consola.length ? 0 : 1;
  } else {
    await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b8' });
    await dormir(2500);
    const info = await evaluar(`(() => {
      const t = document.querySelector('#valTabla tbody');
      return {
        titulo: document.title,
        bloque: (document.querySelector('.step-panel.active') || {}).id,
        filas: t ? t.querySelectorAll('tr:not(.grupo):not(.detalle)').length : 0,
        validacion: !!window.SP_VALIDACION && !!window.SP_VALIDACION_RESUMEN,
        navegador: !!(window.LABGNavigator && window.LABGNavigator.version),
        estudio: !!window.LABGFigureStudio || !!window.LABGFS || !!document.querySelector('[data-lfs]'),
        ancho: document.documentElement.scrollWidth, vista: innerWidth,
      };
    })()`);
    console.log('\nSigmaPro · revisión de la app (file://)');
    console.log('  ' + JSON.stringify(info));
    codigo = info && info.validacion && info.filas > 0 && info.bloque === 'panel-8' && !consola.length ? 0 : 1;
  }
  if (consola.length) { console.log('  Consola con problemas:'); for (const c of consola) console.log('    ' + c); }
  console.log('\n' + (codigo === 0 ? 'TODO APROBADO' : 'HAY FALLAS') + '\n');
} catch (e) {
  console.error('Error: ' + e.message);
} finally {
  try { ws && ws.close(); } catch { /* nada */ }
  /* en Windows, el árbol completo: los procesos hijos del navegador retienen el perfil */
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  /* el navegador tarda en soltar su perfil temporal: se reintenta unos segundos para no dejarlo en %TEMP% */
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  process.exit(codigo);
}

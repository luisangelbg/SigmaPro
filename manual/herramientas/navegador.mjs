// SigmaPro — manual: el navegador sin ventana que usan las herramientas del manual (capturas, huecos, PDF).
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
//   const n = await abrir({ ancho, alto, escala });   n.ir(url) · n.evaluar(expr) · n.png(recorte) · n.pdf() · n.cerrar()
// Usa Edge o Chrome con las mismas banderas que las pruebas (tests/lib/navegador.mjs) y un perfil temporal que se
// borra al cerrar.
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BANDERAS, paginaPropia } from '../../tests/lib/navegador.mjs';

const dormir = ms => new Promise(r => setTimeout(r, ms));
const EXE = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));

export async function abrir({ ancho = 1400, alto = 900, escala = 2 } = {}) {
  if (!EXE) throw new Error('Hace falta Edge o Chrome.');
  /* El puerto de depuración lo asigna el sistema (puerto 0) y se lee del archivo que el navegador deja en su perfil.
     Con un puerto elegido al azar, si otro navegador sin ventana ya lo tenía (el de las pruebas de otra app), este no
     podía abrirlo y la herramienta terminaba manejando el navegador ajeno: la captura salía con la pantalla de otra
     app. */
  const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-manual-'));
  const nav = spawn(EXE, [...BANDERAS, '--remote-debugging-port=0', '--user-data-dir=' + perfil, '--force-color-profile=srgb', 'about:blank'], { stdio: 'ignore' });
  let destino, puerto = 0;
  for (let k = 0; k < 75 && !destino; k++) {
    await dormir(200);
    try {
      if (!puerto) puerto = +readFileSync(join(perfil, 'DevToolsActivePort'), 'utf8').split('\n')[0] || 0;
      if (puerto) destino = await paginaPropia(puerto);
    } catch { /* arranca */ }
  }
  if (!destino) { nav.kill(); throw new Error('El navegador no abrió su puerto de depuración.'); }
  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const pend = new Map(), consola = [];
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') consola.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) consola.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  };
  const enviar = (method, params = {}) => new Promise(ok => { const i = ++id; pend.set(i, ok); ws.send(JSON.stringify({ id: i, method, params })); });
  await enviar('Runtime.enable'); await enviar('Page.enable');
  await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: escala, mobile: false });
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  const evaluar = async (expr, segundos = 120) => {
    const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: segundos * 1000 });
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  return {
    consola,
    enviar,
    evaluar,
    async ir(url, listo, segundos = 20) {
      await enviar('Page.navigate', { url });
      for (let k = 0; k < segundos * 5; k++) { await dormir(200); try { if (await evaluar(listo || 'document.readyState === "complete"')) return true; } catch { /* carga */ } }
      return false;
    },
    /** PNG de la vista, o del recorte { x, y, ancho, alto } en píxeles de la página (a la escala pedida). Con fuera,
        el recorte sale de la vista visible: el navegador la agranda para tomarlo (y puede reacomodar la página). */
    async png(recorte, fuera) {
      const p = { format: 'png', captureBeyondViewport: !!(recorte && fuera) };
      if (recorte) p.clip = { x: recorte.x, y: recorte.y, width: recorte.ancho, height: recorte.alto, scale: 1 };
      const r = await enviar('Page.captureScreenshot', p);
      return Buffer.from(r.result.data, 'base64');
    },
    async pdf() {
      const r = await enviar('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, transferMode: 'ReturnAsBase64' });
      return Buffer.from(r.result.data, 'base64');
    },
    async cerrar() {
      try { ws.close(); } catch { /* nada */ }
      nav.kill();
      if (process.platform === 'win32') {
        const clave = perfil.split(/[\\/]/).pop();
        try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
      }
      for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
    },
  };
}

/** Sirve la carpeta de la app por http (127.0.0.1, puerto libre), como la prueba sin conexión: así el motor R sale de
    motor-r/ y no de internet. Devuelve { origen, cerrar() }. */
export async function servir(raiz) {
  const { createServer } = await import('node:http');
  const { readFile } = await import('node:fs/promises');
  const { extname, normalize } = await import('node:path');
  const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.wasm': 'application/wasm', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const base = normalize(raiz);
  const s = createServer(async (q, r) => {
    try {
      let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = normalize(join(base, p));
      if (!f.startsWith(base)) throw new Error('fuera');
      const d = await readFile(f);
      r.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      r.end(d);
    } catch { r.writeHead(404); r.end(); }
  });
  await new Promise(ok => s.listen(0, '127.0.0.1', ok));
  return { origen: 'http://127.0.0.1:' + s.address().port, cerrar: () => new Promise(ok => s.close(ok)) };
}

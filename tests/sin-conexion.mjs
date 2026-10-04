// SigmaPro — privacidad y uso sin conexión, en un navegador real.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/sin-conexion.mjs
//
// 1. Privacidad: sirve la app por http (un servidor propio, en este proceso), la abre en un navegador sin ventana y
//    registra cada petición de red mientras se cargan datos, se calculan análisis de todas las familias, se arma el
//    reporte y se exportan .docx, hoja de cálculo, figuras y proyecto. Aprueba si ninguna petición sale del propio
//    origen, si todas son GET de archivos de la app y si ninguna lleva datos (cuerpo, parámetros).
//    También con doble clic (file://): ninguna petición fuera de file://.
//    Sin excepciones para las letras: desde el navegador 1.1.2 y el estudio de figuras 1.5.1 los módulos comunes usan
//    las del sistema; una petición de letras al portal (.woff2) cuenta como salida del equipo y hace fallar la prueba.
//    Con un método del motor R (Fase 2) se registran también las peticiones de su hilo: solo pueden ser descargas de
//    código (GET sin parámetros ni cuerpo) de webR fijado y de su repositorio de paquetes.
// 2. Sin conexión: comprueba que el servicio (sw.js) quedó activo, apaga el servidor, recarga la página y vuelve a
//    cargar datos, calcular y exportar sin red (sin el motor R, que sin conexión llega al cierre de la Fase 2).

import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from './lib/navegador.mjs';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(2); }

/* servidor propio: solo la carpeta de la app */
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const servidas = [];
const servidor = createServer(async (q, r) => {
  servidas.push(q.method + ' ' + q.url);
  try {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(RAIZ, p));
    if (!f.startsWith(RAIZ)) throw new Error('fuera');
    const d = await readFile(f);
    r.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    r.end(d);
  } catch { r.writeHead(404); r.end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
const ORIGEN = 'http://127.0.0.1:' + servidor.address().port;

const PUERTO = 9560 + Math.floor(Math.random() * 40);
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-red-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pend = new Map(), consola = [], peticiones = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 300000 }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const MOTOR_R = /^https:\/\/(webr\.r-wasm\.org\/v0\.6\.0\/|repo\.r-wasm\.org\/)[^?#]*$/;
/* webR pide sus archivos con GET y a veces solo comprueba que existan (HEAD): ninguno lleva cuerpo ni parámetros */
const esMotorR = p => MOTOR_R.test(p.url) && (p.metodo === 'GET' || p.metodo === 'HEAD') && !p.cuerpo;
/* el descargador de webR lee el encabezado Content-Encoding de su propio servidor, que no lo expone: el navegador lo
   anota en su registro; no viene de SigmaPro ni afecta el cálculo */
const ESPERADO = /Refused to get unsafe header "Content-Encoding"/;
const esperarApp = async () => { for (let k = 0; k < 75; k++) { await dormir(200); try { if (await evaluar('!!(window.SP && SP.app && SP.app.exportar && SP.datosUI && document.readyState === "complete")')) return true; } catch { /* recargando */ } } return false; };

/* el uso: datos, análisis de cada familia (y el modelo mixto del motor R, si se pide), reporte, figuras y exportaciones */
const USO = conMotorR => `(async () => {
  const ej = window.SP_EJEMPLOS.find(x => x.id === 'maiz');
  const l = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
  SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: ej.tipos }), 'Ejemplo: maíz');
  const A = SP.app.analisis, R = SP.app.reporte, espera = ms => new Promise(r => setTimeout(r, ms));
  SP.app.ir(3); SP.app.explorar.tipo = 'desc'; SP.app.explorar.calcular();
  SP.app.ir(4);
  for (const [m, e, op] of [['supuestos', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}],
    ['dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}],
    ['comparaciones-medias', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, { metodo: 'tukey' }],
    ['regresion-polinomial', { respuesta: 'rend', predictores: 'dosis' }, { grado: 2 }], ['kruskal-wallis', { respuesta: 'rend', tratamiento: 'hibrido' }, {}],
    ['correlacion', { x: 'dosis', y: 'rend' }, {}], ['modelo-lineal', { respuesta: 'rend' }, { derecha: 'bloque + hibrido * dosis', comoFactor: ['dosis'] }]]) {
    A.usar(m, e, op); await espera(150);
    if (m !== 'supuestos') R.agregar({ metodo: m, e, op });
  }
  if (${conMotorR ? 'true' : 'false'}) {
    const em = { respuesta: 'rend' }, om = { derecha: 'hibrido * dosis + (1 | bloque)', comoFactor: ['dosis'] };
    A.motorAceptado = true; A.usar('modelo-mixto', em, om);
    for (let k = 0; k < 480; k++) { await espera(250); const r = document.querySelector('#anaResultado'); if (r && !r.classList.contains('calculando') && (r.querySelector('.exp-cabeza h3') || r.querySelector('.msg-error'))) break; }
    if (document.querySelector('#anaResultado .msg-error')) throw new Error('modelo mixto: ' + document.querySelector('#anaResultado .msg-error').textContent);
    R.agregar({ metodo: 'modelo-mixto', e: em, op: om });
  }
  A.ponerModo('asistente'); await espera(100); A.ponerModo('constructor'); await espera(100);
  SP.app.ir(5); await espera(300); SP.app.ir(6); await espera(300); SP.app.ir(7);
  const C = SP.app.exportar.construir, tam = {};
  for (const k of ['docx', 'html', 'xlsx', 'latex', 'figuras', 'proyecto']) { const r = await C[k](true); tam[k] = (r.datos.length || r.datos.size || 0); }
  const p = SP.proyecto.abrir((await C.proyecto()).datos);
  return JSON.stringify({ analisis: R.items.length, tam, huellas: p.verificacion.ok, version: SP.VERSION, motor: SP.motorR ? SP.motorR.estado().r : '' });
})()`;

let codigo = 1;
const fallas = [];
try {
  let d;
  for (let k = 0; k < 75 && !d; k++) { await dormir(200); try { d = await paginaPropia(PUERTO); } catch { /* arranca */ } }
  if (!d) throw new Error('El navegador no abrió su puerto de depuración.');
  ws = new WebSocket(d.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
    else if (m.method === 'Network.requestWillBeSent') { const q = m.params.request; peticiones.push({ url: q.url, metodo: q.method, cuerpo: !!(q.hasPostData || q.postData), tipo: m.params.type, hilo: !!m.sessionId }); }
    else if (m.method === 'Target.attachedToTarget') {
      /* el hilo del motor R (y los que abra): se registran sus peticiones antes de que empiece */
      const sid = m.params.sessionId, a = (method, params) => ws.send(JSON.stringify({ id: ++id, sessionId: sid, method, params: params || {} }));
      a('Network.enable'); a('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }); a('Runtime.runIfWaitingForDebugger');
    }
    else if (m.method === 'Runtime.exceptionThrown') consola.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consola.push('error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !ESPERADO.test(m.params.entry.text)) consola.push('registro: ' + m.params.entry.text);
  };
  await enviar('Runtime.enable'); await enviar('Page.enable'); await enviar('Network.enable'); await enviar('Log.enable');
  await enviar('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
  await enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

  /* ---- 1a. privacidad con doble clic (file://) ---- */
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b1' });
  if (!(await esperarApp())) throw new Error('La app no abrió por file://');
  const usoArchivo = JSON.parse(await evaluar(USO(true)));
  const motorArchivo = peticiones.filter(esMotorR).length;
  const fueraArchivo = peticiones.filter(p => !/^(file|data|blob):/.test(p.url) && !esMotorR(p));
  if (!motorArchivo) fallas.push('file://: el motor R no descargó nada (¿se usó el modelo mixto?)');
  if (fueraArchivo.length) fallas.push('file://: ' + fueraArchivo.length + ' peticiones fuera del equipo: ' + fueraArchivo.slice(0, 3).map(p => p.metodo + ' ' + p.url).join(', '));
  const nArchivo = peticiones.length;
  peticiones.length = 0;

  /* ---- 1b. privacidad servida por http ---- */
  await enviar('Page.navigate', { url: ORIGEN + '/index.html#b1' });
  if (!(await esperarApp())) throw new Error('La app no abrió por http');
  const uso = JSON.parse(await evaluar(USO(true)));
  const motorHttp = peticiones.filter(esMotorR).length;
  const http = peticiones.filter(p => /^https?:/.test(p.url) && !esMotorR(p));
  const ajenas = http.filter(p => !p.url.startsWith(ORIGEN + '/'));
  const noGet = http.filter(p => p.metodo !== 'GET' || p.cuerpo);
  const conDatos = http.filter(p => /\?/.test(p.url.replace(/#.*$/, '')));
  if (ajenas.length) fallas.push('http: peticiones a otro origen: ' + ajenas.slice(0, 5).map(p => p.url).join(', '));
  if (noGet.length) fallas.push('http: peticiones que envían algo: ' + noGet.slice(0, 5).map(p => p.metodo + ' ' + p.url).join(', '));
  if (conDatos.length) fallas.push('http: peticiones con parámetros: ' + conDatos.slice(0, 5).map(p => p.url).join(', '));
  const archivosApp = [...new Set(http.map(p => new URL(p.url).pathname))];

  /* ---- 2. sin conexión ---- */
  let activo = false;
  for (let k = 0; k < 40 && !activo; k++) { await dormir(250); activo = await evaluar('!!(navigator.serviceWorker && navigator.serviceWorker.controller) || (SP.app.sinConexion && !!SP.app.sinConexion.active)'); }
  if (!activo) fallas.push('el servicio sin conexión no quedó activo');
  /* una recarga con el servicio controlando la página, para que guarde lo que la app pide después */
  await enviar('Page.reload', { ignoreCache: false }); await esperarApp(); await dormir(800);
  const guardados = await evaluar("caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sigmapro-')).map(k => caches.open(k).then(c => c.keys())))).then(ls => ls.flat().length)");
  /* el navegador mantiene conexiones abiertas: se cierran todas antes de apagar el servidor */
  const apagado = new Promise(ok => servidor.close(ok));
  if (servidor.closeAllConnections) servidor.closeAllConnections();
  await apagado;
  await enviar('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const antes = servidas.length;
  peticiones.length = 0;
  await enviar('Page.navigate', { url: ORIGEN + '/index.html#b1' });
  const abrio = await esperarApp();
  let usoSin = null;
  if (!abrio) fallas.push('sin conexión: la app no abrió');
  else usoSin = JSON.parse(await evaluar(USO(false)));
  if (usoSin && (!usoSin.huellas || usoSin.analisis !== uso.analisis - 1)) fallas.push('sin conexión: el uso no dio lo mismo');
  if (servidas.length !== antes) fallas.push('sin conexión: el servidor apagado recibió peticiones');

  console.log('\nSigmaPro · privacidad y uso sin conexión');
  console.log('  doble clic (file://): ' + nArchivo + ' peticiones; fuera del equipo solo ' + motorArchivo + ' descargas del motor R (código, sin datos); ' + usoArchivo.analisis + ' análisis (uno en ' + usoArchivo.motor + '), reporte y 6 exportaciones');
  console.log('  servida por http: ' + http.length + ' peticiones, todas GET sin datos a ' + archivosApp.length + ' archivos de la propia app; fuera del origen solo ' + motorHttp + ' descargas del motor R');
  console.log('  servicio sin conexión: ' + (activo ? 'activo' : 'NO activo') + ', ' + guardados + ' archivos guardados');
  console.log('  sin red y con el servidor apagado: ' + (usoSin ? 'abre, carga datos, calcula ' + usoSin.analisis + ' análisis, arma el reporte, exporta y verifica las huellas del proyecto' : 'no abrió'));
  if (consola.length) fallas.push(...consola.map(x => 'consola: ' + x));
  guardar('sin-conexion', { titulo: 'Privacidad y uso sin conexión', ok: !fallas.length,
    resumen: 'Con datos, ' + uso.analisis + ' análisis, reporte y seis exportaciones, ningún dato salió del navegador: servida por http, ' + http.length + ' peticiones GET sin datos, todas a la propia app; fuera del equipo o del origen solo se pide el código del motor R para el modelo mixto (' + Math.max(motorArchivo, motorHttp) + ' descargas de webR y sus paquetes), todo con GET sin datos ni parámetros, también desde el hilo del motor. Sin red y con el servidor apagado, la app abre, calcula los análisis del núcleo, exporta y verifica las huellas del proyecto.',
    renglones: ['Doble clic: ' + nArchivo + ' peticiones; fuera del equipo, solo ' + motorArchivo + ' descargas del motor R (webR y paquetes).', 'Servida por http: ' + http.length + ' peticiones GET a ' + archivosApp.length + ' archivos de la app, sin parámetros ni cuerpo.', 'Servicio sin conexión activo con ' + guardados + ' archivos guardados.', 'Sin red: ' + (usoSin ? usoSin.analisis + ' análisis, reporte, 6 exportaciones y huellas del proyecto verificadas.' : 'no abrió.')] });
  if (fallas.length) { console.log('\nFALLAS:'); fallas.forEach(f => console.log('  ✗ ' + f)); } else console.log('\nTODO APROBADO');
  codigo = fallas.length ? 1 : 0;
} catch (e) { console.error(e); codigo = 1; } finally {
  try { ws && ws.close(); } catch { /* nada */ }
  try { servidor.close(); } catch { /* ya cerrado */ }
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  process.exit(codigo);
}

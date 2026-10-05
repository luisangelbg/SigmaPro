// SigmaPro — auditoría de accesibilidad (AA) de todos los bloques, en claro y oscuro, a 1280 y 360 px.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/accesibilidad/auditar.mjs            todo
//       node tests/accesibilidad/auditar.mjs cmp        solo los escenarios cuyo nombre contiene «cmp»
//
// 1. Cada escenario de escenarios.json (datos cargados, un análisis, un diálogo, el reporte…) pasa por el auditor de la
//    suite (LABG-Design/labg-audit.ps1, en la carpeta vecina de SigmaPro o en SIGMAPRO_AUDITOR) con la medición de
//    medicion.js: nombres accesibles, imágenes sin alt, ids repetidos, campos sin etiqueta, contraste AA de todo el texto
//    visible en claro y en oscuro, desborde lateral, Alt+→ y Alt+← entre bloques y el diálogo de atajos con «?».
//    Sin el auditor (o fuera de Windows) esta parte se omite y se avisa.
// 2. El foco con el teclado de verdad: recorre los 10 bloques con Tab (eventos de teclado del navegador, no simulados
//    en la página) y revisa que cada elemento enfocado muestre su anillo. El auditor enfoca por programa después de
//    clics, y ahí el navegador no aplica :focus-visible, así que este recorrido es el que cuenta para el foco.

import { execFile, spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from '../lib/navegador.mjs';
import { guardar } from '../lib/comprobaciones.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..', '..');
/* SIGMAPRO_AA_IDIOMA=en: la misma auditoría con la interfaz en inglés (los textos cambian de largo) */
const URL_APP = pathToFileURL(join(RAIZ, 'index.html')).href + (process.env.SIGMAPRO_AA_IDIOMA === 'en' ? '?lang=en' : '') + '#b1';
const AUDITOR = [process.env.SIGMAPRO_AUDITOR, join(RAIZ, '..', 'LABG-Design', 'labg-audit.ps1')].filter(Boolean).find(p => existsSync(p));
const filtro = process.argv[2] || '';
const ESC = JSON.parse(readFileSync(join(AQUI, 'escenarios.json'), 'utf8'));
const MEDICION = readFileSync(join(AQUI, 'medicion.js'), 'utf8');
const GUARDA = 'window.SP && SP.app && SP.app.ir && SP.datosUI && SP.app.analisis && SP.app.reporte && !window.__prep';
const dormir = ms => new Promise(r => setTimeout(r, ms));
const fallas = [], avisos = [];
let corridas = 0, textos = 0;

/* ---------------- 1. el auditor de la suite ---------------- */
if (AUDITOR && process.platform === 'win32') {
  const tmp = mkdtempSync(join(tmpdir(), 'sigmapro-aa-'));
  const tareas = [];
  for (const [nombre, e] of Object.entries(ESC)) if (nombre.includes(filtro)) for (const ancho of [1280, 360]) tareas.push({ nombre, e, ancho });
  /* Antes de abrir otro navegador en el mismo puerto: que el anterior haya soltado su perfil (labg-audit-headless-<puerto>).
     Si el perfil sigue en uso, el navegador nuevo se entrega al viejo, que el auditor está cerrando, y la corrida falla
     sin salida (se alternaban una buena y una mala). Se espera hasta 20 s a poder borrarlo. */
  const soltarPerfil = async puerto => {
    const perfil = join(tmpdir(), 'labg-audit-headless-' + puerto);
    for (let k = 0; k < 40 && existsSync(perfil); k++) {
      try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ }
      if (existsSync(perfil)) await dormir(500);
    }
  };
  const correr1 = (t, puerto) => new Promise(ok => {
    const archivo = join(tmp, t.nombre + '.js');
    /* Antes de preparar: el bloque Análisis en el modo Catálogo (desde el Hito 1.10 abre en el Asistente; los escenarios
       del asistente y del constructor cambian de modo ellos mismos) y un registro de errores: los de la preparación y los
       de la página cuentan como falla (el auditor de la suite no escucha la consola).
       Una preparación asíncrona (espera: true) pone window.__esperando mientras termina: hasta entonces no se mide. */
    const antes = "(window.__errores = [], addEventListener('error', ev => window.__errores.push(String(ev.message))), " +
      "addEventListener('unhandledrejection', ev => window.__errores.push(String(ev.reason && ev.reason.message || ev.reason))), SP.app.analisis.modo = 'catalogo')";
    const prep = '(() => { try { const r = (' + t.e.prep + '); if (r && typeof r.catch === "function") r.catch(e => { window.__errorPrep = String(e && e.message || e); window.__esperando = false; }); } catch (e) { window.__errorPrep = String(e && e.message || e); window.__esperando = false; } })()';
    writeFileSync(archivo, `(${GUARDA} ? (window.__prep = 1, window.__auditT0 = 0, ${antes}, ${prep}, null) : window.__esperando ? null : ` + MEDICION);
    execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', AUDITOR, '-Url', URL_APP, '-EvalFile', archivo, '-Width', String(t.ancho), '-Port', String(puerto), '-Timeout', t.e.espera ? '180' : '120'],
      { maxBuffer: 1 << 24, timeout: 300000 }, (err, out, errores) => ok(String(out || '') ||
        String(err && err.message).split('\n')[0].slice(0, 80) + ' … ' + String(errores || '').trim().split('\n').slice(-3).join(' ')));
  });
  /* una corrida sin salida legible se repite una vez (el navegador pudo tardar en abrir con el equipo cargado) */
  const correr = async (t, puerto) => {
    await soltarPerfil(puerto);
    let salida = await correr1(t, puerto);
    if (!/^\s*\{/m.test(salida)) { await dormir(2000); await soltarPerfil(puerto); salida = await correr1(t, puerto); }
    await soltarPerfil(puerto);
    return salida;
  };
  /* los escenarios del motor R (espera: true) descargan R y sus paquetes en cada perfil nuevo: tres a la vez se agotan
     (la medición no termina en 180 s); los corre un solo auditor, uno tras otro, y los demás se reparten */
  const lentas = tareas.filter(t => t.e.espera), rapidas = tareas.filter(t => !t.e.espera);
  let il = 0, ir = 0;
  const siguiente = conLentas => (conLentas && il < lentas.length ? lentas[il++] : ir < rapidas.length ? rapidas[ir++] : conLentas || lentas.length === 0 ? null : undefined);
  const trabajador = async (puerto, k) => {
    for (let t = siguiente(k === 0); t; t = siguiente(k === 0)) {
      const salida = await correr(t, puerto), mal = [];
      try {
        const j = JSON.parse(salida.trim().split('\n').pop());
        if (j.result === 'SIN RESULTADO') mal.push('la medición no terminó');
        else {
          const R = JSON.parse(j.result);
          corridas++; textos += R.contrastLight.checked + R.contrastDark.checked;
          if (j.errors.length) mal.push('consola: ' + j.errors.slice(0, 2).join(' | '));
          if (R.errorPrep) mal.push('la preparación falló: ' + R.errorPrep);
          if (R.erroresPagina && R.erroresPagina.length) mal.push('errores en la página: ' + R.erroresPagina.join(' | '));
          if (R.errorAnalisis && !t.e.error) mal.push('el análisis terminó en error: ' + R.errorAnalisis);
          if (R.noName.length) mal.push('botones o enlaces sin nombre: ' + R.noName.join(' '));
          if (R.noAlt) mal.push(R.noAlt + ' imágenes sin alt');
          if (R.dupIds.length) mal.push('ids repetidos: ' + R.dupIds.join(' '));
          if (R.noLabel.length) mal.push('campos sin etiqueta: ' + R.noLabel.join(' '));
          if (R.contrastLight.nBad) mal.push('contraste en claro (' + R.contrastLight.nBad + '): ' + R.contrastLight.bad.slice(0, 2).join(' ; '));
          if (R.contrastDark.nBad) mal.push('contraste en oscuro (' + R.contrastDark.nBad + '): ' + R.contrastDark.bad.slice(0, 2).join(' ; '));
          if (R.scrollWidth > R.width) mal.push('desborde lateral: ' + R.scrollWidth + ' > ' + R.width);
          if (R.positiveTabindex) mal.push(R.positiveTabindex + ' tabindex positivos');
          if (R.focusRing === false) mal.push('el foco no se ve');
          if (!R.altMoves && !t.e.ultimo) mal.push('Alt+→ no cambia de bloque');
          if (!R.shortcutsDialog && !t.e.dialogo) mal.push('«?» no abre los atajos');
        }
      } catch { mal.push('salida ilegible: ' + salida.slice(0, 160)); }
      console.log((mal.length ? '  ✗ ' : '  ✓ ') + t.nombre.padEnd(18) + String(t.ancho).padStart(5) + ' px' + (mal.length ? '  ' + mal.join(' || ') : ''));
      for (const m of mal) fallas.push(t.nombre + ' a ' + t.ancho + ' px: ' + m);
    }
  };
  console.log('Auditor de la suite: ' + tareas.length + ' corridas (' + (tareas.length / 2) + ' escenarios × 1280 y 360 px)');
  /* en paralelo: 3 por omisión; con el equipo cargado, menos (SIGMAPRO_AA_HILOS=1) */
  await Promise.all([9471, 9472, 9473].slice(0, Math.max(1, Math.min(3, +process.env.SIGMAPRO_AA_HILOS || 3))).map(trabajador));
  rmSync(tmp, { recursive: true, force: true });
} else avisos.push('Sin el auditor de la suite (LABG-Design/labg-audit.ps1 o SIGMAPRO_AUDITOR, en Windows): solo se revisa el foco con el teclado.');

/* ---------------- 2. el foco con el teclado de verdad ---------------- */
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
const MIRA = `(() => { const e = document.activeElement; if (!e || e === document.body) return { nada: true };
  const c = getComputedStyle(e), r = e.getBoundingClientRect(), ve = s => (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
  let padre = false; for (let p = e.parentElement, k = 0; p && k < 3; p = p.parentElement, k++) if (ve(getComputedStyle(p)) && p.matches(':focus-within')) padre = true;
  /* uid: el elemento mismo (dos cuadros con el mismo título no son la misma parada) */
  if (!e.__auditUid) e.__auditUid = (window.__auditUidN = (window.__auditUidN || 0) + 1);
  return { uid: e.__auditUid, fv: e.matches(':focus-visible'), anillo: ve(c) || padre, visible: r.width > 0 && r.height > 0,
    que: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' «' + (e.getAttribute('aria-label') || e.textContent || e.value || '').trim().slice(0, 24) + '»' }; })()`;
async function foco(ancho, tema) {
  const puerto = 9640 + Math.floor(Math.random() * 40), perfil = mkdtempSync(join(tmpdir(), 'sigmapro-foco-'));
  const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + puerto, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
  let ws, id = 0;
  const pend = new Map(), errores = [];
  const enviar = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const evaluar = async e => { const r = await enviar('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description); return r.result.value; };
  const tab = async () => { for (const type of ['keyDown', 'keyUp']) await enviar('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); };
  try {
    let d;
    for (let k = 0; k < 75 && !d; k++) { await dormir(200); try { d = await paginaPropia(puerto); } catch { /* arranca */ } }
    ws = new WebSocket(d.webSocketDebuggerUrl);
    await new Promise(r => { ws.onopen = r; });
    ws.onmessage = ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
      else if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map(a => a.value ?? a.description).join(' '));
    };
    await enviar('Runtime.enable'); await enviar('Page.enable');
    await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 500 });
    await enviar('Emulation.setFocusEmulationEnabled', { enabled: true });
    await enviar('Page.navigate', { url: URL_APP });
    for (let k = 0; k < 50; k++) { await dormir(200); if (await evaluar('!!(window.SP && SP.app && SP.app.reporte && SP.datosUI)')) break; }
    /* datos, un análisis y un reporte, para que cada bloque tenga sus controles */
    await evaluar(`document.documentElement.setAttribute('data-theme', '${tema}'); (async () => {
      document.querySelector('#datEjemplos').click(); document.querySelectorAll('.sp-menu-item')[0].click(); await new Promise(r => setTimeout(r, 300));
      const R = SP.app.reporte; R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: {} });
      R.agregar({ metodo: 'descriptivos', e: { variables: ['rend'], grupos: ['hibrido'] }, op: {}, bloque: 3 });
      SP.app.ir(4); SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}); await new Promise(r => setTimeout(r, 400));
      document.querySelectorAll('.toast, .lw-toast, [class*=toast]').forEach(t => t.remove()); })()`);
    let paradas = 0;
    const sinAnillo = new Map(), sinFv = [];
    for (const b of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      await evaluar(`SP.app.ir(${b}); document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); null`);
      await dormir(350);
      const vistos = new Set();
      for (let k = 0; k < 120; k++) {
        await tab();
        const m = await evaluar(MIRA);
        if (m.nada) continue;
        if (vistos.has(m.uid) && vistos.size > 5) break;   // el foco dio la vuelta
        vistos.add(m.uid); paradas++;
        if (!m.fv) sinFv.push('bloque ' + b + ' ' + m.que);
        if (!m.anillo && m.visible) sinAnillo.set(m.que, b);
      }
    }
    return { ancho, tema, paradas, sinAnillo: [...sinAnillo].map(([q, b]) => 'bloque ' + b + ' ' + q), sinFv, errores };
  } finally {
    try { ws && ws.close(); } catch { /* nada */ }
    nav.kill();
    if (process.platform === 'win32') {
      const clave = perfil.split(/[\\/]/).pop();
      try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
    }
    for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
  }
}
const recorridos = [];
if (!exe) avisos.push('Sin Edge ni Chrome: no se revisó el foco con el teclado.');
else for (const [ancho, tema] of [[1280, 'light'], [360, 'dark']]) {
  const r = await foco(ancho, tema);
  recorridos.push(r);
  console.log('Foco con Tab real a ' + ancho + ' px, tema ' + (tema === 'dark' ? 'oscuro' : 'claro') + ': ' + r.paradas + ' paradas en los 10 bloques' +
    (r.sinAnillo.length || r.sinFv.length || r.errores.length ? '' : ', todas con su anillo'));
  for (const s of r.sinAnillo) fallas.push('sin anillo de foco (' + ancho + ' px): ' + s);
  for (const s of r.sinFv) fallas.push('sin :focus-visible con Tab (' + ancho + ' px): ' + s);
  for (const s of r.errores) fallas.push('consola (' + ancho + ' px): ' + s);
}

const paradas = recorridos.reduce((s, r) => s + r.paradas, 0), nEsc = new Set(Object.keys(ESC).filter(k => k.includes(filtro))).size;
for (const a of avisos) console.log('Aviso: ' + a);
if (!filtro) guardar('accesibilidad', { titulo: 'Accesibilidad (AA)', ok: !fallas.length,
  resumen: (corridas ? corridas + ' revisiones de ' + nEsc + ' escenarios (cada bloque, análisis de todas las familias, diálogos y el reporte) a 1280 y 360 px: ' + textos.toLocaleString('es-MX') + ' textos con contraste AA en claro y en oscuro, nombres y etiquetas, sin desborde lateral, Alt+→ / Alt+← y atajos. ' : '') +
    'El foco con Tab de verdad: ' + paradas + ' paradas en los 10 bloques (1280 px en claro y 360 px en oscuro)' + (fallas.length ? '.' : ', todas con su anillo visible.'),
  renglones: fallas.slice(0, 30).concat(avisos) });
console.log(fallas.length ? '\n' + fallas.length + ' FALLAS:\n  ' + fallas.slice(0, 40).join('\n  ') : '\nTODO APROBADO');
process.exit(fallas.length ? 1 : 0);

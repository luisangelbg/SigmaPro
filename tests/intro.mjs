// SigmaPro — la secuencia de apertura (js/intro.js), en un navegador real sin ventana.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/intro.mjs [--capturas]
//
// Comprueba (con ?intro=full, porque en un navegador sin ventana la intro no se reproduce sola):
//   1. La capa aparece antes de que se pinte la interfaz, con la parte decorativa oculta a los lectores de pantalla y el
//      anuncio «Cargando SigmaPro»; letras, motas y el isotipo LABG en su lugar; ninguna letra encima del centro.
//   2. La secuencia termina en la escena fija con el botón «Start» (que recibe el foco y cambia el anuncio); un clic en
//      el fondo no la cierra; Enter sobre «Start» lleva a la app (logo al encabezado, iris) y la deja usable.
//   3. Esc la quita en cualquier momento; con «reducir movimiento» es la escena quieta, sin letras ni motas, con «Start».
//   4. A 390 px las letras caben y al cambiar el tamaño de la ventana se reacomodan.
//   5. Por omisión, en un navegador sin ventana no aparece (las demás pruebas no la ven).
//   6. Rendimiento: cuadros dibujados durante la secuencia (requestAnimationFrame) y tareas largas del hilo principal.
//   7. La presentación en bucle sale con cualquier tecla.
// Con --capturas guarda una imagen por fase en docs/capturas/intro-*.png (para docs/intro.md).

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from './lib/navegador.mjs';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURAS = process.argv.includes('--capturas');
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(2); }
const URL_BASE = pathToFileURL(join(RAIZ, 'index.html')).href;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const U = 6.5 / 4.5;            // la escala de tiempo de la intro completa (DURACION en js/intro.js)

const PUERTO = 9871 + Math.floor(Math.random() * 12);   // lejos de los puertos de las apps de la suite
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-intro-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
let ws, id = 0, cargas = 0;
const pend = new Map(), errores = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 60000 }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const fallas = [], notas = [];
const ok = (c, texto) => { if (!c) fallas.push(texto); return c; };

/* antes de cada página: los momentos de la intro, los cuadros dibujados y las tareas largas */
const SONDA = `(() => {
  window.__si = { t0: null, listo: null, fin: null, cuadros: [], largas: [] };
  document.addEventListener('sigmaintro:inicio', () => { window.__si.t0 = performance.now(); let a = performance.now();
    const paso = t => { window.__si.cuadros.push(t - a); a = t; if (window.__si.listo == null) requestAnimationFrame(paso); }; requestAnimationFrame(paso); });
  document.addEventListener('sigmaintro:listo', () => { window.__si.listo = performance.now(); });
  document.addEventListener('sigmaintro:fin', () => { window.__si.fin = performance.now(); });
  try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__si.largas.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
})()`;

/* cada carga lleva un parámetro distinto: navegar a la misma dirección con #b1 no recarga la página */
async function abrir(consulta, metricas, conIntro) {
  await enviar('Emulation.setDeviceMetricsOverride', metricas || { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const [antes, hash] = consulta.split('#');
  await enviar('Page.navigate', { url: URL_BASE + (antes || '') + (antes && antes.includes('?') ? '&' : '?') + 'n=' + (++cargas) + (hash ? '#' + hash : '') });
  for (let k = 0; k < 120; k++) {
    await dormir(40);
    try { if (await evaluar(conIntro ? '!!document.getElementById("sigmaIntro")' : 'document.readyState !== "loading"')) return true; } catch { /* cargando */ }
  }
  return false;
}
const existe = () => evaluar('!!document.getElementById("sigmaIntro")');
const momento = k => evaluar(`window.__si && window.__si.${k} != null && window.__si.t0 != null ? window.__si.${k} - window.__si.t0 : null`);
async function hasta(seg) { for (let k = 0; k < 600; k++) { const t = await evaluar('window.__si && window.__si.t0 != null ? performance.now() - window.__si.t0 : -1'); if (t >= seg * 1000) return t; await dormir(15); } return -1; }
async function esperarListo(maxMs) { for (let k = 0; k < maxMs / 50; k++) { const t = await momento('listo'); if (t != null) return t; await dormir(50); } return null; }
async function esperarFin(maxMs) { for (let k = 0; k < maxMs / 40; k++) { if (!(await existe())) return true; await dormir(40); } return false; }
async function captura(nombre) {
  if (!CAPTURAS) return;
  const r = await enviar('Page.captureScreenshot', { format: 'png' });
  mkdirSync(join(RAIZ, 'docs', 'capturas'), { recursive: true });
  writeFileSync(join(RAIZ, 'docs', 'capturas', 'intro-' + nombre + '.png'), Buffer.from(r.data, 'base64'));
}
/* detiene las animaciones CSS de la intro en el instante t (s, ya en la escala de la completa) para fotografiarlo */
const congelar = t => evaluar(`(() => { let n = 0;
  for (const a of document.getAnimations()) { const el = a.effect && a.effect.target; if (el && el.closest && el.closest('.si')) { a.pause(); a.currentTime = ${Math.round(t * 1000)}; n++; } } return n; })()`);
const tecla = (key, code, vk, text) => enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, ...(text ? { text } : {}) })
  .then(() => enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk }));

try {
  let pagina = null;
  for (let k = 0; k < 60 && !pagina; k++) { await dormir(250); try { pagina = await paginaPropia(PUERTO); } catch { /* aún arranca */ } }
  if (!pagina) throw new Error('el navegador no respondió');
  ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((r, m) => { ws.onopen = r; ws.onerror = m; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result || m); pend.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errores.push(m.params.args.map(a => a.value || a.description).join(' '));
  };
  await enviar('Runtime.enable'); await enviar('Page.enable');
  await enviar('Page.addScriptToEvaluateOnNewDocument', { source: SONDA });

  /* 5. por omisión, sin ventana: no aparece */
  await abrir('#b1');
  await dormir(500);
  ok(!(await existe()), 'en un navegador sin ventana la intro apareció sola');

  /* 1, 2 y 6. la completa, en tiempo real */
  ok(await abrir('?intro=full#b1', null, true), 'la intro completa no apareció con ?intro=full');
  const ini = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); if (!r) return null;
    const capa = r.querySelector('.si-capa'), anuncio = r.querySelector('[role="status"]');
    return { modo: r.dataset.modo, oculta: capa && capa.getAttribute('aria-hidden'), anuncio: anuncio && anuncio.textContent, dentro: !!capa.querySelector('button'),
      letras: r.querySelectorAll('.si-l').length, motas: r.querySelectorAll('.si-m').length, clase: document.documentElement.classList.contains('si-activa'),
      start: !!r.querySelector('.si-start:disabled') }; })()`);
  if (ok(ini && ini.modo === 'full', 'la intro completa no es la que se abrió: ' + JSON.stringify(ini))) {
    ok(ini.oculta === 'true' && !ini.dentro, 'la capa decorativa no tiene aria-hidden o lleva botones dentro');
    ok(/Cargando SigmaPro|Loading SigmaPro/.test(ini.anuncio || ''), 'falta el anuncio «Cargando SigmaPro»');
    ok(ini.letras >= 30 && ini.motas > 0 && ini.motas <= 40, 'letras o motas fuera de lo previsto: ' + ini.letras + ' / ' + ini.motas);
    ok(ini.clase, 'no se bloqueó el desplazamiento mientras dura');
    ok(ini.start, '«Start» debe esperar desactivado hasta el final de la secuencia');
  }
  await hasta(2.4 * U);
  const medio = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); if (!r) return null;
    const pila = r.querySelector('.si-pila').getBoundingClientRect();
    const encima = [...r.querySelectorAll('.si-l')].filter(l => { const x = parseFloat(l.style.getPropertyValue('--x')), y = parseFloat(l.style.getPropertyValue('--y')); return x > pila.left && x < pila.right && y > pila.top && y < pila.bottom; }).length;
    return { encima, logo: !!r.querySelector('.si-logo svg'), iso: !!r.querySelector('.si-iso svg') }; })()`);
  ok(medio && medio.encima === 0, 'hay letras sobre el logo y los textos del centro: ' + JSON.stringify(medio));
  ok(medio && medio.logo && medio.iso, 'falta el logo de SigmaPro o el isotipo LABG: ' + JSON.stringify(medio));
  const tListo = await esperarListo(9000);
  ok(tListo != null && tListo <= 6600, '«Start» no apareció al final de la secuencia (≈ 5.6 s): ' + tListo);
  await dormir(500);
  const espera = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); if (!r) return null; const b = r.querySelector('.si-start'), q = b.getBoundingClientRect(), l = r.querySelector('.si-labg').getBoundingClientRect();
    return { foco: document.activeElement === b, activo: !b.disabled, texto: b.textContent.trim(), anuncio: r.querySelector('[role="status"]').textContent, debajo: q.top > l.bottom, visible: getComputedStyle(r.querySelector('.si-acciones')).opacity }; })()`);
  ok(espera && espera.texto === 'Start' && espera.activo && espera.foco && espera.debajo, '«Start» no está listo, con el foco y debajo de LABG: ' + JSON.stringify(espera));
  ok(espera && /Start/.test(espera.anuncio), 'el anuncio no avisa que se puede entrar');
  await captura('7-start');
  /* el Estudio de figuras no toma el logo por una figura (sin su botón «Abrir en el estudio») */
  ok(await evaluar(`!document.querySelector('#sigmaIntro .lfs-open') && !(window.LABGFigureStudio && document.querySelector('.lfs-open') && [...document.querySelectorAll('.lfs-open')].some(b => { const r = b.getBoundingClientRect(); return r.width && getComputedStyle(b).visibility !== 'hidden' && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === b; }))`),
    'el Estudio de figuras puso su botón sobre la intro');
  /* un clic en el fondo no la cierra (solo «Start», «Saltar» o Esc) */
  await enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: 120, y: 160, button: 'left', clickCount: 1 });
  await enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 120, y: 160, button: 'left', clickCount: 1 });
  await dormir(400);
  ok(await existe(), 'un clic en el fondo cerró la intro');
  await evaluar('document.querySelector(".si-start").focus()');
  await tecla('Enter', 'Enter', 13, '\r');
  if (CAPTURAS) { await dormir(330); await captura('8-iris'); }
  ok(await esperarFin(1500), 'Enter sobre «Start» no llevó a la app');
  const fin = await evaluar(`({ cuadros: window.__si.cuadros, largas: window.__si.largas, t0: window.__si.t0, listo: window.__si.listo,
    clase: document.documentElement.classList.contains('si-activa'), marca: !!document.querySelector('.topbar .brand-mark') })`);
  ok(!fin.clase, 'la página quedó bloqueada al entrar');
  const c = fin.cuadros.slice(1).sort((a, b) => a - b), p = q => c.length ? c[Math.min(c.length - 1, Math.floor(q * c.length))] : NaN;
  const durS = (fin.listo - fin.t0) / 1000;
  const largas = fin.largas.filter(([s, d]) => s + d >= fin.t0 && s <= fin.listo);
  const perf = { cuadros: c.length, fps: Math.round(c.length / durS), p50: +p(0.5).toFixed(1), p95: +p(0.95).toFixed(1), lentos: c.filter(x => x > 34).length,
    largas: largas.length, largaMax: largas.reduce((m, x) => Math.max(m, x[1]), 0) };
  notas.push('secuencia completa hasta «Start»: ' + Math.round(tListo) + ' ms, ' + perf.cuadros + ' cuadros (' + perf.fps + ' por segundo; mediana ' + perf.p50 + ' ms, p95 ' + perf.p95 + ' ms, ' +
    perf.lentos + ' de más de 34 ms); ' + perf.largas + ' tareas largas del hilo principal en ese lapso' + (perf.largas ? ' (la mayor, ' + perf.largaMax + ' ms)' : ''));

  /* capturas por fase: cada instante se fija deteniendo las animaciones (y los relojes que llevan a «Start») */
  if (CAPTURAS) {
    const truco = await enviar('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, ms >= 5000 && ms <= 6500 ? 9e8 : ms, ...a); })()` });
    await abrir('?intro=full#b1', null, true);
    await hasta(0.05); await dormir(1500);
    for (const [t, n] of [[0.3, '1-punto'], [1.25, '2-letras'], [2.15, '3-trazo'], [2.6, '4-vertido'], [2.97, '5-destello'], [3.33, '6-destellos'], [3.8, '6-nombre']]) {
      await congelar(t * U); await dormir(150); await captura(n);
    }
    await enviar('Page.removeScriptToEvaluateOnNewDocument', { identifier: truco.identifier });
  }

  /* 3. Esc */
  await abrir('?intro=full#b1', null, true);
  await hasta(1.0);
  await tecla('Escape', 'Escape', 27);
  ok(await esperarFin(400), 'Esc no quitó la intro');

  /* 3. reducir movimiento: la escena quieta con «Start» */
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await abrir('?intro=full#b1', null, true);
  const q = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); return r ? { modo: r.dataset.modo, letras: r.querySelectorAll('.si-l').length, motas: r.querySelectorAll('.si-m').length } : null; })()`);
  ok(q && q.modo === 'quieto' && q.letras === 0 && q.motas === 0, 'con «reducir movimiento» no es la escena quieta: ' + JSON.stringify(q));
  const tq = await esperarListo(3000);
  ok(tq != null && tq < 1500, 'con «reducir movimiento», «Start» tardó: ' + tq);
  if (CAPTURAS) { await dormir(300); await captura('9-quieta'); }
  await evaluar('document.querySelector(".si-start").click()');
  ok(await esperarFin(600), '«Start» no cerró la escena quieta');
  await enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

  /* 4. 390 px y cambio de tamaño */
  await abrir('?intro=full#b1', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, true);
  await hasta(2.4 * U);
  const movil = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); if (!r) return null; const xs = [...r.querySelectorAll('.si-l')].map(l => [parseFloat(l.style.getPropertyValue('--x')), parseFloat(l.style.getPropertyValue('--s'))]).filter(([x]) => x > -500);
    return { n: xs.length, fuera: xs.filter(([x]) => x < 0 || x > innerWidth).length, mayor: Math.max(...xs.map(v => v[1])) }; })()`);
  ok(movil && movil.fuera === 0 && movil.mayor <= 220, 'a 390 px hay letras fuera de la pantalla: ' + JSON.stringify(movil));
  if (CAPTURAS) {
    await esperarListo(9000); await dormir(900);
    const m = await evaluar(`(() => { const b = document.querySelector('.si-start').getBoundingClientRect(); return { abajo: b.bottom, alto: innerHeight }; })()`);
    ok(m.abajo < m.alto, 'a 390 px «Start» queda fuera de la pantalla');
    await captura('10-movil');
  }
  await enviar('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await dormir(450);
  const despues = await evaluar(`(() => { const r = document.getElementById('sigmaIntro'); if (!r) return null; return Math.max(...[...r.querySelectorAll('.si-l')].map(l => parseFloat(l.style.getPropertyValue('--x')))); })()`);
  ok(despues == null || despues > 400, 'al cambiar el tamaño las letras no se reacomodaron (x máxima ' + despues + ')');

  /* 7. la presentación en bucle sale con cualquier tecla */
  await abrir('#b1');
  for (let k = 0; k < 100 && !(await evaluar('!!(window.SP && SP.app && window.SigmaIntro)')); k++) await dormir(100);
  await evaluar(`SigmaIntro.play({ mode: 'loop' })`);
  await dormir(600);
  ok(await evaluar(`(document.getElementById('sigmaIntro') || {}).dataset?.modo === 'loop'`), 'el modo de presentación no se abrió');
  if (CAPTURAS) { await dormir(4400); await captura('11-presentacion'); }
  await tecla('a', 'KeyA', 65, 'a');
  ok(await esperarFin(400), 'una tecla no cerró el modo de presentación');

  ok(!errores.length, 'errores en la página: ' + errores.slice(0, 3).join(' | '));
  const peso = ['js/intro.js', 'css/intro.css'].reduce((s, f) => s + statSync(join(RAIZ, f)).size, 0);
  notas.push('peso: js/intro.js + css/intro.css = ' + (peso / 1024).toFixed(1) + ' KB (sin imágenes ni fuentes)');
  ok(peso <= 150 * 1024, 'la intro pesa más de 150 KB');
} catch (e) {
  fallas.push('la prueba no pudo correr: ' + e.message);
} finally {
  try { ws && ws.close(); } catch { /* nada */ }
  nav.kill();
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* aún en uso */ } }
}

console.log('\nSigmaPro · la secuencia de apertura');
for (const n of notas) console.log('  · ' + n);
for (const f of fallas) console.log('  ✗ ' + f);
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
guardar('intro', { titulo: 'Secuencia de apertura', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas });
process.exitCode = fallas.length ? 1 : 0;

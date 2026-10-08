// SigmaPro — el glosario y «Ver en acción» (hito 5.5), en la app abierta por file:// en un navegador sin ventana.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/glosario.mjs
//
// 1. js/generado/glosario.js corresponde a lo que da node tools/glosario/glosario.mjs (los ejemplos de Fundamentos y
//    el inventario de estadísticos de hoy).
// 2. Con el teclado: Ctrl+G abre el glosario con el foco en el buscador; escribir «interacción» y Enter muestra su
//    ficha; «Ver en acción» carga el maíz, corre los bloques al azar en Análisis y señala el renglón hibrido × dosis.
// 3. Cada lugar de cada término (todos los estadísticos y conceptos con lugar) se encuentra y se ve en el resultado; el
//    renglón señalado es el que dice el archivo generado.
// 4. En el nivel Básico, «Ver en acción» pasa a Estándar para mostrar el cuadro; los datos de ejemplo dejan la tabla
//    anterior en «Volver a la tabla anterior».
// 5. Con la interfaz en inglés, cada concepto y el primer lugar de cada estadístico también se encuentran.
// 6. A 390 px de ancho, la lista y la ficha se turnan.
// 7. Sin errores en la consola.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from './lib/navegador.mjs';
import { guardar } from './lib/comprobaciones.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const fallas = [], notas = [];
const ok = (c, texto) => { if (!c) fallas.push(texto); return c; };

/* 1. el archivo generado */
try { execFileSync(process.execPath, [join(RAIZ, 'tools', 'glosario', 'glosario.mjs'), '--comprobar'], { stdio: 'pipe' }); notas.push('js/generado/glosario.js al día'); }
catch (e) { fallas.push('js/generado/glosario.js: ' + String(e.stderr || e.message).trim().split('\n')[0]); }

const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(2); }
const URL_BASE = pathToFileURL(join(RAIZ, 'index.html')).href;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const PUERTO = 9620 + Math.floor(Math.random() * 40);
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-glosario-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
let ws, id = 0, cargas = 0;
const pend = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 600000 }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const tecla = async (key, code, vk, mods, text) => {
  await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, modifiers: mods || 0, ...(text ? { text } : {}) });
  await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, modifiers: mods || 0 });
};
async function abrir(consulta, ancho) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: ancho || 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await enviar('Page.navigate', { url: URL_BASE + '?' + (consulta ? consulta + '&' : '') + 'n=' + (++cargas) });
  for (let k = 0; k < 400; k++) { await dormir(50); try { if (await evaluar('document.documentElement.hasAttribute("data-sp-listo")')) return true; } catch { /* cargando */ } }
  return false;
}

/* lo que corre en la página: cada lugar de cada término; devuelve los que no se encontraron */
const TODOS = soloPrimero => `(async () => {
  const D = await SP.glosarioUI.datos(), fallas = [], vistos = new Set();
  let n = 0;
  for (const t of SP.glosario.terminos()) {
    const lug = SP.glosario.lugares(t.id, D);
    for (let k = 0; k < lug.length; k++) {
      if (${soloPrimero ? 'k > 0' : 'false'}) break;
      const l = lug[k], clave = JSON.stringify(l);
      if (vistos.has(clave)) continue;
      vistos.add(clave); n++;
      const r = await SP.glosarioUI.ver(t.id, k);
      const m = [...document.querySelectorAll('.sp-gl-marca')];
      if (!r || !m.length) { fallas.push(t.id + ' en ' + l.metodo + ' (' + l.cuadro + ' ' + l.modo + ' ' + l.x + '): no se señaló'); continue; }
      if (!m.every(x => x.getClientRects().length)) fallas.push(t.id + ' en ' + l.metodo + ': lo señalado no se ve');
      if (l.modo === 'f') { const tr = m[0], tb = tr.parentElement; if (tr.tagName !== 'TR' || [...tb.rows].indexOf(tr) !== l.x) fallas.push(t.id + ' en ' + l.metodo + ': otro renglón'); }
      if (l.modo === 'c' && m[0].tagName !== 'TH') fallas.push(t.id + ' en ' + l.metodo + ': la columna sin su encabezado');
    }
  }
  return { n, fallas };
})()`;

let codigo = 1;
try {
  let destino;
  for (let k = 0; k < 75 && !destino; k++) { await dormir(200); try { destino = await paginaPropia(PUERTO); } catch { /* arranca */ } }
  if (!destino) throw new Error('El navegador no abrió su puerto de depuración.');
  ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') consola.push('excepción: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consola.push('error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
  };
  await enviar('Runtime.enable'); await enviar('Page.enable');

  /* 2. con el teclado */
  ok(await abrir(''), 'la app no terminó de cargar');
  await evaluar('document.body.focus(), true');
  await tecla('g', 'KeyG', 71, 2);
  await dormir(150);
  ok(await evaluar('!!(document.getElementById("spGlosario") || {}).open'), 'Ctrl+G no abrió el glosario');
  ok(await evaluar('document.activeElement && document.activeElement.id') === 'spGlQ', 'el foco no quedó en el buscador');
  await enviar('Input.insertText', { text: 'interacción' });
  await dormir(300);
  await tecla('Enter', 'Enter', 13, 0, '\r');
  await dormir(150);
  ok(/Interacción/.test(await evaluar('(document.querySelector("#spGlFicha h3") || {}).textContent || ""')), 'Enter no mostró la ficha de «Interacción»');
  ok(await evaluar('(document.activeElement || {}).id') === 'spGlFicha', 'el foco no pasó a la ficha');
  await evaluar('document.querySelector("#spGlFicha [data-gl-ver=\\"0\\"]").click(), true');
  let marcado = '';
  for (let k = 0; k < 100 && !marcado; k++) { await dormir(60); marcado = await evaluar('[...document.querySelectorAll(".sp-gl-marca")].map(x => x.textContent).join(" | ")'); }
  ok(/hibrido × dosis/.test(marcado), 'Ver en acción no señaló hibrido × dosis: «' + marcado + '»');
  ok(await evaluar('!document.getElementById("spGlosario").open'), 'el glosario siguió abierto');
  ok(await evaluar('document.getElementById("panel-4").classList.contains("active")'), 'no se abrió Análisis');
  ok(/Maíz/.test(await evaluar('SP.app.datos.origen')), 'no se cargó el maíz');

  /* 3. todos los lugares */
  const todos = await evaluar(TODOS(false));
  notas.push(todos.n + ' lugares señalados en español');
  todos.fallas.forEach(f => fallas.push(f));

  /* 4. Básico y la tabla anterior */
  ok(await evaluar(`(async () => { SP.detalle.poner('basico'); const r = await SP.glosarioUI.ver('F', 0); return r && SP.detalle.actual() === 'estandar'; })()`), 'en Básico, Ver en acción no pasó a Estándar');
  const tabla = await evaluar(`(async () => {
    await SP.glosarioUI.ver('F', 0);
    const antes = SP.app.datos.origen;
    await SP.glosarioUI.ver('covariable', 0);
    const ahora = SP.app.datos.origen, anterior = SP.app.datos.anterior && SP.app.datos.anterior.origen, boton = !document.getElementById('datVolver').hidden;
    document.getElementById('datVolver').click();
    return { antes, ahora, anterior, boton, vuelta: SP.app.datos.origen };
  })()`);
  ok(/Maíz/.test(tabla.antes) && /Sorgo/.test(tabla.ahora) && tabla.anterior === tabla.antes && tabla.boton && tabla.vuelta === tabla.antes,
    'la tabla anterior no quedó para volver: ' + JSON.stringify(tabla));

  /* 5. en inglés */
  ok(await abrir('lang=en'), 'la app en inglés no cargó');
  const en = await evaluar(TODOS(true));
  notas.push(en.n + ' lugares en inglés');
  en.fallas.forEach(f => fallas.push('en inglés: ' + f));
  ok(await evaluar('/^Glossary$/.test((function () { SP.glosarioUI.abrir(); const t = document.getElementById("spGlT").textContent; SP.glosarioUI.cerrar(); return t; })())'), 'el título del glosario no está en inglés');

  /* 6. en un teléfono */
  ok(await abrir('', 390), 'la app a 390 px no cargó');
  const tel = await evaluar(`(async () => {
    SP.glosarioUI.abrir();
    const d = document.getElementById('spGlosario'), vis = s => d.querySelector(s).getClientRects().length > 0;
    const a = { lista: vis('#spGlLista'), ficha: vis('#spGlFicha'), ancho: d.getBoundingClientRect().width };
    d.querySelector('.sp-gl-item').click();
    await new Promise(r => setTimeout(r, 50));
    const b = { lista: vis('#spGlLista'), ficha: vis('#spGlFicha'), volver: vis('.sp-gl-volver') };
    d.querySelector('[data-gl-volver]').click();
    const c = { lista: vis('#spGlLista'), ficha: vis('#spGlFicha') };
    const desborde = document.documentElement.scrollWidth > window.innerWidth + 1;
    SP.glosarioUI.cerrar();
    return { a, b, c, desborde };
  })()`);
  ok(tel.a.lista && !tel.a.ficha && tel.a.ancho <= 390 && tel.b.ficha && !tel.b.lista && tel.b.volver && tel.c.lista && !tel.c.ficha && !tel.desborde,
    'a 390 px la lista y la ficha no se turnan bien: ' + JSON.stringify(tel));

  /* 7. la consola */
  for (const c of consola) fallas.push('consola: ' + c);
  codigo = fallas.length ? 1 : 0;
} catch (e) {
  fallas.push('la prueba no terminó: ' + e.message);
} finally {
  try { ws && ws.close(); } catch { /* nada */ }
  nav.kill();
  await dormir(400);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* lo borra el sistema */ }
}

console.log('SigmaPro · el glosario y «Ver en acción»');
for (const n of notas) console.log('  ' + n);
for (const f of fallas) console.log('  ✗ ' + f);
guardar('glosario', { titulo: 'Glosario y «Ver en acción»', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas });
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
process.exit(fallas.length ? 1 : codigo);

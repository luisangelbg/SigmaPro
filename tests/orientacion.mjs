// SigmaPro — lo que orienta a quien usa la app (hito 5.7), en la app abierta por file:// en un navegador sin ventana.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/orientacion.mjs
//
// 1. Inicio: los tres caminos (tus datos, un ejemplo, qué análisis usar); «Elegir un ejemplo» carga el maíz y lleva a
//    Datos.
// 2. Historial: un análisis calculado aparece en «Lo último que analizaste»; con otros datos cargados, volver a abrirlo
//    carga otra vez su ejemplo (la tabla de antes queda para volver) y lo calcula; «Historial» de Análisis lo lista.
// 3. Estados vacíos: sin datos, Explorar ofrece importar, pegar o un ejemplo, y el ejemplo se carga sin salir de
//    Explorar, con su resumen; Exportar, con el reporte vacío, ofrece ir a Análisis.
// 4. El árbol de decisiones (hito 5.7, parte 2): el tercer camino lo abre; las respuestas llevan a los bloques, con una
//    línea por paso y el foco en la pregunta nueva; «Probar con el ejemplo» carga el maíz y calcula; la recomendación
//    del asistente se señala en el árbol.
// 5. Ayudas emergentes (parte 3): con el foco del teclado, Esc las cierra sin mover el foco; sobre el encabezado F del
//    ANOVA dicen qué es.
// 6. Recorridos (parte 3): el de Análisis sin datos ofrece el ejemplo del maíz y resalta cada parte, con el foco en la
//    ventana; al terminar el foco vuelve al botón; con datos, cada uno de los diez bloques tiene su recorrido y Esc lo
//    cierra.
// 7. Modo presentación (parte 4): «Presentar» del resultado de bloques abre las diapositivas con su título y el foco en
//    «siguiente»; →, Inicio y Fin las recorren; la copia no repite ids ni lleva botones; Esc sale y el foco vuelve; el
//    reporte se presenta con la sección de su análisis.
// 8. Errores en palabras (parte 4): con una sola observación, la prueba t dice qué pasó y qué hacer.
// 9. A 390 px: los caminos y las columnas del árbol, una bajo otra, sin desborde lateral.
// 10. Sin errores en la consola.

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

const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!exe) { console.error('No encontré Edge ni Chrome.'); process.exit(2); }
const URL_BASE = pathToFileURL(join(RAIZ, 'index.html')).href;
const dormir = ms => new Promise(r => setTimeout(r, ms));
const PUERTO = 9660 + Math.floor(Math.random() * 40);
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-orientacion-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
let ws, id = 0, cargas = 0;
const pend = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true, timeout: 120000 }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
async function abrir(consulta, ancho) {
  await enviar('Emulation.setDeviceMetricsOverride', { width: ancho || 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await enviar('Page.navigate', { url: URL_BASE + '?' + (consulta ? consulta + '&' : '') + 'n=' + (++cargas) });
  for (let k = 0; k < 400; k++) { await dormir(50); try { if (await evaluar('document.documentElement.hasAttribute("data-sp-listo")')) return true; } catch { /* cargando */ } }
  return false;
}
/* hasta que la condición (texto de JS) sea verdadera, o se acabe el tiempo */
async function hasta(cond, ms) { for (let k = 0; k < (ms || 6000) / 60; k++) { if (await evaluar(cond)) return true; await dormir(60); } return false; }
/* elige del menú abierto (.sp-menu) el renglón cuyo texto empieza así */
/* una tecla del teclado (el protocolo sí la entrega a la página) */
async function tecla(key, vk) { await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: vk }); await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: vk }); await dormir(60); }
const elegirDelMenu = texto => evaluar(`(() => { const b = [...document.querySelectorAll('.sp-menu .sp-menu-item')].find(x => x.textContent.trim().startsWith(${JSON.stringify(texto)})); if (b) b.click(); return !!b; })()`);

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

  /* 1. los tres caminos */
  ok(await abrir(''), 'la app no terminó de cargar');
  const caminos = await evaluar(`[...document.querySelectorAll('.caminos .camino')].map(c => ({ t: c.querySelector('h3').textContent, b: [...c.querySelectorAll('button')].map(b => b.dataset.datos || b.dataset.ir || (b.hasAttribute('data-glosario') ? 'glosario' : b.hasAttribute('data-arbol-metodo') ? 'arbol' : '?')) }))`);
  ok(caminos.length === 3 && JSON.stringify(caminos.map(c => c.b)) === JSON.stringify([['importar', 'pegar'], ['ejemplo'], ['arbol', '9', 'glosario']]), 'los tres caminos no son los esperados: ' + JSON.stringify(caminos));
  ok(await evaluar('document.getElementById("iniHistorial").hidden'), 'sin análisis, «Lo último que analizaste» no debe verse');
  await evaluar('document.querySelector(\'.caminos [data-datos="ejemplo"]\').click(), true');
  ok(await hasta('!!document.querySelector(".sp-menu")'), '«Elegir un ejemplo» no abrió el menú de ejemplos');
  ok(await elegirDelMenu('Maíz'), 'el menú no tiene el maíz');
  ok(await hasta('document.getElementById("panel-2").classList.contains("active") && /Maíz/.test(SP.app.datos.origen)'), 'el ejemplo no se cargó o no se fue a Datos');
  notas.push('Inicio: tres caminos; el ejemplo lleva a Datos');

  /* 2. el historial */
  await evaluar(`(SP.app.ir(4), SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}), true)`);
  await evaluar('SP.app.ir(1), true');
  ok(await hasta('!document.getElementById("iniHistorial").hidden && /Bloques completos al azar/.test(document.getElementById("iniHistorialLista").textContent)'), 'el análisis no apareció en «Lo último que analizaste»');
  const det = await evaluar('document.querySelector("#iniHistorialLista .ini-hist-det").textContent');
  ok(/rend/.test(det) && /bloque/.test(det) && /Maíz/.test(det), 'el renglón del historial no dice variables y datos: «' + det + '»');
  /* con otros datos, volver a abrirlo carga el maíz otra vez */
  await evaluar(`(() => { const e = SP_EJEMPLOS.find(x => x.id === 'venenos'), l = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' }); SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: e.tipos }), 'Ejemplo: ' + e.nombre); return true; })()`);
  await evaluar('SP.app.ir(1), true');
  const i = await evaluar(`[...document.querySelectorAll('#iniHistorialLista .ini-hist-item')].findIndex(b => /Bloques completos al azar/.test(b.textContent))`);
  ok(i >= 0, 'no está el renglón de bloques');
  await evaluar(`document.querySelectorAll('#iniHistorialLista .ini-hist-item')[${Math.max(0, i)}].click(), true`);
  ok(await hasta('document.getElementById("panel-4").classList.contains("active") && /Maíz/.test(SP.app.datos.origen) && !!document.querySelector(\'#anaResultado table[data-cuadro="anova"]\')'), 'volver a abrir no cargó el maíz ni calculó los bloques');
  ok(await evaluar('/Venenos/.test((SP.app.datos.anterior || {}).origen || "")'), 'la tabla de antes no quedó para volver');
  await evaluar('document.querySelector("#anaTrabajo [data-historial]").click(), true');
  ok(await hasta('!!document.querySelector(".sp-menu") && /Bloques completos al azar/.test(document.querySelector(".sp-menu").textContent) && /Borrar el historial/.test(document.querySelector(".sp-menu").textContent)'), '«Historial» de Análisis no lista los análisis');
  await evaluar('document.querySelectorAll(".sp-menu").forEach(m => m.remove()), true');
  notas.push('historial: anota, vuelve a abrir con su ejemplo y se lista en Análisis');

  /* 3. estados vacíos (una página nueva, sin datos) */
  ok(await abrir(''), 'la app no volvió a cargar');
  await evaluar('SP.app.ir(3), true');
  ok(await evaluar(`(() => { const v = document.getElementById('expVacio'); return !!v && v.getClientRects().length > 0 && ['importar', 'pegar', 'ejemplo'].every(k => v.querySelector('[data-datos="' + k + '"]')); })()`), 'Explorar vacío no ofrece importar, pegar y un ejemplo');
  await evaluar('document.querySelector(\'#expVacio [data-datos="ejemplo"]\').click(), true');
  ok(await hasta('!!document.querySelector(".sp-menu")'), 'el ejemplo de Explorar no abrió el menú');
  ok(await elegirDelMenu('Maíz'), 'el menú de Explorar no tiene el maíz');
  ok(await hasta('document.getElementById("panel-3").classList.contains("active") && !!document.querySelector("#expResultado table")'), 'con el ejemplo cargado desde Explorar no se quedó en Explorar con su resumen');
  ok(await evaluar('SP.app.ir(4), !!document.querySelector(\'#anaVacio [data-sin-datos]\') && document.getElementById("anaVacio").hidden'), 'Análisis con datos sigue mostrando su estado vacío, o falta su botón de potencia');
  await evaluar('SP.app.ir(7), true');
  ok(await hasta('!!document.querySelector(\'#expoResumen [data-ir="4"]\')'), 'Exportar con el reporte vacío no ofrece ir a Análisis');
  notas.push('estados vacíos: Explorar carga el ejemplo ahí mismo; Exportar lleva a Análisis');

  /* 4. el árbol de decisiones: desde Inicio, sin datos */
  ok(await abrir(''), 'la app no volvió a cargar para el árbol');
  await evaluar('document.querySelector(\'.caminos [data-arbol-metodo]\').click(), true');
  ok(await hasta('document.getElementById("panel-9").classList.contains("active") && !!document.querySelector("#funRaiz .arb")'), 'el tercer camino no abrió el árbol de decisiones');
  for (const op of ['comparar', 'continua', 'dbca']) {
    ok(await evaluar(`(() => { const b = document.querySelector('#funRaiz [data-arb-op="${op}"]'); if (b) b.click(); return !!b; })()`), 'el árbol no tiene la opción ' + op);
    await dormir(150);
  }
  const arbol = await evaluar(`(() => { const p = document.querySelector('#funRaiz .arb-lineas path'); return { cols: document.querySelectorAll('#funRaiz .arb-col').length, mets: [...document.querySelectorAll('#funRaiz .arb-met')].map(x => x.dataset.arbMet), lineas: p ? (p.getAttribute('d').match(/M/g) || []).length : 0, foco: document.activeElement && document.activeElement.classList.contains('arb-q') }; })()`);
  ok(arbol.cols === 4 && arbol.mets.join() === 'dbca,mixto-bloques' && arbol.lineas === 3 && arbol.foco, 'el camino del árbol no llegó a bloques con sus tres líneas y el foco en la hoja: ' + JSON.stringify(arbol));
  await evaluar('document.querySelector(\'#funRaiz [data-arb-ejemplo="dbca"]\').click(), true');
  ok(await hasta('document.getElementById("panel-4").classList.contains("active") && /Maíz/.test(SP.app.datos.origen) && !!document.querySelector(\'#anaResultado table[data-cuadro="anova"]\')', 8000), '«Probar con el ejemplo» no cargó el maíz ni calculó los bloques');
  /* desde el asistente: su recomendación, señalada en el árbol */
  await evaluar('SP.app.analisis.ponerModo("asistente"), true');
  const met = await evaluar('(document.querySelector("#anaAsistente [data-arbol-metodo]") || {}).dataset ? document.querySelector("#anaAsistente [data-arbol-metodo]").dataset.arbolMetodo : null');
  ok(met, 'la recomendación del asistente no ofrece verla en el árbol');
  if (met) {
    await evaluar('document.querySelector("#anaAsistente [data-arbol-metodo]").click(), true');
    ok(await hasta(`document.getElementById("panel-9").classList.contains("active") && !!document.querySelector('#funRaiz .arb-met.arb-marca[data-arb-met="${met}"]')`), 'el árbol no señala la recomendación del asistente (' + met + ')');
  }
  notas.push('árbol: del Inicio a los bloques con sus líneas, el ejemplo calculado y la recomendación del asistente señalada');

  /* 5. ayudas emergentes: con el teclado (y Esc las cierra sin mover el foco) y sobre un encabezado de cuadro */
  ok(await abrir(''), 'la app no volvió a cargar para las ayudas');
  await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await evaluar('document.getElementById("themeBtn").focus(), true');
  ok(await hasta('(() => { const t = document.getElementById("spAyuda"); return !!t && !t.hidden && /tema claro y oscuro/.test(t.textContent) && /spAyuda/.test(document.getElementById("themeBtn").getAttribute("aria-describedby") || ""); })()', 2000), 'con el foco del teclado, el botón del tema no muestra su ayuda');
  await enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  ok(await evaluar('document.getElementById("spAyuda").hidden && document.activeElement.id === "themeBtn"'), 'Esc no cerró la ayuda o movió el foco');
  await evaluar(`(() => { const e = SP_EJEMPLOS.find(x => x.id === 'maiz'), l = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' }); SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: e.tipos }), 'Ejemplo: ' + e.nombre); SP.app.ir(4); SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}); return true; })()`);
  /* el puntero sobre el encabezado (los eventos de puntero del protocolo no llegan a una ventana nueva sin ventana) */
  await evaluar(`document.querySelector('#anaResultado table[data-cuadro="anova"] th[data-clave="F"]').dispatchEvent(new MouseEvent('mouseover', { bubbles: true })), true`);
  ok(await hasta('(() => { const t = document.getElementById("spAyuda"); return !!t && !t.hidden && /F de Fisher/.test(t.textContent); })()', 2500), 'el encabezado F del ANOVA no muestra qué es');
  notas.push('ayudas: con el teclado, Esc sin mover el foco y el estadístico de un encabezado');

  /* 6. recorridos: el de Análisis sin datos ofrece el ejemplo; cada paso resalta su parte; Esc devuelve el foco */
  ok(await abrir(''), 'la app no volvió a cargar para los recorridos');
  await evaluar('SP.app.ir(4), document.querySelector(\'#panel-4 [data-recorrido="4"]\').focus(), document.querySelector(\'#panel-4 [data-recorrido="4"]\').click(), true');
  ok(await hasta('!!document.querySelector(".sp-tour") && /Mejor con datos/.test(document.querySelector(".sp-tour").textContent)'), 'el recorrido de Análisis sin datos no ofrece cargar el ejemplo');
  await evaluar('document.querySelector(\'.sp-tour [data-tour="ejemplo"]\').click(), true');
  ok(await hasta('!!document.querySelector(".sp-tour .sp-tour-paso") && /1 de \\d/.test(document.querySelector(".sp-tour .sp-tour-paso").textContent)', 5000), 'con el ejemplo cargado, el recorrido no empezó');
  const recorrido = await evaluar(`(async () => {
    const vistos = [], mal = [];
    for (let k = 0; k < 20 && document.querySelector('.sp-tour'); k++) {
      await new Promise(r => setTimeout(r, 120));
      const n = SP.recorridos.estado.pasos.length, p = SP.recorridos.estado.pasos[SP.recorridos.estado.i];
      const el = p.sel.split(' | ').map(s => document.querySelector(s)).find(x => x && x.getClientRects().length);
      /* la posición final del resaltado (su estilo), no la de su animación */
      const a = el.getBoundingClientRect(), l = document.querySelector('.sp-tour-luz').style, b = { left: parseFloat(l.left), top: parseFloat(l.top), width: parseFloat(l.width) };
      if (b.left > Math.max(4, a.left) + 1 || b.top > Math.max(4, a.top) + 1 || b.width < Math.min(a.width, window.innerWidth - 8) - 2) mal.push(p.titulo);
      if (document.activeElement.id !== 'spTourT') mal.push('foco: ' + p.titulo);
      vistos.push(p.titulo);
      document.querySelector('.sp-tour [data-tour="sig"]').click();
    }
    return { vistos, mal, abierto: !!document.querySelector('.sp-tour'), foco: document.activeElement && document.activeElement.dataset.recorrido };
  })()`);
  ok(recorrido.vistos.length >= 6 && !recorrido.mal.length && !recorrido.abierto && recorrido.foco === '4', 'el recorrido de Análisis no resaltó cada parte o no devolvió el foco: ' + JSON.stringify(recorrido));
  /* con datos, cada bloque tiene su recorrido; Esc lo cierra */
  const todos = await evaluar(`(async () => {
    const out = {};
    for (let k = 1; k <= 10; k++) {
      await SP.recorridos.empezar(k);
      await new Promise(r => setTimeout(r, 150));
      out[k] = SP.recorridos.estado.pasos.length;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      if (document.querySelector('.sp-tour')) out[k] = -out[k];
    }
    return out;
  })()`);
  ok(Object.values(todos).every(n => n >= 1), 'algún bloque no tiene recorrido o Esc no lo cerró: ' + JSON.stringify(todos));
  notas.push('recorridos: Análisis con el ejemplo (' + recorrido.vistos.length + ' pasos); pasos por bloque ' + JSON.stringify(todos));

  /* 7. modo presentación (parte 4): el resultado de Análisis y el reporte, con el teclado; Esc devuelve el foco */
  ok(await abrir(''), 'la app no volvió a cargar para la presentación');
  await evaluar(`(() => { const e = SP_EJEMPLOS.find(x => x.id === 'maiz'), l = SP.csv.leerColumnas(e.csv, { delimitador: ',', decimal: '.' }); SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: e.tipos }), 'Ejemplo: ' + e.nombre); SP.app.ir(4); SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}); return true; })()`);
  ok(await hasta(`!!document.querySelector('#anaResultado table[data-cuadro="anova"]') && !!document.querySelector('#anaResultado [data-presentar]')`), 'el resultado de bloques no trae «Presentar»');
  await evaluar(`document.querySelector('#anaResultado [data-presentar]').focus(), document.querySelector('#anaResultado [data-presentar]').click(), true`);
  const cuenta = () => evaluar('(document.querySelector(".sp-pres .sp-pres-cuenta") || {}).textContent || ""');
  const pres = await evaluar(`(() => { const c = document.querySelector('.sp-pres'); return c && { cuenta: c.querySelector('.sp-pres-cuenta').textContent, seccion: c.querySelector('.sp-pres-seccion').textContent, titulo: (c.querySelector('.sp-pres-titulo') || {}).textContent, foco: document.activeElement.dataset.pres, modal: c.getAttribute('aria-modal'), clase: document.documentElement.classList.contains('sp-presentando') }; })()`);
  const n = pres ? +((/de (\d+)/.exec(pres.cuenta) || [])[1] || 0) : 0;
  ok(pres && n >= 5 && /^1 de/.test(pres.cuenta) && /Bloques completos al azar/.test(pres.seccion) && /Bloques completos al azar/.test(pres.titulo || '') && pres.foco === 'sig' && pres.modal === 'true' && pres.clase,
    '«Presentar» no abrió las diapositivas del resultado con su título y el foco en «siguiente»: ' + JSON.stringify(pres));
  await tecla('ArrowRight', 39);
  ok(/^2 de/.test(await cuenta()), '→ no pasó a la segunda diapositiva');
  await tecla('End', 35);
  ok((await cuenta()).startsWith(n + ' de'), 'Fin no fue a la última diapositiva');
  ok(await evaluar('!!document.querySelector(".sp-pres-escena .tabla-wrap table") && !document.querySelector(".sp-pres-escena button")'), 'la última diapositiva no es un cuadro, o la copia conserva botones');
  ok(await evaluar('(() => { const v = [...document.querySelectorAll("[id]")].map(x => x.id); return v.length === new Set(v).size; })()'), 'la presentación repite ids de la página');
  await tecla('Home', 36);
  await tecla('ArrowRight', 39); await tecla('ArrowRight', 39); await tecla('ArrowRight', 39);
  ok(await evaluar('!!document.querySelector(".sp-pres-escena figure.sp-grafica svg")'), 'la cuarta diapositiva no es la gráfica');
  await tecla('Escape', 27);
  ok(await hasta('!document.querySelector(".sp-pres") && !document.documentElement.classList.contains("sp-presentando") && document.activeElement.matches("#anaResultado [data-presentar]")', 2000), 'Esc no cerró la presentación o el foco no volvió a «Presentar»');
  /* el reporte completo */
  await evaluar('document.querySelector("#anaResultado .exp-reporte").click(), SP.app.ir(5), true');
  ok(await hasta('!!document.querySelector("#repItems .rep-item")'), 'el análisis no llegó al reporte');
  await evaluar(`document.querySelector('#panel-5 [data-presentar="#repItems"]').click(), true`);
  const rep = await evaluar('(() => { const c = document.querySelector(".sp-pres"); return c && { cuenta: c.querySelector(".sp-pres-cuenta").textContent, seccion: c.querySelector(".sp-pres-seccion").textContent }; })()');
  ok(rep && /^1 de \d+/.test(rep.cuenta) && /Bloques completos al azar/.test(rep.seccion), 'el reporte no se presenta con la sección de su análisis: ' + JSON.stringify(rep));
  await tecla('Escape', 27);
  ok(await hasta('!document.querySelector(".sp-pres")', 2000), 'Esc no cerró la presentación del reporte');
  notas.push('presentación: ' + n + ' diapositivas del resultado de bloques, → Inicio Fin y Esc con el foco de vuelta; el reporte, con su sección');

  /* 8. errores en palabras (parte 4): qué pasó y qué hacer, en Análisis */
  await evaluar(`(() => { const l = SP.csv.leerColumnas('y,g\\n5,a\\n,b\\n', { delimitador: ',', decimal: '.' }); SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas }), 'una sola observación'); SP.app.ir(4); SP.app.analisis.usar('prueba-t', { modo: 'una', variable: 'y' }, {}); return true; })()`);
  ok(await hasta('!!document.querySelector("#anaResultado .sp-error")'), 'con una sola observación no apareció el recuadro de error');
  const err = await evaluar('(() => { const x = document.querySelector("#anaResultado .sp-error"); return { tipo: x.dataset.errorTipo, t: x.querySelector(".sp-error-t").textContent, m: x.querySelector(".sp-error-m").textContent, a: (x.querySelector(".sp-error-a") || {}).textContent || "", d: !!x.querySelector("details") }; })()');
  ok(err.tipo === 'datos' && /No se puede calcular así/.test(err.t) && /al menos dos observaciones/.test(err.m) && /^Qué hacer: Revisa los faltantes y el filtro/.test(err.a) && !err.d, 'el error de pocos datos no dice qué pasó y qué hacer: ' + JSON.stringify(err));
  notas.push('errores: «' + err.m + '» con «' + err.a.slice(0, 40) + '…»');

  /* 9. en un teléfono */
  ok(await abrir('', 390), 'la app a 390 px no cargó');
  const tel = await evaluar(`(() => { const c = [...document.querySelectorAll('.caminos .camino')].map(x => x.getBoundingClientRect()); return { columna: c.every((r, k) => !k || r.top > c[k - 1].bottom - 1), desborde: document.documentElement.scrollWidth > window.innerWidth + 1 }; })()`);
  ok(tel.columna && !tel.desborde, 'a 390 px los caminos no van en una columna o desbordan: ' + JSON.stringify(tel));
  const telArbol = await evaluar(`(async () => { SP.arbolUI.camino(['comparar', 'continua']); SP.app.fundamentos.arbolEn(null); await new Promise(r => setTimeout(r, 400)); const c = [...document.querySelectorAll('#funRaiz .arb-col')].map(x => x.getBoundingClientRect()); return { cols: c.length, apiladas: c.every((r, k) => !k || r.top > c[k - 1].bottom - 1), desborde: document.documentElement.scrollWidth > window.innerWidth + 1 }; })()`);
  ok(telArbol.cols === 3 && telArbol.apiladas && !telArbol.desborde, 'a 390 px el árbol no apila sus columnas o desborda: ' + JSON.stringify(telArbol));

  /* 10. la consola */
  for (const c of consola) fallas.push('consola: ' + c);
  codigo = fallas.length ? 1 : 0;
} catch (e) {
  fallas.push('la prueba no terminó: ' + e.message);
} finally {
  try { ws && ws.close(); } catch { /* nada */ }
  /* en Windows, el árbol completo: los procesos hijos del navegador retienen el perfil */
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* el navegador aún lo usa */ } }
}

console.log('SigmaPro · Inicio, historial, estados vacíos, árbol de decisiones, ayudas, recorridos, presentación y errores');
for (const n of notas) console.log('  ' + n);
for (const f of fallas) console.log('  ✗ ' + f);
guardar('orientacion', { titulo: 'Inicio, historial, estados vacíos, árbol, ayudas, recorridos, presentación y errores', ok: !fallas.length, resumen: notas.join('; '), renglones: fallas });
console.log(fallas.length ? '\nHAY FALLAS (' + fallas.length + ')' : '\nTODO APROBADO');
process.exit(fallas.length ? 1 : codigo);

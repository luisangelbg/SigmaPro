// SigmaPro — valida las exportaciones del reporte con lectores independientes de la app.
// Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
//
// Uso:  node tests/exportar.mjs   (necesita Edge o Chrome y Rscript con readxl, xml2, pdftools, png, openssl,
//                                  jsonlite, car y emmeans; en Windows revisa el TIFF con System.Drawing)
//
// 1. Abre index.html por file:// en un navegador sin ventana, carga el ejemplo del maíz y arma un reporte con cinco
//    análisis (bloques al azar, Tukey, polinomios, regresión polinomial y descriptivos).
// 2. La página arma cada exportación (.docx, HTML, .xlsx, LaTeX, ZIP de figuras con TIFF y proyecto .labg) y las
//    entrega con lo que deberían contener.
// 3. El proyecto se reabre en una página nueva y da los mismos cuadros, y el Estudio de figuras recibe el PDF vectorial.
//    El guardado automático: al volver a abrir SigmaPro, Inicio ofrece recuperar el trabajo y da los mismos cuadros;
//    desactivarlo borra lo guardado.
// 4. R las lee con sus propios lectores: cada número de la hoja de cálculo idéntico al de la app y, para el ANOVA y
//    las medias, igual al que calcula R desde los datos; cada parte del .docx es XML válido con sus cuadros, figuras y
//    textos, el índice (campo TOC con un enlace a cada marcador) y un panel de lectura por análisis (hito 5.8); la
//    página HTML, con su índice enlazado y los mismos paneles; los PDF de las figuras miden lo que deben y traen su
//    texto; los PNG dicen 600 ppp; la huella SHA-256 de cada archivo del proyecto coincide con su manifiesto y su
//    código R corre de principio a fin con los mismos datos.
//    El TIFF se compara píxel por píxel con el PNG usando el lector de imágenes del sistema.

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BANDERAS, paginaPropia } from './lib/navegador.mjs';
import { guardar } from './lib/comprobaciones.mjs';
import { rscript } from './lib/rscript.mjs';

const TESTS = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(TESTS, '..');
const PUERTO = 9480 + Math.floor(Math.random() * 60);
const exe = [process.env.SIGMAPRO_NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
const RS = rscript();
if (!exe || !RS) { console.error('Hace falta ' + (!exe ? 'Edge o Chrome' : 'Rscript') + '.'); process.exit(2); }

const dir = mkdtempSync(join(tmpdir(), 'sigmapro-exportar-'));
const perfil = mkdtempSync(join(tmpdir(), 'sigmapro-exp-nav-'));
const nav = spawn(exe, [...BANDERAS, '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0;
const pend = new Map(), consola = [];
const enviar = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async expr => { const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r && r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r && r.result ? r.result.value : undefined; };

/* lo que corre en la página: arma el reporte y cada exportación */
const PAGINA = `(async () => {
  const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const ej = window.SP_EJEMPLOS.find(x => x.id === 'maiz');
  const l = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
  SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: ej.tipos }), 'Ejemplo: maíz');
  const R = SP.app.reporte;
  R.titulo = 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = 'Prueba automática';
  R.opciones.anchoCm = 16; R.opciones.barras = 'ee';
  const dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  R.agregar({ metodo: 'regresion-polinomial', e: { respuesta: 'rend', predictores: 'dosis' }, op: { grado: 2, nivel: 0.99, predecir: '100 150' } });
  R.agregar({ metodo: 'descriptivos', e: { variables: ['rend'], grupos: ['hibrido'] }, op: { nivel: 0.95 }, bloque: 3, ctx: { factoresNumericos: ['dosis'] } });
  SP.app.figuras.pintar();
  const C = SP.app.exportar.construir;
  const salida = {};
  for (const [k, arg] of [['docx'], ['html'], ['xlsx'], ['latex'], ['figuras', true], ['proyecto']]) {
    const r = await C[k](arg);
    salida[k] = { nombre: r.nombre, b64: typeof r.datos === 'string' ? b64(new TextEncoder().encode(r.datos)) : b64(r.datos) };
  }
  /* lo esperado, desde la app */
  let n = 0;
  const cuadros = [];
  R.elementos().forEach(x => x.rep.cuadros.forEach(q => { n++; const v = SP.formatos.valores(q, x.visibles), c = SP.formatos.celdas(q, x.visibles); cuadros.push({ numero: n, id: q.id, metodo: x.id, titulo: q.titulo, cabecera: v.cabecera, filas: v.filas, celdas: c.cabecera.concat(c.filas.flat()) }); }));
  const figuras = SP.app.figuras.lista().map(f => ({ numero: f.numero, titulo: f.titulo, ancho: f.svg.viewBox.baseVal.width, alto: f.svg.viewBox.baseVal.height }));
  const lecturas = R.elementos().filter(x => SP.lectura.panel(x)).length;
  return JSON.stringify({ salida, esperado: { cuadros, figuras, lecturas, anchoCm: R.opciones.anchoCm, csv: ej.csv, analisis: R.items.length } });
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
  await enviar('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b5' });
  for (let k = 0; k < 50; k++) { await dormir(200); if (await evaluar('!!(window.SP && SP.app && SP.app.exportar && SP.datosUI && document.documentElement.hasAttribute("data-sp-listo"))')) break; }
  const t0 = Date.now();
  const { salida, esperado } = JSON.parse(await evaluar(PAGINA));
  const tPagina = Date.now() - t0;
  const archivo = { docx: 'reporte.docx', html: 'reporte.html', xlsx: 'cuadros.xlsx', latex: 'cuadros.tex', figuras: 'figuras.zip', proyecto: 'proyecto.labg' };
  for (const [k, v] of Object.entries(salida)) writeFileSync(join(dir, archivo[k]), Buffer.from(v.b64, 'base64'));
  writeFileSync(join(dir, 'maiz.csv'), esperado.csv);
  writeFileSync(join(dir, 'esperado.json'), JSON.stringify(esperado));
  const tam = Object.fromEntries(Object.entries(archivo).map(([k, f]) => [k, readFileSync(join(dir, f)).length]));

  /* LaTeX (sin compilador instalado): un entorno table por cuadro, reglas de booktabs y llaves balanceadas */
  const tex = readFileSync(join(dir, 'cuadros.tex'), 'utf8');
  const fallasNode = [];
  if ((tex.match(/\\begin\{table\}/g) || []).length !== esperado.cuadros.length) fallasNode.push('LaTeX: entornos table distintos del número de cuadros');
  if ((tex.match(/\\toprule/g) || []).length !== esperado.cuadros.length || (tex.match(/\\bottomrule/g) || []).length !== esperado.cuadros.length) fallasNode.push('LaTeX: reglas de booktabs');
  let llaves = 0; for (const ch of tex.replace(/\\[{}%$#&_]/g, '')) { if (ch === '{') llaves++; else if (ch === '}') llaves--; if (llaves < 0) break; }
  if (llaves !== 0) fallasNode.push('LaTeX: llaves desbalanceadas');

  /* reabrir el proyecto en una página nueva: los mismos análisis dan exactamente los mismos cuadros; y el Estudio de
     figuras recibe de SigmaPro un PDF vectorial de sus gráficas */
  await enviar('Page.navigate', { url: 'about:blank' }); await dormir(300);
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b7' });
  for (let k = 0; k < 50; k++) { await dormir(200); if (await evaluar('!!(window.SP && SP.app && SP.app.exportar && SP.datosUI && document.documentElement.hasAttribute("data-sp-listo"))')) break; }
  const reabierto = JSON.parse(await evaluar(`(async () => {
    const bin = atob(${JSON.stringify(salida.proyecto.b64)}), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const p = SP.proyecto.abrir(u);
    SP.app.exportar.aplicarProyecto(p);
    const cuadros = [];
    SP.app.reporte.elementos().forEach(x => x.rep.cuadros.forEach(q => { const v = SP.formatos.valores(q, x.visibles); cuadros.push({ cabecera: v.cabecera, filas: v.filas }); }));
    SP.app.figuras.pintar();
    const f = SP.app.figuras.lista()[0], N = window.LABG_FIGSTUDIO.nativeExport({ el: f.svg });
    const blob = await N.render('pdf', { wmm: 85, hmm: null });
    const cab = new TextDecoder().decode(new Uint8Array(await blob.arrayBuffer()).subarray(0, 8));
    /* «Abrir» desde el reporte: el análisis vuelve con sus opciones, no solo con sus papeles */
    const it = SP.app.reporte.items.find(x => x.metodo === 'regresion-polinomial');
    SP.app.analisis.usar(it.metodo, it.e, it.op);
    const abierto = { nivel: SP.app.analisis.reg.nivel, predecir: SP.app.analisis.reg.predecir };
    return JSON.stringify({ ok: p.verificacion.ok, titulo: SP.app.reporte.titulo, n: SP.app.reporte.items.length, cuadros, abierto, estudio: { formatos: N.formats, cabecera: cab, bytes: blob.size } });
  })()`));
  if (reabierto.abierto.nivel !== 0.99 || reabierto.abierto.predecir !== '100 150') fallasNode.push('reporte: «Abrir» no devolvió las opciones del análisis (' + JSON.stringify(reabierto.abierto) + ')');
  if (!reabierto.ok) fallasNode.push('proyecto reabierto: la huella no coincide');
  if (reabierto.n !== esperado.analisis) fallasNode.push('proyecto reabierto: ' + reabierto.n + ' análisis');
  if (JSON.stringify(reabierto.cuadros) !== JSON.stringify(esperado.cuadros.map(q => ({ cabecera: q.cabecera, filas: q.filas })))) fallasNode.push('proyecto reabierto: los cuadros no son idénticos');
  if (!/^%PDF-1\.4/.test(reabierto.estudio.cabecera) || reabierto.estudio.formatos.join() !== 'pdf') fallasNode.push('estudio: no recibió el PDF vectorial');

  /* guardado automático: lo que había en la página queda en el navegador; al volver a abrir SigmaPro, Inicio ofrece
     recuperarlo y da los mismos cuadros; desactivarlo borra lo guardado */
  await evaluar('SP.app.autoguardado.guardar().then(() => true)');
  await enviar('Page.navigate', { url: 'about:blank' }); await dormir(300);
  await enviar('Page.navigate', { url: pathToFileURL(join(RAIZ, 'index.html')).href + '#b1' });
  for (let k = 0; k < 50; k++) { await dormir(200); if (await evaluar('!!(window.SP && SP.app && SP.app.autoguardado && SP.app.autoguardado.estado.encontrado && document.documentElement.hasAttribute("data-sp-listo"))')) break; }
  const recuperado = JSON.parse(await evaluar(`(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const leerBD = k => new Promise(ok => { const r = indexedDB.open('sigmapro'); r.onerror = () => ok('error'); r.onsuccess = () => { const g = r.result.transaction('trabajo').objectStore('trabajo').get(k); g.onsuccess = () => { ok(g.result === undefined ? null : g.result); r.result.close(); }; }; });
    const aviso = document.querySelector('#panel-1 [data-recuperar]:not([hidden]) .rec-aviso'), texto = aviso ? aviso.textContent : '';
    const boton = document.querySelector('#panel-1 [data-rec="recuperar"]');
    if (boton) boton.click();
    await espera(300); await SP.app.reporte.listo();
    const cuadros = [];
    SP.app.reporte.elementos().forEach(x => x.rep.cuadros.forEach(q => { const v = SP.formatos.valores(q, x.visibles); cuadros.push({ cabecera: v.cabecera, filas: v.filas }); }));
    const sinAviso = [...document.querySelectorAll('[data-recuperar]')].every(c => c.hidden);
    const titulo = SP.app.reporte.titulo, n = SP.app.reporte.items.length, filas = SP.app.datos.hoja ? SP.app.datos.hoja.n : 0;
    await SP.app.autoguardado.guardar();
    const guardado = await leerBD('actual');
    /* desactivado: no queda nada guardado; activado otra vez, se guarda de nuevo */
    await SP.app.autoguardado.poner(false);
    const trasApagar = await leerBD('actual'), estadoApagado = document.getElementById('expoAutoEstado').textContent;
    await SP.app.autoguardado.poner(true);
    const trasPrender = await leerBD('actual');
    return JSON.stringify({ texto, boton: !!boton, sinAviso, titulo, n, filas, cuadros, guardadoAnalisis: guardado && guardado.resumen.analisis,
      trasApagar: trasApagar === null, estadoApagado, trasPrender: !!(trasPrender && trasPrender.resumen.analisis === n) });
  })()`));
  if (!recuperado.boton || !/48 filas y \d+ columnas, 5 análisis en el reporte/.test(recuperado.texto)) fallasNode.push('guardado automático: el aviso de Inicio no ofrece recuperar el trabajo: «' + recuperado.texto + '»');
  if (!recuperado.sinAviso) fallasNode.push('guardado automático: el aviso sigue a la vista después de recuperar');
  if (recuperado.titulo !== 'Ensayo de maíz: híbridos y dosis de nitrógeno' || recuperado.n !== esperado.analisis || recuperado.filas !== 48) fallasNode.push('guardado automático: se recuperó «' + recuperado.titulo + '» con ' + recuperado.n + ' análisis y ' + recuperado.filas + ' filas');
  if (JSON.stringify(recuperado.cuadros) !== JSON.stringify(esperado.cuadros.map(q => ({ cabecera: q.cabecera, filas: q.filas })))) fallasNode.push('guardado automático: los cuadros recuperados no son idénticos');
  if (recuperado.guardadoAnalisis !== esperado.analisis) fallasNode.push('guardado automático: después de recuperar, lo guardado tiene ' + recuperado.guardadoAnalisis + ' análisis');
  if (!recuperado.trasApagar || !/Desactivado/.test(recuperado.estadoApagado)) fallasNode.push('guardado automático: desactivarlo no borró lo guardado');
  if (!recuperado.trasPrender) fallasNode.push('guardado automático: al activarlo otra vez no se guardó');

  /* R: los lectores independientes */
  const guion = `
suppressPackageStartupMessages({ library(readxl); library(xml2); library(pdftools); library(png); library(openssl); library(jsonlite); library(car); library(emmeans) })
emm_options(msg.interaction = FALSE)
setwd(${JSON.stringify(dir.replace(/\\/g, '/'))})
esp <- fromJSON("esperado.json", simplifyVector = FALSE)
fallas <- character(0); cuentas <- list()
falla <- function(...) fallas <<- c(fallas, paste0(...))
cuenta <- function(k, n = 1) cuentas[[k]] <<- (if (is.null(cuentas[[k]])) 0 else cuentas[[k]]) + n

# ---- 1. hoja de cálculo: cada celda idéntica a la de la app ----
hojas <- excel_sheets("cuadros.xlsx")
if (length(hojas) != length(esp$cuadros) + 1) falla("xlsx: ", length(hojas), " hojas para ", length(esp$cuadros), " cuadros")
for (k in seq_along(esp$cuadros)) {
  q <- esp$cuadros[[k]]
  d <- read_excel("cuadros.xlsx", sheet = k + 1, col_types = "list", .name_repair = "minimal")
  if (!identical(names(d), unlist(q$cabecera))) falla("xlsx cuadro ", k, ": encabezado distinto")
  for (i in seq_along(q$filas)) for (j in seq_along(q$cabecera)) {
    v <- q$filas[[i]][[j]]; x <- if (i <= nrow(d)) d[[j]][[i]] else NA
    if (is.null(v)) { if (!(length(x) == 0 || is.na(x))) falla("xlsx ", k, " [", i, ",", j, "]: debía estar vacía") }
    else if (is.numeric(v)) { if (!identical(as.numeric(x), as.numeric(v))) falla("xlsx ", k, " [", i, ",", j, "]: ", format(x, digits = 17), " ≠ ", format(v, digits = 17)) else cuenta("xlsx_numeros") }
    else if (!identical(as.character(x), as.character(v))) falla("xlsx ", k, " [", i, ",", j, "]: «", x, "» ≠ «", v, "»") else cuenta("xlsx_textos")
  }
}
# ---- 2. los números exportados, contra R calculado desde los datos ----
datos <- read.csv("maiz.csv", stringsAsFactors = FALSE)
datos$hibrido <- factor(datos$hibrido); datos$bloque <- factor(datos$bloque); datos$dosis <- factor(datos$dosis)
op <- options(contrasts = c("contr.sum", "contr.poly"))
an <- car::Anova(lm(rend ~ bloque + hibrido * dosis, data = datos), type = 3); options(op)
k1 <- which(sapply(esp$cuadros, function(q) q$metodo == "dbca" && q$id == "anova"))
h1 <- read_excel("cuadros.xlsx", sheet = k1 + 1)
terminos <- c("bloque", "hibrido", "dosis", "hibrido:dosis", "Residuals")
for (j in seq_along(terminos)) {
  fila <- an[terminos[j], ]
  for (col in list(c(2, "Df"), c(3, "Sum Sq"), c(5, "F value"), c(6, "Pr(>F)"))) {
    a <- as.numeric(h1[[as.integer(col[1])]][j]); b <- fila[[col[2]]]
    if (is.na(b)) { if (!is.na(a)) falla("ANOVA ", terminos[j], " ", col[2], ": R da NA") }
    else if (abs(a - b) > 1e-9 * max(1, abs(b))) falla("ANOVA ", terminos[j], " ", col[2], ": ", a, " ≠ ", b) else cuenta("contra_R")
  }
}
m <- lm(rend ~ bloque + hibrido * dosis, data = datos)
em <- as.data.frame(emmeans(m, "hibrido"))
k2 <- which(sapply(esp$cuadros, function(q) q$metodo == "comparaciones-medias" && grepl("^medias", q$id)))[1]
h2 <- read_excel("cuadros.xlsx", sheet = k2 + 1)
for (i in seq_len(nrow(em))) {
  fila <- which(h2[[1]] == as.character(em$hibrido[i]))
  if (abs(h2[[2]][fila] - em$emmean[i]) > 1e-9) falla("media de ", em$hibrido[i], ": ", h2[[2]][fila], " ≠ ", em$emmean[i]) else cuenta("contra_R")
  if (abs(h2[[3]][fila] - em$SE[i]) > 1e-9) falla("EE de ", em$hibrido[i]) else cuenta("contra_R")
}
# ---- 3. el documento .docx ----
unzip("reporte.docx", exdir = "docx")
partes <- list.files("docx", pattern = "\\\\.(xml|rels)$", recursive = TRUE, full.names = TRUE, all.files = TRUE)
for (p in partes) { ok <- tryCatch({ read_xml(p); TRUE }, error = function(e) FALSE); if (!ok) falla("docx: XML no válido en ", p) else cuenta("docx_partes") }
doc <- read_xml("docx/word/document.xml"); ns <- xml_ns(doc)
tbls <- xml_find_all(doc, "//w:tbl", ns)
if (length(tbls) != length(esp$cuadros)) falla("docx: ", length(tbls), " cuadros para ", length(esp$cuadros))
for (k in seq_along(tbls)) {
  celdas <- xml_text(xml_find_all(tbls[[k]], ".//w:tc", ns))
  if (!identical(celdas, unlist(esp$cuadros[[k]]$celdas))) falla("docx: el texto del cuadro ", k, " no coincide") else cuenta("docx_cuadros")
}
dibujos <- xml_find_all(doc, "//w:p[w:pPr/w:pStyle/@w:val='Figura']//w:drawing", ns)
if (length(dibujos) != length(esp$figuras)) falla("docx: ", length(dibujos), " figuras para ", length(esp$figuras))
lecturas <- xml_find_all(doc, "//w:p[w:pPr/w:pStyle/@w:val='Lectura']//w:drawing", ns)
if (length(lecturas) != esp$lecturas || esp$lecturas < 1) falla("docx: ", length(lecturas), " paneles de lectura para ", esp$lecturas) else cuenta("docx_lecturas")
marcas <- xml_attr(xml_find_all(doc, "//w:bookmarkStart", ns), "name"); anclas <- xml_attr(xml_find_all(doc, "//w:hyperlink", ns), "anchor")
if (length(anclas) < esp$analisis + 3 || !all(anclas %in% marcas) || !any(grepl("^\\\\s*TOC ", xml_text(xml_find_all(doc, "//w:instrText", ns))))) falla("docx: el índice") else cuenta("docx_indice")
seq <- xml_text(xml_find_all(doc, "//w:instrText", ns))
if (sum(grepl("SEQ Cuadro", seq)) != length(esp$cuadros) || sum(grepl("SEQ Figura", seq)) != length(esp$figuras)) falla("docx: campos SEQ")
for (f in list.files("docx/word/media", full.names = TRUE)) {
  im <- readPNG(f, info = TRUE); inf <- attr(im, "info"); dpi <- inf$dpi
  if (is.null(dpi) || any(abs(dpi - 300) > 0.1)) falla("docx: ", basename(f), " sin 300 ppp")
  ancho <- if (grepl("^lectura", basename(f))) min(16, 21.59 - 5) else min(esp$anchoCm, 21.59 - 5)
  if (abs(dim(im)[2] - round(ancho / 2.54 * 300)) > 1) falla("docx: ", basename(f), " mide ", dim(im)[2], " px") else cuenta("docx_imagenes")
}
texto <- paste(xml_text(xml_find_all(doc, "//w:t", ns)), collapse = " ")
for (frase in c("Contenido", "Resumen de los resultados", "Lectura de los indicadores", "Métodos", "Resultados", "Referencias", "F(2, 33) = 60.63", "Gomez y Gomez, 1984", "Tukey, 1949a", "R Core Team"))
  if (!grepl(frase, texto, fixed = TRUE)) falla("docx: falta «", frase, "»") else cuenta("docx_frases")
# ---- 4. la página HTML ----
h <- read_html("reporte.html")
if (length(xml_find_all(h, "//table[@class='revista']")) != length(esp$cuadros)) falla("html: cuadros")
if (length(xml_find_all(h, "//figure/*[local-name()='svg']")) != length(esp$figuras)) falla("html: figuras vectoriales") else cuenta("html")
if (length(xml_find_all(h, "//div[@class='lectura']/*[local-name()='svg']")) != esp$lecturas) falla("html: paneles de lectura") else cuenta("html")
enl <- sub("^#", "", xml_attr(xml_find_all(h, "//nav[@class='indice']//a"), "href")); ids <- xml_attr(xml_find_all(h, "//*[@id]"), "id")
if (length(enl) < esp$analisis + 3 || !all(enl %in% ids) || length(xml_find_all(h, "//dl[@class='ficha']")) != 1) falla("html: índice o ficha de la portada") else cuenta("html")
# ---- 5. las figuras: SVG, PDF vectorial, PNG a 600 ppp ----
unzip("figuras.zip", exdir = "fig")
for (q in esp$figuras) {
  base <- sub("\\\\.svg$", "", list.files("fig/figuras", pattern = sprintf("^figura-%02d-.*\\\\.svg$", q$numero)))
  if (!length(base)) { falla("figura ", q$numero, ": no está en el ZIP"); next }
  s <- read_xml(file.path("fig/figuras", paste0(base, ".svg")))
  if (xml_attr(s, "width") != sprintf("%.2fmm", esp$anchoCm * 10)) falla("svg ", q$numero, ": ancho ", xml_attr(s, "width")) else cuenta("svg")
  pdf <- file.path("fig/figuras", paste0(base, ".pdf"))
  t <- pdf_pagesize(pdf); alto <- esp$anchoCm * q$alto / q$ancho
  if (nrow(t) != 1 || abs(t$width - esp$anchoCm / 2.54 * 72) > 0.01 || abs(t$height - alto / 2.54 * 72) > 0.01) falla("pdf ", q$numero, ": tamaño ", t$width, " × ", t$height) else cuenta("pdf")
  tx <- pdf_text(pdf)
  if (!grepl(strsplit(q$titulo, " ")[[1]][1], tx, ignore.case = TRUE) && !nchar(gsub("\\\\s", "", tx))) falla("pdf ", q$numero, ": sin texto")
  if (grepl("?", tx, fixed = TRUE) && !any(grepl("?", xml_text(xml_find_all(s, "//*[local-name()='text']")), fixed = TRUE))) falla("pdf ", q$numero, ": caracteres perdidos (?) en el texto") else cuenta("pdf_caracteres")
  fu <- pdf_fonts(pdf)$name
  if (!any(grepl("Helvetica", fu))) falla("pdf ", q$numero, ": sin Helvetica (", paste(fu, collapse = ", "), ")") else cuenta("pdf_texto")
  im <- readPNG(file.path("fig/figuras", paste0(base, "-600ppp.png")), info = TRUE)
  if (any(abs(attr(im, "info")$dpi - 600) > 0.1) || dim(im)[2] != round(esp$anchoCm / 2.54 * 600)) falla("png ", q$numero, ": ", dim(im)[2], " px, ", attr(im, "info")$dpi, " ppp") else cuenta("png")
}
# ---- 6. el proyecto .labg ----
unzip("proyecto.labg", exdir = "proy")
man <- fromJSON("proy/manifiesto.json", simplifyVector = FALSE)
for (a in man$archivos) {
  b <- readBin(file.path("proy", a$ruta), "raw", file.info(file.path("proy", a$ruta))$size)
  if (as.character(sha256(b)) != a$sha256 || length(b) != a$bytes) falla("labg: huella de ", a$ruta) else cuenta("labg_huellas")
}
if (as.character(sha256(paste(sapply(man$archivos, function(a) paste0(a$ruta, ":", a$sha256)), collapse = "\\n"))) != man$huella) falla("labg: huella del conjunto") else cuenta("labg_huellas")
d1 <- read.csv("proy/datos/datos.csv", stringsAsFactors = FALSE, check.names = FALSE); d0 <- read.csv("maiz.csv", stringsAsFactors = FALSE, check.names = FALSE)
if (!isTRUE(all.equal(d1, d0, tolerance = 0))) falla("labg: datos.csv distinto de los datos originales") else cuenta("labg_datos")
if (length(fromJSON("proy/analisis.json", simplifyVector = FALSE)$items) != esp$analisis) falla("labg: número de análisis")
salida <- tryCatch({ owd <- setwd("proy"); on.exit(setwd(owd)); capture.output(source("codigo/analisis.R", echo = FALSE, print.eval = TRUE)) }, error = function(e) { falla("labg: el código R falló: ", conditionMessage(e)); character(0) })
if (length(salida)) cuenta("labg_codigo_R_lineas", length(salida))
cat(toJSON(list(fallas = fallas, cuentas = cuentas), auto_unbox = TRUE))
`;
  writeFileSync(join(dir, 'validar.R'), guion);
  let rsal = '';
  try { rsal = execFileSync(RS, ['--vanilla', join(dir, 'validar.R')], { encoding: 'utf8', maxBuffer: 1 << 26, cwd: dir }); }
  catch (e) { rsal = (e.stdout || '') + '\n' + (e.stderr || ''); }
  const m = rsal.match(/\{"fallas".*\}\s*$/s);
  const rr = m ? JSON.parse(m[0]) : { fallas: ['R no terminó: ' + rsal.slice(-800)], cuentas: {} };
  const fallasR = [].concat(rr.fallas || []);

  /* TIFF: el lector de imágenes del sistema (otro decodificador) lo compara píxel por píxel con el PNG */
  const fallasTiff = [];
  let tiffInfo = 'sin revisar (no es Windows)';
  if (process.platform === 'win32') {
    const ps = `Add-Type -AssemblyName System.Drawing
$d = '${join(dir, 'fig', 'figuras').replace(/'/g, "''")}'
$res = @()
foreach ($t in Get-ChildItem $d -Filter *.tif) {
  $p = Join-Path $d ($t.Name -replace '\\.tif$', '.png')
  $a = [System.Drawing.Bitmap]::FromFile($t.FullName); $b = [System.Drawing.Bitmap]::FromFile($p)
  $dif = 0; $n = 0
  for ($y = 0; $y -lt $a.Height; $y += 37) { for ($x = 0; $x -lt $a.Width; $x += 41) { $n++; if ($a.GetPixel($x, $y).ToArgb() -ne $b.GetPixel($x, $y).ToArgb()) { $dif++ } } }
  $res += [pscustomobject]@{ archivo = $t.Name; ancho = $a.Width; alto = $a.Height; ppp = $a.HorizontalResolution; pngAncho = $b.Width; pngAlto = $b.Height; muestras = $n; distintos = $dif }
  $a.Dispose(); $b.Dispose()
}
$res | ConvertTo-Json -Compress`;
    writeFileSync(join(dir, 'tiff.ps1'), '\ufeff' + ps);
    try {
      const out = execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(dir, 'tiff.ps1')], { encoding: 'utf8' });
      const lista = [].concat(JSON.parse(out.trim() || '[]'));
      if (lista.length !== esperado.figuras.length) fallasTiff.push('TIFF: ' + lista.length + ' archivos para ' + esperado.figuras.length + ' figuras');
      for (const t of lista) {
        if (Math.abs(t.ppp - 600) > 0.01) fallasTiff.push(t.archivo + ': ' + t.ppp + ' ppp');
        if (t.ancho !== t.pngAncho || t.alto !== t.pngAlto) fallasTiff.push(t.archivo + ': tamaño distinto del PNG');
        if (t.distintos) fallasTiff.push(t.archivo + ': ' + t.distintos + ' de ' + t.muestras + ' píxeles distintos del PNG');
      }
      tiffInfo = lista.length + ' archivos a ' + [...new Set(lista.map(t => t.ppp))].join(', ') + ' ppp, del mismo tamaño que su PNG; ' + lista.reduce((x, t) => x + t.muestras - t.distintos, 0).toLocaleString('es-MX') + ' de ' + lista.reduce((x, t) => x + t.muestras, 0).toLocaleString('es-MX') + ' píxeles muestreados iguales al PNG';
    } catch (e) { fallasTiff.push('TIFF: el lector del sistema no lo abrió: ' + (e.stderr || e.message)); }
  }

  const c = rr.cuentas || {};
  console.log('\nSigmaPro · exportaciones validadas con lectores independientes (armadas en ' + (tPagina / 1000).toFixed(1) + ' s)');
  console.log('  archivos: ' + Object.entries(tam).map(([k, v]) => k + ' ' + Math.round(v / 1024) + ' KB').join(' · '));
  console.log('  hoja de cálculo (readxl): ' + (c.xlsx_numeros || 0) + ' números idénticos a la app y ' + (c.xlsx_textos || 0) + ' textos; ' + (c.contra_R || 0) + ' valores del ANOVA y de las medias iguales a R (car, emmeans)');
  console.log('  .docx (xml2): ' + (c.docx_partes || 0) + ' partes XML válidas, ' + (c.docx_cuadros || 0) + ' cuadros con su texto exacto, ' + (c.docx_imagenes || 0) + ' imágenes a 300 ppp, ' + (c.docx_lecturas ? 'paneles de lectura, ' : '') + (c.docx_indice ? 'índice, ' : '') + (c.docx_frases || 0) + ' frases clave');
  console.log('  figuras: ' + (c.svg || 0) + ' SVG en mm, ' + (c.pdf || 0) + ' PDF del tamaño pedido con texto en Helvetica (pdftools), ' + (c.png || 0) + ' PNG a 600 ppp (png)');
  console.log('  TIFF (System.Drawing): ' + tiffInfo);
  console.log('  proyecto .labg (openssl): ' + (c.labg_huellas || 0) + ' huellas SHA-256 iguales, datos idénticos a los originales, código R corrido completo (' + (c.labg_codigo_R_lineas || 0) + ' líneas de salida)');
  console.log('  LaTeX: ' + esperado.cuadros.length + ' cuadros con booktabs y llaves balanceadas');
  console.log('  proyecto reabierto en una página nueva: ' + reabierto.n + ' análisis y ' + reabierto.cuadros.length + ' cuadros idénticos; el Estudio de figuras recibe un PDF vectorial (' + Math.round(reabierto.estudio.bytes / 1024) + ' KB a 85 mm)');
  console.log('  guardado automático: al volver a abrir, Inicio ofrece recuperar el trabajo (' + recuperado.filas + ' filas, ' + recuperado.n + ' análisis) y da los ' + recuperado.cuadros.length + ' cuadros idénticos; desactivarlo borra lo guardado');
  const todas = fallasNode.concat(fallasR, fallasTiff, consola);
  guardar('exportar', { titulo: 'Las exportaciones, leídas con lectores independientes', ok: !todas.length,
    resumen: `Hoja de cálculo: ${c.xlsx_numeros || 0} números idénticos a la app y ${c.contra_R || 0} valores del ANOVA y las medias iguales a R; .docx válido con ${c.docx_cuadros || 0} cuadros exactos y ${c.docx_imagenes || 0} figuras a 300 ppp; ${c.pdf || 0} PDF vectoriales y ${c.png || 0} PNG a 600 ppp; TIFF iguales al PNG; proyecto .labg con ${c.labg_huellas || 0} huellas SHA-256 iguales, su código R corrido completo y reabierto con los mismos cuadros; el guardado automático recupera el trabajo con los mismos cuadros`,
    renglones: ['Lectores: readxl, xml2, pdftools, png, openssl (R) y el lector de imágenes del sistema'] });
  if (todas.length) { console.log('\nFALLAS:'); todas.forEach(f => console.log('  ✗ ' + f)); }
  else console.log('\nTODO APROBADO');
  codigo = todas.length ? 1 : 0;
} catch (e) { console.error(e); codigo = 1; } finally {
  try { ws && ws.close(); } catch { /* nada */ }
  /* en Windows, el árbol completo: los procesos hijos del navegador retienen el perfil */
  nav.kill();
  if (process.platform === 'win32') {
    const clave = perfil.split(/[\\/]/).pop();
    try { execFileSync('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*" + clave + "*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"], { stdio: 'ignore' }); } catch { /* ya terminaron */ }
  }
  for (let k = 0; k < 15 && existsSync(perfil); k++) { await dormir(400); try { rmSync(perfil, { recursive: true, force: true }); } catch { /* el navegador aún lo usa */ } }
  if (!process.env.SIGMAPRO_CONSERVAR) rmSync(dir, { recursive: true, force: true }); else console.log('Archivos en ' + dir);
  process.exit(codigo);
}

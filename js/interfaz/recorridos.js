/* SigmaPro — recorridos por bloque (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un recorrido guiado por las partes de un bloque: cada paso resalta una (el resto de la página se oscurece) y explica
   en dos líneas para qué sirve, con «Anterior», «Siguiente» y «Terminar». Lo abre el botón «Recorrido» del título de
   cada bloque (data-recorrido="n"); el de Inicio recorre la app. Los pasos cuya parte no se ve (por ejemplo, la hoja
   sin datos) se saltan; en los bloques que piden datos, si no hay, el recorrido ofrece cargar el ejemplo del maíz
   (la tabla de antes queda en «Volver a la tabla anterior»).
   La ventana no es modal: Esc la cierra, ← y → cambian de paso, y al terminar el foco vuelve al botón que la abrió.

     SP.recorridos.empezar(bloque, boton?)   promesa; true si empezó
     SP.recorridos.pasos(bloque)             [{ sel, titulo, texto }] (todos, se vean o no)
     SP.recorridos.terminar() */
(function () {
  'use strict';
  const T = SP.T;
  const esc_ = s => SP.ui.esc(s);
  const L = () => window.LABG;
  const MAIZ = 'maiz', DBCA = { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };

  /* [selector (o varios, separados por « | »), título, texto] */
  const RECORRIDOS = () => ({
    1: { titulo: T('Recorrido por SigmaPro'), pasos: [
      ['.caminos', T('Por dónde empezar'), T('Con tus datos, con un ejemplo o con el árbol de decisiones, que lleva de tu pregunta al análisis sin datos.')],
      ['.lnav-side-nav | #stepper', T('Los diez bloques'), T('Del dato a la conclusión: los datos, explorarlos, analizarlos, el reporte, las figuras y exportar. Cada bloque se abre en cualquier momento; Alt + ← y → pasan al anterior y al siguiente.')],
      ['#iniHistorial', T('Lo último que analizaste'), T('Cada análisis que calculas queda aquí; un clic lo vuelve a abrir, con sus variables y sus opciones.')],
      ['.lnav-k', T('Buscar'), T('Ctrl K encuentra bloques, secciones, botones y campos por su nombre y lleva hasta ellos.')],
      ['#glosarioBtn', T('El glosario'), T('Ctrl G abre las definiciones de los términos de los cuadros, cada uno con un ejemplo donde aparece.')],
      ['#helpBtn', T('Los atajos de teclado'), T('La tecla ? muestra dónde estás y todos los atajos.')],
      ['.lang-seg', T('Español o inglés'), T('La interfaz y los textos de los resultados, en los dos idiomas.')],
    ] },
    2: { titulo: T('Recorrido por Datos'), pideDatos: true, pasos: [
      ['#datInicio | #datImportar', T('Cargar la tabla'), T('Importa un archivo (CSV, TSV, .xlsx u .ods), pega desde una hoja de cálculo o abre un ejemplo. Los datos se leen aquí mismo: no salen de tu equipo.')],
      ['#datRejilla', T('La hoja'), T('Se edita como una hoja de cálculo: flechas, Ctrl+C y Ctrl+V, y Ctrl+Z para deshacer.')],
      ['#datLista', T('Las variables'), T('Cada columna con su tipo: factor, numérica, fecha, texto o identificador. El tipo decide en qué papel entra a los análisis.')],
      ['#datDetalle', T('Una variable de cerca'), T('Su tipo, el orden de sus niveles y lo que SigmaPro reconoció en ella.')],
      ['#datCalcular', T('Preparar los datos'), T('Variables calculadas, transformaciones, filtros y el cambio de tabla ancha a larga.')],
      ['#datEstructura', T('Lo que SigmaPro ve en tu ensayo'), T('El diseño que reconoce en los datos, los faltantes y las celdas vacías.')],
    ] },
    3: { titulo: T('Recorrido por Explorar'), pideDatos: true, pasos: [
      ['#expVacio', T('Sin datos'), T('Carga una tabla o un ejemplo aquí mismo; el resumen aparece en cuanto llegan los datos.')],
      ['#expTipos', T('El tipo de resumen'), T('Descriptivos, frecuencias, proporciones y bondad de ajuste.')],
      ['#expOpciones', T('Las opciones'), T('Las variables, los grupos y el nivel de confianza; el resultado cambia al momento.')],
      ['#expResultado', T('El resultado'), T('La conclusión en palabras, el cuadro, el código R y «Agregar al reporte».')],
    ] },
    4: { titulo: T('Recorrido por Análisis'), pideDatos: true, preparar: () => SP.app.analisis.usar('dbca', JSON.parse(JSON.stringify(DBCA)), {}), pasos: [
      ['#anaVacio', T('Sin datos'), T('Carga una tabla o un ejemplo aquí mismo; el tamaño de muestra y la potencia no los necesitan.')],
      ['#anaModos', T('Tres maneras de elegir'), T('El asistente pregunta por tu ensayo; el catálogo lista todos los análisis; el constructor arma el modelo.')],
      ['.ana-historial', T('Historial'), T('Los análisis que ya calculaste, para volver a ellos.')],
      ['#anaOpciones', T('El formulario'), T('Las variables en su papel y las opciones del método; el resultado se calcula al momento.')],
      ['#anaResultado .sp-detalle', T('Básico, Estándar o Experto'), T('Cuánto del resultado se ve, en toda la app.')],
      ['#anaResultado .sp-claro | #anaResultado .exp-conclusion', T('En pocas palabras'), T('El resultado sin símbolos estadísticos; debajo, la conclusión con sus cifras.')],
      ['#anaResultado details.lg-lectura', T('Cómo leer este cuadro'), T('Medidores y curvas que dicen qué tan grande es cada número, con la guía de dónde sale.')],
      ['#anaResultado details.sp-reportar', T('Cómo reportarlo'), T('Los párrafos de métodos y resultados con el estilo APA, en español y en inglés.')],
    ] },
    5: { titulo: T('Recorrido por Resultados'), pasos: [
      ['#repVacio | #repTitulo', T('El reporte'), T('Cada análisis que agregas desde Explorar o Análisis, en orden, con los cuadros y las figuras numerados.')],
      ['[data-rep="copiar-todo"]', T('Todos los párrafos'), T('Los métodos y los resultados de todo el reporte en un solo texto, para la tesis o el artículo.')],
      ['#repIndice', T('El índice'), T('Lleva a cada análisis; las flechas de cada uno lo suben o lo bajan.')],
      ['#repItems', T('Cada análisis'), T('Su conclusión, sus cuadros y figuras, sus supuestos, el párrafo y el código R.')],
    ] },
    6: { titulo: T('Recorrido por Figuras'), pasos: [
      ['#figVacio | #figBarra', T('Las figuras del reporte'), T('Numeradas y listas para publicar; las barras de error y el ancho se eligen aquí para todas.')],
      ['#figGaleria', T('Cada figura'), T('Se baja en SVG, PDF, PNG o TIFF; el lápiz ✎ la edita y el Estudio de figuras le da el tamaño exacto de la revista.')],
    ] },
    7: { titulo: T('Recorrido por Exportar'), pasos: [
      ['#expoResumen', T('Qué se exporta'), T('El reporte con sus análisis, tal como está en Resultados.')],
      ['.expo-grid', T('Los formatos'), T('El reporte en .docx, PDF o HTML; los cuadros en hoja de cálculo o LaTeX; las figuras; y el proyecto .labg para reabrirlo o repetirlo en R.')],
      ['#expoAutoActivo', T('El guardado automático'), T('El trabajo se guarda solo en este navegador; aquí se apaga o se borra.')],
    ] },
    8: { titulo: T('Recorrido por Validación'), pasos: [
      ['#valTejas | #valVacio', T('El resumen'), T('Cuántos casos se compararon contra R y la mayor diferencia que se encontró.')],
      ['#valBuscar', T('Buscar'), T('Encuentra los casos de un método o de una fuente.')],
      ['#valTabla', T('Cada caso'), T('Su fuente, lo que se comparó y su resultado.')],
      ['#valOtras', T('Otras comprobaciones'), T('Las exportaciones, el uso sin conexión, la accesibilidad y lo demás que se prueba en cada versión.')],
    ] },
    9: { titulo: T('Recorrido por Fundamentos'), pasos: [
      ['.fun-vista', T('Tres vistas'), T('El catálogo de las fichas, el mapa de métodos y el árbol de decisiones.')],
      ['.fun-buscar', T('Buscar'), T('Por nombre, por otros nombres o por lo que hace el análisis.')],
      ['.fun-glosario', T('El glosario'), T('Los términos de los cuadros, cada uno con su definición y un ejemplo.')],
      ['#funLista', T('Las fichas'), T('Cada análisis con para qué sirve; un clic abre su ficha, con el modelo, los supuestos y los datos que necesita.')],
    ] },
    10: { titulo: T('Recorrido por Suite LABG'), pasos: [
      ['#suiteBloque', T('Las apps hermanas'), T('Para planear el diseño, el análisis multivariado o la correlación; cada una con su manual y cómo citarla.')],
    ] },
  });

  const est = { def: null, k: null, i: 0, pasos: [], origen: null, capa: null, luz: null, caja: null, reloj: 0 };
  const visible = el => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  const objetivo = sel => { for (const s of sel.split(' | ')) { const el = document.querySelector(s); if (visible(el)) return el; } return null; };
  const quieto = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function crear() {
    if (est.capa) return;
    const luz = document.createElement('div'); luz.className = 'sp-tour-luz'; luz.setAttribute('aria-hidden', 'true');
    const caja = document.createElement('div'); caja.className = 'sp-tour'; caja.setAttribute('role', 'dialog'); caja.setAttribute('aria-modal', 'false');
    caja.setAttribute('aria-labelledby', 'spTourT'); caja.setAttribute('aria-describedby', 'spTourX');
    caja.hidden = true; luz.hidden = true;
    document.body.appendChild(luz); document.body.appendChild(caja);
    caja.addEventListener('click', e => {
      const b = e.target.closest('[data-tour]');
      if (!b) return;
      const a = b.dataset.tour;
      if (a === 'sig') ir(est.i + 1); else if (a === 'ant') ir(est.i - 1); else if (a === 'fin') terminar();
      else if (a === 'ejemplo') conEjemplo(); else if (a === 'sin') arrancar();
    });
    caja.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && est.pasos.length) { e.preventDefault(); ir(est.i + 1); }
      else if (e.key === 'ArrowLeft' && est.pasos.length) { e.preventDefault(); ir(est.i - 1); }
    });
    est.capa = true; est.luz = luz; est.caja = caja;
    document.addEventListener('keydown', teclaEsc, true);
    window.addEventListener('scroll', recolocar, { passive: true });
    window.addEventListener('resize', recolocar);
  }
  function teclaEsc(e) { if (e.key === 'Escape' && est.capa) { e.preventDefault(); e.stopPropagation(); terminar(); } }
  function recolocar() { cancelAnimationFrame(est.reloj); est.reloj = requestAnimationFrame(colocar); }

  /* la luz sobre la parte y la ventana junto a ella (debajo, arriba o al centro) */
  function colocar() {
    if (!est.capa) return;
    const p = est.pasos[est.i], el = p && objetivo(p.sel), caja = est.caja, luz = est.luz;
    const W = window.innerWidth, H = window.innerHeight, m = 6;
    if (!el) { luz.hidden = true; caja.style.left = Math.max(12, (W - caja.offsetWidth) / 2) + 'px'; caja.style.top = Math.max(12, (H - caja.offsetHeight) / 2) + 'px'; return; }
    const r = el.getBoundingClientRect();
    luz.hidden = false;
    const top = Math.max(4, r.top - m), left = Math.max(4, r.left - m), bottom = Math.min(H - 4, r.bottom + m), right = Math.min(W - 4, r.right + m);
    Object.assign(luz.style, { top: top + 'px', left: left + 'px', width: Math.max(0, right - left) + 'px', height: Math.max(0, bottom - top) + 'px' });
    const ch = caja.offsetHeight, cw = caja.offsetWidth;
    let y;
    if (bottom + 12 + ch <= H) y = bottom + 12;
    else if (top - 12 - ch >= 0) y = top - 12 - ch;
    else y = Math.max(12, H - ch - 12);
    const x = Math.max(12, Math.min(W - cw - 12, left + (right - left) / 2 - cw / 2));
    caja.style.left = x + 'px'; caja.style.top = y + 'px';
  }

  function pintar(html) {
    est.caja.innerHTML = html;
    est.caja.hidden = false;
    const t = est.caja.querySelector('#spTourT');
    requestAnimationFrame(() => { colocar(); if (t) t.focus({ preventScroll: true }); });
  }
  function ir(i) {
    if (i < 0 || i >= est.pasos.length) { if (i >= est.pasos.length) terminar(); return; }
    est.i = i;
    const p = est.pasos[i], el = objetivo(p.sel);
    if (el) el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    const ultimo = i === est.pasos.length - 1;
    pintar(`<p class="sp-tour-paso">${esc_(est.def.titulo)} · ${esc_(T('{k} de {n}', { k: i + 1, n: est.pasos.length }))}</p>` +
      `<h2 class="sp-tour-t" id="spTourT" tabindex="-1">${esc_(p.titulo)}</h2><p class="sp-tour-x" id="spTourX">${esc_(p.texto)}</p>` +
      `<div class="btn-row sp-tour-botones"><button type="button" class="btn btn-ghost btn-sm" data-tour="fin">${esc_(T('Terminar'))}</button>` +
      `<span class="sp-tour-hueco"></span>${i ? `<button type="button" class="btn btn-secondary btn-sm" data-tour="ant">${esc_(T('Anterior'))}</button>` : ''}` +
      `<button type="button" class="btn btn-primary btn-sm" data-tour="sig">${esc_(ultimo ? T('Listo') : T('Siguiente'))}</button></div>`);
  }

  /* los pasos cuya parte se ve; algunas partes llegan un momento después de abrir el bloque (la validación se carga al
     abrirlo): se espera hasta 3 s a que aparezca alguna */
  async function arrancar() {
    const visibles = () => est.def.pasos.map(([sel, titulo, texto]) => ({ sel, titulo, texto })).filter(p => objetivo(p.sel));
    let pasos = visibles();
    for (let k = 0; k < 30 && !pasos.length; k++) { await new Promise(r => setTimeout(r, 100)); if (!est.capa) return false; pasos = visibles(); }
    est.pasos = pasos;
    if (!est.pasos.length) { terminar(); return false; }
    ir(0);
    return true;
  }
  async function conEjemplo() {
    const ej = (window.SP_EJEMPLOS || []).find(e => e.id === MAIZ);
    if (ej) {
      const lc = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
      SP.app.cargarHoja(SP.hoja.crear({ nombres: lc.nombres, columnas: lc.columnas, tipos: ej.tipos }), T('Ejemplo: {e}', { e: T(ej.nombre) }));
      if (est.k) SP.app.ir(est.k);
      if (est.def.preparar) { try { est.def.preparar(); } catch (e) { /* sigue sin él */ } }
      await new Promise(r => setTimeout(r, 250));
    }
    await arrancar();
  }

  /** Empieza el recorrido de un bloque. */
  async function empezar(k, boton) {
    const def = RECORRIDOS()[k];
    if (!def) return false;
    terminar();
    est.def = def; est.k = Number(k); est.origen = boton || document.activeElement;
    if (SP.app.ir && document.querySelector('#panel-' + k) && !document.querySelector('#panel-' + k + '.active')) SP.app.ir(k);
    crear();
    est.caja.classList.toggle('sp-tour-quieto', quieto());
    if (def.pideDatos && !(SP.app.datos && SP.app.datos.hoja)) {
      est.pasos = []; est.luz.hidden = true;
      pintar(`<p class="sp-tour-paso">${esc_(def.titulo)}</p><h2 class="sp-tour-t" id="spTourT" tabindex="-1">${esc_(T('Mejor con datos'))}</h2>` +
        `<p class="sp-tour-x" id="spTourX">${esc_(T('Este bloque muestra más con una tabla cargada. ¿Cargamos el ejemplo del maíz para el recorrido?'))}</p>` +
        `<div class="btn-row sp-tour-botones"><button type="button" class="btn btn-ghost btn-sm" data-tour="fin">${esc_(T('Terminar'))}</button><span class="sp-tour-hueco"></span>` +
        `<button type="button" class="btn btn-secondary btn-sm" data-tour="sin">${esc_(T('Seguir sin datos'))}</button>` +
        `<button type="button" class="btn btn-primary btn-sm" data-tour="ejemplo">${esc_(T('Cargar el ejemplo'))}</button></div>`);
      return true;
    }
    return arrancar();
  }
  function terminar() {
    if (!est.capa) return;
    est.luz.remove(); est.caja.remove();
    est.capa = null; est.luz = est.caja = null;
    document.removeEventListener('keydown', teclaEsc, true);
    window.removeEventListener('scroll', recolocar);
    window.removeEventListener('resize', recolocar);
    const o = est.origen; est.origen = null;
    if (o && o.isConnected && o.focus) o.focus({ preventScroll: true });
  }

  function iniciar() {
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-recorrido]');
      if (b) { e.preventDefault(); empezar(b.dataset.recorrido, b); }
    });
  }
  SP.recorridos = { empezar, terminar, pasos: k => ((RECORRIDOS()[k] || {}).pasos || []).map(([sel, titulo, texto]) => ({ sel, titulo, texto })), estado: est };
  SP.alArrancar(iniciar);
})();

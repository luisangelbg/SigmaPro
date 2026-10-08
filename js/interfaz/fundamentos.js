/* SigmaPro — bloque 9: Fundamentos (la teoría y los datos de cada análisis).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El contenido vive como datos, uno por análisis, en data/fundamentos/<id>.js («SP_FICHA({ … })», JSON con su
   envoltura: con doble clic el navegador no deja leer .json). Aquí solo se dibuja:
     · el catálogo: buscador, filtros (familia, tipo de respuesta, estructura de los factores, diseño) y, al pie de cada
       familia, «Herramientas relacionadas» de la suite (LABGSuggest);
     · el mapa de métodos: un SVG que ubica cada análisis por su tipo de respuesta y la estructura de sus factores;
     · la ficha: nueve apartados plegables con índice lateral (para qué sirve, preguntas, fundamento con su modelo en
       MathML, supuestos con su verificación y su alternativa, DATOS NECESARIOS con la tabla de ejemplo, «Cargar estos
       datos» y las plantillas CSV y XLSX, interpretación, limitaciones y métodos relacionados, referencias y «Continúa
       en la suite LABG»).
   data/fundamentos/indice.js (generado por tools/fundamentos/indice.mjs) trae lo que el catálogo necesita de las 78
   fichas; cada ficha se carga al abrirla.

     SP.app.fundamentos.abrir(id)   la ficha (desde cualquier bloque)
     SP.app.fundamentos.cargar(id)  → promesa con la ficha (también para el apéndice del reporte) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const L = () => window.LABG;
  const IDX = () => window.SP_FUNDAMENTOS_INDICE || {};
  const lengua = () => (SP.IDIOMA === 'en' ? 'en' : 'es');
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* ---------------- carga de las fichas ---------------- */
  const fichas = {}, esperas = {};
  window.SP_FICHA = f => { if (f && f.id) { fichas[f.id] = f; (esperas[f.id] || []).forEach(r => r.ok(f)); delete esperas[f.id]; } };
  function cargar(id) {
    if (fichas[id]) return Promise.resolve(fichas[id]);
    return new Promise((ok, mal) => {
      const ya = esperas[id];
      (esperas[id] = ya || []).push({ ok, mal });
      if (ya) return;
      const s = document.createElement('script');
      s.src = 'data/fundamentos/' + encodeURIComponent(id) + '.js';
      s.async = true;
      s.onerror = () => { (esperas[id] || []).forEach(r => r.mal(new Error(T('No se encontró la ficha de «{m}».', { m: id })))); delete esperas[id]; s.remove(); };
      s.onload = () => s.remove();
      document.head.appendChild(s);
    });
  }

  /* ---------------- vocabulario de los filtros y del mapa ---------------- */
  const RESPUESTA = () => [['continua', T('Medida continua')], ['conteo', T('Conteos')], ['binaria', T('Sí / no (0/1)')], ['proporcion', T('Proporciones')],
    ['categorica', T('Categorías (tablas)')], ['tiempo-evento', T('Tiempo hasta un evento')], ['serie', T('Serie de tiempo')], ['multivariada', T('Varias respuestas')], ['ninguna', T('Sin datos (planeación)')]];
  const ESTRUCTURA = () => [['una-muestra', T('Una muestra')], ['dos-grupos', T('Dos grupos')], ['k-grupos', T('Tres o más grupos')], ['factorial', T('Factores cruzados')],
    ['bloques', T('Bloques')], ['parcelas', T('Parcelas divididas')], ['continua', T('Predictores continuos')], ['aleatorios', T('Efectos aleatorios')],
    ['ambientes', T('Varios ambientes')], ['ninguna', T('Sin factores')]];
  const DISENOS = () => [['dca', T('Completamente al azar')], ['dbca', T('Bloques completos al azar')], ['latino', T('Cuadro latino')], ['parcelas', T('Parcelas divididas y franjas')],
    ['latice', T('Látice')], ['bib', T('Bloques incompletos')], ['medidas-repetidas', T('Medidas repetidas')], ['multiambiente', T('Varios ambientes')],
    ['muestreo', T('Muestreo')], ['superficie', T('Superficies de respuesta')], ['ninguno', T('Sin diseño experimental')]];
  const etiqueta = (lista, k) => { const x = lista().find(v => v[0] === k); return x ? x[1] : k; };

  /* ---------------- estado ---------------- */
  const est = { vista: 'catalogo', id: null, buscar: '', familia: '', respuesta: '', estructura: '', diseno: '' };
  try { const v = sessionStorage.getItem('sigmapro.fundamentos.vista'); if (v === 'mapa') est.vista = 'mapa'; } catch (e) { /* nada */ }
  const metodos = () => Object.values(SP.metodos);
  const info = id => IDX()[id] || null;
  const textoDe = (id, k) => { const x = info(id); return x && x[lengua()] ? x[lengua()][k] : ''; };
  function pasa(m) {
    const x = info(m.id);
    if (est.familia && m.familia !== est.familia) return false;
    if (x) {
      if (est.respuesta && x.respuesta !== est.respuesta) return false;
      if (est.estructura && x.estructura !== est.estructura) return false;
      if (est.diseno && !(x.disenos || []).includes(est.diseno)) return false;
    } else if (est.respuesta || est.estructura || est.diseno) return false;
    if (est.buscar) {
      const fam = (SP.familias.find(f => f.id === m.familia) || {}).nombre;
      const heno = norm([m.nombre, m.resumen, fam, textoDe(m.id, 'paraQue'), (textoDe(m.id, 'alias') || []).join(' ')].join(' '));
      if (!norm(est.buscar).split(/\s+/).filter(Boolean).every(p => heno.includes(p))) return false;
    }
    return true;
  }

  /* ---------------- catálogo ---------------- */
  const opciones = (lista, valor, todas) => `<option value="">${esc(todas)}</option>` + lista.map(([k, n]) => `<option value="${esc(k)}"${valor === k ? ' selected' : ''}>${esc(n)}</option>`).join('');
  function herramientas() {
    return `<div class="fun-barra" role="search">` +
      `<label class="fun-buscar"><span class="sr-only">${esc(T('Buscar un análisis'))}</span><input type="search" data-fun="buscar" value="${esc(est.buscar)}" placeholder="${esc(T('Buscar: bloques, Tukey, conteos, heredabilidad…'))}" autocomplete="off"></label>` +
      `<label class="fun-filtro"><span>${esc(T('Familia'))}</span><select data-fun="familia">${opciones(SP.familias.map(f => [f.id, f.nombre]), est.familia, T('Todas'))}</select></label>` +
      `<label class="fun-filtro"><span>${esc(T('Tipo de respuesta'))}</span><select data-fun="respuesta">${opciones(RESPUESTA(), est.respuesta, T('Todas'))}</select></label>` +
      `<label class="fun-filtro"><span>${esc(T('Grupos y factores'))}</span><select data-fun="estructura">${opciones(ESTRUCTURA(), est.estructura, T('Todas'))}</select></label>` +
      `<label class="fun-filtro"><span>${esc(T('Diseño'))}</span><select data-fun="diseno">${opciones(DISENOS(), est.diseno, T('Todos'))}</select></label>` +
      `<div class="seg fun-vista" role="group" aria-label="${esc(T('Vista'))}"><button type="button" data-fun-vista="catalogo" aria-pressed="${est.vista === 'catalogo'}">${esc(T('Catálogo'))}</button>` +
      `<button type="button" data-fun-vista="mapa" aria-pressed="${est.vista === 'mapa'}">${esc(T('Mapa de métodos'))}</button></div>` +
      `<button type="button" class="btn btn-secondary btn-sm fun-glosario" data-glosario="" title="${esc(T('Glosario (Ctrl+G)'))}">${esc(T('Glosario'))}</button></div>`;
  }
  function catalogo() {
    const todos = metodos(), vis = todos.filter(pasa);
    let h = `<p class="small muted fun-cuenta" aria-live="polite">${esc(vis.length === todos.length ? T('{n} análisis', { n: todos.length }) : T('{k} de {n} análisis', { k: vis.length, n: todos.length }))}</p>`;
    if (!vis.length) return h + `<div class="empty-state small"><p>${esc(T('Ningún análisis cumple esos filtros.'))}</p><button type="button" class="btn btn-secondary btn-sm" data-fun-limpiar>${esc(T('Quitar los filtros'))}</button></div>`;
    for (const fam of SP.familias) {
      const lista = vis.filter(m => m.familia === fam.id).sort((a, b) => (a.orden || 0) - (b.orden || 0));
      if (!lista.length) continue;
      h += `<section class="fun-familia" aria-labelledby="fun-f-${esc(fam.id)}"><h3 id="fun-f-${esc(fam.id)}" class="fun-fam-tit">${esc(fam.nombre)} <span class="muted small">${lista.length}</span></h3><ul class="fun-grid">` +
        lista.map(m => {
          const x = info(m.id);
          return `<li><button type="button" class="fun-tarjeta" data-ficha="${esc(m.id)}">${SP.ilustraciones ? SP.ilustraciones.svg(m.id) : ''}<span class="fun-t-txt"><span class="fun-t-nombre">${esc(m.nombre)}</span>` +
            `<span class="fun-t-para">${esc(textoDe(m.id, 'paraQue') || m.resumen || '')}</span>` +
            (x ? `<span class="fun-chips"><span class="fun-chip">${esc(etiqueta(RESPUESTA, x.respuesta))}</span><span class="fun-chip">${esc(etiqueta(ESTRUCTURA, x.estructura))}</span></span>` : '') +
            `</span></button></li>`;
        }).join('') + '</ul>' + (SP.app.suite ? SP.app.suite.franjaFamilia(fam.id) : '') + '</section>';
    }
    return h;
  }

  /* ---------------- mapa de métodos ---------------- */
  function mapa() {
    const vis = metodos().filter(pasa).filter(m => info(m.id));
    const R = RESPUESTA(), E = ESTRUCTURA();
    const celdas = {};
    for (const m of vis) { const x = info(m.id), k = x.respuesta + '|' + x.estructura; (celdas[k] = celdas[k] || []).push(m); }
    const filas = R.filter(([r]) => E.some(([e]) => celdas[r + '|' + e]));
    const cols = E.filter(([e]) => R.some(([r]) => celdas[r + '|' + e]));
    if (!filas.length) return `<div class="empty-state small"><p>${esc(T('Ningún análisis cumple esos filtros.'))}</p></div>`;
    const CW = 160, LW = 150, HT = 64, NH = 36, PAD = 8, MAX = 22;
    const altoFila = r => Math.max(1, ...cols.map(([e]) => (celdas[r + '|' + e] || []).length)) * NH + 2 * PAD;
    let y = HT; const ys = filas.map(([r]) => { const y0 = y; y += altoFila(r); return y0; });
    const W = LW + cols.length * CW, H = y + 4;
    /* el nombre en uno o dos renglones, por palabras; si no cabe, el segundo termina en «…» */
    const renglones = s => {
      const L = [''];
      for (const p of s.split(' ')) { const c = L[L.length - 1], u = c ? c + ' ' + p : p; if (u.length <= MAX || !c) L[L.length - 1] = u; else L.push(p); }
      if (L.length > 2 || L[1] && L[1].length > MAX) { L.length = 2; L[1] = (L[1].length > MAX - 1 ? L[1].slice(0, MAX - 1) : L[1]).replace(/[s,(]+$/, '') + '…'; }
      return L;
    };
    let s = `<svg class="fun-mapa-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(T('Mapa de métodos: cada análisis según su tipo de respuesta (filas) y la estructura de sus factores (columnas)'))}">`;
    s += `<text x="${LW + cols.length * CW / 2}" y="14" class="fun-m-eje" text-anchor="middle">${esc(T('Grupos y factores →'))}</text>`;
    cols.forEach(([e, n], j) => { s += `<text x="${LW + j * CW + CW / 2}" y="${HT - 12}" class="fun-m-col" text-anchor="middle">${esc(n)}</text>`; });
    filas.forEach(([r, n], i) => {
      const y0 = ys[i], h = altoFila(r);
      s += `<rect x="0" y="${y0}" width="${W}" height="${h}" class="fun-m-banda${i % 2 ? ' par' : ''}"/>` +
        `<text x="10" y="${y0 + h / 2 + 4}" class="fun-m-fila">${esc(n)}</text>`;
      cols.forEach(([e], j) => {
        (celdas[r + '|' + e] || []).forEach((m, k) => {
          const x = LW + j * CW + 6, yy = y0 + PAD + k * NH;
          s += `<a href="#b9" class="fun-m-nodo" data-ficha="${esc(m.id)}" role="link" tabindex="0" aria-label="${esc(m.nombre)}"><title>${esc(m.nombre)}</title>` +
            `<rect x="${x}" y="${yy}" width="${CW - 12}" height="${NH - 4}" rx="9"/>` + (L => `<text x="${x + 9}" y="${yy + (L.length > 1 ? 13 : 20)}">` +
              L.map((t, q) => `<tspan x="${x + 9}"${q ? ' dy="13"' : ''}>${esc(t)}</tspan>`).join('') + '</text>')(renglones(m.nombre)) + '</a>';
        });
      });
    });
    s += `<text x="10" y="${HT - 30}" class="fun-m-eje">${esc(T('Respuesta ↓'))}</text></svg>`;
    return `<p class="small muted">${esc(T('Cada análisis según el tipo de respuesta que mide (filas) y cómo están organizados sus grupos o factores (columnas). Pulsa uno para abrir su ficha.'))}</p><div class="fun-mapa" tabindex="0" role="region" aria-label="${esc(T('Mapa de métodos (se desplaza a los lados)'))}">${s}</div>`;
  }

  /* ---------------- la ficha ---------------- */
  const SECCIONES = () => [['que', T('Para qué sirve')], ['preguntas', T('Preguntas típicas')], ['teoria', T('Fundamento teórico')], ['supuestos', T('Supuestos')],
    ['datos', T('Datos necesarios')], ['interpretar', T('Cómo se interpreta')], ['limites', T('Limitaciones y métodos relacionados')], ['referencias', T('Referencias')], ['suite', T('Continúa en la suite LABG')]];
  const formula = (tex, bloque) => { try { return SP.formulas.mathml(tex, { bloque }); } catch (e) { return `<code>${esc(tex)}</code>`; } };
  const nombreMetodo = id => (SP.metodos[id] ? SP.metodos[id].nombre : id);
  const enlaceFicha = id => (SP.metodos[id] ? `<a href="#b9" data-ficha="${esc(id)}">${esc(nombreMetodo(id))}</a>` : esc(id));
  function seccion(clave, titulo, cuerpo, abierta, clase) {
    return `<details class="fun-sec${clase ? ' ' + clase : ''}" id="fun-s-${clave}"${abierta === false ? '' : ' open'}><summary><h3>${esc(titulo)}</h3></summary><div class="fun-sec-c">${cuerpo}</div></details>`;
  }
  function tablaDatos(filas) {
    if (!filas || !filas.length) return '';
    return `<div class="tabla-envoltura"><table class="fun-tabla"><thead><tr>${filas[0].map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>` +
      filas.slice(1).map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('') + '</tbody></table></div>';
  }
  function ficha(F) {
    const x = F[lengua()] || F.es, m = SP.metodos[F.id] || {}, fam = (SP.familias.find(f => f.id === F.familia) || {}).nombre || '';
    const sec = SECCIONES();
    const ind = `<nav class="fun-indice" aria-label="${esc(T('Índice de la ficha'))}"><p class="fun-ind-tit">${esc(T('En esta ficha'))}</p><ol>` +
      sec.map(([k, t]) => `<li><a href="#fun-s-${k}" data-fun-ir="${k}">${esc(t)}</a></li>`).join('') + '</ol></nav>';
    const cab = `<div class="fun-cab"><button type="button" class="btn btn-ghost btn-sm" data-fun-volver>← ${esc(T('Todos los fundamentos'))}</button>` +
      `<div class="fun-cab-t">${SP.ilustraciones ? SP.ilustraciones.svg(F.id) : ''}<div><p class="fun-fam">${esc(fam)}</p><h3 class="fun-nombre" id="fun-titulo" tabindex="-1">${esc(m.nombre || F.id)}</h3>` +
      (x.alias && x.alias.length ? `<p class="small muted fun-alias">${esc(T('También: {a}', { a: x.alias.join(' · ') }))}</p>` : '') + '</div></div>' +
      `<div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-abrir-metodo="${esc(F.id)}">${esc(T('Abrir este análisis'))}</button>` +
      (F.ejemplo ? `<button type="button" class="btn btn-secondary btn-sm" data-fun-ejemplo="${esc(F.id)}">${esc(T('Cargar los datos de ejemplo'))}</button>` : '') + '</div></div>';
    const teoria = x.teoria.map(p => `<p>${esc(p)}</p>`).join('') +
      (x.modelo && x.modelo.tex ? `<div class="fun-modelo">${formula(x.modelo.tex, true)}</div>` +
        (x.modelo.terminos && x.modelo.terminos.length ? `<dl class="fun-terminos">${x.modelo.terminos.map(([t, d]) => `<dt>${formula(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>` : '') : '') +
      (x.hipotesis || []).map(h => `<div class="fun-hip"><p><span class="fun-hip-e">H<sub>0</sub>:</span> ${formula(h.h0)}</p><p><span class="fun-hip-e">H<sub>1</sub>:</span> ${formula(h.h1)}</p>${h.texto ? `<p class="small">${esc(h.texto)}</p>` : ''}</div>`).join('');
    const supuestos = `<ul class="fun-supuestos">` + (x.supuestos || []).map(s => `<li><span class="fun-sup-ico" aria-hidden="true">✓</span><div><p class="fun-sup-n">${esc(s.nombre)}</p><p class="small">${esc(s.como)}</p>` +
      `<p class="small"><b>${esc(T('Si no se cumple:'))}</b> ${esc(s.siFalla)}</p><div class="btn-row">` +
      (s.verificar && s.verificar !== F.id ? `<button type="button" class="btn btn-ghost btn-sm" data-abrir-metodo="${esc(s.verificar)}">${esc(T('Abrir: {m}', { m: nombreMetodo(s.verificar) }))}</button>` : '') +
      (s.alternativa ? `<button type="button" class="btn btn-ghost btn-sm" data-abrir-metodo="${esc(s.alternativa)}">${esc(T('Alternativa: {m}', { m: nombreMetodo(s.alternativa) }))}</button>` : '') +
      '</div></div></li>').join('') + '</ul>';
    const d = x.datos || {};
    const datos = `<div class="fun-datos">` +
      (d.columnas && d.columnas.length ? `<div class="tabla-envoltura"><table class="fun-tabla fun-cols"><caption class="sr-only">${esc(T('Columnas que necesita'))}</caption><thead><tr><th scope="col">${esc(T('Columna'))}</th><th scope="col">${esc(T('Tipo'))}</th><th scope="col">${esc(T('Papel'))}</th></tr></thead><tbody>` +
        d.columnas.map(c => `<tr><td><code>${esc(c.nombre)}</code></td><td>${esc(c.tipo)}</td><td>${esc(c.papel)}</td></tr>`).join('') + '</tbody></table></div>' : '') +
      (d.minimo ? `<p><b>${esc(T('Tamaño mínimo:'))}</b> ${esc(d.minimo)}</p>` : '') +
      (d.balance ? `<p><b>${esc(T('Faltantes y desbalance:'))}</b> ${esc(d.balance)}</p>` : '') +
      /* la nota que ya empieza con su formato («Formato largo: …», «Long format: …») no repite la etiqueta */
      (d.notaFormato ? `<p>${/^[^:]{0,30}format[^:]{0,20}:/i.test(d.notaFormato) ? '' : `<b>${esc(T('Formato:'))}</b> `}${esc(d.notaFormato)}</p>` : '') +
      (F.formato && F.formato.largo ? `<p class="fun-sub">${esc(T('Ejemplo (formato largo, primeras filas)'))}</p>` + tablaDatos(F.formato.largo) : '') +
      (F.formato && F.formato.ancho ? `<p class="fun-sub">${esc(T('Los mismos datos en formato ancho (no así)'))}</p>` + tablaDatos(F.formato.ancho) : '') +
      (d.errores && d.errores.length ? `<p class="fun-sub">${esc(T('Errores frecuentes al preparar los datos'))}</p><ul class="fun-errores">${d.errores.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : '') +
      (F.formato && F.formato.largo ? `<div class="btn-row">` +
        (F.ejemplo ? `<button type="button" class="btn btn-primary btn-sm" data-fun-ejemplo="${esc(F.id)}">${esc(T('Cargar estos datos de ejemplo'))}</button>` : '') +
        `<button type="button" class="btn btn-secondary btn-sm" data-fun-plantilla="csv">${esc(T('Plantilla CSV'))}</button><button type="button" class="btn btn-secondary btn-sm" data-fun-plantilla="xlsx">${esc(T('Plantilla XLSX'))}</button></div>` : '') +
      '</div>';
    const it = x.interpretacion || {};
    const interpretar = (it.orden && it.orden.length ? `<ol class="fun-orden">${it.orden.map(o => `<li>${esc(o)}</li>`).join('')}</ol>` : '') +
      (it.ejemplo ? `<blockquote class="fun-ejemplo">${esc(it.ejemplo)}</blockquote>` : '') +
      ((it.guias || []).length && SP.guias ? `<p class="fun-sub">${esc(T('Guías de lectura de cada estadístico'))}</p><div class="fun-guias">` +
        it.guias.map(g => SP.guias.ficha(g)).filter(Boolean).map(g => `<details class="fun-guia"><summary><span class="fun-guia-s" aria-hidden="true">${esc(g.simbolo)}</span> ${esc(g.nombre)}</summary><p class="small">${esc(g.que)}</p></details>`).join('') + '</div>' : '');
    const limites = `<ul>${(x.limitaciones || []).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` +
      (F.relacionados && F.relacionados.length ? `<p class="fun-sub">${esc(T('Métodos relacionados'))}</p><ul class="fun-rel">${F.relacionados.map(r => `<li>${enlaceFicha(r)}</li>`).join('')}</ul>` : '');
    const refs = `<ol class="fun-refs">${(x.referencias || []).map(r => `<li>${esc(r)}</li>`).join('')}</ol>`;
    const suite = SP.app.suite ? SP.app.suite.franjaMetodo(F.id, { titulo: '', contexto: 'ficha:' + F.id }) : '';
    const cuerpo = seccion('que', sec[0][1], `<p class="fun-para">${esc(x.paraQue)}</p><p class="small muted">${esc(m.resumen || '')}</p>`) +
      seccion('preguntas', sec[1][1], `<ul>${(x.preguntas || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul>`) +
      seccion('teoria', sec[2][1], teoria) + seccion('supuestos', sec[3][1], supuestos) +
      seccion('datos', sec[4][1], datos, true, 'fun-destacada') + seccion('interpretar', sec[5][1], interpretar) +
      seccion('limites', sec[6][1], limites) + seccion('referencias', sec[7][1], refs) +
      seccion('suite', sec[8][1], suite || `<p class="small muted">${esc(T('Este análisis no tiene una app hermana sugerida; revisa la suite completa en el bloque 10.'))}</p>`);
    return cab + `<div class="fun-ficha">${ind}<div class="fun-cuerpo">${cuerpo}</div></div>`;
  }

  /* ---------------- dibujar ---------------- */
  function pintar() {
    const raiz = $('#funRaiz');
    if (!raiz) return;
    if (est.vista === 'ficha' && est.id) {
      const F = fichas[est.id];
      raiz.innerHTML = F ? ficha(F) : `<p class="small muted">${esc(T('Cargando la ficha…'))}</p>`;
      if (!F) cargar(est.id).then(() => { if (est.id && est.vista === 'ficha') pintar(); }).catch(e => { raiz.innerHTML = `<div class="msg msg-error">${esc(e.message)}</div>`; });
      else { const t = $('#fun-titulo'); if (t) t.focus({ preventScroll: true }); }
      return;
    }
    raiz.innerHTML = herramientas() + `<div id="funLista">${est.vista === 'mapa' ? mapa() : catalogo()}</div>`;
  }
  function lista() { const l = $('#funLista'); if (l) l.innerHTML = est.vista === 'mapa' ? mapa() : catalogo(); else pintar(); }
  function abrir(id) {
    if (!SP.metodos[id]) return;
    est.vista = 'ficha'; est.id = id;
    if (SP.app.ir) SP.app.ir(9);
    pintar();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ---------------- acciones ---------------- */
  /* los cuatro resúmenes de Explorar (bloque 3) no viven en Análisis */
  const EXPLORAR = { descriptivos: 'desc', frecuencias: 'frec', proporciones: 'prop', 'bondad-ajuste': 'bondad' };
  function abrirExplorar(id, e, op) {
    const ex = SP.app.explorar, k = EXPLORAR[id], s = ex && ex[k];
    if (!s) return false;
    ex.tipo = k;
    if (e) {
      if (k === 'desc') Object.assign(s, { variables: e.variables || [], grupos: e.grupos || [] });
      else if (k === 'frec') Object.assign(s, { fila: e.fila || '', columna: e.columna || '' });
      else if (k === 'prop') Object.assign(s, e.exitos ? { modo: 'conteos', exitos: e.exitos, ensayos: e.ensayos || '', grupo: e.grupo || '' } : { modo: 'categoria', categoria: e.categoria || '', grupo: e.grupo || '' }, op && op.metodos ? { metodos: op.metodos } : {});
      else if (k === 'bondad') Object.assign(s, { categoria: e.categoria || '', conteo: e.conteo || '', proporciones: (op && op.proporciones || []).join(':') });
    }
    SP.app.ir(3);
    if (ex.calcular) ex.calcular();
    return true;
  }
  function abrirMetodo(id, conEjemplo) {
    const F = fichas[id] || {};
    const ir = () => {
      if (EXPLORAR[id] && abrirExplorar(id, conEjemplo && F.ejemplo ? F.ejemplo.entradas || {} : null, conEjemplo && F.ejemplo ? F.ejemplo.opciones || {} : null)) return;
      SP.app.ir(4);
      if (SP.app.analisis.ponerModo) SP.app.analisis.ponerModo('catalogo');
      SP.app.analisis.usar(id, conEjemplo && F.ejemplo ? F.ejemplo.entradas || {} : {}, conEjemplo && F.ejemplo ? F.ejemplo.opciones || {} : {});
    };
    if (conEjemplo && F.ejemplo && F.ejemplo.conjunto) {
      const ej = (window.SP_EJEMPLOS || []).find(e => e.id === F.ejemplo.conjunto);
      if (!ej) { L() && L().toast(T('No se encontró el conjunto de ejemplo.'), { type: 'warning' }); return; }
      const l = SP.csv.leerColumnas(ej.csv, { delimitador: ',', decimal: '.' });
      SP.datosUI.cargar(SP.hoja.crear({ nombres: l.nombres, columnas: l.columnas, tipos: ej.tipos }), T('Ejemplo: {n}', { n: T(ej.nombre) }));
      L() && L().toast(T('Datos de ejemplo cargados: {n}', { n: T(ej.nombre) }), { type: 'success' });
    }
    ir();
  }
  function plantilla(tipo) {
    const F = fichas[est.id];
    if (!F || !F.formato || !F.formato.largo) return;
    const filas = F.formato.largo, nombre = 'plantilla-' + F.id;
    let datos, mime;
    if (tipo === 'xlsx') {
      datos = SP.xlsx.construir([{ nombre: F.id.slice(0, 31), filas: filas.map((r, i) => (i ? r.map(v => (v !== '' && Number.isFinite(+v) ? +v : v)) : r)) }]);
      mime = SP.xlsx.MIME;
    } else {
      const c = v => (/[",\r\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : v);
      datos = '﻿' + filas.map(r => r.map(c).join(',')).join('\r\n') + '\r\n';
      mime = 'text/csv;charset=utf-8';
    }
    const url = URL.createObjectURL(new Blob([datos], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = nombre + '.' + tipo; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    L() && L().toast(T('Plantilla descargada: {f}', { f: nombre + '.' + tipo }), { type: 'success' });
  }

  /* Inicio: «Qué puedes analizar», cada nombre abre su ficha */
  function pintarInicio() {
    const ul = $('#iniAnalisis');
    if (!ul) return;
    ul.innerHTML = SP.familias.map(f => {
      const l = metodos().filter(m => m.familia === f.id).sort((a, b) => (a.orden || 0) - (b.orden || 0));
      return l.length ? `<li><h4>${esc(f.nombre)}</h4><ul>${l.map(m => `<li><a href="#b9" data-ficha="${esc(m.id)}">${esc(m.nombre)}</a></li>`).join('')}</ul></li>` : '';
    }).join('');
  }

  function iniciar() {
    pintarInicio();
    const raiz = $('#funRaiz');
    if (!raiz) return;
    let reloj = 0;
    raiz.addEventListener('input', e => {
      if (e.target.dataset.fun === 'buscar') { est.buscar = e.target.value; clearTimeout(reloj); reloj = setTimeout(lista, 120); }
    });
    raiz.addEventListener('change', e => { const k = e.target.dataset.fun; if (k && k !== 'buscar') { est[k] = e.target.value; lista(); } });
    raiz.addEventListener('click', e => {
      const t = e.target.closest('button, a');
      if (!t || !raiz.contains(t)) return;
      if (t.dataset.funVista) { est.vista = t.dataset.funVista; try { sessionStorage.setItem('sigmapro.fundamentos.vista', est.vista); } catch (er) { /* nada */ } pintar(); return; }
      if (t.hasAttribute('data-fun-limpiar')) { Object.assign(est, { buscar: '', familia: '', respuesta: '', estructura: '', diseno: '' }); pintar(); return; }
      if (t.hasAttribute('data-fun-volver')) { est.vista = sessionStorage.getItem('sigmapro.fundamentos.vista') === 'mapa' ? 'mapa' : 'catalogo'; est.id = null; pintar(); return; }
      if (t.dataset.funIr) { e.preventDefault(); const s = document.getElementById('fun-s-' + t.dataset.funIr); if (s) { s.open = true; s.scrollIntoView({ block: 'start' }); const h = s.querySelector('summary'); if (h) h.focus({ preventScroll: true }); } return; }
      if (t.dataset.funEjemplo) { abrirMetodo(t.dataset.funEjemplo, true); return; }
      if (t.dataset.funPlantilla) { plantilla(t.dataset.funPlantilla); return; }
    });
    /* el mapa: los nodos son enlaces dentro del SVG; Enter también los abre */
    raiz.addEventListener('keydown', e => { const n = e.target.closest && e.target.closest('.fun-m-nodo'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir(n.dataset.ficha); } });
    /* desde cualquier bloque: data-ficha abre la ficha; data-abrir-metodo abre el análisis */
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-ficha], [data-abrir-metodo]');
      if (!t) return;
      if (t.dataset.ficha) { e.preventDefault(); abrir(t.dataset.ficha); }
      else if (t.dataset.abrirMetodo) { e.preventDefault(); abrirMetodo(t.dataset.abrirMetodo, false); }
    });
    /* el catálogo (unos 1500 elementos) se dibuja la primera vez que se abre el bloque, no al arrancar la app */
    const panel = $('#panel-9');
    if (panel && panel.classList.contains('active')) pintar();
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 9 && !raiz.firstElementChild) pintar(); });
  }
  SP.app = SP.app || {};
  SP.app.fundamentos = { abrir, cargar, pintar, estado: est, fichas, abrirExplorar, EXPLORAR };
  SP.alArrancar(iniciar);
})();

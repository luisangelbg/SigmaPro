/* SigmaPro — bloque 4: el asistente (interfaz).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Pinta las preguntas que toca hacer (SP.asistente.preguntas) y, al lado, la recomendación con su porqué
   (SP.asistente.recomendar). «Usar y calcular» lleva el análisis al catálogo con todo ya elegido; «Ajustar en el
   constructor» pasa los papeles al constructor de modelos; «Después» ofrece los pasos siguientes (comparaciones,
   polinomios, supuestos). Las respuestas se recuerdan mientras no cambie la tabla. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const A = () => SP.app.analisis;
  const L = () => window.LABG;
  const est = { r: {}, hoja: null, rec: null, ultimo: null };
  const CONSTRUIBLES = ['dca', 'dbca', 'cuadro-latino', 'parcelas-divididas', 'parcelas-subdivididas', 'ancova', 'regresion-lineal', 'modelo-lineal'];

  function pregunta(p) {
    const id = 'asis-' + p.id;
    let cuerpo;
    if (p.tipo === 'variable') {
      cuerpo = `<select class="select" id="${id}" data-q="${p.id}">${p.opciones.map(([v, t]) => `<option value="${esc(v)}"${v === p.valor ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
      return `<li class="asis-p"><label class="asis-q" for="${id}">${esc(p.texto)}</label>${cuerpo}${p.ayuda ? `<p class="field-help">${esc(p.ayuda)}</p>` : ''}</li>`;
    }
    const tipo = p.tipo === 'opciones' ? 'radio' : 'checkbox';
    const marcado = v => (tipo === 'radio' ? v === p.valor : (p.valor || []).includes(v));
    cuerpo = `<div class="asis-opciones">${p.opciones.map(([v, t]) => `<label class="asis-op"><input type="${tipo}" name="${id}" data-q="${p.id}"${p.max ? ` data-max="${p.max}"` : ''} value="${esc(v)}"${marcado(v) ? ' checked' : ''}><span>${esc(t)}</span></label>`).join('') ||
      `<p class="small muted">${esc(T('No hay columnas de este tipo en la tabla.'))}</p>`}</div>`;
    return `<li class="asis-p"><fieldset><legend class="asis-q">${esc(p.texto)}</legend>${cuerpo}</fieldset>${p.ayuda ? `<p class="field-help">${esc(p.ayuda)}</p>` : ''}</li>`;
  }
  const lista = (titulo, xs) => (xs && xs.length ? `<p class="asis-sub">${esc(titulo)}</p><ul>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  function tarjeta(rec) {
    if (!rec.metodo) {
      return `<div class="card asis-reco"><span class="pill gris">${esc(T('Falta información'))}</span><h3>${esc(rec.titulo)}</h3><p>${esc(rec.resumen)}</p></div>`;
    }
    const nombre = rec.bloque === 3 ? T('Bloque Explorar') : (SP.metodos[rec.metodo] ? SP.metodos[rec.metodo].nombre : rec.metodo);
    const botones = `<div class="btn-row asis-acciones"><button type="button" class="btn btn-primary" data-asis="usar">${esc(rec.bloque === 3 ? T('Ir a Explorar') : T('Usar y calcular'))}</button>` +
      (CONSTRUIBLES.includes(rec.metodo) ? `<button type="button" class="btn btn-secondary" data-asis="constructor">${esc(T('Ajustar en el constructor'))}</button>` : '') + '</div>';
    const despues = rec.despues && rec.despues.length ? `<div class="asis-despues"><p class="asis-sub">${esc(T('Después'))}</p><ul>${rec.despues.map((d, k) =>
      `<li><button type="button" class="btn btn-ghost btn-sm" data-asis="despues" data-k="${k}">${esc(d.texto)}</button></li>`).join('')}</ul></div>` : '';
    return `<div class="card asis-reco"><span class="pill">${esc(T('Recomendación'))}</span><h3>${esc(rec.titulo)}</h3>` +
      `<p class="small muted asis-metodo">${esc(T('En el catálogo: {m}', { m: nombre }))}</p><p>${esc(rec.resumen)}</p>` +
      lista(T('Por qué'), rec.porque) + lista(T('Se revisará'), rec.revisar) +
      (rec.siFallan ? `<p class="asis-fallan small">${esc(rec.siFallan)}</p>` : '') +
      (rec.avisos && rec.avisos.length ? rec.avisos.map(a => `<p class="msg msg-warning small">${esc(a)}</p>`).join('') : '') +
      botones + despues + '</div>';
  }

  function pintar(c) {
    const cont = $('#anaAsistente');
    if (!cont) return;
    if (SP.app.datos.hoja !== est.hoja) { est.hoja = SP.app.datos.hoja; est.r = {}; }
    const inf = SP.asistente.info(c.t), ps = SP.asistente.preguntas(est.r, inf), rec = SP.asistente.recomendar(est.r, inf);
    est.rec = rec;
    /* conservar el foco al redibujar */
    const f = document.activeElement && cont.contains(document.activeElement) ? document.activeElement : null;
    const clave = f ? (f.dataset.q || '') + '|' + (f.type === 'radio' || f.type === 'checkbox' ? f.value : '') + '|' + (f.dataset.asis || '') : null;
    cont.innerHTML = `<div class="asis-grid"><ol class="asis-preguntas">${ps.map(pregunta).join('')}</ol><div class="asis-lado" aria-live="polite">${tarjeta(rec)}</div></div>`;
    if (clave) {
      const [q, v, a] = clave.split('|');
      const el = a ? cont.querySelector(`[data-asis="${a}"]`) : v ? cont.querySelector(`[data-q="${q}"][value="${CSS.escape(v)}"]`) : cont.querySelector(`[data-q="${q}"]`);
      if (el) el.focus();
    }
  }
  const refrescar = () => A().calcular();

  function iniciar() {
    const cont = $('#anaAsistente');
    if (!cont) return;
    cont.addEventListener('change', e => {
      const el = e.target, q = el.dataset.q;
      if (!q) return;
      if (el.type === 'checkbox') {
        const marcados = [...cont.querySelectorAll(`[data-q="${q}"]:checked`)].map(x => x.value), max = Number(el.dataset.max) || 99;
        if (marcados.length > max) { el.checked = false; L() && L().toast(T('Hasta {k}.', { k: max }), { type: 'warning' }); return; }
        est.r[q] = marcados;
      } else est.r[q] = el.value;
      /* al cambiar de objetivo o de respuesta, lo que dependía de ellas se vuelve a proponer */
      if (q === 'objetivo') est.r = { objetivo: est.r.objetivo };
      if (q === 'respuesta') delete est.r.tipoRespuesta;
      refrescar();
    });
    cont.addEventListener('click', e => {
      const b = e.target.closest('[data-asis]'), rec = est.rec;
      if (!b || !rec) return;
      if (b.dataset.asis === 'usar') {
        if (rec.bloque === 3) {
          const E = SP.app.explorar;
          Object.assign(E.desc, { variables: rec.e.variables.slice(), grupos: rec.e.grupos.slice() });
          E.tipo = 'desc';
          SP.app.ir(3);
          if (E.calcular) E.calcular();
          return;
        }
        A().usar(rec.metodo, rec.e, rec.op);
      } else if (b.dataset.asis === 'constructor') {
        if (SP.app.constructorUI) SP.app.constructorUI.desde(rec);
        A().ponerModo('constructor');
      } else if (b.dataset.asis === 'despues') {
        const d = rec.despues[+b.dataset.k];
        if (d) A().usar(d.metodo, d.e, d.op);
      }
    });
    A().pintores.asistente = pintar;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

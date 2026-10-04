/* SigmaPro — bloque 4: el constructor de modelos (interfaz).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Las variables se ponen en zonas (respuesta, evento, más respuestas, bloques, efectos aleatorios, factores, parcela
   grande, covariables) de tres maneras: se arrastran, se eligen en el menú «Agregar…» de cada zona (también en el
   celular) o, con una variable enfocada, se pulsa R, E, M, F, B, A, C o P (Supr la quita). Con un evento, la respuesta
   es el tiempo hasta él (modelo de Cox); con más respuestas, la MANOVA; en esos dos la fórmula no se edita a mano. La distribución de la respuesta (normal, conteo o gamma) elige
   entre el modelo lineal, el generalizado y sus versiones mixtas. SP.constructorModelos.modelo decide el diseño y su fórmula; la fórmula se
   puede editar a mano y entonces va al modelo lineal general, con la explicación de cada término o del error. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const A = () => SP.app.analisis;
  const L = () => window.LABG;
  const est = { roles: null, hoja: null, editando: false, derecha: '', comoFactor: [], modelo: null, c: null };
  const ZONAS = [
    { id: 'respuesta', titulo: 'Respuesta', tecla: 'R', ayuda: 'La variable numérica que mediste (o el tiempo hasta un evento).', max: 1, numerica: true },
    { id: 'evento', titulo: 'Evento (0/1)', tecla: 'E', ayuda: 'Con tiempo hasta un evento: 1 si ocurrió (germinó, murió), 0 si no (censura). Modelo de Cox.', max: 1, numerica: true },
    { id: 'masRespuestas', titulo: 'Más respuestas', tecla: 'M', ayuda: 'Otras variables medidas en las mismas unidades: se analizan juntas (MANOVA).', max: 9, numerica: true },
    { id: 'bloques', titulo: 'Bloques o repeticiones', tecla: 'B', ayuda: 'Uno: bloques al azar; dos: filas y columnas (cuadro latino).', max: 2 },
    { id: 'aleatorios', titulo: 'Efectos aleatorios', tecla: 'A', ayuda: 'Bloques, localidades o años vistos como muestra de muchos posibles (modelo mixto, motor R).', max: 3 },
    { id: 'factores', titulo: 'Factores de tratamiento', tecla: 'F', ayuda: 'Se cruzan todos (con sus interacciones).', max: 6 },
    { id: 'parcela', titulo: 'Parcela grande', tecla: 'P', ayuda: 'El factor aplicado a parcelas grandes (parcelas divididas).', max: 1 },
    { id: 'covariables', titulo: 'Covariables', tecla: 'C', ayuda: 'Numéricas medidas antes del tratamiento (ANCOVA) o predictores (regresión).', max: 15, numerica: true },
  ];
  const TECLAS = { r: 'respuesta', e: 'evento', m: 'masRespuestas', b: 'bloques', a: 'aleatorios', f: 'factores', p: 'parcela', c: 'covariables' };
  const FAMILIAS = [['normal', 'Normal (medida continua)'], ['conteo', 'Conteo (Poisson)'], ['gamma', 'Positiva y asimétrica (gamma)']];

  const infoDe = c => ({ numericas: c.numericas, factores: c.t.nombres.filter(n => !c.numericas.includes(n) && !c.fechas.includes(n)).concat(c.numFactor) });
  function rolesIniciales(c) {
    const p = c.pap, resp = p.respuestas.length ? p.respuestas[p.respuestas.length - 1] : (c.numericas[0] || '');
    const bloques = p.fila && p.columna ? [p.fila, p.columna] : p.bloque ? [p.bloque] : [];
    return { respuesta: resp, bloques, factores: p.factores.filter(f => !bloques.includes(f) && f !== resp).slice(0, 2), parcelaGrande: '', covariables: [], aleatorios: [], familia: 'normal', evento: '', masRespuestas: [] };
  }
  /** Papeles a partir de una recomendación del asistente. */
  function desde(rec) {
    const e = rec.e || {}, r = { respuesta: e.respuesta || '', bloques: [], factores: [], parcelaGrande: e.parcelaGrande || '', covariables: [], aleatorios: [], familia: 'normal', evento: '', masRespuestas: [] };
    /* Fase 3: el tiempo y el evento (Cox, Kaplan-Meier) o las respuestas de la MANOVA */
    if (rec.metodo === 'cox' || rec.metodo === 'kaplan-meier') {
      Object.assign(r, { respuesta: e.tiempo || '', evento: e.evento || '', factores: [].concat(e.factores || (e.grupo ? [e.grupo] : [])), covariables: [].concat(e.covariables || []), bloques: e.estrato ? [e.estrato] : [] });
      est.roles = r; est.editando = false; est.hoja = SP.app.datos.hoja;
      return;
    }
    if (rec.metodo === 'manova') {
      const rs = [].concat(e.respuestas || []);
      Object.assign(r, { respuesta: rs[0] || '', masRespuestas: rs.slice(1), factores: [].concat(e.tratamientos || []), bloques: e.bloque ? [e.bloque] : [] });
      est.roles = r; est.editando = false; est.hoja = SP.app.datos.hoja;
      return;
    }
    const mixto = /^mixto-|^glmm/.test(rec.metodo || '');
    if (e.fila && e.columna) r.bloques = [e.fila, e.columna]; else if (e.bloque) r[mixto ? 'aleatorios' : 'bloques'] = [e.bloque]; else if (e.repeticion) r.bloques = [e.repeticion];
    if (/conteos|glmm-bloques/.test(rec.metodo || '') && (!rec.op || ['auto', 'poisson'].includes(rec.op.familia))) r.familia = 'conteo';
    if (rec.metodo === 'glm-gamma') r.familia = 'gamma';
    if (e.tratamiento) r.factores = [e.tratamiento];
    r.factores = [].concat(e.tratamientos || []).concat([e.parcelaGrande, e.subparcela, e.subsubparcela].filter(Boolean));
    r.factores = r.factores.filter((f, i) => f && r.factores.indexOf(f) === i);
    r.covariables = [].concat(e.covariables || (rec.metodo === 'regresion-lineal' ? e.predictores || [] : []));
    est.roles = r; est.editando = false; est.hoja = SP.app.datos.hoja;
  }
  const enZona = (r, z) => (z === 'respuesta' ? (r.respuesta ? [r.respuesta] : []) : z === 'evento' ? (r.evento ? [r.evento] : []) : z === 'parcela' ? (r.parcelaGrande ? [r.parcelaGrande] : []) : r[z] || []);
  function quitar(v) {
    const r = est.roles;
    if (r.respuesta === v) r.respuesta = '';
    if (r.parcelaGrande === v) r.parcelaGrande = '';
    if (r.evento === v) r.evento = '';
    for (const z of ['bloques', 'aleatorios', 'factores', 'covariables', 'masRespuestas']) r[z] = (r[z] || []).filter(x => x !== v);
  }
  function asignar(v, z) {
    const r = est.roles, c = est.c, zona = ZONAS.find(x => x.id === z);
    if (!zona || !v) return;
    if (zona.numerica && !c.numericas.includes(v)) { L() && L().toast(T('«{v}» no es numérica: no puede ir en «{z}».', { v, z: T(zona.titulo) }), { type: 'warning' }); return; }
    if (z === 'parcela') {
      if (!r.factores.includes(v)) { quitar(v); r.factores.push(v); }
      r.parcelaGrande = v;
    } else {
      quitar(v);
      if (z === 'respuesta') r.respuesta = v;
      else if (z === 'evento') r.evento = v;
      else {
        if (!r[z]) r[z] = [];
        if (r[z].length >= zona.max) { L() && L().toast(T('En «{z}» caben {k} variables.', { z: T(zona.titulo), k: zona.max }), { type: 'warning' }); return; }
        r[z].push(v);
      }
    }
    est.editando = false;
    A().calcular();
  }

  /** La lectura de la fórmula escrita: cada término explicado, o el error y cómo arreglarlo. */
  function lectura(c) {
    const lec = SP.constructorModelos.interpretar(est.roles.respuesta, est.derecha, infoDe(c), est.comoFactor);
    const numEn = lec.ok ? lec.variables.filter(v => c.numericas.includes(v)) : [];
    const html = lec.ok ? `<ul class="ml-terminos small">${lec.terminos.map(x => `<li><b>${esc(x.etiqueta)}</b>: ${esc(x.explicacion)}</li>`).join('')}</ul>` +
        (numEn.length ? `<fieldset class="exp-casillas"><legend>${esc(T('Numéricas que son tratamientos (factor)'))}</legend>${numEn.map(n => `<label class="imp-check"><input type="checkbox" data-comofactor value="${esc(n)}"${est.comoFactor.includes(n) ? ' checked' : ''}> ${esc(n)}</label>`).join('')}</fieldset>` : '')
      : `<p class="msg msg-error small"><strong>${esc(lec.mensaje)}</strong>${lec.arreglo ? ` <span class="msg-fix">${esc(lec.arreglo)}</span>` : ''}</p>`;
    return { ok: lec.ok, html };
  }
  /** Al escribir, solo se rehace la lectura (el campo conserva el cursor). */
  function releer() {
    const cont = $('#consLectura'), b = $('#consUsarFormula');
    if (!cont || !est.c) return;
    const lec = lectura(est.c);
    cont.innerHTML = lec.html;
    if (b) b.disabled = !lec.ok;
  }

  function pintar(c) {
    const cont = $('#anaConstructor');
    if (!cont) return;
    est.c = c;
    if (!est.roles || SP.app.datos.hoja !== est.hoja) { est.roles = rolesIniciales(c); est.hoja = SP.app.datos.hoja; est.editando = false; }
    const r = est.roles;
    if (!r.aleatorios) r.aleatorios = [];
    if (!r.familia) r.familia = 'normal';
    if (!r.masRespuestas) r.masRespuestas = [];
    if (r.evento === undefined) r.evento = '';
    const fase3 = !!(r.evento || r.masRespuestas.length);   // Cox o MANOVA: la fórmula sale de las zonas
    if (fase3) est.editando = false;
    const usadas = new Set([r.respuesta, r.evento, ...r.masRespuestas, ...r.bloques, ...r.aleatorios, ...r.factores, ...r.covariables].filter(Boolean));
    const columnas = c.t.nombres.filter(n => !c.fechas.includes(n));
    const tipoDe = n => (c.numFactor.includes(n) ? T('num. (factor)') : c.numericas.includes(n) ? T('numérica') : T('factor'));
    const m = est.modelo = SP.constructorModelos.modelo(r, infoDe(c));
    if (!est.editando) { est.derecha = m.formula ? m.formula.replace(/^[^~]*~\s*/, '').replace(/\s*\+\s*Error\(.*$/, '') : ''; est.comoFactor = m.op && m.op.comoFactor ? m.op.comoFactor.slice() : r.factores.concat(r.bloques).filter(v => c.numericas.includes(v)); }
    /* foco */
    const f = document.activeElement && cont.contains(document.activeElement) ? document.activeElement : null;
    const clave = f ? (f.dataset.var ? 'var|' + f.dataset.var : f.dataset.zona ? 'zona|' + f.dataset.zona + '|' + (f.dataset.quitar || '') : f.id ? 'id|' + f.id : '') : '';
    const pool = `<div class="cons-pool" role="list" aria-label="${esc(T('Variables de la tabla'))}">${columnas.map(n => `<button type="button" class="cons-chip${usadas.has(n) ? ' usada' : ''}" draggable="true" data-var="${esc(n)}" role="listitem" aria-describedby="consAyuda">${esc(n)} <span class="cons-tipo">${esc(tipoDe(n))}</span></button>`).join('')}</div>` +
      `<p class="small muted" id="consAyuda">${esc(T('Arrastra cada variable a su zona, o enfócala y pulsa R (respuesta), E (evento), M (más respuestas), F (factor), B (bloque), A (aleatorio), C (covariable) o P (parcela grande); Supr la quita.'))}</p>`;
    const zonas = ZONAS.map(z => {
      const vs = enZona(r, z.id), compatibles = columnas.filter(n => !vs.includes(n) && (!z.numerica || c.numericas.includes(n)) && (z.id !== 'parcela' || r.factores.includes(n)));
      const sep = z.id === 'factores' ? '<span class="cons-x" aria-hidden="true">×</span>' : '';
      return `<div class="cons-zona${vs.length ? ' llena' : ''}" data-zona="${z.id}"><div class="cons-zt"><span>${esc(T(z.titulo))}</span><kbd>${z.tecla}</kbd></div>` +
        `<div class="cons-chips">${vs.map(v => `<span class="cons-chip puesta">${esc(v)}<button type="button" class="cons-quitar" data-zona="${z.id}" data-quitar="${esc(v)}" aria-label="${esc(T('Quitar «{v}» de {z}', { v, z: T(z.titulo) }))}">×</button></span>`).join(sep) || `<span class="small muted">${esc(T(z.ayuda))}</span>`}</div>` +
        (compatibles.length && vs.length < z.max ? `<select class="select cons-agregar" data-zona="${z.id}" aria-label="${esc(T('Agregar a {z}', { z: T(z.titulo) }))}"><option value="">${esc(T('Agregar…'))}</option>${compatibles.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select>` : '') + '</div>';
    }).join('') + (fase3 ? '' : `<label class="field cons-familia"><span>${esc(T('Distribución de la respuesta'))}</span><select class="select" id="consFamilia">${FAMILIAS.map(([v, t]) => `<option value="${v}"${r.familia === v ? ' selected' : ''}>${esc(T(t))}</option>`).join('')}</select></label>`);
    /* fórmula */
    let formula;
    if (!est.editando) {
      formula = `<div class="cons-formula"><span class="cons-lbl">${esc(T('Fórmula'))}</span><code>${esc(m.formula || '—')}</code>` +
        (r.respuesta && !fase3 ? `<button type="button" class="btn btn-ghost btn-sm" id="consEditar">${esc(T('Editar la fórmula'))}</button>` : '') + '</div>' +
        (fase3 ? `<p class="small muted">${esc(T('Con un evento (Cox) o varias respuestas (MANOVA), la fórmula sale de las zonas: no se edita a mano.'))}</p>` : '');
    } else {
      const lec = lectura(c);
      formula = `<div class="cons-editor"><div class="cons-formula editando"><label class="cons-lbl" for="consDerecha">${esc(r.respuesta)} ~</label><input class="input" type="text" id="consDerecha" spellcheck="false" autocomplete="off" value="${esc(est.derecha)}" aria-describedby="consLectura"></div><div id="consLectura">${lec.html}</div><p class="small muted">${esc(T('Se analiza con el modelo lineal general (sin estratos de error), o con el mixto si escribes efectos aleatorios como (1 | bloque): «a * b» cruza, «a / b» anida b en a, «(a + b + c)^2» deja hasta las interacciones dobles y «- 1» quita la intercepción.'))}</p>` +
        `<div class="btn-row"><button type="button" class="btn btn-primary" id="consUsarFormula"${lec.ok ? '' : ' disabled'}>${esc(T('Usar y calcular esta fórmula'))}</button><button type="button" class="btn btn-ghost" id="consVolver">${esc(T('Volver a la del constructor'))}</button></div></div>`;
    }
    const nombre = m.metodo && SP.metodos[m.metodo] ? SP.metodos[m.metodo].nombre : '';
    const resumen = est.editando ? '' : m.error
      ? `<div class="msg msg-warning"><strong>${esc(m.error.mensaje)}</strong>${m.error.arreglo ? ` <span class="msg-fix">${esc(m.error.arreglo)}</span>` : ''}</div>`
      : `<div class="cons-resumen"><p><span class="pill">${esc(T('Análisis'))}</span> <b>${esc(nombre)}</b></p>${m.descripcion.map(d => `<p class="small">${esc(d)}</p>`).join('')}${m.avisos.map(a => `<p class="msg msg-warning small">${esc(a)}</p>`).join('')}` +
        `<div class="btn-row"><button type="button" class="btn btn-primary" id="consUsar">${esc(T('Usar y calcular'))}</button></div></div>`;
    cont.innerHTML = `<div class="cons-grid"><div class="cons-izq"><p class="cons-titulo">${esc(T('Variables'))}</p>${pool}</div><div class="cons-der"><div class="cons-zonas">${zonas}</div>${formula}${resumen}</div></div>`;
    if (clave) {
      const [k, a] = clave.split('|');
      const el = k === 'var' ? cont.querySelector(`[data-var="${CSS.escape(a)}"]`) : k === 'zona' ? cont.querySelector(`.cons-agregar[data-zona="${a}"]`) || cont.querySelector(`.cons-zona[data-zona="${a}"] .cons-quitar`) : k === 'id' ? cont.querySelector('#' + a) : null;
      if (el) { el.focus(); if (el.type === 'text') el.setSelectionRange(el.value.length, el.value.length); }
    }
  }

  function iniciar() {
    const cont = $('#anaConstructor');
    if (!cont) return;
    cont.addEventListener('keydown', e => {
      const chip = e.target.closest('.cons-chip[data-var]');
      if (!chip || e.ctrlKey || e.altKey || e.metaKey) return;
      const k = e.key.toLowerCase();
      if (TECLAS[k]) { e.preventDefault(); asignar(chip.dataset.var, TECLAS[k]); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); quitar(chip.dataset.var); est.editando = false; A().calcular(); }
    });
    cont.addEventListener('dragstart', e => { const chip = e.target.closest('.cons-chip[data-var]'); if (chip) { e.dataTransfer.setData('text/plain', chip.dataset.var); e.dataTransfer.effectAllowed = 'move'; } });
    cont.addEventListener('dragover', e => { const z = e.target.closest('.cons-zona[data-zona]'); if (z) { e.preventDefault(); z.classList.add('sobre'); } });
    cont.addEventListener('dragleave', e => { const z = e.target.closest('.cons-zona[data-zona]'); if (z) z.classList.remove('sobre'); });
    cont.addEventListener('drop', e => { const z = e.target.closest('.cons-zona[data-zona]'); if (!z) return; e.preventDefault(); asignar(e.dataTransfer.getData('text/plain'), z.dataset.zona); });
    cont.addEventListener('change', e => {
      const el = e.target;
      if (el.classList.contains('cons-agregar') && el.value) asignar(el.value, el.dataset.zona);
      else if (el.hasAttribute('data-comofactor')) { est.comoFactor = [...cont.querySelectorAll('[data-comofactor]:checked')].map(x => x.value); releer(); }
      else if (el.id === 'consFamilia') { est.roles.familia = el.value; est.editando = false; A().calcular(); }
    });
    let espera = 0;
    cont.addEventListener('input', e => {
      if (e.target.id !== 'consDerecha') return;
      est.derecha = e.target.value;
      clearTimeout(espera);
      espera = setTimeout(releer, 250);
    });
    cont.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.quitar) { quitar(b.dataset.quitar); est.editando = false; A().calcular(); }
      else if (b.id === 'consEditar') { est.editando = true; A().calcular(); const i = $('#consDerecha'); if (i) i.focus(); }
      else if (b.id === 'consVolver') { est.editando = false; A().calcular(); }
      else if (b.id === 'consUsar' && est.modelo && est.modelo.metodo) A().usar(est.modelo.metodo, est.modelo.e, est.modelo.op);
      else if (b.id === 'consUsarFormula') {
        /* la fórmula escrita: con (1 | …), modelo mixto; con conteo o gamma, generalizado */
        const mixto = /\|/.test(est.derecha), fam = est.roles.familia || 'normal', e = { respuesta: est.roles.respuesta };
        if (fam === 'normal') A().usar(mixto ? 'modelo-mixto' : 'modelo-lineal', e, { derecha: est.derecha, comoFactor: est.comoFactor, tipoSC: 3 });
        else A().usar(mixto ? 'glmm' : 'glm', e, Object.assign({ derecha: est.derecha, comoFactor: est.comoFactor, familia: fam === 'conteo' ? 'poisson' : 'gamma', tipo: 2 }, mixto ? { sobredispersion: 'auto' } : {}));
      }
    });
    A().pintores.constructor = pintar;
    SP.app.constructorUI = { desde, estado: est };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

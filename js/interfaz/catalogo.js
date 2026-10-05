/* SigmaPro — el catálogo de análisis.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Arriba, «Con tus datos»: lo que hay en la tabla (filas, numéricas, factores, bloques, fechas, conteos…) y lo que el
   asistente recomienda, con su porqué. Abajo, cada familia con sus análisis en tarjetas: nombre, para qué sirve y si se
   puede hacer con estos datos (listo / qué falta / sin datos / motor R). Se busca por texto y se filtra a los que se
   pueden hacer. Al elegir uno, el catálogo se recoge en una barra con el análisis elegido y el botón para volver a
   abrirlo. El clic en [data-metodo] lo atiende analisis.js (elige y calcula). */
(function () {
  'use strict';
  const T = SP.T, esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const est = { abierto: true, buscar: '', soloListos: false, familia: '' };
  try { est.soloListos = localStorage.getItem('sigmapro.catalogo.listos') === '1'; } catch (e) { /* sin almacenamiento */ }

  /* íconos propios por familia (trazos de 24 × 24) */
  const ICONO = {
    descriptiva: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    supuestos: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    'pruebas-t': '<path d="M3 18c2-8 4-12 6-12s4 4 6 12"/><path d="M9 18c2-8 4-12 6-12s4 4 6 12" opacity=".55"/><path d="M2 18h20"/>',
    'no-parametricas': '<path d="M4 18h4v-4h4v-4h4V6h4"/><path d="M4 21h16"/>',
    disenos: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    comparaciones: '<path d="M5 19V9M12 19V5M19 19v-7"/><text x="3" y="7" font-size="5" fill="currentColor" stroke="none">a</text><text x="17.5" y="10" font-size="5" fill="currentColor" stroke="none">b</text>',
    regresion: '<path d="M3 20L21 5"/><circle cx="6" cy="16" r="1.2"/><circle cx="10" cy="14" r="1.2"/><circle cx="13" cy="9" r="1.2"/><circle cx="18" cy="8" r="1.2"/>',
    correlacion: '<circle cx="6" cy="17" r="1.3"/><circle cx="9" cy="13" r="1.3"/><circle cx="12" cy="14" r="1.3"/><circle cx="15" cy="9" r="1.3"/><circle cx="18" cy="7" r="1.3"/><path d="M3 21h18M3 21V3"/>',
    contingencia: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M11 4v16"/>',
    mixtos: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5" opacity=".7"/><path d="M3 17l9 5 9-5" opacity=".45"/>',
    generalizados: '<path d="M3 19c6 0 7-14 18-14"/><circle cx="7" cy="17" r="1.2"/><circle cx="12" cy="11" r="1.2"/><circle cx="17" cy="7" r="1.2"/>',
    'no-lineal': '<path d="M3 20c4-1 6-13 10-13h8"/><path d="M3 21h18"/>',
    superficies: '<ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse cx="12" cy="12" rx="5.5" ry="3.4"/><ellipse cx="12" cy="12" rx="2" ry="1.2"/>',
    multiambiente: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    geneticos: '<path d="M7 3c0 6 10 6 10 12s-10 3-10 6M17 3c0 6-10 6-10 12s10 3 10 6"/><path d="M8 7h8M8 17h8"/>',
    multivariado: '<path d="M12 12V3M12 12l7.8 4.5M12 12l-7.8 4.5"/><circle cx="12" cy="12" r="1.5"/>',
    potencia: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>',
    supervivencia: '<path d="M3 4v16h18"/><path d="M3 6h5v4h4v5h5v3h4"/>',
  };
  const icono = id => `<svg class="cat-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONO[id] || ICONO.descriptiva}</svg>`;
  const ESTADO = () => ({ listo: T('Listo con tus datos'), falta: T('Le falta'), sinDatos: T('No necesita datos') });

  /** El resumen de la tabla, en chips. */
  function perfilHTML(p) {
    if (!p) return `<p class="cat-perfil-vacio">${esc(T('Sin datos todavía: carga una tabla en el bloque Datos (o un ejemplo) y aquí verás qué análisis puedes hacer con ella. Los de tamaño de muestra y potencia no necesitan datos.'))}</p>`;
    const lista = (xs, k) => xs.slice(0, k).map(esc).join(', ') + (xs.length > k ? '…' : '');
    const chips = [
      [T('{n} filas', { n: p.n.toLocaleString(SP.LOCAL) }), ''],
      p.numericas.length ? [p.numericas.length === 1 ? T('1 numérica') : T('{k} numéricas', { k: p.numericas.length }), lista(p.numericas, 4)] : null,
      p.factores.length ? [p.factores.length === 1 ? T('1 factor') : T('{k} factores', { k: p.factores.length }), p.factores.slice(0, 4).map(f => esc(f) + ' (' + (p.niveles[f] || []).length + ')').join(', ') + (p.factores.length > 4 ? '…' : '')] : null,
      p.bloque ? [T('Bloques'), esc(p.bloque)] : null,
      p.filaColumna ? [T('Filas y columnas'), ''] : null,
      p.parcelas.length ? [T('Parcelas'), lista(p.parcelas, 2)] : null,
      p.fechas.length ? [T('Fechas'), lista(p.fechas, 2)] : null,
      p.conteos.length ? [T('Conteos'), lista(p.conteos, 3)] : null,
      p.proporciones.length ? [T('Proporciones'), lista(p.proporciones, 3)] : null,
      p.binarias.length ? [T('Columnas 0/1'), lista(p.binarias, 3)] : null,
    ].filter(Boolean);
    return `<ul class="cat-chips" aria-label="${esc(T('Lo que hay en tus datos'))}">` + chips.map(([a, b]) => `<li><b>${esc(a)}</b>${b ? ' <span>' + b + '</span>' : ''}</li>`).join('') + '</ul>';
  }

  /** Lo que recomienda el asistente con estos datos (su método y los siguientes pasos). */
  function recomendado(p) {
    if (!p) return '';
    let r = null;
    try { r = SP.asistente.recomendar({}, p.info); } catch (e) { return ''; }
    if (!r || !r.metodo || !SP.metodos[r.metodo] || !SP.metodoDisponible(r.metodo)) return '';
    const despues = (r.despues || []).filter(d => d.metodo && SP.metodos[d.metodo] && SP.metodoDisponible(d.metodo)).slice(0, 3);
    return `<div class="cat-rec"><p class="cat-rec-eti">${esc(T('Recomendado para tus datos'))}</p>` +
      `<button type="button" class="cat-rec-btn" data-metodo="${esc(r.metodo)}">${SP.ilustraciones ? SP.ilustraciones.svg(r.metodo) : icono(SP.metodos[r.metodo].familia)}<span><b>${esc(r.titulo || SP.metodos[r.metodo].nombre)}</b>` +
      `<span>${esc((r.porque || [])[0] || r.resumen || SP.metodos[r.metodo].resumen || '')}</span></span><span class="cat-rec-ir" aria-hidden="true">→</span></button>` +
      (despues.length ? `<p class="cat-rec-despues"><span>${esc(T('Después:'))}</span> ` + despues.map(d => `<button type="button" class="cat-mini" data-metodo="${esc(d.metodo)}">${esc(d.texto || SP.metodos[d.metodo].nombre)}</button>`).join(' ') + '</p>' : '') +
      `<p class="cat-rec-nota small muted">${esc(T('Lo propone el asistente con lo que ve en la tabla; con sus preguntas afinas la elección.'))}</p></div>`;
  }

  /** Una tarjeta de análisis. */
  function tarjeta(m, r, activo) {
    const etiqueta = ESTADO()[r.estado], falta = r.falta.length ? T('Falta: {f}.', { f: r.falta.join('; ') }) : '';
    return `<li class="cat-tarjeta e-${r.estado}${activo ? ' activo' : ''}"><button type="button" data-metodo="${esc(m.id)}" aria-pressed="${activo}"` +
      ` aria-describedby="cat-d-${esc(m.id)}"><span class="cat-cab">${SP.ilustraciones ? SP.ilustraciones.svg(m.id) : ''}<span class="cat-nombre">${esc(m.nombre)}</span></span>` +
      `<span class="cat-estado" data-estado="${r.estado}">${esc(etiqueta)}${m.motor === 'r' ? ' · ' + esc(T('motor R')) : ''}</span>` +
      `<span class="cat-resumen" id="cat-d-${esc(m.id)}">${esc(m.resumen || '')}${falta ? '<span class="cat-falta">' + esc(falta) + '</span>' : ''}</span></button></li>`;
  }

  /**
   * Dibuja el catálogo en #anaCatalogo.
   * @param {object} o { tabla, vacio (sin datos), metodo (el elegido), elegido (si el usuario ya eligió) }
   */
  function dibujar(o) {
    const raiz = document.querySelector('#anaCatalogo');
    if (!raiz) return;
    /* el perfil (y el estado de cada tarjeta) solo con el catálogo abierto: recogido basta la barra */
    const p = o.vacio || !est.abierto ? null : SP.aplicable.perfil(o.tabla);
    const fams = SP.familias.filter(f => f.id !== 'descriptiva' && (!o.vacio || f.id === 'potencia'));
    const q = est.buscar.trim().toLowerCase();
    const sel = SP.metodos[o.metodo];
    let total = 0, listos = 0;
    const familias = fams.map(f => {
      const ms = SP.listaMetodos(f.id).filter(m => SP.metodoDisponible(m.id) && (!o.vacio || m.sinDatos));
      const filas = ms.map(m => ({ m, r: SP.aplicable.revisar(m, p) }));
      filas.forEach(x => { total++; if (x.r.estado !== 'falta') listos++; });
      const vis = filas.filter(x => (!est.soloListos || x.r.estado !== 'falta') && (!q || (x.m.nombre + ' ' + (x.m.resumen || '') + ' ' + f.nombre).toLowerCase().includes(q)) && (!est.familia || est.familia === f.id));
      if (!vis.length) return '';
      const n = filas.filter(x => x.r.estado !== 'falta').length;
      return `<section class="cat-familia" aria-labelledby="cat-f-${f.id}"><h3 id="cat-f-${f.id}">${icono(f.id)}<span>${esc(f.nombre)}</span>` +
        `<span class="cat-cuenta">${esc(p ? T('{k} de {n} con tus datos', { k: n, n: filas.length }) : T('{n} análisis', { n: filas.length }))}</span></h3>` +
        `<ul class="cat-grid">${vis.map(x => tarjeta(x.m, x.r, x.m.id === o.metodo)).join('')}</ul></section>`;
    }).join('');
    const filtros = `<div class="cat-filtros"><label class="cat-buscar"><span class="sr-only">${esc(T('Buscar un análisis'))}</span>` +
      `<input type="search" data-cat="buscar" value="${esc(est.buscar)}" placeholder="${esc(T('Buscar: Tukey, bloques, conteos, regresión…'))}" autocomplete="off"></label>` +
      (p ? `<label class="imp-check cat-solo"><input type="checkbox" data-cat="listos"${est.soloListos ? ' checked' : ''}> ${esc(T('Solo los que puedo hacer con mis datos'))}</label>` : '') +
      `<label class="cat-fam-sel"><span class="sr-only">${esc(T('Familia'))}</span><select data-cat="familia"><option value="">${esc(T('Todas las familias'))}</option>` +
      fams.map(f => `<option value="${f.id}"${est.familia === f.id ? ' selected' : ''}>${esc(f.nombre)}</option>`).join('') + '</select></label></div>';
    const barra = `<div class="cat-barra"><div class="cat-barra-txt">${sel ? (SP.ilustraciones ? SP.ilustraciones.svg(sel.id) : icono(sel.familia)) : ''}<span><span class="cat-barra-eti">${esc(T('Análisis elegido'))}</span>` +
      `<b>${esc(sel ? sel.nombre : T('ninguno'))}</b></span></div><button type="button" class="btn btn-secondary btn-sm" data-cat="alternar" aria-expanded="${est.abierto}" aria-controls="cat-cuerpo">` +
      `${esc(est.abierto ? T('Cerrar el catálogo') : T('Ver el catálogo ({k} análisis)', { k: total }))}</button></div>`;
    raiz.innerHTML = barra + `<div id="cat-cuerpo"${est.abierto ? '' : ' hidden'}>` +
      `<div class="cat-datos"><div><h3 class="cat-tit">${esc(p ? T('Con tus datos') : T('Tus datos'))}</h3>${perfilHTML(p)}` +
      (p ? `<p class="cat-resumen-total">${esc(T('Puedes hacer {k} de los {n} análisis del catálogo con esta tabla.', { k: listos, n: total }))}</p>` : '') + `</div>${recomendado(p)}</div>` +
      filtros + (familias || `<p class="cat-nada">${esc(T('Ningún análisis coincide con la búsqueda.'))}</p>`) + '</div>';
  }

  /* los controles del propio catálogo (el clic en un análisis lo atiende analisis.js y luego llama a recoger) */
  function iniciar(redibujar) {
    const raiz = document.querySelector('#anaCatalogo');
    if (!raiz || raiz.dataset.iniciado) return;
    raiz.dataset.iniciado = '1';
    raiz.addEventListener('input', e => {
      const c = e.target.dataset.cat;
      if (c === 'buscar') { est.buscar = e.target.value; const pos = e.target.selectionStart; redibujar(); const i = raiz.querySelector('[data-cat="buscar"]'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (err) { /* nada */ } } }
    });
    raiz.addEventListener('change', e => {
      const c = e.target.dataset.cat;
      if (c === 'listos') { est.soloListos = e.target.checked; try { localStorage.setItem('sigmapro.catalogo.listos', est.soloListos ? '1' : '0'); } catch (err) { /* nada */ } redibujar(); raiz.querySelector('[data-cat="listos"]')?.focus(); }
      if (c === 'familia') { est.familia = e.target.value; redibujar(); raiz.querySelector('[data-cat="familia"]')?.focus(); }
    });
    raiz.addEventListener('click', e => {
      if (e.target.closest('[data-cat="alternar"]')) { est.abierto = !est.abierto; redibujar(); raiz.querySelector('[data-cat="alternar"]')?.focus(); }
    });
  }
  /** Al elegir un análisis, el catálogo se recoge (queda la barra con el elegido). */
  function recoger() { est.abierto = false; }
  function abrir() { est.abierto = true; }

  SP.catalogoUI = { dibujar, iniciar, recoger, abrir, estado: est };
})();

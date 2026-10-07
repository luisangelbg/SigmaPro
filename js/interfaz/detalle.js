/* SigmaPro — nivel de detalle de los resultados (hito 5.2).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tres niveles para leer un resultado, iguales en Análisis, Explorar y el reporte:
     · Básico    la conclusión, las gráficas, el semáforo y «Cómo leer este cuadro» abierto (medidores y tarjetas de
                 interpretación); los cuadros de Análisis y del reporte, el código R y los detalles técnicos se ocultan.
                 En Explorar el cuadro es el resumen mismo: se ve en los tres niveles.
     · Estándar  todo el resultado, como siempre (el que trae la app).
     · Experto   además, las notas técnicas (método, entradas, opciones, filas usadas, programa y el modelo con sus
                 hipótesis, de la ficha de Fundamentos) y el código R, abiertos.
   El nivel es un atributo de <html> (data-detalle) que el guion del <head> pone antes de pintar; lo que se oculta lo
   decide css/sigma.css y lo que se abre, aplicar(). Se recuerda en el navegador («sigmapro.detalle»). Los documentos
   exportados no cambian con el nivel.

     SP.detalle.actual()                 → 'basico' | 'estandar' | 'experto'
     SP.detalle.poner(nivel)              cambia el nivel en toda la app
     SP.detalle.selector()               → los tres botones, para la cabecera de un resultado
     SP.detalle.aplicar(raiz)             abre o cierra lo que corresponde dentro de raiz (tras pintar un resultado)
     SP.detalle.tecnico(o)               → las notas técnicas plegadas (solo se ven en Experto)
     SP.detalle.filas(o)                 → los detalles técnicos [[nombre, valor]] (también los del reporte) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const CLAVE = 'sigmapro.detalle';
  const NIVELES = () => [
    ['basico', T('Básico'), T('La conclusión, las gráficas, el semáforo y cómo leer cada cuadro, sin los cuadros')],
    ['estandar', T('Estándar'), T('Todo el resultado, con los cuadros')],
    ['experto', T('Experto'), T('Además, las notas técnicas, el modelo y el código R, abiertos')],
  ];
  const actual = () => { const m = document.documentElement.getAttribute('data-detalle'); return m === 'basico' || m === 'experto' ? m : 'estandar'; };

  /** Abre o cierra, dentro de raiz, lo que el nivel muestra abierto. */
  function aplicar(raiz, antes) {
    raiz = raiz || document;
    const m = actual();
    raiz.querySelectorAll('details.lg-lectura').forEach(d => {
      if (m === 'basico') d.open = true;
      else if (antes === 'basico') d.open = false;
    });
    raiz.querySelectorAll('details.exp-codigo, details.exp-tecnico, details.rep-tecnico').forEach(d => {
      if (m === 'experto') d.open = true;
      else if (antes === 'experto') d.open = false;
    });
    if (m === 'experto') raiz.querySelectorAll('[data-modelo]:not([data-modelo-listo])').forEach(cargarModelo);
    if (SP.cuadros && SP.cuadros.desplazables) SP.cuadros.desplazables();
  }
  /** Cambia el nivel en toda la app. */
  function poner(nivel) {
    if (!NIVELES().some(n => n[0] === nivel)) nivel = 'estandar';
    const antes = actual();
    if (nivel === 'estandar') document.documentElement.removeAttribute('data-detalle'); else document.documentElement.setAttribute('data-detalle', nivel);
    try { localStorage.setItem(CLAVE, nivel); } catch (e) { /* sin almacenamiento */ }
    document.querySelectorAll('[data-detalle-poner]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.detallePoner === nivel)));
    aplicar(document, antes);
    document.dispatchEvent(new CustomEvent('sp:detalle', { detail: { nivel } }));
  }
  /** Los tres botones del nivel de detalle. */
  const selector = () => `<div class="seg sp-detalle" role="group" aria-label="${esc(T('Nivel de detalle'))}">` +
    NIVELES().map(([k, n, d]) => `<button type="button" data-detalle-poner="${k}" aria-pressed="${k === actual()}" title="${esc(d)}">${esc(n)}</button>`).join('') + '</div>';
  /** Aviso, visible solo en Básico, de que los cuadros quedan ocultos. */
  const avisoBasico = () => `<p class="small muted sp-basico-aviso">${esc(T('En Básico los cuadros no se muestran: los que tienen guía de lectura aparecen como «Lectura». Para verlos completos, cambia a Estándar.'))}</p>`;

  /* ---------------- detalles técnicos ---------------- */
  const describir = o => Object.entries(o || {}).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => k + ' = ' + (Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v)).join('; ') || '—';
  /**
   * Los detalles técnicos de un análisis: [[nombre, valor]].
   * o = { metodo, e, opciones, r, ms, nota, tabla } (tabla: la de los datos, con su n de filas)
   */
  function filas(o) {
    const v = SP.validacion.actual(), casos = SP.validacion.casosDe(o.metodo).casos;
    const ficha = SP.metodos[o.metodo] || {}, d = SP.app && SP.app.datos, filtro = d && d.filtro, r = o.r || {}, n = o.tabla ? o.tabla.n : 0;
    return [
      [T('Método'), (ficha.nombre || o.metodo) + ' (' + o.metodo + ')'],
      [T('Entradas'), describir(o.e)],
      [T('Opciones'), describir(o.opciones)],
      [T('Datos'), (d && d.origen ? d.origen + ' · ' : '') + T('{n} filas', { n }) + (filtro ? T(' · filtro: {f}', { f: filtro.expresion }) : '')],
      [T('Filas usadas'), String(Number.isFinite(r.n) ? r.n : (r.resumen && r.resumen.n) || n)],
      ficha.motor === 'r'
        ? [T('Programa'), T('SigmaPro {v}; motor R en el navegador (webR {w}, R {r}{p}); validado contra R en {k} casos de este método', { v: SP.VERSION, w: SP.motorR.CONFIG.version,
          r: (r.versiones && r.versiones.R) || '', p: Object.entries(r.versiones || {}).filter(([k]) => k !== 'R').map(([k, x]) => '; ' + k + ' ' + x).join(''), k: casos })]
        : [T('Programa'), T('SigmaPro {v}; núcleo propio validado contra R en {n} casos{c}', { v: SP.VERSION, n: v ? v.resumen.casos : '—', c: casos ? T(' ({k} de este método completo)', { k: casos }) : '' })],
      [T('Calculado en'), T('{ms} ms', { ms: Math.max(1, Math.round(o.ms || 0)) })],
    ].concat(o.nota ? [[T('Nota'), o.nota]] : []);
  }
  /** Las notas técnicas de un resultado, plegadas (se ven en Experto): los detalles y el modelo de su ficha. */
  function tecnico(o) {
    let dl = '';
    try { dl = `<dl class="dat-kv exp-tecnico-dl">${filas(o).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`; } catch (e) { dl = ''; }
    const ficha = o.ficha || o.metodo;
    return `<details class="exp-tecnico"><summary>${esc(T('Notas técnicas'))}</summary>${dl}` +
      (ficha ? `<div class="exp-modelo" data-modelo="${esc(ficha)}"></div>` : '') + '</details>';
  }
  const formula = (tex, bloque) => { try { return SP.formulas.mathml(tex, { bloque }); } catch (e) { return `<code>${esc(tex)}</code>`; } };
  /* el modelo y las hipótesis de la ficha de Fundamentos (se carga la primera vez que se ve en Experto) */
  function cargarModelo(div) {
    div.setAttribute('data-modelo-listo', '');
    if (!SP.app.fundamentos || !SP.app.fundamentos.cargar) return;
    SP.app.fundamentos.cargar(div.dataset.modelo).then(F => {
      const x = F[SP.IDIOMA] || F.es, m = x.modelo;
      if (!m || !m.tex) return;
      div.innerHTML = `<p class="exp-modelo-t">${esc(T('El modelo'))}</p><div class="fun-modelo">${formula(m.tex, true)}</div>` +
        (m.terminos && m.terminos.length ? `<dl class="fun-terminos">${m.terminos.map(([t, d]) => `<dt>${formula(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>` : '') +
        (x.hipotesis || []).map(h => `<div class="fun-hip"><p><span class="fun-hip-e">H<sub>0</sub>:</span> ${formula(h.h0)}</p><p><span class="fun-hip-e">H<sub>1</sub>:</span> ${formula(h.h1)}</p>` +
          (h.texto ? `<p class="small">${esc(h.texto)}</p>` : '') + '</div>').join('') +
        `<p class="small muted">${esc(T('De la ficha de Fundamentos de este análisis (bloque 9).'))}</p>`;
      if (SP.cuadros && SP.cuadros.desplazables) SP.cuadros.desplazables();
    }).catch(() => { /* sin ficha: quedan los detalles */ });
  }

  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('[data-detalle-poner]');
    if (b) poner(b.dataset.detallePoner);
  });
  SP.detalle = { NIVELES, actual, poner, selector, aplicar, avisoBasico, tecnico, filas };
})();

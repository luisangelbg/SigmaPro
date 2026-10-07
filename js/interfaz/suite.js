/* SigmaPro — la suite LABG dentro de la app: bloque 10 «Suite LABG», el bloque «Explora la suite LABG» al pie del
   Inicio y las sugerencias LABGSuggest (resultados de Análisis, fichas de Fundamentos, catálogo y bloque Datos).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Los datos: data/suite.js (las apps) y data/suite-rules.js (dónde se sugiere cada una y por qué). «Enviar datos a
   <App>» descarga la tabla cargada en el formato que lee esa app (todas las columnas en formato largo, o las numéricas
   con la primera columna de texto como etiqueta) y abre la app en una pestaña nueva: cada app es independiente y el
   archivo se carga en su bloque de datos. Nada sale del equipo.

     SP.app.suite.franjaMetodo(id, op) · franjaFamilia(familia) · tarjetasSuite() */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const S = () => window.SP_SUITE || { apps: [] };
  const R = () => window.SP_SUITE_REGLAS || { motivos: {}, metodos: {}, familias: {}, datos: [] };
  const lengua = () => (SP.IDIOMA === 'en' ? 'en' : 'es');
  const app = id => S().apps.find(a => a.id === id) || null;
  const nombre = a => a.nombre || a.id;
  const motivo = clave => { const m = R().motivos[clave]; return m ? m[lengua()] || m.es : ''; };
  const hayDatos = () => !!(SP.app.tablaAnalisis && SP.app.tablaAnalisis());
  const G = () => window.LABGSuggest;

  /* ---------------- sugerencias ---------------- */
  function franjaMetodo(id, op) {
    if (!G()) return '';
    const reglas = R().metodos[id] || [];
    const lista = reglas.map(([a, m]) => ({ app: app(a), motivo: motivo(m) })).filter(x => x.app);
    return G().franja(lista, { contexto: (op && op.contexto) || 'metodo:' + id, enviar: hayDatos(), titulo: op && op.titulo !== undefined ? op.titulo || undefined : undefined });
  }
  function franjaFamilia(fam) {
    if (!G()) return '';
    const ids = R().familias[fam] || [];
    const usa = ids.map(a => {
      const clave = Object.entries(R().metodos).flatMap(([, v]) => v).find(([x]) => x === a);
      return { app: app(a), motivo: clave ? motivo(clave[1]) : (app(a) || {})[lengua()]?.descripcion };
    }).filter(x => x.app);
    return G().franja(usa, { contexto: 'familia:' + fam, titulo: T('Herramientas relacionadas'), clase: 'lgs-pie' });
  }
  /* bloque Datos: lo que la tabla cargada deja ver de su estructura */
  function franjaDatos() {
    const t = SP.app.tablaAnalisis && SP.app.tablaAnalisis();
    if (!t || !G()) return '';
    const nombres = t.nombres || [];
    const nums = nombres.filter(n => t.col(n).tipo === 'numerica');
    const pat = re => nombres.some(n => re.test(SP.guias ? SP.guias.normalizar(n) : n.toLowerCase()));
    const cumple = {
      diseno: pat(/^(trat|tratamiento|tratamientos|variedad|hibrido|genotipo|dosis)/) && pat(/^(bloque|bloques|rep|repeticion|repeticiones)$/),
      muchasNumericas: nums.length,
      coordenadas: pat(/^(lat|latitud|latitude)$/) && pat(/^(lon|long|longitud|longitude)$/),
      fechas: nombres.some(n => t.col(n).fecha),
    };
    const lista = [];
    for (const r of R().datos) {
      const ok = r.si === 'muchasNumericas' ? cumple.muchasNumericas >= (r.minimo || 8) : !!cumple[r.si];
      const a = app(r.app);
      if (ok && a) lista.push({ app: a, motivo: (r.explica ? (r.explica[lengua()] || r.explica.es).replace('{n}', nums.length) + ' ' : '') + motivo(r.motivo) });
    }
    return G().franja(lista, { contexto: 'datos', enviar: true });
  }
  function pintarDatos() {
    const c = $('#datSuite');
    if (c) c.innerHTML = franjaDatos();
  }

  /* ---------------- «Enviar datos a <App>» ---------------- */
  function enviar(id) {
    const a = app(id), t = SP.app.tablaAnalisis && SP.app.tablaAnalisis();
    if (!a || !t) { L() && L().toast(T('Primero carga tus datos en el bloque 2.'), { type: 'warning' }); return; }
    let cols = t.nombres.slice();
    if (a.envio === 'numericas') {
      const nums = cols.filter(n => t.col(n).tipo === 'numerica');
      const etiqueta = cols.find(n => t.col(n).tipo !== 'numerica');
      cols = (etiqueta ? [etiqueta] : []).concat(nums);
    }
    const celda = v => { if (v == null || (typeof v === 'number' && !Number.isFinite(v))) return ''; const s = String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    /* numéricas con todas sus cifras; factores por el nombre de su nivel (faltante = celda vacía) */
    const valores = cols.map(n => { const c = t.col(n); return c.codigos ? Array.from(c.codigos, i => (i < 0 ? '' : c.niveles[i])) : Array.from(c.valores || []); });
    const filas = [cols.map(celda).join(',')];
    for (let i = 0; i < t.n; i++) filas.push(valores.map(v => celda(v[i])).join(','));
    const archivo = 'sigmapro-para-' + a.id.toLowerCase() + '.csv';
    const url = URL.createObjectURL(new Blob(['﻿' + filas.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' }));
    const enl = document.createElement('a'); enl.href = url; enl.download = archivo; document.body.appendChild(enl); enl.click(); enl.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    window.open(a.url, '_blank', 'noopener');
    L() && L().toast(T('Descargado {f}: ábrelo en {a}, en su bloque de datos.', { f: archivo, a: nombre(a) }), { type: 'success', duration: 8000 });
  }

  /* ---------------- «Explora la suite LABG» ---------------- */
  const destacadas = () => S().apps.filter(a => a.destacada !== false);
  function cita(a, formato) {
    const au = S().autor || {}, anio = /^\d{4}/.test(a.fecha || '') ? a.fecha.slice(0, 4) : 's. f.';
    const doi = a.doi && a.doi !== 'PENDIENTE' ? 'https://doi.org/' + a.doi : a.url;
    if (formato === 'bibtex') {
      const clave = (au.familia || 'autor').normalize('NFD').replace(/[^A-Za-z]/g, '').toLowerCase() + anio + a.id.toLowerCase();
      return `@software{${clave},\n  author    = {${au.familia}, ${au.dado}},\n  title     = {${a.titulo}},\n  version   = {${a.version}},\n  year      = {${anio}},\n` +
        (a.doi && a.doi !== 'PENDIENTE' ? `  doi       = {${a.doi}},\n` : '') + `  url       = {${a.repo && a.repo !== 'PENDIENTE' ? a.repo : a.url}}\n}`;
    }
    return `${au.familia}, ${(au.dado || '').split(/\s+/).map(p => p[0] + '.').join(' ')} (${anio}). ${a.titulo} (${lengua() === 'en' ? 'Version' : 'Versión'} ${a.version}) [${lengua() === 'en' ? 'Computer software' : 'Software'}]. ${a.doi && a.doi !== 'PENDIENTE' ? 'Zenodo. ' : ''}${doi}`;
  }
  function tarjetasSuite(opc) {
    const lista = destacadas();
    const x = a => a[lengua()] || a.es;
    const pend = a => a.estado === 'pendiente';
    const id = opc && opc.id ? opc.id : 'suite', h = opc && opc.nivel === 3 ? 'h3' : 'h2', h2 = h === 'h3' ? 'h4' : 'h3';
    return `<div class="sx" id="${esc(id)}"><div class="sx-cab"><p class="sx-eyebrow">LABG Suite</p><${h} class="sx-tit">${esc(T('Explora la suite LABG'))}</${h}>` +
      `<p class="sx-lead">${esc(T('Otras herramientas de la misma suite para continuar tu análisis: cada una abre en tu navegador, sin instalación, y tus datos no salen del equipo.'))}</p></div>` +
      `<div class="sx-grid">` + lista.map(a => `<article class="sx-app${pend(a) ? ' sx-pendiente' : ''}" aria-labelledby="${esc(id)}-${esc(a.id)}">` +
        `<div class="sx-app-cab">` + (pend(a) ? `<span class="sx-logo" aria-hidden="true"><img src="${esc(a.logo)}" alt="" width="64" height="64"></span>`
          : `<a class="sx-logo" href="${esc(a.url)}" target="_blank" rel="noopener" aria-label="${esc(T('Abrir {a} (en una pestaña nueva)', { a: nombre(a) }))}"><img src="${esc(a.logo)}" alt="" width="64" height="64"></a>`) +
        `<div><${h2} class="sx-nombre" id="${esc(id)}-${esc(a.id)}">${esc(nombre(a))}</${h2}><p class="sx-version">${pend(a) ? esc(T('Versión: PENDIENTE')) : esc(T('Versión {v}', { v: a.version }))}</p></div></div>` +
        `<p class="sx-eslogan">${esc(x(a).eslogan)}</p>` +
        (x(a).caracteristicas && x(a).caracteristicas.length ? `<ul class="sx-car">${x(a).caracteristicas.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : `<p class="small sx-pend">${esc(x(a).descripcion)}</p>`) +
        `<div class="sx-acc">` + (pend(a) ? `<span class="btn btn-secondary btn-sm" aria-disabled="true">${esc(T('Próximamente'))}</span>` :
          `<a class="btn btn-primary btn-sm" href="${esc(a.url)}" target="_blank" rel="noopener">${esc(T('Abrir app'))}<span class="sr-only"> ${esc(nombre(a))}</span></a>` +
          (a.manual ? `<a class="btn btn-secondary btn-sm" href="${esc(a.manual)}" target="_blank" rel="noopener">${esc(T('Manual'))}<span class="sr-only"> ${esc(T('de {a}', { a: nombre(a) }))}</span></a>` : '') +
          `<details class="sx-citar"><summary class="btn btn-ghost btn-sm">${esc(T('Citar'))}<span class="sr-only"> ${esc(nombre(a))}</span></summary><div class="sx-cita">` +
          `<p class="sx-cita-t">APA</p><p class="sx-cita-apa">${esc(cita(a, 'apa'))}</p><p class="sx-cita-t">BibTeX</p><pre class="sx-cita-bib">${esc(cita(a, 'bibtex'))}</pre>` +
          `<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-sx-copiar="apa" data-sx-app="${esc(a.id)}">${esc(T('Copiar APA'))}</button><button type="button" class="btn btn-ghost btn-sm" data-sx-copiar="bibtex" data-sx-app="${esc(a.id)}">${esc(T('Copiar BibTeX'))}</button></div></div></details>`) +
        `</div></article>`).join('') + `</div>` +
      `<footer class="sx-pie"><span class="sx-iso">${window.LABG && LABG.isotipo ? LABG.isotipo('sx-iso-svg') : ''}</span><p class="sx-lema">${esc(T('Del dato a la decisión.'))}</p>` +
      `<a class="sx-portal" href="${esc(S().portal)}" target="_blank" rel="noopener">${esc(T('Ver las 15+ aplicaciones de la suite'))} →</a></footer></div>`;
  }
  function pintarSuite() {
    const a = $('#suiteInicio'), b = $('#suiteBloque');
    if (a) a.innerHTML = tarjetasSuite({ id: 'sxInicio' });
    if (b) b.innerHTML = tarjetasSuite({ id: 'sxBloque', nivel: 3 }) + `<p class="small muted sx-reset"><button type="button" class="btn btn-ghost btn-sm" data-sx-reset>${esc(T('Volver a mostrar las sugerencias que ocultaste'))}</button></p>`;
  }

  function iniciar() {
    if (G()) G().conectar({ alEnviar: enviar });
    pintarSuite();
    pintarDatos();
    document.addEventListener('sp:datos', pintarDatos);
    document.addEventListener('click', e => {
      const c = e.target.closest && e.target.closest('[data-sx-copiar], [data-sx-reset]');
      if (!c) return;
      if (c.hasAttribute('data-sx-reset')) { G() && G().mostrarTodas(); pintarDatos(); L() && L().toast(T('Las sugerencias vuelven a aparecer.'), { type: 'success' }); return; }
      const a = app(c.dataset.sxApp);
      if (!a) return;
      const texto = cita(a, c.dataset.sxCopiar);
      (navigator.clipboard ? navigator.clipboard.writeText(texto) : Promise.reject()).then(() => L() && L().toast(T('Cita copiada.'), { type: 'success' }))
        .catch(() => L() && L().toast(T('No se pudo copiar; selecciona el texto de la cita.'), { type: 'warning' }));
    });
  }
  SP.app = SP.app || {};
  SP.app.suite = { franjaMetodo, franjaFamilia, franjaDatos, tarjetasSuite, cita, enviar };
  SP.alArrancar(iniciar);
})();

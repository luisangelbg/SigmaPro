/* SigmaPro — arranque de la interfaz y navegación entre bloques.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   La barra de bloques es la común de la suite (labg-core.js); el Navegador LABG la
   lee y la presenta como barra lateral, índice de secciones y paleta Ctrl+K. Aquí
   solo se decide qué bloque se ve. Todo va protegido con window.LABG, porque la
   página de pruebas carga la interfaz sin la base común. */
(function () {
  'use strict';
  const T = SP.T;
  const L = () => window.LABG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const app = SP.app = {};

  /* ---------------- bloques ---------------- */
  const botones = () => $$('.stepper .step-btn[data-step]');
  const nombreBloque = n => { const b = $('.step-btn[data-step="' + n + '"]'); return b ? b.textContent.replace(/^\s*\d+\s*/, '').trim() : ''; };

  app.ir = function (n) {
    n = String(n);
    const panel = document.getElementById('panel-' + n);
    if (!panel) return;
    $$('.step-panel').forEach(p => p.classList.toggle('active', p === panel));
    if (L()) L().setCurrentStep(n);
    else botones().forEach(b => b.classList.toggle('active', b.dataset.step === n));
    app.actual = n;
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('sp:bloque', { detail: { bloque: Number(n) } }));
  };

  /* pie «Anterior / Siguiente» al final de cada bloque */
  function pies() {
    const orden = botones().map(b => b.dataset.step);
    orden.forEach((n, i) => {
      const panel = document.getElementById('panel-' + n);
      if (!panel || $('.step-footer', panel)) return;
      const pie = document.createElement('div');
      pie.className = 'step-footer';
      const ant = orden[i - 1], sig = orden[i + 1];
      if (ant) pie.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-ghost prev" data-nav="' + ant + '">← ' + T('Anterior') + '<small>' + nombreBloque(ant) + '</small></button>');
      if (sig) pie.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-secondary next" data-nav="' + sig + '">' + T('Siguiente') + ' →<small>' + nombreBloque(sig) + '</small></button>');
      panel.appendChild(pie);
    });
  }

  /* ---------------- portada: estado de los hitos ---------------- */
  const HITOS = [
    ['hecho', '1.0', 'Cimientos: registro de métodos, pruebas automáticas contra R y reporte de validación'],
    ['hecho', '1.1', 'Núcleo numérico: distribuciones, álgebra y modelo lineal con sumas de cuadrados I, II y III'],
    ['hecho', '1.2', 'Datos: hoja de cálculo, importación, tipos, faltantes y transformaciones'],
    ['hecho', '1.3', 'Descriptivos, frecuencias, proporciones e intervalos de confianza'],
    ['hecho', '1.4', 'Supuestos con semáforo y recomendaciones'],
    ['hecho', '1.5', 'Pruebas t y no paramétricas (con las distribuciones exactas de rangos)'],
    ['hecho', '1.6', 'ANOVA de diseños experimentales'],
    ['hecho', '1.7', 'Comparaciones de medias, letras, contrastes y medias ajustadas'],
    ['hecho', '1.8', 'ANCOVA y regresión con diagnóstico y selección de variables'],
    ['hecho', '1.9', 'Correlación y tablas de contingencia'],
    ['hecho', '1.10', 'Asistente de análisis, constructor visual de modelos y modelo lineal general'],
    ['hecho', '1.11', 'Reporte LABG, figuras de publicación, exportaciones y proyecto .labg'],
    ['hecho', '1.12', 'Uso sin conexión, rendimiento, accesibilidad y cierre de la Fase 1'],
    ['hecho', '2.0', 'Motor R en el navegador (webR) y modelo lineal mixto desde una fórmula'],
    ['hecho', '2.1', 'Modelos mixtos completos: medias marginales, comparaciones y diseños con efectos aleatorios'],
    ['hecho', '2.2', 'Medidas repetidas en el tiempo con estructuras de covarianza'],
    ['hecho', '2.3', 'Componentes de varianza por REML, heredabilidad, repetibilidad y BLUP de genotipos'],
    ['hecho', '2.4', 'Modelos lineales generalizados en el núcleo: binomial, Poisson, gamma, cuasi y binomial negativa'],
    ['hecho', '2.5', 'Modelos lineales generalizados mixtos en el motor R, con sobredispersión'],
    ['hecho', '2.6', 'Regresión no lineal y dosis-respuesta'],
    ['hecho', '2.7', 'Superficies de respuesta'],
    ['hecho', '2.8', 'Ensayos multiambiente y estabilidad'],
    ['hecho', '2.9', 'Asistente y constructor para la Fase 2'],
    ['hecho', '2.10', 'Cierre de la Fase 2: motor R sin conexión y rendimiento'],
    ['hecho', '3.0', 'Tamaño de muestra y potencia (sin necesidad de datos)'],
    ['hecho', '3.1', 'Muestreo: tamaño de muestra, aleatorio simple y estratificado'],
    ['actual', '3.2', 'Supervivencia'],
    ['', '3.3–3.5', 'Series de tiempo, multivariado (MANOVA, discriminante) y cierre de la Fase 3'],
  ];
  function hitos() {
    const ul = $('#hitos');
    if (!ul) return;
    const marca = { hecho: '✓', actual: '●', '': '○' };
    const estado = { hecho: T('terminado'), actual: T('el siguiente'), '': T('pendiente') };
    ul.innerHTML = HITOS.map(([e, id, txt]) =>
      '<li class="' + (e || 'pendiente') + '"><span class="marca" aria-hidden="true">' + marca[e] + '</span>' +
      '<span class="id">' + id + '</span><span>' + txt + ' <span class="sr-only">(' + estado[e] + ')</span></span></li>').join('');
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    const v = $('#spVersion'); if (v) v.textContent = 'v' + SP.VERSION;
    hitos();
    pies();

    if (L()) {
      L().theme.init('sigmapro.theme');
      L().shortcuts([
        { keys: ['R'], es: 'Constructor de modelo: la variable enfocada va a «Respuesta»', en: 'Model builder: focused variable to «Response»' },
        { keys: ['F'], es: 'Constructor de modelo: … a «Factores de tratamiento»', en: 'Model builder: … to «Treatment factors»' },
        { keys: ['B'], es: 'Constructor de modelo: … a «Bloques o repeticiones»', en: 'Model builder: … to «Blocks»' },
        { keys: ['C'], es: 'Constructor de modelo: … a «Covariables»', en: 'Model builder: … to «Covariates»' },
        { keys: ['P'], es: 'Constructor de modelo: … a «Parcela grande»', en: 'Model builder: … to «Main plot»' },
        { keys: ['Supr'], es: 'Constructor de modelo: quitar la variable enfocada de su zona', en: 'Model builder: remove the focused variable' },
      ]);
      L().bindStepKeys(app.ir);
      const s = $('#suiteLink');
      if (s && !$('.labg-iso', s)) s.insertAdjacentHTML('afterbegin', L().isotipo('labg-iso'));
    }
    const tb = $('#themeBtn'); if (tb) tb.addEventListener('click', () => L() && L().theme.toggle());
    const hb = $('#helpBtn'); if (hb) hb.addEventListener('click', () => L() && L().showShortcuts());

    botones().forEach(b => b.addEventListener('click', () => app.ir(b.dataset.step)));
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-ir], [data-nav]');
      if (!t) return;
      e.preventDefault();
      app.ir(t.dataset.ir || t.dataset.nav);
    });

    const m = /^#b(\d+)/.exec(location.hash);
    app.ir(m && document.getElementById('panel-' + m[1]) ? m[1] : '1');
    sinConexion();
    document.dispatchEvent(new CustomEvent('sp:listo'));
  }

  /* ---------------- sin conexión ----------------
     Servida por http o https, la app se instala y guarda en el navegador (sw.js) y trae su manifiesto. Con doble clic
     no hace falta (todo ya está en el equipo) y el navegador no admite ninguno de los dos. */
  function sinConexion() {
    if (!/^https?:$/.test(location.protocol)) return;
    const l = document.createElement('link');
    l.rel = 'manifest'; l.href = 'manifest.webmanifest';
    document.head.appendChild(l);
    if (!('serviceWorker' in navigator)) return;
    const registrar = () => navigator.serviceWorker.register('sw.js').then(r => { app.sinConexion = r; }).catch(() => { /* la app funciona igual, solo que necesita la red */ });
    if (document.readyState === 'complete') registrar(); else window.addEventListener('load', registrar);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();

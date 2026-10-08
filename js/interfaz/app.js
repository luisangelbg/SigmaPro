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
    ['hecho', '1.0', T('Cimientos: registro de métodos, pruebas automáticas contra R y reporte de validación')],
    ['hecho', '1.1', T('Núcleo numérico: distribuciones, álgebra y modelo lineal con sumas de cuadrados I, II y III')],
    ['hecho', '1.2', T('Datos: hoja de cálculo, importación, tipos, faltantes y transformaciones')],
    ['hecho', '1.3', T('Descriptivos, frecuencias, proporciones e intervalos de confianza')],
    ['hecho', '1.4', T('Supuestos con semáforo y recomendaciones')],
    ['hecho', '1.5', T('Pruebas t y no paramétricas (con las distribuciones exactas de rangos)')],
    ['hecho', '1.6', T('ANOVA de diseños experimentales')],
    ['hecho', '1.7', T('Comparaciones de medias, letras, contrastes y medias ajustadas')],
    ['hecho', '1.8', T('ANCOVA y regresión con diagnóstico y selección de variables')],
    ['hecho', '1.9', T('Correlación y tablas de contingencia')],
    ['hecho', '1.10', T('Asistente de análisis, constructor visual de modelos y modelo lineal general')],
    ['hecho', '1.11', T('Reporte LABG, figuras de publicación, exportaciones y proyecto .labg')],
    ['hecho', '1.12', T('Uso sin conexión, rendimiento, accesibilidad y cierre de la Fase 1')],
    ['hecho', '2.0', T('Motor R en el navegador (webR) y modelo lineal mixto desde una fórmula')],
    ['hecho', '2.1', T('Modelos mixtos completos: medias marginales, comparaciones y diseños con efectos aleatorios')],
    ['hecho', '2.2', T('Medidas repetidas en el tiempo con estructuras de covarianza')],
    ['hecho', '2.3', T('Componentes de varianza por REML, heredabilidad, repetibilidad y BLUP de genotipos')],
    ['hecho', '2.4', T('Modelos lineales generalizados en el núcleo: binomial, Poisson, gamma, cuasi y binomial negativa')],
    ['hecho', '2.5', T('Modelos lineales generalizados mixtos en el motor R, con sobredispersión')],
    ['hecho', '2.6', T('Regresión no lineal y dosis-respuesta')],
    ['hecho', '2.7', T('Superficies de respuesta')],
    ['hecho', '2.8', T('Ensayos multiambiente y estabilidad')],
    ['hecho', '2.9', T('Asistente y constructor para la Fase 2')],
    ['hecho', '2.10', T('Cierre de la Fase 2: motor R sin conexión y rendimiento')],
    ['hecho', '3.0', T('Tamaño de muestra y potencia (sin necesidad de datos)')],
    ['hecho', '3.1', T('Muestreo: tamaño de muestra, aleatorio simple y estratificado')],
    ['hecho', '3.2', T('Supervivencia: Kaplan-Meier, log-rank y Cox')],
    ['hecho', '3.3', T('Series de tiempo: autocorrelación, descomposición y tendencia')],
    ['hecho', '3.4', T('Multivariado: MANOVA y discriminante; CSV para PCAPro y ClusteringPro')],
    ['hecho', '3.5', T('Asistente para la Fase 3; cierre (0.3.0)')],
    ['hecho', '3.6', T('Estratos en log-rank y Cox; prueba M de Box')],
    ['hecho', '3.7', T('Modelos ARIMA: ajuste, diagnóstico y pronóstico')],
    ['hecho', '3.8', T('Cox y MANOVA desde el constructor de modelos (0.3.1)')],
    ['hecho', '3.9', T('Guardado automático del trabajo en el navegador (0.3.2)')],
    ['hecho', '4.0', T('Regresión no lineal: hormesis, Michaelis-Menten, dosis económica, perfiles, pesos y elección por AIC')],
    ['hecho', '4.1', T('Multiambiente: EM-AMMI, Huehn, Kang, Annicchiarico, WAAS, dos etapas y vistas del GGE')],
    ['hecho', '4.2', T('Superficies: generador de diseños, mezclas, deseabilidad y superficie en 3D')],
    ['hecho', '4.3', T('Generalizados: intervalos perfilados, Firth y más familias; GLMM con Gauss-Hermite y gamma')],
    ['hecho', '4.4', T('Asistente: parcelas divididas desde los datos; cierre de los cálculos (0.4.0)')],
    ['hecho', '4.5', T('Interfaz en inglés')],
    ['hecho', '5.0', T('Fundamentos de los 78 análisis, Suite LABG, pantalla de apertura, ilustraciones del catálogo y temas de las gráficas')],
    ['hecho', '5.11', T('La app abre rápido: primero la página y la barra de bloques, después el resto; el reporte de validación, al abrir su bloque')],
    ['hecho', '5.1', T('Cómo leer cada cuadro: medidores con las guías publicadas (p, tamaños del efecto, R², CV, VIF…) y la curva de referencia de cada prueba')],
    ['hecho', '5.2', T('Tarjetas de interpretación con los números del caso, la guía del CV por cultivo y variable, y los niveles Básico, Estándar y Experto')],
    ['hecho', '5.3', T('Semáforo con íconos y un botón que corre la alternativa: la transformación, la prueba por rangos, Welch o la binomial negativa')],
    ['hecho', '5.4', T('En pocas palabras: la conclusión sin símbolos; y «Cómo reportarlo» en APA 7, en español y en inglés, listo para copiar')],
    ['hecho', '5.5', T('Glosario de 146 términos (Ctrl+G) con «Ver en acción»: abre un ejemplo y señala dónde aparece cada uno')],
    ['actual', '5.7', T('Orientación: tres caminos en Inicio, historial de análisis, estados vacíos con la acción a la mano y el árbol de decisiones; siguen los recorridos, las ayudas, el modo presentación y los mensajes de error')],
    ['', '1.0', T('Publicación: revisión del nombre, repositorio y DOI (versión 1.0.0)')],
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
        { keys: ['Ctrl', 'G'], es: 'Glosario: buscar un término y verlo en acción', en: 'Glossary: look up a term and see it in action' },
        { keys: ['R'], es: 'Constructor de modelo: la variable enfocada va a «Respuesta»', en: 'Model builder: focused variable to «Response»' },
        { keys: ['E'], es: 'Constructor de modelo: … a «Evento (0/1)» (modelo de Cox)', en: 'Model builder: … to «Event (0/1)» (Cox model)' },
        { keys: ['M'], es: 'Constructor de modelo: … a «Más respuestas» (MANOVA)', en: 'Model builder: … to «More responses» (MANOVA)' },
        { keys: ['F'], es: 'Constructor de modelo: … a «Factores de tratamiento»', en: 'Model builder: … to «Treatment factors»' },
        { keys: ['B'], es: 'Constructor de modelo: … a «Bloques o repeticiones»', en: 'Model builder: … to «Blocks»' },
        { keys: ['A'], es: 'Constructor de modelo: … a «Efectos aleatorios»', en: 'Model builder: … to «Random effects»' },
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

  SP.alArrancar(iniciar);
})();

/* SigmaPro — secuencia de apertura («intro»).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Se carga como el primer script del <body>: arma la capa antes de que se pinte la interfaz y la app termina de cargar
   detrás. Lo que se mueve mientras tanto es CSS sobre transform y opacity (css/intro.css), que el navegador anima en el
   compositor aunque los scripts de la app ocupen el hilo principal. Sin dependencias, sin imágenes ni fuentes externas.
   Guion, tiempos y cómo ajustarla: docs/intro.md.

     SigmaIntro.play({ mode: 'full' | 'short' | 'loop' })   la completa (≈ 6.5 s), la corta (1.5 s) o la presentación en bucle
     SigmaIntro.skip()                                     termina ya (también Esc o «Saltar»)
     SigmaIntro.setEnabled(bool)                           mostrarla al abrir la app (se recuerda en el navegador)

   La completa y la corta terminan en una escena fija (las letras siguen flotando) con el botón «Start», que lleva a la
   app: el logo y el isotipo viajan a su lugar en el encabezado y el fondo se abre en iris. Esc la quita en cualquier
   momento. Al abrir: la completa la primera vez; después, la corta; nada si se desactivó, si ya se vio en esta pestaña
   (las recargas por cambio de idioma no la repiten), si la pestaña está oculta o en un navegador sin ventana (las pruebas
   automáticas). ?intro=full|short|loop|no en la dirección la fuerza. Con «reducir movimiento», la escena quieta (sin
   letras ni motas) con «Start» desde el principio. */
(function () {
  'use strict';

  /* ======================= constantes ajustables ======================= */
  const DURACION = 6.5;           // s · la secuencia completa hasta «Start»; todas sus fases se escalan con este valor
  const DURACION_CORTA = 1.5;     // s · la de las visitas siguientes (la misma secuencia, comprimida)
  const LETRAS = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'Σ', 'τ', 'φ', 'χ', 'ψ', 'ω',
    'Ω', 'Δ', 'Θ', 'Λ', 'Π', 'Φ', 'Ψ', 'Γ', 'Ξ', 'χ²'];
  const DENSIDAD = 1;             // 1 = cada letra una vez; 1.5 = la mitad se repite (más constelación)
  const TAMANO = [24, 220];       // px · el mayor se reduce en pantallas chicas
  const OPACIDAD = [0.04, 0.14];
  const BRILLAN = ['σ', 'μ', 'Σ', 'α', 'β', 'χ²'];   // se encienden en oro, nunca más de dos a la vez
  const MOTAS = 36;               // partículas de oro (≤ 40)
  const PARALAJE = 16;            // px que se mueve la letra más grande con el cursor o el giroscopio
  const LOGO = [120, 240];        // px · alto del logo de SigmaPro (28 % del lado menor de la pantalla, entre estos límites)
  const NOMBRE = [36, 76];        // px · «SigmaPro» (7.5 % del lado menor, entre estos límites)
  const CHISPAS = [[404, 116, 46], [124, 236, 34], [262, 384, 30], [182, 132, 24]];   // destellos sobre la σ: x, y, radio (en el SVG de 512)
  const COLORES = { fondo: '#050505', fondoBorde: '#0B0B0B', oro: '#C9A227', oroClaro: '#E6C65C', oroSombra: '#8C6D1A', blanco: '#F5F0E6' };
  const SERIF = "'Cormorant Garamond', 'Cormorant', 'Fraunces', Georgia, 'Palatino Linotype', 'Book Antiqua', 'Times New Roman', serif";
  const TEXTOS = {
    es: { saltar: 'Saltar', saltarAria: 'Saltar la presentación (Esc)', anuncio: 'Cargando SigmaPro', listo: 'SigmaPro está listo. Pulsa Start para entrar.',
      start: 'Start', startAria: 'Start: entrar a SigmaPro', salir: 'Pulsa cualquier tecla para volver' },
    en: { saltar: 'Skip', saltarAria: 'Skip the intro (Esc)', anuncio: 'Loading SigmaPro', listo: 'SigmaPro is ready. Press Start to enter.',
      start: 'Start', startAria: 'Start: enter SigmaPro', salir: 'Press any key to return' },
  };
  const CLAVE = 'sigmapro.intro';            // localStorage: { activa, vista }
  const CLAVE_SESION = 'sigmapro.intro.sesion';
  /* ===================================================================== */

  const html = document.documentElement;
  const tx = () => TEXTOS[/^en/i.test(html.lang) ? 'en' : 'es'];
  const quieto = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const leer = (k, s) => { try { return JSON.parse(s.getItem(k)); } catch (e) { return null; } };
  const guardar = (k, v, s) => { try { s.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } };
  const pref = () => Object.assign({ activa: true, vista: false }, leer(CLAVE, localStorage) || {});
  /* azar con semilla: la misma constelación en cada visita y al cambiar el tamaño de la ventana */
  const azarCon = semilla => () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* el logo de SigmaPro: el mismo SVG de iconos/sigmapro.svg (cuadro negro y σ dorada con serifas), con el trazo y el
     vertido encima */
  const SIGMA = '<text x="256" y="372" font-family="Georgia,\'Times New Roman\',serif" font-size="560" text-anchor="middle">&#963;</text>';
  const LOGO_ORIGINAL = '<rect width="512" height="512" rx="112" fill="#111111"/>' + SIGMA.replace('<text ', '<text fill="#D4A848" ');
  /* chispa de cuatro puntas de radio r, centrada en 0,0 */
  const chispa = r => { const k = (r * 0.14).toFixed(1); return `M0 ${-r}C${k} ${-k} ${k} ${-k} ${r} 0C${k} ${k} ${k} ${k} 0 ${r}C${-k} ${k} ${-k} ${k} ${-r} 0C${-k} ${-k} ${-k} ${-k} 0 ${-r}Z`; };
  const logoSVG = () => '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><defs>' +
    `<linearGradient id="siMetal" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${COLORES.oroSombra}"/><stop offset=".45" stop-color="${COLORES.oro}"/><stop offset=".72" stop-color="${COLORES.oroClaro}"/><stop offset="1" stop-color="${COLORES.oro}"/></linearGradient>` +
    `<linearGradient id="siVetaG"><stop offset="0" stop-color="${COLORES.blanco}" stop-opacity="0"/><stop offset=".5" stop-color="${COLORES.blanco}" stop-opacity=".8"/><stop offset="1" stop-color="${COLORES.blanco}" stop-opacity="0"/></linearGradient>` +
    '<mask id="siVierte" maskUnits="userSpaceOnUse" x="-60" y="-60" width="632" height="632"><g class="si-ola"><path fill="#fff" d="M-60 20 Q 6 -6 72 20 T 204 20 T 336 20 T 468 20 T 600 20 V 760 H -60 Z"/></g></mask>' +
    '<clipPath id="siSigma">' + SIGMA + '</clipPath></defs>' +
    `<radialGradient id="siChispaG"><stop offset="0" stop-color="${COLORES.blanco}"/><stop offset=".45" stop-color="${COLORES.oroClaro}"/><stop offset="1" stop-color="${COLORES.oro}" stop-opacity="0"/></radialGradient>` +
    '<g mask="url(#siVierte)">' + LOGO_ORIGINAL + '<g clip-path="url(#siSigma)"><rect class="si-veta" x="0" y="-80" width="150" height="680" fill="url(#siVetaG)"/></g></g>' +
    '<g class="si-trazo"><rect width="512" height="512" rx="112" pathLength="1"/>' + SIGMA + '</g>' +
    /* destellos: chispas de cuatro puntas sobre la σ, de una en una */
    CHISPAS.map(([x, y, r], i) => `<g transform="translate(${x} ${y})"><path class="si-chispa" style="--ci:${i}" fill="url(#siChispaG)" d="${chispa(r)}"/></g>`).join('') + '</svg>';

  let raiz = null, modo = null, relojes = [], quitarEscuchas = null, pedidoCuadro = 0;

  /* ---------------- la constelación ---------------- */
  function medidas() {
    const W = innerWidth, H = innerHeight, m = Math.min(W, H);
    const alto = Math.round(Math.max(LOGO[0], Math.min(LOGO[1], m * 0.28)));
    const nombre = Math.round(Math.max(NOMBRE[0], Math.min(NOMBRE[1], m * 0.075)));
    const pila = alto + 30 + nombre * 1.1 + 56 + 82;  // logo, «SigmaPro», LABG y el botón «Start»
    const ancho = Math.max(alto, nombre * 9);         // «SigmaPro» en versalitas con su espaciado (≈ 9 em)
    return { W, H, alto, nombre, ancho, sube: Math.round(pila / 2 - alto / 2), pila };
  }
  function colocar(campo, M) {
    const azar = azarCon(20261004);
    const lista = [];
    const n = Math.round(LETRAS.length * DENSIDAD);
    for (let i = 0; i < n; i++) lista.push(LETRAS[i % LETRAS.length]);
    const maxT = TAMANO[1] * Math.max(0.42, Math.min(1, Math.min(M.W, M.H) / 900)), minT = TAMANO[0] * (M.W < 520 ? 0.8 : 1);
    const zx = M.ancho / 2 + 28, zy = M.pila / 2 + 22;   // la zona libre del centro: el logo, el nombre, LABG y «Start»
    const puestos = [];
    lista.forEach((letra, i) => {
      let p = null;
      const anchoL = letra.length > 1 ? 1.5 : 1;          // χ² ocupa más que una letra
      for (let k = 0; k < 90 && !p; k++) {
        const s = minT * Math.pow(maxT / minT, Math.pow(azar(), 1.7) * (k > 40 ? 0.6 : 1));
        const x = azar() * M.W, y = azar() * M.H;
        if (Math.abs(x - M.W / 2) < zx + s * 0.45 * anchoL && Math.abs(y - M.H / 2) < zy + s * 0.45) continue;
        if (puestos.some(q => Math.hypot(q.x - x, q.y - y) < (q.s * q.a + s * anchoL) * 0.5)) continue;
        p = { x, y, s, a: anchoL };
      }
      if (!p) { p = { x: -999, y: -999, s: minT, a: 1 }; }
      puestos.push(p);
      const o = OPACIDAD[0] + (OPACIDAD[1] - OPACIDAD[0]) * (p.s > 130 ? azar() * 0.45 : 0.3 + azar() * 0.7);
      const b = p.s > 160 ? 'blur(2.6px)' : p.s > 110 ? 'blur(1.5px)' : p.s > 70 ? 'blur(.6px)' : 'none';
      let el = campo.children[i];
      if (!el) {
        el = document.createElement('span'); el.className = 'si-l';
        const bi = i < LETRAS.length ? BRILLAN.indexOf(letra) : -1;
        el.innerHTML = '<span class="si-l-par"><span class="si-l-in"></span>' + (bi >= 0 ? '<span class="si-l-brillo"></span>' : '') + '</span>';
        el.querySelectorAll('.si-l-in, .si-l-brillo').forEach(t => { t.textContent = letra; });
        el.style.setProperty('--d', (0.6 + azar() * 0.18 + i * 0.004).toFixed(3) + 's');
        el.style.setProperty('--dd', (14 + azar() * 12).toFixed(1) + 's');
        el.style.setProperty('--dd0', (-azar() * 20).toFixed(1) + 's');
        el.style.setProperty('--dx', ((azar() - 0.5) * 30).toFixed(1) + 'px');
        el.style.setProperty('--dy', ((azar() - 0.5) * 24).toFixed(1) + 'px');
        /* los brillos, escalonados: en la completa uno cada 0.45 s desde 1.9 s (duran 0.9 s); en bucle, uno cada 7/6 s */
        if (bi >= 0) { el.style.setProperty('--bd', (1.9 + bi * 0.45).toFixed(2) + 's'); el.style.setProperty('--bdl', (bi * 7 / 6).toFixed(2) + 's'); }
        campo.appendChild(el);
      }
      el.style.setProperty('--x', p.x.toFixed(1) + 'px');
      el.style.setProperty('--y', p.y.toFixed(1) + 'px');
      el.style.setProperty('--s', p.s.toFixed(1) + 'px');
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--b', b);
      el.style.setProperty('--k', (p.s / maxT).toFixed(3));
      el.style.setProperty('--fx', (M.W / 2 - p.x).toFixed(1) + 'px');
      el.style.setProperty('--fy', (M.H / 2 - M.sube - p.y).toFixed(1) + 'px');
    });
  }
  function motas(capa, M) {
    const azar = azarCon(31337);
    let s = '';
    for (let i = 0; i < Math.min(40, MOTAS); i++) {
      s += `<i class="si-m" style="--x:${(azar() * 100).toFixed(2)}%;--y:${(azar() * 100).toFixed(2)}%;--t:${(1 + azar()).toFixed(2)}px;--o:${(0.25 + azar() * 0.5).toFixed(2)};` +
        `--dd:${(7 + azar() * 8).toFixed(1)}s;--d:${(0.7 + azar() * 1.6).toFixed(2)}s;--dx:${((azar() - 0.5) * 40).toFixed(0)}px;--dy:${(-30 - azar() * 70).toFixed(0)}px"></i>`;
    }
    capa.insertAdjacentHTML('beforeend', s);
  }
  /* grano fílmico: ruido de 192 × 192 dibujado una vez y desplazado lentamente (sin parpadeo) */
  function grano(el) {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 192;
      const g = c.getContext('2d'), img = g.createImageData(192, 192), d = img.data, azar = azarCon(7);
      for (let i = 0; i < d.length; i += 4) { const v = azar() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(img, 0, 0);
      el.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
    } catch (e) { /* sin lienzo: sin grano */ }
  }

  /* ---------------- armar y reproducir ---------------- */
  function construir(m, fijo) {
    const t = tx(), M = medidas();
    const r = document.createElement('div');
    r.className = 'si lfs-own'; r.id = 'sigmaIntro'; r.dataset.modo = m;   // lfs-own: interfaz propia, el Estudio de figuras no la toma por una figura
    r.setAttribute('data-lnav-skip', '');
    const v = { '--si-fondo': COLORES.fondo, '--si-fondo-borde': COLORES.fondoBorde, '--si-oro': COLORES.oro, '--si-oro-claro': COLORES.oroClaro,
      '--si-oro-sombra': COLORES.oroSombra, '--si-blanco': COLORES.blanco, '--si-serif': SERIF, '--u': (DURACION / 4.5).toFixed(4), '--alto-logo': M.alto + 'px', '--sube': M.sube + 'px', '--tam-nombre': M.nombre + 'px' };
    for (const k in v) r.style.setProperty(k, v[k]);
    const nombre = 'SigmaPro'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
    r.innerHTML = '<div class="si-capa" aria-hidden="true"><div class="si-fondo"></div><div class="si-grano"></div><div class="si-campo"></div>' +
      '<div class="si-centro"><div class="si-punto"></div><div class="si-pila"><div class="si-logo"><div class="si-aura"></div>' + logoSVG() + '<div class="si-destello"></div><div class="si-onda"></div></div>' +
      `<div class="si-nombre">${nombre}</div><div class="si-labg"><span class="si-iso"></span><span class="si-by">by LABG</span></div></div></div>` +
      (m === 'loop' || fijo ? `<div class="si-salir">${t.salir}</div>` : '') + '</div>' +
      `<p class="si-anuncio" role="status">${t.anuncio}</p>` +
      (m === 'loop' || fijo ? '' : `<button type="button" class="si-saltar" aria-label="${t.saltarAria}">${t.saltar}</button>` +
        `<div class="si-acciones"><button type="button" class="si-start" aria-label="${t.startAria}" disabled><span>${t.start}</span></button></div>`);
    if (fijo) r.dataset.fijo = '1';
    if (m === 'short') r.style.setProperty('--u', (DURACION_CORTA / 4.5).toFixed(4));
    if (m !== 'quieto') { colocar(r.querySelector('.si-campo'), M); motas(r.querySelector('.si-campo'), M); }
    if (m !== 'quieto') grano(r.querySelector('.si-grano'));
    return r;
  }
  /* el isotipo LABG original (labg-core.js, con su brillo), en cuanto existe */
  function ponerIsotipo() {
    const c = raiz && raiz.querySelector('.si-iso');
    if (c && !c.firstChild && window.LABG && typeof window.LABG.isotipo === 'function') c.innerHTML = window.LABG.isotipo('si-iso-svg');
  }
  function despues(seg, fn) { relojes.push(setTimeout(fn, seg * 1000)); }
  function listo() { return document.readyState !== 'loading' && !!(window.SP && window.SP.app); }

  function play(o) {
    const pedido = (o && o.mode) || 'full';
    if (raiz) quitar(true);
    modo = quieto() ? 'quieto' : pedido;
    raiz = construir(modo, quieto() && pedido === 'loop');
    (document.body || html).insertBefore(raiz, document.body ? document.body.firstChild : null);
    html.classList.add('si-activa');
    ponerIsotipo();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ponerIsotipo, { once: true });
    escuchar();
    const u = modo === 'short' ? DURACION_CORTA / 4.5 : DURACION / 4.5;
    if (modo === 'full' || modo === 'short') { despues(3.0 * u, ponerIsotipo); esperarStart(3.9 * u); }
    else if (modo === 'quieto' && !raiz.dataset.fijo) esperarStart(0.3);
    try { document.dispatchEvent(new CustomEvent('sigmaintro:inicio', { detail: { modo } })); } catch (e) { /* nada */ }
  }
  /* al final de la secuencia la escena se queda fija con el botón «Start», que lleva a la app; se muestra cuando la
     app ya está lista detrás: al entrar nunca se ve una pantalla en blanco */
  function esperarStart(seg) {
    const t0 = performance.now();
    despues(seg, function intento() {
      if (!raiz) return;
      if (listo() || performance.now() - t0 > 9000) mostrarStart();
      else relojes.push(setTimeout(intento, 120));
    });
  }
  function mostrarStart() {
    if (!raiz || raiz.classList.contains('si-espera')) return;
    ponerIsotipo();
    acomodarStart();
    raiz.classList.add('si-espera');
    const b = raiz.querySelector('.si-start'), a = raiz.querySelector('.si-anuncio');
    if (a) a.textContent = tx().listo;
    if (b) { b.disabled = false; despues(0.35, () => { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }); }
    try { document.dispatchEvent(new CustomEvent('sigmaintro:listo', { detail: { modo } })); } catch (e) { /* nada */ }
  }
  /* el botón, debajo de «by LABG» */
  function acomodarStart() {
    const l = raiz && raiz.querySelector('.si-labg');
    if (l && l.offsetParent !== null) raiz.style.setProperty('--start-top', Math.round(l.getBoundingClientRect().bottom + 30) + 'px');
  }
  function cerrar() {
    if (!raiz || raiz.classList.contains('si-cierre')) return;
    ponerIsotipo();
    if (modo === 'quieto') { skip(); return; }
    raiz.style.setProperty('--u', '1');
    raiz.classList.add('si-cierre');
    volar(raiz.querySelector('.si-logo'), document.querySelector('.topbar .brand-mark'));
    volar(raiz.querySelector('.si-iso'), document.querySelector('#suiteLink svg'));
    despues(0.72, () => quitar());
  }
  /* FLIP: del centro al lugar real del logo en el encabezado */
  function volar(el, destino) {
    if (!el) return;
    const a = el.getBoundingClientRect(), b = destino ? destino.getBoundingClientRect() : null;
    if (!b || !b.width || !a.width || getComputedStyle(el.parentNode).opacity === '0') { el.style.opacity = '0'; return; }
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(b.width / a.width).toFixed(4)})`;
    el.style.opacity = '0';
  }
  function skip() {
    if (!raiz) return;
    if (raiz.classList.contains('si-fuera')) return;
    raiz.classList.add('si-fuera');
    const r = raiz;
    setTimeout(() => { if (raiz === r) quitar(); }, 230);
  }
  function quitar(sinEvento) {
    relojes.forEach(clearTimeout); relojes = [];
    if (quitarEscuchas) quitarEscuchas();
    if (raiz && raiz.parentNode) raiz.parentNode.removeChild(raiz);
    raiz = null;
    html.classList.remove('si-activa');
    if (!sinEvento) { try { document.dispatchEvent(new CustomEvent('sigmaintro:fin', { detail: { modo } })); } catch (e) { /* nada */ } }
  }

  /* ---------------- teclado, clic, paralaje y tamaño de la ventana ---------------- */
  function escuchar() {
    let nx = 0, ny = 0, cambio = 0;
    const pintar = () => { pedidoCuadro = 0; if (raiz) { raiz.style.setProperty('--px', (-nx * PARALAJE).toFixed(2) + 'px'); raiz.style.setProperty('--py', (-ny * PARALAJE).toFixed(2) + 'px'); } };
    const pedir = () => { if (!pedidoCuadro) pedidoCuadro = requestAnimationFrame(pintar); };
    const mover = e => { nx = e.clientX / innerWidth - 0.5; ny = e.clientY / innerHeight - 0.5; pedir(); };
    const girar = e => { if (e.gamma == null) return; nx = Math.max(-0.5, Math.min(0.5, e.gamma / 60)); ny = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60)); pedir(); };
    const tecla = e => { if (modo === 'loop' || (raiz && raiz.dataset.fijo)) { e.preventDefault(); skip(); } else if (e.key === 'Escape') { e.preventDefault(); skip(); } };
    /* en la presentación, un clic o un toque en cualquier lugar regresa; en la intro solo «Start» o «Saltar» */
    const toque = e => {
      const t = e.target;
      if (!t || !t.closest || !t.closest('.si')) return;
      if (t.closest('.si-start')) { e.preventDefault(); cerrar(); }
      else if (t.closest('.si-saltar') || modo === 'loop' || (raiz && raiz.dataset.fijo)) skip();
    };
    const tamano = () => {
      clearTimeout(cambio);
      cambio = setTimeout(() => {
        if (!raiz) return;
        const M = medidas();
        raiz.style.setProperty('--alto-logo', M.alto + 'px'); raiz.style.setProperty('--sube', M.sube + 'px'); raiz.style.setProperty('--tam-nombre', M.nombre + 'px');
        requestAnimationFrame(acomodarStart);
        const campo = raiz.querySelector('.si-campo');
        if (campo && campo.querySelector('.si-l')) {
          const motasEl = [...campo.querySelectorAll('.si-m')];
          motasEl.forEach(x => x.remove());
          colocar(campo, M);
          motasEl.forEach(x => campo.appendChild(x));
        }
      }, 120);
    };
    addEventListener('pointermove', mover, { passive: true });
    addEventListener('deviceorientation', girar, { passive: true });
    addEventListener('keydown', tecla, true);
    /* Enter o espacio sobre «Start» (el teclado no produce pointerdown) */
    const clic = e => { if (e.target && e.target.closest && e.target.closest('.si-start')) { e.preventDefault(); cerrar(); } };
    addEventListener('pointerdown', toque, true);
    addEventListener('click', clic, true);
    addEventListener('resize', tamano, { passive: true });
    quitarEscuchas = () => {
      removeEventListener('pointermove', mover); removeEventListener('deviceorientation', girar); removeEventListener('keydown', tecla, true);
      removeEventListener('pointerdown', toque, true); removeEventListener('click', clic, true); removeEventListener('resize', tamano); clearTimeout(cambio);
      if (pedidoCuadro) cancelAnimationFrame(pedidoCuadro); pedidoCuadro = 0; quitarEscuchas = null;
    };
  }

  /* ---------------- preferencia y controles de la página («Acerca de SigmaPro») ---------------- */
  function setEnabled(si) {
    guardar(CLAVE, Object.assign(pref(), { activa: !!si }), localStorage);
    const c = document.getElementById('introActiva');
    if (c) c.checked = !!si;
  }
  document.addEventListener('click', e => {
    const b = e.target && e.target.closest && e.target.closest('[data-intro]');
    if (b) { e.preventDefault(); play({ mode: b.getAttribute('data-intro') }); }
  });
  document.addEventListener('change', e => { if (e.target && e.target.id === 'introActiva') setEnabled(e.target.checked); });
  const sincronizar = () => { const c = document.getElementById('introActiva'); if (c) c.checked = pref().activa !== false; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sincronizar, { once: true }); else sincronizar();

  window.SigmaIntro = { play, skip, setEnabled, version: '1.0.0' };

  /* ---------------- al abrir la app ---------------- */
  (function alAbrir() {
    let q = null;
    try { q = new URLSearchParams(location.search).get('intro'); } catch (e) { /* nada */ }
    let m = null;
    if (q === 'no' || q === '0') m = null;
    else if (q === 'full' || q === 'short' || q === 'loop') m = q;
    else if (/Headless/i.test(navigator.userAgent) || navigator.webdriver) m = null;
    else if (document.visibilityState === 'hidden') m = null;
    else if (leer(CLAVE_SESION, sessionStorage)) m = null;
    else { const p = pref(); m = p.activa === false ? null : p.vista ? 'short' : 'full'; }
    if (!m) return;
    if (!q) { guardar(CLAVE_SESION, true, sessionStorage); guardar(CLAVE, Object.assign(pref(), { vista: true }), localStorage); }
    play({ mode: m });
  })();
})();

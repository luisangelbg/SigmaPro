/* SigmaPro — la medición de accesibilidad que corre en la página (tests/accesibilidad/auditar.mjs la arma con la
   preparación de cada escenario y la pasa al auditor de la suite). Copyright (C) 2026  Luis Ángel Barrera-Guzmán ·
   GPL-3.0-or-later (ver LICENSE). Devuelve null mientras espera y luego el JSON con: barra común, teclado (Tab, Alt+→,
   Alt+←, «?»), nombres accesibles, imágenes sin alt, ids repetidos, campos sin etiqueta, contraste AA de todo el texto
   visible en claro y en oscuro, y desborde lateral. Termina con el paréntesis que cierra la expresión armada. */
(async () => {
  if (document.readyState !== 'complete') return null;
  if (!window.__auditT0) { window.__auditT0 = Date.now(); return null; }
  if (Date.now() - window.__auditT0 < 1500) return null;
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const R = {};
  // sin transiciones: medimos el estado final
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}';
  document.head.appendChild(st);

  // --- barra común ---
  R.labg = !!window.LABG;
  R.lang = document.documentElement.lang;
  R.suite = !!q('.suite-link');
  R.langSeg = qa('.lang-seg button').map(b => b.textContent.trim()).join('|');
  R.themeBtn = !!q('#themeBtn');
  R.help = !!q('#helpBtn');
  R.stepperInHeader = !!q('header .stepper, .topbar .stepper, header nav.stepper');
  R.steps = qa('.stepper .step-btn').length;
  R.current = (q('.step-btn[aria-current]') || {}).dataset?.step ?? null;
  R.footers = qa('.step-footer').length;
  R.skip = !!q('.skip-link');

  // --- teclado ---
  const focusables = qa('a[href], button, input, select, textarea, [tabindex]').filter(e => !e.disabled && e.tabIndex >= 0 && e.getClientRects().length);
  R.firstTab = focusables[0] ? (focusables[0].className || focusables[0].tagName).toString().slice(0, 30) : null;
  R.positiveTabindex = qa('[tabindex]').filter(e => e.tabIndex > 0).length;
  const sb = q('.stepper .step-btn[aria-current]') || q('.stepper .step-btn');
  if (sb) {
    (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    sb.focus();
    const cs = getComputedStyle(sb);
    R.focusRing = sb.matches(':focus-visible') ? (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none') || cs.boxShadow !== 'none' : 'sin focus-visible';
    const before = R.current;
    (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    R.altRight = (q('.step-btn[aria-current]') || {}).dataset?.step ?? null;
    R.altMoves = R.altRight !== before;
    (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    sb.blur();
  }
  (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  const dlg = qa('dialog').find(d => d.open);
  R.shortcutsDialog = !!dlg && /atajos|shortcuts/i.test(dlg.textContent);
  if (dlg) dlg.close();

  // --- nombres accesibles ---
  const vis = n => { const r = n.getBoundingClientRect(); const c = getComputedStyle(n); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const name = n => (n.getAttribute('aria-label') || n.getAttribute('title') || n.textContent || (n.querySelector('img[alt]') || {}).alt || '').trim();
  R.noName = qa('button, a[href]').filter(b => vis(b) && !name(b)).map(b => b.outerHTML.slice(0, 70)).slice(0, 5);
  R.noAlt = qa('img').filter(i => !i.hasAttribute('alt')).length;
  const ids = {}; qa('[id]').forEach(n => ids[n.id] = (ids[n.id] || 0) + 1);
  R.dupIds = Object.keys(ids).filter(k => ids[k] > 1).slice(0, 5);
  R.noLabel = qa('input, select, textarea').filter(i => i.type !== 'hidden' && !i.hidden && i.getAttribute('aria-hidden') !== 'true' && vis(i) && !(i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.closest('label') || (i.id && q('label[for="' + CSS.escape(i.id) + '"]')) || i.title)).map(i => (i.id || i.name || i.className || i.tagName).toString().slice(0, 30)).slice(0, 5);

  // --- contraste de todo el texto visible, claro y oscuro ---
  /* rgb()/rgba() y color(srgb …), que es como el navegador entrega un color-mix() */
  const parse = c => { let m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c); if (m) return [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]]; m = /color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.]+))?\)/.exec(c); return m ? [m[1] * 255, m[2] * 255, m[3] * 255, m[4] == null ? 1 : +m[4]] : null; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (t, b) => { const a = t[3]; return [t[0] * a + b[0] * (1 - a), t[1] * a + b[1] * (1 - a), t[2] * a + b[2] * (1 - a), 1]; };
  const bgOf = (node, dark) => { const L = []; for (let n = node; n && n.nodeType === 1; n = n.parentElement) { const c = getComputedStyle(n); if (c.backgroundImage && c.backgroundImage !== 'none') return null; const p = parse(c.backgroundColor); if (p && p[3] > 0) { L.push(p); if (p[3] >= 1) break; } } let bg = dark ? [14, 18, 28, 1] : [255, 255, 255, 1]; for (let i = L.length - 1; i >= 0; i--) bg = blend(L[i], bg); return bg; };
  const audit = dark => {
    const bad = []; let n = 0;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let t = w.nextNode(); t; t = w.nextNode()) {
      const p = t.parentElement;
      if (!p || seen.has(p) || !t.textContent.trim() || p.closest('svg, .sr-only, [aria-hidden="true"], script, style, [hidden], dialog:not([open])') || !vis(p)) continue;
      seen.add(p);
      let op = 1; for (let e = p; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity;
      if (op < 0.99 || p.closest(':disabled, [aria-disabled="true"]')) continue;
      const c = getComputedStyle(p), fg = parse(c.color), bg = bgOf(p, dark);
      if (!fg || !bg) continue;
      const size = parseFloat(c.fontSize), large = size >= 24 || (+c.fontWeight >= 700 && size >= 18.66);
      const l1 = lum(blend(fg, bg)), l2 = lum(bg), r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      n++;
      const hx = a => '#' + a.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
      if (r < (large ? 3 : 4.5)) bad.push(r.toFixed(2) + ' «' + t.textContent.trim().slice(0, 28) + '» <' + p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + (p.className ? '.' + p.className.toString().trim().replace(/\s+/g, '.') : '') + '> en ' + ((p.parentElement || {}).className || '').toString().slice(0, 25) + ' color ' + hx(blend(fg, bg)) + ' fondo ' + hx(bg));
    }
    return { checked: n, bad: bad.slice(0, 40), nBad: bad.length };
  };
  const html = document.documentElement, before = html.getAttribute('data-theme');
  html.setAttribute('data-theme', 'light'); await new Promise(r => setTimeout(r, 50));
  R.contrastLight = audit(false);
  html.setAttribute('data-theme', 'dark'); await new Promise(r => setTimeout(r, 50));
  R.contrastDark = audit(true);
  if (before) html.setAttribute('data-theme', before); else html.removeAttribute('data-theme');

  // --- desborde ---
  // en modo celular la vista crece con el contenido: se compara con el ancho del dispositivo
  R.width = matchMedia('(pointer: coarse)').matches ? screen.width : innerWidth; R.scrollWidth = Math.max(document.documentElement.scrollWidth, innerWidth);
  R.headerH = Math.round((q('header') || q('.topbar') || document.body).getBoundingClientRect().height);
  /* errores de la preparación y de la página (los registra la envoltura de auditar.mjs) */
  R.errorPrep = window.__errorPrep || '';
  R.erroresPagina = (window.__errores || []).slice(0, 5);
  return JSON.stringify(R);
})()
)

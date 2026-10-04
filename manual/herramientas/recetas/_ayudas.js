/* Ayudas que captura.mjs define antes de cada receta (no es una receta). Todas en la página de la app.
     W(ms)                     espera
     $(sel), $$(sel)           el primer nodo y la lista de nodos
     irA(nodo, margen)         desplaza la página para que el nodo quede arriba, con un margen
     caja([nodos], margen)     deja en window.__recorte el rectángulo que cubre los nodos (lo usa captura.mjs)
     ejemplo(texto)            carga el ejemplo del menú «Ejemplos» cuyo nombre contiene el texto
     usar(metodo, e, op)       abre el método en el catálogo del bloque Análisis y espera su resultado
     esperar()                 espera a que el resultado del bloque Análisis termine de calcularse
     limpio()                  quita los avisos flotantes y el foco (para que no salgan en la captura) */
var W = ms => new Promise(r => setTimeout(r, ms));
var $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
var arriba = n => n.getBoundingClientRect().top + window.scrollY;
var irA = (n, m = 90) => window.scrollTo({ top: Math.max(0, arriba(n) - m), behavior: 'instant' });
var caja = (nodos, p = 8) => {
  const rs = [].concat(nodos).filter(Boolean).map(n => n.getBoundingClientRect());
  const x = Math.max(0, Math.min(...rs.map(r => r.left)) - p), y = Math.max(0, Math.min(...rs.map(r => r.top)) - p);
  window.__recorte = [x, y, Math.max(...rs.map(r => r.right)) + p - x, Math.max(...rs.map(r => r.bottom)) + p - y].map(Math.round).join(',');
  return window.__recorte;
};
var limpio = () => { document.querySelectorAll('.toast-stack .toast').forEach(t => t.remove()); document.querySelectorAll('.lnav-fbtn').forEach(b => { b.style.visibility = 'hidden'; }); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); };
var ejemplo = async texto => {
  $('#datEjemplos').click(); await W(200);
  const b = $$('.sp-menu-item').find(x => x.textContent.includes(texto));
  if (!b) throw new Error('No hay un ejemplo «' + texto + '»');
  b.click(); await W(600); limpio();
};
var esperar = async () => {
  for (let k = 0; k < 600; k++) {
    await W(200);
    const r = $('#anaResultado');
    if (r && !r.classList.contains('calculando') && (r.querySelector('.exp-cabeza h3') || r.querySelector('.msg-error'))) break;
  }
  await W(400); limpio();
};
var usar = async (metodo, e, op) => {
  SP.app.ir(4); await W(200);
  SP.app.analisis.ponerModo('catalogo'); await W(200);
  SP.app.analisis.usar(metodo, e || {}, op || {});
  await esperar();
};
/* marcas([[n, nodo, dx, dy], …]): números sobre la captura, en % del recorte (llamar después de caja()); captura.mjs
   imprime los <span class="marca"> para pegarlos en la figura */
var marcas = pares => {
  const r = window.__recorte ? String(window.__recorte).split(',').map(Number) : [0, 0, innerWidth, innerHeight];
  window.__marcas = pares.filter(p => p[1]).map(([n, nodo, dx = 0, dy = 0]) => {
    const b = nodo.getBoundingClientRect(), x = b.left + b.width / 2 + dx, y = b.top + b.height / 2 + dy;
    return { n, x: +((x - r[0]) / r[2] * 100).toFixed(1), y: +((y - r[1]) / r[3] * 100).toFixed(1) };
  });
  return window.__marcas;
};
/* conTexto(re, sel): el elemento visible más pequeño (de los que coinciden con sel) cuyo texto cumple re */
var conTexto = (re, sel = '*') => $$(sel).filter(n => re.test((n.textContent || '').trim()) && n.getBoundingClientRect().width > 0)
  .sort((a, b) => a.textContent.length - b.textContent.length)[0] || null;
/* dialogo(): el diálogo abierto de la app (dialog.sp-dialogo) */
var dialogo = () => $$('dialog[open]').pop() || null;

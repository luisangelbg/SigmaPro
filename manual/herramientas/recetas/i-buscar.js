/* Introducción: la búsqueda (Ctrl K) con un texto escrito */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(7); await W(400); limpio();
  const k = $('.lnav-k'); k.click(); await W(500);
  const inp = document.activeElement && document.activeElement.tagName === 'INPUT' ? document.activeElement : $$('input').find(i => i.getBoundingClientRect().width > 200 && /buscar|search/i.test(i.placeholder || i.getAttribute('aria-label') || ''));
  if (inp) { inp.value = 'proyecto'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
  await W(500);
  const d = [...document.querySelectorAll('[role="dialog"], dialog[open]')].find(n => n.getBoundingClientRect().width > 300);
  return d ? caja([d], 0) : null;
})()

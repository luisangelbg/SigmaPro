/* Bloque 2: el menú ⋮ de una columna numérica */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(400); window.scrollTo(0, 0); limpio();
  const b = $$('#datRejilla .rej-menu')[2]; b.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true })); await W(400);
  return caja([$$('#datRejilla .rej-menu')[2].closest('.rej-col') || b, $('.sp-menu')], 10);
})()

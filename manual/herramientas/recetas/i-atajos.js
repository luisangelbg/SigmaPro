/* Introducción: el diálogo de atajos de teclado (botón ?), desde el bloque Datos */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(400); limpio();
  $('#helpBtn').click(); await W(600);
  const d = [...document.querySelectorAll('dialog[open], [role="dialog"]')].find(n => n.getBoundingClientRect().width > 0);
  return d ? caja([d], 0) : null;
})()

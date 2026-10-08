/* vista: 1400x900 */
/* I.6: el glosario abierto (Ctrl+G) en «Interacción»: el buscador, la lista y la ficha con «Ver en acción» */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(300);
  await SP.glosarioUI.datos();
  SP.glosarioUI.abrir('interaccion'); await W(500); limpio();
  const d = $('#spGlosario');
  d.querySelector('#spGlLista [aria-current="true"]').scrollIntoView({ block: 'center' });
  document.activeElement.blur(); await W(200);
  return caja([d], 0);
})()

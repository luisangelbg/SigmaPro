/* vista: 1400x900 */
/* I.6: un paso del recorrido de Análisis (En pocas palabras, resaltado) con el ejemplo del maíz */
(async () => {
  await ejemplo('Maíz: híbridos');
  await usar('dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {});
  await SP.recorridos.empezar(4); await W(400);
  const i = SP.recorridos.estado.pasos.findIndex(p => /palabras|nutshell/.test(p.titulo));
  for (let k = 0; k < i; k++) { document.querySelector('.sp-tour [data-tour="sig"]').click(); await W(250); }
  await W(500);
  document.activeElement && document.activeElement.blur();
  window.__recorte = [0, 0, window.innerWidth, window.innerHeight].join(',');
})()

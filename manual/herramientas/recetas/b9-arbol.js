/* vista: 1500x1000 */
/* 9.x: el árbol de decisiones de Fundamentos con el camino Comparar tratamientos › Una medida continua › En bloques completos */
(async () => {
  SP.arbolUI.camino(['comparar', 'continua', 'dbca']);
  SP.app.fundamentos.arbolEn(null); await W(700);
  const r = $('#funRaiz');
  irA(r, 110); await W(300); limpio();
  document.activeElement && document.activeElement.blur();
  /* hasta el pie de la hoja: las columnas de la izquierda siguen abajo */
  return caja([r.querySelector('.fun-barra'), r.querySelector('.arb-barra'), r.querySelector('.arb-hoja')], 8);
})()

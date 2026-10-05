/* vista: 1400x1500 */
/* 9.2: el catálogo de Fundamentos: el buscador, los filtros y las dos primeras familias */
(async () => {
  SP.app.fundamentos.estado.vista = 'catalogo'; SP.app.ir(9); SP.app.fundamentos.pintar(); await W(800); window.scrollTo(0, 0); limpio();
  return caja([$('#panel-9 .panel-title'), $$('#funRaiz .fun-familia')[1]], 8);
})()

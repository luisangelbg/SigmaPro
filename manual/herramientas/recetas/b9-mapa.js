/* vista: 1400x1300 */
/* 9.3: el mapa de métodos: tipo de respuesta (filas) por estructura de los grupos y factores (columnas) */
(async () => {
  SP.app.ir(9); await W(300); $('[data-fun-vista=mapa]').click(); await W(600); limpio();
  return caja([$('#funRaiz .fun-mapa')], 8);
})()

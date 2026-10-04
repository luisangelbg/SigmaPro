/* vista: 1400x1300 */
/* 8.2: el bloque Validación: el resumen, los filtros y los primeros casos, con los detalles del primero abiertos */
(async () => {
  SP.app.ir(8); await W(800); window.scrollTo(0, 0); await W(300);
  const det = $('#valTabla button.det'); det.click(); await W(300); limpio();
  const fila = $('#valTabla tr.detalle:not([hidden])');
  const cajas = $$('#valContenido .card');
  return caja([$('#panel-8 .panel-title'), cajas[0], fila], 8);
})()

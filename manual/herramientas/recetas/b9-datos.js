/* vista: 1400x1700 */
/* 9.5: «Datos necesarios» de la ficha de bloques completos al azar: columnas, tamaño, formato largo y ancho, plantillas */
(async () => {
  await SP.app.fundamentos.cargar('dbca'); SP.app.fundamentos.abrir('dbca'); await W(900); limpio();
  const d = $("#fun-s-datos"); irA(d, 190); await W(400);
  return caja([d], 8);
})()

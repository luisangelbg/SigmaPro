/* vista: 1400x1000 */
/* Bloque 2: la hoja con el ejemplo del maíz, sus partes marcadas */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(400); window.scrollTo(0, 0); limpio();
  await W(800); const barra = $('#panel-2 .dat-barra'), trabajo = $('#datTrabajo');
  caja([barra, trabajo], 8);
  const grupos = $$('#panel-2 .dat-barra .btn-row');
  marcas([[1, grupos[0], 0, -24], [2, grupos[1], 0, -24], [3, grupos[2], 0, -24], [4, $('#datLista'), 70, -40], [5, $('#datDetalle'), 90, 0],
    [6, $('#datRejilla .rej-menu'), 0, 22], [7, $('#datEstado'), 120, 0]]);
})()

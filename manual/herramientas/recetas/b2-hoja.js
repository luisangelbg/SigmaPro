/* vista: 1400x1000 */
/* Bloque 2: la hoja con el ejemplo del maíz, sus partes marcadas */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(400); window.scrollTo(0, 0); limpio();
  await W(800); const barra = $('#panel-2 .dat-barra'), trabajo = $('#datTrabajo');
  caja([barra, trabajo], 8);
  const grupos = $$('#panel-2 .dat-barra .btn-row');
  /* cada número junto a lo que señala, sin tapar botones ni textos */
  const der = n => n.getBoundingClientRect().width / 2 + 18, bajo = n => n.getBoundingClientRect().height / 2 + 30;
  const menus = $$('#datRejilla .rej-menu'), estado = document.createRange(); estado.selectNodeContents($('#datEstado'));
  marcas([[1, grupos[0], der(grupos[0]), 0], [2, grupos[1], 0, bajo(grupos[1])], [3, grupos[2], der(grupos[2]), 0], [4, $('#datLista'), 70, -40],
    [5, $('#datDetalle'), 90, 0], [6, menus[menus.length - 1], 44, 0], [7, estado, der(estado) + 10, -12]]);
})()

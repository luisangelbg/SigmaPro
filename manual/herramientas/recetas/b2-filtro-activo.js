/* Bloque 2: el aviso del filtro activo sobre la rejilla */
(async () => {
  await ejemplo('Maíz: híbridos');
  SP.app.ir(2); await W(300);
  const e = SP.datosUI.estado(); e.filtro = { expresion: 'bloque != "4" & dosis > 0', filas: [] }; SP.datosUI.cambio(); await W(400); limpio();
  return caja([$('#datFiltroAviso'), $('#datEstado')], 8);
})()

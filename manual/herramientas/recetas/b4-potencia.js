/* vista: 1400x1100 */
/* 4.22: potencia sin datos: el formulario de la prueba t y la curva de potencia según el tamaño de muestra */
(async () => {
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('catalogo'); await W(200);
  $('#anaSinDatos').click(); await W(500);
  SP.app.analisis.usar('potencia-medias', {}, { calcular: 'n', diferencia: 0.5, de: 0.4 });
  await esperar();
  const r = $('#anaResultado'), f = r.querySelector('.ana-graficas figure'); irA($('#anaOpciones'), 110); await W(300); limpio();
  return caja([$('#anaOpciones'), r.querySelector('.exp-cabeza'), r.querySelector('.exp-conclusion'), f], 8);
})()

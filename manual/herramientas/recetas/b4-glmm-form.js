/* vista: 1400x1500 motor */
/* 4.17: el formulario del modelo mixto generalizado en bloques aleatorios (trips del aguacate, Poisson): de la familia a las pruebas de los efectos fijos */
(async () => {
  await ejemplo('Aguacate: trips');
  try { localStorage.setItem('sigmapro.motorR.usado', '1'); } catch (e) { /* sin almacenamiento */ }
  SP.app.analisis.motorAceptado = true;
  await usar('glmm-bloques', { respuesta: 'trips', tratamientos: ['tratamiento'], bloque: 'bloque' }, { familia: 'poisson', sobredispersion: 'auto' });
  /* el campo de cada opción: su <label> (familia, enlace, aproximación, prueba de los aleatorios, efecto por observación, tipo de prueba) */
  const f = $('#anaOpciones'), de = c => { const x = f.querySelector('[data-campo="' + c + '"]'); return x ? x.closest('label') : null; };
  const a = de('familia'), b = de('tipo');
  irA(a, 110); await W(300); limpio();
  return caja([a, b], 8);
})()

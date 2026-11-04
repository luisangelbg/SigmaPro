/* vista: 1400x900 */
/* 6.4: el Estudio de figuras con la figura de las medias de los híbridos */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  SP.app.ir(6); await W(1200); limpio();
  const t = $$('#figGaleria .fig-tarjeta')[1];
  irA(t, 110); await W(300);
  t.querySelector('[data-fig="estudio"]').click(); await W(2000);
  /* el aviso con que el estudio anuncia la figura se va solo; se espera a que se vaya */
  for (let k = 0; k < 40 && conTexto(/^(Estudio de figuras abierto|Figure studio open)/); k++) await W(250);
  limpio();
  return null;
})()

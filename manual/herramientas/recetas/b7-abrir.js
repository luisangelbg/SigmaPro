/* vista: 1400x1000 */
/* 7.5: el diálogo al abrir un proyecto .labg con otro trabajo en la app: las huellas coinciden */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte, dis = { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' };
  R.titulo = 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  R.agregar({ metodo: 'comparaciones-medias', e: Object.assign({ comparar: ['hibrido'] }, dis), op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'polinomios', e: Object.assign({ comparar: ['dosis'] }, dis), op: {} });
  const p = await SP.app.exportar.construir.proyecto();
  SP.app.ir(7); await W(500);
  await SP.app.exportar.abrirProyecto(new File([p.datos], p.nombre));
  await W(800); limpio();
  return caja([dialogo()], 4);
})()

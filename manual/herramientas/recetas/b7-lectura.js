/* vista: 1000x1300 */
/* 7.2: el panel «Lectura de los indicadores» del análisis de bloques del maíz, en la página HTML exportada */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte;
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  SP.app.ir(5); await W(800);
  const h = await SP.app.exportar.construir.html();
  document.open(); document.write(h.datos); document.close();
  await W(1500);
  /* lo que agregan los módulos de la app que siguen vivos en la página (el botón ✎ del editor) no está en el archivo */
  document.querySelectorAll('div.lectura > :not(p):not(svg), button').forEach(x => x.remove());
  const l = document.querySelector('div.lectura');
  l.scrollIntoView({ block: 'start' }); await W(300);
  return caja([l], 10);
})()

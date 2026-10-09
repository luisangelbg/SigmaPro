/* vista: 1000x1300 */
/* 7.3: la hoja de trabajo del maíz (página HTML): el ejercicio 1, con su planteamiento, el cuadro para completar y las
   primeras preguntas */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte;
  R.titulo = 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  SP.app.ir(5); await W(800);
  const h = await SP.app.exportar.construir.hojaHtml();
  document.open(); document.write(h.datos); document.close();
  await W(1500);
  document.querySelectorAll('button').forEach(x => x.remove());
  const e1 = [...document.querySelectorAll('h2')].find(x => /^Ejercicio 1\./.test(x.textContent));
  const q3 = [...document.querySelectorAll('div.pregunta')][2];
  e1.scrollIntoView({ block: 'start' }); await W(300);
  return caja([e1, q3], 10);
})()

/* vista: 1000x1300 */
/* 7.2: el apéndice metodológico en la página HTML exportada: el principio del anexo y el método de bloques al azar */
(async () => {
  await ejemplo('Maíz: híbridos');
  const R = SP.app.reporte;
  R.titulo = SP.IDIOMA === 'en' ? 'Maize trial: hybrids and nitrogen rates' : 'Ensayo de maíz: híbridos y dosis de nitrógeno'; R.autor = SP.IDIOMA === 'en' ? 'Author name' : 'Nombre del autor';
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: { tipoSC: 3 } });
  SP.app.ir(5); await W(800);
  const h = await SP.app.exportar.construir.html();
  document.open(); document.write(h.datos); document.close();
  await W(1500);
  document.querySelectorAll('button').forEach(x => x.remove());
  const a = [...document.querySelectorAll('h2')].find(x => /Apéndice metodológico|Methods appendix/.test(x.textContent));
  /* hasta antes de «Para profundizar» del método */
  const fin = [...document.querySelectorAll('p')].find(p => p.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING && /^(Supuestos|Assumptions):/.test(p.textContent));
  a.scrollIntoView({ block: 'start' }); await W(300);
  return caja([a, fin], 10);
})()

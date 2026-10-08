/* Pruebas del historial de análisis (hito 5.7, js/interfaz/historial.js). Volver a abrir un análisis, con la app
   completa: tests/orientacion.mjs. */
SPT.describir('Historial de análisis', () => {
  const CLAVE = 'sigmapro.historial';
  const conHistorialVacio = async fn => {
    let antes = null;
    try { antes = localStorage.getItem(CLAVE); } catch (e) { /* sin almacenamiento */ }
    SP.historial.borrar();
    try { await fn(); } finally {
      try { if (antes === null) localStorage.removeItem(CLAVE); else localStorage.setItem(CLAVE, antes); } catch (e) { /* nada */ }
    }
  };
  SPT.caso('Un mismo método con los mismos datos ocupa un renglón; el último cálculo va primero', () => conHistorialVacio(() => {
    SP.historial.anotar({ bloque: 4, metodo: 'dbca', e: { respuesta: 'rend' }, op: {}, origen: 'Ejemplo: A' });
    SP.historial.anotar({ bloque: 4, metodo: 'dca', e: { respuesta: 'y' }, op: {}, origen: 'Ejemplo: A' });
    SP.historial.anotar({ bloque: 4, metodo: 'dbca', e: { respuesta: 'rend' }, op: { alfa: 0.01 }, origen: 'Ejemplo: A' });
    SP.historial.anotar({ bloque: 4, metodo: 'dbca', e: { respuesta: 'rend' }, op: {}, origen: 'archivo.csv' });
    SP.historial.anotar({ bloque: 3, metodo: 'descriptivos', e: { variables: ['rend'] }, op: {}, origen: 'Ejemplo: A' });
    SP.historial.anotar({ bloque: 4, metodo: 'no-existe', e: {}, op: {}, origen: 'x' });
    const l = SP.historial.lista();
    SPT.igualJSON(l.map(x => x.metodo + '@' + x.origen), ['descriptivos@Ejemplo: A', 'dbca@archivo.csv', 'dbca@Ejemplo: A', 'dca@Ejemplo: A']);
    SPT.igual(l[2].op.alfa, 0.01, 'se queda el pedido del último cálculo');
    SPT.igual(l[0].bloque, 3);
    SPT.afirmar(l.every(x => typeof x.t === 'number' && Array.isArray(x.columnas)), 'hora y columnas');
    SPT.afirmar(JSON.parse(localStorage.getItem(CLAVE)).length === 4, 'guardado en el navegador');
  }), { navegador: true });
  SPT.caso('A lo más 30 renglones; borrar los quita todos', () => conHistorialVacio(() => {
    const ids = Object.keys(SP.metodos).slice(0, 35);
    ids.forEach((m, i) => SP.historial.anotar({ bloque: 4, metodo: m, e: {}, op: {}, origen: 'o' + i }));
    SPT.igual(SP.historial.lista().length, 30);
    SPT.igual(SP.historial.lista()[0].metodo, ids[34], 'el más reciente primero');
    SP.historial.borrar();
    SPT.igual(SP.historial.lista().length, 0);
  }), { navegador: true });
  SPT.caso('El menú: sin análisis, un renglón que lo dice; con análisis, uno por cálculo y «Borrar el historial»', () => conHistorialVacio(() => {
    const b = document.createElement('button'); document.body.appendChild(b);
    try {
      let m = SP.historial.menu(b) || document.querySelector('.sp-menu');
      SPT.afirmar(m && m.querySelector('.sp-menu-item:disabled'), 'vacío');
      m.remove();
      SP.historial.anotar({ bloque: 4, metodo: 'dbca', e: {}, op: {}, origen: 'Ejemplo: A' });
      SP.historial.menu(b); m = document.querySelector('.sp-menu');
      const items = [...m.querySelectorAll('.sp-menu-item')].map(x => x.textContent);
      SPT.afirmar(items.length === 2 && /Bloques completos al azar/.test(items[0]) && /Borrar el historial/.test(items[1]), items.join(' | '));
      m.remove();
    } finally { b.remove(); }
  }), { navegador: true });
});

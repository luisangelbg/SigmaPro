/* Pruebas de las ayudas emergentes y de los recorridos (hito 5.7): js/interfaz/ayudas.js y js/interfaz/recorridos.js.
   Con el teclado, el puntero y los recorridos completos en la app: tests/orientacion.mjs. */
SPT.describir('Ayudas emergentes', () => {
  SPT.caso('El texto: el de data-ayuda, la definición de un término o la del estadístico de una columna', () => {
    const b = document.createElement('button'); b.dataset.ayuda = 'Glosario (Ctrl+G)';
    SPT.igual(SP.ayudas.texto(b), SP.T('Glosario (Ctrl+G)'));
    const s = document.createElement('select'); s.dataset.ayudaTermino = 'alfa';
    SPT.afirmar(/^Nivel de significancia: /.test(SP.ayudas.texto(s)), SP.ayudas.texto(s));
    const c = document.createElement('div');
    c.innerHTML = SP.cuadros.html({ id: 'anova', titulo: 'x', columnas: [{ clave: 'fuente', titulo: 'Fuente', formato: 'texto' }, { clave: 'F', titulo: 'F', formato: 'f2' }], filas: [{ fuente: 'a', F: 2 }] }, { lectura: false });
    SPT.afirmar(/^F de Fisher: /.test(SP.ayudas.texto(c.querySelector('th[data-clave="F"]'))), 'la F');
    SPT.igual(SP.ayudas.texto(c.querySelector('th[data-clave="fuente"]')), '', 'una columna sin estadístico no tiene ayuda');
    SPT.igual(SP.ayudas.texto(document.createElement('span')), '');
  }, { navegador: true });
});

SPT.describir('Recorridos por bloque', () => {
  SPT.caso('Los diez bloques tienen su recorrido, cada paso con su parte, su título y su texto', () => {
    for (let k = 1; k <= 10; k++) {
      const p = SP.recorridos.pasos(k);
      SPT.afirmar(p.length >= 1, 'bloque ' + k);
      for (const x of p) SPT.afirmar(x.sel && x.titulo && x.texto && x.texto.length > 20, 'bloque ' + k + ': ' + x.titulo);
    }
    SPT.igual(SP.recorridos.pasos(11).length, 0);
  }, { navegador: true });
});

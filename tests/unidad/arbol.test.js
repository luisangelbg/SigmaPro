/* Pruebas del árbol de decisiones (hito 5.7): js/nucleo/arbol.js en node y su dibujo (js/interfaz/arbol.js) en el
   navegador. Recorrerlo en la app (desde Inicio y desde el asistente): tests/orientacion.mjs. */
SPT.describir('Árbol de decisiones · el contenido', () => {
  SPT.caso('Cada análisis de SigmaPro está en alguna hoja, y cada análisis de una hoja existe', () => {
    const en = new Set(SP.arbol.metodos());
    const faltan = Object.keys(SP.metodos).filter(m => !en.has(m)), sobran = [...en].filter(m => !SP.metodos[m]);
    SPT.igualJSON(faltan, [], 'análisis sin hoja');
    SPT.igualJSON(sobran, [], 'hojas con análisis que no existen');
  });
  SPT.caso('Cada pregunta tiene texto y al menos dos opciones, con ids distintos; cada opción, su texto', () => {
    (function rec(n, donde) {
      SPT.afirmar(n.pregunta && n.opciones && n.opciones.length >= 2, 'pregunta ' + donde);
      const ids = n.opciones.map(o => o.id);
      SPT.igual(new Set(ids).size, ids.length, 'ids repetidos en ' + donde);
      for (const o of n.opciones) {
        SPT.afirmar(o.texto, 'texto de ' + donde + '/' + o.id);
        if (o.hoja) SPT.afirmar(o.hoja.length && o.hoja.every(([m, c]) => m && c), 'hoja ' + o.id);
        else rec(o.sig, donde + '/' + o.id);
      }
    })(SP.arbol.raiz(), 'inicio');
  });
  SPT.caso('Los caminos: al nodo que llevan y a los métodos', () => {
    SPT.igualJSON(SP.arbol.caminos('dbca'), [['comparar', 'continua', 'dbca']]);
    SPT.igual(SP.arbol.caminos('glmm-bloques').length, 2, 'conteos y proporciones');
    SPT.igual(SP.arbol.nodo(['comparar', 'continua']).id, 'diseno');
    SPT.igual(SP.arbol.nodo(['comparar', 'continua', 'dbca']).hoja[0][0], 'dbca');
    SPT.igual(SP.arbol.nodo(['comparar', 'no-existe']), null);
    SPT.igual(SP.arbol.nodo([]).id, 'inicio');
  });
});

SPT.describir('Árbol de decisiones · el dibujo', () => {
  SPT.caso('Una columna por pregunta del camino y la hoja con sus análisis, cada uno con su ficha', () => {
    const antes = SP.arbolUI.estado.camino.slice();
    try {
      SP.arbolUI.camino([]);
      const c = document.createElement('div');
      c.innerHTML = SP.arbolUI.html();
      SPT.igual(c.querySelectorAll('.arb-col').length, 1, 'sin camino, solo la primera pregunta');
      SP.arbolUI.camino(['comparar', 'continua', 'dbca']);
      c.innerHTML = SP.arbolUI.html();
      SPT.igual(c.querySelectorAll('.arb-col').length, 4, 'tres preguntas y la hoja');
      SPT.igual(c.querySelectorAll('.arb-op[aria-pressed="true"]').length, 3, 'las tres opciones elegidas');
      SPT.igualJSON([...c.querySelectorAll('.arb-met')].map(x => x.dataset.arbMet), ['dbca', 'mixto-bloques']);
      SPT.afirmar(c.querySelector('.arb-met [data-ficha="dbca"]') && c.querySelector('.arb-met [data-arb-abrir="dbca"]'), 'ficha y abrir');
      SPT.afirmar(/Comparar tratamientos/.test(c.querySelector('.arb-migas').textContent), 'el camino en palabras');
      SP.arbolUI.camino(['comparar', 'no-existe']);
      c.innerHTML = SP.arbolUI.html();
      SPT.igual(c.querySelectorAll('.arb-col').length, 2, 'un camino roto se corta donde deja de existir');
      SPT.afirmar(SP.arbolUI.ir('kappa') && SP.arbolUI.estado.marcado === 'kappa', 'ir a un método');
      c.innerHTML = SP.arbolUI.html();
      SPT.afirmar(c.querySelector('.arb-met.arb-marca[data-arb-met="kappa"]'), 'el método señalado');
    } finally { SP.arbolUI.camino(antes); }
  }, { navegador: true });
  SPT.caso('Al elegir una opción se abre la pregunta que sigue, con el foco en ella', async () => {
    const antes = SP.arbolUI.estado.camino.slice();
    const caja = document.createElement('div');
    document.body.appendChild(caja);
    try {
      SP.arbolUI.camino([]);
      caja.innerHTML = SP.arbolUI.html();
      caja.querySelector('[data-arb-op="relacion"]').click();
      await new Promise(r => setTimeout(r, 50));
      SPT.igual(caja.querySelectorAll('.arb-col').length, 2);
      SPT.afirmar(document.activeElement && document.activeElement.classList.contains('arb-q') && /explicar o predecir/.test(document.activeElement.textContent), 'el foco en la pregunta nueva');
      SPT.igualJSON(SP.arbolUI.estado.camino, ['relacion']);
    } finally { caja.remove(); SP.arbolUI.camino(antes); }
  }, { navegador: true });
});

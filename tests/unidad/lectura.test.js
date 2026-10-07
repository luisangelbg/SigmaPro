/* Pruebas de «Cómo leer este cuadro» (hito 5.1): las densidades de LABGuide contra las del núcleo, lo que la lectura
   saca de un cuadro (por columna y por fila) y lo que dibujan el medidor y la curva. Corren en el navegador (necesitan
   js/labg-guide.js, js/interfaz/cuadros.js y js/interfaz/lectura.js). */
SPT.describir('Lectura de los cuadros · LABGuide', () => {
  const G = () => window.LABGuide;
  SPT.caso('Las densidades de LABGuide son las del núcleo (t, F, χ² y normal)', () => {
    const D = SP.dist;
    for (const [x, gl] of [[1.3, 7], [-2.2, 3.5], [0, 30]]) SPT.cerca(G().densidad('t', x, gl), D.dt(x, gl), 1e-12 * Math.max(1, D.dt(x, gl)));
    for (const [x, a, b] of [[2.1, 3, 20], [0.4, 1, 12], [5, 6, 33.7]]) SPT.cerca(G().densidad('F', x, a, b), D.df(x, a, b), 1e-12);
    for (const [x, k] of [[4.2, 5], [0.3, 1], [12, 9]]) SPT.cerca(G().densidad('chi2', x, k), D.dchisq(x, k), 1e-12);
    SPT.cerca(G().densidad('z', 1.5), Math.exp(-1.125) / Math.sqrt(2 * Math.PI), 1e-15);
    SPT.cerca(G().densidad('t', 1.5, Infinity), G().densidad('z', 1.5), 1e-15, 't con infinitos gl es la normal');
  }, { navegador: true });
  SPT.caso('Medidor: una marca es un role="meter" con su zona; varias, una imagen descrita y la lista', () => {
    const e = SP.guias.escala('cv');
    const uno = G().medidor(Object.assign({}, e, { titulo: 'CV', marcas: [{ valor: 25, etiqueta: '' }] }));
    SPT.afirmar(/role="meter"/.test(uno) && /aria-valuenow="25"/.test(uno) && /aria-valuetext="25[^"]*alto/.test(uno), uno.slice(0, 300));
    const p = SP.guias.escala('p');
    const varios = G().medidor(Object.assign({}, p, { titulo: 'p', marcas: [{ valor: 0.0004, etiqueta: 'A' }, { valor: 0.2, etiqueta: 'B' }] }));
    SPT.afirmar(/role="img"/.test(varios) && /A: [^<]*muy fuerte/.test(varios) && /B: [^<]*insuficiente/.test(varios), 'lista de marcas');
  }, { navegador: true });
  SPT.caso('Curva: el valor fuera de la gráfica se anuncia con una flecha; la descripción da el crítico y el p', () => {
    const h = G().curva({ dist: 'F', gl1: 2, gl2: 33, observado: 60.6, criticos: [3.28], colas: 'derecha', p: 1e-10, alfa: 0.05 });
    SPT.afirmar(/60\.6\d* →/.test(h) && /fuera de la gráfica/.test(h) && /3\.28/.test(h) && /p &lt; 0\.001/.test(h), h.slice(0, 400));
    const t = G().curva({ dist: 't', gl1: 10, observado: -1.2, criticos: [-2.23, 2.23], colas: 'dos', p: 0.258 });
    SPT.afirmar(/class="lg-area"/.test(t) && /p = 0\.258/.test(t), 'dos colas sombreadas');
  }, { navegador: true });
});

SPT.describir('Lectura de los cuadros · qué se lee en cada cuadro', () => {
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  SPT.caso('ANOVA: el p de cada término con su escala y la F con los gl del error de la fila siguiente', () => {
    const c = { titulo: 'ANOVA', columnas: [col('fuente', 'Fuente', 'texto'), col('gl', 'gl', 'entero'), col('F', 'F', 'forma2'), col('p', 'p', 'pvalor')],
      filas: [{ fuente: 'A', gl: 2, F: 5.1, p: 0.025 }, { fuente: 'Error a', gl: 4 }, { fuente: 'B', gl: 3, F: 9.2, p: 0.0008 }, { fuente: 'Error b', gl: 12 }, { fuente: 'Total', gl: 21, _total: true }] };
    const L = SP.lectura.items(c, null, { alfa: 0.05 });
    SPT.igual(L.escalas.length, 1); SPT.igual(L.escalas[0].ficha, 'p'); SPT.igualJSON(L.escalas[0].marcas.map(m => m.etiqueta), ['A', 'B']);
    SPT.igualJSON(L.curvas.map(v => [v.dist, v.gl1, v.gl2]), [['F', 2, 4], ['F', 3, 12]], 'cada término contra el error de su estrato');
  }, { navegador: true });
  SPT.caso('«Medida · Valor»: el estadístico se reconoce por el nombre de la fila', () => {
    const c = { titulo: 'Resumen', columnas: [col('medida', 'Medida', 'texto'), col('valor', 'Valor', 'escala')],
      filas: [{ medida: 'Media general', valor: 5.9 }, { medida: 'Coeficiente de variación, %', valor: 3.6 }, { medida: 'R²', valor: 0.97 }] };
    const L = SP.lectura.items(c, null, {});
    SPT.igualJSON(L.escalas.map(x => [x.ficha, x.fila]), [['cv', true], ['r2', true]]);
    SPT.afirmar(/details class="lg-lectura"/.test(SP.cuadros.html(c, { numero: 1 })), 'el cuadro lleva su desplegable');
    SPT.afirmar(!/lg-lectura/.test(SP.cuadros.html(c, { numero: 1, lectura: false })), 'lectura: false lo quita');
  }, { navegador: true });
  SPT.caso('Un cuadro sin estadísticos con guía no lleva desplegable', () => {
    const c = { titulo: 'Medias', columnas: [col('nivel', 'Nivel', 'texto'), col('media', 'Media', 'forma')], filas: [{ nivel: 'a', media: 2 }] };
    SPT.igual(SP.lectura.html(c, {}), '');
  }, { navegador: true });
});

/* Pruebas de «Cómo leer este cuadro» (hito 5.1): las densidades de LABGuide contra las del núcleo, lo que la lectura
   saca de un cuadro (por columna y por fila) y lo que dibujan el medidor y la curva. Corren en el navegador (necesitan
   js/labg-guide.js, js/interfaz/cuadros.js y js/interfaz/lectura.js). Hito 5.2: tarjetas, guía del CV y nivel de detalle
   (js/interfaz/detalle.js). */
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

SPT.describir('Lectura de los cuadros · tarjetas y guía del CV (hito 5.2)', () => {
  const col = (clave, titulo, formato) => ({ clave, titulo, formato });
  SPT.caso('El medidor lleva su tarjeta fuera del role="meter"; la curva, su frase', () => {
    const e = SP.guias.escala('cv');
    const d = document.createElement('div');
    d.innerHTML = window.LABGuide.medidor(Object.assign({}, e, { titulo: 'CV', marcas: [{ valor: 3.57, etiqueta: '' }], tarjeta: { textos: ['uno', 'dos'], que: { titulo: 'Qué es', texto: 'tres' } } }));
    SPT.igualJSON([...d.querySelectorAll('.lg-tarjeta p')].map(p => p.textContent), ['uno', 'dos', 'tres']);
    SPT.afirmar(!!d.querySelector('[role="meter"]') && !d.querySelector('[role="meter"] details, [role="meter"] .lg-tarjeta'), 'nada desplegable dentro del medidor');
    const c = window.LABGuide.curva({ dist: 'F', gl1: 2, gl2: 33, observado: 1.5, criticos: [3.28], colas: 'derecha', p: 0.24, alfa: 0.05, lectura: 'Antes del valor crítico 3.28' });
    SPT.afirmar(/class="lg-curva-lee">Antes del valor crítico 3\.28</.test(c), c.slice(-200));
  }, { navegador: true });
  SPT.caso('Al abrir el desplegable, cada medidor trae su tarjeta con los números del cuadro; el del CV, su guía', () => {
    const c = { titulo: 'Resumen', columnas: [col('medida', 'Medida', 'texto'), col('valor', 'Valor', 'escala')],
      filas: [{ medida: 'Media general', valor: 5.938 }, { medida: 'Coeficiente de variación, %', valor: 3.5734 }, { medida: 'R²', valor: 0.9692 }] };
    const raiz = document.createElement('div');
    raiz.innerHTML = SP.cuadros.html(c, { numero: 2 });
    document.body.appendChild(raiz);
    const antes = SP.lectura.guiaCV();
    try {
      SP.lectura.ponerGuiaCV(null);
      const det = raiz.querySelector('details.lg-lectura');
      SPT.afirmar(/Lectura · Cuadro 2\. Resumen/.test(det.querySelector('summary').textContent), 'el resumen nombra el cuadro (para Básico)');
      det.dataset.lgPintado = '1';
      SP.lectura.pintar(det);
      const t = () => [...det.querySelectorAll('.lg-tarjeta > p')].map(p => p.textContent).join(' ');
      SPT.afirmar(/error, 0\.212, es el 3\.57\s% de la media general, 5\.94/.test(t()), t());
      SPT.afirmar(/explica el 96\.9\s%/.test(t()), 'R²');
      SPT.afirmar(!!det.querySelector('.lg-item[data-ficha="cv"] select[data-cvguia="id"]'), 'formulario de la guía del CV');
      SP.lectura.ponerGuiaCV({ id: 'maiz-rendimiento' });
      SPT.afirmar(/guía de maíz para rendimiento de grano/.test(t()) && /Fritsche-Neto et al\. \(2012\)/.test(det.querySelector('.lg-item[data-ficha="cv"] .lg-fuente').textContent), 'se vuelve a dibujar con la guía nueva');
      SP.lectura.ponerGuiaCV({ id: 'propia', cultivo: 'Frijol', variable: 'rendimiento', limites: [2, 3, 4] });
      SPT.afirmar(/tus límites \(Frijol, rendimiento\), el CV es alto/.test(t()), t());
    } finally { SP.lectura.ponerGuiaCV(antes); raiz.remove(); }
  }, { navegador: true });
});

SPT.describir('Nivel de detalle · Básico, Estándar y Experto (hito 5.2)', () => {
  SPT.caso('Básico abre las lecturas; Experto, las notas técnicas y el código; Estándar deja todo como siempre', () => {
    const antes = SP.detalle.actual();
    const raiz = document.createElement('div');
    raiz.innerHTML = SP.detalle.selector() + '<details class="lg-lectura" data-lg-pintado="1"><summary>a</summary><div class="lg-cuerpo"></div></details>' +
      '<details class="exp-tecnico"><summary>b</summary></details><details class="exp-codigo"><summary>c</summary></details>';
    document.body.appendChild(raiz);
    const [lec, tec, cod] = raiz.querySelectorAll('details');
    const pulsado = () => raiz.querySelector('[aria-pressed="true"]').dataset.detallePoner;
    try {
      SP.detalle.poner('basico');
      SPT.igual(document.documentElement.getAttribute('data-detalle'), 'basico'); SPT.igual(pulsado(), 'basico');
      SPT.afirmar(lec.open && !tec.open && !cod.open, 'Básico: la lectura abierta');
      SP.detalle.poner('experto');
      SPT.afirmar(!lec.open && tec.open && cod.open, 'Experto: notas técnicas y código abiertos; la lectura vuelve a cerrarse');
      SP.detalle.poner('estandar');
      SPT.igual(document.documentElement.hasAttribute('data-detalle'), false); SPT.igual(pulsado(), 'estandar');
      SPT.afirmar(!lec.open && !tec.open && !cod.open, 'Estándar: todo cerrado, como siempre');
      raiz.querySelector('[data-detalle-poner="basico"]').click();
      SPT.igual(SP.detalle.actual(), 'basico', 'el botón cambia el nivel');
    } finally { SP.detalle.poner(antes); raiz.remove(); }
  }, { navegador: true });
  SPT.caso('Las notas técnicas: los detalles del reporte y el lugar del modelo de su ficha', () => {
    const h = SP.detalle.tecnico({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido'], bloque: 'bloque' }, opciones: { alfa: 0.05 }, r: { n: 48 }, ms: 3.2, tabla: { n: 48 } });
    const d = document.createElement('div'); d.innerHTML = h;
    const kv = Object.fromEntries([...d.querySelectorAll('dt')].map(dt => [dt.textContent, dt.nextElementSibling.textContent]));
    SPT.igual(kv['Entradas'], 'respuesta = rend; tratamientos = hibrido; bloque = bloque'); SPT.igual(kv['Filas usadas'], '48'); SPT.igual(kv['Calculado en'], '3 ms');
    SPT.afirmar(!!d.querySelector('details.exp-tecnico .exp-modelo[data-modelo="dbca"]'), 'el modelo se carga de la ficha dbca');
  }, { navegador: true });
});

/* Pruebas de hoja.js, expresiones.js, transformar.js, estructura.js y reformar.js. */
SPT.describir('Datos · hoja editable', () => {
  const nueva = () => SP.hoja.crear({
    columnas: { bloque: [1, 1, 2, 2], trat: ['A', 'B', 'A', 'B'], rend: [4.2, 5.1, 'NA', 5.6] },
  });

  SPT.caso('infiere tipos y muestra los valores', () => {
    const h = nueva();
    SPT.igualJSON(h.cols.map(c => c.tipo), ['factor', 'factor', 'numerica']);
    SPT.igual(h.texto(2, 2), ''); SPT.igual(h.texto(1, 2), '5.1'); SPT.igual(h.faltantes(2), 1);
  });

  SPT.caso('editar, deshacer y rehacer', () => {
    const h = nueva(), v0 = h.version;
    h.editar(2, 2, '4.9');
    SPT.igual(h.valor(2, 2), 4.9); SPT.afirmar(h.version > v0);
    SPT.afirmar(/Editar/.test(h.deshacer()));
    SPT.igual(h.valor(2, 2), null);
    h.rehacer(); SPT.igual(h.valor(2, 2), 4.9);
    SPT.lanza(() => h.editar(0, 2, 'mucho'), 'no es un valor válido');
    SPT.igual(h.valor(0, 2), 4.2, 'el error no cambia nada');
  });

  SPT.caso('pegar crece la hoja, agrega niveles nuevos y se deshace completo', () => {
    const h = nueva();
    const r = h.pegar(3, 0, [['2', 'B', '5.6'], ['3', 'C', '6,1'], ['3', 'A', 'x']]);
    SPT.igual(h.n, 6); SPT.igual(r.rechazadas, 2, '«6,1» con punto decimal y «x» no son números');
    SPT.igualJSON(h.cols[1].niveles, ['A', 'B', 'C']);
    h.deshacer();
    SPT.igual(h.n, 4); SPT.igualJSON(h.cols[1].niveles, ['A', 'B']);
    SPT.lanza(() => h.pegar(0, 2, [['1', '2']]), 'solo caben 1');
  });

  SPT.caso('columnas: agregar, renombrar, cambiar tipo, reordenar niveles y eliminar', () => {
    const h = nueva();
    const nom = h.agregarColumna({ nombre: 'rend', tipo: 'numerica', datos: [1, 2, 3, 4], origen: 'calculada' });
    SPT.igual(nom, 'rend_2', 'no pisa el nombre existente');
    h.renombrar(3, 'rend_ln');
    SPT.lanza(() => h.renombrar(3, 'trat'), 'Ya hay una columna');
    const r = h.cambiarTipo(1, 'numerica');
    SPT.igual(r.fallidos, 4, 'A y B no son números: quedan faltantes');
    h.deshacer();
    SPT.igual(h.cols[1].tipo, 'factor');
    h.ordenarNiveles(1, ['B', 'A']);
    SPT.igualJSON(h.cols[1].niveles, ['B', 'A']);
    h.eliminarColumna(3); SPT.igual(h.p, 3);
    h.deshacer(); SPT.igual(h.cols[3].nombre, 'rend_ln');
  });

  SPT.caso('hacia los análisis: tabla con factores, sin identificadores, filtrada', () => {
    const h = SP.hoja.crear({ columnas: { parcela: [11, 12, 13, 14], trat: ['A', 'B', 'A', 'B'], rend: [4, 5, 6, 7] } });
    const t = h.aTabla();
    SPT.igualJSON(t.nombres, ['trat', 'rend']);
    SPT.igual(t.col('trat').tipo, 'factor');
    SPT.igual(h.aTabla([1, 3]).n, 2);
    SPT.igual(h.aTabla(), t, 'se reutiliza mientras no cambie');
    h.editar(0, 2, '9'); SPT.afirmar(h.aTabla() !== t, 'y se rehace al cambiar');
    SPT.igualJSON(h.aTabla([1, 3]).col('trat').niveles, ['B'], 'el filtro quita los niveles sin observaciones (droplevels)');
  });
  SPT.caso('los números se muestran con 15 cifras, como as.character() de R', () => {
    SPT.igual(SP.tipos.numeroATexto(0.1 + 0.2), '0.3');
    SPT.igual(SP.tipos.numeroATexto(4.6000000000000005), '4.6');
    SPT.igual(SP.tipos.numeroATexto(1 / 3), '0.333333333333333');
    SPT.igual(SP.tipos.numeroATexto(1e-20), '1e-20');
    SPT.igual(SP.tipos.numeroATexto(-Infinity), '-Inf');
  });

  SPT.caso('guardar y restaurar el estado', () => {
    const h = nueva(); h.editar(2, 2, '4.4');
    const k = SP.hoja.deSerializado(JSON.parse(JSON.stringify(h.serializar())));
    SPT.igual(k.valor(2, 2), 4.4); SPT.igualJSON(k.cols[1].niveles, ['A', 'B']); SPT.igual(k.n, 4);
  });
});

SPT.describir('Datos · expresiones', () => {
  const h = SP.hoja.crear({ columnas: { trat: ['A', 'B', 'A', 'B', 'C'], rend: [4, 5, null, 7, 2], 'peso seco': [1, 2, 3, 4, 5] } });
  SPT.caso('variables calculadas sobre la hoja, con nombres entre comillas invertidas', () => {
    const r = SP.expresiones.comoArreglo(SP.expresiones.enHoja(h, '`peso seco` * 10 + rend'), h.n);
    SPT.igualJSON(r, [14, 25, null, 47, 52]);
    const s = SP.expresiones.comoArreglo(SP.expresiones.enHoja(h, 'si(rend > media(rend), "alto", "bajo")'), h.n);
    SPT.igualJSON(s, ['bajo', 'alto', null, 'alto', 'bajo'], 'sinónimos en español');
  });
  SPT.caso('filtros: las filas con NA no pasan', () => {
    SPT.igualJSON(SP.expresiones.filtrar(h, 'rend >= 4 & trat != "B"'), [0]);
    SPT.igualJSON(SP.expresiones.filtrar(h, 'trat %in% c("A", "C")'), [0, 2, 4]);
    SPT.lanza(() => SP.expresiones.filtrar(h, 'paste(trat)'), 'verdadero o falso');
  });
  SPT.caso('errores explicados', () => {
    SPT.lanza(() => SP.expresiones.enHoja(h, 'rendimiento + 1'), 'No existe la columna «rendimiento»');
    SPT.lanza(() => SP.expresiones.enHoja(h, 'raiz(rend'), 'Se esperaba «)»');
    SPT.lanza(() => SP.expresiones.enHoja(h, 'trat * 2'), 'recibió texto');
    SPT.lanza(() => SP.expresiones.enHoja(h, 'magia(rend)'), 'No conozco la función');
    SPT.igualJSON([...SP.expresiones.variables(SP.expresiones.analizar('log(rend) + `peso seco`'))], ['rend', 'peso seco']);
  });
  SPT.caso('redondeo de R: el más cercano y, en empate exacto, el par', () => {
    const R = SP.expresiones.redondear;
    SPT.igual(R(0.5, 0), 0); SPT.igual(R(1.5, 0), 2); SPT.igual(R(2.5, 0), 2); SPT.igual(R(-2.5, 0), -2);
    SPT.igual(R(0.15, 1), 0.1, '0.15 es 0.1499… en binario'); SPT.igual(R(1.25, 1), 1.2); SPT.igual(R(2.675, 2), 2.67);
  });
});

SPT.describir('Datos · transformaciones', () => {
  SPT.caso('dominios: avisa qué hacer con ceros y porcentajes', () => {
    SPT.lanza(() => SP.transformar.aplicar('log', [0, 1, 2]), 'mayores que cero');
    const e = SPT.lanza(() => SP.transformar.aplicar('arcoseno', [10, 50, 90]), 'entre 0 y 1');
    SPT.afirmar(/porcentajes/.test(e.arreglo));
    SPT.cerca(SP.transformar.aplicar('arcoseno', [50], { porcentaje: true })[0], Math.PI / 4, 1e-15);
    SPT.igual(SP.transformar.aplicar('logc', [0, Math.E - 1], { c: 1 })[1], 1);
  });
  SPT.caso('Box-Cox: datos lognormales sugieren el logaritmo', () => {
    let s = 5;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const y = Array.from({ length: 400 }, () => Math.exp(1 + 0.6 * SP.dist.qnorm(azar())));
    const r = SP.transformar.boxcox(SP.tabla.crear({ y }), 'y');
    SPT.afirmar(Math.abs(r.lambda) < 0.2, 'λ̂ = ' + r.lambda);
    SPT.afirmar(r.ic[0] < 0 && r.ic[1] > 0, 'el intervalo contiene el 0');
    SPT.igual(r.sugerencia.transformacion, 'log');
  });
  SPT.caso('Box-Cox: la suma de cuadrados por celdas es la misma que con la QR completa', () => {
    let s = 11;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { a: [], b: [], y: [] };
    for (let r = 0; r < 7; r++) for (const a of ['p', 'q', 'r']) for (const b of ['u', 'v']) { if (a === 'r' && b === 'v' && r > 2) continue; c.a.push(a); c.b.push(b); c.y.push(azar()); }
    const mm = SP.formula.matrizModelo(SP.tabla.crear(c, { a: { tipo: 'factor' }, b: { tipo: 'factor' } }), 'y ~ a * b');
    const rapido = SP.transformar._interno.residualRapido(mm.X, mm.n, mm.p);
    const d = SP.algebra.qr(mm.X, mm.n, mm.p);
    for (let k = 1; k <= 3; k++) {
      const z = Float64Array.from(mm.y, v => (1 + k) * Math.exp(k * v));
      const e = SP.algebra.qty(d, z);
      let directo = 0; for (let i = d.rango; i < mm.n; i++) directo += e[i] * e[i];
      SPT.cerca(rapido(z), directo, 1e-9 * directo);
    }
  });
});

SPT.describir('Datos · estructura del ensayo y formas de tabla', () => {
  const dbca = () => {
    const c = { bloque: [], trat: [], rend: [] };
    for (let b = 1; b <= 4; b++) for (const t of ['A', 'B', 'C']) { c.bloque.push(String(b)); c.trat.push(t); c.rend.push(b + t.charCodeAt(0) / 10); }
    return SP.tabla.crear(c, { bloque: { tipo: 'factor' }, trat: { tipo: 'factor' } });
  };
  SPT.caso('reconoce bloques completos al azar', () => {
    const r = SP.estructura.analizar(dbca());
    SPT.igual(r.datos.diseno, 'dbca');
    SPT.afirmar(r.hallazgos.some(x => x.tipo === 'ok' && /4 bloques completos/.test(x.texto)));
  });
  SPT.caso('una columna numérica de dosis cuenta como factor del diseño; la respuesta no', () => {
    const c = { bloque: [], hibrido: [], dosis: [], rend: [] };
    for (let b = 1; b <= 3; b++) for (const h of ['H1', 'H2']) for (const d of [0, 60, 120]) { c.bloque.push(String(b)); c.hibrido.push(h); c.dosis.push(d); c.rend.push(5 + b / 7 + d / 97 + h.length / 3 + c.rend.length / 1000); }
    const t = SP.tabla.crear(c, { bloque: { tipo: 'factor' }, hibrido: { tipo: 'factor' } });
    const p = SP.estructura.adivinarPapeles(t);
    SPT.igualJSON(p.respuestas, ['rend']); SPT.igualJSON(p.numericosComoFactor, ['dosis']);
    const r = SP.estructura.analizar(t);
    SPT.igual(r.datos.diseno, 'dbca');
    SPT.afirmar(r.hallazgos.some(x => /Factorial 2 × 3/.test(x.texto)), 'factorial híbrido × dosis');
    SPT.afirmar(r.hallazgos.some(x => /igualmente espaciados \(0, 60, 120\)/.test(x.texto)), 'tendencia de la dosis');
    /* conteos desparejos: siguen siendo respuesta */
    SPT.igual(SP.estructura.pareceFactorNumerico({ valores: Float64Array.from([0, 0, 1, 2, 2, 2, 2, 2, 3, 0]) }, 10), false);
  });
  SPT.caso('las fechas y los identificadores no se toman como factores del diseño', () => {
    const k = 10, rep = (a, b) => Array.from({ length: k }, (_, i) => (i < k / 2 ? a : b));
    const h = SP.hoja.crear({ nombres: ['trat', 'unidad', 'siembra', 'y'], tipos: { unidad: 'texto' }, columnas: {
      trat: rep('A', 'B'), unidad: Array.from({ length: k }, (_, i) => 'u' + 'x'.repeat(i)), siembra: rep('2026-05-01', '2026-05-02'), y: Array.from({ length: k }, (_, i) => 1.5 + i * 0.75) } });
    const p = SP.estructura.adivinarPapeles(h.aTabla());
    SPT.igualJSON(p.factores, ['trat']); SPT.igualJSON(p.identificadores, ['unidad']); SPT.igualJSON(p.respuestas, ['y']);
    /* en una tabla corta ya agregada (una fila por categoría) los valores distintos son categorías, no identificadores */
    const m = SP.hoja.crear({ nombres: ['fenotipo', 'semillas'], columnas: { fenotipo: ['RA', 'Ra', 'rA', 'ra'], semillas: [315, 108, 101, 32] }, tipos: { fenotipo: 'factor' } });
    SPT.igualJSON(SP.estructura.adivinarPapeles(m.aTabla()).identificadores, []);
  });
  SPT.caso('reconoce un cuadro latino 4 × 4', () => {
    const c = { fila: [], columna: [], trat: [], y: [] };
    const L = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fila.push(String(i + 1)); c.columna.push(String(j + 1)); c.trat.push(L[(i + j) % 4]); c.y.push(i + j); }
    const t = SP.tabla.crear(c, { fila: { tipo: 'factor' }, columna: { tipo: 'factor' }, trat: { tipo: 'factor' } });
    SPT.igual(SP.estructura.analizar(t).datos.diseno, 'cuadro-latino');
  });
  SPT.caso('avisa desbalance, celdas vacías y faltantes', () => {
    const t = SP.tabla.crear({ a: ['x', 'x', 'y', 'y', 'x'], b: ['p', 'q', 'p', 'p', 'p'], y: [1, 2, 3, null, 5] },
      { a: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const r = SP.estructura.analizar(t);
    SPT.igual(r.datos.faltantes, 1); SPT.igual(r.datos.celdasVacias, 1);
    SPT.afirmar(r.hallazgos.some(x => /sin ninguna observación/.test(x.texto)));
    /* un solo factor desbalanceado: los tipos I, II y III coinciden, así que no se advierte de ellos */
    const u = SP.estructura.analizar(SP.tabla.crear({ a: ['x', 'x', 'x', 'y', 'y'], y: [1, 2, 3, 4, 5] }, { a: { tipo: 'factor' } }));
    SPT.afirmar(u.hallazgos.some(x => x.tipo === 'info' && /no cambia el ANOVA/.test(x.texto)) && !u.hallazgos.some(x => /tipo I, II y III/.test(x.texto)));
  });
  SPT.caso('ancha → larga → ancha regresa la misma tabla', () => {
    const ancha = { nombres: ['planta', 'r2024', 'r2025'], columnas: { planta: ['p1', 'p2'], r2024: [3, 4], r2025: [5, null] } };
    const larga = SP.reformar.aLarga(ancha, { ids: ['planta'], medidas: ['r2024', 'r2025'], nombreClave: 'anio', nombreValor: 'rend' });
    SPT.igualJSON(larga.columnas.anio, ['r2024', 'r2024', 'r2025', 'r2025']);
    SPT.igualJSON(larga.columnas.rend, [3, 4, 5, null]);
    const otra = SP.reformar.aAncha(larga, { ids: ['planta'], clave: 'anio', valor: 'rend' });
    SPT.igualJSON(otra.columnas, ancha.columnas);
    SPT.lanza(() => SP.reformar.aAncha({ columnas: { id: [1, 1], k: ['a', 'a'], v: [1, 2] } }, { ids: ['id'], clave: 'k', valor: 'v' }), 'se repiten');
  });
});

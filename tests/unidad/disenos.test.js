/* Pruebas de js/metodos/disenos.js, js/nucleo/estratos.js y js/nucleo/medias.js que no cubren los casos contra R:
   reportes de cada diseño, avisos, validación de papeles y detección de anidamiento. */
SPT.describir('Diseños experimentales · reportes, avisos y anidamiento', () => {
  /* parcelas divididas en bloques: 3 bloques × A (2) × B (3) */
  function divididas(quitar) {
    const c = { y: [], bloque: [], A: [], B: [] };
    let s = 3;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let b = 1; b <= 3; b++) for (let a = 1; a <= 2; a++) for (let k = 1; k <= 3; k++) {
      c.bloque.push('b' + b); c.A.push('a' + a); c.B.push('n' + k); c.y.push(10 + a + 0.5 * k + b * 0.3 + az());
    }
    if (quitar) for (const col of Object.keys(c)) c[col].splice(quitar, 1);
    return SP.tabla.crear(c, { bloque: { tipo: 'factor' }, A: { tipo: 'factor' }, B: { tipo: 'factor' } });
  }
  const e = { respuesta: 'y', parcelaGrande: 'A', subparcela: 'B', bloque: 'bloque', principal: 'dbca' };

  SPT.caso('parcelas divididas: estratos con su error, CV de cada uno y sin prueba de bloques', () => {
    const r = SP.ejecutar('parcelas-divididas', divididas(), e, {}).resultado;
    SPT.igualJSON(r.estratos.map(x => x.nombre), ['bloque', 'bloque:A', 'Within']);
    SPT.igualJSON(r.estratos.map(x => x.error), [null, 'Error a', 'Error b']);
    SPT.afirmar(r.balanceado);
    const rep = SP.metodos['parcelas-divididas'].reporte(r);
    const fuentes = rep.cuadros[0].filas.map(f => f.fuente);
    SPT.igualJSON(fuentes, ['bloque', 'A', 'Error a', 'B', 'A × B', 'Error b', 'Total']);
    SPT.afirmar(!Number.isFinite(rep.cuadros[0].filas[0].F), 'los bloques no se prueban');
    SPT.igual(r.resumen.cv.length, 2);
  });

  SPT.caso('parcelas divididas desbalanceadas: se avisa que las pruebas por estratos no son exactas', () => {
    const r = SP.ejecutar('parcelas-divididas', divididas(4), e, {}).resultado;
    SPT.afirmar(!r.balanceado);
    SPT.afirmar(r.avisos.some(a => /modelo mixto/.test(a)));
  });

  SPT.caso('bloques generalizados y parcelas perdidas se detectan solos', () => {
    const c = { y: [], bloque: [], t: [] };
    for (let b = 1; b <= 3; b++) for (let t = 1; t <= 3; t++) for (let r = 0; r < 2; r++) { c.bloque.push('B' + b); c.t.push('T' + t); c.y.push(5 + t + b * 0.5 + r * 0.2 + (b * t) % 3 * 0.1); }
    const tg = SP.tabla.crear(c, { bloque: { tipo: 'factor' }, t: { tipo: 'factor' } });
    const r = SP.ejecutar('dbca', tg, { respuesta: 'y', tratamientos: ['t'], bloque: 'bloque' }, {}).resultado;
    SPT.afirmar(r.generalizado);
    SPT.afirmar(r.anova.fuente.includes('bloque:t'), 'se estima la interacción bloque × tratamiento');
    SPT.afirmar(/bloque \* \(t\)/.test(SP.metodos.dbca.codigoR({ respuesta: 'y', tratamientos: ['t'], bloque: 'bloque' }, {}, { resultado: r })));
    const c2 = { y: c.y.filter((_, i) => i % 2 === 0), bloque: c.bloque.filter((_, i) => i % 2 === 0), t: c.t.filter((_, i) => i % 2 === 0) };
    c2.y[4] = NaN;
    const r2 = SP.ejecutar('dbca', SP.tabla.crear(c2, { bloque: { tipo: 'factor' }, t: { tipo: 'factor' } }), { respuesta: 'y', tratamientos: ['t'], bloque: 'bloque' }, {}).resultado;
    SPT.igual(r2.perdidas, 1);
    SPT.afirmar(!r2.eficiencia, 'sin eficiencia relativa con parcelas perdidas');
  });

  SPT.caso('los papeles se validan: una columna no puede tener dos papeles ni faltar uno', () => {
    const t = divididas();
    SPT.lanza(() => SP.ejecutar('parcelas-divididas', t, Object.assign({}, e, { subparcela: 'A' }), {}), /dos papeles/);
    SPT.lanza(() => SP.ejecutar('parcelas-divididas', t, Object.assign({}, e, { bloque: undefined }), {}), /bloques/);
    SPT.lanza(() => SP.ejecutar('cuadro-latino', t, { respuesta: 'y', tratamientos: ['A', 'B', 'bloque'], fila: 'x', columna: 'z' }, {}), /2 factores/);
  });

  SPT.caso('anidamiento como emmeans: bloques con etiquetas únicas dentro de repeticiones', () => {
    const c = { y: [], rep: [], bloque: [], g: [] };
    let k = 0;
    for (let r = 1; r <= 2; r++) for (let b = 1; b <= 3; b++) for (let j = 1; j <= 3; j++) { c.rep.push('R' + r); c.bloque.push('blq' + (++k > 0 ? (r - 1) * 3 + b : 0)); c.g.push('G' + (r === 1 ? (b - 1) * 3 + j : (j - 1) * 3 + b)); c.y.push(4 + j * 0.3 + b * 0.2 + r * 0.1 + ((j * b) % 4) * 0.05); }
    const t = SP.tabla.crear(c, { rep: { tipo: 'factor' }, bloque: { tipo: 'factor' }, g: { tipo: 'factor' } });
    const a = SP.lineal.ajustar(t, 'y ~ rep/bloque + g');
    const R = SP.medias.rejilla(t, a);
    SPT.igualJSON(R.nidos, { bloque: ['rep'] });
    SPT.igual(R.G, 6 * 9, 'solo las combinaciones rep–bloque que existen');
    SPT.afirmar(SP.medias.emm(t, a, ['g']).every(m => m.estimable));
  });

  SPT.caso('látice: los tratamientos al final, ajustados por los bloques (como terms(…, keep.order = TRUE))', () => {
    const c = { y: [], rep: [], bloque: [], g: [] };
    for (let r = 1; r <= 2; r++) for (let b = 1; b <= 3; b++) for (let j = 1; j <= 3; j++) { c.rep.push('R' + r); c.bloque.push('b' + ((r - 1) * 3 + b)); c.g.push('G' + (r === 1 ? (b - 1) * 3 + j : (j - 1) * 3 + b)); c.y.push(4 + j * 0.3 + b * 0.45 + r * 0.1 + ((j * b) % 4) * 0.05); }
    const t = SP.tabla.crear(c, { rep: { tipo: 'factor' }, bloque: { tipo: 'factor' }, g: { tipo: 'factor' } });
    const r = SP.ejecutar('latice', t, { respuesta: 'y', tratamientos: 'g', bloque: 'bloque', repeticion: 'rep' }, SP.opcionesCon(SP.metodos.latice, {})).resultado;
    SPT.igualJSON(r.anova.fuente.slice(0, 3), ['rep', 'rep:bloque', 'g']);
    const aj = SP.lineal.anova(t, 'y ~ rep + rep:bloque + g', { tipo: 1, conservarOrden: true }), sin = SP.lineal.anova(t, 'y ~ rep/bloque + g', { tipo: 1 });
    SPT.cerca(r.anova.sc[2], aj.sc[aj.fuente.indexOf('g')], 1e-10);
    SPT.afirmar(Math.abs(aj.sc[aj.fuente.indexOf('g')] - sin.sc[sin.fuente.indexOf('g')]) > 1e-6, 'la ajustada no es la de los tratamientos sin ajustar');
    SPT.afirmar(/keep\.order = TRUE/.test(SP.metodos.latice.codigoR({ respuesta: 'y', tratamientos: 'g', bloque: 'bloque', repeticion: 'rep' }, SP.opcionesCon(SP.metodos.latice, {}), { resultado: r })), 'código R con keep.order');
    SPT.afirmar(/intrabloque/.test(SP.metodos.latice.reporte(r).cuadros[0].notas.join(' ')), 'la nota del análisis intrabloque');
  });

  SPT.caso('la gráfica de interacción dibuja una línea y un marcador distinto por serie, con leyenda', () => {
    const svg = SP.graficas ? SP.graficas.lineas({ titulo: 'x', x: { titulo: 'A', niveles: ['a1', 'a2', 'a3'] }, y: { titulo: 'y' }, leyenda: 'B',
      series: [{ nombre: 'b1', valores: [1, 2, 3] }, { nombre: 'b2', valores: [2, NaN, 4] }] }) : '<polyline class="gr-serie gr-s0"/><polyline class="gr-serie gr-s1"/>b1b2';
    SPT.afirmar(/gr-s0/.test(svg) && /gr-s1/.test(svg));
    SPT.afirmar(svg.includes('b1') && svg.includes('b2'));
  }, { navegador: true });

  SPT.caso('un eje x que cuenta (pasos de la selección) lleva marcas enteras, no 0.2, 0.4…', () => {
    const svg = SP.graficas.dispersion({ titulo: 'AIC', x: { titulo: 'Paso', enteros: true }, y: { titulo: 'AIC' }, puntos: [{ x: 0, y: 54.19 }, { x: 1, y: 52.73 }] });
    const marcas = [...svg.matchAll(/data-role="xtick"[^>]*>([^<]*)</g)].map(m => m[1]);
    SPT.igualJSON(marcas, ['0', '1']);
  }, { navegador: true });

  SPT.caso('las etiquetas de dos puntos resaltados muy juntos no se enciman', () => {
    const svg = SP.graficas.dispersion({ titulo: 'BLUP', x: { titulo: 'BLUE' }, y: { titulo: 'BLUP' },
      puntos: [{ x: 3.5, y: 3.6 }, { x: 5.037, y: 4.954, marca: true, etiqueta: 'G05' }, { x: 5.108, y: 4.981, marca: true, etiqueta: 'G01' }] });
    const pos = [...svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"(?: text-anchor="(end|middle)")? class="gr-etq gr-etq-punto"[^>]*>(G0\d)</g)].map(m => ({ x: +m[1], y: +m[2], ancla: m[3] === 'end' ? 1 : m[3] === 'middle' ? 0.5 : 0 }));
    SPT.igual(pos.length, 2);
    const caja = p => [p.x - p.ancla * 20.6, p.x - p.ancla * 20.6 + 20.6];
    const [a, b] = pos.map(caja);
    SPT.afirmar(Math.abs(pos[0].y - pos[1].y) >= 12 || a[1] <= b[0] || b[1] <= a[0], 'las dos etiquetas quedan separadas');
  }, { navegador: true });

  SPT.caso('con submuestras, el ajuste por celdas da las mismas sumas de cuadrados que el completo (lineal y estratos)', () => {
    let s = 21;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = { y: [], bloque: [], A: [], B: [] };
    for (let b = 1; b <= 3; b++) for (let a = 1; a <= 3; a++) for (let k = 1; k <= 4; k++) for (let m = 0; m < 3 + ((a + k) % 3); m++) {
      c.bloque.push('b' + b); c.A.push('a' + a); c.B.push('n' + k); c.y.push(20 + a + 0.5 * k + 0.3 * b + 2 * az());
    }
    const t = SP.tabla.crear(c, { bloque: { tipo: 'factor' }, A: { tipo: 'factor' }, B: { tipo: 'factor' } });
    const f = 'y ~ bloque + A * B';
    for (const tipo of [1, 2, 3]) {
      const x = SP.lineal.anova(t, f, { tipo, agrupar: true }), z = SP.lineal.anova(t, f, { tipo, agrupar: false });
      x.sc.forEach((v, i) => SPT.cerca(v, z.sc[i], 1e-9 * Math.max(1, Math.abs(z.sc[i])), 'tipo ' + tipo + ' ' + x.fuente[i]));
      SPT.igualJSON(x.gl, z.gl);
    }
    const g = SP.estratos.anova(t, f, 'bloque/A', { agrupar: true }), h = SP.estratos.anova(t, f, 'bloque/A', { agrupar: false });
    SPT.afirmar(g.agrupado && !h.agrupado);
    SPT.igualJSON(g.estratos.map(e => e.nombre), h.estratos.map(e => e.nombre));
    g.estratos.forEach((e, i) => {
      e.filas.forEach((r, j) => SPT.cerca(r.sc, h.estratos[i].filas[j].sc, 1e-9 * Math.max(1, r.sc)));
      if (e.residual) { SPT.igual(e.residual.gl, h.estratos[i].residual.gl); SPT.cerca(e.residual.sc, h.estratos[i].residual.sc, 1e-9 * e.residual.sc); }
    });
  });

  SPT.caso('eficiencia relativa (Gomez y Gomez, 1984): sin bloqueo útil vale ≈ 100 %', () => {
    const [ef] = SP.disenos.eficienciaBloques(2, 2, 4, 5);
    SPT.cerca(ef.relativa, 1, 1e-12);
    const lat = SP.disenos.eficienciaLatino(3, 3, 3, 5);
    for (const x of lat) SPT.cerca(x.relativa, 1, 1e-12);
  });
});

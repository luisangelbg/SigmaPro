/* Pruebas de los ensayos multiambiente (js/nucleo/multiambiente.js y js/metodos/multiambiente.js): la SVD, la
   envolvente convexa, identidades que deben cumplirse (media de las b = 1, W en % suma 100, los ejes AMMI suman la
   SC de G × A), los mensajes de error, el reporte, el código R y el párrafo. Los números contra R están en
   tests/casos/multiambiente. */
SPT.describir('Ensayos multiambiente · núcleo', () => {
  SPT.caso('SVD de Jacobi: reconstruye la matriz con vectores ortonormales, más filas o más columnas', () => {
    for (const Z of [[[1, 2, 0.5], [-0.3, 1, 2], [2, -1, 0.2], [0.4, 0.4, -1]], [[1, 2, 0.5, -1, 3], [-0.3, 1, 2, 0.7, 0.1]]]) {
      const s = SP.multiambiente.svd(Z);
      Z.forEach((f, i) => f.forEach((v, j) => SPT.cerca(s.d.reduce((t, d, k) => t + d * s.U[i][k] * s.V[j][k], 0), v, 1e-13, 'Z[' + i + '][' + j + ']')));
      for (const M of [s.U, s.V]) for (let a = 0; a < s.d.length; a++) for (let b = 0; b < s.d.length; b++)
        SPT.cerca(M.reduce((t, f) => t + f[a] * f[b], 0), a === b ? 1 : 0, 1e-13, 'ortonormal');
      SPT.afirmar(s.d.every((v, k) => k === 0 || v <= s.d[k - 1]), 'de mayor a menor');
    }
  });
  SPT.caso('Envolvente convexa: solo los vértices, en sentido antihorario', () => {
    const P = [[0, 0], [2, 0], [2, 2], [0, 2], [1, 1], [1, 0], [0.5, 1.5]];
    SPT.igualJSON(SP.multiambiente.envolvente(P).slice().sort(), [0, 1, 2, 3]);
  });
});

SPT.describir('Ensayos multiambiente · métodos', () => {
  const tabla = (quitar) => {
    let s = 7;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647 - 0.5;
    const c = { gen: [], amb: [], rep: [], y: [] };
    for (let a = 0; a < 5; a++) for (let r = 0; r < 3; r++) for (let g = 0; g < 6; g++) {
      if (quitar && a === 2 && g === 4) continue;
      c.gen.push('V' + (g + 1)); c.amb.push('L' + (a + 1)); c.rep.push(String(r + 1));
      c.y.push(5 + 0.4 * g + 1.2 * a + (g - 2.5) * (a - 2) * 0.15 + 0.3 * r + 0.4 * az());
    }
    return SP.tabla.crear(c, { gen: { tipo: 'factor' }, amb: { tipo: 'factor' }, rep: { tipo: 'factor' } });
  };
  const e = { respuesta: 'y', genotipo: 'gen', ambiente: 'amb', repeticion: 'rep' };
  const correr = (id, op) => SP.ejecutar(id, tabla(), e, SP.opcionesCon(SP.metodos[id], op || {})).resultado;
  SPT.caso('Identidades: media de las b = 1, W en % suma 100 y los ejes AMMI suman la SC de G × A', () => {
    const r = correr('estabilidad');
    SPT.cerca(r.regresion.b.reduce((a, b) => a + b, 0) / r.regresion.b.length, 1, 1e-12, 'media de b');
    SPT.cerca(r.wricke.pct.reduce((a, b) => a + b, 0), 100, 1e-10, 'W %');
    const m = correr('ammi'), iGA = m.anova.fuente.indexOf('G × A');
    SPT.cerca(m.ammi.ejes.sc.reduce((a, b) => a + b, 0), m.anova.sc[iGA], 1e-9, 'SC de los ejes');
    SPT.cerca(m.ammi.fr.sc[0], m.anova.sc[iGA], 1e-9, 'F_R con 0 ejes = G × A');
  });
  SPT.caso('GGE: el ganador de cada ambiente es un vértice del polígono; reportes, código R y párrafos', () => {
    const r = correr('gge');
    SPT.afirmar(r.gge.ganador.every(g => r.gge.vertices.includes(g)), r.gge.ganador + ' / ' + r.gge.vertices);
    const ids = { 'ensayos-multiambiente': ['anova', 'ambientes', 'medias'], estabilidad: ['regresion', 'varianzas', 'eberhart_russell', 'indice', 'huehn', 'kang', 'annicchiarico', 'medias'],
      ammi: ['anova', 'fr', 'puntajes', 'puntajes_ambientes', 'waas', 'medias'], gge: ['valores', 'ganadores', 'media_estabilidad', 'ideal', 'ambiente_ideal', 'medias'], 'dos-etapas': ['etapa1', 'genotipos', 'wald'] };
    for (const [id, cs] of Object.entries(ids)) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, {}), res = SP.ejecutar(id, tabla(), e, op).resultado, rep = f.reporte(res);
      SPT.igualJSON(rep.cuadros.map(c => c.id), cs);
      SPT.afirmar(f.codigoR(e, op, { resultado: res }).includes(id === 'dos-etapas' ? 'metafor::rma(yi = media' : 'tapply(d$y, list(d$gen, d$amb), mean)'), 'código R de ' + id);
      const p = SP.informe.parrafo(id, res, rep, e, op);
      SPT.afirmar(p.metodos.length > 40 && p.resultados.length > 20, id + ': ' + p.metodos);
    }
    const p = SP.informe.parrafo('estabilidad', correr('estabilidad'), null, e, {});
    SPT.afirmar(/Eberhart y Russell, 1966/.test(p.metodos) && /Shukla, 1972/.test(p.metodos), p.metodos);
  });
  SPT.caso('Mensajes de error', () => {
    SPT.lanza(() => SP.ejecutar('estabilidad', tabla(true), e, SP.opcionesCon(SP.metodos.estabilidad, { imputar: false })), 'Faltan combinaciones');
    SPT.lanza(() => SP.ejecutar('ammi', tabla(), { respuesta: 'y', genotipo: 'gen', ambiente: 'gen' }, SP.opcionesCon(SP.metodos.ammi, {})), 'un solo papel');
    SPT.lanza(() => SP.ejecutar('gge', tabla(), e, { escala: 'rara', particion: 'simetrica', objetivo: 'maximo', alfa: 0.05 }), 'GGE');
    SPT.lanza(() => SP.ejecutar('gge', tabla(), e, SP.opcionesCon(SP.metodos.gge, { genotipoA: 'V1', genotipoB: 'V1' })), 'dos distintos');
    const medias = SP.tabla.crear({ gen: ['V1', 'V2', 'V3', 'V1', 'V2', 'V3', 'V1', 'V2', 'V3'], amb: ['L1', 'L1', 'L1', 'L2', 'L2', 'L2', 'L3', 'L3', 'L3'], y: [1, 2, 3, 2, 3, 5, 1, 1, 2] }, { gen: { tipo: 'factor' }, amb: { tipo: 'factor' } });
    SPT.lanza(() => SP.ejecutar('dos-etapas', medias, { respuesta: 'y', genotipo: 'gen', ambiente: 'amb' }, SP.opcionesCon(SP.metodos['dos-etapas'], {})), 'grados de libertad');
  });
});

SPT.describir('Ensayos multiambiente · Fase 4 (EM-AMMI, Huehn, Kang, Annicchiarico, WAAS, GGE, dos etapas)', () => {
  const M = () => SP.multiambiente;
  const tabla = (quitar, perdidas) => {
    let s = 11;
    const az = () => (s = (s * 16807) % 2147483647) / 2147483647 - 0.5;
    const c = { gen: [], amb: [], rep: [], y: [] };
    for (let a = 0; a < 5; a++) for (let r = 0; r < 3; r++) for (let g = 0; g < 6; g++) {
      if (quitar && ((a === 2 && g === 4) || (a === 0 && g === 1))) continue;
      const v = 5 + 0.4 * g + 1.2 * a + (g - 2.5) * (a - 2) * 0.15 + 0.3 * r + 0.4 * az();
      if (perdidas && a === 3 && r === 0 && g < 2) continue;
      c.gen.push('V' + (g + 1)); c.amb.push('L' + (a + 1)); c.rep.push(String(r + 1)); c.y.push(v);
    }
    return SP.tabla.crear(c, { gen: { tipo: 'factor' }, amb: { tipo: 'factor' }, rep: { tipo: 'factor' } });
  };
  const e = { respuesta: 'y', genotipo: 'gen', ambiente: 'amb', repeticion: 'rep' };
  const correr = (id, op, t) => SP.ejecutar(id, t || tabla(), e, SP.opcionesCon(SP.metodos[id], op || {})).resultado;
  SPT.caso('EM-AMMI: cada celda imputada es el valor del modelo de la tabla completa; con 0 ejes, el aditivo', () => {
    const Y = [[1, 2, 3, 4], [2, NaN, 5, 5], [0, 1, 1, NaN], [3, 3, 4, 6]];
    for (const k of [0, 1]) {
      const r = M().imputarEMAMMI(Y, k, 1e-14, 100000), A = M().aditiva(r.Y), sv = M().svd(A.Z);
      for (const [i, j] of [[1, 1], [2, 3]]) {
        let v = A.gran + (A.gm[i] - A.gran) + (A.em[j] - A.gran);
        for (let q = 0; q < k; q++) v += sv.U[i][q] * sv.d[q] * sv.V[j][q];
        SPT.cerca(r.Y[i][j], v, 1e-10, k + ' ejes, celda ' + i + ',' + j);
      }
      SPT.afirmar(r.convergio, 'converge');
    }
    const am = correr('ammi', {}, tabla(true)), iGA = am.anova.fuente.indexOf('G × A');
    SPT.igual(am.imputacion.celdas.length, 2);
    SPT.igual(am.anova.gl[iGA], 4 * 5 - 2);
    SPT.igual(am.ammi.fr.gl[0], 4 * 5 - 2);
    SPT.afirmar(SP.metodos.ammi.reporte(am).cuadros.some(c => c.id === 'imputadas'), 'cuadro de imputadas');
    SPT.afirmar(SP.metodos.ammi.codigoR(e, SP.opcionesCon(SP.metodos.ammi, {}), { resultado: am }).includes('metan::impute_missing_val'), 'código R de la imputación');
  });
  SPT.caso('Huehn: sin interacción todos los rangos corregidos empatan (S1 = S2 = 0); Kang y Annicchiarico', () => {
    const Y = [[1, 3, 5], [2, 4, 6], [4, 6, 8], [3, 5, 7]], h = M().huehn(Y, 'maximo');
    SPT.igualJSON(h.S1, [0, 0, 0, 0]); SPT.igualJSON(h.S2, [0, 0, 0, 0]);
    SPT.cerca(h.esperado.S1, 15 / 12, 1e-14);
    SPT.igualJSON(M().rangos([3, 1, 3, 2]), [3.5, 1, 3.5, 2]);
    const k = M().kang(Y, { r: 3, cme: 0.01, gle: 18, objetivo: 'maximo' });
    SPT.igualJSON(k.rango, [1, 2, 4, 3]); SPT.igualJSON(k.califica, [0, 0, 0, 0]);
    const n = M().annicchiarico([[10, 20], [12, 18], [8, 22]], 0.25);
    SPT.cerca(n.general.pct[0], 100, 1e-12); SPT.cerca(n.general.de[0], 0, 1e-12);
    const r = correr('estabilidad');
    SPT.igual(r.huehn.S1.length, 6); SPT.afirmar(r.kang.YS.length === 6 && r.annicchiarico.general.Wi.length === 6, 'Kang y Annicchiarico');
    SPT.afirmar(!correr('estabilidad', { objetivo: 'minimo' }).annicchiarico, 'Annicchiarico solo con la mayor respuesta como objetivo');
  });
  SPT.caso('WAAS: con todos los ejes y pesos iguales, el promedio de |puntajes|; WAASY entre 0 y 100', () => {
    const r = correr('ammi', { ejesWaas: 3, pesoRespuesta: 0 }), A = r.ammi, k = 3, pct = A.ejes.pct.slice(0, k), sp = pct.reduce((a, b) => a + b, 0);
    const w0 = A.genotipos[0].slice(0, k).reduce((t, v, q) => t + Math.abs(v) * pct[q], 0) / sp;
    SPT.cerca(r.waas.genotipos[0], w0, 1e-14);
    SPT.igualJSON(r.waas.waasy.map(v => +v.toFixed(10)), r.waas.pct_waas.map(v => +v.toFixed(10)));
    SPT.afirmar(Math.max(...r.waas.waasy) <= 100 + 1e-12 && Math.min(...r.waas.waasy) >= -1e-12, 'entre 0 y 100');
  });
  SPT.caso('GGE: el ideal está sobre el eje del ambiente promedio; con dos ejes que lo explican todo, la diferencia prevista es la observada', () => {
    const r = correr('gge', { genotipoA: 'V6', genotipoB: 'V1' }), Q = r.gge, u = Q.media_ambiente;
    SPT.cerca(Q.genotipo_ideal[0] * u[1] - Q.genotipo_ideal[1] * u[0], 0, 1e-12);
    SPT.cerca(Math.hypot(...Q.genotipo_ideal), Math.max(...Q.genotipos.map(p => Math.hypot(p[0], p[1]))), 1e-12);
    const Y = [[1, 2], [2, 2.5], [0.5, 2], [3, 1]], q = M().gge(Y, { escala: 'ninguna', particion: 'simetrica' });   // dos ambientes: dos ejes lo explican todo
    const v = M().ggeVistas(q, Y, { a: 3, b: 0 });
    v.comparacion.prevista.forEach((x, j) => SPT.cerca(x, v.comparacion.observada[j], 1e-12, 'ambiente ' + j));
  });
  SPT.caso('Dos etapas: con la tabla completa, la media ajustada es ȳ.. + Σ w_j (y_ij − ȳ.j) / Σ w_j; celdas vacías y parcelas perdidas', () => {
    const r = correr('dos-etapas'), E1 = r.etapa1, E = 5, G = 6;
    const y = (i, j) => E1.media.find((_, c) => E1.genotipo[c] === i && E1.ambiente[c] === j), w = j => 1 / (r.sigma2_ga + E1.varianza[E1.ambiente.indexOf(j)]);
    const yj = j => { let t = 0; for (let i = 0; i < G; i++) t += y(i, j); return t / G; }, ybar = E1.media.reduce((a, b) => a + b, 0) / E1.media.length;
    for (let i = 0; i < G; i++) { let n = 0, d = 0; for (let j = 0; j < E; j++) { n += w(j) * (y(i, j) - yj(j)); d += w(j); } SPT.cerca(r.estimados.media[i], ybar + n / d, 1e-9, 'genotipo ' + i); }
    SPT.igual(r.celdas, 30); SPT.afirmar(r.wald.gl1 === 5 && r.wald.gl2 === 30 - 10, 'gl');
    const q = correr('dos-etapas', {}, tabla(true, true));
    const i2 = q.genotipos.indexOf('V2');
    SPT.igual(q.celdas, 28); SPT.afirmar(Number.isNaN(q.estimados.simple[i2]) && Number.isFinite(q.estimados.media[i2]), 'genotipo incompleto');
    const rep = SP.metodos['dos-etapas'].reporte(q);
    SPT.afirmar(rep.conclusiones.some(c => /no tienen todos los genotipos/.test(c)), rep.conclusiones.join(' | '));
  });
});

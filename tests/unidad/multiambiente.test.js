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
    const ids = { 'ensayos-multiambiente': ['anova', 'ambientes', 'medias'], estabilidad: ['regresion', 'varianzas', 'eberhart_russell', 'indice', 'medias'],
      ammi: ['anova', 'fr', 'puntajes', 'puntajes_ambientes', 'medias'], gge: ['valores', 'ganadores', 'media_estabilidad', 'medias'] };
    for (const [id, cs] of Object.entries(ids)) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, {}), res = SP.ejecutar(id, tabla(), e, op).resultado, rep = f.reporte(res);
      SPT.igualJSON(rep.cuadros.map(c => c.id), cs);
      SPT.afirmar(f.codigoR(e, op, { resultado: res }).includes('tapply(d$y, list(d$gen, d$amb), mean)'), 'código R de ' + id);
      const p = SP.informe.parrafo(id, res, rep, e, op);
      SPT.afirmar(p.metodos.length > 40 && p.resultados.length > 20, id + ': ' + p.metodos);
    }
    const p = SP.informe.parrafo('estabilidad', correr('estabilidad'), null, e, {});
    SPT.afirmar(/Eberhart y Russell, 1966/.test(p.metodos) && /Shukla, 1972/.test(p.metodos), p.metodos);
  });
  SPT.caso('Mensajes de error', () => {
    SPT.lanza(() => SP.ejecutar('estabilidad', tabla(true), e, SP.opcionesCon(SP.metodos.estabilidad, {})), 'Faltan combinaciones');
    SPT.lanza(() => SP.ejecutar('ammi', tabla(), { respuesta: 'y', genotipo: 'gen', ambiente: 'gen' }, SP.opcionesCon(SP.metodos.ammi, {})), 'un solo papel');
    SPT.lanza(() => SP.ejecutar('gge', tabla(), e, { escala: 'rara', particion: 'simetrica', objetivo: 'maximo', alfa: 0.05 }), 'GGE');
  });
});

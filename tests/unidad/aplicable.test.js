/* Pruebas de js/nucleo/aplicable.js: qué análisis del catálogo se pueden hacer con los datos cargados. */
SPT.describir('Catálogo · qué se puede hacer con los datos', () => {
  const maiz = () => {
    const c = { bloque: [], hibrido: [], dosis: [], rend: [] };
    for (const b of ['I', 'II', 'III', 'IV']) for (const h of ['H1', 'H2', 'H3']) for (const d of [0, 60, 120, 180]) { c.bloque.push(b); c.hibrido.push(h); c.dosis.push(d); c.rend.push(4 + d / 60 + ((c.rend.length * 37) % 23) / 10); }
    return SP.tabla.crear(c, { bloque: { tipo: 'factor' }, hibrido: { tipo: 'factor' } });
  };
  const rev = (id, p) => SP.aplicable.revisar(SP.metodos[id], p);
  SPT.caso('Perfil: numéricas, factores con sus niveles, bloques y dosis numérica', () => {
    const p = SP.aplicable.perfil(maiz());
    SPT.igual(p.n, 48);
    SPT.igualJSON(p.numericas, ['rend']);
    SPT.afirmar(p.factores.includes('hibrido') && p.factores.includes('dosis') && p.factores.includes('bloque'), 'factores');
    SPT.igual(p.bloque, 'bloque');
    SPT.igual(p.niveles.dosis.length, 4);
    SPT.igual(SP.aplicable.perfil(null), null);
  });
  SPT.caso('Listo, lo que falta y los que no necesitan datos', () => {
    const p = SP.aplicable.perfil(maiz());
    SPT.igual(rev('dbca', p).estado, 'listo');
    SPT.igual(rev('parcelas-divididas', p).estado, 'listo');
    SPT.igual(rev('polinomios', p).estado, 'listo');
    const km = rev('kaplan-meier', p);
    SPT.igual(km.estado, 'falta');
    SPT.afirmar(km.falta.some(f => /0\/1/.test(f)), km.falta.join(' | '));
    const t = rev('prueba-t', p);
    SPT.igual(t.estado, 'falta');
    SPT.afirmar(t.falta.some(f => /dos grupos/.test(f)), t.falta.join(' | '));
    SPT.igual(rev('correlacion', p).estado, 'listo');   // la dosis numérica sirve de segunda variable
    SPT.igual(rev('manova', p).estado, 'falta');        // una sola respuesta medida
    SPT.igual(rev('potencia-medias', p).estado, 'sinDatos');
    SPT.igual(rev('repeticiones', null).estado, 'sinDatos');
    SPT.igual(rev('dbca', null).estado, 'falta');
  });
  SPT.caso('Dos grupos para la t; conteos y 0/1 para los generalizados', () => {
    const c = { trat: [], y: [], insectos: [], germino: [] };
    for (let i = 0; i < 20; i++) { c.trat.push(i % 2 ? 'A' : 'B'); c.y.push(3.1 + i * 0.37); c.insectos.push((i * 7) % 17); c.germino.push(i % 3 ? 1 : 0); }
    const p = SP.aplicable.perfil(SP.tabla.crear(c, { trat: { tipo: 'factor' } }));
    SPT.igual(rev('prueba-t', p).estado, 'listo');
    SPT.igual(rev('glm-conteos', p).estado, 'listo');
    SPT.igual(rev('glm-proporciones', p).estado, 'listo');
    SPT.igual(rev('kaplan-meier', p).estado, 'listo');
    const p2 = SP.aplicable.perfil(SP.tabla.crear({ trat: c.trat, y: c.y }, { trat: { tipo: 'factor' } }));
    SPT.igual(rev('cuadro-latino', p2).estado, 'falta');
    SPT.afirmar(rev('dbca', p2).falta.some(x => /bloques/.test(x)), rev('dbca', p2).falta.join(' | '));
    /* cada método del catálogo tiene un estado válido */
    for (const m of Object.values(SP.metodos)) SPT.afirmar(['listo', 'falta', 'sinDatos'].includes(SP.aplicable.revisar(m, p).estado), m.id);
  });
});

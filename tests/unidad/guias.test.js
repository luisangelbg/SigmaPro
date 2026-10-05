/* Pruebas de js/nucleo/guias.js: el registro de estadísticos (Fase 5). */
SPT.describir('Registro de estadísticos', () => {
  const G = SP.guias;
  const id = (clave, titulo) => { const f = G.buscar(clave, titulo); return f ? f.id : null; };
  SPT.caso('Fichas completas, ids únicos y grupos conocidos', () => {
    const fichas = G.fichas(), grupos = new Set(G.GRUPOS.map(g => g[0]));
    SPT.afirmar(fichas.length >= 100, 'hay ' + fichas.length + ' fichas');
    SPT.igual(new Set(fichas.map(f => f.id)).size, fichas.length);
    for (const f of fichas) {
      SPT.afirmar(grupos.has(f.grupo), f.id + ': grupo ' + f.grupo);
      SPT.afirmar(f.nombre && f.que && f.simbolo && f.titulos.length, f.id + ': incompleta');
      SPT.afirmar(f.que.length > 30 && /[.)]$/.test(f.que), f.id + ': la explicación es muy corta o no termina en punto');
    }
    SPT.igual(G.ficha('aic').nombre, SP.T('Criterio de información de Akaike'));
    SPT.igual(G.ficha('no-existe'), null);
  });
  SPT.caso('Reconoce cada estadístico por el título de su columna o de su fila', () => {
    SPT.igual(id('p', 'p'), 'p');
    SPT.igual(id('p', 'p ajustado'), 'p-ajustado');
    SPT.igual(id('p', 'Potencia'), 'potencia');            // el título manda sobre la clave
    SPT.igual(id('est', 'χ²'), 'chi2');
    SPT.igual(id('z', 't'), 't');
    SPT.igual(id('F1', 'F · variedad'), 'F');
    SPT.igual(id('ic', 'IC 95 %'), 'ic');
    SPT.igual(id('ic', 'IC 90 % (perfil)'), 'ic');
    SPT.igual(id('ee', 'EE(b)'), 'ee');
    SPT.igual(id('d', 'd'), 'd-cohen');
    SPT.igual(id('D', 'D'), 'deseabilidad');               // mismo título, otra clave
    SPT.igual(id(null, 'Coeficiente de variación, %'), 'cv');
    SPT.igual(id(null, 'CV (Error b), %'), 'cv');
    SPT.igual(id(null, 'R² ajustada'), 'r2-ajustada');
    SPT.igual(id(null, 'Shapiro-Wilk'), 'shapiro');
    SPT.igual(id(null, 'H² de Cullis'), 'heredabilidad');
    SPT.igual(id(null, 'Eficiencia relativa frente a completamente al azar, %'), 'eficiencia');
    SPT.igual(id('w', 'Peso de Akaike'), 'peso-akaike');
    SPT.igual(id('v', 'Valor'), null);                     // genérico: lo dice la fila
    SPT.igual(id(null, ''), null);
  });
  SPT.caso('Con la interfaz traducida usa el texto en español de origen, también en títulos de dos partes', () => {
    const O = SP.T.origen, antes = new Map(O);
    try {
      O.set('95% CI', 'IC 95 %'); O.set('Adjusted R²', 'R² ajustada');
      SPT.igual(id('ic', '95% CI (profile)'), 'ic');
      SPT.igual(id(null, 'Adjusted R²'), 'r2-ajustada');
      SPT.igual(id(null, 'Something else'), null);
    } finally { O.clear(); for (const [k, v] of antes) O.set(k, v); }
  });
});

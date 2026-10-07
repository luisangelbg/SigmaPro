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

SPT.describir('Registro · escalas de lectura (hito 5.1)', () => {
  const zona = (id, v, c) => { const z = SP.guias.zona(id, v, c); return z ? z.etiqueta : null; };
  SPT.caso('Cada escala tiene su fuente, zonas en orden y la última llega al máximo', () => {
    for (const f of SP.guias.fichas()) {
      const e = SP.guias.escala(f.id, { gl: 2, n: 30, alfa: 0.05 });
      if (!e) continue;
      SPT.afirmar(e.fuenteCorta && e.fuenteCompleta && e.fuenteCompleta !== e.fuenteCorta, f.id + ': fuente registrada');
      SPT.afirmar(e.zonas.every((z, i) => i === 0 || z.hasta > e.zonas[i - 1].hasta), f.id + ': zonas en orden');
      SPT.igual(e.zonas[e.zonas.length - 1].hasta, e.max, f.id + ': la última zona llega al máximo');
    }
  });
  SPT.caso('El p se lee contra el α del análisis', () => {
    SPT.igual(zona('p', 0.0004), 'muy fuerte'); SPT.igual(zona('p', 0.004), 'fuerte');
    SPT.igual(zona('p', 0.03), 'suficiente (p < α)'); SPT.igual(zona('p', 0.05), 'insuficiente (p ≥ α)');
    SPT.igual(zona('p', 0.03, { alfa: 0.01 }), 'insuficiente (p ≥ α)', 'con α = 0.01');
    SPT.igual(SP.guias.escala('p', { alfa: 0.1 }).referencias[0].valor, 0.1);
  });
  SPT.caso('Bordes: Cohen (sin incluir el límite), Landis y Koch (incluyéndolo, salvo el 0) y la razón de momios por su inversa', () => {
    SPT.igual(zona('d-cohen', 0.5), 'mediano'); SPT.igual(zona('d-cohen', -0.79), 'mediano', 'el signo no cuenta'); SPT.igual(zona('d-cohen', 0.8), 'grande');
    SPT.igual(zona('kappa', 0), 'leve'); SPT.igual(zona('kappa', -0.01), 'peor que el azar'); SPT.igual(zona('kappa', 0.2), 'leve'); SPT.igual(zona('kappa', 0.6), 'moderada');
    SPT.igual(zona('razon-momios', 4), 'mediano'); SPT.igual(zona('razon-momios', 0.25), 'mediano', '0.25 se lee como 4');
  });
  SPT.caso('Escalas que dependen del contexto', () => {
    SPT.igual(SP.guias.escala('v-cramer', {}), null, 'sin el tamaño de la tabla no hay escala');
    SPT.igual(zona('v-cramer', 0.3, { gl: 2 }), 'mediano', 'límites 0.1/√2, 0.3/√2, 0.5/√2');
    SPT.igual(zona('eficiencia', 160, { titulo: 'Eficiencia relativa, %' }), 'ganó precisión');
    SPT.igual(SP.guias.escala('eficiencia', { titulo: 'Factor de eficiencia del BIB' }), null, 'el factor del BIB no es un %');
    SPT.igual(zona('cook', 0.2, { n: 48 }), 'revisar', '4/n = 0.083'); SPT.igual(zona('cook', 0.2), 'sin influencia que preocupe', 'sin n, el corte es 0.5');
    SPT.igual(zona('cv', 3.57), 'bajo (alta precisión)'); SPT.igual(zona('cv', 30), 'muy alto (baja precisión)');
  });
  SPT.caso('Distribución de referencia de cada estadístico de prueba', () => {
    SPT.igual(SP.guias.distribucion('F'), 'F'); SPT.igual(SP.guias.distribucion('levene'), 'F'); SPT.igual(SP.guias.distribucion('t'), 't');
    SPT.igual(SP.guias.distribucion('kruskal'), 'chi2'); SPT.igual(SP.guias.distribucion('z'), 'z'); SPT.igual(SP.guias.distribucion('media'), null);
    SPT.igual((SP.guias.buscar('asimetria', 'Asimetría (G₁)') || {}).id, 'asimetria'); SPT.igual((SP.guias.buscar('curtosis', 'Curtosis (G₂)') || {}).id, 'curtosis');
  });
});

SPT.describir('Registro · el CV de los descriptivos', () => {
  SPT.caso('La guía del CV es la del error de un experimento: en los descriptivos (Explorar) no hay escala', () => {
    SPT.afirmar(!!SP.guias.escala('cv', {}), 'en un diseño sí');
    SPT.igual(SP.guias.escala('cv', { descriptivo: true }), null);
  });
});

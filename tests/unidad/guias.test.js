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

SPT.describir('Registro · tarjetas de interpretación (hito 5.2)', () => {
  const G = () => SP.guias;
  /* valores de prueba por estadístico: en cada zona, en sus bordes y con signo */
  const VALORES = {
    p: [0.0004, 0.001, 0.0049, 0.023, 0.05, 0.31], 'p-ajustado': [0.0002, 0.04, 0.6], 'd-cohen': [-0.85, 0.1, 0.5], 'g-hedges': [0.3], 'h-cohen': [-0.6],
    'f-cohen': [0.05, 0.27, 0.5], 'eta2-h': [-0.01, 0.08], 'w-kendall': [0.62], r: [-0.72, 0.05], rho: [0.4, -0.2], phi: [-0.35], 'v-cramer': [0.31],
    'razon-momios': [0.38, 1, 2.62, 9], kappa: [-0.1, 0.2, 0.56, 0.93], r2: [0.969, 0.01], 'r2-ajustada': [0.95, -0.02], cv: [3.5734, 12, 31.5],
    eficiencia: [160.2, 92], vif: [1.3, 7.2, 12.1], condicion: [3, 34.2], 'durbin-watson': [1.12, 2.01, 3.2], 'residuo-std': [2.6, -0.4], cook: [0.02, 1.2],
    asimetria: [1.3, -0.7, 0.2], heredabilidad: [0.72, 0.1], potencia: [0.65, 0.9], 'delta-aic': [0, 1.4, 12],
  };
  const ctxDe = id => ({ alfa: 0.05, n: 30, gl: 2, titulo: id === 'eficiencia' ? 'Eficiencia relativa frente a completamente al azar, %' : '' });
  SPT.caso('Coherencia texto-número: cada tarjeta cita su valor como el medidor y su zona', () => {
    for (const f of G().fichas()) {
      const e = G().escala(f.id, ctxDe(f.id));
      if (!e) continue;
      SPT.afirmar(VALORES[f.id], f.id + ': tiene valores de prueba');
      for (const v of VALORES[f.id]) {
        const t = G().interpretar(f.id, [{ valor: v, etiqueta: '' }], ctxDe(f.id)).join(' ');
        SPT.afirmar(t.length > 20 && !/undefined|NaN|\{\w+\}/.test(t), f.id + ' ' + v + ': ' + t);
        const fv = G().formatoDe(f.id), z = G().zona(f.id, v, ctxDe(f.id));
        const cita = [fv(v), fv(Math.abs(v)), v < 0.001 ? '< 0.001' : '= ' + v.toFixed(3)].some(x => t.indexOf(x) >= 0);
        SPT.afirmar(cita, f.id + ' ' + v + ' cita el valor: ' + t);
        /* la zona: su etiqueta, o lo que la sustituye (p ≥ α, κ < 0, ΔAIC = 0, η²H ≤ 0, DW cerca de 2; la R² y la eficiencia la dicen con sus cuentas) */
        const sustituye = { p: v >= 0.05, 'p-ajustado': v >= 0.05, kappa: v < 0, 'delta-aic': v === 0, 'eta2-h': v <= 0, 'r2-ajustada': true, r2: true, 'durbin-watson': v >= 1.5 && v <= 2.5, eficiencia: true }[f.id];
        SPT.afirmar(sustituye || t.indexOf(z.etiqueta) >= 0, f.id + ' ' + v + ' nombra su zona («' + z.etiqueta + '»): ' + t);
      }
    }
  });
  SPT.caso('Las cuentas de la tarjeta salen del valor: R², CV con su media, eficiencia, momios y VIF', () => {
    const t = (id, v, c) => G().interpretar(id, [{ valor: v, etiqueta: '' }], c || {}).join(' ');
    SPT.afirmar(/explica el 96\.9\s%.*el 3\.1\s% restante/.test(t('r2', 0.9692)), t('r2', 0.9692));
    SPT.afirmar(/error, 0\.212, es el 3\.57\s% de la media general, 5\.94/.test(t('cv', 3.5734, { media: 5.938 })), 'σ = CV × media / 100');
    SPT.afirmar(/completamente al azar habría hecho falta 1\.60 veces/.test(t('eficiencia', 160.2, { titulo: 'Eficiencia relativa frente a completamente al azar, %' })), 'ER / 100');
    SPT.afirmar(/\(62\s% menores\); se lee por su inversa, 2\.63/.test(t('razon-momios', 0.38)), '1 − OR y 1 / OR');
    SPT.afirmar(/su error estándar, 2\.68 veces/.test(t('vif', 7.2)), '√VIF');
    SPT.afirmar(/en el 2\.3\s% de las repeticiones/.test(t('p', 0.023)) && /en menos del 0\.1\s%/.test(t('p', 0.0004)), 'el p como porcentaje');
  });
  SPT.caso('Con varios valores: cuántos y cuáles caen en cada zona', () => {
    const p = G().interpretar('p', [{ valor: 1e-6, etiqueta: 'A' }, { valor: 0.003, etiqueta: 'B' }, { valor: 0.22, etiqueta: 'A × B' }], { alfa: 0.05 });
    SPT.igual(p[0], '2 de 3 con p < α = 0.05: A y B.'); SPT.igual(p[1], 'Sin evidencia suficiente (p ≥ α): A × B.');
    const r = G().interpretar('r', [{ valor: -0.72, etiqueta: 'a' }, { valor: 0.15, etiqueta: 'b' }, { valor: 0.41, etiqueta: 'c' }], {});
    SPT.igual(r[0], 'Por zona: grande: a (−0.720); mediano: c (0.410); pequeño: b (0.150).');
    const res = G().interpretar('residuo-std', [2.5, -3.2, 0.1, 0.4, -1].map((valor, i) => ({ valor, etiqueta: String(i + 1) })), {});
    SPT.igual(res[0], 'De 5 residuos, 2 pasan de ±2 y 1 de ±3: 2 (−3.20).');
    const ck = G().interpretar('cook', [0.01, 1.2, 0.2, 0.05].map((valor, i) => ({ valor, etiqueta: String(i + 1) })), { n: 40 });
    SPT.igual(ck.join(' '), 'De 4 observaciones, 2 pasan de 0.100, donde conviene revisarlas: 2 (1.20) y 3 (0.200). Una llega a 1: es influyente.');
  });
  SPT.caso('La frase de la curva: el valor frente al crítico', () => {
    SPT.igual(G().interpretarPrueba({ x: 1.47, criticos: [2.39], colas: 'derecha', p: 0.2198, alfa: 0.05 }), 'Antes del valor crítico 2.39: p = 0.220 ≥ α = 0.05.');
    SPT.igual(G().interpretarPrueba({ x: 60.6, criticos: [3.28], colas: 'derecha', p: 1e-12, alfa: 0.05 }), 'Más allá del valor crítico 3.28: p < 0.001 < α = 0.05.');
    SPT.igual(G().interpretarPrueba({ x: -2.5, criticos: [-2.23, 2.23], colas: 'dos', p: 0.031, alfa: 0.05 }), 'Fuera de los valores críticos ±2.23: p = 0.031 < α = 0.05.');
  });
});

SPT.describir('Registro · la guía del CV por cultivo y variable (hito 5.2)', () => {
  const zcv = (v, g) => SP.guias.zona('cv', v, { guiaCV: g }).etiqueta;
  SPT.caso('Maíz, rendimiento de grano (Fritsche-Neto et al., 2012, cuadro 2): los bordes publicados', () => {
    const g = { id: 'maiz-rendimiento' };
    SPT.igual(zcv(8.24, g), 'bajo (alta precisión)'); SPT.igual(zcv(8.25, g), 'medio'); SPT.igual(zcv(15.49, g), 'medio');
    SPT.igual(zcv(15.5, g), 'alto'); SPT.igual(zcv(19.11, g), 'alto'); SPT.igual(zcv(19.12, g), 'muy alto (baja precisión)');
    SPT.igual(SP.guias.escala('cv', { guiaCV: g }).fuenteCorta, 'Fritsche-Neto et al. (2012)');
    SPT.igualJSON(SP.guias.guiasCV().map(x => x.id), ['general', 'maiz-rendimiento', 'maiz-altura-planta', 'maiz-altura-mazorca', 'maiz-diametro-mazorca', 'maiz-mazorcas-planta', 'maiz-peso-mazorcas', 'maiz-peso-100']);
  });
  SPT.caso('La general sigue siendo la de Pimentel-Gomes, sin incluir el límite', () => {
    SPT.igual(zcv(9.99, null), 'bajo (alta precisión)'); SPT.igual(zcv(10, null), 'medio'); SPT.igual(zcv(30, null), 'muy alto (baja precisión)');
    SPT.igual(SP.guias.escala('cv', {}).max, 50);
  });
  SPT.caso('Garcia (1989): media − DE, media + DE y media + 2 DE de los CV de ensayos parecidos', () => {
    const r = SP.guias.limitesGarcia([12, 8, 15, 10, 20, 11, 9, 14]);
    SPT.igual(r.n, 8); SPT.cerca(r.media, 12.375, 1e-12); SPT.cerca(r.de, Math.sqrt(105.875 / 7), 1e-12);
    SPT.igualJSON(r.limites, [8.49, 16.26, 20.15]);
    SPT.igual(SP.guias.limitesGarcia([10, 12]), null, 'con dos CV no alcanza');
    SPT.igual(SP.guias.limitesGarcia([1, 1, 30]), null, 'media − DE negativa');
  });
  SPT.caso('Límites propios: se usan si son positivos y crecientes; si no, la general', () => {
    const g = { id: 'propia', cultivo: 'Frijol', variable: 'rendimiento', limites: [9, 18, 24] };
    SPT.igual(zcv(9, g), 'bajo (alta precisión)', 'los límites propios se incluyen'); SPT.igual(zcv(24.1, g), 'muy alto (baja precisión)');
    SPT.igual(SP.guias.escala('cv', { guiaCV: g }).fuenteCorta, 'Límites propios');
    SPT.igual(SP.guias.escala('cv', { guiaCV: Object.assign({}, g, { garcia: { n: 8, media: 12.4, de: 3.9 } }) }).fuenteCorta, 'Garcia (1989)');
    SPT.igual(SP.guias.guiaCV({ id: 'propia', limites: [9, 8, 24] }).id, 'general', 'no crecientes');
    SPT.igual(SP.guias.guiaCV({ id: 'otra' }).id, 'general');
  });
});

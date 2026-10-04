/* Pruebas de js/nucleo/asistente.js y js/nucleo/constructor.js: una por rama del árbol de decisión del asistente
   (con las de la Fase 2: conteos, proporciones, bloques aleatorios, medidas repetidas, curvas, superficies y varios
   ambientes),
   las heurísticas con que propone las respuestas, el paso de los papeles del constructor al método y su fórmula, y la
   lectura de fórmulas escritas a mano (con sus errores). Todo método que recomiendan existe en el registro. */
SPT.describir('Asistente y constructor de modelos', () => {
  let s = 29;
  const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tab = cols => {
    const tipos = {};
    for (const [k, v] of Object.entries(cols)) if (typeof v[0] === 'string') tipos[k] = { tipo: 'factor' };
    return SP.tabla.crear(cols, tipos);
  };
  /* factorial 3 híbridos × 3 dosis en 4 bloques, con una covariable y una escala de daño */
  const ensayo = () => {
    const c = { bloque: [], hibrido: [], dosis: [], plantas: [], dano: [], rend: [] };
    for (const b of ['I', 'II', 'III', 'IV']) for (const h of ['H1', 'H2', 'H3']) for (const d of [0, 60, 120]) {
      c.bloque.push(b); c.hibrido.push(h); c.dosis.push(d);
      c.plantas.push(100 + Math.round(az() * 20)); c.dano.push(1 + Math.floor(az() * 5)); c.rend.push(4 + d / 60 + az());
    }
    return tab(c);
  };
  const R = (t, r) => SP.asistente.recomendar(r || {}, SP.asistente.info(t));
  const existe = rec => {
    SPT.afirmar(rec.metodo && SP.metodos[rec.metodo], 'método recomendado inexistente: ' + rec.metodo);
    for (const d of rec.despues || []) SPT.afirmar(SP.metodos[d.metodo], 'paso siguiente inexistente: ' + d.metodo);
  };

  SPT.caso('info: tipos probables de las numéricas, dosis como factor y pares ligados', () => {
    const inf = SP.asistente.info(ensayo());
    SPT.igualJSON(inf.numFactor, ['dosis']);
    SPT.igual(inf.tipoNum.rend, 'continua');
    SPT.igual(inf.tipoNum.dano, 'ordinal');
    SPT.afirmar(inf.factores.includes('hibrido') && inf.factores.includes('dosis') && inf.factores.includes('bloque'));
    const t2 = tab({ lote: ['L1', 'L1', 'L2', 'L2', 'L3', 'L3', 'L4', 'L4'], sitio: ['S1', 'S1', 'S1', 'S1', 'S2', 'S2', 'S2', 'S2'], trat: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'], y: [1, 2, 3, 4, 5, 6, 7, 9] });
    const i2 = SP.asistente.info(t2);
    SPT.afirmar(i2.ligados.includes('lote|sitio') && i2.ligados.includes('sitio|lote'));
    SPT.afirmar(!i2.ligados.includes('lote|trat'));
    /* los factores que propone no incluyen dos que se determinan uno al otro */
    const x = SP.asistente.completar({}, i2);
    SPT.afirmar(!(x.factores.includes('lote') && x.factores.includes('sitio')), 'propuso un par ligado: ' + x.factores);
    const conteo = tab({ trat: ['A', 'A', 'B', 'B', 'C', 'C'], insectos: [0, 3, 5, 2, 8, 11] });
    SPT.igual(SP.asistente.info(conteo).tipoNum.insectos, 'conteo');
    const pct = tab({ trat: ['A', 'A', 'B', 'B'], germinacion: [85, 90, 72.5, 60] });
    SPT.igual(SP.asistente.info(pct).tipoNum.germinacion, 'proporcion');
  });

  SPT.caso('comparar: bloques al azar con dosis → curva (polinomios), Dunnett o Tukey', () => {
    const t = ensayo();
    const r = R(t);
    SPT.igual(r.metodo, 'dbca');
    SPT.igualJSON(r.e, { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' });
    SPT.igual(r.despues[0].metodo, 'polinomios');
    SPT.igualJSON(r.despues[0].e.comparar, ['dosis']);
    existe(r);
    const d = R(t, { interes: 'testigo' });
    SPT.igual(d.despues[0].metodo, 'comparaciones-medias');
    SPT.igual(d.despues[0].op.metodo, 'dunnett');
    SPT.igual(d.despues[0].op.testigo, '0');
    const k = R(t, { interes: 'todas' });
    SPT.igual(k.despues[0].op.metodo, 'tukey');
    const c = R(t, { factores: ['hibrido'], comparacion: 'planeados' });
    SPT.igual(c.despues[0].metodo, 'contrastes');
    SPT.igual(R(t, { bloques: 'no' }).metodo, 'dca');
    SPT.igual(R(t, { bloques: 'dos', fila: 'bloque', columna: 'dosis', factores: ['hibrido'] }).metodo, 'cuadro-latino');
  });

  SPT.caso('comparar: ANCOVA, parcelas divididas, subdivididas, franjas, en el tiempo, látice y BIB', () => {
    const t = ensayo();
    const a = R(t, { covariable: 'plantas' });
    SPT.igual(a.metodo, 'ancova');
    SPT.igualJSON(a.e, { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], covariables: ['plantas'], bloque: 'bloque' });
    existe(a);
    const pd = R(t, { parcelas: 'divididas', parcelaGrande: 'hibrido' });
    SPT.igual(pd.metodo, 'parcelas-divididas');
    SPT.igualJSON([pd.e.parcelaGrande, pd.e.subparcela, pd.e.principal, pd.e.bloque], ['hibrido', 'dosis', 'dbca', 'bloque']);
    existe(pd);
    const fr = R(t, { parcelas: 'franjas', parcelaGrande: 'dosis' });
    SPT.igual(fr.metodo, 'franjas');
    SPT.igualJSON([fr.e.franjaA, fr.e.franjaB], ['dosis', 'hibrido']);
    /* tres factores: subdivididas (con bloques) o el aviso de que faltan */
    const c = { bloque: [], riego: [], hibrido: [], dosis: [], rend: [] };
    for (const b of ['I', 'II', 'III']) for (const g of ['R1', 'R2']) for (const h of ['H1', 'H2']) for (const d of [0, 50, 100]) { c.bloque.push(b); c.riego.push(g); c.hibrido.push(h); c.dosis.push(d); c.rend.push(3 + az()); }
    const t3 = tab(c);
    const ps = R(t3, { factores: ['riego', 'hibrido', 'dosis'], parcelas: 'divididas', parcelaGrande: 'riego' });
    SPT.igual(ps.metodo, 'parcelas-subdivididas');
    SPT.igualJSON([ps.e.parcelaGrande, ps.e.subparcela, ps.e.subsubparcela], ['riego', 'hibrido', 'dosis']);
    SPT.igual(R(t3, { factores: ['riego', 'hibrido', 'dosis'], parcelas: 'divididas', parcelaGrande: 'riego', bloques: 'no' }).metodo, null);
    /* mediciones repetidas en el tiempo */
    const m = { bloque: [], trat: [], muestreo: [], y: [] };
    for (const b of ['I', 'II', 'III']) for (const tr of ['A', 'B', 'C']) for (const f of ['15 dds', '30 dds', '45 dds']) { m.bloque.push(b); m.trat.push(tr); m.muestreo.push(f); m.y.push(az() * 10); }
    const tt = R(tab(m), { factores: ['trat'], tiempo: 'si' });
    SPT.igual(tt.metodo, 'medidas-repetidas');
    SPT.igualJSON(tt.e, { respuesta: 'y', tiempo: 'muestreo', sujeto: 'bloque', tratamientos: ['trat'], bloque: 'bloque' });
    SPT.igual(tt.despues[0].metodo, 'parcelas-divididas');
    SPT.igualJSON([tt.despues[0].e.parcelaGrande, tt.despues[0].e.subparcela], ['trat', 'muestreo']);
    SPT.afirmar(tt.avisos.some(a => /motor R/.test(a)), 'falta el aviso del motor R');
    existe(tt);
    /* sin bloque ni otra columna que identifique la unidad: la aproximación clásica, con su aviso */
    const m2 = { trat: m.trat, muestreo: m.muestreo, y: m.y };
    const t2 = R(tab(m2), { factores: ['trat'], tiempo: 'si', bloques: 'no' });
    SPT.igual(t2.metodo, 'parcelas-divididas');
    SPT.afirmar(t2.avisos.length === 1, 'falta el aviso del modelo mixto');
    /* bloques incompletos */
    const bi = { rep: [], bloque: [], var: [], y: [] };
    for (const rp of ['R1', 'R2']) for (const bl of ['B1', 'B2', 'B3']) for (const v of ['V1', 'V2', 'V3']) { bi.rep.push(rp); bi.bloque.push(rp + bl); bi.var.push(v); bi.y.push(az()); }
    const tb = tab(bi);
    SPT.igual(R(tb, { factores: ['var'], bloques: 'incompletos', bloque: 'bloque', latice: 'no' }).metodo, 'bib');
    const la = R(tb, { factores: ['var'], bloques: 'incompletos', bloque: 'bloque', latice: 'si', repeticion: 'rep' });
    SPT.igual(la.metodo, 'latice');
    SPT.igual(la.e.repeticion, 'rep');
    existe(la);
  });

  SPT.caso('Fase 2: conteos y proporciones → modelo lineal generalizado; bloques aleatorios → modelo mixto', () => {
    const c = { bloque: [], trat: [], insectos: [], plantas: [], germinadas: [], sembradas: [], emergio: [] };
    for (const b of ['I', 'II', 'III', 'IV']) for (const tr of ['T1', 'T2', 'T3']) {
      c.bloque.push(b); c.trat.push(tr); c.insectos.push(Math.floor(az() * 12)); c.plantas.push(90 + Math.round(az() * 20));
      c.sembradas.push(50); c.germinadas.push(30 + Math.floor(az() * 15)); c.emergio.push(az() < 0.5 ? 0 : 1);
    }
    const t = tab(c);
    const g = R(t, { respuesta: 'insectos', tipoRespuesta: 'conteo', factores: ['trat'] });
    SPT.igual(g.metodo, 'glm-conteos');
    SPT.igualJSON(g.e, { respuesta: 'insectos', tratamientos: ['trat'], bloque: 'bloque' });
    SPT.igual(g.despues[0].metodo, 'glmm-bloques');
    existe(g);
    const gm = R(t, { respuesta: 'insectos', tipoRespuesta: 'conteo', factores: ['trat'], aleatorios: 'si' });
    SPT.igual(gm.metodo, 'glmm-bloques');
    SPT.igual(gm.op.familia, 'poisson');
    existe(gm);
    /* 0/1: binomial sin total; éxitos de n: con el total; porcentaje sin total: ANOVA con aviso */
    const b = R(t, { respuesta: 'emergio', factores: ['trat'] });
    SPT.igual(b.metodo, 'glm-proporciones');
    SPT.afirmar(!b.e.ensayos, 'con 0/1 no hay total');
    const p = R(t, { respuesta: 'germinadas', tipoRespuesta: 'proporcion', factores: ['trat'], ensayos: 'sembradas' });
    SPT.igual(p.metodo, 'glm-proporciones');
    SPT.igual(p.e.ensayos, 'sembradas');
    existe(p);
    const pa = R(t, { respuesta: 'germinadas', tipoRespuesta: 'proporcion', factores: ['trat'], ensayos: '' });
    SPT.igual(pa.metodo, 'dbca');
    SPT.afirmar(pa.avisos.some(a => /total/.test(a)), 'falta el aviso del total');
    /* bloques aleatorios con respuesta continua */
    const e = ensayo();
    const mb = R(e, { aleatorios: 'si' });
    SPT.igual(mb.metodo, 'mixto-bloques');
    SPT.igualJSON(mb.e, { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' });
    existe(mb);
    const md = R(e, { parcelas: 'divididas', parcelaGrande: 'hibrido', aleatorios: 'si' });
    SPT.igual(md.metodo, 'mixto-divididas');
    SPT.igualJSON([md.e.parcelaGrande, md.e.subparcela, md.e.bloque], ['hibrido', 'dosis', 'bloque']);
    const bi = { rep: [], bloque: [], var: [], y: [] };
    for (const rp of ['R1', 'R2']) for (const bl of ['B1', 'B2', 'B3']) for (const v of ['V1', 'V2', 'V3']) { bi.rep.push(rp); bi.bloque.push(rp + bl); bi.var.push(v); bi.y.push(az()); }
    const ml = R(tab(bi), { factores: ['var'], bloques: 'incompletos', bloque: 'bloque', latice: 'si', repeticion: 'rep', aleatorios: 'si' });
    SPT.igual(ml.metodo, 'mixto-latice');
    SPT.igualJSON(ml.e, { respuesta: 'y', tratamiento: 'var', repeticion: 'rep', bloque: 'bloque' });
    /* dosis numérica: también la curva con meseta */
    SPT.afirmar(R(e).despues.some(d => d.metodo === 'respuesta-meseta' && d.e.dosis === 'dosis' && d.e.grupo === 'hibrido'), 'falta la curva con meseta');
    /* las preguntas nuevas aparecen cuando tocan */
    const inf = SP.asistente.info(t), ids = r => SP.asistente.preguntas(r, inf).map(q => q.id);
    SPT.afirmar(ids({ respuesta: 'plantas', tipoRespuesta: 'continua', factores: ['trat'] }).includes('aleatorios'));
    SPT.afirmar(ids({ respuesta: 'germinadas', tipoRespuesta: 'proporcion', factores: ['trat'] }).includes('ensayos'));
    SPT.afirmar(!ids({ respuesta: 'emergio', factores: ['trat'] }).includes('ensayos'), 'con 0/1 no se pregunta el total');
    SPT.afirmar(ids({ respuesta: 'plantas', tipoRespuesta: 'continua', factores: ['trat'], bloques: 'no', tiempo: 'si' }).includes('sujeto'));
  });

  SPT.caso('Fase 2: genotipos en varios ambientes y curvas, superficies en relación', () => {
    const c = { ambiente: [], genotipo: [], repeticion: [], rendimiento: [] };
    for (const a of ['A1', 'A2', 'A3', 'A4']) for (const r of ['1', '2', '3']) for (const g of ['G1', 'G2', 'G3', 'G4', 'G5']) { c.ambiente.push(a); c.repeticion.push(r); c.genotipo.push(g); c.rendimiento.push(3 + az()); }
    const t = tab(c);
    SPT.igual(SP.asistente.completar({}, SP.asistente.info(t)).objetivo, 'ambientes');
    const r = R(t);
    SPT.igual(r.metodo, 'ensayos-multiambiente');
    SPT.igualJSON(r.e, { respuesta: 'rendimiento', genotipo: 'genotipo', ambiente: 'ambiente', repeticion: 'repeticion' });
    SPT.igualJSON(r.despues.map(d => d.metodo), ['estabilidad', 'ammi', 'gge', 'mixto-localidades']);
    existe(r);
    for (const [k, m] of [['estabilidad', 'estabilidad'], ['ammi', 'ammi'], ['gge', 'gge']]) SPT.igual(R(t, { interesMA: k }).metodo, m);
    const sin = R(t, { repMA: '' });
    SPT.afirmar(!sin.e.repeticion && sin.avisos.length === 1 && !sin.despues.some(d => d.metodo === 'mixto-localidades'));
    const inf = SP.asistente.info(t);
    SPT.igualJSON(SP.asistente.preguntas({}, inf).map(q => q.id), ['objetivo', 'respuesta', 'genotipo', 'ambiente', 'repMA', 'interesMA']);
    /* relación: curvas no lineales y superficie de respuesta */
    const d = { dosis: [], dds: [], N: [], K: [], y: [] };
    for (let i = 0; i < 20; i++) { d.dosis.push(i * 10); d.dds.push(i * 7); d.N.push([0, 60, 120, 180][i % 4]); d.K.push([0, 50, 100][i % 3]); d.y.push(az() * 10); }
    const td = tab(d);
    SPT.igual(R(td, { objetivo: 'relacion', y: 'y', predictores: ['dds'], forma: 'crecimiento' }).metodo, 'curva-crecimiento');
    SPT.igualJSON(R(td, { objetivo: 'relacion', y: 'y', predictores: ['dosis'], forma: 'dosis' }).e, { respuesta: 'y', dosis: 'dosis' });
    SPT.igual(R(td, { objetivo: 'relacion', y: 'y', predictores: ['dosis'], forma: 'meseta' }).metodo, 'respuesta-meseta');
    const su = R(td, { objetivo: 'relacion', y: 'y', predictores: ['N', 'K'], elegir: 'superficie' });
    SPT.igual(su.metodo, 'superficie-respuesta');
    SPT.igualJSON(su.e.factores, ['N', 'K']);
    existe(su);
  });

  SPT.caso('comparar: escalas ordenadas → rangos; dos grupos → t de Welch', () => {
    const t = ensayo();
    SPT.igual(R(t, { respuesta: 'dano', factores: ['hibrido'] }).metodo, 'friedman');
    SPT.igual(R(t, { respuesta: 'dano', factores: ['hibrido'], bloques: 'no' }).metodo, 'kruskal-wallis');
    const dos = tab({ trat: ['A', 'A', 'A', 'B', 'B', 'B'], y: [5.1, 4.8, 5.5, 6.2, 6.0, 6.9], dano: [1, 2, 2, 3, 4, 3] });
    const w = R(dos, { respuesta: 'dano' });
    SPT.igual(w.metodo, 'wilcoxon');
    const pt = R(dos, { respuesta: 'y' });
    SPT.igual(pt.metodo, 'prueba-t');
    SPT.igual(pt.op.varIguales, false);
    existe(pt);
    /* con escala ordenada y un diseño sin prueba de rangos, se avisa */
    SPT.afirmar(R(t, { respuesta: 'dano' }).avisos.length >= 1);
  });

  SPT.caso('relación: correlación, parcial, matriz, Spearman y las regresiones', () => {
    const c = { altitud: [], temperatura: [], lluvia: [], rendimiento: [] };
    for (let i = 0; i < 20; i++) { const a = 800 + 60 * i; c.altitud.push(a); c.temperatura.push(28 - a / 200 + az()); c.lluvia.push(1500 + 300 * az()); c.rendimiento.push(1 + a / 1000 + az()); }
    const t = tab(c);
    SPT.igual(SP.asistente.completar({}, SP.asistente.info(t)).objetivo, 'relacion');
    SPT.igual(R(t, { y: '', variables: ['altitud', 'rendimiento'] }).metodo, 'correlacion');
    const sp = R(t, { y: '', variables: ['altitud', 'rendimiento'], lineal: 'no' });
    SPT.igual(sp.op.metodo, 'spearman');
    const pc = R(t, { y: '', variables: ['temperatura', 'rendimiento'], controles: ['altitud'] });
    SPT.igual(pc.metodo, 'correlacion-parcial');
    SPT.igualJSON(pc.e.controles, ['altitud']);
    const mx = R(t, { y: '' });
    SPT.igual(mx.metodo, 'matriz-correlacion');
    SPT.igual(mx.op.ajuste, 'holm');
    SPT.igual(R(t, { objetivo: 'relacion', y: 'rendimiento', predictores: ['altitud'] }).metodo, 'regresion-lineal');
    SPT.igual(R(t, { objetivo: 'relacion', y: 'rendimiento', predictores: ['altitud'], forma: 'curva' }).metodo, 'regresion-polinomial');
    SPT.igual(R(t, { objetivo: 'relacion', y: 'rendimiento' }).metodo, 'regresion-lineal');
    SPT.igual(R(t, { objetivo: 'relacion', y: 'rendimiento', elegir: 'pasos' }).metodo, 'seleccion-pasos');
    const ms = R(t, { objetivo: 'relacion', y: 'rendimiento', elegir: 'subconjuntos' });
    SPT.igual(ms.metodo, 'mejores-subconjuntos');
    existe(ms);
  });

  SPT.caso('asociación: datos contados, pareados, evaluadores y estratos', () => {
    const mendel = tab({ forma: ['lisa', 'lisa', 'rugosa', 'rugosa'], color: ['amarilla', 'verde', 'amarilla', 'verde'], semillas: [315, 108, 101, 32] });
    const x = SP.asistente.completar({}, SP.asistente.info(mendel));
    SPT.igual(x.objetivo, 'asociacion');
    SPT.igual(x.frecuencia, 'semillas');
    const tc = R(mendel);
    SPT.igual(tc.metodo, 'tabla-contingencia');
    SPT.igualJSON(tc.e, { fila: 'forma', columna: 'color', frecuencia: 'semillas' });
    existe(tc);
    const niveles = ['0', '1', '2'];
    const ev = { evaluador_A: [], evaluador_B: [] }, pa = { antes: [], despues: [] };
    for (let i = 0; i < 30; i++) { const a = niveles[i % 3], b = niveles[(i + (i % 4 === 0 ? 1 : 0)) % 3]; ev.evaluador_A.push(a); ev.evaluador_B.push(b); pa.antes.push(a); pa.despues.push(b); }
    const k = R(tab(ev));
    SPT.igual(k.metodo, 'kappa');
    SPT.igual(k.despues[0].metodo, 'mcnemar');
    existe(k);
    SPT.igual(R(tab(pa)).metodo, 'mcnemar');
    const est = { lote: [], trat: [], germ: [] };
    for (const l of ['L1', 'L2', 'L3']) for (const tr of ['testigo', 'tratada']) for (const g of ['si', 'no']) { est.lote.push(l); est.trat.push(tr); est.germ.push(g); }
    const cmh = R(tab(est), { objetivo: 'asociacion', tipoAsoc: 'estratos', cat1: 'trat', cat2: 'germ' });
    SPT.igual(cmh.metodo, 'mantel-haenszel');
    SPT.igual(cmh.e.estrato, 'lote');
  });

  SPT.caso('Fase 3: tiempo hasta un evento, serie, varias respuestas, muestreo y planear', () => {
    const germ = tab({ trat: ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'], dias: [3, 5, 21, 4, 9, 21, 2, 3, 6], germino: [1, 1, 0, 1, 1, 0, 1, 1, 1], peso: [1.1, 0.9, 1.2, 1.0, 1.3, 0.8, 1.1, 1.0, 0.9] });
    let r = R(germ, { objetivo: 'tiempo' });
    existe(r); SPT.igual(r.metodo, 'kaplan-meier'); SPT.igual(r.e.evento, 'germino'); SPT.igual(r.e.tiempo, 'dias'); SPT.igual(r.e.grupo, 'trat');
    r = R(germ, { objetivo: 'tiempo', covEv: ['peso'] });
    existe(r); SPT.igual(r.metodo, 'cox'); SPT.igualJSON(r.e.covariables, ['peso']); SPT.igualJSON(r.e.factores, ['trat']);
    const serie = tab({ mes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], lluvia: [5, 8, 20, 60, 90, 120, 110, 100, 80, 30, 10, 4, 6, 9, 25, 70, 95, 118, 115, 98, 84, 28, 12, 5] });
    r = R(serie, { objetivo: 'serie' });
    existe(r); SPT.igual(r.metodo, 'tendencia'); SPT.igual(r.e.tiempo, 'mes'); SPT.igual(r.e.respuesta, 'lluvia');
    r = R(serie, { objetivo: 'serie', interesSerie: 'ciclo', frecSerie: '12' });
    existe(r); SPT.igual(r.metodo, 'descomposicion'); SPT.igual(r.op.frecuencia, 12);
    const t = ensayo();
    r = R(t, { objetivo: 'multivariado', respuestasMV: ['rend', 'plantas'], factores: ['hibrido'], bloqueMV: 'bloque' });
    existe(r); SPT.igual(r.metodo, 'manova'); SPT.igual(r.e.bloque, 'bloque');
    r = R(t, { objetivo: 'multivariado', interesMV: 'discriminante', respuestasMV: ['rend', 'plantas'], factores: ['hibrido'] });
    existe(r); SPT.igual(r.metodo, 'discriminante'); SPT.igual(r.e.grupo, 'hibrido');
    r = R(t, { objetivo: 'muestreo', respuesta: 'rend' });
    existe(r); SPT.igual(r.metodo, 'muestreo-simple');
    r = R(t, { objetivo: 'muestreo', respuesta: 'rend', estratoM: 'bloque' });
    existe(r); SPT.igual(r.metodo, 'muestreo-estratificado'); SPT.afirmar(r.avisos.length, 'pide escribir el tamaño de cada estrato');
    r = R(t, { objetivo: 'planear', respuesta: 'rend' });
    existe(r); SPT.igual(r.metodo, 'repeticiones'); SPT.afirmar(r.op.cv > 0 && r.op.cv < 100, 'CV de los datos: ' + r.op.cv);
    /* las preguntas de cada objetivo nuevo */
    const ids = o => SP.asistente.preguntas({ objetivo: o }, SP.asistente.info(germ)).map(p => p.id);
    SPT.igualJSON(ids('tiempo'), ['objetivo', 'tEvento', 'evento', 'grupoEv', 'covEv']);
    SPT.igualJSON(ids('muestreo'), ['objetivo', 'respuesta', 'estratoM']);
  });

  SPT.caso('describir y faltantes: al bloque Explorar, o la tarjeta de lo que falta', () => {
    const t = ensayo();
    const d = R(t, { objetivo: 'describir', factores: ['hibrido'] });
    SPT.igual(d.bloque, 3);
    SPT.igualJSON(d.e, { variables: ['rend'], grupos: ['hibrido'] });
    SPT.igual(R(t, { factores: [] }).metodo, null);
    const solo = tab({ trat: ['A', 'B', 'C', 'A'] });
    SPT.igual(R(solo, { objetivo: 'comparar' }).metodo, null);
  });

  SPT.caso('preguntas: solo las que tocan según las respuestas', () => {
    const t = ensayo(), inf = SP.asistente.info(t);
    const ids = r => SP.asistente.preguntas(r, inf).map(p => p.id);
    const a = ids({});
    for (const q of ['objetivo', 'respuesta', 'tipoRespuesta', 'factores', 'bloques', 'bloque', 'parcelas', 'covariable', 'interes']) SPT.afirmar(a.includes(q), 'falta ' + q);
    SPT.afirmar(!a.includes('tiempo'), 'con dos factores no se pregunta por el tiempo');
    const b = ids({ factores: ['hibrido'] });
    SPT.afirmar(!b.includes('parcelas') && b.includes('tiempo') && b.includes('comparacion'));
    const c = ids({ parcelas: 'divididas' });
    SPT.afirmar(c.includes('parcelaGrande') && !c.includes('covariable'));
    SPT.afirmar(ids({ bloques: 'dos' }).includes('fila'));
    SPT.afirmar(ids({ objetivo: 'asociacion', tipoAsoc: 'estratos' }).includes('estrato'));
    SPT.igualJSON(ids({ objetivo: 'describir' }), ['objetivo', 'respuesta', 'factores']);
    /* «hasta 3» factores */
    SPT.igual(SP.asistente.preguntas({}, inf).find(p => p.id === 'factores').max, 3);
  });

  SPT.caso('constructor: de los papeles al diseño, al método y a la fórmula', () => {
    const info = { numericas: ['rend', 'plantas', 'dosis'], factores: ['bloque', 'fila', 'columna', 'hibrido', 'riego', 'densidad', 'epoca'] };
    const M = r => SP.constructorModelos.modelo(r, info);
    SPT.igual(M({ respuesta: 'rend', covariables: ['plantas'] }).metodo, 'regresion-lineal');
    SPT.igual(M({ respuesta: 'rend', covariables: ['plantas'] }).formula, 'rend ~ plantas');
    const an = M({ respuesta: 'rend', factores: ['hibrido'], bloques: ['bloque'], covariables: ['plantas'] });
    SPT.igual(an.metodo, 'ancova');
    SPT.igualJSON(an.e, { respuesta: 'rend', tratamientos: ['hibrido'], covariables: ['plantas'], bloque: 'bloque' });
    SPT.igual(M({ respuesta: 'rend', factores: ['hibrido', 'riego'], bloques: ['bloque'] }).metodo, 'dbca');
    SPT.igual(M({ respuesta: 'rend', factores: ['hibrido'] }).metodo, 'dca');
    const cl = M({ respuesta: 'rend', factores: ['hibrido'], bloques: ['fila', 'columna'] });
    SPT.igual(cl.metodo, 'cuadro-latino');
    SPT.igualJSON([cl.e.fila, cl.e.columna], ['fila', 'columna']);
    const pd = M({ respuesta: 'rend', factores: ['riego', 'hibrido'], bloques: ['bloque'], parcelaGrande: 'riego' });
    SPT.igual(pd.metodo, 'parcelas-divididas');
    SPT.afirmar(/Error\(/.test(pd.formula), 'la fórmula de parcelas divididas lleva su estrato de error: ' + pd.formula);
    SPT.igual(M({ respuesta: 'rend', factores: ['riego', 'hibrido', 'dosis'], bloques: ['bloque'], parcelaGrande: 'riego' }).metodo, 'parcelas-subdivididas');
    /* lo que no es un diseño del catálogo va al modelo lineal general, con las numéricas de tratamiento como factor */
    const g = M({ respuesta: 'rend', factores: ['hibrido', 'riego', 'densidad', 'dosis'], bloques: ['bloque'] });
    SPT.igual(g.metodo, 'modelo-lineal');
    SPT.igual(g.op.derecha, 'bloque + hibrido * riego * densidad * dosis');
    SPT.igualJSON(g.op.comoFactor, ['dosis']);
    SPT.afirmar(g.avisos.length === 1);
    SPT.igual(M({ respuesta: 'rend', factores: ['hibrido'], bloques: ['bloque'], covariables: ['plantas', 'dosis'] }).metodo, 'ancova');
    SPT.igual(M({ respuesta: 'rend', factores: ['riego', 'hibrido'], bloques: ['bloque'], parcelaGrande: 'riego', covariables: ['plantas'] }).metodo, 'modelo-lineal');
    /* errores con su arreglo */
    SPT.afirmar(M({ factores: ['hibrido'] }).error);
    SPT.afirmar(M({ respuesta: 'rend' }).error);
    const sinB = M({ respuesta: 'rend', factores: ['riego', 'hibrido'], parcelaGrande: 'riego' });
    SPT.afirmar(sinB.error && sinB.error.arreglo, 'parcelas sin bloques deben decir cómo arreglarlo');
    SPT.afirmar(M({ respuesta: 'rend', factores: ['hibrido'], bloques: ['bloque', 'fila', 'columna'] }).error);
    /* nombres con espacios van entre comillas invertidas */
    const raro = SP.constructorModelos.modelo({ respuesta: 'peso seco', factores: ['hibrido'] }, { numericas: ['peso seco'], factores: ['hibrido'] });
    SPT.afirmar(/^`peso seco` ~/.test(raro.formula), raro.formula);
  });

  SPT.caso('constructor, Fase 2: efectos aleatorios y respuestas de conteo o gamma', () => {
    const info = { numericas: ['rend', 'insectos'], factores: ['bloque', 'hibrido', 'riego', 'localidad'] };
    const M = r => SP.constructorModelos.modelo(r, info);
    const mx = M({ respuesta: 'rend', factores: ['hibrido'], aleatorios: ['bloque'] });
    SPT.igual(mx.metodo, 'modelo-mixto');
    SPT.igual(mx.formula, 'rend ~ hibrido + (1 | bloque)');
    const pd = M({ respuesta: 'rend', factores: ['riego', 'hibrido'], parcelaGrande: 'riego', aleatorios: ['bloque'] });
    SPT.igual(pd.op.derecha, 'riego * hibrido + (1 | bloque) + (1 | bloque:riego)');
    const gl = M({ respuesta: 'insectos', factores: ['hibrido'], bloques: ['bloque'], familia: 'conteo' });
    SPT.igual(gl.metodo, 'glm');
    SPT.igual(gl.op.familia, 'poisson');
    SPT.igual(gl.op.derecha, 'bloque + hibrido');
    const gm = M({ respuesta: 'insectos', factores: ['hibrido'], aleatorios: ['localidad', 'bloque'], familia: 'conteo' });
    SPT.igual(gm.metodo, 'glmm');
    SPT.igual(gm.op.derecha, 'hibrido + (1 | localidad) + (1 | bloque)');
    SPT.afirmar(M({ respuesta: 'rend', factores: ['hibrido'], aleatorios: ['bloque'], familia: 'gamma' }).error, 'gamma mixto no existe');
    SPT.afirmar(M({ respuesta: 'insectos', factores: ['riego', 'hibrido'], parcelaGrande: 'riego', bloques: ['bloque'], familia: 'conteo' }).error, 'parcela grande pide el bloque aleatorio');
    for (const m of [mx, gl, gm]) SPT.afirmar(SP.metodos[m.metodo], m.metodo);
    const lec = SP.constructorModelos.interpretar('rend', 'hibrido + (1 | bloque)', info);
    SPT.afirmar(lec.ok && lec.aleatorios === 1 && /varianza/.test(lec.terminos[1].explicacion), JSON.stringify(lec));
    SPT.afirmar(!SP.constructorModelos.interpretar('rend', 'hibrido + (1 | parcela)', info).ok, 'columna inexistente');
  });

  SPT.caso('fórmulas escritas: cada término explicado y los errores con su arreglo', () => {
    const info = { numericas: ['rend', 'plantas', 'dosis'], factores: ['bloque', 'hibrido', 'parcela'] };
    const I = (d, cf) => SP.constructorModelos.interpretar('rend', d, info, cf);
    const a = I('bloque + hibrido * plantas');
    SPT.afirmar(a.ok);
    SPT.igualJSON(a.terminos.map(x => x.etiqueta), ['bloque', 'hibrido', 'plantas', 'hibrido × plantas']);
    SPT.afirmar(/pendiente/.test(a.terminos[2].explicacion) && /pendiente de «plantas» distinta/.test(a.terminos[3].explicacion));
    const n = I('hibrido / parcela');
    SPT.afirmar(n.ok && /anidado/.test(n.terminos[1].explicacion), JSON.stringify(n.terminos));
    const f = I('hibrido * dosis', ['dosis']);
    SPT.afirmar(/factor/.test(f.terminos[1].explicacion) && /interacción/.test(f.terminos[2].explicacion));
    SPT.igual(I('(bloque + hibrido + dosis)^2', ['dosis']).terminos.length, 6);
    SPT.igual(I('hibrido - 1').intercepto, false);
    SPT.afirmar(/superficie/.test(I('plantas * dosis').terminos[2].explicacion));
    /* errores */
    SPT.afirmar(!I('hibrido + nitrogeno').ok && /nitrogeno/.test(I('hibrido + nitrogeno').mensaje));
    SPT.afirmar(!I('hibrido + rend').ok);
    SPT.afirmar(!I('log(plantas) + hibrido').ok);
    SPT.afirmar(!I('hibrido + Error(bloque)').ok);
    SPT.afirmar(!I('hibrido +').ok);
  });

  SPT.caso('modelo lineal general: el mismo ANOVA que bloques al azar y avisos de lo que no se puede', () => {
    const t = ensayo();
    const ml = SP.modeloLineal.analizar(t, { respuesta: 'rend' }, { derecha: 'bloque + hibrido * dosis', comoFactor: ['dosis'], tipoSC: 3 });
    const db = SP.lineal.anova(SP.tabla.crear({ rend: Array.from(t.col('rend').valores), bloque: Array.from(t.col('bloque').codigos, k => t.col('bloque').niveles[k]),
      hibrido: Array.from(t.col('hibrido').codigos, k => t.col('hibrido').niveles[k]), dosis: Array.from(t.col('dosis').valores, String) }, { bloque: { tipo: 'factor' }, hibrido: { tipo: 'factor' }, dosis: { tipo: 'factor', niveles: ['0', '60', '120'] } }),
      'rend ~ bloque + hibrido * dosis', { tipo: 3 });
    SPT.igualJSON(ml.anova.gl, db.gl.filter((_, k) => db.fuente[k] !== '(Intercepto)'));
    ml.anova.sc.forEach((v, k) => SPT.cerca(v, db.sc.filter((_, j) => db.fuente[j] !== '(Intercepto)')[k], 1e-10));
    SPT.igualJSON(ml.celdas.factores, ['hibrido', 'dosis']);
    SPT.igualJSON(ml.medias.map(m => m.factor), ['bloque', 'hibrido', 'dosis']);
    /* sin intercepto: tipo I, con aviso */
    const s1 = SP.modeloLineal.analizar(t, { respuesta: 'rend' }, { derecha: 'hibrido - 1', tipoSC: 3 });
    SPT.igual(s1.tipoSC, 1);
    SPT.afirmar(s1.avisos.length >= 1);
    /* la respuesta a la derecha no pasa la validación */
    SPT.lanza(() => SP.ejecutar('modelo-lineal', t, { respuesta: 'rend' }, { derecha: 'hibrido + rend' }));
    SPT.lanza(() => SP.ejecutar('modelo-lineal', t, { respuesta: 'rend' }, { derecha: 'hibrido', tipoSC: 4 }));
    const rep = SP.metodos['modelo-lineal'].reporte(ml);
    SPT.afirmar(rep.cuadros.some(c => c.id === 'anova') && rep.cuadros.some(c => c.id === 'coeficientes'));
    SPT.afirmar(/factor\(datos\$dosis\)/.test(SP.metodos['modelo-lineal'].codigoR({ respuesta: 'rend' }, { derecha: 'bloque + hibrido * dosis', comoFactor: ['dosis'], tipoSC: 3 })));
  });
});

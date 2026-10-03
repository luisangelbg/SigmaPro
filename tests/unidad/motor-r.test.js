/* Pruebas de las piezas puras del motor R (js/nucleo/motor-r.js) y del modelo mixto (js/metodos/mixtos.js): no
   necesitan R. La salida de R que se lee aquí la escribió .sp_json en el R de escritorio (la misma función que se
   define en el motor); los casos contra R del modelo mixto se corren aparte con node tests/motor-r.mjs. */
SPT.describir('Motor R · piezas puras', () => {
  SPT.caso('leerSalida: valores especiales, matrices, data.frames, vectores con nombre y listas', () => {
    const texto = '{"a":1.5,"b":[1,{"$n":"NA"},{"$n":"Inf"},{"$n":"-Inf"},{"$n":"NaN"}],"txt":["x\\"y",null],"lg":[true,null],' +
      '"m":{"$m":[2,3],"v":[1,2,3,4,5,6],"dn":[["r1","r2"],["A","B","C"]]},"nv":{"$nv":["uno","dos"],"v":[1,2]},' +
      '"df":{"$df":["f","y"],"filas":null,"c":[["a","b"],[0.10000000000000001,{"$n":"NA"}]]},"vacio":[],"nulo":null,' +
      '"lrep":{"$l":["a","a"],"v":[1,2]},"l":[1,"a"],"negcero":-0}';
    const o = SP.motorR.leerSalida(texto);
    SPT.igual(o.a, 1.5);
    SPT.afirmar(o.b[0] === 1 && Number.isNaN(o.b[1]) && o.b[2] === Infinity && o.b[3] === -Infinity && Number.isNaN(o.b[4]), 'especiales');
    SPT.igualJSON(o.txt, ['x"y', null]);
    SPT.igualJSON(o.lg, [true, null]);
    SPT.igualJSON(o.m, { filas: ['r1', 'r2'], columnas: ['A', 'B', 'C'], valores: [[1, 3, 5], [2, 4, 6]] });
    SPT.igualJSON(o.nv, { nombres: ['uno', 'dos'], valores: [1, 2] });
    SPT.igual(o.df.datos.y[0], 0.1);
    SPT.afirmar(Number.isNaN(o.df.datos.y[1]) && o.df.filas === null && o.df.columnas.join() === 'f,y', 'data.frame');
    SPT.igualJSON(o.vacio, []);
    SPT.igual(o.nulo, null);
    SPT.igualJSON(o.lrep, { nombres: ['a', 'a'], valores: [1, 2] });
    SPT.igualJSON(o.l, [1, 'a']);
    SPT.afirmar(Object.is(o.negcero, -0), 'cero negativo');
  });

  SPT.caso('nombreR y textoR: nombres válidos tal cual, los demás entre comillas invertidas', () => {
    SPT.igual(SP.motorR.nombreR('rend'), 'rend');
    SPT.igual(SP.motorR.nombreR('rend.kg_ha'), 'rend.kg_ha');
    SPT.igual(SP.motorR.nombreR('mi var'), '`mi var`');
    SPT.igual(SP.motorR.nombreR('if'), '`if`');
    SPT.igual(SP.motorR.nombreR('2x'), '`2x`');
    SPT.igual(SP.motorR.nombreR('a`b'), '`a\\`b`');
    SPT.igual(SP.motorR.textoR('dice "hola"\n'), '"dice \\"hola\\"\\n"');
  });

  SPT.caso('columnas: numéricas tal cual (NaN = NA en R) y factores como códigos con sus niveles en orden', () => {
    const t = SP.tabla.crear({ y: [1.5, NaN, 3], g: ['b', null, 'a'] }, { g: { tipo: 'factor', niveles: ['b', 'a'] } });
    const env = SP.motorR.columnas(t, ['y', 'g', 'y']);
    SPT.igualJSON(env['.sp_nombres'], ['y', 'g']);
    SPT.igualJSON(env['.sp_tipos'], ['numerica', 'factor']);
    SPT.afirmar(env['.sp_v1'][0] === 1.5 && Number.isNaN(env['.sp_v1'][1]), 'numérica');
    SPT.igualJSON(env['.sp_v2'], [0, -1, 1]);
    SPT.igualJSON(env['.sp_n2'], ['b', 'a']);
    SPT.lanza(() => SP.motorR.columnas(t, []), 'ninguna columna');
  });

  SPT.caso('envolver: arma «datos» y devuelve el JSON del resultado', () => {
    const c = SP.motorR.envolver('list(n = nrow(datos))');
    SPT.afirmar(c.includes('.sp_armar(environment())') && c.includes('.sp_correr(quote({') && c.includes('list(n = nrow(datos))'), c);
  });
});

SPT.describir('Diseños con efectos aleatorios · fórmulas', () => {
  const n = 24, c = f => Array.from({ length: n }, (_, i) => f(i));
  const t = () => SP.tabla.crear({ y: c(i => i % 7 + 1.5), a: c(i => 'a' + (i % 2)), b: c(i => 'b' + (i % 3)), bl: c(i => 1 + Math.floor(i / 6)), dosis: c(i => [0, 50][i % 2]),
    rep: c(i => 'r' + (i % 3)), blq: c(i => 'k' + (i % 4)), loc: c(i => 'L' + (i % 2)) }, { a: { tipo: 'factor' }, b: { tipo: 'factor' }, rep: { tipo: 'factor' }, blq: { tipo: 'factor' }, loc: { tipo: 'factor' } });
  const formula = (id, e, op) => { const f = SP.metodos[id], o = SP.opcionesCon(f, op || {}); f.validar(t(), e, o); return f.preparar(t(), e, o).codigo.split('\n').find(x => x.startsWith('modelo <-')); };
  SPT.caso('cada diseño arma su fórmula; los tratamientos numéricos van como factor', () => {
    SPT.igual(formula('mixto-bloques', { respuesta: 'y', tratamientos: ['a', 'dosis'], bloque: 'bl' }), 'modelo <- lmer(y ~ a * dosis + (1 | bl), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-divididas', { respuesta: 'y', parcelaGrande: 'a', subparcela: 'b', bloque: 'bl' }), 'modelo <- lmer(y ~ a * b + (1 | bl) + (1 | bl:a), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-divididas', { respuesta: 'y', parcelaGrande: 'a', subparcela: 'b', repeticion: 'rep' }), 'modelo <- lmer(y ~ a * b + (1 | a:rep), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-latice', { respuesta: 'y', tratamiento: 'a', repeticion: 'rep', bloque: 'blq' }), 'modelo <- lmer(y ~ a + rep + (1 | rep:blq), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-latice', { respuesta: 'y', tratamiento: 'a', repeticion: 'rep', bloque: 'blq' }, { repeticionAleatoria: true }), 'modelo <- lmer(y ~ a + (1 | rep) + (1 | rep:blq), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-localidades', { respuesta: 'y', genotipo: 'a', localidad: 'loc', repeticion: 'rep' }), 'modelo <- lmer(y ~ a + (1 | loc) + (1 | loc:rep) + (1 | a:loc), data = datos, REML = TRUE)');
    SPT.igual(formula('mixto-localidades', { respuesta: 'y', genotipo: 'a', localidad: 'loc', repeticion: 'rep' }, { localidadFija: true }), 'modelo <- lmer(y ~ a * loc + (1 | loc:rep), data = datos, REML = TRUE)');
    const f = SP.metodos['mixto-bloques'], p = f.preparar(t(), { respuesta: 'y', tratamientos: ['a', 'dosis'], bloque: 'bl' }, SP.opcionesCon(f, {}));
    SPT.afirmar(p.codigo.includes('datos[["dosis"]] <- factor(datos[["dosis"]])') && p.codigo.includes('medias <- lapply(c("a", "dosis")'), p.codigo);
  });
  SPT.caso('los papeles se validan: columnas distintas, bloques o repetición en parcelas divididas', () => {
    const v = (id, e) => () => SP.metodos[id].validar(t(), e, SP.opcionesCon(SP.metodos[id], {}));
    SPT.lanza(v('mixto-bloques', { respuesta: 'y', tratamientos: ['a'], bloque: 'a' }), 'columna distinta');
    SPT.lanza(v('mixto-bloques', { respuesta: 'y', tratamientos: [], bloque: 'bl' }), 'de uno a tres');
    SPT.lanza(v('mixto-divididas', { respuesta: 'y', parcelaGrande: 'a', subparcela: 'b' }), 'bloques o');
    SPT.lanza(v('mixto-latice', { respuesta: 'y', tratamiento: 'a', repeticion: 'rep' }), 'bloque incompleto');
  });
});

SPT.describir('Modelo mixto · fórmula y trabajo para R', () => {
  const t = () => SP.tabla.crear({ y: [1, 2, 3, 4, 5, 6, 7, 8], trat: ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'], bloque: [1, 1, 2, 2, 3, 3, 4, 4], dias: [0, 1, 0, 1, 0, 1, 0, 1], 'mi var': [1, 2, 3, 4, 5, 6, 7, 8] },
    { trat: { tipo: 'factor' } });
  const op = derecha => SP.opcionesCon(SP.metodos['modelo-mixto'], { derecha });

  SPT.caso('separar: los términos aleatorios salen de la fórmula; lo demás son los fijos', () => {
    const s = SP.mixtos.separar('trat * dias + (1 | bloque) + (dias || bloque) + (1 | bloque/trat)');
    SPT.igual(s.fijos, 'trat * dias');
    SPT.igualJSON(s.aleatorios.map(a => a.texto), ['(1 | bloque)', '(dias || bloque)', '(1 | bloque/trat)']);
    SPT.igualJSON(s.aleatorios[2].agrupan, ['bloque', 'trat']);
    SPT.igual(s.aleatorios[1].doble, true);
    SPT.igual(SP.mixtos.separar('(1|bloque)').fijos, '');
    SPT.igual(SP.mixtos.separar('`mi var` + (1 + `mi var` | bloque)').aleatorios[0].variables.join(), 'mi var');
    SPT.lanza(() => SP.mixtos.separar('trat + (1 | bloque'), 'cerrar un paréntesis');
    SPT.lanza(() => SP.mixtos.separar('trat + ( | bloque)'), 'Falta lo que varía');
  });

  SPT.caso('preparar: código de lmerTest, columnas y factores; los agrupamientos numéricos se vuelven factor', () => {
    const p = SP.metodos['modelo-mixto'].preparar(t(), { respuesta: 'y' }, op('trat + (1 | bloque)'));
    SPT.igualJSON(p.columnas, ['y', 'trat', 'bloque']);
    SPT.afirmar(p.codigo.includes('datos[["bloque"]] <- factor(datos[["bloque"]])'), 'bloque como factor');
    SPT.afirmar(p.codigo.includes('modelo <- lmer(y ~ trat + (1 | bloque), data = datos, REML = TRUE)'), p.codigo);
    SPT.afirmar(p.codigo.includes('anova(modelo, type = 3, ddf = ddf)') && p.codigo.includes('ddf <- "Satterthwaite"'), 'tipo III con Satterthwaite');
    SPT.igualJSON(p.paquetes, ['emmeans']);
    SPT.afirmar(p.codigo.includes('medias <- lapply(c("trat"), function(f) {') && p.codigo.includes('lmer.df = "satterthwaite"') && p.codigo.includes('adjust = "tukey"'), 'medias de trat');
    SPT.afirmar(p.codigo.includes('rv <- tryCatch(as.data.frame(ranova(modelo))') && p.codigo.includes('ranef(modelo, condVar = TRUE)'), 'ranova y BLUP');
    const sin = SP.metodos['modelo-mixto'].preparar(t(), { respuesta: 'y' }, Object.assign(op('trat + (1 | bloque)'), { comparar: [], pruebaAleatorios: false }));
    SPT.afirmar(!sin.codigo.includes('emmeans') && sin.codigo.includes('ranova = NULL'), 'sin medias ni ranova');
    const kr = SP.metodos['modelo-mixto'].preparar(t(), { respuesta: 'y' }, Object.assign(op('`mi var` + (1 | bloque)'), { gl: 'kenward-roger', tipoSC: 1 }));
    SPT.afirmar(kr.codigo.includes('lmer(y ~ `mi var` + (1 | bloque)') && kr.codigo.includes('ddf <- "Kenward-Roger"') && kr.codigo.includes('type = 1'), kr.codigo);
    SPT.igualJSON(kr.paquetes, ['pbkrtest']);
  });

  SPT.caso('validar: pide un efecto aleatorio, columnas que existan y REML con Kenward-Roger', () => {
    const v = (d, extra) => () => SP.metodos['modelo-mixto'].validar(t(), { respuesta: 'y' }, Object.assign(op(d), extra || {}));
    SPT.lanza(v('trat + bloque'), 'al menos un efecto aleatorio');
    SPT.lanza(v('trat + (1 | lote)'), 'No existe la columna');
    SPT.lanza(v('y + (1 | bloque)'), 'respuesta no puede');
    SPT.lanza(v('trat + (1 | bloque)', { gl: 'kenward-roger', reml: false }), 'Kenward-Roger necesita');
    v('trat + (1 | bloque)')();
  });

  SPT.caso('leer: arreglos aunque R dé un solo valor; avisos de lme4 traducidos', () => {
    const salida = { anova: { termino: 'trat', sc: 2, cm: 2, gl1: 1, gl2: 3, F: 4, p: 0.14 }, coeficientes: { nombre: ['(Intercept)', 'tratb'], estimado: [4, 1], ee: [1, 0.5], gl: [3, 3], t: [4, 2], p: [0.03, 0.14] },
      varianzas: { grupo: ['bloque', 'Residual'], var1: ['(Intercept)', null], var2: [null, null], varianza: [1, 3], de: [1, Math.sqrt(3)] },
      ajuste: { n: 8, reml: true, logLik: -10, AIC: 28, BIC: 28.3, singular: false }, grupos: { nombre: 'bloque', niveles: 4 }, residuos: [0.1, -0.1], ajustados: [1, 2], versiones: { R: '4.6.0' } };
    const r = SP.metodos['modelo-mixto'].leer(salida, ['boundary (singular) fit: see help(\'isSingular\')'], t(), { respuesta: 'y' }, op('trat + (1 | bloque)'));
    SPT.igualJSON(r.anova.termino, ['trat']);
    SPT.igualJSON(r.grupos.niveles, [4]);
    SPT.igual(r.n, 8);
    SPT.afirmar(/Ajuste singular/.test(r.avisos[0]), r.avisos[0]);
    const rep = SP.metodos['modelo-mixto'].reporte(r);
    SPT.afirmar(rep.conclusiones.some(x => /Variación aleatoria: bloque 25\.0 %, residual 75\.0 %/.test(x)), rep.conclusiones.join(' | '));
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['anova', 'varianzas', 'coeficientes', 'ajuste']);
    SPT.afirmar(rep.semaforo.some(s => s.nombre === 'Ajuste del modelo' && s.color === 'ambar'), 'semáforo con el ajuste singular');
  });

  SPT.caso('leer: medias de emmeans con sus pares, letras (la «a» para la mayor), ranova y BLUP', () => {
    const salida = { anova: {}, coeficientes: {}, varianzas: { grupo: ['bloque', 'Residual'], var1: ['(Intercept)', null], var2: [null, null], varianza: [1, 3], de: [1, 1.7] },
      ajuste: { n: 8, reml: true }, grupos: { nombre: ['bloque'], niveles: [4] },
      medias: [{ factor: 'trat', medias: { datos: { trat: ['a', 'b'], emmean: [4, 5.5], SE: [0.5, 0.5], df: [3, 3], 'lower.CL': [2.4, 3.9], 'upper.CL': [5.6, 7.1] } },
        pares: { datos: { contrast: ['a - b'], estimate: [-1.5], SE: [0.4], df: [3], 't.ratio': [-3.75], 'p.value': [0.033] } } }],
      ranova: { termino: ['<none>', '(1 | bloque)'], npar: [4, 3], logLik: [-10, -12], AIC: [28, 30], LRT: [NaN, 4], gl: [NaN, 1], p: [NaN, 0.0455] },
      blup: { grupo: ['bloque', 'bloque', 'bloque', 'bloque'], termino: ['(Intercept)', '(Intercept)', '(Intercept)', '(Intercept)'], nivel: ['1', '2', '3', '4'], valor: [-1, 0.5, 0.2, 0.3], de: [0.4, 0.4, 0.4, 0.4] },
      filas: [1, 2, 3, 4, 5, 6, 7, 8], residuos: [0.1, -0.2, 0.3, -0.1, 0.05, -0.15, 0.2, -0.2], ajustados: [1, 2, 3, 4, 5, 6, 7, 8] };
    const r = SP.metodos['modelo-mixto'].leer(salida, [], t(), { respuesta: 'y' }, op('trat + (1 | bloque)'));
    SPT.igualJSON(r.medias[0].filas.map(f => f.letras), ['b', 'a']);
    SPT.igual(r.medias[0].pares[0].a, 'a'); SPT.igual(r.medias[0].pares[0].b, 'b');
    SPT.igual(r.ranova.termino[1], '(1 | bloque)');
    SPT.igual(r.blup.valor.length, 4);
    SPT.afirmar(r.supuestos.normalidad && r.supuestos.varianzas && r.supuestos.varianzas.factor === 'trat', 'Shapiro-Wilk y Levene sobre los residuos');
    const ids = SP.metodos['modelo-mixto'].reporte(r).cuadros.map(c => c.id);
    SPT.igualJSON(ids, ['anova', 'varianzas', 'aleatorios', 'medias-trat', 'pares-trat', 'coeficientes', 'blup', 'ajuste']);
  });
});

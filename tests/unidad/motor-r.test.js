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
    SPT.igualJSON(p.paquetes, []);
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
  });
});

/* Pruebas de las piezas puras del modelo lineal generalizado mixto (js/metodos/glmm.js): el código que se manda al motor
   R, la lectura de su salida y los mensajes de error. Los casos contra R se corren aparte con node tests/motor-r.mjs. */
SPT.describir('GLMM · trabajo para R', () => {
  const tabla = () => SP.tabla.crear({ y: [3, 5, 2, 8, 6, 4, 9, 7], n: [10, 10, 10, 10, 10, 10, 10, 10], area: [1, 2, 1, 2, 1, 2, 1, 2], t: ['a', 'b', 'a', 'b', 'a', 'b', 'a', 'b'], b: [1, 1, 2, 2, 3, 3, 4, 4] },
    { t: { tipo: 'factor' } });
  const f = id => SP.metodos[id];
  SPT.caso('Binomial con ensayos, efecto por observación automático, Wald tipo II y medias', () => {
    const op = SP.opcionesCon(f('glmm-bloques'), { familia: 'binomial', enlace: 'probit' });
    const p = f('glmm-bloques').preparar(tabla(), { respuesta: 'y', ensayos: 'n', tratamientos: ['t'], bloque: 'b' }, op);
    SPT.afirmar(p.codigo.includes('glmer(f, family = binomial(link = "probit")'), 'familia y enlace');
    SPT.afirmar(p.codigo.includes('cbind(y, n - y) ~ t + (1 | b)'), 'fórmula con ensayos y bloque');
    SPT.afirmar(p.codigo.includes('tolPwrss = 1e-12') && p.codigo.includes('rhoend = 1e-12'), 'control estricto');
    SPT.afirmar(p.codigo.includes('m0 <- ajusta(forma(FALSE), nAGQ = nq)') && p.codigo.includes('usaObs <- prueba$p < 0.05'), 'prueba de Pearson');
    SPT.afirmar(p.codigo.includes('car::Anova(modelo, type = 2, vcov. = V)') && p.codigo.includes('V <- vc_(modelo)') && p.codigo.includes('isSingular(x)'), 'Wald con la hessiana o RX si es singular');
    SPT.afirmar(p.codigo.includes('requireNamespace("car")'), 'car en silencio');
    SPT.afirmar(p.codigo.includes('datos[["b"]] <- factor(datos[["b"]])'), 'bloque numérico como factor');
    SPT.afirmar(p.codigo.includes('emmeans(modelo, specs = fc, offset = 0, data = datos, vcov. = V)'), 'medias');
    SPT.igualJSON(p.columnas.slice().sort(), ['b', 'n', 't', 'y']);
  });
  SPT.caso('Binomial negativa con exposición y tipo III: glmer.nb, RX, desplazamiento y suma cero', () => {
    const op = SP.opcionesCon(f('glmm'), { familia: 'binomial-negativa', derecha: 't + (1 | b)', tipo: 3 });
    const p = f('glmm').preparar(tabla(), { respuesta: 'y', exposicion: 'area' }, op);
    SPT.afirmar(p.codigo.includes('glmer.nb(f, data = datos, control = ctl, contrasts = contrastes, nAGQ = nAGQ)'), 'glmer.nb');
    SPT.afirmar(p.codigo.includes('as.matrix(if (TRUE) suppressWarnings(vcov(x, use.hessian = FALSE))'), 'RX en la binomial negativa');
    SPT.afirmar(p.codigo.includes('+ offset(log(area))'), 'desplazamiento');
    SPT.afirmar(p.codigo.includes('contr.sum') && p.codigo.includes('type = 3'), 'tipo III con suma cero');
    SPT.afirmar(p.codigo.includes('usaObs <- FALSE') && !p.codigo.includes('m0 <-'), 'sin efecto por observación');
    SPT.afirmar(p.codigo.includes('glmer.nb.theta'), 'θ');
  });
  SPT.caso('Mensajes de error', () => {
    const t = tabla();
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'binomial' })), '0 o 1');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', ensayos: 'n', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'poisson' })), 'ensayos solo se usa');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'cuasipoisson' })), 'no válida');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'] }, SP.opcionesCon(f('glmm-bloques'), {})), 'bloques');
    SPT.lanza(() => f('glmm').validar(t, { respuesta: 'y' }, SP.opcionesCon(f('glmm'), { derecha: 't' })), 'al menos un efecto aleatorio');
    SPT.lanza(() => f('glmm').validar(SP.tabla.crear({ y: [1, 2, 3, 4], e: [1, 0, 1, 1], g: [1, 1, 2, 2] }, {}), { respuesta: 'y', exposicion: 'e' }, SP.opcionesCon(f('glmm'), { derecha: '1 + (1 | g)' })), 'positiva');
    /* Hito 4.3: cuadratura solo con un intercepto y con binomial o Poisson; la gamma solo con interceptos */
    SPT.lanza(() => f('glmm').validar(t, { respuesta: 'y' }, SP.opcionesCon(f('glmm'), { derecha: 't + (1 | b) + (1 | t)', familia: 'poisson', nagq: 10 })), 'solo con un efecto aleatorio');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'binomial-negativa', nagq: 5 })), 'binomial y la de Poisson');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'poisson', sobredispersion: 'si', nagq: 5 })), 'efecto por observación');
    SPT.lanza(() => f('glmm').validar(t, { respuesta: 'y' }, SP.opcionesCon(f('glmm'), { derecha: 't + (area | b)', familia: 'gamma', enlace: 'log' })), 'interceptos por grupo');
    SPT.lanza(() => f('glmm-bloques').validar(t, { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'poisson', nagq: 40 })), 'de 1 (Laplace) a 25');
  });
  SPT.caso('Hito 4.3: gamma, cuadratura de Gauss-Hermite y la prueba de los efectos aleatorios en el código', () => {
    const gh = f('glmm-bloques').preparar(tabla(), { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'poisson', sobredispersion: 'auto', nagq: 10 }));
    SPT.afirmar(gh.codigo.includes('nq <- 10L') && gh.codigo.includes('if (usaObs) nq <- 1L') && gh.codigo.includes('modelo <- ajusta(f, nAGQ = nq)'), 'nAGQ, y Laplace con el efecto por observación');
    SPT.afirmar(gh.codigo.includes('lsat <- if (nq > 1L) sum(dpois(y_, y_, log = TRUE)) else 0') && gh.codigo.includes('logLik = llM, AIC = AIC(modelo) - 2 * lsat'), 'la log-verosimilitud del saturado que lme4 omite con la cuadratura');
    SPT.afirmar(gh.codigo.includes('aleat <- c("(1 | b)", if (usaObs) "(1 | .obs)")') && gh.codigo.includes('ajustaGLM(fk)') && gh.codigo.includes('pchisq(max(x, 0), g, lower.tail = FALSE)'), 'prueba de los aleatorios');
    const ga = f('glmm-bloques').preparar(tabla(), { respuesta: 'y', tratamientos: ['t'], bloque: 'b' }, SP.opcionesCon(f('glmm-bloques'), { familia: 'gamma', enlace: 'log' }));
    SPT.afirmar(ga.codigo.includes('family = Gamma(link = "log")') && ga.codigo.includes('sigma = sigma(modelo)'), 'gamma con su dispersión');
    SPT.afirmar(ga.codigo.includes('th_ <- getME(modelo, "theta") * sigma(modelo)') && !ga.codigo.includes('rv <- lapply'), 'varianza (θσ)² y sin la prueba de los aleatorios');
  });
});

SPT.describir('GLMM · lectura de la salida de R', () => {
  SPT.caso('Wald, razones calculadas, varianzas, medias con letras y pares con razón', () => {
    const t = SP.tabla.crear({ y: [3, 5, 2, 8, 6, 4], t: ['a', 'b', 'c', 'a', 'b', 'c'], b: ['I', 'I', 'I', 'II', 'II', 'II'] }, { t: { tipo: 'factor' }, b: { tipo: 'factor' } });
    const df = (cols, datos) => ({ columnas: cols, filas: null, datos });
    const v = {
      obs: { usado: true, razon: 2.5, p: 0.001 }, wald: { termino: 't', chi2: 9.2, gl: 2, p: 0.01 },
      coeficientes: { nombre: ['(Intercept)', 'tb', 'tc'], estimado: [1.2, 0.5, -0.4], ee: [0.2, 0.25, 0.3], z: [6, 2, -1.33], p: [1e-9, 0.045, 0.18] },
      varianzas: { grupo: ['.obs', 'b'], var1: ['(Intercept)', '(Intercept)'], var2: [null, null], varianza: [0.3, 0.1], de: [0.548, 0.316] },
      ajuste: { n: 6, logLik: -12.3, AIC: 34.6, BIC: 33.5, pearson: 2.1, gl: 1, dispersion: 2.1, singular: false },
      medias: [{ factor: 't', enlace: df(['t', 'emmean', 'SE', 'df'], { t: ['a', 'b', 'c'], emmean: [1.2, 1.7, 0.8], SE: [0.2, 0.2, 0.25], df: [Infinity, Infinity, Infinity] }),
        respuesta: df(['t', 'rate', 'SE', 'df', 'asymp.LCL', 'asymp.UCL'], { t: ['a', 'b', 'c'], rate: [3.32, 5.47, 2.23], SE: [0.66, 1.1, 0.56], df: [Infinity, Infinity, Infinity], 'asymp.LCL': [2.2, 3.7, 1.4], 'asymp.UCL': [4.9, 8.1, 3.6] }),
        pares: df(['contrast', 'estimate', 'SE', 'df', 'z.ratio', 'p.value'], { contrast: ['a - b', 'a - c', 'b - c'], estimate: [-0.5, 0.4, 0.9], SE: [0.25, 0.3, 0.3], df: [Infinity, Infinity, Infinity], 'z.ratio': [-2, 1.33, 3], 'p.value': [0.11, 0.38, 0.008] }) }],
      residuos: [0.5, -1, 3.5, 0.2, -0.3, 0.1], ajustados: [3, 5, 2, 8, 6, 4], versiones: { R: '4.6.0' },
    };
    const op = SP.opcionesCon(SP.metodos['glmm-bloques'], { familia: 'poisson' }), e = { respuesta: 'y', tratamientos: ['t'], bloque: 'b' };
    const r = SP.metodos['glmm-bloques'].leer(v, [], t, e, op);
    SPT.afirmar(r.obs.usado && r.formula.includes('(1 | .obs)'), 'efecto por observación en la fórmula');
    SPT.igualJSON(r.wald.termino, ['t']);
    SPT.cerca(r.razones.razon[1], Math.exp(0.5), 1e-15);
    SPT.cerca(r.razones.ic_inf[1], Math.exp(0.5 - SP.dist.qnorm(0.975) * 0.25), 1e-14);
    SPT.igualJSON(r.medias[0].filas.map(x => x.respuesta), [3.32, 5.47, 2.23]);
    SPT.igualJSON(r.medias[0].filas.map(x => x.letras), ['ab', 'a', 'b']);
    SPT.cerca(r.medias[0].pares[2].razon, Math.exp(0.9), 1e-15);
    const rep = SP.metodos['glmm-bloques'].reporte(r);
    SPT.igualJSON(rep.cuadros.map(c => c.id), ['wald', 'coeficientes', 'aleatorios', 'medias-t', 'pares-t', 'ajuste']);
    SPT.afirmar(rep.semaforo.some(s => /efecto aleatorio por observación/.test(s.texto)), 'semáforo');
    SPT.afirmar(rep.semaforo.some(s => s.nombre === T_('Observaciones atípicas') && s.color === 'ambar'), 'atípico de 3.5');
    const p = SP.informe.parrafo('glmm-bloques', r, rep, e, op);
    SPT.afirmar(/Bolker et al\., 2009/.test(p.metodos) && /Harrison, 2014/.test(p.metodos) && /Fox y Weisberg, 2019/.test(p.metodos), p.metodos);
    const cod = SP.metodos['glmm-bloques'].codigoR(e, op, { resultado: r });
    SPT.afirmar(cod.includes('glmer(y ~ t + (1 | b) + (1 | obs), family = poisson(link = "log")'), cod);
  });
  const T_ = s => SP.T(s);
});

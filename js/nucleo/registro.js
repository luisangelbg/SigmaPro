/* SigmaPro — registro de métodos.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada análisis se declara una sola vez con SP.metodo({ … }) y la app arma con esa
   ficha el formulario, la validación, el cálculo, el reporte y el código R:

     SP.metodo({
       id: 'anova-dca',                       minúsculas y guiones
       familia: 'disenos',                    una de SP.familias
       nombre: 'Completamente al azar',
       resumen: 'Compara tratamientos aplicados al azar a unidades homogéneas.',
       motor: 'js',                           'js' (núcleo) o 'r' (motor R, Fase 2)
       entradas: { respuesta: { tipo: 'numerica' }, tratamiento: { tipo: 'factor' } },
       opciones: { alfa: { tipo: 'numero', omision: 0.05 } },
       validar(tabla, entradas, opciones) { … },   lanza SP.ErrorSP con el arreglo
       calcular(tabla, entradas, opciones) { … },  PURO: devuelve números, nada de texto
       reporte(resultado, contexto) { … },         conclusión, cuadros, supuestos, figuras
       codigoR(entradas, opciones) { … },          script de R equivalente
     });

   Regla de liberación: un método solo se ofrece si tiene casos de validación y
   todos aprobaron (SP.metodoDisponible, que lee el reporte generado por las pruebas). */
SP.definir('registro', function (SP) {
  'use strict';

  /* Familias en el orden del catálogo. fase = en qué fase del proyecto se construye. */
  SP.familias = [
    { id: 'descriptiva', nombre: 'Descriptivos e intervalos', fase: 1 },
    { id: 'supuestos', nombre: 'Supuestos del modelo', fase: 1 },
    { id: 'pruebas-t', nombre: 'Pruebas t', fase: 1 },
    { id: 'no-parametricas', nombre: 'Pruebas no paramétricas', fase: 1 },
    { id: 'disenos', nombre: 'Diseños experimentales', fase: 1 },
    { id: 'comparaciones', nombre: 'Comparaciones de medias y contrastes', fase: 1 },
    { id: 'regresion', nombre: 'ANCOVA y regresión', fase: 1 },
    { id: 'correlacion', nombre: 'Correlación', fase: 1 },
    { id: 'contingencia', nombre: 'Tablas de contingencia', fase: 1 },
    { id: 'mixtos', nombre: 'Modelos mixtos', fase: 2 },
    { id: 'generalizados', nombre: 'Modelos lineales generalizados', fase: 2 },
    { id: 'no-lineal', nombre: 'Regresión no lineal', fase: 2 },
    { id: 'superficies', nombre: 'Superficies de respuesta', fase: 2 },
    { id: 'multiambiente', nombre: 'Ensayos multiambiente y estabilidad', fase: 2 },
    { id: 'geneticos', nombre: 'Componentes de varianza y heredabilidad', fase: 2 },
    { id: 'multivariado', nombre: 'Análisis multivariado', fase: 3 },
    { id: 'potencia', nombre: 'Tamaño de muestra y potencia', fase: 3 },
    { id: 'supervivencia', nombre: 'Supervivencia y series de tiempo', fase: 3 },
  ];

  /* Nombres legibles de las funciones del núcleo que se validan por separado (reporte de validación). */
  SP.nombresFunciones = {
    'num.resumen': 'Resumen numérico (n, media, varianza, extremos)',
    'dist.lgamma': 'Logaritmo de la función gamma',
    'dist.pnorm': 'Normal: probabilidad acumulada', 'dist.qnorm': 'Normal: cuantiles', 'dist.dnorm': 'Normal: densidad',
    'dist.pt': 't de Student: probabilidad acumulada', 'dist.qt': 't de Student: cuantiles', 'dist.dt': 't de Student: densidad',
    'dist.pf': 'F: probabilidad acumulada', 'dist.qf': 'F: cuantiles', 'dist.df': 'F: densidad',
    'dist.pchisq': 'Ji cuadrada: probabilidad acumulada', 'dist.qchisq': 'Ji cuadrada: cuantiles',
    'dist.pgamma': 'Gamma: probabilidad acumulada', 'dist.qgamma': 'Gamma: cuantiles',
    'dist.pbeta': 'Beta: probabilidad acumulada', 'dist.qbeta': 'Beta: cuantiles',
    'dist.dbinom': 'Binomial: probabilidad puntual', 'dist.pbinom': 'Binomial: probabilidad acumulada',
    'dist.dpois': 'Poisson: probabilidad puntual', 'dist.ppois': 'Poisson: probabilidad acumulada',
    'dist.ptukey': 'Rango estudentizado: probabilidad acumulada', 'dist.qtukey': 'Rango estudentizado: cuantiles',
    'formula.matrizComoColumnas': 'Matriz de diseño (codificación de factores)',
    'lineal.resumenDe': 'Modelo lineal: coeficientes, errores estándar, R² y F',
    'lineal.anova': 'Análisis de varianza: sumas de cuadrados tipo I, II y III',
    'csv.leerColumnas': 'Lector de CSV y texto separado', 'hojas.leerLibroBase64': 'Lector de libros .xlsx',
    'expresiones.enTabla': 'Variables calculadas y filtros (expresiones)',
    'transformar.aplicar': 'Transformaciones (logaritmos, raíces, arcoseno, Box-Cox)',
    'transformar.boxcoxResumen': 'Box-Cox: λ estimada, intervalo y verosimilitud perfilada',
  };

  const TIPOS_ENTRADA = new Set(['numerica', 'numerica+', 'factor', 'factor+', 'cualquiera']);
  SP.metodos = {};

  function revisar(f) {
    const mal = msg => { throw new Error('SP.metodo «' + (f && f.id) + '»: ' + msg); };
    if (!f || typeof f !== 'object') throw new Error('SP.metodo: la ficha debe ser un objeto');
    if (typeof f.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(f.id)) mal('id no válido (minúsculas, números y guiones)');
    if (SP.metodos[f.id]) mal('el id ya está registrado');
    if (!SP.familias.some(x => x.id === f.familia)) mal('familia desconocida: ' + f.familia);
    if (typeof f.nombre !== 'string' || !f.nombre.trim()) mal('falta el nombre');
    if (f.motor !== 'js' && f.motor !== 'r') mal('motor debe ser «js» o «r»');
    if (!f.entradas || typeof f.entradas !== 'object' || !Object.keys(f.entradas).length) mal('faltan las entradas');
    for (const [rol, e] of Object.entries(f.entradas)) {
      if (!e || !TIPOS_ENTRADA.has(e.tipo)) mal('la entrada «' + rol + '» tiene un tipo no válido');
    }
    if (f.motor === 'js' && typeof f.calcular !== 'function') mal('un método del núcleo necesita calcular()');
    if (typeof f.codigoR !== 'function') mal('todo método debe dar su código R equivalente (codigoR)');
    for (const k of ['validar', 'calcular', 'reporte']) {
      if (f[k] !== undefined && typeof f[k] !== 'function') mal(k + ' debe ser una función');
    }
  }

  /** Registra un método y devuelve su ficha congelada. */
  SP.metodo = function (ficha) {
    revisar(ficha);
    const f = Object.freeze(Object.assign({ opciones: {}, resumen: '' }, ficha));
    SP.metodos[f.id] = f;
    return f;
  };

  /** Métodos registrados, en el orden del catálogo (familia y luego nombre). */
  SP.listaMetodos = function (familia) {
    const orden = new Map(SP.familias.map((x, i) => [x.id, i]));
    return Object.values(SP.metodos)
      .filter(m => !familia || m.familia === familia)
      .sort((a, b) => (orden.get(a.familia) - orden.get(b.familia)) || a.nombre.localeCompare(b.nombre, 'es'));
  };

  /** Valor de cada opción: el dado o el de omisión. */
  SP.opcionesCon = function (ficha, opciones) {
    const out = {};
    for (const [k, o] of Object.entries(ficha.opciones || {})) out[k] = o && 'omision' in o ? o.omision : undefined;
    return Object.assign(out, opciones || {});
  };

  /** Valida y calcula un método del núcleo. Devuelve { resultado, ms }. */
  SP.ejecutar = function (id, tabla, entradas, opciones) {
    const f = SP.metodos[id];
    if (!f) throw new Error('Método no registrado: ' + id);
    if (f.motor !== 'js') throw new Error('El método «' + id + '» corre en el motor R');
    const op = SP.opcionesCon(f, opciones);
    if (f.validar) f.validar(tabla, entradas, op);
    const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
    const resultado = f.calcular(tabla, entradas, op);
    return { resultado, ms: (typeof performance !== 'undefined' ? performance : Date).now() - t0 };
  };

  /**
   * ¿El método tiene casos de validación y aprobaron todos?
   * @param {string} id
   * @param {object} [validacion]  el reporte generado (por omisión, SP_VALIDACION de la página)
   */
  SP.metodoDisponible = function (id, validacion) {
    const v = validacion || (typeof globalThis !== 'undefined' ? globalThis.SP_VALIDACION : null);
    if (!v || !Array.isArray(v.casos)) return false;
    const suyos = v.casos.filter(c => c.objetivo && c.objetivo.tipo === 'metodo' && c.objetivo.nombre === id);
    return suyos.length > 0 && suyos.every(c => c.aprobado);
  };
});

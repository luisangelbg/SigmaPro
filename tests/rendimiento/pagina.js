/* SigmaPro — lo que tests/rendimiento/medir.mjs corre dentro de la página (una expresión que devuelve el JSON).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).
   Un ensayo sintético de 100 000 filas, con semilla fija: rendimiento con efectos de tratamiento, bloque, tres factores,
   dosis y una covariable; diez variables numéricas correlacionadas; categorías para contingencia y evaluadores. Un 7 %
   de las filas se quita al azar para que el factorial quede desbalanceado. */
(async () => {
  const N0 = 107527;
  let s = 20261002;
  const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const normal = () => { let u = 0; for (let k = 0; k < 12; k++) u += az(); return u - 6; };
  const c = { trat: [], bloque: [], A: [], B: [], C: [], grupo: [], dosis: [], plantas: [], rend: [], l: [], resp: [], e1: [], e2: [] };
  for (let v = 0; v < 10; v++) c['v' + v] = [];
  for (let i = 0; i < N0; i++) {
    if (az() < 0.07) continue;                                            // desbalance
    const t = Math.floor(az() * 5), b = Math.floor(az() * 10), a = Math.floor(az() * 4), bb = Math.floor(az() * 3), cc = Math.floor(az() * 2);
    const dosis = [0, 50, 100, 150][Math.floor(az() * 4)], plantas = Math.round(100 + 15 * normal());
    const y = 5 + 0.3 * t + 0.1 * b + 0.2 * a - 0.15 * bb + 0.1 * cc + 0.02 * dosis - 0.0001 * dosis * dosis + 0.01 * (plantas - 100) + 0.5 * normal();
    c.trat.push('T' + (t + 1)); c.bloque.push('B' + (b + 1)); c.A.push('a' + (a + 1)); c.B.push('b' + (bb + 1)); c.C.push('c' + (cc + 1));
    c.grupo.push(az() < 0.5 ? 'control' : 'tratado'); c.dosis.push(dosis); c.plantas.push(plantas); c.rend.push(Math.round(y * 1000) / 1000);
    c.l.push('L' + (1 + Math.floor(az() * 6))); c.resp.push(az() < 0.35 + 0.1 * (t % 2) ? 'si' : 'no');
    const sev = Math.floor(az() * 4); c.e1.push('S' + sev); c.e2.push('S' + Math.max(0, Math.min(3, sev + (az() < 0.2 ? (az() < 0.5 ? -1 : 1) : 0))));
    const z = normal();
    for (let v = 0; v < 10; v++) c['v' + v].push(Math.round((y * (v % 3) * 0.2 + z * 0.3 + normal()) * 100) / 100);
  }
  const n = c.rend.length;
  const FACT = ['trat', 'bloque', 'A', 'B', 'C', 'grupo', 'l', 'resp', 'e1', 'e2'];
  const tipos = Object.fromEntries(FACT.map(k => [k, { tipo: 'factor' }]));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  /* hasta el siguiente cuadro pintado; si la página queda oculta (otra pestaña al frente) no hay cuadros: se avisa */
  const pintado = () => new Promise((r, mal) => { const t = setTimeout(() => mal(new Error('La página quedó oculta (' + document.visibilityState + '): no se pinta.')), 15000); requestAnimationFrame(() => setTimeout(() => { clearTimeout(t); r(); }, 0)); });
  const mediana = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const grupos = [];
  let grupo = null;
  /* --solo=<inicio del título>: solo ese grupo (y Datos, que prepara la tabla) */
  let saltar = false;
  const titulo = t => { saltar = !!window.__soloGrupo && t !== 'Datos' && !t.startsWith(window.__soloGrupo); grupo = { titulo: t, medidas: [] }; if (!saltar) grupos.push(grupo); };
  /** una medida: la primera vez y la mediana de tres más */
  async function medir(nombre, fn, meta, extra) {
    if (saltar) return null;
    console.info('[inicio] ' + nombre);
    const t0 = performance.now(); let r = await fn(); const primera = performance.now() - t0;
    const otras = [];
    if (!(extra && extra.unaVez)) for (let k = 0; k < (primera > 1500 ? 1 : 3); k++) { const t1 = performance.now(); r = await fn(); otras.push(performance.now() - t1); }
    grupo.medidas.push(Object.assign({ nombre, primera, mediana: otras.length ? mediana(otras) : undefined, meta }, extra || {}, { unaVez: undefined }));
    console.info('[medida] ' + JSON.stringify({ nombre, primera: Math.round(primera), mediana: otras.length ? Math.round(mediana(otras)) : null, meta }));
    return r;
  }

  /* ---------------- datos ---------------- */
  titulo('Datos');
  const hoja = await medir('Crear la hoja (23 columnas)', () => SP.hoja.crear({ nombres: Object.keys(c), columnas: c, tipos }), 1500);
  const csv = [Object.keys(c).join(',')].concat(Array.from({ length: n }, (_, i) => Object.keys(c).map(k => c[k][i]).join(','))).join('\n');
  await medir('Leer un CSV de ' + (csv.length / 1048576).toFixed(1) + ' MB', () => SP.csv.leerColumnas(csv, { delimitador: ',', decimal: '.' }), 1500);
  await medir('Filtrar con una expresión', () => SP.expresiones.filtrar(hoja, 'rend > 5 & trat != "T1"'), 500);
  const t = await medir('Tabla de análisis (todas las columnas)', () => hoja.aTabla(), 500);
  await medir('Cargar en la app (rejilla y estructura)', async () => { SP.datosUI.cargar(hoja, 'sintético'); await pintado(); }, 1500, { unaVez: true });

  const M = (nombre, id, e, op, meta, extra) => medir(nombre, () => { const r = SP.ejecutar(id, t, e, SP.opcionesCon(SP.metodos[id], op || {})).resultado; SP.metodos[id].reporte(r, {}); return r; }, meta, extra);
  const vars = Array.from({ length: 10 }, (_, v) => 'v' + v);

  /* ---------------- explorar ---------------- */
  titulo('Explorar');
  await M('Descriptivos de 10 variables', 'descriptivos', { variables: vars, grupos: [] }, {}, 150, { plan: true });
  await M('Descriptivos de 10 variables en 20 grupos (trat × A)', 'descriptivos', { variables: vars, grupos: ['trat', 'A'] }, {}, 800);
  await M('Frecuencias trat × bloque', 'frecuencias', { fila: 'trat', columna: 'bloque' }, {}, 200);
  await M('Bondad de ajuste de trat', 'bondad-ajuste', { categoria: 'trat' }, {}, 200);

  /* ---------------- supuestos y pruebas ---------------- */
  titulo('Supuestos, pruebas t y de rangos');
  await M('Supuestos del modelo bloques + tratamientos', 'supuestos', { respuesta: 'rend', tratamientos: ['trat'], bloque: 'bloque' }, {}, 2000);
  await M('Prueba t de Welch', 'prueba-t', { modo: 'independientes', respuesta: 'rend', grupo: 'grupo' }, {}, 300);
  await M('Mann-Whitney con Hodges-Lehmann', 'wilcoxon', { modo: 'independientes', respuesta: 'rend', grupo: 'grupo' }, {}, 1500);
  await M('Kruskal-Wallis con Dunn', 'kruskal-wallis', { respuesta: 'rend', tratamiento: 'trat' }, {}, 800);

  /* ---------------- diseños y comparaciones ---------------- */
  titulo('Diseños y comparaciones');
  const unaVia = () => { const r1 = SP.ejecutar('dca', t, { respuesta: 'rend', tratamientos: ['trat'] }, SP.opcionesCon(SP.metodos.dca, {})).resultado; SP.metodos.dca.reporte(r1);
    const r2 = SP.ejecutar('comparaciones-medias', t, { diseno: 'dca', respuesta: 'rend', tratamientos: ['trat'], comparar: ['trat'] }, SP.opcionesCon(SP.metodos['comparaciones-medias'], { metodo: 'tukey' })).resultado; SP.metodos['comparaciones-medias'].reporte(r2); return r2; };
  await medir('ANOVA de una vía + Tukey', unaVia, 250, { plan: true });
  await M('Bloques al azar (5 tratamientos, 10 bloques)', 'dbca', { respuesta: 'rend', tratamientos: ['trat'], bloque: 'bloque' }, {}, 500);
  await M('Factorial 4 × 3 × 2 desbalanceado, SC tipo III', 'dca', { respuesta: 'rend', tratamientos: ['A', 'B', 'C'] }, { tipoSC: 3 }, 1500, { plan: true });
  await M('Factorial en bloques con dosis numérica (tipo III)', 'dbca', { respuesta: 'rend', tratamientos: ['A', 'dosis'], bloque: 'bloque' }, {}, 1500);
  await M('Parcelas divididas (A en parcelas grandes, B)', 'parcelas-divididas', { respuesta: 'rend', parcelaGrande: 'A', subparcela: 'B', bloque: 'bloque', principal: 'dbca' }, {}, 3000);
  await M('Tukey de A dentro de cada B (factorial)', 'comparaciones-medias', { diseno: 'dca', respuesta: 'rend', tratamientos: ['A', 'B', 'C'], comparar: ['A'], dentro: ['B'] }, { metodo: 'tukey' }, 1500);
  await M('Polinomios ortogonales de la dosis', 'polinomios', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['dosis'], bloque: 'bloque', comparar: ['dosis'] }, {}, 1000);

  /* ---------------- ANCOVA, regresión y modelo lineal ---------------- */
  titulo('ANCOVA, regresión y modelo lineal general');
  await M('ANCOVA en bloques (5 tratamientos, 1 covariable)', 'ancova', { respuesta: 'rend', tratamientos: ['trat'], bloque: 'bloque', covariables: ['plantas'] }, { metodo: 'tukey' }, 3000);
  await M('Regresión múltiple con 10 predictores y diagnóstico', 'regresion-lineal', { respuesta: 'rend', predictores: vars }, {}, 2000);
  await M('Regresión polinomial de grado 2', 'regresion-polinomial', { respuesta: 'rend', predictores: 'plantas' }, { grado: 2 }, 1500);
  await M('Selección paso a paso (AIC) entre 10 predictores', 'seleccion-pasos', { respuesta: 'rend', predictores: vars }, {}, 1500);
  await M('Mejores subconjuntos de 10 predictores (1 023 modelos)', 'mejores-subconjuntos', { respuesta: 'rend', predictores: vars }, {}, 1500);
  await M('Modelo lineal general bloque + A * B + covariable', 'modelo-lineal', { respuesta: 'rend' }, { derecha: 'bloque + A * B + plantas' }, 3000);

  /* ---------------- correlación y contingencia ---------------- */
  titulo('Correlación y contingencia');
  await M('Correlación de Pearson', 'correlacion', { x: 'v0', y: 'v1' }, { metodo: 'pearson' }, 200);
  await M('Correlación de Spearman', 'correlacion', { x: 'v0', y: 'v1' }, { metodo: 'spearman' }, 600);
  await M('Correlación de Kendall (τ-b de Knight)', 'correlacion', { x: 'v0', y: 'v1' }, { metodo: 'kendall' }, 800);
  await M('Matriz de Pearson de 10 variables', 'matriz-correlacion', { variables: vars }, { metodo: 'pearson' }, 500);
  await M('Matriz de Kendall de 10 variables (45 pares)', 'matriz-correlacion', { variables: vars }, { metodo: 'kendall' }, 8000, { nota: 'O(n log n) por par' });
  await M('Correlación parcial con 3 controles', 'correlacion-parcial', { x: 'v1', y: 'v2', controles: ['v3', 'v4', 'v5'] }, { metodo: 'pearson' }, 500);
  await M('Tabla de contingencia trat × l', 'tabla-contingencia', { fila: 'trat', columna: 'l' }, {}, 500);
  await M('McNemar-Bowker de dos evaluaciones', 'mcnemar', { antes: 'e1', despues: 'e2' }, {}, 300);
  await M('Cochran-Mantel-Haenszel grupo × resp × l', 'mantel-haenszel', { fila: 'grupo', columna: 'resp', estrato: 'l' }, {}, 500);
  await M('Kappa de Cohen', 'kappa', { evaluador1: 'e1', evaluador2: 'e2' }, {}, 300);

  /* ---------------- la interfaz ---------------- */
  titulo('Interfaz: análisis, reporte y exportaciones');
  const listo = async () => { for (let k = 0; k < 600; k++) { await espera(10); const r = document.querySelector('#anaResultado'); if (r && !r.classList.contains('calculando') && r.querySelector('.exp-cabeza h3')) return; } throw new Error('el análisis no terminó'); };
  SP.app.ir(4);
  await medir('Bloque Análisis: factorial en bloques, calculado y pintado', async () => { SP.app.analisis.usar('dbca', { respuesta: 'rend', tratamientos: ['A', 'dosis'], bloque: 'bloque' }, {}); await listo(); await pintado(); }, 2500, { unaVez: true });
  const R = SP.app.reporte;
  R.agregar({ metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['A', 'dosis'], bloque: 'bloque' }, op: {} });
  R.agregar({ metodo: 'comparaciones-medias', e: { diseno: 'dbca', respuesta: 'rend', tratamientos: ['A', 'dosis'], bloque: 'bloque', comparar: ['A'] }, op: { metodo: 'tukey' } });
  R.agregar({ metodo: 'ancova', e: { respuesta: 'rend', tratamientos: ['trat'], bloque: 'bloque', covariables: ['plantas'] }, op: {} });
  R.agregar({ metodo: 'regresion-polinomial', e: { respuesta: 'rend', predictores: 'plantas' }, op: { grado: 2 } });
  R.agregar({ metodo: 'descriptivos', e: { variables: ['rend', 'plantas'], grupos: ['trat'] }, op: {}, bloque: 3 });
  document.querySelectorAll('[class*=toast]').forEach(x => x.remove());
  await medir('Reporte de 5 análisis: calculado y pintado (bloque 5)', async () => { SP.app.ir(5); await pintado(); }, 5000, { unaVez: true });
  await medir('Figuras del reporte (bloque 6)', async () => { SP.app.ir(6); await pintado(); }, 1500, { unaVez: true });
  const C = SP.app.exportar.construir;
  await medir('Hoja de cálculo de los cuadros', () => C.xlsx(), 1500, { unaVez: true });
  await medir('Documento .docx (figuras a 300 ppp)', () => C.docx(), 3000, { unaVez: true });
  const pr = await medir('Proyecto .labg (datos completos, comprimido)', () => C.proyecto(), 3000, { unaVez: true });
  if (pr) grupo.medidas[grupo.medidas.length - 1].nota = (pr.datos.length / 1048576).toFixed(1) + ' MB';
  if (pr) await medir('Abrir el .labg y verificar sus huellas', () => SP.proyecto.abrir(pr.datos), 2000, { unaVez: true });
  return JSON.stringify({ n, grupos });
})()

/* SigmaPro — el proyecto .labg: un ZIP con todo lo necesario para reabrir el trabajo y repetirlo en R.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     manifiesto.json   formato, versión, fecha, programa y la huella SHA-256 de cada archivo (y la del conjunto)
     datos/hoja.json   la hoja completa con sus tipos, niveles, columnas derivadas y el filtro de filas
     datos/datos.csv   las filas que usan los análisis, para leerlas en R o en una hoja de cálculo
     analisis.json     el reporte: título, autor y cada análisis (método, entradas y opciones)
     estilos.json      lo que se ajustó en las figuras (barras de error, ediciones del editor ✎, estudio)
     codigo/analisis.R el código R que lee datos.csv y repite cada análisis del reporte
     LEAME.txt         qué es cada archivo
   Los resultados no se guardan: se vuelven a calcular al abrir, así que no pueden quedar distintos de los datos.

     SP.proyecto.armar(p) → Promise<Uint8Array>
        p = { hoja, filtro: { expresion } | null, origen, reporte: { titulo, autor, items: [{ metodo, e, op, titulo, nota }] },
              estilos, fecha }
     SP.proyecto.abrir(bytes) → { manifiesto, hoja, filtro, origen, reporte, estilos, verificacion: { ok, archivos, huella } }
     SP.proyecto.csv(hoja, filas) · SP.proyecto.codigoR(tabla, items, { origen })
     SP.proyecto.instantanea(p) → objeto · SP.proyecto.deInstantanea(objeto) → como abrir() (guardado automático) */
SP.definir('proyecto', function (SP) {
  'use strict';
  const T = SP.T;
  const FORMATO = 'labg-sigmapro', VERSION_FORMATO = 1;
  /* se crean al usarse: el núcleo también se arma dentro de los hilos de trabajo */
  const enc = { encode: t => new TextEncoder().encode(t) }, dec = { decode: b => new TextDecoder('utf-8').decode(b) };
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';

  /** Las filas en CSV (coma, punto decimal, NA): los números con todas sus cifras, las fechas como AAAA-MM-DD. */
  function csv(hoja, filas) {
    const idx = filas || Array.from({ length: hoja.n }, (_, i) => i);
    const cols = hoja.cols;
    const lineas = [cols.map(c => q(c.nombre)).join(',')];
    for (const i of idx) {
      lineas.push(cols.map(c => {
        const v = c.datos[i];
        if (c.tipo === 'numerica') return Number.isNaN(v) ? 'NA' : String(v);
        if (c.tipo === 'fecha') return Number.isNaN(v) ? 'NA' : SP.tipos.textoFecha(v);
        return v === null || v === undefined || v === '' ? 'NA' : q(v);
      }).join(','));
    }
    return lineas.join('\n') + '\n';
  }

  /** El código R del proyecto: lee los datos con sus niveles y repite cada análisis desde los datos originales. */
  function codigoR(tabla, items, op) {
    op = op || {};
    const nom = n => (/^[A-Za-z.][A-Za-z0-9._]*$/.test(n) ? 'datos$' + n : 'datos[[' + JSON.stringify(n) + ']]');
    const L = [
      '# ' + T('Proyecto de SigmaPro {v}: código R que repite los análisis del reporte.', { v: SP.VERSION }),
      '# ' + T('Corre desde la carpeta del proyecto descomprimido (la que tiene «datos/» y «codigo/»).'),
      op.origen ? '# ' + T('Datos: {o}', { o: op.origen }) : null,
      '',
      'datos_originales <- read.csv("datos/datos.csv", stringsAsFactors = FALSE, na.strings = "NA", check.names = FALSE, encoding = "UTF-8")',
    ].filter(x => x !== null);
    for (const n of tabla.nombres) {
      const c = tabla.col(n);
      if (c.tipo === 'factor') L.push(nom(n).replace(/^datos/, 'datos_originales') + ' <- factor(' + nom(n).replace(/^datos/, 'datos_originales') + ', levels = c(' + c.niveles.map(x => JSON.stringify(x)).join(', ') + '))');
      else if (c.fecha) L.push(nom(n).replace(/^datos/, 'datos_originales') + ' <- as.Date(' + nom(n).replace(/^datos/, 'datos_originales') + ')');
    }
    items.forEach((it, k) => {
      L.push('', '# ' + '-'.repeat(70), '# ' + (k + 1) + '. ' + (it.titulo || it.metodo), '# ' + '-'.repeat(70), 'datos <- datos_originales');
      L.push(String(it.codigo || '').trim());
    });
    return L.join('\n') + '\n';
  }

  function leame(p) {
    return [
      T('Proyecto de SigmaPro {v}', { v: SP.VERSION }),
      T('Creado: {f}', { f: p.fecha.toISOString() }),
      '',
      T('Ábrelo en SigmaPro (bloque Exportar → Abrir un proyecto) para recuperar los datos, los análisis del reporte y los ajustes de las figuras.'),
      T('Los resultados no se guardan: se recalculan al abrir.'),
      '',
      'manifiesto.json   ' + T('formato, versión y huella SHA-256 de cada archivo'),
      'datos/hoja.json   ' + T('la hoja completa (tipos, niveles, columnas derivadas y filtro)'),
      'datos/datos.csv   ' + T('las filas que usan los análisis'),
      'analisis.json     ' + T('el reporte: cada análisis con sus entradas y opciones'),
      'estilos.json      ' + T('los ajustes de las figuras'),
      'codigo/analisis.R ' + T('repite todo en R: descomprime y corre «source(\"codigo/analisis.R\")» desde esta carpeta'),
      '',
    ].join('\n');
  }

  async function armar(p) {
    const fecha = p.fecha || new Date();
    const filas = p.filtro && p.filtro.filas ? p.filtro.filas : null;
    const tabla = p.hoja.aTabla(filas || undefined);
    const items = (p.reporte && p.reporte.items || []).map(it => {
      const ficha = SP.metodos[it.metodo];
      let codigo = it.codigo;
      if (!codigo && ficha) {
        const opciones = SP.opcionesCon(ficha, it.op || {});
        let resultado = null;
        try { resultado = SP.ejecutar(it.metodo, tabla, it.e || {}, opciones).resultado; } catch (e) { /* el código sale igual */ }
        const numFactor = tabla.nombres.filter(n => tabla.col(n).tipo === 'numerica' && SP.estructura.pareceFactorNumerico(tabla.col(n), tabla.n));
        try { codigo = ficha.codigoR(it.e || {}, opciones, { factoresNumericos: numFactor, resultado }); } catch (e) { codigo = '# ' + e.message; }
      }
      return Object.assign({}, it, { codigo });
    });
    const hojaJson = Object.assign(p.hoja.serializar(), { filtro: p.filtro ? { expresion: p.filtro.expresion } : null, origen: p.origen || '' });
    const archivos = [
      { nombre: 'datos/hoja.json', datos: enc.encode(JSON.stringify(hojaJson)) },
      { nombre: 'datos/datos.csv', datos: enc.encode(csv(p.hoja, filas)) },
      { nombre: 'analisis.json', datos: enc.encode(JSON.stringify({ titulo: p.reporte && p.reporte.titulo || '', autor: p.reporte && p.reporte.autor || '',
        items: items.map(it => ({ metodo: it.metodo, e: it.e || {}, op: it.op || {}, titulo: it.titulo || '', nota: it.nota || '' })) }, null, 1)) },
      { nombre: 'estilos.json', datos: enc.encode(JSON.stringify(p.estilos || {}, null, 1)) },
      { nombre: 'codigo/analisis.R', datos: enc.encode(codigoR(tabla, items, { origen: p.origen })) },
      { nombre: 'LEAME.txt', datos: enc.encode(leame({ fecha })) },
    ];
    const lista = archivos.map(a => ({ ruta: a.nombre, bytes: a.datos.length, sha256: SP.sha256(a.datos) }));
    const manifiesto = {
      formato: FORMATO, version_formato: VERSION_FORMATO, programa: 'SigmaPro', version_programa: SP.VERSION, creado: fecha.toISOString(),
      titulo: p.reporte && p.reporte.titulo || '', filas: p.hoja.n, columnas: p.hoja.p, analisis: items.length,
      archivos: lista, huella: SP.sha256(lista.map(a => a.ruta + ':' + a.sha256).join('\n')),
    };
    return SP.zip.construirComprimido([{ nombre: 'manifiesto.json', datos: enc.encode(JSON.stringify(manifiesto, null, 1)) }].concat(archivos));
  }

  function abrir(bytes) {
    const z = SP.zip.leer(bytes);
    const texto = n => { const b = z.datos(n); return b ? dec.decode(b) : null; };
    const mt = texto('manifiesto.json');
    if (!mt) throw new SP.ErrorSP(T('El archivo no es un proyecto de SigmaPro (no tiene manifiesto).'), T('Abre un archivo .labg guardado desde el bloque Exportar.'));
    let man;
    try { man = JSON.parse(mt); } catch (e) { throw new SP.ErrorSP(T('El manifiesto del proyecto está dañado.')); }
    if (man.formato !== FORMATO) throw new SP.ErrorSP(T('El archivo es un proyecto de otra aplicación ({f}).', { f: man.formato || '?' }));
    if (man.version_formato > VERSION_FORMATO) throw new SP.ErrorSP(T('El proyecto viene de una versión más nueva de SigmaPro ({v}).', { v: man.version_programa }), T('Actualiza SigmaPro para abrirlo.'));
    /* verificación de cada archivo contra su huella */
    const archivos = (man.archivos || []).map(a => {
      const b = z.datos(a.ruta);
      const sha = b ? SP.sha256(b) : null;
      return { ruta: a.ruta, ok: !!b && sha === a.sha256 && b.length === a.bytes, falta: !b };
    });
    const huella = SP.sha256((man.archivos || []).map(a => a.ruta + ':' + a.sha256).join('\n')) === man.huella;
    const hj = texto('datos/hoja.json');
    if (!hj) throw new SP.ErrorSP(T('El proyecto no trae los datos (datos/hoja.json).'));
    const sh = JSON.parse(hj);
    const hoja = SP.hoja.deSerializado(sh);
    const reporte = JSON.parse(texto('analisis.json') || '{"items":[]}');
    let estilos = {};
    try { estilos = JSON.parse(texto('estilos.json') || '{}'); } catch (e) { estilos = {}; }
    return {
      manifiesto: man, hoja, filtro: sh.filtro || null, origen: sh.origen || '', reporte, estilos,
      verificacion: { ok: huella && archivos.every(a => a.ok), huella, archivos },
    };
  }

  /* Guardado automático: lo mismo que el proyecto (la hoja, el filtro, el reporte y los estilos) como un objeto que el
     navegador guarda tal cual, sin comprimir ni calcular huellas ni el código R, para armarlo en milisegundos a cada
     cambio. Los análisis conservan además su vista, sus columnas visibles y su contexto (el .labg no los lleva). */
  const AUTO = 'sigmapro-autoguardado', VERSION_AUTO = 1;
  const CAMPOS = ['metodo', 'e', 'op', 'ctx', 'bloque', 'vista', 'visibles', 'titulo', 'nota'];
  /** → objeto para IndexedDB · p = { hoja | null, filtro, origen, reporte: { titulo, autor, items }, estilos, fecha } */
  function instantanea(p) {
    const fecha = p.fecha || new Date(), r = p.reporte || {};
    const items = (r.items || []).map(it => JSON.parse(JSON.stringify(Object.fromEntries(CAMPOS.filter(k => it[k] !== undefined && it[k] !== null).map(k => [k, it[k]])))));
    const hoja = p.hoja && p.hoja.p ? p.hoja : null;
    return {
      formato: AUTO, version_formato: VERSION_AUTO, version_programa: SP.VERSION, creado: fecha.toISOString(),
      hoja: hoja ? hoja.serializar(true) : null, filtro: hoja && p.filtro && p.filtro.expresion ? { expresion: p.filtro.expresion } : null, origen: p.origen || '',
      reporte: { titulo: r.titulo || '', autor: r.autor || '', items }, estilos: JSON.parse(JSON.stringify(p.estilos || {})),
      resumen: { filas: hoja ? hoja.n : 0, columnas: hoja ? hoja.p : 0, analisis: items.length, origen: p.origen || '', titulo: r.titulo || '' },
    };
  }
  /** objeto guardado → { hoja | null, filtro, origen, reporte, estilos, creado, resumen } (lo que pide aplicarProyecto) */
  function deInstantanea(s) {
    if (!s || s.formato !== AUTO || !s.reporte) throw new SP.ErrorSP(T('Lo guardado en este navegador no es un trabajo de SigmaPro.'));
    if (s.version_formato > VERSION_AUTO) throw new SP.ErrorSP(T('El trabajo guardado viene de una versión más nueva de SigmaPro ({v}).', { v: s.version_programa }), T('Abre la versión más nueva de SigmaPro para recuperarlo.'));
    return { hoja: s.hoja ? SP.hoja.deSerializado(s.hoja) : null, filtro: s.filtro || null, origen: s.origen || '', reporte: JSON.parse(JSON.stringify(s.reporte)),
      estilos: s.estilos || {}, creado: s.creado, resumen: s.resumen || {} };
  }

  SP.proyecto = { armar, abrir, csv, codigoR, FORMATO, instantanea, deInstantanea, AUTO };
});

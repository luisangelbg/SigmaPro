/* SigmaPro — lectura de libros de hoja de cálculo (.xlsx, .xlsm y .ods), sin bibliotecas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un libro es un ZIP de archivos XML. Se abre con SP.zip y se recorre con SP.xml.

     SP.hojas.leer(bytes) → { nombres: [..], hojas: { nombre: { filas: [[valor, …], …] } } }

   Cada valor de celda es:
     número                  números y porcentajes (el valor guardado, no el mostrado)
     'AAAA-MM-DD'            fechas (con ' HH:MM:SS' si traen hora)
     texto                   textos y fórmulas que dan texto (las celdas con error, #N/A, …, quedan vacías)
     'VERDADERO' | 'FALSO'   valores lógicos
     ''                      celda vacía
   Las filas vacías se quitan y todas las filas quedan del mismo ancho.
   Los libros del formato viejo (.xls) no se abren: se pide guardarlos como .xlsx o .csv. */
SP.definir('hojas', function (SP) {
  'use strict';
  const T = SP.T;

  function columnaDe(ref) {
    let n = 0;
    for (let i = 0; i < ref.length; i++) {
      const c = ref.charCodeAt(i);
      if (c >= 65 && c <= 90) n = n * 26 + (c - 64);
      else if (c >= 97 && c <= 122) n = n * 26 + (c - 96);
      else break;
    }
    return n - 1;
  }
  const dos = v => (v < 10 ? '0' : '') + v;
  /** Número de serie de la hoja de cálculo → 'AAAA-MM-DD[ HH:MM:SS]' (base 1899-12-30, o 1904-01-01). */
  function fechaDeSerie(serie, base1904) {
    const base = base1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 30);
    const ms = Math.round(serie * 86400) * 1000;
    const d = new Date(base + ms);
    const f = d.getUTCFullYear() + '-' + dos(d.getUTCMonth() + 1) + '-' + dos(d.getUTCDate());
    const seg = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
    return seg ? f + ' ' + dos(d.getUTCHours()) + ':' + dos(d.getUTCMinutes()) + ':' + dos(d.getUTCSeconds()) : f;
  }

  function densa(filas) {
    const ancho = filas.reduce((m, f) => Math.max(m, f ? f.length : 0), 0);
    const out = [];
    for (const f of filas) {
      const llena = Array.from({ length: ancho }, (_, i) => (f && f[i] !== undefined && f[i] !== null ? f[i] : ''));
      if (llena.some(v => v !== '')) out.push(llena);
    }
    /* quitar columnas vacías a la izquierda y a la derecha */
    let ultimo = -1, primero = Infinity;
    for (const f of out) {
      for (let j = f.length - 1; j > ultimo; j--) if (f[j] !== '') { ultimo = j; break; }
      for (let j = 0; j < Math.min(primero, f.length); j++) if (f[j] !== '') { primero = j; break; }
    }
    if (!out.length) return out;
    return out.map(f => f.slice(primero, ultimo + 1));
  }

  /* ---------------- .xlsx ---------------- */
  const FORMATOS_FECHA = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 45, 46, 47,
    50, 51, 52, 53, 54, 55, 56, 57, 58]);
  function esFormatoFecha(id, codigo) {
    if (FORMATOS_FECHA.has(id)) return true;
    if (!codigo) return false;
    const limpio = codigo.replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '').replace(/\\./g, '');
    return /[ymdhs]/i.test(limpio) && !/^[#0.,%E+\-\s]*$/.test(limpio);
  }

  function cadenasCompartidas(texto) {
    const lista = [];
    if (!texto) return lista;
    let actual = null, dentroT = false, fonetico = 0;
    SP.xml.recorrer(texto, {
      abre(n) {
        if (n === 'si') actual = '';
        else if (n === 'rPh') fonetico++;
        else if (n === 't' && actual !== null && !fonetico) dentroT = true;
      },
      cierra(n) {
        if (n === 'si') { lista.push(actual); actual = null; }
        else if (n === 'rPh') fonetico--;
        else if (n === 't') dentroT = false;
      },
      texto(s) { if (dentroT) actual += s; },
    });
    return lista;
  }

  function estilosFecha(texto) {
    if (!texto) return [];
    const a = SP.xml.arbol(texto);
    const propios = {};
    for (const f of SP.xml.buscar(a, 'numFmt')) propios[+f.atr.numFmtId] = f.atr.formatCode;
    const xfs = SP.xml.buscar(a, 'cellXfs')[0];
    if (!xfs) return [];
    return xfs.hijos.filter(h => h.nombre === 'xf' || h.nombre.endsWith(':xf')).map(xf => {
      const id = +(xf.atr.numFmtId || 0);
      return esFormatoFecha(id, propios[id]);
    });
  }

  function hojaXlsx(texto, cadenas, esFecha, base1904) {
    const filas = [];
    let fila = null, numFila = -1, sig = 0;
    let celda = null, buf = '', enV = false, enT = false, enIs = false;
    SP.xml.recorrer(texto, {
      abre(n, a) {
        if (n === 'row') { numFila = a.r ? +a.r - 1 : numFila + 1; fila = []; sig = 0; }
        else if (n === 'c') {
          const col = a.r ? columnaDe(a.r) : sig;
          sig = col + 1;
          celda = { col, tipo: a.t || 'n', estilo: +(a.s || 0) };
          buf = ''; enV = false; enT = false; enIs = false;
        } else if (n === 'v' && celda) { enV = true; buf = ''; }
        else if (n === 'is' && celda) { enIs = true; buf = ''; }
        else if (n === 't' && enIs) enT = true;
      },
      cierra(n) {
        if (n === 'v') enV = false;
        else if (n === 't') enT = false;
        else if (n === 'is') enIs = false;
        else if (n === 'c' && celda) {
          let v = '';
          const t = celda.tipo;
          if (t === 's') v = cadenas[+buf] !== undefined ? cadenas[+buf] : '';
          else if (t === 'inlineStr' || t === 'str') v = buf;
          else if (t === 'e') v = '';                 // #N/A, #DIV/0!, … → faltante
          else if (t === 'b') v = buf === '1' ? 'VERDADERO' : buf === '0' ? 'FALSO' : '';
          else if (buf !== '') {
            const x = Number(buf);
            v = Number.isNaN(x) ? buf : (esFecha[celda.estilo] ? fechaDeSerie(x, base1904) : x);
          }
          fila[celda.col] = v;
          celda = null;
        } else if (n === 'row') { filas[numFila] = fila; fila = null; }
      },
      texto(s) { if (celda && (enV || enT)) buf += s; },
    });
    return densa(filas);
  }

  function leerXlsx(z) {
    const libro = z.texto('xl/workbook.xml');
    if (!libro) throw new SP.ErrorSP(T('El archivo no tiene la estructura de un libro .xlsx.'));
    const a = SP.xml.arbol(libro);
    const pr = SP.xml.buscar(a, 'workbookPr')[0];
    const base1904 = !!pr && (pr.atr.date1904 === '1' || pr.atr.date1904 === 'true');
    const destino = {};
    const rels = z.texto('xl/_rels/workbook.xml.rels');
    if (rels) for (const r of SP.xml.buscar(SP.xml.arbol(rels), 'Relationship')) destino[r.atr.Id] = r.atr.Target;
    const cadenas = cadenasCompartidas(z.texto('xl/sharedStrings.xml'));
    const esFecha = estilosFecha(z.texto('xl/styles.xml'));
    const nombres = [], hojas = {};
    SP.xml.buscar(a, 'sheet').forEach((s, i) => {
      const nombre = s.atr.name || 'Hoja' + (i + 1);
      let ruta = destino[s.atr['r:id']] || 'worksheets/sheet' + (i + 1) + '.xml';
      ruta = ruta.replace(/^\//, '').replace(/^xl\//, '');
      const txt = z.texto('xl/' + ruta);
      if (txt === null) return;
      nombres.push(nombre);
      hojas[nombre] = { filas: hojaXlsx(txt, cadenas, esFecha, base1904) };
    });
    return { nombres, hojas };
  }

  /* ---------------- .ods ---------------- */
  const LIMITE_REPETIDAS = 1000;   // la cola vacía de una hoja se guarda como una celda repetida miles de veces
  function leerOds(z) {
    const txt = z.texto('content.xml');
    if (!txt) throw new SP.ErrorSP(T('El archivo no tiene la estructura de un libro .ods.'));
    const nombres = [], hojas = {};
    let tabla = null, filas = null, fila = null, celda = null, enP = 0, bufP = '', parrafos = [];
    SP.xml.recorrer(txt, {
      abre(n, a, vacia) {
        if (n === 'table:table') { tabla = a['table:name'] || 'Hoja' + (nombres.length + 1); filas = []; }
        else if (n === 'table:table-row' && tabla) { fila = { celdas: [], repetir: Math.max(1, +(a['table:number-rows-repeated'] || 1)) }; }
        else if ((n === 'table:table-cell' || n === 'table:covered-table-cell') && fila) {
          celda = { a, cubierta: n !== 'table:table-cell', repetir: Math.max(1, +(a['table:number-columns-repeated'] || 1)) };
          parrafos = [];
          if (vacia) cerrarCelda();
        } else if (n === 'text:p' && celda) { enP++; bufP = ''; }
        else if (n === 'text:s' && enP) bufP += ' '.repeat(Math.max(1, +(a['text:c'] || 1)));
        else if (n === 'text:tab' && enP) bufP += '\t';
      },
      cierra(n) {
        if (n === 'text:p' && enP) { enP--; parrafos.push(bufP); }
        else if ((n === 'table:table-cell' || n === 'table:covered-table-cell') && celda) cerrarCelda();
        else if (n === 'table:table-row' && fila) {
          const llena = fila.celdas.some(v => v !== '');
          if (llena || fila.repetir <= LIMITE_REPETIDAS) for (let k = 0; k < fila.repetir; k++) filas.push(fila.celdas.slice());
          fila = null;
        } else if (n === 'table:table' && tabla) { nombres.push(tabla); hojas[tabla] = { filas: densa(filas) }; tabla = null; }
      },
      texto(s) { if (enP) bufP += s; },
    });
    function cerrarCelda() {
      if (!celda || !fila) { celda = null; return; }
      const a = celda.a, tipo = a['office:value-type'];
      let v = '';
      if (!celda.cubierta) {
        if (tipo === 'float' || tipo === 'percentage' || tipo === 'currency') v = Number(a['office:value']);
        else if (tipo === 'boolean') v = a['office:boolean-value'] === 'true' ? 'VERDADERO' : 'FALSO';
        else if (tipo === 'date') {
          const raw = a['office:date-value'] || '';
          v = raw.length > 10 ? raw.slice(0, 10) + (raw.slice(11, 19) !== '00:00:00' ? ' ' + raw.slice(11, 19) : '') : raw;
        } else v = parrafos.join('\n');
      }
      if (!(v === '' && celda.repetir > LIMITE_REPETIDAS)) for (let k = 0; k < celda.repetir; k++) fila.celdas.push(v);
      else fila.celdas.push('');
      celda = null;
    }
    if (!nombres.length) throw new SP.ErrorSP(T('El libro no tiene hojas que se puedan leer.'));
    return { nombres, hojas };
  }

  /** Lee un libro .xlsx, .xlsm u .ods a partir de sus bytes. */
  function leer(bytes) {
    const z = SP.zip.leer(bytes);
    if (z.nombres.includes('content.xml') && !z.nombres.includes('xl/workbook.xml')) return leerOds(z);
    return leerXlsx(z);
  }
  /** Igual, a partir de base64 (casos de validación). Devuelve las filas de una hoja. */
  function leerHojaBase64(b64, hoja) {
    const libro = leer(SP.zip.deBase64(b64));
    const nombre = hoja === undefined ? libro.nombres[0] : (typeof hoja === 'number' ? libro.nombres[hoja] : hoja);
    if (!libro.hojas[nombre]) throw new SP.ErrorSP(T('El libro no tiene la hoja «{h}».', { h: nombre }));
    return { nombres: libro.nombres, filas: libro.hojas[nombre].filas };
  }

  /** Todas las hojas de un libro en base64 (casos de validación). */
  function leerLibroBase64(b64) {
    const libro = leer(SP.zip.deBase64(b64));
    const hojas = {};
    for (const n of libro.nombres) hojas[n] = libro.hojas[n].filas;
    return { nombres: libro.nombres, hojas };
  }

  SP.hojas = { leer, leerHojaBase64, leerLibroBase64, fechaDeSerie, columnaDe };
});

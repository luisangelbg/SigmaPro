/* SigmaPro — lectura de texto delimitado (CSV, punto y coma, tabulador, barra).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.csv.decodificar(bytes)          → { texto, codificacion }  UTF-8 (con o sin BOM) o Latin-1
     SP.csv.detectar(texto)             → { delimitador, decimal }
     SP.csv.analizar(texto, op)         → filas de textos (RFC 4180: comillas dobles, "" dentro,
                                          saltos de línea dentro de comillas, CRLF, LF o CR)
     SP.csv.aNumero(texto, decimal)     → número o NaN
     SP.csv.leerColumnas(texto, op)     → { nombres, columnas } con cada columna en números si
                                          todas sus celdas no faltantes lo son, si no en textos

   leerColumnas es la capa «cruda»: decide número o texto como lo hace R al leer un CSV
   (type.convert), y así se valida contra read.csv. Qué columnas son factores, fechas o
   identificadores lo decide después SP.tipos. */
SP.definir('csv', function (SP) {
  'use strict';
  const T = SP.T;

  function decodificar(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (u8.length >= 2 && ((u8[0] === 0xff && u8[1] === 0xfe) || (u8[0] === 0xfe && u8[1] === 0xff))) {
      const le = u8[0] === 0xff;
      return { texto: new TextDecoder(le ? 'utf-16le' : 'utf-16be').decode(u8.subarray(2)), codificacion: le ? 'UTF-16LE' : 'UTF-16BE' };
    }
    const bom = u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf;
    const cuerpo = bom ? u8.subarray(3) : u8;
    try {
      return { texto: new TextDecoder('utf-8', { fatal: true }).decode(cuerpo), codificacion: 'UTF-8' };
    } catch (e) {
      return { texto: new TextDecoder('windows-1252').decode(cuerpo), codificacion: 'Latin-1 (Windows-1252)' };
    }
  }

  /** Separa en filas y celdas respetando comillas. */
  function analizar(texto, op) {
    op = op || {};
    const d = op.delimitador || ',';
    const q = op.comillas === undefined ? '"' : op.comillas;
    let t = String(texto);
    if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
    const filas = [];
    let fila = [], celda = '', dentro = false, i = 0, citada = false;
    const n = t.length;
    while (i < n) {
      const c = t[i];
      if (dentro) {
        if (c === q) {
          if (t[i + 1] === q) { celda += q; i += 2; continue; }
          dentro = false; i++; continue;
        }
        celda += c; i++; continue;
      }
      if (c === q && q && celda.trim() === '' && !citada) { dentro = true; citada = true; celda = ''; i++; continue; }
      if (c === d) { fila.push(celda); celda = ''; citada = false; i++; continue; }
      if (c === '\r' || c === '\n') {
        fila.push(celda); filas.push(fila); fila = []; celda = ''; citada = false;
        i += c === '\r' && t[i + 1] === '\n' ? 2 : 1;
        continue;
      }
      celda += c; i++;
    }
    if (dentro) throw new SP.ErrorSP(T('Hay una comilla que no se cierra en el archivo.'), T('Revisa que cada texto entre comillas tenga su comilla final.'));
    if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila); }
    /* quitar filas totalmente vacías */
    return filas.filter(f => f.some(v => v.trim() !== ''));
  }

  const NUM_PUNTO = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
  const NUM_COMA = /^[+-]?(\d+,?\d*|,\d+)([eE][+-]?\d+)?$/;

  /** Texto → número con el separador decimal dado ('.' o ','). Acepta Inf, -Inf, porcentajes no. */
  function aNumero(s, decimal) {
    if (typeof s === 'number') return s;
    const v = String(s).trim();
    if (v === '') return NaN;
    if (v === 'Inf' || v === '+Inf') return Infinity;
    if (v === '-Inf') return -Infinity;
    if ((decimal || '.') === ',') {
      if (NUM_COMA.test(v)) return Number(v.replace(',', '.'));
      /* miles con punto y decimales con coma: 1.234,5 */
      if (/^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v)) return Number(v.replace(/\./g, '').replace(',', '.'));
      return NaN;
    }
    if (NUM_PUNTO.test(v)) return Number(v);
    if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v) && /,\d{3}(\.|$)/.test(v) && (v.match(/,/g) || []).length > 1) {
      return Number(v.replace(/,/g, ''));   // 1,234,567.8 (miles con coma, sin ambigüedad)
    }
    return NaN;
  }

  /** Separador de columnas y decimal más probables, mirando las primeras líneas. */
  function detectar(texto) {
    const muestra = String(texto).replace(/^﻿/, '').slice(0, 20000);
    const candidatos = ['\t', ';', ',', '|'];
    let mejor = ',', puntaje = -1;
    for (const d of candidatos) {
      let filas;
      try { filas = analizar(muestra, { delimitador: d }).slice(0, 30); } catch (e) { continue; }
      if (filas.length > 1 && muestra.length >= 20000) filas.pop();   // la última puede venir cortada
      const anchos = filas.map(f => f.length);
      if (!anchos.length || Math.max(...anchos) < 2) continue;
      /* el ancho más frecuente y qué tan constante es */
      const conteo = {};
      for (const a of anchos) conteo[a] = (conteo[a] || 0) + 1;
      const [moda, veces] = Object.entries(conteo).sort((x, y) => y[1] - x[1])[0];
      const p = (veces / anchos.length) * 10 + Math.min(+moda, 50) / 100;
      if (p > puntaje) { puntaje = p; mejor = d; }
    }
    /* decimal: si el separador no es la coma y hay más números con coma que con punto */
    let decimal = '.';
    if (mejor !== ',') {
      let coma = 0, punto = 0;
      for (const f of analizar(muestra, { delimitador: mejor }).slice(1, 200)) {
        for (const v of f) {
          const s = v.trim();
          if (/^[+-]?\d+,\d+$/.test(s)) coma++;
          else if (/^[+-]?\d+\.\d+$/.test(s)) punto++;
        }
      }
      if (coma > punto) decimal = ',';
    }
    return { delimitador: mejor, decimal };
  }

  const FALTANTES = ['', 'NA'];
  /**
   * Lee el texto como tabla de columnas crudas.
   * op: { delimitador, decimal, encabezado: true, faltantes: ['', 'NA'] }
   */
  function leerColumnas(texto, op) {
    op = Object.assign({}, op || {});
    const det = (!op.delimitador || !op.decimal) ? detectar(texto) : null;
    const d = op.delimitador || det.delimitador;
    const decimal = op.decimal || det.decimal;
    const faltantes = new Set(op.faltantes || FALTANTES);
    const filas = analizar(texto, { delimitador: d });
    if (!filas.length) throw new SP.ErrorSP(T('El archivo está vacío.'));
    const conEncabezado = op.encabezado !== false;
    const ancho = filas.reduce((m, f) => Math.max(m, f.length), 0);
    let nombres = conEncabezado ? filas[0].map(s => s.trim()) : [];
    while (nombres.length < ancho) nombres.push('');
    nombres = nombresUnicos(nombres);
    const cuerpo = conEncabezado ? filas.slice(1) : filas;
    const columnas = {};
    nombres.forEach((nom, j) => {
      const textos = cuerpo.map(f => (f[j] === undefined ? '' : f[j].trim()));
      const falta = textos.map(s => faltantes.has(s));
      const nums = textos.map((s, i) => (falta[i] ? NaN : aNumero(s, decimal)));
      const todosNum = textos.every((s, i) => falta[i] || !Number.isNaN(nums[i]));
      const hayDatos = falta.some(f => !f);
      columnas[nom] = todosNum && hayDatos ? nums.map((x, i) => (falta[i] ? null : x)) : textos.map((s, i) => (falta[i] ? null : s));
    });
    return { nombres, columnas, delimitador: d, decimal, filas: cuerpo.length };
  }

  /** Nombres vacíos o repetidos → V1, nombre.1 … (como hace R con check.names = FALSE pero sin choques). */
  function nombresUnicos(lista) {
    const vistos = new Map(), out = [];
    lista.forEach((n, j) => {
      let base = n || 'V' + (j + 1);
      let nombre = base, k = vistos.get(base) || 0;
      while (out.includes(nombre)) { k++; nombre = base + '.' + k; }
      vistos.set(base, k);
      out.push(nombre);
    });
    return out;
  }

  SP.csv = { decodificar, analizar, detectar, aNumero, leerColumnas, nombresUnicos };
});

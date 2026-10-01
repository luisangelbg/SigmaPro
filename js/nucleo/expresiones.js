/* SigmaPro — expresiones para variables calculadas y filtros, sin eval.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Notación y resultados como en R (así se valida contra R):

     log(rend) + 2 * altura                 aritmética: + - * / ^ %% (resto)
     (rend - mean(rend)) / sd(rend)         estandarizar
     ifelse(dosis > 60, "alta", "baja")     condiciones
     bloque != "4" & rend > 0               filtros: == != < <= > >= & | !
     hibrido %in% c("H-52", "H-66")         pertenencia
     `peso seco` / 1000                     nombres con espacios entre comillas invertidas

   Funciones: log(x, base), log10, log2, log1p, exp, sqrt, abs, round(x, d), floor, ceiling,
   trunc, sign, sin, cos, tan, asin, acos, atan, pmin, pmax, ifelse, is.na, as.numeric,
   paste, paste0, y las de resumen mean, sd, var, median, min, max, sum, length (que dan un
   solo número). Las de resumen ignoran los faltantes salvo que se pida na.rm = FALSE.
   Sinónimos en español: raiz, si, media, de, mediana, minimo, maximo, suma, redondear, faltante.

   Faltantes: NA en aritmética da NA; NA & FALSE = FALSE y NA | TRUE = TRUE (lógica de tres
   valores, como R); en un filtro, una fila con NA no pasa. */
SP.definir('expresiones', function (SP) {
  'use strict';
  const T = SP.T;
  const err = (m, a) => new SP.ErrorSP(m, a || T('Revisa la expresión: nombres de columna, paréntesis y comillas.'));

  /* ---------------- fichas ---------------- */
  function fichas(s) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1, v = '';
        while (j < s.length && s[j] !== c) { if (s[j] === '\\' && j + 1 < s.length) { v += s[j + 1]; j += 2; } else v += s[j++]; }
        if (j >= s.length) throw err(T('Falta cerrar unas comillas.'));
        out.push({ t: 'texto', v }); i = j + 1; continue;
      }
      if (c === '`') {
        const j = s.indexOf('`', i + 1);
        if (j < 0) throw err(T('Falta cerrar una comilla invertida.'));
        out.push({ t: 'nombre', v: s.slice(i + 1, j) }); i = j + 1; continue;
      }
      const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (num) { out.push({ t: 'num', v: Number(num[0]) }); i += num[0].length; continue; }
      const nom = /^[\p{L}_.][\p{L}\p{N}_.]*/u.exec(s.slice(i));
      if (nom) { out.push({ t: 'nombre', v: nom[0] }); i += nom[0].length; continue; }
      const ops = ['%in%', '%%', '==', '!=', '<=', '>=', '&&', '||', '<', '>', '+', '-', '*', '/', '^', '&', '|', '!', '(', ')', ',', '='];
      const op = ops.find(o => s.startsWith(o, i));
      if (!op) throw err(T('No entiendo «{c}» en la expresión.', { c }));
      out.push({ t: 'op', v: op === '&&' ? '&' : op === '||' ? '|' : op }); i += op.length;
    }
    return out;
  }

  /* ---------------- analizador (precedencia de R) ---------------- */
  function analizar(texto) {
    const fs = fichas(String(texto || ''));
    if (!fs.length) throw err(T('La expresión está vacía.'));
    let p = 0;
    const mira = () => fs[p];
    const es = v => fs[p] && fs[p].t === 'op' && fs[p].v === v;
    const toma = v => { if (v && !es(v)) throw err(T('Se esperaba «{v}».', { v })); return fs[p++]; };

    function o() { let a = y(); while (es('|')) { toma(); a = { op: '|', a, b: y() }; } return a; }
    function y() { let a = no(); while (es('&')) { toma(); a = { op: '&', a, b: no() }; } return a; }
    function no() { if (es('!')) { toma(); return { op: '!', a: no() }; } return comp(); }
    function comp() {
      const a = suma();
      for (const c of ['==', '!=', '<=', '>=', '<', '>']) if (es(c)) { toma(); return { op: c, a, b: suma() }; }
      return a;
    }
    function suma() { let a = prod(); while (es('+') || es('-')) { const op = toma().v; a = { op, a, b: prod() }; } return a; }
    function prod() { let a = esp(); while (es('*') || es('/')) { const op = toma().v; a = { op, a, b: esp() }; } return a; }
    function esp() { let a = unario(); while (es('%%') || es('%in%')) { const op = toma().v; a = { op, a, b: unario() }; } return a; }
    function unario() {
      if (es('-')) { toma(); return { op: 'neg', a: unario() }; }
      if (es('+')) { toma(); return unario(); }
      return potencia();
    }
    function potencia() { const a = primario(); if (es('^')) { toma(); return { op: '^', a, b: unario() }; } return a; }
    function primario() {
      const f = mira();
      if (!f) throw err(T('La expresión termina antes de tiempo.'));
      if (f.t === 'num') { p++; return { num: f.v }; }
      if (f.t === 'texto') { p++; return { txt: f.v }; }
      if (f.t === 'op' && f.v === '(') { toma(); const e = o(); toma(')'); return e; }
      if (f.t === 'nombre') {
        p++;
        if (es('(')) {
          toma('(');
          const args = [], nombrados = {};
          if (!es(')')) {
            do {
              if (fs[p] && fs[p].t === 'nombre' && fs[p + 1] && fs[p + 1].t === 'op' && fs[p + 1].v === '=') {
                const k = fs[p].v; p += 2; nombrados[k] = o();
              } else args.push(o());
            } while (es(',') && toma());
          }
          toma(')');
          return { fn: f.v, args, nombrados };
        }
        if (f.v === 'TRUE' || f.v === 'T') return { log: true };
        if (f.v === 'FALSE' || f.v === 'F') return { log: false };
        if (f.v === 'NA') return { na: true };
        if (f.v === 'pi') return { num: Math.PI };
        return { col: f.v };
      }
      throw err(T('Operador inesperado «{o}».', { o: f.v }));
    }
    const e = o();
    if (p < fs.length) throw err(T('Sobra «{s}» en la expresión.', { s: fs[p].v }));
    return e;
  }

  /* ---------------- valores ---------------- */
  /* k: 'n' número, 'l' lógico (1, 0, NaN), 't' texto (null = NA). v: arreglo de largo n o escalar (es = true). */
  const esc = (k, v) => ({ k, v, es: true });
  const vec = (k, v) => ({ k, v, es: false });
  const largo = (a, n) => (a.es ? n : a.v.length);
  const en = (a, i) => (a.es ? a.v : a.v[i]);
  const comoNum = (x, k) => (k === 't' ? (x === null ? NaN : SP.csv.aNumero(x, '.')) : x);

  function mapa(n, args, k, f) {
    if (args.every(a => a.es)) return esc(k, f(...args.map(a => a.v)));
    const out = k === 't' ? new Array(n) : new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = f(...args.map(a => en(a, i)));
    return vec(k, out);
  }
  const numerico = a => {
    if (a.k === 't') throw err(T('Una operación aritmética recibió texto.'), T('Usa as.numeric() si la columna son números escritos como texto.'));
    return a;
  };

  /* round de R: elige el más cercano de los dos candidatos; empate exacto → par */
  function redondear(x, d) {
    if (!Number.isFinite(x)) return x;
    d = Number.isFinite(d) ? Math.floor(d + 0.5) : 0;
    if (d === 0) { const r = Math.round(x); return Math.abs(x - Math.trunc(x)) === 0.5 ? 2 * Math.round(x / 2) : r; }
    const sgn = x < 0 ? -1 : 1, ax = Math.abs(x);
    if (Math.log10(ax) + d > 15) return x;
    const p10 = Math.pow(10, d), x10 = p10 * ax, i10 = Math.floor(x10);
    const xd = i10 / p10, xu = Math.ceil(x10) / p10;
    const du = xu - ax, dd = ax - xd;
    return sgn * ((du < dd || (du === dd && i10 % 2 === 1)) ? xu : xd);
  }
  const restoR = (a, b) => (b === 0 ? NaN : a - Math.floor(a / b) * b);

  function resumen(nombre, a, naRm) {
    if (a.k === 't') throw err(T('«{f}» necesita números.', { f: nombre }));
    const todos = a.es ? [a.v] : Array.from(a.v);
    const hayNA = todos.some(x => Number.isNaN(x));
    if (hayNA && !naRm && nombre !== 'length') return NaN;
    const v = todos.filter(x => !Number.isNaN(x));
    switch (nombre) {
      case 'length': return todos.length;
      case 'sum': return SP.num.suma(v);
      case 'mean': return SP.num.media(v);
      case 'var': return SP.num.varianza(v);
      case 'sd': return Math.sqrt(SP.num.varianza(v));
      case 'min': return v.length ? Math.min(...v) : Infinity;
      case 'max': return v.length ? Math.max(...v) : -Infinity;
      case 'median': {
        if (!v.length) return NaN;
        const s = v.slice().sort((x, y) => x - y), m = s.length >> 1;
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
      }
    }
    return NaN;
  }

  const SINONIMOS = { raiz: 'sqrt', si: 'ifelse', media: 'mean', de: 'sd', mediana: 'median', minimo: 'min', maximo: 'max',
    suma: 'sum', redondear: 'round', faltante: 'is.na', varianza: 'var', exponencial: 'exp', absoluto: 'abs' };
  const UNARIAS = { log10: Math.log10, log2: Math.log2, log1p: Math.log1p, exp: Math.exp, sqrt: Math.sqrt, abs: Math.abs,
    floor: Math.floor, ceiling: Math.ceil, trunc: Math.trunc, sign: Math.sign, sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan };

  /** Evalúa un árbol. ctx: { n, columna(nombre) → { tipo: 'numerica' | 'factor' | 'texto', valores } } */
  function evaluar(nodo, ctx) {
    const n = ctx.n;
    const ev = x => evaluar(x, ctx);
    if ('num' in nodo) return esc('n', nodo.num);
    if ('txt' in nodo) return esc('t', nodo.txt);
    if ('log' in nodo) return esc('l', nodo.log ? 1 : 0);
    if (nodo.na) return esc('l', NaN);
    if (nodo.col !== undefined) {
      const c = ctx.columna(nodo.col);
      if (!c) throw err(T('No existe la columna «{c}».', { c: nodo.col }), T('Revisa el nombre; si tiene espacios, escríbelo entre comillas invertidas: `nombre con espacios`.'));
      return c.tipo === 'numerica' ? vec('n', c.valores) : vec('t', c.valores);
    }
    if (nodo.fn !== undefined) return llamar(nodo, ctx);
    const op = nodo.op;
    if (op === 'neg') { const a = numerico(ev(nodo.a)); return mapa(n, [a], 'n', x => -x); }
    if (op === '!') { const a = ev(nodo.a); return mapa(n, [a], 'l', x => (Number.isNaN(x) ? NaN : (x ? 0 : 1))); }
    const a = ev(nodo.a), b = ev(nodo.b);
    switch (op) {
      case '+': return mapa(n, [numerico(a), numerico(b)], 'n', (x, y) => x + y);
      case '-': return mapa(n, [numerico(a), numerico(b)], 'n', (x, y) => x - y);
      case '*': return mapa(n, [numerico(a), numerico(b)], 'n', (x, y) => x * y);
      case '/': return mapa(n, [numerico(a), numerico(b)], 'n', (x, y) => x / y);
      case '^': return mapa(n, [numerico(a), numerico(b)], 'n', (x, y) => (y === 0 ? 1 : (x === 1 ? 1 : Math.pow(x, y))));
      case '%%': return mapa(n, [numerico(a), numerico(b)], 'n', restoR);
      case '&': return mapa(n, [a, b], 'l', (x, y) => (x === 0 || y === 0 ? 0 : (Number.isNaN(x) || Number.isNaN(y) ? NaN : 1)));
      case '|': return mapa(n, [a, b], 'l', (x, y) => (x === 1 || y === 1 || (x && !Number.isNaN(x)) || (y && !Number.isNaN(y)) ? 1 : (Number.isNaN(x) || Number.isNaN(y) ? NaN : 0)));
      case '%in%': {
        const conjunto = new Set((b.es ? [b.v] : Array.from(b.v)).map(v => (v === null || Number.isNaN(v) ? 'NA' : String(v))));
        return mapa(n, [a], 'l', x => (conjunto.has(x === null || Number.isNaN(x) ? 'NA' : String(x)) ? 1 : 0));
      }
      default: {
        /* comparaciones: texto contra texto, o número contra número */
        const txt = a.k === 't' || b.k === 't';
        const cmp = {
          '==': (x, y) => x === y, '!=': (x, y) => x !== y, '<': (x, y) => x < y, '>': (x, y) => x > y,
          '<=': (x, y) => x <= y, '>=': (x, y) => x >= y,
        }[op];
        if (!cmp) throw err(T('Operador desconocido «{o}».', { o: op }));
        return mapa(n, [a, b], 'l', (x, y) => {
          if (txt) {
            if (x === null || y === null || (typeof x === 'number' && Number.isNaN(x)) || (typeof y === 'number' && Number.isNaN(y))) return NaN;
            const sx = typeof x === 'number' ? String(x) : x, sy = typeof y === 'number' ? String(y) : y;
            if (op === '==' || op === '!=') return cmp(sx, sy) ? 1 : 0;
            const nx = Number(sx), ny = Number(sy);
            return (Number.isNaN(nx) || Number.isNaN(ny) ? cmp(sx.localeCompare(sy, 'es'), 0) : cmp(nx, ny)) ? 1 : 0;
          }
          return Number.isNaN(x) || Number.isNaN(y) ? NaN : (cmp(x, y) ? 1 : 0);
        });
      }
    }
  }

  function llamar(nodo, ctx) {
    const n = ctx.n;
    const nombre = SINONIMOS[nodo.fn] || nodo.fn;
    const args = nodo.args.map(x => evaluar(x, ctx));
    const nombrado = k => (nodo.nombrados[k] ? evaluar(nodo.nombrados[k], ctx) : null);
    const pide = k => { if (args.length < k) throw err(T('«{f}» necesita {k} argumento(s).', { f: nodo.fn, k })); };
    if (UNARIAS[nombre]) { pide(1); return mapa(n, [numerico(args[0])], 'n', UNARIAS[nombre]); }
    switch (nombre) {
      case 'log': {
        pide(1);
        const base = args[1] || nombrado('base');
        if (!base) return mapa(n, [numerico(args[0])], 'n', Math.log);
        return mapa(n, [numerico(args[0]), numerico(base)], 'n', (x, b) => Math.log(x) / Math.log(b));
      }
      case 'round': {
        pide(1);
        const d = args[1] || nombrado('digits') || esc('n', 0);
        return mapa(n, [numerico(args[0]), d], 'n', redondear);
      }
      case 'pmin': case 'pmax': {
        pide(1);
        const f = nombre === 'pmin' ? Math.min : Math.max;
        return mapa(n, args.map(numerico), 'n', (...xs) => (xs.some(Number.isNaN) ? NaN : f(...xs)));
      }
      case 'ifelse': {
        pide(3);
        const [c, si, no] = args;
        const k = si.k === 't' || no.k === 't' ? 't' : (si.k === 'l' && no.k === 'l' ? 'l' : 'n');
        return mapa(n, [c, si, no], k, (x, a, b) => {
          if (Number.isNaN(x) || x === null) return k === 't' ? null : NaN;
          const r = x ? a : b;
          return k === 't' ? (r === null || (typeof r === 'number' && Number.isNaN(r)) ? null : String(r)) : r;
        });
      }
      case 'is.na': pide(1); return mapa(n, [args[0]], 'l', x => (x === null || (typeof x === 'number' && Number.isNaN(x)) ? 1 : 0));
      case 'as.numeric': pide(1); return mapa(n, [args[0]], 'n', x => comoNum(x, args[0].k === 'l' ? 'n' : args[0].k));
      case 'c': {
        if (!args.length) return vec('n', new Float64Array(0));
        const k = args.some(a => a.k === 't') ? 't' : (args.every(a => a.k === 'l') ? 'l' : 'n');
        const v = [];
        for (const a of args) for (const x of (a.es ? [a.v] : Array.from(a.v))) v.push(x);
        return vec(k, k === 't' ? v.map(x => (x === null ? null : String(x))) : Float64Array.from(v));
      }
      case 'paste': case 'paste0': {
        pide(1);
        const sepv = nombre === 'paste0' ? '' : (nodo.nombrados.sep ? String(evaluar(nodo.nombrados.sep, ctx).v) : ' ');
        const txt = x => (x === null ? 'NA' : typeof x === 'number' ? (Number.isNaN(x) ? 'NA' : SP.tipos.numeroATexto(x)) : String(x));
        return mapa(n, args, 't', (...xs) => xs.map(txt).join(sepv));
      }
      case 'mean': case 'sd': case 'var': case 'median': case 'min': case 'max': case 'sum': case 'length': {
        pide(1);
        const nr = nombrado('na.rm');
        const naRm = nr ? !!nr.v : true;
        if (args.length > 1 && (nombre === 'min' || nombre === 'max' || nombre === 'sum')) {
          const todos = args.map(a => resumen(nombre, a, naRm));
          return esc('n', nombre === 'sum' ? todos.reduce((s, x) => s + x, 0) : (nombre === 'min' ? Math.min(...todos) : Math.max(...todos)));
        }
        return esc('n', resumen(nombre, args[0], naRm));
      }
    }
    throw err(T('No conozco la función «{f}».', { f: nodo.fn }),
      T('Funciones disponibles: log, sqrt, exp, abs, round, ifelse, is.na, mean, sd, min, max, sum, median, pmin, pmax, paste.'));
  }

  /** Nombres de columnas que usa una expresión. */
  function variables(nodo, out) {
    out = out || new Set();
    if (!nodo || typeof nodo !== 'object') return out;
    if (nodo.col !== undefined) out.add(nodo.col);
    for (const k of ['a', 'b']) if (nodo[k]) variables(nodo[k], out);
    if (nodo.args) nodo.args.forEach(x => variables(x, out));
    if (nodo.nombrados) Object.values(nodo.nombrados).forEach(x => variables(x, out));
    return out;
  }

  /* ---------------- contextos ---------------- */
  function contextoTabla(tabla) {
    return {
      n: tabla.n,
      columna(nombre) {
        if (!tabla.nombres.includes(nombre)) return null;
        const c = tabla.col(nombre);
        if (c.tipo === 'numerica') return { tipo: 'numerica', valores: c.valores };
        return { tipo: 'factor', valores: Array.from(c.codigos, k => (k < 0 ? null : c.niveles[k])) };
      },
    };
  }
  function contextoHoja(hoja) {
    return {
      n: hoja.n,
      columna(nombre) {
        const j = hoja.cols.findIndex(c => c.nombre === nombre);
        if (j < 0) return null;
        const c = hoja.cols[j];
        if (c.tipo === 'numerica' || c.tipo === 'fecha') return { tipo: 'numerica', valores: c.datos };
        return { tipo: 'texto', valores: c.datos };
      },
    };
  }

  /** Resultado como arreglo de largo n: números, textos o lógicos (null = NA). */
  function comoArreglo(r, n) {
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      const x = en(r, i);
      if (r.k === 'l') out[i] = Number.isNaN(x) ? null : !!x;
      else if (r.k === 't') out[i] = x;
      else out[i] = Number.isNaN(x) ? null : x;
    }
    return out;
  }

  /** Evalúa una expresión sobre una tabla (SP.tabla). */
  const enTabla = (tabla, texto) => comoArreglo(evaluar(analizar(texto), contextoTabla(tabla)), tabla.n);
  /** Evalúa sobre la hoja editable; devuelve el valor crudo { k, v, es }. */
  const enHoja = (hoja, texto) => evaluar(analizar(texto), contextoHoja(hoja));
  /** Índices de las filas que cumplen un filtro (NA no pasa). */
  function filtrar(hoja, texto) {
    const r = enHoja(hoja, texto);
    if (r.k === 't') throw err(T('Un filtro debe dar verdadero o falso, no texto.'), T('Por ejemplo: rend > 5 & bloque != "4"'));
    const filas = [];
    for (let i = 0; i < hoja.n; i++) { const x = en(r, i); if (!Number.isNaN(x) && x) filas.push(i); }
    return filas;
  }

  SP.expresiones = { analizar, evaluar, variables, enTabla, enHoja, filtrar, comoArreglo, redondear };
});

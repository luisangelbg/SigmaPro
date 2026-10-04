/* SigmaPro — fórmulas de modelos y matriz de diseño.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Notación de fórmulas de los modelos lineales (la que usa R, que es pública):

     rend ~ bloque + hibrido * N        a*b = a + b + a:b
     y ~ (a + b + c)^2                  todas las interacciones hasta de orden 2
     y ~ a / b                          b anidado en a: a + a:b
     y ~ a + b - a:b                    quitar un término
     y ~ 0 + a   ó   y ~ a - 1          sin intercepto

   Los términos quedan ordenados como en R: primero los efectos principales, luego
   las interacciones dobles, luego las triples; dentro de cada orden, en el orden en
   que aparecen. Las variables de una interacción van en el orden en que aparecen por
   primera vez en la fórmula (la respuesta primero).

   Codificación de cada factor en cada término (regla de marginalidad):
   - por contrastes si el término sin ese factor está vacío o está contenido en
     algún término anterior;
   - por indicadoras (una columna por nivel) en otro caso;
   - sin intercepto, el primer factor del primer término que tenga factores va por
     indicadoras.
   Por eso a/b da b con indicadoras dentro de cada nivel de a, y x + x:a da una
   pendiente común más diferencias por nivel. */
SP.definir('formula', function (SP) {
  'use strict';
  const T = SP.T;
  const error = (m, a) => new SP.ErrorSP(m, a);

  /* ---------------- analizador ---------------- */
  function fichas(texto) {
    const out = [];
    let i = 0;
    while (i < texto.length) {
      const c = texto[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '`') {
        const f = texto.indexOf('`', i + 1);
        if (f < 0) throw error(T('Falta cerrar la comilla invertida en la fórmula.'));
        out.push({ t: 'nombre', v: texto.slice(i + 1, f) });
        i = f + 1; continue;
      }
      if (texto.startsWith('%in%', i)) { out.push({ t: 'op', v: '%in%' }); i += 4; continue; }
      if (c === '=') throw error(T('Entre la respuesta y los términos va «~», no «=».'), T('Por ejemplo: rend ~ tratamiento'));
      if ('~+-*:/^()'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
      if (/[0-9]/.test(c)) {
        const m = /^[0-9]+(\.[0-9]+)?/.exec(texto.slice(i));
        out.push({ t: 'num', v: Number(m[0]) }); i += m[0].length; continue;
      }
      const m = /^[\p{L}_.][\p{L}\p{N}_.]*/u.exec(texto.slice(i));
      if (!m) throw error(T('No entiendo «{c}» en la fórmula.', { c }), T('Usa nombres de columna, + - * : / ^ y paréntesis.'));
      out.push({ t: 'nombre', v: m[0] }); i += m[0].length;
    }
    return out;
  }

  /* Un «valor» de la expresión es { terminos: [Set de variables], intercepto: true | false | null }.
     intercepto null = no lo menciona. */
  /** op.conservarOrden: los términos quedan en el orden escrito, como terms(…, keep.order = TRUE) de R (el látice
      lo necesita para que los tratamientos vayan al final, ajustados por los bloques, en las sumas de cuadrados tipo I). */
  function analizar(texto, op) {
    const fs = fichas(String(texto || ''));
    let pos = 0;
    const variables = [];          // en orden de primera aparición
    const indice = nombre => { let k = variables.indexOf(nombre); if (k < 0) { variables.push(nombre); k = variables.length - 1; } return k; };
    const mira = () => fs[pos];
    const toma = v => { const f = fs[pos]; if (!f || (v && f.v !== v)) throw error(T('Fórmula incompleta o mal formada.'), T('Revisa los paréntesis y los operadores.')); pos++; return f; };

    /* respuesta */
    let respuesta = null;
    const tilde = fs.findIndex(f => f.t === 'op' && f.v === '~');
    if (tilde < 0) throw error(T('La fórmula necesita «~» entre la respuesta y los términos.'), T('Por ejemplo: rend ~ tratamiento'));
    if (tilde > 0) {
      if (tilde !== 1 || fs[0].t !== 'nombre') throw error(T('A la izquierda de «~» va una sola columna (la respuesta).'));
      respuesta = fs[0].v; indice(respuesta);
    }
    pos = tilde + 1;

    const unir = (a, b) => {
      const ts = a.terminos.slice();
      for (const t of b.terminos) if (!ts.some(s => igual(s, t))) ts.push(t);
      return { terminos: ts, intercepto: b.intercepto !== null ? b.intercepto : a.intercepto };
    };
    const interaccion = (a, b) => {
      const ts = [];
      for (const x of a.terminos) for (const y of b.terminos) {
        const s = new Set([...x, ...y]);
        if (!ts.some(t => igual(t, s))) ts.push(s);
      }
      return { terminos: ts, intercepto: null };
    };

    function primario() {
      const f = mira();
      if (!f) throw error(T('Faltan términos después de un operador.'));
      if (f.t === 'op' && f.v === '(') { toma('('); const v = suma(); toma(')'); return v; }
      if (f.t === 'num') {
        toma();
        if (f.v === 1) return { terminos: [], intercepto: true };
        if (f.v === 0) return { terminos: [], intercepto: false };
        throw error(T('El único número permitido en una fórmula es 0 o 1.'));
      }
      if (f.t === 'nombre') { toma(); return { terminos: [new Set([indice(f.v)])], intercepto: null }; }
      throw error(T('Operador inesperado «{o}».', { o: f.v }));
    }
    function potencia() {
      let v = primario();
      while (mira() && mira().v === '^') {
        toma('^');
        const n = toma();
        if (n.t !== 'num' || n.v < 1 || n.v !== Math.floor(n.v)) throw error(T('Después de «^» va un número entero positivo.'));
        let r = v;
        for (let k = 1; k < n.v; k++) r = unir(r, interaccion(r, v));
        v = { terminos: r.terminos, intercepto: null };
      }
      return v;
    }
    function dosPuntos() {
      let v = potencia();
      while (mira() && (mira().v === ':' || mira().v === '%in%')) { toma(); v = interaccion(v, potencia()); }
      return v;
    }
    function producto() {
      let v = dosPuntos();
      while (mira() && (mira().v === '*' || mira().v === '/')) {
        const op = toma().v;
        const w = dosPuntos();
        if (op === '*') v = unir(unir(v, w), interaccion(v, w));
        else {
          /* a / b = a + (todas las variables de a) : b */
          const todas = new Set(); v.terminos.forEach(t => t.forEach(x => todas.add(x)));
          v = unir(v, interaccion({ terminos: [todas], intercepto: null }, w));
        }
      }
      return v;
    }
    function suma() {
      let v;
      if (mira() && mira().v === '-') { toma('-'); const w = producto(); v = restar({ terminos: [], intercepto: null }, w); }
      else if (mira() && mira().v === '+') { toma('+'); v = producto(); }
      else v = producto();
      while (mira() && (mira().v === '+' || mira().v === '-')) {
        const op = toma().v;
        const w = producto();
        v = op === '+' ? unir(v, w) : restar(v, w);
      }
      return v;
    }
    function restar(a, b) {
      const ts = a.terminos.filter(t => !b.terminos.some(s => igual(s, t)));
      const quitaInt = b.intercepto === true ? false : (b.intercepto === false ? true : a.intercepto);
      return { terminos: ts, intercepto: quitaInt };
    }

    const v = suma();
    if (pos < fs.length) throw error(T('Sobra «{s}» al final de la fórmula.', { s: fs[pos].v }));
    /* orden de R: por orden del término (estable), variables en orden de aparición; o el escrito, si se pide */
    const conservar = !!(op && op.conservarOrden);
    const terminos = v.terminos.map((s, i) => ({ vars: [...s].sort((a, b) => a - b), i }))
      .sort((a, b) => (conservar ? 0 : a.vars.length - b.vars.length) || (a.i - b.i))
      .map(t => ({ variables: t.vars.map(k => variables[k]), etiqueta: t.vars.map(k => variables[k]).join(':'), orden: t.vars.length }));
    return { respuesta, terminos, intercepto: v.intercepto !== false, variables: variables.filter(x => x !== respuesta) };
  }
  const igual = (a, b) => a.size === b.size && [...a].every(x => b.has(x));

  /* ---------------- contrastes ---------------- */
  /** Matriz de contrastes (k × columnas, por filas: m[nivel][columna]) y nombres de columna. */
  function contrastes(tipo, niveles, puntajes) {
    const k = niveles.length;
    const m = Array.from({ length: k }, () => []);
    let nombres;
    switch (tipo || 'tratamiento') {
      case 'tratamiento':
        for (let i = 0; i < k; i++) for (let j = 1; j < k; j++) m[i].push(i === j ? 1 : 0);
        nombres = niveles.slice(1);
        break;
      case 'suma':
        for (let i = 0; i < k; i++) for (let j = 0; j < k - 1; j++) m[i].push(i === k - 1 ? -1 : (i === j ? 1 : 0));
        nombres = Array.from({ length: k - 1 }, (_, j) => String(j + 1));
        break;
      case 'helmert':
        for (let i = 0; i < k; i++) for (let j = 1; j < k; j++) m[i].push(i < j ? -1 : (i === j ? j : 0));
        nombres = Array.from({ length: k - 1 }, (_, j) => String(j + 1));
        break;
      case 'polinomial': {
        const P = polinomios(k, puntajes);
        for (let i = 0; i < k; i++) for (let j = 1; j < k; j++) m[i].push(P[i][j]);
        nombres = Array.from({ length: k - 1 }, (_, j) => (j === 0 ? '.L' : j === 1 ? '.Q' : j === 2 ? '.C' : '^' + (j + 1)));
        break;
      }
      case 'indicadoras':
        for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) m[i].push(i === j ? 1 : 0);
        nombres = niveles.slice();
        break;
      default:
        throw error(T('Tipo de contraste desconocido: «{t}».', { t: tipo }));
    }
    return { matriz: m, nombres };
  }

  /**
   * Polinomios ortogonales normalizados de grados 0 … k−1 sobre los puntajes (1 … k por
   * omisión, o las dosis reales si no están igualmente espaciadas): Gram-Schmidt de las
   * potencias de los puntajes centrados, cada uno con coeficiente principal positivo.
   * Devuelve P[nivel][grado].
   */
  function polinomios(k, puntajes) {
    const s = puntajes ? puntajes.map(Number) : Array.from({ length: k }, (_, i) => i + 1);
    if (s.length !== k) throw error(T('Hacen falta {k} puntajes para {k} niveles.', { k }));
    if (new Set(s).size !== k) throw error(T('Los puntajes de los niveles deben ser distintos.'));
    const media = s.reduce((a, b) => a + b, 0) / k;
    const x = s.map(v => v - media);
    const Q = [];
    for (let g = 0; g < k; g++) {
      let v = x.map(t => Math.pow(t, g));
      /* Gram-Schmidt modificado, dos pasadas para mayor estabilidad */
      for (let pasada = 0; pasada < 2; pasada++) {
        for (const q of Q) {
          const pr = v.reduce((a, b, i) => a + b * q[i], 0);
          v = v.map((t, i) => t - pr * q[i]);
        }
      }
      const nv = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
      Q.push(v.map(t => t / nv));
    }
    return Array.from({ length: k }, (_, i) => Q.map(q => q[i]));
  }

  /* ---------------- matriz de diseño ---------------- */
  /**
   * Arma la matriz de diseño de una fórmula sobre una tabla.
   * @param {object} tabla   SP.tabla
   * @param {string|object} f  texto de la fórmula o el resultado de analizar()
   * @param {object} [op]  { contrastes: { factor: 'tratamiento'|'suma'|'helmert'|'polinomial' },
   *                         puntajes: { factor: [..] }, todosSuma: true (tipo III) }
   * @returns {{ X, n, p, columnas, asignacion, terminos, intercepto, y, filas, niveles }}
   *   asignacion[j]: 0 = intercepto, 1… = número de término (como el atributo assign de R)
   */
  function matrizModelo(tabla, f, op) {
    op = op || {};
    const form = typeof f === 'string' ? analizar(f, op) : f;
    const usadas = form.respuesta ? [form.respuesta, ...form.variables] : form.variables;
    for (const v of usadas) tabla.col(v);   // lanza si no existe

    /* filas completas (como na.omit); op.filas restringe a esas filas (otro modelo sobre los mismos datos) */
    const candidatas = op.filas || null, total = candidatas ? candidatas.length : tabla.n;
    const nums = [], facs = [];
    for (const v of new Set(usadas)) { const c = tabla.col(v); if (c.tipo === 'numerica') nums.push(c.valores); else facs.push(c.codigos); }
    const todas = new Int32Array(total);
    let n = 0;
    for (let r = 0; r < total; r++) {
      const i = candidatas ? candidatas[r] : r;
      let ok = true;
      for (let k = 0; k < nums.length && ok; k++) if (nums[k][i] !== nums[k][i]) ok = false;
      for (let k = 0; k < facs.length && ok; k++) if (facs[k][i] < 0) ok = false;
      if (ok) todas[n++] = i;
    }
    const filas = todas.subarray(0, n);
    if (!n) throw error(T('No queda ninguna fila completa con las variables del modelo.'), T('Revisa los valores faltantes.'));

    /* factores: niveles usados, en el orden original (como drop.unused.levels) */
    const niveles = {}, recodigo = {};
    for (const v of form.variables) {
      const c = tabla.col(v);
      if (c.tipo !== 'factor') continue;
      const usado = new Array(c.niveles.length).fill(false), cod = c.codigos;
      for (let r = 0; r < n; r++) usado[cod[filas[r]]] = true;
      const mapa = new Int32Array(c.niveles.length).fill(-1);
      const lista = [];
      c.niveles.forEach((nv, k) => { if (usado[k]) { mapa[k] = lista.length; lista.push(nv); } });
      niveles[v] = lista; recodigo[v] = mapa;
      if (lista.length < 2 && form.terminos.some(t => t.variables.includes(v))) {
        throw error(T('El factor «{v}» tiene un solo nivel con datos.', { v }), T('Un factor necesita al menos dos niveles para entrar al modelo.'));
      }
    }
    const esFactor = v => tabla.col(v).tipo === 'factor';

    /* codificación de cada factor en cada término */
    const codigos = form.terminos.map((t, ti) => t.variables.map(v => {
      if (!esFactor(v)) return 'numerica';
      const resto = t.variables.filter(x => x !== v);
      if (!resto.length) return 'contrastes';
      for (let tj = 0; tj < ti; tj++) if (resto.every(x => form.terminos[tj].variables.includes(x))) return 'contrastes';
      return 'indicadoras';
    }));
    if (!form.intercepto) {
      busca: for (let ti = 0; ti < form.terminos.length; ti++) {
        /* primer factor en el orden de las variables de la fórmula */
        const vs = form.terminos[ti].variables;
        for (const v of form.variables) if (vs.includes(v) && esFactor(v)) { codigos[ti][vs.indexOf(v)] = 'indicadoras'; break busca; }
      }
    }

    const tipoContraste = v => (op.todosSuma ? 'suma' : (op.contrastes && op.contrastes[v]) || 'tratamiento');
    const bloques = [];   // por término: { nombres, valores: (fila) → arreglo de la columna }
    const columnas = [], asignacion = [], cols = [];
    if (form.intercepto) {
      columnas.push('(Intercepto)'); asignacion.push(0);
      cols.push(new Float64Array(n).fill(1));
    }
    form.terminos.forEach((t, ti) => {
      /* cada variable aporta una lista de columnas: { nombre, valores: Float64Array(n) } */
      const partes = t.variables.map((v, vi) => {
        const c = tabla.col(v);
        if (codigos[ti][vi] === 'numerica') {
          const x = new Float64Array(n), val = c.valores;
          for (let r = 0; r < n; r++) x[r] = val[filas[r]];
          return [{ nombre: v, valores: x }];
        }
        const nv = niveles[v], mapa = recodigo[v];
        const tipo = codigos[ti][vi] === 'indicadoras' ? 'indicadoras' : tipoContraste(v);
        const pj = op.puntajes && op.puntajes[v];
        const ct = contrastes(tipo, nv, pj && pj.length === nv.length ? pj : (pj ? nv.map(l => pj[c.niveles.indexOf(l)]) : undefined));
        const cod = c.codigos;
        return ct.nombres.map((nom, j) => {
          const porNivel = new Float64Array(c.niveles.length);
          for (let k = 0; k < porNivel.length; k++) if (mapa[k] >= 0) porNivel[k] = ct.matriz[mapa[k]][j];
          const x = new Float64Array(n);
          for (let r = 0; r < n; r++) x[r] = porNivel[cod[filas[r]]];
          return { nombre: v + nom, valores: x };
        });
      });
      /* producto: la primera variable varía más rápido */
      let combinadas = partes[0];
      for (let k = 1; k < partes.length; k++) {
        const nuevas = [];
        for (const b of partes[k]) for (const a of combinadas) {
          const x = new Float64Array(n);
          for (let r = 0; r < n; r++) x[r] = a.valores[r] * b.valores[r];
          nuevas.push({ nombre: a.nombre + ':' + b.nombre, valores: x });
        }
        combinadas = nuevas;
      }
      for (const cmb of combinadas) { columnas.push(cmb.nombre); asignacion.push(ti + 1); cols.push(cmb.valores); }
      bloques.push(combinadas.length);
    });
    const p = cols.length;
    const X = new Float64Array(n * p);
    cols.forEach((c, j) => X.set(c, j * n));
    let y = null;
    if (form.respuesta) {
      const c = tabla.col(form.respuesta);
      if (c.tipo !== 'numerica') throw error(T('La respuesta «{r}» debe ser numérica.', { r: form.respuesta }));
      y = new Float64Array(n);
      const val = c.valores;
      for (let r = 0; r < n; r++) y[r] = val[filas[r]];
    }
    return { X, n, p, columnas, asignacion: Int32Array.from(asignacion), terminos: form.terminos, intercepto: form.intercepto,
      respuesta: form.respuesta, y, filas: Int32Array.from(filas), niveles, formula: form, codificacion: codigos };
  }

  /** Versión para las pruebas y la interfaz: la matriz como columnas de números. */
  function matrizComoColumnas(tabla, f, op) {
    const m = matrizModelo(tabla, f, op);
    const valores = [];
    for (let j = 0; j < m.p; j++) valores.push(Array.from(m.X.subarray(j * m.n, (j + 1) * m.n)));
    return { columnas: m.columnas, asignacion: Array.from(m.asignacion), valores, terminos: m.terminos.map(t => t.etiqueta), n: m.n };
  }

  SP.formula = { analizar, contrastes, polinomios, matrizModelo, matrizComoColumnas };
});

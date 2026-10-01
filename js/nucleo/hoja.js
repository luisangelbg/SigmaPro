/* SigmaPro — hoja de datos editable con deshacer y rehacer.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Es el modelo detrás de la rejilla del bloque Datos. No toca el DOM: la rejilla solo
   lo dibuja. Guarda cada columna en la forma que le corresponde a su tipo:

     numerica   Float64Array            (NaN = faltante)
     fecha      Float64Array de días    (desde 1970-01-01, UTC)
     factor     textos + niveles en orden
     texto, id  textos                  (null = faltante)

   Toda modificación pasa por un método que registra cómo deshacerla. Las columnas
   derivadas (transformaciones, variables calculadas) se agregan como columnas nuevas:
   la original nunca se sobrescribe.

     const h = SP.hoja.crear({ nombres, columnas, tipos })
     h.texto(i, j) · h.editar(i, j, texto) · h.pegar(i, j, matriz) · h.borrar(i0, j0, i1, j1)
     h.agregarColumna({ nombre, tipo, datos }) · h.eliminarColumna(j) · h.renombrar(j, nombre)
     h.cambiarTipo(j, tipo) · h.ordenarNiveles(j, niveles) · h.agregarFilas(k) · h.eliminarFilas(lista)
     h.deshacer() · h.rehacer() · h.version · h.aTabla() */
SP.definir('hoja', function (SP) {
  'use strict';
  const T = SP.T;
  const LIMITE_HISTORIAL = 200;

  function nuevaColumna(nombre, tipo, valores, op, niveles) {
    const c = SP.tipos.convertir(valores, tipo, op);
    const col = { nombre, tipo, datos: c.datos };
    if (tipo === 'factor') col.niveles = niveles ? niveles.slice() : SP.tipos.ordenarNiveles(c.datos);
    return { col, fallidos: c.fallidos };
  }
  /* copia profunda de una columna (para deshacer) */
  const copiar = c => Object.assign({}, c, {
    datos: c.datos instanceof Float64Array ? Float64Array.from(c.datos) : c.datos.slice(),
    niveles: c.niveles ? c.niveles.slice() : undefined,
  });

  /**
   * @param {object} def { nombres, columnas: { nombre: valores crudos }, tipos?: { nombre: 'tipo' | { tipo, niveles } },
   *                       opciones?: { decimal, faltantes } }
   *   Sin tipo dado, se infiere con SP.tipos.inferir (la razón queda en col.razon).
   */
  function crear(def) {
    def = def || {};
    const op = Object.assign({ decimal: '.', faltantes: ['', 'NA', 'NaN', '.', 'N/A'] }, def.opciones || {});
    const nombres = def.nombres || Object.keys(def.columnas || {});
    const cols = [];
    let n = 0;
    for (const nom of nombres) n = Math.max(n, (def.columnas[nom] || []).length);
    /* lo pegado o leído llega como texto: faltantes → null y números escritos → número
       (los códigos con cero inicial, como «007», se quedan como texto) */
    const crudo = v => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return Number.isNaN(v) ? null : v;
      const s = String(v).trim();
      if (op.faltantes.includes(s)) return null;
      if (/^[+-]?0\d+$/.test(s)) return s;
      const x = SP.csv.aNumero(s, op.decimal);
      return Number.isNaN(x) ? s : x;
    };
    for (const nom of nombres) {
      const vals = Array.from(def.columnas[nom] || [], crudo);
      while (vals.length < n) vals.push(null);
      const t = def.tipos && def.tipos[nom];
      let tipo, niveles, razon = '';
      if (t) { tipo = typeof t === 'string' ? t : t.tipo; niveles = t.niveles; }
      else { const inf = SP.tipos.inferir(nom, vals); tipo = inf.tipo; niveles = inf.niveles; razon = inf.razon; }
      const { col } = nuevaColumna(nom, tipo, vals, op, niveles);
      col.razon = razon;
      cols.push(col);
    }
    return new Hoja(cols, n, op);
  }

  function Hoja(cols, n, op) {
    this.cols = cols;
    this.n = n;
    this.opciones = op;
    this.version = 0;
    this._pasado = [];
    this._futuro = [];
    this._cacheTabla = null;
  }
  const H = Hoja.prototype;

  Object.defineProperty(H, 'nombres', { get() { return this.cols.map(c => c.nombre); } });
  Object.defineProperty(H, 'p', { get() { return this.cols.length; } });

  H.indice = function (nombre) {
    const j = this.cols.findIndex(c => c.nombre === nombre);
    if (j < 0) throw new SP.ErrorSP(T('No existe la columna «{c}».', { c: nombre }));
    return j;
  };

  /* ---------------- lectura ---------------- */
  H.valor = function (i, j) {
    const c = this.cols[j];
    const v = c.datos[i];
    if (c.tipo === 'numerica' || c.tipo === 'fecha') return Number.isNaN(v) ? null : v;
    return v;
  };
  /** Texto para mostrar en la celda. */
  H.texto = function (i, j) {
    const c = this.cols[j];
    const v = c.datos[i];
    if (c.tipo === 'numerica') {
      if (Number.isNaN(v)) return '';
      const s = SP.tipos.numeroATexto(v);
      return this.opciones.decimal === ',' ? s.replace('.', ',') : s;
    }
    if (c.tipo === 'fecha') return SP.tipos.textoFecha(v);
    return v === null ? '' : v;
  };
  H.faltantes = function (j) {
    const c = this.cols[j];
    let k = 0;
    for (let i = 0; i < this.n; i++) if (c.tipo === 'numerica' || c.tipo === 'fecha' ? Number.isNaN(c.datos[i]) : c.datos[i] === null) k++;
    return k;
  };

  /* ---------------- historial ---------------- */
  H._registrar = function (descripcion, deshacer, rehacer) {
    this._pasado.push({ descripcion, deshacer, rehacer });
    if (this._pasado.length > LIMITE_HISTORIAL) this._pasado.shift();
    this._futuro = [];
    this._cambio();
  };
  H._cambio = function () { this.version++; this._cacheTabla = null; };
  H.puedeDeshacer = function () { return this._pasado.length > 0; };
  H.puedeRehacer = function () { return this._futuro.length > 0; };
  H.descripcionDeshacer = function () { const u = this._pasado[this._pasado.length - 1]; return u ? u.descripcion : ''; };
  H.descripcionRehacer = function () { const u = this._futuro[this._futuro.length - 1]; return u ? u.descripcion : ''; };
  H.deshacer = function () {
    const u = this._pasado.pop();
    if (!u) return null;
    u.deshacer();
    this._futuro.push(u);
    this._cambio();
    return u.descripcion;
  };
  H.rehacer = function () {
    const u = this._futuro.pop();
    if (!u) return null;
    u.rehacer();
    this._pasado.push(u);
    this._cambio();
    return u.descripcion;
  };

  /* ---------------- celdas ---------------- */
  /** Convierte el texto escrito al valor interno de la columna; devuelve { valor, ok, nuevoNivel }. */
  H._interpretar = function (j, texto) {
    const c = this.cols[j];
    const s = texto === null || texto === undefined ? '' : String(texto).trim();
    const falta = s === '' || this.opciones.faltantes.includes(s);
    if (c.tipo === 'numerica') {
      if (falta) return { valor: NaN, ok: true };
      const x = typeof texto === 'number' ? texto : SP.csv.aNumero(s, this.opciones.decimal);
      return Number.isNaN(x) ? { valor: NaN, ok: false } : { valor: x, ok: true };
    }
    if (c.tipo === 'fecha') {
      if (falta) return { valor: NaN, ok: true };
      const x = SP.tipos.fecha(s);
      return Number.isNaN(x) ? { valor: NaN, ok: false } : { valor: x, ok: true };
    }
    if (falta) return { valor: null, ok: true };
    const v = typeof texto === 'number' ? SP.tipos.numeroATexto(texto) : s;
    return { valor: v, ok: true, nuevoNivel: c.tipo === 'factor' && !c.niveles.includes(v) };
  };

  /** Escribe un bloque de celdas desde (i0, j0). matriz: filas de textos. Agrega filas si hace falta. */
  H.pegar = function (i0, j0, matriz, descripcion) {
    const filas = matriz.length;
    if (!filas) return { rechazadas: 0 };
    const ancho = Math.max(...matriz.map(f => f.length));
    if (j0 + ancho > this.p) {
      throw new SP.ErrorSP(T('Lo pegado tiene {a} columnas y desde aquí solo caben {b}.', { a: ancho, b: this.p - j0 }),
        T('Pega desde una columna más a la izquierda o agrega columnas primero.'));
    }
    const nAntes = this.n;
    const crecer = Math.max(0, i0 + filas - this.n);
    const antes = [];     // [i, j, valorPrevio]
    const nivelesAntes = new Map();
    let rechazadas = 0;
    const aplicar = () => {
      if (crecer) this._crecer(crecer);
      for (let r = 0; r < filas; r++) for (let k = 0; k < matriz[r].length; k++) {
        const i = i0 + r, j = j0 + k, c = this.cols[j];
        const res = this._interpretar(j, matriz[r][k]);
        if (!res.ok) { rechazadas++; continue; }
        if (res.nuevoNivel) { if (!nivelesAntes.has(j)) nivelesAntes.set(j, c.niveles.slice()); c.niveles.push(res.valor); }
        antes.push([i, j, c.datos[i]]);
        c.datos[i] = res.valor;
      }
    };
    aplicar();
    const despues = antes.map(([i, j]) => [i, j, this.cols[j].datos[i]]);
    const nivelesDespues = new Map([...nivelesAntes.keys()].map(j => [j, this.cols[j].niveles.slice()]));
    this._registrar(descripcion || T('Pegar {n} celdas', { n: antes.length }),
      () => {
        for (let k = antes.length - 1; k >= 0; k--) { const [i, j, v] = antes[k]; this.cols[j].datos[i] = v; }
        for (const [j, nv] of nivelesAntes) this.cols[j].niveles = nv.slice();
        if (crecer) this._recortar(nAntes);
      },
      () => {
        if (crecer) this._crecer(crecer);
        for (const [i, j, v] of despues) this.cols[j].datos[i] = v;
        for (const [j, nv] of nivelesDespues) this.cols[j].niveles = nv.slice();
      });
    return { rechazadas, celdas: antes.length };
  };
  H.editar = function (i, j, texto) {
    const r = this.pegar(i, j, [[texto]], T('Editar la celda {c}{f}', { c: this.cols[j].nombre + ' ', f: i + 1 }));
    if (r.rechazadas) {
      throw new SP.ErrorSP(T('«{t}» no es un valor válido para «{c}» ({tipo}).', { t: texto, c: this.cols[j].nombre, tipo: nombreTipo(this.cols[j].tipo) }),
        T('Escribe un número (o deja la celda vacía si falta), o cambia el tipo de la columna.'));
    }
    return r;
  };
  H.borrar = function (i0, j0, i1, j1) {
    const m = [];
    for (let i = i0; i <= i1; i++) { const f = []; for (let j = j0; j <= j1; j++) f.push(''); m.push(f); }
    return this.pegar(i0, j0, m, T('Borrar {n} celdas', { n: m.length * (j1 - j0 + 1) }));
  };

  H._crecer = function (k) {
    for (const c of this.cols) {
      if (c.datos instanceof Float64Array) { const d = new Float64Array(this.n + k).fill(NaN); d.set(c.datos); c.datos = d; }
      else for (let i = 0; i < k; i++) c.datos.push(null);
    }
    this.n += k;
  };
  H._recortar = function (n) {
    for (const c of this.cols) c.datos = c.datos.slice(0, n);
    this.n = n;
  };

  /* ---------------- filas ---------------- */
  H.agregarFilas = function (k) {
    const nAntes = this.n;
    this._crecer(k);
    this._registrar(T('Agregar {k} filas', { k }), () => this._recortar(nAntes), () => this._crecer(k));
  };
  H.eliminarFilas = function (lista) {
    const quitar = new Set(lista);
    if (!quitar.size) return;
    const previas = this.cols.map(copiar), nAntes = this.n;
    const filtrar = () => {
      for (const c of this.cols) {
        if (c.datos instanceof Float64Array) c.datos = c.datos.filter((_, i) => !quitar.has(i));
        else c.datos = c.datos.filter((_, i) => !quitar.has(i));
      }
      this.n = nAntes - quitar.size;
    };
    filtrar();
    const despues = this.cols.map(copiar);
    this._registrar(T('Eliminar {k} filas', { k: quitar.size }),
      () => { this.cols = previas.map(copiar); this.n = nAntes; },
      () => { this.cols = despues.map(copiar); this.n = nAntes - quitar.size; });
  };

  /* ---------------- columnas ---------------- */
  H._nombreLibre = function (base) {
    let nombre = base, k = 1;
    while (this.cols.some(c => c.nombre === nombre)) nombre = base + '_' + (++k);
    return nombre;
  };
  /**
   * Agrega una columna. def: { nombre, tipo, datos (crudos o ya en forma interna), niveles,
   * posicion, origen: 'calculada' | 'transformada' | 'importada', detalle }.
   */
  H.agregarColumna = function (def) {
    const nombre = this._nombreLibre(def.nombre || 'V' + (this.p + 1));
    const tipo = def.tipo || 'numerica';
    let col;
    if (def.datos instanceof Float64Array && (tipo === 'numerica' || tipo === 'fecha')) {
      if (def.datos.length !== this.n) throw new SP.ErrorSP(T('La columna nueva no tiene el número de filas de la hoja.'));
      col = { nombre, tipo, datos: Float64Array.from(def.datos) };
    } else {
      const vals = def.datos ? Array.from(def.datos) : new Array(this.n).fill(null);
      if (vals.length !== this.n) throw new SP.ErrorSP(T('La columna nueva no tiene el número de filas de la hoja.'));
      col = nuevaColumna(nombre, tipo, vals, this.opciones, def.niveles).col;
    }
    col.origen = def.origen || '';
    col.detalle = def.detalle || '';
    const pos = def.posicion === undefined ? this.p : Math.max(0, Math.min(this.p, def.posicion));
    this.cols.splice(pos, 0, col);
    const guardada = copiar(col);
    this._registrar(T('Agregar la columna «{c}»', { c: nombre }),
      () => { this.cols.splice(pos, 1); },
      () => { this.cols.splice(pos, 0, copiar(guardada)); });
    return nombre;
  };
  H.eliminarColumna = function (j) {
    const previa = copiar(this.cols[j]);
    this.cols.splice(j, 1);
    this._registrar(T('Eliminar la columna «{c}»', { c: previa.nombre }),
      () => { this.cols.splice(j, 0, copiar(previa)); },
      () => { this.cols.splice(j, 1); });
  };
  H.renombrar = function (j, nombre) {
    nombre = String(nombre || '').trim();
    if (!nombre) throw new SP.ErrorSP(T('El nombre de la columna no puede quedar vacío.'));
    if (this.cols.some((c, k) => k !== j && c.nombre === nombre)) throw new SP.ErrorSP(T('Ya hay una columna llamada «{c}».', { c: nombre }));
    const previo = this.cols[j].nombre;
    if (previo === nombre) return;
    this.cols[j].nombre = nombre;
    this._registrar(T('Renombrar «{a}» como «{b}»', { a: previo, b: nombre }),
      () => { this.cols[j].nombre = previo; }, () => { this.cols[j].nombre = nombre; });
  };
  /** Cambia el tipo de una columna. Devuelve cuántos valores no se pudieron convertir (quedan faltantes). */
  H.cambiarTipo = function (j, tipo, niveles) {
    const previa = copiar(this.cols[j]);
    if (previa.tipo === tipo && !niveles) return { fallidos: 0 };
    const crudos = [];
    for (let i = 0; i < this.n; i++) crudos.push(this.valor(i, j) === null ? null : (previa.tipo === 'fecha' ? SP.tipos.textoFecha(previa.datos[i]) : this.valor(i, j)));
    const { col, fallidos } = nuevaColumna(previa.nombre, tipo, crudos, this.opciones, niveles);
    Object.assign(col, { origen: previa.origen, detalle: previa.detalle, razon: '' });
    this.cols[j] = col;
    const nueva = copiar(col);
    this._registrar(T('Cambiar «{c}» a {t}', { c: previa.nombre, t: nombreTipo(tipo) }),
      () => { this.cols[j] = copiar(previa); }, () => { this.cols[j] = copiar(nueva); });
    return { fallidos };
  };
  H.ordenarNiveles = function (j, niveles) {
    const c = this.cols[j];
    if (c.tipo !== 'factor') throw new SP.ErrorSP(T('Solo los factores tienen niveles.'));
    const actuales = new Set(c.niveles);
    if (niveles.length !== actuales.size || !niveles.every(v => actuales.has(v))) throw new SP.ErrorSP(T('La lista de niveles no coincide con los del factor.'));
    const previos = c.niveles.slice(), nuevos = niveles.slice();
    c.niveles = nuevos.slice();
    this._registrar(T('Reordenar los niveles de «{c}»', { c: c.nombre }),
      () => { c.niveles = previos.slice(); }, () => { c.niveles = nuevos.slice(); });
  };

  /* ---------------- hacia los análisis ---------------- */
  /**
   * Tabla columnar para los análisis (SP.tabla). Las fechas entran como números (días);
   * los identificadores no entran. filas: índices opcionales (filtro).
   * Los niveles sin ninguna observación (por el filtro o por la edición) se quitan, en el
   * orden fijado: es lo que hace droplevels() de R antes de ajustar el modelo.
   */
  H.aTabla = function (filas) {
    if (!filas && this._cacheTabla) return this._cacheTabla;
    const columnas = {}, tipos = {};
    const idx = filas || null;
    for (const c of this.cols) {
      if (c.tipo === 'id') continue;
      const tomar = d => (idx ? Array.from(idx, i => d[i]) : Array.from(d));
      if (c.tipo === 'numerica' || c.tipo === 'fecha') { columnas[c.nombre] = tomar(c.datos); tipos[c.nombre] = { tipo: 'numerica' }; }
      else {
        const vals = tomar(c.datos);
        const usados = new Set(vals.filter(v => v !== null));
        const niveles = (c.tipo === 'factor' ? c.niveles : SP.tipos.ordenarNiveles(c.datos, 'aparicion')).filter(v => usados.has(v));
        columnas[c.nombre] = vals;
        tipos[c.nombre] = { tipo: 'factor', niveles };
      }
    }
    if (!Object.keys(columnas).length) throw new SP.ErrorSP(T('La hoja no tiene columnas que se puedan analizar.'));
    const t = SP.tabla.crear(columnas, tipos);
    for (const c of this.cols) if (c.tipo === 'fecha') t.col(c.nombre).fecha = true;   // días desde 1970; nunca es factor del diseño
    if (!filas) this._cacheTabla = t;
    return t;
  };

  /** Estado completo, para guardar el proyecto o deshacer operaciones grandes. */
  H.serializar = function () {
    return {
      n: this.n, opciones: this.opciones,
      columnas: this.cols.map(c => ({ nombre: c.nombre, tipo: c.tipo, niveles: c.niveles, origen: c.origen, detalle: c.detalle,
        datos: c.datos instanceof Float64Array ? Array.from(c.datos, v => (Number.isNaN(v) ? null : v)) : c.datos.slice() })),
    };
  };
  function deSerializado(s) {
    const cols = s.columnas.map(c => Object.assign({}, c, {
      datos: c.tipo === 'numerica' || c.tipo === 'fecha' ? Float64Array.from(c.datos, v => (v === null ? NaN : v)) : c.datos.slice(),
      niveles: c.niveles ? c.niveles.slice() : undefined,
    }));
    return new Hoja(cols, s.n, s.opciones);
  }

  const NOMBRES_TIPO = { numerica: 'numérica', factor: 'factor', fecha: 'fecha', texto: 'texto', id: 'identificador' };
  const nombreTipo = t => T(NOMBRES_TIPO[t] || t);

  /** La misma normalización que hace crear(): faltantes → null, números escritos → número. */
  function normalizar(valores, opciones) {
    const op = Object.assign({ decimal: '.', faltantes: ['', 'NA', 'NaN', '.', 'N/A'] }, opciones || {});
    return Array.from(valores, v => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return Number.isNaN(v) ? null : v;
      const s = String(v).trim();
      if (op.faltantes.includes(s)) return null;
      if (/^[+-]?0\d+$/.test(s)) return s;
      const x = SP.csv.aNumero(s, op.decimal);
      return Number.isNaN(x) ? s : x;
    });
  }

  SP.hoja = { crear, deSerializado, nombreTipo, normalizar, vacia: (nombres, n) => crear({ nombres, columnas: Object.fromEntries(nombres.map(x => [x, new Array(n || 0).fill(null)])), tipos: Object.fromEntries(nombres.map(x => [x, 'numerica'])) }) };
});

/* SigmaPro — el motor R en el navegador (webR), para los métodos con motor: 'r' (Fase 2).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   webR (R compilado a WebAssembly, GPL-3/MIT) se descarga solo cuando se usa un método del motor R y corre en su
   propio hilo dentro de la página: los datos no salen del navegador; la red solo trae código (R y sus paquetes).

     SP.motorR.ejecutar({ paquetes: ['lme4'], columnas: SP.motorR.columnas(tabla, ['rend', 'bloque']),
                          codigo: 'm <- lm(rend ~ bloque, data = datos)\nlist(coef = coef(m))' })
       → Promise<{ valor, avisos }>

   El código de cada trabajo ve un data.frame «datos» con las columnas pedidas (numéricas con NA; factores con sus
   niveles en el orden de SigmaPro) y su último valor es lo que vuelve. Los avisos y mensajes de R (ajuste singular,
   falta de convergencia) vuelven aparte; un error de R llega como SP.ErrorSP con el texto original en .r.

   La salida no usa la conversión automática de webR, que convierte NA, NaN e infinitos en null y pierde las
   dimensiones de las matrices: una función de R propia (.sp_json) escribe JSON con 17 cifras y marcas para los
   valores especiales, y leerSalida() lo convierte:
     vector sin nombres de largo 1 → escalar; vector → arreglo; vector con nombres → { nombres, valores };
     matriz → { filas, columnas, valores: [[fila]…] }; data.frame → { filas, columnas, datos: { col: [] } };
     lista con nombres → objeto (o { nombres, valores } si hay nombres vacíos, repetidos o numéricos); lista → arreglo;
     NA y NaN → NaN, Inf → Infinity; NA de texto o lógico → null.

   Las piezas puras (columnas, envolver, leerSalida, nombreR) no necesitan R: se prueban en node. */
SP.definir('motor-r', function (SP) {
  'use strict';
  const T = SP.T;

  /* versión fijada (propuesta/FASE2.md §1); en GitHub Pages se podrá apuntar a una copia propia con SP_MOTOR_R */
  const CONFIG = { webr: 'https://webr.r-wasm.org/v0.6.0/', repo: 'https://repo.r-wasm.org/', version: '0.6.0' };
  const config = () => Object.assign({}, CONFIG, (typeof globalThis !== 'undefined' && globalThis.SP_MOTOR_R) || {});

  /* ---------------- funciones de R que se definen al arrancar ----------------
     (String.raw: las barras invertidas van tal cual a R) */
  const PRELUDIO = String.raw`
.sp_cad <- function(z) {
  if (!length(z)) return(character(0))
  z <- enc2utf8(as.character(z))
  z <- gsub("\\", "\\\\", z, fixed = TRUE)
  z <- gsub("\"", "\\\"", z, fixed = TRUE)
  z <- gsub("\n", "\\n", z, fixed = TRUE)
  z <- gsub("\r", "\\r", z, fixed = TRUE)
  z <- gsub("\t", "\\t", z, fixed = TRUE)
  z <- gsub("[[:cntrl:]]", " ", z)
  paste0("\"", z, "\"")
}
.sp_vec <- function(x) {
  if (is.factor(x)) x <- as.character(x)
  if (is.logical(x)) { s <- ifelse(x, "true", "false"); s[is.na(x)] <- "null"; return(as.character(s)) }
  if (is.character(x)) { s <- .sp_cad(x); s[is.na(x)] <- "null"; return(s) }
  if (is.numeric(x)) {
    x <- as.double(x)
    s <- sprintf("%.17g", x)
    s[is.na(x)] <- "{\"$n\":\"NA\"}"
    s[is.nan(x)] <- "{\"$n\":\"NaN\"}"
    s[!is.na(x) & x == Inf] <- "{\"$n\":\"Inf\"}"
    s[!is.na(x) & x == -Inf] <- "{\"$n\":\"-Inf\"}"
    return(s)
  }
  .sp_cad(format(x))
}
.sp_arr <- function(s) paste0("[", paste(s, collapse = ","), "]")
.sp_json <- function(x) {
  if (is.null(x)) return("null")
  if (is.data.frame(x)) {
    rn <- attr(x, "row.names")
    filas <- if (is.integer(rn)) "null" else .sp_arr(.sp_vec(as.character(rn)))
    cols <- vapply(x, function(c) .sp_arr(.sp_vec(if (is.list(c)) unlist(c) else as.vector(c))), "")
    return(paste0("{\"$df\":", .sp_arr(.sp_vec(names(x))), ",\"filas\":", filas, ",\"c\":", .sp_arr(cols), "}"))
  }
  if (is.list(x)) {
    items <- vapply(x, .sp_json, "")
    nm <- names(x)
    if (is.null(nm)) return(.sp_arr(items))
    if (all(nzchar(nm)) && !anyDuplicated(nm) && !any(grepl("^[0-9]+$", nm)) && !any(startsWith(nm, "$")))
      return(paste0("{", paste0(.sp_cad(nm), ":", items, collapse = ","), "}"))
    return(paste0("{\"$l\":", .sp_arr(.sp_vec(nm)), ",\"v\":", .sp_arr(items), "}"))
  }
  if (is.atomic(x)) {
    d <- dim(x)
    if (!is.null(d)) {
      dn <- dimnames(x)
      dnj <- if (is.null(dn)) "null" else .sp_arr(vapply(dn, function(z) if (is.null(z)) "null" else .sp_arr(.sp_vec(z)), ""))
      return(paste0("{\"$m\":", .sp_arr(as.character(d)), ",\"v\":", .sp_arr(.sp_vec(as.vector(x))), ",\"dn\":", dnj, "}"))
    }
    nm <- names(x)
    if (!is.null(nm)) return(paste0("{\"$nv\":", .sp_arr(.sp_vec(nm)), ",\"v\":", .sp_arr(.sp_vec(unname(x))), "}"))
    if (length(x) == 1L) return(.sp_vec(x))
    return(.sp_arr(.sp_vec(x)))
  }
  .sp_cad(paste(class(x), collapse = "/"))
}
.sp_armar <- function(e) {
  nombres <- get(".sp_nombres", envir = e)
  tipos <- get(".sp_tipos", envir = e)
  d <- vector("list", length(nombres))
  names(d) <- nombres
  for (k in seq_along(nombres)) {
    v <- get(paste0(".sp_v", k), envir = e)
    if (tipos[k] == "factor") {
      niv <- as.character(get(paste0(".sp_n", k), envir = e))
      v <- as.integer(v)
      v[!is.na(v) & v < 0L] <- NA_integer_
      d[[k]] <- factor(niv[v + 1L], levels = niv)
    } else {
      v <- as.double(v)
      v[is.nan(v)] <- NA_real_
      d[[k]] <- v
    }
  }
  structure(d, class = "data.frame", row.names = seq_len(if (length(d)) length(d[[1L]]) else 0L))
}
.sp_correr <- function(expr, entorno) {
  avisos <- character(0)
  valor <- tryCatch(
    withCallingHandlers(eval(expr, entorno),
      warning = function(w) { avisos <<- c(avisos, conditionMessage(w)); invokeRestart("muffleWarning") },
      message = function(m) { avisos <<- c(avisos, sub("\n$", "", conditionMessage(m))); invokeRestart("muffleMessage") }),
    error = function(e) structure(list(mensaje = conditionMessage(e)), class = "sp_error"))
  if (inherits(valor, "sp_error")) return(.sp_json(list(error = valor$mensaje, avisos = as.list(avisos))))
  .sp_json(list(valor = valor, avisos = as.list(avisos)))
}
`;

  /* ---------------- piezas puras ---------------- */
  const RESERVADAS = new Set(['if', 'else', 'repeat', 'while', 'function', 'for', 'next', 'break', 'TRUE', 'FALSE', 'NULL', 'Inf', 'NaN', 'NA',
    'NA_integer_', 'NA_real_', 'NA_character_', 'in']);
  /** Un nombre de columna como se escribe en R: tal cual si es válido, si no entre comillas invertidas. */
  const nombreR = n => (/^([A-Za-z]|[.][A-Za-z._])[A-Za-z0-9._]*$|^[.]$/.test(n) && !RESERVADAS.has(n) ? n : '`' + String(n).replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`');
  /** Un texto como constante de R entre comillas. */
  const textoR = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';

  /** Las columnas de la tabla que necesita un trabajo, en la forma en que el motor las recibe. */
  function columnas(tabla, nombres) {
    const lista = [...new Set(nombres)];
    if (!lista.length) throw new SP.ErrorSP(T('El cálculo no usa ninguna columna.'));
    const env = { '.sp_nombres': lista.slice(), '.sp_tipos': [] };
    lista.forEach((n, k) => {
      const c = tabla.col(n);
      if (c.tipo === 'factor') {
        env['.sp_tipos'].push('factor');
        env['.sp_v' + (k + 1)] = Array.from(c.codigos);
        env['.sp_n' + (k + 1)] = c.niveles.map(String);
      } else {
        env['.sp_tipos'].push('numerica');
        env['.sp_v' + (k + 1)] = Array.from(c.valores);
      }
    });
    return env;
  }

  /** El código de un trabajo dentro de su envoltura: arma «datos» y devuelve el JSON del resultado. */
  function envolver(codigo) {
    return 'local({\n  datos <- .sp_armar(environment())\n  .sp_correr(quote({\n' + String(codigo) + '\n  }), environment())\n})';
  }

  const ESPECIAL = { NA: NaN, NaN: NaN, Inf: Infinity, '-Inf': -Infinity };
  function convertir(x) {
    if (Array.isArray(x)) return x.map(convertir);
    if (x && typeof x === 'object') {
      if ('$m' in x) {
        const dim = x.$m.map(Number), v = x.v, dn = x.dn || [];
        if (dim.length !== 2) return { dim, valores: v, nombres: dn };
        const [r, c] = dim, valores = [];
        for (let i = 0; i < r; i++) { const fila = new Array(c); for (let j = 0; j < c; j++) fila[j] = v[i + j * r]; valores.push(fila); }
        return { filas: dn[0] || null, columnas: dn[1] || null, valores };
      }
      if ('$nv' in x) return { nombres: x.$nv, valores: x.v };
      if ('$df' in x) {
        const datos = {};
        x.$df.forEach((n, i) => { datos[n] = x.c[i]; });
        return { filas: x.filas, columnas: x.$df, datos };
      }
      if ('$l' in x) return { nombres: x.$l, valores: x.v.map(convertir) };
      const o = {};
      for (const k of Object.keys(x)) o[k] = convertir(x[k]);
      return o;
    }
    return x;
  }
  /** Convierte el JSON que escribe .sp_json. */
  function leerSalida(texto) {
    const crudo = JSON.parse(texto, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1 && typeof v.$n === 'string' && v.$n in ESPECIAL ? ESPECIAL[v.$n] : v));
    return convertir(crudo);
  }

  /* ---------------- el motor ---------------- */
  const est = { fase: 'apagado', paso: '', version: '', r: '', error: '' };
  const oyentes = new Set();
  function avisar(cambios) {
    Object.assign(est, cambios);
    const copia = Object.assign({}, est);
    for (const f of oyentes) { try { f(copia); } catch (e) { /* un oyente no detiene al motor */ } }
  }
  let w = null, cargando = null, instalados = new Set(), cola = Promise.resolve(), generacion = 0, cancelarActual = null;
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const puede = () => typeof globalThis !== 'undefined' && typeof globalThis.Worker !== 'undefined' && typeof globalThis.document !== 'undefined';

  function errorCarga(e) {
    return new SP.ErrorSP(T('No se pudo cargar el motor R.'),
      T('La primera vez el motor R se descarga de internet (unos 20 MB): revisa la conexión y vuelve a intentarlo. Detalle: {m}', { m: (e && e.message) || String(e) }));
  }
  /** Carga webR (una sola vez) y define las funciones propias. */
  function iniciar() {
    if (w) return Promise.resolve(w);
    if (cargando) return cargando;
    if (!puede()) return Promise.reject(new SP.ErrorSP(T('El motor R solo corre en el navegador.')));
    const gen = generacion;
    cargando = (async () => {
      avisar({ fase: 'cargando', paso: T('Descargando el motor R (la primera vez tarda más)…'), error: '' });
      try {
        const cfg = config();
        const mod = await import(cfg.webr + 'webr.mjs');
        const op = { baseUrl: cfg.webr, repoUrl: cfg.repo };
        if (mod.ChannelType && mod.ChannelType.PostMessage !== undefined) op.channelType = mod.ChannelType.PostMessage;
        /* sin aislamiento de origen webR usa el canal por mensajes y lo avisa en la consola: es lo esperado (no hace
           falta la consola anidada de R); solo ese aviso se calla, y solo mientras arranca */
        const avisar0 = console.warn;
        console.warn = function (...a) { if (/PostMessage. communication channel/.test(String(a[0]))) return undefined; return avisar0.apply(this, a); };
        let nuevo;
        try { nuevo = new mod.WebR(op); await nuevo.init(); } finally { setTimeout(() => { console.warn = avisar0; }, 2000); }
        avisar({ paso: T('Preparando el motor R…') });
        await nuevo.evalRVoid(PRELUDIO);
        const r = await nuevo.evalRString('R.version.string');
        if (gen !== generacion) { try { nuevo.close(); } catch (e) { /* ya cerrado */ } throw new SP.ErrorSP(T('Cálculo cancelado.')); }
        w = nuevo;
        instalados = new Set();
        avisar({ fase: 'listo', paso: '', version: cfg.version, r: r.replace(/^R version /, 'R ').replace(/ \(.*$/, '') });
        return w;
      } catch (e) {
        avisar({ fase: 'error', paso: '', error: (e && e.message) || String(e) });
        throw e instanceof SP.ErrorSP ? e : errorCarga(e);
      } finally { cargando = null; }
    })();
    return cargando;
  }

  /** Instala (si hace falta) y comprueba cada paquete, uno por uno, con reintentos. */
  async function asegurar(paquetes) {
    const m = await iniciar();
    for (const p of paquetes || []) {
      if (!/^[A-Za-z][A-Za-z0-9.]*$/.test(p)) throw new Error('Nombre de paquete no válido: ' + p);
      if (instalados.has(p)) continue;
      let ok = await m.evalRBoolean('suppressMessages(requireNamespace(' + textoR(p) + ', quietly = TRUE))');
      for (let k = 0; !ok && k < 3; k++) {
        avisar({ fase: 'cargando', paso: T('Instalando {p} en el motor R (solo la primera vez)…', { p }) });
        try { await m.installPackages([p], { quiet: true }); } catch (e) { /* se reintenta */ }
        ok = await m.evalRBoolean('suppressMessages(requireNamespace(' + textoR(p) + ', quietly = TRUE))');
        if (!ok) await espera(1000 * (k + 1));
      }
      if (!ok) {
        avisar({ fase: 'listo', paso: '' });
        throw new SP.ErrorSP(T('No se pudo instalar el paquete de R «{p}».', { p }), T('Revisa la conexión a internet y vuelve a intentarlo.'));
      }
      instalados.add(p);
    }
    if (est.fase === 'cargando') avisar({ fase: 'listo', paso: '' });
    return m;
  }

  async function correrTrabajo(t) {
    const gen = generacion;
    const m = await asegurar(t.paquetes);
    if (gen !== generacion) throw new SP.ErrorSP(T('Cálculo cancelado.'));
    avisar({ fase: 'ocupado', paso: t.mensaje || T('Calculando en el motor R…') });
    const corte = new Promise((res, rej) => { cancelarActual = () => rej(new SP.ErrorSP(T('Cálculo cancelado.'))); });
    try {
      const texto = await Promise.race([m.evalRString(envolver(t.codigo), { env: t.columnas || {} }), corte]);
      const out = leerSalida(texto);
      const avisos = (out.avisos || []).map(String);
      if (out.error !== undefined) {
        const e = new SP.ErrorSP(T('R no pudo terminar el cálculo: {m}', { m: out.error }), t.arreglo || '');
        e.r = out.error;
        e.avisos = avisos;
        throw e;
      }
      return { valor: out.valor, avisos };
    } finally {
      cancelarActual = null;
      if (gen === generacion && est.fase === 'ocupado') avisar({ fase: 'listo', paso: '' });
    }
  }

  /** Pone un trabajo en la cola (uno a la vez). */
  function ejecutar(trabajo) {
    const p = cola.then(() => correrTrabajo(trabajo));
    cola = p.catch(() => {});
    return p;
  }

  /** Cierra el motor: corta el trabajo en curso; el siguiente vuelve a cargarlo (los paquetes salen de la caché). */
  function reiniciar() {
    generacion++;
    if (cancelarActual) cancelarActual();
    const viejo = w;
    w = null;
    cargando = null;
    instalados = new Set();
    if (viejo) { try { viejo.close(); } catch (e) { /* ya cerrado */ } }
    avisar({ fase: 'apagado', paso: '', error: '' });
  }

  /** Versiones de los paquetes cargados (para el reporte de validación y el párrafo de métodos). */
  async function versiones(paquetes) {
    const m = await asegurar(paquetes);
    const out = {};
    for (const p of paquetes) out[p] = await m.evalRString('as.character(utils::packageVersion(' + textoR(p) + '))');
    return out;
  }

  SP.motorR = {
    CONFIG, PRELUDIO, config, nombreR, textoR, columnas, envolver, leerSalida, puede,
    estado: () => Object.assign({}, est),
    /** Avisa cada cambio de estado ({ fase: 'apagado' | 'cargando' | 'listo' | 'ocupado' | 'error', paso, version, r, error }). */
    al(fn) { oyentes.add(fn); return () => oyentes.delete(fn); },
    iniciar, asegurar, ejecutar, reiniciar, cancelar: reiniciar, versiones,
  };
});

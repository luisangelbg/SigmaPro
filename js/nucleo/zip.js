/* SigmaPro — archivos ZIP: lectura con descompresión DEFLATE propia y escritura sin compresión.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Los libros de hoja de cálculo (.xlsx, .ods) y los proyectos .labg son archivos ZIP.
   El descompresor sigue la especificación DEFLATE (RFC 1951): bloques almacenados, con
   códigos de Huffman fijos y con códigos dinámicos. Es síncrono y no usa nada del
   navegador, así que funciona igual en la página, en un hilo de trabajo y en node.

     SP.zip.leer(bytes)            → { nombres: [..], datos(nombre) → Uint8Array | null }
     SP.zip.inflar(bytes)          → Uint8Array (DEFLATE «crudo»)
     SP.zip.crc32(bytes)           → entero sin signo
     SP.zip.construir([{ nombre, datos }]) → Uint8Array (ZIP sin compresión)
     SP.zip.construirComprimido([{ nombre, datos }]) → Promise<Uint8Array> (DEFLATE donde se pueda) */
SP.definir('zip', function (SP) {
  'use strict';
  const T = SP.T;

  /* ---------------- DEFLATE ---------------- */
  const LARGO_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LARGO_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
  const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073,
    4097, 6145, 8193, 12289, 16385, 24577];
  const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
  const ORDEN_LONG = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  /**
   * Tabla de decodificación canónica a partir de las longitudes de código.
   * Se usa una tabla directa de 2^máx entradas (máx ≤ 15): cada entrada guarda
   * símbolo · 16 + longitud, indexada por los bits leídos en el orden del flujo.
   */
  function tablaHuffman(longitudes) {
    let max = 0;
    for (const l of longitudes) if (l > max) max = l;
    const tabla = new Int32Array(1 << Math.max(max, 1)).fill(-1);
    if (!max) return { tabla, max: 1 };
    const cuenta = new Int32Array(16);
    for (const l of longitudes) if (l) cuenta[l]++;
    const siguiente = new Int32Array(16);
    let codigo = 0;
    for (let l = 1; l <= 15; l++) { codigo = (codigo + cuenta[l - 1]) << 1; siguiente[l] = codigo; }
    for (let s = 0; s < longitudes.length; s++) {
      const l = longitudes[s];
      if (!l) continue;
      const c = siguiente[l]++;
      /* los códigos se leen bit a bit desde el más significativo: se invierten para indexar */
      let inv = 0;
      for (let i = 0; i < l; i++) inv |= ((c >> i) & 1) << (l - 1 - i);
      for (let r = inv; r < tabla.length; r += 1 << l) tabla[r] = (s << 4) | l;
    }
    return { tabla, max };
  }

  let FIJA_LIT = null, FIJA_DIST = null;
  function tablasFijas() {
    if (!FIJA_LIT) {
      const l = new Int32Array(288);
      for (let i = 0; i < 288; i++) l[i] = i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8;
      FIJA_LIT = tablaHuffman(l);
      FIJA_DIST = tablaHuffman(new Int32Array(30).fill(5));
    }
  }

  /** Descomprime un flujo DEFLATE crudo (sin cabecera zlib). */
  function inflar(entrada, tamanoEsperado) {
    const src = entrada;
    let pos = 0, buf = 0, nbits = 0;
    let out = new Uint8Array(tamanoEsperado > 0 ? tamanoEsperado : Math.max(1024, src.length * 4));
    let o = 0;
    const roto = () => new SP.ErrorSP(T('El archivo comprimido está dañado o incompleto.'), T('Vuelve a guardarlo o descárgalo de nuevo.'));
    const asegurar = extra => {
      if (o + extra <= out.length) return;
      let nuevo = out.length * 2;
      while (nuevo < o + extra) nuevo *= 2;
      const m = new Uint8Array(nuevo); m.set(out.subarray(0, o)); out = m;
    };
    const bits = n => {
      while (nbits < n) {
        if (pos >= src.length) throw roto();
        buf |= src[pos++] << nbits; nbits += 8;
      }
      const v = buf & ((1 << n) - 1);
      buf >>>= n; nbits -= n;
      return v;
    };
    const simbolo = h => {
      while (nbits < h.max && pos < src.length) { buf |= src[pos++] << nbits; nbits += 8; }
      const e = h.tabla[buf & ((1 << h.max) - 1)];
      if (e < 0 || (e & 15) > nbits) throw roto();
      const l = e & 15;
      buf >>>= l; nbits -= l;
      return e >> 4;
    };
    let final = 0;
    while (!final) {
      final = bits(1);
      const tipo = bits(2);
      if (tipo === 0) {
        buf = 0; nbits = 0;                       // al siguiente byte
        if (pos + 4 > src.length) throw roto();
        const len = src[pos] | (src[pos + 1] << 8), nlen = src[pos + 2] | (src[pos + 3] << 8);
        pos += 4;
        if ((len ^ 0xffff) !== nlen || pos + len > src.length) throw roto();
        asegurar(len);
        out.set(src.subarray(pos, pos + len), o); o += len; pos += len;
        continue;
      }
      let lit, dist;
      if (tipo === 1) { tablasFijas(); lit = FIJA_LIT; dist = FIJA_DIST; }
      else if (tipo === 2) {
        const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
        const lc = new Int32Array(19);
        for (let i = 0; i < hclen; i++) lc[ORDEN_LONG[i]] = bits(3);
        const hc = tablaHuffman(lc);
        const largos = new Int32Array(hlit + hdist);
        for (let i = 0; i < hlit + hdist;) {
          const s = simbolo(hc);
          if (s < 16) largos[i++] = s;
          else {
            let rep, val = 0;
            if (s === 16) { if (!i) throw roto(); val = largos[i - 1]; rep = 3 + bits(2); }
            else if (s === 17) rep = 3 + bits(3);
            else rep = 11 + bits(7);
            if (i + rep > hlit + hdist) throw roto();
            while (rep--) largos[i++] = val;
          }
        }
        lit = tablaHuffman(largos.subarray(0, hlit));
        dist = tablaHuffman(largos.subarray(hlit));
      } else throw roto();
      for (;;) {
        const s = simbolo(lit);
        if (s < 256) { asegurar(1); out[o++] = s; continue; }
        if (s === 256) break;
        const k = s - 257;
        if (k >= 29) throw roto();
        const largo = LARGO_BASE[k] + bits(LARGO_EXTRA[k]);
        const ds = simbolo(dist);
        if (ds >= 30) throw roto();
        const d = DIST_BASE[ds] + bits(DIST_EXTRA[ds]);
        if (d > o) throw roto();
        asegurar(largo);
        for (let i = 0; i < largo; i++, o++) out[o] = out[o - d];
      }
    }
    return out.subarray(0, o);
  }

  /* ---------------- lectura de ZIP ---------------- */
  function leer(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    const noEs = () => new SP.ErrorSP(T('El archivo no es un libro .xlsx, .ods ni un proyecto .labg (no es un ZIP).'),
      T('Si es un libro viejo (.xls), guárdalo como .xlsx o .csv.'));
    if (u8.length < 22) throw noEs();
    let fin = -1;
    for (let i = u8.length - 22; i >= 0 && i >= u8.length - 22 - 65535; i--) if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    if (fin < 0) throw noEs();
    const total = dv.getUint16(fin + 10, true);
    let p = dv.getUint32(fin + 16, true);
    if (p === 0xffffffff) throw new SP.ErrorSP(T('El archivo usa el formato ZIP64, que este lector no abre.'));
    const dec = new TextDecoder('utf-8');
    const entradas = {}, nombres = [];
    for (let i = 0; i < total && p + 46 <= u8.length && dv.getUint32(p, true) === 0x02014b50; i++) {
      const metodo = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
      const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const nombre = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      const ln = dv.getUint16(local + 26, true), le = dv.getUint16(local + 28, true);
      const ini = local + 30 + ln + le;
      entradas[nombre] = { metodo, usize, datos: u8.subarray(ini, ini + csize) };
      nombres.push(nombre);
      p += 46 + nlen + elen + clen;
    }
    return {
      nombres,
      datos(nombre) {
        const e = entradas[nombre];
        if (!e) return null;
        if (e.metodo === 0) return e.datos;
        if (e.metodo === 8) return inflar(e.datos, e.usize);
        throw new SP.ErrorSP(T('El archivo usa un método de compresión que este lector no abre.'));
      },
      texto(nombre) {
        const b = this.datos(nombre);
        return b ? dec.decode(b) : null;
      },
    };
  }

  /* ---------------- CRC-32 y escritura sin compresión ---------------- */
  let TABLA_CRC = null;
  function crc32(bytes) {
    if (!TABLA_CRC) {
      TABLA_CRC = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        TABLA_CRC[n] = c >>> 0;
      }
    }
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  /** ZIP sin compresión (método 0) con nombres UTF-8. archivos: [{ nombre, datos: Uint8Array | texto }] */
  function construir(archivos) {
    const enc = new TextEncoder();
    return armar(archivos.map(a => { const d = typeof a.datos === 'string' ? enc.encode(a.datos) : a.datos; return { nombre: a.nombre, datos: d, guardado: d, metodo: 0 }; }));
  }
  /** ZIP con DEFLATE (método 8) donde el navegador o node lo ofrecen (CompressionStream); si no, sin comprimir.
      Un archivo que no se achica (PNG, por ejemplo) se guarda tal cual. → Promise<Uint8Array> */
  async function construirComprimido(archivos) {
    const enc = new TextEncoder();
    const puede = typeof CompressionStream !== 'undefined' && typeof Blob !== 'undefined' && typeof Response !== 'undefined';
    const lista = [];
    for (const a of archivos) {
      const datos = typeof a.datos === 'string' ? enc.encode(a.datos) : a.datos;
      let guardado = datos, metodo = 0;
      if (puede && datos.length > 64) {
        try {
          const flujo = new Blob([datos]).stream().pipeThrough(new CompressionStream('deflate-raw'));
          const c = new Uint8Array(await new Response(flujo).arrayBuffer());
          if (c.length < datos.length) { guardado = c; metodo = 8; }
        } catch (e) { /* sin compresión */ }
      }
      lista.push({ nombre: a.nombre, datos, guardado, metodo });
    }
    return armar(lista);
  }
  function armar(archivos) {
    const enc = new TextEncoder();
    const partes = [], central = [];
    let desplazamiento = 0;
    for (const a of archivos) {
      const nombre = enc.encode(a.nombre);
      const datos = a.datos, guardado = a.guardado;
      const crc = crc32(datos);
      const cab = new Uint8Array(30 + nombre.length), dv = new DataView(cab.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, a.metodo, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, guardado.length, true); dv.setUint32(22, datos.length, true);
      dv.setUint16(26, nombre.length, true); cab.set(nombre, 30);
      const c = new Uint8Array(46 + nombre.length), dc = new DataView(c.buffer);
      dc.setUint32(0, 0x02014b50, true); dc.setUint16(4, 20, true); dc.setUint16(6, 20, true); dc.setUint16(8, 0x0800, true); dc.setUint16(10, a.metodo, true);
      dc.setUint32(16, crc, true); dc.setUint32(20, guardado.length, true); dc.setUint32(24, datos.length, true);
      dc.setUint16(28, nombre.length, true); dc.setUint32(42, desplazamiento, true); c.set(nombre, 46);
      partes.push(cab, guardado); central.push(c);
      desplazamiento += cab.length + guardado.length;
    }
    const tamCentral = central.reduce((s, c) => s + c.length, 0);
    const fin = new Uint8Array(22), df = new DataView(fin.buffer);
    df.setUint32(0, 0x06054b50, true); df.setUint16(8, archivos.length, true); df.setUint16(10, archivos.length, true);
    df.setUint32(12, tamCentral, true); df.setUint32(16, desplazamiento, true);
    const total = desplazamiento + tamCentral + 22, out = new Uint8Array(total);
    let o = 0;
    for (const p of [...partes, ...central, fin]) { out.set(p, o); o += p.length; }
    return out;
  }

  /** Base64 → bytes (para los casos de prueba y para leer archivos incrustados). */
  function deBase64(b64) {
    const tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const limpio = String(b64).replace(/[^A-Za-z0-9+/]/g, '');
    const out = new Uint8Array(Math.floor(limpio.length * 3 / 4));
    let o = 0, acc = 0, n = 0;
    for (const ch of limpio) {
      acc = (acc << 6) | tab.indexOf(ch); n += 6;
      if (n >= 8) { n -= 8; out[o++] = (acc >> n) & 0xff; }
    }
    return out.subarray(0, o);
  }

  SP.zip = { inflar, leer, crc32, construir, construirComprimido, deBase64 };
});

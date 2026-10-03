/* SigmaPro — imágenes para publicar: la resolución dentro del PNG y TIFF con compresión PackBits.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El PNG que da el lienzo del navegador no dice su resolución (72 ppp por omisión para la mayoría de los programas):
   se le agrega el bloque pHYs con los puntos por metro, para que a 600 ppp mida lo que debe. El TIFF (TIFF 6.0, RGB de
   8 bits, una tira, PackBits) es el formato que piden muchas revistas; PackBits comprime bien los fondos lisos y lo lee
   cualquier programa. Nada usa el navegador: se prueba en node y la validación lo abre con otro lector.

     SP.imagen.pngConPpp(bytesPng, ppp)       → Uint8Array (con pHYs; quita el que tuviera)
     SP.imagen.infoPng(bytesPng)              → { ancho, alto, ppp } (ppp null si no lo dice)
     SP.imagen.tiff(rgba, ancho, alto, ppp)   → Uint8Array (rgba: Uint8ClampedArray de un lienzo; se compone sobre blanco)
     SP.imagen.packbits(bytes)                → Uint8Array */
SP.definir('imagen', function (SP) {
  'use strict';
  const FIRMA = [137, 80, 78, 71, 13, 10, 26, 10];
  const PULGADA_M = 0.0254;

  function bloque(tipo, datos) {
    const out = new Uint8Array(12 + datos.length), dv = new DataView(out.buffer);
    dv.setUint32(0, datos.length);
    for (let i = 0; i < 4; i++) out[4 + i] = tipo.charCodeAt(i);
    out.set(datos, 8);
    dv.setUint32(8 + datos.length, SP.zip.crc32(out.subarray(4, 8 + datos.length)));
    return out;
  }
  function esPng(b) { return b && b.length > 33 && FIRMA.every((v, i) => b[i] === v); }

  function pngConPpp(png, ppp) {
    if (!esPng(png)) throw new SP.ErrorSP(SP.T('No es una imagen PNG.'));
    const ppm = Math.round(ppp / PULGADA_M);
    const datos = new Uint8Array(9), dv = new DataView(datos.buffer);
    dv.setUint32(0, ppm); dv.setUint32(4, ppm); datos[8] = 1;            // unidad: metro
    const phys = bloque('pHYs', datos);
    const partes = [png.subarray(0, 8)];
    let p = 8, puesto = false;
    const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
    while (p + 8 <= png.length) {
      const largo = v.getUint32(p), tipo = String.fromCharCode(png[p + 4], png[p + 5], png[p + 6], png[p + 7]);
      const fin = p + 12 + largo;
      if (tipo !== 'pHYs') partes.push(png.subarray(p, fin));
      if (tipo === 'IHDR' && !puesto) { partes.push(phys); puesto = true; }
      p = fin;
      if (tipo === 'IEND') break;
    }
    const total = partes.reduce((s, x) => s + x.length, 0), out = new Uint8Array(total);
    let o = 0;
    for (const x of partes) { out.set(x, o); o += x.length; }
    return out;
  }
  function infoPng(png) {
    if (!esPng(png)) return null;
    const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
    const r = { ancho: v.getUint32(16), alto: v.getUint32(20), ppp: null };
    let p = 8;
    while (p + 8 <= png.length) {
      const largo = v.getUint32(p), tipo = String.fromCharCode(png[p + 4], png[p + 5], png[p + 6], png[p + 7]);
      if (tipo === 'pHYs' && png[p + 16] === 1) r.ppp = v.getUint32(p + 8) * PULGADA_M;
      if (tipo === 'IEND') break;
      p += 12 + largo;
    }
    return r;
  }

  /* PackBits (TIFF 6.0, sección 9): corridas de 2 a 128 bytes iguales → (1 − n, byte); tramos literales → (n − 1, bytes) */
  function packbits(b) {
    const out = [];
    let i = 0;
    const n = b.length;
    while (i < n) {
      let j = i + 1;
      while (j < n && j - i < 128 && b[j] === b[i]) j++;
      if (j - i >= 2) { out.push(257 - (j - i), b[i]); i = j; continue; }
      /* literal: hasta encontrar dos iguales seguidos (o 128 bytes) */
      j = i + 1;
      while (j < n && j - i < 128 && !(j + 1 < n && b[j] === b[j + 1])) j++;
      out.push(j - i - 1);
      for (let k = i; k < j; k++) out.push(b[k]);
      i = j;
    }
    return Uint8Array.from(out);
  }

  function tiff(rgba, ancho, alto, ppp) {
    /* RGB sobre fondo blanco, comprimido renglón por renglón (PackBits no cruza renglones) */
    const renglones = [];
    let total = 0;
    const fila = new Uint8Array(ancho * 3);
    for (let y = 0; y < alto; y++) {
      for (let x = 0; x < ancho; x++) {
        const s = (y * ancho + x) * 4, a = rgba[s + 3] / 255;
        for (let c = 0; c < 3; c++) fila[x * 3 + c] = Math.round(rgba[s + c] * a + 255 * (1 - a));
      }
      const r = packbits(fila);
      renglones.push(r); total += r.length;
    }
    const nEtiquetas = 13;
    const ifd = 8, tamIfd = 2 + nEtiquetas * 12 + 4;
    const pos = { bits: ifd + tamIfd, xres: ifd + tamIfd + 6, yres: ifd + tamIfd + 14, soft: ifd + tamIfd + 22 };
    const software = new TextEncoder().encode('SigmaPro ' + SP.VERSION + '\0');
    const datosIni = pos.soft + software.length + (software.length % 2);
    const out = new Uint8Array(datosIni + total), dv = new DataView(out.buffer);
    out[0] = 0x49; out[1] = 0x49; dv.setUint16(2, 42, true); dv.setUint32(4, ifd, true);   // «II», 42, primer IFD
    dv.setUint16(ifd, nEtiquetas, true);
    let e = ifd + 2;
    const etiqueta = (tag, tipo, cuenta, valor) => { dv.setUint16(e, tag, true); dv.setUint16(e + 2, tipo, true); dv.setUint32(e + 4, cuenta, true);
      if (tipo === 3 && cuenta === 1) dv.setUint16(e + 8, valor, true); else dv.setUint32(e + 8, valor, true); e += 12; };
    const ppcm = Math.round(ppp * 10000);      // resolución racional: ppp × 10000 / 10000
    etiqueta(256, 4, 1, ancho);                // ancho
    etiqueta(257, 4, 1, alto);                 // alto
    etiqueta(258, 3, 3, pos.bits);             // bits por muestra: 8, 8, 8
    etiqueta(259, 3, 1, 32773);                // compresión: PackBits
    etiqueta(262, 3, 1, 2);                    // interpretación: RGB
    etiqueta(273, 4, 1, datosIni);             // desplazamiento de la tira
    etiqueta(277, 3, 1, 3);                    // muestras por píxel
    etiqueta(278, 4, 1, alto);                 // renglones por tira
    etiqueta(279, 4, 1, total);                // bytes de la tira
    etiqueta(282, 5, 1, pos.xres);             // resolución x
    etiqueta(283, 5, 1, pos.yres);             // resolución y
    etiqueta(296, 3, 1, 2);                    // unidad: pulgada
    etiqueta(305, 2, software.length, pos.soft);
    dv.setUint32(e, 0, true);                  // no hay otro IFD
    dv.setUint16(pos.bits, 8, true); dv.setUint16(pos.bits + 2, 8, true); dv.setUint16(pos.bits + 4, 8, true);
    dv.setUint32(pos.xres, ppcm, true); dv.setUint32(pos.xres + 4, 10000, true);
    dv.setUint32(pos.yres, ppcm, true); dv.setUint32(pos.yres + 4, 10000, true);
    out.set(software, pos.soft);
    let o = datosIni;
    for (const r of renglones) { out.set(r, o); o += r.length; }
    return out;
  }

  SP.imagen = { pngConPpp, infoPng, tiff, packbits };
});

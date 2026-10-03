/* SigmaPro — huella SHA-256 (FIPS 180-4), para el manifiesto del proyecto .labg.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Síncrona y sin nada del navegador: da lo mismo en la página, en un hilo y en node (se prueba contra los vectores
   del estándar y contra crypto de node; la validación del proyecto la recalcula con el paquete openssl de R).

     SP.sha256(bytes | texto) → 64 dígitos hexadecimales (un texto se toma en UTF-8) */
SP.definir('sha256', function (SP) {
  'use strict';
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  function sha256(entrada) {
    const datos = typeof entrada === 'string' ? new TextEncoder().encode(entrada) : entrada;
    const n = datos.length;
    /* relleno: 0x80, ceros y la longitud en bits en 64 bits big-endian, hasta un múltiplo de 64 bytes */
    const total = Math.ceil((n + 9) / 64) * 64, m = new Uint8Array(total);
    m.set(datos); m[n] = 0x80;
    const bits = n * 8, dv = new DataView(m.buffer);
    dv.setUint32(total - 8, Math.floor(bits / 0x100000000)); dv.setUint32(total - 4, bits >>> 0);
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const W = new Uint32Array(64);
    for (let o = 0; o < total; o += 64) {
      for (let t = 0; t < 16; t++) W[t] = dv.getUint32(o + 4 * t);
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
      }
      let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return Array.from(H, x => x.toString(16).padStart(8, '0')).join('');
  }

  SP.sha256 = sha256;
});

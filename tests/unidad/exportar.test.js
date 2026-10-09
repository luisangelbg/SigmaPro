/* Pruebas de las exportaciones del Hito 1.11 que no dependen del navegador: huella SHA-256, ZIP comprimido, hoja de
   cálculo leída de vuelta, documento .docx bien formado, cuadros en LaTeX, PNG con resolución y TIFF PackBits,
   párrafos del reporte y proyecto .labg (guardar, abrir, verificar la huella). La validación con lectores
   independientes (R: readxl, xml2, openssl, pdftools y png) está en tests/exportar.mjs. */
SPT.describir('Exportaciones · reporte, documentos, hojas, imágenes y proyecto', () => {
  let s = 41;
  const az = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tab = cols => {
    const tipos = {};
    for (const [k, v] of Object.entries(cols)) if (typeof v[0] === 'string') tipos[k] = { tipo: 'factor' };
    return SP.tabla.crear(cols, tipos);
  };
  /* un factorial 3 × 3 en 4 bloques */
  const ensayo = () => {
    const c = { bloque: [], hibrido: [], dosis: [], rend: [], plantas: [] };
    for (const b of ['I', 'II', 'III', 'IV']) for (const h of ['H1', 'H2', 'H3']) for (const d of [0, 60, 120]) {
      c.bloque.push(b); c.hibrido.push(h); c.dosis.push(d); c.plantas.push(90 + Math.round(az() * 20));
      c.rend.push(Math.round((4 + d / 60 + (h === 'H3' ? 0.8 : 0) + az()) * 100) / 100);
    }
    return c;
  };
  /* comprobación simple de XML bien formado: etiquetas que abren y cierran en orden */
  function bienFormado(xml) {
    const pila = [];
    const re = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"]*")*)\s*(\/?)>|<\?[^>]*\?>/g;
    let m;
    while ((m = re.exec(xml))) {
      if (!m[2]) continue;
      if (m[4] === '/') continue;
      if (m[1]) { if (pila.pop() !== m[2]) return false; } else pila.push(m[2]);
    }
    return pila.length === 0 && !/<[^>]*<|&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(xml);
  }

  SPT.caso('SHA-256: vectores del estándar FIPS 180-4', () => {
    SPT.igual(SP.sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    SPT.igual(SP.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    SPT.igual(SP.sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
    SPT.igual(SP.sha256('abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'), 'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1');
    SPT.igual(SP.sha256(new Uint8Array(1000000).fill(97)), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
    SPT.igual(SP.sha256('ñandú · χ²'), SP.sha256(new TextEncoder().encode('ñandú · χ²')));
  });
  SPT.caso('SHA-256 = crypto de node en 300 mensajes al azar (todas las longitudes de relleno)', () => {
    for (let n = 0; n < 300; n++) {
      const b = Uint8Array.from({ length: n * 3 + (n % 7) }, () => Math.floor(az() * 256));
      SPT.igual(SP.sha256(b), __sha256Node(b), 'largo ' + b.length);
    }
  }, { node: true });

  SPT.caso('ZIP comprimido: se lee de vuelta byte por byte y ocupa menos', async () => {
    const texto = 'rend,hibrido\n' + Array.from({ length: 2000 }, (_, i) => (4 + (i % 7) / 3).toFixed(4) + ',H' + (i % 3)).join('\n');
    const bin = Uint8Array.from({ length: 5000 }, () => Math.floor(az() * 256));
    const z = await SP.zip.construirComprimido([{ nombre: 'datos/a.csv', datos: texto }, { nombre: 'b.bin', datos: bin }, { nombre: 'ñ/vacío.txt', datos: '' }]);
    const l = SP.zip.leer(z);
    SPT.igualJSON(l.nombres, ['datos/a.csv', 'b.bin', 'ñ/vacío.txt']);
    SPT.igual(l.texto('datos/a.csv'), texto);
    SPT.igualJSON(Array.from(l.datos('b.bin')), Array.from(bin));
    SPT.igual(l.texto('ñ/vacío.txt'), '');
    SPT.afirmar(z.length < texto.length / 3, 'el texto repetitivo se comprime: ' + z.length);
  });

  SPT.caso('Hoja de cálculo: leída de vuelta con el lector propio da los mismos números y textos', () => {
    const c = ensayo(), t = tab(c);
    const r = SP.ejecutar('dbca', t, { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}).resultado;
    const rep = SP.metodos.dbca.reporte(r);
    const hojas = rep.cuadros.map(q => { const v = SP.formatos.valores(q); return { nombre: q.titulo, filas: [v.cabecera].concat(v.filas) }; });
    const libro = SP.xlsx.construir(hojas);
    const leido = SP.hojas.leer(libro);
    SPT.igual(leido.nombres.length, rep.cuadros.length);
    leido.nombres.forEach((n, k) => {
      SPT.afirmar(n.length <= 31, 'nombre de hoja ≤ 31: ' + n);
      const esperado = hojas[k].filas, obtenido = leido.hojas[n].filas;
      esperado.forEach((fila, i) => fila.forEach((v, j) => {
        const o = obtenido[i] ? obtenido[i][j] : undefined;
        if (v === null || v === '') SPT.afirmar(o === null || o === undefined || o === '', `celda vacía ${n} ${i},${j}`);
        else if (typeof v === 'number') SPT.igual(o, v, `${n} ${i},${j}`);
        else SPT.igual(String(o), String(v), `${n} ${i},${j}`);
      }));
    });
    /* nombres repetidos o con caracteres prohibidos */
    SPT.igualJSON(SP.xlsx.nombres([{ nombre: 'a/b' }, { nombre: 'A b' }, { nombre: 'x'.repeat(40) }]), ['a b', 'A b (2)', 'x'.repeat(31)]);
  });

  SPT.caso('.docx: partes XML bien formadas, cuadros con su encabezado repetido y leyendas con campo SEQ', () => {
    const png = SP.zip.deBase64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    const doc = SP.docx.construir({ titulo: 'Prueba & <ensayo>', autor: 'Autor', hoja: 'a4', bloques: [
      { tipo: 'titulo', texto: 'Título con & y <' }, { tipo: 'encabezado', nivel: 1, texto: 'Métodos' },
      { tipo: 'parrafo', trozos: [{ texto: 'negrita', negrita: true }, { texto: ' y normal\ncon salto' }] },
      { tipo: 'conclusion', texto: 'Hay diferencias.' }, { tipo: 'semaforo', filas: [{ color: 'verde', nombre: 'Normalidad', texto: 'p = 0.4' }] },
      { tipo: 'cuadro', leyenda: { etiqueta: 'Cuadro', numero: 1, texto: 'ANOVA' }, cabecera: ['Fuente', 'gl', 'F'], filas: [['bloque', '3', '10.40'], ['Total', '47', '']], numericas: [false, true, true], totales: [false, true], notas: ['Nota.'] },
      { tipo: 'figura', imagen: png, anchoCm: 16, altoCm: 10, leyenda: { etiqueta: 'Figura', numero: 1, texto: 'Medias' }, alt: 'medias' },
      { tipo: 'codigo', texto: 'modelo <- lm(y ~ x)\nsummary(modelo)' }, { tipo: 'referencia', texto: 'Autor (2026). Título.' }, { tipo: 'salto' },
    ] });
    const z = SP.zip.leer(doc);
    for (const n of z.nombres.filter(x => /\.(xml|rels)$/.test(x))) SPT.afirmar(bienFormado(z.texto(n)), 'XML bien formado: ' + n);
    const d = z.texto('word/document.xml');
    SPT.igual((d.match(/<w:tbl>/g) || []).length, 1);
    SPT.afirmar(/<w:tblHeader\/>/.test(d), 'fila de encabezado repetida');
    SPT.igual((d.match(/SEQ (Cuadro|Figura)/g) || []).length, 2);
    SPT.afirmar(/Título con &amp; y &lt;/.test(d), 'texto escapado');
    SPT.afirmar(/w:w="11906"/.test(d), 'hoja A4');
    SPT.igualJSON(Array.from(z.datos('word/media/imagen1.png')), Array.from(png));
    SPT.afirmar(/r:embed="rIdImg1"/.test(d) && /media\/imagen1\.png/.test(z.texto('word/_rels/document.xml.rels')), 'la imagen está enlazada');
    SPT.afirmar(/cx="5760000"/.test(d), 'la figura mide 16 cm');
  });

  SPT.caso('LaTeX: especiales escapados, signos en modo matemático y reglas de booktabs', () => {
    SPT.igual(SP.latex.escapar('a_b & 50% $x #1 {y} ~ ^ \\'), 'a\\_b \\& 50\\% \\$x \\#1 \\{y\\} \\textasciitilde{} \\textasciicircum{} \\textbackslash{}');
    SPT.igual(SP.latex.escapar('χ² = −3.2; p < 0.001'), '$\\chi^{2}$ = $-$3.2; p $<$ 0.001');
    SPT.igual(SP.latex.escapar('H1 × H2 – 5'), 'H1 $\\times$ H2 -- 5');
    const c = { titulo: 'Medias de «hibrido» (α = 0.05)', columnas: [{ clave: 'n', titulo: 'Nivel', formato: 'texto' }, { clave: 'm', titulo: 'Media', formato: 'escala' }, { clave: 'p', titulo: 'p', formato: 'pvalor' }],
      filas: [{ n: 'H_1', m: -1.234, p: 0.0001 }, { n: 'Total', m: 2, p: 0.5, _total: true }], notas: ['50% de los datos'] };
    const x = SP.latex.cuadro(c, { numero: 3 });
    SPT.afirmar(/\\begin\{tabular\}\{lrr\}/.test(x) && /\\toprule/.test(x) && /\\bottomrule/.test(x), x);
    SPT.igual((x.match(/\\midrule/g) || []).length, 2, 'bajo el encabezado y antes del total');
    SPT.afirmar(x.includes('H\\_1 & $-$1.23 & $<$ 0.001 \\\\'), x);
    SPT.afirmar(x.includes('\\label{tab:cuadro-3}') && x.includes('$\\alpha$'));
    let llaves = 0;
    for (const ch of x.replace(/\\[{}]/g, '')) { if (ch === '{') llaves++; if (ch === '}') llaves--; SPT.afirmar(llaves >= 0); }
    SPT.igual(llaves, 0, 'llaves balanceadas');
    const doc = SP.latex.documento([{ cuadro: c, numero: 1 }], { titulo: 'Cuadros' });
    SPT.afirmar(/\\documentclass/.test(doc) && /\\usepackage\{booktabs\}/.test(doc) && /\\end\{document\}/.test(doc));
  });

  SPT.caso('PNG: el bloque pHYs dice 600 ppp con su CRC; TIFF PackBits se decodifica a los mismos píxeles', () => {
    const png = SP.zip.deBase64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    SPT.igual(SP.imagen.infoPng(png).ppp, null);
    const p6 = SP.imagen.pngConPpp(png, 600), info = SP.imagen.infoPng(p6);
    SPT.igualJSON([info.ancho, info.alto], [1, 1]);
    SPT.cerca(info.ppp, 600, 1e-4);
    /* el CRC de cada bloque es correcto y sigue habiendo un solo pHYs aunque se aplique dos veces */
    const doble = SP.imagen.pngConPpp(p6, 300), dv = new DataView(doble.buffer);
    let p = 8, phys = 0;
    while (p < doble.length) {
      const largo = dv.getUint32(p), tipo = String.fromCharCode(...doble.subarray(p + 4, p + 8));
      SPT.igual(dv.getUint32(p + 8 + largo), SP.zip.crc32(doble.subarray(p + 4, p + 8 + largo)), 'CRC de ' + tipo);
      if (tipo === 'pHYs') phys++;
      p += 12 + largo;
    }
    SPT.igual(phys, 1);
    SPT.cerca(SP.imagen.infoPng(doble).ppp, 300, 1e-4);
    /* PackBits: ida y vuelta con corridas y tramos al azar */
    const desempacar = b => { const out = []; let i = 0; while (i < b.length) { const n = b[i] > 127 ? b[i] - 256 : b[i]; i++; if (n >= 0) { for (let k = 0; k <= n; k++) out.push(b[i++]); } else if (n !== -128) { for (let k = 0; k < 1 - n; k++) out.push(b[i]); i++; } } return out; };
    for (let t = 0; t < 50; t++) {
      const datos = []; while (datos.length < 400) { const v = Math.floor(az() * 4), k = 1 + Math.floor(az() * (az() < 0.5 ? 3 : 200)); for (let j = 0; j < k; j++) datos.push(az() < 0.3 ? Math.floor(az() * 256) : v); }
      SPT.igualJSON(desempacar(SP.imagen.packbits(Uint8Array.from(datos))), datos);
    }
    /* TIFF de 7 × 3 con transparencia (se compone sobre blanco) */
    const w = 7, h = 3, rgba = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) { rgba[4 * i] = (i * 37) % 256; rgba[4 * i + 1] = 200; rgba[4 * i + 2] = i % 2 ? 0 : 255; rgba[4 * i + 3] = i === 5 ? 0 : 255; }
    const tif = SP.imagen.tiff(rgba, w, h, 600), tv = new DataView(tif.buffer);
    SPT.igual(String.fromCharCode(tif[0], tif[1]), 'II'); SPT.igual(tv.getUint16(2, true), 42);
    const ifd = tv.getUint32(4, true), n = tv.getUint16(ifd, true), etq = {};
    for (let k = 0; k < n; k++) { const o = ifd + 2 + 12 * k; etq[tv.getUint16(o, true)] = { tipo: tv.getUint16(o + 2, true), v: tv.getUint16(o + 2, true) === 3 ? tv.getUint16(o + 8, true) : tv.getUint32(o + 8, true) }; }
    SPT.igualJSON([etq[256].v, etq[257].v, etq[259].v, etq[262].v, etq[277].v, etq[296].v], [7, 3, 32773, 2, 3, 2]);
    SPT.igual(tv.getUint32(etq[282].v, true) / tv.getUint32(etq[282].v + 4, true), 600);
    const pix = desempacar(tif.subarray(etq[273].v, etq[273].v + etq[279].v));
    SPT.igual(pix.length, w * h * 3);
    for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) SPT.igual(pix[3 * i + c], i === 5 ? 255 : rgba[4 * i + c], `píxel ${i}, canal ${c}`);
  });

  SPT.caso('Párrafos del reporte: cada método da métodos y resultados, sin huecos, con sus citas en la lista', () => {
    const c = ensayo(), t = tab(c);
    const dos = tab({ g: ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b'], y: [5.1, 4.8, 5.5, 5.0, 5.3, 6.2, 6.0, 6.9, 6.4, 6.1] });
    const cont = tab({ f: ['si', 'si', 'no', 'no', 'si', 'no', 'si', 'no', 'si', 'si', 'no', 'no'], c: ['a', 'b', 'a', 'b', 'a', 'b', 'b', 'a', 'a', 'a', 'b', 'b'] });
    const casos = [
      [t, 'dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}, /F\(2, \d+\) = /],
      [t, 'dca', { respuesta: 'rend', tratamientos: ['hibrido'] }, {}, /F\(2, \d+\)/],
      [t, 'comparaciones-medias', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['hibrido'] }, { metodo: 'tukey' }, /de mayor a menor/],
      [t, 'polinomios', { diseno: 'dbca', respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque', comparar: ['dosis'] }, {}, /componente lineal/],
      [t, 'supuestos', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}, /Normalidad/],
      [t, 'ancova', { respuesta: 'rend', tratamientos: ['hibrido'], bloque: 'bloque', covariables: ['plantas'] }, {}, /pendiente común/],
      [t, 'regresion-lineal', { respuesta: 'rend', predictores: ['dosis', 'plantas'] }, {}, /ŷ = /],
      [t, 'correlacion', { x: 'dosis', y: 'rend' }, {}, /r = /],
      [t, 'modelo-lineal', { respuesta: 'rend' }, { derecha: 'bloque + hibrido * dosis', comoFactor: ['dosis'] }, /R² = /],
      [t, 'kruskal-wallis', { respuesta: 'rend', tratamiento: 'hibrido' }, {}, /H\(2\) = /],
      [dos, 'prueba-t', { modo: 'independientes', respuesta: 'y', grupo: 'g' }, {}, /t\([\d.]+\) = /],
      [dos, 'wilcoxon', { modo: 'independientes', respuesta: 'y', grupo: 'g' }, {}, /W = /],
      [cont, 'tabla-contingencia', { fila: 'f', columna: 'c' }, {}, /χ²\(1\) = /],
      [t, 'descriptivos', { variables: ['rend'], grupos: ['hibrido'] }, {}, /± /],
    ];
    const claves = new Set(SP.informe.REFERENCIAS);
    for (const [tabla, id, e, op0, debe] of casos) {
      const op = SP.opcionesCon(SP.metodos[id], op0);
      const r = SP.ejecutar(id, tabla, e, op).resultado, rep = SP.metodos[id].reporte(r);
      const p = SP.informe.parrafo(id, r, rep, e, op), todo = p.metodos + ' ' + p.resultados;
      SPT.afirmar(p.metodos && p.resultados, id + ': falta un párrafo');
      SPT.afirmar(!/undefined|NaN|null|\[object|\{[a-zA-Z]+\}|\(\)|\s\s/.test(todo), id + ': hueco en «' + todo + '»');
      SPT.afirmar(debe.test(todo), id + ': no trae ' + debe + ' en «' + p.resultados + '»');
      for (const k of p.citas) SPT.afirmar(claves.has(k) && SP.informe.referencia(k).length > 20, id + ': cita sin referencia ' + k);
    }
    /* una clave repetida en las referencias se pisa sin aviso: la del ANCOVA (Cochran, 1957) y la de las repeticiones (Cochran y Cox, 1957) */
    SPT.afirmar(/Analysis of covariance/.test(SP.informe.referencia('cochran1957')) && /Experimental designs/.test(SP.informe.referencia('cochranCox1957')), 'las dos referencias de Cochran de 1957');
    const sw = SP.informe.software();
    SPT.afirmar(sw.texto.includes(SP.VERSION) && sw.citas.includes('rcore'));
  });

  SPT.caso('Documento: cuadros y figuras numerados en orden, referencias en orden alfabético y la misma página en HTML', () => {
    const c = ensayo(), t = tab(c);
    const items = [['dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}], ['correlacion', { x: 'dosis', y: 'rend' }, {}]].map(([id, e, op0], k) => {
      const op = SP.opcionesCon(SP.metodos[id], op0), r = SP.ejecutar(id, t, e, op).resultado, rep = SP.metodos[id].reporte(r);
      return { titulo: rep.titulo, id, e, op, r, rep, codigo: SP.metodos[id].codigoR(e, op, { resultado: r }), figuras: [{ titulo: 'Figura ' + k, descripcion: 'd', svg: '<svg viewBox="0 0 10 10"></svg>' }], detalles: [['Método', id]] };
    });
    const bs = SP.informe.bloques(items, { titulo: 'Ensayo', autor: 'Yo', datos: 'maíz', n: 36 });
    const cuadros = bs.filter(b => b.tipo === 'cuadro').map(b => b.leyenda.numero), figuras = bs.filter(b => b.tipo === 'figura').map(b => b.leyenda.numero);
    SPT.igualJSON(cuadros, cuadros.map((_, i) => i + 1));
    SPT.igualJSON(figuras, [1, 2]);
    const refs = bs.filter(b => b.tipo === 'referencia').map(b => b.texto);
    SPT.afirmar(refs.length >= 3, 'referencias: ' + refs.length);
    SPT.igualJSON(refs, refs.slice().sort((a, b) => a.localeCompare(b, 'es')));
    SPT.afirmar(bs.some(b => b.tipo === 'codigo' && /lm\(|aov\(/.test(b.texto)), 'anexo con el código R');
    const html = SP.informe.html(bs, { titulo: 'Ensayo' });
    SPT.igual((html.match(/<table class="revista">/g) || []).length, cuadros.length);
    SPT.igual((html.match(/<figure>/g) || []).length, 2);
    SPT.afirmar(/^<!doctype html>/.test(html) && /<title>Ensayo<\/title>/.test(html) && /@page/.test(html));
    const docx = SP.zip.leer(SP.docx.construir({ titulo: 'Ensayo', bloques: bs.filter(b => b.tipo !== 'figura') }));
    SPT.afirmar(bienFormado(docx.texto('word/document.xml')), 'el reporte en .docx es XML bien formado');
  });

  SPT.caso('Documento rediseñado (hito 5.8): ficha de la portada, índice con un ancla por encabezado, resumen y lectura', () => {
    const c = ensayo(), t = tab(c);
    const items = [['dbca', { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, {}], ['correlacion', { x: 'dosis', y: 'rend' }, {}]].map(([id, e, op0]) => {
      const op = SP.opcionesCon(SP.metodos[id], op0), r = SP.ejecutar(id, t, e, op).resultado, rep = SP.metodos[id].reporte(r);
      return { titulo: rep.titulo, id, e, op, r, rep, codigo: '', figuras: [], detalles: [] };
    });
    const png = SP.zip.deBase64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    items[0].lectura = { svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 40"></svg>', imagen: png, anchoCm: 16, altoCm: 1, descripcion: 'p: 0.01', fuentes: ['Cohen (1988)'] };
    const bs = SP.informe.bloques(items, { titulo: 'Ensayo', datos: 'maíz', n: 36 });
    const ficha = bs.find(b => b.tipo === 'ficha');
    SPT.afirmar(ficha && ficha.filas.length === 3 && /36/.test(ficha.filas[0][1]) && new RegExp('2 ').test(ficha.filas[1][1]), JSON.stringify(ficha));
    const ind = bs.find(b => b.tipo === 'indice'), heads = bs.filter(b => b.tipo === 'encabezado' && b.nivel <= 2);
    SPT.igualJSON(ind.entradas.map(x => x.ancla), heads.map(h => h.ancla), 'una entrada por encabezado, con su ancla');
    SPT.igual(bs.indexOf(ind), bs.findIndex(b => b.tipo === 'salto') + 1, 'el índice va tras la portada');
    SPT.afirmar(heads[0].texto === SP.T('Resumen de los resultados') && bs.some(b => b.estilo === 'Resumen' && /^1\. /.test(b.trozos[0].texto)), 'el resumen');
    SPT.igual(bs.filter(b => b.tipo === 'lectura').length, 1);
    const sin = SP.informe.bloques(items, { conResumen: false, conLectura: false });
    SPT.afirmar(!sin.some(b => b.tipo === 'lectura' || b.estilo === 'Resumen'), 'las casillas los quitan');
    const html = SP.informe.html(bs, { titulo: 'Ensayo' });
    SPT.afirmar(/<nav class="indice"/.test(html) && /<dl class="ficha">/.test(html) && /<div class="lectura">/.test(html), 'la página');
    for (const a of ind.entradas.map(x => x.ancla)) SPT.afirmar(html.includes('href="#' + a + '"') && html.includes('id="' + a + '"'), 'enlace ' + a);
    const z = SP.zip.leer(SP.docx.construir({ titulo: 'Ensayo', bloques: bs }));
    const d = z.texto('word/document.xml');
    SPT.afirmar(bienFormado(d) && bienFormado(z.texto('word/styles.xml')) && bienFormado(z.texto('word/settings.xml')), 'XML bien formado');
    const marcas = [...d.matchAll(/w:bookmarkStart w:id="\d+" w:name="([^"]+)"/g)].map(m => m[1]), anclas = [...d.matchAll(/w:hyperlink w:anchor="([^"]+)"/g)].map(m => m[1]);
    SPT.igualJSON(anclas, marcas, 'un enlace del índice por marcador');
    SPT.afirmar(/ TOC \\o &quot;1-2&quot;/.test(d) && (d.match(/PAGEREF/g) || []).length === anclas.length, 'campo TOC y el número de página de cada entrada');
    SPT.afirmar(/<w:updateFields w:val="true"\/>/.test(z.texto('word/settings.xml')), 'Word actualiza el índice al abrir');
    SPT.igualJSON(Array.from(z.datos('word/media/lectura1.png')), Array.from(png));
    SPT.afirmar(/w:val="Lectura"/.test(d) && /descr="p: 0.01"/.test(d), 'el panel con su descripción');
    const est = z.texto('word/styles.xml'), usados = [...new Set([...d.matchAll(/<w:pStyle w:val="([^"]+)"/g)].map(m => m[1]))];
    for (const u of usados) SPT.afirmar(est.includes('w:styleId="' + u + '"'), 'estilo definido: ' + u);
  });

  SPT.caso('Proyecto .labg: guardar y abrir devuelve la misma hoja, filtro y reporte; la huella detecta un cambio', async () => {
    const c = ensayo();
    const hoja = SP.hoja.crear({ nombres: Object.keys(c), columnas: c, tipos: { bloque: { tipo: 'factor' }, hibrido: { tipo: 'factor' } } });
    hoja.agregarColumna({ nombre: 'rend_log', tipo: 'numerica', datos: c.rend.map(Math.log) });
    const filas = SP.expresiones.filtrar(hoja, 'dosis > 0');
    const reporte = { titulo: 'Ensayo de maíz', autor: 'Yo', items: [
      { metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido', 'dosis'], bloque: 'bloque' }, op: {}, titulo: 'ANOVA' },
      { metodo: 'regresion-lineal', e: { respuesta: 'rend', predictores: ['dosis'] }, op: {}, titulo: 'Regresión', nota: 'nota' }] };
    const bytes = await SP.proyecto.armar({ hoja, filtro: { expresion: 'dosis > 0', filas }, origen: 'prueba', reporte, estilos: { figuras: { barras: 'ic' } }, fecha: new Date('2026-10-02T12:00:00Z') });
    const p = SP.proyecto.abrir(bytes);
    SPT.afirmar(p.verificacion.ok, 'huellas: ' + JSON.stringify(p.verificacion));
    SPT.igualJSON(p.hoja.serializar(), hoja.serializar());
    SPT.igualJSON(p.filtro, { expresion: 'dosis > 0' });
    SPT.igual(p.origen, 'prueba');
    SPT.igualJSON(p.reporte.items.map(x => [x.metodo, x.titulo, x.nota]), [['dbca', 'ANOVA', ''], ['regresion-lineal', 'Regresión', 'nota']]);
    SPT.igualJSON(p.estilos, { figuras: { barras: 'ic' } });
    SPT.igual(p.manifiesto.archivos.length, 6);
    /* datos.csv trae solo las filas del filtro, con todas las cifras */
    const z = SP.zip.leer(bytes);
    const csv = z.texto('datos/datos.csv').trim().split('\n');
    SPT.igual(csv.length, filas.length + 1);
    SPT.afirmar(csv[1].includes(String(Math.log(c.rend[filas[0]]))), 'todas las cifras: ' + csv[1]);
    /* el código R: niveles de los factores y un bloque por análisis que parte de los datos originales */
    const R = z.texto('codigo/analisis.R');
    SPT.afirmar(/datos_originales\$hibrido <- factor\(datos_originales\$hibrido, levels = c\("H1", "H2", "H3"\)\)/.test(R), R.slice(0, 400));
    SPT.igual((R.match(/^datos <- datos_originales$/gm) || []).length, 2);
    /* un archivo cambiado: la huella lo detecta */
    const archivos = z.nombres.map(n => ({ nombre: n, datos: z.datos(n) }));
    const k = archivos.findIndex(a => a.nombre === 'datos/datos.csv');
    archivos[k] = { nombre: 'datos/datos.csv', datos: new TextEncoder().encode(z.texto('datos/datos.csv').replace(/\n/, '\n#')) };
    const v = SP.proyecto.abrir(SP.zip.construir(archivos)).verificacion;
    SPT.afirmar(!v.ok && v.archivos.find(a => a.ruta === 'datos/datos.csv').ok === false && v.archivos.filter(a => a.ok).length === 5);
    /* lo que no es un proyecto */
    SPT.lanza(() => SP.proyecto.abrir(SP.zip.construir([{ nombre: 'otro.txt', datos: 'x' }])), /no es un proyecto/);
    SPT.lanza(() => SP.proyecto.abrir(SP.zip.construir([{ nombre: 'manifiesto.json', datos: JSON.stringify({ formato: 'labg-sigmapro', version_formato: 9, version_programa: '9.0' }) }])), /más nueva/);
  });

  SPT.caso('Guardado automático: la instantánea sobrevive a la copia del navegador y devuelve la misma hoja, filtro y reporte', () => {
    const c = ensayo();
    const hoja = SP.hoja.crear({ nombres: Object.keys(c), columnas: c, tipos: { bloque: { tipo: 'factor' }, hibrido: { tipo: 'factor' } } });
    hoja.agregarColumna({ nombre: 'rend_log', tipo: 'numerica', datos: c.rend.map(Math.log) });
    hoja.agregarColumna({ nombre: 'siembra', tipo: 'fecha', datos: Float64Array.from(c.rend, (_, i) => 20600 + (i % 3)) });
    hoja.cols.find(x => x.nombre === 'hibrido').datos[1] = null;   // un faltante en un factor
    hoja.cols.find(x => x.nombre === 'rend').datos[2] = NaN;   // y en una numérica
    const reporte = { titulo: 'Ensayo', autor: 'Yo', items: [
      { id: 7, metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido'], bloque: 'bloque' }, op: { tipoSC: 3 }, ctx: null, bloque: 4, vista: 'anova', visibles: ['F', 'p'], titulo: 'ANOVA', nota: '' },
      { id: 9, metodo: 'descriptivos', e: { variables: ['rend'] }, op: {}, ctx: { factoresNumericos: ['dosis'] }, bloque: 3, titulo: '', nota: 'n' }] };
    const s = SP.proyecto.instantanea({ hoja, filtro: { expresion: 'dosis > 0', filas: [1, 2] }, origen: 'prueba', reporte, estilos: { figuras: { barras: 'ic' } }, fecha: new Date('2026-10-04T12:00:00Z') });
    /* las numéricas viajan como Float64Array (copia, no la misma memoria) */
    SPT.afirmar(s.hoja.columnas.find(x => x.nombre === 'rend').datos instanceof Float64Array, 'Float64Array');
    SPT.afirmar(s.hoja.columnas.find(x => x.nombre === 'rend').datos !== hoja.cols.find(x => x.nombre === 'rend').datos, 'copia');
    SPT.igualJSON(s.resumen, { filas: hoja.n, columnas: hoja.p, analisis: 2, origen: 'prueba', titulo: 'Ensayo' });
    const copia = typeof structuredClone === 'function' ? structuredClone(s) : s;   // lo que hace IndexedDB al guardar
    const p = SP.proyecto.deInstantanea(copia);
    SPT.igualJSON(p.hoja.serializar(), hoja.serializar());
    SPT.igualJSON(p.filtro, { expresion: 'dosis > 0' });
    SPT.igual(p.origen, 'prueba');
    /* los análisis conservan vista, columnas visibles, bloque y contexto; no su id */
    SPT.igualJSON(p.reporte.items[0], { metodo: 'dbca', e: { respuesta: 'rend', tratamientos: ['hibrido'], bloque: 'bloque' }, op: { tipoSC: 3 }, bloque: 4, vista: 'anova', visibles: ['F', 'p'], titulo: 'ANOVA', nota: '' });
    SPT.igualJSON(p.reporte.items[1].ctx, { factoresNumericos: ['dosis'] });
    SPT.igualJSON(p.estilos, { figuras: { barras: 'ic' } });
    /* cambiar el reporte después no cambia lo guardado */
    reporte.items[0].op.tipoSC = 1;
    SPT.igual(s.reporte.items[0].op.tipoSC, 3);
    /* sin datos (solo cálculos sin tabla, como la potencia) */
    const sd = SP.proyecto.deInstantanea(SP.proyecto.instantanea({ hoja: null, reporte: { items: [{ metodo: 'potencia-t', e: {}, op: { n: 10 } }] } }));
    SPT.igual(sd.hoja, null); SPT.igual(sd.reporte.items.length, 1);
    /* lo que no es un trabajo guardado, o viene de una versión más nueva */
    SPT.lanza(() => SP.proyecto.deInstantanea({ formato: 'otro' }), /no es un trabajo/);
    SPT.lanza(() => SP.proyecto.deInstantanea(Object.assign({}, s, { version_formato: 9, version_programa: '9.0' })), /más nueva/);
  });

  SPT.caso('Referencias: las obras que citan las conclusiones y las notas también van a la lista, escritas de cualquier forma', () => {
    const c = t => SP.informe.citasEnTexto(t).sort();
    SPT.igualJSON(c('concordancia considerable según Landis y Koch (1977)'), ['landis1977']);
    SPT.igualJSON(c('EE de Fleiss, Cohen y Everitt (1969); la prueba z…'), ['fleiss1969']);
    SPT.igualJSON(c('(medias armónicas; Holland y col. 2003)'), ['holland2003']);
    SPT.igualJSON(c('Agresti-Coull (1998); Jeffreys… Brown, Cai y DasGupta (2001) recomiendan'), ['agresti1998', 'brown2001']);
    SPT.igualJSON(c('(Cochran y Cox, 1957)'), ['cochranCox1957'], 'Cochran y Cox no es Cochran (1957)');
    SPT.igualJSON(c('(Cruz, Regazzi y Carneiro 2012)'), ['cruz2012']);
    SPT.igualJSON(c('dosis 1957 y Box y Cox (1964)'), [], 'sin la obra en la lista, nada');
    /* en el documento: el kappa cita a Landis y Koch y a Fleiss en su conclusión y su nota, no en el párrafo */
    const items = [{ id: 'sin-parrafo', titulo: 'Kappa', e: {}, op: {}, r: {}, rep: { conclusiones: ['Kappa = 0.757: concordancia considerable según Landis y Koch (1977).'],
      cuadros: [{ id: 'k', titulo: 'Concordancia', columnas: [{ clave: 'a', titulo: 'a', formato: 'texto' }], filas: [{ a: 'x' }], notas: ['EE de Fleiss, Cohen y Everitt (1969).'] }] } }];
    const refs = SP.informe.bloques(items, {}).filter(b => b.tipo === 'referencia').map(b => b.texto);
    SPT.afirmar(refs.some(t => /^Landis, J\. R\./.test(t)) && refs.some(t => /^Fleiss, J\. L\./.test(t)), refs.join(' | '));
  });
});

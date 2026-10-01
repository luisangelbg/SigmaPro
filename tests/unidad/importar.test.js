/* Pruebas de zip.js, xml.js, hojas.js, csv.js y tipos.js. Los libros reales y read.csv están
   en tests/casos/importar (contra R). */
SPT.describir('Importar · ZIP y DEFLATE', () => {
  const Z = SP.zip, utf8 = b => new TextDecoder().decode(b);
  /* flujos producidos por el compresor de node (zlib), nivel 9 y nivel 0 */
  const FIJO = 'y8jPSVTIQCEA';
  const DINAMICO = 'hdRNagMxFAPgfU8xBwiDn//nOGk7u9Cmgdw/hNRGtoJmLYzRx0PX8+1rv5wXd/q8/P7d98WdbvvP95JW59zH9T+1llpLU7Ge+pb6V5pXi6GnoaWhvcU00r/FYk/T9G9efc09zdO/aUgL/VtT6Wmd/s1r9FtPN+qLqTkqPGAZ/YwxS6OlUWPU8tRYS6NlpMaolaixlkbLWXq0rNRXSU+Ujj4+kEZLR41Ri29aS6NloMaoxTetpdEy02mhFt+0kh4t+aYPpIezNGqMWnzTWhoteT1Qi29aS6Mlrwdq8U0r6dGyyrXc5Fq+WY8By+ReOrmXJvfSy70Mci+j3Msk9zLLuSxyLatcy02u5ZubPpB+Wj4A';
  const ALMACENADO = 'ARkA5v9zaW4gY29tcHJlc2nDs246IMOxIMOhIMOp';
  const textoDinamico = () => Array.from({ length: 60 }, (_, i) => `parcela ${i % 12},bloque ${i % 4},rend ${(5 + (i * 37 % 11) / 7).toFixed(3)}\n`).join('');

  SPT.caso('descomprime bloques con Huffman fijo, dinámico y sin compresión', () => {
    SPT.igual(utf8(Z.inflar(Z.deBase64(FIJO))), 'hola hola hola hola');
    SPT.igual(utf8(Z.inflar(Z.deBase64(DINAMICO))), textoDinamico());
    SPT.igual(utf8(Z.inflar(Z.deBase64(ALMACENADO))), 'sin compresión: ñ á é');
  });

  SPT.caso('un flujo dañado da un error claro, no basura', () => {
    const b = Z.deBase64(DINAMICO).slice(0, 120);
    SPT.lanza(() => Z.inflar(b), 'dañado o incompleto');
  });

  SPT.caso('CRC-32 de la cadena de referencia', () => {
    SPT.igual(Z.crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  });

  SPT.caso('un ZIP escrito se vuelve a leer igual', () => {
    const z = Z.leer(Z.construir([{ nombre: 'a.txt', datos: 'uno' }, { nombre: 'carpeta/ñandú.xml', datos: '<x>dos</x>' }]));
    SPT.igualJSON(z.nombres, ['a.txt', 'carpeta/ñandú.xml']);
    SPT.igual(z.texto('carpeta/ñandú.xml'), '<x>dos</x>');
    SPT.igual(z.texto('no-existe'), null);
    SPT.lanza(() => Z.leer(new Uint8Array(40)), 'no es un ZIP');
  });

  SPT.caso('igual que el descompresor del navegador con datos al azar', async () => {
    let s = 3;
    const azar = () => (s = (s * 16807) % 2147483647) % 256;
    const datos = new Uint8Array(200000);
    for (let i = 0; i < datos.length; i++) datos[i] = i % 7 === 0 ? azar() : 65 + (i % 13);
    const comp = new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
    const mio = Z.inflar(comp);
    SPT.igual(mio.length, datos.length);
    let iguales = true;
    for (let i = 0; i < datos.length; i++) if (mio[i] !== datos[i]) { iguales = false; break; }
    SPT.afirmar(iguales, 'los bytes coinciden');
  }, { navegador: true });
});

SPT.describir('Importar · XML y libros', () => {
  SPT.caso('el recorredor XML entiende entidades, CDATA, comentarios y etiquetas vacías', () => {
    const ev = [];
    SP.xml.recorrer('<?xml version="1.0"?><!-- nota --><a x="1 &amp; 2" y=\'z\'><b/>t&lt;&#233;&#x41;<![CDATA[<crudo>]]></a>', {
      abre: (n, a, v) => ev.push('+' + n + JSON.stringify(a) + (v ? '/' : '')), cierra: n => ev.push('-' + n), texto: t => ev.push('«' + t + '»'),
    });
    SPT.igualJSON(ev, ['+a{"x":"1 & 2","y":"z"}', '+b{}/', '-b', '«t<éA»', '«<crudo>»', '-a']);
  });

  SPT.caso('lee un libro .ods: números, fechas, celdas repetidas y filas vacías', () => {
    const contenido = '<office:document-content><office:body><office:spreadsheet><table:table table:name="Ensayo">' +
      '<table:table-row><table:table-cell office:value-type="string"><text:p>bloque</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>rend</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>siembra</text:p></table:table-cell></table:table-row>' +
      '<table:table-row table:number-rows-repeated="2"><table:table-cell table:number-columns-repeated="3"/></table:table-row>' +
      '<table:table-row><table:table-cell office:value-type="float" office:value="1"/><table:table-cell office:value-type="float" office:value="4.25"/><table:table-cell office:value-type="date" office:date-value="2026-05-14"/></table:table-row>' +
      '<table:table-row><table:table-cell office:value-type="float" office:value="2"/><table:table-cell office:value-type="percentage" office:value="0.5"/><table:table-cell office:value-type="string"><text:p>no<text:s text:c="2"/>sé</text:p></table:table-cell><table:table-cell table:number-columns-repeated="16000"/></table:table-row>' +
      '</table:table></office:spreadsheet></office:body></office:document-content>';
    const libro = SP.hojas.leer(SP.zip.construir([{ nombre: 'mimetype', datos: 'application/vnd.oasis.opendocument.spreadsheet' }, { nombre: 'content.xml', datos: contenido }]));
    SPT.igualJSON(libro.nombres, ['Ensayo']);
    SPT.igualJSON(libro.hojas.Ensayo.filas, [['bloque', 'rend', 'siembra'], [1, 4.25, '2026-05-14'], [2, 0.5, 'no  sé']]);
  });

  SPT.caso('número de serie de fecha → texto (base 1900 y 1904)', () => {
    SPT.igual(SP.hojas.fechaDeSerie(45000), '2023-03-15');
    SPT.igual(SP.hojas.fechaDeSerie(45000.5), '2023-03-15 12:00:00');
    SPT.igual(SP.hojas.fechaDeSerie(0, true), '1904-01-01');
    SPT.igual(SP.hojas.columnaDe('AB12'), 27);
  });
});

SPT.describir('Importar · texto delimitado', () => {
  const C = SP.csv;
  SPT.caso('detecta el separador y la coma decimal', () => {
    SPT.igualJSON(C.detectar('a,b,c\n1,2,3\n4,5,6\n'), { delimitador: ',', decimal: '.' });
    SPT.igualJSON(C.detectar('a;b;c\n1,5;2;3\n4,25;5;6\n'), { delimitador: ';', decimal: ',' });
    SPT.igualJSON(C.detectar('a\tb\n1.5\t2\n3\t4.75\n'), { delimitador: '\t', decimal: '.' });
  });

  SPT.caso('números: coma decimal, miles sin ambigüedad, infinitos y textos', () => {
    SPT.igual(C.aNumero('4,25', ','), 4.25);
    SPT.igual(C.aNumero('1.234,5', ','), 1234.5);
    SPT.igual(C.aNumero('1,234,567.8', '.'), 1234567.8);
    SPT.igual(C.aNumero('1,234', '.'), NaN, 'ambiguo con punto decimal: no se adivina');
    SPT.igual(C.aNumero('-Inf', '.'), -Infinity);
    SPT.igual(C.aNumero(' 2.5e-3 ', '.'), 0.0025);
    SPT.igual(C.aNumero('12 kg', '.'), NaN);
  });

  SPT.caso('decodifica UTF-8 con BOM y cae a Latin-1 si no es UTF-8', () => {
    SPT.igual(C.decodificar(new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0xc3, 0xb1])).texto, 'añ');
    const l1 = C.decodificar(new Uint8Array([0x61, 0xf1, 0x6f]));
    SPT.igual(l1.texto, 'año'); SPT.afirmar(/Latin-1/.test(l1.codificacion));
  });

  SPT.caso('comilla sin cerrar y nombres repetidos o vacíos', () => {
    SPT.lanza(() => C.analizar('a,b\n"1,2\n'), 'comilla que no se cierra');
    SPT.igualJSON(C.leerColumnas('x,,x\n1,2,3\n').nombres, ['x', 'V2', 'x.1']);
  });
});

SPT.describir('Importar · tipos de columna', () => {
  const I = (n, v) => SP.tipos.inferir(n, v);
  SPT.caso('enteros con nombre de factor son factor; con nombre de medición, números', () => {
    const b = I('bloque', [1, 2, 3, 4, 1, 2, 3, 4]);
    SPT.igual(b.tipo, 'factor'); SPT.igualJSON(b.niveles, ['1', '2', '3', '4']); SPT.afirmar(/bloque/.test(b.razon));
    SPT.igual(I('rend', [4.2, 5.1, 6.3, 4.8]).tipo, 'numerica');
    const d = I('dosis', [0, 60, 120, 0, 60, 120]);
    SPT.igual(d.tipo, 'numerica'); SPT.igual(d.sugerencia, 'factor', 'sugiere factor sin imponerlo');
  });
  SPT.caso('identificadores, fechas, textos y mezclas', () => {
    SPT.igual(I('parcela', [101, 102, 103, 104]).tipo, 'id');
    SPT.igual(I('siembra', ['2026-05-14', '15/05/2026', '2026-05-16']).tipo, 'fecha');
    SPT.igual(I('variedad', ['Criollo', 'H-40', 'Criollo']).tipo, 'factor');
    SPT.igual(I('caja', ['C01', 'C02', 'C03', 'C04']).tipo, 'id', 'códigos letra + número, todos distintos');
    SPT.igual(I('nota', ['buena', 'regular', 'mala']).tipo, 'texto', 'textos distintos que no son códigos');
    for (const nom of ['id', 'ID_planta', 'parcela', 'parcelas', 'Parcela 2', 'no.', 'n°', 'numero', 'número_lote', 'planta', 'muestra1']) SPT.afirmar(SP.tipos.NOMBRE_ID.test(nom), nom + ' es nombre de identificador');
    for (const nom of ['idioma', 'nota', 'nitrogeno', 'N', 'numerador', 'nodos']) SPT.afirmar(!SP.tipos.NOMBRE_ID.test(nom), nom + ' no es nombre de identificador');
    for (const nom of ['bloque', 'Bloque_2', 'rep1', 'tratamiento', 'trat_N', 'hibrido', 'año', 'anio', 'fecha_siembra']) SPT.afirmar(SP.tipos.NOMBRE_FACTOR.test(nom), nom + ' es nombre de factor');
    for (const nom of ['color', 'variable', 'reporte', 'location', 'anomalia']) SPT.afirmar(!SP.tipos.NOMBRE_FACTOR.test(nom), nom + ' no es nombre de factor');
    const m = I('rend', [4.2, 'perdida', 5.0, 4.4, 5.1]);
    SPT.igual(m.tipo, 'numerica', 'medición con un texto suelto'); SPT.afirmar(/4 de 5/.test(m.razon) && /perdida/.test(m.razon), m.razon);
    SPT.igual(I('rend', [4.2, 'perdida', 'muerta', 4.4]).tipo, 'texto', 'con la mitad de textos ya no es medición');
  });
  SPT.caso('fechas válidas e inválidas; vuelta a texto', () => {
    SPT.igual(SP.tipos.textoFecha(SP.tipos.fecha('29/02/2024')), '2024-02-29');
    SPT.igual(SP.tipos.fecha('31/04/2026'), NaN, '31 de abril no existe');
    SPT.igual(SP.tipos.textoFecha(SP.tipos.fecha('2026-05-14 08:30')), '2026-05-14 08:30:00');
    SPT.igualJSON(SP.tipos.ordenarNiveles(['10', '2', '1']), ['1', '2', '10']);
    SPT.igualJSON(SP.tipos.ordenarNiveles(['Testigo', 'Urea', 'Testigo', 'Sulfato']), ['Testigo', 'Urea', 'Sulfato']);
  });
});

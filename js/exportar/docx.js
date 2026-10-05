/* SigmaPro — escritor de documentos .docx (Office Open XML WordprocessingML, ECMA-376) sobre el ZIP propio.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Adaptado del escritor de SciMetricsPro (mismo autor). Un documento es una lista de bloques:
     { tipo: 'titulo' | 'subtitulo' | 'portada', texto }
     { tipo: 'encabezado', nivel: 1 | 2 | 3, texto }
     { tipo: 'parrafo', texto | trozos: [{ texto, negrita, cursiva }], estilo? }
     { tipo: 'figura', imagen: Uint8Array (PNG), anchoCm, altoCm, nombre, leyenda: { etiqueta, numero, texto }, alt }
     { tipo: 'cuadro', leyenda: { etiqueta, numero, texto }, cabecera: [..], filas: [[..]], numericas: [bool], totales: [bool], notas: [..] }
     { tipo: 'codigo', texto }                                         letra de ancho fijo, chica
     { tipo: 'conclusion', texto }                                     la conclusión en palabras, con una línea a la izquierda
     { tipo: 'semaforo', filas: [{ color, nombre, texto }] }            los supuestos: «Bien», «Revisar», «Problema»
     { tipo: 'referencia', texto }                                     sangría francesa
     { tipo: 'salto' }
   Las leyendas llevan un campo SEQ (se renumeran al actualizar los campos), el número de página va en el pie (no en la
   portada), las figuras van en línea con su tamaño físico y los cuadros tienen la fila de encabezado repetida y las tres
   líneas de revista (arriba, bajo el encabezado y abajo).

     SP.docx.construir({ titulo, autor, hoja: 'carta' | 'a4', bloques }) → Uint8Array
     SP.docx.MIME · SP.docx.anchoUtilCm(hoja) */
SP.definir('docx', function (SP) {
  'use strict';
  const MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const EMU_POR_CM = 360000, TWIPS_POR_CM = 1440 / 2.54;
  const HOJAS = { carta: { w: 12240, h: 15840 }, a4: { w: 11906, h: 16838 } };
  const MARGEN = 1418;   /* 2.5 cm */
  const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

  function esc(s) {
    let limpio = '';
    for (const ch of String(s == null ? '' : s)) { const c = ch.charCodeAt(0); if (c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 0xFFFE && c !== 0xFFFF)) limpio += ch; }
    return limpio.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  const anchoUtilCm = hoja => ((HOJAS[hoja] || HOJAS.carta).w - 2 * MARGEN) / TWIPS_POR_CM;

  function trozo(texto, o) {
    o = o || {};
    const props = (o.negrita ? '<w:b/>' : '') + (o.cursiva ? '<w:i/>' : '');
    const rPr = props ? '<w:rPr>' + props + '</w:rPr>' : '';
    return String(texto == null ? '' : texto).split('\n').map((linea, i) =>
      (i ? '<w:r>' + rPr + '<w:br/></w:r>' : '') + linea.split('\t').map((parte, j) => (j ? '<w:r>' + rPr + '<w:tab/></w:r>' : '') + (parte ? `<w:r>${rPr}<w:t xml:space="preserve">${esc(parte)}</w:t></w:r>` : '')).join('')).join('');
  }
  function parrafo(contenido, o) {
    o = o || {};
    const pPr = (o.estilo ? `<w:pStyle w:val="${o.estilo}"/>` : '') + (o.juntoSiguiente ? '<w:keepNext/>' : '') + (o.alinear ? `<w:jc w:val="${o.alinear}"/>` : '');
    return '<w:p>' + (pPr ? '<w:pPr>' + pPr + '</w:pPr>' : '') + contenido + '</w:p>';
  }
  /* «Cuadro 1. Título»: el número es un campo SEQ con su resultado actual; un campo complejo conserva las negritas */
  function leyenda(l, seq, o) {
    const b = '<w:rPr><w:b/></w:rPr>';
    const numero = `<w:r>${b}<w:fldChar w:fldCharType="begin"/></w:r><w:r>${b}<w:instrText xml:space="preserve"> SEQ ${esc(seq)} \\* ARABIC </w:instrText></w:r>`
      + `<w:r>${b}<w:fldChar w:fldCharType="separate"/></w:r><w:r>${b}<w:t>${esc(l.numero)}</w:t></w:r><w:r>${b}<w:fldChar w:fldCharType="end"/></w:r>`;
    return parrafo(trozo(l.etiqueta + ' ', { negrita: true }) + numero + trozo('. ', { negrita: true }) + trozo(l.texto), { estilo: 'Caption', juntoSiguiente: o && o.juntoSiguiente });
  }
  function dibujo(b, rid, id) {
    const cx = Math.round(b.anchoCm * EMU_POR_CM), cy = Math.round(b.altoCm * EMU_POR_CM);
    const nombre = esc(b.nombre || 'figura' + id + '.png'), alt = esc(b.alt || '');
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
      + `<wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="${nombre}" descr="${alt}"/>`
      + '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
      + '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
      + `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="${nombre}" descr="${alt}"/><pic:cNvPicPr/></pic:nvPicPr>`
      + `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>`
      + '</a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }

  /* anchos de columna en twips: cada columna tan ancha como su texto más largo (encabezado y primeras filas), nunca más
     angosta que su palabra más larga y a lo más 40 caracteres; el cuadro ocupa la página solo si lo necesita */
  const TWIPS_POR_CARACTER = 105;
  function disposicion(b, twipsUtiles) {
    const n = Math.max(1, b.cabecera.length);
    const palabra = s => Math.max(0, ...String(s == null ? '' : s).split(/\s+/).map(w => w.length));
    const necesita = b.cabecera.map((h, j) => {
      let largo = String(h == null ? '' : h).length * 0.6, pal = palabra(h);
      b.filas.slice(0, 60).forEach(r => { const v = r[j]; largo = Math.max(largo, String(v == null ? '' : v).length); pal = Math.max(pal, palabra(v)); });
      return { largo: Math.min(40, Math.max(4, largo)), pal: Math.min(30, Math.max(3, pal)) };
    });
    const relleno = 200;
    const natural = necesita.map(c => Math.max(c.largo, c.pal) * TWIPS_POR_CARACTER + relleno);
    const minimo = necesita.map(c => c.pal * TWIPS_POR_CARACTER + relleno);
    let anchos;
    const sumaNatural = natural.reduce((a, x) => a + x, 0);
    if (sumaNatural <= twipsUtiles) anchos = natural.map(Math.round);
    else {
      const sumaMin = minimo.reduce((a, x) => a + x, 0);
      if (sumaMin >= twipsUtiles) anchos = minimo.map(w => Math.floor(twipsUtiles * w / sumaMin));
      else {
        const holgura = natural.map((w, j) => w - minimo[j]), sumaH = holgura.reduce((a, x) => a + x, 0) || 1;
        const k = (twipsUtiles - sumaMin) / sumaH;
        anchos = minimo.map((w, j) => Math.floor(w + holgura[j] * k));
      }
      anchos[n - 1] += twipsUtiles - anchos.reduce((a, x) => a + x, 0);
    }
    return { anchos, total: anchos.reduce((a, x) => a + x, 0) };
  }
  function cuadro(b, twipsUtiles) {
    const d = disposicion(b, twipsUtiles), anchos = d.anchos;
    const celda = (valor, j, cab, total) => {
      const alinear = b.numericas && b.numericas[j] ? '<w:jc w:val="right"/>' : '';
      const bordes = cab ? '<w:tcBorders><w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/></w:tcBorders>'
        : total ? '<w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tcBorders>' : '';
      return `<w:tc><w:tcPr><w:tcW w:w="${anchos[j]}" w:type="dxa"/>${bordes}</w:tcPr><w:p><w:pPr><w:pStyle w:val="TableText"/>${alinear}</w:pPr>${trozo(valor == null ? '' : valor, { negrita: cab || total })}</w:p></w:tc>`;
    };
    const out = ['<w:tbl><w:tblPr><w:tblStyle w:val="Revista"/>' + `<w:tblW w:w="${d.total}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr>`];
    out.push('<w:tblGrid>' + anchos.map(w => `<w:gridCol w:w="${w}"/>`).join('') + '</w:tblGrid>');
    out.push('<w:tr><w:trPr><w:cantSplit/><w:tblHeader/></w:trPr>' + b.cabecera.map((h, j) => celda(h, j, true, false)).join('') + '</w:tr>');
    b.filas.forEach((r, i) => out.push('<w:tr><w:trPr><w:cantSplit/></w:trPr>' + b.cabecera.map((h, j) => celda(r[j], j, false, b.totales && b.totales[i])).join('') + '</w:tr>'));
    out.push('</w:tbl>');
    return out.join('');
  }

  const SEMAFORO = { verde: SP.T('Bien'), ambar: SP.T('Revisar'), rojo: SP.T('Problema'), gris: SP.T('No aplica') };
  const ESTILOS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    + '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="23"/><w:szCs w:val="23"/><w:lang w:val="' + (SP.IDIOMA === 'en' ? 'en-US' : 'es-MX') + '"/></w:rPr></w:rPrDefault>'
    + '<w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="both"/></w:pPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="2400" w:after="360"/><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/><w:szCs w:val="44"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="480"/><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="Portada"><w:name w:val="Portada"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="120"/><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="480" w:after="160"/><w:jc w:val="left"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="360" w:after="120"/><w:jc w:val="left"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="240" w:after="80"/><w:jc w:val="left"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:before="60" w:after="160" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="Figura"><w:name w:val="Figura"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="TableText"><w:name w:val="Texto de cuadro"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr><w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="NotaCuadro"><w:name w:val="Nota de cuadro"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/><w:jc w:val="left"/></w:pPr><w:rPr><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="Codigo"><w:name w:val="Código"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="284"/><w:jc w:val="left"/></w:pPr><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="Conclusion"><w:name w:val="Conclusión"/><w:basedOn w:val="Normal"/><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="9C7128"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="FAF6EC"/><w:ind w:left="170"/><w:jc w:val="left"/></w:pPr></w:style>'
    + '<w:style w:type="paragraph" w:customStyle="1" w:styleId="Semaforo"><w:name w:val="Semáforo"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="60"/><w:ind w:left="284"/><w:jc w:val="left"/></w:pPr><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Bibliography"><w:name w:val="Bibliography"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="100"/><w:ind w:left="567" w:hanging="567"/><w:jc w:val="left"/></w:pPr></w:style>'
    + '<w:style w:type="paragraph" w:styleId="Footer"><w:name w:val="footer"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="0"/><w:jc w:val="center"/></w:pPr><w:rPr><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style>'
    + '<w:style w:type="table" w:customStyle="1" w:styleId="Revista"><w:name w:val="Cuadro de revista"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/></w:tblBorders><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>'
    + '</w:styles>';

  function construir(doc) {
    const hoja = HOJAS[doc.hoja] ? doc.hoja : 'carta';
    const tam = HOJAS[hoja];
    const twipsUtiles = tam.w - 2 * MARGEN;
    const cuerpo = [], rels = [], medios = [];
    let idDibujo = 0;
    for (const b of doc.bloques) {
      if (b.tipo === 'titulo') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Title' }));
      else if (b.tipo === 'subtitulo') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Subtitle' }));
      else if (b.tipo === 'portada') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Portada' }));
      else if (b.tipo === 'encabezado') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Heading' + Math.min(3, Math.max(1, b.nivel || 1)) }));
      else if (b.tipo === 'parrafo') cuerpo.push(parrafo((b.trozos || [{ texto: b.texto }]).map(r => trozo(r.texto, r)).join(''), { estilo: b.estilo }));
      else if (b.tipo === 'referencia') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Bibliography' }));
      else if (b.tipo === 'conclusion') cuerpo.push(parrafo(trozo(b.texto), { estilo: 'Conclusion' }));
      else if (b.tipo === 'semaforo') b.filas.forEach(s => cuerpo.push(parrafo(trozo((SEMAFORO[s.color] || '') + ' · ', { negrita: true }) + trozo(s.nombre + ': ', { negrita: true }) + trozo(s.texto), { estilo: 'Semaforo' })));
      else if (b.tipo === 'codigo') String(b.texto || '').split('\n').forEach(l => cuerpo.push(parrafo(trozo(l), { estilo: 'Codigo' })));
      else if (b.tipo === 'salto') cuerpo.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      else if (b.tipo === 'figura') {
        idDibujo++;
        const rid = 'rIdImg' + idDibujo, archivo = 'media/imagen' + idDibujo + '.png';
        rels.push(`<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${archivo}"/>`);
        medios.push({ nombre: 'word/' + archivo, datos: b.imagen });
        cuerpo.push(parrafo(dibujo(b, rid, idDibujo), { estilo: 'Figura' }));
        if (b.leyenda) cuerpo.push(leyenda(b.leyenda, b.leyenda.seq || 'Figura'));
      } else if (b.tipo === 'cuadro') {
        if (b.leyenda) cuerpo.push(leyenda(b.leyenda, b.leyenda.seq || 'Cuadro', { juntoSiguiente: true }));
        cuerpo.push(cuadro(b, twipsUtiles));
        if (b.notas && b.notas.length) b.notas.forEach(n => cuerpo.push(parrafo(trozo(n), { estilo: 'NotaCuadro' })));
        cuerpo.push('<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>');
      }
    }
    const secc = `<w:sectPr><w:footerReference w:type="default" r:id="rIdPie1"/><w:pgSz w:w="${tam.w}" w:h="${tam.h}"/>`
      + `<w:pgMar w:top="${MARGEN}" w:right="${MARGEN}" w:bottom="${MARGEN}" w:left="${MARGEN}" w:header="709" w:footer="709" w:gutter="0"/><w:titlePg/></w:sectPr>`;
    const documento = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${cuerpo.join('')}${secc}</w:body></w:document>`;
    const iso = (doc.fecha || new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
    const archivos = [
      { nombre: '[Content_Types].xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>'
        + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
        + '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
        + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>' },
      { nombre: '_rels/.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' },
      { nombre: 'docProps/core.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(doc.titulo || '')}</dc:title><dc:creator>${esc(doc.autor || 'SigmaPro')}</dc:creator><dc:language>es-MX</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${iso}</dcterms:modified></cp:coreProperties>` },
      { nombre: 'docProps/app.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>SigmaPro ${esc(SP.VERSION)}</Application></Properties>` },
      { nombre: 'word/document.xml', datos: documento },
      { nombre: 'word/styles.xml', datos: ESTILOS },
      { nombre: 'word/settings.xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="709"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>' },
      { nombre: 'word/footer1.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:ftr ${NS}><w:p><w:pPr><w:pStyle w:val="Footer"/></w:pPr><w:fldSimple w:instr=" PAGE "><w:r><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>` },
      { nombre: 'word/_rels/document.xml.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdEstilos" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdAjustes" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rIdPie1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' + rels.join('') + '</Relationships>' },
    ].concat(medios);
    return SP.zip.construir(archivos);
  }

  SP.docx = { MIME, construir, anchoUtilCm, disposicion };
});

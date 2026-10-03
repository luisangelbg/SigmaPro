/* SigmaPro — escritor de hojas de cálculo (.xlsx, Office Open XML SpreadsheetML, ECMA-376).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una hoja por cuadro: encabezado en negritas sobre un fondo dorado claro con borde inferior, fijo y con filtros;
   anchos según el contenido. Los números se escriben como números con todas sus cifras (la forma más corta que
   devuelve el mismo doble), así que una hoja leída de vuelta da exactamente los resultados de la app. Adaptado del
   escritor de SciMetricsPro (mismo autor). Sobre el ZIP propio (SP.zip).

     SP.xlsx.construir([{ nombre, filas: [[cabecera…], [valores…]…] }]) → Uint8Array
     SP.xlsx.MIME */
SP.definir('xlsx', function (SP) {
  'use strict';
  const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  function esc(s) {
    /* fuera los caracteres que XML 1.0 no admite */
    let limpio = '';
    for (const ch of String(s)) { const c = ch.charCodeAt(0); if (c === 9 || c === 10 || c === 13 || (c >= 32 && c !== 0xFFFE && c !== 0xFFFF)) limpio += ch; }
    return limpio.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function columna(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }

  function hojaXml(filas) {
    const nCols = Math.max(1, ...filas.map(r => r.length));
    const anchos = new Array(nCols).fill(8);
    filas.slice(0, 201).forEach((r, ri) => r.forEach((v, j) => {
      const largo = v == null ? 0 : String(v).length + (ri === 0 ? 3 : 1);
      anchos[j] = Math.min(60, Math.max(anchos[j], typeof v === 'number' ? Math.min(14, largo) : largo));
    }));
    const out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'];
    out.push(filas.length > 1 ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>' : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>');
    out.push('<sheetFormatPr defaultRowHeight="15"/><cols>' + anchos.map((w, j) => `<col min="${j + 1}" max="${j + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols><sheetData>');
    filas.forEach((r, ri) => {
      const celdas = [];
      r.forEach((v, j) => {
        if (v == null || v === '') return;
        const ref = columna(j) + (ri + 1);
        const estilo = ri === 0 ? ' s="1"' : '';
        if (typeof v === 'number' && Number.isFinite(v)) celdas.push(`<c r="${ref}"${estilo}><v>${v}</v></c>`);
        else if (typeof v === 'boolean') celdas.push(`<c r="${ref}"${estilo} t="b"><v>${v ? 1 : 0}</v></c>`);
        else {
          const s = String(v).slice(0, 32767);
          const espacio = /^\s|\s$|\n/.test(s) ? ' xml:space="preserve"' : '';
          celdas.push(`<c r="${ref}"${estilo} t="inlineStr"><is><t${espacio}>${esc(s)}</t></is></c>`);
        }
      });
      out.push(`<row r="${ri + 1}"${ri === 0 ? ' ht="20" customHeight="1"' : ''}>${celdas.join('')}</row>`);
    });
    out.push('</sheetData>');
    if (filas.length > 1) out.push(`<autoFilter ref="A1:${columna(nCols - 1)}${filas.length}"/>`);
    out.push('<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>');
    return out.join('');
  }

  const ESTILOS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FF17150F"/><name val="Calibri"/><family val="2"/></font></fonts>'
    + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4EAD2"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="medium"><color rgb="FF7D5B14"/></bottom><diagonal/></border></borders>'
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs>'
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  /* nombres de hoja: hasta 31 caracteres, sin []:*?/\ y distintos entre sí */
  function nombres(hojas) {
    const usados = new Set();
    return hojas.map((h, i) => {
      const base = String(h.nombre || ('Hoja' + (i + 1))).replace(/[[\]:*?/\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 31) || 'Hoja' + (i + 1);
      let n = base, k = 2;
      while (usados.has(n.toLowerCase())) { const suf = ' (' + (k++) + ')'; n = base.slice(0, 31 - suf.length) + suf; }
      usados.add(n.toLowerCase());
      return n;
    });
  }

  function construir(hojas, op) {
    op = op || {};
    const ns = nombres(hojas);
    const iso = (op.fecha || new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
    const archivos = [];
    archivos.push({ nombre: '[Content_Types].xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
      + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' });
    archivos.push({ nombre: '_rels/.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' });
    archivos.push({ nombre: 'docProps/core.xml', datos: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(op.titulo || '')}</dc:title><dc:creator>SigmaPro ${esc(SP.VERSION)}</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created></cp:coreProperties>` });
    const definidos = hojas.map((h, i) => (h.filas.length > 1 ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${esc(ns[i].replace(/'/g, "''"))}'!$A$1:$${columna(Math.max(1, ...h.filas.map(r => r.length)) - 1)}$${h.filas.length}</definedName>` : '')).join('');
    archivos.push({ nombre: 'xl/workbook.xml', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>'
      + ns.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') + '</sheets>' + (definidos ? '<definedNames>' + definidos + '</definedNames>' : '') + '</workbook>' });
    archivos.push({ nombre: 'xl/_rels/workbook.xml.rels', datos: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')
      + `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` });
    archivos.push({ nombre: 'xl/styles.xml', datos: ESTILOS });
    hojas.forEach((h, i) => archivos.push({ nombre: `xl/worksheets/sheet${i + 1}.xml`, datos: hojaXml(h.filas) }));
    return SP.zip.construir(archivos);
  }

  SP.xlsx = { MIME, construir, nombres, columna };
});

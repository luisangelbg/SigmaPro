/* SigmaPro — ventanas del bloque Datos: importar, pegar, variable calculada, transformar,
   filtrar, ancha ⇄ larga, renombrar y ordenar niveles.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE). */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const L = () => window.LABG;
  const ui = () => SP.datosUI;
  const hoja = () => ui().estado().hoja;
  const NOMBRE_TIPO = { numerica: 'numérica', factor: 'factor', fecha: 'fecha', texto: 'texto', id: 'identificador' };
  const opcionesTipo = sel => Object.keys(NOMBRE_TIPO).map(t => `<option value="${t}"${t === sel ? ' selected' : ''}>${esc(T(NOMBRE_TIPO[t]))}</option>`).join('');
  const listaFaltantes = s => ['', ...String(s).split(',').map(x => x.trim()).filter(Boolean)];
  const conEspera = (titulo, tarea) => (L() && L().work ? L().work.run({ title: titulo, delay: 400 }, tarea) : tarea());

  /* ======================= importar ======================= */
  async function importarArchivo(archivo) {
    const ext = (archivo.name.split('.').pop() || '').toLowerCase();
    if (['xls', 'xlsb'].includes(ext)) {
      L() && L().toast(T('Los libros del formato viejo (.{e}) no se pueden abrir. Guárdalo como .xlsx o .csv desde tu hoja de cálculo.', { e: ext }), { type: 'error' });
      return;
    }
    try {
      const bytes = new Uint8Array(await archivo.arrayBuffer());
      if (['xlsx', 'xlsm', 'ods'].includes(ext)) {
        const libro = await conEspera(T('Leyendo el libro'), () => SP.hilo.correr('hojas.leer', [bytes]));
        dialogoImportar({ tipo: 'libro', libro }, archivo.name);
      } else {
        const d = SP.csv.decodificar(bytes);
        dialogoImportar({ tipo: 'texto', texto: d.texto, codificacion: d.codificacion }, archivo.name);
      }
    } catch (e) {
      L() && L().toast(e.message + (e.arreglo ? ' ' + e.arreglo : ''), { type: 'error' });
    }
  }
  function importarTexto(texto, origen) { dialogoImportar({ tipo: 'texto', texto, codificacion: '' }, origen); }

  function dialogoImportar(fuente, origen) {
    const det = fuente.tipo === 'texto' ? SP.csv.detectar(fuente.texto) : { delimitador: ',', decimal: '.' };
    const op = { delimitador: det.delimitador, decimal: det.decimal, encabezado: true, faltantes: 'NA, ., -', hoja: fuente.tipo === 'libro' ? fuente.libro.nombres[0] : null };
    const tiposElegidos = {};
    let actual = null;
    const SEP = [[',', 'coma'], [';', 'punto y coma'], ['\t', 'tabulador'], ['|', 'barra vertical']];
    const cuerpo =
      `<p class="small muted">${esc(origen)}${fuente.codificacion ? ' · ' + esc(fuente.codificacion) : ''}</p>` +
      `<div class="imp-opciones">` +
      (fuente.tipo === 'libro'
        ? `<label class="field"><span>${T('Hoja')}</span><select data-op="hoja">${fuente.libro.nombres.map(n => `<option>${esc(n)}</option>`).join('')}</select></label>`
        : `<label class="field"><span>${T('Separador de columnas')}</span><select data-op="delimitador">${SEP.map(([v, n]) => `<option value="${v === '\t' ? 'tab' : v}"${v === op.delimitador ? ' selected' : ''}>${esc(T(n))}</option>`).join('')}</select></label>`) +
      `<label class="field"><span>${T('Separador decimal')}</span><select data-op="decimal"><option value="."${op.decimal === '.' ? ' selected' : ''}>${T('punto (4.25)')}</option><option value=","${op.decimal === ',' ? ' selected' : ''}>${T('coma (4,25)')}</option></select></label>` +
      `<label class="field"><span>${T('Códigos de faltante')}</span><input data-op="faltantes" value="${esc(op.faltantes)}" aria-describedby="impFaltAyuda"><span class="field-help" id="impFaltAyuda">${T('Separados por comas; la celda vacía siempre es faltante.')}</span></label>` +
      `<label class="imp-check"><input type="checkbox" data-op="encabezado" checked> ${T('La primera fila tiene los nombres')}</label>` +
      `</div><div class="imp-resumen small" aria-live="polite"></div><div class="tabla-wrap imp-vista"></div>`;
    SP.ui.dialogo({
      titulo: T('Importar datos'), cuerpo, ancho: 'min(1100px, 96vw)',
      botones: [
        { texto: T('Cancelar'), tipo: 'secundario' },
        {
          texto: T('Importar'), tipo: 'primario', accion: () => {
            if (!actual || !actual.nombres.length) throw new SP.ErrorSP(T('No hay columnas que importar.'));
            const tipos = {};
            actual.nombres.forEach((n, j) => { tipos[n] = { tipo: tiposElegidos[n] || actual.inferidos[j].tipo, niveles: (tiposElegidos[n] || actual.inferidos[j].tipo) === actual.inferidos[j].tipo ? actual.inferidos[j].niveles : undefined }; });
            const h = SP.hoja.crear({ nombres: actual.nombres, columnas: actual.columnas, tipos, opciones: { decimal: op.decimal, faltantes: listaFaltantes(op.faltantes) } });
            h.cols.forEach((c, j) => { if (!tiposElegidos[c.nombre]) c.razon = actual.inferidos[j].razon; });
            ui().cargar(h, origen + (op.hoja ? ' · ' + op.hoja : ''));
            const avisos = actual.inferidos.filter(x => x.textosComoFaltantes && x.textosComoFaltantes.length).length;
            if (avisos && L()) L().toast(T('{k} columnas numéricas tenían textos sueltos que se tomaron como faltantes; revisa la explicación de cada variable.', { k: avisos }), { type: 'warning' });
          },
        },
      ],
      alAbrir(d) {
        const c = d.cuerpo;
        const recalcular = () => {
          try {
            d.error('');
            let filas;
            if (fuente.tipo === 'texto') filas = SP.csv.analizar(fuente.texto, { delimitador: op.delimitador });
            else filas = fuente.libro.hojas[op.hoja].filas;
            if (!filas.length) throw new SP.ErrorSP(T('No hay datos.'));
            const ancho = filas.reduce((m, f) => Math.max(m, f.length), 0);
            let nombres = op.encabezado ? filas[0].map(v => String(v).trim()) : [];
            while (nombres.length < ancho) nombres.push('');
            nombres = SP.csv.nombresUnicos(nombres);
            const cuerpoFilas = op.encabezado ? filas.slice(1) : filas;
            const fal = listaFaltantes(op.faltantes);
            const columnas = {};
            nombres.forEach((n, j) => { columnas[n] = SP.hoja.normalizar(cuerpoFilas.map(f => (f[j] === undefined ? '' : f[j])), { decimal: op.decimal, faltantes: fal }); });
            const inferidos = nombres.map(n => SP.tipos.inferir(n, columnas[n]));
            actual = { nombres, columnas, inferidos, n: cuerpoFilas.length };
            pintarVista();
          } catch (e) { actual = null; d.error(e.message + (e.arreglo ? ' ' + e.arreglo : '')); c.querySelector('.imp-vista').innerHTML = ''; }
        };
        /* la celda como quedará: números con el decimal elegido, fechas en AAAA-MM-DD y lo que no se pueda convertir, como faltante */
        const FALTA = v => `<td class="izq"><span class="imp-falta">${esc(v)} → ${esc(T('faltante'))}</span></td>`;
        const celda = (tipo, v) => {
          if (v === null) return '<td class="izq muted">—</td>';
          if (tipo === 'numerica') {
            const x = typeof v === 'number' ? v : SP.csv.aNumero(String(v), op.decimal);
            if (Number.isNaN(x)) return FALTA(v);
            const t = SP.tipos.numeroATexto(x);
            return `<td>${esc(op.decimal === ',' ? t.replace('.', ',') : t)}</td>`;
          }
          if (tipo === 'fecha') { const x = SP.tipos.fecha(String(v)); return Number.isNaN(x) ? FALTA(v) : `<td class="izq">${esc(SP.tipos.textoFecha(x))}</td>`; }
          return `<td class="izq">${esc(v)}</td>`;
        };
        const pintarVista = () => {
          const { nombres, columnas, inferidos, n } = actual;
          c.querySelector('.imp-resumen').textContent = T('Se importarán {n} filas y {p} columnas. Revisa el tipo de cada columna: decide cómo se analiza.', { n: n.toLocaleString('es-MX'), p: nombres.length });
          const muestra = Math.min(n, 8);
          let h = '<table class="revista imp-tabla"><thead><tr>' + nombres.map((nom, j) =>
            `<th class="izq"><span class="imp-nom">${esc(nom)}</span><select data-tipo="${esc(nom)}" aria-label="${esc(T('Tipo de {c}', { c: nom }))}">${opcionesTipo(tiposElegidos[nom] || inferidos[j].tipo)}</select>` +
            `<span class="imp-razon" title="${esc(inferidos[j].razon)}">${esc(inferidos[j].razon)}</span></th>`).join('') + '</tr></thead><tbody>';
          for (let i = 0; i < muestra; i++) h += '<tr>' + nombres.map((nom, j) => celda(tiposElegidos[nom] || inferidos[j].tipo, columnas[nom][i])).join('') + '</tr>';
          c.querySelector('.imp-vista').innerHTML = h + '</tbody></table>' + (n > muestra ? `<p class="small muted">${T('… y {k} filas más.', { k: (n - muestra).toLocaleString('es-MX') })}</p>` : '');
        };
        c.addEventListener('change', e => {
          const k = e.target.dataset.op, t = e.target.dataset.tipo;
          if (t) { tiposElegidos[t] = e.target.value; const foco = e.target.dataset.tipo; pintarVista(); const s = c.querySelector(`[data-tipo="${CSS.escape(foco)}"]`); if (s) s.focus(); return; }
          if (!k) return;
          op[k] = e.target.type === 'checkbox' ? e.target.checked : (e.target.value === 'tab' ? '\t' : e.target.value);
          recalcular();
        });
        c.addEventListener('input', e => { if (e.target.dataset.op === 'faltantes') { op.faltantes = e.target.value; recalcular(); } });
        recalcular();
      },
    });
  }

  function pegar() {
    SP.ui.dialogo({
      titulo: T('Pegar una tabla'),
      cuerpo: `<p class="small">${T('Copia el rango en tu hoja de cálculo (con la fila de nombres) y pégalo aquí con Ctrl+V.')}</p>` +
        `<label class="field"><span class="sr-only">${T('Tabla pegada')}</span><textarea id="pegarTexto" rows="12" class="pegar-area" spellcheck="false" placeholder="bloque&#9;tratamiento&#9;rend"></textarea></label>`,
      botones: [
        { texto: T('Cancelar'), tipo: 'secundario' },
        { texto: T('Continuar'), tipo: 'primario', accion: d => {
          const t = d.el.querySelector('#pegarTexto').value;
          if (!t.trim()) throw new SP.ErrorSP(T('No hay nada pegado.'));
          setTimeout(() => importarTexto(t, T('Tabla pegada')), 0);
        } },
      ],
    });
  }

  function nueva() {
    SP.ui.dialogo({
      titulo: T('Hoja vacía'),
      cuerpo: `<label class="field"><span>${T('Nombres de las columnas, separados por comas')}</span><input id="nvNombres" value="bloque, tratamiento, rend"></label>` +
        `<label class="field"><span>${T('Número de filas')}</span><input id="nvFilas" type="number" min="1" max="100000" value="20"></label>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Crear'), tipo: 'primario', accion: d => {
        const nombres = SP.csv.nombresUnicos(d.el.querySelector('#nvNombres').value.split(',').map(s => s.trim()));
        const n = Math.max(1, Math.min(100000, +d.el.querySelector('#nvFilas').value || 20));
        const tipos = Object.fromEntries(nombres.map(x => [x, SP.tipos.NOMBRE_FACTOR.test(x) ? { tipo: 'factor', niveles: [] } : 'numerica']));
        ui().cargar(SP.hoja.crear({ nombres, columnas: Object.fromEntries(nombres.map(x => [x, new Array(n).fill(null)])), tipos }), T('Hoja nueva'));
      } }],
    });
  }

  /* ======================= variable calculada ======================= */
  const FUNCIONES = ['log()', 'sqrt()', 'exp()', 'abs()', 'round( , 2)', 'ifelse( , , )', 'mean()', 'sd()', 'is.na()', 'paste( , sep = "-")'];
  const nombreSeguro = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  function chips(lista, clase) { return lista.map(x => `<button type="button" class="chip-btn ${clase}" data-insertar="${esc(x)}">${esc(x)}</button>`).join(''); }
  function insertar(area, texto) {
    const a = area.selectionStart, b = area.selectionEnd;
    area.value = area.value.slice(0, a) + texto + area.value.slice(b);
    const pos = a + (texto.indexOf('(') >= 0 ? texto.indexOf('(') + 1 : texto.length);
    area.focus(); area.setSelectionRange(pos, pos);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function calcular() {
    const h = hoja();
    let resultado = null;
    SP.ui.dialogo({
      titulo: T('Variable calculada'), ancho: 'min(760px, 96vw)',
      cuerpo: `<label class="field"><span>${T('Nombre')}</span><input id="calNombre" value="nueva"></label>` +
        `<label class="field"><span>${T('Expresión')}</span><textarea id="calExpr" rows="3" class="mono" spellcheck="false" placeholder="rend / 1000"></textarea></label>` +
        `<div class="chips"><span class="small muted">${T('Columnas:')}</span>${chips(h.nombres.map(nombreSeguro), 'col')}</div>` +
        `<div class="chips"><span class="small muted">${T('Funciones:')}</span>${chips(FUNCIONES, 'fn')}</div>` +
        `<div class="cal-vista small" aria-live="polite"></div>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Crear la columna'), tipo: 'primario', accion: d => {
        if (!resultado) throw new SP.ErrorSP(T('Escribe una expresión válida.'));
        const expr = d.el.querySelector('#calExpr').value.trim();
        const r = resultado, n = h.n;
        let tipo, datos;
        if (r.k === 'n') { tipo = 'numerica'; datos = Float64Array.from({ length: n }, (_, i) => (r.es ? r.v : r.v[i])); }
        else if (r.k === 'l') { tipo = 'factor'; datos = SP.expresiones.comoArreglo(r, n).map(x => (x === null ? null : (x ? 'VERDADERO' : 'FALSO'))); }
        else { tipo = 'factor'; datos = SP.expresiones.comoArreglo(r, n); }
        const nom = h.agregarColumna({ nombre: d.el.querySelector('#calNombre').value.trim() || 'nueva', tipo, datos, origen: 'calculada', detalle: 'ƒ = ' + expr });
        ui().refrescar(true);
        L() && L().toast(T('Columna «{c}» creada.', { c: nom }), { type: 'success' });
      } }],
      alAbrir(d) {
        const area = d.el.querySelector('#calExpr'), vista = d.el.querySelector('.cal-vista');
        d.el.addEventListener('click', e => { const b = e.target.closest('[data-insertar]'); if (b) insertar(area, b.dataset.insertar); });
        area.addEventListener('input', () => {
          resultado = null;
          const t = area.value.trim();
          if (!t) { vista.textContent = ''; return; }
          try {
            const r = SP.expresiones.enHoja(h, t);
            const arr = SP.expresiones.comoArreglo(r, Math.min(h.n, 6));
            const falt = SP.expresiones.comoArreglo(r, h.n).filter(x => x === null).length;
            const tipo = r.k === 'n' ? T('columna numérica') : r.k === 'l' ? T('verdadero o falso (se guardará como factor)') : T('texto (se guardará como factor)');
            vista.className = 'cal-vista small msg msg-success';
            vista.textContent = T('Resultado: {t}. Primeros valores: {v}{f}', { t: tipo, v: arr.map(x => (x === null ? 'NA' : typeof x === 'number' ? SP.ui.num(x) : x)).join(' · '), f: falt ? ' · ' + T('{k} faltantes', { k: falt }) : '' });
            resultado = r;
          } catch (e) {
            vista.className = 'cal-vista small msg msg-error';
            vista.textContent = e.message + (e.arreglo ? ' ' + e.arreglo : '');
          }
        });
      },
    });
  }

  /* ======================= transformar ======================= */
  const TRANS = [
    ['log', 'ln(x)', 'Conteos y datos con varianza que crece con la media (proporcional).'],
    ['log10', 'log₁₀(x)', 'Igual que el logaritmo natural, en base 10.'],
    ['logc', 'ln(x + c)', 'Cuando hay ceros (conteos de insectos, malezas).'],
    ['raiz', '√x', 'Conteos (varianza proporcional a la media, distribución de Poisson).'],
    ['raiz05', '√(x + 0.5)', 'Conteos con ceros o valores pequeños.'],
    ['arcoseno', 'asin(√p)', 'Proporciones y porcentajes (germinación, incidencia).'],
    ['reciproco', '1/x', 'Tiempos (días a floración) cuando la varianza crece mucho.'],
    ['boxcox', 'Box-Cox', 'Estima la potencia que mejor estabiliza la varianza y normaliza los residuales.'],
    ['estandarizar', '(x − media)/DE', 'Pasar a unidades de desviación estándar.'],
  ];
  function transformar(jInicial) {
    const h = hoja();
    const numericas = h.cols.map((c, j) => [c, j]).filter(([c]) => c.tipo === 'numerica');
    if (!numericas.length) { L() && L().toast(T('No hay columnas numéricas que transformar.'), { type: 'warning' }); return; }
    /* factores del diseño que reconoce el diagnóstico (incluye dosis numéricas; no identificadores ni fechas) */
    let factores = [];
    try { const pa = SP.estructura.adivinarPapeles(SP.app.tablaAnalisis()); factores = [pa.bloque, pa.fila, pa.columna, ...pa.factores].filter(Boolean); } catch (e) { /* sin tabla analizable */ }
    let j = numericas.some(([, k]) => k === jInicial) ? jInicial : numericas[0][1];
    let tipo = 'log', bc = null;
    SP.ui.dialogo({
      titulo: T('Transformar una variable'), ancho: 'min(860px, 96vw)',
      cuerpo: `<label class="field"><span>${T('Variable')}</span><select id="trCol">${numericas.map(([c, k]) => `<option value="${k}"${k === j ? ' selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select></label>` +
        `<fieldset class="tr-lista"><legend>${T('Transformación')}</legend>` +
        TRANS.map(([k, f, d]) => `<label class="tr-op"><input type="radio" name="trTipo" value="${k}"${k === tipo ? ' checked' : ''}><span><b>${esc(f)}</b> <span class="small muted">${esc(T(d))}</span></span></label>`).join('') +
        `</fieldset><div class="tr-param"></div>` +
        `<label class="field"><span>${T('Nombre de la columna nueva')}</span><input id="trNombre"></label>` +
        `<div class="tr-vista small" aria-live="polite"></div>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Crear la columna'), tipo: 'primario', accion: d => {
        const p = parametros(d);
        const datos = SP.transformar.aplicar(tipo, h.cols[j].datos, p);
        const detalle = T('{t} de «{c}»', { t: TRANS.find(x => x[0] === tipo)[1], c: h.cols[j].nombre }) +
          (tipo === 'boxcox' ? ' · λ = ' + SP.ui.num(p.lambda) : tipo === 'logc' ? ' · c = ' + p.c : '');
        const nom = h.agregarColumna({ nombre: d.el.querySelector('#trNombre').value.trim() || nombreSugerido(), tipo: 'numerica', datos, posicion: j + 1, origen: 'transformada', detalle });
        ui().refrescar(true);
        L() && L().toast(T('Columna «{c}» creada; la original no cambió.', { c: nom }), { type: 'success' });
      } }],
      alAbrir(d) {
        const c = d.cuerpo;
        const pintarParam = () => {
          const zona = c.querySelector('.tr-param');
          if (tipo === 'logc') zona.innerHTML = `<label class="field"><span>c</span><input id="trC" type="number" step="any" value="1"></label>`;
          else if (tipo === 'arcoseno') zona.innerHTML = `<label class="imp-check"><input type="checkbox" id="trPct" ${Math.max(...SP.num.sinFaltantes(h.cols[j].datos)) > 1 ? 'checked' : ''}> ${T('Los datos están en porcentaje (0 a 100)')}</label><label class="imp-check"><input type="checkbox" id="trGrados"> ${T('Resultado en grados (si no, en radianes)')}</label>`;
          else if (tipo === 'boxcox') {
            zona.innerHTML = `<div class="bc-caja"><p class="small">${T('λ se estima con los residuales del modelo del experimento: marca los factores (y el bloque) que vas a usar en el análisis.')}</p>` +
              (factores.filter(f => f !== h.cols[j].nombre).length ? `<div class="chips">${factores.filter(f => f !== h.cols[j].nombre).map(f => `<label class="imp-check"><input type="checkbox" class="bcFactor" value="${esc(f)}" checked> ${esc(f)}</label>`).join('')}</div>` : '') +
              `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" id="bcEstimar">${T('Estimar λ')}</button>` +
              `<label class="field bc-lambda"><span>λ</span><input id="trLambda" type="number" step="any" value="1"></label></div>` +
              `<div class="bc-resultado small" aria-live="polite"></div><div class="bc-grafica"></div></div>`;
          } else zona.innerHTML = '';
          c.querySelector('#trNombre').value = nombreSugerido();
          vista();
        };
        const vista = () => {
          const v = c.querySelector('.tr-vista');
          try {
            const r = SP.transformar.aplicar(tipo, h.cols[j].datos.slice(0, 6), parametros(d));
            v.className = 'tr-vista small msg msg-success';
            v.textContent = T('Primeros valores: {v}', { v: Array.from(r).map(x => SP.ui.num(x)).join(' · ') });
          } catch (e) { v.className = 'tr-vista small msg msg-error'; v.textContent = e.message + (e.arreglo ? ' ' + e.arreglo : ''); }
        };
        c.addEventListener('change', e => {
          if (e.target.name === 'trTipo') { tipo = e.target.value; bc = null; pintarParam(); }
          else if (e.target.id === 'trCol') { j = +e.target.value; bc = null; pintarParam(); }
          else vista();
        });
        c.addEventListener('input', e => { if (['trC', 'trLambda'].includes(e.target.id)) { c.querySelector('#trNombre').value = nombreSugerido(); vista(); } });
        c.addEventListener('click', e => {
          if (e.target.id !== 'bcEstimar') return;
          const boton = e.target, salida = c.querySelector('.bc-resultado');
          const tarea = async () => {
            /* modelo del experimento: bloques (y fila, columna) aditivos; los tratamientos, cruzados */
            const usados = [...c.querySelectorAll('.bcFactor:checked')].map(x => x.value);
            const t = SP.app.tablaAnalisis();
            const pap = SP.estructura.adivinarPapeles(t);
            const q = nombreSeguro;
            const fijos = [pap.bloque, pap.fila, pap.columna];
            const aditivos = usados.filter(f => fijos.includes(f)).map(q);
            const cruzados = usados.filter(f => !fijos.includes(f)).map(q);
            const resp = h.cols[j].nombre;
            const formula = q(resp) + ' ~ ' + ([...aditivos, ...(cruzados.length ? [cruzados.join(' * ')] : [])].join(' + ') || '1');
            /* al hilo van solo las columnas del modelo, planas (los factores como etiquetas) */
            const columnas = {}, tipos = {};
            for (const nom of [resp, ...usados]) {
              const col = t.col(nom);
              if (col.tipo === 'numerica' && nom === resp) { columnas[nom] = col.valores; tipos[nom] = { tipo: 'numerica' }; }
              else if (col.tipo === 'numerica') {      // dosis numérica usada como factor del diseño
                const niveles = [...new Set(Array.from(col.valores).filter(v => !Number.isNaN(v)))].sort((x, y) => x - y).map(SP.tipos.numeroATexto);
                columnas[nom] = Array.from(col.valores, v => (Number.isNaN(v) ? null : SP.tipos.numeroATexto(v))); tipos[nom] = { tipo: 'factor', niveles };
              }
              else { columnas[nom] = Array.from(col.codigos, k => (k < 0 ? null : col.niveles[k])); tipos[nom] = { tipo: 'factor', niveles: col.niveles }; }
            }
            const r = await SP.hilo.correr('transformar.boxcoxPerfil', [columnas, tipos, resp, formula]);
            r.formula = formula;
            return r;
          };
          const correr = L() && L().busyButton ? L().busyButton(boton, tarea, { doneText: T('Estimada') }) : tarea();
          Promise.resolve(correr).then(r => {
            if (!r) return;
            bc = r;
            c.querySelector('#trLambda').value = String(Number(bc.sugerencia.lambda));
            const nombreSug = { ninguna: T('ninguna transformación'), raiz: T('raíz cuadrada'), log: T('logaritmo'), 'reciproco de la raiz': T('recíproco de la raíz'), reciproco: T('recíproco'), cuadrado: T('cuadrado') }[bc.sugerencia.transformacion];
            salida.innerHTML =
              `<p><b>λ̂ = ${SP.ui.num(bc.lambda)}</b> · ${T('IC 95 %')}: [${SP.ui.num(bc.ic[0])}, ${SP.ui.num(bc.ic[1])}] · n = ${bc.n} · ${T('modelo')}: <code>${esc(bc.formula)}</code></p>` +
              `<p>${bc.sugerencia.enIntervalo
                ? T('Sugerencia: {s} (λ = {l}), que cae dentro del intervalo y es más fácil de interpretar que λ̂.', { s: nombreSug, l: bc.sugerencia.lambda })
                : T('Ninguna potencia sencilla cae en el intervalo; se propone la más cercana, {s} (λ = {l}).', { s: nombreSug, l: bc.sugerencia.lambda })}</p>`;
            c.querySelector('.bc-grafica').innerHTML = graficaPerfil(bc);
            c.querySelector('#trNombre').value = nombreSugerido();
            vista();
          }).catch(err => { salida.innerHTML = `<p class="msg msg-error">${esc(err.message + (err.arreglo ? ' ' + err.arreglo : ''))}</p>`; });
        });
        pintarParam();
      },
    });
    function parametros(d) {
      const q = s => d.el.querySelector(s);
      if (tipo === 'logc') return { c: +(q('#trC') ? q('#trC').value : 1) };
      if (tipo === 'arcoseno') return { porcentaje: !!(q('#trPct') && q('#trPct').checked), grados: !!(q('#trGrados') && q('#trGrados').checked) };
      if (tipo === 'boxcox') return { lambda: +(q('#trLambda') ? q('#trLambda').value : 1) };
      return {};
    }
    function nombreSugerido() {
      const base = h.cols[j].nombre;
      const pre = { log: 'ln', log10: 'log10', logc: 'ln1', raiz: 'raiz', raiz05: 'raiz05', arcoseno: 'asen', reciproco: 'inv', boxcox: 'bc', estandarizar: 'z' }[tipo];
      return pre + '_' + base;
    }
  }

  /** Verosimilitud perfilada de Box-Cox con λ̂ y su intervalo (SVG que sigue al tema). */
  function graficaPerfil(bc) {
    /* el perfil ya viene calculado del hilo (SP.transformar.boxcoxPerfil), en una ventana centrada en λ̂ */
    const xs = bc.perfil.x, ys = bc.perfil.y, a = xs[0], b = xs[xs.length - 1];
    const ymax = bc.loglik, ymin = Math.min(...ys), holgura = 0.08 * (ymax - ymin || 1);
    const W = 520, H = 200, m = { l: 14, r: 12, t: 22, b: 34 };
    const X = x => m.l + (x - a) / (b - a) * (W - m.l - m.r), Y = y => m.t + (ymax + holgura - y) / (ymax + holgura - ymin) * (H - m.t - m.b);
    const corte = ymax - SP.dist.qchisq(0.95, 1) / 2;
    const ruta = xs.map((x, k) => (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(ys[k]).toFixed(1)).join('');
    const marcas = [-3, -2, -1, 0, 1, 2, 3].filter(v => v >= a - 1e-9 && v <= b + 1e-9);
    return `<svg viewBox="0 0 ${W} ${H}" class="bc-svg" role="img" aria-label="${esc(T('Verosimilitud de Box-Cox: máximo en λ = {l}', { l: SP.ui.num(bc.lambda) }))}">` +
      `<line x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}" class="eje"/>` +
      marcas.map(v => `<text x="${X(v)}" y="${H - m.b + 16}" text-anchor="middle" class="etq">${v}</text>`).join('') +
      `<text x="${(m.l + W - m.r) / 2}" y="${H - 4}" text-anchor="middle" class="etq">λ</text>` +
      `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(corte)}" y2="${Y(corte)}" class="corte"/>` +
      `<path d="${ruta}" class="curva"/>` +
      `<line x1="${X(bc.lambda)}" x2="${X(bc.lambda)}" y1="${m.t}" y2="${H - m.b}" class="max"/>` +
      bc.ic.filter(Number.isFinite).map(v => `<line x1="${X(v)}" x2="${X(v)}" y1="${Y(corte)}" y2="${H - m.b}" class="ic"/>`).join('') +
      `<text x="${X(bc.lambda)}" y="${m.t - 8}" text-anchor="middle" class="etq">λ̂ = ${SP.ui.num(bc.lambda)}</text>` +
      `<text x="${W - m.r - 4}" y="${Y(corte) - 4}" text-anchor="end" class="etq">${T('IC 95 %')}</text></svg>`;
  }

  /* ======================= filtrar ======================= */
  function filtrar() {
    const h = hoja(), est = ui().estado();
    let filas = null;
    SP.ui.dialogo({
      titulo: T('Filtrar filas'), ancho: 'min(720px, 96vw)',
      cuerpo: `<p class="small">${T('Las filas que no cumplan la condición no se borran: solo quedan fuera de los análisis mientras el filtro esté activo.')}</p>` +
        `<label class="field"><span>${T('Condición')}</span><textarea id="fiExpr" rows="2" class="mono" spellcheck="false" placeholder='bloque != "4" &amp; rend > 0'>${esc(est.filtro ? est.filtro.expresion : '')}</textarea></label>` +
        `<div class="chips"><span class="small muted">${T('Columnas:')}</span>${chips(h.nombres.map(nombreSeguro), 'col')}</div>` +
        `<div class="chips"><span class="small muted">${T('Operadores:')}</span>${chips(['==', '!=', '>', '>=', '<', '<=', '&', '|', '!is.na()', '%in% c( , )'], 'fn')}</div>` +
        `<div class="fi-vista small" aria-live="polite"></div>`,
      botones: [
        { texto: T('Cancelar'), tipo: 'secundario' },
        ...(est.filtro ? [{ texto: T('Quitar el filtro'), tipo: 'secundario', accion: () => { est.filtro = null; ui().refrescar(); } }] : []),
        { texto: T('Aplicar'), tipo: 'primario', accion: d => {
          if (!filas) throw new SP.ErrorSP(T('Escribe una condición válida.'));
          if (!filas.length) throw new SP.ErrorSP(T('Ninguna fila cumple la condición.'), T('Revisa la condición; un filtro que deja la tabla vacía no se aplica.'));
          est.filtro = { expresion: d.el.querySelector('#fiExpr').value.trim(), filas };
          ui().refrescar();
        } },
      ],
      alAbrir(d) {
        const area = d.el.querySelector('#fiExpr'), vista = d.el.querySelector('.fi-vista');
        d.el.addEventListener('click', e => { const b = e.target.closest('[data-insertar]'); if (b) insertar(area, b.dataset.insertar); });
        const evaluar = () => {
          filas = null;
          const t = area.value.trim();
          if (!t) { vista.textContent = ''; return; }
          try {
            filas = SP.expresiones.filtrar(h, t);
            vista.className = 'fi-vista small msg ' + (filas.length ? 'msg-success' : 'msg-warning');
            vista.textContent = T('Pasan {k} de {n} filas.', { k: filas.length.toLocaleString('es-MX'), n: h.n.toLocaleString('es-MX') });
          } catch (e) { vista.className = 'fi-vista small msg msg-error'; vista.textContent = e.message + (e.arreglo ? ' ' + e.arreglo : ''); }
        };
        area.addEventListener('input', evaluar);
        evaluar();
      },
    });
  }

  /* ======================= ancha ⇄ larga ======================= */
  function reformar() {
    const h = hoja();
    const crudos = () => { const c = {}; h.cols.forEach((col, j) => { c[col.nombre] = Array.from({ length: h.n }, (_, i) => (col.tipo === 'fecha' ? (h.valor(i, j) === null ? null : SP.tipos.textoFecha(h.valor(i, j))) : h.valor(i, j))); }); return { nombres: h.nombres, columnas: c }; };
    const casillas = (clase, marcadas) => h.nombres.map(n => `<label class="imp-check"><input type="checkbox" class="${clase}" value="${esc(n)}"${marcadas(n) ? ' checked' : ''}> ${esc(n)}</label>`).join('');
    const numericas = new Set(h.cols.filter(c => c.tipo === 'numerica').map(c => c.nombre));
    SP.ui.dialogo({
      titulo: T('Cambiar la forma de la tabla'), ancho: 'min(820px, 96vw)',
      cuerpo: `<div class="seg" role="group" aria-label="${esc(T('Dirección'))}"><button type="button" data-dir="larga" aria-pressed="true">${T('Ancha → larga')}</button><button type="button" data-dir="ancha" aria-pressed="false">${T('Larga → ancha')}</button></div>` +
        `<div data-panel="larga"><p class="small">${T('Una fila por unidad y una columna por medición (rend_2024, rend_2025) → una fila por observación. Es la forma que piden los análisis.')}</p>` +
        `<fieldset><legend>${T('Columnas que identifican cada unidad')}</legend><div class="chips">${casillas('reId', n => !numericas.has(n))}</div></fieldset>` +
        `<fieldset><legend>${T('Columnas que se apilan')}</legend><div class="chips">${casillas('reMed', n => numericas.has(n))}</div></fieldset>` +
        `<div class="btn-row"><label class="field"><span>${T('Nombre de la columna nueva con los nombres')}</span><input id="reClave" value="variable"></label><label class="field"><span>${T('Nombre de la columna de valores')}</span><input id="reValor" value="valor"></label></div>` +
        `<label class="imp-check" id="reNumeroCaja" hidden><input type="checkbox" id="reNumero" checked> <span id="reNumeroTexto"></span></label></div>` +
        `<div data-panel="ancha" hidden><p class="small">${T('Una fila por observación → una columna por cada valor de la columna elegida.')}</p>` +
        `<fieldset><legend>${T('Columnas que identifican cada unidad')}</legend><div class="chips">${casillas('reIdA', () => false)}</div></fieldset>` +
        `<div class="btn-row"><label class="field"><span>${T('Columna con los nombres de las columnas nuevas')}</span><select id="reClaveA">${h.nombres.map(n => `<option>${esc(n)}</option>`).join('')}</select></label>` +
        `<label class="field"><span>${T('Columna con los valores')}</span><select id="reValorA">${h.nombres.map(n => `<option${numericas.has(n) ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></label></div></div>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Cambiar la forma'), tipo: 'primario', accion: d => {
        const q = s => [...d.el.querySelectorAll(s)].map(x => x.value);
        const dir = d.el.querySelector('[data-dir][aria-pressed="true"]').dataset.dir;
        let r;
        /* las columnas de identificación conservan su tipo y sus niveles; lo nuevo se infiere. Un identificador (una
           planta por fila) se repite en la tabla larga: pasa a factor, en el orden en que aparece (el sujeto de las
           medidas repetidas) */
        const tipos = {};
        const conservar = ids => ids.forEach(n => {
          const c = h.cols[h.indice(n)];
          tipos[n] = c.tipo === 'factor' ? { tipo: 'factor', niveles: c.niveles } : c.tipo === 'id' && dir === 'larga' ? { tipo: 'factor', niveles: SP.tipos.ordenarNiveles(c.datos.filter(v => v !== null && v !== ''), 'aparicion').map(String) } : c.tipo;
        });
        if (dir === 'larga') {
          const ids = q('.reId:checked'), medidas = q('.reMed:checked');
          const clave = d.el.querySelector('#reClave').value.trim() || 'variable';
          const comoNumero = !d.el.querySelector('#reNumeroCaja').hidden && d.el.querySelector('#reNumero').checked;
          r = SP.reformar.aLarga(crudos(), { ids, medidas, nombreClave: clave, nombreValor: d.el.querySelector('#reValor').value.trim() || 'valor', comoNumero });
          conservar(ids);
          tipos[clave] = comoNumero ? 'numerica' : { tipo: 'factor', niveles: medidas };      // en el orden de las columnas, no alfabético
        } else {
          const ids = q('.reIdA:checked');
          r = SP.reformar.aAncha(crudos(), { ids, clave: d.el.querySelector('#reClaveA').value, valor: d.el.querySelector('#reValorA').value });
          conservar(ids);
        }
        ui().cargar(SP.hoja.crear({ nombres: r.nombres, columnas: r.columnas, tipos }), T('Tabla en forma {f}', { f: dir }), true);
        L() && L().toast(T('Tabla nueva de {n} filas; «Volver a la tabla anterior» la regresa.', { n: r.columnas[r.nombres[0]].length }), { type: 'success' });
      } }],
      alAbrir(d) {
        /* si cada columna apilada trae un solo número en su nombre (altura_15dds, rend_2024), se ofrece quedarse con él */
        const numeros = () => {
          const medidas = [...d.el.querySelectorAll('.reMed:checked')].map(x => x.value), xs = SP.reformar.numerosDe(medidas);
          d.el.querySelector('#reNumeroCaja').hidden = !xs;
          if (xs) d.el.querySelector('#reNumeroTexto').textContent = T('Quedarse con el número de cada nombre ({a} → {b}): la columna nueva sale numérica, lista para una curva en el tiempo o una dosis.', { a: medidas[0], b: SP.tipos.numeroATexto(xs[0]) });
        };
        d.el.addEventListener('change', e => { if (e.target.classList.contains('reMed')) numeros(); });
        numeros();
        d.el.addEventListener('click', e => {
          const b = e.target.closest('[data-dir]');
          if (!b) return;
          d.el.querySelectorAll('[data-dir]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          d.el.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.dir; });
        });
      },
    });
  }

  /* ======================= renombrar y niveles ======================= */
  function renombrar(j) {
    const h = hoja();
    SP.ui.dialogo({
      titulo: T('Renombrar la columna'),
      cuerpo: `<label class="field"><span>${T('Nombre nuevo')}</span><input id="rnNombre" value="${esc(h.cols[j].nombre)}"></label>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Renombrar'), tipo: 'primario', accion: d => { h.renombrar(j, d.el.querySelector('#rnNombre').value); ui().refrescar(true); } }],
    });
  }
  function niveles(j) {
    const h = hoja(), c = h.cols[j];
    let orden = c.niveles.slice();
    const pintarLista = d => {
      d.el.querySelector('.nv-lista').innerHTML = orden.map((n, k) =>
        `<li><span>${k + 1}. ${esc(n)}</span><span class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-sube="${k}" ${k ? '' : 'disabled'} aria-label="${esc(T('Subir {n}', { n }))}">↑</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-baja="${k}" ${k < orden.length - 1 ? '' : 'disabled'} aria-label="${esc(T('Bajar {n}', { n }))}">↓</button></span></li>`).join('');
    };
    SP.ui.dialogo({
      titulo: T('Orden de los niveles de «{c}»', { c: c.nombre }),
      cuerpo: `<p class="small">${T('El orden decide el de las medias en los cuadros y figuras, y cuál es el nivel de referencia (el primero).')}</p>` +
        `<div class="btn-row"><button type="button" class="btn btn-secondary btn-sm" data-ordenar="numerico">${T('Numérico')}</button><button type="button" class="btn btn-secondary btn-sm" data-ordenar="alfabetico">${T('Alfabético')}</button><button type="button" class="btn btn-secondary btn-sm" data-ordenar="aparicion">${T('Como aparecen')}</button></div>` +
        `<ol class="nv-lista"></ol>`,
      botones: [{ texto: T('Cancelar'), tipo: 'secundario' }, { texto: T('Aplicar'), tipo: 'primario', accion: () => { h.ordenarNiveles(j, orden); ui().refrescar(true); } }],
      alAbrir(d) {
        pintarLista(d);
        d.el.addEventListener('click', e => {
          const s = e.target.closest('[data-sube]'), b = e.target.closest('[data-baja]'), o = e.target.closest('[data-ordenar]');
          if (s) { const k = +s.dataset.sube; [orden[k - 1], orden[k]] = [orden[k], orden[k - 1]]; pintarLista(d); d.el.querySelector(`[data-sube="${k - 1}"]`)?.focus(); }
          if (b) { const k = +b.dataset.baja; [orden[k + 1], orden[k]] = [orden[k], orden[k + 1]]; pintarLista(d); d.el.querySelector(`[data-baja="${k + 1}"]`)?.focus(); }
          if (o) {
            const m = o.dataset.ordenar;
            if (m === 'aparicion') orden = SP.tipos.ordenarNiveles(c.datos, 'aparicion');
            else if (m === 'alfabetico') orden = orden.slice().sort((x, y) => x.localeCompare(y, 'es', { numeric: true }));
            else orden = orden.slice().sort((x, y) => (Number(x) - Number(y)) || x.localeCompare(y, 'es', { numeric: true }));
            pintarLista(d);
          }
        });
      },
    });
  }

  SP.datosDialogos = { importarArchivo, importarTexto, pegar, nueva, calcular, transformar, filtrar, reformar, renombrar, niveles, graficaPerfil };
})();

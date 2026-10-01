/* SigmaPro — bloque 4: Análisis (catálogo y, por ahora, la revisión de los supuestos).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   El catálogo lista las familias de SP.familias de la Fase 1. Un análisis aparece activo solo si su método
   está registrado y su validación contra R aprobó (SP.metodoDisponible); los demás muestran el hito en que
   llegan. La revisión de los supuestos arma el modelo del experimento con los papeles que elige la persona. */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const $ = s => document.querySelector(s);
  const L = () => window.LABG;
  const HITO = { 'pruebas-t': '1.5', 'no-parametricas': '1.5', disenos: '1.6', comparaciones: '1.7', regresion: '1.8', correlacion: '1.9', contingencia: '1.9' };
  const estado = SP.app.analisis = { metodo: 'supuestos', pendiente: true, turno: 0, sup: { respuesta: '', tratamientos: [], bloque: '', orden: '', alfa: 0.05, _iniciado: false } };

  /* ---------------- catálogo ---------------- */
  function catalogo() {
    const fams = SP.familias.filter(f => f.fase === 1 && f.id !== 'descriptiva');
    $('#anaCatalogo').innerHTML = fams.map(f => {
      const metodos = SP.listaMetodos(f.id).filter(m => SP.metodoDisponible(m.id));
      const items = metodos.length
        ? metodos.map(m => `<li><button type="button" class="ana-item${m.id === estado.metodo ? ' activo' : ''}" data-metodo="${esc(m.id)}" aria-pressed="${m.id === estado.metodo}" title="${esc(m.resumen)}"><b>${esc(m.nombre)}</b></button></li>`).join('')
        : `<li><span class="ana-item pronto"><b>${esc(T('Pronto'))}</b><span class="pill gris">${esc(T('Hito {h}', { h: HITO[f.id] || '' }))}</span></span></li>`;
      return `<li class="ana-familia"><p class="ana-fam-titulo">${esc(T(f.nombre))}</p><ul>${items}</ul></li>`;
    }).join('');
  }

  /* ---------------- formulario ---------------- */
  function columnas() {
    let t;
    try { t = SP.app.tablaAnalisis(); } catch (e) { return null; }
    if (!t || !t.n) return null;
    const numericas = t.nombres.filter(n => t.col(n).tipo === 'numerica' && !t.col(n).fecha);
    const fechas = t.nombres.filter(n => t.col(n).fecha);
    const factores = t.nombres.filter(n => t.col(n).tipo === 'factor');
    const numFactor = numericas.filter(n => SP.estructura.pareceFactorNumerico(t.col(n), t.n));
    return { t, pap: SP.estructura.adivinarPapeles(t), numericas, fechas, factores, numFactor, agrupables: factores.concat(numFactor) };
  }
  function sanear(c) {
    const s = estado.sup;
    if (!c.numericas.includes(s.respuesta)) s.respuesta = c.pap.respuestas[0] || c.numericas[0] || '';
    s.tratamientos = s.tratamientos.filter(x => c.agrupables.includes(x) && x !== s.respuesta).slice(0, 3);
    if (s.bloque && !c.agrupables.includes(s.bloque)) s.bloque = '';
    if (s.orden && !c.numericas.concat(c.fechas).includes(s.orden)) s.orden = '';
    if (!s._iniciado) {
      s._iniciado = true;
      s.bloque = c.pap.bloque || '';
      s.tratamientos = c.pap.factores.filter(x => x !== s.bloque && x !== s.respuesta).slice(0, 3);
    }
    s.tratamientos = s.tratamientos.filter(x => x !== s.bloque);
  }
  const opcion = (v, t, sel) => `<option value="${esc(v)}"${String(v) === String(sel) ? ' selected' : ''}>${esc(t)}</option>`;
  function formulario(c) {
    const s = estado.sup, marca = n => (c.numFactor.includes(n) ? T('{c} (numérica)', { c: n }) : n);
    return `<label class="field"><span>${esc(T('Variable de respuesta'))}</span><select data-campo="respuesta">${c.numericas.map(n => opcion(n, n, s.respuesta)).join('')}</select></label>` +
      `<fieldset class="exp-casillas"><legend>${esc(T('Tratamientos (hasta 3, cruzados)'))}</legend>` +
      (c.agrupables.filter(n => n !== s.respuesta && n !== s.bloque).map(n => `<label class="imp-check"><input type="checkbox" data-lista="tratamientos" value="${esc(n)}"${s.tratamientos.includes(n) ? ' checked' : ''}> ${esc(marca(n))}</label>`).join('') ||
        `<p class="small muted">${esc(T('No hay factores en la tabla.'))}</p>`) + '</fieldset>' +
      `<label class="field"><span>${esc(T('Bloques'))}</span><select data-campo="bloque">${opcion('', T('— sin bloques —'), s.bloque)}${c.agrupables.filter(n => n !== s.respuesta && !s.tratamientos.includes(n)).map(n => opcion(n, marca(n), s.bloque)).join('')}</select></label>` +
      `<label class="field"><span>${esc(T('Orden para la independencia'))}</span><select data-campo="orden">${opcion('', T('— el de las filas —'), s.orden)}${c.numericas.concat(c.fechas).filter(n => n !== s.respuesta).map(n => opcion(n, n, s.orden)).join('')}</select>` +
      `<span class="field-help">${esc(T('Si las filas siguen la posición en el campo o la fecha de medición, Durbin-Watson detecta parcelas vecinas parecidas.'))}</span></label>` +
      `<label class="field"><span>${esc(T('Nivel de significancia'))}</span><select data-campo="alfa">${[[0.05, '0.05'], [0.01, '0.01'], [0.1, '0.10']].map(([v, t]) => opcion(v, t, s.alfa)).join('')}</select></label>`;
  }

  /* ---------------- resultado ---------------- */
  const ETIQUETA = { verde: 'Bien', ambar: 'Revisar', rojo: 'Problema', gris: 'No aplica' };
  function graficas(r) {
    const g = r.graficas, qq = g.qq;
    /* banda en las posiciones de cada punto (interpolada entre las posiciones donde se calculó) */
    const bt = qq.banda.teorico, interp = (arr, x) => { let k = 1; while (k < bt.length - 1 && bt[k] < x) k++; const t0 = bt[k - 1], t1 = bt[k]; const w = t1 > t0 ? (x - t0) / (t1 - t0) : 0; return arr[k - 1] + w * (arr[k] - arr[k - 1]); };
    const fuera = qq.teorico.map((x, i) => qq.observado[i] < interp(qq.banda.inf, x) || qq.observado[i] > interp(qq.banda.sup, x));
    const etiquetas = new Set(fuera.map((f, i) => (f ? i : -1)).filter(i => i >= 0).sort((a, b) => Math.abs(qq.observado[b]) - Math.abs(qq.observado[a])).slice(0, 4));
    const pqq = qq.teorico.map((x, i) => ({ x, y: qq.observado[i], marca: fuera[i], etiqueta: etiquetas.has(i) ? qq.fila[i] : undefined }));
    const graficaQQ = SP.graficas.dispersion({
      titulo: T('Q-Q normal de los residuos estandarizados'), x: { titulo: T('Cuantil teórico de la normal') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Gráfico Q-Q: {k} de {n} residuos quedan fuera de la banda de confianza.', { k: fuera.filter(Boolean).length, n: qq.teorico.length }),
      puntos: SP.graficas.adelgazar(pqq, 2500), banda: { x: bt, inf: qq.banda.inf, sup: qq.banda.sup }, diagonal: true,
    });
    const pr = g.ajustados.map((x, i) => ({ x, y: g.residuos[i], marca: Math.abs(g.residuos[i]) > 2, etiqueta: Math.abs(g.residuos[i]) > 3 ? g.filas[i] : undefined }));
    const graficaRA = SP.graficas.dispersion({
      titulo: T('Residuos contra valores ajustados'), x: { titulo: T('Valor ajustado') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Residuos contra ajustados: {k} residuos pasan de ±2.', { k: pr.filter(p => p.marca).length }),
      puntos: SP.graficas.adelgazar(pr.filter(p => Number.isFinite(p.y)), 2500), referencias: [{ y: 0 }, { y: 2, discontinua: true }, { y: -2, discontinua: true }],
    });
    const orden = g.residuos.map((y, i) => ({ x: i + 1, y })).filter(p => Number.isFinite(p.y));
    const pocos = orden.length <= 400;
    const graficaOrden = SP.graficas.dispersion({
      titulo: r.independencia.orden ? T('Residuos en el orden de «{c}»', { c: r.independencia.orden }) : T('Residuos en el orden de las filas'),
      x: { titulo: T('Posición') }, y: { titulo: T('Residuo estandarizado') },
      descripcion: T('Residuos en orden; Durbin-Watson = {d}.', { d: r.independencia.durbin_watson.DW.toFixed(3) }),
      puntos: pocos ? orden : [], linea: { x: SP.graficas.adelgazar(orden, 3000).map(p => p.x), y: SP.graficas.adelgazar(orden, 3000).map(p => p.y) }, referencias: [{ y: 0 }],
    });
    return `<div class="ana-graficas">${graficaQQ}${graficaRA}${graficaOrden}</div>`;
  }
  function pintar(r, rep, codigo, ms) {
    const rec = rep.recomendaciones;
    $('#anaResultado').innerHTML =
      `<div class="exp-cabeza"><h3>${esc(rep.titulo)}</h3><span class="small muted">${esc(T('modelo {m} · n = {n} · calculado en {ms} ms', { m: r.formula, n: r.n, ms: Math.max(1, Math.round(ms)) }))}</span></div>` +
      `<div class="semaforo s-${r.global}" role="group" aria-label="${esc(T('Semáforo de los supuestos'))}">` +
      `<p class="semaforo-global"><span class="luz" aria-hidden="true"></span><b>${esc(T({ verde: 'Los supuestos se cumplen', ambar: 'Hay supuestos que revisar', rojo: 'Hay supuestos que no se cumplen', gris: 'Sin datos suficientes' }[r.global]))}</b></p>` +
      `<ul>${rep.semaforo.map(s => `<li class="s-${s.color}"><span class="luz" aria-hidden="true"></span><span class="nombre">${esc(s.nombre)}</span><span class="estado">${esc(T(ETIQUETA[s.color]))}</span><span class="texto">${esc(s.texto)}</span></li>`).join('')}</ul></div>` +
      (rec.length ? `<div class="callout exp-conclusion"><p><b>${esc(T('Qué hacer'))}</b></p><ul class="ana-rec">${rec.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : '') +
      (r.excluidas ? `<p class="small muted">${esc(T('{k} filas con algún valor faltante en el modelo no entran.', { k: r.excluidas }))}</p>` : '') +
      graficas(r) +
      SP.cuadros.html(rep.cuadros[0], { numero: 1 }) +
      `<div class="btn-row exp-acciones"><button type="button" class="btn btn-secondary btn-sm" data-accion="copiar">${esc(T('Copiar cuadro'))}</button></div>` +
      (rep.cuadros[1] ? `<details class="exp-extras"><summary>${esc(T('Varianza de los residuos por tratamiento'))}</summary>${SP.cuadros.html(rep.cuadros[1], { numero: 2 })}</details>` : '') +
      `<details class="exp-codigo"><summary>${esc(T('Código R equivalente'))}</summary><pre><code>${esc(codigo)}</code></pre>` +
      `<button type="button" class="btn btn-ghost btn-sm" data-accion="copiar-r">${esc(T('Copiar el código'))}</button></details>`;
    $('#anaResultado').dataset.codigo = codigo;
    estado.ultimo = rep;
  }

  function calcular() {
    estado.pendiente = false;
    const c = columnas();
    $('#anaVacio').hidden = !!c;
    $('#anaTrabajo').hidden = !c;
    if (!c) return;
    catalogo();
    /* con otra tabla, los papeles vuelven a proponerse; con ediciones de la misma, se respetan */
    if (SP.app.datos.hoja !== estado.hoja) { estado.hoja = SP.app.datos.hoja; estado.sup._iniciado = false; }
    sanear(c);
    const form = $('#anaOpciones');
    const foco = document.activeElement && form.contains(document.activeElement) ? document.activeElement : null;
    const clave = foco ? (foco.dataset.campo || foco.dataset.lista + ':' + foco.value) : null;
    form.innerHTML = formulario(c);
    if (clave) { const el = form.querySelector(`[data-campo="${clave}"]`) || form.querySelector(`[data-lista="${clave.split(':')[0]}"][value="${CSS.escape(clave.split(':').slice(1).join(':'))}"]`); if (el) el.focus(); }
    if (!SP.metodoDisponible('supuestos')) { $('#anaResultado').innerHTML = `<div class="msg msg-warning">${esc(T('La revisión de los supuestos todavía no tiene su validación contra R aprobada.'))}</div>`; return; }
    const s = estado.sup;
    const e = { respuesta: s.respuesta, tratamientos: s.tratamientos, bloque: s.bloque || undefined, orden: s.orden || undefined };
    const op = { alfa: +s.alfa };
    const ficha = SP.metodos.supuestos, turno = ++estado.turno;
    const mostrar = (resultado, ms) => { if (turno === estado.turno) pintar(resultado, ficha.reporte(resultado), ficha.codigoR(e, op, { factoresNumericos: c.numFactor }), ms); };
    const fallar = err => {
      if (turno !== estado.turno) return;
      if (!(err instanceof SP.ErrorSP) && err.arreglo === undefined) console.error(err);
      $('#anaResultado').classList.remove('calculando');
      $('#anaResultado').innerHTML = `<div class="msg msg-error"><strong>${esc(err.message)}</strong>${err.arreglo ? `<span class="msg-fix">${esc(err.arreglo)}</span>` : ''}</div>`;
    };
    const correr = () => {
      try {
        const { resultado, ms } = SP.ejecutar('supuestos', c.t, e, op);
        $('#anaResultado').classList.remove('calculando');
        mostrar(resultado, ms);
      } catch (err) { fallar(err); }
    };
    /* con tablas grandes (hasta ~2 s con 100 000 filas y muchos tratamientos), primero se avisa y se deja pintar.
       Un hilo de trabajo resultó más lento: arranca sin el código optimizado y con menos prioridad (Hito 1.12). */
    if (c.t.n >= 20000) {
      const r0 = $('#anaResultado');
      r0.classList.add('calculando');
      if (!r0.querySelector('.ana-espera')) r0.insertAdjacentHTML('afterbegin', `<p class="ana-espera small" role="status">${esc(T('Calculando con {n} filas…', { n: c.t.n.toLocaleString('es-MX') }))}</p>`);
      setTimeout(() => { if (turno === estado.turno) correr(); }, 30);
    } else correr();
  }
  let reloj = null;
  const recalcular = () => { clearTimeout(reloj); reloj = setTimeout(calcular, 150); };
  estado.calcular = calcular;

  function iniciar() {
    const panel = $('#panel-4');
    const form = $('#anaOpciones');
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('change', e => {
      const el = e.target, s = estado.sup;
      if (el.dataset.lista === 'tratamientos') {
        const marcados = [...form.querySelectorAll('[data-lista="tratamientos"]:checked')].map(x => x.value);
        if (marcados.length > 3) { el.checked = false; L() && L().toast(T('Hasta tres factores de tratamiento.'), { type: 'warning' }); return; }
        s.tratamientos = marcados;
      } else if (el.dataset.campo) s[el.dataset.campo] = el.value;
      calcular();
    });
    $('#anaResultado').addEventListener('click', async e => {
      const a = e.target.closest('[data-accion]');
      if (!a) return;
      const texto = a.dataset.accion === 'copiar' ? (estado.ultimo && SP.cuadros.tsv(estado.ultimo.cuadros[0])) : $('#anaResultado').dataset.codigo;
      if (texto && await SP.cuadros.copiar(texto)) L() && L().toast(a.dataset.accion === 'copiar' ? T('Cuadro copiado.') : T('Código R copiado.'), { type: 'success' });
    });
    $('#anaCatalogo').addEventListener('click', e => { const b = e.target.closest('[data-metodo]'); if (b) { estado.metodo = b.dataset.metodo; calcular(); } });
    document.addEventListener('sp:datos', () => { if (panel.classList.contains('active')) recalcular(); else estado.pendiente = true; });
    document.addEventListener('sp:bloque', e => { if (e.detail.bloque === 4 && estado.pendiente) calcular(); });
    if (panel.classList.contains('active')) calcular();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();

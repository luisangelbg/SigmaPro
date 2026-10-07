/* SigmaPro — guardado automático del trabajo en este navegador.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Mientras se trabaja, los datos (con sus tipos, columnas derivadas y filtro), los análisis del reporte y los ajustes de
   las figuras se guardan en el almacenamiento del navegador (IndexedDB): dos segundos después del último cambio y al
   ocultar o cerrar la pestaña. Nada sale del equipo. Al abrir SigmaPro, si quedó un trabajo, Inicio y Datos ofrecen
   recuperarlo o descartarlo. En Exportar se desactiva (y entonces se borra lo guardado) o se borra a mano.

   Dos registros: «actual» (lo último que se guardó) y «anterior» (lo que se encontró al abrir, mientras se decide qué
   hacer con él; así, trabajar en otra cosa no lo pierde). Si el navegador no deja guardar (ventana privada, almacenamiento
   bloqueado), la app sigue igual y Exportar lo dice.

     SP.app.autoguardado = { guardar(), revisar(), recuperar(), descartar(), borrar(), poner(si), activo(), estado }
     guardar() → promesa con { fecha, resumen } de lo último guardado (las pruebas la usan para no esperar) */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;
  const L = () => window.LABG;
  const BD = 'sigmapro', ALMACEN = 'trabajo', PREF = 'sigmapro.autoguardado', ESPERA = 2000;
  const est = { disponible: typeof indexedDB !== 'undefined', ultimo: null, encontrado: null, sucio: false, tuvoTrabajo: false, error: '' };
  let reloj = null, bd = null, revisado = Promise.resolve();

  /* ---------------- almacenamiento ---------------- */
  function abrirBD() {
    if (!bd) {
      bd = new Promise((ok, mal) => {
        let pet;
        try { pet = indexedDB.open(BD, 1); } catch (e) { mal(e); return; }
        pet.onupgradeneeded = () => pet.result.createObjectStore(ALMACEN);
        pet.onsuccess = () => ok(pet.result);
        pet.onerror = () => mal(pet.error || new Error('IndexedDB'));
        pet.onblocked = () => mal(new Error(T('el almacenamiento está ocupado por otra pestaña')));
      });
      bd.catch(() => { est.disponible = false; pintarEstado(); });
    }
    return bd;
  }
  async function operar(modo, fn) {
    const db = await abrirBD();
    return new Promise((ok, mal) => {
      const tx = db.transaction(ALMACEN, modo), pet = fn(tx.objectStore(ALMACEN));
      tx.oncomplete = () => ok(pet ? pet.result : undefined);
      tx.onerror = () => mal(tx.error || new Error('IndexedDB'));
      tx.onabort = () => mal(tx.error || new Error('IndexedDB'));
    });
  }
  const leer = k => operar('readonly', a => a.get(k));
  const escribir = (k, v) => operar('readwrite', a => a.put(v, k));
  const quitar = k => operar('readwrite', a => a.delete(k));

  const activo = () => { try { return localStorage.getItem(PREF) !== 'no'; } catch (e) { return true; } };
  const hayTrabajo = () => { const d = SP.app.datos; return !!(d && d.hoja && d.hoja.p) || SP.app.reporte.items.length > 0; };
  const fechaDe = iso => new Date(iso).toLocaleString(SP.LOCAL, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const horaDe = d => d.toLocaleTimeString(SP.LOCAL, { hour: '2-digit', minute: '2-digit' });
  function describir(r) {
    const partes = [];
    if (r.origen) partes.push(SP.comillas(r.origen));
    if (r.filas) partes.push(T('{n} filas y {p} columnas', { n: r.filas, p: r.columnas }));
    partes.push(r.analisis === 1 ? T('1 análisis en el reporte') : T('{k} análisis en el reporte', { k: r.analisis || 0 }));
    return partes.join(', ');
  }

  /* ---------------- guardar ---------------- */
  function programar() {
    if (!activo() || !est.disponible) return;
    est.sucio = true;
    clearTimeout(reloj);
    reloj = setTimeout(guardar, ESPERA);
  }
  async function guardar() {
    clearTimeout(reloj); reloj = null;
    await revisado;
    if (!activo() || !est.disponible || !est.sucio) return est.ultimo;
    est.sucio = false;
    try {
      if (hayTrabajo()) {
        const d = SP.app.datos, R = SP.app.reporte;
        const s = SP.proyecto.instantanea({ hoja: d.hoja, filtro: d.filtro, origen: d.origen, reporte: { titulo: R.titulo, autor: R.autor, items: R.items }, estilos: SP.app.exportar.estilos() });
        await escribir('actual', s);
        est.tuvoTrabajo = true; est.error = '';
        est.ultimo = { fecha: new Date(s.creado), resumen: s.resumen };
      } else if (est.tuvoTrabajo) {
        /* se quitó todo lo de esta sesión: ya no hay nada que recuperar */
        await quitar('actual');
        est.tuvoTrabajo = false; est.ultimo = null;
      }
    } catch (e) {
      est.error = e && e.name === 'QuotaExceededError' ? T('no queda espacio en el almacenamiento del navegador') : (e && e.message) || String(e);
    }
    pintarEstado();
    return est.ultimo;
  }

  /* ---------------- al abrir: ¿quedó un trabajo? ---------------- */
  async function revisar() {
    if (!est.disponible || !activo()) return null;
    try {
      const s = await leer('actual');
      if (!s || s.formato !== SP.proyecto.AUTO || !s.resumen) { await quitar('anterior'); est.encontrado = null; }
      else { await escribir('anterior', s); est.encontrado = s; }
    } catch (e) { est.disponible = false; }
    pintarAviso(); pintarEstado();
    return est.encontrado;
  }

  function recuperar() {
    const s = est.encontrado;
    if (!s) return;
    const aplicar = () => {
      try {
        const p = SP.proyecto.deInstantanea(s);
        est.encontrado = null; pintarAviso();
        SP.app.exportar.aplicarProyecto(p, { recuperado: true });
        quitar('anterior').catch(() => {});
      } catch (e) {
        if (!(e instanceof SP.ErrorSP)) console.error(e);
        if (L()) L().toast(e.message + (e.arreglo ? ' ' + e.arreglo : ''), { type: 'error' });
      }
      return true;
    };
    if (!hayTrabajo()) { aplicar(); return; }
    SP.ui.dialogo({ titulo: T('Recuperar el trabajo guardado'), cuerpo: `<p>${esc(T('Recuperarlo reemplaza los datos y el reporte con los que trabajas ahora.'))}</p>`, botones: [
      { texto: T('Cancelar'), tipo: 'secundario', accion: () => true },
      { texto: T('Recuperar'), tipo: 'primario', accion: aplicar },
    ] });
  }

  async function descartar() {
    const s = est.encontrado;
    est.encontrado = null; pintarAviso();
    try {
      await quitar('anterior');
      /* si en esta sesión aún no se guardó nada, «actual» sigue siendo ese mismo trabajo */
      const a = await leer('actual');
      if (a && s && a.creado === s.creado) await quitar('actual');
    } catch (e) { /* nada que hacer */ }
    if (L()) L().toast(T('Se descartó el trabajo guardado.'), {});
  }

  async function borrar() {
    clearTimeout(reloj); est.sucio = false;
    est.encontrado = null; est.ultimo = null; est.tuvoTrabajo = false;
    try { await quitar('actual'); await quitar('anterior'); } catch (e) { /* nada que borrar */ }
    pintarAviso(); pintarEstado();
  }

  async function poner(si) {
    try { if (si) localStorage.removeItem(PREF); else localStorage.setItem(PREF, 'no'); } catch (e) { /* sin almacenamiento */ }
    if (si) { est.sucio = true; await guardar(); } else await borrar();
    pintarEstado();
  }

  /* ---------------- pintar ---------------- */
  function pintarAviso() {
    const s = est.encontrado;
    document.querySelectorAll('[data-recuperar]').forEach(c => {
      c.hidden = !s;
      c.innerHTML = s ? `<div class="msg msg-info rec-aviso" role="region" aria-label="${esc(T('Trabajo guardado en este navegador'))}">` +
        `<p><strong>${esc(T('Quedó un trabajo guardado en este navegador'))}</strong> (${esc(fechaDe(s.creado))}): ${esc(describir(s.resumen))}.</p>` +
        `<div class="btn-row"><button type="button" class="btn btn-primary btn-sm" data-rec="recuperar">${esc(T('Recuperar el trabajo'))}</button>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-rec="descartar">${esc(T('Descartar'))}</button></div></div>` : '';
    });
  }
  function pintarEstado() {
    const caja = document.getElementById('expoAutoActivo'), texto = document.getElementById('expoAutoEstado'), b = document.getElementById('expoAutoBorrar');
    if (!caja || !texto) return;
    const si = activo();
    caja.checked = si && est.disponible; caja.disabled = !est.disponible;
    if (b) b.disabled = !est.disponible;
    texto.textContent = !est.disponible ? T('Este navegador no deja guardar aquí (ventana privada o almacenamiento bloqueado): guarda el proyecto .labg para no perder el trabajo.')
      : !si ? T('Desactivado: no se guarda nada en este navegador.')
        : est.error ? T('No se pudo guardar la última vez ({m}): guarda el proyecto .labg.', { m: est.error })
          : est.ultimo ? T('Guardado a las {h}: {d}.', { h: horaDe(est.ultimo.fecha), d: describir(est.ultimo.resumen) })
            : T('Se guarda en cuanto cargues datos o agregues un análisis al reporte.');
  }

  /* ---------------- arranque ---------------- */
  function iniciar() {
    document.addEventListener('sp:datos', programar);
    document.addEventListener('sp:reporte', programar);
    const titulo = document.getElementById('repTitulo');
    if (titulo) titulo.addEventListener('input', programar);
    /* al ocultar o cerrar la pestaña, lo pendiente se guarda ya */
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && est.sucio) guardar(); });
    window.addEventListener('pagehide', () => { if (est.sucio) guardar(); });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-rec]');
      if (!b) return;
      if (b.dataset.rec === 'recuperar') recuperar(); else if (b.dataset.rec === 'descartar') descartar();
    });
    const caja = document.getElementById('expoAutoActivo');
    if (caja) caja.addEventListener('change', () => poner(caja.checked));
    const b = document.getElementById('expoAutoBorrar');
    if (b) b.addEventListener('click', async () => {
      await borrar();
      if (L()) L().toast(activo() ? T('Se borró lo guardado en este navegador; se volverá a guardar con el próximo cambio.') : T('Se borró lo guardado en este navegador.'), {});
    });
    pintarEstado();
    revisado = revisar().catch(() => null);
  }

  SP.app.autoguardado = { guardar: () => { est.sucio = true; return guardar(); }, revisar, recuperar, descartar, borrar, poner, activo, estado: est };
  SP.alArrancar(iniciar);
})();

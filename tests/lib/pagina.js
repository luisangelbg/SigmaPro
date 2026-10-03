/* SigmaPro — corre las pruebas en la página tests/index.html y deja el resumen en
   window.__resultado (lo lee tests/navegador.mjs para correrlas sin ventana).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE). */
(async function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const dif = x => (x === null || x === undefined ? '—' : x === 0 ? '0' : x.toExponential(1));

  /* casos contra R */
  /* los del motor R se validan aparte (tests/motor-r.mjs): necesitan descargar el motor */
  const todos = window.SP_CASOS || [], deMotorR = todos.filter(c => SPT.esMotorR(c, SP)).length;
  const casos = todos.filter(c => !SPT.esMotorR(c, SP)).map(c => SPT.ejecutarCaso(c, SP));
  const rc = SPT.resumirCasos(casos);
  document.querySelector('#tCasos tbody').innerHTML = casos.map(c =>
    '<tr><td>' + esc(c.id) + (c.error ? '<br><span class="mal">' + esc(c.error) + '</span>' : '') +
    (c.fallas.length ? '<br><span class="mal">' + c.fallas.map(f => esc(f.ruta + ': ' + f.motivo)).join('<br>') + '</span>' : '') + '</td>' +
    '<td>' + esc(c.clase) + '</td><td class="n">' + c.valores + '</td><td class="n">' + dif(c.difEscaladaMax) + '</td>' +
    '<td class="' + (c.aprobado ? 'ok' : 'mal') + '">' + (c.aprobado ? 'aprobado' : 'falla') + '</td></tr>').join('') ||
    '<tr><td colspan="5" class="tenue">No hay casos: corre node tests/correr.mjs para empaquetarlos.</td></tr>';

  /* pruebas unitarias */
  const filas = [];
  let suite = null;
  const ru = await SPT.correr(d => {
    if (d.suite !== suite) { suite = d.suite; filas.push('<tr class="suite"><td colspan="2">' + esc(suite) + '</td></tr>'); }
    filas.push('<tr><td>' + esc(d.caso) + (d.error ? '<br><span class="mal">' + esc(d.error) + '</span>' : '') + '</td><td class="' +
      (d.omitida ? 'tenue">omitida (solo en node)' : d.ok ? 'ok">aprobada' : 'mal">falla') + '</td></tr>');
  });
  document.querySelector('#tUnidad tbody').innerHTML = filas.join('');

  const ok = ru.fallidas === 0 && rc.fallidos === 0 && rc.casos > 0;
  const e = document.getElementById('estado');
  e.className = ok ? 'ok' : 'mal';
  e.textContent = (ok ? '✓ Todo aprobado. ' : '✗ Hay fallas. ') +
    'Casos contra R: ' + rc.aprobados + ' de ' + rc.casos + ' (' + rc.valores + ' valores, dif. máx. ' + dif(rc.difEscaladaMax) + '). ' +
    'Pruebas unitarias: ' + ru.aprobadas + ' aprobadas, ' + ru.fallidas + ' con falla, ' + ru.omitidas + ' omitidas.' +
    (deMotorR ? ' ' + deMotorR + ' casos del motor R se validan con node tests/motor-r.mjs.' : '');
  window.__resultado = { ok, unidad: ru, casos: rc, deMotorR, detallesCasos: casos.map(c => ({ id: c.id, aprobado: c.aprobado, difEscaladaMax: c.difEscaladaMax, error: c.error })) };
})().catch(err => {
  const e = document.getElementById('estado');
  e.className = 'mal'; e.textContent = 'Error al correr las pruebas: ' + ((err && err.message) || err);
  window.__resultado = { ok: false, error: String((err && err.stack) || err) };
});

/* vista: 1400x1300 */
/* Bloque 4: el asistente con tiempo hasta un evento (días a la germinación) */
(async () => {
  await ejemplo('días a la germinación');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('asistente'); await W(400);
  const o = $('#anaAsistente input[value="tiempo"]'); o.checked = true; o.dispatchEvent(new Event('change', { bubbles: true })); await W(500);
  const c = $('#anaAsistente input[data-q="covEv"][value="peso_semilla"]'); if (c) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); await W(500); }
  limpio(); window.scrollTo(0, 0); await W(200);
  return caja([$('#anaAsistente')], 8);
})()

/* vista: 1400x1500 motor */
/* 4.15: el formulario del modelo lineal mixto escrito como fórmula (maíz con bloques aleatorios): la fórmula y lo que la app entendió */
(async () => {
  await ejemplo('Maíz: híbridos');
  try { localStorage.setItem('sigmapro.motorR.usado', '1'); } catch (e) { /* sin almacenamiento */ }
  SP.app.analisis.motorAceptado = true;
  await usar('modelo-mixto', { respuesta: 'rend' }, { derecha: 'hibrido * dosis + (1 | bloque)', comoFactor: ['dosis'] });
  const f = $('#anaOpciones'), lista = f.querySelector('ul'); irA(f, 110); await W(300); limpio();
  /* de la respuesta a la lista de los términos que la app leyó de la fórmula */
  const r = f.getBoundingClientRect(), b = lista.getBoundingClientRect();
  window.__recorte = [r.left, r.top, r.width, b.bottom + 14 - r.top].map(Math.round).join(',');
  return window.__recorte;
})()

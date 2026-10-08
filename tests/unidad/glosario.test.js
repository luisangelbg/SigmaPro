/* Pruebas del glosario (hito 5.5): js/nucleo/glosario.js en node; la ventana (js/interfaz/glosario.js) y los lugares
   generados (js/generado/glosario.js) en el navegador. «Ver en acción» de punta a punta, en la app: tests/glosario.mjs. */
SPT.describir('Glosario · los términos', () => {
  SPT.caso('Todos los estadísticos del registro y los conceptos, sin ids repetidos ni relacionados que no existan', () => {
    const t = SP.glosario.terminos(), ids = t.map(x => x.id);
    SPT.igual(t.length, SP.guias.fichas().length + SP.glosario.CONCEPTOS.length);
    SPT.igual(new Set(ids).size, ids.length, 'ids únicos');
    for (const x of t) {
      SPT.afirmar(x.nombre && x.que && x.que.length > 20, 'nombre y qué es: ' + x.id);
      for (const r of x.relacionados) SPT.afirmar(SP.glosario.termino(r), x.id + ' → ' + r);
    }
    SPT.afirmar(SP.glosario.grupos().every(([k]) => k === 'concepto' || t.some(x => x.grupo === k)), 'cada grupo tiene términos');
  });
  SPT.caso('El estadístico que nombra un concepto lo tiene de relacionado', () => {
    SPT.afirmar(SP.glosario.termino('componente').relacionados.includes('reml'), 'componente ← reml');
    SPT.afirmar(SP.glosario.termino('sc').relacionados.includes('sc-tipos'), 'sc ← sc-tipos');
  });
});

SPT.describir('Glosario · el buscador', () => {
  const primero = (q, g) => (SP.glosario.buscar(q, g)[0] || {}).id;
  SPT.caso('Por nombre, símbolo u otro nombre, sin acentos ni mayúsculas', () => {
    SPT.igual(primero('F'), 'F');
    SPT.igual(primero('f'), 'f-cohen', 'el símbolo escrito igual desempata');
    SPT.igual(primero('p'), 'p');
    SPT.igual(primero('interacción'), 'interaccion');
    SPT.igual(primero('INTERACCION'), 'interaccion');
    SPT.igual(primero('R²'), 'r2');
    SPT.igual(primero('r2'), 'r2');
    SPT.igual(primero('chi'), 'chi2');
    SPT.igual(primero('falta de ajuste'), 'falta-ajuste');
    SPT.igual(primero('media marginal'), 'media-ajustada');
    SPT.igual(primero('odds ratio'), 'razon-momios');
    SPT.igual(primero('H0'), 'hipotesis');
    SPT.igual(primero('heredab'), 'heredabilidad');
  });
  SPT.caso('Sin coincidencias, nada; sin texto, todos los del grupo', () => {
    SPT.igual(SP.glosario.buscar('xyzzy').length, 0);
    const c = SP.glosario.buscar('', 'concepto');
    SPT.igual(c.length, SP.glosario.CONCEPTOS.length);
    SPT.afirmar(c.every(x => x.tipo === 'concepto'));
    SPT.afirmar(SP.glosario.buscar('', 'prueba').every(x => x.grupo === 'prueba'));
  });
  SPT.caso('Sin los lugares generados no hay dónde verlo', () => {
    SPT.igualJSON(SP.glosario.lugares('F', null), []);
    SPT.igualJSON(SP.glosario.aparece('F', null), []);
  });
});

SPT.describir('Glosario · los lugares generados', () => {
  SPT.caso('Cada lugar tiene su ejemplo; cada concepto con «en acción» tiene su lugar', () => {
    const D = window.SP_GLOSARIO;
    SPT.afirmar(D && D.pedidos && D.ver && D.conceptos && D.donde, 'js/generado/glosario.js cargado');
    for (const t of SP.glosario.terminos()) for (const l of SP.glosario.lugares(t.id, D)) {
      SPT.afirmar(SP.metodos[l.metodo] && D.pedidos[l.metodo], t.id + ': ' + l.metodo);
      SPT.afirmar(['c', 'f', 'q', 's'].includes(l.modo), t.id + ': modo ' + l.modo);
    }
    for (const [id, , , , , accion] of SP.glosario.CONCEPTOS) SPT.igual(SP.glosario.lugares(id, D).length, accion ? 1 : 0, id);
    SPT.igualJSON(SP.glosario.lugares('F', D)[0], { metodo: 'dbca', cuadro: 'anova', modo: 'c', x: 'F' });
    SPT.igualJSON(SP.glosario.lugares('interaccion', D)[0], { metodo: 'dbca', cuadro: 'anova', modo: 'f', x: 3 });
    SPT.afirmar(SP.glosario.aparece('F', D).includes('dbca'), 'F aparece en bloques');
  }, { navegador: true });
});

SPT.describir('Glosario · la ventana', () => {
  SPT.caso('Los cuadros llevan el id del cuadro y la clave de cada columna', () => {
    const h = SP.cuadros.html({ id: 'anova', titulo: 'Cuadro', columnas: [{ clave: 'fuente', titulo: 'Fuente', formato: 'texto' }, { clave: 'F', titulo: 'F', formato: 'f2' }], filas: [{ fuente: 'a', F: 2 }] }, { lectura: false });
    SPT.afirmar(/<table[^>]* data-cuadro="anova"/.test(h), 'data-cuadro');
    SPT.afirmar(/<th[^>]* data-clave="F"/.test(h), 'data-clave');
  }, { navegador: true });
  SPT.caso('Ctrl+G la abre en el buscador; buscar filtra; elegir muestra qué es, dónde aparece y «Ver en acción»', async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, bubbles: true, cancelable: true }));
    const d = document.getElementById('spGlosario');
    try {
      SPT.afirmar(d && d.open, 'abierta');
      SPT.igual(document.activeElement && document.activeElement.id, 'spGlQ', 'el foco en el buscador');
      const q = d.querySelector('#spGlQ');
      q.value = 'interacción'; q.dispatchEvent(new Event('input', { bubbles: true }));
      await espera(200);
      const items = [...d.querySelectorAll('.sp-gl-item')];
      SPT.igual(items[0].dataset.glId, 'interaccion');
      items[0].click();
      const f = d.querySelector('#spGlFicha');
      SPT.afirmar(/Interacción/.test(f.querySelector('h3').textContent), 'el título');
      SPT.afirmar(f.querySelector('[data-gl-ver="0"]'), 'Ver en acción');
      SPT.afirmar(f.querySelector('a[data-ficha="dbca"]'), 'aparece en bloques');
      SPT.afirmar(/2 de \d+|\d+ de \d+/.test(d.querySelector('#spGlCuenta').textContent), 'la cuenta');
      q.value = 'xyzzy'; q.dispatchEvent(new Event('input', { bubbles: true }));
      await espera(200);
      SPT.afirmar(d.querySelector('.sp-gl-nada'), 'sin coincidencias');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'G', ctrlKey: true, bubbles: true, cancelable: true }));
      SPT.afirmar(!d.open, 'Ctrl+G otra vez la cierra');
      /* un botón con data-glosario la abre en su término */
      const b = document.createElement('button'); b.dataset.glosario = 'F'; document.body.appendChild(b); b.click(); b.remove();
      SPT.afirmar(d.open && /F de Fisher/.test(d.querySelector('#spGlFicha h3').textContent), 'abierta en F');
    } finally { if (d && d.open) d.close(); }
  }, { navegador: true });
});

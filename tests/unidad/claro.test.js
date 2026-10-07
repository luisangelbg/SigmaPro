/* Pruebas de js/nucleo/claro.js (hito 5.4): la conclusión en lenguaje claro y el texto con las convenciones de APA 7.
   Las de «Cómo reportarlo» en el navegador (js/interfaz/reportar.js) van al final. */
SPT.describir('En pocas palabras · los diseños', () => {
  /* un factorial 2 × 3 en bloques: la dosis cambia mucho la respuesta; el híbrido, poco */
  const tabla = () => {
    const y = [], b = [], h = [], d = [];
    const efD = { 0: 0, 60: 1.5, 120: 2.2 }, efH = { A: 0, B: 0.05 };
    let s = 3;
    const azar = () => (s = (s * 16807) % 2147483647) / 2147483647 - 0.5;
    for (const bl of ['1', '2', '3', '4']) for (const hi of ['A', 'B']) for (const dd of [0, 60, 120]) { b.push(bl); h.push(hi); d.push(String(dd)); y.push(4 + efD[dd] + efH[hi] + 0.3 * azar()); }
    return SP.tabla.crear({ y, b, h, d }, { b: { tipo: 'factor' }, h: { tipo: 'factor' }, d: { tipo: 'factor', niveles: ['0', '60', '120'] } });
  };
  SPT.caso('Cada factor con efecto dice su nivel más alto y el más bajo, con las medias del cuadro', () => {
    const f = SP.metodos.dbca, op = SP.opcionesCon(f, {}), r = SP.ejecutar('dbca', tabla(), { respuesta: 'y', tratamientos: ['h', 'd'], bloque: 'b' }, op).resultado, rep = f.reporte(r);
    const fr = SP.claro.frases('dbca', r, rep);
    const anova = rep.cuadros.find(c => c.id === 'anova'), pDe = t => anova.filas.find(x => x.fuente === t).p;
    const md = rep.cuadros.find(c => c.id === 'medias-d').filas.slice().sort((u, v) => v.media - u.media);
    SPT.afirmar(pDe('d') < 0.05, 'la dosis tiene efecto');
    const fd = fr.find(x => /cambia con «d»/.test(x));
    SPT.afirmar(fd && fd.indexOf('el de ' + md[0].nivel + ' (' + SP.guias.formato(md[0].media) + ')') > 0 && fd.indexOf('el de ' + md[md.length - 1].nivel + ' (') > 0, fd);
    const fh = fr.find(x => /«h»/.test(x) && !/interacción/.test(x)) || '';
    const mh = rep.cuadros.find(c => c.id === 'medias-h').filas.slice().sort((u, v) => v.media - u.media);
    SPT.afirmar(pDe('h') >= 0.05 ? /no se ve que «h» cambie «y»/.test(fh) : fh.indexOf('cambia con «h»: es mayor con ' + mh[0].nivel + ' (') >= 0, 'dos niveles: ' + fh);
    SPT.afirmar(fr.some(x => /el error experimental es el \d+\.\d % de la media general/i.test(x)), 'la precisión del ensayo');
    SPT.afirmar(fr.every(x => !/\s[=<>]\s/.test(x)), 'sin símbolos: ' + fr.join(' | '));
  });
});

SPT.describir('En pocas palabras · la conclusión sin la estadística', () => {
  const L = t => SP.claro.limpiar(t);
  SPT.caso('Fuera los paréntesis con estadística; queda lo que se dice en palabras', () => {
    SPT.igual(L('El modelo es significativo (F = 46.801 con 3 y 36 gl, p < 0.001).'), 'El modelo es significativo.');
    SPT.igual(L('No hay evidencia de que las medias de «A» (5.03) y «B» (4.66) difieran: t = 1.191, gl = 16.52, p = 0.250; el IC 95 % de la diferencia va de −0.288 a 1.030.'),
      'No hay evidencia de que las medias de «A» (5.03) y «B» (4.66) difieran.');
    SPT.igual(L('Kappa = 0.492 (IC 95 %: 0.392 a 0.591): concordancia moderada según Landis y Koch (1977), mayor que la del azar (p < 0.001).'),
      'Concordancia moderada según Landis y Koch (1977), mayor que la del azar.');
    SPT.igual(L('La más fuerte: «Examination» con «Education», r = 0.698.'), 'La más fuerte: «Examination» con «Education».');
    SPT.igual(L('V de Cramér = 0.659 (asociación fuerte).'), 'Asociación fuerte.');
    SPT.igual(L('R² = 0.796 (R² ajustada = 0.779): el modelo explica el 79.6 % de la variación de «y»; error estándar de la estimación 2.190.'), 'El modelo explica el 79.6 % de la variación de «y».');
  });
  SPT.caso('Se descartan las etiquetas sin su número y las frases técnicas', () => {
    SPT.igual(L('Tamaño del efecto: η² de H = 0.524.'), null);
    SPT.igual(L('Modelo final: R² = 0.699, R² ajustada = 0.671, AIC = 189.861.'), null);
    SPT.igual(L('Tratamientos con una letra en común no difieren.'), null);
    SPT.igual(L('«rendimiento» (la mayor): 81.17 estimada, d = 0.583.'), null);
    SPT.igual(L('… y 2 proporciones más en el cuadro.'), null);
  });
  SPT.caso('Sin el α del análisis; el valor de una medida que cierra la frase se queda', () => {
    SPT.igual(L('Comparaciones de Dunn (Holm): 2 de 3 pares difieren con α = 0.05.'), 'Comparaciones de Dunn (Holm): 2 de 3 pares difieren.');
    SPT.igual(L('La mejor combinación (N = 197.5, riego = 24.27) da una deseabilidad global D = 0.714.'), 'La mejor combinación da una deseabilidad global de 0.714.');
    SPT.igual(L('Con 3.69 medidas por individuo, la determinación del valor permanente es R² = 0.916 (92 %).'),
      'Con 3.69 medidas por individuo, la determinación del valor permanente es 92 %.');
  });
});

SPT.describir('Cómo reportarlo · APA 7', () => {
  const A = t => SP.claro.apa(t);
  SPT.caso('p sin cero inicial, coma entre estadísticos e intervalos entre corchetes', () => {
    SPT.igual(A('El efecto de A fue significativo (F(2, 33) = 60.63; p < 0.001).'), 'El efecto de A fue significativo (F(2, 33) = 60.63, p < .001).');
    SPT.igual(A('La diferencia de medias fue −0.3625 (IC 95 %: −0.5722 a −0.1528); t(13.21) = −3.73; p = 0.002; g de Hedges = −1.47.'),
      'La diferencia de medias fue −0.3625 (IC 95 % [−0.5722, −0.1528]), t(13.21) = −3.73, p = .002, g de Hedges = −1.47.');
    SPT.igual(A('The difference in means was 0.3710 (95% CI: −0.2875 to 1.030); t(16.52) = 1.19; p = 0.250.'), 'The difference in means was 0.3710 (95% CI [−0.2875, 1.030]), t(16.52) = 1.19, p = .250.');
  });
  SPT.caso('Los estadísticos que no pasan de 1 van sin el cero; los que pueden pasar de 1, con él', () => {
    SPT.igual(A('r = 0.698; R² = 0.969; V de Cramér = 0.659; κ = 0.492; W de Kendall = 0.519; η² = 0.753'), 'r = .698, R² = .969, V de Cramér = .659, κ = .492, W de Kendall = .519, η² = .753');
    SPT.igual(A("Cramér's V = 0.659; adjusted R² = 0.898; r = −0.687"), "Cramér's V = .659, adjusted R² = .898, r = −.687");
    SPT.igual(A('g de Hedges = 0.51; b = 0.4345; F(1, 68) = 0.35'), 'g de Hedges = 0.51, b = 0.4345, F(1, 68) = 0.35');
    SPT.igual(A('A: media = 0.3142 (DE = 0.1023; n = 12)'), 'A: M = 0.3142 (DE = 0.1023, n = 12)');
  });
  SPT.caso('El porcentaje: con espacio en español, pegado a la cifra en inglés', () => {
    SPT.igual(A('con un coeficiente de variación de 3.6 %'), 'con un coeficiente de variación de 3.6 %');
    SPT.igual(SP.claro.apa('with a coefficient of variation of 3.6 % and R² = 0.969', 'en'), 'with a coefficient of variation of 3.6% and R² = .969');
  });
  SPT.caso('En pantalla: los símbolos estadísticos en cursiva, las letras griegas no', () => {
    const h = SP.claro.apaHTML('F(2, 33) = 60.63; p < 0.001; χ²(1) = 10.46; r = 0.698; n = 12');
    SPT.igual(h, '<i>F</i>(2, 33) = 60.63, <i>p</i> &lt; .001, χ²(1) = 10.46, <i>r</i> = .698, <i>n</i> = 12');
    SPT.afirmar(/Hedges' <i>g<\/i>/.test(SP.claro.apaHTML("Hedges' g = 0.51")), 'la g de Hedges en inglés');
  });
});

SPT.describir('Cómo reportarlo · el desplegable', () => {
  SPT.caso('Se arma al abrirlo: métodos y resultados en APA, con su botón de copiar y las dos pestañas de idioma', async () => {
    const t = SP.tabla.crear({ y: [5.1, 4.9, 5.6, 5.8, 6.1, 6.4, 7.2, 6.9, 7.5, 8.1, 8.4, 7.9], g: ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c'] }, { g: { tipo: 'factor' } });
    const e = { respuesta: 'y', tratamiento: 'g' }, op = SP.opcionesCon(SP.metodos['kruskal-wallis'], {}), r = SP.ejecutar('kruskal-wallis', t, e, op).resultado;
    const raiz = document.createElement('div');
    raiz.innerHTML = SP.reportar.html({ metodo: 'kruskal-wallis', r, e, op, tabla: t });
    document.body.appendChild(raiz);
    try {
      const det = raiz.querySelector('details.sp-reportar');
      await SP.reportar.pintar(det, 'es');
      const ps = [...det.querySelectorAll('.sp-rp-p')];
      SPT.igual(ps.length, 2, 'métodos y resultados');
      SPT.afirmar(/<i>H<\/i>\(2\) = [\d.]+, <i>p<\/i> [=&<lt;]+ \.\d+/.test(ps[1].innerHTML), ps[1].innerHTML.slice(0, 200));
      SPT.igual(det.querySelectorAll('[data-rp-copiar]').length, 2);
      SPT.igualJSON([...det.querySelectorAll('[data-rp-idioma]')].map(b => b.dataset.rpIdioma), ['es', 'en']);
      SPT.afirmar(/^Las medianas|^H|Kruskal/.test(det._rpTextos.m + det._rpTextos.r), 'los textos para copiar');
    } finally { raiz.remove(); }
  }, { navegador: true });
  SPT.caso('En pocas palabras: el recuadro con sus frases; nada si no hay frases', () => {
    const h = SP.reportar.claro('dbca', { factores: ['a'], respuesta: 'y', alfa: 0.05, resumen: {} }, { cuadros: [{ id: 'anova', columnas: [{ clave: 'fuente' }, { clave: 'p' }], filas: [{ fuente: 'a', p: 0.5 }] }] });
    SPT.afirmar(/class="sp-claro"/.test(h) && /no se ve que «a» cambie «y»/.test(h), h);
    SPT.igual(SP.reportar.claro('dbca', {}, { cuadros: [], conclusiones: [] }), '');
  }, { navegador: true });
});

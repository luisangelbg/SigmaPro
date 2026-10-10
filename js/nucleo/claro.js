/* SigmaPro — conclusión en lenguaje claro y cómo reportar el resultado al estilo APA (hito 5.4).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Dos piezas sobre lo que ya calculó cada método (no calcula nada nuevo):
     · En pocas palabras: el resultado sin símbolos. En los diseños experimentales se arma con el cuadro del ANOVA y las
       medias de cada factor (qué factor cambia la respuesta, cuál nivel quedó más alto y cuál más bajo, si hay
       interacción y la precisión del ensayo); en los demás análisis, las frases de su conclusión sin la estadística.
     · Cómo reportarlo: el párrafo de resultados del reporte (SP.informe.parrafo) con las convenciones de APA 7: los
       símbolos estadísticos en cursiva, p y los estadísticos que no pasan de 1 sin el cero inicial (p < .001,
       r = .45), comas entre estadísticos y los intervalos entre corchetes (IC 95 % [0.15, 0.57]). Sirve igual para
       el texto en español y en inglés (el que da SP.T con el catálogo de cada idioma).
   Módulo puro (sin DOM), probado en node:

     SP.claro.frases(id, r, rep)   → [frase] en lenguaje claro (máximo cuatro)
     SP.claro.apa(texto, idioma)   → el texto con las convenciones de APA 7 (sin formato); idioma 'en' pega el % a la cifra
     SP.claro.apaHTML(texto, idioma) → lo mismo, escapado y con los símbolos en <i> */
SP.definir('claro', function (SP) {
  'use strict';
  const T = SP.T;
  const esNumero = v => typeof v === 'number' && Number.isFinite(v);
  const num = v => (SP.guias && SP.guias.formato ? SP.guias.formato(v) : String(v));
  const may = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const listaY = xs => (xs.length > 1 ? T('{a} y {b}', { a: xs.slice(0, -1).join(', '), b: xs[xs.length - 1] }) : xs[0] || '');
  const q = x => SP.comillas ? SP.comillas(x) : '«' + x + '»';

  /* ---------------- en pocas palabras: los diseños ---------------- */
  function frasesDiseno(r, rep) {
    const anova = (rep.cuadros || []).find(c => (c.columnas || []).some(k => k.clave === 'fuente') && (c.columnas || []).some(k => k.clave === 'p'));
    if (!anova || !Array.isArray(r.factores) || !r.factores.length) return null;
    const a = r.alfa > 0 && r.alfa < 1 ? r.alfa : 0.05, y = r.respuesta, out = [];
    const medias = f => (rep.cuadros || []).find(c => c.id === 'medias-' + f);
    for (const fila of anova.filas || []) {
      if (!esNumero(fila.p)) continue;
      const partes = String(fila.fuente).split(' × ').map(s => s.trim());
      if (!partes.every(p => r.factores.includes(p))) continue;
      if (partes.length === 1) {
        const f = partes[0];
        if (fila.p >= a) { out.push(T('Con estos datos no se ve que {f} cambie {y}.', { f: q(f), y: q(y) })); continue; }
        const m = medias(f), ms = m ? (m.filas || []).filter(x => esNumero(x.media)).slice().sort((u, v) => v.media - u.media) : [];
        if (ms.length === 2) out.push(T('{y} cambia con {f}: es mayor con {a} ({ma}) que con {b} ({mb}).', { y: may(q(y)), f: q(f), a: ms[0].nivel, ma: num(ms[0].media), b: ms[1].nivel, mb: num(ms[1].media) }));
        else if (ms.length > 2) out.push(T('{y} cambia con {f}: el valor más alto es el de {a} ({ma}) y el más bajo, el de {b} ({mb}).', { y: may(q(y)), f: q(f), a: ms[0].nivel, ma: num(ms[0].media), b: ms[ms.length - 1].nivel, mb: num(ms[ms.length - 1].media) }));
        else out.push(T('{y} cambia con {f}.', { y: may(q(y)), f: q(f) }));
      } else if (fila.p < a) out.push(T('El efecto de {l} depende de la combinación: conviene comparar las medias de uno dentro de cada nivel del otro.', { l: listaY(partes.map(q)) }));
      else if (partes.length === 2) out.push(T('El efecto de {a} no depende de {b}: no se vio interacción.', { a: q(partes[0]), b: q(partes[1]) }));
    }
    const cv = r.resumen && r.resumen.cv;
    if (esNumero(cv) && SP.guias && SP.guias.zona) {
      const z = SP.guias.zona('cv', cv, {});
      if (z) out.push(T('El error experimental es el {v} % de la media general; con la guía general, un CV {z}.', { v: cv.toFixed(1), z: z.etiqueta }));
    }
    return out.length ? out : null;
  }

  /* ---------------- en pocas palabras: los demás, la conclusión sin la estadística ---------------- */
  const ESTADISTICA = /(?:\s[=<>≤≥]\s)/;
  /* una asignación de un símbolo estadístico con su número: «t = 1.191», «W de Kendall = 0.519», «χ²(3) = 33.08»,
     «con α = 0.05» (los nombres de las variables, como «dosis = 140.4», no se tocan) */
  const SIMBOLO = '(?:F|t|p|H|W|z|T|U|V|D|b|r|n|N|Q|R²(?: ajustada)?|adjusted R²|χ²|τ|ρ|κ|φ|η²(?: de H)?|ω²|α|σ²?|θ|λ|DW|AIC|BIC|HR|OR|ASV|Pillai|Wilks|S²d|S1|S3|Wi|gl|df|' +
    '[gd] de (?:Hedges|Cohen)|V de Cramér|W de Kendall|p ajustado|adjusted p|Hedges\' g|Cohen\'s d|Cramér\'s V|Kendall\'s W)';
  const ASIGNACION = new RegExp('(?:,?\\s(?:con|with))?,?\\s?' + SIMBOLO + '(?:\\([^()]*\\))?\\s[=<>≤≥]\\s[−-]?[\\d.]+(?:e[−-]?\\d+)?(?:\\s?%)?', 'g');
  /* lo que solo dice algo a quien sabe estadística */
  const TECNICO = /\b(?:IC|CI|EE|SE|gl|df)\b|σ|error estándar|standard error|letra en común|sharing a letter/;
  /* palabras con contenido: las de tres letras o más que no son artículos ni preposiciones */
  const VACIAS = new Set('del las los les una uno unos unas con por para que entre sin sus the and for with from that this than its are was'.split(' '));
  const palabras = t => String(t).split(/\s+/).filter(w => /\p{L}{3,}/u.test(w) && !VACIAS.has(w.toLowerCase().replace(/[^\p{L}]/gu, ''))).length;
  /* etiquetas que, sin su número, no dicen nada */
  const ETIQUETA_SOLA = /^(?:tamaño del efecto|effect size|modelo final|final model|concordancia entre bloques|agreement among blocks)$|^[«“][^»”]+[»”] \([^)]*\)$/i;
  function pulir(t) {
    return t.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').replace(/([,;:])(?=[,;:.])/g, '').replace(/\s(?:y|e|o|and|or)(?=[.,;:]|$)/g, '')
      .replace(/[,;:]\s*$/, '').replace(/^[\s,;:]+/, '').trim();
  }
  const partes = t => t.split(/[:;]\s/);
  /* el valor de una medida (no de una prueba) que cierra la frase tras su nombre:
     «da una deseabilidad global D = 0.714» → «… global de 0.714» */
  const FINAL = new RegExp('(\\p{L})\\s(?:D|d|r|R²|ρ|τ|κ|φ|W)\\s=\\s([−-]?[\\d.]+)(?=\\.?$)', 'u');
  const sinAsignaciones = s => s.replace(FINAL, (m, l, v) => l + (SP.T.catalogo ? ' of ' : ' de ') + v).replace(ASIGNACION, '')
    /* lo que quedó entre paréntesis tras un verbo: «es (92 %)» → «es 92 %» */
    .replace(/\b(es|son|fue|is|are|was) \(([^()]+)\)/g, '$1 $2');
  /* un paréntesis con estadística: «(F = 60.6, p < 0.001)», «(IC 95 %: 0.39 a 0.59)», «(3 y 36 gl)», «(n exacta: 4.915)».
     Puede traer otro dentro, el de los grados de libertad: «(F(2, 10.0) = 1.49, p = 0.272)», como en los modelos mixtos.
     Sin eso, el de fuera se quedaba, se le quitaban los símbolos y la frase terminaba en «()» o se perdía entera. */
  const DENTRO = '(?:[^()]|\\([^()]*\\))*';
  const PARENTESIS = new RegExp('\\s*\\(' + DENTRO + '(?:\\s[=<>≤≥]\\s|\\bgl\\b|\\bdf\\b|\\bIC\\b|\\bCI\\b|:\\s[−-]?\\d)' + DENTRO + '\\)', 'g');
  function limpiar(frase) {
    let s = String(frase || ''), antes;
    /* la continuación de una lista que no se muestra: «… y 2 proporciones más en el cuadro» */
    if (/^\s*…/.test(s)) return null;
    /* el nivel de significancia del análisis no dice nada del resultado: «2 de 3 pares difieren con α = 0.05» */
    s = s.replace(/,?\s(?:con|with|at)\sα\s=\s[\d.]+/g, '');
    do { antes = s; s = s.replace(PARENTESIS, ''); } while (s !== antes);
    if (ESTADISTICA.test(s)) {
      const iE = s.search(ESTADISTICA), iC = s.indexOf(': ');
      const sinSimbolos = pulir(sinAsignaciones(s));
      /* la estadística después de «: »: basta lo de antes, si se sostiene solo */
      if (iC > 0 && iE > iC && palabras(s.slice(0, iC)) >= 3) s = s.slice(0, iC);
      /* sin los símbolos queda una frase completa (ninguna parte se quedó vacía) */
      else if (!ESTADISTICA.test(sinSimbolos) && partes(sinSimbolos).length === partes(pulir(s)).length && partes(sinSimbolos).every(x => palabras(x) >= 2)) s = sinSimbolos;
      /* la estadística antes de «: »: lo que sigue */
      else if (iC > 0 && iE < iC) s = may(s.slice(iC + 2));
      else if (iC > 0) s = s.slice(0, iC);
      if (ESTADISTICA.test(s)) return null;
    }
    /* fuera las partes técnicas separadas por «; » («error estándar de la estimación 2.190», «IC 90 % de Wilson: …») */
    s = s.split(/;\s/).filter(x => !TECNICO.test(x)).join('; ');
    s = pulir(s);
    /* lo que quedó entre paréntesis, solo: «(asociación fuerte)» → «Asociación fuerte» */
    const sola = /^\(([^()]+)\)\.?$/.exec(s);
    if (sola) s = may(sola[1]);
    if (palabras(s) < 2 || TECNICO.test(s) || ETIQUETA_SOLA.test(s)) return null;
    return /[.!?]$/.test(s) ? s : s + '.';
  }
  /* las frases de una conclusión (que puede traer varias oraciones) */
  const oraciones = t => String(t || '').split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ«“¿0-9])/).filter(Boolean);

  /** La conclusión en lenguaje claro: hasta cuatro frases sin símbolos estadísticos. */
  function frases(id, r, rep) {
    if (!rep) return [];
    const d = r && frasesDiseno(r, rep);
    /* con «Dentro de cada nivel de», cada conclusión empieza por su nivel («hibrido = H-40: 3 grupos…»). No es
       estadística: se aparta, se limpia lo demás y vuelve sin el signo (««hibrido» H-40: 3 grupos…»). Sin esto la
       frase perdía el nivel y dos niveles con los mismos grupos quedaban en una sola frase */
    const niveles = (r && Array.isArray(r.grupos) ? r.grupos : []).map(g => (g && g.dentro ? Object.entries(g.dentro) : [])).filter(e => e.length)
      .map(e => ({ de: e.map(([f, l]) => f + ' = ' + l).join(', ') + ': ', a: e.map(([f, l]) => q(f) + ' ' + l).join(', ') + ': ' }));
    const conNivel = frase => {
      const n = niveles.find(x => frase.slice(0, x.de.length).toLowerCase() === x.de.toLowerCase());
      if (!n) return limpiar(frase);
      const resto = limpiar(frase.slice(n.de.length));
      return resto ? n.a + resto : null;
    };
    const lista = d || [].concat(...(rep.conclusiones || []).map(oraciones)).map(niveles.length ? conNivel : limpiar).filter(Boolean);
    const vistas = new Set();
    return lista.filter(x => (vistas.has(x) ? false : vistas.add(x))).slice(0, 4);
  }

  /* ---------------- cómo reportarlo: APA 7 ---------------- */
  /* los estadísticos que no pueden pasar de 1 (sin el cero inicial): correlaciones, proporciones de varianza, acuerdos */
  const ACOTADOS = '(?:r|R²(?: ajustada)?|adjusted R²|η²(?: de H)?|ω²|V de Cramér|Cramér\'s V|W de Kendall|Kendall\'s W|τ|ρ|φ|κ(?: ponderada)?|weighted κ|W|H²)';
  function apa(texto, idioma) {
    let s = String(texto || '');
    /* intervalos: «IC 95 %: a a b» → «IC 95 % [a, b]»; «95% CI: a to b» → «95% CI [a, b]» */
    s = s.replace(/IC (\d+(?:\.\d+)?) %: (−?[\d.]+(?:e[−-]?\d+)?) a (−?[\d.]+(?:e[−-]?\d+)?)/g, 'IC $1 % [$2, $3]')
      .replace(/IC: (−?[\d.]+) a (−?[\d.]+)/g, 'IC [$1, $2]')
      .replace(/(\d+(?:\.\d+)?)% CI: (−?[\d.]+(?:e[−-]?\d+)?) to (−?[\d.]+(?:e[−-]?\d+)?)/g, '$1% CI [$2, $3]')
      .replace(/\bCI: (−?[\d.]+) to (−?[\d.]+)/g, 'CI [$1, $2]');
    /* entre estadísticos, coma en lugar de punto y coma: «t(13.21) = −3.73; p = 0.002» → «…, p = .002» */
    s = s.replace(/;\s(?=[^;:,.()]{0,26}?(?:\([^)]*\))?\s[=<>])/g, ', ');
    /* p sin cero inicial */
    s = s.replace(/\bp((?:\s(?:ajustado|adjusted|de Bonferroni|exacta|exact))?)\s([=<>≤≥])\s0\./g, 'p$1 $2 .');
    /* los acotados por 1, sin cero inicial */
    s = s.replace(new RegExp('(^|[\\s(;,])(' + ACOTADOS + ')\\s=\\s(−?)0\\.', 'g'), '$1$2 = $3.');
    /* la media como M */
    s = s.replace(/\bmedia = /g, 'M = ').replace(/\bmean = /g, 'M = ');
    /* en inglés el porcentaje va pegado a la cifra (3.6%); en español, con espacio (3.6 %) */
    if (idioma === 'en') s = s.replace(/(\d) %/g, '$1%');
    return s;
  }
  const escHTML = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  /** El texto APA para la pantalla: escapado y con los símbolos estadísticos en cursiva (las letras griegas no). */
  function apaHTML(texto, idioma) {
    return escHTML(apa(texto, idioma))
      .replace(/(^|[\s(;,[])(F|t|p|H|W|z|T|U|V|b|r|n|N|M|DE|SD|R²|g|d)(?=\s?(?:\(|\s=|\s&lt;|\s&gt;|\s≤|\s≥|\s(?:ajustado|adjusted|de Hedges|de Cohen|de Cramér|de Kendall)\b))/g, '$1<i>$2</i>')
      .replace(/(Hedges'|Cohen's|Cramér's|Kendall's) (g|d|V|W)\b/g, '$1 <i>$2</i>');
  }

  SP.claro = { frases, apa, apaHTML, limpiar };
});

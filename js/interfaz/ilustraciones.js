/* SigmaPro — ilustraciones vectoriales de los análisis del catálogo.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Una miniatura SVG propia (64 × 40) por análisis, que dice de un vistazo qué produce: el croquis del diseño, la
   curva, las barras con letras, el escalón de supervivencia… Trazo con currentColor (sigue al tema) y el acento oro
   con la variable del tema. Son decorativas (aria-hidden): el nombre y el resumen de la tarjeta dicen lo mismo.

     SP.ilustraciones.svg(idMetodo) → '<svg …>…</svg>' (una genérica si el método no tiene la suya) */
(function () {
  'use strict';
  const A = 'var(--btn-oro-texto)', AS = 'var(--btn-oro-suave)', T = 'currentColor';
  /* primitivas: polilínea, puntos, barras, rejilla de parcelas */
  const lin = (pts, c = T, w = 1.6, extra = '') => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const pun = (pts, c = T, r = 1.6) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
  const bar = (xs, alturas, c = A, w = 7, base = 36) => xs.map((x, i) => `<rect x="${x}" y="${base - alturas[i]}" width="${w}" height="${alturas[i]}" rx="1" fill="${c}"/>`).join('');
  const ejes = `<path d="M6 4V36H60" fill="none" stroke="${T}" stroke-width="1" opacity=".55"/>`;
  const txt = (x, y, s, c = T, tam = 7) => `<text x="${x}" y="${y}" font-size="${tam}" font-weight="700" fill="${c}" text-anchor="middle" font-family="system-ui,sans-serif">${s}</text>`;
  const campo = (filas, cols, colores, x0 = 8, y0 = 5, w = 48, h = 30) => {
    let s = '';
    const cw = w / cols, ch = h / filas;
    for (let i = 0; i < filas; i++) for (let j = 0; j < cols; j++) {
      const k = colores[i][j];
      s += `<rect x="${(x0 + j * cw + 0.6).toFixed(1)}" y="${(y0 + i * ch + 0.6).toFixed(1)}" width="${(cw - 1.2).toFixed(1)}" height="${(ch - 1.2).toFixed(1)}" rx="1" fill="${k === 1 ? A : k === 2 ? AS : k === 3 ? T : 'none'}" stroke="${T}" stroke-width=".6" opacity="${k === 3 ? '.55' : '1'}"/>`;
    }
    return s;
  };
  const campana = (cx, s, alto, c = T, extra = '') => lin(Array.from({ length: 25 }, (_, i) => { const x = cx - 3 * s + i * s / 4; return [+x.toFixed(1), +(36 - alto * Math.exp(-((x - cx) ** 2) / (2 * s * s))).toFixed(1)]; }), c, 1.6, extra);
  const curva = (f, c = A, w = 1.8) => lin(Array.from({ length: 27 }, (_, i) => { const x = 8 + i * 2; return [x, +f(x).toFixed(1)]; }), c, w);
  const nube = [[12, 30], [16, 27], [20, 28], [24, 22], [28, 23], [32, 18], [36, 19], [40, 14], [44, 15], [48, 10], [52, 11]];

  const I = {
    supuestos: () => ejes + pun([[10, 33], [16, 29], [22, 25], [28, 21], [34, 18], [40, 14], [46, 11], [52, 8]], A) + lin([[8, 35], [56, 6]], T, 1, ' stroke-dasharray="3 2"'),
    'prueba-t': () => ejes + campana(26, 6, 26, T) + campana(38, 6, 26, A),
    wilcoxon: () => ejes + pun([[14, 30], [18, 26], [22, 24], [26, 22]], T, 2) + pun([[34, 18], [38, 14], [44, 12], [50, 9]], A, 2),
    'kruskal-wallis': () => ejes + [[16, 24, 14], [32, 18, 9], [48, 12, 6]].map(([x, m, d], i) => `<rect x="${x - 4}" y="${m - d / 2}" width="8" height="${d + 6}" fill="${i === 1 ? A : AS}" stroke="${T}" stroke-width=".8"/>`).join(''),
    friedman: () => ejes + [[22, 26, 30], [16, 20, 24], [10, 14, 18]].map((ys, k) => lin([[14, ys[0]], [32, ys[1]], [50, ys[2]]], k === 1 ? A : T, 1.3)).join(''),
    dca: () => campo(3, 5, [[1, 2, 0, 1, 2], [0, 1, 2, 0, 1], [2, 0, 1, 2, 0]]),
    dbca: () => campo(3, 4, [[1, 2, 3, 0], [3, 0, 1, 2], [2, 1, 0, 3]]) + `<path d="M5 15H59M5 25H59" stroke="${A}" stroke-width="1.4"/>`,
    'cuadro-latino': () => [['A', 'B', 'C'], ['C', 'A', 'B'], ['B', 'C', 'A']].map((f, i) => f.map((l, j) => `<rect x="${16 + j * 11}" y="${3 + i * 11}" width="10" height="10" rx="1" fill="${l === 'A' ? AS : 'none'}" stroke="${T}" stroke-width=".7"/>` + txt(21 + j * 11, 10.5 + i * 11, l, l === 'A' ? A : T)).join('')).join(''),
    'parcelas-divididas': () => `<rect x="8" y="5" width="48" height="30" fill="none" stroke="${T}" stroke-width="1"/><path d="M24 5V35M40 5V35" stroke="${A}" stroke-width="1.8"/>` + [8, 24, 40].map(x => `<path d="M${x} 15H${x + 16}M${x} 25H${x + 16}" stroke="${T}" stroke-width=".6"/>`).join('') + `<rect x="9" y="6" width="14" height="28" fill="${AS}" opacity=".6"/>`,
    'parcelas-subdivididas': () => I['parcelas-divididas']() + [8, 24, 40].map(x => `<path d="M${x + 8} 5V35" stroke="${T}" stroke-width=".4" stroke-dasharray="1.5 1.5"/>`).join(''),
    franjas: () => `<rect x="8" y="5" width="48" height="30" fill="none" stroke="${T}" stroke-width="1"/><rect x="8" y="13" width="48" height="7" fill="${AS}"/><rect x="28" y="5" width="9" height="30" fill="${A}" opacity=".45"/>`,
    bib: () => campo(4, 3, [[1, 2, 0], [2, 0, 3], [0, 3, 1], [3, 1, 2]], 14, 4, 36, 32),
    latice: () => campo(2, 3, [[1, 2, 3], [3, 1, 0]], 6, 5, 24, 30) + campo(2, 3, [[2, 3, 1], [0, 2, 1]], 34, 5, 24, 30),
    'modelo-lineal': () => txt(32, 18, 'y ~ x', T, 9) + txt(32, 32, '+ (…)', A, 8),
    'comparaciones-medias': () => ejes + bar([12, 24, 36, 48], [12, 20, 22, 28]) + txt(15.5, 22, 'a', T, 6) + txt(27.5, 14, 'ab', T, 6) + txt(39.5, 12, 'b', T, 6) + txt(51.5, 6, 'c', T, 6),
    contrastes: () => ejes + bar([12, 22, 34, 44], [14, 16, 24, 26], AS) + `<path d="M13 16V12H28V16M35 8V4H50V8M20 12V6H42V4" fill="none" stroke="${A}" stroke-width="1.2"/>`,
    polinomios: () => ejes + pun([[12, 30], [24, 16], [36, 11], [48, 14]], T, 2) + curva(x => 36 - (27 - 0.03 * (x - 38) ** 2) + 2),
    'medias-ajustadas': () => ejes + [[16, 24], [32, 14], [48, 18]].map(([x, y]) => `<path d="M${x} ${y - 6}V${y + 6}M${x - 3} ${y - 6}H${x + 3}M${x - 3} ${y + 6}H${x + 3}" stroke="${T}" stroke-width="1"/><circle cx="${x}" cy="${y}" r="2.6" fill="${A}"/>`).join(''),
    'regresion-lineal': () => ejes + pun(nube, T, 1.4) + lin([[8, 32], [56, 8]], A, 1.8),
    'regresion-polinomial': () => ejes + pun([[10, 30], [16, 22], [22, 16], [30, 12], [38, 12], [46, 16], [54, 24]], T, 1.4) + curva(x => 10 + 0.022 * (x - 34) ** 2),
    'seleccion-pasos': () => ejes + bar([10, 20, 30, 40, 50], [8, 14, 20, 24, 25], AS, 7) + lin([[13, 26], [23, 20], [33, 14], [43, 11], [53, 10]], A, 1.6),
    'mejores-subconjuntos': () => ejes + [10, 20, 30, 40, 50].map((x, i) => `<rect x="${x}" y="${30 - i * 4 - 4}" width="7" height="4" fill="${i === 3 ? A : T}" opacity="${i === 3 ? 1 : .35}"/>`).join(''),
    ancova: () => ejes + lin([[8, 30], [56, 14]], T, 1.5) + lin([[8, 22], [56, 6]], A, 1.5) + pun([[14, 27], [26, 24], [40, 18], [16, 18], [30, 14], [46, 10]], T, 1.2),
    correlacion: () => ejes + `<ellipse cx="32" cy="20" rx="22" ry="7" transform="rotate(-28 32 20)" fill="${AS}" stroke="${A}" stroke-width="1"/>` + pun(nube, T, 1.3),
    'matriz-correlacion': () => [[1, .6, .2, .8], [.6, 1, .4, .3], [.2, .4, 1, .7], [.8, .3, .7, 1]].map((f, i) => f.map((v, j) => `<rect x="${14 + j * 9}" y="${2 + i * 9}" width="8.4" height="8.4" fill="${A}" fill-opacity="${v.toFixed(2)}" stroke="${T}" stroke-width=".3"/>`).join('')).join(''),
    'correlacion-parcial': () => `<circle cx="16" cy="28" r="5" fill="${AS}" stroke="${T}"/><circle cx="48" cy="28" r="5" fill="${AS}" stroke="${T}"/><circle cx="32" cy="9" r="5" fill="none" stroke="${T}" stroke-dasharray="2 1.5"/><path d="M21 28H43" stroke="${A}" stroke-width="2"/><path d="M19 24L28 13M45 24L36 13" stroke="${T}" stroke-width=".9" stroke-dasharray="2 1.5"/>`,
    'tabla-contingencia': () => `<rect x="10" y="4" width="26" height="18" fill="${A}"/><rect x="36" y="4" width="18" height="18" fill="${AS}"/><rect x="10" y="22" width="14" height="14" fill="${AS}"/><rect x="24" y="22" width="30" height="14" fill="${A}" opacity=".7"/><path d="M10 4H54V36H10Z" fill="none" stroke="${T}" stroke-width=".8"/>`,
    mcnemar: () => [[1, 0], [0, 1]].map((f, i) => f.map((v, j) => `<rect x="${18 + j * 14}" y="${6 + i * 14}" width="13" height="13" fill="${v ? AS : A}" stroke="${T}" stroke-width=".7"/>`).join('')).join('') + `<path d="M24 20L39 13" stroke="${T}" stroke-width="1" marker-end=""/>`,
    'mantel-haenszel': () => [0, 1, 2].map(k => `<rect x="${10 + k * 16}" y="${8 + k * 3}" width="12" height="12" fill="${k === 1 ? A : AS}" stroke="${T}" stroke-width=".7"/><path d="M${16 + k * 16} ${8 + k * 3}V${20 + k * 3}M${10 + k * 16} ${14 + k * 3}H${22 + k * 16}" stroke="${T}" stroke-width=".5"/>`).join(''),
    kappa: () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((f, i) => f.map((v, j) => `<rect x="${20 + j * 8}" y="${8 + i * 8}" width="7.4" height="7.4" fill="${v ? A : AS}" stroke="${T}" stroke-width=".4"/>`).join('')).join('') + txt(14, 22, 'A', T, 7) + txt(32, 38, 'B', T, 7),
    'modelo-mixto': () => `<path d="M32 4L56 14L32 24L8 14Z" fill="${AS}" stroke="${T}" stroke-width=".8"/><path d="M8 20L32 30L56 20" fill="none" stroke="${A}" stroke-width="1.4"/><path d="M8 26L32 36L56 26" fill="none" stroke="${T}" stroke-width=".9" opacity=".5"/>`,
    'medidas-repetidas': () => ejes + [[30, 24, 20, 14], [32, 28, 22, 20], [26, 20, 14, 10], [34, 30, 28, 24]].map((ys, k) => lin(ys.map((y, i) => [12 + i * 13, y]), k === 2 ? A : T, k === 2 ? 1.6 : .9)).join(''),
    'componentes-varianza': () => `<circle cx="32" cy="20" r="15" fill="${AS}"/><path d="M32 20L32 5A15 15 0 0 1 46.3 24.6Z" fill="${A}"/><path d="M32 20L46.3 24.6A15 15 0 0 1 22 31.2Z" fill="${T}" opacity=".35"/>`,
    heredabilidad: () => ejes + campana(32, 9, 24, T) + campana(36, 5, 28, A),
    repetibilidad: () => ejes + [[14, 26, 24, 27], [30, 16, 14, 17], [46, 22, 21, 23]].map(([x, ...ys]) => pun(ys.map((y, i) => [x + i * 3 - 3, y]), A, 1.5)).join(''),
    'glm-conteos': () => ejes + bar([10, 18, 26, 34, 42, 50], [8, 22, 26, 18, 10, 4], AS, 6) + lin([[13, 29], [21, 15], [29, 11], [37, 18], [45, 26], [53, 32]], A, 1.4),
    'glm-proporciones': () => ejes + curva(x => 34 - 28 / (1 + Math.exp(-(x - 32) / 4))) + pun([[12, 33], [22, 30], [30, 22], [38, 12], [48, 7]], T, 1.5),
    'glm-gamma': () => ejes + curva(x => 36 - 120 * ((x - 6) / 50) ** 1.2 * Math.exp(-(x - 6) / 9) * 2.4),
    glm: () => ejes + curva(x => 34 - 26 * (1 - Math.exp(-(x - 8) / 14))) + txt(46, 30, 'g(μ)', T, 7),
    'glmm-bloques': () => ejes + [0, 1, 2].map(k => curva(x => 34 - 26 / (1 + Math.exp(-(x - 26 - k * 6) / 4)), k === 1 ? A : T, k === 1 ? 1.6 : .9)).join(''),
    glmm: () => I['glmm-bloques'](),
    'curva-crecimiento': () => ejes + curva(x => 34 - 26 / (1 + Math.exp(-(x - 30) / 5))) + pun([[10, 33], [18, 31], [26, 24], [34, 14], [42, 10], [52, 8]], T, 1.3),
    'dosis-respuesta': () => ejes + curva(x => 6 + 26 / (1 + Math.exp(-(x - 32) / 4))) + `<path d="M32 4V36" stroke="${T}" stroke-width=".8" stroke-dasharray="2 2"/>` + txt(40, 12, 'DE50', T, 5.5),
    'respuesta-meseta': () => ejes + lin([[8, 32], [34, 10], [56, 10]], A, 1.8) + pun([[12, 29], [20, 22], [28, 15], [38, 11], [48, 10], [54, 9]], T, 1.3),
    'superficie-respuesta': () => [14, 10, 6, 2.4].map((r, k) => `<ellipse cx="32" cy="20" rx="${r * 1.8}" ry="${r}" fill="${k === 3 ? A : 'none'}" stroke="${k % 2 ? A : T}" stroke-width=".9"/>`).join(''),
    'ascenso-pronunciado': () => [12, 8, 4].map(r => `<ellipse cx="44" cy="12" rx="${r * 1.6}" ry="${r}" fill="none" stroke="${T}" stroke-width=".7"/>`).join('') + `<path d="M10 34L42 13" stroke="${A}" stroke-width="2" stroke-linecap="round"/><path d="M37 13L42 13L40 18" fill="none" stroke="${A}" stroke-width="2"/>` + pun([[10, 34], [21, 27], [32, 20]], A, 2),
    'diseno-superficie': () => `<rect x="20" y="8" width="24" height="24" fill="none" stroke="${T}" stroke-width=".8"/>` + pun([[20, 8], [44, 8], [20, 32], [44, 32]], T, 2) + pun([[32, 2.5], [32, 37.5], [13, 20], [51, 20]], A, 2) + pun([[32, 20]], A, 2.6),
    mezclas: () => `<path d="M32 3L56 37H8Z" fill="${AS}" stroke="${T}" stroke-width="1"/>` + pun([[32, 3], [56, 37], [8, 37], [44, 20], [20, 20], [32, 37], [32, 25.5]], A, 1.8),
    deseabilidad: () => ejes + curva(x => 34 - 28 * Math.exp(-((x - 34) ** 2) / 90)) + `<path d="M34 6V36" stroke="${T}" stroke-dasharray="2 2" stroke-width=".8"/>` + txt(46, 10, 'D', T, 8),
    'ensayos-multiambiente': () => [[12, 20], [24, 14], [36, 24], [48, 12]].map(([x, y], i) => `<rect x="${x - 4}" y="${y}" width="8" height="${36 - y}" fill="${i === 3 ? A : AS}"/>`).join('') + ejes,
    'dos-etapas': () => ejes + [10, 26, 42].map(x => `<rect x="${x}" y="22" width="12" height="14" fill="${AS}" stroke="${T}" stroke-width=".5"/>`).join('') + `<path d="M16 22L32 8L48 22" fill="none" stroke="${A}" stroke-width="1.5"/>` + pun([[32, 8]], A, 2.4),
    estabilidad: () => ejes + lin([[8, 30], [56, 10]], T, 1) + lin([[8, 26], [56, 14]], A, 1.6) + lin([[8, 34], [56, 6]], T, 1, ' stroke-dasharray="3 2"'),
    ammi: () => `<path d="M32 4V36M8 20H56" stroke="${T}" stroke-width=".6" opacity=".6"/>` + pun([[20, 12], [44, 26], [26, 30], [48, 10]], T, 1.8) + [[52, 6], [12, 30], [40, 34]].map(([x, y]) => `<path d="M32 20L${x} ${y}" stroke="${A}" stroke-width="1.3"/>`).join(''),
    gge: () => `<path d="M12 10L40 4L54 22L36 36L10 28Z" fill="${AS}" stroke="${A}" stroke-width="1.2"/>` + pun([[12, 10], [40, 4], [54, 22], [36, 36], [10, 28], [30, 18], [38, 20]], T, 1.6),
    'potencia-medias': () => ejes + curva(x => 34 - 28 / (1 + Math.exp(-(x - 26) / 5))) + `<path d="M6 10H60" stroke="${T}" stroke-width=".7" stroke-dasharray="2 2"/>` + txt(14, 8, '0.80', T, 5.5),
    'potencia-anova': () => I['potencia-medias'](),
    'potencia-proporciones': () => I['potencia-medias'](),
    'potencia-correlacion': () => I['potencia-medias'](),
    repeticiones: () => [0, 1, 2, 3].map(k => `<rect x="${6 + k * 12}" y="${10 + (k % 2) * 4}" width="9" height="20" rx="1.5" fill="${k === 3 ? A : AS}" stroke="${T}" stroke-width=".6"/>`).join('') + txt(57, 24, 'r', T, 9),
    'tamano-muestra': () => [0, 1, 2, 3, 4].map(k => `<circle cx="${10 + k * 11}" cy="14" r="3.4" fill="${k < 3 ? A : AS}"/><path d="M${4 + k * 11} 32Q${10 + k * 11} 18 ${16 + k * 11} 32" fill="${k < 3 ? A : AS}"/>`).join(''),
    'muestreo-simple': () => Array.from({ length: 24 }, (_, i) => [8 + (i % 8) * 7, 8 + Math.floor(i / 8) * 11]).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${[3, 9, 14, 20].includes(i) ? A : 'none'}" stroke="${T}" stroke-width=".6"/>`).join(''),
    'muestreo-estratificado': () => `<path d="M6 13H58M6 25H58" stroke="${T}" stroke-width=".7" stroke-dasharray="2 2"/>` + I['muestreo-simple'](),
    'kaplan-meier': () => ejes + lin([[6, 6], [14, 6], [14, 11], [24, 11], [24, 17], [34, 17], [34, 24], [48, 24], [48, 29], [58, 29]], A, 1.7),
    cox: () => ejes + lin([[6, 6], [16, 6], [16, 10], [28, 10], [28, 14], [44, 14], [44, 18], [58, 18]], T, 1.3) + lin([[6, 6], [12, 6], [12, 13], [22, 13], [22, 22], [36, 22], [36, 30], [58, 30]], A, 1.7),
    autocorrelacion: () => ejes + [10, 16, 22, 28, 34, 40, 46, 52].map((x, i) => { const v = [24, 14, 8, 5, -4, 3, -2, 1][i]; return `<path d="M${x} 22V${22 - v * .6}" stroke="${i === 0 ? A : T}" stroke-width="2.4"/>`; }).join('') + `<path d="M6 16H60M6 28H60" stroke="${A}" stroke-width=".7" stroke-dasharray="2 2"/>`,
    descomposicion: () => curva(x => 20 + 6 * Math.sin((x - 8) / 4) - (x - 8) / 5, T, 1.2) + curva(x => 26 - (x - 8) / 5, A, 1.8),
    tendencia: () => ejes + lin([[8, 30], [14, 26], [20, 28], [26, 22], [32, 23], [38, 18], [44, 16], [50, 13], [56, 11]], T, 1.1) + lin([[8, 31], [56, 10]], A, 1.8),
    arima: () => ejes + lin([[8, 26], [14, 22], [20, 25], [26, 18], [32, 21], [38, 16]], T, 1.3) + `<path d="M38 16L56 8L56 26Z" fill="${AS}"/>` + lin([[38, 16], [56, 16]], A, 1.7, ' stroke-dasharray="3 2"'),
    manova: () => [['14', '24', 0], ['30', '14', 1], ['46', '22', 2]].map(([x, y, k]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" transform="rotate(-25 ${x} ${y})" fill="${k === 1 ? A : AS}" fill-opacity=".7" stroke="${T}" stroke-width=".6"/>`).join(''),
    discriminante: () => pun([[12, 12], [16, 18], [20, 10], [14, 24], [22, 20]], T, 1.8) + pun([[42, 22], [48, 28], [44, 32], [52, 20], [50, 34]], A, 1.8) + lin([[18, 38], [46, 2]], T, 1, ' stroke-dasharray="3 2"'),
    descriptivos: () => ejes + bar([10, 18, 26, 34, 42, 50], [6, 14, 24, 20, 10, 4], AS, 7) + curva(x => 36 - 24 * Math.exp(-((x - 30) ** 2) / 120), A, 1.5),
    frecuencias: () => ejes + bar([12, 24, 36, 48], [22, 14, 28, 9]),
    proporciones: () => `<circle cx="32" cy="20" r="15" fill="${AS}"/><path d="M32 20L32 5A15 15 0 1 1 18.8 27.2Z" fill="${A}"/>`,
    'bondad-ajuste': () => ejes + bar([12, 24, 36, 48], [12, 26, 20, 8], AS, 8) + lin([[16, 22], [28, 12], [40, 15], [52, 28]], A, 1.6),
  };
  /* los diseños mixtos y las variantes comparten la de su diseño */
  Object.assign(I, { 'mixto-bloques': I.dbca, 'mixto-divididas': I['parcelas-divididas'], 'mixto-latice': I.latice, 'mixto-localidades': I['ensayos-multiambiente'] });

  function svg(id) {
    const f = I[id];
    const cuerpo = f ? f() : ejes + pun(nube, T, 1.3);
    return `<svg class="cat-ilus" viewBox="0 0 64 40" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
  }
  SP.ilustraciones = { svg, ids: () => Object.keys(I) };
})();

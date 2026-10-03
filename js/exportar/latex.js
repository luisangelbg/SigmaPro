/* SigmaPro — cuadros en LaTeX con las reglas de revista del paquete booktabs (\toprule, \midrule, \bottomrule).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Cada cuadro sale como un entorno table con su leyenda («Cuadro N»), su etiqueta, las columnas de texto a la izquierda
   y las numéricas a la derecha, y las notas al pie en letra chica. Los caracteres especiales de LaTeX se escapan y los
   signos tipográficos (−, ≤, ×, χ, ², …) se escriben con sus órdenes, así que el texto compila con pdfLaTeX en UTF-8.

     SP.latex.cuadro(cuadro, { numero, visibles }) → texto de un entorno table
     SP.latex.documento([{ cuadro, numero }], { titulo }) → archivo .tex completo, listo para compilar
     SP.latex.escapar(texto) */
SP.definir('latex', function (SP) {
  'use strict';
  const T = SP.T;
  /* lo que va en modo matemático se agrupa: «χ²» → $\chi^{2}$ */
  const SIMBOLOS = {
    '−': '-', '≤': '\\le', '≥': '\\ge', '×': '\\times', '±': '\\pm', '·': '\\cdot', '∞': '\\infty', '≈': '\\approx', '≠': '\\neq',
    'χ': '\\chi', 'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta', 'ε': '\\varepsilon', 'η': '\\eta', 'θ': '\\theta',
    'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu', 'ν': '\\nu', 'π': '\\pi', 'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'φ': '\\varphi',
    'ψ': '\\psi', 'ω': '\\omega', 'Δ': '\\Delta', 'Σ': '\\Sigma', 'Ω': '\\Omega', '<': '<', '>': '>', '√': '\\surd',
    '²': '^{2}', '³': '^{3}', '¹': '^{1}', '⁰': '^{0}', 'ᵢ': '_{i}', '₀': '_{0}', '₁': '_{1}', '₂': '_{2}',
  };
  const TEXTO = { '\\': '\\textbackslash{}', '&': '\\&', '%': '\\%', '$': '\\$', '#': '\\#', '_': '\\_', '{': '\\{', '}': '\\}',
    '~': '\\textasciitilde{}', '^': '\\textasciicircum{}', '–': '--', '—': '---', '“': '``', '”': "''", ' ': '~' };
  function escapar(s) {
    let out = '', mat = '';
    const cerrar = () => { if (mat) { out += '$' + mat + '$'; mat = ''; } };
    for (const ch of String(s == null ? '' : s)) {
      if (SIMBOLOS[ch] !== undefined) { mat += (mat && /[a-zA-Z]$/.test(mat) && /^\\/.test(SIMBOLOS[ch]) ? ' ' : '') + SIMBOLOS[ch]; continue; }
      cerrar();
      out += TEXTO[ch] !== undefined ? TEXTO[ch] : ch;
    }
    cerrar();
    return out;
  }

  function cuadro(c, op) {
    op = op || {};
    const k = SP.formatos.celdas(c, op.visibles);
    const alineacion = k.numericas.map(n => (n ? 'r' : 'l')).join('');
    const linea = cells => '    ' + cells.map(escapar).join(' & ') + ' \\\\';
    const etiqueta = 'tab:' + (op.etiqueta || ('cuadro-' + (op.numero || 1)));
    const filas = [];
    k.filas.forEach((f, i) => { if (k.totales[i]) filas.push('    \\midrule'); filas.push(linea(f)); });
    return [
      '\\begin{table}[htbp]',
      '  \\centering',
      '  \\caption{' + escapar(c.titulo) + '}',
      '  \\label{' + etiqueta + '}',
      '  \\begin{tabular}{' + alineacion + '}',
      '    \\toprule',
      linea(k.cabecera),
      '    \\midrule',
      ...filas,
      '    \\bottomrule',
      '  \\end{tabular}',
      ...(c.notas && c.notas.length ? ['  \\par\\smallskip', '  {\\footnotesize ' + c.notas.map(escapar).join(' \\\\\n   ') + '\\par}'] : []),
      '\\end{table}',
    ].join('\n');
  }

  function documento(lista, op) {
    op = op || {};
    return [
      '% ' + T('Cuadros exportados de SigmaPro {v}. Compila con pdfLaTeX.', { v: SP.VERSION }),
      '\\documentclass[11pt]{article}',
      '\\usepackage[utf8]{inputenc}',
      '\\usepackage[T1]{fontenc}',
      '\\usepackage{booktabs}',
      '\\usepackage[margin=2.5cm]{geometry}',
      '\\renewcommand{\\tablename}{Cuadro}',
      '\\begin{document}',
      op.titulo ? '\\section*{' + escapar(op.titulo) + '}' : '',
      '',
      lista.map(x => cuadro(x.cuadro, { numero: x.numero, visibles: x.visibles })).join('\n\n'),
      '',
      '\\end{document}',
      '',
    ].join('\n');
  }

  SP.latex = { cuadro, documento, escapar };
});

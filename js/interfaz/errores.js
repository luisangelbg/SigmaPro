/* SigmaPro — los errores, en palabras (hito 5.7).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Un solo recuadro para lo que no se pudo calcular, en Análisis, Explorar y el reporte: qué pasó, qué hacer y, cuando
   hace falta, el detalle técnico aparte (plegado, con «Copiar el detalle»).
     · Un error de los métodos (SP.ErrorSP) ya dice qué pasó en palabras; si no trae cómo resolverlo, se sugiere según
       lo que dice (una columna que debe ser numérica, una que ya no existe, una en dos papeles, pocos datos…).
     · Un error de R (el motor R: SP.ErrorSP con el texto de R en .r) se traduce si es uno de los conocidos de lme4,
       nlme o del modelo (un factor con un solo nivel, un efecto aleatorio sin repeticiones, un modelo que no
       converge…); el texto de R queda en el detalle.
     · Cualquier otro error es del programa, no de los datos: lo dice así, sugiere qué probar y deja el detalle para
       reportarlo.

     SP.errores.html(err, { titulo })   el recuadro
     SP.errores.explicar(err)           { titulo, mensaje, arreglo, detalle, tipo: 'datos' | 'r' | 'programa' } */
(function () {
  'use strict';
  const T = SP.T, esc = SP.ui.esc;

  /* qué hacer, según lo que dice un mensaje sin arreglo */
  const SUGERENCIAS = () => [
    [/debe(n)? ser num[ée]ric|must be numeric/i, T('Si sus valores son números, cámbiale el tipo a numérica en Datos; si no, elige otra columna.')],
    [/no existe la columna|no se encontró la columna|column .* does not exist/i, T('La tabla cambió desde que se eligieron las variables: vuelve a elegirlas.')],
    [/en dos papeles|in two roles/i, T('Cada columna va en un solo papel: quítala de uno de los dos.')],
    [/hacen? falta(n)? al menos|se necesita(n)? al menos|at least \d/i, T('Revisa los faltantes y el filtro de Datos: quizá quedaron menos datos de los que esperabas.')],
    [/un solo nivel|only one level/i, T('Con el filtro o con los faltantes quedó un solo nivel: revisa los datos o quita ese factor.')],
    [/faltante|missing/i, T('Revisa en Datos las celdas vacías de las columnas que usa el análisis.')],
  ];
  /* errores conocidos de R (lme4, nlme y el modelo) */
  const DE_R = () => [
    [/contrasts can be applied only to factors with 2 or more levels/i, T('Un factor tiene un solo nivel con estos datos.'), T('Revisa el filtro y los faltantes de Datos, o quita ese factor del modelo.')],
    [/number of levels of each grouping factor must be < number of observations/i, T('Un efecto aleatorio tiene tantos niveles como observaciones: no hay repeticiones dentro de cada nivel.'), T('Quita ese efecto aleatorio o úsalo como efecto fijo.')],
    [/grouping factors must have > 1 sampled level/i, T('Un efecto aleatorio tiene un solo nivel con estos datos.'), T('Un efecto aleatorio necesita varios niveles (varios bloques, varias localidades): quítalo o revisa el filtro.')],
    [/response is constant/i, T('La respuesta vale lo mismo en todas las observaciones.'), T('Elige otra variable de respuesta o revisa el filtro.')],
    [/Downdated VtV is not positive definite|pwrssUpdate did not converge|PIRLS (step-halvings )?failed|step-halvings failed/i, T('El modelo no se pudo ajustar: es demasiado complejo para estos datos.'), T('Quita un término o un efecto aleatorio, o junta niveles con muy pocos datos.')],
    [/Singularity in backsolve|singular convergence|false convergence|iteration limit reached|maximum number of iterations.*reached|did not converge|failed to converge/i, T('El ajuste del modelo no convergió.'), T('Simplifica el modelo (menos términos o una estructura de covarianza más sencilla) o revisa los datos extremos.')],
    [/0 \(non-NA\) cases|NA\/NaN\/Inf in|no valid set of coefficients/i, T('Con los faltantes, no quedaron datos válidos para el modelo.'), T('Revisa en Datos las celdas vacías de las columnas que usa el análisis.')],
    [/object '([^']+)' not found/i, T('R no encontró una de las columnas.'), T('La tabla cambió desde que se eligieron las variables: vuelve a elegirlas.')],
    [/Invalid grouping factor specification/i, T('Un efecto aleatorio no es un factor válido (tiene faltantes o un solo valor).'), T('Revisa esa columna en Datos.')],
  ];

  /** El error, explicado. */
  function explicar(err) {
    const e = err || {};
    if (e.r) {
      const t = DE_R().find(([re]) => re.test(String(e.r)));
      return { tipo: 'r', titulo: T('R no pudo terminar el cálculo'), mensaje: t ? t[1] : T('El motor R devolvió un error con estos datos y este modelo.'),
        arreglo: (t && t[2]) || e.arreglo || T('Revisa el modelo (quita un término o un efecto aleatorio) y los faltantes de los datos.'), detalle: String(e.r) };
    }
    if (e instanceof SP.ErrorSP || (e.arreglo !== undefined && e.message)) {
      const s = !e.arreglo && SUGERENCIAS().find(([re]) => re.test(e.message));
      return { tipo: 'datos', titulo: T('No se puede calcular así'), mensaje: e.message, arreglo: e.arreglo || (s ? s[1] : ''), detalle: '' };
    }
    const pila = e.stack ? String(e.stack).split('\n').slice(0, 3).join('\n') : '';
    return { tipo: 'programa', titulo: T('Algo falló en el programa'), mensaje: T('No es un problema de tus datos: el programa encontró un error al calcular.'),
      arreglo: T('Cambia alguna opción o recarga la página; si se repite, avísanos con «Reportar un problema», en el encabezado, y pega el detalle técnico.'),
      detalle: pila || String(e.message || e) };
  }
  /** El recuadro; op.titulo cambia el título (el reporte dice de qué análisis se trata). */
  function html(err, op) {
    const x = explicar(err);
    const titulo = (op && op.titulo) || x.titulo;
    return `<div class="msg msg-error sp-error" data-error-tipo="${x.tipo}"><p class="sp-error-t"><strong>${esc(titulo)}</strong></p>` +
      `<p class="sp-error-m">${esc(x.mensaje)}</p>` +
      (x.arreglo ? `<p class="sp-error-a"><b>${esc(T('Qué hacer:'))}</b> ${esc(x.arreglo)}</p>` : '') +
      (x.detalle ? `<details class="sp-error-d"><summary>${esc(T('Detalle técnico'))}</summary><pre>${esc(x.detalle)}</pre>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-error-copiar>${esc(T('Copiar el detalle'))}</button></details>` : '') + '</div>';
  }

  if (typeof document !== 'undefined') document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-error-copiar]');
    if (!b) return;
    const pre = b.closest('.sp-error-d') && b.closest('.sp-error-d').querySelector('pre');
    if (!pre) return;
    const ok = SP.cuadros && SP.cuadros.copiar ? SP.cuadros.copiar(pre.textContent) : false;
    Promise.resolve(ok).then(v => { if (window.LABG && window.LABG.toast) window.LABG.toast(v ? T('Detalle copiado.') : T('No se pudo copiar.'), { type: v ? 'success' : 'warning' }); });
  });
  SP.errores = { html, explicar };
})();

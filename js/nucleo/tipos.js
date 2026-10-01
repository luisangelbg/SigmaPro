/* SigmaPro — tipos de columna: inferencia con explicación, conversión y fechas.
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

   Tipos: 'numerica' · 'factor' · 'fecha' · 'texto' · 'id' (identificador de la unidad,
   no entra a los análisis).

   La inferencia explica siempre su decisión, porque la más delicada (un número entero
   que en realidad es un factor: bloque 1, 2, 3, 4) cambia por completo el análisis.

     SP.tipos.inferir(nombre, valores)  → { tipo, razon, niveles? }
     SP.tipos.fecha(texto)              → días desde 1970-01-01 (UTC) o NaN
     SP.tipos.textoFecha(dias)          → 'AAAA-MM-DD[ HH:MM:SS]'
     SP.tipos.ordenarNiveles(lista)     → orden natural (numérico si todos son números) */
SP.definir('tipos', function (SP) {
  'use strict';
  const T = SP.T;

  const NOMBRE_FACTOR = /^(bloques?|blocks?|rep|reps|repetici[oó]n(es)?|trat|tratamientos?|tto|variedad(es)?|var|genotipos?|geno|h[ií]bridos?|cultivar(es)?|l[ií]neas?|ambientes?|localidad(es)?|loc|sitios?|a[nñ]os?|ciclos?|[eé]pocas?|filas?|hileras?|columnas?|col|grupos?|lotes?|niveles?|fuentes?|especies?|accesi[oó]n|poblaci[oó]n|sexo|raza|manejo|riego|labranza|fertilizantes?|densidad|fecha_?siembra|parcela_?grande|subparcelas?|rows?|cols?|columns?|anios?)([ _.-]\w*|\d+)?$/i;
  /* en los dos patrones el sufijo va separado o es un número: «bloque_2», «id_planta», «parcela 3», «no.»,
     pero no «color», «variable», «idioma», «nota» ni «nitrogeno» */
  const NOMBRE_ID = /^(id|ident\w*|clave|folio|n[°º]|no\.|nro\.?|num\.?|n[uú]mero|parcelas?|unidad(es)?|plantas?|muestras?|sample|plot)([ _.-]\w*|\d+)?$/i;

  /* ---------------- fechas ---------------- */
  const DIA_MS = 86400000;
  function fecha(v) {
    if (v === null || v === undefined) return NaN;
    const s = String(v).trim();
    let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
    if (m) return construir(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    /* día/mes/año (la convención en México); con año de dos dígitos se asume 19xx o 20xx */
    m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
    if (m) {
      let a = +m[3];
      if (m[3].length === 2) a += a < 70 ? 2000 : 1900;
      return construir(a, +m[2], +m[1], 0, 0, 0);
    }
    return NaN;
  }
  function construir(a, mes, d, h, mi, se) {
    if (mes < 1 || mes > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || se > 59) return NaN;
    const ms = Date.UTC(a, mes - 1, d, h, mi, se);
    const x = new Date(ms);
    if (x.getUTCMonth() !== mes - 1 || x.getUTCDate() !== d) return NaN;   // 31 de abril, etc.
    return ms / DIA_MS;
  }
  const dos = v => (v < 10 ? '0' : '') + v;
  function textoFecha(dias) {
    if (!Number.isFinite(dias)) return '';
    const d = new Date(Math.round(dias * DIA_MS / 1000) * 1000);
    const f = d.getUTCFullYear() + '-' + dos(d.getUTCMonth() + 1) + '-' + dos(d.getUTCDate());
    const s = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
    return s ? f + ' ' + dos(d.getUTCHours()) + ':' + dos(d.getUTCMinutes()) + ':' + dos(d.getUTCSeconds()) : f;
  }

  /* ---------------- niveles ---------------- */
  function ordenarNiveles(lista, modo) {
    const unicos = [...new Set(lista.filter(v => v !== null && v !== undefined && v !== '').map(String))];
    if (modo === 'aparicion') return unicos;
    const nums = unicos.map(Number);
    if (unicos.length && nums.every(x => !Number.isNaN(x))) return unicos.slice().sort((a, b) => Number(a) - Number(b));
    if (modo === 'alfabetico') return unicos.slice().sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
    return unicos;   // por omisión: orden de aparición (como se capturaron)
  }

  /* ---------------- inferencia ---------------- */
  const esFaltante = v => v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v));

  /**
   * Tipo más probable de una columna. valores: números, textos o null (faltante).
   * Los textos que ya vienen como número (de una hoja de cálculo o de SP.csv) cuentan como número.
   */
  function inferir(nombre, valores) {
    const vals = valores.filter(v => !esFaltante(v));
    const n = vals.length;
    const nom = String(nombre || '').trim();
    if (!n) return { tipo: 'numerica', razon: T('La columna está vacía; se deja como numérica.') };
    const numericos = vals.every(v => typeof v === 'number');
    if (numericos) {
      const distintos = new Set(vals).size;
      const enteros = vals.every(v => Number.isInteger(v));
      if (enteros && NOMBRE_ID.test(nom) && distintos === n) {
        return { tipo: 'id', razon: T('Cada fila tiene un número distinto y el nombre «{c}» indica un identificador; no entra a los análisis.', { c: nom }) };
      }
      if (enteros && distintos <= 30 && distintos < n && NOMBRE_FACTOR.test(nom)) {
        return {
          tipo: 'factor', niveles: ordenarNiveles(vals.map(String)),
          razon: T('Son códigos enteros con {k} valores repetidos y el nombre «{c}» indica un factor (no una medición).', { k: distintos, c: nom }),
        };
      }
      if (enteros && distintos <= 10 && distintos * 2 <= n) {
        return { tipo: 'numerica', razon: T('Son números, pero solo hay {k} valores distintos repetidos: si son códigos de grupo, cámbiala a factor.', { k: distintos }), sugerencia: 'factor' };
      }
      return { tipo: 'numerica', razon: T('Todos los valores son números.') };
    }
    /* sobre todo números con algunos textos sueltos («perdida», «muerta»): es una medición */
    const nNum = vals.filter(v => typeof v === 'number').length;
    if (nNum >= 0.8 * n && nNum < n) {
      const raros = [...new Set(vals.filter(v => typeof v !== 'number').map(String))];
      return {
        tipo: 'numerica', textosComoFaltantes: raros,
        razon: T('{m} de {n} celdas son números; {k} con texto ({t}) se tomarán como faltantes.',
          { m: nNum, n, k: n - nNum, t: raros.slice(0, 3).map(s => '«' + s + '»').join(', ') + (raros.length > 3 ? '…' : '') }),
      };
    }
    const textos = vals.map(String);
    if (textos.every(s => !Number.isNaN(fecha(s)))) {
      return { tipo: 'fecha', razon: T('Todos los valores son fechas (AAAA-MM-DD o DD/MM/AAAA).') };
    }
    const distintos = new Set(textos).size;
    if (distintos === n) {
      if (textos.every(t => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]{1,4}[-_ .]?\d+$/.test(t.trim()))) {
        return { tipo: 'id', razon: T('Cada fila tiene un código distinto ({e}…): parece un identificador; no entra a los análisis.', { e: textos.slice(0, 2).join(', ') }) };
      }
      if (NOMBRE_ID.test(nom) || n > 30) {
        return { tipo: 'id', razon: T('Cada fila tiene un valor distinto: parece un identificador; no entra a los análisis.') };
      }
      return { tipo: 'texto', razon: T('Son textos sin valores repetidos.') };
    }
    const numerosComoTexto = textos.filter(s => !Number.isNaN(SP.csv.aNumero(s, '.')) || !Number.isNaN(SP.csv.aNumero(s, ','))).length;
    const razon = numerosComoTexto && numerosComoTexto < n
      ? T('Mezcla números y textos ({m} de {n} celdas son números): se trata como factor. Si es una medición, revisa las celdas con texto.', { m: numerosComoTexto, n })
      : T('Son textos con {k} valores que se repiten: es un factor.', { k: distintos });
    return { tipo: 'factor', niveles: ordenarNiveles(textos), razon };
  }

  /** Convierte valores crudos a la forma interna de un tipo. Devuelve { datos, fallidos }. */
  function convertir(valores, tipo, op) {
    op = op || {};
    const decimal = op.decimal || '.';
    const faltantes = new Set(op.faltantes || ['', 'NA', 'NaN', '.', 'N/A']);
    const falta = v => esFaltante(v) || (typeof v === 'string' && faltantes.has(v.trim()));
    let fallidos = 0;
    if (tipo === 'numerica' || tipo === 'fecha') {
      const d = new Float64Array(valores.length);
      valores.forEach((v, i) => {
        if (falta(v)) { d[i] = NaN; return; }
        let x;
        if (tipo === 'numerica') x = typeof v === 'number' ? v : SP.csv.aNumero(v, decimal);
        else x = typeof v === 'number' ? v : fecha(v);
        if (Number.isNaN(x)) fallidos++;
        d[i] = x;
      });
      return { datos: d, fallidos };
    }
    const d = valores.map(v => {
      if (falta(v)) return null;
      if (typeof v === 'number') return numeroATexto(v);
      return String(v).trim();
    });
    return { datos: d, fallidos };
  }

  /** Número → texto más corto que lo reproduce (sin notación rara para números comunes). */
  function numeroATexto(x) {
    if (!Number.isFinite(x)) return x === Infinity ? 'Inf' : x === -Infinity ? '-Inf' : '';
    return String(Number(x.toPrecision(15)));   // 15 cifras, como as.character() de R: 0.1 + 0.2 → «0.3»
  }

  SP.tipos = { inferir, convertir, fecha, textoFecha, ordenarNiveles, numeroATexto, NOMBRE_FACTOR, NOMBRE_ID };
});

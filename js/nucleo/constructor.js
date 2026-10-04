/* SigmaPro — constructor de modelos: de los papeles asignados a las variables al método y su fórmula, y la lectura de
   una fórmula escrita a mano con la explicación de cada término (o de su error).
   Copyright (C) 2026  Luis Ángel Barrera-Guzmán · GPL-3.0-or-later (ver LICENSE).

     SP.constructorModelos.modelo({ respuesta, factores, bloques, parcelaGrande, covariables, aleatorios, familia }, info)
        → { metodo, e, op, formula, error, descripcion: [], avisos: [] }
     SP.constructorModelos.interpretar(respuesta, derecha, info, comoFactor)
        → { ok, terminos: [{ etiqueta, explicacion }], mensaje, arreglo }
   Los papeles eligen el diseño: sin bloques, completamente al azar; un bloque, bloques al azar; dos (filas y
   columnas), cuadro latino; con parcela grande, divididas o subdivididas; con covariables, ANCOVA; solo covariables,
   regresión. Lo que no es un diseño del catálogo (más de tres factores, covariables con parcelas…) va al modelo lineal
   general con la fórmula equivalente. Con efectos aleatorios (bloques, localidades o años como muestra de muchos
   posibles), el modelo lineal mixto (motor R); con una respuesta de conteo o positiva y asimétrica, el modelo lineal
   generalizado (Poisson o gamma), mixto si además hay aleatorios. Con parcela grande y un bloque aleatorio, el error de
   las parcelas grandes es (1 | bloque:parcela). Módulo puro: se prueba en node (tests/unidad/asistente.test.js). */
SP.definir('constructor-modelos', function (SP) {
  'use strict';
  const T = SP.T;
  const q = n => (/^[\p{L}_.][\p{L}\p{N}_.]*$/u.test(n) ? n : '`' + n + '`');
  const lista = v => [].concat(v || []).filter(Boolean);

  function general(rol, info, avisos, descripcion) {
    const partes = [...rol.bloques.map(q), ...rol.covariables.map(q)];
    if (rol.factores.length) partes.push(rol.factores.map(q).join(' * '));
    const derecha = partes.join(' + ') || '1';
    const comoFactor = rol.factores.concat(rol.bloques).filter(v => info.numericas.includes(v));
    return { metodo: 'modelo-lineal', e: { respuesta: rol.respuesta }, op: { derecha, comoFactor, tipoSC: 3 }, formula: `${q(rol.respuesta)} ~ ${derecha}`, descripcion, avisos };
  }

  /** Efectos aleatorios o respuesta no normal: modelo mixto, generalizado o generalizado mixto. */
  function fase2(rol, info, avisos, descripcion, falla) {
    const fijos = [...rol.bloques.map(q), ...rol.covariables.map(q)];
    if (rol.factores.length) fijos.push(rol.factores.map(q).join(' * '));
    const aleat = rol.aleatorios.map(a => `(1 | ${q(a)})`);
    if (rol.parcelaGrande) {
      const b = rol.aleatorios[0];
      if (!b) return falla(T('Con parcelas grandes y esta respuesta, el bloque va en «Efectos aleatorios».'), T('Pon el bloque en «Efectos aleatorios»: el error de las parcelas grandes será (1 | bloque:parcela).'));
      aleat.push(`(1 | ${q(b)}:${q(rol.parcelaGrande)})`);
      descripcion.push(T('Parcelas divididas como modelo mixto: «{b}» y las parcelas grandes «{b}:{p}» son aleatorios.', { b, p: rol.parcelaGrande }));
    }
    const derecha = (fijos.join(' + ') || '1') + (aleat.length ? ' + ' + aleat.join(' + ') : '');
    const comoFactor = rol.factores.concat(rol.bloques, rol.aleatorios).filter(v => info.numericas.includes(v));
    const formula = `${q(rol.respuesta)} ~ ${derecha}`, e = { respuesta: rol.respuesta };
    if (rol.familia === 'normal') {
      descripcion.push(T('Modelo lineal mixto con {a} como efecto aleatorio (REML; corre en el motor R).', { a: rol.aleatorios.map(v => '«' + v + '»').join(', ') }));
      return { metodo: 'modelo-mixto', e, op: { derecha, comoFactor, tipoSC: 3 }, formula, descripcion, avisos };
    }
    if (rol.familia === 'gamma' && rol.aleatorios.length) return falla(T('La familia gamma con efectos aleatorios no está en SigmaPro.'), T('Quita los efectos aleatorios o elige la distribución normal.'));
    if (rol.aleatorios.length) {
      descripcion.push(T('Modelo lineal generalizado mixto de Poisson con {a} aleatorio (corre en el motor R).', { a: rol.aleatorios.map(v => '«' + v + '»').join(', ') }));
      return { metodo: 'glmm', e, op: { derecha, comoFactor, familia: 'poisson', sobredispersion: 'auto', tipo: 2 }, formula, descripcion, avisos };
    }
    descripcion.push(rol.familia === 'conteo' ? T('Modelo lineal generalizado de Poisson (conteos).') : T('Modelo lineal generalizado gamma (respuesta positiva y asimétrica).'));
    return { metodo: 'glm', e, op: { derecha, comoFactor, familia: rol.familia === 'conteo' ? 'poisson' : 'gamma', tipo: 2 }, formula, descripcion, avisos };
  }

  function modelo(r, info) {
    const rol = { respuesta: r.respuesta || '', factores: lista(r.factores), bloques: lista(r.bloques), covariables: lista(r.covariables), parcelaGrande: r.parcelaGrande || '',
      aleatorios: lista(r.aleatorios), familia: ['conteo', 'gamma'].includes(r.familia) ? r.familia : 'normal' };
    const avisos = [], descripcion = [];
    const falla = (mensaje, arreglo) => ({ metodo: null, error: { mensaje, arreglo }, formula: '', descripcion, avisos });
    if (!rol.respuesta) return falla(T('Falta la respuesta.'), T('Pon en «Respuesta» la variable que mediste.'));
    if (rol.parcelaGrande && !rol.factores.includes(rol.parcelaGrande)) rol.parcelaGrande = '';
    if (!rol.factores.length && !rol.covariables.length) return falla(T('Faltan factores o covariables.'), T('Pon al menos un factor de tratamiento o una covariable.'));
    if (rol.bloques.length > 2) return falla(T('Hasta dos variables de bloqueo (filas y columnas).'), '');
    if (rol.aleatorios.length || rol.familia !== 'normal') return fase2(rol, info, avisos, descripcion, falla);
    /* solo covariables: regresión */
    if (!rol.factores.length) {
      if (rol.bloques.length) { descripcion.push(T('Covariables con bloques: modelo lineal general.')); return general(rol, info, avisos, descripcion); }
      descripcion.push(rol.covariables.length > 1 ? T('Regresión lineal múltiple de «{y}».', { y: rol.respuesta }) : T('Regresión lineal simple de «{y}» sobre «{x}».', { y: rol.respuesta, x: rol.covariables[0] }));
      return { metodo: 'regresion-lineal', e: { respuesta: rol.respuesta, predictores: rol.covariables }, op: {}, formula: `${q(rol.respuesta)} ~ ${rol.covariables.map(q).join(' + ')}`, descripcion, avisos };
    }
    /* covariables con factores: ANCOVA */
    if (rol.covariables.length) {
      if (!rol.parcelaGrande && rol.bloques.length <= 1 && rol.factores.length <= 2 && rol.covariables.length <= 2) {
        const e = Object.assign({ respuesta: rol.respuesta, tratamientos: rol.factores, covariables: rol.covariables }, rol.bloques.length ? { bloque: rol.bloques[0] } : {});
        descripcion.push(T('Análisis de covarianza: los tratamientos ajustados por {c}.', { c: rol.covariables.join(', ') }));
        return { metodo: 'ancova', e, op: { tipoSC: 3, metodo: 'tukey' }, formula: SP.ancova.formulaDe(e), descripcion, avisos };
      }
      avisos.push(T('Esta combinación de covariables, bloques y parcelas no es un diseño del catálogo: se usa el modelo lineal general (sin estratos de error).'));
      return general(rol, info, avisos, descripcion);
    }
    /* parcelas divididas y subdivididas */
    if (rol.parcelaGrande) {
      const resto = rol.factores.filter(f => f !== rol.parcelaGrande);
      if (!rol.bloques.length) return falla(T('Las parcelas grandes necesitan bloques o repeticiones.'), T('Pon en «Bloques» la columna del bloque (o de la repetición de cada parcela grande).'));
      if (rol.factores.length === 2) {
        const e = { respuesta: rol.respuesta, parcelaGrande: rol.parcelaGrande, subparcela: resto[0] };
        if (rol.bloques.length === 2) Object.assign(e, { principal: 'latino', fila: rol.bloques[0], columna: rol.bloques[1] });
        else Object.assign(e, { principal: 'dbca', bloque: rol.bloques[0] });
        const m = SP.disenos.modeloDe('parcelas-divididas', e);
        descripcion.push(T('Parcelas divididas: «{a}» en las parcelas grandes, «{b}» en las subparcelas; cada uno con su error.', { a: rol.parcelaGrande, b: resto[0] }));
        return { metodo: 'parcelas-divididas', e, op: {}, formula: `${m.formula} + Error(${m.error})`, descripcion, avisos };
      }
      if (rol.factores.length === 3 && rol.bloques.length === 1) {
        const e = { respuesta: rol.respuesta, parcelaGrande: rol.parcelaGrande, subparcela: resto[0], subsubparcela: resto[1], bloque: rol.bloques[0] };
        const m = SP.disenos.modeloDe('parcelas-subdivididas', e);
        descripcion.push(T('Parcelas subdivididas: «{a}», luego «{b}» y luego «{c}», en el orden de los factores.', { a: rol.parcelaGrande, b: resto[0], c: resto[1] }));
        return { metodo: 'parcelas-subdivididas', e, op: {}, formula: `${m.formula} + Error(${m.error})`, descripcion, avisos };
      }
      return falla(T('Las parcelas grandes piden 2 factores (divididas) o 3 en bloques (subdivididas).'), T('Quita la parcela grande o ajusta los factores.'));
    }
    if (rol.factores.length > 3) { avisos.push(T('Más de tres factores: se usa el modelo lineal general.')); return general(rol, info, avisos, descripcion); }
    if (rol.bloques.length === 2) {
      if (rol.factores.length > 2) { avisos.push(T('El cuadro latino admite hasta dos factores: se usa el modelo lineal general.')); return general(rol, info, avisos, descripcion); }
      const e = { respuesta: rol.respuesta, tratamientos: rol.factores, fila: rol.bloques[0], columna: rol.bloques[1] };
      descripcion.push(T('Cuadro latino: «{f}» y «{c}» bloquean en dos direcciones.', { f: rol.bloques[0], c: rol.bloques[1] }));
      return { metodo: 'cuadro-latino', e, op: { tipoSC: 3 }, formula: SP.disenos.modeloDe('cuadro-latino', e).formula, descripcion, avisos };
    }
    if (rol.bloques.length === 1) {
      const e = { respuesta: rol.respuesta, tratamientos: rol.factores, bloque: rol.bloques[0] };
      descripcion.push(rol.factores.length > 1 ? T('Factorial en bloques completos al azar: {f} cruzados.', { f: rol.factores.join(' × ') }) : T('Bloques completos al azar.'));
      return { metodo: 'dbca', e, op: { tipoSC: 3 }, formula: SP.disenos.modeloDe('dbca', e).formula, descripcion, avisos };
    }
    const e = { respuesta: rol.respuesta, tratamientos: rol.factores };
    descripcion.push(rol.factores.length > 1 ? T('Factorial completamente al azar: {f} cruzados.', { f: rol.factores.join(' × ') }) : T('Completamente al azar.'));
    return { metodo: 'dca', e, op: { tipoSC: 3 }, formula: SP.disenos.modeloDe('dca', e).formula, descripcion, avisos };
  }

  /** Lee una fórmula escrita y explica cada término; si no se puede, el error y cómo arreglarlo. */
  function interpretar(respuesta, derecha, info, comoFactor) {
    comoFactor = lista(comoFactor);
    let form, aleat = [];
    /* los efectos aleatorios, como (1 | bloque), se separan y se explican aparte */
    if (/\|/.test(derecha || '') && SP.mixtos) {
      try { const sep = SP.mixtos.separar(derecha); derecha = sep.fijos || '1'; aleat = sep.aleatorios; }
      catch (err) { return { ok: false, mensaje: err.message, arreglo: err.arreglo || '' }; }
    }
    try { form = SP.modeloLineal.leerFormula(respuesta, derecha); }
    catch (err) { return { ok: false, mensaje: err.message, arreglo: err.arreglo || '' }; }
    const columnas = info.numericas.concat(info.factores).concat(info.otras || []);
    const falta = form.variables.find(v => !columnas.includes(v));
    if (falta) return { ok: false, mensaje: T('No hay una columna «{c}».', { c: falta }), arreglo: T('Revisa el nombre; los que llevan espacios van entre `comillas invertidas`.') };
    if (form.terminos.some(x => x.variables.includes(respuesta))) return { ok: false, mensaje: T('La respuesta «{r}» no puede estar a la derecha de «~».', { r: respuesta }), arreglo: '' };
    const esFactor = v => !info.numericas.includes(v) || comoFactor.includes(v);
    const principales = new Set(form.terminos.filter(x => x.variables.length === 1).map(x => x.variables[0]));
    const terminos = form.terminos.map(x => {
      const vs = x.variables, et = vs.join(' × ');
      if (vs.length === 1) return { etiqueta: vs[0], explicacion: esFactor(vs[0]) ? T('efecto de «{v}» (factor)', { v: vs[0] }) : T('pendiente de «{v}» (covariable)', { v: vs[0] }) };
      const num = vs.filter(v => !esFactor(v)), fac = vs.filter(esFactor);
      if (num.length === 1 && fac.length) return { etiqueta: et, explicacion: T('una pendiente de «{v}» distinta para cada nivel de {f}', { v: num[0], f: fac.join(' × ') }) };
      if (num.length > 1) return { etiqueta: et, explicacion: T('producto de covariables (superficie)') };
      const anidado = vs.filter(v => !principales.has(v));
      if (anidado.length === 1) return { etiqueta: et, explicacion: T('«{b}» anidado en {a}', { b: anidado[0], a: vs.filter(v => v !== anidado[0]).join(' × ') }) };
      return { etiqueta: et, explicacion: T('interacción: el efecto de un factor cambia con el nivel del otro') };
    });
    for (const a of aleat) {
      const falta2 = a.variables.concat(a.agrupan).find(v => !columnas.includes(v));
      if (falta2) return { ok: false, mensaje: T('No hay una columna «{c}».', { c: falta2 }), arreglo: T('Revisa el nombre; los que llevan espacios van entre `comillas invertidas`.') };
      terminos.push({ etiqueta: a.texto, explicacion: a.expr === '1' ? T('efecto aleatorio de «{g}»: una varianza en lugar de un efecto por nivel', { g: a.grupos }) : T('{e} aleatorio dentro de «{g}» (pendientes que varían por grupo)', { e: a.expr, g: a.grupos }) });
    }
    return { ok: true, terminos, intercepto: form.intercepto, variables: [...new Set(form.variables.concat(...aleat.map(a => a.variables.concat(a.agrupan))))], aleatorios: aleat.length };
  }

  SP.constructorModelos = { modelo, interpretar };
});

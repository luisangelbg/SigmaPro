/* Pruebas de potencia y tamaño de muestra (js/nucleo/potencia.js y js/metodos/potencia.js): la F no central contra
   valores de pf de R, la ida y vuelta (el n calculado da la potencia pedida), el lazo de Cochran y Cox, los mensajes de
   error, el reporte, el código R y el párrafo. Los números contra R están en tests/casos/potencia. */
SPT.describir('Potencia · núcleo', () => {
  SPT.caso('F no central igual a pf(q, gl1, gl2, ncp) de R', () => {
    const P = SP.potencia;
    SPT.cerca(P.pfnc(2.5, 3, 12, 5, false), 0.49471444441978357, 1e-13);
    SPT.cerca(P.pfnc(1.2, 4, 30, 0.7, true), 0.58594923438590185, 1e-13);
    SPT.cerca(P.pfnc(6, 2, 8, 25, false), 0.90756614812205239, 1e-13);
    SPT.cerca(P.pfnc(3.1, 5, 40, 60, false), 0.99992730099647775, 1e-13);
    SPT.cerca(P.pfnc(2, 3, 10, 0, false), SP.dist.pf(2, 3, 10, false), 1e-15, 'sin no centralidad es la F central');
  });
  SPT.caso('Ida y vuelta: con el n calculado se obtiene la potencia pedida', () => {
    const P = SP.potencia;
    const t = P.potenciaT({ calcular: 'n', diferencia: 1.5, de: 2.1, alfa: 0.05, potencia: 0.8, tipo: 'dos', alternativa: 'bilateral' });
    SPT.cerca(P.potenciaT({ calcular: 'potencia', n: t.n, diferencia: 1.5, de: 2.1, alfa: 0.05, tipo: 'dos', alternativa: 'bilateral' }).potencia, 0.8, 1e-4);
    const a = P.potenciaAnova({ calcular: 'n', grupos: 4, varEntre: 0.3, varDentro: 0.64, alfa: 0.05, potencia: 0.9 });
    SPT.cerca(P.potenciaAnova({ calcular: 'potencia', grupos: 4, n: a.n, varEntre: 0.3, varDentro: 0.64, alfa: 0.05 }).potencia, 0.9, 1e-4);
    SPT.afirmar(t.curva.potencia.every((v, i, x) => i === 0 || v >= x[i - 1] - 1e-12), 'la curva de potencia crece con n');
  });
  SPT.caso('Cochran y Cox: más CV pide más repeticiones; la respuesta cumple la desigualdad', () => {
    const P = SP.potencia, base = { diferencia: 15, tratamientos: 6, alfa: 0.05, potencia: 0.8, diseno: 'dbca' };
    const a = P.repeticiones(Object.assign({ cv: 8 }, base)), b = P.repeticiones(Object.assign({ cv: 16 }, base));
    SPT.afirmar(b.repeticiones > a.repeticiones, a.repeticiones + ' / ' + b.repeticiones);
    SPT.afirmar(a.repeticiones >= a.requeridas && (a.iteraciones.length === 1 || a.iteraciones[a.iteraciones.length - 2].r < a.iteraciones[a.iteraciones.length - 2].requeridas));
  });
});

SPT.describir('Potencia · métodos', () => {
  SPT.caso('Sin datos: reporte, código R y párrafo de cada método', () => {
    const ids = { 'potencia-medias': 'power.t.test', 'potencia-anova': 'power.anova.test', 'potencia-proporciones': 'power.prop.test', 'potencia-correlacion': 'pwr.r.test', repeticiones: 'qt(potencia' };
    for (const [id, fn] of Object.entries(ids)) {
      const f = SP.metodos[id], op = SP.opcionesCon(f, {}), r = SP.ejecutar(id, null, {}, op).resultado, rep = f.reporte(r);
      SPT.afirmar(rep.conclusiones.length && rep.cuadros.length, id);
      SPT.afirmar(f.codigoR({}, op, { resultado: r }).includes(fn), id + ': ' + fn);
      const p = SP.informe.parrafo(id, r, rep, {}, op);
      SPT.afirmar(/Cohen, 1988|Cochran y Cox, 1957/.test(p.metodos), id + ': ' + p.metodos);
    }
    const an = SP.ejecutar('potencia-anova', null, {}, SP.opcionesCon(SP.metodos['potencia-anova'], { medias: '4.2, 4.8, 5.1, 5.6', de: 0.6 })).resultado;
    SPT.igual(an.grupos, 4);
    /* en el cuadro de parámetros los enteros van sin decimales («4», no «4.000») */
    SPT.igual(SP.formatos.texto(an.grupos, 'sigEnt'), '4');
    SPT.igual(SP.formatos.texto(an.n, 'sigEnt'), '4.915');
  });
  SPT.caso('Mensajes de error', () => {
    const op = (id, x) => SP.opcionesCon(SP.metodos[id], x);
    SPT.lanza(() => SP.ejecutar('potencia-proporciones', null, {}, op('potencia-proporciones', { p1: 0.4, p2: 0.4 })), 'distintas');
    SPT.lanza(() => SP.ejecutar('potencia-medias', null, {}, op('potencia-medias', { calcular: 'potencia', n: 1 })), 'al menos 2');
    SPT.lanza(() => SP.ejecutar('potencia-correlacion', null, {}, op('potencia-correlacion', { r: 1.2, calcular: 'n' })), 'entre −1 y 1');
    SPT.lanza(() => SP.ejecutar('repeticiones', null, {}, op('repeticiones', { cv: 60, diferencia: 1 })), 'más de 1000');
  });
});

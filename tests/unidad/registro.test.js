/* Pruebas de js/nucleo/registro.js. Los métodos de prueba se borran al final de cada caso. */
SPT.describir('Núcleo · registro de métodos', () => {
  const base = () => ({
    id: 'prueba-registro', familia: 'descriptiva', nombre: 'Método de prueba', motor: 'js',
    entradas: { y: { tipo: 'numerica' } },
    opciones: { alfa: { tipo: 'numero', omision: 0.05 } },
    calcular: (tabla, ent, op) => ({ media: SP.num.media(tabla.col(ent.y).valores), alfa: op.alfa }),
    codigoR: () => 'mean(y)',
  });
  const limpiar = () => { delete SP.metodos['prueba-registro']; delete SP.metodos['prueba-b']; };

  SPT.caso('una ficha válida se registra congelada, con opciones y resumen por omisión', () => {
    try {
      const f = SP.metodo(base());
      SPT.afirmar(Object.isFrozen(f), 'congelada');
      SPT.igual(SP.metodos['prueba-registro'], f);
      SPT.igual(f.resumen, '');
      SPT.afirmar(SP.listaMetodos('descriptiva').includes(f));
    } finally { limpiar(); }
  });

  SPT.caso('las fichas incompletas se rechazan con el motivo', () => {
    const con = cambios => Object.assign(base(), cambios);
    try {
      SPT.lanza(() => SP.metodo(con({ id: 'Mal_Id' })), 'id no válido');
      SPT.lanza(() => SP.metodo(con({ familia: 'astrologia' })), 'familia desconocida');
      SPT.lanza(() => SP.metodo(con({ nombre: ' ' })), 'falta el nombre');
      SPT.lanza(() => SP.metodo(con({ motor: 'python' })), 'motor debe ser');
      SPT.lanza(() => SP.metodo(con({ entradas: {} })), 'faltan las entradas');
      SPT.lanza(() => SP.metodo(con({ entradas: { y: { tipo: 'fecha' } } })), 'tipo no válido');
      SPT.lanza(() => SP.metodo(con({ calcular: undefined })), 'necesita calcular');
      SPT.lanza(() => SP.metodo(con({ codigoR: undefined })), 'código R equivalente');
      SP.metodo(base());
      SPT.lanza(() => SP.metodo(base()), 'ya está registrado');
    } finally { limpiar(); }
  });

  SPT.caso('listaMetodos ordena por familia del catálogo y luego por nombre', () => {
    try {
      SP.metodo(Object.assign(base(), { id: 'prueba-b', familia: 'disenos', nombre: 'A primero' }));
      SP.metodo(base());
      const ids = SP.listaMetodos().map(m => m.id).filter(id => id === 'prueba-registro' || id === 'prueba-b');
      SPT.igualJSON(ids, ['prueba-registro', 'prueba-b'], 'descriptiva va antes que disenos');
    } finally { limpiar(); }
  });

  SPT.caso('SP.ejecutar valida, llena las opciones por omisión y calcula', () => {
    try {
      SP.metodo(Object.assign(base(), {
        validar(tabla, ent) { if (!ent.y) throw new SP.ErrorSP('Falta la respuesta.', 'Elige una columna.'); },
      }));
      const t = SP.tabla.crear({ rend: [4, 6, 8] });
      const r = SP.ejecutar('prueba-registro', t, { y: 'rend' }, {});
      SPT.igual(r.resultado.media, 6);
      SPT.igual(r.resultado.alfa, 0.05, 'opción por omisión');
      SPT.igual(SP.ejecutar('prueba-registro', t, { y: 'rend' }, { alfa: 0.01 }).resultado.alfa, 0.01);
      SPT.lanza(() => SP.ejecutar('prueba-registro', t, {}, {}), 'Falta la respuesta');
      SPT.lanza(() => SP.ejecutar('no-existe', t, {}, {}), 'no registrado');
    } finally { limpiar(); }
  });

  SPT.caso('regla de liberación: solo con casos y todos aprobados', () => {
    const v = casos => ({ casos });
    const c = (nombre, aprobado) => ({ objetivo: { tipo: 'metodo', nombre }, aprobado });
    SPT.igual(SP.metodoDisponible('m', v([])), false, 'sin casos');
    SPT.igual(SP.metodoDisponible('m', v([c('m', true), c('m', true)])), true);
    SPT.igual(SP.metodoDisponible('m', v([c('m', true), c('m', false)])), false, 'uno falla');
    SPT.igual(SP.metodoDisponible('m', v([c('otro', true)])), false, 'casos de otro método');
    SPT.igual(SP.metodoDisponible('m', null), false);
  });
});

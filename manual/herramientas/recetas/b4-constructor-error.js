/* Bloque 4: el constructor con un modelo que no se puede armar: su error y su arreglo */
(async () => {
  await ejemplo('Chile: medidas del fruto');
  SP.app.ir(4); await W(300); SP.app.analisis.ponerModo('constructor'); await W(400);
  Object.assign(SP.app.constructorUI.estado.roles, { respuesta: 'largo_cm', masRespuestas: ['ancho_cm'], factores: ['variedad'], covariables: ['peso_g'], bloques: ['bloque'], aleatorios: [], evento: '', parcelaGrande: '' });
  SP.app.analisis.calcular(); await W(500); limpio();
  return caja([$('#anaConstructor .cons-formula'), $('#anaConstructor .cons-der > .msg-warning')], 8);
})()

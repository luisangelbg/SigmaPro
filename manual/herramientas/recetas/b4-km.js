/* vista: 1400x1400 */
/* 4.23: curvas de Kaplan-Meier de los días a germinar del frijol por tratamiento */
(async () => {
  await ejemplo('días a la germinación');
  await usar('kaplan-meier', { tiempo: 'dias', evento: 'germino', grupo: 'tratamiento' }, {});
  const f = $$('#anaResultado .ana-graficas figure')[0]; irA(f, 110);
  f.style.alignSelf = 'start'; await W(300); limpio();
  return caja([f], 6);
})()

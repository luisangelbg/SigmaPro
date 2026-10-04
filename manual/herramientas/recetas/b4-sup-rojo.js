/* vista: 1400x1300 */
/* 4.7: los supuestos de los venenos: semáforo en rojo y qué hacer */
(async () => {
  await ejemplo('Venenos');
  await usar('supuestos', { respuesta: 'tiempo', tratamientos: ['veneno', 'tratamiento'] }, {});
  const r = $('#anaResultado'); irA(r, 110); await W(300); limpio();
  return caja([r.querySelector('.exp-cabeza'), r.querySelector('.semaforo'), r.querySelector('.exp-conclusion')], 8);
})()

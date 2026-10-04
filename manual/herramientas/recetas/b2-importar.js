/* vista: 1400x1100 */
/* Bloque 2: la ventana de importar con un CSV de punto y coma y coma decimal */
(async () => {
  SP.app.ir(2); await W(300);
  const csv = ['parcela;bloque;variedad;fecha_siembra;plantas;rend;observaciones',
    '1;1;Criollo;12/05/2025;38;4,52;', '2;1;H-318;12/05/2025;41;5,10;bien', '3;1;H-520;12/05/2025;s/d;5,87;acame leve',
    '4;2;Criollo;13/05/2025;36;4,21;', '5;2;H-318;13/05/2025;40;5,34;', '6;2;H-520;13/05/2025;43;6,02;',
    '7;3;Criollo;14/05/2025;39;4,66;plaga', '8;3;H-318;14/05/2025;42;NA;', '9;3;H-520;14/05/2025;44;6,15;',
    '10;4;Criollo;15/05/2025;37;4,38;', '11;4;H-318;15/05/2025;41;5,22;', '12;4;H-520;15/05/2025;45;5,96;'].join('\n');
  SP.datosDialogos.importarTexto(csv, 'ensayo-maiz.csv'); await W(700);
  return caja([dialogo()], 0);
})()

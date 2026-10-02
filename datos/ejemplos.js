/* SigmaPro — datos de ejemplo del bloque Datos. ARCHIVO GENERADO por datos/generar-ejemplos.R; no editar a mano.
   Ficticios y reproducibles, salvo «venenos»: Box, G. E. P. y Cox, D. R. (1964). An analysis of transformations.
   J. R. Stat. Soc. B 26: 211-252, cuadro 1; «mendel»: Mendel, G. (1866), Versuche über Pflanzen-Hybriden;
   y «avena»: Yates, F. (1935). Complex experiments. Suppl. J. R. Stat. Soc. 2: 181-247. */
window.SP_EJEMPLOS = [
  {
    "id": "maiz",
    "nombre": "Maíz: híbridos × nitrógeno",
    "descripcion": "Factorial 3 × 4 en bloques completos al azar; rendimiento de grano en t/ha (48 parcelas).",
    "csv": "\"bloque\",\"hibrido\",\"dosis\",\"rend\"\n\"1\",\"H-40\",0,4.61\n\"1\",\"H-40\",60,5.71\n\"1\",\"H-40\",120,6.41\n\"1\",\"H-40\",180,6.56\n\"1\",\"H-52\",0,4.8\n\"1\",\"H-52\",60,6.34\n\"1\",\"H-52\",120,6.99\n\"1\",\"H-52\",180,6.62\n\"1\",\"H-66\",0,5.12\n\"1\",\"H-66\",60,6.49\n\"1\",\"H-66\",120,7.28\n\"1\",\"H-66\",180,7.24\n\"2\",\"H-40\",0,4.06\n\"2\",\"H-40\",60,5.5\n\"2\",\"H-40\",120,6.62\n\"2\",\"H-40\",180,6.03\n\"2\",\"H-52\",0,4.2\n\"2\",\"H-52\",60,6.05\n\"2\",\"H-52\",120,7.03\n\"2\",\"H-52\",180,6.85\n\"2\",\"H-66\",0,4.8\n\"2\",\"H-66\",60,6.32\n\"2\",\"H-66\",120,7.21\n\"2\",\"H-66\",180,7.53\n\"3\",\"H-40\",0,4.18\n\"3\",\"H-40\",60,4.84\n\"3\",\"H-40\",120,6.43\n\"3\",\"H-40\",180,6.2\n\"3\",\"H-52\",0,4.44\n\"3\",\"H-52\",60,5.68\n\"3\",\"H-52\",120,6.38\n\"3\",\"H-52\",180,6.26\n\"3\",\"H-66\",0,4.66\n\"3\",\"H-66\",60,5.9\n\"3\",\"H-66\",120,7.02\n\"3\",\"H-66\",180,7.23\n\"4\",\"H-40\",0,4.03\n\"4\",\"H-40\",60,5.6\n\"4\",\"H-40\",120,5.96\n\"4\",\"H-40\",180,5.79\n\"4\",\"H-52\",0,4.28\n\"4\",\"H-52\",60,5.91\n\"4\",\"H-52\",120,6.43\n\"4\",\"H-52\",180,6.49\n\"4\",\"H-66\",0,4.49\n\"4\",\"H-66\",60,6.43\n\"4\",\"H-66\",120,7.14\n\"4\",\"H-66\",180,6.88",
    "tipos": null
  },
  {
    "id": "frijol",
    "nombre": "Frijol: germinación (%)",
    "descripcion": "Cinco tratamientos pregerminativos, 4 cajas de 50 semillas sembradas; el porcentaje pide el arcoseno o un modelo binomial.",
    "csv": "\"caja\",\"tratamiento\",\"sembradas\",\"germinadas\",\"germinacion\"\n\"C01\",\"Testigo\",50,17,34\n\"C02\",\"Testigo\",50,8,16\n\"C03\",\"Testigo\",50,19,38\n\"C04\",\"Testigo\",50,12,24\n\"C05\",\"Remojo 24 h\",50,33,66\n\"C06\",\"Remojo 24 h\",50,22,44\n\"C07\",\"Remojo 24 h\",50,32,64\n\"C08\",\"Remojo 24 h\",50,29,58\n\"C09\",\"GA3 100 ppm\",50,32,64\n\"C10\",\"GA3 100 ppm\",50,39,78\n\"C11\",\"GA3 100 ppm\",50,39,78\n\"C12\",\"GA3 100 ppm\",50,36,72\n\"C13\",\"GA3 250 ppm\",50,38,76\n\"C14\",\"GA3 250 ppm\",50,39,78\n\"C15\",\"GA3 250 ppm\",50,40,80\n\"C16\",\"GA3 250 ppm\",50,41,82\n\"C17\",\"Escarificación\",50,47,94\n\"C18\",\"Escarificación\",50,47,94\n\"C19\",\"Escarificación\",50,48,96\n\"C20\",\"Escarificación\",50,47,94",
    "tipos": {
      "tratamiento": {
        "tipo": "factor",
        "niveles": ["Testigo", "Remojo 24 h", "GA3 100 ppm", "GA3 250 ppm", "Escarificación"]
      }
    }
  },
  {
    "id": "trigo",
    "nombre": "Trigo: cuadro latino 5 × 5",
    "descripcion": "Cinco variedades (A–E) con hileras y columnas como bloques; rendimiento en t/ha.",
    "csv": "\"hilera\",\"columna\",\"variedad\",\"rend\"\n1,1,\"B\",5.53\n1,2,\"A\",5.37\n1,3,\"E\",5.23\n1,4,\"C\",4.92\n1,5,\"D\",5.5\n2,1,\"C\",4.98\n2,2,\"B\",5.52\n2,3,\"A\",5.06\n2,4,\"D\",5.88\n2,5,\"E\",5.47\n3,1,\"A\",5.29\n3,2,\"E\",5.32\n3,3,\"D\",5.48\n3,4,\"B\",5.87\n3,5,\"C\",5.14\n4,1,\"D\",6.05\n4,2,\"C\",5.14\n4,3,\"B\",5.81\n4,4,\"E\",5.59\n4,5,\"A\",5.09\n5,1,\"E\",5.78\n5,2,\"D\",5.93\n5,3,\"C\",5.14\n5,4,\"A\",5.52\n5,5,\"B\",5.57",
    "tipos": {
      "hilera": "factor",
      "columna": "factor"
    }
  },
  {
    "id": "jitomate",
    "nombre": "Jitomate: altura en invernadero",
    "descripcion": "Tres sustratos, 6 plantas cada uno; alturas (cm) a los 15, 30, 45 y 60 días en forma ancha, para pasar a larga. Trae fechas y dos faltantes.",
    "csv": "\"sustrato\",\"planta\",\"trasplante\",\"altura_15dds\",\"altura_30dds\",\"altura_45dds\",\"altura_60dds\"\n\"Tezontle\",\"P01\",\"2026-02-10\",22,66.2,118.7,151.7\n\"Tezontle\",\"P02\",\"2026-02-13\",17.9,60.5,123.9,157.1\n\"Tezontle\",\"P03\",\"2026-02-13\",14.1,63,123.5,148.3\n\"Tezontle\",\"P04\",\"2026-02-12\",16.4,60.8,125.1,148.7\n\"Tezontle\",\"P05\",\"2026-02-13\",18.7,62.8,122.9,NA\n\"Tezontle\",\"P06\",\"2026-02-10\",13.6,59.1,127.4,153.8\n\"Fibra de coco\",\"P07\",\"2026-02-12\",20.3,66.3,137.7,166.1\n\"Fibra de coco\",\"P08\",\"2026-02-12\",17.8,69.4,132.4,171.9\n\"Fibra de coco\",\"P09\",\"2026-02-10\",18,70.5,140.5,168.5\n\"Fibra de coco\",\"P10\",\"2026-02-11\",17.6,73.9,142.1,169.4\n\"Fibra de coco\",\"P11\",\"2026-02-13\",23.2,66,135.9,172.8\n\"Fibra de coco\",\"P12\",\"2026-02-10\",21.9,72.6,136.7,169.8\n\"Mezcla\",\"P13\",\"2026-02-12\",16.8,67.6,133.1,163.5\n\"Mezcla\",\"P14\",\"2026-02-10\",20.9,70,135.2,NA\n\"Mezcla\",\"P15\",\"2026-02-10\",15,70.9,135.1,154.9\n\"Mezcla\",\"P16\",\"2026-02-13\",16.9,69.7,131.1,158.1\n\"Mezcla\",\"P17\",\"2026-02-13\",18.5,63.9,132.2,160.7\n\"Mezcla\",\"P18\",\"2026-02-12\",17,63.2,131.1,162.2",
    "tipos": null
  },
  {
    "id": "aguacate",
    "nombre": "Aguacate: trips por brote",
    "descripcion": "Cinco tratamientos en 6 bloques; conteos con ceros (piden √(x + 0.5) o un modelo de conteos) y dos faltantes.",
    "csv": "\"bloque\",\"tratamiento\",\"trips\"\n1,\"Testigo\",8\n1,\"Azadiractina\",6\n1,\"Spinosad\",1\n1,\"Jabón potásico\",1\n1,\"Beauveria\",3\n2,\"Testigo\",5\n2,\"Azadiractina\",NA\n2,\"Spinosad\",3\n2,\"Jabón potásico\",3\n2,\"Beauveria\",1\n3,\"Testigo\",12\n3,\"Azadiractina\",2\n3,\"Spinosad\",1\n3,\"Jabón potásico\",9\n3,\"Beauveria\",7\n4,\"Testigo\",2\n4,\"Azadiractina\",15\n4,\"Spinosad\",0\n4,\"Jabón potásico\",11\n4,\"Beauveria\",4\n5,\"Testigo\",12\n5,\"Azadiractina\",NA\n5,\"Spinosad\",1\n5,\"Jabón potásico\",3\n5,\"Beauveria\",4\n6,\"Testigo\",8\n6,\"Azadiractina\",4\n6,\"Spinosad\",3\n6,\"Jabón potásico\",10\n6,\"Beauveria\",4",
    "tipos": {
      "tratamiento": {
        "tipo": "factor",
        "niveles": ["Testigo", "Azadiractina", "Spinosad", "Jabón potásico", "Beauveria"]
      }
    }
  },
  {
    "id": "venenos",
    "nombre": "Venenos × tratamientos (Box y Cox, 1964)",
    "descripcion": "Datos publicados: tiempo de supervivencia (unidades de 10 h) de 48 animales; el ejemplo clásico de Box-Cox (λ cercana a −1).",
    "csv": "\"veneno\",\"tratamiento\",\"tiempo\"\n\"I\",\"A\",0.31\n\"I\",\"A\",0.45\n\"I\",\"A\",0.46\n\"I\",\"A\",0.43\n\"I\",\"B\",0.82\n\"I\",\"B\",1.1\n\"I\",\"B\",0.88\n\"I\",\"B\",0.72\n\"I\",\"C\",0.43\n\"I\",\"C\",0.45\n\"I\",\"C\",0.63\n\"I\",\"C\",0.76\n\"I\",\"D\",0.45\n\"I\",\"D\",0.71\n\"I\",\"D\",0.66\n\"I\",\"D\",0.62\n\"II\",\"A\",0.36\n\"II\",\"A\",0.29\n\"II\",\"A\",0.4\n\"II\",\"A\",0.23\n\"II\",\"B\",0.92\n\"II\",\"B\",0.61\n\"II\",\"B\",0.49\n\"II\",\"B\",1.24\n\"II\",\"C\",0.44\n\"II\",\"C\",0.35\n\"II\",\"C\",0.31\n\"II\",\"C\",0.4\n\"II\",\"D\",0.56\n\"II\",\"D\",1.02\n\"II\",\"D\",0.71\n\"II\",\"D\",0.38\n\"III\",\"A\",0.22\n\"III\",\"A\",0.21\n\"III\",\"A\",0.18\n\"III\",\"A\",0.23\n\"III\",\"B\",0.3\n\"III\",\"B\",0.37\n\"III\",\"B\",0.38\n\"III\",\"B\",0.29\n\"III\",\"C\",0.23\n\"III\",\"C\",0.25\n\"III\",\"C\",0.24\n\"III\",\"C\",0.22\n\"III\",\"D\",0.3\n\"III\",\"D\",0.36\n\"III\",\"D\",0.31\n\"III\",\"D\",0.33",
    "tipos": null
  },
  {
    "id": "mendel",
    "nombre": "Chícharo: segregación de Mendel",
    "descripcion": "Datos publicados de la F2 dihíbrida (Mendel, 1866): fenotipo (forma × color) de 556 semillas, ya contadas; para la bondad de ajuste 9:3:3:1 o 3:1 por carácter.",
    "csv": "\"fenotipo\",\"forma\",\"color\",\"semillas\"\n\"redonda amarilla\",\"redonda\",\"amarilla\",315\n\"redonda verde\",\"redonda\",\"verde\",108\n\"rugosa amarilla\",\"rugosa\",\"amarilla\",101\n\"rugosa verde\",\"rugosa\",\"verde\",32",
    "tipos": {
      "fenotipo": {
        "tipo": "factor",
        "niveles": ["redonda amarilla", "redonda verde", "rugosa amarilla", "rugosa verde"]
      },
      "forma": {
        "tipo": "factor",
        "niveles": ["redonda", "rugosa"]
      },
      "color": {
        "tipo": "factor",
        "niveles": ["amarilla", "verde"]
      }
    }
  },
  {
    "id": "avena",
    "nombre": "Avena en parcelas divididas (Yates, 1935)",
    "descripcion": "Datos publicados: 3 variedades en parcelas grandes y 4 dosis de nitrógeno (quintales por acre) en subparcelas, en 6 bloques; rendimiento en cuartos de libra por subparcela.",
    "csv": "\"bloque\",\"variedad\",\"nitrogeno\",\"rendimiento\"\n\"I\",\"Victory\",0,111\n\"I\",\"Victory\",0.2,130\n\"I\",\"Victory\",0.4,157\n\"I\",\"Victory\",0.6,174\n\"I\",\"Golden rain\",0,117\n\"I\",\"Golden rain\",0.2,114\n\"I\",\"Golden rain\",0.4,161\n\"I\",\"Golden rain\",0.6,141\n\"I\",\"Marvellous\",0,105\n\"I\",\"Marvellous\",0.2,140\n\"I\",\"Marvellous\",0.4,118\n\"I\",\"Marvellous\",0.6,156\n\"II\",\"Victory\",0,61\n\"II\",\"Victory\",0.2,91\n\"II\",\"Victory\",0.4,97\n\"II\",\"Victory\",0.6,100\n\"II\",\"Golden rain\",0,70\n\"II\",\"Golden rain\",0.2,108\n\"II\",\"Golden rain\",0.4,126\n\"II\",\"Golden rain\",0.6,149\n\"II\",\"Marvellous\",0,96\n\"II\",\"Marvellous\",0.2,124\n\"II\",\"Marvellous\",0.4,121\n\"II\",\"Marvellous\",0.6,144\n\"III\",\"Victory\",0,68\n\"III\",\"Victory\",0.2,64\n\"III\",\"Victory\",0.4,112\n\"III\",\"Victory\",0.6,86\n\"III\",\"Golden rain\",0,60\n\"III\",\"Golden rain\",0.2,102\n\"III\",\"Golden rain\",0.4,89\n\"III\",\"Golden rain\",0.6,96\n\"III\",\"Marvellous\",0,89\n\"III\",\"Marvellous\",0.2,129\n\"III\",\"Marvellous\",0.4,132\n\"III\",\"Marvellous\",0.6,124\n\"IV\",\"Victory\",0,74\n\"IV\",\"Victory\",0.2,89\n\"IV\",\"Victory\",0.4,81\n\"IV\",\"Victory\",0.6,122\n\"IV\",\"Golden rain\",0,64\n\"IV\",\"Golden rain\",0.2,103\n\"IV\",\"Golden rain\",0.4,132\n\"IV\",\"Golden rain\",0.6,133\n\"IV\",\"Marvellous\",0,70\n\"IV\",\"Marvellous\",0.2,89\n\"IV\",\"Marvellous\",0.4,104\n\"IV\",\"Marvellous\",0.6,117\n\"V\",\"Victory\",0,62\n\"V\",\"Victory\",0.2,90\n\"V\",\"Victory\",0.4,100\n\"V\",\"Victory\",0.6,116\n\"V\",\"Golden rain\",0,80\n\"V\",\"Golden rain\",0.2,82\n\"V\",\"Golden rain\",0.4,94\n\"V\",\"Golden rain\",0.6,126\n\"V\",\"Marvellous\",0,63\n\"V\",\"Marvellous\",0.2,70\n\"V\",\"Marvellous\",0.4,109\n\"V\",\"Marvellous\",0.6,99\n\"VI\",\"Victory\",0,53\n\"VI\",\"Victory\",0.2,74\n\"VI\",\"Victory\",0.4,118\n\"VI\",\"Victory\",0.6,113\n\"VI\",\"Golden rain\",0,89\n\"VI\",\"Golden rain\",0.2,82\n\"VI\",\"Golden rain\",0.4,86\n\"VI\",\"Golden rain\",0.6,104\n\"VI\",\"Marvellous\",0,97\n\"VI\",\"Marvellous\",0.2,99\n\"VI\",\"Marvellous\",0.4,119\n\"VI\",\"Marvellous\",0.6,121",
    "tipos": {
      "variedad": {
        "tipo": "factor",
        "niveles": ["Victory", "Golden rain", "Marvellous"]
      },
      "bloque": {
        "tipo": "factor",
        "niveles": ["I", "II", "III", "IV", "V", "VI"]
      }
    }
  },
  {
    "id": "sorgo",
    "nombre": "Sorgo: variedades y número de plantas",
    "descripcion": "Seis variedades en 4 bloques; rendimiento en t/ha y plantas cosechadas por parcela, la covariable para ajustar las medias (ANCOVA).",
    "csv": "\"bloque\",\"variedad\",\"plantas\",\"rend\"\n1,\"Línea 1\",98,3.83\n1,\"Línea 2\",101,3.35\n1,\"Línea 3\",115,3.34\n1,\"Línea 4\",114,3.97\n1,\"Línea 5\",120,3.85\n1,\"Testigo\",118,3.42\n2,\"Línea 1\",133,4.6\n2,\"Línea 2\",105,3.59\n2,\"Línea 3\",137,4.02\n2,\"Línea 4\",105,3.51\n2,\"Línea 5\",131,3.97\n2,\"Testigo\",131,3.37\n3,\"Línea 1\",128,4.03\n3,\"Línea 2\",118,3.45\n3,\"Línea 3\",130,3.35\n3,\"Línea 4\",150,4.34\n3,\"Línea 5\",118,3.32\n3,\"Testigo\",121,2.82\n4,\"Línea 1\",130,4.04\n4,\"Línea 2\",116,3.38\n4,\"Línea 3\",125,3.37\n4,\"Línea 4\",121,3.51\n4,\"Línea 5\",128,3.23\n4,\"Testigo\",143,3.51",
    "tipos": {
      "variedad": {
        "tipo": "factor",
        "niveles": ["Línea 1", "Línea 2", "Línea 3", "Línea 4", "Línea 5", "Testigo"]
      }
    }
  },
  {
    "id": "cafe",
    "nombre": "Café: rendimiento y sitio",
    "descripcion": "Cuarenta fincas: rendimiento (quintales de café oro por hectárea) con altitud, temperatura, lluvia, materia orgánica, pH, sombra y edad del cafetal; para regresión, colinealidad (altitud y temperatura) y selección de variables.",
    "csv": "\"finca\",\"altitud\",\"temperatura\",\"lluvia\",\"materia_organica\",\"ph\",\"sombra\",\"edad\",\"rendimiento\"\n\"F01\",1342,23.2,2818,6.5,5.1,33,21,17.6\n\"F02\",1053,25.3,2117,6.8,5.3,23,5,15.4\n\"F03\",1048,24.6,2537,2.2,5.7,61,16,4\n\"F04\",1442,22.8,2731,4.2,5.8,38,15,14.4\n\"F05\",1629,21.1,2625,6.8,5.4,29,6,20.5\n\"F06\",1557,22.2,2743,6.6,4.8,69,13,19.1\n\"F07\",1430,22.5,2003,3.6,5.7,61,8,10.1\n\"F08\",1682,20.6,1883,4,6,47,11,18.3\n\"F09\",1209,23.9,2476,5.5,5.4,21,15,16.8\n\"F10\",1539,21.1,2005,5.7,5.1,23,16,20.2\n\"F11\",1631,20.9,1534,2.4,6.2,59,5,12.7\n\"F12\",1564,22.7,2691,6.3,4.8,45,8,16.5\n\"F13\",1679,21,2498,3.3,6,70,13,12.9\n\"F14\",1338,23.4,1681,2.2,4.8,26,16,12.6\n\"F15\",907,25.4,1963,2.3,6.2,25,18,3.6\n\"F16\",964,25.7,1720,4,5.6,45,15,10\n\"F17\",1121,24.4,1811,6.1,4.7,43,16,19.4\n\"F18\",1621,21.3,2136,2.5,6.3,56,12,12.7\n\"F19\",1134,24.2,2197,2,4.8,44,24,6.4\n\"F20\",945,25.2,2076,2.8,6.2,23,19,5.8\n\"F21\",1238,23.7,2491,3.4,5.8,55,5,11.5\n\"F22\",1558,22,1946,5.6,5.8,41,17,17.5\n\"F23\",1063,24.9,2028,5.7,5.5,58,4,14.3\n\"F24\",1104,25,2222,5.1,5.2,68,8,14.7\n\"F25\",960,25.2,1816,2.5,5,34,24,3\n\"F26\",1147,24.5,1993,5.4,5.5,27,10,16.2\n\"F27\",1276,23.7,2693,4.4,5.3,44,24,12.1\n\"F28\",903,25.6,2679,6.6,6.2,58,16,10.4\n\"F29\",1513,22.3,1978,2.6,5.7,60,24,9.2\n\"F30\",1311,24,2518,3.1,5.1,66,3,13.4\n\"F31\",1072,25.7,1513,3.5,5.9,61,5,9.4\n\"F32\",1239,23.5,2507,5.2,5.6,46,8,16.6\n\"F33\",1065,24.4,2076,2.7,4.8,39,10,7\n\"F34\",1572,21.6,2896,2.4,5.3,68,8,12.3\n\"F35\",1365,23,2120,3.2,4.9,26,7,16.1\n\"F36\",941,25.6,2269,5.5,4.7,24,19,11.4\n\"F37\",1036,25.5,2196,6.4,5.5,54,9,12.6\n\"F38\",1407,23.5,2634,5.9,6,62,24,12.7\n\"F39\",1034,25,2876,2.2,4.9,49,13,5.3\n\"F40\",1150,25.1,2849,5.9,6.2,46,24,10.7",
    "tipos": null
  },
  {
    "id": "germinacion-lotes",
    "nombre": "Frijol: semilla tratada en cuatro lotes",
    "descripcion": "Cien semillas por lote y tratamiento (fungicida o testigo), ya contadas por resultado; para la tabla de contingencia con frecuencias y Cochran-Mantel-Haenszel por lote.",
    "csv": "\"lote\",\"tratamiento\",\"germinacion\",\"semillas\"\n\"L1\",\"Fungicida\",\"Germinó\",80\n\"L1\",\"Fungicida\",\"No germinó\",20\n\"L1\",\"Testigo\",\"Germinó\",65\n\"L1\",\"Testigo\",\"No germinó\",35\n\"L2\",\"Fungicida\",\"Germinó\",79\n\"L2\",\"Fungicida\",\"No germinó\",21\n\"L2\",\"Testigo\",\"Germinó\",67\n\"L2\",\"Testigo\",\"No germinó\",33\n\"L3\",\"Fungicida\",\"Germinó\",80\n\"L3\",\"Fungicida\",\"No germinó\",20\n\"L3\",\"Testigo\",\"Germinó\",59\n\"L3\",\"Testigo\",\"No germinó\",41\n\"L4\",\"Fungicida\",\"Germinó\",94\n\"L4\",\"Fungicida\",\"No germinó\",6\n\"L4\",\"Testigo\",\"Germinó\",72\n\"L4\",\"Testigo\",\"No germinó\",28",
    "tipos": {
      "germinacion": {
        "tipo": "factor",
        "niveles": ["Germinó", "No germinó"]
      },
      "tratamiento": {
        "tipo": "factor",
        "niveles": ["Fungicida", "Testigo"]
      }
    }
  },
  {
    "id": "roya-evaluadores",
    "nombre": "Roya: dos evaluadores",
    "descripcion": "Severidad de roya (0 a 3) en 80 hojas calificada por dos técnicos; para la concordancia (kappa simple y ponderada) y para ver si uno califica más alto (Bowker).",
    "csv": "\"hoja\",\"evaluador_A\",\"evaluador_B\"\n\"H01\",\"0 sana\",\"0 sana\"\n\"H02\",\"0 sana\",\"0 sana\"\n\"H03\",\"3 severa\",\"3 severa\"\n\"H04\",\"0 sana\",\"1 leve\"\n\"H05\",\"1 leve\",\"1 leve\"\n\"H06\",\"0 sana\",\"1 leve\"\n\"H07\",\"0 sana\",\"1 leve\"\n\"H08\",\"0 sana\",\"0 sana\"\n\"H09\",\"2 moderada\",\"2 moderada\"\n\"H10\",\"0 sana\",\"0 sana\"\n\"H11\",\"1 leve\",\"1 leve\"\n\"H12\",\"2 moderada\",\"2 moderada\"\n\"H13\",\"0 sana\",\"0 sana\"\n\"H14\",\"1 leve\",\"1 leve\"\n\"H15\",\"2 moderada\",\"2 moderada\"\n\"H16\",\"2 moderada\",\"1 leve\"\n\"H17\",\"0 sana\",\"0 sana\"\n\"H18\",\"0 sana\",\"0 sana\"\n\"H19\",\"3 severa\",\"3 severa\"\n\"H20\",\"0 sana\",\"0 sana\"\n\"H21\",\"2 moderada\",\"2 moderada\"\n\"H22\",\"0 sana\",\"0 sana\"\n\"H23\",\"1 leve\",\"1 leve\"\n\"H24\",\"0 sana\",\"0 sana\"\n\"H25\",\"3 severa\",\"3 severa\"\n\"H26\",\"1 leve\",\"1 leve\"\n\"H27\",\"3 severa\",\"3 severa\"\n\"H28\",\"2 moderada\",\"2 moderada\"\n\"H29\",\"1 leve\",\"2 moderada\"\n\"H30\",\"3 severa\",\"2 moderada\"\n\"H31\",\"0 sana\",\"0 sana\"\n\"H32\",\"1 leve\",\"1 leve\"\n\"H33\",\"0 sana\",\"1 leve\"\n\"H34\",\"3 severa\",\"3 severa\"\n\"H35\",\"0 sana\",\"0 sana\"\n\"H36\",\"1 leve\",\"1 leve\"\n\"H37\",\"1 leve\",\"1 leve\"\n\"H38\",\"1 leve\",\"1 leve\"\n\"H39\",\"2 moderada\",\"2 moderada\"\n\"H40\",\"1 leve\",\"1 leve\"\n\"H41\",\"0 sana\",\"0 sana\"\n\"H42\",\"2 moderada\",\"2 moderada\"\n\"H43\",\"1 leve\",\"1 leve\"\n\"H44\",\"1 leve\",\"1 leve\"\n\"H45\",\"2 moderada\",\"1 leve\"\n\"H46\",\"1 leve\",\"2 moderada\"\n\"H47\",\"0 sana\",\"0 sana\"\n\"H48\",\"2 moderada\",\"2 moderada\"\n\"H49\",\"3 severa\",\"3 severa\"\n\"H50\",\"1 leve\",\"1 leve\"\n\"H51\",\"0 sana\",\"0 sana\"\n\"H52\",\"0 sana\",\"1 leve\"\n\"H53\",\"1 leve\",\"1 leve\"\n\"H54\",\"2 moderada\",\"2 moderada\"\n\"H55\",\"0 sana\",\"0 sana\"\n\"H56\",\"1 leve\",\"1 leve\"\n\"H57\",\"0 sana\",\"0 sana\"\n\"H58\",\"3 severa\",\"2 moderada\"\n\"H59\",\"0 sana\",\"0 sana\"\n\"H60\",\"1 leve\",\"1 leve\"\n\"H61\",\"0 sana\",\"0 sana\"\n\"H62\",\"2 moderada\",\"3 severa\"\n\"H63\",\"0 sana\",\"0 sana\"\n\"H64\",\"1 leve\",\"1 leve\"\n\"H65\",\"2 moderada\",\"2 moderada\"\n\"H66\",\"0 sana\",\"0 sana\"\n\"H67\",\"0 sana\",\"0 sana\"\n\"H68\",\"1 leve\",\"1 leve\"\n\"H69\",\"0 sana\",\"0 sana\"\n\"H70\",\"0 sana\",\"1 leve\"\n\"H71\",\"3 severa\",\"3 severa\"\n\"H72\",\"3 severa\",\"3 severa\"\n\"H73\",\"1 leve\",\"1 leve\"\n\"H74\",\"1 leve\",\"1 leve\"\n\"H75\",\"1 leve\",\"2 moderada\"\n\"H76\",\"3 severa\",\"3 severa\"\n\"H77\",\"0 sana\",\"0 sana\"\n\"H78\",\"1 leve\",\"1 leve\"\n\"H79\",\"3 severa\",\"3 severa\"\n\"H80\",\"0 sana\",\"0 sana\"",
    "tipos": {
      "evaluador_A": {
        "tipo": "factor",
        "niveles": ["0 sana", "1 leve", "2 moderada", "3 severa"]
      },
      "evaluador_B": {
        "tipo": "factor",
        "niveles": ["0 sana", "1 leve", "2 moderada", "3 severa"]
      }
    }
  }
];

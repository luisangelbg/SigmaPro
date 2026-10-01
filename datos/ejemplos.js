/* SigmaPro — datos de ejemplo del bloque Datos. ARCHIVO GENERADO por datos/generar-ejemplos.R; no editar a mano.
   Ficticios y reproducibles, salvo «venenos»: Box, G. E. P. y Cox, D. R. (1964). An analysis of transformations.
   J. R. Stat. Soc. B 26: 211-252, cuadro 1; y «mendel»: Mendel, G. (1866), Versuche über Pflanzen-Hybriden. */
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
  }
];

# La secuencia de apertura de SigmaPro

`js/intro.js` + `css/intro.css` (≈ 37 KB en total, sin imágenes, fuentes ni bibliotecas). Se carga como el primer
script del `<body>`: la capa aparece antes de que se pinte la interfaz y la app termina de cargar detrás. Todo lo que
se mueve mientras tanto es CSS sobre `transform` y `opacity`, que el navegador anima en el compositor: no se traba
aunque los 99 scripts de la app ocupen el hilo principal (≈ 1.4 s en una laptop media).

## Guion final

La intro completa dura **6.5 s hasta «Start»** y luego **se queda fija**: las letras siguen flotando, el logo
respira y lanza destellos, y el botón **Start** (negro con vivos dorados) lleva a la app. Los tiempos salen de
`DURACION` (todas las fases se escalan con ella; la tabla es con 6.5 s).

| Tiempo | Fase | Captura |
|---|---|---|
| 0.0 – 0.9 s | Oscuridad con viñeta y grano fino. Un punto dorado respira en el centro. | `capturas/intro-1-punto.png` |
| 0.9 – 2.8 s | Del punto emergen 32 letras griegas de la estadística (α … Ξ, χ²) a su lugar: 24–220 px, opacidad 0.04–0.14, las grandes más difusas; deriva lenta y paralaje con el cursor o el giroscopio. Aparecen 36 motas de oro. | `capturas/intro-2-letras.png` |
| 2.6 – 4.0 s | Se dibuja en oro el trazo del cuadro y de la σ del logo. | `capturas/intro-3-trazo.png` |
| 3.4 – 4.3 s | El logo se llena como metal que se vierte (máscara con ola) y una veta de luz cruza la σ. | `capturas/intro-4-vertido.png` |
| 4.2 – 4.6 s | Destello breve (0.3 s, uno solo) y onda circular que empuja las letras hacia afuera. | `capturas/intro-5-destello.png` |
| 4.3 – 5.6 s | «SigmaPro» aparece letra por letra en versalitas; debajo, el isotipo LABG (con su brillo) y «by LABG». Desde 4.4 s, destellos de cuatro puntas sobre la σ y un halo dorado que respira. | `capturas/intro-6-nombre.png` |
| 5.6 s → | Escena fija con **Start** (recibe el foco: Enter entra). Los brillos de las letras siguen (uno cada 1.2 s, nunca más de dos), la veta cruza la σ cada 6 s. | `capturas/intro-7-start.png` |
| Start → +0.7 s | Todo se contrae, el fondo se abre en iris y el logo y el isotipo viajan a su lugar en el encabezado: la intro y la interfaz son lo mismo. | `capturas/intro-8-iris.png` |

Otras formas:

- **Corta** (visitas siguientes): la misma secuencia comprimida a 1.5 s (`DURACION_CORTA`) y la escena fija con Start.
- **Pantalla de presentación** (Inicio → Acerca de SigmaPro): la escena en bucle, sin botón, para proyectar en clase o
  en un stand; sale con cualquier tecla o un clic. `capturas/intro-11-presentacion.png`
- **Reducir movimiento**: la escena quieta (logo, nombre, LABG y Start), sin letras ni motas, con un fundido de 0.3 s.
  `capturas/intro-9-quieta.png`
- **Celular** (390 px): `capturas/intro-10-movil.png`.

## Cuándo aparece

- La completa la primera vez; después, la corta. Nada si se desactivó (Inicio → Acerca de SigmaPro → «Mostrar la intro
  al abrir»), si ya se vio en esta pestaña (las recargas por cambio de idioma no la repiten), si la pestaña está oculta
  o en un navegador sin ventana (las pruebas automáticas y las herramientas de medición).
- `?intro=full`, `?intro=short`, `?intro=loop` o `?intro=no` en la dirección la fuerzan.
- Esc o «Saltar» la quitan en cualquier momento; un clic en el fondo no (solo Start entra).

API: `SigmaIntro.play({ mode: 'full' | 'short' | 'loop' })`, `SigmaIntro.skip()`, `SigmaIntro.setEnabled(bool)`. Eventos
en `document`: `sigmaintro:inicio`, `sigmaintro:listo` (aparece Start), `sigmaintro:fin`.

## Constantes ajustables (al inicio de `js/intro.js`)

| Constante | Valor | Qué cambia |
|---|---|---|
| `DURACION` | 6.5 | Segundos hasta Start; todas las fases se escalan |
| `DURACION_CORTA` | 1.5 | La de las visitas siguientes |
| `LETRAS` | α … Ξ, χ² | Las letras de la constelación |
| `DENSIDAD` | 1 | 1.5 repite la mitad de las letras (más constelación) |
| `TAMANO` | [24, 220] | Tamaño de las letras en px (el mayor se reduce en pantallas chicas) |
| `OPACIDAD` | [0.04, 0.14] | Transparencia de las letras |
| `BRILLAN` | σ μ Σ α β χ² | Las que se encienden en oro |
| `MOTAS` | 36 | Partículas de oro (≤ 40) |
| `PARALAJE` | 16 | Píxeles que se mueve la letra más grande con el cursor |
| `LOGO`, `NOMBRE` | [120, 240], [36, 76] | Tamaño del logo y de «SigmaPro» (proporcional a la pantalla, entre esos límites) |
| `CHISPAS` | 4 puntos | Dónde salen los destellos sobre la σ (x, y, radio en el SVG de 512) |
| `COLORES` | #050505, #0B0B0B, #C9A227, #E6C65C, #8C6D1A, #F5F0E6 | Fondo, oro (principal, brillo, sombra) y blanco cálido |
| `SERIF` | Cormorant Garamond, Fraunces, Georgia… | Letra de las griegas, «SigmaPro» y Start |
| `TEXTOS` | es / en | Saltar, Start, anuncios |

## Rendimiento y peso

Medido con `node tests/intro.mjs` (Edge sin ventana, 1440 × 900): 6.5 s hasta Start a 58–59 cuadros por segundo
(mediana 16.7 ms, p95 ≈ 17 ms; 3 a 5 cuadros de más de 34 ms, mientras la app carga sus scripts). La única tarea
larga del hilo principal en ese lapso es de la propia app (55–140 ms según la corrida); la animación no depende del
hilo principal. Peso: `js/intro.js` + `css/intro.css` ≈ 37 KB.

La prueba (también en la batería) revisa: aparece antes de pintar, capa decorativa con `aria-hidden` y anuncio «Cargando
SigmaPro» que cambia a «… Pulsa Start para entrar», ninguna letra sobre el centro, Start con el foco y debajo de LABG,
el clic en el fondo no la cierra, Enter entra y la página queda usable, Esc la quita, la versión quieta, 390 px,
reacomodo al cambiar el tamaño, presentación que sale con una tecla y ningún error.

## Simplificaciones y por qué

1. **Sin Google Fonts ni Three.js.** SigmaPro abre con doble clic y no hace ninguna petición fuera del equipo (lo
   comprueba `tests/sin-conexion.mjs`). Las letras usan Cormorant Garamond o Fraunces si están instaladas y, si no,
   Georgia; la escena es CSS más un lienzo 2D (el grano, dibujado una sola vez).
2. **El logo LABG** es el isotipo oficial (hexágono dorado con el cubo de datos A/B, `LABG.isotipo()`), con su brillo
   propio: no existe en la suite un logo «Biplot 3D».
3. **El logo de SigmaPro** pasó de la Σ de bloque a la σ minúscula con serifas (pedido del 4 oct 2026), también en el
   encabezado, el favicon e `iconos/`.
4. **La intro se queda fija con Start** (pedido del 4 oct 2026) en lugar de entrar sola; para no retrasar a quien ya
   trabaja: la corta en las visitas siguientes, nada en recargas de la misma pestaña, Esc y la opción de desactivarla.
   Se quitó el eslogan (sigue en la tarjeta «Acerca de SigmaPro»).
5. **Navegadores**: en este equipo solo hay Edge y Chrome (motor Chromium). Firefox y Safari no están instalados y
   WebKit por Playwright requiere instalar paquetes; el código usa solo funciones estándar con respaldo (sin
   `@property`, el iris se vuelve un fundido).
6. **Lighthouse** necesita instalar su paquete de npm (pendiente de permiso). La intro no corre en navegadores sin
   ventana como el de Lighthouse, así que no altera sus mediciones; su costo en la página es ≈ 37 KB.
7. **Giroscopio**: en iOS pedir el permiso del sensor abriría un diálogo; se usa solo donde el navegador lo entrega
   sin pedirlo.

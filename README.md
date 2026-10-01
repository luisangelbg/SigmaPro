# SigmaPro

**Estadística para la investigación agronómica y biológica, con cifras que se pueden comprobar.**

SigmaPro es una aplicación web de análisis estadístico: diseños experimentales, comparaciones de
medias, regresión y, más adelante, modelos mixtos y ensayos multiambiente. Forma parte de la
[LABG Suite](https://luisangelbg.github.io/).

- **Exactitud verificada.** Cada método se compara contra R con datos publicados o clásicos, número por
  número, con tolerancia de 1 × 10⁻⁶. Nada se libera sin su prueba. El reporte de validación está en la
  propia app (bloque 8) y en [`tests/reporte-validacion.html`](tests/reporte-validacion.html).
- **Reproducible.** Cada análisis trae el código R equivalente.
- **Privado.** Todo se calcula en el navegador; los datos no salen del equipo.
- **Sin instalación.** Se abre con doble clic en `index.html` y funciona sin conexión.

## Estado

En construcción, por hitos. **Hito 1.0 (cimientos) terminado:** núcleo con suma compensada, tabla en
columnas, registro de métodos, cálculos en hilos de trabajo, pruebas automáticas en node y en el
navegador, generador de referencias con R y reporte de validación. El plan completo está en
[`propuesta/PROPUESTA.md`](propuesta/PROPUESTA.md) y una maqueta navegable del flujo en
[`propuesta/maqueta.html`](propuesta/maqueta.html).

## Pruebas

```
Rscript tests/r/generar-todo.R    # referencias con R
node tests/correr.mjs             # pruebas y reporte
node tests/navegador.mjs          # las mismas pruebas en el navegador
```

O abre `tests/index.html` con doble clic. Detalles en [`docs/VALIDACION.md`](docs/VALIDACION.md).

## Licencia

GPL-3.0 o posterior (ver [`LICENSE`](LICENSE)). Componentes de terceros en
[`LICENSES-TERCEROS.md`](LICENSES-TERCEROS.md).

---

*SigmaPro is a browser-based statistics application for agricultural and biological research. Every method
is validated number by number against R (tolerance 1e-6) on published datasets; data never leave the browser.
Interface in Spanish. Licensed under GPL-3.0-or-later.*

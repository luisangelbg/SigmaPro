# SigmaPro

**Statistics for agronomic and biological research, with numbers you can check** · *Español: [LEEME.md](LEEME.md)*

SigmaPro is a statistics application for agronomic and biological research that runs entirely in the browser: from
the field file to the published table and figure, along a single path. It covers experimental designs and mean
comparisons, regression and correlation, linear mixed and generalized models, nonlinear models, response surfaces,
multi-environment trials, sample size and power, sampling, survival, time series and multivariate analysis: **78
analyses in 18 families**. The interface is in Spanish and English, with light and dark themes. It is part of the
[LABG Suite](https://luisangelbg.github.io/).

- **Verified accuracy.** Every method is compared against R, number by number, with a tolerance of 10⁻⁶ relative to
  the size of each value: **849 cases and 93,169 values, all within tolerance**. A method is not released until its
  cases pass. The validation report is inside the app (block 8) and in
  [`tests/reporte-validacion.html`](tests/reporte-validacion.html).
- **Reproducible.** Every result comes with the equivalent R code; the `.labg` project keeps the data, the analyses
  and the SHA-256 hash of each file.
- **Private.** Everything is computed in the browser; the data never leave the computer.
- **Explains what it computes.** Each result starts with its conclusion in plain words, checks its assumptions with a
  traffic light that can run the alternative, and has “How to read this table” with published reading guides. Each of
  the 78 analyses has a fact sheet (block 9): what it is for, the model and its hypotheses, the assumptions and how to
  check them, the data it needs with templates, how to read it and its references.

## Statement of need

Agronomic and biological experiments are analyzed with the design they were run with: blocks, split plots, lattices,
repeated measures, several locations. In practice the analysis is often the most familiar one rather than the right
one, and the step from a statistical package to a thesis table and a methods paragraph is done by hand. SigmaPro reads
the structure of the trial in the data, asks what it cannot read, proposes the analysis that matches the design, and
writes the conclusion, the publication tables and figures, the methods and results paragraphs with their citations,
and the R code that reproduces every number. It does so without installing anything and without sending the data
anywhere, and every number it gives has been checked against R.

## Open it

- **Online:** https://luisangelbg.github.io/SigmaPro/ — the first visit stores the app in the browser, and it then
  opens without a connection.
- **On your computer:** download the repository and double-click `index.html`. No server, no installation, no build
  step.

The few analyses that need R’s model-fitting machinery (linear mixed models and their designs, repeated measures and
generalized linear mixed models) run in an **R engine inside the browser** (webR). It is downloaded the first time one
of them is used (about 25 MB, then cached); the data still stay on the computer. Served over http together with its
own repository (`motor-r/`, built with `node tools/motor-r/armar.mjs`), it also works without internet from the first
visit; that repository is not part of this source repository.

## The ten blocks

1. **Home** — three ways to start (your data, an example, which analysis to use), what you analyzed last, the
   development status and the list of the 78 analyses.
2. **Data** — CSV, TSV, .xlsx and .ods with its own readers, pasted tables and 27 example trials; a worksheet for
   100,000 rows with undo; variable types explained; calculated variables, transformations (Box–Cox), filters, wide ⇄
   long; and what SigmaPro sees in your trial (blocks, plots, crossed or nested factors).
3. **Explore** — descriptives by up to three factors with their intervals, frequencies, proportions with six
   intervals, and chi-square goodness of fit.
4. **Analysis** — an assistant that asks in the language of the field, the catalog, and a visual model builder.
   Assumptions; t and nonparametric tests; completely randomized, randomized complete blocks, Latin square, split,
   split-split and strip plots, balanced incomplete blocks and lattices; mean comparisons (Tukey, LSD, Duncan, SNK,
   Scheffé, Bonferroni, Šidák, exact Dunnett, Games–Howell), contrasts, orthogonal polynomials and adjusted means;
   ANCOVA; simple, multiple and polynomial regression with full diagnostics, stepwise and best subsets; correlation;
   contingency tables; linear mixed models, repeated measures, variance components (REML), heritability and BLUP;
   generalized linear and generalized linear mixed models; nonlinear regression (growth, dose–response, plateau);
   response surfaces, mixtures and desirability; multi-environment trials (stability, AMMI, GGE); sample size and
   power; sampling; survival (Kaplan–Meier, Cox); time series (ARIMA); MANOVA and discriminant analysis.
5. **Results** — the LABG Report: each analysis with its conclusion, tables, figures, assumptions, the paragraph for
   the thesis or the article (also in APA style) and the R code.
6. **Figures** — publication figures with six themes, a ✎ editor and the Figure Studio (journal sizes, palettes,
   SVG, vector PDF, PNG and TIFF at 600 dpi).
7. **Export** — the full report in .docx, PDF, HTML and Markdown, with a cover, table of contents, reading gauges and
   a methods appendix; a class worksheet with its answer key; tables in a spreadsheet and LaTeX; the `.labg` project
   and autosave.
8. **Validation** — the comparison of every case against R, and the other checks of the test battery.
9. **Fundamentals** — the 78 fact sheets in Spanish and English, the method map and a decision tree.
10. **LABG Suite** — the sister apps that continue the work (PCAPro, ClusteringPro, AgriDesign, CorrelationPro), with
    a “Send data” button where it applies.

## Tests and validation

The validation is part of the repository and can be repeated:

```
Rscript tests/r/generar-todo.R        # the reference values, computed with R 4.4.2 and its packages
node tests/correr.mjs                 # unit tests and the 849 cases against R → tests/reporte-validacion.html
node tests/navegador.mjs              # the same tests in the browser
node tests/codigo-r.mjs               # the R code shown by the app runs in R and gives the same numbers
node tests/idioma.mjs                 # the English interface: complete catalog, same numbers in both languages
node tests/exportar.mjs               # every export, read with independent readers
node tests/sin-conexion.mjs           # privacy (no request leaves the browser) and offline use
node tests/accesibilidad/auditar.mjs  # WCAG AA accessibility, light and dark, 1280 and 360 px
```

On Windows, `tests/pruebas.ps1` runs them all; [`docs/VALIDACION.md`](docs/VALIDACION.md) describes the method (in
Spanish) and chapter 8 of the manual lists the fifteen checks of the battery. Opening `tests/index.html` with a
double click runs the unit tests in the browser.

## Documentation

| Document | Language | What it is |
|---|---|---|
| [`manual/en/SigmaPro User's Manual (English).pdf`](manual/en/) | English | User’s manual: introduction, one chapter per block and appendices |
| [`manual/SigmaPro_Manual_de_usuario_ES.pdf`](manual/) | Spanish | The same manual in Spanish |
| `manual/es/`, `manual/en/` | Spanish, English | The parts of the manual in HTML; `manual/LEEME.md` explains how they are built |
| Block 9 of the app | Spanish and English | The 78 fact sheets |
| [`CHANGELOG.md`](CHANGELOG.md) | Spanish | What changed in each version, milestone by milestone |
| [`docs/VALIDACION.md`](docs/VALIDACION.md) | Spanish | How every method is validated against R |
| [`propuesta/`](propuesta/) | Spanish | The original proposal and the plan of each phase |

## Data and third-party material

The statistical engine, the readers of spreadsheet files, the figures, the formulas (its own MathML converter) and the
exports are the author’s own code. The interface uses the shared modules of the LABG Suite (same author), which draw
icons from the Lucide project (ISC licence); [`LICENSES-TERCEROS.md`](LICENSES-TERCEROS.md) gives the details. The R
engine (webR, MIT licence, and R packages under their own licences) is downloaded only when an analysis needs it. The
example datasets are either published data, cited where they are used, or simulated data built so that each analysis
has a clear case, and announced as such.

## How to cite

Barrera-Guzmán, L. Á. (2026). SigmaPro: estadística para la investigación agronómica y biológica (Version 1.0.0)
[Computer software]. LABG Suite. https://github.com/luisangelbg/SigmaPro

The methods paragraph of every report cites SigmaPro and R with their versions. `CITATION.cff` has the same data for
reference managers.

## Contributing and support

Problems and proposals go to https://github.com/luisangelbg/SigmaPro/issues (the **Report a problem** button of the
app opens one with the block and the browser already filled in).

## Licence

GNU General Public License, version 3 or later ([`LICENSE`](LICENSE)).

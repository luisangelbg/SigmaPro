# SigmaPro - corre todas las pruebas en Windows.
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1            pruebas de node + navegador
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -R         antes regenera las referencias con R
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -SoloNode  sin navegador
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -Completo  todo, con exportaciones, privacidad,
#                                                                         rendimiento y accesibilidad
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -Red       ademas las dos que salen a internet: los
#                                                                         metodos del motor R (descarga webR) y los
#                                                                         enlaces de la suite LABG
# Busca node en el PATH o en la ruta de Adobe; R en el PATH o en C:\Program Files\R.
param([switch]$R, [switch]$SoloNode, [switch]$Completo, [switch]$Red)
$ErrorActionPreference = 'Stop'
$tests = $PSScriptRoot

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node -and $env:SIGMAPRO_NODE) { $node = $env:SIGMAPRO_NODE }
if (-not $node) {
  $c = 'C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe'
  if (Test-Path $c) { $node = $c }
}
if (-not $node) { Write-Host 'No encontre node. Instalalo o indica su ruta en la variable SIGMAPRO_NODE.'; exit 2 }

if ($R) {
  $rs = (Get-Command Rscript -ErrorAction SilentlyContinue).Source
  if (-not $rs) {
    # la version con que se generaron las referencias (tests/r/sesion.txt): una version recien instalada llega sin paquetes
    $ref = Select-String -Path (Join-Path $tests 'r\sesion.txt') -Pattern 'R version (\d+\.\d+\.\d+)' -ErrorAction SilentlyContinue | Select-Object -First 1
    $dirRef = if ($ref) { Join-Path 'C:\Program Files\R' ('R-' + $ref.Matches[0].Groups[1].Value) } else { $null }
    if ($dirRef -and (Test-Path $dirRef)) { $rs = Join-Path $dirRef 'bin\Rscript.exe' }
    else {
      $ult = Get-ChildItem 'C:\Program Files\R' -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
      if ($ult) { $rs = Join-Path $ult.FullName 'bin\Rscript.exe' }
    }
  }
  if (-not $rs -or -not (Test-Path $rs)) { Write-Host 'No encontre Rscript.'; exit 2 }
  Write-Host "Referencias con $rs"
  & $rs (Join-Path $tests 'r\generar-todo.R')
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$codigo = 0
# -Red: los metodos del motor R en un navegador (descarga webR); van antes de correr.mjs, que los integra al reporte
if ($Red -and -not $SoloNode) {
  & $node (Join-Path $tests 'motor-r.mjs')
  if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
}
& $node (Join-Path $tests 'correr.mjs')
if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
# el codigo R que muestra la app debe correr en R y dar los mismos numeros (se omite si no hay R)
& $node (Join-Path $tests 'codigo-r.mjs')
if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
# la interfaz en ingles: catalogo completo y los mismos numeros en los dos idiomas
& $node (Join-Path $tests 'idioma.mjs')
if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
# la huella de cada resultado y de su reporte, y las fichas de Fundamentos de los 78 analisis
foreach ($p in @('regresion.mjs', 'fundamentos.mjs')) {
  & $node (Join-Path $tests $p)
  if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
}
if (-not $SoloNode) {
  # la app por file://, el glosario con «ver en acción», lo que orienta (Inicio, historial, estados vacíos) y la
  # secuencia de apertura, en un navegador sin ventana
  foreach ($p in @('navegador.mjs', 'glosario.mjs', 'orientacion.mjs', 'intro.mjs')) {
    & $node (Join-Path $tests $p)
    if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
  }
}
# -Completo: ademas las exportaciones, la privacidad y el uso sin conexion, el rendimiento con 100 000 filas y la
# accesibilidad (unos 15 minutos); cada una deja su resultado en el bloque 8, en "Otras comprobaciones"
if ($Completo -and -not $SoloNode) {
  foreach ($p in @('exportar.mjs', 'sin-conexion.mjs', 'rendimiento\medir.mjs', 'accesibilidad\auditar.mjs')) {
    & $node (Join-Path $tests $p)
    if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
  }
}
# -Red: los enlaces y logos de la suite LABG (revisa las paginas de las otras apps, algo que la app nunca hace)
if ($Red) {
  & $node (Join-Path $tests 'suite-enlaces.mjs')
  if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
}
exit $codigo

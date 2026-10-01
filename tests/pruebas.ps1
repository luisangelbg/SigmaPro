# SigmaPro - corre todas las pruebas en Windows.
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1            pruebas de node + navegador
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -R         antes regenera las referencias con R
#   powershell -ExecutionPolicy Bypass -File tests\pruebas.ps1 -SoloNode  sin navegador
# Busca node en el PATH o en la ruta de Adobe; R en el PATH o en C:\Program Files\R.
param([switch]$R, [switch]$SoloNode)
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
    $ult = Get-ChildItem 'C:\Program Files\R' -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($ult) { $rs = Join-Path $ult.FullName 'bin\Rscript.exe' }
  }
  if (-not $rs -or -not (Test-Path $rs)) { Write-Host 'No encontre Rscript.'; exit 2 }
  Write-Host "Referencias con $rs"
  & $rs (Join-Path $tests 'r\generar-todo.R')
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

& $node (Join-Path $tests 'correr.mjs')
$codigo = $LASTEXITCODE
if (-not $SoloNode) {
  & $node (Join-Path $tests 'navegador.mjs')
  if ($LASTEXITCODE -ne 0) { $codigo = $LASTEXITCODE }
}
exit $codigo

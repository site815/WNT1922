$ErrorActionPreference = 'Stop'
$portableProject = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$portableVersion = (Get-Content -Raw -LiteralPath (Join-Path $portableProject 'package.json') | ConvertFrom-Json).version
$portableFile = Join-Path $portableProject ('.build/releases/WNT1922-' + $portableVersion + '-portable-win-x64.exe')
if (-not (Test-Path -LiteralPath $portableFile)) { throw 'Build the portable executable first with Build.cmd.' }
$previousRecognitionRoot = $env:WNT_RECOGNITION_ROOT
$previousVoxelRoot = $env:WNT_VOXEL_ROOT
try {
    $env:WNT_RECOGNITION_ROOT = (Resolve-Path -LiteralPath (Join-Path $portableProject 'assets/recognition')).Path
    $env:WNT_VOXEL_ROOT = (Resolve-Path -LiteralPath (Join-Path $portableProject 'assets/voxels')).Path
    Start-Process -FilePath $portableFile -WorkingDirectory $portableProject -WindowStyle Hidden
} finally {
    $env:WNT_RECOGNITION_ROOT = $previousRecognitionRoot
    $env:WNT_VOXEL_ROOT = $previousVoxelRoot
}

$ErrorActionPreference = 'Stop'
$portableProject = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$portableVersion = (Get-Content -Raw -LiteralPath (Join-Path $portableProject 'package.json') | ConvertFrom-Json).version
$portableFile = Join-Path $portableProject ('.build/releases/WNT1922-' + $portableVersion + '-portable-win-x64.exe')
if (-not (Test-Path -LiteralPath $portableFile)) { throw 'Build the portable executable first with Build.cmd.' }
Start-Process -FilePath $portableFile -WorkingDirectory $portableProject -WindowStyle Hidden

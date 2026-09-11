$ErrorActionPreference = 'Stop'
$releaseRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $releaseRoot
$releaseNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$releaseServer = Join-Path $PSScriptRoot 'play.mjs'
$listeners = @(Get-NetTCPConnection -LocalPort 19222 -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $listeners) {
    $existingServer = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $listener.OwningProcess)
    if ($existingServer.CommandLine -notlike ('*' + $releaseServer + '*')) { throw 'Port 19222 belongs to another application; publication stopped.' }
    Stop-Process -Id $listener.OwningProcess
}
$releaseVersion = ((Get-Content -Raw -LiteralPath (Join-Path $releaseRoot 'game\src\version.mjs')) | Select-String -Pattern "GAME_VERSION='([^']+)'").Matches.Groups[1].Value
$releaseStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$releaseSave = Join-Path $releaseRoot 'game\saves\campaign.json'
if (Test-Path -LiteralPath $releaseSave) {
    $releaseBackup = Join-Path $releaseRoot ('game\saves\campaign.pre-' + $releaseVersion + '-' + $releaseStamp + '.json')
    Copy-Item -LiteralPath $releaseSave -Destination $releaseBackup
    if ((Get-FileHash -LiteralPath $releaseSave).Hash -ne (Get-FileHash -LiteralPath $releaseBackup).Hash) { throw 'Save backup verification failed.' }
}
& $releaseNode (Join-Path $PSScriptRoot 'build-game.mjs') 'game/public'
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
Start-Process -FilePath $releaseNode -ArgumentList ('"{0}"' -f $releaseServer) -WorkingDirectory $releaseRoot -WindowStyle Hidden
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 200
    try { $health = Invoke-RestMethod -Uri 'http://127.0.0.1:19222/health' -TimeoutSec 1; if ($health.game -eq 'WNT1922') { break } } catch { }
}
if (-not $health -or $health.build -ne $releaseVersion) { throw 'The new server did not become healthy.' }
& $releaseNode (Join-Path $PSScriptRoot 'verify-local-release.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Published asset verification failed.' }

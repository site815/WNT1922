$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gameUrl = 'http://127.0.0.1:19222'
$gameNodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$bundledGameNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$gameNode = if (Test-Path -LiteralPath $bundledGameNode) { $bundledGameNode } elseif ($gameNodeCommand) { $gameNodeCommand.Source } else { $bundledGameNode }
if (-not (Test-Path -LiteralPath $gameNode)) { throw 'Node.js is required. Install Node.js LTS, then run this launcher again.' }
$gameNodeVersion = & $gameNode --version
if ([int]($gameNodeVersion.TrimStart('v').Split('.')[0]) -lt 20) { throw 'This game requires Node.js 20 or later.' }
if (-not (Test-Path -LiteralPath (Join-Path $gameRoot 'game/public/content.json'))) {
    & $gameNode (Join-Path $PSScriptRoot 'build-game.mjs') 'game/public'
    if ($LASTEXITCODE -ne 0) { throw 'The game could not be built from this source checkout.' }
}
$gameRunning = $false
try { $gameHealth = Invoke-RestMethod -Uri "$gameUrl/health" -TimeoutSec 2; $gameRunning = $gameHealth.game -eq 'WNT1922' } catch { }
if (-not $gameRunning) {
    $gameServer = Join-Path $PSScriptRoot 'play.mjs'
    Start-Process -FilePath $gameNode -ArgumentList ('"{0}"' -f $gameServer) -WorkingDirectory $gameRoot -WindowStyle Hidden
    for ($gameAttempt = 0; $gameAttempt -lt 30; $gameAttempt++) {
        Start-Sleep -Milliseconds 200
        try { $gameHealth = Invoke-RestMethod -Uri "$gameUrl/health" -TimeoutSec 1; if ($gameHealth.game -eq 'WNT1922') { $gameRunning = $true; break } } catch { }
    }
}
if (-not $gameRunning) { throw 'The game could not start. Port 19222 may be in use by another program.' }
$gameEdge = Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'
$gameChrome = Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'
$gameBrowser = if (Test-Path -LiteralPath $gameEdge) { $gameEdge } elseif (Test-Path -LiteralPath $gameChrome) { $gameChrome } else { $null }
if ($gameBrowser) {
    # A maximized app window preserves Alt-Tab and the normal Windows window controls.
    Start-Process -FilePath $gameBrowser -ArgumentList @("--app=$gameUrl", '--start-maximized') -WindowStyle Maximized
} else {
    Start-Process $gameUrl
}
